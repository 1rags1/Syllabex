import type { Course } from "@/types/academic";

/** Enrich courses with professor info and quick links for the workspace header */
export const COURSE_DETAILS: Record<
  string,
  Pick<Course, "professor" | "professorEmail" | "syllabusUrl" | "portalUrl">
> = {
  "chem-1311": {
    professor: "TBA",
    professorEmail: "",
    syllabusUrl: "https://elearning.utdallas.edu",
    portalUrl: "https://elearning.utdallas.edu",
  },
  "chem-1111-lab": {
    professor: "TBA",
    professorEmail: "",
    syllabusUrl: "https://elearning.utdallas.edu",
    portalUrl: "https://elearning.utdallas.edu",
  },
  "math-2413": {
    professor: "TBA",
    professorEmail: "",
    syllabusUrl: "https://elearning.utdallas.edu",
    portalUrl: "https://elearning.utdallas.edu",
  },
  "math-2413-lab": {
    professor: "TBA",
    professorEmail: "",
    syllabusUrl: "https://elearning.utdallas.edu",
    portalUrl: "https://elearning.utdallas.edu",
  },
  "rhet-1302": {
    professor: "TBA",
    professorEmail: "",
    syllabusUrl: "https://elearning.utdallas.edu",
    portalUrl: "https://elearning.utdallas.edu",
  },
  "ecs-1100": {
    professor: "TBA",
    professorEmail: "",
    syllabusUrl: "https://elearning.utdallas.edu",
    portalUrl: "https://elearning.utdallas.edu",
  },
  "ecs-1210": {
    professor: "TBA",
    professorEmail: "",
    syllabusUrl: "https://elearning.utdallas.edu",
    portalUrl: "https://elearning.utdallas.edu",
  },
};

export function mergeCourseDetails(course: Course): Course {
  const details = COURSE_DETAILS[course.id];
  if (!details) return course;
  return { ...course, ...details };
}
