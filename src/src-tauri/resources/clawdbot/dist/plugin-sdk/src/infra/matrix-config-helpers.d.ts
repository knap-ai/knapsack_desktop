import type { OpenClawConfig } from "../config/config.js";
export declare function resolveMatrixChannelConfig(cfg: OpenClawConfig): Record<string, unknown> | null;
export declare function findMatrixAccountEntry(cfg: OpenClawConfig, accountId: string): Record<string, unknown> | null;
export declare function resolveMatrixEnvAccountToken(accountId: string): string;
export declare function getMatrixScopedEnvVarNames(accountId: string): {
    homeserver: string;
    userId: string;
    accessToken: string;
    password: string;
    deviceId: string;
    deviceName: string;
};
export declare function listMatrixEnvAccountIds(env?: NodeJS.ProcessEnv): string[];
export declare function resolveConfiguredMatrixAccountIds(cfg: OpenClawConfig, env?: NodeJS.ProcessEnv): string[];
export declare function resolveMatrixDefaultOrOnlyAccountId(cfg: OpenClawConfig, env?: NodeJS.ProcessEnv): string;
export declare function requiresExplicitMatrixDefaultAccount(cfg: OpenClawConfig, env?: NodeJS.ProcessEnv): boolean;
export declare function resolveMatrixCredentialsPath(params: {
    stateDir: string;
    accountId?: string | null;
}): string;
export declare function resolveMatrixLegacyFlatStoragePaths(stateDir: string): {
    rootDir: string;
    storagePath: string;
    cryptoPath: string;
};
export declare function resolveMatrixAccountStorageRoot(params: {
    stateDir: string;
    homeserver: string;
    userId: string;
    accessToken: string;
    accountId?: string | null;
}): {
    rootDir: string;
    accountKey: string;
    tokenHash: string;
};
