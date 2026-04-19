import type { AuthProfileStore, OAuthCredential } from "./types.js";
type ExternalCliSyncOptions = {
    log?: boolean;
};
export declare function areOAuthCredentialsEquivalent(a: OAuthCredential | undefined, b: OAuthCredential): boolean;
export declare function shouldReplaceStoredOAuthCredential(existing: OAuthCredential | undefined, incoming: OAuthCredential): boolean;
export declare function readManagedExternalCliCredential(params: {
    profileId?: string;
    credential: OAuthCredential;
}): OAuthCredential | null;
/**
 * Sync OAuth credentials from external CLI tools (MiniMax CLI, Codex CLI)
 * into the store.
 *
 * Returns true if any credentials were updated.
 */
export declare function syncExternalCliCredentials(store: AuthProfileStore, options?: ExternalCliSyncOptions): boolean;
export {};
