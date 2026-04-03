import type { ReplyPayload } from "../auto-reply/types.js";
import type { InteractiveReply, InteractiveReplyButton } from "../interactive/payload.js";
import { type ExecApprovalDecision, type ExecHost } from "./exec-approvals.js";
export type ExecApprovalReplyDecision = ExecApprovalDecision;
export type ExecApprovalUnavailableReason = "initiating-platform-disabled" | "initiating-platform-unsupported" | "no-approval-route";
export type ExecApprovalReplyMetadata = {
    approvalId: string;
    approvalSlug: string;
    allowedDecisions?: readonly ExecApprovalReplyDecision[];
};
export type ExecApprovalActionDescriptor = {
    decision: ExecApprovalReplyDecision;
    label: string;
    style: NonNullable<InteractiveReplyButton["style"]>;
    command: string;
};
export type ExecApprovalPendingReplyParams = {
    warningText?: string;
    approvalId: string;
    approvalSlug: string;
    approvalCommandId?: string;
    ask?: string | null;
    allowedDecisions?: readonly ExecApprovalReplyDecision[];
    command: string;
    cwd?: string;
    host: ExecHost;
    nodeId?: string;
    expiresAtMs?: number;
    nowMs?: number;
};
export type ExecApprovalUnavailableReplyParams = {
    warningText?: string;
    channelLabel?: string;
    reason: ExecApprovalUnavailableReason;
    sentApproverDms?: boolean;
};
export declare function buildExecApprovalCommandText(params: {
    approvalCommandId: string;
    decision: ExecApprovalReplyDecision;
}): string;
export declare function buildExecApprovalActionDescriptors(params: {
    approvalCommandId: string;
    ask?: string | null;
    allowedDecisions?: readonly ExecApprovalReplyDecision[];
}): ExecApprovalActionDescriptor[];
export declare function buildApprovalInteractiveReply(params: {
    approvalId: string;
    ask?: string | null;
    allowedDecisions?: readonly ExecApprovalReplyDecision[];
}): InteractiveReply | undefined;
export declare function buildExecApprovalInteractiveReply(params: {
    approvalCommandId: string;
    ask?: string | null;
    allowedDecisions?: readonly ExecApprovalReplyDecision[];
}): InteractiveReply | undefined;
export declare function getExecApprovalApproverDmNoticeText(): string;
export declare function parseExecApprovalCommandText(raw: string): {
    approvalId: string;
    decision: ExecApprovalReplyDecision;
} | null;
export declare function formatExecApprovalExpiresIn(expiresAtMs: number, nowMs: number): string;
export declare function getExecApprovalReplyMetadata(payload: ReplyPayload): ExecApprovalReplyMetadata | null;
export declare function buildExecApprovalPendingReplyPayload(params: ExecApprovalPendingReplyParams): ReplyPayload;
export declare function buildExecApprovalUnavailableReplyPayload(params: ExecApprovalUnavailableReplyParams): ReplyPayload;
