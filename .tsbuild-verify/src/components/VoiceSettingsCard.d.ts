import type { FootieScript } from "@/features/story/types";
interface VoiceSettingsCardProps {
    script: FootieScript;
    onScriptChange: (script: FootieScript) => void;
    disabled?: boolean;
}
export default function VoiceSettingsCard({ script, onScriptChange, disabled, }: VoiceSettingsCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=VoiceSettingsCard.d.ts.map