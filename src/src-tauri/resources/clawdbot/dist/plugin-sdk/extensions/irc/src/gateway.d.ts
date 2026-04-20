import type { ChannelAccountSnapshot } from "openclaw/plugin-sdk/status-helpers";
import type { ResolvedIrcAccount } from "./accounts.js";
import type { RuntimeEnv } from "./runtime-api.js";
import type { CoreConfig } from "./types.js";
export declare function startIrcGatewayAccount(ctx: {
    cfg: CoreConfig;
    accountId: string;
    account: ResolvedIrcAccount;
    runtime: RuntimeEnv;
    abortSignal: AbortSignal;
    setStatus: (next: ChannelAccountSnapshot) => void;
    log?: {
        info?: (message: string) => void;
    };
}): Promise<void>;
