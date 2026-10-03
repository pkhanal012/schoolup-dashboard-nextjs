"use client";

import * as React from "react";
import { ArrowRight, Keyboard, Mic, MoreHorizontal, Play } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { useMode, useNewRequest } from "@/components/app/state";
import { InterviewRoom } from "@/components/app/interview-room";
import {
  DEFAULT_PREFS,
  INTERVIEWERS,
  TRACKS,
  buildSession,
  questionCount,
  readinessOf,
  scoreTone,
  trackById,
  weakestOf,
  type Answer,
  type Length,
  type Prefs,
  type Review,
  type SessionQuestion,
  type Toughness,
  type Track,
} from "@/components/app/interview";
import { Badge, Button, Dropdown, DropdownItem, Label, ListRow, Modal, Panel, PanelHead, PanelList, RowText, Segmented, Skeleton } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/*
 * Interview prep: pick the interview you're facing and start talking.
 *
 * Kept deliberately small: a grid of tiles you tap to start, one nudge toward
 * the weakest part, and the last few sessions. Starting always opens a short
 * sheet — how long, how tough, speak or type — with last time's choices
 * pre-selected. Sections hide in each tile's corner menu.
 */

type Scores = Record<string, Record<string, number | null>>;

type Past = { id: string; track: string; focus: string; when: string; answered: string; score: number; delta: number | null };

const SEED_SCORES: Scores = Object.fromEntries(TRACKS.map((t) => [t.id, Object.fromEntries(t.sections.map((s) => [s.id, s.score]))]));
const NO_SCORES: Scores = Object.fromEntries(TRACKS.map((t) => [t.id, Object.fromEntries(t.sections.map((s) => [s.id, null]))]));

const SEED_HISTORY: Past[] = [
  { id: "h1", track: "f1", focus: "Financial support", when: "2 days ago", answered: "3/3", score: 71, delta: 23 },
  { id: "h2", track: "ielts", focus: "Part 3 · discussion", when: "3 days ago", answered: "5/5", score: 72, delta: 1 },
  { id: "h3", track: "f1", focus: "Mixed", when: "4 days ago", answered: "5/5", score: 55, delta: 3 },
];

const LENGTHS: { value: `${Length}`; label: string }[] = [
  { value: "3", label: "3 · ~6 min" },
  { value: "5", label: "5 · ~10 min" },
  { value: "8", label: "8 · ~16 min" },
];

const TOUGHNESS: { value: Toughness; label: string }[] = [
  { value: "gentle", label: "Gentle" },
  { value: "standard", label: "Standard" },
  { value: "tough", label: "Tough" },
];

const PREFS_KEY = "su-interview-prefs";

function readPrefs(): Prefs {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "null") as Partial<Prefs> | null;
    return { ...DEFAULT_PREFS, ...saved };
  } catch {
    return DEFAULT_PREFS;
  }
}

type Session = { key: number; track: Track; questions: SessionQuestion[]; focus: string; prefs: Prefs };

/** An interview the student has picked but not started: the start sheet is open. */
type Pending = { trackId: string; sectionId?: string };

export default function PrepPage() {
  const { mode } = useMode();
  const [prefs, setPrefsState] = React.useState<Prefs>(DEFAULT_PREFS);
  const [scores, setScores] = React.useState<Scores>(SEED_SCORES);
  const [history, setHistory] = React.useState<Past[]>(SEED_HISTORY);
  const [session, setSession] = React.useState<Session | null>(null);
  const [pending, setPending] = React.useState<Pending | null>(null);

  // Saved preferences load after hydration, so server and client render the same first frame.
  React.useEffect(() => {
    setPrefsState(readPrefs()); // eslint-disable-line react-hooks/set-state-in-effect -- one-time hydration from storage
  }, []);

  const setPrefs = (patch: Partial<Prefs>) => {
    setPrefsState((p) => {
      const next = { ...p, ...patch };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // First run: a new account has practised nothing yet.
  const live = mode === "new" ? NO_SCORES : scores;
  const tracks = React.useMemo(
    () => TRACKS.map((t) => ({ ...t, sections: t.sections.map((s) => ({ ...s, score: live[t.id]?.[s.id] ?? null })) })),
    [live],
  );
  const past = mode === "new" ? [] : history;

  // Every start goes through the sheet, so length, interviewer and answer mode are chosen each time.
  const start = React.useCallback((trackId: string, sectionId?: string) => setPending({ trackId, sectionId }), []);

  const launch = (chosen: Prefs) => {
    if (!pending) return;
    const track = tracks.find((t) => t.id === pending.trackId);
    if (!track) return;
    const section = track.sections.find((s) => s.id === pending.sectionId);
    const questions = buildSession(track, chosen.length, section?.id);
    if (!questions.length) return;
    setPrefs(chosen);
    setPending(null);
    setSession({ key: Date.now(), track, questions, focus: section?.name ?? "Mixed", prefs: chosen });
  };

  // The one drill that moves readiness most: the weakest section anywhere.
  const recommended = React.useMemo(() => {
    let best: { track: Track; sectionId: string; name: string; score: number } | null = null;
    for (const t of tracks) {
      const w = weakestOf(t);
      if (w && w.score !== null && (!best || w.score < best.score)) best = { track: t, sectionId: w.id, name: w.name, score: w.score };
    }
    return best;
  }, [tracks]);

  const startRecommended = React.useCallback(() => {
    if (recommended) start(recommended.track.id, recommended.sectionId);
    else start(TRACKS[0].id);
  }, [recommended, start]);

  // The sidebar's "New → drill" lands here.
  useNewRequest(
    "drill",
    React.useCallback((open: boolean) => open && startRecommended(), [startRecommended]),
  );

  // Deep links from elsewhere in the app (/prep?start=f1&section=finance) open the start sheet.
  const deepLinked = React.useRef(false);
  React.useEffect(() => {
    if (deepLinked.current || mode === "loading") return;
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get("start");
    if (!trackId || !trackById(trackId)) return;
    deepLinked.current = true;
    window.history.replaceState(null, "", "/prep");
    start(trackId, params.get("section") ?? undefined); // eslint-disable-line react-hooks/set-state-in-effect -- one-time read of the URL
  }, [mode, start]);

  const onFinished = React.useCallback((review: Review, answers: Answer[]) => {
    const s = session;
    if (!s) return;
    setScores((prev) => {
      const next = { ...prev, [s.track.id]: { ...prev[s.track.id] } };
      answers.forEach((a, i) => {
        if (a.skipped) return;
        const section = s.track.sections.find((sec) => sec.name === a.question.section);
        if (!section) return;
        const old = next[s.track.id][section.id];
        const mark = review.marks[i]?.score ?? 0;
        next[s.track.id][section.id] = old === null ? mark : Math.round((old * 2 + mark) / 3);
      });
      return next;
    });
    setHistory((prev) => {
      const last = prev.find((p) => p.track === s.track.id && p.focus === s.focus);
      return [
        {
          id: `h${Date.now()}`,
          track: s.track.id,
          focus: s.focus,
          when: "Just now",
          answered: `${answers.filter((a) => !a.skipped).length}/${answers.length}`,
          score: review.overall,
          delta: last ? review.overall - last.score : null,
        },
        ...prev,
      ];
    });
  }, [session]);

  const pendingTrack = pending ? tracks.find((t) => t.id === pending.trackId) : undefined;

  return (
    <Shell title="Interview prep" description="Pick an interview and start — every answer is marked against a counsellor's checklist.">
      {mode === "loading" ? (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-10 w-72 rounded-full" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[188px] rounded-[24px]" />
            ))}
          </div>
        </div>
      ) : (
        <div className="su-stagger flex flex-col gap-8">
          <div>
            <h1 className="su-display text-[30px] leading-tight">Which interview?</h1>
            <p className="mt-1 text-[14px] text-ink-2">Tap one, pick how you want it, and go.</p>
          </div>

          {/* The one nudge worth showing: the weakest part, a tap away. */}
          {recommended ? (
            <button
              onClick={startRecommended}
              className="group -mt-2 flex items-center gap-3 self-start rounded-full bg-sunken py-1.5 pl-1.5 pr-4 text-left text-[13px] ring-1 ring-inset ring-[var(--line)] transition-colors hover:bg-hover"
            >
              <span className="grid size-7 place-items-center rounded-full bg-ink text-surface">
                <Play className="size-3.5" />
              </span>
              <span>
                Continue with <span className="font-semibold">{recommended.name}</span>
                <span className="text-ink-3"> · {recommended.track.name}</span>
              </span>
              <ArrowRight className="size-3.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : null}

          <div className="relative grid gap-4 has-[[role=menu]]:z-20 sm:grid-cols-2 xl:grid-cols-3">
            {tracks.map((t) => (
              <TrackTile key={t.id} track={t} onStart={(sectionId) => start(t.id, sectionId)} />
            ))}
          </div>

          {past.length ? (
            <Panel>
              <PanelHead title="Recent sessions" hint="Your last three, marked against the counsellor's checklist." />
              <PanelList>
                {past.slice(0, 3).map((p) => {
                  const t = trackById(p.track)!;
                  const tone = scoreTone(p.score);
                  return (
                    <ListRow key={p.id} className="su-fade">
                      <span aria-hidden className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-[#17161c]", t.dot)}>
                        <t.icon className="size-4" strokeWidth={2} />
                      </span>
                      <RowText title={t.name} sub={`${p.focus} · ${p.answered} answered · ${p.when}`} />
                      {p.delta !== null ? (
                        <span className={cn("hidden shrink-0 font-mono text-[12px] tabular-nums sm:block", p.delta >= 0 ? "text-good" : "text-bad")}>
                          {p.delta >= 0 ? "+" : ""}{p.delta}
                        </span>
                      ) : null}
                      <Badge tone={tone === "good" ? "good" : tone === "fair" ? "warn" : "bad"} className="font-mono">{p.score}</Badge>
                    </ListRow>
                  );
                })}
              </PanelList>
            </Panel>
          ) : null}
        </div>
      )}

      {pendingTrack ? (
        <StartSheet key={`${pending?.trackId}-${pending?.sectionId ?? ""}`} track={pendingTrack} sectionId={pending?.sectionId} initial={prefs} onCancel={() => setPending(null)} onStart={launch} />
      ) : null}

      {session ? (
        <InterviewRoom
          key={session.key}
          track={session.track}
          questions={session.questions}
          focus={session.focus}
          prefs={session.prefs}
          onClose={() => setSession(null)}
          onFinished={onFinished}
          onRestart={(questions) => setSession((s) => (s ? { ...s, key: Date.now(), questions, focus: questions.length < s.questions.length ? "Redo" : s.focus } : s))}
        />
      ) : null}
    </Shell>
  );
}

/* ------------------------------------------------------------ Start sheet */

/**
 * Asked every time an interview starts: how many questions, who is asking, and
 * speak or type. Last time's choices come pre-selected, so going again with
 * the same setup is one tap (or Enter).
 */
function StartSheet({
  track,
  sectionId,
  initial,
  onCancel,
  onStart,
}: {
  track: Track;
  sectionId?: string;
  initial: Prefs;
  onCancel: () => void;
  onStart: (prefs: Prefs) => void;
}) {
  const [draft, setDraft] = React.useState<Prefs>(initial);
  const section = track.sections.find((s) => s.id === sectionId);
  const available = section ? section.questions.length : questionCount(track);
  const lengths = LENGTHS.filter((l) => Number(l.value) <= available);
  // A bank smaller than the shortest option just runs every question it has.
  const count = Math.min(lengths.some((l) => Number(l.value) === draft.length) ? draft.length : Number(lengths.at(-1)?.value ?? available), available);
  const interviewer = INTERVIEWERS[draft.toughness];
  const Icon = track.icon;

  return (
    <Modal
      open
      onClose={onCancel}
      width={420}
      title={track.name}
      description={section ? `Just ${section.name} — the part you picked.` : `A mix from all ${track.sections.length} sections, weakest first.`}
      footer={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="ink" autoFocus onClick={() => onStart({ ...draft, length: count as Length })}>
            <Icon /> Start interview
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Option label="Questions">
          {lengths.length > 1 ? (
            <Segmented
              stretch
              className="w-full"
              label="Questions"
              value={`${count}` as `${Length}`}
              onChange={(v) => setDraft((d) => ({ ...d, length: Number(v) as Length }))}
              options={lengths}
            />
          ) : (
            <p className="text-[13.5px] text-ink">
              {count} question{count === 1 ? "" : "s"} · about {count * 2} min
            </p>
          )}
        </Option>
        <Option label="Interviewer" hint={`${interviewer.name} · ${interviewer.vibe}`}>
          <Segmented stretch className="w-full" label="Interviewer" value={draft.toughness} onChange={(v) => setDraft((d) => ({ ...d, toughness: v }))} options={TOUGHNESS} />
        </Option>
        <Option label="Answer by">
          <Segmented
            stretch
            className="w-full"
            label="Answer by"
            value={draft.mode}
            onChange={(v) => setDraft((d) => ({ ...d, mode: v }))}
            options={[
              { value: "speak", label: "Speak", icon: Mic },
              { value: "type", label: "Type", icon: Keyboard },
            ]}
          />
        </Option>
      </div>
    </Modal>
  );
}

function Option({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5">{label}</Label>
      {children}
      {hint ? <p className="mt-1.5 text-[12px] leading-snug text-ink-3">{hint}</p> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Tile */

/**
 * One interview: a sticker tile you tap to start. Readiness is the only
 * figure on it; sections hide behind the small menu in the corner.
 */
function TrackTile({ track, onStart }: { track: Track; onStart: (sectionId?: string) => void }) {
  const readiness = readinessOf(track);

  return (
    <div className="group relative has-[[role=menu]]:z-20">
      <button
        onClick={() => onStart()}
        aria-label={`Start ${track.name}`}
        className={cn(
          "su-pat-dots relative flex h-[188px] w-full flex-col justify-between overflow-hidden rounded-[24px] p-5 text-left transition-[transform,box-shadow] duration-500 ease-[var(--ease-spring)] hover:-translate-y-1 hover:shadow-e3",
          track.soft,
          track.pattern,
        )}
      >
        <span className="w-fit rounded-full bg-surface px-2.5 py-1 text-[12px] font-semibold shadow-e1">
          {readiness === null ? "New" : `${readiness}% ready`}
        </span>
        <span className="relative z-[1] max-w-[60%]">
          <span className="su-display block text-[21px] leading-[1.1]">{track.name}</span>
          <span className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-2 transition-colors group-hover:text-ink">
            Start interview <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed local sticker, not content */}
        <img
          src={track.sticker}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-3 right-3 w-[112px] rotate-6 drop-shadow-[0_12px_14px_rgba(23,22,28,0.18)] transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-translate-y-1.5 group-hover:rotate-0 group-hover:scale-105"
        />
      </button>

      {/* Drill one part: tucked away, for when you know what you need. */}
      <Dropdown
        className="!absolute right-3 top-3"
        width={240}
        label={`${track.name} sections`}
        trigger={
          <span className="grid size-8 place-items-center rounded-full bg-surface/80 text-ink-2 shadow-e1 backdrop-blur transition-colors hover:bg-surface hover:text-ink">
            <MoreHorizontal className="size-4" />
          </span>
        }
      >
        <Label className="px-2.5 pb-1 pt-1.5">Drill one section</Label>
        {track.sections.map((s) => (
          <DropdownItem key={s.id} onClick={() => onStart(s.id)}>
            <span className="min-w-0 flex-1 truncate">{s.name}</span>
            {s.score !== null ? (
              <span className={cn("font-mono text-[12px] tabular-nums", scoreTone(s.score) === "weak" ? "text-bad" : scoreTone(s.score) === "fair" ? "text-warn" : "text-good")}>
                {s.score}
              </span>
            ) : null}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}
