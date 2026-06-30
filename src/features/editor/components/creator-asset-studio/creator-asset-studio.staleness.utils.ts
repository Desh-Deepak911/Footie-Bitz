import type { PlanningStaleness } from "@/features/editor/story-evolution/story-evolution.types";
import { SCENE_IDENTITY_MISMATCH_REASON } from "@/features/editor/story-evolution/story-evolution.types";

export type PlanningStaleBadgeLevel = "partial" | "full" | "identity";

export interface PlanningStaleBadgeViewModel {
  title: string;
  level: PlanningStaleBadgeLevel;
  ariaLabel: string;
}

export interface PlanningStaleChipViewModel {
  id: string;
  label: string;
}

const SCENE_EDIT_TYPES = new Set([
  "scene.caption",
  "scene.subtitle",
  "scene.type",
  "narration.scene_excerpt",
]);

const SCENE_COUNT_TYPES = new Set([
  "scene.add",
  "scene.delete",
  "scene.duplicate",
]);

const STORY_CHANGE_TYPES = new Set([
  "project.title",
  "scene.add",
  "scene.delete",
  "scene.duplicate",
  "narration.global",
]);

const TIMING_CHANGE_TYPES = new Set(["scene.duration"]);

function hasAnyReason(reasons: readonly string[], candidates: Set<string>): boolean {
  return reasons.some((reason) => candidates.has(reason));
}

/** Returns badge copy when planning is stale — null when fresh. */
export function buildPlanningStaleBadge(
  staleness: PlanningStaleness | undefined,
): PlanningStaleBadgeViewModel | null {
  if (!staleness?.isStale) {
    return null;
  }

  if (staleness.reasons.includes(SCENE_IDENTITY_MISMATCH_REASON)) {
    return {
      title: "Scene order changed",
      level: "identity",
      ariaLabel: "Asset recommendations may be outdated because scene order changed.",
    };
  }

  if (staleness.score >= 1) {
    return {
      title: "Recommendations need refresh",
      level: "full",
      ariaLabel: "Asset recommendations need refresh after recent story changes.",
    };
  }

  return {
    title: "Recommendations may be outdated",
    level: "partial",
    ariaLabel: "Asset recommendations may be outdated after recent edits.",
  };
}

/** Maps staleness metadata to user-facing reason chips. */
export function buildPlanningStaleChips(
  staleness: PlanningStaleness | undefined,
): PlanningStaleChipViewModel[] {
  if (!staleness?.isStale) {
    return [];
  }

  const chips: PlanningStaleChipViewModel[] = [];
  const reasons = staleness.reasons;
  const drift = staleness.metadataDrift;

  const pushChip = (id: string, label: string) => {
    if (!chips.some((chip) => chip.id === id)) {
      chips.push({ id, label });
    }
  };

  if (reasons.includes(SCENE_IDENTITY_MISMATCH_REASON) || reasons.includes("scene.reorder")) {
    pushChip("scene_order_changed", "Scene order changed");
  }

  if (drift?.sceneCountDrift || hasAnyReason(reasons, SCENE_COUNT_TYPES)) {
    pushChip("scene_count_changed", "Scene count changed");
  }

  if (reasons.includes("narration.global")) {
    pushChip("narration_changed", "Narration changed");
  }

  if (hasAnyReason(reasons, TIMING_CHANGE_TYPES) || staleness.affectedScopes.includes("timing")) {
    pushChip("timing_changed", "Timing changed");
  }

  if (hasAnyReason(reasons, SCENE_EDIT_TYPES)) {
    pushChip("scene_edited", "Scene edited");
  }

  if (
    hasAnyReason(reasons, STORY_CHANGE_TYPES) ||
    drift?.hashDrift ||
    drift?.storyModeDrift
  ) {
    pushChip("story_changed", "Story changed");
  }

  return chips;
}

/** Secondary copy shown while manual refresh is unavailable. */
export const PLANNING_REFRESH_COMING_SOON_COPY = "Refresh recommendations coming soon.";
