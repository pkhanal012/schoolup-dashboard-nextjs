import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/landing2/logo-mark";

/*
 * Nav and footer for the public pages beyond the landing page. Built from the
 * landing page's own classes (landing2.css), so the site reads as one piece;
 * the landing page keeps its own animated copies.
 */

const LINKS = [
  { href: "/#product", label: "Product" },
  { href: "/universities", label: "Universities" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

const WORDMARK = ["#42befc", "#ffd23f", "#ff6b4a", "#a98bff", "#34d399", "#ff8fcf"];

export function SiteNav({ active }: { active?: string }) {
  return (
    <header className="l2-nav">
      <Link href="/" aria-label="SchoolUp home" className="mr-auto">
        <Image src="/images/logos/logo_black.svg" alt="SchoolUp" width={91} height={19} className="h-[19px] w-auto" preload />
      </Link>
      <nav className="hidden items-center md:flex">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={active === l.href ? "page" : undefined} className="l2-navlink aria-[current=page]:bg-[var(--soft)] aria-[current=page]:text-[var(--ink)]">
            {l.label}
          </Link>
        ))}
      </nav>
      <Link href="/login" className="l2-navlink ml-auto hidden sm:inline-flex md:ml-2">
        Log in
      </Link>
      <Link href="/signup" className="l2-btn l2-btn--sm">
        Start free <ArrowRight strokeWidth={2.4} />
      </Link>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="l2-wrap pb-10 pt-20">
      <div className="flex flex-col justify-between gap-10 md:flex-row">
        <div>
          <Image src="/images/logos/logo_black.svg" alt="SchoolUp" width={91} height={19} className="h-[20px] w-auto" />
          <p className="mt-3 max-w-[28ch] text-[15px] text-[var(--ink-2)]">Study abroad, minus the panic. Made for students in 89 countries.</p>
        </div>
        <div className="flex gap-16 text-[15px]">
          <div className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/login" className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
              Log in
            </Link>
            <Link href="/signup" className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-14" aria-hidden>
        <LogoMark className="block h-auto w-full" colors={WORDMARK} />
      </div>
      <p className="mt-6 text-center text-[13px] text-[var(--ink-3)]">© 2026 SchoolUp Academy</p>
    </footer>
  );
}
