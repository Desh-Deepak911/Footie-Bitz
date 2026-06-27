import type { StoryCreationBrief } from "@/features/drafts";
import type { QualityMode, Tone } from "@/types/footiebitz";

const TONE_LABELS: Record<Tone, string> = {
  dramatic: "Dramatic",
  funny: "Funny",
  tactical: "Tactical",
  news: "News",
  emotional: "Emotional",
};

const QUALITY_LABELS: Record<QualityMode, string> = {
  cheap: "Fast",
  balanced: "Balanced",
  best: "Best quality",
};

/** Creator-facing research confidence from persisted brief flags (no refetch). */
export function resolveBriefResearchConfidenceLabel(
  brief?: StoryCreationBrief,
): string | null {
  const researchEnabled = Boolean(brief?.enableResearch ?? brief?.footballResearch);
  if (!researchEnabled) {
    return null;
  }

  if (brief?.researchApplied && !brief?.researchWarning) {
    return "High";
  }

  if (brief?.researchApplied && brief?.researchWarning) {
    return "Medium";
  }

  if (brief?.researchWarning) {
    return "Low";
  }

  return "Limited";
}

export function resolveBriefToneLabel(tone?: Tone): string {
  if (!tone) {
    return "Dramatic";
  }

  return TONE_LABELS[tone] ?? tone;
}

export function resolveBriefQualityLabel(qualityMode?: QualityMode): string {
  if (!qualityMode) {
    return QUALITY_LABELS.balanced;
  }

  return QUALITY_LABELS[qualityMode] ?? qualityMode;
}
