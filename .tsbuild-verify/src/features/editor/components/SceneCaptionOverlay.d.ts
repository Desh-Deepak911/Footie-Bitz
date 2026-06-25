import { type DisplayCaptionScene } from "@/features/story/utils";
interface SceneCaptionOverlayProps {
    scene: DisplayCaptionScene & {
        id?: string;
    };
    className?: string;
}
/** On-screen caption overlay for storyboard scene card media preview. */
export default function SceneCaptionOverlay({ scene, className, }: SceneCaptionOverlayProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=SceneCaptionOverlay.d.ts.map