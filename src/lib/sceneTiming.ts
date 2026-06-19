import type { FootieScene } from "@/types/footiebitz";

export function normalizeSceneTiming(scenes: FootieScene[]): FootieScene[] {
  let cursor = 0;

  return scenes.map((scene) => {
    const duration = Math.max(1, scene.duration);
    const start = cursor;
    const end = start + duration;
    cursor = end;

    return {
      ...scene,
      start,
      end,
      duration,
    };
  });
}

export function getStoryTotalDuration(scenes: FootieScene[]): number {
  if (scenes.length === 0) {
    return 0;
  }

  return scenes[scenes.length - 1].end;
}

export function getSceneIndexForTime(currentTimeSec: number, scenes: FootieScene[]): number {
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (currentTimeSec >= scenes[i].start) {
      return i;
    }
  }

  return 0;
}
