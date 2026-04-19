import { type OpenClawConfig } from "openclaw/plugin-sdk/provider-auth";
type LmstudioAuthHeadersParams = {
    apiKey?: string;
    json?: boolean;
    headers?: Record<string, string>;
};
export declare function buildLmstudioAuthHeaders(params: LmstudioAuthHeadersParams): Record<string, string> | undefined;
export declare function resolveLmstudioConfiguredApiKey(params: {
    config?: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    path?: string;
}): Promise<string | undefined>;
export declare function resolveLmstudioProviderHeaders(params: {
    config?: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    headers?: unknown;
    path?: string;
}): Promise<Record<string, string> | undefined>;
/**
 * Resolves LM Studio API key and provider headers in parallel.
 * Use this as the standard auth setup step before discovery or model load calls.
 */
export declare function resolveLmstudioRequestContext(params: {
    config?: OpenClawConfig;
    agentDir?: string;
    env?: NodeJS.ProcessEnv;
    providerHeaders?: unknown;
}): Promise<{
    apiKey: string | undefined;
    headers: Record<string, string> | undefined;
}>;
/**
 * Resolves LM Studio runtime API key from config.
 */
export declare function resolveLmstudioRuntimeApiKey(params: {
    config?: OpenClawConfig;
    agentDir?: string;
    env?: NodeJS.ProcessEnv;
    headers?: unknown;
}): Promise<string | undefined>;
export {};
