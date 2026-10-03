"use client";

import * as React from "react";
import Link from "next/link";
import { Extension, useEditorState, type Editor } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { ArrowUp, Copy, Info, Pencil, Repeat2, RotateCcw, Shrink, Sparkles, SpellCheck, WandSparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Spinner, useToast } from "@/components/ui/kit";

/* ------------------------------------------------------------ Highlight
   While the panel is open the cursor sits in the prompt box, so the browser's
   own selection highlight disappears. This keeps the passage marked, and maps
   the range through edits so "Replace" still lands in the right place. */

type Range = { from: number; to: number };
const assistKey = new PluginKey<Range | null>("assistTarget");

export const AssistHighlight = Extension.create({
  name: "assistHighlight",
  addProseMirrorPlugins() {
    return [
      new Plugin<Range | null>({
        key: assistKey,
        state: {
          init: () => null,
          apply(tr, value) {
            const meta = tr.getMeta(assistKey) as Range | null | undefined;
            if (meta !== undefined) return meta;
            if (!value) return null;
            const from = tr.mapping.map(value.from, 1);
            const to = tr.mapping.map(value.to, -1);
            return from < to ? { from, to } : null;
          },
        },
        props: {
          decorations(state) {
            const r = assistKey.getState(state);
            return r ? DecorationSet.create(state.doc, [Decoration.inline(r.from, r.to, { class: "assist-target" })]) : null;
          },
        },
      }),
    ];
  },
});

/* ------------------------------------------------ Opening from elsewhere
   The coach panel can hand a paragraph to the assistant with an instruction
   already written ("Split this sentence…"). It dispatches this event on the
   editor's DOM node; the layer below picks it up. */

type AssistRequest = { from: number; to: number; label: string; instruction: string };
const ASSIST_EVENT = "schoolup:assist";

export function requestAssist(editor: Editor, request: AssistRequest) {
  editor.view.dom.dispatchEvent(new CustomEvent<AssistRequest>(ASSIST_EVENT, { detail: request }));
}

/* -------------------------------------------------------------- Actions */

type Action = "custom" | "simplify" | "rephrase" | "shorten" | "grammar";

const PRESETS: { id: Exclude<Action, "custom">; label: string; icon: React.ElementType }[] = [
  { id: "simplify", label: "Simplify", icon: WandSparkles },
  { id: "rephrase", label: "Rephrase", icon: Repeat2 },
  { id: "shorten", label: "Shorten", icon: Shrink },
  { id: "grammar", label: "Fix grammar", icon: SpellCheck },
];

type Turn = {
  id: number;
  action: Action;
  label: string;
  instruction?: string;
  text: string;
  status: "streaming" | "done" | "error";
  error?: string;
};

type Session = Range & { selection: string; context: string };

/* A per-browser daily allowance, shown like the plan's other limits. Real
   enforcement belongs on the server once there are accounts. */
const DAILY = 30;
function allowanceKey() {
  return `su-assist:${new Date().toISOString().slice(0, 10)}`;
}
function readUsed() {
  try {
    return Number(localStorage.getItem(allowanceKey()) ?? 0);
  } catch {
    return 0;
  }
}

function Tip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11.5px] font-medium text-surface opacity-0 shadow-e2 transition-opacity delay-150 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}

export function AssistLayer({
  editor,
  docType,
  container,
}: {
  editor: Editor;
  docType: string;
  /** The positioned box the toolbar and panel are placed in (the writing column). */
  container: HTMLElement | null;
}) {
  const toast = useToast();
  const [session, setSession] = React.useState<Session | null>(null);
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [used, setUsed] = React.useState(readUsed);
  const [, setLayoutTick] = React.useState(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const seq = React.useRef(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const sel = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ from: e.state.selection.from, to: e.state.selection.to, focused: e.isFocused }),
  });
  const left = Math.max(0, DAILY - used);
  const busy = turns.some((t) => t.status === "streaming");

  // Positions come from the editor; re-read them when the layout moves under us.
  React.useEffect(() => {
    const onResize = () => setLayoutTick((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const close = React.useCallback(() => {
    abortRef.current?.abort();
    setSession(null);
    setTurns([]);
    setPrompt("");
    if (!editor.isDestroyed) editor.view.dispatch(editor.state.tr.setMeta(assistKey, null));
  }, [editor]);

  // Escape closes; so does pressing anywhere outside the panel.
  React.useEffect(() => {
    if (!session) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [session, close]);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  // Requests from the coach panel. The listener is attached once; it calls the latest `open`.
  const openRef = React.useRef(open);
  React.useEffect(() => {
    openRef.current = open;
  });
  React.useEffect(() => {
    const dom = editor.view.dom;
    const onRequest = (e: Event) => {
      const { from, to, label, instruction } = (e as CustomEvent<AssistRequest>).detail;
      openRef.current("custom", { from, to }, { label, instruction });
    };
    dom.addEventListener(ASSIST_EVENT, onRequest);
    return () => dom.removeEventListener(ASSIST_EVENT, onRequest);
  }, [editor]);

  const update = (id: number, fn: (t: Turn) => Turn) => setTurns((all) => all.map((t) => (t.id === id ? fn(t) : t)));

  async function run(s: Session, action: Action, label: string, instruction?: string) {
    if (left <= 0) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const id = ++seq.current;
    setTurns((all) => [...all, { id, action, label, instruction, text: "", status: "streaming" }]);

    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, instruction, selection: s.selection, context: s.context, docType }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Couldn't reach the assistant.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          const event = JSON.parse(line) as { t: "delta" | "done" | "error"; text?: string; message?: string };
          if (event.t === "delta") update(id, (t) => ({ ...t, text: t.text + (event.text ?? "") }));
          if (event.t === "done") {
            finished = true;
            update(id, (t) => ({ ...t, status: "done" }));
            // Only suggestions that arrive count against the allowance; failures are free.
            const nextUsed = readUsed() + 1;
            try {
              localStorage.setItem(allowanceKey(), String(nextUsed));
            } catch {}
            setUsed(nextUsed);
          }
          if (event.t === "error") {
            finished = true;
            // A stopped rewrite is incomplete by definition — never offer half of one.
            update(id, (t) => ({ ...t, status: "error", text: "", error: event.message }));
          }
        }
      }
      if (!finished) update(id, (t) => ({ ...t, status: "error", text: "", error: "The connection dropped. Try again." }));
    } catch (err) {
      if (ac.signal.aborted) return;
      update(id, (t) => ({ ...t, status: "error", text: "", error: err instanceof Error ? err.message : "Something went wrong." }));
    }
  }

  function open(action: Action, range?: Range, ask?: { label: string; instruction: string }) {
    const { from, to } = range ?? editor.state.selection;
    if (from === to) return;
    const doc = editor.state.doc;
    const selection = doc.textBetween(from, to, "\n\n");
    // The whole top-level blocks around the selection, so the rewrite fits its paragraph.
    const $from = doc.resolve(from);
    const $to = doc.resolve(to);
    const context = doc.textBetween($from.before(1), $to.after(1), "\n\n").slice(0, 4000);
    const s: Session = { from, to, selection, context };
    editor.view.dispatch(editor.state.tr.setMeta(assistKey, { from, to }));
    setSession(s);
    setTurns([]);
    setPrompt("");
    if (ask) {
      void run(s, "custom", ask.label, ask.instruction);
    } else if (action === "custom") {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      const preset = PRESETS.find((p) => p.id === action)!;
      void run(s, action, preset.label);
    }
  }

  function submitPrompt() {
    const text = prompt.trim();
    if (!session || !text || busy) return;
    setPrompt("");
    void run(session, "custom", text, text);
  }

  function replace(text: string) {
    const range = assistKey.getState(editor.state);
    if (!range) return;
    const paragraphs = text.trim().split(/\n{2,}/).map((p) => p.replace(/\s*\n\s*/g, " "));
    // One paragraph goes in as text, so it joins the sentence around it; more become paragraphs.
    const content =
      paragraphs.length === 1
        ? { type: "text", text: paragraphs[0] }
        : paragraphs.map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] }));
    editor.chain().focus().insertContentAt(range, content).run();
    close();
    toast({ message: "Replaced. Press ⌘Z to undo." });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast({ message: "Copied" });
    } catch {
      toast({ message: "Couldn't copy — select the text and copy it instead." });
    }
  }

  /* ------------------------------------------------------- Positioning */
  const place = (pos: number) => {
    if (!container || editor.isDestroyed) return null;
    try {
      const c = editor.view.coordsAtPos(pos);
      const box = container.getBoundingClientRect();
      return {
        top: c.top - box.top,
        bottom: c.bottom - box.top,
        left: c.left - box.left,
        width: box.width,
        height: box.height,
        viewportTop: c.top,
        viewportBottom: c.bottom,
      };
    } catch {
      return null;
    }
  };

  const showToolbar = !session && sel.focused && sel.to > sel.from;
  const toolbarAt = showToolbar ? place(sel.from) : null;
  const target = session ? (assistKey.getState(editor.state) ?? session) : null;
  const panelStart = target ? place(target.from) : null;
  const panelEnd = target ? place(target.to) : null;
  const PANEL_W = 440;
  // Open below the passage; if that side is tight and there is more room above
  // (under the sticky editor bar), open above. Either way, cap the height to the
  // space available so the panel never runs off screen — it scrolls inside.
  const EDITOR_BAR = 120;
  const spaceBelow = panelEnd ? window.innerHeight - panelEnd.viewportBottom - 26 : 0;
  const spaceAbove = panelStart ? panelStart.viewportTop - 26 - EDITOR_BAR : 0;
  const flipUp = spaceBelow < 260 && spaceAbove > spaceBelow;
  const panelMaxH = Math.max(200, Math.min(480, flipUp ? spaceAbove : spaceBelow));

  const latest = turns[turns.length - 1];

  return (
    <>
      {toolbarAt ? (
        <div
          role="toolbar"
          aria-label="Writing assistant"
          // Keep the selection: pressing a button must not move focus out of the editor.
          onMouseDown={(e) => e.preventDefault()}
          style={{ top: Math.max(0, toolbarAt.top - 48), left: Math.min(Math.max(0, toolbarAt.left - 8), Math.max(0, toolbarAt.width - 300)) }}
          className="su-pop absolute z-20 flex items-center gap-0.5 rounded-full border bg-surface p-1 shadow-e3"
        >
          <button
            type="button"
            onClick={() => open("custom")}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary-soft px-3 text-[12.5px] font-medium text-accent transition-colors hover:bg-primary-soft/70"
          >
            <Pencil className="size-3.5" /> Ask AI
          </button>
          {PRESETS.map((p) => (
            <Tip key={p.id} label={p.label}>
              <button
                type="button"
                aria-label={p.label}
                onClick={() => open(p.id)}
                className="grid size-8 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink"
              >
                <p.icon className="size-4" />
              </button>
            </Tip>
          ))}
        </div>
      ) : null}

      {session && panelStart && panelEnd ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Writing assistant"
          style={{
            ...(flipUp ? { bottom: panelStart.height - panelStart.top + 10 } : { top: panelEnd.bottom + 10 }),
            left: Math.min(Math.max(0, panelStart.left - 12), Math.max(0, panelStart.width - PANEL_W)),
            width: Math.min(PANEL_W, panelStart.width),
            maxHeight: panelMaxH,
          }}
          className="su-pop absolute z-20 flex flex-col overflow-hidden rounded-card border bg-surface shadow-e4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitPrompt();
            }}
            className="flex items-center gap-2 border-b border-line-soft p-2.5"
          >
            <Sparkles className="ml-1 size-4 shrink-0 text-accent" />
            <input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={left > 0 ? "Tell the assistant what to change…" : "No suggestions left today"}
              disabled={left <= 0}
              maxLength={300}
              aria-label="Instruction for the selected text"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] placeholder:text-ink-3 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || busy || left <= 0}
              aria-label="Send"
              className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-ink transition-colors hover:bg-primary-hover disabled:bg-sunken disabled:text-ink-4"
            >
              <ArrowUp className="size-4" />
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid size-8 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-hover hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </form>

          <div className="thin-scrollbar flex-1 overflow-y-auto p-2.5" aria-live="polite">
            {turns.length === 0 ? (
              <div className="flex flex-wrap gap-1.5 p-1">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={left <= 0}
                    onClick={() => void run(session, p.id, p.label)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border bg-surface px-2.5 text-[12.5px] text-ink-2 transition-colors hover:border-line-strong hover:bg-hover hover:text-ink disabled:opacity-40"
                  >
                    <p.icon className="size-3.5" /> {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <ol className="flex flex-col gap-2">
                {turns.map((t) => {
                  const isLatest = t.id === latest?.id;
                  return (
                    <li key={t.id} className="flex flex-col gap-1.5">
                      <p className="flex items-start gap-2 px-1.5 pt-1 text-[12.5px] text-ink-3">
                        <Pencil className="mt-0.5 size-3.5 shrink-0" /> {t.label}
                      </p>
                      <div className={cn("rounded-lg p-3", isLatest ? "bg-primary-soft/60" : "bg-sunken")}>
                        <div className="flex items-start gap-2.5">
                          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-primary-ink">
                            <Sparkles className="size-3.5" />
                          </span>
                          {t.status === "error" ? (
                            <p className="pt-0.5 text-[13px] leading-relaxed text-bad">{t.error}</p>
                          ) : t.text ? (
                            <p className="whitespace-pre-wrap pt-0.5 font-serif text-[14.5px] leading-relaxed text-ink">
                              {t.text}
                              {t.status === "streaming" ? <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-accent align-middle" /> : null}
                            </p>
                          ) : (
                            <p className="flex items-center gap-2 pt-0.5 text-[13px] text-ink-3">
                              <Spinner /> Thinking…
                            </p>
                          )}
                        </div>
                        {isLatest && t.status !== "streaming" ? (
                          <div className="mt-3 flex items-center justify-end gap-1.5">
                            {t.status === "done" ? (
                              <Button size="sm" aria-label="Copy" className="px-2" onClick={() => void copy(t.text)}>
                                <Copy />
                              </Button>
                            ) : null}
                            <Button size="sm" disabled={left <= 0} onClick={() => void run(session, t.action, t.label, t.instruction)}>
                              <RotateCcw /> Try again
                            </Button>
                            {t.status === "done" ? (
                              <Button size="sm" variant="primary" onClick={() => replace(t.text)}>
                                Replace
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line-soft px-3.5 py-2.5 text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-1.5">
              {left} of {DAILY} suggestions left today
              <span title="Suggestions only rewrite text you selected. Check every change — your statement must stay your own." className="inline-flex">
                <Info className="size-3.5" />
              </span>
            </span>
            <Link href="/settings" className="font-medium text-accent hover:underline">
              Upgrade
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
