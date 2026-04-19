import type { CoreConfig } from "../../types.js";
import type { MatrixClient } from "../sdk.js";
import type { PluginRuntime } from "./runtime-api.js";
import type { MatrixRawEvent } from "./types.js";
export type MatrixReactionNotificationMode = "off" | "own";
export declare function resolveMatrixReactionNotificationMode(params: {
    cfg: CoreConfig;
    accountId: string;
}): MatrixReactionNotificationMode;
export declare function handleInboundMatrixReaction(params: {
    client: MatrixClient;
    core: PluginRuntime;
    cfg: CoreConfig;
    accountId: string;
    roomId: string;
    event: MatrixRawEvent;
    senderId: string;
    senderLabel: string;
    selfUserId: string;
    isDirectMessage: boolean;
    logVerboseMessage: (message: string) => void;
}): Promise<void>;
