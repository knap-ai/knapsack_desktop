export type TelegramTarget = {
    chatId: string;
    messageThreadId?: number;
};
export declare function stripTelegramInternalPrefixes(to: string): string;
/**
 * Parse a Telegram delivery target into chatId and optional topic/thread ID.
 *
 * Supported formats:
 * - `chatId` (plain chat ID, t.me link, @username, or internal prefixes like `telegram:...`)
 * - `chatId:topicId` (numeric topic/thread ID)
 * - `chatId:topic:topicId` (explicit topic marker; preferred)
 */
export declare function parseTelegramTarget(to: string): TelegramTarget;
