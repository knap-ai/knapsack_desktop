import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { OpenClawConfig } from "../../config/config.js";
type TelegramButton = {
    text: string;
    callback_data: string;
};
export declare function readTelegramButtons(params: Record<string, unknown>): TelegramButton[][] | undefined;
export declare function handleTelegramAction(params: Record<string, unknown>, cfg: OpenClawConfig): Promise<AgentToolResult<unknown>>;
export {};
