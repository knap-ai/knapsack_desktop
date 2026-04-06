import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, v as normalizeOptionalAccountId } from "./session-key-D7XpmyVq.js";
import { c as normalizeResolvedSecretInputString, i as coerceSecretRef } from "./types.secrets-DTXJhyWe.js";
import "./secret-input-C8U7qpTM.js";
import { a as ssrfPolicyFromAllowPrivateNetwork, t as assertHttpUrlTargetsPrivateNetwork } from "./ssrf-policy-B7Ivb-NK.js";
import "./ssrf-runtime-BoGiIhjZ.js";
import "./provider-auth-rTeK2_Yu.js";
import { a as resolveMatrixDefaultOrOnlyAccountId, l as resolveMatrixAccountStringValues, n as requiresExplicitMatrixDefaultAccount, o as getMatrixScopedEnvVarNames } from "./account-selection-BoMWBXkb.js";
import { c as resolveMatrixBaseConfig, i as findMatrixAccountConfig, o as listNormalizedMatrixAccountIds, t as resolveMatrixConfigFieldPath } from "./config-paths-TkWX6drG.js";
import { t as getMatrixRuntime } from "./runtime-Jdij2_G2.js";
import net from "node:net";
//#region extensions/matrix/src/matrix/client/private-network-host.ts
function normalizeHost(host) {
	const normalized = host.trim().toLowerCase().replace(/\.+$/, "");
	return normalized.startsWith("[") && normalized.endsWith("]") ? normalized.slice(1, -1) : normalized;
}
function isPrivateIpv4(host) {
	const parts = host.split(".").map((part) => Number(part));
	if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
	const [a, b] = parts;
	return a === 10 || a === 127 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 169 && b === 254 || a === 100 && b >= 64 && b <= 127;
}
function isPrivateIpv6(host) {
	if (host === "::1") return true;
	if (host === "::" || host.startsWith("ff")) return false;
	return host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:");
}
function isPrivateOrLoopbackHost(host) {
	const normalized = normalizeHost(host);
	if (!normalized) return false;
	if (normalized === "localhost") return true;
	const family = net.isIP(normalized);
	if (family === 4) return isPrivateIpv4(normalized);
	if (family === 6) return isPrivateIpv6(normalized);
	return false;
}
//#endregion
//#region extensions/matrix/src/matrix/client/config.ts
let matrixAuthClientDepsPromise;
let matrixCredentialsReadDepsPromise;
let matrixSecretInputDepsPromise;
async function loadMatrixAuthClientDeps() {
	matrixAuthClientDepsPromise ??= Promise.all([import("./sdk-CEWV6TvL.js"), import("./logging-DWj0SbXp.js")]).then(([sdkModule, loggingModule]) => ({
		MatrixClient: sdkModule.MatrixClient,
		ensureMatrixSdkLoggingConfigured: loggingModule.ensureMatrixSdkLoggingConfigured
	}));
	return await matrixAuthClientDepsPromise;
}
async function loadMatrixCredentialsReadDeps() {
	matrixCredentialsReadDepsPromise ??= import("./credentials-read-yLjHWuwe.js").then((credentialsReadModule) => ({
		loadMatrixCredentials: credentialsReadModule.loadMatrixCredentials,
		credentialsMatchConfig: credentialsReadModule.credentialsMatchConfig
	}));
	return await matrixCredentialsReadDepsPromise;
}
async function loadMatrixSecretInputDeps() {
	matrixSecretInputDepsPromise ??= import("./config-secret-input.runtime-CI8K7IFQ.js").then((runtime) => ({ resolveConfiguredSecretInputString: runtime.resolveConfiguredSecretInputString }));
	return await matrixSecretInputDepsPromise;
}
function readEnvSecretRefFallback(params) {
	const ref = coerceSecretRef(params.value, params.config?.secrets?.defaults);
	if (!ref || ref.source !== "env" || !params.env) return;
	const providerConfig = params.config?.secrets?.providers?.[ref.provider];
	if (providerConfig) {
		if (providerConfig.source !== "env") throw new Error(`Secret provider "${ref.provider}" has source "${providerConfig.source}" but ref requests "env".`);
		if (providerConfig.allowlist && !providerConfig.allowlist.includes(ref.id)) throw new Error(`Environment variable "${ref.id}" is not allowlisted in secrets.providers.${ref.provider}.allowlist.`);
	} else if (ref.provider !== (params.config?.secrets?.defaults?.env?.trim() || "default")) throw new Error(`Secret provider "${ref.provider}" is not configured (ref: ${ref.source}:${ref.provider}:${ref.id}).`);
	const resolved = params.env[ref.id];
	if (typeof resolved !== "string") return;
	const trimmed = resolved.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function clean(value, path, opts) {
	const ref = coerceSecretRef(value, opts?.config?.secrets?.defaults);
	if (opts?.suppressSecretRef && ref) return "";
	return normalizeResolvedSecretInputString({
		value: opts?.allowEnvSecretRefFallback ? ref?.source === "env" ? readEnvSecretRefFallback({
			value,
			env: opts.env,
			config: opts.config
		}) ?? value : ref ? "" : value : value,
		path,
		defaults: opts?.config?.secrets?.defaults
	}) ?? "";
}
function resolveMatrixBaseConfigFieldPath(field) {
	return `channels.matrix.${field}`;
}
function shouldAllowEnvSecretRefFallback(field) {
	return field === "accessToken" || field === "password";
}
function hasConfiguredSecretInputValue(value, cfg) {
	return typeof value === "string" && value.trim().length > 0 || Boolean(coerceSecretRef(value, cfg.secrets?.defaults));
}
function hasConfiguredMatrixAccessTokenSource(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const account = findMatrixAccountConfig(params.cfg, normalizedAccountId) ?? {};
	const scopedAccessTokenVar = getMatrixScopedEnvVarNames(normalizedAccountId).accessToken;
	if (hasConfiguredSecretInputValue(account.accessToken, params.cfg) || clean(params.env[scopedAccessTokenVar], scopedAccessTokenVar).length > 0) return true;
	if (normalizedAccountId !== "default") return false;
	return hasConfiguredSecretInputValue(resolveMatrixBaseConfig(params.cfg).accessToken, params.cfg) || clean(params.env.MATRIX_ACCESS_TOKEN, "MATRIX_ACCESS_TOKEN").length > 0;
}
function resolveConfiguredMatrixAuthInput(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const accountValue = (findMatrixAccountConfig(params.cfg, normalizedAccountId) ?? {})[params.field];
	if (accountValue !== void 0) return {
		value: accountValue,
		path: resolveMatrixConfigFieldPath(params.cfg, normalizedAccountId, params.field)
	};
	const scopedKeys = getMatrixScopedEnvVarNames(normalizedAccountId);
	const scopedValue = resolveScopedMatrixEnvConfig(normalizedAccountId, params.env)[params.field];
	if (scopedValue !== void 0) return {
		value: scopedValue,
		path: params.field === "accessToken" ? scopedKeys.accessToken : scopedKeys.password
	};
	if (normalizedAccountId !== "default") return;
	const baseValue = resolveMatrixBaseConfig(params.cfg)[params.field];
	if (baseValue !== void 0) return {
		value: baseValue,
		path: resolveMatrixBaseConfigFieldPath(params.field)
	};
	const globalValue = params.field === "accessToken" ? params.env.MATRIX_ACCESS_TOKEN : params.env.MATRIX_PASSWORD;
	if (globalValue !== void 0) return {
		value: globalValue,
		path: params.field === "accessToken" ? "MATRIX_ACCESS_TOKEN" : "MATRIX_PASSWORD"
	};
}
async function resolveConfiguredMatrixAuthSecretInput(params) {
	const configured = resolveConfiguredMatrixAuthInput(params);
	if (!configured) return;
	const { resolveConfiguredSecretInputString } = await loadMatrixSecretInputDeps();
	const resolved = await resolveConfiguredSecretInputString({
		config: params.cfg,
		env: params.env,
		value: configured.value,
		path: configured.path,
		unresolvedReasonStyle: "detailed"
	});
	if (resolved.value !== void 0) return resolved.value;
	if (coerceSecretRef(configured.value, params.cfg.secrets?.defaults)) throw new Error(resolved.unresolvedRefReason ?? `${configured.path} SecretRef could not be resolved.`);
}
function readMatrixBaseConfigField(matrix, field, opts) {
	return clean(matrix[field], resolveMatrixBaseConfigFieldPath(field), {
		env: opts?.env,
		config: opts?.config,
		allowEnvSecretRefFallback: shouldAllowEnvSecretRefFallback(field),
		suppressSecretRef: opts?.suppressSecretRef
	});
}
function readMatrixAccountConfigField(cfg, accountId, account, field, opts) {
	return clean(account[field], resolveMatrixConfigFieldPath(cfg, accountId, field), {
		env: opts?.env,
		config: opts?.config,
		allowEnvSecretRefFallback: shouldAllowEnvSecretRefFallback(field),
		suppressSecretRef: opts?.suppressSecretRef
	});
}
function clampMatrixInitialSyncLimit(value) {
	return typeof value === "number" ? Math.max(0, Math.floor(value)) : void 0;
}
const MATRIX_HTTP_HOMESERVER_ERROR = "Matrix homeserver must use https:// unless it targets a private or loopback host";
function buildMatrixNetworkFields(params) {
	const dispatcherPolicy = params.dispatcherPolicy ?? (params.proxy ? {
		mode: "explicit-proxy",
		proxyUrl: params.proxy
	} : void 0);
	if (!params.allowPrivateNetwork && !dispatcherPolicy) return {};
	return {
		...params.allowPrivateNetwork ? {
			allowPrivateNetwork: true,
			ssrfPolicy: ssrfPolicyFromAllowPrivateNetwork(true)
		} : {},
		...dispatcherPolicy ? { dispatcherPolicy } : {}
	};
}
function resolveGlobalMatrixEnvConfig(env) {
	return {
		homeserver: clean(env.MATRIX_HOMESERVER, "MATRIX_HOMESERVER"),
		userId: clean(env.MATRIX_USER_ID, "MATRIX_USER_ID"),
		accessToken: clean(env.MATRIX_ACCESS_TOKEN, "MATRIX_ACCESS_TOKEN") || void 0,
		password: clean(env.MATRIX_PASSWORD, "MATRIX_PASSWORD") || void 0,
		deviceId: clean(env.MATRIX_DEVICE_ID, "MATRIX_DEVICE_ID") || void 0,
		deviceName: clean(env.MATRIX_DEVICE_NAME, "MATRIX_DEVICE_NAME") || void 0
	};
}
function resolveMatrixEnvAuthReadiness(accountId, env = process.env) {
	const normalizedAccountId = normalizeAccountId(accountId);
	const scoped = resolveScopedMatrixEnvConfig(normalizedAccountId, env);
	const scopedReady = hasReadyMatrixEnvAuth(scoped);
	if (normalizedAccountId !== "default") {
		const keys = getMatrixScopedEnvVarNames(normalizedAccountId);
		return {
			ready: scopedReady,
			homeserver: scoped.homeserver || void 0,
			userId: scoped.userId || void 0,
			sourceHint: `${keys.homeserver} (+ auth vars)`,
			missingMessage: `Set per-account env vars for "${normalizedAccountId}" (for example ${keys.homeserver} + ${keys.accessToken} or ${keys.userId} + ${keys.password}).`
		};
	}
	const defaultScoped = resolveScopedMatrixEnvConfig(DEFAULT_ACCOUNT_ID, env);
	const global = resolveGlobalMatrixEnvConfig(env);
	const defaultScopedReady = hasReadyMatrixEnvAuth(defaultScoped);
	const globalReady = hasReadyMatrixEnvAuth(global);
	const defaultKeys = getMatrixScopedEnvVarNames(DEFAULT_ACCOUNT_ID);
	return {
		ready: defaultScopedReady || globalReady,
		homeserver: defaultScoped.homeserver || global.homeserver || void 0,
		userId: defaultScoped.userId || global.userId || void 0,
		sourceHint: "MATRIX_* or MATRIX_DEFAULT_*",
		missingMessage: `Set Matrix env vars for the default account (for example MATRIX_HOMESERVER + MATRIX_ACCESS_TOKEN, MATRIX_USER_ID + MATRIX_PASSWORD, or ${defaultKeys.homeserver} + ${defaultKeys.accessToken}).`
	};
}
function resolveScopedMatrixEnvConfig(accountId, env = process.env) {
	const keys = getMatrixScopedEnvVarNames(accountId);
	return {
		homeserver: clean(env[keys.homeserver], keys.homeserver),
		userId: clean(env[keys.userId], keys.userId),
		accessToken: clean(env[keys.accessToken], keys.accessToken) || void 0,
		password: clean(env[keys.password], keys.password) || void 0,
		deviceId: clean(env[keys.deviceId], keys.deviceId) || void 0,
		deviceName: clean(env[keys.deviceName], keys.deviceName) || void 0
	};
}
function hasScopedMatrixEnvConfig(accountId, env) {
	const scoped = resolveScopedMatrixEnvConfig(accountId, env);
	return Boolean(scoped.homeserver || scoped.userId || scoped.accessToken || scoped.password || scoped.deviceId || scoped.deviceName);
}
function hasReadyMatrixEnvAuth(config) {
	const homeserver = clean(config.homeserver, "matrix.env.homeserver");
	const userId = clean(config.userId, "matrix.env.userId");
	const accessToken = clean(config.accessToken, "matrix.env.accessToken");
	const password = clean(config.password, "matrix.env.password");
	return Boolean(homeserver && (accessToken || userId && password));
}
function validateMatrixHomeserverUrl(homeserver, opts) {
	const trimmed = clean(homeserver, "matrix.homeserver");
	if (!trimmed) throw new Error("Matrix homeserver is required (matrix.homeserver)");
	let parsed;
	try {
		parsed = new URL(trimmed);
	} catch {
		throw new Error("Matrix homeserver must be a valid http(s) URL");
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Matrix homeserver must use http:// or https://");
	if (!parsed.hostname) throw new Error("Matrix homeserver must include a hostname");
	if (parsed.username || parsed.password) throw new Error("Matrix homeserver URL must not include embedded credentials");
	if (parsed.search || parsed.hash) throw new Error("Matrix homeserver URL must not include query strings or fragments");
	if (parsed.protocol === "http:" && opts?.allowPrivateNetwork !== true && !isPrivateOrLoopbackHost(parsed.hostname)) throw new Error(MATRIX_HTTP_HOMESERVER_ERROR);
	return trimmed;
}
async function resolveValidatedMatrixHomeserverUrl(homeserver, opts) {
	const normalized = validateMatrixHomeserverUrl(homeserver, opts);
	await assertHttpUrlTargetsPrivateNetwork(normalized, {
		allowPrivateNetwork: opts?.allowPrivateNetwork,
		lookupFn: opts?.lookupFn,
		errorMessage: MATRIX_HTTP_HOMESERVER_ERROR
	});
	return normalized;
}
function resolveMatrixConfigForAccount(cfg, accountId, env = process.env) {
	const matrix = resolveMatrixBaseConfig(cfg);
	const account = findMatrixAccountConfig(cfg, accountId) ?? {};
	const normalizedAccountId = normalizeAccountId(accountId);
	const suppressInactivePasswordSecretRef = hasConfiguredMatrixAccessTokenSource({
		cfg,
		env,
		accountId: normalizedAccountId
	});
	const fieldReadOptions = {
		env,
		config: cfg
	};
	const scopedEnv = resolveScopedMatrixEnvConfig(normalizedAccountId, env);
	const globalEnv = resolveGlobalMatrixEnvConfig(env);
	const accountField = (field) => readMatrixAccountConfigField(cfg, normalizedAccountId, account, field, {
		...fieldReadOptions,
		suppressSecretRef: field === "password" ? suppressInactivePasswordSecretRef : void 0
	});
	const resolvedStrings = resolveMatrixAccountStringValues({
		accountId: normalizedAccountId,
		account: {
			homeserver: accountField("homeserver"),
			userId: accountField("userId"),
			accessToken: accountField("accessToken"),
			password: accountField("password"),
			deviceId: accountField("deviceId"),
			deviceName: accountField("deviceName")
		},
		scopedEnv,
		channel: {
			homeserver: readMatrixBaseConfigField(matrix, "homeserver", fieldReadOptions),
			userId: readMatrixBaseConfigField(matrix, "userId", fieldReadOptions),
			accessToken: readMatrixBaseConfigField(matrix, "accessToken", fieldReadOptions),
			password: readMatrixBaseConfigField(matrix, "password", {
				...fieldReadOptions,
				suppressSecretRef: suppressInactivePasswordSecretRef
			}),
			deviceId: readMatrixBaseConfigField(matrix, "deviceId", fieldReadOptions),
			deviceName: readMatrixBaseConfigField(matrix, "deviceName", fieldReadOptions)
		},
		globalEnv
	});
	const initialSyncLimit = clampMatrixInitialSyncLimit(account.initialSyncLimit) ?? clampMatrixInitialSyncLimit(matrix.initialSyncLimit);
	const encryption = typeof account.encryption === "boolean" ? account.encryption : matrix.encryption ?? false;
	const allowPrivateNetwork = account.allowPrivateNetwork === true || matrix.allowPrivateNetwork === true ? true : void 0;
	return {
		homeserver: resolvedStrings.homeserver,
		userId: resolvedStrings.userId,
		accessToken: resolvedStrings.accessToken || void 0,
		password: resolvedStrings.password || void 0,
		deviceId: resolvedStrings.deviceId || void 0,
		deviceName: resolvedStrings.deviceName || void 0,
		initialSyncLimit,
		encryption,
		...buildMatrixNetworkFields({
			allowPrivateNetwork,
			proxy: account.proxy ?? matrix.proxy
		})
	};
}
function resolveImplicitMatrixAccountId(cfg, env = process.env) {
	if (requiresExplicitMatrixDefaultAccount(cfg, env)) return null;
	return normalizeAccountId(resolveMatrixDefaultOrOnlyAccountId(cfg, env));
}
function resolveMatrixAuthContext(params) {
	const cfg = params?.cfg ?? getMatrixRuntime().config.loadConfig();
	const env = params?.env ?? process.env;
	const explicitAccountId = normalizeOptionalAccountId(params?.accountId);
	const effectiveAccountId = explicitAccountId ?? resolveImplicitMatrixAccountId(cfg, env);
	if (!effectiveAccountId) throw new Error("Multiple Matrix accounts are configured and channels.matrix.defaultAccount is not set. Set \"channels.matrix.defaultAccount\" to the intended account or pass --account <id>.");
	if (explicitAccountId && explicitAccountId !== "default" && !listNormalizedMatrixAccountIds(cfg).includes(explicitAccountId) && !hasScopedMatrixEnvConfig(explicitAccountId, env)) throw new Error(`Matrix account "${explicitAccountId}" is not configured. Add channels.matrix.accounts.${explicitAccountId} or define scoped ${getMatrixScopedEnvVarNames(explicitAccountId).accessToken.replace(/_ACCESS_TOKEN$/, "")}_* variables.`);
	return {
		cfg,
		env,
		accountId: effectiveAccountId,
		resolved: resolveMatrixConfigForAccount(cfg, effectiveAccountId, env)
	};
}
async function resolveMatrixAuth(params) {
	const { cfg, env, accountId, resolved } = resolveMatrixAuthContext(params);
	const accessToken = await resolveConfiguredMatrixAuthSecretInput({
		cfg,
		env,
		accountId,
		field: "accessToken"
	}) ?? resolved.accessToken;
	const tokenAuthPassword = resolved.password;
	const homeserver = await resolveValidatedMatrixHomeserverUrl(resolved.homeserver, { allowPrivateNetwork: resolved.allowPrivateNetwork });
	let credentialsWriter;
	const loadCredentialsWriter = async () => {
		credentialsWriter ??= await import("./credentials-write.runtime-03Ek_Tem.js");
		return credentialsWriter;
	};
	const { loadMatrixCredentials, credentialsMatchConfig } = await loadMatrixCredentialsReadDeps();
	const cached = loadMatrixCredentials(env, accountId);
	const cachedCredentials = cached && credentialsMatchConfig(cached, {
		homeserver,
		userId: resolved.userId || "",
		accessToken
	}) ? cached : null;
	if (accessToken) {
		let userId = resolved.userId;
		const hasMatchingCachedToken = cachedCredentials?.accessToken === accessToken;
		let knownDeviceId = hasMatchingCachedToken ? cachedCredentials?.deviceId || resolved.deviceId : resolved.deviceId;
		if (!userId || !knownDeviceId) {
			const { MatrixClient, ensureMatrixSdkLoggingConfigured } = await loadMatrixAuthClientDeps();
			ensureMatrixSdkLoggingConfigured();
			const whoami = await new MatrixClient(homeserver, accessToken, {
				ssrfPolicy: resolved.ssrfPolicy,
				dispatcherPolicy: resolved.dispatcherPolicy
			}).doRequest("GET", "/_matrix/client/v3/account/whoami");
			if (!userId) {
				const fetchedUserId = whoami.user_id?.trim();
				if (!fetchedUserId) throw new Error("Matrix whoami did not return user_id");
				userId = fetchedUserId;
			}
			if (!knownDeviceId) knownDeviceId = whoami.device_id?.trim() || resolved.deviceId;
		}
		if (!cachedCredentials || !hasMatchingCachedToken || cachedCredentials.userId !== userId || (cachedCredentials.deviceId || void 0) !== knownDeviceId) {
			const { saveMatrixCredentials } = await loadCredentialsWriter();
			await saveMatrixCredentials({
				homeserver,
				userId,
				accessToken,
				deviceId: knownDeviceId
			}, env, accountId);
		} else if (hasMatchingCachedToken) {
			const { touchMatrixCredentials } = await loadCredentialsWriter();
			await touchMatrixCredentials(env, accountId);
		}
		return {
			accountId,
			homeserver,
			userId,
			accessToken,
			password: tokenAuthPassword,
			deviceId: knownDeviceId,
			deviceName: resolved.deviceName,
			initialSyncLimit: resolved.initialSyncLimit,
			encryption: resolved.encryption,
			...buildMatrixNetworkFields({
				allowPrivateNetwork: resolved.allowPrivateNetwork,
				dispatcherPolicy: resolved.dispatcherPolicy
			})
		};
	}
	if (cachedCredentials) {
		const { touchMatrixCredentials } = await loadCredentialsWriter();
		await touchMatrixCredentials(env, accountId);
		return {
			accountId,
			homeserver: cachedCredentials.homeserver,
			userId: cachedCredentials.userId,
			accessToken: cachedCredentials.accessToken,
			password: tokenAuthPassword,
			deviceId: cachedCredentials.deviceId || resolved.deviceId,
			deviceName: resolved.deviceName,
			initialSyncLimit: resolved.initialSyncLimit,
			encryption: resolved.encryption,
			...buildMatrixNetworkFields({
				allowPrivateNetwork: resolved.allowPrivateNetwork,
				dispatcherPolicy: resolved.dispatcherPolicy
			})
		};
	}
	if (!resolved.userId) throw new Error("Matrix userId is required when no access token is configured (matrix.userId)");
	const password = await resolveConfiguredMatrixAuthSecretInput({
		cfg,
		env,
		accountId,
		field: "password"
	}) ?? resolved.password;
	if (!password) throw new Error("Matrix password is required when no access token is configured (matrix.password)");
	const { MatrixClient, ensureMatrixSdkLoggingConfigured } = await loadMatrixAuthClientDeps();
	ensureMatrixSdkLoggingConfigured();
	const login = await new MatrixClient(homeserver, "", {
		ssrfPolicy: resolved.ssrfPolicy,
		dispatcherPolicy: resolved.dispatcherPolicy
	}).doRequest("POST", "/_matrix/client/v3/login", void 0, {
		type: "m.login.password",
		identifier: {
			type: "m.id.user",
			user: resolved.userId
		},
		password,
		device_id: resolved.deviceId,
		initial_device_display_name: resolved.deviceName ?? "OpenClaw Gateway"
	});
	const loginAccessToken = login.access_token?.trim();
	if (!loginAccessToken) throw new Error("Matrix login did not return an access token");
	const auth = {
		accountId,
		homeserver,
		userId: login.user_id ?? resolved.userId,
		accessToken: loginAccessToken,
		password,
		deviceId: login.device_id ?? resolved.deviceId,
		deviceName: resolved.deviceName,
		initialSyncLimit: resolved.initialSyncLimit,
		encryption: resolved.encryption,
		...buildMatrixNetworkFields({
			allowPrivateNetwork: resolved.allowPrivateNetwork,
			dispatcherPolicy: resolved.dispatcherPolicy
		})
	};
	const { saveMatrixCredentials } = await loadCredentialsWriter();
	await saveMatrixCredentials({
		homeserver: auth.homeserver,
		userId: auth.userId,
		accessToken: auth.accessToken,
		deviceId: auth.deviceId
	}, env, accountId);
	return auth;
}
//#endregion
export { resolveMatrixEnvAuthReadiness as a, validateMatrixHomeserverUrl as c, resolveMatrixConfigForAccount as i, resolveMatrixAuth as n, resolveScopedMatrixEnvConfig as o, resolveMatrixAuthContext as r, resolveValidatedMatrixHomeserverUrl as s, hasReadyMatrixEnvAuth as t };
