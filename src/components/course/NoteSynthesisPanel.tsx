"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import type { NoteSynthesis } from "@/types/academic";

export function NoteSynthesisPanel({
  synthesis,
  onSynthesize,
  loading,
  hasContent,
}: {
  synthesis?: NoteSynthesis;
  onSynthesize: () => void;
  loading: boolean;
  hasContent: boolean;
}) {
  const [expandedFlashcard, setExpandedFlashcard] = useState<number | null>(
    null
  );

  return (
    <div className="space-y-4 border-t border-white/5 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
          <Sparkles className="size-3.5 text-violet-400" />
          AI synthesis
        </div>
        <button
          type="button"
          onClick={onSynthesize}
          disabled={loading || !hasContent}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/15 disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Synthesizing…
            </>
          ) : (
            <>
              <Sparkles className="size-3.5" />
              Synthesize notes
            </>
          )}
        </button>
      </div>

      {!synthesis && !loading && (
        <p className="text-xs text-zinc-600">
          Extract a 3-sentence summary, 5 key concepts, and 3 flashcards from
          your raw notes.
        </p>
      )}

      {synthesis && (
        <div className="space-y-5 rounded-xl border border-violet-500/10 bg-violet-500/[0.03] p-5">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Summary
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {synthesis.summary}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Key concepts
            </h4>
            <ul className="mt-2 space-y-1.5">
              {synthesis.keyConcepts.map((concept, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-zinc-300"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-violet-400" />
                  {concept}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Flashcards
            </h4>
            <ul className="mt-2 space-y-2">
              {synthesis.flashcards.map((card, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFlashcard(expandedFlashcard === i ? null : i)
                    }
                    className="focus-ring w-full rounded-lg border border-white/5 bg-black/20 px-3 py-2.5 text-left text-sm transition-colors hover:bg-black/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-zinc-200">{card.question}</span>
                      {expandedFlashcard === i ? (
                        <ChevronUp className="size-4 shrink-0 text-zinc-500" />
                      ) : (
                        <ChevronDown className="size-4 shrink-0 text-zinc-500" />
                      )}
                    </div>
                    {expandedFlashcard === i && (
                      <p className="mt-2 border-t border-white/5 pt-2 text-zinc-400">
                        {card.answer}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[10px] text-zinc-600">
            Synthesized{" "}
            {new Date(synthesis.synthesizedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
