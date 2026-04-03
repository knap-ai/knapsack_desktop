import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-LPHTYrMX.js";
import { y as createEmptyPluginRegistry } from "./runtime-DZz1f0_h.js";
import { d as buildPluginLoaderJitiOptions, g as shouldPreferNativeJiti, u as buildPluginLoaderAliasMap } from "./chat-meta-Cdrnv7R-.js";
import { o as BUNDLED_WEB_SEARCH_PLUGIN_IDS, s as BUNDLED_WEB_SEARCH_PROVIDER_PLUGIN_IDS } from "./bundled-capability-metadata-D5qf8V45.js";
import { a as normalizePluginsConfig } from "./config-state-zclcq4hc.js";
import { n as withBundledPluginEnablementCompat, r as withBundledPluginVitestCompat, t as withBundledPluginAllowlistCompat } from "./bundled-compat-Qt2_tpRE.js";
import { i as discoverOpenClawPlugins, n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { t as buildPluginApi } from "./api-builder-DJbipBVf.js";
import { fileURLToPath } from "node:url";
import fsSync from "node:fs";
import { createJiti } from "jiti";
//#region src/plugins/bundled-web-search-provider-ids.ts
function resolveBundledWebSearchPluginId$1(providerId) {
	if (!providerId) return;
	const normalizedProviderId = providerId.trim().toLowerCase();
	if (!(normalizedProviderId in BUNDLED_WEB_SEARCH_PROVIDER_PLUGIN_IDS)) return;
	return BUNDLED_WEB_SEARCH_PROVIDER_PLUGIN_IDS[normalizedProviderId];
}
//#endregion
//#region src/plugins/captured-registration.ts
function createCapturedPluginRegistration(params) {
	const providers = [];
	const cliRegistrars = [];
	const cliBackends = [];
	const speechProviders = [];
	const mediaUnderstandingProviders = [];
	const imageGenerationProviders = [];
	const webFetchProviders = [];
	const webSearchProviders = [];
	const tools = [];
	return {
		providers,
		cliRegistrars,
		cliBackends,
		speechProviders,
		mediaUnderstandingProviders,
		imageGenerationProviders,
		webFetchProviders,
		webSearchProviders,
		tools,
		api: buildPluginApi({
			id: "captured-plugin-registration",
			name: "Captured Plugin Registration",
			source: "captured-plugin-registration",
			registrationMode: params?.registrationMode ?? "full",
			config: params?.config ?? {},
			runtime: {},
			logger: {
				info() {},
				warn() {},
				error() {},
				debug() {}
			},
			resolvePath: (input) => input,
			handlers: {
				registerCli(registrar, opts) {
					const descriptors = (opts?.descriptors ?? []).map((descriptor) => ({
						name: descriptor.name.trim(),
						description: descriptor.description.trim(),
						hasSubcommands: descriptor.hasSubcommands
					})).filter((descriptor) => descriptor.name && descriptor.description);
					const commands = [...opts?.commands ?? [], ...descriptors.map((descriptor) => descriptor.name)].map((command) => command.trim()).filter(Boolean);
					if (commands.length === 0) return;
					cliRegistrars.push({
						register: registrar,
						commands,
						descriptors
					});
				},
				registerProvider(provider) {
					providers.push(provider);
				},
				registerCliBackend(backend) {
					cliBackends.push(backend);
				},
				registerSpeechProvider(provider) {
					speechProviders.push(provider);
				},
				registerMediaUnderstandingProvider(provider) {
					mediaUnderstandingProviders.push(provider);
				},
				registerImageGenerationProvider(provider) {
					imageGenerationProviders.push(provider);
				},
				registerWebFetchProvider(provider) {
					webFetchProviders.push(provider);
				},
				registerWebSearchProvider(provider) {
					webSearchProviders.push(provider);
				},
				registerTool(tool) {
					if (typeof tool !== "function") tools.push(tool);
				}
			}
		})
	};
}
function capturePluginRegistration(params) {
	const captured = createCapturedPluginRegistration();
	params.register(captured.api);
	return captured;
}
//#endregion
//#region src/plugins/bundled-capability-runtime.ts
const log = createSubsystemLogger("plugins");
function applyVitestCapabilityAliasOverrides(params) {
	if (!params.env?.VITEST || params.pluginSdkResolution !== "dist") return params.aliasMap;
	const { ["openclaw/plugin-sdk"]: _ignoredRootAlias, ...scopedAliasMap } = params.aliasMap;
	return {
		...scopedAliasMap,
		"openclaw/plugin-sdk/llm-task": fileURLToPath(new URL("./capability-runtime-vitest-shims/llm-task.ts", import.meta.url)),
		"openclaw/plugin-sdk/config-runtime": fileURLToPath(new URL("./capability-runtime-vitest-shims/config-runtime.ts", import.meta.url)),
		"openclaw/plugin-sdk/media-runtime": fileURLToPath(new URL("./capability-runtime-vitest-shims/media-runtime.ts", import.meta.url)),
		"openclaw/plugin-sdk/provider-onboard": fileURLToPath(new URL("../plugin-sdk/provider-onboard.ts", import.meta.url)),
		"openclaw/plugin-sdk/speech-core": fileURLToPath(new URL("./capability-runtime-vitest-shims/speech-core.ts", import.meta.url))
	};
}
function buildBundledCapabilityRuntimeConfig(pluginIds, env) {
	return withBundledPluginVitestCompat({
		config: withBundledPluginEnablementCompat({
			config: void 0,
			pluginIds
		}),
		pluginIds,
		env
	});
}
function resolvePluginModuleExport(moduleExport) {
	const resolved = moduleExport && typeof moduleExport === "object" && "default" in moduleExport ? moduleExport.default : moduleExport;
	if (typeof resolved === "function") return { register: resolved };
	if (resolved && typeof resolved === "object") {
		const definition = resolved;
		return {
			definition,
			register: definition.register ?? definition.activate
		};
	}
	return {};
}
function createCapabilityPluginRecord(params) {
	return {
		id: params.id,
		name: params.name ?? params.id,
		version: params.version,
		description: params.description,
		source: params.source,
		rootDir: params.rootDir,
		origin: "bundled",
		workspaceDir: params.workspaceDir,
		enabled: true,
		status: "loaded",
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
		configSchema: true
	};
}
function recordCapabilityLoadError(registry, record, message) {
	record.status = "error";
	record.error = message;
	registry.plugins.push(record);
	registry.diagnostics.push({
		level: "error",
		pluginId: record.id,
		source: record.source,
		message: `failed to load plugin: ${message}`
	});
	log.error(`[plugins] ${record.id} failed to load from ${record.source}: ${message}`);
}
function loadBundledCapabilityRuntimeRegistry(params) {
	const env = params.env ?? process.env;
	const pluginIds = new Set(params.pluginIds);
	const registry = createEmptyPluginRegistry();
	const jitiLoaders = /* @__PURE__ */ new Map();
	const getJiti = (modulePath) => {
		const tryNative = shouldPreferNativeJiti(modulePath) && !(env?.VITEST && params.pluginSdkResolution === "dist");
		const aliasMap = applyVitestCapabilityAliasOverrides({
			aliasMap: buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url, params.pluginSdkResolution),
			pluginSdkResolution: params.pluginSdkResolution,
			env
		});
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
	const discovery = discoverOpenClawPlugins({
		cache: false,
		env
	});
	const manifestRegistry = loadPluginManifestRegistry({
		config: buildBundledCapabilityRuntimeConfig(params.pluginIds, env),
		cache: false,
		env,
		candidates: discovery.candidates,
		diagnostics: discovery.diagnostics
	});
	registry.diagnostics.push(...manifestRegistry.diagnostics);
	const manifestByRoot = new Map(manifestRegistry.plugins.map((record) => [record.rootDir, record]));
	const seenPluginIds = /* @__PURE__ */ new Set();
	for (const candidate of discovery.candidates) {
		const manifest = manifestByRoot.get(candidate.rootDir);
		if (!manifest || manifest.origin !== "bundled" || !pluginIds.has(manifest.id)) continue;
		if (seenPluginIds.has(manifest.id)) continue;
		seenPluginIds.add(manifest.id);
		const record = createCapabilityPluginRecord({
			id: manifest.id,
			name: manifest.name,
			description: manifest.description,
			version: manifest.version,
			source: candidate.source,
			rootDir: candidate.rootDir,
			workspaceDir: candidate.workspaceDir
		});
		const opened = openBoundaryFileSync({
			absolutePath: candidate.source,
			rootPath: candidate.rootDir,
			boundaryLabel: "plugin root",
			rejectHardlinks: false,
			skipLexicalRootCheck: true
		});
		if (!opened.ok) {
			recordCapabilityLoadError(registry, record, "plugin entry path escapes plugin root or fails alias checks");
			continue;
		}
		const safeSource = opened.path;
		fsSync.closeSync(opened.fd);
		let mod = null;
		try {
			mod = getJiti(safeSource)(safeSource);
		} catch (error) {
			recordCapabilityLoadError(registry, record, String(error));
			continue;
		}
		const register = resolvePluginModuleExport(mod).register;
		if (typeof register !== "function") {
			record.status = "disabled";
			record.error = "plugin export missing register(api)";
			registry.plugins.push(record);
			continue;
		}
		try {
			const captured = createCapturedPluginRegistration();
			register(captured.api);
			record.cliBackendIds.push(...captured.cliBackends.map((entry) => entry.id));
			record.providerIds.push(...captured.providers.map((entry) => entry.id));
			record.speechProviderIds.push(...captured.speechProviders.map((entry) => entry.id));
			record.mediaUnderstandingProviderIds.push(...captured.mediaUnderstandingProviders.map((entry) => entry.id));
			record.imageGenerationProviderIds.push(...captured.imageGenerationProviders.map((entry) => entry.id));
			record.webFetchProviderIds.push(...captured.webFetchProviders.map((entry) => entry.id));
			record.webSearchProviderIds.push(...captured.webSearchProviders.map((entry) => entry.id));
			record.toolNames.push(...captured.tools.map((entry) => entry.name));
			registry.cliBackends?.push(...captured.cliBackends.map((backend) => ({
				pluginId: record.id,
				pluginName: record.name,
				backend,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.providers.push(...captured.providers.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.speechProviders.push(...captured.speechProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.mediaUnderstandingProviders.push(...captured.mediaUnderstandingProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.imageGenerationProviders.push(...captured.imageGenerationProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.webFetchProviders.push(...captured.webFetchProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.webSearchProviders.push(...captured.webSearchProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.tools.push(...captured.tools.map((tool) => ({
				pluginId: record.id,
				pluginName: record.name,
				factory: () => tool,
				names: [tool.name],
				optional: false,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.plugins.push(record);
		} catch (error) {
			recordCapabilityLoadError(registry, record, String(error));
		}
	}
	return registry;
}
//#endregion
//#region src/plugins/bundled-web-search.ts
let bundledWebSearchProvidersCache = null;
function loadBundledWebSearchProviders() {
	if (!bundledWebSearchProvidersCache) bundledWebSearchProvidersCache = loadBundledCapabilityRuntimeRegistry({
		pluginIds: BUNDLED_WEB_SEARCH_PLUGIN_IDS,
		pluginSdkResolution: "dist"
	}).webSearchProviders.map((entry) => ({
		pluginId: entry.pluginId,
		...entry.provider
	}));
	return bundledWebSearchProvidersCache;
}
function resolveBundledWebSearchPluginIds(params) {
	const bundledWebSearchPluginIdSet = new Set(BUNDLED_WEB_SEARCH_PLUGIN_IDS);
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => plugin.origin === "bundled" && bundledWebSearchPluginIdSet.has(plugin.id)).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function listBundledWebSearchProviders() {
	return loadBundledWebSearchProviders();
}
function resolveBundledWebSearchPluginId(providerId) {
	return resolveBundledWebSearchPluginId$1(providerId);
}
//#endregion
//#region src/plugins/web-search-providers.shared.ts
function resolveBundledWebSearchCompatPluginIds(params) {
	return resolveBundledWebSearchPluginIds({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
}
function compareWebSearchProvidersAlphabetically(left, right) {
	return left.id.localeCompare(right.id) || left.pluginId.localeCompare(right.pluginId);
}
function sortWebSearchProviders(providers) {
	return providers.toSorted(compareWebSearchProvidersAlphabetically);
}
function sortWebSearchProvidersForAutoDetect(providers) {
	return providers.toSorted((left, right) => {
		const leftOrder = left.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
		const rightOrder = right.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
		if (leftOrder !== rightOrder) return leftOrder - rightOrder;
		return compareWebSearchProvidersAlphabetically(left, right);
	});
}
function resolveBundledWebSearchResolutionConfig(params) {
	const autoEnabled = params.config !== void 0 ? applyPluginAutoEnable({
		config: params.config,
		env: params.env ?? process.env
	}) : void 0;
	const autoEnabledConfig = autoEnabled?.config;
	const bundledCompatPluginIds = resolveBundledWebSearchCompatPluginIds({
		config: autoEnabledConfig,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const config = withBundledPluginVitestCompat({
		config: withBundledPluginEnablementCompat({
			config: params.bundledAllowlistCompat ? withBundledPluginAllowlistCompat({
				config: autoEnabledConfig,
				pluginIds: bundledCompatPluginIds
			}) : autoEnabledConfig,
			pluginIds: bundledCompatPluginIds
		}),
		pluginIds: bundledCompatPluginIds,
		env: params.env
	});
	return {
		config,
		normalized: normalizePluginsConfig(config?.plugins),
		activationSourceConfig: params.config,
		autoEnabledReasons: autoEnabled?.autoEnabledReasons ?? {}
	};
}
//#endregion
export { resolveBundledWebSearchPluginId as a, resolveBundledWebSearchPluginId$1 as c, listBundledWebSearchProviders as i, sortWebSearchProviders as n, loadBundledCapabilityRuntimeRegistry as o, sortWebSearchProvidersForAutoDetect as r, capturePluginRegistration as s, resolveBundledWebSearchResolutionConfig as t };
