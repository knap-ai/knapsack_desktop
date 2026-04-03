type CacheRetention = "none" | "short" | "long";
export declare function resolveCacheRetention(extraParams: Record<string, unknown> | undefined, provider: string, modelApi?: string): CacheRetention | undefined;
export {};
