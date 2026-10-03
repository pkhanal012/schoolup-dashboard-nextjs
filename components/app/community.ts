"use client";

import * as React from "react";
import type { StickerTone } from "@/components/ui/kit";
import { student } from "./data";

/*
 * The SchoolUp community: one board where applicants ask, answer and boost.
 *
 * Everything here is client-side — seeded threads plus whatever this browser
 * has written, kept in localStorage like the plan and notification stores.
 * Swap `SEED` and the mutators for an API and the components above stay put.
 *
 * Ages are stored as whole minutes rather than timestamps on purpose: the feed
 * renders on the server too, and a clock read on both sides is the classic way
 * to get a hydration mismatch. A post written in this session is simply 0.
 */

export type TopicId = "applications" | "essays" | "visas" | "scholarships" | "tests" | "life";

/* `tone` is the topic's sticker colour: its tile on the board, its tag on a thread. */
export type Topic = { id: TopicId; label: string; blurb: string; emoji: string; tone: StickerTone };

export const TOPICS: Topic[] = [
  { id: "applications", label: "Applications", blurb: "Deadlines, portals, requirements", emoji: "📮", tone: "sky" },
  { id: "essays", label: "Essays & SOP", blurb: "Drafts, structure, feedback", emoji: "✍️", tone: "lilac" },
  { id: "scholarships", label: "Scholarships", blurb: "Funding, aid, assistantships", emoji: "💰", tone: "sun" },
  { id: "visas", label: "Visas & travel", blurb: "Interviews, documents, arrival", emoji: "🛂", tone: "mint" },
  { id: "tests", label: "Tests", blurb: "IELTS, TOEFL, GRE, GMAT", emoji: "📝", tone: "coral" },
  { id: "life", label: "Student life", blurb: "Housing, money, homesickness", emoji: "🏠", tone: "pink" },
];

export const topicOf = (id: TopicId) => TOPICS.find((t) => t.id === id) ?? TOPICS[0];

export type Reply = {
  id: string;
  author: string;
  initials: string;
  /** Where they are in the journey — the only credential that matters here. */
  role: string;
  body: string;
  ageMinutes: number;
  boosts: number;
  /** Marked by the person who asked as the answer that worked. */
  accepted?: boolean;
};

export type Post = {
  id: string;
  author: string;
  initials: string;
  role: string;
  topic: TopicId;
  title: string;
  body: string;
  ageMinutes: number;
  boosts: number;
  pinned?: boolean;
  replies: Reply[];
};

const me = { author: student.name, initials: student.initials, role: "MEng · Fall 2027" };

const SEED: Post[] = [
  {
    id: "p1",
    author: "Aarati Gurung",
    initials: "AG",
    role: "Waterloo MEng · offer in hand",
    topic: "applications",
    title: "Toronto's portal lets you swap a reference after submitting — here's how",
    body:
      "I submitted with the wrong referee email and panicked for two days. You do not need to withdraw the application. In the applicant portal, open Checklist → References → the small 'manage' link next to a pending reference. Changing the email there re-sends the request and the old link dies.\n\nIt updated on their side within about six hours. Support confirmed it does not reset your submission date.",
    ageMinutes: 95,
    boosts: 64,
    pinned: true,
    replies: [
      {
        id: "p1r1",
        author: "Milan Thapa",
        initials: "MT",
        role: "Applying Fall 2027",
        body: "This just saved my Purdue application. The link is genuinely tiny — it is grey text under the referee's name, not a button.",
        ageMinutes: 62,
        boosts: 12,
        accepted: true,
      },
      {
        id: "p1r2",
        author: "Sneha Rai",
        initials: "SR",
        role: "UBC MSc · year 1",
        body: "Worth adding: if the referee already submitted, the manage link disappears. At that point you do have to email the graduate office directly.",
        ageMinutes: 40,
        boosts: 7,
      },
    ],
  },
  {
    id: "p2",
    author: "Bishal Adhikari",
    initials: "BA",
    role: "Applying Fall 2027",
    topic: "essays",
    title: "Is it a red flag to reuse the same SOP opening for three schools?",
    body:
      "My first two paragraphs are about the same bridge-failure project and I honestly cannot write a better hook. Everything after paragraph three is school-specific — supervisors, labs, courses. Does an admissions reader care that the opening is shared, or is that normal?",
    ageMinutes: 210,
    boosts: 38,
    replies: [
      {
        id: "p2r1",
        author: "Dr. Anisha Shrestha",
        initials: "AS",
        role: "Reviews MEng files · mentor",
        body:
          "Normal, and nobody is comparing your drafts across schools. What gets noticed is the opposite mistake — a beautifully tailored opening followed by a generic 'your esteemed institution' close. Spend the effort on the last third, not the first.",
        ageMinutes: 180,
        boosts: 41,
        accepted: true,
      },
      {
        id: "p2r2",
        author: "Kritika Basnet",
        initials: "KB",
        role: "TU Delft MSc · year 2",
        body: "I reused mine for five and got three offers. Swap one sentence in the hook so it names the field the way that department names it — that is enough.",
        ageMinutes: 120,
        boosts: 15,
      },
    ],
  },
  {
    id: "p3",
    author: "Sneha Rai",
    initials: "SR",
    role: "UBC MSc · year 1",
    topic: "scholarships",
    title: "Graduate Merit Award: the 'no separate essay' line is doing a lot of work",
    body:
      "Waterloo's Graduate Merit Award reuses your admission file, so there is no extra essay — but it only reads the file as it stood on the admission deadline. If you plan to strengthen your SOP after applying, the award sees the old one. Submit the good draft first.",
    ageMinutes: 400,
    boosts: 52,
    replies: [
      {
        id: "p3r1",
        author: "Milan Thapa",
        initials: "MT",
        role: "Applying Fall 2027",
        body: "Did not know this. Moving my essay deadline a week earlier.",
        ageMinutes: 300,
        boosts: 9,
      },
    ],
  },
  {
    id: "p4",
    author: "Prakriti Lama",
    initials: "PL",
    role: "Visa approved · Aug 2026",
    topic: "visas",
    title: "F-1 interview: what they actually asked me, in order",
    body:
      "Eleven questions, four minutes, approved. In order: which university, why that one, who is funding you, what does your sponsor do, how much is a year, what is your programme, what will you do after, do you have relatives there, have you travelled before, what was your undergrad GPA, what is your plan if you are refused.\n\nThe funding questions took half the interview. Everything else was thirty seconds.",
    ageMinutes: 1500,
    boosts: 118,
    replies: [
      {
        id: "p4r1",
        author: "Bishal Adhikari",
        initials: "BA",
        role: "Applying Fall 2027",
        body: "The last one is brutal. What did you say?",
        ageMinutes: 1400,
        boosts: 4,
      },
      {
        id: "p4r2",
        author: "Prakriti Lama",
        initials: "PL",
        role: "Visa approved · Aug 2026",
        body: "That I would finish my current job contract and reapply for the next intake. Calm and specific. They want to hear that a refusal is survivable, not that your life ends.",
        ageMinutes: 1380,
        boosts: 47,
        accepted: true,
      },
    ],
  },
  {
    id: "p5",
    author: "Milan Thapa",
    initials: "MT",
    role: "Applying Fall 2027",
    topic: "tests",
    title: "IELTS 6.5 → 7.5 in five weeks, writing only",
    body:
      "Reading and listening were already 8s; writing was dragging the overall down. What moved it: writing exactly two Task 2 essays a week, timed, and rewriting the previous one instead of starting fresh. Band descriptors over vocabulary lists — I was losing marks on task response, not language.",
    ageMinutes: 2600,
    boosts: 73,
    replies: [],
  },
  {
    id: "p6",
    author: "Kritika Basnet",
    initials: "KB",
    role: "TU Delft MSc · year 2",
    topic: "life",
    title: "Nobody warns you about the first November",
    body:
      "The applications are done, the flight happened, and then it gets dark at four and everyone you know is eight hours behind. It passes. Two things that helped: one standing weekly call with home, and joining something that meets in person every week whether or not I felt like it.",
    ageMinutes: 4300,
    boosts: 96,
    replies: [
      {
        id: "p6r1",
        author: "Aarati Gurung",
        initials: "AG",
        role: "Waterloo MEng · offer in hand",
        body: "Thank you for writing this. Saving it for future me.",
        ageMinutes: 4000,
        boosts: 21,
      },
    ],
  },
];

/* ------------------------------------------------------------------ Store */

type Saved = { posts: Post[]; boostedPosts: string[]; boostedReplies: string[]; following: TopicId[] };

const KEY = "su-community";

const EMPTY: Saved = { posts: SEED, boostedPosts: [], boostedReplies: [], following: [] };

const listeners = new Set<() => void>();

let state: Saved = EMPTY;
let loaded = false;

function ensure(): Saved {
  if (loaded) return state;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved && Array.isArray(saved.posts)) state = { ...EMPTY, ...saved };
  } catch {}
  return state;
}

function commit(next: Saved) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useCommunity() {
  return React.useSyncExternalStore(
    subscribe,
    () => ensure(),
    () => EMPTY,
  );
}

const id = () => Math.random().toString(36).slice(2, 9);

export function addPost(input: { title: string; body: string; topic: TopicId }): string {
  const s = ensure();
  const post: Post = { id: id(), ...me, ...input, ageMinutes: 0, boosts: 0, replies: [] };
  commit({ ...s, posts: [post, ...s.posts] });
  return post.id;
}

export function addReply(postId: string, body: string) {
  const s = ensure();
  const reply: Reply = { id: id(), ...me, body, ageMinutes: 0, boosts: 0 };
  commit({
    ...s,
    posts: s.posts.map((p) => (p.id === postId ? { ...p, replies: [...p.replies, reply] } : p)),
  });
}

/** Boosts are a toggle — the count in the seed is everyone else's. */
export function boostPost(postId: string) {
  const s = ensure();
  const on = s.boostedPosts.includes(postId);
  commit({
    ...s,
    boostedPosts: on ? s.boostedPosts.filter((x) => x !== postId) : [...s.boostedPosts, postId],
    posts: s.posts.map((p) => (p.id === postId ? { ...p, boosts: p.boosts + (on ? -1 : 1) } : p)),
  });
}

export function boostReply(postId: string, replyId: string) {
  const s = ensure();
  const on = s.boostedReplies.includes(replyId);
  commit({
    ...s,
    boostedReplies: on ? s.boostedReplies.filter((x) => x !== replyId) : [...s.boostedReplies, replyId],
    posts: s.posts.map((p) =>
      p.id === postId
        ? { ...p, replies: p.replies.map((r) => (r.id === replyId ? { ...r, boosts: r.boosts + (on ? -1 : 1) } : r)) }
        : p,
    ),
  });
}

/**
 * Marks the reply that solved it. Only the person who asked can, and only one
 * reply at a time — the badge means "this is the answer", not "nice one".
 */
export function acceptReply(postId: string, replyId: string) {
  const s = ensure();
  commit({
    ...s,
    posts: s.posts.map((p) =>
      p.id === postId
        ? { ...p, replies: p.replies.map((r) => ({ ...r, accepted: r.id === replyId ? !r.accepted : false })) }
        : p,
    ),
  });
}

export function toggleFollow(topic: TopicId) {
  const s = ensure();
  commit({
    ...s,
    following: s.following.includes(topic) ? s.following.filter((t) => t !== topic) : [...s.following, topic],
  });
}

/* ---------------------------------------------------------------- Reading */

export const isMine = (author: string) => author === student.name;

/** "3h ago" — minutes, hours, days, then weeks. */
export function age(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 10080) return `${Math.round(minutes / 1440)}d ago`;
  return `${Math.round(minutes / 10080)}w ago`;
}

export type Sort = "hot" | "new" | "top";

/** Boosts decayed by age, so a thread from this morning can outrank last week's. */
const heat = (p: Post) => (p.boosts + p.replies.length * 2 + 1) / Math.pow(p.ageMinutes / 60 + 2, 1.35);

export function sortPosts(posts: Post[], sort: Sort): Post[] {
  const rank: Record<Sort, (a: Post, b: Post) => number> = {
    hot: (a, b) => heat(b) - heat(a),
    new: (a, b) => a.ageMinutes - b.ageMinutes,
    top: (a, b) => b.boosts - a.boosts,
  };
  // Pinned threads lead every ordering — they are the board's standing answers.
  return [...posts].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || rank[sort](a, b));
}

/** Topics ranked by activity in the last day and a bit — the trending list. */
export function trending(posts: Post[]) {
  return TOPICS.map((t) => {
    const mine = posts.filter((p) => p.topic === t.id);
    const fresh = mine.filter((p) => p.ageMinutes < 2880).length;
    return { topic: t, posts: mine.length, fresh, replies: mine.reduce((n, p) => n + p.replies.length, 0) };
  })
    .filter((row) => row.posts > 0)
    .sort((a, b) => b.fresh - a.fresh || b.replies - a.replies);
}

/** Everyone who has posted or replied, ranked by the boosts their words earned. */
export function contributors(posts: Post[]) {
  const map = new Map<string, { author: string; initials: string; role: string; boosts: number; answers: number }>();
  const add = (author: string, initials: string, role: string, boosts: number, answers: number) => {
    const row = map.get(author) ?? { author, initials, role, boosts: 0, answers: 0 };
    row.boosts += boosts;
    row.answers += answers;
    map.set(author, row);
  };
  for (const p of posts) {
    add(p.author, p.initials, p.role, p.boosts, 0);
    for (const r of p.replies) add(r.author, r.initials, r.role, r.boosts, 1);
  }
  return [...map.values()].sort((a, b) => b.boosts - a.boosts);
}

/** What this student has put into the board, and what came back. */
export function myActivity(posts: Post[]) {
  const mine = posts.filter((p) => isMine(p.author));
  const replies = posts.flatMap((p) => p.replies).filter((r) => isMine(r.author));
  return {
    posts: mine.length,
    replies: replies.length,
    boosts: mine.reduce((n, p) => n + p.boosts, 0) + replies.reduce((n, r) => n + r.boosts, 0),
    accepted: replies.filter((r) => r.accepted).length,
  };
}
