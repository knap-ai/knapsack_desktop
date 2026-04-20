import type { ProviderRequestCapability, ProviderRequestTransport } from "../agents/provider-attribution.js";
import { type ProviderRequestTransportOverrides, type ResolvedProviderRequestConfig } from "../agents/provider-request-config.js";
import type { GuardedFetchMode, GuardedFetchResult } from "../infra/net/fetch-guard.js";
import type { LookupFn, PinnedDispatcherPolicy, SsrFPolicy } from "../infra/net/ssrf.js";
export { fetchWithTimeout } from "../utils/fetch-timeout.js";
export { normalizeBaseUrl } from "../agents/provider-request-config.js";
export type ProviderOperationDeadline = {
    deadlineAtMs?: number;
    label: string;
    timeoutMs?: number;
};
export declare function createProviderOperationDeadline(params: {
    timeoutMs?: number;
    label: string;
}): ProviderOperationDeadline;
export declare function resolveProviderOperationTimeoutMs(params: {
    deadline: ProviderOperationDeadline;
    defaultTimeoutMs: number;
}): number;
export declare function waitProviderOperationPollInterval(params: {
    deadline: ProviderOperationDeadline;
    pollIntervalMs: number;
}): Promise<void>;
export declare function resolveProviderHttpRequestConfig(params: {
    baseUrl?: string;
    defaultBaseUrl: string;
    allowPrivateNetwork?: boolean;
    headers?: HeadersInit;
    defaultHeaders?: Record<string, string>;
    request?: ProviderRequestTransportOverrides;
    provider?: string;
    api?: string;
    capability?: ProviderRequestCapability;
    transport?: ProviderRequestTransport;
}): {
    baseUrl: string;
    allowPrivateNetwork: boolean;
    headers: Headers;
    dispatcherPolicy?: PinnedDispatcherPolicy;
    requestConfig: ResolvedProviderRequestConfig;
};
export declare function fetchWithTimeoutGuarded(url: string, init: RequestInit, timeoutMs: number | undefined, fetchFn: typeof fetch, options?: {
    ssrfPolicy?: SsrFPolicy;
    lookupFn?: LookupFn;
    pinDns?: boolean;
    dispatcherPolicy?: PinnedDispatcherPolicy;
    auditContext?: string;
    mode?: GuardedFetchMode;
}): Promise<GuardedFetchResult>;
export declare function postTranscriptionRequest(params: {
    url: string;
    headers: Headers;
    body: BodyInit;
    timeoutMs?: number;
    fetchFn: typeof fetch;
    pinDns?: boolean;
    allowPrivateNetwork?: boolean;
    dispatcherPolicy?: PinnedDispatcherPolicy;
    auditContext?: string;
    /**
     * Override the guarded-fetch mode. Defaults to an auto-upgrade to
     * `TRUSTED_ENV_PROXY` when `HTTP_PROXY`/`HTTPS_PROXY` is configured in the
     * environment; pass `"strict"` to force pinned-DNS even inside a proxy.
     */
    mode?: GuardedFetchMode;
}): Promise<GuardedFetchResult>;
export declare function postJsonRequest(params: {
    url: string;
    headers: Headers;
    body: unknown;
    timeoutMs?: number;
    fetchFn: typeof fetch;
    pinDns?: boolean;
    allowPrivateNetwork?: boolean;
    dispatcherPolicy?: PinnedDispatcherPolicy;
    auditContext?: string;
    /**
     * Override the guarded-fetch mode. Defaults to an auto-upgrade to
     * `TRUSTED_ENV_PROXY` when `HTTP_PROXY`/`HTTPS_PROXY` is configured in the
     * environment; pass `"strict"` to force pinned-DNS even inside a proxy.
     */
    mode?: GuardedFetchMode;
}): Promise<GuardedFetchResult>;
export declare function readErrorResponse(res: Response): Promise<string | undefined>;
export declare function assertOkOrThrowHttpError(res: Response, label: string): Promise<void>;
export declare function requireTranscriptionText(value: string | undefined, missingMessage: string): string;
