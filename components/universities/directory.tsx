"use client";

import * as React from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { REGIONS, UNIVERSITIES, type Region, type University } from "./data";
import { ROW_COLS, UniversityRow } from "./university-row";

gsap.registerPlugin(Flip, useGSAP);

/*
 * The directory: the page's centred intro (passed in as children) with the
 * search under it, a row of region tabs, then a single list whose column
 * headers sort it. Filtering and sorting re-order the same rows, and
 * GSAP Flip glides each row to its new place instead of the list blinking.
 */

type Key = "name" | "tuition" | "accept" | "deadline";
type Sort = { key: Key; dir: 1 | -1 } | null;

const VALUE: Record<Key, (u: University) => string | number | null> = {
  name: (u) => u.name,
  tuition: (u) => u.tuition,
  accept: (u) => u.accept,
  deadline: (u) => u.deadline,
};

function compare(key: Key, dir: 1 | -1) {
  return (a: University, b: University) => {
    const x = VALUE[key](a);
    const y = VALUE[key](b);
    if (x === null) return 1; // unpublished figures always sink to the end
    if (y === null) return -1;
    return (typeof x === "string" ? x.localeCompare(y as string) : x - (y as number)) * dir;
  };
}

export function Directory({ children }: { children?: React.ReactNode }) {
  const root = React.useRef<HTMLDivElement>(null);
  const flipState = React.useRef<Flip.FlipState | null>(null);
  const [query, setQuery] = React.useState("");
  const [region, setRegion] = React.useState<Region | "All">("All");
  const [sort, setSort] = React.useState<Sort>(null);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = UNIVERSITIES.filter(
      (u) => (region === "All" || u.region === region) && (!q || `${u.name} ${u.city} ${u.state} ${u.country}`.toLowerCase().includes(q)),
    );
    return sort ? [...list].sort(compare(sort.key, sort.dir)) : list; // unsorted keeps the featured order
  }, [query, region, sort]);

  /* Note where every row is before the change; the effect below animates the difference. */
  const capture = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !root.current) return;
    flipState.current = Flip.getState(root.current.querySelectorAll("[data-row]"));
  };

  useGSAP(
    () => {
      const state = flipState.current;
      if (!state) return;
      flipState.current = null;
      Flip.from(state, {
        targets: root.current!.querySelectorAll("[data-row]"),
        duration: 0.55,
        ease: "power3.inOut",
        stagger: { amount: 0.15 },
        absolute: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: { amount: 0.2 } }),
        onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.25 }),
      });
    },
    { dependencies: [results], scope: root },
  );

  const toggleSort = (key: Key) => {
    capture();
    // First click: the useful direction (cheapest, most selective, soonest, A–Z); second flips it; third clears.
    setSort((s) => (!s || s.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null));
  };

  const counts = React.useMemo(() => Object.fromEntries(REGIONS.map((r) => [r, UNIVERSITIES.filter((u) => u.region === r).length])), []);

  return (
    <div ref={root} className="l2-wrap">
      {/* Centred intro + search */}
      <div className="flex flex-col items-center text-center">
        {children}
        <label data-u-hero className="mt-7 flex h-12 w-full max-w-[420px] items-center gap-2.5 rounded-full bg-[var(--soft)] px-5 text-left transition-shadow focus-within:shadow-[inset_0_0_0_1.5px_var(--ink)]">
          <Search className="size-4 shrink-0 text-[var(--ink-3)]" strokeWidth={2.2} />
          <span className="sr-only">Search universities</span>
          <input
            value={query}
            onChange={(e) => {
              capture();
              setQuery(e.target.value);
            }}
            placeholder="Search university, city or country"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--ink-3)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                capture();
                setQuery("");
              }}
              className="-mr-1.5 grid size-7 place-items-center rounded-full text-[var(--ink-2)] hover:bg-white"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      {/* Region tabs left, count right */}
      <div data-u-hero className="mt-12 flex items-center justify-between gap-4">
        <div className="-mx-[var(--pad)] min-w-0 overflow-x-auto px-[var(--pad)] [scrollbar-width:none] md:mx-0 md:px-0">
          <div className="flex w-max gap-1" role="group" aria-label="Region">
            {(["All", ...REGIONS] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={region === r}
                onClick={() => {
                  capture();
                  setRegion(r);
                }}
                className="h-9 shrink-0 rounded-full px-3.5 text-[14.5px] font-medium text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] aria-pressed:bg-[var(--ink)] aria-pressed:text-white"
              >
                {r}
                {r !== "All" && <span className="ml-1.5 text-[12px] tabular-nums opacity-50">{counts[r]}</span>}
              </button>
            ))}
          </div>
        </div>
        <p className="hidden shrink-0 text-[14px] text-[var(--ink-3)] md:block" aria-live="polite">
          {results.length} {results.length === 1 ? "university" : "universities"}
        </p>
      </div>

      {/* List */}
      <div data-u-hero className="mt-4 overflow-hidden rounded-[20px] shadow-[0_0_0_1px_var(--line)]">
        <div className={`hidden border-b border-[var(--line)] bg-[var(--soft)] px-5 py-2.5 text-[12.5px] font-medium text-[var(--ink-3)] md:grid md:gap-x-6 ${ROW_COLS}`}>
          <HeaderCell label="University" k="name" sort={sort} onSort={toggleSort} />
          <span>Type</span>
          <HeaderCell label="Tuition / yr" k="tuition" sort={sort} onSort={toggleSort} />
          <HeaderCell label="Acceptance" k="accept" sort={sort} onSort={toggleSort} />
          <HeaderCell label="Deadline" k="deadline" sort={sort} onSort={toggleSort} />
          <span />
        </div>

        {results.length ? (
          <div className="divide-y divide-[var(--line)] bg-white">
            {results.map((u) => (
              <UniversityRow key={u.slug} u={u} />
            ))}
          </div>
        ) : (
          <div className="bg-white px-6 py-16 text-center">
            <p className="text-[16px] font-semibold">No universities match</p>
            <p className="mt-1 text-[14px] text-[var(--ink-2)]">Try a city or country, or clear the filters.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setRegion("All");
              }}
              className="l2-btn l2-btn--sm l2-btn--ghost mt-5"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderCell({ label, k, sort, onSort }: { label: string; k: Key; sort: Sort; onSort: (k: Key) => void }) {
  const on = sort?.key === k;
  const Arrow = on && sort.dir === -1 ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      aria-label={`Sort by ${label}`}
      aria-pressed={on}
      className="group inline-flex w-max items-center gap-1 text-left transition-colors hover:text-[var(--ink)] aria-pressed:text-[var(--ink)]"
    >
      {label}
      <Arrow className={`size-3 transition-opacity ${on ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} strokeWidth={2.4} />
    </button>
  );
}
