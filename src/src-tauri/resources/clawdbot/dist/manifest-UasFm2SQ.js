import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { l as isRecord } from "./utils-BMRcljdi.js";
import { t as isBlockedObjectKey } from "./prototype-keys-CL1-mnaY.js";
import { i as openBoundaryFileSync, n as matchBoundaryFileOpenFailure } from "./boundary-file-read-BDEvfiRb.js";
import { n as MANIFEST_KEY } from "./legacy-names-4mm_GxYL.js";
import { t as MODEL_APIS } from "./types.models-3sfT-Cef.js";
import { l as normalizeTrimmedStringList } from "./string-normalization-Bvcn03I9.js";
import fs from "node:fs";
import path from "node:path";
import JSON5 from "json5";
//#region src/model-catalog/refs.ts
function normalizeModelCatalogProviderId(provider) {
	return normalizeLowercaseStringOrEmpty(provider);
}
//#endregion
//#region src/model-catalog/normalize.ts
const MODEL_CATALOG_INPUTS = new Set([
	"text",
	"image",
	"document"
]);
const MODEL_CATALOG_DISCOVERY_MODES = new Set([
	"static",
	"refreshable",
	"runtime"
]);
const MODEL_CATALOG_STATUSES = new Set([
	"available",
	"preview",
	"deprecated",
	"disabled"
]);
const MODEL_CATALOG_APIS = new Set(MODEL_APIS);
function normalizeSafeRecordKey(value) {
	const key = normalizeOptionalString(value) ?? "";
	return key && !isBlockedObjectKey(key) ? key : "";
}
function normalizeOwnedProviderSet(providers) {
	const normalized = /* @__PURE__ */ new Set();
	for (const provider of providers) {
		const providerId = normalizeModelCatalogProviderId(provider);
		if (providerId) normalized.add(providerId);
	}
	return normalized;
}
function normalizeStringMap(value) {
	if (!isRecord(value)) return;
	const normalized = {};
	for (const [rawKey, rawValue] of Object.entries(value)) {
		const key = normalizeSafeRecordKey(rawKey);
		const mapValue = normalizeOptionalString(rawValue) ?? "";
		if (key && mapValue) normalized[key] = mapValue;
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeModelCatalogApi(value) {
	const api = normalizeOptionalString(value) ?? "";
	return MODEL_CATALOG_APIS.has(api) ? api : void 0;
}
function normalizeModelCatalogInputs(value) {
	const inputs = normalizeTrimmedStringList(value).filter((input) => MODEL_CATALOG_INPUTS.has(input));
	return inputs.length > 0 ? inputs : void 0;
}
function normalizeNonNegativeNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function normalizePositiveNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function normalizePositiveInteger(value) {
	return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : void 0;
}
function normalizeModelCatalogTieredCost(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (!isRecord(entry) || !Array.isArray(entry.range)) continue;
		const input = normalizeNonNegativeNumber(entry.input);
		const output = normalizeNonNegativeNumber(entry.output);
		const cacheRead = normalizeNonNegativeNumber(entry.cacheRead);
		const cacheWrite = normalizeNonNegativeNumber(entry.cacheWrite);
		if (input === void 0 || output === void 0 || cacheRead === void 0 || cacheWrite === void 0 || entry.range.length < 1 || entry.range.length > 2) continue;
		const rangeValues = entry.range.map((rangeValue) => normalizeNonNegativeNumber(rangeValue));
		if (rangeValues.some((rangeValue) => rangeValue === void 0)) continue;
		normalized.push({
			input,
			output,
			cacheRead,
			cacheWrite,
			range: rangeValues.length === 1 ? [rangeValues[0]] : [rangeValues[0], rangeValues[1]]
		});
	}
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeModelCatalogCost(value) {
	if (!isRecord(value)) return;
	const input = normalizeNonNegativeNumber(value.input);
	const output = normalizeNonNegativeNumber(value.output);
	const cacheRead = normalizeNonNegativeNumber(value.cacheRead);
	const cacheWrite = normalizeNonNegativeNumber(value.cacheWrite);
	const tieredPricing = normalizeModelCatalogTieredCost(value.tieredPricing);
	const cost = {
		...input !== void 0 ? { input } : {},
		...output !== void 0 ? { output } : {},
		...cacheRead !== void 0 ? { cacheRead } : {},
		...cacheWrite !== void 0 ? { cacheWrite } : {},
		...tieredPricing ? { tieredPricing } : {}
	};
	return Object.keys(cost).length > 0 ? cost : void 0;
}
function normalizeModelCatalogCompat(value) {
	if (!isRecord(value)) return;
	const compat = {};
	for (const field of [
		"supportsStore",
		"supportsPromptCacheKey",
		"supportsDeveloperRole",
		"supportsReasoningEffort",
		"supportsUsageInStreaming",
		"supportsTools",
		"supportsStrictMode",
		"requiresStringContent",
		"requiresToolResultName",
		"requiresAssistantAfterToolResult",
		"requiresThinkingAsText",
		"nativeWebSearchTool",
		"requiresMistralToolIds",
		"requiresOpenAiAnthropicToolPayload"
	]) if (typeof value[field] === "boolean") compat[field] = value[field];
	for (const field of ["toolSchemaProfile", "toolCallArgumentsEncoding"]) {
		const normalized = normalizeOptionalString(value[field]) ?? "";
		if (normalized) compat[field] = normalized;
	}
	for (const field of [
		"visibleReasoningDetailTypes",
		"supportedReasoningEfforts",
		"unsupportedToolSchemaKeywords"
	]) {
		const normalized = normalizeTrimmedStringList(value[field]);
		if (normalized.length > 0) compat[field] = normalized;
	}
	const maxTokensField = normalizeOptionalString(value.maxTokensField) ?? "";
	if (maxTokensField === "max_completion_tokens" || maxTokensField === "max_tokens") compat.maxTokensField = maxTokensField;
	const thinkingFormat = normalizeOptionalString(value.thinkingFormat) ?? "";
	if (thinkingFormat === "openai" || thinkingFormat === "openrouter" || thinkingFormat === "deepseek" || thinkingFormat === "zai" || thinkingFormat === "qwen" || thinkingFormat === "qwen-chat-template") compat.thinkingFormat = thinkingFormat;
	return Object.keys(compat).length > 0 ? compat : void 0;
}
function normalizeModelCatalogStatus(value) {
	const status = normalizeOptionalString(value) ?? "";
	return MODEL_CATALOG_STATUSES.has(status) ? status : void 0;
}
function normalizeModelCatalogModel(value) {
	if (!isRecord(value)) return;
	const id = normalizeOptionalString(value.id) ?? "";
	if (!id) return;
	const name = normalizeOptionalString(value.name) ?? "";
	const api = normalizeModelCatalogApi(value.api);
	const baseUrl = normalizeOptionalString(value.baseUrl) ?? "";
	const headers = normalizeStringMap(value.headers);
	const input = normalizeModelCatalogInputs(value.input);
	const reasoning = typeof value.reasoning === "boolean" ? value.reasoning : void 0;
	const contextWindow = normalizePositiveNumber(value.contextWindow);
	const contextTokens = normalizePositiveInteger(value.contextTokens);
	const maxTokens = normalizePositiveNumber(value.maxTokens);
	const cost = normalizeModelCatalogCost(value.cost);
	const compat = normalizeModelCatalogCompat(value.compat);
	const status = normalizeModelCatalogStatus(value.status);
	const statusReason = normalizeOptionalString(value.statusReason) ?? "";
	const replaces = normalizeTrimmedStringList(value.replaces);
	const replacedBy = normalizeOptionalString(value.replacedBy) ?? "";
	const tags = normalizeTrimmedStringList(value.tags);
	return {
		id,
		...name ? { name } : {},
		...api ? { api } : {},
		...baseUrl ? { baseUrl } : {},
		...headers ? { headers } : {},
		...input ? { input } : {},
		...reasoning !== void 0 ? { reasoning } : {},
		...contextWindow !== void 0 ? { contextWindow } : {},
		...contextTokens !== void 0 ? { contextTokens } : {},
		...maxTokens !== void 0 ? { maxTokens } : {},
		...cost ? { cost } : {},
		...compat ? { compat } : {},
		...status ? { status } : {},
		...statusReason ? { statusReason } : {},
		...replaces.length > 0 ? { replaces } : {},
		...replacedBy ? { replacedBy } : {},
		...tags.length > 0 ? { tags } : {}
	};
}
function normalizeModelCatalogProvider(value) {
	if (!isRecord(value)) return;
	const models = Array.isArray(value.models) ? value.models.map((entry) => normalizeModelCatalogModel(entry)).filter((entry) => Boolean(entry)) : [];
	if (models.length === 0) return;
	const baseUrl = normalizeOptionalString(value.baseUrl) ?? "";
	const api = normalizeModelCatalogApi(value.api);
	const headers = normalizeStringMap(value.headers);
	return {
		...baseUrl ? { baseUrl } : {},
		...api ? { api } : {},
		...headers ? { headers } : {},
		models
	};
}
function normalizeModelCatalogProviders(value, ownedProviders) {
	if (!isRecord(value)) return;
	const providers = {};
	for (const [rawProviderId, rawProvider] of Object.entries(value)) {
		const providerId = normalizeModelCatalogProviderId(rawProviderId);
		if (!providerId || !ownedProviders.has(providerId)) continue;
		const provider = normalizeModelCatalogProvider(rawProvider);
		if (provider) providers[providerId] = provider;
	}
	return Object.keys(providers).length > 0 ? providers : void 0;
}
function normalizeModelCatalogAliases(value, ownedProviders) {
	if (!isRecord(value)) return;
	const aliases = {};
	for (const [rawAlias, rawTarget] of Object.entries(value)) {
		const alias = normalizeModelCatalogProviderId(rawAlias);
		if (!alias || !isRecord(rawTarget)) continue;
		const provider = normalizeModelCatalogProviderId(normalizeOptionalString(rawTarget.provider) ?? "");
		if (!provider || !ownedProviders.has(provider)) continue;
		const api = normalizeModelCatalogApi(rawTarget.api);
		const baseUrl = normalizeOptionalString(rawTarget.baseUrl) ?? "";
		aliases[alias] = {
			provider,
			...api ? { api } : {},
			...baseUrl ? { baseUrl } : {}
		};
	}
	return Object.keys(aliases).length > 0 ? aliases : void 0;
}
function normalizeModelCatalogSuppressions(value) {
	if (!Array.isArray(value)) return;
	const suppressions = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		const provider = normalizeModelCatalogProviderId(normalizeOptionalString(entry.provider) ?? "");
		const model = normalizeOptionalString(entry.model) ?? "";
		if (!provider || !model) continue;
		const reason = normalizeOptionalString(entry.reason) ?? "";
		suppressions.push({
			provider,
			model,
			...reason ? { reason } : {}
		});
	}
	return suppressions.length > 0 ? suppressions : void 0;
}
function normalizeModelCatalogDiscovery(value, ownedProviders) {
	if (!isRecord(value)) return;
	const discovery = {};
	for (const [rawProviderId, rawMode] of Object.entries(value)) {
		const providerId = normalizeModelCatalogProviderId(rawProviderId);
		const mode = normalizeOptionalString(rawMode) ?? "";
		if (providerId && ownedProviders.has(providerId) && MODEL_CATALOG_DISCOVERY_MODES.has(mode)) discovery[providerId] = mode;
	}
	return Object.keys(discovery).length > 0 ? discovery : void 0;
}
function normalizeModelCatalog(value, params) {
	if (!isRecord(value)) return;
	const ownedProviders = normalizeOwnedProviderSet(params.ownedProviders);
	const providers = normalizeModelCatalogProviders(value.providers, ownedProviders);
	const aliases = normalizeModelCatalogAliases(value.aliases, ownedProviders);
	const suppressions = normalizeModelCatalogSuppressions(value.suppressions);
	const discovery = normalizeModelCatalogDiscovery(value.discovery, ownedProviders);
	const catalog = {
		...providers ? { providers } : {},
		...aliases ? { aliases } : {},
		...suppressions ? { suppressions } : {},
		...discovery ? { discovery } : {}
	};
	return Object.keys(catalog).length > 0 ? catalog : void 0;
}
//#endregion
//#region src/plugins/manifest-command-aliases.ts
function normalizeManifestCommandAliases(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (typeof entry === "string") {
			const name = normalizeOptionalString(entry) ?? "";
			if (name) normalized.push({ name });
			continue;
		}
		if (!isRecord(entry)) continue;
		const name = normalizeOptionalString(entry.name) ?? "";
		if (!name) continue;
		const kind = entry.kind === "runtime-slash" ? entry.kind : void 0;
		const cliCommand = normalizeOptionalString(entry.cliCommand) ?? "";
		normalized.push({
			name,
			...kind ? { kind } : {},
			...cliCommand ? { cliCommand } : {}
		});
	}
	return normalized.length > 0 ? normalized : void 0;
}
function resolveManifestCommandAliasOwnerInRegistry(params) {
	const normalizedCommand = normalizeOptionalLowercaseString(params.command);
	if (!normalizedCommand) return;
	if (params.registry.plugins.some((plugin) => normalizeOptionalLowercaseString(plugin.id) === normalizedCommand)) return;
	for (const plugin of params.registry.plugins) {
		const alias = plugin.commandAliases?.find((entry) => normalizeOptionalLowercaseString(entry.name) === normalizedCommand);
		if (alias) return {
			...alias,
			pluginId: plugin.id
		};
	}
}
//#endregion
//#region src/plugins/manifest.ts
const PLUGIN_MANIFEST_FILENAME = "openclaw.plugin.json";
const PLUGIN_MANIFEST_FILENAMES = [PLUGIN_MANIFEST_FILENAME];
const MAX_PLUGIN_MANIFEST_BYTES = 256 * 1024;
function normalizeStringListRecord(value) {
	if (!isRecord(value)) return;
	const normalized = Object.create(null);
	for (const [key, rawValues] of Object.entries(value)) {
		const providerId = normalizeOptionalString(key) ?? "";
		if (!providerId || isBlockedObjectKey(providerId)) continue;
		const values = normalizeTrimmedStringList(rawValues);
		if (values.length === 0) continue;
		normalized[providerId] = values;
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeStringRecord(value) {
	if (!isRecord(value)) return;
	const normalized = Object.create(null);
	for (const [rawKey, rawValue] of Object.entries(value)) {
		const key = normalizeOptionalString(rawKey) ?? "";
		const value = normalizeOptionalString(rawValue) ?? "";
		if (!key || isBlockedObjectKey(key) || !value) continue;
		normalized[key] = value;
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
const MEDIA_UNDERSTANDING_CAPABILITIES = new Set([
	"image",
	"audio",
	"video"
]);
function normalizeMediaUnderstandingCapabilityRecord(value) {
	if (!isRecord(value)) return;
	const normalized = {};
	for (const [rawKey, rawValue] of Object.entries(value)) {
		if (!MEDIA_UNDERSTANDING_CAPABILITIES.has(rawKey)) continue;
		const model = normalizeOptionalString(rawValue);
		if (model) normalized[rawKey] = model;
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeMediaUnderstandingPriorityRecord(value) {
	if (!isRecord(value)) return;
	const normalized = {};
	for (const [rawKey, rawValue] of Object.entries(value)) {
		if (!MEDIA_UNDERSTANDING_CAPABILITIES.has(rawKey) || typeof rawValue !== "number" || !Number.isFinite(rawValue)) continue;
		normalized[rawKey] = rawValue;
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeMediaUnderstandingCapabilities(value) {
	const values = normalizeTrimmedStringList(value).filter((entry) => MEDIA_UNDERSTANDING_CAPABILITIES.has(entry));
	return values.length > 0 ? values : void 0;
}
function normalizeMediaUnderstandingNativeDocumentInputs(value) {
	const values = normalizeTrimmedStringList(value).filter((entry) => entry === "pdf");
	return values.length > 0 ? values : void 0;
}
function normalizeMediaUnderstandingProviderMetadata(value) {
	if (!isRecord(value)) return;
	const normalized = Object.create(null);
	for (const [rawProviderId, rawMetadata] of Object.entries(value)) {
		const providerId = normalizeOptionalString(rawProviderId) ?? "";
		if (!providerId || isBlockedObjectKey(providerId) || !isRecord(rawMetadata)) continue;
		const capabilities = normalizeMediaUnderstandingCapabilities(rawMetadata.capabilities);
		const defaultModels = normalizeMediaUnderstandingCapabilityRecord(rawMetadata.defaultModels);
		const autoPriority = normalizeMediaUnderstandingPriorityRecord(rawMetadata.autoPriority);
		const nativeDocumentInputs = normalizeMediaUnderstandingNativeDocumentInputs(rawMetadata.nativeDocumentInputs);
		const metadata = {
			...capabilities ? { capabilities } : {},
			...defaultModels ? { defaultModels } : {},
			...autoPriority ? { autoPriority } : {},
			...nativeDocumentInputs ? { nativeDocumentInputs } : {}
		};
		if (Object.keys(metadata).length > 0) normalized[providerId] = metadata;
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeManifestContracts(value) {
	if (!isRecord(value)) return;
	const embeddedExtensionFactories = normalizeTrimmedStringList(value.embeddedExtensionFactories);
	const agentToolResultMiddleware = normalizeTrimmedStringList(value.agentToolResultMiddleware);
	const externalAuthProviders = normalizeTrimmedStringList(value.externalAuthProviders);
	const memoryEmbeddingProviders = normalizeTrimmedStringList(value.memoryEmbeddingProviders);
	const speechProviders = normalizeTrimmedStringList(value.speechProviders);
	const realtimeTranscriptionProviders = normalizeTrimmedStringList(value.realtimeTranscriptionProviders);
	const realtimeVoiceProviders = normalizeTrimmedStringList(value.realtimeVoiceProviders);
	const mediaUnderstandingProviders = normalizeTrimmedStringList(value.mediaUnderstandingProviders);
	const documentExtractors = normalizeTrimmedStringList(value.documentExtractors);
	const imageGenerationProviders = normalizeTrimmedStringList(value.imageGenerationProviders);
	const videoGenerationProviders = normalizeTrimmedStringList(value.videoGenerationProviders);
	const musicGenerationProviders = normalizeTrimmedStringList(value.musicGenerationProviders);
	const webContentExtractors = normalizeTrimmedStringList(value.webContentExtractors);
	const webFetchProviders = normalizeTrimmedStringList(value.webFetchProviders);
	const webSearchProviders = normalizeTrimmedStringList(value.webSearchProviders);
	const tools = normalizeTrimmedStringList(value.tools);
	const contracts = {
		...embeddedExtensionFactories.length > 0 ? { embeddedExtensionFactories } : {},
		...agentToolResultMiddleware.length > 0 ? { agentToolResultMiddleware } : {},
		...externalAuthProviders.length > 0 ? { externalAuthProviders } : {},
		...memoryEmbeddingProviders.length > 0 ? { memoryEmbeddingProviders } : {},
		...speechProviders.length > 0 ? { speechProviders } : {},
		...realtimeTranscriptionProviders.length > 0 ? { realtimeTranscriptionProviders } : {},
		...realtimeVoiceProviders.length > 0 ? { realtimeVoiceProviders } : {},
		...mediaUnderstandingProviders.length > 0 ? { mediaUnderstandingProviders } : {},
		...documentExtractors.length > 0 ? { documentExtractors } : {},
		...imageGenerationProviders.length > 0 ? { imageGenerationProviders } : {},
		...videoGenerationProviders.length > 0 ? { videoGenerationProviders } : {},
		...musicGenerationProviders.length > 0 ? { musicGenerationProviders } : {},
		...webContentExtractors.length > 0 ? { webContentExtractors } : {},
		...webFetchProviders.length > 0 ? { webFetchProviders } : {},
		...webSearchProviders.length > 0 ? { webSearchProviders } : {},
		...tools.length > 0 ? { tools } : {}
	};
	return Object.keys(contracts).length > 0 ? contracts : void 0;
}
function isManifestConfigLiteral(value) {
	return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function normalizeManifestDangerousConfigFlags(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		const path = normalizeOptionalString(entry.path) ?? "";
		if (!path || !isManifestConfigLiteral(entry.equals)) continue;
		normalized.push({
			path,
			equals: entry.equals
		});
	}
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeManifestSecretInputPaths(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		const path = normalizeOptionalString(entry.path) ?? "";
		if (!path) continue;
		const expected = entry.expected === "string" ? entry.expected : void 0;
		normalized.push({
			path,
			...expected ? { expected } : {}
		});
	}
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeManifestConfigContracts(value) {
	if (!isRecord(value)) return;
	const compatibilityMigrationPaths = normalizeTrimmedStringList(value.compatibilityMigrationPaths);
	const compatibilityRuntimePaths = normalizeTrimmedStringList(value.compatibilityRuntimePaths);
	const rawSecretInputs = isRecord(value.secretInputs) ? value.secretInputs : void 0;
	const dangerousFlags = normalizeManifestDangerousConfigFlags(value.dangerousFlags);
	const secretInputPaths = rawSecretInputs ? normalizeManifestSecretInputPaths(rawSecretInputs.paths) : void 0;
	const secretInputs = secretInputPaths && secretInputPaths.length > 0 ? {
		...rawSecretInputs?.bundledDefaultEnabled === true ? { bundledDefaultEnabled: true } : rawSecretInputs?.bundledDefaultEnabled === false ? { bundledDefaultEnabled: false } : {},
		paths: secretInputPaths
	} : void 0;
	const configContracts = {
		...compatibilityMigrationPaths.length > 0 ? { compatibilityMigrationPaths } : {},
		...compatibilityRuntimePaths.length > 0 ? { compatibilityRuntimePaths } : {},
		...dangerousFlags ? { dangerousFlags } : {},
		...secretInputs ? { secretInputs } : {}
	};
	return Object.keys(configContracts).length > 0 ? configContracts : void 0;
}
function normalizeManifestModelSupport(value) {
	if (!isRecord(value)) return;
	const modelPrefixes = normalizeTrimmedStringList(value.modelPrefixes);
	const modelPatterns = normalizeTrimmedStringList(value.modelPatterns);
	const modelSupport = {
		...modelPrefixes.length > 0 ? { modelPrefixes } : {},
		...modelPatterns.length > 0 ? { modelPatterns } : {}
	};
	return Object.keys(modelSupport).length > 0 ? modelSupport : void 0;
}
function normalizeManifestProviderEndpoints(value) {
	if (!Array.isArray(value)) return;
	const endpoints = [];
	for (const rawEndpoint of value) {
		if (!isRecord(rawEndpoint)) continue;
		const endpointClass = normalizeOptionalString(rawEndpoint.endpointClass);
		if (!endpointClass) continue;
		const hosts = normalizeTrimmedStringList(rawEndpoint.hosts).map((host) => host.toLowerCase());
		const baseUrls = normalizeTrimmedStringList(rawEndpoint.baseUrls);
		if (hosts.length === 0 && baseUrls.length === 0) continue;
		endpoints.push({
			endpointClass,
			...hosts.length > 0 ? { hosts } : {},
			...baseUrls.length > 0 ? { baseUrls } : {}
		});
	}
	return endpoints.length > 0 ? endpoints : void 0;
}
function normalizeManifestActivation(value) {
	if (!isRecord(value)) return;
	const onProviders = normalizeTrimmedStringList(value.onProviders);
	const onAgentHarnesses = normalizeTrimmedStringList(value.onAgentHarnesses);
	const onCommands = normalizeTrimmedStringList(value.onCommands);
	const onChannels = normalizeTrimmedStringList(value.onChannels);
	const onRoutes = normalizeTrimmedStringList(value.onRoutes);
	const onCapabilities = normalizeTrimmedStringList(value.onCapabilities).filter((capability) => capability === "provider" || capability === "channel" || capability === "tool" || capability === "hook");
	const activation = {
		...onProviders.length > 0 ? { onProviders } : {},
		...onAgentHarnesses.length > 0 ? { onAgentHarnesses } : {},
		...onCommands.length > 0 ? { onCommands } : {},
		...onChannels.length > 0 ? { onChannels } : {},
		...onRoutes.length > 0 ? { onRoutes } : {},
		...onCapabilities.length > 0 ? { onCapabilities } : {}
	};
	return Object.keys(activation).length > 0 ? activation : void 0;
}
function normalizeManifestSetupProviders(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		const id = normalizeOptionalString(entry.id) ?? "";
		if (!id) continue;
		const authMethods = normalizeTrimmedStringList(entry.authMethods);
		const envVars = normalizeTrimmedStringList(entry.envVars);
		normalized.push({
			id,
			...authMethods.length > 0 ? { authMethods } : {},
			...envVars.length > 0 ? { envVars } : {}
		});
	}
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeManifestSetup(value) {
	if (!isRecord(value)) return;
	const providers = normalizeManifestSetupProviders(value.providers);
	const cliBackends = normalizeTrimmedStringList(value.cliBackends);
	const configMigrations = normalizeTrimmedStringList(value.configMigrations);
	const requiresRuntime = typeof value.requiresRuntime === "boolean" ? value.requiresRuntime : void 0;
	const setup = {
		...providers ? { providers } : {},
		...cliBackends.length > 0 ? { cliBackends } : {},
		...configMigrations.length > 0 ? { configMigrations } : {},
		...requiresRuntime !== void 0 ? { requiresRuntime } : {}
	};
	return Object.keys(setup).length > 0 ? setup : void 0;
}
function normalizeManifestQaRunners(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		const commandName = normalizeOptionalString(entry.commandName) ?? "";
		if (!commandName) continue;
		const description = normalizeOptionalString(entry.description) ?? "";
		normalized.push({
			commandName,
			...description ? { description } : {}
		});
	}
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeProviderAuthChoices(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		const provider = normalizeOptionalString(entry.provider) ?? "";
		const method = normalizeOptionalString(entry.method) ?? "";
		const choiceId = normalizeOptionalString(entry.choiceId) ?? "";
		if (!provider || !method || !choiceId) continue;
		const choiceLabel = normalizeOptionalString(entry.choiceLabel) ?? "";
		const choiceHint = normalizeOptionalString(entry.choiceHint) ?? "";
		const assistantPriority = typeof entry.assistantPriority === "number" && Number.isFinite(entry.assistantPriority) ? entry.assistantPriority : void 0;
		const assistantVisibility = entry.assistantVisibility === "manual-only" || entry.assistantVisibility === "visible" ? entry.assistantVisibility : void 0;
		const deprecatedChoiceIds = normalizeTrimmedStringList(entry.deprecatedChoiceIds);
		const groupId = normalizeOptionalString(entry.groupId) ?? "";
		const groupLabel = normalizeOptionalString(entry.groupLabel) ?? "";
		const groupHint = normalizeOptionalString(entry.groupHint) ?? "";
		const optionKey = normalizeOptionalString(entry.optionKey) ?? "";
		const cliFlag = normalizeOptionalString(entry.cliFlag) ?? "";
		const cliOption = normalizeOptionalString(entry.cliOption) ?? "";
		const cliDescription = normalizeOptionalString(entry.cliDescription) ?? "";
		const onboardingScopes = normalizeTrimmedStringList(entry.onboardingScopes).filter((scope) => scope === "text-inference" || scope === "image-generation");
		normalized.push({
			provider,
			method,
			choiceId,
			...choiceLabel ? { choiceLabel } : {},
			...choiceHint ? { choiceHint } : {},
			...assistantPriority !== void 0 ? { assistantPriority } : {},
			...assistantVisibility ? { assistantVisibility } : {},
			...deprecatedChoiceIds.length > 0 ? { deprecatedChoiceIds } : {},
			...groupId ? { groupId } : {},
			...groupLabel ? { groupLabel } : {},
			...groupHint ? { groupHint } : {},
			...optionKey ? { optionKey } : {},
			...cliFlag ? { cliFlag } : {},
			...cliOption ? { cliOption } : {},
			...cliDescription ? { cliDescription } : {},
			...onboardingScopes.length > 0 ? { onboardingScopes } : {}
		});
	}
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeChannelConfigs(value) {
	if (!isRecord(value)) return;
	const normalized = Object.create(null);
	for (const [key, rawEntry] of Object.entries(value)) {
		const channelId = normalizeOptionalString(key) ?? "";
		if (!channelId || isBlockedObjectKey(channelId) || !isRecord(rawEntry)) continue;
		const schema = isRecord(rawEntry.schema) ? rawEntry.schema : null;
		if (!schema) continue;
		const uiHints = isRecord(rawEntry.uiHints) ? rawEntry.uiHints : void 0;
		const runtime = isRecord(rawEntry.runtime) && typeof rawEntry.runtime.safeParse === "function" ? rawEntry.runtime : void 0;
		const label = normalizeOptionalString(rawEntry.label) ?? "";
		const description = normalizeOptionalString(rawEntry.description) ?? "";
		const preferOver = normalizeTrimmedStringList(rawEntry.preferOver);
		normalized[channelId] = {
			schema,
			...uiHints ? { uiHints } : {},
			...runtime ? { runtime } : {},
			...label ? { label } : {},
			...description ? { description } : {},
			...preferOver.length > 0 ? { preferOver } : {}
		};
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function resolvePluginManifestPath(rootDir) {
	for (const filename of PLUGIN_MANIFEST_FILENAMES) {
		const candidate = path.join(rootDir, filename);
		if (fs.existsSync(candidate)) return candidate;
	}
	return path.join(rootDir, PLUGIN_MANIFEST_FILENAME);
}
function parsePluginKind(raw) {
	if (typeof raw === "string") return raw;
	if (Array.isArray(raw) && raw.length > 0 && raw.every((k) => typeof k === "string")) return raw.length === 1 ? raw[0] : raw;
}
function loadPluginManifest(rootDir, rejectHardlinks = true) {
	const manifestPath = resolvePluginManifestPath(rootDir);
	const opened = openBoundaryFileSync({
		absolutePath: manifestPath,
		rootPath: rootDir,
		boundaryLabel: "plugin root",
		maxBytes: MAX_PLUGIN_MANIFEST_BYTES,
		rejectHardlinks
	});
	if (!opened.ok) return matchBoundaryFileOpenFailure(opened, {
		path: () => ({
			ok: false,
			error: `plugin manifest not found: ${manifestPath}`,
			manifestPath
		}),
		fallback: (failure) => ({
			ok: false,
			error: `unsafe plugin manifest path: ${manifestPath} (${failure.reason})`,
			manifestPath
		})
	});
	let raw;
	try {
		raw = JSON5.parse(fs.readFileSync(opened.fd, "utf-8"));
	} catch (err) {
		return {
			ok: false,
			error: `failed to parse plugin manifest: ${String(err)}`,
			manifestPath
		};
	} finally {
		fs.closeSync(opened.fd);
	}
	if (!isRecord(raw)) return {
		ok: false,
		error: "plugin manifest must be an object",
		manifestPath
	};
	const id = normalizeOptionalString(raw.id) ?? "";
	if (!id) return {
		ok: false,
		error: "plugin manifest requires id",
		manifestPath
	};
	const configSchema = isRecord(raw.configSchema) ? raw.configSchema : null;
	if (!configSchema) return {
		ok: false,
		error: "plugin manifest requires configSchema",
		manifestPath
	};
	const kind = parsePluginKind(raw.kind);
	const enabledByDefault = raw.enabledByDefault === true;
	const legacyPluginIds = normalizeTrimmedStringList(raw.legacyPluginIds);
	const autoEnableWhenConfiguredProviders = normalizeTrimmedStringList(raw.autoEnableWhenConfiguredProviders);
	const name = normalizeOptionalString(raw.name);
	const description = normalizeOptionalString(raw.description);
	const version = normalizeOptionalString(raw.version);
	const channels = normalizeTrimmedStringList(raw.channels);
	const providers = normalizeTrimmedStringList(raw.providers);
	const providerDiscoveryEntry = normalizeOptionalString(raw.providerDiscoveryEntry);
	const modelSupport = normalizeManifestModelSupport(raw.modelSupport);
	const modelCatalog = normalizeModelCatalog(raw.modelCatalog, { ownedProviders: new Set(providers) });
	const providerEndpoints = normalizeManifestProviderEndpoints(raw.providerEndpoints);
	const cliBackends = normalizeTrimmedStringList(raw.cliBackends);
	const syntheticAuthRefs = normalizeTrimmedStringList(raw.syntheticAuthRefs);
	const nonSecretAuthMarkers = normalizeTrimmedStringList(raw.nonSecretAuthMarkers);
	const commandAliases = normalizeManifestCommandAliases(raw.commandAliases);
	const providerAuthEnvVars = normalizeStringListRecord(raw.providerAuthEnvVars);
	const providerAuthAliases = normalizeStringRecord(raw.providerAuthAliases);
	const channelEnvVars = normalizeStringListRecord(raw.channelEnvVars);
	const providerAuthChoices = normalizeProviderAuthChoices(raw.providerAuthChoices);
	const activation = normalizeManifestActivation(raw.activation);
	const setup = normalizeManifestSetup(raw.setup);
	const qaRunners = normalizeManifestQaRunners(raw.qaRunners);
	const skills = normalizeTrimmedStringList(raw.skills);
	const contracts = normalizeManifestContracts(raw.contracts);
	const mediaUnderstandingProviderMetadata = normalizeMediaUnderstandingProviderMetadata(raw.mediaUnderstandingProviderMetadata);
	const configContracts = normalizeManifestConfigContracts(raw.configContracts);
	const channelConfigs = normalizeChannelConfigs(raw.channelConfigs);
	let uiHints;
	if (isRecord(raw.uiHints)) uiHints = raw.uiHints;
	return {
		ok: true,
		manifest: {
			id,
			configSchema,
			...enabledByDefault ? { enabledByDefault } : {},
			...legacyPluginIds.length > 0 ? { legacyPluginIds } : {},
			...autoEnableWhenConfiguredProviders.length > 0 ? { autoEnableWhenConfiguredProviders } : {},
			kind,
			channels,
			providers,
			providerDiscoveryEntry,
			modelSupport,
			modelCatalog,
			providerEndpoints,
			cliBackends,
			syntheticAuthRefs,
			nonSecretAuthMarkers,
			commandAliases,
			providerAuthEnvVars,
			providerAuthAliases,
			channelEnvVars,
			providerAuthChoices,
			activation,
			setup,
			qaRunners,
			skills,
			name,
			description,
			version,
			uiHints,
			contracts,
			mediaUnderstandingProviderMetadata,
			configContracts,
			channelConfigs
		},
		manifestPath
	};
}
const DEFAULT_PLUGIN_ENTRY_CANDIDATES = [
	"index.ts",
	"index.js",
	"index.mjs",
	"index.cjs"
];
function getPackageManifestMetadata(manifest) {
	if (!manifest) return;
	return manifest[MANIFEST_KEY];
}
function resolvePackageExtensionEntries(manifest) {
	const raw = getPackageManifestMetadata(manifest)?.extensions;
	if (!Array.isArray(raw)) return {
		status: "missing",
		entries: []
	};
	const entries = raw.map((entry) => normalizeOptionalString(entry) ?? "").filter(Boolean);
	if (entries.length === 0) return {
		status: "empty",
		entries: []
	};
	return {
		status: "ok",
		entries
	};
}
//#endregion
export { resolvePackageExtensionEntries as a, loadPluginManifest as i, PLUGIN_MANIFEST_FILENAME as n, resolveManifestCommandAliasOwnerInRegistry as o, getPackageManifestMetadata as r, DEFAULT_PLUGIN_ENTRY_CANDIDATES as t };
