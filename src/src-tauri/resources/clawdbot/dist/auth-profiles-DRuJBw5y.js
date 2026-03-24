import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { f as log, n as resolveAuthStorePath, o as AUTH_STORE_LOCK_OPTIONS, t as ensureAuthStoreFile } from "./paths-C4Oy7wjk.js";
import { i as normalizeProviderIdForAuth, n as findNormalizedProviderValue, r as normalizeProviderId, t as findNormalizedProviderKey } from "./provider-id-Cjha-r0T.js";
import { s as loadConfig } from "./io-y3Az_Onx.js";
import { i as coerceSecretRef, l as normalizeSecretInputString } from "./types.secrets-DgX397vI.js";
import { r as withFileLock } from "./file-lock-DEiVq2ow.js";
import { i as resolveSecretRefString } from "./resolve-B7S4PlnO.js";
import { c as ensureAuthProfileStore, m as updateAuthProfileStoreWithLock, n as listProfilesForProvider, p as saveAuthProfileStore, t as dedupeProfileIds } from "./profiles-COPO-hHI.js";
import { t as redactIdentifier } from "./redact-identifier-B01McILe.js";
import { getOAuthApiKey, getOAuthProviders } from "@mariozechner/pi-ai/oauth";
import { createHash, randomBytes } from "node:crypto";
//#region src/agents/auth-profiles/display.ts
function resolveAuthProfileDisplayLabel(params) {
	const { cfg, store, profileId } = params;
	const profile = store.profiles[profileId];
	const email = cfg?.auth?.profiles?.[profileId]?.email?.trim() || (profile && "email" in profile ? profile.email?.trim() : void 0);
	if (email) return `${profileId} (${email})`;
	return profileId;
}
//#endregion
//#region src/plugins/provider-runtime.runtime.ts
let providerRuntimePromise;
async function loadProviderRuntime() {
	providerRuntimePromise ??= import("./provider-runtime-BSXC4Y4i.js");
	return providerRuntimePromise;
}
async function augmentModelCatalogWithProviderPlugins(...args) {
	return (await loadProviderRuntime()).augmentModelCatalogWithProviderPlugins(...args);
}
async function buildProviderAuthDoctorHintWithPlugin(...args) {
	return (await loadProviderRuntime()).buildProviderAuthDoctorHintWithPlugin(...args);
}
async function formatProviderAuthProfileApiKeyWithPlugin(...args) {
	return (await loadProviderRuntime()).formatProviderAuthProfileApiKeyWithPlugin(...args);
}
async function refreshProviderOAuthCredentialWithPlugin(...args) {
	return (await loadProviderRuntime()).refreshProviderOAuthCredentialWithPlugin(...args);
}
//#endregion
//#region src/agents/auth-profiles/doctor.ts
async function formatAuthDoctorHint(params) {
	const normalizedProvider = normalizeProviderId(params.provider);
	const pluginHint = await buildProviderAuthDoctorHintWithPlugin({
		provider: normalizedProvider,
		context: {
			config: params.cfg,
			store: params.store,
			provider: normalizedProvider,
			profileId: params.profileId
		}
	});
	if (typeof pluginHint === "string" && pluginHint.trim()) return pluginHint;
	return "";
}
//#endregion
//#region src/agents/chutes-oauth.ts
const CHUTES_OAUTH_ISSUER = "https://api.chutes.ai";
const CHUTES_AUTHORIZE_ENDPOINT = `${CHUTES_OAUTH_ISSUER}/idp/authorize`;
const CHUTES_TOKEN_ENDPOINT = `${CHUTES_OAUTH_ISSUER}/idp/token`;
const CHUTES_USERINFO_ENDPOINT = `${CHUTES_OAUTH_ISSUER}/idp/userinfo`;
const DEFAULT_EXPIRES_BUFFER_MS = 300 * 1e3;
function generateChutesPkce() {
	const verifier = randomBytes(32).toString("hex");
	return {
		verifier,
		challenge: createHash("sha256").update(verifier).digest("base64url")
	};
}
function parseOAuthCallbackInput(input, expectedState) {
	const trimmed = input.trim();
	if (!trimmed) return { error: "No input provided" };
	let url;
	try {
		url = new URL(trimmed);
	} catch {
		if (!/\s/.test(trimmed) && !trimmed.includes("://") && !trimmed.includes("?") && !trimmed.includes("=")) return { error: "Paste the full redirect URL (must include code + state)." };
		const qs = trimmed.startsWith("?") ? trimmed : `?${trimmed}`;
		try {
			url = new URL(`http://localhost/${qs}`);
		} catch {
			return { error: "Paste the full redirect URL (must include code + state)." };
		}
	}
	const code = url.searchParams.get("code")?.trim();
	const state = url.searchParams.get("state")?.trim();
	if (!code) return { error: "Missing 'code' parameter in URL" };
	if (!state) return { error: "Missing 'state' parameter. Paste the full redirect URL." };
	if (state !== expectedState) return { error: "OAuth state mismatch - possible CSRF attack. Please retry login." };
	return {
		code,
		state
	};
}
function coerceExpiresAt(expiresInSeconds, now) {
	const value = now + Math.max(0, Math.floor(expiresInSeconds)) * 1e3 - DEFAULT_EXPIRES_BUFFER_MS;
	return Math.max(value, now + 3e4);
}
async function fetchChutesUserInfo(params) {
	const response = await (params.fetchFn ?? fetch)(CHUTES_USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${params.accessToken}` } });
	if (!response.ok) return null;
	const data = await response.json();
	if (!data || typeof data !== "object") return null;
	return data;
}
async function exchangeChutesCodeForTokens(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const now = params.now ?? Date.now();
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		client_id: params.app.clientId,
		code: params.code,
		redirect_uri: params.app.redirectUri,
		code_verifier: params.codeVerifier
	});
	if (params.app.clientSecret) body.set("client_secret", params.app.clientSecret);
	const response = await fetchFn(CHUTES_TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Chutes token exchange failed: ${text}`);
	}
	const data = await response.json();
	const access = data.access_token?.trim();
	const refresh = data.refresh_token?.trim();
	const expiresIn = data.expires_in ?? 0;
	if (!access) throw new Error("Chutes token exchange returned no access_token");
	if (!refresh) throw new Error("Chutes token exchange returned no refresh_token");
	const info = await fetchChutesUserInfo({
		accessToken: access,
		fetchFn
	});
	return {
		access,
		refresh,
		expires: coerceExpiresAt(expiresIn, now),
		email: info?.username,
		accountId: info?.sub,
		clientId: params.app.clientId
	};
}
async function refreshChutesTokens(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const now = params.now ?? Date.now();
	const refreshToken = params.credential.refresh?.trim();
	if (!refreshToken) throw new Error("Chutes OAuth credential is missing refresh token");
	const clientId = params.credential.clientId?.trim() ?? process.env.CHUTES_CLIENT_ID?.trim();
	if (!clientId) throw new Error("Missing CHUTES_CLIENT_ID for Chutes OAuth refresh (set env var or re-auth).");
	const clientSecret = process.env.CHUTES_CLIENT_SECRET?.trim() || void 0;
	const body = new URLSearchParams({
		grant_type: "refresh_token",
		client_id: clientId,
		refresh_token: refreshToken
	});
	if (clientSecret) body.set("client_secret", clientSecret);
	const response = await fetchFn(CHUTES_TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Chutes token refresh failed: ${text}`);
	}
	const data = await response.json();
	const access = data.access_token?.trim();
	const newRefresh = data.refresh_token?.trim();
	const expiresIn = data.expires_in ?? 0;
	if (!access) throw new Error("Chutes token refresh returned no access_token");
	return {
		...params.credential,
		access,
		refresh: newRefresh || refreshToken,
		expires: coerceExpiresAt(expiresIn, now),
		clientId
	};
}
//#endregion
//#region src/agents/auth-profiles/credential-state.ts
function resolveTokenExpiryState(expires, now = Date.now()) {
	if (expires === void 0) return "missing";
	if (typeof expires !== "number") return "invalid_expires";
	if (!Number.isFinite(expires) || expires <= 0) return "invalid_expires";
	return now >= expires ? "expired" : "valid";
}
function hasConfiguredSecretRef(value) {
	return coerceSecretRef(value) !== null;
}
function hasConfiguredSecretString(value) {
	return normalizeSecretInputString(value) !== void 0;
}
function evaluateStoredCredentialEligibility(params) {
	const now = params.now ?? Date.now();
	const credential = params.credential;
	if (credential.type === "api_key") {
		const hasKey = hasConfiguredSecretString(credential.key);
		const hasKeyRef = hasConfiguredSecretRef(credential.keyRef);
		if (!hasKey && !hasKeyRef) return {
			eligible: false,
			reasonCode: "missing_credential"
		};
		return {
			eligible: true,
			reasonCode: "ok"
		};
	}
	if (credential.type === "token") {
		const hasToken = hasConfiguredSecretString(credential.token);
		const hasTokenRef = hasConfiguredSecretRef(credential.tokenRef);
		if (!hasToken && !hasTokenRef) return {
			eligible: false,
			reasonCode: "missing_credential"
		};
		const expiryState = resolveTokenExpiryState(credential.expires, now);
		if (expiryState === "invalid_expires") return {
			eligible: false,
			reasonCode: "invalid_expires"
		};
		if (expiryState === "expired") return {
			eligible: false,
			reasonCode: "expired"
		};
		return {
			eligible: true,
			reasonCode: "ok"
		};
	}
	if (normalizeSecretInputString(credential.access) === void 0 && normalizeSecretInputString(credential.refresh) === void 0) return {
		eligible: false,
		reasonCode: "missing_credential"
	};
	return {
		eligible: true,
		reasonCode: "ok"
	};
}
//#endregion
//#region src/agents/auth-profiles/repair.ts
function getProfileSuffix(profileId) {
	const idx = profileId.indexOf(":");
	if (idx < 0) return "";
	return profileId.slice(idx + 1);
}
function isEmailLike(value) {
	const trimmed = value.trim();
	if (!trimmed) return false;
	return trimmed.includes("@") && trimmed.includes(".");
}
function suggestOAuthProfileIdForLegacyDefault(params) {
	const providerKey = normalizeProviderId(params.provider);
	if (getProfileSuffix(params.legacyProfileId) !== "default") return null;
	const legacyCfg = params.cfg?.auth?.profiles?.[params.legacyProfileId];
	if (legacyCfg && normalizeProviderId(legacyCfg.provider) === providerKey && legacyCfg.mode !== "oauth") return null;
	const oauthProfiles = listProfilesForProvider(params.store, providerKey).filter((id) => params.store.profiles[id]?.type === "oauth");
	if (oauthProfiles.length === 0) return null;
	const configuredEmail = legacyCfg?.email?.trim();
	if (configuredEmail) {
		const byEmail = oauthProfiles.find((id) => {
			const cred = params.store.profiles[id];
			if (!cred || cred.type !== "oauth") return false;
			return cred.email?.trim() === configuredEmail || id === `${providerKey}:${configuredEmail}`;
		});
		if (byEmail) return byEmail;
	}
	const lastGood = params.store.lastGood?.[providerKey] ?? params.store.lastGood?.[params.provider];
	if (lastGood && oauthProfiles.includes(lastGood)) return lastGood;
	const nonLegacy = oauthProfiles.filter((id) => id !== params.legacyProfileId);
	if (nonLegacy.length === 1) return nonLegacy[0] ?? null;
	const emailLike = nonLegacy.filter((id) => isEmailLike(getProfileSuffix(id)));
	if (emailLike.length === 1) return emailLike[0] ?? null;
	return null;
}
function repairOAuthProfileIdMismatch(params) {
	const legacyProfileId = params.legacyProfileId ?? `${normalizeProviderId(params.provider)}:default`;
	const legacyCfg = params.cfg.auth?.profiles?.[legacyProfileId];
	if (!legacyCfg) return {
		config: params.cfg,
		changes: [],
		migrated: false
	};
	if (legacyCfg.mode !== "oauth") return {
		config: params.cfg,
		changes: [],
		migrated: false
	};
	if (normalizeProviderId(legacyCfg.provider) !== normalizeProviderId(params.provider)) return {
		config: params.cfg,
		changes: [],
		migrated: false
	};
	const toProfileId = suggestOAuthProfileIdForLegacyDefault({
		cfg: params.cfg,
		store: params.store,
		provider: params.provider,
		legacyProfileId
	});
	if (!toProfileId || toProfileId === legacyProfileId) return {
		config: params.cfg,
		changes: [],
		migrated: false
	};
	const toCred = params.store.profiles[toProfileId];
	const toEmail = toCred?.type === "oauth" ? toCred.email?.trim() : void 0;
	const nextProfiles = { ...params.cfg.auth?.profiles };
	delete nextProfiles[legacyProfileId];
	nextProfiles[toProfileId] = {
		...legacyCfg,
		...toEmail ? { email: toEmail } : {}
	};
	const providerKey = normalizeProviderId(params.provider);
	const nextOrder = (() => {
		const order = params.cfg.auth?.order;
		if (!order) return;
		const resolvedKey = findNormalizedProviderKey(order, providerKey);
		if (!resolvedKey) return order;
		const existing = order[resolvedKey];
		if (!Array.isArray(existing)) return order;
		const deduped = dedupeProfileIds(existing.map((id) => id === legacyProfileId ? toProfileId : id).filter((id) => typeof id === "string" && id.trim().length > 0));
		return {
			...order,
			[resolvedKey]: deduped
		};
	})();
	return {
		config: {
			...params.cfg,
			auth: {
				...params.cfg.auth,
				profiles: nextProfiles,
				...nextOrder ? { order: nextOrder } : {}
			}
		},
		changes: [`Auth: migrate ${legacyProfileId} → ${toProfileId} (OAuth profile id)`],
		migrated: true,
		fromProfileId: legacyProfileId,
		toProfileId
	};
}
//#endregion
//#region src/agents/auth-profiles/oauth.ts
function listOAuthProviderIds() {
	if (typeof getOAuthProviders !== "function") return [];
	const providers = getOAuthProviders();
	if (!Array.isArray(providers)) return [];
	return providers.map((provider) => provider && typeof provider === "object" && "id" in provider && typeof provider.id === "string" ? provider.id : void 0).filter((providerId) => typeof providerId === "string");
}
const OAUTH_PROVIDER_IDS = new Set(listOAuthProviderIds());
const isOAuthProvider = (provider) => OAUTH_PROVIDER_IDS.has(provider);
const resolveOAuthProvider = (provider) => isOAuthProvider(provider) ? provider : null;
/** Bearer-token auth modes that are interchangeable (oauth tokens and raw tokens). */
const BEARER_AUTH_MODES = new Set(["oauth", "token"]);
const isCompatibleModeType = (mode, type) => {
	if (!mode || !type) return false;
	if (mode === type) return true;
	return BEARER_AUTH_MODES.has(mode) && BEARER_AUTH_MODES.has(type);
};
function isProfileConfigCompatible(params) {
	const profileConfig = params.cfg?.auth?.profiles?.[params.profileId];
	if (profileConfig && profileConfig.provider !== params.provider) return false;
	if (profileConfig && !isCompatibleModeType(profileConfig.mode, params.mode)) return false;
	return true;
}
async function buildOAuthApiKey(provider, credentials) {
	const formatted = await formatProviderAuthProfileApiKeyWithPlugin({
		provider,
		context: credentials
	});
	return typeof formatted === "string" && formatted.length > 0 ? formatted : credentials.access;
}
function buildApiKeyProfileResult(params) {
	return {
		apiKey: params.apiKey,
		provider: params.provider,
		email: params.email
	};
}
async function buildOAuthProfileResult(params) {
	return buildApiKeyProfileResult({
		apiKey: await buildOAuthApiKey(params.provider, params.credentials),
		provider: params.provider,
		email: params.email
	});
}
function extractErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
function adoptNewerMainOAuthCredential(params) {
	if (!params.agentDir) return null;
	try {
		const mainCred = ensureAuthProfileStore(void 0).profiles[params.profileId];
		if (mainCred?.type === "oauth" && mainCred.provider === params.cred.provider && Number.isFinite(mainCred.expires) && (!Number.isFinite(params.cred.expires) || mainCred.expires > params.cred.expires)) {
			params.store.profiles[params.profileId] = { ...mainCred };
			saveAuthProfileStore(params.store, params.agentDir);
			log.info("adopted newer OAuth credentials from main agent", {
				profileId: params.profileId,
				agentDir: params.agentDir,
				expires: new Date(mainCred.expires).toISOString()
			});
			return mainCred;
		}
	} catch (err) {
		log.debug("adoptNewerMainOAuthCredential failed", {
			profileId: params.profileId,
			error: err instanceof Error ? err.message : String(err)
		});
	}
	return null;
}
async function refreshOAuthTokenWithLock(params) {
	const authPath = resolveAuthStorePath(params.agentDir);
	ensureAuthStoreFile(authPath);
	return await withFileLock(authPath, AUTH_STORE_LOCK_OPTIONS, async () => {
		const store = ensureAuthProfileStore(params.agentDir);
		const cred = store.profiles[params.profileId];
		if (!cred || cred.type !== "oauth") return null;
		if (Date.now() < cred.expires) return {
			apiKey: await buildOAuthApiKey(cred.provider, cred),
			newCredentials: cred
		};
		const pluginRefreshed = await refreshProviderOAuthCredentialWithPlugin({
			provider: cred.provider,
			context: cred
		});
		if (pluginRefreshed) return {
			apiKey: await buildOAuthApiKey(cred.provider, pluginRefreshed),
			newCredentials: pluginRefreshed
		};
		const oauthCreds = { [cred.provider]: cred };
		const result = String(cred.provider) === "chutes" ? await (async () => {
			const newCredentials = await refreshChutesTokens({ credential: cred });
			return {
				apiKey: newCredentials.access,
				newCredentials
			};
		})() : await (async () => {
			const oauthProvider = resolveOAuthProvider(cred.provider);
			if (!oauthProvider) return null;
			if (typeof getOAuthApiKey !== "function") return null;
			return await getOAuthApiKey(oauthProvider, oauthCreds);
		})();
		if (!result) return null;
		store.profiles[params.profileId] = {
			...cred,
			...result.newCredentials,
			type: "oauth"
		};
		saveAuthProfileStore(store, params.agentDir);
		return result;
	});
}
async function tryResolveOAuthProfile(params) {
	const { cfg, store, profileId } = params;
	const cred = store.profiles[profileId];
	if (!cred || cred.type !== "oauth") return null;
	if (!isProfileConfigCompatible({
		cfg,
		profileId,
		provider: cred.provider,
		mode: cred.type
	})) return null;
	if (Date.now() < cred.expires) return await buildOAuthProfileResult({
		provider: cred.provider,
		credentials: cred,
		email: cred.email
	});
	const refreshed = await refreshOAuthTokenWithLock({
		profileId,
		agentDir: params.agentDir
	});
	if (!refreshed) return null;
	return buildApiKeyProfileResult({
		apiKey: refreshed.apiKey,
		provider: cred.provider,
		email: cred.email
	});
}
async function resolveProfileSecretString(params) {
	let resolvedValue = params.value?.trim();
	if (resolvedValue) {
		const inlineRef = coerceSecretRef(resolvedValue, params.refDefaults);
		if (inlineRef) try {
			resolvedValue = await resolveSecretRefString(inlineRef, {
				config: params.configForRefResolution,
				env: process.env,
				cache: params.cache
			});
		} catch (err) {
			log.debug(params.inlineFailureMessage, {
				profileId: params.profileId,
				provider: params.provider,
				error: err instanceof Error ? err.message : String(err)
			});
		}
	}
	const explicitRef = coerceSecretRef(params.valueRef, params.refDefaults);
	if (!resolvedValue && explicitRef) try {
		resolvedValue = await resolveSecretRefString(explicitRef, {
			config: params.configForRefResolution,
			env: process.env,
			cache: params.cache
		});
	} catch (err) {
		log.debug(params.refFailureMessage, {
			profileId: params.profileId,
			provider: params.provider,
			error: err instanceof Error ? err.message : String(err)
		});
	}
	return resolvedValue;
}
async function resolveApiKeyForProfile(params) {
	const { cfg, store, profileId } = params;
	const cred = store.profiles[profileId];
	if (!cred) return null;
	if (!isProfileConfigCompatible({
		cfg,
		profileId,
		provider: cred.provider,
		mode: cred.type,
		allowOAuthTokenCompatibility: true
	})) return null;
	const refResolveCache = {};
	const configForRefResolution = cfg ?? loadConfig();
	const refDefaults = configForRefResolution.secrets?.defaults;
	if (cred.type === "api_key") {
		const key = await resolveProfileSecretString({
			profileId,
			provider: cred.provider,
			value: cred.key,
			valueRef: cred.keyRef,
			refDefaults,
			configForRefResolution,
			cache: refResolveCache,
			inlineFailureMessage: "failed to resolve inline auth profile api_key ref",
			refFailureMessage: "failed to resolve auth profile api_key ref"
		});
		if (!key) return null;
		return buildApiKeyProfileResult({
			apiKey: key,
			provider: cred.provider,
			email: cred.email
		});
	}
	if (cred.type === "token") {
		const expiryState = resolveTokenExpiryState(cred.expires);
		if (expiryState === "expired" || expiryState === "invalid_expires") return null;
		const token = await resolveProfileSecretString({
			profileId,
			provider: cred.provider,
			value: cred.token,
			valueRef: cred.tokenRef,
			refDefaults,
			configForRefResolution,
			cache: refResolveCache,
			inlineFailureMessage: "failed to resolve inline auth profile token ref",
			refFailureMessage: "failed to resolve auth profile token ref"
		});
		if (!token) return null;
		return buildApiKeyProfileResult({
			apiKey: token,
			provider: cred.provider,
			email: cred.email
		});
	}
	const oauthCred = adoptNewerMainOAuthCredential({
		store,
		profileId,
		agentDir: params.agentDir,
		cred
	}) ?? cred;
	if (Date.now() < oauthCred.expires) return await buildOAuthProfileResult({
		provider: oauthCred.provider,
		credentials: oauthCred,
		email: oauthCred.email
	});
	try {
		const result = await refreshOAuthTokenWithLock({
			profileId,
			agentDir: params.agentDir
		});
		if (!result) return null;
		return buildApiKeyProfileResult({
			apiKey: result.apiKey,
			provider: cred.provider,
			email: cred.email
		});
	} catch (error) {
		const refreshedStore = ensureAuthProfileStore(params.agentDir);
		const refreshed = refreshedStore.profiles[profileId];
		if (refreshed?.type === "oauth" && Date.now() < refreshed.expires) return await buildOAuthProfileResult({
			provider: refreshed.provider,
			credentials: refreshed,
			email: refreshed.email ?? cred.email
		});
		const fallbackProfileId = suggestOAuthProfileIdForLegacyDefault({
			cfg,
			store: refreshedStore,
			provider: cred.provider,
			legacyProfileId: profileId
		});
		if (fallbackProfileId && fallbackProfileId !== profileId) try {
			const fallbackResolved = await tryResolveOAuthProfile({
				cfg,
				store: refreshedStore,
				profileId: fallbackProfileId,
				agentDir: params.agentDir
			});
			if (fallbackResolved) return fallbackResolved;
		} catch {}
		if (params.agentDir) try {
			const mainCred = ensureAuthProfileStore(void 0).profiles[profileId];
			if (mainCred?.type === "oauth" && Date.now() < mainCred.expires) {
				refreshedStore.profiles[profileId] = { ...mainCred };
				saveAuthProfileStore(refreshedStore, params.agentDir);
				log.info("inherited fresh OAuth credentials from main agent", {
					profileId,
					agentDir: params.agentDir,
					expires: new Date(mainCred.expires).toISOString()
				});
				return await buildOAuthProfileResult({
					provider: mainCred.provider,
					credentials: mainCred,
					email: mainCred.email
				});
			}
		} catch {}
		const message = extractErrorMessage(error);
		const hint = await formatAuthDoctorHint({
			cfg,
			store: refreshedStore,
			provider: cred.provider,
			profileId
		});
		throw new Error(`OAuth token refresh failed for ${cred.provider}: ${message}. Please try again or re-authenticate.` + (hint ? `\n\n${hint}` : ""), { cause: error });
	}
}
//#endregion
//#region src/agents/console-sanitize.ts
function sanitizeForConsole(text, maxChars = 200) {
	const trimmed = text?.trim();
	if (!trimmed) return;
	const sanitized = Array.from(trimmed).filter((char) => {
		const code = char.charCodeAt(0);
		return !(code <= 8 || code === 11 || code === 12 || code >= 14 && code <= 31 || code === 127);
	}).join("").replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
	return sanitized.length > maxChars ? `${sanitized.slice(0, maxChars)}…` : sanitized;
}
//#endregion
//#region src/agents/auth-profiles/state-observation.ts
const observationLog = createSubsystemLogger("agent/embedded");
function logAuthProfileFailureStateChange(params) {
	const windowType = params.reason === "billing" || params.reason === "auth_permanent" ? "disabled" : "cooldown";
	const previousCooldownUntil = params.previous?.cooldownUntil;
	const previousDisabledUntil = params.previous?.disabledUntil;
	const windowReused = windowType === "disabled" ? typeof previousDisabledUntil === "number" && Number.isFinite(previousDisabledUntil) && previousDisabledUntil > params.now && previousDisabledUntil === params.next.disabledUntil : typeof previousCooldownUntil === "number" && Number.isFinite(previousCooldownUntil) && previousCooldownUntil > params.now && previousCooldownUntil === params.next.cooldownUntil;
	const safeProfileId = redactIdentifier(params.profileId, { len: 12 });
	const safeRunId = sanitizeForConsole(params.runId) ?? "-";
	const safeProvider = sanitizeForConsole(params.provider) ?? "-";
	observationLog.warn("auth profile failure state updated", {
		event: "auth_profile_failure_state_updated",
		tags: [
			"error_handling",
			"auth_profiles",
			windowType
		],
		runId: params.runId,
		profileId: safeProfileId,
		provider: params.provider,
		reason: params.reason,
		windowType,
		windowReused,
		previousErrorCount: params.previous?.errorCount,
		errorCount: params.next.errorCount,
		previousCooldownUntil,
		cooldownUntil: params.next.cooldownUntil,
		previousDisabledUntil,
		disabledUntil: params.next.disabledUntil,
		previousDisabledReason: params.previous?.disabledReason,
		disabledReason: params.next.disabledReason,
		failureCounts: params.next.failureCounts,
		consoleMessage: `auth profile failure state updated: runId=${safeRunId} profile=${safeProfileId} provider=${safeProvider} reason=${params.reason} window=${windowType} reused=${String(windowReused)}`
	});
}
//#endregion
//#region src/agents/auth-profiles/usage.ts
const authProfileUsageDeps = {
	saveAuthProfileStore,
	updateAuthProfileStoreWithLock
};
const FAILURE_REASON_PRIORITY = [
	"auth_permanent",
	"auth",
	"billing",
	"format",
	"model_not_found",
	"overloaded",
	"timeout",
	"rate_limit",
	"unknown"
];
const FAILURE_REASON_SET = new Set(FAILURE_REASON_PRIORITY);
const FAILURE_REASON_ORDER = new Map(FAILURE_REASON_PRIORITY.map((reason, index) => [reason, index]));
function isAuthCooldownBypassedForProvider(provider) {
	const normalized = normalizeProviderId(provider ?? "");
	return normalized === "openrouter" || normalized === "kilocode";
}
function resolveProfileUnusableUntil(stats) {
	const values = [stats.cooldownUntil, stats.disabledUntil].filter((value) => typeof value === "number").filter((value) => Number.isFinite(value) && value > 0);
	if (values.length === 0) return null;
	return Math.max(...values);
}
/**
* Check if a profile is currently in cooldown (due to rate limits, overload, or other transient failures).
*/
function isProfileInCooldown(store, profileId, now) {
	if (isAuthCooldownBypassedForProvider(store.profiles[profileId]?.provider)) return false;
	const stats = store.usageStats?.[profileId];
	if (!stats) return false;
	const unusableUntil = resolveProfileUnusableUntil(stats);
	return unusableUntil ? (now ?? Date.now()) < unusableUntil : false;
}
function isActiveUnusableWindow(until, now) {
	return typeof until === "number" && Number.isFinite(until) && until > 0 && now < until;
}
/**
* Infer the most likely reason all candidate profiles are currently unavailable.
*
* We prefer explicit active `disabledReason` values (for example billing/auth)
* over generic cooldown buckets, then fall back to failure-count signals.
*/
function resolveProfilesUnavailableReason(params) {
	const now = params.now ?? Date.now();
	const scores = /* @__PURE__ */ new Map();
	const addScore = (reason, value) => {
		if (!FAILURE_REASON_SET.has(reason) || value <= 0 || !Number.isFinite(value)) return;
		scores.set(reason, (scores.get(reason) ?? 0) + value);
	};
	for (const profileId of params.profileIds) {
		const stats = params.store.usageStats?.[profileId];
		if (!stats) continue;
		if (isActiveUnusableWindow(stats.disabledUntil, now) && stats.disabledReason && FAILURE_REASON_SET.has(stats.disabledReason)) {
			addScore(stats.disabledReason, 1e3);
			continue;
		}
		if (!isActiveUnusableWindow(stats.cooldownUntil, now)) continue;
		let recordedReason = false;
		for (const [rawReason, rawCount] of Object.entries(stats.failureCounts ?? {})) {
			const reason = rawReason;
			const count = typeof rawCount === "number" ? rawCount : 0;
			if (!FAILURE_REASON_SET.has(reason) || count <= 0) continue;
			addScore(reason, count);
			recordedReason = true;
		}
		if (!recordedReason) addScore("unknown", 1);
	}
	if (scores.size === 0) return null;
	let best = null;
	let bestScore = -1;
	let bestPriority = Number.MAX_SAFE_INTEGER;
	for (const reason of FAILURE_REASON_PRIORITY) {
		const score = scores.get(reason);
		if (typeof score !== "number") continue;
		const priority = FAILURE_REASON_ORDER.get(reason) ?? Number.MAX_SAFE_INTEGER;
		if (score > bestScore || score === bestScore && priority < bestPriority) {
			best = reason;
			bestScore = score;
			bestPriority = priority;
		}
	}
	return best;
}
/**
* Return the soonest `unusableUntil` timestamp (ms epoch) among the given
* profiles, or `null` when no profile has a recorded cooldown. Note: the
* returned timestamp may be in the past if the cooldown has already expired.
*/
function getSoonestCooldownExpiry(store, profileIds) {
	let soonest = null;
	for (const id of profileIds) {
		const stats = store.usageStats?.[id];
		if (!stats) continue;
		const until = resolveProfileUnusableUntil(stats);
		if (typeof until !== "number" || !Number.isFinite(until) || until <= 0) continue;
		if (soonest === null || until < soonest) soonest = until;
	}
	return soonest;
}
/**
* Clear expired cooldowns from all profiles in the store.
*
* When `cooldownUntil` or `disabledUntil` has passed, the corresponding fields
* are removed and error counters are reset so the profile gets a fresh start
* (circuit-breaker half-open → closed). Without this, a stale `errorCount`
* causes the *next* transient failure to immediately escalate to a much longer
* cooldown — the root cause of profiles appearing "stuck" after rate limits.
*
* `cooldownUntil` and `disabledUntil` are handled independently: if a profile
* has both and only one has expired, only that field is cleared.
*
* Mutates the in-memory store; disk persistence happens lazily on the next
* store write (e.g. `markAuthProfileUsed` / `markAuthProfileFailure`), which
* matches the existing save pattern throughout the auth-profiles module.
*
* @returns `true` if any profile was modified.
*/
function clearExpiredCooldowns(store, now) {
	const usageStats = store.usageStats;
	if (!usageStats) return false;
	const ts = now ?? Date.now();
	let mutated = false;
	for (const [profileId, stats] of Object.entries(usageStats)) {
		if (!stats) continue;
		let profileMutated = false;
		const cooldownExpired = typeof stats.cooldownUntil === "number" && Number.isFinite(stats.cooldownUntil) && stats.cooldownUntil > 0 && ts >= stats.cooldownUntil;
		const disabledExpired = typeof stats.disabledUntil === "number" && Number.isFinite(stats.disabledUntil) && stats.disabledUntil > 0 && ts >= stats.disabledUntil;
		if (cooldownExpired) {
			stats.cooldownUntil = void 0;
			profileMutated = true;
		}
		if (disabledExpired) {
			stats.disabledUntil = void 0;
			stats.disabledReason = void 0;
			profileMutated = true;
		}
		if (profileMutated && !resolveProfileUnusableUntil(stats)) {
			stats.errorCount = 0;
			stats.failureCounts = void 0;
		}
		if (profileMutated) {
			usageStats[profileId] = stats;
			mutated = true;
		}
	}
	return mutated;
}
/**
* Mark a profile as successfully used. Resets error count and updates lastUsed.
* Uses store lock to avoid overwriting concurrent usage updates.
*/
async function markAuthProfileUsed(params) {
	const { store, profileId, agentDir } = params;
	const updated = await authProfileUsageDeps.updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			if (!freshStore.profiles[profileId]) return false;
			updateUsageStatsEntry(freshStore, profileId, (existing) => resetUsageStats(existing, { lastUsed: Date.now() }));
			return true;
		}
	});
	if (updated) {
		store.usageStats = updated.usageStats;
		return;
	}
	if (!store.profiles[profileId]) return;
	updateUsageStatsEntry(store, profileId, (existing) => resetUsageStats(existing, { lastUsed: Date.now() }));
	authProfileUsageDeps.saveAuthProfileStore(store, agentDir);
}
function calculateAuthProfileCooldownMs(errorCount) {
	const normalized = Math.max(1, errorCount);
	return Math.min(3600 * 1e3, 60 * 1e3 * 5 ** Math.min(normalized - 1, 3));
}
function resolveAuthCooldownConfig(params) {
	const defaults = {
		billingBackoffHours: 5,
		billingMaxHours: 24,
		failureWindowHours: 24
	};
	const resolveHours = (value, fallback) => typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
	const cooldowns = params.cfg?.auth?.cooldowns;
	const billingBackoffHours = resolveHours((() => {
		const map = cooldowns?.billingBackoffHoursByProvider;
		if (!map) return;
		for (const [key, value] of Object.entries(map)) if (normalizeProviderId(key) === params.providerId) return value;
	})() ?? cooldowns?.billingBackoffHours, defaults.billingBackoffHours);
	const billingMaxHours = resolveHours(cooldowns?.billingMaxHours, defaults.billingMaxHours);
	const failureWindowHours = resolveHours(cooldowns?.failureWindowHours, defaults.failureWindowHours);
	return {
		billingBackoffMs: billingBackoffHours * 60 * 60 * 1e3,
		billingMaxMs: billingMaxHours * 60 * 60 * 1e3,
		failureWindowMs: failureWindowHours * 60 * 60 * 1e3
	};
}
function calculateAuthProfileBillingDisableMsWithConfig(params) {
	const normalized = Math.max(1, params.errorCount);
	const baseMs = Math.max(6e4, params.baseMs);
	const maxMs = Math.max(baseMs, params.maxMs);
	const raw = baseMs * 2 ** Math.min(normalized - 1, 10);
	return Math.min(maxMs, raw);
}
function resolveProfileUnusableUntilForDisplay(store, profileId) {
	if (isAuthCooldownBypassedForProvider(store.profiles[profileId]?.provider)) return null;
	const stats = store.usageStats?.[profileId];
	if (!stats) return null;
	return resolveProfileUnusableUntil(stats);
}
function resetUsageStats(existing, overrides) {
	return {
		...existing,
		errorCount: 0,
		cooldownUntil: void 0,
		disabledUntil: void 0,
		disabledReason: void 0,
		failureCounts: void 0,
		...overrides
	};
}
function updateUsageStatsEntry(store, profileId, updater) {
	store.usageStats = store.usageStats ?? {};
	store.usageStats[profileId] = updater(store.usageStats[profileId]);
}
function keepActiveWindowOrRecompute(params) {
	const { existingUntil, now, recomputedUntil } = params;
	return typeof existingUntil === "number" && Number.isFinite(existingUntil) && existingUntil > now ? existingUntil : recomputedUntil;
}
function computeNextProfileUsageStats(params) {
	const windowMs = params.cfgResolved.failureWindowMs;
	const windowExpired = typeof params.existing.lastFailureAt === "number" && params.existing.lastFailureAt > 0 && params.now - params.existing.lastFailureAt > windowMs;
	const unusableUntil = resolveProfileUnusableUntil(params.existing);
	const previousCooldownExpired = typeof unusableUntil === "number" && params.now >= unusableUntil;
	const shouldResetCounters = windowExpired || previousCooldownExpired;
	const nextErrorCount = (shouldResetCounters ? 0 : params.existing.errorCount ?? 0) + 1;
	const failureCounts = shouldResetCounters ? {} : { ...params.existing.failureCounts };
	failureCounts[params.reason] = (failureCounts[params.reason] ?? 0) + 1;
	const updatedStats = {
		...params.existing,
		errorCount: nextErrorCount,
		failureCounts,
		lastFailureAt: params.now
	};
	if (params.reason === "billing" || params.reason === "auth_permanent") {
		const backoffMs = calculateAuthProfileBillingDisableMsWithConfig({
			errorCount: failureCounts[params.reason] ?? 1,
			baseMs: params.cfgResolved.billingBackoffMs,
			maxMs: params.cfgResolved.billingMaxMs
		});
		updatedStats.disabledUntil = keepActiveWindowOrRecompute({
			existingUntil: params.existing.disabledUntil,
			now: params.now,
			recomputedUntil: params.now + backoffMs
		});
		updatedStats.disabledReason = params.reason;
	} else {
		const backoffMs = calculateAuthProfileCooldownMs(nextErrorCount);
		updatedStats.cooldownUntil = keepActiveWindowOrRecompute({
			existingUntil: params.existing.cooldownUntil,
			now: params.now,
			recomputedUntil: params.now + backoffMs
		});
	}
	return updatedStats;
}
/**
* Mark a profile as failed for a specific reason. Billing and permanent-auth
* failures are treated as "disabled" (longer backoff) vs the regular cooldown
* window.
*/
async function markAuthProfileFailure(params) {
	const { store, profileId, reason, agentDir, cfg, runId } = params;
	const profile = store.profiles[profileId];
	if (!profile || isAuthCooldownBypassedForProvider(profile.provider)) return;
	let nextStats;
	let previousStats;
	let updateTime = 0;
	const updated = await authProfileUsageDeps.updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			const profile = freshStore.profiles[profileId];
			if (!profile || isAuthCooldownBypassedForProvider(profile.provider)) return false;
			const now = Date.now();
			const cfgResolved = resolveAuthCooldownConfig({
				cfg,
				providerId: normalizeProviderId(profile.provider)
			});
			previousStats = freshStore.usageStats?.[profileId];
			updateTime = now;
			const computed = computeNextProfileUsageStats({
				existing: previousStats ?? {},
				now,
				reason,
				cfgResolved
			});
			nextStats = computed;
			updateUsageStatsEntry(freshStore, profileId, () => computed);
			return true;
		}
	});
	if (updated) {
		store.usageStats = updated.usageStats;
		if (nextStats) logAuthProfileFailureStateChange({
			runId,
			profileId,
			provider: profile.provider,
			reason,
			previous: previousStats,
			next: nextStats,
			now: updateTime
		});
		return;
	}
	if (!store.profiles[profileId]) return;
	const now = Date.now();
	const cfgResolved = resolveAuthCooldownConfig({
		cfg,
		providerId: normalizeProviderId(store.profiles[profileId]?.provider ?? "")
	});
	previousStats = store.usageStats?.[profileId];
	const computed = computeNextProfileUsageStats({
		existing: previousStats ?? {},
		now,
		reason,
		cfgResolved
	});
	nextStats = computed;
	updateUsageStatsEntry(store, profileId, () => computed);
	authProfileUsageDeps.saveAuthProfileStore(store, agentDir);
	logAuthProfileFailureStateChange({
		runId,
		profileId,
		provider: store.profiles[profileId]?.provider ?? profile.provider,
		reason,
		previous: previousStats,
		next: nextStats,
		now
	});
}
/**
* Mark a profile as transiently failed. Applies exponential backoff cooldown.
* Cooldown times: 1min, 5min, 25min, max 1 hour.
* Uses store lock to avoid overwriting concurrent usage updates.
*/
async function markAuthProfileCooldown(params) {
	await markAuthProfileFailure({
		store: params.store,
		profileId: params.profileId,
		reason: "unknown",
		agentDir: params.agentDir,
		runId: params.runId
	});
}
/**
* Clear cooldown for a profile (e.g., manual reset).
* Uses store lock to avoid overwriting concurrent usage updates.
*/
async function clearAuthProfileCooldown(params) {
	const { store, profileId, agentDir } = params;
	const updated = await authProfileUsageDeps.updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			if (!freshStore.usageStats?.[profileId]) return false;
			updateUsageStatsEntry(freshStore, profileId, (existing) => resetUsageStats(existing));
			return true;
		}
	});
	if (updated) {
		store.usageStats = updated.usageStats;
		return;
	}
	if (!store.usageStats?.[profileId]) return;
	updateUsageStatsEntry(store, profileId, (existing) => resetUsageStats(existing));
	authProfileUsageDeps.saveAuthProfileStore(store, agentDir);
}
//#endregion
//#region src/agents/auth-profiles/order.ts
function resolveAuthProfileEligibility(params) {
	const providerAuthKey = normalizeProviderIdForAuth(params.provider);
	const cred = params.store.profiles[params.profileId];
	if (!cred) return {
		eligible: false,
		reasonCode: "profile_missing"
	};
	if (normalizeProviderIdForAuth(cred.provider) !== providerAuthKey) return {
		eligible: false,
		reasonCode: "provider_mismatch"
	};
	const profileConfig = params.cfg?.auth?.profiles?.[params.profileId];
	if (profileConfig) {
		if (normalizeProviderIdForAuth(profileConfig.provider) !== providerAuthKey) return {
			eligible: false,
			reasonCode: "provider_mismatch"
		};
		if (profileConfig.mode !== cred.type) {
			if (!(profileConfig.mode === "oauth" && cred.type === "token")) return {
				eligible: false,
				reasonCode: "mode_mismatch"
			};
		}
	}
	const credentialEligibility = evaluateStoredCredentialEligibility({
		credential: cred,
		now: params.now
	});
	return {
		eligible: credentialEligibility.eligible,
		reasonCode: credentialEligibility.reasonCode
	};
}
function resolveAuthProfileOrder(params) {
	const { cfg, store, provider, preferredProfile } = params;
	const providerKey = normalizeProviderId(provider);
	const providerAuthKey = normalizeProviderIdForAuth(provider);
	const now = Date.now();
	clearExpiredCooldowns(store, now);
	const storedOrder = findNormalizedProviderValue(store.order, providerKey);
	const configuredOrder = findNormalizedProviderValue(cfg?.auth?.order, providerKey);
	const explicitOrder = storedOrder ?? configuredOrder;
	const explicitProfiles = cfg?.auth?.profiles ? Object.entries(cfg.auth.profiles).filter(([, profile]) => normalizeProviderIdForAuth(profile.provider) === providerAuthKey).map(([profileId]) => profileId) : [];
	const baseOrder = explicitOrder ?? (explicitProfiles.length > 0 ? explicitProfiles : listProfilesForProvider(store, provider));
	if (baseOrder.length === 0) return [];
	const isValidProfile = (profileId) => resolveAuthProfileEligibility({
		cfg,
		store,
		provider: providerAuthKey,
		profileId,
		now
	}).eligible;
	let filtered = baseOrder.filter(isValidProfile);
	const allBaseProfilesMissing = baseOrder.every((profileId) => !store.profiles[profileId]);
	if (filtered.length === 0 && explicitProfiles.length > 0 && allBaseProfilesMissing) filtered = listProfilesForProvider(store, provider).filter(isValidProfile);
	const deduped = dedupeProfileIds(filtered);
	if (explicitOrder && explicitOrder.length > 0) {
		const available = [];
		const inCooldown = [];
		for (const profileId of deduped) if (isProfileInCooldown(store, profileId)) {
			const cooldownUntil = resolveProfileUnusableUntil(store.usageStats?.[profileId] ?? {}) ?? now;
			inCooldown.push({
				profileId,
				cooldownUntil
			});
		} else available.push(profileId);
		const cooldownSorted = inCooldown.toSorted((a, b) => a.cooldownUntil - b.cooldownUntil).map((entry) => entry.profileId);
		const ordered = [...available, ...cooldownSorted];
		if (preferredProfile && ordered.includes(preferredProfile)) return [preferredProfile, ...ordered.filter((e) => e !== preferredProfile)];
		return ordered;
	}
	const sorted = orderProfilesByMode(deduped, store);
	if (preferredProfile && sorted.includes(preferredProfile)) return [preferredProfile, ...sorted.filter((e) => e !== preferredProfile)];
	return sorted;
}
function orderProfilesByMode(order, store) {
	const now = Date.now();
	const available = [];
	const inCooldown = [];
	for (const profileId of order) if (isProfileInCooldown(store, profileId)) inCooldown.push(profileId);
	else available.push(profileId);
	const sorted = available.map((profileId) => {
		const type = store.profiles[profileId]?.type;
		return {
			profileId,
			typeScore: type === "oauth" ? 0 : type === "token" ? 1 : type === "api_key" ? 2 : 3,
			lastUsed: store.usageStats?.[profileId]?.lastUsed ?? 0
		};
	}).toSorted((a, b) => {
		if (a.typeScore !== b.typeScore) return a.typeScore - b.typeScore;
		return a.lastUsed - b.lastUsed;
	}).map((entry) => entry.profileId);
	const cooldownSorted = inCooldown.map((profileId) => ({
		profileId,
		cooldownUntil: resolveProfileUnusableUntil(store.usageStats?.[profileId] ?? {}) ?? now
	})).toSorted((a, b) => a.cooldownUntil - b.cooldownUntil).map((entry) => entry.profileId);
	return [...sorted, ...cooldownSorted];
}
//#endregion
export { formatAuthDoctorHint as C, parseOAuthCallbackInput as S, resolveAuthProfileDisplayLabel as T, evaluateStoredCredentialEligibility as _, clearExpiredCooldowns as a, exchangeChutesCodeForTokens as b, markAuthProfileCooldown as c, resolveProfileUnusableUntilForDisplay as d, resolveProfilesUnavailableReason as f, suggestOAuthProfileIdForLegacyDefault as g, repairOAuthProfileIdMismatch as h, clearAuthProfileCooldown as i, markAuthProfileFailure as l, resolveApiKeyForProfile as m, resolveAuthProfileOrder as n, getSoonestCooldownExpiry as o, sanitizeForConsole as p, calculateAuthProfileCooldownMs as r, isProfileInCooldown as s, resolveAuthProfileEligibility as t, markAuthProfileUsed as u, resolveTokenExpiryState as v, augmentModelCatalogWithProviderPlugins as w, generateChutesPkce as x, CHUTES_AUTHORIZE_ENDPOINT as y };
