import type { ExecApprovalReplyDecision } from "openclaw/plugin-sdk/approval-runtime";
export type MatrixApprovalReactionBinding = {
    decision: ExecApprovalReplyDecision;
    emoji: string;
    label: string;
};
export type MatrixApprovalReactionResolution = {
    approvalId: string;
    decision: ExecApprovalReplyDecision;
};
export declare function listMatrixApprovalReactionBindings(allowedDecisions: readonly ExecApprovalReplyDecision[]): MatrixApprovalReactionBinding[];
export declare function buildMatrixApprovalReactionHint(allowedDecisions: readonly ExecApprovalReplyDecision[]): string | null;
export declare function resolveMatrixApprovalReactionDecision(reactionKey: string, allowedDecisions: readonly ExecApprovalReplyDecision[]): ExecApprovalReplyDecision | null;
export declare function registerMatrixApprovalReactionTarget(params: {
    roomId: string;
    eventId: string;
    approvalId: string;
    allowedDecisions: readonly ExecApprovalReplyDecision[];
}): void;
export declare function unregisterMatrixApprovalReactionTarget(params: {
    roomId: string;
    eventId: string;
}): void;
export declare function resolveMatrixApprovalReactionTarget(params: {
    roomId: string;
    eventId: string;
    reactionKey: string;
}): MatrixApprovalReactionResolution | null;
export declare function clearMatrixApprovalReactionTargetsForTest(): void;
