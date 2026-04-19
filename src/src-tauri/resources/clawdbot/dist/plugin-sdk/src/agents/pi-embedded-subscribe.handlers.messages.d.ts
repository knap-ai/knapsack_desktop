import type { AgentEvent, AgentMessage } from "@mariozechner/pi-agent-core";
import { type AssistantPhase } from "../shared/chat-message-content.js";
import type { BlockReplyPayload } from "./pi-embedded-payloads.js";
import type { EmbeddedPiSubscribeContext, EmbeddedPiSubscribeState } from "./pi-embedded-subscribe.handlers.types.js";
export declare function resolveSilentReplyFallbackText(params: {
    text: unknown;
    messagingToolSentTexts: string[];
}): string;
export declare function consumePendingToolMediaIntoReply(state: Pick<EmbeddedPiSubscribeState, "pendingToolMediaUrls" | "pendingToolAudioAsVoice">, payload: BlockReplyPayload): BlockReplyPayload;
export declare function consumePendingToolMediaReply(state: Pick<EmbeddedPiSubscribeState, "pendingToolMediaUrls" | "pendingToolAudioAsVoice">): BlockReplyPayload | null;
export declare function hasAssistantVisibleReply(params: {
    text?: string;
    mediaUrls?: string[];
    mediaUrl?: string;
    audioAsVoice?: boolean;
}): boolean;
export declare function buildAssistantStreamData(params: {
    text?: string;
    delta?: string;
    replace?: boolean;
    mediaUrls?: string[];
    mediaUrl?: string;
    phase?: AssistantPhase;
}): {
    text: string;
    delta: string;
    replace?: true;
    mediaUrls?: string[];
    phase?: AssistantPhase;
};
export declare function handleMessageStart(ctx: EmbeddedPiSubscribeContext, evt: AgentEvent & {
    message: AgentMessage;
}): void;
export declare function handleMessageUpdate(ctx: EmbeddedPiSubscribeContext, evt: AgentEvent & {
    message: AgentMessage;
    assistantMessageEvent?: unknown;
}): void;
export declare function handleMessageEnd(ctx: EmbeddedPiSubscribeContext, evt: AgentEvent & {
    message: AgentMessage;
}): void | Promise<void>;
