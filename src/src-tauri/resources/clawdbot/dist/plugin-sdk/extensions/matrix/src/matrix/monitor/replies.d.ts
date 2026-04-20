import type { MatrixClient } from "../sdk.js";
import type { MarkdownTableMode, OpenClawConfig, ReplyPayload, RuntimeEnv } from "./runtime-api.js";
export declare function deliverMatrixReplies(params: {
    cfg: OpenClawConfig;
    replies: ReplyPayload[];
    roomId: string;
    client: MatrixClient;
    runtime: RuntimeEnv;
    textLimit: number;
    replyToMode: "off" | "first" | "all" | "batched";
    threadId?: string;
    accountId?: string;
    mediaLocalRoots?: readonly string[];
    tableMode?: MarkdownTableMode;
}): Promise<boolean>;
