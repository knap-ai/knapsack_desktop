import { z } from "openclaw/plugin-sdk/zod";
export declare const QaChannelAccountConfigSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    baseUrl: z.ZodOptional<z.ZodString>;
    botUserId: z.ZodOptional<z.ZodString>;
    botDisplayName: z.ZodOptional<z.ZodString>;
    pollTimeoutMs: z.ZodOptional<z.ZodNumber>;
    allowFrom: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    defaultTo: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodObject<{
        messages: z.ZodOptional<z.ZodBoolean>;
        reactions: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodBoolean>;
        threads: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const QaChannelConfigSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    baseUrl: z.ZodOptional<z.ZodString>;
    botUserId: z.ZodOptional<z.ZodString>;
    botDisplayName: z.ZodOptional<z.ZodString>;
    pollTimeoutMs: z.ZodOptional<z.ZodNumber>;
    allowFrom: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    defaultTo: z.ZodOptional<z.ZodString>;
    actions: z.ZodOptional<z.ZodObject<{
        messages: z.ZodOptional<z.ZodBoolean>;
        reactions: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodBoolean>;
        threads: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strict>>;
    accounts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        enabled: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
        baseUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        botUserId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        botDisplayName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        pollTimeoutMs: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
        allowFrom: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>>;
        defaultTo: z.ZodOptional<z.ZodOptional<z.ZodString>>;
        actions: z.ZodOptional<z.ZodOptional<z.ZodObject<{
            messages: z.ZodOptional<z.ZodBoolean>;
            reactions: z.ZodOptional<z.ZodBoolean>;
            search: z.ZodOptional<z.ZodBoolean>;
            threads: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strict>>>;
    }, z.core.$strict>>>;
    defaultAccount: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const qaChannelPluginConfigSchema: import("openclaw/plugin-sdk").ChannelConfigSchema;
