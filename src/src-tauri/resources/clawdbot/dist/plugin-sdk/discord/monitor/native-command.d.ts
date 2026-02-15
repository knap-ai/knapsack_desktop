import { Button, Command } from "@buape/carbon";
import type { NativeCommandSpec } from "../../auto-reply/commands-registry.js";
import type { OpenClawConfig, loadConfig } from "../../config/config.js";
type DiscordConfig = NonNullable<OpenClawConfig["channels"]>["discord"];
type DiscordCommandArgContext = {
    cfg: ReturnType<typeof loadConfig>;
    discordConfig: DiscordConfig;
    accountId: string;
    sessionPrefix: string;
};
export declare function createDiscordCommandArgFallbackButton(params: DiscordCommandArgContext): Button;
export declare function createDiscordNativeCommand(params: {
    command: NativeCommandSpec;
    cfg: ReturnType<typeof loadConfig>;
    discordConfig: DiscordConfig;
    accountId: string;
    sessionPrefix: string;
    ephemeralDefault: boolean;
}): Command;
export {};
