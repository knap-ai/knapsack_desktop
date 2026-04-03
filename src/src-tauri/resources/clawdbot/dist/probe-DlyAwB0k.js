import { d as normalizeMessageChannel } from "./message-channel-D19EDm2g.js";
import { r as fetchWithTimeout } from "./fetch-timeout-C2XH7I0A.js";
import { T as resolveExecApprovalRequestAllowedDecisions } from "./exec-approvals-D6YTmZxM.js";
import { a as buildExecApprovalPendingReplyPayload } from "./exec-approval-reply-B909d7mK.js";
import { r as makeProxyFetch } from "./proxy-fetch-Bib4caGq.js";
import "./routing-Br1fEo8A.js";
import { o as resolveExecApprovalCommandDisplay } from "./exec-approval-session-target-C1KSzAWi.js";
import "./approval-runtime-8-_vGYcG.js";
import { t as resolveReactionLevel } from "./text-runtime-B0ZpmkER.js";
import { s as resolveTelegramAccount } from "./accounts-Dh_rfg3W.js";
import { n as resolveTelegramFetch, t as resolveTelegramApiBase } from "./fetch-DttJw83W.js";
import { i as isTelegramExecApprovalClientEnabled } from "./exec-approvals-BVAdWdf7.js";
//#region extensions/telegram/src/reaction-level.ts
/**
* Resolve the effective reaction level and its implications.
*/
function resolveTelegramReactionLevel(params) {
	return resolveReactionLevel({
		value: resolveTelegramAccount({
			cfg: params.cfg,
			accountId: params.accountId
		}).config.reactionLevel,
		defaultLevel: "minimal",
		invalidFallback: "ack"
	});
}
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
			error: err instanceof Error ? err.message : String(err),
			elapsedMs: Date.now() - started
		};
	}
}
//#endregion
export { resolveTelegramReactionLevel as a, shouldSuppressTelegramExecApprovalForwardingFallback as i, resetTelegramProbeFetcherCacheForTests as n, buildTelegramExecApprovalPendingPayload as r, probeTelegram as t };
