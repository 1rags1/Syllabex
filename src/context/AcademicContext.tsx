"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  INITIAL_ASSIGNMENTS,
  INITIAL_CHECK_INS,
  INITIAL_COURSES,
  INITIAL_NOTES,
  STORAGE_KEYS,
} from "@/data/initial-state";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type {
  AcademicDashboardState,
  Assignment,
  ClassCheckIn,
  Course,
  Note,
} from "@/types/academic";

interface AcademicStore extends AcademicDashboardState {
  hydrated: boolean;
  setCourses: (value: Course[] | ((prev: Course[]) => Course[])) => void;
  setCheckIns: (
    value: ClassCheckIn[] | ((prev: ClassCheckIn[]) => ClassCheckIn[])
  ) => void;
  setAssignments: (
    value: Assignment[] | ((prev: Assignment[]) => Assignment[])
  ) => void;
  setNotes: (value: Note[] | ((prev: Note[]) => Note[])) => void;
  resetToDefaults: () => void;
}

const AcademicContext = createContext<AcademicStore | null>(null);

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses, coursesHydrated] = useLocalStorage<Course[]>(
    STORAGE_KEYS.courses,
    INITIAL_COURSES
  );
  const [checkIns, setCheckIns, checkInsHydrated] = useLocalStorage<
    ClassCheckIn[]
  >(STORAGE_KEYS.checkIns, INITIAL_CHECK_INS);
  const [assignments, setAssignments, assignmentsHydrated] = useLocalStorage<
    Assignment[]
  >(STORAGE_KEYS.assignments, INITIAL_ASSIGNMENTS);
  const [notes, setNotes, notesHydrated] = useLocalStorage<Note[]>(
    STORAGE_KEYS.notes,
    INITIAL_NOTES
  );

  const hydrated =
    coursesHydrated &&
    checkInsHydrated &&
    assignmentsHydrated &&
    notesHydrated;

  const resetToDefaults = useCallback(() => {
    setCourses(INITIAL_COURSES);
    setCheckIns(INITIAL_CHECK_INS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setNotes(INITIAL_NOTES);
  }, [setCourses, setCheckIns, setAssignments, setNotes]);

  const value = useMemo<AcademicStore>(
    () => ({
      courses,
      checkIns,
      assignments,
      notes,
      hydrated,
      setCourses,
      setCheckIns,
      setAssignments,
      setNotes,
      resetToDefaults,
    }),
    [
      courses,
      checkIns,
      assignments,
      notes,
      hydrated,
      setCourses,
      setCheckIns,
      setAssignments,
      setNotes,
      resetToDefaults,
    ]
  );

  return (
    <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>
  );
}

export function useAcademicStore(): AcademicStore {
  const ctx = useContext(AcademicContext);
  if (!ctx) {
    throw new Error("useAcademicStore must be used within AcademicProvider");
  }
  return ctx;
}
