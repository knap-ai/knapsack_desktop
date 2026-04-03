import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["slack-account"];
type FacadeModule = FacadeEntry["module"];
export declare const resolveSlackAccount: FacadeModule["resolveSlackAccount"];
export type ResolvedSlackAccount = FacadeEntry["types"]["ResolvedSlackAccount"];
export {};
