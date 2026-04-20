export declare function isJavaScriptModulePath(modulePath: string): boolean;
export declare function resolveCompiledBundledModulePath(modulePath: string): string;
export declare function resolvePluginModuleCandidates(rootDir: string, specifier: string): string[];
export declare function resolveExistingPluginModulePath(rootDir: string, specifier: string): string;
export declare function loadChannelPluginModule(params: {
    modulePath: string;
    rootDir: string;
    boundaryRootDir?: string;
    boundaryLabel?: string;
    shouldTryNativeRequire?: (safePath: string) => boolean;
}): unknown;
