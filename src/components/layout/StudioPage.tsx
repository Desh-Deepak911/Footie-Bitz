import type { ReactNode } from "react";

interface StudioPageProps {
  children: ReactNode;
  /** Locks the page to the viewport — use with full-height studio shells (editor). */
  fixedViewport?: boolean;
}

export default function StudioPage({ children, fixedViewport = false }: StudioPageProps) {
  return (
    <div
      className={`relative min-w-0 overflow-x-hidden bg-background text-foreground ${
        fixedViewport ? "h-dvh min-h-0 overflow-hidden" : "min-h-screen"
      }`}
    >
      <div
        aria-hidden
        className="studio-grid pointer-events-none fixed inset-0 -z-10 opacity-60"
      />
      <div className={`relative z-0 ${fixedViewport ? "h-full min-h-0" : ""}`}>{children}</div>
    </div>
  );
}
