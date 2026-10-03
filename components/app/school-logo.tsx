"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A university's brand mark, used wherever a school is named — the colleges
 * list and map, and the scholarships that come from one.
 *
 * Marks come from logo.dev, which needs a publishable key in
 * NEXT_PUBLIC_LOGO_DEV_TOKEN. The monogram sits underneath the image, so with
 * no key — or a lookup that fails — the row degrades to initials instead of a
 * broken image.
 */
const LOGO_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

const SKIP_WORDS = ["of", "the", "and", "&", "at"];

function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter((w) => w && !SKIP_WORDS.includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function SchoolLogo({ name, domain, size = 36, className }: { name: string; domain: string; size?: number; className?: string }) {
  const [failed, setFailed] = React.useState(false);
  const showLogo = Boolean(LOGO_TOKEN) && !failed;

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-lg ring-1 ring-inset ring-[var(--line)]",
        // A white tile keeps brand colours legible in either theme.
        showLogo ? "bg-white" : "bg-sunken",
        className,
      )}
    >
      <span className="font-mono font-semibold leading-none text-ink-3" style={{ fontSize: Math.round(size * 0.34) }}>
        {initials(name)}
      </span>
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element -- a remote logo service, sized by us; the optimiser has nothing to add
        <img
          // The image is server-rendered, so it can fail before React attaches
          // onError. This ref catches that case on mount; onError covers the rest.
          ref={(el) => {
            if (el && el.complete && el.naturalWidth === 0) setFailed(true);
          }}
          // fallback=404 rather than logo.dev's own monogram, so a missing logo
          // lands on the app-styled one underneath instead of a third look.
          src={`https://img.logo.dev/${encodeURIComponent(domain)}?token=${LOGO_TOKEN}&size=${size}&retina=true&format=png&fallback=404`}
          alt=""
          aria-hidden
          loading="lazy"
          onError={() => setFailed(true)}
          // logo.dev already returns a square canvas with its own margin, so
          // any padding here would just be a second white border.
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
    </span>
  );
}
