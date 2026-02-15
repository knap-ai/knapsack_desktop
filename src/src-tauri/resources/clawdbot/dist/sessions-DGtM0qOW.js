import { ft as requireActivePluginRegistry, nt as CHAT_CHANNEL_ORDER, o as createSubsystemLogger, ot as getChatChannelMeta } from "./entry.js";
import { c as normalizeAccountId$1, i as buildAgentMainSessionKey, l as normalizeAgentId, n as DEFAULT_AGENT_ID, u as normalizeMainKey } from "./session-key-DVvxnFKg.js";
import { c as escapeRegExp, m as normalizeE164 } from "./utils-q1rHOG-N.js";
import { _ as parseDurationMs, f as parseByteSize, i as loadConfig } from "./config-BJWIHf6x.js";
import { _ as normalizeChatType, a as normalizeWhatsAppTarget, c as resolveTelegramAccount, m as resolveSlackReplyToMode, p as resolveSlackAccount, r as normalizeChannelId, y as resolveDiscordAccount } from "./plugins-DsHRVW6o.js";
import { n as resolveWhatsAppAccount } from "./accounts-CXiTuiOz.js";
import { c as listDeliverableMessageChannels, l as normalizeMessageChannel } from "./message-channel-D-iPIX3C.js";
import { t as resolveIMessageAccount } from "./accounts-DEEdVs21.js";
import { n as resolveSignalAccount } from "./accounts-Ur53Qha2.js";
import { c as resolveStorePath, n as resolveSessionFilePath, t as resolveDefaultSessionStorePath } from "./paths-D9QhlJYC.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-o1zuZ-m3.js";
import path from "node:path";
import fs from "node:fs";
import fs$1 from "node:fs/promises";
import crypto from "node:crypto";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";

//#region src/channels/conversation-label.ts
function extractConversationId(from) {
	const trimmed = from?.trim();
	if (!trimmed) return;
	const parts = trimmed.split(":").filter(Boolean);
	return parts.length > 0 ? parts[parts.length - 1] : trimmed;
}
function shouldAppendId(id) {
	if (/^[0-9]+$/.test(id)) return true;
	if (id.includes("@g.us")) return true;
	return false;
}
function resolveConversationLabel(ctx) {
	const explicit = ctx.ConversationLabel?.trim();
	if (explicit) return explicit;
	const threadLabel = ctx.ThreadLabel?.trim();
	if (threadLabel) return threadLabel;
	if (normalizeChatType(ctx.ChatType) === "direct") return ctx.SenderName?.trim() || ctx.From?.trim() || void 0;
	const base = ctx.GroupChannel?.trim() || ctx.GroupSubject?.trim() || ctx.GroupSpace?.trim() || ctx.From?.trim() || "";
	if (!base) return;
	const id = extractConversationId(ctx.From);
	if (!id) return base;
	if (!shouldAppendId(id)) return base;
	if (base === id) return base;
	if (base.includes(id)) return base;
	if (base.toLowerCase().includes(" id:")) return base;
	if (base.startsWith("#") || base.startsWith("@")) return base;
	return `${base} id:${id}`;
}

//#endregion
//#region src/config/sessions/group.ts
const getGroupSurfaces = () => new Set([...listDeliverableMessageChannels(), "webchat"]);
function normalizeGroupLabel(raw) {
	const trimmed = raw?.trim().toLowerCase() ?? "";
	if (!trimmed) return "";
	return trimmed.replace(/\s+/g, "-").replace(/[^a-z0-9#@._+-]+/g, "-").replace(/-{2,}/g, "-").replace(/^[-.]+|[-.]+$/g, "");
}
function shortenGroupId(value) {
	const trimmed = value?.trim() ?? "";
	if (!trimmed) return "";
	if (trimmed.length <= 14) return trimmed;
	return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
}
function buildGroupDisplayName(params) {
	const providerKey = (params.provider?.trim().toLowerCase() || "group").trim();
	const groupChannel = params.groupChannel?.trim();
	const space = params.space?.trim();
	const subject = params.subject?.trim();
	const detail = (groupChannel && space ? `${space}${groupChannel.startsWith("#") ? "" : "#"}${groupChannel}` : groupChannel || subject || space || "") || "";
	const fallbackId = params.id?.trim() || params.key;
	const rawLabel = detail || fallbackId;
	let token = normalizeGroupLabel(rawLabel);
	if (!token) token = normalizeGroupLabel(shortenGroupId(rawLabel));
	if (!params.groupChannel && token.startsWith("#")) token = token.replace(/^#+/, "");
	if (token && !/^[@#]/.test(token) && !token.startsWith("g-") && !token.includes("#")) token = `g-${token}`;
	return token ? `${providerKey}:${token}` : providerKey;
}
function resolveGroupSessionKey(ctx) {
	const from = typeof ctx.From === "string" ? ctx.From.trim() : "";
	const chatType = ctx.ChatType?.trim().toLowerCase();
	const normalizedChatType = chatType === "channel" ? "channel" : chatType === "group" ? "group" : void 0;
	const isWhatsAppGroupId = from.toLowerCase().endsWith("@g.us");
	if (!(normalizedChatType === "group" || normalizedChatType === "channel" || from.includes(":group:") || from.includes(":channel:") || isWhatsAppGroupId)) return null;
	const providerHint = ctx.Provider?.trim().toLowerCase();
	const parts = from.split(":").filter(Boolean);
	const head = parts[0]?.trim().toLowerCase() ?? "";
	const headIsSurface = head ? getGroupSurfaces().has(head) : false;
	const provider = headIsSurface ? head : providerHint ?? (isWhatsAppGroupId ? "whatsapp" : void 0);
	if (!provider) return null;
	const second = parts[1]?.trim().toLowerCase();
	const secondIsKind = second === "group" || second === "channel";
	const kind = secondIsKind ? second : from.includes(":channel:") || normalizedChatType === "channel" ? "channel" : "group";
	const finalId = (headIsSurface ? secondIsKind ? parts.slice(2).join(":") : parts.slice(1).join(":") : from).trim().toLowerCase();
	if (!finalId) return null;
	return {
		key: `${provider}:${kind}:${finalId}`,
		channel: provider,
		id: finalId,
		chatType: kind === "channel" ? "channel" : "group"
	};
}

//#endregion
//#region src/config/group-policy.ts
function resolveChannelGroupConfig(groups, groupId, caseInsensitive = false) {
	if (!groups) return;
	const direct = groups[groupId];
	if (direct) return direct;
	if (!caseInsensitive) return;
	const target = groupId.toLowerCase();
	const matchedKey = Object.keys(groups).find((key) => key !== "*" && key.toLowerCase() === target);
	if (!matchedKey) return;
	return groups[matchedKey];
}
function normalizeSenderKey(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return (trimmed.startsWith("@") ? trimmed.slice(1) : trimmed).toLowerCase();
}
function resolveToolsBySender(params) {
	const toolsBySender = params.toolsBySender;
	if (!toolsBySender) return;
	const entries = Object.entries(toolsBySender);
	if (entries.length === 0) return;
	const normalized = /* @__PURE__ */ new Map();
	let wildcard;
	for (const [rawKey, policy] of entries) {
		if (!policy) continue;
		const key = normalizeSenderKey(rawKey);
		if (!key) continue;
		if (key === "*") {
			wildcard = policy;
			continue;
		}
		if (!normalized.has(key)) normalized.set(key, policy);
	}
	const candidates = [];
	const pushCandidate = (value) => {
		const trimmed = value?.trim();
		if (!trimmed) return;
		candidates.push(trimmed);
	};
	pushCandidate(params.senderId);
	pushCandidate(params.senderE164);
	pushCandidate(params.senderUsername);
	pushCandidate(params.senderName);
	for (const candidate of candidates) {
		const key = normalizeSenderKey(candidate);
		if (!key) continue;
		const match = normalized.get(key);
		if (match) return match;
	}
	return wildcard;
}
function resolveChannelGroups(cfg, channel, accountId) {
	const normalizedAccountId = normalizeAccountId$1(accountId);
	const channelConfig = cfg.channels?.[channel];
	if (!channelConfig) return;
	return channelConfig.accounts?.[normalizedAccountId]?.groups ?? channelConfig.accounts?.[Object.keys(channelConfig.accounts ?? {}).find((key) => key.toLowerCase() === normalizedAccountId.toLowerCase()) ?? ""]?.groups ?? channelConfig.groups;
}
function resolveChannelGroupPolicy(params) {
	const { cfg, channel } = params;
	const groups = resolveChannelGroups(cfg, channel, params.accountId);
	const allowlistEnabled = Boolean(groups && Object.keys(groups).length > 0);
	const normalizedId = params.groupId?.trim();
	const groupConfig = normalizedId ? resolveChannelGroupConfig(groups, normalizedId, params.groupIdCaseInsensitive) : void 0;
	const defaultConfig = groups?.["*"];
	return {
		allowlistEnabled,
		allowed: !allowlistEnabled || allowlistEnabled && Boolean(groups && Object.hasOwn(groups, "*")) || Boolean(groupConfig),
		groupConfig,
		defaultConfig
	};
}
function resolveChannelGroupRequireMention(params) {
	const { requireMentionOverride, overrideOrder = "after-config" } = params;
	const { groupConfig, defaultConfig } = resolveChannelGroupPolicy(params);
	const configMention = typeof groupConfig?.requireMention === "boolean" ? groupConfig.requireMention : typeof defaultConfig?.requireMention === "boolean" ? defaultConfig.requireMention : void 0;
	if (overrideOrder === "before-config" && typeof requireMentionOverride === "boolean") return requireMentionOverride;
	if (typeof configMention === "boolean") return configMention;
	if (overrideOrder !== "before-config" && typeof requireMentionOverride === "boolean") return requireMentionOverride;
	return true;
}
function resolveChannelGroupToolsPolicy(params) {
	const { groupConfig, defaultConfig } = resolveChannelGroupPolicy(params);
	const groupSenderPolicy = resolveToolsBySender({
		toolsBySender: groupConfig?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (groupSenderPolicy) return groupSenderPolicy;
	if (groupConfig?.tools) return groupConfig.tools;
	const defaultSenderPolicy = resolveToolsBySender({
		toolsBySender: defaultConfig?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (defaultSenderPolicy) return defaultSenderPolicy;
	if (defaultConfig?.tools) return defaultConfig.tools;
}

//#endregion
//#region src/slack/threading-tool-context.ts
function buildSlackThreadingToolContext(params) {
	const configuredReplyToMode = resolveSlackReplyToMode(resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}), params.context.ChatType);
	const effectiveReplyToMode = params.context.ThreadLabel ? "all" : configuredReplyToMode;
	const threadId = params.context.MessageThreadId ?? params.context.ReplyToId;
	return {
		currentChannelId: params.context.To?.startsWith("channel:") ? params.context.To.slice(8) : void 0,
		currentThreadTs: threadId != null ? String(threadId) : void 0,
		replyToMode: effectiveReplyToMode,
		hasRepliedRef: params.hasRepliedRef
	};
}

//#endregion
//#region src/channels/plugins/group-mentions.ts
function normalizeDiscordSlug(value) {
	if (!value) return "";
	let text = value.trim().toLowerCase();
	if (!text) return "";
	text = text.replace(/^[@#]+/, "");
	text = text.replace(/[\s_]+/g, "-");
	text = text.replace(/[^a-z0-9-]+/g, "-");
	text = text.replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
	return text;
}
function normalizeSlackSlug(raw) {
	const trimmed = raw?.trim().toLowerCase() ?? "";
	if (!trimmed) return "";
	return trimmed.replace(/\s+/g, "-").replace(/[^a-z0-9#@._+-]+/g, "-").replace(/-{2,}/g, "-").replace(/^[-.]+|[-.]+$/g, "");
}
function parseTelegramGroupId(value) {
	const raw = value?.trim() ?? "";
	if (!raw) return {
		chatId: void 0,
		topicId: void 0
	};
	const parts = raw.split(":").filter(Boolean);
	if (parts.length >= 3 && parts[1] === "topic" && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[2])) return {
		chatId: parts[0],
		topicId: parts[2]
	};
	if (parts.length >= 2 && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) return {
		chatId: parts[0],
		topicId: parts[1]
	};
	return {
		chatId: raw,
		topicId: void 0
	};
}
function resolveTelegramRequireMention(params) {
	const { cfg, chatId, topicId } = params;
	if (!chatId) return;
	const groupConfig = cfg.channels?.telegram?.groups?.[chatId];
	const groupDefault = cfg.channels?.telegram?.groups?.["*"];
	const topicConfig = topicId && groupConfig?.topics ? groupConfig.topics[topicId] : void 0;
	const defaultTopicConfig = topicId && groupDefault?.topics ? groupDefault.topics[topicId] : void 0;
	if (typeof topicConfig?.requireMention === "boolean") return topicConfig.requireMention;
	if (typeof defaultTopicConfig?.requireMention === "boolean") return defaultTopicConfig.requireMention;
	if (typeof groupConfig?.requireMention === "boolean") return groupConfig.requireMention;
	if (typeof groupDefault?.requireMention === "boolean") return groupDefault.requireMention;
}
function resolveDiscordGuildEntry(guilds, groupSpace) {
	if (!guilds || Object.keys(guilds).length === 0) return null;
	const space = groupSpace?.trim() ?? "";
	if (space && guilds[space]) return guilds[space];
	const normalized = normalizeDiscordSlug(space);
	if (normalized && guilds[normalized]) return guilds[normalized];
	if (normalized) {
		const match = Object.values(guilds).find((entry) => normalizeDiscordSlug(entry?.slug ?? void 0) === normalized);
		if (match) return match;
	}
	return guilds["*"] ?? null;
}
function resolveTelegramGroupRequireMention(params) {
	const { chatId, topicId } = parseTelegramGroupId(params.groupId);
	const requireMention = resolveTelegramRequireMention({
		cfg: params.cfg,
		chatId,
		topicId
	});
	if (typeof requireMention === "boolean") return requireMention;
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "telegram",
		groupId: chatId ?? params.groupId,
		accountId: params.accountId
	});
}
function resolveWhatsAppGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveIMessageGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "imessage",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveDiscordGroupRequireMention(params) {
	const guildEntry = resolveDiscordGuildEntry(params.cfg.channels?.discord?.guilds, params.groupSpace);
	const channelEntries = guildEntry?.channels;
	if (channelEntries && Object.keys(channelEntries).length > 0) {
		const groupChannel = params.groupChannel;
		const channelSlug = normalizeDiscordSlug(groupChannel);
		const entry = (params.groupId ? channelEntries[params.groupId] : void 0) ?? (channelSlug ? channelEntries[channelSlug] ?? channelEntries[`#${channelSlug}`] : void 0) ?? (groupChannel ? channelEntries[normalizeDiscordSlug(groupChannel)] : void 0);
		if (entry && typeof entry.requireMention === "boolean") return entry.requireMention;
	}
	if (typeof guildEntry?.requireMention === "boolean") return guildEntry.requireMention;
	return true;
}
function resolveGoogleChatGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "googlechat",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveGoogleChatGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "googlechat",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveSlackGroupRequireMention(params) {
	const channels = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).channels ?? {};
	if (Object.keys(channels).length === 0) return true;
	const channelId = params.groupId?.trim();
	const channelName = params.groupChannel?.replace(/^#/, "");
	const normalizedName = normalizeSlackSlug(channelName);
	const candidates = [
		channelId ?? "",
		channelName ? `#${channelName}` : "",
		channelName ?? "",
		normalizedName
	].filter(Boolean);
	let matched;
	for (const candidate of candidates) if (candidate && channels[candidate]) {
		matched = channels[candidate];
		break;
	}
	const fallback = channels["*"];
	const resolved = matched ?? fallback;
	if (typeof resolved?.requireMention === "boolean") return resolved.requireMention;
	return true;
}
function resolveTelegramGroupToolPolicy(params) {
	const { chatId } = parseTelegramGroupId(params.groupId);
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "telegram",
		groupId: chatId ?? params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveWhatsAppGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveIMessageGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "imessage",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveDiscordGroupToolPolicy(params) {
	const guildEntry = resolveDiscordGuildEntry(params.cfg.channels?.discord?.guilds, params.groupSpace);
	const channelEntries = guildEntry?.channels;
	if (channelEntries && Object.keys(channelEntries).length > 0) {
		const groupChannel = params.groupChannel;
		const channelSlug = normalizeDiscordSlug(groupChannel);
		const entry = (params.groupId ? channelEntries[params.groupId] : void 0) ?? (channelSlug ? channelEntries[channelSlug] ?? channelEntries[`#${channelSlug}`] : void 0) ?? (groupChannel ? channelEntries[normalizeDiscordSlug(groupChannel)] : void 0);
		const senderPolicy = resolveToolsBySender({
			toolsBySender: entry?.toolsBySender,
			senderId: params.senderId,
			senderName: params.senderName,
			senderUsername: params.senderUsername,
			senderE164: params.senderE164
		});
		if (senderPolicy) return senderPolicy;
		if (entry?.tools) return entry.tools;
	}
	const guildSenderPolicy = resolveToolsBySender({
		toolsBySender: guildEntry?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (guildSenderPolicy) return guildSenderPolicy;
	if (guildEntry?.tools) return guildEntry.tools;
}
function resolveSlackGroupToolPolicy(params) {
	const channels = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).channels ?? {};
	if (Object.keys(channels).length === 0) return;
	const channelId = params.groupId?.trim();
	const channelName = params.groupChannel?.replace(/^#/, "");
	const normalizedName = normalizeSlackSlug(channelName);
	const candidates = [
		channelId ?? "",
		channelName ? `#${channelName}` : "",
		channelName ?? "",
		normalizedName
	].filter(Boolean);
	let matched;
	for (const candidate of candidates) if (candidate && channels[candidate]) {
		matched = channels[candidate];
		break;
	}
	const resolved = matched ?? channels["*"];
	const senderPolicy = resolveToolsBySender({
		toolsBySender: resolved?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (senderPolicy) return senderPolicy;
	if (resolved?.tools) return resolved.tools;
}

//#endregion
//#region src/channels/dock.ts
const formatLower = (allowFrom) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.toLowerCase());
const DOCKS = {
	telegram: {
		id: "telegram",
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"channel",
				"thread"
			],
			nativeCommands: true,
			blockStreaming: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveTelegramAccount({
				cfg,
				accountId
			}).config.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.replace(/^(telegram|tg):/i, "")).map((entry) => entry.toLowerCase())
		},
		groups: {
			resolveRequireMention: resolveTelegramGroupRequireMention,
			resolveToolPolicy: resolveTelegramGroupToolPolicy
		},
		threading: {
			resolveReplyToMode: ({ cfg }) => cfg.channels?.telegram?.replyToMode ?? "first",
			buildToolContext: ({ context, hasRepliedRef }) => {
				const threadId = context.MessageThreadId ?? context.ReplyToId;
				return {
					currentChannelId: context.To?.trim() || void 0,
					currentThreadTs: threadId != null ? String(threadId) : void 0,
					hasRepliedRef
				};
			}
		}
	},
	whatsapp: {
		id: "whatsapp",
		capabilities: {
			chatTypes: ["direct", "group"],
			polls: true,
			reactions: true,
			media: true
		},
		commands: {
			enforceOwnerForCommands: true,
			skipWhenConfigEmpty: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => resolveWhatsAppAccount({
				cfg,
				accountId
			}).allowFrom ?? [],
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter((entry) => Boolean(entry)).map((entry) => entry === "*" ? entry : normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry))
		},
		groups: {
			resolveRequireMention: resolveWhatsAppGroupRequireMention,
			resolveToolPolicy: resolveWhatsAppGroupToolPolicy,
			resolveGroupIntroHint: () => "WhatsApp IDs: SenderId is the participant JID (group participant id)."
		},
		mentions: { stripPatterns: ({ ctx }) => {
			const selfE164 = (ctx.To ?? "").replace(/^whatsapp:/, "");
			if (!selfE164) return [];
			const escaped = escapeRegExp(selfE164);
			return [escaped, `@${escaped}`];
		} },
		threading: { buildToolContext: ({ context, hasRepliedRef }) => {
			return {
				currentChannelId: context.From?.trim() || context.To?.trim() || void 0,
				currentThreadTs: context.ReplyToId,
				hasRepliedRef
			};
		} }
	},
	discord: {
		id: "discord",
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			polls: true,
			reactions: true,
			media: true,
			nativeCommands: true,
			threads: true
		},
		outbound: { textChunkLimit: 2e3 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		elevated: { allowFromFallback: ({ cfg }) => cfg.channels?.discord?.dm?.allowFrom },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveDiscordAccount({
				cfg,
				accountId
			}).config.dm?.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => formatLower(allowFrom)
		},
		groups: {
			resolveRequireMention: resolveDiscordGroupRequireMention,
			resolveToolPolicy: resolveDiscordGroupToolPolicy
		},
		mentions: { stripPatterns: () => ["<@!?\\d+>"] },
		threading: {
			resolveReplyToMode: ({ cfg }) => cfg.channels?.discord?.replyToMode ?? "off",
			buildToolContext: ({ context, hasRepliedRef }) => ({
				currentChannelId: context.To?.trim() || void 0,
				currentThreadTs: context.ReplyToId,
				hasRepliedRef
			})
		}
	},
	irc: {
		id: "irc",
		capabilities: {
			chatTypes: ["direct", "group"],
			media: true,
			blockStreaming: true
		},
		outbound: { textChunkLimit: 350 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 300,
			idleMs: 1e3
		} },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => {
				const channel = cfg.channels?.irc;
				const normalized = normalizeAccountId$1(accountId);
				return ((channel?.accounts?.[normalized] ?? channel?.accounts?.[Object.keys(channel?.accounts ?? {}).find((key) => key.toLowerCase() === normalized.toLowerCase()) ?? ""])?.allowFrom ?? channel?.allowFrom ?? []).map((entry) => String(entry));
			},
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.replace(/^irc:/i, "").replace(/^user:/i, "").toLowerCase())
		},
		groups: {
			resolveRequireMention: ({ cfg, accountId, groupId }) => {
				if (!groupId) return true;
				return resolveChannelGroupRequireMention({
					cfg,
					channel: "irc",
					groupId,
					accountId,
					groupIdCaseInsensitive: true
				});
			},
			resolveToolPolicy: ({ cfg, accountId, groupId, senderId, senderName, senderUsername }) => {
				if (!groupId) return;
				return resolveChannelGroupToolsPolicy({
					cfg,
					channel: "irc",
					groupId,
					accountId,
					groupIdCaseInsensitive: true,
					senderId,
					senderName,
					senderUsername
				});
			}
		}
	},
	googlechat: {
		id: "googlechat",
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"thread"
			],
			reactions: true,
			media: true,
			threads: true,
			blockStreaming: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => {
				const channel = cfg.channels?.googlechat;
				const normalized = normalizeAccountId$1(accountId);
				return ((channel?.accounts?.[normalized] ?? channel?.accounts?.[Object.keys(channel?.accounts ?? {}).find((key) => key.toLowerCase() === normalized.toLowerCase()) ?? ""])?.dm?.allowFrom ?? channel?.dm?.allowFrom ?? []).map((entry) => String(entry));
			},
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.replace(/^(googlechat|google-chat|gchat):/i, "").replace(/^user:/i, "").replace(/^users\//i, "").toLowerCase())
		},
		groups: {
			resolveRequireMention: resolveGoogleChatGroupRequireMention,
			resolveToolPolicy: resolveGoogleChatGroupToolPolicy
		},
		threading: {
			resolveReplyToMode: ({ cfg }) => cfg.channels?.googlechat?.replyToMode ?? "off",
			buildToolContext: ({ context, hasRepliedRef }) => {
				const threadId = context.MessageThreadId ?? context.ReplyToId;
				return {
					currentChannelId: context.To?.trim() || void 0,
					currentThreadTs: threadId != null ? String(threadId) : void 0,
					hasRepliedRef
				};
			}
		}
	},
	slack: {
		id: "slack",
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			reactions: true,
			media: true,
			nativeCommands: true,
			threads: true
		},
		outbound: { textChunkLimit: 4e3 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveSlackAccount({
				cfg,
				accountId
			}).dm?.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => formatLower(allowFrom)
		},
		groups: {
			resolveRequireMention: resolveSlackGroupRequireMention,
			resolveToolPolicy: resolveSlackGroupToolPolicy
		},
		mentions: { stripPatterns: () => ["<@[^>]+>"] },
		threading: {
			resolveReplyToMode: ({ cfg, accountId, chatType }) => resolveSlackReplyToMode(resolveSlackAccount({
				cfg,
				accountId
			}), chatType),
			allowTagsWhenOff: true,
			buildToolContext: (params) => buildSlackThreadingToolContext(params)
		}
	},
	signal: {
		id: "signal",
		capabilities: {
			chatTypes: ["direct", "group"],
			reactions: true,
			media: true
		},
		outbound: { textChunkLimit: 4e3 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveSignalAccount({
				cfg,
				accountId
			}).config.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry === "*" ? "*" : normalizeE164(entry.replace(/^signal:/i, ""))).filter(Boolean)
		},
		threading: { buildToolContext: ({ context, hasRepliedRef }) => {
			return {
				currentChannelId: (context.ChatType?.toLowerCase() === "direct" ? context.From ?? context.To : context.To)?.trim() || void 0,
				currentThreadTs: context.ReplyToId,
				hasRepliedRef
			};
		} }
	},
	imessage: {
		id: "imessage",
		capabilities: {
			chatTypes: ["direct", "group"],
			reactions: true,
			media: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveIMessageAccount({
				cfg,
				accountId
			}).config.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean)
		},
		groups: {
			resolveRequireMention: resolveIMessageGroupRequireMention,
			resolveToolPolicy: resolveIMessageGroupToolPolicy
		},
		threading: { buildToolContext: ({ context, hasRepliedRef }) => {
			return {
				currentChannelId: (context.ChatType?.toLowerCase() === "direct" ? context.From ?? context.To : context.To)?.trim() || void 0,
				currentThreadTs: context.ReplyToId,
				hasRepliedRef
			};
		} }
	}
};
function buildDockFromPlugin(plugin) {
	return {
		id: plugin.id,
		capabilities: plugin.capabilities,
		commands: plugin.commands,
		outbound: plugin.outbound?.textChunkLimit ? { textChunkLimit: plugin.outbound.textChunkLimit } : void 0,
		streaming: plugin.streaming ? { blockStreamingCoalesceDefaults: plugin.streaming.blockStreamingCoalesceDefaults } : void 0,
		elevated: plugin.elevated,
		config: plugin.config ? {
			resolveAllowFrom: plugin.config.resolveAllowFrom,
			formatAllowFrom: plugin.config.formatAllowFrom
		} : void 0,
		groups: plugin.groups,
		mentions: plugin.mentions,
		threading: plugin.threading,
		agentPrompt: plugin.agentPrompt
	};
}
function listPluginDockEntries() {
	const registry = requireActivePluginRegistry();
	const entries = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of registry.channels) {
		const plugin = entry.plugin;
		const id = String(plugin.id).trim();
		if (!id || seen.has(id)) continue;
		seen.add(id);
		if (CHAT_CHANNEL_ORDER.includes(plugin.id)) continue;
		const dock = entry.dock ?? buildDockFromPlugin(plugin);
		entries.push({
			id: plugin.id,
			dock,
			order: plugin.meta.order
		});
	}
	return entries;
}
function listChannelDocks() {
	const baseEntries = CHAT_CHANNEL_ORDER.map((id) => ({
		id,
		dock: DOCKS[id],
		order: getChatChannelMeta(id).order
	}));
	const pluginEntries = listPluginDockEntries();
	const combined = [...baseEntries, ...pluginEntries];
	combined.sort((a, b) => {
		const indexA = CHAT_CHANNEL_ORDER.indexOf(a.id);
		const indexB = CHAT_CHANNEL_ORDER.indexOf(b.id);
		const orderA = a.order ?? (indexA === -1 ? 999 : indexA);
		const orderB = b.order ?? (indexB === -1 ? 999 : indexB);
		if (orderA !== orderB) return orderA - orderB;
		return String(a.id).localeCompare(String(b.id));
	});
	return combined.map((entry) => entry.dock);
}
function getChannelDock(id) {
	const core = DOCKS[id];
	if (core) return core;
	const pluginEntry = requireActivePluginRegistry().channels.find((entry) => entry.plugin.id === id);
	if (!pluginEntry) return;
	return pluginEntry.dock ?? buildDockFromPlugin(pluginEntry.plugin);
}

//#endregion
//#region src/config/sessions/metadata.ts
const mergeOrigin = (existing, next) => {
	if (!existing && !next) return;
	const merged = existing ? { ...existing } : {};
	if (next?.label) merged.label = next.label;
	if (next?.provider) merged.provider = next.provider;
	if (next?.surface) merged.surface = next.surface;
	if (next?.chatType) merged.chatType = next.chatType;
	if (next?.from) merged.from = next.from;
	if (next?.to) merged.to = next.to;
	if (next?.accountId) merged.accountId = next.accountId;
	if (next?.threadId != null && next.threadId !== "") merged.threadId = next.threadId;
	return Object.keys(merged).length > 0 ? merged : void 0;
};
function deriveSessionOrigin(ctx) {
	const label = resolveConversationLabel(ctx)?.trim();
	const provider = normalizeMessageChannel(typeof ctx.OriginatingChannel === "string" && ctx.OriginatingChannel || ctx.Surface || ctx.Provider);
	const surface = ctx.Surface?.trim().toLowerCase();
	const chatType = normalizeChatType(ctx.ChatType) ?? void 0;
	const from = ctx.From?.trim();
	const to = (typeof ctx.OriginatingTo === "string" ? ctx.OriginatingTo : ctx.To)?.trim() ?? void 0;
	const accountId = ctx.AccountId?.trim();
	const threadId = ctx.MessageThreadId ?? void 0;
	const origin = {};
	if (label) origin.label = label;
	if (provider) origin.provider = provider;
	if (surface) origin.surface = surface;
	if (chatType) origin.chatType = chatType;
	if (from) origin.from = from;
	if (to) origin.to = to;
	if (accountId) origin.accountId = accountId;
	if (threadId != null && threadId !== "") origin.threadId = threadId;
	return Object.keys(origin).length > 0 ? origin : void 0;
}
function snapshotSessionOrigin(entry) {
	if (!entry?.origin) return;
	return { ...entry.origin };
}
function deriveGroupSessionPatch(params) {
	const resolution = params.groupResolution ?? resolveGroupSessionKey(params.ctx);
	if (!resolution?.channel) return null;
	const channel = resolution.channel;
	const subject = params.ctx.GroupSubject?.trim();
	const space = params.ctx.GroupSpace?.trim();
	const explicitChannel = params.ctx.GroupChannel?.trim();
	const normalizedChannel = normalizeChannelId(channel);
	const isChannelProvider = Boolean(normalizedChannel && getChannelDock(normalizedChannel)?.capabilities.chatTypes.includes("channel"));
	const nextGroupChannel = explicitChannel ?? ((resolution.chatType === "channel" || isChannelProvider) && subject && subject.startsWith("#") ? subject : void 0);
	const nextSubject = nextGroupChannel ? void 0 : subject;
	const patch = {
		chatType: resolution.chatType ?? "group",
		channel,
		groupId: resolution.id
	};
	if (nextSubject) patch.subject = nextSubject;
	if (nextGroupChannel) patch.groupChannel = nextGroupChannel;
	if (space) patch.space = space;
	const displayName = buildGroupDisplayName({
		provider: channel,
		subject: nextSubject ?? params.existing?.subject,
		groupChannel: nextGroupChannel ?? params.existing?.groupChannel,
		space: space ?? params.existing?.space,
		id: resolution.id,
		key: params.sessionKey
	});
	if (displayName) patch.displayName = displayName;
	return patch;
}
function deriveSessionMetaPatch(params) {
	const groupPatch = deriveGroupSessionPatch(params);
	const origin = deriveSessionOrigin(params.ctx);
	if (!groupPatch && !origin) return null;
	const patch = groupPatch ? { ...groupPatch } : {};
	const mergedOrigin = mergeOrigin(params.existing?.origin, origin);
	if (mergedOrigin) patch.origin = mergedOrigin;
	return Object.keys(patch).length > 0 ? patch : null;
}

//#endregion
//#region src/config/sessions/main-session.ts
function resolveMainSessionKey(cfg) {
	if (cfg?.session?.scope === "global") return "global";
	const agents = cfg?.agents?.list ?? [];
	return buildAgentMainSessionKey({
		agentId: normalizeAgentId(agents.find((agent) => agent?.default)?.id ?? agents[0]?.id ?? DEFAULT_AGENT_ID),
		mainKey: normalizeMainKey(cfg?.session?.mainKey)
	});
}
function resolveMainSessionKeyFromConfig() {
	return resolveMainSessionKey(loadConfig());
}
function resolveAgentMainSessionKey(params) {
	const mainKey = normalizeMainKey(params.cfg?.session?.mainKey);
	return buildAgentMainSessionKey({
		agentId: params.agentId,
		mainKey
	});
}
function resolveExplicitAgentSessionKey(params) {
	const agentId = params.agentId?.trim();
	if (!agentId) return;
	return resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId
	});
}
function canonicalizeMainSessionAlias(params) {
	const raw = params.sessionKey.trim();
	if (!raw) return raw;
	const agentId = normalizeAgentId(params.agentId);
	const mainKey = normalizeMainKey(params.cfg?.session?.mainKey);
	const agentMainSessionKey = buildAgentMainSessionKey({
		agentId,
		mainKey
	});
	const agentMainAliasKey = buildAgentMainSessionKey({
		agentId,
		mainKey: "main"
	});
	const isMainAlias = raw === "main" || raw === mainKey || raw === agentMainSessionKey || raw === agentMainAliasKey;
	if (params.cfg?.session?.scope === "global" && isMainAlias) return "global";
	if (isMainAlias) return agentMainSessionKey;
	return raw;
}

//#endregion
//#region src/config/sessions/types.ts
function mergeSessionEntry(existing, patch) {
	const sessionId = patch.sessionId ?? existing?.sessionId ?? crypto.randomUUID();
	const updatedAt = Math.max(existing?.updatedAt ?? 0, patch.updatedAt ?? 0, Date.now());
	if (!existing) return {
		...patch,
		sessionId,
		updatedAt
	};
	return {
		...existing,
		...patch,
		sessionId,
		updatedAt
	};
}
function resolveFreshSessionTotalTokens(entry) {
	const total = entry?.totalTokens;
	if (typeof total !== "number" || !Number.isFinite(total) || total < 0) return;
	if (entry?.totalTokensFresh === false) return;
	return total;
}
const DEFAULT_RESET_TRIGGERS = ["/new", "/reset"];
const DEFAULT_IDLE_MINUTES = 60;

//#endregion
//#region src/config/sessions/reset.ts
const DEFAULT_RESET_MODE = "daily";
const DEFAULT_RESET_AT_HOUR = 4;
const THREAD_SESSION_MARKERS = [":thread:", ":topic:"];
const GROUP_SESSION_MARKERS = [":group:", ":channel:"];
function isThreadSessionKey(sessionKey) {
	const normalized = (sessionKey ?? "").toLowerCase();
	if (!normalized) return false;
	return THREAD_SESSION_MARKERS.some((marker) => normalized.includes(marker));
}
function resolveSessionResetType(params) {
	if (params.isThread || isThreadSessionKey(params.sessionKey)) return "thread";
	if (params.isGroup) return "group";
	const normalized = (params.sessionKey ?? "").toLowerCase();
	if (GROUP_SESSION_MARKERS.some((marker) => normalized.includes(marker))) return "group";
	return "direct";
}
function resolveThreadFlag(params) {
	if (params.messageThreadId != null) return true;
	if (params.threadLabel?.trim()) return true;
	if (params.threadStarterBody?.trim()) return true;
	if (params.parentSessionKey?.trim()) return true;
	return isThreadSessionKey(params.sessionKey);
}
function resolveDailyResetAtMs(now, atHour) {
	const normalizedAtHour = normalizeResetAtHour(atHour);
	const resetAt = new Date(now);
	resetAt.setHours(normalizedAtHour, 0, 0, 0);
	if (now < resetAt.getTime()) resetAt.setDate(resetAt.getDate() - 1);
	return resetAt.getTime();
}
function resolveSessionResetPolicy(params) {
	const sessionCfg = params.sessionCfg;
	const baseReset = params.resetOverride ?? sessionCfg?.reset;
	const typeReset = params.resetOverride ? void 0 : sessionCfg?.resetByType?.[params.resetType] ?? (params.resetType === "direct" ? (sessionCfg?.resetByType)?.dm : void 0);
	const hasExplicitReset = Boolean(baseReset || sessionCfg?.resetByType);
	const legacyIdleMinutes = params.resetOverride ? void 0 : sessionCfg?.idleMinutes;
	const mode = typeReset?.mode ?? baseReset?.mode ?? (!hasExplicitReset && legacyIdleMinutes != null ? "idle" : DEFAULT_RESET_MODE);
	const atHour = normalizeResetAtHour(typeReset?.atHour ?? baseReset?.atHour ?? DEFAULT_RESET_AT_HOUR);
	const idleMinutesRaw = typeReset?.idleMinutes ?? baseReset?.idleMinutes ?? legacyIdleMinutes;
	let idleMinutes;
	if (idleMinutesRaw != null) {
		const normalized = Math.floor(idleMinutesRaw);
		if (Number.isFinite(normalized)) idleMinutes = Math.max(normalized, 1);
	} else if (mode === "idle") idleMinutes = DEFAULT_IDLE_MINUTES;
	return {
		mode,
		atHour,
		idleMinutes
	};
}
function resolveChannelResetConfig(params) {
	const resetByChannel = params.sessionCfg?.resetByChannel;
	if (!resetByChannel) return;
	const normalized = normalizeMessageChannel(params.channel);
	const fallback = params.channel?.trim().toLowerCase();
	const key = normalized ?? fallback;
	if (!key) return;
	return resetByChannel[key] ?? resetByChannel[key.toLowerCase()];
}
function evaluateSessionFreshness(params) {
	const dailyResetAt = params.policy.mode === "daily" ? resolveDailyResetAtMs(params.now, params.policy.atHour) : void 0;
	const idleExpiresAt = params.policy.idleMinutes != null ? params.updatedAt + params.policy.idleMinutes * 6e4 : void 0;
	const staleDaily = dailyResetAt != null && params.updatedAt < dailyResetAt;
	const staleIdle = idleExpiresAt != null && params.now > idleExpiresAt;
	return {
		fresh: !(staleDaily || staleIdle),
		dailyResetAt,
		idleExpiresAt
	};
}
function normalizeResetAtHour(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_RESET_AT_HOUR;
	const normalized = Math.floor(value);
	if (!Number.isFinite(normalized)) return DEFAULT_RESET_AT_HOUR;
	if (normalized < 0) return 0;
	if (normalized > 23) return 23;
	return normalized;
}

//#endregion
//#region src/config/sessions/session-key.ts
function deriveSessionKey(scope, ctx) {
	if (scope === "global") return "global";
	const resolvedGroup = resolveGroupSessionKey(ctx);
	if (resolvedGroup) return resolvedGroup.key;
	return (ctx.From ? normalizeE164(ctx.From) : "") || "unknown";
}
/**
* Resolve the session key with a canonical direct-chat bucket (default: "main").
* All non-group direct chats collapse to this bucket; groups stay isolated.
*/
function resolveSessionKey(scope, ctx, mainKey) {
	const explicit = ctx.SessionKey?.trim();
	if (explicit) return explicit.toLowerCase();
	const raw = deriveSessionKey(scope, ctx);
	if (scope === "global") return raw;
	const canonical = buildAgentMainSessionKey({
		agentId: DEFAULT_AGENT_ID,
		mainKey: normalizeMainKey(mainKey)
	});
	if (!(raw.includes(":group:") || raw.includes(":channel:"))) return canonical;
	return `agent:${DEFAULT_AGENT_ID}:${raw}`;
}

//#endregion
//#region src/agents/session-write-lock.ts
const CLEANUP_SIGNALS = [
	"SIGINT",
	"SIGTERM",
	"SIGQUIT",
	"SIGABRT"
];
const CLEANUP_STATE_KEY = Symbol.for("openclaw.sessionWriteLockCleanupState");
const HELD_LOCKS_KEY = Symbol.for("openclaw.sessionWriteLockHeldLocks");
function resolveHeldLocks() {
	const proc = process;
	if (!proc[HELD_LOCKS_KEY]) proc[HELD_LOCKS_KEY] = /* @__PURE__ */ new Map();
	return proc[HELD_LOCKS_KEY];
}
const HELD_LOCKS = resolveHeldLocks();
function resolveCleanupState() {
	const proc = process;
	if (!proc[CLEANUP_STATE_KEY]) proc[CLEANUP_STATE_KEY] = {
		registered: false,
		cleanupHandlers: /* @__PURE__ */ new Map()
	};
	return proc[CLEANUP_STATE_KEY];
}
function isAlive(pid) {
	if (!Number.isFinite(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
/**
* Synchronously release all held locks.
* Used during process exit when async operations aren't reliable.
*/
function releaseAllLocksSync() {
	for (const [sessionFile, held] of HELD_LOCKS) {
		try {
			if (typeof held.handle.close === "function") held.handle.close().catch(() => {});
		} catch {}
		try {
			fs.rmSync(held.lockPath, { force: true });
		} catch {}
		HELD_LOCKS.delete(sessionFile);
	}
}
function handleTerminationSignal(signal) {
	releaseAllLocksSync();
	const cleanupState = resolveCleanupState();
	if (process.listenerCount(signal) === 1) {
		const handler = cleanupState.cleanupHandlers.get(signal);
		if (handler) {
			process.off(signal, handler);
			cleanupState.cleanupHandlers.delete(signal);
		}
		try {
			process.kill(process.pid, signal);
		} catch {}
	}
}
function registerCleanupHandlers() {
	const cleanupState = resolveCleanupState();
	if (!cleanupState.registered) {
		cleanupState.registered = true;
		process.on("exit", () => {
			releaseAllLocksSync();
		});
	}
	for (const signal of CLEANUP_SIGNALS) {
		if (cleanupState.cleanupHandlers.has(signal)) continue;
		try {
			const handler = () => handleTerminationSignal(signal);
			cleanupState.cleanupHandlers.set(signal, handler);
			process.on(signal, handler);
		} catch {}
	}
}
async function readLockPayload(lockPath) {
	try {
		const raw = await fs$1.readFile(lockPath, "utf8");
		const parsed = JSON.parse(raw);
		if (typeof parsed.pid !== "number") return null;
		if (typeof parsed.createdAt !== "string") return null;
		return {
			pid: parsed.pid,
			createdAt: parsed.createdAt
		};
	} catch {
		return null;
	}
}
async function acquireSessionWriteLock(params) {
	registerCleanupHandlers();
	const timeoutMs = params.timeoutMs ?? 1e4;
	const staleMs = params.staleMs ?? 1800 * 1e3;
	const sessionFile = path.resolve(params.sessionFile);
	const sessionDir = path.dirname(sessionFile);
	await fs$1.mkdir(sessionDir, { recursive: true });
	let normalizedDir = sessionDir;
	try {
		normalizedDir = await fs$1.realpath(sessionDir);
	} catch {}
	const normalizedSessionFile = path.join(normalizedDir, path.basename(sessionFile));
	const lockPath = `${normalizedSessionFile}.lock`;
	const held = HELD_LOCKS.get(normalizedSessionFile);
	if (held) {
		held.count += 1;
		return { release: async () => {
			const current = HELD_LOCKS.get(normalizedSessionFile);
			if (!current) return;
			current.count -= 1;
			if (current.count > 0) return;
			HELD_LOCKS.delete(normalizedSessionFile);
			await current.handle.close();
			await fs$1.rm(current.lockPath, { force: true });
		} };
	}
	const startedAt = Date.now();
	let attempt = 0;
	while (Date.now() - startedAt < timeoutMs) {
		attempt += 1;
		try {
			const handle = await fs$1.open(lockPath, "wx");
			await handle.writeFile(JSON.stringify({
				pid: process.pid,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			}, null, 2), "utf8");
			HELD_LOCKS.set(normalizedSessionFile, {
				count: 1,
				handle,
				lockPath
			});
			return { release: async () => {
				const current = HELD_LOCKS.get(normalizedSessionFile);
				if (!current) return;
				current.count -= 1;
				if (current.count > 0) return;
				HELD_LOCKS.delete(normalizedSessionFile);
				await current.handle.close();
				await fs$1.rm(current.lockPath, { force: true });
			} };
		} catch (err) {
			if (err.code !== "EEXIST") throw err;
			const payload = await readLockPayload(lockPath);
			const createdAt = payload?.createdAt ? Date.parse(payload.createdAt) : NaN;
			const stale = !Number.isFinite(createdAt) || Date.now() - createdAt > staleMs;
			const alive = payload?.pid ? isAlive(payload.pid) : false;
			if (stale || !alive) {
				await fs$1.rm(lockPath, { force: true });
				continue;
			}
			const delay = Math.min(1e3, 50 * attempt);
			await new Promise((r) => setTimeout(r, delay));
		}
	}
	const payload = await readLockPayload(lockPath);
	const owner = payload?.pid ? `pid=${payload.pid}` : "unknown";
	throw new Error(`session file locked (timeout ${timeoutMs}ms): ${owner} ${lockPath}`);
}
const __testing = {
	cleanupSignals: [...CLEANUP_SIGNALS],
	handleTerminationSignal,
	releaseAllLocksSync
};

//#endregion
//#region src/utils/account-id.ts
function normalizeAccountId(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}

//#endregion
//#region src/utils/delivery-context.ts
function normalizeDeliveryContext(context) {
	if (!context) return;
	const channel = typeof context.channel === "string" ? normalizeMessageChannel(context.channel) ?? context.channel.trim() : void 0;
	const to = typeof context.to === "string" ? context.to.trim() : void 0;
	const accountId = normalizeAccountId(context.accountId);
	const threadId = typeof context.threadId === "number" && Number.isFinite(context.threadId) ? Math.trunc(context.threadId) : typeof context.threadId === "string" ? context.threadId.trim() : void 0;
	const normalizedThreadId = typeof threadId === "string" ? threadId ? threadId : void 0 : threadId;
	if (!channel && !to && !accountId && normalizedThreadId == null) return;
	const normalized = {
		channel: channel || void 0,
		to: to || void 0,
		accountId
	};
	if (normalizedThreadId != null) normalized.threadId = normalizedThreadId;
	return normalized;
}
function normalizeSessionDeliveryFields(source) {
	if (!source) return {
		deliveryContext: void 0,
		lastChannel: void 0,
		lastTo: void 0,
		lastAccountId: void 0,
		lastThreadId: void 0
	};
	const merged = mergeDeliveryContext(normalizeDeliveryContext({
		channel: source.lastChannel ?? source.channel,
		to: source.lastTo,
		accountId: source.lastAccountId,
		threadId: source.lastThreadId
	}), normalizeDeliveryContext(source.deliveryContext));
	if (!merged) return {
		deliveryContext: void 0,
		lastChannel: void 0,
		lastTo: void 0,
		lastAccountId: void 0,
		lastThreadId: void 0
	};
	return {
		deliveryContext: merged,
		lastChannel: merged.channel,
		lastTo: merged.to,
		lastAccountId: merged.accountId,
		lastThreadId: merged.threadId
	};
}
function deliveryContextFromSession(entry) {
	if (!entry) return;
	return normalizeSessionDeliveryFields({
		channel: entry.channel,
		lastChannel: entry.lastChannel,
		lastTo: entry.lastTo,
		lastAccountId: entry.lastAccountId,
		lastThreadId: entry.lastThreadId ?? entry.deliveryContext?.threadId ?? entry.origin?.threadId,
		deliveryContext: entry.deliveryContext
	}).deliveryContext;
}
function mergeDeliveryContext(primary, fallback) {
	const normalizedPrimary = normalizeDeliveryContext(primary);
	const normalizedFallback = normalizeDeliveryContext(fallback);
	if (!normalizedPrimary && !normalizedFallback) return;
	return normalizeDeliveryContext({
		channel: normalizedPrimary?.channel ?? normalizedFallback?.channel,
		to: normalizedPrimary?.to ?? normalizedFallback?.to,
		accountId: normalizedPrimary?.accountId ?? normalizedFallback?.accountId,
		threadId: normalizedPrimary?.threadId ?? normalizedFallback?.threadId
	});
}
function deliveryContextKey(context) {
	const normalized = normalizeDeliveryContext(context);
	if (!normalized?.channel || !normalized?.to) return;
	const threadId = normalized.threadId != null && normalized.threadId !== "" ? String(normalized.threadId) : "";
	return `${normalized.channel}|${normalized.to}|${normalized.accountId ?? ""}|${threadId}`;
}

//#endregion
//#region src/config/cache-utils.ts
function resolveCacheTtlMs(params) {
	const { envValue, defaultTtlMs } = params;
	if (envValue) {
		const parsed = Number.parseInt(envValue, 10);
		if (Number.isFinite(parsed) && parsed >= 0) return parsed;
	}
	return defaultTtlMs;
}
function isCacheEnabled(ttlMs) {
	return ttlMs > 0;
}
function getFileMtimeMs(filePath) {
	try {
		return fs.statSync(filePath).mtimeMs;
	} catch {
		return;
	}
}

//#endregion
//#region src/config/sessions/store.ts
const log = createSubsystemLogger("sessions/store");
const SESSION_STORE_CACHE = /* @__PURE__ */ new Map();
const DEFAULT_SESSION_STORE_TTL_MS = 45e3;
function isSessionStoreRecord(value) {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function getSessionStoreTtl() {
	return resolveCacheTtlMs({
		envValue: process.env.OPENCLAW_SESSION_CACHE_TTL_MS,
		defaultTtlMs: DEFAULT_SESSION_STORE_TTL_MS
	});
}
function isSessionStoreCacheEnabled() {
	return isCacheEnabled(getSessionStoreTtl());
}
function isSessionStoreCacheValid(entry) {
	const now = Date.now();
	const ttl = getSessionStoreTtl();
	return now - entry.loadedAt <= ttl;
}
function invalidateSessionStoreCache(storePath) {
	SESSION_STORE_CACHE.delete(storePath);
}
function normalizeSessionEntryDelivery(entry) {
	const normalized = normalizeSessionDeliveryFields({
		channel: entry.channel,
		lastChannel: entry.lastChannel,
		lastTo: entry.lastTo,
		lastAccountId: entry.lastAccountId,
		lastThreadId: entry.lastThreadId ?? entry.deliveryContext?.threadId ?? entry.origin?.threadId,
		deliveryContext: entry.deliveryContext
	});
	const nextDelivery = normalized.deliveryContext;
	const sameDelivery = (entry.deliveryContext?.channel ?? void 0) === nextDelivery?.channel && (entry.deliveryContext?.to ?? void 0) === nextDelivery?.to && (entry.deliveryContext?.accountId ?? void 0) === nextDelivery?.accountId && (entry.deliveryContext?.threadId ?? void 0) === nextDelivery?.threadId;
	const sameLast = entry.lastChannel === normalized.lastChannel && entry.lastTo === normalized.lastTo && entry.lastAccountId === normalized.lastAccountId && entry.lastThreadId === normalized.lastThreadId;
	if (sameDelivery && sameLast) return entry;
	return {
		...entry,
		deliveryContext: nextDelivery,
		lastChannel: normalized.lastChannel,
		lastTo: normalized.lastTo,
		lastAccountId: normalized.lastAccountId,
		lastThreadId: normalized.lastThreadId
	};
}
function removeThreadFromDeliveryContext(context) {
	if (!context || context.threadId == null) return context;
	const next = { ...context };
	delete next.threadId;
	return next;
}
function normalizeSessionStore(store) {
	for (const [key, entry] of Object.entries(store)) {
		if (!entry) continue;
		const normalized = normalizeSessionEntryDelivery(entry);
		if (normalized !== entry) store[key] = normalized;
	}
}
function loadSessionStore(storePath, opts = {}) {
	if (!opts.skipCache && isSessionStoreCacheEnabled()) {
		const cached = SESSION_STORE_CACHE.get(storePath);
		if (cached && isSessionStoreCacheValid(cached)) {
			if (getFileMtimeMs(storePath) === cached.mtimeMs) return structuredClone(cached.store);
			invalidateSessionStoreCache(storePath);
		}
	}
	let store = {};
	let mtimeMs = getFileMtimeMs(storePath);
	try {
		const raw = fs.readFileSync(storePath, "utf-8");
		const parsed = JSON.parse(raw);
		if (isSessionStoreRecord(parsed)) store = parsed;
		mtimeMs = getFileMtimeMs(storePath) ?? mtimeMs;
	} catch {}
	for (const entry of Object.values(store)) {
		if (!entry || typeof entry !== "object") continue;
		const rec = entry;
		if (typeof rec.channel !== "string" && typeof rec.provider === "string") {
			rec.channel = rec.provider;
			delete rec.provider;
		}
		if (typeof rec.lastChannel !== "string" && typeof rec.lastProvider === "string") {
			rec.lastChannel = rec.lastProvider;
			delete rec.lastProvider;
		}
		if (typeof rec.groupChannel !== "string" && typeof rec.room === "string") {
			rec.groupChannel = rec.room;
			delete rec.room;
		} else if ("room" in rec) delete rec.room;
	}
	if (!opts.skipCache && isSessionStoreCacheEnabled()) SESSION_STORE_CACHE.set(storePath, {
		store: structuredClone(store),
		loadedAt: Date.now(),
		storePath,
		mtimeMs
	});
	return structuredClone(store);
}
function readSessionUpdatedAt(params) {
	try {
		return loadSessionStore(params.storePath)[params.sessionKey]?.updatedAt;
	} catch {
		return;
	}
}
const DEFAULT_SESSION_PRUNE_AFTER_MS = 720 * 60 * 60 * 1e3;
const DEFAULT_SESSION_MAX_ENTRIES = 500;
const DEFAULT_SESSION_ROTATE_BYTES = 10485760;
const DEFAULT_SESSION_MAINTENANCE_MODE = "warn";
function resolvePruneAfterMs(maintenance) {
	const raw = maintenance?.pruneAfter ?? maintenance?.pruneDays;
	if (raw === void 0 || raw === null || raw === "") return DEFAULT_SESSION_PRUNE_AFTER_MS;
	try {
		return parseDurationMs(String(raw).trim(), { defaultUnit: "d" });
	} catch {
		return DEFAULT_SESSION_PRUNE_AFTER_MS;
	}
}
function resolveRotateBytes(maintenance) {
	const raw = maintenance?.rotateBytes;
	if (raw === void 0 || raw === null || raw === "") return DEFAULT_SESSION_ROTATE_BYTES;
	try {
		return parseByteSize(String(raw).trim(), { defaultUnit: "b" });
	} catch {
		return DEFAULT_SESSION_ROTATE_BYTES;
	}
}
/**
* Resolve maintenance settings from openclaw.json (`session.maintenance`).
* Falls back to built-in defaults when config is missing or unset.
*/
function resolveMaintenanceConfig() {
	let maintenance;
	try {
		maintenance = loadConfig().session?.maintenance;
	} catch {}
	return {
		mode: maintenance?.mode ?? DEFAULT_SESSION_MAINTENANCE_MODE,
		pruneAfterMs: resolvePruneAfterMs(maintenance),
		maxEntries: maintenance?.maxEntries ?? DEFAULT_SESSION_MAX_ENTRIES,
		rotateBytes: resolveRotateBytes(maintenance)
	};
}
/**
* Remove entries whose `updatedAt` is older than the configured threshold.
* Entries without `updatedAt` are kept (cannot determine staleness).
* Mutates `store` in-place.
*/
function pruneStaleEntries(store, overrideMaxAgeMs, opts = {}) {
	const maxAgeMs = overrideMaxAgeMs ?? resolveMaintenanceConfig().pruneAfterMs;
	const cutoffMs = Date.now() - maxAgeMs;
	let pruned = 0;
	for (const [key, entry] of Object.entries(store)) if (entry?.updatedAt != null && entry.updatedAt < cutoffMs) {
		delete store[key];
		pruned++;
	}
	if (pruned > 0 && opts.log !== false) log.info("pruned stale session entries", {
		pruned,
		maxAgeMs
	});
	return pruned;
}
/**
* Cap the store to the N most recently updated entries.
* Entries without `updatedAt` are sorted last (removed first when over limit).
* Mutates `store` in-place.
*/
function getEntryUpdatedAt(entry) {
	return entry?.updatedAt ?? Number.NEGATIVE_INFINITY;
}
function getActiveSessionMaintenanceWarning(params) {
	const activeSessionKey = params.activeSessionKey.trim();
	if (!activeSessionKey) return null;
	const activeEntry = params.store[activeSessionKey];
	if (!activeEntry) return null;
	const cutoffMs = (params.nowMs ?? Date.now()) - params.pruneAfterMs;
	const wouldPrune = activeEntry.updatedAt != null ? activeEntry.updatedAt < cutoffMs : false;
	const keys = Object.keys(params.store);
	const wouldCap = keys.length > params.maxEntries && keys.toSorted((a, b) => getEntryUpdatedAt(params.store[b]) - getEntryUpdatedAt(params.store[a])).slice(params.maxEntries).includes(activeSessionKey);
	if (!wouldPrune && !wouldCap) return null;
	return {
		activeSessionKey,
		activeUpdatedAt: activeEntry.updatedAt,
		totalEntries: keys.length,
		pruneAfterMs: params.pruneAfterMs,
		maxEntries: params.maxEntries,
		wouldPrune,
		wouldCap
	};
}
function capEntryCount(store, overrideMax, opts = {}) {
	const maxEntries = overrideMax ?? resolveMaintenanceConfig().maxEntries;
	const keys = Object.keys(store);
	if (keys.length <= maxEntries) return 0;
	const toRemove = keys.toSorted((a, b) => {
		const aTime = getEntryUpdatedAt(store[a]);
		return getEntryUpdatedAt(store[b]) - aTime;
	}).slice(maxEntries);
	for (const key of toRemove) delete store[key];
	if (opts.log !== false) log.info("capped session entry count", {
		removed: toRemove.length,
		maxEntries
	});
	return toRemove.length;
}
async function getSessionFileSize(storePath) {
	try {
		return (await fs.promises.stat(storePath)).size;
	} catch {
		return null;
	}
}
/**
* Rotate the sessions file if it exceeds the configured size threshold.
* Renames the current file to `sessions.json.bak.{timestamp}` and cleans up
* old rotation backups, keeping only the 3 most recent `.bak.*` files.
*/
async function rotateSessionFile(storePath, overrideBytes) {
	const maxBytes = overrideBytes ?? resolveMaintenanceConfig().rotateBytes;
	const fileSize = await getSessionFileSize(storePath);
	if (fileSize == null) return false;
	if (fileSize <= maxBytes) return false;
	const backupPath = `${storePath}.bak.${Date.now()}`;
	try {
		await fs.promises.rename(storePath, backupPath);
		log.info("rotated session store file", {
			backupPath: path.basename(backupPath),
			sizeBytes: fileSize
		});
	} catch {
		return false;
	}
	try {
		const dir = path.dirname(storePath);
		const baseName = path.basename(storePath);
		const backups = (await fs.promises.readdir(dir)).filter((f) => f.startsWith(`${baseName}.bak.`)).toSorted().toReversed();
		const maxBackups = 3;
		if (backups.length > maxBackups) {
			const toDelete = backups.slice(maxBackups);
			for (const old of toDelete) await fs.promises.unlink(path.join(dir, old)).catch(() => void 0);
			log.info("cleaned up old session store backups", { deleted: toDelete.length });
		}
	} catch {}
	return true;
}
async function saveSessionStoreUnlocked(storePath, store, opts) {
	invalidateSessionStoreCache(storePath);
	normalizeSessionStore(store);
	if (!opts?.skipMaintenance) {
		const maintenance = resolveMaintenanceConfig();
		if (maintenance.mode === "warn") {
			const activeSessionKey = opts?.activeSessionKey?.trim();
			if (activeSessionKey) {
				const warning = getActiveSessionMaintenanceWarning({
					store,
					activeSessionKey,
					pruneAfterMs: maintenance.pruneAfterMs,
					maxEntries: maintenance.maxEntries
				});
				if (warning) {
					log.warn("session maintenance would evict active session; skipping enforcement", {
						activeSessionKey: warning.activeSessionKey,
						wouldPrune: warning.wouldPrune,
						wouldCap: warning.wouldCap,
						pruneAfterMs: warning.pruneAfterMs,
						maxEntries: warning.maxEntries
					});
					await opts?.onWarn?.(warning);
				}
			}
		} else {
			pruneStaleEntries(store, maintenance.pruneAfterMs);
			capEntryCount(store, maintenance.maxEntries);
			await rotateSessionFile(storePath, maintenance.rotateBytes);
		}
	}
	await fs.promises.mkdir(path.dirname(storePath), { recursive: true });
	const json = JSON.stringify(store, null, 2);
	if (process.platform === "win32") {
		try {
			await fs.promises.writeFile(storePath, json, "utf-8");
		} catch (err) {
			if ((err && typeof err === "object" && "code" in err ? String(err.code) : null) === "ENOENT") return;
			throw err;
		}
		return;
	}
	const tmp = `${storePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
	try {
		await fs.promises.writeFile(tmp, json, {
			mode: 384,
			encoding: "utf-8"
		});
		await fs.promises.rename(tmp, storePath);
		await fs.promises.chmod(storePath, 384);
	} catch (err) {
		if ((err && typeof err === "object" && "code" in err ? String(err.code) : null) === "ENOENT") {
			try {
				await fs.promises.mkdir(path.dirname(storePath), { recursive: true });
				await fs.promises.writeFile(storePath, json, {
					mode: 384,
					encoding: "utf-8"
				});
				await fs.promises.chmod(storePath, 384);
			} catch (err2) {
				if ((err2 && typeof err2 === "object" && "code" in err2 ? String(err2.code) : null) === "ENOENT") return;
				throw err2;
			}
			return;
		}
		throw err;
	} finally {
		await fs.promises.rm(tmp, { force: true });
	}
}
async function saveSessionStore(storePath, store, opts) {
	await withSessionStoreLock(storePath, async () => {
		await saveSessionStoreUnlocked(storePath, store, opts);
	});
}
async function updateSessionStore(storePath, mutator, opts) {
	return await withSessionStoreLock(storePath, async () => {
		const store = loadSessionStore(storePath, { skipCache: true });
		const result = await mutator(store);
		await saveSessionStoreUnlocked(storePath, store, opts);
		return result;
	});
}
const LOCK_QUEUES = /* @__PURE__ */ new Map();
function lockTimeoutError(storePath) {
	return /* @__PURE__ */ new Error(`timeout waiting for session store lock: ${storePath}`);
}
function getOrCreateLockQueue(storePath) {
	const existing = LOCK_QUEUES.get(storePath);
	if (existing) return existing;
	const created = {
		running: false,
		pending: []
	};
	LOCK_QUEUES.set(storePath, created);
	return created;
}
function removePendingTask(queue, task) {
	const idx = queue.pending.indexOf(task);
	if (idx >= 0) queue.pending.splice(idx, 1);
}
async function drainSessionStoreLockQueue(storePath) {
	const queue = LOCK_QUEUES.get(storePath);
	if (!queue || queue.running) return;
	queue.running = true;
	try {
		while (queue.pending.length > 0) {
			const task = queue.pending.shift();
			if (!task || task.timedOut) continue;
			if (task.timer) clearTimeout(task.timer);
			task.started = true;
			const remainingTimeoutMs = task.timeoutAt != null ? Math.max(0, task.timeoutAt - Date.now()) : Number.POSITIVE_INFINITY;
			if (task.timeoutAt != null && remainingTimeoutMs <= 0) {
				task.timedOut = true;
				task.reject(lockTimeoutError(storePath));
				continue;
			}
			let lock;
			let result;
			let failed;
			let hasFailure = false;
			try {
				lock = await acquireSessionWriteLock({
					sessionFile: storePath,
					timeoutMs: remainingTimeoutMs,
					staleMs: task.staleMs
				});
				result = await task.fn();
			} catch (err) {
				hasFailure = true;
				failed = err;
			} finally {
				await lock?.release().catch(() => void 0);
			}
			if (hasFailure) {
				task.reject(failed);
				continue;
			}
			task.resolve(result);
		}
	} finally {
		queue.running = false;
		if (queue.pending.length === 0) LOCK_QUEUES.delete(storePath);
		else queueMicrotask(() => {
			drainSessionStoreLockQueue(storePath);
		});
	}
}
async function withSessionStoreLock(storePath, fn, opts = {}) {
	const timeoutMs = opts.timeoutMs ?? 1e4;
	const staleMs = opts.staleMs ?? 3e4;
	opts.pollIntervalMs;
	const hasTimeout = timeoutMs > 0 && Number.isFinite(timeoutMs);
	const timeoutAt = hasTimeout ? Date.now() + timeoutMs : void 0;
	const queue = getOrCreateLockQueue(storePath);
	return await new Promise((resolve, reject) => {
		const task = {
			fn: async () => await fn(),
			resolve: (value) => resolve(value),
			reject,
			timeoutAt,
			staleMs,
			started: false,
			timedOut: false
		};
		if (hasTimeout) task.timer = setTimeout(() => {
			if (task.started || task.timedOut) return;
			task.timedOut = true;
			removePendingTask(queue, task);
			reject(lockTimeoutError(storePath));
		}, timeoutMs);
		queue.pending.push(task);
		drainSessionStoreLockQueue(storePath);
	});
}
async function updateSessionStoreEntry(params) {
	const { storePath, sessionKey, update } = params;
	return await withSessionStoreLock(storePath, async () => {
		const store = loadSessionStore(storePath);
		const existing = store[sessionKey];
		if (!existing) return null;
		const patch = await update(existing);
		if (!patch) return existing;
		const next = mergeSessionEntry(existing, patch);
		store[sessionKey] = next;
		await saveSessionStoreUnlocked(storePath, store, { activeSessionKey: sessionKey });
		return next;
	});
}
async function recordSessionMetaFromInbound(params) {
	const { storePath, sessionKey, ctx } = params;
	const createIfMissing = params.createIfMissing ?? true;
	return await updateSessionStore(storePath, (store) => {
		const existing = store[sessionKey];
		const patch = deriveSessionMetaPatch({
			ctx,
			sessionKey,
			existing,
			groupResolution: params.groupResolution
		});
		if (!patch) return existing ?? null;
		if (!existing && !createIfMissing) return null;
		const next = mergeSessionEntry(existing, patch);
		store[sessionKey] = next;
		return next;
	}, { activeSessionKey: sessionKey });
}
async function updateLastRoute(params) {
	const { storePath, sessionKey, channel, to, accountId, threadId, ctx } = params;
	return await withSessionStoreLock(storePath, async () => {
		const store = loadSessionStore(storePath);
		const existing = store[sessionKey];
		const now = Date.now();
		const explicitContext = normalizeDeliveryContext(params.deliveryContext);
		const inlineContext = normalizeDeliveryContext({
			channel,
			to,
			accountId,
			threadId
		});
		const mergedInput = mergeDeliveryContext(explicitContext, inlineContext);
		const explicitDeliveryContext = params.deliveryContext;
		const explicitThreadValue = (explicitDeliveryContext != null && Object.prototype.hasOwnProperty.call(explicitDeliveryContext, "threadId") ? explicitDeliveryContext.threadId : void 0) ?? (threadId != null && threadId !== "" ? threadId : void 0);
		const merged = mergeDeliveryContext(mergedInput, Boolean(explicitContext?.channel || explicitContext?.to || inlineContext?.channel || inlineContext?.to) && explicitThreadValue == null ? removeThreadFromDeliveryContext(deliveryContextFromSession(existing)) : deliveryContextFromSession(existing));
		const normalized = normalizeSessionDeliveryFields({ deliveryContext: {
			channel: merged?.channel,
			to: merged?.to,
			accountId: merged?.accountId,
			threadId: merged?.threadId
		} });
		const metaPatch = ctx ? deriveSessionMetaPatch({
			ctx,
			sessionKey,
			existing,
			groupResolution: params.groupResolution
		}) : null;
		const basePatch = {
			updatedAt: Math.max(existing?.updatedAt ?? 0, now),
			deliveryContext: normalized.deliveryContext,
			lastChannel: normalized.lastChannel,
			lastTo: normalized.lastTo,
			lastAccountId: normalized.lastAccountId,
			lastThreadId: normalized.lastThreadId
		};
		const next = mergeSessionEntry(existing, metaPatch ? {
			...basePatch,
			...metaPatch
		} : basePatch);
		store[sessionKey] = next;
		await saveSessionStoreUnlocked(storePath, store, { activeSessionKey: sessionKey });
		return next;
	});
}

//#endregion
//#region src/config/sessions/transcript.ts
function stripQuery(value) {
	const noHash = value.split("#")[0] ?? value;
	return noHash.split("?")[0] ?? noHash;
}
function extractFileNameFromMediaUrl(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const cleaned = stripQuery(trimmed);
	try {
		const parsed = new URL(cleaned);
		const base = path.basename(parsed.pathname);
		if (!base) return null;
		try {
			return decodeURIComponent(base);
		} catch {
			return base;
		}
	} catch {
		const base = path.basename(cleaned);
		if (!base || base === "/" || base === ".") return null;
		return base;
	}
}
function resolveMirroredTranscriptText(params) {
	const mediaUrls = params.mediaUrls?.filter((url) => url && url.trim()) ?? [];
	if (mediaUrls.length > 0) {
		const names = mediaUrls.map((url) => extractFileNameFromMediaUrl(url)).filter((name) => Boolean(name && name.trim()));
		if (names.length > 0) return names.join(", ");
		return "media";
	}
	const trimmed = (params.text ?? "").trim();
	return trimmed ? trimmed : null;
}
async function ensureSessionHeader(params) {
	if (fs.existsSync(params.sessionFile)) return;
	await fs.promises.mkdir(path.dirname(params.sessionFile), { recursive: true });
	const header = {
		type: "session",
		version: CURRENT_SESSION_VERSION,
		id: params.sessionId,
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		cwd: process.cwd()
	};
	await fs.promises.writeFile(params.sessionFile, `${JSON.stringify(header)}\n`, "utf-8");
}
async function appendAssistantMessageToSessionTranscript(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return {
		ok: false,
		reason: "missing sessionKey"
	};
	const mirrorText = resolveMirroredTranscriptText({
		text: params.text,
		mediaUrls: params.mediaUrls
	});
	if (!mirrorText) return {
		ok: false,
		reason: "empty text"
	};
	const storePath = params.storePath ?? resolveDefaultSessionStorePath(params.agentId);
	const entry = loadSessionStore(storePath, { skipCache: true })[sessionKey];
	if (!entry?.sessionId) return {
		ok: false,
		reason: `unknown sessionKey: ${sessionKey}`
	};
	let sessionFile;
	try {
		sessionFile = resolveSessionFilePath(entry.sessionId, entry, { sessionsDir: path.dirname(storePath) });
	} catch (err) {
		return {
			ok: false,
			reason: err instanceof Error ? err.message : String(err)
		};
	}
	await ensureSessionHeader({
		sessionFile,
		sessionId: entry.sessionId
	});
	SessionManager.open(sessionFile).appendMessage({
		role: "assistant",
		content: [{
			type: "text",
			text: mirrorText
		}],
		api: "openai-responses",
		provider: "openclaw",
		model: "delivery-mirror",
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				total: 0
			}
		},
		stopReason: "stop",
		timestamp: Date.now()
	});
	if (!entry.sessionFile || entry.sessionFile !== sessionFile) await updateSessionStore(storePath, (current) => {
		current[sessionKey] = {
			...entry,
			sessionFile
		};
	}, { activeSessionKey: sessionKey });
	emitSessionTranscriptUpdate(sessionFile);
	return {
		ok: true,
		sessionFile
	};
}

//#endregion
//#region src/config/sessions/delivery-info.ts
/**
* Extract deliveryContext and threadId from a sessionKey.
* Supports both :thread: (most channels) and :topic: (Telegram).
*/
function extractDeliveryInfo(sessionKey) {
	if (!sessionKey) return {
		deliveryContext: void 0,
		threadId: void 0
	};
	const topicIndex = sessionKey.lastIndexOf(":topic:");
	const threadIndex = sessionKey.lastIndexOf(":thread:");
	const markerIndex = Math.max(topicIndex, threadIndex);
	const marker = topicIndex > threadIndex ? ":topic:" : ":thread:";
	const baseSessionKey = markerIndex === -1 ? sessionKey : sessionKey.slice(0, markerIndex);
	const threadId = (markerIndex === -1 ? void 0 : sessionKey.slice(markerIndex + marker.length))?.trim() || void 0;
	let deliveryContext;
	try {
		const store = loadSessionStore(resolveStorePath(loadConfig().session?.store));
		let entry = store[sessionKey];
		if (!entry?.deliveryContext && markerIndex !== -1 && baseSessionKey) entry = store[baseSessionKey];
		if (entry?.deliveryContext) deliveryContext = {
			channel: entry.deliveryContext.channel,
			to: entry.deliveryContext.to,
			accountId: entry.deliveryContext.accountId
		};
	} catch {}
	return {
		deliveryContext,
		threadId
	};
}

//#endregion
export { resolveExplicitAgentSessionKey as A, buildGroupDisplayName as B, resolveSessionResetPolicy as C, resolveFreshSessionTotalTokens as D, DEFAULT_RESET_TRIGGERS as E, getChannelDock as F, resolveConversationLabel as H, listChannelDocks as I, resolveChannelGroupPolicy as L, resolveMainSessionKeyFromConfig as M, deriveSessionMetaPatch as N, canonicalizeMainSessionAlias as O, snapshotSessionOrigin as P, resolveChannelGroupRequireMention as R, resolveChannelResetConfig as S, resolveThreadFlag as T, resolveGroupSessionKey as V, normalizeSessionDeliveryFields as _, readSessionUpdatedAt as a, resolveSessionKey as b, updateLastRoute as c, isCacheEnabled as d, resolveCacheTtlMs as f, normalizeDeliveryContext as g, mergeDeliveryContext as h, loadSessionStore as i, resolveMainSessionKey as j, resolveAgentMainSessionKey as k, updateSessionStore as l, deliveryContextKey as m, appendAssistantMessageToSessionTranscript as n, recordSessionMetaFromInbound as o, deliveryContextFromSession as p, resolveMirroredTranscriptText as r, saveSessionStore as s, extractDeliveryInfo as t, updateSessionStoreEntry as u, normalizeAccountId as v, resolveSessionResetType as w, evaluateSessionFreshness as x, acquireSessionWriteLock as y, resolveChannelGroupToolsPolicy as z };