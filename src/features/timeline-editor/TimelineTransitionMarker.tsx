"use client";

import { ArrowLeftRight } from "lucide-react";

import { formatTransitionLabel } from "./timeline-display.utils";
import {
  timelineTransitionMarkerBody,
  timelineTransitionMarkerDivider,
  timelineTransitionMarkerWrap,
} from "./timeline-editor.ui";
import type { TimelineTransitionMarkerVM } from "./timeline-editor.types";

export interface TimelineTransitionMarkerProps {
  marker: TimelineTransitionMarkerVM;
}

export default function TimelineTransitionMarker({ marker }: TimelineTransitionMarkerProps) {
  const transitionLabel = formatTransitionLabel(marker.transitionType);
  const durationSec = Math.max(0.1, marker.durationMs / 1000);
  const tooltip = `${transitionLabel} · ${durationSec.toFixed(1)}s`;

  return (
    <div
      className={timelineTransitionMarkerWrap}
      role="img"
      aria-label={tooltip}
      title={tooltip}
      data-transition-type={marker.transitionType}
    >
      <div className={timelineTransitionMarkerBody}>
        <span aria-hidden className={timelineTransitionMarkerDivider} />
        <ArrowLeftRight
          className="relative z-[1] h-2.5 w-2.5 text-muted/75 transition group-hover/transition:text-foreground/70"
          strokeWidth={2.25}
          aria-hidden
        />
        <span className="relative z-[1] max-w-full truncate px-0.5 text-[7px] font-semibold uppercase tracking-wide text-muted/65 group-hover/transition:text-muted/85">
          {transitionLabel.split(" ")[0]}
        </span>
      </div>
    </div>
  );
}
