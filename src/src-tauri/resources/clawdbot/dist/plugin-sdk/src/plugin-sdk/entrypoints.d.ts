export declare const pluginSdkEntrypoints: string[];
export declare const pluginSdkSubpaths: string[];
export declare const reservedBundledPluginSdkEntrypoints: readonly ["bluebubbles", "bluebubbles-policy", "browser-cdp", "browser-config-runtime", "browser-config-support", "browser-control-auth", "browser-node-runtime", "browser-profiles", "browser-security-runtime", "browser-setup-tools", "browser-support", "diagnostics-otel", "diagnostics-prometheus", "diffs", "feishu", "feishu-conversation", "feishu-setup", "github-copilot-login", "github-copilot-token", "googlechat", "googlechat-runtime-shared", "irc", "irc-surface", "line", "line-core", "line-runtime", "line-surface", "llm-task", "matrix", "matrix-helper", "matrix-runtime-heavy", "matrix-runtime-shared", "matrix-runtime-surface", "matrix-surface", "matrix-thread-bindings", "mattermost", "mattermost-policy", "memory-core", "memory-lancedb", "msteams", "nextcloud-talk", "nostr", "opencode", "telegram-command-ui", "thread-ownership", "tlon", "twitch", "voice-call", "zalo", "zalo-setup", "zalouser"];
export declare const supportedBundledFacadeSdkEntrypoints: readonly ["lmstudio", "lmstudio-runtime", "memory-core-engine-runtime", "qa-runner-runtime", "tts-runtime"];
export declare const publicPluginOwnedSdkEntrypoints: readonly ["browser-config", "image-generation-core", "memory-core-host-engine-embeddings", "memory-core-host-engine-foundation", "memory-core-host-engine-qmd", "memory-core-host-engine-storage", "memory-core-host-events", "memory-core-host-multimodal", "memory-core-host-query", "memory-core-host-runtime-cli", "memory-core-host-runtime-core", "memory-core-host-runtime-files", "memory-core-host-secret", "memory-core-host-status", "memory-host-core", "memory-host-events", "memory-host-files", "memory-host-markdown", "memory-host-search", "memory-host-status", "speech-core", "telegram-command-config", "video-generation-core"];
/** Map every SDK entrypoint name to its source file path inside the repo. */
export declare function buildPluginSdkEntrySources(entries?: readonly string[]): {
    [k: string]: string;
};
/** List the public package specifiers that should resolve to plugin SDK entrypoints. */
export declare function buildPluginSdkSpecifiers(): string[];
/** Build the package.json exports map for all plugin SDK subpaths. */
export declare function buildPluginSdkPackageExports(): {
    [k: string]: {
        types: string;
        default: string;
    };
};
/** List the dist artifacts expected for every generated plugin SDK entrypoint. */
export declare function listPluginSdkDistArtifacts(): string[];
