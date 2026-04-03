import { n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import "./auth-profiles-bVW1e9Dr.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { o as normalizeModelCompat } from "./provider-model-shared-B0P3sbBu.js";
import "./model-selection-8a6zD_aX.js";
import { n as applyProviderResolvedModelCompatWithPlugins, p as normalizeProviderResolvedModelWithPlugin, r as applyProviderResolvedTransportWithPlugin } from "./provider-runtime-Dhor2yYF.js";
import { _ as PROVIDER_ENV_API_KEY_CANDIDATES } from "./model-auth-markers-BjPX15EF.js";
import { t as resolveEnvApiKey } from "./model-auth-env-Cr_twdPk.js";
import fsSync from "node:fs";
import path from "node:path";
import * as PiCodingAgent from "@mariozechner/pi-coding-agent";
//#region src/agents/pi-auth-credentials.ts
function convertAuthProfileCredentialToPi(cred) {
	if (cred.type === "api_key") {
		const key = typeof cred.key === "string" ? cred.key.trim() : "";
		if (!key) return null;
		return {
			type: "api_key",
			key
		};
	}
	if (cred.type === "token") {
		const token = typeof cred.token === "string" ? cred.token.trim() : "";
		if (!token) return null;
		if (typeof cred.expires === "number" && Number.isFinite(cred.expires) && Date.now() >= cred.expires) return null;
		return {
			type: "api_key",
			key: token
		};
	}
	if (cred.type === "oauth") {
		const access = typeof cred.access === "string" ? cred.access.trim() : "";
		const refresh = typeof cred.refresh === "string" ? cred.refresh.trim() : "";
		if (!access || !refresh || !Number.isFinite(cred.expires) || cred.expires <= 0) return null;
		return {
			type: "oauth",
			access,
			refresh,
			expires: cred.expires
		};
	}
	return null;
}
function resolvePiCredentialMapFromStore(store) {
	const credentials = {};
	for (const credential of Object.values(store.profiles)) {
		const provider = normalizeProviderId(String(credential.provider ?? "")).trim();
		if (!provider || credentials[provider]) continue;
		const converted = convertAuthProfileCredentialToPi(credential);
		if (converted) credentials[provider] = converted;
	}
	return credentials;
}
//#endregion
//#region src/agents/pi-model-discovery.ts
const PiAuthStorageClass = PiCodingAgent.AuthStorage;
const PiModelRegistryClass = PiCodingAgent.ModelRegistry;
function createInMemoryAuthStorageBackend(initialData) {
	let snapshot = JSON.stringify(initialData, null, 2);
	return { withLock(update) {
		const { result, next } = update(snapshot);
		if (typeof next === "string") snapshot = next;
		return result;
	} };
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeRegistryModel(value, agentDir) {
	if (!isRecord(value)) return value;
	if (typeof value.id !== "string" || typeof value.name !== "string" || typeof value.provider !== "string" || typeof value.api !== "string") return value;
	const model = value;
	const pluginNormalized = normalizeProviderResolvedModelWithPlugin({
		provider: model.provider,
		context: {
			provider: model.provider,
			modelId: model.id,
			model,
			agentDir
		}
	}) ?? model;
	const compatNormalized = applyProviderResolvedModelCompatWithPlugins({
		provider: model.provider,
		context: {
			provider: model.provider,
			modelId: model.id,
			model: pluginNormalized,
			agentDir
		}
	}) ?? pluginNormalized;
	return normalizeModelCompat(applyProviderResolvedTransportWithPlugin({
		provider: model.provider,
		context: {
			provider: model.provider,
			modelId: model.id,
			model: compatNormalized,
			agentDir
		}
	}) ?? compatNormalized);
}
function instantiatePiModelRegistry(authStorage, modelsJsonPath) {
	const Registry = PiModelRegistryClass;
	if (typeof Registry.create === "function") return Registry.create(authStorage, modelsJsonPath);
	return new Registry(authStorage, modelsJsonPath);
}
function createOpenClawModelRegistry(authStorage, modelsJsonPath, agentDir) {
	const registry = instantiatePiModelRegistry(authStorage, modelsJsonPath);
	const getAll = registry.getAll.bind(registry);
	const getAvailable = registry.getAvailable.bind(registry);
	const find = registry.find.bind(registry);
	registry.getAll = () => getAll().map((entry) => normalizeRegistryModel(entry, agentDir));
	registry.getAvailable = () => getAvailable().map((entry) => normalizeRegistryModel(entry, agentDir));
	registry.find = (provider, modelId) => normalizeRegistryModel(find(provider, modelId), agentDir);
	return registry;
}
function scrubLegacyStaticAuthJsonEntries(pathname) {
	if (process.env.OPENCLAW_AUTH_STORE_READONLY === "1") return;
	if (!fsSync.existsSync(pathname)) return;
	let parsed;
	try {
		parsed = JSON.parse(fsSync.readFileSync(pathname, "utf8"));
	} catch {
		return;
	}
	if (!isRecord(parsed)) return;
	let changed = false;
	for (const [provider, value] of Object.entries(parsed)) {
		if (!isRecord(value)) continue;
		if (value.type !== "api_key") continue;
		delete parsed[provider];
		changed = true;
	}
	if (!changed) return;
	if (Object.keys(parsed).length === 0) {
		fsSync.rmSync(pathname, { force: true });
		return;
	}
	fsSync.writeFileSync(pathname, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
	fsSync.chmodSync(pathname, 384);
}
function createAuthStorage(AuthStorageLike, path, creds) {
	const withInMemory = AuthStorageLike;
	if (typeof withInMemory.inMemory === "function") return withInMemory.inMemory(creds);
	const withFromStorage = AuthStorageLike;
	if (typeof withFromStorage.fromStorage === "function") {
		const backendCtor = PiCodingAgent.InMemoryAuthStorageBackend;
		const backend = typeof backendCtor === "function" ? new backendCtor() : createInMemoryAuthStorageBackend(creds);
		backend.withLock(() => ({
			result: void 0,
			next: JSON.stringify(creds, null, 2)
		}));
		return withFromStorage.fromStorage(backend);
	}
	const withFactory = AuthStorageLike;
	const withRuntimeOverride = typeof withFactory.create === "function" ? withFactory.create(path) : new AuthStorageLike(path);
	if (typeof withRuntimeOverride.setRuntimeApiKey === "function") for (const [provider, credential] of Object.entries(creds)) {
		if (credential.type === "api_key") {
			withRuntimeOverride.setRuntimeApiKey(provider, credential.key);
			continue;
		}
		withRuntimeOverride.setRuntimeApiKey(provider, credential.access);
	}
	return withRuntimeOverride;
}
function resolvePiCredentials(agentDir) {
	const credentials = resolvePiCredentialMapFromStore(ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false }));
	for (const provider of Object.keys(PROVIDER_ENV_API_KEY_CANDIDATES)) {
		if (credentials[provider]) continue;
		const resolved = resolveEnvApiKey(provider);
		if (!resolved?.apiKey) continue;
		credentials[provider] = {
			type: "api_key",
			key: resolved.apiKey
		};
	}
	return credentials;
}
function discoverAuthStorage(agentDir) {
	const credentials = resolvePiCredentials(agentDir);
	const authPath = path.join(agentDir, "auth.json");
	scrubLegacyStaticAuthJsonEntries(authPath);
	return createAuthStorage(PiAuthStorageClass, authPath, credentials);
}
function discoverModels(authStorage, agentDir) {
	return createOpenClawModelRegistry(authStorage, path.join(agentDir, "models.json"), agentDir);
}
//#endregion
export { discoverModels as i, PiModelRegistryClass as n, discoverAuthStorage as r, PiAuthStorageClass as t };
