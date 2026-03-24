import { g as DEFAULT_ACCOUNT_ID } from "./session-key-DAhnzjyr.js";
import { o as ToolPolicySchema } from "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import { c as GroupPolicySchema, m as MarkdownConfigSchema } from "./zod-schema.core-BuVz8Rk7.js";
import { Gb as stripTargetKindPrefix, Jb as adaptScopedAccountAccessor, Px as createAllowlistProviderOpenWarningCollector, Qb as createScopedChannelConfigAdapter, Vb as createChatChannelPlugin, Vx as projectAccountConfigWarningCollector, Wb as stripChannelTargetPrefix, ex as createScopedDmSecurityResolver, zb as buildChannelOutboundSessionRoute } from "./pi-embedded-CbCYZxIb.js";
import { n as describeAccountSnapshot } from "./account-helpers-BzkeDMfB.js";
import { r as buildSecretInputSchema } from "./secret-input-DXoOLNgb.js";
import { d as readNumberParam, h as readStringParam, i as createActionGate } from "./common-zReYuoMM.js";
import { i as buildNestedDmConfigSchema, r as buildChannelConfigSchema, t as AllowFromListSchema } from "./config-schema-CPzP2Ds6.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-CO3iC4WE.js";
import { i as buildProbeChannelStatusSummary, l as createComputedAccountStatusAdapter, s as collectStatusIssuesFromLastError, u as createDefaultChannelRuntimeState } from "./status-helpers-Cflmo90d.js";
import { J as createScopedAccountReplyToModeResolver } from "./conversation-runtime-nmWgJSXS.js";
import { i as createPairingPrefixStripper } from "./channel-pairing-BrG9NqjP.js";
import { n as createRuntimeOutboundDelegates, t as createRuntimeDirectoryLiveAdapter } from "./runtime-forwarders-Cv9Bdwov.js";
import { i as createLazyRuntimeNamedExport } from "./lazy-runtime-CPDBPNrj.js";
import { l as listResolvedDirectoryEntriesFromSources, p as createChannelDirectoryAdapter } from "./directory-runtime-D9Y42mW-.js";
import { d as requiresExplicitMatrixDefaultAccount } from "./helper-api-CFToxS1G.js";
import { r as buildTrafficStatusSummary } from "./extension-shared-B8dMu-tU.js";
import { a as getMatrixRuntime } from "./credentials-read-BLFr7diG.js";
import { A as normalizeMatrixMessagingTarget, I as resolveDefaultMatrixAccountId, L as resolveMatrixAccount, M as resolveMatrixDirectUserId, N as resolveMatrixTargetIdentity, P as listMatrixAccountIds, R as resolveMatrixAccountConfig, j as normalizeMatrixResolvableTarget } from "./send-C-3t8GKS.js";
import { i as resolveMatrixRoomConfig, n as normalizeMatrixUserId, t as normalizeMatrixAllowList } from "./allowlist-DAPYBDrZ.js";
import { n as matrixSetupAdapter } from "./setup-core-CU3wjwHd.js";
import { z } from "zod";
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
		const { handleMatrixAction } = await import("./tool-actions.runtime-DkTZxyqo.js");
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
//#region extensions/matrix/src/config-schema.ts
const matrixActionSchema = z.object({
	reactions: z.boolean().optional(),
	messages: z.boolean().optional(),
	pins: z.boolean().optional(),
	profile: z.boolean().optional(),
	memberInfo: z.boolean().optional(),
	channelInfo: z.boolean().optional(),
	verification: z.boolean().optional()
}).optional();
const matrixThreadBindingsSchema = z.object({
	enabled: z.boolean().optional(),
	idleHours: z.number().nonnegative().optional(),
	maxAgeHours: z.number().nonnegative().optional(),
	spawnSubagentSessions: z.boolean().optional(),
	spawnAcpSessions: z.boolean().optional()
}).optional();
const matrixRoomSchema = z.object({
	enabled: z.boolean().optional(),
	allow: z.boolean().optional(),
	requireMention: z.boolean().optional(),
	allowBots: z.union([z.boolean(), z.literal("mentions")]).optional(),
	tools: ToolPolicySchema,
	autoReply: z.boolean().optional(),
	users: AllowFromListSchema,
	skills: z.array(z.string()).optional(),
	systemPrompt: z.string().optional()
}).optional();
const MatrixConfigSchema = z.object({
	name: z.string().optional(),
	enabled: z.boolean().optional(),
	defaultAccount: z.string().optional(),
	accounts: z.record(z.string(), z.unknown()).optional(),
	markdown: MarkdownConfigSchema,
	homeserver: z.string().optional(),
	allowPrivateNetwork: z.boolean().optional(),
	userId: z.string().optional(),
	accessToken: z.string().optional(),
	password: buildSecretInputSchema().optional(),
	deviceId: z.string().optional(),
	deviceName: z.string().optional(),
	avatarUrl: z.string().optional(),
	initialSyncLimit: z.number().optional(),
	encryption: z.boolean().optional(),
	allowlistOnly: z.boolean().optional(),
	allowBots: z.union([z.boolean(), z.literal("mentions")]).optional(),
	groupPolicy: GroupPolicySchema.optional(),
	replyToMode: z.enum([
		"off",
		"first",
		"all"
	]).optional(),
	threadReplies: z.enum([
		"off",
		"inbound",
		"always"
	]).optional(),
	textChunkLimit: z.number().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	responsePrefix: z.string().optional(),
	ackReaction: z.string().optional(),
	ackReactionScope: z.enum([
		"group-mentions",
		"group-all",
		"direct",
		"all",
		"none",
		"off"
	]).optional(),
	reactionNotifications: z.enum(["off", "own"]).optional(),
	threadBindings: matrixThreadBindingsSchema,
	startupVerification: z.enum(["off", "if-unverified"]).optional(),
	startupVerificationCooldownHours: z.number().optional(),
	mediaMaxMb: z.number().optional(),
	autoJoin: z.enum([
		"always",
		"allowlist",
		"off"
	]).optional(),
	autoJoinAllowlist: AllowFromListSchema,
	groupAllowFrom: AllowFromListSchema,
	dm: buildNestedDmConfigSchema(),
	groups: z.object({}).catchall(matrixRoomSchema).optional(),
	rooms: z.object({}).catchall(matrixRoomSchema).optional(),
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
const loadMatrixChannelRuntime = createLazyRuntimeNamedExport(() => import("./channel.runtime-B1NomKq8.js"), "matrixChannelRuntime");
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
const matrixPlugin = createChatChannelPlugin({
	base: {
		id: "matrix",
		meta,
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
		groups: {
			resolveRequireMention: resolveMatrixGroupRequireMention,
			resolveToolPolicy: resolveMatrixGroupToolPolicy
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
				return listResolvedDirectoryEntriesFromSources({
					...params,
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
				}).map((entry) => {
					const raw = entry.id.startsWith("user:") ? entry.id.slice(5) : entry.id;
					return !raw.startsWith("@") || !raw.includes(":") ? {
						...entry,
						name: "incomplete id; expected @user:server"
					} : entry;
				});
			},
			listGroups: async (params) => listResolvedDirectoryEntriesFromSources({
				...params,
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
			}),
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
						ssrfPolicy: auth.ssrfPolicy
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
				monitorMatrixProvider = (await import("./monitor-CrRCPGuV.js")).monitorMatrixProvider;
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
		chunker: (text, limit) => getMatrixRuntime().channel.text.chunkMarkdownText(text, limit),
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
