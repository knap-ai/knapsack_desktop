import type { OpenClawConfig } from "../../config/config.js";
import type { MsgContext } from "../templating.js";
export declare function resolveElevatedPermissions(params: {
    cfg: OpenClawConfig;
    agentId: string;
    ctx: MsgContext;
    provider: string;
}): {
    enabled: boolean;
    allowed: boolean;
    failures: Array<{
        gate: string;
        key: string;
    }>;
};
export declare function formatElevatedUnavailableMessage(params: {
    runtimeSandboxed: boolean;
    failures: Array<{
        gate: string;
        key: string;
    }>;
    sessionKey?: string;
}): string;
