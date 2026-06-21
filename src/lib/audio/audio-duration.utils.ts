import { getMp3DurationSeconds } from "./mp3-duration.utils";

const WORDS_PER_SECOND = 2.4;
const ESTIMATION_BUFFER_MS = 400;
const MIN_NARRATION_DURATION_MS = 3000;

function countNarrationWords(text: string): number {
  return text.trim().replace(/\s+/g, " ").split(" ").filter(Boolean).length;
}

/** Estimates spoken narration length from word count. */
export function estimateNarrationDurationMs(text: string): number {
  const words = countNarrationWords(text);
  if (words === 0) {
    return MIN_NARRATION_DURATION_MS;
  }

  const estimatedMs = Math.round((words / WORDS_PER_SECOND) * 1000 + ESTIMATION_BUFFER_MS);
  return Math.max(MIN_NARRATION_DURATION_MS, estimatedMs);
}

async function getDurationMsFromMp3Blob(blob: Blob): Promise<number | null> {
  const buffer = await blob.arrayBuffer();
  const durationSec = getMp3DurationSeconds(buffer);
  return durationSec > 0 ? Math.round(durationSec * 1000) : null;
}

function getDurationMsFromAudioElement(src: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";

    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
      audio.src = "";
    };

    const onLoaded = () => {
      cleanup();
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve(Math.round(audio.duration * 1000));
        return;
      }
      reject(new Error("Audio duration unavailable"));
    };

    const onError = () => {
      cleanup();
      reject(new Error("Failed to load audio metadata"));
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.src = src;
  });
}

/**
 * Returns measured audio duration in milliseconds when metadata is available.
 * In the browser, prefers HTMLAudioElement metadata; falls back to MP3 frame parsing for blobs.
 * Outside the browser, MP3 frame parsing is used for Blob input only.
 */
export async function getAudioDurationMs(
  audioUrlOrBlob: string | Blob,
): Promise<number | null> {
  if (typeof window !== "undefined" && typeof Audio !== "undefined") {
    if (audioUrlOrBlob instanceof Blob) {
      const objectUrl = URL.createObjectURL(audioUrlOrBlob);

      try {
        return await getDurationMsFromAudioElement(objectUrl);
      } catch {
        return getDurationMsFromMp3Blob(audioUrlOrBlob);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }

    try {
      return await getDurationMsFromAudioElement(audioUrlOrBlob);
    } catch {
      return null;
    }
  }

  if (audioUrlOrBlob instanceof Blob) {
    return getDurationMsFromMp3Blob(audioUrlOrBlob);
  }

  return null;
}
