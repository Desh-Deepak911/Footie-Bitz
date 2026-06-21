import "server-only";

import type { QualityMode, Tone } from "@/types/footiebitz";
import { resolveSceneCount } from "@/types/footiebitz";

import {
  generateAudioFirstStory,
  type ApplyAudioFirstTimingOutcome,
} from "./audio-first-generation.service";

export interface AudioFirstStoryPipelineInput {
  topic: string;
  tone: Tone;
  duration: number;
  qualityMode: QualityMode;
  sceneCount: number;
  model: string;
}

/**
 * @deprecated Prefer `generateAudioFirstStory` directly.
 * Thin wrapper retained for existing API route compatibility.
 */
export async function generateStoryWithAudioFirstPipeline(
  input: AudioFirstStoryPipelineInput,
): Promise<ApplyAudioFirstTimingOutcome | null> {
  const result = await generateAudioFirstStory({
    prompt: input.topic,
    sceneCount: resolveSceneCount(input.sceneCount),
    tone: input.tone,
    duration: input.duration,
    qualityMode: input.qualityMode,
    model: input.model,
  });

  if (!result.success) {
    console.warn("audio-first pipeline:", result.error);
    return null;
  }

  return {
    audioFirst: result.data,
    footieScript: result.footieScript,
    applied: true,
  };
}
