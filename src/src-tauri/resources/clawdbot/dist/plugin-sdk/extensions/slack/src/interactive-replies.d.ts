import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ReplyPayload } from "openclaw/plugin-sdk/reply-runtime";
export declare function isSlackInteractiveRepliesEnabled(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): boolean;
export declare function compileSlackInteractiveReplies(payload: ReplyPayload): ReplyPayload;
export declare function parseSlackOptionsLine(payload: ReplyPayload): ReplyPayload;
