import { a as normalizeStringifiedOptionalString, c as getPlatformAdapter, d as registerPlatformAdapterFactory, l as hasPlatformAdapter, o as readStringField, r as normalizeOptionalLowercaseString, t as asOptionalObjectRecord, u as registerPlatformAdapter } from "./string-normalize-Ci6NM5DE.js";
import { hasConfiguredSecretInput, normalizeResolvedSecretInputString, normalizeSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { resolvePreferredOpenClawTmpDir } from "openclaw/plugin-sdk/temp-path";
//#region extensions/qqbot/src/bridge/logger.ts
let _logger = null;
/** Register the framework logger. Called once in startGateway(). */
function setBridgeLogger(logger) {
	_logger = logger;
}
/** Get the bridge logger. Falls back to console if not yet registered. */
function getBridgeLogger() {
	return _logger ?? {
		info: (msg) => console.log(msg),
		error: (msg) => console.error(msg),
		debug: (msg) => console.log(msg)
	};
}
//#endregion
//#region extensions/qqbot/src/bridge/bootstrap.ts
/**
* Bootstrap the PlatformAdapter for the built-in version.
*
* ## Design
*
* The adapter is registered via two complementary mechanisms:
*
* 1. **Factory registration** (`registerPlatformAdapterFactory`) — a lightweight
*    callback stored in `adapter/index.ts` that is invoked lazily by
*    `getPlatformAdapter()` on first access. This guarantees the adapter is
*    available regardless of module evaluation order or bundler chunk splitting.
*
* 2. **Eager side-effect** (`ensurePlatformAdapter()`) — called at module
*    evaluation time when `channel.ts` imports this file. Provides the adapter
*    immediately for code that runs synchronously during startup.
*
* Heavy async-only dependencies (`media-runtime`, `config-runtime`,
* `approval-gateway-runtime`) are lazy-imported inside each async method body
* so that this module evaluates with minimal overhead.
*
* Synchronous dependencies (`secret-input`, `temp-path`) are imported
* statically at the top level so they work reliably in both production and
* vitest (which resolves bare specifiers via `resolve.alias`, not Node CJS).
*/
function createBuiltinAdapter() {
	return {
		async validateRemoteUrl(_url, _options) {},
		async resolveSecret(value) {
			if (typeof value === "string") return value || void 0;
		},
		async downloadFile(url, destDir, filename) {
			const { fetchRemoteMedia } = await import("openclaw/plugin-sdk/media-runtime");
			const result = await fetchRemoteMedia({
				url,
				filePathHint: filename
			});
			const fs = await import("node:fs");
			const path = await import("node:path");
			if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
			const destPath = path.join(destDir, filename ?? "download");
			fs.writeFileSync(destPath, result.buffer);
			return destPath;
		},
		async fetchMedia(options) {
			const { fetchRemoteMedia } = await import("openclaw/plugin-sdk/media-runtime");
			const result = await fetchRemoteMedia({
				url: options.url,
				filePathHint: options.filePathHint,
				maxBytes: options.maxBytes,
				maxRedirects: options.maxRedirects,
				ssrfPolicy: options.ssrfPolicy,
				requestInit: options.requestInit
			});
			return {
				buffer: result.buffer,
				fileName: result.fileName
			};
		},
		getTempDir() {
			return resolvePreferredOpenClawTmpDir();
		},
		hasConfiguredSecret(value) {
			return hasConfiguredSecretInput(value);
		},
		normalizeSecretInputString(value) {
			return normalizeSecretInputString(value) ?? void 0;
		},
		resolveSecretInputString(params) {
			return normalizeResolvedSecretInputString(params) ?? void 0;
		},
		async resolveApproval(approvalId, decision) {
			try {
				const { getRuntimeConfig } = await import("openclaw/plugin-sdk/runtime-config-snapshot");
				const { resolveApprovalOverGateway } = await import("openclaw/plugin-sdk/approval-gateway-runtime");
				await resolveApprovalOverGateway({
					cfg: getRuntimeConfig(),
					approvalId,
					decision,
					clientDisplayName: "QQBot Approval Handler"
				});
				return true;
			} catch (err) {
				getBridgeLogger().error(`[qqbot] resolveApproval failed: ${String(err)}`);
				return false;
			}
		}
	};
}
/**
* Ensure the built-in PlatformAdapter is registered.
*
* Safe to call multiple times — only registers on the first invocation.
* Exported for backward compatibility with code that calls it explicitly.
*/
function ensurePlatformAdapter() {
	if (!hasPlatformAdapter()) registerPlatformAdapter(createBuiltinAdapter());
}
registerPlatformAdapterFactory(createBuiltinAdapter);
ensurePlatformAdapter();
//#endregion
//#region extensions/qqbot/src/engine/config/resolve.ts
/**
* QQBot config resolution (pure logic layer).
* QQBot 配置解析（纯逻辑层）。
*
* Resolves account IDs, default account selection, and base account
* info from raw config objects. Secret/credential resolution is
* intentionally left to the outer layer (src/bridge/config.ts) so that
* this module stays framework-agnostic and self-contained.
*/
/**
* Default account ID, used for the unnamed top-level account.
* 默认账号 ID，用于顶层配置中未命名的账号。
*/
const DEFAULT_ACCOUNT_ID = "default";
function normalizeAppId(raw) {
	if (typeof raw === "string") return raw.trim();
	if (typeof raw === "number") return String(raw);
	return "";
}
function normalizeAccountConfig(account) {
	if (!account) return {};
	const audioPolicy = asOptionalObjectRecord(account.audioFormatPolicy);
	return {
		...account,
		...audioPolicy ? { audioFormatPolicy: { ...audioPolicy } } : {}
	};
}
function readQQBotSection(cfg) {
	return asOptionalObjectRecord(asOptionalObjectRecord(cfg.channels)?.qqbot);
}
/**
* List all configured QQBot account IDs.
* 列出所有已配置的 QQBot 账号 ID。
*/
function listAccountIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const qqbot = readQQBotSection(cfg);
	if (qqbot?.appId || process.env.QQBOT_APP_ID) ids.add(DEFAULT_ACCOUNT_ID);
	if (qqbot?.accounts) {
		for (const accountId of Object.keys(qqbot.accounts)) if (qqbot.accounts[accountId]?.appId) ids.add(accountId);
	}
	return Array.from(ids);
}
/**
* Resolve the default QQBot account ID.
* 解析默认 QQBot 账号 ID（优先级：defaultAccount > 顶层 appId > 第一个命名账号）。
*/
function resolveDefaultAccountId(cfg) {
	const qqbot = readQQBotSection(cfg);
	const configuredDefaultAccountId = normalizeOptionalLowercaseString(qqbot?.defaultAccount);
	if (configuredDefaultAccountId && (configuredDefaultAccountId === "default" || Boolean(qqbot?.accounts?.[configuredDefaultAccountId]?.appId))) return configuredDefaultAccountId;
	if (qqbot?.appId || process.env.QQBOT_APP_ID) return DEFAULT_ACCOUNT_ID;
	if (qqbot?.accounts) {
		const ids = Object.keys(qqbot.accounts);
		if (ids.length > 0) return ids[0];
	}
	return DEFAULT_ACCOUNT_ID;
}
/**
* Resolve base account info (without credentials).
* 解析账号基础信息（不含凭证）。
*
* Resolves everything except Secret/credential fields. The outer
* config.ts layer calls this and adds Secret handling on top.
*/
function resolveAccountBase(cfg, accountId) {
	const resolvedAccountId = accountId ?? resolveDefaultAccountId(cfg);
	const qqbot = readQQBotSection(cfg);
	let accountConfig = {};
	let appId = "";
	if (resolvedAccountId === "default") {
		accountConfig = normalizeAccountConfig(asOptionalObjectRecord(qqbot));
		appId = normalizeAppId(qqbot?.appId);
	} else {
		const account = qqbot?.accounts?.[resolvedAccountId];
		accountConfig = normalizeAccountConfig(asOptionalObjectRecord(account));
		appId = normalizeAppId(asOptionalObjectRecord(account)?.appId);
	}
	if (!appId && process.env.QQBOT_APP_ID && resolvedAccountId === "default") appId = normalizeAppId(process.env.QQBOT_APP_ID);
	return {
		accountId: resolvedAccountId,
		name: readStringField(accountConfig, "name"),
		enabled: accountConfig.enabled !== false,
		appId,
		systemPrompt: readStringField(accountConfig, "systemPrompt"),
		markdownSupport: accountConfig.markdownSupport !== false,
		config: accountConfig
	};
}
/** Apply account config updates into a raw config object. */
function applyAccountConfig(cfg, accountId, input) {
	const next = { ...cfg };
	const channels = asOptionalObjectRecord(cfg.channels) ?? {};
	const existingQQBot = asOptionalObjectRecord(channels.qqbot) ?? {};
	if (accountId === "default") {
		const allowFrom = existingQQBot.allowFrom ?? ["*"];
		next.channels = {
			...channels,
			qqbot: {
				...existingQQBot,
				enabled: true,
				allowFrom,
				...input.appId ? { appId: input.appId } : {},
				...input.clientSecret ? {
					clientSecret: input.clientSecret,
					clientSecretFile: void 0
				} : input.clientSecretFile ? {
					clientSecretFile: input.clientSecretFile,
					clientSecret: void 0
				} : {},
				...input.name ? { name: input.name } : {}
			}
		};
	} else {
		const accounts = existingQQBot.accounts ?? {};
		const existingAccount = accounts[accountId] ?? {};
		const allowFrom = existingAccount.allowFrom ?? ["*"];
		next.channels = {
			...channels,
			qqbot: {
				...existingQQBot,
				enabled: true,
				accounts: {
					...accounts,
					[accountId]: {
						...existingAccount,
						enabled: true,
						allowFrom,
						...input.appId ? { appId: input.appId } : {},
						...input.clientSecret ? {
							clientSecret: input.clientSecret,
							clientSecretFile: void 0
						} : input.clientSecretFile ? {
							clientSecretFile: input.clientSecretFile,
							clientSecret: void 0
						} : {},
						...input.name ? { name: input.name } : {}
					}
				}
			}
		};
	}
	return next;
}
/** Check whether a QQBot account has been fully configured. */
function isAccountConfigured(account) {
	return Boolean(account?.appId && (Boolean(account?.clientSecret) || getPlatformAdapter().hasConfiguredSecret(account?.config?.clientSecret) || Boolean(account?.config?.clientSecretFile?.trim())));
}
/** Build a summary description of an account. */
function describeAccount(account) {
	return {
		accountId: account?.accountId ?? "default",
		name: account?.name,
		enabled: account?.enabled ?? false,
		configured: isAccountConfigured(account),
		tokenSource: account?.secretSource
	};
}
/** Normalize allowFrom entries into uppercase strings without the qqbot: prefix. */
function formatAllowFrom(allowFrom) {
	return (allowFrom ?? []).map((entry) => normalizeStringifiedOptionalString(entry)).filter((entry) => Boolean(entry)).map((entry) => entry.replace(/^qqbot:/i, "")).map((entry) => entry.toUpperCase());
}
//#endregion
export { isAccountConfigured as a, resolveDefaultAccountId as c, setBridgeLogger as d, formatAllowFrom as i, ensurePlatformAdapter as l, applyAccountConfig as n, listAccountIds as o, describeAccount as r, resolveAccountBase as s, DEFAULT_ACCOUNT_ID as t, getBridgeLogger as u };
