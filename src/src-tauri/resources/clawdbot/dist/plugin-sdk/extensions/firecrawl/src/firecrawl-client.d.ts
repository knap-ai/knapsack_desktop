import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
type FirecrawlSearchItem = {
    title: string;
    url: string;
    description?: string;
    content?: string;
    published?: string;
    siteName?: string;
};
export type FirecrawlSearchParams = {
    cfg?: OpenClawConfig;
    query: string;
    count?: number;
    timeoutSeconds?: number;
    sources?: string[];
    categories?: string[];
    scrapeResults?: boolean;
};
export type FirecrawlScrapeParams = {
    cfg?: OpenClawConfig;
    url: string;
    extractMode: "markdown" | "text";
    maxChars?: number;
    onlyMainContent?: boolean;
    maxAgeMs?: number;
    proxy?: "auto" | "basic" | "stealth";
    storeInCache?: boolean;
    timeoutSeconds?: number;
};
declare function resolveSearchItems(payload: Record<string, unknown>): FirecrawlSearchItem[];
export declare function runFirecrawlSearch(params: FirecrawlSearchParams): Promise<Record<string, unknown>>;
export declare function parseFirecrawlScrapePayload(params: {
    payload: Record<string, unknown>;
    url: string;
    extractMode: "markdown" | "text";
    maxChars: number;
}): Record<string, unknown>;
export declare function runFirecrawlScrape(params: FirecrawlScrapeParams): Promise<Record<string, unknown>>;
export declare const __testing: {
    parseFirecrawlScrapePayload: typeof parseFirecrawlScrapePayload;
    resolveSearchItems: typeof resolveSearchItems;
};
export {};
