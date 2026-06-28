"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { FootieScript } from "@/features/story/types";

import { InspectorRegistry } from "./InspectorRegistry";
import { createEditorInspectorRegistry } from "./registerEditorInspectors";

export interface InspectorContextValue {
  registry: InspectorRegistry;
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
}

export const InspectorContext = createContext<InspectorContextValue | null>(null);

export interface InspectorContextProviderProps {
  script: FootieScript;
  onScriptChange: (script: FootieScript) => void;
  registry?: InspectorRegistry;
  children: ReactNode;
}

export function InspectorContextProvider({
  script,
  onScriptChange,
  registry,
  children,
}: InspectorContextProviderProps) {
  const resolvedRegistry = useMemo(() => registry ?? createEditorInspectorRegistry(), [registry]);

  const value = useMemo(
    (): InspectorContextValue => ({
      registry: resolvedRegistry,
      script,
      onScriptChange,
    }),
    [onScriptChange, resolvedRegistry, script],
  );

  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>;
}

export function useInspectorContext(): InspectorContextValue {
  const context = useContext(InspectorContext);

  if (!context) {
    throw new Error("useInspectorContext must be used within InspectorContextProvider");
  }

  return context;
}
