import * as React from "react";
import { docs, type Doc } from "./data";

/* Everything the writing workspace needs beyond the list data: starting text,
   the coach's questions, and its checklist. Demo content — a real build loads
   the draft body from the API. */

export type Draft = Pick<Doc, "id" | "title" | "type" | "forWhom" | "state" | "target">;

export const TYPE_SLUG: Record<Doc["type"], string> = {
  "Statement of purpose": "statement",
  "Scholarship essay": "essay",
  CV: "cv",
  "Reference request": "reference",
};

const SLUG_TYPE = Object.fromEntries(Object.entries(TYPE_SLUG).map(([type, slug]) => [slug, type])) as Record<string, Doc["type"]>;

export const DOC_TYPES = ["Statement of purpose", "Scholarship essay", "CV", "Reference request"] as const satisfies readonly Doc["type"][];

export const TYPE_TARGET: Record<Doc["type"], number> = {
  "Statement of purpose": 1000,
  "Scholarship essay": 600,
  CV: 800,
  "Reference request": 250,
};

/** New drafts live at /documents/new-<type>-<suffix>, e.g. /documents/new-essay-lq3x9a. */
export function newDraftId(type: Doc["type"]) {
  return `new-${TYPE_SLUG[type]}-${Date.now().toString(36)}`;
}

export function resolveDraft(id: string): Draft | null {
  const existing = docs.find((d) => d.id === id);
  if (existing) return existing;
  const match = /^new-([a-z]+)(?:-[a-z0-9]+)?$/.exec(id);
  const type = match ? SLUG_TYPE[match[1]] : undefined;
  if (!type) return null;
  // forWhom stays empty until the draft is linked to an application.
  return { id, title: `Untitled ${type.toLowerCase()}`, type, forWhom: "", state: "Draft", target: TYPE_TARGET[type] };
}

export const SEED_BODY: Record<string, string> = {
  d1: `
    <h2>Why this programme</h2>
    <p>I want to study mechanical engineering at Toronto because of its fluid dynamics group. In my final year at Kathmandu University I built a small open-circuit wind tunnel to test turbine blades for micro-hydro plants, and the question I could not answer then — how turbulence at low Reynolds numbers eats into efficiency — is the one the group is working on now.</p>
    <h2>What I have already done</h2>
    <p>The tunnel took eight months, most of them spent rebuilding a honeycomb straightener that kept cracking. By the end I could hold flow uniformity to within four percent, and our blade redesign raised measured efficiency from 61 to 68 percent.</p>
    <ul>
      <li>Designed and machined the test section myself</li>
      <li>Wrote the data logging in Python, now used by two junior teams</li>
    </ul>
    <h2>What I will do next</h2>
    <p></p>
  `,
  d2: `
    <p>My family has run a small hydro-powered mill in Dolakha for three generations. When the turbine failed in 2021, I was the one who took it apart.</p>
    <p>That repair is why I want to study energy systems, and why this scholarship matters: it is the difference between studying the problem and going home to fix it.</p>
  `,
  d3: `
    <h2>Education</h2>
    <p><strong>Kathmandu University</strong> — BE Mechanical Engineering, 2019–2023. GPA 3.4 / 4.0.</p>
    <h2>Projects</h2>
    <ul>
      <li><strong>Low-speed wind tunnel</strong> — designed, built and calibrated a 0.5 m test section for turbine blade testing.</li>
      <li><strong>Micro-hydro blade redesign</strong> — raised measured efficiency from 61% to 68%.</li>
    </ul>
    <h2>Experience</h2>
    <p></p>
  `,
  d4: `
    <p>Dear Dr. Shrestha,</p>
    <p>I hope you are well. I am applying to the MEng in Electrical Engineering at Waterloo for Fall 2027, and I would be grateful if you would write a reference for me.</p>
    <p>You supervised my final-year wind tunnel project, so you have seen my work up close — especially the months we spent getting the flow straightener right. The reference is due on 1 February; I can send my statement and CV so you have everything in one place.</p>
    <p>Thank you for considering it.</p>
    <p>Warm regards,<br>Prashant</p>
  `,
};

/** The coach's questions: one at a time, in the order a reader needs the answers. */
export const COACH_QUESTIONS: Record<Doc["type"], string[]> = {
  "Statement of purpose": [
    "Which lab or professor do you want to work with — and what have you read of theirs?",
    "What did your final-year project teach you that a course could not?",
    "What did you do in your gap year? One honest sentence is enough.",
    "Where will you work after graduating, and what will you be doing there?",
    "If a reader remembers one thing about you tomorrow, what should it be?",
  ],
  "Scholarship essay": [
    "What problem will this money let you work on that you could not otherwise?",
    "Which moment from your own life shows you care about it — not just say you do?",
    "Who else benefits if you succeed?",
  ],
  CV: [
    "Does every project line say what you did and what changed because of it?",
    "Which number best shows the size of your work?",
    "Is there anything here a reader would ask you to explain in an interview?",
  ],
  "Reference request": [
    "Does your referee know exactly what, where and by when?",
    "Which piece of your work did they see up close? Remind them of it.",
    "Have you made it easy to say yes — dates, links, and a way to decline?",
  ],
};

/** Static demo checks. The word limit is added live by the editor. */
export const COACH_CHECKS: Record<Doc["type"], { label: string; ok: boolean }[]> = {
  "Statement of purpose": [
    { label: "Names the programme and two faculty by name", ok: true },
    { label: "Links your final-year project to their lab", ok: true },
    { label: "Explains the gap year in one sentence", ok: false },
    { label: "States what you do after graduating, and where", ok: false },
  ],
  "Scholarship essay": [
    { label: "Opens with a specific moment, not a mission statement", ok: true },
    { label: "Says what the money changes", ok: true },
    { label: "Ends on what you will do next", ok: false },
  ],
  CV: [
    { label: "Education, projects and experience in that order", ok: true },
    { label: "Every project line has an outcome", ok: true },
    { label: "Fits on two pages", ok: false },
  ],
  "Reference request": [
    { label: "States the programme and deadline", ok: true },
    { label: "Reminds them of work they saw", ok: true },
    { label: "Offers your statement and CV", ok: true },
  ],
};

/* ------------------------------------------------------------ Saved drafts
   Edits live in this browser's storage (a real build saves to the API). Each
   draft is one key; new drafts are also listed in an index so the Writing
   coach list can show them. The list reads through useSyncExternalStore, so
   the server renders the plain list and the browser fills in edits after. */

export type SavedDraft = {
  title?: string;
  html?: string;
  type?: Doc["type"];
  forWhom?: string;
  state?: Doc["state"];
  updatedAt?: number;
};

const PREFIX = "su-draft:";
const INDEX = "su-draft-index";
const listeners = new Set<() => void>();

export function loadDraft(id: string): SavedDraft | null {
  try {
    const raw = localStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as SavedDraft) : null;
  } catch {
    return null;
  }
}

/** Merges the patch into what is saved. Returns false when storage is unavailable. */
export function saveDraft(id: string, patch: SavedDraft): boolean {
  try {
    const next = { ...loadDraft(id), ...patch, updatedAt: Date.now() };
    localStorage.setItem(PREFIX + id, JSON.stringify(next));
    if (id.startsWith("new-")) {
      const index: string[] = JSON.parse(localStorage.getItem(INDEX) ?? "[]");
      if (!index.includes(id)) localStorage.setItem(INDEX, JSON.stringify([id, ...index]));
    }
    listeners.forEach((l) => l());
    return true;
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Other tabs editing the same drafts.
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX) || e.key === INDEX) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// A string snapshot: stable while nothing changes, which useSyncExternalStore requires.
function snapshot() {
  try {
    const parts: string[] = [localStorage.getItem(INDEX) ?? "[]"];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) parts.push(`${key}=${localStorage.getItem(key)}`);
    }
    return parts.sort().join("\n");
  } catch {
    return "";
  }
}

/** Saved edits for every draft, plus the ids of drafts started in this browser (newest first). */
export function useSavedDrafts(): { saved: Record<string, SavedDraft>; created: string[] } {
  const snap = React.useSyncExternalStore(subscribe, snapshot, () => "");
  return React.useMemo(() => {
    if (!snap) return { saved: {}, created: [] };
    const saved: Record<string, SavedDraft> = {};
    let created: string[] = [];
    try {
      created = JSON.parse(localStorage.getItem(INDEX) ?? "[]");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(PREFIX)) saved[key.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(key) ?? "{}");
      }
    } catch {}
    return { saved, created };
  }, [snap]);
}

export function timeAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return hours < 48 ? "Yesterday" : new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
