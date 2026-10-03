"use client";

import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { useMode, useNewRequest } from "@/components/app/state";
import { blocks, type Block, type CalendarEvent } from "@/components/app/data";
import { DeadlineList } from "@/components/app/deadline-list";
import { MonthCalendar } from "@/components/app/month-calendar";
import { Button, buttonStyles, Chip, Dropdown, DropdownItem, EmptyState, Label, Modal, Panel, PanelHead, Skeleton, fieldStyles, useToast } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const DAYS = ["Mon 14", "Tue 15", "Wed 16", "Thu 17", "Fri 18", "Sat 19", "Sun 20"];
const TODAY = new Date(2026, 8, 17);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
type View = "month" | "week";
const START = 7;
const END = 22;
const KINDS = ["Essay", "Interview", "Test", "Admin"] as const;

/* The same tints the month grid uses, so a block looks the same in either view. */
const KIND_STYLE: Record<Block["kind"], string> = {
  Essay: "bg-accent-soft text-accent",
  Interview: "bg-good-soft text-good",
  Test: "bg-warn-soft text-warn",
  Admin: "bg-sunken text-ink-2",
};

export default function CalendarPage() {
  const { mode } = useMode();
  const toast = useToast();
  const [items, setItems] = React.useState<Block[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
  useNewRequest("block", setAddOpen);
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState<Block["kind"]>("Essay");
  const [day, setDay] = React.useState(3);
  const [start, setStart] = React.useState(9);
  const [hours, setHours] = React.useState(1.5);
  const [saving, setSaving] = React.useState(false);
  const [view, setView] = React.useState<View>("month");
  const [month, setMonth] = React.useState(() => new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));

  const shiftMonth = (by: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const range = `${MONTHS[month.getMonth()].slice(0, 3)} 1, ${month.getFullYear()} – ${MONTHS[month.getMonth()].slice(0, 3)} ${monthEnd.getDate()}, ${month.getFullYear()}`;

  React.useEffect(() => setItems(mode === "new" ? [] : blocks), [mode]);

  const save = () => {
    if (!title.trim()) return;
    setSaving(true);
    setTimeout(() => {
      const b: Block = { id: `n${Date.now()}`, title: title.trim(), kind, day, start, hours };
      setItems((cur) => [...cur, b]);
      setSaving(false);
      setAddOpen(false);
      setTitle("");
      toast({ message: `${b.title} added to ${DAYS[day]}`, action: { label: "Undo", onClick: () => setItems((cur) => cur.filter((x) => x.id !== b.id)) } });
    }, 700);
  };

  return (
    <Shell
      title="Calendar"
      description="Deadlines arrive here on their own. You only schedule the work that gets them done."
      actions={<Button size="sm" variant="primary" onClick={() => setAddOpen(true)}><Plus /> Add block</Button>}
    >
      {/* Month view wants the full width for its cells; the week grid is narrow
          enough to sit beside the deadline list. */}
      <div className={cn("grid min-h-0 flex-1 gap-5", view === "week" && "xl:grid-cols-[minmax(0,1fr)_300px]")}>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {mode === "loading" ? (
            <Skeleton className="h-[440px] rounded-card" />
          ) : items.length === 0 ? (
            <EmptyState
              illustration={{ light: "/images/illustratioin/calender.png", dark: "/images/illustratioin/calender.png" }}
              title="Nothing scheduled this week"
              body="You have 14 free hours before your next hard deadline. Block two of them for the statement of purpose and the rest will follow."
              primary={<Button size="sm" onClick={() => setAddOpen(true)}>Add your first block</Button>}
              secondary={<Button size="sm" onClick={() => { setItems(blocks); toast({ message: "Week planned — 6 blocks added" }); }}>Plan my week for me</Button>}
            />
          ) : (
            <Panel className="overflow-hidden">
              <CalendarToolbar
                month={month}
                range={range}
                view={view}
                onView={setView}
                onShift={shiftMonth}
                onToday={() => setMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))}
              />
              {view === "month" ? (
                <MonthCalendar
                  month={month}
                  today={TODAY}
                  onOpen={(e: CalendarEvent) => toast({ message: e.time ? `${e.title} · ${e.time}` : e.title })}
                />
              ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b bg-sunken">
                    <span />
                    {DAYS.map((d, i) => (
                      <span key={d} className={cn("px-2 py-2.5 text-center text-[12px] font-medium", i === 3 ? "text-ink" : "text-ink-3")}>{d}</span>
                    ))}
                  </div>
                  <div className="relative grid grid-cols-[48px_repeat(7,1fr)]">
                    <div className="flex flex-col">
                      {Array.from({ length: END - START }, (_, i) => (
                        <span key={i} className="h-11 -translate-y-[5px] pr-2 text-right font-mono text-[10.5px] leading-none text-ink-3">{`${START + i}:00`}</span>
                      ))}
                    </div>
                    {DAYS.map((d, dayIdx) => (
                      <div key={d} className={cn("relative border-l", dayIdx === 3 && "bg-sunken/60")}>
                        {Array.from({ length: END - START }, (_, i) => <div key={i} className="h-11 border-b" />)}
                        {items.filter((b) => b.day === dayIdx).map((b) => (
                          <button
                            key={b.id}
                            className={cn("absolute inset-x-1 rounded-lg px-2 py-1 text-left text-[11.5px] leading-tight transition-opacity hover:opacity-80", KIND_STYLE[b.kind])}
                            style={{ top: (b.start - START) * 44 + 2, height: b.hours * 44 - 4 }}
                            onClick={() => toast({ message: `${b.title} · ${b.kind}` })}
                          >
                            <span className="block truncate font-medium">{b.title}</span>
                            <span className="block truncate opacity-70">{b.start}:00</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </Panel>
          )}
        </div>

        <div className={cn("flex min-w-0 flex-col gap-5", view === "month" && "lg:flex-row lg:[&>*]:flex-1")}>
          <DeadlineList hint="Added automatically. You cannot move these." />

          <Panel className="self-start">
            <PanelHead title="Reminders" hint="Essays remind you 3 days out, interviews 1 day out, tests 1 week out. One scale, everywhere." />
            <div className="px-4 py-3">
              <Button size="sm">Change defaults</Button>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a block"
        description="Name it so you know what to do when the reminder arrives."
        footer={
          <>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} disabled={!title.trim()} onClick={save}>Add block</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <Label as="span">What are you working on?</Label>
            <input
              id="block-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Statement of purpose — draft 2"
              className={fieldStyles}
            />
            {!title.trim() ? <span className="text-[12px] text-ink-3">A title is required — it is what the reminder says.</span> : null}
          </label>

          <div className="flex flex-col gap-1.5">
            <Label as="span">Kind</Label>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => <Chip key={k} active={kind === k} onClick={() => setKind(k)}>{k}</Chip>)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="flex flex-col gap-1.5">
              <Label as="span">Day</Label>
              <select id="block-day" value={day} onChange={(e) => setDay(Number(e.target.value))} className={cn(fieldStyles, "px-3")}>
                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <Label as="span">Start</Label>
              <select id="block-start" value={start} onChange={(e) => setStart(Number(e.target.value))} className={cn(fieldStyles, "px-3")}>
                {Array.from({ length: END - START }, (_, i) => START + i).map((h) => <option key={h} value={h}>{h}:00</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <Label as="span">Length</Label>
              <select id="block-len" value={hours} onChange={(e) => setHours(Number(e.target.value))} className={cn(fieldStyles, "px-3")}>
                {[0.5, 1, 1.5, 2, 3].map((h) => <option key={h} value={h}>{h}h</option>)}
              </select>
            </label>
          </div>
        </div>
      </Modal>
    </Shell>
  );
}

/* The calendar's own header, after the reference: what you are looking at on
   the left, how to move and how to look at it on the right. */
function CalendarToolbar({
  month,
  range,
  view,
  onView,
  onShift,
  onToday,
}: {
  month: Date;
  range: string;
  view: View;
  onView: (v: View) => void;
  onShift: (by: number) => void;
  onToday: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line-soft px-4 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        {/* The date block: the month above the day, as a torn-off calendar leaf. */}
        <span className="grid size-12 shrink-0 -rotate-3 place-content-center rounded-2xl bg-sun-soft text-center leading-none">
          <span className="text-[11px] font-medium text-ink-2">{MONTHS[TODAY.getMonth()].slice(0, 3)}</span>
          <span className="su-display mt-0.5 text-[18px] tabular-nums">{TODAY.getDate()}</span>
        </span>
        <div className="min-w-0">
          <h2 className="su-display truncate text-[18px] leading-tight">
            {MONTHS[month.getMonth()]} {month.getFullYear()}
          </h2>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-3">{range}</p>
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          aria-label="Search events"
          className="grid size-9 place-items-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
        >
          <Search className="size-4" />
        </button>

        {/* Same well as the Segmented control: a sunken pill holding three buttons. */}
        <div className="flex h-9 items-center gap-0.5 rounded-full bg-sunken p-1 ring-1 ring-inset ring-[var(--line)]">
          <button onClick={() => onShift(-1)} aria-label="Previous month" className="grid size-7 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface hover:text-ink">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={onToday} className="h-full rounded-full px-3 text-[12px] font-semibold transition-colors hover:bg-surface">
            Today
          </button>
          <button onClick={() => onShift(1)} aria-label="Next month" className="grid size-7 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface hover:text-ink">
            <ChevronRight className="size-4" />
          </button>
        </div>

        <Dropdown
          label="Change view"
          width={160}
          trigger={
            <span className={buttonStyles({ size: "sm", className: "hover:translate-y-0" })}>
              {view === "month" ? "Month view" : "Week view"}
              <ChevronDown className="size-3.5 text-ink-3" />
            </span>
          }
        >
          <DropdownItem onClick={() => onView("month")}>Month view</DropdownItem>
          <DropdownItem onClick={() => onView("week")}>Week view</DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}
