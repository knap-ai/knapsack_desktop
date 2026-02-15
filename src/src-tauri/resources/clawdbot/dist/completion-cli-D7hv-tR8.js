import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { g as resolveStateDir } from "./paths-DVBShlw6.js";
import { i as routeLogsToStderr } from "./subsystem-QRNIBE7-.js";
import { g as pathExists } from "./utils-CrauP1IK.js";
import { t as isTruthyEnvValue } from "./env-BSjH4KuP.js";
import { r as resolveActionArgs } from "./helpers-BbAl8VsI.js";
import os from "node:os";
import path from "node:path";
import fsPromises from "node:fs/promises";
import { Option } from "commander";

//#region src/cli/argv.ts
const HELP_FLAGS = new Set(["-h", "--help"]);
const VERSION_FLAGS = new Set([
	"-v",
	"-V",
	"--version"
]);
const FLAG_TERMINATOR = "--";
function hasHelpOrVersion(argv) {
	return argv.some((arg) => HELP_FLAGS.has(arg) || VERSION_FLAGS.has(arg));
}
function hasFlag(argv, name) {
	const args = argv.slice(2);
	for (const arg of args) {
		if (arg === FLAG_TERMINATOR) break;
		if (arg === name) return true;
	}
	return false;
}
function getVerboseFlag(argv, options) {
	if (hasFlag(argv, "--verbose")) return true;
	if (options?.includeDebug && hasFlag(argv, "--debug")) return true;
	return false;
}
function getCommandPath(argv, depth = 2) {
	const args = argv.slice(2);
	const path = [];
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (!arg) continue;
		if (arg === "--") break;
		if (arg.startsWith("-")) continue;
		path.push(arg);
		if (path.length >= depth) break;
	}
	return path;
}
function getPrimaryCommand(argv) {
	const [primary] = getCommandPath(argv, 1);
	return primary ?? null;
}
function buildParseArgv(params) {
	const baseArgv = params.rawArgs && params.rawArgs.length > 0 ? params.rawArgs : params.fallbackArgv && params.fallbackArgv.length > 0 ? params.fallbackArgv : process.argv;
	const programName = params.programName ?? "";
	const normalizedArgv = programName && baseArgv[0] === programName ? baseArgv.slice(1) : baseArgv[0]?.endsWith("openclaw") ? baseArgv.slice(1) : baseArgv;
	const executable = (normalizedArgv[0]?.split(/[/\\]/).pop() ?? "").toLowerCase();
	if (normalizedArgv.length >= 2 && (isNodeExecutable(executable) || isBunExecutable(executable))) return normalizedArgv;
	return [
		"node",
		programName || "openclaw",
		...normalizedArgv
	];
}
const nodeExecutablePattern = /^node-\d+(?:\.\d+)*(?:\.exe)?$/;
function isNodeExecutable(executable) {
	return executable === "node" || executable === "node.exe" || executable === "nodejs" || executable === "nodejs.exe" || nodeExecutablePattern.test(executable);
}
function isBunExecutable(executable) {
	return executable === "bun" || executable === "bun.exe";
}
function shouldMigrateStateFromPath(path) {
	if (path.length === 0) return true;
	const [primary, secondary] = path;
	if (primary === "health" || primary === "status" || primary === "sessions") return false;
	if (primary === "config" && (secondary === "get" || secondary === "unset")) return false;
	if (primary === "models" && (secondary === "list" || secondary === "status")) return false;
	if (primary === "memory" && secondary === "status") return false;
	if (primary === "agent") return false;
	return true;
}

//#endregion
//#region src/cli/program/register.subclis.ts
const shouldRegisterPrimaryOnly = (argv) => {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS)) return false;
	if (hasHelpOrVersion(argv)) return false;
	return true;
};
const shouldEagerRegisterSubcommands = (_argv) => {
	return isTruthyEnvValue(process.env.OPENCLAW_DISABLE_LAZY_SUBCOMMANDS);
};
const loadConfig = async () => {
	return (await import("./config-CWifpzL_.js").then((n) => n.t)).loadConfig();
};
const entries = [
	{
		name: "acp",
		description: "Agent Control Protocol tools",
		register: async (program) => {
			(await import("./acp-cli-Cv_nGlYI.js")).registerAcpCli(program);
		}
	},
	{
		name: "gateway",
		description: "Gateway control",
		register: async (program) => {
			(await import("./gateway-cli-C3pYQ6KU.js")).registerGatewayCli(program);
		}
	},
	{
		name: "daemon",
		description: "Gateway service (legacy alias)",
		register: async (program) => {
			(await import("./daemon-cli-HLdXfMBU.js").then((n) => n.t)).registerDaemonCli(program);
		}
	},
	{
		name: "logs",
		description: "Gateway logs",
		register: async (program) => {
			(await import("./logs-cli-BvXXrTeb.js")).registerLogsCli(program);
		}
	},
	{
		name: "system",
		description: "System events, heartbeat, and presence",
		register: async (program) => {
			(await import("./system-cli-Csuvgzak.js")).registerSystemCli(program);
		}
	},
	{
		name: "models",
		description: "Model configuration",
		register: async (program) => {
			(await import("./models-cli-jISTU75s.js")).registerModelsCli(program);
		}
	},
	{
		name: "approvals",
		description: "Exec approvals",
		register: async (program) => {
			(await import("./exec-approvals-cli-CjbH-9QD.js")).registerExecApprovalsCli(program);
		}
	},
	{
		name: "nodes",
		description: "Node commands",
		register: async (program) => {
			(await import("./nodes-cli-DIZOPKfL.js")).registerNodesCli(program);
		}
	},
	{
		name: "devices",
		description: "Device pairing + token management",
		register: async (program) => {
			(await import("./devices-cli-Dm3v0e2-.js")).registerDevicesCli(program);
		}
	},
	{
		name: "node",
		description: "Node control",
		register: async (program) => {
			(await import("./node-cli-CVJUcqiy.js")).registerNodeCli(program);
		}
	},
	{
		name: "sandbox",
		description: "Sandbox tools",
		register: async (program) => {
			(await import("./sandbox-cli-DRQJwdPM.js")).registerSandboxCli(program);
		}
	},
	{
		name: "tui",
		description: "Terminal UI",
		register: async (program) => {
			(await import("./tui-cli-CMrz-Dwz.js")).registerTuiCli(program);
		}
	},
	{
		name: "cron",
		description: "Cron scheduler",
		register: async (program) => {
			(await import("./cron-cli-ZWoxHFOo.js")).registerCronCli(program);
		}
	},
	{
		name: "dns",
		description: "DNS helpers",
		register: async (program) => {
			(await import("./dns-cli-Y6Nt5sTV.js")).registerDnsCli(program);
		}
	},
	{
		name: "docs",
		description: "Docs helpers",
		register: async (program) => {
			(await import("./docs-cli-B80nijNe.js")).registerDocsCli(program);
		}
	},
	{
		name: "hooks",
		description: "Hooks tooling",
		register: async (program) => {
			(await import("./hooks-cli-CblUQYcF.js")).registerHooksCli(program);
		}
	},
	{
		name: "webhooks",
		description: "Webhook helpers",
		register: async (program) => {
			(await import("./webhooks-cli-DmTa5dgI.js")).registerWebhooksCli(program);
		}
	},
	{
		name: "pairing",
		description: "Pairing helpers",
		register: async (program) => {
			const { registerPluginCliCommands } = await import("./cli-Cu4onk4a.js");
			registerPluginCliCommands(program, await loadConfig());
			(await import("./pairing-cli-CMMbYgln.js")).registerPairingCli(program);
		}
	},
	{
		name: "plugins",
		description: "Plugin management",
		register: async (program) => {
			(await import("./plugins-cli-B1wCy_mc.js")).registerPluginsCli(program);
			const { registerPluginCliCommands } = await import("./cli-Cu4onk4a.js");
			registerPluginCliCommands(program, await loadConfig());
		}
	},
	{
		name: "channels",
		description: "Channel management",
		register: async (program) => {
			(await import("./channels-cli-Ch0uIQNZ.js")).registerChannelsCli(program);
		}
	},
	{
		name: "directory",
		description: "Directory commands",
		register: async (program) => {
			(await import("./directory-cli-DWn8-bWh.js")).registerDirectoryCli(program);
		}
	},
	{
		name: "security",
		description: "Security helpers",
		register: async (program) => {
			(await import("./security-cli-C_fbYc11.js")).registerSecurityCli(program);
		}
	},
	{
		name: "skills",
		description: "Skills management",
		register: async (program) => {
			(await import("./skills-cli-Dqviu21w.js")).registerSkillsCli(program);
		}
	},
	{
		name: "update",
		description: "CLI update helpers",
		register: async (program) => {
			(await import("./update-cli-DoT2k_Al.js")).registerUpdateCli(program);
		}
	},
	{
		name: "completion",
		description: "Generate shell completion script",
		register: async (program) => {
			(await Promise.resolve().then(() => completion_cli_exports)).registerCompletionCli(program);
		}
	}
];
function getSubCliEntries() {
	return entries;
}
function removeCommand(program, command) {
	const commands = program.commands;
	const index = commands.indexOf(command);
	if (index >= 0) commands.splice(index, 1);
}
async function registerSubCliByName(program, name) {
	const entry = entries.find((candidate) => candidate.name === name);
	if (!entry) return false;
	const existing = program.commands.find((cmd) => cmd.name() === entry.name);
	if (existing) removeCommand(program, existing);
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
//#region src/cli/completion-cli.ts
var completion_cli_exports = /* @__PURE__ */ __exportAll({
	completionCacheExists: () => completionCacheExists,
	installCompletion: () => installCompletion,
	isCompletionInstalled: () => isCompletionInstalled,
	registerCompletionCli: () => registerCompletionCli,
	resolveCompletionCachePath: () => resolveCompletionCachePath,
	resolveShellFromEnv: () => resolveShellFromEnv,
	usesSlowDynamicCompletion: () => usesSlowDynamicCompletion
});
const COMPLETION_SHELLS = [
	"zsh",
	"bash",
	"powershell",
	"fish"
];
function isCompletionShell(value) {
	return COMPLETION_SHELLS.includes(value);
}
function resolveShellFromEnv(env = process.env) {
	const shellPath = env.SHELL?.trim() ?? "";
	const shellName = shellPath ? path.basename(shellPath).toLowerCase() : "";
	if (shellName === "zsh") return "zsh";
	if (shellName === "bash") return "bash";
	if (shellName === "fish") return "fish";
	if (shellName === "pwsh" || shellName === "powershell") return "powershell";
	return "zsh";
}
function sanitizeCompletionBasename(value) {
	const trimmed = value.trim();
	if (!trimmed) return "openclaw";
	return trimmed.replace(/[^a-zA-Z0-9._-]/g, "-");
}
function resolveCompletionCacheDir(env = process.env) {
	const stateDir = resolveStateDir(env, os.homedir);
	return path.join(stateDir, "completions");
}
function resolveCompletionCachePath(shell, binName) {
	const basename = sanitizeCompletionBasename(binName);
	const extension = shell === "powershell" ? "ps1" : shell === "fish" ? "fish" : shell === "bash" ? "bash" : "zsh";
	return path.join(resolveCompletionCacheDir(), `${basename}.${extension}`);
}
/** Check if the completion cache file exists for the given shell. */
async function completionCacheExists(shell, binName = "openclaw") {
	return pathExists(resolveCompletionCachePath(shell, binName));
}
function getCompletionScript(shell, program) {
	if (shell === "zsh") return generateZshCompletion(program);
	if (shell === "bash") return generateBashCompletion(program);
	if (shell === "powershell") return generatePowerShellCompletion(program);
	return generateFishCompletion(program);
}
async function writeCompletionCache(params) {
	const cacheDir = resolveCompletionCacheDir();
	await fsPromises.mkdir(cacheDir, { recursive: true });
	for (const shell of params.shells) {
		const script = getCompletionScript(shell, params.program);
		const targetPath = resolveCompletionCachePath(shell, params.binName);
		await fsPromises.writeFile(targetPath, script, "utf-8");
	}
}
function formatCompletionSourceLine(shell, binName, cachePath) {
	if (shell === "fish") return `source "${cachePath}"`;
	return `source "${cachePath}"`;
}
function isCompletionProfileHeader(line) {
	return line.trim() === "# OpenClaw Completion";
}
function isCompletionProfileLine(line, binName, cachePath) {
	if (line.includes(`${binName} completion`)) return true;
	if (cachePath && line.includes(cachePath)) return true;
	return false;
}
/** Check if a line uses the slow dynamic completion pattern (source <(...)) */
function isSlowDynamicCompletionLine(line, binName) {
	return line.includes(`<(${binName} completion`) || line.includes(`${binName} completion`) && line.includes("| source");
}
function updateCompletionProfile(content, binName, cachePath, sourceLine) {
	const lines = content.split("\n");
	const filtered = [];
	let hadExisting = false;
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i] ?? "";
		if (isCompletionProfileHeader(line)) {
			hadExisting = true;
			i += 1;
			continue;
		}
		if (isCompletionProfileLine(line, binName, cachePath)) {
			hadExisting = true;
			continue;
		}
		filtered.push(line);
	}
	const trimmed = filtered.join("\n").trimEnd();
	const block = `# OpenClaw Completion\n${sourceLine}`;
	const next = trimmed ? `${trimmed}\n\n${block}\n` : `${block}\n`;
	return {
		next,
		changed: next !== content,
		hadExisting
	};
}
function getShellProfilePath(shell) {
	const home = process.env.HOME || os.homedir();
	if (shell === "zsh") return path.join(home, ".zshrc");
	if (shell === "bash") return path.join(home, ".bashrc");
	if (shell === "fish") return path.join(home, ".config", "fish", "config.fish");
	if (process.platform === "win32") return path.join(process.env.USERPROFILE || home, "Documents", "PowerShell", "Microsoft.PowerShell_profile.ps1");
	return path.join(home, ".config", "powershell", "Microsoft.PowerShell_profile.ps1");
}
async function isCompletionInstalled(shell, binName = "openclaw") {
	const profilePath = getShellProfilePath(shell);
	if (!await pathExists(profilePath)) return false;
	const cachePathCandidate = resolveCompletionCachePath(shell, binName);
	const cachedPath = await pathExists(cachePathCandidate) ? cachePathCandidate : null;
	return (await fsPromises.readFile(profilePath, "utf-8")).split("\n").some((line) => isCompletionProfileHeader(line) || isCompletionProfileLine(line, binName, cachedPath));
}
/**
* Check if the profile uses the slow dynamic completion pattern.
* Returns true if profile has `source <(openclaw completion ...)` instead of cached file.
*/
async function usesSlowDynamicCompletion(shell, binName = "openclaw") {
	const profilePath = getShellProfilePath(shell);
	if (!await pathExists(profilePath)) return false;
	const cachePath = resolveCompletionCachePath(shell, binName);
	const lines = (await fsPromises.readFile(profilePath, "utf-8")).split("\n");
	for (const line of lines) if (isSlowDynamicCompletionLine(line, binName) && !line.includes(cachePath)) return true;
	return false;
}
function registerCompletionCli(program) {
	program.command("completion").description("Generate shell completion script").addOption(new Option("-s, --shell <shell>", "Shell to generate completion for (default: zsh)").choices(COMPLETION_SHELLS)).option("-i, --install", "Install completion script to shell profile").option("--write-state", "Write completion scripts to $OPENCLAW_STATE_DIR/completions (no stdout)").option("-y, --yes", "Skip confirmation (non-interactive)", false).action(async (options) => {
		routeLogsToStderr();
		const shell = options.shell ?? "zsh";
		const entries = getSubCliEntries();
		for (const entry of entries) {
			if (entry.name === "completion") continue;
			await registerSubCliByName(program, entry.name);
		}
		if (options.writeState) await writeCompletionCache({
			program,
			shells: options.shell ? [shell] : [...COMPLETION_SHELLS],
			binName: program.name()
		});
		if (options.install) {
			await installCompletion(options.shell ?? resolveShellFromEnv(), Boolean(options.yes), program.name());
			return;
		}
		if (options.writeState) return;
		if (!isCompletionShell(shell)) throw new Error(`Unsupported shell: ${shell}`);
		const script = getCompletionScript(shell, program);
		process.stdout.write(script + "\n");
	});
}
async function installCompletion(shell, yes, binName = "openclaw") {
	const home = process.env.HOME || os.homedir();
	let profilePath = "";
	let sourceLine = "";
	if (!isCompletionShell(shell)) {
		console.error(`Automated installation not supported for ${shell} yet.`);
		return;
	}
	const cachePath = resolveCompletionCachePath(shell, binName);
	if (!await pathExists(cachePath)) {
		console.error(`Completion cache not found at ${cachePath}. Run \`${binName} completion --write-state\` first.`);
		return;
	}
	if (shell === "zsh") {
		profilePath = path.join(home, ".zshrc");
		sourceLine = formatCompletionSourceLine("zsh", binName, cachePath);
	} else if (shell === "bash") {
		profilePath = path.join(home, ".bashrc");
		try {
			await fsPromises.access(profilePath);
		} catch {
			profilePath = path.join(home, ".bash_profile");
		}
		sourceLine = formatCompletionSourceLine("bash", binName, cachePath);
	} else if (shell === "fish") {
		profilePath = path.join(home, ".config", "fish", "config.fish");
		sourceLine = formatCompletionSourceLine("fish", binName, cachePath);
	} else {
		console.error(`Automated installation not supported for ${shell} yet.`);
		return;
	}
	try {
		try {
			await fsPromises.access(profilePath);
		} catch {
			if (!yes) console.warn(`Profile not found at ${profilePath}. Created a new one.`);
			await fsPromises.mkdir(path.dirname(profilePath), { recursive: true });
			await fsPromises.writeFile(profilePath, "", "utf-8");
		}
		const update = updateCompletionProfile(await fsPromises.readFile(profilePath, "utf-8"), binName, cachePath, sourceLine);
		if (!update.changed) {
			if (!yes) console.log(`Completion already installed in ${profilePath}`);
			return;
		}
		if (!yes) {
			const action = update.hadExisting ? "Updating" : "Installing";
			console.log(`${action} completion in ${profilePath}...`);
		}
		await fsPromises.writeFile(profilePath, update.next, "utf-8");
		if (!yes) console.log(`Completion installed. Restart your shell or run: source ${profilePath}`);
	} catch (err) {
		console.error(`Failed to install completion: ${err}`);
	}
}
function generateZshCompletion(program) {
	const rootCmd = program.name();
	return `
#compdef ${rootCmd}

_${rootCmd}_root_completion() {
  local -a commands
  local -a options
  
  _arguments -C \\
    ${generateZshArgs(program)} \\
    ${generateZshSubcmdList(program)} \\
    "*::arg:->args"

  case $state in
    (args)
      case $line[1] in
        ${program.commands.map((cmd) => `(${cmd.name()}) _${rootCmd}_${cmd.name().replace(/-/g, "_")} ;;`).join("\n        ")}
      esac
      ;;
  esac
}

${generateZshSubcommands(program, rootCmd)}

compdef _${rootCmd}_root_completion ${rootCmd}
`;
}
function generateZshArgs(cmd) {
	return (cmd.options || []).map((opt) => {
		const flags = opt.flags.split(/[ ,|]+/);
		const name = flags.find((f) => f.startsWith("--")) || flags[0];
		const short = flags.find((f) => f.startsWith("-") && !f.startsWith("--"));
		const desc = opt.description.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/'/g, "'\\''").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
		if (short) return `"(${name} ${short})"{${name},${short}}"[${desc}]"`;
		return `"${name}[${desc}]"`;
	}).join(" \\\n    ");
}
function generateZshSubcmdList(cmd) {
	return `"1: :_values 'command' ${cmd.commands.map((c) => {
		const desc = c.description().replace(/\\/g, "\\\\").replace(/'/g, "'\\''").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
		return `'${c.name()}[${desc}]'`;
	}).join(" ")}"`;
}
function generateZshSubcommands(program, prefix) {
	let script = "";
	for (const cmd of program.commands) {
		const cmdName = cmd.name();
		const funcName = `_${prefix}_${cmdName.replace(/-/g, "_")}`;
		script += generateZshSubcommands(cmd, `${prefix}_${cmdName.replace(/-/g, "_")}`);
		const subCommands = cmd.commands;
		if (subCommands.length > 0) script += `
${funcName}() {
  local -a commands
  local -a options
  
  _arguments -C \\
    ${generateZshArgs(cmd)} \\
    ${generateZshSubcmdList(cmd)} \\
    "*::arg:->args"

  case $state in
    (args)
      case $line[1] in
        ${subCommands.map((sub) => `(${sub.name()}) ${funcName}_${sub.name().replace(/-/g, "_")} ;;`).join("\n        ")}
      esac
      ;;
  esac
}
`;
		else script += `
${funcName}() {
  _arguments -C \\
    ${generateZshArgs(cmd)}
}
`;
	}
	return script;
}
function generateBashCompletion(program) {
	const rootCmd = program.name();
	return `
_${rootCmd}_completion() {
    local cur prev opts
    COMPREPLY=()
    cur="\${COMP_WORDS[COMP_CWORD]}"
    prev="\${COMP_WORDS[COMP_CWORD-1]}"
    
    # Simple top-level completion for now
    opts="${program.commands.map((c) => c.name()).join(" ")} ${program.options.map((o) => o.flags.split(" ")[0]).join(" ")}"
    
    case "\${prev}" in
      ${program.commands.map((cmd) => generateBashSubcommand(cmd)).join("\n      ")}
    esac

    if [[ \${cur} == -* ]] ; then
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
    fi
    
    COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
}

complete -F _${rootCmd}_completion ${rootCmd}
`;
}
function generateBashSubcommand(cmd) {
	return `${cmd.name()})
        opts="${cmd.commands.map((c) => c.name()).join(" ")} ${cmd.options.map((o) => o.flags.split(" ")[0]).join(" ")}"
        COMPREPLY=( $(compgen -W "\${opts}" -- \${cur}) )
        return 0
        ;;`;
}
function generatePowerShellCompletion(program) {
	const rootCmd = program.name();
	const visit = (cmd, parents) => {
		const cmdName = cmd.name();
		const fullPath = [...parents, cmdName].join(" ");
		let script = "";
		const subCommands = cmd.commands.map((c) => c.name());
		const options = cmd.options.map((o) => o.flags.split(/[ ,|]+/)[0]);
		const allCompletions = [...subCommands, ...options].map((s) => `'${s}'`).join(",");
		if (allCompletions.length > 0) script += `
            if ($commandPath -eq '${fullPath}') {
                $completions = @(${allCompletions})
                $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
                    [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
                }
            }
`;
		for (const sub of cmd.commands) script += visit(sub, [...parents, cmdName]);
		return script;
	};
	const rootBody = visit(program, []);
	return `
Register-ArgumentCompleter -Native -CommandName ${rootCmd} -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)
    
    $commandElements = $commandAst.CommandElements
    $commandPath = ""
    
    # Reconstruct command path (simple approximation)
    # Skip the executable name
    for ($i = 1; $i -lt $commandElements.Count; $i++) {
        $element = $commandElements[$i].Extent.Text
        if ($element -like "-*") { break }
        if ($i -eq $commandElements.Count - 1 -and $wordToComplete -ne "") { break } # Don't include current word being typed
        $commandPath += "$element "
    }
    $commandPath = $commandPath.Trim()
    
    # Root command
    if ($commandPath -eq "") {
         $completions = @(${program.commands.map((c) => `'${c.name()}'`).join(",")}, ${program.options.map((o) => `'${o.flags.split(" ")[0]}'`).join(",")}) 
         $completions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
         }
    }
    
    ${rootBody}
}
`;
}
function generateFishCompletion(program) {
	const rootCmd = program.name();
	let script = "";
	const visit = (cmd, parents) => {
		const cmdName = cmd.name();
		const fullPath = [...parents];
		if (parents.length > 0) fullPath.push(cmdName);
		if (parents.length === 0) {
			for (const sub of cmd.commands) {
				const desc = sub.description().replace(/'/g, "'\\''");
				script += `complete -c ${rootCmd} -n "__fish_use_subcommand" -a "${sub.name()}" -d '${desc}'\n`;
			}
			for (const opt of cmd.options) {
				const flags = opt.flags.split(/[ ,|]+/);
				const long = flags.find((f) => f.startsWith("--"))?.replace(/^--/, "");
				const short = flags.find((f) => f.startsWith("-") && !f.startsWith("--"))?.replace(/^-/, "");
				const desc = opt.description.replace(/'/g, "'\\''");
				let line = `complete -c ${rootCmd} -n "__fish_use_subcommand"`;
				if (short) line += ` -s ${short}`;
				if (long) line += ` -l ${long}`;
				line += ` -d '${desc}'\n`;
				script += line;
			}
		} else {
			for (const sub of cmd.commands) {
				const desc = sub.description().replace(/'/g, "'\\''");
				script += `complete -c ${rootCmd} -n "__fish_seen_subcommand_from ${cmdName}" -a "${sub.name()}" -d '${desc}'\n`;
			}
			for (const opt of cmd.options) {
				const flags = opt.flags.split(/[ ,|]+/);
				const long = flags.find((f) => f.startsWith("--"))?.replace(/^--/, "");
				const short = flags.find((f) => f.startsWith("-") && !f.startsWith("--"))?.replace(/^-/, "");
				const desc = opt.description.replace(/'/g, "'\\''");
				let line = `complete -c ${rootCmd} -n "__fish_seen_subcommand_from ${cmdName}"`;
				if (short) line += ` -s ${short}`;
				if (long) line += ` -l ${long}`;
				line += ` -d '${desc}'\n`;
				script += line;
			}
		}
		for (const sub of cmd.commands) visit(sub, [...parents, cmdName]);
	};
	visit(program, []);
	return script;
}

//#endregion
export { resolveCompletionCachePath as a, registerSubCliCommands as c, hasHelpOrVersion as d, shouldMigrateStateFromPath as f, isCompletionInstalled as i, getCommandPath as l, completion_cli_exports as n, resolveShellFromEnv as o, installCompletion as r, usesSlowDynamicCompletion as s, completionCacheExists as t, getVerboseFlag as u };