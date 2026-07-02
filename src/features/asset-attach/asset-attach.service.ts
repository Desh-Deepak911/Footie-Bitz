import { createSceneImageFromUrl, getSceneImage } from "@/features/story/utils";
import { applySceneUpdate } from "@/lib/utils/voiceover";

import {
  assetHasAttachableUrls,
  buildAssetAttachMetadata,
  resolveAssetMaterializationUrl,
} from "./asset-attach.utils";
import type {
  AssetAttachDependencies,
  AssetAttachInput,
  AssetAttachResult,
} from "./asset-attach.types";

function cloneSceneImage<T>(value: T | undefined): T | undefined {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Attaches a normalized asset to a scene using injectable URL materialization.
 * Never mutates the input asset or calls provider/search APIs.
 */
export async function attachNormalizedAssetToScene(
  input: AssetAttachInput,
  deps: AssetAttachDependencies,
): Promise<AssetAttachResult> {
  const scene = input.script.scenes.find((entry) => entry.id === input.sceneId);
  if (!scene) {
    return {
      success: false,
      sceneId: input.sceneId,
      warnings: [],
      error: `scene "${input.sceneId}" was not found`,
    };
  }

  if (!assetHasAttachableUrls(input.asset)) {
    return {
      success: false,
      sceneId: input.sceneId,
      warnings: [],
      error: "asset is missing preview and full-resolution URLs",
    };
  }

  const sourceUrl = resolveAssetMaterializationUrl(
    input.asset,
    input.options?.preferFullResolution ?? false,
  );

  if (!sourceUrl) {
    return {
      success: false,
      sceneId: input.sceneId,
      warnings: [],
      error: "asset is missing preview and full-resolution URLs",
    };
  }

  const previousSceneImage = cloneSceneImage(getSceneImage(scene));
  const previousAttachMetadata = cloneSceneImage(scene.assetAttachment);

  const materialization = await deps.materializeAssetUrl({
    asset: input.asset,
    sourceUrl,
    preferFullResolution: input.options?.preferFullResolution,
  });

  if (!materialization.success || !materialization.playableUrl?.trim()) {
    return {
      success: false,
      sceneId: input.sceneId,
      warnings: materialization.warnings ?? [],
      error: materialization.error ?? "asset materialization failed",
      previousSceneImage,
      previousAttachMetadata,
    };
  }

  const sceneImage = createSceneImageFromUrl(materialization.playableUrl.trim());
  if (input.options?.fitMode) {
    sceneImage.fitMode = input.options.fitMode;
  }

  const attachMetadata = buildAssetAttachMetadata({
    asset: input.asset,
    source: input.source,
    handoff: input.handoff,
    materialization: {
      strategy: materialization.strategy,
      persisted: materialization.persisted ?? false,
    },
  });

  const applyUpdate =
    deps.applyUpdate ??
    ((script, sceneId, updates) =>
      applySceneUpdate(script, sceneId, {
        image: updates.image,
        uploadedImage: updates.uploadedImage,
        assetAttachment: updates.assetAttachment,
      }));

  const nextScript = applyUpdate(input.script, input.sceneId, {
    image: sceneImage,
    uploadedImage: undefined,
    assetAttachment: attachMetadata,
  });

  return {
    success: true,
    script: nextScript,
    sceneId: input.sceneId,
    sceneImage,
    attachMetadata,
    warnings: materialization.warnings ?? [],
    previousSceneImage,
    previousAttachMetadata,
  };
}
