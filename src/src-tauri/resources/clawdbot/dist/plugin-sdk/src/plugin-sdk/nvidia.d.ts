import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["nvidia"];
type FacadeModule = FacadeEntry["module"];
export declare const buildNvidiaProvider: FacadeModule["buildNvidiaProvider"];
export {};
