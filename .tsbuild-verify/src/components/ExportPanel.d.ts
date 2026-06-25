import type { ExportSettings, FootieScript } from "@/features/story/types";
interface ExportPanelProps {
    script: FootieScript;
    disabled?: boolean;
    compact?: boolean;
    /** Called when export settings change so drafts can persist them on save. */
    onExportSettingsChange?: (settings: ExportSettings) => void;
}
export default function ExportPanel({ script, disabled, compact, onExportSettingsChange, }: ExportPanelProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ExportPanel.d.ts.map