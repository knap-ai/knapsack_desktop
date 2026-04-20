import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { TelegramExecApprovalConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ExecApprovalRequest, PluginApprovalRequest } from "openclaw/plugin-sdk/infra-runtime";
import type { ReplyPayload } from "openclaw/plugin-sdk/reply-runtime";
export declare function resolveTelegramExecApprovalConfig(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): TelegramExecApprovalConfig | undefined;
export declare function getTelegramExecApprovalApprovers(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
export declare function isTelegramExecApprovalTargetRecipient(params: {
    cfg: OpenClawConfig;
    senderId?: string | null;
    accountId?: string | null;
}): boolean;
export declare const isTelegramExecApprovalClientEnabled: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}) => boolean;
export declare const isTelegramExecApprovalApprover: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
} & {
    senderId?: string | null;
}) => boolean;
export declare const isTelegramExecApprovalAuthorizedSender: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
} & {
    senderId?: string | null;
}) => boolean;
export declare const resolveTelegramExecApprovalTarget: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}) => "channel" | "dm" | "both";
export declare const shouldHandleTelegramExecApprovalRequest: (input: {
    cfg: OpenClawConfig;
    accountId?: string | null;
} & {
    request: ExecApprovalRequest | PluginApprovalRequest;
}) => boolean;
export declare function shouldInjectTelegramExecApprovalButtons(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    to: string;
}): boolean;
export declare function shouldEnableTelegramExecApprovalButtons(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    to: string;
}): boolean;
export declare function shouldSuppressLocalTelegramExecApprovalPrompt(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    payload: ReplyPayload;
}): boolean;
export declare function isTelegramExecApprovalHandlerConfigured(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): boolean;
