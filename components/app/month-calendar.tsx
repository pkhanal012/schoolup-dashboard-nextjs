"use client";

import * as React from "react";
import { calendarEvents, deadlineDates, hardDeadlines, type CalendarEvent, type EventKind } from "./data";
import { cn } from "@/lib/utils";

/*
 * The month grid: six columns of weekdays and a row per week, each cell holding
 * the day's events as pills.
 *
 * Deadlines are drawn from the same list the sidebar uses and marked with a dot
 * — they are the dates the student cannot move, and the dot is what separates
 * them from work they scheduled themselves.
 */

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** How many pills fit before the cell starts counting instead of listing. */
const VISIBLE = 3;

const KIND_STYLE: Record<EventKind, string> = {
  Essay: "bg-accent-soft text-accent",
  Interview: "bg-good-soft text-good",
  Test: "bg-warn-soft text-warn",
  Admin: "bg-sunken text-ink-2",
  Deadline: "bg-bad-soft text-bad",
};

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The Monday on or before the 1st, through enough weeks to cover the month. */
function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  // getDay() is Sunday-first; the grid starts on Monday.
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - lead);
  const weeks = Math.ceil((lead + new Date(year, month + 1, 0).getDate()) / 7);
  return Array.from({ length: weeks * 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

/** Everything on one day, scheduled work first and fixed dates last. */
function eventsOn(date: string): CalendarEvent[] {
  const scheduled = calendarEvents.filter((e) => e.date === date);
  const due = hardDeadlines
    .filter((d) => deadlineDates[d.id] === date)
    .map((d): CalendarEvent => ({ id: d.id, date, title: d.title, kind: "Deadline" }));
  return [...scheduled, ...due];
}

export function MonthCalendar({
  month,
  today,
  onOpen,
}: {
  month: Date;
  today: Date;
  onOpen: (event: CalendarEvent) => void;
}) {
  const days = monthGrid(month.getFullYear(), month.getMonth());
  const todayKey = iso(today);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-7 border-b border-line-soft bg-sunken">
          {WEEKDAYS.map((d) => (
            <span key={d} className="px-3 py-2.5 text-center text-[12px] font-medium text-ink-3">
              {d}
            </span>
          ))}
        </div>

        {/* A border on the cell rather than the row keeps the grid square when a
            week runs short of seven days at either end of the month. */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = iso(day);
            const outside = day.getMonth() !== month.getMonth();
            const isToday = key === todayKey;
            const events = eventsOn(key);
            const shown = events.slice(0, VISIBLE);

            return (
              <div
                key={key}
                className={cn("min-h-[124px] border-b border-l p-2 first:border-l-0 [&:nth-child(7n+1)]:border-l-0", outside && "bg-sunken/50")}
              >
                <div className="mb-1.5 flex items-center">
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-[12px] tabular-nums",
                      isToday ? "bg-ink font-medium text-surface" : outside ? "text-ink-4" : "text-ink-2",
                    )}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {shown.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onOpen(event)}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-[11.5px] transition-opacity hover:opacity-80",
                        KIND_STYLE[event.kind],
                        outside && "opacity-60",
                      )}
                    >
                      {event.kind === "Deadline" ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
                      <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
                      {event.time ? <span className="shrink-0 font-mono text-[11px] opacity-70">{event.time}</span> : null}
                    </button>
                  ))}

                  {events.length > VISIBLE ? (
                    <button
                      onClick={() => onOpen(events[VISIBLE])}
                      className="px-2 pt-0.5 text-left text-[11.5px] text-ink-3 transition-colors hover:text-ink"
                    >
                      {events.length - VISIBLE} more…
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
