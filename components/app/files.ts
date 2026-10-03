"use client";

import * as React from "react";

/*
 * My files — the student's document locker.
 *
 * Everything lives in IndexedDB on this device: transcripts, passports and bank
 * letters are the most sensitive things a student owns, and this app has no
 * accounts or server storage to put them in. Nothing is uploaded anywhere until
 * the student asks for a review, and then only that one file is sent.
 */

export type FileKind = "transcript" | "passport" | "essay" | "cv" | "reference" | "test" | "finance" | "other";

export const KINDS: { value: FileKind; label: string }[] = [
  { value: "transcript", label: "Transcript" },
  { value: "passport", label: "Passport & ID" },
  { value: "essay", label: "Essay & statement" },
  { value: "cv", label: "CV" },
  { value: "reference", label: "Reference" },
  { value: "test", label: "Test score" },
  { value: "finance", label: "Financial" },
  { value: "other", label: "Other" },
];

export type Severity = "error" | "warning" | "note";

export type Finding = {
  severity: Severity;
  title: string;
  detail: string;
  /** What to actually do about it, where there is something to do. */
  fix?: string;
};

export type Review = { at: number; summary: string; findings: Finding[] };

export type StoredFile = {
  id: string;
  name: string;
  size: number;
  /** MIME type as the browser reported it; "" for files it couldn't place. */
  type: string;
  kind: FileKind;
  addedAt: number;
  blob: Blob;
  review?: Review;
};

/* ----------------------------------------------------------- IndexedDB */

const DB_NAME = "su-files";
const STORE = "files";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function run<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = work(tx.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

/* --------------------------------------------------------------- Store */

type State = { files: StoredFile[]; ready: boolean };

const EMPTY: State = { files: [], ready: false };

let state: State = EMPTY;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const byNewest = (a: StoredFile, b: StoredFile) => b.addedAt - a.addedAt;

function publish(files: StoredFile[]) {
  state = { files: [...files].sort(byNewest), ready: true };
  listeners.forEach((l) => l());
}

function load() {
  loading ??= run<StoredFile[]>("readonly", (s) => s.getAll())
    .then(publish)
    .catch(() => publish([])); // Private windows and blocked storage: an empty locker, not a broken page.
  return loading;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** The locker's contents. `ready` is false until IndexedDB has answered. */
export function useFiles(): State {
  React.useEffect(() => {
    void load();
  }, []);
  return React.useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
}

/* ------------------------------------------------------------ Mutations */

/** 25MB: comfortably more than a scanned transcript, short of filling the quota. */
export const MAX_SIZE = 25 * 1024 * 1024;

export function guessKind(name: string): FileKind {
  const n = name.toLowerCase();
  if (/transcript|marksheet|mark-sheet|grade|result/.test(n)) return "transcript";
  if (/passport|citizenship|national.?id|visa/.test(n)) return "passport";
  if (/\bsop\b|statement|essay|personal|motivation/.test(n)) return "essay";
  if (/\bcv\b|resume|curriculum/.test(n)) return "cv";
  if (/reference|recommend|\blor\b|letter/.test(n)) return "reference";
  if (/ielts|toefl|duolingo|\bgre\b|\bgmat\b|\bsat\b|score/.test(n)) return "test";
  if (/bank|financial|finance|affidavit|sponsor|fund|scholarship.?letter/.test(n)) return "finance";
  return "other";
}

export type AddResult = { added: number; rejected: { name: string; reason: string }[] };

export async function addFiles(incoming: File[]): Promise<AddResult> {
  await load();
  const rejected: AddResult["rejected"] = [];
  const added: StoredFile[] = [];

  for (const file of incoming) {
    if (file.size > MAX_SIZE) {
      rejected.push({ name: file.name, reason: "over 25MB" });
      continue;
    }
    if (file.size === 0) {
      rejected.push({ name: file.name, reason: "empty" });
      continue;
    }
    const record: StoredFile = {
      id: `f-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      kind: guessKind(file.name),
      addedAt: Date.now(),
      // Copying the bytes now keeps the record valid after the picked file moves or is deleted.
      blob: new Blob([await file.arrayBuffer()], { type: file.type || "application/octet-stream" }),
    };
    try {
      await run("readwrite", (s) => s.put(record));
      added.push(record);
    } catch {
      rejected.push({ name: file.name, reason: "couldn't be saved" });
    }
  }

  if (added.length) publish([...state.files, ...added]);
  return { added: added.length, rejected };
}

async function update(id: string, change: (f: StoredFile) => StoredFile) {
  const current = state.files.find((f) => f.id === id);
  if (!current) return;
  const next = change(current);
  await run("readwrite", (s) => s.put(next));
  publish(state.files.map((f) => (f.id === id ? next : f)));
}

export const renameFile = (id: string, name: string) => update(id, (f) => ({ ...f, name }));
export const setKind = (id: string, kind: FileKind) => update(id, (f) => ({ ...f, kind }));
export const setReview = (id: string, review: Review) => update(id, (f) => ({ ...f, review }));

export async function removeFile(id: string) {
  await run("readwrite", (s) => s.delete(id));
  publish(state.files.filter((f) => f.id !== id));
}

/* -------------------------------------------------------------- Helpers */

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatWhen(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const IMAGE = /^image\/(png|jpeg|jpg|webp|gif)$/;
const TEXTUAL = /^(text\/|application\/(json|xml|rtf))/;

/** What the reviewer can actually read. Everything else needs converting first. */
export function reviewability(file: StoredFile): { ok: true } | { ok: false; reason: string } {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const isText = TEXTUAL.test(file.type) || /\.(txt|md|csv|json)$/i.test(file.name);
  if (!isPdf && !IMAGE.test(file.type) && !isText) {
    return { ok: false, reason: "The reviewer reads PDFs, images and text files. Export this one as PDF first." };
  }
  // The API takes base64, which inflates by a third; keep well inside its limits.
  if (file.size > 10 * 1024 * 1024) return { ok: false, reason: "Too large to review — 10MB is the limit." };
  return { ok: true };
}

export function contentType(file: StoredFile): "pdf" | "image" | "text" {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (IMAGE.test(file.type)) return "image";
  return "text";
}

/** Base64 for the API route, without blowing the stack on a large file. */
export async function toBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
