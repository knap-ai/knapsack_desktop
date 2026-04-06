import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["kimi-coding"];
type FacadeModule = FacadeEntry["module"];
export declare const buildKimiCodingProvider: FacadeModule["buildKimiCodingProvider"];
export {};
