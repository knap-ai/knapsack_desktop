import type { OpenClawConfig } from "../config/config.js";
import type { GatewayRequestHandler } from "../gateway/server-methods/types.js";
import { type PluginRegistry } from "./registry.js";
import type { CreatePluginRuntimeOptions } from "./runtime/index.js";
import { buildPluginLoaderAliasMap, buildPluginLoaderJitiOptions, listPluginSdkAliasCandidates, listPluginSdkExportedSubpaths, resolveExtensionApiAlias, resolvePluginSdkAliasCandidateOrder, resolvePluginSdkAliasFile, resolvePluginRuntimeModulePath, resolvePluginSdkScopedAliasMap, shouldPreferNativeJiti } from "./sdk-alias.js";
import type { PluginLogger } from "./types.js";
export type PluginLoadResult = PluginRegistry;
export type PluginLoadOptions = {
    config?: OpenClawConfig;
    workspaceDir?: string;
    env?: NodeJS.ProcessEnv;
    logger?: PluginLogger;
    coreGatewayHandlers?: Record<string, GatewayRequestHandler>;
    runtimeOptions?: CreatePluginRuntimeOptions;
    cache?: boolean;
    mode?: "full" | "validate";
    onlyPluginIds?: string[];
    includeSetupOnlyChannelPlugins?: boolean;
    /**
     * Prefer `setupEntry` for configured channel plugins that explicitly opt in
     * via package metadata because their setup entry covers the pre-listen startup surface.
     */
    preferSetupRuntimeForChannelPlugins?: boolean;
    activate?: boolean;
    throwOnLoadError?: boolean;
};
export declare class PluginLoadFailureError extends Error {
    readonly pluginIds: string[];
    readonly registry: PluginRegistry;
    constructor(registry: PluginRegistry);
}
export declare function clearPluginLoaderCache(): void;
export declare const __testing: {
    buildPluginLoaderJitiOptions: typeof buildPluginLoaderJitiOptions;
    buildPluginLoaderAliasMap: typeof buildPluginLoaderAliasMap;
    listPluginSdkAliasCandidates: typeof listPluginSdkAliasCandidates;
    listPluginSdkExportedSubpaths: typeof listPluginSdkExportedSubpaths;
    resolveExtensionApiAlias: typeof resolveExtensionApiAlias;
    resolvePluginSdkScopedAliasMap: typeof resolvePluginSdkScopedAliasMap;
    resolvePluginSdkAliasCandidateOrder: typeof resolvePluginSdkAliasCandidateOrder;
    resolvePluginSdkAliasFile: typeof resolvePluginSdkAliasFile;
    resolvePluginRuntimeModulePath: typeof resolvePluginRuntimeModulePath;
    shouldPreferNativeJiti: typeof shouldPreferNativeJiti;
    readonly maxPluginRegistryCacheEntries: number;
    setMaxPluginRegistryCacheEntriesForTest(value?: number): void;
};
export declare function loadOpenClawPlugins(options?: PluginLoadOptions): PluginRegistry;
