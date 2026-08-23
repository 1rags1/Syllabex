"use client";

import { useState } from "react";
import { Check, FileInput, Loader2 } from "lucide-react";
import { useAcademicStore } from "@/context/AcademicContext";
import { ingestSyllabusText } from "@/lib/gemini/client";
import type { IngestAssignmentDraft } from "@/lib/gemini/types";

export function SyllabusIngestPanel() {
  const { courses, assignments, setAssignments } = useAcademicStore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<IngestAssignmentDraft[] | null>(null);

  const parse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setPreview(null);

    try {
      const result = await ingestSyllabusText(
        courses.map((c) => ({ id: c.id, code: c.code, title: c.title })),
        text
      );
      const valid = result.assignments.filter((a) =>
        courses.some((c) => c.id === a.courseId)
      );
      setPreview(valid);
      if (valid.length === 0) {
        setError("No assignments could be matched to your courses.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setLoading(false);
    }
  };

  const confirmImport = () => {
    if (!preview?.length) return;

    const newAssignments = preview.map((a) => ({
      ...a,
      id: `asgn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      completed: false,
    }));

    setAssignments((prev) => [...prev, ...newAssignments]);
    setPreview(null);
    setText("");
  };

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  return (
    <div className="flex h-full flex-col space-y-4">
      <div>
        <p className="text-sm text-zinc-400">
          Paste syllabus text, eLearning announcements, or email assignments.
          Gemini will extract structured tasks into your dashboard.
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste announcement or syllabus excerpt here…&#10;&#10;Example: CHEM 1311 Exam 1 on Sep 25. MATH 2413 HW 2 due Friday 9/4."
        rows={8}
        className="focus-ring w-full flex-1 resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600"
      />

      {error && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      <button
        type="button"
        onClick={parse}
        disabled={loading || !text.trim()}
        className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Parsing…
          </>
        ) : (
          <>
            <FileInput className="size-4" />
            Parse assignments
          </>
        )}
      </button>

      {preview && preview.length > 0 && (
        <div className="space-y-3 border-t border-white/5 pt-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Preview · {preview.length} found
          </p>
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {preview.map((a, i) => (
              <li
                key={i}
                className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-sm"
              >
                <p className="font-medium text-zinc-200">{a.title}</p>
                <p className="text-xs text-zinc-500">
                  {courseMap.get(a.courseId)?.code ?? a.courseId} · {a.type} ·{" "}
                  {a.dueDate} · {a.priority}
                </p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={confirmImport}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/15"
          >
            <Check className="size-4" />
            Add {preview.length} to dashboard
          </button>
          <p className="text-center text-[11px] text-zinc-600">
            {assignments.length} assignments currently tracked
          </p>
        </div>
      )}
    </div>
  );
}
