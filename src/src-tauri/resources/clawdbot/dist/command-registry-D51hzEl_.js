import { E as getPrimaryCommand, k as hasHelpOrVersion } from "./logger-kwZIqwuw.js";
import { a as removeCommandByName, i as registerSubCliCommands, o as reparseProgramFromActionArgs } from "./register.subclis-DWT5Gugx.js";
import { t as getCoreCliCommandDescriptors } from "./core-command-descriptors-CiYIRNJO.js";
//#region src/cli/program/command-registry.ts
const shouldRegisterCorePrimaryOnly = (argv) => {
	if (hasHelpOrVersion(argv)) return false;
	return true;
};
const coreEntries = [
	{
		commands: [{
			name: "setup",
			description: "Initialize local config and agent workspace",
			hasSubcommands: false
		}],
		register: async ({ program }) => {
			(await import("./register.setup-BEVl5DC_.js")).registerSetupCommand(program);
		}
	},
	{
		commands: [{
			name: "onboard",
			description: "Interactive onboarding for gateway, workspace, and skills",
			hasSubcommands: false
		}],
		register: async ({ program }) => {
			(await import("./register.onboard-C9nz9P5V.js")).registerOnboardCommand(program);
		}
	},
	{
		commands: [{
			name: "configure",
			description: "Interactive configuration for credentials, channels, gateway, and agent defaults",
			hasSubcommands: false
		}],
		register: async ({ program }) => {
			(await import("./register.configure-Cnfre7Z2.js")).registerConfigureCommand(program);
		}
	},
	{
		commands: [{
			name: "config",
			description: "Non-interactive config helpers (get/set/unset/file/validate). Default: starts guided setup.",
			hasSubcommands: true
		}],
		register: async ({ program }) => {
			(await import("./config-cli-LT-pxbdh.js")).registerConfigCli(program);
		}
	},
	{
		commands: [{
			name: "backup",
			description: "Create and verify local backup archives for OpenClaw state",
			hasSubcommands: true
		}],
		register: async ({ program }) => {
			(await import("./register.backup-E299PDtP.js")).registerBackupCommand(program);
		}
	},
	{
		commands: [
			{
				name: "doctor",
				description: "Health checks + quick fixes for the gateway and channels",
				hasSubcommands: false
			},
			{
				name: "dashboard",
				description: "Open the Control UI with your current token",
				hasSubcommands: false
			},
			{
				name: "reset",
				description: "Reset local config/state (keeps the CLI installed)",
				hasSubcommands: false
			},
			{
				name: "uninstall",
				description: "Uninstall the gateway service + local data (CLI remains)",
				hasSubcommands: false
			}
		],
		register: async ({ program }) => {
			(await import("./register.maintenance-DcNBAApe.js")).registerMaintenanceCommands(program);
		}
	},
	{
		commands: [{
			name: "message",
			description: "Send, read, and manage messages",
			hasSubcommands: true
		}],
		register: async ({ program, ctx }) => {
			(await import("./register.message-B83KCnuR.js")).registerMessageCommands(program, ctx);
		}
	},
	{
		commands: [{
			name: "memory",
			description: "Search and reindex memory files",
			hasSubcommands: true
		}],
		register: async ({ program }) => {
			(await import("./cli/memory-cli.js")).registerMemoryCli(program);
		}
	},
	{
		commands: [{
			name: "mcp",
			description: "Manage embedded Pi MCP servers",
			hasSubcommands: true
		}],
		register: async ({ program }) => {
			(await import("./mcp-cli-xVhJwRtC.js")).registerMcpCli(program);
		}
	},
	{
		commands: [{
			name: "agent",
			description: "Run one agent turn via the Gateway",
			hasSubcommands: false
		}, {
			name: "agents",
			description: "Manage isolated agents (workspaces, auth, routing)",
			hasSubcommands: true
		}],
		register: async ({ program, ctx }) => {
			(await import("./register.agent-BVmAoxFg.js")).registerAgentCommands(program, { agentChannelOptions: ctx.agentChannelOptions });
		}
	},
	{
		commands: [
			{
				name: "status",
				description: "Show channel health and recent session recipients",
				hasSubcommands: false
			},
			{
				name: "health",
				description: "Fetch health from the running gateway",
				hasSubcommands: false
			},
			{
				name: "sessions",
				description: "List stored conversation sessions",
				hasSubcommands: true
			}
		],
		register: async ({ program }) => {
			(await import("./register.status-health-sessions-Bjwulf6u.js")).registerStatusHealthSessionsCommands(program);
		}
	},
	{
		commands: [{
			name: "browser",
			description: "Manage OpenClaw's dedicated browser (Chrome/Chromium)",
			hasSubcommands: true
		}],
		register: async ({ program }) => {
			(await import("./browser-cli-GnlPVJXR.js")).registerBrowserCli(program);
		}
	}
];
function getCoreCliCommandNames() {
	return getCoreCliCommandDescriptors().map((command) => command.name);
}
function removeEntryCommands(program, entry) {
	for (const cmd of entry.commands) removeCommandByName(program, cmd.name);
}
function registerLazyCoreCommand(program, ctx, entry, command) {
	const placeholder = program.command(command.name).description(command.description);
	placeholder.allowUnknownOption(true);
	placeholder.allowExcessArguments(true);
	placeholder.action(async (...actionArgs) => {
		removeEntryCommands(program, entry);
		await entry.register({
			program,
			ctx,
			argv: process.argv
		});
		await reparseProgramFromActionArgs(program, actionArgs);
	});
}
async function registerCoreCliByName(program, ctx, name, argv = process.argv) {
	const entry = coreEntries.find((candidate) => candidate.commands.some((cmd) => cmd.name === name));
	if (!entry) return false;
	removeEntryCommands(program, entry);
	await entry.register({
		program,
		ctx,
		argv
	});
	return true;
}
function registerCoreCliCommands(program, ctx, argv) {
	const primary = getPrimaryCommand(argv);
	if (primary && shouldRegisterCorePrimaryOnly(argv)) {
		const entry = coreEntries.find((candidate) => candidate.commands.some((cmd) => cmd.name === primary));
		if (entry) {
			const cmd = entry.commands.find((c) => c.name === primary);
			if (cmd) registerLazyCoreCommand(program, ctx, entry, cmd);
			return;
		}
	}
	for (const entry of coreEntries) for (const cmd of entry.commands) registerLazyCoreCommand(program, ctx, entry, cmd);
}
function registerProgramCommands(program, ctx, argv = process.argv) {
	registerCoreCliCommands(program, ctx, argv);
	registerSubCliCommands(program, argv);
}
//#endregion
export { registerProgramCommands as i, registerCoreCliByName as n, registerCoreCliCommands as r, getCoreCliCommandNames as t };
