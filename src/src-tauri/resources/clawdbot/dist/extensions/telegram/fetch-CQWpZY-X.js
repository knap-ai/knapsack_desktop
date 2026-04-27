import { normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString } from "openclaw/plugin-sdk/text-runtime";
import { createSubsystemLogger, isTruthyEnvValue, isWSL2Sync } from "openclaw/plugin-sdk/runtime-env";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { randomUUID } from "node:crypto";
import * as dns from "node:dns";
import { createPinnedLookup, getProxyUrlFromFetch, hasEnvHttpProxyConfigured, makeProxyFetch, resolveFetch } from "openclaw/plugin-sdk/fetch-runtime";
import { captureHttpExchange, resolveEffectiveDebugProxyUrl } from "openclaw/plugin-sdk/proxy-capture";
import { resolveRequestUrl } from "openclaw/plugin-sdk/request-url";
import { Agent, EnvHttpProxyAgent, ProxyAgent, fetch } from "undici";
import process$1 from "node:process";
//#region extensions/telegram/src/network-config.ts
const TELEGRAM_DISABLE_AUTO_SELECT_FAMILY_ENV = "OPENCLAW_TELEGRAM_DISABLE_AUTO_SELECT_FAMILY";
const TELEGRAM_ENABLE_AUTO_SELECT_FAMILY_ENV = "OPENCLAW_TELEGRAM_ENABLE_AUTO_SELECT_FAMILY";
const TELEGRAM_DNS_RESULT_ORDER_ENV = "OPENCLAW_TELEGRAM_DNS_RESULT_ORDER";
let wsl2SyncCache;
function isWSL2SyncCached() {
	if (typeof wsl2SyncCache === "boolean") return wsl2SyncCache;
	wsl2SyncCache = isWSL2Sync();
	return wsl2SyncCache;
}
function resolveTelegramAutoSelectFamilyDecision(params) {
	const env = params?.env ?? process$1.env;
	const nodeMajor = typeof params?.nodeMajor === "number" ? params.nodeMajor : Number(process$1.versions.node.split(".")[0]);
	if (isTruthyEnvValue(env["OPENCLAW_TELEGRAM_ENABLE_AUTO_SELECT_FAMILY"])) return {
		value: true,
		source: `env:${TELEGRAM_ENABLE_AUTO_SELECT_FAMILY_ENV}`
	};
	if (isTruthyEnvValue(env["OPENCLAW_TELEGRAM_DISABLE_AUTO_SELECT_FAMILY"])) return {
		value: false,
		source: `env:${TELEGRAM_DISABLE_AUTO_SELECT_FAMILY_ENV}`
	};
	if (typeof params?.network?.autoSelectFamily === "boolean") return {
		value: params.network.autoSelectFamily,
		source: "config"
	};
	if (isWSL2SyncCached()) return {
		value: false,
		source: "default-wsl2"
	};
	if (Number.isFinite(nodeMajor) && nodeMajor >= 22) return {
		value: true,
		source: "default-node22"
	};
	return { value: null };
}
/**
* Resolve DNS result order setting for Telegram network requests.
* Some networks/ISPs have issues with IPv6 causing fetch failures.
* Setting "ipv4first" prioritizes IPv4 addresses in DNS resolution.
*
* Priority:
* 1. Environment variable OPENCLAW_TELEGRAM_DNS_RESULT_ORDER
* 2. Config: channels.telegram.network.dnsResultOrder
* 3. Default: "ipv4first" on Node 22+ (to work around common IPv6 issues)
*/
function resolveTelegramDnsResultOrderDecision(params) {
	const env = params?.env ?? process$1.env;
	const nodeMajor = typeof params?.nodeMajor === "number" ? params.nodeMajor : Number(process$1.versions.node.split(".")[0]);
	const envValue = normalizeOptionalLowercaseString(env[TELEGRAM_DNS_RESULT_ORDER_ENV]);
	if (envValue === "ipv4first" || envValue === "verbatim") return {
		value: envValue,
		source: `env:${TELEGRAM_DNS_RESULT_ORDER_ENV}`
	};
	const configValue = normalizeOptionalLowercaseString((params?.network)?.dnsResultOrder);
	if (configValue === "ipv4first" || configValue === "verbatim") return {
		value: configValue,
		source: "config"
	};
	if (Number.isFinite(nodeMajor) && nodeMajor >= 22) return {
		value: "ipv4first",
		source: "default-node22"
	};
	return { value: null };
}
//#endregion
//#region extensions/telegram/src/fetch.ts
const log = createSubsystemLogger("telegram/network");
const TELEGRAM_AUTO_SELECT_FAMILY_ATTEMPT_TIMEOUT_MS = 300;
const TELEGRAM_API_HOSTNAME = "api.telegram.org";
const TELEGRAM_FALLBACK_IPS = ["149.154.167.220"];
const TELEGRAM_DISPATCHER_KEEP_ALIVE_TIMEOUT_MS = 3e4;
const TELEGRAM_DISPATCHER_KEEP_ALIVE_MAX_TIMEOUT_MS = 6e5;
const TELEGRAM_DISPATCHER_CONNECTIONS_PER_ORIGIN = 10;
const TELEGRAM_DISPATCHER_PIPELINING = 1;
function telegramAgentPoolOptions() {
	return {
		allowH2: false,
		keepAliveTimeout: TELEGRAM_DISPATCHER_KEEP_ALIVE_TIMEOUT_MS,
		keepAliveMaxTimeout: TELEGRAM_DISPATCHER_KEEP_ALIVE_MAX_TIMEOUT_MS,
		connections: TELEGRAM_DISPATCHER_CONNECTIONS_PER_ORIGIN,
		pipelining: TELEGRAM_DISPATCHER_PIPELINING
	};
}
const FALLBACK_RETRY_ERROR_CODES = [
	"ETIMEDOUT",
	"ENETUNREACH",
	"EHOSTUNREACH",
	"UND_ERR_CONNECT_TIMEOUT",
	"UND_ERR_SOCKET"
];
const TELEGRAM_TRANSPORT_FALLBACK_RULES = [{
	name: "fetch-failed-envelope",
	matches: ({ message }) => message.includes("fetch failed")
}, {
	name: "known-network-code",
	matches: ({ codes }) => FALLBACK_RETRY_ERROR_CODES.some((code) => codes.has(code))
}];
function normalizeDnsResultOrder(value) {
	if (value === "ipv4first" || value === "verbatim") return value;
	return null;
}
function createDnsResultOrderLookup(order) {
	if (!order) return;
	const lookup = dns.lookup;
	return (hostname, options, callback) => {
		lookup(hostname, {
			...typeof options === "number" ? { family: options } : options ? { ...options } : {},
			order,
			verbatim: order === "verbatim"
		}, callback);
	};
}
function buildTelegramConnectOptions(params) {
	const connect = {};
	if (params.forceIpv4) {
		connect.family = 4;
		connect.autoSelectFamily = false;
	} else if (typeof params.autoSelectFamily === "boolean") {
		connect.autoSelectFamily = params.autoSelectFamily;
		connect.autoSelectFamilyAttemptTimeout = TELEGRAM_AUTO_SELECT_FAMILY_ATTEMPT_TIMEOUT_MS;
	}
	const lookup = createDnsResultOrderLookup(params.dnsResultOrder);
	if (lookup) connect.lookup = lookup;
	return Object.keys(connect).length > 0 ? connect : null;
}
function shouldBypassEnvProxyForTelegramApi(env = process.env) {
	const noProxyValue = env.no_proxy ?? env.NO_PROXY ?? "";
	if (!noProxyValue) return false;
	if (noProxyValue === "*") return true;
	const targetHostname = normalizeLowercaseStringOrEmpty(TELEGRAM_API_HOSTNAME);
	const targetPort = 443;
	const noProxyEntries = noProxyValue.split(/[,\s]/);
	for (let i = 0; i < noProxyEntries.length; i++) {
		const entry = noProxyEntries[i];
		if (!entry) continue;
		const parsed = entry.match(/^(.+):(\d+)$/);
		const entryHostname = normalizeLowercaseStringOrEmpty((parsed ? parsed[1] : entry).replace(/^\*?\./, ""));
		const entryPort = parsed ? Number.parseInt(parsed[2], 10) : 0;
		if (entryPort && entryPort !== targetPort) continue;
		if (targetHostname === entryHostname || targetHostname.slice(-(entryHostname.length + 1)) === `.${entryHostname}`) return true;
	}
	return false;
}
function hasEnvHttpProxyForTelegramApi(env = process.env) {
	return hasEnvHttpProxyConfigured("https", env);
}
function resolveTelegramDispatcherPolicy(params) {
	const connect = buildTelegramConnectOptions({
		autoSelectFamily: params.autoSelectFamily,
		dnsResultOrder: params.dnsResultOrder,
		forceIpv4: params.forceIpv4
	});
	const explicitProxyUrl = params.proxyUrl?.trim();
	if (explicitProxyUrl) return {
		policy: connect ? {
			mode: "explicit-proxy",
			proxyUrl: explicitProxyUrl,
			allowPrivateProxy: true,
			proxyTls: { ...connect }
		} : {
			mode: "explicit-proxy",
			proxyUrl: explicitProxyUrl,
			allowPrivateProxy: true
		},
		mode: "explicit-proxy"
	};
	if (params.useEnvProxy) return {
		policy: {
			mode: "env-proxy",
			...connect ? {
				connect: { ...connect },
				proxyTls: { ...connect }
			} : {}
		},
		mode: "env-proxy"
	};
	return {
		policy: {
			mode: "direct",
			...connect ? { connect: { ...connect } } : {}
		},
		mode: "direct"
	};
}
function withPinnedLookup(options, pinnedHostname) {
	if (!pinnedHostname) return options ? { ...options } : void 0;
	const lookup = createPinnedLookup({
		hostname: pinnedHostname.hostname,
		addresses: [...pinnedHostname.addresses],
		fallback: dns.lookup
	});
	return options ? {
		...options,
		lookup
	} : { lookup };
}
function createTelegramDispatcher(policy) {
	const poolOptions = telegramAgentPoolOptions();
	if (policy.mode === "explicit-proxy") {
		const requestTlsOptions = withPinnedLookup(policy.proxyTls, policy.pinnedHostname);
		const proxyOptions = {
			uri: policy.proxyUrl,
			...poolOptions,
			...requestTlsOptions ? { requestTls: requestTlsOptions } : {}
		};
		try {
			return {
				dispatcher: new ProxyAgent(proxyOptions),
				mode: "explicit-proxy",
				effectivePolicy: policy
			};
		} catch (err) {
			const reason = formatErrorMessage(err);
			throw new Error(`explicit proxy dispatcher init failed: ${reason}`, { cause: err });
		}
	}
	if (policy.mode === "env-proxy") {
		const connectOptions = withPinnedLookup(policy.connect, policy.pinnedHostname);
		const proxyTlsOptions = withPinnedLookup(policy.proxyTls, policy.pinnedHostname);
		const proxyOptions = {
			...poolOptions,
			...connectOptions ? { connect: connectOptions } : {},
			...proxyTlsOptions ? { proxyTls: proxyTlsOptions } : {}
		};
		try {
			return {
				dispatcher: new EnvHttpProxyAgent(proxyOptions),
				mode: "env-proxy",
				effectivePolicy: policy
			};
		} catch (err) {
			log.warn(`env proxy dispatcher init failed; falling back to direct dispatcher: ${formatErrorMessage(err)}`);
			const directPolicy = {
				mode: "direct",
				...connectOptions ? { connect: connectOptions } : {}
			};
			return {
				dispatcher: new Agent({
					...poolOptions,
					...directPolicy.connect ? { connect: directPolicy.connect } : {}
				}),
				mode: "direct",
				effectivePolicy: directPolicy
			};
		}
	}
	const connectOptions = withPinnedLookup(policy.connect, policy.pinnedHostname);
	return {
		dispatcher: new Agent({
			...poolOptions,
			...connectOptions ? { connect: connectOptions } : {}
		}),
		mode: "direct",
		effectivePolicy: policy
	};
}
function withDispatcherIfMissing(init, dispatcher) {
	if (init?.dispatcher) return init ?? {};
	return init ? {
		...init,
		dispatcher
	} : { dispatcher };
}
function resolveWrappedFetch(fetchImpl) {
	return resolveFetch(fetchImpl) ?? fetchImpl;
}
function logResolverNetworkDecisions(params) {
	if (params.autoSelectDecision.value !== null) {
		const sourceLabel = params.autoSelectDecision.source ? ` (${params.autoSelectDecision.source})` : "";
		log.debug(`autoSelectFamily=${params.autoSelectDecision.value}${sourceLabel}`);
	}
	if (params.dnsDecision.value !== null) {
		const sourceLabel = params.dnsDecision.source ? ` (${params.dnsDecision.source})` : "";
		log.debug(`dnsResultOrder=${params.dnsDecision.value}${sourceLabel}`);
	}
}
function collectErrorCodes(err) {
	const codes = /* @__PURE__ */ new Set();
	const queue = [err];
	const seen = /* @__PURE__ */ new Set();
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current || seen.has(current)) continue;
		seen.add(current);
		if (typeof current === "object") {
			const code = current.code;
			if (typeof code === "string" && code.trim()) codes.add(code.trim().toUpperCase());
			const cause = current.cause;
			if (cause && !seen.has(cause)) queue.push(cause);
			const errors = current.errors;
			if (Array.isArray(errors)) {
				for (const nested of errors) if (nested && !seen.has(nested)) queue.push(nested);
			}
		}
	}
	return codes;
}
function formatErrorCodes(err) {
	const codes = [...collectErrorCodes(err)];
	return codes.length > 0 ? codes.join(",") : "none";
}
function shouldUseTelegramTransportFallback(err) {
	const ctx = {
		message: err && typeof err === "object" && "message" in err ? normalizeLowercaseStringOrEmpty(String(err.message)) : "",
		codes: collectErrorCodes(err)
	};
	for (const rule of TELEGRAM_TRANSPORT_FALLBACK_RULES) if (!rule.matches(ctx)) return false;
	return true;
}
function shouldRetryTelegramTransportFallback(err) {
	return shouldUseTelegramTransportFallback(err);
}
function createTelegramTransportAttempts(params) {
	params.ownedDispatchers.add(params.defaultDispatcher.dispatcher);
	const attempts = [{
		createDispatcher: () => params.defaultDispatcher.dispatcher,
		exportAttempt: { dispatcherPolicy: params.defaultDispatcher.effectivePolicy }
	}];
	if (!params.allowFallback || !params.fallbackPolicy) return attempts;
	const fallbackPolicy = params.fallbackPolicy;
	const ownedDispatchers = params.ownedDispatchers;
	let ipv4Dispatcher = null;
	attempts.push({
		createDispatcher: () => {
			if (!ipv4Dispatcher) {
				ipv4Dispatcher = createTelegramDispatcher(fallbackPolicy).dispatcher;
				ownedDispatchers.add(ipv4Dispatcher);
			}
			return ipv4Dispatcher;
		},
		exportAttempt: { dispatcherPolicy: fallbackPolicy },
		logMessage: "fetch fallback: enabling sticky IPv4-only dispatcher"
	});
	if (TELEGRAM_FALLBACK_IPS.length === 0) return attempts;
	const fallbackIpPolicy = {
		...fallbackPolicy,
		pinnedHostname: {
			hostname: TELEGRAM_API_HOSTNAME,
			addresses: [...TELEGRAM_FALLBACK_IPS]
		}
	};
	let fallbackIpDispatcher = null;
	attempts.push({
		createDispatcher: () => {
			if (!fallbackIpDispatcher) {
				fallbackIpDispatcher = createTelegramDispatcher(fallbackIpPolicy).dispatcher;
				ownedDispatchers.add(fallbackIpDispatcher);
			}
			return fallbackIpDispatcher;
		},
		exportAttempt: { dispatcherPolicy: fallbackIpPolicy },
		logMessage: "fetch fallback: DNS-resolved IP unreachable; trying alternative Telegram API IP"
	});
	return attempts;
}
async function destroyOwnedDispatchers(dispatchers) {
	await Promise.all([...dispatchers].map(async (dispatcher) => {
		try {
			await dispatcher.destroy();
		} catch {}
	}));
}
function resolveTelegramTransport(proxyFetch, options) {
	const autoSelectDecision = resolveTelegramAutoSelectFamilyDecision({ network: options?.network });
	const dnsDecision = resolveTelegramDnsResultOrderDecision({ network: options?.network });
	logResolverNetworkDecisions({
		autoSelectDecision,
		dnsDecision
	});
	const effectiveProxyFetch = proxyFetch ?? (() => {
		const debugProxyUrl = resolveEffectiveDebugProxyUrl(void 0);
		return debugProxyUrl ? makeProxyFetch(debugProxyUrl) : void 0;
	})();
	const explicitProxyUrl = effectiveProxyFetch ? getProxyUrlFromFetch(effectiveProxyFetch) : void 0;
	const undiciSourceFetch = resolveWrappedFetch(fetch);
	const sourceFetch = explicitProxyUrl ? undiciSourceFetch : effectiveProxyFetch ? resolveWrappedFetch(effectiveProxyFetch) : undiciSourceFetch;
	const dnsResultOrder = normalizeDnsResultOrder(dnsDecision.value);
	if (effectiveProxyFetch && !explicitProxyUrl) return {
		fetch: sourceFetch,
		sourceFetch,
		close: async () => {}
	};
	const useEnvProxy = !explicitProxyUrl && hasEnvHttpProxyForTelegramApi();
	const defaultDispatcher = createTelegramDispatcher(resolveTelegramDispatcherPolicy({
		autoSelectFamily: autoSelectDecision.value,
		dnsResultOrder,
		useEnvProxy,
		forceIpv4: false,
		proxyUrl: explicitProxyUrl
	}).policy);
	const shouldBypassEnvProxy = shouldBypassEnvProxyForTelegramApi();
	const allowStickyFallback = defaultDispatcher.mode === "direct" || defaultDispatcher.mode === "env-proxy" && shouldBypassEnvProxy;
	const fallbackDispatcherPolicy = allowStickyFallback ? resolveTelegramDispatcherPolicy({
		autoSelectFamily: false,
		dnsResultOrder: "ipv4first",
		useEnvProxy: defaultDispatcher.mode === "env-proxy",
		forceIpv4: true,
		proxyUrl: explicitProxyUrl
	}).policy : void 0;
	const ownedDispatchers = /* @__PURE__ */ new Set();
	const transportAttempts = createTelegramTransportAttempts({
		defaultDispatcher,
		allowFallback: allowStickyFallback,
		fallbackPolicy: fallbackDispatcherPolicy,
		ownedDispatchers
	});
	let stickyAttemptIndex = 0;
	const resolvedFetch = (async (input, init) => {
		const callerProvidedDispatcher = Boolean(init?.dispatcher);
		const startIndex = Math.min(stickyAttemptIndex, transportAttempts.length - 1);
		let err;
		try {
			const response = await sourceFetch(input, withDispatcherIfMissing(init, transportAttempts[startIndex].createDispatcher()));
			captureHttpExchange({
				url: resolveRequestUrl(input),
				method: init?.method ?? "GET",
				requestHeaders: init?.headers,
				requestBody: init?.body ?? null,
				response,
				flowId: randomUUID(),
				meta: { subsystem: "telegram-fetch" }
			});
			return response;
		} catch (caught) {
			err = caught;
		}
		if (!shouldUseTelegramTransportFallback(err)) throw err;
		if (callerProvidedDispatcher) return sourceFetch(input, init ?? {});
		for (let nextIndex = startIndex + 1; nextIndex < transportAttempts.length; nextIndex += 1) {
			const nextAttempt = transportAttempts[nextIndex];
			if (nextAttempt.logMessage) log.warn(`${nextAttempt.logMessage} (codes=${formatErrorCodes(err)})`);
			try {
				const response = await sourceFetch(input, withDispatcherIfMissing(init, nextAttempt.createDispatcher()));
				captureHttpExchange({
					url: resolveRequestUrl(input),
					method: init?.method ?? "GET",
					requestHeaders: init?.headers,
					requestBody: init?.body ?? null,
					response,
					flowId: randomUUID(),
					meta: {
						subsystem: "telegram-fetch",
						fallbackAttempt: nextIndex
					}
				});
				stickyAttemptIndex = nextIndex;
				return response;
			} catch (caught) {
				err = caught;
				if (!shouldUseTelegramTransportFallback(err)) throw err;
			}
		}
		throw err;
	});
	let closed = false;
	const close = async () => {
		if (closed) return;
		closed = true;
		const toDestroy = [...ownedDispatchers];
		ownedDispatchers.clear();
		await destroyOwnedDispatchers(toDestroy);
	};
	return {
		fetch: resolvedFetch,
		sourceFetch,
		dispatcherAttempts: transportAttempts.map((attempt) => attempt.exportAttempt),
		close
	};
}
function resolveTelegramFetch(proxyFetch, options) {
	return resolveTelegramTransport(proxyFetch, options).fetch;
}
/**
* Resolve the Telegram Bot API base URL from an optional `apiRoot` config value.
* Returns a trimmed URL without trailing slash, or the standard default.
*/
function resolveTelegramApiBase(apiRoot) {
	const trimmed = apiRoot?.trim();
	return trimmed ? trimmed.replace(/\/+$/, "") : `https://${TELEGRAM_API_HOSTNAME}`;
}
//#endregion
export { makeProxyFetch as a, shouldRetryTelegramTransportFallback as i, resolveTelegramFetch as n, resolveTelegramTransport as r, resolveTelegramApiBase as t };
