import type { TelegramAccountConfig, TelegramDirectConfig, TelegramGroupConfig, TelegramTopicConfig } from "openclaw/plugin-sdk/config-runtime";
export type TelegramErrorPolicy = "always" | "once" | "silent";
export declare function resolveTelegramErrorPolicy(params: {
    accountConfig?: TelegramAccountConfig;
    groupConfig?: TelegramDirectConfig | TelegramGroupConfig;
    topicConfig?: TelegramTopicConfig;
}): {
    policy: TelegramErrorPolicy;
    cooldownMs: number;
};
export declare function buildTelegramErrorScopeKey(params: {
    accountId: string;
    chatId: string | number;
    threadId?: string | number | null;
}): string;
export declare function shouldSuppressTelegramError(params: {
    scopeKey: string;
    cooldownMs: number;
    errorMessage?: string;
}): boolean;
export declare function isSilentErrorPolicy(policy: TelegramErrorPolicy): boolean;
export declare function resetTelegramErrorPolicyStoreForTest(): void;
