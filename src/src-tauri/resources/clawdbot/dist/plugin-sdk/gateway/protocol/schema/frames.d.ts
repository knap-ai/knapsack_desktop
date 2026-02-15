export declare const TickEventSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    ts: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
}>;
export declare const ShutdownEventSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    reason: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    restartExpectedMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const ConnectParamsSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    minProtocol: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    maxProtocol: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    client: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cli" | "test" | "webchat-ui" | "openclaw-control-ui" | "webchat" | "gateway-client" | "openclaw-macos" | "openclaw-ios" | "openclaw-android" | "node-host" | "fingerprint" | "openclaw-probe">[]>;
        displayName: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        platform: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        deviceFamily: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        modelIdentifier: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"cli" | "node" | "test" | "webchat" | "ui" | "backend" | "probe">[]>;
        instanceId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>;
    caps: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
    commands: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
    permissions: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TRecord<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>>;
    pathEnv: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    role: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    scopes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
    device: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        publicKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        signature: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        signedAt: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        nonce: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>;
    auth: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        token: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        password: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>>;
    locale: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    userAgent: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
}>;
export declare const HelloOkSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"hello-ok">;
    protocol: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    server: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        commit: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        host: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        connId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    }>;
    features: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        methods: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        events: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    }>;
    snapshot: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        presence: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            host: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ip: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            version: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            platform: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            deviceFamily: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            modelIdentifier: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            mode: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            lastInputSeconds: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
            reason: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            tags: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
            text: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            ts: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
            deviceId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
            roles: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
            scopes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>>;
            instanceId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>;
        health: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TAny;
        stateVersion: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            presence: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
            health: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        }>;
        uptimeMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        configPath: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        stateDir: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        sessionDefaults: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
            defaultAgentId: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            mainKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            mainSessionKey: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
            scope: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        }>>;
    }>;
    canvasHostUrl: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
    auth: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        deviceToken: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        role: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        scopes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TArray<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString>;
        issuedAtMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>>;
    policy: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        maxPayload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        maxBufferedBytes: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        tickIntervalMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    }>;
}>;
export declare const ErrorShapeSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    code: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    details: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    retryable: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
    retryAfterMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
}>;
export declare const RequestFrameSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"req">;
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    method: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    params: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
}>;
export declare const ResponseFrameSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"res">;
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    ok: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    error: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        code: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        details: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
        retryable: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        retryAfterMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>>;
}>;
export declare const EventFrameSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"event">;
    event: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    seq: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    stateVersion: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        presence: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        health: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    }>>;
}>;
export declare const GatewayFrameSchema: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnion<[import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"req">;
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    method: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    params: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"res">;
    id: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    ok: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    error: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        code: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        message: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
        details: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
        retryable: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TBoolean>;
        retryAfterMs: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    }>>;
}>, import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
    type: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TLiteral<"event">;
    event: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TString;
    payload: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TUnknown>;
    seq: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger>;
    stateVersion: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TOptional<import("node_modules/@sinclair/typebox/build/esm/index.mjs").TObject<{
        presence: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
        health: import("node_modules/@sinclair/typebox/build/esm/index.mjs").TInteger;
    }>>;
}>]>;
