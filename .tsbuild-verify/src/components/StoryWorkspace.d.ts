import type { ExportSettings, FootieScript } from "@/features/story/types";
interface StoryWorkspaceProps {
    script: FootieScript;
    onScriptChange: (script: FootieScript) => void;
    selectedSceneIndex: number;
    onSelectedSceneChange: (index: number) => void;
    onScrollToExport: () => void;
    onExportSettingsChange?: (settings: ExportSettings) => void;
}
export default function StoryWorkspace({ script, onScriptChange, selectedSceneIndex, onSelectedSceneChange, onScrollToExport, onExportSettingsChange, }: StoryWorkspaceProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StoryWorkspace.d.ts.map