import { G as normalizeSafeBinName, H as normalizeTrustedSafeBinDirs, Ot as normalizeSafeBinProfileFixtures, Tt as normalizeExecutableToken, V as listWritableExplicitTrustedSafeBinDirs, kt as resolveSafeBinProfiles, z as getTrustedSafeBinDirs } from "./io-y3Az_Onx.js";
import { E as resolveSafeBins } from "./exec-approvals-BF_Qfdq8.js";
//#region src/infra/exec-safe-bin-runtime-policy.ts
const INTERPRETER_LIKE_SAFE_BINS = new Set([
	"ash",
	"bash",
	"busybox",
	"bun",
	"cmd",
	"cmd.exe",
	"cscript",
	"dash",
	"deno",
	"fish",
	"ksh",
	"lua",
	"node",
	"nodejs",
	"perl",
	"php",
	"powershell",
	"powershell.exe",
	"pypy",
	"pwsh",
	"pwsh.exe",
	"python",
	"python2",
	"python3",
	"ruby",
	"sh",
	"toybox",
	"wscript",
	"zsh"
]);
const INTERPRETER_LIKE_PATTERNS = [
	/^python\d+(?:\.\d+)?$/,
	/^ruby\d+(?:\.\d+)?$/,
	/^perl\d+(?:\.\d+)?$/,
	/^php\d+(?:\.\d+)?$/,
	/^node\d+(?:\.\d+)?$/
];
function isInterpreterLikeSafeBin(raw) {
	const normalized = normalizeSafeBinName(raw);
	if (!normalized) return false;
	if (INTERPRETER_LIKE_SAFE_BINS.has(normalized)) return true;
	return INTERPRETER_LIKE_PATTERNS.some((pattern) => pattern.test(normalized));
}
function listInterpreterLikeSafeBins(entries) {
	return Array.from(entries).map((entry) => normalizeSafeBinName(entry)).filter((entry) => entry.length > 0 && isInterpreterLikeSafeBin(entry)).toSorted();
}
function resolveMergedSafeBinProfileFixtures(params) {
	const global = normalizeSafeBinProfileFixtures(params.global?.safeBinProfiles);
	const local = normalizeSafeBinProfileFixtures(params.local?.safeBinProfiles);
	if (Object.keys(global).length === 0 && Object.keys(local).length === 0) return;
	return {
		...global,
		...local
	};
}
function resolveExecSafeBinRuntimePolicy(params) {
	const safeBins = resolveSafeBins(params.local?.safeBins ?? params.global?.safeBins);
	const safeBinProfiles = resolveSafeBinProfiles(resolveMergedSafeBinProfileFixtures({
		global: params.global,
		local: params.local
	}));
	const unprofiledSafeBins = Array.from(safeBins).filter((entry) => !safeBinProfiles[entry]).toSorted();
	const explicitTrustedSafeBinDirs = [...normalizeTrustedSafeBinDirs(params.global?.safeBinTrustedDirs), ...normalizeTrustedSafeBinDirs(params.local?.safeBinTrustedDirs)];
	const trustedSafeBinDirs = getTrustedSafeBinDirs({ extraDirs: explicitTrustedSafeBinDirs });
	const writableTrustedSafeBinDirs = listWritableExplicitTrustedSafeBinDirs(explicitTrustedSafeBinDirs);
	if (params.onWarning) for (const hit of writableTrustedSafeBinDirs) {
		const scope = hit.worldWritable || hit.groupWritable ? hit.worldWritable ? "world-writable" : "group-writable" : "writable";
		params.onWarning(`exec: safeBinTrustedDirs includes ${scope} directory '${hit.dir}'; remove trust or tighten permissions (for example chmod 755).`);
	}
	return {
		safeBins,
		safeBinProfiles,
		trustedSafeBinDirs,
		unprofiledSafeBins,
		unprofiledInterpreterSafeBins: listInterpreterLikeSafeBins(unprofiledSafeBins),
		writableTrustedSafeBinDirs
	};
}
//#endregion
//#region src/infra/exec-inline-eval.ts
const INTERPRETER_INLINE_EVAL_SPECS = [
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
	}
];
const INTERPRETER_INLINE_EVAL_NAMES = new Set(INTERPRETER_INLINE_EVAL_SPECS.flatMap((entry) => entry.names));
function findInterpreterSpec(executable) {
	const normalized = normalizeExecutableToken(executable);
	for (const spec of INTERPRETER_INLINE_EVAL_SPECS) if (spec.names.includes(normalized)) return spec;
	return null;
}
function detectInterpreterInlineEvalArgv(argv) {
	if (!Array.isArray(argv) || argv.length === 0) return null;
	const executable = argv[0]?.trim();
	if (!executable) return null;
	const spec = findInterpreterSpec(executable);
	if (!spec) return null;
	for (let idx = 1; idx < argv.length; idx += 1) {
		const token = argv[idx]?.trim();
		if (!token) continue;
		if (token === "--") break;
		const lower = token.toLowerCase();
		if (spec.exactFlags.has(lower)) return {
			executable,
			normalizedExecutable: normalizeExecutableToken(executable),
			flag: lower,
			argv
		};
		if (spec.prefixFlags?.some((prefix) => lower.startsWith(prefix))) return {
			executable,
			normalizedExecutable: normalizeExecutableToken(executable),
			flag: lower,
			argv
		};
	}
	return null;
}
function describeInterpreterInlineEval(hit) {
	return `${hit.normalizedExecutable} ${hit.flag}`;
}
function isInterpreterLikeAllowlistPattern(pattern) {
	const trimmed = pattern?.trim().toLowerCase() ?? "";
	if (!trimmed) return false;
	const normalized = normalizeExecutableToken(trimmed);
	if (INTERPRETER_INLINE_EVAL_NAMES.has(normalized)) return true;
	const basename = trimmed.replace(/\\/g, "/").split("/").pop() ?? trimmed;
	const strippedWildcards = (basename.endsWith(".exe") ? basename.slice(0, -4) : basename).replace(/[*?[\]{}()]/g, "");
	return INTERPRETER_INLINE_EVAL_NAMES.has(strippedWildcards);
}
//#endregion
export { listInterpreterLikeSafeBins as a, isInterpreterLikeSafeBin as i, detectInterpreterInlineEvalArgv as n, resolveExecSafeBinRuntimePolicy as o, isInterpreterLikeAllowlistPattern as r, resolveMergedSafeBinProfileFixtures as s, describeInterpreterInlineEval as t };
