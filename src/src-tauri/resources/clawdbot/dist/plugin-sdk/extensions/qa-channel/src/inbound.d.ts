import { type QaBusMessage } from "./bus-client.js";
import type { CoreConfig, ResolvedQaChannelAccount } from "./types.js";
export declare function handleQaInbound(params: {
    channelId: string;
    channelLabel: string;
    account: ResolvedQaChannelAccount;
    config: CoreConfig;
    message: QaBusMessage;
}): Promise<void>;
