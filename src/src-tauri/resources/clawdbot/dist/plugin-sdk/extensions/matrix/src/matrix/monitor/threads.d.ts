import type { MatrixRawEvent, RoomMessageEventContent } from "./types.js";
export type MatrixThreadReplies = "off" | "inbound" | "always";
export type MatrixThreadRouting = {
    threadId?: string;
};
export declare function resolveMatrixThreadSessionKeys(params: {
    baseSessionKey: string;
    threadId?: string | null;
    parentSessionKey?: string;
    useSuffix?: boolean;
}): {
    sessionKey: string;
    parentSessionKey?: string;
};
export declare function resolveMatrixThreadRouting(params: {
    isDirectMessage: boolean;
    threadReplies: MatrixThreadReplies;
    dmThreadReplies?: MatrixThreadReplies;
    messageId: string;
    threadRootId?: string;
}): MatrixThreadRouting;
export declare function resolveMatrixThreadRootId(params: {
    event: MatrixRawEvent;
    content: RoomMessageEventContent;
}): string | undefined;
export declare function resolveMatrixReplyToEventId(content: RoomMessageEventContent): string | undefined;
