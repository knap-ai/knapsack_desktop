import type { ReplyPayload } from "../auto-reply/reply-payload.js";
import { type ExecApprovalReplyDecision } from "../infra/exec-approval-reply.js";
import { type PluginApprovalRequest, type PluginApprovalResolved } from "../infra/plugin-approvals.js";
export declare function buildApprovalPendingReplyPayload(params: {
    approvalKind?: "exec" | "plugin";
    approvalId: string;
    approvalSlug: string;
    text: string;
    agentId?: string | null;
    allowedDecisions?: readonly ExecApprovalReplyDecision[];
    sessionKey?: string | null;
    channelData?: Record<string, unknown>;
}): ReplyPayload;
export declare function buildApprovalResolvedReplyPayload(params: {
    approvalId: string;
    approvalSlug: string;
    text: string;
    channelData?: Record<string, unknown>;
}): ReplyPayload;
export declare function buildPluginApprovalPendingReplyPayload(params: {
    request: PluginApprovalRequest;
    nowMs: number;
    text?: string;
    approvalSlug?: string;
    allowedDecisions?: readonly ExecApprovalReplyDecision[];
    channelData?: Record<string, unknown>;
}): ReplyPayload;
export declare function buildPluginApprovalResolvedReplyPayload(params: {
    resolved: PluginApprovalResolved;
    text?: string;
    approvalSlug?: string;
    channelData?: Record<string, unknown>;
}): ReplyPayload;
