import type { TransitionEffect, TransitionTimelineItem } from "@/features/story/types";
interface TransitionCardProps {
    item: TransitionTimelineItem;
    onUpdate: (patch: {
        effect?: TransitionEffect;
        durationMs?: number;
    }) => void;
}
export default function TransitionCard({ item, onUpdate }: TransitionCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=TransitionCard.d.ts.map