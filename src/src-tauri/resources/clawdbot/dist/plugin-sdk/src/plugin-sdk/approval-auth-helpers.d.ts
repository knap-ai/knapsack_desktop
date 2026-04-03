import type { OpenClawConfig } from "./config-runtime.js";
type ApprovalKind = "exec" | "plugin";
export declare function createResolvedApproverActionAuthAdapter(params: {
    channelLabel: string;
    resolveApprovers: (params: {
        cfg: OpenClawConfig;
        accountId?: string | null;
    }) => string[];
    normalizeSenderId?: (value: string) => string | undefined;
}): {
    authorizeActorAction({ cfg, accountId, senderId, approvalKind, }: {
        cfg: OpenClawConfig;
        accountId?: string | null;
        senderId?: string | null;
        action: "approve";
        approvalKind: ApprovalKind;
    }): {
        readonly authorized: true;
        reason?: undefined;
    } | {
        readonly authorized: false;
        readonly reason: `\u274C You are not authorized to approve exec requests on ${string}.` | `\u274C You are not authorized to approve plugin requests on ${string}.`;
    };
};
export {};
