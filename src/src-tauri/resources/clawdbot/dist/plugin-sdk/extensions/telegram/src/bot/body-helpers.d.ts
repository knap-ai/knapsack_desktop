import type { Chat, Message } from "@grammyjs/types";
import type { NormalizedLocation } from "openclaw/plugin-sdk/channel-inbound";
export declare function buildSenderName(msg: Message): string | undefined;
export declare function resolveTelegramMediaPlaceholder(msg: Pick<Message, "photo" | "video" | "video_note" | "audio" | "voice" | "document" | "sticker"> | undefined | null): string | undefined;
export declare function buildSenderLabel(msg: Message, senderId?: number | string): string;
export type TelegramTextEntity = NonNullable<Message["entities"]>[number];
export declare function getTelegramTextParts(msg: Pick<Message, "text" | "caption" | "entities" | "caption_entities">): {
    text: string;
    entities: TelegramTextEntity[];
};
export declare function hasBotMention(msg: Message, botUsername: string): boolean;
type TelegramTextLinkEntity = {
    type: string;
    offset: number;
    length: number;
    url?: string;
};
export declare function expandTextLinks(text: string, entities?: TelegramTextLinkEntity[] | null): string;
export type TelegramForwardedContext = {
    from: string;
    date?: number;
    fromType: string;
    fromId?: string;
    fromUsername?: string;
    fromTitle?: string;
    fromSignature?: string;
    fromChatType?: Chat["type"];
    fromMessageId?: number;
};
export declare function normalizeForwardedContext(msg: Message): TelegramForwardedContext | null;
export declare function extractTelegramLocation(msg: Message): NormalizedLocation | null;
export {};
