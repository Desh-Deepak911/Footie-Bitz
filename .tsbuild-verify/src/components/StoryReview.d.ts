import type { FootieScript } from "@/features/story/types";
interface StoryReviewProps {
    story: FootieScript;
    onStoryChange: (story: FootieScript) => void;
    variant?: "default" | "storyboard";
}
export default function StoryReview({ story, onStoryChange, variant, }: StoryReviewProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StoryReview.d.ts.map