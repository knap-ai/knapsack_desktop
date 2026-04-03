import { loadConfig } from "../../config/config.js";
type TelegramRuntimeSendOpts = {
    cfg?: ReturnType<typeof loadConfig>;
    mediaUrl?: string;
    mediaLocalRoots?: readonly string[];
    accountId?: string;
    messageThreadId?: string | number;
    replyToMessageId?: string | number;
    silent?: boolean;
    forceDocument?: boolean;
    gatewayClientScopes?: readonly string[];
};
export declare const runtimeSend: {
    sendMessage: (to: string, text: string, opts?: TelegramRuntimeSendOpts) => Promise<import("../../plugin-sdk/twitch.ts").OutboundDeliveryResult>;
};
export {};
