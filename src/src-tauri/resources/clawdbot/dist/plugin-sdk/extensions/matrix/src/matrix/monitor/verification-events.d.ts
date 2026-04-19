import type { MatrixClient } from "../sdk.js";
import type { MatrixRawEvent } from "./types.js";
type MatrixVerificationSummaryLike = {
    id: string;
    transactionId?: string;
    roomId?: string;
    otherUserId: string;
    updatedAt?: string;
    completed?: boolean;
    pending?: boolean;
    phase?: number;
    phaseName?: string;
    sas?: {
        decimal?: [number, number, number];
        emoji?: Array<[string, string]>;
    };
};
export declare function createMatrixVerificationEventRouter(params: {
    client: MatrixClient;
    allowFrom: string[];
    dmEnabled: boolean;
    dmPolicy: "open" | "pairing" | "allowlist" | "disabled";
    readStoreAllowFrom: () => Promise<string[]>;
    logVerboseMessage: (message: string) => void;
}): {
    routeVerificationEvent: (roomId: string, event: MatrixRawEvent) => boolean;
    routeVerificationSummary: (summary: MatrixVerificationSummaryLike) => Promise<void>;
};
export {};
