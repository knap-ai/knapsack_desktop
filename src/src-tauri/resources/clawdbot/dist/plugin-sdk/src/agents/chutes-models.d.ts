import type { ModelDefinitionConfig } from "../config/types.models.js";
/** Chutes.ai OpenAI-compatible API base URL. */
export declare const CHUTES_BASE_URL = "https://llm.chutes.ai/v1";
export declare const CHUTES_DEFAULT_MODEL_ID = "zai-org/GLM-4.7-TEE";
export declare const CHUTES_DEFAULT_MODEL_REF = "chutes/zai-org/GLM-4.7-TEE";
/** Default cost for Chutes models (actual cost varies by model and compute). */
export declare const CHUTES_DEFAULT_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
/**
 * Static catalog of popular Chutes models.
 * Used as a fallback and for initial onboarding allowlisting.
 */
export declare const CHUTES_MODEL_CATALOG: ModelDefinitionConfig[];
export declare function buildChutesModelDefinition(model: (typeof CHUTES_MODEL_CATALOG)[number]): ModelDefinitionConfig;
/** @internal - For testing only */
export declare function clearChutesModelCache(): void;
/**
 * Discover models from Chutes.ai API with fallback to static catalog.
 * Mimics the logic in Chutes init script.
 */
export declare function discoverChutesModels(accessToken?: string): Promise<ModelDefinitionConfig[]>;
