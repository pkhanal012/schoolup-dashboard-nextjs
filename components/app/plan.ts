"use client";

import * as React from "react";

/*
 * The study plan the student builds in /signup: their name and four answers.
 * Same store shape as the theme and notification stores; kept per
 * browser until there are accounts to hang it on.
 */

export type Plan = {
  /** What the student asked to be called — /signup asks first. */
  name: string;
  /** Countries, as they appear in a school's `place`. */
  destinations: string[];
  level: string;
  field: string;
  intake: string;
};

export const EMPTY_PLAN: Plan = { name: "", destinations: [], level: "", field: "", intake: "" };

const KEY = "su-plan";

const listeners = new Set<() => void>();

let plan: Plan = EMPTY_PLAN;
let loaded = false;

function ensure(): Plan {
  if (loaded) return plan;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved && typeof saved === "object") {
      const str = (v: unknown) => (typeof v === "string" ? v : "");
      plan = {
        name: str(saved.name),
        destinations: Array.isArray(saved.destinations) ? saved.destinations : [],
        level: str(saved.level),
        field: str(saved.field),
        intake: str(saved.intake),
      };
    }
  } catch {}
  return plan;
}

function commit(next: Plan) {
  plan = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

export function setAnswer<K extends keyof Plan>(key: K, value: Plan[K]) {
  commit({ ...ensure(), [key]: value });
}

/** Adds or removes one destination — the only question that takes several answers. */
export function toggleDestination(country: string) {
  const current = ensure();
  const next = current.destinations.includes(country)
    ? current.destinations.filter((c) => c !== country)
    : [...current.destinations, country];
  commit({ ...current, destinations: next });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function usePlan(): Plan {
  return React.useSyncExternalStore(
    subscribe,
    () => ensure(),
    () => EMPTY_PLAN,
  );
}

/** One line for the plan, in the shape the rest of the app prints it. */
export function planSummary(p: Plan): string {
  return [p.field, p.level, p.destinations.join(", "), p.intake].filter(Boolean).join(" · ");
}
