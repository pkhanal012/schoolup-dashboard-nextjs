import Anthropic from "@anthropic-ai/sdk";

/*
 * Marks one mock-interview session. The browser sends every answer at the end
 * — the question, the counsellor checklist for it, and what the student said
 * or typed — and gets back JSON:
 *   { "overall": 0-100, "summary": "…", "marks": [{ "score", "covered": [bool], "tip" }] }
 *
 * One call per session, not per answer, so the interview itself never waits on
 * the network. If this route fails, the room marks the answers on the device
 * instead and says so.
 *
 * Credentials stay server-side: the SDK reads ANTHROPIC_API_KEY. Like the other
 * routes, this demo has no accounts — put it behind auth and a rate limit
 * before shipping.
 */

const MODEL = "claude-opus-5-5";

const MAX_ANSWERS = 10;
const MAX_ANSWER_CHARS = 4000;

const SYSTEM = `You mark mock interview answers for students preparing for study-abroad interviews: visa interviews, university credibility calls, admissions and scholarship panels, English speaking tests and calls with prospective supervisors.

For each answer you get the question, the counsellor's checklist of points a good answer names, and the student's answer (typed, or transcribed from speech, so ignore transcription slips and filler words).

For each answer:
- "covered": one boolean per checklist point, in order. True only if the answer actually makes that point — a vague gesture at it ("my family will support me") does not cover a point that asks for specifics ("their job and income").
- "score": 0-100. Mostly checklist coverage, then whether it answers the question asked, is specific and believable, and is a sensible length for a spoken answer. A skipped or empty answer is 0.
- "tip": one sentence, addressed to the student, on the single change that would raise this answer's score most. Quote their words when that helps. Never generic.

Then "overall": the mean score of the answers that were attempted, and "summary": one or two sentences on the pattern across the session — what they do well and the one habit to fix.

The strictness setting tells you how hard to mark: "gentle" gives credit for partial points, "standard" marks like a real interviewer, "tough" marks like a sceptical one.

Never judge the student's background, nationality or finances — only how well the answer makes its case.

Reply with JSON only, no markdown fence and no preface:
{"overall": number, "summary": string, "marks": [{"score": number, "covered": [boolean], "tip": string}]}`;

type Incoming = { question: string; points: string[]; answer: string; skipped: boolean };

function badRequest(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function describe(err: unknown): string {
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return "The interview coach isn't set up yet: the server's Anthropic API key is missing or invalid.";
  }
  if (err instanceof Anthropic.RateLimitError) return "The coach is busy right now.";
  if (err instanceof Anthropic.APIConnectionError) return "Couldn't reach the coach.";
  if (err instanceof Anthropic.APIError) return "The coach couldn't finish marking.";
  if (err instanceof Anthropic.AnthropicError) return "The interview coach isn't set up yet. Add ANTHROPIC_API_KEY to .env.local.";
  return "Something went wrong.";
}

const clamp = (n: unknown) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

/** The model is asked for bare JSON; a stray fence or preface shouldn't lose the marks. */
function parseMarks(raw: string, answers: Incoming[]) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as { overall?: unknown; summary?: unknown; marks?: unknown };
    if (!Array.isArray(parsed.marks) || parsed.marks.length !== answers.length) return null;
    const marks = parsed.marks.map((m, i) => {
      const mark = (m && typeof m === "object" ? m : {}) as Record<string, unknown>;
      const covered = Array.isArray(mark.covered) ? mark.covered : [];
      return {
        score: answers[i].skipped ? 0 : clamp(mark.score),
        covered: answers[i].points.map((_, j) => covered[j] === true),
        tip: String(mark.tip ?? "").slice(0, 400),
      };
    });
    return {
      overall: clamp(parsed.overall),
      summary: String(parsed.summary ?? "").slice(0, 600),
      marks,
      local: false,
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

  const track = typeof body.track === "string" ? body.track.slice(0, 80) : "interview";
  const toughness = body.toughness === "gentle" || body.toughness === "tough" ? body.toughness : "standard";
  const answers: Incoming[] = (Array.isArray(body.answers) ? body.answers : [])
    .slice(0, MAX_ANSWERS)
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => ({
      question: String(a.question ?? "").slice(0, 400),
      points: (Array.isArray(a.points) ? a.points : []).slice(0, 8).map((p) => String(p).slice(0, 200)),
      answer: String(a.answer ?? "").slice(0, MAX_ANSWER_CHARS),
      skipped: a.skipped === true,
    }))
    .filter((a) => a.question && a.points.length);

  if (!answers.length) return badRequest("No answers to mark.");

  const transcript = answers
    .map(
      (a, i) =>
        `<answer index="${i + 1}">\n<question>${a.question}</question>\n<checklist>\n${a.points
          .map((p, j) => `${j + 1}. ${p}`)
          .join("\n")}\n</checklist>\n<student_answer>${a.skipped || !a.answer.trim() ? "(skipped)" : a.answer}</student_answer>\n</answer>`,
    )
    .join("\n\n");

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
        output_config: { effort: "medium" },
        thinking: { type: "adaptive" },
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: `<session interview="${track}" strictness="${toughness}" />\n\n${transcript}\n\nMark these ${answers.length} answers.`,
          },
        ],
      },
      { signal: request.signal },
    );

    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") return badRequest("The coach couldn't mark this session.", 422);
    if (final.stop_reason === "max_tokens") return badRequest("The marking was cut off.", 413);

    const raw = final.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const review = parseMarks(raw, answers);
    if (!review) return badRequest("The coach's reply couldn't be read.", 502);

    return Response.json(review, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    return badRequest(describe(err), err instanceof Anthropic.RateLimitError ? 429 : 502);
  }
}
