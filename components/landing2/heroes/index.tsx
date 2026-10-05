"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InlineHero, SearchHero, SpotlightHero, StepsHero, VoiceHero } from "./centered";
import { JourneyHero, PanelHero, StatementHero, WindowHero } from "./split";
import { LibraryHero } from "./library";

/*
 * Hero style explorer for the landing page. Each entry names the Mobbin
 * reference it was drawn from. Index 0 is the original sticker-book hero,
 * which stays in landing-two.tsx; the rest render in its place.
 */
export const HERO_STYLES: { name: string; ref: string; Hero: React.ComponentType | null }[] = [
  { name: "Sticker book", ref: "Original", Hero: null },
  { name: "Spotlight", ref: "Vizcom", Hero: SpotlightHero },
  { name: "Inline stickers", ref: "Webflow TV", Hero: InlineHero },
  { name: "Soft panel", ref: "TheyDo · Whereby", Hero: PanelHero },
  { name: "Product window", ref: "Stripe · Coda", Hero: WindowHero },
  { name: "Journey", ref: "Maze", Hero: JourneyHero },
  { name: "Statement", ref: "Dropbox · Stripe", Hero: StatementHero },
  { name: "Quiet search", ref: "Extra · Campsite", Hero: SearchHero },
  { name: "Student voice", ref: "15Five", Hero: VoiceHero },
  { name: "Three steps", ref: "Craft", Hero: StepsHero },
  { name: "Library", ref: "Mobbin", Hero: LibraryHero },
];

export function HeroSwitcher({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  const n = HERO_STYLES.length;
  const style = HERO_STYLES[index];
  return (
    <div className="hx-switcher" role="group" aria-label="Hero style">
      <button type="button" aria-label="Previous hero style" onClick={() => onChange((index - 1 + n) % n)}>
        <ChevronLeft strokeWidth={2.6} />
      </button>
      <div className="min-w-[150px] px-1 text-center leading-tight" aria-live="polite">
        <p className="text-[13px] font-semibold">
          <span className="text-white/50">
            {index + 1}/{n}
          </span>{" "}
          {style.name}
        </p>
        <p className="text-[11px] text-white/50">{style.ref}</p>
      </div>
      <button type="button" aria-label="Next hero style" onClick={() => onChange((index + 1) % n)}>
        <ChevronRight strokeWidth={2.6} />
      </button>
    </div>
  );
}
