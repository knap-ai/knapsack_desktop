import type { OpenClawPluginApi, OpenClawPluginConfigSchema, OpenClawPluginDefinition } from "../plugins/types.js";
export type { AnyAgentTool, MediaUnderstandingProviderPlugin, OpenClawPluginApi, PluginCommandContext, OpenClawPluginConfigSchema, ProviderDiscoveryContext, ProviderCatalogContext, ProviderCatalogResult, ProviderAugmentModelCatalogContext, ProviderBuiltInModelSuppressionContext, ProviderBuiltInModelSuppressionResult, ProviderBuildMissingAuthMessageContext, ProviderCacheTtlEligibilityContext, ProviderDefaultThinkingPolicyContext, ProviderFetchUsageSnapshotContext, ProviderModernModelPolicyContext, ProviderPreparedRuntimeAuth, ProviderResolvedUsageAuth, ProviderPrepareExtraParamsContext, ProviderPrepareDynamicModelContext, ProviderPrepareRuntimeAuthContext, ProviderResolveUsageAuthContext, ProviderResolveDynamicModelContext, ProviderNormalizeResolvedModelContext, ProviderRuntimeModel, SpeechProviderPlugin, ProviderThinkingPolicyContext, ProviderWrapStreamFnContext, OpenClawPluginService, OpenClawPluginServiceContext, ProviderAuthContext, ProviderAuthDoctorHintContext, ProviderAuthMethodNonInteractiveContext, ProviderAuthMethod, ProviderAuthResult, OpenClawPluginCommandDefinition, OpenClawPluginDefinition, PluginLogger, PluginInteractiveTelegramHandlerContext, } from "../plugins/types.js";
export type { OpenClawConfig } from "../config/config.js";
export { emptyPluginConfigSchema } from "../plugins/config-schema.js";
/** Options for a plugin entry that registers providers, tools, commands, or services. */
type DefinePluginEntryOptions = {
    id: string;
    name: string;
    description: string;
    kind?: OpenClawPluginDefinition["kind"];
    configSchema?: OpenClawPluginConfigSchema | (() => OpenClawPluginConfigSchema);
    register: (api: OpenClawPluginApi) => void;
};
/** Normalized object shape that OpenClaw loads from a plugin entry module. */
type DefinedPluginEntry = {
    id: string;
    name: string;
    description: string;
    configSchema: OpenClawPluginConfigSchema;
    register: NonNullable<OpenClawPluginDefinition["register"]>;
} & Pick<OpenClawPluginDefinition, "kind">;
/**
 * Canonical entry helper for non-channel plugins.
 *
 * Use this for provider, tool, command, service, memory, and context-engine
 * plugins. Channel plugins should use `defineChannelPluginEntry(...)` from
 * `openclaw/plugin-sdk/core` so they inherit the channel capability wiring.
 */
export declare function definePluginEntry({ id, name, description, kind, configSchema, register, }: DefinePluginEntryOptions): DefinedPluginEntry;
