import type { OpenClawConfig } from "../config/types.openclaw.js";
export declare function ensureModelAllowlistEntry(params: {
    cfg: OpenClawConfig;
    modelRef: string;
    defaultProvider?: string;
}): OpenClawConfig;
