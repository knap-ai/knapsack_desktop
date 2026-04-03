import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["openrouter"];
type FacadeModule = FacadeEntry["module"];
export declare const applyOpenrouterConfig: FacadeModule["applyOpenrouterConfig"];
export declare const applyOpenrouterProviderConfig: FacadeModule["applyOpenrouterProviderConfig"];
export declare const buildOpenrouterProvider: FacadeModule["buildOpenrouterProvider"];
export declare const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";
export {};
