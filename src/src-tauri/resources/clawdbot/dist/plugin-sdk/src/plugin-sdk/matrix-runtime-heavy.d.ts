import type { OpenClawConfig } from "./config-runtime.js";
type MatrixLegacyLog = {
    info?: (message: string) => void;
    warn?: (message: string) => void;
};
type MatrixLegacyCryptoPlan = {
    accountId: string;
    rootDir: string;
    recoveryKeyPath: string;
    statePath: string;
    legacyCryptoPath: string;
    homeserver: string;
    userId: string;
    accessToken: string;
    deviceId: string | null;
};
type MatrixLegacyCryptoDetection = {
    inspectorAvailable: boolean;
    plans: MatrixLegacyCryptoPlan[];
    warnings: string[];
};
type MatrixLegacyMigrationResult = {
    migrated: boolean;
    changes: string[];
    warnings: string[];
};
type MatrixLegacyStatePlan = {
    accountId: string;
    legacyStoragePath: string;
    legacyCryptoPath: string;
    targetRootDir: string;
    targetStoragePath: string;
    targetCryptoPath: string;
    selectionNote?: string;
};
type MatrixLegacyStateDetection = MatrixLegacyStatePlan | {
    warning: string;
} | null;
type MatrixMigrationSnapshotResult = {
    created: boolean;
    archivePath: string;
    markerPath: string;
};
type MatrixRuntimeHeavyModule = {
    autoPrepareLegacyMatrixCrypto: (params: {
        cfg: OpenClawConfig;
        env?: NodeJS.ProcessEnv;
        log?: MatrixLegacyLog;
        deps?: Partial<Record<string, unknown>>;
    }) => Promise<MatrixLegacyMigrationResult>;
    detectLegacyMatrixCrypto: (params: {
        cfg: OpenClawConfig;
        env?: NodeJS.ProcessEnv;
    }) => MatrixLegacyCryptoDetection;
    autoMigrateLegacyMatrixState: (params: {
        cfg: OpenClawConfig;
        env?: NodeJS.ProcessEnv;
        log?: MatrixLegacyLog;
    }) => Promise<MatrixLegacyMigrationResult>;
    detectLegacyMatrixState: (params: {
        cfg: OpenClawConfig;
        env?: NodeJS.ProcessEnv;
    }) => MatrixLegacyStateDetection;
    hasActionableMatrixMigration: (params: {
        cfg: OpenClawConfig;
        env?: NodeJS.ProcessEnv;
    }) => boolean;
    hasPendingMatrixMigration: (params: {
        cfg: OpenClawConfig;
        env?: NodeJS.ProcessEnv;
    }) => boolean;
    maybeCreateMatrixMigrationSnapshot: (params: {
        trigger: string;
        env?: NodeJS.ProcessEnv;
        outputDir?: string;
        log?: MatrixLegacyLog;
    }) => Promise<MatrixMigrationSnapshotResult>;
};
export declare const autoPrepareLegacyMatrixCrypto: MatrixRuntimeHeavyModule["autoPrepareLegacyMatrixCrypto"];
export declare const detectLegacyMatrixCrypto: MatrixRuntimeHeavyModule["detectLegacyMatrixCrypto"];
export declare const autoMigrateLegacyMatrixState: MatrixRuntimeHeavyModule["autoMigrateLegacyMatrixState"];
export declare const detectLegacyMatrixState: MatrixRuntimeHeavyModule["detectLegacyMatrixState"];
export declare const hasActionableMatrixMigration: MatrixRuntimeHeavyModule["hasActionableMatrixMigration"];
export declare const hasPendingMatrixMigration: MatrixRuntimeHeavyModule["hasPendingMatrixMigration"];
export declare const maybeCreateMatrixMigrationSnapshot: MatrixRuntimeHeavyModule["maybeCreateMatrixMigrationSnapshot"];
export {};
