import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { f as resolveAuthStorePathForDisplay, n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import { t as resolveApiKeyForProfile } from "./auth-profiles-bVW1e9Dr.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./model-selection-8a6zD_aX.js";
import { o as getRuntimeConfigSnapshot } from "./io-DhtVmzAJ.js";
import { t as getShellEnvAppliedKeys } from "./shell-env-Dihl7qUt.js";
import { i as coerceSecretRef } from "./types.secrets-DTXJhyWe.js";
import "./config-CJQx-9zo.js";
import { n as resolveAuthProfileOrder } from "./order-CJ_D8C7W.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { n as listProfilesForProvider } from "./profiles-RmR8EAZC.js";
import { t as formatCliCommand } from "./command-format-CkCGNdQh.js";
import { i as resolveOwningPluginIdsForProvider } from "./providers-4eDlTtuF.js";
import { M as resolveProviderSyntheticAuthWithPlugin, o as buildProviderMissingAuthMessageWithPlugin } from "./provider-runtime-Dhor2yYF.js";
import { i as NON_ENV_SECRETREF_MARKER, l as isKnownEnvApiKeyMarker, t as CUSTOM_LOCAL_AUTH_MARKER, u as isNonSecretApiKeyMarker } from "./model-auth-markers-BjPX15EF.js";
import { t as resolveEnvApiKey } from "./model-auth-env-Cr_twdPk.js";
import path from "node:path";
//#region src/agents/model-auth.ts
const log = createSubsystemLogger("model-auth");
function resolveProviderConfig(cfg, provider) {
	const providers = cfg?.models?.providers ?? {};
	const direct = providers[provider];
	if (direct) return direct;
	const normalized = normalizeProviderId(provider);
	if (normalized === provider) return Object.entries(providers).find(([key]) => normalizeProviderId(key) === normalized)?.[1];
	return providers[normalized] ?? Object.entries(providers).find(([key]) => normalizeProviderId(key) === normalized)?.[1];
}
function getCustomProviderApiKey(cfg, provider) {
	return normalizeOptionalSecretInput(resolveProviderConfig(cfg, provider)?.apiKey);
}
function resolveUsableCustomProviderApiKey(params) {
	const customKey = getCustomProviderApiKey(params.cfg, params.provider);
	if (!customKey) return null;
	if (!isNonSecretApiKeyMarker(customKey)) return {
		apiKey: customKey,
		source: "models.json"
	};
	if (!isKnownEnvApiKeyMarker(customKey)) return null;
	const envValue = normalizeOptionalSecretInput((params.env ?? process.env)[customKey]);
	if (!envValue) return null;
	return {
		apiKey: envValue,
		source: resolveEnvSourceLabel({
			applied: new Set(getShellEnvAppliedKeys()),
			envVars: [customKey],
			label: `${customKey} (models.json marker)`
		})
	};
}
function hasUsableCustomProviderApiKey(cfg, provider, env) {
	return Boolean(resolveUsableCustomProviderApiKey({
		cfg,
		provider,
		env
	}));
}
function resolveProviderAuthOverride(cfg, provider) {
	const auth = resolveProviderConfig(cfg, provider)?.auth;
	if (auth === "api-key" || auth === "aws-sdk" || auth === "oauth" || auth === "token") return auth;
}
function isLocalBaseUrl(baseUrl) {
	try {
		const host = new URL(baseUrl).hostname.toLowerCase();
		return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "[::1]" || host === "[::ffff:7f00:1]" || host === "[::ffff:127.0.0.1]";
	} catch {
		return false;
	}
}
function hasExplicitProviderApiKeyConfig(providerConfig) {
	return normalizeOptionalSecretInput(providerConfig.apiKey) !== void 0 || coerceSecretRef(providerConfig.apiKey) !== null;
}
function isCustomLocalProviderConfig(providerConfig) {
	return typeof providerConfig.baseUrl === "string" && providerConfig.baseUrl.trim().length > 0 && typeof providerConfig.api === "string" && providerConfig.api.trim().length > 0 && Array.isArray(providerConfig.models) && providerConfig.models.length > 0;
}
function isManagedSecretRefApiKeyMarker(apiKey) {
	return apiKey?.trim() === NON_ENV_SECRETREF_MARKER;
}
function resolveProviderSyntheticRuntimeAuth(params) {
	const resolveFromConfig = (config) => {
		const providerConfig = resolveProviderConfig(config, params.provider);
		return resolveProviderSyntheticAuthWithPlugin({
			provider: params.provider,
			config,
			context: {
				config,
				provider: params.provider,
				providerConfig
			}
		});
	};
	const directAuth = resolveFromConfig(params.cfg);
	if (!directAuth) return {};
	if (!isManagedSecretRefApiKeyMarker(directAuth.apiKey)) return { auth: directAuth };
	const runtimeConfig = getRuntimeConfigSnapshot();
	if (!runtimeConfig || runtimeConfig === params.cfg) return { blockedOnManagedSecretRef: true };
	const runtimeAuth = resolveFromConfig(runtimeConfig);
	const runtimeApiKey = runtimeAuth?.apiKey;
	if (!runtimeAuth || !runtimeApiKey || isNonSecretApiKeyMarker(runtimeApiKey)) return { blockedOnManagedSecretRef: true };
	return { auth: runtimeAuth };
}
function resolveSyntheticLocalProviderAuth(params) {
	const syntheticProviderAuth = resolveProviderSyntheticRuntimeAuth(params);
	if (syntheticProviderAuth.auth) return syntheticProviderAuth.auth;
	if (syntheticProviderAuth.blockedOnManagedSecretRef) return null;
	const providerConfig = resolveProviderConfig(params.cfg, params.provider);
	if (!providerConfig) return null;
	if (!(Boolean(providerConfig.api?.trim()) || Boolean(providerConfig.baseUrl?.trim()) || Array.isArray(providerConfig.models) && providerConfig.models.length > 0)) return null;
	const authOverride = resolveProviderAuthOverride(params.cfg, params.provider);
	if (authOverride && authOverride !== "api-key") return null;
	if (!isCustomLocalProviderConfig(providerConfig)) return null;
	if (hasExplicitProviderApiKeyConfig(providerConfig)) return null;
	if (providerConfig.baseUrl && isLocalBaseUrl(providerConfig.baseUrl)) return {
		apiKey: CUSTOM_LOCAL_AUTH_MARKER,
		source: `models.providers.${params.provider} (synthetic local key)`,
		mode: "api-key"
	};
	return null;
}
function resolveEnvSourceLabel(params) {
	return `${params.envVars.some((envVar) => params.applied.has(envVar)) ? "shell env: " : "env: "}${params.label}`;
}
function resolveAwsSdkAuthInfo() {
	const applied = new Set(getShellEnvAppliedKeys());
	if (process.env.AWS_BEARER_TOKEN_BEDROCK?.trim()) return {
		mode: "aws-sdk",
		source: resolveEnvSourceLabel({
			applied,
			envVars: ["AWS_BEARER_TOKEN_BEDROCK"],
			label: "AWS_BEARER_TOKEN_BEDROCK"
		})
	};
	if (process.env.AWS_ACCESS_KEY_ID?.trim() && process.env.AWS_SECRET_ACCESS_KEY?.trim()) return {
		mode: "aws-sdk",
		source: resolveEnvSourceLabel({
			applied,
			envVars: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"],
			label: "AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY"
		})
	};
	if (process.env.AWS_PROFILE?.trim()) return {
		mode: "aws-sdk",
		source: resolveEnvSourceLabel({
			applied,
			envVars: ["AWS_PROFILE"],
			label: "AWS_PROFILE"
		})
	};
	return {
		mode: "aws-sdk",
		source: "aws-sdk default chain"
	};
}
async function resolveApiKeyForProvider(params) {
	const { provider, cfg, profileId, preferredProfile } = params;
	const store = params.store ?? ensureAuthProfileStore(params.agentDir);
	if (profileId) {
		const resolved = await resolveApiKeyForProfile({
			cfg,
			store,
			profileId,
			agentDir: params.agentDir
		});
		if (!resolved) throw new Error(`No credentials found for profile "${profileId}".`);
		const mode = store.profiles[profileId]?.type;
		return {
			apiKey: resolved.apiKey,
			profileId,
			source: `profile:${profileId}`,
			mode: mode === "oauth" ? "oauth" : mode === "token" ? "token" : "api-key"
		};
	}
	const authOverride = resolveProviderAuthOverride(cfg, provider);
	if (authOverride === "aws-sdk") return resolveAwsSdkAuthInfo();
	const order = resolveAuthProfileOrder({
		cfg,
		store,
		provider,
		preferredProfile
	});
	for (const candidate of order) try {
		const resolved = await resolveApiKeyForProfile({
			cfg,
			store,
			profileId: candidate,
			agentDir: params.agentDir
		});
		if (resolved) {
			const mode = store.profiles[candidate]?.type;
			const resolvedMode = mode === "oauth" ? "oauth" : mode === "token" ? "token" : "api-key";
			return {
				apiKey: resolved.apiKey,
				profileId: candidate,
				source: `profile:${candidate}`,
				mode: resolvedMode
			};
		}
	} catch (err) {
		log.debug?.(`auth profile "${candidate}" failed for provider "${provider}": ${String(err)}`);
	}
	const envResolved = resolveEnvApiKey(provider);
	if (envResolved) {
		const resolvedMode = envResolved.source.includes("OAUTH_TOKEN") ? "oauth" : "api-key";
		return {
			apiKey: envResolved.apiKey,
			source: envResolved.source,
			mode: resolvedMode
		};
	}
	const customKey = resolveUsableCustomProviderApiKey({
		cfg,
		provider
	});
	if (customKey) return {
		apiKey: customKey.apiKey,
		source: customKey.source,
		mode: "api-key"
	};
	const syntheticLocalAuth = resolveSyntheticLocalProviderAuth({
		cfg,
		provider
	});
	if (syntheticLocalAuth) return syntheticLocalAuth;
	const normalized = normalizeProviderId(provider);
	if (authOverride === void 0 && normalized === "amazon-bedrock") return resolveAwsSdkAuthInfo();
	const providerConfig = resolveProviderConfig(cfg, provider);
	if ((!(Array.isArray(providerConfig?.models) && providerConfig.models.length > 0) ? resolveOwningPluginIdsForProvider({
		provider,
		config: cfg
	}) : void 0)?.length) {
		const pluginMissingAuthMessage = buildProviderMissingAuthMessageWithPlugin({
			provider,
			config: cfg,
			context: {
				config: cfg,
				agentDir: params.agentDir,
				env: process.env,
				provider,
				listProfileIds: (providerId) => listProfilesForProvider(store, providerId)
			}
		});
		if (pluginMissingAuthMessage) throw new Error(pluginMissingAuthMessage);
	}
	const authStorePath = resolveAuthStorePathForDisplay(params.agentDir);
	const resolvedAgentDir = path.dirname(authStorePath);
	throw new Error([
		`No API key found for provider "${provider}".`,
		`Auth store: ${authStorePath} (agentDir: ${resolvedAgentDir}).`,
		`Configure auth for this agent (${formatCliCommand("openclaw agents add <id>")}) or copy auth-profiles.json from the main agentDir.`
	].join(" "));
}
function resolveModelAuthMode(provider, cfg, store) {
	const resolved = provider?.trim();
	if (!resolved) return;
	const authOverride = resolveProviderAuthOverride(cfg, resolved);
	if (authOverride === "aws-sdk") return "aws-sdk";
	const authStore = store ?? ensureAuthProfileStore();
	const profiles = listProfilesForProvider(authStore, resolved);
	if (profiles.length > 0) {
		const modes = new Set(profiles.map((id) => authStore.profiles[id]?.type).filter((mode) => Boolean(mode)));
		if ([
			"oauth",
			"token",
			"api_key"
		].filter((k) => modes.has(k)).length >= 2) return "mixed";
		if (modes.has("oauth")) return "oauth";
		if (modes.has("token")) return "token";
		if (modes.has("api_key")) return "api-key";
	}
	if (authOverride === void 0 && normalizeProviderId(resolved) === "amazon-bedrock") return "aws-sdk";
	const envKey = resolveEnvApiKey(resolved);
	if (envKey?.apiKey) return envKey.source.includes("OAUTH_TOKEN") ? "oauth" : "api-key";
	if (hasUsableCustomProviderApiKey(cfg, resolved)) return "api-key";
	return "unknown";
}
async function hasAvailableAuthForProvider(params) {
	const { provider, cfg, preferredProfile } = params;
	const store = params.store ?? ensureAuthProfileStore(params.agentDir);
	const authOverride = resolveProviderAuthOverride(cfg, provider);
	if (authOverride === "aws-sdk") return true;
	const order = resolveAuthProfileOrder({
		cfg,
		store,
		provider,
		preferredProfile
	});
	for (const candidate of order) try {
		if (await resolveApiKeyForProfile({
			cfg,
			store,
			profileId: candidate,
			agentDir: params.agentDir
		})) return true;
	} catch (err) {
		log.debug?.(`auth profile "${candidate}" failed for provider "${provider}": ${String(err)}`);
	}
	if (resolveEnvApiKey(provider)) return true;
	if (resolveUsableCustomProviderApiKey({
		cfg,
		provider
	})) return true;
	if (resolveSyntheticLocalProviderAuth({
		cfg,
		provider
	})) return true;
	return authOverride === void 0 && normalizeProviderId(provider) === "amazon-bedrock";
}
async function getApiKeyForModel(params) {
	return resolveApiKeyForProvider({
		provider: params.model.provider,
		cfg: params.cfg,
		profileId: params.profileId,
		preferredProfile: params.preferredProfile,
		store: params.store,
		agentDir: params.agentDir
	});
}
function applyLocalNoAuthHeaderOverride(model, auth) {
	if (auth?.apiKey !== "custom-local" || model.api !== "openai-completions") return model;
	const headers = {
		...model.headers,
		Authorization: null
	};
	return {
		...model,
		headers
	};
}
/**
* When the provider config sets `authHeader: true`, inject an explicit
* `Authorization: Bearer <apiKey>` header into the model so downstream SDKs
* (e.g. `@google/genai`) send credentials via the standard HTTP Authorization
* header instead of vendor-specific headers like `x-goog-api-key`.
*
* This is a no-op when `authHeader` is not `true`, when no API key is
* available, or when the API key is a synthetic marker (e.g. local-server
* placeholders) rather than a real credential.
*/
function applyAuthHeaderOverride(model, auth, cfg) {
	if (!auth?.apiKey) return model;
	if (isNonSecretApiKeyMarker(auth.apiKey)) return model;
	if (!resolveProviderConfig(cfg, model.provider)?.authHeader) return model;
	const headers = {};
	if (model.headers) {
		for (const [key, value] of Object.entries(model.headers)) if (key.toLowerCase() !== "authorization") headers[key] = value;
	}
	headers.Authorization = `Bearer ${auth.apiKey}`;
	return {
		...model,
		headers
	};
}
//#endregion
export { hasAvailableAuthForProvider as a, resolveModelAuthMode as c, getCustomProviderApiKey as i, resolveUsableCustomProviderApiKey as l, applyLocalNoAuthHeaderOverride as n, hasUsableCustomProviderApiKey as o, getApiKeyForModel as r, resolveApiKeyForProvider as s, applyAuthHeaderOverride as t };
