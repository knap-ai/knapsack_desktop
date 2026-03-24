import { a as hasConfiguredSecretInput, d as resolveSecretInputRef } from "./types.secrets-DgX397vI.js";
import { n as containsEnvVarReference } from "./env-substitution-O6uabUmO.js";
//#region src/gateway/credential-planner.ts
function trimToUndefined(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
/**
* Like trimToUndefined but also rejects unresolved env var placeholders (e.g. `${VAR}`).
* This prevents literal placeholder strings like `${OPENCLAW_GATEWAY_TOKEN}` from being
* accepted as valid credentials when the referenced env var is missing.
* Note: legitimate credential values containing literal `${UPPER_CASE}` patterns will
* also be rejected, but this is an extremely unlikely edge case.
*/
function trimCredentialToUndefined(value) {
	const trimmed = trimToUndefined(value);
	if (trimmed && containsEnvVarReference(trimmed)) return;
	return trimmed;
}
function readGatewayTokenEnv(env = process.env) {
	return trimToUndefined(env.OPENCLAW_GATEWAY_TOKEN);
}
function readGatewayPasswordEnv(env = process.env) {
	return trimToUndefined(env.OPENCLAW_GATEWAY_PASSWORD);
}
function hasGatewayTokenEnvCandidate(env = process.env) {
	return Boolean(readGatewayTokenEnv(env));
}
function hasGatewayPasswordEnvCandidate(env = process.env) {
	return Boolean(readGatewayPasswordEnv(env));
}
function resolveConfiguredGatewayCredentialInput(params) {
	const ref = resolveSecretInputRef({
		value: params.value,
		defaults: params.defaults
	}).ref;
	return {
		path: params.path,
		configured: hasConfiguredSecretInput(params.value, params.defaults),
		value: ref ? void 0 : trimToUndefined(params.value),
		refPath: ref ? params.path : void 0,
		hasSecretRef: ref !== null
	};
}
function createGatewayCredentialPlan(params) {
	const env = params.env ?? process.env;
	const gateway = params.config.gateway;
	const remote = gateway?.remote;
	const defaults = params.defaults ?? params.config.secrets?.defaults;
	const authMode = gateway?.auth?.mode;
	const envToken = readGatewayTokenEnv(env);
	const envPassword = readGatewayPasswordEnv(env);
	const localToken = resolveConfiguredGatewayCredentialInput({
		value: gateway?.auth?.token,
		defaults,
		path: "gateway.auth.token"
	});
	const localPassword = resolveConfiguredGatewayCredentialInput({
		value: gateway?.auth?.password,
		defaults,
		path: "gateway.auth.password"
	});
	const remoteToken = resolveConfiguredGatewayCredentialInput({
		value: remote?.token,
		defaults,
		path: "gateway.remote.token"
	});
	const remotePassword = resolveConfiguredGatewayCredentialInput({
		value: remote?.password,
		defaults,
		path: "gateway.remote.password"
	});
	const localTokenCanWin = authMode !== "password" && authMode !== "none" && authMode !== "trusted-proxy";
	const tokenCanWin = Boolean(envToken || localToken.configured || remoteToken.configured);
	const passwordCanWin = authMode === "password" || authMode !== "token" && authMode !== "none" && authMode !== "trusted-proxy" && !tokenCanWin;
	const localTokenSurfaceActive = localTokenCanWin && !envToken && (authMode === "token" || authMode === void 0 && !(envPassword || localPassword.configured));
	const remoteMode = gateway?.mode === "remote";
	const remoteUrlConfigured = Boolean(trimToUndefined(remote?.url));
	const tailscaleRemoteExposure = gateway?.tailscale?.mode === "serve" || gateway?.tailscale?.mode === "funnel";
	const remoteConfiguredSurface = remoteMode || remoteUrlConfigured || tailscaleRemoteExposure;
	const remoteTokenFallbackActive = localTokenCanWin && !envToken && !localToken.configured;
	const remotePasswordFallbackActive = !envPassword && !localPassword.configured && passwordCanWin;
	return {
		configuredMode: gateway?.mode === "remote" ? "remote" : "local",
		authMode,
		envToken,
		envPassword,
		localToken,
		localPassword,
		remoteToken,
		remotePassword,
		localTokenCanWin,
		localPasswordCanWin: passwordCanWin,
		localTokenSurfaceActive,
		tokenCanWin,
		passwordCanWin,
		remoteMode,
		remoteUrlConfigured,
		tailscaleRemoteExposure,
		remoteConfiguredSurface,
		remoteTokenFallbackActive,
		remoteTokenActive: remoteConfiguredSurface || remoteTokenFallbackActive,
		remotePasswordFallbackActive,
		remotePasswordActive: remoteConfiguredSurface || remotePasswordFallbackActive
	};
}
//#endregion
//#region src/gateway/credentials.ts
const GATEWAY_SECRET_REF_UNAVAILABLE_ERROR_CODE = "GATEWAY_SECRET_REF_UNAVAILABLE";
var GatewaySecretRefUnavailableError = class extends Error {
	constructor(path) {
		super([
			`${path} is configured as a secret reference but is unavailable in this command path.`,
			"Fix: set OPENCLAW_GATEWAY_TOKEN/OPENCLAW_GATEWAY_PASSWORD, pass explicit --token/--password,",
			"or run a gateway command path that resolves secret references before credential selection."
		].join("\n"));
		this.code = GATEWAY_SECRET_REF_UNAVAILABLE_ERROR_CODE;
		this.name = "GatewaySecretRefUnavailableError";
		this.path = path;
	}
};
function isGatewaySecretRefUnavailableError(error, expectedPath) {
	if (!(error instanceof GatewaySecretRefUnavailableError)) return false;
	if (!expectedPath) return true;
	return error.path === expectedPath;
}
function firstDefined(values) {
	for (const value of values) if (value) return value;
}
function throwUnresolvedGatewaySecretInput(path) {
	throw new GatewaySecretRefUnavailableError(path);
}
function resolveGatewayCredentialsFromValues(params) {
	const env = params.env ?? process.env;
	const envToken = readGatewayTokenEnv(env);
	const envPassword = readGatewayPasswordEnv(env);
	const configToken = trimCredentialToUndefined(params.configToken);
	const configPassword = trimCredentialToUndefined(params.configPassword);
	const tokenPrecedence = params.tokenPrecedence ?? "env-first";
	const passwordPrecedence = params.passwordPrecedence ?? "env-first";
	return {
		token: tokenPrecedence === "config-first" ? firstDefined([configToken, envToken]) : firstDefined([envToken, configToken]),
		password: passwordPrecedence === "config-first" ? firstDefined([configPassword, envPassword]) : firstDefined([envPassword, configPassword])
	};
}
function resolveLocalGatewayCredentials(params) {
	const localResolved = resolveGatewayCredentialsFromValues({
		configToken: params.plan.localToken.configured ? params.plan.localToken.value : params.plan.remoteToken.value,
		configPassword: params.plan.localPassword.configured ? params.plan.localPassword.value : params.plan.remotePassword.value,
		env: params.env,
		tokenPrecedence: params.localTokenPrecedence,
		passwordPrecedence: params.localPasswordPrecedence
	});
	const localPasswordCanWin = params.plan.authMode === "password" || params.plan.authMode !== "token" && params.plan.authMode !== "none" && params.plan.authMode !== "trusted-proxy" && !localResolved.token;
	const localTokenCanWin = params.plan.authMode === "token" || params.plan.authMode !== "password" && params.plan.authMode !== "none" && params.plan.authMode !== "trusted-proxy" && !localResolved.password;
	if (params.plan.localToken.refPath && params.localTokenPrecedence === "config-first" && !params.plan.localToken.value && Boolean(params.plan.envToken) && localTokenCanWin) throwUnresolvedGatewaySecretInput(params.plan.localToken.refPath);
	if (params.plan.localPassword.refPath && params.localPasswordPrecedence === "config-first" && !params.plan.localPassword.value && Boolean(params.plan.envPassword) && localPasswordCanWin) throwUnresolvedGatewaySecretInput(params.plan.localPassword.refPath);
	if (params.plan.localToken.refPath && !localResolved.token && !params.plan.envToken && localTokenCanWin) throwUnresolvedGatewaySecretInput(params.plan.localToken.refPath);
	if (params.plan.localPassword.refPath && !localResolved.password && !params.plan.envPassword && localPasswordCanWin) throwUnresolvedGatewaySecretInput(params.plan.localPassword.refPath);
	return localResolved;
}
function resolveRemoteGatewayCredentials(params) {
	const token = params.remoteTokenFallback === "remote-only" ? params.plan.remoteToken.value : params.remoteTokenPrecedence === "env-first" ? firstDefined([
		params.plan.envToken,
		params.plan.remoteToken.value,
		params.plan.localToken.value
	]) : firstDefined([
		params.plan.remoteToken.value,
		params.plan.envToken,
		params.plan.localToken.value
	]);
	const password = params.remotePasswordFallback === "remote-only" ? params.plan.remotePassword.value : params.remotePasswordPrecedence === "env-first" ? firstDefined([
		params.plan.envPassword,
		params.plan.remotePassword.value,
		params.plan.localPassword.value
	]) : firstDefined([
		params.plan.remotePassword.value,
		params.plan.envPassword,
		params.plan.localPassword.value
	]);
	const localTokenFallbackEnabled = params.remoteTokenFallback !== "remote-only";
	const localTokenFallback = params.remoteTokenFallback === "remote-only" ? void 0 : params.plan.localToken.value;
	const localPasswordFallback = params.remotePasswordFallback === "remote-only" ? void 0 : params.plan.localPassword.value;
	if (params.plan.remoteToken.refPath && !token && !params.plan.envToken && !localTokenFallback && !password) throwUnresolvedGatewaySecretInput(params.plan.remoteToken.refPath);
	if (params.plan.remotePassword.refPath && !password && !params.plan.envPassword && !localPasswordFallback && !token) throwUnresolvedGatewaySecretInput(params.plan.remotePassword.refPath);
	if (params.plan.localToken.refPath && localTokenFallbackEnabled && !token && !password && !params.plan.envToken && !params.plan.remoteToken.value && params.plan.localTokenCanWin) throwUnresolvedGatewaySecretInput(params.plan.localToken.refPath);
	return {
		token,
		password
	};
}
function resolveGatewayCredentialsFromConfig(params) {
	const env = params.env ?? process.env;
	const explicitToken = trimToUndefined(params.explicitAuth?.token);
	const explicitPassword = trimToUndefined(params.explicitAuth?.password);
	if (explicitToken || explicitPassword) return {
		token: explicitToken,
		password: explicitPassword
	};
	if (trimToUndefined(params.urlOverride) && params.urlOverrideSource !== "env") return {};
	if (trimToUndefined(params.urlOverride) && params.urlOverrideSource === "env") return resolveGatewayCredentialsFromValues({
		configToken: void 0,
		configPassword: void 0,
		env,
		tokenPrecedence: "env-first",
		passwordPrecedence: "env-first"
	});
	const plan = createGatewayCredentialPlan({
		config: params.cfg,
		env
	});
	const mode = params.modeOverride ?? plan.configuredMode;
	const localTokenPrecedence = params.localTokenPrecedence ?? (env.OPENCLAW_SERVICE_KIND === "gateway" ? "config-first" : "env-first");
	const localPasswordPrecedence = params.localPasswordPrecedence ?? "env-first";
	if (mode === "local") return resolveLocalGatewayCredentials({
		plan,
		env,
		localTokenPrecedence,
		localPasswordPrecedence
	});
	const remoteTokenFallback = params.remoteTokenFallback ?? "remote-env-local";
	const remotePasswordFallback = params.remotePasswordFallback ?? "remote-env-local";
	return resolveRemoteGatewayCredentials({
		plan,
		remoteTokenPrecedence: params.remoteTokenPrecedence ?? "remote-first",
		remotePasswordPrecedence: params.remotePasswordPrecedence ?? "env-first",
		remoteTokenFallback,
		remotePasswordFallback
	});
}
function resolveGatewayProbeCredentialsFromConfig(params) {
	return resolveGatewayCredentialsFromConfig({
		cfg: params.cfg,
		env: params.env,
		explicitAuth: params.explicitAuth,
		modeOverride: params.mode,
		remoteTokenFallback: "remote-only"
	});
}
function resolveGatewayDriftCheckCredentialsFromConfig(params) {
	return resolveGatewayCredentialsFromConfig({
		cfg: params.cfg,
		env: {},
		modeOverride: "local",
		localTokenPrecedence: "config-first"
	});
}
//#endregion
export { resolveGatewayDriftCheckCredentialsFromConfig as a, hasGatewayPasswordEnvCandidate as c, readGatewayTokenEnv as d, trimToUndefined as f, resolveGatewayCredentialsFromValues as i, hasGatewayTokenEnvCandidate as l, isGatewaySecretRefUnavailableError as n, resolveGatewayProbeCredentialsFromConfig as o, resolveGatewayCredentialsFromConfig as r, createGatewayCredentialPlan as s, GatewaySecretRefUnavailableError as t, readGatewayPasswordEnv as u };
