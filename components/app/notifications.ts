"use client";

import * as React from "react";
import { notices, type Notice } from "./data";

/*
 * Read state for the notification list, shared by the sidebar's quick view and
 * the Notifications page — mark something read in one and the other follows.
 * Same shape as the theme store: a module-level value, a subscriber set, and
 * useSyncExternalStore. Which ids have been read is kept in localStorage, so a
 * reload doesn't bring the badge back.
 */

const KEY = "su-notices-read";

const listeners = new Set<() => void>();

/** Null until the first client read: the server has no localStorage to consult. */
let read: Set<string> | null = null;
let snapshot: Notice[] = notices;

function build(ids: Set<string>): Notice[] {
  return notices.map((n) => (n.unread && ids.has(n.id) ? { ...n, unread: false } : n));
}

function ensure(): Set<string> {
  if (read) return read;
  let stored: string[] = [];
  try {
    stored = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {}
  read = new Set(Array.isArray(stored) ? stored : []);
  snapshot = build(read);
  return read;
}

function commit(ids: Set<string>) {
  snapshot = build(ids);
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {}
  listeners.forEach((l) => l());
}

export function markRead(id: string) {
  const ids = ensure();
  if (ids.has(id)) return;
  ids.add(id);
  commit(ids);
}

export function markAllRead() {
  const ids = ensure();
  const before = ids.size;
  for (const n of notices) ids.add(n.id);
  if (ids.size !== before) commit(ids);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  ensure();
  return snapshot;
}

/** Hydration reads the seed, then useSyncExternalStore swaps in what was stored. */
function getServerSnapshot() {
  return notices;
}

export function useNotices(): Notice[] {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
