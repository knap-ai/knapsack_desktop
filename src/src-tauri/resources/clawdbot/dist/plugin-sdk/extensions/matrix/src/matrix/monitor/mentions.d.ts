import type { RoomMessageEventContent } from "./types.js";
export declare function resolveMentions(params: {
    content: RoomMessageEventContent;
    userId?: string | null;
    displayName?: string | null;
    text?: string;
    mentionRegexes: RegExp[];
}): {
    wasMentioned: boolean;
    hasExplicitMention: boolean;
};
