import { c as resolveTelegramPollActionGateState, n as listEnabledTelegramAccounts, o as resolveTelegramAccount, t as createTelegramActionGate } from "./accounts-q2NkR7D9.js";
import { a as makeProxyFetch, n as resolveTelegramFetch, r as resolveTelegramTransport, t as resolveTelegramApiBase } from "./fetch-CQWpZY-X.js";
import { t as isTelegramInlineButtonsEnabled } from "./inline-buttons-B8GtAZuW.js";
import { a as isTelegramExecApprovalHandlerConfigured, i as isTelegramExecApprovalClientEnabled } from "./exec-approvals-DsCBiE53.js";
import { E as isRecoverableTelegramNetworkError, k as isTelegramPollingNetworkError } from "./send-B5NZ9QZr.js";
import { t as resolveTelegramAllowedUpdates } from "./allowed-updates-BD2bJyzD.js";
import { loadConfig, resolveAgentMaxConcurrent } from "openclaw/plugin-sdk/config-runtime";
import { normalizeMessageChannel } from "openclaw/plugin-sdk/routing";
import { fetchWithTimeout, normalizeOptionalString, readStringValue } from "openclaw/plugin-sdk/text-runtime";
import { registerUnhandledRejectionHandler, waitForAbortSignal } from "openclaw/plugin-sdk/runtime-env";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY } from "openclaw/plugin-sdk/approval-handler-adapter-runtime";
import { createUnionActionGate, listTokenSourcedAccounts, resolveReactionMessageId } from "openclaw/plugin-sdk/channel-actions";
import { extractToolSend } from "openclaw/plugin-sdk/tool-send";
import { Type } from "typebox";
import { buildExecApprovalPendingReplyPayload, resolveExecApprovalCommandDisplay, resolveExecApprovalRequestAllowedDecisions } from "openclaw/plugin-sdk/approval-reply-runtime";
import { registerChannelRuntimeContext } from "openclaw/plugin-sdk/channel-runtime-context";
import { formatErrorMessage as formatErrorMessage$1 } from "openclaw/plugin-sdk/ssrf-runtime";
//#region extensions/telegram/src/audit.ts
function collectTelegramUnmentionedGroupIds(groups) {
	if (!groups || typeof groups !== "object") return {
		groupIds: [],
		unresolvedGroups: 0,
		hasWildcardUnmentionedGroups: false
	};
	const hasWildcardUnmentionedGroups = groups["*"]?.requireMention === false && groups["*"]?.enabled !== false;
	const groupIds = [];
	let unresolvedGroups = 0;
	for (const [key, value] of Object.entries(groups)) {
		if (key === "*") continue;
		if (!value || typeof value !== "object") continue;
		if (value.enabled === false) continue;
		if (value.requireMention !== false) continue;
		const id = normalizeOptionalString(key) ?? "";
		if (!id) continue;
		if (/^-?\d+$/.test(id)) groupIds.push(id);
		else unresolvedGroups += 1;
	}
	groupIds.sort((a, b) => a.localeCompare(b));
	return {
		groupIds,
		unresolvedGroups,
		hasWildcardUnmentionedGroups
	};
}
let auditMembershipRuntimePromise = null;
function loadAuditMembershipRuntime() {
	auditMembershipRuntimePromise ??= import("./audit-membership-runtime-BWSp0uUu.js");
	return auditMembershipRuntimePromise;
}
async function auditTelegramGroupMembership(params) {
	const started = Date.now();
	const token = normalizeOptionalString(params.token) ?? "";
	if (!token || params.groupIds.length === 0) return {
		ok: true,
		checkedGroups: 0,
		unresolvedGroups: 0,
		hasWildcardUnmentionedGroups: false,
		groups: [],
		elapsedMs: Date.now() - started
	};
	const { auditTelegramGroupMembershipImpl } = await loadAuditMembershipRuntime();
	return {
		...await auditTelegramGroupMembershipImpl({
			...params,
			token
		}),
		elapsedMs: Date.now() - started
	};
}
//#endregion
//#region extensions/telegram/src/message-tool-schema.ts
function createTelegramPollExtraToolSchemas() {
	return {
		pollDurationSeconds: Type.Optional(Type.Number()),
		pollAnonymous: Type.Optional(Type.Boolean()),
		pollPublic: Type.Optional(Type.Boolean())
	};
}
//#endregion
//#region extensions/telegram/src/channel-actions.ts
let telegramActionRuntimePromise = null;
async function loadTelegramActionRuntime() {
	telegramActionRuntimePromise ??= import("./action-runtime-9RtTJ1Kn.js");
	return await telegramActionRuntimePromise;
}
const telegramMessageActionRuntime = { handleTelegramAction: async (...args) => {
	const { handleTelegramAction } = await loadTelegramActionRuntime();
	return await handleTelegramAction(...args);
} };
const TELEGRAM_MESSAGE_ACTION_MAP = {
	delete: "deleteMessage",
	edit: "editMessage",
	poll: "poll",
	react: "react",
	send: "sendMessage",
	sticker: "sendSticker",
	"sticker-search": "searchSticker",
	"topic-create": "createForumTopic",
	"topic-edit": "editForumTopic"
};
function resolveTelegramMessageActionName(action) {
	return TELEGRAM_MESSAGE_ACTION_MAP[action];
}
function resolveTelegramActionDiscovery(cfg) {
	const accounts = listTokenSourcedAccounts(listEnabledTelegramAccounts(cfg));
	if (accounts.length === 0) return null;
	const unionGate = createUnionActionGate(accounts, (account) => createTelegramActionGate({
		cfg,
		accountId: account.accountId
	}));
	return {
		isEnabled: (key, defaultValue = true) => unionGate(key, defaultValue),
		pollEnabled: accounts.some((account) => {
			return resolveTelegramPollActionGateState(createTelegramActionGate({
				cfg,
				accountId: account.accountId
			})).enabled;
		}),
		buttonsEnabled: accounts.some((account) => isTelegramInlineButtonsEnabled({
			cfg,
			accountId: account.accountId
		}))
	};
}
function resolveScopedTelegramActionDiscovery(params) {
	if (!params.accountId) return resolveTelegramActionDiscovery(params.cfg);
	const account = resolveTelegramAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.enabled || account.tokenSource === "none") return null;
	const gate = createTelegramActionGate({
		cfg: params.cfg,
		accountId: account.accountId
	});
	return {
		isEnabled: (key, defaultValue = true) => gate(key, defaultValue),
		pollEnabled: resolveTelegramPollActionGateState(gate).enabled,
		buttonsEnabled: isTelegramInlineButtonsEnabled({
			cfg: params.cfg,
			accountId: account.accountId
		})
	};
}
function describeTelegramMessageTool({ cfg, accountId }) {
	const discovery = resolveScopedTelegramActionDiscovery({
		cfg,
		accountId
	});
	if (!discovery) return {
		actions: [],
		capabilities: [],
		schema: null
	};
	const actions = new Set(["send"]);
	if (discovery.pollEnabled) actions.add("poll");
	if (discovery.isEnabled("reactions")) actions.add("react");
	if (discovery.isEnabled("deleteMessage")) actions.add("delete");
	if (discovery.isEnabled("editMessage")) actions.add("edit");
	if (discovery.isEnabled("sticker", false)) {
		actions.add("sticker");
		actions.add("sticker-search");
	}
	if (discovery.isEnabled("createForumTopic")) actions.add("topic-create");
	if (discovery.isEnabled("editForumTopic")) actions.add("topic-edit");
	const schema = [];
	if (discovery.pollEnabled) schema.push({
		properties: createTelegramPollExtraToolSchemas(),
		visibility: "all-configured"
	});
	return {
		actions: Array.from(actions),
		capabilities: discovery.buttonsEnabled ? ["presentation", "delivery-pin"] : ["delivery-pin"],
		schema
	};
}
const telegramMessageActions = {
	describeMessageTool: describeTelegramMessageTool,
	resolveCliActionRequest: ({ action, args }) => {
		if (action !== "thread-create") return {
			action,
			args
		};
		const { threadName, ...rest } = args;
		return {
			action: "topic-create",
			args: {
				...rest,
				name: readStringValue(threadName)
			}
		};
	},
	extractToolSend: ({ args }) => {
		return extractToolSend(args, "sendMessage");
	},
	handleAction: async ({ action, params, cfg, accountId, mediaLocalRoots, toolContext }) => {
		const telegramAction = resolveTelegramMessageActionName(action);
		if (!telegramAction) throw new Error(`Unsupported Telegram action: ${action}`);
		return await telegramMessageActionRuntime.handleTelegramAction({
			...params,
			action: telegramAction,
			accountId: accountId ?? void 0,
			...action === "react" ? { messageId: resolveReactionMessageId({
				args: params,
				toolContext
			}) } : {}
		}, cfg, { mediaLocalRoots });
	}
};
//#endregion
//#region extensions/telegram/src/exec-approval-forwarding.ts
function shouldSuppressTelegramExecApprovalForwardingFallback(params) {
	if ((normalizeMessageChannel(params.target.channel) ?? params.target.channel) !== "telegram") return false;
	if (normalizeMessageChannel(params.request.request.turnSourceChannel ?? "") !== "telegram") return false;
	const accountId = params.target.accountId?.trim() || params.request.request.turnSourceAccountId?.trim();
	return isTelegramExecApprovalClientEnabled({
		cfg: params.cfg,
		accountId
	});
}
function buildTelegramExecApprovalPendingPayload(params) {
	return buildExecApprovalPendingReplyPayload({
		approvalId: params.request.id,
		approvalSlug: params.request.id.slice(0, 8),
		approvalCommandId: params.request.id,
		command: resolveExecApprovalCommandDisplay(params.request.request).commandText,
		cwd: params.request.request.cwd ?? void 0,
		host: params.request.request.host === "node" ? "node" : "gateway",
		nodeId: params.request.request.nodeId ?? void 0,
		allowedDecisions: resolveExecApprovalRequestAllowedDecisions(params.request.request),
		expiresAtMs: params.request.expiresAtMs,
		nowMs: params.nowMs
	});
}
//#endregion
//#region extensions/telegram/src/monitor.ts
function createTelegramRunnerOptions(cfg) {
	return {
		sink: { concurrency: resolveAgentMaxConcurrent(cfg) },
		runner: {
			fetch: {
				timeout: 30,
				allowed_updates: resolveTelegramAllowedUpdates()
			},
			silent: true,
			maxRetryTime: 3600 * 1e3,
			retryInterval: "exponential"
		}
	};
}
function normalizePersistedUpdateId(value) {
	if (value === null) return null;
	if (!Number.isSafeInteger(value) || value < 0) return null;
	return value;
}
/** Check if error is a Grammy HttpError (used to scope unhandled rejection handling) */
const isGrammyHttpError = (err) => {
	if (!err || typeof err !== "object") return false;
	return err.name === "HttpError";
};
let telegramMonitorPollingRuntimePromise;
async function loadTelegramMonitorPollingRuntime() {
	telegramMonitorPollingRuntimePromise ??= import("./monitor-polling.runtime-cvefT1B7.js");
	return await telegramMonitorPollingRuntimePromise;
}
let telegramMonitorWebhookRuntimePromise;
async function loadTelegramMonitorWebhookRuntime() {
	telegramMonitorWebhookRuntimePromise ??= import("./monitor-webhook.runtime-WTEKFKEE.js");
	return await telegramMonitorWebhookRuntimePromise;
}
async function monitorTelegramProvider(opts = {}) {
	const log = opts.runtime?.error ?? console.error;
	let pollingSession;
	const unregisterHandler = registerUnhandledRejectionHandler((err) => {
		const isNetworkError = isRecoverableTelegramNetworkError(err, { context: "polling" });
		const isTelegramPollingError = isTelegramPollingNetworkError(err);
		if (isGrammyHttpError(err) && isNetworkError && isTelegramPollingError) {
			log(`[telegram] Suppressed network error: ${formatErrorMessage$1(err)}`);
			return true;
		}
		const activeRunner = pollingSession?.activeRunner;
		if (isNetworkError && isTelegramPollingError && activeRunner && activeRunner.isRunning()) {
			pollingSession?.markForceRestarted();
			pollingSession?.markTransportDirty();
			pollingSession?.abortActiveFetch();
			activeRunner.stop().catch(() => {});
			log("[telegram][diag] marking transport dirty after polling network failure");
			log(`[telegram] Restarting polling after unhandled network error: ${formatErrorMessage$1(err)}`);
			return true;
		}
		return false;
	});
	try {
		const cfg = opts.config ?? loadConfig();
		const account = resolveTelegramAccount({
			cfg,
			accountId: opts.accountId
		});
		const token = opts.token?.trim() || account.token;
		if (!token) throw new Error(`Telegram bot token missing for account "${account.accountId}" (set channels.telegram.accounts.${account.accountId}.botToken/tokenFile or TELEGRAM_BOT_TOKEN for default).`);
		const proxyFetch = opts.proxyFetch ?? (account.config.proxy ? makeProxyFetch(account.config.proxy) : void 0);
		if (opts.useWebhook) {
			const { startTelegramWebhook } = await loadTelegramMonitorWebhookRuntime();
			if (isTelegramExecApprovalHandlerConfigured({
				cfg,
				accountId: account.accountId
			})) registerChannelRuntimeContext({
				channelRuntime: opts.channelRuntime,
				channelId: "telegram",
				accountId: account.accountId,
				capability: CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY,
				context: { token },
				abortSignal: opts.abortSignal
			});
			await startTelegramWebhook({
				token,
				accountId: account.accountId,
				config: cfg,
				path: opts.webhookPath,
				port: opts.webhookPort,
				secret: opts.webhookSecret ?? account.config.webhookSecret,
				host: opts.webhookHost ?? account.config.webhookHost,
				runtime: opts.runtime,
				fetch: proxyFetch,
				abortSignal: opts.abortSignal,
				publicUrl: opts.webhookUrl,
				webhookCertPath: opts.webhookCertPath
			});
			await waitForAbortSignal(opts.abortSignal);
			return;
		}
		const { TelegramPollingSession, readTelegramUpdateOffset, writeTelegramUpdateOffset } = await loadTelegramMonitorPollingRuntime();
		if (isTelegramExecApprovalHandlerConfigured({
			cfg,
			accountId: account.accountId
		})) registerChannelRuntimeContext({
			channelRuntime: opts.channelRuntime,
			channelId: "telegram",
			accountId: account.accountId,
			capability: CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY,
			context: { token },
			abortSignal: opts.abortSignal
		});
		const persistedOffsetRaw = await readTelegramUpdateOffset({
			accountId: account.accountId,
			botToken: token
		});
		let lastUpdateId = normalizePersistedUpdateId(persistedOffsetRaw);
		if (persistedOffsetRaw !== null && lastUpdateId === null) log(`[telegram] Ignoring invalid persisted update offset (${String(persistedOffsetRaw)}); starting without offset confirmation.`);
		const persistUpdateId = async (updateId) => {
			const normalizedUpdateId = normalizePersistedUpdateId(updateId);
			if (normalizedUpdateId === null) {
				log(`[telegram] Ignoring invalid update_id value: ${String(updateId)}`);
				return;
			}
			if (lastUpdateId !== null && normalizedUpdateId <= lastUpdateId) return;
			lastUpdateId = normalizedUpdateId;
			try {
				await writeTelegramUpdateOffset({
					accountId: account.accountId,
					updateId: normalizedUpdateId,
					botToken: token
				});
			} catch (err) {
				(opts.runtime?.error ?? console.error)(`telegram: failed to persist update offset: ${String(err)}`);
			}
		};
		const createTelegramTransportForPolling = () => resolveTelegramTransport(proxyFetch, { network: account.config.network });
		const telegramTransport = createTelegramTransportForPolling();
		pollingSession = new TelegramPollingSession({
			token,
			config: cfg,
			accountId: account.accountId,
			runtime: opts.runtime,
			proxyFetch,
			abortSignal: opts.abortSignal,
			runnerOptions: createTelegramRunnerOptions(cfg),
			getLastUpdateId: () => lastUpdateId,
			persistUpdateId,
			log,
			telegramTransport,
			createTelegramTransport: createTelegramTransportForPolling,
			stallThresholdMs: account.config.pollingStallThresholdMs,
			setStatus: opts.setStatus
		});
		await pollingSession.runUntilAbort();
	} finally {
		unregisterHandler();
	}
}
//#endregion
//#region extensions/telegram/src/probe.ts
const probeFetcherCache = /* @__PURE__ */ new Map();
const MAX_PROBE_FETCHER_CACHE_SIZE = 64;
function resetTelegramProbeFetcherCacheForTests() {
	probeFetcherCache.clear();
}
function resolveProbeOptions(proxyOrOptions) {
	if (!proxyOrOptions) return;
	if (typeof proxyOrOptions === "string") return { proxyUrl: proxyOrOptions };
	return proxyOrOptions;
}
function shouldUseProbeFetcherCache() {
	return !process.env.VITEST && true;
}
function buildProbeFetcherCacheKey(token, options) {
	const cacheIdentity = options?.accountId?.trim() || token;
	const cacheIdentityKind = options?.accountId?.trim() ? "account" : "token";
	const proxyKey = options?.proxyUrl?.trim() ?? "";
	const autoSelectFamily = options?.network?.autoSelectFamily;
	return `${cacheIdentityKind}:${cacheIdentity}::${proxyKey}::${typeof autoSelectFamily === "boolean" ? String(autoSelectFamily) : "default"}::${options?.network?.dnsResultOrder ?? "default"}::${options?.apiRoot?.trim() ?? ""}`;
}
function setCachedProbeFetcher(cacheKey, fetcher) {
	probeFetcherCache.set(cacheKey, fetcher);
	if (probeFetcherCache.size > MAX_PROBE_FETCHER_CACHE_SIZE) {
		const oldestKey = probeFetcherCache.keys().next().value;
		if (oldestKey !== void 0) probeFetcherCache.delete(oldestKey);
	}
	return fetcher;
}
function resolveProbeFetcher(token, options) {
	const cacheKey = shouldUseProbeFetcherCache() ? buildProbeFetcherCacheKey(token, options) : null;
	if (cacheKey) {
		const cachedFetcher = probeFetcherCache.get(cacheKey);
		if (cachedFetcher) return cachedFetcher;
	}
	const proxyUrl = options?.proxyUrl?.trim();
	const resolved = resolveTelegramFetch(proxyUrl ? makeProxyFetch(proxyUrl) : void 0, { network: options?.network });
	if (cacheKey) return setCachedProbeFetcher(cacheKey, resolved);
	return resolved;
}
async function probeTelegram(token, timeoutMs, proxyOrOptions) {
	const started = Date.now();
	const timeoutBudgetMs = Math.max(1, Math.floor(timeoutMs));
	const deadlineMs = started + timeoutBudgetMs;
	const options = resolveProbeOptions(proxyOrOptions);
	const fetcher = resolveProbeFetcher(token, options);
	const base = `${resolveTelegramApiBase(options?.apiRoot)}/bot${token}`;
	const retryDelayMs = Math.max(50, Math.min(1e3, Math.floor(timeoutBudgetMs / 5)));
	const resolveRemainingBudgetMs = () => Math.max(0, deadlineMs - Date.now());
	const result = {
		ok: false,
		status: null,
		error: null,
		elapsedMs: 0
	};
	try {
		let meRes = null;
		let fetchError = null;
		for (let i = 0; i < 3; i++) {
			const remainingBudgetMs = resolveRemainingBudgetMs();
			if (remainingBudgetMs <= 0) break;
			try {
				meRes = await fetchWithTimeout(`${base}/getMe`, {}, Math.max(1, Math.min(timeoutBudgetMs, remainingBudgetMs)), fetcher);
				break;
			} catch (err) {
				fetchError = err;
				if (i < 2) {
					const remainingAfterAttemptMs = resolveRemainingBudgetMs();
					if (remainingAfterAttemptMs <= 0) break;
					const delayMs = Math.min(retryDelayMs, remainingAfterAttemptMs);
					if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
				}
			}
		}
		if (!meRes) throw fetchError ?? /* @__PURE__ */ new Error(`probe timed out after ${timeoutBudgetMs}ms`);
		const meJson = await meRes.json();
		if (!meRes.ok || !meJson?.ok) {
			result.status = meRes.status;
			result.error = meJson?.description ?? `getMe failed (${meRes.status})`;
			return {
				...result,
				elapsedMs: Date.now() - started
			};
		}
		result.bot = {
			id: meJson.result?.id ?? null,
			username: meJson.result?.username ?? null,
			canJoinGroups: typeof meJson.result?.can_join_groups === "boolean" ? meJson.result?.can_join_groups : null,
			canReadAllGroupMessages: typeof meJson.result?.can_read_all_group_messages === "boolean" ? meJson.result?.can_read_all_group_messages : null,
			supportsInlineQueries: typeof meJson.result?.supports_inline_queries === "boolean" ? meJson.result?.supports_inline_queries : null
		};
		try {
			const webhookRemainingBudgetMs = resolveRemainingBudgetMs();
			if (webhookRemainingBudgetMs > 0) {
				const webhookRes = await fetchWithTimeout(`${base}/getWebhookInfo`, {}, Math.max(1, Math.min(timeoutBudgetMs, webhookRemainingBudgetMs)), fetcher);
				const webhookJson = await webhookRes.json();
				if (webhookRes.ok && webhookJson?.ok) result.webhook = {
					url: webhookJson.result?.url ?? null,
					hasCustomCert: webhookJson.result?.has_custom_certificate ?? null
				};
			}
		} catch {}
		result.ok = true;
		result.status = null;
		result.error = null;
		result.elapsedMs = Date.now() - started;
		return result;
	} catch (err) {
		return {
			...result,
			status: err instanceof Response ? err.status : result.status,
			error: formatErrorMessage(err),
			elapsedMs: Date.now() - started
		};
	}
}
//#endregion
export { shouldSuppressTelegramExecApprovalForwardingFallback as a, collectTelegramUnmentionedGroupIds as c, buildTelegramExecApprovalPendingPayload as i, resetTelegramProbeFetcherCacheForTests as n, telegramMessageActions as o, monitorTelegramProvider as r, auditTelegramGroupMembership as s, probeTelegram as t };
