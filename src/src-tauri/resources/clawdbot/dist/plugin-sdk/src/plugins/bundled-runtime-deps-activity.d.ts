export type BundledRuntimeDepsInstallActivity = {
    id: number;
    installRoot: string;
    missingSpecs: string[];
    installSpecs: string[];
    pluginId?: string;
    startedAtMs: number;
};
export declare function beginBundledRuntimeDepsInstall(params: {
    installRoot: string;
    missingSpecs: readonly string[];
    installSpecs?: readonly string[];
    pluginId?: string;
}): () => void;
export declare function getActiveBundledRuntimeDepsInstallCount(): number;
export declare function listActiveBundledRuntimeDepsInstalls(): BundledRuntimeDepsInstallActivity[];
export declare function waitForBundledRuntimeDepsInstallIdle(timeoutMs?: number): Promise<{
    drained: boolean;
    active: number;
}>;
export declare const __testing: {
    resetBundledRuntimeDepsInstallActivity(): void;
};
