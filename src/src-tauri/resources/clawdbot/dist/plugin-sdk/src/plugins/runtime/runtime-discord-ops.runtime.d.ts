export declare const runtimeDiscordOps: {
    auditChannelPermissions: typeof import("@openclaw/discord/runtime-api.ts").auditDiscordChannelPermissions;
    listDirectoryGroupsLive: typeof import("@openclaw/discord/runtime-api.ts").listDiscordDirectoryGroupsLive;
    listDirectoryPeersLive: typeof import("@openclaw/discord/runtime-api.ts").listDiscordDirectoryPeersLive;
    probeDiscord: typeof import("@openclaw/discord/api.ts").probeDiscord;
    resolveChannelAllowlist: typeof import("@openclaw/discord/runtime-api.ts").resolveDiscordChannelAllowlist;
    resolveUserAllowlist: typeof import("@openclaw/discord/runtime-api.ts").resolveDiscordUserAllowlist;
    sendComponentMessage: typeof import("@openclaw/discord/runtime-api.ts").sendDiscordComponentMessage;
    sendMessageDiscord: typeof import("@openclaw/discord/runtime-api.ts").sendMessageDiscord;
    sendPollDiscord: typeof import("@openclaw/discord/runtime-api.ts").sendPollDiscord;
    monitorDiscordProvider: typeof import("@openclaw/discord/runtime-api.ts").monitorDiscordProvider;
    typing: {
        pulse: typeof import("@openclaw/discord/runtime-api.ts").sendTypingDiscord;
    };
    conversationActions: {
        editMessage: typeof import("@openclaw/discord/runtime-api.ts").editMessageDiscord;
        deleteMessage: typeof import("@openclaw/discord/runtime-api.ts").deleteMessageDiscord;
        pinMessage: typeof import("@openclaw/discord/runtime-api.ts").pinMessageDiscord;
        unpinMessage: typeof import("@openclaw/discord/runtime-api.ts").unpinMessageDiscord;
        createThread: typeof import("@openclaw/discord/runtime-api.ts").createThreadDiscord;
        editChannel: typeof import("@openclaw/discord/runtime-api.ts").editChannelDiscord;
    };
};
