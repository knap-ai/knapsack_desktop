type FacadeModule = typeof import("@openclaw/litellm/api.js");
export declare const applyLitellmConfig: FacadeModule["applyLitellmConfig"];
export declare const applyLitellmProviderConfig: FacadeModule["applyLitellmProviderConfig"];
export declare const buildLitellmModelDefinition: FacadeModule["buildLitellmModelDefinition"];
export declare const LITELLM_BASE_URL = "http://localhost:4000";
export declare const LITELLM_DEFAULT_MODEL_ID = "claude-opus-4-6";
export declare const LITELLM_DEFAULT_MODEL_REF = "litellm/claude-opus-4-6";
export {};
