import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["memory-core-engine-runtime"];
type FacadeModule = FacadeEntry["module"];
export declare const getBuiltinMemoryEmbeddingProviderDoctorMetadata: FacadeModule["getBuiltinMemoryEmbeddingProviderDoctorMetadata"];
export declare const getMemorySearchManager: FacadeModule["getMemorySearchManager"];
export declare const listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata: FacadeModule["listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata"];
export declare const MemoryIndexManager: FacadeModule["MemoryIndexManager"];
export type BuiltinMemoryEmbeddingProviderDoctorMetadata = FacadeEntry["types"]["BuiltinMemoryEmbeddingProviderDoctorMetadata"];
export {};
