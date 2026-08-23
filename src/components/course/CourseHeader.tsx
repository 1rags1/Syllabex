"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import { mergeCourseDetails } from "@/data/course-details";
import { formatTimeDisplay } from "@/lib/schedule";
import type { Course, DayOfWeek } from "@/types/academic";

const DAY_LABELS: Record<DayOfWeek, string> = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  R: "Thu",
  F: "Fri",
  S: "Sat",
  U: "Sun",
};

export function CourseHeader({ course }: { course: Course }) {
  const c = mergeCourseDetails(course);
  const color = c.color ?? "#a1a1aa";

  return (
    <header className="space-y-6">
      <Link
        href="/"
        className="focus-ring inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft className="size-4" />
        Back to Today
      </Link>

      <div
        className="glass rounded-2xl p-6 sm:p-8"
        style={{ boxShadow: `inset 4px 0 0 ${color}` }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div>
              <p
                className="font-mono text-sm font-medium tracking-wide"
                style={{ color }}
              >
                {c.code}
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                {c.title}
              </h1>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
              {c.professor && (
                <span className="inline-flex items-center gap-2">
                  <User className="size-4 text-zinc-500" />
                  {c.professor}
                </span>
              )}
              {c.professorEmail && (
                <a
                  href={`mailto:${c.professorEmail}`}
                  className="focus-ring inline-flex items-center gap-2 transition-colors hover:text-zinc-200"
                >
                  <Mail className="size-4 text-zinc-500" />
                  {c.professorEmail}
                </a>
              )}
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4 text-zinc-500" />
                {c.daysOfWeek.map((d) => DAY_LABELS[d]).join(" · ")}{" "}
                · {formatTimeDisplay(c.startTime)} –{" "}
                {formatTimeDisplay(c.endTime)}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-zinc-500" />
                {c.building}
                {c.room !== "TBA" ? ` ${c.room}` : ""}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {c.syllabusUrl && (
              <a
                href={c.syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
              >
                <FileText className="size-4 text-zinc-400" />
                Syllabus
                <ExternalLink className="size-3.5 text-zinc-500" />
              </a>
            )}
            {c.portalUrl && (
              <a
                href={c.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
              >
                Course portal
                <ExternalLink className="size-3.5 text-zinc-500" />
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
