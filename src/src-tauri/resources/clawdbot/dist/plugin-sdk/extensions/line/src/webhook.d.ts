import type { webhook } from "@line/bot-sdk";
import type { NextFunction, Request, Response } from "express";
import { type RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
export interface LineWebhookOptions {
    channelSecret: string;
    onEvents: (body: webhook.CallbackRequest) => Promise<void>;
    runtime?: RuntimeEnv;
}
export declare function createLineWebhookMiddleware(options: LineWebhookOptions): (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export interface StartLineWebhookOptions {
    channelSecret: string;
    onEvents: (body: webhook.CallbackRequest) => Promise<void>;
    runtime?: RuntimeEnv;
    path?: string;
}
export declare function startLineWebhook(options: StartLineWebhookOptions): {
    path: string;
    handler: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
};
