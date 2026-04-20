import * as Lark from "@larksuiteoapi/node-sdk";
import type { FeishuConfig, FeishuDomain, ResolvedFeishuAccount } from "./types.js";
declare const pluginVersion: string;
export { pluginVersion };
declare const FEISHU_USER_AGENT: string;
export { FEISHU_USER_AGENT };
/** User-Agent header value for all Feishu API requests. */
export declare function getFeishuUserAgent(): string;
type FeishuClientSdk = Pick<typeof Lark, "AppType" | "Client" | "defaultHttpInstance" | "Domain" | "EventDispatcher" | "LoggerLevel" | "WSClient">;
/** Default HTTP timeout for Feishu API requests (30 seconds). */
export declare const FEISHU_HTTP_TIMEOUT_MS = 30000;
export declare const FEISHU_HTTP_TIMEOUT_MAX_MS = 300000;
export declare const FEISHU_HTTP_TIMEOUT_ENV_VAR = "OPENCLAW_FEISHU_HTTP_TIMEOUT_MS";
/**
 * Credentials needed to create a Feishu client.
 * Both FeishuConfig and ResolvedFeishuAccount satisfy this interface.
 */
export type FeishuClientCredentials = {
    accountId?: string;
    appId?: string;
    appSecret?: string;
    domain?: FeishuDomain;
    httpTimeoutMs?: number;
    config?: Pick<FeishuConfig, "httpTimeoutMs">;
};
/**
 * Create or get a cached Feishu client for an account.
 * Accepts any object with appId, appSecret, and optional domain/accountId.
 */
export declare function createFeishuClient(creds: FeishuClientCredentials): Lark.Client;
/**
 * Create a Feishu WebSocket client for an account.
 * Note: WSClient is not cached since each call creates a new connection.
 */
export declare function createFeishuWSClient(account: ResolvedFeishuAccount): Promise<Lark.WSClient>;
/**
 * Create an event dispatcher for an account.
 */
export declare function createEventDispatcher(account: ResolvedFeishuAccount): Lark.EventDispatcher;
/**
 * Get a cached client for an account (if exists).
 */
export declare function getFeishuClient(accountId: string): Lark.Client | null;
/**
 * Clear client cache for a specific account or all accounts.
 */
export declare function clearClientCache(accountId?: string): void;
export declare function setFeishuClientRuntimeForTest(overrides?: {
    sdk?: Partial<FeishuClientSdk>;
}): void;
