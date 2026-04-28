import type { OpenClawConfig } from "../../config/types.openclaw.js";
import { resolveReadOnlyChannelCommandDefaults } from "./read-only-command-defaults.js";
import type { ChannelPlugin } from "./types.plugin.js";
type ReadOnlyChannelPluginOptions = {
    env?: NodeJS.ProcessEnv;
    stateDir?: string;
    workspaceDir?: string;
    activationSourceConfig?: OpenClawConfig;
    includePersistedAuthState?: boolean;
    includeSetupRuntimeFallback?: boolean;
    cache?: boolean;
};
type ReadOnlyChannelPluginResolution = {
    plugins: ChannelPlugin[];
    configuredChannelIds: string[];
    missingConfiguredChannelIds: string[];
};
export { resolveReadOnlyChannelCommandDefaults };
export declare function listReadOnlyChannelPluginsForConfig(cfg: OpenClawConfig, options?: ReadOnlyChannelPluginOptions): ChannelPlugin[];
export declare function resolveReadOnlyChannelPluginsForConfig(cfg: OpenClawConfig, options?: ReadOnlyChannelPluginOptions): ReadOnlyChannelPluginResolution;
