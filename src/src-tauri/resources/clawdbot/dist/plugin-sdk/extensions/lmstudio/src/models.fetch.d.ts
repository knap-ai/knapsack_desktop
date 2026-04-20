import type { ModelDefinitionConfig } from "openclaw/plugin-sdk/provider-model-shared";
import { type SsrFPolicy } from "openclaw/plugin-sdk/ssrf-runtime";
import { type LmstudioModelWire } from "./models.js";
export type FetchLmstudioModelsResult = {
    reachable: boolean;
    status?: number;
    models: LmstudioModelWire[];
    error?: unknown;
};
type DiscoverLmstudioModelsParams = {
    baseUrl: string;
    apiKey: string;
    headers?: Record<string, string>;
    quiet: boolean;
    /** Injectable fetch implementation; defaults to the global fetch. */
    fetchImpl?: typeof fetch;
};
/** Fetches /api/v1/models and reports transport reachability separately from HTTP status. */
export declare function fetchLmstudioModels(params: {
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    ssrfPolicy?: SsrFPolicy;
    timeoutMs?: number;
    /** Injectable fetch implementation; defaults to the global fetch. */
    fetchImpl?: typeof fetch;
}): Promise<FetchLmstudioModelsResult>;
/** Discovers LLM models from LM Studio and maps them to OpenClaw model definitions. */
export declare function discoverLmstudioModels(params: DiscoverLmstudioModelsParams): Promise<ModelDefinitionConfig[]>;
/** Ensures a model is loaded in LM Studio before first real inference/embedding call. */
export declare function ensureLmstudioModelLoaded(params: {
    baseUrl?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    ssrfPolicy?: SsrFPolicy;
    modelKey: string;
    requestedContextLength?: number;
    timeoutMs?: number;
    /** Injectable fetch implementation; defaults to the global fetch. */
    fetchImpl?: typeof fetch;
}): Promise<void>;
export {};
