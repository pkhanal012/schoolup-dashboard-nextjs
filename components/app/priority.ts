"use client";

import * as React from "react";
import { applications } from "./data";

/*
 * The order of the applications list, which the student sets themselves: first
 * row is the school they most want. Kept in localStorage per browser, in the
 * same shape as the theme and notification stores.
 *
 * Only ids are stored. Anything no longer in the data drops out on read, and
 * anything new joins the end, so the saved order can never hide an application.
 */

const KEY = "su-app-order";

const DEFAULT_ORDER = applications.map((a) => a.id);

const listeners = new Set<() => void>();

let order: string[] = DEFAULT_ORDER;
let loaded = false;

function reconcile(saved: unknown): string[] {
  if (!Array.isArray(saved)) return DEFAULT_ORDER;
  const known = saved.filter((id): id is string => typeof id === "string" && DEFAULT_ORDER.includes(id));
  const missing = DEFAULT_ORDER.filter((id) => !known.includes(id));
  return known.length ? [...known, ...missing] : DEFAULT_ORDER;
}

function ensure(): string[] {
  if (loaded) return order;
  loaded = true;
  try {
    order = reconcile(JSON.parse(localStorage.getItem(KEY) ?? "null"));
  } catch {}
  return order;
}

function commit(next: string[]) {
  order = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** The ids in priority order, highest first. */
export function useOrder(): string[] {
  return React.useSyncExternalStore(
    subscribe,
    () => ensure(),
    () => DEFAULT_ORDER,
  );
}

/** Drops `id` into the slot `target` currently occupies, shifting the rest. */
export function moveTo(id: string, target: string) {
  const current = ensure();
  if (id === target) return;
  const from = current.indexOf(id);
  const to = current.indexOf(target);
  if (from === -1 || to === -1) return;
  const next = [...current];
  next.splice(from, 1);
  next.splice(to, 0, id);
  commit(next);
}

/** One step up (-1) or down (+1); a no-op at either end. */
export function moveBy(id: string, delta: number) {
  const current = ensure();
  const from = current.indexOf(id);
  const to = from + delta;
  if (from === -1 || to < 0 || to >= current.length) return;
  const next = [...current];
  next.splice(from, 1);
  next.splice(to, 0, id);
  commit(next);
}

export function resetOrder() {
  commit(DEFAULT_ORDER);
}

export const isDefaultOrder = (current: string[]) => current.every((id, i) => id === DEFAULT_ORDER[i]);
