import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ChannelMessageActionContext } from "openclaw/plugin-sdk/channel-contract";
export declare function handleDiscordMessageAction(ctx: Pick<ChannelMessageActionContext, "action" | "params" | "cfg" | "accountId" | "requesterSenderId" | "toolContext" | "mediaAccess" | "mediaLocalRoots" | "mediaReadFile">): Promise<AgentToolResult<unknown>>;
