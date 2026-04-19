import { loadAuthProfileStoreForRuntime } from "./auth-profiles/store.js";
import { readClaudeCliCredentialsCached, readCodexCliCredentialsCached } from "./cli-credentials.js";
type CliAuthEpochDeps = {
    readClaudeCliCredentialsCached: typeof readClaudeCliCredentialsCached;
    readCodexCliCredentialsCached: typeof readCodexCliCredentialsCached;
    loadAuthProfileStoreForRuntime: typeof loadAuthProfileStoreForRuntime;
};
export declare function setCliAuthEpochTestDeps(overrides: Partial<CliAuthEpochDeps>): void;
export declare function resetCliAuthEpochTestDeps(): void;
export declare function resolveCliAuthEpoch(params: {
    provider: string;
    authProfileId?: string;
}): Promise<string | undefined>;
export {};
