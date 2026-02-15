export declare const LogsTailParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    cursor: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    limit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    maxBytes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const LogsTailResultSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    file: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    cursor: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    size: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    lines: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    truncated: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    reset: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const ChatHistoryParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    limit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const ChatSendParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    attachments: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>>;
    timeoutMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    idempotencyKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const ChatAbortParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    runId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const ChatInjectParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const ChatEventSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    runId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    seq: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    state: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"delta">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"final">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"aborted">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">]>;
    message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    errorMessage: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    usage: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    stopReason: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
