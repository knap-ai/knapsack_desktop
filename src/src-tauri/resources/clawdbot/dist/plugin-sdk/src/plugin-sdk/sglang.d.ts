import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["sglang"];
type FacadeModule = FacadeEntry["module"];
export declare const buildSglangProvider: FacadeModule["buildSglangProvider"];
export declare const SGLANG_DEFAULT_API_KEY_ENV_VAR = "SGLANG_API_KEY";
export declare const SGLANG_DEFAULT_BASE_URL = "http://127.0.0.1:30000/v1";
export declare const SGLANG_MODEL_PLACEHOLDER = "Qwen/Qwen3-8B";
export declare const SGLANG_PROVIDER_LABEL = "SGLang";
export {};
