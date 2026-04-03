import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare function getSlackApprovalApprovers(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
export declare function isSlackApprovalAuthorizedSender(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    senderId?: string | null;
}): boolean;
export declare const slackApprovalAuth: {
    authorizeActorAction({ cfg, accountId, senderId, approvalKind, }: {
        cfg: OpenClawConfig;
        accountId?: string | null;
        senderId?: string | null;
        action: "approve";
        approvalKind: "exec" | "plugin";
    }): {
        readonly authorized: true;
        reason?: undefined;
    } | {
        readonly authorized: false;
        readonly reason: `\u274C You are not authorized to approve exec requests on ${string}.` | `\u274C You are not authorized to approve plugin requests on ${string}.`;
    };
};
