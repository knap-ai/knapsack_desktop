import { type MemorySource } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
export type MemoryIndexMeta = {
    model: string;
    provider: string;
    providerKey?: string;
    sources?: MemorySource[];
    scopeHash?: string;
    chunkTokens: number;
    chunkOverlap: number;
    vectorDims?: number;
    ftsTokenizer?: string;
};
export declare function resolveConfiguredSourcesForMeta(sources: Iterable<MemorySource>): MemorySource[];
export declare function normalizeMetaSources(meta: MemoryIndexMeta): MemorySource[];
export declare function configuredMetaSourcesDiffer(params: {
    meta: MemoryIndexMeta;
    configuredSources: MemorySource[];
}): boolean;
export declare function resolveConfiguredScopeHash(params: {
    workspaceDir: string;
    extraPaths?: string[];
    multimodal: {
        enabled: boolean;
        modalities: string[];
        maxFileBytes: number;
    };
}): string;
export declare function shouldRunFullMemoryReindex(params: {
    meta: MemoryIndexMeta | null;
    provider: {
        id: string;
        model: string;
    } | null;
    providerKey?: string;
    configuredSources: MemorySource[];
    configuredScopeHash: string;
    chunkTokens: number;
    chunkOverlap: number;
    vectorReady: boolean;
    ftsTokenizer: string;
}): boolean;
