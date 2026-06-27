"use client";

import {
  normalizeSceneImageMotion,
  normalizeSceneImageMotionIntensity,
  normalizeSceneImageMotionType,
  SCENE_IMAGE_MOTION_INTENSITY_OPTIONS,
  SCENE_IMAGE_MOTION_TYPE_OPTIONS,
} from "@/features/story/utils";
import {
  studioFieldLabel,
  studioImageFitSegment,
  studioImageFitSegmentActive,
  studioImageFitSegmentedControlStacked,
  studioSubtleText,
} from "@/lib/studioUi";
import type {
  SceneImageMotion,
  SceneImageMotionIntensity,
  SceneImageMotionType,
} from "@/features/story/types";

const INSPECTOR_MOTION_TYPE_LABELS: Record<SceneImageMotionType, string> = {
  none: "None",
  "zoom-in": "Slow zoom in",
  "zoom-out": "Slow zoom out",
};

interface SceneImageMotionControlProps {
  imageMotion?: SceneImageMotion;
  controlId: string;
  onMotionChange: (patch: Partial<SceneImageMotion>) => void;
  variant?: "default" | "inspector";
}

export default function SceneImageMotionControl({
  imageMotion,
  controlId,
  onMotionChange,
  variant = "default",
}: SceneImageMotionControlProps) {
  const motion = normalizeSceneImageMotion(imageMotion);
  const activeType = normalizeSceneImageMotionType(motion.type);
  const activeIntensity = normalizeSceneImageMotionIntensity(motion.intensity);
  const showKenBurnsIntensity = activeType !== "none";
  const isInspector = variant === "inspector";

  const handleTypeChange = (type: SceneImageMotionType) => {
    onMotionChange({ type });
  };

  const handleIntensityChange = (intensity: SceneImageMotionIntensity) => {
    onMotionChange({ intensity });
  };

  const motionSectionLabel = isInspector ? "Motion" : "Image Motion";
  const motionSectionDesc = isInspector
    ? "Add slow movement during playback. None keeps the frame static."
    : undefined;

  return (
    <section
      aria-labelledby={`${controlId}-motion-label`}
      className="space-y-2.5 border-t border-border/15 pt-4"
    >
      <div>
        <p id={`${controlId}-motion-label`} className={`${studioFieldLabel} mb-0`}>
          {motionSectionLabel}
        </p>
        {motionSectionDesc ? (
          <p className={`${studioSubtleText} mt-1`}>{motionSectionDesc}</p>
        ) : null}
      </div>
      <div
        className={studioImageFitSegmentedControlStacked}
        role="radiogroup"
        aria-labelledby={`${controlId}-motion-label`}
      >
        {SCENE_IMAGE_MOTION_TYPE_OPTIONS.map((option) => {
          const isActive = activeType === option.value;
          const label = isInspector
            ? INSPECTOR_MOTION_TYPE_LABELS[option.value]
            : option.label;
          const title =
            option.value === "none"
              ? "No motion during playback"
              : option.value === "zoom-in"
                ? "Gradually zoom in during the scene"
                : "Start zoomed and pull back during the scene";

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={title}
              onClick={() => handleTypeChange(option.value)}
              className={isActive ? studioImageFitSegmentActive : studioImageFitSegment}
            >
              {label}
            </button>
          );
        })}
      </div>

      {showKenBurnsIntensity ? (
        <div className="space-y-1.5">
          <div>
            <p className={`${studioFieldLabel} mb-0`}>Ken Burns</p>
            <p className={`${studioSubtleText} mt-1`}>
              Controls how much the image moves during playback.
            </p>
          </div>
          <div
            className={studioImageFitSegmentedControlStacked}
            role="radiogroup"
            aria-label="Ken Burns intensity"
          >
            {SCENE_IMAGE_MOTION_INTENSITY_OPTIONS.map((option) => {
              const isActive = activeIntensity === option.value;
              const intensityTitle =
                option.value === "subtle"
                  ? "Gentle movement"
                  : option.value === "medium"
                    ? "Moderate movement"
                    : "Strong movement";

              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  title={intensityTitle}
                  onClick={() => handleIntensityChange(option.value)}
                  className={isActive ? studioImageFitSegmentActive : studioImageFitSegment}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
