import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { autoMigrateLegacyMatrixState, autoPrepareLegacyMatrixCrypto, maybeCreateMatrixMigrationSnapshot } from "./matrix-migration.runtime.js";
type MatrixStartupLogger = {
    info?: (message: string) => void;
    warn?: (message: string) => void;
};
export declare function runMatrixStartupMaintenance(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    log: MatrixStartupLogger;
    trigger?: string;
    logPrefix?: string;
    deps?: {
        maybeCreateMatrixMigrationSnapshot?: typeof maybeCreateMatrixMigrationSnapshot;
        autoMigrateLegacyMatrixState?: typeof autoMigrateLegacyMatrixState;
        autoPrepareLegacyMatrixCrypto?: typeof autoPrepareLegacyMatrixCrypto;
    };
}): Promise<void>;
export {};
