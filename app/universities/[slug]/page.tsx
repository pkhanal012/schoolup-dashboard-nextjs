import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Plus, Target } from "lucide-react";
import { SchoolLogo } from "@/components/app/school-logo";
import { blobPath } from "@/components/landing2/parts";
import {
  OPEN_SCHOLARSHIPS,
  REGION_TONE,
  UNIVERSITIES,
  getUniversity,
  money,
  percent,
  place,
  selectivity,
  shortDate,
  similarTo,
  type University,
} from "@/components/universities/data";
import { PageMotion } from "@/components/universities/page-motion";
import { DateLine, DaysLeft, SectionTabs } from "@/components/universities/profile-parts";
import { SiteFooter, SiteNav } from "@/components/universities/site-chrome";
import { UniversityRow } from "@/components/universities/university-row";
import "@/components/landing2/landing2.css";
import "@/components/universities/universities.css";

/*
 * A university profile: a pastel, dotted header in the school's region colour
 * with a sticker and colour-coded headline numbers, then plain label/value
 * sections — each marked by a small spinning shape — beside a sunny summary.
 * Structure stays quiet; colour and shapes carry the landing page's tone.
 */

/* Pastel pairs [soft, strong] and the shapes that mark each section. */
const PALETTE = {
  sun: ["var(--sun-soft)", "var(--sun)"],
  pink: ["var(--pink-soft)", "var(--pink)"],
  sky: ["var(--sky-soft)", "var(--sky)"],
  mint: ["var(--mint-soft)", "var(--mint)"],
  lilac: ["var(--lilac-soft)", "var(--lilac)"],
  coral: ["var(--coral-soft)", "var(--coral)"],
} as const;
type Tone = keyof typeof PALETTE;
const SHAPES = [blobPath(9, 0.1), blobPath(14, 0.05), blobPath(6, 0.16), blobPath(12, 0.13)];

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-l2-display", display: "swap" });

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return UNIVERSITIES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const u = getUniversity((await params).slug);
  if (!u) return {};
  return {
    title: `${u.name} Acceptance Rate & Deadlines 2027 | SchoolUp`,
    description: `${u.name}${u.accept !== null ? ` has an acceptance rate of ${u.accept}%` : ""}. 2027 entry deadlines, tuition, application fee and admission requirements.`,
  };
}

const NOT_PUBLISHED = <span className="text-[var(--ink-3)]">Not published</span>;

const fee = (u: University) => (u.detail?.fee === undefined ? null : u.detail.fee === 0 ? "Free" : money(u.detail.fee, false));

export default async function UniversityPage({ params }: Props) {
  const u = getUniversity((await params).slug);
  if (!u) notFound();

  const d = u.detail ?? {};
  const similar = similarTo(u);
  const sections = [
    { id: "overview", label: "Overview" },
    { id: "dates", label: "Key dates" },
    { id: "cost", label: "Tuition & cost" },
    { id: "requirements", label: "Requirements" },
    ...(d.degrees || d.majors ? [{ id: "majors", label: "Majors" }] : []),
    { id: "scholarships", label: "Scholarships" },
    { id: "faq", label: "FAQ" },
  ];

  const stats = [
    { label: "Acceptance rate", value: percent(u.accept), count: u.accept, suffix: "%", tone: "sun" as Tone },
    { label: "Tuition / year", value: money(u.tuition, false), count: u.tuition, prefix: "$", tone: "pink" as Tone },
    { label: "Deadline", value: u.deadline ? shortDate(u.deadline) : "Rolling", tone: "coral" as Tone },
    { label: "Undergrads", value: d.size ? d.size.toLocaleString("en-US") : "—", count: d.size, tone: "mint" as Tone },
    { label: "Application fee", value: fee(u) ?? "—", tone: "lilac" as Tone },
  ] as { label: string; value: string; count?: number | null; prefix?: string; suffix?: string; tone: Tone }[];

  return (
    <div className={display.variable}>
      <div className="l2">
        <PageMotion />
        <SiteNav active="/universities" />

        <main>
          {/* --------------------------------------------------- Header
              One full-bleed pastel band in the region's colour, from the top
              of the page (behind the floating nav) down to the tab bar. */}
          <section
            className="l2-pat-dots relative overflow-hidden pb-14 pt-[124px] md:pb-20 md:pt-[148px]"
            style={{ backgroundColor: REGION_TONE[u.region].soft, ["--pc" as string]: REGION_TONE[u.region].pc }}
          >
            <div className="l2-wrap relative">
            <nav data-u-hero aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13.5px] text-[var(--ink-3)]">
              <Link href="/universities" className="transition-colors hover:text-[var(--ink)]">
                Universities
              </Link>
              <ChevronRight className="size-3.5" />
              <span className="truncate text-[var(--ink-2)]">{u.name}</span>
            </nav>

            <div className="relative mt-10 md:mt-12">
              {/* A sticker floating at the right, as on the landing page. */}
              <div data-u-pop className="pointer-events-none absolute -top-16 right-[2%] hidden w-[150px] md:block lg:w-[180px]" aria-hidden>
                <div data-u-float>
                  <Image src="/images/stickers/university.webp" alt="" width={561} height={556} className="h-auto w-full rotate-6 drop-shadow-[0_14px_18px_rgba(23,22,28,0.18)]" preload />
                </div>
              </div>

              <div data-u-hero className="relative flex items-center gap-5 md:max-w-[70%]">
                <span className="grid size-[72px] shrink-0 place-items-center rounded-[22px] bg-white shadow-[0_10px_22px_-12px_rgba(23,22,28,0.35)]">
                  <SchoolLogo name={u.name} domain={u.domain} size={52} className="rounded-[14px] ring-0" />
                </span>
                <div className="min-w-0">
                  <h1 className="l2-display text-[clamp(30px,4vw,50px)] leading-[1.04]">{u.name}</h1>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-[14.5px] text-[var(--ink-2)]">
                    <span className="rounded-full bg-white/85 px-2.5 py-0.5">
                      {u.type} university · {place(u)}
                    </span>
                    {d.rank && <span className="rounded-full bg-[var(--sun)] px-2.5 py-0.5 text-[13px] font-semibold text-[var(--ink)]">#{d.rank} worldwide</span>}
                  </p>
                </div>
              </div>

              {/* Headline numbers: white tiles, each with its own colour dot. */}
              <dl data-u-hero className="relative mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:mt-16 lg:grid-cols-5">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-[20px] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(23,22,28,0.05)]">
                    <dt className="flex items-center gap-2 text-[12.5px] font-medium text-[var(--ink-2)]">
                      <i className="size-2 rounded-full" style={{ background: PALETTE[s.tone][1] }} aria-hidden />
                      {s.label}
                    </dt>
                    <dd className="l2-display mt-1.5 text-[clamp(22px,2.2vw,28px)] tabular-nums tracking-[-0.03em]">
                      {s.count != null ? (
                        <span data-u-count={s.count} data-prefix={s.prefix} data-suffix={s.suffix}>
                          {s.value}
                        </span>
                      ) : (
                        s.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            </div>
          </section>

          {/* Straight after the band, outside it: a sticky element only sticks within its parent. */}
          <SectionTabs sections={sections} />

          {/* -------------------------------------------- Body + summary */}
          <div className="l2-wrap mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-16">
              <Overview u={u} />
              <Dates u={u} />
              <Cost u={u} />
              <Requirements u={u} />
              {(d.degrees || d.majors) && <Majors u={u} />}
              <Scholarships />
              {similar.length > 0 && (
                <Section id="similar" tone="sky" shape={2} title={`More in ${u.region === "Europe" || u.region === "Asia" ? u.region : u.country}`}>
                  <div data-u-reveal className="divide-y divide-[var(--line)] overflow-hidden rounded-[18px] shadow-[0_0_0_1px_var(--line)]">
                    {similar.map((s) => (
                      <UniversityRow key={s.slug} u={s} compact />
                    ))}
                  </div>
                  <Link href="/universities" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)]">
                    All universities <ArrowRight className="size-4" />
                  </Link>
                </Section>
              )}
              <Faq u={u} />
            </div>

            <Summary u={u} />
          </div>

          {/* The closing strip: sunny, with a sticker peeking in. */}
          <div className="l2-wrap mt-20 pb-24">
            <div data-u-reveal className="l2-pat-dots relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[32px] bg-[var(--sun)] px-7 py-8 [--pc:rgba(255,255,255,0.35)] md:flex-row md:items-center md:px-10">
              <div className="relative z-[1]">
                <p className="l2-display text-[clamp(24px,2.6vw,34px)] leading-[1.1]">Applying to {u.name}?</p>
                <p className="mt-1.5 max-w-[46ch] text-[15px] text-[rgba(23,22,28,0.75)]">SchoolUp keeps the checklist, essays and deadline in one place — free to start.</p>
              </div>
              <Link href="/signup" className="l2-btn relative z-[1] shrink-0 md:mr-[150px]">
                Start free <ArrowRight strokeWidth={2.4} />
              </Link>
              <Image src="/images/stickers/deadline.webp" alt="" width={365} height={590} aria-hidden className="pointer-events-none absolute -bottom-10 right-6 hidden h-auto w-[110px] rotate-12 drop-shadow-[0_14px_18px_rgba(23,22,28,0.2)] md:block" />
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- Building blocks */

function Section({ id, title, tone, shape = 0, children }: { id: string; title: string; tone: Tone; shape?: number; children: React.ReactNode }) {
  return (
    <section id={id} className="u-section">
      <h2 data-u-reveal className="l2-display flex items-center gap-3 text-[clamp(22px,2vw,26px)] tracking-[-0.03em]">
        <svg data-u-spin viewBox="0 0 200 200" className="size-7 shrink-0" aria-hidden>
          <path d={SHAPES[shape % SHAPES.length]} fill={PALETTE[tone][1]} />
        </svg>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Label / value rows with hairlines — the spec-sheet pattern. */
function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl data-u-reveal className="border-t border-[var(--line)]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6 border-b border-[var(--line)] py-3.5 text-[15px] md:grid-cols-[220px_minmax(0,1fr)]">
          <dt className="text-[var(--ink-2)]">{k}</dt>
          <dd className="font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div data-u-reveal className="flex max-w-[64ch] flex-col gap-3 text-[16px] leading-[1.65] text-[var(--ink-2)]">
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- Sections */

function Overview({ u }: { u: University }) {
  const d = u.detail ?? {};
  return (
    <Section id="overview" tone="sun" shape={0} title="Overview">
      <Prose>
        {d.about?.map((p) => <p key={p}>{p}</p>)}
        <p>
          {u.accept !== null ? (
            <>
              {u.name} admits <b className="text-[var(--ink)]">{u.accept}%</b> of applicants — about {u.accept} in every 100, which makes it {selectivity(u.accept).toLowerCase()}.
            </>
          ) : (
            <>{u.name} does not publish an acceptance rate.</>
          )}{" "}
          {u.deadline ? (
            <>
              Applications for 2027 entry close on <b className="text-[var(--ink)]">{shortDate(u.deadline)}</b>.
            </>
          ) : (
            <>Admissions are rolling, so earlier is better.</>
          )}
        </p>
      </Prose>
      <div className="mt-6">
        <Facts
          rows={[
            ["Type", `${u.type} university`],
            ["Location", place(u)],
            ["Campus", `${u.setting}`],
            ["Undergraduates", d.size ? d.size.toLocaleString("en-US") : NOT_PUBLISHED],
            ["Application platform", u.system ?? NOT_PUBLISHED],
            ...(d.aka?.length ? ([["Also known as", d.aka.join(", ")]] as [string, React.ReactNode][]) : []),
          ]}
        />
      </div>
    </Section>
  );
}

function Dates({ u }: { u: University }) {
  const d = u.detail ?? {};
  return (
    <Section id="dates" tone="sky" shape={1} title="Key dates">
      {u.deadline && d.opens ? (
        <div data-u-reveal>
          <DateLine opens={d.opens} deadline={u.deadline} opensLabel={shortDate(d.opens)} deadlineLabel={shortDate(u.deadline)} />
        </div>
      ) : null}
      <Facts
        rows={[
          ["Application opens", d.opens ? shortDate(d.opens) : NOT_PUBLISHED],
          [
            "Regular deadline",
            u.deadline ? (
              <span className="flex flex-wrap items-center gap-2">
                {shortDate(u.deadline)}
                <DaysLeft deadline={u.deadline} className="rounded-full bg-[var(--coral-soft)] px-2 py-0.5 text-[12px] font-semibold text-[#c0433d]" />
              </span>
            ) : (
              "Rolling — reviewed as applications arrive"
            ),
          ],
        ]}
      />
      <p data-u-reveal className="mt-4 text-[14px] text-[var(--ink-2)]">
        Get reminders 30 days, 7 days and 24 hours before it closes.{" "}
        <Link href="/signup" className="font-medium text-[var(--ink)] underline decoration-[var(--line)] decoration-2 underline-offset-4 hover:decoration-[var(--ink)]">
          Set reminders
        </Link>
      </p>
    </Section>
  );
}

function Cost({ u }: { u: University }) {
  const d = u.detail ?? {};
  const f = fee(u);
  return (
    <Section id="cost" tone="pink" shape={2} title="Tuition & cost">
      <Facts
        rows={[
          ["Published tuition", u.tuition !== null ? `${money(u.tuition, false)} per year` : NOT_PUBLISHED],
          ["Average net price after aid", d.netPrice ? `${money(d.netPrice, false)} per year` : NOT_PUBLISHED],
          ["Application fee", f ?? NOT_PUBLISHED],
          ["Fee waiver", NOT_PUBLISHED],
        ]}
      />
      <a data-u-reveal href="#scholarships" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)]">
        See open scholarships <ArrowRight className="size-4" />
      </a>
    </Section>
  );
}

function Requirements({ u }: { u: University }) {
  const reqs = u.detail?.requirements;
  return (
    <Section id="requirements" tone="mint" shape={3} title="Requirements">
      {reqs?.length ? (
        <ol data-u-reveal className="border-t border-[var(--line)]">
          {reqs.map((r, i) => (
            <li key={r.title} className="flex gap-4 border-b border-[var(--line)] py-4">
              <span className="l2-display grid size-8 shrink-0 place-items-center rounded-full text-[14px] tabular-nums" style={{ background: Object.values(PALETTE)[i % 6][1] }}>
                {i + 1}
              </span>
              <div>
                <p className="text-[15px] font-semibold">{r.title}</p>
                <p className="mt-0.5 text-[14.5px] text-[var(--ink-2)]">{r.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div data-u-reveal className="flex flex-col items-start justify-between gap-4 rounded-[18px] bg-[var(--soft)] px-5 py-4 md:flex-row md:items-center">
          <p className="text-[15px] text-[var(--ink-2)]">We have not published {u.name}&rsquo;s checklist yet. Save the school and it lands in your plan when it&rsquo;s in.</p>
          <Link href="/signup" className="l2-btn l2-btn--sm l2-btn--ghost shrink-0">
            <Plus strokeWidth={2.4} /> Save school
          </Link>
        </div>
      )}
    </Section>
  );
}

function Majors({ u }: { u: University }) {
  const d = u.detail ?? {};
  return (
    <Section id="majors" tone="lilac" shape={0} title="Degrees & majors">
      <Facts
        rows={[
          ...(d.degrees ? ([["Degree levels", <Chips key="d" items={d.degrees} />]] as [string, React.ReactNode][]) : []),
          ...(d.majors ? ([["Popular majors", <Chips key="m" items={d.majors} />]] as [string, React.ReactNode][]) : []),
        ]}
      />
    </Section>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((x, i) => (
        <span key={x} className="rounded-full px-2.5 py-1 text-[13.5px] font-medium" style={{ background: Object.values(PALETTE)[(i + 2) % 6][0] }}>
          {x}
        </span>
      ))}
    </span>
  );
}

function Scholarships() {
  return (
    <Section id="scholarships" tone="coral" shape={1} title="Open scholarships">
      <ul data-u-reveal className="border-t border-[var(--line)]">
        {OPEN_SCHOLARSHIPS.map((s) => (
          <li key={s.name} className="flex flex-col gap-1 border-b border-[var(--line)] py-3.5 md:flex-row md:items-center md:gap-6">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{s.name}</p>
              <p className="truncate text-[13.5px] text-[var(--ink-3)]">{s.school}</p>
            </div>
            <p className="text-[14px] text-[var(--ink-2)] md:w-[34%]">{s.amount}</p>
            <span className={`w-max rounded-full px-2 py-0.5 text-[12px] font-semibold ${s.kind === "Need-based" ? "bg-[var(--mint-soft)]" : "bg-[var(--sun-soft)]"}`}>{s.kind}</span>
          </li>
        ))}
      </ul>
      <Link href="/signup" className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ink-2)] hover:text-[var(--ink)]">
        Match scholarships to my profile <ArrowRight className="size-4" />
      </Link>
    </Section>
  );
}

function Faq({ u }: { u: University }) {
  const d = u.detail ?? {};
  const qa = [
    {
      q: `What is the acceptance rate at ${u.name}?`,
      a: u.accept !== null ? `About ${u.accept}%, which makes it ${selectivity(u.accept).toLowerCase()}.` : `${u.name} does not publish an acceptance rate.`,
    },
    {
      q: `How much is tuition at ${u.name}?`,
      a: u.tuition !== null ? `Published tuition is ${money(u.tuition, false)} per year before aid. Scholarships and grants can lower what you pay.` : `Tuition for 2027 entry is not in our catalog yet.`,
    },
    {
      q: `When is the application deadline?`,
      a: u.deadline ? `Applications for 2027 entry close on ${shortDate(u.deadline)}.${d.opens ? ` The portal opened on ${shortDate(d.opens)}.` : ""}` : `Applications are reviewed on a rolling basis — apply early.`,
    },
    {
      q: `How do I apply to ${u.name}?`,
      a: `${u.system && u.system !== "Other system" ? `Apply through ${u.system === "Direct application" ? "the university's own application form" : u.system}. ` : "Apply through the university's admissions portal. "}Have your transcript, references, English test results and any essays ready — SchoolUp keeps the checklist and deadline in one place.`,
    },
  ];
  return (
    <Section id="faq" tone="sun" shape={3} title="FAQ">
      <div data-u-reveal className="border-t border-[var(--line)]">
        {qa.map((item) => (
          <details key={item.q} className="u-faq border-b border-[var(--line)]">
            <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-[15.5px] font-semibold">
              {item.q}
              <Plus className="u-faq-icon size-4 shrink-0 text-[var(--ink-2)] transition-[rotate] duration-300" strokeWidth={2.4} />
            </summary>
            <p className="pb-5 pr-8 text-[15px] leading-[1.6] text-[var(--ink-2)]">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------------------------------- Sticky summary */

function Summary({ u }: { u: University }) {
  const f = fee(u);
  const rows: [string, React.ReactNode][] = [
    ["Acceptance", percent(u.accept)],
    ["Tuition", u.tuition !== null ? `${money(u.tuition)} / yr` : "—"],
    ["Application fee", f ?? "—"],
    ["Platform", u.system ?? "—"],
  ];
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[150px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_var(--line),0_24px_48px_-30px_rgba(23,22,28,0.3)]">
        {/* Sunny top: the deadline, with a flower turning behind it. */}
        <div className="l2-pat-dots relative overflow-hidden bg-[var(--sun-soft)] px-5 pb-5 pt-5 [--pc:rgba(255,196,0,0.3)]">
          <svg data-u-spin viewBox="0 0 200 200" className="absolute -right-8 -top-8 size-28 opacity-90" aria-hidden>
            <path d={SHAPES[0]} fill="var(--sun)" />
          </svg>
          <p className="relative text-[13px] font-medium text-[var(--ink-2)]">{u.deadline ? "Applications close" : "Admissions"}</p>
          <p className="l2-display relative mt-1 text-[26px] tracking-[-0.03em]">{u.deadline ? shortDate(u.deadline) : "Rolling"}</p>
          {u.deadline && <DaysLeft deadline={u.deadline} className="relative mt-2 inline-flex rounded-full bg-white px-2.5 py-0.5 text-[12px] font-semibold text-[#c0433d]" />}
        </div>
        <div className="px-5 pb-5">
        <Link href="/signup" className="l2-btn l2-btn--sm mt-5 w-full justify-center">
          <Target strokeWidth={2.2} /> Calculate my chances
        </Link>
        <p className="mt-2 text-center text-[12.5px] text-[var(--ink-3)]">Free account · no card needed</p>
        <a href={`https://${u.domain}`} target="_blank" rel="noopener noreferrer" className="l2-btn l2-btn--ghost l2-btn--sm mt-4 w-full justify-center">
          Official website <ArrowUpRight strokeWidth={2.2} />
        </a>
        <dl className="mt-5 border-t border-[var(--line)]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-2.5 text-[14px] last:border-b-0">
              <dt className="text-[var(--ink-2)]">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-3 flex flex-col gap-1.5 text-[13px] text-[var(--ink-2)]">
          {["Reach, target or safety for you", "Based on your grades and scores"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="size-3.5 text-[var(--mint)]" strokeWidth={3} /> {t}
            </li>
          ))}
        </ul>
        </div>
      </div>
    </aside>
  );
}
