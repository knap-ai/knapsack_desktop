import { Button, Command, StringSelectMenu } from "@buape/carbon";
import { type NativeCommandSpec } from "openclaw/plugin-sdk/command-auth";
import type { OpenClawConfig, loadConfig } from "openclaw/plugin-sdk/config-runtime";
import { type DiscordCommandArgContext, type DiscordModelPickerContext } from "./native-command-ui.js";
import type { ThreadBindingManager } from "./thread-bindings.js";
type DiscordConfig = NonNullable<OpenClawConfig["channels"]>["discord"];
export declare function createDiscordNativeCommand(params: {
    command: NativeCommandSpec;
    cfg: ReturnType<typeof loadConfig>;
    discordConfig: DiscordConfig;
    accountId: string;
    sessionPrefix: string;
    ephemeralDefault: boolean;
    threadBindings: ThreadBindingManager;
}): Command;
export declare function createDiscordCommandArgFallbackButton(params: DiscordCommandArgContext): Button;
export declare function createDiscordModelPickerFallbackButton(params: DiscordModelPickerContext): Button;
export declare function createDiscordModelPickerFallbackSelect(params: DiscordModelPickerContext): StringSelectMenu;
export {};
