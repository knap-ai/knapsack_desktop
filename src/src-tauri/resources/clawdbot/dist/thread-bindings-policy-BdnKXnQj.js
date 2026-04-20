import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as normalizeAccountId } from "./account-id-j7GeQlaZ.js";
import { t as getChannelPlugin } from "./registry-Delpa74L.js";
import "./plugins-D4ODSIPT.js";
//#region src/channels/thread-bindings-policy.ts
const DEFAULT_THREAD_BINDING_IDLE_HOURS = 24;
const DEFAULT_THREAD_BINDING_MAX_AGE_HOURS = 0;
function normalizeChannelId(value) {
	return normalizeLowercaseStringOrEmpty(value);
}
function supportsAutomaticThreadBindingSpawn(channel) {
	return resolveDefaultTopLevelPlacement(channel) === "child";
}
function requiresNativeThreadContextForThreadHere(channel) {
	return resolveDefaultTopLevelPlacement(channel) === "child";
}
function resolveThreadBindingPlacementForCurrentContext(params) {
	if (resolveDefaultTopLevelPlacement(params.channel) !== "child") return "current";
	return params.threadId ? "current" : "child";
}
function resolveDefaultTopLevelPlacement(channel) {
	const normalized = normalizeChannelId(channel);
	if (!normalized) return "current";
	return getChannelPlugin(normalized)?.conversationBindings?.defaultTopLevelPlacement ?? "current";
}
function normalizeBoolean(value) {
	if (typeof value !== "boolean") return;
	return value;
}
function normalizeThreadBindingHours(raw) {
	if (typeof raw !== "number" || !Number.isFinite(raw)) return;
	if (raw < 0) return;
	return raw;
}
function resolveThreadBindingIdleTimeoutMs(params) {
	const idleHours = normalizeThreadBindingHours(params.channelIdleHoursRaw) ?? normalizeThreadBindingHours(params.sessionIdleHoursRaw) ?? DEFAULT_THREAD_BINDING_IDLE_HOURS;
	return Math.floor(idleHours * 60 * 60 * 1e3);
}
function resolveThreadBindingMaxAgeMs(params) {
	const maxAgeHours = normalizeThreadBindingHours(params.channelMaxAgeHoursRaw) ?? normalizeThreadBindingHours(params.sessionMaxAgeHoursRaw) ?? DEFAULT_THREAD_BINDING_MAX_AGE_HOURS;
	return Math.floor(maxAgeHours * 60 * 60 * 1e3);
}
function resolveThreadBindingLifecycle(params) {
	const idleTimeoutMs = typeof params.record.idleTimeoutMs === "number" ? Math.max(0, Math.floor(params.record.idleTimeoutMs)) : params.defaultIdleTimeoutMs;
	const maxAgeMs = typeof params.record.maxAgeMs === "number" ? Math.max(0, Math.floor(params.record.maxAgeMs)) : params.defaultMaxAgeMs;
	const inactivityExpiresAt = idleTimeoutMs > 0 ? Math.max(params.record.lastActivityAt, params.record.boundAt) + idleTimeoutMs : void 0;
	const maxAgeExpiresAt = maxAgeMs > 0 ? params.record.boundAt + maxAgeMs : void 0;
	if (inactivityExpiresAt != null && maxAgeExpiresAt != null) return inactivityExpiresAt <= maxAgeExpiresAt ? {
		expiresAt: inactivityExpiresAt,
		reason: "idle-expired"
	} : {
		expiresAt: maxAgeExpiresAt,
		reason: "max-age-expired"
	};
	if (inactivityExpiresAt != null) return {
		expiresAt: inactivityExpiresAt,
		reason: "idle-expired"
	};
	if (maxAgeExpiresAt != null) return {
		expiresAt: maxAgeExpiresAt,
		reason: "max-age-expired"
	};
	return {};
}
function resolveThreadBindingEffectiveExpiresAt(params) {
	return resolveThreadBindingLifecycle(params).expiresAt;
}
function resolveThreadBindingsEnabled(params) {
	return normalizeBoolean(params.channelEnabledRaw) ?? normalizeBoolean(params.sessionEnabledRaw) ?? true;
}
function resolveChannelThreadBindings(params) {
	const channelConfig = params.cfg.channels?.[params.channel];
	const accountConfig = channelConfig?.accounts?.[params.accountId];
	return {
		root: channelConfig?.threadBindings,
		account: accountConfig?.threadBindings
	};
}
function resolveSpawnFlagKey(kind) {
	return kind === "subagent" ? "spawnSubagentSessions" : "spawnAcpSessions";
}
function resolveThreadBindingSpawnPolicy(params) {
	const channel = normalizeChannelId(params.channel);
	const accountId = normalizeAccountId(params.accountId);
	const { root, account } = resolveChannelThreadBindings({
		cfg: params.cfg,
		channel,
		accountId
	});
	const enabled = normalizeBoolean(account?.enabled) ?? normalizeBoolean(root?.enabled) ?? normalizeBoolean(params.cfg.session?.threadBindings?.enabled) ?? true;
	const spawnFlagKey = resolveSpawnFlagKey(params.kind);
	return {
		channel,
		accountId,
		enabled,
		spawnEnabled: normalizeBoolean(account?.[spawnFlagKey]) ?? normalizeBoolean(root?.[spawnFlagKey]) ?? resolveDefaultTopLevelPlacement(channel) !== "child"
	};
}
function resolveThreadBindingIdleTimeoutMsForChannel(params) {
	const { root, account } = resolveThreadBindingChannelScope(params);
	return resolveThreadBindingIdleTimeoutMs({
		channelIdleHoursRaw: account?.idleHours ?? root?.idleHours,
		sessionIdleHoursRaw: params.cfg.session?.threadBindings?.idleHours
	});
}
function resolveThreadBindingMaxAgeMsForChannel(params) {
	const { root, account } = resolveThreadBindingChannelScope(params);
	return resolveThreadBindingMaxAgeMs({
		channelMaxAgeHoursRaw: account?.maxAgeHours ?? root?.maxAgeHours,
		sessionMaxAgeHoursRaw: params.cfg.session?.threadBindings?.maxAgeHours
	});
}
function resolveThreadBindingChannelScope(params) {
	const channel = normalizeChannelId(params.channel);
	const accountId = normalizeAccountId(params.accountId);
	return resolveChannelThreadBindings({
		cfg: params.cfg,
		channel,
		accountId
	});
}
function formatThreadBindingDisabledError(params) {
	return `Thread bindings are disabled for ${params.channel} (set channels.${params.channel}.threadBindings.enabled=true to override for this account, or session.threadBindings.enabled=true globally).`;
}
function formatThreadBindingSpawnDisabledError(params) {
	const spawnFlagKey = resolveSpawnFlagKey(params.kind);
	return `Thread-bound ${params.kind} spawns are disabled for ${params.channel} (set channels.${params.channel}.threadBindings.${spawnFlagKey}=true to enable).`;
}
//#endregion
export { resolveThreadBindingIdleTimeoutMs as a, resolveThreadBindingMaxAgeMs as c, resolveThreadBindingSpawnPolicy as d, resolveThreadBindingsEnabled as f, resolveThreadBindingEffectiveExpiresAt as i, resolveThreadBindingMaxAgeMsForChannel as l, formatThreadBindingSpawnDisabledError as n, resolveThreadBindingIdleTimeoutMsForChannel as o, supportsAutomaticThreadBindingSpawn as p, requiresNativeThreadContextForThreadHere as r, resolveThreadBindingLifecycle as s, formatThreadBindingDisabledError as t, resolveThreadBindingPlacementForCurrentContext as u };
