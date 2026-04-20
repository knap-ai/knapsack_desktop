import type { PluginRuntime, RuntimeLogger } from "../../runtime-api.js";
import type { CoreConfig } from "../../types.js";
import type { MatrixAuth } from "../client.js";
import type { MatrixClient } from "../sdk.js";
import type { MatrixRawEvent } from "./types.js";
export declare function registerMatrixMonitorEvents(params: {
    cfg: CoreConfig;
    client: MatrixClient;
    auth: MatrixAuth;
    allowFrom: string[];
    dmEnabled: boolean;
    dmPolicy: "open" | "pairing" | "allowlist" | "disabled";
    readStoreAllowFrom: () => Promise<string[]>;
    directTracker?: {
        invalidateRoom: (roomId: string) => void;
        rememberInvite?: (roomId: string, remoteUserId: string) => void;
    };
    logVerboseMessage: (message: string) => void;
    warnedEncryptedRooms: Set<string>;
    warnedCryptoMissingRooms: Set<string>;
    logger: RuntimeLogger;
    startupGraceMs?: number;
    getHealthySyncSinceMs?: () => number | undefined;
    formatNativeDependencyHint: PluginRuntime["system"]["formatNativeDependencyHint"];
    onRoomMessage: (roomId: string, event: MatrixRawEvent) => void | Promise<void>;
    runDetachedTask?: (label: string, task: () => Promise<void>) => Promise<void>;
}): void;
