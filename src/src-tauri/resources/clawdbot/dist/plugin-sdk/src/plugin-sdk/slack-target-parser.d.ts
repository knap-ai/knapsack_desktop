import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["slack-target-parser"];
type FacadeModule = FacadeEntry["module"];
export declare const parseSlackTarget: FacadeModule["parseSlackTarget"];
export declare const resolveSlackChannelId: FacadeModule["resolveSlackChannelId"];
export {};
