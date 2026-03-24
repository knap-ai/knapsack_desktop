export type { InspectedTelegramAccount } from "../../extensions/telegram/api.js";
type InspectTelegramAccount = typeof import("../../extensions/telegram/api.js").inspectTelegramAccount;
export declare function inspectTelegramAccount(...args: Parameters<InspectTelegramAccount>): ReturnType<InspectTelegramAccount>;
