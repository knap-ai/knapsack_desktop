import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { B as buildParseArgv, G as getPrimaryCommand, J as hasHelpOrVersion } from "./subsystem-BDbeCphF.js";
import { i as isTruthyEnvValue } from "./entry.js";
import { r as resolveActionArgs } from "./helpers-Bl84xV6U.js";
//#region src/cli/program/action-reparse.ts
async function reparseProgramFromActionArgs(program, actionArgs) {
	const actionCommand = actionArgs.at(-1);
	const rawArgs = (actionCommand?.parent ?? program).rawArgs;
	const actionArgsList = resolveActionArgs(actionCommand);
	const fallbackArgv = actionCommand?.name() ? [actionCommand.name(), ...actionArgsList] : actionArgsList;
	const parseArgv = buildParseArgv({
		programName: program.name(),
		rawArgs,
		fallbackArgv
	});
	await program.parseAsync(parseArgv);
}
//#endregion
//#region src/cli/program/command-tree.ts
function removeCommand(program, command) {
	const commands = program.commands;
	const index = commands.indexOf(command);
	if (index < 0) return false;
	commands.splice(index, 1);
	return true;
}
function removeCommandByName(program, name) {
	const existing = program.commands.find((command) => command.name() === name);
	if (!existing) return false;
	return removeCommand(program, existing);
}
//#endregion
//#region src/cli/program/register.subclis.ts
var register_subclis_exports = /* @__PURE__ */ __exportAll({
	getSubCliCommandsWithSubcommands: () => getSubCliCommandsWithSubcommands,
	getSubCliEntries: () => getSubCliEntries,
	loadValidatedConfigForPluginRegistration: () => loadValidatedConfigForPluginRegistration,
	registerSubCliByName: () => registerSubCliByName,
	registerSubCliCommands: () => registerSubCliCommands
});
const shouldRegisterPrimaryOnly = (argv) => {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS)) return false;
	if (hasHelpOrVersion(argv)) return false;
	return true;
};
const shouldEagerRegisterSubcommands = (_argv) => {
	return isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS);
};
const loadValidatedConfigForPluginRegistration = async () => {
	const mod = await import("./auth-profiles-DRjqKE3G.js").then((n) => n.Dg);
	if (!(await mod.readConfigFileSnapshot()).valid) return null;
	return mod.loadConfig();
};
const entries = [
	{
		name: "acp",
		description: "Agent Control Protocol tools",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./acp-cli-DgWHSnvd.js")).registerAcpCli(program);
		}
	},
	{
		name: "gateway",
		description: "Run, inspect, and query the WebSocket Gateway",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./gateway-cli-CuZs0RlJ.js")).registerGatewayCli(program);
		}
	},
	{
		name: "daemon",
		description: "Gateway service (legacy alias)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./daemon-cli-Cfj5GfCC.js").then((n) => n.t)).registerDaemonCli(program);
		}
	},
	{
		name: "logs",
		description: "Tail gateway file logs via RPC",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./logs-cli-BitiqKf8.js")).registerLogsCli(program);
		}
	},
	{
		name: "system",
		description: "System events, heartbeat, and presence",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./system-cli-BTKMxNKv.js")).registerSystemCli(program);
		}
	},
	{
		name: "models",
		description: "Discover, scan, and configure models",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./models-cli-Dgqs7_Au.js")).registerModelsCli(program);
		}
	},
	{
		name: "approvals",
		description: "Manage exec approvals (gateway or node host)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./exec-approvals-cli-BQ-fVK8J.js")).registerExecApprovalsCli(program);
		}
	},
	{
		name: "nodes",
		description: "Manage gateway-owned node pairing and node commands",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./nodes-cli-BNoon0Dx.js")).registerNodesCli(program);
		}
	},
	{
		name: "devices",
		description: "Device pairing + token management",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./devices-cli-CUU7n1Kz.js")).registerDevicesCli(program);
		}
	},
	{
		name: "node",
		description: "Run and manage the headless node host service",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./node-cli-Byf3Em2G.js")).registerNodeCli(program);
		}
	},
	{
		name: "sandbox",
		description: "Manage sandbox containers for agent isolation",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./sandbox-cli-DZpCipG4.js")).registerSandboxCli(program);
		}
	},
	{
		name: "tui",
		description: "Open a terminal UI connected to the Gateway",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./tui-cli-B7yE2kwV.js")).registerTuiCli(program);
		}
	},
	{
		name: "cron",
		description: "Manage cron jobs via the Gateway scheduler",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./cron-cli-BW3_hPf_.js")).registerCronCli(program);
		}
	},
	{
		name: "dns",
		description: "DNS helpers for wide-area discovery (Tailscale + CoreDNS)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./dns-cli-C4s21Ie4.js")).registerDnsCli(program);
		}
	},
	{
		name: "docs",
		description: "Search the live OpenClaw docs",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./docs-cli-Cu7NpgCH.js")).registerDocsCli(program);
		}
	},
	{
		name: "hooks",
		description: "Manage internal agent hooks",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./hooks-cli-Dw69or9u.js")).registerHooksCli(program);
		}
	},
	{
		name: "webhooks",
		description: "Webhook helpers and integrations",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./webhooks-cli-CaWKkUfZ.js")).registerWebhooksCli(program);
		}
	},
	{
		name: "qr",
		description: "Generate iOS pairing QR/setup code",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./qr-cli-v3Gp8TUY.js")).registerQrCli(program);
		}
	},
	{
		name: "clawbot",
		description: "Legacy clawbot command aliases",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./clawbot-cli-DSeR64Tp.js")).registerClawbotCli(program);
		}
	},
	{
		name: "pairing",
		description: "Secure DM pairing (approve inbound requests)",
		hasSubcommands: true,
		register: async (program) => {
			const { registerPluginCliCommands } = await import("./cli-DQRlLQTe.js");
			const config = await loadValidatedConfigForPluginRegistration();
			if (config) registerPluginCliCommands(program, config);
			(await import("./pairing-cli-BwIjQMn_.js")).registerPairingCli(program);
		}
	},
	{
		name: "plugins",
		description: "Manage OpenClaw plugins and extensions",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./plugins-cli-DCSW68Nc.js")).registerPluginsCli(program);
			const { registerPluginCliCommands } = await import("./cli-DQRlLQTe.js");
			const config = await loadValidatedConfigForPluginRegistration();
			if (config) registerPluginCliCommands(program, config);
		}
	},
	{
		name: "channels",
		description: "Manage connected chat channels (Telegram, Discord, etc.)",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./channels-cli-QA4fHzsk.js")).registerChannelsCli(program);
		}
	},
	{
		name: "directory",
		description: "Lookup contact and group IDs (self, peers, groups) for supported chat channels",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./directory-cli-DnFWtWAM.js")).registerDirectoryCli(program);
		}
	},
	{
		name: "security",
		description: "Security tools and local config audits",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./security-cli-CdW5eNSF.js")).registerSecurityCli(program);
		}
	},
	{
		name: "secrets",
		description: "Secrets runtime reload controls",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./secrets-cli-DCRwubwC.js")).registerSecretsCli(program);
		}
	},
	{
		name: "skills",
		description: "List and inspect available skills",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./skills-cli-BczfFz37.js")).registerSkillsCli(program);
		}
	},
	{
		name: "update",
		description: "Update OpenClaw and inspect update channel status",
		hasSubcommands: true,
		register: async (program) => {
			(await import("./update-cli-QZ8i2m_O.js")).registerUpdateCli(program);
		}
	},
	{
		name: "completion",
		description: "Generate shell completion script",
		hasSubcommands: false,
		register: async (program) => {
			(await import("./completion-cli-DHtFpvB3.js").then((n) => n.n)).registerCompletionCli(program);
		}
	}
];
function getSubCliEntries() {
	return entries;
}
function getSubCliCommandsWithSubcommands() {
	return entries.filter((entry) => entry.hasSubcommands).map((entry) => entry.name);
}
async function registerSubCliByName(program, name) {
	const entry = entries.find((candidate) => candidate.name === name);
	if (!entry) return false;
	removeCommandByName(program, entry.name);
	await entry.register(program);
	return true;
}
function registerLazyCommand(program, entry) {
	const placeholder = program.command(entry.name).description(entry.description);
	placeholder.allowUnknownOption(true);
	placeholder.allowExcessArguments(true);
	placeholder.action(async (...actionArgs) => {
		removeCommand(program, placeholder);
		await entry.register(program);
		await reparseProgramFromActionArgs(program, actionArgs);
	});
}
function registerSubCliCommands(program, argv = process.argv) {
	if (shouldEagerRegisterSubcommands(argv)) {
		for (const entry of entries) entry.register(program);
		return;
	}
	const primary = getPrimaryCommand(argv);
	if (primary && shouldRegisterPrimaryOnly(argv)) {
		const entry = entries.find((candidate) => candidate.name === primary);
		if (entry) {
			registerLazyCommand(program, entry);
			return;
		}
	}
	for (const candidate of entries) registerLazyCommand(program, candidate);
}
//#endregion
export { register_subclis_exports as a, registerSubCliCommands as i, getSubCliEntries as n, removeCommandByName as o, registerSubCliByName as r, reparseProgramFromActionArgs as s, getSubCliCommandsWithSubcommands as t };
