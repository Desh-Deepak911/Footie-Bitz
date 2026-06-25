import type { SceneImageMotion } from "@/features/story/types";
interface SceneImageMotionControlProps {
    imageMotion?: SceneImageMotion;
    controlId: string;
    onMotionChange: (patch: Partial<SceneImageMotion>) => void;
}
export default function SceneImageMotionControl({ imageMotion, controlId, onMotionChange, }: SceneImageMotionControlProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=SceneImageMotionControl.d.ts.map