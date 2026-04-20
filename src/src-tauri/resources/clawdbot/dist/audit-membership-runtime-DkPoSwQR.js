import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { l as isRecord } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
import { n as isWSL2Sync } from "./wsl-DlWsqZ4r.js";
import { n as hasEnvHttpProxyConfigured } from "./proxy-env-qIN1SJGt.js";
import { f as resolveEffectiveDebugProxyUrl, t as captureHttpExchange } from "./runtime-CdS7ehWO.js";
import { r as fetchWithTimeout } from "./fetch-timeout-DZD6CQL_.js";
import { o as createPinnedLookup } from "./ssrf-DoOclwFS.js";
import { n as getProxyUrlFromFetch, r as makeProxyFetch } from "./proxy-fetch-5deRg8He.js";
import "./text-runtime-DTMxvodz.js";
import "./error-runtime-CgBDklBz.js";
import { t as resolveRequestUrl } from "./request-url-DqjdVIkC.js";
import "./runtime-env-DjtBb0Ku.js";
import "./proxy-capture-NT34yEe7.js";
import { t as resolveFetch } from "./fetch-DByu7Ja3.js";
import "./fetch-runtime-CzRUOCRM.js";
import process$1 from "node:process";
import { randomUUID } from "node:crypto";
import { Agent, EnvHttpProxyAgent, ProxyAgent, fetch } from "undici";
import * as dns from "node:dns";
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
	if (policy.mode === "explicit-proxy") {
		const requestTlsOptions = withPinnedLookup(policy.proxyTls, policy.pinnedHostname);
		const proxyOptions = requestTlsOptions ? {
			uri: policy.proxyUrl,
			requestTls: requestTlsOptions
		} : policy.proxyUrl;
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
		const proxyOptions = connectOptions || proxyTlsOptions ? {
			...connectOptions ? { connect: connectOptions } : {},
			...proxyTlsOptions ? { proxyTls: proxyTlsOptions } : {}
		} : void 0;
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
				dispatcher: new Agent(directPolicy.connect ? { connect: directPolicy.connect } : void 0),
				mode: "direct",
				effectivePolicy: directPolicy
			};
		}
	}
	const connectOptions = withPinnedLookup(policy.connect, policy.pinnedHostname);
	return {
		dispatcher: new Agent(connectOptions ? { connect: connectOptions } : void 0),
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
function createTelegramTransportAttempts(params) {
	const attempts = [{
		createDispatcher: () => params.defaultDispatcher.dispatcher,
		exportAttempt: { dispatcherPolicy: params.defaultDispatcher.effectivePolicy }
	}];
	if (!params.allowFallback || !params.fallbackPolicy) return attempts;
	const fallbackPolicy = params.fallbackPolicy;
	let ipv4Dispatcher = null;
	attempts.push({
		createDispatcher: () => {
			if (!ipv4Dispatcher) ipv4Dispatcher = createTelegramDispatcher(fallbackPolicy).dispatcher;
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
			if (!fallbackIpDispatcher) fallbackIpDispatcher = createTelegramDispatcher(fallbackIpPolicy).dispatcher;
			return fallbackIpDispatcher;
		},
		exportAttempt: { dispatcherPolicy: fallbackIpPolicy },
		logMessage: "fetch fallback: DNS-resolved IP unreachable; trying alternative Telegram API IP"
	});
	return attempts;
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
		sourceFetch
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
	const transportAttempts = createTelegramTransportAttempts({
		defaultDispatcher,
		allowFallback: allowStickyFallback,
		fallbackPolicy: allowStickyFallback ? resolveTelegramDispatcherPolicy({
			autoSelectFamily: false,
			dnsResultOrder: "ipv4first",
			useEnvProxy: defaultDispatcher.mode === "env-proxy",
			forceIpv4: true,
			proxyUrl: explicitProxyUrl
		}).policy : void 0
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
	return {
		fetch: resolvedFetch,
		sourceFetch,
		dispatcherAttempts: transportAttempts.map((attempt) => attempt.exportAttempt)
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
//#region extensions/telegram/src/audit-membership-runtime.ts
async function auditTelegramGroupMembershipImpl(params) {
	const fetcher = resolveTelegramFetch(params.proxyUrl ? makeProxyFetch(params.proxyUrl) : void 0, { network: params.network });
	const base = `${resolveTelegramApiBase(params.apiRoot)}/bot${params.token}`;
	const groups = [];
	for (const chatId of params.groupIds) try {
		const res = await fetchWithTimeout(`${base}/getChatMember?chat_id=${encodeURIComponent(chatId)}&user_id=${encodeURIComponent(String(params.botId))}`, {}, params.timeoutMs, fetcher);
		const json = await res.json();
		if (!res.ok || !isRecord(json) || !json.ok) {
			const desc = isRecord(json) && !json.ok && typeof json.description === "string" ? json.description : `getChatMember failed (${res.status})`;
			groups.push({
				chatId,
				ok: false,
				status: null,
				error: desc,
				matchKey: chatId,
				matchSource: "id"
			});
			continue;
		}
		const status = isRecord(json.result) && typeof json.result.status === "string" ? json.result.status : null;
		const ok = status === "creator" || status === "administrator" || status === "member";
		groups.push({
			chatId,
			ok,
			status,
			error: ok ? null : "bot not in group",
			matchKey: chatId,
			matchSource: "id"
		});
	} catch (err) {
		groups.push({
			chatId,
			ok: false,
			status: null,
			error: formatErrorMessage(err),
			matchKey: chatId,
			matchSource: "id"
		});
	}
	return {
		ok: groups.every((g) => g.ok),
		checkedGroups: groups.length,
		unresolvedGroups: 0,
		hasWildcardUnmentionedGroups: false,
		groups
	};
}
//#endregion
export { auditTelegramGroupMembershipImpl };
