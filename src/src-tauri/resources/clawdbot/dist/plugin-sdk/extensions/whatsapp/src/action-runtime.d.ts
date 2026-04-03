import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import { resolveAuthorizedWhatsAppOutboundTarget } from "./action-runtime-target-auth.js";
import { type OpenClawConfig } from "./runtime-api.js";
import { sendReactionWhatsApp } from "./send.js";
export declare const whatsAppActionRuntime: {
    resolveAuthorizedWhatsAppOutboundTarget: typeof resolveAuthorizedWhatsAppOutboundTarget;
    sendReactionWhatsApp: typeof sendReactionWhatsApp;
};
export declare function handleWhatsAppAction(params: Record<string, unknown>, cfg: OpenClawConfig): Promise<AgentToolResult<unknown>>;
