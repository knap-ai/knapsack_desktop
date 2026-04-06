import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["opencode"];
type FacadeModule = FacadeEntry["module"];
export declare const applyOpencodeZenConfig: FacadeModule["applyOpencodeZenConfig"];
export declare const applyOpencodeZenModelDefault: FacadeModule["applyOpencodeZenModelDefault"];
export declare const applyOpencodeZenProviderConfig: FacadeModule["applyOpencodeZenProviderConfig"];
export declare const OPENCODE_ZEN_DEFAULT_MODEL = "opencode/claude-opus-4-6";
export declare const OPENCODE_ZEN_DEFAULT_MODEL_REF = "opencode/claude-opus-4-6";
export {};
