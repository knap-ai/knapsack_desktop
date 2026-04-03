export declare function createLazyFacadeObjectValue<T extends object>(load: () => T): T;
export declare function createLazyFacadeArrayValue<T extends readonly unknown[]>(load: () => T): T;
export declare function loadBundledPluginPublicSurfaceModuleSync<T extends object>(params: {
    dirName: string;
    artifactBasename: string;
}): T;
export declare function canLoadActivatedBundledPluginPublicSurface(params: {
    dirName: string;
    artifactBasename: string;
}): boolean;
export declare function loadActivatedBundledPluginPublicSurfaceModuleSync<T extends object>(params: {
    dirName: string;
    artifactBasename: string;
}): T;
export declare function tryLoadActivatedBundledPluginPublicSurfaceModuleSync<T extends object>(params: {
    dirName: string;
    artifactBasename: string;
}): T | null;
export declare function listImportedBundledPluginFacadeIds(): string[];
export declare function resetFacadeRuntimeStateForTest(): void;
