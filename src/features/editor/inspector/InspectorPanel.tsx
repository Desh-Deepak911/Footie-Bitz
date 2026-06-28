"use client";

import { useInspectorContext } from "./InspectorContext";
import type { InspectorPanelId } from "./inspector.types";

export interface ResolvedInspectorPanelProps {
  panelId: InspectorPanelId;
}

/**
 * Renders a single registered inspector panel by id.
 */
export default function InspectorPanel({ panelId }: ResolvedInspectorPanelProps) {
  const { registry, script, onScriptChange } = useInspectorContext();
  const definition = registry.get(panelId);

  if (!definition) {
    return null;
  }

  const PanelComponent = definition.component;
  return <PanelComponent script={script} onScriptChange={onScriptChange} />;
}
