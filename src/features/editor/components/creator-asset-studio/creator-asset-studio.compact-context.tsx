"use client";

import { createContext, useContext, type ReactNode } from "react";

const CreatorAssetStudioCompactContext = createContext(false);

export function CreatorAssetStudioCompactProvider({
  compact,
  children,
}: {
  compact: boolean;
  children: ReactNode;
}) {
  return (
    <CreatorAssetStudioCompactContext.Provider value={compact}>
      {children}
    </CreatorAssetStudioCompactContext.Provider>
  );
}

export function useCreatorAssetStudioCompact(): boolean {
  return useContext(CreatorAssetStudioCompactContext);
}
