import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import "./send-C92oy8jh.js";
import { i as sendVoiceMessageDiscord, t as sendMessageDiscord } from "./send.outbound-BTnNj5k_.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { buildOutboundSessionContext, deliverOutboundPayloads } from "openclaw/plugin-sdk/outbound-runtime";
import { resolveAgentAvatar } from "openclaw/plugin-sdk/agent-runtime";
//#region extensions/discord/src/monitor/reply-delivery.ts
var reply_delivery_exports = /* @__PURE__ */ __exportAll({ deliverDiscordReply: () => deliverDiscordReply });
function resolveTargetChannelId(target) {
	if (!target.startsWith("channel:")) return;
	return target.slice(8).trim() || void 0;
}
function resolveBoundThreadBinding(params) {
	const sessionKey = params.sessionKey?.trim();
	if (!params.threadBindings || !sessionKey) return;
	const targetChannelId = resolveTargetChannelId(params.target);
	if (!targetChannelId) return;
	return params.threadBindings.listBySessionKey(sessionKey).find((entry) => entry.threadId === targetChannelId);
}
function resolveBindingIdentity(cfg, binding) {
	if (!binding) return;
	const identity = { name: (`🤖 ${binding.label?.trim() || binding.agentId}`.trim() || "🤖 agent").slice(0, 80) };
	try {
		const avatar = resolveAgentAvatar(cfg, binding.agentId);
		if (avatar.kind === "remote") identity.avatarUrl = avatar.url;
	} catch {}
	return identity;
}
function createDiscordDeliveryDeps(params) {
	return {
		discord: (to, text, opts) => sendMessageDiscord(to, text, {
			...opts,
			cfg: opts?.cfg ?? params.cfg,
			token: params.token,
			rest: params.rest
		}),
		discordVoice: (to, audioPath, opts) => sendVoiceMessageDiscord(to, audioPath, {
			...opts,
			cfg: opts?.cfg ?? params.cfg,
			token: params.token,
			rest: params.rest
		})
	};
}
function resolveDiscordDeliveryOptions(params) {
	const binding = resolveBoundThreadBinding({
		threadBindings: params.threadBindings,
		sessionKey: params.sessionKey,
		target: params.target
	});
	return {
		to: binding ? `channel:${binding.channelId}` : params.target,
		threadId: binding?.threadId,
		agentId: binding?.agentId,
		identity: resolveBindingIdentity(params.cfg, binding),
		mediaAccess: params.mediaLocalRoots?.length ? { localRoots: params.mediaLocalRoots } : void 0,
		replyToMode: params.replyToMode ?? "all",
		formatting: {
			textLimit: params.textLimit,
			maxLinesPerMessage: params.maxLinesPerMessage,
			tableMode: params.tableMode,
			chunkMode: params.chunkMode
		}
	};
}
async function deliverDiscordReply(params) {
	params.runtime;
	const delivery = resolveDiscordDeliveryOptions(params);
	await deliverOutboundPayloads({
		cfg: params.cfg,
		channel: "discord",
		to: delivery.to,
		accountId: params.accountId,
		payloads: params.replies,
		replyToId: normalizeOptionalString(params.replyToId),
		replyToMode: delivery.replyToMode,
		formatting: delivery.formatting,
		threadId: delivery.threadId,
		identity: delivery.identity,
		deps: createDiscordDeliveryDeps({
			cfg: params.cfg,
			token: params.token,
			rest: params.rest
		}),
		mediaAccess: delivery.mediaAccess,
		session: buildOutboundSessionContext({
			cfg: params.cfg,
			sessionKey: params.sessionKey,
			agentId: delivery.agentId,
			requesterAccountId: params.accountId
		})
	});
}
//#endregion
export { reply_delivery_exports as n, deliverDiscordReply as t };
