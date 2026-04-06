import { loadConfig } from "../config/config.js";
import { ensureContextEnginesInitialized } from "../context-engine/init.js";
import { resolveContextEngine } from "../context-engine/registry.js";
import { callGateway } from "../gateway/call.js";
import { onAgentEvent } from "../infra/agent-events.js";
import { type DeliveryContext } from "../utils/delivery-context.js";
import { ensureRuntimePluginsLoaded } from "./runtime-plugins.js";
import * as subagentAnnounceModule from "./subagent-announce.js";
import { getSubagentRunsSnapshotForRead, persistSubagentRunsToDisk, restoreSubagentRunsFromDisk } from "./subagent-registry-state.js";
import type { SubagentRunRecord } from "./subagent-registry.types.js";
import { resolveAgentTimeoutMs } from "./timeout.js";
export type { SubagentRunRecord } from "./subagent-registry.types.js";
export { getSubagentSessionRuntimeMs, getSubagentSessionStartedAt, resolveSubagentSessionStatus, } from "./subagent-registry-helpers.js";
type SubagentRegistryDeps = {
    callGateway: typeof callGateway;
    captureSubagentCompletionReply: typeof subagentAnnounceModule.captureSubagentCompletionReply;
    ensureContextEnginesInitialized: typeof ensureContextEnginesInitialized;
    ensureRuntimePluginsLoaded: typeof ensureRuntimePluginsLoaded;
    getSubagentRunsSnapshotForRead: typeof getSubagentRunsSnapshotForRead;
    loadConfig: typeof loadConfig;
    onAgentEvent: typeof onAgentEvent;
    persistSubagentRunsToDisk: typeof persistSubagentRunsToDisk;
    resolveAgentTimeoutMs: typeof resolveAgentTimeoutMs;
    resolveContextEngine: typeof resolveContextEngine;
    restoreSubagentRunsFromDisk: typeof restoreSubagentRunsFromDisk;
    runSubagentAnnounceFlow: typeof subagentAnnounceModule.runSubagentAnnounceFlow;
};
export declare function markSubagentRunForSteerRestart(runId: string): boolean;
export declare function clearSubagentRunSteerRestart(runId: string): boolean;
export declare function replaceSubagentRunAfterSteer(params: {
    previousRunId: string;
    nextRunId: string;
    fallback?: SubagentRunRecord;
    runTimeoutSeconds?: number;
    preserveFrozenResultFallback?: boolean;
}): boolean;
export declare function registerSubagentRun(params: {
    runId: string;
    childSessionKey: string;
    controllerSessionKey?: string;
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
    requesterDisplayKey: string;
    task: string;
    cleanup: "delete" | "keep";
    label?: string;
    model?: string;
    workspaceDir?: string;
    runTimeoutSeconds?: number;
    expectsCompletionMessage?: boolean;
    spawnMode?: "run" | "session";
    attachmentsDir?: string;
    attachmentsRootDir?: string;
    retainAttachmentsOnKeep?: boolean;
}): void;
export declare function resetSubagentRegistryForTests(opts?: {
    persist?: boolean;
}): void;
export declare const __testing: {
    readonly setDepsForTest: (overrides?: Partial<SubagentRegistryDeps>) => void;
};
export declare function addSubagentRunForTests(entry: SubagentRunRecord): void;
export declare function releaseSubagentRun(runId: string): void;
export declare function resolveRequesterForChildSession(childSessionKey: string): {
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
} | null;
export declare function isSubagentSessionRunActive(childSessionKey: string): boolean;
export declare function shouldIgnorePostCompletionAnnounceForSession(childSessionKey: string): boolean;
export declare function markSubagentRunTerminated(params: {
    runId?: string;
    childSessionKey?: string;
    reason?: string;
}): number;
export declare function listSubagentRunsForRequester(requesterSessionKey: string, options?: {
    requesterRunId?: string;
}): SubagentRunRecord[];
export declare function listSubagentRunsForController(controllerSessionKey: string): SubagentRunRecord[];
export declare function countActiveRunsForSession(requesterSessionKey: string): number;
export declare function countActiveDescendantRuns(rootSessionKey: string): number;
export declare function countPendingDescendantRuns(rootSessionKey: string): number;
export declare function countPendingDescendantRunsExcludingRun(rootSessionKey: string, excludeRunId: string): number;
export declare function listDescendantRunsForRequester(rootSessionKey: string): SubagentRunRecord[];
export declare function getSubagentRunByChildSessionKey(childSessionKey: string): SubagentRunRecord | null;
export declare function getLatestSubagentRunByChildSessionKey(childSessionKey: string): SubagentRunRecord | null;
export declare function initSubagentRegistry(): void;
