import "server-only";

import { resolveSpeechStyleInstructionsForVoice } from "@/features/speech-style";
import { generateVoiceoverMp3 } from "@/features/story/services/voiceover.service";

import {
  readVoicePreviewCache,
  writeVoicePreviewCache,
} from "./voice-preview.cache";
import type { GenerateVoicePreviewResult, ParsedVoicePreviewRequest } from "./voice-preview.types";
import { buildVoicePreviewCacheKey } from "./voice-preview.utils";

type VoicePreviewTtsGenerator = (input: {
  text: string;
  voice: string;
  speed: number;
  model?: string;
  instructions?: string;
}) => Promise<ArrayBuffer>;

let ttsGeneratorOverride: VoicePreviewTtsGenerator | null = null;
let generationCallCountForTests = 0;

/** Injects TTS generator for verification — production uses OpenAI via generateVoiceoverMp3. */
export function setVoicePreviewTtsGeneratorForTests(
  generator: VoicePreviewTtsGenerator | null,
): void {
  ttsGeneratorOverride = generator;
}

export function getVoicePreviewGenerationCallCountForTests(): number {
  return generationCallCountForTests;
}

export function resetVoicePreviewGenerationCallCountForTests(): void {
  generationCallCountForTests = 0;
}

async function generatePreviewMp3(input: {
  text: string;
  voice: string;
  speed: number;
  stylePreset: ParsedVoicePreviewRequest["stylePreset"];
  expressiveDelivery: boolean;
}): Promise<ArrayBuffer> {
  generationCallCountForTests += 1;

  const style = resolveSpeechStyleInstructionsForVoice(
    input.voice,
    input.stylePreset,
    input.expressiveDelivery,
  );
  const ttsOptions = {
    speed: input.speed,
    applySpeed: true,
    model: style.model,
    instructions: style.instructions,
  };

  if (ttsGeneratorOverride) {
    return ttsGeneratorOverride({
      text: input.text,
      voice: input.voice,
      speed: input.speed,
      model: ttsOptions.model,
      instructions: ttsOptions.instructions,
    });
  }

  return generateVoiceoverMp3(input.text, input.voice, ttsOptions);
}

/** Generates short preview audio without touching story state or drafts. */
export async function generateVoicePreview(
  request: ParsedVoicePreviewRequest,
): Promise<GenerateVoicePreviewResult> {
  const cacheKey = buildVoicePreviewCacheKey(
    request.voice,
    request.speed,
    request.sampleText,
    request.stylePreset,
    request.expressiveDelivery,
  );

  const cached = readVoicePreviewCache(cacheKey);
  if (cached) {
    return {
      audioBuffer: cached,
      cacheHit: true,
      voice: request.voice,
      speed: request.speed,
      sampleText: request.sampleText,
    };
  }

  const audioBuffer = await generatePreviewMp3({
    text: request.sampleText,
    voice: request.voice,
    speed: request.speed,
    stylePreset: request.stylePreset,
    expressiveDelivery: request.expressiveDelivery,
  });

  writeVoicePreviewCache({
    cacheKey,
    audioBuffer,
  });

  return {
    audioBuffer,
    cacheHit: false,
    voice: request.voice,
    speed: request.speed,
    sampleText: request.sampleText,
  };
}
