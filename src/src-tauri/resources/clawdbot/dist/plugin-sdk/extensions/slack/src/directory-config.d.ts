import { type DirectoryConfigParams } from "openclaw/plugin-sdk/directory-runtime";
export declare function listSlackDirectoryPeersFromConfig(params: DirectoryConfigParams): Promise<import("openclaw/plugin-sdk/directory-runtime").ChannelDirectoryEntry[]>;
export declare function listSlackDirectoryGroupsFromConfig(params: DirectoryConfigParams): Promise<import("openclaw/plugin-sdk/directory-runtime").ChannelDirectoryEntry[]>;
