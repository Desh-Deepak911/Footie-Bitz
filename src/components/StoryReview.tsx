"use client";

import { Clock } from "lucide-react";

import CopyButton from "@/components/CopyButton";
import {
  studioBadge,
  studioInput,
  studioSectionDesc,
  studioSectionTitle,
  studioStepLabel,
} from "@/lib/studioUi";
import type { FootieScript } from "@/types/footiebitz";

interface StoryReviewProps {
  story: FootieScript;
  onStoryChange: (story: FootieScript) => void;
}

export default function StoryReview({ story, onStoryChange }: StoryReviewProps) {
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className={studioStepLabel}>Step 2</p>
          <h2 className={studioSectionTitle}>Story Draft</h2>
          <p className={studioSectionDesc}>
            Edit the title and narration before creating narration audio.
          </p>
        </div>
        <span className={studioBadge}>
          <Clock className="h-3.5 w-3.5" />
          {story.totalDuration}s total
        </span>
      </div>

      <div>
        <label htmlFor="story-title" className="mb-2 block text-sm font-medium text-zinc-300">
          Title
        </label>
        <input
          id="story-title"
          type="text"
          value={story.title}
          onChange={(e) => onStoryChange({ ...story, title: e.target.value })}
          className={studioInput}
        />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="story-narration" className="text-sm font-medium text-zinc-300">
            Narration
          </label>
          <CopyButton text={story.narration} label="Copy narration" />
        </div>
        <textarea
          id="story-narration"
          value={story.narration}
          onChange={(e) => onStoryChange({ ...story, narration: e.target.value })}
          rows={8}
          placeholder="Full spoken narration for your short"
          className={`${studioInput} resize-y leading-relaxed`}
        />
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          FootieBitz will read the full narration while scenes change in sequence.
        </p>
      </div>
    </div>
  );
}
