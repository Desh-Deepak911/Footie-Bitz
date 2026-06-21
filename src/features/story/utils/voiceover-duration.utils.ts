/**
 * When the TTS provider does not encode playback speed, derive timeline duration from
 * the measured audio length and the selected story speed preset.
 */
export function adjustVoiceoverDurationForSpeed(
  originalDurationMs: number,
  speed: number,
  speedAppliedByProvider: boolean,
): number {
  if (!Number.isFinite(originalDurationMs) || originalDurationMs <= 0) {
    return originalDurationMs;
  }

  if (speedAppliedByProvider || speed === 1) {
    return Math.round(originalDurationMs);
  }

  return Math.round(originalDurationMs / Math.max(speed, 0.01));
}
