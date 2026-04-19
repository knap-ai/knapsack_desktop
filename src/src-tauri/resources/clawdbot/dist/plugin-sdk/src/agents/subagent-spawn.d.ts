import type { SubagentLifecycleHookRunner } from "../plugins/hooks.js";
import { decodeStrictBase64 } from "./subagent-attachments.js";
export { SUBAGENT_SPAWN_ACCEPTED_NOTE, SUBAGENT_SPAWN_SESSION_ACCEPTED_NOTE, } from "./subagent-spawn-accepted-note.js";
import { callGateway, loadConfig, updateSessionStore } from "./subagent-spawn.runtime.js";
import { type SpawnSubagentMode, type SpawnSubagentSandboxMode } from "./subagent-spawn.types.js";
export { SUBAGENT_SPAWN_MODES, SUBAGENT_SPAWN_SANDBOX_MODES } from "./subagent-spawn.types.js";
export type { SpawnSubagentMode, SpawnSubagentSandboxMode } from "./subagent-spawn.types.js";
export { decodeStrictBase64 };
type SubagentSpawnDeps = {
    callGateway: typeof callGateway;
    getGlobalHookRunner: () => SubagentLifecycleHookRunner | null;
    loadConfig: typeof loadConfig;
    updateSessionStore: typeof updateSessionStore;
};
export type SpawnSubagentParams = {
    task: string;
    label?: string;
    agentId?: string;
    model?: string;
    thinking?: string;
    runTimeoutSeconds?: number;
    thread?: boolean;
    mode?: SpawnSubagentMode;
    cleanup?: "delete" | "keep";
    sandbox?: SpawnSubagentSandboxMode;
    lightContext?: boolean;
    expectsCompletionMessage?: boolean;
    attachments?: Array<{
        name: string;
        content: string;
        encoding?: "utf8" | "base64";
        mimeType?: string;
    }>;
    attachMountPath?: string;
};
export type SpawnSubagentContext = {
    agentSessionKey?: string;
    agentChannel?: string;
    agentAccountId?: string;
    agentTo?: string;
    agentThreadId?: string | number;
    agentGroupId?: string | null;
    agentGroupChannel?: string | null;
    agentGroupSpace?: string | null;
    requesterAgentIdOverride?: string;
    /** Explicit workspace directory for subagent to inherit (optional). */
    workspaceDir?: string;
};
export type SpawnSubagentResult = {
    status: "accepted" | "forbidden" | "error";
    childSessionKey?: string;
    runId?: string;
    mode?: SpawnSubagentMode;
    note?: string;
    modelApplied?: boolean;
    error?: string;
    attachments?: {
        count: number;
        totalBytes: number;
        files: Array<{
            name: string;
            bytes: number;
            sha256: string;
        }>;
        relDir: string;
    };
};
export { splitModelRef } from "./subagent-spawn-plan.js";
export declare function spawnSubagentDirect(params: SpawnSubagentParams, ctx: SpawnSubagentContext): Promise<SpawnSubagentResult>;
export declare const __testing: {
    setDepsForTest(overrides?: Partial<SubagentSpawnDeps>): void;
};
