import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["opencode-go"];
type FacadeModule = FacadeEntry["module"];
export declare const applyOpencodeGoConfig: FacadeModule["applyOpencodeGoConfig"];
export declare const applyOpencodeGoModelDefault: FacadeModule["applyOpencodeGoModelDefault"];
export declare const applyOpencodeGoProviderConfig: FacadeModule["applyOpencodeGoProviderConfig"];
export declare const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.5";
export {};
