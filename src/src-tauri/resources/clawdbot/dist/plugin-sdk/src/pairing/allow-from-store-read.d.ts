import type { PairingChannel } from "./pairing-store.types.js";
export declare function resolveChannelAllowFromPath(channel: PairingChannel, env?: NodeJS.ProcessEnv, accountId?: string): string;
export declare function readLegacyChannelAllowFromStoreEntries(channel: PairingChannel, env?: NodeJS.ProcessEnv): Promise<string[]>;
export declare function readChannelAllowFromStoreEntries(channel: PairingChannel, env?: NodeJS.ProcessEnv, accountId?: string): Promise<string[]>;
export declare function readLegacyChannelAllowFromStoreEntriesSync(channel: PairingChannel, env?: NodeJS.ProcessEnv): string[];
export declare function readChannelAllowFromStoreEntriesSync(channel: PairingChannel, env?: NodeJS.ProcessEnv, accountId?: string): string[];
export declare function clearAllowFromStoreReadCacheForTest(): void;
