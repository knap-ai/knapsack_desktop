import type { AgentMessage, StreamFn } from "@mariozechner/pi-agent-core";
type AssistantMessage = Extract<AgentMessage, {
    role: "assistant";
}>;
type RecoveryAssessment = "valid" | "incomplete-thinking" | "incomplete-text";
type RecoverySessionMeta = {
    id: string;
    recoveredAnthropicThinking?: boolean;
};
export declare function isAssistantMessageWithContent(message: AgentMessage): message is AssistantMessage;
/**
 * Strip `type: "thinking"` and `type: "redacted_thinking"` content blocks from
 * all assistant messages except the latest one.
 *
 * Thinking blocks in the latest assistant turn are preserved verbatim so
 * providers that require replay signatures can continue the conversation.
 *
 * If a non-latest assistant message becomes empty after stripping, it is
 * replaced with a synthetic `{ type: "text", text: "" }` block to preserve
 * turn structure (some providers require strict user/assistant alternation).
 *
 * Returns the original array reference when nothing was changed (callers can
 * use reference equality to skip downstream work).
 */
export declare function dropThinkingBlocks(messages: AgentMessage[]): AgentMessage[];
export declare function assessLastAssistantMessage(message: AgentMessage): RecoveryAssessment;
export declare function sanitizeThinkingForRecovery(messages: AgentMessage[]): {
    messages: AgentMessage[];
    prefill: boolean;
};
export declare function wrapAnthropicStreamWithRecovery(innerStreamFn: StreamFn, sessionMeta: RecoverySessionMeta): StreamFn;
export {};
