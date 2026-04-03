import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["matrix-thread-bindings"];
type FacadeModule = FacadeEntry["module"];
export declare const setMatrixThreadBindingIdleTimeoutBySessionKey: FacadeModule["setMatrixThreadBindingIdleTimeoutBySessionKey"];
export declare const setMatrixThreadBindingMaxAgeBySessionKey: FacadeModule["setMatrixThreadBindingMaxAgeBySessionKey"];
export {};
