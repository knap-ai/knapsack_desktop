import type { OpenClawConfig } from "../config/types.openclaw.js";
import { type NormalizePluginId, type NormalizedPluginsConfig as SharedNormalizedPluginsConfig } from "./config-normalization-shared.js";
import type { PluginKind } from "./plugin-kind.types.js";
import type { PluginOrigin } from "./plugin-origin.types.js";
export type PluginActivationSource = "disabled" | "explicit" | "auto" | "default";
export type PluginActivationState = {
    enabled: boolean;
    activated: boolean;
    explicitlyEnabled: boolean;
    source: PluginActivationSource;
    reason?: string;
};
export type NormalizedPluginsConfig = SharedNormalizedPluginsConfig;
export declare function normalizePluginsConfigWithResolver(config?: OpenClawConfig["plugins"], normalizePluginId?: NormalizePluginId): NormalizedPluginsConfig;
export declare function resolvePluginActivationState(params: {
    id: string;
    origin: PluginOrigin;
    config: NormalizedPluginsConfig;
    rootConfig?: OpenClawConfig;
    enabledByDefault?: boolean;
    sourceConfig?: NormalizedPluginsConfig;
    sourceRootConfig?: OpenClawConfig;
    autoEnabledReason?: string;
}): PluginActivationState;
export declare function hasExplicitPluginConfig(plugins?: OpenClawConfig["plugins"]): boolean;
export declare function resolveEnableState(id: string, origin: PluginOrigin, config: NormalizedPluginsConfig, enabledByDefault?: boolean): {
    enabled: boolean;
    reason?: string;
};
export declare function isBundledChannelEnabledByChannelConfig(cfg: OpenClawConfig | undefined, pluginId: string): boolean;
export declare function resolveEffectiveEnableState(params: {
    id: string;
    origin: PluginOrigin;
    config: NormalizedPluginsConfig;
    rootConfig?: OpenClawConfig;
    enabledByDefault?: boolean;
    sourceConfig?: NormalizedPluginsConfig;
    sourceRootConfig?: OpenClawConfig;
    autoEnabledReason?: string;
}): {
    enabled: boolean;
    reason?: string;
};
export declare function resolveEffectivePluginActivationState(params: {
    id: string;
    origin: PluginOrigin;
    config: NormalizedPluginsConfig;
    rootConfig?: OpenClawConfig;
    enabledByDefault?: boolean;
    sourceConfig?: NormalizedPluginsConfig;
    sourceRootConfig?: OpenClawConfig;
    autoEnabledReason?: string;
}): PluginActivationState;
export declare function resolveMemorySlotDecision(params: {
    id: string;
    kind?: PluginKind | PluginKind[];
    slot: string | null | undefined;
    selectedId: string | null;
}): {
    enabled: boolean;
    reason?: string;
    selected?: boolean;
};
