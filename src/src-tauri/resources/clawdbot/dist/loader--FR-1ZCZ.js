import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, d as normalizeStringifiedOptionalString } from "./string-coerce-Bje8XVt9.js";
import { C as sanitizeCommandDescriptorDescription, S as normalizeCommandDescriptorName } from "./argv-Bh2LLxMT.js";
import { n as resolveGlobalSingleton } from "./global-singleton-COlWgaGc.js";
import { p as resolveUserPath } from "./utils-DvkbxKCZ.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-C8TEdk8a.js";
import { l as normalizeTrimmedStringList } from "./string-normalization-Cz5hTdB3.js";
import { i as safeStatSync, n as isPathInside } from "./path-safety-CrnL8Kkz.js";
import { n as discoverOpenClawPlugins, r as resolvePluginCacheInputs } from "./discovery-CRcfnviq.js";
import { h as normalizeChannelMeta } from "./bundled-CAfVQCWF.js";
import { i as toSafeImportPath, t as getCachedPluginJitiLoader } from "./jiti-loader-cache-DLO0UJX_.js";
import { f as resolvePluginRuntimeModulePath, g as shouldPreferNativeJiti, s as normalizeJitiAliasTargetPath, t as buildPluginLoaderAliasMap } from "./sdk-alias-Cx73ipZ2.js";
import { a as installBundledRuntimeDeps, f as resolveBundledRuntimeDependencyPackageRoot, h as withBundledRuntimeDepsFilesystemLock, i as ensureBundledPluginRuntimeDeps, l as resolveBundledRuntimeDependencyInstallRootPlan, m as shouldMaterializeBundledRuntimeMirrorDistFile, o as materializeBundledRuntimeMirrorDistFile, s as registerBundledRuntimeDependencyNodePath } from "./bundled-runtime-root-DEMD7-O_.js";
import { i as kindsEqual, n as defaultSlotIdForKey, r as hasKind } from "./slots-CjmwiD-v.js";
import { c as resolveEffectivePluginActivationState, n as createPluginActivationSource, o as normalizePluginsConfig, s as resolveEffectiveEnableState, t as applyTestPluginDefaults, u as resolveMemorySlotDecision } from "./config-state-Bw_lAn0M.js";
import { t as unwrapDefaultModuleExport } from "./module-export-f8zoIwaD.js";
import { i as loadInstalledPluginIndexInstallRecordsSync, t as loadPluginManifestRegistry } from "./manifest-registry-CXpW6f0a.js";
import { c as listChatChannels } from "./registry-GHcDenJ3.js";
import "./installed-plugin-index-records-Z8-yA-Tm.js";
import { i as getRuntimeConfigSnapshot, s as getRuntimeConfigSourceSnapshot } from "./runtime-snapshot-DLisEE8Y.js";
import { t as validateJsonSchemaValue } from "./schema-validator-CY2IX5dY.js";
import { t as normalizePluginGatewayMethodScope } from "./gateway-method-policy-BU7UGGRm.js";
import { a as serializePluginIdScope, i as normalizePluginIdScope, n as hasExplicitPluginIdScope, t as createPluginIdScopeSet } from "./plugin-scope-C6pWBGis.js";
import { t as buildPluginApi } from "./api-builder-Df-LSf1D.js";
import { t as PluginLruCache } from "./plugin-lru-cache-rryqtHaX.js";
import { t as isChannelConfigured } from "./channel-configured-DirH3XTZ.js";
import { G as resolveMemoryDreamingConfig, K as resolveMemoryDreamingPluginConfig, _ as DEFAULT_MEMORY_DREAMING_PLUGIN_ID } from "./dreaming-B_EmO0tQ.js";
import { a as restoreDetachedTaskLifecycleRuntimeRegistration, i as registerDetachedTaskLifecycleRuntime, n as getDetachedTaskLifecycleRuntimeRegistration, t as clearDetachedTaskLifecycleRuntimeRegistration } from "./detached-task-runtime-state-mAtl60H4.js";
import { n as inspectBundleMcpRuntimeSupport } from "./bundle-mcp-82QbQAvk.js";
import { a as clearPluginCommands, d as restorePluginCommands, i as validatePluginCommandDefinition, l as listRegisteredPluginCommands, n as registerPluginCommand, o as clearPluginCommandsForPlugin } from "./command-registration-h0xR6wWQ.js";
import { i as initializeGlobalHookRunner, t as getGlobalHookRunner } from "./hook-runner-global-_PCECtwt.js";
import { a as isConversationHookName, d as clearPluginInteractiveHandlersForPlugin, f as listPluginInteractiveHandlers, h as restorePluginInteractiveHandlers, l as stripPromptMutationFieldsFromLegacyHookResult, o as isPluginHookName, p as registerPluginInteractiveHandler, s as isPromptInjectionHookName, u as clearPluginInteractiveHandlers } from "./types-CSFx9bdF.js";
import { a as registerMemoryEmbeddingProvider, i as listRegisteredMemoryEmbeddingProviders, n as getRegisteredMemoryEmbeddingProvider, o as restoreRegisteredMemoryEmbeddingProviders } from "./memory-embedding-providers-By8WiAeR.js";
import { a as getMemoryPromptSectionBuilder, d as registerMemoryCapability, f as registerMemoryCorpusSupplement, g as registerMemoryRuntime, h as registerMemoryPromptSupplement, i as getMemoryFlushPlanResolver, l as listMemoryCorpusSupplements, m as registerMemoryPromptSection, n as clearMemoryPluginState, o as getMemoryRuntime, p as registerMemoryFlushPlanResolver, r as getMemoryCapabilityRegistration, u as listMemoryPromptSupplements, v as restoreMemoryPluginState } from "./memory-state-DRkxUnJQ.js";
import { i as withProfile } from "./plugin-load-profile-nG0ELhMS.js";
import { r as registerContextEngineForOwner, t as clearContextEnginesForOwner } from "./registry-C0FSoFN6.js";
import { f as registerInternalHook, h as unregisterInternalHook } from "./internal-hooks-BafH2tQ8.js";
import { i as NODE_SYSTEM_RUN_COMMANDS, n as NODE_EXEC_APPROVALS_COMMANDS, r as NODE_SYSTEM_NOTIFY_COMMAND } from "./node-commands-B4nHy6sJ.js";
import { S as createEmptyPluginRegistry, a as getActivePluginRegistry, l as getActivePluginRuntimeSubagentMode, o as getActivePluginRegistryKey, p as recordImportedPluginId, x as setActivePluginRegistry } from "./runtime-Df1Zlb_-.js";
import { n as normalizeAgentToolResultMiddlewareRuntimeIds, r as normalizeAgentToolResultMiddlewareRuntimes } from "./agent-tool-result-middleware-CWYVpHac.js";
import { n as normalizePluginHttpPath, t as findOverlappingPluginHttpRoute } from "./http-route-overlap-8XNsaGjg.js";
import { r as withPluginRuntimePluginIdScope } from "./gateway-request-scope-BrfRtlzX.js";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
//#region src/agents/harness/registry.ts
const AGENT_HARNESS_REGISTRY_STATE = Symbol.for("openclaw.agentHarnessRegistryState");
const log = createSubsystemLogger("agents/harness");
function getAgentHarnessRegistryState() {
	const globalState = globalThis;
	globalState[AGENT_HARNESS_REGISTRY_STATE] ??= { harnesses: /* @__PURE__ */ new Map() };
	return globalState[AGENT_HARNESS_REGISTRY_STATE];
}
function registerAgentHarness(harness, options) {
	const id = harness.id.trim();
	getAgentHarnessRegistryState().harnesses.set(id, {
		harness: {
			...harness,
			id,
			pluginId: harness.pluginId ?? options?.ownerPluginId
		},
		ownerPluginId: options?.ownerPluginId
	});
}
function getRegisteredAgentHarness(id) {
	return getAgentHarnessRegistryState().harnesses.get(id.trim());
}
function listRegisteredAgentHarnesses() {
	return Array.from(getAgentHarnessRegistryState().harnesses.values());
}
function clearAgentHarnesses() {
	getAgentHarnessRegistryState().harnesses.clear();
}
function restoreRegisteredAgentHarnesses(entries) {
	const map = getAgentHarnessRegistryState().harnesses;
	map.clear();
	for (const entry of entries) map.set(entry.harness.id, entry);
}
async function resetRegisteredAgentHarnessSessions(params) {
	await Promise.all(listRegisteredAgentHarnesses().map(async (entry) => {
		if (!entry.harness.reset) return;
		try {
			await entry.harness.reset(params);
		} catch (error) {
			log.warn(`${entry.harness.label} session reset hook failed`, {
				harnessId: entry.harness.id,
				error
			});
		}
	}));
}
async function disposeRegisteredAgentHarnesses() {
	await Promise.all(listRegisteredAgentHarnesses().map(async (entry) => {
		if (!entry.harness.dispose) return;
		try {
			await entry.harness.dispose();
		} catch (error) {
			log.warn(`${entry.harness.label} dispose hook failed`, {
				harnessId: entry.harness.id,
				error
			});
		}
	}));
}
//#endregion
//#region src/plugins/activation-source-config.ts
function resolvePluginActivationSourceConfig(params) {
	if (params.activationSourceConfig !== void 0) return params.activationSourceConfig;
	const sourceSnapshot = getRuntimeConfigSourceSnapshot();
	if (sourceSnapshot && params.config === getRuntimeConfigSnapshot()) return sourceSnapshot;
	return params.config ?? {};
}
//#endregion
//#region src/plugins/compaction-provider.ts
const COMPACTION_PROVIDER_REGISTRY_STATE = Symbol.for("openclaw.compactionProviderRegistryState");
function getCompactionProviderRegistryState() {
	const globalState = globalThis;
	if (!globalState[COMPACTION_PROVIDER_REGISTRY_STATE]) globalState[COMPACTION_PROVIDER_REGISTRY_STATE] = { providers: /* @__PURE__ */ new Map() };
	return globalState[COMPACTION_PROVIDER_REGISTRY_STATE];
}
/**
* Register a compaction provider implementation.
* Pass `ownerPluginId` so the loader can snapshot/restore correctly.
*/
function registerCompactionProvider(provider, options) {
	getCompactionProviderRegistryState().providers.set(provider.id, {
		provider,
		ownerPluginId: options?.ownerPluginId
	});
}
/** Return the provider for the given id, or undefined. */
function getCompactionProvider(id) {
	return getCompactionProviderRegistryState().providers.get(id)?.provider;
}
/** Return the registered entry (provider + owner) for the given id. */
function getRegisteredCompactionProvider(id) {
	return getCompactionProviderRegistryState().providers.get(id);
}
/** List all registered entries with owner metadata (for snapshot/restore). */
function listRegisteredCompactionProviders() {
	return Array.from(getCompactionProviderRegistryState().providers.values());
}
/** Restore from a snapshot, replacing all current entries. */
function restoreRegisteredCompactionProviders(entries) {
	const map = getCompactionProviderRegistryState().providers;
	map.clear();
	for (const entry of entries) map.set(entry.provider.id, entry);
}
//#endregion
//#region src/plugins/loader-cache-state.ts
var PluginLoadReentryError = class extends Error {
	constructor(cacheKey) {
		super(`plugin load reentry detected for cache key: ${cacheKey}`);
		this.name = "PluginLoadReentryError";
		this.cacheKey = cacheKey;
	}
};
var PluginLoaderCacheState = class {
	#registryCache;
	#inFlightLoads = /* @__PURE__ */ new Set();
	#openAllowlistWarningCache = /* @__PURE__ */ new Set();
	constructor(defaultMaxEntries) {
		this.#registryCache = new PluginLruCache(defaultMaxEntries);
	}
	get maxEntries() {
		return this.#registryCache.maxEntries;
	}
	setMaxEntriesForTest(value) {
		this.#registryCache.setMaxEntriesForTest(value);
	}
	clear() {
		this.#registryCache.clear();
		this.#inFlightLoads.clear();
		this.#openAllowlistWarningCache.clear();
	}
	get(cacheKey) {
		return this.#registryCache.get(cacheKey);
	}
	set(cacheKey, state) {
		this.#registryCache.set(cacheKey, state);
	}
	isLoadInFlight(cacheKey) {
		return this.#inFlightLoads.has(cacheKey);
	}
	beginLoad(cacheKey) {
		if (this.#inFlightLoads.has(cacheKey)) throw new PluginLoadReentryError(cacheKey);
		this.#inFlightLoads.add(cacheKey);
	}
	finishLoad(cacheKey) {
		this.#inFlightLoads.delete(cacheKey);
	}
	hasOpenAllowlistWarning(cacheKey) {
		return this.#openAllowlistWarningCache.has(cacheKey);
	}
	recordOpenAllowlistWarning(cacheKey) {
		this.#openAllowlistWarningCache.add(cacheKey);
	}
};
//#endregion
//#region src/plugins/validation-diagnostics.ts
function pushPluginValidationDiagnostic(params) {
	params.pushDiagnostic({
		level: params.level,
		pluginId: params.pluginId,
		source: params.source,
		message: params.message
	});
}
//#endregion
//#region src/plugins/channel-validation.ts
function resolveBundledChannelMeta(id) {
	return listChatChannels().find((meta) => meta?.id === id);
}
function collectMissingChannelMetaFields(meta) {
	const missing = [];
	if (!normalizeOptionalString(meta?.label)) missing.push("label");
	if (!normalizeOptionalString(meta?.selectionLabel)) missing.push("selectionLabel");
	if (!normalizeOptionalString(meta?.docsPath)) missing.push("docsPath");
	if (typeof meta?.blurb !== "string") missing.push("blurb");
	return missing;
}
function normalizeRegisteredChannelPlugin(params) {
	const id = normalizeOptionalString(params.plugin?.id) ?? normalizeStringifiedOptionalString(params.plugin?.id) ?? "";
	if (!id) {
		pushPluginValidationDiagnostic({
			level: "error",
			pluginId: params.pluginId,
			source: params.source,
			message: "channel registration missing id",
			pushDiagnostic: params.pushDiagnostic
		});
		return null;
	}
	const rawMeta = params.plugin.meta;
	const rawMetaId = normalizeOptionalString(rawMeta?.id);
	if (rawMetaId && rawMetaId !== id) pushPluginValidationDiagnostic({
		level: "warn",
		pluginId: params.pluginId,
		source: params.source,
		message: `channel "${id}" meta.id mismatch ("${rawMetaId}"); using registered channel id`,
		pushDiagnostic: params.pushDiagnostic
	});
	const missingFields = collectMissingChannelMetaFields(rawMeta);
	if (missingFields.length > 0) pushPluginValidationDiagnostic({
		level: "warn",
		pluginId: params.pluginId,
		source: params.source,
		message: `channel "${id}" registered incomplete metadata; filled missing ${missingFields.join(", ")}`,
		pushDiagnostic: params.pushDiagnostic
	});
	return {
		...params.plugin,
		id,
		meta: normalizeChannelMeta({
			id,
			meta: rawMeta,
			existing: resolveBundledChannelMeta(id)
		})
	};
}
function listCodexAppServerExtensionFactories() {
	return getActivePluginRegistry()?.codexAppServerExtensionFactories?.map((entry) => entry.factory) ?? [];
}
//#endregion
//#region src/plugins/provider-validation.ts
function normalizeTextList(values) {
	const normalized = Array.from(new Set(normalizeTrimmedStringList(values)));
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeOnboardingScopes(values) {
	const normalized = Array.from(new Set((values ?? []).filter((value) => value === "text-inference" || value === "image-generation")));
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeProviderOAuthProfileIdRepairs(values) {
	if (!Array.isArray(values)) return;
	const normalized = values.map((value) => {
		const legacyProfileId = normalizeOptionalString(value?.legacyProfileId);
		const promptLabel = normalizeOptionalString(value?.promptLabel);
		if (!legacyProfileId && !promptLabel) return null;
		return {
			...legacyProfileId ? { legacyProfileId } : {},
			...promptLabel ? { promptLabel } : {}
		};
	}).filter((value) => value !== null);
	return normalized.length > 0 ? normalized : void 0;
}
function resolveWizardMethodId(params) {
	if (!params.methodId) return;
	if (params.auth.some((method) => method.id === params.methodId)) return params.methodId;
	pushPluginValidationDiagnostic({
		level: "warn",
		pluginId: params.pluginId,
		source: params.source,
		message: `provider "${params.providerId}" ${params.metadataKind} method "${params.methodId}" not found; falling back to available methods`,
		pushDiagnostic: params.pushDiagnostic
	});
}
function buildNormalizedModelAllowlist(modelAllowlist) {
	if (!modelAllowlist) return;
	const allowedKeys = normalizeTextList(modelAllowlist.allowedKeys);
	const initialSelections = normalizeTextList(modelAllowlist.initialSelections);
	const message = normalizeOptionalString(modelAllowlist.message);
	if (!allowedKeys && !initialSelections && !message) return;
	return {
		...allowedKeys ? { allowedKeys } : {},
		...initialSelections ? { initialSelections } : {},
		...message ? { message } : {}
	};
}
function buildNormalizedWizardSetup(params) {
	const choiceId = normalizeOptionalString(params.setup.choiceId);
	const choiceLabel = normalizeOptionalString(params.setup.choiceLabel);
	const choiceHint = normalizeOptionalString(params.setup.choiceHint);
	const groupId = normalizeOptionalString(params.setup.groupId);
	const groupLabel = normalizeOptionalString(params.setup.groupLabel);
	const groupHint = normalizeOptionalString(params.setup.groupHint);
	const onboardingScopes = normalizeOnboardingScopes(params.setup.onboardingScopes);
	const modelAllowlist = buildNormalizedModelAllowlist(params.setup.modelAllowlist);
	return {
		...choiceId ? { choiceId } : {},
		...choiceLabel ? { choiceLabel } : {},
		...choiceHint ? { choiceHint } : {},
		...typeof params.setup.assistantPriority === "number" && Number.isFinite(params.setup.assistantPriority) ? { assistantPriority: params.setup.assistantPriority } : {},
		...params.setup.assistantVisibility === "manual-only" || params.setup.assistantVisibility === "visible" ? { assistantVisibility: params.setup.assistantVisibility } : {},
		...groupId ? { groupId } : {},
		...groupLabel ? { groupLabel } : {},
		...groupHint ? { groupHint } : {},
		...params.methodId ? { methodId: params.methodId } : {},
		...onboardingScopes ? { onboardingScopes } : {},
		...modelAllowlist ? { modelAllowlist } : {}
	};
}
function buildNormalizedModelPicker(modelPicker, methodId) {
	const label = normalizeOptionalString(modelPicker.label);
	const hint = normalizeOptionalString(modelPicker.hint);
	return {
		...label ? { label } : {},
		...hint ? { hint } : {},
		...methodId ? { methodId } : {}
	};
}
function normalizeProviderWizardSetup(params) {
	const hasAuthMethods = params.auth.length > 0;
	if (!params.setup) return;
	if (!hasAuthMethods) {
		pushPluginValidationDiagnostic({
			level: "warn",
			pluginId: params.pluginId,
			source: params.source,
			message: `provider "${params.providerId}" setup metadata ignored because it has no auth methods`,
			pushDiagnostic: params.pushDiagnostic
		});
		return;
	}
	const methodId = resolveWizardMethodId({
		providerId: params.providerId,
		pluginId: params.pluginId,
		source: params.source,
		auth: params.auth,
		methodId: normalizeOptionalString(params.setup.methodId),
		metadataKind: "setup",
		pushDiagnostic: params.pushDiagnostic
	});
	return buildNormalizedWizardSetup({
		setup: params.setup,
		methodId
	});
}
function normalizeProviderAuthMethods(params) {
	const seenMethodIds = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const method of params.auth) {
		const methodId = normalizeOptionalString(method.id);
		if (!methodId) {
			pushPluginValidationDiagnostic({
				level: "error",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" auth method missing id`,
				pushDiagnostic: params.pushDiagnostic
			});
			continue;
		}
		if (seenMethodIds.has(methodId)) {
			pushPluginValidationDiagnostic({
				level: "error",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" auth method duplicated id "${methodId}"`,
				pushDiagnostic: params.pushDiagnostic
			});
			continue;
		}
		seenMethodIds.add(methodId);
		const wizardSetup = method.wizard;
		const wizard = wizardSetup ? normalizeProviderWizardSetup({
			providerId: params.providerId,
			pluginId: params.pluginId,
			source: params.source,
			auth: [{
				...method,
				id: methodId
			}],
			setup: wizardSetup,
			pushDiagnostic: params.pushDiagnostic
		}) : void 0;
		normalized.push({
			...method,
			id: methodId,
			label: normalizeOptionalString(method.label) ?? methodId,
			...normalizeOptionalString(method.hint) ? { hint: normalizeOptionalString(method.hint) } : {},
			...wizard ? { wizard } : {}
		});
	}
	return normalized;
}
function normalizeProviderWizard(params) {
	if (!params.wizard) return;
	const hasAuthMethods = params.auth.length > 0;
	const normalizeSetup = () => {
		const setup = params.wizard?.setup;
		if (!setup) return;
		return normalizeProviderWizardSetup({
			providerId: params.providerId,
			pluginId: params.pluginId,
			source: params.source,
			auth: params.auth,
			setup,
			pushDiagnostic: params.pushDiagnostic
		});
	};
	const normalizeModelPicker = () => {
		const modelPicker = params.wizard?.modelPicker;
		if (!modelPicker) return;
		if (!hasAuthMethods) {
			pushPluginValidationDiagnostic({
				level: "warn",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" model-picker metadata ignored because it has no auth methods`,
				pushDiagnostic: params.pushDiagnostic
			});
			return;
		}
		return buildNormalizedModelPicker(modelPicker, resolveWizardMethodId({
			providerId: params.providerId,
			pluginId: params.pluginId,
			source: params.source,
			auth: params.auth,
			methodId: normalizeOptionalString(modelPicker.methodId),
			metadataKind: "model-picker",
			pushDiagnostic: params.pushDiagnostic
		}));
	};
	const setup = normalizeSetup();
	const modelPicker = normalizeModelPicker();
	if (!setup && !modelPicker) return;
	return {
		...setup ? { setup } : {},
		...modelPicker ? { modelPicker } : {}
	};
}
function normalizeRegisteredProvider(params) {
	const id = normalizeOptionalString(params.provider.id);
	if (!id) {
		pushPluginValidationDiagnostic({
			level: "error",
			pluginId: params.pluginId,
			source: params.source,
			message: "provider registration missing id",
			pushDiagnostic: params.pushDiagnostic
		});
		return null;
	}
	const auth = normalizeProviderAuthMethods({
		providerId: id,
		pluginId: params.pluginId,
		source: params.source,
		auth: params.provider.auth ?? [],
		pushDiagnostic: params.pushDiagnostic
	});
	const docsPath = normalizeOptionalString(params.provider.docsPath);
	const aliases = normalizeTextList(params.provider.aliases);
	const deprecatedProfileIds = normalizeTextList(params.provider.deprecatedProfileIds);
	const oauthProfileIdRepairs = normalizeProviderOAuthProfileIdRepairs(params.provider.oauthProfileIdRepairs);
	const envVars = normalizeTextList(params.provider.envVars);
	const wizard = normalizeProviderWizard({
		providerId: id,
		pluginId: params.pluginId,
		source: params.source,
		auth,
		wizard: params.provider.wizard,
		pushDiagnostic: params.pushDiagnostic
	});
	const catalog = params.provider.catalog;
	const discovery = params.provider.discovery;
	if (catalog && discovery) pushPluginValidationDiagnostic({
		level: "warn",
		pluginId: params.pluginId,
		source: params.source,
		message: `provider "${id}" registered both catalog and discovery; using catalog`,
		pushDiagnostic: params.pushDiagnostic
	});
	const { wizard: _ignoredWizard, docsPath: _ignoredDocsPath, aliases: _ignoredAliases, envVars: _ignoredEnvVars, catalog: _ignoredCatalog, discovery: _ignoredDiscovery, ...restProvider } = params.provider;
	return {
		...restProvider,
		id,
		label: normalizeOptionalString(params.provider.label) ?? id,
		...docsPath ? { docsPath } : {},
		...aliases ? { aliases } : {},
		...deprecatedProfileIds ? { deprecatedProfileIds } : {},
		...oauthProfileIdRepairs ? { oauthProfileIdRepairs } : {},
		...envVars ? { envVars } : {},
		auth,
		...catalog ? { catalog } : {},
		...!catalog && discovery ? { discovery } : {},
		...wizard ? { wizard } : {}
	};
}
//#endregion
//#region src/plugins/registry.ts
const constrainLegacyPromptInjectionHook = (handler) => {
	return (event, ctx) => {
		const result = handler(event, ctx);
		if (result && typeof result === "object" && "then" in result) return Promise.resolve(result).then((resolved) => stripPromptMutationFieldsFromLegacyHookResult(resolved));
		return stripPromptMutationFieldsFromLegacyHookResult(result);
	};
};
const activePluginHookRegistrations = resolveGlobalSingleton(Symbol.for("openclaw.activePluginHookRegistrations"), () => /* @__PURE__ */ new Map());
/**
* Keep mode decoding centralized. PluginRegistrationMode is the public label;
* registry code should consume these booleans instead of duplicating string
* checks across individual registration handlers.
*/
function resolvePluginRegistrationCapabilities(mode) {
	return {
		capabilityHandlers: mode === "full" || mode === "discovery",
		runtimeChannel: mode !== "setup-only"
	};
}
function createPluginRegistry(registryParams) {
	const registry = createEmptyPluginRegistry();
	const coreGatewayMethods = new Set([...registryParams.coreGatewayMethodNames ?? [], ...Object.keys(registryParams.coreGatewayHandlers ?? {})]);
	const pluginHookRollback = /* @__PURE__ */ new Map();
	const pluginsWithChannelRegistrationConflict = /* @__PURE__ */ new Set();
	const pushDiagnostic = (diag) => {
		registry.diagnostics.push(diag);
	};
	const throwRegistrationError = (message) => {
		throw new Error(message);
	};
	const requireRegistrationValue = (value, message) => {
		if (!value) throw new Error(message);
		return value;
	};
	const registerCodexAppServerExtensionFactory = (record, factory) => {
		if (record.origin !== "bundled") {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "only bundled plugins can register Codex app-server extension factories"
			});
			return;
		}
		if (!(record.contracts?.embeddedExtensionFactories ?? []).includes("codex-app-server")) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "plugin must declare contracts.embeddedExtensionFactories: [\"codex-app-server\"] to register Codex app-server extension factories"
			});
			return;
		}
		if (typeof factory !== "function") {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "codex app-server extension factory must be a function"
			});
			return;
		}
		if (registry.codexAppServerExtensionFactories.some((entry) => entry.pluginId === record.id && entry.rawFactory === factory)) return;
		const safeFactory = async (codex) => {
			try {
				await factory(codex);
			} catch (error) {
				const detail = error instanceof Error ? error.message : String(error);
				registryParams.logger.warn(`[plugins] codex app-server extension factory failed for ${record.id}: ${detail}`);
			}
		};
		registry.codexAppServerExtensionFactories.push({
			pluginId: record.id,
			pluginName: record.name,
			rawFactory: factory,
			factory: safeFactory,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerAgentToolResultMiddleware = (record, handler, options) => {
		if (record.origin !== "bundled") {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "only bundled plugins can register agent tool result middleware"
			});
			return;
		}
		if (typeof handler !== "function") {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "agent tool result middleware must be a function"
			});
			return;
		}
		const runtimes = normalizeAgentToolResultMiddlewareRuntimes(options);
		if (runtimes.length === 0) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "agent tool result middleware must target at least one supported runtime"
			});
			return;
		}
		const declared = normalizeAgentToolResultMiddlewareRuntimeIds(record.contracts?.agentToolResultMiddleware);
		const missing = runtimes.filter((runtime) => !declared.includes(runtime));
		if (missing.length > 0) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `plugin must declare contracts.agentToolResultMiddleware for: ${missing.join(", ")}`
			});
			return;
		}
		const existing = registry.agentToolResultMiddlewares.find((entry) => entry.pluginId === record.id && entry.rawHandler === handler);
		if (existing) {
			existing.runtimes = [...new Set([...existing.runtimes, ...runtimes])];
			return;
		}
		const safeHandler = async (event, ctx) => {
			try {
				return await handler(event, ctx);
			} catch (error) {
				registryParams.logger.warn(`[plugins] agent tool result middleware failed for ${record.id}`);
				throw error;
			}
		};
		registry.agentToolResultMiddlewares.push({
			pluginId: record.id,
			pluginName: record.name,
			rawHandler: handler,
			handler: safeHandler,
			runtimes,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerTool = (record, tool, opts) => {
		if (pluginsWithChannelRegistrationConflict.has(record.id)) return;
		const names = opts?.names ?? (opts?.name ? [opts.name] : []);
		const optional = opts?.optional === true;
		const factory = typeof tool === "function" ? tool : (_ctx) => tool;
		if (typeof tool !== "function") names.push(tool.name);
		const normalized = names.map((name) => name.trim()).filter(Boolean);
		if (normalized.length > 0) record.toolNames.push(...normalized);
		registry.tools.push({
			pluginId: record.id,
			pluginName: record.name,
			factory,
			names: normalized,
			optional,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerHook = (record, events, handler, opts, config) => {
		const normalizedEvents = (Array.isArray(events) ? events : [events]).map((event) => event.trim()).filter(Boolean);
		const entry = opts?.entry ?? null;
		const hookName = requireRegistrationValue(entry?.hook.name ?? opts?.name?.trim(), "hook registration missing name");
		const existingHook = registry.hooks.find((entry) => entry.entry.hook.name === hookName);
		if (existingHook) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `hook already registered: ${hookName} (${existingHook.pluginId})`
			});
			return;
		}
		const description = entry?.hook.description ?? opts?.description ?? "";
		const hookEntry = entry ? {
			...entry,
			hook: {
				...entry.hook,
				name: hookName,
				description,
				source: "openclaw-plugin",
				pluginId: record.id
			},
			metadata: {
				...entry.metadata,
				events: normalizedEvents
			}
		} : {
			hook: {
				name: hookName,
				description,
				source: "openclaw-plugin",
				pluginId: record.id,
				filePath: record.source,
				baseDir: path.dirname(record.source),
				handlerPath: record.source
			},
			frontmatter: {},
			metadata: { events: normalizedEvents },
			invocation: { enabled: true }
		};
		record.hookNames.push(hookName);
		registry.hooks.push({
			pluginId: record.id,
			entry: hookEntry,
			events: normalizedEvents,
			source: record.source
		});
		const hookSystemEnabled = config?.hooks?.internal?.enabled !== false;
		if (!registryParams.activateGlobalSideEffects || !hookSystemEnabled || opts?.register === false) return;
		const previousRegistrations = activePluginHookRegistrations.get(hookName) ?? [];
		for (const registration of previousRegistrations) unregisterInternalHook(registration.event, registration.handler);
		const nextRegistrations = [];
		for (const event of normalizedEvents) {
			registerInternalHook(event, handler);
			nextRegistrations.push({
				event,
				handler
			});
		}
		activePluginHookRegistrations.set(hookName, nextRegistrations);
		const rollbackEntries = pluginHookRollback.get(record.id) ?? [];
		rollbackEntries.push({
			name: hookName,
			previousRegistrations: [...previousRegistrations]
		});
		pluginHookRollback.set(record.id, rollbackEntries);
	};
	const registerGatewayMethod = (record, method, handler, opts) => {
		const trimmed = method.trim();
		if (!trimmed) return;
		if (coreGatewayMethods.has(trimmed) || registry.gatewayHandlers[trimmed]) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `gateway method already registered: ${trimmed}`
			});
			return;
		}
		registry.gatewayHandlers[trimmed] = handler;
		const normalizedScope = normalizePluginGatewayMethodScope(trimmed, opts?.scope);
		if (normalizedScope.coercedToReservedAdmin) pushDiagnostic({
			level: "warn",
			pluginId: record.id,
			source: record.source,
			message: `gateway method scope coerced to operator.admin for reserved core namespace: ${trimmed}`
		});
		const effectiveScope = normalizedScope.scope;
		if (effectiveScope) {
			registry.gatewayMethodScopes ??= {};
			registry.gatewayMethodScopes[trimmed] = effectiveScope;
		}
		record.gatewayMethods.push(trimmed);
	};
	const describeHttpRouteOwner = (entry) => {
		return `${normalizeOptionalString(entry.pluginId) || "unknown-plugin"} (${normalizeOptionalString(entry.source) || "unknown-source"})`;
	};
	const registerHttpRoute = (record, params) => {
		const normalizedPath = normalizePluginHttpPath(params.path);
		if (!normalizedPath) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: "http route registration missing path"
			});
			return;
		}
		if (params.auth !== "gateway" && params.auth !== "plugin") {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `http route registration missing or invalid auth: ${normalizedPath}`
			});
			return;
		}
		const match = params.match ?? "exact";
		const overlappingRoute = findOverlappingPluginHttpRoute(registry.httpRoutes, {
			path: normalizedPath,
			match
		});
		if (overlappingRoute && overlappingRoute.auth !== params.auth) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `http route overlap rejected: ${normalizedPath} (${match}, ${params.auth}) overlaps ${overlappingRoute.path} (${overlappingRoute.match}, ${overlappingRoute.auth}) owned by ${describeHttpRouteOwner(overlappingRoute)}`
			});
			return;
		}
		const existingIndex = registry.httpRoutes.findIndex((entry) => entry.path === normalizedPath && entry.match === match);
		if (existingIndex >= 0) {
			const existing = registry.httpRoutes[existingIndex];
			if (!existing) return;
			if (!params.replaceExisting && existing.pluginId !== record.id) {
				pushDiagnostic({
					level: "error",
					pluginId: record.id,
					source: record.source,
					message: `http route already registered: ${normalizedPath} (${match}) by ${describeHttpRouteOwner(existing)}`
				});
				return;
			}
			if (existing.pluginId && existing.pluginId !== record.id) {
				pushDiagnostic({
					level: "error",
					pluginId: record.id,
					source: record.source,
					message: `http route replacement rejected: ${normalizedPath} (${match}) owned by ${describeHttpRouteOwner(existing)}`
				});
				return;
			}
			registry.httpRoutes[existingIndex] = {
				pluginId: record.id,
				path: normalizedPath,
				handler: params.handler,
				auth: params.auth,
				match,
				...params.gatewayRuntimeScopeSurface ? { gatewayRuntimeScopeSurface: params.gatewayRuntimeScopeSurface } : {},
				source: record.source
			};
			return;
		}
		record.httpRoutes += 1;
		registry.httpRoutes.push({
			pluginId: record.id,
			path: normalizedPath,
			handler: params.handler,
			auth: params.auth,
			match,
			...params.gatewayRuntimeScopeSurface ? { gatewayRuntimeScopeSurface: params.gatewayRuntimeScopeSurface } : {},
			source: record.source
		});
	};
	const registerChannel = (record, registration, mode = "full") => {
		const registrationCapabilities = resolvePluginRegistrationCapabilities(mode);
		const normalized = typeof registration.plugin === "object" ? registration : { plugin: registration };
		const plugin = normalizeRegisteredChannelPlugin({
			pluginId: record.id,
			source: record.source,
			plugin: normalized.plugin,
			pushDiagnostic
		});
		if (!plugin) return;
		const id = plugin.id;
		const existingRuntime = registry.channels.find((entry) => entry.plugin.id === id);
		if (registrationCapabilities.runtimeChannel && existingRuntime) {
			if (existingRuntime.pluginId === record.id) {
				existingRuntime.plugin = plugin;
				existingRuntime.pluginName = record.name;
				existingRuntime.source = record.source;
				existingRuntime.rootDir = record.rootDir;
				const existingSetup = registry.channelSetups.find((entry) => entry.plugin.id === id);
				if (existingSetup) {
					existingSetup.plugin = plugin;
					existingSetup.pluginName = record.name;
					existingSetup.source = record.source;
					existingSetup.enabled = record.enabled;
					existingSetup.rootDir = record.rootDir;
				}
				return;
			}
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `channel already registered: ${id} (${existingRuntime.pluginId})`
			});
			pluginsWithChannelRegistrationConflict.add(record.id);
			return;
		}
		const existingSetup = registry.channelSetups.find((entry) => entry.plugin.id === id);
		if (existingSetup) {
			if (existingSetup.pluginId === record.id) {
				existingSetup.plugin = plugin;
				existingSetup.pluginName = record.name;
				existingSetup.source = record.source;
				existingSetup.enabled = record.enabled;
				existingSetup.rootDir = record.rootDir;
				return;
			}
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `channel setup already registered: ${id} (${existingSetup.pluginId})`
			});
			pluginsWithChannelRegistrationConflict.add(record.id);
			return;
		}
		record.channelIds.push(id);
		registry.channelSetups.push({
			pluginId: record.id,
			pluginName: record.name,
			plugin,
			source: record.source,
			enabled: record.enabled,
			rootDir: record.rootDir
		});
		if (!registrationCapabilities.runtimeChannel) return;
		registry.channels.push({
			pluginId: record.id,
			pluginName: record.name,
			plugin,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerProvider = (record, provider) => {
		const normalizedProvider = normalizeRegisteredProvider({
			pluginId: record.id,
			source: record.source,
			provider,
			pushDiagnostic
		});
		if (!normalizedProvider) return;
		const id = normalizedProvider.id;
		const existing = registry.providers.find((entry) => entry.provider.id === id);
		if (existing) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `provider already registered: ${id} (${existing.pluginId})`
			});
			return;
		}
		record.providerIds.push(id);
		registry.providers.push({
			pluginId: record.id,
			pluginName: record.name,
			provider: normalizedProvider,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerAgentHarness$1 = (record, harness) => {
		const id = harness.id.trim();
		if (!id) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "agent harness registration missing id"
			});
			return;
		}
		const existing = registryParams.activateGlobalSideEffects === false ? registry.agentHarnesses.find((entry) => entry.harness.id === id) : getRegisteredAgentHarness(id);
		if (existing) {
			const ownerPluginId = "ownerPluginId" in existing ? existing.ownerPluginId : "pluginId" in existing ? existing.pluginId : void 0;
			const ownerDetail = ownerPluginId ? ` (owner: ${ownerPluginId})` : "";
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `agent harness already registered: ${id}${ownerDetail}`
			});
			return;
		}
		const normalizedHarness = {
			...harness,
			id,
			pluginId: harness.pluginId ?? record.id
		};
		if (registryParams.activateGlobalSideEffects !== false) registerAgentHarness(normalizedHarness, { ownerPluginId: record.id });
		record.agentHarnessIds.push(id);
		registry.agentHarnesses.push({
			pluginId: record.id,
			pluginName: record.name,
			harness: normalizedHarness,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerCliBackend = (record, backend) => {
		const id = backend.id.trim();
		if (!id) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "cli backend registration missing id"
			});
			return;
		}
		const existing = (registry.cliBackends ?? []).find((entry) => entry.backend.id === id);
		if (existing) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `cli backend already registered: ${id} (${existing.pluginId})`
			});
			return;
		}
		(registry.cliBackends ??= []).push({
			pluginId: record.id,
			pluginName: record.name,
			backend: {
				...backend,
				id
			},
			source: record.source,
			rootDir: record.rootDir
		});
		record.cliBackendIds.push(id);
	};
	const registerTextTransforms = (record, transforms) => {
		if ((!transforms.input || transforms.input.length === 0) && (!transforms.output || transforms.output.length === 0)) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: "text transform registration has no input or output replacements"
			});
			return;
		}
		registry.textTransforms.push({
			pluginId: record.id,
			pluginName: record.name,
			transforms,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerUniqueProviderLike = (params) => {
		const id = params.provider.id.trim();
		const { record, kindLabel } = params;
		const missingLabel = `${kindLabel} registration missing id`;
		const duplicateLabel = `${kindLabel} already registered: ${id}`;
		if (!id) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: missingLabel
			});
			return;
		}
		const existing = params.registrations.find((entry) => entry.provider.id === id);
		if (existing) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `${duplicateLabel} (${existing.pluginId})`
			});
			return;
		}
		params.ownedIds.push(id);
		params.registrations.push({
			pluginId: record.id,
			pluginName: record.name,
			provider: params.provider,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerSpeechProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "speech provider",
			registrations: registry.speechProviders,
			ownedIds: record.speechProviderIds
		});
	};
	const registerRealtimeTranscriptionProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "realtime transcription provider",
			registrations: registry.realtimeTranscriptionProviders,
			ownedIds: record.realtimeTranscriptionProviderIds
		});
	};
	const registerRealtimeVoiceProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "realtime voice provider",
			registrations: registry.realtimeVoiceProviders,
			ownedIds: record.realtimeVoiceProviderIds
		});
	};
	const registerMediaUnderstandingProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "media provider",
			registrations: registry.mediaUnderstandingProviders,
			ownedIds: record.mediaUnderstandingProviderIds
		});
	};
	const registerImageGenerationProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "image-generation provider",
			registrations: registry.imageGenerationProviders,
			ownedIds: record.imageGenerationProviderIds
		});
	};
	const registerVideoGenerationProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "video-generation provider",
			registrations: registry.videoGenerationProviders,
			ownedIds: record.videoGenerationProviderIds
		});
	};
	const registerMusicGenerationProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "music-generation provider",
			registrations: registry.musicGenerationProviders,
			ownedIds: record.musicGenerationProviderIds
		});
	};
	const registerWebFetchProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "web fetch provider",
			registrations: registry.webFetchProviders,
			ownedIds: record.webFetchProviderIds
		});
	};
	const registerWebSearchProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "web search provider",
			registrations: registry.webSearchProviders,
			ownedIds: record.webSearchProviderIds
		});
	};
	const registerMigrationProvider = (record, provider) => {
		registerUniqueProviderLike({
			record,
			provider,
			kindLabel: "migration provider",
			registrations: registry.migrationProviders,
			ownedIds: record.migrationProviderIds
		});
	};
	const registerCli = (record, registrar, opts) => {
		const normalizeCommandRoot = (raw, source) => {
			const normalized = normalizeCommandDescriptorName(raw);
			if (!normalized) pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `invalid cli ${source} name: ${JSON.stringify(raw.trim())}`
			});
			return normalized;
		};
		const descriptors = (opts?.descriptors ?? []).map((descriptor) => {
			const name = normalizeCommandRoot(descriptor.name, "descriptor");
			const description = sanitizeCommandDescriptorDescription(descriptor.description);
			return name && description ? {
				name,
				description,
				hasSubcommands: descriptor.hasSubcommands
			} : null;
		}).filter((descriptor) => descriptor !== null);
		const commands = [...opts?.commands ?? [], ...descriptors.map((descriptor) => descriptor.name)].map((cmd) => normalizeCommandRoot(cmd, "command")).filter((command) => command !== null);
		if (commands.length === 0) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "cli registration missing explicit commands metadata"
			});
			return;
		}
		const existing = registry.cliRegistrars.find((entry) => entry.commands.some((command) => commands.includes(command)));
		if (existing) {
			const overlap = commands.find((command) => existing.commands.includes(command));
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `cli command already registered: ${overlap ?? commands[0]} (${existing.pluginId})`
			});
			return;
		}
		record.cliCommands.push(...commands);
		registry.cliRegistrars.push({
			pluginId: record.id,
			pluginName: record.name,
			register: registrar,
			commands,
			descriptors,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const reservedNodeHostCommands = new Set([
		...NODE_SYSTEM_RUN_COMMANDS,
		...NODE_EXEC_APPROVALS_COMMANDS,
		NODE_SYSTEM_NOTIFY_COMMAND
	]);
	const registerReload = (record, registration) => {
		const normalize = (values) => (values ?? []).map((value) => value.trim()).filter(Boolean);
		const normalized = {
			restartPrefixes: normalize(registration.restartPrefixes),
			hotPrefixes: normalize(registration.hotPrefixes),
			noopPrefixes: normalize(registration.noopPrefixes)
		};
		if ((normalized.restartPrefixes?.length ?? 0) === 0 && (normalized.hotPrefixes?.length ?? 0) === 0 && (normalized.noopPrefixes?.length ?? 0) === 0) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: "reload registration missing prefixes"
			});
			return;
		}
		registry.reloads ??= [];
		registry.reloads.push({
			pluginId: record.id,
			pluginName: record.name,
			registration: normalized,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerNodeHostCommand = (record, nodeCommand) => {
		const command = nodeCommand.command.trim();
		if (!command) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "node host command registration missing command"
			});
			return;
		}
		if (reservedNodeHostCommands.has(command)) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `node host command reserved by core: ${command}`
			});
			return;
		}
		registry.nodeHostCommands ??= [];
		const existing = registry.nodeHostCommands.find((entry) => entry.command.command === command);
		if (existing) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `node host command already registered: ${command} (${existing.pluginId})`
			});
			return;
		}
		registry.nodeHostCommands.push({
			pluginId: record.id,
			pluginName: record.name,
			command: {
				...nodeCommand,
				command,
				cap: normalizeOptionalString(nodeCommand.cap)
			},
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerSecurityAuditCollector = (record, collector) => {
		registry.securityAuditCollectors ??= [];
		registry.securityAuditCollectors.push({
			pluginId: record.id,
			pluginName: record.name,
			collector,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerService = (record, service) => {
		const id = service.id.trim();
		if (!id) return;
		const existing = registry.services.find((entry) => entry.service.id === id);
		if (existing) {
			if (existing.pluginId === record.id) return;
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `service already registered: ${id} (${existing.pluginId})`
			});
			return;
		}
		record.services.push(id);
		registry.services.push({
			pluginId: record.id,
			pluginName: record.name,
			service,
			source: record.source,
			origin: record.origin,
			rootDir: record.rootDir
		});
	};
	const registerGatewayDiscoveryService = (record, service) => {
		const id = service.id.trim();
		if (!id) return;
		const existing = registry.gatewayDiscoveryServices.find((entry) => entry.service.id === id);
		if (existing) {
			if (existing.pluginId === record.id) return;
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `gateway discovery service already registered: ${id} (${existing.pluginId})`
			});
			return;
		}
		record.gatewayDiscoveryServiceIds.push(id);
		registry.gatewayDiscoveryServices.push({
			pluginId: record.id,
			pluginName: record.name,
			service,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerCommand = (record, command) => {
		const name = command.name.trim();
		if (!name) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "command registration missing name"
			});
			return;
		}
		if (!registryParams.activateGlobalSideEffects) {
			const validationError = validatePluginCommandDefinition(command);
			if (validationError) {
				pushDiagnostic({
					level: "error",
					pluginId: record.id,
					source: record.source,
					message: `command registration failed: ${validationError}`
				});
				return;
			}
		} else {
			const result = registerPluginCommand(record.id, command, {
				pluginName: record.name,
				pluginRoot: record.rootDir
			});
			if (!result.ok) {
				pushDiagnostic({
					level: "error",
					pluginId: record.id,
					source: record.source,
					message: `command registration failed: ${result.error}`
				});
				return;
			}
		}
		record.commands.push(name);
		registry.commands.push({
			pluginId: record.id,
			pluginName: record.name,
			command,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const registerTypedHook = (record, hookName, handler, opts, policy) => {
		if (!isPluginHookName(hookName)) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: `unknown typed hook "${String(hookName)}" ignored`
			});
			return;
		}
		let effectiveHandler = handler;
		if (policy?.allowPromptInjection === false && isPromptInjectionHookName(hookName)) {
			if (hookName === "before_prompt_build") {
				pushDiagnostic({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: `typed hook "${hookName}" blocked by plugins.entries.${record.id}.hooks.allowPromptInjection=false`
				});
				return;
			}
			if (hookName === "before_agent_start") {
				pushDiagnostic({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: `typed hook "${hookName}" prompt fields constrained by plugins.entries.${record.id}.hooks.allowPromptInjection=false`
				});
				effectiveHandler = constrainLegacyPromptInjectionHook(handler);
			}
		}
		if (isConversationHookName(hookName)) {
			const explicitConversationAccess = policy?.allowConversationAccess;
			if (record.origin !== "bundled" && explicitConversationAccess !== true) {
				pushDiagnostic({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: `typed hook "${hookName}" blocked because non-bundled plugins must set plugins.entries.${record.id}.hooks.allowConversationAccess=true`
				});
				return;
			}
			if (record.origin === "bundled" && explicitConversationAccess === false) {
				pushDiagnostic({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: `typed hook "${hookName}" blocked by plugins.entries.${record.id}.hooks.allowConversationAccess=false`
				});
				return;
			}
		}
		record.hookCount += 1;
		registry.typedHooks.push({
			pluginId: record.id,
			hookName,
			handler: effectiveHandler,
			priority: opts?.priority,
			source: record.source
		});
	};
	const registerConversationBindingResolvedHandler = (record, handler) => {
		registry.conversationBindingResolvedHandlers.push({
			pluginId: record.id,
			pluginName: record.name,
			pluginRoot: record.rootDir,
			handler,
			source: record.source,
			rootDir: record.rootDir
		});
	};
	const normalizeLogger = (logger) => ({
		info: logger.info,
		warn: logger.warn,
		error: logger.error,
		debug: logger.debug
	});
	const pluginRuntimeById = /* @__PURE__ */ new Map();
	const resolvePluginRuntime = (pluginId) => {
		const cached = pluginRuntimeById.get(pluginId);
		if (cached) return cached;
		const runtime = new Proxy(registryParams.runtime, { get(target, prop, receiver) {
			if (prop !== "subagent") return Reflect.get(target, prop, receiver);
			const subagent = Reflect.get(target, prop, receiver);
			return {
				run: (params) => withPluginRuntimePluginIdScope(pluginId, () => subagent.run(params)),
				waitForRun: (params) => withPluginRuntimePluginIdScope(pluginId, () => subagent.waitForRun(params)),
				getSessionMessages: (params) => withPluginRuntimePluginIdScope(pluginId, () => subagent.getSessionMessages(params)),
				getSession: (params) => withPluginRuntimePluginIdScope(pluginId, () => subagent.getSession(params)),
				deleteSession: (params) => withPluginRuntimePluginIdScope(pluginId, () => subagent.deleteSession(params))
			};
		} });
		pluginRuntimeById.set(pluginId, runtime);
		return runtime;
	};
	const createApi = (record, params) => {
		const registrationMode = params.registrationMode ?? "full";
		const registrationCapabilities = resolvePluginRegistrationCapabilities(registrationMode);
		return buildPluginApi({
			id: record.id,
			name: record.name,
			version: record.version,
			description: record.description,
			source: record.source,
			rootDir: record.rootDir,
			registrationMode,
			config: params.config,
			pluginConfig: params.pluginConfig,
			runtime: resolvePluginRuntime(record.id),
			logger: normalizeLogger(registryParams.logger),
			resolvePath: (input) => resolveUserPath(input),
			handlers: {
				...registrationCapabilities.capabilityHandlers ? {
					registerTool: (tool, opts) => registerTool(record, tool, opts),
					registerHook: (events, handler, opts) => registerHook(record, events, handler, opts, params.config),
					registerHttpRoute: (routeParams) => registerHttpRoute(record, routeParams),
					registerProvider: (provider) => registerProvider(record, provider),
					registerAgentHarness: (harness) => registerAgentHarness$1(record, harness),
					registerDetachedTaskRuntime: (runtime) => {
						const existing = getDetachedTaskLifecycleRuntimeRegistration();
						if (existing && existing.pluginId !== record.id) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: `detached task runtime already registered by ${existing.pluginId}`
							});
							return;
						}
						registerDetachedTaskLifecycleRuntime(record.id, runtime);
					},
					registerSpeechProvider: (provider) => registerSpeechProvider(record, provider),
					registerRealtimeTranscriptionProvider: (provider) => registerRealtimeTranscriptionProvider(record, provider),
					registerRealtimeVoiceProvider: (provider) => registerRealtimeVoiceProvider(record, provider),
					registerMediaUnderstandingProvider: (provider) => registerMediaUnderstandingProvider(record, provider),
					registerImageGenerationProvider: (provider) => registerImageGenerationProvider(record, provider),
					registerVideoGenerationProvider: (provider) => registerVideoGenerationProvider(record, provider),
					registerMusicGenerationProvider: (provider) => registerMusicGenerationProvider(record, provider),
					registerWebFetchProvider: (provider) => registerWebFetchProvider(record, provider),
					registerWebSearchProvider: (provider) => registerWebSearchProvider(record, provider),
					registerMigrationProvider: (provider) => registerMigrationProvider(record, provider),
					registerGatewayMethod: (method, handler, opts) => registerGatewayMethod(record, method, handler, opts),
					registerService: (service) => registerService(record, service),
					registerGatewayDiscoveryService: (service) => registerGatewayDiscoveryService(record, service),
					registerCliBackend: (backend) => registerCliBackend(record, backend),
					registerTextTransforms: (transforms) => registerTextTransforms(record, transforms),
					registerReload: (registration) => registerReload(record, registration),
					registerNodeHostCommand: (command) => registerNodeHostCommand(record, command),
					registerSecurityAuditCollector: (collector) => registerSecurityAuditCollector(record, collector),
					registerInteractiveHandler: (registration) => {
						const result = registerPluginInteractiveHandler(record.id, registration, {
							pluginName: record.name,
							pluginRoot: record.rootDir
						});
						if (!result.ok) pushDiagnostic({
							level: "warn",
							pluginId: record.id,
							source: record.source,
							message: result.error ?? "interactive handler registration failed"
						});
					},
					onConversationBindingResolved: (handler) => registerConversationBindingResolvedHandler(record, handler),
					registerCommand: (command) => registerCommand(record, command),
					registerContextEngine: (id, factory) => {
						if (id === defaultSlotIdForKey("contextEngine")) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: `context engine id reserved by core: ${id}`
							});
							return;
						}
						const result = registerContextEngineForOwner(id, factory, `plugin:${record.id}`, { allowSameOwnerRefresh: true });
						if (!result.ok) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: `context engine already registered: ${id} (${result.existingOwner})`
							});
							return;
						}
						if (!record.contextEngineIds?.includes(id)) record.contextEngineIds = [...record.contextEngineIds ?? [], id];
					},
					registerCompactionProvider: (provider) => {
						const existing = getRegisteredCompactionProvider(provider.id);
						if (existing) {
							const ownerDetail = existing.ownerPluginId ? ` (owner: ${existing.ownerPluginId})` : "";
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: `compaction provider already registered: ${provider.id}${ownerDetail}`
							});
							return;
						}
						registerCompactionProvider(provider, { ownerPluginId: record.id });
					},
					registerCodexAppServerExtensionFactory: (factory) => {
						registerCodexAppServerExtensionFactory(record, factory);
					},
					registerAgentToolResultMiddleware: (handler, options) => {
						registerAgentToolResultMiddleware(record, handler, options);
					},
					registerMemoryCapability: (capability) => {
						if (!hasKind(record.kind, "memory")) throwRegistrationError("only memory plugins can register a memory capability");
						if (Array.isArray(record.kind) && record.kind.length > 1 && !record.memorySlotSelected) {
							pushDiagnostic({
								level: "warn",
								pluginId: record.id,
								source: record.source,
								message: "dual-kind plugin not selected for memory slot; skipping memory capability registration"
							});
							return;
						}
						registerMemoryCapability(record.id, capability);
					},
					registerMemoryPromptSection: (builder) => {
						if (!hasKind(record.kind, "memory")) throwRegistrationError("only memory plugins can register a memory prompt section");
						if (Array.isArray(record.kind) && record.kind.length > 1 && !record.memorySlotSelected) {
							pushDiagnostic({
								level: "warn",
								pluginId: record.id,
								source: record.source,
								message: "dual-kind plugin not selected for memory slot; skipping memory prompt section registration"
							});
							return;
						}
						registerMemoryPromptSection(builder);
					},
					registerMemoryPromptSupplement: (builder) => {
						registerMemoryPromptSupplement(record.id, builder);
					},
					registerMemoryCorpusSupplement: (supplement) => {
						registerMemoryCorpusSupplement(record.id, supplement);
					},
					registerMemoryFlushPlan: (resolver) => {
						if (!hasKind(record.kind, "memory")) throwRegistrationError("only memory plugins can register a memory flush plan");
						if (Array.isArray(record.kind) && record.kind.length > 1 && !record.memorySlotSelected) {
							pushDiagnostic({
								level: "warn",
								pluginId: record.id,
								source: record.source,
								message: "dual-kind plugin not selected for memory slot; skipping memory flush plan registration"
							});
							return;
						}
						registerMemoryFlushPlanResolver(resolver);
					},
					registerMemoryRuntime: (runtime) => {
						if (!hasKind(record.kind, "memory")) throwRegistrationError("only memory plugins can register a memory runtime");
						if (Array.isArray(record.kind) && record.kind.length > 1 && !record.memorySlotSelected) {
							pushDiagnostic({
								level: "warn",
								pluginId: record.id,
								source: record.source,
								message: "dual-kind plugin not selected for memory slot; skipping memory runtime registration"
							});
							return;
						}
						registerMemoryRuntime(runtime);
					},
					registerMemoryEmbeddingProvider: (adapter) => {
						if (hasKind(record.kind, "memory")) {
							if (Array.isArray(record.kind) && record.kind.length > 1 && !record.memorySlotSelected) {
								pushDiagnostic({
									level: "warn",
									pluginId: record.id,
									source: record.source,
									message: "dual-kind plugin not selected for memory slot; skipping memory embedding provider registration"
								});
								return;
							}
						} else if (!(record.contracts?.memoryEmbeddingProviders ?? []).includes(adapter.id)) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: `plugin must own memory slot or declare contracts.memoryEmbeddingProviders for adapter: ${adapter.id}`
							});
							return;
						}
						const existing = getRegisteredMemoryEmbeddingProvider(adapter.id);
						if (existing) {
							const ownerDetail = existing.ownerPluginId ? ` (owner: ${existing.ownerPluginId})` : "";
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: `memory embedding provider already registered: ${adapter.id}${ownerDetail}`
							});
							return;
						}
						registerMemoryEmbeddingProvider(adapter, { ownerPluginId: record.id });
						registry.memoryEmbeddingProviders.push({
							pluginId: record.id,
							pluginName: record.name,
							provider: adapter,
							source: record.source,
							rootDir: record.rootDir
						});
					},
					on: (hookName, handler, opts) => registerTypedHook(record, hookName, handler, opts, params.hookPolicy)
				} : {},
				registerCli: (registrar, opts) => registerCli(record, registrar, opts),
				registerChannel: (registration) => registerChannel(record, registration, registrationMode)
			}
		});
	};
	const rollbackPluginGlobalSideEffects = (pluginId) => {
		if (registryParams.activateGlobalSideEffects === false) return;
		clearPluginCommandsForPlugin(pluginId);
		clearPluginInteractiveHandlersForPlugin(pluginId);
		clearContextEnginesForOwner(`plugin:${pluginId}`);
		const hookRollbackEntries = pluginHookRollback.get(pluginId) ?? [];
		for (const entry of hookRollbackEntries.toReversed()) {
			const activeRegistrations = activePluginHookRegistrations.get(entry.name) ?? [];
			for (const registration of activeRegistrations) unregisterInternalHook(registration.event, registration.handler);
			if (entry.previousRegistrations.length === 0) {
				activePluginHookRegistrations.delete(entry.name);
				continue;
			}
			for (const registration of entry.previousRegistrations) registerInternalHook(registration.event, registration.handler);
			activePluginHookRegistrations.set(entry.name, [...entry.previousRegistrations]);
		}
		pluginHookRollback.delete(pluginId);
	};
	return {
		registry,
		createApi,
		rollbackPluginGlobalSideEffects,
		pushDiagnostic,
		registerTool,
		registerChannel,
		registerProvider,
		registerAgentHarness: registerAgentHarness$1,
		registerCliBackend,
		registerTextTransforms,
		registerSpeechProvider,
		registerRealtimeTranscriptionProvider,
		registerRealtimeVoiceProvider,
		registerMediaUnderstandingProvider,
		registerImageGenerationProvider,
		registerVideoGenerationProvider,
		registerMusicGenerationProvider,
		registerWebSearchProvider,
		registerMigrationProvider,
		registerGatewayMethod,
		registerCli,
		registerReload,
		registerNodeHostCommand,
		registerSecurityAuditCollector,
		registerService,
		registerCommand,
		registerHook,
		registerTypedHook
	};
}
//#endregion
//#region src/plugins/loader.ts
const CLI_METADATA_ENTRY_BASENAMES = [
	"cli-metadata.ts",
	"cli-metadata.js",
	"cli-metadata.mjs",
	"cli-metadata.cjs"
];
function resolveDreamingSidecarEngineId(params) {
	const normalizedMemorySlot = normalizeLowercaseStringOrEmpty(params.memorySlot);
	if (!normalizedMemorySlot || normalizedMemorySlot === "none" || normalizedMemorySlot === "memory-core") return null;
	return resolveMemoryDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(params.cfg),
		cfg: params.cfg
	}).enabled ? DEFAULT_MEMORY_DREAMING_PLUGIN_ID : null;
}
var PluginLoadFailureError = class extends Error {
	constructor(registry) {
		const failedPlugins = registry.plugins.filter((entry) => entry.status === "error");
		const summary = failedPlugins.map((entry) => `${entry.id}: ${entry.error ?? "unknown plugin load error"}`).join("; ");
		super(`plugin load failed: ${summary}`);
		this.name = "PluginLoadFailureError";
		this.pluginIds = failedPlugins.map((entry) => entry.id);
		this.registry = registry;
	}
};
const pluginLoaderCacheState = new PluginLoaderCacheState(128);
const LAZY_RUNTIME_REFLECTION_KEYS = [
	"version",
	"config",
	"agent",
	"subagent",
	"system",
	"media",
	"tts",
	"stt",
	"channel",
	"events",
	"logging",
	"state",
	"modelAuth"
];
const defaultLogger = () => createSubsystemLogger("plugins");
const BUNDLED_RUNTIME_MIRROR_LOCK_DIR = ".openclaw-runtime-mirror.lock";
function isPromiseLike(value) {
	return (typeof value === "object" || typeof value === "function") && value !== null && typeof value.then === "function";
}
function snapshotPluginRegistry(registry) {
	return {
		arrays: {
			tools: [...registry.tools],
			hooks: [...registry.hooks],
			typedHooks: [...registry.typedHooks],
			channels: [...registry.channels],
			channelSetups: [...registry.channelSetups],
			providers: [...registry.providers],
			cliBackends: [...registry.cliBackends ?? []],
			textTransforms: [...registry.textTransforms],
			speechProviders: [...registry.speechProviders],
			realtimeTranscriptionProviders: [...registry.realtimeTranscriptionProviders],
			realtimeVoiceProviders: [...registry.realtimeVoiceProviders],
			mediaUnderstandingProviders: [...registry.mediaUnderstandingProviders],
			imageGenerationProviders: [...registry.imageGenerationProviders],
			videoGenerationProviders: [...registry.videoGenerationProviders],
			musicGenerationProviders: [...registry.musicGenerationProviders],
			webFetchProviders: [...registry.webFetchProviders],
			webSearchProviders: [...registry.webSearchProviders],
			migrationProviders: [...registry.migrationProviders],
			codexAppServerExtensionFactories: [...registry.codexAppServerExtensionFactories],
			agentToolResultMiddlewares: [...registry.agentToolResultMiddlewares],
			memoryEmbeddingProviders: [...registry.memoryEmbeddingProviders],
			agentHarnesses: [...registry.agentHarnesses],
			httpRoutes: [...registry.httpRoutes],
			cliRegistrars: [...registry.cliRegistrars],
			reloads: [...registry.reloads ?? []],
			nodeHostCommands: [...registry.nodeHostCommands ?? []],
			securityAuditCollectors: [...registry.securityAuditCollectors ?? []],
			services: [...registry.services],
			commands: [...registry.commands],
			conversationBindingResolvedHandlers: [...registry.conversationBindingResolvedHandlers],
			diagnostics: [...registry.diagnostics]
		},
		gatewayHandlers: { ...registry.gatewayHandlers },
		gatewayMethodScopes: { ...registry.gatewayMethodScopes }
	};
}
function restorePluginRegistry(registry, snapshot) {
	registry.tools = snapshot.arrays.tools;
	registry.hooks = snapshot.arrays.hooks;
	registry.typedHooks = snapshot.arrays.typedHooks;
	registry.channels = snapshot.arrays.channels;
	registry.channelSetups = snapshot.arrays.channelSetups;
	registry.providers = snapshot.arrays.providers;
	registry.cliBackends = snapshot.arrays.cliBackends;
	registry.textTransforms = snapshot.arrays.textTransforms;
	registry.speechProviders = snapshot.arrays.speechProviders;
	registry.realtimeTranscriptionProviders = snapshot.arrays.realtimeTranscriptionProviders;
	registry.realtimeVoiceProviders = snapshot.arrays.realtimeVoiceProviders;
	registry.mediaUnderstandingProviders = snapshot.arrays.mediaUnderstandingProviders;
	registry.imageGenerationProviders = snapshot.arrays.imageGenerationProviders;
	registry.videoGenerationProviders = snapshot.arrays.videoGenerationProviders;
	registry.musicGenerationProviders = snapshot.arrays.musicGenerationProviders;
	registry.webFetchProviders = snapshot.arrays.webFetchProviders;
	registry.webSearchProviders = snapshot.arrays.webSearchProviders;
	registry.migrationProviders = snapshot.arrays.migrationProviders;
	registry.codexAppServerExtensionFactories = snapshot.arrays.codexAppServerExtensionFactories;
	registry.agentToolResultMiddlewares = snapshot.arrays.agentToolResultMiddlewares;
	registry.memoryEmbeddingProviders = snapshot.arrays.memoryEmbeddingProviders;
	registry.agentHarnesses = snapshot.arrays.agentHarnesses;
	registry.httpRoutes = snapshot.arrays.httpRoutes;
	registry.cliRegistrars = snapshot.arrays.cliRegistrars;
	registry.reloads = snapshot.arrays.reloads;
	registry.nodeHostCommands = snapshot.arrays.nodeHostCommands;
	registry.securityAuditCollectors = snapshot.arrays.securityAuditCollectors;
	registry.services = snapshot.arrays.services;
	registry.commands = snapshot.arrays.commands;
	registry.conversationBindingResolvedHandlers = snapshot.arrays.conversationBindingResolvedHandlers;
	registry.diagnostics = snapshot.arrays.diagnostics;
	registry.gatewayHandlers = snapshot.gatewayHandlers;
	registry.gatewayMethodScopes = snapshot.gatewayMethodScopes;
}
function createGuardedPluginRegistrationApi(api) {
	let closed = false;
	return {
		api: new Proxy(api, { get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);
			if (typeof value !== "function") return value;
			return (...args) => {
				if (closed) return;
				return Reflect.apply(value, target, args);
			};
		} }),
		close: () => {
			closed = true;
		}
	};
}
function runPluginRegisterSync(register, api) {
	const guarded = createGuardedPluginRegistrationApi(api);
	try {
		const result = register(guarded.api);
		if (isPromiseLike(result)) {
			Promise.resolve(result).catch(() => {});
			throw new Error("plugin register must be synchronous");
		}
	} finally {
		guarded.close();
	}
}
const bundledRuntimeDependencyJitiAliases = /* @__PURE__ */ new Map();
function readRuntimeDependencyPackageJson(packageJsonPath) {
	try {
		return JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
	} catch {
		return null;
	}
}
function collectRuntimeDependencyNames(pkg) {
	return [
		...Object.keys(pkg.dependencies ?? {}),
		...Object.keys(pkg.optionalDependencies ?? {}),
		...Object.keys(pkg.peerDependencies ?? {})
	].toSorted((left, right) => left.localeCompare(right));
}
function resolveRuntimePackageImportTarget(exportsField) {
	if (typeof exportsField === "string") return exportsField;
	if (Array.isArray(exportsField)) {
		for (const entry of exportsField) {
			const resolved = resolveRuntimePackageImportTarget(entry);
			if (resolved) return resolved;
		}
		return null;
	}
	if (!exportsField || typeof exportsField !== "object" || Array.isArray(exportsField)) return null;
	const record = exportsField;
	if (Object.prototype.hasOwnProperty.call(record, ".")) return resolveRuntimePackageImportTarget(record["."]);
	for (const condition of [
		"import",
		"node",
		"default"
	]) {
		const resolved = resolveRuntimePackageImportTarget(record[condition]);
		if (resolved) return resolved;
	}
	return null;
}
function collectRuntimePackageWildcardImportTargets(dependencyRoot, exportKey, targetPattern) {
	const targets = /* @__PURE__ */ new Map();
	const wildcardIndex = exportKey.indexOf("*");
	const targetWildcardIndex = targetPattern.indexOf("*");
	if (wildcardIndex === -1 || targetWildcardIndex === -1) return targets;
	const exportPrefix = exportKey.slice(0, wildcardIndex);
	const exportSuffix = exportKey.slice(wildcardIndex + 1);
	const targetPrefix = targetPattern.slice(0, targetWildcardIndex);
	const targetSuffix = targetPattern.slice(targetWildcardIndex + 1);
	const targetBase = path.resolve(dependencyRoot, targetPrefix);
	if (!isPathInside(dependencyRoot, targetBase) || !safeStatSync(targetBase)?.isDirectory()) return targets;
	const stack = [targetBase];
	while (stack.length > 0) {
		const currentDir = stack.pop();
		if (!currentDir) continue;
		let entries;
		try {
			entries = fs.readdirSync(currentDir, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			const entryPath = path.join(currentDir, entry.name);
			if (!isPathInside(dependencyRoot, entryPath)) continue;
			if (entry.isDirectory()) {
				stack.push(entryPath);
				continue;
			}
			if (!entry.isFile()) continue;
			const relativeTarget = path.relative(targetBase, entryPath).split(path.sep).join("/");
			if (targetSuffix && !relativeTarget.endsWith(targetSuffix)) continue;
			const wildcardValue = targetSuffix ? relativeTarget.slice(0, -targetSuffix.length) : relativeTarget;
			targets.set(`${exportPrefix}${wildcardValue}${exportSuffix}`, entryPath);
		}
	}
	return targets;
}
function collectRuntimePackageImportTargets(dependencyRoot, pkg) {
	const targets = /* @__PURE__ */ new Map();
	const exportsField = pkg.exports;
	if (exportsField && typeof exportsField === "object" && !Array.isArray(exportsField) && Object.keys(exportsField).some((key) => key.startsWith("."))) {
		for (const [exportKey, exportValue] of Object.entries(exportsField)) {
			if (!exportKey.startsWith(".")) continue;
			const resolved = resolveRuntimePackageImportTarget(exportValue);
			if (resolved) if (exportKey.includes("*")) for (const [wildcardExportKey, targetPath] of collectRuntimePackageWildcardImportTargets(dependencyRoot, exportKey, resolved)) targets.set(wildcardExportKey, targetPath);
			else targets.set(exportKey, resolved);
		}
		return targets;
	}
	const rootEntry = resolveRuntimePackageImportTarget(exportsField) ?? pkg.module ?? pkg.main;
	if (rootEntry) targets.set(".", rootEntry);
	return targets;
}
function registerBundledRuntimeDependencyJitiAliases(rootDir) {
	const rootPackageJson = readRuntimeDependencyPackageJson(path.join(rootDir, "package.json"));
	if (!rootPackageJson) return;
	for (const dependencyName of collectRuntimeDependencyNames(rootPackageJson)) {
		const dependencyPackageJsonPath = path.join(rootDir, "node_modules", ...dependencyName.split("/"), "package.json");
		const dependencyPackageJson = readRuntimeDependencyPackageJson(dependencyPackageJsonPath);
		if (!dependencyPackageJson) continue;
		const dependencyRoot = path.dirname(dependencyPackageJsonPath);
		for (const [exportKey, entry] of collectRuntimePackageImportTargets(dependencyRoot, dependencyPackageJson)) {
			if (!entry || entry.startsWith("#")) continue;
			const targetPath = path.resolve(dependencyRoot, entry);
			if (!isPathInside(dependencyRoot, targetPath) || !fs.existsSync(targetPath)) continue;
			const aliasKey = exportKey === "." ? dependencyName : `${dependencyName}${exportKey.slice(1)}`;
			bundledRuntimeDependencyJitiAliases.set(aliasKey, normalizeJitiAliasTargetPath(targetPath));
		}
	}
}
function resolveBundledRuntimeDependencyJitiAliasMap() {
	if (bundledRuntimeDependencyJitiAliases.size === 0) return;
	return Object.fromEntries([...bundledRuntimeDependencyJitiAliases.entries()].toSorted(([left], [right]) => right.length - left.length || left.localeCompare(right)));
}
function createPluginJitiLoader(options) {
	const jitiLoaders = /* @__PURE__ */ new Map();
	return (modulePath) => {
		const tryNative = shouldPreferNativeJiti(modulePath);
		const runtimeAliasMap = resolveBundledRuntimeDependencyJitiAliasMap();
		return getCachedPluginJitiLoader({
			cache: jitiLoaders,
			modulePath,
			importerUrl: import.meta.url,
			jitiFilename: modulePath,
			...runtimeAliasMap ? { aliasMap: {
				...buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url, options.pluginSdkResolution),
				...runtimeAliasMap
			} } : {},
			pluginSdkResolution: options.pluginSdkResolution,
			tryNative
		});
	};
}
function resolveCanonicalDistRuntimeSource(source) {
	const marker = `${path.sep}dist-runtime${path.sep}extensions${path.sep}`;
	const index = source.indexOf(marker);
	if (index === -1) return source;
	const candidate = `${source.slice(0, index)}${path.sep}dist${path.sep}extensions${path.sep}${source.slice(index + marker.length)}`;
	return fs.existsSync(candidate) ? candidate : source;
}
function mirrorBundledPluginRuntimeRoot(params) {
	return withBundledRuntimeDepsFilesystemLock(params.installRoot, BUNDLED_RUNTIME_MIRROR_LOCK_DIR, () => {
		const mirrorParent = prepareBundledPluginRuntimeDistMirror({
			installRoot: params.installRoot,
			pluginRoot: params.pluginRoot
		});
		const mirrorRoot = path.join(mirrorParent, params.pluginId);
		fs.mkdirSync(params.installRoot, { recursive: true });
		try {
			fs.chmodSync(params.installRoot, 493);
		} catch {}
		fs.mkdirSync(mirrorParent, { recursive: true });
		try {
			fs.chmodSync(mirrorParent, 493);
		} catch {}
		fs.accessSync(mirrorParent, fs.constants.W_OK);
		if (path.resolve(mirrorRoot) === path.resolve(params.pluginRoot)) return mirrorRoot;
		const tempDir = fs.mkdtempSync(path.join(mirrorParent, `.plugin-${params.pluginId}-`));
		const stagedRoot = path.join(tempDir, "plugin");
		try {
			copyBundledPluginRuntimeRoot(params.pluginRoot, stagedRoot);
			fs.rmSync(mirrorRoot, {
				recursive: true,
				force: true
			});
			fs.renameSync(stagedRoot, mirrorRoot);
		} finally {
			fs.rmSync(tempDir, {
				recursive: true,
				force: true
			});
		}
		return mirrorRoot;
	});
}
function prepareBundledPluginRuntimeDistMirror(params) {
	const sourceExtensionsRoot = path.dirname(params.pluginRoot);
	const sourceDistRoot = path.dirname(sourceExtensionsRoot);
	const sourceDistRootName = path.basename(sourceDistRoot);
	const mirrorDistRoot = path.join(params.installRoot, sourceDistRootName);
	const mirrorExtensionsRoot = path.join(mirrorDistRoot, "extensions");
	ensureBundledRuntimeMirrorDirectory(mirrorDistRoot);
	fs.mkdirSync(mirrorExtensionsRoot, {
		recursive: true,
		mode: 493
	});
	ensureBundledRuntimeDistPackageJson(mirrorDistRoot);
	mirrorBundledRuntimeDistRootEntries({
		sourceDistRoot,
		mirrorDistRoot
	});
	if (sourceDistRootName === "dist-runtime") mirrorCanonicalBundledRuntimeDistRoot({
		installRoot: params.installRoot,
		pluginRoot: params.pluginRoot,
		sourceRuntimeDistRoot: sourceDistRoot
	});
	ensureOpenClawPluginSdkAlias(mirrorDistRoot);
	return mirrorExtensionsRoot;
}
function ensureBundledRuntimeMirrorDirectory(targetRoot) {
	try {
		const stat = fs.lstatSync(targetRoot);
		if (stat.isDirectory() && !stat.isSymbolicLink()) return;
		fs.rmSync(targetRoot, {
			recursive: true,
			force: true
		});
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
	fs.mkdirSync(targetRoot, {
		recursive: true,
		mode: 493
	});
}
function mirrorBundledRuntimeDistRootEntries(params) {
	for (const entry of fs.readdirSync(params.sourceDistRoot, { withFileTypes: true })) {
		if (entry.name === "extensions") continue;
		const sourcePath = path.join(params.sourceDistRoot, entry.name);
		const targetPath = path.join(params.mirrorDistRoot, entry.name);
		if (path.resolve(sourcePath) === path.resolve(targetPath)) continue;
		if (entry.isFile() && shouldMaterializeBundledRuntimeMirrorDistFile(sourcePath)) {
			materializeBundledRuntimeMirrorDistFile(sourcePath, targetPath);
			continue;
		}
		if (fs.existsSync(targetPath)) continue;
		try {
			fs.symlinkSync(sourcePath, targetPath, entry.isDirectory() ? "junction" : "file");
		} catch {
			if (fs.existsSync(targetPath)) continue;
			if (entry.isDirectory()) copyBundledPluginRuntimeRoot(sourcePath, targetPath);
			else if (entry.isFile()) fs.copyFileSync(sourcePath, targetPath);
		}
	}
}
function mirrorCanonicalBundledRuntimeDistRoot(params) {
	const sourceCanonicalDistRoot = path.join(path.dirname(params.sourceRuntimeDistRoot), "dist");
	if (!fs.existsSync(sourceCanonicalDistRoot)) return;
	const targetCanonicalDistRoot = path.join(params.installRoot, "dist");
	ensureBundledRuntimeMirrorDirectory(targetCanonicalDistRoot);
	fs.mkdirSync(path.join(targetCanonicalDistRoot, "extensions"), {
		recursive: true,
		mode: 493
	});
	ensureBundledRuntimeDistPackageJson(targetCanonicalDistRoot);
	mirrorBundledRuntimeDistRootEntries({
		sourceDistRoot: sourceCanonicalDistRoot,
		mirrorDistRoot: targetCanonicalDistRoot
	});
	ensureOpenClawPluginSdkAlias(targetCanonicalDistRoot);
	const pluginId = path.basename(params.pluginRoot);
	const sourceCanonicalPluginRoot = path.join(sourceCanonicalDistRoot, "extensions", pluginId);
	if (!fs.existsSync(sourceCanonicalPluginRoot)) return;
	const targetCanonicalPluginRoot = path.join(targetCanonicalDistRoot, "extensions", pluginId);
	const tempDir = fs.mkdtempSync(path.join(path.dirname(targetCanonicalPluginRoot), `.plugin-${pluginId}-`));
	const stagedRoot = path.join(tempDir, "plugin");
	try {
		copyBundledPluginRuntimeRoot(sourceCanonicalPluginRoot, stagedRoot);
		fs.rmSync(targetCanonicalPluginRoot, {
			recursive: true,
			force: true
		});
		fs.renameSync(stagedRoot, targetCanonicalPluginRoot);
	} finally {
		fs.rmSync(tempDir, {
			recursive: true,
			force: true
		});
	}
}
function ensureBundledRuntimeDistPackageJson(mirrorDistRoot) {
	const packageJsonPath = path.join(mirrorDistRoot, "package.json");
	if (fs.existsSync(packageJsonPath)) return;
	writeRuntimeJsonFile(packageJsonPath, { type: "module" });
}
function copyBundledPluginRuntimeRoot(sourceRoot, targetRoot) {
	if (path.resolve(sourceRoot) === path.resolve(targetRoot)) return;
	fs.mkdirSync(targetRoot, {
		recursive: true,
		mode: 493
	});
	for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
		if (entry.name === "node_modules") continue;
		const sourcePath = path.join(sourceRoot, entry.name);
		const targetPath = path.join(targetRoot, entry.name);
		if (entry.isDirectory()) {
			copyBundledPluginRuntimeRoot(sourcePath, targetPath);
			continue;
		}
		if (entry.isSymbolicLink()) {
			fs.symlinkSync(fs.readlinkSync(sourcePath), targetPath);
			continue;
		}
		if (!entry.isFile()) continue;
		fs.copyFileSync(sourcePath, targetPath);
		try {
			const sourceMode = fs.statSync(sourcePath).mode;
			fs.chmodSync(targetPath, sourceMode | 384);
		} catch {}
	}
}
function writeRuntimeJsonFile(targetPath, value) {
	fs.mkdirSync(path.dirname(targetPath), { recursive: true });
	fs.writeFileSync(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
function hasRuntimeDefaultExport(sourcePath) {
	const text = fs.readFileSync(sourcePath, "utf8");
	return /\bexport\s+default\b/u.test(text) || /\bas\s+default\b/u.test(text);
}
function writeRuntimeModuleWrapper(sourcePath, targetPath) {
	const specifier = path.relative(path.dirname(targetPath), sourcePath).replaceAll(path.sep, "/");
	const normalizedSpecifier = specifier.startsWith(".") ? specifier : `./${specifier}`;
	const defaultForwarder = hasRuntimeDefaultExport(sourcePath) ? [
		`import defaultModule from ${JSON.stringify(normalizedSpecifier)};`,
		`let defaultExport = defaultModule;`,
		`for (let index = 0; index < 4 && defaultExport && typeof defaultExport === "object" && "default" in defaultExport; index += 1) {`,
		`  defaultExport = defaultExport.default;`,
		`}`
	] : [
		`import * as module from ${JSON.stringify(normalizedSpecifier)};`,
		`let defaultExport = "default" in module ? module.default : module;`,
		`for (let index = 0; index < 4 && defaultExport && typeof defaultExport === "object" && "default" in defaultExport; index += 1) {`,
		`  defaultExport = defaultExport.default;`,
		`}`
	];
	const content = [
		`export * from ${JSON.stringify(normalizedSpecifier)};`,
		...defaultForwarder,
		"export { defaultExport as default };",
		""
	].join("\n");
	try {
		if (fs.readFileSync(targetPath, "utf8") === content) return;
	} catch {}
	fs.mkdirSync(path.dirname(targetPath), { recursive: true });
	fs.writeFileSync(targetPath, content, "utf8");
}
function ensureOpenClawPluginSdkAlias(distRoot) {
	const pluginSdkDir = path.join(distRoot, "plugin-sdk");
	if (!fs.existsSync(pluginSdkDir)) return;
	const aliasDir = path.join(distRoot, "extensions", "node_modules", "openclaw");
	const pluginSdkAliasDir = path.join(aliasDir, "plugin-sdk");
	writeRuntimeJsonFile(path.join(aliasDir, "package.json"), {
		name: "openclaw",
		type: "module",
		exports: {
			"./plugin-sdk": "./plugin-sdk/index.js",
			"./plugin-sdk/*": "./plugin-sdk/*.js"
		}
	});
	try {
		if (fs.existsSync(pluginSdkAliasDir) && !fs.lstatSync(pluginSdkAliasDir).isDirectory()) fs.rmSync(pluginSdkAliasDir, {
			recursive: true,
			force: true
		});
	} catch {}
	fs.mkdirSync(pluginSdkAliasDir, { recursive: true });
	for (const entry of fs.readdirSync(pluginSdkDir, { withFileTypes: true })) {
		if (!entry.isFile() || path.extname(entry.name) !== ".js") continue;
		writeRuntimeModuleWrapper(path.join(pluginSdkDir, entry.name), path.join(pluginSdkAliasDir, entry.name));
	}
}
function remapBundledPluginRuntimePath(params) {
	if (!params.source) return;
	const relative = path.relative(params.pluginRoot, params.source);
	if (relative.startsWith("..") || path.isAbsolute(relative)) return params.source;
	return path.join(params.mirroredRoot, relative);
}
function getCachedPluginRegistry(cacheKey) {
	return pluginLoaderCacheState.get(cacheKey);
}
function setCachedPluginRegistry(cacheKey, state) {
	pluginLoaderCacheState.set(cacheKey, state);
}
function buildCacheKey(params) {
	const { roots, loadPaths } = resolvePluginCacheInputs({
		workspaceDir: params.workspaceDir,
		loadPaths: params.plugins.loadPaths,
		env: params.env
	});
	const installs = Object.fromEntries(Object.entries(params.installs ?? {}).map(([pluginId, install]) => [pluginId, {
		...install,
		installPath: typeof install.installPath === "string" ? resolveUserPath(install.installPath, params.env) : install.installPath,
		sourcePath: typeof install.sourcePath === "string" ? resolveUserPath(install.sourcePath, params.env) : install.sourcePath
	}]));
	const scopeKey = serializePluginIdScope(params.onlyPluginIds);
	const setupOnlyKey = params.includeSetupOnlyChannelPlugins === true ? "setup-only" : "runtime";
	const setupOnlyModeKey = params.forceSetupOnlyChannelPlugins === true ? "force-setup" : "normal-setup";
	const setupOnlyRequirementKey = params.requireSetupEntryForSetupOnlyChannelPlugins === true ? "require-setup-entry" : "allow-full-fallback";
	const startupChannelMode = params.preferSetupRuntimeForChannelPlugins === true ? "prefer-setup" : "full";
	const moduleLoadMode = params.loadModules === false ? "manifest-only" : "load-modules";
	const bundledRuntimeDepsMode = params.installBundledRuntimeDeps === false ? "skip-runtime-deps" : "install-runtime-deps";
	const runtimeSubagentMode = params.runtimeSubagentMode ?? "default";
	const gatewayMethodsKey = JSON.stringify(params.coreGatewayMethodNames ?? []);
	const activationMode = params.activate === false ? "snapshot" : "active";
	return `${roots.workspace ?? ""}::${roots.global ?? ""}::${roots.stock ?? ""}::${JSON.stringify({
		...params.plugins,
		installs,
		loadPaths,
		activationMetadataKey: params.activationMetadataKey ?? ""
	})}::${scopeKey}::${setupOnlyKey}::${setupOnlyModeKey}::${setupOnlyRequirementKey}::${startupChannelMode}::${moduleLoadMode}::${bundledRuntimeDepsMode}::${runtimeSubagentMode}::${params.pluginSdkResolution ?? "auto"}::${gatewayMethodsKey}::${activationMode}`;
}
function matchesScopedPluginRequest(params) {
	const scopedIds = params.onlyPluginIdSet;
	if (!scopedIds) return true;
	return scopedIds.has(params.pluginId);
}
function resolveRuntimeSubagentMode(runtimeOptions) {
	if (runtimeOptions?.allowGatewaySubagentBinding === true) return "gateway-bindable";
	if (runtimeOptions?.subagent) return "explicit";
	return "default";
}
function buildActivationMetadataHash(params) {
	const enabledSourceChannels = Object.entries(params.activationSource.rootConfig?.channels ?? {}).filter(([, value]) => {
		if (!value || typeof value !== "object" || Array.isArray(value)) return false;
		return value.enabled === true;
	}).map(([channelId]) => channelId).toSorted((left, right) => left.localeCompare(right));
	const pluginEntryStates = Object.entries(params.activationSource.plugins.entries).map(([pluginId, entry]) => [pluginId, entry?.enabled ?? null]).toSorted(([left], [right]) => left.localeCompare(right));
	const autoEnableReasonEntries = Object.entries(params.autoEnabledReasons).map(([pluginId, reasons]) => [pluginId, [...reasons]]).toSorted(([left], [right]) => left.localeCompare(right));
	return createHash("sha256").update(JSON.stringify({
		enabled: params.activationSource.plugins.enabled,
		allow: params.activationSource.plugins.allow,
		deny: params.activationSource.plugins.deny,
		memorySlot: params.activationSource.plugins.slots.memory,
		entries: pluginEntryStates,
		enabledChannels: enabledSourceChannels,
		autoEnabledReasons: autoEnableReasonEntries
	})).digest("hex");
}
function hasExplicitCompatibilityInputs(options) {
	return options.config !== void 0 || options.activationSourceConfig !== void 0 || options.autoEnabledReasons !== void 0 || options.workspaceDir !== void 0 || options.env !== void 0 || hasExplicitPluginIdScope(options.onlyPluginIds) || options.runtimeOptions !== void 0 || options.pluginSdkResolution !== void 0 || options.coreGatewayHandlers !== void 0 || options.includeSetupOnlyChannelPlugins === true || options.forceSetupOnlyChannelPlugins === true || options.requireSetupEntryForSetupOnlyChannelPlugins === true || options.preferSetupRuntimeForChannelPlugins === true || options.installBundledRuntimeDeps === false || options.loadModules === false;
}
/**
* Convert loader intent into explicit behavior flags.
*
* Registration modes are plugin-facing labels; this plan is the internal source
* of truth for which entrypoint to load and which activation-only policies run.
*/
function resolvePluginRegistrationPlan(params) {
	if (params.canLoadScopedSetupOnlyChannelPlugin) return {
		mode: "setup-only",
		loadSetupEntry: true,
		loadSetupRuntimeEntry: false,
		runRuntimeCapabilityPolicy: false,
		runFullActivationOnlyRegistrations: false
	};
	if (params.scopedSetupOnlyChannelPluginRequested && params.requireSetupEntryForSetupOnlyChannelPlugins) return null;
	if (!params.enableStateEnabled) return null;
	if (params.shouldLoadModules && !params.validateOnly && shouldLoadChannelPluginInSetupRuntime({
		manifestChannels: params.manifestRecord.channels,
		setupSource: params.manifestRecord.setupSource,
		startupDeferConfiguredChannelFullLoadUntilAfterListen: params.manifestRecord.startupDeferConfiguredChannelFullLoadUntilAfterListen,
		cfg: params.cfg,
		env: params.env,
		preferSetupRuntimeForChannelPlugins: params.preferSetupRuntimeForChannelPlugins
	})) return {
		mode: "setup-runtime",
		loadSetupEntry: true,
		loadSetupRuntimeEntry: true,
		runRuntimeCapabilityPolicy: false,
		runFullActivationOnlyRegistrations: false
	};
	const mode = params.shouldActivate ? "full" : "discovery";
	return {
		mode,
		loadSetupEntry: false,
		loadSetupRuntimeEntry: false,
		runRuntimeCapabilityPolicy: true,
		runFullActivationOnlyRegistrations: mode === "full"
	};
}
function resolvePluginLoadCacheContext(options = {}) {
	const env = options.env ?? process.env;
	const cfg = applyTestPluginDefaults(options.config ?? {}, env);
	const activationSourceConfig = resolvePluginActivationSourceConfig({
		config: options.config,
		activationSourceConfig: options.activationSourceConfig
	});
	const normalized = normalizePluginsConfig(cfg.plugins);
	const activationSource = createPluginActivationSource({ config: activationSourceConfig });
	const trustNormalized = mergeTrustPluginConfigFromActivationSource({
		normalized,
		activationSource
	});
	const onlyPluginIds = normalizePluginIdScope(options.onlyPluginIds);
	const includeSetupOnlyChannelPlugins = options.includeSetupOnlyChannelPlugins === true;
	const forceSetupOnlyChannelPlugins = options.forceSetupOnlyChannelPlugins === true;
	const requireSetupEntryForSetupOnlyChannelPlugins = options.requireSetupEntryForSetupOnlyChannelPlugins === true;
	const preferSetupRuntimeForChannelPlugins = options.preferSetupRuntimeForChannelPlugins === true;
	const shouldInstallBundledRuntimeDeps = options.installBundledRuntimeDeps !== false;
	const runtimeSubagentMode = resolveRuntimeSubagentMode(options.runtimeOptions);
	const coreGatewayMethodNames = Array.from(new Set([...options.coreGatewayMethodNames ?? [], ...Object.keys(options.coreGatewayHandlers ?? {})])).toSorted();
	const installRecords = {
		...loadInstalledPluginIndexInstallRecordsSync({ env }),
		...cfg.plugins?.installs
	};
	const cacheKey = buildCacheKey({
		workspaceDir: options.workspaceDir,
		plugins: trustNormalized,
		activationMetadataKey: buildActivationMetadataHash({
			activationSource,
			autoEnabledReasons: options.autoEnabledReasons ?? {}
		}),
		installs: installRecords,
		env,
		onlyPluginIds,
		includeSetupOnlyChannelPlugins,
		forceSetupOnlyChannelPlugins,
		requireSetupEntryForSetupOnlyChannelPlugins,
		preferSetupRuntimeForChannelPlugins,
		loadModules: options.loadModules,
		installBundledRuntimeDeps: options.installBundledRuntimeDeps,
		runtimeSubagentMode,
		pluginSdkResolution: options.pluginSdkResolution,
		coreGatewayMethodNames,
		activate: options.activate
	});
	return {
		env,
		cfg,
		normalized: trustNormalized,
		activationSourceConfig,
		activationSource,
		autoEnabledReasons: options.autoEnabledReasons ?? {},
		onlyPluginIds,
		includeSetupOnlyChannelPlugins,
		forceSetupOnlyChannelPlugins,
		requireSetupEntryForSetupOnlyChannelPlugins,
		preferSetupRuntimeForChannelPlugins,
		shouldActivate: options.activate !== false,
		shouldLoadModules: options.loadModules !== false,
		shouldInstallBundledRuntimeDeps,
		runtimeSubagentMode,
		installRecords,
		cacheKey
	};
}
function mergeTrustPluginConfigFromActivationSource(params) {
	const source = params.activationSource.plugins;
	const allow = mergePluginTrustList(params.normalized.allow, source.allow);
	const deny = mergePluginTrustList(params.normalized.deny, source.deny);
	const loadPaths = mergePluginTrustList(params.normalized.loadPaths, source.loadPaths);
	if (allow === params.normalized.allow && deny === params.normalized.deny && loadPaths === params.normalized.loadPaths) return params.normalized;
	return {
		...params.normalized,
		allow,
		deny,
		loadPaths
	};
}
function mergePluginTrustList(runtimeList, sourceList) {
	if (sourceList.length === 0) return runtimeList;
	const merged = [...runtimeList];
	const seen = new Set(merged);
	for (const entry of sourceList) if (!seen.has(entry)) {
		merged.push(entry);
		seen.add(entry);
	}
	return merged.length === runtimeList.length ? runtimeList : merged;
}
function getCompatibleActivePluginRegistry(options = {}) {
	const activeRegistry = getActivePluginRegistry() ?? void 0;
	if (!activeRegistry) return;
	if (!hasExplicitCompatibilityInputs(options)) return activeRegistry;
	const activeCacheKey = getActivePluginRegistryKey();
	if (!activeCacheKey) return;
	const loadContext = resolvePluginLoadCacheContext(options);
	if (loadContext.cacheKey === activeCacheKey) return activeRegistry;
	if (!loadContext.shouldActivate) {
		if (resolvePluginLoadCacheContext({
			...options,
			activate: true
		}).cacheKey === activeCacheKey) return activeRegistry;
	}
	if (loadContext.runtimeSubagentMode === "default" && getActivePluginRuntimeSubagentMode() === "gateway-bindable") {
		if (resolvePluginLoadCacheContext({
			...options,
			runtimeOptions: {
				...options.runtimeOptions,
				allowGatewaySubagentBinding: true
			}
		}).cacheKey === activeCacheKey) return activeRegistry;
		if (!loadContext.shouldActivate) {
			if (resolvePluginLoadCacheContext({
				...options,
				activate: true,
				runtimeOptions: {
					...options.runtimeOptions,
					allowGatewaySubagentBinding: true
				}
			}).cacheKey === activeCacheKey) return activeRegistry;
		}
	}
}
function resolveRuntimePluginRegistry(options) {
	if (!options || !hasExplicitCompatibilityInputs(options)) return getCompatibleActivePluginRegistry();
	const compatible = getCompatibleActivePluginRegistry(options);
	if (compatible) return compatible;
	if (isPluginRegistryLoadInFlight(options)) return;
	return loadOpenClawPlugins(options);
}
function resolvePluginRegistryLoadCacheKey(options = {}) {
	return resolvePluginLoadCacheContext(options).cacheKey;
}
function isPluginRegistryLoadInFlight(options = {}) {
	return pluginLoaderCacheState.isLoadInFlight(resolvePluginRegistryLoadCacheKey(options));
}
function resolveCompatibleRuntimePluginRegistry(options) {
	return getCompatibleActivePluginRegistry(options);
}
function validatePluginConfig(params) {
	const schema = params.schema;
	if (!schema) return {
		ok: true,
		value: params.value
	};
	const result = validateJsonSchemaValue({
		schema,
		cacheKey: params.cacheKey ?? JSON.stringify(schema),
		value: params.value ?? {},
		applyDefaults: true
	});
	if (result.ok) return {
		ok: true,
		value: result.value
	};
	return {
		ok: false,
		errors: result.errors.map((error) => error.text)
	};
}
function resolvePluginModuleExport(moduleExport) {
	const seen = /* @__PURE__ */ new Set();
	const candidates = [unwrapDefaultModuleExport(moduleExport), moduleExport];
	for (let index = 0; index < candidates.length && index < 12; index += 1) {
		const resolved = candidates[index];
		if (seen.has(resolved)) continue;
		seen.add(resolved);
		if (typeof resolved === "function") return { register: resolved };
		if (resolved && typeof resolved === "object") {
			const def = resolved;
			const register = def.register ?? def.activate;
			if (typeof register === "function") return {
				definition: def,
				register
			};
			for (const key of ["default", "module"]) if (key in def) candidates.push(def[key]);
		}
	}
	const resolved = candidates[0];
	if (typeof resolved === "function") return { register: resolved };
	if (resolved && typeof resolved === "object") {
		const def = resolved;
		return {
			definition: def,
			register: def.register ?? def.activate
		};
	}
	return {};
}
function isPluginLoadDebugEnabled(env) {
	const normalized = normalizeLowercaseStringOrEmpty(env.OPENCLAW_PLUGIN_LOAD_DEBUG);
	return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}
function describePluginModuleExportShape(value, label = "export", seen = /* @__PURE__ */ new Set()) {
	if (value === null) return [`${label}:null`];
	if (typeof value !== "object") return [`${label}:${typeof value}`];
	if (seen.has(value)) return [`${label}:circular`];
	seen.add(value);
	const record = value;
	const keys = Object.keys(record).toSorted();
	const visibleKeys = keys.slice(0, 8);
	const extraCount = keys.length - visibleKeys.length;
	const details = [`${label}:object keys=${visibleKeys.length > 0 ? `${visibleKeys.join(",")}${extraCount > 0 ? `,+${extraCount}` : ""}` : "none"}`];
	for (const key of [
		"default",
		"module",
		"register",
		"activate"
	]) if (Object.prototype.hasOwnProperty.call(record, key)) details.push(...describePluginModuleExportShape(record[key], `${label}.${key}`, seen));
	return details;
}
function formatMissingPluginRegisterError(moduleExport, env) {
	const message = "plugin export missing register/activate";
	if (!isPluginLoadDebugEnabled(env)) return message;
	return `${message} (module shape: ${describePluginModuleExportShape(moduleExport).join("; ")})`;
}
function mergeChannelPluginSection(baseValue, overrideValue) {
	if (baseValue && overrideValue && typeof baseValue === "object" && typeof overrideValue === "object") {
		const merged = { ...baseValue };
		for (const [key, value] of Object.entries(overrideValue)) if (value !== void 0) merged[key] = value;
		return { ...merged };
	}
	return overrideValue ?? baseValue;
}
function mergeSetupRuntimeChannelPlugin(runtimePlugin, setupPlugin) {
	return {
		...runtimePlugin,
		...setupPlugin,
		meta: mergeChannelPluginSection(runtimePlugin.meta, setupPlugin.meta),
		capabilities: mergeChannelPluginSection(runtimePlugin.capabilities, setupPlugin.capabilities),
		commands: mergeChannelPluginSection(runtimePlugin.commands, setupPlugin.commands),
		doctor: mergeChannelPluginSection(runtimePlugin.doctor, setupPlugin.doctor),
		reload: mergeChannelPluginSection(runtimePlugin.reload, setupPlugin.reload),
		config: mergeChannelPluginSection(runtimePlugin.config, setupPlugin.config),
		setup: mergeChannelPluginSection(runtimePlugin.setup, setupPlugin.setup),
		messaging: mergeChannelPluginSection(runtimePlugin.messaging, setupPlugin.messaging),
		actions: mergeChannelPluginSection(runtimePlugin.actions, setupPlugin.actions),
		secrets: mergeChannelPluginSection(runtimePlugin.secrets, setupPlugin.secrets)
	};
}
function resolveBundledRuntimeChannelRegistration(moduleExport) {
	const resolved = unwrapDefaultModuleExport(moduleExport);
	if (!resolved || typeof resolved !== "object") return {};
	const entryRecord = resolved;
	if (entryRecord.kind !== "bundled-channel-entry" || typeof entryRecord.id !== "string" || typeof entryRecord.loadChannelPlugin !== "function") return {};
	return {
		id: entryRecord.id,
		loadChannelPlugin: entryRecord.loadChannelPlugin,
		...typeof entryRecord.loadChannelSecrets === "function" ? { loadChannelSecrets: entryRecord.loadChannelSecrets } : {},
		...typeof entryRecord.setChannelRuntime === "function" ? { setChannelRuntime: entryRecord.setChannelRuntime } : {}
	};
}
function loadBundledRuntimeChannelPlugin(params) {
	if (typeof params.registration.loadChannelPlugin !== "function") return {};
	try {
		const loadedPlugin = params.registration.loadChannelPlugin();
		const loadedSecrets = params.registration.loadChannelSecrets?.();
		if (!loadedPlugin || typeof loadedPlugin !== "object") return {};
		const mergedSecrets = mergeChannelPluginSection(loadedPlugin.secrets, loadedSecrets);
		return { plugin: {
			...loadedPlugin,
			...mergedSecrets !== void 0 ? { secrets: mergedSecrets } : {}
		} };
	} catch (err) {
		return { loadError: err };
	}
}
function resolveSetupChannelRegistration(moduleExport, params = {}) {
	const resolved = unwrapDefaultModuleExport(moduleExport);
	if (!resolved || typeof resolved !== "object") return {};
	const setupEntryRecord = resolved;
	if (setupEntryRecord.kind === "bundled-channel-setup-entry" && typeof setupEntryRecord.loadSetupPlugin === "function") try {
		const setupLoadOptions = params.installRuntimeDeps === false ? { installRuntimeDeps: false } : void 0;
		const loadedPlugin = setupEntryRecord.loadSetupPlugin(setupLoadOptions);
		const loadedSecrets = typeof setupEntryRecord.loadSetupSecrets === "function" ? setupEntryRecord.loadSetupSecrets(setupLoadOptions) : void 0;
		if (loadedPlugin && typeof loadedPlugin === "object") {
			const mergedSecrets = mergeChannelPluginSection(loadedPlugin.secrets, loadedSecrets);
			return {
				plugin: {
					...loadedPlugin,
					...mergedSecrets !== void 0 ? { secrets: mergedSecrets } : {}
				},
				usesBundledSetupContract: true,
				...typeof setupEntryRecord.setChannelRuntime === "function" ? { setChannelRuntime: setupEntryRecord.setChannelRuntime } : {}
			};
		}
	} catch (err) {
		return { loadError: err };
	}
	const setup = resolved;
	if (!setup.plugin || typeof setup.plugin !== "object") return {};
	return { plugin: setup.plugin };
}
function shouldLoadChannelPluginInSetupRuntime(params) {
	if (!params.setupSource || params.manifestChannels.length === 0) return false;
	if (params.preferSetupRuntimeForChannelPlugins && params.startupDeferConfiguredChannelFullLoadUntilAfterListen === true) return true;
	return !params.manifestChannels.some((channelId) => isChannelConfigured(params.cfg, channelId, params.env));
}
function channelPluginIdBelongsToManifest(params) {
	if (!params.channelId) return true;
	return params.channelId === params.pluginId || params.manifestChannels.includes(params.channelId);
}
function createPluginRecord(params) {
	return {
		id: params.id,
		name: params.name ?? params.id,
		description: params.description,
		version: params.version,
		format: params.format ?? "openclaw",
		bundleFormat: params.bundleFormat,
		bundleCapabilities: params.bundleCapabilities,
		source: params.source,
		rootDir: params.rootDir,
		origin: params.origin,
		workspaceDir: params.workspaceDir,
		enabled: params.enabled,
		explicitlyEnabled: params.activationState?.explicitlyEnabled,
		activated: params.activationState?.activated,
		activationSource: params.activationState?.source,
		activationReason: params.activationState?.reason,
		status: params.enabled ? "loaded" : "disabled",
		toolNames: [],
		hookNames: [],
		channelIds: [],
		cliBackendIds: [],
		providerIds: [],
		speechProviderIds: [],
		realtimeTranscriptionProviderIds: [],
		realtimeVoiceProviderIds: [],
		mediaUnderstandingProviderIds: [],
		imageGenerationProviderIds: [],
		videoGenerationProviderIds: [],
		musicGenerationProviderIds: [],
		webFetchProviderIds: [],
		webSearchProviderIds: [],
		migrationProviderIds: [],
		contextEngineIds: [],
		memoryEmbeddingProviderIds: [],
		agentHarnessIds: [],
		gatewayMethods: [],
		cliCommands: [],
		services: [],
		gatewayDiscoveryServiceIds: [],
		commands: [],
		httpRoutes: 0,
		hookCount: 0,
		configSchema: params.configSchema,
		configUiHints: void 0,
		configJsonSchema: void 0,
		contracts: params.contracts
	};
}
function markPluginActivationDisabled(record, reason) {
	record.activated = false;
	record.activationSource = "disabled";
	record.activationReason = reason;
}
function formatAutoEnabledActivationReason(reasons) {
	if (!reasons || reasons.length === 0) return;
	return reasons.join("; ");
}
function recordPluginError(params) {
	const errorText = process.env.OPENCLAW_PLUGIN_LOADER_DEBUG_STACKS === "1" && params.error instanceof Error && typeof params.error.stack === "string" ? params.error.stack : String(params.error);
	const deprecatedApiHint = errorText.includes("api.registerHttpHandler") && errorText.includes("is not a function") ? "deprecated api.registerHttpHandler(...) was removed; use api.registerHttpRoute(...) for plugin-owned routes or registerPluginHttpRoute(...) for dynamic lifecycle routes" : null;
	const displayError = deprecatedApiHint ? `${deprecatedApiHint} (${errorText})` : errorText;
	params.logger.error(`${params.logPrefix}${displayError}`);
	params.record.status = "error";
	params.record.error = displayError;
	params.record.failedAt = /* @__PURE__ */ new Date();
	params.record.failurePhase = params.phase;
	params.registry.plugins.push(params.record);
	params.seenIds.set(params.pluginId, params.origin);
	params.registry.diagnostics.push({
		level: "error",
		pluginId: params.record.id,
		source: params.record.source,
		message: `${params.diagnosticMessagePrefix}${displayError}`
	});
}
function formatPluginFailureSummary(failedPlugins) {
	const grouped = /* @__PURE__ */ new Map();
	for (const plugin of failedPlugins) {
		const phase = plugin.failurePhase ?? "load";
		const ids = grouped.get(phase);
		if (ids) {
			ids.push(plugin.id);
			continue;
		}
		grouped.set(phase, [plugin.id]);
	}
	return [...grouped.entries()].map(([phase, ids]) => `${phase}: ${ids.join(", ")}`).join("; ");
}
function pushDiagnostics(diagnostics, append) {
	diagnostics.push(...append);
}
function maybeThrowOnPluginLoadError(registry, throwOnLoadError) {
	if (!throwOnLoadError) return;
	if (!registry.plugins.some((entry) => entry.status === "error")) return;
	throw new PluginLoadFailureError(registry);
}
function createPathMatcher() {
	return {
		exact: /* @__PURE__ */ new Set(),
		dirs: []
	};
}
function addPathToMatcher(matcher, rawPath, env = process.env) {
	const trimmed = rawPath.trim();
	if (!trimmed) return;
	const resolved = resolveUserPath(trimmed, env);
	if (!resolved) return;
	if (matcher.exact.has(resolved) || matcher.dirs.includes(resolved)) return;
	if (safeStatSync(resolved)?.isDirectory()) {
		matcher.dirs.push(resolved);
		return;
	}
	matcher.exact.add(resolved);
}
function matchesPathMatcher(matcher, sourcePath) {
	if (matcher.exact.has(sourcePath)) return true;
	return matcher.dirs.some((dirPath) => isPathInside(dirPath, sourcePath));
}
function buildProvenanceIndex(params) {
	const loadPathMatcher = createPathMatcher();
	for (const loadPath of params.normalizedLoadPaths) addPathToMatcher(loadPathMatcher, loadPath, params.env);
	const installRules = /* @__PURE__ */ new Map();
	const installs = loadInstalledPluginIndexInstallRecordsSync({ env: params.env });
	for (const [pluginId, install] of Object.entries(installs)) {
		const rule = {
			trackedWithoutPaths: false,
			matcher: createPathMatcher()
		};
		const trackedPaths = [install.installPath, install.sourcePath].map((entry) => normalizeOptionalString(entry)).filter((entry) => Boolean(entry));
		if (trackedPaths.length === 0) rule.trackedWithoutPaths = true;
		else for (const trackedPath of trackedPaths) addPathToMatcher(rule.matcher, trackedPath, params.env);
		installRules.set(pluginId, rule);
	}
	return {
		loadPathMatcher,
		installRules
	};
}
function isTrackedByProvenance(params) {
	const sourcePath = resolveUserPath(params.source, params.env);
	const installRule = params.index.installRules.get(params.pluginId);
	if (installRule) {
		if (installRule.trackedWithoutPaths) return true;
		if (matchesPathMatcher(installRule.matcher, sourcePath)) return true;
	}
	return matchesPathMatcher(params.index.loadPathMatcher, sourcePath);
}
function matchesExplicitInstallRule(params) {
	const sourcePath = resolveUserPath(params.source, params.env);
	const installRule = params.index.installRules.get(params.pluginId);
	if (!installRule || installRule.trackedWithoutPaths) return false;
	return matchesPathMatcher(installRule.matcher, sourcePath);
}
function resolveCandidateDuplicateRank(params) {
	const pluginId = params.manifestByRoot.get(params.candidate.rootDir)?.id;
	const isExplicitInstall = params.candidate.origin === "global" && pluginId !== void 0 && matchesExplicitInstallRule({
		pluginId,
		source: params.candidate.source,
		index: params.provenance,
		env: params.env
	});
	if (params.candidate.origin === "config") return 0;
	if (params.candidate.origin === "global" && isExplicitInstall) return 1;
	if (params.candidate.origin === "bundled") return 2;
	if (params.candidate.origin === "workspace") return 3;
	return 4;
}
function compareDuplicateCandidateOrder(params) {
	const leftPluginId = params.manifestByRoot.get(params.left.rootDir)?.id;
	const rightPluginId = params.manifestByRoot.get(params.right.rootDir)?.id;
	if (!leftPluginId || leftPluginId !== rightPluginId) return 0;
	return resolveCandidateDuplicateRank({
		candidate: params.left,
		manifestByRoot: params.manifestByRoot,
		provenance: params.provenance,
		env: params.env
	}) - resolveCandidateDuplicateRank({
		candidate: params.right,
		manifestByRoot: params.manifestByRoot,
		provenance: params.provenance,
		env: params.env
	});
}
function warnWhenAllowlistIsOpen(params) {
	if (!params.emitWarning) return;
	if (!params.pluginsEnabled) return;
	if (params.allow.length > 0) return;
	const autoDiscoverable = params.discoverablePlugins.filter((entry) => entry.origin === "workspace" || entry.origin === "global");
	if (autoDiscoverable.length === 0) return;
	if (pluginLoaderCacheState.hasOpenAllowlistWarning(params.warningCacheKey)) return;
	const preview = autoDiscoverable.slice(0, 6).map((entry) => `${entry.id} (${entry.source})`).join(", ");
	const extra = autoDiscoverable.length > 6 ? ` (+${autoDiscoverable.length - 6} more)` : "";
	pluginLoaderCacheState.recordOpenAllowlistWarning(params.warningCacheKey);
	params.logger.warn(`[plugins] plugins.allow is empty; discovered non-bundled plugins may auto-load: ${preview}${extra}. Set plugins.allow to explicit trusted ids.`);
}
function warnAboutUntrackedLoadedPlugins(params) {
	const allowSet = new Set(params.allowlist);
	for (const plugin of params.registry.plugins) {
		if (plugin.status !== "loaded" || plugin.origin === "bundled") continue;
		if (allowSet.has(plugin.id)) continue;
		if (isTrackedByProvenance({
			pluginId: plugin.id,
			source: plugin.source,
			index: params.provenance,
			env: params.env
		})) continue;
		const message = "loaded without install/load-path provenance; treat as untracked local code and pin trust via plugins.allow or install records";
		params.registry.diagnostics.push({
			level: "warn",
			pluginId: plugin.id,
			source: plugin.source,
			message
		});
		if (params.emitWarning) params.logger.warn(`[plugins] ${plugin.id}: ${message} (${plugin.source})`);
	}
}
function activatePluginRegistry(registry, cacheKey, runtimeSubagentMode, workspaceDir) {
	const preserveGatewayHookRunner = runtimeSubagentMode === "default" && getActivePluginRuntimeSubagentMode() === "gateway-bindable" && getGlobalHookRunner() !== null;
	setActivePluginRegistry(registry, cacheKey, runtimeSubagentMode, workspaceDir);
	if (!preserveGatewayHookRunner) initializeGlobalHookRunner(registry);
}
function loadOpenClawPlugins(options = {}) {
	const { env, cfg, normalized, activationSource, autoEnabledReasons, onlyPluginIds, includeSetupOnlyChannelPlugins, forceSetupOnlyChannelPlugins, requireSetupEntryForSetupOnlyChannelPlugins, preferSetupRuntimeForChannelPlugins, shouldActivate, shouldLoadModules, shouldInstallBundledRuntimeDeps, cacheKey, runtimeSubagentMode, installRecords } = resolvePluginLoadCacheContext(options);
	const logger = options.logger ?? defaultLogger();
	const validateOnly = options.mode === "validate";
	const onlyPluginIdSet = createPluginIdScopeSet(onlyPluginIds);
	const cacheEnabled = options.cache !== false;
	if (cacheEnabled) {
		const cached = getCachedPluginRegistry(cacheKey);
		if (cached) {
			if (shouldActivate) {
				restoreRegisteredAgentHarnesses(cached.agentHarnesses);
				restorePluginCommands(cached.commands ?? []);
				restoreRegisteredCompactionProviders(cached.compactionProviders);
				restoreDetachedTaskLifecycleRuntimeRegistration(cached.detachedTaskRuntimeRegistration);
				restorePluginInteractiveHandlers(cached.interactiveHandlers ?? []);
				restoreRegisteredMemoryEmbeddingProviders(cached.memoryEmbeddingProviders);
				restoreMemoryPluginState({
					capability: cached.memoryCapability,
					corpusSupplements: cached.memoryCorpusSupplements,
					promptBuilder: cached.memoryPromptBuilder,
					promptSupplements: cached.memoryPromptSupplements,
					flushPlanResolver: cached.memoryFlushPlanResolver,
					runtime: cached.memoryRuntime
				});
				activatePluginRegistry(cached.registry, cacheKey, runtimeSubagentMode, options.workspaceDir);
			}
			return cached.registry;
		}
	}
	pluginLoaderCacheState.beginLoad(cacheKey);
	try {
		if (shouldActivate) {
			clearAgentHarnesses();
			clearPluginCommands();
			clearPluginInteractiveHandlers();
			clearDetachedTaskLifecycleRuntimeRegistration();
			clearMemoryPluginState();
		}
		const getJiti = createPluginJitiLoader(options);
		let createPluginRuntimeFactory = null;
		const resolveCreatePluginRuntime = () => {
			if (createPluginRuntimeFactory) return createPluginRuntimeFactory;
			const runtimeModulePath = resolvePluginRuntimeModulePath({ pluginSdkResolution: options.pluginSdkResolution });
			if (!runtimeModulePath) throw new Error("Unable to resolve plugin runtime module");
			const safeRuntimePath = toSafeImportPath(runtimeModulePath);
			const runtimeModule = withProfile({ source: runtimeModulePath }, "runtime-module", () => getJiti(runtimeModulePath)(safeRuntimePath));
			if (typeof runtimeModule.createPluginRuntime !== "function") throw new Error("Plugin runtime module missing createPluginRuntime export");
			createPluginRuntimeFactory = runtimeModule.createPluginRuntime;
			return createPluginRuntimeFactory;
		};
		let resolvedRuntime = null;
		const resolveRuntime = () => {
			resolvedRuntime ??= resolveCreatePluginRuntime()(options.runtimeOptions);
			return resolvedRuntime;
		};
		const lazyRuntimeReflectionKeySet = new Set(LAZY_RUNTIME_REFLECTION_KEYS);
		const resolveLazyRuntimeDescriptor = (prop) => {
			if (!lazyRuntimeReflectionKeySet.has(prop)) return Reflect.getOwnPropertyDescriptor(resolveRuntime(), prop);
			return {
				configurable: true,
				enumerable: true,
				get() {
					return Reflect.get(resolveRuntime(), prop);
				},
				set(value) {
					Reflect.set(resolveRuntime(), prop, value);
				}
			};
		};
		const { registry, createApi, rollbackPluginGlobalSideEffects, registerReload, registerNodeHostCommand, registerSecurityAuditCollector } = createPluginRegistry({
			logger,
			runtime: new Proxy({}, {
				get(_target, prop, receiver) {
					return Reflect.get(resolveRuntime(), prop, receiver);
				},
				set(_target, prop, value, receiver) {
					return Reflect.set(resolveRuntime(), prop, value, receiver);
				},
				has(_target, prop) {
					return lazyRuntimeReflectionKeySet.has(prop) || Reflect.has(resolveRuntime(), prop);
				},
				ownKeys() {
					return [...LAZY_RUNTIME_REFLECTION_KEYS];
				},
				getOwnPropertyDescriptor(_target, prop) {
					return resolveLazyRuntimeDescriptor(prop);
				},
				defineProperty(_target, prop, attributes) {
					return Reflect.defineProperty(resolveRuntime(), prop, attributes);
				},
				deleteProperty(_target, prop) {
					return Reflect.deleteProperty(resolveRuntime(), prop);
				},
				getPrototypeOf() {
					return Reflect.getPrototypeOf(resolveRuntime());
				}
			}),
			coreGatewayHandlers: options.coreGatewayHandlers,
			...options.coreGatewayMethodNames !== void 0 && { coreGatewayMethodNames: options.coreGatewayMethodNames },
			activateGlobalSideEffects: shouldActivate
		});
		const discovery = discoverOpenClawPlugins({
			workspaceDir: options.workspaceDir,
			extraPaths: normalized.loadPaths,
			cache: options.cache,
			env
		});
		const manifestRegistry = loadPluginManifestRegistry({
			config: cfg,
			workspaceDir: options.workspaceDir,
			cache: options.cache,
			env,
			candidates: discovery.candidates,
			diagnostics: discovery.diagnostics,
			installRecords: Object.keys(installRecords).length > 0 ? installRecords : void 0
		});
		pushDiagnostics(registry.diagnostics, manifestRegistry.diagnostics);
		warnWhenAllowlistIsOpen({
			emitWarning: shouldActivate,
			logger,
			pluginsEnabled: normalized.enabled,
			allow: normalized.allow,
			warningCacheKey: cacheKey,
			discoverablePlugins: manifestRegistry.plugins.filter((plugin) => !onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)).map((plugin) => ({
				id: plugin.id,
				source: plugin.source,
				origin: plugin.origin
			}))
		});
		const provenance = buildProvenanceIndex({
			config: cfg,
			normalizedLoadPaths: normalized.loadPaths,
			env
		});
		const manifestByRoot = new Map(manifestRegistry.plugins.map((record) => [record.rootDir, record]));
		const orderedCandidates = [...discovery.candidates].toSorted((left, right) => {
			return compareDuplicateCandidateOrder({
				left,
				right,
				manifestByRoot,
				provenance,
				env
			});
		});
		const seenIds = /* @__PURE__ */ new Map();
		const bundledRuntimeDepsRetainSpecsByInstallRoot = /* @__PURE__ */ new Map();
		const memorySlot = normalized.slots.memory;
		let selectedMemoryPluginId = null;
		let memorySlotMatched = false;
		const dreamingEngineId = resolveDreamingSidecarEngineId({
			cfg,
			memorySlot
		});
		for (const candidate of orderedCandidates) {
			const manifestRecord = manifestByRoot.get(candidate.rootDir);
			if (!manifestRecord) continue;
			const pluginId = manifestRecord.id;
			if (!matchesScopedPluginRequest({
				onlyPluginIdSet,
				pluginId
			})) continue;
			const activationState = resolveEffectivePluginActivationState({
				id: pluginId,
				origin: candidate.origin,
				config: normalized,
				rootConfig: cfg,
				enabledByDefault: manifestRecord.enabledByDefault,
				activationSource,
				autoEnabledReason: formatAutoEnabledActivationReason(autoEnabledReasons[pluginId])
			});
			const existingOrigin = seenIds.get(pluginId);
			if (existingOrigin) {
				const record = createPluginRecord({
					id: pluginId,
					name: manifestRecord.name ?? pluginId,
					description: manifestRecord.description,
					version: manifestRecord.version,
					format: manifestRecord.format,
					bundleFormat: manifestRecord.bundleFormat,
					bundleCapabilities: manifestRecord.bundleCapabilities,
					source: candidate.source,
					rootDir: candidate.rootDir,
					origin: candidate.origin,
					workspaceDir: candidate.workspaceDir,
					enabled: false,
					activationState,
					configSchema: Boolean(manifestRecord.configSchema),
					contracts: manifestRecord.contracts
				});
				record.status = "disabled";
				record.error = `overridden by ${existingOrigin} plugin`;
				markPluginActivationDisabled(record, record.error);
				registry.plugins.push(record);
				continue;
			}
			const enableState = resolveEffectiveEnableState({
				id: pluginId,
				origin: candidate.origin,
				config: normalized,
				rootConfig: cfg,
				enabledByDefault: manifestRecord.enabledByDefault,
				activationSource
			});
			const entry = normalized.entries[pluginId];
			const record = createPluginRecord({
				id: pluginId,
				name: manifestRecord.name ?? pluginId,
				description: manifestRecord.description,
				version: manifestRecord.version,
				format: manifestRecord.format,
				bundleFormat: manifestRecord.bundleFormat,
				bundleCapabilities: manifestRecord.bundleCapabilities,
				source: candidate.source,
				rootDir: candidate.rootDir,
				origin: candidate.origin,
				workspaceDir: candidate.workspaceDir,
				enabled: enableState.enabled,
				activationState,
				configSchema: Boolean(manifestRecord.configSchema),
				contracts: manifestRecord.contracts
			});
			record.kind = manifestRecord.kind;
			record.configUiHints = manifestRecord.configUiHints;
			record.configJsonSchema = manifestRecord.configSchema;
			const pushPluginLoadError = (message) => {
				record.status = "error";
				record.error = message;
				record.failedAt = /* @__PURE__ */ new Date();
				record.failurePhase = "validation";
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
				registry.diagnostics.push({
					level: "error",
					pluginId: record.id,
					source: record.source,
					message: record.error
				});
			};
			const pluginRoot = safeRealpathOrResolve(candidate.rootDir);
			let runtimePluginRoot = pluginRoot;
			let runtimeCandidateSource = candidate.origin === "bundled" ? safeRealpathOrResolve(candidate.source) : candidate.source;
			let runtimeSetupSource = candidate.origin === "bundled" && manifestRecord.setupSource ? safeRealpathOrResolve(manifestRecord.setupSource) : manifestRecord.setupSource;
			const scopedSetupOnlyChannelPluginRequested = includeSetupOnlyChannelPlugins && !validateOnly && Boolean(onlyPluginIdSet) && manifestRecord.channels.length > 0 && (!enableState.enabled || forceSetupOnlyChannelPlugins);
			const registrationPlan = resolvePluginRegistrationPlan({
				canLoadScopedSetupOnlyChannelPlugin: scopedSetupOnlyChannelPluginRequested && (!requireSetupEntryForSetupOnlyChannelPlugins || Boolean(manifestRecord.setupSource)),
				scopedSetupOnlyChannelPluginRequested,
				requireSetupEntryForSetupOnlyChannelPlugins,
				enableStateEnabled: enableState.enabled,
				shouldLoadModules,
				validateOnly,
				shouldActivate,
				manifestRecord,
				cfg,
				env,
				preferSetupRuntimeForChannelPlugins
			});
			if (!registrationPlan) {
				record.status = "disabled";
				record.error = enableState.reason;
				markPluginActivationDisabled(record, enableState.reason);
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
				continue;
			}
			const registrationMode = registrationPlan.mode;
			if (!enableState.enabled) {
				record.status = "disabled";
				record.error = enableState.reason;
				markPluginActivationDisabled(record, enableState.reason);
			}
			if (shouldLoadModules && shouldInstallBundledRuntimeDeps && candidate.origin === "bundled" && enableState.enabled) {
				let runtimeDepsInstallStartedAt = null;
				let runtimeDepsInstallSpecs = [];
				try {
					const installRootPlan = resolveBundledRuntimeDependencyInstallRootPlan(pluginRoot, { env });
					const installRoot = installRootPlan.installRoot;
					const retainSpecs = bundledRuntimeDepsRetainSpecsByInstallRoot.get(installRoot) ?? [];
					const depsInstallResult = ensureBundledPluginRuntimeDeps({
						pluginId: record.id,
						pluginRoot,
						env,
						config: cfg,
						retainSpecs,
						installDeps: (installParams) => {
							const installSpecs = installParams.installSpecs ?? installParams.missingSpecs;
							runtimeDepsInstallStartedAt = Date.now();
							runtimeDepsInstallSpecs = installParams.missingSpecs;
							if (shouldActivate) logger.info(`[plugins] ${record.id} staging bundled runtime deps (${installParams.missingSpecs.length} missing, ${installSpecs.length} install specs): ${installParams.missingSpecs.join(", ")}`);
							(options.bundledRuntimeDepsInstaller ?? ((params) => installBundledRuntimeDeps({
								installRoot: params.installRoot,
								installExecutionRoot: params.installExecutionRoot,
								missingSpecs: params.installSpecs ?? params.missingSpecs,
								env,
								warn: (message) => logger.warn(`[plugins] ${record.id}: ${message}`)
							})))(installParams);
						}
					});
					if (depsInstallResult.installedSpecs.length > 0) {
						bundledRuntimeDepsRetainSpecsByInstallRoot.set(installRoot, [...new Set([...retainSpecs, ...depsInstallResult.retainSpecs])].toSorted((left, right) => left.localeCompare(right)));
						if (shouldActivate) {
							const elapsed = runtimeDepsInstallStartedAt === null ? "" : ` in ${Date.now() - runtimeDepsInstallStartedAt}ms`;
							logger.info(`[plugins] ${record.id} installed bundled runtime deps${elapsed}: ${depsInstallResult.installedSpecs.join(", ")}`);
						}
					}
					if (path.resolve(installRoot) !== path.resolve(pluginRoot)) {
						const packageRoot = resolveBundledRuntimeDependencyPackageRoot(pluginRoot);
						if (packageRoot) {
							registerBundledRuntimeDependencyNodePath(packageRoot);
							registerBundledRuntimeDependencyJitiAliases(packageRoot);
						}
						for (const searchRoot of installRootPlan.searchRoots) {
							registerBundledRuntimeDependencyNodePath(searchRoot);
							registerBundledRuntimeDependencyJitiAliases(searchRoot);
						}
						runtimePluginRoot = mirrorBundledPluginRuntimeRoot({
							pluginId: record.id,
							pluginRoot,
							installRoot
						});
						runtimeCandidateSource = remapBundledPluginRuntimePath({
							source: runtimeCandidateSource,
							pluginRoot,
							mirroredRoot: runtimePluginRoot
						}) ?? runtimeCandidateSource;
						runtimeSetupSource = remapBundledPluginRuntimePath({
							source: runtimeSetupSource,
							pluginRoot,
							mirroredRoot: runtimePluginRoot
						});
					} else ensureOpenClawPluginSdkAlias(path.dirname(path.dirname(pluginRoot)));
				} catch (error) {
					if (shouldActivate && runtimeDepsInstallStartedAt !== null) logger.error(`[plugins] ${record.id} failed to stage bundled runtime deps after ${Date.now() - runtimeDepsInstallStartedAt}ms: ${runtimeDepsInstallSpecs.join(", ")}`);
					pushPluginLoadError(`failed to install bundled runtime deps: ${String(error)}`);
					continue;
				}
			}
			if (record.format === "bundle") {
				const unsupportedCapabilities = (record.bundleCapabilities ?? []).filter((capability) => capability !== "skills" && capability !== "mcpServers" && capability !== "settings" && !((capability === "commands" || capability === "agents" || capability === "outputStyles" || capability === "lspServers") && (record.bundleFormat === "claude" || record.bundleFormat === "cursor")) && !(capability === "hooks" && (record.bundleFormat === "codex" || record.bundleFormat === "claude")));
				for (const capability of unsupportedCapabilities) registry.diagnostics.push({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: `bundle capability detected but not wired into OpenClaw yet: ${capability}`
				});
				if (enableState.enabled && record.rootDir && record.bundleFormat && (record.bundleCapabilities ?? []).includes("mcpServers")) {
					const runtimeSupport = inspectBundleMcpRuntimeSupport({
						pluginId: record.id,
						rootDir: record.rootDir,
						bundleFormat: record.bundleFormat
					});
					for (const message of runtimeSupport.diagnostics) registry.diagnostics.push({
						level: "warn",
						pluginId: record.id,
						source: record.source,
						message
					});
					if (runtimeSupport.unsupportedServerNames.length > 0) registry.diagnostics.push({
						level: "warn",
						pluginId: record.id,
						source: record.source,
						message: `bundle MCP servers use unsupported transports or incomplete configs (stdio only today): ${runtimeSupport.unsupportedServerNames.join(", ")}`
					});
				}
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
				continue;
			}
			if (registrationPlan.runRuntimeCapabilityPolicy && candidate.origin === "bundled" && hasKind(manifestRecord.kind, "memory")) {
				if (pluginId !== dreamingEngineId) {
					const earlyMemoryDecision = resolveMemorySlotDecision({
						id: record.id,
						kind: manifestRecord.kind,
						slot: memorySlot,
						selectedId: selectedMemoryPluginId
					});
					if (!earlyMemoryDecision.enabled) {
						record.enabled = false;
						record.status = "disabled";
						record.error = earlyMemoryDecision.reason;
						markPluginActivationDisabled(record, earlyMemoryDecision.reason);
						registry.plugins.push(record);
						seenIds.set(pluginId, candidate.origin);
						continue;
					}
				}
			}
			if (!manifestRecord.configSchema) {
				pushPluginLoadError("missing config schema");
				continue;
			}
			if (!shouldLoadModules && registrationPlan.runRuntimeCapabilityPolicy) {
				const memoryDecision = resolveMemorySlotDecision({
					id: record.id,
					kind: record.kind,
					slot: memorySlot,
					selectedId: selectedMemoryPluginId
				});
				if (!memoryDecision.enabled && pluginId !== dreamingEngineId) {
					record.enabled = false;
					record.status = "disabled";
					record.error = memoryDecision.reason;
					markPluginActivationDisabled(record, memoryDecision.reason);
					registry.plugins.push(record);
					seenIds.set(pluginId, candidate.origin);
					continue;
				}
				if (memoryDecision.selected && hasKind(record.kind, "memory")) {
					selectedMemoryPluginId = record.id;
					memorySlotMatched = true;
					record.memorySlotSelected = true;
				}
			}
			const validatedConfig = validatePluginConfig({
				schema: manifestRecord.configSchema,
				cacheKey: manifestRecord.schemaCacheKey,
				value: entry?.config
			});
			if (!validatedConfig.ok) {
				logger.error(`[plugins] ${record.id} invalid config: ${validatedConfig.errors?.join(", ")}`);
				pushPluginLoadError(`invalid config: ${validatedConfig.errors?.join(", ")}`);
				continue;
			}
			if (!shouldLoadModules) {
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
				continue;
			}
			const opened = openBoundaryFileSync({
				absolutePath: resolveCanonicalDistRuntimeSource(registrationPlan.loadSetupEntry && runtimeSetupSource ? runtimeSetupSource : runtimeCandidateSource),
				rootPath: resolveCanonicalDistRuntimeSource(runtimePluginRoot),
				boundaryLabel: "plugin root",
				rejectHardlinks: candidate.origin !== "bundled",
				skipLexicalRootCheck: true
			});
			if (!opened.ok) {
				pushPluginLoadError("plugin entry path escapes plugin root or fails alias checks");
				continue;
			}
			const safeSource = opened.path;
			fs.closeSync(opened.fd);
			const safeImportSource = toSafeImportPath(safeSource);
			let mod = null;
			try {
				recordImportedPluginId(record.id);
				mod = withProfile({
					pluginId: record.id,
					source: safeSource
				}, registrationMode, () => getJiti(safeSource)(safeImportSource));
			} catch (err) {
				recordPluginError({
					logger,
					registry,
					record,
					seenIds,
					pluginId,
					origin: candidate.origin,
					phase: "load",
					error: err,
					logPrefix: `[plugins] ${record.id} failed to load from ${record.source}: `,
					diagnosticMessagePrefix: "failed to load plugin: "
				});
				continue;
			}
			if (registrationPlan.loadSetupEntry && manifestRecord.setupSource) {
				const setupRegistration = resolveSetupChannelRegistration(mod, { installRuntimeDeps: shouldInstallBundledRuntimeDeps && (enableState.enabled || forceSetupOnlyChannelPlugins) });
				if (setupRegistration.loadError) {
					recordPluginError({
						logger,
						registry,
						record,
						seenIds,
						pluginId,
						origin: candidate.origin,
						phase: "load",
						error: setupRegistration.loadError,
						logPrefix: `[plugins] ${record.id} failed to load setup entry from ${record.source}: `,
						diagnosticMessagePrefix: "failed to load setup entry: "
					});
					continue;
				}
				if (setupRegistration.plugin) {
					if (!channelPluginIdBelongsToManifest({
						channelId: setupRegistration.plugin.id,
						pluginId: record.id,
						manifestChannels: manifestRecord.channels
					})) {
						pushPluginLoadError(`plugin id mismatch (config uses "${record.id}", setup export uses "${setupRegistration.plugin.id}")`);
						continue;
					}
					const api = createApi(record, {
						config: cfg,
						pluginConfig: {},
						hookPolicy: entry?.hooks,
						registrationMode
					});
					let mergedSetupRegistration = setupRegistration;
					let runtimeSetterApplied = false;
					if (registrationPlan.loadSetupRuntimeEntry && setupRegistration.usesBundledSetupContract && runtimeCandidateSource !== safeSource) {
						const runtimeOpened = openBoundaryFileSync({
							absolutePath: runtimeCandidateSource,
							rootPath: runtimePluginRoot,
							boundaryLabel: "plugin root",
							rejectHardlinks: candidate.origin !== "bundled",
							skipLexicalRootCheck: true
						});
						if (!runtimeOpened.ok) {
							pushPluginLoadError("plugin entry path escapes plugin root or fails alias checks");
							continue;
						}
						const safeRuntimeSource = runtimeOpened.path;
						fs.closeSync(runtimeOpened.fd);
						const safeRuntimeImportSource = toSafeImportPath(safeRuntimeSource);
						let runtimeMod = null;
						try {
							runtimeMod = withProfile({
								pluginId: record.id,
								source: safeRuntimeSource
							}, "load-setup-runtime-entry", () => getJiti(safeRuntimeSource)(safeRuntimeImportSource));
						} catch (err) {
							recordPluginError({
								logger,
								registry,
								record,
								seenIds,
								pluginId,
								origin: candidate.origin,
								phase: "load",
								error: err,
								logPrefix: `[plugins] ${record.id} failed to load setup-runtime entry from ${record.source}: `,
								diagnosticMessagePrefix: "failed to load setup-runtime entry: "
							});
							continue;
						}
						const runtimeRegistration = resolveBundledRuntimeChannelRegistration(runtimeMod);
						if (runtimeRegistration.id && runtimeRegistration.id !== record.id) {
							pushPluginLoadError(`plugin id mismatch (config uses "${record.id}", runtime entry uses "${runtimeRegistration.id}")`);
							continue;
						}
						if (runtimeRegistration.setChannelRuntime) try {
							runtimeRegistration.setChannelRuntime(api.runtime);
							runtimeSetterApplied = true;
						} catch (err) {
							recordPluginError({
								logger,
								registry,
								record,
								seenIds,
								pluginId,
								origin: candidate.origin,
								phase: "load",
								error: err,
								logPrefix: `[plugins] ${record.id} failed to apply setup-runtime channel runtime from ${record.source}: `,
								diagnosticMessagePrefix: "failed to apply setup-runtime channel runtime: "
							});
							continue;
						}
						const runtimePluginRegistration = loadBundledRuntimeChannelPlugin({ registration: runtimeRegistration });
						if (runtimePluginRegistration.loadError) {
							recordPluginError({
								logger,
								registry,
								record,
								seenIds,
								pluginId,
								origin: candidate.origin,
								phase: "load",
								error: runtimePluginRegistration.loadError,
								logPrefix: `[plugins] ${record.id} failed to load setup-runtime channel entry from ${record.source}: `,
								diagnosticMessagePrefix: "failed to load setup-runtime channel entry: "
							});
							continue;
						}
						if (runtimePluginRegistration.plugin) {
							if (runtimePluginRegistration.plugin.id && runtimePluginRegistration.plugin.id !== record.id) {
								pushPluginLoadError(`plugin id mismatch (config uses "${record.id}", runtime export uses "${runtimePluginRegistration.plugin.id}")`);
								continue;
							}
							mergedSetupRegistration = {
								...setupRegistration,
								plugin: mergeSetupRuntimeChannelPlugin(runtimePluginRegistration.plugin, setupRegistration.plugin),
								setChannelRuntime: runtimeRegistration.setChannelRuntime ?? setupRegistration.setChannelRuntime
							};
						}
					}
					const mergedSetupPlugin = mergedSetupRegistration.plugin;
					if (!mergedSetupPlugin) continue;
					if (!channelPluginIdBelongsToManifest({
						channelId: mergedSetupPlugin.id,
						pluginId: record.id,
						manifestChannels: manifestRecord.channels
					})) {
						pushPluginLoadError(`plugin id mismatch (config uses "${record.id}", setup export uses "${mergedSetupPlugin.id}")`);
						continue;
					}
					if (!runtimeSetterApplied) try {
						mergedSetupRegistration.setChannelRuntime?.(api.runtime);
					} catch (err) {
						recordPluginError({
							logger,
							registry,
							record,
							seenIds,
							pluginId,
							origin: candidate.origin,
							phase: "load",
							error: err,
							logPrefix: `[plugins] ${record.id} failed to apply setup channel runtime from ${record.source}: `,
							diagnosticMessagePrefix: "failed to apply setup channel runtime: "
						});
						continue;
					}
					api.registerChannel(mergedSetupPlugin);
					registry.plugins.push(record);
					seenIds.set(pluginId, candidate.origin);
					continue;
				}
			}
			const resolved = resolvePluginModuleExport(mod);
			const definition = resolved.definition;
			const register = resolved.register;
			if (definition?.id && definition.id !== record.id) {
				pushPluginLoadError(`plugin id mismatch (config uses "${record.id}", export uses "${definition.id}")`);
				continue;
			}
			record.name = definition?.name ?? record.name;
			record.description = definition?.description ?? record.description;
			record.version = definition?.version ?? record.version;
			const manifestKind = record.kind;
			const exportKind = definition?.kind;
			if (manifestKind && exportKind && !kindsEqual(manifestKind, exportKind)) registry.diagnostics.push({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: `plugin kind mismatch (manifest uses "${String(manifestKind)}", export uses "${String(exportKind)}")`
			});
			record.kind = definition?.kind ?? record.kind;
			if (hasKind(record.kind, "memory") && memorySlot === record.id) memorySlotMatched = true;
			if (registrationPlan.runRuntimeCapabilityPolicy) {
				if (pluginId !== dreamingEngineId) {
					const memoryDecision = resolveMemorySlotDecision({
						id: record.id,
						kind: record.kind,
						slot: memorySlot,
						selectedId: selectedMemoryPluginId
					});
					if (!memoryDecision.enabled) {
						record.enabled = false;
						record.status = "disabled";
						record.error = memoryDecision.reason;
						markPluginActivationDisabled(record, memoryDecision.reason);
						registry.plugins.push(record);
						seenIds.set(pluginId, candidate.origin);
						continue;
					}
					if (memoryDecision.selected && hasKind(record.kind, "memory")) {
						selectedMemoryPluginId = record.id;
						record.memorySlotSelected = true;
					}
				}
			}
			if (registrationPlan.runFullActivationOnlyRegistrations) {
				if (definition?.reload) registerReload(record, definition.reload);
				for (const nodeHostCommand of definition?.nodeHostCommands ?? []) registerNodeHostCommand(record, nodeHostCommand);
				for (const collector of definition?.securityAuditCollectors ?? []) registerSecurityAuditCollector(record, collector);
			}
			if (validateOnly) {
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
				continue;
			}
			if (typeof register !== "function") {
				logger.error(`[plugins] ${record.id} missing register/activate export`);
				pushPluginLoadError(formatMissingPluginRegisterError(mod, env));
				continue;
			}
			const api = createApi(record, {
				config: cfg,
				pluginConfig: validatedConfig.value,
				hookPolicy: entry?.hooks,
				registrationMode
			});
			const registrySnapshot = snapshotPluginRegistry(registry);
			const previousAgentHarnesses = listRegisteredAgentHarnesses();
			const previousCompactionProviders = listRegisteredCompactionProviders();
			const previousDetachedTaskRuntimeRegistration = getDetachedTaskLifecycleRuntimeRegistration();
			const previousMemoryCapability = getMemoryCapabilityRegistration();
			const previousMemoryEmbeddingProviders = listRegisteredMemoryEmbeddingProviders();
			const previousMemoryFlushPlanResolver = getMemoryFlushPlanResolver();
			const previousMemoryPromptBuilder = getMemoryPromptSectionBuilder();
			const previousMemoryCorpusSupplements = listMemoryCorpusSupplements();
			const previousMemoryPromptSupplements = listMemoryPromptSupplements();
			const previousMemoryRuntime = getMemoryRuntime();
			try {
				withProfile({
					pluginId: record.id,
					source: record.source
				}, `${registrationMode}:register`, () => runPluginRegisterSync(register, api));
				if (!shouldActivate) {
					restoreRegisteredAgentHarnesses(previousAgentHarnesses);
					restoreRegisteredCompactionProviders(previousCompactionProviders);
					restoreDetachedTaskLifecycleRuntimeRegistration(previousDetachedTaskRuntimeRegistration);
					restoreRegisteredMemoryEmbeddingProviders(previousMemoryEmbeddingProviders);
					restoreMemoryPluginState({
						capability: previousMemoryCapability,
						corpusSupplements: previousMemoryCorpusSupplements,
						promptBuilder: previousMemoryPromptBuilder,
						promptSupplements: previousMemoryPromptSupplements,
						flushPlanResolver: previousMemoryFlushPlanResolver,
						runtime: previousMemoryRuntime
					});
				}
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
			} catch (err) {
				rollbackPluginGlobalSideEffects(record.id);
				restorePluginRegistry(registry, registrySnapshot);
				restoreRegisteredAgentHarnesses(previousAgentHarnesses);
				restoreRegisteredCompactionProviders(previousCompactionProviders);
				restoreDetachedTaskLifecycleRuntimeRegistration(previousDetachedTaskRuntimeRegistration);
				restoreRegisteredMemoryEmbeddingProviders(previousMemoryEmbeddingProviders);
				restoreMemoryPluginState({
					capability: previousMemoryCapability,
					corpusSupplements: previousMemoryCorpusSupplements,
					promptBuilder: previousMemoryPromptBuilder,
					promptSupplements: previousMemoryPromptSupplements,
					flushPlanResolver: previousMemoryFlushPlanResolver,
					runtime: previousMemoryRuntime
				});
				recordPluginError({
					logger,
					registry,
					record,
					seenIds,
					pluginId,
					origin: candidate.origin,
					phase: "register",
					error: err,
					logPrefix: `[plugins] ${record.id} failed during register from ${record.source}: `,
					diagnosticMessagePrefix: "plugin failed during register: "
				});
			}
		}
		if (!onlyPluginIdSet && typeof memorySlot === "string" && !memorySlotMatched) registry.diagnostics.push({
			level: "warn",
			message: `memory slot plugin not found or not marked as memory: ${memorySlot}`
		});
		warnAboutUntrackedLoadedPlugins({
			registry,
			provenance,
			allowlist: normalized.allow,
			emitWarning: shouldActivate,
			logger,
			env
		});
		maybeThrowOnPluginLoadError(registry, options.throwOnLoadError);
		if (shouldActivate && options.mode !== "validate") {
			const failedPlugins = registry.plugins.filter((plugin) => plugin.failedAt != null);
			if (failedPlugins.length > 0) logger.warn(`[plugins] ${failedPlugins.length} plugin(s) failed to initialize (${formatPluginFailureSummary(failedPlugins)}). Run 'openclaw plugins list' for details.`);
		}
		if (cacheEnabled) setCachedPluginRegistry(cacheKey, {
			commands: listRegisteredPluginCommands(),
			detachedTaskRuntimeRegistration: getDetachedTaskLifecycleRuntimeRegistration(),
			interactiveHandlers: listPluginInteractiveHandlers(),
			memoryCapability: getMemoryCapabilityRegistration(),
			memoryCorpusSupplements: listMemoryCorpusSupplements(),
			registry,
			agentHarnesses: listRegisteredAgentHarnesses(),
			compactionProviders: listRegisteredCompactionProviders(),
			memoryEmbeddingProviders: listRegisteredMemoryEmbeddingProviders(),
			memoryFlushPlanResolver: getMemoryFlushPlanResolver(),
			memoryPromptBuilder: getMemoryPromptSectionBuilder(),
			memoryPromptSupplements: listMemoryPromptSupplements(),
			memoryRuntime: getMemoryRuntime()
		});
		if (shouldActivate) activatePluginRegistry(registry, cacheKey, runtimeSubagentMode, options.workspaceDir);
		return registry;
	} finally {
		pluginLoaderCacheState.finishLoad(cacheKey);
	}
}
async function loadOpenClawPluginCliRegistry(options = {}) {
	const { env, cfg, normalized, activationSource, autoEnabledReasons, onlyPluginIds, cacheKey, installRecords } = resolvePluginLoadCacheContext({
		...options,
		activate: false,
		cache: false
	});
	const logger = options.logger ?? defaultLogger();
	const onlyPluginIdSet = createPluginIdScopeSet(onlyPluginIds);
	const getJiti = createPluginJitiLoader(options);
	const { registry, registerCli } = createPluginRegistry({
		logger,
		runtime: {},
		coreGatewayHandlers: options.coreGatewayHandlers,
		...options.coreGatewayMethodNames !== void 0 && { coreGatewayMethodNames: options.coreGatewayMethodNames },
		activateGlobalSideEffects: false
	});
	const discovery = discoverOpenClawPlugins({
		workspaceDir: options.workspaceDir,
		extraPaths: normalized.loadPaths,
		cache: false,
		env
	});
	const manifestRegistry = loadPluginManifestRegistry({
		config: cfg,
		workspaceDir: options.workspaceDir,
		cache: false,
		env,
		candidates: discovery.candidates,
		diagnostics: discovery.diagnostics,
		installRecords: Object.keys(installRecords).length > 0 ? installRecords : void 0
	});
	pushDiagnostics(registry.diagnostics, manifestRegistry.diagnostics);
	warnWhenAllowlistIsOpen({
		emitWarning: false,
		logger,
		pluginsEnabled: normalized.enabled,
		allow: normalized.allow,
		warningCacheKey: `${cacheKey}::cli-metadata`,
		discoverablePlugins: manifestRegistry.plugins.filter((plugin) => !onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)).map((plugin) => ({
			id: plugin.id,
			source: plugin.source,
			origin: plugin.origin
		}))
	});
	const provenance = buildProvenanceIndex({
		config: cfg,
		normalizedLoadPaths: normalized.loadPaths,
		env
	});
	const manifestByRoot = new Map(manifestRegistry.plugins.map((record) => [record.rootDir, record]));
	const orderedCandidates = [...discovery.candidates].toSorted((left, right) => {
		return compareDuplicateCandidateOrder({
			left,
			right,
			manifestByRoot,
			provenance,
			env
		});
	});
	const seenIds = /* @__PURE__ */ new Map();
	const memorySlot = normalized.slots.memory;
	let selectedMemoryPluginId = null;
	const dreamingEngineId = resolveDreamingSidecarEngineId({
		cfg,
		memorySlot
	});
	for (const candidate of orderedCandidates) {
		const manifestRecord = manifestByRoot.get(candidate.rootDir);
		if (!manifestRecord) continue;
		const pluginId = manifestRecord.id;
		if (!matchesScopedPluginRequest({
			onlyPluginIdSet,
			pluginId
		})) continue;
		const activationState = resolveEffectivePluginActivationState({
			id: pluginId,
			origin: candidate.origin,
			config: normalized,
			rootConfig: cfg,
			enabledByDefault: manifestRecord.enabledByDefault,
			activationSource,
			autoEnabledReason: formatAutoEnabledActivationReason(autoEnabledReasons[pluginId])
		});
		const existingOrigin = seenIds.get(pluginId);
		if (existingOrigin) {
			const record = createPluginRecord({
				id: pluginId,
				name: manifestRecord.name ?? pluginId,
				description: manifestRecord.description,
				version: manifestRecord.version,
				format: manifestRecord.format,
				bundleFormat: manifestRecord.bundleFormat,
				bundleCapabilities: manifestRecord.bundleCapabilities,
				source: candidate.source,
				rootDir: candidate.rootDir,
				origin: candidate.origin,
				workspaceDir: candidate.workspaceDir,
				enabled: false,
				activationState,
				configSchema: Boolean(manifestRecord.configSchema),
				contracts: manifestRecord.contracts
			});
			record.status = "disabled";
			record.error = `overridden by ${existingOrigin} plugin`;
			markPluginActivationDisabled(record, record.error);
			registry.plugins.push(record);
			continue;
		}
		const enableState = resolveEffectiveEnableState({
			id: pluginId,
			origin: candidate.origin,
			config: normalized,
			rootConfig: cfg,
			enabledByDefault: manifestRecord.enabledByDefault,
			activationSource
		});
		const entry = normalized.entries[pluginId];
		const record = createPluginRecord({
			id: pluginId,
			name: manifestRecord.name ?? pluginId,
			description: manifestRecord.description,
			version: manifestRecord.version,
			format: manifestRecord.format,
			bundleFormat: manifestRecord.bundleFormat,
			bundleCapabilities: manifestRecord.bundleCapabilities,
			source: candidate.source,
			rootDir: candidate.rootDir,
			origin: candidate.origin,
			workspaceDir: candidate.workspaceDir,
			enabled: enableState.enabled,
			activationState,
			configSchema: Boolean(manifestRecord.configSchema),
			contracts: manifestRecord.contracts
		});
		record.kind = manifestRecord.kind;
		record.configUiHints = manifestRecord.configUiHints;
		record.configJsonSchema = manifestRecord.configSchema;
		const pushPluginLoadError = (message) => {
			record.status = "error";
			record.error = message;
			record.failedAt = /* @__PURE__ */ new Date();
			record.failurePhase = "validation";
			registry.plugins.push(record);
			seenIds.set(pluginId, candidate.origin);
			registry.diagnostics.push({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: record.error
			});
		};
		if (!enableState.enabled) {
			record.status = "disabled";
			record.error = enableState.reason;
			markPluginActivationDisabled(record, enableState.reason);
			registry.plugins.push(record);
			seenIds.set(pluginId, candidate.origin);
			continue;
		}
		if (record.format === "bundle") {
			registry.plugins.push(record);
			seenIds.set(pluginId, candidate.origin);
			continue;
		}
		if (!manifestRecord.configSchema) {
			pushPluginLoadError("missing config schema");
			continue;
		}
		const validatedConfig = validatePluginConfig({
			schema: manifestRecord.configSchema,
			cacheKey: manifestRecord.schemaCacheKey,
			value: entry?.config
		});
		if (!validatedConfig.ok) {
			logger.error(`[plugins] ${record.id} invalid config: ${validatedConfig.errors?.join(", ")}`);
			pushPluginLoadError(`invalid config: ${validatedConfig.errors?.join(", ")}`);
			continue;
		}
		const pluginRoot = safeRealpathOrResolve(candidate.rootDir);
		const cliMetadataSource = resolveCliMetadataEntrySource(candidate.rootDir);
		const sourceForCliMetadata = candidate.origin === "bundled" ? cliMetadataSource ? safeRealpathOrResolve(cliMetadataSource) : null : cliMetadataSource ?? candidate.source;
		if (!sourceForCliMetadata) {
			record.status = "loaded";
			registry.plugins.push(record);
			seenIds.set(pluginId, candidate.origin);
			continue;
		}
		const opened = openBoundaryFileSync({
			absolutePath: sourceForCliMetadata,
			rootPath: pluginRoot,
			boundaryLabel: "plugin root",
			rejectHardlinks: candidate.origin !== "bundled",
			skipLexicalRootCheck: true
		});
		if (!opened.ok) {
			pushPluginLoadError("plugin entry path escapes plugin root or fails alias checks");
			continue;
		}
		const safeSource = opened.path;
		fs.closeSync(opened.fd);
		const safeImportSource = toSafeImportPath(safeSource);
		let mod = null;
		try {
			mod = withProfile({
				pluginId: record.id,
				source: safeSource
			}, "cli-metadata", () => getJiti(safeSource)(safeImportSource));
		} catch (err) {
			recordPluginError({
				logger,
				registry,
				record,
				seenIds,
				pluginId,
				origin: candidate.origin,
				phase: "load",
				error: err,
				logPrefix: `[plugins] ${record.id} failed to load from ${record.source}: `,
				diagnosticMessagePrefix: "failed to load plugin: "
			});
			continue;
		}
		const resolved = resolvePluginModuleExport(mod);
		const definition = resolved.definition;
		const register = resolved.register;
		if (definition?.id && definition.id !== record.id) {
			pushPluginLoadError(`plugin id mismatch (config uses "${record.id}", export uses "${definition.id}")`);
			continue;
		}
		record.name = definition?.name ?? record.name;
		record.description = definition?.description ?? record.description;
		record.version = definition?.version ?? record.version;
		const manifestKind = record.kind;
		const exportKind = definition?.kind;
		if (manifestKind && exportKind && !kindsEqual(manifestKind, exportKind)) registry.diagnostics.push({
			level: "warn",
			pluginId: record.id,
			source: record.source,
			message: `plugin kind mismatch (manifest uses "${String(manifestKind)}", export uses "${String(exportKind)}")`
		});
		record.kind = definition?.kind ?? record.kind;
		if (pluginId !== dreamingEngineId) {
			const memoryDecision = resolveMemorySlotDecision({
				id: record.id,
				kind: record.kind,
				slot: memorySlot,
				selectedId: selectedMemoryPluginId
			});
			if (!memoryDecision.enabled) {
				record.enabled = false;
				record.status = "disabled";
				record.error = memoryDecision.reason;
				markPluginActivationDisabled(record, memoryDecision.reason);
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
				continue;
			}
			if (memoryDecision.selected && hasKind(record.kind, "memory")) {
				selectedMemoryPluginId = record.id;
				record.memorySlotSelected = true;
			}
		}
		if (typeof register !== "function") {
			logger.error(`[plugins] ${record.id} missing register/activate export`);
			pushPluginLoadError(formatMissingPluginRegisterError(mod, env));
			continue;
		}
		const api = buildPluginApi({
			id: record.id,
			name: record.name,
			version: record.version,
			description: record.description,
			source: record.source,
			rootDir: record.rootDir,
			registrationMode: "cli-metadata",
			config: cfg,
			pluginConfig: validatedConfig.value,
			runtime: {},
			logger,
			resolvePath: (input) => resolveUserPath(input),
			handlers: { registerCli: (registrar, opts) => registerCli(record, registrar, opts) }
		});
		const registrySnapshot = snapshotPluginRegistry(registry);
		try {
			withProfile({
				pluginId: record.id,
				source: record.source
			}, "cli-metadata:register", () => runPluginRegisterSync(register, api));
			registry.plugins.push(record);
			seenIds.set(pluginId, candidate.origin);
		} catch (err) {
			restorePluginRegistry(registry, registrySnapshot);
			recordPluginError({
				logger,
				registry,
				record,
				seenIds,
				pluginId,
				origin: candidate.origin,
				phase: "register",
				error: err,
				logPrefix: `[plugins] ${record.id} failed during register from ${record.source}: `,
				diagnosticMessagePrefix: "plugin failed during register: "
			});
		}
	}
	return registry;
}
function safeRealpathOrResolve(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return path.resolve(value);
	}
}
function resolveCliMetadataEntrySource(rootDir) {
	for (const basename of CLI_METADATA_ENTRY_BASENAMES) {
		const candidate = path.join(rootDir, basename);
		if (fs.existsSync(candidate)) return candidate;
	}
	return null;
}
//#endregion
export { resolveRuntimePluginRegistry as a, resolvePluginActivationSourceConfig as c, resetRegisteredAgentHarnessSessions as d, resolveCompatibleRuntimePluginRegistry as i, disposeRegisteredAgentHarnesses as l, loadOpenClawPluginCliRegistry as n, listCodexAppServerExtensionFactories as o, loadOpenClawPlugins as r, getCompactionProvider as s, isPluginRegistryLoadInFlight as t, listRegisteredAgentHarnesses as u };
