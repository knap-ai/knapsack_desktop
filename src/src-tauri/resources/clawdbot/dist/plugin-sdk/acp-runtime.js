import { c as normalizeOptionalString } from "../string-coerce-Bje8XVt9.js";
import { n as AcpRuntimeError, r as isAcpRuntimeError } from "../errors-DII5rEKQ.js";
import { a as unregisterAcpRuntimeBackend, i as requireAcpRuntimeBackend, n as getAcpRuntimeBackend, r as registerAcpRuntimeBackend, t as __testing$1 } from "../registry-D-ZIoZaU.js";
import { n as getAcpSessionManager, t as __testing$2 } from "../manager-BIQ5eGBZ.js";
import { n as readAcpSessionEntry } from "../session-meta-D3_oSoyR.js";
//#region src/plugin-sdk/acp-runtime.ts
let dispatchAcpRuntimePromise = null;
function loadDispatchAcpRuntime() {
	dispatchAcpRuntimePromise ??= import("../dispatch-acp.runtime-D2vMSg3f.js");
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
		if (Reflect.has(__testing$2, prop)) return Reflect.get(__testing$2, prop, receiver);
		return Reflect.get(__testing$1, prop, receiver);
	},
	has(_target, prop) {
		return Reflect.has(__testing$2, prop) || Reflect.has(__testing$1, prop);
	},
	ownKeys() {
		return Array.from(new Set([...Reflect.ownKeys(__testing$2), ...Reflect.ownKeys(__testing$1)]));
	},
	getOwnPropertyDescriptor(_target, prop) {
		if (Reflect.has(__testing$2, prop) || Reflect.has(__testing$1, prop)) return {
			configurable: true,
			enumerable: true
		};
	}
});
//#endregion
export { AcpRuntimeError, __testing, getAcpRuntimeBackend, getAcpSessionManager, isAcpRuntimeError, readAcpSessionEntry, registerAcpRuntimeBackend, requireAcpRuntimeBackend, tryDispatchAcpReplyHook, unregisterAcpRuntimeBackend };
