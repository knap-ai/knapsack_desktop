import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ExecApprovalRequest, PluginApprovalRequest } from "openclaw/plugin-sdk/infra-runtime";
import type { ReplyPayload } from "openclaw/plugin-sdk/reply-runtime";
import { normalizeMatrixApproverId } from "./approval-ids.js";
type ApprovalRequest = ExecApprovalRequest | PluginApprovalRequest;
type ApprovalKind = "exec" | "plugin";
export { normalizeMatrixApproverId };
export declare function getMatrixExecApprovalApprovers(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
export declare function getMatrixApprovalApprovers(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    approvalKind: ApprovalKind;
}): string[];
export declare function isMatrixExecApprovalTargetRecipient(params: {
    cfg: OpenClawConfig;
    senderId?: string | null;
    accountId?: string | null;
}): boolean;
export declare const isMatrixExecApprovalClientEnabled: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}) => boolean;
export declare const isMatrixExecApprovalApprover: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
} & {
    senderId?: string | null;
}) => boolean;
export declare const isMatrixExecApprovalAuthorizedSender: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
} & {
    senderId?: string | null;
}) => boolean;
export declare const resolveMatrixExecApprovalTarget: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}) => "channel" | "dm" | "both";
export declare const shouldHandleMatrixExecApprovalRequest: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
} & {
    request: ExecApprovalRequest | PluginApprovalRequest;
}) => boolean;
export declare function isMatrixApprovalClientEnabled(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    approvalKind: ApprovalKind;
}): boolean;
export declare function isMatrixAnyApprovalClientEnabled(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): boolean;
export declare function shouldHandleMatrixApprovalRequest(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    request: ApprovalRequest;
}): boolean;
export declare function shouldSuppressLocalMatrixExecApprovalPrompt(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    payload: ReplyPayload;
}): boolean;
