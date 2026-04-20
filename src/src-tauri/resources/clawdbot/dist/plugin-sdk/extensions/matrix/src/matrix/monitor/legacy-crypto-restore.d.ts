import type { MatrixAuth } from "../client/types.js";
import type { MatrixClient } from "../sdk.js";
export type MatrixLegacyCryptoRestoreResult = {
    kind: "skipped";
} | {
    kind: "restored";
    imported: number;
    total: number;
    localOnlyKeys: number;
} | {
    kind: "failed";
    error: string;
    localOnlyKeys: number;
};
export declare function maybeRestoreLegacyMatrixBackup(params: {
    client: Pick<MatrixClient, "restoreRoomKeyBackup">;
    auth: Pick<MatrixAuth, "homeserver" | "userId" | "accessToken" | "accountId" | "deviceId">;
    env?: NodeJS.ProcessEnv;
    stateDir?: string;
}): Promise<MatrixLegacyCryptoRestoreResult>;
