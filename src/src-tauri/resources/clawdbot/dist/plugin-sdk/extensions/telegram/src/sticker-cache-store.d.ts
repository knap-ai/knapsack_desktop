export interface CachedSticker {
    fileId: string;
    fileUniqueId: string;
    emoji?: string;
    setName?: string;
    description: string;
    cachedAt: string;
    receivedFrom?: string;
}
/**
 * Get a cached sticker by its unique ID.
 */
export declare function getCachedSticker(fileUniqueId: string): CachedSticker | null;
/**
 * Add or update a sticker in the cache.
 */
export declare function cacheSticker(sticker: CachedSticker): void;
/**
 * Search cached stickers by text query (fuzzy match on description + emoji + setName).
 */
export declare function searchStickers(query: string, limit?: number): CachedSticker[];
/**
 * Get all cached stickers (for debugging/listing).
 */
export declare function getAllCachedStickers(): CachedSticker[];
/**
 * Get cache statistics.
 */
export declare function getCacheStats(): {
    count: number;
    oldestAt?: string;
    newestAt?: string;
};
