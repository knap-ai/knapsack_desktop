import type { ChannelConfigRuntimeSchema } from "../channels/plugins/types.config.js";
import { MANIFEST_KEY } from "../compat/legacy-names.js";
import { type PluginManifestCommandAlias } from "./manifest-command-aliases.js";
import type { PluginConfigUiHint } from "./manifest-types.js";
import type { PluginKind } from "./plugin-kind.types.js";
export declare const PLUGIN_MANIFEST_FILENAME = "openclaw.plugin.json";
export declare const PLUGIN_MANIFEST_FILENAMES: readonly ["openclaw.plugin.json"];
export type PluginManifestChannelConfig = {
    schema: Record<string, unknown>;
    uiHints?: Record<string, PluginConfigUiHint>;
    runtime?: ChannelConfigRuntimeSchema;
    label?: string;
    description?: string;
    preferOver?: string[];
};
export type PluginManifestModelSupport = {
    /**
     * Cheap manifest-owned model-id prefixes for transparent provider activation
     * from shorthand model refs such as `gpt-5.4` or `claude-sonnet-4.6`.
     */
    modelPrefixes?: string[];
    /**
     * Regex sources matched against the raw model id after profile suffixes are
     * stripped. Use this when simple prefixes are not expressive enough.
     */
    modelPatterns?: string[];
};
export type PluginManifestActivationCapability = "provider" | "channel" | "tool" | "hook";
export type PluginManifestActivation = {
    /**
     * Provider ids that should activate this plugin when explicitly requested.
     * This is metadata only; runtime loading still happens through the loader.
     */
    onProviders?: string[];
    /** Agent harness runtime ids that should activate this plugin. */
    onAgentHarnesses?: string[];
    /** Command ids that should activate this plugin. */
    onCommands?: string[];
    /** Channel ids that should activate this plugin. */
    onChannels?: string[];
    /** Route kinds that should activate this plugin. */
    onRoutes?: string[];
    /** Cheap capability hints used by future activation planning. */
    onCapabilities?: PluginManifestActivationCapability[];
};
export type PluginManifestSetupProvider = {
    /** Provider id surfaced during setup/onboarding. */
    id: string;
    /** Setup/auth methods that this provider supports. */
    authMethods?: string[];
    /** Environment variables that can satisfy setup without runtime loading. */
    envVars?: string[];
};
export type PluginManifestSetup = {
    /** Cheap provider setup metadata exposed before runtime loads. */
    providers?: PluginManifestSetupProvider[];
    /** Setup-time backend ids available without full runtime activation. */
    cliBackends?: string[];
    /** Config migration ids owned by this plugin's setup surface. */
    configMigrations?: string[];
    /**
     * Whether setup still needs plugin runtime execution after descriptor lookup.
     * Defaults to false when omitted.
     */
    requiresRuntime?: boolean;
};
export type PluginManifestQaRunner = {
    /** Subcommand mounted beneath `openclaw qa`, for example `matrix`. */
    commandName: string;
    /** Optional user-facing help text for fallback host stubs. */
    description?: string;
};
export type PluginManifestConfigLiteral = string | number | boolean | null;
export type PluginManifestDangerousConfigFlag = {
    /**
     * Dot-separated config path relative to `plugins.entries.<id>.config`.
     * Supports `*` wildcards for map/array segments.
     */
    path: string;
    /** Exact literal that marks this config value as dangerous. */
    equals: PluginManifestConfigLiteral;
};
export type PluginManifestSecretInputPath = {
    /**
     * Dot-separated config path relative to `plugins.entries.<id>.config`.
     * Supports `*` wildcards for map/array segments.
     */
    path: string;
    /** Expected resolved type for SecretRef materialization. */
    expected?: "string";
};
export type PluginManifestSecretInputContracts = {
    /**
     * Override bundled-plugin default enablement when deciding whether this
     * SecretRef surface is active. Use this when the plugin is bundled but the
     * surface should stay inactive until explicitly enabled in config.
     */
    bundledDefaultEnabled?: boolean;
    paths: PluginManifestSecretInputPath[];
};
export type PluginManifestConfigContracts = {
    /**
     * Root-relative config paths that indicate this plugin's setup-time
     * compatibility migrations might apply. Use this to keep generic runtime
     * config reads from loading every plugin setup surface when the config does
     * not reference the plugin at all.
     */
    compatibilityMigrationPaths?: string[];
    /**
     * Root-relative compatibility paths that this plugin can service during
     * runtime before plugin code fully activates. Use this for legacy surfaces
     * that should cheaply narrow bundled candidate sets without importing every
     * compatible plugin runtime.
     */
    compatibilityRuntimePaths?: string[];
    dangerousFlags?: PluginManifestDangerousConfigFlag[];
    secretInputs?: PluginManifestSecretInputContracts;
};
export type PluginManifest = {
    id: string;
    configSchema: Record<string, unknown>;
    enabledByDefault?: boolean;
    /** Legacy plugin ids that should normalize to this plugin id. */
    legacyPluginIds?: string[];
    /** Provider ids that should auto-enable this plugin when referenced in auth/config/models. */
    autoEnableWhenConfiguredProviders?: string[];
    kind?: PluginKind | PluginKind[];
    channels?: string[];
    providers?: string[];
    /**
     * Optional lightweight module that exports provider plugin metadata for
     * auth/catalog discovery. It should not import the full plugin runtime.
     */
    providerDiscoveryEntry?: string;
    /**
     * Cheap model-family ownership metadata used before plugin runtime loads.
     * Use this for shorthand model refs that omit an explicit provider prefix.
     */
    modelSupport?: PluginManifestModelSupport;
    /** Cheap startup activation lookup for plugin-owned CLI inference backends. */
    cliBackends?: string[];
    /**
     * Plugin-owned command aliases that should resolve to this plugin during
     * config diagnostics before runtime loads.
     */
    commandAliases?: PluginManifestCommandAlias[];
    /** Cheap provider-auth env lookup without booting plugin runtime. */
    providerAuthEnvVars?: Record<string, string[]>;
    /** Provider ids that should reuse another provider id for auth lookup. */
    providerAuthAliases?: Record<string, string>;
    /** Cheap channel env lookup without booting plugin runtime. */
    channelEnvVars?: Record<string, string[]>;
    /**
     * Cheap onboarding/auth-choice metadata used by config validation, CLI help,
     * and non-runtime auth-choice routing before provider runtime loads.
     */
    providerAuthChoices?: PluginManifestProviderAuthChoice[];
    /** Cheap activation hints exposed before plugin runtime loads. */
    activation?: PluginManifestActivation;
    /** Cheap setup/onboarding metadata exposed before plugin runtime loads. */
    setup?: PluginManifestSetup;
    /** Cheap QA runner metadata exposed before plugin runtime loads. */
    qaRunners?: PluginManifestQaRunner[];
    skills?: string[];
    name?: string;
    description?: string;
    version?: string;
    uiHints?: Record<string, PluginConfigUiHint>;
    /**
     * Static capability ownership snapshot used for manifest-driven discovery,
     * compat wiring, and contract coverage without importing plugin runtime.
     */
    contracts?: PluginManifestContracts;
    /** Manifest-owned config behavior consumed by generic core helpers. */
    configContracts?: PluginManifestConfigContracts;
    channelConfigs?: Record<string, PluginManifestChannelConfig>;
};
export type PluginManifestContracts = {
    memoryEmbeddingProviders?: string[];
    speechProviders?: string[];
    realtimeTranscriptionProviders?: string[];
    realtimeVoiceProviders?: string[];
    mediaUnderstandingProviders?: string[];
    imageGenerationProviders?: string[];
    videoGenerationProviders?: string[];
    musicGenerationProviders?: string[];
    webFetchProviders?: string[];
    webSearchProviders?: string[];
    tools?: string[];
};
export type PluginManifestProviderAuthChoice = {
    /** Provider id owned by this manifest entry. */
    provider: string;
    /** Provider auth method id that this choice should dispatch to. */
    method: string;
    /** Stable auth-choice id used by onboarding and other CLI auth flows. */
    choiceId: string;
    /** Optional user-facing choice label/hint for grouped onboarding UI. */
    choiceLabel?: string;
    choiceHint?: string;
    /** Lower values sort earlier in interactive assistant pickers. */
    assistantPriority?: number;
    /** Keep the choice out of interactive assistant pickers while preserving manual CLI support. */
    assistantVisibility?: "visible" | "manual-only";
    /** Legacy choice ids that should point users at this replacement choice. */
    deprecatedChoiceIds?: string[];
    /** Optional grouping metadata for auth-choice pickers. */
    groupId?: string;
    groupLabel?: string;
    groupHint?: string;
    /** Optional CLI flag metadata for one-flag auth flows such as API keys. */
    optionKey?: string;
    cliFlag?: string;
    cliOption?: string;
    cliDescription?: string;
    /**
     * Interactive onboarding surfaces where this auth choice should appear.
     * Defaults to `["text-inference"]` when omitted.
     */
    onboardingScopes?: PluginManifestOnboardingScope[];
};
export type PluginManifestOnboardingScope = "text-inference" | "image-generation";
export type PluginManifestLoadResult = {
    ok: true;
    manifest: PluginManifest;
    manifestPath: string;
} | {
    ok: false;
    error: string;
    manifestPath: string;
};
export declare function resolvePluginManifestPath(rootDir: string): string;
export declare function loadPluginManifest(rootDir: string, rejectHardlinks?: boolean): PluginManifestLoadResult;
export type PluginPackageChannel = {
    id?: string;
    label?: string;
    selectionLabel?: string;
    detailLabel?: string;
    docsPath?: string;
    docsLabel?: string;
    blurb?: string;
    order?: number;
    aliases?: readonly string[];
    preferOver?: readonly string[];
    systemImage?: string;
    selectionDocsPrefix?: string;
    selectionDocsOmitLabel?: boolean;
    selectionExtras?: readonly string[];
    markdownCapable?: boolean;
    exposure?: {
        configured?: boolean;
        setup?: boolean;
        docs?: boolean;
    };
    showConfigured?: boolean;
    showInSetup?: boolean;
    quickstartAllowFrom?: boolean;
    forceAccountBinding?: boolean;
    preferSessionLookupForAnnounceTarget?: boolean;
    configuredState?: {
        specifier?: string;
        exportName?: string;
    };
    persistedAuthState?: {
        specifier?: string;
        exportName?: string;
    };
};
export type PluginPackageInstall = {
    npmSpec?: string;
    localPath?: string;
    defaultChoice?: "npm" | "local";
    minHostVersion?: string;
    allowInvalidConfigRecovery?: boolean;
};
export type OpenClawPackageStartup = {
    /**
     * Opt-in for channel plugins whose `setupEntry` fully covers the gateway
     * startup surface needed before the server starts listening.
     */
    deferConfiguredChannelFullLoadUntilAfterListen?: boolean;
};
export type OpenClawPackageManifest = {
    extensions?: string[];
    setupEntry?: string;
    channel?: PluginPackageChannel;
    install?: PluginPackageInstall;
    startup?: OpenClawPackageStartup;
};
export declare const DEFAULT_PLUGIN_ENTRY_CANDIDATES: readonly ["index.ts", "index.js", "index.mjs", "index.cjs"];
export type PackageExtensionResolution = {
    status: "ok";
    entries: string[];
} | {
    status: "missing";
    entries: [];
} | {
    status: "empty";
    entries: [];
};
export type ManifestKey = typeof MANIFEST_KEY;
export type PackageManifest = {
    name?: string;
    version?: string;
    description?: string;
} & Partial<Record<ManifestKey, OpenClawPackageManifest>>;
export declare function getPackageManifestMetadata(manifest: PackageManifest | undefined): OpenClawPackageManifest | undefined;
export declare function resolvePackageExtensionEntries(manifest: PackageManifest | undefined): PackageExtensionResolution;
