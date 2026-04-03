import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["discord-account"];
type FacadeModule = FacadeEntry["module"];
export declare const resolveDiscordAccount: FacadeModule["resolveDiscordAccount"];
export type ResolvedDiscordAccount = FacadeEntry["types"]["ResolvedDiscordAccount"];
export {};
