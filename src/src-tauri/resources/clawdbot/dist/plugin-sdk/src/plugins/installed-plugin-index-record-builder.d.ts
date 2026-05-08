import type { OpenClawConfig } from "../config/types.js";
import type { PluginCandidate } from "./discovery.js";
import type { InstalledPluginIndexRecord, InstalledPluginInstallRecordInfo } from "./installed-plugin-index-types.js";
import type { PluginManifestRegistry } from "./manifest-registry.js";
import type { PluginDiagnostic } from "./manifest-types.js";
export declare function buildInstalledPluginIndexRecords(params: {
    candidates: readonly PluginCandidate[];
    registry: PluginManifestRegistry;
    config?: OpenClawConfig;
    diagnostics: PluginDiagnostic[];
    installRecords: Record<string, InstalledPluginInstallRecordInfo>;
}): InstalledPluginIndexRecord[];
