import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { ReasoningLevel, VerboseLevel } from "../../../auto-reply/thinking.js";
import type { OpenClawConfig } from "../../../config/config.js";
import type { ToolResultFormat } from "../../pi-embedded-subscribe.js";
type ToolMetaEntry = {
    toolName: string;
    meta?: string;
};
export declare function buildEmbeddedRunPayloads(params: {
    assistantTexts: string[];
    toolMetas: ToolMetaEntry[];
    lastAssistant: AssistantMessage | undefined;
    lastToolError?: {
        toolName: string;
        meta?: string;
        error?: string;
    };
    config?: OpenClawConfig;
    sessionKey: string;
    provider?: string;
    verboseLevel?: VerboseLevel;
    reasoningLevel?: ReasoningLevel;
    toolResultFormat?: ToolResultFormat;
    inlineToolResultsAllowed: boolean;
}): Array<{
    text?: string;
    mediaUrl?: string;
    mediaUrls?: string[];
    replyToId?: string;
    isError?: boolean;
    audioAsVoice?: boolean;
    replyToTag?: boolean;
    replyToCurrent?: boolean;
}>;
export {};
