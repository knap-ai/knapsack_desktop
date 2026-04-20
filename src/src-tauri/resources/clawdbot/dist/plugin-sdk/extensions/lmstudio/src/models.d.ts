import type { ModelDefinitionConfig, ModelProviderConfig } from "openclaw/plugin-sdk/provider-model-shared";
export type LmstudioModelWire = {
    type?: "llm" | "embedding";
    key?: string;
    display_name?: string;
    max_context_length?: number;
    format?: "gguf" | "mlx" | null;
    capabilities?: {
        vision?: boolean;
        trained_for_tool_use?: boolean;
        reasoning?: LmstudioReasoningCapabilityWire;
    };
    loaded_instances?: Array<{
        id?: string;
        config?: {
            context_length?: number;
        } | null;
    } | null>;
};
type LmstudioReasoningCapabilityWire = {
    allowed_options?: unknown;
    default?: unknown;
};
type LmstudioConfiguredCatalogEntry = {
    id: string;
    name?: string;
    contextWindow?: number;
    contextTokens?: number;
    reasoning?: boolean;
    input?: ("text" | "image" | "document")[];
};
/**
 * Resolves LM Studio reasoning support from capabilities payloads.
 * Defaults to false when the server omits reasoning metadata.
 */
export declare function resolveLmstudioReasoningCapability(entry: Pick<LmstudioModelWire, "capabilities">): boolean;
/**
 * Reads loaded LM Studio instances and returns the largest valid context window.
 * Returns null when no usable loaded context is present.
 */
export declare function resolveLoadedContextWindow(entry: Pick<LmstudioModelWire, "loaded_instances">): number | null;
/** Resolves LM Studio server base URL (without /v1 or /api/v1). */
export declare function resolveLmstudioServerBase(configuredBaseUrl?: string): string;
/** Resolves LM Studio inference base URL and always appends /v1. */
export declare function resolveLmstudioInferenceBase(configuredBaseUrl?: string): string;
/** Canonicalizes persisted LM Studio provider config to the inference base URL form. */
export declare function normalizeLmstudioProviderConfig(provider: ModelProviderConfig): ModelProviderConfig;
export declare function normalizeLmstudioConfiguredCatalogEntry(entry: unknown): LmstudioConfiguredCatalogEntry | null;
export declare function normalizeLmstudioConfiguredCatalogEntries(models: unknown): LmstudioConfiguredCatalogEntry[];
export declare function buildLmstudioModelName(model: {
    displayName: string;
    format: "gguf" | "mlx" | null;
    vision: boolean;
    trainedForToolUse: boolean;
    loaded: boolean;
}): string;
/**
 * Base model fields extracted from a single LM Studio wire entry.
 * Shared by the setup layer (persists simple names to config) and the runtime
 * discovery path (which enriches the name with format/state tags).
 */
export type LmstudioModelBase = {
    id: string;
    displayName: string;
    format: "gguf" | "mlx" | null;
    vision: boolean;
    trainedForToolUse: boolean;
    loaded: boolean;
    reasoning: boolean;
    input: ModelDefinitionConfig["input"];
    cost: ModelDefinitionConfig["cost"];
    contextWindow: number;
    contextTokens: number;
    maxTokens: number;
};
/**
 * Maps a single LM Studio wire entry to its base model fields.
 * Returns null for non-LLM entries or entries with no usable key.
 *
 * Shared by both the setup layer (persists simple names to config) and the
 * runtime discovery path (which enriches the name with format/state tags via
 * buildLmstudioModelName).
 */
export declare function mapLmstudioWireEntry(entry: LmstudioModelWire): LmstudioModelBase | null;
/**
 * Maps LM Studio wire models to config entries using plain display names.
 * Use this for config persistence where runtime format/state tags are not needed.
 * For runtime discovery with enriched names, use discoverLmstudioModels from models.fetch.ts.
 */
export declare function mapLmstudioWireModelsToConfig(models: LmstudioModelWire[]): ModelDefinitionConfig[];
export {};
