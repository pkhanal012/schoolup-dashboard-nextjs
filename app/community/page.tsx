"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, MessageSquarePlus, Send, Sparkles } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { Avatar, PostCard, TOPIC_SOFT } from "@/components/app/community-ui";
import {
  TOPICS,
  addPost,
  boostPost,
  contributors,
  sortPosts,
  toggleFollow,
  topicOf,
  trending,
  useCommunity,
  type Sort,
  type TopicId,
} from "@/components/app/community";
import { student } from "@/components/app/data";
import {
  Button,
  DataTableEmpty,
  FilterTag,
  Label,
  Panel,
  PanelList,
  Segmented,
  TableToolbar,
  Tabs,
  useToast,
} from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/*
 * The board, in the landing page's sticker-book voice: a pink hero that is
 * also the place to ask, the six topics as pastel tiles you can open or
 * follow, then the threads — and a rail of reasons to come back.
 */

type Feed = "all" | "following" | "mine";

const SORTS: { value: Sort; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "new", label: "New" },
  { value: "top", label: "Top" },
];

export default function CommunityPage() {
  const { posts, boostedPosts, following } = useCommunity();
  const toast = useToast();
  const router = useRouter();

  const [feed, setFeed] = React.useState<Feed>("all");
  const [sort, setSort] = React.useState<Sort>("hot");
  const [topic, setTopic] = React.useState<TopicId | null>(null);
  const [composing, setComposing] = React.useState(false);
  const feedRef = React.useRef<HTMLDivElement>(null);

  const mineCount = posts.filter((p) => p.author === student.name).length;
  const solved = posts.filter((p) => p.replies.some((r) => r.accepted)).length;
  const helpers = contributors(posts).length;

  const list = React.useMemo(() => {
    let rows = posts;
    if (feed === "following") rows = rows.filter((p) => following.includes(p.topic));
    if (feed === "mine") rows = rows.filter((p) => p.author === student.name);
    if (topic) rows = rows.filter((p) => p.topic === topic);
    return sortPosts(rows, sort);
  }, [posts, feed, sort, topic, following]);

  const publish = (input: { title: string; body: string; topic: TopicId }) => {
    const id = addPost(input);
    setComposing(false);
    toast({ message: "Posted to the community", action: { label: "View thread", onClick: () => router.push(`/community/${id}`) } });
  };

  const pickTopic = (id: TopicId) => {
    setTopic((cur) => (cur === id ? null : id));
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Shell
      title="Community"
      description="Applicants and current students, answering each other."
      actions={
        <Button size="sm" variant="primary" onClick={() => setComposing(true)}>
          <MessageSquarePlus /> New post
        </Button>
      }
    >
      <div className="su-stagger flex flex-col gap-5">
        <Hero helpers={helpers} solved={solved}>
          {composing ? (
            <Composer initialTopic={topic ?? "applications"} onCancel={() => setComposing(false)} onPublish={publish} />
          ) : (
            <AskStub onOpen={() => setComposing(true)} />
          )}
        </Hero>

        <TopicTiles active={topic} onPick={pickTopic} />

        <div ref={feedRef} className="flex min-w-0 scroll-mt-4 flex-col gap-4">
          {/* Which threads on the left, in what order on the right, on one hairline. */}
          <div className="flex items-end gap-3 border-b border-line-soft">
            <Tabs
              className="min-w-0 flex-1 border-b-0"
              value={feed}
              onChange={setFeed}
              tabs={[
                { value: "all", label: "All threads", count: posts.length },
                { value: "following", label: "Following", count: following.length ? posts.filter((p) => following.includes(p.topic)).length : undefined },
                { value: "mine", label: "Yours", count: mineCount },
              ]}
            />
            <Segmented className="mb-1 shrink-0" label="Sort threads" options={SORTS} value={sort} onChange={setSort} />
          </div>

          <Panel className="overflow-hidden">
            {topic ? (
              <TableToolbar>
                <FilterTag label="Topic" value={`${topicOf(topic).emoji} ${topicOf(topic).label}`} onRemove={() => setTopic(null)} />
                <span className="ml-auto pr-1 text-[12.5px] tabular-nums text-ink-3">
                  {list.length} {list.length === 1 ? "thread" : "threads"}
                </span>
              </TableToolbar>
            ) : null}
            {list.length ? (
              <PanelList className="su-stagger">
                {list.map((post) => (
                  <PostCard key={post.id} post={post} boosted={boostedPosts.includes(post.id)} onBoost={() => boostPost(post.id)} />
                ))}
              </PanelList>
            ) : (
              <DataTableEmpty
                illustration={{ light: "/images/stickers/notification.webp", dark: "/images/stickers/notification.webp" }}
                illustrationClassName="size-36"
                title={feed === "mine" ? "You haven't posted yet" : feed === "following" ? "You're not following a topic yet" : "Nothing here yet"}
                body={
                  feed === "mine"
                    ? "Ask the thing you are stuck on. Somebody two intakes ahead of you has already solved it."
                    : feed === "following"
                      ? "Tap the bell on a topic above and its threads collect here."
                      : "Start the first thread in this topic."
                }
                primary={
                  feed === "following" ? undefined : (
                    <Button size="sm" variant="primary" onClick={() => setComposing(true)}>
                      <MessageSquarePlus /> New post
                    </Button>
                  )
                }
              />
            )}
          </Panel>
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------- Hero */

/* Home's hero, in Community's own colour: pink paper with the dot grid, the
   headline with one word on a tilted sun pill, stickers, and the ask box. */
function Hero({ helpers, solved, children }: { helpers: number; solved: number; children: React.ReactNode }) {
  return (
    <section className="su-pat-dots relative overflow-hidden rounded-[28px] bg-pink-soft px-5 py-6 [--pc:rgba(255,143,207,0.3)] sm:px-8 sm:py-8 dark:[--pc:rgba(255,143,207,0.12)]">
      <div className="relative z-[1] max-w-[600px]">
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-surface px-3.5 text-[12.5px] font-medium text-ink-2 shadow-e1">
          <i aria-hidden className="size-2 rounded-full bg-mint shadow-[0_0_0_4px_color-mix(in_oklab,var(--mint)_25%,transparent)]" />
          {helpers} students helping · {solved} threads solved
        </span>
        <h1 className="su-display mt-4 text-[clamp(28px,3.6vw,44px)] leading-[1.04]">
          Ask the people{" "}
          <span className="inline-block -rotate-[1.5deg] rounded-[0.28em] bg-sun px-[0.18em] text-[#17161c]">two intakes</span> ahead of you
        </h1>
        <p className="mt-3 max-w-[48ch] text-[14.5px] leading-relaxed text-ink-2">
          Applicants and current students, answering each other. Boost what helped, so the next person finds it first.
        </p>
        <div className="mt-5">{children}</div>
      </div>
      {/* eslint-disable @next/next/no-img-element -- fixed local stickers, not content */}
      <img
        src="/images/stickers/university.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[19%] top-8 hidden w-[132px] -rotate-6 drop-shadow-[0_14px_18px_rgba(23,22,28,0.16)] xl:block"
      />
      <img
        src="/images/stickers/writing.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-3 right-5 hidden w-[128px] rotate-6 drop-shadow-[0_14px_18px_rgba(23,22,28,0.16)] md:block xl:right-10 xl:w-[150px]"
      />
      {/* eslint-enable @next/next/no-img-element */}
    </section>
  );
}

function AskStub({ onOpen }: { onOpen: () => void }) {
  return (
    /* A button, not a decorated div: the composer opens from the keyboard too. */
    <button
      onClick={onOpen}
      className="group flex w-full cursor-text items-center gap-3 rounded-full bg-surface py-1.5 pl-1.5 pr-1.5 text-left shadow-e2 transition-[box-shadow,transform] duration-300 ease-[var(--ease-spring)] hover:-translate-y-0.5 hover:shadow-e3"
    >
      <Avatar name={student.name} initials={student.initials} size={36} />
      <span className="flex-1 truncate text-[14px] text-ink-3">What are you stuck on?</span>
      <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-surface">
        <Sparkles className="size-[15px]" /> Ask
      </span>
    </button>
  );
}

function Composer({
  initialTopic,
  onCancel,
  onPublish,
}: {
  initialTopic: TopicId;
  onCancel: () => void;
  onPublish: (p: { title: string; body: string; topic: TopicId }) => void;
}) {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [topic, setTopic] = React.useState<TopicId>(initialTopic);
  const ready = title.trim().length > 8 && body.trim().length > 0;

  return (
    <div className="su-pop rounded-[24px] bg-surface p-4 shadow-e3">
      <div className="flex items-start gap-3">
        <Avatar name={student.name} initials={student.initials} size={36} />
        <div className="min-w-0 flex-1">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A question, or something you worked out"
            aria-label="Post title"
            className="su-display mt-1.5 w-full bg-transparent text-[17px] placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-3 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="What have you tried, and where exactly are you stuck? Specifics get better answers than 'any tips?'"
            aria-label="Post body"
            className="mt-2 w-full resize-none bg-transparent text-[13.5px] leading-relaxed placeholder:text-ink-3 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-2 border-t border-line-soft pt-3">
        <Label>Topic</Label>
        {/* The topics wear their own colours here too, so picking one previews its tag. */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TOPICS.map((t) => {
            const on = topic === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => setTopic(t.id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-[box-shadow,transform] duration-300 ease-[var(--ease-spring)] active:scale-95",
                  TOPIC_SOFT[t.tone],
                  on ? "font-semibold text-ink shadow-[inset_0_0_0_2px_var(--ink)]" : "text-ink-2 hover:text-ink",
                )}
              >
                <span aria-hidden>{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" disabled={!ready} onClick={() => onPublish({ title: title.trim(), body: body.trim(), topic })}>
            <Send /> Post
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Topics */

/* The six topics as sticker tiles, like the landing page's toolkit: each on its
   own pastel, with what is moving in it. Tap to open; the bell follows it. */
function TopicTiles({ active, onPick }: { active: TopicId | null; onPick: (id: TopicId) => void }) {
  const { posts, following } = useCommunity();
  const stats = new Map(trending(posts).map((r) => [r.topic.id, r]));

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {TOPICS.map((t) => {
        const s = stats.get(t.id);
        const on = active === t.id;
        const followed = following.includes(t.id);
        return (
          <div key={t.id} className="group relative">
            <button
              onClick={() => onPick(t.id)}
              aria-pressed={on}
              className={cn(
                "flex h-full w-full flex-col items-start rounded-card p-3.5 pr-10 text-left transition-[transform,box-shadow] duration-300 ease-[var(--ease-spring)] hover:-translate-y-1 hover:shadow-e3",
                TOPIC_SOFT[t.tone],
                on && "-translate-y-1 shadow-[inset_0_0_0_2px_var(--ink),var(--shadow-3)]",
              )}
            >
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full bg-surface text-[19px] shadow-e1 transition-transform duration-300 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110"
              >
                {t.emoji}
              </span>
              <span className="su-display mt-3 text-[15px] leading-tight">{t.label}</span>
              <span className="mt-1 text-[12px] tabular-nums text-ink-2">
                {s ? `${s.posts} ${s.posts === 1 ? "thread" : "threads"}` : "No threads yet"}
                {s?.fresh ? <span className="font-semibold text-ink"> · {s.fresh} new</span> : null}
              </span>
            </button>
            <button
              onClick={() => toggleFollow(t.id)}
              aria-pressed={followed}
              aria-label={followed ? `Unfollow ${t.label}` : `Follow ${t.label}`}
              title={followed ? "Following — tap to stop" : "Follow this topic"}
              className={cn(
                "absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full transition-[background-color,color,transform] duration-300 ease-[var(--ease-spring)] active:scale-90",
                followed ? "bg-ink text-surface" : "bg-surface/70 text-ink-2 hover:bg-surface hover:text-ink",
              )}
            >
              {followed ? <BellRing className="size-[15px]" /> : <Bell className="size-[15px]" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
