import type { OpenClawConfig } from "../../config/config.js";
import type { ChannelId } from "./types.js";
export declare function createChannelConversationBindingManager(params: {
    channelId: ChannelId;
    cfg: OpenClawConfig;
    accountId?: string | null;
}): Promise<{
    stop: () => void | Promise<void>;
} | null>;
export declare function setChannelConversationBindingIdleTimeoutBySessionKey(params: {
    channelId: ChannelId;
    targetSessionKey: string;
    accountId?: string | null;
    idleTimeoutMs: number;
}): Array<{
    boundAt: number;
    lastActivityAt: number;
    idleTimeoutMs?: number;
    maxAgeMs?: number;
}>;
export declare function setChannelConversationBindingMaxAgeBySessionKey(params: {
    channelId: ChannelId;
    targetSessionKey: string;
    accountId?: string | null;
    maxAgeMs: number;
}): Array<{
    boundAt: number;
    lastActivityAt: number;
    idleTimeoutMs?: number;
    maxAgeMs?: number;
}>;
