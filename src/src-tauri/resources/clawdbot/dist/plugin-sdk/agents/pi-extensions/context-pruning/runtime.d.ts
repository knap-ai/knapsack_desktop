import type { EffectiveContextPruningSettings } from "./settings.js";
export type ContextPruningRuntimeValue = {
    settings: EffectiveContextPruningSettings;
    contextWindowTokens?: number | null;
    isToolPrunable: (toolName: string) => boolean;
    lastCacheTouchAt?: number | null;
};
export declare function setContextPruningRuntime(sessionManager: unknown, value: ContextPruningRuntimeValue | null): void;
export declare function getContextPruningRuntime(sessionManager: unknown): ContextPruningRuntimeValue | null;
