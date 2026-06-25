import type { FootieScript } from "@/features/story/types";
interface TimelineEditorProps {
    script: FootieScript;
    onScriptChange: (script: FootieScript) => void;
    /** Index of the scene currently selected in the preview (used for Add Transition). */
    selectedSceneIndex?: number;
    onSelectedSceneChange?: (index: number) => void;
    variant?: "default" | "storyboard";
}
export default function TimelineEditor({ script, onScriptChange, selectedSceneIndex, onSelectedSceneChange, variant, }: TimelineEditorProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TimelineEditor.d.ts.map