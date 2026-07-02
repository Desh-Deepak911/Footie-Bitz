export type {
  AssetMaterializationCacheEntry,
  AssetMaterializationPreferredResolution,
  AssetMaterializationRequest,
  AssetMaterializationResult,
  AssetMaterializationStrategy,
  MaterializationFetchFn,
  MaterializeAssetImageDependencies,
} from "./asset-materialization.types";

export {
  buildAssetMaterializationCacheKey,
  buildDataUrlPlayableUrl,
  DEFAULT_MATERIALIZATION_CACHE_TTL_MS,
  DEFAULT_MATERIALIZATION_MAX_BYTES,
  DEFAULT_MATERIALIZATION_TIMEOUT_MS,
  isHttpUrl,
  isSupportedImageMimeType,
  MATERIALIZATION_PLATFORM_VERSION,
  parseImageDimensions,
  resolveMaterializationSourceUrl,
  sniffImageMimeType,
  SUPPORTED_IMAGE_MIME_TYPES,
} from "./asset-materialization.utils";

export {
  getAssetMaterializationCacheSizeForTests,
  readAssetMaterializationCache,
  resetAssetMaterializationCacheForTests,
  writeAssetMaterializationCache,
} from "./asset-materialization.cache";

export {
  materializeAssetImage,
  setMaterializationFetchForTests,
  setMaterializationMaxBytesForTests,
  setMaterializationTimeoutMsForTests,
} from "./asset-materialization.service";
