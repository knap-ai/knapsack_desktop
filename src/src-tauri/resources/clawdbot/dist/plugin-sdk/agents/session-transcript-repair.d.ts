import type { AgentMessage } from "@mariozechner/pi-agent-core";
declare function makeMissingToolResult(params: {
    toolCallId: string;
    toolName?: string;
}): Extract<AgentMessage, {
    role: "toolResult";
}>;
export { makeMissingToolResult };
export type ToolCallInputRepairReport = {
    messages: AgentMessage[];
    droppedToolCalls: number;
    droppedAssistantMessages: number;
};
export declare function repairToolCallInputs(messages: AgentMessage[]): ToolCallInputRepairReport;
export declare function sanitizeToolCallInputs(messages: AgentMessage[]): AgentMessage[];
export declare function sanitizeToolUseResultPairing(messages: AgentMessage[]): AgentMessage[];
export type ToolUseRepairReport = {
    messages: AgentMessage[];
    added: Array<Extract<AgentMessage, {
        role: "toolResult";
    }>>;
    droppedDuplicateCount: number;
    droppedOrphanCount: number;
    moved: boolean;
};
export declare function repairToolUseResultPairing(messages: AgentMessage[]): ToolUseRepairReport;
