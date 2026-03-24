import { RequestClient } from "@buape/carbon";
import { loadConfig } from "openclaw/plugin-sdk/config-runtime";
import type { RetryConfig } from "openclaw/plugin-sdk/infra-runtime";
import type { RetryRunner } from "openclaw/plugin-sdk/infra-runtime";
import { type ResolvedDiscordAccount } from "./accounts.js";
export type DiscordClientOpts = {
    cfg?: ReturnType<typeof loadConfig>;
    token?: string;
    accountId?: string;
    rest?: RequestClient;
    retry?: RetryConfig;
    verbose?: boolean;
};
export declare function createDiscordRestClient(opts: DiscordClientOpts, cfg?: ReturnType<typeof loadConfig>): {
    token: string;
    rest: RequestClient;
    account: ResolvedDiscordAccount;
};
export declare function createDiscordClient(opts: DiscordClientOpts, cfg?: ReturnType<typeof loadConfig>): {
    token: string;
    rest: RequestClient;
    request: RetryRunner;
};
export declare function resolveDiscordRest(opts: DiscordClientOpts): RequestClient;
