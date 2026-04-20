export declare const FEISHU_COMMENT_FILE_TYPES: readonly ["doc", "docx", "file", "sheet", "slides"];
export type CommentFileType = (typeof FEISHU_COMMENT_FILE_TYPES)[number];
export declare function normalizeCommentFileType(value: unknown): CommentFileType | undefined;
export type FeishuCommentTarget = {
    fileType: CommentFileType;
    fileToken: string;
    commentId: string;
};
export declare function buildFeishuCommentTarget(params: FeishuCommentTarget): string;
export declare function parseFeishuCommentTarget(raw: string | undefined | null): FeishuCommentTarget | null;
