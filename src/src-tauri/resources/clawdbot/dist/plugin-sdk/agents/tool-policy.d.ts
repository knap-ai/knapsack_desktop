import type { AnyAgentTool } from "./tools/common.js";
export type ToolProfileId = "minimal" | "coding" | "messaging" | "full";
type ToolProfilePolicy = {
    allow?: string[];
    deny?: string[];
};
export declare const TOOL_GROUPS: Record<string, string[]>;
export declare function normalizeToolName(name: string): string;
export declare function isOwnerOnlyToolName(name: string): boolean;
export declare function applyOwnerOnlyToolPolicy(tools: AnyAgentTool[], senderIsOwner: boolean): AnyAgentTool[];
export declare function normalizeToolList(list?: string[]): string[];
export type ToolPolicyLike = {
    allow?: string[];
    deny?: string[];
};
export type PluginToolGroups = {
    all: string[];
    byPlugin: Map<string, string[]>;
};
export type AllowlistResolution = {
    policy: ToolPolicyLike | undefined;
    unknownAllowlist: string[];
    strippedAllowlist: boolean;
};
export declare function expandToolGroups(list?: string[]): string[];
export declare function collectExplicitAllowlist(policies: Array<ToolPolicyLike | undefined>): string[];
export declare function buildPluginToolGroups<T extends {
    name: string;
}>(params: {
    tools: T[];
    toolMeta: (tool: T) => {
        pluginId: string;
    } | undefined;
}): PluginToolGroups;
export declare function expandPluginGroups(list: string[] | undefined, groups: PluginToolGroups): string[] | undefined;
export declare function expandPolicyWithPluginGroups(policy: ToolPolicyLike | undefined, groups: PluginToolGroups): ToolPolicyLike | undefined;
export declare function stripPluginOnlyAllowlist(policy: ToolPolicyLike | undefined, groups: PluginToolGroups, coreTools: Set<string>): AllowlistResolution;
export declare function resolveToolProfilePolicy(profile?: string): ToolProfilePolicy | undefined;
export {};
