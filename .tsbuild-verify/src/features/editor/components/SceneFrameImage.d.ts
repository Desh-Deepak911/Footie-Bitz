import type { FootieScene } from "@/features/story/types";
interface SceneFrameImageProps {
    scene: Pick<FootieScene, "image" | "uploadedImage">;
    alt: string;
    className?: string;
    imageClassName?: string;
    /** Live drag offset in screen pixels (preview only). */
    transformOffset?: {
        x: number;
        y: number;
    };
    /** Additional Ken Burns scale applied on top of manual zoom (preview playback). */
    motionScale?: number;
    /** Keeps transforms on the compositor while panning. */
    isDragging?: boolean;
}
/**
 * Renders a scene image inside a clipped frame with pan/zoom/rotation transform.
 * Uses normalized image metadata; legacy string URLs still work via `getSceneImage`.
 */
export default function SceneFrameImage({ scene, alt, className, imageClassName, transformOffset, motionScale, isDragging, }: SceneFrameImageProps): import("react").JSX.Element | null;
export {};
//# sourceMappingURL=SceneFrameImage.d.ts.map