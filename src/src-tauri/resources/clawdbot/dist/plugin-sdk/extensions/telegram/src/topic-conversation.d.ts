export type ParsedTelegramTopicConversation = {
    chatId: string;
    topicId: string;
    canonicalConversationId: string;
};
export declare function parseTelegramTopicConversation(params: {
    conversationId: string;
    parentConversationId?: string;
}): ParsedTelegramTopicConversation | null;
