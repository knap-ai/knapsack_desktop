import type { GuardedFetchResult } from "../../infra/net/fetch-guard.js";
import type { LookupFn, SsrFPolicy } from "../../infra/net/ssrf.js";
export { fetchWithTimeout } from "../../utils/fetch-timeout.js";
export declare function normalizeBaseUrl(baseUrl: string | undefined, fallback: string): string;
export declare function fetchWithTimeoutGuarded(url: string, init: RequestInit, timeoutMs: number, fetchFn: typeof fetch, options?: {
    ssrfPolicy?: SsrFPolicy;
    lookupFn?: LookupFn;
    pinDns?: boolean;
}): Promise<GuardedFetchResult>;
export declare function readErrorResponse(res: Response): Promise<string | undefined>;
