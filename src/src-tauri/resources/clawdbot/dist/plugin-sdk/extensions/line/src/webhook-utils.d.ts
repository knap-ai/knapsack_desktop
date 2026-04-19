import type { webhook } from "@line/bot-sdk";
export { validateLineSignature } from "./signature.js";
export declare function parseLineWebhookBody(rawBody: string): webhook.CallbackRequest | null;
