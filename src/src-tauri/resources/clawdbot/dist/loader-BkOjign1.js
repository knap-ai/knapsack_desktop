import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { n as resolveGlobalSingleton } from "./global-singleton-BuWJMSMa.js";
import { u as isRecord, v as resolveUserPath } from "./utils-CE3P21nG.js";
import { i as openBoundaryFileSync, n as matchBoundaryFileOpenFailure } from "./boundary-file-read-LPHTYrMX.js";
import { i as getActivePluginRegistryKey, r as getActivePluginRegistry, u as recordImportedPluginId, v as setActivePluginRegistry, y as createEmptyPluginRegistry } from "./runtime-DZz1f0_h.js";
import { d as buildPluginLoaderJitiOptions, g as shouldPreferNativeJiti, p as resolvePluginRuntimeModulePath, u as buildPluginLoaderAliasMap } from "./chat-meta-Cdrnv7R-.js";
import { i as kindsEqual, n as defaultSlotIdForKey, r as hasKind } from "./slots-u5aMXqtV.js";
import { a as normalizePluginsConfig, l as resolveMemorySlotDecision, o as resolveEffectiveEnableState, s as resolveEffectivePluginActivationState, t as applyTestPluginDefaults } from "./config-state-zclcq4hc.js";
import { a as safeStatSync, c as CURSOR_BUNDLE_MANIFEST_RELATIVE_PATH, d as mergeBundlePathLists, f as normalizeBundlePathList, o as CLAUDE_BUNDLE_MANIFEST_RELATIVE_PATH, r as isPathInside, s as CODEX_BUNDLE_MANIFEST_RELATIVE_PATH } from "./min-host-version-B_bhUtXS.js";
import { a as resolvePluginCacheInputs, i as discoverOpenClawPlugins, n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { n as validateJsonSchemaValue, t as applyMergePatch } from "./merge-patch-B__RZvcw.js";
import { t as isChannelConfigured } from "./channel-configured-xOWKXdGR.js";
import { t as buildPluginApi } from "./api-builder-DJbipBVf.js";
import { a as isPluginHookName, d as validatePluginCommandDefinition, f as clearPluginInteractiveHandlers, g as clearPluginCommands, h as registerPluginInteractiveHandler, l as registerPluginCommand, o as isPromptInjectionHookName, s as stripPromptMutationFieldsFromLegacyHookResult } from "./types-BKsOYeOd.js";
import { i as initializeGlobalHookRunner } from "./hook-runner-global-CmW7Xsw3.js";
import { a as registerMemoryEmbeddingProvider, i as listRegisteredMemoryEmbeddingProviders, n as getRegisteredMemoryEmbeddingProvider, o as restoreRegisteredMemoryEmbeddingProviders } from "./memory-embedding-providers-DHmXGqSq.js";
import { a as getMemoryRuntime, c as registerMemoryPromptSection, d as restoreMemoryPluginState, i as getMemoryPromptSectionBuilder, l as registerMemoryRuntime, n as clearMemoryPluginState, r as getMemoryFlushPlanResolver, s as registerMemoryFlushPlanResolver } from "./memory-state-sKCT2k_7.js";
import { n as registerContextEngineForOwner } from "./registry-0V6fQpn5.js";
import { f as registerInternalHook } from "./internal-hooks-LWzilokd.js";
import { a as normalizePluginHttpPath, t as findOverlappingPluginHttpRoute } from "./http-route-overlap-COhYSRcV.js";
import fsSync from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { createJiti } from "jiti";
import { AsyncLocalStorage } from "node:async_hooks";
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
		const raw = JSON.parse(fsSync.readFileSync(opened.fd, "utf-8"));
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
		fsSync.closeSync(opened.fd);
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
	const defaults = fsSync.existsSync(path.join(params.rootDir, ".mcp.json")) ? [".mcp.json"] : [];
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
		if (!fsSync.fstatSync(opened.fd).isFile()) return { mcpServers: {} };
		const servers = extractMcpServerMap(JSON.parse(fsSync.readFileSync(opened.fd, "utf-8")));
		const baseDir = normalizeBundlePath(path.dirname(absolutePath));
		return { mcpServers: Object.fromEntries(Object.entries(servers).map(([serverName, server]) => [serverName, absolutizeBundleMcpServer({
			rootDir,
			baseDir,
			server
		})])) };
	} finally {
		fsSync.closeSync(opened.fd);
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
//#region src/plugins/provider-validation.ts
function pushProviderDiagnostic(params) {
	params.pushDiagnostic({
		level: params.level,
		pluginId: params.pluginId,
		source: params.source,
		message: params.message
	});
}
function normalizeText(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function normalizeTextList(values) {
	const normalized = Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeOnboardingScopes(values) {
	const normalized = Array.from(new Set((values ?? []).filter((value) => value === "text-inference" || value === "image-generation")));
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeProviderOAuthProfileIdRepairs(values) {
	if (!Array.isArray(values)) return;
	const normalized = values.map((value) => {
		const legacyProfileId = normalizeText(value?.legacyProfileId);
		const promptLabel = normalizeText(value?.promptLabel);
		if (!legacyProfileId && !promptLabel) return null;
		return {
			...legacyProfileId ? { legacyProfileId } : {},
			...promptLabel ? { promptLabel } : {}
		};
	}).filter((value) => value !== null);
	return normalized.length > 0 ? normalized : void 0;
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
	const methodId = normalizeText(params.setup.methodId);
	if (methodId && !params.auth.some((method) => method.id === methodId)) pushProviderDiagnostic({
		level: "warn",
		pluginId: params.pluginId,
		source: params.source,
		message: `provider "${params.providerId}" setup method "${methodId}" not found; falling back to available methods`,
		pushDiagnostic: params.pushDiagnostic
	});
	return {
		...normalizeText(params.setup.choiceId) ? { choiceId: normalizeText(params.setup.choiceId) } : {},
		...normalizeText(params.setup.choiceLabel) ? { choiceLabel: normalizeText(params.setup.choiceLabel) } : {},
		...normalizeText(params.setup.choiceHint) ? { choiceHint: normalizeText(params.setup.choiceHint) } : {},
		...normalizeText(params.setup.groupId) ? { groupId: normalizeText(params.setup.groupId) } : {},
		...normalizeText(params.setup.groupLabel) ? { groupLabel: normalizeText(params.setup.groupLabel) } : {},
		...normalizeText(params.setup.groupHint) ? { groupHint: normalizeText(params.setup.groupHint) } : {},
		...methodId && params.auth.some((method) => method.id === methodId) ? { methodId } : {},
		...normalizeOnboardingScopes(params.setup.onboardingScopes) ? { onboardingScopes: normalizeOnboardingScopes(params.setup.onboardingScopes) } : {},
		...params.setup.modelAllowlist ? { modelAllowlist: {
			...normalizeTextList(params.setup.modelAllowlist.allowedKeys) ? { allowedKeys: normalizeTextList(params.setup.modelAllowlist.allowedKeys) } : {},
			...normalizeTextList(params.setup.modelAllowlist.initialSelections) ? { initialSelections: normalizeTextList(params.setup.modelAllowlist.initialSelections) } : {},
			...normalizeText(params.setup.modelAllowlist.message) ? { message: normalizeText(params.setup.modelAllowlist.message) } : {}
		} } : {}
	};
}
function normalizeProviderAuthMethods(params) {
	const seenMethodIds = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const method of params.auth) {
		const methodId = normalizeText(method.id);
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
		const wizard = normalizeProviderWizardSetup({
			providerId: params.providerId,
			pluginId: params.pluginId,
			source: params.source,
			auth: [{
				...method,
				id: methodId
			}],
			setup: method.wizard,
			pushDiagnostic: params.pushDiagnostic
		});
		normalized.push({
			...method,
			id: methodId,
			label: normalizeText(method.label) ?? methodId,
			...normalizeText(method.hint) ? { hint: normalizeText(method.hint) } : {},
			...wizard ? { wizard } : {}
		});
	}
	return normalized;
}
function normalizeProviderWizard(params) {
	if (!params.wizard) return;
	const hasAuthMethods = params.auth.length > 0;
	const hasMethod = (methodId) => Boolean(methodId && params.auth.some((method) => method.id === methodId));
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
		const methodId = normalizeText(modelPicker.methodId);
		if (methodId && !hasMethod(methodId)) pushProviderDiagnostic({
			level: "warn",
			pluginId: params.pluginId,
			source: params.source,
			message: `provider "${params.providerId}" model-picker method "${methodId}" not found; falling back to available methods`,
			pushDiagnostic: params.pushDiagnostic
		});
		return {
			...normalizeText(modelPicker.label) ? { label: normalizeText(modelPicker.label) } : {},
			...normalizeText(modelPicker.hint) ? { hint: normalizeText(modelPicker.hint) } : {},
			...methodId && hasMethod(methodId) ? { methodId } : {}
		};
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
	const id = normalizeText(params.provider.id);
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
	const docsPath = normalizeText(params.provider.docsPath);
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
		label: normalizeText(params.provider.label) ?? id,
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
//#region src/plugins/runtime/gateway-request-scope.ts
const pluginRuntimeGatewayRequestScope = resolveGlobalSingleton(Symbol.for("openclaw.pluginRuntimeGatewayRequestScope"), () => new AsyncLocalStorage());
/**
* Runs plugin gateway handlers with request-scoped context that runtime helpers can read.
*/
function withPluginRuntimeGatewayRequestScope(scope, run) {
	return pluginRuntimeGatewayRequestScope.run(scope, run);
}
/**
* Runs work under the current gateway request scope while attaching plugin identity.
*/
function withPluginRuntimePluginIdScope(pluginId, run) {
	const current = pluginRuntimeGatewayRequestScope.getStore();
	const scoped = current ? {
		...current,
		pluginId
	} : {
		pluginId,
		isWebchatConnect: () => false
	};
	return pluginRuntimeGatewayRequestScope.run(scoped, run);
}
/**
* Returns the current plugin gateway request scope when called from a plugin request handler.
*/
function getPluginRuntimeGatewayRequestScope() {
	return pluginRuntimeGatewayRequestScope.getStore();
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
		for (const event of normalizedEvents) registerInternalHook(event, handler);
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
		if (opts?.scope) {
			registry.gatewayMethodScopes ??= {};
			registry.gatewayMethodScopes[trimmed] = opts.scope;
		}
		record.gatewayMethods.push(trimmed);
	};
	const describeHttpRouteOwner = (entry) => {
		return `${entry.pluginId?.trim() || "unknown-plugin"} (${entry.source?.trim() || "unknown-source"})`;
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
			source: record.source
		});
	};
	const registerChannel = (record, registration, mode = "full") => {
		const plugin = (typeof registration.plugin === "object" ? registration : { plugin: registration }).plugin;
		const id = typeof plugin?.id === "string" ? plugin.id.trim() : String(plugin?.id ?? "").trim();
		if (!id) {
			pushDiagnostic({
				level: "error",
				pluginId: record.id,
				source: record.source,
				message: "channel registration missing id"
			});
			return;
		}
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
	const registerService = (record, service) => {
		const id = service.id.trim();
		if (!id) return;
		const existing = registry.services.find((entry) => entry.service.id === id);
		if (existing) {
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
					registerSpeechProvider: (provider) => registerSpeechProvider(record, provider),
					registerMediaUnderstandingProvider: (provider) => registerMediaUnderstandingProvider(record, provider),
					registerImageGenerationProvider: (provider) => registerImageGenerationProvider(record, provider),
					registerWebFetchProvider: (provider) => registerWebFetchProvider(record, provider),
					registerWebSearchProvider: (provider) => registerWebSearchProvider(record, provider),
					registerGatewayMethod: (method, handler, opts) => registerGatewayMethod(record, method, handler, opts),
					registerService: (service) => registerService(record, service),
					registerCliBackend: (backend) => registerCliBackend(record, backend),
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
						if (!result.ok) pushDiagnostic({
							level: "error",
							pluginId: record.id,
							source: record.source,
							message: `context engine already registered: ${id} (${result.existingOwner})`
						});
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
						if (!hasKind(record.kind, "memory")) {
							pushDiagnostic({
								level: "error",
								pluginId: record.id,
								source: record.source,
								message: "only memory plugins can register memory embedding providers"
							});
							return;
						}
						if (Array.isArray(record.kind) && record.kind.length > 1 && !record.memorySlotSelected) {
							pushDiagnostic({
								level: "warn",
								pluginId: record.id,
								source: record.source,
								message: "dual-kind plugin not selected for memory slot; skipping memory embedding provider registration"
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
		registerCliBackend,
		registerSpeechProvider,
		registerMediaUnderstandingProvider,
		registerImageGenerationProvider,
		registerWebSearchProvider,
		registerGatewayMethod,
		registerCli,
		registerService,
		registerCommand,
		registerHook,
		registerTypedHook
	};
}
//#endregion
//#region src/plugins/loader.ts
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
let pluginRegistryCacheEntryCap = 128;
const registryCache = /* @__PURE__ */ new Map();
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
function createPluginJitiLoader(options) {
	const jitiLoaders = /* @__PURE__ */ new Map();
	return (modulePath) => {
		const tryNative = shouldPreferNativeJiti(modulePath);
		const aliasMap = buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url, options.pluginSdkResolution);
		const cacheKey = JSON.stringify({
			tryNative,
			aliasMap: Object.entries(aliasMap).toSorted(([left], [right]) => left.localeCompare(right))
		});
		const cached = jitiLoaders.get(cacheKey);
		if (cached) return cached;
		const loader = createJiti(import.meta.url, {
			...buildPluginLoaderJitiOptions(aliasMap),
			tryNative
		});
		jitiLoaders.set(cacheKey, loader);
		return loader;
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
	const scopeKey = JSON.stringify(params.onlyPluginIds ?? []);
	const setupOnlyKey = params.includeSetupOnlyChannelPlugins === true ? "setup-only" : "runtime";
	const startupChannelMode = params.preferSetupRuntimeForChannelPlugins === true ? "prefer-setup" : "full";
	const moduleLoadMode = params.loadModules === false ? "manifest-only" : "load-modules";
	const gatewayMethodsKey = JSON.stringify(params.coreGatewayMethodNames ?? []);
	return `${roots.workspace ?? ""}::${roots.global ?? ""}::${roots.stock ?? ""}::${JSON.stringify({
		...params.plugins,
		installs,
		loadPaths,
		activationMetadataKey: params.activationMetadataKey ?? ""
	})}::${scopeKey}::${setupOnlyKey}::${startupChannelMode}::${moduleLoadMode}::${params.runtimeSubagentMode ?? "default"}::${params.pluginSdkResolution ?? "auto"}::${gatewayMethodsKey}`;
}
function normalizeScopedPluginIds(ids) {
	if (!ids) return;
	const normalized = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean))).toSorted();
	return normalized.length > 0 ? normalized : void 0;
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
	const enabledSourceChannels = Object.entries(params.sourceConfig?.channels ?? {}).filter(([, value]) => {
		if (!value || typeof value !== "object" || Array.isArray(value)) return false;
		return value.enabled === true;
	}).map(([channelId]) => channelId).toSorted((left, right) => left.localeCompare(right));
	const pluginEntryStates = Object.entries(params.sourcePlugins.entries).map(([pluginId, entry]) => [pluginId, entry?.enabled ?? null]).toSorted(([left], [right]) => left.localeCompare(right));
	const autoEnableReasonEntries = Object.entries(params.autoEnabledReasons).map(([pluginId, reasons]) => [pluginId, [...reasons]]).toSorted(([left], [right]) => left.localeCompare(right));
	return createHash("sha256").update(JSON.stringify({
		enabled: params.sourcePlugins.enabled,
		allow: params.sourcePlugins.allow,
		deny: params.sourcePlugins.deny,
		memorySlot: params.sourcePlugins.slots.memory,
		entries: pluginEntryStates,
		enabledChannels: enabledSourceChannels,
		autoEnabledReasons: autoEnableReasonEntries
	})).digest("hex");
}
function hasExplicitCompatibilityInputs(options) {
	return Boolean(options.config !== void 0 || options.activationSourceConfig !== void 0 || options.autoEnabledReasons !== void 0 || options.workspaceDir !== void 0 || options.env !== void 0 || options.onlyPluginIds?.length || options.runtimeOptions !== void 0 || options.pluginSdkResolution !== void 0 || options.coreGatewayHandlers !== void 0 || options.includeSetupOnlyChannelPlugins === true || options.preferSetupRuntimeForChannelPlugins === true || options.loadModules === false);
}
function resolvePluginLoadCacheContext(options = {}) {
	const env = options.env ?? process.env;
	const cfg = applyTestPluginDefaults(options.config ?? {}, env);
	const activationSourceConfig = options.activationSourceConfig ?? options.config ?? {};
	const normalized = normalizePluginsConfig(cfg.plugins);
	const activationSourceNormalized = normalizePluginsConfig(activationSourceConfig.plugins);
	const onlyPluginIds = normalizeScopedPluginIds(options.onlyPluginIds);
	const includeSetupOnlyChannelPlugins = options.includeSetupOnlyChannelPlugins === true;
	const preferSetupRuntimeForChannelPlugins = options.preferSetupRuntimeForChannelPlugins === true;
	const coreGatewayMethodNames = Object.keys(options.coreGatewayHandlers ?? {}).toSorted();
	const cacheKey = buildCacheKey({
		workspaceDir: options.workspaceDir,
		plugins: normalized,
		activationMetadataKey: buildActivationMetadataHash({
			sourcePlugins: activationSourceNormalized,
			sourceConfig: activationSourceConfig,
			autoEnabledReasons: options.autoEnabledReasons ?? {}
		}),
		installs: cfg.plugins?.installs,
		env,
		onlyPluginIds,
		includeSetupOnlyChannelPlugins,
		preferSetupRuntimeForChannelPlugins,
		loadModules: options.loadModules,
		runtimeSubagentMode: resolveRuntimeSubagentMode(options.runtimeOptions),
		pluginSdkResolution: options.pluginSdkResolution,
		coreGatewayMethodNames
	});
	return {
		env,
		cfg,
		normalized,
		activationSourceConfig,
		activationSourceNormalized,
		autoEnabledReasons: options.autoEnabledReasons ?? {},
		onlyPluginIds,
		includeSetupOnlyChannelPlugins,
		preferSetupRuntimeForChannelPlugins,
		shouldActivate: options.activate !== false,
		shouldLoadModules: options.loadModules !== false,
		runtimeSubagentMode: resolveRuntimeSubagentMode(options.runtimeOptions),
		cacheKey
	};
}
function getCompatibleActivePluginRegistry(options = {}) {
	const activeRegistry = getActivePluginRegistry() ?? void 0;
	if (!activeRegistry) return;
	if (!hasExplicitCompatibilityInputs(options)) return activeRegistry;
	const activeCacheKey = getActivePluginRegistryKey();
	if (!activeCacheKey) return;
	return resolvePluginLoadCacheContext(options).cacheKey === activeCacheKey ? activeRegistry : void 0;
}
function resolveRuntimePluginRegistry(options) {
	if (!options || !hasExplicitCompatibilityInputs(options)) return getCompatibleActivePluginRegistry();
	return getCompatibleActivePluginRegistry(options) ?? loadOpenClawPlugins(options);
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
	const resolved = moduleExport && typeof moduleExport === "object" && "default" in moduleExport ? moduleExport.default : moduleExport;
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
function resolveSetupChannelRegistration(moduleExport) {
	const resolved = moduleExport && typeof moduleExport === "object" && "default" in moduleExport ? moduleExport.default : moduleExport;
	if (!resolved || typeof resolved !== "object") return {};
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
		mediaUnderstandingProviderIds: [],
		imageGenerationProviderIds: [],
		webFetchProviderIds: [],
		webSearchProviderIds: [],
		gatewayMethods: [],
		cliCommands: [],
		services: [],
		commands: [],
		httpRoutes: 0,
		hookCount: 0,
		configSchema: params.configSchema,
		configUiHints: void 0,
		configJsonSchema: void 0
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
	params.registry.plugins.push(params.record);
	params.seenIds.set(params.pluginId, params.origin);
	params.registry.diagnostics.push({
		level: "error",
		pluginId: params.record.id,
		source: params.record.source,
		message: `${params.diagnosticMessagePrefix}${displayError}`
	});
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
		const trackedPaths = [install.installPath, install.sourcePath].map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
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
		params.logger.warn(`[plugins] ${plugin.id}: ${message} (${plugin.source})`);
	}
}
function activatePluginRegistry(registry, cacheKey, runtimeSubagentMode) {
	setActivePluginRegistry(registry, cacheKey, runtimeSubagentMode);
	initializeGlobalHookRunner(registry);
}
function loadOpenClawPlugins(options = {}) {
	if (options.activate === false && options.cache !== false) throw new Error("loadOpenClawPlugins: activate:false requires cache:false to prevent command registry divergence");
	const { env, cfg, normalized, activationSourceConfig, activationSourceNormalized, autoEnabledReasons, onlyPluginIds, includeSetupOnlyChannelPlugins, preferSetupRuntimeForChannelPlugins, shouldActivate, shouldLoadModules, cacheKey, runtimeSubagentMode } = resolvePluginLoadCacheContext(options);
	const logger = options.logger ?? defaultLogger();
	const validateOnly = options.mode === "validate";
	const onlyPluginIdSet = onlyPluginIds ? new Set(onlyPluginIds) : null;
	const cacheEnabled = options.cache !== false;
	if (cacheEnabled) {
		const cached = getCachedPluginRegistry(cacheKey);
		if (cached) {
			restoreRegisteredMemoryEmbeddingProviders(cached.memoryEmbeddingProviders);
			restoreMemoryPluginState({
				promptBuilder: cached.memoryPromptBuilder,
				flushPlanResolver: cached.memoryFlushPlanResolver,
				runtime: cached.memoryRuntime
			});
			if (shouldActivate) activatePluginRegistry(cached.registry, cacheKey, runtimeSubagentMode);
			return cached.registry;
		}
	}
	if (shouldActivate) {
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
		const runtimeModule = getJiti(runtimeModulePath)(runtimeModulePath);
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
	const { registry, createApi } = createPluginRegistry({
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
			sourceConfig: activationSourceNormalized,
			sourceRootConfig: activationSourceConfig,
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
				configSchema: Boolean(manifestRecord.configSchema)
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
			enabledByDefault: manifestRecord.enabledByDefault
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
			configSchema: Boolean(manifestRecord.configSchema)
		});
		record.kind = manifestRecord.kind;
		record.configUiHints = manifestRecord.configUiHints;
		record.configJsonSchema = manifestRecord.configSchema;
		const pushPluginLoadError = (message) => {
			record.status = "error";
			record.error = message;
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
		fsSync.closeSync(opened.fd);
		let mod = null;
		try {
			recordImportedPluginId(record.id);
			mod = getJiti(safeSource)(safeSource);
		} catch (err) {
			recordPluginError({
				logger,
				registry,
				record,
				seenIds,
				pluginId,
				origin: candidate.origin,
				error: err,
				logPrefix: `[plugins] ${record.id} failed to load from ${record.source}: `,
				diagnosticMessagePrefix: "failed to load plugin: "
			});
			continue;
		}
		if ((registrationMode === "setup-only" || registrationMode === "setup-runtime") && manifestRecord.setupSource) {
			const setupRegistration = resolveSetupChannelRegistration(mod);
			if (setupRegistration.plugin) {
				if (setupRegistration.plugin.id && setupRegistration.plugin.id !== record.id) {
					pushPluginLoadError(`plugin id mismatch (config uses "${record.id}", setup export uses "${setupRegistration.plugin.id}")`);
					continue;
				}
				createApi(record, {
					config: cfg,
					pluginConfig: {},
					hookPolicy: entry?.hooks,
					registrationMode
				}).registerChannel(setupRegistration.plugin);
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
		const previousMemoryEmbeddingProviders = listRegisteredMemoryEmbeddingProviders();
		const previousMemoryFlushPlanResolver = getMemoryFlushPlanResolver();
		const previousMemoryPromptBuilder = getMemoryPromptSectionBuilder();
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
				restoreRegisteredMemoryEmbeddingProviders(previousMemoryEmbeddingProviders);
				restoreMemoryPluginState({
					promptBuilder: previousMemoryPromptBuilder,
					flushPlanResolver: previousMemoryFlushPlanResolver,
					runtime: previousMemoryRuntime
				});
			}
			registry.plugins.push(record);
			seenIds.set(pluginId, candidate.origin);
		} catch (err) {
			restoreRegisteredMemoryEmbeddingProviders(previousMemoryEmbeddingProviders);
			restoreMemoryPluginState({
				promptBuilder: previousMemoryPromptBuilder,
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
		logger,
		env
	});
	maybeThrowOnPluginLoadError(registry, options.throwOnLoadError);
	if (cacheEnabled) setCachedPluginRegistry(cacheKey, {
		registry,
		memoryEmbeddingProviders: listRegisteredMemoryEmbeddingProviders(),
		memoryFlushPlanResolver: getMemoryFlushPlanResolver(),
		memoryPromptBuilder: getMemoryPromptSectionBuilder(),
		memoryRuntime: getMemoryRuntime()
	});
	if (shouldActivate) activatePluginRegistry(registry, cacheKey, runtimeSubagentMode);
	return registry;
}
async function loadOpenClawPluginCliRegistry(options = {}) {
	const { env, cfg, normalized, activationSourceConfig, activationSourceNormalized, autoEnabledReasons, onlyPluginIds, cacheKey } = resolvePluginLoadCacheContext({
		...options,
		activate: false,
		cache: false
	});
	const logger = options.logger ?? defaultLogger();
	const onlyPluginIdSet = onlyPluginIds ? new Set(onlyPluginIds) : null;
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
			sourceConfig: activationSourceNormalized,
			sourceRootConfig: activationSourceConfig,
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
				configSchema: Boolean(manifestRecord.configSchema)
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
			enabledByDefault: manifestRecord.enabledByDefault
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
			configSchema: Boolean(manifestRecord.configSchema)
		});
		record.kind = manifestRecord.kind;
		record.configUiHints = manifestRecord.configUiHints;
		record.configJsonSchema = manifestRecord.configSchema;
		const pushPluginLoadError = (message) => {
			record.status = "error";
			record.error = message;
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
		const opened = openBoundaryFileSync({
			absolutePath: candidate.source,
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
		fsSync.closeSync(opened.fd);
		let mod = null;
		try {
			mod = getJiti(safeSource)(safeSource);
		} catch (err) {
			recordPluginError({
				logger,
				registry,
				record,
				seenIds,
				pluginId,
				origin: candidate.origin,
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
		return fsSync.realpathSync(value);
	} catch {
		return path.resolve(value);
	}
}
//#endregion
export { withPluginRuntimeGatewayRequestScope as a, loadEnabledBundleMcpConfig as c, readBundleJsonObject as d, getPluginRuntimeGatewayRequestScope as i, inspectBundleServerRuntimeSupport as l, loadOpenClawPlugins as n, extractMcpServerMap as o, resolveRuntimePluginRegistry as r, inspectBundleMcpRuntimeSupport as s, loadOpenClawPluginCliRegistry as t, loadEnabledBundleConfig as u };
