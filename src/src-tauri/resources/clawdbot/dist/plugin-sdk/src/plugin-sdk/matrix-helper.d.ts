import type { OpenClawConfig } from "../config/config.js";
export type MatrixScopedEnvVarNames = {
    homeserver: string;
    userId: string;
    accessToken: string;
    password: string;
    deviceId: string;
    deviceName: string;
};
export type MatrixAccountStorageRoot = {
    rootDir: string;
    accountKey: string;
    tokenHash: string;
};
export type MatrixLegacyFlatStoragePaths = {
    rootDir: string;
    storagePath: string;
    cryptoPath: string;
};
type FacadeModule = {
    findMatrixAccountEntry: (cfg: OpenClawConfig, accountId: string) => Record<string, unknown> | null;
    getMatrixScopedEnvVarNames: (accountId: string) => MatrixScopedEnvVarNames;
    requiresExplicitMatrixDefaultAccount: (cfg: OpenClawConfig, env?: NodeJS.ProcessEnv) => boolean;
    resolveConfiguredMatrixAccountIds: (cfg: OpenClawConfig, env?: NodeJS.ProcessEnv) => string[];
    resolveMatrixAccountStorageRoot: (params: {
        stateDir: string;
        homeserver: string;
        userId: string;
        accessToken: string;
        accountId?: string | null;
    }) => MatrixAccountStorageRoot;
    resolveMatrixChannelConfig: (cfg: OpenClawConfig) => Record<string, unknown> | null;
    resolveMatrixCredentialsDir: (stateDir: string) => string;
    resolveMatrixCredentialsPath: (params: {
        stateDir: string;
        accountId?: string | null;
    }) => string;
    resolveMatrixDefaultOrOnlyAccountId: (cfg: OpenClawConfig, env?: NodeJS.ProcessEnv) => string;
    resolveMatrixLegacyFlatStoragePaths: (stateDir: string) => MatrixLegacyFlatStoragePaths;
};
export declare const findMatrixAccountEntry: FacadeModule["findMatrixAccountEntry"];
export declare const getMatrixScopedEnvVarNames: FacadeModule["getMatrixScopedEnvVarNames"];
export declare const requiresExplicitMatrixDefaultAccount: FacadeModule["requiresExplicitMatrixDefaultAccount"];
export declare const resolveConfiguredMatrixAccountIds: FacadeModule["resolveConfiguredMatrixAccountIds"];
export declare const resolveMatrixAccountStorageRoot: FacadeModule["resolveMatrixAccountStorageRoot"];
export declare const resolveMatrixChannelConfig: FacadeModule["resolveMatrixChannelConfig"];
export declare const resolveMatrixCredentialsDir: FacadeModule["resolveMatrixCredentialsDir"];
export declare const resolveMatrixCredentialsPath: FacadeModule["resolveMatrixCredentialsPath"];
export declare const resolveMatrixDefaultOrOnlyAccountId: FacadeModule["resolveMatrixDefaultOrOnlyAccountId"];
export declare const resolveMatrixLegacyFlatStoragePaths: FacadeModule["resolveMatrixLegacyFlatStoragePaths"];
export {};
