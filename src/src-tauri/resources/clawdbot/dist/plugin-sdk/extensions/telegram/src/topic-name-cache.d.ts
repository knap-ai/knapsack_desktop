export type TopicEntry = {
    name: string;
    iconColor?: number;
    iconCustomEmojiId?: string;
    closed?: boolean;
    updatedAt: number;
};
export declare function resolveTopicNameCachePath(storePath: string): string;
export declare function updateTopicName(chatId: number | string, threadId: number | string, patch: Partial<Omit<TopicEntry, "updatedAt">>, persistedPath?: string): void;
export declare function getTopicName(chatId: number | string, threadId: number | string, persistedPath?: string): string | undefined;
export declare function getTopicEntry(chatId: number | string, threadId: number | string, persistedPath?: string): TopicEntry | undefined;
export declare function clearTopicNameCache(): void;
export declare function topicNameCacheSize(): number;
export declare function resetTopicNameCacheForTest(): void;
