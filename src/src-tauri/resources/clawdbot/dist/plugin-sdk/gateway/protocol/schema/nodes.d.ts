export declare const NodePairRequestParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    displayName: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    platform: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    coreVersion: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    uiVersion: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    deviceFamily: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    modelIdentifier: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    caps: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
    commands: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
    remoteIp: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    silent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const NodePairListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const NodePairApproveParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    requestId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const NodePairRejectParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    requestId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const NodePairVerifyParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    token: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const NodeRenameParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    displayName: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const NodeListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const NodeDescribeParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const NodeInvokeParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    command: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    params: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    timeoutMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    idempotencyKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const NodeInvokeResultParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    ok: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    payloadJSON: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    error: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        code: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>;
}>;
export declare const NodeEventParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    event: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    payloadJSON: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const NodeInvokeRequestEventSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    nodeId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    command: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    paramsJSON: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    timeoutMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    idempotencyKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
