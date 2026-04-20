import type { OpenClawConfig } from "./runtime-api.js";
export declare function collectFeishuSecurityAuditFindings(params: {
    cfg: OpenClawConfig;
}): {
    checkId: string;
    severity: "warn";
    title: string;
    detail: string;
    remediation: string;
}[];
