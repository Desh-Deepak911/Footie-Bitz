export interface FrameSize {
    width: number;
    height: number;
}
/** Tracks an element's content box size for frame-relative layout math. */
export declare function useFrameSize<T extends HTMLElement>(): {
    width: number;
    height: number;
    ref: import("react").RefObject<T | null>;
};
//# sourceMappingURL=useFrameSize.d.ts.map