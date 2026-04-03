import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["image-generation-runtime"];
type FacadeModule = FacadeEntry["module"];
export declare const generateImage: FacadeModule["generateImage"];
export declare const listRuntimeImageGenerationProviders: FacadeModule["listRuntimeImageGenerationProviders"];
export type GenerateImageParams = FacadeEntry["types"]["GenerateImageParams"];
export type GenerateImageRuntimeResult = FacadeEntry["types"]["GenerateImageRuntimeResult"];
export {};
