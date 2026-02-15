export type { DirectoryConfigParams } from "./plugins/directory-config.js";
export type { ChannelDirectoryEntry } from "./plugins/types.js";
export type MessagingTargetKind = "user" | "channel";
export type MessagingTarget = {
    kind: MessagingTargetKind;
    id: string;
    raw: string;
    normalized: string;
};
export type MessagingTargetParseOptions = {
    defaultKind?: MessagingTargetKind;
    ambiguousMessage?: string;
};
export declare function normalizeTargetId(kind: MessagingTargetKind, id: string): string;
export declare function buildMessagingTarget(kind: MessagingTargetKind, id: string, raw: string): MessagingTarget;
export declare function ensureTargetId(params: {
    candidate: string;
    pattern: RegExp;
    errorMessage: string;
}): string;
export declare function requireTargetKind(params: {
    platform: string;
    target: MessagingTarget | undefined;
    kind: MessagingTargetKind;
}): string;
