"use client";

import { useContext } from "react";

import { SelectionContext, type EditorSelectionContextValue } from "./SelectionContext";

export function useEditorSelection(): EditorSelectionContextValue {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useEditorSelection must be used within EditorSelectionProvider");
  }

  return context;
}

/** Optional accessor for surfaces outside the editor selection tree. */
export function useEditorSelectionOptional(): EditorSelectionContextValue | null {
  return useContext(SelectionContext);
}
