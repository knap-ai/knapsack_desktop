import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type { ImageContent } from "@mariozechner/pi-ai";
import type { EmbeddedRunAttemptParams, EmbeddedRunAttemptResult } from "./types.js";
export declare function injectHistoryImagesIntoMessages(messages: AgentMessage[], historyImagesByIndex: Map<number, ImageContent[]>): boolean;
export declare function runEmbeddedAttempt(params: EmbeddedRunAttemptParams): Promise<EmbeddedRunAttemptResult>;
