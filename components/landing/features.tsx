import * as React from "react";
import { Check, Flame, Mic } from "lucide-react";

/*
 * The five tools, each staged as a collage illustration with one small piece
 * of real-looking UI laid over it. The chip is the proof; the art is the mood.
 */

export type Feature = {
  n: string;
  title: string;
  body: string;
  art: string;
  tint: string;
  chip: React.ReactNode;
};

function Bar({ pct, tone = "#0a7cb3" }: { pct: number; tone?: string }) {
  return (
    <span className="block h-1.5 overflow-hidden rounded-full bg-[#efeeea]">
      <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: tone }} />
    </span>
  );
}

const english = (
  <div className="lp-chip max-w-[340px] p-4">
    <div className="flex items-center justify-between text-[12px] text-[#8a8884]">
      <span>IELTS Academic · Band 7 track</span>
      <span className="flex items-center gap-1 text-[#97650a]">
        <Flame className="size-3.5" /> 12 days
      </span>
    </div>
    <div className="mt-1.5 text-[15px] font-semibold tracking-[-0.01em]">Lesson 14 — Speaking in seminars</div>
    <div className="mt-3 flex items-center gap-3">
      <div className="flex-1">
        <Bar pct={47} />
      </div>
      <span className="text-[12px] tabular-nums text-[#54534f]">14 / 30</span>
    </div>
  </div>
);

const colleges = (
  <div className="lp-chip max-w-[360px] divide-y divide-[#efeeea] text-[13px]">
    {[
      ["University of Toronto", "Target", "Dec 1", "bg-[#e2f4fe] text-[#0a7cb3]"],
      ["Purdue University", "Reach", "Jan 15", "bg-[#fbf1de] text-[#97650a]"],
      ["Arizona State University", "Safety", "Mar 1", "bg-[#dfecd6] text-[#2f7d47]"],
    ].map(([name, band, date, tone]) => (
      <div key={name} className="flex items-center gap-3 px-4 py-2.5">
        <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
        <span className={"rounded-full px-2 py-0.5 text-[11px] " + tone}>{band}</span>
        <span className="w-12 text-right tabular-nums text-[#8a8884]">{date}</span>
      </div>
    ))}
  </div>
);

const scholarships = (
  <div className="lp-chip flex max-w-[360px] items-center gap-4 p-4">
    <div className="relative grid size-14 shrink-0 place-items-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#efeeea" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#2f7d47" strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="5.8" />
      </svg>
      <span className="text-[13px] font-semibold tabular-nums">94%</span>
    </div>
    <div className="min-w-0">
      <div className="text-[12px] text-[#8a8884]">Strong match · due Jan 15</div>
      <div className="truncate text-[15px] font-semibold tracking-[-0.01em]">Global Excellence Award</div>
      <div className="text-[13px] text-[#54534f]">CAD 20,000 · renewable</div>
    </div>
  </div>
);

const writing = (
  <div className="lp-chip max-w-[380px] p-4">
    <p className="font-serif text-[15px] leading-[1.6] text-[#201e1a]">
      After my internship, I knew I wanted to build{" "}
      <span className="rounded-[3px] bg-[#fbf1de] underline decoration-[#97650a] decoration-wavy decoration-[1.5px] underline-offset-4">things that matter</span>.
    </p>
    <div className="mt-3 flex gap-2 border-t border-[#efeeea] pt-3 text-[12.5px] leading-[1.45] text-[#54534f]">
      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#97650a]" />
      Be specific — name the project. &ldquo;Things that matter&rdquo; could be anyone&rsquo;s sentence.
    </div>
  </div>
);

const interview = (
  <div className="lp-chip max-w-[340px] p-4">
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[12px] text-[#8a8884]">
        <Mic className="size-3.5" /> Mock interview #11
      </span>
      <span className="flex items-center gap-1 text-[12px] text-[#2f7d47]">
        <Check className="size-3.5" /> +12
      </span>
    </div>
    <div className="mt-1 text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums">84</div>
    <div className="mt-3 grid gap-2 text-[12px] text-[#54534f]">
      {[
        ["Clarity", 84],
        ["Content", 79],
        ["Pace", 88],
      ].map(([k, v]) => (
        <div key={k} className="grid grid-cols-[56px_1fr_24px] items-center gap-2">
          <span>{k}</span>
          <Bar pct={v as number} tone="#42befc" />
          <span className="text-right tabular-nums">{v}</span>
        </div>
      ))}
    </div>
  </div>
);

export const FEATURES: Feature[] = [
  {
    n: "01",
    title: "Learn English",
    body: "Courses built around the English you will actually use abroad — seminars, essays, interviews. Finish each track with a certificate.",
    art: "/images/illustratioin/calender.png",
    tint: "#ece6d6",
    chip: english,
  },
  {
    n: "02",
    title: "Find colleges",
    body: "Search and compare schools, balance reach, target and safety, and keep every requirement for each one in a single place.",
    art: "/images/illustratioin/university.png",
    tint: "#e1e9e6",
    chip: colleges,
  },
  {
    n: "03",
    title: "Scholarships",
    body: "Awards ranked by how well you fit, with amounts and deadlines up front — so you are not searching blind.",
    art: "/images/illustratioin/admission.png",
    tint: "#efe2dc",
    chip: scholarships,
  },
  {
    n: "04",
    title: "Writing coach",
    body: "Line-by-line notes on every draft that show you what “specific” actually means, before anything is submitted.",
    art: "/images/illustratioin/writing.png",
    tint: "#e7e3ee",
    chip: writing,
  },
  {
    n: "05",
    title: "Interview prep",
    body: "Mock interviews scored on clarity and content, so your first real interview is never your first practice.",
    art: "/images/illustratioin/interview.png",
    tint: "#dde9ef",
    chip: interview,
  },
];
