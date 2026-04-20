export type { OpenClawPluginApi, ProviderAuthContext, ProviderAuthMethodNonInteractiveContext, ProviderAuthResult, ProviderCatalogContext, ProviderDiscoveryContext, ProviderPrepareDynamicModelContext, ProviderRuntimeModel, } from "../plugins/types.js";
export type { LmstudioModelBase, LmstudioModelWire } from "./lmstudio-runtime.js";
export { LMSTUDIO_DEFAULT_API_KEY_ENV_VAR, LMSTUDIO_DEFAULT_BASE_URL, LMSTUDIO_DEFAULT_EMBEDDING_MODEL, LMSTUDIO_DEFAULT_INFERENCE_BASE_URL, LMSTUDIO_DEFAULT_LOAD_CONTEXT_LENGTH, LMSTUDIO_DEFAULT_MODEL_ID, LMSTUDIO_LOCAL_API_KEY_PLACEHOLDER, LMSTUDIO_MODEL_PLACEHOLDER, LMSTUDIO_PROVIDER_ID, LMSTUDIO_PROVIDER_LABEL, buildLmstudioAuthHeaders, discoverLmstudioModels, ensureLmstudioModelLoaded, fetchLmstudioModels, mapLmstudioWireEntry, normalizeLmstudioProviderConfig, resolveLoadedContextWindow, resolveLmstudioConfiguredApiKey, resolveLmstudioInferenceBase, resolveLmstudioProviderHeaders, resolveLmstudioReasoningCapability, resolveLmstudioRuntimeApiKey, resolveLmstudioServerBase, } from "./lmstudio-runtime.js";
type FacadeModule = typeof import("@openclaw/lmstudio/api.js");
export declare const promptAndConfigureLmstudioInteractive: FacadeModule["promptAndConfigureLmstudioInteractive"];
export declare const configureLmstudioNonInteractive: FacadeModule["configureLmstudioNonInteractive"];
export declare const discoverLmstudioProvider: FacadeModule["discoverLmstudioProvider"];
export declare const prepareLmstudioDynamicModels: FacadeModule["prepareLmstudioDynamicModels"];
