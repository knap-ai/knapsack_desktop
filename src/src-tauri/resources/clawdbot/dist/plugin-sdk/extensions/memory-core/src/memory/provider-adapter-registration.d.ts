type AdapterLike = {
    id: string;
};
export declare function filterUnregisteredMemoryEmbeddingProviderAdapters<T extends AdapterLike>(params: {
    builtinAdapters: readonly T[];
    registeredAdapters: readonly AdapterLike[];
}): T[];
export {};
