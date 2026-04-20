import { d as readStringValue, i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { b as truncateUtf16Safe } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-DXLy_w6L.js";
import { n as PLUGIN_MANIFEST_FILENAME } from "./manifest-DKZWfJEu.js";
import { n as discoverOpenClawPlugins } from "./discovery-DGQFjH8F.js";
import { g as unwrapDefaultModuleExport } from "./bundled-CGMeVzvo.js";
import { i as resolveBundledPluginRepoEntryPath, o as normalizeBundledPluginStringList, s as resolveBundledPluginScanDir } from "./bundled-plugin-metadata-Da-MNAHv.js";
import { g as shouldPreferNativeJiti, l as resolveLoaderPackageRoot, t as buildPluginLoaderAliasMap } from "./sdk-alias-w29OTN9p.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-D_0TILck.js";
import { r as resolveManifestContractPluginIds, t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-Delpa74L.js";
import { n as withBundledPluginEnablementCompat, r as withBundledPluginVitestCompat } from "./bundled-compat-ClStMMlW.js";
import "./plugins-D4ODSIPT.js";
import { b as createEmptyPluginRegistry } from "./runtime-BB1a2aCy.js";
import { l as normalizeToolName } from "./tool-policy-C3rJHw58.js";
import { r as splitMediaFromOutput } from "./parse-CwkQk8aD.js";
import { a as normalizeTargetForProvider } from "./target-normalization-j5fHpTkf.js";
import { n as createCapturedPluginRegistration } from "./captured-registration-CSvXiPcc.js";
import { t as collectTextContentBlocks } from "./content-blocks-CoySVQBt.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/agents/pi-embedded-runner/runtime.ts
function normalizeEmbeddedAgentRuntime(raw) {
	const value = raw?.trim();
	if (!value) return "auto";
	if (value === "pi") return "pi";
	if (value === "auto") return "auto";
	return value;
}
function resolveEmbeddedAgentRuntime(env = process.env) {
	return normalizeEmbeddedAgentRuntime(env.OPENCLAW_AGENT_RUNTIME?.trim());
}
function resolveEmbeddedAgentHarnessFallback(env = process.env) {
	const raw = env.OPENCLAW_AGENT_HARNESS_FALLBACK?.trim().toLowerCase();
	if (raw === "pi" || raw === "none") return raw;
}
//#endregion
//#region src/agents/pi-embedded-messaging.ts
const CORE_MESSAGING_TOOLS = new Set(["sessions_send", "message"]);
function isMessagingTool(toolName) {
	if (CORE_MESSAGING_TOOLS.has(toolName)) return true;
	const providerId = normalizeChannelId(toolName);
	return Boolean(providerId && getChannelPlugin(providerId)?.actions);
}
function isMessagingToolSendAction(toolName, args) {
	const action = normalizeOptionalString(args.action) ?? "";
	if (toolName === "sessions_send") return true;
	if (toolName === "message") return action === "send" || action === "thread-reply";
	const providerId = normalizeChannelId(toolName);
	if (!providerId) return false;
	const plugin = getChannelPlugin(providerId);
	if (!plugin?.actions?.extractToolSend) return false;
	return Boolean(plugin.actions.extractToolSend({ args })?.to);
}
//#endregion
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
	const { ["openclaw/plugin-sdk"]: _ignoredLegacyRootAlias, ["@openclaw/plugin-sdk"]: _ignoredScopedRootAlias, ...scopedAliasMap } = params.aliasMap;
	return {
		...scopedAliasMap,
		...buildVitestCapabilityShimAliasMap()
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
		memoryEmbeddingProviderIds: [],
		agentHarnessIds: [],
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
		return getCachedPluginJitiLoader({
			cache: jitiLoaders,
			modulePath,
			importerUrl: import.meta.url,
			jitiFilename: import.meta.url,
			aliasMap,
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
function buildBundledPluginContractSnapshot(manifest) {
	return {
		pluginId: manifest.id,
		cliBackendIds: uniqueStrings(manifest.cliBackends, (value) => value.trim()),
		providerIds: uniqueStrings(manifest.providers, (value) => value.trim()),
		speechProviderIds: uniqueStrings(manifest.contracts?.speechProviders, (value) => value.trim()),
		realtimeTranscriptionProviderIds: uniqueStrings(manifest.contracts?.realtimeTranscriptionProviders, (value) => value.trim()),
		realtimeVoiceProviderIds: uniqueStrings(manifest.contracts?.realtimeVoiceProviders, (value) => value.trim()),
		mediaUnderstandingProviderIds: uniqueStrings(manifest.contracts?.mediaUnderstandingProviders, (value) => value.trim()),
		imageGenerationProviderIds: uniqueStrings(manifest.contracts?.imageGenerationProviders, (value) => value.trim()),
		videoGenerationProviderIds: uniqueStrings(manifest.contracts?.videoGenerationProviders, (value) => value.trim()),
		musicGenerationProviderIds: uniqueStrings(manifest.contracts?.musicGenerationProviders, (value) => value.trim()),
		webFetchProviderIds: uniqueStrings(manifest.contracts?.webFetchProviders, (value) => value.trim()),
		webSearchProviderIds: uniqueStrings(manifest.contracts?.webSearchProviders, (value) => value.trim()),
		toolNames: uniqueStrings(manifest.contracts?.tools, (value) => value.trim())
	};
}
function hasBundledPluginContractSnapshotCapabilities(entry) {
	return entry.cliBackendIds.length > 0 || entry.providerIds.length > 0 || entry.speechProviderIds.length > 0 || entry.realtimeTranscriptionProviderIds.length > 0 || entry.realtimeVoiceProviderIds.length > 0 || entry.mediaUnderstandingProviderIds.length > 0 || entry.imageGenerationProviderIds.length > 0 || entry.videoGenerationProviderIds.length > 0 || entry.musicGenerationProviderIds.length > 0 || entry.webFetchProviderIds.length > 0 || entry.webSearchProviderIds.length > 0 || entry.toolNames.length > 0;
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
function resolveBundledManifestContracts() {
	if (process.env.VITEST) return BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.map((entry) => ({
		pluginId: entry.pluginId,
		cliBackendIds: [...entry.cliBackendIds],
		providerIds: [...entry.providerIds],
		speechProviderIds: [...entry.speechProviderIds],
		realtimeTranscriptionProviderIds: [...entry.realtimeTranscriptionProviderIds],
		realtimeVoiceProviderIds: [...entry.realtimeVoiceProviderIds],
		mediaUnderstandingProviderIds: [...entry.mediaUnderstandingProviderIds],
		imageGenerationProviderIds: [...entry.imageGenerationProviderIds],
		videoGenerationProviderIds: [...entry.videoGenerationProviderIds],
		musicGenerationProviderIds: [...entry.musicGenerationProviderIds],
		webFetchProviderIds: [...entry.webFetchProviderIds],
		webSearchProviderIds: [...entry.webSearchProviderIds],
		toolNames: [...entry.toolNames]
	}));
	return loadPluginManifestRegistry({}).plugins.filter((plugin) => plugin.origin === "bundled" && (plugin.cliBackends.length > 0 || plugin.providers.length > 0 || (plugin.contracts?.speechProviders?.length ?? 0) > 0 || (plugin.contracts?.realtimeTranscriptionProviders?.length ?? 0) > 0 || (plugin.contracts?.realtimeVoiceProviders?.length ?? 0) > 0 || (plugin.contracts?.mediaUnderstandingProviders?.length ?? 0) > 0 || (plugin.contracts?.imageGenerationProviders?.length ?? 0) > 0 || (plugin.contracts?.videoGenerationProviders?.length ?? 0) > 0 || (plugin.contracts?.musicGenerationProviders?.length ?? 0) > 0 || (plugin.contracts?.webFetchProviders?.length ?? 0) > 0 || (plugin.contracts?.webSearchProviders?.length ?? 0) > 0 || (plugin.contracts?.tools?.length ?? 0) > 0)).map((plugin) => ({
		pluginId: plugin.id,
		cliBackendIds: uniqueStrings(plugin.cliBackends),
		providerIds: uniqueStrings(plugin.providers),
		speechProviderIds: uniqueStrings(plugin.contracts?.speechProviders ?? []),
		realtimeTranscriptionProviderIds: uniqueStrings(plugin.contracts?.realtimeTranscriptionProviders ?? []),
		realtimeVoiceProviderIds: uniqueStrings(plugin.contracts?.realtimeVoiceProviders ?? []),
		mediaUnderstandingProviderIds: uniqueStrings(plugin.contracts?.mediaUnderstandingProviders ?? []),
		imageGenerationProviderIds: uniqueStrings(plugin.contracts?.imageGenerationProviders ?? []),
		videoGenerationProviderIds: uniqueStrings(plugin.contracts?.videoGenerationProviders ?? []),
		musicGenerationProviderIds: uniqueStrings(plugin.contracts?.musicGenerationProviders ?? []),
		webFetchProviderIds: uniqueStrings(plugin.contracts?.webFetchProviders ?? []),
		webSearchProviderIds: uniqueStrings(plugin.contracts?.webSearchProviders ?? []),
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
			case "imageGenerationProviders": return entry.imageGenerationProviderIds.length > 0;
			case "videoGenerationProviders": return entry.videoGenerationProviderIds.length > 0;
			case "musicGenerationProviders": return entry.musicGenerationProviderIds.length > 0;
			case "webFetchProviders": return entry.webFetchProviderIds.length > 0;
			case "webSearchProviders": return entry.webSearchProviderIds.length > 0;
			case "tools": return entry.toolNames.length > 0;
		}
		throw new Error("Unsupported manifest contract key");
	}).map((entry) => entry.pluginId)).toSorted((left, right) => left.localeCompare(right));
}
let providerContractRegistryCache = null;
let webFetchProviderContractRegistryCache = null;
let webSearchProviderContractRegistryCache = null;
let speechProviderContractRegistryCache = null;
let realtimeTranscriptionProviderContractRegistryCache = null;
let realtimeVoiceProviderContractRegistryCache = null;
let mediaUnderstandingProviderContractRegistryCache = null;
let imageGenerationProviderContractRegistryCache = null;
let videoGenerationProviderContractRegistryCache = null;
let musicGenerationProviderContractRegistryCache = null;
function loadProviderContractRegistry() {
	if (!providerContractRegistryCache) try {
		providerContractRegistryCache = loadBundledCapabilityRuntimeRegistry({
			pluginIds: resolveBundledProviderContractPluginIds(),
			pluginSdkResolution: "dist"
		}).providers.map((entry) => ({
			pluginId: entry.pluginId,
			provider: entry.provider
		}));
	} catch (error) {
		error instanceof Error || new Error(String(error));
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
	if (!webSearchProviderContractRegistryCache) webSearchProviderContractRegistryCache = loadBundledCapabilityRuntimeRegistry({
		pluginIds: resolveBundledManifestContractPluginIds("webSearchProviders"),
		pluginSdkResolution: "dist"
	}).webSearchProviders.map((entry) => ({
		pluginId: entry.pluginId,
		provider: entry.provider,
		credentialValue: resolveWebSearchCredentialValue(entry.provider)
	}));
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
//#region src/agents/pi-embedded-subscribe.tools.ts
const TOOL_RESULT_MAX_CHARS = 8e3;
const TOOL_ERROR_MAX_CHARS = 400;
function truncateToolText(text) {
	if (text.length <= TOOL_RESULT_MAX_CHARS) return text;
	return `${truncateUtf16Safe(text, TOOL_RESULT_MAX_CHARS)}\n…(truncated)…`;
}
function normalizeToolErrorText(text) {
	const trimmed = text.trim();
	if (!trimmed) return;
	const firstLine = trimmed.split(/\r?\n/)[0]?.trim() ?? "";
	if (!firstLine) return;
	return firstLine.length > TOOL_ERROR_MAX_CHARS ? `${truncateUtf16Safe(firstLine, TOOL_ERROR_MAX_CHARS)}…` : firstLine;
}
function isErrorLikeStatus(status) {
	const normalized = normalizeOptionalLowercaseString(status);
	if (!normalized) return false;
	if (normalized === "0" || normalized === "ok" || normalized === "success" || normalized === "completed" || normalized === "running") return false;
	return /error|fail|timeout|timed[_\s-]?out|denied|cancel|invalid|forbidden/.test(normalized);
}
function readErrorCandidate(value) {
	if (typeof value === "string") return normalizeToolErrorText(value);
	if (!value || typeof value !== "object") return;
	const record = value;
	if (typeof record.message === "string") return normalizeToolErrorText(record.message);
	if (typeof record.error === "string") return normalizeToolErrorText(record.error);
}
function extractErrorField(value) {
	if (!value || typeof value !== "object") return;
	const record = value;
	const direct = readErrorCandidate(record.error) ?? readErrorCandidate(record.message) ?? readErrorCandidate(record.reason);
	if (direct) return direct;
	const status = normalizeOptionalString(record.status) ?? "";
	if (!status || !isErrorLikeStatus(status)) return;
	return normalizeToolErrorText(status);
}
function sanitizeToolResult(result) {
	if (!result || typeof result !== "object") return result;
	const record = result;
	const content = Array.isArray(record.content) ? record.content : null;
	if (!content) return record;
	const sanitized = content.map((item) => {
		if (!item || typeof item !== "object") return item;
		const entry = item;
		const type = readStringValue(entry.type);
		if (type === "text" && typeof entry.text === "string") return {
			...entry,
			text: truncateToolText(entry.text)
		};
		if (type === "image") {
			const data = readStringValue(entry.data);
			const bytes = data ? data.length : void 0;
			const cleaned = { ...entry };
			delete cleaned.data;
			return {
				...cleaned,
				bytes,
				omitted: true
			};
		}
		return entry;
	});
	return {
		...record,
		content: sanitized
	};
}
function extractToolResultText(result) {
	if (!result || typeof result !== "object") return;
	const texts = collectTextContentBlocks(result.content).map((item) => {
		const trimmed = item.trim();
		return trimmed ? trimmed : void 0;
	}).filter((value) => Boolean(value));
	if (texts.length === 0) return;
	return texts.join("\n");
}
const TRUSTED_TOOL_RESULT_MEDIA = new Set([
	"agents_list",
	"apply_patch",
	"browser",
	"canvas",
	"cron",
	"edit",
	"exec",
	"gateway",
	"image",
	"image_generate",
	"memory_get",
	"memory_search",
	"message",
	"music_generate",
	"nodes",
	"process",
	"read",
	"session_status",
	"sessions_history",
	"sessions_list",
	"sessions_send",
	"sessions_spawn",
	"subagents",
	"tts",
	"video_generate",
	"web_fetch",
	"web_search",
	"x_search",
	"write"
]);
const TRUSTED_BUNDLED_PLUGIN_MEDIA_TOOLS = new Set(pluginRegistrationContractRegistry.flatMap((entry) => entry.toolNames));
const HTTP_URL_RE = /^https?:\/\//i;
function readToolResultDetails(result) {
	if (!result || typeof result !== "object") return;
	const record = result;
	return record.details && typeof record.details === "object" && !Array.isArray(record.details) ? record.details : void 0;
}
function readToolResultStatus(result) {
	const status = readToolResultDetails(result)?.status;
	return normalizeOptionalLowercaseString(status);
}
function isExternalToolResult(result) {
	const details = readToolResultDetails(result);
	if (!details) return false;
	return typeof details.mcpServer === "string" || typeof details.mcpTool === "string";
}
function isToolResultMediaTrusted(toolName, result) {
	if (!toolName || isExternalToolResult(result)) return false;
	const normalized = normalizeToolName(toolName);
	return TRUSTED_TOOL_RESULT_MEDIA.has(normalized) || TRUSTED_BUNDLED_PLUGIN_MEDIA_TOOLS.has(normalized);
}
function filterToolResultMediaUrls(toolName, mediaUrls, result, builtinToolNames) {
	if (mediaUrls.length === 0) return mediaUrls;
	if (isToolResultMediaTrusted(toolName, result)) {
		if (builtinToolNames !== void 0) {
			const registeredName = toolName?.trim();
			if (!registeredName || !builtinToolNames.has(registeredName)) return mediaUrls.filter((url) => HTTP_URL_RE.test(url.trim()));
		}
		return mediaUrls;
	}
	return mediaUrls.filter((url) => HTTP_URL_RE.test(url.trim()));
}
function readToolResultDetailsMedia(result) {
	const details = readToolResultDetails(result);
	return details?.media && typeof details.media === "object" && !Array.isArray(details.media) ? details.media : void 0;
}
function collectStructuredMediaUrls(media) {
	const urls = [];
	if (typeof media.mediaUrl === "string" && media.mediaUrl.trim()) urls.push(media.mediaUrl.trim());
	if (Array.isArray(media.mediaUrls)) urls.push(...media.mediaUrls.filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean));
	return Array.from(new Set(urls));
}
function extractToolResultMediaArtifact(result) {
	if (!result || typeof result !== "object") return;
	const record = result;
	const detailsMedia = readToolResultDetailsMedia(record);
	if (detailsMedia) {
		const mediaUrls = collectStructuredMediaUrls(detailsMedia);
		if (mediaUrls.length > 0) return {
			mediaUrls,
			...detailsMedia.audioAsVoice === true ? { audioAsVoice: true } : {}
		};
	}
	const content = Array.isArray(record.content) ? record.content : null;
	if (!content) return;
	const paths = [];
	let hasImageContent = false;
	for (const item of content) {
		if (!item || typeof item !== "object") continue;
		const entry = item;
		if (entry.type === "image") {
			hasImageContent = true;
			continue;
		}
		if (entry.type === "text" && typeof entry.text === "string") {
			const parsed = splitMediaFromOutput(entry.text);
			if (parsed.mediaUrls?.length) paths.push(...parsed.mediaUrls);
		}
	}
	if (paths.length > 0) return { mediaUrls: paths };
	if (hasImageContent) {
		const details = record.details;
		const p = normalizeOptionalString(details?.path) ?? "";
		if (p) return { mediaUrls: [p] };
	}
}
function isToolResultError(result) {
	const normalized = readToolResultStatus(result);
	if (!normalized) return false;
	return normalized === "error" || normalized === "timeout";
}
function isToolResultTimedOut(result) {
	if (readToolResultStatus(result) === "timeout") return true;
	return readToolResultDetails(result)?.timedOut === true;
}
function extractToolErrorMessage(result) {
	if (!result || typeof result !== "object") return;
	const record = result;
	const fromDetails = extractErrorField(record.details);
	if (fromDetails) return fromDetails;
	const fromRoot = extractErrorField(record);
	if (fromRoot) return fromRoot;
	const text = extractToolResultText(result);
	if (!text) return;
	try {
		const fromJson = extractErrorField(JSON.parse(text));
		if (fromJson) return fromJson;
	} catch {}
	return normalizeToolErrorText(text);
}
function resolveMessageToolTarget(args) {
	const toRaw = readStringValue(args.to);
	if (toRaw) return toRaw;
	return readStringValue(args.target);
}
function extractMessagingToolSend(toolName, args) {
	const action = normalizeOptionalString(args.action) ?? "";
	const accountId = normalizeOptionalString(args.accountId);
	if (toolName === "message") {
		if (action !== "send" && action !== "thread-reply") return;
		const toRaw = resolveMessageToolTarget(args);
		if (!toRaw) return;
		const providerRaw = normalizeOptionalString(args.provider) ?? "";
		const channelRaw = normalizeOptionalString(args.channel) ?? "";
		const providerHint = providerRaw || channelRaw;
		const provider = (providerHint ? normalizeChannelId(providerHint) : null) ?? normalizeOptionalLowercaseString(providerHint) ?? "message";
		const to = normalizeTargetForProvider(provider, toRaw);
		return to ? {
			tool: toolName,
			provider,
			accountId,
			to
		} : void 0;
	}
	const providerId = normalizeChannelId(toolName);
	if (!providerId) return;
	const extracted = getChannelPlugin(providerId)?.actions?.extractToolSend?.({ args });
	if (!extracted?.to) return;
	const to = normalizeTargetForProvider(providerId, extracted.to);
	return to ? {
		tool: toolName,
		provider: providerId,
		accountId: extracted.accountId ?? accountId,
		to
	} : void 0;
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.tool-run-context.ts
function buildEmbeddedAttemptToolRunContext(params) {
	return {
		trigger: params.trigger,
		memoryFlushWritePath: params.memoryFlushWritePath
	};
}
//#endregion
export { extractToolResultText as a, isToolResultTimedOut as c, isMessagingToolSendAction as d, normalizeEmbeddedAgentRuntime as f, extractToolResultMediaArtifact as i, sanitizeToolResult as l, resolveEmbeddedAgentRuntime as m, extractMessagingToolSend as n, filterToolResultMediaUrls as o, resolveEmbeddedAgentHarnessFallback as p, extractToolErrorMessage as r, isToolResultError as s, buildEmbeddedAttemptToolRunContext as t, isMessagingTool as u };
