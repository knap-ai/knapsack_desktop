import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { o as MSTeamsConfigSchema } from "./zod-schema.providers-core-COy5nBQ0.js";
import { Db as formatAllowFromLowercase, Gb as stripTargetKindPrefix, Nx as createAllowlistProviderGroupPolicyWarningCollector, Vb as createChatChannelPlugin, Wb as stripChannelTargetPrefix, Wx as projectConfigWarningCollector, tx as createTopLevelChannelConfigAdapter, zb as buildChannelOutboundSessionRoute } from "./pi-embedded-CbCYZxIb.js";
import { n as describeAccountSnapshot } from "./account-helpers-BzkeDMfB.js";
import { n as createMessageToolCardSchema } from "./channel-actions-fV93bLjV.js";
import { r as buildChannelConfigSchema } from "./config-schema-CPzP2Ds6.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-CO3iC4WE.js";
import { i as buildProbeChannelStatusSummary, l as createComputedAccountStatusAdapter, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-BrG9NqjP.js";
import { n as createRuntimeOutboundDelegates, t as createRuntimeDirectoryLiveAdapter } from "./runtime-forwarders-Cv9Bdwov.js";
import { i as createLazyRuntimeNamedExport } from "./lazy-runtime-CPDBPNrj.js";
import { p as createChannelDirectoryAdapter, r as listDirectoryEntriesFromSources } from "./directory-runtime-D9Y42mW-.js";
import { r as resolveMSTeamsGroupToolPolicy } from "./policy--ZkRKoB5.js";
import { s as resolveMSTeamsCredentials } from "./graph-users-DNF3CvPC.js";
import { i as parseMSTeamsTeamChannelInput, n as normalizeMSTeamsUserInput, o as resolveMSTeamsChannelAllowlist, r as parseMSTeamsConversationId, s as resolveMSTeamsUserAllowlist, t as normalizeMSTeamsMessagingTarget } from "./resolve-allowlist-DfxbLfpN.js";
import { t as getMSTeamsRuntime } from "./runtime-DO_BAG1B.js";
import { n as msteamsSetupAdapter, t as msteamsSetupWizard } from "./setup-surface-Bqfg4u0m.js";
//#region extensions/msteams/src/session-route.ts
function resolveMSTeamsOutboundSessionRoute(params) {
	let trimmed = stripChannelTargetPrefix(params.target, "msteams", "teams");
	if (!trimmed) return null;
	const isUser = trimmed.toLowerCase().startsWith("user:");
	const rawId = stripTargetKindPrefix(trimmed);
	if (!rawId) return null;
	const conversationId = rawId.split(";")[0] ?? rawId;
	const isChannel = !isUser && /@thread\.tacv2/i.test(conversationId);
	return buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "msteams",
		accountId: params.accountId,
		peer: {
			kind: isUser ? "direct" : isChannel ? "channel" : "group",
			id: conversationId
		},
		chatType: isUser ? "direct" : isChannel ? "channel" : "group",
		from: isUser ? `msteams:${conversationId}` : isChannel ? `msteams:channel:${conversationId}` : `msteams:group:${conversationId}`,
		to: isUser ? `user:${conversationId}` : `conversation:${conversationId}`
	});
}
//#endregion
//#region extensions/msteams/src/channel.ts
const meta = {
	id: "msteams",
	label: "Microsoft Teams",
	selectionLabel: "Microsoft Teams (Bot Framework)",
	docsPath: "/channels/msteams",
	docsLabel: "msteams",
	blurb: "Bot Framework; enterprise support.",
	aliases: ["teams"],
	order: 60
};
const TEAMS_GRAPH_PERMISSION_HINTS = {
	"ChannelMessage.Read.All": "channel history",
	"Chat.Read.All": "chat history",
	"Channel.ReadBasic.All": "channel list",
	"Team.ReadBasic.All": "team list",
	"TeamsActivity.Read.All": "teams activity",
	"Sites.Read.All": "files (SharePoint)",
	"Files.Read.All": "files (OneDrive)"
};
const collectMSTeamsSecurityWarnings = createAllowlistProviderGroupPolicyWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.msteams !== void 0,
	resolveGroupPolicy: ({ cfg }) => cfg.channels?.msteams?.groupPolicy,
	collect: ({ groupPolicy }) => groupPolicy === "open" ? ["- MS Teams groups: groupPolicy=\"open\" allows any member to trigger (mention-gated). Set channels.msteams.groupPolicy=\"allowlist\" + channels.msteams.groupAllowFrom to restrict senders."] : []
});
const loadMSTeamsChannelRuntime = createLazyRuntimeNamedExport(() => import("./channel.runtime-Cflzx_NM.js"), "msTeamsChannelRuntime");
const resolveMSTeamsChannelConfig = (cfg) => ({
	allowFrom: cfg.channels?.msteams?.allowFrom,
	defaultTo: cfg.channels?.msteams?.defaultTo
});
const msteamsConfigAdapter = createTopLevelChannelConfigAdapter({
	sectionKey: "msteams",
	resolveAccount: (cfg) => ({
		accountId: DEFAULT_ACCOUNT_ID,
		enabled: cfg.channels?.msteams?.enabled !== false,
		configured: Boolean(resolveMSTeamsCredentials(cfg.channels?.msteams))
	}),
	resolveAccessorAccount: ({ cfg }) => resolveMSTeamsChannelConfig(cfg),
	resolveAllowFrom: (account) => account.allowFrom,
	formatAllowFrom: (allowFrom) => formatAllowFromLowercase({ allowFrom }),
	resolveDefaultTo: (account) => account.defaultTo
});
function describeMSTeamsMessageTool({ cfg }) {
	const enabled = cfg.channels?.msteams?.enabled !== false && Boolean(resolveMSTeamsCredentials(cfg.channels?.msteams));
	return {
		actions: enabled ? ["poll"] : [],
		capabilities: enabled ? ["cards"] : [],
		schema: enabled ? { properties: { card: createMessageToolCardSchema() } } : null
	};
}
const msteamsPlugin = createChatChannelPlugin({
	base: {
		id: "msteams",
		meta: {
			...meta,
			aliases: [...meta.aliases]
		},
		setupWizard: msteamsSetupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			polls: true,
			threads: true,
			media: true
		},
		agentPrompt: { messageToolHints: () => ["- Adaptive Cards supported. Use `action=send` with `card={type,version,body}` to send rich cards.", "- MSTeams targeting: omit `target` to reply to the current conversation (auto-inferred). Explicit targets: `user:ID` or `user:Display Name` (requires Graph API) for DMs, `conversation:19:...@thread.tacv2` for groups/channels. Prefer IDs over display names for speed."] },
		groups: { resolveToolPolicy: resolveMSTeamsGroupToolPolicy },
		reload: { configPrefixes: ["channels.msteams"] },
		configSchema: buildChannelConfigSchema(MSTeamsConfigSchema),
		config: {
			...msteamsConfigAdapter,
			isConfigured: (_account, cfg) => Boolean(resolveMSTeamsCredentials(cfg.channels?.msteams)),
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: account.configured
			})
		},
		setup: msteamsSetupAdapter,
		messaging: {
			normalizeTarget: normalizeMSTeamsMessagingTarget,
			resolveOutboundSessionRoute: (params) => resolveMSTeamsOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: (raw) => {
					const trimmed = raw.trim();
					if (!trimmed) return false;
					if (/^conversation:/i.test(trimmed)) return true;
					if (/^user:/i.test(trimmed)) {
						const id = trimmed.slice(5).trim();
						return /^[0-9a-fA-F-]{16,}$/.test(id);
					}
					return trimmed.includes("@thread");
				},
				hint: "<conversationId|user:ID|conversation:ID>"
			}
		},
		directory: createChannelDirectoryAdapter({
			self: async ({ cfg }) => {
				const creds = resolveMSTeamsCredentials(cfg.channels?.msteams);
				if (!creds) return null;
				return {
					kind: "user",
					id: creds.appId,
					name: creds.appId
				};
			},
			listPeers: async ({ cfg, query, limit }) => listDirectoryEntriesFromSources({
				kind: "user",
				sources: [cfg.channels?.msteams?.allowFrom ?? [], Object.keys(cfg.channels?.msteams?.dms ?? {})],
				query,
				limit,
				normalizeId: (raw) => {
					const normalized = normalizeMSTeamsMessagingTarget(raw) ?? raw;
					const lowered = normalized.toLowerCase();
					if (lowered.startsWith("user:") || lowered.startsWith("conversation:")) return normalized;
					return `user:${normalized}`;
				}
			}),
			listGroups: async ({ cfg, query, limit }) => listDirectoryEntriesFromSources({
				kind: "group",
				sources: [Object.values(cfg.channels?.msteams?.teams ?? {}).flatMap((team) => Object.keys(team.channels ?? {}))],
				query,
				limit,
				normalizeId: (raw) => `conversation:${raw.replace(/^conversation:/i, "").trim()}`
			}),
			...createRuntimeDirectoryLiveAdapter({
				getRuntime: loadMSTeamsChannelRuntime,
				listPeersLive: (runtime) => runtime.listMSTeamsDirectoryPeersLive,
				listGroupsLive: (runtime) => runtime.listMSTeamsDirectoryGroupsLive
			})
		}),
		resolver: { resolveTargets: async ({ cfg, inputs, kind, runtime }) => {
			const results = inputs.map((input) => ({
				input,
				resolved: false,
				id: void 0,
				name: void 0,
				note: void 0
			}));
			const stripPrefix = (value) => normalizeMSTeamsUserInput(value);
			const markPendingLookupFailed = (pending) => {
				pending.forEach(({ index }) => {
					const entry = results[index];
					if (entry) entry.note = "lookup failed";
				});
			};
			const resolvePending = async (pending, resolveEntries, applyResolvedEntry) => {
				if (pending.length === 0) return;
				try {
					(await resolveEntries(pending.map((entry) => entry.query))).forEach((entry, idx) => {
						const target = results[pending[idx]?.index ?? -1];
						if (!target) return;
						applyResolvedEntry(target, entry);
					});
				} catch (err) {
					runtime.error?.(`msteams resolve failed: ${String(err)}`);
					markPendingLookupFailed(pending);
				}
			};
			if (kind === "user") {
				const pending = [];
				results.forEach((entry, index) => {
					const trimmed = entry.input.trim();
					if (!trimmed) {
						entry.note = "empty input";
						return;
					}
					const cleaned = stripPrefix(trimmed);
					if (/^[0-9a-fA-F-]{16,}$/.test(cleaned) || cleaned.includes("@")) {
						entry.resolved = true;
						entry.id = cleaned;
						return;
					}
					pending.push({
						input: entry.input,
						query: cleaned,
						index
					});
				});
				await resolvePending(pending, (entries) => resolveMSTeamsUserAllowlist({
					cfg,
					entries
				}), (target, entry) => {
					target.resolved = entry.resolved;
					target.id = entry.id;
					target.name = entry.name;
					target.note = entry.note;
				});
				return results;
			}
			const pending = [];
			results.forEach((entry, index) => {
				const trimmed = entry.input.trim();
				if (!trimmed) {
					entry.note = "empty input";
					return;
				}
				const conversationId = parseMSTeamsConversationId(trimmed);
				if (conversationId !== null) {
					entry.resolved = Boolean(conversationId);
					entry.id = conversationId || void 0;
					entry.note = conversationId ? "conversation id" : "empty conversation id";
					return;
				}
				const parsed = parseMSTeamsTeamChannelInput(trimmed);
				if (!parsed.team) {
					entry.note = "missing team";
					return;
				}
				const query = parsed.channel ? `${parsed.team}/${parsed.channel}` : parsed.team;
				pending.push({
					input: entry.input,
					query,
					index
				});
			});
			await resolvePending(pending, (entries) => resolveMSTeamsChannelAllowlist({
				cfg,
				entries
			}), (target, entry) => {
				if (!entry.resolved || !entry.teamId) {
					target.resolved = false;
					target.note = entry.note;
					return;
				}
				target.resolved = true;
				if (entry.channelId) {
					target.id = `${entry.teamId}/${entry.channelId}`;
					target.name = entry.channelName && entry.teamName ? `${entry.teamName}/${entry.channelName}` : entry.channelName ?? entry.teamName;
				} else {
					target.id = entry.teamId;
					target.name = entry.teamName;
					target.note = "team id";
				}
				if (entry.note) target.note = entry.note;
			});
			return results;
		} },
		actions: {
			describeMessageTool: describeMSTeamsMessageTool,
			handleAction: async (ctx) => {
				if (ctx.action === "send" && ctx.params.card) {
					const card = ctx.params.card;
					const to = typeof ctx.params.to === "string" ? ctx.params.to.trim() : typeof ctx.params.target === "string" ? ctx.params.target.trim() : "";
					if (!to) return {
						isError: true,
						content: [{
							type: "text",
							text: "Card send requires a target (to)."
						}],
						details: { error: "Card send requires a target (to)." }
					};
					const { sendAdaptiveCardMSTeams } = await loadMSTeamsChannelRuntime();
					const result = await sendAdaptiveCardMSTeams({
						cfg: ctx.cfg,
						to,
						card
					});
					return {
						content: [{
							type: "text",
							text: JSON.stringify({
								ok: true,
								channel: "msteams",
								messageId: result.messageId,
								conversationId: result.conversationId
							})
						}],
						details: {
							ok: true,
							channel: "msteams",
							messageId: result.messageId
						}
					};
				}
				return null;
			}
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID, { port: null }),
			buildChannelSummary: ({ snapshot }) => buildProbeChannelStatusSummary(snapshot, { port: snapshot.port ?? null }),
			probeAccount: async ({ cfg }) => await (await loadMSTeamsChannelRuntime()).probeMSTeams(cfg.channels?.msteams),
			formatCapabilitiesProbe: ({ probe }) => {
				const teamsProbe = probe;
				const lines = [];
				const appId = typeof teamsProbe?.appId === "string" ? teamsProbe.appId.trim() : "";
				if (appId) lines.push({ text: `App: ${appId}` });
				const graph = teamsProbe?.graph;
				if (graph) {
					const roles = Array.isArray(graph.roles) ? graph.roles.map((role) => String(role).trim()).filter(Boolean) : [];
					const scopes = Array.isArray(graph.scopes) ? graph.scopes.map((scope) => String(scope).trim()).filter(Boolean) : [];
					const formatPermission = (permission) => {
						const hint = TEAMS_GRAPH_PERMISSION_HINTS[permission];
						return hint ? `${permission} (${hint})` : permission;
					};
					if (graph.ok === false) lines.push({
						text: `Graph: ${graph.error ?? "failed"}`,
						tone: "error"
					});
					else if (roles.length > 0 || scopes.length > 0) {
						if (roles.length > 0) lines.push({ text: `Graph roles: ${roles.map(formatPermission).join(", ")}` });
						if (scopes.length > 0) lines.push({ text: `Graph scopes: ${scopes.map(formatPermission).join(", ")}` });
					} else if (graph.ok === true) lines.push({ text: "Graph: ok" });
				}
				return lines;
			},
			resolveAccountSnapshot: ({ account, runtime }) => ({
				accountId: account.accountId,
				enabled: account.enabled,
				configured: account.configured,
				extra: { port: runtime?.port ?? null }
			})
		}),
		gateway: { startAccount: async (ctx) => {
			const { monitorMSTeamsProvider } = await import("./src-CeG_1e6J.js");
			const port = ctx.cfg.channels?.msteams?.webhook?.port ?? 3978;
			ctx.setStatus({
				accountId: ctx.accountId,
				port
			});
			ctx.log?.info(`starting provider (port ${port})`);
			return monitorMSTeamsProvider({
				cfg: ctx.cfg,
				runtime: ctx.runtime,
				abortSignal: ctx.abortSignal
			});
		} }
	},
	security: { collectWarnings: projectConfigWarningCollector(collectMSTeamsSecurityWarnings) },
	pairing: { text: {
		idLabel: "msteamsUserId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^(msteams|user):/i),
		notify: async ({ cfg, id, message }) => {
			const { sendMessageMSTeams } = await loadMSTeamsChannelRuntime();
			await sendMessageMSTeams({
				cfg,
				to: id,
				text: message
			});
		}
	} },
	threading: { buildToolContext: ({ context, hasRepliedRef }) => ({
		currentChannelId: context.To?.trim() || void 0,
		currentThreadTs: context.ReplyToId,
		hasRepliedRef
	}) },
	outbound: {
		deliveryMode: "direct",
		chunker: (text, limit) => getMSTeamsRuntime().channel.text.chunkMarkdownText(text, limit),
		chunkerMode: "markdown",
		textChunkLimit: 4e3,
		pollMaxOptions: 12,
		...createRuntimeOutboundDelegates({
			getRuntime: loadMSTeamsChannelRuntime,
			sendText: { resolve: (runtime) => runtime.msteamsOutbound.sendText },
			sendMedia: { resolve: (runtime) => runtime.msteamsOutbound.sendMedia },
			sendPoll: { resolve: (runtime) => runtime.msteamsOutbound.sendPoll }
		})
	}
});
//#endregion
export { msteamsPlugin as t };
