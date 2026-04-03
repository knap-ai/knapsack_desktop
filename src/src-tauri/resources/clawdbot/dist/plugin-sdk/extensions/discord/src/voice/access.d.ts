import type { Guild } from "@buape/carbon";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { DiscordAccountConfig } from "openclaw/plugin-sdk/config-runtime";
export declare function authorizeDiscordVoiceIngress(params: {
    cfg: OpenClawConfig;
    discordConfig: DiscordAccountConfig;
    groupPolicy?: "open" | "disabled" | "allowlist";
    useAccessGroups?: boolean;
    guild?: Guild<true> | Guild | null;
    guildName?: string;
    guildId: string;
    channelId: string;
    channelName?: string;
    channelSlug: string;
    parentId?: string;
    parentName?: string;
    parentSlug?: string;
    scope?: "channel" | "thread";
    channelLabel?: string;
    memberRoleIds: string[];
    sender: {
        id: string;
        name?: string;
        tag?: string;
    };
}): Promise<{
    ok: true;
} | {
    ok: false;
    message: string;
}>;
