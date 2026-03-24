import { type DirectoryConfigParams } from "openclaw/plugin-sdk/directory-runtime";
export declare function listTelegramDirectoryPeersFromConfig(params: DirectoryConfigParams): Promise<import("openclaw/plugin-sdk/directory-runtime").ChannelDirectoryEntry[]>;
export declare function listTelegramDirectoryGroupsFromConfig(params: DirectoryConfigParams): Promise<import("openclaw/plugin-sdk/directory-runtime").ChannelDirectoryEntry[]>;
