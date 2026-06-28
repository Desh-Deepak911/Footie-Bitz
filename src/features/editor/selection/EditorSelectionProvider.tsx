"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { FootieScript } from "@/features/story/types";

import { SelectionContext, type EditorSelectionContextValue } from "./SelectionContext";
import {
  selectActiveSelectionType,
  selectCanvasEditMode,
  selectImageSceneId,
  selectInspectorImageEditAvailable,
  selectInspectorImageEditing,
  selectIsImageEditing,
  selectIsImageSelected,
  selectIsSceneSelected,
  selectRibbonContextId,
  selectRibbonVisible,
  selectSceneSelectionPhase,
  selectSelectedImageSceneId,
} from "./selection.selectors";
import {
  SelectionPhase,
  SelectionType,
  type EditorSelectionState,
  type SelectionTarget,
} from "./selection.types";
import {
  resolveSafeSceneIndex,
  resolveSceneIndexById,
  resolveSelectedScene,
} from "./selection.utils";

export interface EditorSelectionProviderProps {
  script: FootieScript;
  selectedSceneIndex: number;
  onSelectedSceneChange: (index: number) => void;
  children: ReactNode;
}

function deriveSelectionPhase(input: {
  playbackLocked: boolean;
  selectedScene: FootieScript["scenes"][number] | null;
  selectedSceneId: string | null;
  editingSceneId: string | null;
  hoverSceneId: string | null;
  imageEditAvailable: boolean;
}): SelectionPhase {
  const {
    playbackLocked,
    selectedScene,
    selectedSceneId,
    editingSceneId,
    hoverSceneId,
    imageEditAvailable,
  } = input;

  if (playbackLocked) {
    return SelectionPhase.PlaybackLocked;
  }

  if (!selectedScene || !selectedSceneId) {
    return SelectionPhase.Idle;
  }

  if (editingSceneId && editingSceneId === selectedSceneId && imageEditAvailable) {
    return SelectionPhase.Editing;
  }

  if (hoverSceneId && hoverSceneId === selectedSceneId) {
    return SelectionPhase.Hover;
  }

  return SelectionPhase.Selected;
}

function resolveSelectionTarget(input: {
  selectedScene: FootieScript["scenes"][number] | null;
  selectionFocus: SelectionType.Scene | SelectionType.Image;
  phase: SelectionPhase;
  editingSceneId: string | null;
  hoverSceneId: string | null;
}): SelectionTarget {
  const { selectedScene, selectionFocus, phase, editingSceneId, hoverSceneId } = input;

  if (!selectedScene) {
    return null;
  }

  if (selectionFocus === SelectionType.Image) {
    if (phase === SelectionPhase.Editing && editingSceneId) {
      return { type: SelectionType.Image, sceneId: editingSceneId };
    }

    if (phase === SelectionPhase.Hover && hoverSceneId) {
      return { type: SelectionType.Image, sceneId: hoverSceneId };
    }
  }

  return { type: SelectionType.Scene, sceneId: selectedScene.id };
}

export default function EditorSelectionProvider({
  script,
  selectedSceneIndex,
  onSelectedSceneChange,
  children,
}: EditorSelectionProviderProps) {
  const safeSceneIndex = resolveSafeSceneIndex(script.scenes, selectedSceneIndex);
  const selectedScene = resolveSelectedScene(script, selectedSceneIndex);
  const selectedSceneId = selectedScene?.id ?? null;

  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [hoverSceneId, setHoverSceneId] = useState<string | null>(null);
  const [imageEditAvailable, setImageEditAvailable] = useState(false);
  const [playbackLocked, setPlaybackLocked] = useState(false);
  const [selectionFocus, setSelectionFocus] = useState<SelectionType.Scene | SelectionType.Image>(
    SelectionType.Scene,
  );

  const effectiveEditingSceneId = useMemo(() => {
    if (!selectedSceneId || !editingSceneId || editingSceneId !== selectedSceneId) {
      return null;
    }

    return editingSceneId;
  }, [editingSceneId, selectedSceneId]);

  const effectiveHoverSceneId = useMemo(() => {
    if (!selectedSceneId || !hoverSceneId || hoverSceneId !== selectedSceneId) {
      return null;
    }

    return hoverSceneId;
  }, [hoverSceneId, selectedSceneId]);

  const effectiveSelectionFocus = useMemo((): SelectionType.Scene | SelectionType.Image => {
    if (!selectedSceneId) {
      return SelectionType.Scene;
    }

    if (selectionFocus === SelectionType.Image) {
      if (effectiveEditingSceneId || effectiveHoverSceneId) {
        return SelectionType.Image;
      }

      return SelectionType.Scene;
    }

    return selectionFocus;
  }, [effectiveEditingSceneId, effectiveHoverSceneId, selectedSceneId, selectionFocus]);

  const phase = useMemo(
    () =>
      deriveSelectionPhase({
        playbackLocked,
        selectedScene,
        selectedSceneId,
        editingSceneId: effectiveEditingSceneId,
        hoverSceneId: effectiveHoverSceneId,
        imageEditAvailable,
      }),
    [
      effectiveEditingSceneId,
      effectiveHoverSceneId,
      imageEditAvailable,
      playbackLocked,
      selectedScene,
      selectedSceneId,
    ],
  );

  const target = useMemo(
    (): SelectionTarget =>
      resolveSelectionTarget({
        selectedScene,
        selectionFocus: effectiveSelectionFocus,
        phase,
        editingSceneId: effectiveEditingSceneId,
        hoverSceneId: effectiveHoverSceneId,
      }),
    [effectiveEditingSceneId, effectiveHoverSceneId, effectiveSelectionFocus, phase, selectedScene],
  );

  const syncSceneIndex = useCallback(
    (index: number) => {
      const safeIndex = resolveSafeSceneIndex(script.scenes, index);
      if (safeIndex < 0) {
        return;
      }

      const nextScene = script.scenes[safeIndex];
      if (!nextScene) {
        return;
      }

      const nextSceneId = nextScene.id;
      const sceneChanging = nextSceneId !== selectedSceneId;

      if (safeIndex !== selectedSceneIndex) {
        onSelectedSceneChange(safeIndex);
      }

      if (playbackLocked) {
        if (sceneChanging) {
          setHoverSceneId(null);
          if (editingSceneId && editingSceneId !== nextSceneId) {
            setEditingSceneId(null);
            setSelectionFocus(SelectionType.Scene);
          }
        }
        return;
      }

      if (sceneChanging) {
        setEditingSceneId(null);
        setHoverSceneId(null);
        setSelectionFocus(SelectionType.Scene);
      }
    },
    [
      editingSceneId,
      onSelectedSceneChange,
      playbackLocked,
      script.scenes,
      selectedSceneId,
      selectedSceneIndex,
    ],
  );

  const selectScene = useCallback(
    (sceneId: string) => {
      if (playbackLocked) {
        return;
      }

      const index = resolveSceneIndexById(script, sceneId);
      if (index < 0) {
        return;
      }

      syncSceneIndex(index);
      setEditingSceneId(null);
      setHoverSceneId(null);
      setSelectionFocus(SelectionType.Scene);
    },
    [playbackLocked, script, syncSceneIndex],
  );

  const clearImageFocus = useCallback(() => {
    setEditingSceneId(null);
    setHoverSceneId(null);
    setSelectionFocus(SelectionType.Scene);
  }, []);

  const selectImage = useCallback(
    (sceneId: string) => {
      if (playbackLocked) {
        return;
      }

      const index = resolveSceneIndexById(script, sceneId);
      if (index < 0) {
        return;
      }

      if (sceneId !== selectedSceneId) {
        syncSceneIndex(index);
      }

      setSelectionFocus(SelectionType.Image);
      if (imageEditAvailable) {
        setEditingSceneId(sceneId);
      }
    },
    [imageEditAvailable, playbackLocked, script, selectedSceneId, syncSceneIndex],
  );

  const clearSelection = useCallback(() => {
    clearImageFocus();
  }, [clearImageFocus]);

  const enterImageEdit = useCallback(
    (sceneId: string) => {
      selectImage(sceneId);
    },
    [selectImage],
  );

  const exitImageEdit = useCallback(() => {
    clearImageFocus();
  }, [clearImageFocus]);

  const setImageHover = useCallback((sceneId: string | null) => {
    setHoverSceneId(sceneId);
  }, []);

  useEffect(() => {
    if (phase !== SelectionPhase.Editing) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        exitImageEdit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exitImageEdit, phase]);

  const state: EditorSelectionState = {
    phase,
    target,
    hoverSceneId: effectiveHoverSceneId,
    imageEditAvailable,
    selectedSceneId,
    selectedSceneIndex: safeSceneIndex,
  };

  const value: EditorSelectionContextValue = {
    ...state,
    selectedImageSceneId: selectSelectedImageSceneId(state),
    scenePhase: selectSceneSelectionPhase(state),
    activeSelectionType: selectActiveSelectionType(state),
    canvasEditMode: selectCanvasEditMode(state),
    isImageEditing: selectIsImageEditing(state),
    isImageSelected: selectIsImageSelected(state),
    isSceneSelected: selectIsSceneSelected(state),
    imageSceneId: selectImageSceneId(state),
    ribbonVisible: selectRibbonVisible(state),
    ribbonContextId: selectRibbonContextId(state),
    inspectorImageEditing: selectInspectorImageEditing(state),
    inspectorImageEditAvailable: selectInspectorImageEditAvailable(state),
    selectScene,
    selectImage,
    syncSceneIndex,
    clearSelection,
    enterImageEdit,
    exitImageEdit,
    setImageHover,
    setImageEditAvailable,
    setPlaybackLocked,
  };

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}
