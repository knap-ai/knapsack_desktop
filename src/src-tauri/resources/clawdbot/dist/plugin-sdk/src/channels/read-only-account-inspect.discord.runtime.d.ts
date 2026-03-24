export type { InspectedDiscordAccount } from "../../extensions/discord/api.js";
type InspectDiscordAccount = typeof import("../../extensions/discord/api.js").inspectDiscordAccount;
export declare function inspectDiscordAccount(...args: Parameters<InspectDiscordAccount>): ReturnType<InspectDiscordAccount>;
