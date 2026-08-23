import type {
  AcademicDashboardState,
  Assignment,
  ClassCheckIn,
  Course,
  Note,
} from "@/types/academic";

/**
 * Fall 2026 schedule — sourced from Galaxy "View My Classes"
 * + Monday route tips from campus navigation spreadsheet.
 */
export const INITIAL_COURSES: Course[] = [
  {
    id: "chem-1311",
    code: "CHEM 1311",
    title: "General Chemistry I — Lecture",
    building: "SCI",
    room: "1.220",
    daysOfWeek: ["M", "W", "F"],
    startTime: "11:00",
    endTime: "11:50",
    routeNotes:
      "Sciences Building. After class: 10-min break · 4–5 min walk to AD via Drive D / pedestrian path east.",
    color: "#38bdf8",
  },
  {
    id: "math-2413",
    code: "MATH 2413",
    title: "Calculus I — Lecture",
    building: "AD",
    room: "2.232",
    daysOfWeek: ["M", "W", "F"],
    startTime: "12:00",
    endTime: "12:50",
    routeNotes:
      "Administration Building, 2nd floor. Short hop from SCI after Chem (~0.2 mi).",
    color: "#a78bfa",
  },
  {
    id: "math-2413-lab",
    code: "MATH 2413",
    title: "Calculus I — Laboratory",
    building: "SCI",
    room: "3.260",
    daysOfWeek: ["M"],
    startTime: "13:00",
    endTime: "14:50",
    routeNotes:
      "Science Building 3rd floor. After Calc lecture in AD, walk back to SCI (~4–5 min via Drive D).",
    color: "#c4b5fd",
  },
  {
    id: "chem-1111-lab",
    code: "CHEM 1111",
    title: "General Chemistry I — Laboratory",
    building: "SLC",
    room: "3.210",
    daysOfWeek: ["W"],
    startTime: "14:00",
    endTime: "15:45",
    routeNotes:
      "Science Learning Center. Wednesday afternoon lab after Calc lecture.",
    color: "#22d3ee",
  },
  {
    id: "rhet-1302",
    code: "RHET 1302",
    title: "Rhetoric — Lecture",
    building: "CB",
    room: "1.102",
    daysOfWeek: ["M", "W"],
    startTime: "16:00",
    endTime: "17:15",
    routeNotes:
      "Classroom Building 1.102. Monday: after Math lab in SCI. Wednesday: after Chem lab in SLC.",
    color: "#34d399",
  },
  {
    id: "ecs-1100",
    code: "ECS 1100",
    title: "Introduction to Engineering & CS — Combined Lec/Lab",
    building: "ECSW",
    room: "1.315",
    daysOfWeek: ["R"],
    startTime: "13:00",
    endTime: "14:20",
    routeNotes:
      "Engineering & Computer Science West. Thursday: ends 10 min before ECS 1210 in ECSS.",
    color: "#fbbf24",
  },
  {
    id: "ecs-1210",
    code: "ECS 1210",
    title: "Introduction to Electrical Engineering — Combined Lec/Lab",
    building: "ECSS",
    room: "2.301",
    daysOfWeek: ["T", "R"],
    startTime: "14:30",
    endTime: "15:45",
    routeNotes:
      "Engineering & Computer Science South. Thursday: short hop from ECSW after ECS 1100.",
    color: "#fb923c",
  },
];

export const INITIAL_CHECK_INS: ClassCheckIn[] = [];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asgn-chem-syllabus",
    courseId: "chem-1311",
    title: "Read syllabus & lab safety module",
    dueDate: "2026-08-28",
    priority: "medium",
    completed: false,
    type: "homework",
  },
  {
    id: "asgn-chem-lab-safety",
    courseId: "chem-1111-lab",
    title: "CHEM 1111 lab safety quiz",
    dueDate: "2026-08-27",
    priority: "high",
    completed: false,
    type: "quiz",
  },
  {
    id: "asgn-math-hw1",
    courseId: "math-2413",
    title: "Limits & continuity problem set 1",
    dueDate: "2026-09-04",
    priority: "high",
    completed: false,
    type: "homework",
  },
  {
    id: "asgn-rhet-diagnostic",
    courseId: "rhet-1302",
    title: "Diagnostic writing sample",
    dueDate: "2026-09-02",
    priority: "medium",
    completed: false,
    type: "homework",
  },
  {
    id: "asgn-ecs-1100-intro",
    courseId: "ecs-1100",
    title: "ECS 1100 intro survey & toolkit setup",
    dueDate: "2026-09-01",
    priority: "low",
    completed: false,
    type: "homework",
  },
  {
    id: "asgn-ecs-1210-intro",
    courseId: "ecs-1210",
    title: "ECS 1210 intro survey & toolkit setup",
    dueDate: "2026-09-01",
    priority: "low",
    completed: false,
    type: "homework",
  },
  {
    id: "asgn-chem-exam1",
    courseId: "chem-1311",
    title: "Exam 1 — Stoichiometry & bonding",
    dueDate: "2026-09-25",
    priority: "high",
    completed: false,
    type: "exam",
  },
  {
    id: "asgn-math-exam1",
    courseId: "math-2413",
    title: "Midterm 1 — Limits & derivatives",
    dueDate: "2026-10-02",
    priority: "high",
    completed: false,
    type: "exam",
  },
  {
    id: "asgn-rhet-essay1",
    courseId: "rhet-1302",
    title: "Rhetorical analysis essay",
    dueDate: "2026-09-18",
    priority: "high",
    completed: false,
    type: "project",
  },
  {
    id: "asgn-ecs-quiz1",
    courseId: "ecs-1210",
    title: "Circuit fundamentals quiz",
    dueDate: "2026-09-12",
    priority: "medium",
    completed: false,
    type: "quiz",
  },
];

export const INITIAL_NOTES: Note[] = [];

export const INITIAL_DASHBOARD_STATE: AcademicDashboardState = {
  courses: INITIAL_COURSES,
  checkIns: INITIAL_CHECK_INS,
  assignments: INITIAL_ASSIGNMENTS,
  notes: INITIAL_NOTES,
};

/** Bumped to v2 so browsers reload the corrected Fall 2026 schedule */
export const STORAGE_KEYS = {
  courses: "utd-dashboard:v2:courses",
  checkIns: "utd-dashboard:v2:checkIns",
  assignments: "utd-dashboard:v2:assignments",
  notes: "utd-dashboard:v2:notes",
} as const;
