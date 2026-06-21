import "server-only";

import { getOpenAIClient, buildStoryScriptPrompt, resolveQualityMode, resolveScriptModel } from "@/lib/ai";
import type { StoryScript } from "@/features/story/types";
import { createStoryScriptId, secondsToMs } from "@/features/story/utils";
import type { QualityMode, Tone } from "@/types/footiebitz";

import { cleanJsonText } from "./story-parse.service";

const NARRATION_SCRIPT_MAX_OUTPUT_TOKENS = 1200;

const EMPTY_RESPONSE_ERROR =
  "The model returned an empty response. Try Balanced mode or increase max output tokens.";
const INVALID_JSON_ERROR = "The model returned invalid JSON. Please try again.";

export interface GenerateStoryScriptOptions {
  tone?: Tone;
  /** Target spoken duration in seconds — guides narration length only. */
  duration?: number;
  qualityMode?: QualityMode;
  model?: string;
}

export type StoryScriptGenerationResult =
  | { success: true; data: StoryScript }
  | { success: false; error: string; kind: "empty"; response: unknown }
  | { success: false; error: string; kind: "parse_error"; rawText: string };

type RawStoryScript = {
  title?: string;
  narration?: string;
};

function resolveDuration(duration: unknown): number {
  const value = Number(duration);
  if (!Number.isFinite(value) || value <= 0) {
    return 30;
  }
  return Math.max(15, Math.min(60, Math.round(value)));
}

function buildPrompt(prompt: string, tone: Tone, duration: number): string {
  return [
    "FootieBitz narration writer. Output JSON only. No markdown or prose.",
    buildStoryScriptPrompt(prompt, tone, duration),
  ].join("\n\n");
}

function parseStoryScriptJson(text: string, estimatedDurationSec: number): StoryScript {
  let parsed: RawStoryScript;

  try {
    parsed = JSON.parse(cleanJsonText(text)) as RawStoryScript;
  } catch {
    throw new Error("Failed to parse story script JSON from model response");
  }

  const title = parsed.title?.trim();
  const narration = parsed.narration?.trim();

  if (!title) {
    throw new Error("Story title is missing");
  }

  if (!narration) {
    throw new Error("Story narration is missing");
  }

  return {
    id: createStoryScriptId(),
    title,
    narration,
    estimatedDurationMs: secondsToMs(estimatedDurationSec),
  };
}

async function requestStoryScriptText(
  model: string,
  prompt: string,
): Promise<{ rawText: string; response: unknown }> {
  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model,
    input: prompt,
    temperature: 0.7,
    max_output_tokens: NARRATION_SCRIPT_MAX_OUTPUT_TOKENS,
  });

  const rawText = response.output_text?.trim() ?? "";

  return { rawText, response };
}

/**
 * Generates a narration-only story script (title + full voiceover text).
 * Does not generate scenes, captions, or image prompts.
 */
export async function generateStoryScript(
  prompt: string,
  options: GenerateStoryScriptOptions = {},
): Promise<StoryScriptGenerationResult> {
  const topic = prompt.trim();
  if (!topic) {
    return {
      success: false,
      error: "Prompt is required",
      kind: "parse_error",
      rawText: "",
    };
  }

  const tone = options.tone ?? "dramatic";
  const duration = resolveDuration(options.duration);
  const qualityMode = resolveQualityMode(options.qualityMode);
  const model = options.model ?? resolveScriptModel(qualityMode);
  const fullPrompt = buildPrompt(topic, tone, duration);
  const { rawText, response } = await requestStoryScriptText(model, fullPrompt);

  if (!rawText) {
    return {
      success: false,
      error: EMPTY_RESPONSE_ERROR,
      kind: "empty",
      response,
    };
  }

  try {
    const data = parseStoryScriptJson(rawText, duration);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : INVALID_JSON_ERROR,
      kind: "parse_error",
      rawText,
    };
  }
}
