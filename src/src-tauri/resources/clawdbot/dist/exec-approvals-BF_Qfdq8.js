import { v as expandHomePrefix } from "./paths-ViKUYWUK.js";
import { t as DEFAULT_AGENT_ID } from "./session-key-DAhnzjyr.js";
import { $ as splitCommandChain, B as isTrustedSafeBinPath, Dt as SAFE_BIN_PROFILES, Et as DEFAULT_SAFE_BINS, St as resolveInlineCommandMatch, Tt as normalizeExecutableToken, U as validateSafeBinArgv, Z as isWindowsPlatform, bt as POSIX_INLINE_COMMAND_FLAGS, ct as resolveExecutionTargetResolution, dt as resolvePolicyTargetResolution, gt as extractShellWrapperInlineCommand, ot as resolveCommandResolutionFromArgv, pt as resolveExecWrapperTrustPlan, q as analyzeShellCommand, st as resolveExecutionTargetCandidatePath, tt as matchAllowlist, ut as resolvePolicyTargetCandidatePath, vt as isShellWrapperExecutable } from "./io-y3Az_Onx.js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";
import { clearTimeout, setTimeout } from "node:timers";
//#region src/infra/jsonl-socket.ts
async function requestJsonlSocket(params) {
	const { socketPath, payload, timeoutMs, accept } = params;
	return await new Promise((resolve) => {
		const client = new net.Socket();
		let settled = false;
		let buffer = "";
		const finish = (value) => {
			if (settled) return;
			settled = true;
			try {
				client.destroy();
			} catch {}
			resolve(value);
		};
		const timer = setTimeout(() => finish(null), timeoutMs);
		client.on("error", () => finish(null));
		client.connect(socketPath, () => {
			client.write(`${payload}\n`);
		});
		client.on("data", (data) => {
			buffer += data.toString("utf8");
			let idx = buffer.indexOf("\n");
			while (idx !== -1) {
				const line = buffer.slice(0, idx).trim();
				buffer = buffer.slice(idx + 1);
				idx = buffer.indexOf("\n");
				if (!line) continue;
				try {
					const result = accept(JSON.parse(line));
					if (result === void 0) continue;
					clearTimeout(timer);
					finish(result);
					return;
				} catch {}
			}
		});
	});
}
//#endregion
//#region src/infra/exec-approvals-allowlist.ts
function hasShellLineContinuation(command) {
	return /\\(?:\r\n|\n|\r)/.test(command);
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
	if (isWindowsPlatform(params.platform ?? process.platform)) return false;
	if (params.safeBins.size === 0) return false;
	const resolution = params.resolution;
	const execName = resolution?.executableName?.toLowerCase();
	if (!execName) return false;
	if (!params.safeBins.has(execName)) return false;
	if (!resolution?.resolvedPath) return false;
	if (!(params.isTrustedSafeBinPathFn ?? isTrustedSafeBinPath)({
		resolvedPath: resolution.resolvedPath,
		trustedDirs: params.trustedSafeBinDirs
	})) return false;
	const argv = params.argv.slice(1);
	const profile = (params.safeBinProfiles ?? SAFE_BIN_PROFILES)[execName];
	if (!profile) return false;
	return validateSafeBinArgv(argv, profile, { binName: execName });
}
function isPathScopedExecutableToken(token) {
	return token.includes("/") || token.includes("\\");
}
function pickExecAllowlistContext(params) {
	return {
		allowlist: params.allowlist,
		safeBins: params.safeBins,
		safeBinProfiles: params.safeBinProfiles,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform,
		trustedSafeBinDirs: params.trustedSafeBinDirs,
		skillBins: params.skillBins,
		autoAllowSkills: params.autoAllowSkills
	};
}
function normalizeSkillBinName(value) {
	const trimmed = value?.trim().toLowerCase();
	return trimmed && trimmed.length > 0 ? trimmed : null;
}
function normalizeSkillBinResolvedPath(value) {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const resolved = path.resolve(trimmed);
	if (process.platform === "win32") return resolved.replace(/\\/g, "/").toLowerCase();
	return resolved;
}
function buildSkillBinTrustIndex(entries) {
	const trustByName = /* @__PURE__ */ new Map();
	if (!entries || entries.length === 0) return trustByName;
	for (const entry of entries) {
		const name = normalizeSkillBinName(entry.name);
		const resolvedPath = normalizeSkillBinResolvedPath(entry.resolvedPath);
		if (!name || !resolvedPath) continue;
		const paths = trustByName.get(name) ?? /* @__PURE__ */ new Set();
		paths.add(resolvedPath);
		trustByName.set(name, paths);
	}
	return trustByName;
}
function isSkillAutoAllowedSegment(params) {
	if (!params.allowSkills) return false;
	const resolution = params.segment.resolution;
	const execution = resolveExecutionTargetResolution(resolution);
	if (!execution?.resolvedPath) return false;
	const rawExecutable = execution.rawExecutable?.trim() ?? "";
	if (!rawExecutable || isPathScopedExecutableToken(rawExecutable)) return false;
	const executableName = normalizeSkillBinName(execution.executableName);
	const resolvedPath = normalizeSkillBinResolvedPath(execution.resolvedPath);
	if (!executableName || !resolvedPath) return false;
	return Boolean(params.skillBinTrust.get(executableName)?.has(resolvedPath));
}
function evaluateSegments(segments, params) {
	const matches = [];
	const skillBinTrust = buildSkillBinTrustIndex(params.skillBins);
	const allowSkills = params.autoAllowSkills === true && skillBinTrust.size > 0;
	const segmentSatisfiedBy = [];
	return {
		satisfied: segments.every((segment) => {
			if (segment.resolution?.policyBlocked === true) {
				segmentSatisfiedBy.push(null);
				return false;
			}
			const effectiveArgv = segment.resolution?.effectiveArgv && segment.resolution.effectiveArgv.length > 0 ? segment.resolution.effectiveArgv : segment.argv;
			const allowlistSegment = effectiveArgv === segment.argv ? segment : {
				...segment,
				argv: effectiveArgv
			};
			const executableResolution = resolvePolicyTargetResolution(segment.resolution);
			const candidatePath = resolvePolicyTargetCandidatePath(segment.resolution, params.cwd);
			const candidateResolution = candidatePath && executableResolution ? {
				...executableResolution,
				resolvedPath: candidatePath
			} : executableResolution;
			const executableMatch = matchAllowlist(params.allowlist, candidateResolution);
			const inlineCommand = extractShellWrapperInlineCommand(allowlistSegment.argv);
			const shellPositionalArgvCandidatePath = resolveShellWrapperPositionalArgvCandidatePath({
				segment: allowlistSegment,
				cwd: params.cwd,
				env: params.env
			});
			const shellPositionalArgvMatch = shellPositionalArgvCandidatePath ? matchAllowlist(params.allowlist, {
				rawExecutable: shellPositionalArgvCandidatePath,
				resolvedPath: shellPositionalArgvCandidatePath,
				executableName: path.basename(shellPositionalArgvCandidatePath)
			}) : null;
			const shellScriptCandidatePath = inlineCommand === null ? resolveShellWrapperScriptCandidatePath({
				segment: allowlistSegment,
				cwd: params.cwd
			}) : void 0;
			const shellScriptMatch = shellScriptCandidatePath ? matchAllowlist(params.allowlist, {
				rawExecutable: shellScriptCandidatePath,
				resolvedPath: shellScriptCandidatePath,
				executableName: path.basename(shellScriptCandidatePath)
			}) : null;
			const match = executableMatch ?? shellPositionalArgvMatch ?? shellScriptMatch;
			if (match) matches.push(match);
			const safe = isSafeBinUsage({
				argv: effectiveArgv,
				resolution: resolveExecutionTargetResolution(segment.resolution),
				safeBins: params.safeBins,
				safeBinProfiles: params.safeBinProfiles,
				platform: params.platform,
				trustedSafeBinDirs: params.trustedSafeBinDirs
			});
			const skillAllow = isSkillAutoAllowedSegment({
				segment,
				allowSkills,
				skillBinTrust
			});
			const by = match ? "allowlist" : safe ? "safeBins" : skillAllow ? "skills" : null;
			segmentSatisfiedBy.push(by);
			return Boolean(by);
		}),
		matches,
		segmentSatisfiedBy
	};
}
function resolveAnalysisSegmentGroups(analysis) {
	if (analysis.chains) return analysis.chains;
	return [analysis.segments];
}
function evaluateExecAllowlist(params) {
	const allowlistMatches = [];
	const segmentSatisfiedBy = [];
	if (!params.analysis.ok || params.analysis.segments.length === 0) return {
		allowlistSatisfied: false,
		allowlistMatches,
		segmentSatisfiedBy
	};
	const allowlistContext = pickExecAllowlistContext(params);
	const hasChains = Boolean(params.analysis.chains);
	for (const group of resolveAnalysisSegmentGroups(params.analysis)) {
		const result = evaluateSegments(group, allowlistContext);
		if (!result.satisfied) {
			if (!hasChains) return {
				allowlistSatisfied: false,
				allowlistMatches: result.matches,
				segmentSatisfiedBy: result.segmentSatisfiedBy
			};
			return {
				allowlistSatisfied: false,
				allowlistMatches: [],
				segmentSatisfiedBy: []
			};
		}
		allowlistMatches.push(...result.matches);
		segmentSatisfiedBy.push(...result.segmentSatisfiedBy);
	}
	return {
		allowlistSatisfied: true,
		allowlistMatches,
		segmentSatisfiedBy
	};
}
function hasSegmentExecutableMatch(segment, predicate) {
	const execution = resolveExecutionTargetResolution(segment.resolution);
	const candidates = [
		execution?.executableName,
		execution?.rawExecutable,
		segment.argv[0]
	];
	for (const candidate of candidates) {
		const trimmed = candidate?.trim();
		if (!trimmed) continue;
		if (predicate(trimmed)) return true;
	}
	return false;
}
function isShellWrapperSegment(segment) {
	return hasSegmentExecutableMatch(segment, isShellWrapperExecutable);
}
const SHELL_WRAPPER_OPTIONS_WITH_VALUE = new Set([
	"-c",
	"--command",
	"-o",
	"-O",
	"+O",
	"--rcfile",
	"--init-file",
	"--startup-file"
]);
function resolveShellWrapperScriptCandidatePath(params) {
	if (!isShellWrapperSegment(params.segment)) return;
	const argv = params.segment.argv;
	if (!Array.isArray(argv) || argv.length < 2) return;
	let idx = 1;
	while (idx < argv.length) {
		const token = argv[idx]?.trim() ?? "";
		if (!token) {
			idx += 1;
			continue;
		}
		if (token === "--") {
			idx += 1;
			break;
		}
		if (token === "-c" || token === "--command") return;
		if (/^-[^-]*c[^-]*$/i.test(token)) return;
		if (token === "-s" || /^-[^-]*s[^-]*$/i.test(token)) return;
		if (SHELL_WRAPPER_OPTIONS_WITH_VALUE.has(token)) {
			idx += 2;
			continue;
		}
		if (token.startsWith("-") || token.startsWith("+")) {
			idx += 1;
			continue;
		}
		break;
	}
	const scriptToken = argv[idx]?.trim();
	if (!scriptToken) return;
	if (path.isAbsolute(scriptToken)) return scriptToken;
	const expanded = scriptToken.startsWith("~") ? expandHomePrefix(scriptToken) : scriptToken;
	const base = params.cwd && params.cwd.trim().length > 0 ? params.cwd : process.cwd();
	return path.resolve(base, expanded);
}
function resolveShellWrapperPositionalArgvCandidatePath(params) {
	if (!isShellWrapperSegment(params.segment)) return;
	const argv = params.segment.argv;
	if (!Array.isArray(argv) || argv.length < 4) return;
	const wrapper = normalizeExecutableToken(argv[0] ?? "");
	if (![
		"ash",
		"bash",
		"dash",
		"fish",
		"ksh",
		"sh",
		"zsh"
	].includes(wrapper)) return;
	const inlineMatch = resolveInlineCommandMatch(argv, POSIX_INLINE_COMMAND_FLAGS, { allowCombinedC: true });
	if (inlineMatch.valueTokenIndex === null || !inlineMatch.command) return;
	if (!isDirectShellPositionalCarrierInvocation(inlineMatch.command)) return;
	const carriedExecutable = argv.slice(inlineMatch.valueTokenIndex + 1).map((token) => token.trim()).find((token) => token.length > 0);
	if (!carriedExecutable) return;
	return resolveExecutionTargetCandidatePath(resolveCommandResolutionFromArgv([carriedExecutable], params.cwd, params.env), params.cwd);
}
function isDirectShellPositionalCarrierInvocation(command) {
	const trimmed = command.trim();
	if (trimmed.length === 0) return false;
	const shellWhitespace = String.raw`[^\S\r\n]+`;
	const positionalZero = String.raw`(?:\$(?:0|\{0\})|"\$(?:0|\{0\})")`;
	const positionalArg = String.raw`(?:\$(?:[@*]|[1-9]|\{[@*1-9]\})|"\$(?:[@*]|[1-9]|\{[@*1-9]\})")`;
	return new RegExp(`^(?:exec${shellWhitespace}(?:--${shellWhitespace})?)?${positionalZero}(?:${shellWhitespace}${positionalArg})*$`, "u").test(trimmed);
}
function collectAllowAlwaysPatterns(params) {
	if (params.depth >= 3) return;
	const trustPlan = resolveExecWrapperTrustPlan(params.segment.argv);
	if (trustPlan.policyBlocked) return;
	const segment = trustPlan.argv === params.segment.argv ? params.segment : {
		raw: trustPlan.argv.join(" "),
		argv: trustPlan.argv,
		resolution: resolveCommandResolutionFromArgv(trustPlan.argv, params.cwd, params.env)
	};
	const candidatePath = resolveExecutionTargetCandidatePath(segment.resolution, params.cwd);
	if (!candidatePath) return;
	if (!trustPlan.shellWrapperExecutable) {
		params.out.add(candidatePath);
		return;
	}
	const positionalArgvPath = resolveShellWrapperPositionalArgvCandidatePath({
		segment,
		cwd: params.cwd,
		env: params.env
	});
	if (positionalArgvPath) {
		params.out.add(positionalArgvPath);
		return;
	}
	const inlineCommand = trustPlan.shellInlineCommand ?? extractShellWrapperInlineCommand(segment.argv);
	if (!inlineCommand) {
		const scriptPath = resolveShellWrapperScriptCandidatePath({
			segment,
			cwd: params.cwd
		});
		if (scriptPath) params.out.add(scriptPath);
		return;
	}
	const nested = analyzeShellCommand({
		command: inlineCommand,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform
	});
	if (!nested.ok) return;
	for (const nestedSegment of nested.segments) collectAllowAlwaysPatterns({
		segment: nestedSegment,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform,
		depth: params.depth + 1,
		out: params.out
	});
}
/**
* Derive persisted allowlist patterns for an "allow always" decision.
* When a command is wrapped in a shell (for example `zsh -lc "<cmd>"`),
* persist the inner executable(s) rather than the shell binary.
*/
function resolveAllowAlwaysPatterns(params) {
	const patterns = /* @__PURE__ */ new Set();
	for (const segment of params.segments) collectAllowAlwaysPatterns({
		segment,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform,
		depth: 0,
		out: patterns
	});
	return Array.from(patterns);
}
/**
* Evaluates allowlist for shell commands (including &&, ||, ;) and returns analysis metadata.
*/
function evaluateShellAllowlist(params) {
	const allowlistContext = pickExecAllowlistContext(params);
	const analysisFailure = () => ({
		analysisOk: false,
		allowlistSatisfied: false,
		allowlistMatches: [],
		segments: [],
		segmentSatisfiedBy: []
	});
	if (hasShellLineContinuation(params.command)) return analysisFailure();
	const chainParts = isWindowsPlatform(params.platform) ? null : splitCommandChain(params.command);
	if (!chainParts) {
		const analysis = analyzeShellCommand({
			command: params.command,
			cwd: params.cwd,
			env: params.env,
			platform: params.platform
		});
		if (!analysis.ok) return analysisFailure();
		const evaluation = evaluateExecAllowlist({
			analysis,
			...allowlistContext
		});
		return {
			analysisOk: true,
			allowlistSatisfied: evaluation.allowlistSatisfied,
			allowlistMatches: evaluation.allowlistMatches,
			segments: analysis.segments,
			segmentSatisfiedBy: evaluation.segmentSatisfiedBy
		};
	}
	const allowlistMatches = [];
	const segments = [];
	const segmentSatisfiedBy = [];
	for (const part of chainParts) {
		const analysis = analyzeShellCommand({
			command: part,
			cwd: params.cwd,
			env: params.env,
			platform: params.platform
		});
		if (!analysis.ok) return analysisFailure();
		segments.push(...analysis.segments);
		const evaluation = evaluateExecAllowlist({
			analysis,
			...allowlistContext
		});
		allowlistMatches.push(...evaluation.allowlistMatches);
		segmentSatisfiedBy.push(...evaluation.segmentSatisfiedBy);
		if (!evaluation.allowlistSatisfied) return {
			analysisOk: true,
			allowlistSatisfied: false,
			allowlistMatches,
			segments,
			segmentSatisfiedBy
		};
	}
	return {
		analysisOk: true,
		allowlistSatisfied: true,
		allowlistMatches,
		segments,
		segmentSatisfiedBy
	};
}
//#endregion
//#region src/infra/exec-approvals.ts
function normalizeExecHost(value) {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "sandbox" || normalized === "gateway" || normalized === "node") return normalized;
	return null;
}
function normalizeExecSecurity(value) {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "deny" || normalized === "allowlist" || normalized === "full") return normalized;
	return null;
}
function normalizeExecAsk(value) {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "off" || normalized === "on-miss" || normalized === "always") return normalized;
	return null;
}
const DEFAULT_EXEC_APPROVAL_TIMEOUT_MS = 12e4;
const DEFAULT_SECURITY = "deny";
const DEFAULT_ASK = "on-miss";
const DEFAULT_ASK_FALLBACK = "deny";
const DEFAULT_AUTO_ALLOW_SKILLS = false;
const DEFAULT_SOCKET = "~/.openclaw/exec-approvals.sock";
const DEFAULT_FILE = "~/.openclaw/exec-approvals.json";
function hashExecApprovalsRaw(raw) {
	return crypto.createHash("sha256").update(raw ?? "").digest("hex");
}
function resolveExecApprovalsPath() {
	return expandHomePrefix(DEFAULT_FILE);
}
function resolveExecApprovalsSocketPath() {
	return expandHomePrefix(DEFAULT_SOCKET);
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
function mergeExecApprovalsSocketDefaults(params) {
	const currentSocketPath = params.current?.socket?.path?.trim();
	const currentToken = params.current?.socket?.token?.trim();
	const socketPath = params.normalized.socket?.path?.trim() ?? currentSocketPath ?? resolveExecApprovalsSocketPath();
	const token = params.normalized.socket?.token?.trim() ?? currentToken ?? "";
	return {
		...params.normalized,
		socket: {
			path: socketPath,
			token
		}
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
		socketPath: expandHomePrefix(file.socket?.path ?? resolveExecApprovalsSocketPath()),
		token: file.socket?.token ?? ""
	});
}
function resolveExecApprovalsFromFile(params) {
	const file = normalizeExecApprovals(params.file);
	const defaults = file.defaults ?? {};
	const agentKey = params.agentId ?? "main";
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
		socketPath: expandHomePrefix(params.socketPath ?? file.socket?.path ?? resolveExecApprovalsSocketPath()),
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
	const target = agentId ?? "main";
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
	const target = agentId ?? "main";
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
async function requestExecApprovalViaSocket(params) {
	const { socketPath, token, request } = params;
	if (!socketPath || !token) return null;
	const timeoutMs = params.timeoutMs ?? 15e3;
	return await requestJsonlSocket({
		socketPath,
		payload: JSON.stringify({
			type: "request",
			token,
			id: crypto.randomUUID(),
			request
		}),
		timeoutMs,
		accept: (value) => {
			const msg = value;
			if (msg?.type === "decision" && msg.decision) return msg.decision;
		}
	});
}
//#endregion
export { isSafeBinUsage as C, requestJsonlSocket as D, resolveSafeBins as E, evaluateShellAllowlist as S, resolveAllowAlwaysPatterns as T, resolveExecApprovalsFromFile as _, maxAsk as a, saveExecApprovals as b, normalizeExecApprovals as c, normalizeExecSecurity as d, readExecApprovalsSnapshot as f, resolveExecApprovals as g, requiresExecApproval as h, loadExecApprovals as i, normalizeExecAsk as l, requestExecApprovalViaSocket as m, addAllowlistEntry as n, mergeExecApprovalsSocketDefaults as o, recordAllowlistUse as p, ensureExecApprovals as r, minSecurity as s, DEFAULT_EXEC_APPROVAL_TIMEOUT_MS as t, normalizeExecHost as u, resolveExecApprovalsPath as v, normalizeSafeBins as w, evaluateExecAllowlist as x, resolveExecApprovalsSocketPath as y };
