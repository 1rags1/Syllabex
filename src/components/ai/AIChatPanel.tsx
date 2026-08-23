"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { streamChatWithGemini } from "@/lib/gemini/client";
import type { GeminiChatMessage } from "@/lib/gemini/types";

export function AIChatPanel() {
  const [messages, setMessages] = useState<GeminiChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your STEM tutor for Fall 2026. Ask about Calc, Chem, EE, Rhetoric, or anything on your schedule.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || streaming) return;

    const userMessage: GeminiChatMessage = { role: "user", content: prompt };
    const history = [...messages, userMessage];

    setInput("");
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setStreaming(true);

    let accumulated = "";

    try {
      await streamChatWithGemini(
        history,
        (chunk) => {
          accumulated += chunk;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: accumulated };
            return next;
          });
          scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
        },
        (error) => {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: "assistant",
              content: `Error: ${error}`,
            };
            return next;
          });
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: `Error: ${message}`,
        };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming]);

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-1 py-2"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-white/10 text-zinc-100"
                  : "border border-white/5 bg-black/20 text-zinc-300"
              }`}
            >
              {msg.role === "assistant" && i === 0 && (
                <Sparkles className="mb-1.5 size-3.5 text-violet-400" />
              )}
              <p className="whitespace-pre-wrap">{msg.content || "…"}</p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-4 flex gap-2 border-t border-white/5 pt-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about homework, concepts, exam prep…"
          disabled={streaming}
          className="focus-ring flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="focus-ring inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
        >
          {streaming ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}
