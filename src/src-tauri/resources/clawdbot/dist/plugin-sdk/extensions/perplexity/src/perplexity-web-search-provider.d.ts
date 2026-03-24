import { isoToPerplexityDate, normalizeToIsoDate, type WebSearchProviderPlugin } from "openclaw/plugin-sdk/provider-web-search";
type PerplexityConfig = {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
};
type PerplexityTransport = "search_api" | "chat_completions";
type PerplexityBaseUrlHint = "direct" | "openrouter";
declare function inferPerplexityBaseUrlFromApiKey(apiKey?: string): PerplexityBaseUrlHint | undefined;
declare function resolvePerplexityApiKey(perplexity?: PerplexityConfig): {
    apiKey?: string;
    source: "config" | "perplexity_env" | "openrouter_env" | "none";
};
declare function resolvePerplexityBaseUrl(perplexity?: PerplexityConfig, authSource?: "config" | "perplexity_env" | "openrouter_env" | "none", configuredKey?: string): string;
declare function resolvePerplexityModel(perplexity?: PerplexityConfig): string;
declare function isDirectPerplexityBaseUrl(baseUrl: string): boolean;
declare function resolvePerplexityRequestModel(baseUrl: string, model: string): string;
declare function resolvePerplexityTransport(perplexity?: PerplexityConfig): {
    apiKey?: string;
    source: "config" | "perplexity_env" | "openrouter_env" | "none";
    baseUrl: string;
    model: string;
    transport: PerplexityTransport;
};
export declare function createPerplexityWebSearchProvider(): WebSearchProviderPlugin;
export declare const __testing: {
    readonly inferPerplexityBaseUrlFromApiKey: typeof inferPerplexityBaseUrlFromApiKey;
    readonly resolvePerplexityBaseUrl: typeof resolvePerplexityBaseUrl;
    readonly resolvePerplexityModel: typeof resolvePerplexityModel;
    readonly resolvePerplexityTransport: typeof resolvePerplexityTransport;
    readonly isDirectPerplexityBaseUrl: typeof isDirectPerplexityBaseUrl;
    readonly resolvePerplexityRequestModel: typeof resolvePerplexityRequestModel;
    readonly resolvePerplexityApiKey: typeof resolvePerplexityApiKey;
    readonly normalizeToIsoDate: typeof normalizeToIsoDate;
    readonly isoToPerplexityDate: typeof isoToPerplexityDate;
};
export {};
