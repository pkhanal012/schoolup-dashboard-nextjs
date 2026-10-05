"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Bell, CalendarDays, ChevronsUpDown, FileText, GraduationCap, Home, MessageCircle, Mic, Pin, Search, Sparkles, X } from "lucide-react";
import { at } from "./shared";

/*
 * Hero 11 — "Library": an icon stack, a big headline, then folder tabs that
 * switch a SchoolUp dashboard window underneath. After Mobbin's own home page.
 */

const ICONS = [
  { src: "university", bg: "var(--sky)", r: -14, x: -54, y: 6 },
  { src: "writing", bg: "var(--mint)", r: -4, x: -18, y: -4 },
  { src: "calendar", bg: "var(--sun)", r: 9, x: 26, y: 2 },
];

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "schools", label: "Schools", icon: GraduationCap },
  { id: "scholarships", label: "Scholarships", icon: Award },
  { id: "essays", label: "Essays", icon: FileText },
  { id: "interviews", label: "Interviews", icon: Mic },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function LibraryHero() {
  const [tab, setTab] = React.useState<Tab>("home");
  return (
    <section className="hx hx-lib-hero">
      <div className="hx-lib-icons hx-rise" style={at(0)} aria-hidden>
        {ICONS.map((ic, i) => (
          <span
            key={ic.src}
            className="hx-lib-icon"
            style={{ background: ic.bg, zIndex: i, "--r": `${ic.r}deg`, "--x": `${ic.x}px`, "--y": `${ic.y}px` } as React.CSSProperties}
          >
            <Image src={`/images/stickers/${ic.src}.webp`} alt="" width={140} height={140} sizes="80px" />
          </span>
        ))}
      </div>

      <h1 className="hx-title hx-rise mt-8 max-w-[15ch] text-center text-[clamp(44px,5.8vw,86px)] font-bold tracking-[-0.055em]" style={at(1)}>
        The study-abroad plan built from real applications.
      </h1>
      <p className="hx-lede hx-rise mt-5 max-w-[50ch] text-center" style={at(2)}>
        Shortlists, scholarship matches, essay feedback, interview practice and every deadline — ready the moment you sign up.
      </p>
      <div className="hx-rise mt-9 flex flex-wrap items-center justify-center gap-3" style={at(3)}>
        <Link href="/signup" className="l2-btn">
          Join for free
        </Link>
        <a href="#pricing" className="hx-lib-plans">
          See our plans
          <span>
            <ArrowRight className="size-4" strokeWidth={2.4} />
          </span>
        </a>
      </div>

      <div className="hx-lib-stage hx-rise" style={at(4)}>
        <div className="hx-lib-tabs" role="tablist" aria-label="Product preview">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className="hx-lib-tab">
              {t.label}
            </button>
          ))}
        </div>
        <div className="hx-lib-frame">
          <div className="hx-lib-app" role="tabpanel" aria-label={`${TABS.find((t) => t.id === tab)!.label} preview`}>
            <AppChrome tab={tab} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- App chrome */

function AppChrome({ tab }: { tab: Tab }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
        <Image src="/images/logos/logo_black.svg" alt="" width={74} height={16} className="h-[14px] w-auto max-sm:hidden" />
        <span className="flex items-center gap-2 rounded-lg px-2 py-1 text-[13px] font-medium sm:ml-3">
          <span className="grid size-5 place-items-center rounded-md bg-[var(--sun)] text-[11px] font-bold">A</span>
          Aarav’s applications
          <ChevronsUpDown className="size-3.5 text-[var(--ink-3)]" />
        </span>
        <span className="ml-2 flex w-[240px] items-center gap-2 rounded-lg bg-[var(--soft)] px-3 py-1.5 text-[12.5px] text-[var(--ink-3)] max-md:hidden">
          <Search className="size-3.5" /> Search schools, essays…
        </span>
        <span className="ml-auto flex items-center gap-3 text-[var(--ink-2)]">
          <span className="relative max-sm:hidden">
            <MessageCircle className="size-[18px]" />
            <i className="absolute -right-1.5 -top-1.5 grid size-3.5 place-items-center rounded-full bg-[var(--coral)] text-[8px] font-bold not-italic text-white">3</i>
          </span>
          <Sparkles className="size-[18px] max-sm:hidden" />
          <Bell className="size-[18px]" />
          <span className="rounded-lg bg-[var(--soft)] px-2.5 py-1 text-[12.5px] font-semibold text-[var(--ink)]">Pro</span>
          <span className="grid size-7 place-items-center rounded-full bg-[var(--ink)] text-[11px] font-semibold text-white">AK</span>
        </span>
      </div>

      <div className="flex">
        <nav className="w-[210px] shrink-0 border-r border-[var(--line)] px-3 py-4 text-[13.5px] max-md:hidden">
          <p className="hx-lib-nav">
            <Home className="size-4" /> Overview
          </p>
          <p className="mt-4 px-3 text-[11.5px] text-[var(--ink-3)]">Plan</p>
          {TABS.slice(1).map((t) => (
            <p key={t.id} className="hx-lib-nav" data-on={tab === t.id}>
              <t.icon className="size-4" /> {t.label}
            </p>
          ))}
          <p className="hx-lib-nav">
            <CalendarDays className="size-4" /> Deadlines
          </p>
          <p className="mt-4 px-3 text-[11.5px] text-[var(--ink-3)]">Pinned</p>
          <p className="hx-lib-nav">
            <Pin className="size-4" /> UofT application
          </p>
          <p className="hx-lib-nav">
            <Pin className="size-4" /> Pearson scholarship
          </p>
        </nav>
        <div key={tab} className="hx-lib-panel min-w-0 flex-1 p-6">
          {tab === "home" && <HomePanel />}
          {tab === "schools" && <SchoolsPanel />}
          {tab === "scholarships" && <ScholarshipsPanel />}
          {tab === "essays" && <EssaysPanel />}
          {tab === "interviews" && <InterviewsPanel />}
        </div>
      </div>
    </>
  );
}

function PanelHead({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
      <p className="text-[20px] font-semibold tracking-[-0.01em]">{title}</p>
      {action && <span className="rounded-lg bg-[var(--sun-soft)] px-3 py-1.5 text-[12.5px] font-semibold">{action}</span>}
    </div>
  );
}

/* ----------------------------------------------------------------- Panels */

function HomePanel() {
  return (
    <>
      <PanelHead title="Today" action="+ Add school" />
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_240px]">
        <div>
          <div className="flex gap-10">
            <div>
              <p className="flex items-center gap-2 text-[12.5px] font-medium">
                Applications ready <span className="rounded bg-[var(--mint-soft)] px-1.5 text-[11px] font-semibold text-[#0f7a52]">+2</span>
              </p>
              <p className="mt-1 text-[22px] font-semibold">3 of 7</p>
              <p className="text-[11.5px] text-[var(--ink-3)]">updated 10:37 AM</p>
            </div>
            <div className="text-[var(--ink-3)]">
              <p className="text-[12.5px] font-medium">Last week</p>
              <p className="mt-1 text-[22px] font-semibold">1 of 7</p>
            </div>
          </div>
          <svg viewBox="0 0 600 150" className="mt-4 h-[150px] w-full" preserveAspectRatio="none" aria-hidden>
            {Array.from({ length: 24 }, (_, i) => (
              <line key={i} x1={i * 25 + 12} x2={i * 25 + 12} y1="0" y2="140" stroke="#f0eff3" />
            ))}
            <line x1="0" x2="600" y1="140" y2="140" stroke="#e6e5ea" />
            <path d="M0 140 L170 140 L215 112 L300 104 L345 62 L420 58 L470 30 L600 30" fill="none" stroke="var(--sky)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-1 flex justify-between text-[11px] text-[var(--ink-3)]">
            <span>Sep 1</span>
            <span>Today</span>
          </div>
        </div>
        <div className="divide-y divide-[var(--line)] text-[13px] max-lg:hidden">
          <div className="pb-4">
            <p className="flex justify-between text-[var(--ink-2)]">
              Scholarships matched <span className="text-[#0b6a99]">View</span>
            </p>
            <p className="mt-1 text-[22px] font-semibold">$24,000</p>
            <p className="text-[11.5px] text-[var(--ink-3)]">3 awards · 1 closing soon</p>
          </div>
          <div className="pt-4">
            <p className="flex justify-between text-[var(--ink-2)]">
              Next deadline <span className="text-[#0b6a99]">View</span>
            </p>
            <p className="mt-1 text-[17px] font-semibold">UBC Arts · Jan 15</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--soft)] px-4 py-3 text-[12.5px]">
        <GraduationCap className="size-4 text-[#0b6a99]" />
        <span>
          <span className="font-semibold text-[#0b6a99]">New: visa interview practice</span> — rehearse the questions consulates actually ask.
        </span>
        <X className="ml-auto size-4 text-[var(--ink-3)]" />
      </div>
    </>
  );
}

const SCHOOLS = [
  ["University of Toronto", "Canada", "Reach", "Jan 15", "Essay draft 3"],
  ["TU Delft", "Netherlands", "Reach", "Feb 1", "Documents"],
  ["University of Waterloo", "Canada", "Target", "Feb 3", "Ready to submit"],
  ["Monash University", "Australia", "Target", "Oct 31", "Shortlisted"],
  ["University of Alberta", "Canada", "Safety", "Mar 1", "Submitted"],
];
const FIT: Record<string, [string, string]> = {
  Reach: ["var(--coral-soft)", "#b3341a"],
  Target: ["var(--sky-soft)", "#0b6a99"],
  Safety: ["var(--mint-soft)", "#0f7a52"],
};

function SchoolsPanel() {
  return (
    <>
      <PanelHead title="Shortlist" action="+ Add school" />
      <table className="mt-2 w-full text-left text-[13.5px]">
        <thead className="text-[12px] text-[var(--ink-3)]">
          <tr className="border-b border-[var(--line)]">
            <th className="py-2.5 font-medium">School</th>
            <th className="py-2.5 font-medium">Fit</th>
            <th className="py-2.5 font-medium">Deadline</th>
            <th className="py-2.5 font-medium max-md:hidden">Status</th>
          </tr>
        </thead>
        <tbody>
          {SCHOOLS.map(([s, c, f, d, st]) => (
            <tr key={s} className="border-b border-[var(--line)] last:border-0">
              <td className="py-3">
                <p className="font-medium">{s}</p>
                <p className="text-[12px] text-[var(--ink-3)]">{c}</p>
              </td>
              <td>
                <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: FIT[f][0], color: FIT[f][1] }}>
                  {f}
                </span>
              </td>
              <td className="tabular-nums">{d}</td>
              <td className="text-[var(--ink-2)] max-md:hidden">{st}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const AWARDS = [
  ["Lester B. Pearson Scholarship", "University of Toronto", "$12,000", 92, "Feb 1"],
  ["Monash International Merit", "Monash University", "$8,000", 81, "Oct 15"],
  ["Holland Scholarship", "TU Delft", "$4,000", 74, "Feb 1"],
] as const;

function ScholarshipsPanel() {
  return (
    <>
      <PanelHead title="Matches" action="3 new" />
      <ul className="mt-2 divide-y divide-[var(--line)]">
        {AWARDS.map(([n, s, amt, m, d]) => (
          <li key={n} className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-4 sm:grid-cols-[1fr_140px_auto]">
            <div>
              <p className="text-[14px] font-semibold">{n}</p>
              <p className="text-[12px] text-[var(--ink-3)]">
                {s} · closes {d}
              </p>
            </div>
            <div className="max-sm:hidden">
              <div className="flex justify-between text-[11.5px] text-[var(--ink-3)]">
                <span>Match</span>
                <span className="font-semibold text-[var(--ink)]">{m}%</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--soft)]">
                <i className="block h-full rounded-full bg-[var(--mint)]" style={{ width: `${m}%` }} />
              </div>
            </div>
            <p className="text-[17px] font-semibold tabular-nums">{amt}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function EssaysPanel() {
  return (
    <>
      <PanelHead title="Personal statement — UofT" action="Draft 3" />
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_230px]">
        <div className="space-y-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
          <p>
            <mark className="rounded bg-[var(--sun-soft)] px-0.5 text-[var(--ink)]">I have always been passionate about robotics.</mark> In grade eleven I joined our school’s robotics club, and by
            the end of the year I was leading a team of six.
          </p>
          <p>The night before regionals our arm stopped gripping. We rebuilt the claw from a bike brake cable and finished third.</p>
          <p className="text-[var(--ink-3)]">612 / 650 words</p>
        </div>
        <div className="h-fit rounded-xl border border-[var(--line)] p-3.5 text-[13px] max-lg:hidden">
          <p className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-3.5 text-[var(--lilac)]" /> Coach note
          </p>
          <p className="mt-1.5 leading-snug text-[var(--ink-2)]">Open with the bike-brake night instead. Show the passion rather than telling it.</p>
        </div>
      </div>
    </>
  );
}

const SKILLS = [
  ["Clarity", 86],
  ["Confidence", 78],
  ["Content", 90],
  ["Pace", 72],
] as const;

function InterviewsPanel() {
  return (
    <>
      <PanelHead title="Mock interview #4" action="Practise again" />
      <div className="mt-5 grid gap-8 sm:grid-cols-[160px_1fr]">
        <div>
          <p className="text-[12.5px] text-[var(--ink-2)]">Overall</p>
          <p className="mt-1 text-[40px] font-semibold leading-none">
            8.4<span className="text-[16px] text-[var(--ink-3)]"> / 10</span>
          </p>
          <p className="mt-1 text-[12px] font-semibold text-[#0f7a52]">+1.2 since #3</p>
        </div>
        <ul className="space-y-3 text-[13px]">
          {SKILLS.map(([k, v]) => (
            <li key={k} className="grid grid-cols-[90px_1fr_32px] items-center gap-3">
              <span className="text-[var(--ink-2)]">{k}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-[var(--soft)]">
                <i className="block h-full rounded-full bg-[var(--lilac)]" style={{ width: `${v}%` }} />
              </span>
              <span className="text-right tabular-nums">{v}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 rounded-xl bg-[var(--soft)] px-4 py-3 text-[13px] text-[var(--ink-2)]">
        Next question: <span className="font-medium text-[var(--ink)]">“Why this program, and why now?”</span>
      </p>
    </>
  );
}
