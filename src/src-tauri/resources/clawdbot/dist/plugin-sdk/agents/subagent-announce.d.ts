import { type DeliveryContext } from "../utils/delivery-context.js";
export declare function buildSubagentSystemPrompt(params: {
    requesterSessionKey?: string;
    requesterOrigin?: DeliveryContext;
    childSessionKey: string;
    label?: string;
    task?: string;
}): string;
export type SubagentRunOutcome = {
    status: "ok" | "error" | "timeout" | "unknown";
    error?: string;
};
export type SubagentAnnounceType = "subagent task" | "cron job";
export declare function runSubagentAnnounceFlow(params: {
    childSessionKey: string;
    childRunId: string;
    requesterSessionKey: string;
    requesterOrigin?: DeliveryContext;
    requesterDisplayKey: string;
    task: string;
    timeoutMs: number;
    cleanup: "delete" | "keep";
    roundOneReply?: string;
    waitForCompletion?: boolean;
    startedAt?: number;
    endedAt?: number;
    label?: string;
    outcome?: SubagentRunOutcome;
    announceType?: SubagentAnnounceType;
}): Promise<boolean>;
