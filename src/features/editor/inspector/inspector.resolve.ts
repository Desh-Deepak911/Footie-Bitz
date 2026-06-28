import type { EditorSelectionContextValue } from "@/features/editor/selection/SelectionContext";
import { SelectionType } from "@/features/editor/selection/selection.types";

import type { InspectorPanelId } from "./inspector.types";
import type { InspectorRegistry } from "./InspectorRegistry";

/**
 * Resolves which inspector panels should render for the current selection.
 * Extend here as new selection targets ship — avoid switches in StoryWorkspace.
 */
export function resolveInspectorPanels(
  selection: EditorSelectionContextValue,
  registry: InspectorRegistry,
): InspectorPanelId[] {
  const resolved = new Set<InspectorPanelId>();

  if (selection.selectedSceneId) {
    resolved.add("scene");
  }

  if (selection.isImageEditing && selection.target?.type === SelectionType.Image) {
    // Enable when ImageInspector replaces the embedded scene image section.
    // resolved.add("image");
  }

  // Future: caption / transition / audio targets resolve here.

  resolved.add("project");

  return registry
    .list()
    .filter((definition) => resolved.has(definition.id))
    .sort((left, right) => left.order - right.order)
    .map((definition) => definition.id);
}
