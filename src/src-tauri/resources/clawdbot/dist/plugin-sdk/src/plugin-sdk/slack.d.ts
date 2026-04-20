type InteractiveRepliesSurface = typeof import("@openclaw/slack/interactive-replies-api.js");
type SecuritySurface = typeof import("@openclaw/slack/security-contract-api.js");
export declare const compileSlackInteractiveReplies: InteractiveRepliesSurface["compileSlackInteractiveReplies"];
export declare const collectSlackSecurityAuditFindings: SecuritySurface["collectSlackSecurityAuditFindings"];
export {};
