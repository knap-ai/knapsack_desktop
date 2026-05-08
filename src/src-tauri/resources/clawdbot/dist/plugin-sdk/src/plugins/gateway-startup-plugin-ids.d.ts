import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { PluginManifestRegistry } from "./manifest-registry.js";
import { loadPluginRegistrySnapshot } from "./plugin-registry-snapshot.js";
export declare function resolveChannelPluginIds(params: {
    config: OpenClawConfig;
    workspaceDir?: string;
    env: NodeJS.ProcessEnv;
}): string[];
export declare function resolveChannelPluginIdsFromRegistry(params: {
    manifestRegistry: PluginManifestRegistry;
}): string[];
export declare function resolveConfiguredDeferredChannelPluginIdsFromRegistry(params: {
    config: OpenClawConfig;
    env: NodeJS.ProcessEnv;
    index: ReturnType<typeof loadPluginRegistrySnapshot>;
    manifestRegistry: PluginManifestRegistry;
}): string[];
export declare function resolveConfiguredDeferredChannelPluginIds(params: {
    config: OpenClawConfig;
    workspaceDir?: string;
    env: NodeJS.ProcessEnv;
}): string[];
export declare function resolveGatewayStartupPluginIdsFromRegistry(params: {
    config: OpenClawConfig;
    activationSourceConfig?: OpenClawConfig;
    env: NodeJS.ProcessEnv;
    index: ReturnType<typeof loadPluginRegistrySnapshot>;
    manifestRegistry: PluginManifestRegistry;
}): string[];
export declare function resolveGatewayStartupPluginIds(params: {
    config: OpenClawConfig;
    activationSourceConfig?: OpenClawConfig;
    workspaceDir?: string;
    env: NodeJS.ProcessEnv;
}): string[];
