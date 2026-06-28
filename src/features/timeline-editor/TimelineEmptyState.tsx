"use client";

import { Clapperboard, ImageIcon, Timer } from "lucide-react";

export type TimelineEmptyStateVariant = "no-scenes" | "unavailable";

export interface TimelineEmptyStateProps {
  variant: TimelineEmptyStateVariant;
}

const COPY: Record<
  TimelineEmptyStateVariant,
  { title: string; description: string; icon: typeof Clapperboard }
> = {
  "no-scenes": {
    title: "No scenes yet",
    description: "Add scenes in the sidebar to build your timeline.",
    icon: Clapperboard,
  },
  unavailable: {
    title: "Timeline preview unavailable",
    description: "Scene timing will appear once the story timeline can be built.",
    icon: Timer,
  },
};

/** Empty or unavailable timeline rail — presentation only. */
export default function TimelineEmptyState({ variant }: TimelineEmptyStateProps) {
  const { title, description, icon: Icon } = COPY[variant];

  return (
    <div
      className="flex min-h-[4.75rem] flex-1 items-center justify-center rounded-xl border border-dashed border-border/35 bg-surface/20 px-4 py-3 sm:min-h-[5rem]"
      data-timeline-empty={variant}
    >
      <div className="flex max-w-sm items-center gap-3 text-left">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface/50 ring-1 ring-border/25">
          <Icon className="h-4 w-4 text-muted/80" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground/90">{title}</p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{description}</p>
        </div>
        <ImageIcon className="hidden h-4 w-4 shrink-0 text-muted/25 sm:block" aria-hidden />
      </div>
    </div>
  );
}
