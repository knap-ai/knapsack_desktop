import type { SubscribeEmbeddedPiSessionParams } from "./pi-embedded-subscribe.types.js";
export type { BlockReplyChunking, SubscribeEmbeddedPiSessionParams, ToolResultFormat, } from "./pi-embedded-subscribe.types.js";
export declare function subscribeEmbeddedPiSession(params: SubscribeEmbeddedPiSessionParams): {
    assistantTexts: string[];
    toolMetas: {
        toolName?: string;
        meta?: string;
    }[];
    unsubscribe: () => void;
    isCompacting: () => boolean;
    getMessagingToolSentTexts: () => string[];
    getMessagingToolSentTargets: () => import("./pi-embedded-messaging.ts").MessagingToolSend[];
    didSendViaMessagingTool: () => boolean;
    getLastToolError: () => {
        toolName: string;
        meta?: string;
        error?: string;
    } | undefined;
    getUsageTotals: () => {
        input: number | undefined;
        output: number | undefined;
        cacheRead: number | undefined;
        cacheWrite: number | undefined;
        total: number | undefined;
    } | undefined;
    getCompactionCount: () => number;
    waitForCompactionRetry: () => Promise<void>;
};
