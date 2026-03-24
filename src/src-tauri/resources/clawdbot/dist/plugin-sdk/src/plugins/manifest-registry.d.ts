import type { OpenClawConfig } from "../config/config.js";
import { type PluginCandidate } from "./discovery.js";
import { type PluginManifest } from "./manifest.js";
import type { PluginBundleFormat, PluginConfigUiHint, PluginDiagnostic, PluginFormat, PluginKind, PluginOrigin } from "./types.js";
export type PluginManifestRecord = {
    id: string;
    name?: string;
    description?: string;
    version?: string;
    enabledByDefault?: boolean;
    format?: PluginFormat;
    bundleFormat?: PluginBundleFormat;
    bundleCapabilities?: string[];
    kind?: PluginKind;
    channels: string[];
    providers: string[];
    providerAuthEnvVars?: Record<string, string[]>;
    providerAuthChoices?: PluginManifest["providerAuthChoices"];
    skills: string[];
    settingsFiles?: string[];
    hooks: string[];
    origin: PluginOrigin;
    workspaceDir?: string;
    rootDir: string;
    source: string;
    setupSource?: string;
    startupDeferConfiguredChannelFullLoadUntilAfterListen?: boolean;
    manifestPath: string;
    schemaCacheKey?: string;
    configSchema?: Record<string, unknown>;
    configUiHints?: Record<string, PluginConfigUiHint>;
    channelCatalogMeta?: {
        id: string;
        preferOver?: string[];
    };
};
export type PluginManifestRegistry = {
    plugins: PluginManifestRecord[];
    diagnostics: PluginDiagnostic[];
};
export declare function clearPluginManifestRegistryCache(): void;
export declare function loadPluginManifestRegistry(params?: {
    config?: OpenClawConfig;
    workspaceDir?: string;
    cache?: boolean;
    env?: NodeJS.ProcessEnv;
    candidates?: PluginCandidate[];
    diagnostics?: PluginDiagnostic[];
}): PluginManifestRegistry;
