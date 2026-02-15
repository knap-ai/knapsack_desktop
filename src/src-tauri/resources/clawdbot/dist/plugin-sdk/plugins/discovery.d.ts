import type { PluginDiagnostic, PluginOrigin } from "./types.js";
import { type OpenClawPackageManifest } from "./manifest.js";
export type PluginCandidate = {
    idHint: string;
    source: string;
    rootDir: string;
    origin: PluginOrigin;
    workspaceDir?: string;
    packageName?: string;
    packageVersion?: string;
    packageDescription?: string;
    packageDir?: string;
    packageManifest?: OpenClawPackageManifest;
};
export type PluginDiscoveryResult = {
    candidates: PluginCandidate[];
    diagnostics: PluginDiagnostic[];
};
export declare function discoverOpenClawPlugins(params: {
    workspaceDir?: string;
    extraPaths?: string[];
}): PluginDiscoveryResult;
