"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowBigUp, CheckCircle2, MessageSquare, Pin } from "lucide-react";
import { student } from "./data";
import { age, isMine, topicOf, type Post } from "./community";
import { Badge, type StickerTone } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/* The pieces the feed and a thread both draw. Kept together so a post looks the
   same wherever it appears. */

/* Six tints, picked from the name so one person keeps one colour across the
   board without anybody storing an avatar. */
const TINTS = [
  "bg-[#e2f4fe] text-[#0a7cb3] mode-dark:bg-[#0e2c3e] mode-dark:text-[#6ccbfb]",
  "bg-[#dfecd6] text-[#2f7d47] mode-dark:bg-[#1b2c17] mode-dark:text-[#8fd97a]",
  "bg-[#fbf1de] text-[#97650a] mode-dark:bg-[#251c0d] mode-dark:text-[#dda54a]",
  "bg-[#fceeec] text-[#c0433d] mode-dark:bg-[#2a1614] mode-dark:text-[#e88b86]",
  "bg-[#e2edf7] text-[#2d6394] mode-dark:bg-[#132434] mode-dark:text-[#8ec0ea]",
  "bg-[#f4e7f5] text-[#8c3f92] mode-dark:bg-[#2a1630] mode-dark:text-[#d79fdc]",
];

const tintOf = (name: string) => TINTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];

export function Avatar({ name, initials, size = 32, className }: { name: string; initials: string; size?: number; className?: string }) {
  if (isMine(name)) {
    return (
      <Image
        src={student.avatar}
        alt=""
        aria-hidden
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover ring-1 ring-inset ring-[var(--line)]", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold leading-none", tintOf(name), className)}
    >
      {initials}
    </span>
  );
}

/** The board's one reaction: an upvote that says "this helped". */
export function BoostButton({
  count,
  on,
  onClick,
  size = "md",
  column,
}: {
  count: number;
  on: boolean;
  onClick: () => void;
  size?: "sm" | "md";
  /** The feed's vote column: arrow over count, in a tall pill. */
  column?: boolean;
}) {
  if (column) {
    return (
      <button
        onClick={onClick}
        aria-pressed={on}
        aria-label={on ? `Remove your boost (${count})` : `Boost this (${count})`}
        className={cn(
          "flex w-11 shrink-0 select-none flex-col items-center gap-0.5 rounded-2xl py-2 text-[12.5px] font-semibold tabular-nums",
          "transition-[background-color,color,box-shadow,transform] duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 active:scale-95",
          on
            ? "bg-sky-soft text-accent shadow-[inset_0_0_0_1.5px_var(--accent-line)]"
            : "bg-surface text-ink-2 shadow-[inset_0_0_0_1.5px_var(--line)] hover:text-ink hover:shadow-[inset_0_0_0_1.5px_var(--line-strong)]",
        )}
      >
        <ArrowBigUp className={cn("size-5 transition-transform duration-300", on && "-translate-y-0.5 fill-current")} strokeWidth={1.75} />
        {count}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? `Remove your boost (${count})` : `Boost this (${count})`}
      className={cn(
        "inline-flex select-none items-center gap-1 rounded-full font-semibold tabular-nums transition-[background-color,color,transform] duration-300 ease-[var(--ease-spring)] active:scale-95",
        size === "sm" ? "h-7 px-2 text-[12px]" : "h-8 px-2.5 text-[12.5px]",
        on ? "bg-sky-soft text-accent" : "text-ink-3 hover:bg-hover hover:text-ink",
      )}
    >
      <ArrowBigUp
        className={cn("transition-transform duration-200", size === "sm" ? "size-3.5" : "size-4", on && "-translate-y-px fill-current")}
        strokeWidth={1.75}
      />
      {count}
    </button>
  );
}

/* The topic's sticker colour as a tint (tags, tiles) and as a solid dot. */
export const TOPIC_SOFT: Record<StickerTone, string> = {
  sun: "bg-sun-soft",
  pink: "bg-pink-soft",
  sky: "bg-sky-soft",
  mint: "bg-mint-soft",
  lilac: "bg-lilac-soft",
  coral: "bg-coral-soft",
};

/** A thread's topic: its emoji on its own pastel, so the board reads by colour. */
export function TopicTag({ topic, className }: { topic: Post["topic"]; className?: string }) {
  const t = topicOf(topic);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[4px] text-[11px] font-semibold leading-none text-ink",
        TOPIC_SOFT[t.tone],
        className,
      )}
    >
      <span aria-hidden className="text-[11px]">{t.emoji}</span>
      {t.label}
    </span>
  );
}

export function Byline({ post, className }: { post: Pick<Post, "author" | "initials" | "role" | "ageMinutes">; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <Avatar name={post.author} initials={post.initials} size={28} />
      <p className="min-w-0 truncate text-[12.5px]">
        <span className="font-medium">{post.author}</span>
        <span className="text-ink-3"> · {post.role}</span>
      </p>
      <span className="shrink-0 text-[12px] text-ink-3">{age(post.ageMinutes)}</span>
    </div>
  );
}

/**
 * One thread in the feed: the boost in its own column on the left, then the
 * topic, the question, a taste of it, and who is in the conversation. The
 * whole card links through; the boost is the one thing you can do in place.
 */
export function PostCard({ post, boosted, onBoost }: { post: Post; boosted: boolean; onBoost: () => void }) {
  const answered = post.replies.some((r) => r.accepted);
  // Each person once, most recent voice first — a face pile of who is talking.
  const voices = [...new Map(post.replies.map((r) => [r.author, r])).values()].slice(0, 3);

  return (
    <li className="group relative flex gap-4 px-4 py-4 transition-colors hover:bg-hover/40">
      {/* Above the link's overlay, so it stays clickable inside the card. */}
      <div className="relative z-10">
        <BoostButton column count={post.boosts} on={boosted} onClick={onBoost} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <TopicTag topic={post.topic} />
          {post.pinned ? (
            <Badge tone="accent">
              <Pin className="size-[11px]" /> Pinned
            </Badge>
          ) : null}
          {answered ? (
            <Badge tone="good">
              <CheckCircle2 className="size-[11px]" /> Answered
            </Badge>
          ) : null}
        </div>

        <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-[-0.2px]">
          {/* The link spans the card so the target is the whole thread, not the words. */}
          <Link href={`/community/${post.id}`} className="after:absolute after:inset-0 group-hover:underline">
            {post.title}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">{post.body}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] text-ink-3">
          <Avatar name={post.author} initials={post.initials} size={22} />
          <span className="font-medium text-ink-2">{post.author}</span>
          <span className="hidden truncate sm:inline">{post.role}</span>
          <span aria-hidden>·</span>
          <span>{age(post.ageMinutes)}</span>

          <span className="ml-auto flex items-center gap-2">
            {voices.length ? (
              <span className="flex">
                {voices.map((r, i) => (
                  <Avatar key={r.author} name={r.author} initials={r.initials} size={22} className={cn("ring-2 ring-surface", i > 0 && "-ml-1.5")} />
                ))}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 font-medium text-ink-2">
              <MessageSquare className="size-3.5" />
              {post.replies.length ? post.replies.length : "Be the first"}
            </span>
          </span>
        </div>
      </div>
    </li>
  );
}
