import {
  SUBTITLE_ESTIMATED_CHARS_PER_LINE,
  SUBTITLE_MAX_VISIBLE_LINES,
} from "./subtitle.utils";

export type MeasureTextWidth = (text: string) => number;

export interface WrapSubtitleLinesOptions {
  maxLines?: number;
  maxCharsPerLine?: number;
}

/** Word-wraps subtitle copy into at most `maxLines` rows using a width measure. */
export function wrapSubtitleTextToLines(
  text: string,
  maxWidth: number,
  measureWidth: MeasureTextWidth,
  maxLines: number = SUBTITLE_MAX_VISIBLE_LINES,
): string[] {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return [];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (current && measureWidth(candidate) > maxWidth) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) {
        return lines;
      }
      continue;
    }

    current = candidate;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

/** Estimates display lines for preview/export metadata without canvas metrics. */
export function wrapSubtitleTextToDisplayLines(
  text: string,
  options: WrapSubtitleLinesOptions = {},
): string[] {
  const maxLines = options.maxLines ?? SUBTITLE_MAX_VISIBLE_LINES;
  const maxCharsPerLine = options.maxCharsPerLine ?? SUBTITLE_ESTIMATED_CHARS_PER_LINE;

  return wrapSubtitleTextToLines(
    text,
    maxCharsPerLine,
    (line) => line.length,
    maxLines,
  );
}

/** Canvas helper — wraps using measured glyph widths. */
export function wrapSubtitleTextForCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = SUBTITLE_MAX_VISIBLE_LINES,
): string[] {
  return wrapSubtitleTextToLines(text, maxWidth, (line) => ctx.measureText(line).width, maxLines);
}
