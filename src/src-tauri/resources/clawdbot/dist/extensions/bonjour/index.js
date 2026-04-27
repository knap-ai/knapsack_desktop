import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { isTruthyEnvValue } from "openclaw/plugin-sdk/runtime-env";
//#region extensions/bonjour/src/errors.ts
function formatBonjourError(err) {
	if (err instanceof Error) {
		const msg = err.message.trim() || err.name || String(err).trim();
		if (err.name && err.name !== "Error") return msg === err.name ? err.name : `${err.name}: ${msg}`;
		return msg;
	}
	return String(err);
}
//#endregion
//#region extensions/bonjour/src/ciao.ts
const CIAO_CANCELLATION_MESSAGE_RE = /^CIAO (?:ANNOUNCEMENT|PROBING) CANCELLED\b/u;
const CIAO_INTERFACE_ASSERTION_MESSAGE_RE = /REACHED ILLEGAL STATE!?\s+IPV4 ADDRESS CHANGE FROM DEFINED TO UNDEFINED!?/u;
function classifyCiaoUnhandledRejection(reason) {
	const formatted = formatBonjourError(reason);
	const message = formatted.toUpperCase();
	if (CIAO_CANCELLATION_MESSAGE_RE.test(message)) return {
		kind: "cancellation",
		formatted
	};
	if (CIAO_INTERFACE_ASSERTION_MESSAGE_RE.test(message)) return {
		kind: "interface-assertion",
		formatted
	};
	return null;
}
//#endregion
//#region extensions/bonjour/src/advertiser.ts
const WATCHDOG_INTERVAL_MS = 5e3;
const REPAIR_DEBOUNCE_MS = 3e4;
const STUCK_ANNOUNCING_MS = 8e3;
const BONJOUR_ANNOUNCED_STATE = "announced";
const CIAO_SELF_PROBE_RETRY_FRAGMENT = "failed probing with reason: Error: Can't probe for a service which is announced already.";
const defaultLogger = {
	info: (_msg) => {},
	warn: (_msg) => {},
	debug: (_msg) => {}
};
const CIAO_MODULE_ID = "@homebridge/ciao";
let ciaoModulePromise = null;
async function loadCiaoModule() {
	ciaoModulePromise ??= import(CIAO_MODULE_ID);
	return ciaoModulePromise;
}
function isDisabledByEnv() {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_BONJOUR)) return true;
	if (process.env.VITEST) return true;
	return false;
}
function safeServiceName(name) {
	const trimmed = name.trim();
	return trimmed.length > 0 ? trimmed : "OpenClaw";
}
function prettifyInstanceName(name) {
	const normalized = name.trim().replace(/\s+/g, " ");
	return normalized.replace(/\s+\(OpenClaw\)\s*$/i, "").trim() || normalized;
}
function serviceSummary(label, svc) {
	let fqdn = "unknown";
	let hostname = "unknown";
	let port = -1;
	try {
		fqdn = svc.getFQDN();
	} catch {}
	try {
		hostname = svc.getHostname();
	} catch {}
	try {
		port = svc.getPort();
	} catch {}
	const state = typeof svc.serviceState === "string" ? svc.serviceState : "unknown";
	return `${label} fqdn=${fqdn} host=${hostname} port=${port} state=${state}`;
}
function isAnnouncedState(state) {
	return state === BONJOUR_ANNOUNCED_STATE;
}
function shouldSuppressCiaoConsoleLog(args) {
	return args.some((arg) => typeof arg === "string" && arg.includes(CIAO_SELF_PROBE_RETRY_FRAGMENT));
}
function installCiaoConsoleNoiseFilter() {
	const previousConsoleLog = console.log;
	const wrapper = ((...args) => {
		if (shouldSuppressCiaoConsoleLog(args)) return;
		previousConsoleLog(...args);
	});
	console.log = wrapper;
	return () => {
		if (console.log === wrapper) console.log = previousConsoleLog;
	};
}
async function startGatewayBonjourAdvertiser(opts, deps = {}) {
	if (isDisabledByEnv()) return { stop: async () => {} };
	const logger = {
		info: deps.logger?.info ?? defaultLogger.info,
		warn: deps.logger?.warn ?? defaultLogger.warn,
		debug: deps.logger?.debug ?? defaultLogger.debug
	};
	const { getResponder, Protocol } = await loadCiaoModule();
	const restoreConsoleLog = installCiaoConsoleNoiseFilter();
	const handleCiaoUnhandledRejection = (reason) => {
		const classification = classifyCiaoUnhandledRejection(reason);
		if (!classification) return false;
		if (classification.kind === "interface-assertion") {
			logger.warn(`bonjour: suppressing ciao interface assertion: ${classification.formatted}`);
			return true;
		}
		logger.debug(`bonjour: ignoring unhandled ciao rejection: ${classification.formatted}`);
		return true;
	};
	try {
		const hostname = (process.env.OPENCLAW_MDNS_HOSTNAME?.trim() || "openclaw").replace(/\.local$/i, "").split(".")[0].trim() || "openclaw";
		const instanceName = typeof opts.instanceName === "string" && opts.instanceName.trim() ? opts.instanceName.trim() : `${hostname} (OpenClaw)`;
		const displayName = prettifyInstanceName(instanceName);
		const txtBase = {
			role: "gateway",
			gatewayPort: String(opts.gatewayPort),
			lanHost: `${hostname}.local`,
			displayName
		};
		if (opts.gatewayTlsEnabled) {
			txtBase.gatewayTls = "1";
			if (opts.gatewayTlsFingerprintSha256) txtBase.gatewayTlsSha256 = opts.gatewayTlsFingerprintSha256;
		}
		if (typeof opts.canvasPort === "number" && opts.canvasPort > 0) txtBase.canvasPort = String(opts.canvasPort);
		if (!opts.minimal && typeof opts.tailnetDns === "string" && opts.tailnetDns.trim()) txtBase.tailnetDns = opts.tailnetDns.trim();
		if (!opts.minimal && typeof opts.cliPath === "string" && opts.cliPath.trim()) txtBase.cliPath = opts.cliPath.trim();
		const gatewayTxt = {
			...txtBase,
			transport: "gateway"
		};
		if (!opts.minimal) gatewayTxt.sshPort = String(opts.sshPort ?? 22);
		function createCycle() {
			const responder = getResponder();
			const services = [];
			const gateway = responder.createService({
				name: safeServiceName(instanceName),
				type: "openclaw-gw",
				protocol: Protocol.TCP,
				port: opts.gatewayPort,
				domain: "local",
				hostname,
				txt: gatewayTxt
			});
			services.push({
				label: "gateway",
				svc: gateway
			});
			return {
				responder,
				services,
				cleanupUnhandledRejection: services.length > 0 && deps.registerUnhandledRejectionHandler ? deps.registerUnhandledRejectionHandler(handleCiaoUnhandledRejection) : void 0
			};
		}
		async function stopCycle(cycle) {
			if (!cycle) return;
			for (const { svc } of cycle.services) try {
				await svc.destroy();
			} catch {}
			try {
				await cycle.responder.shutdown();
			} catch {} finally {
				cycle.cleanupUnhandledRejection?.();
			}
		}
		function attachConflictListeners(services) {
			for (const { label, svc } of services) try {
				svc.on("name-change", (name) => {
					const next = typeof name === "string" ? name : String(name);
					logger.warn(`bonjour: ${label} name conflict resolved; newName=${JSON.stringify(next)}`);
				});
				svc.on("hostname-change", (nextHostname) => {
					const next = typeof nextHostname === "string" ? nextHostname : String(nextHostname);
					logger.warn(`bonjour: ${label} hostname conflict resolved; newHostname=${JSON.stringify(next)}`);
				});
			} catch (err) {
				logger.debug(`bonjour: failed to attach listeners for ${label}: ${String(err)}`);
			}
		}
		function startAdvertising(services) {
			for (const { label, svc } of services) try {
				svc.advertise().then(() => {
					logger.info(`bonjour: advertised ${serviceSummary(label, svc)}`);
				}).catch((err) => {
					logger.warn(`bonjour: advertise failed (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
				});
			} catch (err) {
				logger.warn(`bonjour: advertise threw (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
			}
		}
		logger.debug(`bonjour: starting (hostname=${hostname}, instance=${JSON.stringify(safeServiceName(instanceName))}, gatewayPort=${opts.gatewayPort}${opts.minimal ? ", minimal=true" : `, sshPort=${opts.sshPort ?? 22}`})`);
		let stopped = false;
		let recreatePromise = null;
		let cycle = createCycle();
		const stateTracker = /* @__PURE__ */ new Map();
		attachConflictListeners(cycle.services);
		startAdvertising(cycle.services);
		const updateStateTrackers = (services) => {
			const now = Date.now();
			for (const { label, svc } of services) {
				const nextState = typeof svc.serviceState === "string" ? svc.serviceState : "unknown";
				const current = stateTracker.get(label);
				const nextEnteredAt = current && !isAnnouncedState(current.state) && !isAnnouncedState(nextState) ? current.sinceMs : now;
				if (!current || current.state !== nextState || current.sinceMs !== nextEnteredAt) stateTracker.set(label, {
					state: nextState,
					sinceMs: nextEnteredAt
				});
			}
		};
		const recreateAdvertiser = async (reason) => {
			if (stopped) return;
			if (recreatePromise) return recreatePromise;
			recreatePromise = (async () => {
				logger.warn(`bonjour: restarting advertiser (${reason})`);
				await stopCycle(cycle);
				cycle = createCycle();
				stateTracker.clear();
				attachConflictListeners(cycle.services);
				startAdvertising(cycle.services);
			})().finally(() => {
				recreatePromise = null;
			});
			return recreatePromise;
		};
		const lastRepairAttempt = /* @__PURE__ */ new Map();
		const watchdog = setInterval(() => {
			if (stopped || recreatePromise) return;
			updateStateTrackers(cycle.services);
			for (const { label, svc } of cycle.services) {
				const stateUnknown = svc.serviceState;
				if (typeof stateUnknown !== "string") continue;
				const tracked = stateTracker.get(label);
				if (stateUnknown !== "announced" && tracked && Date.now() - tracked.sinceMs >= STUCK_ANNOUNCING_MS) {
					recreateAdvertiser(`service stuck in ${stateUnknown} for ${Date.now() - tracked.sinceMs}ms (${serviceSummary(label, svc)})`);
					return;
				}
				if (stateUnknown === "announced" || stateUnknown === "announcing") continue;
				let key = label;
				try {
					key = `${label}:${svc.getFQDN()}`;
				} catch {}
				const now = Date.now();
				if (now - (lastRepairAttempt.get(key) ?? 0) < REPAIR_DEBOUNCE_MS) continue;
				lastRepairAttempt.set(key, now);
				logger.warn(`bonjour: watchdog detected non-announced service; attempting re-advertise (${serviceSummary(label, svc)})`);
				try {
					svc.advertise().catch((err) => {
						logger.warn(`bonjour: watchdog re-advertise failed (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
					});
				} catch (err) {
					logger.warn(`bonjour: watchdog re-advertise threw (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
				}
			}
		}, WATCHDOG_INTERVAL_MS);
		watchdog.unref?.();
		return { stop: async () => {
			stopped = true;
			clearInterval(watchdog);
			try {
				await recreatePromise;
			} catch {}
			await stopCycle(cycle);
			restoreConsoleLog();
		} };
	} catch (err) {
		restoreConsoleLog();
		throw err;
	}
}
//#endregion
//#region extensions/bonjour/index.ts
function formatBonjourInstanceName(displayName) {
	const trimmed = displayName.trim();
	if (!trimmed) return "OpenClaw";
	if (/openclaw/i.test(trimmed)) return trimmed;
	return `${trimmed} (OpenClaw)`;
}
var bonjour_default = definePluginEntry({
	id: "bonjour",
	name: "Bonjour Gateway Discovery",
	description: "Advertise the local OpenClaw gateway over Bonjour/mDNS.",
	register(api) {
		api.registerGatewayDiscoveryService({
			id: "bonjour",
			advertise: async (ctx) => {
				return { stop: (await startGatewayBonjourAdvertiser({
					instanceName: formatBonjourInstanceName(ctx.machineDisplayName),
					gatewayPort: ctx.gatewayPort,
					gatewayTlsEnabled: ctx.gatewayTlsEnabled,
					gatewayTlsFingerprintSha256: ctx.gatewayTlsFingerprintSha256,
					canvasPort: ctx.canvasPort,
					sshPort: ctx.sshPort,
					tailnetDns: ctx.tailnetDns,
					cliPath: ctx.cliPath,
					minimal: ctx.minimal
				}, { logger: api.logger })).stop };
			}
		});
	}
});
//#endregion
export { bonjour_default as default };
