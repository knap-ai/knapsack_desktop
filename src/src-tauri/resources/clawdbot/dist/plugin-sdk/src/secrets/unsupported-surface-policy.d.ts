export declare const UNSUPPORTED_SECRETREF_SURFACE_PATTERNS: readonly ["commands.ownerDisplaySecret", "hooks.token", "hooks.gmail.pushToken", "hooks.mappings[].sessionKey", "auth-profiles.oauth.*", "channels.discord.threadBindings.webhookToken", "channels.discord.accounts.*.threadBindings.webhookToken", "channels.whatsapp.creds.json", "channels.whatsapp.accounts.*.creds.json"];
export type UnsupportedSecretRefConfigCandidate = {
    path: string;
    value: unknown;
};
export declare function collectUnsupportedSecretRefConfigCandidates(raw: unknown): UnsupportedSecretRefConfigCandidate[];
