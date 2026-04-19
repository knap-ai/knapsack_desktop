import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { a as readLaunchAgentProgramArguments, d as stageLaunchAgent, f as stopLaunchAgent, o as readLaunchAgentRuntime, p as uninstallLaunchAgent, r as isLaunchAgentLoaded, t as installLaunchAgent, u as restartLaunchAgent } from "./launchd-Bk3hz4bn.js";
import { c as stopScheduledTask, i as readScheduledTaskRuntime, l as uninstallScheduledTask, n as isScheduledTaskInstalled, o as restartScheduledTask, r as readScheduledTaskCommand, s as stageScheduledTask, t as installScheduledTask } from "./schtasks-CFOo0cPs.js";
import { a as readSystemdServiceExecStart, c as restartSystemdService, f as uninstallSystemdService, l as stageSystemdService, o as readSystemdServiceRuntime, r as isSystemdServiceEnabled, t as installSystemdService, u as stopSystemdService } from "./systemd-D3GGnU7N.js";
//#region src/daemon/service.ts
function ignoreServiceWriteResult(write) {
	return async (args) => {
		await write(args);
	};
}
function mergeGatewayServiceEnv(baseEnv, command) {
	if (!command?.environment) return baseEnv;
	return {
		...baseEnv,
		...command.environment
	};
}
async function readGatewayServiceState(service, args = {}) {
	const baseEnv = args.env ?? process.env;
	const command = await service.readCommand(baseEnv).catch(() => null);
	const env = mergeGatewayServiceEnv(baseEnv, command);
	const [loaded, runtime] = await Promise.all([service.isLoaded({ env }).catch(() => false), service.readRuntime(env).catch(() => void 0)]);
	return {
		installed: command !== null,
		loaded,
		running: runtime?.status === "running",
		env,
		command,
		runtime
	};
}
async function startGatewayService(service, args) {
	const state = await readGatewayServiceState(service, { env: args.env });
	if (!state.loaded && !state.installed) return {
		outcome: "missing-install",
		state
	};
	try {
		const restartResult = await service.restart({
			...args,
			env: state.env
		});
		const nextState = await readGatewayServiceState(service, { env: state.env });
		return {
			outcome: restartResult.outcome === "scheduled" ? "scheduled" : "started",
			state: nextState
		};
	} catch (err) {
		const nextState = await readGatewayServiceState(service, { env: state.env });
		if (!nextState.installed) return {
			outcome: "missing-install",
			state: nextState
		};
		throw err;
	}
}
function describeGatewayServiceRestart(serviceNoun, result) {
	if (result.outcome === "scheduled") return {
		scheduled: true,
		daemonActionResult: "scheduled",
		message: `restart scheduled, ${normalizeLowercaseStringOrEmpty(serviceNoun)} will restart momentarily`,
		progressMessage: `${serviceNoun} service restart scheduled.`
	};
	return {
		scheduled: false,
		daemonActionResult: "restarted",
		message: `${serviceNoun} service restarted.`,
		progressMessage: `${serviceNoun} service restarted.`
	};
}
const GATEWAY_SERVICE_REGISTRY = {
	darwin: {
		label: "LaunchAgent",
		loadedText: "loaded",
		notLoadedText: "not loaded",
		stage: ignoreServiceWriteResult(stageLaunchAgent),
		install: ignoreServiceWriteResult(installLaunchAgent),
		uninstall: uninstallLaunchAgent,
		stop: stopLaunchAgent,
		restart: restartLaunchAgent,
		isLoaded: isLaunchAgentLoaded,
		readCommand: readLaunchAgentProgramArguments,
		readRuntime: readLaunchAgentRuntime
	},
	linux: {
		label: "systemd",
		loadedText: "enabled",
		notLoadedText: "disabled",
		stage: ignoreServiceWriteResult(stageSystemdService),
		install: ignoreServiceWriteResult(installSystemdService),
		uninstall: uninstallSystemdService,
		stop: stopSystemdService,
		restart: restartSystemdService,
		isLoaded: isSystemdServiceEnabled,
		readCommand: readSystemdServiceExecStart,
		readRuntime: readSystemdServiceRuntime
	},
	win32: {
		label: "Scheduled Task",
		loadedText: "registered",
		notLoadedText: "missing",
		stage: ignoreServiceWriteResult(stageScheduledTask),
		install: ignoreServiceWriteResult(installScheduledTask),
		uninstall: uninstallScheduledTask,
		stop: stopScheduledTask,
		restart: restartScheduledTask,
		isLoaded: isScheduledTaskInstalled,
		readCommand: readScheduledTaskCommand,
		readRuntime: readScheduledTaskRuntime
	}
};
function isSupportedGatewayServicePlatform(platform) {
	return Object.hasOwn(GATEWAY_SERVICE_REGISTRY, platform);
}
function resolveGatewayService() {
	if (isSupportedGatewayServicePlatform(process.platform)) return GATEWAY_SERVICE_REGISTRY[process.platform];
	throw new Error(`Gateway service install not supported on ${process.platform}`);
}
//#endregion
export { startGatewayService as i, readGatewayServiceState as n, resolveGatewayService as r, describeGatewayServiceRestart as t };
