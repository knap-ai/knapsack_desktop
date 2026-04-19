import { n as hasEnvHttpProxyConfigured } from "./proxy-env-qIN1SJGt.js";
import { r as runPassiveAccountLifecycle } from "./channel-lifecycle.core-E2kK8n55.js";
import { t as createLoggerBackedRuntime } from "./runtime-logger-CMNNz8AK.js";
//#region src/plugin-sdk/extension-shared.ts
function buildPassiveChannelStatusSummary(snapshot, extra) {
	return {
		configured: snapshot.configured ?? false,
		...extra ?? {},
		running: snapshot.running ?? false,
		lastStartAt: snapshot.lastStartAt ?? null,
		lastStopAt: snapshot.lastStopAt ?? null,
		lastError: snapshot.lastError ?? null
	};
}
function buildPassiveProbedChannelStatusSummary(snapshot, extra) {
	return {
		...buildPassiveChannelStatusSummary(snapshot, extra),
		probe: snapshot.probe,
		lastProbeAt: snapshot.lastProbeAt ?? null
	};
}
function buildTrafficStatusSummary(snapshot) {
	return {
		lastInboundAt: snapshot?.lastInboundAt ?? null,
		lastOutboundAt: snapshot?.lastOutboundAt ?? null
	};
}
async function runStoppablePassiveMonitor(params) {
	await runPassiveAccountLifecycle({
		abortSignal: params.abortSignal,
		start: params.start,
		stop: async (monitor) => {
			monitor.stop();
		}
	});
}
function resolveLoggerBackedRuntime(runtime, logger) {
	return runtime ?? createLoggerBackedRuntime({
		logger,
		exitError: () => /* @__PURE__ */ new Error("Runtime exit not available")
	});
}
function requireChannelOpenAllowFrom(params) {
	params.requireOpenAllowFrom({
		policy: params.policy,
		allowFrom: params.allowFrom,
		ctx: params.ctx,
		path: ["allowFrom"],
		message: `channels.${params.channel}.dmPolicy="open" requires channels.${params.channel}.allowFrom to include "*"`
	});
}
function readStatusIssueFields(value, fields) {
	if (!value || typeof value !== "object") return null;
	const record = value;
	const result = {};
	for (const field of fields) result[field] = record[field];
	return result;
}
function coerceStatusIssueAccountId(value) {
	return typeof value === "string" ? value : typeof value === "number" ? String(value) : void 0;
}
function createDeferred() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
async function resolveAmbientNodeProxyAgent(params) {
	if (!hasEnvHttpProxyConfigured(params?.protocol ?? "https")) return;
	try {
		const { ProxyAgent } = await import("proxy-agent");
		params?.onUsingProxy?.();
		return new ProxyAgent();
	} catch (error) {
		params?.onError?.(error);
		return;
	}
}
//#endregion
export { createDeferred as a, resolveAmbientNodeProxyAgent as c, coerceStatusIssueAccountId as i, resolveLoggerBackedRuntime as l, buildPassiveProbedChannelStatusSummary as n, readStatusIssueFields as o, buildTrafficStatusSummary as r, requireChannelOpenAllowFrom as s, buildPassiveChannelStatusSummary as t, runStoppablePassiveMonitor as u };
