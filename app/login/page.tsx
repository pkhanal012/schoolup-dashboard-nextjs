"use client";

import * as React from "react";
import { AuthHeading, AuthShell, Field, GoogleButton, Highlight, INPUT, MagicLinkSent, OrRule, SubmitButton } from "@/components/app/auth";

/* Log in — Google first (the fastest way back in), or an email that gets a
   one-tap magic link. No password to remember, so nothing to reset. */

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: email the login link.
    setSent(true);
  };

  return (
    <AuthShell altPrompt="New to SchoolUp?" altLabel="Get started" altHref="/signup" sticker={!sent}>
      {sent ? (
        <MagicLinkSent email={email} onChangeEmail={() => setSent(false)} />
      ) : (
        <>
          <AuthHeading
            title={
              <>
                Welcome <Highlight>back</Highlight>
              </>
            }
          >
            Your drafts, deadlines and shortlist are exactly where you left them.
          </AuthHeading>

          <div className="mt-8">
            <GoogleButton />
          </div>

          <OrRule label="or with email" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="Email" id="login-email">
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className={INPUT}
              />
            </Field>
            <SubmitButton>Send my login link</SubmitButton>
            <p className="text-center text-[12px] leading-relaxed text-ink-3">No password needed — we email a one-tap link that expires in 15 minutes.</p>
          </form>
        </>
      )}
    </AuthShell>
  );
}
