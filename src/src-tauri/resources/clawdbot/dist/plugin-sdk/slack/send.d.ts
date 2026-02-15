import { type WebClient } from "@slack/web-api";
type SlackSendOpts = {
    token?: string;
    accountId?: string;
    mediaUrl?: string;
    client?: WebClient;
    threadTs?: string;
};
export type SlackSendResult = {
    messageId: string;
    channelId: string;
};
export declare function sendMessageSlack(to: string, message: string, opts?: SlackSendOpts): Promise<SlackSendResult>;
export {};
