export type DayOfWeek = "M" | "T" | "W" | "R" | "F" | "S" | "U";

export type AssignmentPriority = "high" | "medium" | "low";

export type AssignmentType = "exam" | "quiz" | "homework" | "project";

export interface Course {
  id: string;
  code: string;
  title: string;
  building: string;
  room: string;
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
  routeNotes: string;
  color?: string;
  professor?: string;
  professorEmail?: string;
  syllabusUrl?: string;
  portalUrl?: string;
}

export interface ClassCheckIn {
  id: string;
  courseId: string;
  date: string;
  attended: boolean;
  /** Mood / energy rating on a 1–5 scale */
  mood: number;
  energyRating: number;
  quickNotes: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  priority: AssignmentPriority;
  completed: boolean;
  type: AssignmentType;
}

export interface NoteSynthesis {
  summary: string;
  keyConcepts: string[];
  flashcards: { question: string; answer: string }[];
  synthesizedAt: string;
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  /** Markdown lecture notes */
  content: string;
  coreTopicLearned: string;
  keyFormulasConcepts: string;
  questionsToAsk: string;
  synthesis?: NoteSynthesis;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicDashboardState {
  courses: Course[];
  checkIns: ClassCheckIn[];
  assignments: Assignment[];
  notes: Note[];
}
