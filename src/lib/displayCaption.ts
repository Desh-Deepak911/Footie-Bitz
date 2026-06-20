import { normalizeCaptionMode } from "@/lib/captionMode";
import type { FootieScene } from "@/types/footiebitz";

const PLACEHOLDER_CAPTION = "Add subtitle...";

export type DisplayCaptionScene = Pick<
  FootieScene,
  "captionMode" | "subtitle" | "narration" | "subtitleEffect"
> & {
  /** Generated on-screen caption (alias for `subtitle` when present). */
  caption?: string;
};

function normalizeCaptionText(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed || trimmed === PLACEHOLDER_CAPTION) {
    return "";
  }
  return trimmed;
}

function getGeneratedCaption(scene: DisplayCaptionScene): string {
  return normalizeCaptionText(scene.caption ?? scene.subtitle);
}

/**
 * Returns the caption text that should be shown for a scene.
 * - `subtitles` mode → scene narration excerpt
 * - otherwise → generated scene caption (`caption` or legacy `subtitle`)
 */
export function getDisplayCaption(scene: DisplayCaptionScene): string {
  if (normalizeCaptionMode(scene.captionMode) === "subtitles") {
    return normalizeCaptionText(scene.narration);
  }
  return getGeneratedCaption(scene);
}

/**
 * Splits long caption/narration text into short readable lines (deterministic).
 * Words are grouped by `maxWordsPerLine`; whitespace is normalized between words.
 */
export function splitCaptionIntoLines(text: string, maxWordsPerLine = 6): string[] {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return [];
  }

  const wordsPerLine = Math.max(1, Math.floor(maxWordsPerLine));
  const words = normalized.split(" ");
  const lines: string[] = [];

  for (let index = 0; index < words.length; index += wordsPerLine) {
    lines.push(words.slice(index, index + wordsPerLine).join(" "));
  }

  return lines;
}

/** Convenience: display caption split into readable lines for rendering. */
export function getDisplayCaptionLines(
  scene: DisplayCaptionScene,
  maxWordsPerLine = 6,
): string[] {
  return splitCaptionIntoLines(getDisplayCaption(scene), maxWordsPerLine);
}

/**
 * Splits full story narration into per-scene excerpts proportional to scene duration.
 * Deterministic — no AI.
 */
export function deriveSceneNarrationExcerpts(
  fullNarration: string,
  scenes: FootieScene[],
): string[] {
  const words = fullNarration.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (words.length === 0 || scenes.length === 0) {
    return scenes.map(() => "");
  }

  if (scenes.length === 1) {
    return [words.join(" ")];
  }

  const weights = scenes.map((scene) => Math.max(1, scene.duration));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const excerpts: string[] = [];
  let wordIndex = 0;

  for (let index = 0; index < scenes.length; index++) {
    if (index === scenes.length - 1) {
      excerpts.push(words.slice(wordIndex).join(" "));
      break;
    }

    const remainingScenes = scenes.length - index - 1;
    const remainingWords = words.length - wordIndex;
    const proportion = weights[index] / totalWeight;
    const idealCount = Math.max(1, Math.round(words.length * proportion));
    const maxCount = Math.max(1, remainingWords - remainingScenes);
    const count = Math.min(idealCount, maxCount);

    excerpts.push(words.slice(wordIndex, wordIndex + count).join(" "));
    wordIndex += count;
  }

  return excerpts;
}

export function deriveSceneNarrationExcerpt(
  fullNarration: string,
  sceneIndex: number,
  scenes: FootieScene[],
): string {
  return deriveSceneNarrationExcerpts(fullNarration, scenes)[sceneIndex] ?? "";
}

/**
 * Keeps per-scene `narration` excerpts in sync for scenes in subtitles mode.
 * Deterministic — no AI.
 */
export function syncScenesSubtitlesNarration(
  scenes: FootieScene[],
  fullNarration: string,
): FootieScene[] {
  const hasSubtitlesScenes = scenes.some(
    (scene) => normalizeCaptionMode(scene.captionMode) === "subtitles",
  );

  if (!hasSubtitlesScenes) {
    return scenes;
  }

  const excerpts = deriveSceneNarrationExcerpts(fullNarration, scenes);

  return scenes.map((scene, index) =>
    normalizeCaptionMode(scene.captionMode) === "subtitles"
      ? { ...scene, narration: excerpts[index] ?? "" }
      : scene,
  );
}
