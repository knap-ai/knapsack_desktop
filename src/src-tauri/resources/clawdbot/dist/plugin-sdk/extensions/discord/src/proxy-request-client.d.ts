import { RequestClient, type RequestClientOptions } from "@buape/carbon";
export type ProxyRequestClientOptions = RequestClientOptions & {
    fetch?: typeof fetch;
};
export declare function createDiscordRequestClient(token: string, options?: ProxyRequestClientOptions): RequestClient;
