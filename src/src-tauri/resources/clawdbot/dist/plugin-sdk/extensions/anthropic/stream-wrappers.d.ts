import type { StreamFn } from "@mariozechner/pi-agent-core";
type AnthropicServiceTier = "auto" | "standard_only";
export declare function resolveAnthropicBetas(extraParams: Record<string, unknown> | undefined, modelId: string): string[] | undefined;
export declare function createAnthropicBetaHeadersWrapper(baseStreamFn: StreamFn | undefined, betas: string[]): StreamFn;
export declare function createAnthropicFastModeWrapper(baseStreamFn: StreamFn | undefined, enabled: boolean): StreamFn;
export declare function createAnthropicServiceTierWrapper(baseStreamFn: StreamFn | undefined, serviceTier: AnthropicServiceTier): StreamFn;
export declare function resolveAnthropicFastMode(extraParams: Record<string, unknown> | undefined): boolean | undefined;
export declare function resolveAnthropicServiceTier(extraParams: Record<string, unknown> | undefined): AnthropicServiceTier | undefined;
export declare const __testing: {
    log: import("openclaw/plugin-sdk/runtime-env").SubsystemLogger;
};
export {};
