import { GatewayPlugin } from "@buape/carbon/gateway";
import type { DiscordAccountConfig } from "openclaw/plugin-sdk/config-runtime";
import type { RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
export declare function resolveDiscordGatewayIntents(intentsConfig?: import("openclaw/plugin-sdk/config-runtime").DiscordIntentsConfig): number;
export declare function createDiscordGatewayPlugin(params: {
    discordConfig: DiscordAccountConfig;
    runtime: RuntimeEnv;
}): GatewayPlugin;
