import type { OpenClawConfig } from "../config/config.js";
import { loadConfig, resolveConfigPath, resolveGatewayPort, resolveStateDir } from "../config/config.js";
import { loadGatewayTlsRuntime } from "../infra/tls/gateway.js";
import { type GatewayClientMode, type GatewayClientName } from "../utils/message-channel.js";
import { GatewayClient, type GatewayClientOptions } from "./client.js";
import { type GatewayCredentialMode, type GatewayCredentialPrecedence, type GatewayRemoteCredentialFallback, type GatewayRemoteCredentialPrecedence } from "./credentials.js";
import { type OperatorScope } from "./method-scopes.js";
type CallGatewayBaseOptions = {
    url?: string;
    token?: string;
    password?: string;
    tlsFingerprint?: string;
    config?: OpenClawConfig;
    method: string;
    params?: unknown;
    expectFinal?: boolean;
    timeoutMs?: number;
    clientName?: GatewayClientName;
    clientDisplayName?: string;
    clientVersion?: string;
    platform?: string;
    mode?: GatewayClientMode;
    instanceId?: string;
    minProtocol?: number;
    maxProtocol?: number;
    requiredMethods?: string[];
    /**
     * Overrides the config path shown in connection error details.
     * Does not affect config loading; callers still control auth via opts.token/password/env/config.
     */
    configPath?: string;
};
export type CallGatewayScopedOptions = CallGatewayBaseOptions & {
    scopes: OperatorScope[];
};
export type CallGatewayCliOptions = CallGatewayBaseOptions & {
    scopes?: OperatorScope[];
};
export type CallGatewayOptions = CallGatewayBaseOptions & {
    scopes?: OperatorScope[];
};
export type GatewayConnectionDetails = {
    url: string;
    urlSource: string;
    bindDetail?: string;
    remoteFallbackNote?: string;
    message: string;
};
declare const defaultCreateGatewayClient: (opts: GatewayClientOptions) => GatewayClient;
declare const defaultGatewayCallDeps: {
    createGatewayClient: (opts: GatewayClientOptions) => GatewayClient;
    loadConfig: typeof loadConfig;
    resolveGatewayPort: typeof resolveGatewayPort;
    resolveConfigPath: typeof resolveConfigPath;
    resolveStateDir: typeof resolveStateDir;
    loadGatewayTlsRuntime: typeof loadGatewayTlsRuntime;
};
export declare const __testing: {
    setDepsForTests(deps: Partial<typeof defaultGatewayCallDeps> | undefined): void;
    setCreateGatewayClientForTests(createGatewayClient?: typeof defaultCreateGatewayClient): void;
    resetDepsForTests(): void;
};
export type ExplicitGatewayAuth = {
    token?: string;
    password?: string;
};
export declare function resolveExplicitGatewayAuth(opts?: ExplicitGatewayAuth): ExplicitGatewayAuth;
export declare function ensureExplicitGatewayAuth(params: {
    urlOverride?: string;
    urlOverrideSource?: "cli" | "env";
    explicitAuth?: ExplicitGatewayAuth;
    resolvedAuth?: ExplicitGatewayAuth;
    errorHint: string;
    configPath?: string;
}): void;
export declare function buildGatewayConnectionDetails(options?: {
    config?: OpenClawConfig;
    url?: string;
    configPath?: string;
    urlSource?: "cli" | "env";
}): GatewayConnectionDetails;
export declare function resolveGatewayCredentialsWithSecretInputs(params: {
    config: OpenClawConfig;
    explicitAuth?: ExplicitGatewayAuth;
    urlOverride?: string;
    urlOverrideSource?: "cli" | "env";
    env?: NodeJS.ProcessEnv;
    modeOverride?: GatewayCredentialMode;
    localTokenPrecedence?: GatewayCredentialPrecedence;
    localPasswordPrecedence?: GatewayCredentialPrecedence;
    remoteTokenPrecedence?: GatewayRemoteCredentialPrecedence;
    remotePasswordPrecedence?: GatewayRemoteCredentialPrecedence;
    remoteTokenFallback?: GatewayRemoteCredentialFallback;
    remotePasswordFallback?: GatewayRemoteCredentialFallback;
}): Promise<{
    token?: string;
    password?: string;
}>;
export declare function callGatewayScoped<T = Record<string, unknown>>(opts: CallGatewayScopedOptions): Promise<T>;
export declare function callGatewayCli<T = Record<string, unknown>>(opts: CallGatewayCliOptions): Promise<T>;
export declare function callGatewayLeastPrivilege<T = Record<string, unknown>>(opts: CallGatewayBaseOptions): Promise<T>;
export declare function callGateway<T = Record<string, unknown>>(opts: CallGatewayOptions): Promise<T>;
export declare function randomIdempotencyKey(): `${string}-${string}-${string}-${string}-${string}`;
export {};
