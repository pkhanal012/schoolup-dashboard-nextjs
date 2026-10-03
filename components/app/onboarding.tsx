"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Field, GoogleButton, INPUT, MagicLinkSent, OrRule, SubmitButton } from "@/components/app/auth";
import { planSummary, setAnswer, toggleDestination, type Plan } from "@/components/app/plan";
import { cn } from "@/lib/utils";

/*
 * The pieces /signup is built from: four questions, then the account.
 *
 * Kept honest and short, after the one-question-per-screen flows on Magnific,
 * Melio and Duolingo: a plain question, one line saying why we ask, and
 * answers you tap, then Continue — on every step, so moving on is always the
 * student's call. No mascot, no fake "building your plan"
 * screen, and no claims about matches until there is enough to match on —
 * English scores, grades and reminders are asked inside the app, when they
 * matter.
 */

type Option = { value: string; label: string; icon: string };

export type Question = {
  key: "destinations" | "level" | "field" | "intake";
  question: string;
  /** One honest line on why we ask. */
  why: string;
  options: Option[];
  multi?: boolean;
};

export const QUESTIONS: Question[] = [
  {
    key: "destinations",
    question: "Where do you want to study?",
    why: "Pick all that apply — you can add more later.",
    multi: true,
    options: [
      { value: "United States", label: "United States", icon: "🇺🇸" },
      { value: "Canada", label: "Canada", icon: "🇨🇦" },
      { value: "United Kingdom", label: "United Kingdom", icon: "🇬🇧" },
      { value: "Germany", label: "Germany", icon: "🇩🇪" },
      { value: "Australia", label: "Australia", icon: "🇦🇺" },
      { value: "Netherlands", label: "Netherlands", icon: "🇳🇱" },
    ],
  },
  {
    key: "level",
    question: "What are you applying for?",
    why: "So we only show programmes at the right level.",
    options: [
      { value: "Bachelor's", label: "Bachelor's", icon: "🎓" },
      { value: "Master's", label: "Master's", icon: "📘" },
      { value: "PhD", label: "PhD", icon: "🔬" },
      { value: "Diploma", label: "Diploma or certificate", icon: "📄" },
    ],
  },
  {
    key: "field",
    question: "What do you want to study?",
    why: "Roughly is fine — you can narrow it down later.",
    options: [
      { value: "Engineering", label: "Engineering", icon: "⚙️" },
      { value: "Computer science", label: "Computer science", icon: "💻" },
      { value: "Business", label: "Business", icon: "📈" },
      { value: "Health", label: "Health and medicine", icon: "🩺" },
      { value: "Sciences", label: "Sciences", icon: "🔭" },
      { value: "Arts", label: "Arts and humanities", icon: "🎨" },
    ],
  },
  {
    key: "intake",
    question: "When do you want to start?",
    why: "We'll plan your deadlines backwards from this.",
    options: [
      { value: "Fall 2027", label: "Fall 2027", icon: "🍂" },
      { value: "Spring 2028", label: "Spring 2028", icon: "🌱" },
      { value: "Fall 2028", label: "Fall 2028", icon: "📅" },
      { value: "Not sure yet", label: "I'm not sure yet", icon: "🤔" },
    ],
  },
];

/* ------------------------------------------------------------ Questions */

export function QuestionStep({
  question,
  plan,
  onNext,
}: {
  question: Question;
  plan: Plan;
  onNext: () => void;
}) {
  const selected = (value: string) => (question.multi ? plan.destinations.includes(value) : plan[question.key] === value);
  const answered = question.multi ? plan.destinations.length > 0 : Boolean(plan[question.key]);

  const choose = (value: string) =>
    question.multi ? toggleDestination(value) : setAnswer(question.key as Exclude<Question["key"], "destinations">, value);

  return (
    <>
      <h1 className="su-display text-[clamp(28px,3.4vw,36px)] leading-[1.08]">{question.question}</h1>
      <p className="mt-2 text-[14.5px] text-ink-2">{question.why}</p>

      <div role={question.multi ? "group" : "radiogroup"} aria-label={question.question} className="mt-7 grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
        {question.options.map((o, i) => (
          <Choice key={o.value} label={o.label} icon={o.icon} index={i} multi={question.multi} selected={selected(o.value)} onClick={() => choose(o.value)} />
        ))}
      </div>

      <div className="mt-7">
        <NextButton disabled={!answered} onClick={onNext} />
      </div>
    </>
  );
}

/* Each option's emoji sits on its own pastel, so a list reads like a sheet of stickers. */
const TONES = ["bg-sun-soft", "bg-pink-soft", "bg-sky-soft", "bg-mint-soft", "bg-lilac-soft", "bg-coral-soft"];

/** One option: a rounded tile. Picked, it turns sun-yellow with an ink edge and a tick. */
function Choice({
  label,
  icon,
  selected,
  multi,
  index,
  onClick,
}: {
  label: string;
  icon: string;
  selected: boolean;
  multi?: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      className={cn(
        "relative flex min-h-[64px] w-full items-center gap-3 rounded-[20px] px-3 py-3 text-left transition-[background-color,box-shadow,transform] duration-300 ease-[var(--ease-spring)] active:scale-[0.97]",
        selected
          ? "bg-sun-soft shadow-[inset_0_0_0_2px_var(--ink)]"
          : "bg-surface shadow-[inset_0_0_0_1.5px_var(--line)] hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-full text-[20px] leading-none transition-transform duration-300 ease-[var(--ease-spring)]",
          selected ? "-rotate-6 scale-110 bg-surface" : TONES[index % TONES.length],
        )}
      >
        {icon}
      </span>
      <span className={cn("min-w-0 flex-1 text-[14px] leading-snug", selected ? "font-semibold" : "font-medium")}>{label}</span>
      <span
        aria-hidden
        className={cn(
          "absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-surface shadow-e2 transition-[opacity,transform] duration-300 ease-[var(--ease-spring)]",
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}

/** The step's way forward: the landing page's ink pill, arrow and all. */
function NextButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-surface shadow-[0_10px_24px_-12px_rgba(23,22,28,0.55)] transition-[transform,box-shadow,opacity] duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30 disabled:shadow-none"
    >
      Continue
      <ArrowRight className="size-[18px] transition-transform duration-300 ease-[var(--ease-spring)] group-hover:translate-x-1" strokeWidth={2.4} />
    </button>
  );
}

/* -------------------------------------------------------------- Account */

/**
 * Last, once there is something worth saving: Google, or an email that gets a
 * one-tap magic link. No password to invent; the name is already known.
 */
export function AccountStep({ plan }: { plan: Plan }) {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const first = plan.name.trim().split(/\s+/)[0];
  const summary = planSummary(plan);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: create the account and email the sign-up link. The answers are already saved on this device.
    setSent(true);
  };

  if (sent) return <MagicLinkSent email={email} onChangeEmail={() => setSent(false)} />;

  return (
    <>
      <h1 className="su-display text-[clamp(28px,3.4vw,36px)] leading-[1.08]">{first ? `Last step, ${first}` : "Last step"}</h1>
      <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">Where should we send your sign-up link? Your answers are saved to the account.</p>
      {summary ? (
        <p className="mt-4 rounded-2xl bg-sunken px-4 py-3 text-[13px] leading-relaxed text-ink-2 ring-1 ring-inset ring-[var(--line)]">{summary}</p>
      ) : null}

      <div className="mt-6">
        <GoogleButton />
      </div>

      <OrRule label="or with email" />

      <form onSubmit={submit} className="flex flex-col gap-5">
        <Field label="Email" id="account-email">
          <input
            id="account-email"
            name="email"
            type="email"
            placeholder="you@school.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            required
            className={INPUT}
          />
        </Field>
        <SubmitButton>Send my sign-up link</SubmitButton>
        <p className="text-center text-[12px] leading-relaxed text-ink-3">
          No password needed — we send a one-tap link that expires in 15 minutes. By creating an account you agree to our{" "}
          <a href="/terms" className="font-medium text-ink-2 underline underline-offset-2 hover:text-ink">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="font-medium text-ink-2 underline underline-offset-2 hover:text-ink">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </>
  );
}
