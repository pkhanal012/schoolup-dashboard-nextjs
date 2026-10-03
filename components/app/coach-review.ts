import { Extension } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, type EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/*
 * The coach's paragraph review. Runs locally on every edit — no network, no
 * AI — and flags paragraphs worth another pass: clichés, long sentences, vague
 * words, overlong paragraphs and empty sections. The editor tints the flagged
 * paragraph and underlines the exact words; the coach panel explains each one.
 */

export type FindingKind = "cliche" | "long-sentence" | "vague" | "long-paragraph" | "empty-section";

export type Finding = {
  id: string;
  /** Stable across edits elsewhere in the draft, so a dismissal sticks. */
  key: string;
  kind: FindingKind;
  /** The paragraph's text range (inside the node). */
  from: number;
  to: number;
  /** Words or sentences to underline within it. */
  marks: { from: number; to: number }[];
  title: string;
  detail: string;
  /** Instruction for the rewrite assistant; absent where only the student can write it. */
  instruction?: string;
};

const CLICHES = [
  "since childhood",
  "since i was a child",
  "since my childhood",
  "ever since i was",
  "from a young age",
  "always been passionate",
  "i am passionate",
  "passionate about",
  "my passion for",
  "always dreamed",
  "my dream",
  "dream come true",
  "always wanted to",
  "hard-working",
  "hardworking",
  "team player",
  "world-class",
  "state-of-the-art",
  "prestigious",
  "esteemed",
  "renowned",
  "in today's world",
  "in this day and age",
  "fast-paced",
  "make a difference",
  "give back to society",
];

const VAGUE = ["very", "really", "extremely", "truly", "highly", "a lot", "lots of", "things", "stuff", "various", "numerous", "basically", "actually"];

const LONG_SENTENCE = 35;
const LONG_PARAGRAPH = 130;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const CLICHE_RE = new RegExp(`\\b(${CLICHES.map(escape).join("|")})\\b`, "gi");
const VAGUE_RE = new RegExp(`\\b(${VAGUE.map(escape).join("|")})\\b`, "gi");

const countWords = (s: string) => (s.match(/[\p{L}\p{N}’'-]+/gu) ?? []).length;

/** Maps a character offset in a textblock's textContent to a document position (hard breaks have no text). */
function charToPos(node: PMNode, nodePos: number, char: number) {
  let seen = 0;
  let result = nodePos + 1;
  let found = false;
  node.forEach((child, offset) => {
    if (found || !child.isText) return;
    const len = child.text!.length;
    if (char <= seen + len) {
      result = nodePos + 1 + offset + (char - seen);
      found = true;
    }
    seen += len;
  });
  return found ? result : nodePos + node.nodeSize - 1;
}

export function reviewDoc(doc: PMNode): Finding[] {
  const findings: Finding[] = [];
  const blocks: { node: PMNode; pos: number }[] = [];
  doc.descendants((node, pos) => {
    if (node.isTextblock) {
      blocks.push({ node, pos });
      return false;
    }
    return true;
  });

  blocks.forEach(({ node, pos }, i) => {
    const text = node.textContent;
    const from = pos + 1;
    const to = pos + node.nodeSize - 1;
    const add = (kind: FindingKind, f: Omit<Finding, "id" | "key" | "kind" | "from" | "to">) =>
      findings.push({ id: `${kind}:${pos}:${f.marks[0]?.from ?? 0}`, key: `${kind}:${text.slice(0, 60)}`, kind, from, to, ...f });

    if (node.type.name === "heading") {
      // A heading followed only by empty paragraphs (or nothing) until the next heading.
      let j = i + 1;
      let written = false;
      while (j < blocks.length && blocks[j].node.type.name !== "heading") {
        if (blocks[j].node.textContent.trim()) written = true;
        j++;
      }
      if (!written && text.trim()) {
        add("empty-section", {
          marks: [],
          title: "This section is still empty",
          detail: `“${text.trim()}” has nothing under it yet. Start with the coach’s question — in your own words.`,
        });
      }
      return;
    }
    if (!text.trim()) return;

    const cliches = [...text.matchAll(CLICHE_RE)];
    if (cliches.length) {
      const first = cliches[0][0];
      add("cliche", {
        marks: cliches.map((m) => ({ from: charToPos(node, pos, m.index!), to: charToPos(node, pos, m.index! + m[0].length) })),
        title: "Swap the cliché for something only you could write",
        detail: `“${first}” appears in thousands of statements. Replace it with the moment or detail behind it.`,
        instruction: `Remove the cliché “${first}” and make the sentence specific using only details already in my text. Don't invent anything.`,
      });
    }

    for (const m of text.matchAll(/[^.!?]+[.!?]*/g)) {
      const n = countWords(m[0]);
      if (n > LONG_SENTENCE) {
        const start = m.index! + (m[0].length - m[0].trimStart().length);
        add("long-sentence", {
          marks: [{ from: charToPos(node, pos, start), to: charToPos(node, pos, m.index! + m[0].trimEnd().length) }],
          title: "Split this sentence",
          detail: `This sentence runs ${n} words. Readers lose the thread after about 25.`,
          instruction: "Split the longest sentence into two or three shorter ones. Keep the meaning and every fact.",
        });
      }
    }

    const vague = [...text.matchAll(VAGUE_RE)];
    if (vague.length >= 2) {
      const words = [...new Set(vague.map((m) => `“${m[0].toLowerCase()}”`))].slice(0, 3).join(", ");
      add("vague", {
        marks: vague.map((m) => ({ from: charToPos(node, pos, m.index!), to: charToPos(node, pos, m.index! + m[0].length) })),
        title: "Trade vague words for specifics",
        detail: `${words} — say how much, which ones, or what exactly.`,
        instruction: "Replace vague words (very, really, things, many…) with specifics already in my text, or remove them. Don't invent details.",
      });
    }

    const n = countWords(text);
    if (n > LONG_PARAGRAPH) {
      add("long-paragraph", {
        marks: [],
        title: "Break this paragraph up",
        detail: `${n} words in one block. Give each idea its own paragraph.`,
        instruction: "Split this paragraph into two at the most natural point, keeping every sentence as it is.",
      });
    }
  });
  return findings;
}

/* ----------------------------------------------------------- Extension */

type ReviewState = { findings: Finding[]; dismissed: Set<string>; active: string | null };
type ReviewMeta = { dismiss?: string; active?: string | null };

export const coachReviewKey = new PluginKey<ReviewState>("coachReview");

const visible = (all: Finding[], dismissed: Set<string>) => all.filter((f) => !dismissed.has(f.key));

export function getFindings(state: EditorState): Finding[] {
  return coachReviewKey.getState(state)?.findings ?? [];
}

export function getActiveFinding(state: EditorState) {
  return coachReviewKey.getState(state)?.active ?? null;
}

export const CoachReview = Extension.create({
  name: "coachReview",
  addProseMirrorPlugins() {
    return [
      new Plugin<ReviewState>({
        key: coachReviewKey,
        state: {
          init: (_, state) => ({ findings: reviewDoc(state.doc), dismissed: new Set(), active: null }),
          apply(tr, value, _old, next) {
            const meta = tr.getMeta(coachReviewKey) as ReviewMeta | undefined;
            let { dismissed, active } = value;
            if (meta?.dismiss) dismissed = new Set(dismissed).add(meta.dismiss);
            if (meta && "active" in meta) active = meta.active ?? null;
            if (!tr.docChanged && !meta?.dismiss) return { ...value, active };
            return { findings: visible(reviewDoc(next.doc), dismissed), dismissed, active };
          },
        },
        props: {
          decorations(state) {
            const s = coachReviewKey.getState(state);
            if (!s || s.findings.length === 0) return null;
            const decos: Decoration[] = [];
            const paras = new Map<number, boolean>();
            for (const f of s.findings) {
              const isActive = f.id === s.active;
              paras.set(f.from, (paras.get(f.from) ?? false) || isActive);
              for (const m of f.marks) if (m.from < m.to) decos.push(Decoration.inline(m.from, m.to, { class: "coach-phrase" }));
            }
            paras.forEach((isActive, from) => {
              const node = state.doc.resolve(from).parent;
              decos.push(Decoration.node(from - 1, from - 1 + node.nodeSize, { class: isActive ? "coach-para coach-para-active" : "coach-para" }));
            });
            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },
});
