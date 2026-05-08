export declare const INSTALLED_PLUGIN_INDEX_STORE_PATH: string;
export type InstalledPluginIndexStoreOptions = {
    env?: NodeJS.ProcessEnv;
    stateDir?: string;
    filePath?: string;
};
export declare function resolveInstalledPluginIndexStorePath(options?: InstalledPluginIndexStoreOptions): string;
