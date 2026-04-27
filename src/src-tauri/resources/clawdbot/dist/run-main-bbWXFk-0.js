import { a as formatUncaughtError } from "./errors-Jbvi20TW.js";
import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { A as getPositiveIntFlagValue, B as isValueToken, M as getVerboseFlag, N as hasFlag, O as getCommandPositionalsWithRootOptions, k as getFlagValue } from "./logger-x0IvPL2B.js";
import { t as resolveCliArgvInvocation } from "./argv-invocation-BgdldYWV.js";
import { a as parseCliContainerArgs, i as maybeRunCliInContainer, n as applyCliProfileEnv, r as parseCliProfileArgs, t as normalizeWindowsArgv } from "./windows-argv-EWRb4fAz.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { a as enableConsoleCapture } from "./subsystem-CWI_MDy_.js";
import { i as normalizeEnv, t as isTruthyEnvValue } from "./env-BgREcPbG.js";
import { _ as resolveStateDir } from "./paths-BG0ad0P6.js";
import { t as assertSupportedRuntime } from "./runtime-guard-k7yNlhML.js";
import { t as resolveManifestCommandAliasOwner } from "./manifest-command-aliases.runtime-B2eBfvwf.js";
import { s as hasMemoryRuntime } from "./memory-state-I5DhT9-V.js";
import "./logging-DFHb42Bl.js";
import { i as initializeDebugProxyCapture, r as finalizeDebugProxyCapture } from "./runtime-CadHRMLo.js";
import { r as ensureGlobalUndiciEnvProxyDispatcher } from "./undici-global-dispatcher-KzKcGOUY.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-C1khoDvK.js";
import { i as shouldSkipPluginCommandRegistration, n as shouldRegisterPrimaryCommandOnly } from "./command-registration-policy-ckbz_7MV.js";
import { a as shouldEnsureCliPathForCommandPath, c as cliCommandCatalog, n as ensureCliExecutionBootstrap, o as resolveCliCommandPathPolicy, r as resolveCliExecutionStartupContext, s as matchesCommandPath, t as applyCliExecutionStartupPresentation } from "./command-execution-startup-Ch01qcCp.js";
import { n as maybeWarnAboutDebugProxyCoverage } from "./coverage-CQsSsbad.js";
import process$1 from "node:process";
import "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
import { CommanderError } from "commander";
//#region src/cli/program/route-args.ts
function parseOptionalFlagValue(argv, name) {
	const value = getFlagValue(argv, name);
	if (value === null) return { ok: false };
	return {
		ok: true,
		value
	};
}
function parseRepeatedFlagValues(argv, name) {
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
function parseSinglePositional(argv, params) {
	const positionals = getCommandPositionalsWithRootOptions(argv, params);
	if (!positionals || positionals.length !== 1) return null;
	return positionals[0] ?? null;
}
function parseHealthRouteArgs(argv) {
	const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
	if (timeoutMs === null) return null;
	return {
		json: hasFlag(argv, "--json"),
		verbose: getVerboseFlag(argv, { includeDebug: true }),
		timeoutMs
	};
}
function parseStatusRouteArgs(argv) {
	const timeoutMs = getPositiveIntFlagValue(argv, "--timeout");
	if (timeoutMs === null) return null;
	return {
		json: hasFlag(argv, "--json"),
		deep: hasFlag(argv, "--deep"),
		all: hasFlag(argv, "--all"),
		usage: hasFlag(argv, "--usage"),
		verbose: getVerboseFlag(argv, { includeDebug: true }),
		timeoutMs
	};
}
function parseGatewayStatusRouteArgs(argv) {
	const url = parseOptionalFlagValue(argv, "--url");
	if (!url.ok) return null;
	const token = parseOptionalFlagValue(argv, "--token");
	if (!token.ok) return null;
	const password = parseOptionalFlagValue(argv, "--password");
	if (!password.ok) return null;
	const timeout = parseOptionalFlagValue(argv, "--timeout");
	if (!timeout.ok) return null;
	const ssh = parseOptionalFlagValue(argv, "--ssh");
	if (!ssh.ok || ssh.value !== void 0) return null;
	const sshIdentity = parseOptionalFlagValue(argv, "--ssh-identity");
	if (!sshIdentity.ok || sshIdentity.value !== void 0) return null;
	if (hasFlag(argv, "--ssh-auto")) return null;
	return {
		rpc: {
			url: url.value,
			token: token.value,
			password: password.value,
			timeout: timeout.value
		},
		deep: hasFlag(argv, "--deep"),
		json: hasFlag(argv, "--json"),
		requireRpc: hasFlag(argv, "--require-rpc"),
		probe: !hasFlag(argv, "--no-probe")
	};
}
function parseSessionsRouteArgs(argv) {
	const agent = parseOptionalFlagValue(argv, "--agent");
	if (!agent.ok) return null;
	const store = parseOptionalFlagValue(argv, "--store");
	if (!store.ok) return null;
	const active = parseOptionalFlagValue(argv, "--active");
	if (!active.ok) return null;
	return {
		json: hasFlag(argv, "--json"),
		allAgents: hasFlag(argv, "--all-agents"),
		agent: agent.value,
		store: store.value,
		active: active.value
	};
}
function parseAgentsListRouteArgs(argv) {
	return {
		json: hasFlag(argv, "--json"),
		bindings: hasFlag(argv, "--bindings")
	};
}
function parseConfigGetRouteArgs(argv) {
	const path = parseSinglePositional(argv, {
		commandPath: ["config", "get"],
		booleanFlags: ["--json"]
	});
	if (!path) return null;
	return {
		path,
		json: hasFlag(argv, "--json")
	};
}
function parseConfigUnsetRouteArgs(argv) {
	const path = parseSinglePositional(argv, { commandPath: ["config", "unset"] });
	if (!path) return null;
	return { path };
}
function parseModelsListRouteArgs(argv) {
	const provider = parseOptionalFlagValue(argv, "--provider");
	if (!provider.ok) return null;
	return {
		provider: provider.value,
		all: hasFlag(argv, "--all"),
		local: hasFlag(argv, "--local"),
		json: hasFlag(argv, "--json"),
		plain: hasFlag(argv, "--plain")
	};
}
function parseModelsStatusRouteArgs(argv) {
	const probeProvider = parseOptionalFlagValue(argv, "--probe-provider");
	if (!probeProvider.ok) return null;
	const probeTimeout = parseOptionalFlagValue(argv, "--probe-timeout");
	if (!probeTimeout.ok) return null;
	const probeConcurrency = parseOptionalFlagValue(argv, "--probe-concurrency");
	if (!probeConcurrency.ok) return null;
	const probeMaxTokens = parseOptionalFlagValue(argv, "--probe-max-tokens");
	if (!probeMaxTokens.ok) return null;
	const agent = parseOptionalFlagValue(argv, "--agent");
	if (!agent.ok) return null;
	const probeProfileValues = parseRepeatedFlagValues(argv, "--probe-profile");
	if (probeProfileValues === null) return null;
	const probeProfile = probeProfileValues.length === 0 ? void 0 : probeProfileValues.length === 1 ? probeProfileValues[0] : probeProfileValues;
	return {
		probeProvider: probeProvider.value,
		probeTimeout: probeTimeout.value,
		probeConcurrency: probeConcurrency.value,
		probeMaxTokens: probeMaxTokens.value,
		agent: agent.value,
		probeProfile,
		json: hasFlag(argv, "--json"),
		plain: hasFlag(argv, "--plain"),
		check: hasFlag(argv, "--check"),
		probe: hasFlag(argv, "--probe")
	};
}
function parseChannelsListRouteArgs(argv) {
	return {
		json: hasFlag(argv, "--json"),
		usage: !hasFlag(argv, "--no-usage")
	};
}
function parseChannelsStatusRouteArgs(argv) {
	const timeout = parseOptionalFlagValue(argv, "--timeout");
	if (!timeout.ok) return null;
	return {
		json: hasFlag(argv, "--json"),
		probe: hasFlag(argv, "--probe"),
		timeout: timeout.value
	};
}
//#endregion
//#region src/cli/program/routed-command-definitions.ts
function defineRoutedCommand(definition) {
	return definition;
}
let configCliPromise;
let modelsListPromise;
function loadConfigCli() {
	configCliPromise ??= import("./config-cli-DzVKdgTf.js");
	return configCliPromise;
}
function loadModelsList() {
	modelsListPromise ??= import("./list-BU_vjl47.js");
	return modelsListPromise;
}
const routedCommandDefinitions = {
	health: defineRoutedCommand({
		parseArgs: parseHealthRouteArgs,
		runParsedArgs: async (args) => {
			const { healthCommand } = await import("./health-DuxneEcM.js");
			await healthCommand(args, defaultRuntime);
		}
	}),
	status: defineRoutedCommand({
		parseArgs: parseStatusRouteArgs,
		runParsedArgs: async (args) => {
			if (args.json) {
				const { statusJsonCommand } = await import("./status-json-BNH3Rjhk.js");
				await statusJsonCommand({
					deep: args.deep,
					all: args.all,
					usage: args.usage,
					timeoutMs: args.timeoutMs
				}, defaultRuntime);
				return;
			}
			const { statusCommand } = await import("./status-DNi0wVAG.js");
			await statusCommand(args, defaultRuntime);
		}
	}),
	"gateway-status": defineRoutedCommand({
		parseArgs: parseGatewayStatusRouteArgs,
		runParsedArgs: async (args) => {
			const { runDaemonStatus } = await import("./status-D8DJfuTf.js");
			await runDaemonStatus(args);
		}
	}),
	sessions: defineRoutedCommand({
		parseArgs: parseSessionsRouteArgs,
		runParsedArgs: async (args) => {
			const { sessionsCommand } = await import("./sessions-Cy65fkXG.js");
			await sessionsCommand(args, defaultRuntime);
		}
	}),
	"agents-list": defineRoutedCommand({
		parseArgs: parseAgentsListRouteArgs,
		runParsedArgs: async (args) => {
			const { agentsListCommand } = await import("./agents-DSxdYp-C.js");
			await agentsListCommand(args, defaultRuntime);
		}
	}),
	"config-get": defineRoutedCommand({
		parseArgs: parseConfigGetRouteArgs,
		runParsedArgs: async (args) => {
			const { runConfigGet } = await loadConfigCli();
			await runConfigGet(args);
		}
	}),
	"config-unset": defineRoutedCommand({
		parseArgs: parseConfigUnsetRouteArgs,
		runParsedArgs: async (args) => {
			const { runConfigUnset } = await loadConfigCli();
			await runConfigUnset(args);
		}
	}),
	"models-list": defineRoutedCommand({
		parseArgs: parseModelsListRouteArgs,
		runParsedArgs: async (args) => {
			const { modelsListCommand } = await loadModelsList();
			await modelsListCommand(args, defaultRuntime);
		}
	}),
	"models-status": defineRoutedCommand({
		parseArgs: parseModelsStatusRouteArgs,
		runParsedArgs: async (args) => {
			const { modelsStatusCommand } = await loadModelsList();
			await modelsStatusCommand(args, defaultRuntime);
		}
	}),
	"channels-list": defineRoutedCommand({
		parseArgs: parseChannelsListRouteArgs,
		runParsedArgs: async (args) => {
			const { channelsListCommand } = await import("./list-BUEi8Nrp.js");
			await channelsListCommand(args, defaultRuntime);
		}
	}),
	"channels-status": defineRoutedCommand({
		parseArgs: parseChannelsStatusRouteArgs,
		runParsedArgs: async (args) => {
			const { channelsStatusCommand } = await import("./status-B_WimVQJ.js");
			await channelsStatusCommand(args, defaultRuntime);
		}
	})
};
//#endregion
//#region src/cli/program/route-specs.ts
function createCommandLoadPlugins(commandPath) {
	return (argv) => {
		const loadPlugins = resolveCliCommandPathPolicy([...commandPath]).loadPlugins;
		return loadPlugins === "always" || loadPlugins === "text-only" && !hasFlag(argv, "--json");
	};
}
function createParsedRoute(params) {
	return {
		matches: (path) => matchesCommandPath(path, params.entry.commandPath, { exact: params.entry.exact }),
		loadPlugins: params.entry.route?.preloadPlugins ? createCommandLoadPlugins(params.entry.commandPath) : void 0,
		run: async (argv) => {
			const args = params.definition.parseArgs(argv);
			if (!args) return false;
			await params.definition.runParsedArgs(args);
			return true;
		}
	};
}
const routedCommands = cliCommandCatalog.filter((entry) => Boolean(entry.route)).map((entry) => createParsedRoute({
	entry,
	definition: routedCommandDefinitions[entry.route.id]
}));
//#endregion
//#region src/cli/program/routes.ts
function findRoutedCommand(path) {
	for (const route of routedCommands) if (route.matches(path)) return route;
	return null;
}
//#endregion
//#region src/cli/route.ts
async function prepareRoutedCommand(params) {
	const { startupPolicy } = resolveCliExecutionStartupContext({
		argv: params.argv,
		jsonOutputMode: hasFlag(params.argv, "--json"),
		env: process.env,
		routeMode: true
	});
	const { VERSION } = await import("./version-LMlsBH_W.js");
	await applyCliExecutionStartupPresentation({
		argv: params.argv,
		routeLogsToStderrOnSuppress: false,
		startupPolicy,
		showBanner: process.stdout.isTTY && !startupPolicy.suppressDoctorStdout,
		version: VERSION
	});
	const shouldLoadPlugins = typeof params.loadPlugins === "function" ? params.loadPlugins(params.argv) : params.loadPlugins;
	await ensureCliExecutionBootstrap({
		runtime: defaultRuntime,
		commandPath: params.commandPath,
		startupPolicy,
		loadPlugins: shouldLoadPlugins ?? startupPolicy.loadPlugins
	});
}
async function tryRouteCli(argv) {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_ROUTE_FIRST)) return false;
	const invocation = resolveCliArgvInvocation(argv);
	if (invocation.hasHelpOrVersion) return false;
	if (!invocation.commandPath[0]) return false;
	const route = findRoutedCommand(invocation.commandPath);
	if (!route) return false;
	await prepareRoutedCommand({
		argv,
		commandPath: invocation.commandPath,
		loadPlugins: route.loadPlugins
	});
	return route.run(argv);
}
//#endregion
//#region src/cli/run-main.ts
async function closeCliMemoryManagers() {
	if (!hasMemoryRuntime()) return;
	try {
		const { closeActiveMemorySearchManagers } = await import("./memory-runtime-B6vWLUjB.js");
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
function shouldEnsureCliPath(argv) {
	const invocation = resolveCliArgvInvocation(argv);
	if (invocation.hasHelpOrVersion) return false;
	return shouldEnsureCliPathForCommandPath(invocation.commandPath);
}
function shouldUseRootHelpFastPath(argv) {
	return resolveCliArgvInvocation(argv).isRootHelpInvocation;
}
function resolveMissingPluginCommandMessage(pluginId, config, options) {
	const normalizedPluginId = normalizeLowercaseStringOrEmpty(pluginId);
	if (!normalizedPluginId) return null;
	const allow = Array.isArray(config?.plugins?.allow) && config.plugins.allow.length > 0 ? config.plugins.allow.filter((entry) => typeof entry === "string").map((entry) => normalizeOptionalLowercaseString(entry)).filter(Boolean) : [];
	const commandAlias = resolveManifestCommandAliasOwner({
		command: normalizedPluginId,
		config,
		registry: options?.registry
	});
	const parentPluginId = commandAlias?.pluginId;
	if (parentPluginId) {
		if (allow.length > 0 && !allow.includes(parentPluginId)) return `"${normalizedPluginId}" is not a plugin; it is a command provided by the "${parentPluginId}" plugin. Add "${parentPluginId}" to \`plugins.allow\` instead of "${normalizedPluginId}".`;
		if (config?.plugins?.entries?.[parentPluginId]?.enabled === false) return `The \`openclaw ${normalizedPluginId}\` command is unavailable because \`plugins.entries.${parentPluginId}.enabled=false\`. Re-enable that entry if you want the bundled plugin command surface.`;
		if (commandAlias.kind === "runtime-slash") return `"${normalizedPluginId}" is a runtime slash command (/${normalizedPluginId}), not a CLI command. It is provided by the "${parentPluginId}" plugin. ${commandAlias.cliCommand ? `Use \`openclaw ${commandAlias.cliCommand}\` for related CLI operations, or ` : "Use "}\`/${normalizedPluginId}\` in a chat session.`;
	}
	if (allow.length > 0 && !allow.includes(normalizedPluginId)) {
		if (parentPluginId && allow.includes(parentPluginId)) return null;
		return `The \`openclaw ${normalizedPluginId}\` command is unavailable because \`plugins.allow\` excludes "${normalizedPluginId}". Add "${normalizedPluginId}" to \`plugins.allow\` if you want that bundled plugin CLI surface.`;
	}
	if (config?.plugins?.entries?.[normalizedPluginId]?.enabled === false) return `The \`openclaw ${normalizedPluginId}\` command is unavailable because \`plugins.entries.${normalizedPluginId}.enabled=false\`. Re-enable that entry if you want the bundled plugin CLI surface.`;
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
	if ((parsedContainer.container ?? normalizeOptionalString(process$1.env.OPENCLAW_CONTAINER) ?? null) && parsedProfile.profile) throw new Error("--container cannot be combined with --profile/--dev");
	const containerTarget = maybeRunCliInContainer(originalArgv);
	if (containerTarget.handled) {
		if (containerTarget.exitCode !== 0) process$1.exitCode = containerTarget.exitCode;
		return;
	}
	let normalizedArgv = parsedProfile.argv;
	if (shouldLoadCliDotEnv()) {
		const { loadCliDotEnv } = await import("./dotenv-y6tEeRtH.js");
		loadCliDotEnv({ quiet: true });
	}
	normalizeEnv();
	initializeDebugProxyCapture("cli");
	process$1.once("exit", () => {
		finalizeDebugProxyCapture();
	});
	ensureGlobalUndiciEnvProxyDispatcher();
	maybeWarnAboutDebugProxyCoverage();
	if (shouldEnsureCliPath(normalizedArgv)) ensureOpenClawCliOnPath();
	assertSupportedRuntime();
	try {
		if (shouldUseRootHelpFastPath(normalizedArgv)) {
			const { outputPrecomputedRootHelpText } = await import("./root-help-metadata-DIazjtzI.js");
			if (!outputPrecomputedRootHelpText()) {
				const { outputRootHelp } = await import("./root-help-id3SfIWm.js");
				await outputRootHelp();
			}
			return;
		}
		if (await tryRouteCli(normalizedArgv)) return;
		enableConsoleCapture();
		const [{ buildProgram }, { runFatalErrorHooks }, { installUnhandledRejectionHandler }, { restoreTerminalState }] = await Promise.all([
			import("./program-C2pnmt5C.js"),
			import("./fatal-error-hooks-C54p3nG2.js"),
			import("./unhandled-rejections-C1LvXbOw.js"),
			import("./restore-Bq3mpjIz.js")
		]);
		const program = buildProgram();
		installUnhandledRejectionHandler();
		process$1.on("uncaughtException", (error) => {
			console.error("[openclaw] Uncaught exception:", formatUncaughtError(error));
			for (const message of runFatalErrorHooks({
				reason: "uncaught_exception",
				error
			})) console.error("[openclaw]", message);
			restoreTerminalState("uncaught exception", { resumeStdinIfPaused: false });
			process$1.exit(1);
		});
		const parseArgv = rewriteUpdateFlagArgv(normalizedArgv);
		const { primary } = resolveCliArgvInvocation(parseArgv);
		if (primary && shouldRegisterPrimaryCommandOnly(parseArgv)) {
			const { getProgramContext } = await import("./program-context-69Z-Me5j.js");
			const ctx = getProgramContext(program);
			if (ctx) {
				const { registerCoreCliByName } = await import("./command-registry-BXAdzEDL.js");
				await registerCoreCliByName(program, ctx, primary, parseArgv);
			}
			const { registerSubCliByName } = await import("./register.subclis-CkTeg-yQ.js");
			await registerSubCliByName(program, primary);
		}
		if (!shouldSkipPluginCommandRegistration({
			argv: parseArgv,
			primary,
			hasBuiltinPrimary: primary !== null && program.commands.some((command) => command.name() === primary || command.aliases().includes(primary))
		})) {
			const { registerPluginCliCommandsFromValidatedConfig } = await import("./cli-D99lRZKo.js");
			const config = await registerPluginCliCommandsFromValidatedConfig(program, void 0, void 0, {
				mode: "lazy",
				primary
			});
			if (config) {
				if (primary && !program.commands.some((command) => command.name() === primary || command.aliases().includes(primary))) {
					const missingPluginCommandMessage = resolveMissingPluginCommandMessage(primary, config);
					if (missingPluginCommandMessage) throw new Error(missingPluginCommandMessage);
				}
			}
		}
		try {
			await program.parseAsync(parseArgv);
		} catch (error) {
			if (!(error instanceof CommanderError)) throw error;
			process$1.exitCode = error.exitCode;
		}
	} finally {
		await closeCliMemoryManagers();
	}
}
//#endregion
export { runCli };
