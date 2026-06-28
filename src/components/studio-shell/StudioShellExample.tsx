"use client";

/**
 * Dev-only StudioShell layout demo — not wired to any route.
 * Import manually while building Phase 1 editor migration.
 *
 * @example
 * // Temporary dev mount (remove before production):
 * // import { StudioShellExample } from "@/components/studio-shell";
 * // export default function DevStudioShellPage() {
 * //   if (process.env.NODE_ENV !== "development") return null;
 * //   return <StudioShellExample />;
 * // }
 */
import {
  studioPreviewDevice,
  studioPreviewScreen,
  studioShellFooterRegion,
  studioShellMaxWidth,
  studioSubtleText,
} from "@/lib/studioUi";

import StudioHeader, { StudioHeaderBar } from "./StudioHeader";
import StudioPanel from "./StudioPanel";
import StudioSection from "./StudioSection";
import StudioShell from "./StudioShell";

export default function StudioShellExample() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <StudioShell
      focusMode={false}
      compactMode={false}
      header={
        <StudioHeader>
          <StudioHeaderBar>
            <p className="truncate text-sm font-semibold text-foreground/95">Studio Shell Example</p>
            <div className="flex-1" aria-hidden />
            <span className={studioSubtleText}>Dev layout only</span>
          </StudioHeaderBar>
        </StudioHeader>
      }
      sidebar={
        <StudioSection title="Scenes" description="Scene list slot">
          <ul className="space-y-2 text-xs text-muted">
            <li>Scene 1 · 3s</li>
            <li>Scene 2 · 4s</li>
            <li>Scene 3 · 5s</li>
          </ul>
        </StudioSection>
      }
      canvas={
        <div className={studioPreviewDevice}>
          <div className={`${studioPreviewScreen} flex items-center justify-center`}>
            <span className="text-xs text-muted">Canvas slot</span>
          </div>
        </div>
      }
      inspector={
        <StudioPanel>
          <StudioSection title="Inspector" description="Selection-driven properties">
            <p className="text-xs text-muted">Scene 2 · Caption · Motion</p>
          </StudioSection>
        </StudioPanel>
      }
      timeline={
        <div className="flex min-h-0 flex-1 items-center gap-2 overflow-x-auto">
          {["S1", "S2", "S3", "S4"].map((label) => (
            <div
              key={label}
              className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-elevated/40 text-xs text-muted ring-1 ring-border/20"
            >
              {label}
            </div>
          ))}
        </div>
      }
      footer={
        <footer className={studioShellFooterRegion}>
          <div className={`${studioShellMaxWidth} px-3 sm:px-4`}>
            <p className={studioSubtleText}>Footer slot — hidden when focusMode omits footer</p>
          </div>
        </footer>
      }
    />
  );
}
