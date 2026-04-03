import type { SessionEntry } from "../config/sessions/types.js";
export type AcpSessionInteractionMode = "interactive" | "parent-owned-background";
type SessionInteractionEntry = Pick<SessionEntry, "spawnedBy" | "parentSessionKey" | "acp">;
export declare function resolveAcpSessionInteractionMode(entry?: SessionInteractionEntry | null): AcpSessionInteractionMode;
export declare function isParentOwnedBackgroundAcpSession(entry?: SessionInteractionEntry | null): boolean;
export {};
