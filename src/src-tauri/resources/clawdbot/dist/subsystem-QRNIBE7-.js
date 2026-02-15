import { o as resolveConfigPath } from "./paths-DVBShlw6.js";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Logger } from "tslog";
import JSON5 from "json5";
import chalk, { Chalk } from "chalk";
import util from "node:util";

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
function getResolvedLoggerSettings() {
	return resolveSettings();
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
let globalYes = false;
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
function isYes() {
	return globalYes;
}
const success = theme.success;
const warn = theme.warn;
const info = theme.info;
const danger = theme.error;

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
function listChatChannels() {
	return CHAT_CHANNEL_ORDER.map((id) => CHAT_CHANNEL_META[id]);
}
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
function formatChannelPrimerLine(meta) {
	return `${meta.label}: ${meta.blurb}`;
}
function formatChannelSelectionLine(meta, docsLink) {
	const docsPrefix = meta.selectionDocsPrefix ?? "Docs:";
	const docsLabel = meta.docsLabel ?? meta.id;
	const docs = meta.selectionDocsOmitLabel ? docsLink(meta.docsPath) : docsLink(meta.docsPath, docsLabel);
	const extras = (meta.selectionExtras ?? []).filter(Boolean).join(" ");
	return `${meta.label} — ${meta.blurb} ${docsPrefix ? `${docsPrefix} ` : ""}${docs}${extras ? ` ${extras}` : ""}`;
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
function stripAnsi(input) {
	return input.replace(OSC8_REGEX, "").replace(ANSI_REGEX, "");
}
function visibleWidth(input) {
	return Array.from(stripAnsi(input)).length;
}

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
function routeLogsToStderr() {
	loggingState.forceConsoleToStderr = true;
}
function setConsoleSubsystemFilter(filters) {
	if (!filters || filters.length === 0) {
		loggingState.consoleSubsystemFilter = null;
		return;
	}
	const normalized = filters.map((value) => value.trim()).filter((value) => value.length > 0);
	loggingState.consoleSubsystemFilter = normalized.length > 0 ? normalized : null;
}
function setConsoleTimestampPrefix(enabled) {
	loggingState.consoleTimestampPrefix = enabled;
}
function shouldLogSubsystemToConsole(subsystem) {
	const filter = loggingState.consoleSubsystemFilter;
	if (!filter || filter.length === 0) return true;
	return filter.some((prefix) => subsystem === prefix || subsystem.startsWith(`${prefix}/`));
}
const SUPPRESSED_CONSOLE_PREFIXES = [
	"Closing session:",
	"Opening session:",
	"Removing old closed session:",
	"Session already closed",
	"Session already open"
];
function shouldSuppressConsoleMessage(message) {
	if (isVerbose()) return false;
	if (SUPPRESSED_CONSOLE_PREFIXES.some((prefix) => message.startsWith(prefix))) return true;
	if (message.startsWith("[EventQueue] Slow listener detected") && message.includes("DiscordMessageListener")) return true;
	return false;
}
function isEpipeError(err) {
	const code = err?.code;
	return code === "EPIPE" || code === "EIO";
}
function formatConsoleTimestamp(style) {
	const now = /* @__PURE__ */ new Date();
	if (style === "pretty") return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const h = String(now.getHours()).padStart(2, "0");
	const m = String(now.getMinutes()).padStart(2, "0");
	const s = String(now.getSeconds()).padStart(2, "0");
	const ms = String(now.getMilliseconds()).padStart(3, "0");
	const tzOffset = now.getTimezoneOffset();
	return `${year}-${month}-${day}T${h}:${m}:${s}.${ms}${tzOffset <= 0 ? "+" : "-"}${String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, "0")}:${String(Math.abs(tzOffset) % 60).padStart(2, "0")}`;
}
function hasTimestampPrefix(value) {
	return /^(?:\d{2}:\d{2}:\d{2}|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)/.test(value);
}
function isJsonPayload(value) {
	const trimmed = value.trim();
	if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return false;
	try {
		JSON.parse(trimmed);
		return true;
	} catch {
		return false;
	}
}
/**
* Route console.* calls through file logging while still emitting to stdout/stderr.
* This keeps user-facing output unchanged but guarantees every console call is captured in log files.
*/
function enableConsoleCapture() {
	if (loggingState.consolePatched) return;
	loggingState.consolePatched = true;
	if (!loggingState.streamErrorHandlersInstalled) {
		loggingState.streamErrorHandlersInstalled = true;
		for (const stream of [process.stdout, process.stderr]) stream.on("error", (err) => {
			if (isEpipeError(err)) return;
			throw err;
		});
	}
	let logger = null;
	const getLoggerLazy = () => {
		if (!logger) logger = getLogger();
		return logger;
	};
	const original = {
		log: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error,
		debug: console.debug,
		trace: console.trace
	};
	loggingState.rawConsole = {
		log: original.log,
		info: original.info,
		warn: original.warn,
		error: original.error
	};
	const forward = (level, orig) => (...args) => {
		const formatted = util.format(...args);
		if (shouldSuppressConsoleMessage(formatted)) return;
		const trimmed = stripAnsi(formatted).trimStart();
		const timestamp = loggingState.consoleTimestampPrefix && trimmed.length > 0 && !hasTimestampPrefix(trimmed) && !isJsonPayload(trimmed) ? formatConsoleTimestamp(getConsoleSettings().style) : "";
		try {
			const resolvedLogger = getLoggerLazy();
			if (level === "trace") resolvedLogger.trace(formatted);
			else if (level === "debug") resolvedLogger.debug(formatted);
			else if (level === "info") resolvedLogger.info(formatted);
			else if (level === "warn") resolvedLogger.warn(formatted);
			else if (level === "error" || level === "fatal") resolvedLogger.error(formatted);
			else resolvedLogger.info(formatted);
		} catch {}
		if (loggingState.forceConsoleToStderr) try {
			const line = timestamp ? `${timestamp} ${formatted}` : formatted;
			process.stderr.write(`${line}\n`);
		} catch (err) {
			if (isEpipeError(err)) return;
			throw err;
		}
		else try {
			if (!timestamp) {
				orig.apply(console, args);
				return;
			}
			if (args.length === 0) {
				orig.call(console, timestamp);
				return;
			}
			if (typeof args[0] === "string") {
				orig.call(console, `${timestamp} ${args[0]}`, ...args.slice(1));
				return;
			}
			orig.call(console, timestamp, ...args);
		} catch (err) {
			if (isEpipeError(err)) return;
			throw err;
		}
	};
	console.log = forward("info", original.log);
	console.info = forward("info", original.info);
	console.warn = forward("warn", original.warn);
	console.error = forward("error", original.error);
	console.debug = forward("debug", original.debug);
	console.trace = forward("trace", original.trace);
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
function runtimeForLogger(logger, exit = defaultRuntime.exit) {
	return {
		log: (message) => logger.info(message),
		error: (message) => logger.error(message),
		exit
	};
}

//#endregion
export { isVerbose as A, theme as B, normalizeChannelId as C, setActivePluginRegistry as D, requireActivePluginRegistry as E, shouldLogVerbose as F, normalizeLogLevel as G, getLogger as H, success as I, resolvePreferredOpenClawTmpDir as K, warn as L, logVerbose as M, logVerboseConsole as N, danger as O, setVerbose as P, colorize as R, normalizeAnyChannelId as S, getActivePluginRegistry as T, getResolvedLoggerSettings as U, getChildLogger as V, toPinoLikeLogger as W, DEFAULT_CHAT_CHANNEL as _, setConsoleSubsystemFilter as a, getChatChannelMeta as b, visibleWidth as c, restoreTerminalState as d, clearActiveProgressLine as f, CHAT_CHANNEL_ORDER as g, CHANNEL_IDS as h, routeLogsToStderr as i, isYes as j, info as k, createNonExitingRuntime as l, unregisterActiveProgressLine as m, runtimeForLogger as n, setConsoleTimestampPrefix as o, registerActiveProgressLine as p, enableConsoleCapture as r, shouldLogSubsystemToConsole as s, createSubsystemLogger as t, defaultRuntime as u, formatChannelPrimerLine as v, normalizeChatChannelId as w, listChatChannels as x, formatChannelSelectionLine as y, isRich as z };