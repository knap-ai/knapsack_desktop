export { buildMistralProvider } from "./provider-catalog.js";
export { buildMistralModelDefinition, MISTRAL_BASE_URL, MISTRAL_DEFAULT_MODEL_ID, } from "./model-definitions.js";
export { applyMistralConfig, applyMistralProviderConfig, MISTRAL_DEFAULT_MODEL_REF, } from "./onboard.js";
export declare const MISTRAL_MODEL_COMPAT_PATCH: {
    readonly supportsStore: false;
    readonly supportsReasoningEffort: false;
    readonly maxTokensField: "max_tokens";
};
export declare function applyMistralModelCompat<T extends {
    compat?: unknown;
}>(model: T): T;
