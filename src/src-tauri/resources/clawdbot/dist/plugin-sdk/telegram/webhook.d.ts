import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
export declare function startTelegramWebhook(opts: {
    token: string;
    accountId?: string;
    config?: OpenClawConfig;
    path?: string;
    port?: number;
    host?: string;
    secret?: string;
    runtime?: RuntimeEnv;
    fetch?: typeof fetch;
    abortSignal?: AbortSignal;
    healthPath?: string;
    publicUrl?: string;
}): Promise<{
    server: import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
    bot: import("node_modules/grammy/out/bot.js").Bot<import("node_modules/grammy/out/context.js").Context, import("node_modules/grammy/out/mod.js").Api<import("node_modules/grammy/out/mod.js").RawApi>>;
    stop: () => void;
}>;
