import type { FootieScript } from "@/features/story/types";
interface VideoPreviewProps {
    script: FootieScript | null;
    selectedSceneIndex: number;
    onSelectedSceneChange: (index: number) => void;
}
export default function VideoPreview({ script, selectedSceneIndex, onSelectedSceneChange, }: VideoPreviewProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=VideoPreview.d.ts.map