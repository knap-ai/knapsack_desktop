import type { OpenClawConfig } from "../config/config.js";
export type ApprovalCommandAuthorization = {
    authorized: boolean;
    reason?: string;
    explicit: boolean;
};
export declare function resolveApprovalCommandAuthorization(params: {
    cfg: OpenClawConfig;
    channel?: string | null;
    accountId?: string | null;
    senderId?: string | null;
    kind: "exec" | "plugin";
}): ApprovalCommandAuthorization;
