import type { MemoryCitationsMode } from "../config/types.memory.js";
/**
 * Callback that the active memory plugin provides to build
 * its section of the agent system prompt.
 */
export type MemoryPromptSectionBuilder = (params: {
    availableTools: Set<string>;
    citationsMode?: MemoryCitationsMode;
}) => string[];
export declare function registerMemoryPromptSection(builder: MemoryPromptSectionBuilder): void;
export declare function buildMemoryPromptSection(params: {
    availableTools: Set<string>;
    citationsMode?: MemoryCitationsMode;
}): string[];
/** Return the current builder (used by the plugin cache to snapshot state). */
export declare function getMemoryPromptSectionBuilder(): MemoryPromptSectionBuilder | undefined;
/** Restore a previously-snapshotted builder (used on plugin cache hits). */
export declare function restoreMemoryPromptSection(builder: MemoryPromptSectionBuilder | undefined): void;
/** Clear the registered builder (called on plugin reload and in tests). */
export declare function clearMemoryPromptSection(): void;
/** @deprecated Use {@link clearMemoryPromptSection}. */
export declare const _resetMemoryPromptSection: typeof clearMemoryPromptSection;
