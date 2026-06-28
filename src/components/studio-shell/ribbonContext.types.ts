import type { ReactNode } from "react";

/** Supported ribbon editing contexts — extend as new surfaces are added. */
export type RibbonContextId =
  | "image"
  | "scene"
  | "caption"
  | "transition"
  | "audio"
  | "project"
  | "unknown";

/**
 * Registry entry for a ribbon context renderer.
 * Register additional contexts without changing StudioContextRibbon layout.
 */
export interface RibbonContextDefinition {
  id: RibbonContextId;
  render: (props: Record<string, never>) => ReactNode;
}

/** Per-context ribbon content keyed by active selection context. */
export type RibbonContextRenderers = Partial<Record<RibbonContextId, ReactNode>>;

export interface StudioContextRibbonProps {
  /**
   * Context-specific ribbon bodies. StudioContextRibbon picks the entry matching
   * the active SelectionContext — it does not infer visibility from props.
   */
  renderers?: RibbonContextRenderers;
  /** Legacy single-child slot; used when renderers omit the active context. */
  children?: ReactNode;
}
