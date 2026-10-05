"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { SCHOOLS, STEPS } from "../parts";
import { at, Ctas, useTicker } from "./shared";

/* Centred heroes: spotlight, inline stickers, quiet search, student voice, three steps. */

/* ------------------------------------------------------- Spotlight (Vizcom) */

export function SpotlightHero() {
  return (
    <section className="hx hx-center !pt-[128px]">
      <span className="l2-eyebrow hx-rise" style={at(0)}>
        <i /> Free to start · no card needed
      </span>
      <h1 className="hx-title hx-rise mt-6 max-w-[13ch] text-[clamp(44px,5.6vw,84px)]" style={at(1)}>
        Study abroad, minus the panic.
      </h1>
      <p className="hx-lede hx-rise mt-6 max-w-[42ch]" style={at(2)}>
        Schools, scholarships, essays, interviews and every deadline — finally in one calm place.
      </p>
      <Ctas className="hx-rise mt-9 justify-center" style={at(3)} />

      <div className="hx-spot hx-rise" style={at(4)} aria-hidden>
        <div className="hx-spot-object hx-float">
          <Image src="/images/stickers/university.webp" alt="" width={480} height={480} sizes="(min-width: 768px) 300px, 200px" />
        </div>
        <span className="hx-spot-shadow" />
      </div>
    </section>
  );
}

/* ------------------------------------------------- Inline stickers (Webflow TV) */

function Inline({ src, bg, i }: { src: string; bg: string; i: number }) {
  return (
    <span className="hx-inline hx-pop" style={{ background: bg, ...at(i) }} aria-hidden>
      <Image src={`/images/stickers/${src}.webp`} alt="" width={160} height={160} sizes="120px" />
    </span>
  );
}

export function InlineHero() {
  return (
    <section className="hx hx-center">
      <h1 className="hx-title hx-rise text-[clamp(44px,7vw,112px)] leading-[1.02]" style={at(0)}>
        <span className="sr-only">Study abroad, minus the panic.</span>
        <span aria-hidden>
          Study <Inline src="university" bg="var(--sky-soft)" i={3} /> abroad,
          <br />
          minus the <Inline src="calendar" bg="var(--sun-soft)" i={5} /> panic.
        </span>
      </h1>
      <p className="hx-lede hx-rise mt-8 max-w-[44ch]" style={at(1)}>
        Your shortlist, scholarships, essays, interview practice and every deadline — on one page.
      </p>
      <Ctas className="hx-rise mt-9 justify-center" style={at(2)} />
      <p className="hx-rise mt-16 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-[var(--ink-3)]" style={at(4)}>
        {["Schools", "Scholarships", "Essays", "Interviews", "Deadlines"].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </p>
    </section>
  );
}

/* ---------------------------------------------- Quiet search (Extra, Campsite) */

const EXAMPLES = [
  "Computer science in Canada",
  "Nursing scholarships in Australia",
  "MBA programs with a January intake",
  "Universities that accept Duolingo English",
];

export function SearchHero() {
  const [ex, setEx] = React.useState(0);
  const [len, setLen] = React.useState(0);
  const [value, setValue] = React.useState("");
  // Type each example out, hold it, then move to the next.
  useTicker(() => {
    const full = EXAMPLES[ex];
    if (len < full.length + 28) setLen(len + 1);
    else {
      setEx((ex + 1) % EXAMPLES.length);
      setLen(0);
    }
  }, 55);
  const typed = EXAMPLES[ex].slice(0, len);

  return (
    <section className="hx hx-center">
      <h1 className="hx-title hx-rise max-w-[14ch] text-[clamp(44px,6vw,88px)]" style={at(0)}>
        Where do you want to study?
      </h1>
      <p className="hx-lede hx-rise mt-6 max-w-[40ch]" style={at(1)}>
        Search 2,800+ colleges. We’ll line up the scholarships, essays and deadlines that come with them.
      </p>
      <form action="/universities" role="search" className="hx-search hx-rise mt-10" style={at(2)}>
        <Search className="size-5 shrink-0 text-[var(--ink-3)]" strokeWidth={2.2} />
        <div className="relative flex-1">
          <input name="q" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Search schools, courses or countries" />
          {!value && (
            <span className="hx-search-ph" aria-hidden>
              {typed}
              <i />
            </span>
          )}
        </div>
        <button type="submit" aria-label="Search" className="hx-search-go">
          <ArrowRight className="size-5" strokeWidth={2.4} />
        </button>
      </form>
      <p className="hx-rise mt-5 text-[14px] text-[var(--ink-3)]" style={at(3)}>
        Popular:{" "}
        {["Toronto", "TU Delft", "Monash", "Edinburgh"].map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && " · "}
            <Link href="/universities" className="text-[var(--ink-2)] underline-offset-4 hover:underline">
              {s}
            </Link>
          </React.Fragment>
        ))}
      </p>
    </section>
  );
}

/* ------------------------------------------------------ Student voice (15Five) */

export function VoiceHero() {
  return (
    <section className="hx hx-center">
      <div className="hx-voice-art hx-pop" style={at(0)} aria-hidden>
        <Image src="/images/stickers/writing.webp" alt="" width={240} height={240} sizes="140px" />
      </div>
      <h1 className="hx-rise mt-8 text-[13px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-3)]" style={at(1)}>
        SchoolUp · Study abroad, minus the panic
      </h1>
      <blockquote className="hx-title hx-rise mt-6 max-w-[22ch] text-[clamp(32px,3.8vw,56px)] font-medium leading-[1.1]" style={at(2)}>
        “I went from panicking about my personal statement to having three drafts I was proud of.”
      </blockquote>
      <p className="hx-rise mt-6 text-[15px] text-[var(--ink-2)]" style={at(3)}>
        <span className="font-semibold text-[var(--ink)]">Linh</span> · Vietnam → Purdue
      </p>
      <Ctas className="hx-rise mt-10 justify-center" style={at(4)} />
      <div className="hx-rise mt-16 w-full max-w-[980px] border-t border-[var(--line)] pt-6" style={at(5)}>
        <p className="text-[13px] text-[var(--ink-3)]">Where SchoolUp students are applying</p>
        <p className="mt-3 flex flex-wrap justify-center gap-x-7 gap-y-2 text-[17px] font-semibold tracking-[-0.01em] text-[var(--ink-3)]">
          {SCHOOLS.slice(0, 8).map((s) => (
            <span key={s}>{s}</span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- Three steps (Craft) */

const STEP_TONES = ["var(--sun-soft)", "var(--lilac-soft)", "var(--mint-soft)"];

export function StepsHero() {
  return (
    <section className="hx hx-center">
      <h1 className="hx-title hx-rise max-w-[15ch] text-[clamp(44px,5.8vw,84px)]" style={at(0)}>
        Three steps to your offer letter.
      </h1>
      <p className="hx-lede hx-rise mt-6 max-w-[40ch]" style={at(1)}>
        Tell us the goal. Get the plan. Apply knowing nothing was missed.
      </p>
      <div className="hx-rise mt-9" style={at(2)}>
        <Link href="/signup" className="l2-btn">
          Start with step one <ArrowRight strokeWidth={2.4} />
        </Link>
      </div>
      <ol className="mt-16 grid w-full max-w-[1120px] gap-5 text-left md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.n} className="hx-step hx-rise" style={at(3 + i)}>
            <div className="hx-step-art" style={{ background: STEP_TONES[i] }}>
              <Image src={s.art} alt="" width={240} height={240} sizes="140px" />
            </div>
            <div className="p-6">
              <p className="text-[13px] font-semibold text-[var(--ink-3)]">{s.n}</p>
              <p className="mt-1 text-[19px] font-semibold tracking-[-0.01em]">{s.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
