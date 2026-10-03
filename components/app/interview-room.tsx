"use client";

import * as React from "react";
import { ArrowRight, Check, Keyboard, Mic, RotateCcw, Sparkles, Target, Volume2, VolumeX, X } from "lucide-react";
import { Button, Segmented, Spinner, useToast } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import {
  INTERVIEWERS,
  markLocally,
  scoreTone,
  type Answer,
  type AnswerMode,
  type Prefs,
  type Review,
  type SessionQuestion,
  type Track,
} from "./interview";

/*
 * The interview room. It opens the moment a student picks an interview and
 * runs the whole session without a page change:
 *
 *   joining → (asking → answering → noting) × n → marking → review
 *
 * The interviewer reads each question aloud as it types onto the screen, then
 * hands over. Spoken answers are transcribed live where the browser can; typed
 * answers work everywhere, and the student can switch mid-answer without
 * losing a word. Nothing is marked until the end — one call to the coach, with
 * the device as the fallback — so the conversation never stalls.
 *
 * The room is drawn on the dark tokens (a quiet, focused space); the review
 * turns the lights back on.
 */

type Phase = "joining" | "asking" | "answering" | "noting" | "marking" | "review";

/* The Web Speech API isn't in TypeScript's DOM lib. Just the parts used here. */
type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<RecognitionResult> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function recognitionCtor(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const BARS = 32;
/** Spoken answers land best between 45 and 90 seconds. */
const AIM = 90;

/** Live microphone level, as a short rolling history for the waveform. */
function useMicLevel() {
  const [levels, setLevels] = React.useState<number[]>(() => Array(BARS).fill(0));
  const stream = React.useRef<MediaStream | null>(null);
  const ctx = React.useRef<AudioContext | null>(null);
  const raf = React.useRef(0);

  const stop = React.useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void ctx.current?.close().catch(() => {});
    ctx.current = null;
    setLevels(Array(BARS).fill(0));
  }, []);

  const start = React.useCallback(async () => {
    if (stream.current) return true;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = s;
      const audio = new AudioContext();
      ctx.current = audio;
      const analyser = audio.createAnalyser();
      analyser.fftSize = 512;
      audio.createMediaStreamSource(s).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let last = 0;
      const tick = (t: number) => {
        raf.current = requestAnimationFrame(tick);
        if (t - last < 70) return;
        last = t;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        const level = Math.min(1, Math.sqrt(sum / data.length) * 5);
        setLevels((h) => [...h.slice(1), level]);
      };
      raf.current = requestAnimationFrame(tick);
      return true;
    } catch {
      return false;
    }
  }, []);

  React.useEffect(() => stop, [stop]);
  return { levels, start, stop };
}

export function InterviewRoom({
  track,
  questions,
  prefs,
  focus,
  onClose,
  onFinished,
  onRestart,
}: {
  track: Track;
  questions: SessionQuestion[];
  prefs: Prefs;
  /** "Mixed" or the one section being drilled. */
  focus: string;
  onClose: () => void;
  onFinished: (review: Review, answers: Answer[]) => void;
  onRestart: (questions: SessionQuestion[]) => void;
}) {
  const toast = useToast();
  const interviewer = INTERVIEWERS[prefs.toughness];
  const canTranscribe = React.useMemo(() => recognitionCtor() !== null, []);

  const [phase, setPhase] = React.useState<Phase>("joining");
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(0);
  const [answers, setAnswers] = React.useState<Answer[]>([]);
  // Speaking needs live transcription to be marked; without it, typing is the honest default.
  const [mode, setMode] = React.useState<AnswerMode>(prefs.mode === "speak" && canTranscribe ? "speak" : "type");
  const [draft, setDraft] = React.useState("");
  const [heard, setHeard] = React.useState({ final: "", interim: "" });
  const [seconds, setSeconds] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [voice, setVoice] = React.useState(() => {
    try {
      return localStorage.getItem("su-voice") !== "off";
    } catch {
      return true;
    }
  });
  const [confirmEnd, setConfirmEnd] = React.useState(false);
  const [review, setReview] = React.useState<Review | null>(null);

  const mic = useMicLevel();
  const rec = React.useRef<Recognition | null>(null);
  const listening = React.useRef(false);
  const finalText = React.useRef("");
  const marking = React.useRef<AbortController | null>(null);

  const question = questions[index];

  /* ------------------------------------------------------- Transcription */

  const stopListening = React.useCallback(() => {
    listening.current = false;
    rec.current?.stop();
    rec.current = null;
  }, []);

  const startListening = React.useCallback(async () => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const ok = await mic.start();
    if (!ok) {
      setMode("type");
      toast({ message: "No microphone access — switched to typing. You can allow it in the browser's address bar." });
      return;
    }
    listening.current = true;
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finalText.current += `${result[0].transcript.trim()} `;
        else interim += result[0].transcript;
      }
      setHeard({ final: finalText.current, interim });
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        listening.current = false;
        setMode("type");
        toast({ message: "Live transcription was blocked — switched to typing." });
      }
    };
    // Browsers end recognition after a pause; carry on while the student still has the floor.
    r.onend = () => {
      if (listening.current) {
        try {
          r.start();
        } catch {}
      }
    };
    rec.current = r;
    try {
      r.start();
    } catch {}
  }, [mic, toast]);

  /* -------------------------------------------------------------- Flow */

  const ask = React.useCallback((i: number) => {
    stopListening();
    finalText.current = "";
    setIndex(i);
    setRevealed(0);
    setDraft("");
    setHeard({ final: "", interim: "" });
    setSeconds(0);
    setPhase("asking");
  }, [stopListening]);

  const beginAnswering = React.useCallback(() => {
    window.speechSynthesis?.cancel();
    setRevealed(Number.MAX_SAFE_INTEGER);
    setPhase("answering");
    if (mode === "speak") void startListening();
  }, [mode, startListening]);

  const finish = React.useCallback(
    async (all: Answer[]) => {
      window.speechSynthesis?.cancel();
      stopListening();
      mic.stop();
      setConfirmEnd(false);
      setPhase("marking");
      const controller = new AbortController();
      marking.current = controller;
      const started = Date.now();
      let result: Review;
      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            track: track.name,
            toughness: prefs.toughness,
            answers: all.map((a) => ({ question: a.question.text, points: a.question.points.map((p) => p.label), answer: a.text, skipped: a.skipped })),
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
        result = (await res.json()) as Review;
      } catch {
        if (controller.signal.aborted) return;
        result = markLocally(all, prefs.toughness);
      }
      // Long enough to read the marking screen; never a flash.
      const wait = Math.max(0, 900 - (Date.now() - started));
      setTimeout(() => {
        if (controller.signal.aborted) return;
        setReview(result);
        setPhase("review");
        onFinished(result, all);
      }, wait);
    },
    [mic, onFinished, prefs.toughness, stopListening, track.name],
  );

  const submit = React.useCallback(
    (skip = false) => {
      if (phase !== "answering" && phase !== "asking") return;
      window.speechSynthesis?.cancel();
      stopListening();
      const text = skip ? "" : (mode === "speak" ? `${finalText.current} ${heard.interim}` : draft).trim();
      const next = [...answers, { question, text, seconds, skipped: skip || !text }];
      setAnswers(next);
      if (index + 1 < questions.length) setPhase("noting");
      else void finish(next);
    },
    [answers, draft, finish, heard.interim, index, mode, phase, question, questions.length, seconds, stopListening],
  );

  const switchMode = (next: AnswerMode) => {
    if (next === mode) return;
    if (next === "type") {
      // Carry what was said into the box, so switching never loses the answer.
      stopListening();
      setDraft(`${finalText.current}${heard.interim}`.trim());
    } else {
      finalText.current = draft ? `${draft.trim()} ` : "";
      setHeard({ final: finalText.current, interim: "" });
      if (phase === "answering") void startListening();
    }
    setMode(next);
  };

  // Joining: a beat for the interviewer to arrive.
  React.useEffect(() => {
    if (phase !== "joining") return;
    const t = setTimeout(() => ask(0), 1600);
    return () => clearTimeout(t);
  }, [phase, ask]);

  // Asking: the question types itself out while it is read aloud, then the floor is yours.
  React.useEffect(() => {
    if (phase !== "asking" || !question) return;
    const text = question.text;
    const reveal = setInterval(() => setRevealed((n) => (n >= text.length ? n : n + 2)), 22);
    const typed = text.length * 11;
    // Speech that never reports finishing still hands over, a little after it should have.
    const spoken = text.split(/\s+/).length * (380 / interviewer.rate);
    let handover = setTimeout(beginAnswering, voice ? spoken + 1400 : typed + 500);
    const synth = window.speechSynthesis;
    if (voice && synth) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = interviewer.rate;
      u.lang = "en-GB";
      u.onend = () => {
        clearTimeout(handover);
        handover = setTimeout(beginAnswering, 250);
      };
      synth.cancel();
      synth.speak(u);
    }
    return () => {
      clearInterval(reveal);
      clearTimeout(handover);
    };
    // Re-reading only when the question changes (or Replay re-enters asking).
  }, [phase, index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Noting: "Got it", then the next question.
  React.useEffect(() => {
    if (phase !== "noting") return;
    const t = setTimeout(() => ask(index + 1), 850);
    return () => clearTimeout(t);
  }, [phase, index, ask]);

  // Clocks.
  React.useEffect(() => {
    if (phase !== "answering") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  React.useEffect(() => {
    if (phase === "marking" || phase === "review") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Keys: space to take the floor or hand it back; ⌘/Ctrl+Enter to send a typed answer.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement;
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && phase === "answering") {
        e.preventDefault();
        submit();
      } else if (e.key === " " && !typing && !(e.target instanceof HTMLButtonElement)) {
        if (phase === "asking") {
          e.preventDefault();
          beginAnswering();
        } else if (phase === "answering" && mode === "speak") {
          e.preventDefault();
          submit();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, mode, submit, beginAnswering]);

  // The page behind stays put; everything stops when the room closes.
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      window.speechSynthesis?.cancel();
      listening.current = false;
      rec.current?.stop();
      marking.current?.abort();
    };
  }, []);

  const toggleVoice = () => {
    const next = !voice;
    setVoice(next);
    if (!next) window.speechSynthesis?.cancel();
    try {
      localStorage.setItem("su-voice", next ? "on" : "off");
    } catch {}
  };

  const endNow = () => {
    if (answers.length) void finish(answers);
    else onClose();
  };

  if (phase === "review" && review) {
    return (
      <ReviewSheet
        track={track}
        focus={focus}
        interviewer={interviewer.name}
        answers={answers}
        review={review}
        minutes={Math.max(1, Math.round(elapsed / 60))}
        onClose={onClose}
        onRestart={onRestart}
      />
    );
  }

  const Icon = track.icon;
  const status =
    phase === "joining" ? "joining" : phase === "asking" ? "asking" : phase === "answering" ? "listening" : phase === "noting" ? "noting" : "marking";
  const spokenText = `${heard.final}${heard.interim}`.trim();
  const words = (mode === "speak" ? spokenText : draft).trim().split(/\s+/).filter(Boolean).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${track.name} mock interview`}
      className="dark su-fade su-pat-dots fixed inset-0 z-[55] flex flex-col bg-ground text-ink [--pc:rgba(255,255,255,0.045)]"
    >
      {/* ------------------------------------------------------- Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
        <span aria-hidden className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[#17161c]", track.dot)}>
          <Icon className="size-4" strokeWidth={2} />
        </span>
        <p className="min-w-0 truncate text-[14px] font-medium">
          {track.name} <span className="text-ink-3">· {focus}</span>
        </p>

        <div className="mx-auto hidden items-center gap-1.5 md:flex" aria-label={`Question ${Math.min(index + 1, questions.length)} of ${questions.length}`}>
          {questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-out)]",
                i < answers.length ? "w-6 bg-sun" : i === index && phase !== "joining" ? "w-10 bg-ink" : "w-6 bg-[var(--line-strong)]",
              )}
            />
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
          <span className="mr-1 font-mono text-[13px] tabular-nums text-ink-2">{fmt(elapsed)}</span>
          <button
            onClick={toggleVoice}
            aria-pressed={voice}
            aria-label={voice ? "Mute interviewer voice" : "Turn interviewer voice on"}
            title={voice ? "Mute interviewer voice" : "Turn interviewer voice on"}
            className="grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          >
            {voice ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          {confirmEnd ? (
            <div className="su-pop flex items-center gap-1.5">
              <span className="hidden text-[12.5px] text-ink-2 sm:inline">
                {answers.length ? `Mark the ${answers.length} answer${answers.length === 1 ? "" : "s"} so far?` : "Leave the room?"}
              </span>
              <Button size="sm" variant="ink" onClick={endNow}>
                {answers.length ? "Mark & end" : "Leave"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmEnd(false)}>
                Keep going
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setConfirmEnd(true)} disabled={phase === "marking"}>
              End
            </Button>
          )}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[264px_minmax(0,1fr)]">
        {/* ------------------------------------------------- Session rail */}
        <aside className="hidden border-r px-4 py-6 lg:block">
          <p className="px-2 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">This session</p>
          <ol className="mt-3 flex flex-col gap-1">
            {questions.map((q, i) => {
              const done = i < answers.length;
              const current = i === index && !done && phase !== "joining";
              return (
                <li
                  key={q.id}
                  className={cn("flex items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors duration-300", current && "bg-surface shadow-e2 ring-1 ring-[var(--line)]")}
                >
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold transition-colors duration-300",
                      done ? (answers[i].skipped ? "bg-hover text-ink-3" : "bg-mint text-[#17161c]") : current ? "bg-sun text-[#17161c]" : "ring-1 ring-inset ring-[var(--line-strong)] text-ink-3",
                    )}
                  >
                    {done && !answers[i].skipped ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block text-[13px] font-medium", !current && !done && "text-ink-2")}>Question {i + 1}</span>
                    <span className="block truncate text-[11.5px] text-ink-3">{done ? (answers[i].skipped ? "Skipped" : "Answered") : current ? (phase === "answering" ? "Answering now" : "Being asked") : q.section}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </aside>

        {/* ------------------------------------------------------- Stage */}
        <main className="thin-scrollbar min-h-0 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-[680px] flex-col px-5 pb-10 pt-[clamp(28px,8vh,88px)] sm:px-8">
            {phase === "joining" ? (
              <div className="su-pop m-auto flex flex-col items-center text-center">
                <Avatar initials={interviewer.initials} speaking size="lg" />
                <p className="su-display mt-6 text-[28px]">{interviewer.name} is joining…</p>
                <p className="mt-1 text-[14px] text-ink-2">
                  {track.role} · {interviewer.vibe}
                </p>
                <p className="mt-8 rounded-full bg-surface px-4 py-2 text-[12.5px] text-ink-2 ring-1 ring-[var(--line)]">
                  {questions.length} questions · answer out loud like it&rsquo;s the real thing
                </p>
              </div>
            ) : phase === "marking" ? (
              <div className="su-pop m-auto flex flex-col items-center text-center">
                <Avatar initials={interviewer.initials} size="lg" />
                <p className="su-display mt-6 text-[26px]">Marking your answers…</p>
                <p className="mt-1.5 max-w-[38ch] text-[14px] text-ink-2">Each one is checked against the counsellor&rsquo;s checklist for that question.</p>
                <Spinner className="mt-6 size-5" />
              </div>
            ) : (
              <>
                {/* Who's asking, and what's happening */}
                <div className="flex items-center gap-3">
                  <Avatar initials={interviewer.initials} speaking={phase === "asking"} />
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                    {interviewer.name} · Question {index + 1} of {questions.length}
                  </p>
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium",
                      status === "listening" ? "bg-coral-soft text-coral" : "bg-surface text-ink-2 ring-1 ring-[var(--line)]",
                    )}
                  >
                    <i aria-hidden className={cn("size-1.5 rounded-full", status === "listening" ? "animate-pulse bg-coral" : "bg-sun")} />
                    {status === "asking" ? `${interviewer.name} is asking` : status === "listening" ? (mode === "speak" ? "Listening" : "Your turn") : "Noted"}
                  </span>
                </div>

                {/* The question, typed out as it's read */}
                <h2 className="su-display mt-5 text-[clamp(26px,3.6vw,40px)] leading-[1.12]" aria-live="polite">
                  {question.text.slice(0, revealed)}
                  <span className="text-transparent" aria-hidden>
                    {question.text.slice(revealed)}
                  </span>
                </h2>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-surface px-3 py-1 text-[12px] text-ink-2 ring-1 ring-[var(--line)]">{question.section}</span>
                  <button
                    onClick={() => ask(index)}
                    disabled={phase !== "answering" || words > 0}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                  >
                    <RotateCcw className="size-3.5" /> Ask again
                  </button>
                  {phase === "asking" ? (
                    <button
                      onClick={beginAnswering}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink"
                    >
                      Answer now <Kbd>space</Kbd>
                    </button>
                  ) : null}
                </div>

                {/* Your answer */}
                <section
                  className={cn(
                    "mt-10 transition-[opacity,transform] duration-500 ease-[var(--ease-out)]",
                    phase === "answering" ? "opacity-100" : "pointer-events-none translate-y-2 opacity-40",
                  )}
                  aria-hidden={phase !== "answering"}
                >
                  <div className="flex items-center gap-3">
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">You</p>
                    <Segmented
                      label="Answer by"
                      value={mode}
                      onChange={switchMode}
                      className="ml-auto"
                      options={[
                        { value: "speak", label: "Speak", icon: Mic },
                        { value: "type", label: "Type", icon: Keyboard },
                      ]}
                    />
                  </div>

                  {mode === "speak" ? (
                    <div className="mt-4">
                      <p className={cn("min-h-[84px] text-[18px] leading-relaxed", spokenText ? "text-ink" : "text-ink-3")}>
                        {spokenText ? (
                          <>
                            {heard.final}
                            <span className="text-ink-3">{heard.interim}</span>
                          </>
                        ) : seconds > 8 ? (
                          "Not hearing words yet — check your mic, or switch to typing."
                        ) : (
                          "Start whenever you're ready — your words appear here as you speak."
                        )}
                      </p>
                      <div className="mt-5 flex items-center gap-5">
                        <MicOrb level={mic.levels[mic.levels.length - 1]} progress={Math.min(1, seconds / AIM)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-ink-2">
                            <span className="font-mono tabular-nums text-ink">{fmt(seconds)}</span> · aim for 0:45–1:30
                          </p>
                          <div className="mt-2.5 flex h-7 items-center gap-[3px]" aria-hidden>
                            {mic.levels.map((l, i) => (
                              <span
                                key={i}
                                className={cn("w-[3px] rounded-full transition-[height] duration-100", seconds >= 45 ? "bg-mint" : "bg-sun")}
                                style={{ height: `${Math.max(3, l * 28)}px`, opacity: 0.35 + (i / BARS) * 0.65 }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus={phase === "answering"}
                        disabled={phase !== "answering"}
                        rows={6}
                        placeholder="Type your answer the way you'd say it…"
                        className="w-full resize-none rounded-[20px] bg-surface p-4 text-[16px] leading-relaxed text-ink outline-none ring-1 ring-[var(--line)] transition-shadow placeholder:text-ink-4 focus:ring-2 focus:ring-[var(--accent)]"
                      />
                      <p className="mt-2 text-[12px] text-ink-3">
                        {words} words · {fmt(seconds)}
                        {!canTranscribe ? " · this browser can't transcribe speech, so typed answers are what gets marked" : ""}
                      </p>
                    </div>
                  )}

                  <div className="mt-7 flex flex-wrap items-center gap-2.5">
                    <Button onClick={() => submit(true)}>Skip</Button>
                    <Button variant="ink" onClick={() => submit()} className="px-5">
                      {index + 1 === questions.length ? "Finish interview" : "Done answering"} <ArrowRight />
                    </Button>
                    <span className="text-[12px] text-ink-3">
                      or press {mode === "speak" ? <Kbd>space</Kbd> : <><Kbd>⌘</Kbd> <Kbd>enter</Kbd></>}
                    </span>
                  </div>
                </section>

                {phase === "noting" ? (
                  <p className="su-pop mt-8 inline-flex items-center gap-2 self-start rounded-full bg-mint-soft px-4 py-2 text-[13px] font-medium text-good">
                    <Check className="size-4" strokeWidth={2.6} /> Got it — next question
                  </p>
                ) : null}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md border border-[var(--line-strong)] px-1.5 py-px font-mono text-[11px] text-ink-2">{children}</kbd>;
}

function Avatar({ initials, speaking, size = "md" }: { initials: string; speaking?: boolean; size?: "md" | "lg" }) {
  return (
    <span className={cn("relative grid shrink-0 place-items-center", size === "lg" ? "size-20" : "size-9")}>
      {speaking ? <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-sun/40 [animation-duration:1.6s]" /> : null}
      <span
        className={cn(
          "su-display relative grid size-full place-items-center rounded-full bg-sun text-[#17161c]",
          size === "lg" ? "text-[24px]" : "text-[12px]",
        )}
      >
        {initials}
      </span>
    </span>
  );
}

/** The mic: grows with your voice; the ring fills toward the 90-second mark. */
function MicOrb({ level, progress }: { level: number; progress: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid size-[76px] shrink-0 place-items-center">
      <svg viewBox="0 0 76 76" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--line-strong)" strokeWidth="3" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={progress >= 0.5 ? "var(--mint)" : "var(--sun)"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span
        className="grid size-[54px] place-items-center rounded-full bg-surface text-ink ring-1 ring-[var(--line)] transition-transform duration-100"
        style={{ transform: `scale(${1 + level * 0.18})` }}
      >
        <Mic className="size-5" />
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ Review */

const TONE = {
  good: { pill: "bg-good-soft text-good", word: "Strong" },
  fair: { pill: "bg-warn-soft text-warn", word: "Getting there" },
  weak: { pill: "bg-bad-soft text-bad", word: "Needs work" },
} as const;

function ReviewSheet({
  track,
  focus,
  interviewer,
  answers,
  review,
  minutes,
  onClose,
  onRestart,
}: {
  track: Track;
  focus: string;
  interviewer: string;
  answers: Answer[];
  review: Review;
  minutes: number;
  onClose: () => void;
  onRestart: (questions: SessionQuestion[]) => void;
}) {
  const attempted = answers.filter((a) => !a.skipped).length;
  const weak = answers.filter((a, i) => a.skipped || review.marks[i]?.score < 60).map((a) => a.question);
  const tone = TONE[scoreTone(review.overall)];
  const r = 64;
  const c = 2 * Math.PI * r;

  return (
    <div role="dialog" aria-modal="true" aria-label="Interview review" className="fixed inset-0 z-[55] flex flex-col bg-ground text-ink">
      <header className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
        <p className="min-w-0 truncate text-[14px] font-medium">
          {track.name} <span className="text-ink-3">· {focus} · with {interviewer}</span>
        </p>
        <button
          onClick={onClose}
          aria-label="Close review"
          className="ml-auto grid size-9 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[860px] px-4 pb-16 sm:px-6">
          {/* The score, as a sticker */}
          <section className={cn("su-pop su-pat-dots relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-10", track.soft, track.pattern)}>
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="relative grid size-[148px] shrink-0 place-items-center">
                <svg viewBox="0 0 148 148" className="absolute inset-0 size-full -rotate-90" aria-hidden>
                  <circle cx="74" cy="74" r={r} fill="var(--surface)" stroke="var(--line)" strokeWidth="10" />
                  <circle
                    cx="74"
                    cy="74"
                    r={r}
                    fill="none"
                    stroke="var(--ink)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - review.overall / 100)}
                  />
                </svg>
                <span className="su-display relative text-[48px] leading-none tabular-nums">{review.overall}</span>
              </div>
              <div className="min-w-0">
                <span className={cn("inline-flex rounded-full px-3 py-1 text-[12px] font-semibold", tone.pill)}>{tone.word}</span>
                <h2 className="su-display mt-3 text-[clamp(26px,3.4vw,36px)] leading-[1.05]">
                  {attempted ? "Nice work — here's how it went." : "Nothing answered this time."}
                </h2>
                <p className="mt-2.5 max-w-[56ch] text-[14.5px] leading-relaxed text-ink-2">{review.summary}</p>
                <p className="mt-3 text-[12.5px] text-ink-2">
                  {attempted} of {answers.length} answered · {minutes} min
                  {review.local ? " · marked on this device" : ""}
                </p>
              </div>
            </div>
          </section>

          {/* Next steps first: the whole point of reviewing */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            {weak.length ? (
              <Button variant="ink" onClick={() => onRestart(weak)}>
                <Target /> Redo the {weak.length} weakest
              </Button>
            ) : null}
            <Button variant={weak.length ? "secondary" : "ink"} onClick={() => onRestart(answers.map((a) => a.question))}>
              <RotateCcw /> Run it again
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Back to interview prep
            </Button>
          </div>

          {/* Answer by answer */}
          <ol className="mt-8 flex flex-col gap-4">
            {answers.map((a, i) => {
              const mark = review.marks[i];
              const t = TONE[scoreTone(mark?.score ?? 0)];
              return (
                <li key={`${a.question.id}-${i}`} className="su-pop rounded-card border bg-surface p-5 shadow-e1 sm:p-6" style={{ animationDelay: `${120 + i * 70}ms` }}>
                  <div className="flex items-start gap-3">
                    <span aria-hidden className={cn("su-display grid size-8 shrink-0 place-items-center rounded-full text-[13px] text-[#17161c]", track.dot)}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-ink-3">{a.question.section}</p>
                      <h3 className="su-display mt-0.5 text-[19px] leading-snug">{a.question.text}</h3>
                    </div>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-1 font-mono text-[13px] font-medium tabular-nums", a.skipped ? "bg-sunken text-ink-3" : t.pill)}>
                      {a.skipped ? "—" : mark?.score}
                    </span>
                  </div>

                  {a.skipped ? (
                    <p className="mt-4 text-[13.5px] text-ink-3">Skipped.</p>
                  ) : (
                    <blockquote className="mt-4 line-clamp-4 border-l-[3px] border-[var(--line-strong)] pl-3.5 text-[14px] leading-relaxed text-ink-2">
                      {a.text}
                    </blockquote>
                  )}

                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {a.question.points.map((p, j) => {
                      const hit = mark?.covered[j];
                      return (
                        <li key={p.label} className="flex items-start gap-2.5 text-[13px]">
                          <span
                            className={cn(
                              "mt-px grid size-5 shrink-0 place-items-center rounded-full",
                              hit ? "bg-mint text-[#17161c]" : "bg-coral-soft text-bad",
                            )}
                          >
                            {hit ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
                          </span>
                          <span className={hit ? "text-ink" : "text-ink-2"}>{p.label}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {mark?.tip ? (
                    <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sun-soft px-4 py-3 text-[13.5px] leading-relaxed">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-warn" />
                      <span>{mark.tip}</span>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
