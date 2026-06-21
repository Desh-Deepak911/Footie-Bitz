import { NextResponse } from "next/server";

import {
  applyAudioFirstTiming,
  generateAudioFirstStory,
  generateFootieScript,
  normalizeFootieStory,
} from "@/features/story/services";
import { resolveQualityMode, resolveScriptModel } from "@/lib/ai";
import type { AudioFirstGenerationResult, FootieScript } from "@/features/story/types";
import type {
  GenerateScriptProgressEvent,
  GenerateScriptRequest,
  GenerateScriptResponse,
  GenerateScriptStreamEvent,
  GenerationLoadingStep,
  Tone,
} from "@/types/footiebitz";
import { GENERATION_LOADING_STEPS, resolveSceneCount } from "@/types/footiebitz";

const VALID_TONES: Tone[] = ["dramatic", "funny", "tactical", "news", "emotional"];
const DEFAULT_TONE: Tone = "dramatic";
const DEFAULT_DURATION = 30;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type ProgressEmitter = (step: GenerationLoadingStep, label: string) => void | Promise<void>;

function jsonResponse(body: GenerateScriptResponse, status = 200) {
  return NextResponse.json(body, { status });
}

function resolveTone(tone: unknown): Tone {
  if (typeof tone === "string" && VALID_TONES.includes(tone as Tone)) {
    return tone as Tone;
  }
  return DEFAULT_TONE;
}

function resolveDuration(duration: unknown): number {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_DURATION;
  }
  return Math.max(15, Math.min(60, Math.round(value)));
}

function mapOpenAIError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("OPENAI_API_KEY")) {
      return "Server configuration error";
    }
    return error.message;
  }
  return "Failed to create story";
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function buildStoryResponse(story: FootieScript): FootieScript {
  return normalizeFootieStory(story);
}

function buildGenerateScriptResponse(
  footieScript: FootieScript,
  audioFirst: AudioFirstGenerationResult,
  applied: boolean,
): GenerateScriptResponse {
  if (!applied || !audioFirst.voiceover?.audioBase64) {
    return { success: true, data: footieScript, audioFirst };
  }

  return {
    success: true,
    data: footieScript,
    audioFirst,
    audioFirstApplied: true,
    voiceoverAudioBase64: audioFirst.voiceover.audioBase64,
  };
}

interface GenerationParams {
  topic: string;
  tone: Tone;
  duration: number;
  qualityMode: ReturnType<typeof resolveQualityMode>;
  sceneCount: number;
  model: string;
}

type GenerationSuccess = {
  ok: true;
  response: GenerateScriptResponse;
  usedFallback: boolean;
};

type GenerationFailure = {
  ok: false;
  response: GenerateScriptResponse;
  status: number;
};

async function runGeneration(
  params: GenerationParams,
  emitProgress?: ProgressEmitter,
): Promise<GenerationSuccess | GenerationFailure> {
  const audioFirstResult = await generateAudioFirstStory({
    prompt: params.topic,
    sceneCount: params.sceneCount,
    tone: params.tone,
    duration: params.duration,
    qualityMode: params.qualityMode,
    model: params.model,
    onProgress: emitProgress,
  });

  if (audioFirstResult.success) {
    return {
      ok: true,
      usedFallback: false,
      response: buildGenerateScriptResponse(
        audioFirstResult.footieScript,
        audioFirstResult.data,
        true,
      ),
    };
  }

  console.warn("audio-first pipeline:", audioFirstResult.error);

  await emitProgress?.(1, GENERATION_LOADING_STEPS[0]);

  const result = await generateFootieScript(
    params.topic,
    params.tone,
    params.duration,
    params.model,
  );

  if (!result.success) {
    if (result.kind === "empty") {
      console.error("FULL OPENAI RESPONSE:", safeStringify(result.response));
      return { ok: false, response: { success: false, error: result.error }, status: 500 };
    }

    console.error("Story parse error:", result.error);
    console.error("Model raw output:", result.rawText);
    return { ok: false, response: { success: false, error: result.error }, status: 500 };
  }

  await emitProgress?.(2, GENERATION_LOADING_STEPS[1]);

  const baseStory = buildStoryResponse(result.data);
  const audioFirstOutcome = await applyAudioFirstTiming(baseStory);

  await emitProgress?.(4, GENERATION_LOADING_STEPS[3]);

  return {
    ok: true,
    usedFallback: true,
    response: buildGenerateScriptResponse(
      audioFirstOutcome.footieScript,
      audioFirstOutcome.audioFirst,
      audioFirstOutcome.applied,
    ),
  };
}

function streamResponse(
  handler: (emit: ProgressEmitter) => Promise<GenerationSuccess | GenerationFailure>,
): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();

      const emitEvent = (event: GenerateScriptStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      const emitProgress: ProgressEmitter = (step, label) => {
        emitEvent({
          type: "progress",
          step,
          label: label as GenerateScriptProgressEvent["label"],
        });
      };

      try {
        const outcome = await handler(emitProgress);

        if (!outcome.ok) {
          emitEvent({ type: "error", error: outcome.response.error ?? "Failed to create story" });
          return;
        }

        emitEvent({
          type: "complete",
          ...outcome.response,
          usedFallback: outcome.usedFallback,
        });
      } catch (error) {
        console.error("generate-script stream error:", error);
        emitEvent({ type: "error", error: mapOpenAIError(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}

export async function POST(request: Request) {
  try {
    let body: GenerateScriptRequest;

    try {
      body = (await request.json()) as GenerateScriptRequest;
    } catch {
      return jsonResponse({ success: false, error: "Invalid request body" }, 400);
    }

    const topic = body.topic?.trim();
    if (!topic) {
      return jsonResponse({ success: false, error: "Topic is required" }, 400);
    }

    const tone = resolveTone(body.tone);
    const duration = resolveDuration(body.duration);
    const qualityMode = resolveQualityMode(body.qualityMode);
    const sceneCount = resolveSceneCount(body.sceneCount);
    const model = resolveScriptModel(qualityMode);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_key_here") {
      return jsonResponse(
        { success: false, error: "Server configuration error" },
        500,
      );
    }

    const params: GenerationParams = {
      topic,
      tone,
      duration,
      qualityMode,
      sceneCount,
      model,
    };

    if (body.stream) {
      return streamResponse((emitProgress) => runGeneration(params, emitProgress));
    }

    const outcome = await runGeneration(params);

    if (!outcome.ok) {
      return jsonResponse(outcome.response, outcome.status);
    }

    return jsonResponse(outcome.response);
  } catch (error) {
    console.error("generate-script error:", error);
    return jsonResponse({ success: false, error: mapOpenAIError(error) }, 500);
  }
}
