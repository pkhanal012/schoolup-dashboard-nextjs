/*
 * The public university directory: the 50 featured schools from
 * schoolupacademy.com/en/colleges, as listed there (tuition in USD per year,
 * acceptance rate in %, 2027-entry deadline). `null` means the live catalog
 * does not publish that figure — the pages say so rather than guess.
 *
 * Swap for the catalog API when it exists; the pages only read this shape.
 */

export type Region = "USA" | "UK" | "Canada" | "Australia" | "Europe" | "Asia";

export type University = {
  slug: string;
  name: string;
  domain: string;
  type: "Public" | "Private";
  city: string;
  state: string;
  country: string;
  region: Region;
  setting: "Urban" | "Suburban" | "Rural";
  system: string | null; // application platform
  tuition: number | null; // USD / year, sticker
  accept: number | null; // % admitted
  deadline: string | null; // ISO date; null = rolling
  detail?: UniversityDetail;
};

/** Profile fields the live catalog only publishes for some schools. */
export type UniversityDetail = {
  rank?: number;
  aka?: string[];
  size?: number;
  opens?: string; // ISO date the portal opens
  fee?: number; // application fee, USD; 0 = free
  netPrice?: number;
  medianSat?: number;
  degrees?: string[];
  majors?: string[];
  requirements?: { title: string; detail: string }[];
  about?: string[];
};

type Row = [string, string, University["type"], string, string, string, University["setting"], string | null, number | null, number | null, string | null];

// name, domain, type, city, state, country, setting, system, tuition, accept, deadline
const ROWS: Row[] = [
  ["Princeton University", "princeton.edu", "Private", "Princeton", "New Jersey", "USA", "Suburban", "Common App", 59700, 4, "2027-01-01"],
  ["University of Oxford", "ox.ac.uk", "Public", "Oxford", "England", "UK", "Urban", "Other system", 46000, 16, "2026-10-15"],
  ["Massachusetts Institute of Technology", "mit.edu", "Private", "Cambridge", "Massachusetts", "USA", "Urban", "Direct application", 60200, 5, "2027-01-05"],
  ["University of Cambridge", "cam.ac.uk", "Public", "Cambridge", "England", "UK", "Urban", "Other system", 45000, 17, "2026-10-15"],
  ["Harvard University", "harvard.edu", "Private", "Cambridge", "Massachusetts", "USA", "Urban", "Common App", 59300, 3, "2027-01-01"],
  ["Stanford University", "stanford.edu", "Private", "Stanford", "California", "USA", "Suburban", "Common App", 62500, 4, "2027-01-05"],
  ["Yale University", "yale.edu", "Private", "New Haven", "Connecticut", "USA", "Urban", "Coalition App", 67300, 5, "2027-01-02"],
  ["Imperial College London", "imperial.ac.uk", "Public", "London", "England", "UK", "Urban", "Other system", 47500, 11, "2027-01-29"],
  ["National University of Singapore", "nus.edu.sg", "Public", "Singapore", "Singapore", "Singapore", "Suburban", "Direct application", 28000, 15, "2027-02-28"],
  ["California Institute of Technology", "caltech.edu", "Private", "Pasadena", "California", "USA", "Suburban", "Common App", 63000, 3, "2027-01-03"],
  ["University College London", "ucl.ac.uk", "Public", "London", "England", "UK", "Urban", "Other system", 38000, 32, "2027-01-29"],
  ["Middlebury College", "middlebury.edu", "Private", "Middlebury", "Vermont", "USA", "Rural", "Common App", 65000, 13, "2027-01-03"],
  ["University of Melbourne", "unimelb.edu.au", "Public", "Melbourne", "Victoria", "Australia", "Urban", "Direct application", 34000, 70, "2026-11-30"],
  ["Nanyang Technological University", "ntu.edu.sg", "Public", "Singapore", "Singapore", "Singapore", "Suburban", "Direct application", 26000, 22, "2027-03-19"],
  ["University of California, Berkeley", "berkeley.edu", "Public", "Berkeley", "California", "USA", "Urban", "Other system", 48500, 11, "2026-11-30"],
  ["University of Sydney", "sydney.edu.au", "Public", "Sydney", "New South Wales", "Australia", "Urban", "Direct application", 36000, 68, "2027-01-31"],
  ["Loughborough University", "lboro.ac.uk", "Public", "Loughborough", "England", "UK", "Suburban", null, null, null, "2027-01-15"],
  ["University of Michigan–Ann Arbor", "umich.edu", "Public", "Ann Arbor", "Michigan", "USA", "Suburban", "Common App", 57300, 18, "2027-02-01"],
  ["University of Toronto", "utoronto.ca", "Public", "Toronto", "Ontario", "Canada", "Urban", "Other system", 45000, 43, "2027-01-15"],
  ["University of Edinburgh", "ed.ac.uk", "Public", "Edinburgh", "Scotland", "UK", "Urban", "Other system", 34000, 40, "2027-01-29"],
  ["Technical University of Munich", "tum.de", "Public", "Munich", "Bavaria", "Germany", "Urban", "Other system", 300, 30, "2027-01-15"],
  ["McGill University", "mcgill.ca", "Public", "Montréal", "Quebec", "Canada", "Urban", "Direct application", 38000, 46, "2027-01-15"],
  ["Australian National University", "anu.edu.au", "Public", "Canberra", "Australian Capital Territory", "Australia", "Suburban", "Direct application", 32000, 35, "2026-12-15"],
  ["Cardiff University", "cardiff.ac.uk", "Public", "Cardiff", "Wales", "UK", "Urban", null, null, null, "2027-01-15"],
  ["University of Texas at Austin", "utexas.edu", "Public", "Austin", "Texas", "USA", "Urban", "Other system", 42800, 29, "2026-12-01"],
  ["Georgia Institute of Technology", "gatech.edu", "Public", "Atlanta", "Georgia", "USA", "Urban", "Common App", 34900, 16, "2027-01-04"],
  ["University of British Columbia", "ubc.ca", "Public", "Vancouver", "British Columbia", "Canada", "Urban", "Other system", 40000, 52, "2027-01-15"],
  ["University of Manchester", "manchester.ac.uk", "Public", "Manchester", "England", "UK", "Urban", "Other system", 32000, 56, "2027-01-29"],
  ["New York University", "nyu.edu", "Private", "New York", "New York", "USA", "Urban", "Common App", 62800, 8, "2027-01-05"],
  ["Monash University", "monash.edu", "Public", "Melbourne", "Victoria", "Australia", "Suburban", "Direct application", 30000, 72, "2026-12-31"],
  ["College of William & Mary", "wm.edu", "Public", "Williamsburg", "Virginia", "USA", "Suburban", null, null, 37, "2027-01-01"],
  ["King's College London", "kcl.ac.uk", "Public", "London", "England", "UK", "Urban", "Other system", 36000, 43, "2027-01-29"],
  ["University of Queensland", "uq.edu.au", "Public", "Brisbane", "Queensland", "Australia", "Urban", "Direct application", 31000, 64, "2026-12-15"],
  ["University of Maryland, College Park", "umd.edu", "Public", "College Park", "Maryland", "USA", "Suburban", null, null, null, null],
  ["University of St Andrews", "st-andrews.ac.uk", "Public", "St Andrews", "Scotland", "UK", "Rural", "Other system", 35500, 25, "2027-01-29"],
  ["Purdue University", "purdue.edu", "Public", "West Lafayette", "Indiana", "USA", "Suburban", "Common App", 28800, 50, "2027-01-15"],
  ["Delft University of Technology", "tudelft.nl", "Public", "Delft", "South Holland", "Netherlands", "Urban", "Other system", 21500, 40, "2027-01-15"],
  ["Aston University", "aston.ac.uk", "Public", "Birmingham", "England", "UK", "Urban", null, null, null, "2027-01-15"],
  ["Worcester Polytechnic Institute", "wpi.edu", "Private", "Worcester", "Massachusetts", "USA", "Urban", null, null, 50, "2027-01-15"],
  ["University of Western Australia", "uwa.edu.au", "Public", "Perth", "Western Australia", "Australia", "Suburban", "Direct application", 29000, 75, "2027-01-15"],
  ["Howard University", "howard.edu", "Private", "Washington", "District of Columbia", "USA", "Urban", "Common App", 32400, 35, "2027-02-15"],
  ["Trinity College Dublin", "tcd.ie", "Public", "Dublin", "Leinster", "Ireland", "Urban", "Other system", 27000, 35, "2027-02-01"],
  ["University of Delaware", "udel.edu", "Public", "Newark", "Delaware", "USA", "Urban", null, null, 63, "2027-01-15"],
  ["University of Alberta", "ualberta.ca", "Public", "Edmonton", "Alberta", "Canada", "Urban", "Other system", 22000, 58, "2027-03-01"],
  ["University of Waterloo", "uwaterloo.ca", "Public", "Waterloo", "Ontario", "Canada", "Suburban", "Other system", 46000, 53, "2027-02-01"],
  ["McMaster University", "mcmaster.ca", "Public", "Hamilton", "Ontario", "Canada", "Suburban", "Other system", 37000, 58, "2027-02-01"],
  ["University of Leicester", "le.ac.uk", "Public", "Leicester", "England", "UK", "Urban", null, null, null, null],
  ["Queen's University at Kingston", "queensu.ca", "Public", "Kingston", "Ontario", "Canada", "Suburban", "Other system", 41000, 42, "2027-02-01"],
  ["Aberystwyth University", "aber.ac.uk", "Public", "Aberystwyth", "Wales", "UK", "Urban", null, null, null, null],
  ["American University", "american.edu", "Private", "Washington", "District of Columbia", "USA", "Urban", null, null, null, null],
];

const REGION_OF: Record<string, Region> = {
  USA: "USA",
  UK: "UK",
  Canada: "Canada",
  Australia: "Australia",
  Germany: "Europe",
  Netherlands: "Europe",
  Ireland: "Europe",
  Singapore: "Asia",
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* Profiles the live site publishes in full. */
const DETAILS: Record<string, UniversityDetail> = {
  "university-of-sydney": {
    rank: 18,
    aka: ["USyd", "Sydney University"],
    size: 40000,
    opens: "2026-08-01",
    fee: 0,
    degrees: ["Bachelor's", "Master's", "PhD"],
    majors: ["Business", "Engineering", "Nursing", "Design"],
    requirements: [
      { title: "Personal statement", detail: "300 words · about the subject, not about you generally" },
      { title: "Academic reference", detail: "One, from a teacher or counsellor at your current school" },
      { title: "Predicted or final grades", detail: "Official transcript, plus predicted grades if you have not finished school" },
      { title: "English language test", detail: "IELTS 6.5 overall, no component below 6.0" },
    ],
    about: [
      "Australia's oldest university, with a sandstone quadrangle that turns up in every film set at a university, twenty minutes from the harbour.",
      "Admission for international students is by qualification and English test, with offers issued on a rolling basis rather than on a single decision day.",
    ],
  },
};

export const UNIVERSITIES: University[] = ROWS.map(([name, domain, type, city, state, country, setting, system, tuition, accept, deadline]) => {
  const slug = slugify(name);
  return { slug, name, domain, type, city, state, country, region: REGION_OF[country], setting, system, tuition, accept, deadline, detail: DETAILS[slug] };
});

/** The full catalog size on the live site; this page features 50 of them. */
export const CATALOG_SIZE = 224;

export const REGIONS: Region[] = ["USA", "UK", "Canada", "Australia", "Europe", "Asia"];

/* One pastel per region, so a card's colour tells you where it is. */
export const REGION_TONE: Record<Region, { soft: string; strong: string; pc: string }> = {
  USA: { soft: "var(--sky-soft)", strong: "var(--sky)", pc: "rgba(66,190,252,0.28)" },
  UK: { soft: "var(--lilac-soft)", strong: "var(--lilac)", pc: "rgba(169,139,255,0.3)" },
  Canada: { soft: "var(--coral-soft)", strong: "var(--coral)", pc: "rgba(255,107,74,0.22)" },
  Australia: { soft: "var(--sun-soft)", strong: "var(--sun)", pc: "rgba(255,196,0,0.32)" },
  Europe: { soft: "var(--mint-soft)", strong: "var(--mint)", pc: "rgba(52,211,153,0.28)" },
  Asia: { soft: "var(--pink-soft)", strong: "var(--pink)", pc: "rgba(255,143,207,0.3)" },
};

export function getUniversity(slug: string) {
  return UNIVERSITIES.find((u) => u.slug === slug);
}

/** Same region first, then the closest acceptance rate. */
export function similarTo(u: University, n = 4) {
  return UNIVERSITIES.filter((o) => o.slug !== u.slug && o.region === u.region)
    .sort((a, b) => Math.abs((a.accept ?? 50) - (u.accept ?? 50)) - Math.abs((b.accept ?? 50) - (u.accept ?? 50)))
    .slice(0, n);
}

/* --------------------------------------------------------------- Formatting */

export const money = (n: number | null, short = true) =>
  n === null ? "—" : short && n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k` : `$${n.toLocaleString("en-US")}`;

export const percent = (n: number | null) => (n === null ? "—" : `${n}%`);

export const shortDate = (iso: string | null) =>
  iso === null ? "Rolling" : new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export function selectivity(accept: number | null) {
  if (accept === null) return "Not published";
  if (accept < 10) return "Extremely selective";
  if (accept < 25) return "Highly selective";
  if (accept < 50) return "Selective";
  if (accept < 70) return "Moderately selective";
  return "Accessible";
}

export const place = (u: University) => `${u.city}, ${u.country === u.city ? u.country : `${u.state}, ${u.country}`}`;

/* Open awards shown on profiles — from the live site's scholarship feed. */
export const OPEN_SCHOLARSHIPS = [
  { kind: "Need-based", school: "Aston University", name: "Aston Forward Scholarships", amount: "Total of £5,000" },
  { kind: "Need-based", school: "SOAS University of London", name: "The University of London Scholars Programme", amount: "£10,000, spread across the course" },
  { kind: "Merit-based", school: "University of Wolverhampton", name: "WLV Sport Scholarship", amount: "Varies with sporting level" },
  { kind: "Need-based", school: "University of Surrey", name: "Battersea Scholarship", amount: "Up to £16,000" },
  { kind: "Merit-based", school: "University of Leicester", name: "Skylark Scholarship", amount: "Up to £12,000 over three years" },
  { kind: "Need-based", school: "Goldsmiths, University of London", name: "Goldsmiths Equity Awards", amount: "£3,000 per year of study" },
];
