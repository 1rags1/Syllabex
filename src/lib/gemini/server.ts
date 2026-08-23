import { GoogleGenAI } from "@google/genai";
import {
  GEMINI_MODEL,
  INGEST_JSON_SCHEMA,
  INGEST_PROMPT,
  SYNTHESIS_JSON_SCHEMA,
  SYNTHESIZE_PROMPT,
  SYSTEM_INSTRUCTION,
} from "@/lib/gemini/prompts";
import type { GeminiRequestBody } from "@/lib/gemini/types";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

function buildChatContents(body: GeminiRequestBody) {
  if (body.messages?.length) {
    return body.messages.map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));
  }
  return body.prompt ?? "";
}

export async function handleGeminiRequest(body: GeminiRequestBody) {
  const ai = getClient();

  if (body.mode === "synthesize") {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: SYNTHESIZE_PROMPT(
        body.courseCode ?? "course",
        body.content ?? ""
      ),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: SYNTHESIS_JSON_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty synthesis response");
    return JSON.parse(text);
  }

  if (body.mode === "ingest") {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: INGEST_PROMPT(body.courses ?? [], body.content ?? ""),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: INGEST_JSON_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty ingest response");
    return JSON.parse(text);
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildChatContents(body),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return { text: response.text ?? "" };
}

export async function handleGeminiStream(body: GeminiRequestBody) {
  const ai = getClient();

  const stream = await ai.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: buildChatContents(body),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return stream;
}
