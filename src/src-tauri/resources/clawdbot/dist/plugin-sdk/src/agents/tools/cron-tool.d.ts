import { type TSchema } from "@sinclair/typebox";
import { type AnyAgentTool } from "./common.js";
import { callGatewayTool } from "./gateway.js";
export declare const CronToolSchema: import("@sinclair/typebox").TObject<{
    action: import("@sinclair/typebox").TUnsafe<"status" | "list" | "wake" | "add" | "update" | "run" | "remove" | "runs">;
    gatewayUrl: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    gatewayToken: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    includeDisabled: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    job: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        schedule: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            kind: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"every" | "at" | "cron">>;
            at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            everyMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            anchorMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            expr: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            tz: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            staggerMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        }>>;
        sessionTarget: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        wakeMode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"now" | "next-heartbeat">>;
        payload: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            kind: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"agentTurn" | "systemEvent">>;
            text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            message: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            model: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            timeoutSeconds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            lightContext: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            allowUnsafeExternalContent: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            fallbacks: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
            toolsAllow: TSchema;
        }>>;
        delivery: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"none" | "announce" | "webhook">>;
            channel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            bestEffort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            accountId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            failureDestination: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
                channel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                accountId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"announce" | "webhook">>;
            }>>;
        }>>;
        agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        enabled: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        deleteAfterRun: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        sessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        failureAlert: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<false | Record<string, unknown>>>;
    }>>;
    jobId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    patch: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        schedule: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            kind: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"every" | "at" | "cron">>;
            at: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            everyMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            anchorMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            expr: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            tz: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            staggerMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        }>>;
        sessionTarget: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        wakeMode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"now" | "next-heartbeat">>;
        payload: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            kind: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"agentTurn" | "systemEvent">>;
            text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            message: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            model: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            timeoutSeconds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
            lightContext: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            allowUnsafeExternalContent: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            fallbacks: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
            toolsAllow: TSchema;
        }>>;
        delivery: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
            mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"none" | "announce" | "webhook">>;
            channel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            bestEffort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
            accountId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            failureDestination: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
                channel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                to: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                accountId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
                mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"announce" | "webhook">>;
            }>>;
        }>>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        enabled: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        deleteAfterRun: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        sessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        failureAlert: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<false | Record<string, unknown>>>;
    }>>;
    text: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    mode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"now" | "next-heartbeat">>;
    runMode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnsafe<"force" | "due">>;
    contextMessages: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
type CronToolOptions = {
    agentSessionKey?: string;
};
type GatewayToolCaller = typeof callGatewayTool;
type CronToolDeps = {
    callGatewayTool?: GatewayToolCaller;
};
export declare function createCronTool(opts?: CronToolOptions, deps?: CronToolDeps): AnyAgentTool;
export {};
