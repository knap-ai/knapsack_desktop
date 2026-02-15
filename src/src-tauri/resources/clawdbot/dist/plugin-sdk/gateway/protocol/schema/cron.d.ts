export declare const CronScheduleSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"at">;
    at: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"every">;
    everyMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    anchorMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cron">;
    expr: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    tz: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>]>;
export declare const CronPayloadSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"systemEvent">;
    text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"agentTurn">;
    message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    timeoutSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    allowUnsafeExternalContent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    bestEffortDeliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>]>;
export declare const CronPayloadPatchSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"systemEvent">;
    text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"agentTurn">;
    message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    timeoutSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    allowUnsafeExternalContent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    bestEffortDeliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>]>;
export declare const CronDeliverySchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"none">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"announce">]>;
    channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"last">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString]>>;
    to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    bestEffort: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const CronDeliveryPatchSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"none">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"announce">]>>;
    channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"last">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString]>>;
    to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    bestEffort: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const CronJobStateSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    nextRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    runningAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    lastRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    lastStatus: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"ok">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"skipped">]>>;
    lastError: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    lastDurationMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    consecutiveErrors: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const CronJobSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    description: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    enabled: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    deleteAfterRun: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    createdAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    updatedAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    schedule: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"at">;
        at: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"every">;
        everyMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        anchorMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cron">;
        expr: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        tz: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>]>;
    sessionTarget: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"main">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"isolated">]>;
    wakeMode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"next-heartbeat">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"now">]>;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"systemEvent">;
        text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"agentTurn">;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        timeoutSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        allowUnsafeExternalContent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        bestEffortDeliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>]>;
    delivery: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"none">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"announce">]>;
        channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"last">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString]>>;
        to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        bestEffort: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>>;
    state: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        nextRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        runningAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        lastRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        lastStatus: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"ok">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"skipped">]>>;
        lastError: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        lastDurationMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        consecutiveErrors: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>;
}>;
export declare const CronListParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    includeDisabled: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
}>;
export declare const CronStatusParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{}>;
export declare const CronAddParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    description: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    enabled: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    deleteAfterRun: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    schedule: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"at">;
        at: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"every">;
        everyMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        anchorMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cron">;
        expr: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        tz: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>]>;
    sessionTarget: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"main">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"isolated">]>;
    wakeMode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"next-heartbeat">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"now">]>;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"systemEvent">;
        text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"agentTurn">;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        timeoutSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        allowUnsafeExternalContent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        bestEffortDeliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>]>;
    delivery: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"none">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"announce">]>;
        channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"last">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString]>>;
        to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        bestEffort: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>>;
}>;
export declare const CronJobPatchSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
    description: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    enabled: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    deleteAfterRun: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    schedule: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"at">;
        at: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"every">;
        everyMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        anchorMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cron">;
        expr: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        tz: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>]>>;
    sessionTarget: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"main">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"isolated">]>>;
    wakeMode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"next-heartbeat">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"now">]>>;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"systemEvent">;
        text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"agentTurn">;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        timeoutSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        allowUnsafeExternalContent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        bestEffortDeliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>]>>;
    delivery: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"none">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"announce">]>>;
        channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"last">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString]>>;
        to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        bestEffort: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    }>>;
    state: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        nextRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        runningAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        lastRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        lastStatus: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"ok">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"skipped">]>>;
        lastError: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        lastDurationMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        consecutiveErrors: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>>;
}>;
export declare const CronUpdateParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    patch: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
        description: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        enabled: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        deleteAfterRun: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        schedule: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"at">;
            at: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"every">;
            everyMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
            anchorMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cron">;
            expr: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            tz: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>]>>;
        sessionTarget: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"main">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"isolated">]>>;
        wakeMode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"next-heartbeat">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"now">]>>;
        payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"systemEvent">;
            text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"agentTurn">;
            message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            timeoutSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            allowUnsafeExternalContent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
            deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
            channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            bestEffortDeliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        }>]>>;
        delivery: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"none">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"announce">]>>;
            channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"last">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString]>>;
            to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            bestEffort: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        }>>;
        state: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            nextRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            runningAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            lastRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            lastStatus: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"ok">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"skipped">]>>;
            lastError: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            lastDurationMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            consecutiveErrors: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        }>>;
    }>;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    jobId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    patch: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        name: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        agentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TNull]>>;
        description: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        enabled: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        deleteAfterRun: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        schedule: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"at">;
            at: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"every">;
            everyMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
            anchorMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cron">;
            expr: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            tz: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>]>>;
        sessionTarget: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"main">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"isolated">]>>;
        wakeMode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"next-heartbeat">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"now">]>>;
        payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"systemEvent">;
            text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            kind: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"agentTurn">;
            message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            model: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            thinking: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            timeoutSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            allowUnsafeExternalContent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
            deliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
            channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            bestEffortDeliver: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        }>]>>;
        delivery: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"none">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"announce">]>>;
            channel: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"last">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString]>>;
            to: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            bestEffort: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        }>>;
        state: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            nextRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            runningAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            lastRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            lastStatus: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"ok">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"skipped">]>>;
            lastError: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            lastDurationMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            consecutiveErrors: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
        }>>;
    }>;
}>]>;
export declare const CronRemoveParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    jobId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
}>]>;
export declare const CronRunParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"due">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"force">]>>;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    jobId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"due">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"force">]>>;
}>]>;
export declare const CronRunsParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    limit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    jobId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    limit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>]>;
export declare const CronRunLogEntrySchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    ts: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    jobId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    action: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"finished">;
    status: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"ok">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"error">, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"skipped">]>>;
    error: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    summary: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    sessionId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    sessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    runAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    durationMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    nextRunAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
