import type { ChannelRuntimeSurface } from "openclaw/plugin-sdk/channel-contract";
import { type RuntimeEnv } from "../../runtime-api.js";
import type { ReplyToMode } from "../../types.js";
export type MonitorMatrixOpts = {
    runtime?: RuntimeEnv;
    channelRuntime?: ChannelRuntimeSurface;
    abortSignal?: AbortSignal;
    mediaMaxMb?: number;
    initialSyncLimit?: number;
    replyToMode?: ReplyToMode;
    accountId?: string | null;
    setStatus?: (next: import("openclaw/plugin-sdk/channel-contract").ChannelAccountSnapshot) => void;
};
export declare function monitorMatrixProvider(opts?: MonitorMatrixOpts): Promise<void>;
