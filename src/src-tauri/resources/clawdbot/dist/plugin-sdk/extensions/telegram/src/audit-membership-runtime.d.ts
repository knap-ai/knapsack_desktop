import type { AuditTelegramGroupMembershipParams, TelegramGroupMembershipAudit } from "./audit.types.js";
type TelegramGroupMembershipAuditData = Omit<TelegramGroupMembershipAudit, "elapsedMs">;
export declare function auditTelegramGroupMembershipImpl(params: AuditTelegramGroupMembershipParams): Promise<TelegramGroupMembershipAuditData>;
export {};
