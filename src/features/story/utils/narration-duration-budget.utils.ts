/** Spoken narration pacing assumption for script-only generation. */
export const NARRATION_WORDS_PER_SECOND = 2.4;

/** Maximum allowed stretch vs the user-selected target duration. */
export const NARRATION_MAX_DURATION_STRETCH = 1.35;

const MIN_ESTIMATED_DURATION_MS = 3000;
const ESTIMATION_BUFFER_MS = 400;

const WORD_BUDGET_PRESETS: Record<
  number,
  { idealMinWords: number; idealMaxWords: number; hardCapWords: number }
> = {
  30: { idealMinWords: 70, idealMaxWords: 80, hardCapWords: 105 },
  45: { idealMinWords: 105, idealMaxWords: 115, hardCapWords: 145 },
  60: { idealMinWords: 145, idealMaxWords: 155, hardCapWords: 190 },
};

/** Studio duration presets → allowed max_output_tokens range (includes JSON wrapper headroom). */
const NARRATION_MAX_OUTPUT_TOKEN_RANGES: Record<number, { min: number; max: number }> = {
  30: { min: 350, max: 450 },
  45: { min: 500, max: 650 },
  60: { min: 700, max: 850 },
  90: { min: 950, max: 1100 },
};

function midpointTokenRange(range: { min: number; max: number }): number {
  return Math.round((range.min + range.max) / 2);
}

const NARRATION_MAX_OUTPUT_TOKEN_ANCHORS: Array<{ duration: number; tokens: number }> = [
  { duration: 15, tokens: NARRATION_MAX_OUTPUT_TOKEN_RANGES[30]!.min },
  { duration: 30, tokens: midpointTokenRange(NARRATION_MAX_OUTPUT_TOKEN_RANGES[30]!) },
  { duration: 45, tokens: midpointTokenRange(NARRATION_MAX_OUTPUT_TOKEN_RANGES[45]!) },
  { duration: 60, tokens: midpointTokenRange(NARRATION_MAX_OUTPUT_TOKEN_RANGES[60]!) },
  { duration: 90, tokens: midpointTokenRange(NARRATION_MAX_OUTPUT_TOKEN_RANGES[90]!) },
];

function clampDurationForOutputTokens(targetSeconds: number): number {
  return Math.max(15, Math.min(90, Math.round(targetSeconds)));
}

function interpolateOutputTokens(targetSeconds: number): number {
  const anchors = NARRATION_MAX_OUTPUT_TOKEN_ANCHORS;

  if (targetSeconds <= anchors[0]!.duration) {
    return anchors[0]!.tokens;
  }

  const last = anchors[anchors.length - 1]!;
  if (targetSeconds >= last.duration) {
    return last.tokens;
  }

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const left = anchors[index]!;
    const right = anchors[index + 1]!;

    if (targetSeconds >= left.duration && targetSeconds <= right.duration) {
      const progress = (targetSeconds - left.duration) / (right.duration - left.duration);
      return Math.round(left.tokens + (right.tokens - left.tokens) * progress);
    }
  }

  return last.tokens;
}

/**
 * Approximate max_output_tokens for narration-only JSON generation.
 * Scales with target duration and leaves room for `{ "title", "narration" }` output.
 */
export function resolveNarrationMaxOutputTokens(targetSeconds: number): number {
  const duration = clampDurationForOutputTokens(targetSeconds);
  const preset = NARRATION_MAX_OUTPUT_TOKEN_RANGES[duration];

  if (preset) {
    return midpointTokenRange(preset);
  }

  return interpolateOutputTokens(duration);
}

export function getNarrationMaxOutputTokenRange(
  targetSeconds: number,
): { min: number; max: number } {
  const duration = clampDurationForOutputTokens(targetSeconds);
  const preset = NARRATION_MAX_OUTPUT_TOKEN_RANGES[duration];

  if (preset) {
    return preset;
  }

  const tokens = resolveNarrationMaxOutputTokens(duration);
  return {
    min: Math.max(NARRATION_MAX_OUTPUT_TOKEN_RANGES[30]!.min, tokens - 50),
    max: tokens + 50,
  };
}

export interface NarrationWordBudget {
  targetSeconds: number;
  idealMinWords: number;
  idealMaxWords: number;
  hardCapWords: number;
  maxDurationSeconds: number;
}

function clampTargetSeconds(targetSeconds: number): number {
  return Math.max(15, Math.min(60, Math.round(targetSeconds)));
}

/**
 * Returns ideal and hard word limits for a target spoken duration.
 * Presets match 30s / 45s / 60s studio options; other values interpolate from pace rules.
 */
export function getNarrationWordBudget(targetSeconds: number): NarrationWordBudget {
  const target = clampTargetSeconds(targetSeconds);
  const preset = WORD_BUDGET_PRESETS[target];
  const maxDurationSeconds = Math.round(target * NARRATION_MAX_DURATION_STRETCH * 10) / 10;

  if (preset) {
    return {
      targetSeconds: target,
      maxDurationSeconds,
      ...preset,
    };
  }

  const center = Math.round(target * NARRATION_WORDS_PER_SECOND);

  return {
    targetSeconds: target,
    idealMinWords: center - 5,
    idealMaxWords: center + 5,
    hardCapWords: Math.round(target * NARRATION_MAX_DURATION_STRETCH * NARRATION_WORDS_PER_SECOND),
    maxDurationSeconds,
  };
}

/** Counts spoken words in narration text (whitespace-normalized). */
export function countWords(text: string): number {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean).length;
}

/** Estimates spoken narration length from word count at {@link NARRATION_WORDS_PER_SECOND}. */
export function estimateNarrationDurationMs(text: string): number {
  const words = countWords(text);
  if (words === 0) {
    return MIN_ESTIMATED_DURATION_MS;
  }

  const estimatedMs = Math.round(
    (words / NARRATION_WORDS_PER_SECOND) * 1000 + ESTIMATION_BUFFER_MS,
  );

  return Math.max(MIN_ESTIMATED_DURATION_MS, estimatedMs);
}

/** Warn on review when estimated spoken duration exceeds target by more than this fraction. */
export const SCRIPT_DURATION_OVER_TARGET_STRETCH = 0.35;

export const SCRIPT_LENGTH_OVER_TARGET_WARNING =
  "Script is longer than target. Shorten it or regenerate.";

export function getEstimatedScriptDurationSeconds(narration: string): number {
  return Math.round(estimateNarrationDurationMs(narration) / 1000);
}

export function exceedsTargetScriptDuration(
  narration: string,
  targetDurationSeconds: number,
  stretch = SCRIPT_DURATION_OVER_TARGET_STRETCH,
): boolean {
  if (!Number.isFinite(targetDurationSeconds) || targetDurationSeconds <= 0) {
    return false;
  }

  return (
    getEstimatedScriptDurationSeconds(narration) >
    Math.round(targetDurationSeconds * (1 + stretch))
  );
}

export function exceedsNarrationWordBudget(text: string, budget: NarrationWordBudget): boolean {
  return countWords(text) > budget.hardCapWords;
}

/** Maximum estimated spoken duration allowed for a target budget (includes stretch). */
export function getMaxNarrationDurationMs(budget: NarrationWordBudget): number {
  return Math.round(budget.maxDurationSeconds * 1000);
}

export function exceedsNarrationDurationBudget(
  text: string,
  budget: NarrationWordBudget,
): boolean {
  return estimateNarrationDurationMs(text) > getMaxNarrationDurationMs(budget);
}

/** True when word count or estimated spoken duration exceeds the script budget. */
export function exceedsNarrationScriptBudget(
  text: string,
  budget: NarrationWordBudget,
): boolean {
  return exceedsNarrationWordBudget(text, budget) || exceedsNarrationDurationBudget(text, budget);
}

export function isWithinNarrationScriptBudget(
  text: string,
  budget: NarrationWordBudget,
): boolean {
  return !exceedsNarrationScriptBudget(text, budget);
}

/**
 * Truncates narration to the hard word cap, preferring a sentence boundary when nearby.
 */
export function truncateNarrationToWordBudget(text: string, hardCapWords: number): string {
  const trimmed = text.trim();
  if (hardCapWords <= 0) {
    return "";
  }

  const words = trimmed.replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (words.length <= hardCapWords) {
    return trimmed;
  }

  const hardCut = words.slice(0, hardCapWords).join(" ");
  const sentenceMatch = hardCut.match(/^[\s\S]*[.!?](?=\s|$)/);

  if (sentenceMatch && countWords(sentenceMatch[0]!) >= Math.floor(hardCapWords * 0.6)) {
    return sentenceMatch[0]!.trim();
  }

  return hardCut.trim();
}

export function enforceNarrationWordBudget(
  narration: string,
  budget: NarrationWordBudget,
): { narration: string; truncated: boolean } {
  if (!exceedsNarrationWordBudget(narration, budget)) {
    return { narration: narration.trim(), truncated: false };
  }

  return {
    narration: truncateNarrationToWordBudget(narration, budget.hardCapWords),
    truncated: true,
  };
}
