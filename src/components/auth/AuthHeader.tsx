import Link from "next/link";
import {
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring rounded-lg text-sm font-medium tracking-tight text-zinc-100"
        >
          Syllabex
          <span className="ml-2 hidden text-xs font-normal text-zinc-500 sm:inline">
            Fall 2026
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Show when="signed-out">
            <SignInButton>
              <button
                type="button"
                className="focus-ring min-h-10 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-zinc-100"
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button
                type="button"
                className="focus-ring min-h-10 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-zinc-100 transition-colors hover:bg-white/15"
              >
                Sign up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "size-8",
                },
              }}
            />
          </Show>
        </div>
      </div>
    </header>
  );
}
