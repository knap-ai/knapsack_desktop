import { g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { r as GoogleChatConfigSchema } from "./zod-schema.providers-core-BJorTsd7.js";
import { r as buildChannelConfigSchema } from "./config-schema-BoSEJoAt.js";
import { t as getChatChannelMeta } from "./chat-meta-Cdrnv7R-.js";
import { t as PAIRING_APPROVED_MESSAGE } from "./pairing-message-DoFheDS-.js";
import { d as createDefaultChannelRuntimeState, u as createComputedAccountStatusAdapter } from "./status-helpers-CtpWf3f1.js";
import { c as jsonResult, d as readNumberParam, f as readReactionParams, h as readStringParam, i as createActionGate } from "./common-RGbDbB5n.js";
import { n as describeAccountSnapshot } from "./account-helpers-DqNwQN08.js";
import { c as createScopedChannelConfigAdapter, t as adaptScopedAccountAccessor } from "./channel-config-helpers-B0S2z66F.js";
import { n as missingTargetError } from "./target-errors-B-DHXiI8.js";
import { n as fetchRemoteMedia } from "./fetch-ClF-ZgDC.js";
import { i as createLazyRuntimeNamedExport } from "./lazy-runtime-B4PzSTA5.js";
import { n as resolveChannelGroupRequireMention } from "./group-policy-B1uRyci5.js";
import { r as createChatChannelPlugin } from "./core-BghMcc08.js";
import { t as resolveChannelMediaMaxBytes } from "./media-limits-GI9x4YgA.js";
import { r as runPassiveAccountLifecycle, t as createAccountStatusSink } from "./channel-lifecycle.core-CgpUnF4D.js";
import { n as formatNormalizedAllowFromEntries } from "./allow-from-BJ5FBYvV.js";
import { f as createAllowlistProviderOpenWarningCollector, l as composeAccountWarningCollectors } from "./group-policy-warnings-B8ZU4B4D.js";
import "./channel-policy-Dqo0XdDX.js";
import { t as createChannelDirectoryAdapter } from "./directory-runtime-Rwkajwwt.js";
import { f as listResolvedDirectoryGroupEntriesFromMapKeys, p as listResolvedDirectoryUserEntriesFromAllowFrom } from "./directory-config-helpers-C_EYixJ2.js";
import { d as createResolvedApproverActionAuthAdapter, t as resolveApprovalApprovers } from "./approval-runtime-8-_vGYcG.js";
import { t as extractToolSend } from "./tool-send-CcRqBFAk.js";
import { t as loadOutboundMediaFromUrl } from "./outbound-media-Cj_f0fBE.js";
import { n as buildPassiveProbedChannelStatusSummary } from "./extension-shared-gP7gKXlS.js";
import { t as chunkTextForOutbound } from "./text-chunking-QO5AWjBS.js";
import "./runtime-api-CdXAHS3c.js";
import { a as resolveDefaultGoogleChatAccountId, i as listGoogleChatAccountIds, n as googlechatSetupAdapter, o as resolveGoogleChatAccount, r as listEnabledGoogleChatAccounts, t as googlechatSetupWizard } from "./setup-surface-DPnYFDsa.js";
import { a as findGoogleChatDirectMessage, c as sendGoogleChatMessage, o as listGoogleChatReactions, r as deleteGoogleChatReaction, t as createGoogleChatReaction, u as uploadGoogleChatAttachment } from "./api-DJVmVGPF.js";
import { t as getGoogleChatRuntime } from "./runtime-88R8CJ9I.js";
//#region extensions/googlechat/src/targets.ts
function normalizeGoogleChatTarget(raw) {
	const trimmed = raw?.trim();
	if (!trimmed) return;
	const normalized = trimmed.replace(/^(googlechat|google-chat|gchat):/i, "").replace(/^user:(users\/)?/i, "users/").replace(/^space:(spaces\/)?/i, "spaces/");
	if (isGoogleChatUserTarget(normalized)) {
		const suffix = normalized.slice(6);
		return suffix.includes("@") ? `users/${suffix.toLowerCase()}` : normalized;
	}
	if (isGoogleChatSpaceTarget(normalized)) return normalized;
	if (normalized.includes("@")) return `users/${normalized.toLowerCase()}`;
	return normalized;
}
function isGoogleChatUserTarget(value) {
	return value.toLowerCase().startsWith("users/");
}
function isGoogleChatSpaceTarget(value) {
	return value.toLowerCase().startsWith("spaces/");
}
function stripMessageSuffix(target) {
	const index = target.indexOf("/messages/");
	if (index === -1) return target;
	return target.slice(0, index);
}
async function resolveGoogleChatOutboundSpace(params) {
	const normalized = normalizeGoogleChatTarget(params.target);
	if (!normalized) throw new Error("Missing Google Chat target.");
	const base = stripMessageSuffix(normalized);
	if (isGoogleChatSpaceTarget(base)) return base;
	if (isGoogleChatUserTarget(base)) {
		const dm = await findGoogleChatDirectMessage({
			account: params.account,
			userName: base
		});
		if (!dm?.name) throw new Error(`No Google Chat DM found for ${base}`);
		return dm.name;
	}
	return base;
}
//#endregion
//#region extensions/googlechat/src/actions.ts
const providerId = "googlechat";
function listEnabledAccounts(cfg) {
	return listEnabledGoogleChatAccounts(cfg).filter((account) => account.enabled && account.credentialSource !== "none");
}
function isReactionsEnabled(accounts, cfg) {
	for (const account of accounts) if (createActionGate(account.config.actions ?? (cfg.channels?.["googlechat"])?.actions)("reactions")) return true;
	return false;
}
function resolveAppUserNames(account) {
	return new Set(["users/app", account.config.botUser?.trim()].filter(Boolean));
}
async function loadGoogleChatActionMedia(params) {
	const runtime = getGoogleChatRuntime();
	return /^https?:\/\//i.test(params.mediaUrl) ? await runtime.channel.media.fetchRemoteMedia({
		url: params.mediaUrl,
		maxBytes: params.maxBytes
	}) : await loadOutboundMediaFromUrl(params.mediaUrl, {
		maxBytes: params.maxBytes,
		mediaAccess: params.mediaAccess,
		mediaLocalRoots: params.mediaLocalRoots,
		mediaReadFile: params.mediaReadFile
	});
}
const googlechatMessageActions = {
	describeMessageTool: ({ cfg }) => {
		const accounts = listEnabledAccounts(cfg);
		if (accounts.length === 0) return null;
		const actions = /* @__PURE__ */ new Set([]);
		actions.add("send");
		actions.add("upload-file");
		if (isReactionsEnabled(accounts, cfg)) {
			actions.add("react");
			actions.add("reactions");
		}
		return { actions: Array.from(actions) };
	},
	extractToolSend: ({ args }) => {
		return extractToolSend(args, "sendMessage");
	},
	handleAction: async ({ action, params, cfg, accountId, mediaAccess, mediaLocalRoots, mediaReadFile }) => {
		const account = resolveGoogleChatAccount({
			cfg,
			accountId
		});
		if (account.credentialSource === "none") throw new Error("Google Chat credentials are missing.");
		if (action === "send" || action === "upload-file") {
			const to = readStringParam(params, "to", { required: true });
			const content = readStringParam(params, "message", {
				required: action === "send",
				allowEmpty: true
			}) ?? readStringParam(params, "initialComment", { allowEmpty: true }) ?? "";
			const mediaUrl = readStringParam(params, "media", { trim: false }) ?? readStringParam(params, "filePath", { trim: false }) ?? readStringParam(params, "path", { trim: false });
			const threadId = readStringParam(params, "threadId") ?? readStringParam(params, "replyTo");
			const space = await resolveGoogleChatOutboundSpace({
				account,
				target: to
			});
			if (mediaUrl) {
				const loaded = await loadGoogleChatActionMedia({
					mediaUrl,
					maxBytes: (account.config.mediaMaxMb ?? 20) * 1024 * 1024,
					mediaAccess,
					mediaLocalRoots,
					mediaReadFile
				});
				const uploadFileName = readStringParam(params, "filename") ?? readStringParam(params, "title") ?? loaded.fileName ?? "attachment";
				const upload = await uploadGoogleChatAttachment({
					account,
					space,
					filename: uploadFileName,
					buffer: loaded.buffer,
					contentType: loaded.contentType
				});
				await sendGoogleChatMessage({
					account,
					space,
					text: content,
					thread: threadId ?? void 0,
					attachments: upload.attachmentUploadToken ? [{
						attachmentUploadToken: upload.attachmentUploadToken,
						contentName: uploadFileName
					}] : void 0
				});
				return jsonResult({
					ok: true,
					to: space
				});
			}
			if (action === "upload-file") throw new Error("upload-file requires media, filePath, or path");
			await sendGoogleChatMessage({
				account,
				space,
				text: content,
				thread: threadId ?? void 0
			});
			return jsonResult({
				ok: true,
				to: space
			});
		}
		if (action === "react") {
			const messageName = readStringParam(params, "messageId", { required: true });
			const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a Google Chat reaction." });
			if (remove || isEmpty) {
				const reactions = await listGoogleChatReactions({
					account,
					messageName
				});
				const appUsers = resolveAppUserNames(account);
				const toRemove = reactions.filter((reaction) => {
					const userName = reaction.user?.name?.trim();
					if (appUsers.size > 0 && !appUsers.has(userName ?? "")) return false;
					if (emoji) return reaction.emoji?.unicode === emoji;
					return true;
				});
				for (const reaction of toRemove) {
					if (!reaction.name) continue;
					await deleteGoogleChatReaction({
						account,
						reactionName: reaction.name
					});
				}
				return jsonResult({
					ok: true,
					removed: toRemove.length
				});
			}
			return jsonResult({
				ok: true,
				reaction: await createGoogleChatReaction({
					account,
					messageName,
					emoji
				})
			});
		}
		if (action === "reactions") return jsonResult({
			ok: true,
			reactions: await listGoogleChatReactions({
				account,
				messageName: readStringParam(params, "messageId", { required: true }),
				limit: readNumberParam(params, "limit", { integer: true }) ?? void 0
			})
		});
		throw new Error(`Action ${action} is not supported for provider ${providerId}.`);
	}
};
//#endregion
//#region extensions/googlechat/src/approval-auth.ts
function normalizeGoogleChatApproverId(value) {
	const normalized = normalizeGoogleChatTarget(String(value));
	if (!normalized || !isGoogleChatUserTarget(normalized)) return;
	const suffix = normalized.slice(6).trim().toLowerCase();
	if (!suffix || suffix.includes("@")) return;
	return `users/${suffix}`;
}
const googleChatApprovalAuth = createResolvedApproverActionAuthAdapter({
	channelLabel: "Google Chat",
	resolveApprovers: ({ cfg, accountId }) => {
		const account = resolveGoogleChatAccount({
			cfg,
			accountId
		}).config;
		return resolveApprovalApprovers({
			allowFrom: account.dm?.allowFrom,
			defaultTo: account.defaultTo,
			normalizeApprover: normalizeGoogleChatApproverId
		});
	},
	normalizeSenderId: (value) => normalizeGoogleChatApproverId(value)
});
//#endregion
//#region extensions/googlechat/src/group-policy.ts
function resolveGoogleChatGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "googlechat",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
//#endregion
//#region extensions/googlechat/src/channel.ts
const meta = getChatChannelMeta("googlechat");
const loadGoogleChatChannelRuntime = createLazyRuntimeNamedExport(() => import("./channel.runtime-CBZ9BGA0.js"), "googleChatChannelRuntime");
const formatAllowFromEntry = (entry) => entry.trim().replace(/^(googlechat|google-chat|gchat):/i, "").replace(/^user:/i, "").replace(/^users\//i, "").toLowerCase();
const googleChatConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: "googlechat",
	listAccountIds: listGoogleChatAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveGoogleChatAccount),
	defaultAccountId: resolveDefaultGoogleChatAccountId,
	clearBaseFields: [
		"serviceAccount",
		"serviceAccountFile",
		"audienceType",
		"audience",
		"webhookPath",
		"webhookUrl",
		"botUser",
		"name"
	],
	resolveAllowFrom: (account) => account.config.dm?.allowFrom,
	formatAllowFrom: (allowFrom) => formatNormalizedAllowFromEntries({
		allowFrom,
		normalizeEntry: formatAllowFromEntry
	}),
	resolveDefaultTo: (account) => account.config.defaultTo
});
const googlechatActions = {
	describeMessageTool: (ctx) => googlechatMessageActions.describeMessageTool?.(ctx) ?? null,
	extractToolSend: (ctx) => googlechatMessageActions.extractToolSend?.(ctx) ?? null,
	handleAction: async (ctx) => {
		if (!googlechatMessageActions.handleAction) throw new Error("Google Chat actions are not available.");
		return await googlechatMessageActions.handleAction(ctx);
	}
};
const collectGoogleChatSecurityWarnings = composeAccountWarningCollectors(createAllowlistProviderOpenWarningCollector({
	providerConfigPresent: (cfg) => cfg.channels?.googlechat !== void 0,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	buildOpenWarning: {
		surface: "Google Chat spaces",
		openBehavior: "allows any space to trigger (mention-gated)",
		remediation: "Set channels.googlechat.groupPolicy=\"allowlist\" and configure channels.googlechat.groups"
	}
}), (account) => account.config.dm?.policy === "open" && "- Google Chat DMs are open to anyone. Set channels.googlechat.dm.policy=\"pairing\" or \"allowlist\".");
const googlechatPlugin = createChatChannelPlugin({
	base: {
		id: "googlechat",
		meta: { ...meta },
		setup: googlechatSetupAdapter,
		setupWizard: googlechatSetupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"thread"
			],
			reactions: true,
			threads: true,
			media: true,
			nativeCommands: false,
			blockStreaming: true
		},
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		reload: { configPrefixes: ["channels.googlechat"] },
		configSchema: buildChannelConfigSchema(GoogleChatConfigSchema),
		config: {
			...googleChatConfigAdapter,
			isConfigured: (account) => account.credentialSource !== "none",
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: account.credentialSource !== "none",
				extra: { credentialSource: account.credentialSource }
			})
		},
		auth: googleChatApprovalAuth,
		groups: { resolveRequireMention: resolveGoogleChatGroupRequireMention },
		messaging: {
			normalizeTarget: normalizeGoogleChatTarget,
			targetResolver: {
				looksLikeId: (raw, normalized) => {
					const value = normalized ?? raw.trim();
					return isGoogleChatSpaceTarget(value) || isGoogleChatUserTarget(value);
				},
				hint: "<spaces/{space}|users/{user}>"
			}
		},
		directory: createChannelDirectoryAdapter({
			listPeers: async (params) => listResolvedDirectoryUserEntriesFromAllowFrom({
				...params,
				resolveAccount: adaptScopedAccountAccessor(resolveGoogleChatAccount),
				resolveAllowFrom: (account) => account.config.dm?.allowFrom,
				normalizeId: (entry) => normalizeGoogleChatTarget(entry) ?? entry
			}),
			listGroups: async (params) => listResolvedDirectoryGroupEntriesFromMapKeys({
				...params,
				resolveAccount: adaptScopedAccountAccessor(resolveGoogleChatAccount),
				resolveGroups: (account) => account.config.groups
			})
		}),
		resolver: { resolveTargets: async ({ inputs, kind }) => {
			return inputs.map((input) => {
				const normalized = normalizeGoogleChatTarget(input);
				if (!normalized) return {
					input,
					resolved: false,
					note: "empty target"
				};
				if (kind === "user" && isGoogleChatUserTarget(normalized)) return {
					input,
					resolved: true,
					id: normalized
				};
				if (kind === "group" && isGoogleChatSpaceTarget(normalized)) return {
					input,
					resolved: true,
					id: normalized
				};
				return {
					input,
					resolved: false,
					note: "use spaces/{space} or users/{user}"
				};
			});
		} },
		actions: googlechatActions,
		status: createComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID),
			collectStatusIssues: (accounts) => accounts.flatMap((entry) => {
				const accountId = String(entry.accountId ?? "default");
				const enabled = entry.enabled !== false;
				const configured = entry.configured === true;
				if (!enabled || !configured) return [];
				const issues = [];
				if (!entry.audience) issues.push({
					channel: "googlechat",
					accountId,
					kind: "config",
					message: "Google Chat audience is missing (set channels.googlechat.audience).",
					fix: "Set channels.googlechat.audienceType and channels.googlechat.audience."
				});
				if (!entry.audienceType) issues.push({
					channel: "googlechat",
					accountId,
					kind: "config",
					message: "Google Chat audienceType is missing (app-url or project-number).",
					fix: "Set channels.googlechat.audienceType and channels.googlechat.audience."
				});
				return issues;
			}),
			buildChannelSummary: ({ snapshot }) => buildPassiveProbedChannelStatusSummary(snapshot, {
				credentialSource: snapshot.credentialSource ?? "none",
				audienceType: snapshot.audienceType ?? null,
				audience: snapshot.audience ?? null,
				webhookPath: snapshot.webhookPath ?? null,
				webhookUrl: snapshot.webhookUrl ?? null
			}),
			probeAccount: async ({ account }) => (await loadGoogleChatChannelRuntime()).probeGoogleChat(account),
			resolveAccountSnapshot: ({ account }) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.credentialSource !== "none",
				extra: {
					credentialSource: account.credentialSource,
					audienceType: account.config.audienceType,
					audience: account.config.audience,
					webhookPath: account.config.webhookPath,
					webhookUrl: account.config.webhookUrl,
					dmPolicy: account.config.dm?.policy ?? "pairing"
				}
			})
		}),
		gateway: { startAccount: async (ctx) => {
			const account = ctx.account;
			const statusSink = createAccountStatusSink({
				accountId: account.accountId,
				setStatus: ctx.setStatus
			});
			ctx.log?.info(`[${account.accountId}] starting Google Chat webhook`);
			const { resolveGoogleChatWebhookPath, startGoogleChatMonitor } = await loadGoogleChatChannelRuntime();
			statusSink({
				running: true,
				lastStartAt: Date.now(),
				webhookPath: resolveGoogleChatWebhookPath({ account }),
				audienceType: account.config.audienceType,
				audience: account.config.audience
			});
			await runPassiveAccountLifecycle({
				abortSignal: ctx.abortSignal,
				start: async () => await startGoogleChatMonitor({
					account,
					config: ctx.cfg,
					runtime: ctx.runtime,
					abortSignal: ctx.abortSignal,
					webhookPath: account.config.webhookPath,
					webhookUrl: account.config.webhookUrl,
					statusSink
				}),
				stop: async (unregister) => {
					unregister?.();
				},
				onStop: async () => {
					statusSink({
						running: false,
						lastStopAt: Date.now()
					});
				}
			});
		} }
	},
	pairing: { text: {
		idLabel: "googlechatUserId",
		message: PAIRING_APPROVED_MESSAGE,
		normalizeAllowEntry: (entry) => formatAllowFromEntry(entry),
		notify: async ({ cfg, id, message, accountId }) => {
			const account = resolveGoogleChatAccount({
				cfg,
				accountId
			});
			if (account.credentialSource === "none") return;
			const user = normalizeGoogleChatTarget(id) ?? id;
			const space = await resolveGoogleChatOutboundSpace({
				account,
				target: isGoogleChatUserTarget(user) ? user : `users/${user}`
			});
			const { sendGoogleChatMessage } = await loadGoogleChatChannelRuntime();
			await sendGoogleChatMessage({
				account,
				space,
				text: message
			});
		}
	} },
	security: {
		dm: {
			channelKey: "googlechat",
			resolvePolicy: (account) => account.config.dm?.policy,
			resolveAllowFrom: (account) => account.config.dm?.allowFrom,
			allowFromPathSuffix: "dm.",
			normalizeEntry: (raw) => formatAllowFromEntry(raw)
		},
		collectWarnings: collectGoogleChatSecurityWarnings
	},
	threading: { topLevelReplyToMode: "googlechat" },
	outbound: {
		base: {
			deliveryMode: "direct",
			chunker: chunkTextForOutbound,
			chunkerMode: "markdown",
			textChunkLimit: 4e3,
			resolveTarget: ({ to }) => {
				const trimmed = to?.trim() ?? "";
				if (trimmed) {
					const normalized = normalizeGoogleChatTarget(trimmed);
					if (!normalized) return {
						ok: false,
						error: missingTargetError("Google Chat", "<spaces/{space}|users/{user}>")
					};
					return {
						ok: true,
						to: normalized
					};
				}
				return {
					ok: false,
					error: missingTargetError("Google Chat", "<spaces/{space}|users/{user}>")
				};
			}
		},
		attachedResults: {
			channel: "googlechat",
			sendText: async ({ cfg, to, text, accountId, replyToId, threadId }) => {
				const account = resolveGoogleChatAccount({
					cfg,
					accountId
				});
				const space = await resolveGoogleChatOutboundSpace({
					account,
					target: to
				});
				const thread = threadId ?? replyToId ?? void 0;
				const { sendGoogleChatMessage } = await loadGoogleChatChannelRuntime();
				return {
					messageId: (await sendGoogleChatMessage({
						account,
						space,
						text,
						thread
					}))?.messageName ?? "",
					chatId: space
				};
			},
			sendMedia: async ({ cfg, to, text, mediaUrl, mediaAccess, mediaLocalRoots, mediaReadFile, accountId, replyToId, threadId }) => {
				if (!mediaUrl) throw new Error("Google Chat mediaUrl is required.");
				const account = resolveGoogleChatAccount({
					cfg,
					accountId
				});
				const space = await resolveGoogleChatOutboundSpace({
					account,
					target: to
				});
				const thread = threadId ?? replyToId ?? void 0;
				const effectiveMaxBytes = resolveChannelMediaMaxBytes({
					cfg,
					resolveChannelLimitMb: ({ cfg, accountId }) => (cfg.channels?.["googlechat"])?.accounts?.[accountId]?.mediaMaxMb ?? (cfg.channels?.["googlechat"])?.mediaMaxMb,
					accountId
				}) ?? (account.config.mediaMaxMb ?? 20) * 1024 * 1024;
				const loaded = /^https?:\/\//i.test(mediaUrl) ? await fetchRemoteMedia({
					url: mediaUrl,
					maxBytes: effectiveMaxBytes
				}) : await loadOutboundMediaFromUrl(mediaUrl, {
					maxBytes: effectiveMaxBytes,
					mediaAccess,
					mediaLocalRoots,
					mediaReadFile
				});
				const { sendGoogleChatMessage, uploadGoogleChatAttachment } = await loadGoogleChatChannelRuntime();
				const upload = await uploadGoogleChatAttachment({
					account,
					space,
					filename: loaded.fileName ?? "attachment",
					buffer: loaded.buffer,
					contentType: loaded.contentType
				});
				return {
					messageId: (await sendGoogleChatMessage({
						account,
						space,
						text,
						thread,
						attachments: upload.attachmentUploadToken ? [{
							attachmentUploadToken: upload.attachmentUploadToken,
							contentName: loaded.fileName
						}] : void 0
					}))?.messageName ?? "",
					chatId: space
				};
			}
		}
	}
});
//#endregion
export { googlechatPlugin as t };
