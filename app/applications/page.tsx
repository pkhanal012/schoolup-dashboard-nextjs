"use client";

import * as React from "react";
import { ArrowUpRight, BookOpen, Check, CircleDashed, Clock3, GripVertical, RotateCcw, Send, Upload } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { SchoolLogo } from "@/components/app/school-logo";
import { useMode } from "@/components/app/state";
import { applications, requirements, type Application } from "@/components/app/data";
import { isDefaultOrder, moveBy, moveTo, resetOrder, useOrder } from "@/components/app/priority";
import {
  Badge,
  Button,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTablePrimary,
  DataTableRow,
  Due,
  EmptyState,
  Meter,
  Modal,
  PanelList,
  ResultCount,
  TableSkeleton,
  Tabs,
  useToast,
} from "@/components/ui/kit";
import { cn } from "@/lib/utils";

type Tab = "open" | "submitted";

/* Priority · School · Progress · Closes · the one action. */
const COLS = "@3xl:grid-cols-[minmax(0,1fr)_128px_112px_104px]";

const REQ_TONE = { Done: "good", "In review": "accent", "In progress": "warn", "Not started": "neutral" } as const;

export default function ApplicationsPage() {
  const { mode } = useMode();
  const toast = useToast();
  const [tab, setTab] = React.useState<Tab>("open");
  const [selected, setSelected] = React.useState<Application | null>(null);
  const [submitting, setSubmitting] = React.useState<Application | null>(null);
  const [reqs, setReqs] = React.useState(requirements);

  /* Priority order. The list is the student's ranking — first row is the school
     they most want — so it is theirs to arrange, by drag or by keyboard. */
  const order = useOrder();
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  // HTML5 drag only starts from the handle, so the buttons in the row stay clickable.
  const [handleHeld, setHandleHeld] = React.useState<string | null>(null);

  const ordered = React.useMemo(() => {
    const byId = new Map(applications.map((a) => [a.id, a]));
    return order.map((id) => byId.get(id)).filter((a): a is Application => Boolean(a));
  }, [order]);

  const rows = mode === "new" ? [] : ordered;

  const endDrag = () => {
    setDragId(null);
    setOverId(null);
    setHandleHeld(null);
  };

  return (
    <Shell
      title="Applications"
      description="One row per school you are applying to — what is done, what is next, and when it closes."
      actions={<Button size="sm" variant="primary"><BookOpen /> Add application</Button>}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "open", label: "Open", count: rows.length },
            { value: "submitted", label: "Submitted", count: 0 },
          ]}
        />

        {mode === "loading" ? (
          <TableSkeleton />
        ) : tab === "submitted" ? (
          <EmptyState
            icon={Send}
            title="Nothing submitted yet"
            body="Submitted applications move here with their decision dates, so you can see what you are waiting on."
          />
        ) : rows.length === 0 ? (
          <EmptyState
            illustration={{ light: "/images/illustratioin/admission.png", dark: "/images/illustratioin/admission.png" }}
            title="No applications yet"
            body="Start one from a saved school. We turn it into a requirement checklist with dates, drafts and reminders."
            primary={<Button size="sm">Browse colleges</Button>}
            secondary={<Button size="sm">Add one manually</Button>}
          />
        ) : (
          <DataTable
            cols={COLS}
            toolbar={
              <>
                <span className="flex items-center gap-2 pl-1 text-[12.5px] text-ink-2">
                  <GripVertical className="size-4 text-ink-3" strokeWidth={1.75} />
                  Ranked by you — drag a row, or use the arrow keys on its number, to reorder.
                </span>
                <ResultCount>
                  {!isDefaultOrder(order) ? (
                    <button
                      onClick={resetOrder}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 font-medium text-ink-2 transition-colors hover:bg-hover hover:text-ink"
                    >
                      <RotateCcw className="size-3.5" /> Reset order
                    </button>
                  ) : (
                    `${rows.length} open`
                  )}
                </ResultCount>
              </>
            }
          >
            <DataTableHead>
              <span className="pl-9">School</span>
              <span>Progress</span>
              <span>Closes</span>
              <span />
            </DataTableHead>
            <DataTableBody>
              {rows.map((a, i) => (
                <DataTableRow
                  key={a.id}
                  draggable={handleHeld === a.id}
                  onDragStart={(e) => {
                    setDragId(a.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    if (!dragId) return;
                    e.preventDefault();
                    setOverId(a.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragId) moveTo(dragId, a.id);
                    endDrag();
                  }}
                  onDragEnd={endDrag}
                  selected={overId === a.id && dragId !== a.id}
                  className={cn("group", dragId === a.id && "opacity-40")}
                >
                  <DataTablePrimary
                    lead={
                      <>
                        {/* Rank, and the grip that moves it. Arrow keys do the same job
                            for anyone not using a mouse. */}
                        <button
                          onMouseDown={() => setHandleHeld(a.id)}
                          onMouseUp={() => setHandleHeld(null)}
                          onKeyDown={(e) => {
                            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                            e.preventDefault();
                            moveBy(a.id, e.key === "ArrowUp" ? -1 : 1);
                          }}
                          aria-label={`${a.school}, priority ${i + 1} of ${rows.length}. Use the arrow keys to move it.`}
                          title="Drag, or use the arrow keys, to reorder"
                          className="grid size-6 shrink-0 cursor-grab place-items-center rounded-full font-mono text-[12px] tabular-nums text-ink-3 transition-colors hover:bg-hover hover:text-ink focus-visible:bg-hover active:cursor-grabbing"
                        >
                          <span className="group-hover:hidden">{i + 1}</span>
                          <GripVertical className="hidden size-4 group-hover:block" strokeWidth={1.75} />
                        </button>
                        <SchoolLogo name={a.school} domain={a.domain} size={32} />
                      </>
                    }
                    title={
                      <button onClick={() => setSelected(a)} className="max-w-full truncate text-left hover:underline">
                        {a.school}
                      </button>
                    }
                    sub={<>{a.program} · {a.country} · <span className="text-ink-2">Next: {a.next}</span></>}
                  />

                  <DataTableCell label="Progress">
                    <span className="flex items-center gap-2.5 @3xl:block">
                      <span className="font-mono tabular-nums">{a.done}/{a.total}</span>
                      <Meter className="w-24 @3xl:mt-1.5 @3xl:w-full" value={(a.done / a.total) * 100} tone={a.stage === "Ready" ? "good" : "accent"} />
                    </span>
                  </DataTableCell>
                  <DataTableCell label="Closes"><Due date={a.deadline} days={a.daysLeft} /></DataTableCell>
                  <DataTableCell narrow="bare" align="end">
                    {a.stage === "Ready" ? (
                      <Button size="sm" variant="primary" onClick={() => setSubmitting(a)}><Send /> Submit</Button>
                    ) : (
                      <Button size="sm" onClick={() => setSelected(a)}>Open</Button>
                    )}
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </div>

      {/* Detail drawer — the requirement checklist */}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        width={620}
        title={selected ? `${selected.school} — ${selected.program}` : ""}
        description={selected ? `Closes ${selected.deadline} · ${selected.daysLeft} days · ${selected.done} of ${selected.total} requirements done` : ""}
        footer={
          <>
            <Button onClick={() => setSelected(null)}>Close</Button>
            <Button variant="primary"><ArrowUpRight /> Open portal</Button>
          </>
        }
      >
        <PanelList className="overflow-hidden rounded-2xl border">
          {reqs.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-3">
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", r.state === "Done" ? "bg-good-soft text-good" : "text-ink-3")}>
                {r.state === "Done" ? <Check className="size-3" strokeWidth={3} /> : <CircleDashed className="size-3.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold tracking-[-0.15px]">{r.title}</p>
                <p className="mt-0.5 truncate text-[12px] text-ink-3">{r.detail}</p>
              </div>
              <Badge tone={REQ_TONE[r.state]}>{r.state}</Badge>
              {r.state === "Not started" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setReqs((list) => list.map((x) => (x.id === r.id ? { ...x, state: "In progress" as const } : x)));
                    toast({ message: `${r.title} started` });
                  }}
                >
                  <Upload /> Start
                </Button>
              ) : null}
            </li>
          ))}
        </PanelList>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-3">
          <Clock3 className="size-3.5" /> Each requirement has its own due date, set two weeks before the deadline.
        </p>
      </Modal>

      {/* Irreversible action — explicit confirmation */}
      <Modal
        open={Boolean(submitting)}
        onClose={() => setSubmitting(null)}
        title="Submit this application?"
        description={submitting ? `${submitting.school} · ${submitting.program}. You cannot edit an application after it is submitted.` : ""}
        footer={
          <>
            <Button onClick={() => setSubmitting(null)}>Review once more</Button>
            <Button variant="primary" onClick={() => { toast({ message: `Submitted to ${submitting?.school}` }); setSubmitting(null); }}>
              Yes, submit
            </Button>
          </>
        }
      >
        <ul className="flex flex-col gap-1.5 text-[12.5px] text-ink-2">
          <li className="flex items-center gap-2"><Check className="size-3.5 text-good" /> 6 of 6 requirements complete</li>
          <li className="flex items-center gap-2"><Check className="size-3.5 text-good" /> Statement of purpose marked Final</li>
          <li className="flex items-center gap-2"><Check className="size-3.5 text-good" /> Application fee ready to pay on the portal</li>
        </ul>
      </Modal>
    </Shell>
  );
}
