import { a as resolveOAuthDir, c as expandHomePrefix, l as resolveEffectiveHomeDir, n as resolveConfigPath, u as resolveRequiredHomeDir } from "./paths-BZtyHNCi.js";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { Logger } from "tslog";
import JSON5 from "json5";
import chalk, { Chalk } from "chalk";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

//#region src/infra/tmp-openclaw-dir.ts
const POSIX_OPENCLAW_TMP_DIR = "/tmp/openclaw";
function isNodeErrorWithCode(err, code) {
	return typeof err === "object" && err !== null && "code" in err && err.code === code;
}
function resolvePreferredOpenClawTmpDir(options = {}) {
	const accessSync = options.accessSync ?? fs.accessSync;
	const statSync = options.statSync ?? fs.statSync;
	const tmpdir = options.tmpdir ?? os.tmpdir;
	try {
		if (!statSync(POSIX_OPENCLAW_TMP_DIR).isDirectory()) return path.join(tmpdir(), "openclaw");
		accessSync(POSIX_OPENCLAW_TMP_DIR, fs.constants.W_OK | fs.constants.X_OK);
		return POSIX_OPENCLAW_TMP_DIR;
	} catch (err) {
		if (!isNodeErrorWithCode(err, "ENOENT")) return path.join(tmpdir(), "openclaw");
	}
	try {
		accessSync("/tmp", fs.constants.W_OK | fs.constants.X_OK);
		return POSIX_OPENCLAW_TMP_DIR;
	} catch {
		return path.join(tmpdir(), "openclaw");
	}
}

//#endregion
//#region src/logging/config.ts
function readLoggingConfig() {
	const configPath = resolveConfigPath();
	try {
		if (!fs.existsSync(configPath)) return;
		const raw = fs.readFileSync(configPath, "utf-8");
		const logging = JSON5.parse(raw)?.logging;
		if (!logging || typeof logging !== "object" || Array.isArray(logging)) return;
		return logging;
	} catch {
		return;
	}
}

//#endregion
//#region src/logging/levels.ts
const ALLOWED_LOG_LEVELS = [
	"silent",
	"fatal",
	"error",
	"warn",
	"info",
	"debug",
	"trace"
];
function normalizeLogLevel(level, fallback = "info") {
	const candidate = (level ?? fallback).trim();
	return ALLOWED_LOG_LEVELS.includes(candidate) ? candidate : fallback;
}
function levelToMinLevel(level) {
	return {
		fatal: 0,
		error: 1,
		warn: 2,
		info: 3,
		debug: 4,
		trace: 5,
		silent: Number.POSITIVE_INFINITY
	}[level];
}

//#endregion
//#region src/logging/state.ts
const loggingState = {
	cachedLogger: null,
	cachedSettings: null,
	cachedConsoleSettings: null,
	overrideSettings: null,
	consolePatched: false,
	forceConsoleToStderr: false,
	consoleTimestampPrefix: false,
	consoleSubsystemFilter: null,
	resolvingConsoleSettings: false,
	streamErrorHandlersInstalled: false,
	rawConsole: null
};

//#endregion
//#region src/logging/logger.ts
const DEFAULT_LOG_DIR = resolvePreferredOpenClawTmpDir();
const DEFAULT_LOG_FILE = path.join(DEFAULT_LOG_DIR, "openclaw.log");
const LOG_PREFIX = "openclaw";
const LOG_SUFFIX = ".log";
const MAX_LOG_AGE_MS = 1440 * 60 * 1e3;
const requireConfig$1 = createRequire(import.meta.url);
const externalTransports = /* @__PURE__ */ new Set();
function attachExternalTransport(logger, transport) {
	logger.attachTransport((logObj) => {
		if (!externalTransports.has(transport)) return;
		try {
			transport(logObj);
		} catch {}
	});
}
function resolveSettings() {
	let cfg = loggingState.overrideSettings ?? readLoggingConfig();
	if (!cfg) try {
		cfg = requireConfig$1("../config/config.js").loadConfig?.().logging;
	} catch {
		cfg = void 0;
	}
	const defaultLevel = process.env.VITEST === "true" && process.env.OPENCLAW_TEST_FILE_LOG !== "1" ? "silent" : "info";
	return {
		level: normalizeLogLevel(cfg?.level, defaultLevel),
		file: cfg?.file ?? defaultRollingPathForToday()
	};
}
function settingsChanged(a, b) {
	if (!a) return true;
	return a.level !== b.level || a.file !== b.file;
}
function isFileLogLevelEnabled(level) {
	const settings = loggingState.cachedSettings ?? resolveSettings();
	if (!loggingState.cachedSettings) loggingState.cachedSettings = settings;
	if (settings.level === "silent") return false;
	return levelToMinLevel(level) <= levelToMinLevel(settings.level);
}
function buildLogger(settings) {
	fs.mkdirSync(path.dirname(settings.file), { recursive: true });
	if (isRollingPath(settings.file)) pruneOldRollingLogs(path.dirname(settings.file));
	const logger = new Logger({
		name: "openclaw",
		minLevel: levelToMinLevel(settings.level),
		type: "hidden"
	});
	logger.attachTransport((logObj) => {
		try {
			const time = logObj.date?.toISOString?.() ?? (/* @__PURE__ */ new Date()).toISOString();
			const line = JSON.stringify({
				...logObj,
				time
			});
			fs.appendFileSync(settings.file, `${line}\n`, { encoding: "utf8" });
		} catch {}
	});
	for (const transport of externalTransports) attachExternalTransport(logger, transport);
	return logger;
}
function getLogger() {
	const settings = resolveSettings();
	const cachedLogger = loggingState.cachedLogger;
	const cachedSettings = loggingState.cachedSettings;
	if (!cachedLogger || settingsChanged(cachedSettings, settings)) {
		loggingState.cachedLogger = buildLogger(settings);
		loggingState.cachedSettings = settings;
	}
	return loggingState.cachedLogger;
}
function getChildLogger(bindings, opts) {
	const base = getLogger();
	const minLevel = opts?.level ? levelToMinLevel(opts.level) : void 0;
	const name = bindings ? JSON.stringify(bindings) : void 0;
	return base.getSubLogger({
		name,
		minLevel,
		prefix: bindings ? [name ?? ""] : []
	});
}
function toPinoLikeLogger(logger, level) {
	const buildChild = (bindings) => toPinoLikeLogger(logger.getSubLogger({ name: bindings ? JSON.stringify(bindings) : void 0 }), level);
	return {
		level,
		child: buildChild,
		trace: (...args) => logger.trace(...args),
		debug: (...args) => logger.debug(...args),
		info: (...args) => logger.info(...args),
		warn: (...args) => logger.warn(...args),
		error: (...args) => logger.error(...args),
		fatal: (...args) => logger.fatal(...args)
	};
}
function formatLocalDate(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function defaultRollingPathForToday() {
	const today = formatLocalDate(/* @__PURE__ */ new Date());
	return path.join(DEFAULT_LOG_DIR, `${LOG_PREFIX}-${today}${LOG_SUFFIX}`);
}
function isRollingPath(file) {
	const base = path.basename(file);
	return base.startsWith(`${LOG_PREFIX}-`) && base.endsWith(LOG_SUFFIX) && base.length === `${LOG_PREFIX}-YYYY-MM-DD${LOG_SUFFIX}`.length;
}
function pruneOldRollingLogs(dir) {
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		const cutoff = Date.now() - MAX_LOG_AGE_MS;
		for (const entry of entries) {
			if (!entry.isFile()) continue;
			if (!entry.name.startsWith(`${LOG_PREFIX}-`) || !entry.name.endsWith(LOG_SUFFIX)) continue;
			const fullPath = path.join(dir, entry.name);
			try {
				if (fs.statSync(fullPath).mtimeMs < cutoff) fs.rmSync(fullPath, { force: true });
			} catch {}
		}
	} catch {}
}

//#endregion
//#region src/terminal/palette.ts
const LOBSTER_PALETTE = {
	accent: "#FF5A2D",
	accentBright: "#FF7A3D",
	accentDim: "#D14A22",
	info: "#FF8A5B",
	success: "#2FBF71",
	warn: "#FFB020",
	error: "#E23D2D",
	muted: "#8B7F77"
};

//#endregion
//#region src/terminal/theme.ts
const hasForceColor = typeof process.env.FORCE_COLOR === "string" && process.env.FORCE_COLOR.trim().length > 0 && process.env.FORCE_COLOR.trim() !== "0";
const baseChalk = process.env.NO_COLOR && !hasForceColor ? new Chalk({ level: 0 }) : chalk;
const hex = (value) => baseChalk.hex(value);
const theme = {
	accent: hex(LOBSTER_PALETTE.accent),
	accentBright: hex(LOBSTER_PALETTE.accentBright),
	accentDim: hex(LOBSTER_PALETTE.accentDim),
	info: hex(LOBSTER_PALETTE.info),
	success: hex(LOBSTER_PALETTE.success),
	warn: hex(LOBSTER_PALETTE.warn),
	error: hex(LOBSTER_PALETTE.error),
	muted: hex(LOBSTER_PALETTE.muted),
	heading: baseChalk.bold.hex(LOBSTER_PALETTE.accent),
	command: hex(LOBSTER_PALETTE.accentBright),
	option: hex(LOBSTER_PALETTE.warn)
};
const isRich = () => Boolean(baseChalk.level > 0);
const colorize = (rich, color, value) => rich ? color(value) : value;

//#endregion
//#region src/globals.ts
let globalVerbose = false;
function setVerbose(v) {
	globalVerbose = v;
}
function isVerbose() {
	return globalVerbose;
}
function shouldLogVerbose() {
	return globalVerbose || isFileLogLevelEnabled("debug");
}
function logVerbose(message) {
	if (!shouldLogVerbose()) return;
	try {
		getLogger().debug({ message }, "verbose");
	} catch {}
	if (!globalVerbose) return;
	console.log(theme.muted(message));
}
function logVerboseConsole(message) {
	if (!globalVerbose) return;
	console.log(theme.muted(message));
}
const success = theme.success;
const warn = theme.warn;
const info = theme.info;
const danger = theme.error;

//#endregion
//#region src/utils.ts
async function ensureDir(dir) {
	await fs.promises.mkdir(dir, { recursive: true });
}
/**
* Check if a file or directory exists at the given path.
*/
async function pathExists(targetPath) {
	try {
		await fs.promises.access(targetPath);
		return true;
	} catch {
		return false;
	}
}
function clampNumber(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function clampInt(value, min, max) {
	return clampNumber(Math.floor(value), min, max);
}
/** Alias for clampNumber (shorter, more common name) */
const clamp = clampNumber;
/**
* Escapes special regex characters in a string so it can be used in a RegExp constructor.
*/
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
* Safely parse JSON, returning null on error instead of throwing.
*/
function safeParseJson(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
/**
* Type guard for plain objects (not arrays, null, Date, RegExp, etc.).
* Uses Object.prototype.toString for maximum safety.
*/
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) && Object.prototype.toString.call(value) === "[object Object]";
}
/**
* Type guard for Record<string, unknown> (less strict than isPlainObject).
* Accepts any non-null object that isn't an array.
*/
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeE164(number) {
	const digits = number.replace(/^whatsapp:/, "").trim().replace(/[^\d+]/g, "");
	if (digits.startsWith("+")) return `+${digits.slice(1)}`;
	return `+${digits}`;
}
/**
* "Self-chat mode" heuristic (single phone): the gateway is logged in as the owner's own WhatsApp account,
* and `channels.whatsapp.allowFrom` includes that same number. Used to avoid side-effects that make no sense when the
* "bot" and the human are the same WhatsApp identity (e.g. auto read receipts, @mention JID triggers).
*/
function isSelfChatMode(selfE164, allowFrom) {
	if (!selfE164) return false;
	if (!Array.isArray(allowFrom) || allowFrom.length === 0) return false;
	const normalizedSelf = normalizeE164(selfE164);
	return allowFrom.some((n) => {
		if (n === "*") return false;
		try {
			return normalizeE164(String(n)) === normalizedSelf;
		} catch {
			return false;
		}
	});
}
function toWhatsappJid(number) {
	const withoutPrefix = number.replace(/^whatsapp:/, "").trim();
	if (withoutPrefix.includes("@")) return withoutPrefix;
	return `${normalizeE164(withoutPrefix).replace(/\D/g, "")}@s.whatsapp.net`;
}
function resolveLidMappingDirs(opts) {
	const dirs = /* @__PURE__ */ new Set();
	const addDir = (dir) => {
		if (!dir) return;
		dirs.add(resolveUserPath(dir));
	};
	addDir(opts?.authDir);
	for (const dir of opts?.lidMappingDirs ?? []) addDir(dir);
	addDir(resolveOAuthDir());
	addDir(path.join(CONFIG_DIR, "credentials"));
	return [...dirs];
}
function readLidReverseMapping(lid, opts) {
	const mappingFilename = `lid-mapping-${lid}_reverse.json`;
	const mappingDirs = resolveLidMappingDirs(opts);
	for (const dir of mappingDirs) {
		const mappingPath = path.join(dir, mappingFilename);
		try {
			const data = fs.readFileSync(mappingPath, "utf8");
			const phone = JSON.parse(data);
			if (phone === null || phone === void 0) continue;
			return normalizeE164(String(phone));
		} catch {}
	}
	return null;
}
function jidToE164(jid, opts) {
	const match = jid.match(/^(\d+)(?::\d+)?@(s\.whatsapp\.net|hosted)$/);
	if (match) return `+${match[1]}`;
	const lidMatch = jid.match(/^(\d+)(?::\d+)?@(lid|hosted\.lid)$/);
	if (lidMatch) {
		const lid = lidMatch[1];
		const phone = readLidReverseMapping(lid, opts);
		if (phone) return phone;
		if (opts?.logMissing ?? shouldLogVerbose()) logVerbose(`LID mapping not found for ${lid}; skipping inbound message`);
	}
	return null;
}
async function resolveJidToE164(jid, opts) {
	if (!jid) return null;
	const direct = jidToE164(jid, opts);
	if (direct) return direct;
	if (!/(@lid|@hosted\.lid)$/.test(jid)) return null;
	if (!opts?.lidLookup?.getPNForLID) return null;
	try {
		const pnJid = await opts.lidLookup.getPNForLID(jid);
		if (!pnJid) return null;
		return jidToE164(pnJid, opts);
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`LID mapping lookup failed for ${jid}: ${String(err)}`);
		return null;
	}
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function isHighSurrogate(codeUnit) {
	return codeUnit >= 55296 && codeUnit <= 56319;
}
function isLowSurrogate(codeUnit) {
	return codeUnit >= 56320 && codeUnit <= 57343;
}
function sliceUtf16Safe(input, start, end) {
	const len = input.length;
	let from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
	let to = end === void 0 ? len : end < 0 ? Math.max(len + end, 0) : Math.min(end, len);
	if (to < from) {
		const tmp = from;
		from = to;
		to = tmp;
	}
	if (from > 0 && from < len) {
		if (isLowSurrogate(input.charCodeAt(from)) && isHighSurrogate(input.charCodeAt(from - 1))) from += 1;
	}
	if (to > 0 && to < len) {
		if (isHighSurrogate(input.charCodeAt(to - 1)) && isLowSurrogate(input.charCodeAt(to))) to -= 1;
	}
	return input.slice(from, to);
}
function truncateUtf16Safe(input, maxLen) {
	const limit = Math.max(0, Math.floor(maxLen));
	if (input.length <= limit) return input;
	return sliceUtf16Safe(input, 0, limit);
}
function resolveUserPath(input) {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	if (trimmed.startsWith("~")) {
		const expanded = expandHomePrefix(trimmed, {
			home: resolveRequiredHomeDir(process.env, os.homedir),
			env: process.env,
			homedir: os.homedir
		});
		return path.resolve(expanded);
	}
	return path.resolve(trimmed);
}
function resolveConfigDir(env = process.env, homedir = os.homedir) {
	const override = env.OPENCLAW_STATE_DIR?.trim() || env.CLAWDBOT_STATE_DIR?.trim();
	if (override) return resolveUserPath(override);
	const newDir = path.join(resolveRequiredHomeDir(env, homedir), ".openclaw");
	try {
		if (fs.existsSync(newDir)) return newDir;
	} catch {}
	return newDir;
}
function resolveHomeDir() {
	return resolveEffectiveHomeDir(process.env, os.homedir);
}
function resolveHomeDisplayPrefix() {
	const home = resolveHomeDir();
	if (!home) return;
	if (process.env.OPENCLAW_HOME?.trim()) return {
		home,
		prefix: "$OPENCLAW_HOME"
	};
	return {
		home,
		prefix: "~"
	};
}
function shortenHomePath(input) {
	if (!input) return input;
	const display = resolveHomeDisplayPrefix();
	if (!display) return input;
	const { home, prefix } = display;
	if (input === home) return prefix;
	if (input.startsWith(`${home}/`) || input.startsWith(`${home}\\`)) return `${prefix}${input.slice(home.length)}`;
	return input;
}
function shortenHomeInString(input) {
	if (!input) return input;
	const display = resolveHomeDisplayPrefix();
	if (!display) return input;
	return input.split(display.home).join(display.prefix);
}
function formatTerminalLink(label, url, opts) {
	const esc = "\x1B";
	const safeLabel = label.replaceAll(esc, "");
	const safeUrl = url.replaceAll(esc, "");
	if (!(opts?.force === true ? true : opts?.force === false ? false : Boolean(process.stdout.isTTY))) return opts?.fallback ?? `${safeLabel} (${safeUrl})`;
	return `\u001b]8;;${safeUrl}\u0007${safeLabel}\u001b]8;;\u0007`;
}
const CONFIG_DIR = resolveConfigDir();

//#endregion
//#region src/plugins/runtime.ts
const createEmptyRegistry = () => ({
	plugins: [],
	tools: [],
	hooks: [],
	typedHooks: [],
	channels: [],
	providers: [],
	gatewayHandlers: {},
	httpHandlers: [],
	httpRoutes: [],
	cliRegistrars: [],
	services: [],
	commands: [],
	diagnostics: []
});
const REGISTRY_STATE = Symbol.for("openclaw.pluginRegistryState");
const state = (() => {
	const globalState = globalThis;
	if (!globalState[REGISTRY_STATE]) globalState[REGISTRY_STATE] = {
		registry: createEmptyRegistry(),
		key: null
	};
	return globalState[REGISTRY_STATE];
})();
function setActivePluginRegistry(registry, cacheKey) {
	state.registry = registry;
	state.key = cacheKey ?? null;
}
function getActivePluginRegistry() {
	return state.registry;
}
function requireActivePluginRegistry() {
	if (!state.registry) state.registry = createEmptyRegistry();
	return state.registry;
}

//#endregion
//#region src/channels/registry.ts
const CHAT_CHANNEL_ORDER = [
	"telegram",
	"whatsapp",
	"discord",
	"irc",
	"googlechat",
	"slack",
	"signal",
	"imessage"
];
const CHANNEL_IDS = [...CHAT_CHANNEL_ORDER];
const DEFAULT_CHAT_CHANNEL = "whatsapp";
const CHAT_CHANNEL_META = {
	telegram: {
		id: "telegram",
		label: "Telegram",
		selectionLabel: "Telegram (Bot API)",
		detailLabel: "Telegram Bot",
		docsPath: "/channels/telegram",
		docsLabel: "telegram",
		blurb: "simplest way to get started — register a bot with @BotFather and get going.",
		systemImage: "paperplane",
		selectionDocsPrefix: "",
		selectionDocsOmitLabel: true,
		selectionExtras: ["https://openclaw.ai"]
	},
	whatsapp: {
		id: "whatsapp",
		label: "WhatsApp",
		selectionLabel: "WhatsApp (QR link)",
		detailLabel: "WhatsApp Web",
		docsPath: "/channels/whatsapp",
		docsLabel: "whatsapp",
		blurb: "works with your own number; recommend a separate phone + eSIM.",
		systemImage: "message"
	},
	discord: {
		id: "discord",
		label: "Discord",
		selectionLabel: "Discord (Bot API)",
		detailLabel: "Discord Bot",
		docsPath: "/channels/discord",
		docsLabel: "discord",
		blurb: "very well supported right now.",
		systemImage: "bubble.left.and.bubble.right"
	},
	irc: {
		id: "irc",
		label: "IRC",
		selectionLabel: "IRC (Server + Nick)",
		detailLabel: "IRC",
		docsPath: "/channels/irc",
		docsLabel: "irc",
		blurb: "classic IRC networks with DM/channel routing and pairing controls.",
		systemImage: "network"
	},
	googlechat: {
		id: "googlechat",
		label: "Google Chat",
		selectionLabel: "Google Chat (Chat API)",
		detailLabel: "Google Chat",
		docsPath: "/channels/googlechat",
		docsLabel: "googlechat",
		blurb: "Google Workspace Chat app with HTTP webhook.",
		systemImage: "message.badge"
	},
	slack: {
		id: "slack",
		label: "Slack",
		selectionLabel: "Slack (Socket Mode)",
		detailLabel: "Slack Bot",
		docsPath: "/channels/slack",
		docsLabel: "slack",
		blurb: "supported (Socket Mode).",
		systemImage: "number"
	},
	signal: {
		id: "signal",
		label: "Signal",
		selectionLabel: "Signal (signal-cli)",
		detailLabel: "Signal REST",
		docsPath: "/channels/signal",
		docsLabel: "signal",
		blurb: "signal-cli linked device; more setup (David Reagans: \"Hop on Discord.\").",
		systemImage: "antenna.radiowaves.left.and.right"
	},
	imessage: {
		id: "imessage",
		label: "iMessage",
		selectionLabel: "iMessage (imsg)",
		detailLabel: "iMessage",
		docsPath: "/channels/imessage",
		docsLabel: "imessage",
		blurb: "this is still a work in progress.",
		systemImage: "message.fill"
	}
};
const CHAT_CHANNEL_ALIASES = {
	imsg: "imessage",
	"internet-relay-chat": "irc",
	"google-chat": "googlechat",
	gchat: "googlechat"
};
const normalizeChannelKey = (raw) => {
	return raw?.trim().toLowerCase() || void 0;
};
function getChatChannelMeta(id) {
	return CHAT_CHANNEL_META[id];
}
function normalizeChatChannelId(raw) {
	const normalized = normalizeChannelKey(raw);
	if (!normalized) return null;
	const resolved = CHAT_CHANNEL_ALIASES[normalized] ?? normalized;
	return CHAT_CHANNEL_ORDER.includes(resolved) ? resolved : null;
}
function normalizeChannelId(raw) {
	return normalizeChatChannelId(raw);
}
function normalizeAnyChannelId(raw) {
	const key = normalizeChannelKey(raw);
	if (!key) return null;
	return requireActivePluginRegistry().channels.find((entry) => {
		const id = String(entry.plugin.id ?? "").trim().toLowerCase();
		if (id && id === key) return true;
		return (entry.plugin.meta.aliases ?? []).some((alias) => alias.trim().toLowerCase() === key);
	})?.plugin.id ?? null;
}

//#endregion
//#region src/terminal/progress-line.ts
let activeStream = null;
function registerActiveProgressLine(stream) {
	if (!stream.isTTY) return;
	activeStream = stream;
}
function clearActiveProgressLine() {
	if (!activeStream?.isTTY) return;
	activeStream.write("\r\x1B[2K");
}
function unregisterActiveProgressLine(stream) {
	if (!activeStream) return;
	if (stream && activeStream !== stream) return;
	activeStream = null;
}

//#endregion
//#region src/terminal/restore.ts
const RESET_SEQUENCE = "\x1B[0m\x1B[?25h\x1B[?1000l\x1B[?1002l\x1B[?1003l\x1B[?1006l\x1B[?2004l";
function reportRestoreFailure(scope, err, reason) {
	const suffix = reason ? ` (${reason})` : "";
	const message = `[terminal] restore ${scope} failed${suffix}: ${String(err)}`;
	try {
		process.stderr.write(`${message}\n`);
	} catch (writeErr) {
		console.error(`[terminal] restore reporting failed${suffix}: ${String(writeErr)}`);
	}
}
function restoreTerminalState(reason) {
	try {
		clearActiveProgressLine();
	} catch (err) {
		reportRestoreFailure("progress line", err, reason);
	}
	const stdin = process.stdin;
	if (stdin.isTTY && typeof stdin.setRawMode === "function") try {
		stdin.setRawMode(false);
	} catch (err) {
		reportRestoreFailure("raw mode", err, reason);
	}
	if (process.stdout.isTTY) try {
		process.stdout.write(RESET_SEQUENCE);
	} catch (err) {
		reportRestoreFailure("stdout reset", err, reason);
	}
}

//#endregion
//#region src/runtime.ts
function shouldEmitRuntimeLog(env = process.env) {
	if (env.VITEST !== "true") return true;
	if (env.OPENCLAW_TEST_RUNTIME_LOG === "1") return true;
	return typeof console.log.mock === "object";
}
const defaultRuntime = {
	log: (...args) => {
		if (!shouldEmitRuntimeLog()) return;
		clearActiveProgressLine();
		console.log(...args);
	},
	error: (...args) => {
		clearActiveProgressLine();
		console.error(...args);
	},
	exit: (code) => {
		restoreTerminalState("runtime exit");
		process.exit(code);
		throw new Error("unreachable");
	}
};
function createNonExitingRuntime() {
	return {
		log: (...args) => {
			if (!shouldEmitRuntimeLog()) return;
			clearActiveProgressLine();
			console.log(...args);
		},
		error: (...args) => {
			clearActiveProgressLine();
			console.error(...args);
		},
		exit: (code) => {
			throw new Error(`exit ${code}`);
		}
	};
}

//#endregion
//#region src/terminal/ansi.ts
const ANSI_SGR_PATTERN = "\\x1b\\[[0-9;]*m";
const OSC8_PATTERN = "\\x1b\\]8;;.*?\\x1b\\\\|\\x1b\\]8;;\\x1b\\\\";
const ANSI_REGEX = new RegExp(ANSI_SGR_PATTERN, "g");
const OSC8_REGEX = new RegExp(OSC8_PATTERN, "g");

//#endregion
//#region src/logging/console.ts
const requireConfig = createRequire(import.meta.url);
const loadConfigFallbackDefault = () => {
	try {
		return requireConfig("../config/config.js").loadConfig?.().logging;
	} catch {
		return;
	}
};
let loadConfigFallback = loadConfigFallbackDefault;
function normalizeConsoleLevel(level) {
	if (isVerbose()) return "debug";
	if (!level && process.env.VITEST === "true" && process.env.OPENCLAW_TEST_CONSOLE !== "1") return "silent";
	return normalizeLogLevel(level, "info");
}
function normalizeConsoleStyle(style) {
	if (style === "compact" || style === "json" || style === "pretty") return style;
	if (!process.stdout.isTTY) return "compact";
	return "pretty";
}
function resolveConsoleSettings() {
	let cfg = loggingState.overrideSettings ?? readLoggingConfig();
	if (!cfg) if (loggingState.resolvingConsoleSettings) cfg = void 0;
	else {
		loggingState.resolvingConsoleSettings = true;
		try {
			cfg = loadConfigFallback();
		} finally {
			loggingState.resolvingConsoleSettings = false;
		}
	}
	return {
		level: normalizeConsoleLevel(cfg?.consoleLevel),
		style: normalizeConsoleStyle(cfg?.consoleStyle)
	};
}
function consoleSettingsChanged(a, b) {
	if (!a) return true;
	return a.level !== b.level || a.style !== b.style;
}
function getConsoleSettings() {
	const settings = resolveConsoleSettings();
	const cached = loggingState.cachedConsoleSettings;
	if (!cached || consoleSettingsChanged(cached, settings)) loggingState.cachedConsoleSettings = settings;
	return loggingState.cachedConsoleSettings;
}
function shouldLogSubsystemToConsole(subsystem) {
	const filter = loggingState.consoleSubsystemFilter;
	if (!filter || filter.length === 0) return true;
	return filter.some((prefix) => subsystem === prefix || subsystem.startsWith(`${prefix}/`));
}

//#endregion
//#region src/logging/subsystem.ts
function shouldLogToConsole(level, settings) {
	if (settings.level === "silent") return false;
	return levelToMinLevel(level) <= levelToMinLevel(settings.level);
}
function isRichConsoleEnv() {
	const term = (process.env.TERM ?? "").toLowerCase();
	if (process.env.COLORTERM || process.env.TERM_PROGRAM) return true;
	return term.length > 0 && term !== "dumb";
}
function getColorForConsole() {
	const hasForceColor = typeof process.env.FORCE_COLOR === "string" && process.env.FORCE_COLOR.trim().length > 0 && process.env.FORCE_COLOR.trim() !== "0";
	if (process.env.NO_COLOR && !hasForceColor) return new Chalk({ level: 0 });
	return Boolean(process.stdout.isTTY || process.stderr.isTTY) || isRichConsoleEnv() ? new Chalk({ level: 1 }) : new Chalk({ level: 0 });
}
const SUBSYSTEM_COLORS = [
	"cyan",
	"green",
	"yellow",
	"blue",
	"magenta",
	"red"
];
const SUBSYSTEM_COLOR_OVERRIDES = { "gmail-watcher": "blue" };
const SUBSYSTEM_PREFIXES_TO_DROP = [
	"gateway",
	"channels",
	"providers"
];
const SUBSYSTEM_MAX_SEGMENTS = 2;
const CHANNEL_SUBSYSTEM_PREFIXES = new Set(CHAT_CHANNEL_ORDER);
function pickSubsystemColor(color, subsystem) {
	const override = SUBSYSTEM_COLOR_OVERRIDES[subsystem];
	if (override) return color[override];
	let hash = 0;
	for (let i = 0; i < subsystem.length; i += 1) hash = hash * 31 + subsystem.charCodeAt(i) | 0;
	return color[SUBSYSTEM_COLORS[Math.abs(hash) % SUBSYSTEM_COLORS.length]];
}
function formatSubsystemForConsole(subsystem) {
	const parts = subsystem.split("/").filter(Boolean);
	const original = parts.join("/") || subsystem;
	while (parts.length > 0 && SUBSYSTEM_PREFIXES_TO_DROP.includes(parts[0])) parts.shift();
	if (parts.length === 0) return original;
	if (CHANNEL_SUBSYSTEM_PREFIXES.has(parts[0])) return parts[0];
	if (parts.length > SUBSYSTEM_MAX_SEGMENTS) return parts.slice(-SUBSYSTEM_MAX_SEGMENTS).join("/");
	return parts.join("/");
}
function stripRedundantSubsystemPrefixForConsole(message, displaySubsystem) {
	if (!displaySubsystem) return message;
	if (message.startsWith("[")) {
		const closeIdx = message.indexOf("]");
		if (closeIdx > 1) {
			if (message.slice(1, closeIdx).toLowerCase() === displaySubsystem.toLowerCase()) {
				let i = closeIdx + 1;
				while (message[i] === " ") i += 1;
				return message.slice(i);
			}
		}
	}
	if (message.slice(0, displaySubsystem.length).toLowerCase() !== displaySubsystem.toLowerCase()) return message;
	const next = message.slice(displaySubsystem.length, displaySubsystem.length + 1);
	if (next !== ":" && next !== " ") return message;
	let i = displaySubsystem.length;
	while (message[i] === " ") i += 1;
	if (message[i] === ":") i += 1;
	while (message[i] === " ") i += 1;
	return message.slice(i);
}
function formatConsoleLine(opts) {
	const displaySubsystem = opts.style === "json" ? opts.subsystem : formatSubsystemForConsole(opts.subsystem);
	if (opts.style === "json") return JSON.stringify({
		time: (/* @__PURE__ */ new Date()).toISOString(),
		level: opts.level,
		subsystem: displaySubsystem,
		message: opts.message,
		...opts.meta
	});
	const color = getColorForConsole();
	const prefix = `[${displaySubsystem}]`;
	const prefixColor = pickSubsystemColor(color, displaySubsystem);
	const levelColor = opts.level === "error" || opts.level === "fatal" ? color.red : opts.level === "warn" ? color.yellow : opts.level === "debug" || opts.level === "trace" ? color.gray : color.cyan;
	const displayMessage = stripRedundantSubsystemPrefixForConsole(opts.message, displaySubsystem);
	return `${[(() => {
		if (opts.style === "pretty") return color.gray((/* @__PURE__ */ new Date()).toISOString().slice(11, 19));
		if (loggingState.consoleTimestampPrefix) return color.gray((/* @__PURE__ */ new Date()).toISOString());
		return "";
	})(), prefixColor(prefix)].filter(Boolean).join(" ")} ${levelColor(displayMessage)}`;
}
function writeConsoleLine(level, line) {
	clearActiveProgressLine();
	const sanitized = process.platform === "win32" && process.env.GITHUB_ACTIONS === "true" ? line.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "?").replace(/[\uD800-\uDFFF]/g, "?") : line;
	const sink = loggingState.rawConsole ?? console;
	if (loggingState.forceConsoleToStderr || level === "error" || level === "fatal") (sink.error ?? console.error)(sanitized);
	else if (level === "warn") (sink.warn ?? console.warn)(sanitized);
	else (sink.log ?? console.log)(sanitized);
}
function logToFile(fileLogger, level, message, meta) {
	if (level === "silent") return;
	const method = fileLogger[level];
	if (typeof method !== "function") return;
	if (meta && Object.keys(meta).length > 0) method.call(fileLogger, meta, message);
	else method.call(fileLogger, message);
}
function createSubsystemLogger(subsystem) {
	let fileLogger = null;
	const getFileLogger = () => {
		if (!fileLogger) fileLogger = getChildLogger({ subsystem });
		return fileLogger;
	};
	const emit = (level, message, meta) => {
		const consoleSettings = getConsoleSettings();
		let consoleMessageOverride;
		let fileMeta = meta;
		if (meta && Object.keys(meta).length > 0) {
			const { consoleMessage, ...rest } = meta;
			if (typeof consoleMessage === "string") consoleMessageOverride = consoleMessage;
			fileMeta = Object.keys(rest).length > 0 ? rest : void 0;
		}
		logToFile(getFileLogger(), level, message, fileMeta);
		if (!shouldLogToConsole(level, { level: consoleSettings.level })) return;
		if (!shouldLogSubsystemToConsole(subsystem)) return;
		const consoleMessage = consoleMessageOverride ?? message;
		if (!isVerbose() && subsystem === "agent/embedded" && /(sessionId|runId)=probe-/.test(consoleMessage)) return;
		writeConsoleLine(level, formatConsoleLine({
			level,
			subsystem,
			message: consoleSettings.style === "json" ? message : consoleMessage,
			style: consoleSettings.style,
			meta: fileMeta
		}));
	};
	const isConsoleEnabled = (level) => {
		return shouldLogToConsole(level, { level: getConsoleSettings().level }) && shouldLogSubsystemToConsole(subsystem);
	};
	const isFileEnabled = (level) => isFileLogLevelEnabled(level);
	return {
		subsystem,
		isEnabled: (level, target = "any") => {
			if (target === "console") return isConsoleEnabled(level);
			if (target === "file") return isFileEnabled(level);
			return isConsoleEnabled(level) || isFileEnabled(level);
		},
		trace: (message, meta) => emit("trace", message, meta),
		debug: (message, meta) => emit("debug", message, meta),
		info: (message, meta) => emit("info", message, meta),
		warn: (message, meta) => emit("warn", message, meta),
		error: (message, meta) => emit("error", message, meta),
		fatal: (message, meta) => emit("fatal", message, meta),
		raw: (message) => {
			logToFile(getFileLogger(), "info", message, { raw: true });
			if (shouldLogSubsystemToConsole(subsystem)) {
				if (!isVerbose() && subsystem === "agent/embedded" && /(sessionId|runId)=probe-/.test(message)) return;
				writeConsoleLine("info", message);
			}
		},
		child: (name) => createSubsystemLogger(`${subsystem}/${name}`)
	};
}

//#endregion
//#region src/logger.ts
const subsystemPrefixRe = /^([a-z][a-z0-9-]{1,20}):\s+(.*)$/i;
function splitSubsystem(message) {
	const match = message.match(subsystemPrefixRe);
	if (!match) return null;
	const [, subsystem, rest] = match;
	return {
		subsystem,
		rest
	};
}
function logInfo(message, runtime = defaultRuntime) {
	const parsed = runtime === defaultRuntime ? splitSubsystem(message) : null;
	if (parsed) {
		createSubsystemLogger(parsed.subsystem).info(parsed.rest);
		return;
	}
	runtime.log(info(message));
	getLogger().info(message);
}
function logWarn(message, runtime = defaultRuntime) {
	const parsed = runtime === defaultRuntime ? splitSubsystem(message) : null;
	if (parsed) {
		createSubsystemLogger(parsed.subsystem).warn(parsed.rest);
		return;
	}
	runtime.log(warn(message));
	getLogger().warn(message);
}
function logError(message, runtime = defaultRuntime) {
	const parsed = runtime === defaultRuntime ? splitSubsystem(message) : null;
	if (parsed) {
		createSubsystemLogger(parsed.subsystem).error(parsed.rest);
		return;
	}
	runtime.error(danger(message));
	getLogger().error(message);
}
function logDebug(message) {
	getLogger().debug(message);
	logVerboseConsole(message);
}

//#endregion
//#region src/process/spawn-utils.ts
const DEFAULT_RETRY_CODES = ["EBADF"];
function resolveCommandStdio(params) {
	return [
		params.hasInput ? "pipe" : params.preferInherit ? "inherit" : "pipe",
		"pipe",
		"pipe"
	];
}
function formatSpawnError(err) {
	if (!(err instanceof Error)) return String(err);
	const details = err;
	const parts = [];
	const message = err.message?.trim();
	if (message) parts.push(message);
	if (details.code && !message?.includes(details.code)) parts.push(details.code);
	if (details.syscall) parts.push(`syscall=${details.syscall}`);
	if (typeof details.errno === "number") parts.push(`errno=${details.errno}`);
	return parts.join(" ");
}
function shouldRetry(err, codes) {
	const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
	return code.length > 0 && codes.includes(code);
}
async function spawnAndWaitForSpawn(spawnImpl, argv, options) {
	const child = spawnImpl(argv[0], argv.slice(1), options);
	return await new Promise((resolve, reject) => {
		let settled = false;
		const cleanup = () => {
			child.removeListener("error", onError);
			child.removeListener("spawn", onSpawn);
		};
		const finishResolve = () => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve(child);
		};
		const onError = (err) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(err);
		};
		const onSpawn = () => {
			finishResolve();
		};
		child.once("error", onError);
		child.once("spawn", onSpawn);
		process.nextTick(() => {
			if (typeof child.pid === "number") finishResolve();
		});
	});
}
async function spawnWithFallback(params) {
	const spawnImpl = params.spawnImpl ?? spawn;
	const retryCodes = params.retryCodes ?? DEFAULT_RETRY_CODES;
	const baseOptions = { ...params.options };
	const fallbacks = params.fallbacks ?? [];
	const attempts = [{ options: baseOptions }, ...fallbacks.map((fallback) => ({
		label: fallback.label,
		options: {
			...baseOptions,
			...fallback.options
		}
	}))];
	let lastError;
	for (let index = 0; index < attempts.length; index += 1) {
		const attempt = attempts[index];
		try {
			return {
				child: await spawnAndWaitForSpawn(spawnImpl, params.argv, attempt.options),
				usedFallback: index > 0,
				fallbackLabel: attempt.label
			};
		} catch (err) {
			lastError = err;
			const nextFallback = fallbacks[index];
			if (!nextFallback || !shouldRetry(err, retryCodes)) throw err;
			params.onFallback?.(err, nextFallback);
		}
	}
	throw lastError;
}

//#endregion
//#region src/process/exec.ts
const execFileAsync = promisify(execFile);
/**
* Resolves a command for Windows compatibility.
* On Windows, non-.exe commands (like npm, pnpm) require their .cmd extension.
*/
function resolveCommand(command) {
	if (process.platform !== "win32") return command;
	const basename = path.basename(command).toLowerCase();
	if (path.extname(basename)) return command;
	if ([
		"npm",
		"pnpm",
		"yarn",
		"npx"
	].includes(basename)) return `${command}.cmd`;
	return command;
}
async function runExec(command, args, opts = 1e4) {
	const options = typeof opts === "number" ? {
		timeout: opts,
		encoding: "utf8"
	} : {
		timeout: opts.timeoutMs,
		maxBuffer: opts.maxBuffer,
		encoding: "utf8"
	};
	try {
		const { stdout, stderr } = await execFileAsync(resolveCommand(command), args, options);
		if (shouldLogVerbose()) {
			if (stdout.trim()) logDebug(stdout.trim());
			if (stderr.trim()) logError(stderr.trim());
		}
		return {
			stdout,
			stderr
		};
	} catch (err) {
		if (shouldLogVerbose()) logError(danger(`Command failed: ${command} ${args.join(" ")}`));
		throw err;
	}
}
async function runCommandWithTimeout(argv, optionsOrTimeout) {
	const options = typeof optionsOrTimeout === "number" ? { timeoutMs: optionsOrTimeout } : optionsOrTimeout;
	const { timeoutMs, cwd, input, env } = options;
	const { windowsVerbatimArguments } = options;
	const hasInput = input !== void 0;
	const shouldSuppressNpmFund = (() => {
		const cmd = path.basename(argv[0] ?? "");
		if (cmd === "npm" || cmd === "npm.cmd" || cmd === "npm.exe") return true;
		if (cmd === "node" || cmd === "node.exe") return (argv[1] ?? "").includes("npm-cli.js");
		return false;
	})();
	const mergedEnv = env ? {
		...process.env,
		...env
	} : { ...process.env };
	const resolvedEnv = Object.fromEntries(Object.entries(mergedEnv).filter(([, value]) => value !== void 0).map(([key, value]) => [key, String(value)]));
	if (shouldSuppressNpmFund) {
		if (resolvedEnv.NPM_CONFIG_FUND == null) resolvedEnv.NPM_CONFIG_FUND = "false";
		if (resolvedEnv.npm_config_fund == null) resolvedEnv.npm_config_fund = "false";
	}
	const stdio = resolveCommandStdio({
		hasInput,
		preferInherit: true
	});
	const resolvedCommand = resolveCommand(argv[0] ?? "");
	const commandExt = path.extname(resolvedCommand).toLowerCase();
	const useShell = process.platform === "win32" && commandExt !== ".exe";
	const child = spawn(resolvedCommand, argv.slice(1), {
		stdio,
		cwd,
		env: resolvedEnv,
		windowsVerbatimArguments,
		shell: useShell
	});
	return await new Promise((resolve, reject) => {
		let stdout = "";
		let stderr = "";
		let settled = false;
		const timer = setTimeout(() => {
			if (typeof child.kill === "function") child.kill("SIGKILL");
		}, timeoutMs);
		if (hasInput && child.stdin) {
			child.stdin.write(input ?? "");
			child.stdin.end();
		}
		child.stdout?.on("data", (d) => {
			stdout += d.toString();
		});
		child.stderr?.on("data", (d) => {
			stderr += d.toString();
		});
		child.on("error", (err) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			reject(err);
		});
		child.on("close", (code, signal) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve({
				stdout,
				stderr,
				code,
				signal,
				killed: child.killed
			});
		});
	});
}

//#endregion
export { success as $, escapeRegExp as A, resolveUserPath as B, requireActivePluginRegistry as C, clampInt as D, clamp as E, jidToE164 as F, sliceUtf16Safe as G, shortenHomeInString as H, normalizeE164 as I, danger as J, toWhatsappJid as K, pathExists as L, isPlainObject as M, isRecord as N, clampNumber as O, isSelfChatMode as P, shouldLogVerbose as Q, resolveConfigDir as R, getActivePluginRegistry as S, CONFIG_DIR as T, shortenHomePath as U, safeParseJson as V, sleep as W, logVerbose as X, info as Y, setVerbose as Z, DEFAULT_CHAT_CHANNEL as _, logDebug as a, toPinoLikeLogger as at, normalizeChannelId as b, logWarn as c, defaultRuntime as d, warn as et, clearActiveProgressLine as f, CHAT_CHANNEL_ORDER as g, CHANNEL_IDS as h, spawnWithFallback as i, getChildLogger as it, formatTerminalLink as j, ensureDir as k, createSubsystemLogger as l, unregisterActiveProgressLine as m, runExec as n, isRich as nt, logError as o, normalizeLogLevel as ot, registerActiveProgressLine as p, truncateUtf16Safe as q, formatSpawnError as r, theme as rt, logInfo as s, resolvePreferredOpenClawTmpDir as st, runCommandWithTimeout as t, colorize as tt, createNonExitingRuntime as u, getChatChannelMeta as v, setActivePluginRegistry as w, normalizeChatChannelId as x, normalizeAnyChannelId as y, resolveJidToE164 as z };