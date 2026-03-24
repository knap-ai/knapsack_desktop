import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { TelegramInlineButtonsScope } from "openclaw/plugin-sdk/config-runtime";
export declare function resolveTelegramInlineButtonsScope(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): TelegramInlineButtonsScope;
export declare function isTelegramInlineButtonsEnabled(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): boolean;
export { resolveTelegramTargetChatType } from "./targets.js";
