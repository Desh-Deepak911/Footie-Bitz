import type { EditorSelectionContextValue } from "@/features/editor/selection/SelectionContext";

import { resolveInspectorPanels } from "./inspector.resolve";
import type { InspectorPanelDefinition, InspectorPanelId } from "./inspector.types";

export class InspectorRegistry {
  private readonly panels = new Map<InspectorPanelId, InspectorPanelDefinition>();

  register(definition: InspectorPanelDefinition): this {
    this.panels.set(definition.id, definition);
    return this;
  }

  get(id: InspectorPanelId): InspectorPanelDefinition | undefined {
    return this.panels.get(id);
  }

  list(): InspectorPanelDefinition[] {
    return Array.from(this.panels.values());
  }

  resolve(selection: EditorSelectionContextValue): InspectorPanelId[] {
    return resolveInspectorPanels(selection, this);
  }
}
