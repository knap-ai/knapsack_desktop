import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["whatsapp-targets"];
type FacadeModule = FacadeEntry["module"];
export declare const isWhatsAppGroupJid: FacadeModule["isWhatsAppGroupJid"];
export declare const isWhatsAppUserTarget: FacadeModule["isWhatsAppUserTarget"];
export declare const normalizeWhatsAppTarget: FacadeModule["normalizeWhatsAppTarget"];
export {};
