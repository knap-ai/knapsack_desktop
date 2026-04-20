import { resolveSendableOutboundReplyParts } from "openclaw/plugin-sdk/reply-payload";
import type { ReplyPayload } from "../../auto-reply/types.js";
import { type InteractiveReply } from "../../interactive/payload.js";
export type NormalizedOutboundPayload = {
    text: string;
    mediaUrls: string[];
    audioAsVoice?: boolean;
    interactive?: InteractiveReply;
    channelData?: Record<string, unknown>;
};
export type OutboundPayloadJson = {
    text: string;
    mediaUrl: string | null;
    mediaUrls?: string[];
    audioAsVoice?: boolean;
    interactive?: InteractiveReply;
    channelData?: Record<string, unknown>;
};
export type OutboundPayloadPlan = {
    payload: ReplyPayload;
    parts: ReturnType<typeof resolveSendableOutboundReplyParts>;
    hasInteractive: boolean;
    hasChannelData: boolean;
};
export type OutboundPayloadMirror = {
    text: string;
    mediaUrls: string[];
};
export declare function createOutboundPayloadPlan(payloads: readonly ReplyPayload[]): OutboundPayloadPlan[];
export declare function projectOutboundPayloadPlanForDelivery(plan: readonly OutboundPayloadPlan[]): ReplyPayload[];
export declare function projectOutboundPayloadPlanForOutbound(plan: readonly OutboundPayloadPlan[]): NormalizedOutboundPayload[];
export declare function projectOutboundPayloadPlanForJson(plan: readonly OutboundPayloadPlan[]): OutboundPayloadJson[];
export declare function projectOutboundPayloadPlanForMirror(plan: readonly OutboundPayloadPlan[]): OutboundPayloadMirror;
export declare function summarizeOutboundPayloadForTransport(payload: ReplyPayload): NormalizedOutboundPayload;
export declare function normalizeReplyPayloadsForDelivery(payloads: readonly ReplyPayload[]): ReplyPayload[];
export declare function normalizeOutboundPayloads(payloads: readonly ReplyPayload[]): NormalizedOutboundPayload[];
export declare function normalizeOutboundPayloadsForJson(payloads: readonly ReplyPayload[]): OutboundPayloadJson[];
export declare function formatOutboundPayloadLog(payload: Pick<NormalizedOutboundPayload, "text" | "channelData"> & {
    mediaUrls: readonly string[];
}): string;
