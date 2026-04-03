import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["matrix-runtime-surface"];
type FacadeModule = FacadeEntry["module"];
export declare const resolveMatrixAccountStringValues: FacadeModule["resolveMatrixAccountStringValues"];
export declare const setMatrixRuntime: FacadeModule["setMatrixRuntime"];
export {};
