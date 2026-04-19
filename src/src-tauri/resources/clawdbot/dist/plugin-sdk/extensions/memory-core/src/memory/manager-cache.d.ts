type Closable = {
    close?: () => Promise<void> | void;
};
export type ManagedCache<T> = {
    cache: Map<string, T>;
    pending: Map<string, Promise<T>>;
};
export declare function resolveSingletonManagedCache<T>(cacheKey: symbol): ManagedCache<T>;
export declare function getOrCreateManagedCacheEntry<T>(params: {
    cache: Map<string, T>;
    pending: Map<string, Promise<T>>;
    key: string;
    bypassCache?: boolean;
    create: () => Promise<T> | T;
}): Promise<T>;
export declare function closeManagedCacheEntries<T extends Closable>(params: {
    cache: Map<string, T>;
    pending: Map<string, Promise<T>>;
    onCloseError?: (err: unknown) => void;
}): Promise<void>;
export {};
