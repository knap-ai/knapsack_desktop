import { u as isRecord } from "./utils-CE3P21nG.js";
import { d as resolveThreadSessionKeys, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-CmW7Xsw3.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-DoFheDS-.js";
import { d as createDefaultChannelRuntimeState, u as createComputedAccountStatusAdapter } from "./status-helpers-CtpWf3f1.js";
import { d as readNumberParam, h as readStringParam } from "./common-RGbDbB5n.js";
import { _ as sendPayloadMediaSequenceAndFinalize, b as sendTextMediaPayload, f as resolvePayloadMediaUrls } from "./reply-payload-SzVz53hc.js";
import { a as normalizeInteractiveReply, o as resolveInteractiveTextFallback } from "./payload-CLtYAQwf.js";
import { t as resolveOutboundSendDep } from "./send-deps-DLS-OK3u.js";
import { t as adaptScopedAccountAccessor, u as createScopedDmSecurityResolver } from "./channel-config-helpers-B0S2z66F.js";
import { t as buildOutboundBaseSessionKey } from "./base-session-key-BM8QSZQb.js";
import { r as createChatChannelPlugin } from "./core-BghMcc08.js";
import { t as normalizeOutboundThreadId } from "./routing-Br1fEo8A.js";
import { o as resolveConfiguredFromRequiredCredentialStatuses, r as projectCredentialSnapshotFields } from "./account-snapshot-fields-suG8crmH.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CIDSrOnb.js";
import { _ as createOpenProviderConfiguredRouteWarningCollector } from "./group-policy-warnings-B8ZU4B4D.js";
import "./channel-policy-Dqo0XdDX.js";
import { t as createChannelDirectoryAdapter } from "./directory-runtime-Rwkajwwt.js";
import { t as createRuntimeDirectoryLiveAdapter } from "./runtime-forwarders-RaV_r9tr.js";
import "./outbound-runtime-D_hcnwUl.js";
import "./text-runtime-B0ZpmkER.js";
import "./plugin-runtime-CR3GBFZ-.js";
import { o as createAccountScopedAllowlistNameResolver, r as buildLegacyDmAccountAllowlistAdapter, s as createFlatAllowlistOverrideResolver } from "./allowlist-config-edit-DcMKbV8C.js";
import { n as resolveTargetsWithOptionalToken } from "./channel-targets-B8L9uT9q.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-Nk7oRFrM.js";
import { n as buildPassiveProbedChannelStatusSummary } from "./extension-shared-gP7gKXlS.js";
import { i as createAttachedChannelResultAdapter, t as attachChannelToResult } from "./channel-send-result-COXGPSxL.js";
import "./param-readers-DvlSplrS.js";
import { a as resolveSlackAccount, o as resolveSlackReplyToMode } from "./accounts-DHZuUL28.js";
import { c as normalizeSlackMessagingTarget, l as parseSlackTarget, r as createSlackWebClient, s as looksLikeSlackTargetId, u as resolveSlackChannelId } from "./client-Cm0jR4_W.js";
import { a as extractSlackToolSend, i as resolveSlackChannelType, n as listSlackDirectoryGroupsFromConfig, o as listSlackMessageActions, r as listSlackDirectoryPeersFromConfig, s as resolveSlackAutoThreadId, t as buildSlackThreadingToolContext } from "./threading-tool-context-BJ648I81.js";
import { m as slackApprovalCapability, n as resolveSlackGroupRequireMention, r as resolveSlackGroupToolPolicy, t as probeSlack, y as shouldSuppressLocalSlackExecApprovalPrompt } from "./probe-B3VY9yHG.js";
import { a as SLACK_TEXT_LIMIT, s as parseSlackBlocksInput, t as sendMessageSlack } from "./send-oLUIhqiG.js";
import { t as handleSlackAction } from "./action-runtime-DVOajs79.js";
import { n as isSlackInteractiveRepliesEnabled } from "./account-inspect-DmeovsZi.js";
import { i as buildSlackInteractiveBlocks, t as resolveSlackReplyBlocks } from "./reply-blocks-DnqQuiE5.js";
import { n as resolveSlackUserAllowlist } from "./resolve-channels-C2Alnm2a.js";
import { a as isSlackPluginAccountConfigured, i as createSlackPluginBase, n as slackSetupAdapter, o as slackConfigAdapter, r as SLACK_CHANNEL, t as slackSetupWizard } from "./setup-surface-BWKHSbc2.js";
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
	if (action === "upload-file") {
		const to = readStringParam(actionParams, "to") ?? resolveChannelId();
		const filePath = readStringParam(actionParams, "filePath", { trim: false }) ?? readStringParam(actionParams, "path", { trim: false }) ?? readStringParam(actionParams, "media", { trim: false });
		if (!filePath) throw new Error("upload-file requires filePath, path, or media");
		const threadId = readStringParam(actionParams, "threadId") ?? readStringParam(actionParams, "replyTo");
		return await invoke({
			action: "uploadFile",
			to,
			filePath,
			initialComment: readStringParam(actionParams, "initialComment", { allowEmpty: true }) ?? readStringParam(actionParams, "message", { allowEmpty: true }) ?? "",
			filename: readStringParam(actionParams, "filename"),
			title: readStringParam(actionParams, "title"),
			threadTs: threadId ?? void 0,
			accountId
		}, cfg, ctx.toolContext);
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
					mediaLocalRoots: ctx.mediaLocalRoots,
					mediaReadFile: ctx.mediaReadFile
				}))
			});
		}
	};
}
//#endregion
//#region extensions/slack/src/outbound-adapter.ts
const SLACK_MAX_BLOCKS = 50;
function resolveRenderedInteractiveBlocks(interactive) {
	if (!interactive) return;
	const blocks = buildSlackInteractiveBlocks(interactive);
	return blocks.length > 0 ? blocks : void 0;
}
function resolveSlackSendIdentity(identity) {
	if (!identity) return;
	const username = identity.name?.trim() || void 0;
	const iconUrl = identity.avatarUrl?.trim() || void 0;
	const rawEmoji = identity.emoji?.trim();
	const iconEmoji = !iconUrl && rawEmoji && /^:[^:\s]+:$/.test(rawEmoji) ? rawEmoji : void 0;
	if (!username && !iconUrl && !iconEmoji) return;
	return {
		username,
		iconUrl,
		iconEmoji
	};
}
async function applySlackMessageSendingHooks(params) {
	const hookRunner = getGlobalHookRunner();
	if (!hookRunner?.hasHooks("message_sending")) return {
		cancelled: false,
		text: params.text
	};
	const hookResult = await hookRunner.runMessageSending({
		to: params.to,
		content: params.text,
		metadata: {
			threadTs: params.threadTs,
			channelId: params.to,
			...params.mediaUrl ? { mediaUrl: params.mediaUrl } : {}
		}
	}, {
		channelId: "slack",
		accountId: params.accountId ?? void 0
	});
	if (hookResult?.cancel) return {
		cancelled: true,
		text: params.text
	};
	return {
		cancelled: false,
		text: hookResult?.content ?? params.text
	};
}
async function sendSlackOutboundMessage(params) {
	const send = resolveOutboundSendDep(params.deps, "slack") ?? sendMessageSlack;
	const threadTs = params.replyToId ?? (params.threadId != null ? String(params.threadId) : void 0);
	const hookResult = await applySlackMessageSendingHooks({
		to: params.to,
		text: params.text,
		threadTs,
		mediaUrl: params.mediaUrl,
		accountId: params.accountId ?? void 0
	});
	if (hookResult.cancelled) return {
		messageId: "cancelled-by-hook",
		channelId: params.to,
		meta: { cancelled: true }
	};
	const slackIdentity = resolveSlackSendIdentity(params.identity);
	return await send(params.to, hookResult.text, {
		cfg: params.cfg,
		threadTs,
		accountId: params.accountId ?? void 0,
		...params.mediaUrl ? {
			mediaUrl: params.mediaUrl,
			mediaAccess: params.mediaAccess,
			mediaLocalRoots: params.mediaLocalRoots,
			mediaReadFile: params.mediaReadFile
		} : {},
		...params.blocks ? { blocks: params.blocks } : {},
		...slackIdentity ? { identity: slackIdentity } : {}
	});
}
function resolveSlackBlocks(payload) {
	const slackData = payload.channelData?.slack;
	const renderedInteractive = resolveRenderedInteractiveBlocks(payload.interactive);
	if (!slackData || typeof slackData !== "object" || Array.isArray(slackData)) return renderedInteractive;
	const mergedBlocks = [...parseSlackBlocksInput(slackData.blocks) ?? [], ...renderedInteractive ?? []];
	if (mergedBlocks.length === 0) return;
	if (mergedBlocks.length > SLACK_MAX_BLOCKS) throw new Error(`Slack blocks cannot exceed ${SLACK_MAX_BLOCKS} items after interactive render`);
	return mergedBlocks;
}
const slackOutbound = {
	deliveryMode: "direct",
	chunker: null,
	textChunkLimit: SLACK_TEXT_LIMIT,
	sendPayload: async (ctx) => {
		const payload = {
			...ctx.payload,
			text: resolveInteractiveTextFallback({
				text: ctx.payload.text,
				interactive: ctx.payload.interactive
			}) ?? ""
		};
		const blocks = resolveSlackBlocks(payload);
		if (!blocks) return await sendTextMediaPayload({
			channel: "slack",
			ctx: {
				...ctx,
				payload
			},
			adapter: slackOutbound
		});
		return attachChannelToResult("slack", await sendPayloadMediaSequenceAndFinalize({
			text: "",
			mediaUrls: resolvePayloadMediaUrls(payload),
			send: async ({ text, mediaUrl }) => await sendSlackOutboundMessage({
				cfg: ctx.cfg,
				to: ctx.to,
				text,
				mediaUrl,
				mediaAccess: ctx.mediaAccess,
				mediaLocalRoots: ctx.mediaLocalRoots,
				mediaReadFile: ctx.mediaReadFile,
				accountId: ctx.accountId,
				deps: ctx.deps,
				replyToId: ctx.replyToId,
				threadId: ctx.threadId,
				identity: ctx.identity
			}),
			finalize: async () => await sendSlackOutboundMessage({
				cfg: ctx.cfg,
				to: ctx.to,
				text: payload.text ?? "",
				mediaAccess: ctx.mediaAccess,
				mediaLocalRoots: ctx.mediaLocalRoots,
				mediaReadFile: ctx.mediaReadFile,
				blocks,
				accountId: ctx.accountId,
				deps: ctx.deps,
				replyToId: ctx.replyToId,
				threadId: ctx.threadId,
				identity: ctx.identity
			})
		}));
	},
	...createAttachedChannelResultAdapter({
		channel: "slack",
		sendText: async ({ cfg, to, text, accountId, deps, replyToId, threadId, identity }) => await sendSlackOutboundMessage({
			cfg,
			to,
			text,
			accountId,
			deps,
			replyToId,
			threadId,
			identity
		}),
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaAccess, mediaLocalRoots, mediaReadFile, accountId, deps, replyToId, threadId, identity }) => await sendSlackOutboundMessage({
			cfg,
			to,
			text,
			mediaUrl,
			mediaAccess,
			mediaLocalRoots,
			mediaReadFile,
			accountId,
			deps,
			replyToId,
			threadId,
			identity
		})
	})
};
//#endregion
//#region extensions/slack/src/runtime.ts
const { setRuntime: setSlackRuntime, clearRuntime: clearSlackRuntime, getRuntime: getSlackRuntime } = createPluginRuntimeStore("Slack runtime not initialized");
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
const resolveSlackDmPolicy = createScopedDmSecurityResolver({
	channelKey: "slack",
	resolvePolicy: (account) => account.dm?.policy,
	resolveAllowFrom: (account) => account.dm?.allowFrom,
	allowFromPathSuffix: "dm.",
	normalizeEntry: (raw) => raw.trim().replace(/^(slack|user):/i, "").trim()
});
function resolveSlackProbe() {
	try {
		return getSlackRuntime().channel.slack.probeSlack;
	} catch (error) {
		if (error instanceof Error && error.message === "Slack runtime not initialized") return probeSlack;
		throw error;
	}
}
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
		approvalCapability: slackApprovalCapability,
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
				try {
					return Boolean(resolveSlackReplyBlocks(payload)?.length);
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
				return await resolveSlackProbe()(token, timeoutMs);
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
		resolveAutoThreadId: ({ to, toolContext, replyToId }) => replyToId ? void 0 : resolveSlackAutoThreadId({
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
			textChunkLimit: SLACK_TEXT_LIMIT,
			shouldSuppressLocalPayloadPrompt: ({ cfg, accountId, payload }) => shouldSuppressLocalSlackExecApprovalPrompt({
				cfg,
				accountId,
				payload
			}),
			sendPayload: async (ctx) => {
				const { send, tokenOverride } = resolveSlackSendContext({
					cfg: ctx.cfg,
					accountId: ctx.accountId ?? void 0,
					deps: ctx.deps,
					replyToId: ctx.replyToId,
					threadId: ctx.threadId
				});
				return await slackOutbound.sendPayload({
					...ctx,
					deps: {
						...ctx.deps ?? {},
						slack: async (to, text, opts) => await send(to, text, {
							...opts,
							...tokenOverride ? { token: tokenOverride } : {}
						})
					}
				});
			}
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
export { createSlackActions as i, setSlackRuntime as n, slackOutbound as r, slackPlugin as t };
