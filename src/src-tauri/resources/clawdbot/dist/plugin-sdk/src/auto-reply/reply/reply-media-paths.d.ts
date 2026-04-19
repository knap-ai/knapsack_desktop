import type { OpenClawConfig } from "../../config/types.openclaw.js";
import type { ReplyPayload } from "../types.js";
export declare function createReplyMediaPathNormalizer(params: {
    cfg: OpenClawConfig;
    sessionKey?: string;
    workspaceDir: string;
    messageProvider?: string;
    accountId?: string;
    groupId?: string;
    groupChannel?: string;
    groupSpace?: string;
    requesterSenderId?: string;
    requesterSenderName?: string;
    requesterSenderUsername?: string;
    requesterSenderE164?: string;
}): (payload: ReplyPayload) => Promise<ReplyPayload>;
