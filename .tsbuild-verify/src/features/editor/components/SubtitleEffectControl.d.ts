import type { SubtitleEffect } from "@/features/story/types";
interface SubtitleEffectControlProps {
    value: SubtitleEffect | undefined;
    onChange: (effect: SubtitleEffect) => void;
    disabled?: boolean;
}
export default function SubtitleEffectControl({ value, onChange, disabled, }: SubtitleEffectControlProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=SubtitleEffectControl.d.ts.map