export type PluginLruCacheResult<T> = {
    hit: true;
    value: T;
} | {
    hit: false;
};
export declare class PluginLruCache<T> {
    #private;
    constructor(defaultMaxEntries: number);
    get maxEntries(): number;
    get size(): number;
    setMaxEntriesForTest(value?: number): void;
    clear(): void;
    get(cacheKey: string): T | undefined;
    getResult(cacheKey: string): PluginLruCacheResult<T>;
    set(cacheKey: string, value: T): void;
}
