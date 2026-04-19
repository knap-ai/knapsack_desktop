import type { SubagentRunRecord } from "./subagent-registry.types.js";
export type ReplaceSubagentRunAfterSteerParams = {
    previousRunId: string;
    nextRunId: string;
    fallback?: SubagentRunRecord;
    runTimeoutSeconds?: number;
    preserveFrozenResultFallback?: boolean;
};
type ReplaceSubagentRunAfterSteerFn = (params: ReplaceSubagentRunAfterSteerParams) => boolean;
export declare function configureSubagentRegistrySteerRuntime(params: {
    replaceSubagentRunAfterSteer: ReplaceSubagentRunAfterSteerFn;
}): void;
export declare function replaceSubagentRunAfterSteer(params: ReplaceSubagentRunAfterSteerParams): boolean;
export {};
