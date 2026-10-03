"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ Button */

type ButtonVariant = "primary" | "ink" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ComponentProps<"button"> & {
  /** primary: sky, the one action colour. ink: the landing page's black pill. */
  variant?: ButtonVariant;
  size?: "sm" | "md";
  loading?: boolean;
};

/** The button's look as a class string, so a <Link> can wear it too. */
export function buttonStyles({ variant = "secondary", size = "md", className }: { variant?: ButtonVariant; size?: "sm" | "md"; className?: string } = {}) {
  return cn(
    // Pills with the landing page's spring: a small hop on hover, a squeeze on press.
    "relative inline-flex shrink-0 select-none items-center justify-center gap-1.5 rounded-full font-semibold",
    "transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-spring)]",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:size-[15px] [&_svg]:shrink-0",
    size === "sm" ? "h-8 px-3.5 text-[12.5px]" : "h-10 px-4.5 text-[13.5px]",
    variant !== "ghost" && "hover:-translate-y-px",
    variant === "primary" &&
      "bg-primary text-primary-ink shadow-[0_8px_18px_-10px_rgba(66,190,252,0.9)] hover:bg-primary-hover hover:shadow-[0_12px_22px_-10px_rgba(66,190,252,0.95)]",
    variant === "ink" && "bg-ink text-surface shadow-[0_8px_18px_-10px_rgba(23,22,28,0.55)] hover:shadow-[0_12px_22px_-10px_rgba(23,22,28,0.6)]",
    variant === "secondary" && "bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--line)] hover:shadow-[inset_0_0_0_1.5px_var(--ink)]",
    variant === "ghost" && "text-ink-2 hover:bg-hover hover:text-ink",
    variant === "danger" && "bg-bad-soft text-bad shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--bad)_25%,transparent)] hover:shadow-[inset_0_0_0_1.5px_var(--bad)]",
    className,
  );
}

export function Button({ className, variant = "secondary", size = "md", loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block size-[13px] animate-spin rounded-full border-[1.5px] border-current border-t-transparent opacity-60", className)}
      role="status"
      aria-label="Loading"
    />
  );
}

/* ------------------------------------------------------------------- Panel */

export function Panel({
  className,
  interactive,
  ...props
}: React.ComponentProps<"section"> & { interactive?: boolean }) {
  return (
    <section
      className={cn(
        "rounded-card border bg-surface shadow-e1",
        interactive && "transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:border-line-strong hover:shadow-e3",
        className,
      )}
      {...props}
    />
  );
}

export function PanelHead({
  title,
  hint,
  action,
  className,
}: {
  title: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3 border-b border-line-soft px-4 py-3.5", className)}>
      <div className="min-w-0">
        <h2 className="su-display text-[16px] font-semibold leading-snug tracking-[-0.025em]">{title}</h2>
        {hint ? <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{hint}</p> : null}
      </div>
      {action ? <div className="-mt-0.5 shrink-0">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- Label */

/** The one small label: field names, column heads, rail headings. Sentence
    case, never an uppercase eyebrow — the eyebrow is a pill (see Hero). */
export function Label({ className, children, as: Tag = "p" }: { className?: string; children: React.ReactNode; as?: "p" | "span" | "h2" | "h3" | "dt" }) {
  return <Tag className={cn("text-[12px] font-medium text-ink-3", className)}>{children}</Tag>;
}

/** A sunken block inside a card or dialog: "why this matched", a reviewer's note. */
export function Inset({ label, className, children }: { label?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl bg-sunken px-4 py-3", className)}>
      {label ? <Label>{label}</Label> : null}
      <div className={cn("text-[12.5px] leading-relaxed text-ink", label && "mt-1")}>{children}</div>
    </div>
  );
}

/* --------------------------------------------------------------- FactGrid */

/** Label-over-value cells on hairlines: a school's numbers, a study plan. */
export function FactGrid({ items, className }: { items: { label: string; value: React.ReactNode; mono?: boolean }[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-px bg-[var(--line-soft)] sm:grid-cols-3", className)}>
      {items.map((f) => (
        <div key={f.label} className="min-w-0 bg-surface px-4 py-3">
          <Label as="dt" className="truncate">{f.label}</Label>
          <dd className={cn("mt-0.5 truncate text-[13.5px] font-medium", f.mono && "font-mono tabular-nums")}>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------- Panel list */

/** Rows inside a Panel, one hairline apart. */
export function PanelList({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("divide-y divide-line-soft", className)} {...props} />;
}

/** One row of a PanelList: lead · text · trailing, on the panel's 16px gutter. */
export function ListRow({ className, interactive, ...props }: React.ComponentProps<"li"> & { interactive?: boolean }) {
  return (
    <li
      className={cn("flex items-center gap-3 px-4 py-3", interactive && "transition-colors hover:bg-hover/50", className)}
      {...props}
    />
  );
}

/** The two lines of a row: a title, and a quieter line under it. */
export function RowText({ title, sub, className }: { title: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 flex-1", className)}>
      <div className="truncate text-[13.5px] font-semibold tracking-[-0.15px]">{title}</div>
      {sub ? <div className="mt-0.5 truncate text-[12px] text-ink-3">{sub}</div> : null}
    </div>
  );
}

export type StickerTone = "sun" | "pink" | "sky" | "mint" | "lilac" | "coral";

/* A sticker dot, like the nav's current page and the interview tracks: the
   pastel stays bright in both themes, so the icon on it is always dark ink. */
const TILE_TONES: Record<StickerTone, string> = {
  sun: "bg-sun",
  pink: "bg-pink",
  sky: "bg-sky",
  mint: "bg-mint",
  lilac: "bg-lilac",
  coral: "bg-coral",
};

/** The 32px tile that leads a row — the same shape as a school's logo tile,
    so a file, a draft and a university all line up in one column. Each kind
    of thing wears its own sticker colour; `good` marks something done. */
export function IconTile({
  icon: Icon,
  tone = "neutral",
  className,
}: {
  icon: React.ElementType;
  tone?: "neutral" | "good" | StickerTone;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg",
        tone === "good"
          ? "bg-good-soft text-good"
          : tone === "neutral"
            ? "bg-sunken text-ink-2 ring-1 ring-inset ring-[var(--line)]"
            : cn(TILE_TONES[tone], "text-[#17161c]"),
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={tone === "neutral" ? 1.75 : 2.1} />
    </span>
  );
}

/* --------------------------------------------------------------------- Due */

/** One urgency scale everywhere: red inside two weeks, amber inside a month. */
export function dueTone(days: number) {
  return days <= 14 ? "bad" : days <= 30 ? "warn" : "neutral";
}

/** A date with its countdown under it, coloured by how close it is. */
export function Due({ date, days, className }: { date: React.ReactNode; days: number; className?: string }) {
  const tone = dueTone(days);
  return (
    <span className={cn("block", className)}>
      <span className="block font-mono text-[12.5px] tabular-nums">{date}</span>
      <span className={cn("mt-0.5 block text-[11.5px] tabular-nums", tone === "bad" ? "text-bad" : tone === "warn" ? "text-warn" : "text-ink-3")}>
        {days === 0 ? "Today" : days === 1 ? "1 day left" : `${days} days left`}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ Fields */

/** Text inputs, selects and textareas in forms and dialogs. */
export const fieldStyles =
  "h-10 w-full rounded-lg border bg-surface px-3.5 text-[13.5px] text-ink placeholder:text-ink-3 outline-none transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]";

/** The list search: a pill, the same height as the Segmented and Chips beside it. */
export function SearchField({
  value,
  onChange,
  placeholder = "Search",
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
  className?: string;
}) {
  return (
    <label className={cn("relative flex h-9 min-w-[220px] flex-1 items-center sm:max-w-[320px]", className)}>
      <Search className="pointer-events-none absolute left-3.5 size-[15px] text-ink-3" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(fieldStyles, "h-full rounded-full pl-9.5 pr-3.5 text-[13px] [&::-webkit-search-cancel-button]:hidden")}
      />
    </label>
  );
}

/* --------------------------------------------------------------- DataTable */

/*
 * Every list of comparable things — colleges, awards, applications, files,
 * drafts — is this one table. It sits in a Panel; the column names are stated
 * once in a sunken head; rows are a hairline apart on the panel's 16px gutter.
 *
 * Columns come from one grid template shared by head and rows (`cols`). The
 * table forms when its panel is 48rem wide (a container query, so collapsing
 * the sidebar counts); narrower, each row stacks and every cell names itself.
 * Write the template as `@3xl:grid-cols-[…]`, optionally with a narrow
 * template in front of it for rows that should keep some columns side by side.
 */

const TableCols = React.createContext("");

export function DataTable({
  cols,
  toolbar,
  className,
  children,
}: {
  cols: string;
  /** Search, filters and the result count — inside the card, above the head. */
  toolbar?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TableCols.Provider value={cols}>
      <Panel className={cn("@container overflow-hidden", className)}>
        {toolbar ? <TableToolbar>{toolbar}</TableToolbar> : null}
        {children}
      </Panel>
    </TableCols.Provider>
  );
}

/** The row of controls at the top of a table card. Also usable alone, in a
    Panel of its own, above a grid of cards. */
export function TableToolbar({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex flex-wrap items-center gap-2 border-b border-line-soft p-3", className)}>{children}</div>;
}

/** "4 shown · 1 hidden" — the quiet count at the end of a toolbar. */
export function ResultCount({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("ml-auto whitespace-nowrap pr-1 text-[12.5px] tabular-nums text-ink-3", className)}>{children}</span>;
}

/** When filters leave a table empty: the toolbar stays, the message sits where rows would. */
export function DataTableEmpty(props: React.ComponentProps<typeof EmptyState>) {
  return <EmptyState {...props} className={cn("min-h-0 py-14", props.className)} />;
}

export function DataTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  const cols = React.useContext(TableCols);
  return (
    <div
      className={cn(
        cols,
        "hidden items-center gap-x-4 whitespace-nowrap border-b border-line-soft bg-sunken px-4 py-2.5 text-[12px] font-medium text-ink-3 @3xl:grid [&>*]:min-w-0 [&>span]:truncate",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DataTableBody({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("su-stagger divide-y divide-line-soft", className)} {...props} />;
}

export function DataTableRow({
  className,
  muted,
  selected,
  ...props
}: React.ComponentProps<"li"> & { muted?: boolean; selected?: boolean }) {
  const cols = React.useContext(TableCols);
  return (
    <li
      className={cn(
        cols,
        "grid gap-x-4 gap-y-2 px-4 py-3 transition-colors @3xl:items-center",
        props.onClick && "cursor-pointer",
        selected ? "bg-primary-soft/60" : "hover:bg-hover/50",
        muted && "opacity-60",
        className,
      )}
      {...props}
    />
  );
}

/** The row's first cell: its tile, its name, and the line under it. */
export function DataTablePrimary({ lead, title, sub, extra }: { lead?: React.ReactNode; title: React.ReactNode; sub?: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {lead}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <div className="min-w-0 truncate text-[13.5px] font-semibold tracking-[-0.15px]">{title}</div>
          {extra}
        </div>
        {sub ? <div className="mt-0.5 truncate text-[12px] text-ink-3">{sub}</div> : null}
      </div>
    </div>
  );
}

/**
 * A data cell. When the row stacks it shows its own label, unless `narrow`
 * says to hide it — for a figure that is already in the row's sub-line.
 */
export function DataTableCell({
  label,
  mono,
  align,
  narrow = "label",
  className,
  children,
}: {
  label?: string;
  mono?: boolean;
  align?: "end";
  narrow?: "label" | "hide" | "bare";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0",
        narrow === "hide" ? "hidden @3xl:block" : narrow === "label" ? "flex items-center gap-3 @3xl:block" : "",
        align === "end" && "@3xl:justify-self-end @3xl:text-right",
        className,
      )}
    >
      {narrow === "label" && label ? <span className="w-28 shrink-0 text-[12px] text-ink-3 @3xl:hidden">{label}</span> : null}
      <div className={cn("min-w-0 truncate text-[12.5px]", mono && "font-mono tabular-nums")}>{children}</div>
    </div>
  );
}

/** The table while it loads: the head, then rows of the same rhythm. */
export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Panel className="overflow-hidden" aria-busy>
      <div className="h-[38px] border-b border-line-soft bg-sunken" />
      <div className="divide-y divide-line-soft">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-48 rounded-full" />
              <Skeleton className="mt-2 h-3 w-32 rounded-full" />
            </div>
            <Skeleton className="hidden h-3 w-20 rounded-full sm:block" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------- Badge */

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "accent" | "good" | "warn" | "bad" | "pink" | "lilac" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        // Pastel pills, like the landing page's eyebrows: a tint, no outline.
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[4px] text-[11px] font-semibold leading-none",
        tone === "neutral" && "bg-sunken text-ink-2 ring-1 ring-inset ring-[var(--line)]",
        tone === "accent" && "bg-sky-soft text-accent",
        tone === "good" && "bg-good-soft text-good",
        tone === "warn" && "bg-warn-soft text-warn",
        tone === "bad" && "bg-bad-soft text-bad",
        tone === "pink" && "bg-pink-soft text-[#a3246c] dark:text-pink",
        tone === "lilac" && "bg-lilac-soft text-[#5b3fc4] dark:text-lilac",
        tone === "outline" && "border text-ink-3",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------- Sticker art */

/** A wobbly circle, r(θ) = 1 + amp·cos(nθ), in a 200×200 box — the landing page's blob. */
function blobPath(n: number, amp: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * Math.PI * 2;
    const r = (88 * (1 + amp * Math.cos(n * t))) / (1 + amp);
    pts.push(`${(100 + r * Math.cos(t)).toFixed(2)},${(100 + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/*
 * Each sticker has its own colour *and* its own shape, so no two sections
 * share a blob: the same r = 1 + amp·cos(nθ) family as the landing page's
 * stat blobs, from a soft four-leaf clover to a sixteen-point seal.
 * `n` is the number of lobes, `amp` how deep they go.
 */
type StickerLook = { tone: string; n: number; amp: number };

const STICKER_LOOKS: Record<string, StickerLook> = {
  files: { tone: "var(--coral)", n: 7, amp: 0.09 }, //       a wobbly cookie
  admission: { tone: "var(--sky)", n: 9, amp: 0.11 }, //     a sunburst
  writing: { tone: "var(--lilac)", n: 4, amp: 0.12 }, //     a four-leaf clover
  deadline: { tone: "var(--sun)", n: 16, amp: 0.06 }, //     a postage-stamp seal
  progress: { tone: "var(--mint)", n: 5, amp: 0.14 }, //     a five-petal flower
  calendar: { tone: "var(--pink)", n: 14, amp: 0.045 }, //   a scalloped edge
  notification: { tone: "var(--sun)", n: 12, amp: 0.15 }, // a daisy
  interview: { tone: "var(--sky)", n: 6, amp: 0.1 }, //      a six-lobe bloom
  university: { tone: "var(--mint)", n: 8, amp: 0.08 }, //   a rosette
};

const DEFAULT_LOOK = STICKER_LOOKS.files;

/* Paths are pure functions of n and amp, so each is built once and shared. */
const BLOBS = new Map<StickerLook, string>();
const blobFor = (look: StickerLook) => {
  let d = BLOBS.get(look);
  if (!d) BLOBS.set(look, (d = blobPath(look.n, look.amp)));
  return d;
};

/** Any illustration path (illustratioin/*.png or stickers/*.webp) → its die-cut sticker and blob. */
function stickerFor(src: string) {
  const name = (src.split("/").pop() ?? "").replace(/\.\w+$/, "").replace("calender", "calendar").replace("progess", "progress");
  const look = STICKER_LOOKS[name] ?? DEFAULT_LOOK;
  return { src: `/images/stickers/${name}.webp`, tone: look.tone, blob: blobFor(look) };
}

/**
 * The landing page's sticker treatment: a die-cut sticker, tilted, on a wavy
 * blob that turns very slowly. Size it with `className` (default 192px).
 */
export function StickerArt({ src, className }: { src: string; className?: string }) {
  const sticker = stickerFor(src);
  return (
    <span aria-hidden className={cn("relative grid size-48 shrink-0 place-items-center", className)}>
      <svg viewBox="0 0 200 200" className="su-blob absolute inset-0 size-full">
        <path d={sticker.blob} fill={sticker.tone} />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed local sticker, not content */}
      <img src={sticker.src} alt="" className="relative w-[72%] -rotate-3 drop-shadow-[0_14px_16px_rgba(23,22,28,0.22)]" />
    </span>
  );
}

/* ---------------------------------------------------------------- Empty UI */

export function EmptyState({
  icon: Icon,
  illustration,
  illustrationClassName,
  image,
  title,
  body,
  primary,
  secondary,
  dismissible,
  className,
}: {
  icon?: React.ElementType;
  /** Replaces the icon tile. Both files render; CSS shows the one for the theme. */
  illustration?: { light: string; dark: string };
  illustrationClassName?: string;
  /** Artwork below the text, cropped by the card's bottom edge. Replaces the icon. */
  image?: { src: string; width: number; height: number };
  title: string;
  body: string;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
  /** Adds a close button; the card comes back, sliding in, 10 seconds later. */
  dismissible?: boolean;
  className?: string;
}) {
  const [hidden, setHidden] = React.useState(false);
  const [returned, setReturned] = React.useState(false);

  React.useEffect(() => {
    if (!hidden) return;
    const t = setTimeout(() => {
      setReturned(true);
      setHidden(false);
    }, 10_000);
    return () => clearTimeout(t);
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      data-empty
      className={cn(
        // No card: an empty state is an absence, not an object. It centres in
        // the space it is given instead of drawing a box around nothing.
        "relative flex flex-1 flex-col items-center justify-center px-6 text-center",
        image ? "overflow-hidden pt-10" : "min-h-[52vh] py-10",
        returned && "su-slide-in-left",
        className,
      )}
    >
      {dismissible ? (
        <button
          onClick={() => setHidden(true)}
          aria-label="Dismiss"
          title="Dismiss"
          className="absolute right-3 top-3 grid size-8 place-items-center rounded-md text-ink-3 transition-colors hover:bg-hover hover:text-ink"
        >
          <X className="size-4" />
        </button>
      ) : null}
      {image ? null : illustration ? (
        <StickerArt src={illustration.light} className={cn("mb-1", illustrationClassName)} />
      ) : Icon ? (
        <span className="grid size-11 place-items-center rounded-full bg-sun-soft text-ink-2">
          <Icon className="size-[18px]" />
        </span>
      ) : null}
      <p className={cn("su-display text-[19px] tracking-[-0.03em]", !image && "mt-4")}>{title}</p>
      <p className="mt-1.5 max-w-[46ch] text-[12.5px] leading-relaxed text-ink-2">{body}</p>
      {primary || secondary ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primary}
          {secondary}
        </div>
      ) : null}
      {image ? (
        // -mb crops the artwork against the card's edge, the way the reference does.
        <div className="-mb-7 mt-7 w-full max-w-[320px]">
          <Image
            src={image.src}
            alt=""
            aria-hidden
            width={image.width}
            height={image.height}
            sizes="(max-width: 640px) 70vw, 320px"
            className="h-auto w-full select-none"
          />
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------- Tabs */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: string; count?: number; icon?: React.ElementType }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    /* The page's views, written as type on a hairline with an ink bar under
       the current one. Tabs pick *which* list you are in; filters inside the
       table narrow it — so they never share the solid pill. */
    <div
      role="tablist"
      className={cn("no-scrollbar flex shrink-0 items-center gap-6 overflow-x-auto border-b border-line-soft", className)}
    >
      {tabs.map((t) => {
        const active = value === t.value;
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              "group relative flex h-11 shrink-0 items-center gap-2 whitespace-nowrap text-[14px] transition-colors duration-200",
              "after:absolute after:inset-x-0 after:-bottom-px after:h-[2.5px] after:rounded-full after:transition-[background-color,transform] after:duration-300 after:ease-[var(--ease-spring)]",
              active
                ? "font-semibold text-ink after:scale-x-100 after:bg-ink"
                : "font-medium text-ink-3 after:scale-x-50 after:bg-transparent hover:text-ink hover:after:scale-x-100 hover:after:bg-line-strong",
            )}
          >
            {Icon ? <Icon className="size-[15px]" strokeWidth={active ? 2.1 : 1.75} /> : null}
            {t.label}
            {t.count !== undefined ? (
              <span
                className={cn(
                  "min-w-[20px] rounded-full px-1.5 text-center text-[11.5px] font-semibold leading-[20px] tabular-nums transition-colors",
                  active ? "bg-sun text-[#17161c]" : "bg-sunken text-ink-3 group-hover:text-ink-2",
                )}
              >
                {t.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------- Segmented */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  stretch,
  className,
}: {
  options: { value: T; label: string; icon?: React.ElementType }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  /** Options share the full width equally. */
  stretch?: boolean;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex h-9 items-center gap-0.5 rounded-full bg-sunken p-1 ring-1 ring-inset ring-[var(--line)]", className)}>
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex h-full items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[12px] font-medium transition-[background-color,color,box-shadow] duration-200 [&_svg]:size-[13px] [&_svg]:shrink-0",
              stretch && "flex-1",
              active ? "bg-surface font-semibold text-ink shadow-e2" : "text-ink-2 hover:text-ink",
            )}
          >
            {Icon ? <Icon /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- Filter chip */

export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 select-none items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] font-medium",
        "transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-spring)] active:scale-[0.97] [&_svg]:size-[14px] [&_svg]:shrink-0",
        // On: a sky tint, the brand's "this is applied" — never the ink pill, which belongs to tabs and primary actions.
        active
          ? "bg-sky-soft text-accent shadow-[inset_0_0_0_1.5px_var(--accent-line)] hover:shadow-[inset_0_0_0_1.5px_var(--accent)]"
          : "bg-surface text-ink-2 shadow-[inset_0_0_0_1.5px_var(--line)] hover:text-ink hover:shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/**
 * A filter that is on, said in words: "Plan · MEng, US & Canada ×". The label
 * opens it for editing; the cross clears it.
 */
export function FilterTag({
  label,
  value,
  onEdit,
  onRemove,
}: {
  label: string;
  value: React.ReactNode;
  onEdit?: () => void;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-9 max-w-full items-center rounded-full bg-sky-soft text-[13px] shadow-[inset_0_0_0_1.5px_var(--accent-line)]">
      <button type="button" onClick={onEdit} className="flex min-w-0 items-center gap-1.5 truncate rounded-l-full py-1 pl-3.5 pr-1.5 text-left hover:underline">
        <span className="text-ink-2">{label}</span>
        <span className="truncate font-semibold text-accent">{value}</span>
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Clear ${label.toLowerCase()} filter`}
        className="mr-1 grid size-7 shrink-0 place-items-center rounded-full text-accent transition-colors hover:bg-surface"
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------- Meter */

export function Meter({ value, tone = "accent", className }: { value: number; tone?: "accent" | "good" | "warn" | "neutral"; className?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--line)]", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          tone === "accent" && "bg-accent",
          tone === "good" && "bg-good",
          tone === "warn" && "bg-warn",
          tone === "neutral" && "bg-ink-3",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ Metric */

/* Each figure gets its own pastel card, the way the landing page's bento does:
   a tint, a coloured dot, and the number set big in the display face. */
const METRIC_TONES = [
  ["bg-sun-soft", "bg-sun"],
  ["bg-sky-soft", "bg-sky"],
  ["bg-pink-soft", "bg-pink"],
  ["bg-mint-soft", "bg-mint"],
] as const;

export function MetricStrip({
  items,
}: {
  items: { label: string; value: React.ReactNode; hint?: string; tone?: "default" | "good" | "warn" | "bad" }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((m, i) => {
        const [card, dot] = METRIC_TONES[i % METRIC_TONES.length];
        return (
          <div key={m.label} className={cn("rounded-card px-4 pb-4 pt-3.5", card)}>
            {/* Two lines are always reserved, so a label that wraps never drops
                its figure out of line with the others in the row. */}
            <p className="flex min-h-[2.5em] items-start gap-2 text-[12px] font-medium leading-tight text-ink-2">
              <i aria-hidden className={cn("mt-[3px] size-2 shrink-0 rounded-full", dot)} />
              {m.label}
            </p>
            <p
              className={cn(
                "su-display mt-1 text-[34px] leading-none tabular-nums",
                m.tone === "good" && "text-good",
                m.tone === "warn" && "text-warn",
                m.tone === "bad" && "text-bad",
              )}
            >
              {m.value}
            </p>
            {m.hint ? <p className="mt-2 text-[12px] leading-snug text-ink-2">{m.hint}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Skeleton */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-card", className)}
      aria-hidden
      style={{
        background: "linear-gradient(90deg, var(--line-soft) 25%, var(--line) 50%, var(--line-soft) 75%)",
        backgroundSize: "200% 100%",
        animation: "su-shimmer 1.6s linear infinite",
      }}
    />
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = 440,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Freeze the page behind the dialog so the backdrop never scrolls under it.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="su-fade fixed inset-0 z-50 flex items-end justify-center bg-[rgba(16,15,12,0.32)] p-4 backdrop-blur-[3px] sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: width }}
        className="su-pop max-h-[86vh] w-full overflow-y-auto rounded-[28px] border bg-surface shadow-e4 thin-scrollbar"
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-6">
          <div className="min-w-0">
            <h2 className="su-display text-[20px] leading-tight">{title}</h2>
            {description ? <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{description}</p> : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1.5 grid size-8 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        {children ? <div className="px-6 py-3">{children}</div> : null}
        {footer ? (
          <div className="mt-1 flex items-center justify-end gap-2 px-6 pb-6 pt-3">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Carousel */

/**
 * Scroll-snap strip. The browser does the paging, so there is no transform to
 * keep in sync — the arrows and dots just scroll it and read back where it
 * landed. Images that fail to load drop out rather than leaving a gap.
 */
export function Carousel({ images, alt, className }: { images: string[]; alt: string; className?: string }) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [index, setIndex] = React.useState(0);
  const [broken, setBroken] = React.useState<string[]>([]);

  const shown = images.filter((src) => !broken.includes(src));

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(shown.length - 1, i));
    // Mandatory snapping cancels smooth programmatic scrolls — the animation
    // gets re-snapped back to where it started — so this jump is instant.
    // Swiping is untouched and keeps the browser's own momentum.
    el.scrollLeft = next * el.clientWidth;
    setIndex(next);
  };

  if (shown.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-card border bg-sunken", className)}>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar flex aspect-[16/9] snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {shown.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} — photo ${i + 1} of ${shown.length}`}
            loading={i === 0 ? "eager" : "lazy"}
            onError={() => setBroken((b) => [...b, src])}
            className="size-full shrink-0 snap-center object-cover"
            style={{ width: "100%" }}
          />
        ))}
      </div>

      {shown.length > 1 ? (
        <>
          <CarouselArrow side="left" disabled={index === 0} onClick={() => goTo(index - 1)} />
          <CarouselArrow side="right" disabled={index === shown.length - 1} onClick={() => goTo(index + 1)} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-1.5 bg-gradient-to-t from-black/45 to-transparent pb-2.5 pt-8">
            {shown.map((src, i) => (
              <button
                key={src}
                onClick={() => goTo(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "pointer-events-auto h-1.5 rounded-full transition-all duration-200",
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CarouselArrow({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity",
        "hover:bg-black/65 disabled:pointer-events-none disabled:opacity-0",
        side === "left" ? "left-2" : "right-2",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

/* ------------------------------------------------------------------ Drawer */

/** Side sheet for detail that is too long for a Modal but should not be a page. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  /** Plain text — it is also the dialog's accessible name. */
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="su-fade fixed inset-0 z-50 bg-[rgba(16,15,12,0.32)] backdrop-blur-[3px]" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: width }}
        className="su-drawer-in absolute inset-y-0 right-0 flex w-full flex-col border-l bg-surface shadow-e4"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line-soft px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
            <div className="min-w-0">
              <h2 className="su-display text-[19px] leading-tight">{title}</h2>
              {description ? <div className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{description}</div> : null}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line-soft bg-sunken px-5 py-3.5">{footer}</div>
        ) : null}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------- Toast */

type Toast = { id: number; message: string; action?: { label: string; onClick: () => void } };
const ToastCtx = React.createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => React.useContext(ToastCtx);

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((s) => [...s, { ...t, id }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex w-[min(92vw,400px)] -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="su-pop pointer-events-auto flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-[13px] font-medium text-surface shadow-e4"
          >
            <span className="min-w-0 flex-1 leading-snug">{t.message}</span>
            {t.action ? (
              <button
                onClick={t.action.onClick}
                className="shrink-0 rounded-md px-1.5 py-0.5 font-medium underline underline-offset-2 opacity-80 transition-opacity hover:opacity-100"
              >
                {t.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------------------------------------------------------- Dropdown */

export function Dropdown({
  trigger,
  children,
  align = "end",
  side = "bottom",
  width,
  label,
  className,
  triggerClassName,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end";
  side?: "top" | "bottom";
  width?: number;
  label?: string;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={cn("block rounded-full", triggerClassName)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          style={width ? { width } : undefined}
          className={cn(
            "su-pop absolute z-50 min-w-[200px] rounded-2xl border bg-surface p-1.5 shadow-e3",
            side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  onClick,
  children,
  danger,
  className,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] transition-colors duration-100 [&_svg]:size-[15px] [&_svg]:shrink-0",
        danger ? "text-bad hover:bg-bad-soft" : "text-ink-2 hover:bg-hover hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1.5 border-t border-line-soft" role="separator" />;
}
