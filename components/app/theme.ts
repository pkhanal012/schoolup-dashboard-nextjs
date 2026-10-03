"use client";

import * as React from "react";

/*
 * Three themes:
 *   default — dark sidebar and top bar around a white content sheet
 *   light   — the landing page look: warm, dotted paper around a white sheet
 *   dark    — everything dark
 *
 * The theme is a class on <html> (`dark` or `theme-default`, none for light),
 * written by an inline script in the root layout before first paint, so
 * nothing flashes. CSS does the rest — see the token blocks in globals.css.
 */

export type Theme = "default" | "light" | "dark";

export const THEMES: { value: Theme; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const listeners = new Set<() => void>();

export function setTheme(theme: Theme) {
  const classes = document.documentElement.classList;
  classes.toggle("dark", theme === "dark");
  classes.toggle("theme-default", theme === "default");
  try {
    localStorage.setItem("su-theme", theme);
  } catch {}
  listeners.forEach((l) => l());
}

function read(): Theme {
  const classes = document.documentElement.classList;
  if (classes.contains("dark")) return "dark";
  return classes.contains("theme-default") ? "default" : "light";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** The active theme, for controls that show it (a check mark, a pressed segment). */
export function useTheme(): Theme {
  return React.useSyncExternalStore(subscribe, read, () => "default");
}
