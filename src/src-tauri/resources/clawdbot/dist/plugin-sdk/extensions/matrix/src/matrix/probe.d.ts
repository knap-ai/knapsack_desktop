import { type PinnedDispatcherPolicy } from "openclaw/plugin-sdk/infra-runtime";
import type { SsrFPolicy } from "../runtime-api.js";
import type { BaseProbeResult } from "../runtime-api.js";
export type MatrixProbe = BaseProbeResult & {
    status?: number | null;
    elapsedMs: number;
    userId?: string | null;
};
export declare function probeMatrix(params: {
    homeserver: string;
    accessToken: string;
    userId?: string;
    deviceId?: string;
    timeoutMs?: number;
    accountId?: string | null;
    allowPrivateNetwork?: boolean;
    ssrfPolicy?: SsrFPolicy;
    dispatcherPolicy?: PinnedDispatcherPolicy;
}): Promise<MatrixProbe>;
