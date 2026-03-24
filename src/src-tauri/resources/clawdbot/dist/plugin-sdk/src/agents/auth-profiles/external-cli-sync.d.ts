import type { AuthProfileStore } from "./types.js";
type ExternalCliSyncOptions = {
    log?: boolean;
};
/**
 * Sync OAuth credentials from external CLI tools (Qwen Code CLI, MiniMax CLI, Codex CLI)
 * into the store.
 *
 * Returns true if any credentials were updated.
 */
export declare function syncExternalCliCredentials(store: AuthProfileStore, options?: ExternalCliSyncOptions): boolean;
export {};
