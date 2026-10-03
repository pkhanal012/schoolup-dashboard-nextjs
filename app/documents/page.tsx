"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Ellipsis, FileText, Minus, Plus, Send, Sparkles } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { useMode, useNewRequest } from "@/components/app/state";
import { docs, type Doc } from "@/components/app/data";
import { DOC_TYPE } from "@/components/app/doc-types";
import { newDraftId, resolveDraft, timeAgo, useSavedDrafts } from "@/components/app/drafts";
import {
  Badge,
  Button,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTablePrimary,
  DataTableRow,
  Dropdown,
  DropdownItem,
  EmptyState,
  IconTile,
  Modal,
  ResultCount,
  SearchField,
  TableSkeleton,
  Tabs,
  useToast,
} from "@/components/ui/kit";
import { cn } from "@/lib/utils";

type Tab = "all" | "draft" | "review" | "final";

const TYPES = ["Statement of purpose", "Scholarship essay", "CV", "Reference request"] as const;


const DOC_ILLUSTRATION = { light: "/images/illustratioin/writing.png", dark: "/images/illustratioin/writing.png" };

const STATE_TONE = { Draft: "neutral", "In review": "accent", Final: "good" } as const;

const STAGE: Record<Exclude<Tab, "all">, Doc["state"]> = { draft: "Draft", review: "In review", final: "Final" };

/* Checkbox · Name · Stage · Last edited · Actions. Narrow, the checkbox and
   actions stay beside the name and the rest folds into it. */
const COLS = "grid-cols-[18px_minmax(0,1fr)_auto] @3xl:grid-cols-[18px_minmax(0,1fr)_96px_112px_112px]";

function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);
  return (
    <span className="relative grid size-[18px] place-items-center">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className="peer size-full cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-line-strong bg-surface transition-colors hover:border-ink-3 checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary"
      />
      <Check className="pointer-events-none absolute size-3 text-primary-ink opacity-0 peer-checked:opacity-100" strokeWidth={3} />
      <Minus className="pointer-events-none absolute size-3 text-primary-ink opacity-0 peer-indeterminate:opacity-100" strokeWidth={3} />
    </span>
  );
}

export default function DocumentsPage() {
  const { mode } = useMode();
  const toast = useToast();
  const [tab, setTab] = React.useState<Tab>("all");
  const [newOpen, setNewOpen] = React.useState(false);
  useNewRequest("document", setNewOpen);
  const [type, setType] = React.useState<(typeof TYPES)[number]>("Statement of purpose");
  const router = useRouter();
  const [creating, setCreating] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [newestFirst, setNewestFirst] = React.useState(true);

  // Your edits (name, type, stage…) and the drafts you started, laid over the list.
  const { saved, created } = useSavedDrafts();
  const started: Doc[] = created.flatMap((id) => {
    const d = resolveDraft(id);
    return d ? [{ ...d, words: 0, updated: "" }] : [];
  });
  const base = mode === "new" ? started : [...started, ...docs];
  const all = base
    .map((d, i) => {
      const s = saved[d.id];
      return {
        ...d,
        title: s?.title || d.title,
        type: s?.type ?? d.type,
        forWhom: s?.forWhom ?? d.forWhom,
        state: s?.state ?? d.state,
        updated: s?.updatedAt ? timeAgo(s.updatedAt) : d.updated,
        // Edited drafts float to the top, newest first; the rest keep their order.
        rank: s?.updatedAt ?? -i,
      };
    })
    .sort((a, b) => b.rank - a.rank);
  const q = query.trim().toLowerCase();
  const rows = all
    .filter((d) => tab === "all" || d.state === STAGE[tab])
    .filter((d) => !q || `${d.title} ${d.type} ${d.forWhom}`.toLowerCase().includes(q));
  const ordered = newestFirst ? rows : [...rows].reverse();

  const visibleSelected = selected.filter((id) => rows.some((d) => d.id === id));
  const allSelected = rows.length > 0 && visibleSelected.length === rows.length;
  const toggleOne = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const toggleAll = () => setSelected(allSelected ? [] : rows.map((d) => d.id));

  const sendForReview = (count: number) =>
    toast({ message: count === 1 ? "Sent to a reviewer — expect notes within a day." : `${count} drafts sent to a reviewer — expect notes within a day.` });

  const stageCount = (t: Tab) => (t === "all" ? all.length : all.filter((d) => d.state === STAGE[t]).length);
  const stages: { value: Tab; label: string; count: number }[] = [
    { value: "all", label: "All", count: stageCount("all") },
    { value: "draft", label: "Drafts", count: stageCount("draft") },
    { value: "review", label: "In review", count: stageCount("review") },
    { value: "final", label: "Final", count: stageCount("final") },
  ];

  return (
    <Shell
      title="Writing coach"
      description="Your statements, essays and CV in one place. The coach asks questions, checks structure, and suggests rewrites only when you ask — you decide what stays."
      actions={<Button size="sm" variant="primary" onClick={() => setNewOpen(true)}><Plus /> New draft</Button>}
    >
      {mode === "loading" ? (
        <TableSkeleton />
      ) : mode === "new" ? (
        <EmptyState
          illustration={DOC_ILLUSTRATION}
          title="Start with your statement of purpose"
          body="Every application on your list asks for one, and your scholarship essays can reuse most of it. The coach takes you through it one question at a time."
          primary={<Button size="sm" onClick={() => setNewOpen(true)}>Start writing</Button>}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <Tabs value={tab} onChange={setTab} tabs={stages} />

          <DataTable
            cols={COLS}
            toolbar={
              <>
                <SearchField label="Search drafts" value={query} onChange={setQuery} placeholder="Search title, type or school" />
                {visibleSelected.length > 0 ? (
                  <div className="su-fade ml-auto flex items-center gap-1.5">
                    <span className="pr-1 text-[12.5px] font-medium">{visibleSelected.length} selected</span>
                    <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Button>
                    <Button size="sm" variant="primary" onClick={() => { sendForReview(visibleSelected.length); setSelected([]); }}>
                      <Send /> Send for review
                    </Button>
                  </div>
                ) : (
                  <ResultCount>
                    {ordered.length} {ordered.length === 1 ? "draft" : "drafts"}
                  </ResultCount>
                )}
              </>
            }
          >
            {ordered.length === 0 ? (
              <DataTableEmpty
                icon={FileText}
                title={q ? "No drafts match your search" : "Nothing at this stage"}
                body={q ? "Try a shorter search, or switch the filter back to All." : "Drafts move from Draft to In review to Final as you work. None are at this stage right now."}
                primary={q ? <Button size="sm" onClick={() => setQuery("")}>Clear search</Button> : undefined}
              />
            ) : (
              <>
                <DataTableHead>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={visibleSelected.length > 0 && !allSelected}
                    onChange={toggleAll}
                    label="Select all drafts"
                  />
                  <span>Draft</span>
                  <span>Stage</span>
                  <button
                    onClick={() => setNewestFirst((v) => !v)}
                    aria-label={newestFirst ? "Last edited, newest first. Sort oldest first" : "Last edited, oldest first. Sort newest first"}
                    className="inline-flex items-center gap-1 justify-self-start transition-colors hover:text-ink"
                  >
                    Last edited <ChevronDown className={cn("size-3.5 transition-transform", !newestFirst && "rotate-180")} />
                  </button>
                  <span />
                </DataTableHead>

                <DataTableBody>
                  {ordered.map((d) => {
                    const isSelected = selected.includes(d.id);
                    return (
                      <DataTableRow key={d.id} selected={isSelected} className="items-center">
                        <Checkbox checked={isSelected} onChange={() => toggleOne(d.id)} label={`Select ${d.title}`} />
                        <DataTablePrimary
                          lead={<IconTile icon={DOC_TYPE[d.type].icon} tone={DOC_TYPE[d.type].tone} />}
                          title={<Link href={`/documents/${d.id}`} className="hover:underline">{d.title}</Link>}
                          extra={<span className="shrink-0 @3xl:hidden"><Badge tone={STATE_TONE[d.state]}>{d.state}</Badge></span>}
                          sub={`${d.type} · ${d.forWhom || "not linked yet"}`}
                        />
                        <DataTableCell narrow="hide"><Badge tone={STATE_TONE[d.state]}>{d.state}</Badge></DataTableCell>
                        <DataTableCell narrow="hide" className="text-ink-2">{d.updated || "—"}</DataTableCell>

                        <div className="flex items-center justify-end gap-1">
                          {/* Icon-only when narrow, so the name keeps the room. */}
                          <Button size="sm" aria-label={`Open ${d.title}`} className="px-2.5 @3xl:px-3.5" onClick={() => router.push(`/documents/${d.id}`)}>
                            <Sparkles /> <span className="hidden @3xl:inline">Open</span>
                          </Button>
                          <Dropdown
                            align="end"
                            label={`More actions for ${d.title}`}
                            trigger={
                              <span className="grid size-8 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink">
                                <Ellipsis className="size-4" />
                              </span>
                            }
                          >
                            <DropdownItem onClick={() => sendForReview(1)}><Send /> Send for review</DropdownItem>
                          </Dropdown>
                        </div>
                      </DataTableRow>
                    );
                  })}
                </DataTableBody>
              </>
            )}
          </DataTable>
        </div>
      )}

      {/* New draft */}
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="What are you writing?"
        description="This sets your word target and what the coach checks for. You can change both later."
        footer={
          <>
            <Button onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={creating}
              onClick={() => {
                setCreating(true);
                router.push(`/documents/${newDraftId(type)}`);
              }}
            >
              Start writing
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5">
          {TYPES.map((t) => {
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                  type === t ? "bg-primary-soft" : "bg-sunken hover:bg-hover",
                )}
              >
                <IconTile icon={DOC_TYPE[t].icon} tone={DOC_TYPE[t].tone} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold tracking-[-0.15px]">{t}</span>
                  <span className="block text-[12px] text-ink-3">
                    {t === "Statement of purpose"
                      ? "1,000 words · required by all four of your applications"
                      : t === "Scholarship essay"
                        ? "600 words · reuses your statement of purpose"
                        : t === "CV"
                          ? "2 pages · academic format"
                          : "250 words · a warm, specific ask"}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-[18px] shrink-0 place-items-center rounded-full",
                    type === t ? "bg-primary text-primary-ink" : "border-[1.5px] border-line-strong",
                  )}
                >
                  {type === t ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </Modal>

    </Shell>
  );
}
