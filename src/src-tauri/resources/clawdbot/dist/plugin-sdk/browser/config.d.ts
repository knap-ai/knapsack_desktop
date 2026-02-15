import type { BrowserConfig, BrowserProfileConfig, OpenClawConfig } from "../config/config.js";
export type ResolvedBrowserConfig = {
    enabled: boolean;
    evaluateEnabled: boolean;
    controlPort: number;
    cdpProtocol: "http" | "https";
    cdpHost: string;
    cdpIsLoopback: boolean;
    remoteCdpTimeoutMs: number;
    remoteCdpHandshakeTimeoutMs: number;
    color: string;
    executablePath?: string;
    headless: boolean;
    noSandbox: boolean;
    attachOnly: boolean;
    defaultProfile: string;
    profiles: Record<string, BrowserProfileConfig>;
};
export type ResolvedBrowserProfile = {
    name: string;
    cdpPort: number;
    cdpUrl: string;
    cdpHost: string;
    cdpIsLoopback: boolean;
    color: string;
    driver: "openclaw" | "extension";
};
export declare function parseHttpUrl(raw: string, label: string): {
    parsed: URL;
    port: number;
    normalized: string;
};
export declare function resolveBrowserConfig(cfg: BrowserConfig | undefined, rootConfig?: OpenClawConfig): ResolvedBrowserConfig;
/**
 * Resolve a profile by name from the config.
 * Returns null if the profile doesn't exist.
 */
export declare function resolveProfile(resolved: ResolvedBrowserConfig, profileName: string): ResolvedBrowserProfile | null;
export declare function shouldStartLocalBrowserServer(_resolved: ResolvedBrowserConfig): boolean;
