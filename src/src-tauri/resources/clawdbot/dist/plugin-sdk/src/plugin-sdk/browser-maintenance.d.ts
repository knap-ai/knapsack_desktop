import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type BrowserRuntimeModule = PluginSdkFacadeTypeMap["browser-runtime"]["module"];
export declare const closeTrackedBrowserTabsForSessions: BrowserRuntimeModule["closeTrackedBrowserTabsForSessions"];
export declare const movePathToTrash: BrowserRuntimeModule["movePathToTrash"];
export {};
