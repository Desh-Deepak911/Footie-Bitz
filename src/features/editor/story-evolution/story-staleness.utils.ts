import type { CreatorAssetPlanningCacheEntry } from "@/features/editor/creator-asset-planning/creator-asset-planning.types";
import { buildScriptHash } from "@/features/editor/creator-asset-planning/creator-asset-planning.utils";
import type { FootieScript } from "@/features/story/types";

import { getStoryChangeRule, STORY_CHANGE_GRAPH } from "./story-change-graph";
import type {
  AffectedPlanningScope,
  PlanningStaleness,
  StalenessScore,
  StoryChangeEvent,
  StoryChangeType,
} from "./story-evolution.types";

const FRESH_STALENESS: PlanningStaleness = {
  isStale: false,
  score: 0,
  reasons: [],
  affectedScopes: [],
  voiceoverSyncRequired: false,
  staleSince: new Date(0).toISOString(),
};

function uniqueTypes(events: StoryChangeEvent[]): StoryChangeType[] {
  return [...new Set(events.map((event) => event.type))];
}

function mergeScopes(scopes: readonly AffectedPlanningScope[]): AffectedPlanningScope[] {
  const merged = new Set<AffectedPlanningScope>();

  for (const scope of scopes) {
    if (scope !== "none") {
      merged.add(scope);
    }
  }

  return [...merged];
}

function maxPlanningScore(events: StoryChangeEvent[]): StalenessScore {
  let score = 0;

  for (const event of events) {
    const rule = getStoryChangeRule(event.type);
    if (!rule.affectsAssetPlanning) {
      continue;
    }

    score = Math.max(score, rule.planningScore);
  }

  return score;
}

/** Computes planning staleness from detected change events. */
export function computePlanningStaleness(
  events: StoryChangeEvent[],
  cachedEntry: CreatorAssetPlanningCacheEntry | null | undefined,
  currentScript: FootieScript,
): PlanningStaleness {
  const currentScriptHash = buildScriptHash(currentScript);

  if (!cachedEntry || events.length === 0) {
    return {
      ...FRESH_STALENESS,
      staleSince: new Date().toISOString(),
      lastPlanningHash: cachedEntry?.scriptHash,
      currentScriptHash,
    };
  }

  const planningEvents = events.filter((event) => getStoryChangeRule(event.type).affectsAssetPlanning);
  const voiceoverSyncRequired = events.some(
    (event) => getStoryChangeRule(event.type).affectsVoiceoverSync,
  );

  const reasons = uniqueTypes(planningEvents.length > 0 ? planningEvents : events);
  const affectedScopes = mergeScopes(
    events.flatMap((event) => getStoryChangeRule(event.type).planningScopes),
  );
  const score = maxPlanningScore(events);
  const hashDrift = cachedEntry.scriptHash !== currentScriptHash;

  return {
    isStale: score > 0 || hashDrift,
    score: hashDrift ? Math.max(score, 0.2) : score,
    reasons,
    affectedScopes,
    voiceoverSyncRequired,
    staleSince: new Date().toISOString(),
    lastPlanningHash: cachedEntry.scriptHash,
    currentScriptHash,
  };
}

/** Exposes the default story change graph for verification and docs. */
export function getStoryChangeGraph() {
  return STORY_CHANGE_GRAPH;
}
