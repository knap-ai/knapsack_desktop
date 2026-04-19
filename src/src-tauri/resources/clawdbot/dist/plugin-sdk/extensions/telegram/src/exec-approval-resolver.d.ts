import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ExecApprovalReplyDecision } from "openclaw/plugin-sdk/infra-runtime";
export type ResolveTelegramExecApprovalParams = {
    cfg: OpenClawConfig;
    approvalId: string;
    decision: ExecApprovalReplyDecision;
    senderId?: string | null;
    allowPluginFallback?: boolean;
    gatewayUrl?: string;
};
export declare function resolveTelegramExecApproval(params: ResolveTelegramExecApprovalParams): Promise<void>;
