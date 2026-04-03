import { type OpenClawConfig } from "openclaw/plugin-sdk/account-core";
import type { WhatsAppAccountConfig } from "./runtime-api.js";
export declare function resolveMergedWhatsAppAccountConfig(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): WhatsAppAccountConfig & {
    accountId: string;
};
