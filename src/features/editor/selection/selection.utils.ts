import type { FootieScript } from "@/features/story/types";

export function resolveSafeSceneIndex(
  scenes: FootieScript["scenes"],
  selectedSceneIndex: number,
): number {
  if (scenes.length === 0) {
    return -1;
  }

  return Math.min(Math.max(selectedSceneIndex, 0), scenes.length - 1);
}

export function resolveSelectedScene(script: FootieScript, selectedSceneIndex: number) {
  const safeIndex = resolveSafeSceneIndex(script.scenes, selectedSceneIndex);
  return safeIndex >= 0 ? (script.scenes[safeIndex] ?? null) : null;
}

export function resolveSceneIndexById(script: FootieScript, sceneId: string): number {
  return script.scenes.findIndex((scene) => scene.id === sceneId);
}
