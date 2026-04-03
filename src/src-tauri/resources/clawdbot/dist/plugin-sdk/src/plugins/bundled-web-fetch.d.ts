import type { PluginLoadOptions } from "./loader.js";
import type { PluginWebFetchProviderEntry } from "./types.js";
export declare function resolveBundledWebFetchPluginIds(params: {
    config?: PluginLoadOptions["config"];
    workspaceDir?: string;
    env?: PluginLoadOptions["env"];
}): string[];
export declare function listBundledWebFetchProviders(): PluginWebFetchProviderEntry[];
export declare function resolveBundledWebFetchPluginId(providerId: string | undefined): string | undefined;
