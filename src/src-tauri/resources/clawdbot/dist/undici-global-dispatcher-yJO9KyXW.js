import { n as isWSL2Sync } from "./wsl-DlWsqZ4r.js";
import { n as hasEnvHttpProxyConfigured } from "./proxy-env-qIN1SJGt.js";
import * as net$1 from "node:net";
import { Agent, EnvHttpProxyAgent, getGlobalDispatcher, setGlobalDispatcher } from "undici";
//#region src/infra/net/undici-global-dispatcher.ts
const DEFAULT_UNDICI_STREAM_TIMEOUT_MS = 1800 * 1e3;
const AUTO_SELECT_FAMILY_ATTEMPT_TIMEOUT_MS = 300;
let lastAppliedTimeoutKey = null;
let lastAppliedProxyBootstrap = false;
function resolveDispatcherKind(dispatcher) {
	const ctorName = dispatcher?.constructor?.name;
	if (typeof ctorName !== "string" || ctorName.length === 0) return "unsupported";
	if (ctorName.includes("EnvHttpProxyAgent")) return "env-proxy";
	if (ctorName.includes("ProxyAgent")) return "unsupported";
	if (ctorName.includes("Agent")) return "agent";
	return "unsupported";
}
function resolveAutoSelectFamily() {
	if (typeof net$1.getDefaultAutoSelectFamily !== "function") return;
	try {
		const systemDefault = net$1.getDefaultAutoSelectFamily();
		if (systemDefault && isWSL2Sync()) return false;
		return systemDefault;
	} catch {
		return;
	}
}
function resolveConnectOptions(autoSelectFamily) {
	if (autoSelectFamily === void 0) return;
	return {
		autoSelectFamily,
		autoSelectFamilyAttemptTimeout: AUTO_SELECT_FAMILY_ATTEMPT_TIMEOUT_MS
	};
}
function resolveDispatcherKey(params) {
	const autoSelectToken = params.autoSelectFamily === void 0 ? "na" : params.autoSelectFamily ? "on" : "off";
	return `${params.kind}:${params.timeoutMs}:${autoSelectToken}`;
}
function resolveCurrentDispatcherKind() {
	let dispatcher;
	try {
		dispatcher = getGlobalDispatcher();
	} catch {
		return null;
	}
	const currentKind = resolveDispatcherKind(dispatcher);
	return currentKind === "unsupported" ? null : currentKind;
}
function ensureGlobalUndiciEnvProxyDispatcher() {
	if (!hasEnvHttpProxyConfigured("https")) return;
	if (lastAppliedProxyBootstrap) {
		if (resolveCurrentDispatcherKind() === "env-proxy") return;
		lastAppliedProxyBootstrap = false;
	}
	const currentKind = resolveCurrentDispatcherKind();
	if (currentKind === null) return;
	if (currentKind === "env-proxy") {
		lastAppliedProxyBootstrap = true;
		return;
	}
	try {
		setGlobalDispatcher(new EnvHttpProxyAgent());
		lastAppliedProxyBootstrap = true;
	} catch {}
}
function ensureGlobalUndiciStreamTimeouts(opts) {
	const timeoutMsRaw = opts?.timeoutMs ?? 18e5;
	const timeoutMs = Math.max(1, Math.floor(timeoutMsRaw));
	if (!Number.isFinite(timeoutMsRaw)) return;
	const kind = resolveCurrentDispatcherKind();
	if (kind === null) return;
	const autoSelectFamily = resolveAutoSelectFamily();
	const nextKey = resolveDispatcherKey({
		kind,
		timeoutMs,
		autoSelectFamily
	});
	if (lastAppliedTimeoutKey === nextKey) return;
	const connect = resolveConnectOptions(autoSelectFamily);
	try {
		if (kind === "env-proxy") setGlobalDispatcher(new EnvHttpProxyAgent({
			bodyTimeout: timeoutMs,
			headersTimeout: timeoutMs,
			...connect ? { connect } : {}
		}));
		else setGlobalDispatcher(new Agent({
			bodyTimeout: timeoutMs,
			headersTimeout: timeoutMs,
			...connect ? { connect } : {}
		}));
		lastAppliedTimeoutKey = nextKey;
	} catch {}
}
function resetGlobalUndiciStreamTimeoutsForTests() {
	lastAppliedTimeoutKey = null;
	lastAppliedProxyBootstrap = false;
}
//#endregion
export { resetGlobalUndiciStreamTimeoutsForTests as i, ensureGlobalUndiciEnvProxyDispatcher as n, ensureGlobalUndiciStreamTimeouts as r, DEFAULT_UNDICI_STREAM_TIMEOUT_MS as t };
