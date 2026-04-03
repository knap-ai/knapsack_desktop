import { a as hasConfiguredSecretInput } from "./types.secrets-DTXJhyWe.js";
import { r as replaceConfigFile } from "./config-CJQx-9zo.js";
import { t as assertExplicitGatewayAuthModeWhenBothConfigured } from "./auth-mode-policy-Bl1h0VsT.js";
import { c as hasGatewayTokenEnvCandidate, s as hasGatewayPasswordEnvCandidate, u as readGatewayTokenEnv } from "./credentials-DyjdApQe.js";
import { a as resolveGatewayAuth } from "./auth-BHAc3x7O.js";
import { dn as errorShape, f as formatValidationErrors, un as ErrorCodes } from "./method-scopes-DNlWj6m4.js";
import { r as resolveRequiredConfiguredSecretRefInputString } from "./resolve-configured-secret-input-string-9ATuSkYC.js";
import { t as formatForLog } from "./ws-log-BMrC-EZ3.js";
import crypto from "node:crypto";
//#region src/gateway/startup-auth.ts
function mergeGatewayAuthConfig(base, override) {
	const merged = { ...base };
	if (!override) return merged;
	if (override.mode !== void 0) merged.mode = override.mode;
	if (override.token !== void 0) merged.token = override.token;
	if (override.password !== void 0) merged.password = override.password;
	if (override.allowTailscale !== void 0) merged.allowTailscale = override.allowTailscale;
	if (override.rateLimit !== void 0) merged.rateLimit = override.rateLimit;
	if (override.trustedProxy !== void 0) merged.trustedProxy = override.trustedProxy;
	return merged;
}
function mergeGatewayTailscaleConfig(base, override) {
	const merged = { ...base };
	if (!override) return merged;
	if (override.mode !== void 0) merged.mode = override.mode;
	if (override.resetOnExit !== void 0) merged.resetOnExit = override.resetOnExit;
	return merged;
}
function resolveGatewayAuthFromConfig(params) {
	const tailscaleConfig = mergeGatewayTailscaleConfig(params.cfg.gateway?.tailscale, params.tailscaleOverride);
	return resolveGatewayAuth({
		authConfig: params.cfg.gateway?.auth,
		authOverride: params.authOverride,
		env: params.env,
		tailscaleMode: tailscaleConfig.mode ?? "off"
	});
}
function shouldPersistGeneratedToken(params) {
	if (!params.persistRequested) return false;
	if (params.resolvedAuth.modeSource === "override") return false;
	return true;
}
function hasGatewayTokenCandidate(params) {
	if (readGatewayTokenEnv(params.env)) return true;
	if (typeof params.authOverride?.token === "string" && params.authOverride.token.trim().length > 0) return true;
	return hasConfiguredSecretInput(params.cfg.gateway?.auth?.token, params.cfg.secrets?.defaults);
}
function hasGatewayTokenOverrideCandidate(params) {
	return Boolean(typeof params.authOverride?.token === "string" && params.authOverride.token.trim().length > 0);
}
function hasGatewayPasswordOverrideCandidate(params) {
	if (hasGatewayPasswordEnvCandidate(params.env)) return true;
	return Boolean(typeof params.authOverride?.password === "string" && params.authOverride.password.trim().length > 0);
}
function shouldResolveGatewayTokenSecretRef(params) {
	if (hasGatewayTokenOverrideCandidate({ authOverride: params.authOverride })) return false;
	if (hasGatewayTokenEnvCandidate(params.env)) return false;
	const explicitMode = params.authOverride?.mode ?? params.cfg.gateway?.auth?.mode;
	if (explicitMode === "token") return true;
	if (explicitMode === "password" || explicitMode === "none" || explicitMode === "trusted-proxy") return false;
	if (hasGatewayPasswordOverrideCandidate(params)) return false;
	return !hasConfiguredSecretInput(params.cfg.gateway?.auth?.password, params.cfg.secrets?.defaults);
}
async function resolveGatewayTokenSecretRef(cfg, env, authOverride) {
	if (!shouldResolveGatewayTokenSecretRef({
		cfg,
		env,
		authOverride
	})) return;
	return await resolveRequiredConfiguredSecretRefInputString({
		config: cfg,
		env,
		value: cfg.gateway?.auth?.token,
		path: "gateway.auth.token"
	});
}
function shouldResolveGatewayPasswordSecretRef(params) {
	if (hasGatewayPasswordOverrideCandidate(params)) return false;
	const explicitMode = params.authOverride?.mode ?? params.cfg.gateway?.auth?.mode;
	if (explicitMode === "password") return true;
	if (explicitMode === "token" || explicitMode === "none" || explicitMode === "trusted-proxy") return false;
	if (hasGatewayTokenCandidate(params)) return false;
	return true;
}
async function resolveGatewayPasswordSecretRef(cfg, env, authOverride) {
	if (!shouldResolveGatewayPasswordSecretRef({
		cfg,
		env,
		authOverride
	})) return;
	return await resolveRequiredConfiguredSecretRefInputString({
		config: cfg,
		env,
		value: cfg.gateway?.auth?.password,
		path: "gateway.auth.password"
	});
}
async function ensureGatewayStartupAuth(params) {
	assertExplicitGatewayAuthModeWhenBothConfigured(params.cfg);
	const env = params.env ?? process.env;
	const persistRequested = params.persist === true;
	const [resolvedTokenRefValue, resolvedPasswordRefValue] = await Promise.all([resolveGatewayTokenSecretRef(params.cfg, env, params.authOverride), resolveGatewayPasswordSecretRef(params.cfg, env, params.authOverride)]);
	const authOverride = params.authOverride || resolvedTokenRefValue || resolvedPasswordRefValue ? {
		...params.authOverride,
		...resolvedTokenRefValue ? { token: resolvedTokenRefValue } : {},
		...resolvedPasswordRefValue ? { password: resolvedPasswordRefValue } : {}
	} : void 0;
	const resolved = resolveGatewayAuthFromConfig({
		cfg: params.cfg,
		env,
		authOverride,
		tailscaleOverride: params.tailscaleOverride
	});
	if (resolved.mode !== "token" || (resolved.token?.trim().length ?? 0) > 0) {
		assertHooksTokenSeparateFromGatewayAuth({
			cfg: params.cfg,
			auth: resolved
		});
		return {
			cfg: params.cfg,
			auth: resolved,
			persistedGeneratedToken: false
		};
	}
	const generatedToken = crypto.randomBytes(24).toString("hex");
	const nextCfg = {
		...params.cfg,
		gateway: {
			...params.cfg.gateway,
			auth: {
				...params.cfg.gateway?.auth,
				mode: "token",
				token: generatedToken
			}
		}
	};
	const persist = shouldPersistGeneratedToken({
		persistRequested,
		resolvedAuth: resolved
	});
	if (persist) await replaceConfigFile({
		nextConfig: nextCfg,
		baseHash: params.baseHash
	});
	const nextAuth = resolveGatewayAuthFromConfig({
		cfg: nextCfg,
		env,
		authOverride: params.authOverride,
		tailscaleOverride: params.tailscaleOverride
	});
	assertHooksTokenSeparateFromGatewayAuth({
		cfg: nextCfg,
		auth: nextAuth
	});
	return {
		cfg: nextCfg,
		auth: nextAuth,
		generatedToken,
		persistedGeneratedToken: persist
	};
}
function assertHooksTokenSeparateFromGatewayAuth(params) {
	if (params.cfg.hooks?.enabled !== true) return;
	const hooksToken = typeof params.cfg.hooks.token === "string" ? params.cfg.hooks.token.trim() : "";
	if (!hooksToken) return;
	const gatewayToken = params.auth.mode === "token" && typeof params.auth.token === "string" ? params.auth.token.trim() : "";
	if (!gatewayToken) return;
	if (hooksToken !== gatewayToken) return;
	throw new Error("Invalid config: hooks.token must not match gateway auth token. Set a distinct hooks.token for hook ingress.");
}
//#endregion
//#region src/gateway/server-methods/nodes.helpers.ts
function respondInvalidParams(params) {
	params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid ${params.method} params: ${formatValidationErrors(params.validator.errors)}`));
}
async function respondUnavailableOnThrow(respond, fn) {
	try {
		await fn();
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
	}
}
function safeParseJson(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	try {
		return JSON.parse(trimmed);
	} catch {
		return { payloadJSON: value };
	}
}
function respondUnavailableOnNodeInvokeError(respond, res) {
	if (res.ok) return true;
	const nodeError = res.error && typeof res.error === "object" ? res.error : null;
	const nodeCode = typeof nodeError?.code === "string" ? nodeError.code.trim() : "";
	const nodeMessage = typeof nodeError?.message === "string" && nodeError.message.trim().length > 0 ? nodeError.message.trim() : "node invoke failed";
	const message = nodeCode ? `${nodeCode}: ${nodeMessage}` : nodeMessage;
	respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, message, { details: { nodeError: res.error ?? null } }));
	return false;
}
//#endregion
export { ensureGatewayStartupAuth as a, safeParseJson as i, respondUnavailableOnNodeInvokeError as n, mergeGatewayAuthConfig as o, respondUnavailableOnThrow as r, mergeGatewayTailscaleConfig as s, respondInvalidParams as t };
