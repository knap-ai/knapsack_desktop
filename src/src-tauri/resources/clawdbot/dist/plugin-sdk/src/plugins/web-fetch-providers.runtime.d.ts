import type { PluginLoadOptions } from "./loader.js";
import type { PluginWebFetchProviderEntry } from "./types.js";
declare function resetWebFetchProviderSnapshotCacheForTests(): void;
export declare const __testing: {
    readonly resetWebFetchProviderSnapshotCacheForTests: typeof resetWebFetchProviderSnapshotCacheForTests;
};
export declare function resolvePluginWebFetchProviders(params: {
    config?: PluginLoadOptions["config"];
    workspaceDir?: string;
    env?: PluginLoadOptions["env"];
    bundledAllowlistCompat?: boolean;
    onlyPluginIds?: readonly string[];
    activate?: boolean;
    cache?: boolean;
}): PluginWebFetchProviderEntry[];
export declare function resolveRuntimeWebFetchProviders(params: {
    config?: PluginLoadOptions["config"];
    workspaceDir?: string;
    env?: PluginLoadOptions["env"];
    bundledAllowlistCompat?: boolean;
    onlyPluginIds?: readonly string[];
}): PluginWebFetchProviderEntry[];
export {};
