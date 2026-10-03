import Anthropic from "@anthropic-ai/sdk";

/*
 * Checks one application document the student uploaded to My files and returns
 * what's wrong with it as JSON:
 *   { "summary": "…", "findings": [{ "severity", "title", "detail", "fix" }] }
 *
 * The file is sent from the browser as base64 and never stored here. PDFs and
 * images go to the model as document and image blocks; text files go inline.
 *
 * Credentials stay server-side: the SDK reads ANTHROPIC_API_KEY. Like the
 * rewriting route, this demo has no accounts — put it behind auth and a
 * server-side rate limit before shipping, since each call reads a whole file.
 */

const MODEL = "claude-opus-5";

/** Base64 of 10MB, plus room for the envelope. */
const MAX_DATA = 14 * 1024 * 1024;
const MAX_TEXT = 40_000;

const SYSTEM = `You check documents students are about to send to universities: transcripts, passports and IDs, statements of purpose, CVs, reference letters, test score reports and financial or sponsorship papers.

Find what would cost this student an offer, a visa appointment or a scholarship — in the document in front of you, not in general.

Look for:
- Facts that contradict each other inside the document: dates, grades, totals, durations, name spellings, addresses.
- Anything missing that this kind of document must carry: signature, stamp, issue or expiry date, letterhead, registration or roll number, page numbers, the referee's position and contact details.
- Documents that are expired, or that expire too soon to be useful for an application cycle.
- Scans that a reader or an automated checker would struggle with: cut-off edges, unreadable text, glare, a photographed screen, part of a page missing.
- Spelling, grammar and punctuation errors, and inconsistent formatting of dates, currencies and units.
- In essays and CVs: claims with no evidence, padding, clichés, and anything that reads as written by someone other than the student.

Rules:
- Only report what you can actually see in this document. Never guess at content you cannot read — if a scan is unreadable, that is itself the finding.
- Quote the exact text you are flagging, so the student can find it.
- Don't invent requirements. Where a convention varies by country or university, say so rather than calling it an error.
- Say nothing about the student as a person, and never judge their background, nationality or finances.

Severity: "error" for something that will be rejected or is factually wrong; "warning" for something likely to be questioned; "note" for a genuine improvement.

Reply with JSON only, no markdown fence and no preface:
{"summary": "one sentence on the document's state", "findings": [{"severity": "error" | "warning" | "note", "title": "short, specific", "detail": "what is wrong and where, quoting the document", "fix": "what to do about it"}]}

An immaculate document is a real answer: return an empty findings array and say so in the summary. Report at most 12 findings, most serious first.`;

type Kind = "pdf" | "image" | "text";

function badRequest(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function describe(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return "Document review isn't set up yet: the server's Anthropic API key is missing or invalid.";
  }
  if (err instanceof Anthropic.RateLimitError) return "The reviewer is busy right now. Try again in a moment.";
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the reviewer. Check the connection and try again.";
  if (err instanceof Anthropic.APIError) return "The reviewer couldn't finish that one. Try again.";
  if (err instanceof Anthropic.AnthropicError) {
    return "Document review isn't set up yet. Add ANTHROPIC_API_KEY to .env.local and restart the dev server.";
  }
  return "Something went wrong. Try again.";
}

/** The model is asked for bare JSON; a stray fence or preface shouldn't lose the review. */
function parseReview(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      summary?: unknown;
      findings?: unknown;
    };
    const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      findings: findings
        .filter((f): f is Record<string, unknown> => !!f && typeof f === "object")
        .map((f) => ({
          severity: f.severity === "error" || f.severity === "warning" ? f.severity : ("note" as const),
          title: String(f.title ?? "").slice(0, 200),
          detail: String(f.detail ?? "").slice(0, 1200),
          fix: typeof f.fix === "string" && f.fix.trim() ? f.fix.slice(0, 600) : undefined,
        }))
        .filter((f) => f.title && f.detail)
        .slice(0, 12),
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("Send JSON.");
  }

  const kind = body.kind as Kind;
  const name = typeof body.name === "string" ? body.name.slice(0, 200) : "document";
  const label = typeof body.label === "string" ? body.label.slice(0, 60) : "document";
  const mediaType = typeof body.mediaType === "string" ? body.mediaType : "";
  const data = typeof body.data === "string" ? body.data : "";

  if (kind !== "pdf" && kind !== "image" && kind !== "text") return badRequest("Unknown file kind.");
  if (!data) return badRequest("That file is empty.");
  if (data.length > MAX_DATA) return badRequest("That file is too large to review — 10MB is the limit.", 413);
  if (kind === "image" && !/^image\/(png|jpeg|webp|gif)$/.test(mediaType)) {
    return badRequest("The reviewer reads PNG, JPEG, WebP and GIF images.");
  }

  const intro = `<file name="${name}" student_labelled_as="${label}" />`;

  let content: Anthropic.Beta.BetaContentBlockParam[];
  if (kind === "pdf") {
    content = [
      { type: "document", source: { type: "base64", media_type: "application/pdf", data } },
      { type: "text", text: `${intro}\n\nReview this document.` },
    ];
  } else if (kind === "image") {
    content = [
      { type: "image", source: { type: "base64", media_type: mediaType as "image/png", data } },
      { type: "text", text: `${intro}\n\nReview this scan or photo.` },
    ];
  } else {
    let text: string;
    try {
      text = Buffer.from(data, "base64").toString("utf8").slice(0, MAX_TEXT);
    } catch {
      return badRequest("That file couldn't be read as text.");
    }
    if (!text.trim()) return badRequest("That file has no text in it.");
    content = [{ type: "text", text: `${intro}\n\n<document>\n${text}\n</document>\n\nReview this document.` }];
  }

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch (err) {
    return badRequest(describe(err), 503);
  }

  try {
    const stream = client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 8000,
        // Reading a whole document and cross-checking it deserves more than a glance.
        output_config: { effort: "medium" },
        thinking: { type: "adaptive" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM,
        messages: [{ role: "user", content }],
      },
      // Navigating away aborts the fetch, which cancels the upstream request too.
      { signal: request.signal },
    );

    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") {
      return badRequest("The reviewer can't look at this one. Try a different file.", 422);
    }
    if (final.stop_reason === "max_tokens") {
      return badRequest("The review was cut off — this document is longer than the reviewer can handle in one pass.", 413);
    }

    const raw = final.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const review = parseReview(raw);
    if (!review) return badRequest("The reviewer's answer didn't come back in one piece. Try again.", 502);

    return Response.json(review, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError) return new Response(null, { status: 499 });
    return badRequest(describe(err), 502);
  }
}
