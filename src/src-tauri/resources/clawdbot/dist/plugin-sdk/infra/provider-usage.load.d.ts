import type { UsageProviderId, UsageSummary } from "./provider-usage.types.js";
import { type ProviderAuth } from "./provider-usage.auth.js";
type UsageSummaryOptions = {
    now?: number;
    timeoutMs?: number;
    providers?: UsageProviderId[];
    auth?: ProviderAuth[];
    agentDir?: string;
    fetch?: typeof fetch;
};
export declare function loadProviderUsageSummary(opts?: UsageSummaryOptions): Promise<UsageSummary>;
export {};
