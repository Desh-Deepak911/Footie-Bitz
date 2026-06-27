import type { ReactNode } from "react";

import { pageMetadata } from "@/lib/product-metadata";

export const metadata = pageMetadata(
  "Editor",
  "Storyboard timeline, preview, and export.",
);

export default function EditorDraftLayout({ children }: { children: ReactNode }) {
  return children;
}
