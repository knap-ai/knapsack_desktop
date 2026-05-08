import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
import { n as VERSION } from "./version-vQIvyCe_.js";
import { S as shouldWarnOnTouchedVersion, u as readConfigFileSnapshot } from "./io-CFdEhZuM.js";
import "./config--k_1dtUP.js";
import { a as readSystemdServiceExecStart, c as restartSystemdService, f as uninstallSystemdService, l as stageSystemdService, o as readSystemdServiceRuntime, r as isSystemdServiceEnabled, t as installSystemdService, u as stopSystemdService } from "./systemd-Cn62oyN_.js";
import { a as readLaunchAgentRuntime, c as restartLaunchAgent, d as uninstallLaunchAgent, i as readLaunchAgentProgramArguments, l as stageLaunchAgent, n as isLaunchAgentLoaded, t as installLaunchAgent, u as stopLaunchAgent } from "./launchd-8T4SfMJh.js";
import { c as stopScheduledTask, i as readScheduledTaskRuntime, l as uninstallScheduledTask, n as isScheduledTaskInstalled, o as restartScheduledTask, r as readScheduledTaskCommand, s as stageScheduledTask, t as installScheduledTask } from "./schtasks-_LsU3_4V.js";
//#region src/config/future-version-guard.ts
const ALLOW_OLDER_BINARY_DESTRUCTIVE_ACTIONS_ENV = "OPENCLAW_ALLOW_OLDER_BINARY_DESTRUCTIVE_ACTIONS";
function allowOlderBinaryDestructiveActions(env) {
	const raw = env[ALLOW_OLDER_BINARY_DESTRUCTIVE_ACTIONS_ENV]?.trim().toLowerCase();
	return raw === "1" || raw === "true" || raw === "yes";
}
function resolveTouchedVersion(params) {
	return params.snapshot?.sourceConfig?.meta?.lastTouchedVersion?.trim() || params.snapshot?.config?.meta?.lastTouchedVersion?.trim() || params.config?.meta?.lastTouchedVersion?.trim() || null;
}
function resolveFutureConfigActionBlock(params) {
	if (allowOlderBinaryDestructiveActions(params.env ?? process.env)) return null;
	const currentVersion = params.currentVersion ?? VERSION;
	const touchedVersion = resolveTouchedVersion(params);
	if (!touchedVersion || !shouldWarnOnTouchedVersion(currentVersion, touchedVersion)) return null;
	return {
		action: params.action,
		currentVersion,
		touchedVersion,
		message: `Refusing to ${params.action} because this OpenClaw binary (${currentVersion}) is older than the config last written by OpenClaw ${touchedVersion}.`,
		hints: ["Run the newer openclaw binary on PATH, or reinstall the intended gateway service from the newer install.", `Set ${ALLOW_OLDER_BINARY_DESTRUCTIVE_ACTIONS_ENV}=1 only for an intentional downgrade or recovery action.`]
	};
}
function formatFutureConfigActionBlock(block) {
	return [block.message, ...block.hints].join("\n");
}
//#endregion
//#region src/daemon/future-config-guard.ts
async function readFutureConfigActionBlock(action) {
	try {
		return resolveFutureConfigActionBlock({
			action,
			snapshot: await readConfigFileSnapshot()
		});
	} catch {
		return null;
	}
}
async function assertFutureConfigActionAllowed(action) {
	const block = await readFutureConfigActionBlock(action);
	if (block) throw new Error(formatFutureConfigActionBlock(block));
}
//#endregion
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
function withFutureConfigGuard(service) {
	return {
		...service,
		stage: async (args) => {
			await assertFutureConfigActionAllowed("rewrite the gateway service");
			return await service.stage(args);
		},
		install: async (args) => {
			await assertFutureConfigActionAllowed("install or rewrite the gateway service");
			return await service.install(args);
		},
		uninstall: async (args) => {
			await assertFutureConfigActionAllowed("uninstall the gateway service");
			return await service.uninstall(args);
		},
		stop: async (args) => {
			await assertFutureConfigActionAllowed("stop the gateway service");
			return await service.stop(args);
		},
		restart: async (args) => {
			await assertFutureConfigActionAllowed("restart the gateway service");
			return await service.restart(args);
		}
	};
}
function isSupportedGatewayServicePlatform(platform) {
	return Object.hasOwn(GATEWAY_SERVICE_REGISTRY, platform);
}
function resolveGatewayService() {
	if (isSupportedGatewayServicePlatform(process.platform)) return withFutureConfigGuard(GATEWAY_SERVICE_REGISTRY[process.platform]);
	throw new Error(`Gateway service install not supported on ${process.platform}`);
}
//#endregion
export { formatFutureConfigActionBlock as a, startGatewayService as i, readGatewayServiceState as n, resolveFutureConfigActionBlock as o, resolveGatewayService as r, describeGatewayServiceRestart as t };
