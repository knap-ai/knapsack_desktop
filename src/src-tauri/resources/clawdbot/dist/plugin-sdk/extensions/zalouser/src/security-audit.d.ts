import type { ResolvedZalouserAccount } from "./accounts.js";
export declare function isZalouserMutableGroupEntry(raw: string): boolean;
export declare function collectZalouserSecurityAuditFindings(params: {
    accountId?: string | null;
    account: ResolvedZalouserAccount;
    orderedAccountIds: string[];
    hasExplicitAccountPath: boolean;
}): {
    checkId: string;
    severity: "warn" | "info";
    title: string;
    detail: string;
    remediation: string;
}[];
