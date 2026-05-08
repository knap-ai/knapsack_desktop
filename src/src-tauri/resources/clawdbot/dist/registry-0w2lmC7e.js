import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-C8TEdk8a.js";
import { n as PLUGIN_MANIFEST_FILENAME } from "./manifest-DkU_xlZi.js";
import { n as discoverOpenClawPlugins } from "./discovery-CRcfnviq.js";
import { i as resolveBundledPluginRepoEntryPath, o as normalizeBundledPluginStringList, s as resolveBundledPluginScanDir } from "./bundled-plugin-metadata-Ds2SxpYG.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-DLO0UJX_.js";
import { g as shouldPreferNativeJiti, l as resolveLoaderPackageRoot, t as buildPluginLoaderAliasMap } from "./sdk-alias-Cx73ipZ2.js";
import { t as unwrapDefaultModuleExport } from "./module-export-f8zoIwaD.js";
import { t as loadBundledPluginPublicArtifactModuleSync } from "./public-surface-loader-Q3U25ebK.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-CXpW6f0a.js";
import { s as resolveManifestContractPluginIds } from "./plugin-registry-CZ8QXP5l.js";
import { n as withBundledPluginEnablementCompat, r as withBundledPluginVitestCompat } from "./bundled-compat-Cvu6moXL.js";
import { S as createEmptyPluginRegistry } from "./runtime-Df1Zlb_-.js";
import { n as createCapturedPluginRegistration } from "./captured-registration-CGYbgBF2.js";
import { i as resolveBundledExplicitWebSearchProvidersFromPublicArtifacts } from "./web-provider-public-artifacts.explicit-DCyC9WCL.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/bundled-capability-runtime.ts
const log = createSubsystemLogger("plugins");
const CAPABILITY_VITEST_SHIM_ALIASES = [
	{
		subpath: "llm-task",
		target: new URL("./capability-runtime-vitest-shims/llm-task.ts", import.meta.url)
	},
	{
		subpath: "config-runtime",
		target: new URL("./capability-runtime-vitest-shims/config-runtime.ts", import.meta.url)
	},
	{
		subpath: "media-runtime",
		target: new URL("./capability-runtime-vitest-shims/media-runtime.ts", import.meta.url)
	},
	{
		subpath: "provider-onboard",
		target: new URL("../plugin-sdk/provider-onboard.ts", import.meta.url)
	},
	{
		subpath: "speech-core",
		target: new URL("./capability-runtime-vitest-shims/speech-core.ts", import.meta.url)
	}
];
function buildVitestCapabilityShimAliasMap() {
	return Object.fromEntries(CAPABILITY_VITEST_SHIM_ALIASES.flatMap(({ subpath, target }) => {
		const targetPath = fileURLToPath(target);
		return [[`openclaw/plugin-sdk/${subpath}`, targetPath], [`@openclaw/plugin-sdk/${subpath}`, targetPath]];
	}));
}
function applyVitestCapabilityAliasOverrides(params) {
	if (!params.env?.VITEST || params.pluginSdkResolution !== "dist") return params.aliasMap;
	const { "openclaw/plugin-sdk": _ignoredLegacyRootAlias, "@openclaw/plugin-sdk": _ignoredScopedRootAlias, ...scopedAliasMap } = params.aliasMap;
	return {
		...scopedAliasMap,
		...buildVitestCapabilityShimAliasMap()
	};
}
function shouldApplyVitestCapabilityAliasOverrides(params) {
	return Boolean(params.env?.VITEST && params.pluginSdkResolution === "dist");
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
	const resolved = unwrapDefaultModuleExport(moduleExport);
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
		realtimeTranscriptionProviderIds: [],
		realtimeVoiceProviderIds: [],
		mediaUnderstandingProviderIds: [],
		imageGenerationProviderIds: [],
		videoGenerationProviderIds: [],
		musicGenerationProviderIds: [],
		webFetchProviderIds: [],
		webSearchProviderIds: [],
		migrationProviderIds: [],
		memoryEmbeddingProviderIds: [],
		agentHarnessIds: [],
		gatewayMethods: [],
		cliCommands: [],
		services: [],
		gatewayDiscoveryServiceIds: [],
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
		const aliasMap = shouldApplyVitestCapabilityAliasOverrides({
			pluginSdkResolution: params.pluginSdkResolution,
			env
		}) ? applyVitestCapabilityAliasOverrides({
			aliasMap: buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url, params.pluginSdkResolution),
			pluginSdkResolution: params.pluginSdkResolution,
			env
		}) : void 0;
		return getCachedPluginJitiLoader({
			cache: jitiLoaders,
			modulePath,
			importerUrl: import.meta.url,
			jitiFilename: import.meta.url,
			...aliasMap ? { aliasMap } : {},
			pluginSdkResolution: params.pluginSdkResolution,
			tryNative
		});
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
	const repoRoot = process.cwd();
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
			source: env?.VITEST && params.pluginSdkResolution === "dist" ? resolveBundledPluginRepoEntryPath({
				rootDir: repoRoot,
				pluginId: manifest.id,
				preferBuilt: true
			}) ?? candidate.source : candidate.source,
			rootDir: candidate.rootDir,
			workspaceDir: candidate.workspaceDir
		});
		const opened = openBoundaryFileSync({
			absolutePath: record.source,
			rootPath: record.source === candidate.source ? candidate.rootDir : repoRoot,
			boundaryLabel: record.source === candidate.source ? "plugin root" : "repo root",
			rejectHardlinks: false,
			skipLexicalRootCheck: true
		});
		if (!opened.ok) {
			recordCapabilityLoadError(registry, record, "plugin entry path escapes plugin root or fails alias checks");
			continue;
		}
		const safeSource = opened.path;
		fs.closeSync(opened.fd);
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
			record.realtimeTranscriptionProviderIds.push(...captured.realtimeTranscriptionProviders.map((entry) => entry.id));
			record.realtimeVoiceProviderIds.push(...captured.realtimeVoiceProviders.map((entry) => entry.id));
			record.mediaUnderstandingProviderIds.push(...captured.mediaUnderstandingProviders.map((entry) => entry.id));
			record.imageGenerationProviderIds.push(...captured.imageGenerationProviders.map((entry) => entry.id));
			record.videoGenerationProviderIds.push(...captured.videoGenerationProviders.map((entry) => entry.id));
			record.musicGenerationProviderIds.push(...captured.musicGenerationProviders.map((entry) => entry.id));
			record.webFetchProviderIds.push(...captured.webFetchProviders.map((entry) => entry.id));
			record.webSearchProviderIds.push(...captured.webSearchProviders.map((entry) => entry.id));
			record.migrationProviderIds.push(...captured.migrationProviders.map((entry) => entry.id));
			record.memoryEmbeddingProviderIds.push(...captured.memoryEmbeddingProviders.map((entry) => entry.id));
			record.agentHarnessIds.push(...captured.agentHarnesses.map((entry) => entry.id));
			record.toolNames.push(...captured.tools.map((entry) => entry.name));
			registry.cliBackends?.push(...captured.cliBackends.map((backend) => ({
				pluginId: record.id,
				pluginName: record.name,
				backend,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.textTransforms.push(...captured.textTransforms.map((transforms) => ({
				pluginId: record.id,
				pluginName: record.name,
				transforms,
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
			registry.realtimeTranscriptionProviders.push(...captured.realtimeTranscriptionProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.realtimeVoiceProviders.push(...captured.realtimeVoiceProviders.map((provider) => ({
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
			registry.videoGenerationProviders.push(...captured.videoGenerationProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.musicGenerationProviders.push(...captured.musicGenerationProviders.map((provider) => ({
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
			registry.migrationProviders.push(...captured.migrationProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.memoryEmbeddingProviders.push(...captured.memoryEmbeddingProviders.map((provider) => ({
				pluginId: record.id,
				pluginName: record.name,
				provider,
				source: record.source,
				rootDir: record.rootDir
			})));
			registry.agentHarnesses.push(...captured.agentHarnesses.map((harness) => ({
				pluginId: record.id,
				pluginName: record.name,
				harness,
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
//#region src/plugins/provider-contract-public-artifacts.ts
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isProviderPlugin(value) {
	return isRecord(value) && typeof value.id === "string" && typeof value.label === "string" && Array.isArray(value.auth);
}
function tryLoadProviderContractApi(pluginId) {
	try {
		return loadBundledPluginPublicArtifactModuleSync({
			dirName: pluginId,
			artifactBasename: "provider-contract-api.js"
		});
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("Unable to resolve bundled plugin public surface ")) return null;
		throw error;
	}
}
function collectProviderContractEntries(params) {
	const providers = [];
	for (const [name, exported] of Object.entries(params.mod).toSorted(([left], [right]) => left.localeCompare(right))) {
		if (typeof exported !== "function" || exported.length !== 0 || !name.startsWith("create") || !name.endsWith("Provider")) continue;
		const candidate = exported();
		if (isProviderPlugin(candidate)) providers.push({
			pluginId: params.pluginId,
			provider: candidate
		});
	}
	return providers;
}
function resolveBundledExplicitProviderContractsFromPublicArtifacts(params) {
	const providers = [];
	for (const pluginId of [...new Set(params.onlyPluginIds)].toSorted((left, right) => left.localeCompare(right))) {
		const mod = tryLoadProviderContractApi(pluginId);
		if (!mod) return null;
		const entries = collectProviderContractEntries({
			pluginId,
			mod
		});
		if (entries.length === 0) return null;
		providers.push(...entries);
	}
	return providers;
}
//#endregion
//#region src/plugins/contracts/shared.ts
function uniqueStrings(values, normalize = (value) => value) {
	const result = [];
	const seen = /* @__PURE__ */ new Set();
	for (const value of values ?? []) {
		const normalized = normalize(value);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		result.push(normalized);
	}
	return result;
}
//#endregion
//#region src/plugins/contracts/inventory/bundled-capability-metadata.ts
const CURRENT_MODULE_PATH = fileURLToPath(import.meta.url);
const OPENCLAW_PACKAGE_ROOT = resolveLoaderPackageRoot({
	modulePath: CURRENT_MODULE_PATH,
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../../../..", import.meta.url));
const RUNNING_FROM_BUILT_ARTIFACT = CURRENT_MODULE_PATH.includes(`${path.sep}dist${path.sep}`) || CURRENT_MODULE_PATH.includes(`${path.sep}dist-runtime${path.sep}`);
function readJsonRecord(filePath) {
	try {
		const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : void 0;
	} catch {
		return;
	}
}
function readBundledCapabilityManifest(pluginDir) {
	const packageJson = readJsonRecord(path.join(pluginDir, "package.json"));
	if (normalizeBundledPluginStringList(packageJson?.openclaw && typeof packageJson.openclaw === "object" ? packageJson.openclaw.extensions : void 0).length === 0) return;
	const raw = readJsonRecord(path.join(pluginDir, PLUGIN_MANIFEST_FILENAME));
	if (!(typeof raw?.id === "string" ? raw.id.trim() : "")) return;
	return raw;
}
function listBundledCapabilityManifests() {
	const scanDir = resolveBundledPluginScanDir({
		packageRoot: OPENCLAW_PACKAGE_ROOT,
		runningFromBuiltArtifact: RUNNING_FROM_BUILT_ARTIFACT
	});
	if (!scanDir) return [];
	return fs.readdirSync(scanDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => readBundledCapabilityManifest(path.join(scanDir, entry.name))).filter((manifest) => manifest !== void 0).toSorted((left, right) => left.id.localeCompare(right.id));
}
const BUNDLED_CAPABILITY_MANIFESTS = listBundledCapabilityManifests();
function normalizeStringListRecord(record) {
	if (!record || typeof record !== "object" || Array.isArray(record)) return {};
	return Object.fromEntries(Object.entries(record).map(([key, values]) => [key.trim(), uniqueStrings(Array.isArray(values) ? values : [], (value) => typeof value === "string" ? value.trim() : "")]).filter(([key, values]) => key && values.length > 0).toSorted(([left], [right]) => left.localeCompare(right)));
}
function buildBundledPluginContractSnapshot(manifest) {
	return {
		pluginId: manifest.id,
		cliBackendIds: uniqueStrings(manifest.cliBackends, (value) => value.trim()),
		providerIds: uniqueStrings(manifest.providers, (value) => value.trim()),
		providerAuthEnvVars: normalizeStringListRecord(manifest.providerAuthEnvVars),
		speechProviderIds: uniqueStrings(manifest.contracts?.speechProviders, (value) => value.trim()),
		realtimeTranscriptionProviderIds: uniqueStrings(manifest.contracts?.realtimeTranscriptionProviders, (value) => value.trim()),
		realtimeVoiceProviderIds: uniqueStrings(manifest.contracts?.realtimeVoiceProviders, (value) => value.trim()),
		mediaUnderstandingProviderIds: uniqueStrings(manifest.contracts?.mediaUnderstandingProviders, (value) => value.trim()),
		documentExtractorIds: uniqueStrings(manifest.contracts?.documentExtractors, (value) => value.trim()),
		imageGenerationProviderIds: uniqueStrings(manifest.contracts?.imageGenerationProviders, (value) => value.trim()),
		videoGenerationProviderIds: uniqueStrings(manifest.contracts?.videoGenerationProviders, (value) => value.trim()),
		musicGenerationProviderIds: uniqueStrings(manifest.contracts?.musicGenerationProviders, (value) => value.trim()),
		webContentExtractorIds: uniqueStrings(manifest.contracts?.webContentExtractors, (value) => value.trim()),
		webFetchProviderIds: uniqueStrings(manifest.contracts?.webFetchProviders, (value) => value.trim()),
		webSearchProviderIds: uniqueStrings(manifest.contracts?.webSearchProviders, (value) => value.trim()),
		migrationProviderIds: uniqueStrings(manifest.contracts?.migrationProviders, (value) => value.trim()),
		toolNames: uniqueStrings(manifest.contracts?.tools, (value) => value.trim())
	};
}
function hasBundledPluginContractSnapshotCapabilities(entry) {
	return entry.cliBackendIds.length > 0 || entry.providerIds.length > 0 || entry.speechProviderIds.length > 0 || entry.realtimeTranscriptionProviderIds.length > 0 || entry.realtimeVoiceProviderIds.length > 0 || entry.mediaUnderstandingProviderIds.length > 0 || entry.documentExtractorIds.length > 0 || entry.imageGenerationProviderIds.length > 0 || entry.videoGenerationProviderIds.length > 0 || entry.musicGenerationProviderIds.length > 0 || entry.webContentExtractorIds.length > 0 || entry.webFetchProviderIds.length > 0 || entry.webSearchProviderIds.length > 0 || entry.migrationProviderIds.length > 0 || entry.toolNames.length > 0;
}
const BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS = BUNDLED_CAPABILITY_MANIFESTS.map(buildBundledPluginContractSnapshot).filter(hasBundledPluginContractSnapshotCapabilities).toSorted((left, right) => left.pluginId.localeCompare(right.pluginId));
Object.fromEntries(BUNDLED_CAPABILITY_MANIFESTS.flatMap((manifest) => (manifest.legacyPluginIds ?? []).map((legacyPluginId) => [legacyPluginId, manifest.id])).toSorted(([left], [right]) => left.localeCompare(right)));
Object.fromEntries(BUNDLED_CAPABILITY_MANIFESTS.flatMap((manifest) => (manifest.autoEnableWhenConfiguredProviders ?? []).map((providerId) => [providerId, manifest.id])).toSorted(([left], [right]) => left.localeCompare(right)));
//#endregion
//#region src/plugins/contracts/speech-vitest-registry.ts
const VITEST_CONTRACT_PLUGIN_IDS = {
	imageGenerationProviders: BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.imageGenerationProviderIds.length > 0).map((entry) => entry.pluginId),
	speechProviders: BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.speechProviderIds.length > 0).map((entry) => entry.pluginId),
	mediaUnderstandingProviders: BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.mediaUnderstandingProviderIds.length > 0).map((entry) => entry.pluginId),
	realtimeVoiceProviders: BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.realtimeVoiceProviderIds.length > 0).map((entry) => entry.pluginId),
	realtimeTranscriptionProviders: BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.realtimeTranscriptionProviderIds.length > 0).map((entry) => entry.pluginId),
	videoGenerationProviders: BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.videoGenerationProviderIds.length > 0).map((entry) => entry.pluginId),
	musicGenerationProviders: BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.musicGenerationProviderIds.length > 0).map((entry) => entry.pluginId)
};
function loadVitestVideoGenerationFallbackEntries(pluginIds) {
	return loadVitestCapabilityContractEntries({
		contract: "videoGenerationProviders",
		pluginSdkResolution: "src",
		pluginIds,
		pickEntries: (registry) => registry.videoGenerationProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
}
function loadVitestMusicGenerationFallbackEntries(pluginIds) {
	return loadVitestCapabilityContractEntries({
		contract: "musicGenerationProviders",
		pluginSdkResolution: "src",
		pluginIds,
		pickEntries: (registry) => registry.musicGenerationProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
}
function loadVitestSpeechFallbackEntries(pluginIds) {
	return loadVitestCapabilityContractEntries({
		contract: "speechProviders",
		pluginSdkResolution: "src",
		pluginIds,
		pickEntries: (registry) => registry.speechProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
}
function hasExplicitVideoGenerationModes(provider) {
	return Boolean(provider.capabilities.generate && provider.capabilities.imageToVideo && provider.capabilities.videoToVideo);
}
function hasExplicitMusicGenerationModes(provider) {
	return Boolean(provider.capabilities.generate && provider.capabilities.edit);
}
function loadVitestCapabilityContractEntries(params) {
	const pluginIds = [...params.pluginIds ?? VITEST_CONTRACT_PLUGIN_IDS[params.contract]];
	if (pluginIds.length === 0) return [];
	const bulkEntries = params.pickEntries(loadBundledCapabilityRuntimeRegistry({
		pluginIds,
		pluginSdkResolution: params.pluginSdkResolution ?? "dist"
	}));
	if (new Set(bulkEntries.map((entry) => entry.pluginId)).size === pluginIds.length) return bulkEntries;
	return pluginIds.flatMap((pluginId) => params.pickEntries(loadBundledCapabilityRuntimeRegistry({
		pluginIds: [pluginId],
		pluginSdkResolution: params.pluginSdkResolution ?? "dist"
	})).filter((entry) => entry.pluginId === pluginId));
}
function loadVitestSpeechProviderContractRegistry() {
	const entries = loadVitestCapabilityContractEntries({
		contract: "speechProviders",
		pickEntries: (registry) => registry.speechProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
	const coveredPluginIds = new Set(entries.map((entry) => entry.pluginId));
	const missingPluginIds = VITEST_CONTRACT_PLUGIN_IDS.speechProviders.filter((pluginId) => !coveredPluginIds.has(pluginId));
	if (missingPluginIds.length === 0) return entries;
	const replacementEntries = loadVitestSpeechFallbackEntries(missingPluginIds);
	const replacedPluginIds = new Set(replacementEntries.map((entry) => entry.pluginId));
	return [...entries.filter((entry) => !replacedPluginIds.has(entry.pluginId)), ...replacementEntries];
}
function loadVitestMediaUnderstandingProviderContractRegistry() {
	return loadVitestCapabilityContractEntries({
		contract: "mediaUnderstandingProviders",
		pickEntries: (registry) => registry.mediaUnderstandingProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
}
function loadVitestRealtimeVoiceProviderContractRegistry() {
	return loadVitestCapabilityContractEntries({
		contract: "realtimeVoiceProviders",
		pickEntries: (registry) => registry.realtimeVoiceProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
}
function loadVitestRealtimeTranscriptionProviderContractRegistry() {
	return loadVitestCapabilityContractEntries({
		contract: "realtimeTranscriptionProviders",
		pickEntries: (registry) => registry.realtimeTranscriptionProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
}
function loadVitestImageGenerationProviderContractRegistry() {
	return loadVitestCapabilityContractEntries({
		contract: "imageGenerationProviders",
		pickEntries: (registry) => registry.imageGenerationProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
}
function loadVitestVideoGenerationProviderContractRegistry() {
	const entries = loadVitestCapabilityContractEntries({
		contract: "videoGenerationProviders",
		pickEntries: (registry) => registry.videoGenerationProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
	const coveredPluginIds = new Set(entries.map((entry) => entry.pluginId));
	const stalePluginIds = new Set(entries.filter((entry) => !hasExplicitVideoGenerationModes(entry.provider)).map((entry) => entry.pluginId));
	const missingPluginIds = VITEST_CONTRACT_PLUGIN_IDS.videoGenerationProviders.filter((pluginId) => !coveredPluginIds.has(pluginId) || stalePluginIds.has(pluginId));
	if (missingPluginIds.length === 0) return entries;
	const replacementEntries = loadVitestVideoGenerationFallbackEntries(missingPluginIds);
	const replacedPluginIds = new Set(replacementEntries.map((entry) => entry.pluginId));
	return [...entries.filter((entry) => !replacedPluginIds.has(entry.pluginId)), ...replacementEntries];
}
function loadVitestMusicGenerationProviderContractRegistry() {
	const entries = loadVitestCapabilityContractEntries({
		contract: "musicGenerationProviders",
		pickEntries: (registry) => registry.musicGenerationProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}))
	});
	const coveredPluginIds = new Set(entries.map((entry) => entry.pluginId));
	const stalePluginIds = new Set(entries.filter((entry) => !hasExplicitMusicGenerationModes(entry.provider)).map((entry) => entry.pluginId));
	const missingPluginIds = VITEST_CONTRACT_PLUGIN_IDS.musicGenerationProviders.filter((pluginId) => !coveredPluginIds.has(pluginId) || stalePluginIds.has(pluginId));
	if (missingPluginIds.length === 0) return entries;
	const replacementEntries = loadVitestMusicGenerationFallbackEntries(missingPluginIds);
	const replacedPluginIds = new Set(replacementEntries.map((entry) => entry.pluginId));
	return [...entries.filter((entry) => !replacedPluginIds.has(entry.pluginId)), ...replacementEntries];
}
//#endregion
//#region src/plugins/contracts/registry.ts
function normalizeProviderAuthEnvVars(providerAuthEnvVars) {
	return Object.fromEntries(Object.entries(providerAuthEnvVars ?? {}).map(([providerId, envVars]) => [providerId, uniqueStrings(envVars)]));
}
function resolveBundledManifestContracts() {
	if (process.env.VITEST) return BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.map((entry) => ({
		pluginId: entry.pluginId,
		cliBackendIds: [...entry.cliBackendIds],
		providerIds: [...entry.providerIds],
		providerAuthEnvVars: normalizeProviderAuthEnvVars(entry.providerAuthEnvVars),
		speechProviderIds: [...entry.speechProviderIds],
		realtimeTranscriptionProviderIds: [...entry.realtimeTranscriptionProviderIds],
		realtimeVoiceProviderIds: [...entry.realtimeVoiceProviderIds],
		mediaUnderstandingProviderIds: [...entry.mediaUnderstandingProviderIds],
		documentExtractorIds: [...entry.documentExtractorIds],
		imageGenerationProviderIds: [...entry.imageGenerationProviderIds],
		videoGenerationProviderIds: [...entry.videoGenerationProviderIds],
		musicGenerationProviderIds: [...entry.musicGenerationProviderIds],
		webContentExtractorIds: [...entry.webContentExtractorIds],
		webFetchProviderIds: [...entry.webFetchProviderIds],
		webSearchProviderIds: [...entry.webSearchProviderIds],
		migrationProviderIds: [...entry.migrationProviderIds],
		toolNames: [...entry.toolNames]
	}));
	return loadPluginManifestRegistry({}).plugins.filter((plugin) => plugin.origin === "bundled" && (plugin.cliBackends.length > 0 || plugin.providers.length > 0 || (plugin.contracts?.speechProviders?.length ?? 0) > 0 || (plugin.contracts?.realtimeTranscriptionProviders?.length ?? 0) > 0 || (plugin.contracts?.realtimeVoiceProviders?.length ?? 0) > 0 || (plugin.contracts?.mediaUnderstandingProviders?.length ?? 0) > 0 || (plugin.contracts?.documentExtractors?.length ?? 0) > 0 || (plugin.contracts?.imageGenerationProviders?.length ?? 0) > 0 || (plugin.contracts?.videoGenerationProviders?.length ?? 0) > 0 || (plugin.contracts?.musicGenerationProviders?.length ?? 0) > 0 || (plugin.contracts?.webContentExtractors?.length ?? 0) > 0 || (plugin.contracts?.webFetchProviders?.length ?? 0) > 0 || (plugin.contracts?.webSearchProviders?.length ?? 0) > 0 || (plugin.contracts?.migrationProviders?.length ?? 0) > 0 || (plugin.contracts?.tools?.length ?? 0) > 0)).map((plugin) => ({
		pluginId: plugin.id,
		cliBackendIds: uniqueStrings(plugin.cliBackends),
		providerIds: uniqueStrings(plugin.providers),
		providerAuthEnvVars: normalizeProviderAuthEnvVars(plugin.providerAuthEnvVars),
		speechProviderIds: uniqueStrings(plugin.contracts?.speechProviders ?? []),
		realtimeTranscriptionProviderIds: uniqueStrings(plugin.contracts?.realtimeTranscriptionProviders ?? []),
		realtimeVoiceProviderIds: uniqueStrings(plugin.contracts?.realtimeVoiceProviders ?? []),
		mediaUnderstandingProviderIds: uniqueStrings(plugin.contracts?.mediaUnderstandingProviders ?? []),
		documentExtractorIds: uniqueStrings(plugin.contracts?.documentExtractors ?? []),
		imageGenerationProviderIds: uniqueStrings(plugin.contracts?.imageGenerationProviders ?? []),
		videoGenerationProviderIds: uniqueStrings(plugin.contracts?.videoGenerationProviders ?? []),
		musicGenerationProviderIds: uniqueStrings(plugin.contracts?.musicGenerationProviders ?? []),
		webContentExtractorIds: uniqueStrings(plugin.contracts?.webContentExtractors ?? []),
		webFetchProviderIds: uniqueStrings(plugin.contracts?.webFetchProviders ?? []),
		webSearchProviderIds: uniqueStrings(plugin.contracts?.webSearchProviders ?? []),
		migrationProviderIds: uniqueStrings(plugin.contracts?.migrationProviders ?? []),
		toolNames: uniqueStrings(plugin.contracts?.tools ?? [])
	}));
}
function resolveBundledProviderContractPluginIds() {
	return uniqueStrings(resolveBundledManifestContracts().filter((entry) => entry.providerIds.length > 0).map((entry) => entry.pluginId)).toSorted((left, right) => left.localeCompare(right));
}
function resolveBundledManifestContractPluginIds(contract) {
	return resolveManifestContractPluginIds({
		contract,
		origin: "bundled"
	});
}
function resolveBundledManifestPluginIdsForContract(contract) {
	return uniqueStrings(resolveBundledManifestContracts().filter((entry) => {
		switch (contract) {
			case "speechProviders": return entry.speechProviderIds.length > 0;
			case "realtimeTranscriptionProviders": return entry.realtimeTranscriptionProviderIds.length > 0;
			case "realtimeVoiceProviders": return entry.realtimeVoiceProviderIds.length > 0;
			case "mediaUnderstandingProviders": return entry.mediaUnderstandingProviderIds.length > 0;
			case "documentExtractors": return entry.documentExtractorIds.length > 0;
			case "imageGenerationProviders": return entry.imageGenerationProviderIds.length > 0;
			case "videoGenerationProviders": return entry.videoGenerationProviderIds.length > 0;
			case "musicGenerationProviders": return entry.musicGenerationProviderIds.length > 0;
			case "webContentExtractors": return entry.webContentExtractorIds.length > 0;
			case "webFetchProviders": return entry.webFetchProviderIds.length > 0;
			case "webSearchProviders": return entry.webSearchProviderIds.length > 0;
			case "migrationProviders": return entry.migrationProviderIds.length > 0;
			case "tools": return entry.toolNames.length > 0;
		}
		throw new Error("Unsupported manifest contract key");
	}).map((entry) => entry.pluginId)).toSorted((left, right) => left.localeCompare(right));
}
let providerContractRegistryCache = null;
let providerContractRegistryByPluginIdCache = null;
let webFetchProviderContractRegistryCache = null;
let webSearchProviderContractRegistryCache = null;
let speechProviderContractRegistryCache = null;
let realtimeTranscriptionProviderContractRegistryCache = null;
let realtimeVoiceProviderContractRegistryCache = null;
let mediaUnderstandingProviderContractRegistryCache = null;
let imageGenerationProviderContractRegistryCache = null;
let videoGenerationProviderContractRegistryCache = null;
let musicGenerationProviderContractRegistryCache = null;
let providerContractLoadError;
function formatBundledCapabilityPluginLoadError(params) {
	const plugin = params.registry.plugins.find((entry) => entry.id === params.pluginId);
	const diagnostics = params.registry.diagnostics.filter((entry) => entry.pluginId === params.pluginId).map((entry) => entry.message);
	const detailParts = plugin ? [
		`status=${plugin.status}`,
		...plugin.error ? [`error=${plugin.error}`] : [],
		`providerIds=[${plugin.providerIds.join(", ")}]`,
		`webFetchProviderIds=[${plugin.webFetchProviderIds.join(", ")}]`,
		`webSearchProviderIds=[${plugin.webSearchProviderIds.join(", ")}]`
	] : ["plugin record missing"];
	if (diagnostics.length > 0) detailParts.push(`diagnostics=${diagnostics.join(" | ")}`);
	return /* @__PURE__ */ new Error(`bundled ${params.capabilityLabel} contract load failed for ${params.pluginId}: ${detailParts.join("; ")}`);
}
function loadScopedCapabilityRuntimeRegistryEntries(params) {
	let lastFailure;
	for (let attempt = 0; attempt < 2; attempt += 1) {
		const registry = loadBundledCapabilityRuntimeRegistry({
			pluginIds: [params.pluginId],
			pluginSdkResolution: "dist"
		});
		const entries = params.loadEntries(registry);
		if (entries.length > 0) return entries;
		const plugin = registry.plugins.find((entry) => entry.id === params.pluginId);
		lastFailure = formatBundledCapabilityPluginLoadError({
			pluginId: params.pluginId,
			capabilityLabel: params.capabilityLabel,
			registry
		});
		if (!(attempt === 0 && (!plugin || plugin.status !== "loaded" || params.loadDeclaredIds(plugin).length === 0))) break;
	}
	throw lastFailure ?? /* @__PURE__ */ new Error(`bundled ${params.capabilityLabel} contract load failed for ${params.pluginId}: no entries`);
}
function loadProviderContractEntriesForPluginIds(pluginIds) {
	return pluginIds.flatMap((pluginId) => loadProviderContractEntriesForPluginId(pluginId));
}
function loadProviderContractEntriesForPluginId(pluginId) {
	if (providerContractRegistryCache) return providerContractRegistryCache.filter((entry) => entry.pluginId === pluginId);
	const cache = providerContractRegistryByPluginIdCache ?? /* @__PURE__ */ new Map();
	providerContractRegistryByPluginIdCache = cache;
	const cached = cache.get(pluginId);
	if (cached) return cached;
	const publicArtifactEntries = resolveBundledExplicitProviderContractsFromPublicArtifacts({ onlyPluginIds: [pluginId] });
	if (publicArtifactEntries) {
		cache.set(pluginId, publicArtifactEntries);
		return publicArtifactEntries;
	}
	try {
		providerContractLoadError = void 0;
		const entries = loadScopedCapabilityRuntimeRegistryEntries({
			pluginId,
			capabilityLabel: "provider",
			loadEntries: (registry) => registry.providers.filter((entry) => entry.pluginId === pluginId).map((entry) => ({
				pluginId: entry.pluginId,
				provider: entry.provider
			})),
			loadDeclaredIds: (plugin) => plugin.providerIds
		}).map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}));
		cache.set(pluginId, entries);
		return entries;
	} catch (error) {
		providerContractLoadError = error instanceof Error ? error : new Error(String(error));
		cache.set(pluginId, []);
		return [];
	}
}
function loadProviderContractRegistry() {
	if (!providerContractRegistryCache) try {
		providerContractLoadError = void 0;
		const publicArtifactEntries = resolveBundledProviderContractPluginIds().flatMap((pluginId) => resolveBundledExplicitProviderContractsFromPublicArtifacts({ onlyPluginIds: [pluginId] }) ?? []);
		const coveredPluginIds = new Set(publicArtifactEntries.map((entry) => entry.pluginId));
		const remainingPluginIds = resolveBundledProviderContractPluginIds().filter((pluginId) => !coveredPluginIds.has(pluginId));
		const runtimeEntries = remainingPluginIds.length > 0 ? loadBundledCapabilityRuntimeRegistry({
			pluginIds: remainingPluginIds,
			pluginSdkResolution: "dist"
		}).providers.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		})) : [];
		providerContractRegistryCache = [...publicArtifactEntries, ...runtimeEntries];
	} catch (error) {
		providerContractLoadError = error instanceof Error ? error : new Error(String(error));
		providerContractRegistryCache = [];
	}
	return providerContractRegistryCache;
}
function loadUniqueProviderContractProviders() {
	return [...new Map(loadProviderContractRegistry().map((entry) => [entry.provider.id, entry.provider])).values()];
}
function loadProviderContractPluginIds() {
	return [...resolveBundledProviderContractPluginIds()];
}
function loadProviderContractCompatPluginIds() {
	return loadProviderContractPluginIds();
}
function resolveWebSearchCredentialValue(provider) {
	if (provider.requiresCredential === false) return `${provider.id}-no-key-needed`;
	const envVar = provider.envVars.find((entry) => entry.trim().length > 0);
	if (!envVar) return `${provider.id}-test`;
	if (envVar === "OPENROUTER_API_KEY") return "openrouter-test";
	return normalizeLowercaseStringOrEmpty(envVar).includes("api_key") ? `${provider.id}-test` : "sk-test";
}
function resolveWebFetchCredentialValue(provider) {
	if (provider.requiresCredential === false) return `${provider.id}-no-key-needed`;
	const envVar = provider.envVars.find((entry) => entry.trim().length > 0);
	if (!envVar) return `${provider.id}-test`;
	return normalizeLowercaseStringOrEmpty(envVar).includes("api_key") ? `${provider.id}-test` : "sk-test";
}
function loadWebFetchProviderContractRegistry() {
	if (!webFetchProviderContractRegistryCache) webFetchProviderContractRegistryCache = loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestContractPluginIds("webFetchProviders"),
		pluginSdkResolution: "dist"
	}).webFetchProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider,
		credentialValue: resolveWebFetchCredentialValue(entry.provider)
	}));
	return webFetchProviderContractRegistryCache;
}
function loadWebSearchProviderContractRegistry() {
	if (!webSearchProviderContractRegistryCache) {
		const publicArtifactEntries = resolveBundledManifestContractPluginIds("webSearchProviders").flatMap((pluginId) => (resolveBundledExplicitWebSearchProvidersFromPublicArtifacts({ onlyPluginIds: [pluginId] }) ?? []).map((provider) => ({
			pluginId: provider.pluginId,
			provider,
			credentialValue: resolveWebSearchCredentialValue(provider)
		})));
		const coveredPluginIds = new Set(publicArtifactEntries.map((entry) => entry.pluginId));
		const remainingPluginIds = resolveBundledManifestContractPluginIds("webSearchProviders").filter((pluginId) => !coveredPluginIds.has(pluginId));
		const runtimeEntries = remainingPluginIds.length > 0 ? loadBundledCapabilityRuntimeRegistry({
			pluginIds: remainingPluginIds,
			pluginSdkResolution: "dist"
		}).webSearchProviders.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider,
			credentialValue: resolveWebSearchCredentialValue(entry.provider)
		})) : [];
		webSearchProviderContractRegistryCache = [...publicArtifactEntries, ...runtimeEntries];
	}
	return webSearchProviderContractRegistryCache;
}
function loadSpeechProviderContractRegistry() {
	if (!speechProviderContractRegistryCache) speechProviderContractRegistryCache = process.env.VITEST ? loadVitestSpeechProviderContractRegistry() : loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestPluginIdsForContract("speechProviders"),
		pluginSdkResolution: "dist"
	}).speechProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider
	}));
	return speechProviderContractRegistryCache;
}
function loadRealtimeVoiceProviderContractRegistry() {
	if (!realtimeVoiceProviderContractRegistryCache) realtimeVoiceProviderContractRegistryCache = process.env.VITEST ? loadVitestRealtimeVoiceProviderContractRegistry() : loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestPluginIdsForContract("realtimeVoiceProviders"),
		pluginSdkResolution: "dist"
	}).realtimeVoiceProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider
	}));
	return realtimeVoiceProviderContractRegistryCache;
}
function loadRealtimeTranscriptionProviderContractRegistry() {
	if (!realtimeTranscriptionProviderContractRegistryCache) realtimeTranscriptionProviderContractRegistryCache = process.env.VITEST ? loadVitestRealtimeTranscriptionProviderContractRegistry() : loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestPluginIdsForContract("realtimeTranscriptionProviders"),
		pluginSdkResolution: "dist"
	}).realtimeTranscriptionProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider
	}));
	return realtimeTranscriptionProviderContractRegistryCache;
}
function loadMediaUnderstandingProviderContractRegistry() {
	if (!mediaUnderstandingProviderContractRegistryCache) mediaUnderstandingProviderContractRegistryCache = process.env.VITEST ? loadVitestMediaUnderstandingProviderContractRegistry() : loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestPluginIdsForContract("mediaUnderstandingProviders"),
		pluginSdkResolution: "dist"
	}).mediaUnderstandingProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider
	}));
	return mediaUnderstandingProviderContractRegistryCache;
}
function loadImageGenerationProviderContractRegistry() {
	if (!imageGenerationProviderContractRegistryCache) imageGenerationProviderContractRegistryCache = process.env.VITEST ? loadVitestImageGenerationProviderContractRegistry() : loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestPluginIdsForContract("imageGenerationProviders"),
		pluginSdkResolution: "dist"
	}).imageGenerationProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider
	}));
	return imageGenerationProviderContractRegistryCache;
}
function loadVideoGenerationProviderContractRegistry() {
	if (!videoGenerationProviderContractRegistryCache) videoGenerationProviderContractRegistryCache = process.env.VITEST ? loadVitestVideoGenerationProviderContractRegistry() : loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestPluginIdsForContract("videoGenerationProviders"),
		pluginSdkResolution: "dist"
	}).videoGenerationProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider
	}));
	return videoGenerationProviderContractRegistryCache;
}
function loadMusicGenerationProviderContractRegistry() {
	if (!musicGenerationProviderContractRegistryCache) musicGenerationProviderContractRegistryCache = process.env.VITEST ? loadVitestMusicGenerationProviderContractRegistry() : loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestPluginIdsForContract("musicGenerationProviders"),
		pluginSdkResolution: "dist"
	}).musicGenerationProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider
	}));
	return musicGenerationProviderContractRegistryCache;
}
function createLazyArrayView(load) {
	return new Proxy([], {
		get(_target, prop) {
			const actual = load();
			const value = Reflect.get(actual, prop, actual);
			return typeof value === "function" ? value.bind(actual) : value;
		},
		has(_target, prop) {
			return Reflect.has(load(), prop);
		},
		ownKeys() {
			return Reflect.ownKeys(load());
		},
		getOwnPropertyDescriptor(_target, prop) {
			const actual = load();
			const descriptor = Reflect.getOwnPropertyDescriptor(actual, prop);
			if (descriptor) return descriptor;
			if (Reflect.has(actual, prop)) return {
				configurable: true,
				enumerable: true,
				writable: false,
				value: Reflect.get(actual, prop, actual)
			};
		}
	});
}
createLazyArrayView(loadProviderContractRegistry);
createLazyArrayView(loadUniqueProviderContractProviders);
createLazyArrayView(loadProviderContractPluginIds);
createLazyArrayView(loadProviderContractCompatPluginIds);
function resolveProviderContractPluginIdsForProviderAlias(providerId) {
	const normalizedProvider = normalizeProviderId(providerId);
	if (!normalizedProvider) return;
	const pluginIds = uniqueStrings(loadProviderContractEntriesForPluginIds(resolveBundledProviderContractPluginIds()).filter((entry) => {
		return [
			entry.provider.id,
			...entry.provider.aliases ?? [],
			...entry.provider.hookAliases ?? []
		].some((candidate) => normalizeProviderId(candidate) === normalizedProvider);
	}).map((entry) => entry.pluginId)).toSorted((left, right) => left.localeCompare(right));
	return pluginIds.length > 0 ? pluginIds : void 0;
}
createLazyArrayView(loadWebSearchProviderContractRegistry);
createLazyArrayView(loadWebFetchProviderContractRegistry);
createLazyArrayView(loadSpeechProviderContractRegistry);
createLazyArrayView(loadRealtimeTranscriptionProviderContractRegistry);
createLazyArrayView(loadRealtimeVoiceProviderContractRegistry);
createLazyArrayView(loadMediaUnderstandingProviderContractRegistry);
createLazyArrayView(loadImageGenerationProviderContractRegistry);
createLazyArrayView(loadVideoGenerationProviderContractRegistry);
createLazyArrayView(loadMusicGenerationProviderContractRegistry);
function loadPluginRegistrationContractRegistry() {
	return resolveBundledManifestContracts();
}
const pluginRegistrationContractRegistry = createLazyArrayView(loadPluginRegistrationContractRegistry);
//#endregion
export { providerContractLoadError as n, resolveProviderContractPluginIdsForProviderAlias as r, pluginRegistrationContractRegistry as t };
