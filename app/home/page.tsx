"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Mic, Plus, Sparkles } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { DeadlineList } from "@/components/app/deadline-list";
import { DOC_TYPE } from "@/components/app/doc-types";
import { SchoolLogo } from "@/components/app/school-logo";
import { useMode } from "@/components/app/state";
import { applications, docs, nextDrill, setupSteps, student, todayTasks } from "@/components/app/data";
import { TRACKS, readinessOf } from "@/components/app/interview";
import {
  Badge,
  Button,
  Due,
  EmptyState,
  IconTile,
  ListRow,
  Meter,
  MetricStrip,
  Panel,
  PanelHead,
  PanelList,
  RowText,
  Skeleton,
  buttonStyles,
  useToast,
} from "@/components/ui/kit";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const BOX_ILLUSTRATION = { light: "/images/illustratioin/deadline.png", dark: "/images/illustratioin/deadline.png" };

const AREA_TONE = {
  Interview: "accent",
  Essay: "pink",
  Application: "lilac",
  Test: "warn",
  Admin: "neutral",
} as const;

const DOC_TONE = { Draft: "neutral", "In review": "accent", Final: "good" } as const;

/* A panel's "see all" link: a small ghost pill, the same on every card. */
const MORE = buttonStyles({ variant: "ghost", size: "sm" });

/* Sticker colours, cycled through the setup steps. */
const DOTS = ["bg-sun", "bg-pink", "bg-sky", "bg-mint", "bg-lilac", "bg-coral"] as const;

/* The landing page's hero, at dashboard size: a dotted sky card, the greeting
   in the display face with the name on a tilted sun pill, and stickers. */
function Hero({ eyebrow, lede, children }: { eyebrow: string; lede: string; children?: React.ReactNode }) {
  return (
    <section className="su-pat-dots relative overflow-hidden rounded-[28px] bg-sky-soft px-6 py-7 [--pc:rgba(66,190,252,0.22)] sm:px-9 sm:py-9 dark:[--pc:rgba(66,190,252,0.12)]">
      <div className="relative z-[1] max-w-[560px]">
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-surface px-3.5 text-[12.5px] font-medium text-ink-2 shadow-e1">
          <i aria-hidden className="size-2 rounded-full bg-mint shadow-[0_0_0_4px_color-mix(in_oklab,var(--mint)_25%,transparent)]" />
          {eyebrow}
        </span>
        <h1 className="su-display mt-4 text-[clamp(32px,4.2vw,50px)] leading-[1.02]">
          {getGreeting()},{" "}
          <span className="inline-block -rotate-[1.5deg] rounded-[0.28em] bg-sun px-[0.18em] text-[#17161c]">{student.first}</span>
        </h1>
        <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">{lede}</p>
        {children ? <div className="mt-6 flex flex-wrap gap-2.5">{children}</div> : null}
      </div>
      {/* eslint-disable @next/next/no-img-element -- fixed local stickers, not content */}
      <img
        src="/images/stickers/calendar.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[22%] top-1/2 hidden w-[150px] -translate-y-1/2 -rotate-6 drop-shadow-[0_14px_18px_rgba(23,22,28,0.16)] lg:block xl:right-[24%]"
      />
      <img
        src="/images/stickers/progress.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-2 right-4 hidden w-[120px] rotate-6 drop-shadow-[0_14px_18px_rgba(23,22,28,0.16)] md:block xl:right-10 xl:w-[140px]"
      />
      {/* eslint-enable @next/next/no-img-element */}
    </section>
  );
}

export default function TodayPage() {
  const { mode } = useMode();
  const toast = useToast();
  const [tasks, setTasks] = React.useState(todayTasks);
  const router = useRouter();
  // Straight into the interview room on the weakest section — no mic-check detour.
  const startDrill = () => router.push("/prep?start=f1&section=finance");

  const openTasks = tasks.filter((t) => !t.done);
  const minutes = openTasks.reduce((s, t) => s + t.minutes, 0);

  const toggle = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (target && !target.done) {
      toast({ message: `Done: ${target.title}`, action: { label: "Undo", onClick: () => toggle(id) } });
    }
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  return (
    <Shell
      emoji="👋"
      title={`${getGreeting()}, ${student.first}!`}
      description={
        mode === "new"
          ? "Four steps and the rest of the app fills itself in — deadlines, drafts and interview prep all follow from them."
          : `${getFormattedDate()} · ${openTasks.length} things left, about ${minutes} minutes.`
      }
    >
      {mode === "loading" ? <TodayLoading /> : mode === "new" ? <FirstRun /> : (
        <div className="su-stagger flex flex-col gap-5">
          <Hero eyebrow={getFormattedDate()} lede={`${openTasks.length} things left today, about ${minutes} minutes. Your F-1 visa drill is first — it's the section you're weakest on.`}>
            <Button variant="ink" onClick={startDrill}><Mic /> Start today&rsquo;s drill</Button>
            <Button><Plus /> Add task</Button>
          </Hero>

          <MetricStrip
            items={[
              { label: "Applications open", value: "4", hint: "1 ready to submit" },
              { label: "Next deadline", value: "14d", hint: "Graduate Merit Award" },
              { label: "Documents in draft", value: "3", hint: "1 waiting on review" },
              { label: "Interview readiness", value: "58%", hint: "F-1 visa · +12 this month" },
            ]}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-5">
              {/* Do next */}
              <Panel>
                <PanelHead
                  title="Do next"
                  hint="Ordered by what closes first, then by what unblocks other work."
                  action={<Button size="sm" variant="ghost">Re-plan</Button>}
                />
                <PanelList>
                  {tasks.map((t) => (
                    <ListRow key={t.id} interactive className="group">
                      <button
                        onClick={() => toggle(t.id)}
                        aria-pressed={t.done}
                        aria-label={t.done ? `Mark ${t.title} as not done` : `Mark ${t.title} as done`}
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-spring)] active:scale-90",
                          t.done ? "border-mint bg-mint text-[#17161c]" : "border-line-strong bg-surface hover:scale-110 hover:border-ink-3",
                        )}
                      >
                        {t.done ? <Check className="size-3" strokeWidth={3} /> : null}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-[13.5px] tracking-[-0.15px]", t.done ? "text-ink-3 line-through" : "font-semibold")}>{t.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-3">
                          <span className="truncate">{t.meta}</span>
                          <span className="font-mono">{t.minutes}m</span>
                          <Badge tone={AREA_TONE[t.area]}>{t.area}</Badge>
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                        Open <ArrowRight />
                      </Button>
                    </ListRow>
                  ))}
                </PanelList>
                <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-3 text-[12px] text-ink-3">
                  <span>{openTasks.length} open · {minutes} min</span>
                  <Link href="/calendar" className="font-medium text-accent hover:underline">Block this in your calendar</Link>
                </div>
              </Panel>

              {/* Applications snapshot */}
              <Panel>
                <PanelHead
                  title="Applications"
                  hint="Every school you are actually applying to, with what is left to do."
                  action={<Link href="/applications" className={MORE}>All four <ArrowRight /></Link>}
                />
                <PanelList>
                  {applications.slice(0, 3).map((a) => (
                    <ListRow key={a.id} interactive>
                      <SchoolLogo name={a.school} domain={a.domain} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13.5px] font-semibold tracking-[-0.15px]">{a.school}</p>
                          <Badge tone={a.stage === "Ready" ? "good" : a.stage === "Planning" ? "neutral" : "accent"}>{a.stage}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] text-ink-3">{a.program} · next: {a.next}</p>
                        <div className="mt-2 flex max-w-[260px] items-center gap-2.5">
                          <Meter value={(a.done / a.total) * 100} tone={a.stage === "Ready" ? "good" : "accent"} />
                          <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-ink-2">{a.done}/{a.total}</span>
                        </div>
                      </div>
                      <Due date={a.deadline} days={a.daysLeft} className="shrink-0 text-right" />
                    </ListRow>
                  ))}
                </PanelList>
              </Panel>

              <div className="grid gap-5 md:grid-cols-2">
                <Panel>
                <PanelHead title="Interview readiness" action={<Link href="/prep" className={MORE}>Practise</Link>} />
                <ul className="flex flex-col gap-3.5 px-4 py-3.5">
                  {TRACKS.filter((t) => readinessOf(t) !== null).map((t) => {
                    const r = readinessOf(t) ?? 0;
                    return (
                      <li key={t.id}>
                        <Link href={`/prep?start=${t.id}`} className="group flex items-baseline justify-between gap-2">
                          <p className="flex items-center gap-2 truncate text-[13px] font-medium group-hover:underline">
                            <i aria-hidden className={cn("size-2 shrink-0 rounded-full", t.dot)} />
                            {t.name}
                          </p>
                          <span className="shrink-0 text-[12px] text-ink-3 opacity-0 transition-opacity group-hover:opacity-100">Start →</span>
                        </Link>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Meter value={r} tone={r >= 70 ? "good" : r >= 50 ? "accent" : "warn"} />
                          <span className="w-8 shrink-0 text-right font-mono text-[11.5px] tabular-nums">{r}%</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                </Panel>

                <Panel>
                <PanelHead title="Recent documents" action={<Link href="/documents" className={MORE}>All</Link>} />
                <PanelList>
                  {docs.slice(0, 3).map((d) => (
                    <ListRow key={d.id} interactive>
                      <IconTile icon={DOC_TYPE[d.type].icon} tone={DOC_TYPE[d.type].tone} />
                      <RowText title={<Link href={`/documents/${d.id}`} className="hover:underline">{d.title}</Link>} sub={d.updated} />
                      <Badge tone={DOC_TONE[d.state]}>{d.state}</Badge>
                    </ListRow>
                  ))}
                </PanelList>
                </Panel>
              </div>
            </div>

            {/* Right rail */}
            <div className="flex min-w-0 flex-col gap-5">
              {/* A lilac sticker card, like the landing page's toolkit tiles. */}
              <section className="su-pat-dots relative overflow-hidden rounded-card bg-lilac-soft p-5 [--pc:rgba(169,139,255,0.25)] dark:[--pc:rgba(169,139,255,0.12)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- a fixed local sticker, not content */}
                <img
                  src="/images/stickers/interview.webp"
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute -right-3 -top-2 w-[104px] rotate-6 drop-shadow-[0_10px_14px_rgba(23,22,28,0.18)]"
                />
                <span className="relative inline-flex h-7 items-center gap-1.5 rounded-full bg-surface px-3 text-[12px] font-medium text-ink-2 shadow-e1">
                  <Sparkles className="size-3.5 text-lilac" /> Today&rsquo;s drill
                </span>
                <p className="su-display relative mt-4 max-w-[12ch] text-[24px] leading-[1.05]">{nextDrill.section}</p>
                <p className="mt-1.5 text-[12.5px] text-ink-2">{nextDrill.track} · {nextDrill.questions} questions · ~{nextDrill.minutes} min</p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-2">{nextDrill.reason}</p>
                <Button variant="ink" className="mt-4 w-full" onClick={startDrill}><Mic /> Start drill</Button>
              </section>

              <DeadlineList />

            </div>
          </div>
        </div>
      )}

    </Shell>
  );
}

function FirstRun() {
  const done = setupSteps.filter((s) => s.done).length;
  return (
    <div className="su-stagger flex flex-col gap-5">
    <Hero eyebrow="Free to start · about 10 minutes" lede="Four steps and the rest of the app fills itself in — deadlines, drafts and interview prep all follow from them." />
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Panel>
        <PanelHead title="Set up your plan" hint={`${done} of ${setupSteps.length} done · about 10 minutes`} action={<Badge tone="accent">{done}/{setupSteps.length}</Badge>} />
        <ol className="divide-y divide-line-soft">
          {setupSteps.map((s, i) => (
            <li key={s.id} className="flex items-start gap-3 px-4 py-3">
              <span className={cn("su-display grid size-7 shrink-0 place-items-center rounded-full text-[13px] text-[#17161c]", s.done ? "bg-mint" : DOTS[i % DOTS.length])}>
                {s.done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-[13.5px] font-semibold tracking-[-0.15px]", s.done && "font-medium text-ink-3 line-through")}>{s.title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-2">{s.body}</p>
              </div>
              {!s.done && i === 1 ? <Button size="sm" variant="ink">Start <ArrowRight /></Button> : null}
            </li>
          ))}
        </ol>
      </Panel>

      <div className="flex flex-col gap-5">
        <EmptyState
          illustration={BOX_ILLUSTRATION}
          title="No deadlines yet"
          body="Save a school or an award and its dates land here and on your calendar automatically."
          primary={
            <Link href="/colleges" className={buttonStyles({ size: "sm" })}>
              Browse colleges
            </Link>
          }
        />
        <EmptyState
          illustration={{ light: "/images/illustratioin/progess.png", dark: "/images/illustratioin/progess.png" }}
          title="Nothing in progress"
          body="Once you start an application, the next thing to do always shows up here."
        />
      </div>
    </div>
    </div>
  );
}

function TodayLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-[230px] rounded-[28px]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[112px] rounded-card" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[260px] rounded-card" />
          <Skeleton className="h-[200px] rounded-card" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[150px] rounded-card" />
          <Skeleton className="h-[190px] rounded-card" />
        </div>
      </div>
    </div>
  );
}
