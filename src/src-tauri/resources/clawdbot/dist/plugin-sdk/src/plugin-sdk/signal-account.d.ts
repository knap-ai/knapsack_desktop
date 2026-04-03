import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["signal-account"];
type FacadeModule = FacadeEntry["module"];
export declare const resolveSignalAccount: FacadeModule["resolveSignalAccount"];
export type ResolvedSignalAccount = FacadeEntry["types"]["ResolvedSignalAccount"];
export {};
