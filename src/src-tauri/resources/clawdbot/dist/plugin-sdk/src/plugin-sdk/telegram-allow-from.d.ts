import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["telegram-allow-from"];
type FacadeModule = FacadeEntry["module"];
export declare const isNumericTelegramUserId: FacadeModule["isNumericTelegramUserId"];
export declare const normalizeTelegramAllowFromEntry: FacadeModule["normalizeTelegramAllowFromEntry"];
export {};
