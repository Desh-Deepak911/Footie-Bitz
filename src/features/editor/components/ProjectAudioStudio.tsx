"use client";

import ProjectAudioBackgroundMusicSection from "@/features/editor/components/ProjectAudioBackgroundMusicSection";
import ProjectAudioExportMixSummary from "@/features/editor/components/ProjectAudioExportMixSummary";
import ProjectAudioVoiceoverSection from "@/features/editor/components/ProjectAudioVoiceoverSection";
import InspectorSection from "@/components/studio-shell/InspectorSection";
import type { FootieScript } from "@/features/story/types";
import { studioShellSectionDesc, studioShellSectionTitle } from "@/lib/utils/studioUi";

export interface ProjectAudioStudioProps {
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
}

/**
 * Project Audio Studio — composes voiceover, music, and export mix controls for the editor inspector.
 * Layout/composition only; mutations stay in existing hooks and cards.
 */
export default function ProjectAudioStudio({
  script,
  onScriptChange,
}: ProjectAudioStudioProps) {
  return (
    <div className="min-w-0 shrink-0 space-y-2 border-t border-border/20 pt-2">
      <header className="px-0.5 pb-1">
        <p className={studioShellSectionTitle}>Project Audio</p>
        <p className={studioShellSectionDesc}>
          Voiceover, background music, and export mix for this short.
        </p>
      </header>

      <InspectorSection
        title="Voiceover"
        description="Narration status, voice settings, generation, and upload."
        defaultOpen
      >
        <ProjectAudioVoiceoverSection script={script} onScriptChange={onScriptChange} />
      </InspectorSection>

      <InspectorSection
        title="Background Music"
        description="Optional soundtrack — upload, volume, and fades."
        defaultOpen
      >
        <ProjectAudioBackgroundMusicSection script={script} onScriptChange={onScriptChange} />
      </InspectorSection>

      <InspectorSection title="Export Mix" description="What will be included in your download." defaultOpen>
        <ProjectAudioExportMixSummary script={script} embedded />
      </InspectorSection>
    </div>
  );
}
