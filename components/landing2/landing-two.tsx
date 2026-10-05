"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { CustomEase } from "gsap/CustomEase";
import { CustomWiggle } from "gsap/CustomWiggle";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { ArrowRight, Check, GraduationCap, MapPin } from "lucide-react";
import { ProductMock } from "@/components/landing/product-mock";
import { FEATURES } from "@/components/landing/features";
import { PlaneGame } from "./plane-game";
import { LogoMark } from "./logo-mark";
import { UniversitiesShowcase } from "./universities-showcase";
import { HERO_STYLES, HeroSwitcher } from "./heroes";
import { blobPath, NOTES, NOTE_TONES, PaperPlane, PLANS, SCHOOLS, STATS, STEPS, STICKERS, SWAP_WORDS, Star, Sticker, COLORS } from "./parts";

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, MotionPathPlugin, DrawSVGPlugin, Physics2DPlugin, CustomEase, CustomWiggle, useGSAP);

/*
 * The landing page (/) — the sticker book.
 *
 * loader → hero (throwable stickers, rotating word) → paper-plane flight into
 * the product → school pills → toolkit bento → stacking steps → numbers →
 * notes you can move → pricing → confetti close.
 *
 * Every animation is registered inside one gsap.matchMedia so reduced motion
 * gets a still, fully readable page and desktop-only pieces rebuild cleanly.
 */

const NAV = [
  { href: "#product", label: "Product" },
  { href: "#toolkit", label: "Toolkit" },
  { href: "/universities", label: "Universities" },
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
];

const TOOL_STYLE = [
  { bg: "var(--sun-soft)", pc: "rgba(255, 196, 0, 0.32)", pat: "l2-pat-dots", art: "/images/stickers/calendar.webp" },
  { bg: "var(--mint-soft)", pc: "rgba(52, 211, 153, 0.28)", pat: "l2-pat-grid", art: "/images/stickers/university.webp" },
  { bg: "var(--pink-soft)", pc: "rgba(255, 143, 207, 0.3)", pat: "l2-pat-stripes", art: "/images/stickers/admission.webp" },
  { bg: "var(--lilac-soft)", pc: "rgba(169, 139, 255, 0.35)", pat: "l2-pat-waves", art: "/images/stickers/writing.webp" },
  { bg: "var(--sky-soft)", pc: "rgba(66, 190, 252, 0.3)", pat: "l2-pat-rings", art: "/images/stickers/interview.webp" },
];

const FLIGHT =
  "M -40 290 C 180 320 300 180 470 200 C 640 220 700 330 820 290 C 940 250 900 110 820 120 C 740 130 760 260 900 250 C 1060 240 1180 90 1480 60";

// The loader plane's route, in the logo's own units (the wordmark spans 0–91 × 0–19):
// in from the lower left, along under the letters, up past "UP", a small loop, then away.
const LOADER_FLIGHT =
  "M -24 34 C -6 38 10 30 28 27 C 46 24 58 30 70 24 C 80 19 86 6 94 2 C 102 -2 108 4 104 10 C 100 16 92 8 100 -6 C 106 -16 116 -22 124 -30";

const STAR_PATH = "M12 1.5c.6 4.6 2.4 7.6 10.5 10.5-8.1 2.9-9.9 5.9-10.5 10.5-.6-4.6-2.4-7.6-10.5-10.5C9.6 9.1 11.4 6.1 12 1.5Z";

const CONFETTI = ["#42befc", "#ffd23f", "#ff6b4a", "#a98bff", "#34d399", "#ff8fcf"];

function burst(x: number, y: number, count = 34) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement("i");
    el.className = "l2-confetti";
    const size = gsap.utils.random(7, 13);
    el.style.width = `${size}px`;
    el.style.height = `${size * gsap.utils.random(0.4, 1)}px`;
    el.style.background = CONFETTI[i % CONFETTI.length];
    if (i % 3 === 0) el.style.borderRadius = "50%";
    document.body.appendChild(el);
    const duration = gsap.utils.random(1.3, 2.1);
    gsap.set(el, { x, y, rotation: gsap.utils.random(0, 360) });
    gsap.to(el, {
      physics2D: { velocity: gsap.utils.random(420, 880), angle: gsap.utils.random(-155, -25), gravity: 1500 },
      rotation: `+=${gsap.utils.random(-600, 600)}`,
      duration,
      ease: "none",
      onComplete: () => el.remove(),
    });
    gsap.to(el, { opacity: 0, duration: 0.35, delay: duration - 0.35 });
  }
}

/*
 * The notes section: two rows that never end. Each row's position is one
 * number, wrapped into the width of a single copy of its cards, and fed by
 * four inputs — a slow drift, page-scroll velocity (which also sets the
 * direction), dragging/flicking, and horizontal trackpad swipes.
 */
function endlessNotes(q: (sel: string) => Element[], autoplay: boolean) {
  const section = q("[data-notes]")[0] as HTMLElement;
  const cleanups: (() => void)[] = [];
  const boost = { v: 0, dir: 1 };

  const rows = (q("[data-note-viewport]") as HTMLElement[]).map((viewport, i) => {
    const track = viewport.querySelector("[data-note-row]") as HTMLElement;
    const row = {
      track,
      viewport,
      x: 0,
      half: track.scrollWidth / 2,
      lane: i % 2 ? 1 : -1, // rows run in opposite directions
      hover: 1,
      held: false,
      set: gsap.quickSetter(track, "x", "px") as (v: number) => void,
      wrap: (v: number) => gsap.utils.wrap(-row.half, 0, v),
    };
    const wrap = row.wrap;
    row.x = i % 2 ? -row.half / 2 : 0;

    // Drag and flick: a detached proxy carries Draggable's inertia; the row follows it.
    const proxy = document.createElement("div");
    let from = 0;
    const [drag] = Draggable.create(proxy, {
      type: "x",
      trigger: viewport,
      inertia: true,
      allowNativeTouchScrolling: true,
      onPress() {
        row.held = true;
        from = row.x - this.x;
        viewport.classList.add("is-grabbing");
      },
      onDrag() {
        row.x = wrap(from + this.x);
      },
      onThrowUpdate() {
        row.x = wrap(from + this.x);
      },
      onRelease() {
        viewport.classList.remove("is-grabbing");
        if (!this.isThrowing) row.held = false;
      },
      onThrowComplete() {
        row.held = false;
      },
    });

    // Horizontal trackpad swipes move the row; vertical ones still scroll the page.
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation(); // keep Lenis from treating it as a page scroll
      row.x = wrap(row.x - e.deltaX);
    };
    viewport.addEventListener("wheel", wheel, { passive: false });

    // Pointer over a row slows it so a note can be read.
    const enter = () => gsap.to(row, { hover: 0.12, duration: 0.6, ease: "power2.out" });
    const leave = () => gsap.to(row, { hover: 1, duration: 0.8, ease: "power2.inOut" });
    viewport.addEventListener("pointerenter", enter);
    viewport.addEventListener("pointerleave", leave);

    cleanups.push(() => {
      drag.kill();
      viewport.removeEventListener("wheel", wheel);
      viewport.removeEventListener("pointerenter", enter);
      viewport.removeEventListener("pointerleave", leave);
    });
    return row;
  });

  // Page scroll pushes the rows: faster scroll, faster rows; scrolling up reverses them.
  const st = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      boost.dir = self.direction;
      gsap.timeline({ overwrite: true })
        .to(boost, { v: Math.min(Math.abs(self.getVelocity()) / 90, 26), duration: 0.15 })
        .to(boost, { v: 0, duration: 1.2, ease: "power2.out" });
    },
  });

  const measure = () =>
    rows.forEach((r) => {
      const ratio = r.half ? r.x / r.half : 0;
      r.half = r.track.scrollWidth / 2;
      r.x = r.wrap(ratio * r.half);
    });
  window.addEventListener("resize", measure);
  document.fonts?.ready.then(measure);

  const tick = () => {
    const step = gsap.ticker.deltaRatio(60);
    rows.forEach((r) => {
      if (!r.held) {
        const drift = autoplay ? 0.55 * r.hover : 0;
        r.x = r.wrap(r.x + (drift + boost.v * r.hover) * r.lane * boost.dir * step);
      }
      r.set(r.x);
    });
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    window.removeEventListener("resize", measure);
    st.kill();
    cleanups.forEach((fn) => fn());
  };
}

/* The picked hero style, kept in localStorage so a refresh lands on the same one. */
const HERO_KEY = "schoolup:hero";
let heroFallback = 0; // when storage is blocked
function readHero() {
  try {
    const saved = Number(localStorage.getItem(HERO_KEY) ?? heroFallback);
    return saved > 0 && saved < HERO_STYLES.length ? saved : 0;
  } catch {
    return heroFallback;
  }
}
function writeHero(i: number) {
  heroFallback = i;
  try {
    localStorage.setItem(HERO_KEY, String(i));
  } catch {}
  window.dispatchEvent(new Event(HERO_KEY));
}
function subscribeHero(fn: () => void) {
  window.addEventListener(HERO_KEY, fn);
  return () => window.removeEventListener(HERO_KEY, fn);
}

export function LandingTwo() {
  const root = React.useRef<HTMLDivElement>(null);
  const lenisRef = React.useRef<Lenis | null>(null);
  const lastBurst = React.useRef(0);

  // Hero style explorer: 0 is the sticker book below; the rest live in ./heroes.
  // The first pick waits out the loader; later switches play straight away.
  const heroStyle = React.useSyncExternalStore(subscribeHero, readHero, () => 0);
  const [heroDelay, setHeroDelay] = React.useState("2.7s");
  const pickHero = React.useCallback((i: number) => {
    setHeroDelay("0s");
    writeHero(i);
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, []);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [heroStyle]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input, textarea, [contenteditable]")) return;
      const n = HERO_STYLES.length;
      if (e.key === "ArrowRight") pickHero((heroStyle + 1) % n);
      if (e.key === "ArrowLeft") pickHero((heroStyle - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heroStyle, pickHero]);
  const Variant = HERO_STYLES[heroStyle].Hero;

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const onAnchor = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const href = e.currentTarget.getAttribute("href");
    if (!href?.startsWith("#")) return;
    e.preventDefault();
    if (lenisRef.current) lenisRef.current.scrollTo(href === "#top" ? 0 : href, { offset: -90, duration: 1.5 });
    else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const celebrate = (e: React.PointerEvent | React.MouseEvent, force = false) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now();
    if (!force && now - lastBurst.current < 1400) return;
    lastBurst.current = now;
    burst(e.clientX, e.clientY);
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const one = (sel: string) => q(sel)[0] as HTMLElement;
      const mm = gsap.matchMedia();
      CustomWiggle.create("l2-wiggle", { wiggles: 7, type: "easeOut" });

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)", fine: "(pointer: fine)" },
        (ctx) => {
          const { motion, desktop, fine } = ctx.conditions as { motion: boolean; desktop: boolean; fine: boolean };
          const cleanups: (() => void)[] = [];
          const on = (el: Element | Window, type: string, fn: (e: Event) => void) => {
            el.addEventListener(type, fn);
            cleanups.push(() => el.removeEventListener(type, fn));
          };

          /* Stickers can be picked up and thrown, on any device. */
          const hero = one("[data-hero]");
          let top = 50;
          q("[data-sticker]").forEach((el) => {
            Draggable.create(el, {
              type: "x,y",
              bounds: hero,
              inertia: motion,
              edgeResistance: 0.75,
              onPress() {
                gsap.set(el, { zIndex: ++top });
                gsap.to(el.querySelector("[data-pop]"), { scale: 1.1, rotation: gsap.utils.random(-8, 8), duration: 0.35, ease: "back.out(3)" });
              },
              onRelease() {
                gsap.to(el.querySelector("[data-pop]"), { scale: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
              },
            });
          });

          cleanups.push(endlessNotes(q, motion));

          if (!motion) {
            gsap.set(q("[data-intro]"), { opacity: 1 });
            gsap.set(q("[data-loader] > div"), { yPercent: -100 });
            return () => cleanups.forEach((fn) => fn());
          }

          /* --------------------------------------------------------- Loader */
          const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
          // The real wordmark draws itself in white outline, then fills in letter
          // by letter. A paper plane flies a dotted loop through it; "UP" — the
          // logo's own tilt — hops as the plane passes under, throwing sparkles.
          // Then everything clears and the sheets lift.
          const logoLetters = q("[data-loader] [data-logo-letter]");
          const up = logoLetters.slice(-2);
          const plane = one("[data-loader-plane]");
          const sparks = q("[data-loader-spark]");
          gsap.set(logoLetters, { fillOpacity: 0, stroke: "#fff", strokeWidth: 0.35, strokeLinejoin: "round", transformOrigin: "50% 100%" });
          gsap.set(sparks, { x: 78, y: 4, scale: 0 });
          intro
            // 1. Outline draws on, letter after letter.
            .fromTo(logoLetters, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.75, stagger: 0.06, ease: "power2.inOut" }, 0.05)
            // 2. Fill floods in with a small pop; the outline melts away.
            .to(logoLetters, { fillOpacity: 1, duration: 0.35, stagger: 0.05, ease: "power1.out" }, 0.55)
            .fromTo(logoLetters, { scale: 0.86 }, { scale: 1, duration: 0.6, stagger: 0.05, ease: "back.out(3)" }, 0.55)
            .to(logoLetters, { strokeWidth: 0, duration: 0.3 }, 1.0)
            // 3. The plane's flight, its dotted trail drawn just behind it.
            .set(plane, { opacity: 1 }, 0.75)
            .to(plane, {
              motionPath: { path: "#l2-loader-flight", align: "#l2-loader-flight", alignOrigin: [0.5, 0.5], autoRotate: true },
              duration: 1.2,
              ease: "power1.inOut",
            }, 0.75)
            .fromTo(q("[data-loader-draw]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, ease: "power1.inOut" }, 0.75)
            // 4. "UP" hops as the plane passes beneath it…
            .to(up, { y: -6, rotation: -10, duration: 0.25, stagger: 0.05, ease: "power2.out" }, 1.25)
            .to(up, { y: 0, rotation: 0, duration: 0.75, stagger: 0.05, ease: "bounce.out" }, 1.5)
            // …and throws a ring of sparkles.
            .to(sparks, { opacity: 1, duration: 0.01 }, 1.28)
            .to(sparks, {
              x: (i: number) => 78 + Math.cos((i / sparks.length) * Math.PI * 2) * gsap.utils.random(12, 18),
              y: (i: number) => 4 + Math.sin((i / sparks.length) * Math.PI * 2) * gsap.utils.random(9, 13),
              scale: () => gsap.utils.random(0.8, 1.3),
              rotation: () => gsap.utils.random(-180, 180),
              duration: 0.7,
              ease: "expo.out",
            }, 1.28)
            .to(sparks, { scale: 0, opacity: 0, duration: 0.4, stagger: 0.03, ease: "power2.in" }, 1.75)
            // 5. Clear the stage and lift the sheets.
            .to(logoLetters, { y: -10, opacity: 0, stagger: 0.025, duration: 0.4, ease: "power3.in" }, 2.05)
            .to(q("[data-loader] > div"), { yPercent: -100, duration: 1, stagger: 0.08, ease: "expo.inOut" }, 2.25);

          /* ----------------------------------------------------------- Hero */
          const T = 2.75;
          intro
            .fromTo(one("[data-nav]"), { opacity: 0, yPercent: -140 }, { opacity: 1, yPercent: 0, duration: 1.2 }, T)
            .fromTo(one("[data-eyebrow]"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1, ease: "back.out(2.4)" }, T)
            .fromTo(one("[data-h1]"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, T)
            .from(q("[data-h1-line]"), { yPercent: 115, rotation: 5, duration: 1.3, stagger: 0.1 }, T)
            .from(one("[data-swap]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 1.1, ease: "elastic.out(1, 0.6)" }, T + 0.45)
            .fromTo(q("[data-hero-foot]"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, T + 0.35)
            .fromTo(
              q("[data-pop]"),
              { opacity: 0, scale: 0, rotation: () => gsap.utils.random(-90, 90), y: -40 },
              { opacity: 1, scale: 1, rotation: 0, y: 0, duration: 1.6, stagger: { each: 0.07, from: "random" }, ease: "elastic.out(1, 0.55)" },
              T + 0.3,
            );

          // Idle float, each sticker on its own clock.
          q("[data-float]").forEach((el) => {
            gsap.to(el, {
              y: () => gsap.utils.random(-14, 14),
              rotation: () => gsap.utils.random(-4, 4),
              duration: () => gsap.utils.random(2.4, 3.8),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              repeatRefresh: true,
              delay: T + 1.4,
            });
          });

          // Stickers lean away from the pointer, nearer ones further.
          if (fine) {
            const layers = q("[data-par]").map((el) => ({
              depth: Number((el as HTMLElement).dataset.depth),
              x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
              y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
            }));
            on(hero, "pointermove", (e) => {
              const p = e as PointerEvent;
              const nx = p.clientX / window.innerWidth - 0.5;
              const ny = p.clientY / window.innerHeight - 0.5;
              layers.forEach((l) => {
                l.x(-nx * l.depth * 1.6);
                l.y(-ny * l.depth * 1.6);
              });
            });
          }

          // Hero drifts up and apart as it leaves.
          const heroOut = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
          gsap.to(one("[data-hero-copy]"), { yPercent: -22, opacity: 0.2, ease: "none", scrollTrigger: heroOut });
          q("[data-par]").forEach((el, i) => {
            gsap.to(el.parentElement, { yPercent: -(30 + (i % 3) * 25), ease: "none", scrollTrigger: heroOut });
          });

          // The rotating word: whole words roll through the pill like a slot
          // machine — out the top as the next comes up from below — while the
          // pill eases to the new width and colour. Every step is a fromTo, so
          // the loop restarts cleanly. Measured once fonts are in.
          document.fonts?.ready.then(() =>
            ctx.add(() => {
              const pill = one("[data-swap]");
              const words = q("[data-swap-word]") as HTMLElement[];
              const em = parseFloat(getComputedStyle(pill).fontSize);
              const widths = words.map((w) => w.offsetWidth / em + 0.36);
              one("[data-swap-measure]").style.display = "none";
              gsap.set(pill, { width: `${widths[0]}em` });
              words.forEach((w, i) => gsap.set(w, { visibility: "visible", yPercent: i ? 110 : 0 }));
              const loop = gsap.timeline({ repeat: -1, delay: T + 2, defaults: { duration: 0.75, ease: "power3.inOut" } });
              words.forEach((w, i) => {
                const next = (i + 1) % words.length;
                const at = i * 2.6 + 1.6;
                loop
                  .fromTo(w, { yPercent: 0 }, { yPercent: -110, immediateRender: false }, at)
                  .fromTo(words[next], { yPercent: 110 }, { yPercent: 0, immediateRender: false }, at)
                  // Grow a beat early so a wider word never rises into a narrow pill; shrink a beat late.
                  .fromTo(
                    pill,
                    { width: `${widths[i]}em`, backgroundColor: SWAP_WORDS[i].color },
                    { width: `${widths[next]}em`, backgroundColor: SWAP_WORDS[next].color, duration: 0.6, immediateRender: false },
                    widths[next] > widths[i] ? at - 0.2 : at + 0.3,
                  );
              });
            }),
          );

          /* --------------------------------------------------------- Nav */
          if (desktop) {
            const nav = one("[data-nav]");
            ScrollTrigger.create({
              start: 120,
              onEnter: () => gsap.to(nav, { width: 860, duration: 0.8, ease: "expo.out" }),
              onLeaveBack: () => gsap.to(nav, { width: Math.min(window.innerWidth - 24, 1100), duration: 0.8, ease: "expo.out" }),
            });
          }

          /* -------------------------------------------------- Shared reveals */
          q("[data-split]").forEach((el) => {
            SplitText.create(el, {
              type: "words,lines",
              mask: "lines",
              linesClass: "l2-line",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.words, {
                  yPercent: 120,
                  rotation: 6,
                  duration: 1.2,
                  stagger: 0.035,
                  ease: "expo.out",
                  scrollTrigger: { trigger: el, start: "top 85%" },
                }),
            });
          });
          q("[data-rise]").forEach((el) => {
            gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } });
          });

          /* ------------------------------------------------ Flight + product */
          const flight = one("[data-flight]");
          const flightST = { trigger: flight, start: "top 85%", end: "bottom 25%", scrub: 0.8 };
          gsap.fromTo(q("[data-flight-draw]"), { drawSVG: "0%" }, { drawSVG: "100%", ease: "none", scrollTrigger: flightST });
          gsap.to(q("[data-plane]"), {
            motionPath: { path: "#l2-flight", align: "#l2-flight", alignOrigin: [0.5, 0.5], autoRotate: true },
            ease: "none",
            scrollTrigger: flightST,
          });
          gsap.from(q("[data-pin-start]"), { scale: 0, rotation: -20, duration: 0.9, ease: "back.out(3)", scrollTrigger: { trigger: flight, start: "top 80%" } });
          gsap.from(q("[data-pin-end]"), { scale: 0, rotation: 20, duration: 0.9, ease: "back.out(3)", scrollTrigger: { trigger: flight, start: "bottom 40%" } });

          const frame = one("[data-frame]");
          gsap.fromTo(
            frame,
            { rotation: -5, yPercent: 14, scale: 0.88 },
            { rotation: 0, yPercent: 0, scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "top 20%", scrub: true } },
          );
          gsap.from(q("[data-mock-row]"), { y: 40, opacity: 0, duration: 1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: frame, start: "top 55%" } });
          gsap.from(q("[data-mock-meter]"), { scaleX: 0, transformOrigin: "left", duration: 1.6, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: frame, start: "top 40%" } });
          q("[data-float-chip]").forEach((el, i) => {
            gsap.from(el, { scale: 0, rotation: i % 2 ? 14 : -14, duration: 1.2, ease: "elastic.out(1, 0.55)", scrollTrigger: { trigger: frame, start: "top 45%" }, delay: i * 0.15 });
            // A gentle drift, so the cards never slide over the drill card they sit beside.
            gsap.to(el, { yPercent: -(15 + i * 10), ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
          });

          /* --------------------------------------------------------- Pills */
          q("[data-pill-row]").forEach((row, i) => {
            const dir = i % 2 ? 1 : -1;
            const loop = gsap.fromTo(row, { xPercent: dir === -1 ? 0 : -50 }, { xPercent: dir === -1 ? -50 : 0, duration: 34, ease: "none", repeat: -1 });
            ScrollTrigger.create({
              trigger: row,
              start: "top bottom",
              end: "bottom top",
              onUpdate: (self) => {
                const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 5);
                gsap.timeline({ overwrite: true }).to(loop, { timeScale: boost, duration: 0.2 }).to(loop, { timeScale: 1, duration: 1.4, ease: "power2.out" });
              },
            });
          });
          gsap.from(q("[data-pill]"), {
            scale: 0,
            duration: 0.9,
            stagger: { each: 0.03, from: "random" },
            ease: "back.out(2.4)",
            scrollTrigger: { trigger: one("[data-pills]"), start: "top 85%" },
          });

          /* --------------------------------------------------------- Bento */
          gsap.from(q("[data-tool]"), {
            y: 120,
            rotation: () => gsap.utils.random(-6, 6),
            opacity: 0,
            duration: 1.4,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: { trigger: one("[data-bento]"), start: "top 80%" },
          });
          q("[data-tool]").forEach((card) => {
            const art = card.querySelector("[data-tool-art]");
            const chip = card.querySelector("[data-tool-chip]");
            gsap.from(art, { scale: 0.4, rotation: -25, duration: 1.4, ease: "elastic.out(1, 0.5)", scrollTrigger: { trigger: card, start: "top 75%" } });
            on(card, "pointerenter", () => {
              gsap.fromTo(art, { rotation: 0 }, { rotation: 10, duration: 1.1, ease: "l2-wiggle" });
              gsap.to(chip, { y: -10, scale: 1.03, duration: 0.6, ease: "back.out(2)" });
            });
            on(card, "pointerleave", () => {
              gsap.to(chip, { y: 0, scale: 1, duration: 0.6, ease: "power3.out" });
              gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
            });
            if (fine) {
              const rx = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
              const ry = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
              gsap.set(card, { transformPerspective: 1100 });
              on(card, "pointermove", (e) => {
                const p = e as PointerEvent;
                const r = card.getBoundingClientRect();
                ry(((p.clientX - r.left) / r.width - 0.5) * 8);
                rx(-((p.clientY - r.top) / r.height - 0.5) * 8);
              });
            }
          });

          /* ------------------------------------------------- Stacking steps */
          const cards = q("[data-step]");
          cards.forEach((card, i) => {
            const art = card.querySelector("[data-step-art]");
            gsap.fromTo(
              art,
              { rotation: -30, scale: 0.5, yPercent: 30 },
              { rotation: 0, scale: 1, yPercent: 0, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "top 30%", scrub: true } },
            );
            gsap.to(card.querySelector("[data-step-blob]"), { rotation: 360, duration: 26, ease: "none", repeat: -1 });
            const next = cards[i + 1];
            if (next) {
              // Explicit start: GSAP cannot interpolate a filter from "none".
              gsap.fromTo(
                card,
                { scale: 1, rotation: 0, filter: "brightness(1)" },
                {
                  scale: 0.9,
                  rotation: i % 2 ? 1.5 : -1.5,
                  filter: "brightness(0.92)",
                  ease: "none",
                  scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: true },
                },
              );
            }
          });

          /* --------------------------------------------------------- Stats */
          q("[data-stat]").forEach((el, i) => {
            const num = el.querySelector("[data-count]") as HTMLElement;
            const target = Number(num.dataset.count);
            const obj = { v: 0 };
            const st = { trigger: el, start: "top 82%" };
            gsap.from(el.querySelector("[data-blob]"), { scale: 0, rotation: -120, duration: 1.6, ease: "elastic.out(1, 0.5)", delay: i * 0.12, scrollTrigger: st });
            gsap.to(el.querySelector("[data-blob-spin]"), { rotation: i % 2 ? -360 : 360, duration: 40 + i * 8, ease: "none", repeat: -1 });
            gsap.to(obj, {
              v: target,
              duration: 2.2,
              delay: 0.2 + i * 0.12,
              ease: "expo.out",
              scrollTrigger: st,
              onUpdate: () => {
                num.textContent = Math.round(obj.v).toLocaleString("en-US");
              },
            });
          });

          /* ---------------------------------------------------------- Notes */
          gsap.from(q("[data-note]"), {
            y: 90,
            opacity: 0,
            rotation: () => gsap.utils.random(-14, 14),
            duration: 1.4,
            stagger: { each: 0.05, from: "start" },
            ease: "back.out(1.6)",
            scrollTrigger: { trigger: one("[data-notes]"), start: "top 70%" },
          });

          /* -------------------------------------------------------- Pricing */
          gsap.from(q("[data-plan]"), {
            y: 100,
            rotation: (i: number) => (i ? 6 : -6),
            opacity: 0,
            duration: 1.4,
            stagger: 0.12,
            ease: "expo.out",
            scrollTrigger: { trigger: one("[data-plans]"), start: "top 80%" },
          });
          const badge = one("[data-spin-badge]");
          const spin = gsap.to(badge, { rotation: 360, duration: 14, ease: "none", repeat: -1 });
          const pro = badge.closest("[data-plan]")!;
          on(pro, "pointerenter", () => gsap.to(spin, { timeScale: 5, duration: 0.5 }));
          on(pro, "pointerleave", () => gsap.to(spin, { timeScale: 1, duration: 1 }));
          q("[data-price]").forEach((el) => {
            const target = Number((el as HTMLElement).dataset.price);
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target,
              duration: 1.4,
              ease: "power3.out",
              snap: { v: 1 },
              scrollTrigger: { trigger: el, start: "top 85%" },
              onUpdate: () => {
                el.textContent = `$${obj.v}`;
              },
            });
          });

          /* ------------------------------------------------------------ CTA */
          const cta = one("[data-cta]");
          gsap.fromTo(cta, { scale: 0.86, borderRadius: 120 }, { scale: 1, borderRadius: 48, ease: "none", scrollTrigger: { trigger: cta, start: "top bottom", end: "top 30%", scrub: true } });
          q("[data-cta-art]").forEach((el, i) => {
            gsap.fromTo(el, { rotation: i ? 30 : -30, yPercent: 60 }, { rotation: i ? -8 : 8, yPercent: 0, ease: "none", scrollTrigger: { trigger: cta, start: "top bottom", end: "bottom 60%", scrub: true } });
          });

          /* --------------------------------------------------------- Footer */
          // The logo's own letters rise out of the footer, then hop when hovered.
          const letters = q("[data-wordmark] [data-logo-letter]");
          gsap.set(letters, { transformOrigin: "50% 100%" });
          gsap.from(letters, {
            yPercent: 130,
            rotation: (i: number) => (i % 2 ? 12 : -12),
            duration: 1.3,
            stagger: 0.06,
            ease: "back.out(1.8)",
            scrollTrigger: { trigger: one("[data-wordmark]"), start: "top 95%" },
          });
          letters.forEach((el) => {
            on(el, "pointerenter", () => {
              gsap.timeline().to(el, { yPercent: -22, rotation: gsap.utils.random(-14, 14), duration: 0.22, ease: "power2.out" }).to(el, { yPercent: 0, rotation: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
            });
          });

          return () => cleanups.forEach((fn) => fn());
        },
      );

      const refresh = () => ScrollTrigger.refresh();
      window.addEventListener("load", refresh);
      document.fonts?.ready.then(refresh);
      return () => window.removeEventListener("load", refresh);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="l2" id="top">
      {/* Loader: four coloured sheets lift off the page. */}
      <div data-loader className="l2-loader" aria-hidden>
        <div style={{ background: "var(--lilac)" }} />
        <div style={{ background: "var(--pink)" }} />
        <div style={{ background: "var(--sun)" }} />
        <div className="grid place-items-center" style={{ background: "var(--sky)" }}>
          <div className="relative w-[clamp(240px,36vw,480px)]">
            <LogoMark className="block h-auto w-full" color="#fff" />
            {/* Flight overlay, in the logo's own units: 1.6× its width, 4× its height, centred. */}
            <svg viewBox="-27.3 -28.5 145.6 76" className="pointer-events-none absolute left-[-30%] top-[-150%] h-[400%] w-[160%] overflow-visible">
              <defs>
                <mask id="l2-loader-mask" maskUnits="userSpaceOnUse" x="-60" y="-60" width="240" height="160">
                  <path data-loader-draw d={LOADER_FLIGHT} fill="none" stroke="#fff" strokeWidth="2" />
                </mask>
              </defs>
              <path id="l2-loader-flight" d={LOADER_FLIGHT} fill="none" stroke="none" />
              <path d={LOADER_FLIGHT} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="0.45" strokeDasharray="0.2 2.2" strokeLinecap="round" mask="url(#l2-loader-mask)" />
              {CONFETTI.map((c, i) => (
                <g key={i} data-loader-spark opacity="0">
                  <path d={STAR_PATH} fill={i % 2 ? "#fff" : c} transform="scale(0.24) translate(-12 -12)" />
                </g>
              ))}
              <g data-loader-plane opacity="0">
                <g transform="scale(0.17) translate(-26 -20)">
                  <path d="M2 18 L50 2 L34 38 L24 26 Z" fill="#ffd23f" stroke="#17161c" strokeWidth="3" strokeLinejoin="round" />
                  <path d="M50 2 L24 26 L22 36 L28 29" fill="#f2b705" stroke="#17161c" strokeWidth="3" strokeLinejoin="round" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <HeroSwitcher index={heroStyle} onChange={pickHero} />

      {/* ---------------------------------------------------------- Nav */}
      <header data-nav data-intro className="l2-nav">
        <Link href="/" aria-label="SchoolUp home" className="mr-auto">
          <Image src="/images/logos/logo_black.svg" alt="SchoolUp" width={91} height={19} className="h-[19px] w-auto" preload />
        </Link>
        <nav className="hidden items-center md:flex">
          {NAV.map((n) =>
            n.href.startsWith("#") ? (
              <a key={n.href} href={n.href} onClick={onAnchor} className="l2-navlink">
                {n.label}
              </a>
            ) : (
              <Link key={n.href} href={n.href} className="l2-navlink">
                {n.label}
              </Link>
            ),
          )}
        </nav>
        <Link href="/login" className="l2-navlink ml-auto hidden sm:inline-flex md:ml-2">
          Log in
        </Link>
        <Link href="/signup" className="l2-btn l2-btn--sm">
          Start free <ArrowRight strokeWidth={2.4} />
        </Link>
      </header>

      <main>
        {/* --------------------------------------------------------- Hero */}
        {/* The original stays mounted (hidden) while a variant shows, so the GSAP context keeps its targets. */}
        {Variant && (
          <div style={{ "--hx-delay": heroDelay } as React.CSSProperties}>
            <Variant key={heroStyle} />
          </div>
        )}
        <section data-hero className="l2-hero pt-[200px] lg:pt-[120px]" style={Variant ? { display: "none" } : undefined}>
          {STICKERS.map((s, i) => (
            <Sticker key={i} def={s} index={i} />
          ))}

          <div data-hero-copy className="relative z-[1] flex max-w-[960px] flex-col items-center pointer-events-none [&_a]:pointer-events-auto">
            <span data-eyebrow data-intro className="l2-eyebrow">
              <i /> Free to start · no card needed
            </span>

            <h1 data-h1 data-intro className="l2-display l2-h1 mt-6">
              <span className="sr-only">Study abroad, minus the panic.</span>
              <span aria-hidden className="block">
                <span className="block overflow-hidden pb-[0.04em]">
                  <span data-h1-line className="block">
                    Study abroad,
                  </span>
                </span>
                {/* "minus the" and the pill always share this line — see .l2-h1 for the sizing. */}
                <span className="block overflow-hidden px-[0.1em] pb-[0.1em] pt-[0.04em]">
                  <span data-h1-line className="flex flex-nowrap items-start justify-center gap-x-[0.24em]">
                    <span>minus the</span>
                    <span data-swap className="l2-swap">
                      {SWAP_WORDS.map((w) => (
                        <span key={w.word} data-swap-word className="l2-swap-word">
                          {w.word}
                        </span>
                      ))}
                      <span data-swap-measure className="l2-swap-measure">
                        {SWAP_WORDS[0].word}
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            </h1>

            <p data-hero-foot data-intro className="l2-lede mt-6 max-w-[38ch]">
              Schools, scholarships, essays, interviews and every deadline — finally in one friendly place.
            </p>

            <div data-hero-foot data-intro className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="l2-btn">
                Start free <ArrowRight strokeWidth={2.4} />
              </Link>
              <a href="#how" onClick={onAnchor} className="l2-btn l2-btn--ghost">
                See how it works
              </a>
            </div>
          </div>

        </section>

        {/* ------------------------------------------- Flight + product */}
        <section id="product" className="relative pb-[clamp(100px,12vw,180px)]">
          <div data-flight className="relative mx-auto max-w-[1440px]" aria-hidden>
            <svg viewBox="0 0 1440 360" className="block h-auto w-full overflow-visible">
              <defs>
                <mask id="l2-flight-mask" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1700" height="600">
                  <path data-flight-draw d={FLIGHT} fill="none" stroke="#fff" strokeWidth="10" />
                </mask>
              </defs>
              <path id="l2-flight" d={FLIGHT} fill="none" stroke="none" />
              <path d={FLIGHT} fill="none" stroke="#c9c7d1" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" mask="url(#l2-flight-mask)" />
              <PaperPlane />
            </svg>
            <span data-pin-start className="absolute left-[4%] top-[80%] inline-flex items-center gap-1.5 rounded-full bg-[var(--coral)] px-3.5 py-2 text-[13px] font-semibold text-white shadow-lg md:text-[15px]">
              <MapPin className="size-4" /> Kathmandu
            </span>
            <span data-pin-end className="absolute right-[4%] top-[2%] inline-flex items-center gap-1.5 rounded-full bg-[var(--mint)] px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] shadow-lg md:text-[15px]">
              <GraduationCap className="size-4" /> Toronto
            </span>
          </div>

          <div className="l2-wrap -mt-[4vw] text-center">
            <span data-rise className="l2-eyebrow">
              <i style={{ background: "var(--sky)" }} /> The product
            </span>
            <h2 data-split className="l2-display l2-h2 mx-auto mt-6 max-w-[14ch]">
              Your whole application, on one happy screen.
            </h2>
            <p data-rise className="l2-lede mx-auto mt-6 max-w-[42ch]">
              Open it each morning and it tells you what to do next, how long it takes, and what is due.
            </p>
          </div>

          <div className="l2-wrap relative mt-[clamp(56px,7vw,96px)]">
            <div data-frame className="l2-frame l2-pat-dots">
              <div className="l2-mock">
                <ProductMock />
              </div>
            </div>
            <div data-float-chip className="absolute -left-2 top-[18%] hidden w-[300px] -rotate-6 lg:block xl:-left-10">
              {FEATURES[0].chip}
            </div>
            <div data-float-chip className="absolute -right-2 top-[6%] hidden w-[330px] rotate-3 lg:block xl:-right-12">
              {FEATURES[2].chip}
            </div>
            <div data-float-chip className="absolute -right-2 -bottom-[12%] hidden w-[300px] -rotate-3 lg:block xl:-right-8">
              {FEATURES[4].chip}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- Pills */}
        <section data-pills aria-label="Where students are applying" className="overflow-hidden py-10">
          {[0, 1].map((row) => (
            <div key={row} className={row ? "mt-4 rotate-[1.5deg]" : "-rotate-[1.5deg]"}>
              <div data-pill-row className="flex w-max" aria-hidden>
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex gap-4 pr-4">
                    {(row ? [...SCHOOLS].reverse() : SCHOOLS).map((s, i) => (
                      <span key={s} data-pill className="l2-pill" style={{ background: COLORS[(i + row * 2) % COLORS.length], color: (i + row * 2) % 6 === 5 ? "#fff" : "var(--ink)" }}>
                        <Star className="size-[0.7em]" color="rgba(255,255,255,0.85)" />
                        {s}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p className="sr-only">Students are applying to schools including {SCHOOLS.join(", ")}.</p>
        </section>

        {/* -------------------------------------------------------- Bento */}
        <section id="toolkit" className="py-[clamp(100px,12vw,180px)]">
          <div className="l2-wrap text-center">
            <span data-rise className="l2-eyebrow">
              <i style={{ background: "var(--pink)" }} /> The toolkit
            </span>
            <h2 data-split className="l2-display l2-h2 mx-auto mt-6 max-w-[15ch]">
              Five tools that actually talk to each other.
            </h2>
          </div>

          <div data-bento className="l2-wrap mt-[clamp(48px,6vw,88px)] grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const s = TOOL_STYLE[i];
              const wide = i === 0;
              return (
                <article key={f.n} data-tool className={"l2-card " + (wide ? "md:col-span-2" : "")}>
                  <div className={"l2-card-media " + s.pat + (wide ? " lg:min-h-[380px]" : " min-h-[400px]")} style={{ backgroundColor: s.bg, ["--pc" as string]: s.pc }}>
                    <div data-tool-art className={"absolute " + (wide ? "inset-[8%_50%_22%_6%] md:inset-[8%_52%_10%_6%]" : "inset-[5%_16%_44%]")}>
                      <Image src={s.art} alt="" fill sizes="(min-width: 1024px) 30vw, 80vw" className="object-contain drop-shadow-[0_14px_16px_rgba(23,22,28,0.18)]" />
                    </div>
                    <div data-tool-chip className={"absolute " + (wide ? "inset-x-[6%] bottom-[7%] md:left-auto md:right-[6%] md:top-1/2 md:bottom-auto md:w-[44%] md:-translate-y-1/2" : "inset-x-[6%] bottom-[6%]")}>
                      <div className="origin-bottom scale-[0.92]">{f.chip}</div>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-6 px-7 pb-7 pt-4">
                    <div>
                      <h3 className="l2-display text-[30px] tracking-[-0.035em]">{f.title}</h3>
                      <p className="mt-2 max-w-[44ch] text-[15.5px] text-[var(--ink-2)]">{f.body}</p>
                    </div>
                    <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full" style={{ background: s.bg }}>
                      <ArrowRight className="size-4" strokeWidth={2.4} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------- Steps */}
        <section id="how" className="pb-[clamp(60px,8vw,120px)]">
          <div className="l2-wrap text-center">
            <span data-rise className="l2-eyebrow">
              <i style={{ background: "var(--lilac)" }} /> How it works
            </span>
            <h2 data-split className="l2-display l2-h2 mx-auto mt-6 max-w-[13ch]">
              From “maybe abroad?” to submitted.
            </h2>
          </div>

          <div className="l2-wrap mt-[clamp(48px,6vw,88px)] pb-[6vh]">
            {STEPS.map((s, i) => (
              <article
                key={s.n}
                data-step
                className="l2-stack-card mb-[12vh] grid min-h-[520px] items-center gap-8 overflow-hidden p-8 md:grid-cols-2 md:p-14 last:mb-0"
                style={{ background: s.bg, ["--i" as string]: i }}
              >
                <div className="relative z-[1]">
                  <span className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[14px] font-semibold">Step {s.n}</span>
                  <h3 className="l2-display mt-6 text-[clamp(40px,4.6vw,72px)]">{s.title}</h3>
                  <p className="mt-5 max-w-[36ch] text-[clamp(17px,1.4vw,20px)] leading-[1.5] text-[rgba(23,22,28,0.78)]">{s.body}</p>
                </div>
                <div className="relative grid aspect-square place-items-center md:aspect-auto md:h-full">
                  <svg data-step-blob viewBox="0 0 200 200" className="absolute w-[88%] max-w-[440px] opacity-90" aria-hidden>
                    <path d={blobPath(8, 0.08)} fill={s.blob} />
                  </svg>
                  <div data-step-art className="relative h-[78%] w-[78%] max-w-[380px]">
                    <Image src={s.art} alt="" fill sizes="(min-width: 768px) 36vw, 80vw" className="object-contain drop-shadow-[0_18px_22px_rgba(23,22,28,0.25)]" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- Stats */}
        <section className="py-[clamp(100px,12vw,180px)]">
          <div className="l2-wrap text-center">
            <h2 data-split className="l2-display l2-h2 mx-auto max-w-[16ch]">
              Join a crowd that’s already halfway there.
            </h2>
          </div>
          <div className="l2-wrap mt-[clamp(48px,6vw,96px)] grid gap-12 md:grid-cols-3 md:gap-6">
            {STATS.map((s) => (
              <div key={s.label} data-stat className="flex flex-col items-center text-center">
                <div data-blob className="relative grid aspect-square w-full max-w-[320px] place-items-center">
                  <svg data-blob-spin viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
                    <path d={blobPath(s.shape.n, s.shape.amp)} fill={s.color} />
                  </svg>
                  <span className="l2-display relative text-[clamp(44px,4.3vw,68px)] tabular-nums">
                    <span data-count={s.value}>{s.value.toLocaleString("en-US")}</span>
                    {s.suffix}
                  </span>
                </div>
                <p className="mt-6 text-[17px] font-medium text-[var(--ink-2)]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* -------------------------------------------------------- Notes */}
        <section data-notes aria-label="Notes from students" className="overflow-hidden bg-[var(--soft)] py-[clamp(100px,12vw,180px)]">
          <div className="l2-wrap flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 data-split className="l2-display l2-h2 max-w-[12ch]">
              Notes from students who got in.
            </h2>
            <p data-rise className="max-w-[26ch] text-[15px] text-[var(--ink-3)]">
              Drag them, swipe them, scroll past them — they never run out.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-7 md:mt-20 md:gap-9">
            {[NOTES.slice(0, 6), NOTES.slice(6)].map((row, r) => (
              <div key={r} data-note-viewport data-cursor="Drag" className="l2-note-viewport">
                <div data-note-row className="flex w-max items-start">
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex items-start gap-5 pr-5 md:gap-7 md:pr-7" aria-hidden={copy === 1 || undefined}>
                      {row.map((n, i) => {
                        const [bg, tape] = NOTE_TONES[(i + r * 3) % NOTE_TONES.length];
                        const rot = ((i + r) % 3) - 1;
                        return (
                          <figure key={n.name} data-note className="l2-note" style={{ background: bg, ["--rot" as string]: `${rot * 2.5}deg` }}>
                            <span className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[-3deg] rounded-[3px] opacity-80" style={{ background: tape }} aria-hidden />
                            <blockquote className="l2-display text-[clamp(20px,1.7vw,25px)] font-semibold leading-[1.2] tracking-[-0.025em]">“{n.quote}”</blockquote>
                            <figcaption className="mt-7 flex items-center gap-3">
                              <span className="grid size-11 shrink-0 place-items-center rounded-full text-[16px] font-bold" style={{ background: tape }}>
                                {n.name[0]}
                              </span>
                              <span className="leading-tight">
                                <b className="block text-[15px]">{n.name}</b>
                                <span className="text-[14px] text-[var(--ink-2)]">{n.route}</span>
                              </span>
                            </figcaption>
                          </figure>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------- Universities */}
        <UniversitiesShowcase />

        {/* ------------------------------------------------------ Pricing */}
        <section id="pricing" className="py-[clamp(100px,12vw,180px)]">
          <div className="l2-wrap text-center">
            <span data-rise className="l2-eyebrow">
              <i style={{ background: "var(--sun)" }} /> Pricing
            </span>
            <h2 data-split className="l2-display l2-h2 mx-auto mt-6 max-w-[14ch]">
              Free to start. Pro when you’re ready.
            </h2>
          </div>

          <div data-plans className="l2-wrap mt-[clamp(48px,6vw,88px)] grid max-w-[1000px] gap-5 md:grid-cols-2">
            {PLANS.map((p) => {
              const pro = p.name === "Pro";
              return (
                <article
                  key={p.name}
                  data-plan
                  className={"relative flex flex-col rounded-[var(--radius-xl)] p-8 md:p-10 " + (pro ? "bg-[var(--sky)] text-[#04293c]" : "bg-white shadow-[0_0_0_1.5px_var(--line)]")}
                >
                  {pro && (
                    <div data-spin-badge className="absolute -right-5 -top-8 size-[112px] md:-right-8" aria-label="Most popular, 40% off">
                      <svg viewBox="0 0 120 120" className="size-full">
                        <circle cx="60" cy="60" r="58" fill="var(--sun)" stroke="#fff" strokeWidth="4" />
                        <defs>
                          <path id="l2-badge-ring" d="M60,60 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
                        </defs>
                        <text fontSize="12.5" fontWeight="700" letterSpacing="2.2" fill="#17161c">
                          <textPath href="#l2-badge-ring">MOST POPULAR • 40% OFF • </textPath>
                        </text>
                        <g transform="translate(48 48)">
                          <path d="M12 1.5c.6 4.6 2.4 7.6 10.5 10.5-8.1 2.9-9.9 5.9-10.5 10.5-.6-4.6-2.4-7.6-10.5-10.5C9.6 9.1 11.4 6.1 12 1.5Z" fill="#17161c" />
                        </g>
                      </svg>
                    </div>
                  )}
                  <h3 className="l2-display text-[30px] tracking-[-0.035em]">{p.name}</h3>
                  <p className={"mt-1 text-[15.5px] " + (pro ? "text-[rgba(4,41,60,0.75)]" : "text-[var(--ink-2)]")}>{p.blurb}</p>
                  <div className="mt-8 flex items-end gap-3">
                    <span data-price={p.price} className="l2-display text-[clamp(72px,7vw,104px)] leading-[0.85] tabular-nums">
                      ${p.price}
                    </span>
                    <span className={"pb-2 text-[15px] font-medium " + (pro ? "text-[rgba(4,41,60,0.7)]" : "text-[var(--ink-3)]")}>{p.per}</span>
                  </div>
                  <ul className="mt-8 flex flex-col gap-3">
                    {p.items.map((it, j) => (
                      <li key={it} className="flex items-center gap-3 text-[15.5px]">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full" style={{ background: pro ? "#fff" : COLORS[j % COLORS.length] }}>
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className={"l2-btn mt-10 self-start " + (pro ? "" : "l2-btn--ghost")}>
                    {p.cta} <ArrowRight strokeWidth={2.4} />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------- CTA */}
        <section className="px-3 pb-6 md:px-6">
          <div data-cta className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[48px] bg-[var(--sun)] px-6 py-[clamp(96px,12vw,180px)] text-center">
            <div data-cta-art className="pointer-events-none absolute -bottom-6 -left-4 w-[clamp(120px,18vw,260px)] md:left-[4%]" aria-hidden>
              <Image src="/images/stickers/deadline.webp" alt="" width={365} height={590} className="h-auto w-full" />
            </div>
            <div data-cta-art className="pointer-events-none absolute -right-6 -top-4 w-[clamp(110px,15vw,220px)] md:right-[5%] md:top-[8%]" aria-hidden>
              <Image src="/images/stickers/notification.webp" alt="" width={399} height={505} className="h-auto w-full" />
            </div>
            <h2 data-split className="l2-display relative mx-auto max-w-[11ch] text-[clamp(52px,8vw,128px)]">
              Your application starts today.
            </h2>
            <p data-rise className="relative mx-auto mt-6 max-w-[30ch] text-[clamp(17px,1.5vw,21px)] text-[rgba(23,22,28,0.75)]">
              No card. No catch. Just the next step.
            </p>
            <div data-rise className="relative mt-10">
              <Link href="/signup" className="l2-btn h-16 px-9 text-[18px]" onPointerEnter={(e) => celebrate(e)} onClick={(e) => celebrate(e, true)}>
                Start free <ArrowRight strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* -------------------------------------------------------- Footer */}
      <footer>
        <div className="l2-wrap pb-10 pt-16">
          <div className="flex flex-col justify-between gap-10 md:flex-row">
            <div>
              <Image src="/images/logos/logo_black.svg" alt="SchoolUp" width={91} height={19} className="h-[20px] w-auto" />
              <p className="mt-3 max-w-[28ch] text-[15px] text-[var(--ink-2)]">Study abroad, minus the panic. Made for students in 89 countries.</p>
            </div>
            <div className="flex gap-16 text-[15px]">
              <div className="flex flex-col gap-2">
                {NAV.map((n) =>
                  n.href.startsWith("#") ? (
                    <a key={n.href} href={n.href} onClick={onAnchor} className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                      {n.label}
                    </a>
                  ) : (
                    <Link key={n.href} href={n.href} className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                      {n.label}
                    </Link>
                  ),
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/login" className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                  Log in
                </Link>
                <Link href="/signup" className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                  Sign up
                </Link>
                <a href="#top" onClick={onAnchor} className="text-[var(--ink-2)] transition-colors hover:text-[var(--ink)]">
                  Back to top ↑
                </a>
              </div>
            </div>
          </div>

          {/* Room above for the hover hop; overflow clips the rise-in from below. */}
          <div data-wordmark className="mt-10 overflow-hidden pb-[1vw] pt-[4vw]" aria-hidden>
            <LogoMark className="block h-auto w-full" colors={CONFETTI} />
          </div>
          <p className="mt-6 text-center text-[13px] text-[var(--ink-3)]">© 2026 SchoolUp Academy</p>
        </div>

        {/* The last thing on the page: a full-width sky to fly through. */}
        <div data-rise>
          <PlaneGame onBest={(x, y) => !window.matchMedia("(prefers-reduced-motion: reduce)").matches && burst(x, y, 60)} />
        </div>
      </footer>
    </div>
  );
}
