export declare const XAI_WEB_SEARCH_ENDPOINT = "https://api.x.ai/v1/responses";
export declare const XAI_DEFAULT_WEB_SEARCH_MODEL = "grok-4-1-fast";
export type XaiWebSearchResponse = {
    output?: Array<{
        type?: string;
        text?: string;
        content?: Array<{
            type?: string;
            text?: string;
            annotations?: Array<{
                type?: string;
                url?: string;
            }>;
        }>;
        annotations?: Array<{
            type?: string;
            url?: string;
        }>;
    }>;
    output_text?: string;
    citations?: string[];
    inline_citations?: Array<{
        start_index: number;
        end_index: number;
        url: string;
    }>;
};
type XaiWebSearchConfig = Record<string, unknown> & {
    model?: unknown;
    inlineCitations?: unknown;
};
export type XaiWebSearchResult = {
    content: string;
    citations: string[];
    inlineCitations?: XaiWebSearchResponse["inline_citations"];
};
export declare function buildXaiWebSearchPayload(params: {
    query: string;
    provider: string;
    model: string;
    tookMs: number;
    content: string;
    citations: string[];
    inlineCitations?: XaiWebSearchResponse["inline_citations"];
}): Record<string, unknown>;
export declare function resolveXaiSearchConfig(searchConfig?: Record<string, unknown>): XaiWebSearchConfig;
export declare function resolveXaiWebSearchModel(searchConfig?: Record<string, unknown>): string;
export declare function resolveXaiInlineCitations(searchConfig?: Record<string, unknown>): boolean;
export declare function extractXaiWebSearchContent(data: XaiWebSearchResponse): {
    text: string | undefined;
    annotationCitations: string[];
};
export declare function requestXaiWebSearch(params: {
    query: string;
    model: string;
    apiKey: string;
    timeoutSeconds: number;
    inlineCitations: boolean;
}): Promise<XaiWebSearchResult>;
export declare const __testing: {
    readonly buildXaiWebSearchPayload: typeof buildXaiWebSearchPayload;
    readonly extractXaiWebSearchContent: typeof extractXaiWebSearchContent;
    readonly resolveXaiInlineCitations: typeof resolveXaiInlineCitations;
    readonly resolveXaiSearchConfig: typeof resolveXaiSearchConfig;
    readonly resolveXaiWebSearchModel: typeof resolveXaiWebSearchModel;
    readonly requestXaiWebSearch: typeof requestXaiWebSearch;
    readonly XAI_DEFAULT_WEB_SEARCH_MODEL: "grok-4-1-fast";
};
export {};
