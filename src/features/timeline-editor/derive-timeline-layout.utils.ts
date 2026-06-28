import { getTimelineTrackByType } from "@/features/timeline-intelligence/timeline-utils";
import type {
  MasterTimeline,
  SceneTimelineEvent,
  TransitionTimelineEvent,
} from "@/features/timeline-intelligence/timeline.types";
import type { FootieScript } from "@/features/story/types";

import type {
  TimelineLayoutSegment,
  TimelineLayoutVM,
  TimelineSceneBlockVM,
  TimelineTransitionMarkerVM,
} from "./timeline-editor.types";

function resolveSceneDurationMs(durationMs: number, durationLabelSec: number): number {
  if (durationMs > 0) {
    return durationMs;
  }

  return Math.max(1000, Math.round(durationLabelSec * 1000));
}

function buildSceneBlock(
  event: SceneTimelineEvent,
  totalDurationMs: number,
): TimelineSceneBlockVM {
  const durationMs = Math.max(1, event.durationMs);
  const widthPercent = (durationMs / totalDurationMs) * 100;

  return {
    sceneId: event.metadata.sceneId,
    sceneIndex: event.metadata.sceneIndex,
    sceneNumber: event.metadata.sceneIndex + 1,
    startMs: event.startMs,
    endMs: event.endMs,
    durationMs,
    widthPercent,
    durationLabelSec: durationMs / 1000,
  };
}

function buildTransitionMarker(
  event: TransitionTimelineEvent,
  afterSceneIndex: number,
): TimelineTransitionMarkerVM {
  return {
    id: event.id,
    fromSceneId: event.metadata.fromSceneId,
    toSceneId: event.metadata.toSceneId,
    afterSceneIndex,
    startMs: event.startMs,
    endMs: event.endMs,
    durationMs: event.durationMs,
    transitionType: event.metadata.transitionType,
  };
}

function deriveFromMasterTimeline(
  script: FootieScript,
  masterTimeline: MasterTimeline,
): TimelineLayoutVM {
  const sceneTrack = getTimelineTrackByType(masterTimeline.tracks, "scene");
  const transitionTrack = getTimelineTrackByType(masterTimeline.tracks, "transition");
  const totalDurationMs = Math.max(1, masterTimeline.renderDurationMs);

  const sceneEvents = [...((sceneTrack?.events ?? []) as SceneTimelineEvent[])].sort(
    (left, right) => left.metadata.sceneIndex - right.metadata.sceneIndex,
  );

  if (sceneEvents.length === 0) {
    return deriveEqualFallback(script);
  }

  const transitionsByFromSceneId = new Map<string, TransitionTimelineEvent>();
  for (const event of (transitionTrack?.events ?? []) as TransitionTimelineEvent[]) {
    transitionsByFromSceneId.set(event.metadata.fromSceneId, event);
  }

  const segments: TimelineLayoutSegment[] = [];

  for (let index = 0; index < sceneEvents.length; index += 1) {
    const event = sceneEvents[index]!;
    const block = buildSceneBlock(event, totalDurationMs);
    segments.push({ type: "scene", block });

    const nextEvent = sceneEvents[index + 1];
    const transition = transitionsByFromSceneId.get(event.metadata.sceneId);
    if (
      transition &&
      nextEvent &&
      transition.metadata.toSceneId === nextEvent.metadata.sceneId
    ) {
      segments.push({
        type: "transition",
        marker: buildTransitionMarker(transition, event.metadata.sceneIndex),
      });
    }
  }

  return {
    segments,
    totalDurationMs,
    layoutSource: "master-timeline",
  };
}

function deriveEqualFallback(script: FootieScript): TimelineLayoutVM {
  const scenes = script.scenes;
  const equalPercent = 100 / Math.max(1, scenes.length);
  const totalDurationMs = Math.max(
    1,
    scenes.reduce(
      (sum, scene) => sum + resolveSceneDurationMs(scene.durationMs ?? 0, scene.duration),
      0,
    ),
  );

  const segments: TimelineLayoutSegment[] = scenes.map((scene, index) => {
    const durationMs = resolveSceneDurationMs(scene.durationMs ?? 0, scene.duration);

    return {
      type: "scene",
      block: {
        sceneId: scene.id,
        sceneIndex: index,
        sceneNumber: index + 1,
        startMs: scene.startMs ?? 0,
        endMs: scene.endMs ?? durationMs,
        durationMs,
        widthPercent: equalPercent,
        durationLabelSec: scene.duration,
      },
    };
  });

  return {
    segments,
    totalDurationMs,
    layoutSource: "equal-fallback",
    devWarning: "MasterTimeline unavailable — using equal-width timeline blocks.",
  };
}

/**
 * Derives duration-proportional timeline layout from preview MasterTimeline.
 * Falls back to equal-width blocks when the timeline cannot be built.
 */
export function deriveTimelineLayout(
  script: FootieScript,
  masterTimeline: MasterTimeline | null,
): TimelineLayoutVM {
  if (script.scenes.length === 0) {
    return {
      segments: [],
      totalDurationMs: 0,
      layoutSource: "equal-fallback",
    };
  }

  if (!masterTimeline) {
    return deriveEqualFallback(script);
  }

  const sceneTrack = getTimelineTrackByType(masterTimeline.tracks, "scene");
  if (!sceneTrack?.events.length) {
    return deriveEqualFallback(script);
  }

  return deriveFromMasterTimeline(script, masterTimeline);
}

/** Formats block duration for compact timeline labels. */
export function formatTimelineDurationLabel(durationSec: number): string {
  if (Number.isInteger(durationSec)) {
    return `${durationSec}s`;
  }

  return `${durationSec.toFixed(1)}s`;
}
