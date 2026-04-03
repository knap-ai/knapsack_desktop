import type { MatrixClient } from "./sdk.js";
export type MatrixMentions = {
    room?: boolean;
    user_ids?: string[];
};
export declare function markdownToMatrixHtml(markdown: string): string;
export declare function resolveMatrixMentionsInMarkdown(params: {
    markdown: string;
    client: MatrixClient;
}): Promise<MatrixMentions>;
export declare function renderMarkdownToMatrixHtmlWithMentions(params: {
    markdown: string;
    client: MatrixClient;
}): Promise<{
    html?: string;
    mentions: MatrixMentions;
}>;
