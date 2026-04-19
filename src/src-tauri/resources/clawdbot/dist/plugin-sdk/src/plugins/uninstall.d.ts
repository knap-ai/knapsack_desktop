import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { PluginInstallRecord } from "../config/types.plugins.js";
export type UninstallActions = {
    entry: boolean;
    install: boolean;
    allowlist: boolean;
    loadPath: boolean;
    memorySlot: boolean;
    channelConfig: boolean;
    directory: boolean;
};
export type UninstallPluginResult = {
    ok: true;
    config: OpenClawConfig;
    pluginId: string;
    actions: UninstallActions;
    warnings: string[];
} | {
    ok: false;
    error: string;
};
export declare function resolveUninstallDirectoryTarget(params: {
    pluginId: string;
    hasInstall: boolean;
    installRecord?: PluginInstallRecord;
    extensionsDir?: string;
}): string | null;
/**
 * Resolve the channel config keys owned by a plugin during uninstall.
 * - `channelIds === undefined`: fall back to the plugin id for backward compatibility.
 * - `channelIds === []`: explicit "owns no channels" signal; remove nothing.
 */
export declare function resolveUninstallChannelConfigKeys(pluginId: string, opts?: {
    channelIds?: string[];
}): string[];
/**
 * Remove plugin references from config (pure config mutation).
 * Returns a new config with the plugin removed from entries, installs, allow, load.paths, slots,
 * and owned channel config.
 */
export declare function removePluginFromConfig(cfg: OpenClawConfig, pluginId: string, opts?: {
    channelIds?: string[];
}): {
    config: OpenClawConfig;
    actions: Omit<UninstallActions, "directory">;
};
export type UninstallPluginParams = {
    config: OpenClawConfig;
    pluginId: string;
    channelIds?: string[];
    deleteFiles?: boolean;
    extensionsDir?: string;
};
/**
 * Uninstall a plugin by removing it from config and optionally deleting installed files.
 * Linked plugins (source === "path") never have their source directory deleted.
 */
export declare function uninstallPlugin(params: UninstallPluginParams): Promise<UninstallPluginResult>;
