"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  PenLine,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { NoteSynthesisPanel } from "@/components/course/NoteSynthesisPanel";
import { MarkdownPreview } from "@/components/course/MarkdownPreview";
import { useAcademicStore } from "@/context/AcademicContext";
import { synthesizeNotes } from "@/lib/gemini/client";
import type { Note } from "@/types/academic";

function createNote(courseId: string, partial?: Partial<Note>): Note {
  const now = new Date().toISOString();
  return {
    id: `note-${Date.now()}`,
    courseId,
    title: "Untitled lecture",
    content: "",
    coreTopicLearned: "",
    keyFormulasConcepts: "",
    questionsToAsk: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function NoteWorkspace({ courseId }: { courseId: string }) {
  const { notes, setNotes, courses, hydrated } = useAcademicStore();
  const course = courses.find((c) => c.id === courseId);
  const courseNotes = useMemo(
    () =>
      notes
        .filter((n) => n.courseId === courseId)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
    [notes, courseId]
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Note | null>(null);
  const [view, setView] = useState<"edit" | "preview" | "split">("split");
  const [saved, setSaved] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthError, setSynthError] = useState<string | null>(null);

  const activeNote = courseNotes.find((n) => n.id === activeId);

  useEffect(() => {
    if (!hydrated) return;
    if (activeId && courseNotes.some((n) => n.id === activeId)) return;
    if (courseNotes.length > 0) {
      setActiveId(courseNotes[0].id);
    } else {
      setActiveId(null);
      setDraft(null);
    }
  }, [hydrated, courseNotes, activeId]);

  useEffect(() => {
    if (activeNote) {
      setDraft({ ...activeNote });
      setSaved(true);
    } else {
      setDraft(null);
    }
  }, [activeNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDraft = useCallback(
    (patch: Partial<Note>) => {
      setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
      setSaved(false);
    },
    []
  );

  const saveNote = useCallback(() => {
    if (!draft) return;
    const updated = { ...draft, updatedAt: new Date().toISOString() };
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === updated.id);
      if (exists) {
        return prev.map((n) => (n.id === updated.id ? updated : n));
      }
      return [...prev, updated];
    });
    setDraft(updated);
    setActiveId(updated.id);
    setSaved(true);
  }, [draft, setNotes]);

  const newNote = useCallback(() => {
    const note = createNote(courseId);
    setNotes((prev) => [...prev, note]);
    setActiveId(note.id);
    setDraft(note);
    setSaved(true);
  }, [courseId, setNotes]);

  const deleteNote = useCallback(() => {
    if (!draft) return;
    if (!window.confirm("Delete this note permanently?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== draft.id));
    setActiveId(null);
    setDraft(null);
  }, [draft, setNotes]);

  const handleSynthesize = useCallback(async () => {
    if (!draft?.content.trim()) return;
    setSynthesizing(true);
    setSynthError(null);

    try {
      const result = await synthesizeNotes(
        course?.code ?? courseId,
        draft.content
      );

      const synthesis = {
        ...result,
        synthesizedAt: new Date().toISOString(),
      };

      const updated: Note = {
        ...draft,
        synthesis,
        coreTopicLearned: draft.coreTopicLearned || result.summary,
        keyFormulasConcepts:
          draft.keyFormulasConcepts ||
          result.keyConcepts.join("\n"),
        updatedAt: new Date().toISOString(),
      };

      setNotes((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
      setDraft(updated);
      setSaved(true);
    } catch (err) {
      setSynthError(
        err instanceof Error ? err.message : "Synthesis failed"
      );
    } finally {
      setSynthesizing(false);
    }
  }, [draft, course?.code, courseId, setNotes]);

  if (!hydrated) {
    return <div className="glass h-96 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
      <aside className="space-y-3">
        <button
          type="button"
          onClick={newNote}
          className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
        >
          <Plus className="size-4" />
          New note
        </button>

        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {courseNotes.map((note) => (
            <li key={note.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => setActiveId(note.id)}
                className={`focus-ring w-40 rounded-lg px-3 py-2.5 text-left text-sm transition-colors lg:w-full ${
                  activeId === note.id
                    ? "bg-white/10 text-zinc-100"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                }`}
              >
                <p className="truncate font-medium">{note.title || "Untitled"}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-zinc-600">
                  {new Date(note.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {note.synthesis && (
                    <span className="text-violet-500">· AI</span>
                  )}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {courseNotes.length === 0 && (
          <p className="px-1 text-xs leading-relaxed text-zinc-600">
            Capture lecture notes with Markdown, formulas, and questions for office hours.
          </p>
        )}
      </aside>

      {!draft ? (
        <div className="glass flex min-h-[28rem] items-center justify-center rounded-2xl p-8">
          <p className="text-sm text-zinc-500">
            Select a note or create a new one to begin.
          </p>
        </div>
      ) : (
        <div className="glass space-y-6 rounded-2xl p-4 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="Lecture title"
              className="focus-ring w-full bg-transparent text-lg font-medium text-zinc-50 placeholder:text-zinc-600 sm:text-2xl"
            />
            <div className="flex shrink-0 items-center gap-2">
              <ViewToggle view={view} onChange={setView} />
              <button
                type="button"
                onClick={deleteNote}
                className="focus-ring rounded-lg p-2 text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                aria-label="Delete note"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={saveNote}
                className={`focus-ring inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  saved
                    ? "bg-white/5 text-zinc-400"
                    : "bg-white/15 text-zinc-100"
                }`}
              >
                <Save className="size-4" />
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          <div
            className={
              view === "split"
                ? "grid gap-4 lg:grid-cols-2"
                : "space-y-4"
            }
          >
            {(view === "edit" || view === "split") && (
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Lecture notes
                </label>
                <textarea
                  value={draft.content}
                  onChange={(e) => updateDraft({ content: e.target.value })}
                  placeholder="## Today's lecture&#10;&#10;- Key point one&#10;- **Important** concept&#10;&#10;```&#10;formula here&#10;```"
                  rows={view === "split" ? 14 : 10}
                  className="focus-ring w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600"
                  spellCheck={false}
                />
              </div>
            )}

            {(view === "preview" || view === "split") && (
              <div className={view === "split" ? "hidden lg:block" : undefined}>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Preview
                </label>
                <div className="min-h-[12rem] rounded-xl border border-white/5 bg-black/10 px-4 py-3">
                  <MarkdownPreview content={draft.content} />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-5 border-t border-white/5 pt-6 sm:grid-cols-3">
            <Field
              label="Core topic learned"
              value={draft.coreTopicLearned}
              onChange={(v) => updateDraft({ coreTopicLearned: v })}
              placeholder="Main concept from today's class"
              rows={3}
            />
            <Field
              label="Key formulas / concepts"
              value={draft.keyFormulasConcepts}
              onChange={(v) => updateDraft({ keyFormulasConcepts: v })}
              placeholder="E = mc², limit definition, etc."
              rows={3}
            />
            <Field
              label="Questions to ask prof / TA"
              value={draft.questionsToAsk}
              onChange={(v) => updateDraft({ questionsToAsk: v })}
              placeholder="Clarify problem 4, office hours topic..."
              rows={3}
            />
          </div>

          {synthError && (
            <p className="text-sm text-rose-400">{synthError}</p>
          )}

          <NoteSynthesisPanel
            synthesis={draft.synthesis}
            onSynthesize={handleSynthesize}
            loading={synthesizing}
            hasContent={Boolean(draft.content.trim())}
          />
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="focus-ring w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600"
      />
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: "edit" | "preview" | "split";
  onChange: (v: "edit" | "preview" | "split") => void;
}) {
  const options = [
    { key: "edit" as const, icon: PenLine, label: "Edit", hideOnMobile: false },
    { key: "split" as const, icon: Eye, label: "Split", hideOnMobile: true },
    { key: "preview" as const, icon: Eye, label: "Preview", hideOnMobile: false },
  ];

  return (
    <div className="flex rounded-lg border border-white/10 p-0.5">
      {options.map(({ key, label, hideOnMobile }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`focus-ring rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
            hideOnMobile ? "hidden lg:inline" : ""
          } ${
            view === key
              ? "bg-white/10 text-zinc-200"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
