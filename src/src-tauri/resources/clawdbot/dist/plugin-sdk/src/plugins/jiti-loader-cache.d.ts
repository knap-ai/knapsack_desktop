import { createJiti } from "jiti";
export type PluginJitiLoader = ReturnType<typeof createJiti>;
export type PluginJitiLoaderFactory = typeof createJiti;
export type PluginJitiLoaderCache = Map<string, PluginJitiLoader>;
export declare function getCachedPluginJitiLoader(params: {
    cache: PluginJitiLoaderCache;
    modulePath: string;
    importerUrl: string;
    argvEntry?: string;
    preferBuiltDist?: boolean;
    jitiFilename?: string;
    createLoader?: PluginJitiLoaderFactory;
    aliasMap?: Record<string, string>;
    tryNative?: boolean;
    cacheScopeKey?: string;
}): PluginJitiLoader;
