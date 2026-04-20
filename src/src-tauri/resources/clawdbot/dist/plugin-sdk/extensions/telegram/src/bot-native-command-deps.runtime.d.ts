import { getPluginCommandSpecs } from "openclaw/plugin-sdk/plugin-runtime";
import type { TelegramBotDeps } from "./bot-deps.js";
export type TelegramNativeCommandDeps = Pick<TelegramBotDeps, "dispatchReplyWithBufferedBlockDispatcher" | "editMessageTelegram" | "listSkillCommandsForAgents" | "loadConfig" | "readChannelAllowFromStore" | "syncTelegramMenuCommands"> & {
    getPluginCommandSpecs?: typeof getPluginCommandSpecs;
};
export declare const defaultTelegramNativeCommandDeps: TelegramNativeCommandDeps;
