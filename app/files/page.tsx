"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Download, FileText, Info, Sparkles, Trash2, Upload, XCircle } from "lucide-react";
import {
  Badge,
  Button,
  Chip,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableEmpty,
  DataTableHead,
  DataTablePrimary,
  DataTableRow,
  Drawer,
  EmptyState,
  IconTile,
  Inset,
  Label,
  ResultCount,
  Skeleton,
  TableSkeleton,
  useToast,
} from "@/components/ui/kit";
import { Shell } from "@/components/app/shell";
import { FILE_KIND } from "@/components/app/doc-types";
import {
  KINDS,
  addFiles,
  contentType,
  formatSize,
  formatWhen,
  removeFile,
  reviewability,
  setKind,
  setReview,
  toBase64,
  useFiles,
  type FileKind,
  type Finding,
  type Severity,
  type StoredFile,
} from "@/components/app/files";

/* My files — one place for the documents an application needs, plus a reviewer
   that reads a file and says what a university would send back. Files stay in
   this browser (see components/app/files.ts); only the file being reviewed is
   ever sent anywhere. */

const FILES_ILLUSTRATION = {
  light: "/images/illustratioin/files.png",
  dark: "/images/illustratioin/files.png",
};

/* File · Label · Size · Added · Review. */
const COLS = "@3xl:grid-cols-[minmax(0,1fr)_128px_80px_112px_112px]";

const SEVERITY: Record<Severity, { label: string; tone: "bad" | "warn" | "accent"; ink: string; icon: React.ElementType }> = {
  error: { label: "Fix", tone: "bad", ink: "text-bad", icon: XCircle },
  warning: { label: "Check", tone: "warn", ink: "text-warn", icon: AlertTriangle },
  note: { label: "Note", tone: "accent", ink: "text-accent", icon: Info },
};

export default function FilesPage() {
  const { files, ready } = useFiles();
  const [filter, setFilter] = React.useState<FileKind | "all">("all");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const toast = useToast();

  const shown = filter === "all" ? files : files.filter((f) => f.kind === filter);
  const open = files.find((f) => f.id === openId) ?? null;
  const needsWork = files.filter((f) => f.review?.findings.some((x) => x.severity === "error")).length;

  const take = React.useCallback(
    async (picked: File[]) => {
      if (!picked.length) return;
      const { added, rejected } = await addFiles(picked);
      if (added) toast({ message: added === 1 ? "File added." : `${added} files added.` });
      for (const r of rejected) toast({ message: `${r.name} — ${r.reason}.` });
    },
    [toast],
  );

  return (
    <Shell
      title="My files"
      description="Every document your applications need, kept on this device. The reviewer reads one and tells you what a university would send back."
      actions={<UploadButton onFiles={take} />}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {!ready ? (
          <TableSkeleton rows={3} />
        ) : files.length === 0 ? (
          <EmptyState
            illustration={FILES_ILLUSTRATION}
            illustrationClassName="size-56 sm:size-64"
            title="No files yet"
            body="Add your transcript, passport, CV and test scores. They stay on this device — nothing is uploaded until you ask for a review."
            primary={<UploadButton onFiles={take} variant="secondary" size="sm" />}
          />
        ) : (
          <DataTable
            cols={COLS}
            toolbar={
              <>
                <Chip active={filter === "all"} onClick={() => setFilter("all")}>
                  All <span className="tabular-nums opacity-60">{files.length}</span>
                </Chip>
                {KINDS.filter((k) => files.some((f) => f.kind === k.value)).map((k) => (
                  <Chip key={k.value} active={filter === k.value} onClick={() => setFilter(k.value)}>
                    {k.label} <span className="tabular-nums opacity-60">{files.filter((f) => f.kind === k.value).length}</span>
                  </Chip>
                ))}
                <ResultCount>
                  {needsWork ? (
                    <>
                      <span className="font-medium text-bad">{needsWork}</span> {needsWork === 1 ? "file needs" : "files need"} fixing
                    </>
                  ) : (
                    `${shown.length} ${shown.length === 1 ? "file" : "files"}`
                  )}
                </ResultCount>
              </>
            }
          >
            {shown.length === 0 ? (
              <DataTableEmpty icon={FileText} title="Nothing in this category" body="Pick another label, or add a file to it." />
            ) : (
              <>
                <DataTableHead>
                  <span>File</span>
                  <span>Label</span>
                  <span>Size</span>
                  <span>Added</span>
                  <span className="text-right">Review</span>
                </DataTableHead>
                <DataTableBody>
                  {shown.map((file) => (
                    <FileRow key={file.id} file={file} onOpen={() => setOpenId(file.id)} />
                  ))}
                </DataTableBody>
              </>
            )}
          </DataTable>
        )}
      </div>

      {/* Keyed by file: opening another one starts with a clean review state. */}
      <FileDrawer key={openId ?? "none"} file={open} onClose={() => setOpenId(null)} />
    </Shell>
  );
}

/* ----------------------------------------------------------- Uploading */

function pickFiles(onFiles: (files: File[]) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.onchange = () => onFiles([...(input.files ?? [])]);
  input.click();
}

function UploadButton({
  onFiles,
  variant = "primary",
  size = "md",
}: {
  onFiles: (files: File[]) => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
}) {
  return (
    <Button variant={variant} size={size} onClick={() => pickFiles(onFiles)}>
      <Upload /> Add files
    </Button>
  );
}

/* --------------------------------------------------------------- Rows */

function FileIcon({ file }: { file: StoredFile }) {
  const look = FILE_KIND[file.kind];
  return <IconTile icon={look.icon} tone={look.tone} />;
}

function ReviewBadge({ file }: { file: StoredFile }) {
  if (!file.review) return <span className="text-[12px] text-ink-4">Not reviewed</span>;
  const errors = file.review.findings.filter((f) => f.severity === "error").length;
  const warnings = file.review.findings.filter((f) => f.severity === "warning").length;
  if (errors) return <Badge tone="bad">{errors} to fix</Badge>;
  if (warnings) return <Badge tone="warn">{warnings} to check</Badge>;
  return <Badge tone="good">Looks clean</Badge>;
}

function FileRow({ file, onOpen }: { file: StoredFile; onOpen: () => void }) {
  const kind = KINDS.find((k) => k.value === file.kind)?.label;
  return (
    <DataTableRow onClick={onOpen}>
      <DataTablePrimary
        lead={<FileIcon file={file} />}
        title={
          /* The row is clickable for the mouse; this button is the keyboard path. */
          <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="max-w-full truncate text-left hover:underline">
            {file.name}
          </button>
        }
        sub={<span className="@3xl:hidden">{kind} · {formatSize(file.size)} · {formatWhen(file.addedAt)}</span>}
      />
      <DataTableCell narrow="hide">{kind}</DataTableCell>
      <DataTableCell narrow="hide" mono>{formatSize(file.size)}</DataTableCell>
      <DataTableCell narrow="hide">{formatWhen(file.addedAt)}</DataTableCell>
      <DataTableCell label="Review" align="end"><ReviewBadge file={file} /></DataTableCell>
    </DataTableRow>
  );
}

/* -------------------------------------------------------------- Drawer */

function FileDrawer({ file, onClose }: { file: StoredFile | null; onClose: () => void }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const toast = useToast();

  // One object URL per file, revoked when the drawer moves on, so opening a
  // dozen files in a session doesn't pin a dozen blobs in memory.
  const url = React.useMemo(() => (file ? URL.createObjectURL(file.blob) : null), [file]);
  React.useEffect(() => {
    if (!url) return;
    return () => URL.revokeObjectURL(url);
  }, [url]);

  const can = file ? reviewability(file) : null;

  const review = async () => {
    if (!file || !can?.ok) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: contentType(file),
          name: file.name,
          label: KINDS.find((k) => k.value === file.kind)?.label ?? "document",
          mediaType: file.blob.type,
          data: await toBase64(file.blob),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(typeof payload?.error === "string" ? payload.error : "The review didn't come back. Try again.");
        return;
      }
      await setReview(file.id, { at: Date.now(), summary: payload.summary ?? "", findings: payload.findings ?? [] });
      toast({ message: payload.findings?.length ? "Review ready." : "Nothing to fix — it looks clean." });
    } catch {
      setError("Couldn't reach the reviewer. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={!!file}
      onClose={onClose}
      title={file?.name ?? ""}
      description={file ? `${formatSize(file.size)} · added ${formatWhen(file.addedAt)}` : undefined}
      icon={file ? <FileIcon file={file} /> : undefined}
      width={520}
      footer={
        file ? (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              loading={busy}
              disabled={!can?.ok}
              title={can?.ok ? undefined : can?.reason}
              onClick={review}
              className="flex-1"
            >
              <Sparkles /> {file.review ? "Review again" : "Check for mistakes"}
            </Button>
            {url ? (
              <Button onClick={() => window.open(url, "_blank", "noopener")}>
                <Download /> Open
              </Button>
            ) : null}
            <Button
              variant="danger"
              onClick={async () => {
                await removeFile(file.id);
                onClose();
                toast({ message: "File deleted." });
              }}
              aria-label="Delete file"
            >
              <Trash2 />
            </Button>
          </div>
        ) : null
      }
    >
      {file ? (
        <div className="flex flex-col gap-5">
          <div>
            <Label className="mb-2">Label</Label>
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <Chip key={k.value} active={file.kind === k.value} onClick={() => void setKind(file.id, k.value)}>
                  {k.label}
                </Chip>
              ))}
            </div>
          </div>

          {url && contentType(file) === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- a local blob: URL, nothing for the optimiser to do
            <img src={url} alt="" className="max-h-64 w-full rounded-2xl border bg-sunken object-contain" />
          ) : null}

          {error ? (
            <p className="rounded-2xl bg-bad-soft px-4 py-3 text-[13px] text-bad">{error}</p>
          ) : null}

          {!can?.ok ? <p className="text-[13px] text-ink-2">{can?.reason}</p> : null}

          {busy ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
            </div>
          ) : file.review ? (
            <ReviewResult review={file.review} />
          ) : (
            <p className="text-[13px] leading-relaxed text-ink-2">
              The reviewer reads the whole file and looks for contradictions, missing signatures and dates, expiry problems,
              unreadable scans and language mistakes. Reviewing sends this one file to the AI.
            </p>
          )}
        </div>
      ) : null}
    </Drawer>
  );
}

function ReviewResult({ review }: { review: { at: number; summary: string; findings: Finding[] } }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <p className="flex-1 text-[13px] leading-relaxed text-ink-2">{review.summary}</p>
        <span className="shrink-0 text-[12px] text-ink-3">{formatWhen(review.at)}</span>
      </div>

      {review.findings.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 rounded-2xl bg-good-soft px-4 py-3 text-[13px] text-good">
          <CheckCircle2 className="size-4 shrink-0" /> Nothing to fix.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {review.findings.map((f, i) => {
            const meta = SEVERITY[f.severity];
            const Icon = meta.icon;
            return (
              <li key={i}>
                <Inset>
                  <div className="flex items-start gap-2">
                    <Icon className={`mt-0.5 size-4 shrink-0 ${meta.ink}`} strokeWidth={1.75} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium leading-snug">{f.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{f.detail}</p>
                      {f.fix ? <p className="mt-1.5 text-[13px] leading-relaxed text-ink">→ {f.fix}</p> : null}
                    </div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                </Inset>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
