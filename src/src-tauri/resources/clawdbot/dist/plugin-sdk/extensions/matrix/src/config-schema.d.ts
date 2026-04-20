import { z } from "openclaw/plugin-sdk/zod";
export declare const MatrixConfigSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    defaultAccount: z.ZodOptional<z.ZodString>;
    accounts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    markdown: z.ZodOptional<z.ZodObject<{
        tables: z.ZodOptional<z.ZodEnum<{
            off: "off";
            block: "block";
            bullets: "bullets";
            code: "code";
        }>>;
    }, z.core.$strict>>;
    homeserver: z.ZodOptional<z.ZodString>;
    network: z.ZodOptional<z.ZodObject<{
        dangerouslyAllowPrivateNetwork: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
    proxy: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        source: z.ZodLiteral<"env">;
        provider: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodLiteral<"file">;
        provider: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodLiteral<"exec">;
        provider: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>], "source">]>>;
    password: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodDiscriminatedUnion<[z.ZodObject<{
        source: z.ZodLiteral<"env">;
        provider: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodLiteral<"file">;
        provider: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodLiteral<"exec">;
        provider: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>], "source">]>>;
    deviceId: z.ZodOptional<z.ZodString>;
    deviceName: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodString>;
    initialSyncLimit: z.ZodOptional<z.ZodNumber>;
    encryption: z.ZodOptional<z.ZodBoolean>;
    allowlistOnly: z.ZodOptional<z.ZodBoolean>;
    allowBots: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"mentions">]>>;
    groupPolicy: z.ZodOptional<z.ZodEnum<{
        open: "open";
        disabled: "disabled";
        allowlist: "allowlist";
    }>>;
    contextVisibility: z.ZodOptional<z.ZodEnum<{
        all: "all";
        allowlist: "allowlist";
        allowlist_quote: "allowlist_quote";
    }>>;
    blockStreaming: z.ZodOptional<z.ZodBoolean>;
    streaming: z.ZodOptional<z.ZodUnion<readonly [z.ZodEnum<{
        off: "off";
        partial: "partial";
        quiet: "quiet";
    }>, z.ZodBoolean]>>;
    replyToMode: z.ZodOptional<z.ZodEnum<{
        off: "off";
        all: "all";
        first: "first";
        batched: "batched";
    }>>;
    threadReplies: z.ZodOptional<z.ZodEnum<{
        off: "off";
        always: "always";
        inbound: "inbound";
    }>>;
    textChunkLimit: z.ZodOptional<z.ZodNumber>;
    chunkMode: z.ZodOptional<z.ZodEnum<{
        newline: "newline";
        length: "length";
    }>>;
    responsePrefix: z.ZodOptional<z.ZodString>;
    ackReaction: z.ZodOptional<z.ZodString>;
    ackReactionScope: z.ZodOptional<z.ZodEnum<{
        none: "none";
        direct: "direct";
        off: "off";
        all: "all";
        "group-mentions": "group-mentions";
        "group-all": "group-all";
    }>>;
    reactionNotifications: z.ZodOptional<z.ZodEnum<{
        off: "off";
        own: "own";
    }>>;
    threadBindings: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        idleHours: z.ZodOptional<z.ZodNumber>;
        maxAgeHours: z.ZodOptional<z.ZodNumber>;
        spawnSubagentSessions: z.ZodOptional<z.ZodBoolean>;
        spawnAcpSessions: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    startupVerification: z.ZodOptional<z.ZodEnum<{
        off: "off";
        "if-unverified": "if-unverified";
    }>>;
    startupVerificationCooldownHours: z.ZodOptional<z.ZodNumber>;
    mediaMaxMb: z.ZodOptional<z.ZodNumber>;
    historyLimit: z.ZodOptional<z.ZodNumber>;
    autoJoin: z.ZodOptional<z.ZodEnum<{
        off: "off";
        allowlist: "allowlist";
        always: "always";
    }>>;
    autoJoinAllowlist: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    groupAllowFrom: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    dm: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        policy: z.ZodOptional<z.ZodEnum<{
            open: "open";
            disabled: "disabled";
            allowlist: "allowlist";
            pairing: "pairing";
        }>>;
        allowFrom: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    }, z.core.$strip>>;
    execApprovals: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        approvers: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
        agentFilter: z.ZodOptional<z.ZodArray<z.ZodString>>;
        sessionFilter: z.ZodOptional<z.ZodArray<z.ZodString>>;
        target: z.ZodOptional<z.ZodEnum<{
            channel: "channel";
            dm: "dm";
            both: "both";
        }>>;
    }, z.core.$strip>>;
    groups: z.ZodOptional<z.ZodObject<{}, z.core.$catchall<z.ZodOptional<z.ZodObject<{
        account: z.ZodOptional<z.ZodString>;
        enabled: z.ZodOptional<z.ZodBoolean>;
        requireMention: z.ZodOptional<z.ZodBoolean>;
        allowBots: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"mentions">]>>;
        tools: z.ZodOptional<z.ZodObject<{
            allow: z.ZodOptional<z.ZodArray<z.ZodString>>;
            alsoAllow: z.ZodOptional<z.ZodArray<z.ZodString>>;
            deny: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        autoReply: z.ZodOptional<z.ZodBoolean>;
        users: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString>>;
        systemPrompt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>>;
    rooms: z.ZodOptional<z.ZodObject<{}, z.core.$catchall<z.ZodOptional<z.ZodObject<{
        account: z.ZodOptional<z.ZodString>;
        enabled: z.ZodOptional<z.ZodBoolean>;
        requireMention: z.ZodOptional<z.ZodBoolean>;
        allowBots: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodLiteral<"mentions">]>>;
        tools: z.ZodOptional<z.ZodObject<{
            allow: z.ZodOptional<z.ZodArray<z.ZodString>>;
            alsoAllow: z.ZodOptional<z.ZodArray<z.ZodString>>;
            deny: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
        autoReply: z.ZodOptional<z.ZodBoolean>;
        users: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
        skills: z.ZodOptional<z.ZodArray<z.ZodString>>;
        systemPrompt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>>>;
    actions: z.ZodOptional<z.ZodObject<{
        reactions: z.ZodOptional<z.ZodBoolean>;
        messages: z.ZodOptional<z.ZodBoolean>;
        pins: z.ZodOptional<z.ZodBoolean>;
        profile: z.ZodOptional<z.ZodBoolean>;
        memberInfo: z.ZodOptional<z.ZodBoolean>;
        channelInfo: z.ZodOptional<z.ZodBoolean>;
        verification: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
