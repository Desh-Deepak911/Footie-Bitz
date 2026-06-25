import type { CSSProperties, ReactNode } from "react";
import type { FootieScene } from "@/features/story/types";
import type { PreviewSceneFrame } from "@/features/preview/utils";
import type { PreviewTransitionOverlay } from "@/features/preview/utils/previewTransitionOverlay";
export declare function SceneBackdrop({ scene, sceneIndex, style, motionProgress, }: {
    scene: FootieScene;
    sceneIndex: number;
    style?: CSSProperties;
    motionProgress?: number;
}): import("react").JSX.Element;
export declare function PreviewDeviceFrame({ children }: {
    children: ReactNode;
}): import("react").JSX.Element;
export declare function DynamicIsland(): import("react").JSX.Element;
interface PreviewFrameProps {
    title: string;
    previewFrame: PreviewSceneFrame;
    transitionOverlay?: PreviewTransitionOverlay | null;
    sceneMotionProgress?: number;
    transitionFromMotionProgress?: number;
    transitionToMotionProgress?: number;
    overlay?: ReactNode;
    footer?: ReactNode;
}
export default function PreviewFrame({ title, previewFrame, transitionOverlay, sceneMotionProgress, transitionFromMotionProgress, transitionToMotionProgress, overlay, footer, }: PreviewFrameProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=PreviewFrame.d.ts.map