import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type { SessionManager } from "@mariozechner/pi-coding-agent";
export declare function installSessionToolResultGuard(sessionManager: SessionManager, opts?: {
    /**
     * Optional transform applied to any message before persistence.
     */
    transformMessageForPersistence?: (message: AgentMessage) => AgentMessage;
    /**
     * Optional, synchronous transform applied to toolResult messages *before* they are
     * persisted to the session transcript.
     */
    transformToolResultForPersistence?: (message: AgentMessage, meta: {
        toolCallId?: string;
        toolName?: string;
        isSynthetic?: boolean;
    }) => AgentMessage;
    /**
     * Whether to synthesize missing tool results to satisfy strict providers.
     * Defaults to true.
     */
    allowSyntheticToolResults?: boolean;
}): {
    flushPendingToolResults: () => void;
    getPendingIds: () => string[];
};
