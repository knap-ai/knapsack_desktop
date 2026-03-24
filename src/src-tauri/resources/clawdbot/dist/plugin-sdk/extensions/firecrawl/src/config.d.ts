import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare const DEFAULT_FIRECRAWL_BASE_URL = "https://api.firecrawl.dev";
export declare const DEFAULT_FIRECRAWL_SEARCH_TIMEOUT_SECONDS = 30;
export declare const DEFAULT_FIRECRAWL_SCRAPE_TIMEOUT_SECONDS = 60;
export declare const DEFAULT_FIRECRAWL_MAX_AGE_MS = 172800000;
type FirecrawlSearchConfig = {
    apiKey?: unknown;
    baseUrl?: string;
} | undefined;
type FirecrawlFetchConfig = {
    apiKey?: unknown;
    baseUrl?: string;
    onlyMainContent?: boolean;
    maxAgeMs?: number;
    timeoutSeconds?: number;
} | undefined;
export declare function resolveFirecrawlSearchConfig(cfg?: OpenClawConfig): FirecrawlSearchConfig;
export declare function resolveFirecrawlFetchConfig(cfg?: OpenClawConfig): FirecrawlFetchConfig;
export declare function resolveFirecrawlApiKey(cfg?: OpenClawConfig): string | undefined;
export declare function resolveFirecrawlBaseUrl(cfg?: OpenClawConfig): string;
export declare function resolveFirecrawlOnlyMainContent(cfg?: OpenClawConfig, override?: boolean): boolean;
export declare function resolveFirecrawlMaxAgeMs(cfg?: OpenClawConfig, override?: number): number;
export declare function resolveFirecrawlScrapeTimeoutSeconds(cfg?: OpenClawConfig, override?: number): number;
export declare function resolveFirecrawlSearchTimeoutSeconds(override?: number): number;
export {};
