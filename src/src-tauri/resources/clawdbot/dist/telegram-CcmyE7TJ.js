import { d as resolveThreadSessionKeys, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { l as normalizeMessageChannel } from "./message-channel-BliByQBl.js";
import { $y as resolveExecApprovalCommandDisplay, Bg as normalizeTelegramMessagingTarget, C as monitorTelegramProvider, G_ as listTelegramAccountIds, Hb as defineChannelPluginEntry, Ix as createAllowlistProviderRouteAllowlistWarningCollector, Lg as parseTelegramReplyToMessageId, O as buildTelegramExecApprovalButtons, Qg as resolveTelegramGroupToolPolicy, Rg as parseTelegramThreadId, Rh as sendTelegramPayloadMessages, S as probeTelegram, Vb as createChatChannelPlugin, Y_ as resolveTelegramAccount, Yy as buildExecApprovalPendingReplyPayload, Zg as resolveTelegramGroupRequireMention, Zh as sendTypingTelegram, b_ as buildTelegramGroupPeerId, d_ as parseTelegramTarget, fu as parseTelegramTopicConversation, h_ as listTelegramDirectoryPeersFromConfig, i_ as resolveTelegramExecApprovalTarget, m_ as listTelegramDirectoryGroupsFromConfig, n_ as isTelegramExecApprovalClientEnabled, wh as collectTelegramStatusIssues, zg as looksLikeTelegramTargetId } from "./pi-embedded-CbCYZxIb.js";
import { n as buildOutboundBaseSessionKey, t as normalizeOutboundThreadId } from "./routing-zOQ0wwtV.js";
import { r as resolveOutboundSendDep } from "./outbound-runtime-m-y0nd6F.js";
import { t as clearAccountEntryFields } from "./channel-plugin-common-ClptUZHU.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-CO3iC4WE.js";
import { l as createComputedAccountStatusAdapter, o as buildTokenChannelStatusSummary, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { t as attachChannelToResult } from "./channel-send-result-DDWpviAF.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-BrG9NqjP.js";
import { p as createChannelDirectoryAdapter } from "./directory-runtime-D9Y42mW-.js";
import { a as resolveConfiguredFromCredentialStatuses, r as projectCredentialSnapshotFields } from "./account-snapshot-fields-QM0tdgga.js";
import { n as collectTelegramUnmentionedGroupIds, t as auditTelegramGroupMembership } from "./audit-BI48Fi3j.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
import { c as createNestedAllowlistOverrideResolver, n as buildDmGroupAccountAllowlistAdapter } from "./allowlist-config-edit-DBeLbvpH.js";
import { a as telegramSetupWizard, i as telegramConfigAdapter, n as findTelegramTokenOwnerAccountId, o as telegramSetupAdapter, r as formatDuplicateTelegramTokenReason, t as createTelegramPluginBase } from "./shared-BfUjqgSp.js";
//#region extensions/telegram/src/runtime.ts
const { setRuntime: setTelegramRuntime, getRuntime: getTelegramRuntime } = createPluginRuntimeStore("Telegram runtime not initialized");
//#endregion
//#region extensions/telegram/src/channel.ts
function buildTelegramSendOptions(params) {
	return {
		verbose: false,
		cfg: params.cfg,
		...params.mediaUrl ? { mediaUrl: params.mediaUrl } : {},
		...params.mediaLocalRoots?.length ? { mediaLocalRoots: params.mediaLocalRoots } : {},
		messageThreadId: parseTelegramThreadId(params.threadId),
		replyToMessageId: parseTelegramReplyToMessageId(params.replyToId),
		accountId: params.accountId ?? void 0,
		silent: params.silent ?? void 0,
		forceDocument: params.forceDocument ?? void 0
	};
}
async function sendTelegramOutbound(params) {
	return await (resolveOutboundSendDep(params.deps, "telegram") ?? getTelegramRuntime().channel.telegram.sendMessageTelegram)(params.to, params.text, buildTelegramSendOptions({
		cfg: params.cfg,
		mediaUrl: params.mediaUrl,
		mediaLocalRoots: params.mediaLocalRoots,
		accountId: params.accountId,
		replyToId: params.replyToId,
		threadId: params.threadId,
		silent: params.silent
	}));
}
function resolveTelegramAutoThreadId(params) {
	const context = params.toolContext;
	if (!context?.currentThreadTs || !context.currentChannelId) return;
	const parsedTo = parseTelegramTarget(params.to);
	const parsedChannel = parseTelegramTarget(context.currentChannelId);
	if (parsedTo.chatId.toLowerCase() !== parsedChannel.chatId.toLowerCase()) return;
	return context.currentThreadTs;
}
function normalizeTelegramAcpConversationId(conversationId) {
	const parsed = parseTelegramTopicConversation({ conversationId });
	if (!parsed || !parsed.chatId.startsWith("-")) return null;
	return {
		conversationId: parsed.canonicalConversationId,
		parentConversationId: parsed.chatId
	};
}
function matchTelegramAcpConversation(params) {
	const binding = normalizeTelegramAcpConversationId(params.bindingConversationId);
	if (!binding) return null;
	const incoming = parseTelegramTopicConversation({
		conversationId: params.conversationId,
		parentConversationId: params.parentConversationId
	});
	if (!incoming || !incoming.chatId.startsWith("-")) return null;
	if (binding.conversationId !== incoming.canonicalConversationId) return null;
	return {
		conversationId: incoming.canonicalConversationId,
		parentConversationId: incoming.chatId,
		matchPriority: 2
	};
}
function parseTelegramExplicitTarget(raw) {
	const target = parseTelegramTarget(raw);
	return {
		to: target.chatId,
		threadId: target.messageThreadId,
		chatType: target.chatType === "unknown" ? void 0 : target.chatType
	};
}
function buildTelegramBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "telegram"
	});
}
function resolveTelegramOutboundSessionRoute(params) {
	const parsed = parseTelegramTarget(params.target);
	const chatId = parsed.chatId.trim();
	if (!chatId) return null;
	const fallbackThreadId = normalizeOutboundThreadId(params.threadId);
	const resolvedThreadId = parsed.messageThreadId ?? parseTelegramThreadId(fallbackThreadId);
	const isGroup = parsed.chatType === "group" || parsed.chatType === "unknown" && params.resolvedTarget?.kind && params.resolvedTarget.kind !== "user";
	const peerId = isGroup && resolvedThreadId ? buildTelegramGroupPeerId(chatId, resolvedThreadId) : chatId;
	const peer = {
		kind: isGroup ? "group" : "direct",
		id: peerId
	};
	const baseSessionKey = buildTelegramBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		accountId: params.accountId,
		peer
	});
	return {
		sessionKey: (resolvedThreadId && !isGroup ? resolveThreadSessionKeys({
			baseSessionKey,
			threadId: String(resolvedThreadId)
		}) : null)?.sessionKey ?? baseSessionKey,
		baseSessionKey,
		peer,
		chatType: isGroup ? "group" : "direct",
		from: isGroup ? `telegram:group:${peerId}` : resolvedThreadId ? `telegram:${chatId}:topic:${resolvedThreadId}` : `telegram:${chatId}`,
		to: `telegram:${chatId}`,
		threadId: resolvedThreadId
	};
}
function hasTelegramExecApprovalDmRoute(cfg) {
	return listTelegramAccountIds(cfg).some((accountId) => {
		if (!isTelegramExecApprovalClientEnabled({
			cfg,
			accountId
		})) return false;
		const target = resolveTelegramExecApprovalTarget({
			cfg,
			accountId
		});
		return target === "dm" || target === "both";
	});
}
const telegramMessageActions = {
	describeMessageTool: (ctx) => getTelegramRuntime().channel.telegram.messageActions?.describeMessageTool?.(ctx) ?? null,
	extractToolSend: (ctx) => getTelegramRuntime().channel.telegram.messageActions?.extractToolSend?.(ctx) ?? null,
	handleAction: async (ctx) => {
		const ma = getTelegramRuntime().channel.telegram.messageActions;
		if (!ma?.handleAction) throw new Error("Telegram message actions not available");
		return ma.handleAction(ctx);
	}
};
const resolveTelegramAllowlistGroupOverrides = createNestedAllowlistOverrideResolver({
	resolveRecord: (account) => account.config.groups,
	outerLabel: (groupId) => groupId,
	resolveOuterEntries: (groupCfg) => groupCfg?.allowFrom,
	resolveChildren: (groupCfg) => groupCfg?.topics,
	innerLabel: (groupId, topicId) => `${groupId} topic ${topicId}`,
	resolveInnerEntries: (topicCfg) => topicCfg?.allowFrom
});
const collectTelegramSecurityWarnings = createAllowlistProviderRouteAllowlistWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.telegram !== void 0,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	resolveRouteAllowlistConfigured: (account) => Boolean(account.config.groups) && Object.keys(account.config.groups ?? {}).length > 0,
	restrictSenders: {
		surface: "Telegram groups",
		openScope: "any member in allowed groups",
		groupPolicyPath: "channels.telegram.groupPolicy",
		groupAllowFromPath: "channels.telegram.groupAllowFrom"
	},
	noRouteAllowlist: {
		surface: "Telegram groups",
		routeAllowlistPath: "channels.telegram.groups",
		routeScope: "group",
		groupPolicyPath: "channels.telegram.groupPolicy",
		groupAllowFromPath: "channels.telegram.groupAllowFrom"
	}
});
const telegramPlugin = createChatChannelPlugin({
	base: {
		...createTelegramPluginBase({
			setupWizard: telegramSetupWizard,
			setup: telegramSetupAdapter
		}),
		allowlist: buildDmGroupAccountAllowlistAdapter({
			channelId: "telegram",
			resolveAccount: resolveTelegramAccount,
			normalize: ({ cfg, accountId, values }) => telegramConfigAdapter.formatAllowFrom({
				cfg,
				accountId,
				allowFrom: values
			}),
			resolveDmAllowFrom: (account) => account.config.allowFrom,
			resolveGroupAllowFrom: (account) => account.config.groupAllowFrom,
			resolveDmPolicy: (account) => account.config.dmPolicy,
			resolveGroupPolicy: (account) => account.config.groupPolicy,
			resolveGroupOverrides: resolveTelegramAllowlistGroupOverrides
		}),
		bindings: {
			compileConfiguredBinding: ({ conversationId }) => normalizeTelegramAcpConversationId(conversationId),
			matchInboundConversation: ({ compiledBinding, conversationId, parentConversationId }) => matchTelegramAcpConversation({
				bindingConversationId: compiledBinding.conversationId,
				conversationId,
				parentConversationId
			})
		},
		groups: {
			resolveRequireMention: resolveTelegramGroupRequireMention,
			resolveToolPolicy: resolveTelegramGroupToolPolicy
		},
		messaging: {
			normalizeTarget: normalizeTelegramMessagingTarget,
			parseExplicitTarget: ({ raw }) => parseTelegramExplicitTarget(raw),
			inferTargetChatType: ({ to }) => parseTelegramExplicitTarget(to).chatType,
			formatTargetDisplay: ({ target, display, kind }) => {
				const formatted = display?.trim();
				if (formatted) return formatted;
				const trimmedTarget = target.trim();
				if (!trimmedTarget) return trimmedTarget;
				const withoutProvider = trimmedTarget.replace(/^(telegram|tg):/i, "");
				if (kind === "user" || /^user:/i.test(withoutProvider)) return `@${withoutProvider.replace(/^user:/i, "")}`;
				if (/^channel:/i.test(withoutProvider)) return `#${withoutProvider.replace(/^channel:/i, "")}`;
				return withoutProvider;
			},
			resolveOutboundSessionRoute: (params) => resolveTelegramOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: looksLikeTelegramTargetId,
				hint: "<chatId>"
			}
		},
		lifecycle: {
			onAccountConfigChanged: async ({ prevCfg, nextCfg, accountId }) => {
				if (resolveTelegramAccount({
					cfg: prevCfg,
					accountId
				}).token.trim() !== resolveTelegramAccount({
					cfg: nextCfg,
					accountId
				}).token.trim()) {
					const { deleteTelegramUpdateOffset } = await import("./update-offset-store-DJ42eQp-.js");
					await deleteTelegramUpdateOffset({ accountId });
				}
			},
			onAccountRemoved: async ({ accountId }) => {
				const { deleteTelegramUpdateOffset } = await import("./update-offset-store-DJ42eQp-.js");
				await deleteTelegramUpdateOffset({ accountId });
			}
		},
		execApprovals: {
			getInitiatingSurfaceState: ({ cfg, accountId }) => isTelegramExecApprovalClientEnabled({
				cfg,
				accountId
			}) ? { kind: "enabled" } : { kind: "disabled" },
			hasConfiguredDmRoute: ({ cfg }) => hasTelegramExecApprovalDmRoute(cfg),
			shouldSuppressForwardingFallback: ({ cfg, target, request }) => {
				if ((normalizeMessageChannel(target.channel) ?? target.channel) !== "telegram") return false;
				if (normalizeMessageChannel(request.request.turnSourceChannel ?? "") !== "telegram") return false;
				return isTelegramExecApprovalClientEnabled({
					cfg,
					accountId: target.accountId?.trim() || request.request.turnSourceAccountId?.trim()
				});
			},
			buildPendingPayload: ({ request, nowMs }) => {
				const payload = buildExecApprovalPendingReplyPayload({
					approvalId: request.id,
					approvalSlug: request.id.slice(0, 8),
					approvalCommandId: request.id,
					command: resolveExecApprovalCommandDisplay(request.request).commandText,
					cwd: request.request.cwd ?? void 0,
					host: request.request.host === "node" ? "node" : "gateway",
					nodeId: request.request.nodeId ?? void 0,
					expiresAtMs: request.expiresAtMs,
					nowMs
				});
				const buttons = buildTelegramExecApprovalButtons(request.id);
				if (!buttons) return payload;
				return {
					...payload,
					channelData: {
						...payload.channelData,
						telegram: { buttons }
					}
				};
			},
			beforeDeliverPending: async ({ cfg, target, payload }) => {
				if (!(payload.channelData && typeof payload.channelData === "object" && !Array.isArray(payload.channelData) && payload.channelData.execApproval)) return;
				const threadId = typeof target.threadId === "number" ? target.threadId : typeof target.threadId === "string" ? Number.parseInt(target.threadId, 10) : void 0;
				await sendTypingTelegram(target.to, {
					cfg,
					accountId: target.accountId ?? void 0,
					...Number.isFinite(threadId) ? { messageThreadId: threadId } : {}
				}).catch(() => {});
			}
		},
		directory: createChannelDirectoryAdapter({
			listPeers: async (params) => listTelegramDirectoryPeersFromConfig(params),
			listGroups: async (params) => listTelegramDirectoryGroupsFromConfig(params)
		}),
		actions: telegramMessageActions,
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			collectStatusIssues: collectTelegramStatusIssues,
			buildChannelSummary: ({ snapshot }) => buildTokenChannelStatusSummary(snapshot),
			probeAccount: async ({ account, timeoutMs }) => probeTelegram(account.token, timeoutMs, {
				accountId: account.accountId,
				proxyUrl: account.config.proxy,
				network: account.config.network,
				apiRoot: account.config.apiRoot
			}),
			formatCapabilitiesProbe: ({ probe }) => {
				const lines = [];
				if (probe?.bot?.username) {
					const botId = probe.bot.id ? ` (${probe.bot.id})` : "";
					lines.push({ text: `Bot: @${probe.bot.username}${botId}` });
				}
				const flags = [];
				if (typeof probe?.bot?.canJoinGroups === "boolean") flags.push(`joinGroups=${probe.bot.canJoinGroups}`);
				if (typeof probe?.bot?.canReadAllGroupMessages === "boolean") flags.push(`readAllGroupMessages=${probe.bot.canReadAllGroupMessages}`);
				if (typeof probe?.bot?.supportsInlineQueries === "boolean") flags.push(`inlineQueries=${probe.bot.supportsInlineQueries}`);
				if (flags.length > 0) lines.push({ text: `Flags: ${flags.join(" ")}` });
				if (probe?.webhook?.url !== void 0) lines.push({ text: `Webhook: ${probe.webhook.url || "none"}` });
				return lines;
			},
			auditAccount: async ({ account, timeoutMs, probe, cfg }) => {
				const { groupIds, unresolvedGroups, hasWildcardUnmentionedGroups } = collectTelegramUnmentionedGroupIds(cfg.channels?.telegram?.accounts?.[account.accountId]?.groups ?? cfg.channels?.telegram?.groups);
				if (!groupIds.length && unresolvedGroups === 0 && !hasWildcardUnmentionedGroups) return;
				const botId = probe?.ok && probe.bot?.id != null ? probe.bot.id : null;
				if (!botId) return {
					ok: unresolvedGroups === 0 && !hasWildcardUnmentionedGroups,
					checkedGroups: 0,
					unresolvedGroups,
					hasWildcardUnmentionedGroups,
					groups: [],
					elapsedMs: 0
				};
				return {
					...await auditTelegramGroupMembership({
						token: account.token,
						botId,
						groupIds,
						proxyUrl: account.config.proxy,
						network: account.config.network,
						apiRoot: account.config.apiRoot,
						timeoutMs
					}),
					unresolvedGroups,
					hasWildcardUnmentionedGroups
				};
			},
			resolveAccountSnapshot: ({ account, cfg, runtime, audit }) => {
				const configuredFromStatus = resolveConfiguredFromCredentialStatuses(account);
				const ownerAccountId = findTelegramTokenOwnerAccountId({
					cfg,
					accountId: account.accountId
				});
				const duplicateTokenReason = ownerAccountId ? formatDuplicateTelegramTokenReason({
					accountId: account.accountId,
					ownerAccountId
				}) : null;
				const configured = (configuredFromStatus ?? Boolean(account.token?.trim())) && !ownerAccountId;
				const groups = cfg.channels?.telegram?.accounts?.[account.accountId]?.groups ?? cfg.channels?.telegram?.groups;
				const allowUnmentionedGroups = groups?.["*"]?.requireMention === false || Object.entries(groups ?? {}).some(([key, value]) => key !== "*" && value?.requireMention === false);
				return {
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured,
					extra: {
						...projectCredentialSnapshotFields(account),
						lastError: runtime?.lastError ?? duplicateTokenReason,
						mode: runtime?.mode ?? (account.config.webhookUrl ? "webhook" : "polling"),
						audit,
						allowUnmentionedGroups
					}
				};
			}
		}),
		gateway: {
			startAccount: async (ctx) => {
				const account = ctx.account;
				const ownerAccountId = findTelegramTokenOwnerAccountId({
					cfg: ctx.cfg,
					accountId: account.accountId
				});
				if (ownerAccountId) {
					const reason = formatDuplicateTelegramTokenReason({
						accountId: account.accountId,
						ownerAccountId
					});
					ctx.log?.error?.(`[${account.accountId}] ${reason}`);
					throw new Error(reason);
				}
				const token = (account.token ?? "").trim();
				let telegramBotLabel = "";
				try {
					const probe = await probeTelegram(token, 2500, {
						accountId: account.accountId,
						proxyUrl: account.config.proxy,
						network: account.config.network,
						apiRoot: account.config.apiRoot
					});
					const username = probe.ok ? probe.bot?.username?.trim() : null;
					if (username) telegramBotLabel = ` (@${username})`;
				} catch (err) {
					if (getTelegramRuntime().logging.shouldLogVerbose()) ctx.log?.debug?.(`[${account.accountId}] bot probe failed: ${String(err)}`);
				}
				ctx.log?.info(`[${account.accountId}] starting provider${telegramBotLabel}`);
				return monitorTelegramProvider({
					token,
					accountId: account.accountId,
					config: ctx.cfg,
					runtime: ctx.runtime,
					abortSignal: ctx.abortSignal,
					useWebhook: Boolean(account.config.webhookUrl),
					webhookUrl: account.config.webhookUrl,
					webhookSecret: account.config.webhookSecret,
					webhookPath: account.config.webhookPath,
					webhookHost: account.config.webhookHost,
					webhookPort: account.config.webhookPort,
					webhookCertPath: account.config.webhookCertPath
				});
			},
			logoutAccount: async ({ accountId, cfg }) => {
				const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
				const nextCfg = { ...cfg };
				const nextTelegram = cfg.channels?.telegram ? { ...cfg.channels.telegram } : void 0;
				let cleared = false;
				let changed = false;
				if (nextTelegram) {
					if (accountId === "default" && nextTelegram.botToken) {
						delete nextTelegram.botToken;
						cleared = true;
						changed = true;
					}
					const accountCleanup = clearAccountEntryFields({
						accounts: nextTelegram.accounts,
						accountId,
						fields: ["botToken"]
					});
					if (accountCleanup.changed) {
						changed = true;
						if (accountCleanup.cleared) cleared = true;
						if (accountCleanup.nextAccounts) nextTelegram.accounts = accountCleanup.nextAccounts;
						else delete nextTelegram.accounts;
					}
				}
				if (changed) if (nextTelegram && Object.keys(nextTelegram).length > 0) nextCfg.channels = {
					...nextCfg.channels,
					telegram: nextTelegram
				};
				else {
					const nextChannels = { ...nextCfg.channels };
					delete nextChannels.telegram;
					if (Object.keys(nextChannels).length > 0) nextCfg.channels = nextChannels;
					else delete nextCfg.channels;
				}
				const loggedOut = resolveTelegramAccount({
					cfg: changed ? nextCfg : cfg,
					accountId
				}).tokenSource === "none";
				if (changed) await getTelegramRuntime().config.writeConfigFile(nextCfg);
				return {
					cleared,
					envToken: Boolean(envToken),
					loggedOut
				};
			}
		}
	},
	pairing: { text: {
		idLabel: "telegramUserId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^(telegram|tg):/i),
		notify: async ({ cfg, id, message }) => {
			const { token } = getTelegramRuntime().channel.telegram.resolveTelegramToken(cfg);
			if (!token) throw new Error("telegram token not configured");
			await getTelegramRuntime().channel.telegram.sendMessageTelegram(id, message, { token });
		}
	} },
	security: {
		dm: {
			channelKey: "telegram",
			resolvePolicy: (account) => account.config.dmPolicy,
			resolveAllowFrom: (account) => account.config.allowFrom,
			policyPathSuffix: "dmPolicy",
			normalizeEntry: (raw) => raw.replace(/^(telegram|tg):/i, "")
		},
		collectWarnings: collectTelegramSecurityWarnings
	},
	threading: {
		topLevelReplyToMode: "telegram",
		resolveAutoThreadId: ({ to, toolContext, replyToId }) => replyToId ? void 0 : resolveTelegramAutoThreadId({
			to,
			toolContext
		})
	},
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: (text, limit) => getTelegramRuntime().channel.text.chunkMarkdownText(text, limit),
			chunkerMode: "markdown",
			textChunkLimit: 4e3,
			pollMaxOptions: 10,
			shouldSkipPlainTextSanitization: ({ payload }) => Boolean(payload.channelData),
			resolveEffectiveTextChunkLimit: ({ fallbackLimit }) => typeof fallbackLimit === "number" ? Math.min(fallbackLimit, 4096) : 4096,
			sendPayload: async ({ cfg, to, payload, mediaLocalRoots, accountId, deps, replyToId, threadId, silent, forceDocument }) => {
				return attachChannelToResult("telegram", await sendTelegramPayloadMessages({
					send: resolveOutboundSendDep(deps, "telegram") ?? getTelegramRuntime().channel.telegram.sendMessageTelegram,
					to,
					payload,
					baseOpts: buildTelegramSendOptions({
						cfg,
						mediaLocalRoots,
						accountId,
						replyToId,
						threadId,
						silent,
						forceDocument
					})
				}));
			}
		},
		attachedResults: {
			channel: "telegram",
			sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, silent }) => await sendTelegramOutbound({
				cfg,
				to,
				text,
				accountId,
				deps,
				replyToId,
				threadId,
				silent
			}),
			sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId, threadId, silent }) => await sendTelegramOutbound({
				cfg,
				to,
				text,
				mediaUrl,
				mediaLocalRoots,
				accountId,
				deps,
				replyToId,
				threadId,
				silent
			}),
			sendPoll: async ({ cfg, to, poll, accountId, threadId, silent, isAnonymous }) => await getTelegramRuntime().channel.telegram.sendPollTelegram(to, poll, {
				cfg,
				accountId: accountId ?? void 0,
				messageThreadId: parseTelegramThreadId(threadId),
				silent: silent ?? void 0,
				isAnonymous: isAnonymous ?? void 0
			})
		}
	}
});
//#endregion
//#region extensions/telegram/index.ts
var telegram_default = defineChannelPluginEntry({
	id: "telegram",
	name: "Telegram",
	description: "Telegram channel plugin",
	plugin: telegramPlugin,
	setRuntime: setTelegramRuntime
});
//#endregion
export { telegramPlugin as n, setTelegramRuntime as r, telegram_default as t };
