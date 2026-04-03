import { t as expandHomePrefix } from "./home-dir-BnP38vVl.js";
import { t as DEFAULT_AGENT_ID } from "./session-key-D7XpmyVq.js";
import { Et as POSIX_INLINE_COMMAND_FLAGS, Mt as normalizeExecutableToken, Nt as DEFAULT_SAFE_BINS, Ot as resolveInlineCommandMatch, Pt as SAFE_BIN_PROFILES, St as extractShellWrapperInlineCommand, W as isTrustedSafeBinPath, Z as analyzeShellCommand, bt as POWERSHELL_WRAPPERS, dt as resolveCommandResolutionFromArgv, ft as resolveExecutionTargetCandidatePath, gt as resolvePolicyTargetResolution, ht as resolvePolicyTargetCandidatePath, it as splitCommandChainWithOperators, kt as isDispatchWrapperExecutable, ot as matchAllowlist, pt as resolveExecutionTargetResolution, q as validateSafeBinArgv, rt as splitCommandChain, tt as isWindowsPlatform, vt as resolveExecWrapperTrustPlan, wt as isShellWrapperExecutable } from "./io-DhtVmzAJ.js";
import fsSync from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";
import { clearTimeout, setTimeout } from "node:timers";
//#region src/infra/exec-inline-eval.ts
const FLAG_INTERPRETER_INLINE_EVAL_SPECS = [
	{
		names: [
			"python",
			"python2",
			"python3",
			"pypy",
			"pypy3"
		],
		exactFlags: new Set(["-c"])
	},
	{
		names: [
			"node",
			"nodejs",
			"bun",
			"deno"
		],
		exactFlags: new Set([
			"-e",
			"--eval",
			"-p",
			"--print"
		])
	},
	{
		names: [
			"awk",
			"gawk",
			"mawk",
			"nawk"
		],
		exactFlags: new Set(["-e", "--source"]),
		prefixFlags: [{
			label: "--source",
			prefix: "--source="
		}]
	},
	{
		names: ["ruby"],
		exactFlags: new Set(["-e"])
	},
	{
		names: ["perl"],
		exactFlags: new Set(["-e", "-E"])
	},
	{
		names: ["php"],
		exactFlags: new Set(["-r"])
	},
	{
		names: ["lua"],
		exactFlags: new Set(["-e"])
	},
	{
		names: ["osascript"],
		exactFlags: new Set(["-e"])
	},
	{
		names: ["find"],
		exactFlags: new Set([
			"-exec",
			"-execdir",
			"-ok",
			"-okdir"
		]),
		scanPastDoubleDash: true
	},
	{
		names: ["make", "gmake"],
		exactFlags: new Set([
			"-f",
			"--file",
			"--makefile",
			"--eval"
		]),
		rawExactFlags: new Map([["-E", "-E"]]),
		rawPrefixFlags: [{
			label: "-E",
			prefix: "-E"
		}],
		prefixFlags: [
			{
				label: "-f",
				prefix: "-f"
			},
			{
				label: "--file",
				prefix: "--file="
			},
			{
				label: "--makefile",
				prefix: "--makefile="
			},
			{
				label: "--eval",
				prefix: "--eval="
			}
		]
	},
	{
		names: ["sed", "gsed"],
		exactFlags: /* @__PURE__ */ new Set(),
		rawExactFlags: new Map([["-e", "-e"]]),
		rawPrefixFlags: [{
			label: "-e",
			prefix: "-e"
		}]
	}
];
const POSITIONAL_INTERPRETER_INLINE_EVAL_SPECS = [
	{
		names: [
			"awk",
			"gawk",
			"mawk",
			"nawk"
		],
		fileFlags: new Set(["-f", "--file"]),
		fileFlagPrefixes: ["-f", "--file="],
		exactValueFlags: new Set([
			"-f",
			"--file",
			"-F",
			"--field-separator",
			"-v",
			"--assign",
			"-i",
			"--include",
			"-l",
			"--load",
			"-W"
		]),
		prefixValueFlags: [
			"-F",
			"--field-separator=",
			"-v",
			"--assign=",
			"--include=",
			"--load="
		],
		flag: "<program>"
	},
	{
		names: ["xargs"],
		exactValueFlags: new Set([
			"-a",
			"--arg-file",
			"-d",
			"--delimiter",
			"-E",
			"-I",
			"-L",
			"--max-lines",
			"-n",
			"--max-args",
			"-P",
			"--max-procs",
			"-s",
			"--max-chars"
		]),
		exactOptionalValueFlags: new Set(["--eof", "--replace"]),
		prefixValueFlags: [
			"-a",
			"--arg-file=",
			"-d",
			"--delimiter=",
			"-E",
			"--eof=",
			"-I",
			"--replace=",
			"-i",
			"-L",
			"--max-lines=",
			"-l",
			"-n",
			"--max-args=",
			"-P",
			"--max-procs=",
			"-s",
			"--max-chars="
		],
		flag: "<command>"
	},
	{
		names: ["sed", "gsed"],
		fileFlags: new Set(["-f", "--file"]),
		fileFlagPrefixes: ["-f", "--file="],
		exactValueFlags: new Set([
			"-f",
			"--file",
			"-l",
			"--line-length"
		]),
		exactOptionalValueFlags: new Set(["-i", "--in-place"]),
		prefixValueFlags: [
			"-f",
			"--file=",
			"--in-place=",
			"--line-length="
		],
		flag: "<program>"
	}
];
const INTERPRETER_ALLOWLIST_NAMES = new Set(FLAG_INTERPRETER_INLINE_EVAL_SPECS.flatMap((entry) => entry.names).concat(POSITIONAL_INTERPRETER_INLINE_EVAL_SPECS.flatMap((entry) => entry.names)));
function findInterpreterSpec(executable) {
	const normalized = normalizeExecutableToken(executable);
	for (const spec of FLAG_INTERPRETER_INLINE_EVAL_SPECS) if (spec.names.includes(normalized)) return spec;
	return null;
}
function findPositionalInterpreterSpec(executable) {
	const normalized = normalizeExecutableToken(executable);
	for (const spec of POSITIONAL_INTERPRETER_INLINE_EVAL_SPECS) if (spec.names.includes(normalized)) return spec;
	return null;
}
function createInlineEvalHit(executable, argv, flag) {
	return {
		executable,
		normalizedExecutable: normalizeExecutableToken(executable),
		flag,
		argv
	};
}
function detectInterpreterInlineEvalArgv(argv) {
	if (!Array.isArray(argv) || argv.length === 0) return null;
	const executable = argv[0]?.trim();
	if (!executable) return null;
	const spec = findInterpreterSpec(executable);
	if (spec) for (let idx = 1; idx < argv.length; idx += 1) {
		const token = argv[idx]?.trim();
		if (!token) continue;
		if (token === "--") {
			if (spec.scanPastDoubleDash) continue;
			break;
		}
		const rawExactFlag = spec.rawExactFlags?.get(token);
		if (rawExactFlag) return createInlineEvalHit(executable, argv, rawExactFlag);
		const rawPrefixFlag = spec.rawPrefixFlags?.find(({ prefix }) => token.startsWith(prefix) && token.length > prefix.length);
		if (rawPrefixFlag) return createInlineEvalHit(executable, argv, rawPrefixFlag.label);
		const lower = token.toLowerCase();
		if (spec.exactFlags.has(lower)) return createInlineEvalHit(executable, argv, lower);
		const prefixFlag = spec.prefixFlags?.find(({ prefix }) => lower.startsWith(prefix) && lower.length > prefix.length);
		if (prefixFlag) return createInlineEvalHit(executable, argv, prefixFlag.label);
	}
	const positionalSpec = findPositionalInterpreterSpec(executable);
	if (!positionalSpec) return null;
	for (let idx = 1; idx < argv.length; idx += 1) {
		const token = argv[idx]?.trim();
		if (!token) continue;
		if (token === "--") {
			if (!argv[idx + 1]?.trim()) return null;
			return createInlineEvalHit(executable, argv, positionalSpec.flag);
		}
		if (positionalSpec.fileFlags?.has(token)) return null;
		if (positionalSpec.fileFlagPrefixes?.some((prefix) => token.startsWith(prefix) && token.length > prefix.length)) return null;
		if (positionalSpec.exactValueFlags?.has(token)) {
			idx += 1;
			continue;
		}
		if (positionalSpec.exactOptionalValueFlags?.has(token)) continue;
		if (positionalSpec.prefixValueFlags?.some((prefix) => token.startsWith(prefix) && token.length > prefix.length)) continue;
		if (token.startsWith("-")) continue;
		return createInlineEvalHit(executable, argv, positionalSpec.flag);
	}
	return null;
}
function describeInterpreterInlineEval(hit) {
	if (hit.flag === "<command>") return `${hit.normalizedExecutable} inline command`;
	if (hit.flag === "<program>") return `${hit.normalizedExecutable} inline program`;
	return `${hit.normalizedExecutable} ${hit.flag}`;
}
function isInterpreterLikeAllowlistPattern(pattern) {
	const trimmed = pattern?.trim().toLowerCase() ?? "";
	if (!trimmed) return false;
	const normalized = normalizeExecutableToken(trimmed);
	if (INTERPRETER_ALLOWLIST_NAMES.has(normalized)) return true;
	const basename = trimmed.replace(/\\/g, "/").split("/").pop() ?? trimmed;
	const strippedWildcards = (basename.endsWith(".exe") ? basename.slice(0, -4) : basename).replace(/[*?[\]{}()]/g, "");
	return INTERPRETER_ALLOWLIST_NAMES.has(strippedWildcards);
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
function resolveSkillPreludePath(rawPath, cwd) {
	const expanded = rawPath.startsWith("~") ? expandHomePrefix(rawPath) : rawPath;
	if (path.isAbsolute(expanded)) return path.resolve(expanded);
	return path.resolve(cwd?.trim() || process.cwd(), expanded);
}
function isSkillMarkdownPreludePath(filePath) {
	const lowerNormalized = filePath.replace(/\\/g, "/").toLowerCase();
	if (!lowerNormalized.endsWith("/skill.md")) return false;
	const parts = lowerNormalized.split("/").filter(Boolean);
	if (parts.length < 2) return false;
	for (let index = parts.length - 2; index >= 0; index -= 1) {
		if (parts[index] !== "skills") continue;
		const segmentsAfterSkills = parts.length - index - 1;
		if (segmentsAfterSkills === 1 || segmentsAfterSkills === 2) return true;
	}
	return false;
}
function resolveSkillMarkdownPreludeId(filePath) {
	const lowerNormalized = filePath.replace(/\\/g, "/").toLowerCase();
	if (!lowerNormalized.endsWith("/skill.md")) return null;
	const parts = lowerNormalized.split("/").filter(Boolean);
	if (parts.length < 3) return null;
	for (let index = parts.length - 2; index >= 0; index -= 1) {
		if (parts[index] !== "skills") continue;
		if (parts.length - index - 1 !== 2) continue;
		return parts[index + 1]?.trim() || null;
	}
	return null;
}
function isSkillPreludeReadSegment(segment, cwd) {
	if (resolveExecutionTargetResolution(segment.resolution)?.executableName?.toLowerCase() !== "cat") return false;
	if (segment.argv.length !== 2) return false;
	const rawPath = segment.argv[1]?.trim();
	if (!rawPath) return false;
	return isSkillMarkdownPreludePath(resolveSkillPreludePath(rawPath, cwd));
}
function isSkillPreludeMarkerSegment(segment) {
	if (resolveExecutionTargetResolution(segment.resolution)?.executableName?.toLowerCase() !== "printf") return false;
	if (segment.argv.length !== 2) return false;
	const marker = segment.argv[1];
	return marker === "\\n---CMD---\\n" || marker === "\n---CMD---\n";
}
function isSkillPreludeSegment(segment, cwd) {
	return isSkillPreludeReadSegment(segment, cwd) || isSkillPreludeMarkerSegment(segment);
}
function isSkillPreludeOnlyEvaluation(segments, cwd) {
	return segments.length > 0 && segments.every((segment) => isSkillPreludeSegment(segment, cwd));
}
function resolveSkillPreludeIds(segments, cwd) {
	const skillIds = /* @__PURE__ */ new Set();
	for (const segment of segments) {
		if (!isSkillPreludeReadSegment(segment, cwd)) continue;
		const rawPath = segment.argv[1]?.trim();
		if (!rawPath) continue;
		const skillId = resolveSkillMarkdownPreludeId(resolveSkillPreludePath(rawPath, cwd));
		if (skillId) skillIds.add(skillId);
	}
	return skillIds;
}
function resolveAllowlistedSkillWrapperId(segment) {
	const executableName = normalizeExecutableToken(resolveExecutionTargetResolution(segment.resolution)?.executableName ?? segment.argv[0] ?? "");
	if (!executableName.endsWith("-wrapper")) return null;
	return executableName.slice(0, -8).trim() || null;
}
function resolveTrustedSkillExecutionIds(params) {
	const skillIds = /* @__PURE__ */ new Set();
	if (!params.evaluation.allowlistSatisfied) return skillIds;
	for (const [index, segment] of params.analysis.segments.entries()) {
		const satisfiedBy = params.evaluation.segmentSatisfiedBy[index];
		if (satisfiedBy === "skills") {
			const execution = resolveExecutionTargetResolution(segment.resolution);
			const executableName = normalizeExecutableToken(execution?.executableName ?? execution?.rawExecutable ?? segment.argv[0] ?? "");
			if (executableName) skillIds.add(executableName);
			continue;
		}
		if (satisfiedBy !== "allowlist") continue;
		const wrapperSkillId = resolveAllowlistedSkillWrapperId(segment);
		if (wrapperSkillId) skillIds.add(wrapperSkillId);
	}
	return skillIds;
}
const MAX_SHELL_WRAPPER_INLINE_EVAL_DEPTH = 3;
function resolveShellWrapperScriptArgv(params) {
	const scriptBase = path.basename(params.shellScriptCandidatePath).toLowerCase();
	const cwdBase = params.cwd && params.cwd.trim() ? params.cwd.trim() : process.cwd();
	const resolveArgPath = (a) => path.isAbsolute(a) ? a : path.resolve(cwdBase, a);
	let idx = params.effectiveArgv.findIndex((a) => resolveArgPath(a) === params.shellScriptCandidatePath);
	if (idx === -1) idx = params.effectiveArgv.findIndex((a) => path.basename(a).toLowerCase() === scriptBase);
	const scriptArgs = idx !== -1 ? params.effectiveArgv.slice(idx + 1) : [];
	return [params.shellScriptCandidatePath, ...scriptArgs];
}
function resolveSegmentAllowlistMatch(params) {
	const effectiveArgv = params.segment.resolution?.effectiveArgv && params.segment.resolution.effectiveArgv.length > 0 ? params.segment.resolution.effectiveArgv : params.segment.argv;
	const allowlistSegment = effectiveArgv === params.segment.argv ? params.segment : {
		...params.segment,
		argv: effectiveArgv
	};
	const executableResolution = resolvePolicyTargetResolution(params.segment.resolution);
	const candidatePath = resolvePolicyTargetCandidatePath(params.segment.resolution, params.context.cwd);
	const candidateResolution = candidatePath && executableResolution ? {
		...executableResolution,
		resolvedPath: candidatePath
	} : executableResolution;
	const inlineCommand = extractShellWrapperInlineCommand(allowlistSegment.argv);
	const executableMatch = inlineCommand !== null && isDirectShellPositionalCarrierInvocation(inlineCommand) ? null : matchAllowlist(params.context.allowlist, candidateResolution, effectiveArgv, params.context.platform);
	const shellPositionalArgvCandidatePath = resolveShellWrapperPositionalArgvCandidatePath({
		segment: allowlistSegment,
		cwd: params.context.cwd,
		env: params.context.env
	});
	const shellPositionalArgvMatch = shellPositionalArgvCandidatePath ? matchAllowlist(params.context.allowlist, {
		rawExecutable: shellPositionalArgvCandidatePath,
		resolvedPath: shellPositionalArgvCandidatePath,
		executableName: path.basename(shellPositionalArgvCandidatePath)
	}, void 0, params.context.platform) : null;
	const shellScriptCandidatePath = inlineCommand === null ? resolveShellWrapperScriptCandidatePath({
		segment: allowlistSegment,
		cwd: params.context.cwd
	}) : void 0;
	const shellScriptArgv = shellScriptCandidatePath ? resolveShellWrapperScriptArgv({
		shellScriptCandidatePath,
		effectiveArgv,
		cwd: params.context.cwd
	}) : null;
	const shellScriptMatch = shellScriptCandidatePath && shellScriptArgv ? matchAllowlist(params.context.allowlist, {
		rawExecutable: shellScriptCandidatePath,
		resolvedPath: shellScriptCandidatePath,
		executableName: path.basename(shellScriptCandidatePath)
	}, shellScriptArgv, params.context.platform) : null;
	return {
		effectiveArgv,
		inlineCommand,
		match: executableMatch ?? shellPositionalArgvMatch ?? shellScriptMatch
	};
}
function resolveSegmentSatisfaction(params) {
	if (params.match) return "allowlist";
	if (isSafeBinUsage({
		argv: params.effectiveArgv,
		resolution: resolveExecutionTargetResolution(params.segment.resolution),
		safeBins: params.context.safeBins,
		safeBinProfiles: params.context.safeBinProfiles,
		platform: params.context.platform,
		trustedSafeBinDirs: params.context.trustedSafeBinDirs
	})) return "safeBins";
	return isSkillAutoAllowedSegment({
		segment: params.segment,
		allowSkills: params.allowSkills,
		skillBinTrust: params.skillBinTrust
	}) ? "skills" : null;
}
function resolveInlineChainFallback(params) {
	if (params.by !== null || !params.inlineCommand) return null;
	const inlineChainParts = splitCommandChain(params.inlineCommand);
	if (!inlineChainParts || inlineChainParts.length <= 1) return null;
	return evaluateShellWrapperInlineChain({
		inlineCommand: params.inlineCommand,
		context: params.context,
		inlineDepth: params.inlineDepth + 1,
		precomputedChainParts: inlineChainParts
	});
}
function evaluateShellWrapperInlineChain(params) {
	if (params.inlineDepth >= MAX_SHELL_WRAPPER_INLINE_EVAL_DEPTH) return null;
	if (isWindowsPlatform(params.context.platform)) return null;
	const chainParts = params.precomputedChainParts ?? splitCommandChain(params.inlineCommand);
	if (!chainParts || chainParts.length <= 1) return null;
	const matches = [];
	for (const part of chainParts) {
		const analysis = analyzeShellCommand({
			command: part,
			cwd: params.context.cwd,
			env: params.context.env,
			platform: params.context.platform
		});
		if (!analysis.ok) return null;
		const result = evaluateSegments(analysis.segments, params.context, params.inlineDepth);
		if (!result.satisfied) return null;
		matches.push(...result.matches);
	}
	return {
		matches,
		satisfiedBy: "allowlist"
	};
}
function evaluateSegments(segments, params, inlineDepth = 0) {
	const matches = [];
	const skillBinTrust = buildSkillBinTrustIndex(params.skillBins);
	const allowSkills = params.autoAllowSkills === true && skillBinTrust.size > 0;
	const segmentAllowlistEntries = [];
	const segmentSatisfiedBy = [];
	return {
		satisfied: segments.every((segment) => {
			if (segment.resolution?.policyBlocked === true) {
				segmentAllowlistEntries.push(null);
				segmentSatisfiedBy.push(null);
				return false;
			}
			const { effectiveArgv, inlineCommand, match } = resolveSegmentAllowlistMatch({
				segment,
				context: params
			});
			if (match) matches.push(match);
			segmentAllowlistEntries.push(match ?? null);
			const by = resolveSegmentSatisfaction({
				match,
				segment,
				effectiveArgv,
				context: params,
				allowSkills,
				skillBinTrust
			});
			const inlineResult = resolveInlineChainFallback({
				by,
				inlineCommand,
				context: params,
				inlineDepth
			});
			if (inlineResult) {
				matches.push(...inlineResult.matches);
				segmentSatisfiedBy.push(inlineResult.satisfiedBy);
				return true;
			}
			segmentSatisfiedBy.push(by);
			return Boolean(by);
		}),
		matches,
		segmentAllowlistEntries,
		segmentSatisfiedBy
	};
}
function resolveAnalysisSegmentGroups(analysis) {
	if (analysis.chains) return analysis.chains;
	return [analysis.segments];
}
function evaluateExecAllowlist(params) {
	const allowlistMatches = [];
	const segmentAllowlistEntries = [];
	const segmentSatisfiedBy = [];
	if (!params.analysis.ok || params.analysis.segments.length === 0) return {
		allowlistSatisfied: false,
		allowlistMatches,
		segmentAllowlistEntries,
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
				segmentAllowlistEntries: result.segmentAllowlistEntries,
				segmentSatisfiedBy: result.segmentSatisfiedBy
			};
			return {
				allowlistSatisfied: false,
				allowlistMatches: [],
				segmentAllowlistEntries: [],
				segmentSatisfiedBy: []
			};
		}
		allowlistMatches.push(...result.matches);
		segmentAllowlistEntries.push(...result.segmentAllowlistEntries);
		segmentSatisfiedBy.push(...result.segmentSatisfiedBy);
	}
	return {
		allowlistSatisfied: true,
		allowlistMatches,
		segmentAllowlistEntries,
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
		if (typeof candidate !== "string") continue;
		const trimmed = candidate.trim();
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
	"+O"
]);
const SHELL_WRAPPER_DISQUALIFYING_SCRIPT_OPTIONS = [
	"--rcfile",
	"--init-file",
	"--startup-file"
];
function hasDisqualifyingShellWrapperScriptOption(token) {
	return SHELL_WRAPPER_DISQUALIFYING_SCRIPT_OPTIONS.some((option) => token === option || token.startsWith(`${option}=`));
}
const POWERSHELL_OPTIONS_WITH_VALUE_RE = /^-(?:executionpolicy|ep|windowstyle|w|workingdirectory|wd|inputformat|outputformat|settingsfile|configurationfile|version|v|psconsolefile|pscf|encodedcommand|en|enc|encodedarguments|ea)$/i;
function resolveShellWrapperScriptCandidatePath(params) {
	if (!isShellWrapperSegment(params.segment)) return;
	const argv = params.segment.argv;
	if (!Array.isArray(argv) || argv.length < 2) return;
	const wrapperName = normalizeExecutableToken(argv[0] ?? "");
	const isPowerShell = POWERSHELL_WRAPPERS.has(wrapperName);
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
		if (!isPowerShell && /^-[^-]*c[^-]*$/i.test(token)) return;
		if (token === "-s" || !isPowerShell && /^-[^-]*s[^-]*$/i.test(token)) return;
		if (hasDisqualifyingShellWrapperScriptOption(token)) return;
		if (SHELL_WRAPPER_OPTIONS_WITH_VALUE.has(token)) {
			idx += 2;
			continue;
		}
		if (isPowerShell && POWERSHELL_OPTIONS_WITH_VALUE_RE.test(token)) {
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
	const carriedName = normalizeExecutableToken(carriedExecutable);
	if (isDispatchWrapperExecutable(carriedName) || isShellWrapperExecutable(carriedName)) return;
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
function escapeRegExpLiteral(input) {
	return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildScriptArgPatternFromArgv(argv, scriptPath, cwd, platform) {
	if (!isWindowsPlatform(platform ?? process.platform)) return;
	const scriptBase = path.basename(scriptPath).toLowerCase();
	const base = cwd && cwd.trim() ? cwd.trim() : process.cwd();
	const resolveArgPath = (arg) => path.isAbsolute(arg) ? arg : path.resolve(base, arg);
	let scriptIdx = argv.findIndex((arg) => resolveArgPath(arg) === scriptPath);
	if (scriptIdx === -1) scriptIdx = argv.findIndex((arg) => path.basename(arg).toLowerCase() === scriptBase);
	const normalized = (scriptIdx !== -1 ? argv.slice(scriptIdx + 1) : []).map((a) => a.replace(/\//g, "\\"));
	if (normalized.length === 0) return "^\0\0$";
	return `^${normalized.map(escapeRegExpLiteral).join("\0")}\x00$`;
}
function buildArgPatternFromArgv(argv, platform) {
	if (!isWindowsPlatform(platform ?? process.platform)) return;
	const normalized = argv.slice(1).map((a) => a.replace(/\//g, "\\"));
	if (normalized.length === 0) return "^\0\0$";
	return `^${escapeRegExpLiteral(normalized.join("\0"))}\x00$`;
}
function addAllowAlwaysPattern(out, pattern, argPattern) {
	if (!out.some((p) => p.pattern === pattern && (p.argPattern ?? void 0) === (argPattern ?? void 0))) out.push({
		pattern,
		argPattern
	});
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
	if (isInterpreterLikeAllowlistPattern(candidatePath)) {
		const effectiveArgv = segment.resolution?.effectiveArgv ?? segment.argv;
		if (params.strictInlineEval !== true || detectInterpreterInlineEvalArgv(effectiveArgv) !== null) return;
	}
	if (!trustPlan.shellWrapperExecutable) {
		const argPattern = buildArgPatternFromArgv(segment.argv, params.platform);
		addAllowAlwaysPattern(params.out, candidatePath, argPattern);
		return;
	}
	const positionalArgvPath = resolveShellWrapperPositionalArgvCandidatePath({
		segment,
		cwd: params.cwd,
		env: params.env
	});
	if (positionalArgvPath) {
		addAllowAlwaysPattern(params.out, positionalArgvPath);
		return;
	}
	const inlineCommand = POWERSHELL_WRAPPERS.has(normalizeExecutableToken(segment.argv[0] ?? "")) && segment.argv.some((t) => {
		const lower = t.trim().toLowerCase();
		return lower === "-file" || lower === "-f";
	}) && !segment.argv.some((t) => {
		const lower = t.trim().toLowerCase();
		return lower === "-command" || lower === "-c" || lower === "--command";
	}) ? null : trustPlan.shellInlineCommand ?? extractShellWrapperInlineCommand(segment.argv);
	if (!inlineCommand) {
		const scriptPath = resolveShellWrapperScriptCandidatePath({
			segment,
			cwd: params.cwd
		});
		if (scriptPath) {
			const argPattern = buildScriptArgPatternFromArgv(params.segment.argv, scriptPath, params.cwd, params.platform);
			addAllowAlwaysPattern(params.out, scriptPath, argPattern);
		}
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
		strictInlineEval: params.strictInlineEval,
		depth: params.depth + 1,
		out: params.out
	});
}
/**
* Derive persisted allowlist patterns for an "allow always" decision.
* When a command is wrapped in a shell (for example `zsh -lc "<cmd>"`),
* persist the inner executable(s) rather than the shell binary.
*/
function resolveAllowAlwaysPatternEntries(params) {
	const patterns = [];
	for (const segment of params.segments) collectAllowAlwaysPatterns({
		segment,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform,
		strictInlineEval: params.strictInlineEval,
		depth: 0,
		out: patterns
	});
	return patterns;
}
function resolveAllowAlwaysPatterns(params) {
	return resolveAllowAlwaysPatternEntries(params).map((pattern) => pattern.pattern);
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
		segmentAllowlistEntries: [],
		segmentSatisfiedBy: []
	});
	if (hasShellLineContinuation(params.command)) return analysisFailure();
	const chainParts = isWindowsPlatform(params.platform) ? null : splitCommandChainWithOperators(params.command);
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
			segmentAllowlistEntries: evaluation.segmentAllowlistEntries,
			segmentSatisfiedBy: evaluation.segmentSatisfiedBy
		};
	}
	const chainEvaluations = chainParts.map(({ part, opToNext }) => {
		const analysis = analyzeShellCommand({
			command: part,
			cwd: params.cwd,
			env: params.env,
			platform: params.platform
		});
		if (!analysis.ok) return null;
		return {
			analysis,
			evaluation: evaluateExecAllowlist({
				analysis,
				...allowlistContext
			}),
			opToNext
		};
	});
	if (chainEvaluations.some((entry) => entry === null)) return analysisFailure();
	const finalizedEvaluations = chainEvaluations;
	const allowSkillPreludeAtIndex = /* @__PURE__ */ new Set();
	const reachableSkillIds = /* @__PURE__ */ new Set();
	for (let index = finalizedEvaluations.length - 1; index >= 0; index -= 1) {
		const { analysis, evaluation, opToNext } = finalizedEvaluations[index];
		const trustedSkillIds = resolveTrustedSkillExecutionIds({
			analysis,
			evaluation
		});
		if (trustedSkillIds.size > 0) {
			for (const skillId of trustedSkillIds) reachableSkillIds.add(skillId);
			continue;
		}
		const isPreludeOnly = !evaluation.allowlistSatisfied && isSkillPreludeOnlyEvaluation(analysis.segments, params.cwd);
		const preludeSkillIds = isPreludeOnly ? resolveSkillPreludeIds(analysis.segments, params.cwd) : /* @__PURE__ */ new Set();
		const reachesTrustedSkillExecution = opToNext === "&&" && (preludeSkillIds.size === 0 ? reachableSkillIds.size > 0 : [...preludeSkillIds].some((skillId) => reachableSkillIds.has(skillId)));
		if (isPreludeOnly && reachesTrustedSkillExecution) {
			allowSkillPreludeAtIndex.add(index);
			continue;
		}
		reachableSkillIds.clear();
	}
	const allowlistMatches = [];
	const segments = [];
	const segmentAllowlistEntries = [];
	const segmentSatisfiedBy = [];
	for (const [index, { analysis, evaluation }] of finalizedEvaluations.entries()) {
		const effectiveSegmentSatisfiedBy = allowSkillPreludeAtIndex.has(index) ? analysis.segments.map(() => "skillPrelude") : evaluation.segmentSatisfiedBy;
		const effectiveSegmentAllowlistEntries = allowSkillPreludeAtIndex.has(index) ? analysis.segments.map(() => null) : evaluation.segmentAllowlistEntries;
		segments.push(...analysis.segments);
		allowlistMatches.push(...evaluation.allowlistMatches);
		segmentAllowlistEntries.push(...effectiveSegmentAllowlistEntries);
		segmentSatisfiedBy.push(...effectiveSegmentSatisfiedBy);
		if (!evaluation.allowlistSatisfied && !allowSkillPreludeAtIndex.has(index)) return {
			analysisOk: true,
			allowlistSatisfied: false,
			allowlistMatches,
			segments,
			segmentAllowlistEntries,
			segmentSatisfiedBy
		};
	}
	return {
		analysisOk: true,
		allowlistSatisfied: true,
		allowlistMatches,
		segments,
		segmentAllowlistEntries,
		segmentSatisfiedBy
	};
}
//#endregion
//#region src/infra/jsonl-socket.ts
/**
* Sends one JSONL request line, half-closes the write side, and waits for an accepted response line.
*/
async function requestJsonlSocket(params) {
	const { socketPath, requestLine, timeoutMs, accept } = params;
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
			client.end(`${requestLine}\n`);
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
//#region src/infra/exec-approvals.ts
function normalizeExecHost(value) {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "sandbox" || normalized === "gateway" || normalized === "node") return normalized;
	return null;
}
function normalizeExecTarget(value) {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "auto") return normalized;
	return normalizeExecHost(normalized);
}
/** Coerce a raw JSON field to string, returning undefined for non-string types. */
function toStringOrUndefined(value) {
	return typeof value === "string" ? value : void 0;
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
const DEFAULT_EXEC_APPROVAL_TIMEOUT_MS = 18e5;
const DEFAULT_SECURITY = "full";
const DEFAULT_ASK = "off";
const DEFAULT_EXEC_APPROVAL_ASK_FALLBACK = "full";
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
		const patternKey = normalizeAllowlistPattern(entry.pattern);
		if (!patternKey) return;
		const key = `${patternKey}\x00${entry.argPattern?.trim() ?? ""}`;
		if (seen.has(key)) return;
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
	fsSync.mkdirSync(dir, { recursive: true });
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
function stripAllowlistCommandText(allowlist) {
	if (!Array.isArray(allowlist) || allowlist.length === 0) return allowlist;
	let changed = false;
	const next = allowlist.map((entry) => {
		if (typeof entry.commandText !== "string") return entry;
		changed = true;
		const { commandText: _commandText, ...rest } = entry;
		return rest;
	});
	return changed ? next : allowlist;
}
function sanitizeExecApprovalPolicy(policy) {
	const security = toStringOrUndefined(policy?.security)?.trim();
	const ask = toStringOrUndefined(policy?.ask)?.trim();
	const askFallback = toStringOrUndefined(policy?.askFallback)?.trim();
	return {
		security: security === "deny" || security === "allowlist" || security === "full" ? security : void 0,
		ask: ask === "off" || ask === "on-miss" || ask === "always" ? ask : void 0,
		askFallback: askFallback === "deny" || askFallback === "allowlist" || askFallback === "full" ? askFallback : void 0,
		autoAllowSkills: policy?.autoAllowSkills
	};
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
		const allowlist = stripAllowlistCommandText(ensureAllowlistIds(coerceAllowlistEntries(agent.allowlist)));
		const sanitizedPolicy = sanitizeExecApprovalPolicy(agent);
		if (allowlist !== agent.allowlist || sanitizedPolicy.security !== agent.security || sanitizedPolicy.ask !== agent.ask || sanitizedPolicy.askFallback !== agent.askFallback) agents[key] = {
			...agent,
			allowlist,
			security: sanitizedPolicy.security,
			ask: sanitizedPolicy.ask,
			askFallback: sanitizedPolicy.askFallback
		};
	}
	const sanitizedDefaults = sanitizeExecApprovalPolicy(file.defaults);
	return {
		version: 1,
		socket: {
			path: socketPath && socketPath.length > 0 ? socketPath : void 0,
			token: token && token.length > 0 ? token : void 0
		},
		defaults: { ...sanitizedDefaults },
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
	if (!fsSync.existsSync(filePath)) return {
		path: filePath,
		exists: false,
		raw: null,
		file: normalizeExecApprovals({
			version: 1,
			agents: {}
		}),
		hash: hashExecApprovalsRaw(null)
	};
	const raw = fsSync.readFileSync(filePath, "utf8");
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
		if (!fsSync.existsSync(filePath)) return normalizeExecApprovals({
			version: 1,
			agents: {}
		});
		const raw = fsSync.readFileSync(filePath, "utf8");
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
	fsSync.writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, { mode: 384 });
	try {
		fsSync.chmodSync(filePath, 384);
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
function isExecSecurity(value) {
	return value === "allowlist" || value === "full" || value === "deny";
}
function isExecAsk(value) {
	return value === "always" || value === "off" || value === "on-miss";
}
function normalizeSecurity(value, fallback) {
	return isExecSecurity(value) ? value : fallback;
}
function normalizeAsk(value, fallback) {
	return isExecAsk(value) ? value : fallback;
}
function resolveDefaultSecurityField(params) {
	const defaultValue = params.defaults[params.field];
	if (isExecSecurity(defaultValue)) return {
		value: defaultValue,
		source: `defaults.${params.field}`
	};
	return {
		value: params.fallback,
		source: null
	};
}
function resolveDefaultAskField(params) {
	if (isExecAsk(params.defaults.ask)) return {
		value: params.defaults.ask,
		source: "defaults.ask"
	};
	return {
		value: params.fallback,
		source: null
	};
}
function resolveAgentSecurityField(params) {
	const fallbackField = resolveDefaultSecurityField({
		field: params.field,
		defaults: params.defaults,
		fallback: params.fallback
	});
	if (params.rawAgent[params.field] != null) {
		if (isExecSecurity(params.agent[params.field])) return {
			value: params.agent[params.field],
			source: `agents.${params.agentKey}.${params.field}`
		};
		return fallbackField;
	}
	if (params.rawWildcard[params.field] != null) {
		if (isExecSecurity(params.wildcard[params.field])) return {
			value: params.wildcard[params.field],
			source: `agents.*.${params.field}`
		};
		return fallbackField;
	}
	return fallbackField;
}
function resolveAgentAskField(params) {
	const fallbackField = resolveDefaultAskField({
		defaults: params.defaults,
		fallback: params.fallback
	});
	if (params.rawAgent.ask != null) {
		if (isExecAsk(params.agent.ask)) return {
			value: params.agent.ask,
			source: `agents.${params.agentKey}.ask`
		};
		return fallbackField;
	}
	if (params.rawWildcard.ask != null) {
		if (isExecAsk(params.wildcard.ask)) return {
			value: params.wildcard.ask,
			source: "agents.*.ask"
		};
		return fallbackField;
	}
	return fallbackField;
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
	const rawFile = params.file;
	const file = normalizeExecApprovals(params.file);
	const defaults = file.defaults ?? {};
	const agentKey = params.agentId ?? "main";
	const agent = file.agents?.[agentKey] ?? {};
	const wildcard = file.agents?.["*"] ?? {};
	const rawAgent = rawFile.agents?.[agentKey] ?? {};
	const rawWildcard = rawFile.agents?.["*"] ?? {};
	const fallbackSecurity = params.overrides?.security ?? DEFAULT_SECURITY;
	const fallbackAsk = params.overrides?.ask ?? DEFAULT_ASK;
	const fallbackAskFallback = params.overrides?.askFallback ?? "full";
	const fallbackAutoAllowSkills = params.overrides?.autoAllowSkills ?? DEFAULT_AUTO_ALLOW_SKILLS;
	const resolvedDefaults = {
		security: normalizeSecurity(defaults.security, fallbackSecurity),
		ask: normalizeAsk(defaults.ask, fallbackAsk),
		askFallback: normalizeSecurity(defaults.askFallback ?? fallbackAskFallback, fallbackAskFallback),
		autoAllowSkills: Boolean(defaults.autoAllowSkills ?? fallbackAutoAllowSkills)
	};
	const resolvedAgentSecurity = resolveAgentSecurityField({
		field: "security",
		defaults,
		agent,
		rawAgent,
		wildcard,
		rawWildcard,
		agentKey,
		fallback: resolvedDefaults.security
	});
	const resolvedAgentAsk = resolveAgentAskField({
		defaults,
		agent,
		rawAgent,
		wildcard,
		rawWildcard,
		agentKey,
		fallback: resolvedDefaults.ask
	});
	const resolvedAgentAskFallback = resolveAgentSecurityField({
		field: "askFallback",
		defaults,
		agent,
		rawAgent,
		wildcard,
		rawWildcard,
		agentKey,
		fallback: resolvedDefaults.askFallback
	});
	const resolvedAgent = {
		security: resolvedAgentSecurity.value,
		ask: resolvedAgentAsk.value,
		askFallback: resolvedAgentAskFallback.value,
		autoAllowSkills: Boolean(agent.autoAllowSkills ?? wildcard.autoAllowSkills ?? resolvedDefaults.autoAllowSkills)
	};
	const allowlist = [...Array.isArray(wildcard.allowlist) ? wildcard.allowlist : [], ...Array.isArray(agent.allowlist) ? agent.allowlist : []];
	return {
		path: params.path ?? resolveExecApprovalsPath(),
		socketPath: expandHomePrefix(params.socketPath ?? file.socket?.path ?? resolveExecApprovalsSocketPath()),
		token: params.token ?? file.socket?.token ?? "",
		defaults: resolvedDefaults,
		agent: resolvedAgent,
		agentSources: {
			security: resolvedAgentSecurity.source,
			ask: resolvedAgentAsk.source,
			askFallback: resolvedAgentAskFallback.source
		},
		allowlist,
		file
	};
}
function requiresExecApproval(params) {
	if (params.ask === "always") return true;
	if (params.durableApprovalSatisfied === true) return false;
	return params.ask === "on-miss" && params.security === "allowlist" && (!params.analysisOk || !params.allowlistSatisfied);
}
function hasDurableExecApproval(params) {
	const normalizedCommand = params.commandText?.trim();
	const commandPattern = normalizedCommand ? buildDurableCommandApprovalPattern(normalizedCommand) : null;
	const exactCommandMatch = normalizedCommand ? (params.allowlist ?? []).some((entry) => entry.source === "allow-always" && (entry.pattern === commandPattern || typeof entry.commandText === "string" && entry.commandText.trim() === normalizedCommand)) : false;
	const allowlistMatch = params.analysisOk && params.segmentAllowlistEntries.length > 0 && params.segmentAllowlistEntries.every((entry) => entry?.source === "allow-always");
	return exactCommandMatch || allowlistMatch;
}
function buildDurableCommandApprovalPattern(commandText) {
	return `=command:${crypto.createHash("sha256").update(commandText).digest("hex").slice(0, 16)}`;
}
function recordAllowlistUse(approvals, agentId, entry, command, resolvedPath) {
	const target = agentId ?? "main";
	const agents = approvals.agents ?? {};
	const existing = agents[target] ?? {};
	const nextAllowlist = (Array.isArray(existing.allowlist) ? existing.allowlist : []).map((item) => item.pattern === entry.pattern && (item.argPattern ?? void 0) === (entry.argPattern ?? void 0) ? {
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
function buildAllowlistEntryMatchKey(entry) {
	return `${entry.pattern}\x00${entry.argPattern?.trim() ?? ""}`;
}
function recordAllowlistMatchesUse(params) {
	if (params.matches.length === 0) return;
	const seen = /* @__PURE__ */ new Set();
	for (const match of params.matches) {
		if (!match.pattern) continue;
		const key = buildAllowlistEntryMatchKey(match);
		if (seen.has(key)) continue;
		seen.add(key);
		recordAllowlistUse(params.approvals, params.agentId, match, params.command, params.resolvedPath);
	}
}
function addAllowlistEntry(approvals, agentId, pattern, options) {
	const target = agentId ?? "main";
	const agents = approvals.agents ?? {};
	const existing = agents[target] ?? {};
	const allowlist = Array.isArray(existing.allowlist) ? existing.allowlist : [];
	const trimmed = pattern.trim();
	if (!trimmed) return;
	const trimmedArgPattern = options?.argPattern?.trim() || void 0;
	const existingEntry = allowlist.find((entry) => entry.pattern === trimmed && (entry.argPattern ?? void 0) === trimmedArgPattern);
	if (existingEntry && (!options?.source || existingEntry.source === options.source)) return;
	const now = Date.now();
	const nextAllowlist = existingEntry ? allowlist.map((entry) => entry.pattern === trimmed ? {
		...entry,
		argPattern: trimmedArgPattern,
		source: options?.source ?? entry.source,
		lastUsedAt: now
	} : entry) : [...allowlist, {
		id: crypto.randomUUID(),
		pattern: trimmed,
		argPattern: trimmedArgPattern,
		source: options?.source,
		lastUsedAt: now
	}];
	agents[target] = {
		...existing,
		allowlist: nextAllowlist
	};
	approvals.agents = agents;
	saveExecApprovals(approvals);
}
function addDurableCommandApproval(approvals, agentId, commandText) {
	const normalized = commandText.trim();
	if (!normalized) return;
	addAllowlistEntry(approvals, agentId, buildDurableCommandApprovalPattern(normalized), { source: "allow-always" });
}
function persistAllowAlwaysPatterns(params) {
	const patterns = resolveAllowAlwaysPatternEntries({
		segments: params.segments,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform,
		strictInlineEval: params.strictInlineEval
	});
	for (const pattern of patterns) {
		if (!pattern.pattern) continue;
		addAllowlistEntry(params.approvals, params.agentId, pattern.pattern, {
			argPattern: pattern.argPattern,
			source: "allow-always"
		});
	}
	return patterns;
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
const DEFAULT_EXEC_APPROVAL_DECISIONS = [
	"allow-once",
	"allow-always",
	"deny"
];
function resolveExecApprovalAllowedDecisions(params) {
	if (normalizeExecAsk(params?.ask) === "always") return ["allow-once", "deny"];
	return DEFAULT_EXEC_APPROVAL_DECISIONS;
}
function resolveExecApprovalRequestAllowedDecisions(params) {
	const explicit = Array.isArray(params?.allowedDecisions) ? params.allowedDecisions.filter((decision) => decision === "allow-once" || decision === "allow-always" || decision === "deny") : [];
	return explicit.length > 0 ? explicit : resolveExecApprovalAllowedDecisions({ ask: params?.ask });
}
function isExecApprovalDecisionAllowed(params) {
	return resolveExecApprovalAllowedDecisions({ ask: params.ask }).includes(params.decision);
}
async function requestExecApprovalViaSocket(params) {
	const { socketPath, token, request } = params;
	if (!socketPath || !token) return null;
	const timeoutMs = params.timeoutMs ?? 15e3;
	return await requestJsonlSocket({
		socketPath,
		requestLine: JSON.stringify({
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
export { saveExecApprovals as A, detectInterpreterInlineEvalArgv as B, requiresExecApproval as C, resolveExecApprovalsFromFile as D, resolveExecApprovals as E, normalizeSafeBins as F, resolveAllowAlwaysPatternEntries as I, resolveAllowAlwaysPatterns as L, evaluateExecAllowlist as M, evaluateShellAllowlist as N, resolveExecApprovalsPath as O, isSafeBinUsage as P, resolveSafeBins as R, requestExecApprovalViaSocket as S, resolveExecApprovalRequestAllowedDecisions as T, isInterpreterLikeAllowlistPattern as V, normalizeExecTarget as _, addDurableCommandApproval as a, recordAllowlistMatchesUse as b, isExecApprovalDecisionAllowed as c, mergeExecApprovalsSocketDefaults as d, minSecurity as f, normalizeExecSecurity as g, normalizeExecHost as h, addAllowlistEntry as i, requestJsonlSocket as j, resolveExecApprovalsSocketPath as k, loadExecApprovals as l, normalizeExecAsk as m, DEFAULT_EXEC_APPROVAL_DECISIONS as n, ensureExecApprovals as o, normalizeExecApprovals as p, DEFAULT_EXEC_APPROVAL_TIMEOUT_MS as r, hasDurableExecApproval as s, DEFAULT_EXEC_APPROVAL_ASK_FALLBACK as t, maxAsk as u, persistAllowAlwaysPatterns as v, resolveExecApprovalAllowedDecisions as w, recordAllowlistUse as x, readExecApprovalsSnapshot as y, describeInterpreterInlineEval as z };
