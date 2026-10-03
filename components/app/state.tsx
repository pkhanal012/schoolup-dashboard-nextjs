"use client";

import * as React from "react";

/**
 * Demo state. A real build reads these from the API; here one switch lets you
 * walk every screen through its three states: first run (empty), loading, and
 * a student mid-application.
 */
export type Mode = "new" | "loading" | "active";

const Ctx = React.createContext<{ mode: Mode; setMode: (m: Mode) => void }>({ mode: "active", setMode: () => {} });
export const useMode = () => React.useContext(Ctx);

/**
 * The sidebar's "New" menu asks a page to open its create flow. The request
 * lives above the pages so it survives the navigation to get there, and also
 * fires when you are already on that page.
 */
export type NewKind = "document" | "block" | "drill";

const NewCtx = React.createContext<{ pending: NewKind | null; request: (k: NewKind) => void; clear: () => void }>({
  pending: null,
  request: () => {},
  clear: () => {},
});
export const useRequestNew = () => React.useContext(NewCtx).request;

export function useNewRequest(kind: NewKind, setOpen: (open: boolean) => void) {
  const { pending, clear } = React.useContext(NewCtx);
  React.useEffect(() => {
    if (pending !== kind) return;
    setOpen(true);
    clear();
  }, [pending, kind, setOpen, clear]);
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<Mode>("active");
  const [pending, setPending] = React.useState<NewKind | null>(null);
  const clear = React.useCallback(() => setPending(null), []);
  const newValue = React.useMemo(() => ({ pending, request: setPending, clear }), [pending, clear]);
  return (
    <Ctx.Provider value={{ mode, setMode }}>
      <NewCtx.Provider value={newValue}>{children}</NewCtx.Provider>
    </Ctx.Provider>
  );
}
