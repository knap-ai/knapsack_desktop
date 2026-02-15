export declare function fetchBrowserJson<T>(url: string, init?: RequestInit & {
    timeoutMs?: number;
}): Promise<T>;
