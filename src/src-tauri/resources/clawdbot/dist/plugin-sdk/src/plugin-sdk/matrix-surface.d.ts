import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["matrix-surface"];
type FacadeModule = FacadeEntry["module"];
export declare const createMatrixThreadBindingManager: FacadeModule["createMatrixThreadBindingManager"];
export declare const matrixSessionBindingAdapterChannels: FacadeModule["matrixSessionBindingAdapterChannels"];
export declare const resetMatrixThreadBindingsForTests: FacadeModule["resetMatrixThreadBindingsForTests"];
export {};
