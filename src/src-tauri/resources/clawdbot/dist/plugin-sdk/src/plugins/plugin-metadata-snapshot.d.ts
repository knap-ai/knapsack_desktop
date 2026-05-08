import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { InstalledPluginIndex } from "./installed-plugin-index.js";
import type { PluginManifestRecord } from "./manifest-registry.js";
import type { LoadPluginMetadataSnapshotParams, PluginMetadataSnapshot, PluginMetadataSnapshotOwnerMaps } from "./plugin-metadata-snapshot.types.js";
export type { LoadPluginMetadataSnapshotParams, PluginMetadataSnapshot, PluginMetadataSnapshotMetrics, PluginMetadataSnapshotOwnerMaps, PluginMetadataSnapshotRegistryDiagnostic, } from "./plugin-metadata-snapshot.types.js";
export declare function isPluginMetadataSnapshotCompatible(params: {
    snapshot: Pick<PluginMetadataSnapshot, "index" | "policyHash" | "workspaceDir">;
    config: OpenClawConfig;
    workspaceDir?: string;
    index?: InstalledPluginIndex;
}): boolean;
export declare function buildPluginMetadataOwnerMaps(plugins: readonly PluginManifestRecord[]): PluginMetadataSnapshotOwnerMaps;
export declare function loadPluginMetadataSnapshot(params: LoadPluginMetadataSnapshotParams): PluginMetadataSnapshot;
