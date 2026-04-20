import type { OpenClawConfig, ResolvedMemorySearchConfig } from "openclaw/plugin-sdk/memory-core-host-engine-foundation";
import { type EmbeddingProvider, type EmbeddingProviderResult, type EmbeddingProviderRuntime } from "./embeddings.js";
export type MemoryResolvedProviderState = {
    provider: EmbeddingProvider | null;
    fallbackFrom?: string;
    fallbackReason?: string;
    providerUnavailableReason?: string;
    providerRuntime?: EmbeddingProviderRuntime;
};
export declare function resolveMemoryPrimaryProviderRequest(params: {
    settings: ResolvedMemorySearchConfig;
}): {
    provider: string;
    model: string;
    remote: ResolvedMemorySearchConfig["remote"];
    outputDimensionality: ResolvedMemorySearchConfig["outputDimensionality"];
    fallback: ResolvedMemorySearchConfig["fallback"];
    local: ResolvedMemorySearchConfig["local"];
};
export declare function resolveMemoryProviderState(result: Pick<EmbeddingProviderResult, "provider" | "fallbackFrom" | "fallbackReason" | "providerUnavailableReason" | "runtime">): MemoryResolvedProviderState;
export declare function applyMemoryFallbackProviderState(params: {
    current: MemoryResolvedProviderState;
    fallbackFrom: string;
    reason: string;
    result: Pick<EmbeddingProviderResult, "provider" | "runtime">;
}): MemoryResolvedProviderState;
export declare function resolveMemoryFallbackProviderRequest(params: {
    cfg: OpenClawConfig;
    settings: ResolvedMemorySearchConfig;
    currentProviderId: string | null;
}): {
    provider: string;
    model: string;
    remote: ResolvedMemorySearchConfig["remote"];
    outputDimensionality: ResolvedMemorySearchConfig["outputDimensionality"];
    fallback: "none";
    local: ResolvedMemorySearchConfig["local"];
} | null;
