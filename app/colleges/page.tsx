"use client";

import * as React from "react";
import {
  Bookmark,
  BookmarkCheck,
  GraduationCap,
  LayoutGrid,
  List,
  Pencil,
  Search,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { Shell } from "@/components/app/shell";
import { useRouter } from "next/navigation";
import { SchoolLogo } from "@/components/app/school-logo";
import { useMode } from "@/components/app/state";
import { schools, type School } from "@/components/app/data";
import { DEFAULT_PLAN, PlanEditor, inDestination, type StudyPlan } from "@/components/app/study-plan";
import {
  Badge,
  Button,
  Chip,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTablePrimary,
  DataTableRow,
  FilterTag,
  Modal,
  Panel,
  ResultCount,
  SearchField,
  Segmented,
  Skeleton,
  TableSkeleton,
  TableToolbar,
  Tabs,
  useToast,
} from "@/components/ui/kit";
import { cn } from "@/lib/utils";

type Tab = "matches" | "saved";
type View = "list" | "grid";

const VIEWS: { value: View; label: string; icon: React.ElementType }[] = [
  { value: "list", label: "List", icon: List },
  { value: "grid", label: "Grid", icon: LayoutGrid },
];

const BAND_TONE = { Safety: "good", Target: "neutral", Reach: "warn" } as const;

/* Columns follow the content width (a container query), not the viewport, so
   collapsing the sidebar can make room for the fourth card. */
const GRID = "grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4";

/* One template shared by the header and every row, so the columns line up. */
const COLS = "@3xl:grid-cols-[minmax(0,1fr)_84px_120px_100px_100px_76px_32px]";

function SchoolCard({
  school: s,
  saved,
  onOpen,
  onToggleSave,
}: {
  school: School;
  saved: boolean;
  onOpen: () => void;
  onToggleSave: () => void;
}) {
  const [coverFailed, setCoverFailed] = React.useState(false);
  const cover = s.images[0];

  return (
    <li>
      <Panel
        interactive
        onClick={onOpen}
        className="group flex h-full cursor-pointer flex-col overflow-hidden"
      >
        <div className="relative aspect-[16/9] overflow-hidden border-b border-line-soft bg-sunken">
          {cover && !coverFailed ? (
            <img
              // Same guard as SchoolLogo: the image can fail before React attaches onError.
              ref={(el) => {
                if (el && el.complete && el.naturalWidth === 0) setCoverFailed(true);
              }}
              src={cover}
              alt=""
              aria-hidden
              loading="lazy"
              onError={() => setCoverFailed(true)}
              className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <span className="grid size-full place-items-center">
              <GraduationCap className="size-6 text-ink-4" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start gap-2.5">
            <SchoolLogo name={s.name} domain={s.domain} size={32} />
            <div className="min-w-0 flex-1">
              {/* The card is clickable for the mouse; this button is the keyboard path. */}
              <button
                onClick={(e) => { e.stopPropagation(); onOpen(); }}
                className="block max-w-full truncate text-left text-[13.5px] font-semibold tracking-[-0.15px] hover:underline"
              >
                {s.name}
              </button>
              <p className="mt-0.5 truncate text-[12px] text-ink-3">{s.program} · {s.place}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              aria-pressed={saved}
              aria-label={saved ? `Remove ${s.name} from your list` : `Save ${s.name}`}
              className={cn("-mr-1.5 -mt-1 size-8 px-0", saved && "text-ink")}
              onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
            >
              {saved ? <BookmarkCheck /> : <Bookmark />}
            </Button>
          </div>

          {/* Same fields and order as the list view. */}
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
            {([
              ["Admission rate", s.accept, true],
              ["Institution type", s.type, false],
              ["Avg. cost after aid", s.costAfterAid, true],
              ["Regular decision", s.deadline, true],
            ] as const).map(([label, value, mono]) => (
              <div key={label} className="min-w-0">
                <dt className="truncate text-[12px] text-ink-3">{label}</dt>
                <dd className={cn("mt-0.5 truncate text-[12.5px]", mono && "font-mono tabular-nums")}>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between gap-2 border-t border-line-soft pt-3">
              <span className="text-[12px] text-ink-3">Status</span>
              <Badge tone={BAND_TONE[s.band]}>{s.band}</Badge>
            </div>
          </div>
        </div>
      </Panel>
    </li>
  );
}

export default function CollegesPage() {
  const { mode } = useMode();
  const toast = useToast();
  const [tab, setTab] = React.useState<Tab>("matches");
  const [view, setView] = React.useState<View>("list");
  const [query, setQuery] = React.useState("");
  const [planFilter, setPlanFilter] = React.useState(true);
  const [planDrawerOpen, setPlanDrawerOpen] = React.useState(false);
  const [plan, setPlan] = React.useState<StudyPlan>(DEFAULT_PLAN);
  const [saved, setSaved] = React.useState<string[]>([]);
  const [starting, setStarting] = React.useState<School | null>(null);
  const router = useRouter();
  const openSchool = React.useCallback((s: School) => router.push(`/colleges/${s.id}`), [router]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("su-study-plan");
      if (stored) {
        const parsed = JSON.parse(stored);
        setPlan((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  React.useEffect(() => {
    setSaved(mode === "new" ? [] : schools.filter((s) => s.saved).map((s) => s.id));
  }, [mode]);

  const handleSavePlan = (newPlan: StudyPlan) => {
    setPlan(newPlan);
    try {
      localStorage.setItem("su-study-plan", JSON.stringify(newPlan));
    } catch {}
    toast({ message: "Study plan updated" });
  };

  const list = React.useMemo(() => {
    let rows = schools;
    if (tab === "saved") rows = rows.filter((s) => saved.includes(s.id));
    if (planFilter && plan.destinations.length > 0) {
      rows = rows.filter((s) => plan.destinations.some((d) => inDestination(s, d)));
    }
    if (query) rows = rows.filter((s) => (s.name + s.program + s.place).toLowerCase().includes(query.toLowerCase()));
    return rows;
  }, [tab, query, saved, planFilter, plan]);

  const toggleSave = (s: School) => {
    const isSaved = saved.includes(s.id);
    if (isSaved) {
      setSaved((cur) => cur.filter((id) => id !== s.id));
      toast({ message: `Removed ${s.name} from your list` });
    } else {
      setSaved((cur) => [...cur, s.id]);
      toast({ message: `Saved ${s.name}`, action: { label: "Start application", onClick: () => setStarting(s) } });
    }
  };

  /* Search, the plan filter said in words, the count, then how to look at it. */
  const toolbar = (
    <>
      <SearchField label="Search colleges" value={query} onChange={setQuery} placeholder="Search school, programme or city" />
      {planFilter ? (
        <FilterTag
          label="Plan"
          value={`${plan.field} · ${plan.destinations.length > 0 ? plan.destinations.join(", ") : "Anywhere"}`}
          onEdit={() => setPlanDrawerOpen(true)}
          onRemove={() => setPlanFilter(false)}
        />
      ) : (
        <Chip onClick={() => setPlanFilter(true)}>
          <Target /> Match my plan
        </Chip>
      )}
      <ResultCount>
        {list.length} {list.length === 1 ? "school" : "schools"}
      </ResultCount>
      <Segmented label="Layout" options={VIEWS} value={view} onChange={setView} />
      <Chip>
        <SlidersHorizontal /> Filters
      </Chip>
    </>
  );

  return (
    <Shell
      title="Colleges"
      description="Ranked against your plan, not against a global league table."
      actions={<Button size="sm" variant="primary" onClick={() => setTab("saved")}><Bookmark /> Your list ({saved.length})</Button>}
    >
      <div className="@container flex min-h-0 flex-1 flex-col gap-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "matches", label: "Matches", count: schools.length },
            { value: "saved", label: "Saved", count: saved.length },
          ]}
        />

        {mode === "loading" ? (
          view === "grid" ? (
            <div className={GRID}>
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[300px]" />)}
            </div>
          ) : (
            <TableSkeleton rows={6} />
          )
        ) : view === "grid" && list.length > 0 ? (
          <>
            {/* Cards have no table to hold the controls, so the toolbar is a card of its own. */}
            <Panel>
              <TableToolbar className="border-b-0">{toolbar}</TableToolbar>
            </Panel>
            <ul className={cn("su-stagger", GRID)}>
              {list.map((s) => (
                <SchoolCard
                  key={s.id}
                  school={s}
                  saved={saved.includes(s.id)}
                  onOpen={() => openSchool(s)}
                  onToggleSave={() => toggleSave(s)}
                />
              ))}
            </ul>
          </>
        ) : (
          <DataTable cols={COLS} toolbar={toolbar}>
            {list.length === 0 ? (
              tab === "saved" ? (
                <DataTableEmpty
                  icon={Bookmark}
                  title="No schools saved yet"
                  body="Saving a school keeps its deadline in view. Starting an application turns it into a checklist with drafts and reminders."
                  primary={<Button size="sm" onClick={() => setTab("matches")}>See your matches</Button>}
                />
              ) : query ? (
                <DataTableEmpty
                  icon={Search}
                  title="No schools match your search"
                  body="Try a shorter search term. Your plan filter stays on unless you clear it above."
                  primary={<Button size="sm" onClick={() => setQuery("")}>Clear search</Button>}
                />
              ) : (
                <DataTableEmpty
                  icon={GraduationCap}
                  title="No schools match your current plan"
                  body={`We don't track schools in ${plan.destinations.join(", ") || "your selected criteria"} yet. You can adjust your plan or view all schools.`}
                  primary={
                    <Button size="sm" onClick={() => setPlanDrawerOpen(true)}>
                      <Pencil /> Edit study plan
                    </Button>
                  }
                  secondary={
                    <Button size="sm" variant="ghost" onClick={() => setPlanFilter(false)}>
                      Show all schools
                    </Button>
                  }
                />
              )
            ) : (
              <>
                <DataTableHead>
                  <span>School</span>
                  <span>Admit rate</span>
                  <span>Type</span>
                  <span>Cost after aid</span>
                  <span>Deadline</span>
                  <span>Status</span>
                  <span />
                </DataTableHead>
                <DataTableBody>
                  {list.map((s) => {
                    const isSaved = saved.includes(s.id);
                    return (
                      <DataTableRow key={s.id} onClick={() => openSchool(s)}>
                        <DataTablePrimary
                          lead={<SchoolLogo name={s.name} domain={s.domain} size={32} />}
                          title={
                            /* The row is clickable for the mouse; this button is the keyboard path. */
                            <button onClick={(e) => { e.stopPropagation(); openSchool(s); }} className="max-w-full truncate text-left hover:underline">
                              {s.name}
                            </button>
                          }
                          sub={`${s.program} · ${s.place}`}
                        />
                        <DataTableCell label="Admission rate" mono>{s.accept}</DataTableCell>
                        <DataTableCell label="Institution type">{s.type}</DataTableCell>
                        <DataTableCell label="Avg. cost after aid" mono>{s.costAfterAid}</DataTableCell>
                        <DataTableCell label="Regular decision" mono>{s.deadline}</DataTableCell>
                        <DataTableCell label="Status"><Badge tone={BAND_TONE[s.band]}>{s.band}</Badge></DataTableCell>
                        <DataTableCell narrow="bare" align="end">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-pressed={isSaved}
                            aria-label={isSaved ? `Remove ${s.name} from your list` : `Save ${s.name}`}
                            className={cn("@3xl:size-8 @3xl:px-0", isSaved && "text-ink")}
                            onClick={(e) => { e.stopPropagation(); toggleSave(s); }}
                          >
                            {isSaved ? <BookmarkCheck /> : <Bookmark />}
                            <span className="@3xl:hidden">{isSaved ? "Saved" : "Save"}</span>
                          </Button>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  })}
                </DataTableBody>
              </>
            )}
          </DataTable>
        )}

      </div>

      <Modal
        open={Boolean(starting)}
        onClose={() => setStarting(null)}
        title={starting ? `Start your ${starting.name} application` : ""}
        description="This creates the requirement checklist, adds the deadline to your calendar and opens a draft."
        footer={
          <>
            <Button onClick={() => setStarting(null)}>Not yet</Button>
            <Button variant="primary" onClick={() => { toast({ message: "Application started — 6 requirements added" }); setStarting(null); }}>
              Start application
            </Button>
          </>
        }
      >
        <ul className="flex flex-col gap-1.5 text-[12.5px] text-ink-2">
          {["6 requirements, each with its own due date", "The deadline blocked out in your calendar", "A statement-of-purpose draft in Writing coach", "Interview prep switched to this programme"].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
              {line}
            </li>
          ))}
        </ul>
      </Modal>

      <PlanEditor
        open={planDrawerOpen}
        onClose={() => setPlanDrawerOpen(false)}
        plan={plan}
        onSave={handleSavePlan}
      />
    </Shell>
  );
}
