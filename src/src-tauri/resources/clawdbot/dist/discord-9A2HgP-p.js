import { d as resolveThreadSessionKeys, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { r as getChatChannelMeta } from "./registry-C5UkPpaO.js";
import { l as normalizeMessageChannel } from "./message-channel-BliByQBl.js";
import { $t as collectDiscordStatusIssues, Hb as defineChannelPluginEntry, JS as listDiscordAccountIds, QS as resolveDiscordAccount, Qy as getExecApprovalReplyMetadata, Vb as createChatChannelPlugin, an as resolveDiscordGroupToolPolicy, ex as createScopedDmSecurityResolver, fi as Separator, ii as fetchChannelPermissionsDiscord, in as resolveDiscordGroupRequireMention, jr as parseDiscordTarget, nn as normalizeDiscordMessagingTarget, on as listDiscordDirectoryGroupsFromConfig, pi as TextDisplay, rn as normalizeDiscordOutboundTarget, sn as listDiscordDirectoryPeersFromConfig, tn as looksLikeDiscordTargetId, zx as createOpenProviderConfiguredRouteWarningCollector } from "./pi-embedded-CbCYZxIb.js";
import { n as buildOutboundBaseSessionKey, t as normalizeOutboundThreadId } from "./routing-zOQ0wwtV.js";
import { r as resolveOutboundSendDep } from "./outbound-runtime-m-y0nd6F.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-CO3iC4WE.js";
import { l as createComputedAccountStatusAdapter, o as buildTokenChannelStatusSummary, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-BrG9NqjP.js";
import { t as createRuntimeDirectoryLiveAdapter } from "./runtime-forwarders-Cv9Bdwov.js";
import { p as createChannelDirectoryAdapter } from "./directory-runtime-D9Y42mW-.js";
import { a as resolveConfiguredFromCredentialStatuses, r as projectCredentialSnapshotFields } from "./account-snapshot-fields-QM0tdgga.js";
import { n as resolveTargetsWithOptionalToken } from "./channel-targets-IU5H6m6L.js";
import { n as collectDiscordAuditChannelIds, t as auditDiscordChannelPermissions } from "./audit-86GvYypd.js";
import { n as listThreadBindingsBySessionKey, s as unbindThreadBindingsBySessionKey, t as autoBindSpawnedDiscordSubagent } from "./thread-bindings-neFAVWsT.js";
import { a as probeDiscord, t as DiscordUiContainer } from "./ui-BU9Tv965.js";
import { t as resolveDiscordUserAllowlist } from "./resolve-users-D9S1NRZ1.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
import { c as createNestedAllowlistOverrideResolver, o as createAccountScopedAllowlistNameResolver, r as buildLegacyDmAccountAllowlistAdapter } from "./allowlist-config-edit-DBeLbvpH.js";
import { r as discordSetupAdapter } from "./setup-core-BcW9GMrI.js";
import { n as discordConfigAdapter, t as createDiscordPluginBase } from "./shared-DTaF-SKX.js";
//#region extensions/discord/src/exec-approvals.ts
function isDiscordExecApprovalClientEnabled(params) {
	const config = resolveDiscordAccount(params).config.execApprovals;
	return Boolean(config?.enabled && (config.approvers?.length ?? 0) > 0);
}
function shouldSuppressLocalDiscordExecApprovalPrompt(params) {
	return isDiscordExecApprovalClientEnabled(params) && getExecApprovalReplyMetadata(params.payload) !== null;
}
//#endregion
//#region extensions/discord/src/runtime.ts
const { setRuntime: setDiscordRuntime, getRuntime: getDiscordRuntime } = createPluginRuntimeStore("Discord runtime not initialized");
//#endregion
//#region extensions/discord/src/channel.ts
let discordProviderRuntimePromise;
async function loadDiscordProviderRuntime() {
	discordProviderRuntimePromise ??= import("./provider.runtime-CuzBkzxW.js");
	return await discordProviderRuntimePromise;
}
getChatChannelMeta("discord");
const REQUIRED_DISCORD_PERMISSIONS = ["ViewChannel", "SendMessages"];
const resolveDiscordDmPolicy = createScopedDmSecurityResolver({
	channelKey: "discord",
	resolvePolicy: (account) => account.config.dm?.policy,
	resolveAllowFrom: (account) => account.config.dm?.allowFrom,
	allowFromPathSuffix: "dm.",
	normalizeEntry: (raw) => raw.trim().replace(/^(discord|user):/i, "").replace(/^<@!?(\d+)>$/, "$1")
});
function formatDiscordIntents(intents) {
	if (!intents) return "unknown";
	return [
		`messageContent=${intents.messageContent ?? "unknown"}`,
		`guildMembers=${intents.guildMembers ?? "unknown"}`,
		`presence=${intents.presence ?? "unknown"}`
	].join(" ");
}
const discordMessageActions = {
	describeMessageTool: (ctx) => getDiscordRuntime().channel.discord.messageActions?.describeMessageTool?.(ctx) ?? null,
	extractToolSend: (ctx) => getDiscordRuntime().channel.discord.messageActions?.extractToolSend?.(ctx) ?? null,
	handleAction: async (ctx) => {
		const ma = getDiscordRuntime().channel.discord.messageActions;
		if (!ma?.handleAction) throw new Error("Discord message actions not available");
		return ma.handleAction(ctx);
	},
	requiresTrustedRequesterSender: ({ action, toolContext }) => Boolean(toolContext && (action === "timeout" || action === "kick" || action === "ban"))
};
function buildDiscordCrossContextComponents(params) {
	const trimmed = params.message.trim();
	const components = [];
	if (trimmed) {
		components.push(new TextDisplay(params.message));
		components.push(new Separator({
			divider: true,
			spacing: "small"
		}));
	}
	components.push(new TextDisplay(`*From ${params.originLabel}*`));
	return [new DiscordUiContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		components
	})];
}
function hasDiscordExecApprovalDmRoute(cfg) {
	return listDiscordAccountIds(cfg).some((accountId) => {
		const execApprovals = resolveDiscordAccount({
			cfg,
			accountId
		}).config.execApprovals;
		if (!execApprovals?.enabled || (execApprovals.approvers?.length ?? 0) === 0) return false;
		const target = execApprovals.target ?? "dm";
		return target === "dm" || target === "both";
	});
}
const resolveDiscordAllowlistGroupOverrides = createNestedAllowlistOverrideResolver({
	resolveRecord: (account) => account.config.guilds,
	outerLabel: (guildKey) => `guild ${guildKey}`,
	resolveOuterEntries: (guildCfg) => guildCfg?.users,
	resolveChildren: (guildCfg) => guildCfg?.channels,
	innerLabel: (guildKey, channelKey) => `guild ${guildKey} / channel ${channelKey}`,
	resolveInnerEntries: (channelCfg) => channelCfg?.users
});
const resolveDiscordAllowlistNames = createAccountScopedAllowlistNameResolver({
	resolveAccount: resolveDiscordAccount,
	resolveToken: (account) => account.token,
	resolveNames: ({ token, entries }) => resolveDiscordUserAllowlist({
		token,
		entries
	})
});
const collectDiscordSecurityWarnings = createOpenProviderConfiguredRouteWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.discord !== void 0,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	resolveRouteAllowlistConfigured: (account) => Object.keys(account.config.guilds ?? {}).length > 0,
	configureRouteAllowlist: {
		surface: "Discord guilds",
		openScope: "any channel not explicitly denied",
		groupPolicyPath: "channels.discord.groupPolicy",
		routeAllowlistPath: "channels.discord.guilds.<id>.channels"
	},
	missingRouteAllowlist: {
		surface: "Discord guilds",
		openBehavior: "with no guild/channel allowlist; any channel can trigger (mention-gated)",
		remediation: "Set channels.discord.groupPolicy=\"allowlist\" and configure channels.discord.guilds.<id>.channels"
	}
});
function normalizeDiscordAcpConversationId(conversationId) {
	const normalized = conversationId.trim();
	return normalized ? { conversationId: normalized } : null;
}
function matchDiscordAcpConversation(params) {
	if (params.bindingConversationId === params.conversationId) return {
		conversationId: params.conversationId,
		matchPriority: 2
	};
	if (params.parentConversationId && params.parentConversationId !== params.conversationId && params.bindingConversationId === params.parentConversationId) return {
		conversationId: params.parentConversationId,
		matchPriority: 1
	};
	return null;
}
function parseDiscordExplicitTarget(raw) {
	try {
		const target = parseDiscordTarget(raw, { defaultKind: "channel" });
		if (!target) return null;
		return {
			to: target.id,
			chatType: target.kind === "user" ? "direct" : "channel"
		};
	} catch {
		return null;
	}
}
function buildDiscordBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "discord"
	});
}
function resolveDiscordOutboundTargetKindHint(params) {
	const resolvedKind = params.resolvedTarget?.kind;
	if (resolvedKind === "user") return "user";
	if (resolvedKind === "group" || resolvedKind === "channel") return "channel";
	const target = params.target.trim();
	if (/^channel:/i.test(target)) return "channel";
	if (/^(user:|discord:|@|<@!?)/i.test(target)) return "user";
}
function resolveDiscordOutboundSessionRoute(params) {
	const parsed = parseDiscordTarget(params.target, { defaultKind: resolveDiscordOutboundTargetKindHint(params) });
	if (!parsed) return null;
	const isDm = parsed.kind === "user";
	const peer = {
		kind: isDm ? "direct" : "channel",
		id: parsed.id
	};
	const baseSessionKey = buildDiscordBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		accountId: params.accountId,
		peer
	});
	const explicitThreadId = normalizeOutboundThreadId(params.threadId);
	return {
		sessionKey: resolveThreadSessionKeys({
			baseSessionKey,
			threadId: explicitThreadId ?? normalizeOutboundThreadId(params.replyToId),
			useSuffix: false
		}).sessionKey,
		baseSessionKey,
		peer,
		chatType: isDm ? "direct" : "channel",
		from: isDm ? `discord:${parsed.id}` : `discord:channel:${parsed.id}`,
		to: isDm ? `user:${parsed.id}` : `channel:${parsed.id}`,
		threadId: explicitThreadId ?? void 0
	};
}
const discordPlugin = createChatChannelPlugin({
	base: {
		...createDiscordPluginBase({ setup: discordSetupAdapter }),
		allowlist: {
			...buildLegacyDmAccountAllowlistAdapter({
				channelId: "discord",
				resolveAccount: resolveDiscordAccount,
				normalize: ({ cfg, accountId, values }) => discordConfigAdapter.formatAllowFrom({
					cfg,
					accountId,
					allowFrom: values
				}),
				resolveDmAllowFrom: (account) => account.config.allowFrom ?? account.config.dm?.allowFrom,
				resolveGroupPolicy: (account) => account.config.groupPolicy,
				resolveGroupOverrides: resolveDiscordAllowlistGroupOverrides
			}),
			resolveNames: resolveDiscordAllowlistNames
		},
		groups: {
			resolveRequireMention: resolveDiscordGroupRequireMention,
			resolveToolPolicy: resolveDiscordGroupToolPolicy
		},
		mentions: { stripPatterns: () => ["<@!?\\d+>"] },
		agentPrompt: { messageToolHints: () => ["- Discord components: set `components` when sending messages to include buttons, selects, or v2 containers.", "- Forms: add `components.modal` (title, fields). OpenClaw adds a trigger button and routes submissions as new messages."] },
		messaging: {
			normalizeTarget: normalizeDiscordMessagingTarget,
			resolveSessionTarget: ({ id }) => normalizeDiscordMessagingTarget(`channel:${id}`),
			parseExplicitTarget: ({ raw }) => parseDiscordExplicitTarget(raw),
			inferTargetChatType: ({ to }) => parseDiscordExplicitTarget(to)?.chatType,
			buildCrossContextComponents: buildDiscordCrossContextComponents,
			resolveOutboundSessionRoute: (params) => resolveDiscordOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: looksLikeDiscordTargetId,
				hint: "<channelId|user:ID|channel:ID>"
			}
		},
		execApprovals: {
			getInitiatingSurfaceState: ({ cfg, accountId }) => isDiscordExecApprovalClientEnabled({
				cfg,
				accountId
			}) ? { kind: "enabled" } : { kind: "disabled" },
			shouldSuppressLocalPrompt: ({ cfg, accountId, payload }) => shouldSuppressLocalDiscordExecApprovalPrompt({
				cfg,
				accountId,
				payload
			}),
			hasConfiguredDmRoute: ({ cfg }) => hasDiscordExecApprovalDmRoute(cfg),
			shouldSuppressForwardingFallback: ({ cfg, target }) => (normalizeMessageChannel(target.channel) ?? target.channel) === "discord" && isDiscordExecApprovalClientEnabled({
				cfg,
				accountId: target.accountId
			})
		},
		directory: createChannelDirectoryAdapter({
			listPeers: async (params) => listDiscordDirectoryPeersFromConfig(params),
			listGroups: async (params) => listDiscordDirectoryGroupsFromConfig(params),
			...createRuntimeDirectoryLiveAdapter({
				getRuntime: () => getDiscordRuntime().channel.discord,
				listPeersLive: (runtime) => runtime.listDirectoryPeersLive,
				listGroupsLive: (runtime) => runtime.listDirectoryGroupsLive
			})
		}),
		resolver: { resolveTargets: async ({ cfg, accountId, inputs, kind }) => {
			const account = resolveDiscordAccount({
				cfg,
				accountId
			});
			if (kind === "group") return resolveTargetsWithOptionalToken({
				token: account.token,
				inputs,
				missingTokenNote: "missing Discord token",
				resolveWithToken: ({ token, inputs }) => getDiscordRuntime().channel.discord.resolveChannelAllowlist({
					token,
					entries: inputs
				}),
				mapResolved: (entry) => ({
					input: entry.input,
					resolved: entry.resolved,
					id: entry.channelId ?? entry.guildId,
					name: entry.channelName ?? entry.guildName ?? (entry.guildId && !entry.channelId ? entry.guildId : void 0),
					note: entry.note
				})
			});
			return resolveTargetsWithOptionalToken({
				token: account.token,
				inputs,
				missingTokenNote: "missing Discord token",
				resolveWithToken: ({ token, inputs }) => getDiscordRuntime().channel.discord.resolveUserAllowlist({
					token,
					entries: inputs
				}),
				mapResolved: (entry) => ({
					input: entry.input,
					resolved: entry.resolved,
					id: entry.id,
					name: entry.name,
					note: entry.note
				})
			});
		} },
		actions: discordMessageActions,
		bindings: {
			compileConfiguredBinding: ({ conversationId }) => normalizeDiscordAcpConversationId(conversationId),
			matchInboundConversation: ({ compiledBinding, conversationId, parentConversationId }) => matchDiscordAcpConversation({
				bindingConversationId: compiledBinding.conversationId,
				conversationId,
				parentConversationId
			})
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID, {
				connected: false,
				reconnectAttempts: 0,
				lastConnectedAt: null,
				lastDisconnect: null,
				lastEventAt: null
			}),
			collectStatusIssues: collectDiscordStatusIssues,
			buildChannelSummary: ({ snapshot }) => buildTokenChannelStatusSummary(snapshot, { includeMode: false }),
			probeAccount: async ({ account, timeoutMs }) => probeDiscord(account.token, timeoutMs, { includeApplication: true }),
			formatCapabilitiesProbe: ({ probe }) => {
				const discordProbe = probe;
				const lines = [];
				if (discordProbe?.bot?.username) {
					const botId = discordProbe.bot.id ? ` (${discordProbe.bot.id})` : "";
					lines.push({ text: `Bot: @${discordProbe.bot.username}${botId}` });
				}
				if (discordProbe?.application?.intents) lines.push({ text: `Intents: ${formatDiscordIntents(discordProbe.application.intents)}` });
				return lines;
			},
			buildCapabilitiesDiagnostics: async ({ account, timeoutMs, target }) => {
				if (!target?.trim()) return;
				const parsedTarget = parseDiscordTarget(target.trim(), { defaultKind: "channel" });
				const details = { target: {
					raw: target,
					normalized: parsedTarget?.normalized,
					kind: parsedTarget?.kind,
					channelId: parsedTarget?.kind === "channel" ? parsedTarget.id : void 0
				} };
				if (!parsedTarget || parsedTarget.kind !== "channel") return {
					details,
					lines: [{
						text: "Permissions: Target looks like a DM user; pass channel:<id> to audit channel permissions.",
						tone: "error"
					}]
				};
				const token = account.token?.trim();
				if (!token) return {
					details,
					lines: [{
						text: "Permissions: Discord bot token missing for permission audit.",
						tone: "error"
					}]
				};
				try {
					const perms = await fetchChannelPermissionsDiscord(parsedTarget.id, {
						token,
						accountId: account.accountId ?? void 0
					});
					const missingRequired = REQUIRED_DISCORD_PERMISSIONS.filter((permission) => !perms.permissions.includes(permission));
					details.permissions = {
						channelId: perms.channelId,
						guildId: perms.guildId,
						isDm: perms.isDm,
						channelType: perms.channelType,
						permissions: perms.permissions,
						missingRequired,
						raw: perms.raw
					};
					return {
						details,
						lines: [{ text: `Permissions (${perms.channelId}): ${perms.permissions.length ? perms.permissions.join(", ") : "none"}` }, missingRequired.length > 0 ? {
							text: `Missing required: ${missingRequired.join(", ")}`,
							tone: "warn"
						} : {
							text: "Missing required: none",
							tone: "success"
						}]
					};
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					details.permissions = {
						channelId: parsedTarget.id,
						error: message
					};
					return {
						details,
						lines: [{
							text: `Permissions: ${message}`,
							tone: "error"
						}]
					};
				}
			},
			auditAccount: async ({ account, timeoutMs, cfg }) => {
				const { channelIds, unresolvedChannels } = collectDiscordAuditChannelIds({
					cfg,
					accountId: account.accountId
				});
				if (!channelIds.length && unresolvedChannels === 0) return;
				const botToken = account.token?.trim();
				if (!botToken) return {
					ok: unresolvedChannels === 0,
					checkedChannels: 0,
					unresolvedChannels,
					channels: [],
					elapsedMs: 0
				};
				return {
					...await auditDiscordChannelPermissions({
						token: botToken,
						accountId: account.accountId,
						channelIds,
						timeoutMs
					}),
					unresolvedChannels
				};
			},
			resolveAccountSnapshot: ({ account, runtime, probe, audit }) => {
				const configured = resolveConfiguredFromCredentialStatuses(account) ?? Boolean(account.token?.trim());
				const app = runtime?.application ?? probe?.application;
				const bot = runtime?.bot ?? probe?.bot;
				return {
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured,
					extra: {
						...projectCredentialSnapshotFields(account),
						connected: runtime?.connected ?? false,
						reconnectAttempts: runtime?.reconnectAttempts,
						lastConnectedAt: runtime?.lastConnectedAt ?? null,
						lastDisconnect: runtime?.lastDisconnect ?? null,
						lastEventAt: runtime?.lastEventAt ?? null,
						application: app ?? void 0,
						bot: bot ?? void 0,
						audit
					}
				};
			}
		}),
		gateway: { startAccount: async (ctx) => {
			const account = ctx.account;
			const token = account.token.trim();
			let discordBotLabel = "";
			try {
				const probe = await probeDiscord(token, 2500, { includeApplication: true });
				const username = probe.ok ? probe.bot?.username?.trim() : null;
				if (username) discordBotLabel = ` (@${username})`;
				ctx.setStatus({
					accountId: account.accountId,
					bot: probe.bot,
					application: probe.application
				});
				const messageContent = probe.application?.intents?.messageContent;
				if (messageContent === "disabled") ctx.log?.warn(`[${account.accountId}] Discord Message Content Intent is disabled; bot may not respond to channel messages. Enable it in Discord Dev Portal (Bot → Privileged Gateway Intents) or require mentions.`);
				else if (messageContent === "limited") ctx.log?.info(`[${account.accountId}] Discord Message Content Intent is limited; bots under 100 servers can use it without verification.`);
			} catch (err) {
				if (getDiscordRuntime().logging.shouldLogVerbose()) ctx.log?.debug?.(`[${account.accountId}] bot probe failed: ${String(err)}`);
			}
			ctx.log?.info(`[${account.accountId}] starting provider${discordBotLabel}`);
			return (await loadDiscordProviderRuntime()).monitorDiscordProvider({
				token,
				accountId: account.accountId,
				config: ctx.cfg,
				runtime: ctx.runtime,
				abortSignal: ctx.abortSignal,
				mediaMaxMb: account.config.mediaMaxMb,
				historyLimit: account.config.historyLimit,
				setStatus: (patch) => ctx.setStatus({
					accountId: account.accountId,
					...patch
				})
			});
		} }
	},
	pairing: { text: {
		idLabel: "discordUserId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^(discord|user):/i),
		notify: async ({ id, message }) => {
			await getDiscordRuntime().channel.discord.sendMessageDiscord(`user:${id}`, message);
		}
	} },
	security: {
		resolveDmPolicy: resolveDiscordDmPolicy,
		collectWarnings: collectDiscordSecurityWarnings
	},
	threading: { topLevelReplyToMode: "discord" },
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: null,
			textChunkLimit: 2e3,
			pollMaxOptions: 10,
			resolveTarget: ({ to }) => normalizeDiscordOutboundTarget(to)
		},
		attachedResults: {
			channel: "discord",
			sendText: async ({ cfg, to, text, accountId, deps, replyToId, silent }) => {
				return await (resolveOutboundSendDep(deps, "discord") ?? getDiscordRuntime().channel.discord.sendMessageDiscord)(to, text, {
					verbose: false,
					cfg,
					replyTo: replyToId ?? void 0,
					accountId: accountId ?? void 0,
					silent: silent ?? void 0
				});
			},
			sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId, silent }) => {
				return await (resolveOutboundSendDep(deps, "discord") ?? getDiscordRuntime().channel.discord.sendMessageDiscord)(to, text, {
					verbose: false,
					cfg,
					mediaUrl,
					mediaLocalRoots,
					replyTo: replyToId ?? void 0,
					accountId: accountId ?? void 0,
					silent: silent ?? void 0
				});
			},
			sendPoll: async ({ cfg, to, poll, accountId, silent }) => await getDiscordRuntime().channel.discord.sendPollDiscord(to, poll, {
				cfg,
				accountId: accountId ?? void 0,
				silent: silent ?? void 0
			})
		}
	}
});
//#endregion
//#region extensions/discord/src/subagent-hooks.ts
function summarizeError(err) {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	return "error";
}
function registerDiscordSubagentHooks(api) {
	const resolveThreadBindingFlags = (accountId) => {
		const account = resolveDiscordAccount({
			cfg: api.config,
			accountId
		});
		const baseThreadBindings = api.config.channels?.discord?.threadBindings;
		const accountThreadBindings = api.config.channels?.discord?.accounts?.[account.accountId]?.threadBindings;
		return {
			enabled: accountThreadBindings?.enabled ?? baseThreadBindings?.enabled ?? api.config.session?.threadBindings?.enabled ?? true,
			spawnSubagentSessions: accountThreadBindings?.spawnSubagentSessions ?? baseThreadBindings?.spawnSubagentSessions ?? false
		};
	};
	api.on("subagent_spawning", async (event) => {
		if (!event.threadRequested) return;
		if (event.requester?.channel?.trim().toLowerCase() !== "discord") return;
		const threadBindingFlags = resolveThreadBindingFlags(event.requester?.accountId);
		if (!threadBindingFlags.enabled) return {
			status: "error",
			error: "Discord thread bindings are disabled (set channels.discord.threadBindings.enabled=true to override for this account, or session.threadBindings.enabled=true globally)."
		};
		if (!threadBindingFlags.spawnSubagentSessions) return {
			status: "error",
			error: "Discord thread-bound subagent spawns are disabled for this account (set channels.discord.threadBindings.spawnSubagentSessions=true to enable)."
		};
		try {
			if (!await autoBindSpawnedDiscordSubagent({
				accountId: event.requester?.accountId,
				channel: event.requester?.channel,
				to: event.requester?.to,
				threadId: event.requester?.threadId,
				childSessionKey: event.childSessionKey,
				agentId: event.agentId,
				label: event.label,
				boundBy: "system"
			})) return {
				status: "error",
				error: "Unable to create or bind a Discord thread for this subagent session. Session mode is unavailable for this target."
			};
			return {
				status: "ok",
				threadBindingReady: true
			};
		} catch (err) {
			return {
				status: "error",
				error: `Discord thread bind failed: ${summarizeError(err)}`
			};
		}
	});
	api.on("subagent_ended", (event) => {
		unbindThreadBindingsBySessionKey({
			targetSessionKey: event.targetSessionKey,
			accountId: event.accountId,
			targetKind: event.targetKind,
			reason: event.reason,
			sendFarewell: event.sendFarewell
		});
	});
	api.on("subagent_delivery_target", (event) => {
		if (!event.expectsCompletionMessage) return;
		if (event.requesterOrigin?.channel?.trim().toLowerCase() !== "discord") return;
		const requesterAccountId = event.requesterOrigin?.accountId?.trim();
		const requesterThreadId = event.requesterOrigin?.threadId != null && event.requesterOrigin.threadId !== "" ? String(event.requesterOrigin.threadId).trim() : "";
		const bindings = listThreadBindingsBySessionKey({
			targetSessionKey: event.childSessionKey,
			...requesterAccountId ? { accountId: requesterAccountId } : {},
			targetKind: "subagent"
		});
		if (bindings.length === 0) return;
		let binding;
		if (requesterThreadId) binding = bindings.find((entry) => {
			if (entry.threadId !== requesterThreadId) return false;
			if (requesterAccountId && entry.accountId !== requesterAccountId) return false;
			return true;
		});
		if (!binding && bindings.length === 1) binding = bindings[0];
		if (!binding) return;
		return { origin: {
			channel: "discord",
			accountId: binding.accountId,
			to: `channel:${binding.threadId}`,
			threadId: binding.threadId
		} };
	});
}
//#endregion
//#region extensions/discord/index.ts
var discord_default = defineChannelPluginEntry({
	id: "discord",
	name: "Discord",
	description: "Discord channel plugin",
	plugin: discordPlugin,
	setRuntime: setDiscordRuntime,
	registerFull: registerDiscordSubagentHooks
});
//#endregion
export { discordPlugin as n, setDiscordRuntime as r, discord_default as t };
