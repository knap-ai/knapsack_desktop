import { t as resolveCliArgvInvocation } from "./argv-invocation-C0QUafZn.js";
import { t as isTruthyEnvValue } from "./env-BAymvSVL.js";
import { h as loggingState } from "./logger-BYIbL3gn.js";
import { a as routeLogsToStderr } from "./console-D6VW2Y3e.js";
import { t as resolveCliCommandPathPolicy } from "./command-path-policy-DRdOarWv.js";
//#region src/cli/plugin-registry-loader.ts
let pluginRegistryModulePromise;
function loadPluginRegistryModule() {
	pluginRegistryModulePromise ??= import("./plugin-registry-D7jWUZ_2.js");
	return pluginRegistryModulePromise;
}
function resolvePluginRegistryScopeForCommandPath(commandPath) {
	return commandPath[0] === "status" || commandPath[0] === "health" ? "channels" : "all";
}
async function ensureCliPluginRegistryLoaded(params) {
	const { ensurePluginRegistryLoaded } = await loadPluginRegistryModule();
	const previousForceStderr = loggingState.forceConsoleToStderr;
	if (params.routeLogsToStderr) loggingState.forceConsoleToStderr = true;
	try {
		ensurePluginRegistryLoaded({
			scope: params.scope,
			...params.config ? { config: params.config } : {},
			...params.activationSourceConfig ? { activationSourceConfig: params.activationSourceConfig } : {}
		});
	} finally {
		loggingState.forceConsoleToStderr = previousForceStderr;
	}
}
//#endregion
//#region src/cli/command-bootstrap.ts
let configGuardModulePromise;
function loadConfigGuardModule() {
	configGuardModulePromise ??= import("./config-guard-DzAn3C0J.js");
	return configGuardModulePromise;
}
async function ensureCliCommandBootstrap(params) {
	if (!params.skipConfigGuard) {
		const { ensureConfigReady } = await loadConfigGuardModule();
		await ensureConfigReady({
			runtime: params.runtime,
			commandPath: params.commandPath,
			...params.allowInvalid ? { allowInvalid: true } : {},
			...params.suppressDoctorStdout ? { suppressDoctorStdout: true } : {}
		});
	}
	if (!params.loadPlugins) return;
	await ensureCliPluginRegistryLoaded({
		scope: resolvePluginRegistryScopeForCommandPath(params.commandPath),
		routeLogsToStderr: params.suppressDoctorStdout
	});
}
//#endregion
//#region src/cli/command-startup-policy.ts
function shouldBypassConfigGuardForCommandPath(commandPath) {
	return resolveCliCommandPathPolicy(commandPath).bypassConfigGuard;
}
function shouldSkipRouteConfigGuardForCommandPath(params) {
	const routeConfigGuard = resolveCliCommandPathPolicy(params.commandPath).routeConfigGuard;
	return routeConfigGuard === "always" || routeConfigGuard === "when-suppressed" && params.suppressDoctorStdout;
}
function shouldLoadPluginsForCommandPath(params) {
	const loadPlugins = resolveCliCommandPathPolicy(params.commandPath).loadPlugins;
	return loadPlugins === "always" || loadPlugins === "text-only" && !params.jsonOutputMode;
}
function shouldHideCliBannerForCommandPath(commandPath, env = process.env) {
	return isTruthyEnvValue(env.OPENCLAW_HIDE_BANNER) || resolveCliCommandPathPolicy(commandPath).hideBanner;
}
function resolveCliStartupPolicy(params) {
	const suppressDoctorStdout = params.jsonOutputMode;
	return {
		suppressDoctorStdout,
		hideBanner: shouldHideCliBannerForCommandPath(params.commandPath, params.env),
		skipConfigGuard: params.routeMode ? shouldSkipRouteConfigGuardForCommandPath({
			commandPath: params.commandPath,
			suppressDoctorStdout
		}) : false,
		loadPlugins: shouldLoadPluginsForCommandPath({
			commandPath: params.commandPath,
			jsonOutputMode: params.jsonOutputMode
		})
	};
}
//#endregion
//#region src/cli/command-execution-startup.ts
function resolveCliExecutionStartupContext(params) {
	const invocation = resolveCliArgvInvocation(params.argv);
	const { commandPath } = invocation;
	return {
		invocation,
		commandPath,
		startupPolicy: resolveCliStartupPolicy({
			commandPath,
			jsonOutputMode: params.jsonOutputMode,
			env: params.env,
			routeMode: params.routeMode
		})
	};
}
async function applyCliExecutionStartupPresentation(params) {
	if (params.startupPolicy.suppressDoctorStdout && params.routeLogsToStderrOnSuppress !== false) routeLogsToStderr();
	if (params.startupPolicy.hideBanner || params.showBanner === false || !params.version) return;
	const { emitCliBanner } = await import("./banner-CbUy9CPx.js");
	if (params.argv) {
		emitCliBanner(params.version, { argv: params.argv });
		return;
	}
	emitCliBanner(params.version);
}
async function ensureCliExecutionBootstrap(params) {
	await ensureCliCommandBootstrap({
		runtime: params.runtime,
		commandPath: params.commandPath,
		suppressDoctorStdout: params.startupPolicy.suppressDoctorStdout,
		allowInvalid: params.allowInvalid,
		loadPlugins: params.loadPlugins ?? params.startupPolicy.loadPlugins,
		skipConfigGuard: params.skipConfigGuard ?? params.startupPolicy.skipConfigGuard
	});
}
//#endregion
export { shouldBypassConfigGuardForCommandPath as i, ensureCliExecutionBootstrap as n, resolveCliExecutionStartupContext as r, applyCliExecutionStartupPresentation as t };
