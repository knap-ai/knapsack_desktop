import { r as sendDiscordComponentMessage } from "./send.components-74kaqy38.js";
import { c as sendPollDiscord, d as sendWebhookMessageDiscord, s as sendMessageDiscord } from "./send-DrbFKdd7.js";
import { u as buildDiscordInteractiveComponents } from "./components-D-Smrfec.js";
import { r as normalizeDiscordOutboundTarget } from "./normalize-BMKcRSTT.js";
import "./thread-bindings-BIJS3lxs.js";
import { i as getThreadBindingManager } from "./thread-bindings.manager-BfxhjvHf.js";
import { normalizeOptionalString, normalizeOptionalStringifiedId } from "openclaw/plugin-sdk/text-runtime";
import { resolvePayloadMediaUrls, sendPayloadMediaSequenceOrFallback, sendTextMediaPayload } from "openclaw/plugin-sdk/reply-payload";
import { resolveOutboundSendDep } from "openclaw/plugin-sdk/outbound-runtime";
import { attachChannelToResult, createAttachedChannelResultAdapter } from "openclaw/plugin-sdk/channel-send-result";
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
	const threadId = normalizeOptionalStringifiedId(params.threadId) ?? "";
	if (!threadId) return params.to;
	return `channel:${threadId}`;
}
function resolveDiscordWebhookIdentity(params) {
	const usernameRaw = normalizeOptionalString(params.identity?.name);
	const fallbackUsername = normalizeOptionalString(params.binding.label) ?? params.binding.agentId;
	return {
		username: (usernameRaw || fallbackUsername || "").slice(0, 80) || void 0,
		avatarUrl: normalizeOptionalString(params.identity?.avatarUrl)
	};
}
async function maybeSendDiscordWebhookText(params) {
	if (params.threadId == null) return null;
	const threadId = normalizeOptionalStringifiedId(params.threadId) ?? "";
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
