import type { OpenClawConfig } from "./runtime-api.js";
import { type BlueBubblesAttachment } from "./types.js";
export type BlueBubblesAttachmentOpts = {
    serverUrl?: string;
    password?: string;
    accountId?: string;
    timeoutMs?: number;
    cfg?: OpenClawConfig;
};
/**
 * Fetch attachment metadata for a message from the BlueBubbles API.
 *
 * BlueBubbles sometimes fires the `new-message` webhook before attachment
 * indexing is complete, so `attachments` arrives as `[]`. This function
 * GETs the message by GUID and returns whatever attachments the server
 * has indexed by now. (#65430, #67437)
 */
export declare function fetchBlueBubblesMessageAttachments(messageGuid: string, opts: {
    baseUrl: string;
    password: string;
    timeoutMs?: number;
    allowPrivateNetwork?: boolean;
}): Promise<BlueBubblesAttachment[]>;
export declare function downloadBlueBubblesAttachment(attachment: BlueBubblesAttachment, opts?: BlueBubblesAttachmentOpts & {
    maxBytes?: number;
}): Promise<{
    buffer: Uint8Array;
    contentType?: string;
}>;
export type SendBlueBubblesAttachmentResult = {
    messageId: string;
};
/**
 * Send an attachment via BlueBubbles API.
 * Supports sending media files (images, videos, audio, documents) to a chat.
 * When asVoice is true, expects MP3/CAF audio and marks it as an iMessage voice memo.
 */
export declare function sendBlueBubblesAttachment(params: {
    to: string;
    buffer: Uint8Array;
    filename: string;
    contentType?: string;
    caption?: string;
    replyToMessageGuid?: string;
    replyToPartIndex?: number;
    asVoice?: boolean;
    opts?: BlueBubblesAttachmentOpts;
}): Promise<SendBlueBubblesAttachmentResult>;
