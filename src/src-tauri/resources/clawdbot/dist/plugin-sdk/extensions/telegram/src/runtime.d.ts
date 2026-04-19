export type { TelegramChannelRuntime, TelegramRuntime } from "./runtime.types.js";
import type { TelegramRuntime } from "./runtime.types.js";
declare const setTelegramRuntime: (next: TelegramRuntime) => void, clearTelegramRuntime: () => void, getTelegramRuntime: () => TelegramRuntime;
export { clearTelegramRuntime, getTelegramRuntime, setTelegramRuntime };
