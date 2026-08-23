import { INITIAL_COURSES } from "@/data/initial-state";

const COURSE_CONTEXT = INITIAL_COURSES.map(
  (c) =>
    `- ${c.code} (${c.id}): ${c.title} · ${c.daysOfWeek.join("")} ${c.startTime}–${c.endTime} · ${c.building}`
).join("\n");

export const GEMINI_MODEL = "gemini-3.6-flash";

export const SYSTEM_INSTRUCTION = `You are an elite STEM and Electrical Engineering academic tutor embedded in a personal dashboard for a UT Dallas student in Fall 2026.

Your student's active course load:
${COURSE_CONTEXT}

Core subjects you specialize in:
- Calculus I (limits, derivatives, integrals, applications) — lecture + Monday lab
- General Chemistry I lecture (CHEM 1311) and Chemistry lab (CHEM 1111)
- Introduction to Engineering & CS (ECS 1100) and Introduction to Electrical Engineering (ECS 1210)
- Rhetoric (argumentation, essays, rhetorical analysis)

Guidelines:
- Be precise, encouraging, and exam-focused. Use LaTeX-style notation inline when helpful (e.g. $\\lim_{x \\to 0}$).
- Tie explanations to this specific schedule and workload when relevant.
- For JSON tasks, return ONLY valid JSON matching the requested schema — no markdown fences or commentary.
- When unsure about a course mapping, pick the best match from the course IDs provided.
- Dates must be ISO format YYYY-MM-DD.
- Assignment priority: "high" for exams and major projects due within 7 days, "medium" for standard homework, "low" for optional readings.
- Assignment type must be one of: exam, quiz, homework, project.`;

export const SYNTHESIZE_PROMPT = (courseCode: string, content: string) =>
  `Synthesize these raw lecture notes for ${courseCode}. Extract:
1. A exactly 3-sentence summary (concise, exam-oriented).
2. Exactly 5 bulleted key concepts (short phrases).
3. Exactly 3 flashcard-style quiz questions with clear answers.

Raw notes:
---
${content}
---`;

export const INGEST_PROMPT = (
  courses: { id: string; code: string; title: string }[],
  text: string
) => {
  const courseList = courses
    .map((c) => `- id: "${c.id}" | code: ${c.code} | title: ${c.title}`)
    .join("\n");

  return `Parse the following syllabus, announcement, or assignment text into structured assignments for the student's dashboard.

Available courses (use exact courseId):
${courseList}

Rules:
- Extract every homework, quiz, exam, project, or major deliverable with a due date.
- If no year is given, assume Fall 2026 (Aug–Dec 2026).
- If course is ambiguous, infer from context (e.g. "Calc" → math-2413, "Chem" → chem-1311).
- Skip items without a determinable due date unless clearly high-priority exams (estimate from context if needed).

Text to parse:
---
${text}
---`;
};

export const SYNTHESIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "Exactly 3 sentences summarizing the lecture",
    },
    keyConcepts: {
      type: "array",
      items: { type: "string" },
      description: "Exactly 5 key concepts",
    },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
      description: "Exactly 3 flashcard Q&A pairs",
    },
  },
  required: ["summary", "keyConcepts", "flashcards"],
};

export const INGEST_JSON_SCHEMA = {
  type: "object",
  properties: {
    assignments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          courseId: { type: "string" },
          title: { type: "string" },
          dueDate: { type: "string", description: "YYYY-MM-DD" },
          priority: {
            type: "string",
            enum: ["high", "medium", "low"],
          },
          type: {
            type: "string",
            enum: ["exam", "quiz", "homework", "project"],
          },
        },
        required: ["courseId", "title", "dueDate", "priority", "type"],
      },
    },
  },
  required: ["assignments"],
};
