import type { ComponentType } from "react";

import type { FootieScript } from "@/features/story/types";

/** Registered inspector panel identifiers. */
export type InspectorPanelId =
  | "scene"
  | "image"
  | "project"
  | "caption"
  | "transition"
  | "audio";

export interface InspectorPanelProps {
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
}

export interface InspectorPanelDefinition {
  id: InspectorPanelId;
  component: ComponentType<InspectorPanelProps>;
  /** Lower values render first when multiple panels resolve. */
  order: number;
}
