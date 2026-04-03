import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["discord-session-key"];
type FacadeModule = FacadeEntry["module"];
export declare const normalizeExplicitDiscordSessionKey: FacadeModule["normalizeExplicitDiscordSessionKey"];
export {};
