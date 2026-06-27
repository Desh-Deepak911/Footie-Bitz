"use client";

import type { ReactNode } from "react";

import { StoryDocumentProvider } from "@/features/drafts/store";

/** Client providers mounted once at the app root for shared runtime state. */
export default function AppProviders({ children }: { children: ReactNode }) {
  return <StoryDocumentProvider>{children}</StoryDocumentProvider>;
}
