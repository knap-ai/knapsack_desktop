import { D as getVerboseFlag, S as getCommandPathWithRootOptions, h as loggingState, k as hasHelpOrVersion } from "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import "./theme-CdOoMzRk.js";
import { s as setVerbose } from "./globals-DBUMOBZ8.js";
import { c as routeLogsToStderr, m as defaultRuntime } from "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./boolean-C3GkJetE.js";
import { t as isTruthyEnvValue } from "./env-Dnra1IpT.js";
import "./utils-CS0Ikux6.js";
import "./links-8xRhWBQL.js";
import { n as VERSION } from "./version-CD3oP1-d.js";
import "./registry-C5UkPpaO.js";
import { n as resolveCliName } from "./cli-name-CgLQPAaK.js";
import "./ports-lsof-BLEgL_Gn.js";
import { n as resolveCliChannelOptions } from "./channel-options-DbO6O2eH.js";
import "./register.subclis-DWT5Gugx.js";
import { i as registerProgramCommands } from "./command-registry-D51hzEl_.js";
import { n as setProgramContext } from "./program-context-wCWmc15y.js";
import { t as isCommandJsonOutputMode } from "./json-mode-j7MCM3tY.js";
import "./ports-fW0NrR0l.js";
import { t as emitCliBanner } from "./banner-B0rpEo7p.js";
import { t as configureProgramHelp } from "./help-DEOmDRRX.js";
import { Command } from "commander";
//#region src/cli/program/context.ts
function createProgramContext() {
	let cachedChannelOptions;
	const getChannelOptions = () => {
		if (cachedChannelOptions === void 0) cachedChannelOptions = resolveCliChannelOptions();
		return cachedChannelOptions;
	};
	return {
		programVersion: VERSION,
		get channelOptions() {
			return getChannelOptions();
		},
		get messageChannelOptions() {
			return getChannelOptions().join("|");
		},
		get agentChannelOptions() {
			return ["last", ...getChannelOptions()].join("|");
		}
	};
}
//#endregion
//#region src/cli/program/preaction.ts
function setProcessTitleForCommand(actionCommand) {
	let current = actionCommand;
	while (current.parent && current.parent.parent) current = current.parent;
	const name = current.name();
	const cliName = resolveCliName();
	if (!name || name === cliName) return;
	process.title = `${cliName}-${name}`;
}
const PLUGIN_REQUIRED_COMMANDS = new Set([
	"message",
	"channels",
	"directory",
	"agents",
	"configure",
	"status",
	"health"
]);
const CONFIG_GUARD_BYPASS_COMMANDS = new Set([
	"backup",
	"doctor",
	"completion",
	"secrets"
]);
let configGuardModulePromise;
let pluginRegistryModulePromise;
function shouldBypassConfigGuard(commandPath) {
	const [primary, secondary] = commandPath;
	if (!primary) return false;
	if (CONFIG_GUARD_BYPASS_COMMANDS.has(primary)) return true;
	if (primary === "config" && secondary === "validate") return true;
	return false;
}
function loadConfigGuardModule() {
	configGuardModulePromise ??= import("./config-guard-y0i05slh.js");
	return configGuardModulePromise;
}
function loadPluginRegistryModule() {
	pluginRegistryModulePromise ??= import("./plugin-registry-BWnSxEDn.js");
	return pluginRegistryModulePromise;
}
function resolvePluginRegistryScope(commandPath) {
	return commandPath[0] === "status" || commandPath[0] === "health" ? "channels" : "all";
}
function shouldLoadPluginsForCommand(commandPath, jsonOutputMode) {
	const [primary, secondary] = commandPath;
	if (!primary || !PLUGIN_REQUIRED_COMMANDS.has(primary)) return false;
	if ((primary === "status" || primary === "health") && jsonOutputMode) return false;
	if (primary === "onboard" || primary === "channels" && secondary === "add") return false;
	return true;
}
function getRootCommand(command) {
	let current = command;
	while (current.parent) current = current.parent;
	return current;
}
function getCliLogLevel(actionCommand) {
	const root = getRootCommand(actionCommand);
	if (typeof root.getOptionValueSource !== "function") return;
	if (root.getOptionValueSource("logLevel") !== "cli") return;
	const logLevel = root.opts().logLevel;
	return typeof logLevel === "string" ? logLevel : void 0;
}
function registerPreActionHooks(program, programVersion) {
	program.hook("preAction", async (_thisCommand, actionCommand) => {
		setProcessTitleForCommand(actionCommand);
		const argv = process.argv;
		if (hasHelpOrVersion(argv)) return;
		const commandPath = getCommandPathWithRootOptions(argv, 2);
		const jsonOutputMode = isCommandJsonOutputMode(actionCommand, argv);
		if (jsonOutputMode) routeLogsToStderr();
		if (!(isTruthyEnvValue(process.env.OPENCLAW_HIDE_BANNER) || commandPath[0] === "update" || commandPath[0] === "completion" || commandPath[0] === "plugins" && commandPath[1] === "update")) emitCliBanner(programVersion);
		const verbose = getVerboseFlag(argv, { includeDebug: true });
		setVerbose(verbose);
		const cliLogLevel = getCliLogLevel(actionCommand);
		if (cliLogLevel) process.env.OPENCLAW_LOG_LEVEL = cliLogLevel;
		if (!verbose) process.env.NODE_NO_WARNINGS ??= "1";
		if (shouldBypassConfigGuard(commandPath)) return;
		const { ensureConfigReady } = await loadConfigGuardModule();
		await ensureConfigReady({
			runtime: defaultRuntime,
			commandPath,
			...jsonOutputMode ? { suppressDoctorStdout: true } : {}
		});
		if (shouldLoadPluginsForCommand(commandPath, jsonOutputMode)) {
			const { ensurePluginRegistryLoaded } = await loadPluginRegistryModule();
			const prev = loggingState.forceConsoleToStderr;
			if (jsonOutputMode) loggingState.forceConsoleToStderr = true;
			try {
				ensurePluginRegistryLoaded({ scope: resolvePluginRegistryScope(commandPath) });
			} finally {
				loggingState.forceConsoleToStderr = prev;
			}
		}
	});
}
//#endregion
//#region src/cli/program/build-program.ts
function buildProgram() {
	const program = new Command();
	program.enablePositionalOptions();
	const ctx = createProgramContext();
	const argv = process.argv;
	setProgramContext(program, ctx);
	configureProgramHelp(program, ctx);
	registerPreActionHooks(program, ctx.programVersion);
	registerProgramCommands(program, ctx, argv);
	return program;
}
//#endregion
export { buildProgram };
