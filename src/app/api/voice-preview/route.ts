import { NextResponse } from "next/server";

import { generateVoicePreview } from "@/features/voice-preview/voice-preview.service";
import { parseVoicePreviewRequest } from "@/features/voice-preview/voice-preview.utils";
import type { VoicePreviewRequestBody } from "@/features/voice-preview/voice-preview.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function isOpenAiVoiceCompatibilityError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("invalid_request_error") &&
    (message.includes("('body', 'voice')") ||
      message.includes("body', 'voice") ||
      message.includes("input should be"))
  );
}

function mapOpenAIError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.message.includes("OPENAI_API_KEY")) {
      return { message: "Server configuration error", status: 500 };
    }

    if (isOpenAiVoiceCompatibilityError(error)) {
      return {
        message: "This voice requires the expressive TTS engine.",
        status: 422,
      };
    }

    return { message: error.message, status: 500 };
  }

  return { message: "Failed to create voice preview", status: 500 };
}

export async function POST(request: Request) {
  try {
    let body: VoicePreviewRequestBody;

    try {
      body = (await request.json()) as VoicePreviewRequestBody;
    } catch {
      return jsonError("Invalid request body", 400);
    }

    const parsed = parseVoicePreviewRequest(body);
    if (!parsed.ok) {
      return jsonError(parsed.error, 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return jsonError("Server configuration error", 500);
    }

    const preview = await generateVoicePreview(parsed.value);

    return new NextResponse(new Uint8Array(preview.audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="footiebitz-voice-preview.mp3"',
        "Cache-Control": "private, max-age=1800",
        "X-Voice-Preview-Cache-Hit": preview.cacheHit ? "1" : "0",
        "X-Voice-Preview-Voice": preview.voice,
        "X-Voice-Preview-Speed": String(preview.speed),
      },
    });
  } catch (error) {
    console.error("voice-preview error:", error);
    const mapped = mapOpenAIError(error);
    return jsonError(mapped.message, mapped.status);
  }
}
