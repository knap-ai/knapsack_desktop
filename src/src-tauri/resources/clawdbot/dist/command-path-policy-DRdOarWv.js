import { n as isGatewayConfigBypassCommandPath } from "./explicit-connection-policy-CrqC41hq.js";
//#region src/cli/command-catalog.ts
const cliCommandCatalog = [
	{
		commandPath: ["crestodian"],
		policy: {
			bypassConfigGuard: true,
			loadPlugins: "never",
			ensureCliPath: false
		}
	},
	{
		commandPath: ["agent"],
		policy: { loadPlugins: "always" }
	},
	{
		commandPath: ["message"],
		policy: { loadPlugins: "never" }
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
		commandPath: ["agents", "bind"],
		exact: true,
		policy: { loadPlugins: "never" }
	},
	{
		commandPath: ["agents", "bindings"],
		exact: true,
		policy: { loadPlugins: "never" }
	},
	{
		commandPath: ["agents", "unbind"],
		exact: true,
		policy: { loadPlugins: "never" }
	},
	{
		commandPath: ["agents", "set-identity"],
		exact: true,
		policy: { loadPlugins: "never" }
	},
	{
		commandPath: ["agents", "delete"],
		exact: true,
		policy: { loadPlugins: "never" }
	},
	{
		commandPath: ["configure"],
		policy: {
			bypassConfigGuard: true,
			loadPlugins: "never"
		}
	},
	{
		commandPath: ["migrate"],
		policy: {
			bypassConfigGuard: true,
			loadPlugins: "never"
		}
	},
	{
		commandPath: ["status"],
		policy: {
			loadPlugins: "never",
			routeConfigGuard: "when-suppressed",
			ensureCliPath: false
		},
		route: { id: "status" }
	},
	{
		commandPath: ["health"],
		policy: {
			loadPlugins: "never",
			ensureCliPath: false
		},
		route: { id: "health" }
	},
	{
		commandPath: ["gateway", "status"],
		exact: true,
		policy: {
			routeConfigGuard: "always",
			loadPlugins: "never"
		},
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
		policy: { loadPlugins: "text-only" },
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
		policy: {
			ensureCliPath: false,
			routeConfigGuard: "always"
		},
		route: { id: "models-list" }
	},
	{
		commandPath: ["models", "status"],
		exact: true,
		policy: {
			ensureCliPath: false,
			routeConfigGuard: "always"
		},
		route: { id: "models-status" }
	},
	{
		commandPath: ["tasks", "list"],
		exact: true,
		policy: {
			ensureCliPath: false,
			routeConfigGuard: "when-suppressed",
			loadPlugins: "never"
		},
		route: { id: "tasks-list" }
	},
	{
		commandPath: ["tasks", "audit"],
		exact: true,
		policy: {
			ensureCliPath: false,
			routeConfigGuard: "when-suppressed",
			loadPlugins: "never"
		},
		route: { id: "tasks-audit" }
	},
	{
		commandPath: ["tasks"],
		policy: {
			ensureCliPath: false,
			routeConfigGuard: "when-suppressed",
			loadPlugins: "never"
		},
		route: { id: "tasks-list" }
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
	},
	{
		commandPath: ["channels", "status"],
		exact: true,
		policy: { loadPlugins: "never" },
		route: { id: "channels-status" }
	},
	{
		commandPath: ["channels", "list"],
		exact: true,
		policy: { loadPlugins: "never" },
		route: { id: "channels-list" }
	},
	{
		commandPath: ["channels", "logs"],
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
export { matchesCommandPath as n, cliCommandCatalog as r, resolveCliCommandPathPolicy as t };
