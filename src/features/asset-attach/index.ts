export type {
  AssetAttachDependencies,
  AssetAttachHandoff,
  AssetAttachInput,
  AssetAttachMetadata,
  AssetAttachResult,
  AssetAttachSource,
  AssetAttributionMetadata,
  AssetMaterializationResult,
  AssetMaterializationStrategy,
  MaterializeAssetUrlFn,
  MaterializeAssetUrlInput,
} from "./asset-attach.types";

export {
  assetHasAttachableUrls,
  buildAssetAttachMetadata,
  mapNormalizedAssetToAttribution,
  resolveAssetMaterializationUrl,
} from "./asset-attach.utils";

export { attachNormalizedAssetToScene } from "./asset-attach.service";
