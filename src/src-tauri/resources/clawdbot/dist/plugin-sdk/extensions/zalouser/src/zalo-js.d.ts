import type { ZaloAuthStatus, ZaloEventMessage, ZaloGroupContext, ZaloGroup, ZaloGroupMember, ZaloInboundMessage, ZaloSendOptions, ZaloSendResult, ZcaFriend, ZcaUserInfo } from "./types.js";
export declare function zalouserSessionExists(profileInput?: string | null): boolean;
export declare function checkZaloAuthenticated(profileInput?: string | null): Promise<boolean>;
export declare function getZaloUserInfo(profileInput?: string | null): Promise<ZcaUserInfo | null>;
export declare function listZaloFriends(profileInput?: string | null): Promise<ZcaFriend[]>;
export declare function listZaloFriendsMatching(profileInput: string | null | undefined, query?: string | null): Promise<ZcaFriend[]>;
export declare function listZaloGroups(profileInput?: string | null): Promise<ZaloGroup[]>;
export declare function listZaloGroupsMatching(profileInput: string | null | undefined, query?: string | null): Promise<ZaloGroup[]>;
export declare function listZaloGroupMembers(profileInput: string | null | undefined, groupId: string): Promise<ZaloGroupMember[]>;
export declare function resolveZaloGroupContext(profileInput: string | null | undefined, groupId: string): Promise<ZaloGroupContext>;
export declare function sendZaloTextMessage(threadId: string, text: string, options?: ZaloSendOptions): Promise<ZaloSendResult>;
export declare function sendZaloTypingEvent(threadId: string, options?: Pick<ZaloSendOptions, "profile" | "isGroup">): Promise<void>;
export declare function sendZaloReaction(params: {
    profile?: string | null;
    threadId: string;
    isGroup?: boolean;
    msgId: string;
    cliMsgId: string;
    emoji: string;
    remove?: boolean;
}): Promise<{
    ok: boolean;
    error?: string;
}>;
export declare function sendZaloDeliveredEvent(params: {
    profile?: string | null;
    isGroup?: boolean;
    message: ZaloEventMessage;
    isSeen?: boolean;
}): Promise<void>;
export declare function sendZaloSeenEvent(params: {
    profile?: string | null;
    isGroup?: boolean;
    message: ZaloEventMessage;
}): Promise<void>;
export declare function sendZaloLink(threadId: string, url: string, options?: ZaloSendOptions): Promise<ZaloSendResult>;
export declare function startZaloQrLogin(params: {
    profile?: string | null;
    force?: boolean;
    timeoutMs?: number;
}): Promise<{
    qrDataUrl?: string;
    message: string;
}>;
export declare function waitForZaloQrLogin(params: {
    profile?: string | null;
    timeoutMs?: number;
}): Promise<ZaloAuthStatus>;
export declare function logoutZaloProfile(profileInput?: string | null): Promise<{
    cleared: boolean;
    loggedOut: boolean;
    message: string;
}>;
export declare function startZaloListener(params: {
    accountId: string;
    profile?: string | null;
    abortSignal: AbortSignal;
    onMessage: (message: ZaloInboundMessage) => void;
    onError: (error: Error) => void;
}): Promise<{
    stop: () => void;
}>;
export declare function resolveZaloGroupsByEntries(params: {
    profile?: string | null;
    entries: string[];
}): Promise<Array<{
    input: string;
    resolved: boolean;
    id?: string;
}>>;
export declare function resolveZaloAllowFromEntries(params: {
    profile?: string | null;
    entries: string[];
}): Promise<Array<{
    input: string;
    resolved: boolean;
    id?: string;
    note?: string;
}>>;
export declare function clearProfileRuntimeArtifacts(profileInput?: string | null): Promise<void>;
