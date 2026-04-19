import { z } from "openclaw/plugin-sdk/zod";
export declare const BlueBubblesConfigSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    markdown: z.ZodOptional<z.ZodObject<{
        tables: z.ZodOptional<z.ZodEnum<{
            off: "off";
            block: "block";
            bullets: "bullets";
            code: "code";
        }>>;
    }, z.core.$strict>>;
    serverUrl: z.ZodOptional<z.ZodString>;
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
    webhookPath: z.ZodOptional<z.ZodString>;
    dmPolicy: z.ZodOptional<z.ZodEnum<{
        open: "open";
        disabled: "disabled";
        allowlist: "allowlist";
        pairing: "pairing";
    }>>;
    allowFrom: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    groupAllowFrom: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    groupPolicy: z.ZodOptional<z.ZodEnum<{
        open: "open";
        disabled: "disabled";
        allowlist: "allowlist";
    }>>;
    enrichGroupParticipantsFromContacts: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    historyLimit: z.ZodOptional<z.ZodNumber>;
    dmHistoryLimit: z.ZodOptional<z.ZodNumber>;
    textChunkLimit: z.ZodOptional<z.ZodNumber>;
    chunkMode: z.ZodOptional<z.ZodEnum<{
        newline: "newline";
        length: "length";
    }>>;
    mediaMaxMb: z.ZodOptional<z.ZodNumber>;
    mediaLocalRoots: z.ZodOptional<z.ZodArray<z.ZodString>>;
    sendReadReceipts: z.ZodOptional<z.ZodBoolean>;
    network: z.ZodOptional<z.ZodObject<{
        dangerouslyAllowPrivateNetwork: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
    catchup: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodOptional<z.ZodBoolean>;
        maxAgeMinutes: z.ZodOptional<z.ZodNumber>;
        perRunLimit: z.ZodOptional<z.ZodNumber>;
        firstRunLookbackMinutes: z.ZodOptional<z.ZodNumber>;
        maxFailureRetries: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>;
    blockStreaming: z.ZodOptional<z.ZodBoolean>;
    groups: z.ZodOptional<z.ZodObject<{}, z.core.$catchall<z.ZodObject<{
        requireMention: z.ZodOptional<z.ZodBoolean>;
        tools: z.ZodOptional<z.ZodObject<{
            allow: z.ZodOptional<z.ZodArray<z.ZodString>>;
            alsoAllow: z.ZodOptional<z.ZodArray<z.ZodString>>;
            deny: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strict>>;
    }, z.core.$strip>>>>;
    actions: z.ZodOptional<z.ZodObject<{
        reactions: z.ZodDefault<z.ZodBoolean>;
        edit: z.ZodDefault<z.ZodBoolean>;
        unsend: z.ZodDefault<z.ZodBoolean>;
        reply: z.ZodDefault<z.ZodBoolean>;
        sendWithEffect: z.ZodDefault<z.ZodBoolean>;
        renameGroup: z.ZodDefault<z.ZodBoolean>;
        setGroupIcon: z.ZodDefault<z.ZodBoolean>;
        addParticipant: z.ZodDefault<z.ZodBoolean>;
        removeParticipant: z.ZodDefault<z.ZodBoolean>;
        leaveGroup: z.ZodDefault<z.ZodBoolean>;
        sendAttachment: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const BlueBubblesChannelConfigSchema: import("openclaw/plugin-sdk").ChannelConfigSchema;
