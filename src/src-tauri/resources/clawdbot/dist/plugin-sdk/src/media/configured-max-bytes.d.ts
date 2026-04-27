import type { OpenClawConfig } from "../config/types.openclaw.js";
export declare function resolveConfiguredMediaMaxBytes(cfg?: OpenClawConfig): number | undefined;
export declare function resolveChannelAccountMediaMaxMb(params: {
    cfg: OpenClawConfig;
    channel?: string | null;
    accountId?: string | null;
}): number | undefined;
