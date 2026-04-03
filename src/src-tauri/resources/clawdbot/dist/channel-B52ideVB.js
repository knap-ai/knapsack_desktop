import { g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { c as GroupPolicySchema, m as MarkdownConfigSchema } from "./zod-schema.core-Cx4hqkoC.js";
import { i as buildNestedDmConfigSchema, r as buildChannelConfigSchema, t as AllowFromListSchema } from "./config-schema-BoSEJoAt.js";
import { o as ToolPolicySchema } from "./zod-schema.agent-runtime-BB53-_4o.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-DoFheDS-.js";
import { c as collectStatusIssuesFromLastError, d as createDefaultChannelRuntimeState, i as buildProbeChannelStatusSummary, u as createComputedAccountStatusAdapter } from "./status-helpers-CtpWf3f1.js";
import { d as readNumberParam, h as readStringParam, i as createActionGate } from "./common-RGbDbB5n.js";
import { n as describeAccountSnapshot } from "./account-helpers-DqNwQN08.js";
import { c as createScopedChannelConfigAdapter, t as adaptScopedAccountAccessor, u as createScopedDmSecurityResolver } from "./channel-config-helpers-B0S2z66F.js";
import { i as createLazyRuntimeNamedExport } from "./lazy-runtime-B4PzSTA5.js";
import { t as createScopedAccountReplyToModeResolver } from "./threading-helpers-CfImLdqa.js";
import { o as stripChannelTargetPrefix, r as createChatChannelPlugin, s as stripTargetKindPrefix, t as buildChannelOutboundSessionRoute } from "./core-BghMcc08.js";
import { r as buildSecretInputSchema } from "./secret-input-C8U7qpTM.js";
import "./channel-config-schema-BAlK8Vas.js";
import { f as createAllowlistProviderOpenWarningCollector, y as projectAccountConfigWarningCollector } from "./group-policy-warnings-B8ZU4B4D.js";
import "./channel-policy-Dqo0XdDX.js";
import { t as createChannelDirectoryAdapter } from "./directory-runtime-Rwkajwwt.js";
import { i as createResolvedDirectoryEntriesLister } from "./directory-config-helpers-C_EYixJ2.js";
import { n as createRuntimeOutboundDelegates, t as createRuntimeDirectoryLiveAdapter } from "./runtime-forwarders-RaV_r9tr.js";
import { d as createResolvedApproverActionAuthAdapter, t as resolveApprovalApprovers } from "./approval-runtime-8-_vGYcG.js";
import "./outbound-runtime-D_hcnwUl.js";
import "./conversation-runtime-DIsQmaYR.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-Nk7oRFrM.js";
import { r as buildTrafficStatusSummary } from "./extension-shared-gP7gKXlS.js";
import "./channel-status-BM83XYut.js";
import { t as zod_exports } from "./zod-DCTDn17d.js";
import { n as requiresExplicitMatrixDefaultAccount } from "./account-selection-BoMWBXkb.js";
import { s as resolveMatrixAccountConfig } from "./config-paths-TkWX6drG.js";
import { i as resolveMatrixAccount, r as resolveDefaultMatrixAccountId, t as listMatrixAccountIds } from "./accounts-CPOjCaWO.js";
import "./runtime-api-eE9m_2UG.js";
import { n as normalizeMatrixAllowList, r as normalizeMatrixUserId, t as resolveMatrixRoomConfig } from "./rooms-CPmdn4pI.js";
import { a as resolveMatrixTargetIdentity, i as resolveMatrixDirectUserId, n as normalizeMatrixMessagingTarget, r as normalizeMatrixResolvableTarget } from "./target-ids-CDZUajR8.js";
import { f as setMatrixThreadBindingMaxAgeBySessionKey, u as setMatrixThreadBindingIdleTimeoutBySessionKey } from "./thread-bindings-shared-C0nky8nQ.js";
import { t as matrixSetupAdapter } from "./setup-core-3bGKNCBW.js";
import { t as matrixOnboardingAdapter } from "./setup-surface-BkGmQ-VW.js";
import { Type } from "@sinclair/typebox";
//#region extensions/matrix/src/actions.ts
const MATRIX_PLUGIN_HANDLED_ACTIONS = new Set([
	"send",
	"poll-vote",
	"react",
	"reactions",
	"read",
	"edit",
	"delete",
	"pin",
	"unpin",
	"list-pins",
	"set-profile",
	"member-info",
	"channel-info",
	"permissions"
]);
function createMatrixExposedActions(params) {
	const actions = new Set(["poll", "poll-vote"]);
	if (params.gate("messages")) {
		actions.add("send");
		actions.add("read");
		actions.add("edit");
		actions.add("delete");
	}
	if (params.gate("reactions")) {
		actions.add("react");
		actions.add("reactions");
	}
	if (params.gate("pins")) {
		actions.add("pin");
		actions.add("unpin");
		actions.add("list-pins");
	}
	if (params.gate("profile")) actions.add("set-profile");
	if (params.gate("memberInfo")) actions.add("member-info");
	if (params.gate("channelInfo")) actions.add("channel-info");
	if (params.encryptionEnabled && params.gate("verification")) actions.add("permissions");
	return actions;
}
function buildMatrixProfileToolSchema() {
	return { properties: {
		displayName: Type.Optional(Type.String({ description: "Profile display name for Matrix self-profile update actions." })),
		display_name: Type.Optional(Type.String({ description: "snake_case alias of displayName for Matrix self-profile update actions." })),
		avatarUrl: Type.Optional(Type.String({ description: "Profile avatar URL for Matrix self-profile update actions. Matrix accepts mxc:// and http(s) URLs." })),
		avatar_url: Type.Optional(Type.String({ description: "snake_case alias of avatarUrl for Matrix self-profile update actions. Matrix accepts mxc:// and http(s) URLs." })),
		avatarPath: Type.Optional(Type.String({ description: "Local avatar file path for Matrix self-profile update actions. Matrix uploads this file and sets the resulting MXC URI." })),
		avatar_path: Type.Optional(Type.String({ description: "snake_case alias of avatarPath for Matrix self-profile update actions. Matrix uploads this file and sets the resulting MXC URI." }))
	} };
}
const matrixMessageActions = {
	describeMessageTool: ({ cfg }) => {
		const resolvedCfg = cfg;
		if (requiresExplicitMatrixDefaultAccount(resolvedCfg)) return {
			actions: [],
			capabilities: []
		};
		const account = resolveMatrixAccount({
			cfg: resolvedCfg,
			accountId: resolveDefaultMatrixAccountId(resolvedCfg)
		});
		if (!account.enabled || !account.configured) return {
			actions: [],
			capabilities: []
		};
		const actions = createMatrixExposedActions({
			gate: createActionGate(account.config.actions),
			encryptionEnabled: account.config.encryption === true
		});
		const listedActions = Array.from(actions);
		return {
			actions: listedActions,
			capabilities: [],
			schema: listedActions.includes("set-profile") ? buildMatrixProfileToolSchema() : null
		};
	},
	supportsAction: ({ action }) => MATRIX_PLUGIN_HANDLED_ACTIONS.has(action),
	extractToolSend: ({ args }) => {
		if ((typeof args.action === "string" ? args.action.trim() : "") !== "sendMessage") return null;
		const to = typeof args.to === "string" ? args.to : void 0;
		if (!to) return null;
		return { to };
	},
	handleAction: async (ctx) => {
		const { handleMatrixAction } = await import("./tool-actions.runtime-iMGh04Y4.js");
		const { action, params, cfg, accountId, mediaLocalRoots } = ctx;
		const dispatch = async (actionParams) => await handleMatrixAction({
			...actionParams,
			...accountId ? { accountId } : {}
		}, cfg, { mediaLocalRoots });
		const resolveRoomId = () => readStringParam(params, "roomId") ?? readStringParam(params, "channelId") ?? readStringParam(params, "to", { required: true });
		if (action === "send") {
			const to = readStringParam(params, "to", { required: true });
			const mediaUrl = readStringParam(params, "media", { trim: false }) ?? readStringParam(params, "mediaUrl", { trim: false }) ?? readStringParam(params, "filePath", { trim: false }) ?? readStringParam(params, "path", { trim: false });
			const content = readStringParam(params, "message", {
				required: !mediaUrl,
				allowEmpty: true
			});
			const replyTo = readStringParam(params, "replyTo");
			const threadId = readStringParam(params, "threadId");
			const audioAsVoice = typeof params.asVoice === "boolean" ? params.asVoice : typeof params.audioAsVoice === "boolean" ? params.audioAsVoice : void 0;
			return await dispatch({
				action: "sendMessage",
				to,
				content,
				mediaUrl: mediaUrl ?? void 0,
				replyToId: replyTo ?? void 0,
				threadId: threadId ?? void 0,
				audioAsVoice
			});
		}
		if (action === "poll-vote") return await dispatch({
			...params,
			action: "pollVote"
		});
		if (action === "react") {
			const messageId = readStringParam(params, "messageId", { required: true });
			const emoji = readStringParam(params, "emoji", { allowEmpty: true });
			const remove = typeof params.remove === "boolean" ? params.remove : void 0;
			return await dispatch({
				action: "react",
				roomId: resolveRoomId(),
				messageId,
				emoji,
				remove
			});
		}
		if (action === "reactions") {
			const messageId = readStringParam(params, "messageId", { required: true });
			const limit = readNumberParam(params, "limit", { integer: true });
			return await dispatch({
				action: "reactions",
				roomId: resolveRoomId(),
				messageId,
				limit
			});
		}
		if (action === "read") {
			const limit = readNumberParam(params, "limit", { integer: true });
			return await dispatch({
				action: "readMessages",
				roomId: resolveRoomId(),
				limit,
				before: readStringParam(params, "before"),
				after: readStringParam(params, "after")
			});
		}
		if (action === "edit") {
			const messageId = readStringParam(params, "messageId", { required: true });
			const content = readStringParam(params, "message", { required: true });
			return await dispatch({
				action: "editMessage",
				roomId: resolveRoomId(),
				messageId,
				content
			});
		}
		if (action === "delete") {
			const messageId = readStringParam(params, "messageId", { required: true });
			return await dispatch({
				action: "deleteMessage",
				roomId: resolveRoomId(),
				messageId
			});
		}
		if (action === "pin" || action === "unpin" || action === "list-pins") {
			const messageId = action === "list-pins" ? void 0 : readStringParam(params, "messageId", { required: true });
			return await dispatch({
				action: action === "pin" ? "pinMessage" : action === "unpin" ? "unpinMessage" : "listPins",
				roomId: resolveRoomId(),
				messageId
			});
		}
		if (action === "set-profile") {
			const avatarPath = readStringParam(params, "avatarPath") ?? readStringParam(params, "path") ?? readStringParam(params, "filePath");
			return await dispatch({
				action: "setProfile",
				displayName: readStringParam(params, "displayName") ?? readStringParam(params, "name"),
				avatarUrl: readStringParam(params, "avatarUrl"),
				avatarPath
			});
		}
		if (action === "member-info") return await dispatch({
			action: "memberInfo",
			userId: readStringParam(params, "userId", { required: true }),
			roomId: readStringParam(params, "roomId") ?? readStringParam(params, "channelId")
		});
		if (action === "channel-info") return await dispatch({
			action: "channelInfo",
			roomId: resolveRoomId()
		});
		if (action === "permissions") {
			const operation = (readStringParam(params, "operation") ?? readStringParam(params, "mode") ?? "verification-list").trim().toLowerCase();
			const operationToAction = {
				"encryption-status": "encryptionStatus",
				"verification-status": "verificationStatus",
				"verification-bootstrap": "verificationBootstrap",
				"verification-recovery-key": "verificationRecoveryKey",
				"verification-backup-status": "verificationBackupStatus",
				"verification-backup-restore": "verificationBackupRestore",
				"verification-list": "verificationList",
				"verification-request": "verificationRequest",
				"verification-accept": "verificationAccept",
				"verification-cancel": "verificationCancel",
				"verification-start": "verificationStart",
				"verification-generate-qr": "verificationGenerateQr",
				"verification-scan-qr": "verificationScanQr",
				"verification-sas": "verificationSas",
				"verification-confirm": "verificationConfirm",
				"verification-mismatch": "verificationMismatch",
				"verification-confirm-qr": "verificationConfirmQr"
			};
			const resolvedAction = operationToAction[operation];
			if (!resolvedAction) throw new Error(`Unsupported Matrix permissions operation: ${operation}. Supported values: ${Object.keys(operationToAction).join(", ")}`);
			return await dispatch({
				...params,
				action: resolvedAction
			});
		}
		throw new Error(`Action ${action} is not supported for provider matrix.`);
	}
};
//#endregion
//#region extensions/matrix/src/approval-auth.ts
function normalizeMatrixApproverId(value) {
	return normalizeMatrixUserId(String(value)) || void 0;
}
const matrixApprovalAuth = createResolvedApproverActionAuthAdapter({
	channelLabel: "Matrix",
	resolveApprovers: ({ cfg, accountId }) => {
		return resolveApprovalApprovers({
			allowFrom: resolveMatrixAccount({
				cfg,
				accountId
			}).config.dm?.allowFrom,
			normalizeApprover: normalizeMatrixApproverId
		});
	},
	normalizeSenderId: (value) => normalizeMatrixApproverId(value)
});
//#endregion
//#region extensions/matrix/src/config-schema.ts
const matrixActionSchema = zod_exports.z.object({
	reactions: zod_exports.z.boolean().optional(),
	messages: zod_exports.z.boolean().optional(),
	pins: zod_exports.z.boolean().optional(),
	profile: zod_exports.z.boolean().optional(),
	memberInfo: zod_exports.z.boolean().optional(),
	channelInfo: zod_exports.z.boolean().optional(),
	verification: zod_exports.z.boolean().optional()
}).optional();
const matrixThreadBindingsSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().optional(),
	idleHours: zod_exports.z.number().nonnegative().optional(),
	maxAgeHours: zod_exports.z.number().nonnegative().optional(),
	spawnSubagentSessions: zod_exports.z.boolean().optional(),
	spawnAcpSessions: zod_exports.z.boolean().optional()
}).optional();
const matrixRoomSchema = zod_exports.z.object({
	account: zod_exports.z.string().optional(),
	enabled: zod_exports.z.boolean().optional(),
	allow: zod_exports.z.boolean().optional(),
	requireMention: zod_exports.z.boolean().optional(),
	allowBots: zod_exports.z.union([zod_exports.z.boolean(), zod_exports.z.literal("mentions")]).optional(),
	tools: ToolPolicySchema,
	autoReply: zod_exports.z.boolean().optional(),
	users: AllowFromListSchema,
	skills: zod_exports.z.array(zod_exports.z.string()).optional(),
	systemPrompt: zod_exports.z.string().optional()
}).optional();
const MatrixConfigSchema = zod_exports.z.object({
	name: zod_exports.z.string().optional(),
	enabled: zod_exports.z.boolean().optional(),
	defaultAccount: zod_exports.z.string().optional(),
	accounts: zod_exports.z.record(zod_exports.z.string(), zod_exports.z.unknown()).optional(),
	markdown: MarkdownConfigSchema,
	homeserver: zod_exports.z.string().optional(),
	allowPrivateNetwork: zod_exports.z.boolean().optional(),
	proxy: zod_exports.z.string().optional(),
	userId: zod_exports.z.string().optional(),
	accessToken: buildSecretInputSchema().optional(),
	password: buildSecretInputSchema().optional(),
	deviceId: zod_exports.z.string().optional(),
	deviceName: zod_exports.z.string().optional(),
	avatarUrl: zod_exports.z.string().optional(),
	initialSyncLimit: zod_exports.z.number().optional(),
	encryption: zod_exports.z.boolean().optional(),
	allowlistOnly: zod_exports.z.boolean().optional(),
	allowBots: zod_exports.z.union([zod_exports.z.boolean(), zod_exports.z.literal("mentions")]).optional(),
	groupPolicy: GroupPolicySchema.optional(),
	blockStreaming: zod_exports.z.boolean().optional(),
	streaming: zod_exports.z.union([zod_exports.z.enum(["partial", "off"]), zod_exports.z.boolean()]).optional(),
	replyToMode: zod_exports.z.enum([
		"off",
		"first",
		"all"
	]).optional(),
	threadReplies: zod_exports.z.enum([
		"off",
		"inbound",
		"always"
	]).optional(),
	textChunkLimit: zod_exports.z.number().optional(),
	chunkMode: zod_exports.z.enum(["length", "newline"]).optional(),
	responsePrefix: zod_exports.z.string().optional(),
	ackReaction: zod_exports.z.string().optional(),
	ackReactionScope: zod_exports.z.enum([
		"group-mentions",
		"group-all",
		"direct",
		"all",
		"none",
		"off"
	]).optional(),
	reactionNotifications: zod_exports.z.enum(["off", "own"]).optional(),
	threadBindings: matrixThreadBindingsSchema,
	startupVerification: zod_exports.z.enum(["off", "if-unverified"]).optional(),
	startupVerificationCooldownHours: zod_exports.z.number().optional(),
	mediaMaxMb: zod_exports.z.number().optional(),
	historyLimit: zod_exports.z.number().int().min(0).optional(),
	autoJoin: zod_exports.z.enum([
		"always",
		"allowlist",
		"off"
	]).optional(),
	autoJoinAllowlist: AllowFromListSchema,
	groupAllowFrom: AllowFromListSchema,
	dm: buildNestedDmConfigSchema({ threadReplies: zod_exports.z.enum([
		"off",
		"inbound",
		"always"
	]).optional() }),
	groups: zod_exports.z.object({}).catchall(matrixRoomSchema).optional(),
	rooms: zod_exports.z.object({}).catchall(matrixRoomSchema).optional(),
	actions: matrixActionSchema
});
//#endregion
//#region extensions/matrix/src/group-mentions.ts
function resolveMatrixRoomConfigForGroup(params) {
	const roomId = normalizeMatrixResolvableTarget(params.groupId?.trim() ?? "");
	const groupChannel = params.groupChannel?.trim() ?? "";
	const aliases = groupChannel ? [normalizeMatrixResolvableTarget(groupChannel)] : [];
	const cfg = params.cfg;
	const matrixConfig = resolveMatrixAccountConfig({
		cfg,
		accountId: params.accountId
	});
	return resolveMatrixRoomConfig({
		rooms: matrixConfig.groups ?? matrixConfig.rooms,
		roomId,
		aliases
	}).config;
}
function resolveMatrixGroupRequireMention(params) {
	const resolved = resolveMatrixRoomConfigForGroup(params);
	if (resolved) {
		if (resolved.autoReply === true) return false;
		if (resolved.autoReply === false) return true;
		if (typeof resolved.requireMention === "boolean") return resolved.requireMention;
	}
	return true;
}
function resolveMatrixGroupToolPolicy(params) {
	return resolveMatrixRoomConfigForGroup(params)?.tools;
}
//#endregion
//#region extensions/matrix/src/session-route.ts
function resolveMatrixOutboundSessionRoute(params) {
	const stripped = stripChannelTargetPrefix(params.target, "matrix");
	const isUser = params.resolvedTarget?.kind === "user" || stripped.startsWith("@") || /^user:/i.test(stripped);
	const rawId = stripTargetKindPrefix(stripped);
	if (!rawId) return null;
	return buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "matrix",
		accountId: params.accountId,
		peer: {
			kind: isUser ? "direct" : "channel",
			id: rawId
		},
		chatType: isUser ? "direct" : "channel",
		from: isUser ? `matrix:${rawId}` : `matrix:channel:${rawId}`,
		to: `room:${rawId}`
	});
}
//#endregion
//#region extensions/matrix/src/channel.ts
let matrixStartupLock = Promise.resolve();
function chunkTextForOutbound(text, limit) {
	const chunks = [];
	let remaining = text;
	while (remaining.length > limit) {
		const window = remaining.slice(0, limit);
		const splitAt = Math.max(window.lastIndexOf("\n"), window.lastIndexOf(" "));
		const breakAt = splitAt > 0 ? splitAt : limit;
		chunks.push(remaining.slice(0, breakAt).trimEnd());
		remaining = remaining.slice(breakAt).trimStart();
	}
	if (remaining.length > 0 || text.length === 0) chunks.push(remaining);
	return chunks;
}
const loadMatrixChannelRuntime = createLazyRuntimeNamedExport(() => import("./channel.runtime-4-VCn5oQ.js"), "matrixChannelRuntime");
const meta = {
	id: "matrix",
	label: "Matrix",
	selectionLabel: "Matrix (plugin)",
	docsPath: "/channels/matrix",
	docsLabel: "matrix",
	blurb: "open protocol; configure a homeserver + access token.",
	order: 70,
	quickstartAllowFrom: true
};
const listMatrixDirectoryPeersFromConfig = createResolvedDirectoryEntriesLister({
	kind: "user",
	resolveAccount: adaptScopedAccountAccessor(resolveMatrixAccount),
	resolveSources: (account) => [
		account.config.dm?.allowFrom ?? [],
		account.config.groupAllowFrom ?? [],
		...Object.values(account.config.groups ?? account.config.rooms ?? {}).map((room) => room.users ?? [])
	],
	normalizeId: (entry) => {
		const raw = entry.replace(/^matrix:/i, "").trim();
		if (!raw || raw === "*") return null;
		const cleaned = raw.toLowerCase().startsWith("user:") ? raw.slice(5).trim() : raw;
		return cleaned.startsWith("@") ? `user:${cleaned}` : cleaned;
	}
});
const listMatrixDirectoryGroupsFromConfig = createResolvedDirectoryEntriesLister({
	kind: "group",
	resolveAccount: adaptScopedAccountAccessor(resolveMatrixAccount),
	resolveSources: (account) => [Object.keys(account.config.groups ?? account.config.rooms ?? {})],
	normalizeId: (entry) => {
		const raw = entry.replace(/^matrix:/i, "").trim();
		if (!raw || raw === "*") return null;
		const lowered = raw.toLowerCase();
		if (lowered.startsWith("room:") || lowered.startsWith("channel:")) return raw;
		return raw.startsWith("!") ? `room:${raw}` : raw;
	}
});
const matrixConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: "matrix",
	listAccountIds: listMatrixAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveMatrixAccount),
	resolveAccessorAccount: ({ cfg, accountId }) => resolveMatrixAccountConfig({
		cfg,
		accountId
	}),
	defaultAccountId: resolveDefaultMatrixAccountId,
	clearBaseFields: [
		"name",
		"homeserver",
		"allowPrivateNetwork",
		"proxy",
		"userId",
		"accessToken",
		"password",
		"deviceId",
		"deviceName",
		"avatarUrl",
		"initialSyncLimit"
	],
	resolveAllowFrom: (account) => account.dm?.allowFrom,
	formatAllowFrom: (allowFrom) => normalizeMatrixAllowList(allowFrom)
});
const resolveMatrixDmPolicy = createScopedDmSecurityResolver({
	channelKey: "matrix",
	resolvePolicy: (account) => account.config.dm?.policy,
	resolveAllowFrom: (account) => account.config.dm?.allowFrom,
	allowFromPathSuffix: "dm.",
	normalizeEntry: (raw) => normalizeMatrixUserId(raw)
});
const collectMatrixSecurityWarnings = createAllowlistProviderOpenWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.matrix !== void 0,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	buildOpenWarning: {
		surface: "Matrix rooms",
		openBehavior: "allows any room to trigger (mention-gated)",
		remediation: "Set channels.matrix.groupPolicy=\"allowlist\" + channels.matrix.groups (and optionally channels.matrix.groupAllowFrom) to restrict rooms"
	}
});
function resolveMatrixAccountConfigPath(accountId, field) {
	return accountId === "default" ? `channels.matrix.${field}` : `channels.matrix.accounts.${accountId}.${field}`;
}
function collectMatrixSecurityWarningsForAccount(params) {
	const warnings = collectMatrixSecurityWarnings(params);
	if (params.account.accountId !== "default") {
		const groupPolicyPath = resolveMatrixAccountConfigPath(params.account.accountId, "groupPolicy");
		const groupsPath = resolveMatrixAccountConfigPath(params.account.accountId, "groups");
		const groupAllowFromPath = resolveMatrixAccountConfigPath(params.account.accountId, "groupAllowFrom");
		return warnings.map((warning) => warning.replace("channels.matrix.groupPolicy", groupPolicyPath).replace("channels.matrix.groups", groupsPath).replace("channels.matrix.groupAllowFrom", groupAllowFromPath));
	}
	if (params.account.config.autoJoin !== "always") return warnings;
	const autoJoinPath = resolveMatrixAccountConfigPath(params.account.accountId, "autoJoin");
	const autoJoinAllowlistPath = resolveMatrixAccountConfigPath(params.account.accountId, "autoJoinAllowlist");
	return [...warnings, `- Matrix invites: autoJoin="always" joins any invited room before message policy applies. Set ${autoJoinPath}="allowlist" + ${autoJoinAllowlistPath} (or ${autoJoinPath}="off") to restrict joins.`];
}
function normalizeMatrixAcpConversationId(conversationId) {
	const target = resolveMatrixTargetIdentity(conversationId);
	if (!target || target.kind !== "room") return null;
	return { conversationId: target.id };
}
function matchMatrixAcpConversation(params) {
	const binding = normalizeMatrixAcpConversationId(params.bindingConversationId);
	if (!binding) return null;
	if (binding.conversationId === params.conversationId) return {
		conversationId: params.conversationId,
		matchPriority: 2
	};
	if (params.parentConversationId && params.parentConversationId !== params.conversationId && binding.conversationId === params.parentConversationId) return {
		conversationId: params.parentConversationId,
		matchPriority: 1
	};
	return null;
}
function resolveMatrixCommandConversation(params) {
	const parentConversationId = [
		params.originatingTo,
		params.commandTo,
		params.fallbackTo
	].map((candidate) => {
		const trimmed = candidate?.trim();
		if (!trimmed) return;
		const target = resolveMatrixTargetIdentity(trimmed);
		return target?.kind === "room" ? target.id : void 0;
	}).find((candidate) => Boolean(candidate));
	if (params.threadId) return {
		conversationId: params.threadId,
		...parentConversationId ? { parentConversationId } : {}
	};
	return parentConversationId ? { conversationId: parentConversationId } : null;
}
const matrixPlugin = createChatChannelPlugin({
	base: {
		id: "matrix",
		meta,
		setupWizard: matrixOnboardingAdapter,
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"thread"
			],
			polls: true,
			reactions: true,
			threads: true,
			media: true
		},
		reload: { configPrefixes: ["channels.matrix"] },
		configSchema: buildChannelConfigSchema(MatrixConfigSchema),
		config: {
			...matrixConfigAdapter,
			isConfigured: (account) => account.configured,
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: account.configured,
				extra: { baseUrl: account.homeserver }
			})
		},
		auth: matrixApprovalAuth,
		groups: {
			resolveRequireMention: resolveMatrixGroupRequireMention,
			resolveToolPolicy: resolveMatrixGroupToolPolicy
		},
		conversationBindings: {
			supportsCurrentConversationBinding: true,
			setIdleTimeoutBySessionKey: ({ targetSessionKey, accountId, idleTimeoutMs }) => setMatrixThreadBindingIdleTimeoutBySessionKey({
				targetSessionKey,
				accountId: accountId ?? "",
				idleTimeoutMs
			}).map((binding) => ({
				boundAt: binding.boundAt,
				lastActivityAt: typeof binding.metadata?.lastActivityAt === "number" ? binding.metadata.lastActivityAt : binding.boundAt,
				idleTimeoutMs: typeof binding.metadata?.idleTimeoutMs === "number" ? binding.metadata.idleTimeoutMs : void 0,
				maxAgeMs: typeof binding.metadata?.maxAgeMs === "number" ? binding.metadata.maxAgeMs : void 0
			})),
			setMaxAgeBySessionKey: ({ targetSessionKey, accountId, maxAgeMs }) => setMatrixThreadBindingMaxAgeBySessionKey({
				targetSessionKey,
				accountId: accountId ?? "",
				maxAgeMs
			}).map((binding) => ({
				boundAt: binding.boundAt,
				lastActivityAt: typeof binding.metadata?.lastActivityAt === "number" ? binding.metadata.lastActivityAt : binding.boundAt,
				idleTimeoutMs: typeof binding.metadata?.idleTimeoutMs === "number" ? binding.metadata.idleTimeoutMs : void 0,
				maxAgeMs: typeof binding.metadata?.maxAgeMs === "number" ? binding.metadata.maxAgeMs : void 0
			}))
		},
		messaging: {
			normalizeTarget: normalizeMatrixMessagingTarget,
			resolveOutboundSessionRoute: (params) => resolveMatrixOutboundSessionRoute(params),
			targetResolver: {
				looksLikeId: (raw) => {
					const trimmed = raw.trim();
					if (!trimmed) return false;
					if (/^(matrix:)?[!#@]/i.test(trimmed)) return true;
					return trimmed.includes(":");
				},
				hint: "<room|alias|user>"
			}
		},
		directory: createChannelDirectoryAdapter({
			listPeers: async (params) => {
				return (await listMatrixDirectoryPeersFromConfig(params)).map((entry) => {
					const raw = entry.id.startsWith("user:") ? entry.id.slice(5) : entry.id;
					return !raw.startsWith("@") || !raw.includes(":") ? {
						...entry,
						name: "incomplete id; expected @user:server"
					} : entry;
				});
			},
			listGroups: async (params) => await listMatrixDirectoryGroupsFromConfig(params),
			...createRuntimeDirectoryLiveAdapter({
				getRuntime: loadMatrixChannelRuntime,
				listPeersLive: (runtime) => runtime.listMatrixDirectoryPeersLive,
				listGroupsLive: (runtime) => runtime.listMatrixDirectoryGroupsLive
			})
		}),
		resolver: { resolveTargets: async ({ cfg, accountId, inputs, kind, runtime }) => (await loadMatrixChannelRuntime()).resolveMatrixTargets({
			cfg,
			accountId,
			inputs,
			kind,
			runtime
		}) },
		actions: matrixMessageActions,
		setup: matrixSetupAdapter,
		bindings: {
			compileConfiguredBinding: ({ conversationId }) => normalizeMatrixAcpConversationId(conversationId),
			matchInboundConversation: ({ compiledBinding, conversationId, parentConversationId }) => matchMatrixAcpConversation({
				bindingConversationId: compiledBinding.conversationId,
				conversationId,
				parentConversationId
			}),
			resolveCommandConversation: ({ threadId, originatingTo, commandTo, fallbackTo }) => resolveMatrixCommandConversation({
				threadId,
				originatingTo,
				commandTo,
				fallbackTo
			})
		},
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			collectStatusIssues: (accounts) => collectStatusIssuesFromLastError("matrix", accounts),
			buildChannelSummary: ({ snapshot }) => buildProbeChannelStatusSummary(snapshot, { baseUrl: snapshot.baseUrl ?? null }),
			probeAccount: async ({ account, timeoutMs, cfg }) => {
				try {
					const { probeMatrix, resolveMatrixAuth } = await loadMatrixChannelRuntime();
					const auth = await resolveMatrixAuth({
						cfg,
						accountId: account.accountId
					});
					return await probeMatrix({
						homeserver: auth.homeserver,
						accessToken: auth.accessToken,
						userId: auth.userId,
						timeoutMs,
						accountId: account.accountId,
						allowPrivateNetwork: auth.allowPrivateNetwork,
						ssrfPolicy: auth.ssrfPolicy,
						dispatcherPolicy: auth.dispatcherPolicy
					});
				} catch (err) {
					return {
						ok: false,
						error: err instanceof Error ? err.message : String(err),
						elapsedMs: 0
					};
				}
			},
			resolveAccountSnapshot: ({ account, runtime }) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.configured,
				extra: {
					baseUrl: account.homeserver,
					lastProbeAt: runtime?.lastProbeAt ?? null,
					...buildTrafficStatusSummary(runtime)
				}
			})
		}),
		gateway: { startAccount: async (ctx) => {
			const account = ctx.account;
			ctx.setStatus({
				accountId: account.accountId,
				baseUrl: account.homeserver
			});
			ctx.log?.info(`[${account.accountId}] starting provider (${account.homeserver ?? "matrix"})`);
			const previousLock = matrixStartupLock;
			let releaseLock = () => {};
			matrixStartupLock = new Promise((resolve) => {
				releaseLock = resolve;
			});
			await previousLock;
			let monitorMatrixProvider;
			try {
				monitorMatrixProvider = (await import("./monitor-iqrzqhSa2.js")).monitorMatrixProvider;
			} finally {
				releaseLock();
			}
			return monitorMatrixProvider({
				runtime: ctx.runtime,
				abortSignal: ctx.abortSignal,
				mediaMaxMb: account.config.mediaMaxMb,
				initialSyncLimit: account.config.initialSyncLimit,
				replyToMode: account.config.replyToMode,
				accountId: account.accountId
			});
		} }
	},
	security: {
		resolveDmPolicy: resolveMatrixDmPolicy,
		collectWarnings: projectAccountConfigWarningCollector((cfg) => cfg, collectMatrixSecurityWarningsForAccount)
	},
	pairing: { text: {
		idLabel: "matrixUserId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: createPairingPrefixStripper(/^matrix:/i),
		notify: async ({ id, message, accountId }) => {
			const { sendMessageMatrix } = await loadMatrixChannelRuntime();
			await sendMessageMatrix(`user:${id}`, message, { ...accountId ? { accountId } : {} });
		}
	} },
	threading: {
		resolveReplyToMode: createScopedAccountReplyToModeResolver({
			resolveAccount: adaptScopedAccountAccessor(resolveMatrixAccountConfig),
			resolveReplyToMode: (account) => account.replyToMode
		}),
		buildToolContext: ({ context, hasRepliedRef }) => {
			return {
				currentChannelId: context.To?.trim() || void 0,
				currentThreadTs: context.MessageThreadId != null ? String(context.MessageThreadId) : void 0,
				currentDirectUserId: resolveMatrixDirectUserId({
					from: context.From,
					to: context.To,
					chatType: context.ChatType
				}),
				hasRepliedRef
			};
		}
	},
	outbound: {
		deliveryMode: "direct",
		chunker: chunkTextForOutbound,
		chunkerMode: "markdown",
		textChunkLimit: 4e3,
		...createRuntimeOutboundDelegates({
			getRuntime: loadMatrixChannelRuntime,
			sendText: {
				resolve: (runtime) => runtime.matrixOutbound.sendText,
				unavailableMessage: "Matrix outbound text delivery is unavailable"
			},
			sendMedia: {
				resolve: (runtime) => runtime.matrixOutbound.sendMedia,
				unavailableMessage: "Matrix outbound media delivery is unavailable"
			},
			sendPoll: {
				resolve: (runtime) => runtime.matrixOutbound.sendPoll,
				unavailableMessage: "Matrix outbound poll delivery is unavailable"
			}
		})
	}
});
//#endregion
export { matrixPlugin as t };
