export type InlineDirectiveParseResult = {
    text: string;
    audioAsVoice: boolean;
    replyToId?: string;
    replyToExplicitId?: string;
    replyToCurrent: boolean;
    hasAudioTag: boolean;
    hasReplyTag: boolean;
};
type InlineDirectiveParseOptions = {
    currentMessageId?: string;
    stripAudioTag?: boolean;
    stripReplyTags?: boolean;
};
export declare function parseInlineDirectives(text?: string, options?: InlineDirectiveParseOptions): InlineDirectiveParseResult;
export {};
