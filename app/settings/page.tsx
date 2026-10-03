"use client";

import * as React from "react";
import { Bell, BookOpen, Check, CreditCard, Plus, Trash2, User } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { student } from "@/components/app/data";
import { Badge, Button, FactGrid, Label, Meter, Modal, Panel, PanelHead, Tabs, fieldStyles, useToast } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

type Tab = "plan" | "profile" | "notifications" | "billing";

function Toggle({ id, label, hint, defaultOn = false }: { id: string; label: string; hint: string; defaultOn?: boolean }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <label htmlFor={id} className="min-w-0">
        <span className="block text-[13.5px] font-semibold tracking-[-0.15px]">{label}</span>
        <span className="mt-0.5 block text-[12px] text-ink-3">{hint}</span>
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={on}
        onClick={() => setOn((v) => !v)}
        className={cn("relative mt-0.5 h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200", on ? "bg-primary" : "bg-[var(--line-strong)]")}
      >
        <span className={cn("absolute top-[3px] size-4 rounded-full bg-white shadow-e1 transition-[left] duration-300 ease-[var(--ease-spring)]", on ? "left-[19px]" : "left-[3px]")} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const toast = useToast();
  const [tab, setTab] = React.useState<Tab>("plan");
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState("");

  return (
    <Shell title="Profile & settings" crumb="Account" description="Your plan drives every recommendation in the app. Everything else is preference.">
      <div className="flex flex-col gap-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "plan", label: "Study plan", icon: BookOpen },
            { value: "profile", label: "Profile", icon: User },
            { value: "notifications", label: "Notifications", icon: Bell },
            { value: "billing", label: "Plan & billing", icon: CreditCard },
          ]}
        />

        {tab === "plan" ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <Panel className="overflow-hidden">
              <PanelHead title="Study plan" hint="Change these and matches, prep tracks and document types all follow." action={<Button size="sm">Edit</Button>} />
              <FactGrid
                items={[
                  { label: "Destination", value: student.destinations },
                  { label: "Degree level", value: "Master's" },
                  { label: "Field", value: "MEng Engineering" },
                  { label: "Intake", value: student.intake },
                  { label: "English test", value: "IELTS 7.0", mono: true },
                  { label: "GPA", value: "3.4 / 4.0", mono: true },
                ]}
              />
            </Panel>
            <Panel className="self-start">
              <PanelHead title="Profile strength" action={<Badge tone="accent">{student.profileComplete}%</Badge>} />
              <div className="px-4 py-3.5">
                <Meter value={student.profileComplete} />
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-2">
                  Two things left: a short bio and one activity. Both are used in scholarship matching.
                </p>
                <Button size="sm" className="mt-3"><Plus /> Add a bio</Button>
              </div>
            </Panel>
          </div>
        ) : null}

        {tab === "profile" ? (
          <Panel>
            <PanelHead title="Account" />
            <dl className="divide-y divide-line-soft">
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-[13.5px] font-medium">Photo</dt>
                <dd>
                  <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border bg-surface shadow-e1">
                    <img src={student.avatar} alt={student.name} className="size-full object-cover" />
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-[13.5px] font-medium">Name</dt>
                <dd className="text-[13px] text-ink-2">{student.name}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-[13.5px] font-medium">Email</dt>
                <dd className="text-[13px] text-ink-2">{student.email}</dd>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <dt className="text-[13.5px] font-medium">Time zone</dt>
                <dd className="text-[13px] text-ink-2">Asia/Kathmandu (UTC+5:45)</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between gap-4 border-t border-line-soft px-4 py-3">
              <div>
                <p className="text-[13.5px] font-semibold tracking-[-0.15px] text-bad">Delete account</p>
                <p className="mt-0.5 text-[12px] text-ink-3">Removes your applications, drafts and practice history. This cannot be undone.</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 /> Delete</Button>
            </div>
          </Panel>
        ) : null}

        {tab === "notifications" ? (
          <div className="flex flex-col gap-4">
            <Panel>
              <PanelHead title="Reminders" hint="One scale everywhere: on the day, 1 day, 3 days, 1 week." />
              <div className="divide-y divide-line-soft">
                <Toggle id="n1" label="Deadline reminders" hint="Email and in-app, on the schedule set per category." defaultOn />
                <Toggle id="n2" label="Weekly plan" hint="Sunday evening: what moved, what slipped, what is next." defaultOn />
                <Toggle id="n3" label="New matches" hint="Only when a school or award fits your plan." />
              </div>
            </Panel>
            <Panel>
              <PanelHead title="Sharing" />
              <div className="divide-y divide-line-soft">
                <Toggle id="n4" label="Share with counsellor" hint="They see applications and drafts, never your practice scores." />
                <Toggle id="n5" label="Share progress with a guardian" hint="Status only — never the contents of an essay." />
              </div>
            </Panel>
          </div>
        ) : null}

        {tab === "billing" ? (
          <div className="grid items-start gap-4 sm:grid-cols-2">
            <Panel>
              <PanelHead title="Free" hint="3 mock interviews a week, 2 document reviews a month, unlimited search." action={<Badge tone="good"><Check className="size-3" /> Current</Badge>} />
              <div className="px-4 py-3.5">
                <div className="flex items-baseline justify-between text-[12.5px]">
                  <span className="text-ink-2">Mocks used this week</span>
                  <span className="font-mono tabular-nums">2 / 3</span>
                </div>
                <Meter className="mt-2" value={66} tone="warn" />
              </div>
            </Panel>
            <Panel className="bg-sky-soft">
              <PanelHead className="border-sky/20" title="Plus — $9/month" hint="Unlimited mocks and reviews, counsellor-marked answers, essay version history." />
              <div className="px-4 py-3.5">
                <Button variant="primary" className="w-full" onClick={() => toast({ message: "Opening checkout…" })}>Upgrade</Button>
                <p className="mt-2 text-center text-[12px] text-ink-3">Cancel any time. Your drafts stay yours either way.</p>
              </div>
            </Panel>
          </div>
        ) : null}
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setConfirm(""); }}
        title="Delete your account?"
        description="This removes four applications, four documents and your practice history. It cannot be undone."
        footer={
          <>
            <Button onClick={() => { setDeleteOpen(false); setConfirm(""); }}>Keep my account</Button>
            <Button variant="danger" disabled={confirm !== "DELETE"} onClick={() => { setDeleteOpen(false); setConfirm(""); toast({ message: "Account deletion scheduled for 30 days from now" }); }}>
              Delete everything
            </Button>
          </>
        }
      >
        <label className="flex flex-col gap-1.5">
          <Label as="span">Type DELETE to confirm</Label>
          <input
            id="confirm-delete"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={fieldStyles}
          />
        </label>
      </Modal>
    </Shell>
  );
}
