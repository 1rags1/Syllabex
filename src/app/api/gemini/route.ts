import { NextRequest } from "next/server";
import {
  handleGeminiRequest,
  handleGeminiStream,
} from "@/lib/gemini/server";
import type { GeminiRequestBody } from "@/lib/gemini/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        {
          error:
            "GEMINI_API_KEY is not configured. Add it to .env.local locally, or to Railway Variables in production.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as GeminiRequestBody;

    if (!body.mode) {
      return Response.json({ error: "mode is required" }, { status: 400 });
    }

    if (body.mode === "chat" && body.stream) {
      const stream = await handleGeminiStream(body);
      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.text;
              if (text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                );
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Stream failed";
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: message })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const result = await handleGeminiRequest(body);
    return Response.json(result);
  } catch (err) {
    const raw =
      err instanceof Error ? err.message : "Gemini request failed";
    const message = raw.includes("UNABLE_TO_VERIFY_LEAF_SIGNATURE") ||
      raw.toLowerCase().includes("fetch failed")
      ? "Could not reach Google Gemini (network/SSL). Stop the dev server and run npm run dev again. Your AQ. API key format is correct."
      : raw;
    console.error("[api/gemini]", raw);
    return Response.json({ error: message }, { status: 500 });
  }
}
