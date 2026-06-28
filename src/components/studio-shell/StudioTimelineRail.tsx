"use client";

import {
  ArrowLeftRight,
  Clapperboard,
  Flag,
  ImageIcon,
  Info,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef } from "react";

import { useEditorSelection } from "@/features/editor/selection";
import { getSceneImageUrl, sceneHasImage } from "@/features/story/utils";
import {
  studioTimelineRailChip,
  studioTimelineRailChipActive,
  studioTimelineRailDuration,
  studioTimelineRailLabel,
  studioTimelineRailScroll,
  studioTimelineRailThumb,
} from "@/lib/studioUi";
import type { FootieScene, SceneType } from "@/features/story/types";

export interface StudioTimelineRailProps {
  scenes: FootieScene[];
  className?: string;
  id?: string;
}

const SCENE_TYPE_ICONS: Record<SceneType, typeof Sparkles> = {
  intro: Sparkles,
  context: Info,
  match: Clapperboard,
  transition: ArrowLeftRight,
  ending: Flag,
};

function SceneTypeBadge({ sceneType }: { sceneType: SceneType }) {
  const Icon = SCENE_TYPE_ICONS[sceneType];

  return (
    <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-md bg-black/55 text-white/90 ring-1 ring-white/10 backdrop-blur-sm">
      <Icon className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
    </span>
  );
}

interface TimelineRailChipProps {
  scene: FootieScene;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  chipRef?: (element: HTMLButtonElement | null) => void;
}

function TimelineRailChip({
  scene,
  index,
  isSelected,
  onSelect,
  chipRef,
}: TimelineRailChipProps) {
  const imageUrl = getSceneImageUrl(scene);
  const hasImage = sceneHasImage(scene);

  return (
    <button
      ref={chipRef}
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? "true" : undefined}
      aria-label={`Scene ${index + 1}, ${scene.duration}s`}
      className={`${studioTimelineRailChip} ${isSelected ? studioTimelineRailChipActive : ""}`}
    >
      <div className={studioTimelineRailThumb}>
        {hasImage && imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted/45" strokeWidth={1.75} aria-hidden />
          </div>
        )}
        {scene.sceneType ? <SceneTypeBadge sceneType={scene.sceneType} /> : null}
      </div>
      <span className={studioTimelineRailLabel}>Scene {index + 1}</span>
      <span className={studioTimelineRailDuration}>{scene.duration}s</span>
    </button>
  );
}

/**
 * Horizontal scene navigation rail — selection only, no editing.
 * Reads scene selection from SelectionContext when available.
 */
export default function StudioTimelineRail({
  scenes,
  className = "",
  id,
}: StudioTimelineRailProps) {
  const selection = useEditorSelection();
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const safeIndex = selection.selectedSceneIndex;

  useEffect(() => {
    chipRefs.current[safeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [safeIndex]);

  const handleSceneSelect = (scene: FootieScene) => {
    selection.selectScene(scene.id);
  };

  if (scenes.length === 0) {
    return null;
  }

  return (
    <nav
      id={id}
      aria-label="Scene timeline"
      className={`flex min-h-0 flex-1 flex-col ${className}`.trim()}
    >
      <div className={studioTimelineRailScroll}>
        {scenes.map((scene, index) => (
          <TimelineRailChip
            key={scene.id}
            scene={scene}
            index={index}
            isSelected={index === safeIndex}
            onSelect={() => handleSceneSelect(scene)}
            chipRef={(element) => {
              chipRefs.current[index] = element;
            }}
          />
        ))}
      </div>
    </nav>
  );
}
