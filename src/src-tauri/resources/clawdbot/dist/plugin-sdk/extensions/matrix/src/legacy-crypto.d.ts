import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { writeJsonFileAtomically as writeJsonFileAtomicallyImpl } from "openclaw/plugin-sdk/json-store";
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
type MatrixLegacyCryptoPreparationResult = {
    migrated: boolean;
    changes: string[];
    warnings: string[];
};
type MatrixLegacyCryptoPrepareDeps = {
    inspectLegacyStore: MatrixLegacyCryptoInspector;
    writeJsonFileAtomically: typeof writeJsonFileAtomicallyImpl;
};
type MatrixLegacyCryptoInspectorParams = {
    cryptoRootDir: string;
    userId: string;
    deviceId: string;
    log?: (message: string) => void;
};
type MatrixLegacyCryptoInspectorResult = {
    deviceId: string | null;
    roomKeyCounts: {
        total: number;
        backedUp: number;
    } | null;
    backupVersion: string | null;
    decryptionKeyBase64: string | null;
};
type MatrixLegacyCryptoInspector = (params: MatrixLegacyCryptoInspectorParams) => Promise<MatrixLegacyCryptoInspectorResult>;
export declare function detectLegacyMatrixCrypto(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
}): MatrixLegacyCryptoDetection;
export declare function autoPrepareLegacyMatrixCrypto(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    log?: {
        info?: (message: string) => void;
        warn?: (message: string) => void;
    };
    deps?: Partial<MatrixLegacyCryptoPrepareDeps>;
}): Promise<MatrixLegacyCryptoPreparationResult>;
export {};
