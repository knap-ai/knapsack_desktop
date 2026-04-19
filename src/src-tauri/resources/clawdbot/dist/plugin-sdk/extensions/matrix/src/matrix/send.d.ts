import type { MarkdownTableMode } from "openclaw/plugin-sdk/markdown-table-runtime";
import type { PollInput } from "../runtime-api.js";
import type { CoreConfig } from "../types.js";
import type { MatrixClient } from "./sdk.js";
import { type MatrixExtraContentFields, type MatrixSendOpts, type MatrixSendResult, type MatrixTextMsgType } from "./send/types.js";
export type { MatrixSendOpts, MatrixSendResult } from "./send/types.js";
export { resolveMatrixRoomId } from "./send/targets.js";
export type MatrixPreparedSingleText = {
    trimmedText: string;
    convertedText: string;
    singleEventLimit: number;
    fitsInSingleEvent: boolean;
};
export type MatrixPreparedChunkedText = MatrixPreparedSingleText & {
    chunks: string[];
};
type MatrixClientResolveOpts = {
    client?: MatrixClient;
    cfg?: CoreConfig;
    timeoutMs?: number;
    accountId?: string | null;
};
export declare function prepareMatrixSingleText(text: string, opts?: {
    cfg?: CoreConfig;
    accountId?: string;
    tableMode?: MarkdownTableMode;
}): MatrixPreparedSingleText;
export declare function chunkMatrixText(text: string, opts?: {
    cfg?: CoreConfig;
    accountId?: string;
    tableMode?: MarkdownTableMode;
}): MatrixPreparedChunkedText;
export declare function sendMessageMatrix(to: string, message: string | undefined, opts?: MatrixSendOpts): Promise<MatrixSendResult>;
export declare function sendPollMatrix(to: string, poll: PollInput, opts?: MatrixSendOpts): Promise<{
    eventId: string;
    roomId: string;
}>;
export declare function sendTypingMatrix(roomId: string, typing: boolean, timeoutMs?: number, client?: MatrixClient): Promise<void>;
export declare function sendReadReceiptMatrix(roomId: string, eventId: string, client?: MatrixClient): Promise<void>;
export declare function sendSingleTextMessageMatrix(roomId: string, text: string, opts?: {
    client?: MatrixClient;
    cfg?: CoreConfig;
    replyToId?: string;
    threadId?: string;
    accountId?: string;
    msgtype?: MatrixTextMsgType;
    includeMentions?: boolean;
    extraContent?: MatrixExtraContentFields;
    /** When true, marks the message as a live/streaming update (MSC4357). */
    live?: boolean;
}): Promise<MatrixSendResult>;
export declare function editMessageMatrix(roomId: string, originalEventId: string, newText: string, opts?: {
    client?: MatrixClient;
    cfg?: CoreConfig;
    threadId?: string;
    accountId?: string;
    timeoutMs?: number;
    msgtype?: MatrixTextMsgType;
    includeMentions?: boolean;
    extraContent?: MatrixExtraContentFields;
    /** When true, marks the edit as a live/streaming update (MSC4357). */
    live?: boolean;
}): Promise<string>;
export declare function reactMatrixMessage(roomId: string, messageId: string, emoji: string, opts?: MatrixClient | MatrixClientResolveOpts): Promise<void>;
