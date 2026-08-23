"use client";

import type { ReactNode } from "react";
import { use, useState } from "react";
import Link from "next/link";
import { BookOpen, ClipboardList } from "lucide-react";
import { CourseHeader } from "@/components/course/CourseHeader";
import { NoteWorkspace } from "@/components/course/NoteWorkspace";
import { TaskChecklist } from "@/components/course/TaskChecklist";
import { useAcademicStore } from "@/context/AcademicContext";

type Tab = "notes" | "tasks";

export default function CourseWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { courses, hydrated } = useAcademicStore();
  const [tab, setTab] = useState<Tab>("notes");

  const course = courses.find((c) => c.id === id);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="space-y-6">
          <div className="glass h-40 animate-pulse rounded-2xl" />
          <div className="glass h-96 animate-pulse rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-medium text-zinc-300">Course not found</p>
        <p className="mt-2 text-sm text-zinc-500">
          The course &ldquo;{id}&rdquo; doesn&apos;t exist in your schedule.
        </p>
        <Link
          href="/"
          className="focus-ring mt-6 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/10"
        >
          Back to Today
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="space-y-10">
        <CourseHeader course={course} />

        <nav
          className="flex gap-1 border-b border-white/5 pb-px"
          role="tablist"
          aria-label="Course workspace"
        >
          <TabButton
            active={tab === "notes"}
            onClick={() => setTab("notes")}
            icon={<BookOpen className="size-4" />}
            label="Notes"
          />
          <TabButton
            active={tab === "tasks"}
            onClick={() => setTab("tasks")}
            icon={<ClipboardList className="size-4" />}
            label="Tasks & exams"
          />
        </nav>

        <section role="tabpanel" className="min-h-[32rem]">
          {tab === "notes" ? (
            <NoteWorkspace courseId={course.id} />
          ) : (
            <TaskChecklist courseId={course.id} />
          )}
        </section>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`focus-ring -mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-zinc-200 text-zinc-100"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
