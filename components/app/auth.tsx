"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StickerArt } from "@/components/ui/kit";
import { ProductMock } from "@/components/landing/product-mock";

/*
 * The shell both auth pages sit in — the landing page's sticker book, so the
 * pages read as SchoolUp before anyone signs in.
 *
 * Two rounded sheets on the dotted paper: the form on white, and beside it the
 * landing page's sky frame with the Home screen rising in from below — after
 * the inset product panels on Lindy and Buffer. The form leads with Google,
 * then email. No passwords: email gets a one-tap magic link.
 *
 * `su-auth` keeps the page on paper whichever app theme is saved, unless it is
 * Dark, where the whole page goes dark with the rest of the app.
 */

/** The page frame: the form's sheet, and the sky frame beside it on wide screens. */
export function AuthShell({
  altPrompt,
  altLabel,
  altHref,
  sticker = true,
  previewName,
  children,
}: {
  /** Who the dashboard preview greets — /signup passes the name as it's typed. */
  previewName?: string;
  /** The small sticker above the form below lg; off for steps that bring their own art. */
  sticker?: boolean;
  /** The other page, offered in the form sheet's top corner. */
  altPrompt: string;
  altLabel: string;
  altHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="su-auth su-paper flex min-h-svh gap-3 bg-ground p-2 text-ink sm:p-3 lg:h-svh">
      {/* ── The form sheet ── */}
      <div className="flex min-h-0 flex-1 flex-col rounded-[28px] bg-surface shadow-e2 ring-1 ring-[var(--line)]">
        <header className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7">
          <Link href="/" aria-label="SchoolUp home" className="shrink-0">
            <Image src="/images/logos/logo_black.svg" alt="SchoolUp" width={91} height={19} priority className="dark:hidden" />
            <Image src="/images/logos/logo_white.svg" alt="" aria-hidden width={91} height={19} priority className="hidden dark:block" />
          </Link>
          <p className="flex items-center gap-2 text-[13px] text-ink-2">
            <span className="hidden sm:inline">{altPrompt}</span>
            <a
              href={altHref}
              className="inline-flex h-9 items-center rounded-full px-4 font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--line)] transition-[box-shadow,transform] duration-300 ease-[var(--ease-spring)] hover:-translate-y-px hover:shadow-[inset_0_0_0_1.5px_var(--ink)]"
            >
              {altLabel}
            </a>
          </p>
        </header>

        {/* The form scrolls inside its sheet on short screens; the sky frame stays put. */}
        <main className="thin-scrollbar flex min-h-0 flex-1 overflow-y-auto">
          <div className="m-auto w-full max-w-[420px] px-5 py-10 sm:px-8">
            {sticker ? <MobileSticker /> : null}
            {children}
          </div>
        </main>

        <footer className="px-5 pb-5 text-[12px] text-ink-3 sm:px-8 sm:pb-6">© 2026 SchoolUp Academy</footer>
      </div>

      {/* ── The sky frame ── */}
      <SkyFrame name={previewName} />
    </div>
  );
}

/** Heading and standfirst at the top of the form. Wrap one word in <Highlight>. */
export function AuthHeading({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <h1 className="su-display text-[clamp(32px,4vw,40px)] leading-[1.05]">{title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{children}</p>
    </>
  );
}

/** The landing page's rotating-word pill: one word, on a tilted sun-yellow sticker. */
export function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="inline-block -rotate-[1.5deg] rounded-[0.28em] bg-sun px-[0.18em] text-[#17161c]">{children}</span>;
}

/* ── The sky frame ────────────────────────────────────────────────────── */

/**
 * Just the product: the real Home screen rising into the sky frame from below,
 * bleeding off the right and bottom edges — what you're signing in to, shown
 * rather than described (after the inset product panels on Lindy and Buffer).
 */
function SkyFrame({ name }: { name?: string }) {
  return (
    <aside aria-hidden className="su-pat-dots relative hidden w-[46%] max-w-[760px] shrink-0 overflow-hidden rounded-[28px] bg-sky [--pc:rgba(255,255,255,0.22)] lg:block">
      <div className="absolute -bottom-10 left-14 w-[150%] xl:left-20">
        <div className="su-mock overflow-hidden rounded-tl-[18px] bg-[#141413] shadow-[0_-10px_60px_-20px_rgba(4,41,60,0.6)]">
          <ProductMock name={name || undefined} />
        </div>
      </div>
    </aside>
  );
}

/** Below lg the sky frame steps aside; one sticker keeps the page from feeling bare. */
function MobileSticker() {
  return (
    <Image
      src="/images/stickers/interview.webp"
      alt=""
      aria-hidden
      width={160}
      height={160}
      className="mb-6 h-auto w-16 -rotate-3 drop-shadow-[0_8px_10px_rgba(23,22,28,0.18)] lg:hidden"
    />
  );
}

/* ── Form bits ────────────────────────────────────────────────────────── */

/* Focus shows through the app-wide focus ring; the field also lifts to white. */
export const INPUT =
  "h-12 w-full rounded-2xl bg-sunken px-4 text-[14.5px] text-ink ring-1 ring-inset ring-[var(--line)] transition-[box-shadow,background-color] placeholder:text-ink-4 hover:ring-[var(--line-strong)] focus:bg-surface";

export function Field({
  label,
  id,
  className,
  action,
  hint,
  children,
}: {
  label: string;
  id: string;
  className?: string;
  /** Optional control on the label's right — a "Change" link, say. */
  action?: React.ReactNode;
  /** A line under the field. */
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="block text-[13px] font-medium text-ink">
          {label}
        </label>
        {action}
      </div>
      {children}
      {hint ? <div className="mt-2 text-[12px] text-ink-3">{hint}</div> : null}
    </div>
  );
}

/** "or" between single sign-on and the email form. */
export function OrRule({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-3 text-[12.5px] text-ink-3">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** The ink pill that submits the form, arrow and all — the landing page's "Start free". */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-surface shadow-[0_10px_24px_-12px_rgba(23,22,28,0.55)] transition-[transform,box-shadow] duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-14px_rgba(23,22,28,0.6)] active:scale-[0.98]"
    >
      {children}
      <ArrowRight className="size-[18px] transition-transform duration-300 ease-[var(--ease-spring)] group-hover:translate-x-1" strokeWidth={2.4} />
    </button>
  );
}

/** Sign in with Google: first on the form, because it's the fastest way in. */
export function GoogleButton({ children = "Continue with Google" }: { children?: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-surface text-[14.5px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--line)] transition-[box-shadow,transform] duration-300 ease-[var(--ease-spring)] hover:-translate-y-px hover:shadow-[inset_0_0_0_1.5px_var(--ink)] active:scale-[0.98]"
    >
      <GoogleIcon />
      {children}
    </button>
  );
}

/**
 * After a magic link is sent: where it went, how long it lasts, and the two
 * things people need next — send it again (after a short wait, so nobody
 * floods their own inbox) or fix a mistyped address.
 */
export function MagicLinkSent({ email, onChangeEmail }: { email: string; onChangeEmail: () => void }) {
  const [wait, setWait] = React.useState(30);
  const [resent, setResent] = React.useState(false);

  React.useEffect(() => {
    if (wait <= 0) return;
    const t = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(t);
  }, [wait]);

  const resend = () => {
    // TODO: send the link again.
    setResent(true);
    setWait(30);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <StickerArt src="/images/stickers/notification.webp" className="size-36" />
      <h1 className="su-display mt-5 text-[clamp(28px,3.4vw,36px)] leading-[1.08]">
        Check your <Highlight>inbox</Highlight>
      </h1>
      <p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-ink-2">
        We sent a one-tap link to <span className="font-semibold text-ink">{email}</span>. It expires in 15 minutes.
      </p>

      <div className="mt-8 flex w-full flex-col gap-2.5">
        <button
          type="button"
          onClick={resend}
          disabled={wait > 0}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-surface text-[14.5px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--line)] transition-[box-shadow,transform,opacity] duration-300 ease-[var(--ease-spring)] hover:-translate-y-px hover:shadow-[inset_0_0_0_1.5px_var(--ink)] disabled:pointer-events-none disabled:text-ink-3"
        >
          {wait > 0 ? `Resend in 0:${String(wait).padStart(2, "0")}` : "Resend link"}
        </button>
        <button type="button" onClick={onChangeEmail} className="h-10 text-[13.5px] font-medium text-ink-2 transition-colors hover:text-ink">
          Use a different email
        </button>
      </div>

      <p className="mt-6 text-[12.5px] text-ink-3" aria-live="polite">
        {resent ? "Sent again — check spam or promotions if it's not there." : "Can't find it? Check spam or promotions."}
      </p>
    </div>
  );
}

/* ── Inline SVG icons ─────────────────────────────────────────────────── */

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
