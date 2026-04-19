import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { detectLegacyMatrixCrypto } from "./legacy-crypto.js";
import { detectLegacyMatrixState } from "./legacy-state.js";
import { maybeCreateMatrixMigrationSnapshot, resolveMatrixMigrationSnapshotMarkerPath, resolveMatrixMigrationSnapshotOutputDir, type MatrixMigrationSnapshotResult } from "./migration-snapshot-backup.js";
export type MatrixMigrationStatus = {
    legacyState: ReturnType<typeof detectLegacyMatrixState>;
    legacyCrypto: ReturnType<typeof detectLegacyMatrixCrypto>;
    pending: boolean;
    actionable: boolean;
};
export declare function resolveMatrixMigrationStatus(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
}): MatrixMigrationStatus;
export declare function hasPendingMatrixMigration(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
}): boolean;
export declare function hasActionableMatrixMigration(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
}): boolean;
export { maybeCreateMatrixMigrationSnapshot, resolveMatrixMigrationSnapshotMarkerPath, resolveMatrixMigrationSnapshotOutputDir, };
export type { MatrixMigrationSnapshotResult };
