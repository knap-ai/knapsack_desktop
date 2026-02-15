import type { ChannelType, Client, Message } from "@buape/carbon";
export type DiscordMediaInfo = {
    path: string;
    contentType?: string;
    placeholder: string;
};
export type DiscordChannelInfo = {
    type: ChannelType;
    name?: string;
    topic?: string;
    parentId?: string;
    ownerId?: string;
};
export declare function __resetDiscordChannelInfoCacheForTest(): void;
export declare function resolveDiscordChannelInfo(client: Client, channelId: string): Promise<DiscordChannelInfo | null>;
export declare function resolveMediaList(message: Message, maxBytes: number): Promise<DiscordMediaInfo[]>;
export declare function resolveDiscordMessageText(message: Message, options?: {
    fallbackText?: string;
    includeForwarded?: boolean;
}): string;
export declare function buildDiscordMediaPayload(mediaList: Array<{
    path: string;
    contentType?: string;
}>): {
    MediaPath?: string;
    MediaType?: string;
    MediaUrl?: string;
    MediaPaths?: string[];
    MediaUrls?: string[];
    MediaTypes?: string[];
};
