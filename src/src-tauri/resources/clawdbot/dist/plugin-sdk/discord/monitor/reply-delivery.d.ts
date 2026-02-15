import type { RequestClient } from "@buape/carbon";
import type { ChunkMode } from "../../auto-reply/chunk.js";
import type { ReplyPayload } from "../../auto-reply/types.js";
import type { MarkdownTableMode } from "../../config/types.base.js";
import type { RuntimeEnv } from "../../runtime.js";
export declare function deliverDiscordReply(params: {
    replies: ReplyPayload[];
    target: string;
    token: string;
    accountId?: string;
    rest?: RequestClient;
    runtime: RuntimeEnv;
    textLimit: number;
    maxLinesPerMessage?: number;
    replyToId?: string;
    tableMode?: MarkdownTableMode;
    chunkMode?: ChunkMode;
}): Promise<void>;
