"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FileQuestion } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { resolveDraft } from "@/components/app/drafts";
import { EmptyState, Skeleton, buttonStyles } from "@/components/ui/kit";

/* The editor restores autosaved text from this browser, so it only renders
   client-side — no server HTML to disagree with what was saved. */
const Writer = dynamic(() => import("@/components/app/writer").then((m) => m.Writer), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col">
      <div className="h-[97px] border-b border-line-soft" />
      <div className="mx-auto w-full max-w-[680px] px-5 pt-10">
        <Skeleton className="h-9 w-2/3 rounded-lg" />
        <Skeleton className="mt-8 h-4 w-full rounded-md" />
        <Skeleton className="mt-3 h-4 w-11/12 rounded-md" />
        <Skeleton className="mt-3 h-4 w-4/5 rounded-md" />
      </div>
    </div>
  ),
});

export default function DraftPage() {
  const { id } = useParams<{ id: string }>();
  const draft = resolveDraft(id);

  if (!draft) {
    return (
      <Shell title="Draft not found" crumb="Writing coach">
        <EmptyState
          icon={FileQuestion}
          title="This draft doesn’t exist"
          body="It may have been deleted, or the link is from another browser. Your drafts are all in Writing coach."
          primary={
            <Link href="/documents" className={buttonStyles({ size: "sm" })}>
              Back to Writing coach
            </Link>
          }
        />
      </Shell>
    );
  }

  return (
    <Shell title={draft.title} crumb="Writing coach" bare>
      {/* key: a new draft id gets a fresh editor, not the previous one's state. */}
      <Writer key={draft.id} draft={draft} />
    </Shell>
  );
}
