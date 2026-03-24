import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import type { Dirent } from "node:fs";
type CredentialFs = {
    existsSync: (path: Parameters<typeof existsSync>[0]) => ReturnType<typeof existsSync>;
    readFileSync: (path: Parameters<typeof readFileSync>[0], encoding: "utf8") => string;
    realpathSync: (path: Parameters<typeof realpathSync>[0]) => string;
    readdirSync: (path: Parameters<typeof readdirSync>[0], options: {
        withFileTypes: true;
    }) => Dirent[];
};
export declare function clearCredentialsCache(): void;
export declare function setOAuthCredentialsFsForTest(overrides?: Partial<CredentialFs>): void;
export declare function extractGeminiCliCredentials(): {
    clientId: string;
    clientSecret: string;
} | null;
export declare function resolveOAuthClientConfig(): {
    clientId: string;
    clientSecret?: string;
};
export {};
