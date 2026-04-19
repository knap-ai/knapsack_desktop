import type { IncomingMessage, ServerResponse } from "node:http";
import type { webhook } from "@line/bot-sdk";
import { type RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
export declare function readLineWebhookRequestBody(req: IncomingMessage, maxBytes?: number, timeoutMs?: number): Promise<string>;
type ReadBodyFn = (req: IncomingMessage, maxBytes: number, timeoutMs?: number) => Promise<string>;
export declare function createLineNodeWebhookHandler(params: {
    channelSecret: string;
    bot: {
        handleWebhook: (body: webhook.CallbackRequest) => Promise<void>;
    };
    runtime: RuntimeEnv;
    readBody?: ReadBodyFn;
    maxBodyBytes?: number;
    onRequestAuthenticated?: () => void;
}): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
export {};
