"use client";

import * as React from "react";
import gsap from "gsap";

/*
 * Footer mini-game: fly the paper plane to Toronto.
 *
 * One input — click, tap, Space or ↑ — lifts the plane; gravity does the rest.
 * Thread it through the pastel pillars; each one cleared is a point. The best
 * score is kept per browser. The loop runs only while the card is on screen.
 */

type Phase = "idle" | "playing" | "over";
type Pillar = { x: number; gapY: number; color: string; passed: boolean };
type Cloud = { x: number; y: number; r: number; depth: number };

const PALETTE = ["#ffd23f", "#ff8fcf", "#42befc", "#34d399", "#a98bff", "#ff6b4a"];
const INK = "#17161c";
const PILLAR_W = 58;
const SPACING = 250;
const PLANE_R = 11;
const BEST_KEY = "su-plane-best";

/* Best score: localStorage when it is available, memory when it is not.
   Read through useSyncExternalStore so the server render is simply 0. */
let memoryBest = 0;
function readBest() {
  try {
    return Math.max(memoryBest, Number(localStorage.getItem(BEST_KEY)) || 0);
  } catch {
    return memoryBest;
  }
}
function writeBest(n: number) {
  memoryBest = n;
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {}
  window.dispatchEvent(new Event(BEST_KEY));
}
function subscribeBest(cb: () => void) {
  window.addEventListener(BEST_KEY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(BEST_KEY, cb);
    window.removeEventListener("storage", cb);
  };
}

export function PlaneGame({ onBest }: { onBest?: (x: number, y: number) => void }) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const overlay = React.useRef<HTMLDivElement>(null);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [score, setScore] = React.useState(0);
  const best = React.useSyncExternalStore(subscribeBest, readBest, () => 0);
  const [newBest, setNewBest] = React.useState(false);
  const onBestRef = React.useRef(onBest);
  React.useEffect(() => {
    onBestRef.current = onBest;
  }, [onBest]);

  // Mutable game state lives outside React; the loop reads and writes it every frame.
  const g = React.useRef({
    phase: "idle" as Phase,
    w: 0,
    h: 0,
    t: 0,
    y: 0,
    vy: 0,
    score: 0,
    spawn: 0,
    overAt: 0,
    colour: 0,
    pillars: [] as Pillar[],
    clouds: [] as Cloud[],
    trail: [] as { x: number; y: number }[],
  });

  /* Each phase change gets a little entrance. */
  React.useEffect(() => {
    const el = overlay.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el.children, { y: 16, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.06, ease: "back.out(2.2)" });
  }, [phase]);

  const flap = React.useCallback(() => {
    const s = g.current;
    const lift = -Math.max(300, s.h * 0.95);
    if (s.phase === "playing") {
      s.vy = lift;
      return;
    }
    if (s.phase === "over" && s.t - s.overAt < 0.45) return;
    s.phase = "playing";
    s.y = s.h * 0.45;
    s.vy = lift;
    s.score = 0;
    s.spawn = 120;
    s.pillars = [];
    s.trail = [];
    setScore(0);
    setPhase("playing");
  }, []);

  React.useEffect(() => {
    const c = canvas.current!;
    const box = c.parentElement!;
    const ctx = c.getContext("2d")!;
    const s = g.current;
    let raf = 0;
    let last = 0;
    let visible = false;

    const resize = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      c.style.width = `${r.width}px`;
      c.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.w = r.width;
      s.h = r.height;
      if (s.phase !== "playing") s.y = s.h * 0.45;
      if (!s.clouds.length) {
        s.clouds = Array.from({ length: 6 }, (_, i) => ({
          x: (i / 6) * r.width + gsap.utils.random(0, 80),
          y: gsap.utils.random(0.12, 0.8) * r.height,
          r: gsap.utils.random(14, 26),
          depth: gsap.utils.random(0.15, 0.4),
        }));
      }
      if (!visible) draw();
    };

    const crash = () => {
      s.phase = "over";
      s.overAt = s.t;
      s.vy = -s.h * 0.3;
      setPhase("over");
      const previous = readBest();
      setNewBest(s.score > previous);
      gsap.fromTo(box, { x: -10 }, { x: 0, duration: 0.7, ease: "elastic.out(1, 0.25)" });
      if (s.score > previous) {
        writeBest(s.score);
        const r = box.getBoundingClientRect();
        onBestRef.current?.(r.left + r.width / 2, r.top + r.height / 2);
      }
    };

    const update = (dt: number) => {
      s.t += dt;
      const speed = Math.min(190 + s.score * 7, 340);
      const px = s.w * 0.22;

      for (const cl of s.clouds) {
        cl.x -= (s.phase === "playing" ? speed : 60) * cl.depth * dt;
        if (cl.x < -60) {
          cl.x = s.w + 60;
          cl.y = gsap.utils.random(0.12, 0.8) * s.h;
        }
      }

      if (s.phase === "idle") {
        s.y = s.h * 0.45 + Math.sin(s.t * 2.4) * 10;
        s.vy = Math.cos(s.t * 2.4) * 60;
        return;
      }

      const gravity = Math.max(900, s.h * 3);
      s.vy += gravity * dt;
      s.y += s.vy * dt;

      if (s.phase === "over") {
        s.y = Math.min(s.y, s.h - PLANE_R);
        for (const p of s.pillars) p.x -= speed * 0.15 * dt;
        return;
      }

      if (s.y < PLANE_R + 4) {
        s.y = PLANE_R + 4;
        s.vy = 0;
      }

      s.spawn -= speed * dt;
      if (s.spawn <= 0) {
        const gap = Math.max(118, s.h * 0.4);
        const margin = gap / 2 + 24;
        s.pillars.push({ x: s.w + PILLAR_W, gapY: gsap.utils.random(margin, s.h - margin), color: PALETTE[s.colour++ % PALETTE.length], passed: false });
        s.spawn = SPACING;
      }

      const gap = Math.max(118, s.h * 0.4);
      for (const p of s.pillars) {
        p.x -= speed * dt;
        if (!p.passed && p.x + PILLAR_W / 2 < px - PLANE_R) {
          p.passed = true;
          s.score += 1;
          setScore(s.score);
        }
        // Circle against the two rectangles of the pillar.
        const cx = gsap.utils.clamp(p.x - PILLAR_W / 2, p.x + PILLAR_W / 2, px);
        const inX = Math.abs(cx - px) < PLANE_R;
        const top = p.gapY - gap / 2;
        const bottom = p.gapY + gap / 2;
        if (inX && (s.y - PLANE_R + 3 < top || s.y + PLANE_R - 3 > bottom)) {
          crash();
          return;
        }
      }
      s.pillars = s.pillars.filter((p) => p.x > -PILLAR_W);

      s.trail.push({ x: px, y: s.y });
      for (const pt of s.trail) pt.x -= speed * dt;
      if (s.trail.length > 26) s.trail.shift();

      if (s.y > s.h - PLANE_R) crash();
    };

    const draw = () => {
      const { w, h } = s;
      ctx.clearRect(0, 0, w, h);

      // Clouds in a warm grey so they still read on the white sky.
      ctx.fillStyle = "#f1f0ec";
      for (const cl of s.clouds) {
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
        ctx.arc(cl.x + cl.r * 0.9, cl.y + cl.r * 0.2, cl.r * 0.75, 0, Math.PI * 2);
        ctx.arc(cl.x - cl.r * 0.9, cl.y + cl.r * 0.25, cl.r * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }

      const gap = Math.max(118, h * 0.4);
      for (const p of s.pillars) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(p.x - PILLAR_W / 2, -30, PILLAR_W, p.gapY - gap / 2 + 30, 29);
        ctx.roundRect(p.x - PILLAR_W / 2, p.gapY + gap / 2, PILLAR_W, h - p.gapY - gap / 2 + 30, 29);
        ctx.fill();
      }

      s.trail.forEach((pt, i) => {
        if (i % 2) return;
        ctx.fillStyle = `rgba(23, 22, 28, ${(i / s.trail.length) * 0.35})`;
        ctx.beginPath();
        ctx.arc(pt.x - 16, pt.y + 4, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // The plane, tilted by its vertical speed.
      const px = w * 0.22;
      const tilt = s.phase === "over" ? 1.1 : gsap.utils.clamp(-0.55, 0.9, s.vy / 650);
      ctx.save();
      ctx.translate(px, s.y);
      ctx.rotate(tilt);
      ctx.scale(0.72, 0.72);
      ctx.translate(-26, -20);
      ctx.lineJoin = "round";
      ctx.lineWidth = 3;
      ctx.strokeStyle = INK;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(2, 18);
      ctx.lineTo(50, 2);
      ctx.lineTo(34, 38);
      ctx.lineTo(24, 26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e6e4ee";
      ctx.beginPath();
      ctx.moveTo(50, 2);
      ctx.lineTo(24, 26);
      ctx.lineTo(22, 36);
      ctx.lineTo(28, 29);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      update(dt);
      draw();
      raf = visible ? requestAnimationFrame(frame) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    io.observe(box);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp" || e.key === "Enter") {
      e.preventDefault();
      flap();
    }
  };

  return (
    <div
      ref={wrap}
      role="button"
      tabIndex={0}
      aria-label="Paper plane game. Press Space or click to fly."
      onPointerDown={(e) => {
        e.currentTarget.focus({ preventScroll: true });
        flap();
      }}
      onKeyDown={onKeyDown}
      className="group relative cursor-pointer select-none overflow-hidden bg-white outline-none [touch-action:manipulation] focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--sky)]/40"
    >
      <div className="relative h-[320px] md:h-[420px]">
        <canvas ref={canvas} className="absolute inset-0 block" aria-hidden />
      </div>

      {/* Score strip */}
      <div className="pointer-events-none absolute inset-x-0 top-5 mx-auto flex max-w-[1240px] items-start justify-between px-[var(--pad)] text-[13px] font-semibold md:top-7">
        <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-[var(--line)]">✈ Fly to Toronto</span>
        <span className="rounded-full bg-white px-3 py-1.5 tabular-nums shadow-sm ring-1 ring-[var(--line)]">Best {best}</span>
      </div>

      {phase === "playing" && (
        <div className="l2-display pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 text-[64px] tabular-nums md:top-14 md:text-[80px]" aria-live="polite">
          {score}
        </div>
      )}

      {phase !== "playing" && (
        <div ref={overlay} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
          {phase === "idle" ? (
            <>
              <p className="l2-display text-[clamp(30px,3.6vw,46px)]">Need a study break?</p>
              <p className="text-[15px] text-[var(--ink-2)]">Fly the plane through the gaps.</p>
              <span className="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-5 text-[14px] font-semibold text-white transition-transform group-hover:-translate-y-0.5">
                Click, tap or press Space
              </span>
            </>
          ) : (
            <>
              <p className="l2-display text-[clamp(30px,3.6vw,46px)]">{newBest ? "New best! 🎉" : "Crash landing!"}</p>
              <p className="text-[15px] text-[var(--ink-2)]">
                You cleared <b className="text-[var(--ink)]">{score}</b> {score === 1 ? "pillar" : "pillars"} · best {best}
              </p>
              <span className="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-5 text-[14px] font-semibold text-white">Fly again</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
