import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["bluebubbles-policy"];
type FacadeModule = FacadeEntry["module"];
export declare const isAllowedBlueBubblesSender: FacadeModule["isAllowedBlueBubblesSender"];
export declare const resolveBlueBubblesGroupRequireMention: FacadeModule["resolveBlueBubblesGroupRequireMention"];
export declare const resolveBlueBubblesGroupToolPolicy: FacadeModule["resolveBlueBubblesGroupToolPolicy"];
export {};
