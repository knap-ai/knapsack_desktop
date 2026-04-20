import type { FileLockOptions } from "openclaw/plugin-sdk/infra-runtime";
export declare const MATRIX_IDB_PERSIST_INTERVAL_MS = 60000;
export declare function computeMinimumRetryWindowMs(retries: FileLockOptions["retries"]): number;
export declare const MATRIX_IDB_SNAPSHOT_LOCK_OPTIONS: FileLockOptions;
