import { type DisplayCaptionScene } from "@/features/story/utils";
interface SubtitleOverlayProps {
    scene: DisplayCaptionScene & {
        id?: string;
    };
    sceneElapsedMs: number;
    sceneDurationMs: number;
    className?: string;
}
/** Timed narration subtitles inside the phone preview frame. */
export default function SubtitleOverlay({ scene, sceneElapsedMs, sceneDurationMs, className, }: SubtitleOverlayProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=SubtitleOverlay.d.ts.map