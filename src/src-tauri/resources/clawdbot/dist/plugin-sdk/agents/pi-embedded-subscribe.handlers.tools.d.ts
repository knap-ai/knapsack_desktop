import type { AgentEvent } from "@mariozechner/pi-agent-core";
import type { EmbeddedPiSubscribeContext } from "./pi-embedded-subscribe.handlers.types.js";
export declare function handleToolExecutionStart(ctx: EmbeddedPiSubscribeContext, evt: AgentEvent & {
    toolName: string;
    toolCallId: string;
    args: unknown;
}): Promise<void>;
export declare function handleToolExecutionUpdate(ctx: EmbeddedPiSubscribeContext, evt: AgentEvent & {
    toolName: string;
    toolCallId: string;
    partialResult?: unknown;
}): void;
export declare function handleToolExecutionEnd(ctx: EmbeddedPiSubscribeContext, evt: AgentEvent & {
    toolName: string;
    toolCallId: string;
    isError: boolean;
    result?: unknown;
}): Promise<void>;
