import type { FootieScript } from "@/features/story/types";

import { getStoryTotalDuration, scenesHaveMsTiming } from "./scene.utils";
import { normalizeStoryVoiceSettings } from "./voice-settings.utils";

/** True when the story has a playable narration blob or URL. */
export function hasVoiceoverAudio(script: FootieScript | null | undefined): boolean {
  return Boolean(script?.voiceoverUrl?.trim());
}

/** True when voiceover audio and measured scene timing are both present. */
export function isAudioFirstStory(script: FootieScript | null | undefined): boolean {
  if (!script) {
    return false;
  }

  return (
    hasVoiceoverAudio(script) &&
    script.voiceoverDurationMs != null &&
    script.voiceoverDurationMs > 0 &&
    scenesHaveMsTiming(script.scenes ?? [])
  );
}

/**
 * Applies safe defaults for legacy stories — does not migrate or invent voiceover data.
 * Optional audio-first fields are preserved when already present.
 */
export function coerceLegacyStoryFields(script: FootieScript): FootieScript {
  const scenes = script.scenes ?? [];
  const legacyVoiceoverSpeed = (script as FootieScript & { voiceoverSpeed?: number }).voiceoverSpeed;

  return {
    ...script,
    title: script.title ?? "",
    narration: script.narration ?? "",
    scenes,
    totalDuration:
      script.totalDuration > 0 ? script.totalDuration : getStoryTotalDuration(scenes),
    voiceSettings: normalizeStoryVoiceSettings({
      voiceSettings: script.voiceSettings,
      voiceoverSpeed: legacyVoiceoverSpeed,
    }),
    ...(script.timelineItems?.length ? { timelineItems: script.timelineItems } : {}),
    ...(script.voiceoverUrl ? { voiceoverUrl: script.voiceoverUrl } : {}),
    ...(script.voiceoverDurationMs != null && script.voiceoverDurationMs > 0
      ? { voiceoverDurationMs: script.voiceoverDurationMs }
      : {}),
  };
}

/** Resolves playback/export duration without requiring voiceover metadata. */
export function resolveStoryDurationSec(script: FootieScript | null | undefined): number {
  if (!script) {
    return 0;
  }

  const scenes = script.scenes ?? [];

  // Scene timeline is authoritative when ms timing exists — keeps preview/export
  // scene switches and subtitle chunks aligned after voice speed refits.
  if (scenesHaveMsTiming(scenes)) {
    const sceneTotal = getStoryTotalDuration(scenes);
    if (sceneTotal > 0) {
      return sceneTotal;
    }
  }

  if (
    hasVoiceoverAudio(script) &&
    script.voiceoverDurationMs != null &&
    script.voiceoverDurationMs > 0
  ) {
    return script.voiceoverDurationMs / 1000;
  }

  if (script.totalDuration > 0) {
    return script.totalDuration;
  }

  return getStoryTotalDuration(scenes);
}
