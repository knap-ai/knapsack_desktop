import type { OpenClawConfig } from "../../config/types.openclaw.js";
import type { PluginRegistry } from "../registry.js";
export declare function loadPluginMetadataRegistrySnapshot(options?: {
    config?: OpenClawConfig;
    activationSourceConfig?: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    workspaceDir?: string;
    onlyPluginIds?: string[];
    loadModules?: boolean;
}): PluginRegistry;
