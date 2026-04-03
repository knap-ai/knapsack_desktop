import type { PluginSdkFacadeTypeMap } from "../generated/plugin-sdk-facade-type-map.generated.js";
type FacadeEntry = PluginSdkFacadeTypeMap["anthropic-cli"];
type FacadeModule = FacadeEntry["module"];
export declare const CLAUDE_CLI_BACKEND_ID = "claude-cli";
export declare const isClaudeCliProvider: FacadeModule["isClaudeCliProvider"];
export {};
