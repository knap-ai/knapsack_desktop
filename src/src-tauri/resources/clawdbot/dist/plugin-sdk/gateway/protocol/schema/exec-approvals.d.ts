export declare const ExecApprovalsAllowlistEntrySchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    pattern: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    lastUsedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    lastUsedCommand: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    lastResolvedPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const ExecApprovalsDefaultsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const ExecApprovalsAgentSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    allowlist: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        pattern: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        lastUsedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        lastUsedCommand: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        lastResolvedPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>>;
}>;
export declare const ExecApprovalsFileSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<1>;
    socket: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        token: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>;
    defaults: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>>;
    agents: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TRecord<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        allowlist: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            pattern: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            lastUsedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            lastUsedCommand: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            lastResolvedPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>>;
    }>>>;
}>;
export declare const ExecApprovalsSnapshotSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    exists: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    hash: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    file: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<1>;
        socket: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            token: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>;
        defaults: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        }>>;
        agents: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TRecord<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
            allowlist: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
                id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
                pattern: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
                lastUsedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
                lastUsedCommand: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
                lastResolvedPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            }>>>;
        }>>>;
    }>;
}>;
export declare const ExecApprovalsGetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const ExecApprovalsSetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    file: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<1>;
        socket: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            token: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>;
        defaults: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        }>>;
        agents: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TRecord<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
            allowlist: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
                id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
                pattern: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
                lastUsedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
                lastUsedCommand: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
                lastResolvedPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            }>>>;
        }>>>;
    }>;
    baseHash: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const ExecApprovalsNodeGetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const ExecApprovalsNodeSetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    file: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<1>;
        socket: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            token: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>;
        defaults: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        }>>;
        agents: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TRecord<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            askFallback: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            autoAllowSkills: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
            allowlist: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
                id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
                pattern: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
                lastUsedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
                lastUsedCommand: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
                lastResolvedPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            }>>>;
        }>>>;
    }>;
    baseHash: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const ExecApprovalRequestParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    command: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    cwd: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    host: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    security: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    ask: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    resolvedPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    timeoutMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    twoPhase: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const ExecApprovalResolveParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    decision: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
