import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SchoolLogo } from "@/components/app/school-logo";
import { REGION_TONE, money, percent, shortDate, type University } from "./data";

/*
 * One school as a list row: mark, name and place, then the numbers students
 * compare — type, tuition, acceptance, deadline — in fixed columns so they
 * line up down the page. On phones — or `compact`, for narrow columns — the
 * numbers drop to one line under the name.
 */

export const ROW_COLS = "md:grid-cols-[minmax(0,2.6fr)_0.8fr_0.9fr_1.1fr_1fr_28px]";

export function UniversityRow({ u, compact = false }: { u: University; compact?: boolean }) {
  // Desktop-only pieces; a compact row keeps the phone layout everywhere.
  const wide = compact ? "hidden" : "hidden md:block";
  const narrow = compact ? "" : "md:hidden";
  return (
    <Link
      href={`/universities/${u.slug}`}
      data-row
      data-flip-id={u.slug}
      className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 px-4 py-3.5 transition-colors hover:bg-[var(--soft)] md:px-5 ${compact ? "" : ROW_COLS}`}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <SchoolLogo name={u.name} domain={u.domain} size={36} className="rounded-[10px]" />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold">{u.name}</p>
          <p className="flex items-center gap-1.5 truncate text-[13px] text-[var(--ink-3)]">
            <i className="size-1.5 shrink-0 rounded-full" style={{ background: REGION_TONE[u.region].strong }} aria-hidden />
            {u.city}, {u.country}
          </p>
        </div>
      </div>

      <ArrowRight className={`size-4 text-[var(--ink-3)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--ink)] ${narrow}`} aria-hidden />

      {/* Phones: one quiet line of numbers. Desktop: the columns below. */}
      <p className={`col-span-2 pl-[50px] text-[13px] text-[var(--ink-2)] ${narrow}`}>
        {money(u.tuition)} · {percent(u.accept)} accepted · {u.deadline ? shortDate(u.deadline) : "Rolling"}
      </p>

      <span className={`${wide} text-[14px] text-[var(--ink-2)]`}>{u.type}</span>
      <span className={`${wide} text-[14px] tabular-nums`}>{money(u.tuition)}</span>
      <span className={compact ? "hidden" : "hidden items-center gap-2.5 md:flex"}>
        <span className="w-9 text-[14px] tabular-nums">{percent(u.accept)}</span>
        {u.accept !== null && (
          <span className="h-1 w-14 overflow-hidden rounded-full bg-[var(--line)]">
            <span className="block h-full rounded-full bg-[var(--ink)]" style={{ width: `${Math.max(u.accept, 3)}%` }} />
          </span>
        )}
      </span>
      <span className={`${wide} text-[14px] tabular-nums`}>{u.deadline ? shortDate(u.deadline) : "Rolling"}</span>
      <ArrowRight className={`${wide} size-4 text-[var(--ink-3)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--ink)]`} aria-hidden />
    </Link>
  );
}
