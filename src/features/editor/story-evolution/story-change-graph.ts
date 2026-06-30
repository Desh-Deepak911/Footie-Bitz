import type { StoryChangeGraph, StoryChangeRule, StoryChangeType } from "./story-evolution.types";

function rule(
  type: StoryChangeType,
  config: Omit<StoryChangeRule, "type">,
): StoryChangeRule {
  return { type, ...config };
}

/** Default evolution rules — asset planning staleness by change type. */
export const STORY_CHANGE_GRAPH: StoryChangeGraph = {
  "narration.global": rule("narration.global", {
    planningScopes: ["story"],
    planningScore: 1.0,
    refresh: "full_refresh",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: true,
  }),
  "narration.scene_excerpt": rule("narration.scene_excerpt", {
    planningScopes: ["scene"],
    planningScore: 0.3,
    refresh: "none",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: true,
  }),
  "scene.add": rule("scene.add", {
    planningScopes: ["story"],
    planningScore: 1.0,
    refresh: "full_refresh",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.delete": rule("scene.delete", {
    planningScopes: ["story"],
    planningScore: 1.0,
    refresh: "full_refresh",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.duplicate": rule("scene.duplicate", {
    planningScopes: ["story"],
    planningScore: 1.0,
    refresh: "full_refresh",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.reorder": rule("scene.reorder", {
    planningScopes: ["timeline"],
    planningScore: 0.8,
    refresh: "full_refresh",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.duration": rule("scene.duration", {
    planningScopes: ["scene", "timing"],
    planningScore: 0.5,
    refresh: "scene_refresh",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.type": rule("scene.type", {
    planningScopes: ["scene"],
    planningScore: 0.5,
    refresh: "scene_refresh",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.caption": rule("scene.caption", {
    planningScopes: ["scene"],
    planningScore: 0.3,
    refresh: "none",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.subtitle": rule("scene.subtitle", {
    planningScopes: ["scene"],
    planningScore: 0.3,
    refresh: "none",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "scene.image": rule("scene.image", {
    planningScopes: ["none"],
    planningScore: 0,
    refresh: "none",
    affectsAssetPlanning: false,
    affectsVoiceoverSync: false,
  }),
  "scene.motion": rule("scene.motion", {
    planningScopes: ["none"],
    planningScore: 0,
    refresh: "none",
    affectsAssetPlanning: false,
    affectsVoiceoverSync: false,
  }),
  transition: rule("transition", {
    planningScopes: ["none"],
    planningScore: 0,
    refresh: "none",
    affectsAssetPlanning: false,
    affectsVoiceoverSync: false,
  }),
  "project.title": rule("project.title", {
    planningScopes: ["story"],
    planningScore: 0.2,
    refresh: "none",
    affectsAssetPlanning: true,
    affectsVoiceoverSync: false,
  }),
  "voiceover.attach": rule("voiceover.attach", {
    planningScopes: ["voiceover_sync"],
    planningScore: 0,
    refresh: "none",
    affectsAssetPlanning: false,
    affectsVoiceoverSync: true,
  }),
  "voiceover.clear": rule("voiceover.clear", {
    planningScopes: ["voiceover_sync"],
    planningScore: 0,
    refresh: "none",
    affectsAssetPlanning: false,
    affectsVoiceoverSync: true,
  }),
};

/** Returns the evolution rule for a change type. */
export function getStoryChangeRule(type: StoryChangeType): StoryChangeRule {
  return STORY_CHANGE_GRAPH[type];
}
