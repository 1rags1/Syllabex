"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  MapPin,
  Navigation,
  Radio,
} from "lucide-react";
import { useLiveClock } from "@/hooks/useLiveClock";
import {
  formatClockTime,
  formatDuration,
  formatLongDate,
  formatTimeDisplay,
  getCampusStatus,
  getNextUpInfo,
  type CampusStatus,
} from "@/lib/schedule";
import type { Course } from "@/types/academic";

function StatusBadge({ status }: { status: CampusStatus }) {
  if (status.type === "in_class") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
        </span>
        In class · {status.course.code}
      </span>
    );
  }

  if (status.type === "transitioning") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
        <Navigation className="size-3.5" />
        Transitioning · {status.from.building} → {status.to.building}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-medium text-zinc-300">
      <Radio className="size-3.5 text-zinc-400" />
      Free
    </span>
  );
}

function NextUpCard({
  nextUp,
  courses,
}: {
  nextUp: ReturnType<typeof getNextUpInfo>;
  courses: Course[];
}) {
  if (nextUp.kind === "done") {
    return (
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Next up
        </p>
        <p className="mt-2 text-lg font-medium text-zinc-300">{nextUp.label}</p>
        <p className="mt-1 text-sm text-zinc-500">
          Enjoy the rest of your day — you&apos;ve cleared today&apos;s schedule.
        </p>
      </div>
    );
  }

  const course = nextUp.course;
  const color = course.color ?? "#a1a1aa";

  const timeLabel =
    nextUp.kind === "current"
      ? `Ends in ${formatDuration(nextUp.minutesRemaining)}`
      : `Starts in ${formatDuration(nextUp.minutesUntil)}`;

  return (
    <div
      className="glass relative overflow-hidden rounded-2xl p-5"
      style={{
        boxShadow: `0 0 0 1px rgba(0,0,0,0.2), 0 8px 32px rgba(0,0,0,0.35), inset 3px 0 0 ${color}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            {nextUp.label}
          </p>
          <p className="mt-1 font-mono text-sm font-medium" style={{ color }}>
            <Link href={`/courses/${course.id}`} className="hover:opacity-80">
              {course.code}
            </Link>
          </p>
          <h2 className="mt-0.5 text-xl font-semibold text-zinc-50">
            <Link
              href={`/courses/${course.id}`}
              className="transition-colors hover:text-white"
            >
              {course.title}
            </Link>
          </h2>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right">
          <p className="text-lg font-semibold tabular-nums text-zinc-100">
            {timeLabel}
          </p>
          <p className="text-[11px] text-zinc-500">
            {formatTimeDisplay(course.startTime)} –{" "}
            {formatTimeDisplay(course.endTime)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-3.5 text-zinc-500" />
          {course.building}
          {course.room !== "TBA" ? ` ${course.room}` : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5 text-zinc-500" />
          {formatTimeDisplay(course.startTime)}
        </span>
      </div>

      {nextUp.kind === "upcoming" && nextUp.breakMinutes !== undefined && (
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <p className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <Navigation className="size-3.5 text-amber-400" />
            {nextUp.breakMinutes}-minute break
            {nextUp.routeTip && (
              <>
                <ArrowRight className="size-3 text-zinc-600" />
                <span className="font-normal text-zinc-400">
                  {nextUp.routeTip}
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {nextUp.kind === "current" && (
        <p className="mt-4 text-xs text-zinc-500">
          Focus time — {courses.filter((c) => c.id !== course.id).length} other
          courses on your roster today.
        </p>
      )}
    </div>
  );
}

export function HeroSection({ courses }: { courses: Course[] }) {
  const now = useLiveClock();
  const status = getCampusStatus(courses, now);
  const nextUp = getNextUpInfo(courses, status, now);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <StatusBadge status={status} />
          <div>
            <p className="text-sm font-medium text-zinc-400">
              {formatLongDate(now)}
            </p>
            <p className="mt-1 font-mono text-4xl font-light tabular-nums tracking-tight text-zinc-50 sm:text-5xl">
              {formatClockTime(now)}
            </p>
          </div>
        </div>

        <div className="glass rounded-xl px-4 py-3 text-right">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">
            Fall 2026
          </p>
          <p className="text-sm font-medium text-zinc-200">UT Dallas</p>
          <p className="text-xs text-zinc-500">Today command center</p>
        </div>
      </div>

      <NextUpCard nextUp={nextUp} courses={courses} />
    </section>
  );
}
