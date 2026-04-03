import { n as resolveGlobalSingleton } from "./global-singleton-BuWJMSMa.js";
import { n as registerListener, t as notifyListeners } from "./listeners-DG-wSW1l.js";
//#region src/infra/channel-activity.ts
const activity = /* @__PURE__ */ new Map();
function keyFor(channel, accountId) {
	return `${channel}:${accountId || "default"}`;
}
function ensureEntry(channel, accountId) {
	const key = keyFor(channel, accountId);
	const existing = activity.get(key);
	if (existing) return existing;
	const created = {
		inboundAt: null,
		outboundAt: null
	};
	activity.set(key, created);
	return created;
}
function recordChannelActivity(params) {
	const at = typeof params.at === "number" ? params.at : Date.now();
	const accountId = params.accountId?.trim() || "default";
	const entry = ensureEntry(params.channel, accountId);
	if (params.direction === "inbound") entry.inboundAt = at;
	if (params.direction === "outbound") entry.outboundAt = at;
}
function getChannelActivity(params) {
	const accountId = params.accountId?.trim() || "default";
	return activity.get(keyFor(params.channel, accountId)) ?? {
		inboundAt: null,
		outboundAt: null
	};
}
function resetChannelActivityForTest() {
	activity.clear();
}
//#endregion
//#region src/infra/heartbeat-events.ts
function resolveIndicatorType(status) {
	switch (status) {
		case "ok-empty":
		case "ok-token": return "ok";
		case "sent": return "alert";
		case "failed": return "error";
		case "skipped": return;
	}
}
const state = resolveGlobalSingleton(Symbol.for("openclaw.heartbeatEvents.state"), () => ({
	lastHeartbeat: null,
	listeners: /* @__PURE__ */ new Set()
}));
function emitHeartbeatEvent(evt) {
	const enriched = {
		ts: Date.now(),
		...evt
	};
	state.lastHeartbeat = enriched;
	notifyListeners(state.listeners, enriched);
}
function onHeartbeatEvent(listener) {
	return registerListener(state.listeners, listener);
}
function getLastHeartbeatEvent() {
	return state.lastHeartbeat;
}
function resetHeartbeatEventsForTest() {
	state.lastHeartbeat = null;
	state.listeners.clear();
}
//#endregion
//#region src/infra/heartbeat-visibility.ts
const DEFAULT_VISIBILITY = {
	showOk: false,
	showAlerts: true,
	useIndicator: true
};
/**
* Resolve heartbeat visibility settings for a channel.
* Supports both deliverable channels (telegram, signal, etc.) and webchat.
* For webchat, uses channels.defaults.heartbeat since webchat doesn't have per-channel config.
*/
function resolveHeartbeatVisibility(params) {
	const { cfg, channel, accountId } = params;
	if (channel === "webchat") {
		const channelDefaults = cfg.channels?.defaults?.heartbeat;
		return {
			showOk: channelDefaults?.showOk ?? DEFAULT_VISIBILITY.showOk,
			showAlerts: channelDefaults?.showAlerts ?? DEFAULT_VISIBILITY.showAlerts,
			useIndicator: channelDefaults?.useIndicator ?? DEFAULT_VISIBILITY.useIndicator
		};
	}
	const channelDefaults = cfg.channels?.defaults?.heartbeat;
	const channelCfg = cfg.channels?.[channel];
	const perChannel = channelCfg?.heartbeat;
	const perAccount = (accountId ? channelCfg?.accounts?.[accountId] : void 0)?.heartbeat;
	return {
		showOk: perAccount?.showOk ?? perChannel?.showOk ?? channelDefaults?.showOk ?? DEFAULT_VISIBILITY.showOk,
		showAlerts: perAccount?.showAlerts ?? perChannel?.showAlerts ?? channelDefaults?.showAlerts ?? DEFAULT_VISIBILITY.showAlerts,
		useIndicator: perAccount?.useIndicator ?? perChannel?.useIndicator ?? channelDefaults?.useIndicator ?? DEFAULT_VISIBILITY.useIndicator
	};
}
//#endregion
export { resetHeartbeatEventsForTest as a, recordChannelActivity as c, onHeartbeatEvent as i, resetChannelActivityForTest as l, emitHeartbeatEvent as n, resolveIndicatorType as o, getLastHeartbeatEvent as r, getChannelActivity as s, resolveHeartbeatVisibility as t };
