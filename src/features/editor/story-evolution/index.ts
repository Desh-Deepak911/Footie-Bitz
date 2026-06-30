export type {
  AffectedPlanningScope,
  PlanningStaleness,
  PlanningStalenessReason,
  RefreshRecommendation,
  StalenessScore,
  StoryChangeEvent,
  StoryChangeGraph,
  StoryChangeRule,
  StoryChangeType,
} from "./story-evolution.types";

export { SCENE_IDENTITY_MISMATCH_REASON } from "./story-evolution.types";
export { mergeIdentityMismatchStaleness } from "./story-identity-staleness.utils";

export { STORY_CHANGE_GRAPH, getStoryChangeRule } from "./story-change-graph";
export { detectStoryChanges, sceneIdsPreservedOnReorder } from "./story-change-detector";
export { computePlanningStaleness, getStoryChangeGraph } from "./story-staleness.utils";
export { applyStoryEvolutionOnEdit } from "./story-evolution.runtime";
