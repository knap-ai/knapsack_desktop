import type { ChannelId } from "../../channels/plugins/types.js";
export declare function normalizeChannelTargetInput(raw: string): string;
declare function resetTargetNormalizerCacheForTests(): void;
export declare const __testing: {
    readonly resetTargetNormalizerCacheForTests: typeof resetTargetNormalizerCacheForTests;
};
export declare function normalizeTargetForProvider(provider: string, raw?: string): string | undefined;
export declare function buildTargetResolverSignature(channel: ChannelId): string;
export {};
