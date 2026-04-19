import type { MatrixConfig } from "../../types.js";
import type { MatrixAuth } from "../client/types.js";
import type { MatrixClient, MatrixOwnDeviceVerificationStatus } from "../sdk.js";
export type MatrixStartupVerificationOutcome = {
    kind: "disabled" | "verified" | "cooldown" | "pending" | "requested" | "request-failed";
    verification: MatrixOwnDeviceVerificationStatus;
    requestId?: string;
    transactionId?: string;
    error?: string;
    retryAfterMs?: number;
} | {
    kind: "unsupported";
    verification?: undefined;
};
export declare function ensureMatrixStartupVerification(params: {
    client: Pick<MatrixClient, "crypto" | "getOwnDeviceVerificationStatus">;
    auth: MatrixAuth;
    accountConfig: Pick<MatrixConfig, "startupVerification" | "startupVerificationCooldownHours">;
    env?: NodeJS.ProcessEnv;
    nowMs?: number;
    stateFilePath?: string;
}): Promise<MatrixStartupVerificationOutcome>;
