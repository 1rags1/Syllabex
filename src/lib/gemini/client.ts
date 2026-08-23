import type {
  GeminiChatMessage,
  GeminiRequestBody,
  IngestResult,
  NoteSynthesisResult,
} from "@/lib/gemini/types";
import {
  parseIngestResult,
  parseSynthesisResult,
} from "@/lib/gemini/types";

async function postGemini<T>(body: GeminiRequestBody): Promise<T> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Gemini request failed");
  }
  return data as T;
}

export async function chatWithGemini(prompt: string): Promise<string> {
  const data = await postGemini<{ text: string }>({
    mode: "chat",
    prompt,
  });
  return data.text;
}

export async function streamChatWithGemini(
  messages: GeminiChatMessage[],
  onChunk: (text: string) => void,
  onError?: (error: string) => void
): Promise<void> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "chat", stream: true, messages }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Stream request failed");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") return;

      try {
        const parsed = JSON.parse(payload) as {
          text?: string;
          error?: string;
        };
        if (parsed.error) {
          onError?.(parsed.error);
          return;
        }
        if (parsed.text) onChunk(parsed.text);
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function synthesizeNotes(
  courseCode: string,
  content: string
): Promise<NoteSynthesisResult> {
  const raw = await postGemini<unknown>({
    mode: "synthesize",
    courseCode,
    content,
  });
  return parseSynthesisResult(raw);
}

export async function ingestSyllabusText(
  courses: { id: string; code: string; title: string }[],
  text: string
): Promise<IngestResult> {
  const raw = await postGemini<unknown>({
    mode: "ingest",
    courses,
    content: text,
  });
  return parseIngestResult(raw);
}
