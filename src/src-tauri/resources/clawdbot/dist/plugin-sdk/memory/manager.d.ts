import type { OpenClawConfig } from "../config/config.js";
import type { MemoryEmbeddingProbeResult, MemoryProviderStatus, MemorySearchManager, MemorySearchResult, MemorySyncProgressUpdate } from "./types.js";
export declare class MemoryIndexManager implements MemorySearchManager {
    [key: string]: any;
    private readonly cacheKey;
    private readonly cfg;
    private readonly agentId;
    private readonly workspaceDir;
    private readonly settings;
    private provider;
    private readonly requestedProvider;
    private fallbackFrom?;
    private fallbackReason?;
    private openAi?;
    private gemini?;
    private voyage?;
    private batch;
    private batchFailureCount;
    private batchFailureLastError?;
    private batchFailureLastProvider?;
    private batchFailureLock;
    private db;
    private readonly sources;
    private providerKey;
    private readonly cache;
    private readonly vector;
    private readonly fts;
    private vectorReady;
    private watcher;
    private watchTimer;
    private sessionWatchTimer;
    private sessionUnsubscribe;
    private intervalTimer;
    private closed;
    private dirty;
    private sessionsDirty;
    private sessionsDirtyFiles;
    private sessionPendingFiles;
    private sessionDeltas;
    private sessionWarm;
    private syncing;
    static get(params: {
        cfg: OpenClawConfig;
        agentId: string;
    }): Promise<MemoryIndexManager | null>;
    private constructor();
    warmSession(sessionKey?: string): Promise<void>;
    search(query: string, opts?: {
        maxResults?: number;
        minScore?: number;
        sessionKey?: string;
    }): Promise<MemorySearchResult[]>;
    private searchVector;
    private buildFtsQuery;
    private searchKeyword;
    private mergeHybridResults;
    sync(params?: {
        reason?: string;
        force?: boolean;
        progress?: (update: MemorySyncProgressUpdate) => void;
    }): Promise<void>;
    readFile(params: {
        relPath: string;
        from?: number;
        lines?: number;
    }): Promise<{
        text: string;
        path: string;
    }>;
    status(): MemoryProviderStatus;
    probeVectorAvailability(): Promise<boolean>;
    probeEmbeddingAvailability(): Promise<MemoryEmbeddingProbeResult>;
    close(): Promise<void>;
}
