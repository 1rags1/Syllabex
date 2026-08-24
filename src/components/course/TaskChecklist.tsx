"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAcademicStore } from "@/context/AcademicContext";
import { useLiveClock } from "@/hooks/useLiveClock";
import { daysUntil } from "@/lib/schedule";
import type {
  Assignment,
  AssignmentPriority,
  AssignmentType,
} from "@/types/academic";

const TYPE_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: "homework", label: "Homework" },
  { value: "quiz", label: "Quiz" },
  { value: "exam", label: "Exam" },
  { value: "project", label: "Project" },
];

const PRIORITY_OPTIONS: { value: AssignmentPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

function countdownBadge(days: number, type: AssignmentType) {
  if (days < 0)
    return { text: `${Math.abs(days)}d overdue`, tone: "overdue" as const };
  if (days === 0) return { text: "Due today", tone: "today" as const };
  if (days === 1) return { text: "Tomorrow", tone: "soon" as const };
  if (type === "exam" && days <= 7)
    return { text: `${days}d`, tone: "exam" as const };
  if (days <= 3) return { text: `${days}d`, tone: "soon" as const };
  return { text: `${days}d`, tone: "normal" as const };
}

const BADGE_STYLES = {
  overdue: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  today: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  soon: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  exam: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  normal: "border-white/10 bg-white/5 text-zinc-400",
};

export function TaskChecklist({ courseId }: { courseId: string }) {
  const now = useLiveClock(60_000);
  const { assignments, setAssignments, hydrated } = useAcademicStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const courseTasks = useMemo(
    () =>
      assignments
        .filter((a) => a.courseId === courseId)
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return a.dueDate.localeCompare(b.dueDate);
        }),
    [assignments, courseId]
  );

  const openCount = courseTasks.filter((a) => !a.completed).length;

  const addTask = (task: Omit<Assignment, "id" | "courseId">) => {
    const entry: Assignment = {
      ...task,
      id: `asgn-${Date.now()}`,
      courseId,
    };
    setAssignments((prev) => [...prev, entry]);
    setShowForm(false);
  };

  const updateTask = (id: string, patch: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
    );
    setEditingId(null);
  };

  const deleteTask = (id: string) => {
    if (!window.confirm("Remove this task?")) return;
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setEditingId(null);
  };

  const toggleComplete = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );
  };

  if (!hydrated) {
    return <div className="glass h-64 animate-pulse rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-300">
            Tasks & exams
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {openCount} open · {courseTasks.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setEditingId(null);
          }}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 sm:min-h-0"
        >
          {showForm ? (
            <>
              <X className="size-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="size-4" /> Add task
            </>
          )}
        </button>
      </div>

      {showForm && (
        <TaskForm onSubmit={addTask} onCancel={() => setShowForm(false)} />
      )}

      {courseTasks.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-12 text-center">
          <p className="text-sm text-zinc-400">No tasks yet for this course.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Track homework, quizzes, and midterms with due-date countdowns.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {courseTasks.map((task) =>
            editingId === task.id ? (
              <li key={task.id} className="glass rounded-xl p-4">
                <TaskForm
                  initial={task}
                  onSubmit={(data) => updateTask(task.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <TaskRow
                key={task.id}
                task={task}
                daysLeft={daysUntil(task.dueDate, now)}
                onToggle={() => toggleComplete(task.id)}
                onEdit={() => {
                  setEditingId(task.id);
                  setShowForm(false);
                }}
                onDelete={() => deleteTask(task.id)}
              />
            )
          )}
        </ul>
      )}
    </div>
  );
}

function TaskRow({
  task,
  daysLeft,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Assignment;
  daysLeft: number;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const badge = countdownBadge(daysLeft, task.type);
  const dueLabel = new Date(task.dueDate + "T12:00:00").toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" }
  );

  return (
    <li
      className={`group flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 transition-colors sm:items-center ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`focus-ring flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          task.completed
            ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
            : "border-white/15 hover:border-white/30"
        }`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && <Check className="size-3" />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${task.completed ? "line-through text-zinc-500" : "text-zinc-100"}`}
        >
          {task.title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {task.type} · {dueLabel} · {task.priority} priority
        </p>
      </div>

      {!task.completed && (
        <span
          className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums ${BADGE_STYLES[badge.tone]}`}
        >
          {badge.text}
        </span>
      )}

      <div className="mt-0.5 flex shrink-0 gap-1 sm:mt-0 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="focus-ring rounded-lg p-2.5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 sm:p-1.5"
          aria-label="Edit task"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="focus-ring rounded-lg p-2.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 sm:p-1.5"
          aria-label="Delete task"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </li>
  );
}

function TaskForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Assignment;
  onSubmit: (data: Omit<Assignment, "id" | "courseId">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [type, setType] = useState<AssignmentType>(initial?.type ?? "homework");
  const [priority, setPriority] = useState<AssignmentPriority>(
    initial?.priority ?? "medium"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    onSubmit({
      title: title.trim(),
      dueDate,
      type,
      priority,
      completed: initial?.completed ?? false,
    });
  };

  const inputClass =
    "focus-ring w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        required
        className={inputClass}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className={inputClass}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as AssignmentType)}
          className={inputClass}
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
          className={inputClass}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="focus-ring rounded-lg bg-white/10 px-4 py-1.5 text-sm font-medium text-zinc-100 hover:bg-white/15"
        >
          {initial ? "Update" : "Add task"}
        </button>
      </div>
    </form>
  );
}
