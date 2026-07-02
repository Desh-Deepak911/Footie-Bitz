export type {
  AssetSearchProviderAsset,
  AssetSearchProviderResult,
  AssetSearchResultNormalizer,
} from "./provider.types";

export type {
  AssetSearchProvider,
  AssetSearchProviderMetadata,
  ProviderAuthentication,
  ProviderAuthenticationType,
  ProviderCapabilities,
  ProviderCapabilityMatch,
  ProviderCapabilityRequirement,
  ProviderError,
  ProviderHealth,
  ProviderHealthStatus,
  ProviderRateLimit,
  ProviderSearchContext,
  ProviderSearchResult,
} from "./provider-sdk";

export {
  ASSET_SEARCH_PROVIDER_SDK_VERSION,
  buildProviderHealth,
  findProviderMetadataById,
  freezeProviderMetadata,
  listKnownProviderCapabilityKeys,
  metadataMeetsCapabilityRequirement,
  resolveProvidersByCapability as rankProvidersByCapability,
  validateProviderMetadata,
} from "./provider-sdk";

export {
  getProvider,
  getProviderMetadata,
  getProviderMetadataCatalog,
  getProviders,
  listRegisteredProviderIds,
  resolveDefaultProviderOrder,
  resolveProviderOrder,
  resolveProvidersByCapability,
} from "./provider.registry";

export {
  MOCK_ASSET_SEARCH_PROVIDER_ID,
  MOCK_ASSET_SEARCH_PROVIDER_METADATA,
  MockAssetSearchProvider,
  generateDeterministicMockAssets,
} from "./mock.provider";

export {
  PEXELS_ASSET_SEARCH_PROVIDER_METADATA,
  PEXELS_PROVIDER_ID,
  PexelsAssetSearchProvider,
  isPexelsProviderAvailable,
  setPexelsFetchForTests,
} from "./pexels";
