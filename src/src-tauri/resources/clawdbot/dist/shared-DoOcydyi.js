import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { t as getChatChannelMeta } from "./chat-meta-Cdrnv7R-.js";
import { n as resolveNormalizedAccountEntry } from "./account-lookup-DI_0omIr.js";
import { c as createScopedChannelConfigAdapter, t as adaptScopedAccountAccessor } from "./channel-config-helpers-B0S2z66F.js";
import "./account-core-C5WQtrMO.js";
import { n as createChannelPluginBase } from "./core-BghMcc08.js";
import "./routing-Br1fEo8A.js";
import { t as formatAllowFromLowercase } from "./allow-from-BJ5FBYvV.js";
import "./telegram-core-D06a1-N4.js";
import { o as resolveDefaultTelegramAccountId, r as listTelegramAccountIds, s as resolveTelegramAccount } from "./accounts-Dh_rfg3W.js";
import { t as inspectTelegramAccount } from "./account-inspect-Bn51pMYf.js";
import { t as TelegramChannelConfigSchema } from "./config-schema-VK-D1vNz.js";
//#region extensions/telegram/src/shared.ts
const TELEGRAM_CHANNEL = "telegram";
function findTelegramTokenOwnerAccountId(params) {
	const normalizedAccountId = normalizeAccountId(params.accountId);
	const tokenOwners = /* @__PURE__ */ new Map();
	for (const id of listTelegramAccountIds(params.cfg)) {
		const account = inspectTelegramAccount({
			cfg: params.cfg,
			accountId: id
		});
		const token = (account.token ?? "").trim();
		if (!token) continue;
		const ownerAccountId = tokenOwners.get(token);
		if (!ownerAccountId) {
			tokenOwners.set(token, account.accountId);
			continue;
		}
		if (account.accountId === normalizedAccountId) return ownerAccountId;
	}
	return null;
}
function formatDuplicateTelegramTokenReason(params) {
	return `Duplicate Telegram bot token: account "${params.accountId}" shares a token with account "${params.ownerAccountId}". Keep one owner account per bot token.`;
}
/**
* Returns true when the runtime token resolver (`resolveTelegramToken`) would
* block channel-level fallthrough for the given accountId.  This mirrors the
* guard in `token.ts` so that status-check functions (`isConfigured`,
* `unconfiguredReason`, `describeAccount`) stay consistent with the gateway
* runtime behaviour.
*
* The guard fires when:
*   1. The accountId is not the default account, AND
*   2. The config has an explicit `accounts` section with entries, AND
*   3. The accountId is not found in that `accounts` section.
*
* See: https://github.com/openclaw/openclaw/issues/53876
*/
function isBlockedByMultiBotGuard(cfg, accountId) {
	if (normalizeAccountId(accountId) === "default") return false;
	const accounts = cfg.channels?.telegram?.accounts;
	if (!(!!accounts && typeof accounts === "object" && !Array.isArray(accounts) && Object.keys(accounts).length > 0)) return false;
	return !resolveNormalizedAccountEntry(accounts, accountId, normalizeAccountId);
}
const telegramConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: TELEGRAM_CHANNEL,
	listAccountIds: listTelegramAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveTelegramAccount),
	inspectAccount: adaptScopedAccountAccessor(inspectTelegramAccount),
	defaultAccountId: resolveDefaultTelegramAccountId,
	clearBaseFields: [
		"botToken",
		"tokenFile",
		"name"
	],
	resolveAllowFrom: (account) => account.config.allowFrom,
	formatAllowFrom: (allowFrom) => formatAllowFromLowercase({
		allowFrom,
		stripPrefixRe: /^(telegram|tg):/i
	}),
	resolveDefaultTo: (account) => account.config.defaultTo
});
function createTelegramPluginBase(params) {
	return createChannelPluginBase({
		id: TELEGRAM_CHANNEL,
		meta: {
			...getChatChannelMeta(TELEGRAM_CHANNEL),
			quickstartAllowFrom: true
		},
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"channel",
				"thread"
			],
			reactions: true,
			threads: true,
			media: true,
			polls: true,
			nativeCommands: true,
			blockStreaming: true
		},
		reload: { configPrefixes: ["channels.telegram"] },
		configSchema: TelegramChannelConfigSchema,
		config: {
			...telegramConfigAdapter,
			isConfigured: (account, cfg) => {
				if (isBlockedByMultiBotGuard(cfg, account.accountId)) return false;
				if (!inspectTelegramAccount({
					cfg,
					accountId: account.accountId
				}).token?.trim()) return false;
				return !findTelegramTokenOwnerAccountId({
					cfg,
					accountId: account.accountId
				});
			},
			unconfiguredReason: (account, cfg) => {
				if (isBlockedByMultiBotGuard(cfg, account.accountId)) return `not configured: unknown accountId "${account.accountId}" in multi-bot setup`;
				const inspected = inspectTelegramAccount({
					cfg,
					accountId: account.accountId
				});
				if (!inspected.token?.trim()) {
					if (inspected.tokenStatus === "configured_unavailable") return `not configured: token ${inspected.tokenSource} is configured but unavailable`;
					return "not configured";
				}
				const ownerAccountId = findTelegramTokenOwnerAccountId({
					cfg,
					accountId: account.accountId
				});
				if (!ownerAccountId) return "not configured";
				return formatDuplicateTelegramTokenReason({
					accountId: account.accountId,
					ownerAccountId
				});
			},
			describeAccount: (account, cfg) => {
				if (isBlockedByMultiBotGuard(cfg, account.accountId)) return {
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured: false,
					tokenSource: "none"
				};
				const inspected = inspectTelegramAccount({
					cfg,
					accountId: account.accountId
				});
				return {
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured: !!inspected.token?.trim() && !findTelegramTokenOwnerAccountId({
						cfg,
						accountId: account.accountId
					}),
					tokenSource: inspected.tokenSource
				};
			}
		},
		setup: params.setup
	});
}
//#endregion
export { telegramConfigAdapter as i, findTelegramTokenOwnerAccountId as n, formatDuplicateTelegramTokenReason as r, createTelegramPluginBase as t };
