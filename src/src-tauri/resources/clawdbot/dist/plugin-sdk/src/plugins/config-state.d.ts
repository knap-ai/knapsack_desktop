import type { OpenClawConfig } from "../config/types.openclaw.js";
import { type NormalizedPluginsConfig as SharedNormalizedPluginsConfig } from "./config-normalization-shared.js";
import type { PluginOrigin } from "./plugin-origin.types.js";
export type PluginActivationSource = "disabled" | "explicit" | "auto" | "default";
export type PluginExplicitSelectionCause = "enabled-in-config" | "bundled-channel-enabled-in-config" | "selected-memory-slot" | "selected-context-engine-slot" | "selected-in-allowlist";
export type PluginActivationCause = PluginExplicitSelectionCause | "plugins-disabled" | "blocked-by-denylist" | "disabled-in-config" | "workspace-disabled-by-default" | "not-in-allowlist" | "enabled-by-effective-config" | "bundled-channel-configured" | "bundled-default-enablement" | "bundled-disabled-by-default";
export type PluginActivationState = {
    enabled: boolean;
    activated: boolean;
    explicitlyEnabled: boolean;
    source: PluginActivationSource;
    reason?: string;
};
export type PluginActivationConfigSource = {
    plugins: NormalizedPluginsConfig;
    rootConfig?: OpenClawConfig;
};
export type NormalizedPluginsConfig = SharedNormalizedPluginsConfig;
export declare function normalizePluginId(id: string): string;
export declare const normalizePluginsConfig: (config?: OpenClawConfig["plugins"]) => NormalizedPluginsConfig;
export declare function createPluginActivationSource(params: {
    config?: OpenClawConfig;
    plugins?: NormalizedPluginsConfig;
}): PluginActivationConfigSource;
export declare const hasExplicitPluginConfig: (plugins?: OpenClawConfig["plugins"]) => boolean;
export declare function applyTestPluginDefaults(cfg: OpenClawConfig, env?: NodeJS.ProcessEnv): OpenClawConfig;
export declare function isTestDefaultMemorySlotDisabled(cfg: OpenClawConfig, env?: NodeJS.ProcessEnv): boolean;
export declare function resolvePluginActivationState(params: {
    id: string;
    origin: PluginOrigin;
    config: NormalizedPluginsConfig;
    rootConfig?: OpenClawConfig;
    enabledByDefault?: boolean;
    activationSource?: PluginActivationConfigSource;
    autoEnabledReason?: string;
}): PluginActivationState;
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
    activationSource?: PluginActivationConfigSource;
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
    activationSource?: PluginActivationConfigSource;
    autoEnabledReason?: string;
}): PluginActivationState;
export declare function resolveMemorySlotDecision(params: {
    id: string;
    kind?: string | string[];
    slot: string | null | undefined;
    selectedId: string | null;
}): {
    enabled: boolean;
    reason?: string;
    selected?: boolean;
};
