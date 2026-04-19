import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString, u as normalizeStringifiedOptionalString } from "./string-coerce-BUSzWgUA.js";
import { l as isRecord, m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { n as resolveGlobalSingleton } from "./global-singleton-B80lD-oJ.js";
import { i as openBoundaryFileSync, n as matchBoundaryFileOpenFailure } from "./boundary-file-read-DXLy_w6L.js";
import { l as normalizeTrimmedStringList } from "./string-normalization-xm3f27dv.js";
import { a as CLAUDE_BUNDLE_MANIFEST_RELATIVE_PATH, d as normalizeBundlePathList, i as safeStatSync, n as isPathInside, o as CODEX_BUNDLE_MANIFEST_RELATIVE_PATH, s as CURSOR_BUNDLE_MANIFEST_RELATIVE_PATH, u as mergeBundlePathLists } from "./path-safety-cMqhKBu0.js";
import { n as discoverOpenClawPlugins, r as resolvePluginCacheInputs } from "./discovery-DGQFjH8F.js";
import { g as unwrapDefaultModuleExport } from "./bundled-CGMeVzvo.js";
import { f as resolvePluginRuntimeModulePath, g as shouldPreferNativeJiti, t as buildPluginLoaderAliasMap } from "./sdk-alias-w29OTN9p.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-D_0TILck.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import { i as kindsEqual, n as defaultSlotIdForKey, r as hasKind } from "./slots-MFUVcT3n.js";
import { c as listChatChannels } from "./registry-CENZffQG.js";
import { i as applyMergePatch, t as validateJsonSchemaValue } from "./schema-validator-Byqt0Q69.js";
import { a as normalizePluginsConfig, l as resolveMemorySlotDecision, n as createPluginActivationSource, o as resolveEffectiveEnableState, s as resolveEffectivePluginActivationState, t as applyTestPluginDefaults } from "./config-state-CcN3bZ9D.js";
import { t as normalizePluginGatewayMethodScope } from "./gateway-method-policy-ZYJh0jGf.js";
import { a as normalizePluginIdScope, n as createPluginIdScopeSet, o as serializePluginIdScope, r as hasExplicitPluginIdScope, t as isChannelConfigured } from "./channel-configured-BTEJAT4e.js";
import { t as buildPluginApi } from "./api-builder-PBijLo-P.js";
import { I as resolveMemoryDreamingConfig, L as resolveMemoryDreamingPluginConfig, _ as DEFAULT_MEMORY_DREAMING_PLUGIN_ID } from "./dreaming-BHkWSJTy.js";
import { a as clearPluginCommands, i as validatePluginCommandDefinition, n as registerPluginCommand } from "./command-registration-BkSkbo2n.js";
import { i as initializeGlobalHookRunner } from "./hook-runner-global-CYvQf43U.js";
import { a as isPromptInjectionHookName, c as clearPluginInteractiveHandlers, i as isPluginHookName, s as stripPromptMutationFieldsFromLegacyHookResult, u as registerPluginInteractiveHandler } from "./types-9X9ddJgo.js";
import { a as getMemoryPromptSectionBuilder, d as registerMemoryCapability, f as registerMemoryCorpusSupplement, g as registerMemoryRuntime, h as registerMemoryPromptSupplement, i as getMemoryFlushPlanResolver, l as listMemoryCorpusSupplements, m as registerMemoryPromptSection, n as clearMemoryPluginState, o as getMemoryRuntime, p as registerMemoryFlushPlanResolver, r as getMemoryCapabilityRegistration, u as listMemoryPromptSupplements, v as restoreMemoryPluginState } from "./memory-state-B-M2UC51.js";
import { n as registerContextEngineForOwner } from "./registry-hc1-G3yP.js";
import { f as registerInternalHook, h as unregisterInternalHook } from "./internal-hooks-4i4Rq3Qq.js";
import { i as NODE_SYSTEM_RUN_COMMANDS, n as NODE_EXEC_APPROVALS_COMMANDS, r as NODE_SYSTEM_NOTIFY_COMMAND } from "./node-commands-CACC2qu6.js";
import { a as normalizePluginHttpPath, t as findOverlappingPluginHttpRoute } from "./http-route-overlap-CZjpP4j6.js";
import { b as createEmptyPluginRegistry, d as recordImportedPluginId, i as getActivePluginRegistryKey, r as getActivePluginRegistry, s as getActivePluginRuntimeSubagentMode, y as setActivePluginRegistry } from "./runtime-BB1a2aCy.js";
import { r as withPluginRuntimePluginIdScope } from "./gateway-request-scope-Dkin09LL.js";
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
//#region src/plugins/bundle-config-shared.ts
function readBundleJsonObject(params) {
	const opened = openBoundaryFileSync({
		absolutePath: path.join(params.rootDir, params.relativePath),
		rootPath: params.rootDir,
		boundaryLabel: "plugin root",
		rejectHardlinks: true
	});
	if (!opened.ok) return params.onOpenFailure?.(opened) ?? {
		ok: true,
		raw: {}
	};
	try {
		const raw = JSON.parse(fs.readFileSync(opened.fd, "utf-8"));
		if (!isRecord(raw)) return {
			ok: false,
			error: `${params.relativePath} must contain a JSON object`
		};
		return {
			ok: true,
			raw
		};
	} catch (error) {
		return {
			ok: false,
			error: `failed to parse ${params.relativePath}: ${String(error)}`
		};
	} finally {
		fs.closeSync(opened.fd);
	}
}
function resolveBundleJsonOpenFailure(params) {
	return matchBoundaryFileOpenFailure(params.failure, {
		path: () => {
			if (params.allowMissing) return {
				ok: true,
				raw: {}
			};
			return {
				ok: false,
				error: `unable to read ${params.relativePath}: path`
			};
		},
		fallback: (failure) => ({
			ok: false,
			error: `unable to read ${params.relativePath}: ${failure.reason}`
		})
	});
}
function inspectBundleServerRuntimeSupport(params) {
	const supportedServerNames = [];
	const unsupportedServerNames = [];
	let hasSupportedServer = false;
	for (const [serverName, server] of Object.entries(params.resolveServers(params.loaded.config))) {
		if (typeof server.command === "string" && server.command.trim().length > 0) {
			hasSupportedServer = true;
			supportedServerNames.push(serverName);
			continue;
		}
		unsupportedServerNames.push(serverName);
	}
	return {
		hasSupportedServer,
		supportedServerNames,
		unsupportedServerNames,
		diagnostics: params.loaded.diagnostics
	};
}
function loadEnabledBundleConfig(params) {
	const registry = loadPluginManifestRegistry({
		workspaceDir: params.workspaceDir,
		config: params.cfg
	});
	const normalizedPlugins = normalizePluginsConfig(params.cfg?.plugins);
	const diagnostics = [];
	let merged = params.createEmptyConfig();
	for (const record of registry.plugins) {
		if (record.format !== "bundle" || !record.bundleFormat) continue;
		if (!resolveEffectivePluginActivationState({
			id: record.id,
			origin: record.origin,
			config: normalizedPlugins,
			rootConfig: params.cfg
		}).activated) continue;
		const loaded = params.loadBundleConfig({
			pluginId: record.id,
			rootDir: record.rootDir,
			bundleFormat: record.bundleFormat
		});
		merged = applyMergePatch(merged, loaded.config);
		for (const message of loaded.diagnostics) diagnostics.push(params.createDiagnostic(record.id, message));
	}
	return {
		config: merged,
		diagnostics
	};
}
//#endregion
//#region src/plugins/bundle-mcp.ts
const MANIFEST_PATH_BY_FORMAT = {
	claude: CLAUDE_BUNDLE_MANIFEST_RELATIVE_PATH,
	codex: CODEX_BUNDLE_MANIFEST_RELATIVE_PATH,
	cursor: CURSOR_BUNDLE_MANIFEST_RELATIVE_PATH
};
const CLAUDE_PLUGIN_ROOT_PLACEHOLDER = "${CLAUDE_PLUGIN_ROOT}";
function resolveBundleMcpConfigPaths(params) {
	const declared = normalizeBundlePathList(params.raw.mcpServers);
	const defaults = fs.existsSync(path.join(params.rootDir, ".mcp.json")) ? [".mcp.json"] : [];
	if (params.bundleFormat === "claude") return mergeBundlePathLists(defaults, declared);
	return mergeBundlePathLists(defaults, declared);
}
function extractMcpServerMap(raw) {
	if (!isRecord(raw)) return {};
	const nested = isRecord(raw.mcpServers) ? raw.mcpServers : isRecord(raw.servers) ? raw.servers : raw;
	if (!isRecord(nested)) return {};
	const result = {};
	for (const [serverName, serverRaw] of Object.entries(nested)) {
		if (!isRecord(serverRaw)) continue;
		result[serverName] = { ...serverRaw };
	}
	return result;
}
function isExplicitRelativePath(value) {
	return value === "." || value === ".." || value.startsWith("./") || value.startsWith("../");
}
function expandBundleRootPlaceholders(value, rootDir) {
	if (!value.includes(CLAUDE_PLUGIN_ROOT_PLACEHOLDER)) return value;
	return value.split(CLAUDE_PLUGIN_ROOT_PLACEHOLDER).join(rootDir);
}
function normalizeBundlePath(targetPath) {
	return path.normalize(path.resolve(targetPath));
}
function normalizeExpandedAbsolutePath(value) {
	return path.isAbsolute(value) ? path.normalize(value) : value;
}
function absolutizeBundleMcpServer(params) {
	const next = { ...params.server };
	if (typeof next.cwd !== "string" && typeof next.workingDirectory !== "string") next.cwd = params.baseDir;
	const command = next.command;
	if (typeof command === "string") {
		const expanded = expandBundleRootPlaceholders(command, params.rootDir);
		next.command = isExplicitRelativePath(expanded) ? path.resolve(params.baseDir, expanded) : normalizeExpandedAbsolutePath(expanded);
	}
	const cwd = next.cwd;
	if (typeof cwd === "string") {
		const expanded = expandBundleRootPlaceholders(cwd, params.rootDir);
		next.cwd = path.isAbsolute(expanded) ? expanded : path.resolve(params.baseDir, expanded);
	}
	const workingDirectory = next.workingDirectory;
	if (typeof workingDirectory === "string") {
		const expanded = expandBundleRootPlaceholders(workingDirectory, params.rootDir);
		next.workingDirectory = path.isAbsolute(expanded) ? path.normalize(expanded) : path.resolve(params.baseDir, expanded);
	}
	if (Array.isArray(next.args)) next.args = next.args.map((entry) => {
		if (typeof entry !== "string") return entry;
		const expanded = expandBundleRootPlaceholders(entry, params.rootDir);
		if (!isExplicitRelativePath(expanded)) return normalizeExpandedAbsolutePath(expanded);
		return path.resolve(params.baseDir, expanded);
	});
	if (isRecord(next.env)) next.env = Object.fromEntries(Object.entries(next.env).map(([key, value]) => [key, typeof value === "string" ? normalizeExpandedAbsolutePath(expandBundleRootPlaceholders(value, params.rootDir)) : value]));
	return next;
}
function loadBundleFileBackedMcpConfig(params) {
	const rootDir = normalizeBundlePath(params.rootDir);
	const absolutePath = path.resolve(rootDir, params.relativePath);
	const opened = openBoundaryFileSync({
		absolutePath,
		rootPath: rootDir,
		boundaryLabel: "plugin root",
		rejectHardlinks: true
	});
	if (!opened.ok) return { mcpServers: {} };
	try {
		if (!fs.fstatSync(opened.fd).isFile()) return { mcpServers: {} };
		const servers = extractMcpServerMap(JSON.parse(fs.readFileSync(opened.fd, "utf-8")));
		const baseDir = normalizeBundlePath(path.dirname(absolutePath));
		return { mcpServers: Object.fromEntries(Object.entries(servers).map(([serverName, server]) => [serverName, absolutizeBundleMcpServer({
			rootDir,
			baseDir,
			server
		})])) };
	} finally {
		fs.closeSync(opened.fd);
	}
}
function loadBundleInlineMcpConfig(params) {
	if (!isRecord(params.raw.mcpServers)) return { mcpServers: {} };
	const baseDir = normalizeBundlePath(params.baseDir);
	const servers = extractMcpServerMap(params.raw.mcpServers);
	return { mcpServers: Object.fromEntries(Object.entries(servers).map(([serverName, server]) => [serverName, absolutizeBundleMcpServer({
		rootDir: baseDir,
		baseDir,
		server
	})])) };
}
function loadBundleMcpConfig(params) {
	const manifestRelativePath = MANIFEST_PATH_BY_FORMAT[params.bundleFormat];
	const manifestLoaded = readBundleJsonObject({
		rootDir: params.rootDir,
		relativePath: manifestRelativePath,
		onOpenFailure: (failure) => resolveBundleJsonOpenFailure({
			failure,
			relativePath: manifestRelativePath,
			allowMissing: params.bundleFormat === "claude"
		})
	});
	if (!manifestLoaded.ok) return {
		config: { mcpServers: {} },
		diagnostics: [manifestLoaded.error]
	};
	let merged = { mcpServers: {} };
	const filePaths = resolveBundleMcpConfigPaths({
		raw: manifestLoaded.raw,
		rootDir: params.rootDir,
		bundleFormat: params.bundleFormat
	});
	for (const relativePath of filePaths) merged = applyMergePatch(merged, loadBundleFileBackedMcpConfig({
		rootDir: params.rootDir,
		relativePath
	}));
	merged = applyMergePatch(merged, loadBundleInlineMcpConfig({
		raw: manifestLoaded.raw,
		baseDir: params.rootDir
	}));
	return {
		config: merged,
		diagnostics: []
	};
}
function inspectBundleMcpRuntimeSupport(params) {
	const support = inspectBundleServerRuntimeSupport({
		loaded: loadBundleMcpConfig(params),
		resolveServers: (config) => config.mcpServers
	});
	return {
		hasSupportedStdioServer: support.hasSupportedServer,
		supportedServerNames: support.supportedServerNames,
		unsupportedServerNames: support.unsupportedServerNames,
		diagnostics: support.diagnostics
	};
}
function loadEnabledBundleMcpConfig(params) {
	return loadEnabledBundleConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.cfg,
		createEmptyConfig: () => ({ mcpServers: {} }),
		loadBundleConfig: loadBundleMcpConfig,
		createDiagnostic: (pluginId, message) => ({
			pluginId,
			message
		})
	});
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
//#region src/plugins/memory-embedding-providers.ts
const MEMORY_EMBEDDING_PROVIDERS_KEY = Symbol.for("openclaw.memoryEmbeddingProviders");
function getMemoryEmbeddingProviders() {
	const globalStore = globalThis;
	const existing = globalStore[MEMORY_EMBEDDING_PROVIDERS_KEY];
	if (existing instanceof Map) return existing;
	const created = /* @__PURE__ */ new Map();
	globalStore[MEMORY_EMBEDDING_PROVIDERS_KEY] = created;
	return created;
}
function registerMemoryEmbeddingProvider(adapter, options) {
	getMemoryEmbeddingProviders().set(adapter.id, {
		adapter,
		ownerPluginId: options?.ownerPluginId
	});
}
function getRegisteredMemoryEmbeddingProvider(id) {
	return getMemoryEmbeddingProviders().get(id);
}
function listRegisteredMemoryEmbeddingProviders() {
	return Array.from(getMemoryEmbeddingProviders().values());
}
function listMemoryEmbeddingProviders() {
	return listRegisteredMemoryEmbeddingProviders().map((entry) => entry.adapter);
}
function restoreRegisteredMemoryEmbeddingProviders(entries) {
	getMemoryEmbeddingProviders().clear();
	for (const entry of entries) registerMemoryEmbeddingProvider(entry.adapter, { ownerPluginId: entry.ownerPluginId });
}
//#endregion
//#region src/channels/plugins/meta-normalization.ts
function stripRequiredChannelMeta(meta) {
	const { id: _ignoredId, label: _ignoredLabel, selectionLabel: _ignoredSelectionLabel, docsPath: _ignoredDocsPath, blurb: _ignoredBlurb, ...rest } = meta ?? {};
	return rest;
}
function normalizeChannelMeta(params) {
	const next = params.meta ?? void 0;
	const existing = params.existing ?? void 0;
	const label = normalizeOptionalString(next?.label) ?? normalizeOptionalString(existing?.label) ?? normalizeOptionalString(next?.selectionLabel) ?? normalizeOptionalString(existing?.selectionLabel) ?? params.id;
	const selectionLabel = normalizeOptionalString(next?.selectionLabel) ?? normalizeOptionalString(existing?.selectionLabel) ?? label;
	const docsPath = normalizeOptionalString(next?.docsPath) ?? normalizeOptionalString(existing?.docsPath) ?? `/channels/${params.id}`;
	const blurb = normalizeOptionalString(next?.blurb) ?? normalizeOptionalString(existing?.blurb) ?? "";
	return {
		...stripRequiredChannelMeta(existing),
		...stripRequiredChannelMeta(next),
		id: params.id,
		label,
		selectionLabel,
		docsPath,
		blurb
	};
}
//#endregion
//#region src/plugins/channel-validation.ts
function pushChannelDiagnostic(params) {
	params.pushDiagnostic({
		level: params.level,
		pluginId: params.pluginId,
		source: params.source,
		message: params.message
	});
}
function resolveBundledChannelMeta(id) {
	return listChatChannels().find((meta) => meta.id === id);
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
		pushChannelDiagnostic({
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
	if (rawMetaId && rawMetaId !== id) pushChannelDiagnostic({
		level: "warn",
		pluginId: params.pluginId,
		source: params.source,
		message: `channel "${id}" meta.id mismatch ("${rawMetaId}"); using registered channel id`,
		pushDiagnostic: params.pushDiagnostic
	});
	const missingFields = collectMissingChannelMetaFields(rawMeta);
	if (missingFields.length > 0) pushChannelDiagnostic({
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
//#endregion
//#region src/plugins/provider-validation.ts
function pushProviderDiagnostic(params) {
	params.pushDiagnostic({
		level: params.level,
		pluginId: params.pluginId,
		source: params.source,
		message: params.message
	});
}
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
	pushProviderDiagnostic({
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
		pushProviderDiagnostic({
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
			pushProviderDiagnostic({
				level: "error",
				pluginId: params.pluginId,
				source: params.source,
				message: `provider "${params.providerId}" auth method missing id`,
				pushDiagnostic: params.pushDiagnostic
			});
			continue;
		}
		if (seenMethodIds.has(methodId)) {
			pushProviderDiagnostic({
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
			pushProviderDiagnostic({
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
		pushProviderDiagnostic({
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
	if (catalog && discovery) pushProviderDiagnostic({
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
function createPluginRegistry(registryParams) {
	const registry = createEmptyPluginRegistry();
	const coreGatewayMethods = new Set(Object.keys(registryParams.coreGatewayHandlers ?? {}));
	const pushDiagnostic = (diag) => {
		registry.diagnostics.push(diag);
	};
	const registerTool = (record, tool, opts) => {
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
		const name = entry?.hook.name ?? opts?.name?.trim();
		if (!name) {
			pushDiagnostic({
				level: "warn",
				pluginId: record.id,
				source: record.source,
				message: "hook registration missing name"
			});
			return;
		}
		const existingHook = registry.hooks.find((entry) => entry.entry.hook.name === name);
		if (existingHook) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `hook already registered: ${name} (${existingHook.pluginId})`
			});
			return;
		}
		const description = entry?.hook.description ?? opts?.description ?? "";
		const hookEntry = entry ? {
			...entry,
			hook: {
				...entry.hook,
				name,
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
				name,
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
		record.hookNames.push(name);
		registry.hooks.push({
			pluginId: record.id,
			entry: hookEntry,
			events: normalizedEvents,
			source: record.source
		});
		const hookSystemEnabled = config?.hooks?.internal?.enabled !== false;
		if (!registryParams.activateGlobalSideEffects || !hookSystemEnabled || opts?.register === false) return;
		const previousRegistrations = activePluginHookRegistrations.get(name) ?? [];
		for (const registration of previousRegistrations) unregisterInternalHook(registration.event, registration.handler);
		const nextRegistrations = [];
		for (const event of normalizedEvents) {
			registerInternalHook(event, handler);
			nextRegistrations.push({
				event,
				handler
			});
		}
		activePluginHookRegistrations.set(name, nextRegistrations);
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
			if (!params.replaceExisting) {
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
		if (mode !== "setup-only" && existingRuntime) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `channel already registered: ${id} (${existingRuntime.pluginId})`
			});
			return;
		}
		const existingSetup = registry.channelSetups.find((entry) => entry.plugin.id === id);
		if (existingSetup) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: `channel setup already registered: ${id} (${existingSetup.pluginId})`
			});
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
		if (mode === "setup-only") return;
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
	const registerCli = (record, registrar, opts) => {
		const descriptors = (opts?.descriptors ?? []).map((descriptor) => ({
			name: descriptor.name.trim(),
			description: descriptor.description.trim(),
			hasSubcommands: descriptor.hasSubcommands
		})).filter((descriptor) => descriptor.name && descriptor.description);
		const commands = [...opts?.commands ?? [], ...descriptors.map((descriptor) => descriptor.name)].map((cmd) => cmd.trim()).filter(Boolean);
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
				...registrationMode === "full" ? {
					registerTool: (tool, opts) => registerTool(record, tool, opts),
					registerHook: (events, handler, opts) => registerHook(record, events, handler, opts, params.config),
					registerHttpRoute: (routeParams) => registerHttpRoute(record, routeParams),
					registerProvider: (provider) => registerProvider(record, provider),
					registerAgentHarness: (harness) => registerAgentHarness$1(record, harness),
					registerSpeechProvider: (provider) => registerSpeechProvider(record, provider),
					registerRealtimeTranscriptionProvider: (provider) => registerRealtimeTranscriptionProvider(record, provider),
					registerRealtimeVoiceProvider: (provider) => registerRealtimeVoiceProvider(record, provider),
					registerMediaUnderstandingProvider: (provider) => registerMediaUnderstandingProvider(record, provider),
					registerImageGenerationProvider: (provider) => registerImageGenerationProvider(record, provider),
					registerVideoGenerationProvider: (provider) => registerVideoGenerationProvider(record, provider),
					registerMusicGenerationProvider: (provider) => registerMusicGenerationProvider(record, provider),
					registerWebFetchProvider: (provider) => registerWebFetchProvider(record, provider),
					registerWebSearchProvider: (provider) => registerWebSearchProvider(record, provider),
					registerGatewayMethod: (method, handler, opts) => registerGatewayMethod(record, method, handler, opts),
					registerService: (service) => registerService(record, service),
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
					registerMemoryCapability: (capability) => {
						if (!hasKind(record.kind, "memory")) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: "only memory plugins can register a memory capability"
							});
							return;
						}
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
						if (!hasKind(record.kind, "memory")) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: "only memory plugins can register a memory prompt section"
							});
							return;
						}
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
						if (!hasKind(record.kind, "memory")) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: "only memory plugins can register a memory flush plan"
							});
							return;
						}
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
						if (!hasKind(record.kind, "memory")) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: "only memory plugins can register a memory runtime"
							});
							return;
						}
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
	return {
		registry,
		createApi,
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
var PluginLoadReentryError = class extends Error {
	constructor(cacheKey) {
		super(`plugin load reentry detected for cache key: ${cacheKey}`);
		this.name = "PluginLoadReentryError";
		this.cacheKey = cacheKey;
	}
};
let pluginRegistryCacheEntryCap = 128;
const registryCache = /* @__PURE__ */ new Map();
const inFlightPluginRegistryLoads = /* @__PURE__ */ new Set();
const openAllowlistWarningCache = /* @__PURE__ */ new Set();
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
function shouldProfilePluginLoader() {
	return process.env.OPENCLAW_PLUGIN_LOAD_PROFILE === "1";
}
function profilePluginLoaderSync(params) {
	if (!shouldProfilePluginLoader()) return params.run();
	const startMs = performance.now();
	try {
		return params.run();
	} finally {
		const elapsedMs = performance.now() - startMs;
		console.error(`[plugin-load-profile] phase=${params.phase} plugin=${params.pluginId ?? "(core)"} elapsedMs=${elapsedMs.toFixed(1)} source=${params.source}`);
	}
}
/**
* On Windows, the Node.js ESM loader requires absolute paths to be expressed
* as file:// URLs (e.g. file:///C:/Users/...). Raw drive-letter paths like
* C:\... are rejected with ERR_UNSUPPORTED_ESM_URL_SCHEME because the loader
* mistakes the drive letter for an unknown URL scheme.
*
* This helper converts Windows absolute import specifiers to file:// URLs and
* leaves everything else unchanged.
*/
function toSafeImportPath(specifier) {
	if (process.platform !== "win32") return specifier;
	if (specifier.startsWith("file://")) return specifier;
	if (path.win32.isAbsolute(specifier)) {
		const normalizedSpecifier = specifier.replaceAll("\\", "/");
		if (normalizedSpecifier.startsWith("//")) return new URL(`file:${encodeURI(normalizedSpecifier)}`).href;
		return new URL(`file:///${encodeURI(normalizedSpecifier)}`).href;
	}
	return specifier;
}
function createPluginJitiLoader(options) {
	const jitiLoaders = /* @__PURE__ */ new Map();
	return (modulePath) => {
		const tryNative = shouldPreferNativeJiti(modulePath);
		const aliasMap = buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url, options.pluginSdkResolution);
		return getCachedPluginJitiLoader({
			cache: jitiLoaders,
			modulePath,
			importerUrl: import.meta.url,
			jitiFilename: import.meta.url,
			aliasMap,
			tryNative
		});
	};
}
function getCachedPluginRegistry(cacheKey) {
	const cached = registryCache.get(cacheKey);
	if (!cached) return;
	registryCache.delete(cacheKey);
	registryCache.set(cacheKey, cached);
	return cached;
}
function setCachedPluginRegistry(cacheKey, state) {
	if (registryCache.has(cacheKey)) registryCache.delete(cacheKey);
	registryCache.set(cacheKey, state);
	while (registryCache.size > pluginRegistryCacheEntryCap) {
		const oldestKey = registryCache.keys().next().value;
		if (!oldestKey) break;
		registryCache.delete(oldestKey);
	}
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
	const startupChannelMode = params.preferSetupRuntimeForChannelPlugins === true ? "prefer-setup" : "full";
	const moduleLoadMode = params.loadModules === false ? "manifest-only" : "load-modules";
	const runtimeSubagentMode = params.runtimeSubagentMode ?? "default";
	const gatewayMethodsKey = JSON.stringify(params.coreGatewayMethodNames ?? []);
	return `${roots.workspace ?? ""}::${roots.global ?? ""}::${roots.stock ?? ""}::${JSON.stringify({
		...params.plugins,
		installs,
		loadPaths,
		activationMetadataKey: params.activationMetadataKey ?? ""
	})}::${scopeKey}::${setupOnlyKey}::${startupChannelMode}::${moduleLoadMode}::${runtimeSubagentMode}::${params.pluginSdkResolution ?? "auto"}::${gatewayMethodsKey}`;
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
	return options.config !== void 0 || options.activationSourceConfig !== void 0 || options.autoEnabledReasons !== void 0 || options.workspaceDir !== void 0 || options.env !== void 0 || hasExplicitPluginIdScope(options.onlyPluginIds) || options.runtimeOptions !== void 0 || options.pluginSdkResolution !== void 0 || options.coreGatewayHandlers !== void 0 || options.includeSetupOnlyChannelPlugins === true || options.preferSetupRuntimeForChannelPlugins === true || options.loadModules === false;
}
function resolvePluginLoadCacheContext(options = {}) {
	const env = options.env ?? process.env;
	const cfg = applyTestPluginDefaults(options.config ?? {}, env);
	const activationSourceConfig = options.activationSourceConfig ?? options.config ?? {};
	const normalized = normalizePluginsConfig(cfg.plugins);
	const activationSource = createPluginActivationSource({ config: activationSourceConfig });
	const onlyPluginIds = normalizePluginIdScope(options.onlyPluginIds);
	const includeSetupOnlyChannelPlugins = options.includeSetupOnlyChannelPlugins === true;
	const preferSetupRuntimeForChannelPlugins = options.preferSetupRuntimeForChannelPlugins === true;
	const runtimeSubagentMode = resolveRuntimeSubagentMode(options.runtimeOptions);
	const coreGatewayMethodNames = Object.keys(options.coreGatewayHandlers ?? {}).toSorted();
	const cacheKey = buildCacheKey({
		workspaceDir: options.workspaceDir,
		plugins: normalized,
		activationMetadataKey: buildActivationMetadataHash({
			activationSource,
			autoEnabledReasons: options.autoEnabledReasons ?? {}
		}),
		installs: cfg.plugins?.installs,
		env,
		onlyPluginIds,
		includeSetupOnlyChannelPlugins,
		preferSetupRuntimeForChannelPlugins,
		loadModules: options.loadModules,
		runtimeSubagentMode,
		pluginSdkResolution: options.pluginSdkResolution,
		coreGatewayMethodNames
	});
	return {
		env,
		cfg,
		normalized,
		activationSourceConfig,
		activationSource,
		autoEnabledReasons: options.autoEnabledReasons ?? {},
		onlyPluginIds,
		includeSetupOnlyChannelPlugins,
		preferSetupRuntimeForChannelPlugins,
		shouldActivate: options.activate !== false,
		shouldLoadModules: options.loadModules !== false,
		runtimeSubagentMode,
		cacheKey
	};
}
function getCompatibleActivePluginRegistry(options = {}) {
	const activeRegistry = getActivePluginRegistry() ?? void 0;
	if (!activeRegistry) return;
	if (!hasExplicitCompatibilityInputs(options)) return activeRegistry;
	const activeCacheKey = getActivePluginRegistryKey();
	if (!activeCacheKey) return;
	const loadContext = resolvePluginLoadCacheContext(options);
	if (loadContext.cacheKey === activeCacheKey) return activeRegistry;
	if (loadContext.runtimeSubagentMode === "default" && getActivePluginRuntimeSubagentMode() === "gateway-bindable") {
		if (resolvePluginLoadCacheContext({
			...options,
			runtimeOptions: {
				...options.runtimeOptions,
				allowGatewaySubagentBinding: true
			}
		}).cacheKey === activeCacheKey) return activeRegistry;
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
	return inFlightPluginRegistryLoads.has(resolvePluginRegistryLoadCacheKey(options));
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
	const resolved = unwrapDefaultModuleExport(moduleExport);
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
function resolveSetupChannelRegistration(moduleExport) {
	const resolved = unwrapDefaultModuleExport(moduleExport);
	if (!resolved || typeof resolved !== "object") return {};
	const setupEntryRecord = resolved;
	if (setupEntryRecord.kind === "bundled-channel-setup-entry" && typeof setupEntryRecord.loadSetupPlugin === "function") try {
		const loadedPlugin = setupEntryRecord.loadSetupPlugin();
		const loadedSecrets = typeof setupEntryRecord.loadSetupSecrets === "function" ? setupEntryRecord.loadSetupSecrets() : void 0;
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
		contextEngineIds: [],
		memoryEmbeddingProviderIds: [],
		agentHarnessIds: [],
		gatewayMethods: [],
		cliCommands: [],
		services: [],
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
	const installs = params.config.plugins?.installs ?? {};
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
	if (openAllowlistWarningCache.has(params.warningCacheKey)) return;
	const preview = autoDiscoverable.slice(0, 6).map((entry) => `${entry.id} (${entry.source})`).join(", ");
	const extra = autoDiscoverable.length > 6 ? ` (+${autoDiscoverable.length - 6} more)` : "";
	openAllowlistWarningCache.add(params.warningCacheKey);
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
	setActivePluginRegistry(registry, cacheKey, runtimeSubagentMode, workspaceDir);
	initializeGlobalHookRunner(registry);
}
function loadOpenClawPlugins(options = {}) {
	if (options.activate === false && options.cache !== false) throw new Error("loadOpenClawPlugins: activate:false requires cache:false to prevent command registry divergence");
	const { env, cfg, normalized, activationSource, autoEnabledReasons, onlyPluginIds, includeSetupOnlyChannelPlugins, preferSetupRuntimeForChannelPlugins, shouldActivate, shouldLoadModules, cacheKey, runtimeSubagentMode } = resolvePluginLoadCacheContext(options);
	const logger = options.logger ?? defaultLogger();
	const validateOnly = options.mode === "validate";
	const onlyPluginIdSet = createPluginIdScopeSet(onlyPluginIds);
	const cacheEnabled = options.cache !== false;
	if (cacheEnabled) {
		const cached = getCachedPluginRegistry(cacheKey);
		if (cached) {
			restoreRegisteredAgentHarnesses(cached.agentHarnesses);
			restoreRegisteredCompactionProviders(cached.compactionProviders);
			restoreRegisteredMemoryEmbeddingProviders(cached.memoryEmbeddingProviders);
			restoreMemoryPluginState({
				capability: cached.memoryCapability,
				corpusSupplements: cached.memoryCorpusSupplements,
				promptBuilder: cached.memoryPromptBuilder,
				promptSupplements: cached.memoryPromptSupplements,
				flushPlanResolver: cached.memoryFlushPlanResolver,
				runtime: cached.memoryRuntime
			});
			if (shouldActivate) activatePluginRegistry(cached.registry, cacheKey, runtimeSubagentMode, options.workspaceDir);
			return cached.registry;
		}
	}
	if (inFlightPluginRegistryLoads.has(cacheKey)) throw new PluginLoadReentryError(cacheKey);
	inFlightPluginRegistryLoads.add(cacheKey);
	try {
		if (shouldActivate) {
			clearAgentHarnesses();
			clearPluginCommands();
			clearPluginInteractiveHandlers();
			clearMemoryPluginState();
		}
		const getJiti = createPluginJitiLoader(options);
		let createPluginRuntimeFactory = null;
		const resolveCreatePluginRuntime = () => {
			if (createPluginRuntimeFactory) return createPluginRuntimeFactory;
			const runtimeModulePath = resolvePluginRuntimeModulePath({ pluginSdkResolution: options.pluginSdkResolution });
			if (!runtimeModulePath) throw new Error("Unable to resolve plugin runtime module");
			const safeRuntimePath = toSafeImportPath(runtimeModulePath);
			const runtimeModule = profilePluginLoaderSync({
				phase: "runtime-module",
				source: runtimeModulePath,
				run: () => getJiti(runtimeModulePath)(safeRuntimePath)
			});
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
		const { registry, createApi, registerReload, registerNodeHostCommand, registerSecurityAuditCollector } = createPluginRegistry({
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
			diagnostics: discovery.diagnostics
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
			const registrationMode = enableState.enabled ? !validateOnly && shouldLoadChannelPluginInSetupRuntime({
				manifestChannels: manifestRecord.channels,
				setupSource: manifestRecord.setupSource,
				startupDeferConfiguredChannelFullLoadUntilAfterListen: manifestRecord.startupDeferConfiguredChannelFullLoadUntilAfterListen,
				cfg,
				env,
				preferSetupRuntimeForChannelPlugins
			}) ? "setup-runtime" : "full" : includeSetupOnlyChannelPlugins && !validateOnly && onlyPluginIdSet && manifestRecord.channels.length > 0 ? "setup-only" : null;
			if (!registrationMode) {
				record.status = "disabled";
				record.error = enableState.reason;
				markPluginActivationDisabled(record, enableState.reason);
				registry.plugins.push(record);
				seenIds.set(pluginId, candidate.origin);
				continue;
			}
			if (!enableState.enabled) {
				record.status = "disabled";
				record.error = enableState.reason;
				markPluginActivationDisabled(record, enableState.reason);
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
			if (registrationMode === "full" && candidate.origin === "bundled" && hasKind(manifestRecord.kind, "memory")) {
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
			if (!shouldLoadModules && registrationMode === "full") {
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
			const pluginRoot = safeRealpathOrResolve(candidate.rootDir);
			const opened = openBoundaryFileSync({
				absolutePath: (registrationMode === "setup-only" || registrationMode === "setup-runtime") && manifestRecord.setupSource ? manifestRecord.setupSource : candidate.source,
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
				recordImportedPluginId(record.id);
				mod = profilePluginLoaderSync({
					phase: registrationMode,
					pluginId: record.id,
					source: safeSource,
					run: () => getJiti(safeSource)(safeImportSource)
				});
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
			if ((registrationMode === "setup-only" || registrationMode === "setup-runtime") && manifestRecord.setupSource) {
				const setupRegistration = resolveSetupChannelRegistration(mod);
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
					if (setupRegistration.plugin.id && setupRegistration.plugin.id !== record.id) {
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
					if (registrationMode === "setup-runtime" && setupRegistration.usesBundledSetupContract && candidate.source !== safeSource) {
						const runtimeOpened = openBoundaryFileSync({
							absolutePath: candidate.source,
							rootPath: pluginRoot,
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
							runtimeMod = profilePluginLoaderSync({
								phase: "load-setup-runtime-entry",
								pluginId: record.id,
								source: safeRuntimeSource,
								run: () => getJiti(safeRuntimeSource)(safeRuntimeImportSource)
							});
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
					if (mergedSetupPlugin.id && mergedSetupPlugin.id !== record.id) {
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
			if (registrationMode === "full") {
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
			if (registrationMode === "full") {
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
				pushPluginLoadError("plugin export missing register/activate");
				continue;
			}
			const api = createApi(record, {
				config: cfg,
				pluginConfig: validatedConfig.value,
				hookPolicy: entry?.hooks,
				registrationMode
			});
			const previousAgentHarnesses = listRegisteredAgentHarnesses();
			const previousCompactionProviders = listRegisteredCompactionProviders();
			const previousMemoryEmbeddingProviders = listRegisteredMemoryEmbeddingProviders();
			const previousMemoryFlushPlanResolver = getMemoryFlushPlanResolver();
			const previousMemoryPromptBuilder = getMemoryPromptSectionBuilder();
			const previousMemoryCorpusSupplements = listMemoryCorpusSupplements();
			const previousMemoryPromptSupplements = listMemoryPromptSupplements();
			const previousMemoryRuntime = getMemoryRuntime();
			try {
				const result = register(api);
				if (result && typeof result.then === "function") registry.diagnostics.push({
					level: "warn",
					pluginId: record.id,
					source: record.source,
					message: "plugin register returned a promise; async registration is ignored"
				});
				if (!shouldActivate) {
					restoreRegisteredAgentHarnesses(previousAgentHarnesses);
					restoreRegisteredCompactionProviders(previousCompactionProviders);
					restoreRegisteredMemoryEmbeddingProviders(previousMemoryEmbeddingProviders);
					restoreMemoryPluginState({
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
				restoreRegisteredAgentHarnesses(previousAgentHarnesses);
				restoreRegisteredCompactionProviders(previousCompactionProviders);
				restoreRegisteredMemoryEmbeddingProviders(previousMemoryEmbeddingProviders);
				restoreMemoryPluginState({
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
		inFlightPluginRegistryLoads.delete(cacheKey);
	}
}
async function loadOpenClawPluginCliRegistry(options = {}) {
	const { env, cfg, normalized, activationSource, autoEnabledReasons, onlyPluginIds, cacheKey } = resolvePluginLoadCacheContext({
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
		diagnostics: discovery.diagnostics
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
		const sourceForCliMetadata = candidate.origin === "bundled" ? cliMetadataSource : cliMetadataSource ?? candidate.source;
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
			mod = profilePluginLoaderSync({
				phase: "cli-metadata",
				pluginId: record.id,
				source: safeSource,
				run: () => getJiti(safeSource)(safeImportSource)
			});
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
			pushPluginLoadError("plugin export missing register/activate");
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
		try {
			await register(api);
			registry.plugins.push(record);
			seenIds.set(pluginId, candidate.origin);
		} catch (err) {
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
export { readBundleJsonObject as _, resolveRuntimePluginRegistry as a, resetRegisteredAgentHarnessSessions as b, listMemoryEmbeddingProviders as c, getCompactionProvider as d, extractMcpServerMap as f, loadEnabledBundleConfig as g, inspectBundleServerRuntimeSupport as h, resolveCompatibleRuntimePluginRegistry as i, listRegisteredMemoryEmbeddingProviders as l, loadEnabledBundleMcpConfig as m, loadOpenClawPluginCliRegistry as n, normalizeChannelMeta as o, inspectBundleMcpRuntimeSupport as p, loadOpenClawPlugins as r, getRegisteredMemoryEmbeddingProvider as s, isPluginRegistryLoadInFlight as t, registerMemoryEmbeddingProvider as u, disposeRegisteredAgentHarnesses as v, listRegisteredAgentHarnesses as y };
