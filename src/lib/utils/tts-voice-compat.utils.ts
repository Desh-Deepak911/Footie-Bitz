import { resolveVoiceoverVoice } from "@/lib/utils/voiceoverOptions";

/** Voices supported by OpenAI `tts-1` / `tts-1-hd`. */
export const TTS_1_VOICES = [
  "alloy",
  "ash",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
] as const;

export type Tts1Voice = (typeof TTS_1_VOICES)[number];

/** Voices that require `gpt-4o-mini-tts` — not available on `tts-1`. */
export const GPT4O_MINI_TTS_ONLY_VOICES = ["ballad", "marin", "verse", "cedar"] as const;

export type Gpt4oMiniTtsOnlyVoice = (typeof GPT4O_MINI_TTS_ONLY_VOICES)[number];

const TTS_1_VOICE_SET = new Set<string>(TTS_1_VOICES);
const GPT4O_MINI_TTS_ONLY_VOICE_SET = new Set<string>(GPT4O_MINI_TTS_ONLY_VOICES);

/** True when the voice must use gpt-4o-mini-tts regardless of delivery style. */
export function voiceRequiresGpt4oMiniTts(voice: unknown): boolean {
  const normalized = resolveVoiceoverVoice(voice);
  return GPT4O_MINI_TTS_ONLY_VOICE_SET.has(normalized);
}

/** True when the voice is supported on tts-1. */
export function voiceSupportsTts1(voice: unknown): boolean {
  const normalized = resolveVoiceoverVoice(voice);
  return TTS_1_VOICE_SET.has(normalized);
}
