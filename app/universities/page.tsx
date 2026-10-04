import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque } from "next/font/google";
import { ArrowRight } from "lucide-react";
import { CATALOG_SIZE, UNIVERSITIES } from "@/components/universities/data";
import { Directory } from "@/components/universities/directory";
import { PageMotion } from "@/components/universities/page-motion";
import { SiteFooter, SiteNav } from "@/components/universities/site-chrome";
import "@/components/landing2/landing2.css";
import "@/components/universities/universities.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-l2-display", display: "swap" });

export const metadata: Metadata = {
  title: "Universities Directory — Acceptance Rates, Tuition & Deadlines | SchoolUp",
  description:
    "Explore top universities worldwide. Compare acceptance rates, sticker tuition, application deadlines and requirements for 2027 entry — then build your list free.",
};

export default function UniversitiesPage() {
  return (
    <div className={display.variable}>
      <div className="l2">
        <PageMotion />
        <SiteNav active="/universities" />

        <main className="pb-24 pt-[124px] md:pt-[136px]">
          <Directory>
            <p data-u-hero className="text-[14px] font-medium text-[var(--ink-3)]">
              {UNIVERSITIES.length} featured · {CATALOG_SIZE} in our catalog
            </p>
            <h1 data-u-hero className="l2-display mt-3 text-[clamp(36px,4.6vw,60px)] leading-[1.04]">
              Find where you{" "}
              <span className="whitespace-nowrap">
                <span className="inline-block -rotate-[1.5deg] rounded-[0.24em] bg-[var(--sun)] px-[0.14em]">belong</span>.
              </span>
            </h1>
            <p data-u-hero className="mt-3 max-w-[40ch] text-[16px] leading-[1.55] text-[var(--ink-2)]">
              Acceptance rates, tuition and 2027 deadlines, side by side. Click a column to sort.
            </p>
          </Directory>

          {/* One quiet call to action under the list. */}
          <div className="l2-wrap mt-6">
            <div data-u-reveal className="flex flex-col items-start justify-between gap-4 rounded-[20px] bg-[var(--soft)] px-5 py-4 md:flex-row md:items-center">
              <p className="text-[15px]">
                <b>Building a shortlist?</b> <span className="text-[var(--ink-2)]">Save schools and SchoolUp tracks every requirement and deadline.</span>
              </p>
              <Link href="/signup" className="l2-btn l2-btn--sm shrink-0">
                Start free <ArrowRight strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
