export type { InspectedSlackAccount } from "../../extensions/slack/api.js";
type InspectSlackAccount = typeof import("../../extensions/slack/api.js").inspectSlackAccount;
export declare function inspectSlackAccount(...args: Parameters<InspectSlackAccount>): ReturnType<InspectSlackAccount>;
