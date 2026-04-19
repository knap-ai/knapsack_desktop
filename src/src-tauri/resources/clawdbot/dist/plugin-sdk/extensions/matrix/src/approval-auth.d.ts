import type { CoreConfig } from "./types.js";
export declare function getMatrixApprovalAuthApprovers(params: {
    cfg: CoreConfig;
    accountId?: string | null;
}): string[];
export declare const matrixApprovalAuth: {
    authorizeActorAction({ cfg, accountId, senderId, approvalKind, }: {
        cfg: import("openclaw/plugin-sdk").OpenClawConfig;
        accountId?: string | null;
        senderId?: string | null;
        action: "approve";
        approvalKind: "exec" | "plugin";
    }): {
        authorized: boolean;
        reason?: string;
    } | {
        readonly authorized: true;
        reason?: undefined;
    } | {
        readonly authorized: false;
        readonly reason: `\u274C You are not authorized to approve exec requests on ${string}.` | `\u274C You are not authorized to approve plugin requests on ${string}.`;
    };
};
