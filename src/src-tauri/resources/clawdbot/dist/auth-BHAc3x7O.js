import { d as resolveSecretInputRef } from "./types.secrets-DTXJhyWe.js";
import { c as readTailscaleWhoisIdentity } from "./tailscale-BZvX3b19.js";
import { t as safeEqualSecret } from "./secret-equal-BI1j2iW6.js";
import { c as normalizeHostHeader, n as isLoopbackAddress, o as isTrustedProxyAddress, p as resolveRequestClientIp, r as isLoopbackHost, u as resolveClientIp } from "./net-D3XSbNNz.js";
import "./auth-rate-limit-Du0AkGeb.js";
import { i as resolveGatewayCredentialsFromValues } from "./credentials-DyjdApQe.js";
//#region src/gateway/origin-check.ts
function parseOrigin(originRaw) {
	const trimmed = (originRaw ?? "").trim();
	if (!trimmed || trimmed === "null") return null;
	try {
		const url = new URL(trimmed);
		return {
			origin: url.origin.toLowerCase(),
			host: url.host.toLowerCase(),
			hostname: url.hostname.toLowerCase()
		};
	} catch {
		return null;
	}
}
function checkBrowserOrigin(params) {
	const parsedOrigin = parseOrigin(params.origin);
	if (!parsedOrigin) return {
		ok: false,
		reason: "origin missing or invalid"
	};
	const allowlist = new Set((params.allowedOrigins ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean));
	if (allowlist.has("*") || allowlist.has(parsedOrigin.origin)) return {
		ok: true,
		matchedBy: "allowlist"
	};
	const requestHost = normalizeHostHeader(params.requestHost);
	if (params.allowHostHeaderOriginFallback === true && requestHost && parsedOrigin.host === requestHost) return {
		ok: true,
		matchedBy: "host-header-fallback"
	};
	if (params.isLocalClient && isLoopbackHost(parsedOrigin.hostname)) return {
		ok: true,
		matchedBy: "local-loopback"
	};
	return {
		ok: false,
		reason: "origin not allowed"
	};
}
//#endregion
//#region src/gateway/auth.ts
function normalizeLogin(login) {
	return login.trim().toLowerCase();
}
function headerValue(value) {
	return Array.isArray(value) ? value[0] : value;
}
const TAILSCALE_TRUSTED_PROXIES = ["127.0.0.1", "::1"];
function resolveTailscaleClientIp(req) {
	if (!req) return;
	return resolveClientIp({
		remoteAddr: req.socket?.remoteAddress ?? "",
		forwardedFor: headerValue(req.headers?.["x-forwarded-for"]),
		trustedProxies: [...TAILSCALE_TRUSTED_PROXIES]
	});
}
function isLocalDirectRequest(req, _trustedProxies, _allowRealIpFallback = false) {
	if (!req) return false;
	if (!Boolean(req.headers?.forwarded || req.headers?.["x-forwarded-for"] || req.headers?.["x-forwarded-proto"] || req.headers?.["x-real-ip"] || req.headers?.["x-forwarded-host"])) return isLoopbackAddress(req.socket?.remoteAddress);
	return false;
}
function getTailscaleUser(req) {
	if (!req) return null;
	const login = req.headers["tailscale-user-login"];
	if (typeof login !== "string" || !login.trim()) return null;
	const nameRaw = req.headers["tailscale-user-name"];
	const profilePic = req.headers["tailscale-user-profile-pic"];
	const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : login.trim();
	return {
		login: login.trim(),
		name,
		profilePic: typeof profilePic === "string" && profilePic.trim() ? profilePic.trim() : void 0
	};
}
function hasTailscaleProxyHeaders(req) {
	if (!req) return false;
	return Boolean(req.headers["x-forwarded-for"] && req.headers["x-forwarded-proto"] && req.headers["x-forwarded-host"]);
}
function isTailscaleProxyRequest(req) {
	if (!req) return false;
	return isLoopbackAddress(req.socket?.remoteAddress) && hasTailscaleProxyHeaders(req);
}
async function resolveVerifiedTailscaleUser(params) {
	const { req, tailscaleWhois } = params;
	const tailscaleUser = getTailscaleUser(req);
	if (!tailscaleUser) return {
		ok: false,
		reason: "tailscale_user_missing"
	};
	if (!isTailscaleProxyRequest(req)) return {
		ok: false,
		reason: "tailscale_proxy_missing"
	};
	const clientIp = resolveTailscaleClientIp(req);
	if (!clientIp) return {
		ok: false,
		reason: "tailscale_whois_failed"
	};
	const whois = await tailscaleWhois(clientIp);
	if (!whois?.login) return {
		ok: false,
		reason: "tailscale_whois_failed"
	};
	if (normalizeLogin(whois.login) !== normalizeLogin(tailscaleUser.login)) return {
		ok: false,
		reason: "tailscale_user_mismatch"
	};
	return {
		ok: true,
		user: {
			login: whois.login,
			name: whois.name ?? tailscaleUser.name,
			profilePic: tailscaleUser.profilePic
		}
	};
}
function resolveGatewayAuth(params) {
	const baseAuthConfig = params.authConfig ?? {};
	const authOverride = params.authOverride ?? void 0;
	const authConfig = { ...baseAuthConfig };
	if (authOverride) {
		if (authOverride.mode !== void 0) authConfig.mode = authOverride.mode;
		if (authOverride.token !== void 0) authConfig.token = authOverride.token;
		if (authOverride.password !== void 0) authConfig.password = authOverride.password;
		if (authOverride.allowTailscale !== void 0) authConfig.allowTailscale = authOverride.allowTailscale;
		if (authOverride.rateLimit !== void 0) authConfig.rateLimit = authOverride.rateLimit;
		if (authOverride.trustedProxy !== void 0) authConfig.trustedProxy = authOverride.trustedProxy;
	}
	const env = params.env ?? process.env;
	const tokenRef = resolveSecretInputRef({ value: authConfig.token }).ref;
	const passwordRef = resolveSecretInputRef({ value: authConfig.password }).ref;
	const resolvedCredentials = resolveGatewayCredentialsFromValues({
		configToken: tokenRef ? void 0 : authConfig.token,
		configPassword: passwordRef ? void 0 : authConfig.password,
		env,
		tokenPrecedence: "config-first",
		passwordPrecedence: "config-first"
	});
	const token = resolvedCredentials.token;
	const password = resolvedCredentials.password;
	const trustedProxy = authConfig.trustedProxy;
	let mode;
	let modeSource;
	if (authOverride?.mode !== void 0) {
		mode = authOverride.mode;
		modeSource = "override";
	} else if (authConfig.mode) {
		mode = authConfig.mode;
		modeSource = "config";
	} else if (password) {
		mode = "password";
		modeSource = "password";
	} else if (token) {
		mode = "token";
		modeSource = "token";
	} else {
		mode = "token";
		modeSource = "default";
	}
	const allowTailscale = authConfig.allowTailscale ?? (params.tailscaleMode === "serve" && mode !== "password" && mode !== "trusted-proxy");
	return {
		mode,
		modeSource,
		token,
		password,
		allowTailscale,
		trustedProxy
	};
}
function assertGatewayAuthConfigured(auth, rawAuthConfig) {
	if (auth.mode === "token" && !auth.token) {
		if (auth.allowTailscale) return;
		throw new Error("gateway auth mode is token, but no token was configured (set gateway.auth.token or OPENCLAW_GATEWAY_TOKEN)");
	}
	if (auth.mode === "password" && !auth.password) {
		if (rawAuthConfig?.password != null && typeof rawAuthConfig.password !== "string") throw new Error("gateway auth mode is password, but gateway.auth.password contains a provider reference object instead of a resolved string — bootstrap secrets (gateway.auth.password) must be plaintext strings or set via the OPENCLAW_GATEWAY_PASSWORD environment variable because the secrets provider system has not initialised yet at gateway startup");
		throw new Error("gateway auth mode is password, but no password was configured");
	}
	if (auth.mode === "trusted-proxy") {
		if (!auth.trustedProxy) throw new Error("gateway auth mode is trusted-proxy, but no trustedProxy config was provided (set gateway.auth.trustedProxy)");
		if (!auth.trustedProxy.userHeader || auth.trustedProxy.userHeader.trim() === "") throw new Error("gateway auth mode is trusted-proxy, but trustedProxy.userHeader is empty (set gateway.auth.trustedProxy.userHeader)");
		if (auth.token) throw new Error("gateway auth mode is trusted-proxy, but a shared token is also configured; remove gateway.auth.token / OPENCLAW_GATEWAY_TOKEN because trusted-proxy and token auth are mutually exclusive");
	}
}
/**
* Check if the request came from a trusted proxy and extract user identity.
* Returns the user identity if valid, or null with a reason if not.
*/
function authorizeTrustedProxy(params) {
	const { req, trustedProxies, trustedProxyConfig } = params;
	if (!req) return { reason: "trusted_proxy_no_request" };
	const remoteAddr = req.socket?.remoteAddress;
	if (!remoteAddr || !isTrustedProxyAddress(remoteAddr, trustedProxies)) return { reason: "trusted_proxy_untrusted_source" };
	if (isLoopbackAddress(remoteAddr)) return { reason: "trusted_proxy_loopback_source" };
	const requiredHeaders = trustedProxyConfig.requiredHeaders ?? [];
	for (const header of requiredHeaders) {
		const value = headerValue(req.headers[header.toLowerCase()]);
		if (!value || value.trim() === "") return { reason: `trusted_proxy_missing_header_${header}` };
	}
	const userHeaderValue = headerValue(req.headers[trustedProxyConfig.userHeader.toLowerCase()]);
	if (!userHeaderValue || userHeaderValue.trim() === "") return { reason: "trusted_proxy_user_missing" };
	const user = userHeaderValue.trim();
	const allowUsers = trustedProxyConfig.allowUsers ?? [];
	if (allowUsers.length > 0 && !allowUsers.includes(user)) return { reason: "trusted_proxy_user_not_allowed" };
	return { user };
}
function shouldAllowTailscaleHeaderAuth(authSurface) {
	return authSurface === "ws-control-ui";
}
function authorizeTrustedProxyBrowserOrigin(params) {
	if (params.authSurface !== "http") return null;
	const origin = params.browserOriginPolicy?.origin?.trim();
	if (!origin) return null;
	if (checkBrowserOrigin({
		requestHost: params.browserOriginPolicy?.requestHost,
		origin,
		allowedOrigins: params.browserOriginPolicy?.allowedOrigins,
		allowHostHeaderOriginFallback: params.browserOriginPolicy?.allowHostHeaderOriginFallback,
		isLocalClient: false
	}).ok) return null;
	return {
		ok: false,
		reason: "trusted_proxy_origin_not_allowed"
	};
}
function authorizeTokenAuth(params) {
	if (!params.authToken) return {
		ok: false,
		reason: "token_missing_config"
	};
	if (!params.connectToken) return {
		ok: false,
		reason: "token_missing"
	};
	if (!safeEqualSecret(params.connectToken, params.authToken)) {
		params.limiter?.recordFailure(params.ip, params.rateLimitScope);
		return {
			ok: false,
			reason: "token_mismatch"
		};
	}
	params.limiter?.reset(params.ip, params.rateLimitScope);
	return {
		ok: true,
		method: "token"
	};
}
async function authorizeGatewayConnect(params) {
	const { auth, connectAuth, req, trustedProxies } = params;
	const tailscaleWhois = params.tailscaleWhois ?? readTailscaleWhoisIdentity;
	const authSurface = params.authSurface ?? "http";
	const allowTailscaleHeaderAuth = shouldAllowTailscaleHeaderAuth(authSurface);
	const limiter = params.rateLimiter;
	const ip = params.clientIp ?? resolveRequestClientIp(req, trustedProxies, params.allowRealIpFallback === true) ?? req?.socket?.remoteAddress;
	const rateLimitScope = params.rateLimitScope ?? "shared-secret";
	const localDirect = isLocalDirectRequest(req, trustedProxies, params.allowRealIpFallback === true);
	if (auth.mode === "trusted-proxy") {
		if (!auth.trustedProxy) return {
			ok: false,
			reason: "trusted_proxy_config_missing"
		};
		if (!trustedProxies || trustedProxies.length === 0) return {
			ok: false,
			reason: "trusted_proxy_no_proxies_configured"
		};
		const result = authorizeTrustedProxy({
			req,
			trustedProxies,
			trustedProxyConfig: auth.trustedProxy
		});
		if ("user" in result) {
			const originResult = authorizeTrustedProxyBrowserOrigin({
				authSurface,
				browserOriginPolicy: params.browserOriginPolicy
			});
			if (originResult) return originResult;
			return {
				ok: true,
				method: "trusted-proxy",
				user: result.user
			};
		}
		return {
			ok: false,
			reason: result.reason
		};
	}
	if (auth.mode === "none") return {
		ok: true,
		method: "none"
	};
	if (limiter) {
		const rlCheck = limiter.check(ip, rateLimitScope);
		if (!rlCheck.allowed) return {
			ok: false,
			reason: "rate_limited",
			rateLimited: true,
			retryAfterMs: rlCheck.retryAfterMs
		};
	}
	if (allowTailscaleHeaderAuth && auth.allowTailscale && !localDirect) {
		const tailscaleCheck = await resolveVerifiedTailscaleUser({
			req,
			tailscaleWhois
		});
		if (tailscaleCheck.ok) {
			limiter?.reset(ip, rateLimitScope);
			return {
				ok: true,
				method: "tailscale",
				user: tailscaleCheck.user.login
			};
		}
	}
	if (auth.mode === "token") return authorizeTokenAuth({
		authToken: auth.token,
		connectToken: connectAuth?.token,
		limiter,
		ip,
		rateLimitScope
	});
	if (auth.mode === "password") {
		const password = connectAuth?.password;
		if (!auth.password) return {
			ok: false,
			reason: "password_missing_config"
		};
		if (!password) return {
			ok: false,
			reason: "password_missing"
		};
		if (!safeEqualSecret(password, auth.password)) {
			limiter?.recordFailure(ip, rateLimitScope);
			return {
				ok: false,
				reason: "password_mismatch"
			};
		}
		limiter?.reset(ip, rateLimitScope);
		return {
			ok: true,
			method: "password"
		};
	}
	limiter?.recordFailure(ip, rateLimitScope);
	return {
		ok: false,
		reason: "unauthorized"
	};
}
async function authorizeHttpGatewayConnect(params) {
	return authorizeGatewayConnect({
		...params,
		authSurface: "http"
	});
}
async function authorizeWsControlUiGatewayConnect(params) {
	return authorizeGatewayConnect({
		...params,
		authSurface: "ws-control-ui"
	});
}
//#endregion
export { resolveGatewayAuth as a, isLocalDirectRequest as i, authorizeHttpGatewayConnect as n, checkBrowserOrigin as o, authorizeWsControlUiGatewayConnect as r, assertGatewayAuthConfigured as t };
