import { loadConfig } from "../../config/config.js";
type IMessageRuntimeSendOpts = {
    config?: ReturnType<typeof loadConfig>;
    mediaUrl?: string;
    mediaLocalRoots?: readonly string[];
    accountId?: string;
    replyToId?: string;
};
export declare const runtimeSend: {
    sendMessage: (to: string, text: string, opts?: IMessageRuntimeSendOpts) => Promise<import("../../plugin-sdk/twitch.ts").OutboundDeliveryResult>;
};
export {};
