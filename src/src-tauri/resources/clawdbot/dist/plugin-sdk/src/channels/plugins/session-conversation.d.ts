import { type ParsedThreadSessionSuffix } from "../../sessions/session-key-utils.js";
export type ResolvedSessionConversation = {
    id: string;
    threadId: string | undefined;
    baseConversationId: string;
    parentConversationCandidates: string[];
};
export type ResolvedSessionConversationRef = {
    channel: string;
    kind: "group" | "channel";
    rawId: string;
    id: string;
    threadId: string | undefined;
    baseSessionKey: string;
    baseConversationId: string;
    parentConversationCandidates: string[];
};
export declare function resolveSessionConversation(params: {
    channel: string;
    kind: "group" | "channel";
    rawId: string;
}): ResolvedSessionConversation | null;
export declare function resolveSessionConversationRef(sessionKey: string | undefined | null): ResolvedSessionConversationRef | null;
export declare function resolveSessionThreadInfo(sessionKey: string | undefined | null): ParsedThreadSessionSuffix;
export declare function resolveSessionParentSessionKey(sessionKey: string | undefined | null): string | null;
