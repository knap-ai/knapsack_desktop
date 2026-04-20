import type { OpenClawConfig } from "../runtime-api.js";
import type { ResolvedTelegramAccount } from "./accounts.js";
export declare function collectTelegramSecurityAuditFindings(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    account: ResolvedTelegramAccount;
}): Promise<{
    checkId: string;
    severity: "info" | "warn" | "critical";
    title: string;
    detail: string;
    remediation?: string;
}[]>;
