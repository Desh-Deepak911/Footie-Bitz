import { NextResponse } from "next/server";

import { generateVoiceoverMp3, resolveVoiceoverVoice } from "@/lib/generateVoiceover";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface GenerateVoiceoverRequest {
  text?: string;
  voice?: string;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function mapOpenAIError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("OPENAI_API_KEY")) {
      return "Server configuration error";
    }
    return error.message;
  }
  return "Failed to create narration";
}

export async function POST(request: Request) {
  try {
    let body: GenerateVoiceoverRequest;

    try {
      body = (await request.json()) as GenerateVoiceoverRequest;
    } catch {
      return jsonError("Invalid request body", 400);
    }

    const text = body.text?.trim();
    if (!text) {
      return jsonError("Text is required", 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return jsonError("Server configuration error", 500);
    }

    const voice = resolveVoiceoverVoice(body.voice);
    const audioBuffer = await generateVoiceoverMp3(text, voice);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="footiebitz-voiceover.mp3"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("generate-voiceover error:", error);
    return jsonError(mapOpenAIError(error), 500);
  }
}
