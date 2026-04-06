import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["discord-timeouts"];
type FacadeModule = FacadeEntry["module"];
export declare const DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS: FacadeModule["DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS"];
export declare const DISCORD_DEFAULT_LISTENER_TIMEOUT_MS = 120000;
export {};
