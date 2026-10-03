"use client";

import { hardDeadlines } from "./data";
import { Due, ListRow, Panel, PanelHead, PanelList, RowText } from "@/components/ui/kit";

/* The dates a student cannot move. Home and Calendar both show them, so they
   are drawn once here: same rows, same urgency colours, wherever they appear. */
export function DeadlineList({ hint = "Dates you cannot move.", className }: { hint?: string; className?: string }) {
  return (
    <Panel className={className}>
      <PanelHead title="Hard deadlines" hint={hint} />
      <PanelList>
        {hardDeadlines.map((d) => (
          <ListRow key={d.id}>
            <RowText title={d.title} sub={d.kind} />
            <Due date={d.when} days={d.days} className="shrink-0 text-right" />
          </ListRow>
        ))}
      </PanelList>
    </Panel>
  );
}
