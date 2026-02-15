import type { ChannelId, ChannelPairingAdapter } from "../channels/plugins/types.js";
export type PairingChannel = ChannelId;
export type PairingRequest = {
    id: string;
    code: string;
    createdAt: string;
    lastSeenAt: string;
    meta?: Record<string, string>;
};
export declare function readChannelAllowFromStore(channel: PairingChannel, env?: NodeJS.ProcessEnv): Promise<string[]>;
export declare function addChannelAllowFromStoreEntry(params: {
    channel: PairingChannel;
    entry: string | number;
    env?: NodeJS.ProcessEnv;
}): Promise<{
    changed: boolean;
    allowFrom: string[];
}>;
export declare function removeChannelAllowFromStoreEntry(params: {
    channel: PairingChannel;
    entry: string | number;
    env?: NodeJS.ProcessEnv;
}): Promise<{
    changed: boolean;
    allowFrom: string[];
}>;
export declare function listChannelPairingRequests(channel: PairingChannel, env?: NodeJS.ProcessEnv): Promise<PairingRequest[]>;
export declare function upsertChannelPairingRequest(params: {
    channel: PairingChannel;
    id: string | number;
    meta?: Record<string, string | undefined | null>;
    env?: NodeJS.ProcessEnv;
    /** Extension channels can pass their adapter directly to bypass registry lookup. */
    pairingAdapter?: ChannelPairingAdapter;
}): Promise<{
    code: string;
    created: boolean;
}>;
export declare function approveChannelPairingCode(params: {
    channel: PairingChannel;
    code: string;
    env?: NodeJS.ProcessEnv;
}): Promise<{
    id: string;
    entry?: PairingRequest;
} | null>;
