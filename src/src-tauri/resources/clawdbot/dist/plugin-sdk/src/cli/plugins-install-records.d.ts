import type { HookInstallRecord } from "../config/types.hooks.js";
import type { PluginInstallRecord } from "../config/types.plugins.js";
export declare function extractInstalledNpmPackageName(install: PluginInstallRecord): string | undefined;
export declare function extractInstalledNpmHookPackageName(install: HookInstallRecord): string | undefined;
