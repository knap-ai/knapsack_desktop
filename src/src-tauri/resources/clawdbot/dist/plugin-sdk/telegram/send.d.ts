import type { InlineKeyboardMarkup } from "@grammyjs/types";
import { Bot } from "grammy";
import type { RetryConfig } from "../infra/retry.js";
import { loadConfig } from "../config/config.js";
type TelegramSendOpts = {
    token?: string;
    accountId?: string;
    verbose?: boolean;
    mediaUrl?: string;
    maxBytes?: number;
    api?: Bot["api"];
    retry?: RetryConfig;
    textMode?: "markdown" | "html";
    plainText?: string;
    /** Send audio as voice message (voice bubble) instead of audio file. Defaults to false. */
    asVoice?: boolean;
    /** Send video as video note (voice bubble) instead of regular video. Defaults to false. */
    asVideoNote?: boolean;
    /** Send message silently (no notification). Defaults to false. */
    silent?: boolean;
    /** Message ID to reply to (for threading) */
    replyToMessageId?: number;
    /** Quote text for Telegram reply_parameters. */
    quoteText?: string;
    /** Forum topic thread ID (for forum supergroups) */
    messageThreadId?: number;
    /** Inline keyboard buttons (reply markup). */
    buttons?: Array<Array<{
        text: string;
        callback_data: string;
    }>>;
};
type TelegramSendResult = {
    messageId: string;
    chatId: string;
};
type TelegramReactionOpts = {
    token?: string;
    accountId?: string;
    api?: Bot["api"];
    remove?: boolean;
    verbose?: boolean;
    retry?: RetryConfig;
};
export declare function buildInlineKeyboard(buttons?: TelegramSendOpts["buttons"]): InlineKeyboardMarkup | undefined;
export declare function sendMessageTelegram(to: string, text: string, opts?: TelegramSendOpts): Promise<TelegramSendResult>;
export declare function reactMessageTelegram(chatIdInput: string | number, messageIdInput: string | number, emoji: string, opts?: TelegramReactionOpts): Promise<{
    ok: true;
} | {
    ok: false;
    warning: string;
}>;
type TelegramDeleteOpts = {
    token?: string;
    accountId?: string;
    verbose?: boolean;
    api?: Bot["api"];
    retry?: RetryConfig;
};
export declare function deleteMessageTelegram(chatIdInput: string | number, messageIdInput: string | number, opts?: TelegramDeleteOpts): Promise<{
    ok: true;
}>;
type TelegramEditOpts = {
    token?: string;
    accountId?: string;
    verbose?: boolean;
    api?: Bot["api"];
    retry?: RetryConfig;
    textMode?: "markdown" | "html";
    /** Inline keyboard buttons (reply markup). Pass empty array to remove buttons. */
    buttons?: Array<Array<{
        text: string;
        callback_data: string;
    }>>;
    /** Optional config injection to avoid global loadConfig() (improves testability). */
    cfg?: ReturnType<typeof loadConfig>;
};
export declare function editMessageTelegram(chatIdInput: string | number, messageIdInput: string | number, text: string, opts?: TelegramEditOpts): Promise<{
    ok: true;
    messageId: string;
    chatId: string;
}>;
type TelegramStickerOpts = {
    token?: string;
    accountId?: string;
    verbose?: boolean;
    api?: Bot["api"];
    retry?: RetryConfig;
    /** Message ID to reply to (for threading) */
    replyToMessageId?: number;
    /** Forum topic thread ID (for forum supergroups) */
    messageThreadId?: number;
};
/**
 * Send a sticker to a Telegram chat by file_id.
 * @param to - Chat ID or username (e.g., "123456789" or "@username")
 * @param fileId - Telegram file_id of the sticker to send
 * @param opts - Optional configuration
 */
export declare function sendStickerTelegram(to: string, fileId: string, opts?: TelegramStickerOpts): Promise<TelegramSendResult>;
export {};
