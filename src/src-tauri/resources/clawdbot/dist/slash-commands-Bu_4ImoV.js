import { s as resolveRuntimeServiceVersion } from "./version-TiEvEN12.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DTXJhyWe.js";
import { t as applyAccountNameToChannelSection } from "./setup-helpers-CjYO5YkF.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "./config-helpers-DtQuLuCR.js";
import "./core-BghMcc08.js";
import "./secret-input-C8U7qpTM.js";
import "./cli-runtime-BgrpjBV4.js";
import { M as initApiConfig, Q as getQQBotDataDir, Z as getHomeDir, st as debugLog, tt as isWindows } from "./outbound-DE5EbLPn.js";
import { a as qqbotChannelConfigSchema, i as qqbotSetupWizard, r as validateQQBotSetupInput, t as applyQQBotSetupAccountConfig } from "./channel.setup-BuvKbE1E.js";
import { a as resolveQQBotAccount, i as resolveDefaultQQBotAccountId, r as listQQBotAccountIds, t as DEFAULT_ACCOUNT_ID } from "./config-DODp7r-t.js";
import { t as getQQBotRuntime } from "./runtime-DFBwpBiF.js";
import { createRequire } from "node:module";
import fsSync from "node:fs";
import path from "node:path";
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
//#region extensions/qqbot/src/channel.ts
let _gatewayModulePromise;
function loadGatewayModule() {
	_gatewayModulePromise ??= import("./gateway-B4TyumKl.js");
	return _gatewayModulePromise;
}
const qqbotPlugin = {
	id: "qqbot",
	setupWizard: qqbotSetupWizard,
	meta: {
		id: "qqbot",
		label: "QQ Bot",
		selectionLabel: "QQ Bot",
		docsPath: "/channels/qqbot",
		blurb: "Connect to QQ via official QQ Bot API",
		order: 50
	},
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
		isConfigured: (account) => Boolean(account?.appId && (Boolean(account?.clientSecret) || hasConfiguredSecretInput(account?.config?.clientSecret) || Boolean(account?.config?.clientSecretFile?.trim()))),
		describeAccount: (account) => ({
			accountId: account?.accountId ?? "default",
			name: account?.name,
			enabled: account?.enabled ?? false,
			configured: Boolean(account?.appId && (Boolean(account?.clientSecret) || hasConfiguredSecretInput(account?.config?.clientSecret) || Boolean(account?.config?.clientSecretFile?.trim()))),
			tokenSource: account?.secretSource
		}),
		resolveAllowFrom: ({ cfg, accountId }) => {
			return resolveQQBotAccount(cfg, accountId, { allowUnresolvedSecretRef: true }).config?.allowFrom;
		},
		formatAllowFrom: ({ allowFrom }) => (allowFrom ?? []).map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.replace(/^qqbot:/i, "")).map((entry) => entry.toUpperCase())
	},
	setup: {
		resolveAccountId: ({ accountId }) => accountId?.trim().toLowerCase() || "default",
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
	},
	messaging: {
		normalizeTarget: (target) => {
			const id = target.replace(/^qqbot:/i, "");
			if (id.startsWith("c2c:") || id.startsWith("group:") || id.startsWith("channel:")) return `qqbot:${id}`;
			if (/^[0-9a-fA-F]{32}$/.test(id)) return `qqbot:c2c:${id}`;
			if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) return `qqbot:c2c:${id}`;
		},
		targetResolver: {
			looksLikeId: (id) => {
				if (/^qqbot:(c2c|group|channel):/i.test(id)) return true;
				if (/^(c2c|group|channel):/i.test(id)) return true;
				if (/^[0-9a-fA-F]{32}$/.test(id)) return true;
				return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
			},
			hint: "QQ Bot target format: qqbot:c2c:openid (direct) or qqbot:group:groupid (group)"
		}
	},
	outbound: {
		deliveryMode: "direct",
		chunker: (text, limit) => getQQBotRuntime().channel.text.chunkMarkdownText(text, limit),
		chunkerMode: "markdown",
		textChunkLimit: 5e3,
		sendText: async ({ to, text, accountId, replyToId, cfg }) => {
			const account = resolveQQBotAccount(cfg, accountId);
			const { sendText } = await import("./outbound-FvbYMEpj.js");
			initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
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
			const account = resolveQQBotAccount(cfg, accountId);
			const { sendMedia } = await import("./outbound-FvbYMEpj.js");
			initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
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
			const { account } = ctx;
			const { abortSignal, log, cfg } = ctx;
			const { startGateway } = await loadGatewayModule();
			log?.info(`[qqbot:${account.accountId}] Starting gateway — appId=${account.appId}, enabled=${account.enabled}, name=${account.name ?? "unnamed"}`);
			await startGateway({
				account,
				abortSignal,
				cfg,
				log,
				onReady: () => {
					log?.info(`[qqbot:${account.accountId}] Gateway ready`);
					ctx.setStatus({
						...ctx.getStatus(),
						running: true,
						connected: true,
						lastConnectedAt: Date.now()
					});
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
			const nextCfg = { ...cfg };
			const nextQQBot = cfg.channels?.qqbot ? { ...cfg.channels.qqbot } : void 0;
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
			if (changed && nextQQBot) {
				nextCfg.channels = {
					...nextCfg.channels,
					qqbot: nextQQBot
				};
				await getQQBotRuntime().config.writeConfigFile(nextCfg);
			}
			const loggedOut = resolveQQBotAccount(changed ? nextCfg : cfg, accountId).secretSource === "none";
			const envToken = Boolean(process.env.QQBOT_CLIENT_SECRET);
			return {
				ok: true,
				cleared,
				envToken,
				loggedOut
			};
		}
	},
	status: {
		defaultRuntime: {
			accountId: DEFAULT_ACCOUNT_ID,
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
			accountId: account?.accountId ?? "default",
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
try {
	require("../package.json").version;
} catch {}
const QQBOT_PLUGIN_GITHUB_URL = "https://github.com/openclaw/openclaw/tree/main/extensions/qqbot";
const QQBOT_UPGRADE_GUIDE_URL = "https://q.qq.com/qqbot/openclaw/upgrade.html";
function hasExplicitCommandAllowlist(accountConfig) {
	const allowFrom = accountConfig?.allowFrom;
	if (!Array.isArray(allowFrom) || allowFrom.length === 0) return false;
	return allowFrom.every((entry) => {
		const normalized = String(entry).trim().replace(/^qqbot:\s*/i, "").trim();
		return normalized.length > 0 && normalized !== "*";
	});
}
const commands = /* @__PURE__ */ new Map();
const frameworkCommands = /* @__PURE__ */ new Map();
function registerCommand(cmd) {
	if (cmd.requireAuth) frameworkCommands.set(cmd.name.toLowerCase(), cmd);
	else commands.set(cmd.name.toLowerCase(), cmd);
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
		if (!fsSync.existsSync(cfgPath)) continue;
		const logFile = JSON.parse(fsSync.readFileSync(cfgPath, "utf8"))?.logging?.file;
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
		const entries = fsSync.readdirSync(root, { withFileTypes: true });
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
			const stat = fsSync.statSync(normalized);
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
			const entries = fsSync.readdirSync(dir, { withFileTypes: true });
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
	const fd = fsSync.openSync(filePath, "r");
	try {
		const fileSize = fsSync.fstatSync(fd).size;
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
			fsSync.readSync(fd, buf, 0, readSize, position);
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
		fsSync.closeSync(fd);
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
				return fsSync.existsSync(d);
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
	fsSync.writeFileSync(tmpFile, lines.join("\n"), "utf8");
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
	const cmdName = (spaceIdx === -1 ? content.slice(1) : content.slice(1, spaceIdx)).toLowerCase();
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
export { chunkText as a, TEXT_CHUNK_LIMIT as i, matchSlashCommand as n, qqbotPlugin as r, getFrameworkCommands as t };
