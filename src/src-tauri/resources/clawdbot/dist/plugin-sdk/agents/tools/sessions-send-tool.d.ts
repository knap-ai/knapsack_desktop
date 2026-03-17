import type { OpenClawConfig } from "../../config/config.js";
import { type GatewayMessageChannel } from "../../utils/message-channel.js";
import type { AnyAgentTool } from "./common.js";
export declare function createSessionsSendTool(opts?: {
    agentSessionKey?: string;
    agentChannel?: GatewayMessageChannel;
    sandboxed?: boolean;
    config?: OpenClawConfig;
}): AnyAgentTool;
