import { ct as normalizeAnyChannelId, ft as requireActivePluginRegistry, n as isTruthyEnvValue, nt as CHAT_CHANNEL_ORDER, ut as normalizeChatChannelId } from "./entry.js";
import { c as normalizeAccountId, l as normalizeAgentId, t as DEFAULT_ACCOUNT_ID } from "./session-key-DVvxnFKg.js";
import { m as normalizeE164 } from "./utils-q1rHOG-N.js";
import { c as resolveDefaultAgentId } from "./agent-scope-Bu62UIQZ.js";
import fs from "node:fs";

//#region src/discord/token.ts
function normalizeDiscordToken(raw) {
	if (!raw) return;
	const trimmed = raw.trim();
	if (!trimmed) return;
	return trimmed.replace(/^Bot\s+/i, "");
}
function resolveDiscordToken(cfg, opts = {}) {
	const accountId = normalizeAccountId(opts.accountId);
	const discordCfg = cfg?.channels?.discord;
	const accountToken = normalizeDiscordToken((accountId !== DEFAULT_ACCOUNT_ID ? discordCfg?.accounts?.[accountId] : discordCfg?.accounts?.[DEFAULT_ACCOUNT_ID])?.token ?? void 0);
	if (accountToken) return {
		token: accountToken,
		source: "config"
	};
	const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
	const configToken = allowEnv ? normalizeDiscordToken(discordCfg?.token ?? void 0) : void 0;
	if (configToken) return {
		token: configToken,
		source: "config"
	};
	const envToken = allowEnv ? normalizeDiscordToken(opts.envToken ?? process.env.DISCORD_BOT_TOKEN) : void 0;
	if (envToken) return {
		token: envToken,
		source: "env"
	};
	return {
		token: "",
		source: "none"
	};
}

//#endregion
//#region src/discord/accounts.ts
function listConfiguredAccountIds$1(cfg) {
	const accounts = cfg.channels?.discord?.accounts;
	if (!accounts || typeof accounts !== "object") return [];
	return Object.keys(accounts).filter(Boolean);
}
function listDiscordAccountIds(cfg) {
	const ids = listConfiguredAccountIds$1(cfg);
	if (ids.length === 0) return [DEFAULT_ACCOUNT_ID];
	return ids.toSorted((a, b) => a.localeCompare(b));
}
function resolveAccountConfig$2(cfg, accountId) {
	const accounts = cfg.channels?.discord?.accounts;
	if (!accounts || typeof accounts !== "object") return;
	return accounts[accountId];
}
function mergeDiscordAccountConfig(cfg, accountId) {
	const { accounts: _ignored, ...base } = cfg.channels?.discord ?? {};
	const account = resolveAccountConfig$2(cfg, accountId) ?? {};
	return {
		...base,
		...account
	};
}
function resolveDiscordAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const baseEnabled = params.cfg.channels?.discord?.enabled !== false;
	const merged = mergeDiscordAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const tokenResolution = resolveDiscordToken(params.cfg, { accountId });
	return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		token: tokenResolution.token,
		tokenSource: tokenResolution.source,
		config: merged
	};
}
function listEnabledDiscordAccounts(cfg) {
	return listDiscordAccountIds(cfg).map((accountId) => resolveDiscordAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}

//#endregion
//#region src/channels/chat-type.ts
function normalizeChatType(raw) {
	const value = raw?.trim().toLowerCase();
	if (!value) return;
	if (value === "direct" || value === "dm") return "direct";
	if (value === "group") return "group";
	if (value === "channel") return "channel";
}

//#endregion
//#region src/slack/token.ts
function normalizeSlackToken(raw) {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : void 0;
}
function resolveSlackBotToken(raw) {
	return normalizeSlackToken(raw);
}
function resolveSlackAppToken(raw) {
	return normalizeSlackToken(raw);
}

//#endregion
//#region src/slack/accounts.ts
function resolveAccountConfig$1(cfg, accountId) {
	const accounts = cfg.channels?.slack?.accounts;
	if (!accounts || typeof accounts !== "object") return;
	return accounts[accountId];
}
function mergeSlackAccountConfig(cfg, accountId) {
	const { accounts: _ignored, ...base } = cfg.channels?.slack ?? {};
	const account = resolveAccountConfig$1(cfg, accountId) ?? {};
	return {
		...base,
		...account
	};
}
function resolveSlackAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const baseEnabled = params.cfg.channels?.slack?.enabled !== false;
	const merged = mergeSlackAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
	const envBot = allowEnv ? resolveSlackBotToken(process.env.SLACK_BOT_TOKEN) : void 0;
	const envApp = allowEnv ? resolveSlackAppToken(process.env.SLACK_APP_TOKEN) : void 0;
	const configBot = resolveSlackBotToken(merged.botToken);
	const configApp = resolveSlackAppToken(merged.appToken);
	const botToken = configBot ?? envBot;
	const appToken = configApp ?? envApp;
	const botTokenSource = configBot ? "config" : envBot ? "env" : "none";
	const appTokenSource = configApp ? "config" : envApp ? "env" : "none";
	return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		botToken,
		appToken,
		botTokenSource,
		appTokenSource,
		config: merged,
		groupPolicy: merged.groupPolicy,
		textChunkLimit: merged.textChunkLimit,
		mediaMaxMb: merged.mediaMaxMb,
		reactionNotifications: merged.reactionNotifications,
		reactionAllowlist: merged.reactionAllowlist,
		replyToMode: merged.replyToMode,
		replyToModeByChatType: merged.replyToModeByChatType,
		actions: merged.actions,
		slashCommand: merged.slashCommand,
		dm: merged.dm,
		channels: merged.channels
	};
}
function resolveSlackReplyToMode(account, chatType) {
	const normalized = normalizeChatType(chatType ?? void 0);
	if (normalized && account.replyToModeByChatType?.[normalized] !== void 0) return account.replyToModeByChatType[normalized] ?? "off";
	if (normalized === "direct" && account.dm?.replyToMode !== void 0) return account.dm.replyToMode;
	return account.replyToMode ?? "off";
}

//#endregion
//#region src/routing/bindings.ts
function normalizeBindingChannelId(raw) {
	const normalized = normalizeChatChannelId(raw);
	if (normalized) return normalized;
	return (raw ?? "").trim().toLowerCase() || null;
}
function listBindings(cfg) {
	return Array.isArray(cfg.bindings) ? cfg.bindings : [];
}
function listBoundAccountIds(cfg, channelId) {
	const normalizedChannel = normalizeBindingChannelId(channelId);
	if (!normalizedChannel) return [];
	const ids = /* @__PURE__ */ new Set();
	for (const binding of listBindings(cfg)) {
		if (!binding || typeof binding !== "object") continue;
		const match = binding.match;
		if (!match || typeof match !== "object") continue;
		const channel = normalizeBindingChannelId(match.channel);
		if (!channel || channel !== normalizedChannel) continue;
		const accountId = typeof match.accountId === "string" ? match.accountId.trim() : "";
		if (!accountId || accountId === "*") continue;
		ids.add(normalizeAccountId(accountId));
	}
	return Array.from(ids).toSorted((a, b) => a.localeCompare(b));
}
function resolveDefaultAgentBoundAccountId(cfg, channelId) {
	const normalizedChannel = normalizeBindingChannelId(channelId);
	if (!normalizedChannel) return null;
	const defaultAgentId = normalizeAgentId(resolveDefaultAgentId(cfg));
	for (const binding of listBindings(cfg)) {
		if (!binding || typeof binding !== "object") continue;
		if (normalizeAgentId(binding.agentId) !== defaultAgentId) continue;
		const match = binding.match;
		if (!match || typeof match !== "object") continue;
		const channel = normalizeBindingChannelId(match.channel);
		if (!channel || channel !== normalizedChannel) continue;
		const accountId = typeof match.accountId === "string" ? match.accountId.trim() : "";
		if (!accountId || accountId === "*") continue;
		return normalizeAccountId(accountId);
	}
	return null;
}
function buildChannelAccountBindings(cfg) {
	const map = /* @__PURE__ */ new Map();
	for (const binding of listBindings(cfg)) {
		if (!binding || typeof binding !== "object") continue;
		const match = binding.match;
		if (!match || typeof match !== "object") continue;
		const channelId = normalizeBindingChannelId(match.channel);
		if (!channelId) continue;
		const accountId = typeof match.accountId === "string" ? match.accountId.trim() : "";
		if (!accountId || accountId === "*") continue;
		const agentId = normalizeAgentId(binding.agentId);
		const byAgent = map.get(channelId) ?? /* @__PURE__ */ new Map();
		const list = byAgent.get(agentId) ?? [];
		const normalizedAccountId = normalizeAccountId(accountId);
		if (!list.includes(normalizedAccountId)) list.push(normalizedAccountId);
		byAgent.set(agentId, list);
		map.set(channelId, byAgent);
	}
	return map;
}
function resolvePreferredAccountId(params) {
	if (params.boundAccounts.length > 0) return params.boundAccounts[0];
	return params.defaultAccountId;
}

//#endregion
//#region src/telegram/token.ts
function resolveTelegramToken(cfg, opts = {}) {
	const accountId = normalizeAccountId(opts.accountId);
	const telegramCfg = cfg?.channels?.telegram;
	const resolveAccountCfg = (id) => {
		const accounts = telegramCfg?.accounts;
		if (!accounts || typeof accounts !== "object" || Array.isArray(accounts)) return;
		const direct = accounts[id];
		if (direct) return direct;
		const matchKey = Object.keys(accounts).find((key) => normalizeAccountId(key) === id);
		return matchKey ? accounts[matchKey] : void 0;
	};
	const accountCfg = resolveAccountCfg(accountId !== DEFAULT_ACCOUNT_ID ? accountId : DEFAULT_ACCOUNT_ID);
	const accountTokenFile = accountCfg?.tokenFile?.trim();
	if (accountTokenFile) {
		if (!fs.existsSync(accountTokenFile)) {
			opts.logMissingFile?.(`channels.telegram.accounts.${accountId}.tokenFile not found: ${accountTokenFile}`);
			return {
				token: "",
				source: "none"
			};
		}
		try {
			const token = fs.readFileSync(accountTokenFile, "utf-8").trim();
			if (token) return {
				token,
				source: "tokenFile"
			};
		} catch (err) {
			opts.logMissingFile?.(`channels.telegram.accounts.${accountId}.tokenFile read failed: ${String(err)}`);
			return {
				token: "",
				source: "none"
			};
		}
		return {
			token: "",
			source: "none"
		};
	}
	const accountToken = accountCfg?.botToken?.trim();
	if (accountToken) return {
		token: accountToken,
		source: "config"
	};
	const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
	const tokenFile = telegramCfg?.tokenFile?.trim();
	if (tokenFile && allowEnv) {
		if (!fs.existsSync(tokenFile)) {
			opts.logMissingFile?.(`channels.telegram.tokenFile not found: ${tokenFile}`);
			return {
				token: "",
				source: "none"
			};
		}
		try {
			const token = fs.readFileSync(tokenFile, "utf-8").trim();
			if (token) return {
				token,
				source: "tokenFile"
			};
		} catch (err) {
			opts.logMissingFile?.(`channels.telegram.tokenFile read failed: ${String(err)}`);
			return {
				token: "",
				source: "none"
			};
		}
	}
	const configToken = telegramCfg?.botToken?.trim();
	if (configToken && allowEnv) return {
		token: configToken,
		source: "config"
	};
	const envToken = allowEnv ? (opts.envToken ?? process.env.TELEGRAM_BOT_TOKEN)?.trim() : "";
	if (envToken) return {
		token: envToken,
		source: "env"
	};
	return {
		token: "",
		source: "none"
	};
}

//#endregion
//#region src/telegram/accounts.ts
const debugAccounts = (...args) => {
	if (isTruthyEnvValue(process.env.OPENCLAW_DEBUG_TELEGRAM_ACCOUNTS)) console.warn("[telegram:accounts]", ...args);
};
function listConfiguredAccountIds(cfg) {
	const accounts = cfg.channels?.telegram?.accounts;
	if (!accounts || typeof accounts !== "object") return [];
	const ids = /* @__PURE__ */ new Set();
	for (const key of Object.keys(accounts)) {
		if (!key) continue;
		ids.add(normalizeAccountId(key));
	}
	return [...ids];
}
function listTelegramAccountIds(cfg) {
	const ids = Array.from(new Set([...listConfiguredAccountIds(cfg), ...listBoundAccountIds(cfg, "telegram")]));
	debugAccounts("listTelegramAccountIds", ids);
	if (ids.length === 0) return [DEFAULT_ACCOUNT_ID];
	return ids.toSorted((a, b) => a.localeCompare(b));
}
function resolveDefaultTelegramAccountId(cfg) {
	const boundDefault = resolveDefaultAgentBoundAccountId(cfg, "telegram");
	if (boundDefault) return boundDefault;
	const ids = listTelegramAccountIds(cfg);
	if (ids.includes(DEFAULT_ACCOUNT_ID)) return DEFAULT_ACCOUNT_ID;
	return ids[0] ?? DEFAULT_ACCOUNT_ID;
}
function resolveAccountConfig(cfg, accountId) {
	const accounts = cfg.channels?.telegram?.accounts;
	if (!accounts || typeof accounts !== "object") return;
	const direct = accounts[accountId];
	if (direct) return direct;
	const normalized = normalizeAccountId(accountId);
	const matchKey = Object.keys(accounts).find((key) => normalizeAccountId(key) === normalized);
	return matchKey ? accounts[matchKey] : void 0;
}
function mergeTelegramAccountConfig(cfg, accountId) {
	const { accounts: _ignored, ...base } = cfg.channels?.telegram ?? {};
	const account = resolveAccountConfig(cfg, accountId) ?? {};
	return {
		...base,
		...account
	};
}
function resolveTelegramAccount(params) {
	const hasExplicitAccountId = Boolean(params.accountId?.trim());
	const baseEnabled = params.cfg.channels?.telegram?.enabled !== false;
	const resolve = (accountId) => {
		const merged = mergeTelegramAccountConfig(params.cfg, accountId);
		const accountEnabled = merged.enabled !== false;
		const enabled = baseEnabled && accountEnabled;
		const tokenResolution = resolveTelegramToken(params.cfg, { accountId });
		debugAccounts("resolve", {
			accountId,
			enabled,
			tokenSource: tokenResolution.source
		});
		return {
			accountId,
			enabled,
			name: merged.name?.trim() || void 0,
			token: tokenResolution.token,
			tokenSource: tokenResolution.source,
			config: merged
		};
	};
	const primary = resolve(normalizeAccountId(params.accountId));
	if (hasExplicitAccountId) return primary;
	if (primary.tokenSource !== "none") return primary;
	const fallbackId = resolveDefaultTelegramAccountId(params.cfg);
	if (fallbackId === primary.accountId) return primary;
	const fallback = resolve(fallbackId);
	if (fallback.tokenSource === "none") return primary;
	return fallback;
}
function listEnabledTelegramAccounts(cfg) {
	return listTelegramAccountIds(cfg).map((accountId) => resolveTelegramAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}

//#endregion
//#region src/whatsapp/normalize.ts
const WHATSAPP_USER_JID_RE = /^(\d+)(?::\d+)?@s\.whatsapp\.net$/i;
const WHATSAPP_LID_RE = /^(\d+)@lid$/i;
function stripWhatsAppTargetPrefixes(value) {
	let candidate = value.trim();
	for (;;) {
		const before = candidate;
		candidate = candidate.replace(/^whatsapp:/i, "").trim();
		if (candidate === before) return candidate;
	}
}
function isWhatsAppGroupJid(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!candidate.toLowerCase().endsWith("@g.us")) return false;
	const localPart = candidate.slice(0, candidate.length - 5);
	if (!localPart || localPart.includes("@")) return false;
	return /^[0-9]+(-[0-9]+)*$/.test(localPart);
}
/**
* Check if value looks like a WhatsApp user target (e.g. "41796666864:0@s.whatsapp.net" or "123@lid").
*/
function isWhatsAppUserTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	return WHATSAPP_USER_JID_RE.test(candidate) || WHATSAPP_LID_RE.test(candidate);
}
/**
* Extract the phone number from a WhatsApp user JID.
* "41796666864:0@s.whatsapp.net" -> "41796666864"
* "123456@lid" -> "123456"
*/
function extractUserJidPhone(jid) {
	const userMatch = jid.match(WHATSAPP_USER_JID_RE);
	if (userMatch) return userMatch[1];
	const lidMatch = jid.match(WHATSAPP_LID_RE);
	if (lidMatch) return lidMatch[1];
	return null;
}
function normalizeWhatsAppTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!candidate) return null;
	if (isWhatsAppGroupJid(candidate)) return `${candidate.slice(0, candidate.length - 5)}@g.us`;
	if (isWhatsAppUserTarget(candidate)) {
		const phone = extractUserJidPhone(candidate);
		if (!phone) return null;
		const normalized = normalizeE164(phone);
		return normalized.length > 1 ? normalized : null;
	}
	if (candidate.includes("@")) return null;
	const normalized = normalizeE164(candidate);
	return normalized.length > 1 ? normalized : null;
}

//#endregion
//#region src/channels/plugins/index.ts
function listPluginChannels() {
	return requireActivePluginRegistry().channels.map((entry) => entry.plugin);
}
function dedupeChannels(channels) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const plugin of channels) {
		const id = String(plugin.id).trim();
		if (!id || seen.has(id)) continue;
		seen.add(id);
		resolved.push(plugin);
	}
	return resolved;
}
function listChannelPlugins() {
	return dedupeChannels(listPluginChannels()).toSorted((a, b) => {
		const indexA = CHAT_CHANNEL_ORDER.indexOf(a.id);
		const indexB = CHAT_CHANNEL_ORDER.indexOf(b.id);
		const orderA = a.meta.order ?? (indexA === -1 ? 999 : indexA);
		const orderB = b.meta.order ?? (indexB === -1 ? 999 : indexB);
		if (orderA !== orderB) return orderA - orderB;
		return a.id.localeCompare(b.id);
	});
}
function getChannelPlugin(id) {
	const resolvedId = String(id).trim();
	if (!resolvedId) return;
	return listChannelPlugins().find((plugin) => plugin.id === resolvedId);
}
function normalizeChannelId(raw) {
	return normalizeAnyChannelId(raw);
}

//#endregion
export { normalizeChatType as _, normalizeWhatsAppTarget as a, normalizeDiscordToken as b, resolveTelegramAccount as c, listBindings as d, resolvePreferredAccountId as f, resolveSlackBotToken as g, resolveSlackAppToken as h, isWhatsAppGroupJid as i, resolveTelegramToken as l, resolveSlackReplyToMode as m, listChannelPlugins as n, listEnabledTelegramAccounts as o, resolveSlackAccount as p, normalizeChannelId as r, listTelegramAccountIds as s, getChannelPlugin as t, buildChannelAccountBindings as u, listEnabledDiscordAccounts as v, resolveDiscordAccount as y };