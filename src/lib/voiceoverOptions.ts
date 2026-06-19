export const VOICEOVER_VOICE_OPTIONS = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
] as const;

export type VoiceoverVoiceOption = (typeof VOICEOVER_VOICE_OPTIONS)[number];

export const DEFAULT_VOICEOVER_VOICE: VoiceoverVoiceOption = "alloy";

const VALID_VOICES = new Set<string>([
  ...VOICEOVER_VOICE_OPTIONS,
  "ash",
  "ballad",
  "coral",
  "sage",
  "verse",
  "marin",
  "cedar",
]);

export function resolveVoiceoverVoice(voice: unknown): string {
  if (typeof voice === "string") {
    const normalized = voice.trim().toLowerCase();
    if (VALID_VOICES.has(normalized)) {
      return normalized;
    }
  }
  return DEFAULT_VOICEOVER_VOICE;
}
