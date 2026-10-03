"use client";

import * as React from "react";
import { Check, GraduationCap, Globe2, CalendarRange, Wallet, GaugeCircle, BookMarked, RotateCcw, X } from "lucide-react";
import { schools, type School } from "./data";
import { Button, Chip, Label, fieldStyles } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/*
 * The study plan, and the sheet that edits it.
 *
 * The old editor was one long scroll of look-alike pill groups: six questions
 * that all looked equally urgent, purple outlines everywhere, and no sign of
 * what any answer did. This one splits the questions into named sections you
 * can jump between, gives each option a caption saying what it changes, and
 * keeps a live count of matching schools under the whole thing — so an edit
 * has a visible consequence before you commit it.
 */

export type StudyPlan = {
  degreeLevel: string;
  field: string;
  destinations: string[];
  intake: string;
  budget: string;
  gpa: string;
  englishTest: string;
};

export const DEFAULT_PLAN: StudyPlan = {
  degreeLevel: "Master's",
  field: "MEng Engineering",
  destinations: ["United States", "Canada"],
  intake: "Fall 2027",
  budget: "$35k - $55k / year",
  gpa: "3.4 / 4.0",
  englishTest: "IELTS 7.0",
};

const DEGREE_OPTIONS: { value: string; hint: string }[] = [
  { value: "Bachelor's", hint: "Undergraduate entry" },
  { value: "Master's", hint: "Taught or research, 1–2 years" },
  { value: "PhD / Doctorate", hint: "Funded research, 3–5 years" },
  { value: "MBA", hint: "Work experience usually required" },
];

export const DESTINATION_OPTIONS = [
  { id: "United States", flag: "🇺🇸", match: ["USA", "United States"] },
  { id: "Canada", flag: "🇨🇦", match: ["Canada"] },
  { id: "United Kingdom", flag: "🇬🇧", match: ["UK", "United Kingdom"] },
  { id: "Germany", flag: "🇩🇪", match: ["Germany"] },
  { id: "Australia", flag: "🇦🇺", match: ["Australia"] },
];

const INTAKE_OPTIONS: { value: string; hint: string }[] = [
  { value: "Fall 2027", hint: "Applications close Dec–Feb" },
  { value: "Spring 2028", hint: "Smaller intake, fewer places" },
  { value: "Fall 2028", hint: "A full year to prepare" },
  { value: "Spring 2029", hint: "Furthest out we track" },
];

const BUDGET_OPTIONS: { value: string; hint: string }[] = [
  { value: "Any budget", hint: "Show every match, cost aside" },
  { value: "< $35k / year", hint: "Public universities and most of Europe" },
  { value: "$35k - $55k / year", hint: "Most North American master's" },
  { value: "$55k+ / year", hint: "Private and top-ranked programmes" },
  { value: "Full aid needed", hint: "Only fully funded places" },
];

const FIELD_SUGGESTIONS = ["MEng Engineering", "Computer Science", "Data Science & AI", "Business Analytics", "Biomedical Eng."];

/* ------------------------------------------------------------- Matching */

/** One place to decide whether a school sits in a chosen country. */
export function inDestination(school: School, destination: string): boolean {
  const option = DESTINATION_OPTIONS.find((d) => d.id === destination);
  if (!option) return school.place.toLowerCase().includes(destination.toLowerCase());
  return option.match.some((m) => school.place.includes(m));
}

export function schoolsFor(plan: StudyPlan): School[] {
  if (!plan.destinations.length) return schools;
  return schools.filter((s) => plan.destinations.some((d) => inDestination(s, d)));
}

/* -------------------------------------------------------------- Sections */

type SectionId = "degree" | "field" | "destinations" | "intake" | "budget" | "scores";

const SECTIONS: { id: SectionId; label: string; icon: React.ElementType; title: string; blurb: string }[] = [
  { id: "degree", label: "Degree", icon: GraduationCap, title: "Degree level", blurb: "Sets which programmes you see and which prerequisites get checked." },
  { id: "field", label: "Field", icon: BookMarked, title: "Field of study", blurb: "Your major or graduate concentration, in the words a department would use." },
  { id: "destinations", label: "Destinations", icon: Globe2, title: "Where you want to study", blurb: "Matches, deadlines and cost estimates all follow this." },
  { id: "intake", label: "Intake", icon: CalendarRange, title: "Target intake", blurb: "Drives every countdown and deadline warning in the app." },
  { id: "budget", label: "Budget", icon: Wallet, title: "Annual tuition budget", blurb: "What you can carry per year after scholarships and aid." },
  { id: "scores", label: "Scores", icon: GaugeCircle, title: "Academic scores", blurb: "Optional. Used to tell a reach apart from a safety." },
];

/** What the section rail shows under each name — the answer, not the question. */
function valueOf(plan: StudyPlan, id: SectionId): string {
  switch (id) {
    case "degree":
      return plan.degreeLevel;
    case "field":
      return plan.field || "Not set";
    case "destinations":
      return plan.destinations.length ? plan.destinations.join(", ") : "Anywhere";
    case "intake":
      return plan.intake;
    case "budget":
      return plan.budget;
    case "scores":
      return [plan.gpa, plan.englishTest].filter(Boolean).join(" · ") || "Not set";
  }
}

/* ---------------------------------------------------------------- Editor */

export function PlanEditor({
  open,
  onClose,
  plan,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  plan: StudyPlan;
  onSave: (next: StudyPlan) => void;
}) {
  // The sheet unmounts when it closes, so the draft starts from the saved plan
  // every time it opens — no effect copying props into state.
  if (!open) return null;
  return <Editor onClose={onClose} plan={plan} onSave={onSave} />;
}

function Editor({ onClose, plan, onSave }: { onClose: () => void; plan: StudyPlan; onSave: (next: StudyPlan) => void }) {
  const [draft, setDraft] = React.useState<StudyPlan>(plan);
  const [section, setSection] = React.useState<SectionId>("degree");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const set = <K extends keyof StudyPlan>(key: K, value: StudyPlan[K]) => setDraft((p) => ({ ...p, [key]: value }));

  const toggleDestination = (id: string) =>
    setDraft((p) => ({
      ...p,
      destinations: p.destinations.includes(id) ? p.destinations.filter((d) => d !== id) : [...p.destinations, id],
    }));

  const matches = schoolsFor(draft);
  const soonest = [...matches].sort((a, b) => a.daysLeft - b.daysLeft)[0];
  const changed = JSON.stringify(draft) !== JSON.stringify(plan);
  const active = SECTIONS.find((s) => s.id === section)!;

  return (
    <div
      className="su-fade fixed inset-0 z-50 flex items-end justify-center bg-[rgba(16,15,12,0.32)] p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit study plan"
        onClick={(e) => e.stopPropagation()}
        className="su-pop flex h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border bg-surface shadow-e4 sm:h-auto sm:max-h-[84vh] sm:max-w-[860px] sm:flex-row sm:rounded-[28px]"
      >
        {/* The rail is the whole form at a glance: six questions and their
            current answers. On a phone it lies down as a scrolling strip. */}
        <nav
          aria-label="Plan sections"
          className="flex shrink-0 gap-1 overflow-x-auto border-b bg-sunken p-2 sm:w-[216px] sm:flex-col sm:overflow-y-auto sm:border-b-0 sm:border-r sm:p-3"
        >
          <Label className="hidden px-2.5 pb-2 pt-1 sm:block">Study plan</Label>
          {SECTIONS.map((s) => {
            const on = s.id === section;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                aria-current={on}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors sm:shrink",
                  on ? "bg-surface text-ink shadow-e1" : "text-ink-2 hover:bg-hover hover:text-ink",
                )}
              >
                <s.icon className="size-4 shrink-0" strokeWidth={1.75} />
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-[12.5px] font-medium sm:whitespace-normal">{s.label}</span>
                  <span className="hidden truncate text-[11px] text-ink-3 sm:block">{valueOf(draft, s.id)}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line-soft px-5 py-4">
            <div className="min-w-0">
              <h2 className="su-display text-[19px] leading-tight">{active.title}</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{active.blurb}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1.5 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:min-h-[318px]">
            {section === "degree" ? (
              <OptionList>
                {DEGREE_OPTIONS.map((o) => (
                  <Option key={o.value} selected={draft.degreeLevel === o.value} onClick={() => set("degreeLevel", o.value)} title={o.value} hint={o.hint} />
                ))}
              </OptionList>
            ) : null}

            {section === "field" ? (
              <div>
                <label htmlFor="plan-field" className="sr-only">
                  Field of study
                </label>
                <input
                  id="plan-field"
                  value={draft.field}
                  onChange={(e) => set("field", e.target.value)}
                  placeholder="e.g. MEng Engineering"
                  className={fieldStyles}
                />
                <Label className="mt-4">Common here</Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {FIELD_SUGGESTIONS.map((f) => (
                    <Chip key={f} active={draft.field === f} onClick={() => set("field", f)}>
                      {f}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : null}

            {section === "destinations" ? (
              <OptionList>
                {DESTINATION_OPTIONS.map((d) => {
                  const count = schools.filter((s) => inDestination(s, d.id)).length;
                  return (
                    <Option
                      key={d.id}
                      multiple
                      selected={draft.destinations.includes(d.id)}
                      onClick={() => toggleDestination(d.id)}
                      lead={<span aria-hidden className="text-[17px] leading-none">{d.flag}</span>}
                      title={d.id}
                      // A real count, so the choice is made against what is there.
                      hint={count ? `${count} school${count === 1 ? "" : "s"} we track` : "No schools tracked yet"}
                    />
                  );
                })}
                {!draft.destinations.length ? (
                  <p className="pt-1 text-[12px] text-ink-3">Nothing selected — you will see every school we track.</p>
                ) : null}
              </OptionList>
            ) : null}

            {section === "intake" ? (
              <OptionList>
                {INTAKE_OPTIONS.map((o) => (
                  <Option key={o.value} selected={draft.intake === o.value} onClick={() => set("intake", o.value)} title={o.value} hint={o.hint} />
                ))}
              </OptionList>
            ) : null}

            {section === "budget" ? (
              <OptionList>
                {BUDGET_OPTIONS.map((o) => (
                  <Option key={o.value} selected={draft.budget === o.value} onClick={() => set("budget", o.value)} title={o.value} hint={o.hint} />
                ))}
              </OptionList>
            ) : null}

            {section === "scores" ? (
              <div className="flex flex-col gap-4">
                <ScoreField
                  id="plan-gpa"
                  label="Undergraduate GPA"
                  hint="However your transcript states it — 3.4 / 4.0, 75%, First class."
                  value={draft.gpa}
                  onChange={(v) => set("gpa", v)}
                  placeholder="3.4 / 4.0"
                />
                <ScoreField
                  id="plan-english"
                  label="English test"
                  hint="Leave blank if you have not sat one yet."
                  value={draft.englishTest}
                  onChange={(v) => set("englishTest", v)}
                  placeholder="IELTS 7.0"
                />
              </div>
            ) : null}
          </div>

          {/* What the draft does, before it is saved. */}
          <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-line-soft px-5 py-2.5 text-[12px]">
            <span className="text-ink-2">
              <strong className="font-mono font-semibold tabular-nums">{matches.length}</strong> school{matches.length === 1 ? "" : "s"} match this plan
            </span>
            {soonest ? (
              <span className="text-ink-3">
                Closest deadline: {soonest.name} · {soonest.deadline}
              </span>
            ) : null}
          </div>

          <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-line-soft bg-sunken px-5 py-3.5">
            <Button size="sm" variant="ghost" onClick={() => setDraft(DEFAULT_PLAN)} className="text-ink-3 hover:text-ink">
              <RotateCcw className="size-3.5" /> Reset
            </Button>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                disabled={!changed}
                onClick={() => {
                  onSave(draft);
                  onClose();
                }}
              >
                Save plan
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Parts */

function OptionList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>;
}

/**
 * One answer. Selection is a tinted surface and a tick, not an outline — with
 * five of these on screen, five purple borders read as five warnings.
 */
function Option({
  selected,
  onClick,
  title,
  hint,
  lead,
  multiple,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint?: string;
  lead?: React.ReactNode;
  /** Several can be on at once, so the tick is a box rather than a dot. */
  multiple?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-150",
        selected ? "bg-primary-soft" : "bg-sunken hover:bg-hover",
      )}
    >
      {lead}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-semibold tracking-[-0.15px] text-ink">{title}</span>
        {hint ? <span className="mt-0.5 block truncate text-[12px] text-ink-3">{hint}</span> : null}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-[18px] shrink-0 place-items-center transition-colors",
          multiple ? "rounded-[5px]" : "rounded-full",
          selected ? "bg-primary text-primary-ink" : "border-[1.5px] border-line-strong",
        )}
      >
        {selected ? <Check className="size-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

function ScoreField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[13px] font-medium">
        {label}
      </label>
      <p className="mt-0.5 text-[12px] text-ink-3">{hint}</p>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(fieldStyles, "mt-2")}
      />
    </div>
  );
}
