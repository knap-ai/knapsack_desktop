import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["deepseek"];
type FacadeModule = FacadeEntry["module"];
export declare const buildDeepSeekModelDefinition: FacadeModule["buildDeepSeekModelDefinition"];
export declare const buildDeepSeekProvider: FacadeModule["buildDeepSeekProvider"];
export declare const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
export declare const DEEPSEEK_MODEL_CATALOG: FacadeModule["DEEPSEEK_MODEL_CATALOG"];
export {};
