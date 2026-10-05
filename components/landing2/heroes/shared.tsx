import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/*
 * Bits every hero variant shares.
 *
 * Entrance motion is CSS only (.hx-rise / .hx-pop with a --i stagger) so the
 * variants never touch the page's GSAP context. --hx-delay holds them back
 * behind the loader on first paint.
 */

export const at = (i: number) => ({ "--i": i }) as React.CSSProperties;

export function Ctas({
  className = "",
  style,
  primary = "l2-btn",
  ghost = "l2-btn l2-btn--ghost",
}: {
  className?: string;
  style?: React.CSSProperties;
  primary?: string;
  ghost?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`} style={style}>
      <Link href="/signup" className={primary}>
        Start free <ArrowRight strokeWidth={2.4} />
      </Link>
      <a href="#how" className={ghost}>
        See how it works
      </a>
    </div>
  );
}

/** Calls fn every `ms` unless the viewer prefers reduced motion. */
export function useTicker(fn: () => void, ms: number) {
  const ref = React.useRef(fn);
  React.useEffect(() => {
    ref.current = fn;
  });
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => ref.current(), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}
