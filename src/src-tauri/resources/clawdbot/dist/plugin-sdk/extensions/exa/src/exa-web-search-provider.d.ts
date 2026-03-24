import { type SearchConfigRecord, type WebSearchProviderPlugin } from "openclaw/plugin-sdk/provider-web-search";
declare const EXA_FRESHNESS_VALUES: readonly ["day", "week", "month", "year"];
type ExaConfig = {
    apiKey?: string;
};
type ExaFreshness = (typeof EXA_FRESHNESS_VALUES)[number];
type ExaTextContentsOption = boolean | {
    maxCharacters?: number;
};
type ExaHighlightsContentsOption = boolean | {
    maxCharacters?: number;
    query?: string;
    numSentences?: number;
    highlightsPerUrl?: number;
};
type ExaSummaryContentsOption = boolean | {
    query?: string;
};
type ExaContentsArgs = {
    highlights?: ExaHighlightsContentsOption;
    text?: ExaTextContentsOption;
    summary?: ExaSummaryContentsOption;
};
type ExaSearchResult = {
    title?: unknown;
    url?: unknown;
    publishedDate?: unknown;
    highlights?: unknown;
    highlightScores?: unknown;
    summary?: unknown;
    text?: unknown;
};
declare function normalizeExaFreshness(value: string | undefined): ExaFreshness | undefined;
declare function resolveExaConfig(searchConfig?: SearchConfigRecord): ExaConfig;
declare function resolveExaApiKey(exa?: ExaConfig): string | undefined;
declare function resolveExaDescription(result: ExaSearchResult): string;
declare function resolveExaSearchCount(value: unknown, fallback: number): number;
declare function parseExaContents(rawContents: unknown): {
    value?: ExaContentsArgs;
} | {
    error: string;
    message: string;
    docs: string;
};
declare function normalizeExaResults(payload: unknown): ExaSearchResult[];
declare function resolveFreshnessStartDate(freshness: ExaFreshness): string;
export declare function createExaWebSearchProvider(): WebSearchProviderPlugin;
export declare const __testing: {
    readonly normalizeExaResults: typeof normalizeExaResults;
    readonly normalizeExaFreshness: typeof normalizeExaFreshness;
    readonly parseExaContents: typeof parseExaContents;
    readonly resolveExaApiKey: typeof resolveExaApiKey;
    readonly resolveExaConfig: typeof resolveExaConfig;
    readonly resolveExaDescription: typeof resolveExaDescription;
    readonly resolveExaSearchCount: typeof resolveExaSearchCount;
    readonly resolveFreshnessStartDate: typeof resolveFreshnessStartDate;
};
export {};
