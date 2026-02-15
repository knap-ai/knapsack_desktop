export declare const DevicePairListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const DevicePairApproveParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    requestId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const DevicePairRejectParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    requestId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const DeviceTokenRotateParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    deviceId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    role: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    scopes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
}>;
export declare const DeviceTokenRevokeParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    deviceId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    role: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
export declare const DevicePairRequestedEventSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    requestId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    deviceId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    publicKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    displayName: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    platform: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    clientId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    clientMode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    role: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    roles: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
    scopes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
    remoteIp: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    silent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    isRepair: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    ts: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
}>;
export declare const DevicePairResolvedEventSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    requestId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    deviceId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    decision: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    ts: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
}>;
