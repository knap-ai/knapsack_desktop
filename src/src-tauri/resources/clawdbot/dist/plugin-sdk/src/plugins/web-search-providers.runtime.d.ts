import type { PluginLoadOptions } from "./loader.js";
import type { PluginWebSearchProviderEntry } from "./types.js";
export declare function resolvePluginWebSearchProviders(params: {
    config?: PluginLoadOptions["config"];
    workspaceDir?: string;
    env?: PluginLoadOptions["env"];
    bundledAllowlistCompat?: boolean;
    activate?: boolean;
    cache?: boolean;
}): PluginWebSearchProviderEntry[];
export declare function resolveRuntimeWebSearchProviders(params: {
    config?: PluginLoadOptions["config"];
    workspaceDir?: string;
    env?: PluginLoadOptions["env"];
    bundledAllowlistCompat?: boolean;
}): PluginWebSearchProviderEntry[];
