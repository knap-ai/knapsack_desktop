export declare function loadBundledPluginPublicSurfaceSync<T extends object>(params: {
    pluginId: string;
    artifactBasename: string;
}): T;
export declare function loadBundledPluginTestApiSync<T extends object>(pluginId: string): T;
export declare function resolveRelativeBundledPluginPublicModuleId(params: {
    fromModuleUrl: string;
    pluginId: string;
    artifactBasename: string;
}): string;
