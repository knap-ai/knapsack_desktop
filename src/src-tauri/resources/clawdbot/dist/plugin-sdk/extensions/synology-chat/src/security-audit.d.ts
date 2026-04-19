import type { ResolvedSynologyChatAccount } from "./types.js";
export declare function collectSynologyChatSecurityAuditFindings(params: {
    accountId?: string | null;
    account: ResolvedSynologyChatAccount;
    orderedAccountIds: string[];
    hasExplicitAccountPath: boolean;
}): {
    checkId: string;
    severity: "info";
    title: string;
    detail: string;
    remediation: string;
}[];
