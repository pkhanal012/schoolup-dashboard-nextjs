import * as React from "react";
import Image from "next/image";

/* Pieces and content for the landing page (/). Motion lives in landing-two.tsx. */

export const COLORS = ["var(--sun)", "var(--pink)", "var(--sky)", "var(--mint)", "var(--lilac)", "var(--coral)"] as const;

/** The rotating word in the hero, each with the pill colour it lands on. */
export const SWAP_WORDS = [
  { word: "panic", color: "#ffd23f" },
  { word: "guesswork", color: "#ff8fcf" },
  { word: "40 tabs", color: "#42befc" },
  { word: "stress", color: "#34d399" },
];

export const SCHOOLS = ["Toronto", "TU Delft", "Purdue", "Alberta", "Waterloo", "Melbourne", "Manchester", "Arizona State", "Monash", "Edinburgh", "UBC", "Glasgow"];

export const STEPS = [
  {
    n: "01",
    title: "Tell us your goal",
    body: "Where you want to study, what you want to study, and where your English is today. That is all it needs to start.",
    art: "/images/stickers/files.webp",
    bg: "var(--sun)",
    blob: "var(--coral)",
  },
  {
    n: "02",
    title: "Get your plan",
    body: "A shortlist of reach, target and safety schools, the scholarships you qualify for, and every deadline already on your calendar.",
    art: "/images/stickers/deadline.webp",
    bg: "var(--lilac)",
    blob: "var(--pink)",
  },
  {
    n: "03",
    title: "Apply with confidence",
    body: "Draft essays with line-by-line feedback, rehearse interviews until they feel familiar, and submit knowing nothing was missed.",
    art: "/images/stickers/notification.webp",
    bg: "var(--mint)",
    blob: "var(--sky)",
  },
];

export const STATS = [
  { value: 12400, suffix: "+", label: "students applying right now", color: "var(--sun)", shape: { n: 9, amp: 0.11 } },
  { value: 89, suffix: "", label: "countries in the community", color: "var(--sky)", shape: { n: 14, amp: 0.045 } },
  { value: 2800, suffix: "+", label: "colleges with live deadlines", color: "var(--pink)", shape: { n: 12, amp: 0.15 } },
];

/*
 * Student notes for the endless rows. The first three are quoted from the live
 * site (schoolupacademy.com). The rest are PLACEHOLDERS written for layout —
 * replace them with real, consented student quotes before this page ships.
 */
export const NOTES = [
  { quote: "I went from panicking about my personal statement to having three drafts I was proud of.", name: "Linh", route: "Vietnam → Purdue" },
  { quote: "The scholarship matches found two awards I had never heard of. One of them covered my whole first year.", name: "Adaeze", route: "Nigeria → University of Alberta" },
  { quote: "I did eleven mock interviews before the real one. By then the questions felt familiar instead of terrifying.", name: "Mateo", route: "Colombia → TU Delft" },
  { quote: "The deadline calendar did the remembering for me. I stopped waking up at 3am wondering what I had forgotten.", name: "Priya", route: "India → University of Toronto", placeholder: true },
  { quote: "The interview drills turned my answers from shaky to steady. The real one felt like another practice round.", name: "Minh", route: "Vietnam → University of Melbourne", placeholder: true },
  { quote: "Reach, target, safety finally made sense once I saw all my schools side by side.", name: "Aarav", route: "Nepal → University of Waterloo", placeholder: true },
  { quote: "The writing coach said my essay sounded like everyone else’s. It was right — and the rewrite got me in.", name: "Sofia", route: "Brazil → University of Edinburgh", placeholder: true },
  { quote: "I applied to six schools and never once opened a spreadsheet.", name: "Kwame", route: "Ghana → University of Manchester", placeholder: true },
  { quote: "My parents could finally see the plan too, which meant far fewer dinner-table debates.", name: "Yuki", route: "Japan → UBC", placeholder: true },
  { quote: "Practising answers out loud made the real interview feel like a rerun.", name: "Omar", route: "Egypt → Monash University", placeholder: true },
  { quote: "An alert caught a scholarship two days before it closed. I would have missed it completely.", name: "Elena", route: "Mexico → Arizona State", placeholder: true },
  { quote: "It felt less like an app and more like a calm friend who knows every deadline.", name: "Sanjana", route: "Sri Lanka → University of Glasgow", placeholder: true },
];

/** Note colours, cycled: [card, tape/avatar]. */
export const NOTE_TONES = [
  ["var(--pink-soft)", "var(--pink)"],
  ["var(--sun-soft)", "var(--sun)"],
  ["var(--sky-soft)", "var(--sky)"],
  ["var(--mint-soft)", "var(--mint)"],
  ["var(--lilac-soft)", "var(--lilac)"],
  ["var(--coral-soft)", "var(--coral)"],
] as const;

export const PLANS = [
  {
    name: "Starter",
    price: 0,
    per: "free to start",
    blurb: "For students still deciding where to apply.",
    items: ["College & scholarship search", "Deadline tracker for 5 schools", "2 essay reviews a month", "5 AI mock interviews a month", "Community access"],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: 14,
    per: "per month",
    blurb: "The full application toolkit, month to month.",
    items: ["Everything in Starter", "Unlimited essay reviews", "Unlimited AI mock interviews", "Scholarship matching & alerts", "Unlimited application tracking"],
    cta: "Go Pro",
  },
];

/** A wobbly circle: radius r(θ) = 1 + amp·cos(nθ), as an SVG path in a 200×200 box. */
export function blobPath(n: number, amp: number) {
  const pts: string[] = [];
  const steps = 240;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = 88 * (1 + amp * Math.cos(n * t)) / (1 + amp);
    pts.push(`${(100 + r * Math.cos(t)).toFixed(2)},${(100 + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

/* ------------------------------------------------------------- Stickers */

type Place = { x: string; y: string; s: string; mx?: string; my?: string; ms?: string; r: number; depth: number };

export type StickerDef = Place & { src: string; alt: string };

export const STICKERS: StickerDef[] = [
  { src: "/images/stickers/university.webp", alt: "", x: "4%", y: "18%", s: "164px", mx: "3%", my: "86px", ms: "96px", r: -8, depth: 18 },
  { src: "/images/stickers/writing.webp", alt: "", x: "6%", y: "62%", s: "172px", r: 6, depth: 12 },
  { src: "/images/stickers/progress.webp", alt: "", x: "86%", y: "16%", s: "132px", mx: "74%", my: "78px", ms: "80px", r: 6, depth: 22 },
  { src: "/images/stickers/interview.webp", alt: "", x: "82%", y: "61%", s: "176px", r: -5, depth: 14 },
];

export function Sticker({ def, index }: { def: StickerDef; index: number }) {
  const mobile = Boolean(def.mx);
  const style = {
    "--x": def.x,
    "--y": def.y,
    "--s": def.s,
    "--mx": def.mx ?? def.x,
    "--my": def.my ?? def.y,
    "--ms": def.ms ?? def.s,
    "--r": `${def.r}deg`,
    zIndex: 2 + index,
  } as React.CSSProperties;

  return (
    <div data-sticker data-mobile={mobile} className="l2-sticker" style={style}>
      <div data-par data-depth={def.depth}>
        <div data-float>
          <div data-pop data-intro>
            <Image src={def.src} alt={def.alt} width={400} height={400} draggable={false} sizes="(min-width: 1024px) 230px, 112px" preload />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Small bits */

export function PaperPlane() {
  return (
    <g data-plane>
      <g transform="translate(-26 -20)">
        <path d="M2 18 L50 2 L34 38 L24 26 Z" fill="#fff" stroke="#17161c" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 2 L24 26 L22 36 L28 29" fill="#e6e4ee" stroke="#17161c" strokeWidth="2.5" strokeLinejoin="round" />
      </g>
    </g>
  );
}

export function Star({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 1.5c.6 4.6 2.4 7.6 10.5 10.5-8.1 2.9-9.9 5.9-10.5 10.5-.6-4.6-2.4-7.6-10.5-10.5C9.6 9.1 11.4 6.1 12 1.5Z" fill={color} />
    </svg>
  );
}
