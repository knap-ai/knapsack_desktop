import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export { cacheSticker, getAllCachedStickers, getCachedSticker, getCacheStats, searchStickers, type CachedSticker, } from "./sticker-cache-store.js";
export interface DescribeStickerParams {
    imagePath: string;
    cfg: OpenClawConfig;
    agentDir?: string;
    agentId?: string;
}
/**
 * Describe a sticker image using vision API.
 * Auto-detects an available vision provider based on configured API keys.
 * Returns null if no vision provider is available.
 */
export declare function describeStickerImage(params: DescribeStickerParams): Promise<string | null>;
