export declare const execSchema: import("@sinclair/typebox").TObject<{
    command: import("@sinclair/typebox").TString;
    workdir: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    env: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TString>>;
    yieldMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    background: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    timeout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    pty: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    elevated: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    host: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    security: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    ask: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    node: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const processSchema: import("@sinclair/typebox").TObject<{
    action: import("@sinclair/typebox").TString;
    sessionId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    data: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    keys: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    hex: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    literal: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    bracketed: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    eof: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    offset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    timeout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
