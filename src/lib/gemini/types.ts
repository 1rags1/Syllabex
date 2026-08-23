import type { AssignmentPriority, AssignmentType } from "@/types/academic";

export interface NoteSynthesisResult {
  summary: string;
  keyConcepts: string[];
  flashcards: { question: string; answer: string }[];
}

export interface IngestAssignmentDraft {
  courseId: string;
  title: string;
  dueDate: string;
  priority: AssignmentPriority;
  type: AssignmentType;
}

export interface IngestResult {
  assignments: IngestAssignmentDraft[];
}

export type GeminiMode = "chat" | "synthesize" | "ingest";

export interface GeminiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GeminiRequestBody {
  mode: GeminiMode;
  stream?: boolean;
  prompt?: string;
  messages?: GeminiChatMessage[];
  content?: string;
  courseId?: string;
  courseCode?: string;
  courses?: { id: string; code: string; title: string }[];
}

export function parseSynthesisResult(raw: unknown): NoteSynthesisResult {
  const data = raw as Record<string, unknown>;
  return {
    summary: String(data.summary ?? ""),
    keyConcepts: Array.isArray(data.keyConcepts)
      ? data.keyConcepts.map(String).slice(0, 5)
      : [],
    flashcards: Array.isArray(data.flashcards)
      ? data.flashcards
          .map((f) => {
            const card = f as Record<string, string>;
            return {
              question: String(card.question ?? ""),
              answer: String(card.answer ?? ""),
            };
          })
          .slice(0, 3)
      : [],
  };
}

export function parseIngestResult(raw: unknown): IngestResult {
  const data = raw as Record<string, unknown>;
  const assignments = Array.isArray(data.assignments)
    ? data.assignments.map((a) => {
        const item = a as Record<string, string>;
        return {
          courseId: String(item.courseId ?? ""),
          title: String(item.title ?? ""),
          dueDate: String(item.dueDate ?? ""),
          priority: (item.priority ?? "medium") as AssignmentPriority,
          type: (item.type ?? "homework") as AssignmentType,
        };
      })
    : [];
  return { assignments };
}
