type PluginSdkAliasCandidateKind = "dist" | "src";
export type LoaderModuleResolveParams = {
    modulePath?: string;
    argv1?: string;
    cwd?: string;
    moduleUrl?: string;
};
export declare function resolveLoaderPackageRoot(params: LoaderModuleResolveParams & {
    modulePath: string;
}): string | null;
export declare function resolvePluginSdkAliasCandidateOrder(params: {
    modulePath: string;
    isProduction: boolean;
}): PluginSdkAliasCandidateKind[];
export declare function listPluginSdkAliasCandidates(params: {
    srcFile: string;
    distFile: string;
    modulePath: string;
    argv1?: string;
    cwd?: string;
    moduleUrl?: string;
}): string[];
export declare function resolvePluginSdkAliasFile(params: {
    srcFile: string;
    distFile: string;
    modulePath?: string;
    argv1?: string;
    cwd?: string;
    moduleUrl?: string;
}): string | null;
export declare function listPluginSdkExportedSubpaths(params?: {
    modulePath?: string;
}): string[];
export declare function resolvePluginSdkScopedAliasMap(params?: {
    modulePath?: string;
}): Record<string, string>;
export declare function resolveExtensionApiAlias(params?: LoaderModuleResolveParams): string | null;
export declare function buildPluginLoaderAliasMap(modulePath: string): Record<string, string>;
export declare function resolvePluginRuntimeModulePath(params?: LoaderModuleResolveParams): string | null;
export declare function buildPluginLoaderJitiOptions(aliasMap: Record<string, string>): {
    alias?: Record<string, string> | undefined;
    interopDefault: boolean;
    tryNative: boolean;
    extensions: string[];
};
export declare function shouldPreferNativeJiti(modulePath: string): boolean;
export {};
