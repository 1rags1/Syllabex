"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { Command, FileInput, Sparkles, X } from "lucide-react";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { SyllabusIngestPanel } from "@/components/ai/SyllabusIngestPanel";
import { useAIAssistant } from "@/context/AIAssistantContext";

export function AIAssistantDrawer() {
  const { isOpen, close, activeTab, setActiveTab, toggle } = useAIAssistant();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating trigger */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggle}
          className="focus-ring fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/90 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/30 backdrop-blur transition-transform hover:scale-105 hover:bg-violet-500"
          aria-label="Open AI assistant"
        >
          <Sparkles className="size-4" />
          AI Tutor
          <kbd className="hidden rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={close}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-[#0c0c0e]/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="AI Assistant"
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-600/20">
              <Sparkles className="size-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Academic Assistant
              </h2>
              <p className="text-[11px] text-zinc-500">
                Powered by Gemini · STEM & EE tutor
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="focus-ring rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <nav className="flex border-b border-white/5 px-5">
          <TabButton
            active={activeTab === "chat"}
            onClick={() => setActiveTab("chat")}
            icon={<Command className="size-3.5" />}
            label="Chat"
          />
          <TabButton
            active={activeTab === "ingest"}
            onClick={() => setActiveTab("ingest")}
            icon={<FileInput className="size-3.5" />}
            label="Ingest syllabus"
          />
        </nav>

        <div className="flex flex-1 flex-col overflow-hidden px-5 py-4">
          {activeTab === "chat" ? <AIChatPanel /> : <SyllabusIngestPanel />}
        </div>

        <footer className="border-t border-white/5 px-5 py-3 text-center text-[10px] text-zinc-600">
          <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">
            ⌘K
          </kbd>{" "}
          toggle ·{" "}
          <kbd className="rounded border border-white/10 bg-white/5 px-1 font-mono">
            Esc
          </kbd>{" "}
          close
        </footer>
      </aside>
    </>
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
      onClick={onClick}
      className={`focus-ring -mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-colors ${
        active
          ? "border-violet-400 text-zinc-100"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
