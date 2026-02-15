export declare const ConfigGetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const ConfigSetParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    raw: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    baseHash: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const ConfigApplyParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    raw: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    baseHash: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    note: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    restartDelayMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const ConfigPatchParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    raw: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    baseHash: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    note: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    restartDelayMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const ConfigSchemaParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const UpdateRunParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    note: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    restartDelayMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    timeoutMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const ConfigUiHintSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    help: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    group: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    order: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    advanced: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    sensitive: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    placeholder: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    itemTemplate: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
}>;
export declare const ConfigSchemaResponseSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    schema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown;
    uiHints: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TRecord<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        label: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        help: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        group: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        order: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        advanced: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        sensitive: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        placeholder: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        itemTemplate: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    }>>;
    version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    generatedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>;
