import { FileText, FileUser, FolderOpen, IdCard, Landmark, Languages, Mail, NotebookPen, PenLine, ScrollText, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { StickerTone } from "@/components/ui/kit";
import type { Doc } from "./data";
import type { FileKind } from "./files";

/* One face per kind of document — an icon and a sticker colour — so a
   statement of purpose looks the same in Writing coach, on Home, in My files
   and on a school's checklist. */

type Look = { icon: LucideIcon; tone: StickerTone };

export const DOC_TYPE: Record<Doc["type"], Look> = {
  "Statement of purpose": { icon: FileText, tone: "sky" },
  "Scholarship essay": { icon: NotebookPen, tone: "sun" },
  CV: { icon: FileUser, tone: "mint" },
  "Reference request": { icon: Mail, tone: "pink" },
};

export const FILE_KIND: Record<FileKind, Look> = {
  transcript: { icon: ScrollText, tone: "sky" },
  passport: { icon: IdCard, tone: "coral" },
  essay: { icon: PenLine, tone: "lilac" },
  cv: { icon: FileUser, tone: "mint" },
  reference: { icon: Users, tone: "pink" },
  test: { icon: Languages, tone: "sun" },
  finance: { icon: Landmark, tone: "mint" },
  other: { icon: FolderOpen, tone: "lilac" },
};
