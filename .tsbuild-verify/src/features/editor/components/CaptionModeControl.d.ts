import type { CaptionMode } from "@/features/story/types";
interface CaptionModeControlProps {
    value: CaptionMode | undefined;
    onChange: (mode: CaptionMode) => void;
    disabled?: boolean;
}
export default function CaptionModeControl({ value, onChange, disabled, }: CaptionModeControlProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=CaptionModeControl.d.ts.map