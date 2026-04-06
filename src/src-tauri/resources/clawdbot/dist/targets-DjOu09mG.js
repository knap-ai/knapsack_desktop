import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { t as formatCliCommand } from "./command-format-CkCGNdQh.js";
import { d as normalizeMessageChannel, r as isDeliverableMessageChannel } from "./message-channel-D19EDm2g.js";
import { t as normalizeChatType } from "./chat-type-C7RL3WXY.js";
import { i as mergeDeliveryContext, t as deliveryContextFromSession } from "./delivery-context-BV8uXbJ1.js";
import { n as resolveOutboundChannelPlugin, t as normalizeDeliverableOutboundChannel } from "./channel-resolution-DMj4FWdt.js";
import { n as parseExplicitTargetForChannel, r as resolveComparableTargetForChannel, t as comparableChannelTargetsShareRoute } from "./target-parsing-CYsOfnR5.js";
import { g as mapAllowFromEntries } from "./channel-config-helpers-B0S2z66F.js";
import { n as missingTargetError } from "./target-errors-B-DHXiI8.js";
//#region src/infra/outbound/targets.ts
function parseExplicitTargetWithPlugin(params) {
	const raw = params.raw?.trim();
	if (!raw) return null;
	const provider = params.channel ?? params.fallbackChannel;
	if (!provider) return null;
	return parseExplicitTargetForChannel(provider, raw);
}
function resolveSessionDeliveryTarget(params) {
	const context = deliveryContextFromSession(params.entry);
	const sessionLastChannel = context?.channel && isDeliverableMessageChannel(context.channel) ? context.channel : void 0;
	const parsedSessionTarget = sessionLastChannel ? resolveComparableTargetForChannel({
		channel: sessionLastChannel,
		rawTarget: context?.to,
		fallbackThreadId: context?.threadId
	}) : null;
	const hasTurnSourceChannel = params.turnSourceChannel != null;
	const parsedTurnSourceTarget = hasTurnSourceChannel && params.turnSourceChannel ? resolveComparableTargetForChannel({
		channel: params.turnSourceChannel,
		rawTarget: params.turnSourceTo,
		fallbackThreadId: params.turnSourceThreadId
	}) : null;
	const hasTurnSourceThreadId = parsedTurnSourceTarget?.threadId != null;
	const lastChannel = hasTurnSourceChannel ? params.turnSourceChannel : sessionLastChannel;
	const lastTo = hasTurnSourceChannel ? params.turnSourceTo : context?.to;
	const lastAccountId = hasTurnSourceChannel ? params.turnSourceAccountId : context?.accountId;
	const turnToMatchesSession = !params.turnSourceTo || !context?.to || params.turnSourceChannel === sessionLastChannel && comparableChannelTargetsShareRoute({
		left: parsedTurnSourceTarget,
		right: parsedSessionTarget
	});
	const lastThreadId = hasTurnSourceThreadId ? parsedTurnSourceTarget?.threadId : hasTurnSourceChannel && (params.turnSourceChannel !== sessionLastChannel || !turnToMatchesSession) ? void 0 : parsedSessionTarget?.threadId;
	const rawRequested = params.requestedChannel ?? "last";
	const requested = rawRequested === "last" ? "last" : normalizeMessageChannel(rawRequested);
	const requestedChannel = requested === "last" ? "last" : requested && isDeliverableMessageChannel(requested) ? requested : void 0;
	const rawExplicitTo = typeof params.explicitTo === "string" && params.explicitTo.trim() ? params.explicitTo.trim() : void 0;
	let channel = requestedChannel === "last" ? lastChannel : requestedChannel;
	if (!channel && params.fallbackChannel && isDeliverableMessageChannel(params.fallbackChannel)) channel = params.fallbackChannel;
	let explicitTo = rawExplicitTo;
	const parsedExplicitTarget = parseExplicitTargetWithPlugin({
		channel,
		fallbackChannel: !channel ? lastChannel : void 0,
		raw: rawExplicitTo
	});
	if (parsedExplicitTarget?.to) explicitTo = parsedExplicitTarget.to;
	const explicitThreadId = params.explicitThreadId != null && params.explicitThreadId !== "" ? params.explicitThreadId : parsedExplicitTarget?.threadId;
	let to = explicitTo;
	if (!to && lastTo) {
		if (channel && channel === lastChannel) to = lastTo;
		else if (params.allowMismatchedLastTo) to = lastTo;
	}
	const mode = params.mode ?? (explicitTo ? "explicit" : "implicit");
	const accountId = channel && channel === lastChannel ? lastAccountId : void 0;
	const threadId = channel && channel === lastChannel ? mode === "heartbeat" ? hasTurnSourceThreadId ? params.turnSourceThreadId : void 0 : lastThreadId : void 0;
	const resolvedThreadId = explicitThreadId ?? threadId;
	return {
		channel,
		to,
		accountId,
		threadId: resolvedThreadId,
		threadIdExplicit: resolvedThreadId != null && explicitThreadId != null,
		mode,
		lastChannel,
		lastTo,
		lastAccountId,
		lastThreadId
	};
}
function resolveOutboundTarget(params) {
	if (params.channel === "webchat") return {
		ok: false,
		error: /* @__PURE__ */ new Error(`Delivering to WebChat is not supported via \`${formatCliCommand("openclaw agent")}\`; use WhatsApp/Telegram or run with --deliver=false.`)
	};
	const plugin = resolveOutboundChannelPlugin({
		channel: params.channel,
		cfg: params.cfg
	});
	if (!plugin) return {
		ok: false,
		error: /* @__PURE__ */ new Error(`Unsupported channel: ${params.channel}`)
	};
	const allowFromRaw = params.allowFrom ?? (params.cfg && plugin.config.resolveAllowFrom ? plugin.config.resolveAllowFrom({
		cfg: params.cfg,
		accountId: params.accountId ?? void 0
	}) : void 0);
	const allowFrom = allowFromRaw ? mapAllowFromEntries(allowFromRaw) : void 0;
	const effectiveTo = params.to?.trim() || (params.cfg && plugin.config.resolveDefaultTo ? plugin.config.resolveDefaultTo({
		cfg: params.cfg,
		accountId: params.accountId ?? void 0
	}) : void 0);
	const resolveTarget = plugin.outbound?.resolveTarget;
	if (resolveTarget) return resolveTarget({
		cfg: params.cfg,
		to: effectiveTo,
		allowFrom,
		accountId: params.accountId ?? void 0,
		mode: params.mode ?? "explicit"
	});
	if (effectiveTo) return {
		ok: true,
		to: effectiveTo
	};
	const hint = plugin.messaging?.targetResolver?.hint;
	return {
		ok: false,
		error: missingTargetError(plugin.meta.label ?? params.channel, hint)
	};
}
function resolveHeartbeatDeliveryTarget(params) {
	const { cfg, entry } = params;
	const heartbeat = params.heartbeat ?? cfg.agents?.defaults?.heartbeat;
	const rawTarget = heartbeat?.target;
	let target = "none";
	if (rawTarget === "none" || rawTarget === "last") target = rawTarget;
	else if (typeof rawTarget === "string") {
		const normalized = normalizeDeliverableOutboundChannel(rawTarget);
		if (normalized) target = normalized;
	}
	if (target === "none") {
		const base = resolveSessionDeliveryTarget({ entry });
		return buildNoHeartbeatDeliveryTarget({
			reason: "target-none",
			lastChannel: base.lastChannel,
			lastAccountId: base.lastAccountId
		});
	}
	const resolvedTurnSource = target === "last" ? mergeDeliveryContext(params.turnSource, deliveryContextFromSession(entry)) : void 0;
	const resolvedTarget = resolveSessionDeliveryTarget({
		entry,
		requestedChannel: target === "last" ? "last" : target,
		explicitTo: heartbeat?.to,
		mode: "heartbeat",
		turnSourceChannel: resolvedTurnSource?.channel && isDeliverableMessageChannel(resolvedTurnSource.channel) ? resolvedTurnSource.channel : void 0,
		turnSourceTo: resolvedTurnSource?.to,
		turnSourceAccountId: resolvedTurnSource?.accountId,
		turnSourceThreadId: params.turnSource?.threadId
	});
	const heartbeatAccountId = heartbeat?.accountId?.trim();
	let effectiveAccountId = heartbeatAccountId || resolvedTarget.accountId;
	if (heartbeatAccountId && resolvedTarget.channel) {
		const listAccountIds = resolveOutboundChannelPlugin({
			channel: resolvedTarget.channel,
			cfg
		})?.config.listAccountIds;
		const accountIds = listAccountIds ? listAccountIds(cfg) : [];
		if (accountIds.length > 0) {
			const normalizedAccountId = normalizeAccountId(heartbeatAccountId);
			if (!new Set(accountIds.map((accountId) => normalizeAccountId(accountId))).has(normalizedAccountId)) return buildNoHeartbeatDeliveryTarget({
				reason: "unknown-account",
				accountId: normalizedAccountId,
				lastChannel: resolvedTarget.lastChannel,
				lastAccountId: resolvedTarget.lastAccountId
			});
			effectiveAccountId = normalizedAccountId;
		}
	}
	if (!resolvedTarget.channel || !resolvedTarget.to) return buildNoHeartbeatDeliveryTarget({
		reason: "no-target",
		accountId: effectiveAccountId,
		lastChannel: resolvedTarget.lastChannel,
		lastAccountId: resolvedTarget.lastAccountId
	});
	const resolved = resolveOutboundTarget({
		channel: resolvedTarget.channel,
		to: resolvedTarget.to,
		cfg,
		accountId: effectiveAccountId,
		mode: "heartbeat"
	});
	if (!resolved.ok) return buildNoHeartbeatDeliveryTarget({
		reason: "no-target",
		accountId: effectiveAccountId,
		lastChannel: resolvedTarget.lastChannel,
		lastAccountId: resolvedTarget.lastAccountId
	});
	const sessionChatTypeHint = target === "last" && !heartbeat?.to ? normalizeChatType(entry?.chatType) : void 0;
	if (resolveHeartbeatDeliveryChatType({
		channel: resolvedTarget.channel,
		to: resolved.to,
		sessionChatType: sessionChatTypeHint
	}) === "direct" && heartbeat?.directPolicy === "block") return buildNoHeartbeatDeliveryTarget({
		reason: "dm-blocked",
		accountId: effectiveAccountId,
		lastChannel: resolvedTarget.lastChannel,
		lastAccountId: resolvedTarget.lastAccountId
	});
	let reason;
	if (resolveOutboundChannelPlugin({
		channel: resolvedTarget.channel,
		cfg
	})?.config.resolveAllowFrom) {
		const explicit = resolveOutboundTarget({
			channel: resolvedTarget.channel,
			to: resolvedTarget.to,
			cfg,
			accountId: effectiveAccountId,
			mode: "explicit"
		});
		if (explicit.ok && explicit.to !== resolved.to) reason = "allowFrom-fallback";
	}
	return {
		channel: resolvedTarget.channel,
		to: resolved.to,
		reason,
		accountId: effectiveAccountId,
		threadId: resolvedTarget.threadId,
		lastChannel: resolvedTarget.lastChannel,
		lastAccountId: resolvedTarget.lastAccountId
	};
}
function buildNoHeartbeatDeliveryTarget(params) {
	return {
		channel: "none",
		reason: params.reason,
		accountId: params.accountId,
		lastChannel: params.lastChannel,
		lastAccountId: params.lastAccountId
	};
}
function inferChatTypeFromTarget(params) {
	const to = params.to.trim();
	if (!to) return;
	if (/^user:/i.test(to)) return "direct";
	if (/^(channel:|thread:)/i.test(to)) return "channel";
	if (/^group:/i.test(to)) return "group";
	return resolveOutboundChannelPlugin({ channel: params.channel })?.messaging?.inferTargetChatType?.({ to }) ?? void 0;
}
function resolveHeartbeatDeliveryChatType(params) {
	if (params.sessionChatType) return params.sessionChatType;
	return inferChatTypeFromTarget({
		channel: params.channel,
		to: params.to
	});
}
function resolveHeartbeatSenderId(params) {
	const { allowFrom, deliveryTo, lastTo, provider } = params;
	const candidates = [
		deliveryTo?.trim(),
		provider && deliveryTo ? `${provider}:${deliveryTo}` : void 0,
		lastTo?.trim(),
		provider && lastTo ? `${provider}:${lastTo}` : void 0
	].filter((val) => Boolean(val?.trim()));
	const allowList = mapAllowFromEntries(allowFrom).filter((entry) => entry && entry !== "*");
	if (allowFrom.includes("*")) return candidates[0] ?? "heartbeat";
	if (candidates.length > 0 && allowList.length > 0) {
		const matched = candidates.find((candidate) => allowList.includes(candidate));
		if (matched) return matched;
	}
	if (candidates.length > 0 && allowList.length === 0) return candidates[0];
	if (allowList.length > 0) return allowList[0];
	return candidates[0] ?? "heartbeat";
}
function resolveHeartbeatSenderContext(params) {
	const provider = params.delivery.channel !== "none" ? params.delivery.channel : params.delivery.lastChannel;
	const accountId = params.delivery.accountId ?? (provider === params.delivery.lastChannel ? params.delivery.lastAccountId : void 0);
	const allowFrom = mapAllowFromEntries(provider ? resolveOutboundChannelPlugin({
		channel: provider,
		cfg: params.cfg
	})?.config.resolveAllowFrom?.({
		cfg: params.cfg,
		accountId
	}) ?? [] : []);
	return {
		sender: resolveHeartbeatSenderId({
			allowFrom,
			deliveryTo: params.delivery.to,
			lastTo: params.entry?.lastTo,
			provider
		}),
		provider,
		allowFrom
	};
}
//#endregion
export { resolveSessionDeliveryTarget as i, resolveHeartbeatSenderContext as n, resolveOutboundTarget as r, resolveHeartbeatDeliveryTarget as t };
