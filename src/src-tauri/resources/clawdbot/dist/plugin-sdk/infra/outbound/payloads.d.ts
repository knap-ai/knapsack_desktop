import type { ReplyPayload } from "../../auto-reply/types.js";
export type NormalizedOutboundPayload = {
    text: string;
    mediaUrls: string[];
    channelData?: Record<string, unknown>;
};
export type OutboundPayloadJson = {
    text: string;
    mediaUrl: string | null;
    mediaUrls?: string[];
    channelData?: Record<string, unknown>;
};
export declare function normalizeReplyPayloadsForDelivery(payloads: ReplyPayload[]): ReplyPayload[];
export declare function normalizeOutboundPayloads(payloads: ReplyPayload[]): NormalizedOutboundPayload[];
export declare function normalizeOutboundPayloadsForJson(payloads: ReplyPayload[]): OutboundPayloadJson[];
export declare function formatOutboundPayloadLog(payload: NormalizedOutboundPayload): string;
