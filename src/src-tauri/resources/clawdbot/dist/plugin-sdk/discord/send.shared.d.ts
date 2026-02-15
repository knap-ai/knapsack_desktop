import type { RESTAPIPoll } from "discord-api-types/rest/v10";
import { RequestClient } from "@buape/carbon";
import type { ChunkMode } from "../auto-reply/chunk.js";
import type { RetryConfig } from "../infra/retry.js";
import { type RetryRunner } from "../infra/retry-policy.js";
import { type PollInput } from "../polls.js";
type DiscordRequest = RetryRunner;
type DiscordRecipient = {
    kind: "user";
    id: string;
} | {
    kind: "channel";
    id: string;
};
type DiscordClientOpts = {
    token?: string;
    accountId?: string;
    rest?: RequestClient;
    retry?: RetryConfig;
    verbose?: boolean;
};
declare function createDiscordClient(opts: DiscordClientOpts, cfg?: import("../config/types.openclaw.ts").OpenClawConfig): {
    token: string;
    rest: RequestClient;
    request: RetryRunner;
};
declare function resolveDiscordRest(opts: DiscordClientOpts): RequestClient;
declare function normalizeReactionEmoji(raw: string): string;
declare function parseRecipient(raw: string): DiscordRecipient;
/**
 * Parse and resolve Discord recipient, including username lookup.
 * This enables sending DMs by username (e.g., "john.doe") by querying
 * the Discord directory to resolve usernames to user IDs.
 *
 * @param raw - The recipient string (username, ID, or known format)
 * @param accountId - Discord account ID to use for directory lookup
 * @returns Parsed DiscordRecipient with resolved user ID if applicable
 */
export declare function parseAndResolveRecipient(raw: string, accountId?: string): Promise<DiscordRecipient>;
declare function normalizeStickerIds(raw: string[]): string[];
declare function normalizeEmojiName(raw: string, label: string): string;
declare function normalizeDiscordPollInput(input: PollInput): RESTAPIPoll;
declare function buildDiscordSendError(err: unknown, ctx: {
    channelId: string;
    rest: RequestClient;
    token: string;
    hasMedia: boolean;
}): Promise<unknown>;
declare function resolveChannelId(rest: RequestClient, recipient: DiscordRecipient, request: DiscordRequest): Promise<{
    channelId: string;
    dm?: boolean;
}>;
export declare function buildDiscordTextChunks(text: string, opts?: {
    maxLinesPerMessage?: number;
    chunkMode?: ChunkMode;
    maxChars?: number;
}): string[];
declare function sendDiscordText(rest: RequestClient, channelId: string, text: string, replyTo: string | undefined, request: DiscordRequest, maxLinesPerMessage?: number, embeds?: unknown[], chunkMode?: ChunkMode, silent?: boolean): Promise<{
    id: string;
    channel_id: string;
}>;
declare function sendDiscordMedia(rest: RequestClient, channelId: string, text: string, mediaUrl: string, replyTo: string | undefined, request: DiscordRequest, maxLinesPerMessage?: number, embeds?: unknown[], chunkMode?: ChunkMode, silent?: boolean): Promise<{
    id: string;
    channel_id: string;
}>;
declare function buildReactionIdentifier(emoji: {
    id?: string | null;
    name?: string | null;
}): string;
declare function formatReactionEmoji(emoji: {
    id?: string | null;
    name?: string | null;
}): string;
export { buildDiscordSendError, buildReactionIdentifier, createDiscordClient, formatReactionEmoji, normalizeDiscordPollInput, normalizeEmojiName, normalizeReactionEmoji, normalizeStickerIds, parseRecipient, resolveChannelId, resolveDiscordRest, sendDiscordMedia, sendDiscordText, };
