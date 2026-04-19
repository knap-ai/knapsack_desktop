export declare const SessionCompactionCheckpointReasonSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"manual">, import("@sinclair/typebox").TLiteral<"auto-threshold">, import("@sinclair/typebox").TLiteral<"overflow-retry">, import("@sinclair/typebox").TLiteral<"timeout-retry">]>;
export declare const SessionCompactionTranscriptReferenceSchema: import("@sinclair/typebox").TObject<{
    sessionId: import("@sinclair/typebox").TString;
    sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const SessionCompactionCheckpointSchema: import("@sinclair/typebox").TObject<{
    checkpointId: import("@sinclair/typebox").TString;
    sessionKey: import("@sinclair/typebox").TString;
    sessionId: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TInteger;
    reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"manual">, import("@sinclair/typebox").TLiteral<"auto-threshold">, import("@sinclair/typebox").TLiteral<"overflow-retry">, import("@sinclair/typebox").TLiteral<"timeout-retry">]>;
    tokensBefore: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    tokensAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    summary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    firstKeptEntryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    preCompaction: import("@sinclair/typebox").TObject<{
        sessionId: import("@sinclair/typebox").TString;
        sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    postCompaction: import("@sinclair/typebox").TObject<{
        sessionId: import("@sinclair/typebox").TString;
        sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
}>;
export declare const SessionsListParamsSchema: import("@sinclair/typebox").TObject<{
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    activeMinutes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    includeGlobal: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    includeUnknown: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    /**
     * Read first 8KB of each session transcript to derive title from first user message.
     * Performs a file read per session - use `limit` to bound result set on large stores.
     */
    includeDerivedTitles: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    /**
     * Read last 16KB of each session transcript to extract most recent message preview.
     * Performs a file read per session - use `limit` to bound result set on large stores.
     */
    includeLastMessage: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    label: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    spawnedBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const SessionsPreviewParamsSchema: import("@sinclair/typebox").TObject<{
    keys: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    maxChars: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export declare const SessionsResolveParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sessionId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    label: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    spawnedBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    includeGlobal: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    includeUnknown: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export declare const SessionsCreateParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    label: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    model: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    parentSessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    task: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    message: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const SessionsSendParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    attachments: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TUnknown>>;
    timeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    idempotencyKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const SessionsMessagesSubscribeParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
}>;
export declare const SessionsMessagesUnsubscribeParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
}>;
export declare const SessionsAbortParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    runId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const SessionsPatchParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    label: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    thinkingLevel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    fastMode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TBoolean, import("@sinclair/typebox").TNull]>>;
    verboseLevel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    traceLevel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    reasoningLevel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    responseUsage: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"off">, import("@sinclair/typebox").TLiteral<"tokens">, import("@sinclair/typebox").TLiteral<"full">, import("@sinclair/typebox").TLiteral<"on">, import("@sinclair/typebox").TNull]>>;
    elevatedLevel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    execHost: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    execSecurity: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    execAsk: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    execNode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    model: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    spawnedBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    spawnedWorkspaceDir: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>>;
    spawnDepth: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TInteger, import("@sinclair/typebox").TNull]>>;
    subagentRole: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"orchestrator">, import("@sinclair/typebox").TLiteral<"leaf">, import("@sinclair/typebox").TNull]>>;
    subagentControlScope: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"children">, import("@sinclair/typebox").TLiteral<"none">, import("@sinclair/typebox").TNull]>>;
    sendPolicy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"allow">, import("@sinclair/typebox").TLiteral<"deny">, import("@sinclair/typebox").TNull]>>;
    groupActivation: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"mention">, import("@sinclair/typebox").TLiteral<"always">, import("@sinclair/typebox").TNull]>>;
}>;
export declare const SessionsResetParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"new">, import("@sinclair/typebox").TLiteral<"reset">]>>;
}>;
export declare const SessionsDeleteParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    deleteTranscript: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    emitLifecycleHooks: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export declare const SessionsCompactParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    maxLines: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export declare const SessionsCompactionListParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
}>;
export declare const SessionsCompactionGetParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    checkpointId: import("@sinclair/typebox").TString;
}>;
export declare const SessionsCompactionBranchParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    checkpointId: import("@sinclair/typebox").TString;
}>;
export declare const SessionsCompactionRestoreParamsSchema: import("@sinclair/typebox").TObject<{
    key: import("@sinclair/typebox").TString;
    checkpointId: import("@sinclair/typebox").TString;
}>;
export declare const SessionsCompactionListResultSchema: import("@sinclair/typebox").TObject<{
    ok: import("@sinclair/typebox").TLiteral<true>;
    key: import("@sinclair/typebox").TString;
    checkpoints: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        checkpointId: import("@sinclair/typebox").TString;
        sessionKey: import("@sinclair/typebox").TString;
        sessionId: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TInteger;
        reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"manual">, import("@sinclair/typebox").TLiteral<"auto-threshold">, import("@sinclair/typebox").TLiteral<"overflow-retry">, import("@sinclair/typebox").TLiteral<"timeout-retry">]>;
        tokensBefore: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        tokensAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        summary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        firstKeptEntryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        preCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        postCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
    }>>;
}>;
export declare const SessionsCompactionGetResultSchema: import("@sinclair/typebox").TObject<{
    ok: import("@sinclair/typebox").TLiteral<true>;
    key: import("@sinclair/typebox").TString;
    checkpoint: import("@sinclair/typebox").TObject<{
        checkpointId: import("@sinclair/typebox").TString;
        sessionKey: import("@sinclair/typebox").TString;
        sessionId: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TInteger;
        reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"manual">, import("@sinclair/typebox").TLiteral<"auto-threshold">, import("@sinclair/typebox").TLiteral<"overflow-retry">, import("@sinclair/typebox").TLiteral<"timeout-retry">]>;
        tokensBefore: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        tokensAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        summary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        firstKeptEntryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        preCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        postCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
    }>;
}>;
export declare const SessionsCompactionBranchResultSchema: import("@sinclair/typebox").TObject<{
    ok: import("@sinclair/typebox").TLiteral<true>;
    sourceKey: import("@sinclair/typebox").TString;
    key: import("@sinclair/typebox").TString;
    sessionId: import("@sinclair/typebox").TString;
    checkpoint: import("@sinclair/typebox").TObject<{
        checkpointId: import("@sinclair/typebox").TString;
        sessionKey: import("@sinclair/typebox").TString;
        sessionId: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TInteger;
        reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"manual">, import("@sinclair/typebox").TLiteral<"auto-threshold">, import("@sinclair/typebox").TLiteral<"overflow-retry">, import("@sinclair/typebox").TLiteral<"timeout-retry">]>;
        tokensBefore: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        tokensAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        summary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        firstKeptEntryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        preCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        postCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
    }>;
    entry: import("@sinclair/typebox").TObject<{
        sessionId: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TInteger;
    }>;
}>;
export declare const SessionsCompactionRestoreResultSchema: import("@sinclair/typebox").TObject<{
    ok: import("@sinclair/typebox").TLiteral<true>;
    key: import("@sinclair/typebox").TString;
    sessionId: import("@sinclair/typebox").TString;
    checkpoint: import("@sinclair/typebox").TObject<{
        checkpointId: import("@sinclair/typebox").TString;
        sessionKey: import("@sinclair/typebox").TString;
        sessionId: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TInteger;
        reason: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"manual">, import("@sinclair/typebox").TLiteral<"auto-threshold">, import("@sinclair/typebox").TLiteral<"overflow-retry">, import("@sinclair/typebox").TLiteral<"timeout-retry">]>;
        tokensBefore: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        tokensAfter: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        summary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        firstKeptEntryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        preCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
        postCompaction: import("@sinclair/typebox").TObject<{
            sessionId: import("@sinclair/typebox").TString;
            sessionFile: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            leafId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            entryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>;
    }>;
    entry: import("@sinclair/typebox").TObject<{
        sessionId: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TInteger;
    }>;
}>;
export declare const SessionsUsageParamsSchema: import("@sinclair/typebox").TObject<{
    /** Specific session key to analyze; if omitted returns all sessions. */
    key: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Start date for range filter (YYYY-MM-DD). */
    startDate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** End date for range filter (YYYY-MM-DD). */
    endDate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** How start/end dates should be interpreted. Defaults to UTC when omitted. */
    mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"utc">, import("@sinclair/typebox").TLiteral<"gateway">, import("@sinclair/typebox").TLiteral<"specific">]>>;
    /** UTC offset to use when mode is `specific` (for example, UTC-4 or UTC+5:30). */
    utcOffset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    /** Maximum sessions to return (default 50). */
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    /** Include context weight breakdown (systemPromptReport). */
    includeContextWeight: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
