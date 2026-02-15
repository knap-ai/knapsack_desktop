import type { ReplyToMode } from "../config/types.js";
import type { SlackAppMentionEvent, SlackMessageEvent } from "./types.js";
export type SlackThreadContext = {
    incomingThreadTs?: string;
    messageTs?: string;
    isThreadReply: boolean;
    replyToId?: string;
    messageThreadId?: string;
};
export declare function resolveSlackThreadContext(params: {
    message: SlackMessageEvent | SlackAppMentionEvent;
    replyToMode: ReplyToMode;
}): SlackThreadContext;
export declare function resolveSlackThreadTargets(params: {
    message: SlackMessageEvent | SlackAppMentionEvent;
    replyToMode: ReplyToMode;
}): {
    replyThreadTs: string | undefined;
    statusThreadTs: string | undefined;
};
