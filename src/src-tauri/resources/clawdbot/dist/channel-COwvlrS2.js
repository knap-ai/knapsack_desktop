import { u as isRecord } from "./utils-CE3P21nG.js";
import { g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { t as formatCliCommand } from "./command-format-CkCGNdQh.js";
import { n as asString, r as collectIssuesForEnabledAccounts } from "./shared-CJJtMTbb.js";
import { d as createDefaultChannelRuntimeState, l as createAsyncComputedAccountStatusAdapter } from "./status-helpers-CtpWf3f1.js";
import { h as readStringParam, i as createActionGate } from "./common-RGbDbB5n.js";
import { a as chunkText } from "./chunk-D6CtZg6q.js";
import { h as formatWhatsAppConfigAllowFromEntries } from "./channel-config-helpers-B0S2z66F.js";
import { r as createChatChannelPlugin, t as buildChannelOutboundSessionRoute } from "./core-BghMcc08.js";
import { t as createPluginRuntimeStore } from "./runtime-store-CIDSrOnb.js";
import { d as createResolvedApproverActionAuthAdapter, t as resolveApprovalApprovers } from "./approval-runtime-8-_vGYcG.js";
import "./reply-runtime-DxFWfQpm.js";
import { r as normalizeWhatsAppMessagingTarget, t as looksLikeWhatsAppTargetId } from "./whatsapp-1jKhBGUj.js";
import { t as resolveWhatsAppHeartbeatRecipients } from "./whatsapp-heartbeat-B4yUEp_v.js";
import "./cli-runtime-BgrpjBV4.js";
import { n as buildDmGroupAccountAllowlistAdapter } from "./allowlist-config-edit-DcMKbV8C.js";
import { r as resolveReactionMessageId } from "./channel-actions-DVMcrs0t.js";
import { n as resolveWhatsAppGroupIntroHint, r as resolveWhatsAppMentionStripRegexes, t as createWhatsAppOutboundBase } from "./whatsapp-shared-C06ynsZL.js";
import { i as listWhatsAppAccountIds, s as resolveWhatsAppAccount } from "./accounts-C7z-45Me.js";
import { i as isWhatsAppGroupJid, n as resolveWhatsAppReactionLevel, o as normalizeWhatsAppTarget, r as resolveWhatsAppOutboundTarget } from "./runtime-api-rROA7VYI.js";
import { t as handleWhatsAppAction } from "./action-runtime-SGatffR-.js";
import { n as sendPollWhatsApp, t as sendMessageWhatsApp } from "./send-aQ-61ZNj.js";
import { t as createWhatsAppLoginTool } from "./agent-tools-login-DQswuQEY.js";
import { i as listWhatsAppDirectoryPeersFromConfig, n as resolveWhatsAppGroupToolPolicy, r as listWhatsAppDirectoryGroupsFromConfig, t as resolveWhatsAppGroupRequireMention } from "./group-policy-OwhXMgOr.js";
import { t as whatsappSetupAdapter } from "./setup-core-Wu9Q96mM.js";
import { i as whatsappSetupWizardProxy, n as createWhatsAppPluginBase, r as loadWhatsAppChannelRuntime, t as WHATSAPP_CHANNEL } from "./shared-D5kj_-Up.js";
//#region extensions/whatsapp/src/approval-auth.ts
function normalizeWhatsAppApproverId(value) {
	const normalized = normalizeWhatsAppTarget(String(value));
	if (!normalized || normalized.endsWith("@g.us")) return;
	return normalized;
}
const whatsappApprovalAuth = createResolvedApproverActionAuthAdapter({
	channelLabel: "WhatsApp",
	resolveApprovers: ({ cfg, accountId }) => {
		const account = resolveWhatsAppAccount({
			cfg,
			accountId
		});
		return resolveApprovalApprovers({
			allowFrom: account.allowFrom,
			defaultTo: account.defaultTo,
			normalizeApprover: normalizeWhatsAppApproverId
		});
	},
	normalizeSenderId: (value) => normalizeWhatsAppApproverId(value)
});
//#endregion
//#region extensions/whatsapp/src/runtime.ts
const { setRuntime: setWhatsAppRuntime, getRuntime: getWhatsAppRuntime } = createPluginRuntimeStore("WhatsApp runtime not initialized");
//#endregion
//#region extensions/whatsapp/src/session-route.ts
function resolveWhatsAppOutboundSessionRoute(params) {
	const normalized = normalizeWhatsAppTarget(params.target);
	if (!normalized) return null;
	const isGroup = isWhatsAppGroupJid(normalized);
	return buildChannelOutboundSessionRoute({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "whatsapp",
		accountId: params.accountId,
		peer: {
			kind: isGroup ? "group" : "direct",
			id: normalized
		},
		chatType: isGroup ? "group" : "direct",
		from: normalized,
		to: normalized
	});
}
//#endregion
//#region extensions/whatsapp/src/status-issues.ts
function readWhatsAppAccountStatus(value) {
	if (!isRecord(value)) return null;
	return {
		accountId: value.accountId,
		enabled: value.enabled,
		linked: value.linked,
		connected: value.connected,
		running: value.running,
		reconnectAttempts: value.reconnectAttempts,
		lastInboundAt: value.lastInboundAt,
		lastError: value.lastError,
		healthState: value.healthState
	};
}
function collectWhatsAppStatusIssues(accounts) {
	return collectIssuesForEnabledAccounts({
		accounts,
		readAccount: readWhatsAppAccountStatus,
		collectIssues: ({ account, accountId, issues }) => {
			const linked = account.linked === true;
			const running = account.running === true;
			const connected = account.connected === true;
			const reconnectAttempts = typeof account.reconnectAttempts === "number" ? account.reconnectAttempts : null;
			const lastInboundAt = typeof account.lastInboundAt === "number" ? account.lastInboundAt : null;
			const lastError = asString(account.lastError);
			const healthState = asString(account.healthState);
			if (!linked) {
				issues.push({
					channel: "whatsapp",
					accountId,
					kind: "auth",
					message: "Not linked (no WhatsApp Web session).",
					fix: `Run: ${formatCliCommand("openclaw channels login")} (scan QR on the gateway host).`
				});
				return;
			}
			if (healthState === "stale") {
				const staleSuffix = lastInboundAt != null ? ` (last inbound ${Math.max(0, Math.floor((Date.now() - lastInboundAt) / 6e4))}m ago)` : "";
				issues.push({
					channel: "whatsapp",
					accountId,
					kind: "runtime",
					message: `Linked but stale${staleSuffix}${lastError ? `: ${lastError}` : "."}`,
					fix: `Run: ${formatCliCommand("openclaw doctor")} (or restart the gateway). If it persists, relink via channels login and check logs.`
				});
				return;
			}
			if (healthState === "reconnecting" || healthState === "conflict" || healthState === "stopped") {
				const stateLabel = healthState === "conflict" ? "session conflict" : healthState === "reconnecting" ? "reconnecting" : "stopped";
				issues.push({
					channel: "whatsapp",
					accountId,
					kind: "runtime",
					message: `Linked but ${stateLabel}${reconnectAttempts != null ? ` (reconnectAttempts=${reconnectAttempts})` : ""}${lastError ? `: ${lastError}` : "."}`,
					fix: `Run: ${formatCliCommand("openclaw doctor")} (or restart the gateway). If it persists, relink via channels login and check logs.`
				});
				return;
			}
			if (healthState === "logged-out") {
				issues.push({
					channel: "whatsapp",
					accountId,
					kind: "auth",
					message: `Linked session logged out${lastError ? `: ${lastError}` : "."}`,
					fix: `Run: ${formatCliCommand("openclaw channels login")} (scan QR on the gateway host).`
				});
				return;
			}
			if (running && !connected) issues.push({
				channel: "whatsapp",
				accountId,
				kind: "runtime",
				message: `Linked but disconnected${reconnectAttempts != null ? ` (reconnectAttempts=${reconnectAttempts})` : ""}${lastError ? `: ${lastError}` : "."}`,
				fix: `Run: ${formatCliCommand("openclaw doctor")} (or restart the gateway). If it persists, relink via channels login and check logs.`
			});
		}
	});
}
//#endregion
//#region extensions/whatsapp/src/channel.ts
function normalizeWhatsAppPayloadText(text) {
	return (text ?? "").replace(/^(?:[ \t]*\r?\n)+/, "");
}
function parseWhatsAppExplicitTarget(raw) {
	const normalized = normalizeWhatsAppTarget(raw);
	if (!normalized) return null;
	return {
		to: normalized,
		chatType: isWhatsAppGroupJid(normalized) ? "group" : "direct"
	};
}
function areWhatsAppAgentReactionsEnabled(params) {
	if (!params.cfg.channels?.whatsapp) return false;
	if (!createActionGate(params.cfg.channels.whatsapp.actions)("reactions")) return false;
	return resolveWhatsAppReactionLevel({
		cfg: params.cfg,
		accountId: params.accountId
	}).agentReactionsEnabled;
}
function hasAnyWhatsAppAccountWithAgentReactionsEnabled(cfg) {
	if (!cfg.channels?.whatsapp) return false;
	return listWhatsAppAccountIds(cfg).some((accountId) => {
		if (!resolveWhatsAppAccount({
			cfg,
			accountId
		}).enabled) return false;
		return areWhatsAppAgentReactionsEnabled({
			cfg,
			accountId
		});
	});
}
function resolveWhatsAppAgentReactionGuidance(params) {
	if (!params.cfg.channels?.whatsapp) return;
	if (!createActionGate(params.cfg.channels.whatsapp.actions)("reactions")) return;
	const resolved = resolveWhatsAppReactionLevel({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!resolved.agentReactionsEnabled) return;
	return resolved.agentReactionGuidance;
}
const whatsappPlugin = createChatChannelPlugin({
	pairing: { idLabel: "whatsappSenderId" },
	outbound: {
		...createWhatsAppOutboundBase({
			chunker: chunkText,
			sendMessageWhatsApp,
			sendPollWhatsApp,
			shouldLogVerbose: () => getWhatsAppRuntime().logging.shouldLogVerbose(),
			resolveTarget: ({ to, allowFrom, mode }) => resolveWhatsAppOutboundTarget({
				to,
				allowFrom,
				mode
			})
		}),
		normalizePayload: ({ payload }) => ({
			...payload,
			text: normalizeWhatsAppPayloadText(payload.text)
		})
	},
	base: {
		...createWhatsAppPluginBase({
			groups: {
				resolveRequireMention: resolveWhatsAppGroupRequireMention,
				resolveToolPolicy: resolveWhatsAppGroupToolPolicy,
				resolveGroupIntroHint: resolveWhatsAppGroupIntroHint
			},
			setupWizard: whatsappSetupWizardProxy,
			setup: whatsappSetupAdapter,
			isConfigured: async (account) => await (await loadWhatsAppChannelRuntime()).webAuthExists(account.authDir)
		}),
		agentTools: () => [createWhatsAppLoginTool()],
		allowlist: buildDmGroupAccountAllowlistAdapter({
			channelId: "whatsapp",
			resolveAccount: resolveWhatsAppAccount,
			normalize: ({ values }) => formatWhatsAppConfigAllowFromEntries(values),
			resolveDmAllowFrom: (account) => account.allowFrom,
			resolveGroupAllowFrom: (account) => account.groupAllowFrom,
			resolveDmPolicy: (account) => account.dmPolicy,
			resolveGroupPolicy: (account) => account.groupPolicy
		}),
		mentions: { stripRegexes: ({ ctx }) => resolveWhatsAppMentionStripRegexes(ctx) },
		commands: {
			enforceOwnerForCommands: true,
			skipWhenConfigEmpty: true
		},
		agentPrompt: { reactionGuidance: ({ cfg, accountId }) => {
			const level = resolveWhatsAppAgentReactionGuidance({
				cfg,
				accountId: accountId ?? void 0
			});
			return level ? {
				level,
				channelLabel: "WhatsApp"
			} : void 0;
		} },
		messaging: {
			normalizeTarget: normalizeWhatsAppMessagingTarget,
			resolveOutboundSessionRoute: (params) => resolveWhatsAppOutboundSessionRoute(params),
			parseExplicitTarget: ({ raw }) => parseWhatsAppExplicitTarget(raw),
			inferTargetChatType: ({ to }) => parseWhatsAppExplicitTarget(to)?.chatType,
			targetResolver: {
				looksLikeId: looksLikeWhatsAppTargetId,
				hint: "<E.164|group JID>"
			}
		},
		directory: {
			self: async ({ cfg, accountId }) => {
				const account = resolveWhatsAppAccount({
					cfg,
					accountId
				});
				const { e164, jid } = (await loadWhatsAppChannelRuntime()).readWebSelfId(account.authDir);
				const id = e164 ?? jid;
				if (!id) return null;
				return {
					kind: "user",
					id,
					name: account.name,
					raw: {
						e164,
						jid
					}
				};
			},
			listPeers: async (params) => listWhatsAppDirectoryPeersFromConfig(params),
			listGroups: async (params) => listWhatsAppDirectoryGroupsFromConfig(params)
		},
		actions: {
			describeMessageTool: ({ cfg, accountId }) => {
				if (!cfg.channels?.whatsapp) return null;
				const gate = createActionGate(cfg.channels.whatsapp.actions);
				const actions = /* @__PURE__ */ new Set();
				if (accountId != null ? areWhatsAppAgentReactionsEnabled({
					cfg,
					accountId: accountId ?? void 0
				}) : hasAnyWhatsAppAccountWithAgentReactionsEnabled(cfg)) actions.add("react");
				if (gate("polls")) actions.add("poll");
				return { actions: Array.from(actions) };
			},
			supportsAction: ({ action }) => action === "react",
			handleAction: async ({ action, params, cfg, accountId, toolContext }) => {
				if (action !== "react") throw new Error(`Action ${action} is not supported for provider ${WHATSAPP_CHANNEL}.`);
				const isWhatsAppSource = toolContext?.currentChannelProvider === WHATSAPP_CHANNEL;
				const explicitTarget = readStringParam(params, "chatJid") ?? readStringParam(params, "to");
				const normalizedTarget = explicitTarget ? normalizeWhatsAppTarget(explicitTarget) : null;
				const normalizedCurrent = isWhatsAppSource && toolContext?.currentChannelId ? normalizeWhatsAppTarget(toolContext.currentChannelId) : null;
				const messageIdRaw = resolveReactionMessageId({
					args: params,
					toolContext: !isWhatsAppSource || normalizedTarget != null && (normalizedCurrent == null || normalizedTarget !== normalizedCurrent) ? void 0 : toolContext
				});
				if (messageIdRaw == null) readStringParam(params, "messageId", { required: true });
				const messageId = String(messageIdRaw);
				const emoji = readStringParam(params, "emoji", { allowEmpty: true });
				const remove = typeof params.remove === "boolean" ? params.remove : void 0;
				return await handleWhatsAppAction({
					action: "react",
					chatJid: readStringParam(params, "chatJid") ?? readStringParam(params, "to", { required: true }),
					messageId,
					emoji,
					remove,
					participant: readStringParam(params, "participant"),
					accountId: accountId ?? void 0,
					fromMe: typeof params.fromMe === "boolean" ? params.fromMe : void 0
				}, cfg);
			}
		},
		auth: {
			...whatsappApprovalAuth,
			login: async ({ cfg, accountId, runtime, verbose }) => {
				const resolvedAccountId = accountId?.trim() || whatsappPlugin.config.defaultAccountId?.(cfg) || "default";
				await (await loadWhatsAppChannelRuntime()).loginWeb(Boolean(verbose), void 0, runtime, resolvedAccountId);
			}
		},
		heartbeat: {
			checkReady: async ({ cfg, accountId, deps }) => {
				if (cfg.web?.enabled === false) return {
					ok: false,
					reason: "whatsapp-disabled"
				};
				const account = resolveWhatsAppAccount({
					cfg,
					accountId
				});
				if (!await (deps?.webAuthExists ?? (await loadWhatsAppChannelRuntime()).webAuthExists)(account.authDir)) return {
					ok: false,
					reason: "whatsapp-not-linked"
				};
				if (!(deps?.hasActiveWebListener ? deps.hasActiveWebListener() : Boolean((await loadWhatsAppChannelRuntime()).getActiveWebListener()))) return {
					ok: false,
					reason: "whatsapp-not-running"
				};
				return {
					ok: true,
					reason: "ok"
				};
			},
			resolveRecipients: ({ cfg, opts }) => resolveWhatsAppHeartbeatRecipients(cfg, opts)
		},
		status: createAsyncComputedAccountStatusAdapter({
			defaultRuntime: createDefaultChannelRuntimeState(DEFAULT_ACCOUNT_ID, {
				connected: false,
				reconnectAttempts: 0,
				lastConnectedAt: null,
				lastDisconnect: null,
				lastInboundAt: null,
				lastMessageAt: null,
				lastEventAt: null,
				healthState: "stopped"
			}),
			collectStatusIssues: collectWhatsAppStatusIssues,
			buildChannelSummary: async ({ account, snapshot }) => {
				const authDir = account.authDir;
				const linked = typeof snapshot.linked === "boolean" ? snapshot.linked : authDir ? await (await loadWhatsAppChannelRuntime()).webAuthExists(authDir) : false;
				return {
					configured: linked,
					linked,
					authAgeMs: linked && authDir ? (await loadWhatsAppChannelRuntime()).getWebAuthAgeMs(authDir) : null,
					self: linked && authDir ? (await loadWhatsAppChannelRuntime()).readWebSelfId(authDir) : {
						e164: null,
						jid: null
					},
					running: snapshot.running ?? false,
					connected: snapshot.connected ?? false,
					lastConnectedAt: snapshot.lastConnectedAt ?? null,
					lastDisconnect: snapshot.lastDisconnect ?? null,
					reconnectAttempts: snapshot.reconnectAttempts,
					lastInboundAt: snapshot.lastInboundAt ?? snapshot.lastMessageAt ?? null,
					lastMessageAt: snapshot.lastMessageAt ?? null,
					lastEventAt: snapshot.lastEventAt ?? null,
					lastError: snapshot.lastError ?? null,
					healthState: snapshot.healthState ?? void 0
				};
			},
			resolveAccountSnapshot: async ({ account, runtime }) => {
				const linked = await (await loadWhatsAppChannelRuntime()).webAuthExists(account.authDir);
				return {
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured: true,
					extra: {
						linked,
						connected: runtime?.connected ?? false,
						reconnectAttempts: runtime?.reconnectAttempts,
						lastConnectedAt: runtime?.lastConnectedAt ?? null,
						lastDisconnect: runtime?.lastDisconnect ?? null,
						lastInboundAt: runtime?.lastInboundAt ?? runtime?.lastMessageAt ?? null,
						lastMessageAt: runtime?.lastMessageAt ?? null,
						lastEventAt: runtime?.lastEventAt ?? null,
						healthState: runtime?.healthState ?? void 0,
						dmPolicy: account.dmPolicy,
						allowFrom: account.allowFrom
					}
				};
			},
			resolveAccountState: ({ configured }) => configured ? "linked" : "not linked",
			logSelfId: ({ account, runtime, includeChannelPrefix }) => {
				loadWhatsAppChannelRuntime().then((runtimeExports) => runtimeExports.logWebSelfId(account.authDir, runtime, includeChannelPrefix));
			}
		}),
		gateway: {
			startAccount: async (ctx) => {
				const account = ctx.account;
				const { e164, jid } = (await loadWhatsAppChannelRuntime()).readWebSelfId(account.authDir);
				const identity = e164 ? e164 : jid ? `jid ${jid}` : "unknown";
				ctx.log?.info(`[${account.accountId}] starting provider (${identity})`);
				return (await loadWhatsAppChannelRuntime()).monitorWebChannel(getWhatsAppRuntime().logging.shouldLogVerbose(), void 0, true, void 0, ctx.runtime, ctx.abortSignal, {
					statusSink: (next) => ctx.setStatus({
						accountId: ctx.accountId,
						...next
					}),
					accountId: account.accountId
				});
			},
			loginWithQrStart: async ({ accountId, force, timeoutMs, verbose }) => await (await loadWhatsAppChannelRuntime()).startWebLoginWithQr({
				accountId,
				force,
				timeoutMs,
				verbose
			}),
			loginWithQrWait: async ({ accountId, timeoutMs }) => await (await loadWhatsAppChannelRuntime()).waitForWebLogin({
				accountId,
				timeoutMs
			}),
			logoutAccount: async ({ account, runtime }) => {
				const cleared = await (await loadWhatsAppChannelRuntime()).logoutWeb({
					authDir: account.authDir,
					isLegacyAuthDir: account.isLegacyAuthDir,
					runtime
				});
				return {
					cleared,
					loggedOut: cleared
				};
			}
		}
	}
});
//#endregion
export { setWhatsAppRuntime as n, whatsappPlugin as t };
