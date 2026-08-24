"use client";

import {
  AlertTriangle,
  BookOpen,
  Calendar,
  FileText,
  FlaskConical,
} from "lucide-react";
import { useAcademicStore } from "@/context/AcademicContext";
import { useLiveClock } from "@/hooks/useLiveClock";
import { daysUntil } from "@/lib/schedule";
import type { Assignment, AssignmentType, Course } from "@/types/academic";

const TYPE_ICONS: Record<AssignmentType, typeof BookOpen> = {
  exam: FlaskConical,
  quiz: FileText,
  homework: BookOpen,
  project: Calendar,
};

const TYPE_LABELS: Record<AssignmentType, string> = {
  exam: "Exam",
  quiz: "Quiz",
  homework: "Homework",
  project: "Project",
};

function urgencyTone(days: number, type: AssignmentType) {
  if (type === "exam" && days <= 7) return "critical";
  if (days <= 0) return "critical";
  if (days <= 3) return "urgent";
  if (days <= 7) return "soon";
  return "normal";
}

const TONE_STYLES = {
  critical: {
    bar: "bg-rose-500",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    glow: "shadow-[0_0_24px_rgba(244,63,94,0.15)]",
  },
  urgent: {
    bar: "bg-amber-500",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    glow: "",
  },
  soon: {
    bar: "bg-sky-500",
    badge: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    glow: "",
  },
  normal: {
    bar: "bg-zinc-600",
    badge: "border-white/10 bg-white/5 text-zinc-400",
    glow: "",
  },
};

function formatDueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days`;
}

export function ExamRadar() {
  const now = useLiveClock(60_000);
  const { assignments, courses, hydrated } = useAcademicStore();

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const radarItems = assignments
    .filter(
      (a) =>
        !a.completed &&
        (a.type === "exam" ||
          a.type === "quiz" ||
          a.type === "project" ||
          a.priority === "high")
    )
    .map((a) => ({
      assignment: a,
      course: courseMap.get(a.courseId),
      daysLeft: daysUntil(a.dueDate, now),
    }))
    .sort((a, b) => {
      if (a.assignment.type === "exam" && b.assignment.type !== "exam")
        return -1;
      if (b.assignment.type === "exam" && a.assignment.type !== "exam")
        return 1;
      return a.daysLeft - b.daysLeft;
    })
    .slice(0, 6);

  if (!hydrated) {
    return (
      <section className="glass h-64 animate-pulse rounded-2xl" aria-hidden />
    );
  }

  return (
    <section className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <AlertTriangle className="size-4 shrink-0 text-amber-400" />
            Exam & priority radar
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            High-stakes dates and urgent deliverables
          </p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          {radarItems.length} active
        </span>
      </div>

      {radarItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">
          No upcoming exams or urgent items — you&apos;re clear.
        </p>
      ) : (
        <ul className="space-y-3">
          {radarItems.map(({ assignment, course, daysLeft }) => (
            <RadarRow
              key={assignment.id}
              assignment={assignment}
              course={course}
              daysLeft={daysLeft}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RadarRow({
  assignment,
  course,
  daysLeft,
}: {
  assignment: Assignment;
  course?: Course;
  daysLeft: number;
}) {
  const Icon = TYPE_ICONS[assignment.type];
  const tone = urgencyTone(daysLeft, assignment.type);
  const styles = TONE_STYLES[tone];
  const color = course?.color ?? "#71717a";
  const isExam = assignment.type === "exam";

  return (
    <li
      className={`relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.02] ${styles.glow} ${isExam ? "ring-1 ring-rose-500/20" : ""}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
      <div className="flex items-start gap-3 py-3 pl-4 pr-3">
        <div
          className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/5"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="size-4" style={{ color }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles.badge}`}
            >
              {TYPE_LABELS[assignment.type]}
            </span>
            {assignment.priority === "high" && (
              <span className="text-[10px] font-medium text-rose-400">
                High priority
              </span>
            )}
            {isExam && daysLeft <= 14 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400">
                <span className="size-1.5 animate-pulse rounded-full bg-rose-400" />
                High stakes
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium leading-snug text-zinc-100 sm:truncate">
            {assignment.title}
          </p>
          <p className="text-xs text-zinc-500">
            {course?.code ?? "Unknown"} ·{" "}
            {new Date(assignment.dueDate + "T12:00:00").toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" }
            )}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-sm font-semibold tabular-nums ${tone === "critical" ? "text-rose-300" : tone === "urgent" ? "text-amber-300" : "text-zinc-300"}`}
          >
            {formatDueLabel(daysLeft)}
          </p>
        </div>
      </div>
    </li>
  );
}
