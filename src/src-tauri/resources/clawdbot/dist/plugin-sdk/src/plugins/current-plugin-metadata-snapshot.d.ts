import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { PluginMetadataSnapshot } from "./plugin-metadata-snapshot.types.js";
export declare function resolvePluginMetadataSnapshotConfigFingerprint(config: OpenClawConfig | undefined): string;
export declare function setCurrentPluginMetadataSnapshot(snapshot: PluginMetadataSnapshot | undefined, options?: {
    config?: OpenClawConfig;
}): void;
export declare function clearCurrentPluginMetadataSnapshot(): void;
export declare function getCurrentPluginMetadataSnapshot(params?: {
    config?: OpenClawConfig;
    workspaceDir?: string;
}): PluginMetadataSnapshot | undefined;
