import { type SceneImageTransformPatch } from "@/features/story/utils";
import type { FootieScene } from "@/features/story/types";
interface MediaPickerProps {
    scene: FootieScene;
    alt: string;
    onInteractionStart?: () => void;
    onTransformChange: (patch: SceneImageTransformPatch) => void;
    className?: string;
}
export default function MediaPicker({ scene, alt, onInteractionStart, onTransformChange, className, }: MediaPickerProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=MediaPicker.d.ts.map