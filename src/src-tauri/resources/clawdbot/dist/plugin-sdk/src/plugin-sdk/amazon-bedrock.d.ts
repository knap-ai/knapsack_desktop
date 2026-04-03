import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["amazon-bedrock"];
type FacadeModule = FacadeEntry["module"];
export declare const discoverBedrockModels: FacadeModule["discoverBedrockModels"];
export declare const mergeImplicitBedrockProvider: FacadeModule["mergeImplicitBedrockProvider"];
export declare const resetBedrockDiscoveryCacheForTest: FacadeModule["resetBedrockDiscoveryCacheForTest"];
export declare const resolveBedrockConfigApiKey: FacadeModule["resolveBedrockConfigApiKey"];
export declare const resolveImplicitBedrockProvider: FacadeModule["resolveImplicitBedrockProvider"];
export {};
