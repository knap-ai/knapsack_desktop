import { n as DEFAULT_AGENT_ID } from "./session-key-BWxPj0z_.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";

//#region src/infra/exec-approvals-analysis.ts
const DEFAULT_SAFE_BINS = [
	"jq",
	"grep",
	"cut",
	"sort",
	"uniq",
	"head",
	"tail",
	"tr",
	"wc"
];
function expandHome$1(value) {
	if (!value) return value;
	if (value === "~") return os.homedir();
	if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
	return value;
}
function isExecutableFile(filePath) {
	try {
		if (!fs.statSync(filePath).isFile()) return false;
		if (process.platform !== "win32") fs.accessSync(filePath, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
function resolveExecutablePath(rawExecutable, cwd, env) {
	const expanded = rawExecutable.startsWith("~") ? expandHome$1(rawExecutable) : rawExecutable;
	if (expanded.includes("/") || expanded.includes("\\")) {
		if (path.isAbsolute(expanded)) return isExecutableFile(expanded) ? expanded : void 0;
		const base = cwd && cwd.trim() ? cwd.trim() : process.cwd();
		const candidate = path.resolve(base, expanded);
		return isExecutableFile(candidate) ? candidate : void 0;
	}
	const entries = (env?.PATH ?? env?.Path ?? process.env.PATH ?? process.env.Path ?? "").split(path.delimiter).filter(Boolean);
	const hasExtension = process.platform === "win32" && path.extname(expanded).length > 0;
	const extensions = process.platform === "win32" ? hasExtension ? [""] : (env?.PATHEXT ?? env?.Pathext ?? process.env.PATHEXT ?? process.env.Pathext ?? ".EXE;.CMD;.BAT;.COM").split(";").map((ext) => ext.toLowerCase()) : [""];
	for (const entry of entries) for (const ext of extensions) {
		const candidate = path.join(entry, expanded + ext);
		if (isExecutableFile(candidate)) return candidate;
	}
}
function resolveCommandResolutionFromArgv(argv, cwd, env) {
	const rawExecutable = argv[0]?.trim();
	if (!rawExecutable) return null;
	const resolvedPath = resolveExecutablePath(rawExecutable, cwd, env);
	return {
		rawExecutable,
		resolvedPath,
		executableName: resolvedPath ? path.basename(resolvedPath) : rawExecutable
	};
}
function normalizeMatchTarget(value) {
	if (process.platform === "win32") return value.replace(/^\\\\[?.]\\/, "").replace(/\\/g, "/").toLowerCase();
	return value.replace(/\\\\/g, "/").toLowerCase();
}
function tryRealpath(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return null;
	}
}
function globToRegExp(pattern) {
	let regex = "^";
	let i = 0;
	while (i < pattern.length) {
		const ch = pattern[i];
		if (ch === "*") {
			if (pattern[i + 1] === "*") {
				regex += ".*";
				i += 2;
				continue;
			}
			regex += "[^/]*";
			i += 1;
			continue;
		}
		if (ch === "?") {
			regex += ".";
			i += 1;
			continue;
		}
		regex += ch.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&");
		i += 1;
	}
	regex += "$";
	return new RegExp(regex, "i");
}
function matchesPattern(pattern, target) {
	const trimmed = pattern.trim();
	if (!trimmed) return false;
	const expanded = trimmed.startsWith("~") ? expandHome$1(trimmed) : trimmed;
	const hasWildcard = /[*?]/.test(expanded);
	let normalizedPattern = expanded;
	let normalizedTarget = target;
	if (process.platform === "win32" && !hasWildcard) {
		normalizedPattern = tryRealpath(expanded) ?? expanded;
		normalizedTarget = tryRealpath(target) ?? target;
	}
	normalizedPattern = normalizeMatchTarget(normalizedPattern);
	normalizedTarget = normalizeMatchTarget(normalizedTarget);
	return globToRegExp(normalizedPattern).test(normalizedTarget);
}
function resolveAllowlistCandidatePath(resolution, cwd) {
	if (!resolution) return;
	if (resolution.resolvedPath) return resolution.resolvedPath;
	const raw = resolution.rawExecutable?.trim();
	if (!raw) return;
	const expanded = raw.startsWith("~") ? expandHome$1(raw) : raw;
	if (!expanded.includes("/") && !expanded.includes("\\")) return;
	if (path.isAbsolute(expanded)) return expanded;
	const base = cwd && cwd.trim() ? cwd.trim() : process.cwd();
	return path.resolve(base, expanded);
}
function matchAllowlist(entries, resolution) {
	if (!entries.length || !resolution?.resolvedPath) return null;
	const resolvedPath = resolution.resolvedPath;
	for (const entry of entries) {
		const pattern = entry.pattern?.trim();
		if (!pattern) continue;
		if (!(pattern.includes("/") || pattern.includes("\\") || pattern.includes("~"))) continue;
		if (matchesPattern(pattern, resolvedPath)) return entry;
	}
	return null;
}
const DISALLOWED_PIPELINE_TOKENS = new Set([
	">",
	"<",
	"`",
	"\n",
	"\r",
	"(",
	")"
]);
const DOUBLE_QUOTE_ESCAPES = new Set([
	"\\",
	"\"",
	"$",
	"`",
	"\n",
	"\r"
]);
const WINDOWS_UNSUPPORTED_TOKENS = new Set([
	"&",
	"|",
	"<",
	">",
	"^",
	"(",
	")",
	"%",
	"!",
	"\n",
	"\r"
]);
function isDoubleQuoteEscape(next) {
	return Boolean(next && DOUBLE_QUOTE_ESCAPES.has(next));
}
function splitShellPipeline(command) {
	const parseHeredocDelimiter = (source, start) => {
		let i = start;
		while (i < source.length && (source[i] === " " || source[i] === "	")) i += 1;
		if (i >= source.length) return null;
		const first = source[i];
		if (first === "'" || first === "\"") {
			const quote = first;
			i += 1;
			let delimiter = "";
			while (i < source.length) {
				const ch = source[i];
				if (ch === "\n" || ch === "\r") return null;
				if (quote === "\"" && ch === "\\" && i + 1 < source.length) {
					delimiter += source[i + 1];
					i += 2;
					continue;
				}
				if (ch === quote) return {
					delimiter,
					end: i + 1
				};
				delimiter += ch;
				i += 1;
			}
			return null;
		}
		let delimiter = "";
		while (i < source.length) {
			const ch = source[i];
			if (/\s/.test(ch) || ch === "|" || ch === "&" || ch === ";" || ch === "<" || ch === ">") break;
			delimiter += ch;
			i += 1;
		}
		if (!delimiter) return null;
		return {
			delimiter,
			end: i
		};
	};
	const segments = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let emptySegment = false;
	const pendingHeredocs = [];
	let inHeredocBody = false;
	let heredocLine = "";
	const pushPart = () => {
		const trimmed = buf.trim();
		if (trimmed) segments.push(trimmed);
		buf = "";
	};
	for (let i = 0; i < command.length; i += 1) {
		const ch = command[i];
		const next = command[i + 1];
		if (inHeredocBody) {
			if (ch === "\n" || ch === "\r") {
				const current = pendingHeredocs[0];
				if (current) {
					if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) pendingHeredocs.shift();
				}
				heredocLine = "";
				if (pendingHeredocs.length === 0) inHeredocBody = false;
				if (ch === "\r" && next === "\n") i += 1;
			} else heredocLine += ch;
			continue;
		}
		if (escaped) {
			buf += ch;
			escaped = false;
			emptySegment = false;
			continue;
		}
		if (!inSingle && !inDouble && ch === "\\") {
			escaped = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (inSingle) {
			if (ch === "'") inSingle = false;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (inDouble) {
			if (ch === "\\" && isDoubleQuoteEscape(next)) {
				buf += ch;
				buf += next;
				i += 1;
				emptySegment = false;
				continue;
			}
			if (ch === "$" && next === "(") return {
				ok: false,
				reason: "unsupported shell token: $()",
				segments: []
			};
			if (ch === "`") return {
				ok: false,
				reason: "unsupported shell token: `",
				segments: []
			};
			if (ch === "\n" || ch === "\r") return {
				ok: false,
				reason: "unsupported shell token: newline",
				segments: []
			};
			if (ch === "\"") inDouble = false;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (ch === "\"") {
			inDouble = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if ((ch === "\n" || ch === "\r") && pendingHeredocs.length > 0) {
			inHeredocBody = true;
			heredocLine = "";
			if (ch === "\r" && next === "\n") i += 1;
			continue;
		}
		if (ch === "|" && next === "|") return {
			ok: false,
			reason: "unsupported shell token: ||",
			segments: []
		};
		if (ch === "|" && next === "&") return {
			ok: false,
			reason: "unsupported shell token: |&",
			segments: []
		};
		if (ch === "|") {
			emptySegment = true;
			pushPart();
			continue;
		}
		if (ch === "&" || ch === ";") return {
			ok: false,
			reason: `unsupported shell token: ${ch}`,
			segments: []
		};
		if (ch === "<" && next === "<") {
			buf += "<<";
			emptySegment = false;
			i += 1;
			let scanIndex = i + 1;
			let stripTabs = false;
			if (command[scanIndex] === "-") {
				stripTabs = true;
				buf += "-";
				scanIndex += 1;
			}
			const parsed = parseHeredocDelimiter(command, scanIndex);
			if (parsed) {
				pendingHeredocs.push({
					delimiter: parsed.delimiter,
					stripTabs
				});
				buf += command.slice(scanIndex, parsed.end);
				i = parsed.end - 1;
			}
			continue;
		}
		if (DISALLOWED_PIPELINE_TOKENS.has(ch)) return {
			ok: false,
			reason: `unsupported shell token: ${ch}`,
			segments: []
		};
		if (ch === "$" && next === "(") return {
			ok: false,
			reason: "unsupported shell token: $()",
			segments: []
		};
		buf += ch;
		emptySegment = false;
	}
	if (inHeredocBody && pendingHeredocs.length > 0) {
		const current = pendingHeredocs[0];
		if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) pendingHeredocs.shift();
	}
	if (escaped || inSingle || inDouble) return {
		ok: false,
		reason: "unterminated shell quote/escape",
		segments: []
	};
	pushPart();
	if (emptySegment || segments.length === 0) return {
		ok: false,
		reason: segments.length === 0 ? "empty command" : "empty pipeline segment",
		segments: []
	};
	return {
		ok: true,
		segments
	};
}
function findWindowsUnsupportedToken(command) {
	for (const ch of command) if (WINDOWS_UNSUPPORTED_TOKENS.has(ch)) {
		if (ch === "\n" || ch === "\r") return "newline";
		return ch;
	}
	return null;
}
function tokenizeWindowsSegment(segment) {
	const tokens = [];
	let buf = "";
	let inDouble = false;
	const pushToken = () => {
		if (buf.length > 0) {
			tokens.push(buf);
			buf = "";
		}
	};
	for (let i = 0; i < segment.length; i += 1) {
		const ch = segment[i];
		if (ch === "\"") {
			inDouble = !inDouble;
			continue;
		}
		if (!inDouble && /\s/.test(ch)) {
			pushToken();
			continue;
		}
		buf += ch;
	}
	if (inDouble) return null;
	pushToken();
	return tokens.length > 0 ? tokens : null;
}
function analyzeWindowsShellCommand(params) {
	const unsupported = findWindowsUnsupportedToken(params.command);
	if (unsupported) return {
		ok: false,
		reason: `unsupported windows shell token: ${unsupported}`,
		segments: []
	};
	const argv = tokenizeWindowsSegment(params.command);
	if (!argv || argv.length === 0) return {
		ok: false,
		reason: "unable to parse windows command",
		segments: []
	};
	return {
		ok: true,
		segments: [{
			raw: params.command,
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, params.cwd, params.env)
		}]
	};
}
function isWindowsPlatform(platform) {
	return String(platform ?? "").trim().toLowerCase().startsWith("win");
}
function tokenizeShellSegment(segment) {
	const tokens = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	const pushToken = () => {
		if (buf.length > 0) {
			tokens.push(buf);
			buf = "";
		}
	};
	for (let i = 0; i < segment.length; i += 1) {
		const ch = segment[i];
		if (escaped) {
			buf += ch;
			escaped = false;
			continue;
		}
		if (!inSingle && !inDouble && ch === "\\") {
			escaped = true;
			continue;
		}
		if (inSingle) {
			if (ch === "'") inSingle = false;
			else buf += ch;
			continue;
		}
		if (inDouble) {
			const next = segment[i + 1];
			if (ch === "\\" && isDoubleQuoteEscape(next)) {
				buf += next;
				i += 1;
				continue;
			}
			if (ch === "\"") inDouble = false;
			else buf += ch;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			continue;
		}
		if (ch === "\"") {
			inDouble = true;
			continue;
		}
		if (/\s/.test(ch)) {
			pushToken();
			continue;
		}
		buf += ch;
	}
	if (escaped || inSingle || inDouble) return null;
	pushToken();
	return tokens;
}
function parseSegmentsFromParts(parts, cwd, env) {
	const segments = [];
	for (const raw of parts) {
		const argv = tokenizeShellSegment(raw);
		if (!argv || argv.length === 0) return null;
		segments.push({
			raw,
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, cwd, env)
		});
	}
	return segments;
}
/**
* Splits a command string by chain operators (&&, ||, ;) while respecting quotes.
* Returns null when no chain is present or when the chain is malformed.
*/
function splitCommandChain(command) {
	const parts = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let foundChain = false;
	let invalidChain = false;
	const pushPart = () => {
		const trimmed = buf.trim();
		if (trimmed) {
			parts.push(trimmed);
			buf = "";
			return true;
		}
		buf = "";
		return false;
	};
	for (let i = 0; i < command.length; i += 1) {
		const ch = command[i];
		const next = command[i + 1];
		if (escaped) {
			buf += ch;
			escaped = false;
			continue;
		}
		if (!inSingle && !inDouble && ch === "\\") {
			escaped = true;
			buf += ch;
			continue;
		}
		if (inSingle) {
			if (ch === "'") inSingle = false;
			buf += ch;
			continue;
		}
		if (inDouble) {
			if (ch === "\\" && isDoubleQuoteEscape(next)) {
				buf += ch;
				buf += next;
				i += 1;
				continue;
			}
			if (ch === "\"") inDouble = false;
			buf += ch;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			buf += ch;
			continue;
		}
		if (ch === "\"") {
			inDouble = true;
			buf += ch;
			continue;
		}
		if (ch === "&" && command[i + 1] === "&") {
			if (!pushPart()) invalidChain = true;
			i += 1;
			foundChain = true;
			continue;
		}
		if (ch === "|" && command[i + 1] === "|") {
			if (!pushPart()) invalidChain = true;
			i += 1;
			foundChain = true;
			continue;
		}
		if (ch === ";") {
			if (!pushPart()) invalidChain = true;
			foundChain = true;
			continue;
		}
		buf += ch;
	}
	const pushedFinal = pushPart();
	if (!foundChain) return null;
	if (invalidChain || !pushedFinal) return null;
	return parts.length > 0 ? parts : null;
}
function analyzeShellCommand(params) {
	if (isWindowsPlatform(params.platform)) return analyzeWindowsShellCommand(params);
	const chainParts = splitCommandChain(params.command);
	if (chainParts) {
		const chains = [];
		const allSegments = [];
		for (const part of chainParts) {
			const pipelineSplit = splitShellPipeline(part);
			if (!pipelineSplit.ok) return {
				ok: false,
				reason: pipelineSplit.reason,
				segments: []
			};
			const segments = parseSegmentsFromParts(pipelineSplit.segments, params.cwd, params.env);
			if (!segments) return {
				ok: false,
				reason: "unable to parse shell segment",
				segments: []
			};
			chains.push(segments);
			allSegments.push(...segments);
		}
		return {
			ok: true,
			segments: allSegments,
			chains
		};
	}
	const split = splitShellPipeline(params.command);
	if (!split.ok) return {
		ok: false,
		reason: split.reason,
		segments: []
	};
	const segments = parseSegmentsFromParts(split.segments, params.cwd, params.env);
	if (!segments) return {
		ok: false,
		reason: "unable to parse shell segment",
		segments: []
	};
	return {
		ok: true,
		segments
	};
}
function analyzeArgvCommand(params) {
	const argv = params.argv.filter((entry) => entry.trim().length > 0);
	if (argv.length === 0) return {
		ok: false,
		reason: "empty argv",
		segments: []
	};
	return {
		ok: true,
		segments: [{
			raw: argv.join(" "),
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, params.cwd, params.env)
		}]
	};
}

//#endregion
//#region src/infra/exec-approvals-allowlist.ts
function isPathLikeToken(value) {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (trimmed === "-") return false;
	if (trimmed.startsWith("./") || trimmed.startsWith("../") || trimmed.startsWith("~")) return true;
	if (trimmed.startsWith("/")) return true;
	return /^[A-Za-z]:[\\/]/.test(trimmed);
}
function defaultFileExists(filePath) {
	try {
		return fs.existsSync(filePath);
	} catch {
		return false;
	}
}
function normalizeSafeBins(entries) {
	if (!Array.isArray(entries)) return /* @__PURE__ */ new Set();
	const normalized = entries.map((entry) => entry.trim().toLowerCase()).filter((entry) => entry.length > 0);
	return new Set(normalized);
}
function resolveSafeBins(entries) {
	if (entries === void 0) return normalizeSafeBins(DEFAULT_SAFE_BINS);
	return normalizeSafeBins(entries ?? []);
}
function isSafeBinUsage(params) {
	if (params.safeBins.size === 0) return false;
	const resolution = params.resolution;
	const execName = resolution?.executableName?.toLowerCase();
	if (!execName) return false;
	if (!(params.safeBins.has(execName) || process.platform === "win32" && params.safeBins.has(path.parse(execName).name))) return false;
	if (!resolution?.resolvedPath) return false;
	const cwd = params.cwd ?? process.cwd();
	const exists = params.fileExists ?? defaultFileExists;
	const argv = params.argv.slice(1);
	for (let i = 0; i < argv.length; i += 1) {
		const token = argv[i];
		if (!token) continue;
		if (token === "-") continue;
		if (token.startsWith("-")) {
			const eqIndex = token.indexOf("=");
			if (eqIndex > 0) {
				const value = token.slice(eqIndex + 1);
				if (value && (isPathLikeToken(value) || exists(path.resolve(cwd, value)))) return false;
			}
			continue;
		}
		if (isPathLikeToken(token)) return false;
		if (exists(path.resolve(cwd, token))) return false;
	}
	return true;
}
function evaluateSegments(segments, params) {
	const matches = [];
	const allowSkills = params.autoAllowSkills === true && (params.skillBins?.size ?? 0) > 0;
	return {
		satisfied: segments.every((segment) => {
			const candidatePath = resolveAllowlistCandidatePath(segment.resolution, params.cwd);
			const candidateResolution = candidatePath && segment.resolution ? {
				...segment.resolution,
				resolvedPath: candidatePath
			} : segment.resolution;
			const match = matchAllowlist(params.allowlist, candidateResolution);
			if (match) matches.push(match);
			const safe = isSafeBinUsage({
				argv: segment.argv,
				resolution: segment.resolution,
				safeBins: params.safeBins,
				cwd: params.cwd
			});
			const skillAllow = allowSkills && segment.resolution?.executableName ? params.skillBins?.has(segment.resolution.executableName) : false;
			return Boolean(match || safe || skillAllow);
		}),
		matches
	};
}
function evaluateExecAllowlist(params) {
	const allowlistMatches = [];
	if (!params.analysis.ok || params.analysis.segments.length === 0) return {
		allowlistSatisfied: false,
		allowlistMatches
	};
	if (params.analysis.chains) {
		for (const chainSegments of params.analysis.chains) {
			const result = evaluateSegments(chainSegments, {
				allowlist: params.allowlist,
				safeBins: params.safeBins,
				cwd: params.cwd,
				skillBins: params.skillBins,
				autoAllowSkills: params.autoAllowSkills
			});
			if (!result.satisfied) return {
				allowlistSatisfied: false,
				allowlistMatches: []
			};
			allowlistMatches.push(...result.matches);
		}
		return {
			allowlistSatisfied: true,
			allowlistMatches
		};
	}
	const result = evaluateSegments(params.analysis.segments, {
		allowlist: params.allowlist,
		safeBins: params.safeBins,
		cwd: params.cwd,
		skillBins: params.skillBins,
		autoAllowSkills: params.autoAllowSkills
	});
	return {
		allowlistSatisfied: result.satisfied,
		allowlistMatches: result.matches
	};
}
/**
* Evaluates allowlist for shell commands (including &&, ||, ;) and returns analysis metadata.
*/
function evaluateShellAllowlist(params) {
	const chainParts = isWindowsPlatform(params.platform) ? null : splitCommandChain(params.command);
	if (!chainParts) {
		const analysis = analyzeShellCommand({
			command: params.command,
			cwd: params.cwd,
			env: params.env,
			platform: params.platform
		});
		if (!analysis.ok) return {
			analysisOk: false,
			allowlistSatisfied: false,
			allowlistMatches: [],
			segments: []
		};
		const evaluation = evaluateExecAllowlist({
			analysis,
			allowlist: params.allowlist,
			safeBins: params.safeBins,
			cwd: params.cwd,
			skillBins: params.skillBins,
			autoAllowSkills: params.autoAllowSkills
		});
		return {
			analysisOk: true,
			allowlistSatisfied: evaluation.allowlistSatisfied,
			allowlistMatches: evaluation.allowlistMatches,
			segments: analysis.segments
		};
	}
	const allowlistMatches = [];
	const segments = [];
	for (const part of chainParts) {
		const analysis = analyzeShellCommand({
			command: part,
			cwd: params.cwd,
			env: params.env,
			platform: params.platform
		});
		if (!analysis.ok) return {
			analysisOk: false,
			allowlistSatisfied: false,
			allowlistMatches: [],
			segments: []
		};
		segments.push(...analysis.segments);
		const evaluation = evaluateExecAllowlist({
			analysis,
			allowlist: params.allowlist,
			safeBins: params.safeBins,
			cwd: params.cwd,
			skillBins: params.skillBins,
			autoAllowSkills: params.autoAllowSkills
		});
		allowlistMatches.push(...evaluation.allowlistMatches);
		if (!evaluation.allowlistSatisfied) return {
			analysisOk: true,
			allowlistSatisfied: false,
			allowlistMatches,
			segments
		};
	}
	return {
		analysisOk: true,
		allowlistSatisfied: true,
		allowlistMatches,
		segments
	};
}

//#endregion
//#region src/infra/exec-approvals.ts
const DEFAULT_SECURITY = "deny";
const DEFAULT_ASK = "on-miss";
const DEFAULT_ASK_FALLBACK = "deny";
const DEFAULT_AUTO_ALLOW_SKILLS = false;
const DEFAULT_SOCKET = "~/.openclaw/exec-approvals.sock";
const DEFAULT_FILE = "~/.openclaw/exec-approvals.json";
function hashExecApprovalsRaw(raw) {
	return crypto.createHash("sha256").update(raw ?? "").digest("hex");
}
function expandHome(value) {
	if (!value) return value;
	if (value === "~") return os.homedir();
	if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
	return value;
}
function resolveExecApprovalsPath() {
	return expandHome(DEFAULT_FILE);
}
function resolveExecApprovalsSocketPath() {
	return expandHome(DEFAULT_SOCKET);
}
function normalizeAllowlistPattern(value) {
	const trimmed = value?.trim() ?? "";
	return trimmed ? trimmed.toLowerCase() : null;
}
function mergeLegacyAgent(current, legacy) {
	const allowlist = [];
	const seen = /* @__PURE__ */ new Set();
	const pushEntry = (entry) => {
		const key = normalizeAllowlistPattern(entry.pattern);
		if (!key || seen.has(key)) return;
		seen.add(key);
		allowlist.push(entry);
	};
	for (const entry of current.allowlist ?? []) pushEntry(entry);
	for (const entry of legacy.allowlist ?? []) pushEntry(entry);
	return {
		security: current.security ?? legacy.security,
		ask: current.ask ?? legacy.ask,
		askFallback: current.askFallback ?? legacy.askFallback,
		autoAllowSkills: current.autoAllowSkills ?? legacy.autoAllowSkills,
		allowlist: allowlist.length > 0 ? allowlist : void 0
	};
}
function ensureDir(filePath) {
	const dir = path.dirname(filePath);
	fs.mkdirSync(dir, { recursive: true });
}
function coerceAllowlistEntries(allowlist) {
	if (!Array.isArray(allowlist) || allowlist.length === 0) return Array.isArray(allowlist) ? allowlist : void 0;
	let changed = false;
	const result = [];
	for (const item of allowlist) if (typeof item === "string") {
		const trimmed = item.trim();
		if (trimmed) {
			result.push({ pattern: trimmed });
			changed = true;
		} else changed = true;
	} else if (item && typeof item === "object" && !Array.isArray(item)) {
		const pattern = item.pattern;
		if (typeof pattern === "string" && pattern.trim().length > 0) result.push(item);
		else changed = true;
	} else changed = true;
	return changed ? result.length > 0 ? result : void 0 : allowlist;
}
function ensureAllowlistIds(allowlist) {
	if (!Array.isArray(allowlist) || allowlist.length === 0) return allowlist;
	let changed = false;
	const next = allowlist.map((entry) => {
		if (entry.id) return entry;
		changed = true;
		return {
			...entry,
			id: crypto.randomUUID()
		};
	});
	return changed ? next : allowlist;
}
function normalizeExecApprovals(file) {
	const socketPath = file.socket?.path?.trim();
	const token = file.socket?.token?.trim();
	const agents = { ...file.agents };
	const legacyDefault = agents.default;
	if (legacyDefault) {
		const main = agents[DEFAULT_AGENT_ID];
		agents[DEFAULT_AGENT_ID] = main ? mergeLegacyAgent(main, legacyDefault) : legacyDefault;
		delete agents.default;
	}
	for (const [key, agent] of Object.entries(agents)) {
		const allowlist = ensureAllowlistIds(coerceAllowlistEntries(agent.allowlist));
		if (allowlist !== agent.allowlist) agents[key] = {
			...agent,
			allowlist
		};
	}
	return {
		version: 1,
		socket: {
			path: socketPath && socketPath.length > 0 ? socketPath : void 0,
			token: token && token.length > 0 ? token : void 0
		},
		defaults: {
			security: file.defaults?.security,
			ask: file.defaults?.ask,
			askFallback: file.defaults?.askFallback,
			autoAllowSkills: file.defaults?.autoAllowSkills
		},
		agents
	};
}
function generateToken() {
	return crypto.randomBytes(24).toString("base64url");
}
function readExecApprovalsSnapshot() {
	const filePath = resolveExecApprovalsPath();
	if (!fs.existsSync(filePath)) return {
		path: filePath,
		exists: false,
		raw: null,
		file: normalizeExecApprovals({
			version: 1,
			agents: {}
		}),
		hash: hashExecApprovalsRaw(null)
	};
	const raw = fs.readFileSync(filePath, "utf8");
	let parsed = null;
	try {
		parsed = JSON.parse(raw);
	} catch {
		parsed = null;
	}
	return {
		path: filePath,
		exists: true,
		raw,
		file: parsed?.version === 1 ? normalizeExecApprovals(parsed) : normalizeExecApprovals({
			version: 1,
			agents: {}
		}),
		hash: hashExecApprovalsRaw(raw)
	};
}
function loadExecApprovals() {
	const filePath = resolveExecApprovalsPath();
	try {
		if (!fs.existsSync(filePath)) return normalizeExecApprovals({
			version: 1,
			agents: {}
		});
		const raw = fs.readFileSync(filePath, "utf8");
		const parsed = JSON.parse(raw);
		if (parsed?.version !== 1) return normalizeExecApprovals({
			version: 1,
			agents: {}
		});
		return normalizeExecApprovals(parsed);
	} catch {
		return normalizeExecApprovals({
			version: 1,
			agents: {}
		});
	}
}
function saveExecApprovals(file) {
	const filePath = resolveExecApprovalsPath();
	ensureDir(filePath);
	fs.writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, { mode: 384 });
	try {
		fs.chmodSync(filePath, 384);
	} catch {}
}
function ensureExecApprovals() {
	const next = normalizeExecApprovals(loadExecApprovals());
	const socketPath = next.socket?.path?.trim();
	const token = next.socket?.token?.trim();
	const updated = {
		...next,
		socket: {
			path: socketPath && socketPath.length > 0 ? socketPath : resolveExecApprovalsSocketPath(),
			token: token && token.length > 0 ? token : generateToken()
		}
	};
	saveExecApprovals(updated);
	return updated;
}
function normalizeSecurity(value, fallback) {
	if (value === "allowlist" || value === "full" || value === "deny") return value;
	return fallback;
}
function normalizeAsk(value, fallback) {
	if (value === "always" || value === "off" || value === "on-miss") return value;
	return fallback;
}
function resolveExecApprovals(agentId, overrides) {
	const file = ensureExecApprovals();
	return resolveExecApprovalsFromFile({
		file,
		agentId,
		overrides,
		path: resolveExecApprovalsPath(),
		socketPath: expandHome(file.socket?.path ?? resolveExecApprovalsSocketPath()),
		token: file.socket?.token ?? ""
	});
}
function resolveExecApprovalsFromFile(params) {
	const file = normalizeExecApprovals(params.file);
	const defaults = file.defaults ?? {};
	const agentKey = params.agentId ?? DEFAULT_AGENT_ID;
	const agent = file.agents?.[agentKey] ?? {};
	const wildcard = file.agents?.["*"] ?? {};
	const fallbackSecurity = params.overrides?.security ?? DEFAULT_SECURITY;
	const fallbackAsk = params.overrides?.ask ?? DEFAULT_ASK;
	const fallbackAskFallback = params.overrides?.askFallback ?? DEFAULT_ASK_FALLBACK;
	const fallbackAutoAllowSkills = params.overrides?.autoAllowSkills ?? DEFAULT_AUTO_ALLOW_SKILLS;
	const resolvedDefaults = {
		security: normalizeSecurity(defaults.security, fallbackSecurity),
		ask: normalizeAsk(defaults.ask, fallbackAsk),
		askFallback: normalizeSecurity(defaults.askFallback ?? fallbackAskFallback, fallbackAskFallback),
		autoAllowSkills: Boolean(defaults.autoAllowSkills ?? fallbackAutoAllowSkills)
	};
	const resolvedAgent = {
		security: normalizeSecurity(agent.security ?? wildcard.security ?? resolvedDefaults.security, resolvedDefaults.security),
		ask: normalizeAsk(agent.ask ?? wildcard.ask ?? resolvedDefaults.ask, resolvedDefaults.ask),
		askFallback: normalizeSecurity(agent.askFallback ?? wildcard.askFallback ?? resolvedDefaults.askFallback, resolvedDefaults.askFallback),
		autoAllowSkills: Boolean(agent.autoAllowSkills ?? wildcard.autoAllowSkills ?? resolvedDefaults.autoAllowSkills)
	};
	const allowlist = [...Array.isArray(wildcard.allowlist) ? wildcard.allowlist : [], ...Array.isArray(agent.allowlist) ? agent.allowlist : []];
	return {
		path: params.path ?? resolveExecApprovalsPath(),
		socketPath: expandHome(params.socketPath ?? file.socket?.path ?? resolveExecApprovalsSocketPath()),
		token: params.token ?? file.socket?.token ?? "",
		defaults: resolvedDefaults,
		agent: resolvedAgent,
		allowlist,
		file
	};
}
function requiresExecApproval(params) {
	return params.ask === "always" || params.ask === "on-miss" && params.security === "allowlist" && (!params.analysisOk || !params.allowlistSatisfied);
}
function recordAllowlistUse(approvals, agentId, entry, command, resolvedPath) {
	const target = agentId ?? DEFAULT_AGENT_ID;
	const agents = approvals.agents ?? {};
	const existing = agents[target] ?? {};
	const nextAllowlist = (Array.isArray(existing.allowlist) ? existing.allowlist : []).map((item) => item.pattern === entry.pattern ? {
		...item,
		id: item.id ?? crypto.randomUUID(),
		lastUsedAt: Date.now(),
		lastUsedCommand: command,
		lastResolvedPath: resolvedPath
	} : item);
	agents[target] = {
		...existing,
		allowlist: nextAllowlist
	};
	approvals.agents = agents;
	saveExecApprovals(approvals);
}
function addAllowlistEntry(approvals, agentId, pattern) {
	const target = agentId ?? DEFAULT_AGENT_ID;
	const agents = approvals.agents ?? {};
	const existing = agents[target] ?? {};
	const allowlist = Array.isArray(existing.allowlist) ? existing.allowlist : [];
	const trimmed = pattern.trim();
	if (!trimmed) return;
	if (allowlist.some((entry) => entry.pattern === trimmed)) return;
	allowlist.push({
		id: crypto.randomUUID(),
		pattern: trimmed,
		lastUsedAt: Date.now()
	});
	agents[target] = {
		...existing,
		allowlist
	};
	approvals.agents = agents;
	saveExecApprovals(approvals);
}
function minSecurity(a, b) {
	const order = {
		deny: 0,
		allowlist: 1,
		full: 2
	};
	return order[a] <= order[b] ? a : b;
}
function maxAsk(a, b) {
	const order = {
		off: 0,
		"on-miss": 1,
		always: 2
	};
	return order[a] >= order[b] ? a : b;
}

//#endregion
export { normalizeExecApprovals as a, requiresExecApproval as c, resolveExecApprovalsSocketPath as d, saveExecApprovals as f, analyzeArgvCommand as g, resolveSafeBins as h, minSecurity as i, resolveExecApprovals as l, evaluateShellAllowlist as m, ensureExecApprovals as n, readExecApprovalsSnapshot as o, evaluateExecAllowlist as p, maxAsk as r, recordAllowlistUse as s, addAllowlistEntry as t, resolveExecApprovalsFromFile as u };