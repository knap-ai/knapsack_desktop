import { b as sendTextMediaPayload, f as resolvePayloadMediaUrls, v as sendPayloadMediaSequenceOrFallback } from "./reply-payload-SzVz53hc.js";
import { t as resolveOutboundSendDep } from "./send-deps-DLS-OK3u.js";
import "./outbound-runtime-D_hcnwUl.js";
import { i as createAttachedChannelResultAdapter, t as attachChannelToResult } from "./channel-send-result-COXGPSxL.js";
import { r as sendDiscordComponentMessage } from "./send.components-sVt5Smd7.js";
import { o as sendMessageDiscord, s as sendPollDiscord, u as sendWebhookMessageDiscord } from "./send-BP9-Jzzy.js";
import { l as buildDiscordInteractiveComponents } from "./components-CYCrolfj.js";
import { r as normalizeDiscordOutboundTarget } from "./normalize-BCpUtWtt.js";
import { d as getThreadBindingManager } from "./thread-bindings-DGck9pdd.js";
//#region extensions/discord/src/outbound-adapter.ts
const DISCORD_TEXT_CHUNK_LIMIT = 2e3;
function hasApprovalChannelData(payload) {
	const channelData = payload.channelData;
	if (!channelData || typeof channelData !== "object" || Array.isArray(channelData)) return false;
	return Boolean(channelData.execApproval);
}
function neutralizeDiscordApprovalMentions(value) {
	return value.replace(/@everyone/gi, "@​everyone").replace(/@here/gi, "@​here").replace(/<@/g, "<@​").replace(/<#/g, "<#​");
}
function normalizeDiscordApprovalPayload(payload) {
	return hasApprovalChannelData(payload) && payload.text ? {
		...payload,
		text: neutralizeDiscordApprovalMentions(payload.text)
	} : payload;
}
function resolveDiscordOutboundTarget(params) {
	if (params.threadId == null) return params.to;
	const threadId = String(params.threadId).trim();
	if (!threadId) return params.to;
	return `channel:${threadId}`;
}
function resolveDiscordWebhookIdentity(params) {
	const usernameRaw = params.identity?.name?.trim();
	const fallbackUsername = params.binding.label?.trim() || params.binding.agentId;
	return {
		username: (usernameRaw || fallbackUsername || "").slice(0, 80) || void 0,
		avatarUrl: params.identity?.avatarUrl?.trim() || void 0
	};
}
async function maybeSendDiscordWebhookText(params) {
	if (params.threadId == null) return null;
	const threadId = String(params.threadId).trim();
	if (!threadId) return null;
	const manager = getThreadBindingManager(params.accountId ?? void 0);
	if (!manager) return null;
	const binding = manager.getByThreadId(threadId);
	if (!binding?.webhookId || !binding?.webhookToken) return null;
	const persona = resolveDiscordWebhookIdentity({
		identity: params.identity,
		binding
	});
	return await sendWebhookMessageDiscord(params.text, {
		webhookId: binding.webhookId,
		webhookToken: binding.webhookToken,
		accountId: binding.accountId,
		threadId: binding.threadId,
		cfg: params.cfg,
		replyTo: params.replyToId ?? void 0,
		username: persona.username,
		avatarUrl: persona.avatarUrl
	});
}
const discordOutbound = {
	deliveryMode: "direct",
	chunker: null,
	textChunkLimit: DISCORD_TEXT_CHUNK_LIMIT,
	pollMaxOptions: 10,
	normalizePayload: ({ payload }) => normalizeDiscordApprovalPayload(payload),
	resolveTarget: ({ to }) => normalizeDiscordOutboundTarget(to),
	sendPayload: async (ctx) => {
		const payload = normalizeDiscordApprovalPayload({
			...ctx.payload,
			text: ctx.payload.text ?? ""
		});
		const rawComponentSpec = (payload.channelData?.discord)?.components ?? buildDiscordInteractiveComponents(payload.interactive);
		const componentSpec = rawComponentSpec ? rawComponentSpec.text ? rawComponentSpec : {
			...rawComponentSpec,
			text: payload.text?.trim() ? payload.text : void 0
		} : void 0;
		if (!componentSpec) return await sendTextMediaPayload({
			channel: "discord",
			ctx: {
				...ctx,
				payload
			},
			adapter: discordOutbound
		});
		const send = resolveOutboundSendDep(ctx.deps, "discord") ?? sendMessageDiscord;
		const target = resolveDiscordOutboundTarget({
			to: ctx.to,
			threadId: ctx.threadId
		});
		const mediaUrls = resolvePayloadMediaUrls(payload);
		return attachChannelToResult("discord", await sendPayloadMediaSequenceOrFallback({
			text: payload.text ?? "",
			mediaUrls,
			fallbackResult: {
				messageId: "",
				channelId: target
			},
			sendNoMedia: async () => await sendDiscordComponentMessage(target, componentSpec, {
				replyTo: ctx.replyToId ?? void 0,
				accountId: ctx.accountId ?? void 0,
				silent: ctx.silent ?? void 0,
				cfg: ctx.cfg
			}),
			send: async ({ text, mediaUrl, isFirst }) => {
				if (isFirst) return await sendDiscordComponentMessage(target, componentSpec, {
					mediaUrl,
					mediaAccess: ctx.mediaAccess,
					mediaLocalRoots: ctx.mediaLocalRoots,
					mediaReadFile: ctx.mediaReadFile,
					replyTo: ctx.replyToId ?? void 0,
					accountId: ctx.accountId ?? void 0,
					silent: ctx.silent ?? void 0,
					cfg: ctx.cfg
				});
				return await send(target, text, {
					verbose: false,
					mediaUrl,
					mediaAccess: ctx.mediaAccess,
					mediaLocalRoots: ctx.mediaLocalRoots,
					mediaReadFile: ctx.mediaReadFile,
					replyTo: ctx.replyToId ?? void 0,
					accountId: ctx.accountId ?? void 0,
					silent: ctx.silent ?? void 0,
					cfg: ctx.cfg
				});
			}
		}));
	},
	...createAttachedChannelResultAdapter({
		channel: "discord",
		sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, identity, silent }) => {
			if (!silent) {
				const webhookResult = await maybeSendDiscordWebhookText({
					cfg,
					text,
					threadId,
					accountId,
					identity,
					replyToId
				}).catch(() => null);
				if (webhookResult) return webhookResult;
			}
			return await (resolveOutboundSendDep(deps, "discord") ?? sendMessageDiscord)(resolveDiscordOutboundTarget({
				to,
				threadId
			}), text, {
				verbose: false,
				replyTo: replyToId ?? void 0,
				accountId: accountId ?? void 0,
				silent: silent ?? void 0,
				cfg
			});
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId, threadId, silent }) => {
			return await (resolveOutboundSendDep(deps, "discord") ?? sendMessageDiscord)(resolveDiscordOutboundTarget({
				to,
				threadId
			}), text, {
				verbose: false,
				mediaUrl,
				mediaLocalRoots,
				mediaReadFile,
				replyTo: replyToId ?? void 0,
				accountId: accountId ?? void 0,
				silent: silent ?? void 0,
				cfg
			});
		},
		sendPoll: async ({ cfg, to, poll, accountId, threadId, silent }) => await sendPollDiscord(resolveDiscordOutboundTarget({
			to,
			threadId
		}), poll, {
			accountId: accountId ?? void 0,
			silent: silent ?? void 0,
			cfg
		})
	})
};
//#endregion
export { discordOutbound as n, DISCORD_TEXT_CHUNK_LIMIT as t };
