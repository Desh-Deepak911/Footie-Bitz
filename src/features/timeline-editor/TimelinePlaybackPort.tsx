"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  EMPTY_TIMELINE_PLAYBACK_SNAPSHOT,
  type TimelinePlaybackSnapshot,
} from "./timeline-playback-port.types";

interface TimelinePlaybackPortValue {
  snapshot: TimelinePlaybackSnapshot;
  publishPlayback: (snapshot: TimelinePlaybackSnapshot) => void;
}

const TimelinePlaybackPortContext = createContext<TimelinePlaybackPortValue | null>(null);

/** Presentation-only bridge between VideoPreview clock and StudioTimeline playhead. */
export function TimelinePlaybackPortProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<TimelinePlaybackSnapshot>(
    EMPTY_TIMELINE_PLAYBACK_SNAPSHOT,
  );

  const publishPlayback = useCallback((next: TimelinePlaybackSnapshot) => {
    setSnapshot(next);
  }, []);

  const value = useMemo(
    () => ({
      snapshot,
      publishPlayback,
    }),
    [publishPlayback, snapshot],
  );

  return (
    <TimelinePlaybackPortContext.Provider value={value}>
      {children}
    </TimelinePlaybackPortContext.Provider>
  );
}

export function useTimelinePlayback(): TimelinePlaybackSnapshot {
  const context = useContext(TimelinePlaybackPortContext);
  return context?.snapshot ?? EMPTY_TIMELINE_PLAYBACK_SNAPSHOT;
}

export function useTimelinePlaybackPublisher():
  | ((snapshot: TimelinePlaybackSnapshot) => void)
  | undefined {
  const context = useContext(TimelinePlaybackPortContext);
  return context?.publishPlayback;
}
