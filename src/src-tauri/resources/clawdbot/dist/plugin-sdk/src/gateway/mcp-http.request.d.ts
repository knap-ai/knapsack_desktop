import type { IncomingMessage, ServerResponse } from "node:http";
import type { OpenClawConfig } from "../config/types.openclaw.js";
export type McpRequestContext = {
    sessionKey: string;
    messageProvider: string | undefined;
    accountId: string | undefined;
    senderIsOwner: boolean | undefined;
};
export declare function validateMcpLoopbackRequest(params: {
    req: IncomingMessage;
    res: ServerResponse;
    token: string;
}): boolean;
export declare function readMcpHttpBody(req: IncomingMessage): Promise<string>;
export declare function resolveMcpRequestContext(req: IncomingMessage, cfg: OpenClawConfig): McpRequestContext;
