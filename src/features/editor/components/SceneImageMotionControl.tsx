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
  studioImageFitSegmentedControl,
} from "@/lib/studioUi";
import type { SceneImageMotion, SceneImageMotionIntensity, SceneImageMotionType } from "@/features/story/types";

interface SceneImageMotionControlProps {
  imageMotion?: SceneImageMotion;
  controlId: string;
  onMotionChange: (patch: Partial<SceneImageMotion>) => void;
}

export default function SceneImageMotionControl({
  imageMotion,
  controlId,
  onMotionChange,
}: SceneImageMotionControlProps) {
  const motion = normalizeSceneImageMotion(imageMotion);
  const activeType = normalizeSceneImageMotionType(motion.type);
  const activeIntensity = normalizeSceneImageMotionIntensity(motion.intensity);
  const showIntensity = activeType !== "none";

  const handleTypeChange = (type: SceneImageMotionType) => {
    onMotionChange({ type });
  };

  const handleIntensityChange = (intensity: SceneImageMotionIntensity) => {
    onMotionChange({ intensity });
  };

  return (
    <section aria-labelledby={`${controlId}-motion-label`} className="space-y-2.5">
      <p id={`${controlId}-motion-label`} className={`${studioFieldLabel} mb-0`}>
        Image Motion
      </p>
      <div
        className={studioImageFitSegmentedControl}
        role="radiogroup"
        aria-labelledby={`${controlId}-motion-label`}
      >
        {SCENE_IMAGE_MOTION_TYPE_OPTIONS.map((option) => {
          const isActive = activeType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => handleTypeChange(option.value)}
              className={isActive ? studioImageFitSegmentActive : studioImageFitSegment}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {showIntensity ? (
        <div className="space-y-1.5">
          <p className={`${studioFieldLabel} mb-0`}>Intensity</p>
          <div
            className={studioImageFitSegmentedControl}
            role="radiogroup"
            aria-label="Image motion intensity"
          >
            {SCENE_IMAGE_MOTION_INTENSITY_OPTIONS.map((option) => {
              const isActive = activeIntensity === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
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
