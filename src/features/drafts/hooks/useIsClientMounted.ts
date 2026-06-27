"use client";

import { useSyncExternalStore } from "react";

/** False during SSR/hydration, true after the client has mounted — safe to read localStorage. */
export function useIsClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
