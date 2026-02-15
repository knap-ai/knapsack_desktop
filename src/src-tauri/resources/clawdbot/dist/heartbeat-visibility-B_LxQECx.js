import { Fn as formatUserTime, In as resolveUserTimeFormat, Ln as resolveUserTimezone } from "./reply-BNEkWD6b.js";

//#region src/agents/current-time.ts
function resolveCronStyleNow(cfg, nowMs) {
	const userTimezone = resolveUserTimezone(cfg.agents?.defaults?.userTimezone);
	const userTimeFormat = resolveUserTimeFormat(cfg.agents?.defaults?.timeFormat);
	const formattedTime = formatUserTime(new Date(nowMs), userTimezone, userTimeFormat) ?? new Date(nowMs).toISOString();
	return {
		userTimezone,
		formattedTime,
		timeLine: `Current time: ${formattedTime} (${userTimezone})`
	};
}
function appendCronStyleCurrentTimeLine(text, cfg, nowMs) {
	const base = text.trimEnd();
	if (!base || base.includes("Current time:")) return base;
	const { timeLine } = resolveCronStyleNow(cfg, nowMs);
	return `${base}\n${timeLine}`;
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
let lastHeartbeat = null;
const listeners = /* @__PURE__ */ new Set();
function emitHeartbeatEvent(evt) {
	const enriched = {
		ts: Date.now(),
		...evt
	};
	lastHeartbeat = enriched;
	for (const listener of listeners) try {
		listener(enriched);
	} catch {}
}
function onHeartbeatEvent(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function getLastHeartbeatEvent() {
	return lastHeartbeat;
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
export { resolveIndicatorType as a, onHeartbeatEvent as i, emitHeartbeatEvent as n, appendCronStyleCurrentTimeLine as o, getLastHeartbeatEvent as r, resolveCronStyleNow as s, resolveHeartbeatVisibility as t };