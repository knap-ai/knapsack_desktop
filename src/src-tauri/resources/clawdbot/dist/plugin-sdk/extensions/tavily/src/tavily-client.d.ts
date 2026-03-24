import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export type TavilySearchParams = {
    cfg?: OpenClawConfig;
    query: string;
    searchDepth?: string;
    topic?: string;
    maxResults?: number;
    includeAnswer?: boolean;
    timeRange?: string;
    includeDomains?: string[];
    excludeDomains?: string[];
    timeoutSeconds?: number;
};
export type TavilyExtractParams = {
    cfg?: OpenClawConfig;
    urls: string[];
    query?: string;
    extractDepth?: string;
    chunksPerSource?: number;
    includeImages?: boolean;
    timeoutSeconds?: number;
};
declare function resolveEndpoint(baseUrl: string, pathname: string): string;
export declare function runTavilySearch(params: TavilySearchParams): Promise<Record<string, unknown>>;
export declare function runTavilyExtract(params: TavilyExtractParams): Promise<Record<string, unknown>>;
export declare const __testing: {
    resolveEndpoint: typeof resolveEndpoint;
};
export {};
