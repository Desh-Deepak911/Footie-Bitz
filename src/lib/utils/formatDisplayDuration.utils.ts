/**
 * Presentation-only duration labels for studio UI.
 * Does not affect timeline math, export timing, or playback calculations.
 */

function formatSubSixtySeconds(durationSec: number): string {
  const rounded = Math.round(durationSec * 10) / 10;
  const compact = parseFloat(rounded.toFixed(1));
  return `${compact}s`;
}

function formatMinuteSecond(durationSec: number): string {
  const totalSec = Math.max(0, Math.floor(durationSec));
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Formats seconds for display: `< 60s` → one decimal; `>= 60s` → `m:ss`. */
export function formatDisplayDurationSec(durationSec: number): string {
  if (!Number.isFinite(durationSec) || durationSec < 0) {
    return "—";
  }

  if (durationSec >= 60) {
    return formatMinuteSecond(durationSec);
  }

  return formatSubSixtySeconds(durationSec);
}

/** Formats milliseconds for display using the same rules as seconds. */
export function formatDisplayDurationMs(durationMs: number): string {
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "—";
  }

  return formatDisplayDurationSec(durationMs / 1000);
}

/** Formats an inclusive start/end range in seconds for display. */
export function formatDisplayTimeRangeSec(startSec: number, endSec: number): string {
  return `${formatDisplayDurationSec(startSec)} – ${formatDisplayDurationSec(endSec)}`;
}
