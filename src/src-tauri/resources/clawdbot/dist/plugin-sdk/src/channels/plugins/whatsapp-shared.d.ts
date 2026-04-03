import type { OpenClawConfig } from "../../config/config.js";
import type { PollInput } from "../../polls.js";
import type { ChannelOutboundAdapter } from "./types.js";
export declare const WHATSAPP_GROUP_INTRO_HINT = "WhatsApp IDs: SenderId is the participant JID (group participant id).";
export declare function resolveWhatsAppGroupIntroHint(): string;
export declare function resolveWhatsAppMentionStripRegexes(ctx: {
    To?: string | null;
}): RegExp[];
type WhatsAppChunker = NonNullable<ChannelOutboundAdapter["chunker"]>;
type WhatsAppSendMessage = (to: string, body: string, options: {
    verbose: boolean;
    cfg?: OpenClawConfig;
    mediaUrl?: string;
    mediaAccess?: {
        localRoots?: readonly string[];
        readFile?: (filePath: string) => Promise<Buffer>;
    };
    mediaLocalRoots?: readonly string[];
    mediaReadFile?: (filePath: string) => Promise<Buffer>;
    gifPlayback?: boolean;
    accountId?: string;
}) => Promise<{
    messageId: string;
    toJid: string;
}>;
type WhatsAppSendPoll = (to: string, poll: PollInput, options: {
    verbose: boolean;
    accountId?: string;
    cfg?: OpenClawConfig;
}) => Promise<{
    messageId: string;
    toJid: string;
}>;
type CreateWhatsAppOutboundBaseParams = {
    chunker: WhatsAppChunker;
    sendMessageWhatsApp: WhatsAppSendMessage;
    sendPollWhatsApp: WhatsAppSendPoll;
    shouldLogVerbose: () => boolean;
    resolveTarget: ChannelOutboundAdapter["resolveTarget"];
    normalizeText?: (text: string | undefined) => string;
    skipEmptyText?: boolean;
};
export declare function createWhatsAppOutboundBase({ chunker, sendMessageWhatsApp, sendPollWhatsApp, shouldLogVerbose, resolveTarget, normalizeText, skipEmptyText, }: CreateWhatsAppOutboundBaseParams): Pick<ChannelOutboundAdapter, "deliveryMode" | "chunker" | "chunkerMode" | "textChunkLimit" | "pollMaxOptions" | "resolveTarget" | "sendText" | "sendMedia" | "sendPoll">;
export {};
