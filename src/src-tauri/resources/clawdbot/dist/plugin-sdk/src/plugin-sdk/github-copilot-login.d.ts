import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["github-copilot-login"];
type FacadeModule = FacadeEntry["module"];
export declare const githubCopilotLoginCommand: FacadeModule["githubCopilotLoginCommand"];
export {};
