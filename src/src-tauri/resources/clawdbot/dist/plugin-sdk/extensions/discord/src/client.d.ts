import { RequestClient } from "@buape/carbon";
import { loadConfig } from "openclaw/plugin-sdk/config-runtime";
import type { RetryConfig, RetryRunner } from "openclaw/plugin-sdk/retry-runtime";
import type { RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
import { type ResolvedDiscordAccount } from "./accounts.js";
import type { DiscordRuntimeAccountContext } from "./send.types.js";
export type DiscordClientOpts = {
    cfg?: ReturnType<typeof loadConfig>;
    token?: string;
    accountId?: string;
    rest?: RequestClient;
    retry?: RetryConfig;
    verbose?: boolean;
};
export declare function createDiscordRuntimeAccountContext(params: {
    cfg: ReturnType<typeof loadConfig>;
    accountId: string;
}): DiscordRuntimeAccountContext;
export declare function resolveDiscordClientAccountContext(opts: Pick<DiscordClientOpts, "cfg" | "accountId">, cfg?: ReturnType<typeof loadConfig>, runtime?: Pick<RuntimeEnv, "error">): {
    cfg: import("openclaw/plugin-sdk/config-runtime").OpenClawConfig;
    account: ResolvedDiscordAccount;
    proxyFetch: typeof fetch | undefined;
};
export declare function resolveDiscordProxyFetch(opts: Pick<DiscordClientOpts, "cfg" | "accountId">, cfg?: ReturnType<typeof loadConfig>, runtime?: Pick<RuntimeEnv, "error">): typeof fetch | undefined;
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
