"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowUpRight, Bookmark, BookmarkCheck, Check, GraduationCap, HandCoins } from "lucide-react";
import { Shell } from "@/components/app/shell";
import { CampusMap } from "@/components/app/campus-map";
import { SchoolLogo } from "@/components/app/school-logo";
import { awards, documentsFor, schools, type Award } from "@/components/app/data";
import { FILE_KIND } from "@/components/app/doc-types";
import { KINDS, useFiles } from "@/components/app/files";
import {
  Badge,
  Button,
  Carousel,
  EmptyState,
  FactGrid,
  IconTile,
  Inset,
  ListRow,
  Meter,
  Modal,
  Panel,
  PanelHead,
  PanelList,
  RowText,
  buttonStyles,
  useToast,
} from "@/components/ui/kit";

/* One school, on its own page rather than in a drawer: everything about it is
   linkable, shareable and survives a reload — and there is room for the campus
   photos and map to be worth looking at. */

const BAND_TONE = { Safety: "good", Target: "neutral", Reach: "warn" } as const;

export default function SchoolPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const school = schools.find((s) => s.id === params.id);

  const [saved, setSaved] = React.useState(Boolean(school?.saved));
  const [starting, setStarting] = React.useState(false);

  if (!school) {
    return (
      <Shell title="School not found" crumb="Colleges">
        <EmptyState
          icon={GraduationCap}
          title="We don't have that school"
          body="It may have been removed from your list. Everything you saved is still on the colleges page."
          primary={
            <Button size="sm" onClick={() => history.back()}>
              Back to colleges
            </Button>
          }
        />
      </Shell>
    );
  }

  const toggleSave = () => {
    setSaved((wasSaved) => {
      toast({ message: wasSaved ? `Removed ${school.name} from your list` : `Saved ${school.name}` });
      return !wasSaved;
    });
  };

  const schoolAwards = React.useMemo(
    () => awards.filter((a) => a.provider === school.name || a.providerDomain === school.domain),
    [school],
  );

  const facts = [
    { label: "Tuition", value: school.tuition, mono: true },
    { label: "Avg. cost after aid", value: school.costAfterAid, mono: true },
    { label: "Scholarships", value: schoolAwards.length > 0 ? `${schoolAwards.length} available` : "Not available" },
    { label: "Admission rate", value: school.accept, mono: true },
    { label: "Institution type", value: school.type },
    { label: "Regular decision", value: school.deadline, mono: true },
  ];

  return (
    <Shell
      title={school.name}
      back={{ href: "/colleges", label: "All colleges" }}
      icon={<SchoolLogo name={school.name} domain={school.domain} size={28} />}
      crumb="Colleges"
      description={`${school.program} · ${school.place}`}
      actions={
        <>
          <Button size="sm" onClick={toggleSave}>
            {saved ? <BookmarkCheck /> : <Bookmark />}
            {saved ? "Saved" : "Save"}
          </Button>
          <Button size="sm" variant="primary" onClick={() => setStarting(true)}>
            Start application
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-5">
            <Carousel images={school.images} alt={`${school.name} campus`} />

            <Panel className="overflow-hidden">
              <PanelHead title="At a glance" />
              <FactGrid items={facts} />
            </Panel>

            <CollegeScholarships school={school} awards={schoolAwards} />

            <RequiredDocuments school={school} />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Panel>
              <PanelHead title="Your fit" hint="Measured against your study plan." action={<Badge tone={BAND_TONE[school.band]}>{school.band}</Badge>} />
              <div className="px-4 py-3.5">
                <Inset label="Why this matched you">{school.why}</Inset>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-medium">Fit against your plan</p>
                    <p className="font-mono text-[13px] tabular-nums">{school.fit}</p>
                  </div>
                  <Meter className="mt-2" value={school.fit} tone={school.fit >= 80 ? "good" : "accent"} />
                </div>
              </div>
            </Panel>

            <CampusMap name={school.name} place={school.place} lat={school.lat} lon={school.lon} />

            <Panel>
              <PanelHead title="What starting does" />
              <div className="px-4 py-3.5">
                <ul className="flex flex-col gap-1.5 text-[12.5px] leading-relaxed text-ink-2">
                  {[
                    "Builds the requirement checklist with due dates",
                    "Blocks the deadline out in your calendar",
                    "Opens a statement-of-purpose draft",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
                      {line}
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant="primary" className="mt-3 w-full" onClick={() => setStarting(true)}>
                  Start application
                </Button>
              </div>
            </Panel>

            <a
              href={`https://${school.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "ghost", size: "sm", className: "self-start" })}
            >
              Visit {school.domain} <ArrowUpRight />
            </a>

          </div>
      </div>

      <Modal
        open={starting}
        onClose={() => setStarting(false)}
        title={`Start your ${school.name} application`}
        description="This creates the requirement checklist, adds the deadline to your calendar and opens a draft."
        footer={
          <>
            <Button onClick={() => setStarting(false)}>Not yet</Button>
            <Button
              variant="primary"
              onClick={() => {
                toast({ message: "Application started — 6 requirements added" });
                setStarting(false);
              }}
            >
              Start application
            </Button>
          </>
        }
      >
        <ul className="flex flex-col gap-1.5 text-[12.5px] text-ink-2">
          {[
            "6 requirements, each with its own due date",
            "The deadline blocked out in your calendar",
            "A statement-of-purpose draft in Writing coach",
            "Interview prep switched to this programme",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
              {line}
            </li>
          ))}
        </ul>
      </Modal>
    </Shell>
  );
}

function CollegeScholarships({ school, awards: schoolAwards }: { school: (typeof schools)[number]; awards: Award[] }) {
  const hasScholarships = schoolAwards.length > 0;

  return (
    <Panel className="overflow-hidden">
      <PanelHead
        title="Scholarships"
        hint={`Institutional aid for ${school.name}.`}
        action={
          <Badge tone={hasScholarships ? "accent" : "neutral"}>{hasScholarships ? `${schoolAwards.length} available` : "None"}</Badge>
        }
      />

      {hasScholarships ? (
        <PanelList>
          {schoolAwards.map((award) => (
            <ListRow key={award.id}>
              <IconTile icon={HandCoins} tone="sun" />
              <RowText title={award.name} sub={`${award.amount} · Deadline ${award.deadline}`} />
              <Link href="/scholarships" className={buttonStyles({ size: "sm" })}>
                View
              </Link>
            </ListRow>
          ))}
        </PanelList>
      ) : (
        <div className="flex items-center justify-between px-4 py-3 text-[12.5px] text-ink-3">
          <span>No direct scholarships listed for this school.</span>
          <Link href="/scholarships" className={buttonStyles({ size: "sm" })}>
            Browse all
          </Link>
        </div>
      )}
    </Panel>
  );
}

/**
 * What this school asks for, checked against My files: anything the student
 * already holds a document of that kind for is marked ready, so the list shows
 * what is left rather than what exists.
 */
function RequiredDocuments({ school }: { school: (typeof schools)[number] }) {
  const { files, ready } = useFiles();
  const documents = documentsFor(school);
  const held = new Set(files.map((f) => f.kind));
  const have = documents.filter((d) => held.has(d.kind)).length;

  return (
    <Panel className="overflow-hidden">
      <PanelHead
        title="Documents to enrol"
        hint={`What ${school.name} asks every applicant for.`}
        action={
          ready ? (
            <Badge tone={have === documents.length ? "good" : "accent"}>
              {have}/{documents.length} ready
            </Badge>
          ) : null
        }
      />
      <PanelList>
        {documents.map((doc) => {
          const inLocker = held.has(doc.kind);
          return (
            <ListRow key={doc.title}>
              <IconTile icon={inLocker ? Check : FILE_KIND[doc.kind].icon} tone={inLocker ? "good" : FILE_KIND[doc.kind].tone} />
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold tracking-[-0.15px]">{doc.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{doc.note}</p>
              </div>
              {inLocker ? (
                <Badge tone="good">In My files</Badge>
              ) : (
                <Link href="/files" className={buttonStyles({ size: "sm" })}>
                  Add
                </Link>
              )}
            </ListRow>
          );
        })}
      </PanelList>
      <p className="border-t border-line-soft px-4 py-3 text-[12px] text-ink-3">
        Matched by label — a file tagged {KINDS.find((k) => k.value === "transcript")?.label} counts for the transcript here.
      </p>
    </Panel>
  );
}
