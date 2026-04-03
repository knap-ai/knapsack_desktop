import { u as isRecord } from "./utils-CE3P21nG.js";
import { i as openBoundaryFileSync, n as matchBoundaryFileOpenFailure } from "./boundary-file-read-LPHTYrMX.js";
import { n as MANIFEST_KEY } from "./legacy-names-JQT-hzFf.js";
import fsSync from "node:fs";
import path from "node:path";
import JSON5 from "json5";
//#region src/plugins/manifest.ts
const PLUGIN_MANIFEST_FILENAME = "openclaw.plugin.json";
const PLUGIN_MANIFEST_FILENAMES = [PLUGIN_MANIFEST_FILENAME];
function normalizeStringList(value) {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
}
function normalizeStringListRecord(value) {
	if (!isRecord(value)) return;
	const normalized = {};
	for (const [key, rawValues] of Object.entries(value)) {
		const providerId = typeof key === "string" ? key.trim() : "";
		if (!providerId) continue;
		const values = normalizeStringList(rawValues);
		if (values.length === 0) continue;
		normalized[providerId] = values;
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeManifestContracts(value) {
	if (!isRecord(value)) return;
	const speechProviders = normalizeStringList(value.speechProviders);
	const mediaUnderstandingProviders = normalizeStringList(value.mediaUnderstandingProviders);
	const imageGenerationProviders = normalizeStringList(value.imageGenerationProviders);
	const webFetchProviders = normalizeStringList(value.webFetchProviders);
	const webSearchProviders = normalizeStringList(value.webSearchProviders);
	const tools = normalizeStringList(value.tools);
	const contracts = {
		...speechProviders.length > 0 ? { speechProviders } : {},
		...mediaUnderstandingProviders.length > 0 ? { mediaUnderstandingProviders } : {},
		...imageGenerationProviders.length > 0 ? { imageGenerationProviders } : {},
		...webFetchProviders.length > 0 ? { webFetchProviders } : {},
		...webSearchProviders.length > 0 ? { webSearchProviders } : {},
		...tools.length > 0 ? { tools } : {}
	};
	return Object.keys(contracts).length > 0 ? contracts : void 0;
}
function normalizeProviderAuthChoices(value) {
	if (!Array.isArray(value)) return;
	const normalized = [];
	for (const entry of value) {
		if (!isRecord(entry)) continue;
		const provider = typeof entry.provider === "string" ? entry.provider.trim() : "";
		const method = typeof entry.method === "string" ? entry.method.trim() : "";
		const choiceId = typeof entry.choiceId === "string" ? entry.choiceId.trim() : "";
		if (!provider || !method || !choiceId) continue;
		const choiceLabel = typeof entry.choiceLabel === "string" ? entry.choiceLabel.trim() : "";
		const choiceHint = typeof entry.choiceHint === "string" ? entry.choiceHint.trim() : "";
		const deprecatedChoiceIds = normalizeStringList(entry.deprecatedChoiceIds);
		const groupId = typeof entry.groupId === "string" ? entry.groupId.trim() : "";
		const groupLabel = typeof entry.groupLabel === "string" ? entry.groupLabel.trim() : "";
		const groupHint = typeof entry.groupHint === "string" ? entry.groupHint.trim() : "";
		const optionKey = typeof entry.optionKey === "string" ? entry.optionKey.trim() : "";
		const cliFlag = typeof entry.cliFlag === "string" ? entry.cliFlag.trim() : "";
		const cliOption = typeof entry.cliOption === "string" ? entry.cliOption.trim() : "";
		const cliDescription = typeof entry.cliDescription === "string" ? entry.cliDescription.trim() : "";
		const onboardingScopes = normalizeStringList(entry.onboardingScopes).filter((scope) => scope === "text-inference" || scope === "image-generation");
		normalized.push({
			provider,
			method,
			choiceId,
			...choiceLabel ? { choiceLabel } : {},
			...choiceHint ? { choiceHint } : {},
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
	const normalized = {};
	for (const [key, rawEntry] of Object.entries(value)) {
		const channelId = typeof key === "string" ? key.trim() : "";
		if (!channelId || !isRecord(rawEntry)) continue;
		const schema = isRecord(rawEntry.schema) ? rawEntry.schema : null;
		if (!schema) continue;
		const uiHints = isRecord(rawEntry.uiHints) ? rawEntry.uiHints : void 0;
		const label = typeof rawEntry.label === "string" ? rawEntry.label.trim() : "";
		const description = typeof rawEntry.description === "string" ? rawEntry.description.trim() : "";
		const preferOver = normalizeStringList(rawEntry.preferOver);
		normalized[channelId] = {
			schema,
			...uiHints ? { uiHints } : {},
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
		if (fsSync.existsSync(candidate)) return candidate;
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
		raw = JSON5.parse(fsSync.readFileSync(opened.fd, "utf-8"));
	} catch (err) {
		return {
			ok: false,
			error: `failed to parse plugin manifest: ${String(err)}`,
			manifestPath
		};
	} finally {
		fsSync.closeSync(opened.fd);
	}
	if (!isRecord(raw)) return {
		ok: false,
		error: "plugin manifest must be an object",
		manifestPath
	};
	const id = typeof raw.id === "string" ? raw.id.trim() : "";
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
	const legacyPluginIds = normalizeStringList(raw.legacyPluginIds);
	const autoEnableWhenConfiguredProviders = normalizeStringList(raw.autoEnableWhenConfiguredProviders);
	const name = typeof raw.name === "string" ? raw.name.trim() : void 0;
	const description = typeof raw.description === "string" ? raw.description.trim() : void 0;
	const version = typeof raw.version === "string" ? raw.version.trim() : void 0;
	const channels = normalizeStringList(raw.channels);
	const providers = normalizeStringList(raw.providers);
	const cliBackends = normalizeStringList(raw.cliBackends);
	const providerAuthEnvVars = normalizeStringListRecord(raw.providerAuthEnvVars);
	const providerAuthChoices = normalizeProviderAuthChoices(raw.providerAuthChoices);
	const skills = normalizeStringList(raw.skills);
	const contracts = normalizeManifestContracts(raw.contracts);
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
			cliBackends,
			providerAuthEnvVars,
			providerAuthChoices,
			skills,
			name,
			description,
			version,
			uiHints,
			contracts,
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
	const entries = raw.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
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
export { resolvePackageExtensionEntries as a, loadPluginManifest as i, PLUGIN_MANIFEST_FILENAME as n, getPackageManifestMetadata as r, DEFAULT_PLUGIN_ENTRY_CANDIDATES as t };
