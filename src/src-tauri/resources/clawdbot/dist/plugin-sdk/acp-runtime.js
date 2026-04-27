import { c as normalizeOptionalString } from "../string-coerce-C1IzJjqi.js";
import { n as AcpRuntimeError, r as isAcpRuntimeError } from "../errors-DbyMWuiR.js";
import { a as getAcpRuntimeBackend, c as unregisterAcpRuntimeBackend, i as __testing$2, n as getAcpSessionManager, o as registerAcpRuntimeBackend, s as requireAcpRuntimeBackend, t as __testing$1 } from "../manager-C1Jx3l8a.js";
import { n as readAcpSessionEntry } from "../session-meta-Tafp3XqB.js";
//#region src/plugin-sdk/acp-runtime.ts
let dispatchAcpRuntimePromise = null;
function loadDispatchAcpRuntime() {
	dispatchAcpRuntimePromise ??= import("../dispatch-acp.runtime-DOohifi5.js");
	return dispatchAcpRuntimePromise;
}
function hasExplicitCommandCandidate(ctx) {
	if (normalizeOptionalString(ctx.CommandBody)) return true;
	const normalized = normalizeOptionalString(ctx.BodyForCommands);
	if (!normalized) return false;
	return normalized.startsWith("!") || normalized.startsWith("/");
}
async function tryDispatchAcpReplyHook(event, ctx) {
	if (event.sendPolicy === "deny" && !event.suppressUserDelivery && !hasExplicitCommandCandidate(event.ctx) && !event.isTailDispatch) return;
	const runtime = await loadDispatchAcpRuntime();
	const bypassForCommand = await runtime.shouldBypassAcpDispatchForCommand(event.ctx, ctx.cfg);
	if (event.sendPolicy === "deny" && !event.suppressUserDelivery && !bypassForCommand && !event.isTailDispatch) return;
	const result = await runtime.tryDispatchAcpReply({
		ctx: event.ctx,
		cfg: ctx.cfg,
		dispatcher: ctx.dispatcher,
		runId: event.runId,
		sessionKey: event.sessionKey,
		images: event.images,
		abortSignal: ctx.abortSignal,
		inboundAudio: event.inboundAudio,
		sessionTtsAuto: event.sessionTtsAuto,
		ttsChannel: event.ttsChannel,
		suppressUserDelivery: event.suppressUserDelivery,
		shouldRouteToOriginating: event.shouldRouteToOriginating,
		originatingChannel: event.originatingChannel,
		originatingTo: event.originatingTo,
		shouldSendToolSummaries: event.shouldSendToolSummaries,
		bypassForCommand,
		onReplyStart: ctx.onReplyStart,
		recordProcessed: ctx.recordProcessed,
		markIdle: ctx.markIdle
	});
	if (!result) return;
	return {
		handled: true,
		queuedFinal: result.queuedFinal,
		counts: result.counts
	};
}
const __testing = new Proxy({}, {
	get(_target, prop, receiver) {
		if (Reflect.has(__testing$1, prop)) return Reflect.get(__testing$1, prop, receiver);
		return Reflect.get(__testing$2, prop, receiver);
	},
	has(_target, prop) {
		return Reflect.has(__testing$1, prop) || Reflect.has(__testing$2, prop);
	},
	ownKeys() {
		return Array.from(new Set([...Reflect.ownKeys(__testing$1), ...Reflect.ownKeys(__testing$2)]));
	},
	getOwnPropertyDescriptor(_target, prop) {
		if (Reflect.has(__testing$1, prop) || Reflect.has(__testing$2, prop)) return {
			configurable: true,
			enumerable: true
		};
	}
});
//#endregion
export { AcpRuntimeError, __testing, getAcpRuntimeBackend, getAcpSessionManager, isAcpRuntimeError, readAcpSessionEntry, registerAcpRuntimeBackend, requireAcpRuntimeBackend, tryDispatchAcpReplyHook, unregisterAcpRuntimeBackend };
