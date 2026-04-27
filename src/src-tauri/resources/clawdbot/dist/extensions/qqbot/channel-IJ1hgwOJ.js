import { n as getBridgeLogger, t as ensurePlatformAdapter } from "./bootstrap-DP2UpEF-.js";
import { a as resolveApprovalTarget } from "./approval-cg0SVahb.js";
import { t as asOptionalObjectRecord } from "./string-normalize-C6Z4K8Fh.js";
import { a as resolveQQBotAccount, n as applyQQBotAccountConfig, t as DEFAULT_ACCOUNT_ID$1 } from "./config--Jdei9fe.js";
import { a as resolveQQBotExecApprovalConfig, i as matchesQQBotApprovalAccount, n as isQQBotExecApprovalAuthorizedSender, o as shouldHandleQQBotExecApprovalRequest, r as isQQBotExecApprovalClientEnabled, t as isQQBotExecApprovalApprover } from "./exec-approvals-CGQVvXNn.js";
import { a as qqbotSetupAdapterShared, i as qqbotMeta, n as qqbotSetupWizard, r as qqbotConfigAdapter, t as qqbotChannelConfigSchema } from "./config-schema-BWBETfXL.js";
import { t as getQQBotRuntime } from "./runtime-BWC3dtWO.js";
import { l as getQQBotDataPath, n as normalizeTarget, t as looksLikeQQBotTarget } from "./target-parser-C00R-uf5.js";
import { getExecApprovalReplyMetadata } from "openclaw/plugin-sdk/approval-runtime";
import { createChannelApprovalCapability, splitChannelApprovalCapability } from "openclaw/plugin-sdk/approval-delivery-runtime";
import { createLazyChannelApprovalNativeRuntimeAdapter } from "openclaw/plugin-sdk/approval-handler-adapter-runtime";
import { resolveApprovalRequestSessionConversation } from "openclaw/plugin-sdk/approval-native-runtime";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import fs from "node:fs";
import path from "node:path";
//#region extensions/qqbot/src/bridge/approval/capability.ts
/**
* QQ Bot Approval Capability — entry point.
*
* QQBot uses a simpler approval model than Telegram/Slack: any user who
* can see the inline-keyboard buttons can approve. No explicit approver
* list is required — the bot simply sends the approval message to the
* originating conversation and whoever clicks the button resolves it.
*
* When `execApprovals` IS configured, it gates which requests are
* handled natively and who is authorized.  When it is NOT configured,
* QQBot falls back to "always handle, anyone can approve".
*/
/**
* When `execApprovals` is configured, delegate to the profile-based
* check.  Otherwise fall back to target-resolvability plus the shared
* per-account ownership rule in `matchesQQBotApprovalAccount` so that
* each QQBot account handler only delivers approvals that originated
* from its own account (openids are account-scoped — cross-account
* delivery fails with 500 on the QQ Bot API).
*/
function shouldHandleRequest(params) {
	if (hasExecApprovalConfig(params)) return shouldHandleQQBotExecApprovalRequest(params);
	if (!canResolveTarget(params.request)) return false;
	return matchesQQBotApprovalAccount({
		cfg: params.cfg,
		accountId: params.accountId,
		request: params.request
	});
}
function hasExecApprovalConfig(params) {
	return resolveQQBotExecApprovalConfig(params) !== void 0;
}
function isNativeDeliveryEnabled(params) {
	if (hasExecApprovalConfig(params)) return isQQBotExecApprovalClientEnabled(params);
	const account = resolveQQBotAccount(params.cfg, params.accountId);
	return account.enabled && account.secretSource !== "none";
}
function canResolveTarget(request) {
	if (resolveApprovalTarget(request.request.sessionKey ?? null, request.request.turnSourceTo ?? null)) return true;
	return resolveApprovalRequestSessionConversation({
		request,
		channel: "qqbot",
		bundledFallback: true
	})?.id != null;
}
function createQQBotApprovalCapability() {
	return createChannelApprovalCapability({
		authorizeActorAction: ({ cfg, accountId, senderId, approvalKind }) => {
			if (hasExecApprovalConfig({
				cfg,
				accountId
			})) return (approvalKind === "plugin" ? isQQBotExecApprovalApprover({
				cfg,
				accountId,
				senderId
			}) : isQQBotExecApprovalAuthorizedSender({
				cfg,
				accountId,
				senderId
			})) ? { authorized: true } : {
				authorized: false,
				reason: "You are not authorized to approve this request."
			};
			return { authorized: true };
		},
		getActionAvailabilityState: ({ cfg, accountId }) => {
			return isNativeDeliveryEnabled({
				cfg,
				accountId
			}) ? { kind: "enabled" } : { kind: "disabled" };
		},
		getExecInitiatingSurfaceState: ({ cfg, accountId }) => {
			return isNativeDeliveryEnabled({
				cfg,
				accountId
			}) ? { kind: "enabled" } : { kind: "disabled" };
		},
		describeExecApprovalSetup: ({ accountId }) => {
			return `QQBot native exec approvals are enabled by default. To restrict who can approve, configure \`${accountId && accountId !== "default" ? `channels.qqbot.accounts.${accountId}` : "channels.qqbot"}.execApprovals.approvers\` with QQ user OpenIDs.`;
		},
		delivery: {
			hasConfiguredDmRoute: () => true,
			shouldSuppressForwardingFallback: (input) => {
				const channel = normalizeOptionalString(input.target?.channel);
				if (channel !== "qqbot") return false;
				const accountId = normalizeOptionalString(input.target?.accountId) ?? normalizeOptionalString(input.request?.request?.turnSourceAccountId);
				const result = isNativeDeliveryEnabled({
					cfg: input.cfg,
					accountId
				});
				getBridgeLogger().debug?.(`[qqbot:approval] shouldSuppressForwardingFallback channel=${channel} accountId=${accountId} → ${result}`);
				return result;
			}
		},
		native: {
			describeDeliveryCapabilities: ({ cfg, accountId }) => ({
				enabled: isNativeDeliveryEnabled({
					cfg,
					accountId
				}),
				preferredSurface: "origin",
				supportsOriginSurface: true,
				supportsApproverDmSurface: false,
				notifyOriginWhenDmOnly: false
			}),
			resolveOriginTarget: ({ request }) => {
				const target = resolveApprovalTarget(request.request.sessionKey ?? null, request.request.turnSourceTo ?? null);
				if (target) return { to: `${target.type}:${target.id}` };
				const sessionConversation = resolveApprovalRequestSessionConversation({
					request,
					channel: "qqbot",
					bundledFallback: true
				});
				if (sessionConversation?.id) return { to: `${sessionConversation.kind === "group" ? "group" : "c2c"}:${sessionConversation.id}` };
				return null;
			}
		},
		nativeRuntime: createLazyChannelApprovalNativeRuntimeAdapter({
			eventKinds: ["exec", "plugin"],
			isConfigured: ({ cfg, accountId }) => {
				const result = isNativeDeliveryEnabled({
					cfg,
					accountId
				});
				getBridgeLogger().debug?.(`[qqbot:approval] nativeRuntime.isConfigured accountId=${accountId} → ${result}`);
				return result;
			},
			shouldHandle: ({ cfg, accountId, request }) => {
				const result = shouldHandleRequest({
					cfg,
					accountId,
					request
				});
				getBridgeLogger().debug?.(`[qqbot:approval] nativeRuntime.shouldHandle accountId=${accountId} → ${result}`);
				return result;
			},
			load: async () => {
				ensurePlatformAdapter();
				return (await import("./handler-runtime-C-d1gxNw.js")).qqbotApprovalNativeRuntime;
			}
		})
	});
}
const qqbotApprovalCapability = createQQBotApprovalCapability();
splitChannelApprovalCapability(qqbotApprovalCapability);
let _cachedCapability;
function getQQBotApprovalCapability() {
	_cachedCapability ??= qqbotApprovalCapability;
	return _cachedCapability;
}
//#endregion
//#region extensions/qqbot/src/engine/utils/data-paths.ts
/**
* Centralised filename helpers for persisted QQBot state.
*
* Every persistence module routes file paths through these helpers so the
* naming convention stays in sync and legacy migrations are handled
* consistently.
*
* Key design decisions:
* - Credential backup is keyed only by `accountId` because recovery runs
*   exactly when the appId is missing from config.
*/
/**
* Normalise an identifier so it is safe to embed in a filename.
* Keeps alphanumerics, dot, underscore, dash; everything else becomes `_`.
*/
function safeName(id) {
	return id.replace(/[^a-zA-Z0-9._-]/g, "_");
}
/**
* Per-accountId credential backup file. Not keyed by appId because the
* whole point of this file is to recover credentials when appId is
* missing from the live config.
*/
function getCredentialBackupFile(accountId) {
	return path.join(getQQBotDataPath("data"), `credential-backup-${safeName(accountId)}.json`);
}
/** Legacy single-file credential backup (pre-multi-account-isolation). */
function getLegacyCredentialBackupFile() {
	return path.join(getQQBotDataPath("data"), "credential-backup.json");
}
//#endregion
//#region extensions/qqbot/src/engine/config/credential-backup.ts
/**
* Credential backup & recovery.
* 凭证暂存与恢复。
*
* Solves the "hot-upgrade interrupted, appId/secret vanished from
* openclaw.json" failure mode.
*
* Mechanics:
*   - After each successful gateway start we snapshot the currently
*     resolved `appId` / `clientSecret` to a per-account backup file.
*   - During plugin startup, if the live config has an empty appId or
*     secret, the gateway consults the backup and restores the values
*     via `writeConfigFile`.
*   - Backups live under `~/.openclaw/qqbot/data/` so they survive
*     plugin directory replacement.
*
* Safety notes:
*   - Only restore when credentials are **actually empty** — never
*     overwrite a user's intentional config change.
*   - Atomic write (temp file + rename) to avoid torn files.
*   - Per-account file: `credential-backup-<accountId>.json`. We do
*     **not** also key by appId because recovery happens precisely
*     when appId is unknown.
*   - Legacy single `credential-backup.json` is migrated automatically
*     when the stored accountId matches the caller.
*/
/** Persist a credential snapshot (called once gateway reaches READY). */
function saveCredentialBackup(accountId, appId, clientSecret) {
	if (!appId || !clientSecret) return;
	try {
		const backupPath = getCredentialBackupFile(accountId);
		fs.mkdirSync(path.dirname(backupPath), { recursive: true });
		const data = {
			accountId,
			appId,
			clientSecret,
			savedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		const tmpPath = `${backupPath}.tmp`;
		fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
		fs.renameSync(tmpPath, backupPath);
	} catch {}
}
/**
* Load a credential snapshot for `accountId`.
*
* Consults the new per-account file first; falls back to the legacy
* global backup file and migrates it when the embedded `accountId`
* matches the request. Returns `null` when no usable backup exists.
*/
function loadCredentialBackup(accountId) {
	try {
		if (accountId) {
			const newPath = getCredentialBackupFile(accountId);
			if (fs.existsSync(newPath)) {
				const data = JSON.parse(fs.readFileSync(newPath, "utf8"));
				if (data?.appId && data.clientSecret) return data;
			}
		}
		const legacy = getLegacyCredentialBackupFile();
		if (fs.existsSync(legacy)) {
			const data = JSON.parse(fs.readFileSync(legacy, "utf8"));
			if (!data?.appId || !data?.clientSecret) return null;
			if (accountId && data.accountId !== accountId) return null;
			if (data.accountId) try {
				const backupPath = getCredentialBackupFile(data.accountId);
				fs.mkdirSync(path.dirname(backupPath), { recursive: true });
				const tmpPath = `${backupPath}.tmp`;
				fs.writeFileSync(tmpPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
				fs.renameSync(tmpPath, backupPath);
				fs.unlinkSync(legacy);
			} catch {}
			return data;
		}
	} catch {}
	return null;
}
//#endregion
//#region extensions/qqbot/src/engine/config/credentials.ts
/**
* QQBot credential management (pure logic layer).
* QQBot 凭证管理（纯逻辑层）。
*
* Credential clearing and field-level cleanup for logout and setup
* flows. All functions operate on plain objects (Record<string, unknown>)
* and stay framework-agnostic.
*/
/**
* Remove clientSecret / clientSecretFile from a QQBot account config.
*
* Returns a shallow-cloned config with credentials removed, plus flags
* indicating whether anything actually changed.
*/
function clearAccountCredentials(cfg, accountId) {
	const nextCfg = { ...cfg };
	const channels = asOptionalObjectRecord(cfg.channels);
	const nextQQBot = channels?.qqbot ? { ...asOptionalObjectRecord(channels.qqbot) } : void 0;
	let cleared = false;
	let changed = false;
	if (nextQQBot) {
		const qqbot = nextQQBot;
		if (accountId === "default") {
			if (qqbot.clientSecret) {
				delete qqbot.clientSecret;
				cleared = true;
				changed = true;
			}
			if (qqbot.clientSecretFile) {
				delete qqbot.clientSecretFile;
				cleared = true;
				changed = true;
			}
		}
		const accounts = qqbot.accounts;
		if (accounts && accountId in accounts) {
			const entry = accounts[accountId];
			if (entry && "clientSecret" in entry) {
				delete entry.clientSecret;
				cleared = true;
				changed = true;
			}
			if (entry && "clientSecretFile" in entry) {
				delete entry.clientSecretFile;
				cleared = true;
				changed = true;
			}
			if (entry && Object.keys(entry).length === 0) {
				delete accounts[accountId];
				changed = true;
			}
		}
	}
	if (changed && nextQQBot) nextCfg.channels = {
		...channels,
		qqbot: nextQQBot
	};
	return {
		nextCfg,
		cleared,
		changed
	};
}
//#endregion
//#region extensions/qqbot/src/channel.ts
let _gatewayModulePromise;
function loadGatewayModule() {
	_gatewayModulePromise ??= import("./gateway-b6_B-JaX.js");
	return _gatewayModulePromise;
}
const EXEC_APPROVAL_COMMAND_RE = /\/approve(?:@[^\s]+)?\s+[A-Za-z0-9][A-Za-z0-9._:-]*\s+(?:allow-once|allow-always|always|deny)\b/i;
function shouldSuppressLocalQQBotApprovalPrompt(params) {
	if (params.hint?.kind !== "approval-pending" || params.hint.approvalKind !== "exec") return false;
	const account = resolveQQBotAccount(params.cfg, params.accountId);
	if (!account.enabled || account.secretSource === "none") return false;
	if (getExecApprovalReplyMetadata(params.payload)) return true;
	const text = typeof params.payload.text === "string" ? params.payload.text : "";
	return EXEC_APPROVAL_COMMAND_RE.test(text);
}
const qqbotPlugin = {
	id: "qqbot",
	setupWizard: qqbotSetupWizard,
	meta: { ...qqbotMeta },
	capabilities: {
		chatTypes: ["direct", "group"],
		media: true,
		reactions: false,
		threads: false,
		blockStreaming: true
	},
	reload: { configPrefixes: ["channels.qqbot"] },
	configSchema: qqbotChannelConfigSchema,
	config: {
		...qqbotConfigAdapter,
		isConfigured: (account) => {
			if (qqbotConfigAdapter.isConfigured(account)) return true;
			if (!account) return false;
			const backup = loadCredentialBackup(account.accountId);
			return Boolean(backup?.appId && backup?.clientSecret);
		}
	},
	setup: { ...qqbotSetupAdapterShared },
	approvalCapability: getQQBotApprovalCapability(),
	messaging: {
		normalizeTarget,
		targetResolver: {
			looksLikeId: looksLikeQQBotTarget,
			hint: "QQ Bot target format: qqbot:c2c:openid (direct) or qqbot:group:groupid (group)"
		}
	},
	outbound: {
		deliveryMode: "direct",
		chunker: (text, limit) => getQQBotRuntime().channel.text.chunkMarkdownText(text, limit),
		chunkerMode: "markdown",
		textChunkLimit: 5e3,
		shouldSuppressLocalPayloadPrompt: ({ cfg, accountId, payload, hint }) => shouldSuppressLocalQQBotApprovalPrompt({
			cfg,
			accountId,
			payload,
			hint
		}),
		sendText: async ({ to, text, accountId, replyToId, cfg }) => {
			await loadGatewayModule();
			const account = resolveQQBotAccount(cfg, accountId);
			const { sendText } = await import("./outbound-CNhvemR8.js").then((n) => n.i);
			const result = await sendText({
				to,
				text,
				accountId,
				replyToId,
				account
			});
			return {
				channel: "qqbot",
				messageId: result.messageId ?? "",
				meta: result.error ? { error: result.error } : void 0
			};
		},
		sendMedia: async ({ to, text, mediaUrl, accountId, replyToId, cfg }) => {
			await loadGatewayModule();
			const account = resolveQQBotAccount(cfg, accountId);
			const { sendMedia } = await import("./outbound-CNhvemR8.js").then((n) => n.i);
			const result = await sendMedia({
				to,
				text: text ?? "",
				mediaUrl: mediaUrl ?? "",
				accountId,
				replyToId,
				account
			});
			return {
				channel: "qqbot",
				messageId: result.messageId ?? "",
				meta: result.error ? { error: result.error } : void 0
			};
		}
	},
	gateway: {
		startAccount: async (ctx) => {
			let { account, cfg } = ctx;
			const { abortSignal, log } = ctx;
			if (!account.appId || !account.clientSecret) {
				const backup = loadCredentialBackup(account.accountId);
				if (backup?.appId && backup?.clientSecret) try {
					const nextCfg = applyQQBotAccountConfig(cfg, account.accountId, {
						appId: backup.appId,
						clientSecret: backup.clientSecret
					});
					await getQQBotRuntime().config.writeConfigFile(nextCfg);
					cfg = nextCfg;
					account = resolveQQBotAccount(nextCfg, account.accountId);
					log?.info(`[qqbot:${account.accountId}] Restored credentials from backup (appId=${account.appId})`);
				} catch (err) {
					log?.error(`[qqbot:${account.accountId}] Failed to restore credentials from backup: ${err instanceof Error ? err.message : String(err)}`);
				}
			}
			const { startGateway } = await loadGatewayModule();
			log?.info(`[qqbot:${account.accountId}] Starting gateway — appId=${account.appId}, enabled=${account.enabled}, name=${account.name ?? "unnamed"}`);
			await startGateway({
				account,
				abortSignal,
				cfg,
				log,
				channelRuntime: ctx.channelRuntime,
				onReady: () => {
					log?.info(`[qqbot:${account.accountId}] Gateway ready`);
					ctx.setStatus({
						...ctx.getStatus(),
						running: true,
						connected: true,
						lastConnectedAt: Date.now()
					});
					if (account.appId && account.clientSecret) saveCredentialBackup(account.accountId, account.appId, account.clientSecret);
				},
				onResumed: () => {
					log?.info(`[qqbot:${account.accountId}] Gateway resumed`);
					ctx.setStatus({
						...ctx.getStatus(),
						running: true,
						connected: true,
						lastConnectedAt: Date.now()
					});
					if (account.appId && account.clientSecret) saveCredentialBackup(account.accountId, account.appId, account.clientSecret);
				},
				onError: (error) => {
					log?.error(`[qqbot:${account.accountId}] Gateway error: ${error.message}`);
					ctx.setStatus({
						...ctx.getStatus(),
						lastError: error.message
					});
				}
			});
		},
		logoutAccount: async ({ accountId, cfg }) => {
			const { nextCfg, cleared, changed } = clearAccountCredentials(cfg, accountId);
			if (changed) await getQQBotRuntime().config.writeConfigFile(nextCfg);
			const loggedOut = resolveQQBotAccount(changed ? nextCfg : cfg, accountId).secretSource === "none";
			return {
				ok: true,
				cleared,
				envToken: Boolean(process.env.QQBOT_CLIENT_SECRET),
				loggedOut
			};
		}
	},
	status: {
		defaultRuntime: {
			accountId: DEFAULT_ACCOUNT_ID$1,
			running: false,
			connected: false,
			lastConnectedAt: null,
			lastError: null,
			lastInboundAt: null,
			lastOutboundAt: null
		},
		buildChannelSummary: ({ snapshot }) => ({
			configured: snapshot.configured ?? false,
			tokenSource: snapshot.tokenSource ?? "none",
			running: snapshot.running ?? false,
			connected: snapshot.connected ?? false,
			lastConnectedAt: snapshot.lastConnectedAt ?? null,
			lastError: snapshot.lastError ?? null
		}),
		buildAccountSnapshot: ({ account, runtime }) => ({
			accountId: account?.accountId ?? DEFAULT_ACCOUNT_ID$1,
			name: account?.name,
			enabled: account?.enabled ?? false,
			configured: Boolean(account?.appId && account?.clientSecret),
			tokenSource: account?.secretSource,
			running: runtime?.running ?? false,
			connected: runtime?.connected ?? false,
			lastConnectedAt: runtime?.lastConnectedAt ?? null,
			lastError: runtime?.lastError ?? null,
			lastInboundAt: runtime?.lastInboundAt ?? null,
			lastOutboundAt: runtime?.lastOutboundAt ?? null
		})
	}
};
//#endregion
export { qqbotPlugin as t };
