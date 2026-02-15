export declare const SessionsListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    limit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    activeMinutes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    includeGlobal: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    includeUnknown: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    /**
     * Read first 8KB of each session transcript to derive title from first user message.
     * Performs a file read per session - use `limit` to bound result set on large stores.
     */
    includeDerivedTitles: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    /**
     * Read last 16KB of each session transcript to extract most recent message preview.
     * Performs a file read per session - use `limit` to bound result set on large stores.
     */
    includeLastMessage: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    spawnedBy: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    search: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const SessionsPreviewParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    keys: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    limit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    maxChars: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const SessionsResolveParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    key: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    sessionId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    spawnedBy: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    includeGlobal: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    includeUnknown: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const SessionsPatchParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    key: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    thinkingLevel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    verboseLevel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    reasoningLevel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    responseUsage: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"off">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"tokens">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"full">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"on">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    elevatedLevel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    execHost: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    execSecurity: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    execAsk: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    execNode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    spawnedBy: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    sendPolicy: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"allow">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"deny">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    groupActivation: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"mention">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"always">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
}>;
export declare const SessionsResetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    key: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const SessionsDeleteParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    key: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    deleteTranscript: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const SessionsCompactParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    key: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    maxLines: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const SessionsUsageParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    /** Specific session key to analyze; if omitted returns all sessions. */
    key: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    /** Start date for range filter (YYYY-MM-DD). */
    startDate: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    /** End date for range filter (YYYY-MM-DD). */
    endDate: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    /** Maximum sessions to return (default 50). */
    limit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    /** Include context weight breakdown (systemPromptReport). */
    includeContextWeight: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
