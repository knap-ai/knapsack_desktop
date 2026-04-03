import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["qianfan"];
type FacadeModule = FacadeEntry["module"];
export declare const QIANFAN_BASE_URL = "https://qianfan.baidubce.com/v2";
export declare const QIANFAN_DEFAULT_MODEL_ID = "deepseek-v3.2";
export declare const buildQianfanProvider: FacadeModule["buildQianfanProvider"];
export {};
