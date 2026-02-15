import { type MessagingToolSend } from "./pi-embedded-messaging.js";
export declare function sanitizeToolResult(result: unknown): unknown;
export declare function extractToolResultText(result: unknown): string | undefined;
export declare function isToolResultError(result: unknown): boolean;
export declare function extractToolErrorMessage(result: unknown): string | undefined;
export declare function extractMessagingToolSend(toolName: string, args: Record<string, unknown>): MessagingToolSend | undefined;
