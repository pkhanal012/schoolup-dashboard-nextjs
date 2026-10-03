import { BookOpenText, GraduationCap, HandCoins, Landmark, MessagesSquare, Plane, type LucideIcon } from "lucide-react";

/*
 * Interview prep: the question banks, the interviewers, and how a session is
 * put together. There are no interview dates here on purpose — a student picks
 * the kind of interview they are facing and starts talking. Readiness comes
 * from what they have practised, not from a countdown.
 *
 * Every question carries its counsellor checklist: the points a good answer
 * names. Each point lists a few words that show it was covered, which the
 * on-device marker uses when the coach (the /api/interview route) is
 * unreachable.
 */

export type Point = { label: string; keys: string[] };
export type Question = { id: string; text: string; points: Point[] };
export type Section = { id: string; name: string; score: number | null; questions: Question[] };

export type Track = {
  id: string;
  name: string;
  blurb: string;
  /** Who is across the table: shown under the interviewer's name. */
  role: string;
  icon: LucideIcon;
  /** Sticker colours: the card tint, its dot, and its dot-grid. */
  soft: string;
  dot: string;
  pattern: string;
  sticker: string;
  sections: Section[];
};

export type Length = 3 | 5 | 8;
export type Toughness = "gentle" | "standard" | "tough";
export type AnswerMode = "speak" | "type";
export type Prefs = { length: Length; toughness: Toughness; mode: AnswerMode };

export const DEFAULT_PREFS: Prefs = { length: 5, toughness: "standard", mode: "speak" };

export const INTERVIEWERS: Record<Toughness, { name: string; initials: string; vibe: string; rate: number }> = {
  gentle: { name: "Maya", initials: "MA", vibe: "Warm and patient. Lets you finish, then nudges.", rate: 0.95 },
  standard: { name: "Daniel", initials: "DA", vibe: "Polite and brisk, like most real interviews.", rate: 1.02 },
  tough: { name: "Ruth", initials: "RU", vibe: "Blunt. Vague answers get marked down hard.", rate: 1.1 },
};

/* "Label|key,key" keeps the bank readable. */
function q(id: string, text: string, ...points: string[]): Question {
  return {
    id,
    text,
    points: points.map((p) => {
      const [label, keys = ""] = p.split("|");
      return { label, keys: keys.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean) };
    }),
  };
}

export const TRACKS: Track[] = [
  {
    id: "f1",
    name: "US F-1 visa",
    blurb: "The consular interview: study plans, money and why you'll come home.",
    role: "Consular officer",
    icon: Plane,
    soft: "bg-sky-soft",
    dot: "bg-sky",
    pattern: "[--pc:rgba(66,190,252,0.22)] dark:[--pc:rgba(66,190,252,0.1)]",
    sticker: "/images/stickers/admission.webp",
    sections: [
      {
        id: "study",
        name: "Study plans",
        score: 82,
        questions: [
          q("f1-1", "Why do you want to study in the United States?",
            "The programme and university, by name|university,program,programme,master,degree,course,ms ",
            "A reason that is specific to the US|united states,us ,america,research,industry,curriculum",
            "How it builds on what you've already done|bachelor,studied,worked,experience,background,undergraduate"),
          q("f1-2", "Why this university, and not one closer to home?",
            "Something specific about this university|lab,professor,faculty,curriculum,ranking,course,research",
            "An honest comparison with the alternatives|home,nepal,other,compared,instead,closer",
            "How it serves your career goal|career,goal,job,plan,future"),
        ],
      },
      {
        id: "uni",
        name: "University choice",
        score: 74,
        questions: [
          q("f1-3", "How many universities did you apply to, and which ones admitted you?",
            "How many you applied to|applied,applications,three,four,five,six,2,3,4,5,6",
            "Which ones made an offer|admitted,accepted,offer,admit",
            "Why you chose this one|chose,decided,because,picked"),
        ],
      },
      {
        id: "academic",
        name: "Academic background",
        score: 66,
        questions: [
          q("f1-4", "Tell me about your undergraduate studies.",
            "Your degree and where you studied|bachelor,degree,university,college,engineering,b.e,bsc",
            "Your result, as a figure|gpa,grade,percent,cgpa,distinction,first class",
            "A project that leads to this programme|project,thesis,research,internship"),
        ],
      },
      {
        id: "finance",
        name: "Financial support",
        score: 48,
        questions: [
          q("f1-5", "Who is paying for your education?",
            "Who sponsors you|father,mother,parents,sponsor,uncle,myself,family",
            "Their job and income|business,salary,income,works,job,earn,farm,company",
            "An amount, not just 'enough'|$,usd,dollars,lakh,thousand,total,per year"),
          q("f1-6", "How much will your first year cost, and where is that money today?",
            "The total first-year cost, as a number|$,usd,dollars,thousand,cost,total",
            "Where the money sits|bank,account,savings,deposit,loan,fixed",
            "Any scholarship or assistantship already awarded|scholarship,assistantship,funding,award,waiver"),
        ],
      },
      {
        id: "post",
        name: "Post-study plans",
        score: 55,
        questions: [
          q("f1-7", "What will you do after you graduate?",
            "A specific role you're aiming for|engineer,job,role,position,work as,analyst,manager",
            "Your plan to return home|return,back,nepal,home,country",
            "What ties you there|family,property,offer,business,parents,company"),
          q("f1-8", "Do you have any relatives in the United States?",
            "A straight yes or no|yes,no,relative,cousin,uncle,aunt,none",
            "That your plans don't depend on them|independent,my own,not depend,only,visit"),
        ],
      },
    ],
  },
  {
    id: "uk",
    name: "UK credibility",
    blurb: "The university's pre-CAS call: why the UK, this course, and how you'll pay.",
    role: "Admissions compliance officer",
    icon: Landmark,
    soft: "bg-lilac-soft",
    dot: "bg-lilac",
    pattern: "[--pc:rgba(169,139,255,0.25)] dark:[--pc:rgba(169,139,255,0.12)]",
    sticker: "/images/stickers/university.webp",
    sections: [
      {
        id: "intro",
        name: "Introduction",
        score: null,
        questions: [
          q("uk-1", "Could you introduce yourself?",
            "Name, home city and country|name,from,city,kathmandu,nepal,country",
            "Your most recent qualification and when you finished|graduated,completed,finished,bachelor,degree,20",
            "The course and university you're joining|course,university,msc,master,programme"),
        ],
      },
      {
        id: "whyuk",
        name: "Why the UK",
        score: null,
        questions: [
          q("uk-2", "Why have you chosen to study in the UK rather than another country?",
            "A reason specific to the UK|uk,united kingdom,britain,one-year,one year,reputation",
            "A comparison with at least one alternative|australia,canada,usa,us ,germany,compared,instead",
            "How it fits your plans|career,goal,plan,future"),
        ],
      },
      {
        id: "course",
        name: "Why this course",
        score: null,
        questions: [
          q("uk-3", "Why this course, and what modules interest you most?",
            "At least one module by name|module,unit,dissertation,analytics,machine learning,management",
            "How it connects to your background|bachelor,studied,worked,experience,background",
            "What you'll be able to do afterwards|career,skills,job,role"),
        ],
      },
      {
        id: "money",
        name: "Finances",
        score: null,
        questions: [
          q("uk-4", "How will you fund your tuition and living costs?",
            "The tuition fee and living costs as figures|£,pound,gbp,thousand,tuition,living",
            "Who is funding you|father,mother,parents,sponsor,loan,myself",
            "That the funds are already in place|bank,account,deposit,28 days,statement,savings"),
        ],
      },
      {
        id: "career",
        name: "Career plan",
        score: null,
        questions: [
          q("uk-5", "What are your plans once the course ends?",
            "A specific role or employer type|role,job,engineer,analyst,company,position",
            "Where you'll work, and why there|nepal,home,return,back,market",
            "How this degree gets you there|degree,course,skills,qualification"),
        ],
      },
    ],
  },
  {
    id: "ielts",
    name: "IELTS / PTE speaking",
    blurb: "Familiar topics, a two-minute long turn, then the harder discussion.",
    role: "Speaking examiner",
    icon: MessagesSquare,
    soft: "bg-mint-soft",
    dot: "bg-mint",
    pattern: "[--pc:rgba(52,211,153,0.28)] dark:[--pc:rgba(52,211,153,0.12)]",
    sticker: "/images/stickers/writing.webp",
    sections: [
      {
        id: "p1",
        name: "Part 1 · familiar topics",
        score: 80,
        questions: [
          q("ie-1", "Let's talk about your hometown. What do you like most about it?",
            "A direct answer in the first sentence|like,love,enjoy,favourite,best",
            "A reason, extended past one line|because,since,as,the reason",
            "A concrete example|for example,for instance,such as,like when"),
          q("ie-2", "Do you prefer studying in the morning or at night?",
            "A clear preference|prefer,morning,night,evening,rather",
            "Why|because,since,as,focus,quiet",
            "Some range: a contrast or condition|however,although,but,unless,depends"),
        ],
      },
      {
        id: "p2",
        name: "Part 2 · long turn",
        score: 70,
        questions: [
          q("ie-3", "Describe a teacher who influenced you. Say who they were, what they taught, and why they mattered.",
            "Who they were|teacher,sir,miss,professor,name,was",
            "What they taught and how|taught,subject,class,lessons,maths,science,english",
            "A specific moment or story|once,remember,one day,time when",
            "Why they mattered to you|because,changed,influenced,inspired,still"),
        ],
      },
      {
        id: "p3",
        name: "Part 3 · discussion",
        score: 64,
        questions: [
          q("ie-4", "Should university education be free for everyone?",
            "A clear position|should,shouldn't,believe,think,agree,disagree",
            "Reasons on more than one side|however,on the other hand,although,whereas",
            "A real-world example|for example,for instance,such as,countries,germany,nordic"),
          q("ie-5", "How has technology changed the way young people learn?",
            "A general claim|technology,online,internet,phone,ai",
            "A specific example|for example,for instance,such as,youtube,apps",
            "A drawback or limit|however,but,although,distraction,downside"),
        ],
      },
    ],
  },
  {
    id: "college",
    name: "College admissions",
    blurb: "Undergraduate interviews: you, your story, and 'why us'.",
    role: "Alumni interviewer",
    icon: GraduationCap,
    soft: "bg-sun-soft",
    dot: "bg-sun",
    pattern: "[--pc:rgba(255,196,0,0.3)] dark:[--pc:rgba(255,210,63,0.1)]",
    sticker: "/images/stickers/interview.webp",
    sections: [
      {
        id: "you",
        name: "About you",
        score: null,
        questions: [
          q("co-1", "Tell me about yourself.",
            "One thread that ties the answer together|passion,interest,always,love,curious",
            "Something you've actually done|built,started,led,won,organised,made",
            "Where you want to go next|want,hope,plan,goal,study"),
          q("co-2", "Tell me about a challenge you overcame.",
            "The situation, briefly|when,situation,problem,challenge",
            "What you did, specifically|i decided,i started,i asked,i built,i practised",
            "What changed, and what you learned|learned,result,now,realised,changed"),
        ],
      },
      {
        id: "whyus",
        name: "Why us",
        score: null,
        questions: [
          q("co-3", "Why do you want to come to this university?",
            "A detail you couldn't say about any other school|program,professor,club,lab,course,curriculum",
            "How you'd use it|i would,i'd,join,take,contribute",
            "What you'd bring to campus|bring,contribute,community,share"),
        ],
      },
      {
        id: "close",
        name: "Your questions",
        score: null,
        questions: [
          q("co-4", "Do you have any questions for me?",
            "A genuine question, not one the website answers|what,how,was,did you",
            "Interest in the interviewer's own experience|you,your experience,when you"),
        ],
      },
    ],
  },
  {
    id: "scholarship",
    name: "Scholarship panel",
    blurb: "Merit and need-based committees: impact, leadership and giving back.",
    role: "Scholarship committee",
    icon: HandCoins,
    soft: "bg-pink-soft",
    dot: "bg-pink",
    pattern: "[--pc:rgba(255,143,207,0.3)] dark:[--pc:rgba(255,143,207,0.12)]",
    sticker: "/images/stickers/progress.webp",
    sections: [
      {
        id: "merit",
        name: "Merit & impact",
        score: null,
        questions: [
          q("sc-1", "Why should we choose you for this scholarship?",
            "Achievements, with numbers|rank,top,gpa,award,percent,first",
            "Impact on other people|helped,community,students,taught,volunteer",
            "Why this award, specifically|this scholarship,foundation,mission,values"),
          q("sc-2", "Describe a time you led others.",
            "The group and the goal|team,group,club,project,event",
            "Your role in it|i led,i organised,i coordinated,i started",
            "The outcome|result,raised,grew,won,completed"),
        ],
      },
      {
        id: "need",
        name: "Need & plans",
        score: null,
        questions: [
          q("sc-3", "How would this scholarship change your plans?",
            "Your financial situation, plainly|afford,cost,family,income,loan",
            "What becomes possible with it|able,possible,focus,attend,study",
            "How you'll give back|give back,return,help,community,mentor"),
        ],
      },
    ],
  },
  {
    id: "grad",
    name: "Graduate & faculty call",
    blurb: "A call with a professor: research interests, fit and your past work.",
    role: "Prospective supervisor",
    icon: BookOpenText,
    soft: "bg-coral-soft",
    dot: "bg-coral",
    pattern: "[--pc:rgba(255,107,74,0.22)] dark:[--pc:rgba(255,107,74,0.1)]",
    sticker: "/images/stickers/files.webp",
    sections: [
      {
        id: "research",
        name: "Research interests",
        score: 40,
        questions: [
          q("gr-1", "What research problem do you want to work on?",
            "A specific problem, not a field|problem,question,how,whether,predict,improve",
            "Why it matters|because,important,impact,matters,cost",
            "How it fits this lab's work|your lab,your work,your paper,group,professor"),
          q("gr-2", "Which of our recent papers interested you, and why?",
            "A paper, named or clearly described|paper,published,study,your work",
            "A detail from it|method,result,dataset,model,finding",
            "A follow-up idea of your own|extend,next,could,would like,idea"),
        ],
      },
      {
        id: "project",
        name: "Past project",
        score: 28,
        questions: [
          q("gr-3", "Walk me through your most substantial project.",
            "The goal|goal,aim,wanted,problem",
            "Your own contribution|i built,i designed,i wrote,i implemented,my part",
            "A result, with a number|accuracy,percent,faster,improved,result",
            "What you'd do differently|differently,next time,learned,would change"),
        ],
      },
    ],
  },
];

export const trackById = (id: string) => TRACKS.find((t) => t.id === id);

/** A track's readiness: the mean of its scored sections, or null before any. */
export function readinessOf(track: Track): number | null {
  const scored = track.sections.filter((s) => s.score !== null);
  if (!scored.length) return null;
  return Math.round(scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length);
}

export function weakestOf(track: Track): Section | null {
  const scored = track.sections.filter((s) => s.score !== null);
  if (!scored.length) return null;
  return scored.reduce((a, b) => ((a.score ?? 0) <= (b.score ?? 0) ? a : b));
}

export const questionCount = (track: Track) => track.sections.reduce((n, s) => n + s.questions.length, 0);

export type SessionQuestion = Question & { section: string };

/**
 * The questions for one session. One section: its questions in order. Mixed:
 * round-robin across sections, weakest (and never-practised) first, so a short
 * session still lands on what needs it most.
 */
export function buildSession(track: Track, length: number, sectionId?: string): SessionQuestion[] {
  if (sectionId) {
    const section = track.sections.find((s) => s.id === sectionId);
    if (section) return section.questions.slice(0, length).map((x) => ({ ...x, section: section.name }));
  }
  const order = [...track.sections].sort((a, b) => (a.score ?? -1) - (b.score ?? -1));
  const out: SessionQuestion[] = [];
  for (let round = 0; out.length < length; round++) {
    let added = false;
    for (const s of order) {
      const question = s.questions[round];
      if (!question) continue;
      out.push({ ...question, section: s.name });
      added = true;
      if (out.length === length) break;
    }
    if (!added) break;
  }
  return out;
}

/* ------------------------------------------------------------------ Marking */

export type Mark = {
  score: number;
  covered: boolean[];
  tip: string;
};

export type Review = {
  overall: number;
  summary: string;
  marks: Mark[];
  /** True when the coach couldn't be reached and this device marked the answers. */
  local: boolean;
};

export type Answer = { question: SessionQuestion; text: string; seconds: number; skipped: boolean };

/**
 * The fallback marker: a point counts as covered when the answer uses one of
 * its words. Crude, so the review says plainly that it was marked this way.
 */
export function markLocally(answers: Answer[], toughness: Toughness): Review {
  const marks = answers.map(({ question, text, skipped }): Mark => {
    if (skipped || !text.trim()) {
      return { score: 0, covered: question.points.map(() => false), tip: "Skipped — try it again in your next session." };
    }
    const lower = ` ${text.toLowerCase()} `;
    const covered = question.points.map((p) => p.keys.some((k) => lower.includes(k)));
    const hit = covered.filter(Boolean).length / question.points.length;
    const words = text.trim().split(/\s+/).length;
    // Answers under ~25 words rarely hold up; very long ones ramble.
    const lengthFactor = words < 12 ? 0.55 : words < 25 ? 0.8 : words > 220 ? 0.9 : 1;
    const strict = toughness === "tough" ? 0.9 : toughness === "gentle" ? 1.05 : 1;
    const score = Math.max(5, Math.min(98, Math.round((22 + 72 * hit) * lengthFactor * strict)));
    const missed = question.points.find((_, i) => !covered[i]);
    return {
      score,
      covered,
      tip: missed ? `Add this next time: ${missed.label.toLowerCase()}.` : "Every point covered — now say it in fewer words.",
    };
  });
  const answered = marks.filter((_, i) => !answers[i].skipped);
  const overall = answered.length ? Math.round(answered.reduce((s, m) => s + m.score, 0) / answered.length) : 0;
  return {
    overall,
    summary: answered.length
      ? "Marked on this device against each question's checklist. The coach gives fuller feedback when it's connected."
      : "Nothing was answered this time.",
    marks,
    local: true,
  };
}

export const scoreTone = (score: number) => (score >= 75 ? "good" : score >= 55 ? "fair" : "weak");
