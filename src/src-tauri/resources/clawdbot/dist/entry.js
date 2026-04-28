#!/usr/bin/env node
import { d as isRootHelpInvocation, f as isRootVersionInvocation, r as getCommandPositionalsWithRootOptions } from "./argv-Bh2LLxMT.js";
import { t as isMainModule } from "./is-main-BEaTwLZn.js";
import { t as resolveCliArgvInvocation } from "./argv-invocation-C0QUafZn.js";
import { a as parseCliContainerArgs, n as applyCliProfileEnv, o as resolveCliContainerTarget, r as parseCliProfileArgs, t as normalizeWindowsArgv } from "./windows-argv-LT6IiqDq.js";
import { t as resolveNodeStartupTlsEnvironment } from "./node-startup-env-Cg_zR9VI.js";
import { i as normalizeEnv, t as isTruthyEnvValue } from "./env-BAymvSVL.js";
import { t as ensureOpenClawExecMarkerOnProcess } from "./openclaw-exec-env-DOC4eAq6.js";
import { t as installProcessWarningFilter } from "./warning-filter-BArCOGlQ.js";
import { t as attachChildProcessBridge } from "./child-process-bridge-BMx3So6b.js";
import { enableCompileCache } from "node:module";
import process$1 from "node:process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn } from "node:child_process";
//#region src/cli/respawn-policy.ts
const GATEWAY_RUN_BOOLEAN_FLAGS = [
	"--allow-unconfigured",
	"--claude-cli-logs",
	"--cli-backend-logs",
	"--compact",
	"--dev",
	"--force",
	"--raw-stream",
	"--reset",
	"--tailscale-reset-on-exit",
	"--verbose"
];
const GATEWAY_RUN_VALUE_FLAGS = [
	"--auth",
	"--bind",
	"--password",
	"--password-file",
	"--port",
	"--raw-stream-path",
	"--tailscale",
	"--token",
	"--ws-log"
];
function isForegroundGatewayRunArgv(argv) {
	const positionals = getCommandPositionalsWithRootOptions(argv, {
		commandPath: ["gateway"],
		booleanFlags: GATEWAY_RUN_BOOLEAN_FLAGS,
		valueFlags: GATEWAY_RUN_VALUE_FLAGS
	});
	if (!positionals) return false;
	return positionals.length === 0 || positionals.length === 1 && positionals[0] === "run";
}
function shouldSkipRespawnForArgv(argv) {
	const invocation = resolveCliArgvInvocation(argv);
	return invocation.hasHelpOrVersion || invocation.primary === "gateway" && isForegroundGatewayRunArgv(argv);
}
//#endregion
//#region src/entry.respawn.ts
const EXPERIMENTAL_WARNING_FLAG = "--disable-warning=ExperimentalWarning";
const OPENCLAW_NODE_OPTIONS_READY = "OPENCLAW_NODE_OPTIONS_READY";
const OPENCLAW_NODE_EXTRA_CA_CERTS_READY = "OPENCLAW_NODE_EXTRA_CA_CERTS_READY";
function pathModuleForPlatform(platform) {
	return platform === "win32" ? path.win32 : path.posix;
}
function resolveCliRespawnCommand(params) {
	const basename = pathModuleForPlatform(params.platform ?? process.platform).basename(params.execPath).toLowerCase();
	if (basename === "volta-shim" || basename === "volta-shim.exe") return "node";
	return params.execPath;
}
function hasExperimentalWarningSuppressed(params = {}) {
	const env = params.env ?? process.env;
	const execArgv = params.execArgv ?? process.execArgv;
	const nodeOptions = env.NODE_OPTIONS ?? "";
	if (nodeOptions.includes("--disable-warning=ExperimentalWarning") || nodeOptions.includes("--no-warnings")) return true;
	return execArgv.some((arg) => arg === "--disable-warning=ExperimentalWarning" || arg === "--no-warnings");
}
function buildCliRespawnPlan(params = {}) {
	const argv = params.argv ?? process.argv;
	const env = params.env ?? process.env;
	const execArgv = params.execArgv ?? process.execArgv;
	const execPath = params.execPath ?? process.execPath;
	const platform = params.platform ?? process.platform;
	if (shouldSkipRespawnForArgv(argv) || isTruthyEnvValue(env.OPENCLAW_NO_RESPAWN)) return null;
	if (platform === "win32") return null;
	const childEnv = { ...env };
	const childExecArgv = [...execArgv];
	let needsRespawn = false;
	const autoNodeExtraCaCerts = params.autoNodeExtraCaCerts ?? resolveNodeStartupTlsEnvironment({
		env,
		execPath,
		includeDarwinDefaults: false
	}).NODE_EXTRA_CA_CERTS;
	if (autoNodeExtraCaCerts && !isTruthyEnvValue(env["OPENCLAW_NODE_EXTRA_CA_CERTS_READY"]) && !env.NODE_EXTRA_CA_CERTS) {
		childEnv.NODE_EXTRA_CA_CERTS = autoNodeExtraCaCerts;
		childEnv[OPENCLAW_NODE_EXTRA_CA_CERTS_READY] = "1";
		needsRespawn = true;
	}
	if (!isTruthyEnvValue(env["OPENCLAW_NODE_OPTIONS_READY"]) && !hasExperimentalWarningSuppressed({
		env,
		execArgv
	})) {
		childEnv[OPENCLAW_NODE_OPTIONS_READY] = "1";
		childExecArgv.unshift(EXPERIMENTAL_WARNING_FLAG);
		needsRespawn = true;
	}
	if (!needsRespawn) return null;
	return {
		command: resolveCliRespawnCommand({
			execPath,
			platform
		}),
		argv: [...childExecArgv, ...argv.slice(1)],
		env: childEnv
	};
}
//#endregion
//#region src/entry.version-fast-path.ts
function tryHandleRootVersionFastPath(argv, deps = {}) {
	if (resolveCliContainerTarget(argv, deps.env)) return false;
	if (!isRootVersionInvocation(argv)) return false;
	const output = deps.output ?? ((message) => console.log(message));
	const exit = deps.exit ?? ((code) => process.exit(code));
	const onError = deps.onError ?? ((error) => {
		console.error("[openclaw] Failed to resolve version:", error instanceof Error ? error.stack ?? error.message : error);
		process.exitCode = 1;
	});
	(deps.resolveVersion ?? (async () => {
		const [{ VERSION }, { resolveCommitHash }] = await Promise.all([import("./version-CADiJ9_Z.js"), import("./git-commit-B2RwgVZk.js")]);
		return {
			VERSION,
			resolveCommitHash
		};
	}))().then(({ VERSION, resolveCommitHash }) => {
		const commit = resolveCommitHash({ moduleUrl: deps.moduleUrl ?? import.meta.url });
		output(commit ? `OpenClaw ${VERSION} (${commit})` : `OpenClaw ${VERSION}`);
		exit(0);
	}).catch(onError);
	return true;
}
//#endregion
//#region src/entry.ts
const ENTRY_WRAPPER_PAIRS = [{
	wrapperBasename: "openclaw.mjs",
	entryBasename: "entry.js"
}, {
	wrapperBasename: "openclaw.js",
	entryBasename: "entry.js"
}];
function shouldForceReadOnlyAuthStore(argv) {
	const tokens = argv.slice(2).filter((token) => token.length > 0 && !token.startsWith("-"));
	for (let index = 0; index < tokens.length - 1; index += 1) if (tokens[index] === "secrets" && tokens[index + 1] === "audit") return true;
	return false;
}
if (!isMainModule({
	currentFile: fileURLToPath(import.meta.url),
	wrapperEntryPairs: [...ENTRY_WRAPPER_PAIRS]
})) {} else {
	process$1.title = "openclaw";
	ensureOpenClawExecMarkerOnProcess();
	installProcessWarningFilter();
	normalizeEnv();
	if (!isTruthyEnvValue(process$1.env.NODE_DISABLE_COMPILE_CACHE)) try {
		enableCompileCache();
	} catch {}
	if (shouldForceReadOnlyAuthStore(process$1.argv)) process$1.env.OPENCLAW_AUTH_STORE_READONLY = "1";
	if (process$1.argv.includes("--no-color")) {
		process$1.env.NO_COLOR = "1";
		process$1.env.FORCE_COLOR = "0";
	}
	function ensureCliRespawnReady() {
		const plan = buildCliRespawnPlan();
		if (!plan) return false;
		const child = spawn(plan.command, plan.argv, {
			stdio: "inherit",
			env: plan.env
		});
		attachChildProcessBridge(child);
		child.once("exit", (code, signal) => {
			if (signal) {
				process$1.exitCode = 1;
				return;
			}
			process$1.exit(code ?? 1);
		});
		child.once("error", (error) => {
			console.error("[openclaw] Failed to respawn CLI:", error instanceof Error ? error.stack ?? error.message : error);
			process$1.exit(1);
		});
		return true;
	}
	process$1.argv = normalizeWindowsArgv(process$1.argv);
	if (!ensureCliRespawnReady()) {
		const parsedContainer = parseCliContainerArgs(process$1.argv);
		if (!parsedContainer.ok) {
			console.error(`[openclaw] ${parsedContainer.error}`);
			process$1.exit(2);
		}
		const parsed = parseCliProfileArgs(parsedContainer.argv);
		if (!parsed.ok) {
			console.error(`[openclaw] ${parsed.error}`);
			process$1.exit(2);
		}
		if (resolveCliContainerTarget(process$1.argv) && parsed.profile) {
			console.error("[openclaw] --container cannot be combined with --profile/--dev");
			process$1.exit(2);
		}
		if (parsed.profile) {
			applyCliProfileEnv({ profile: parsed.profile });
			process$1.argv = parsed.argv;
		}
		if (!tryHandleRootVersionFastPath(process$1.argv)) await runMainOrRootHelp(process$1.argv);
	}
}
async function tryHandleRootHelpFastPath(argv, deps = {}) {
	if (resolveCliContainerTarget(argv, deps.env)) return false;
	if (!isRootHelpInvocation(argv)) return false;
	const handleError = deps.onError ?? ((error) => {
		console.error("[openclaw] Failed to display help:", error instanceof Error ? error.stack ?? error.message : error);
		process$1.exitCode = 1;
	});
	try {
		if (deps.outputRootHelp) {
			await deps.outputRootHelp();
			return true;
		}
		if (!(deps.outputPrecomputedRootHelpText ?? (await import("./root-help-metadata-DK0ege7M.js")).outputPrecomputedRootHelpText)()) {
			const { outputRootHelp } = await import("./root-help-CcutKxHf.js");
			await outputRootHelp();
		}
		return true;
	} catch (error) {
		handleError(error);
		return true;
	}
}
async function runMainOrRootHelp(argv) {
	if (await tryHandleRootHelpFastPath(argv)) return;
	try {
		const { runCli } = await import("./cli/run-main.js");
		await runCli(argv);
	} catch (error) {
		console.error("[openclaw] Failed to start CLI:", error instanceof Error ? error.stack ?? error.message : error);
		process$1.exitCode = 1;
	}
}
//#endregion
export { tryHandleRootHelpFastPath };
