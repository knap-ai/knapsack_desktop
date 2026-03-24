import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { type DdgSafeSearch } from "./config.js";
type DuckDuckGoResult = {
    title: string;
    url: string;
    snippet: string;
};
declare function decodeHtmlEntities(text: string): string;
declare function decodeDuckDuckGoUrl(rawUrl: string): string;
declare function isBotChallenge(html: string): boolean;
declare function parseDuckDuckGoHtml(html: string): DuckDuckGoResult[];
export declare function runDuckDuckGoSearch(params: {
    config?: OpenClawConfig;
    query: string;
    count?: number;
    region?: string;
    safeSearch?: DdgSafeSearch;
    timeoutSeconds?: number;
    cacheTtlMinutes?: number;
}): Promise<Record<string, unknown>>;
export declare const __testing: {
    decodeDuckDuckGoUrl: typeof decodeDuckDuckGoUrl;
    decodeHtmlEntities: typeof decodeHtmlEntities;
    isBotChallenge: typeof isBotChallenge;
    parseDuckDuckGoHtml: typeof parseDuckDuckGoHtml;
};
export {};
