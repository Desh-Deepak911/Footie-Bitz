"use client";

import {
  timelinePlaybackHeadHandle,
  timelinePlaybackHeadHandleDot,
  timelinePlaybackHeadHandleDotActive,
  timelinePlaybackHeadLine,
  timelinePlaybackHeadLineActive,
  timelinePlaybackHeadRoot,
} from "./timeline-editor.ui";

export interface TimelinePlaybackHeadProps {
  progress: number;
  isActive?: boolean;
}

/** Visual playhead — presentation only, no interaction. */
export default function TimelinePlaybackHead({ progress, isActive = false }: TimelinePlaybackHeadProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <div
      className={timelinePlaybackHeadRoot}
      style={{ left: `${clampedProgress * 100}%` }}
      aria-hidden
      data-timeline-playhead
      data-timeline-playhead-active={isActive ? "true" : "false"}
    >
      <span className={timelinePlaybackHeadHandle}>
        <span
          className={`${timelinePlaybackHeadHandleDot} ${isActive ? timelinePlaybackHeadHandleDotActive : ""}`}
        />
      </span>
      <span
        className={`${timelinePlaybackHeadLine} ${isActive ? timelinePlaybackHeadLineActive : ""}`}
      />
    </div>
  );
}
