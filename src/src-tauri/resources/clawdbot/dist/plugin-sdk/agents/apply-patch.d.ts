import type { AgentTool } from "@mariozechner/pi-agent-core";
import type { SandboxFsBridge } from "./sandbox/fs-bridge.js";
export type ApplyPatchSummary = {
    added: string[];
    modified: string[];
    deleted: string[];
};
export type ApplyPatchResult = {
    summary: ApplyPatchSummary;
    text: string;
};
export type ApplyPatchToolDetails = {
    summary: ApplyPatchSummary;
};
type SandboxApplyPatchConfig = {
    root: string;
    bridge: SandboxFsBridge;
};
type ApplyPatchOptions = {
    cwd: string;
    sandbox?: SandboxApplyPatchConfig;
    signal?: AbortSignal;
};
declare const applyPatchSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    input: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare function createApplyPatchTool(options?: {
    cwd?: string;
    sandbox?: SandboxApplyPatchConfig;
}): AgentTool<typeof applyPatchSchema, ApplyPatchToolDetails>;
export declare function applyPatch(input: string, options: ApplyPatchOptions): Promise<ApplyPatchResult>;
export {};
