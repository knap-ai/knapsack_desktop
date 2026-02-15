/**
 * pi-coding-agent's ModelRegistry/AuthStorage expects OAuth credentials in auth.json.
 *
 * OpenClaw stores OAuth credentials in auth-profiles.json instead. This helper
 * bridges a subset of credentials into agentDir/auth.json so pi-coding-agent can
 * (a) consider the provider authenticated and (b) include built-in models in its
 * registry/catalog output.
 *
 * Currently used for openai-codex.
 */
export declare function ensurePiAuthJsonFromAuthProfiles(agentDir: string): Promise<{
    wrote: boolean;
    authPath: string;
}>;
