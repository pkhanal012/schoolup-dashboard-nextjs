"use client";

import * as React from "react";
import gsap from "gsap";

/* The live pieces of a university profile: the tab bar that follows the
   reader, and anything that depends on today's date (which a static page
   cannot know at build time). */

/* ---------------------------------------------------------------- Tabs */

export function SectionTabs({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = React.useState(sections[0]?.id);
  const bar = React.useRef<HTMLDivElement>(null);
  const line = React.useRef<HTMLSpanElement>(null);

  // The section whose top has most recently passed under the bar is current.
  React.useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const onScroll = () => {
      const edge = 170; // a little below where anchored sections land (scroll-margin 150px)
      let current = els[0]?.id;
      for (const el of els) if (el.getBoundingClientRect().top - edge <= 0) current = el.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  // The ink underline glides to the active tab, and the bar scrolls it into view on phones.
  React.useEffect(() => {
    const btn = bar.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!btn || !line.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(line.current, { x: btn.offsetLeft, width: btn.offsetWidth, opacity: 1, duration: reduce ? 0 : 0.45, ease: "power3.out" });
    // Instant, and only when the bar overflows (phones): Chrome cancels a running
    // smooth page scroll if a second smooth scroll starts, even on another element.
    const el = bar.current!;
    if (el.scrollWidth > el.clientWidth) el.scrollLeft = btn.offsetLeft - 24;
  }, [active]);

  return (
    <div className="sticky top-[78px] z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur-xl">
      <div ref={bar} className="u-tabs l2-wrap relative flex gap-6 overflow-x-auto">
        <span ref={line} aria-hidden className="absolute bottom-0 left-0 h-[2px] rounded-full bg-[var(--ink)] opacity-0" />
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-tab={s.id}
            aria-current={active === s.id ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              const target = document.getElementById(s.id);
              if (!target) return;
              const top = target.getBoundingClientRect().top + window.scrollY - 150; // clears nav + this bar
              window.scrollTo({ top, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
              history.replaceState(null, "", `#${s.id}`);
            }}
            className="relative shrink-0 py-3.5 text-[14px] font-medium text-[var(--ink-3)] transition-colors duration-300 hover:text-[var(--ink)] aria-[current=true]:text-[var(--ink)]"
          >
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- Date helpers */

const DAY = 86_400_000;
const at = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();

/* Today, read once per page view: null while server-rendering, so the
   static HTML never bakes in the build date. */
let today: number | null = null;
const noop = () => () => {};
function useToday() {
  return React.useSyncExternalStore(
    noop,
    () => (today ??= Date.now()),
    () => null,
  );
}

/** "120 days left" — rendered after mount, so the page can stay static. */
export function DaysLeft({ deadline, className }: { deadline: string; className?: string }) {
  const now = useToday();
  if (now === null) return <span className={className}>&nbsp;</span>;
  const days = Math.ceil((at(deadline) - now) / DAY);
  const text = days > 1 ? `${days} days left` : days === 1 ? "1 day left" : days === 0 ? "Closes today" : "Closed";
  return <span className={className}>{text}</span>;
}

/** Opens → today → deadline, with today's marker placed along the way. */
export function DateLine({ opens, deadline, opensLabel, deadlineLabel }: { opens?: string; deadline: string; opensLabel: string; deadlineLabel: string }) {
  const now = useToday();
  const start = opens ? at(opens) : null;
  const end = at(deadline);
  const pct = now === null || start === null ? null : Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  const fill = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (pct === null || !fill.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(fill.current, { width: `${pct}%` });
      return;
    }
    gsap.fromTo(fill.current, { width: "0%" }, { width: `${pct}%`, duration: 1.8, ease: "expo.inOut", delay: 0.3 });
  }, [pct]);

  return (
    <div>
      <div className="flex justify-between gap-6">
        <div>
          <p className="text-[13px] text-[var(--ink-3)]">{opens ? "Application opens" : "Apply from"}</p>
          <p className="mt-0.5 text-[17px] font-semibold">{opensLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-[var(--ink-3)]">Regular deadline</p>
          <p className="mt-0.5 text-[17px] font-semibold">{deadlineLabel}</p>
        </div>
      </div>
      <div className="relative mb-8 mt-4 h-1.5 rounded-full bg-[var(--soft)]">
        <span ref={fill} className="absolute inset-y-0 left-0 w-0 rounded-full bg-[var(--ink)]" />
        {pct !== null && (
          <span className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct}%` }}>
            <span className="block size-3.5 rounded-full border-[3px] border-white bg-[var(--ink)] shadow-[0_0_0_1px_var(--line)]" />
            <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[12px] font-medium text-[var(--ink-2)]">
              Today · <DaysLeft deadline={deadline} />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
