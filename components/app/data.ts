import type { FileKind } from "./files";

/* Sample data. One file — swap for API responses. */

export const student = {
  name: "Prashant Khanal",
  first: "Prashant",
  initials: "PK",
  avatar: "/images/pp.jpg",
  email: "pkhanal012@gmail.com",
  goal: "MEng Engineering · Master's",
  destinations: "United States, Canada",
  intake: "Fall 2027",
  profileComplete: 60,
};

/* ------------------------------------------------------------------ Today */

export type Task = {
  id: string;
  title: string;
  meta: string;
  minutes: number;
  area: "Application" | "Essay" | "Interview" | "Test" | "Admin";
  done?: boolean;
};

export const todayTasks: Task[] = [
  { id: "t1", title: "Drill: Financial support answers", meta: "Interview prep · weakest section", minutes: 6, area: "Interview" },
  { id: "t2", title: "Statement of purpose — second draft", meta: "Toronto MEng · due in 7 days", minutes: 45, area: "Essay" },
  { id: "t3", title: "Request reference from Dr. Shrestha", meta: "Waterloo MEng · 2 of 3 requirements", minutes: 10, area: "Application", done: true },
  { id: "t4", title: "Confirm GRE test centre", meta: "Kathmandu · Oct 12", minutes: 5, area: "Test" },
];

export const setupSteps = [
  { id: "s1", title: "Confirm your study plan", body: "Destination, degree level and intake drive every recommendation.", done: true },
  { id: "s2", title: "Save three schools", body: "One reach, one target, one safety.", done: false },
  { id: "s3", title: "Start your first application", body: "Turns a saved school into requirements, deadlines and drafts.", done: false },
  { id: "s4", title: "Run a 6-minute mock interview", body: "Sets your baseline so prep can be ordered for you.", done: false },
];

/* ----------------------------------------------------------- Applications */

export type Application = {
  id: string;
  school: string;
  /** The school's domain — logo.dev looks the brand mark up by it. */
  domain: string;
  program: string;
  country: string;
  stage: "Planning" | "In progress" | "Ready" | "Submitted";
  deadline: string;
  daysLeft: number;
  done: number;
  total: number;
  band: "Reach" | "Target" | "Safety";
  next: string;
};

export const applications: Application[] = [
  { id: "a1", school: "University of Toronto", domain: "utoronto.ca", program: "MEng Mechanical", country: "Canada", stage: "In progress", deadline: "Dec 1", daysLeft: 75, done: 3, total: 6, band: "Target", next: "Statement of purpose — draft 2" },
  { id: "a2", school: "University of Waterloo", domain: "uwaterloo.ca", program: "MEng Electrical", country: "Canada", stage: "In progress", deadline: "Feb 1", daysLeft: 137, done: 2, total: 6, band: "Target", next: "Reference from Dr. Shrestha" },
  { id: "a3", school: "Purdue University", domain: "purdue.edu", program: "MSME", country: "United States", stage: "Planning", deadline: "Jan 15", daysLeft: 120, done: 0, total: 7, band: "Reach", next: "Add transcript" },
  { id: "a4", school: "Arizona State University", domain: "asu.edu", program: "MS Mechanical", country: "United States", stage: "Ready", deadline: "Mar 1", daysLeft: 165, done: 6, total: 6, band: "Safety", next: "Submit application" },
];

export const requirements = [
  { id: "r1", title: "Statement of purpose", detail: "1,000 words · programme-specific", state: "In review" as const },
  { id: "r2", title: "Academic transcript", detail: "Official, sealed · uploaded Aug 28", state: "Done" as const },
  { id: "r3", title: "Two academic references", detail: "1 received · 1 requested", state: "In progress" as const },
  { id: "r4", title: "IELTS Academic", detail: "7.0 overall · meets 6.5 minimum", state: "Done" as const },
  { id: "r5", title: "CV", detail: "2 pages · not started", state: "Not started" as const },
  { id: "r6", title: "Application fee", detail: "CAD 125 · pay at submission", state: "Not started" as const },
];

/* --------------------------------------------------------------- Colleges */

export type School = {
  id: string;
  name: string;
  domain: string; // logo.dev looks logos up by domain
  program: string;
  place: string;
  tuition: string;
  accept: string;
  type: string;
  costAfterAid: string; // demo figures
  deadline: string;
  daysLeft: number;
  band: "Reach" | "Target" | "Safety";
  fit: number;
  why: string;
  lat: number;
  lon: number;
  images: string[]; // campus photos from Wikimedia Commons
  saved?: boolean;
};

export const schools: School[] = [
  { id: "c1", name: "University of Toronto", domain: "utoronto.ca", program: "MEng Mechanical", place: "Toronto, Canada", tuition: "CAD 61k", accept: "43%", type: "Public university", costAfterAid: "CAD 54k", deadline: "Dec 1, 2026", daysLeft: 75, band: "Target", fit: 86, lat: 43.66167, lon: -79.395, images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Sir_Daniel_Wilson_Quadrangle_-_St._George_Campus%2C_Toronto%2C_Canada.jpg/1280px-Sir_Daniel_Wilson_Quadrangle_-_St._George_Campus%2C_Toronto%2C_Canada.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Simcoe_Hall_%28University_of_Toronto%29_%281%29.jpg/1280px-Simcoe_Hall_%28University_of_Toronto%29_%281%29.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Trinity_College_building_DSCF8444.jpg/1280px-Trinity_College_building_DSCF8444.jpg"], why: "Matches your intake and IELTS 7.0; no GRE required.", saved: true },
  { id: "c2", name: "University of Waterloo", domain: "uwaterloo.ca", program: "MEng Electrical", place: "Waterloo, Canada", tuition: "CAD 42k", accept: "53%", type: "Public university", costAfterAid: "CAD 36k", deadline: "Feb 1, 2027", daysLeft: 137, band: "Target", fit: 82, lat: 43.47694, lon: -80.55472, images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Dana_Porter_Library_2.jpg/1280px-Dana_Porter_Library_2.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/University_of_Waterloo_William_G._Davis_Computer_Research_Center.jpg/1280px-University_of_Waterloo_William_G._Davis_Computer_Research_Center.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Tatham_Centre_UWaterloo.jpg/1280px-Tatham_Centre_UWaterloo.jpg"], why: "Co-op stream open to international students.", saved: true },
  { id: "c3", name: "Purdue University", domain: "purdue.edu", program: "MSME", place: "West Lafayette, USA", tuition: "$31k", accept: "29%", type: "Public university", costAfterAid: "$24k", deadline: "Jan 15, 2027", daysLeft: 120, band: "Reach", fit: 71, lat: 40.425, lon: -86.92306, images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Engineering_Fountain_Purdue_University_2016_03.jpg/1280px-Engineering_Fountain_Purdue_University_2016_03.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Purdue_Student_Union.JPG/1280px-Purdue_Student_Union.JPG", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Purdue_University%2C_West_Lafayette%2C_Indiana%2C_Estados_Unidos%2C_2012-10-15%2C_DD_08.jpg/1280px-Purdue_University%2C_West_Lafayette%2C_Indiana%2C_Estados_Unidos%2C_2012-10-15%2C_DD_08.jpg"], why: "Strong for mechanical; GRE optional for Fall 2027.", saved: true },
  { id: "c4", name: "Arizona State University", domain: "asu.edu", program: "MS Mechanical", place: "Tempe, USA", tuition: "$29k", accept: "88%", type: "Public university", costAfterAid: "$21k", deadline: "Mar 1, 2027", daysLeft: 165, band: "Safety", fit: 90, lat: 33.4209, lon: -111.934, images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/2021_Arizona_State_University%2C_Tempe_Campus%2C_Old_Main.jpg/500px-2021_Arizona_State_University%2C_Tempe_Campus%2C_Old_Main.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Arizona_State_University_Bridge_Tempe_Campus.jpg/500px-Arizona_State_University_Bridge_Tempe_Campus.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Picacho_and_Peralta_Halls%2C_ASU_Poly_-_West_-_2009-02-25.jpg/1280px-Picacho_and_Peralta_Halls%2C_ASU_Poly_-_West_-_2009-02-25.jpg"], why: "Rolling admission and a spring intake as backup." },
  { id: "c5", name: "Texas A&M University", domain: "tamu.edu", program: "MS Mechanical", place: "College Station, USA", tuition: "$34k", accept: "63%", type: "Public university", costAfterAid: "$26k", deadline: "Feb 1, 2027", daysLeft: 137, band: "Target", fit: 77, lat: 30.61, lon: -96.35, images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/TAMUcampus.jpg/500px-TAMUcampus.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/George_Bush_Presidential_Library.jpg/1280px-George_Bush_Presidential_Library.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Secretary_of_Defense_Robert_Gates_and_members_of_Texas_A%26M_University%27s_Corps_of_Cadets.jpg/1280px-Secretary_of_Defense_Robert_Gates_and_members_of_Texas_A%26M_University%27s_Corps_of_Cadets.jpg"], why: "Assistantships open to first-year master's students." },
  { id: "c6", name: "McGill University", domain: "mcgill.ca", program: "MEng Mechanical", place: "Montréal, Canada", tuition: "CAD 28k", accept: "46%", type: "Public university", costAfterAid: "CAD 22k", deadline: "Jan 15, 2027", daysLeft: 120, band: "Target", fit: 74, lat: 45.505, lon: -73.5775, images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Arts_Building%2C_McGill_University%2C_Aug_31_2022.jpg/1280px-Arts_Building%2C_McGill_University%2C_Aug_31_2022.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Redpath_Museum_and_Lower_Field%2C_McGill_University%2C_July_18%2C_2024.jpg/500px-Redpath_Museum_and_Lower_Field%2C_McGill_University%2C_July_18%2C_2024.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/McGill_University_Music_Building%2C_Aug_31_2022.jpg/500px-McGill_University_Music_Building%2C_Aug_31_2022.jpg"], why: "Lowest tuition of your Canadian matches." },
];

/* ----------------------------------------------------------- Scholarships */

export type Award = {
  id: string;
  name: string;
  provider: string;
  /** The provider's domain — logo.dev looks the brand mark up by it. */
  providerDomain: string;
  amount: string;
  amountUsd: number;
  deadline: string;
  daysLeft: number;
  eligible: boolean;
  why: string;
  essay: boolean;
  tracked?: boolean;
};

export const awards: Award[] = [
  { id: "w1", name: "Lester B. Pearson International", provider: "University of Toronto", providerDomain: "utoronto.ca", amount: "Full tuition + living", amountUsd: 62000, deadline: "Nov 30", daysLeft: 74, eligible: true, why: "Open to Nepali citizens starting a Fall 2027 master's.", essay: true, tracked: true },
  { id: "w2", name: "Graduate Merit Award", provider: "University of Waterloo", providerDomain: "uwaterloo.ca", amount: "CAD 10,000", amountUsd: 7400, deadline: "Oct 1", daysLeft: 14, eligible: true, why: "Automatic with your application; no separate essay.", essay: false, tracked: true },
  { id: "w3", name: "Ross Fellowship", provider: "Purdue University", providerDomain: "purdue.edu", amount: "$18,000 stipend", amountUsd: 18000, deadline: "Jan 15", daysLeft: 120, eligible: true, why: "Nominated by the department when you apply early.", essay: true },
  { id: "w4", name: "Global Engineering Scholarship", provider: "Arizona State University", providerDomain: "asu.edu", amount: "$12,000 / yr", amountUsd: 12000, deadline: "Feb 15", daysLeft: 151, eligible: true, why: "International master's applicants with a 3.3+ GPA.", essay: true },
  { id: "w5", name: "Tees Valley Access Bursary", provider: "Teesside University", providerDomain: "tees.ac.uk", amount: "£6,000", amountUsd: 7600, deadline: "Sep 28", daysLeft: 11, eligible: false, why: "Requires three years at a Tees Valley school.", essay: false },
];

/* ------------------------------------------------------------- Documents */

export type Doc = {
  id: string;
  title: string;
  type: "Statement of purpose" | "Scholarship essay" | "CV" | "Reference request";
  forWhom: string;
  words: number;
  target: number;
  state: "Draft" | "In review" | "Final";
  updated: string;
};

export const docs: Doc[] = [
  { id: "d1", title: "Statement of purpose — Toronto MEng", type: "Statement of purpose", forWhom: "University of Toronto", words: 720, target: 1000, state: "Draft", updated: "2 hours ago" },
  { id: "d2", title: "Pearson scholarship essay", type: "Scholarship essay", forWhom: "Lester B. Pearson", words: 480, target: 600, state: "In review", updated: "Yesterday" },
  { id: "d3", title: "Academic CV", type: "CV", forWhom: "All applications", words: 610, target: 800, state: "Draft", updated: "3 days ago" },
  { id: "d4", title: "Reference request — Dr. Shrestha", type: "Reference request", forWhom: "Waterloo MEng", words: 210, target: 250, state: "Final", updated: "Last week" },
];

export const coachChecks = [
  { id: "k1", label: "Names the programme and two faculty by name", ok: true },
  { id: "k2", label: "Links your final-year project to their lab", ok: true },
  { id: "k3", label: "Explains the gap year in one sentence", ok: false },
  { id: "k4", label: "States what you do after graduating, and where", ok: false },
  { id: "k5", label: "Under the 1,000-word limit", ok: true },
];

/* ------------------------------------------------------------- Interviews */

/* The question banks and readiness live in interview.ts; this is Home's pick for today. */
export const nextDrill = {
  track: "F-1 visa interview",
  section: "Financial support",
  questions: 3,
  minutes: 6,
  reason: "Your last two answers named no amounts and no sponsor.",
  lastScore: 48,
};

/* -------------------------------------------------------------- Calendar */

export type Block = {
  id: string;
  title: string;
  day: number; // 0 = Mon
  start: number; // hour, 24h
  hours: number;
  kind: "Essay" | "Interview" | "Test" | "Admin";
};

export const blocks: Block[] = [
  { id: "b1", title: "SOP draft 2", day: 0, start: 9, hours: 2, kind: "Essay" },
  { id: "b2", title: "Mock interview", day: 1, start: 18, hours: 1, kind: "Interview" },
  { id: "b3", title: "GRE quant set", day: 2, start: 7, hours: 1.5, kind: "Test" },
  { id: "b4", title: "SOP draft 2", day: 3, start: 9, hours: 2, kind: "Essay" },
  { id: "b5", title: "Upload transcripts", day: 4, start: 16, hours: 1, kind: "Admin" },
  { id: "b6", title: "Mock interview", day: 5, start: 11, hours: 1, kind: "Interview" },
];

export const hardDeadlines = [
  { id: "h1", title: "Graduate Merit Award", when: "Oct 1", days: 14, kind: "Scholarship" },
  { id: "h2", title: "GRE General Test", when: "Oct 12", days: 25, kind: "Test" },
  { id: "h3", title: "Pearson International", when: "Nov 30", days: 74, kind: "Scholarship" },
  { id: "h4", title: "Toronto MEng application", when: "Dec 1", days: 75, kind: "Application" },
];

/* What the app has done for the student since they last looked — the notification
   panel's contents, newest first, under the date heading in `group`. */
export type Notice = {
  id: string;
  title: string;
  detail: string;
  /** How long ago, in words — the only time the row shows. */
  ago: string;
  group: "Today" | "This week" | "Earlier";
  unread: boolean;
};

export const notices: Notice[] = [
  {
    id: "n1",
    title: "Coach review is ready",
    detail: "Statement of purpose — draft 2, with 4 suggestions to look at.",
    ago: "2 mins ago",
    group: "Today",
    unread: true,
  },
  {
    id: "n2",
    title: "Reference received",
    detail: "Dr. Shrestha sent the Waterloo MEng reference — 3 of 3 requirements done.",
    ago: "40 mins ago",
    group: "Today",
    unread: true,
  },
  {
    id: "n3",
    title: "Graduate Merit Award closes in 7 days",
    detail: "University of Waterloo, and it needs no separate essay.",
    ago: "2 hours ago",
    group: "Today",
    unread: true,
  },
  {
    id: "n4",
    title: "Scholarship matches refreshed",
    detail: "Six new awards match your plan, two of them with no essay.",
    ago: "5 hours ago",
    group: "Today",
    unread: false,
  },
  {
    id: "n5",
    title: "Toronto MEng opened",
    detail: "Applications for Fall 2027 are being accepted from today.",
    ago: "2 days ago",
    group: "This week",
    unread: false,
  },
  {
    id: "n6",
    title: "GRE test centre confirmed",
    detail: "Kathmandu, on Oct 12 at 9:00 AM.",
    ago: "3 days ago",
    group: "This week",
    unread: false,
  },
  {
    id: "n7",
    title: "Academic CV marked final",
    detail: "No suggestions left on it — ready to attach to an application.",
    ago: "3 days ago",
    group: "This week",
    unread: false,
  },
  {
    id: "n8",
    title: "Planned maintenance",
    detail: "The writing coach will be offline on Oct 2 from 2:00 AM to 4:00 AM.",
    ago: "last week",
    group: "Earlier",
    unread: false,
  },
  {
    id: "n9",
    title: "Purdue University added",
    detail: "MSME at West Lafayette is now on your list, with 7 requirements.",
    ago: "last week",
    group: "Earlier",
    unread: false,
  },
];

/* ------------------------------------------------------- Month calendar */

/* The month view needs real dates, where the week grid only needs a weekday.
   Everything here is anchored to September 2026, the demo's "now" — navigate
   forward and the hard deadlines below carry the following months. */
export type EventKind = "Essay" | "Interview" | "Test" | "Admin" | "Deadline";

export type CalendarEvent = {
  id: string;
  /** ISO date, so the grid can bucket without parsing prose. */
  date: string;
  title: string;
  /** 24h, matching the week grid. Absent for all-day items. */
  time?: string;
  kind: EventKind;
};

export const calendarEvents: CalendarEvent[] = [
  { id: "e1", date: "2026-09-01", title: "Shortlist review", time: "10:00", kind: "Admin" },
  { id: "e2", date: "2026-09-03", title: "IELTS speaking drill", time: "18:00", kind: "Interview" },
  { id: "e3", date: "2026-09-07", title: "SOP draft 1", time: "9:00", kind: "Essay" },
  { id: "e4", date: "2026-09-08", title: "GRE quant set", time: "7:00", kind: "Test" },
  { id: "e5", date: "2026-09-10", title: "Reference request — Dr. Shrestha", time: "16:00", kind: "Admin" },
  { id: "e6", date: "2026-09-14", title: "SOP draft 2", time: "9:00", kind: "Essay" },
  { id: "e7", date: "2026-09-15", title: "Mock interview", time: "18:00", kind: "Interview" },
  { id: "e8", date: "2026-09-16", title: "GRE quant set", time: "7:00", kind: "Test" },
  { id: "e9", date: "2026-09-17", title: "SOP draft 2", time: "9:00", kind: "Essay" },
  { id: "e10", date: "2026-09-17", title: "Waterloo reference check", time: "14:00", kind: "Admin" },
  { id: "e11", date: "2026-09-17", title: "Mock interview", time: "18:00", kind: "Interview" },
  { id: "e12", date: "2026-09-18", title: "Upload transcripts", time: "16:00", kind: "Admin" },
  { id: "e13", date: "2026-09-19", title: "Mock interview", time: "11:00", kind: "Interview" },
  { id: "e14", date: "2026-09-21", title: "Waterloo essay", time: "9:30", kind: "Essay" },
  { id: "e15", date: "2026-09-22", title: "GRE verbal set", time: "7:00", kind: "Test" },
  { id: "e16", date: "2026-09-23", title: "Scholarship essay", time: "14:00", kind: "Essay" },
  { id: "e17", date: "2026-09-24", title: "Mock interview", time: "18:00", kind: "Interview" },
  { id: "e18", date: "2026-09-25", title: "Transcript follow-up", time: "11:00", kind: "Admin" },
  { id: "e19", date: "2026-09-28", title: "Toronto application review", time: "10:00", kind: "Admin" },
  { id: "e20", date: "2026-09-29", title: "GRE full mock", time: "9:00", kind: "Test" },
  { id: "e21", date: "2026-09-30", title: "SOP final pass", time: "9:00", kind: "Essay" },
];

/** The hard deadlines again, dated, so the month grid can place them. */
export const deadlineDates: Record<string, string> = {
  h1: "2026-10-01",
  h2: "2026-10-12",
  h3: "2026-11-30",
  h4: "2026-12-01",
};

/* --------------------------------------------- Documents a school asks for */

/* `kind` matches a label in My files, so a school's checklist can tell which
   documents the student already holds without anyone re-entering them. */
export type RequiredDoc = {
  kind: FileKind;
  title: string;
  note: string;
};

const CORE_DOCUMENTS: RequiredDoc[] = [
  { kind: "transcript", title: "Academic transcript", note: "Official copy, issued or sealed by your university" },
  { kind: "passport", title: "Passport", note: "Valid at least six months past your intake" },
  { kind: "essay", title: "Statement of purpose", note: "Around 1,000 words, written for this programme" },
  { kind: "reference", title: "Two academic references", note: "From people who taught or supervised you" },
  { kind: "test", title: "English test score", note: "IELTS, TOEFL or the school's own waiver" },
  { kind: "cv", title: "CV", note: "Two pages, covering study and any work" },
];

/** The core list, plus whatever the destination country adds to it. */
export function documentsFor(school: School): RequiredDoc[] {
  const country = school.place.split(",").pop()?.trim();
  const financial: RequiredDoc =
    country === "USA"
      ? { kind: "finance", title: "Financial affidavit", note: "Bank statement and sponsor letter, for the I-20" }
      : { kind: "finance", title: "Proof of funds", note: "One year of tuition and living costs" };
  return [...CORE_DOCUMENTS, financial];
}
