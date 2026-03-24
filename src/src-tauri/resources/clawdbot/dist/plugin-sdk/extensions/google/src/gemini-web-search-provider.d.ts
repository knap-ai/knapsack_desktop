import { type WebSearchProviderPlugin } from "openclaw/plugin-sdk/provider-web-search";
type GeminiConfig = {
    apiKey?: string;
    model?: string;
};
declare function resolveGeminiApiKey(gemini?: GeminiConfig): string | undefined;
declare function resolveGeminiModel(gemini?: GeminiConfig): string;
export declare function createGeminiWebSearchProvider(): WebSearchProviderPlugin;
export declare const __testing: {
    readonly resolveGeminiApiKey: typeof resolveGeminiApiKey;
    readonly resolveGeminiModel: typeof resolveGeminiModel;
};
export {};
