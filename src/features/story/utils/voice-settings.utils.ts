import {
  DEFAULT_SPEECH_STYLE_PRESET,
  resolveExpressiveDelivery,
  resolveSpeechStylePreset,
} from "@/features/speech-style";
import {
  DEFAULT_VOICEOVER_SPEED,
  resolveVoiceoverSpeed,
  resolveVoiceoverVoice,
} from "@/lib/utils/voiceoverOptions";
import type { FootieScript, StoryVoiceSettings } from "@/features/story/types";

type VoiceSettingsInput = Pick<FootieScript, "voiceSettings"> & {
  /** @deprecated Migrated into `voiceSettings.speed`. */
  voiceoverSpeed?: number;
};

function resolveStyleFields(input: VoiceSettingsInput): Pick<
  StoryVoiceSettings,
  "stylePreset" | "expressiveDelivery"
> {
  const stylePreset = resolveSpeechStylePreset(input.voiceSettings?.stylePreset);
  const expressiveDelivery = resolveExpressiveDelivery(
    stylePreset,
    input.voiceSettings?.expressiveDelivery,
  );

  if (stylePreset === DEFAULT_SPEECH_STYLE_PRESET) {
    return { stylePreset, expressiveDelivery: false };
  }

  return { stylePreset, expressiveDelivery };
}

/** Normalizes story voice settings with defaults and supported speed presets. */
export function normalizeStoryVoiceSettings(input: VoiceSettingsInput): StoryVoiceSettings {
  const speed = resolveVoiceoverSpeed(input.voiceSettings?.speed ?? input.voiceoverSpeed);
  const styleFields = resolveStyleFields(input);
  const voice = input.voiceSettings?.voice;

  if (voice?.trim()) {
    return {
      voice: resolveVoiceoverVoice(voice),
      speed,
      ...styleFields,
    };
  }

  return {
    speed,
    ...styleFields,
  };
}

/** Returns normalized voice settings, always with `speed` initialized. */
export function getStoryVoiceSettings(script: FootieScript | null | undefined): StoryVoiceSettings {
  if (!script) {
    return { speed: DEFAULT_VOICEOVER_SPEED, stylePreset: DEFAULT_SPEECH_STYLE_PRESET, expressiveDelivery: false };
  }

  return normalizeStoryVoiceSettings(script);
}
