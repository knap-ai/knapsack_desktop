import type { ExecApprovalReplyDecision } from "openclaw/plugin-sdk/approval-runtime";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { isApprovalNotFoundError } from "openclaw/plugin-sdk/error-runtime";
export { isApprovalNotFoundError };
export declare function resolveMatrixApproval(params: {
    cfg: OpenClawConfig;
    approvalId: string;
    decision: ExecApprovalReplyDecision;
    senderId?: string | null;
    gatewayUrl?: string;
}): Promise<void>;
