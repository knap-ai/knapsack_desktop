import { asOptionalRecord, hasNonEmptyString as sharedHasNonEmptyString, isRecord as sharedIsRecord, normalizeOptionalString, readStringValue } from "openclaw/plugin-sdk/text-runtime";
import { type CommentFileType } from "./comment-target.js";
export declare function encodeQuery(params: Record<string, string | undefined>): string;
export declare const readString: typeof readStringValue;
export declare const normalizeString: typeof normalizeOptionalString;
export declare const isRecord: typeof sharedIsRecord;
export declare const asRecord: typeof asOptionalRecord;
export declare const hasNonEmptyString: typeof sharedHasNonEmptyString;
export type ParsedCommentDocumentRef = {
    fileType?: CommentFileType;
    fileToken?: string;
};
export type ParsedCommentMention = {
    userId: string;
    displayText: string;
    isBotMention: boolean;
};
export type ParsedCommentLinkedDocumentKind = CommentFileType | "wiki" | "mindnote" | "bitable" | "base" | "unknown";
export type ParsedCommentResolvedDocumentType = Exclude<ParsedCommentLinkedDocumentKind, "wiki" | "unknown">;
export type ParsedCommentLinkedDocument = {
    rawUrl: string;
    urlKind: ParsedCommentLinkedDocumentKind;
    wikiNodeToken?: string;
    resolvedObjType?: ParsedCommentResolvedDocumentType;
    resolvedObjToken?: string;
    isCurrentDocument?: boolean;
};
export type ParsedCommentContent = {
    plainText?: string;
    semanticText?: string;
    mentions: ParsedCommentMention[];
    linkedDocuments: ParsedCommentLinkedDocument[];
    botMentioned: boolean;
};
export declare function resolveCommentLinkedDocumentFromUrl(params: {
    rawUrl: string;
    currentDocument?: ParsedCommentDocumentRef;
}): ParsedCommentLinkedDocument;
export declare function parseCommentContentElements(params: {
    elements?: unknown[];
    botOpenIds?: Iterable<string | undefined>;
    currentDocument?: ParsedCommentDocumentRef;
}): ParsedCommentContent;
export declare function extractCommentElementText(element: unknown): string | undefined;
export declare function extractReplyText(reply: {
    content?: {
        elements?: unknown[];
    };
} | undefined): string | undefined;
