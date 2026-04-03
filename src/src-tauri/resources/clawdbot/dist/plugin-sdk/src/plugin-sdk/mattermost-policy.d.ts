import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["mattermost-policy"];
type FacadeModule = FacadeEntry["module"];
export declare const isMattermostSenderAllowed: FacadeModule["isMattermostSenderAllowed"];
export {};
