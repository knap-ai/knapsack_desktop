import { apiThrottler, Bot, sequentialize } from "./bot.runtime.js";
import type { TelegramBotOptions } from "./bot.types.js";
import { getTelegramSequentialKey } from "./sequential-key.js";
export type { TelegramBotOptions } from "./bot.types.js";
export { getTelegramSequentialKey };
type TelegramBotRuntime = {
    Bot: typeof Bot;
    sequentialize: typeof sequentialize;
    apiThrottler: typeof apiThrottler;
};
type TelegramBotInstance = InstanceType<TelegramBotRuntime["Bot"]>;
export declare function setTelegramBotRuntimeForTest(runtime?: TelegramBotRuntime): void;
export declare function createTelegramBot(opts: TelegramBotOptions): TelegramBotInstance;
