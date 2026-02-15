import type { Guild, User } from "@buape/carbon";
import type { AllowlistMatch } from "../../channels/allowlist-match.js";
import { type ChannelMatchSource } from "../../channels/channel-config.js";
export type DiscordAllowList = {
    allowAll: boolean;
    ids: Set<string>;
    names: Set<string>;
};
export type DiscordAllowListMatch = AllowlistMatch<"wildcard" | "id" | "name" | "tag">;
export type DiscordGuildEntryResolved = {
    id?: string;
    slug?: string;
    requireMention?: boolean;
    reactionNotifications?: "off" | "own" | "all" | "allowlist";
    users?: Array<string | number>;
    roles?: Array<string | number>;
    channels?: Record<string, {
        allow?: boolean;
        requireMention?: boolean;
        skills?: string[];
        enabled?: boolean;
        users?: Array<string | number>;
        roles?: Array<string | number>;
        systemPrompt?: string;
        includeThreadStarter?: boolean;
        autoThread?: boolean;
    }>;
};
export type DiscordChannelConfigResolved = {
    allowed: boolean;
    requireMention?: boolean;
    skills?: string[];
    enabled?: boolean;
    users?: Array<string | number>;
    roles?: Array<string | number>;
    systemPrompt?: string;
    includeThreadStarter?: boolean;
    autoThread?: boolean;
    matchKey?: string;
    matchSource?: ChannelMatchSource;
};
export declare function normalizeDiscordAllowList(raw: Array<string | number> | undefined, prefixes: string[]): {
    allowAll: boolean;
    ids: Set<string>;
    names: Set<string>;
} | null;
export declare function normalizeDiscordSlug(value: string): string;
export declare function allowListMatches(list: DiscordAllowList, candidate: {
    id?: string;
    name?: string;
    tag?: string;
}): boolean;
export declare function resolveDiscordAllowListMatch(params: {
    allowList: DiscordAllowList;
    candidate: {
        id?: string;
        name?: string;
        tag?: string;
    };
}): DiscordAllowListMatch;
export declare function resolveDiscordUserAllowed(params: {
    allowList?: Array<string | number>;
    userId: string;
    userName?: string;
    userTag?: string;
}): boolean;
export declare function resolveDiscordRoleAllowed(params: {
    allowList?: Array<string | number>;
    memberRoleIds: string[];
}): boolean;
export declare function resolveDiscordMemberAllowed(params: {
    userAllowList?: Array<string | number>;
    roleAllowList?: Array<string | number>;
    memberRoleIds: string[];
    userId: string;
    userName?: string;
    userTag?: string;
}): boolean;
export declare function resolveDiscordOwnerAllowFrom(params: {
    channelConfig?: DiscordChannelConfigResolved | null;
    guildInfo?: DiscordGuildEntryResolved | null;
    sender: {
        id: string;
        name?: string;
        tag?: string;
    };
}): string[] | undefined;
export declare function resolveDiscordCommandAuthorized(params: {
    isDirectMessage: boolean;
    allowFrom?: Array<string | number>;
    guildInfo?: DiscordGuildEntryResolved | null;
    author: User;
}): boolean;
export declare function resolveDiscordGuildEntry(params: {
    guild?: Guild<true> | Guild | null;
    guildEntries?: Record<string, DiscordGuildEntryResolved>;
}): DiscordGuildEntryResolved | null;
type DiscordChannelScope = "channel" | "thread";
export declare function resolveDiscordChannelConfig(params: {
    guildInfo?: DiscordGuildEntryResolved | null;
    channelId: string;
    channelName?: string;
    channelSlug: string;
}): DiscordChannelConfigResolved | null;
export declare function resolveDiscordChannelConfigWithFallback(params: {
    guildInfo?: DiscordGuildEntryResolved | null;
    channelId: string;
    channelName?: string;
    channelSlug: string;
    parentId?: string;
    parentName?: string;
    parentSlug?: string;
    scope?: DiscordChannelScope;
}): DiscordChannelConfigResolved | null;
export declare function resolveDiscordShouldRequireMention(params: {
    isGuildMessage: boolean;
    isThread: boolean;
    botId?: string | null;
    threadOwnerId?: string | null;
    channelConfig?: DiscordChannelConfigResolved | null;
    guildInfo?: DiscordGuildEntryResolved | null;
    /** Pass pre-computed value to avoid redundant checks. */
    isAutoThreadOwnedByBot?: boolean;
}): boolean;
export declare function isDiscordAutoThreadOwnedByBot(params: {
    isThread: boolean;
    channelConfig?: DiscordChannelConfigResolved | null;
    botId?: string | null;
    threadOwnerId?: string | null;
}): boolean;
export declare function isDiscordGroupAllowedByPolicy(params: {
    groupPolicy: "open" | "disabled" | "allowlist";
    guildAllowlisted: boolean;
    channelAllowlistConfigured: boolean;
    channelAllowed: boolean;
}): boolean;
export declare function resolveGroupDmAllow(params: {
    channels?: Array<string | number>;
    channelId: string;
    channelName?: string;
    channelSlug: string;
}): boolean;
export declare function shouldEmitDiscordReactionNotification(params: {
    mode?: "off" | "own" | "all" | "allowlist";
    botId?: string;
    messageAuthorId?: string;
    userId: string;
    userName?: string;
    userTag?: string;
    allowlist?: Array<string | number>;
}): boolean;
export {};
