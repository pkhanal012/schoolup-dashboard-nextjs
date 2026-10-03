import Image from "next/image";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  FileText,
  FolderClosed,
  GraduationCap,
  HandCoins,
  LayoutGrid,
  MessagesSquare,
  Mic,
  PanelLeft,
  Plus,
  Sparkles,
} from "lucide-react";

/*
 * The Home screen, drawn for the landing pages — a still of app/page.tsx in the
 * Default theme (dark sidebar, white panel). Not the live app: every size is in
 * em, and the frame sets 1em to 1% of its width, so the whole UI scales as one
 * picture. Colours are literal so a visitor's saved app theme never repaints it.
 * Rows carry data-mock-row (and meters data-mock-meter) for the reveal stagger.
 *
 * Keep it in step with app/page.tsx and components/app/shell.tsx.
 */

const C = {
  ink: "#17161c",
  ink2: "#5d5b66",
  ink3: "#9a98a3",
  line: "#ecebef",
  sky: "#42befc",
  skySoft: "#dff3fe",
  sun: "#ffd23f",
  sunSoft: "#fff4c7",
  pink: "#ff8fcf",
  pinkSoft: "#ffe6f4",
  mint: "#34d399",
  mintSoft: "#d6f6e8",
  lilac: "#a98bff",
  lilacSoft: "#eee8ff",
  coralSoft: "#ffe3db",
  bad: "#c0433d",
};

const DISPLAY = "font-[family-name:var(--font-l2-display,var(--font-display-face))] font-bold tracking-[-0.035em]";

const dots = (color: string) => ({
  backgroundImage: `radial-gradient(${color} 0.12em, transparent 0.15em)`,
  backgroundSize: "1.6em 1.6em",
});

const NAV = [
  { group: null, items: [["Home", LayoutGrid, true], ["My files", FolderClosed], ["Community", MessagesSquare]] },
  { group: "Discover", items: [["Colleges", GraduationCap], ["Scholarships", HandCoins]] },
  { group: "Apply", items: [["Applications", BookOpen]] },
  { group: "Prepare", items: [["Writing coach", FileText], ["Interview prep", Mic], ["Calendar", CalendarDays]] },
] as const;

const METRICS = [
  ["Applications open", "4", "1 ready to submit", C.sunSoft, C.sun],
  ["Next deadline", "14d", "Graduate Merit Award", C.skySoft, C.sky],
  ["Documents in draft", "3", "1 waiting on review", C.pinkSoft, C.pink],
  ["Interview readiness", "58%", "F-1 visa · +12 this month", C.mintSoft, C.mint],
] as const;

const BADGE = {
  Interview: [C.skySoft, "#0a7cb3"],
  Essay: [C.pinkSoft, "#b8337f"],
  Application: [C.lilacSoft, "#6b4fd6"],
  Test: ["#fbf1de", "#97650a"],
} as const;

const TASKS = [
  ["Drill: Financial support answers", "Interview prep · weakest section", "6m", "Interview", false],
  ["Statement of purpose — second draft", "Toronto MEng · due in 7 days", "45m", "Essay", false],
  ["Request reference from Dr. Shrestha", "Waterloo MEng · 2 of 3 requirements", "10m", "Application", true],
  ["Confirm GRE test centre", "Kathmandu · Oct 12", "5m", "Test", false],
] as const;

const DEADLINES = [
  ["Graduate Merit Award", "Scholarship", "Oct 1", 14],
  ["GRE General Test", "Test", "Oct 12", 25],
  ["Pearson International", "Scholarship", "Nov 30", 74],
] as const;

function Sticker({ src, className }: { src: string; className: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={300}
      height={300}
      sizes="160px"
      className={"pointer-events-none absolute h-auto drop-shadow-[0_0.9em_1.1em_rgba(23,22,28,0.16)] " + className}
    />
  );
}

/** `name` is who the greeting is for — /signup passes whatever is being typed. */
export function ProductMock({ name = "Linh" }: { name?: string }) {
  return (
    <div className="lp-mock-scale flex aspect-[100/62] w-full flex-col" style={{ color: C.ink }}>
      {/* Window chrome */}
      <div className="flex h-[3.2em] shrink-0 items-center gap-[0.6em] px-[1.4em]">
        <span className="size-[0.85em] rounded-full bg-[#3a3936]" />
        <span className="size-[0.85em] rounded-full bg-[#3a3936]" />
        <span className="size-[0.85em] rounded-full bg-[#3a3936]" />
        <span className="mx-auto rounded-[0.5em] bg-[#232321] px-[1.6em] py-[0.25em] text-[0.95em] text-[#8a8884]">app.schoolupacademy.com</span>
        <span className="w-[3.5em]" />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-[16em] shrink-0 flex-col px-[0.9em] pb-[1em] text-[#a9a7a0]">
          <div className="flex items-center justify-between px-[0.7em] pb-[1.4em] pt-[0.4em]">
            <Image src="/images/logos/logo_white.svg" alt="" width={91} height={19} style={{ height: "1.3em", width: "auto" }} />
            <PanelLeft className="size-[1.1em] text-[#6f6d67]" strokeWidth={1.8} />
          </div>
          {NAV.map((g, i) => (
            <div key={i} className="mb-[0.9em]">
              {g.group && <div className="px-[0.7em] pb-[0.35em] text-[0.85em] text-[#6f6d67]">{g.group}</div>}
              {g.items.map(([label, Icon, active]) => (
                <div
                  key={label}
                  className={"flex items-center gap-[0.7em] rounded-full px-[0.7em] py-[0.4em] text-[1.05em] " + (active ? "bg-white font-medium text-[#17161c]" : "")}
                >
                  {active ? (
                    <span className="grid size-[1.5em] place-items-center rounded-[0.45em]" style={{ background: C.skySoft }}>
                      <Icon className="size-[0.95em]" style={{ color: "#0a7cb3" }} strokeWidth={2} />
                    </span>
                  ) : (
                    <Icon className="size-[1.1em]" strokeWidth={1.8} />
                  )}
                  {label}
                </div>
              ))}
            </div>
          ))}

          {/* Plan card: sun yellow on dots, a sticker peeking in. */}
          <div className="relative mt-auto overflow-hidden rounded-[1.4em] p-[1em]" style={{ background: C.sunSoft, color: C.ink, ...dots("rgba(255,196,0,0.3)") }}>
            <div className="flex items-center justify-between">
              <span className={DISPLAY + " text-[1.15em]"}>Mock interviews</span>
              <span className="font-mono text-[0.85em]" style={{ color: C.ink2 }}>2/3</span>
            </div>
            <div className="mt-[0.6em] h-[0.4em] overflow-hidden rounded-full bg-white/70">
              <span data-mock-meter className="block h-full w-2/3 rounded-full" style={{ background: "#0a7cb3" }} />
            </div>
            <p className="mt-[0.5em] max-w-[11em] text-[0.88em] leading-[1.35]" style={{ color: C.ink2 }}>Resets Monday. Unlimited on Plus.</p>
            <span className="mt-[0.7em] inline-flex rounded-full px-[0.9em] py-[0.35em] text-[0.88em] font-semibold text-white" style={{ background: C.ink }}>
              Upgrade
            </span>
            <Sticker src="/images/stickers/interview.webp" className="-bottom-[0.8em] -right-[0.9em] w-[5.6em] rotate-6" />
          </div>
        </aside>

        {/* Main column: title bar on the dark ground, then the white panel. */}
        <div className="flex min-w-0 flex-1 flex-col pr-[1em]">
          <div className="flex h-[2.8em] shrink-0 items-center justify-between pb-[0.4em] text-[#f3f2ee]">
            <span className="flex items-center gap-[0.5em] text-[1.15em] font-semibold">
              <span aria-hidden>👋</span> Home
            </span>
            <span className="flex items-center gap-[0.9em]">
              <Bell className="size-[1.15em] text-[#a9a7a0]" strokeWidth={1.8} />
              <span className="size-[1.9em] rounded-full" style={{ background: `linear-gradient(135deg, ${C.sky}, ${C.lilac})` }} />
            </span>
          </div>

          <main className="flex min-h-0 flex-1 flex-col gap-[1.3em] overflow-hidden rounded-t-[1.6em] bg-white px-[1.8em] pt-[1.8em]">
            {/* Greeting card */}
            <section
              data-mock-row
              className="relative shrink-0 overflow-hidden rounded-[2em] px-[2.2em] py-[2em]"
              style={{ background: C.skySoft, ...dots("rgba(66,190,252,0.22)") }}
            >
              <div className="relative z-[1] max-w-[36em]">
                <span className="inline-flex items-center gap-[0.5em] rounded-full bg-white px-[0.9em] py-[0.3em] text-[0.9em] font-medium shadow-[0_1px_2px_rgba(23,22,28,0.06)]" style={{ color: C.ink2 }}>
                  <i className="size-[0.55em] rounded-full" style={{ background: C.mint, boxShadow: `0 0 0 0.25em ${C.mint}40` }} />
                  Thu, Oct 2, 2026
                </span>
                <div className={DISPLAY + " mt-[0.35em] text-[3.3em] leading-[1.04]"}>
                  Good morning,
                  <br />
                  <span className="inline-block max-w-full -rotate-[1.5deg] truncate rounded-[0.28em] px-[0.18em] align-top" style={{ background: C.sun }}>
                    {name}
                  </span>
                </div>
                <p className="mt-[0.7em] max-w-[34em] text-[1.05em] leading-[1.5]" style={{ color: C.ink2 }}>
                  3 things left today, about 56 minutes. Your F-1 visa drill is first — it&rsquo;s the section you&rsquo;re weakest on.
                </p>
                <div className="mt-[1.1em] flex gap-[0.6em]">
                  <span className="inline-flex items-center gap-[0.45em] rounded-full px-[1.1em] py-[0.55em] text-[1em] font-semibold text-white" style={{ background: C.ink }}>
                    <Mic className="size-[1em]" /> Start today&rsquo;s drill
                  </span>
                  <span className="inline-flex items-center gap-[0.45em] rounded-full bg-white px-[1.1em] py-[0.55em] text-[1em] font-semibold" style={{ boxShadow: `inset 0 0 0 0.12em ${C.line}` }}>
                    <Plus className="size-[1em]" /> Add task
                  </span>
                </div>
              </div>
              <Sticker src="/images/stickers/calendar.webp" className="right-[24%] top-1/2 w-[11em] -translate-y-1/2 -rotate-6" />
              <Sticker src="/images/stickers/progress.webp" className="-bottom-[0.4em] right-[2.2em] w-[10em] rotate-6" />
            </section>

            {/* Metric cards */}
            <div data-mock-row className="grid shrink-0 grid-cols-4 gap-[0.9em]">
              {METRICS.map(([label, value, hint, card, dot]) => (
                <div key={label} className="rounded-[1.4em] px-[1.2em] pb-[1.1em] pt-[1em]" style={{ background: card }}>
                  <div className="flex items-center gap-[0.5em] text-[0.9em] font-medium" style={{ color: C.ink2 }}>
                    <i className="size-[0.6em] rounded-full" style={{ background: dot }} />
                    {label}
                  </div>
                  <div className={DISPLAY + " mt-[0.3em] text-[2.6em] leading-none tabular-nums"}>{value}</div>
                  <div className="mt-[0.5em] text-[0.9em]" style={{ color: C.ink2 }}>
                    {hint}
                  </div>
                </div>
              ))}
            </div>

            {/* Do next + right rail */}
            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_25em] gap-[1.3em]">
              <section data-mock-row className="min-h-0 overflow-hidden rounded-t-[1.4em] border border-b-0" style={{ borderColor: C.line }}>
                <div className="flex items-start justify-between gap-[1em] border-b px-[1.3em] py-[1em]" style={{ borderColor: C.line }}>
                  <div>
                    <div className="text-[1.15em] font-semibold">Do next</div>
                    <div className="text-[0.92em]" style={{ color: C.ink3 }}>
                      Ordered by what closes first, then by what unblocks other work.
                    </div>
                  </div>
                  <span className="text-[0.95em] font-medium" style={{ color: C.ink2 }}>
                    Re-plan
                  </span>
                </div>
                {TASKS.map(([title, meta, mins, area, done]) => {
                  const [bg, fg] = BADGE[area];
                  return (
                    <div key={title} className="flex items-center gap-[0.9em] border-b px-[1.3em] py-[0.8em]" style={{ borderColor: C.line }}>
                      <span
                        className="grid size-[1.45em] shrink-0 place-items-center rounded-full border-[0.12em]"
                        style={done ? { background: C.mint, borderColor: C.mint } : { borderColor: "#d4d2cc" }}
                      >
                        {done && <Check className="size-[0.9em]" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={"truncate text-[1.05em] " + (done ? "line-through" : "font-medium")} style={done ? { color: C.ink3 } : undefined}>
                          {title}
                        </div>
                        <div className="mt-[0.15em] flex items-center gap-[0.6em] text-[0.88em]" style={{ color: C.ink3 }}>
                          <span className="truncate">{meta}</span>
                          <span className="font-mono">{mins}</span>
                          <span className="rounded-full px-[0.6em] py-[0.1em] font-medium" style={{ background: bg, color: fg }}>
                            {area}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              <div className="flex min-h-0 flex-col gap-[1.3em]">
                {/* Today's drill: lilac sticker card */}
                <section
                  data-mock-row
                  className="relative shrink-0 overflow-hidden rounded-[1.4em] p-[1.3em]"
                  style={{ background: C.lilacSoft, ...dots("rgba(169,139,255,0.25)") }}
                >
                  <Sticker src="/images/stickers/interview.webp" className="-right-[0.6em] -top-[0.4em] w-[7em] rotate-6" />
                  <span className="relative inline-flex items-center gap-[0.4em] rounded-full bg-white px-[0.8em] py-[0.25em] text-[0.88em] font-medium" style={{ color: C.ink2 }}>
                    <Sparkles className="size-[0.95em]" style={{ color: C.lilac }} /> Today&rsquo;s drill
                  </span>
                  <div className={DISPLAY + " relative mt-[0.6em] text-[1.9em] leading-[1.05]"}>Financial support</div>
                  <div className="mt-[0.35em] text-[0.9em]" style={{ color: C.ink2 }}>
                    F-1 visa interview · 3 questions · ~6 min
                  </div>
                  <div className="mt-[0.6em] text-[0.95em] leading-[1.45]" style={{ color: C.ink2 }}>
                    Your last two answers named no amounts and no sponsor.
                  </div>
                  <span className="mt-[0.9em] flex items-center justify-center gap-[0.45em] rounded-full py-[0.55em] text-[0.98em] font-semibold text-white" style={{ background: C.ink }}>
                    <Mic className="size-[1em]" /> Start drill
                  </span>
                </section>

                <section data-mock-row className="min-h-0 flex-1 overflow-hidden rounded-t-[1.4em] border border-b-0" style={{ borderColor: C.line }}>
                  <div className="border-b px-[1.2em] py-[0.9em]" style={{ borderColor: C.line }}>
                    <div className="text-[1.1em] font-semibold">Hard deadlines</div>
                    <div className="text-[0.88em]" style={{ color: C.ink3 }}>
                      Dates you cannot move.
                    </div>
                  </div>
                  {DEADLINES.map(([title, kind, when, days]) => (
                    <div key={title} className="flex items-center justify-between gap-[0.8em] border-b px-[1.2em] py-[0.7em]" style={{ borderColor: C.line }}>
                      <div className="min-w-0">
                        <div className="truncate text-[1em]">{title}</div>
                        <div className="text-[0.85em]" style={{ color: C.ink3 }}>
                          {kind}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-[0.5em]">
                        <span className="font-mono text-[0.9em]" style={{ color: C.ink2 }}>
                          {when}
                        </span>
                        <span
                          className="rounded-full px-[0.55em] py-[0.25em] font-mono text-[0.82em] font-medium leading-none"
                          style={days <= 14 ? { background: C.coralSoft, color: C.bad } : { background: "#f7f6f2", color: C.ink2 }}
                        >
                          {days}d
                        </span>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
