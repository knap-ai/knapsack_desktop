import type { SubagentRunRecord } from "../../agents/subagent-registry.js";
export declare function resolveSubagentLabel(entry: SubagentRunRecord, fallback?: string): string;
export declare function formatRunLabel(entry: SubagentRunRecord, options?: {
    maxLength?: number;
}): string;
export declare function formatRunStatus(entry: SubagentRunRecord): "timeout" | "error" | "unknown" | "done" | "running";
export declare function sortSubagentRuns(runs: SubagentRunRecord[]): SubagentRunRecord[];
