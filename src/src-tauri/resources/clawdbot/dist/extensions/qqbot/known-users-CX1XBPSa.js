import { et as getHomeDir, it as isWindows, lt as debugError, tt as getQQBotDataDir, ut as debugLog } from "./outbound-Nkg_Sn0w.js";
import { t as getQQBotRuntime } from "./runtime-B2Qn21pE.js";
import { createRequire } from "node:module";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString, normalizeStringifiedOptionalString } from "openclaw/plugin-sdk/text-runtime";
import fs from "node:fs";
import path from "node:path";
import { applyAccountNameToChannelSection, deleteAccountFromConfigSection, setAccountEnabledInConfigSection } from "openclaw/plugin-sdk/core";
import { hasConfiguredSecretInput, normalizeResolvedSecretInputString, normalizeSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { resolveRuntimeServiceVersion } from "openclaw/plugin-sdk/cli-runtime";
//#region extensions/qqbot/src/config.ts
const DEFAULT_ACCOUNT_ID = "default";
function normalizeConfiguredDefaultAccountId(raw) {
	return normalizeOptionalLowercaseString(raw) ?? null;
}
function normalizeQQBotAccountConfig(account) {
	if (!account) return {};
	return {
		...account,
		...account.audioFormatPolicy ? { audioFormatPolicy: { ...account.audioFormatPolicy } } : {}
	};
}
function normalizeAppId(raw) {
	if (typeof raw === "string") return raw.trim();
	if (typeof raw === "number") return String(raw);
	return "";
}
/** List all configured QQBot account IDs. */
function listQQBotAccountIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const qqbot = cfg.channels?.qqbot;
	if (qqbot?.appId || process.env.QQBOT_APP_ID) ids.add(DEFAULT_ACCOUNT_ID);
	if (qqbot?.accounts) {
		for (const accountId of Object.keys(qqbot.accounts)) if (qqbot.accounts[accountId]?.appId) ids.add(accountId);
	}
	return Array.from(ids);
}
/** Resolve the default QQBot account ID. */
function resolveDefaultQQBotAccountId(cfg) {
	const qqbot = cfg.channels?.qqbot;
	const configuredDefaultAccountId = normalizeConfiguredDefaultAccountId(qqbot?.defaultAccount);
	if (configuredDefaultAccountId && (configuredDefaultAccountId === "default" || Boolean(qqbot?.accounts?.[configuredDefaultAccountId]?.appId))) return configuredDefaultAccountId;
	if (qqbot?.appId || process.env.QQBOT_APP_ID) return DEFAULT_ACCOUNT_ID;
	if (qqbot?.accounts) {
		const ids = Object.keys(qqbot.accounts);
		if (ids.length > 0) return ids[0];
	}
	return DEFAULT_ACCOUNT_ID;
}
/** Resolve QQBot account config for runtime or setup flows. */
function resolveQQBotAccount(cfg, accountId, opts) {
	const resolvedAccountId = accountId ?? resolveDefaultQQBotAccountId(cfg);
	const qqbot = cfg.channels?.qqbot;
	let accountConfig = {};
	let appId = "";
	let clientSecret = "";
	let secretSource = "none";
	if (resolvedAccountId === "default") {
		accountConfig = normalizeQQBotAccountConfig(qqbot);
		appId = normalizeAppId(qqbot?.appId);
	} else {
		const account = qqbot?.accounts?.[resolvedAccountId];
		accountConfig = normalizeQQBotAccountConfig(account);
		appId = normalizeAppId(account?.appId);
	}
	const clientSecretPath = resolvedAccountId === "default" ? "channels.qqbot.clientSecret" : `channels.qqbot.accounts.${resolvedAccountId}.clientSecret`;
	if (hasConfiguredSecretInput(accountConfig.clientSecret)) {
		clientSecret = opts?.allowUnresolvedSecretRef ? normalizeSecretInputString(accountConfig.clientSecret) ?? "" : normalizeResolvedSecretInputString({
			value: accountConfig.clientSecret,
			path: clientSecretPath
		}) ?? "";
		secretSource = "config";
	} else if (accountConfig.clientSecretFile) try {
		clientSecret = fs.readFileSync(accountConfig.clientSecretFile, "utf8").trim();
		secretSource = "file";
	} catch {
		secretSource = "none";
	}
	else if (process.env.QQBOT_CLIENT_SECRET && resolvedAccountId === "default") {
		clientSecret = process.env.QQBOT_CLIENT_SECRET;
		secretSource = "env";
	}
	if (!appId && process.env.QQBOT_APP_ID && resolvedAccountId === "default") appId = normalizeAppId(process.env.QQBOT_APP_ID);
	return {
		accountId: resolvedAccountId,
		name: accountConfig.name,
		enabled: accountConfig.enabled !== false,
		appId,
		clientSecret,
		secretSource,
		systemPrompt: accountConfig.systemPrompt,
		markdownSupport: accountConfig.markdownSupport !== false,
		config: accountConfig
	};
}
/** Apply account config updates back into the OpenClaw config object. */
function applyQQBotAccountConfig(cfg, accountId, input) {
	const next = { ...cfg };
	if (accountId === "default") {
		const allowFrom = (next.channels?.qqbot || {}).allowFrom ?? ["*"];
		next.channels = {
			...next.channels,
			qqbot: {
				...next.channels?.qqbot,
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
		const allowFrom = ((next.channels?.qqbot)?.accounts?.[accountId] || {}).allowFrom ?? ["*"];
		next.channels = {
			...next.channels,
			qqbot: {
				...next.channels?.qqbot,
				enabled: true,
				accounts: {
					...(next.channels?.qqbot)?.accounts,
					[accountId]: {
						...(next.channels?.qqbot)?.accounts?.[accountId],
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
//#endregion
//#region extensions/qqbot/src/channel-config-shared.ts
const qqbotMeta = {
	id: "qqbot",
	label: "QQ Bot",
	selectionLabel: "QQ Bot",
	docsPath: "/channels/qqbot",
	blurb: "Connect to QQ via official QQ Bot API",
	order: 50
};
function parseQQBotInlineToken(token) {
	const colonIdx = token.indexOf(":");
	if (colonIdx <= 0 || colonIdx === token.length - 1) return null;
	const appId = token.slice(0, colonIdx).trim();
	const clientSecret = token.slice(colonIdx + 1).trim();
	if (!appId || !clientSecret) return null;
	return {
		appId,
		clientSecret
	};
}
function validateQQBotSetupInput(params) {
	const { accountId, input } = params;
	if (!input.token && !input.tokenFile && !input.useEnv) return "QQBot requires --token (format: appId:clientSecret) or --use-env";
	if (input.useEnv && accountId !== "default") return "QQBot --use-env only supports the default account";
	if (input.token && !parseQQBotInlineToken(input.token)) return "QQBot --token must be in appId:clientSecret format";
	return null;
}
function applyQQBotSetupAccountConfig(params) {
	if (params.input.useEnv && params.accountId !== "default") return params.cfg;
	let appId = "";
	let clientSecret = "";
	if (params.input.token) {
		const parsed = parseQQBotInlineToken(params.input.token);
		if (!parsed) return params.cfg;
		appId = parsed.appId;
		clientSecret = parsed.clientSecret;
	}
	if (!appId && !params.input.tokenFile && !params.input.useEnv) return params.cfg;
	return applyQQBotAccountConfig(params.cfg, params.accountId, {
		appId,
		clientSecret,
		clientSecretFile: params.input.tokenFile,
		name: params.input.name
	});
}
function isQQBotConfigured(account) {
	return Boolean(account?.appId && (Boolean(account?.clientSecret) || hasConfiguredSecretInput(account?.config?.clientSecret) || Boolean(account?.config?.clientSecretFile?.trim())));
}
function describeQQBotAccount(account) {
	return {
		accountId: account?.accountId ?? "default",
		name: account?.name,
		enabled: account?.enabled ?? false,
		configured: isQQBotConfigured(account),
		tokenSource: account?.secretSource
	};
}
function formatQQBotAllowFrom(params) {
	return (params.allowFrom ?? []).map((entry) => normalizeStringifiedOptionalString(entry)).filter((entry) => Boolean(entry)).map((entry) => entry.replace(/^qqbot:/i, "")).map((entry) => entry.toUpperCase());
}
const qqbotConfigAdapter = {
	listAccountIds: (cfg) => listQQBotAccountIds(cfg),
	resolveAccount: (cfg, accountId) => resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true }),
	defaultAccountId: (cfg) => resolveDefaultQQBotAccountId(cfg),
	setAccountEnabled: ({ cfg, accountId, enabled }) => setAccountEnabledInConfigSection({
		cfg,
		sectionKey: "qqbot",
		accountId,
		enabled,
		allowTopLevel: true
	}),
	deleteAccount: ({ cfg, accountId }) => deleteAccountFromConfigSection({
		cfg,
		sectionKey: "qqbot",
		accountId,
		clearBaseFields: [
			"appId",
			"clientSecret",
			"clientSecretFile",
			"name"
		]
	}),
	isConfigured: isQQBotConfigured,
	describeAccount: describeQQBotAccount,
	resolveAllowFrom: ({ cfg, accountId }) => resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true }).config?.allowFrom,
	formatAllowFrom: ({ allowFrom }) => formatQQBotAllowFrom({ allowFrom })
};
const qqbotSetupAdapterShared = {
	resolveAccountId: ({ cfg, accountId }) => normalizeLowercaseStringOrEmpty(accountId) || resolveDefaultQQBotAccountId(cfg),
	applyAccountName: ({ cfg, accountId, name }) => applyAccountNameToChannelSection({
		cfg,
		channelKey: "qqbot",
		accountId,
		name
	}),
	validateInput: ({ accountId, input }) => validateQQBotSetupInput({
		accountId,
		input
	}),
	applyAccountConfig: ({ cfg, accountId, input }) => applyQQBotSetupAccountConfig({
		cfg,
		accountId,
		input
	})
};
//#endregion
//#region extensions/qqbot/src/text-utils.ts
/** Maximum text length for a single QQ Bot message. */
const TEXT_CHUNK_LIMIT = 5e3;
/**
* Markdown-aware text chunking.
*
* Delegates to the SDK chunker so code fences and bracket balance stay intact.
*/
function chunkText(text, limit) {
	return getQQBotRuntime().channel.text.chunkMarkdownText(text, limit);
}
//#endregion
//#region extensions/qqbot/src/slash-commands.ts
/**
* QQBot plugin-level slash command handler.
*
* Design goals:
* 1. Intercept plugin commands before messages enter the AI queue.
* 2. Let unmatched "/" messages continue through the normal framework path.
* 3. Keep command registration small and explicit.
*/
const require = createRequire(import.meta.url);
const PACKAGE_JSON_CANDIDATES = [
	"../package.json",
	"./package.json",
	"../../package.json"
];
function readPluginVersion() {
	for (const candidate of PACKAGE_JSON_CANDIDATES) try {
		const version = require(candidate).version;
		if (typeof version === "string" && version.trim().length > 0) return version;
	} catch {}
	return "unknown";
}
readPluginVersion();
const QQBOT_PLUGIN_GITHUB_URL = "https://github.com/openclaw/openclaw/tree/main/extensions/qqbot";
const QQBOT_UPGRADE_GUIDE_URL = "https://q.qq.com/qqbot/openclaw/upgrade.html";
function normalizeCommandAllowlistEntry(entry) {
	if (typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean" || typeof entry === "bigint") return `${entry}`.trim().replace(/^qqbot:\s*/i, "").trim();
	return "";
}
function hasExplicitCommandAllowlist(accountConfig) {
	const allowFrom = accountConfig?.allowFrom;
	if (!Array.isArray(allowFrom) || allowFrom.length === 0) return false;
	return allowFrom.every((entry) => {
		const normalized = normalizeCommandAllowlistEntry(entry);
		return normalized.length > 0 && normalized !== "*";
	});
}
const commands = /* @__PURE__ */ new Map();
const frameworkCommands = /* @__PURE__ */ new Map();
function registerCommand(cmd) {
	if (cmd.requireAuth) frameworkCommands.set(normalizeLowercaseStringOrEmpty(cmd.name), cmd);
	else commands.set(normalizeLowercaseStringOrEmpty(cmd.name), cmd);
}
/**
* Return all commands that require authorization, for registration with the
* framework via api.registerCommand() in registerFull().
*/
function getFrameworkCommands() {
	return Array.from(frameworkCommands.values()).map((cmd) => ({
		name: cmd.name,
		description: cmd.description,
		usage: cmd.usage,
		handler: cmd.handler
	}));
}
/**
* /bot-ping — test current network latency between OpenClaw and QQ.
*/
registerCommand({
	name: "bot-ping",
	description: "测试 OpenClaw 与 QQ 之间的网络延迟",
	usage: [
		`/bot-ping`,
		``,
		`测试当前 OpenClaw 宿主机与 QQ 服务器之间的网络延迟。`,
		`返回网络传输耗时和插件处理耗时。`
	].join("\n"),
	handler: (ctx) => {
		const now = Date.now();
		const eventTime = new Date(ctx.eventTimestamp).getTime();
		if (isNaN(eventTime)) return `✅ pong!`;
		const totalMs = now - eventTime;
		const qqToPlugin = ctx.receivedAt - eventTime;
		const pluginProcess = now - ctx.receivedAt;
		return [
			`✅ pong!`,
			``,
			`⏱ 延迟：${totalMs}ms`,
			`  ├ 网络传输：${qqToPlugin}ms`,
			`  └ 插件处理：${pluginProcess}ms`
		].join("\n");
	}
});
/**
* /bot-version — show the OpenClaw framework version.
*/
registerCommand({
	name: "bot-version",
	description: "查看 OpenClaw 框架版本",
	usage: [
		`/bot-version`,
		``,
		`查看当前 OpenClaw 框架版本。`
	].join("\n"),
	handler: async () => {
		const lines = [`🦞 OpenClaw 版本：${resolveRuntimeServiceVersion()}`];
		lines.push(`🌟 官方 GitHub 仓库：[点击前往](${QQBOT_PLUGIN_GITHUB_URL})`);
		return lines.join("\n");
	}
});
/**
* /bot-upgrade — show the upgrade guide.
*/
registerCommand({
	name: "bot-upgrade",
	description: "查看 QQBot 升级指引",
	usage: [
		`/bot-upgrade`,
		``,
		`查看 QQBot 升级说明。`
	].join("\n"),
	handler: () => [`📘 QQBot 升级指引：`, `[点击查看升级说明](${QQBOT_UPGRADE_GUIDE_URL})`].join("\n")
});
/**
* /bot-help — list all built-in QQBot commands.
*/
registerCommand({
	name: "bot-help",
	description: "查看所有内置命令",
	usage: [
		`/bot-help`,
		``,
		`查看所有可用的 QQBot 内置命令及其简要说明。`,
		`在命令后追加 ? 可查看详细用法。`
	].join("\n"),
	handler: () => {
		const lines = [`### QQBot 内置命令`, ``];
		for (const [name, cmd] of commands) lines.push(`<qqbot-cmd-input text="/${name}" show="/${name}"/> ${cmd.description}`);
		for (const [name, cmd] of frameworkCommands) lines.push(`<qqbot-cmd-input text="/${name}" show="/${name}"/> ${cmd.description}`);
		return lines.join("\n");
	}
});
/** Read user-configured log file paths from local config files. */
function getConfiguredLogFiles() {
	const homeDir = getHomeDir();
	const files = [];
	for (const cli of [
		"openclaw",
		"clawdbot",
		"moltbot"
	]) try {
		const cfgPath = path.join(homeDir, `.${cli}`, `${cli}.json`);
		if (!fs.existsSync(cfgPath)) continue;
		const logFile = JSON.parse(fs.readFileSync(cfgPath, "utf8"))?.logging?.file;
		if (logFile && typeof logFile === "string") files.push(path.resolve(logFile));
		break;
	} catch {}
	return files;
}
/** Collect directories that may contain runtime logs across common install layouts. */
function collectCandidateLogDirs() {
	const homeDir = getHomeDir();
	const dirs = /* @__PURE__ */ new Set();
	const pushDir = (p) => {
		if (!p) return;
		const normalized = path.resolve(p);
		dirs.add(normalized);
	};
	const pushStateDir = (stateDir) => {
		if (!stateDir) return;
		pushDir(stateDir);
		pushDir(path.join(stateDir, "logs"));
	};
	for (const logFile of getConfiguredLogFiles()) pushDir(path.dirname(logFile));
	for (const [key, value] of Object.entries(process.env)) {
		if (!value) continue;
		if (/STATE_DIR$/i.test(key) && /(OPENCLAW|CLAWDBOT|MOLTBOT)/i.test(key)) pushStateDir(value);
	}
	for (const name of [
		".openclaw",
		".clawdbot",
		".moltbot",
		"openclaw",
		"clawdbot",
		"moltbot"
	]) {
		pushDir(path.join(homeDir, name));
		pushDir(path.join(homeDir, name, "logs"));
	}
	const searchRoots = new Set([
		homeDir,
		process.cwd(),
		path.dirname(process.cwd())
	]);
	if (process.env.APPDATA) searchRoots.add(process.env.APPDATA);
	if (process.env.LOCALAPPDATA) searchRoots.add(process.env.LOCALAPPDATA);
	for (const root of searchRoots) try {
		const entries = fs.readdirSync(root, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			if (!/(openclaw|clawdbot|moltbot)/i.test(entry.name)) continue;
			const base = path.join(root, entry.name);
			pushDir(base);
			pushDir(path.join(base, "logs"));
		}
	} catch {}
	if (!isWindows()) for (const name of [
		"openclaw",
		"clawdbot",
		"moltbot"
	]) pushDir(path.join("/var/log", name));
	const tmpRoots = /* @__PURE__ */ new Set();
	if (isWindows()) {
		tmpRoots.add("C:\\tmp");
		if (process.env.TEMP) tmpRoots.add(process.env.TEMP);
		if (process.env.TMP) tmpRoots.add(process.env.TMP);
		if (process.env.LOCALAPPDATA) tmpRoots.add(path.join(process.env.LOCALAPPDATA, "Temp"));
	} else tmpRoots.add("/tmp");
	for (const tmpRoot of tmpRoots) for (const name of [
		"openclaw",
		"clawdbot",
		"moltbot"
	]) pushDir(path.join(tmpRoot, name));
	return Array.from(dirs);
}
function collectRecentLogFiles(logDirs) {
	const candidates = [];
	const dedupe = /* @__PURE__ */ new Set();
	const pushFile = (filePath, sourceDir) => {
		const normalized = path.resolve(filePath);
		if (dedupe.has(normalized)) return;
		try {
			const stat = fs.statSync(normalized);
			if (!stat.isFile()) return;
			dedupe.add(normalized);
			candidates.push({
				filePath: normalized,
				sourceDir,
				mtimeMs: stat.mtimeMs
			});
		} catch {}
	};
	for (const logFile of getConfiguredLogFiles()) pushFile(logFile, path.dirname(logFile));
	for (const dir of logDirs) {
		pushFile(path.join(dir, "gateway.log"), dir);
		pushFile(path.join(dir, "gateway.err.log"), dir);
		pushFile(path.join(dir, "openclaw.log"), dir);
		pushFile(path.join(dir, "clawdbot.log"), dir);
		pushFile(path.join(dir, "moltbot.log"), dir);
		try {
			const entries = fs.readdirSync(dir, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isFile()) continue;
				if (!/\.(log|txt)$/i.test(entry.name)) continue;
				if (!/(gateway|openclaw|clawdbot|moltbot)/i.test(entry.name)) continue;
				pushFile(path.join(dir, entry.name), dir);
			}
		} catch {}
	}
	candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
	return candidates;
}
/**
* Read the last N lines of a file without loading the entire file into memory.
* Uses a reverse-read strategy: reads fixed-size chunks from the end of the
* file until the requested number of newline characters are found.
*
* Also estimates the total line count from the file size and the average bytes
* per line observed in the tail portion (exact count is not feasible for
* multi-GB files without a full scan).
*/
function tailFileLines(filePath, maxLines) {
	const fd = fs.openSync(filePath, "r");
	try {
		const fileSize = fs.fstatSync(fd).size;
		if (fileSize === 0) return {
			tail: [],
			totalFileLines: 0
		};
		const CHUNK_SIZE = 64 * 1024;
		const chunks = [];
		let bytesRead = 0;
		let position = fileSize;
		let newlineCount = 0;
		while (position > 0 && newlineCount <= maxLines) {
			const readSize = Math.min(CHUNK_SIZE, position);
			position -= readSize;
			const buf = Buffer.alloc(readSize);
			fs.readSync(fd, buf, 0, readSize, position);
			chunks.unshift(buf);
			bytesRead += readSize;
			for (let i = 0; i < readSize; i++) if (buf[i] === 10) newlineCount++;
		}
		const allLines = Buffer.concat(chunks).toString("utf8").split("\n");
		const tail = allLines.slice(-maxLines);
		let totalFileLines;
		if (bytesRead >= fileSize) totalFileLines = allLines.length;
		else {
			const avgBytesPerLine = bytesRead / Math.max(allLines.length, 1);
			totalFileLines = Math.round(fileSize / avgBytesPerLine);
		}
		return {
			tail,
			totalFileLines
		};
	} finally {
		fs.closeSync(fd);
	}
}
/**
* Build the /bot-logs result: collect recent log files, write them to a temp
* file, and return the summary text plus the temp file path.
*
* Authorization is enforced upstream by the framework (registerCommand with
* requireAuth:true); this function contains no auth logic.
*
* Returns a SlashCommandFileResult on success (text + filePath), or a plain
* string error message when no logs are found or files cannot be read.
*/
function buildBotLogsResult() {
	const logDirs = collectCandidateLogDirs();
	const recentFiles = collectRecentLogFiles(logDirs).slice(0, 4);
	if (recentFiles.length === 0) {
		const existingDirs = logDirs.filter((d) => {
			try {
				return fs.existsSync(d);
			} catch {
				return false;
			}
		});
		const searched = existingDirs.length > 0 ? existingDirs.map((d) => `  • ${d}`).join("\n") : logDirs.slice(0, 6).map((d) => `  • ${d}`).join("\n") + (logDirs.length > 6 ? `\n  …以及另外 ${logDirs.length - 6} 个路径` : "");
		return [
			`⚠️ 未找到日志文件`,
			``,
			`已搜索以下${existingDirs.length > 0 ? "存在的" : ""}路径：`,
			searched,
			``,
			`💡 如果日志存放在自定义路径，请在配置中添加：`,
			`  "logging": { "file": "/path/to/your/logfile.log" }`
		].join("\n");
	}
	const lines = [];
	let totalIncluded = 0;
	let totalOriginal = 0;
	let truncatedCount = 0;
	const MAX_LINES_PER_FILE = 1e3;
	for (const logFile of recentFiles) try {
		const { tail, totalFileLines } = tailFileLines(logFile.filePath, MAX_LINES_PER_FILE);
		if (tail.length > 0) {
			const fileName = path.basename(logFile.filePath);
			lines.push(`\n========== ${fileName} (last ${tail.length} of ${totalFileLines} lines) ==========`);
			lines.push(`from: ${logFile.sourceDir}`);
			lines.push(...tail);
			totalIncluded += tail.length;
			totalOriginal += totalFileLines;
			if (totalFileLines > MAX_LINES_PER_FILE) truncatedCount++;
		}
	} catch {
		lines.push(`[Failed to read ${path.basename(logFile.filePath)}]`);
	}
	if (lines.length === 0) return `⚠️ 找到了日志文件，但无法读取。请检查文件权限。`;
	const tmpDir = getQQBotDataDir("downloads");
	const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
	const tmpFile = path.join(tmpDir, `bot-logs-${timestamp}.txt`);
	fs.writeFileSync(tmpFile, lines.join("\n"), "utf8");
	const fileCount = recentFiles.length;
	const topSources = Array.from(new Set(recentFiles.map((item) => item.sourceDir))).slice(0, 3);
	let summaryText = `共 ${fileCount} 个日志文件，包含 ${totalIncluded} 行内容`;
	if (truncatedCount > 0) summaryText += `（其中 ${truncatedCount} 个文件已截断为最后 ${MAX_LINES_PER_FILE} 行，总计原始 ${totalOriginal} 行）`;
	return {
		text: `📋 ${summaryText}\n📂 来源：${topSources.join(" | ")}`,
		filePath: tmpFile
	};
}
registerCommand({
	name: "bot-logs",
	description: "导出本地日志文件",
	requireAuth: true,
	usage: [
		`/bot-logs`,
		``,
		`导出最近的 OpenClaw 日志文件（最多 4 个文件）。`,
		`每个文件只保留最后 1000 行，并作为附件返回。`
	].join("\n"),
	handler: (ctx) => {
		if (!hasExplicitCommandAllowlist(ctx.accountConfig)) return `⛔ 权限不足：请先在 channels.qqbot.allowFrom（或对应账号 allowFrom）中配置明确的发送者列表后再使用 /bot-logs。`;
		return buildBotLogsResult();
	}
});
/**
* Try to match and execute a plugin-level slash command.
*
* @returns A reply when matched, or null when the message should continue through normal routing.
*/
async function matchSlashCommand(ctx) {
	const content = ctx.rawContent.trim();
	if (!content.startsWith("/")) return null;
	const spaceIdx = content.indexOf(" ");
	const cmdName = normalizeLowercaseStringOrEmpty(spaceIdx === -1 ? content.slice(1) : content.slice(1, spaceIdx));
	const args = spaceIdx === -1 ? "" : content.slice(spaceIdx + 1).trim();
	const cmd = commands.get(cmdName);
	if (!cmd) return null;
	if (cmd.requireAuth && !ctx.commandAuthorized) {
		debugLog(`[qqbot] Slash command /${cmd.name} rejected: sender ${ctx.senderId} is not authorized`);
		return `⛔ 权限不足：/${cmd.name} 需要管理员权限。`;
	}
	if (args === "?") {
		if (cmd.usage) return `📖 /${cmd.name} 用法：\n\n${cmd.usage}`;
		return `/${cmd.name} - ${cmd.description}`;
	}
	ctx.args = args;
	return await cmd.handler(ctx);
}
//#endregion
//#region extensions/qqbot/src/known-users.ts
const KNOWN_USERS_DIR = getQQBotDataDir("data");
const KNOWN_USERS_FILE = path.join(KNOWN_USERS_DIR, "known-users.json");
let usersCache = null;
const SAVE_THROTTLE_MS = 5e3;
let saveTimer = null;
let isDirty = false;
/** Ensure the data directory exists. */
function ensureDir() {
	if (!fs.existsSync(KNOWN_USERS_DIR)) fs.mkdirSync(KNOWN_USERS_DIR, { recursive: true });
}
/** Load persisted users into the in-memory cache. */
function loadUsersFromFile() {
	if (usersCache !== null) return usersCache;
	usersCache = /* @__PURE__ */ new Map();
	try {
		if (fs.existsSync(KNOWN_USERS_FILE)) {
			const data = fs.readFileSync(KNOWN_USERS_FILE, "utf-8");
			const users = JSON.parse(data);
			for (const user of users) {
				const key = makeUserKey(user);
				usersCache.set(key, user);
			}
			debugLog(`[known-users] Loaded ${usersCache.size} users`);
		}
	} catch (err) {
		debugError(`[known-users] Failed to load users: ${String(err)}`);
		usersCache = /* @__PURE__ */ new Map();
	}
	return usersCache;
}
/** Schedule a throttled write to disk. */
function saveUsersToFile() {
	if (!isDirty) return;
	if (saveTimer) return;
	saveTimer = setTimeout(() => {
		saveTimer = null;
		doSaveUsersToFile();
	}, SAVE_THROTTLE_MS);
}
/** Perform the actual write to disk. */
function doSaveUsersToFile() {
	if (!usersCache || !isDirty) return;
	try {
		ensureDir();
		const users = Array.from(usersCache.values());
		fs.writeFileSync(KNOWN_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
		isDirty = false;
	} catch (err) {
		debugError(`[known-users] Failed to save users: ${String(err)}`);
	}
}
/** Flush pending writes immediately, typically during shutdown. */
function flushKnownUsers() {
	if (saveTimer) {
		clearTimeout(saveTimer);
		saveTimer = null;
	}
	doSaveUsersToFile();
}
/** Build a stable composite key for one user record. */
function makeUserKey(user) {
	const base = `${user.accountId}:${user.type}:${user.openid}`;
	if (user.type === "group" && user.groupOpenid) return `${base}:${user.groupOpenid}`;
	return base;
}
/** Record a known user whenever a message is received. */
function recordKnownUser(user) {
	const cache = loadUsersFromFile();
	const key = makeUserKey(user);
	const now = Date.now();
	const existing = cache.get(key);
	if (existing) {
		existing.lastSeenAt = now;
		existing.interactionCount++;
		if (user.nickname && user.nickname !== existing.nickname) existing.nickname = user.nickname;
	} else {
		const newUser = {
			openid: user.openid,
			type: user.type,
			nickname: user.nickname,
			groupOpenid: user.groupOpenid,
			accountId: user.accountId,
			firstSeenAt: now,
			lastSeenAt: now,
			interactionCount: 1
		};
		cache.set(key, newUser);
		debugLog(`[known-users] New user: ${user.openid} (${user.type})`);
	}
	isDirty = true;
	saveUsersToFile();
}
/** Look up one known user. */
function getKnownUser(accountId, openid, type = "c2c", groupOpenid) {
	const cache = loadUsersFromFile();
	const key = makeUserKey({
		accountId,
		openid,
		type,
		groupOpenid
	});
	return cache.get(key);
}
/** List known users with optional filtering and sorting. */
function listKnownUsers(options) {
	const cache = loadUsersFromFile();
	let users = Array.from(cache.values());
	if (options?.accountId) users = users.filter((u) => u.accountId === options.accountId);
	if (options?.type) users = users.filter((u) => u.type === options.type);
	if (options?.activeWithin) {
		const cutoff = Date.now() - options.activeWithin;
		users = users.filter((u) => u.lastSeenAt >= cutoff);
	}
	const sortBy = options?.sortBy ?? "lastSeenAt";
	const sortOrder = options?.sortOrder ?? "desc";
	users.sort((a, b) => {
		const aVal = a[sortBy] ?? 0;
		const bVal = b[sortBy] ?? 0;
		return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
	});
	if (options?.limit && options.limit > 0) users = users.slice(0, options.limit);
	return users;
}
/** Remove one user record. */
function removeKnownUser(accountId, openid, type = "c2c", groupOpenid) {
	const cache = loadUsersFromFile();
	const key = makeUserKey({
		accountId,
		openid,
		type,
		groupOpenid
	});
	if (cache.has(key)) {
		cache.delete(key);
		isDirty = true;
		saveUsersToFile();
		debugLog(`[known-users] Removed user ${openid}`);
		return true;
	}
	return false;
}
/** Clear all user records, optionally scoped to one account. */
function clearKnownUsers(accountId) {
	const cache = loadUsersFromFile();
	let count = 0;
	if (accountId) {
		for (const [key, user] of cache.entries()) if (user.accountId === accountId) {
			cache.delete(key);
			count++;
		}
	} else {
		count = cache.size;
		cache.clear();
	}
	if (count > 0) {
		isDirty = true;
		doSaveUsersToFile();
		debugLog(`[known-users] Cleared ${count} users`);
	}
	return count;
}
//#endregion
export { listQQBotAccountIds as _, recordKnownUser as a, matchSlashCommand as c, formatQQBotAllowFrom as d, qqbotConfigAdapter as f, applyQQBotAccountConfig as g, DEFAULT_ACCOUNT_ID as h, listKnownUsers as i, TEXT_CHUNK_LIMIT as l, qqbotSetupAdapterShared as m, flushKnownUsers as n, removeKnownUser as o, qqbotMeta as p, getKnownUser as r, getFrameworkCommands as s, clearKnownUsers as t, chunkText as u, resolveDefaultQQBotAccountId as v, resolveQQBotAccount as y };
