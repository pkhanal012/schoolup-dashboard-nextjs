"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, MessageSquare, MessagesSquare, Pin } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { Avatar, BoostButton, Byline, TopicTag } from "@/components/app/community-ui";
import {
  acceptReply,
  addReply,
  age,
  boostPost,
  boostReply,
  isMine,
  topicOf,
  useCommunity,
  type Reply,
} from "@/components/app/community";
import { student } from "@/components/app/data";
import { Badge, Button, EmptyState, Panel, PanelHead, PanelList, fieldStyles, useToast } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

/* One thread, in full. The question sits at the top with its boost; answers run
   underneath, the accepted one first. */

export default function ThreadPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { posts, boostedPosts, boostedReplies } = useCommunity();
  const toast = useToast();
  const post = posts.find((p) => p.id === params.id);

  if (!post) {
    return (
      <Shell title="Thread not found" crumb="Community" back={{ href: "/community", label: "Community" }}>
        <EmptyState
          icon={MessagesSquare}
          title="That thread is gone"
          body="It may have been removed. Everything else is still on the board."
          primary={
            <Button size="sm" onClick={() => router.push("/community")}>
              Back to the community
            </Button>
          }
        />
      </Shell>
    );
  }

  const mine = isMine(post.author);
  const answered = post.replies.some((r) => r.accepted);

  /* Accepted answer first, then whatever the board boosted hardest. */
  const replies = [...post.replies].sort(
    (a, b) => Number(Boolean(b.accepted)) - Number(Boolean(a.accepted)) || b.boosts - a.boosts,
  );

  const related = posts.filter((p) => p.topic === post.topic && p.id !== post.id).slice(0, 4);

  return (
    <Shell
      title={post.title}
      crumb="Community"
      back={{ href: "/community", label: "Community" }}
      icon={<span aria-hidden className="text-[18px] leading-none">{topicOf(post.topic).emoji}</span>}
      description={`${topicOf(post.topic).label} · ${post.replies.length} replies`}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <TopicTag topic={post.topic} />
              {post.pinned ? <Badge tone="accent"><Pin className="size-[11px]" /> Pinned</Badge> : null}
              {answered ? <Badge tone="good"><CheckCircle2 className="size-[11px]" /> Answered</Badge> : null}
            </div>

            <h1 className="su-display mt-3 text-[24px] leading-[1.15]">{post.title}</h1>

            <div className="mt-3">
              <Byline post={post} />
            </div>

            <Body text={post.body} className="mt-4" />

            <div className="mt-5 flex items-center gap-2 border-t border-line-soft pt-4">
              <BoostButton count={post.boosts} on={boostedPosts.includes(post.id)} onClick={() => boostPost(post.id)} />
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3">
                <MessageSquare className="size-3.5" />
                {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
              </span>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHead
              title={`${post.replies.length} ${post.replies.length === 1 ? "reply" : "replies"}`}
              hint={mine ? "Mark the one that solved it so the next person finds it first." : undefined}
            />
            {replies.length ? (
              <PanelList>
                {replies.map((reply) => (
                  <ReplyRow
                    key={reply.id}
                    reply={reply}
                    boosted={boostedReplies.includes(reply.id)}
                    onBoost={() => boostReply(post.id, reply.id)}
                    canAccept={mine && !isMine(reply.author)}
                    onAccept={() => {
                      acceptReply(post.id, reply.id);
                      toast({ message: reply.accepted ? "Unmarked" : `Marked ${reply.author}'s reply as the answer` });
                    }}
                  />
                ))}
              </PanelList>
            ) : (
              <p className="px-4 py-6 text-center text-[12.5px] text-ink-3">No replies yet — be the first.</p>
            )}

            <ReplyBox
              onSend={(body) => {
                addReply(post.id, body);
                toast({ message: "Reply posted" });
              }}
            />
          </Panel>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <Panel className="overflow-hidden">
            <PanelHead title={`More in ${topicOf(post.topic).label}`} />
            {related.length ? (
              <PanelList>
                {related.map((p) => (
                  <li key={p.id}>
                    <Link href={`/community/${p.id}`} className="block px-4 py-3 transition-colors hover:bg-hover">
                      <span className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.15px]">{p.title}</span>
                      <span className="mt-1 block text-[12px] tabular-nums text-ink-3">
                        {p.boosts} boosts · {p.replies.length} replies · {age(p.ageMinutes)}
                      </span>
                    </Link>
                  </li>
                ))}
              </PanelList>
            ) : (
              <p className="px-4 py-4 text-[12.5px] text-ink-3">Nothing else here yet.</p>
            )}
          </Panel>

          <Panel>
            <PanelHead title="How this board works" />
            <ul className="flex flex-col gap-1.5 px-4 py-3.5 text-[12.5px] leading-relaxed text-ink-2">
              <li>Boost what helped — it is how the next person finds it.</li>
              <li>Say what you tried, not just what went wrong.</li>
              <li>Answer one thread for every one you ask.</li>
            </ul>
          </Panel>
        </aside>
      </div>
    </Shell>
  );
}

/** Blank lines in the source become paragraphs; nothing else is interpreted. */
function Body({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 text-[13.5px] leading-relaxed text-ink-2", className)}>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

function ReplyRow({
  reply,
  boosted,
  onBoost,
  canAccept,
  onAccept,
}: {
  reply: Reply;
  boosted: boolean;
  onBoost: () => void;
  canAccept: boolean;
  onAccept: () => void;
}) {
  return (
    <li className={cn("px-4 py-4", reply.accepted && "bg-good-soft/40")}>
      <div className="flex items-center gap-2">
        <Avatar name={reply.author} initials={reply.initials} size={28} />
        <p className="min-w-0 flex-1 truncate text-[13px]">
          <span className="font-medium">{reply.author}</span>
          <span className="text-ink-3"> · {reply.role}</span>
        </p>
        <span className="shrink-0 text-[12px] text-ink-3">{age(reply.ageMinutes)}</span>
      </div>

      {reply.accepted ? (
        <div className="mt-2 pl-[38px]">
          <Badge tone="good">
            <CheckCircle2 className="size-[11px]" /> Marked as the answer
          </Badge>
        </div>
      ) : null}

      <Body text={reply.body} className="mt-2 pl-[38px] text-[13px]" />

      <div className="mt-3 flex items-center gap-2 pl-[38px]">
        <BoostButton size="sm" count={reply.boosts} on={boosted} onClick={onBoost} />
        {canAccept ? (
          <button
            onClick={onAccept}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold transition-colors",
              reply.accepted ? "text-ink-3 hover:bg-hover hover:text-ink" : "text-ink-3 hover:bg-hover hover:text-good",
            )}
          >
            <CheckCircle2 className="size-3.5" />
            {reply.accepted ? "Unmark" : "This answered it"}
          </button>
        ) : null}
      </div>
    </li>
  );
}

function ReplyBox({ onSend }: { onSend: (body: string) => void }) {
  const [body, setBody] = React.useState("");
  const ready = body.trim().length > 1;

  const send = () => {
    if (!ready) return;
    onSend(body.trim());
    setBody("");
  };

  return (
    <div className="border-t border-line-soft bg-sunken px-4 py-4">
      <div className="flex items-start gap-3">
        <Avatar name={student.name} initials={student.initials} size={28} />
        <div className="min-w-0 flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            // ⌘/Ctrl+Enter sends, so a long answer can still take Enter for a paragraph.
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
            }}
            rows={3}
            placeholder="Answer from what you actually did…"
            aria-label="Your reply"
            className={cn(fieldStyles, "h-auto resize-none py-2.5 leading-relaxed")}
          />
          <div className="mt-2 flex items-center gap-2">
            <Button size="sm" variant="primary" disabled={!ready} onClick={send}>
              Reply
            </Button>
            <span className="text-[12px] text-ink-3">⌘↵ to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
