"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, CalendarDays, FileText, GraduationCap, Home, Mic } from "lucide-react";
import { STATS } from "../parts";
import { at, Ctas } from "./shared";

/* Split and product heroes: soft panel, product window, journey, statement. */

/* --------------------------------------------- Soft panel (TheyDo, Whereby) */

const NEXT = [
  { t: "Finish UofT personal statement", d: "Today", c: "var(--coral)" },
  { t: "Book IELTS", d: "Fri", c: "var(--sky)" },
  { t: "Apply: Pearson scholarship", d: "Feb 1", c: "var(--sun)" },
  { t: "Mock interview, round 3", d: "Feb 4", c: "var(--lilac)" },
];

export function PanelHero() {
  return (
    <section className="hx hx-panel-wrap">
      <div className="hx-panel">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-20">
          <div>
            <h1 className="hx-title hx-rise text-[clamp(44px,5.6vw,84px)]" style={at(0)}>
              Your whole application, in one calm plan.
            </h1>
            <p className="hx-lede hx-rise mt-6 max-w-[40ch]" style={at(1)}>
              Shortlist, scholarships, essays, interviews and every deadline — ordered for you, one week at a time.
            </p>
            <Ctas className="hx-rise mt-9" style={at(2)} />
          </div>

          <div className="hx-card hx-rise p-6" style={at(3)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] text-[var(--ink-3)]">Your plan · Fall 2027</p>
                <p className="mt-0.5 text-[20px] font-semibold tracking-[-0.01em]">This week</p>
              </div>
              <div className="hx-ring" style={{ "--p": 62 } as React.CSSProperties}>
                <span>62%</span>
              </div>
            </div>
            <ul className="mt-5 divide-y divide-[var(--line)]">
              {NEXT.map((n) => (
                <li key={n.t} className="flex items-center gap-3 py-3.5 text-[15px]">
                  <i className="size-2 shrink-0 rounded-full" style={{ background: n.c }} />
                  <span className="flex-1">{n.t}</span>
                  <span className="text-[13px] text-[var(--ink-3)]">{n.d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------- Product window (Stripe, Coda) */

const NAV = [
  { icon: Home, label: "Home" },
  { icon: GraduationCap, label: "Shortlist", on: true },
  { icon: Award, label: "Scholarships" },
  { icon: FileText, label: "Essays" },
  { icon: Mic, label: "Interviews" },
  { icon: CalendarDays, label: "Deadlines" },
];

const FIT = {
  Reach: ["var(--coral-soft)", "#b3341a"],
  Target: ["var(--sky-soft)", "#0b6a99"],
  Safety: ["var(--mint-soft)", "#0f7a52"],
} as const;

const ROWS: { school: string; country: string; fit: keyof typeof FIT; due: string; status: string; done: number }[] = [
  { school: "University of Toronto", country: "Canada", fit: "Reach", due: "Jan 15", status: "Essay draft 3", done: 70 },
  { school: "TU Delft", country: "Netherlands", fit: "Reach", due: "Feb 1", status: "Documents", done: 45 },
  { school: "University of Waterloo", country: "Canada", fit: "Target", due: "Feb 3", status: "Ready to submit", done: 95 },
  { school: "Monash University", country: "Australia", fit: "Target", due: "Oct 31", status: "Shortlisted", done: 20 },
  { school: "University of Alberta", country: "Canada", fit: "Safety", due: "Mar 1", status: "Submitted", done: 100 },
];

export function WindowHero() {
  return (
    <section className="hx hx-window-hero">
      <div className="hx-guides" aria-hidden />
      <div className="l2-wrap relative">
        <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <h1 className="hx-title hx-rise max-w-[14ch] text-[clamp(44px,5.6vw,84px)]" style={at(0)}>
            Every application, at a glance.
          </h1>
          <div className="hx-rise lg:pb-3" style={at(1)}>
            <p className="hx-lede max-w-[38ch]">Reach, target and safety schools, each with its deadline and what’s left to do.</p>
            <Ctas className="mt-7" />
          </div>
        </div>

        <div className="hx-glow" aria-hidden />
        <div className="hx-window hx-rise mt-14" style={at(2)} aria-hidden>
          <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
            <i className="size-2.5 rounded-full bg-[#ff5f57]" />
            <i className="size-2.5 rounded-full bg-[#febc2e]" />
            <i className="size-2.5 rounded-full bg-[#28c840]" />
            <span className="mx-auto rounded-md bg-[var(--soft)] px-3 py-1 text-[12px] text-[var(--ink-3)]">app.schoolup.com/shortlist</span>
          </div>
          <div className="flex">
            <nav className="w-[200px] shrink-0 border-r border-[var(--line)] p-3 max-md:hidden">
              {NAV.map((n) => (
                <p key={n.label} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] ${n.on ? "bg-[var(--soft)] font-semibold" : "text-[var(--ink-2)]"}`}>
                  <n.icon className="size-4" strokeWidth={2} /> {n.label}
                </p>
              ))}
            </nav>
            <div className="min-w-0 flex-1 p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[17px] font-semibold">Shortlist</p>
                <p className="text-[12.5px] text-[var(--ink-3)]">5 schools · 2 reach · 2 target · 1 safety</p>
              </div>
              <div className="mt-4 overflow-hidden">
                <table className="w-full text-left text-[13.5px]">
                  <thead className="text-[12px] text-[var(--ink-3)]">
                    <tr className="border-b border-[var(--line)]">
                      <th className="py-2 font-medium">School</th>
                      <th className="py-2 font-medium max-sm:hidden">Fit</th>
                      <th className="py-2 font-medium">Deadline</th>
                      <th className="py-2 font-medium max-md:hidden">Status</th>
                      <th className="w-[120px] py-2 font-medium max-lg:hidden">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((r) => (
                      <tr key={r.school} className="border-b border-[var(--line)] last:border-0">
                        <td className="py-3 pr-3">
                          <p className="font-medium">{r.school}</p>
                          <p className="text-[12px] text-[var(--ink-3)]">{r.country}</p>
                        </td>
                        <td className="py-3 pr-3 max-sm:hidden">
                          <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: FIT[r.fit][0], color: FIT[r.fit][1] }}>
                            {r.fit}
                          </span>
                        </td>
                        <td className="py-3 pr-3 tabular-nums">{r.due}</td>
                        <td className="py-3 pr-3 text-[var(--ink-2)] max-md:hidden">{r.status}</td>
                        <td className="py-3 max-lg:hidden">
                          <div className="hx-bar">
                            <i style={{ width: `${r.done}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Journey (Maze) */

const ROAD = "M 70 40 C 300 40 360 160 240 230 C 110 305 120 420 300 440 C 470 460 500 560 330 640";
const STOPS = [
  { x: 70, y: 40, src: "university", label: "Shortlist" },
  { x: 268, y: 214, src: "writing", label: "Essays" },
  { x: 150, y: 360, src: "interview", label: "Interview" },
  { x: 420, y: 500, src: "admission", label: "Offer" },
];

export function JourneyHero() {
  return (
    <section className="hx hx-journey-hero">
      <div className="flex flex-col justify-center px-[var(--pad)] pb-12 pt-[120px] lg:py-16 lg:pl-[max(var(--pad),calc((100vw-1240px)/2+32px))] lg:pr-16">
        <h1 className="hx-title hx-rise max-w-[12ch] text-[clamp(44px,5.4vw,80px)]" style={at(0)}>
          From shortlist to offer, one clear road.
        </h1>
        <p className="hx-lede hx-rise mt-6 max-w-[38ch]" style={at(1)}>
          SchoolUp walks you through every stop — schools, essays, interviews, decisions — so you always know what’s next.
        </p>
        <div className="hx-rise mt-9" style={at(2)}>
          <Link href="/signup" className="l2-btn l2-btn--sky">
            Start the journey <ArrowRight strokeWidth={2.4} />
          </Link>
        </div>
      </div>

      <div className="hx-journey hx-rise" style={at(2)} aria-hidden>
        <svg viewBox="0 0 560 680" className="absolute inset-0 m-auto h-[92%] w-auto max-w-full overflow-visible">
          <path d={ROAD} fill="none" stroke="#e3e6ef" strokeWidth="46" strokeLinecap="round" />
          <path d={ROAD} fill="none" stroke="#fff" strokeWidth="38" strokeLinecap="round" />
          <path d={ROAD} fill="none" stroke="#d6dae6" strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" />
          <circle r="13" fill="var(--sky)" className="hx-ball">
            <animateMotion dur="9s" repeatCount="indefinite" path={ROAD} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          </circle>
          {STOPS.map((s, i) => (
            <g key={s.label} transform={`translate(${s.x} ${s.y})`}>
              <foreignObject x="-46" y="-46" width="92" height="92" className="overflow-visible">
                <div className="hx-stop hx-pop" style={at(i + 3)}>
                  <Image src={`/images/stickers/${s.src}.webp`} alt="" width={120} height={120} sizes="70px" />
                </div>
              </foreignObject>
              <text x="56" y="6" fontSize="15" fontWeight="600" fill="var(--ink)">
                {s.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

/* --------------------------------------------------- Statement (Dropbox, Stripe) */

export function StatementHero() {
  return (
    <section className="hx hx-statement-hero">
      <div className="l2-wrap">
        <div className="flex items-start justify-between gap-8">
          <h1 className="hx-title hx-rise max-w-[15ch] text-[clamp(46px,7vw,112px)] leading-[0.98]" style={at(0)}>
            Every school, scholarship and deadline. <span className="text-[var(--ink-3)]">One calm plan.</span>
          </h1>
          <div className="hx-pop shrink-0 max-md:hidden" style={at(2)} aria-hidden>
            <Image src="/images/stickers/calendar.webp" alt="" width={260} height={260} className="hx-float w-[clamp(110px,12vw,170px)]" sizes="170px" />
          </div>
        </div>

        <div className="hx-rise mt-14 grid gap-8 border-t border-[var(--ink)] pt-8 md:grid-cols-4" style={at(1)}>
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="hx-title text-[clamp(34px,3.4vw,52px)]">
                {s.value.toLocaleString("en-US")}
                {s.suffix}
              </p>
              <p className="mt-2 text-[15px] text-[var(--ink-2)]">{s.label}</p>
            </div>
          ))}
          <div className="flex flex-col items-start justify-end gap-3 md:items-end">
            <Link href="/signup" className="l2-btn">
              Start free <ArrowRight strokeWidth={2.4} />
            </Link>
            <span className="text-[13px] text-[var(--ink-3)]">No card needed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
