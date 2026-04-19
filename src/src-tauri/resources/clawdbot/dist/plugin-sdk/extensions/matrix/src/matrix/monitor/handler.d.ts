import type { CoreConfig, MatrixRoomConfig, MatrixStreamingMode, ReplyToMode } from "../../types.js";
import type { MatrixClient } from "../sdk.js";
import type { MatrixInboundEventDeduper } from "./inbound-dedupe.js";
import { type PluginRuntime, type RuntimeEnv, type RuntimeLogger } from "./runtime-api.js";
import type { MatrixRawEvent } from "./types.js";
export declare class MatrixRetryableInboundError extends Error {
    constructor(message: string, options?: ErrorOptions);
}
export type MatrixMonitorHandlerParams = {
    client: MatrixClient;
    core: PluginRuntime;
    cfg: CoreConfig;
    accountId: string;
    runtime: RuntimeEnv;
    logger: RuntimeLogger;
    logVerboseMessage: (message: string) => void;
    allowFrom: string[];
    groupAllowFrom?: string[];
    roomsConfig?: Record<string, MatrixRoomConfig>;
    accountAllowBots?: boolean | "mentions";
    configuredBotUserIds?: ReadonlySet<string>;
    groupPolicy: "open" | "allowlist" | "disabled";
    replyToMode: ReplyToMode;
    threadReplies: "off" | "inbound" | "always";
    /** DM-specific threadReplies override. Falls back to threadReplies when absent. */
    dmThreadReplies?: "off" | "inbound" | "always";
    /** DM session grouping behavior. */
    dmSessionScope?: "per-user" | "per-room";
    streaming: MatrixStreamingMode;
    blockStreamingEnabled: boolean;
    dmEnabled: boolean;
    dmPolicy: "open" | "pairing" | "allowlist" | "disabled";
    textLimit: number;
    mediaMaxBytes: number;
    historyLimit: number;
    startupMs: number;
    startupGraceMs: number;
    dropPreStartupMessages: boolean;
    inboundDeduper?: Pick<MatrixInboundEventDeduper, "claimEvent" | "commitEvent" | "releaseEvent">;
    directTracker: {
        isDirectMessage: (params: {
            roomId: string;
            senderId: string;
            selfUserId: string;
        }) => Promise<boolean>;
    };
    getRoomInfo: (roomId: string, opts?: {
        includeAliases?: boolean;
    }) => Promise<{
        name?: string;
        canonicalAlias?: string;
        altAliases: string[];
    }>;
    getMemberDisplayName: (roomId: string, userId: string) => Promise<string>;
    needsRoomAliasesForConfig: boolean;
};
export declare function createMatrixRoomMessageHandler(params: MatrixMonitorHandlerParams): (roomId: string, event: MatrixRawEvent) => Promise<void>;
