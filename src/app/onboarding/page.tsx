import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        Welcome to Syllabex
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">
        Your Fall 2026 command center is ready.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-400">
        Classes, notes, exams, and your AI tutor live in one place. You can
        start from Today and pick up where you left off on any device once
        you&apos;re signed in.
      </p>
      <Link
        href="/dashboard"
        className="focus-ring mt-8 inline-flex w-fit min-h-11 items-center rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/15"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
