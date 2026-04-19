import type { MatrixMessageAttachmentSummary, MatrixMessageSummary } from "./actions/types.js";
export declare function isLikelyBareFilename(text: string): boolean;
export declare function resolveMatrixMessageAttachment(params: {
    body?: string;
    filename?: string;
    msgtype?: string;
}): MatrixMessageAttachmentSummary | undefined;
export declare function resolveMatrixMessageBody(params: {
    body?: string;
    filename?: string;
    msgtype?: string;
}): string | undefined;
export declare function formatMatrixAttachmentText(params: {
    attachment?: MatrixMessageAttachmentSummary;
    tooLarge?: boolean;
    unavailable?: boolean;
}): string | undefined;
export declare function formatMatrixMessageText(params: {
    body?: string;
    attachment?: MatrixMessageAttachmentSummary;
    tooLarge?: boolean;
    unavailable?: boolean;
}): string | undefined;
export declare function formatMatrixMessageSummaryText(summary: Pick<MatrixMessageSummary, "body" | "attachment">): string | undefined;
export declare function formatMatrixMediaUnavailableText(params: {
    body?: string;
    filename?: string;
    msgtype?: string;
}): string;
export declare function formatMatrixMediaTooLargeText(params: {
    body?: string;
    filename?: string;
    msgtype?: string;
}): string;
