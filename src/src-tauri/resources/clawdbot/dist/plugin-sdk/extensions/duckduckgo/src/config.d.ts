import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare const DEFAULT_DDG_SAFE_SEARCH = "moderate";
export type DdgSafeSearch = "strict" | "moderate" | "off";
type DdgPluginConfig = {
    webSearch?: {
        region?: string;
        safeSearch?: string;
    };
};
export declare function resolveDdgWebSearchConfig(config?: OpenClawConfig): DdgPluginConfig["webSearch"] | undefined;
export declare function resolveDdgRegion(config?: OpenClawConfig): string | undefined;
export declare function resolveDdgSafeSearch(config?: OpenClawConfig): DdgSafeSearch;
export {};
