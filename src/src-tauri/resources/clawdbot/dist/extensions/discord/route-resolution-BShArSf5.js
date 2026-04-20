import { o as resolveDiscordAccount } from "./accounts-zcI4mtzH.js";
import { L as chunkDiscordTextWithMode, M as createDiscordRetryRunner, g as sendDiscordText } from "./send.shared-DIBQaUs5.js";
import { d as sendWebhookMessageDiscord, s as sendMessageDiscord, u as sendVoiceMessageDiscord } from "./send-DrbFKdd7.js";
import { i as resolveTimestampMs, n as formatDiscordUserTag } from "./format-XDPCvGK4.js";
import { a as resolveDiscordAllowListMatch, r as normalizeDiscordAllowList } from "./allow-list-MMNtJoJ7.js";
import { t as isLikelyDiscordVideoMedia } from "./media-detection-Cmvt7HIM.js";
import { convertMarkdownTables, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { deriveLastRoutePolicy, resolveAgentIdFromSessionKey, resolveAgentRoute } from "openclaw/plugin-sdk/routing";
import { resolveSendableOutboundReplyParts, resolveTextChunksWithFallback, sendMediaWithLeadingCaption } from "openclaw/plugin-sdk/reply-payload";
import { resolveRetryConfig, retryAsync } from "openclaw/plugin-sdk/retry-runtime";
import { createChannelPairingChallengeIssuer } from "openclaw/plugin-sdk/channel-pairing";
import { upsertChannelPairingRequest } from "openclaw/plugin-sdk/conversation-runtime";
import { resolveAgentAvatar } from "openclaw/plugin-sdk/agent-runtime";
import { readStoreAllowFromForDmPolicy, resolveDmGroupAccessWithLists } from "openclaw/plugin-sdk/security-runtime";
import { isSingleUseReplyToMode } from "openclaw/plugin-sdk/reply-reference";
import { resolveCommandAuthorizedFromAuthorizers } from "openclaw/plugin-sdk/command-auth-native";
//#region extensions/discord/src/monitor/sender-identity.ts
function resolveDiscordWebhookId(message) {
	const candidate = message.webhookId ?? message.webhook_id;
	return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}
function resolveDiscordSenderIdentity(params) {
	const pkInfo = params.pluralkitInfo ?? null;
	const pkMember = pkInfo?.member ?? void 0;
	const pkSystem = pkInfo?.system ?? void 0;
	const memberId = pkMember?.id?.trim();
	const memberName = (pkMember?.display_name ?? pkMember?.name ?? "")?.trim();
	if (memberId && memberName) {
		const systemName = pkSystem?.name?.trim();
		const label = systemName ? `${memberName} (PK:${systemName})` : `${memberName} (PK)`;
		return {
			id: memberId,
			name: memberName,
			tag: normalizeOptionalString(pkMember?.name),
			label,
			isPluralKit: true,
			pluralkit: {
				memberId,
				memberName,
				systemId: normalizeOptionalString(pkSystem?.id),
				systemName
			}
		};
	}
	const senderTag = formatDiscordUserTag(params.author);
	const senderDisplay = params.member?.nickname ?? params.member?.nick ?? params.author.globalName ?? params.author.username;
	const senderLabel = senderDisplay && senderTag && senderDisplay !== senderTag ? `${senderDisplay} (${senderTag})` : senderDisplay ?? senderTag ?? params.author.id;
	return {
		id: params.author.id,
		name: params.author.username ?? void 0,
		tag: senderTag,
		label: senderLabel,
		isPluralKit: false
	};
}
//#endregion
//#region extensions/discord/src/monitor/reply-context.ts
function resolveReplyContext(message, resolveDiscordMessageText) {
	const referenced = message.referencedMessage;
	if (!referenced?.author) return null;
	const referencedText = resolveDiscordMessageText(referenced, { includeForwarded: true });
	if (!referencedText) return null;
	const sender = resolveDiscordSenderIdentity({
		author: referenced.author,
		pluralkitInfo: null
	});
	return {
		id: referenced.id,
		channelId: referenced.channelId,
		sender: sender.tag ?? sender.label ?? "unknown",
		senderId: referenced.author.id,
		senderName: referenced.author.username ?? void 0,
		senderTag: sender.tag ?? void 0,
		memberRoleIds: (() => {
			const roles = referenced.member?.roles;
			return Array.isArray(roles) ? roles.map((roleId) => roleId) : void 0;
		})(),
		body: referencedText,
		timestamp: resolveTimestampMs(referenced.timestamp)
	};
}
function buildDirectLabel(author, tagOverride) {
	return `${(tagOverride?.trim() || resolveDiscordSenderIdentity({
		author,
		pluralkitInfo: null
	}).tag) ?? "unknown"} user id:${author.id}`;
}
function buildGuildLabel(params) {
	const { guild, channelName, channelId } = params;
	return `${guild?.name ?? "Guild"} #${channelName} channel id:${channelId}`;
}
//#endregion
//#region extensions/discord/src/monitor/reply-delivery.ts
const DISCORD_DELIVERY_RETRY_DEFAULTS = {
	attempts: 3,
	minDelayMs: 1e3,
	maxDelayMs: 3e4,
	jitter: 0
};
function isRetryableDiscordError(err) {
	const status = err.status ?? err.statusCode;
	return status === 429 || status !== void 0 && status >= 500;
}
function getDiscordRetryAfterMs(err) {
	if (!err || typeof err !== "object") return;
	if ("retryAfter" in err && typeof err.retryAfter === "number" && Number.isFinite(err.retryAfter)) return err.retryAfter * 1e3;
	const retryAfterRaw = err.headers?.["retry-after"];
	if (!retryAfterRaw) return;
	const retryAfterMs = Number(retryAfterRaw) * 1e3;
	return Number.isFinite(retryAfterMs) ? retryAfterMs : void 0;
}
function resolveDeliveryRetryConfig(retry) {
	return resolveRetryConfig(DISCORD_DELIVERY_RETRY_DEFAULTS, retry);
}
async function sendWithRetry(fn, retryConfig) {
	await retryAsync(fn, {
		...retryConfig,
		shouldRetry: (err) => isRetryableDiscordError(err),
		retryAfterMs: getDiscordRetryAfterMs
	});
}
async function sendDiscordMediaOnly(params) {
	await sendWithRetry(() => sendMessageDiscord(params.target, "", {
		cfg: params.cfg,
		token: params.token,
		rest: params.rest,
		mediaUrl: params.mediaUrl,
		accountId: params.accountId,
		mediaLocalRoots: params.mediaLocalRoots,
		replyTo: params.replyTo
	}), params.retryConfig);
}
async function sendDiscordMediaBatch(params) {
	await sendMediaWithLeadingCaption({
		mediaUrls: params.mediaUrls,
		caption: "",
		send: async ({ mediaUrl }) => {
			await sendDiscordMediaOnly({
				target: params.target,
				cfg: params.cfg,
				token: params.token,
				rest: params.rest,
				mediaUrl,
				accountId: params.accountId,
				mediaLocalRoots: params.mediaLocalRoots,
				replyTo: params.replyTo(),
				retryConfig: params.retryConfig
			});
		}
	});
}
async function sendDiscordPayloadText(params) {
	const mode = params.chunkMode ?? "length";
	const chunkLimit = Math.min(params.textLimit ?? 2e3, 2e3);
	const chunks = resolveTextChunksWithFallback(params.text, chunkDiscordTextWithMode(params.text, {
		maxChars: chunkLimit,
		maxLines: params.maxLinesPerMessage,
		chunkMode: mode
	}));
	for (const chunk of chunks) {
		if (!chunk.trim()) continue;
		await sendDiscordChunkWithFallback({
			cfg: params.cfg,
			target: params.target,
			text: chunk,
			token: params.token,
			rest: params.rest,
			accountId: params.accountId,
			maxLinesPerMessage: params.maxLinesPerMessage,
			replyTo: params.resolveReplyTo(),
			binding: params.binding,
			chunkMode: params.chunkMode,
			username: params.username,
			avatarUrl: params.avatarUrl,
			channelId: params.channelId,
			request: params.request,
			retryConfig: params.retryConfig
		});
	}
}
function resolveTargetChannelId(target) {
	if (!target.startsWith("channel:")) return;
	return target.slice(8).trim() || void 0;
}
function resolveBoundThreadBinding(params) {
	const sessionKey = params.sessionKey?.trim();
	if (!params.threadBindings || !sessionKey) return;
	const bindings = params.threadBindings.listBySessionKey(sessionKey);
	if (bindings.length === 0) return;
	const targetChannelId = resolveTargetChannelId(params.target);
	if (!targetChannelId) return;
	return bindings.find((entry) => entry.threadId === targetChannelId);
}
function createPayloadReplyToResolver(params) {
	const payloadReplyTo = normalizeOptionalString(params.payload.replyToId);
	const allowExplicitReplyWhenOff = Boolean(payloadReplyTo && (params.payload.replyToTag || params.payload.replyToCurrent));
	if (!payloadReplyTo || params.replyToMode === "off" && !allowExplicitReplyWhenOff) return params.resolveFallbackReplyTo;
	let payloadReplyUsed = false;
	return () => {
		if (params.replyToMode === "all") return payloadReplyTo;
		if (payloadReplyUsed) return;
		payloadReplyUsed = true;
		return payloadReplyTo;
	};
}
function resolveBindingPersona(cfg, binding) {
	if (!binding) return {};
	const username = (`🤖 ${binding.label?.trim() || binding.agentId}`.trim() || "🤖 agent").slice(0, 80);
	let avatarUrl;
	try {
		const avatar = resolveAgentAvatar(cfg, binding.agentId);
		if (avatar.kind === "remote") avatarUrl = avatar.url;
	} catch {
		avatarUrl = void 0;
	}
	return {
		username,
		avatarUrl
	};
}
async function sendDiscordChunkWithFallback(params) {
	if (!params.text.trim()) return;
	const text = params.text;
	const binding = params.binding;
	if (binding?.webhookId && binding?.webhookToken) try {
		await sendWebhookMessageDiscord(text, {
			cfg: params.cfg,
			webhookId: binding.webhookId,
			webhookToken: binding.webhookToken,
			accountId: binding.accountId,
			threadId: binding.threadId,
			replyTo: params.replyTo,
			username: params.username,
			avatarUrl: params.avatarUrl
		});
		return;
	} catch {}
	if (params.channelId && params.request && params.rest) {
		const { channelId, request, rest } = params;
		await sendWithRetry(() => sendDiscordText(rest, channelId, text, params.replyTo, request, params.maxLinesPerMessage, void 0, void 0, params.chunkMode), params.retryConfig);
		return;
	}
	await sendWithRetry(() => sendMessageDiscord(params.target, text, {
		cfg: params.cfg,
		token: params.token,
		rest: params.rest,
		accountId: params.accountId,
		replyTo: params.replyTo
	}), params.retryConfig);
}
async function deliverDiscordReply(params) {
	const replyTo = normalizeOptionalString(params.replyToId);
	const replyToMode = params.replyToMode ?? "all";
	const replyOnce = isSingleUseReplyToMode(replyToMode);
	let replyUsed = false;
	const resolveReplyTo = () => {
		if (!replyTo) return;
		if (!replyOnce) return replyTo;
		if (replyUsed) return;
		replyUsed = true;
		return replyTo;
	};
	const binding = resolveBoundThreadBinding({
		threadBindings: params.threadBindings,
		sessionKey: params.sessionKey,
		target: params.target
	});
	const persona = resolveBindingPersona(params.cfg, binding);
	const channelId = resolveTargetChannelId(params.target);
	const account = resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const retryConfig = resolveDeliveryRetryConfig(account.config.retry);
	const request = channelId ? createDiscordRetryRunner({ configRetry: account.config.retry }) : void 0;
	let deliveredAny = false;
	for (const payload of params.replies) {
		const resolvePayloadReplyTo = createPayloadReplyToResolver({
			payload,
			replyToMode,
			resolveFallbackReplyTo: resolveReplyTo
		});
		const tableMode = params.tableMode ?? "code";
		const reply = resolveSendableOutboundReplyParts(payload, { text: convertMarkdownTables(payload.text ?? "", tableMode) });
		if (!reply.hasContent) continue;
		const sendReplyText = async () => sendDiscordPayloadText({
			cfg: params.cfg,
			target: params.target,
			text: reply.text,
			token: params.token,
			rest: params.rest,
			accountId: params.accountId,
			textLimit: params.textLimit,
			maxLinesPerMessage: params.maxLinesPerMessage,
			resolveReplyTo: resolvePayloadReplyTo,
			binding,
			chunkMode: params.chunkMode,
			username: persona.username,
			avatarUrl: persona.avatarUrl,
			channelId,
			request,
			retryConfig
		});
		const sendReplyMediaBatch = async (mediaUrls) => sendDiscordMediaBatch({
			target: params.target,
			cfg: params.cfg,
			token: params.token,
			rest: params.rest,
			mediaUrls,
			accountId: params.accountId,
			mediaLocalRoots: params.mediaLocalRoots,
			replyTo: resolvePayloadReplyTo,
			retryConfig
		});
		if (!reply.hasMedia) {
			await sendReplyText();
			if (reply.text.trim()) deliveredAny = true;
			continue;
		}
		const firstMedia = reply.mediaUrls[0];
		if (!firstMedia) continue;
		if (payload.audioAsVoice) {
			const replyTo = resolvePayloadReplyTo();
			await sendVoiceMessageDiscord(params.target, firstMedia, {
				cfg: params.cfg,
				token: params.token,
				rest: params.rest,
				accountId: params.accountId,
				replyTo
			});
			deliveredAny = true;
			await sendReplyText();
			await sendReplyMediaBatch(reply.mediaUrls.slice(1));
			continue;
		}
		if (reply.text.trim().length > 0 && reply.mediaUrls.some((mediaUrl) => isLikelyDiscordVideoMedia(mediaUrl))) {
			await sendReplyText();
			await sendReplyMediaBatch(reply.mediaUrls);
			deliveredAny = true;
			continue;
		}
		await sendMediaWithLeadingCaption({
			mediaUrls: reply.mediaUrls,
			caption: reply.text,
			send: async ({ mediaUrl, caption }) => {
				const replyTo = resolvePayloadReplyTo();
				await sendWithRetry(() => sendMessageDiscord(params.target, caption ?? "", {
					cfg: params.cfg,
					token: params.token,
					rest: params.rest,
					mediaUrl,
					accountId: params.accountId,
					mediaLocalRoots: params.mediaLocalRoots,
					replyTo
				}), retryConfig);
			}
		});
		deliveredAny = true;
	}
	if (binding && deliveredAny) params.threadBindings?.touchThread?.({ threadId: binding.threadId });
}
//#endregion
//#region extensions/discord/src/monitor/dm-command-auth.ts
const DISCORD_ALLOW_LIST_PREFIXES = [
	"discord:",
	"user:",
	"pk:"
];
function resolveSenderAllowMatch(params) {
	const allowList = normalizeDiscordAllowList(params.allowEntries, DISCORD_ALLOW_LIST_PREFIXES);
	return allowList ? resolveDiscordAllowListMatch({
		allowList,
		candidate: params.sender,
		allowNameMatching: params.allowNameMatching
	}) : { allowed: false };
}
function resolveDmPolicyCommandAuthorization(params) {
	if (params.dmPolicy === "open" && params.decision === "allow") return true;
	return params.commandAuthorized;
}
async function resolveDiscordDmCommandAccess(params) {
	const storeAllowFrom = params.readStoreAllowFrom ? await params.readStoreAllowFrom().catch(() => []) : await readStoreAllowFromForDmPolicy({
		provider: "discord",
		accountId: params.accountId,
		dmPolicy: params.dmPolicy
	});
	const access = resolveDmGroupAccessWithLists({
		isGroup: false,
		dmPolicy: params.dmPolicy,
		allowFrom: params.configuredAllowFrom,
		groupAllowFrom: [],
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => resolveSenderAllowMatch({
			allowEntries,
			sender: params.sender,
			allowNameMatching: params.allowNameMatching
		}).allowed
	});
	const allowMatch = resolveSenderAllowMatch({
		allowEntries: access.effectiveAllowFrom,
		sender: params.sender,
		allowNameMatching: params.allowNameMatching
	});
	const commandAuthorized = resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups: params.useAccessGroups,
		authorizers: [{
			configured: access.effectiveAllowFrom.length > 0,
			allowed: allowMatch.allowed
		}],
		modeWhenAccessGroupsOff: "configured"
	});
	return {
		decision: access.decision,
		reason: access.reason,
		commandAuthorized: resolveDmPolicyCommandAuthorization({
			dmPolicy: params.dmPolicy,
			decision: access.decision,
			commandAuthorized
		}),
		allowMatch
	};
}
//#endregion
//#region extensions/discord/src/monitor/dm-command-decision.ts
async function handleDiscordDmCommandDecision(params) {
	if (params.dmAccess.decision === "allow") return true;
	if (params.dmAccess.decision === "pairing") {
		const upsertPairingRequest = params.upsertPairingRequest ?? upsertChannelPairingRequest;
		const result = await createChannelPairingChallengeIssuer({
			channel: "discord",
			upsertPairingRequest: async ({ id, meta }) => await upsertPairingRequest({
				channel: "discord",
				id,
				accountId: params.accountId,
				meta
			})
		})({
			senderId: params.sender.id,
			senderIdLine: `Your Discord user id: ${params.sender.id}`,
			meta: {
				tag: params.sender.tag,
				name: params.sender.name
			},
			sendPairingReply: async () => {}
		});
		if (result.created && result.code) await params.onPairingCreated(result.code);
		return false;
	}
	await params.onUnauthorized();
	return false;
}
//#endregion
//#region extensions/discord/src/monitor/route-resolution.ts
function buildDiscordRoutePeer(params) {
	return {
		kind: params.isDirectMessage ? "direct" : params.isGroupDm ? "group" : "channel",
		id: params.isDirectMessage ? params.directUserId?.trim() || params.conversationId : params.conversationId
	};
}
function resolveDiscordConversationRoute(params) {
	return resolveAgentRoute({
		cfg: params.cfg,
		channel: "discord",
		accountId: params.accountId,
		guildId: params.guildId ?? void 0,
		memberRoleIds: params.memberRoleIds,
		peer: params.peer,
		parentPeer: params.parentConversationId ? {
			kind: "channel",
			id: params.parentConversationId
		} : void 0
	});
}
function resolveDiscordBoundConversationRoute(params) {
	return resolveDiscordEffectiveRoute({
		route: resolveDiscordConversationRoute({
			cfg: params.cfg,
			accountId: params.accountId,
			guildId: params.guildId,
			memberRoleIds: params.memberRoleIds,
			peer: buildDiscordRoutePeer({
				isDirectMessage: params.isDirectMessage,
				isGroupDm: params.isGroupDm,
				directUserId: params.directUserId,
				conversationId: params.conversationId
			}),
			parentConversationId: params.parentConversationId
		}),
		boundSessionKey: params.boundSessionKey,
		configuredRoute: params.configuredRoute,
		matchedBy: params.matchedBy
	});
}
function resolveDiscordEffectiveRoute(params) {
	const boundSessionKey = params.boundSessionKey?.trim();
	if (!boundSessionKey) return params.configuredRoute?.route ?? params.route;
	return {
		...params.route,
		sessionKey: boundSessionKey,
		agentId: resolveAgentIdFromSessionKey(boundSessionKey),
		lastRoutePolicy: deriveLastRoutePolicy({
			sessionKey: boundSessionKey,
			mainSessionKey: params.route.mainSessionKey
		}),
		...params.matchedBy ? { matchedBy: params.matchedBy } : {}
	};
}
//#endregion
export { handleDiscordDmCommandDecision as a, buildDirectLabel as c, resolveDiscordSenderIdentity as d, resolveDiscordWebhookId as f, resolveDiscordEffectiveRoute as i, buildGuildLabel as l, resolveDiscordBoundConversationRoute as n, resolveDiscordDmCommandAccess as o, resolveDiscordConversationRoute as r, deliverDiscordReply as s, buildDiscordRoutePeer as t, resolveReplyContext as u };
