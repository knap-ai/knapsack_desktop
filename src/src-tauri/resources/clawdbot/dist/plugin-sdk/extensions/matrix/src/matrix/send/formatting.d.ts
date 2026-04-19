import { type MatrixMentions } from "../format.js";
import type { MatrixClient } from "../sdk.js";
import { type MatrixFormattedContent, type MatrixMediaMsgType, type MatrixRelation, type MatrixReplyRelation, type MatrixTextContent, type MatrixTextMsgType, type MatrixThreadRelation } from "./types.js";
export declare function buildTextContent(body: string, relation?: MatrixRelation, opts?: {
    msgtype?: MatrixTextMsgType;
}): MatrixTextContent;
export declare function enrichMatrixFormattedContent(params: {
    client: MatrixClient;
    content: MatrixFormattedContent;
    markdown?: string | null;
    includeMentions?: boolean;
}): Promise<void>;
export declare function resolveMatrixMentionsForBody(params: {
    client: MatrixClient;
    body: string;
}): Promise<MatrixMentions>;
export declare function extractMatrixMentions(content: Record<string, unknown> | undefined): MatrixMentions;
export declare function diffMatrixMentions(current: MatrixMentions, previous: MatrixMentions): MatrixMentions;
export declare function buildReplyRelation(replyToId?: string): MatrixReplyRelation | undefined;
export declare function buildThreadRelation(threadId: string, replyToId?: string): MatrixThreadRelation;
export declare function resolveMatrixMsgType(contentType?: string, _fileName?: string): MatrixMediaMsgType;
export declare function resolveMatrixVoiceDecision(opts: {
    wantsVoice: boolean;
    contentType?: string;
    fileName?: string;
}): {
    useVoice: boolean;
};
