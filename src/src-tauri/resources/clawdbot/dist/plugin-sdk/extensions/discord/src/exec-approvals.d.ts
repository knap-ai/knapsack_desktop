import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { DiscordExecApprovalConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ReplyPayload } from "openclaw/plugin-sdk/reply-runtime";
export declare function getDiscordExecApprovalApprovers(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    configOverride?: DiscordExecApprovalConfig | null;
}): string[];
export declare function isDiscordExecApprovalClientEnabled(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    configOverride?: DiscordExecApprovalConfig | null;
}): boolean;
export declare function isDiscordExecApprovalApprover(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    senderId?: string | null;
    configOverride?: DiscordExecApprovalConfig | null;
}): boolean;
export declare function shouldSuppressLocalDiscordExecApprovalPrompt(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    payload: ReplyPayload;
}): boolean;
