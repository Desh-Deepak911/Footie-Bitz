/** Supported selection targets — v1 implements Scene and Image. */
export enum SelectionType {
  None = "none",
  Scene = "scene",
  Image = "image",
}

/** Editor focus lifecycle phases. */
export enum SelectionPhase {
  Idle = "idle",
  Hover = "hover",
  Selected = "selected",
  Editing = "editing",
  PlaybackLocked = "playbackLocked",
}

/** Scene selection lifecycle (derived from global phase + scene context). */
export enum SceneSelectionPhase {
  Idle = "idle",
  Selected = "selected",
  Editing = "editing",
  PlaybackLocked = "playbackLocked",
}

export interface SceneSelectionTarget {
  type: SelectionType.Scene;
  sceneId: string;
}

export interface ImageSelectionTarget {
  type: SelectionType.Image;
  sceneId: string;
}

export type SelectionTarget = SceneSelectionTarget | ImageSelectionTarget | null;

export interface EditorSelectionState {
  phase: SelectionPhase;
  target: SelectionTarget;
  hoverSceneId: string | null;
  imageEditAvailable: boolean;
  /** Bridged from parent — not duplicated in provider state. */
  selectedSceneId: string | null;
  selectedSceneIndex: number;
}
