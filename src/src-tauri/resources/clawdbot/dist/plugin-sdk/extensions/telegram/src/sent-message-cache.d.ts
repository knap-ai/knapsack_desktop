export declare function recordSentMessage(chatId: number | string, messageId: number): void;
export declare function wasSentByBot(chatId: number | string, messageId: number): boolean;
export declare function clearSentMessageCache(): void;
export declare function resetSentMessageCacheForTest(): void;
