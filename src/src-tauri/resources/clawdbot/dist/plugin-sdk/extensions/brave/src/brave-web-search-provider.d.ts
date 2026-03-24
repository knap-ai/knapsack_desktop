import { normalizeFreshness, type WebSearchProviderPlugin } from "openclaw/plugin-sdk/provider-web-search";
type BraveConfig = {
    mode?: string;
};
type BraveLlmContextResult = {
    url: string;
    title: string;
    snippets: string[];
};
type BraveLlmContextResponse = {
    grounding: {
        generic?: BraveLlmContextResult[];
    };
    sources?: {
        url?: string;
        hostname?: string;
        date?: string;
    }[];
};
declare function resolveBraveMode(brave?: BraveConfig): "web" | "llm-context";
declare function normalizeBraveLanguageParams(params: {
    search_lang?: string;
    ui_lang?: string;
}): {
    search_lang?: string;
    ui_lang?: string;
    invalidField?: "search_lang" | "ui_lang";
};
declare function mapBraveLlmContextResults(data: BraveLlmContextResponse): {
    url: string;
    title: string;
    snippets: string[];
    siteName?: string;
}[];
export declare function createBraveWebSearchProvider(): WebSearchProviderPlugin;
export declare const __testing: {
    readonly normalizeFreshness: typeof normalizeFreshness;
    readonly normalizeBraveLanguageParams: typeof normalizeBraveLanguageParams;
    readonly resolveBraveMode: typeof resolveBraveMode;
    readonly mapBraveLlmContextResults: typeof mapBraveLlmContextResults;
};
export {};
