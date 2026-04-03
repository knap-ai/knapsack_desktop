import type { OutboundMediaAccess } from "../media/load-options.js";
import type { DiscordSendResult } from "./discord.js";
type DiscordSendOptionInput = {
    replyToId?: string | null;
    accountId?: string | null;
    silent?: boolean;
};
type DiscordSendMediaOptionInput = DiscordSendOptionInput & {
    mediaUrl?: string;
    mediaAccess?: OutboundMediaAccess;
    mediaLocalRoots?: readonly string[];
    mediaReadFile?: (filePath: string) => Promise<Buffer>;
};
/** Build the common Discord send options from SDK-level reply payload fields. */
export declare function buildDiscordSendOptions(input: DiscordSendOptionInput): {
    verbose: boolean;
    replyTo: string | undefined;
    accountId: string | undefined;
    silent: boolean | undefined;
};
/** Extend the base Discord send options with media-specific fields. */
export declare function buildDiscordSendMediaOptions(input: DiscordSendMediaOptionInput): {
    mediaUrl: string | undefined;
    mediaAccess: OutboundMediaAccess | undefined;
    mediaLocalRoots: readonly string[] | undefined;
    mediaReadFile: ((filePath: string) => Promise<Buffer>) | undefined;
    verbose: boolean;
    replyTo: string | undefined;
    accountId: string | undefined;
    silent: boolean | undefined;
};
/** Stamp raw Discord send results with the channel id expected by shared outbound flows. */
export declare function tagDiscordChannelResult(result: DiscordSendResult): {
    channel: string;
} & import("@openclaw/discord/api.ts").DiscordSendResult;
export {};
