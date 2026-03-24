import { d as isRecord } from "./utils-CS0Ikux6.js";
import { d as resolveThreadSessionKeys, g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { Cc as listSlackDirectoryGroupsFromConfig, Dc as buildSlackInteractiveBlocks, Hb as defineChannelPluginEntry, Jb as adaptScopedAccountAccessor, Qc as createSlackWebClient, Vb as createChatChannelPlugin, Wc as SLACK_TEXT_LIMIT, _c as extractSlackToolSend, dl as resolveSlackReplyToMode, ex as createScopedDmSecurityResolver, gc as resolveSlackGroupToolPolicy, hc as resolveSlackGroupRequireMention, ic as buildSlackThreadingToolContext, rl as parseSlackBlocksInput, uc as normalizeAllowListLower, ul as resolveSlackAccount, vc as listSlackMessageActions, wc as listSlackDirectoryPeersFromConfig, yc as isSlackInteractiveRepliesEnabled, zx as createOpenProviderConfiguredRouteWarningCollector } from "./pi-embedded-CbCYZxIb.js";
import { n as buildOutboundBaseSessionKey, t as normalizeOutboundThreadId } from "./routing-zOQ0wwtV.js";
import { r as resolveOutboundSendDep } from "./outbound-runtime-m-y0nd6F.js";
import { d as readNumberParam, h as readStringParam } from "./common-zReYuoMM.js";
import { o as normalizeInteractiveReply } from "./interactive-runtime--ddkRk4N.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-CO3iC4WE.js";
import { l as createComputedAccountStatusAdapter, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-BrG9NqjP.js";
import { t as createRuntimeDirectoryLiveAdapter } from "./runtime-forwarders-Cv9Bdwov.js";
import { p as createChannelDirectoryAdapter } from "./directory-runtime-D9Y42mW-.js";
import { o as resolveConfiguredFromRequiredCredentialStatuses, r as projectCredentialSnapshotFields } from "./account-snapshot-fields-QM0tdgga.js";
import { n as resolveTargetsWithOptionalToken } from "./channel-targets-IU5H6m6L.js";
import { n as resolveSlackChannelId, t as parseSlackTarget } from "./targets-Uq-JgGuY.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CpniCRIn.js";
import { o as createAccountScopedAllowlistNameResolver, r as buildLegacyDmAccountAllowlistAdapter, s as createFlatAllowlistOverrideResolver } from "./allowlist-config-edit-DBeLbvpH.js";
import { n as buildPassiveProbedChannelStatusSummary } from "./extension-shared-B8dMu-tU.js";
import { n as normalizeSlackMessagingTarget, t as looksLikeSlackTargetId } from "./slack-fMUtATvI.js";
import { t as resolveSlackUserAllowlist } from "./resolve-users-BA71J77K.js";
import { t as handleSlackAction } from "./action-runtime-C0myurlB.js";
import { a as isSlackPluginAccountConfigured, i as createSlackPluginBase, n as slackSetupAdapter, o as slackConfigAdapter, r as SLACK_CHANNEL, t as slackSetupWizard } from "./setup-surface-BGae7rU92.js";
import { Type } from "@sinclair/typebox";
//#region extensions/slack/src/message-action-dispatch.ts
function readSlackBlocksParam(actionParams) {
	return parseSlackBlocksInput(actionParams.blocks);
}
/** Translate generic channel action requests into Slack-specific tool invocations and payload shapes. */
async function handleSlackMessageAction(params) {
	const { providerId, ctx, invoke, normalizeChannelId, includeReadThreadId = false } = params;
	const { action, cfg, params: actionParams } = ctx;
	const accountId = ctx.accountId ?? void 0;
	const resolveChannelId = () => {
		const channelId = readStringParam(actionParams, "channelId") ?? readStringParam(actionParams, "to", { required: true });
		return normalizeChannelId ? normalizeChannelId(channelId) : channelId;
	};
	if (action === "send") {
		const to = readStringParam(actionParams, "to", { required: true });
		const content = readStringParam(actionParams, "message", {
			required: false,
			allowEmpty: true
		});
		const mediaUrl = readStringParam(actionParams, "media", { trim: false });
		const interactive = normalizeInteractiveReply(actionParams.interactive);
		const interactiveBlocks = interactive ? buildSlackInteractiveBlocks(interactive) : void 0;
		const blocks = readSlackBlocksParam(actionParams) ?? interactiveBlocks;
		if (!content && !mediaUrl && !blocks) throw new Error("Slack send requires message, blocks, or media.");
		if (mediaUrl && blocks) throw new Error("Slack send does not support blocks with media.");
		const threadId = readStringParam(actionParams, "threadId");
		const replyTo = readStringParam(actionParams, "replyTo");
		return await invoke({
			action: "sendMessage",
			to,
			content: content ?? "",
			mediaUrl: mediaUrl ?? void 0,
			accountId,
			threadTs: threadId ?? replyTo ?? void 0,
			...blocks ? { blocks } : {}
		}, cfg, ctx.toolContext);
	}
	if (action === "react") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		const emoji = readStringParam(actionParams, "emoji", { allowEmpty: true });
		const remove = typeof actionParams.remove === "boolean" ? actionParams.remove : void 0;
		return await invoke({
			action: "react",
			channelId: resolveChannelId(),
			messageId,
			emoji,
			remove,
			accountId
		}, cfg);
	}
	if (action === "reactions") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		const limit = readNumberParam(actionParams, "limit", { integer: true });
		return await invoke({
			action: "reactions",
			channelId: resolveChannelId(),
			messageId,
			limit,
			accountId
		}, cfg);
	}
	if (action === "read") {
		const limit = readNumberParam(actionParams, "limit", { integer: true });
		const readAction = {
			action: "readMessages",
			channelId: resolveChannelId(),
			limit,
			before: readStringParam(actionParams, "before"),
			after: readStringParam(actionParams, "after"),
			accountId
		};
		if (includeReadThreadId) readAction.threadId = readStringParam(actionParams, "threadId");
		return await invoke(readAction, cfg);
	}
	if (action === "edit") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		const content = readStringParam(actionParams, "message", { allowEmpty: true });
		const blocks = readSlackBlocksParam(actionParams);
		if (!content && !blocks) throw new Error("Slack edit requires message or blocks.");
		return await invoke({
			action: "editMessage",
			channelId: resolveChannelId(),
			messageId,
			content: content ?? "",
			blocks,
			accountId
		}, cfg);
	}
	if (action === "delete") {
		const messageId = readStringParam(actionParams, "messageId", { required: true });
		return await invoke({
			action: "deleteMessage",
			channelId: resolveChannelId(),
			messageId,
			accountId
		}, cfg);
	}
	if (action === "pin" || action === "unpin" || action === "list-pins") {
		const messageId = action === "list-pins" ? void 0 : readStringParam(actionParams, "messageId", { required: true });
		return await invoke({
			action: action === "pin" ? "pinMessage" : action === "unpin" ? "unpinMessage" : "listPins",
			channelId: resolveChannelId(),
			messageId,
			accountId
		}, cfg);
	}
	if (action === "member-info") return await invoke({
		action: "memberInfo",
		userId: readStringParam(actionParams, "userId", { required: true }),
		accountId
	}, cfg);
	if (action === "emoji-list") return await invoke({
		action: "emojiList",
		limit: readNumberParam(actionParams, "limit", { integer: true }),
		accountId
	}, cfg);
	if (action === "download-file") {
		const fileId = readStringParam(actionParams, "fileId", { required: true });
		const channelId = readStringParam(actionParams, "channelId") ?? readStringParam(actionParams, "to");
		const threadId = readStringParam(actionParams, "threadId") ?? readStringParam(actionParams, "replyTo");
		return await invoke({
			action: "downloadFile",
			fileId,
			channelId: channelId ?? void 0,
			threadId: threadId ?? void 0,
			accountId
		}, cfg);
	}
	throw new Error(`Action ${action} is not supported for provider ${providerId}.`);
}
//#endregion
//#region extensions/slack/src/message-tool-schema.ts
function createSlackMessageToolBlocksSchema() {
	return Type.Array(Type.Object({}, {
		additionalProperties: true,
		description: "Slack Block Kit payload blocks (Slack only)."
	}));
}
//#endregion
//#region extensions/slack/src/channel-actions.ts
function createSlackActions(providerId, options) {
	function describeMessageTool({ cfg }) {
		const actions = listSlackMessageActions(cfg);
		const capabilities = /* @__PURE__ */ new Set();
		if (actions.includes("send")) capabilities.add("blocks");
		if (isSlackInteractiveRepliesEnabled({ cfg })) capabilities.add("interactive");
		return {
			actions,
			capabilities: Array.from(capabilities),
			schema: actions.includes("send") ? { properties: { blocks: Type.Optional(createSlackMessageToolBlocksSchema()) } } : null
		};
	}
	return {
		describeMessageTool,
		extractToolSend: ({ args }) => extractSlackToolSend(args),
		handleAction: async (ctx) => {
			return await handleSlackMessageAction({
				providerId,
				ctx,
				normalizeChannelId: resolveSlackChannelId,
				includeReadThreadId: true,
				invoke: async (action, cfg, toolContext) => await (options?.invoke ? options.invoke(action, cfg, toolContext) : handleSlackAction(action, cfg, {
					...toolContext,
					mediaLocalRoots: ctx.mediaLocalRoots
				}))
			});
		}
	};
}
//#endregion
//#region extensions/slack/src/runtime.ts
const { setRuntime: setSlackRuntime, getRuntime: getSlackRuntime } = createPluginRuntimeStore("Slack runtime not initialized");
//#endregion
//#region extensions/slack/src/scopes.ts
function collectScopes(value, into) {
	if (!value) return;
	if (Array.isArray(value)) {
		for (const entry of value) if (typeof entry === "string" && entry.trim()) into.push(entry.trim());
		return;
	}
	if (typeof value === "string") {
		const raw = value.trim();
		if (!raw) return;
		const parts = raw.split(/[,\s]+/).map((part) => part.trim());
		for (const part of parts) if (part) into.push(part);
		return;
	}
	if (!isRecord(value)) return;
	for (const entry of Object.values(value)) if (Array.isArray(entry) || typeof entry === "string") collectScopes(entry, into);
}
function normalizeScopes(scopes) {
	return Array.from(new Set(scopes.map((scope) => scope.trim()).filter(Boolean))).toSorted();
}
function extractScopes(payload) {
	if (!isRecord(payload)) return [];
	const scopes = [];
	collectScopes(payload.scopes, scopes);
	collectScopes(payload.scope, scopes);
	if (isRecord(payload.info)) {
		collectScopes(payload.info.scopes, scopes);
		collectScopes(payload.info.scope, scopes);
		collectScopes(payload.info.user_scopes, scopes);
		collectScopes(payload.info.bot_scopes, scopes);
	}
	return normalizeScopes(scopes);
}
function readError(payload) {
	if (!isRecord(payload)) return;
	const error = payload.error;
	return typeof error === "string" && error.trim() ? error.trim() : void 0;
}
async function callSlack(client, method) {
	try {
		const result = await client.apiCall(method);
		return isRecord(result) ? result : null;
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
async function fetchSlackScopes(token, timeoutMs) {
	const client = createSlackWebClient(token, { timeout: timeoutMs });
	const attempts = ["auth.scopes", "apps.permissions.info"];
	const errors = [];
	for (const method of attempts) {
		const result = await callSlack(client, method);
		const scopes = extractScopes(result);
		if (scopes.length > 0) return {
			ok: true,
			scopes,
			source: method
		};
		const error = readError(result);
		if (error) errors.push(`${method}: ${error}`);
	}
	return {
		ok: false,
		error: errors.length > 0 ? errors.join(" | ") : "no scopes returned"
	};
}
//#endregion
//#region extensions/slack/src/channel.ts
const SLACK_CHANNEL_TYPE_CACHE = /* @__PURE__ */ new Map();
const resolveSlackDmPolicy = createScopedDmSecurityResolver({
	channelKey: "slack",
	resolvePolicy: (account) => account.dm?.policy,
	resolveAllowFrom: (account) => account.dm?.allowFrom,
	allowFromPathSuffix: "dm.",
	normalizeEntry: (raw) => raw.trim().replace(/^(slack|user):/i, "").trim()
});
function getTokenForOperation(account, operation) {
	const userToken = account.config.userToken?.trim() || void 0;
	const botToken = account.botToken?.trim();
	const allowUserWrites = account.config.userTokenReadOnly === false;
	if (operation === "read") return userToken ?? botToken;
	if (!allowUserWrites) return botToken;
	return botToken ?? userToken;
}
function resolveSlackSendContext(params) {
	const send = resolveOutboundSendDep(params.deps, "slack") ?? getSlackRuntime().channel.slack.sendMessageSlack;
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const token = getTokenForOperation(account, "write");
	const botToken = account.botToken?.trim();
	const tokenOverride = token && token !== botToken ? token : void 0;
	return {
		send,
		threadTsValue: params.replyToId ?? params.threadId,
		tokenOverride
	};
}
function resolveSlackAutoThreadId(params) {
	const context = params.toolContext;
	if (!context?.currentThreadTs || !context.currentChannelId) return;
	if (context.replyToMode !== "all" && context.replyToMode !== "first") return;
	const parsedTarget = parseSlackTarget(params.to, { defaultKind: "channel" });
	if (!parsedTarget || parsedTarget.kind !== "channel") return;
	if (parsedTarget.id.toLowerCase() !== context.currentChannelId.toLowerCase()) return;
	if (context.replyToMode === "first" && context.hasRepliedRef?.value) return;
	return context.currentThreadTs;
}
function parseSlackExplicitTarget(raw) {
	const target = parseSlackTarget(raw, { defaultKind: "channel" });
	if (!target) return null;
	return {
		to: target.id,
		chatType: target.kind === "user" ? "direct" : "channel"
	};
}
function buildSlackBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "slack"
	});
}
async function resolveSlackChannelType(params) {
	const channelId = params.channelId.trim();
	if (!channelId) return "unknown";
	const cacheKey = `${params.accountId ?? "default"}:${channelId}`;
	const cached = SLACK_CHANNEL_TYPE_CACHE.get(cacheKey);
	if (cached) return cached;
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const groupChannels = normalizeAllowListLower(account.dm?.groupChannels);
	const channelIdLower = channelId.toLowerCase();
	if (groupChannels.includes(channelIdLower) || groupChannels.includes(`slack:${channelIdLower}`) || groupChannels.includes(`channel:${channelIdLower}`) || groupChannels.includes(`group:${channelIdLower}`) || groupChannels.includes(`mpim:${channelIdLower}`)) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "group");
		return "group";
	}
	if (Object.keys(account.channels ?? {}).some((key) => {
		const normalized = key.trim().toLowerCase();
		return normalized === channelIdLower || normalized === `channel:${channelIdLower}` || normalized.replace(/^#/, "") === channelIdLower;
	})) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "channel");
		return "channel";
	}
	const token = account.botToken?.trim() || account.config.userToken?.trim() || "";
	if (!token) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "unknown");
		return "unknown";
	}
	try {
		const channel = (await createSlackWebClient(token).conversations.info({ channel: channelId })).channel;
		const type = channel?.is_im ? "dm" : channel?.is_mpim ? "group" : "channel";
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, type);
		return type;
	} catch {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "unknown");
		return "unknown";
	}
}
async function resolveSlackOutboundSessionRoute(params) {
	const parsed = parseSlackTarget(params.target, { defaultKind: "channel" });
	if (!parsed) return null;
	const isDm = parsed.kind === "user";
	let peerKind = isDm ? "direct" : "channel";
	if (!isDm && /^G/i.test(parsed.id)) {
		const channelType = await resolveSlackChannelType({
			cfg: params.cfg,
			accountId: params.accountId,
			channelId: parsed.id
		});
		if (channelType === "group") peerKind = "group";
		if (channelType === "dm") peerKind = "direct";
	}
	const peer = {
		kind: peerKind,
		id: parsed.id
	};
	const baseSessionKey = buildSlackBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		accountId: params.accountId,
		peer
	});
	const threadId = normalizeOutboundThreadId(params.threadId ?? params.replyToId);
	return {
		sessionKey: resolveThreadSessionKeys({
			baseSessionKey,
			threadId
		}).sessionKey,
		baseSessionKey,
		peer,
		chatType: peerKind === "direct" ? "direct" : "channel",
		from: peerKind === "direct" ? `slack:${parsed.id}` : peerKind === "group" ? `slack:group:${parsed.id}` : `slack:channel:${parsed.id}`,
		to: peerKind === "direct" ? `user:${parsed.id}` : `channel:${parsed.id}`,
		threadId
	};
}
function formatSlackScopeDiagnostic(params) {
	const source = params.result.source ? ` (${params.result.source})` : "";
	const label = params.tokenType === "user" ? "User scopes" : "Bot scopes";
	if (params.result.ok && params.result.scopes?.length) return { text: `${label}${source}: ${params.result.scopes.join(", ")}` };
	return {
		text: `${label}: ${params.result.error ?? "scope lookup failed"}`,
		tone: "error"
	};
}
const resolveSlackAllowlistGroupOverrides = createFlatAllowlistOverrideResolver({
	resolveRecord: (account) => account.channels,
	label: (key) => key,
	resolveEntries: (value) => value?.users
});
const resolveSlackAllowlistNames = createAccountScopedAllowlistNameResolver({
	resolveAccount: resolveSlackAccount,
	resolveToken: (account) => account.config.userToken?.trim() || account.botToken?.trim(),
	resolveNames: ({ token, entries }) => resolveSlackUserAllowlist({
		token,
		entries
	})
});
const collectSlackSecurityWarnings = createOpenProviderConfiguredRouteWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.slack !== void 0,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	resolveRouteAllowlistConfigured: (account) => Boolean(account.config.channels) && Object.keys(account.config.channels ?? {}).length > 0,
	configureRouteAllowlist: {
		surface: "Slack channels",
		openScope: "any channel not explicitly denied",
		groupPolicyPath: "channels.slack.groupPolicy",
		routeAllowlistPath: "channels.slack.channels"
	},
	missingRouteAllowlist: {
		surface: "Slack channels",
		openBehavior: "with no channel allowlist; any channel can trigger (mention-gated)",
		remediation: "Set channels.slack.groupPolicy=\"allowlist\" and configure channels.slack.channels"
	}
});
const slackPlugin = createChatChannelPlugin({
	base: {
		...createSlackPluginBase({
			setupWizard: slackSetupWizard,
			setup: slackSetupAdapter
		}),
		allowlist: {
			...buildLegacyDmAccountAllowlistAdapter({
				channelId: "slack",
				resolveAccount: resolveSlackAccount,
				normalize: ({ cfg, accountId, values }) => slackConfigAdapter.formatAllowFrom({
					cfg,
					accountId,
					allowFrom: values
				}),
				resolveDmAllowFrom: (account) => account.config.allowFrom ?? account.config.dm?.allowFrom,
				resolveGroupPolicy: (account) => account.groupPolicy,
				resolveGroupOverrides: resolveSlackAllowlistGroupOverrides
			}),
			resolveNames: resolveSlackAllowlistNames
		},
		groups: {
			resolveRequireMention: resolveSlackGroupRequireMention,
			resolveToolPolicy: resolveSlackGroupToolPolicy
		},
		messaging: {
			normalizeTarget: normalizeSlackMessagingTarget,
			resolveSessionTarget: ({ id }) => normalizeSlackMessagingTarget(`channel:${id}`),
			parseExplicitTarget: ({ raw }) => parseSlackExplicitTarget(raw),
			inferTargetChatType: ({ to }) => parseSlackExplicitTarget(to)?.chatType,
			resolveOutboundSessionRoute: async (params) => await resolveSlackOutboundSessionRoute(params),
			enableInteractiveReplies: ({ cfg, accountId }) => isSlackInteractiveRepliesEnabled({
				cfg,
				accountId
			}),
			hasStructuredReplyPayload: ({ payload }) => {
				const slackData = payload.channelData?.slack;
				if (!slackData || typeof slackData !== "object" || Array.isArray(slackData)) return false;
				try {
					return Boolean(parseSlackBlocksInput(slackData.blocks)?.length);
				} catch {
					return false;
				}
			},
			targetResolver: {
				looksLikeId: looksLikeSlackTargetId,
				hint: "<channelId|user:ID|channel:ID>",
				resolveTarget: async ({ input }) => {
					const parsed = parseSlackExplicitTarget(input);
					if (!parsed) return null;
					return {
						to: parsed.to,
						kind: parsed.chatType === "direct" ? "user" : "group",
						source: "normalized"
					};
				}
			}
		},
		directory: createChannelDirectoryAdapter({
			listPeers: async (params) => listSlackDirectoryPeersFromConfig(params),
			listGroups: async (params) => listSlackDirectoryGroupsFromConfig(params),
			...createRuntimeDirectoryLiveAdapter({
				getRuntime: () => getSlackRuntime().channel.slack,
				listPeersLive: (runtime) => runtime.listDirectoryPeersLive,
				listGroupsLive: (runtime) => runtime.listDirectoryGroupsLive
			})
		}),
		resolver: { resolveTargets: async ({ cfg, accountId, inputs, kind }) => {
			const toResolvedTarget = (entry, note) => ({
				input: entry.input,
				resolved: entry.resolved,
				id: entry.id,
				name: entry.name,
				note
			});
			const account = resolveSlackAccount({
				cfg,
				accountId
			});
			if (kind === "group") return resolveTargetsWithOptionalToken({
				token: account.config.userToken?.trim() || account.botToken?.trim(),
				inputs,
				missingTokenNote: "missing Slack token",
				resolveWithToken: ({ token, inputs }) => getSlackRuntime().channel.slack.resolveChannelAllowlist({
					token,
					entries: inputs
				}),
				mapResolved: (entry) => toResolvedTarget(entry, entry.archived ? "archived" : void 0)
			});
			return resolveTargetsWithOptionalToken({
				token: account.config.userToken?.trim() || account.botToken?.trim(),
				inputs,
				missingTokenNote: "missing Slack token",
				resolveWithToken: ({ token, inputs }) => getSlackRuntime().channel.slack.resolveUserAllowlist({
					token,
					entries: inputs
				}),
				mapResolved: (entry) => toResolvedTarget(entry, entry.note)
			});
		} },
		actions: createSlackActions(SLACK_CHANNEL, { invoke: async (action, cfg, toolContext) => await getSlackRuntime().channel.slack.handleSlackAction(action, cfg, toolContext) }),
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			buildChannelSummary: ({ snapshot }) => buildPassiveProbedChannelStatusSummary(snapshot, {
				botTokenSource: snapshot.botTokenSource ?? "none",
				appTokenSource: snapshot.appTokenSource ?? "none"
			}),
			probeAccount: async ({ account, timeoutMs }) => {
				const token = account.botToken?.trim();
				if (!token) return {
					ok: false,
					error: "missing token"
				};
				return await getSlackRuntime().channel.slack.probeSlack(token, timeoutMs);
			},
			formatCapabilitiesProbe: ({ probe }) => {
				const slackProbe = probe;
				const lines = [];
				if (slackProbe?.bot?.name) lines.push({ text: `Bot: @${slackProbe.bot.name}` });
				if (slackProbe?.team?.name || slackProbe?.team?.id) {
					const id = slackProbe.team?.id ? ` (${slackProbe.team.id})` : "";
					lines.push({ text: `Team: ${slackProbe.team?.name ?? "unknown"}${id}` });
				}
				return lines;
			},
			buildCapabilitiesDiagnostics: async ({ account, timeoutMs }) => {
				const lines = [];
				const details = {};
				const botToken = account.botToken?.trim();
				const userToken = account.config.userToken?.trim();
				const botScopes = botToken ? await fetchSlackScopes(botToken, timeoutMs) : {
					ok: false,
					error: "Slack bot token missing."
				};
				lines.push(formatSlackScopeDiagnostic({
					tokenType: "bot",
					result: botScopes
				}));
				details.botScopes = botScopes;
				if (userToken) {
					const userScopes = await fetchSlackScopes(userToken, timeoutMs);
					lines.push(formatSlackScopeDiagnostic({
						tokenType: "user",
						result: userScopes
					}));
					details.userScopes = userScopes;
				}
				return {
					lines,
					details
				};
			},
			resolveAccountSnapshot: ({ account }) => {
				const configured = ((account.config.mode ?? "socket") === "http" ? resolveConfiguredFromRequiredCredentialStatuses(account, ["botTokenStatus", "signingSecretStatus"]) : resolveConfiguredFromRequiredCredentialStatuses(account, ["botTokenStatus", "appTokenStatus"])) ?? isSlackPluginAccountConfigured(account);
				return {
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured,
					extra: { ...projectCredentialSnapshotFields(account) }
				};
			}
		}),
		gateway: { startAccount: async (ctx) => {
			const account = ctx.account;
			const botToken = account.botToken?.trim();
			const appToken = account.appToken?.trim();
			ctx.log?.info(`[${account.accountId}] starting provider`);
			return getSlackRuntime().channel.slack.monitorSlackProvider({
				botToken: botToken ?? "",
				appToken: appToken ?? "",
				accountId: account.accountId,
				config: ctx.cfg,
				runtime: ctx.runtime,
				abortSignal: ctx.abortSignal,
				mediaMaxMb: account.config.mediaMaxMb,
				slashCommand: account.config.slashCommand,
				setStatus: ctx.setStatus,
				getStatus: ctx.getStatus
			});
		} }
	},
	pairing: { text: {
		idLabel: "slackUserId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^(slack|user):/i),
		notify: async ({ id, message }) => {
			const account = resolveSlackAccount({
				cfg: getSlackRuntime().config.loadConfig(),
				accountId: DEFAULT_ACCOUNT_ID
			});
			const token = getTokenForOperation(account, "write");
			const botToken = account.botToken?.trim();
			const tokenOverride = token && token !== botToken ? token : void 0;
			if (tokenOverride) await getSlackRuntime().channel.slack.sendMessageSlack(`user:${id}`, message, { token: tokenOverride });
			else await getSlackRuntime().channel.slack.sendMessageSlack(`user:${id}`, message);
		}
	} },
	security: {
		resolveDmPolicy: resolveSlackDmPolicy,
		collectWarnings: collectSlackSecurityWarnings
	},
	threading: {
		scopedAccountReplyToMode: {
			resolveAccount: adaptScopedAccountAccessor(resolveSlackAccount),
			resolveReplyToMode: (account, chatType) => resolveSlackReplyToMode(account, chatType)
		},
		allowExplicitReplyTagsWhenOff: false,
		buildToolContext: (params) => buildSlackThreadingToolContext(params),
		resolveAutoThreadId: ({ cfg, accountId, to, toolContext, replyToId }) => replyToId ? void 0 : resolveSlackAutoThreadId({
			cfg,
			accountId,
			to,
			toolContext
		}),
		resolveReplyTransport: ({ threadId, replyToId }) => ({
			replyToId: replyToId ?? (threadId != null && threadId !== "" ? String(threadId) : void 0),
			threadId: null
		})
	},
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: null,
			textChunkLimit: SLACK_TEXT_LIMIT
		},
		attachedResults: {
			channel: "slack",
			sendText: async ({ to, text, accountId, deps, replyToId, threadId, cfg }) => {
				const { send, threadTsValue, tokenOverride } = resolveSlackSendContext({
					cfg,
					accountId: accountId ?? void 0,
					deps,
					replyToId,
					threadId
				});
				return await send(to, text, {
					cfg,
					threadTs: threadTsValue != null ? String(threadTsValue) : void 0,
					accountId: accountId ?? void 0,
					...tokenOverride ? { token: tokenOverride } : {}
				});
			},
			sendMedia: async ({ to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId, threadId, cfg }) => {
				const { send, threadTsValue, tokenOverride } = resolveSlackSendContext({
					cfg,
					accountId: accountId ?? void 0,
					deps,
					replyToId,
					threadId
				});
				return await send(to, text, {
					cfg,
					mediaUrl,
					mediaLocalRoots,
					threadTs: threadTsValue != null ? String(threadTsValue) : void 0,
					accountId: accountId ?? void 0,
					...tokenOverride ? { token: tokenOverride } : {}
				});
			}
		}
	}
});
//#endregion
//#region extensions/slack/index.ts
var slack_default = defineChannelPluginEntry({
	id: "slack",
	name: "Slack",
	description: "Slack channel plugin",
	plugin: slackPlugin,
	setRuntime: setSlackRuntime
});
//#endregion
export { slackPlugin as n, setSlackRuntime as r, slack_default as t };
