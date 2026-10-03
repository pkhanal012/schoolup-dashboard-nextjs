"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthHeading, AuthShell, Field, Highlight, INPUT, SubmitButton } from "@/components/app/auth";
import { AccountStep, QUESTIONS, QuestionStep } from "@/components/app/onboarding";
import { setAnswer, usePlan } from "@/components/app/plan";

/*
 * Sign up, one question at a time: the student's name, four quick questions
 * (where, what level, what subject, when), then — last, once there is
 * something worth saving — Google or a magic link by email. Answers are kept on
 * the device, so going back never loses one.
 */

// name, four questions, account
const TOTAL = 1 + QUESTIONS.length + 1;

export default function SignupPage() {
  const plan = usePlan();
  const [step, setStep] = React.useState(0);
  // The name as it's being typed; until the student types, the saved one.
  const [draftName, setDraftName] = React.useState<string | null>(null);
  const name = draftName ?? plan.name;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const q = step - 1; // index into the questions, once past the name
  // The preview panel says good morning to whoever is signing up, live.
  const previewName = name.trim().split(/\s+/)[0].slice(0, 16);

  return (
    <AuthShell altPrompt="Already have an account?" altLabel="Log in" altHref="/login" sticker={step === 0} previewName={previewName}>
      {step > 0 ? <FlowBar step={step} total={TOTAL - 1} onBack={back} /> : null}

      {/* Keyed so every step arrives with the same small fade. */}
      <div key={step} className="su-fade">
        {step === 0 ? (
          <NameStep name={name} onChange={setDraftName} onNext={next} />
        ) : q < QUESTIONS.length ? (
          <QuestionStep question={QUESTIONS[q]} plan={plan} onNext={next} />
        ) : (
          <AccountStep plan={plan} />
        )}
      </div>
    </AuthShell>
  );
}

/** Step one: just a name. Everything else waits until there's a reason to ask. */
function NameStep({ name, onChange, onNext }: { name: string; onChange: (name: string) => void; onNext: () => void }) {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAnswer("name", name.trim());
    onNext();
  };

  return (
    <>
      <AuthHeading
        title={
          <>
            Start your <Highlight>journey</Highlight>
          </>
        }
      >
        Four quick questions to set up your plan. First, what should we call you?
      </AuthHeading>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
        <Field label="Your name" id="signup-name">
          <input
            id="signup-name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="name"
            autoFocus
            required
            className={INPUT}
          />
        </Field>
        <SubmitButton>Continue</SubmitButton>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-ink-3">About a minute · free, no card needed</p>
    </>
  );
}

/**
 * Back, and how far along: one dot per step, the current one stretched into
 * a pill — the landing page's carousel dots, after the step dots on Devin and
 * Magnific. Done steps stay inked so the trail behind you reads at a glance.
 */
function FlowBar({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="-ml-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink"
      >
        <ArrowLeft className="size-[18px]" />
      </button>
      <ol className="flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          return (
            <li
              key={n}
              aria-current={n === step ? "step" : undefined}
              className={cn(
                "h-2 rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-spring)]",
                n === step ? "w-7 bg-ink" : n < step ? "w-2 bg-ink" : "w-2 bg-[var(--line-strong)]",
              )}
            />
          );
        })}
      </ol>
    </div>
  );
}
