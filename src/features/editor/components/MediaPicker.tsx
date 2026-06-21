"use client";

import { useCallback, useRef, useState } from "react";

import SceneFrameImage from "@/features/editor/components/SceneFrameImage";
import { useDragScrollLock } from "@/hooks/useDragScrollLock";
import {
  applyReferencePanFromScreenDelta,
  getSceneImage,
  type SceneImageTransformPatch,
} from "@/features/story/utils";
import type { FootieScene } from "@/features/story/types";

interface MediaPickerProps {
  scene: FootieScene;
  alt: string;
  onInteractionStart?: () => void;
  onTransformChange: (patch: SceneImageTransformPatch) => void;
  className?: string;
}

type DragSession = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  originX: number;
  originY: number;
};

export default function MediaPicker({
  scene,
  alt,
  onInteractionStart,
  onTransformChange,
  className = "absolute inset-0 overflow-hidden",
}: MediaPickerProps) {
  const image = getSceneImage(scene);
  const dragSessionRef = useRef<DragSession | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useDragScrollLock(isDragging);

  const interactionEnabled = Boolean(image);

  const commitDrag = useCallback(
    (deltaX: number, deltaY: number, pointerId: number) => {
      const session = dragSessionRef.current;
      if (!session || session.pointerId !== pointerId) {
        return;
      }

      const frame = overlayRef.current?.parentElement?.getBoundingClientRect();
      const nextPan = applyReferencePanFromScreenDelta(
        session.originX,
        session.originY,
        deltaX,
        deltaY,
        frame?.width ?? 0,
        frame?.height ?? 0,
      );

      // Clear session before releasing capture so onLostPointerCapture cannot double-commit.
      dragSessionRef.current = null;
      dragOffsetRef.current = { x: 0, y: 0 };
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });

      onTransformChange(nextPan);

      const overlay = overlayRef.current;
      if (overlay?.hasPointerCapture(pointerId)) {
        overlay.releasePointerCapture(pointerId);
      }
    },
    [onTransformChange],
  );

  const finishActiveDrag = (pointerId: number) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== pointerId) {
      return;
    }

    commitDrag(dragOffsetRef.current.x, dragOffsetRef.current.y, pointerId);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image || !event.isPrimary) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    onInteractionStart?.();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    dragSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      originX: image.x,
      originY: image.y,
    };

    dragOffsetRef.current = { x: 0, y: 0 };
    setIsDragging(true);
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const nextOffset = {
      x: event.clientX - session.startClientX,
      y: event.clientY - session.startClientY,
    };

    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  if (!image) {
    return null;
  }

  return (
    <>
      <SceneFrameImage
        scene={scene}
        alt={alt}
        className={className}
        transformOffset={isDragging ? dragOffset : undefined}
        isDragging={isDragging}
      />
      <div
        ref={overlayRef}
        aria-hidden
        style={{ touchAction: "none" }}
        className={`absolute inset-0 z-[5] touch-none select-none ${
          interactionEnabled ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishActiveDrag(event.pointerId)}
        onPointerCancel={(event) => finishActiveDrag(event.pointerId)}
        onLostPointerCapture={(event) => finishActiveDrag(event.pointerId)}
      />
    </>
  );
}
