import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { ExecApprovalRequest } from "./exec-approvals.js";
import type { PluginApprovalRequest } from "./plugin-approvals.js";
type ApprovalRequestLike = ExecApprovalRequest | PluginApprovalRequest;
export declare function resolveApprovalRequestAccountId(params: {
    cfg: OpenClawConfig;
    request: ApprovalRequestLike;
    channel?: string | null;
}): string | null;
export declare function resolveApprovalRequestChannelAccountId(params: {
    cfg: OpenClawConfig;
    request: ApprovalRequestLike;
    channel: string;
}): string | null;
export declare function doesApprovalRequestMatchChannelAccount(params: {
    cfg: OpenClawConfig;
    request: ApprovalRequestLike;
    channel: string;
    accountId?: string | null;
}): boolean;
export {};
