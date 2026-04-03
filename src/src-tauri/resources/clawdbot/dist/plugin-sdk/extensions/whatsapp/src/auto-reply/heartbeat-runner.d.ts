import { loadConfig } from "openclaw/plugin-sdk/config-runtime";
import { getReplyFromConfig } from "openclaw/plugin-sdk/reply-runtime";
import { sendMessageWhatsApp } from "../send.js";
export declare function runWebHeartbeatOnce(opts: {
    cfg?: ReturnType<typeof loadConfig>;
    to: string;
    verbose?: boolean;
    replyResolver?: typeof getReplyFromConfig;
    sender?: typeof sendMessageWhatsApp;
    sessionId?: string;
    overrideBody?: string;
    dryRun?: boolean;
}): Promise<void>;
export declare function resolveHeartbeatRecipients(cfg: ReturnType<typeof loadConfig>, opts?: {
    to?: string;
    all?: boolean;
}): {
    recipients: string[];
    source: string;
};
