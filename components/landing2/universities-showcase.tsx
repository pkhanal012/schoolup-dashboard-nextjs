"use client";

import * as React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { SchoolLogo } from "@/components/app/school-logo";
import { UNIVERSITIES, getUniversity } from "@/components/universities/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * The landing page's way into the university directory: a logo cloud — real
 * school marks on tiles scattered around the headline. They burst out from
 * the centre when scrolled to, float, lean away from the pointer, and each
 * opens that school's profile.
 *
 * The headline and lede use the landing page's shared data-split / data-rise
 * reveals; this component animates only its own pieces.
 */

/* Tiles around the headline (wide screens): side, offset from that edge, top, tilt, parallax depth, size. */
const CLOUD: { slug: string; side: "l" | "r"; x: string; y: string; r: number; d: number; size: number }[] = [
  { slug: "harvard-university", side: "l", x: "2%", y: "4%", r: -8, d: 26, size: 84 },
  { slug: "university-of-oxford", side: "l", x: "14%", y: "-2%", r: 6, d: 14, size: 72 },
  { slug: "massachusetts-institute-of-technology", side: "l", x: "7%", y: "36%", r: 4, d: 32, size: 76 },
  { slug: "university-of-toronto", side: "l", x: "19%", y: "30%", r: -5, d: 18, size: 68 },
  { slug: "university-of-melbourne", side: "l", x: "1%", y: "70%", r: 7, d: 22, size: 72 },
  { slug: "delft-university-of-technology", side: "l", x: "14%", y: "66%", r: -4, d: 30, size: 80 },
  { slug: "stanford-university", side: "r", x: "2%", y: "2%", r: 7, d: 24, size: 80 },
  { slug: "university-of-cambridge", side: "r", x: "15%", y: "6%", r: -6, d: 16, size: 70 },
  { slug: "national-university-of-singapore", side: "r", x: "6%", y: "38%", r: -3, d: 30, size: 76 },
  { slug: "mcgill-university", side: "r", x: "19%", y: "34%", r: 5, d: 20, size: 66 },
  { slug: "university-of-sydney", side: "r", x: "1%", y: "72%", r: -7, d: 22, size: 74 },
  { slug: "university-college-london", side: "r", x: "14%", y: "68%", r: 4, d: 28, size: 78 },
];

export function UniversitiesShowcase() {
  const root = React.useRef<HTMLElement>(null);

  /* Logo cloud: burst, float, lean. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray<HTMLElement>("[data-cloud-tile]", root.current);
        const cloud = root.current!.querySelector<HTMLElement>("[data-cloud]")!;
        // Each tile starts at the centre of the cloud and springs out to its place.
        gsap.from(tiles, {
          x: (_i, el: HTMLElement) => cloud.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2),
          y: (_i, el: HTMLElement) => cloud.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2),
          scale: 0,
          rotation: () => gsap.utils.random(-90, 90),
          duration: 1.4,
          ease: "elastic.out(1, 0.6)",
          stagger: { each: 0.05, from: "random" },
          scrollTrigger: { trigger: cloud, start: "top 75%" },
        });
        tiles.forEach((t, i) => {
          gsap.to(t.firstElementChild, { y: i % 2 ? -9 : 9, rotation: i % 2 ? 3 : -3, duration: 2.4 + (i % 4) * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
        });
        if (window.matchMedia("(pointer: fine)").matches) {
          const lean = tiles.map((t) => ({
            d: Number(t.dataset.depth),
            x: gsap.quickTo(t.querySelector("[data-lean]"), "x", { duration: 1, ease: "power3.out" }),
            y: gsap.quickTo(t.querySelector("[data-lean]"), "y", { duration: 1, ease: "power3.out" }),
          }));
          const move = (e: PointerEvent) => {
            const r = cloud.getBoundingClientRect();
            const nx = (e.clientX - r.left) / r.width - 0.5;
            const ny = (e.clientY - r.top) / r.height - 0.5;
            lean.forEach((l) => {
              l.x(-nx * l.d);
              l.y(-ny * l.d);
            });
          };
          cloud.addEventListener("pointermove", move);
          return () => cloud.removeEventListener("pointermove", move);
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="universities" aria-label="Universities" className="py-[clamp(100px,12vw,180px)]">
      {/* ------------------------------------------------- Logo cloud */}
      <div data-cloud className="l2-wrap relative">
        {/* Phones: one row of marks above the headline instead of the cloud. */}
        <div className="mb-8 flex justify-center gap-2.5 xl:hidden" aria-hidden>
          {CLOUD.slice(0, 5).map((c, i) => {
            const u = getUniversity(c.slug)!;
            return (
              <span key={c.slug} className="grid size-14 place-items-center rounded-[18px] bg-white shadow-[0_0_0_1px_var(--line),0_10px_20px_-12px_rgba(23,22,28,0.3)]" style={{ rotate: `${i % 2 ? 5 : -5}deg` }}>
                <SchoolLogo name={u.name} domain={u.domain} size={36} className="rounded-[10px] ring-0" />
              </span>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 hidden xl:block">
          {CLOUD.map((c) => {
            const u = getUniversity(c.slug)!;
            return (
              <div
                key={c.slug}
                data-cloud-tile
                data-depth={c.d}
                className="pointer-events-auto absolute"
                style={{ [c.side === "l" ? "left" : "right"]: c.x, top: c.y }}
              >
                <div>
                  <div data-lean>
                    <Link
                      href={`/universities/${u.slug}`}
                      aria-label={u.name}
                      title={u.name}
                      data-cursor={u.name.replace(/^University of /, "")}
                      className="grid place-items-center rounded-[22px] bg-white shadow-[0_0_0_1px_var(--line),0_14px_28px_-16px_rgba(23,22,28,0.35)] transition-transform duration-500 ease-[var(--ease-spring)] hover:scale-110 hover:rotate-0"
                      style={{ width: c.size, height: c.size, rotate: `${c.r}deg` }}
                    >
                      <SchoolLogo name={u.name} domain={u.domain} size={Math.round(c.size * 0.6)} className="rounded-[12px] ring-0" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mx-auto flex max-w-[560px] flex-col items-center py-0 text-center xl:min-h-[440px] xl:justify-center">
          <span data-rise className="l2-eyebrow">
            <i style={{ background: "var(--sky)" }} /> Universities
          </span>
          <h2 data-split className="l2-display l2-h2 mt-6">
            Find where you belong.
          </h2>
          <p data-rise className="l2-lede mt-5 max-w-[40ch]">
            Acceptance rates, tuition and 2027 deadlines for {UNIVERSITIES.length} universities across six regions — side by side, before you save a single one.
          </p>
          <div data-rise className="mt-8">
            <Link href="/universities" className="l2-btn">
              Explore universities <ArrowRight strokeWidth={2.4} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
