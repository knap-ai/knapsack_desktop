import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { ModelCatalogEntry } from "./model-catalog.types.js";
export { resolveThinkingDefault } from "./model-thinking-default.js";
import { type ModelRef, findNormalizedProviderKey, findNormalizedProviderValue, legacyModelKey, modelKey, normalizeModelRef, normalizeProviderId, normalizeProviderIdForAuth, parseModelRef } from "./model-selection-normalize.js";
export type ThinkLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "adaptive";
export type ModelAliasIndex = {
    byAlias: Map<string, {
        alias: string;
        ref: ModelRef;
    }>;
    byKey: Map<string, string[]>;
};
export { findNormalizedProviderKey, findNormalizedProviderValue, legacyModelKey, modelKey, normalizeModelRef, normalizeProviderId, normalizeProviderIdForAuth, parseModelRef, };
export type { ModelRef };
export { isCliProvider } from "./model-selection-cli.js";
export declare function resolvePersistedOverrideModelRef(params: {
    defaultProvider: string;
    overrideProvider?: string;
    overrideModel?: string;
}): ModelRef | null;
/**
 * Runtime-first resolver for persisted model metadata.
 * Use this when callers intentionally want the last executed model identity.
 */
export declare function resolvePersistedModelRef(params: {
    defaultProvider: string;
    runtimeProvider?: string;
    runtimeModel?: string;
    overrideProvider?: string;
    overrideModel?: string;
}): ModelRef | null;
/**
 * Selected-model resolver for persisted model metadata.
 * Use this for control/status/UI surfaces that should honor explicit session
 * overrides before falling back to runtime identity.
 */
export declare function resolvePersistedSelectedModelRef(params: {
    defaultProvider: string;
    runtimeProvider?: string;
    runtimeModel?: string;
    overrideProvider?: string;
    overrideModel?: string;
}): ModelRef | null;
export declare function normalizeStoredOverrideModel(params: {
    providerOverride?: string | null;
    modelOverride?: string | null;
}): {
    providerOverride?: string;
    modelOverride?: string;
};
export declare function inferUniqueProviderFromConfiguredModels(params: {
    cfg: OpenClawConfig;
    model: string;
}): string | undefined;
export declare function resolveAllowlistModelKey(raw: string, defaultProvider: string): string | null;
export declare function buildConfiguredAllowlistKeys(params: {
    cfg: OpenClawConfig | undefined;
    defaultProvider: string;
}): Set<string> | null;
export declare function buildModelAliasIndex(params: {
    cfg: OpenClawConfig;
    defaultProvider: string;
    allowPluginNormalization?: boolean;
}): ModelAliasIndex;
export declare function resolveModelRefFromString(params: {
    raw: string;
    defaultProvider: string;
    aliasIndex?: ModelAliasIndex;
    allowPluginNormalization?: boolean;
}): {
    ref: ModelRef;
    alias?: string;
} | null;
export declare function resolveConfiguredModelRef(params: {
    cfg: OpenClawConfig;
    defaultProvider: string;
    defaultModel: string;
    allowPluginNormalization?: boolean;
}): ModelRef;
export declare function resolveDefaultModelForAgent(params: {
    cfg: OpenClawConfig;
    agentId?: string;
}): ModelRef;
export declare function resolveSubagentConfiguredModelSelection(params: {
    cfg: OpenClawConfig;
    agentId: string;
}): string | undefined;
export declare function resolveSubagentSpawnModelSelection(params: {
    cfg: OpenClawConfig;
    agentId: string;
    modelOverride?: unknown;
}): string;
export declare function buildAllowedModelSet(params: {
    cfg: OpenClawConfig;
    catalog: ModelCatalogEntry[];
    defaultProvider: string;
    defaultModel?: string;
    agentId?: string;
}): {
    allowAny: boolean;
    allowedCatalog: ModelCatalogEntry[];
    allowedKeys: Set<string>;
};
export declare function buildConfiguredModelCatalog(params: {
    cfg: OpenClawConfig;
}): ModelCatalogEntry[];
export type ModelRefStatus = {
    key: string;
    inCatalog: boolean;
    allowAny: boolean;
    allowed: boolean;
};
export declare function getModelRefStatus(params: {
    cfg: OpenClawConfig;
    catalog: ModelCatalogEntry[];
    ref: ModelRef;
    defaultProvider: string;
    defaultModel?: string;
}): ModelRefStatus;
export declare function resolveAllowedModelRef(params: {
    cfg: OpenClawConfig;
    catalog: ModelCatalogEntry[];
    raw: string;
    defaultProvider: string;
    defaultModel?: string;
}): {
    ref: ModelRef;
    key: string;
} | {
    error: string;
};
/** Default reasoning level when session/directive do not set it: "on" if model supports reasoning, else "off". */
export declare function resolveReasoningDefault(params: {
    provider: string;
    model: string;
    catalog?: ModelCatalogEntry[];
}): "on" | "off";
/**
 * Resolve the model configured for Gmail hook processing.
 * Returns null if hooks.gmail.model is not set.
 */
export declare function resolveHooksGmailModel(params: {
    cfg: OpenClawConfig;
    defaultProvider: string;
}): ModelRef | null;
/**
 * Normalize a model selection value (string or `{primary?: string}`) to a
 * plain trimmed string.  Returns `undefined` when the input is empty/missing.
 * Shared by sessions-spawn and cron isolated-agent model resolution.
 */
export declare function normalizeModelSelection(value: unknown): string | undefined;
