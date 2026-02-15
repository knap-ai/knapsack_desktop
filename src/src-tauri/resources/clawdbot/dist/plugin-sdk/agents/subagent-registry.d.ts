import { type DeliveryContext } from "../utils/delivery-context.js";
import { type SubagentRunOutcome } from "./subagent-announce.js";
export type SubagentRunRecord = {
    runId: string;
    childSessionKey: string;
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
    requesterDisplayKey: string;
    task: string;
    cleanup: "delete" | "keep";
    label?: string;
    createdAt: number;
    startedAt?: number;
    endedAt?: number;
    outcome?: SubagentRunOutcome;
    archiveAtMs?: number;
    cleanupCompletedAt?: number;
    cleanupHandled?: boolean;
};
export declare function registerSubagentRun(params: {
    runId: string;
    childSessionKey: string;
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
    requesterDisplayKey: string;
    task: string;
    cleanup: "delete" | "keep";
    label?: string;
    runTimeoutSeconds?: number;
}): void;
export declare function resetSubagentRegistryForTests(opts?: {
    persist?: boolean;
}): void;
export declare function addSubagentRunForTests(entry: SubagentRunRecord): void;
export declare function releaseSubagentRun(runId: string): void;
export declare function listSubagentRunsForRequester(requesterSessionKey: string): SubagentRunRecord[];
export declare function initSubagentRegistry(): void;
