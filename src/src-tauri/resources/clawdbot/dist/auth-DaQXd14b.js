import { C as isYes, S as isVerbose, w as logVerbose } from "./entry.js";
import { n as runExec } from "./exec-B52LZOrO.js";
import { a as isTrustedProxyAddress, n as isLoopbackAddress, s as parseForwardedForClientIp, u as resolveGatewayClientIp } from "./ws-D56uQr0E.js";
import { stdin, stdout } from "node:process";
import { existsSync } from "node:fs";
import { timingSafeEqual } from "node:crypto";
import readline from "node:readline/promises";

//#region src/cli/prompt.ts
async function promptYesNo(question, defaultYes = false) {
	if (isVerbose() && isYes()) return true;
	if (isYes()) return true;
	const rl = readline.createInterface({
		input: stdin,
		output: stdout
	});
	const suffix = defaultYes ? " [Y/n] " : " [y/N] ";
	const answer = (await rl.question(`${question}${suffix}`)).trim().toLowerCase();
	rl.close();
	if (!answer) return defaultYes;
	return answer.startsWith("y");
}

//#endregion
//#region src/infra/tailscale.ts
function parsePossiblyNoisyJsonObject(stdout) {
	const trimmed = stdout.trim();
	const start = trimmed.indexOf("{");
	const end = trimmed.lastIndexOf("}");
	if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
	return JSON.parse(trimmed);
}
/**
* Locate Tailscale binary using multiple strategies:
* 1. PATH lookup (via which command)
* 2. Known macOS app path
* 3. find /Applications for Tailscale.app
* 4. locate database (if available)
*
* @returns Path to Tailscale binary or null if not found
*/
async function findTailscaleBinary() {
	const checkBinary = async (path) => {
		if (!path || !existsSync(path)) return false;
		try {
			await Promise.race([runExec(path, ["--version"], { timeoutMs: 3e3 }), new Promise((_, reject) => setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), 3e3))]);
			return true;
		} catch {
			return false;
		}
	};
	try {
		const { stdout } = await runExec("which", ["tailscale"]);
		const fromPath = stdout.trim();
		if (fromPath && await checkBinary(fromPath)) return fromPath;
	} catch {}
	const macAppPath = "/Applications/Tailscale.app/Contents/MacOS/Tailscale";
	if (await checkBinary(macAppPath)) return macAppPath;
	try {
		const { stdout } = await runExec("find", [
			"/Applications",
			"-maxdepth",
			"3",
			"-name",
			"Tailscale",
			"-path",
			"*/Tailscale.app/Contents/MacOS/Tailscale"
		], { timeoutMs: 5e3 });
		const found = stdout.trim().split("\n")[0];
		if (found && await checkBinary(found)) return found;
	} catch {}
	try {
		const { stdout } = await runExec("locate", ["Tailscale.app"]);
		const candidates = stdout.trim().split("\n").filter((line) => line.includes("/Tailscale.app/Contents/MacOS/Tailscale"));
		for (const candidate of candidates) if (await checkBinary(candidate)) return candidate;
	} catch {}
	return null;
}
async function getTailnetHostname(exec = runExec, detectedBinary) {
	const candidates = detectedBinary ? [detectedBinary] : ["tailscale", "/Applications/Tailscale.app/Contents/MacOS/Tailscale"];
	let lastError;
	for (const candidate of candidates) {
		if (candidate.startsWith("/") && !existsSync(candidate)) continue;
		try {
			const { stdout } = await exec(candidate, ["status", "--json"], {
				timeoutMs: 5e3,
				maxBuffer: 4e5
			});
			const parsed = stdout ? parsePossiblyNoisyJsonObject(stdout) : {};
			const self = typeof parsed.Self === "object" && parsed.Self !== null ? parsed.Self : void 0;
			const dns = typeof self?.DNSName === "string" ? self.DNSName : void 0;
			const ips = Array.isArray(self?.TailscaleIPs) ? parsed.Self.TailscaleIPs ?? [] : [];
			if (dns && dns.length > 0) return dns.replace(/\.$/, "");
			if (ips.length > 0) return ips[0];
			throw new Error("Could not determine Tailscale DNS or IP");
		} catch (err) {
			lastError = err;
		}
	}
	throw lastError ?? /* @__PURE__ */ new Error("Could not determine Tailscale DNS or IP");
}
/**
* Get the Tailscale binary command to use.
* Returns a cached detected binary or the default "tailscale" command.
*/
let cachedTailscaleBinary = null;
async function getTailscaleBinary() {
	const forcedBinary = process.env.OPENCLAW_TEST_TAILSCALE_BINARY?.trim();
	if (forcedBinary) {
		cachedTailscaleBinary = forcedBinary;
		return forcedBinary;
	}
	if (cachedTailscaleBinary) return cachedTailscaleBinary;
	cachedTailscaleBinary = await findTailscaleBinary();
	return cachedTailscaleBinary ?? "tailscale";
}
async function readTailscaleStatusJson(exec = runExec, opts) {
	const { stdout } = await exec(await getTailscaleBinary(), ["status", "--json"], {
		timeoutMs: opts?.timeoutMs ?? 5e3,
		maxBuffer: 4e5
	});
	return stdout ? parsePossiblyNoisyJsonObject(stdout) : {};
}
const whoisCache = /* @__PURE__ */ new Map();
function extractExecErrorText(err) {
	const errOutput = err;
	return {
		stdout: typeof errOutput.stdout === "string" ? errOutput.stdout : "",
		stderr: typeof errOutput.stderr === "string" ? errOutput.stderr : "",
		message: typeof errOutput.message === "string" ? errOutput.message : "",
		code: typeof errOutput.code === "string" ? errOutput.code : ""
	};
}
function isPermissionDeniedError(err) {
	const { stdout, stderr, message, code } = extractExecErrorText(err);
	if (code.toUpperCase() === "EACCES") return true;
	const combined = `${stdout}\n${stderr}\n${message}`.toLowerCase();
	return combined.includes("permission denied") || combined.includes("access denied") || combined.includes("operation not permitted") || combined.includes("not permitted") || combined.includes("requires root") || combined.includes("must be run as root") || combined.includes("must be run with sudo") || combined.includes("requires sudo") || combined.includes("need sudo");
}
async function execWithSudoFallback(exec, bin, args, opts) {
	try {
		return await exec(bin, args, opts);
	} catch (err) {
		if (!isPermissionDeniedError(err)) throw err;
		logVerbose(`Command failed, retrying with sudo: ${bin} ${args.join(" ")}`);
		try {
			return await exec("sudo", [
				"-n",
				bin,
				...args
			], opts);
		} catch (sudoErr) {
			const { stderr, message } = extractExecErrorText(sudoErr);
			const detail = (stderr || message).trim();
			if (detail) logVerbose(`Sudo retry failed: ${detail}`);
			throw err;
		}
	}
}
async function enableTailscaleServe(port, exec = runExec) {
	await execWithSudoFallback(exec, await getTailscaleBinary(), [
		"serve",
		"--bg",
		"--yes",
		`${port}`
	], {
		maxBuffer: 2e5,
		timeoutMs: 15e3
	});
}
async function disableTailscaleServe(exec = runExec) {
	await execWithSudoFallback(exec, await getTailscaleBinary(), ["serve", "reset"], {
		maxBuffer: 2e5,
		timeoutMs: 15e3
	});
}
async function enableTailscaleFunnel(port, exec = runExec) {
	await execWithSudoFallback(exec, await getTailscaleBinary(), [
		"funnel",
		"--bg",
		"--yes",
		`${port}`
	], {
		maxBuffer: 2e5,
		timeoutMs: 15e3
	});
}
async function disableTailscaleFunnel(exec = runExec) {
	await execWithSudoFallback(exec, await getTailscaleBinary(), ["funnel", "reset"], {
		maxBuffer: 2e5,
		timeoutMs: 15e3
	});
}
function getString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function readRecord(value) {
	return value && typeof value === "object" ? value : null;
}
function parseWhoisIdentity(payload) {
	const userProfile = readRecord(payload.UserProfile) ?? readRecord(payload.userProfile) ?? readRecord(payload.User);
	const login = getString(userProfile?.LoginName) ?? getString(userProfile?.Login) ?? getString(userProfile?.login) ?? getString(payload.LoginName) ?? getString(payload.login);
	if (!login) return null;
	return {
		login,
		name: getString(userProfile?.DisplayName) ?? getString(userProfile?.Name) ?? getString(userProfile?.displayName) ?? getString(payload.DisplayName) ?? getString(payload.name)
	};
}
function readCachedWhois(ip, now) {
	const cached = whoisCache.get(ip);
	if (!cached) return;
	if (cached.expiresAt <= now) {
		whoisCache.delete(ip);
		return;
	}
	return cached.value;
}
function writeCachedWhois(ip, value, ttlMs) {
	whoisCache.set(ip, {
		value,
		expiresAt: Date.now() + ttlMs
	});
}
async function readTailscaleWhoisIdentity(ip, exec = runExec, opts) {
	const normalized = ip.trim();
	if (!normalized) return null;
	const cached = readCachedWhois(normalized, Date.now());
	if (cached !== void 0) return cached;
	const cacheTtlMs = opts?.cacheTtlMs ?? 6e4;
	const errorTtlMs = opts?.errorTtlMs ?? 5e3;
	try {
		const { stdout } = await exec(await getTailscaleBinary(), [
			"whois",
			"--json",
			normalized
		], {
			timeoutMs: opts?.timeoutMs ?? 5e3,
			maxBuffer: 2e5
		});
		const identity = parseWhoisIdentity(stdout ? parsePossiblyNoisyJsonObject(stdout) : {});
		writeCachedWhois(normalized, identity, cacheTtlMs);
		return identity;
	} catch {
		writeCachedWhois(normalized, null, errorTtlMs);
		return null;
	}
}

//#endregion
//#region src/security/secret-equal.ts
function safeEqualSecret(provided, expected) {
	if (typeof provided !== "string" || typeof expected !== "string") return false;
	const providedBuffer = Buffer.from(provided);
	const expectedBuffer = Buffer.from(expected);
	if (providedBuffer.length !== expectedBuffer.length) return false;
	return timingSafeEqual(providedBuffer, expectedBuffer);
}

//#endregion
//#region src/gateway/auth-rate-limit.ts
/**
* In-memory sliding-window rate limiter for gateway authentication attempts.
*
* Tracks failed auth attempts by {scope, clientIp}. A scope lets callers keep
* independent counters for different credential classes (for example, shared
* gateway token/password vs device-token auth) while still sharing one
* limiter instance.
*
* Design decisions:
* - Pure in-memory Map – no external dependencies; suitable for a single
*   gateway process.  The Map is periodically pruned to avoid unbounded
*   growth.
* - Loopback addresses (127.0.0.1 / ::1) are exempt by default so that local
*   CLI sessions are never locked out.
* - The module is side-effect-free: callers create an instance via
*   {@link createAuthRateLimiter} and pass it where needed.
*/
const AUTH_RATE_LIMIT_SCOPE_DEFAULT = "default";
const AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET = "shared-secret";
const AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN = "device-token";
const DEFAULT_MAX_ATTEMPTS = 10;
const DEFAULT_WINDOW_MS = 6e4;
const DEFAULT_LOCKOUT_MS = 3e5;
const PRUNE_INTERVAL_MS = 6e4;
function createAuthRateLimiter(config) {
	const maxAttempts = config?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
	const windowMs = config?.windowMs ?? DEFAULT_WINDOW_MS;
	const lockoutMs = config?.lockoutMs ?? DEFAULT_LOCKOUT_MS;
	const exemptLoopback = config?.exemptLoopback ?? true;
	const entries = /* @__PURE__ */ new Map();
	const pruneTimer = setInterval(() => prune(), PRUNE_INTERVAL_MS);
	if (pruneTimer.unref) pruneTimer.unref();
	function normalizeScope(scope) {
		return (scope ?? AUTH_RATE_LIMIT_SCOPE_DEFAULT).trim() || AUTH_RATE_LIMIT_SCOPE_DEFAULT;
	}
	function normalizeIp(ip) {
		return (ip ?? "").trim() || "unknown";
	}
	function resolveKey(rawIp, rawScope) {
		const ip = normalizeIp(rawIp);
		return {
			key: `${normalizeScope(rawScope)}:${ip}`,
			ip
		};
	}
	function isExempt(ip) {
		return exemptLoopback && isLoopbackAddress(ip);
	}
	function slideWindow(entry, now) {
		const cutoff = now - windowMs;
		entry.attempts = entry.attempts.filter((ts) => ts > cutoff);
	}
	function check(rawIp, rawScope) {
		const { key, ip } = resolveKey(rawIp, rawScope);
		if (isExempt(ip)) return {
			allowed: true,
			remaining: maxAttempts,
			retryAfterMs: 0
		};
		const now = Date.now();
		const entry = entries.get(key);
		if (!entry) return {
			allowed: true,
			remaining: maxAttempts,
			retryAfterMs: 0
		};
		if (entry.lockedUntil && now < entry.lockedUntil) return {
			allowed: false,
			remaining: 0,
			retryAfterMs: entry.lockedUntil - now
		};
		if (entry.lockedUntil && now >= entry.lockedUntil) {
			entry.lockedUntil = void 0;
			entry.attempts = [];
		}
		slideWindow(entry, now);
		const remaining = Math.max(0, maxAttempts - entry.attempts.length);
		return {
			allowed: remaining > 0,
			remaining,
			retryAfterMs: 0
		};
	}
	function recordFailure(rawIp, rawScope) {
		const { key, ip } = resolveKey(rawIp, rawScope);
		if (isExempt(ip)) return;
		const now = Date.now();
		let entry = entries.get(key);
		if (!entry) {
			entry = { attempts: [] };
			entries.set(key, entry);
		}
		if (entry.lockedUntil && now < entry.lockedUntil) return;
		slideWindow(entry, now);
		entry.attempts.push(now);
		if (entry.attempts.length >= maxAttempts) entry.lockedUntil = now + lockoutMs;
	}
	function reset(rawIp, rawScope) {
		const { key } = resolveKey(rawIp, rawScope);
		entries.delete(key);
	}
	function prune() {
		const now = Date.now();
		for (const [key, entry] of entries) {
			if (entry.lockedUntil && now < entry.lockedUntil) continue;
			slideWindow(entry, now);
			if (entry.attempts.length === 0) entries.delete(key);
		}
	}
	function size() {
		return entries.size;
	}
	function dispose() {
		clearInterval(pruneTimer);
		entries.clear();
	}
	return {
		check,
		recordFailure,
		reset,
		size,
		prune,
		dispose
	};
}

//#endregion
//#region src/gateway/auth.ts
function normalizeLogin(login) {
	return login.trim().toLowerCase();
}
function getHostName(hostHeader) {
	const host = (hostHeader ?? "").trim().toLowerCase();
	if (!host) return "";
	if (host.startsWith("[")) {
		const end = host.indexOf("]");
		if (end !== -1) return host.slice(1, end);
	}
	const [name] = host.split(":");
	return name ?? "";
}
function headerValue(value) {
	return Array.isArray(value) ? value[0] : value;
}
function resolveTailscaleClientIp(req) {
	if (!req) return;
	const forwardedFor = headerValue(req.headers?.["x-forwarded-for"]);
	return forwardedFor ? parseForwardedForClientIp(forwardedFor) : void 0;
}
function resolveRequestClientIp(req, trustedProxies) {
	if (!req) return;
	return resolveGatewayClientIp({
		remoteAddr: req.socket?.remoteAddress ?? "",
		forwardedFor: headerValue(req.headers?.["x-forwarded-for"]),
		realIp: headerValue(req.headers?.["x-real-ip"]),
		trustedProxies
	});
}
function isLocalDirectRequest(req, trustedProxies) {
	if (!req) return false;
	if (!isLoopbackAddress(resolveRequestClientIp(req, trustedProxies) ?? "")) return false;
	const host = getHostName(req.headers?.host);
	const hostIsLocal = host === "localhost" || host === "127.0.0.1" || host === "::1";
	const hostIsTailscaleServe = host.endsWith(".ts.net");
	const hasForwarded = Boolean(req.headers?.["x-forwarded-for"] || req.headers?.["x-real-ip"] || req.headers?.["x-forwarded-host"]);
	const remoteIsTrustedProxy = isTrustedProxyAddress(req.socket?.remoteAddress, trustedProxies);
	return (hostIsLocal || hostIsTailscaleServe) && (!hasForwarded || remoteIsTrustedProxy);
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
	const authConfig = params.authConfig ?? {};
	const env = params.env ?? process.env;
	const token = authConfig.token ?? env.OPENCLAW_GATEWAY_TOKEN ?? env.CLAWDBOT_GATEWAY_TOKEN ?? void 0;
	const password = authConfig.password ?? env.OPENCLAW_GATEWAY_PASSWORD ?? env.CLAWDBOT_GATEWAY_PASSWORD ?? void 0;
	const mode = authConfig.mode ?? (password ? "password" : "token");
	return {
		mode,
		token,
		password,
		allowTailscale: authConfig.allowTailscale ?? (params.tailscaleMode === "serve" && mode !== "password")
	};
}
function assertGatewayAuthConfigured(auth) {
	if (auth.mode === "token" && !auth.token) {
		if (auth.allowTailscale) return;
		throw new Error("gateway auth mode is token, but no token was configured (set gateway.auth.token or OPENCLAW_GATEWAY_TOKEN)");
	}
	if (auth.mode === "password" && !auth.password) throw new Error("gateway auth mode is password, but no password was configured");
}
async function authorizeGatewayConnect(params) {
	const { auth, connectAuth, req, trustedProxies } = params;
	const tailscaleWhois = params.tailscaleWhois ?? readTailscaleWhoisIdentity;
	const localDirect = isLocalDirectRequest(req, trustedProxies);
	const limiter = params.rateLimiter;
	const ip = params.clientIp ?? resolveRequestClientIp(req, trustedProxies) ?? req?.socket?.remoteAddress;
	const rateLimitScope = params.rateLimitScope ?? AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET;
	if (limiter) {
		const rlCheck = limiter.check(ip, rateLimitScope);
		if (!rlCheck.allowed) return {
			ok: false,
			reason: "rate_limited",
			rateLimited: true,
			retryAfterMs: rlCheck.retryAfterMs
		};
	}
	if (auth.allowTailscale && !localDirect) {
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
	if (auth.mode === "token") {
		if (!auth.token) return {
			ok: false,
			reason: "token_missing_config"
		};
		if (!connectAuth?.token) {
			limiter?.recordFailure(ip, rateLimitScope);
			return {
				ok: false,
				reason: "token_missing"
			};
		}
		if (!safeEqualSecret(connectAuth.token, auth.token)) {
			limiter?.recordFailure(ip, rateLimitScope);
			return {
				ok: false,
				reason: "token_mismatch"
			};
		}
		limiter?.reset(ip, rateLimitScope);
		return {
			ok: true,
			method: "token"
		};
	}
	if (auth.mode === "password") {
		const password = connectAuth?.password;
		if (!auth.password) return {
			ok: false,
			reason: "password_missing_config"
		};
		if (!password) {
			limiter?.recordFailure(ip, rateLimitScope);
			return {
				ok: false,
				reason: "password_missing"
			};
		}
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

//#endregion
export { AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN as a, safeEqualSecret as c, enableTailscaleFunnel as d, enableTailscaleServe as f, promptYesNo as g, readTailscaleStatusJson as h, resolveGatewayAuth as i, disableTailscaleFunnel as l, getTailnetHostname as m, authorizeGatewayConnect as n, AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET as o, findTailscaleBinary as p, isLocalDirectRequest as r, createAuthRateLimiter as s, assertGatewayAuthConfigured as t, disableTailscaleServe as u };