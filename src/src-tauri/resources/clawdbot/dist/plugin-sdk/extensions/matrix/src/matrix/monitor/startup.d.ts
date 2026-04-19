import type { RuntimeLogger } from "../../runtime-api.js";
import type { CoreConfig, MatrixConfig } from "../../types.js";
import type { MatrixAuth } from "../client.js";
import type { MatrixClient } from "../sdk.js";
type MatrixStartupClient = Pick<MatrixClient, "crypto" | "getOwnDeviceVerificationStatus" | "getUserProfile" | "listOwnDevices" | "restoreRoomKeyBackup" | "setAvatarUrl" | "setDisplayName" | "uploadContent">;
export type MatrixStartupMaintenanceDeps = {
    updateMatrixAccountConfig: typeof import("../config-update.js").updateMatrixAccountConfig;
    summarizeMatrixDeviceHealth: typeof import("../device-health.js").summarizeMatrixDeviceHealth;
    syncMatrixOwnProfile: typeof import("../profile.js").syncMatrixOwnProfile;
    maybeRestoreLegacyMatrixBackup: typeof import("./legacy-crypto-restore.js").maybeRestoreLegacyMatrixBackup;
    ensureMatrixStartupVerification: typeof import("./startup-verification.js").ensureMatrixStartupVerification;
};
export declare function runMatrixStartupMaintenance(params: {
    client: MatrixStartupClient;
    auth: MatrixAuth;
    accountId: string;
    effectiveAccountId: string;
    accountConfig: MatrixConfig;
    logger: RuntimeLogger;
    logVerboseMessage: (message: string) => void;
    loadConfig: () => CoreConfig;
    writeConfigFile: (cfg: never) => Promise<void>;
    loadWebMedia: (url: string, maxBytes: number) => Promise<{
        buffer: Buffer;
        contentType?: string;
        fileName?: string;
    }>;
    env?: NodeJS.ProcessEnv;
    abortSignal?: AbortSignal;
}, deps?: MatrixStartupMaintenanceDeps): Promise<void>;
export {};
