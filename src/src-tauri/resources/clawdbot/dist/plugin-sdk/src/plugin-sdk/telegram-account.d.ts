import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["telegram-account"];
type FacadeModule = FacadeEntry["module"];
export declare const resolveTelegramAccount: FacadeModule["resolveTelegramAccount"];
export type ResolvedTelegramAccount = FacadeEntry["types"]["ResolvedTelegramAccount"];
export {};
