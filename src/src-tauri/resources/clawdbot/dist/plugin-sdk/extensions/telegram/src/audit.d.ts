import type { TelegramGroupConfig } from "openclaw/plugin-sdk/config-runtime";
export type { AuditTelegramGroupMembershipParams, TelegramGroupMembershipAudit, TelegramGroupMembershipAuditEntry, } from "./audit.types.js";
import type { AuditTelegramGroupMembershipParams, TelegramGroupMembershipAudit } from "./audit.types.js";
export declare function collectTelegramUnmentionedGroupIds(groups: Record<string, TelegramGroupConfig> | undefined): {
    groupIds: string[];
    unresolvedGroups: number;
    hasWildcardUnmentionedGroups: boolean;
};
export declare function auditTelegramGroupMembership(params: AuditTelegramGroupMembershipParams): Promise<TelegramGroupMembershipAudit>;
