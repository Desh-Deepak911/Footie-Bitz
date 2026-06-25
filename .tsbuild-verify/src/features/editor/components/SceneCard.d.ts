import { type SceneImageTransformPatch } from "@/features/story/utils";
import type { FootieScene, SceneImage, SceneType } from "@/features/story/types";
export interface SceneCardProps {
    scene: FootieScene;
    index: number;
    sceneCount: number;
    onUpdate: (patch: Partial<FootieScene>) => void;
    onImageSettingsChange: (sceneId: string, updates: SceneImageTransformPatch | SceneImage) => void;
    onImageReset: (sceneId: string) => void;
    onImageUpload: (file: File | null) => void;
    onRemoveImage: () => void;
    onAddBefore: () => void;
    onAddAfter: () => void;
    onDuplicate: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDelete: () => void;
    sceneTypeOptions: {
        value: SceneType;
        label: string;
    }[];
    /** Syncs the main preview to this scene (UX only). */
    onActivate?: () => void;
}
export default function SceneCard({ scene, index, sceneCount, onUpdate, onImageSettingsChange, onImageReset, onImageUpload, onRemoveImage, onAddBefore, onAddAfter, onDuplicate, onMoveUp, onMoveDown, onDelete, sceneTypeOptions, onActivate, }: SceneCardProps): import("react").JSX.Element;
//# sourceMappingURL=SceneCard.d.ts.map