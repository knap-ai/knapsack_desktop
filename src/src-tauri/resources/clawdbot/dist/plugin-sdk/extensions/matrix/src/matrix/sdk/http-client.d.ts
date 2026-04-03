import type { PinnedDispatcherPolicy } from "openclaw/plugin-sdk/infra-runtime";
import type { SsrFPolicy } from "../../runtime-api.js";
import { type HttpMethod, type QueryParams } from "./transport.js";
type MatrixAuthedHttpClientParams = {
    homeserver: string;
    accessToken: string;
    ssrfPolicy?: SsrFPolicy;
    dispatcherPolicy?: PinnedDispatcherPolicy;
};
export declare class MatrixAuthedHttpClient {
    private readonly homeserver;
    private readonly accessToken;
    private readonly ssrfPolicy?;
    private readonly dispatcherPolicy?;
    constructor(params: MatrixAuthedHttpClientParams);
    requestJson(params: {
        method: HttpMethod;
        endpoint: string;
        qs?: QueryParams;
        body?: unknown;
        timeoutMs: number;
        allowAbsoluteEndpoint?: boolean;
    }): Promise<unknown>;
    requestRaw(params: {
        method: HttpMethod;
        endpoint: string;
        qs?: QueryParams;
        timeoutMs: number;
        maxBytes?: number;
        readIdleTimeoutMs?: number;
        allowAbsoluteEndpoint?: boolean;
    }): Promise<Buffer>;
}
export {};
