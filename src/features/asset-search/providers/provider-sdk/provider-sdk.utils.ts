import type { AssetSearchProviderId } from "../../orchestrator/asset-search.types";

import type {
  AssetSearchProviderMetadata,
  ProviderCapabilityMatch,
  ProviderCapabilityRequirement,
  ProviderCapabilities,
  ProviderHealth,
  ProviderHealthStatus,
} from "./provider-sdk.types";

const CAPABILITY_KEYS = [
  "supportsPortrait",
  "supportsAction",
  "supportsHistorical",
  "supportsIllustrations",
  "supportsTransparentBackground",
  "supportsEditorial",
  "supportsCommercialUse",
  "supportsLandscape",
  "supportsSquare",
  "supportsVertical",
  "supportsVideo",
  "supportsAI",
  "supportsArchive",
] as const;

function cloneCapabilities(capabilities: ProviderCapabilities): ProviderCapabilities {
  return { ...capabilities };
}

function listRequiredCapabilities(requirement?: ProviderCapabilities): string[] {
  if (!requirement) {
    return [];
  }

  return Object.entries(requirement)
    .filter(([, enabled]) => enabled === true)
    .map(([key]) => key);
}

function scoreCapabilities(
  metadata: AssetSearchProviderMetadata,
  requirement: ProviderCapabilityRequirement,
): ProviderCapabilityMatch {
  const requiredKeys = listRequiredCapabilities(requirement.required);
  const preferredKeys = listRequiredCapabilities(requirement.preferred);
  const matchedCapabilities: string[] = [];
  const missingCapabilities: string[] = [];

  for (const key of requiredKeys) {
    if (metadata.capabilities[key]) {
      matchedCapabilities.push(key);
    } else {
      missingCapabilities.push(key);
    }
  }

  for (const key of preferredKeys) {
    if (metadata.capabilities[key]) {
      matchedCapabilities.push(key);
    }
  }

  const requiredScore =
    requiredKeys.length === 0
      ? 1
      : matchedCapabilities.filter((key) => requiredKeys.includes(key)).length /
        requiredKeys.length;

  const preferredScore =
    preferredKeys.length === 0
      ? 0
      : matchedCapabilities.filter((key) => preferredKeys.includes(key)).length /
        preferredKeys.length;

  const priorityBoost = Math.max(0, 1 - metadata.priority / 100);
  const score = requiredScore * 0.7 + preferredScore * 0.2 + priorityBoost * 0.1;

  return {
    metadata,
    score,
    matchedCapabilities: [...new Set(matchedCapabilities)],
    missingCapabilities,
  };
}

/** Validates immutable provider metadata shape. */
export function validateProviderMetadata(metadata: AssetSearchProviderMetadata): string[] {
  const issues: string[] = [];

  if (!metadata.id.trim()) {
    issues.push("metadata.id is required");
  }
  if (!metadata.displayName.trim()) {
    issues.push("metadata.displayName is required");
  }
  if (!metadata.version.trim()) {
    issues.push("metadata.version is required");
  }
  if (!metadata.logo.trim()) {
    issues.push("metadata.logo is required");
  }
  if (metadata.priority < 0) {
    issues.push("metadata.priority must be non-negative");
  }

  return issues;
}

/** Returns whether metadata satisfies minimum capability requirements. */
export function metadataMeetsCapabilityRequirement(
  metadata: AssetSearchProviderMetadata,
  requirement: ProviderCapabilityRequirement,
): boolean {
  const match = scoreCapabilities(metadata, requirement);
  const minimumMatches = requirement.minimumMatches ?? listRequiredCapabilities(requirement.required).length;

  if (listRequiredCapabilities(requirement.required).length === 0) {
    return true;
  }

  return (
    match.missingCapabilities.length === 0 &&
    match.matchedCapabilities.filter((key) =>
      listRequiredCapabilities(requirement.required).includes(key),
    ).length >= minimumMatches
  );
}

/** Ranks providers by capability metadata only — no execution. */
export function resolveProvidersByCapability(
  catalog: readonly AssetSearchProviderMetadata[],
  requirement: ProviderCapabilityRequirement,
): ProviderCapabilityMatch[] {
  return catalog
    .map((metadata) => scoreCapabilities(metadata, requirement))
    .filter((match) => metadataMeetsCapabilityRequirement(match.metadata, requirement))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.metadata.priority - right.metadata.priority;
    });
}

/** Builds a provider health snapshot. */
export function buildProviderHealth(
  status: ProviderHealthStatus,
  message?: string,
): ProviderHealth {
  return {
    status,
    message,
    checkedAt: new Date().toISOString(),
  };
}

/** Returns known capability keys for verification and diagnostics. */
export function listKnownProviderCapabilityKeys(): readonly string[] {
  return CAPABILITY_KEYS;
}

/** Freezes provider metadata for registry insertion. */
export function freezeProviderMetadata(
  metadata: AssetSearchProviderMetadata,
): AssetSearchProviderMetadata {
  return Object.freeze({
    ...metadata,
    capabilities: Object.freeze(cloneCapabilities(metadata.capabilities)),
    rateLimits: Object.freeze({ ...metadata.rateLimits }),
    authentication: Object.freeze({ ...metadata.authentication }),
  });
}

/** Returns metadata by id from a catalog. */
export function findProviderMetadataById(
  catalog: readonly AssetSearchProviderMetadata[],
  id: AssetSearchProviderId,
): AssetSearchProviderMetadata | undefined {
  return catalog.find((entry) => entry.id === id);
}
