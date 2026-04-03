import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["provider-reasoning"];
type FacadeModule = FacadeEntry["module"];
export declare const isReasoningModelHeuristic: FacadeModule["isReasoningModelHeuristic"];
export {};
