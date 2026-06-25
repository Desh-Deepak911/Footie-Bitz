import type { ReactNode } from "react";
interface AppShellProps {
    children: ReactNode;
    /** Active project title — shown beside brand on desktop when set. */
    projectTitle?: string;
    projectMeta?: string;
    hasProject: boolean;
    loading?: boolean;
    onCreateStory: () => void;
    onExport: () => void;
    createDisabled?: boolean;
    exportDisabled?: boolean;
    /** When true, show a Drafts link in the header. */
    showDraftsNav?: boolean;
    /** Manual draft save — shown in editor header when provided. */
    onSaveDraft?: () => void;
    saveDraftDisabled?: boolean;
    saveDraftConfirmation?: string | null;
}
export default function AppShell({ children, projectTitle, projectMeta, hasProject, loading, onCreateStory, onExport, createDisabled, exportDisabled, showDraftsNav, onSaveDraft, saveDraftDisabled, saveDraftConfirmation, }: AppShellProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AppShell.d.ts.map