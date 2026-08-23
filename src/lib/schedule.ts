import type { Course, DayOfWeek } from "@/types/academic";
import { getRouteTip } from "@/lib/routes";

const DAY_INDEX: Record<DayOfWeek, number> = {
  U: 0,
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
  S: 6,
};

const INDEX_DAY: DayOfWeek[] = ["U", "M", "T", "W", "R", "F", "S"];

export const WEEKDAY_TABS: { key: DayOfWeek; label: string }[] = [
  { key: "M", label: "Mon" },
  { key: "T", label: "Tue" },
  { key: "W", label: "Wed" },
  { key: "R", label: "Thu" },
  { key: "F", label: "Fri" },
];

export function getDayOfWeek(date: Date): DayOfWeek {
  return INDEX_DAY[date.getDay()];
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

/** Date string (YYYY-MM-DD) for a weekday in the same calendar week as `reference`. */
export function getDateForDayInWeek(
  day: DayOfWeek,
  reference: Date = new Date()
): string {
  const target = DAY_INDEX[day];
  const current = reference.getDay();
  const diff = target - current;
  const d = new Date(reference);
  d.setDate(d.getDate() + diff);
  return toDateKey(d);
}

export function getCoursesForDay(
  courses: Course[],
  day: DayOfWeek
): Course[] {
  return courses
    .filter((c) => c.daysOfWeek.includes(day))
    .sort(
      (a, b) =>
        parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );
}

export function getMinutesBetweenTimes(from: string, to: string): number {
  return parseTimeToMinutes(to) - parseTimeToMinutes(from);
}

export function getNowMinutes(now: Date): number {
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

export type CampusStatus =
  | {
      type: "in_class";
      course: Course;
      minutesRemaining: number;
    }
  | {
      type: "transitioning";
      from: Course;
      to: Course;
      minutesUntilNext: number;
      breakMinutes: number;
      routeTip: string;
    }
  | {
      type: "free";
      nextCourse?: Course;
      minutesUntilNext?: number;
    };

const TRANSITION_WINDOW_MINUTES = 20;

export function getCampusStatus(
  courses: Course[],
  now: Date = new Date()
): CampusStatus {
  const today = getDayOfWeek(now);
  const todayCourses = getCoursesForDay(courses, today);
  const nowMin = getNowMinutes(now);

  if (todayCourses.length === 0) {
    return { type: "free" };
  }

  for (let i = 0; i < todayCourses.length; i++) {
    const course = todayCourses[i];
    const start = parseTimeToMinutes(course.startTime);
    const end = parseTimeToMinutes(course.endTime);

    if (nowMin >= start && nowMin < end) {
      return {
        type: "in_class",
        course,
        minutesRemaining: end - nowMin,
      };
    }

    const next = todayCourses[i + 1];
    if (next && nowMin >= end && nowMin < parseTimeToMinutes(next.startTime)) {
      const breakMinutes = getMinutesBetweenTimes(
        course.endTime,
        next.startTime
      );
      const minutesUntilNext =
        parseTimeToMinutes(next.startTime) - nowMin;

      if (breakMinutes <= TRANSITION_WINDOW_MINUTES) {
        return {
          type: "transitioning",
          from: course,
          to: next,
          minutesUntilNext,
          breakMinutes,
          routeTip: getRouteTip(course.building, next.building),
        };
      }

      return {
        type: "free",
        nextCourse: next,
        minutesUntilNext,
      };
    }
  }

  const first = todayCourses[0];
  const last = todayCourses[todayCourses.length - 1];
  const firstStart = parseTimeToMinutes(first.startTime);
  const lastEnd = parseTimeToMinutes(last.endTime);

  if (nowMin < firstStart) {
    return {
      type: "free",
      nextCourse: first,
      minutesUntilNext: firstStart - nowMin,
    };
  }

  if (nowMin >= lastEnd) {
    return { type: "free" };
  }

  for (let i = 0; i < todayCourses.length - 1; i++) {
    const curr = todayCourses[i];
    const next = todayCourses[i + 1];
    const gapStart = parseTimeToMinutes(curr.endTime);
    const gapEnd = parseTimeToMinutes(next.startTime);

    if (nowMin >= gapStart && nowMin < gapEnd) {
      return {
        type: "free",
        nextCourse: next,
        minutesUntilNext: gapEnd - nowMin,
      };
    }
  }

  return { type: "free" };
}

export type NextUpInfo =
  | {
      kind: "current";
      course: Course;
      label: string;
      minutesRemaining: number;
      routeTip?: string;
    }
  | {
      kind: "upcoming";
      course: Course;
      label: string;
      minutesUntil: number;
      routeTip?: string;
      breakMinutes?: number;
    }
  | { kind: "done"; label: string };

export function getNextUpInfo(
  courses: Course[],
  status: CampusStatus,
  now: Date = new Date()
): NextUpInfo {
  const today = getDayOfWeek(now);
  const todayCourses = getCoursesForDay(courses, today);

  if (status.type === "in_class") {
    const idx = todayCourses.findIndex((c) => c.id === status.course.id);
    const next = todayCourses[idx + 1];
    if (next) {
      const breakMinutes = getMinutesBetweenTimes(
        status.course.endTime,
        next.startTime
      );
      return {
        kind: "upcoming",
        course: next,
        label: "Up next after this class",
        minutesUntil: status.minutesRemaining + breakMinutes,
        breakMinutes,
        routeTip: getRouteTip(status.course.building, next.building),
      };
    }
    return {
      kind: "current",
      course: status.course,
      label: "In session now",
      minutesRemaining: status.minutesRemaining,
    };
  }

  if (status.type === "transitioning") {
    return {
      kind: "upcoming",
      course: status.to,
      label: "Head to class",
      minutesUntil: status.minutesUntilNext,
      breakMinutes: status.breakMinutes,
      routeTip: status.routeTip,
    };
  }

  if (status.nextCourse && status.minutesUntilNext !== undefined) {
    const idx = todayCourses.findIndex((c) => c.id === status.nextCourse!.id);
    const prev = idx > 0 ? todayCourses[idx - 1] : undefined;
    const breakMinutes = prev
      ? getMinutesBetweenTimes(prev.endTime, status.nextCourse.startTime)
      : undefined;
    const routeTip =
      prev && breakMinutes !== undefined && breakMinutes <= TRANSITION_WINDOW_MINUTES
        ? getRouteTip(prev.building, status.nextCourse.building)
        : undefined;

    return {
      kind: "upcoming",
      course: status.nextCourse,
      label: "Next class",
      minutesUntil: status.minutesUntilNext,
      breakMinutes,
      routeTip,
    };
  }

  return { kind: "done", label: "No more classes today" };
}

export function daysUntil(dueDate: string, now: Date = new Date()): number {
  const due = new Date(dueDate + "T23:59:59");
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const dueStart = new Date(due);
  dueStart.setHours(0, 0, 0, 0);
  return Math.ceil(
    (dueStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function defaultWeekday(now: Date = new Date()): DayOfWeek {
  const day = getDayOfWeek(now);
  if (day === "S" || day === "U") return "M";
  return day;
}
