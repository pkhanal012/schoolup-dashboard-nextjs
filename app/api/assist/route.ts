import Anthropic from "@anthropic-ai/sdk";

/*
 * Rewrites a passage the student selected in the Writing coach editor and
 * streams it back as NDJSON lines:
 *   {"t":"delta","text":"…"}   a piece of the rewrite
 *   {"t":"done"}               finished cleanly
 *   {"t":"error","message":"…"} stopped — the client discards any partial text
 *
 * Credentials stay server-side: the SDK reads ANTHROPIC_API_KEY (or an
 * `ant auth login` profile). This demo has no accounts, so before shipping put
 * it behind auth and a server-side rate limit — the daily allowance shown in
 * the editor is only a per-browser counter.
 */

const MODEL = "claude-opus-5";

type Action = "simplify" | "rephrase" | "shorten" | "grammar" | "custom";

const PRESETS: Record<Exclude<Action, "custom">, string> = {
  simplify: "Simplify this passage: shorter sentences and plainer words, same meaning.",
  rephrase: "Rephrase this passage with different wording, keeping the same meaning and roughly the same length.",
  shorten: "Make this passage noticeably shorter without losing any fact.",
  grammar: "Fix grammar, spelling and punctuation only. Change nothing else.",
};

// Generous for a selection, small enough that one request can't run up a bill.
const LIMITS = { selection: 2000, context: 4000, instruction: 300, docType: 60 };

const SYSTEM = `You are the rewriting assistant inside SchoolUp's Writing coach, where students draft statements of purpose, scholarship essays, CVs and reference requests for university applications.

The student selected a passage from their own draft and asked for a change. Rewrite only that passage, following their instruction.

- Keep their meaning, facts, names, numbers and claims exactly. Never add achievements, experiences, details or opinions they did not write — admissions readers must be reading the student's own story.
- Keep their voice: first person where they wrote it, their register, and their spelling conventions (British or American, as written).
- Fit the surrounding text so the rewrite drops back in cleanly: same tense and point of view, and don't repeat sentences that are already in the context.
- If the instruction can only be met by inventing something, do the closest faithful rewrite instead.

Reply with the rewritten passage only — no preface, no quotation marks, no explanation, no markdown.`;

function badRequest(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function describe(err: unknown): string {
  // Most specific first; the SDK's typed errors, never message matching.
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return "AI suggestions aren't set up yet: the server's Anthropic API key is missing or invalid.";
  }
  if (err instanceof Anthropic.RateLimitError) return "The assistant is busy right now. Try again in a moment.";
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the assistant. Check the connection and try again.";
  if (err instanceof Anthropic.APIError) return "The assistant couldn't finish that one. Try again.";
  // Not an API response at all — typically no credentials configured on the server.
  if (err instanceof Anthropic.AnthropicError) {
    return "AI suggestions aren't set up yet. Add ANTHROPIC_API_KEY to .env.local and restart the dev server.";
  }
  return "Something went wrong. Try again.";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest("Send JSON.");
  }

  const action = body.action as Action;
  const selection = typeof body.selection === "string" ? body.selection.trim() : "";
  const context = typeof body.context === "string" ? body.context.slice(0, LIMITS.context) : "";
  const docType = typeof body.docType === "string" ? body.docType.slice(0, LIMITS.docType) : "essay";
  const custom = typeof body.instruction === "string" ? body.instruction.trim() : "";

  if (!(action in PRESETS) && action !== "custom") return badRequest("Unknown action.");
  if (!selection) return badRequest("Select some text first.");
  if (selection.length > LIMITS.selection) {
    return badRequest(`That selection is too long — pick ${LIMITS.selection.toLocaleString()} characters or fewer.`, 413);
  }
  if (action === "custom" && !custom) return badRequest("Write what you'd like changed.");
  if (custom.length > LIMITS.instruction) return badRequest("Keep the instruction under 300 characters.");

  const instruction = action === "custom" ? custom : PRESETS[action];

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch (err) {
    return badRequest(describe(err), 503);
  }

  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 16000,
      // Short, latency-sensitive rewrites: low effort keeps them quick and cheap.
      output_config: { effort: "low" },
      // If a safety classifier declines, the API retries on a fallback model in the same stream.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            `<document_type>${docType}</document_type>`,
            context ? `<surrounding_text>\n${context}\n</surrounding_text>` : "",
            `<selected_passage>\n${selection}\n</selected_passage>`,
            `<instruction>${instruction}</instruction>`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
    },
    // Closing the panel aborts the fetch, which cancels the upstream request too.
    { signal: request.signal },
  );

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        for await (const event of stream) {
          // After a mid-stream fallback the new model continues from the partial,
          // so the text deltas still join into one passage.
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ t: "delta", text: event.delta.text });
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          send({ t: "error", message: "The assistant can't rewrite that passage. Try a different selection or instruction." });
        } else if (final.stop_reason === "max_tokens") {
          send({ t: "error", message: "The rewrite was cut off. Try a shorter selection." });
        } else {
          send({ t: "done" });
        }
      } catch (err) {
        if (!(err instanceof Anthropic.APIUserAbortError)) send({ t: "error", message: describe(err) });
      } finally {
        // Already closed if the browser disconnected first.
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body$, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
