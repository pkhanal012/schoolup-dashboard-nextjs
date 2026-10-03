"use client";

import * as React from "react";
import { Check, HandCoins, PenLine, Search, ShieldCheck, X } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { SchoolLogo } from "@/components/app/school-logo";
import { useMode } from "@/components/app/state";
import { awards, type Award } from "@/components/app/data";
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
  Due,
  Inset,
  Modal,
  ResultCount,
  TableSkeleton,
  Tabs,
  useToast,
} from "@/components/ui/kit";

type Tab = "matches" | "tracked";

/* One template shared by the header and every row, so the columns line up. */
const COLS = "@3xl:grid-cols-[minmax(0,1fr)_160px_112px_112px]";

export default function ScholarshipsPage() {
  const { mode } = useMode();
  const toast = useToast();
  const [tab, setTab] = React.useState<Tab>("matches");
  const [onlyEligible, setOnlyEligible] = React.useState(true);
  const [noEssay, setNoEssay] = React.useState(false);
  const [tracked, setTracked] = React.useState<string[]>([]);
  const [detail, setDetail] = React.useState<Award | null>(null);

  React.useEffect(() => {
    setTracked(mode === "new" ? [] : awards.filter((a) => a.tracked).map((a) => a.id));
  }, [mode]);

  const rows = React.useMemo(() => {
    let list = awards;
    if (tab === "tracked") list = list.filter((a) => tracked.includes(a.id));
    if (onlyEligible) list = list.filter((a) => a.eligible);
    if (noEssay) list = list.filter((a) => !a.essay);
    return list;
  }, [tab, onlyEligible, noEssay, tracked]);

  const potential = awards.filter((a) => tracked.includes(a.id)).reduce((s, a) => s + a.amountUsd, 0);

  const toggleTrack = (a: Award) => {
    const isTracked = tracked.includes(a.id);
    if (isTracked) {
      setTracked((cur) => cur.filter((id) => id !== a.id));
      toast({ message: `Stopped tracking ${a.name}` });
    } else {
      setTracked((cur) => [...cur, a.id]);
      toast({ message: `Tracking ${a.name} — deadline added to your calendar` });
    }
  };

  return (
    <Shell
      title="Scholarships"
      description="Only awards you can actually win — each one says why it matched."
      actions={
        <span className="hidden h-8 items-center gap-1.5 rounded-full bg-sun-soft px-3.5 text-[12.5px] sm:inline-flex">
          <span className="text-ink-2">Potential</span>
          <span className="font-mono font-semibold tabular-nums">${potential.toLocaleString()}</span>
        </span>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "matches", label: "Matches", count: awards.filter((a) => a.eligible).length },
            { value: "tracked", label: "Tracking", count: tracked.length },
          ]}
        />

        {mode === "loading" ? (
          <TableSkeleton />
        ) : (
          <DataTable
            cols={COLS}
            toolbar={
              <>
                <Chip active={onlyEligible} onClick={() => setOnlyEligible((v) => !v)}>
                  <ShieldCheck /> Eligible only
                </Chip>
                <Chip active={noEssay} onClick={() => setNoEssay((v) => !v)}>
                  <PenLine /> No essay needed
                </Chip>
                <ResultCount>
                  {rows.length} shown{onlyEligible ? ` · ${awards.length - awards.filter((a) => a.eligible).length} hidden as ineligible` : ""}
                </ResultCount>
              </>
            }
          >
            {rows.length === 0 ? (
              tab === "tracked" ? (
                <DataTableEmpty
                  icon={HandCoins}
                  title="Nothing tracked yet"
                  body="Track an award and its deadline, essay and status live alongside your applications."
                  primary={<Button size="sm" variant="primary" onClick={() => setTab("matches")}>See matches</Button>}
                />
              ) : (
                <DataTableEmpty
                  icon={Search}
                  title="No awards match those filters"
                  body="Turn off a filter to widen the search. Ineligible awards stay hidden unless you ask for them."
                  primary={<Button size="sm" onClick={() => { setOnlyEligible(false); setNoEssay(false); }}>Clear filters</Button>}
                />
              )
            ) : (
            <>
              <DataTableHead>
                <span>Scholarship</span>
                <span>Value</span>
                <span>Closes</span>
                <span />
              </DataTableHead>

              <DataTableBody>
                {rows.map((a) => {
                  const isTracked = tracked.includes(a.id);
                  return (
                    <DataTableRow key={a.id} muted={!a.eligible}>
                      {/* The university's mark, so an award is placed at a glance
                          — the same tile the colleges list uses. */}
                      <DataTablePrimary
                        lead={<SchoolLogo name={a.provider} domain={a.providerDomain} size={32} />}
                        title={
                          <button onClick={() => setDetail(a)} className="max-w-full truncate text-left hover:underline">
                            {a.name}
                          </button>
                        }
                        extra={
                          <span className="hidden shrink-0 items-center gap-1.5 sm:flex">
                            {a.essay ? <Badge>Essay</Badge> : <Badge tone="good">No essay</Badge>}
                            {!a.eligible ? <Badge tone="bad">Not eligible</Badge> : null}
                          </span>
                        }
                        sub={
                          <span className="flex min-w-0 items-center gap-1.5">
                            {a.eligible ? <Check className="size-3.5 shrink-0 text-good" /> : <X className="size-3.5 shrink-0 text-bad" />}
                            <span className="truncate">
                              <span className="text-ink-2">{a.provider}</span> · {a.why}
                            </span>
                          </span>
                        }
                      />
                      <DataTableCell label="Value" className="font-medium">{a.amount}</DataTableCell>
                      <DataTableCell label="Closes"><Due date={a.deadline} days={a.daysLeft} /></DataTableCell>
                      <DataTableCell narrow="bare" align="end">
                        <Button size="sm" disabled={!a.eligible} onClick={() => toggleTrack(a)}>
                          {isTracked ? <Check className="text-good" /> : null}
                          {isTracked ? "Tracking" : "Track"}
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
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        width={520}
        title={detail?.name ?? ""}
        description={detail ? `${detail.provider} · closes ${detail.deadline}` : ""}
        footer={
          <>
            <Button onClick={() => setDetail(null)}>Close</Button>
            <Button variant="primary" onClick={() => { if (detail) toggleTrack(detail); setDetail(null); }}>
              {detail && tracked.includes(detail.id) ? "Stop tracking" : "Track this award"}
            </Button>
          </>
        }
      >
        {detail ? (
          <div className="flex flex-col gap-2">
            <Inset label="Why this matched you">{detail.why}</Inset>
            <Inset label="What it asks for">
              {detail.essay ? "A 600-word essay, reusable from your statement of purpose." : "No separate essay — it uses your application."}
            </Inset>
          </div>
        ) : null}
      </Modal>
    </Shell>
  );
}
