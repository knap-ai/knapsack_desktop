import { type OpenClawConfig } from "openclaw/plugin-sdk/memory-core-host-engine-foundation";
import { type MemoryEmbeddingProbeResult, type MemoryProviderStatus, type MemorySearchManager, type MemorySearchResult, type MemorySyncProgressUpdate, type ResolvedMemoryBackendConfig } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
type QmdManagerMode = "full" | "status";
export declare class QmdMemoryManager implements MemorySearchManager {
    static create(params: {
        cfg: OpenClawConfig;
        agentId: string;
        resolved: ResolvedMemoryBackendConfig;
        mode?: QmdManagerMode;
    }): Promise<QmdMemoryManager | null>;
    private readonly cfg;
    private readonly agentId;
    private readonly qmd;
    private readonly workspaceDir;
    private readonly stateDir;
    private readonly agentStateDir;
    private readonly qmdDir;
    private readonly xdgConfigHome;
    private readonly xdgCacheHome;
    private readonly indexPath;
    private readonly env;
    private readonly syncSettings;
    private readonly managedCollectionNames;
    private readonly collectionRoots;
    private readonly sources;
    private readonly docPathCache;
    private readonly exportedSessionState;
    private readonly maxQmdOutputChars;
    private readonly sessionExporter;
    private updateTimer;
    private embedTimer;
    private watcher;
    private watchTimer;
    private pendingUpdate;
    private queuedForcedUpdate;
    private queuedForcedRuns;
    private dirty;
    private closed;
    private db;
    private lastUpdateAt;
    private lastEmbedAt;
    private embedBackoffUntil;
    private embedFailureCount;
    private vectorAvailable;
    private vectorStatusDetail;
    private attemptedNullByteCollectionRepair;
    private attemptedDuplicateDocumentRepair;
    private readonly sessionWarm;
    private collectionPatternFlag;
    private constructor();
    private initialize;
    private bootstrapCollections;
    private ensureCollections;
    private listCollectionsBestEffort;
    private findCollectionByPathPattern;
    private tryRebindConflictingCollection;
    private migrateLegacyUnscopedCollections;
    private deriveLegacyCollectionName;
    private canMigrateLegacyCollection;
    private ensureCollectionPath;
    private isDirectoryGlobPattern;
    private isCollectionAlreadyExistsError;
    private isCollectionMissingError;
    private isMissingCollectionSearchError;
    private tryRepairMissingCollectionSearch;
    private addCollection;
    private removeCollection;
    private parseListedCollections;
    private shouldRebindCollection;
    private pathsMatch;
    private shouldRepairNullByteCollectionError;
    private shouldRepairDuplicateDocumentConstraint;
    private rebuildManagedCollectionsForRepair;
    private tryRepairNullByteCollections;
    private tryRepairDuplicateDocumentConstraint;
    search(query: string, opts?: {
        maxResults?: number;
        minScore?: number;
        sessionKey?: string;
    }): Promise<MemorySearchResult[]>;
    sync(params?: {
        reason?: string;
        force?: boolean;
        sessionFiles?: string[];
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
    probeEmbeddingAvailability(): Promise<MemoryEmbeddingProbeResult>;
    probeVectorAvailability(): Promise<boolean>;
    close(): Promise<void>;
    private runUpdate;
    private ensureWatcher;
    private resolveCollectionWatchPath;
    private scheduleWatchSync;
    private maybeWarmSession;
    private maybeSyncDirtySearchState;
    private runQmdUpdateWithRetry;
    private runQmdUpdateOnce;
    private isRetryableUpdateError;
    private shouldRunEmbed;
    private shouldScheduleEmbedTimer;
    private resolveEmbedStartupJitterMs;
    private withQmdEmbedLock;
    private noteEmbedFailure;
    private enqueueForcedUpdate;
    private drainForcedUpdates;
    /**
     * Symlink the default QMD models directory into our custom XDG_CACHE_HOME so
     * that the pre-installed ML models (~/.cache/qmd/models/) are reused rather
     * than re-downloaded for every agent.  If the default models directory does
     * not exist, or a models directory/symlink already exists in the target, this
     * is a no-op.
     */
    private symlinkSharedModels;
    private runQmd;
    /**
     * QMD 1.1+ unified all search modes under a single "query" MCP tool
     * that accepts a `searches` array with typed sub-queries (lex, vec, hyde).
     * QMD <1.1 exposed separate tools: search, vector_search, deep_search.
     *
     * This method probes the MCP server once to detect which interface is
     * available and caches the result for subsequent calls.
     */
    private qmdMcpToolVersion;
    private resolveQmdMcpTool;
    private markQmdV1Fallback;
    private markQmdV2;
    /**
     * Build the `searches` array for QMD 1.1+ `query` tool, respecting
     * the configured searchMode so lexical-only or vector-only modes
     * don't trigger unnecessary LLM/embedding work.
     */
    private buildV2Searches;
    private isQueryToolNotFoundError;
    private ensureMcporterDaemonStarted;
    private runMcporter;
    private runQmdSearchViaMcporter;
    private readPartialText;
    private readFullText;
    private ensureDb;
    private exportSessions;
    private renderSessionMarkdown;
    private pickSessionCollectionName;
    private sanitizeCollectionNameSegment;
    private resolveDocLocation;
    private resolveDocLocationFromHints;
    private resolveIndexedDocLocationFromHint;
    private normalizeDocHints;
    private parseQmdFileUri;
    private toCollectionRelativePath;
    private pickDocLocation;
    private matchesPreferredFileHint;
    private normalizeQmdLookupPath;
    private normalizeQmdLookupSegment;
    private extractSnippetLines;
    private resolveSnippetLines;
    private normalizeSnippetLine;
    private parseSnippetHeaderLines;
    private readCounts;
    private logScopeDenied;
    private isScopeAllowed;
    private toDocLocation;
    private buildSearchPath;
    private isInsideWorkspace;
    private resolveReadPath;
    private isWithinWorkspace;
    private isWithinRoot;
    private clampResultsByInjectedChars;
    private diversifyResultsBySource;
    private shouldSkipUpdate;
    private isSqliteBusyError;
    private isUnsupportedQmdOptionError;
    private createQmdBusyError;
    private waitForPendingUpdateBeforeSearch;
    private runQueryAcrossCollections;
    private buildQmdResultKey;
    private runMcporterAcrossCollections;
    private listManagedCollectionNames;
    private computeManagedCollectionNames;
    private buildCollectionFilterArgs;
    private buildSearchArgs;
}
export {};
