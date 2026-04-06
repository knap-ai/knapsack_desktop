import { i as formatUncaughtError } from "./errors-Bs2h5H8p.js";
import { t as isMainModule } from "./is-main-Bv5ej4lF.js";
import { A as hasFlag, D as getPositiveIntFlagValue, E as getFlagValue, L as isValueToken, N as isRootHelpInvocation, O as getPrimaryCommand, T as getCommandPositionalsWithRootOptions, g as loggingState, j as hasHelpOrVersion, k as getVerboseFlag, w as getCommandPathWithRootOptions } from "./logger-BCzP_yik.js";
import { a as parseCliContainerArgs, i as maybeRunCliInContainer, n as applyCliProfileEnv, r as parseCliProfileArgs, t as normalizeWindowsArgv } from "./windows-argv-Du_SFYfh.js";
import { a as enableConsoleCapture, m as defaultRuntime } from "./subsystem-CJEvHE2o.js";
import { r as normalizeEnv, t as isTruthyEnvValue } from "./env-CjUKd1aw.js";
import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { t as assertSupportedRuntime } from "./runtime-guard-BCwhwHbX.js";
import "./logging-C0VWvR36.js";
import { o as hasMemoryRuntime } from "./memory-state-sKCT2k_7.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-B59X7N6X.js";
import process$1 from "node:process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
//#region src/cli/program/routes.ts
const routeHealth = {
	match: (path) => path[0] === "health",
	loadPlugins: (argv) => !hasFlag(argv, "--json"),
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
		if (timeoutMs === null) return false;
		const { healthCommand } = await import("./health-BQ2q_h1M.js");
		await healthCommand({
			json,
			timeoutMs,
			verbose
		}, defaultRuntime);
		return true;
	}
};
const routeStatus = {
	match: (path) => path[0] === "status",
	loadPlugins: (argv) => !hasFlag(argv, "--json"),
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const deep = hasFlag(argv, "--deep");
		const all = hasFlag(argv, "--all");
		const usage = hasFlag(argv, "--usage");
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
		if (timeoutMs === null) return false;
		if (json) {
			const { statusJsonCommand } = await import("./status-json-CrrolMZb.js");
			await statusJsonCommand({
				deep,
				all,
				usage,
				timeoutMs
			}, defaultRuntime);
			return true;
		}
		const { statusCommand } = await import("./status-l4797dGG.js");
		await statusCommand({
			json,
			deep,
			all,
			usage,
			timeoutMs,
			verbose
		}, defaultRuntime);
		return true;
	}
};
const routeGatewayStatus = {
	match: (path) => path[0] === "gateway" && path[1] === "status",
	run: async (argv) => {
		const url = getFlagValue(argv, "--url");
		if (url === null) return false;
		const token = getFlagValue(argv, "--token");
		if (token === null) return false;
		const password = getFlagValue(argv, "--password");
		if (password === null) return false;
		const timeout = getFlagValue(argv, "--timeout");
		if (timeout === null) return false;
		const ssh = getFlagValue(argv, "--ssh");
		if (ssh === null) return false;
		if (ssh !== void 0) return false;
		const sshIdentity = getFlagValue(argv, "--ssh-identity");
		if (sshIdentity === null) return false;
		if (sshIdentity !== void 0) return false;
		if (hasFlag(argv, "--ssh-auto")) return false;
		const deep = hasFlag(argv, "--deep");
		const json = hasFlag(argv, "--json");
		const requireRpc = hasFlag(argv, "--require-rpc");
		const probe = !hasFlag(argv, "--no-probe");
		const { runDaemonStatus } = await import("./status-Dm1C3RGy.js");
		await runDaemonStatus({
			rpc: {
				url: url ?? void 0,
				token: token ?? void 0,
				password: password ?? void 0,
				timeout: timeout ?? void 0
			},
			probe,
			requireRpc,
			deep,
			json
		});
		return true;
	}
};
const routeSessions = {
	match: (path) => path[0] === "sessions" && !path[1],
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const allAgents = hasFlag(argv, "--all-agents");
		const agent = getFlagValue(argv, "--agent");
		if (agent === null) return false;
		const store = getFlagValue(argv, "--store");
		if (store === null) return false;
		const active = getFlagValue(argv, "--active");
		if (active === null) return false;
		const { sessionsCommand } = await import("./sessions-Be86aLen.js");
		await sessionsCommand({
			json,
			store,
			agent,
			allAgents,
			active
		}, defaultRuntime);
		return true;
	}
};
const routeAgentsList = {
	match: (path) => path[0] === "agents" && path[1] === "list",
	run: async (argv) => {
		const json = hasFlag(argv, "--json");
		const bindings = hasFlag(argv, "--bindings");
		const { agentsListCommand } = await import("./agents-DaS6H8SY.js");
		await agentsListCommand({
			json,
			bindings
		}, defaultRuntime);
		return true;
	}
};
function getFlagValues(argv, name) {
	const values = [];
	const args = argv.slice(2);
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (!arg || arg === "--") break;
		if (arg === name) {
			const next = args[i + 1];
			if (!isValueToken(next)) return null;
			values.push(next);
			i += 1;
			continue;
		}
		if (arg.startsWith(`${name}=`)) {
			const value = arg.slice(name.length + 1).trim();
			if (!value) return null;
			values.push(value);
		}
	}
	return values;
}
const routes = [
	routeHealth,
	routeStatus,
	routeGatewayStatus,
	routeSessions,
	routeAgentsList,
	{
		match: (path) => path[0] === "config" && path[1] === "get",
		run: async (argv) => {
			const positionals = getCommandPositionalsWithRootOptions(argv, {
				commandPath: ["config", "get"],
				booleanFlags: ["--json"]
			});
			if (!positionals || positionals.length !== 1) return false;
			const pathArg = positionals[0];
			if (!pathArg) return false;
			const json = hasFlag(argv, "--json");
			const { runConfigGet } = await import("./config-cli-CIOJFCb_.js");
			await runConfigGet({
				path: pathArg,
				json
			});
			return true;
		}
	},
	{
		match: (path) => path[0] === "config" && path[1] === "unset",
		run: async (argv) => {
			const positionals = getCommandPositionalsWithRootOptions(argv, { commandPath: ["config", "unset"] });
			if (!positionals || positionals.length !== 1) return false;
			const pathArg = positionals[0];
			if (!pathArg) return false;
			const { runConfigUnset } = await import("./config-cli-CIOJFCb_.js");
			await runConfigUnset({ path: pathArg });
			return true;
		}
	},
	{
		match: (path) => path[0] === "models" && path[1] === "list",
		run: async (argv) => {
			const provider = getFlagValue(argv, "--provider");
			if (provider === null) return false;
			const all = hasFlag(argv, "--all");
			const local = hasFlag(argv, "--local");
			const json = hasFlag(argv, "--json");
			const plain = hasFlag(argv, "--plain");
			const { modelsListCommand } = await import("./models-CiwgHBoG.js");
			await modelsListCommand({
				all,
				local,
				provider,
				json,
				plain
			}, defaultRuntime);
			return true;
		}
	},
	{
		match: (path) => path[0] === "models" && path[1] === "status",
		run: async (argv) => {
			const probeProvider = getFlagValue(argv, "--probe-provider");
			if (probeProvider === null) return false;
			const probeTimeout = getFlagValue(argv, "--probe-timeout");
			if (probeTimeout === null) return false;
			const probeConcurrency = getFlagValue(argv, "--probe-concurrency");
			if (probeConcurrency === null) return false;
			const probeMaxTokens = getFlagValue(argv, "--probe-max-tokens");
			if (probeMaxTokens === null) return false;
			const agent = getFlagValue(argv, "--agent");
			if (agent === null) return false;
			const probeProfileValues = getFlagValues(argv, "--probe-profile");
			if (probeProfileValues === null) return false;
			const probeProfile = probeProfileValues.length === 0 ? void 0 : probeProfileValues.length === 1 ? probeProfileValues[0] : probeProfileValues;
			const json = hasFlag(argv, "--json");
			const plain = hasFlag(argv, "--plain");
			const check = hasFlag(argv, "--check");
			const probe = hasFlag(argv, "--probe");
			const { modelsStatusCommand } = await import("./models-CiwgHBoG.js");
			await modelsStatusCommand({
				json,
				plain,
				check,
				probe,
				probeProvider,
				probeProfile,
				probeTimeout,
				probeConcurrency,
				probeMaxTokens,
				agent
			}, defaultRuntime);
			return true;
		}
	}
];
function findRoutedCommand(path) {
	for (const route of routes) if (route.match(path)) return route;
	return null;
}
//#endregion
//#region src/cli/route.ts
async function prepareRoutedCommand(params) {
	const suppressDoctorStdout = hasFlag(params.argv, "--json");
	const skipConfigGuard = params.commandPath[0] === "status" && suppressDoctorStdout;
	if (!suppressDoctorStdout && process.stdout.isTTY) {
		const [{ emitCliBanner }, { VERSION }] = await Promise.all([import("./banner-DWauYHiS.js"), import("./version-OQ5Vc2CQ.js")]);
		emitCliBanner(VERSION, { argv: params.argv });
	}
	if (!skipConfigGuard) {
		const { ensureConfigReady } = await import("./config-guard-EuAPqRfK.js");
		await ensureConfigReady({
			runtime: defaultRuntime,
			commandPath: params.commandPath,
			...suppressDoctorStdout ? { suppressDoctorStdout: true } : {}
		});
	}
	if (typeof params.loadPlugins === "function" ? params.loadPlugins(params.argv) : params.loadPlugins) {
		const { ensurePluginRegistryLoaded } = await import("./plugin-registry-DrIHL3fI.js");
		const prev = loggingState.forceConsoleToStderr;
		if (suppressDoctorStdout) loggingState.forceConsoleToStderr = true;
		try {
			ensurePluginRegistryLoaded({ scope: params.commandPath[0] === "status" || params.commandPath[0] === "health" ? "channels" : "all" });
		} finally {
			loggingState.forceConsoleToStderr = prev;
		}
	}
}
async function tryRouteCli(argv) {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_ROUTE_FIRST)) return false;
	if (hasHelpOrVersion(argv)) return false;
	const path = getCommandPathWithRootOptions(argv, 2);
	if (!path[0]) return false;
	const route = findRoutedCommand(path);
	if (!route) return false;
	await prepareRoutedCommand({
		argv,
		commandPath: path,
		loadPlugins: route.loadPlugins
	});
	return route.run(argv);
}
//#endregion
//#region src/cli/run-main.ts
async function closeCliMemoryManagers() {
	if (!hasMemoryRuntime()) return;
	try {
		const { closeActiveMemorySearchManagers } = await import("./memory-runtime-WVsUx4vk.js");
		await closeActiveMemorySearchManagers();
	} catch {}
}
function rewriteUpdateFlagArgv(argv) {
	const index = argv.indexOf("--update");
	if (index === -1) return argv;
	const next = [...argv];
	next.splice(index, 1, "update");
	return next;
}
function shouldRegisterPrimarySubcommand(argv) {
	return !hasHelpOrVersion(argv);
}
function shouldSkipPluginCommandRegistration(params) {
	if (params.hasBuiltinPrimary) return true;
	if (!params.primary) return hasHelpOrVersion(params.argv);
	return false;
}
function shouldEnsureCliPath(argv) {
	if (hasHelpOrVersion(argv)) return false;
	const [primary, secondary] = getCommandPathWithRootOptions(argv, 2);
	if (!primary) return true;
	if (primary === "status" || primary === "health" || primary === "sessions") return false;
	if (primary === "config" && (secondary === "get" || secondary === "unset")) return false;
	if (primary === "models" && (secondary === "list" || secondary === "status")) return false;
	return true;
}
function shouldUseRootHelpFastPath(argv) {
	return isRootHelpInvocation(argv);
}
function resolveMissingBrowserCommandMessage(config) {
	const allow = Array.isArray(config?.plugins?.allow) && config.plugins.allow.length > 0 ? config.plugins.allow.filter((entry) => typeof entry === "string").map((entry) => entry.trim().toLowerCase()) : [];
	if (allow.length > 0 && !allow.includes("browser")) return "The `openclaw browser` command is unavailable because `plugins.allow` excludes \"browser\". Add \"browser\" to `plugins.allow` if you want the bundled browser CLI and tool.";
	if (config?.plugins?.entries?.browser?.enabled === false) return "The `openclaw browser` command is unavailable because `plugins.entries.browser.enabled=false`. Re-enable that entry if you want the bundled browser CLI and tool.";
	return null;
}
function shouldLoadCliDotEnv(env = process$1.env) {
	if (existsSync(path.join(process$1.cwd(), ".env"))) return true;
	return existsSync(path.join(resolveStateDir(env), ".env"));
}
async function runCli(argv = process$1.argv) {
	const originalArgv = normalizeWindowsArgv(argv);
	const parsedContainer = parseCliContainerArgs(originalArgv);
	if (!parsedContainer.ok) throw new Error(parsedContainer.error);
	const parsedProfile = parseCliProfileArgs(parsedContainer.argv);
	if (!parsedProfile.ok) throw new Error(parsedProfile.error);
	if (parsedProfile.profile) applyCliProfileEnv({ profile: parsedProfile.profile });
	if ((parsedContainer.container ?? process$1.env.OPENCLAW_CONTAINER?.trim() ?? null) && parsedProfile.profile) throw new Error("--container cannot be combined with --profile/--dev");
	const containerTarget = maybeRunCliInContainer(originalArgv);
	if (containerTarget.handled) {
		if (containerTarget.exitCode !== 0) process$1.exitCode = containerTarget.exitCode;
		return;
	}
	let normalizedArgv = parsedProfile.argv;
	if (shouldLoadCliDotEnv()) {
		const { loadCliDotEnv } = await import("./dotenv-Bry0-0uy.js");
		loadCliDotEnv({ quiet: true });
	}
	normalizeEnv();
	if (shouldEnsureCliPath(normalizedArgv)) ensureOpenClawCliOnPath();
	assertSupportedRuntime();
	try {
		if (shouldUseRootHelpFastPath(normalizedArgv)) {
			const { outputRootHelp } = await import("./root-help-D_fXYW_4.js");
			await outputRootHelp();
			return;
		}
		if (await tryRouteCli(normalizedArgv)) return;
		enableConsoleCapture();
		const { buildProgram } = await import("./program-4nvJHrAo.js");
		const program = buildProgram();
		const { installUnhandledRejectionHandler } = await import("./unhandled-rejections-sbS5ekhl.js");
		installUnhandledRejectionHandler();
		process$1.on("uncaughtException", (error) => {
			console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
			process$1.exit(1);
		});
		const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
		const primary = getPrimaryCommand(parseArgv);
		if (primary) {
			const { getProgramContext } = await import("./program-context-BNo6DfvE.js");
			const ctx = getProgramContext(program);
			if (ctx) {
				const { registerCoreCliByName } = await import("./command-registry-B-YEti4A.js");
				await registerCoreCliByName(program, ctx, primary, parseArgv);
			}
			const { registerSubCliByName } = await import("./register.subclis-Mz2VmhNn.js");
			await registerSubCliByName(program, primary);
		}
		if (!shouldSkipPluginCommandRegistration({
			argv: parseArgv,
			primary,
			hasBuiltinPrimary: primary !== null && program.commands.some((command) => command.name() === primary)
		})) {
			const { registerPluginCliCommands } = await import("./cli-dFdFYu4S.js");
			const { loadValidatedConfigForPluginRegistration } = await import("./register.subclis-Mz2VmhNn.js");
			const config = await loadValidatedConfigForPluginRegistration();
			if (config) {
				await registerPluginCliCommands(program, config, void 0, void 0, {
					mode: "lazy",
					primary
				});
				if (primary === "browser" && !program.commands.some((command) => command.name() === "browser")) {
					const browserCommandMessage = resolveMissingBrowserCommandMessage(config);
					if (browserCommandMessage) throw new Error(browserCommandMessage);
				}
			}
		}
		await program.parseAsync(parseArgv);
	} finally {
		await closeCliMemoryManagers();
	}
}
function isCliMainModule() {
	return isMainModule({ currentFile: fileURLToPath(import.meta.url) });
}
//#endregion
export { isCliMainModule, resolveMissingBrowserCommandMessage, rewriteUpdateFlagArgv, runCli, shouldEnsureCliPath, shouldRegisterPrimarySubcommand, shouldSkipPluginCommandRegistration, shouldUseRootHelpFastPath };
