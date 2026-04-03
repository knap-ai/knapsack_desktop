import type { ProviderRequestCapability, ProviderRequestTransport } from "../agents/provider-attribution.js";
import { type ProviderRequestTransportOverrides, type ResolvedProviderRequestConfig } from "../agents/provider-request-config.js";
import type { GuardedFetchResult } from "../infra/net/fetch-guard.js";
import type { LookupFn, PinnedDispatcherPolicy, SsrFPolicy } from "../infra/net/ssrf.js";
export { fetchWithTimeout } from "../utils/fetch-timeout.js";
export { normalizeBaseUrl } from "../agents/provider-request-config.js";
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
}): Promise<GuardedFetchResult>;
export declare function postTranscriptionRequest(params: {
    url: string;
    headers: Headers;
    body: BodyInit;
    timeoutMs?: number;
    fetchFn: typeof fetch;
    allowPrivateNetwork?: boolean;
    dispatcherPolicy?: PinnedDispatcherPolicy;
    auditContext?: string;
}): Promise<GuardedFetchResult>;
export declare function postJsonRequest(params: {
    url: string;
    headers: Headers;
    body: unknown;
    timeoutMs?: number;
    fetchFn: typeof fetch;
    allowPrivateNetwork?: boolean;
    dispatcherPolicy?: PinnedDispatcherPolicy;
    auditContext?: string;
}): Promise<GuardedFetchResult>;
export declare function readErrorResponse(res: Response): Promise<string | undefined>;
export declare function assertOkOrThrowHttpError(res: Response, label: string): Promise<void>;
export declare function requireTranscriptionText(value: string | undefined, missingMessage: string): string;
