import { ChannelType } from "discord-api-types/v10";
import type { DiscordPermissionsSummary, DiscordReactOpts } from "./send.types.js";
export declare function isThreadChannelType(channelType?: number): channelType is ChannelType.AnnouncementThread | ChannelType.PublicThread | ChannelType.PrivateThread;
export declare function fetchChannelPermissionsDiscord(channelId: string, opts?: DiscordReactOpts): Promise<DiscordPermissionsSummary>;
