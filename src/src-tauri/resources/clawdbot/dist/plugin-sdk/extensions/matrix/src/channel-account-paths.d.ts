import type { PinnedDispatcherPolicy, SsrFPolicy } from "openclaw/plugin-sdk/infra-runtime";
import type { MatrixProbe } from "./matrix/probe.js";
import type { CoreConfig } from "./types.js";
type ResolveMatrixAuth = (params: {
    cfg: CoreConfig;
    accountId?: string;
}) => Promise<{
    homeserver: string;
    accessToken: string;
    userId: string;
    deviceId?: string;
    allowPrivateNetwork?: boolean;
    ssrfPolicy?: SsrFPolicy;
    dispatcherPolicy?: PinnedDispatcherPolicy;
}>;
type ProbeMatrix = (params: {
    homeserver: string;
    accessToken: string;
    userId: string;
    deviceId?: string;
    timeoutMs: number;
    accountId?: string;
    allowPrivateNetwork?: boolean;
    ssrfPolicy?: SsrFPolicy;
    dispatcherPolicy?: PinnedDispatcherPolicy;
}) => Promise<MatrixProbe>;
type SendMessageMatrix = (to: string, message: string, options?: {
    accountId?: string;
}) => Promise<unknown>;
export declare function createMatrixProbeAccount(params: {
    resolveMatrixAuth: ResolveMatrixAuth;
    probeMatrix: ProbeMatrix;
}): ({ account, timeoutMs, cfg, }: {
    account: {
        accountId?: string;
    };
    timeoutMs?: number;
    cfg: unknown;
}) => Promise<MatrixProbe>;
export declare function createMatrixPairingText(sendMessageMatrix: SendMessageMatrix): {
    idLabel: string;
    message: string;
    normalizeAllowEntry: (entry: string) => string;
    notify: ({ id, message, accountId, }: {
        id: string;
        message: string;
        accountId?: string;
    }) => Promise<void>;
};
export {};
