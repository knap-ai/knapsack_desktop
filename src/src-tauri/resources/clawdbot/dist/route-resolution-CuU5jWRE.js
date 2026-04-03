import { u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { h as sendMediaWithLeadingCaption, m as resolveTextChunksWithFallback, p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { i as resolveAgentRoute, n as deriveLastRoutePolicy } from "./resolve-route-DID7K3Jm.js";
import { n as retryAsync, t as resolveRetryConfig } from "./retry-BhtTDmeJ.js";
import "./routing-Br1fEo8A.js";
import { t as resolveCommandAuthorizedFromAuthorizers } from "./command-gating-Ch_OhMao.js";
import { t as convertMarkdownTables } from "./tables-Dmh1EQ3k.js";
import { d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists } from "./dm-policy-shared-ikRqobo8.js";
import { t as resolveAgentAvatar } from "./identity-avatar-DeLX78Th.js";
import "./conversation-runtime-DIsQmaYR.js";
import "./text-runtime-B0ZpmkER.js";
import "./agent-runtime-B7ucOTD-.js";
import "./security-runtime-DCa00BFS.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-Nk7oRFrM.js";
import "./command-auth-native-m2se5Aky.js";
import "./retry-runtime-Bbb3_EMn.js";
import { o as resolveDiscordAccount } from "./accounts-7Ym6HIvs.js";
import { i as resolveTimestampMs, n as formatDiscordUserTag } from "./format-CviHuUx2.js";
import { a as resolveDiscordAllowListMatch, r as normalizeDiscordAllowList } from "./allow-list-qE0AJ4XV.js";
import { F as chunkDiscordTextWithMode, P as createDiscordRetryRunner, S as sendDiscordText } from "./send.components-sVt5Smd7.js";
import { l as sendVoiceMessageDiscord, o as sendMessageDiscord, u as sendWebhookMessageDiscord } from "./send-BP9-Jzzy.js";
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
			tag: pkMember?.name?.trim() || void 0,
			label,
			isPluralKit: true,
			pluralkit: {
				memberId,
				memberName,
				systemId: pkSystem?.id?.trim() || void 0,
				systemName
			}
		};
	}
	const senderTag = formatDiscordUserTag(params.author);
	const senderDisplay = params.member?.nickname ?? params.author.globalName ?? params.author.username;
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
	const chunkLimit = Math.min(params.textLimit, 2e3);
	const replyTo = params.replyToId?.trim() || void 0;
	const replyOnce = (params.replyToMode ?? "all") === "first";
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
		const tableMode = params.tableMode ?? "code";
		const reply = resolveSendableOutboundReplyParts(payload, { text: convertMarkdownTables(payload.text ?? "", tableMode) });
		if (!reply.hasContent) continue;
		if (!reply.hasMedia) {
			const mode = params.chunkMode ?? "length";
			const chunks = resolveTextChunksWithFallback(reply.text, chunkDiscordTextWithMode(reply.text, {
				maxChars: chunkLimit,
				maxLines: params.maxLinesPerMessage,
				chunkMode: mode
			}));
			for (const chunk of chunks) {
				if (!chunk.trim()) continue;
				const replyTo = resolveReplyTo();
				await sendDiscordChunkWithFallback({
					cfg: params.cfg,
					target: params.target,
					text: chunk,
					token: params.token,
					rest: params.rest,
					accountId: params.accountId,
					maxLinesPerMessage: params.maxLinesPerMessage,
					replyTo,
					binding,
					chunkMode: params.chunkMode,
					username: persona.username,
					avatarUrl: persona.avatarUrl,
					channelId,
					request,
					retryConfig
				});
				deliveredAny = true;
			}
			continue;
		}
		const firstMedia = reply.mediaUrls[0];
		if (!firstMedia) continue;
		if (payload.audioAsVoice) {
			const replyTo = resolveReplyTo();
			await sendVoiceMessageDiscord(params.target, firstMedia, {
				cfg: params.cfg,
				token: params.token,
				rest: params.rest,
				accountId: params.accountId,
				replyTo
			});
			deliveredAny = true;
			await sendDiscordChunkWithFallback({
				cfg: params.cfg,
				target: params.target,
				text: reply.text,
				token: params.token,
				rest: params.rest,
				accountId: params.accountId,
				maxLinesPerMessage: params.maxLinesPerMessage,
				replyTo: resolveReplyTo(),
				binding,
				chunkMode: params.chunkMode,
				username: persona.username,
				avatarUrl: persona.avatarUrl,
				channelId,
				request,
				retryConfig
			});
			await sendMediaWithLeadingCaption({
				mediaUrls: reply.mediaUrls.slice(1),
				caption: "",
				send: async ({ mediaUrl }) => {
					const replyTo = resolveReplyTo();
					await sendWithRetry(() => sendMessageDiscord(params.target, "", {
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
			continue;
		}
		await sendMediaWithLeadingCaption({
			mediaUrls: reply.mediaUrls,
			caption: reply.text,
			send: async ({ mediaUrl, caption }) => {
				const replyTo = resolveReplyTo();
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
