import type { MemorySearchResult } from "openclaw/plugin-sdk/memory-core-host-runtime-files";
import { deriveConceptTags, type ConceptTagScriptCoverage } from "./concept-vocabulary.js";
export declare const DEFAULT_PROMOTION_MIN_SCORE = 0.75;
export declare const DEFAULT_PROMOTION_MIN_RECALL_COUNT = 3;
export declare const DEFAULT_PROMOTION_MIN_UNIQUE_QUERIES = 2;
export type PromotionWeights = {
    frequency: number;
    relevance: number;
    diversity: number;
    recency: number;
    consolidation: number;
    conceptual: number;
};
export declare const DEFAULT_PROMOTION_WEIGHTS: PromotionWeights;
export type ShortTermRecallEntry = {
    key: string;
    path: string;
    startLine: number;
    endLine: number;
    source: "memory";
    snippet: string;
    recallCount: number;
    dailyCount: number;
    groundedCount: number;
    totalScore: number;
    maxScore: number;
    firstRecalledAt: string;
    lastRecalledAt: string;
    queryHashes: string[];
    recallDays: string[];
    conceptTags: string[];
    claimHash?: string;
    promotedAt?: string;
};
type ShortTermPhaseSignalEntry = {
    key: string;
    lightHits: number;
    remHits: number;
    lastLightAt?: string;
    lastRemAt?: string;
};
export type PromotionComponents = {
    frequency: number;
    relevance: number;
    diversity: number;
    recency: number;
    consolidation: number;
    conceptual: number;
};
export type PromotionCandidate = {
    key: string;
    path: string;
    startLine: number;
    endLine: number;
    source: "memory";
    snippet: string;
    recallCount: number;
    dailyCount?: number;
    groundedCount?: number;
    signalCount?: number;
    avgScore: number;
    maxScore: number;
    uniqueQueries: number;
    claimHash?: string;
    promotedAt?: string;
    firstRecalledAt: string;
    lastRecalledAt: string;
    ageDays: number;
    score: number;
    recallDays: string[];
    conceptTags: string[];
    components: PromotionComponents;
};
export type ShortTermAuditIssue = {
    severity: "warn" | "error";
    code: "recall-store-unreadable" | "recall-store-empty" | "recall-store-invalid" | "recall-lock-stale" | "recall-lock-unreadable" | "qmd-index-missing" | "qmd-index-empty" | "qmd-collections-empty";
    message: string;
    fixable: boolean;
};
export type ShortTermAuditSummary = {
    storePath: string;
    lockPath: string;
    updatedAt?: string;
    exists: boolean;
    entryCount: number;
    promotedCount: number;
    spacedEntryCount: number;
    conceptTaggedEntryCount: number;
    conceptTagScripts?: ConceptTagScriptCoverage;
    invalidEntryCount: number;
    issues: ShortTermAuditIssue[];
    qmd?: {
        dbPath?: string;
        collections?: number;
        dbBytes?: number;
    } | undefined;
};
export type RepairShortTermPromotionArtifactsResult = {
    changed: boolean;
    removedInvalidEntries: number;
    rewroteStore: boolean;
    removedStaleLock: boolean;
};
export type RankShortTermPromotionOptions = {
    workspaceDir: string;
    limit?: number;
    minScore?: number;
    minRecallCount?: number;
    minUniqueQueries?: number;
    maxAgeDays?: number;
    includePromoted?: boolean;
    recencyHalfLifeDays?: number;
    weights?: Partial<PromotionWeights>;
    nowMs?: number;
};
export type ApplyShortTermPromotionsOptions = {
    workspaceDir: string;
    candidates: PromotionCandidate[];
    limit?: number;
    minScore?: number;
    minRecallCount?: number;
    minUniqueQueries?: number;
    maxAgeDays?: number;
    nowMs?: number;
    timezone?: string;
};
export type ApplyShortTermPromotionsResult = {
    memoryPath: string;
    applied: number;
    appended: number;
    reconciledExisting: number;
    appliedCandidates: PromotionCandidate[];
};
declare function isContaminatedDreamingSnippet(raw: string): boolean;
declare function buildClaimHash(snippet: string): string;
declare function totalSignalCountForEntry(entry: {
    recallCount?: number;
    dailyCount?: number;
    groundedCount?: number;
}): number;
declare function calculateConsolidationComponent(recallDays: string[]): number;
declare function calculatePhaseSignalBoost(entry: ShortTermPhaseSignalEntry | undefined, nowMs: number): number;
declare function parseLockOwnerPid(raw: string): number | null;
declare function isProcessLikelyAlive(pid: number): boolean;
declare function canStealStaleLock(lockPath: string): Promise<boolean>;
export declare function isShortTermMemoryPath(filePath: string): boolean;
export declare function recordShortTermRecalls(params: {
    workspaceDir?: string;
    query: string;
    results: MemorySearchResult[];
    signalType?: "recall" | "daily";
    dedupeByQueryPerDay?: boolean;
    dayBucket?: string;
    nowMs?: number;
    timezone?: string;
}): Promise<void>;
export declare function recordGroundedShortTermCandidates(params: {
    workspaceDir?: string;
    query: string;
    items: Array<{
        path: string;
        startLine: number;
        endLine: number;
        snippet: string;
        score: number;
        query?: string;
        signalCount?: number;
        dayBucket?: string;
    }>;
    dedupeByQueryPerDay?: boolean;
    dayBucket?: string;
    nowMs?: number;
    timezone?: string;
}): Promise<void>;
export declare function recordDreamingPhaseSignals(params: {
    workspaceDir?: string;
    phase: "light" | "rem";
    keys: string[];
    nowMs?: number;
}): Promise<void>;
export declare function rankShortTermPromotionCandidates(options: RankShortTermPromotionOptions): Promise<PromotionCandidate[]>;
export declare function readShortTermRecallEntries(params: {
    workspaceDir: string;
    nowMs?: number;
}): Promise<ShortTermRecallEntry[]>;
export declare function applyShortTermPromotions(options: ApplyShortTermPromotionsOptions): Promise<ApplyShortTermPromotionsResult>;
export declare function resolveShortTermRecallStorePath(workspaceDir: string): string;
export declare function resolveShortTermPhaseSignalStorePath(workspaceDir: string): string;
export declare function resolveShortTermRecallLockPath(workspaceDir: string): string;
export declare function auditShortTermPromotionArtifacts(params: {
    workspaceDir: string;
    qmd?: {
        dbPath?: string;
        collections?: number;
    };
}): Promise<ShortTermAuditSummary>;
export declare function repairShortTermPromotionArtifacts(params: {
    workspaceDir: string;
}): Promise<RepairShortTermPromotionArtifactsResult>;
export declare function removeGroundedShortTermCandidates(params: {
    workspaceDir: string;
}): Promise<{
    removed: number;
    storePath: string;
}>;
export declare const __testing: {
    parseLockOwnerPid: typeof parseLockOwnerPid;
    canStealStaleLock: typeof canStealStaleLock;
    isProcessLikelyAlive: typeof isProcessLikelyAlive;
    deriveConceptTags: typeof deriveConceptTags;
    calculateConsolidationComponent: typeof calculateConsolidationComponent;
    calculatePhaseSignalBoost: typeof calculatePhaseSignalBoost;
    buildClaimHash: typeof buildClaimHash;
    totalSignalCountForEntry: typeof totalSignalCountForEntry;
    isContaminatedDreamingSnippet: typeof isContaminatedDreamingSnippet;
};
export {};
