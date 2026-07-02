/**
 * Preview playback rate for canonical voiceover MP3.
 *
 * OpenAI TTS encodes story speed in the generated MP3 (`speed` on speech.create).
 * Preview must not re-apply `HTMLAudioElement.playbackRate` for those files or audio
 * will sound faster than export (which muxes the raw MP3).
 *
 * Keep aligned with `OPENAI_TTS_SUPPORTS_PLAYBACK_SPEED` in voiceover.service.ts.
 */
export const VOICEOVER_SPEED_BAKED_BY_TTS_PROVIDER = true;

export interface ResolvePreviewVoiceoverPlaybackRateOptions {
  /** Nominal story speed from voice settings / audio track metadata (UI + stale detection). */
  nominalSpeed?: number;
  /**
   * When true, speed is already encoded in the MP3 and preview playbackRate must be 1.
   * Defaults to {@link VOICEOVER_SPEED_BAKED_BY_TTS_PROVIDER} for OpenAI-generated voiceovers.
   */
  speedAppliedByProvider?: boolean;
}

/** Whether provider-encoded speed should suppress preview playbackRate adjustment. */
export function isVoiceoverSpeedAppliedByProvider(
  speedAppliedByProvider?: boolean,
): boolean {
  return speedAppliedByProvider ?? VOICEOVER_SPEED_BAKED_BY_TTS_PROVIDER;
}

/**
 * Resolves HTMLAudioElement.playbackRate for preview narration playback.
 * Browser speechSynthesis fallback uses utterance.rate separately — not this helper.
 */
export function resolvePreviewVoiceoverPlaybackRate(
  options: ResolvePreviewVoiceoverPlaybackRateOptions = {},
): number {
  if (isVoiceoverSpeedAppliedByProvider(options.speedAppliedByProvider)) {
    return 1;
  }

  const nominalSpeed = options.nominalSpeed;
  if (nominalSpeed != null && Number.isFinite(nominalSpeed) && nominalSpeed > 0) {
    return nominalSpeed;
  }

  return 1;
}
