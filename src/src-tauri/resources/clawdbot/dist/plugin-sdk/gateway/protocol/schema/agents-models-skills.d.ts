export declare const ModelChoiceSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    provider: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    contextWindow: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    reasoning: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const AgentSummarySchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    identity: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        theme: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        emoji: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        avatar: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        avatarUrl: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>;
}>;
export declare const AgentsListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const AgentsListResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    defaultId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    mainKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    scope: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"per-sender">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"global">]>;
    agents: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        identity: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            theme: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            emoji: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            avatar: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            avatarUrl: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>;
    }>>;
}>;
export declare const AgentsCreateParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    workspace: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    emoji: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    avatar: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const AgentsCreateResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    ok: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<true>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    workspace: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const AgentsUpdateParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    workspace: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    avatar: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const AgentsUpdateResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    ok: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<true>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const AgentsDeleteParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    deleteFiles: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const AgentsDeleteResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    ok: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<true>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    removedBindings: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
}>;
export declare const AgentsFileEntrySchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    missing: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    size: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    updatedAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    content: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const AgentsFilesListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const AgentsFilesListResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    workspace: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    files: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        missing: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
        size: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        updatedAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        content: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>;
}>;
export declare const AgentsFilesGetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const AgentsFilesGetResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    workspace: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    file: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        missing: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
        size: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        updatedAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        content: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>;
}>;
export declare const AgentsFilesSetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    content: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const AgentsFilesSetResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    ok: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<true>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    workspace: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    file: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        path: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        missing: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
        size: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        updatedAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        content: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>;
}>;
export declare const ModelsListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const ModelsListResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    models: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        provider: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        contextWindow: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        reasoning: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>>;
}>;
export declare const SkillsStatusParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const SkillsBinsParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const SkillsBinsResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    bins: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const SkillsInstallParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    installId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    timeoutMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const SkillsUpdateParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    skillKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    enabled: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    apiKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    env: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TRecord<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
}>;
