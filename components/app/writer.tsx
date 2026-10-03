"use client";

import * as React from "react";
import Link from "next/link";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
  AArrowDown,
  AArrowUp,
  ArrowLeft,
  Bold,
  Check,
  ChevronDown,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  Pilcrow,
  ScanSearch,
  Quote,
  Redo2,

  Sparkles,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Button, Dropdown, DropdownItem, Meter, useToast } from "@/components/ui/kit";
import type { Doc } from "./data";
import { AssistHighlight, AssistLayer, requestAssist } from "./assist";
import { CoachReview, coachReviewKey, getActiveFinding, getFindings, type Finding } from "./coach-review";
import { COACH_CHECKS, COACH_QUESTIONS, DOC_TYPES, SEED_BODY, TYPE_TARGET, loadDraft, saveDraft, type Draft } from "./drafts";

const STATE_TONE = { Draft: "neutral", "In review": "accent", Final: "good" } as const;
const STAGES: Doc["state"][] = ["Draft", "In review", "Final"];

function fitHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function Tool({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Keep the editor's selection: the toolbar should act on it, not steal focus.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-md text-ink-2 transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4",
        active && "bg-active text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-[var(--line)]" aria-hidden />;
}

/* Reading size for the whole writing surface (headings scale with it). A view
   preference, remembered per browser — it doesn't change the draft itself. */
const TEXT_SIZES = [16, 18, 20, 22];
const SIZE_KEY = "su-writer-size";

function readSize() {
  try {
    const saved = Number(localStorage.getItem(SIZE_KEY));
    return TEXT_SIZES.includes(saved) ? saved : 18;
  } catch {
    return 18;
  }
}

function TextSize({ size, onStep }: { size: number; onStep: (step: -1 | 1) => void }) {
  const i = TEXT_SIZES.indexOf(size);
  return (
    <div role="group" aria-label="Text size" className="flex items-center gap-0.5">
      <Tool label="Smaller text" disabled={i <= 0} onClick={() => onStep(-1)}><AArrowDown /></Tool>
      <span className="w-7 text-center font-mono text-[11.5px] tabular-nums text-ink-2" title="Text size" aria-live="polite">
        {size}
      </span>
      <Tool label="Larger text" disabled={i >= TEXT_SIZES.length - 1} onClick={() => onStep(1)}><AArrowUp /></Tool>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      paragraph: e.isActive("paragraph"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const run = () => editor.chain().focus();

  return (
    <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5">
      <Tool label="Undo" shortcut="⌘Z" disabled={!s.canUndo} onClick={() => run().undo().run()}><Undo2 /></Tool>
      <Tool label="Redo" shortcut="⇧⌘Z" disabled={!s.canRedo} onClick={() => run().redo().run()}><Redo2 /></Tool>
      <Sep />
      <Tool label="Body text" active={s.paragraph} onClick={() => run().setParagraph().run()}><Pilcrow /></Tool>
      <Tool label="Heading" active={s.h2} onClick={() => run().toggleHeading({ level: 2 }).run()}><Heading2 /></Tool>
      <Tool label="Subheading" active={s.h3} onClick={() => run().toggleHeading({ level: 3 }).run()}><Heading3 /></Tool>
      <Sep />
      <Tool label="Bold" shortcut="⌘B" active={s.bold} onClick={() => run().toggleBold().run()}><Bold /></Tool>
      <Tool label="Italic" shortcut="⌘I" active={s.italic} onClick={() => run().toggleItalic().run()}><Italic /></Tool>
      <Tool label="Underline" shortcut="⌘U" active={s.underline} onClick={() => run().toggleUnderline().run()}><Underline /></Tool>
      <Sep />
      <Tool label="Bulleted list" active={s.bullet} onClick={() => run().toggleBulletList().run()}><List /></Tool>
      <Tool label="Numbered list" active={s.ordered} onClick={() => run().toggleOrderedList().run()}><ListOrdered /></Tool>
      <Tool label="Quote" active={s.quote} onClick={() => run().toggleBlockquote().run()}><Quote /></Tool>
    </div>
  );
}

function Suggestions({ editor }: { editor: Editor }) {
  const { findings, active } = useEditorState({
    editor,
    selector: ({ editor: e }) => ({ findings: getFindings(e.state), active: getActiveFinding(e.state) }),
  });
  const setActive = (id: string | null) => {
    if (getActiveFinding(editor.state) !== id) editor.view.dispatch(editor.state.tr.setMeta(coachReviewKey, { active: id }));
  };
  const show = (f: Finding) => editor.chain().focus().setTextSelection({ from: f.from, to: f.to }).scrollIntoView().run();
  const dismiss = (f: Finding) => editor.view.dispatch(editor.state.tr.setMeta(coachReviewKey, { dismiss: f.key, active: null }));

  return (
    <section>
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium">
        <ScanSearch className="size-3.5 text-warn" /> Suggestions
        <span className="font-normal text-ink-3">· {findings.length === 0 ? "none right now" : `${findings.length} to look at`}</span>
      </p>
      {findings.length === 0 ? (
        <p className="mt-2 text-[12px] leading-relaxed text-ink-3">
          The coach reads as you write and marks paragraphs with clichés, long sentences, vague words or empty sections.
        </p>
      ) : (
        <ul className="mt-2.5 flex flex-col gap-2" onMouseLeave={() => setActive(null)}>
          {findings.map((f) => (
            <li
              key={f.id}
              onMouseEnter={() => setActive(f.id)}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                f.id === active ? "border-[color-mix(in_oklab,var(--warn)_45%,transparent)] bg-warn-soft" : "bg-surface",
              )}
            >
              <div className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warn" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium leading-snug">{f.title}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-2">{f.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(f)}
                  aria-label={`Dismiss: ${f.title}`}
                  title="Dismiss"
                  className="-mr-1 -mt-1 grid size-6 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-hover hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5 pl-3.5">
                <Button size="sm" onClick={() => show(f)}>Show</Button>
                {f.instruction ? (
                  <Button
                    size="sm"
                    onClick={() => requestAssist(editor, { from: f.from, to: f.to, label: f.title, instruction: f.instruction! })}
                  >
                    <Sparkles /> Improve with AI
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CoachPanel({ editor, type, target, words }: { editor: Editor | null; type: Doc["type"]; target: number; words: number }) {
  const questions = COACH_QUESTIONS[type];
  const [q, setQ] = React.useState(0);
  const over = words > target;
  const checks = [
    ...COACH_CHECKS[type],
    { label: `Within the ${target.toLocaleString()}-word limit`, ok: words > 0 && !over },
  ];
  const done = checks.filter((c) => c.ok).length;

  return (
    <div className="flex flex-col gap-6 px-5 pb-5 pt-3">

      {editor ? <Suggestions editor={editor} /> : null}

      <section className="rounded-card bg-sunken p-4">
        <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-3">
          <Sparkles className="size-3.5" /> The coach asks
        </p>
        <p className="mt-2 text-[14px] font-medium leading-relaxed">{questions[q]}</p>
        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={() => setQ((i) => (i + 1) % questions.length)}>Next question</Button>
          <span className="font-mono text-[11.5px] tabular-nums text-ink-3">{q + 1}/{questions.length}</span>
        </div>
        <p className="mt-3 border-t pt-3 text-[11.5px] leading-relaxed text-ink-3">
          Answer it in your own words. Select any text to ask for a rewrite — nothing changes until you choose Replace.
        </p>
      </section>

      <section>
        <p className="text-[12.5px] font-medium">
          Checklist <span className="font-normal text-ink-3">· {done} of {checks.length} done</span>
        </p>
        <ul className="mt-2.5 flex flex-col gap-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2 text-[12.5px] leading-snug">
              <span className={cn("mt-px grid size-4 shrink-0 place-items-center rounded-full", c.ok ? "bg-good-soft text-good" : "bg-sunken text-ink-3")}>
                {c.ok ? <Check className="size-3" strokeWidth={3} /> : <X className="size-3" strokeWidth={3} />}
              </span>
              <span className={c.ok ? "text-ink-2" : "text-ink"}>{c.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function Writer({ draft }: { draft: Draft }) {
  const toast = useToast();
  // Read once, on first render. This component is client-only, so storage is available.
  const [initial] = React.useState(() => loadDraft(draft.id));
  const [title, setTitle] = React.useState(initial?.title ?? draft.title);
  const [type, setType] = React.useState<Doc["type"]>(initial?.type ?? draft.type);
  const [forWhom, setForWhom] = React.useState(initial?.forWhom ?? draft.forWhom);
  const [stage, setStage] = React.useState<Doc["state"]>(initial?.state ?? draft.state);
  const [saveState, setSaveState] = React.useState<"saved" | "saving" | "unsaved">("saved");
  const [coachOpen, setCoachOpen] = React.useState(true);
  const [words, setWords] = React.useState(0);
  // Shown on the "Coach" button when the panel is hidden. Tracked from editor events
  // (like the word count): reading it via useEditorState went stale while the editor mounted.
  const [suggestionCount, setSuggestionCount] = React.useState(0);
  const [column, setColumn] = React.useState<HTMLElement | null>(null);
  const [textSize, setTextSize] = React.useState(readSize);
  const [full, setFull] = React.useState(false);
  const bodyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = TYPE_TARGET[type];

  /** Name, type, audience and stage save straight away; they are small and deliberate. */
  const saveMeta = (patch: Parameters<typeof saveDraft>[1]) => setSaveState(saveDraft(draft.id, patch) ? "saved" : "unsaved");

  const editor = useEditor({
    // Created after mount. Rendering it during the first render left React's dev
    // double-mount holding a torn-down instance, whose state never updated.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === "heading" ? "Heading" : "Start with the question the coach is asking →"),
      }),
      CharacterCount,
      AssistHighlight,
      CoachReview,
    ],
    content: initial?.html ?? SEED_BODY[draft.id] ?? "",
    editorProps: { attributes: { "aria-label": `${draft.type} body`, spellcheck: "true" } },
    onCreate: ({ editor: e }) => {
      setWords(e.storage.characterCount.words());
      setSuggestionCount(getFindings(e.state).length);
    },
    // Every transaction, not just edits: dismissing a suggestion changes the count too.
    onTransaction: ({ editor: e }) => setSuggestionCount(getFindings(e.state).length),
    onUpdate: ({ editor: e }) => {
      setWords(e.storage.characterCount.words());
      // The body saves after a pause in typing, from the editor handed in (never a stale one).
      setSaveState("saving");
      if (bodyTimer.current) clearTimeout(bodyTimer.current);
      bodyTimer.current = setTimeout(() => {
        if (!e.isDestroyed) setSaveState(saveDraft(draft.id, { html: e.getHTML() }) ? "saved" : "unsaved");
      }, 700);
    },
  });

  React.useEffect(() => () => {
    if (bodyTimer.current) clearTimeout(bodyTimer.current);
  }, []);

  // Steps from the latest value, so quick repeated clicks each count.
  const stepTextSize = (step: -1 | 1) =>
    setTextSize((current) => {
      const i = Math.min(Math.max(TEXT_SIZES.indexOf(current) + step, 0), TEXT_SIZES.length - 1);
      try {
        localStorage.setItem(SIZE_KEY, String(TEXT_SIZES[i]));
      } catch {}
      return TEXT_SIZES[i];
    });

  /* Full screen: the editor covers the whole window (sidebar and all), and the
     browser is asked for real full screen too. The whole document goes full
     screen rather than just the editor, so toasts and menus stay visible. If the
     browser declines (e.g. iOS Safari), the in-window cover still works. */
  const toggleFull = () => {
    if (!full) {
      setFull(true);
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      setFull(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  };

  // Esc (or the browser's own control) leaves real full screen; follow it out.
  React.useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  const rename = (value: string) => {
    const next = value.replace(/\n/g, " ");
    setTitle(next);
    saveMeta({ title: next });
  };

  const changeStage = (next: Doc["state"]) => {
    setStage(next);
    saveMeta({ state: next });
  };

  const sendForReview = () => {
    changeStage("In review");
    toast({ message: "Sent to a reviewer — expect notes within a day." });
  };

  return (
    <div className={cn("flex min-h-full flex-col", full && "thin-scrollbar fixed inset-0 z-50 overflow-y-auto bg-surface")}>
      {/* Sticky under the mobile app bar (h-14); flush to the top of the panel on desktop and in full screen. */}
      <header className={cn("sticky z-10 border-b border-line-soft bg-surface/90 backdrop-blur-xl", full ? "top-0" : "top-14 lg:top-0")}>
        <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
          <Link
            href="/documents"
            aria-label="Back to Writing coach"
            title="Back to Writing coach"
            className="grid size-8 shrink-0 place-items-center rounded-md text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            {/* The draft's name, editable here too — it is the name the Writing coach list shows. */}
            <input
              value={title}
              onChange={(e) => rename(e.target.value)}
              placeholder="Untitled"
              aria-label="Draft name"
              title="Rename"
              className="-mx-1.5 block w-full min-w-0 truncate rounded-md bg-transparent px-1.5 text-[13px] font-medium transition-colors placeholder:text-ink-4 hover:bg-hover focus:bg-hover focus:outline-none"
            />
            <p className="truncate text-[11.5px] text-ink-3" aria-live="polite">
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved in this browser" : "Couldn't save — storage is blocked"}
            </p>
          </div>
          <Dropdown
            align="end"
            width={180}
            label={`Stage: ${stage}. Change stage`}
            className="hidden sm:block"
            triggerClassName="rounded-full"
            trigger={
              <Badge tone={STATE_TONE[stage]} className="cursor-pointer gap-0.5 pr-1.5">
                {stage} <ChevronDown className="size-3" />
              </Badge>
            }
          >
            {STAGES.map((s) => (
              <DropdownItem key={s} onClick={() => changeStage(s)}>
                <Check className={cn(s === stage ? "opacity-100" : "opacity-0")} /> {s}
              </DropdownItem>
            ))}
          </Dropdown>
          <button
            type="button"
            onClick={toggleFull}
            aria-pressed={full}
            aria-label={full ? "Exit full screen" : "Full screen"}
            title={full ? "Exit full screen (Esc)" : "Full screen"}
            className="grid size-8 shrink-0 place-items-center rounded-md text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          >
            {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
          <Button size="sm" variant="primary" onClick={sendForReview}>
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto border-t border-line-soft px-3 py-1.5 no-scrollbar sm:px-5">
          {editor ? <Toolbar editor={editor} /> : null}
          <Sep />
          <TextSize size={textSize} onStep={stepTextSize} />
          <span className="ml-auto shrink-0 font-mono text-[11.5px] tabular-nums text-ink-3">
            {words.toLocaleString()} / {target.toLocaleString()} words
          </span>
          {/* Hidden coach reopens from the same corner it closed from. Desktop only:
              on small screens the coach sits below the draft and is always there. */}
          {!coachOpen ? (
            <button
              type="button"
              onClick={() => setCoachOpen(true)}
              title="Show the coach"
              className="hidden h-8 shrink-0 items-center gap-1.5 rounded-md border bg-surface px-2.5 text-[12.5px] font-medium text-ink-2 shadow-e1 transition-colors hover:border-line-strong hover:bg-hover hover:text-ink lg:inline-flex"
            >
              <PanelRightOpen className="size-4" /> Coach
              {suggestionCount > 0 ? (
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-warn-soft px-1 font-mono text-[11px] tabular-nums text-warn">
                  {suggestionCount}
                </span>
              ) : null}
            </button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6">
          <article className="mx-auto max-w-[680px]">
            {/* A textarea so long titles wrap; it grows to fit. Enter moves into the body. */}
            <textarea
              ref={fitHeight}
              rows={1}
              value={title}
              onChange={(e) => {
                rename(e.target.value);
                fitHeight(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  editor?.commands.focus("start");
                }
              }}
              placeholder="Untitled"
              aria-label="Title"
              className="block w-full resize-none overflow-hidden bg-transparent text-[30px] font-semibold leading-tight tracking-[-0.8px] placeholder:text-ink-4 focus:outline-none"
            />

            {/* Type and audience are editable in place: a quiet select and a quiet field. */}
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-ink-3">
              <label className="relative inline-flex items-center">
                <span className="sr-only">Document type</span>
                <select
                  value={type}
                  onChange={(e) => {
                    const next = e.target.value as Doc["type"];
                    setType(next);
                    saveMeta({ type: next });
                  }}
                  className="cursor-pointer appearance-none rounded-md bg-transparent py-0.5 pl-1.5 pr-6 -ml-1.5 text-ink-2 transition-colors hover:bg-hover focus:bg-hover focus:outline-none"
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1.5 size-3.5" />
              </label>
              <span aria-hidden>·</span>
              <label className="flex min-w-[12rem] flex-1 items-center gap-1">
                <span>for</span>
                <input
                  value={forWhom}
                  onChange={(e) => {
                    setForWhom(e.target.value);
                    saveMeta({ forWhom: e.target.value });
                  }}
                  placeholder="which application or award?"
                  aria-label="Which application or award this is for"
                  className="min-w-0 flex-1 rounded-md bg-transparent px-1.5 py-0.5 text-ink-2 transition-colors placeholder:text-ink-4 hover:bg-hover focus:bg-hover focus:outline-none"
                />
              </label>
            </div>

            {/* The assistant's toolbar and panel are positioned inside this box. */}
            <div
              ref={setColumn}
              className="writer relative mt-8"
              style={{ "--writer-size": `${textSize}px` } as React.CSSProperties}
            >
              <EditorContent editor={editor} />
              {editor ? <AssistLayer editor={editor} docType={type} container={column} /> : null}
            </div>
          </article>
        </div>

        {coachOpen ? (
          <aside aria-label="Coach" className="border-t border-line-soft lg:w-[320px] lg:shrink-0 lg:border-l lg:border-t-0">
            <div className="lg:sticky lg:top-[97px]">
              <div className="flex items-center gap-2 px-5 pt-4">
                <p className="flex items-center gap-1.5 text-[13px] font-semibold">
                  <Sparkles className="size-3.5 text-accent" /> Coach
                </p>
                <button
                  type="button"
                  onClick={() => setCoachOpen(false)}
                  aria-label="Hide the coach"
                  title="Hide the coach (focus mode)"
                  className="ml-auto hidden size-7 place-items-center rounded-md text-ink-2 transition-colors hover:bg-hover hover:text-ink lg:grid"
                >
                  <PanelRightClose className="size-4" />
                </button>
              </div>
              {/* key: a new type brings its own questions, starting from the first. */}
              <CoachPanel key={type} editor={editor} type={type} target={target} words={words} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
