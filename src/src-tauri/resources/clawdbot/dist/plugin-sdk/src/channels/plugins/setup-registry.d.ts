import type { ChannelId, ChannelPlugin } from "./types.js";
export declare function listChannelSetupPlugins(): ChannelPlugin[];
export declare function getChannelSetupPlugin(id: ChannelId): ChannelPlugin | undefined;
