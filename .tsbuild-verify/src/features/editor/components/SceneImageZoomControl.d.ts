import type { SceneImageFitMode, SceneImageMotion } from "@/features/story/types";
interface SceneImageZoomControlProps {
    scale: number;
    fitMode?: SceneImageFitMode;
    imageMotion?: SceneImageMotion;
    onScaleChange: (scale: number) => void;
    onFitModeChange: (fitMode: SceneImageFitMode) => void;
    onMotionChange?: (patch: Partial<SceneImageMotion>) => void;
    onReset: () => void;
    controlId: string;
    motionControlId?: string;
    variant?: "standalone" | "attached";
}
export default function SceneImageZoomControl({ scale, fitMode, imageMotion, onScaleChange, onFitModeChange, onMotionChange, onReset, controlId, motionControlId, variant, }: SceneImageZoomControlProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=SceneImageZoomControl.d.ts.map