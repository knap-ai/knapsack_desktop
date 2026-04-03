import type { OpenClawConfig } from "../config/config.js";
import type { ExecApprovalRequest } from "./exec-approvals.js";
import type { PluginApprovalRequest } from "./plugin-approvals.js";
export type ExecApprovalSessionTarget = {
    channel?: string;
    to: string;
    accountId?: string;
    threadId?: number;
};
type ApprovalRequestLike = ExecApprovalRequest | PluginApprovalRequest;
type ApprovalRequestOriginTargetResolver<TTarget> = {
    cfg: OpenClawConfig;
    request: ApprovalRequestLike;
    channel: string;
    accountId?: string | null;
    resolveTurnSourceTarget: (request: ApprovalRequestLike) => TTarget | null;
    resolveSessionTarget: (sessionTarget: ExecApprovalSessionTarget) => TTarget | null;
    targetsMatch: (a: TTarget, b: TTarget) => boolean;
    resolveFallbackTarget?: (request: ApprovalRequestLike) => TTarget | null;
};
export declare function resolveExecApprovalSessionTarget(params: {
    cfg: OpenClawConfig;
    request: ExecApprovalRequest;
    turnSourceChannel?: string | null;
    turnSourceTo?: string | null;
    turnSourceAccountId?: string | null;
    turnSourceThreadId?: string | number | null;
}): ExecApprovalSessionTarget | null;
export declare function resolveApprovalRequestSessionTarget(params: {
    cfg: OpenClawConfig;
    request: ApprovalRequestLike;
}): ExecApprovalSessionTarget | null;
export declare function resolveApprovalRequestAccountId(params: {
    cfg: OpenClawConfig;
    request: ApprovalRequestLike;
    channel?: string | null;
}): string | null;
export declare function doesApprovalRequestMatchChannelAccount(params: {
    cfg: OpenClawConfig;
    request: ApprovalRequestLike;
    channel: string;
    accountId?: string | null;
}): boolean;
export declare function resolveApprovalRequestOriginTarget<TTarget>(params: ApprovalRequestOriginTargetResolver<TTarget>): TTarget | null;
export {};
