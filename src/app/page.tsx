"use client";

import { DaySchedule } from "@/components/today/DaySchedule";
import { ExamRadar } from "@/components/today/ExamRadar";
import { HeroSection } from "@/components/today/HeroSection";
import { useAcademicStore } from "@/context/AcademicContext";

export default function HomePage() {
  const { courses, hydrated } = useAcademicStore();

  return (
    <main className="mx-auto min-h-screen min-h-dvh max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-28 lg:px-8">
      {!hydrated ? (
        <div className="space-y-6">
          <div className="glass h-48 animate-pulse rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="glass h-96 animate-pulse rounded-2xl" />
            <div className="glass h-64 animate-pulse rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <HeroSection courses={courses} />

          <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
            <DaySchedule />
            <aside className="lg:sticky lg:top-8">
              <ExamRadar />
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}
