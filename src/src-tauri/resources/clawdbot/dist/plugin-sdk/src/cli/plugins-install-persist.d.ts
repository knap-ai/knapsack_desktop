import type { OpenClawConfig } from "../config/types.openclaw.js";
import { type HookInstallUpdate } from "../hooks/installs.js";
import type { PluginInstallUpdate } from "../plugins/installs.js";
export type ConfigSnapshotForInstallPersist = {
    config: OpenClawConfig;
    baseHash: string | undefined;
};
export declare function persistPluginInstall(params: {
    snapshot: ConfigSnapshotForInstallPersist;
    pluginId: string;
    install: Omit<PluginInstallUpdate, "pluginId">;
    enable?: boolean;
    successMessage?: string;
    warningMessage?: string;
}): Promise<OpenClawConfig>;
export declare function persistHookPackInstall(params: {
    snapshot: ConfigSnapshotForInstallPersist;
    hookPackId: string;
    hooks: string[];
    install: Omit<HookInstallUpdate, "hookId" | "hooks">;
    successMessage?: string;
}): Promise<OpenClawConfig>;
