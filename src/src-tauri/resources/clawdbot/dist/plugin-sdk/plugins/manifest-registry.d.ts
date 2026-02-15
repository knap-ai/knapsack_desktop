import type { OpenClawConfig } from "../config/config.js";
import type { PluginConfigUiHint, PluginDiagnostic, PluginKind, PluginOrigin } from "./types.js";
import { type PluginCandidate } from "./discovery.js";
export type PluginManifestRecord = {
    id: string;
    name?: string;
    description?: string;
    version?: string;
    kind?: PluginKind;
    channels: string[];
    providers: string[];
    skills: string[];
    origin: PluginOrigin;
    workspaceDir?: string;
    rootDir: string;
    source: string;
    manifestPath: string;
    schemaCacheKey?: string;
    configSchema?: Record<string, unknown>;
    configUiHints?: Record<string, PluginConfigUiHint>;
};
export type PluginManifestRegistry = {
    plugins: PluginManifestRecord[];
    diagnostics: PluginDiagnostic[];
};
export declare function loadPluginManifestRegistry(params: {
    config?: OpenClawConfig;
    workspaceDir?: string;
    cache?: boolean;
    env?: NodeJS.ProcessEnv;
    candidates?: PluginCandidate[];
    diagnostics?: PluginDiagnostic[];
}): PluginManifestRegistry;
