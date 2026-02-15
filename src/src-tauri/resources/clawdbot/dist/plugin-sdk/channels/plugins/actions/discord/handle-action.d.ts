import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ChannelMessageActionContext } from "../../types.js";
export declare function handleDiscordMessageAction(ctx: Pick<ChannelMessageActionContext, "action" | "params" | "cfg" | "accountId">): Promise<AgentToolResult<unknown>>;
