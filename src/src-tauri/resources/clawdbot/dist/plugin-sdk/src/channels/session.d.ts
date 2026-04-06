import type { MsgContext } from "../auto-reply/templating.js";
import type { GroupKeyResolution, SessionEntry } from "../config/sessions/types.js";
export type InboundLastRouteUpdate = {
    sessionKey: string;
    channel: SessionEntry["lastChannel"];
    to: string;
    accountId?: string;
    threadId?: string | number;
    mainDmOwnerPin?: {
        ownerRecipient: string;
        senderRecipient: string;
        onSkip?: (params: {
            ownerRecipient: string;
            senderRecipient: string;
        }) => void;
    };
};
export declare function recordInboundSession(params: {
    storePath: string;
    sessionKey: string;
    ctx: MsgContext;
    groupResolution?: GroupKeyResolution | null;
    createIfMissing?: boolean;
    updateLastRoute?: InboundLastRouteUpdate;
    onRecordError: (err: unknown) => void;
}): Promise<void>;
