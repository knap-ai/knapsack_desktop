import type { AnyAgentTool } from "./pi-tools.types.js";
import type { SandboxFsBridge } from "./sandbox/fs-bridge.js";
type RequiredParamGroup = {
    keys: readonly string[];
    allowEmpty?: boolean;
    label?: string;
};
export declare const CLAUDE_PARAM_GROUPS: {
    readonly read: readonly [{
        readonly keys: readonly ["path", "file_path"];
        readonly label: "path (path or file_path)";
    }];
    readonly write: readonly [{
        readonly keys: readonly ["path", "file_path"];
        readonly label: "path (path or file_path)";
    }];
    readonly edit: readonly [{
        readonly keys: readonly ["path", "file_path"];
        readonly label: "path (path or file_path)";
    }, {
        readonly keys: readonly ["oldText", "old_string"];
        readonly label: "oldText (oldText or old_string)";
    }, {
        readonly keys: readonly ["newText", "new_string"];
        readonly label: "newText (newText or new_string)";
    }];
};
export declare function normalizeToolParams(params: unknown): Record<string, unknown> | undefined;
export declare function patchToolSchemaForClaudeCompatibility(tool: AnyAgentTool): AnyAgentTool;
export declare function assertRequiredParams(record: Record<string, unknown> | undefined, groups: readonly RequiredParamGroup[], toolName: string): void;
export declare function wrapToolParamNormalization(tool: AnyAgentTool, requiredParamGroups?: readonly RequiredParamGroup[]): AnyAgentTool;
type SandboxToolParams = {
    root: string;
    bridge: SandboxFsBridge;
};
export declare function createSandboxedReadTool(params: SandboxToolParams): AnyAgentTool;
export declare function createSandboxedWriteTool(params: SandboxToolParams): AnyAgentTool;
export declare function createSandboxedEditTool(params: SandboxToolParams): AnyAgentTool;
export declare function createOpenClawReadTool(base: AnyAgentTool): AnyAgentTool;
export {};
