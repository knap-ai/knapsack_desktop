import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare const DEFAULT_TAVILY_BASE_URL = "https://api.tavily.com";
export declare const DEFAULT_TAVILY_SEARCH_TIMEOUT_SECONDS = 30;
export declare const DEFAULT_TAVILY_EXTRACT_TIMEOUT_SECONDS = 60;
type TavilySearchConfig = {
    apiKey?: unknown;
    baseUrl?: string;
} | undefined;
export declare function resolveTavilySearchConfig(cfg?: OpenClawConfig): TavilySearchConfig;
export declare function resolveTavilyApiKey(cfg?: OpenClawConfig): string | undefined;
export declare function resolveTavilyBaseUrl(cfg?: OpenClawConfig): string;
export declare function resolveTavilySearchTimeoutSeconds(override?: number): number;
export declare function resolveTavilyExtractTimeoutSeconds(override?: number): number;
export {};
