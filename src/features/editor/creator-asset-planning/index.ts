export {
  CREATOR_ASSET_PLANNING_VERSION,
  type CopilotPlanningReaderPort,
  type CreatorAssetPlanningCache,
  type CreatorAssetPlanningCacheEntry,
  type CreatorAssetPlanningCacheKeyInput,
  type CreatorAssetPlanningCacheMetadata,
  type CreatorAssetPlanningPersistencePort,
  type CreatorAssetPlanningSnapshot,
  type CreatorAssetStudioPlanningData,
  type SearchProviderPlanningReaderPort,
  type SmartEditPlanningReaderPort,
} from "./creator-asset-planning.types";

export {
  createPlanningCache,
  hasPlanningCache,
  invalidatePlanningCache,
  readPlanningCache,
  readPlanningData,
  resetPlanningCachesForTests,
  updatePlanningCache,
  updatePlanningCacheStaleness,
} from "./creator-asset-planning.cache";

export {
  buildCreatorAssetPlanningCacheEntry,
  buildCreatorAssetPlanningFromAssetInput,
  buildCreatorAssetPlanningFromScenePlan,
  buildCreatorAssetPlanningSnapshot,
  buildPlanningCacheKey,
  buildScriptHash,
  cacheCreatorAssetPlanning,
  hasPlanningChanged,
  hydrateCreatorAssetPlanningCache,
} from "./creator-asset-planning.utils";
export type { BuildCreatorAssetPlanningCacheEntryInput } from "./creator-asset-planning.utils";

export {
  useCreatorAssetPlanningCache,
  useCreatorAssetStudioVisible,
} from "./useCreatorAssetPlanningCache";

export {
  buildIdentityMismatchStaleness,
  detectSceneIdentityIndexFallbacks,
  resolvePlanningItemBySceneIdentity,
  resolveSceneProviderByIdentity,
  resolveSceneRecommendationByIdentity,
} from "./creator-asset-scene-identity.utils";
export {
  attachPlanningStaleness,
  buildMetadataDriftStaleness,
  mergeSoftReadStaleness,
  type PlanningReadMode,
  type ReadPlanningDataMetadata,
  type ReadPlanningDataOptions,
} from "./creator-asset-planning-soft-read.utils";
export type {
  ScenePlanningIdentityContext,
  ScenePlanningIdentityMatch,
  ScenePlanningLookupMethod,
} from "./creator-asset-scene-identity.utils";

export {
  refreshCreatorAssetPlanning,
  CREATOR_ASSET_PLANNING_REFRESH_EFFECTIVE_SCOPE,
  type CreatorAssetPlanningRefreshDiagnostics,
  type CreatorAssetPlanningRefreshInput,
  type CreatorAssetPlanningRefreshReason,
  type CreatorAssetPlanningRefreshResult,
  type CreatorAssetPlanningRefreshScope,
} from "../creator-asset-planning-refresh";
