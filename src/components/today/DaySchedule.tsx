"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  MapPin,
  StickyNote,
} from "lucide-react";
import { useAcademicStore } from "@/context/AcademicContext";
import {
  defaultWeekday,
  formatTimeDisplay,
  getCoursesForDay,
  getDateForDayInWeek,
  WEEKDAY_TABS,
} from "@/lib/schedule";
import type { ClassCheckIn, Course, DayOfWeek } from "@/types/academic";
import { useLiveClock } from "@/hooks/useLiveClock";

function ClassSessionCard({
  course,
  sessionDate,
  checkIn,
  onToggleCheckIn,
  onUpdateNotes,
  isToday,
  isLive,
}: {
  course: Course;
  sessionDate: string;
  checkIn?: ClassCheckIn;
  onToggleCheckIn: () => void;
  onUpdateNotes: (notes: string) => void;
  isToday: boolean;
  isLive: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draftNotes, setDraftNotes] = useState(checkIn?.quickNotes ?? "");
  const color = course.color ?? "#71717a";
  const attended = checkIn?.attended ?? false;

  const handleExpand = () => {
    if (!expanded) setDraftNotes(checkIn?.quickNotes ?? "");
    setExpanded((v) => !v);
  };

  const saveNotes = () => {
    onUpdateNotes(draftNotes);
  };

  return (
    <article
      className={`glass rounded-xl transition-all ${isLive ? "ring-1 ring-emerald-500/30" : ""}`}
      style={
        isLive
          ? { boxShadow: `inset 3px 0 0 ${color}` }
          : { boxShadow: `inset 2px 0 0 ${color}40` }
      }
    >
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-[5.5rem] shrink-0">
          <span className="inline-block rounded-md bg-white/5 px-2 py-1 font-mono text-xs tabular-nums text-zinc-300">
            {formatTimeDisplay(course.startTime)}
          </span>
          <p className="mt-1 text-[10px] text-zinc-600">
            → {formatTimeDisplay(course.endTime)}
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium"
              style={{
                color,
                borderColor: `${color}40`,
                backgroundColor: `${color}12`,
              }}
            >
              {course.building}
              {course.room !== "TBA" ? ` ${course.room}` : ""}
            </span>
            {isLive && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Live now
              </span>
            )}
            {attended && (
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-400">
                Checked in
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-xs" style={{ color }}>
            <Link
              href={`/courses/${course.id}`}
              className="focus-ring rounded transition-colors hover:opacity-80"
            >
              {course.code}
            </Link>
          </p>
          <h3 className="font-medium text-zinc-100">
            <Link
              href={`/courses/${course.id}`}
              className="focus-ring rounded transition-colors hover:text-white"
            >
              {course.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="size-3" />
            {course.routeNotes}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            type="button"
            onClick={onToggleCheckIn}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              attended
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
            }`}
            aria-pressed={attended}
          >
            <Check className="size-3.5" />
            {attended ? "Present" : "Check in"}
          </button>
          <button
            type="button"
            onClick={handleExpand}
            className="focus-ring inline-flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
            aria-expanded={expanded}
          >
            <StickyNote className="size-3" />
            Notes
            <ChevronDown
              className={`size-3 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3">
          <label className="block text-xs font-medium text-zinc-400">
            Session notes · {sessionDate}
            {!isToday && (
              <span className="ml-1 text-zinc-600">(upcoming)</span>
            )}
          </label>
          <textarea
            value={draftNotes}
            onChange={(e) => setDraftNotes(e.target.value)}
            placeholder="Lecture topics, reminders, questions to ask..."
            rows={3}
            className="focus-ring mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={saveNotes}
              className="focus-ring rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/15"
            >
              Save notes
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function DaySchedule() {
  const now = useLiveClock(30_000);
  const { courses, checkIns, setCheckIns, hydrated } = useAcademicStore();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() =>
    defaultWeekday(new Date())
  );

  const todayKey = useMemo(() => {
    const d = new Date(now);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  }, [now]);

  const sessionDate = getDateForDayInWeek(selectedDay, now);
  const dayCourses = getCoursesForDay(courses, selectedDay);

  const getCheckIn = useCallback(
    (courseId: string) =>
      checkIns.find(
        (c) => c.courseId === courseId && c.date === sessionDate
      ),
    [checkIns, sessionDate]
  );

  const upsertCheckIn = useCallback(
    (courseId: string, patch: Partial<ClassCheckIn>) => {
      setCheckIns((prev) => {
        const existing = prev.find(
          (c) => c.courseId === courseId && c.date === sessionDate
        );
        if (existing) {
          return prev.map((c) =>
            c.id === existing.id ? { ...c, ...patch } : c
          );
        }
        const entry: ClassCheckIn = {
          id: `checkin-${courseId}-${sessionDate}`,
          courseId,
          date: sessionDate,
          attended: false,
          mood: 3,
          energyRating: 3,
          quickNotes: "",
          ...patch,
        };
        return [...prev, entry];
      });
    },
    [sessionDate, setCheckIns]
  );

  const isCourseLive = (course: Course) => {
    if (sessionDate !== todayKey) return false;
    const [h, m] = [now.getHours(), now.getMinutes()];
    const nowMin = h * 60 + m;
    const [sh, sm] = course.startTime.split(":").map(Number);
    const [eh, em] = course.endTime.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return nowMin >= start && nowMin < end;
  };

  if (!hydrated) {
    return (
      <section className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass h-24 animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <CalendarDays className="size-4 text-zinc-500" />
          Schedule
        </div>
        <p className="text-xs text-zinc-500">{sessionDate}</p>
      </div>

      <div
        className="flex gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-1"
        role="tablist"
        aria-label="Day of week"
      >
        {WEEKDAY_TABS.map(({ key, label }) => {
          const active = selectedDay === key;
          const count = getCoursesForDay(courses, key).length;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedDay(key)}
              className={`focus-ring flex flex-1 flex-col items-center rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                active
                  ? "bg-white/10 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`mt-0.5 text-[10px] ${active ? "text-zinc-400" : "text-zinc-600"}`}
                >
                  {count} {count === 1 ? "class" : "classes"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {dayCourses.length === 0 ? (
        <div className="glass rounded-xl px-4 py-10 text-center">
          <p className="text-sm text-zinc-400">No classes scheduled</p>
          <p className="mt-1 text-xs text-zinc-600">
            Enjoy the open block — or use the time for study sprints.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayCourses.map((course) => {
            const checkIn = getCheckIn(course.id);
            return (
              <ClassSessionCard
                key={course.id}
                course={course}
                sessionDate={sessionDate}
                checkIn={checkIn}
                isToday={sessionDate === todayKey}
                isLive={isCourseLive(course)}
                onToggleCheckIn={() =>
                  upsertCheckIn(course.id, {
                    attended: !(checkIn?.attended ?? false),
                  })
                }
                onUpdateNotes={(quickNotes) =>
                  upsertCheckIn(course.id, { quickNotes, attended: checkIn?.attended ?? false })
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
