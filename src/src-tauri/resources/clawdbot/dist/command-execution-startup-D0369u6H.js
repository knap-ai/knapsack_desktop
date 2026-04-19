import { t as resolveCliArgvInvocation } from "./argv-invocation-DloX2c7c.js";
import { c as routeLogsToStderr } from "./subsystem-Cgmckbux.js";
import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
import { n as isGatewayConfigBypassCommandPath } from "./explicit-connection-policy-Dz2zLNQA.js";
import { n as resolvePluginRegistryScopeForCommandPath, t as ensureCliPluginRegistryLoaded } from "./plugin-registry-loader-CXOhJ7ih.js";
//#region src/cli/command-bootstrap.ts
let configGuardModulePromise;
function loadConfigGuardModule() {
	configGuardModulePromise ??= import("./config-guard-CC6neWGH.js");
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
//#region src/cli/command-catalog.ts
const cliCommandCatalog = [
	{
		commandPath: ["agent"],
		policy: { loadPlugins: "always" }
	},
	{
		commandPath: ["message"],
		policy: { loadPlugins: "always" }
	},
	{
		commandPath: ["channels"],
		policy: { loadPlugins: "always" }
	},
	{
		commandPath: ["directory"],
		policy: { loadPlugins: "always" }
	},
	{
		commandPath: ["agents"],
		policy: { loadPlugins: "always" }
	},
	{
		commandPath: ["configure"],
		policy: { loadPlugins: "always" }
	},
	{
		commandPath: ["status"],
		policy: {
			loadPlugins: "text-only",
			routeConfigGuard: "when-suppressed",
			ensureCliPath: false
		},
		route: {
			id: "status",
			preloadPlugins: true
		}
	},
	{
		commandPath: ["health"],
		policy: {
			loadPlugins: "text-only",
			ensureCliPath: false
		},
		route: {
			id: "health",
			preloadPlugins: true
		}
	},
	{
		commandPath: ["gateway", "status"],
		exact: true,
		policy: { routeConfigGuard: "always" },
		route: { id: "gateway-status" }
	},
	{
		commandPath: ["sessions"],
		exact: true,
		policy: { ensureCliPath: false },
		route: { id: "sessions" }
	},
	{
		commandPath: ["agents", "list"],
		route: { id: "agents-list" }
	},
	{
		commandPath: ["config", "get"],
		exact: true,
		policy: { ensureCliPath: false },
		route: { id: "config-get" }
	},
	{
		commandPath: ["config", "unset"],
		exact: true,
		policy: { ensureCliPath: false },
		route: { id: "config-unset" }
	},
	{
		commandPath: ["models", "list"],
		exact: true,
		policy: { ensureCliPath: false },
		route: { id: "models-list" }
	},
	{
		commandPath: ["models", "status"],
		exact: true,
		policy: { ensureCliPath: false },
		route: { id: "models-status" }
	},
	{
		commandPath: ["backup"],
		policy: { bypassConfigGuard: true }
	},
	{
		commandPath: ["doctor"],
		policy: { bypassConfigGuard: true }
	},
	{
		commandPath: ["completion"],
		policy: {
			bypassConfigGuard: true,
			hideBanner: true
		}
	},
	{
		commandPath: ["secrets"],
		policy: { bypassConfigGuard: true }
	},
	{
		commandPath: ["update"],
		policy: { hideBanner: true }
	},
	{
		commandPath: ["config", "validate"],
		exact: true,
		policy: { bypassConfigGuard: true }
	},
	{
		commandPath: ["config", "schema"],
		exact: true,
		policy: { bypassConfigGuard: true }
	},
	{
		commandPath: ["plugins", "update"],
		exact: true,
		policy: { hideBanner: true }
	},
	{
		commandPath: ["onboard"],
		exact: true,
		policy: { loadPlugins: "never" }
	},
	{
		commandPath: ["channels", "add"],
		exact: true,
		policy: { loadPlugins: "never" }
	}
];
//#endregion
//#region src/cli/command-path-matches.ts
function matchesCommandPath(commandPath, pattern, params) {
	if (pattern.some((segment, index) => commandPath[index] !== segment)) return false;
	return !params?.exact || commandPath.length === pattern.length;
}
//#endregion
//#region src/cli/command-path-policy.ts
const DEFAULT_CLI_COMMAND_PATH_POLICY = {
	bypassConfigGuard: false,
	routeConfigGuard: "never",
	loadPlugins: "never",
	hideBanner: false,
	ensureCliPath: true
};
function resolveCliCommandPathPolicy(commandPath) {
	let resolvedPolicy = { ...DEFAULT_CLI_COMMAND_PATH_POLICY };
	for (const entry of cliCommandCatalog) {
		if (!entry.policy) continue;
		if (!matchesCommandPath(commandPath, entry.commandPath, { exact: entry.exact })) continue;
		Object.assign(resolvedPolicy, entry.policy);
	}
	if (isGatewayConfigBypassCommandPath(commandPath)) resolvedPolicy.bypassConfigGuard = true;
	return resolvedPolicy;
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
function shouldEnsureCliPathForCommandPath(commandPath) {
	return commandPath.length === 0 || resolveCliCommandPathPolicy(commandPath).ensureCliPath;
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
	const { emitCliBanner } = await import("./banner-CEUfihR8.js");
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
export { shouldEnsureCliPathForCommandPath as a, cliCommandCatalog as c, shouldBypassConfigGuardForCommandPath as i, ensureCliExecutionBootstrap as n, resolveCliCommandPathPolicy as o, resolveCliExecutionStartupContext as r, matchesCommandPath as s, applyCliExecutionStartupPresentation as t };
