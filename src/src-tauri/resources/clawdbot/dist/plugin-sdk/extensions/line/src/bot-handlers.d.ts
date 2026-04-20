import type { webhook } from "@line/bot-sdk";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import { type ClaimableDedupe } from "openclaw/plugin-sdk/persistent-dedupe";
import { type HistoryEntry } from "openclaw/plugin-sdk/reply-history";
import type { RuntimeEnv } from "openclaw/plugin-sdk/runtime";
import { type LineInboundContext } from "./bot-message-context.js";
import type { ResolvedLineAccount } from "./types.js";
type WebhookEvent = webhook.Event;
export interface LineHandlerContext {
    cfg: OpenClawConfig;
    account: ResolvedLineAccount;
    runtime: RuntimeEnv;
    mediaMaxBytes: number;
    processMessage: (ctx: LineInboundContext) => Promise<void>;
    replayCache?: LineWebhookReplayCache;
    groupHistories?: Map<string, HistoryEntry[]>;
    historyLimit?: number;
}
export type LineWebhookReplayCache = ClaimableDedupe;
export declare class LineRetryableWebhookError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
export declare function createLineWebhookReplayCache(): LineWebhookReplayCache;
export declare function handleLineWebhookEvents(events: WebhookEvent[], context: LineHandlerContext): Promise<void>;
export {};
