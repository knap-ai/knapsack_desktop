import { A as colorize, M as theme, j as isRich } from "./entry.js";
import { f as resolveGatewayWindowsTaskName, l as resolveGatewayLaunchAgentLabel, p as resolveLegacyGatewayLaunchAgentLabels, s as formatGatewayServiceDescription, t as GATEWAY_LAUNCH_AGENT_LABEL } from "./constants-BnUiPMIW.js";
import { a as readSystemdServiceRuntime, c as stopSystemdService, f as parseKeyValueOutput, i as readSystemdServiceExecStart, l as uninstallSystemdService, m as resolveHomeDir, n as isSystemdServiceEnabled, p as resolveGatewayStateDir, s as restartSystemdService, t as installSystemdService } from "./systemd-BmDw_juR.js";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import fs from "node:fs/promises";

//#region src/daemon/launchd-plist.ts
const plistEscape = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
const plistUnescape = (value) => value.replaceAll("&apos;", "'").replaceAll("&quot;", "\"").replaceAll("&gt;", ">").replaceAll("&lt;", "<").replaceAll("&amp;", "&");
const renderEnvDict = (env) => {
	if (!env) return "";
	const entries = Object.entries(env).filter(([, value]) => typeof value === "string" && value.trim());
	if (entries.length === 0) return "";
	return `\n    <key>EnvironmentVariables</key>\n    <dict>${entries.map(([key, value]) => `\n    <key>${plistEscape(key)}</key>\n    <string>${plistEscape(value?.trim() ?? "")}</string>`).join("")}\n    </dict>`;
};
async function readLaunchAgentProgramArgumentsFromFile(plistPath) {
	try {
		const plist = await fs.readFile(plistPath, "utf8");
		const programMatch = plist.match(/<key>ProgramArguments<\/key>\s*<array>([\s\S]*?)<\/array>/i);
		if (!programMatch) return null;
		const args = Array.from(programMatch[1].matchAll(/<string>([\s\S]*?)<\/string>/gi)).map((match) => plistUnescape(match[1] ?? "").trim());
		const workingDirMatch = plist.match(/<key>WorkingDirectory<\/key>\s*<string>([\s\S]*?)<\/string>/i);
		const workingDirectory = workingDirMatch ? plistUnescape(workingDirMatch[1] ?? "").trim() : "";
		const envMatch = plist.match(/<key>EnvironmentVariables<\/key>\s*<dict>([\s\S]*?)<\/dict>/i);
		const environment = {};
		if (envMatch) for (const pair of envMatch[1].matchAll(/<key>([\s\S]*?)<\/key>\s*<string>([\s\S]*?)<\/string>/gi)) {
			const key = plistUnescape(pair[1] ?? "").trim();
			if (!key) continue;
			environment[key] = plistUnescape(pair[2] ?? "").trim();
		}
		return {
			programArguments: args.filter(Boolean),
			...workingDirectory ? { workingDirectory } : {},
			...Object.keys(environment).length > 0 ? { environment } : {},
			sourcePath: plistPath
		};
	} catch {
		return null;
	}
}
function buildLaunchAgentPlist$1({ label, comment, programArguments, workingDirectory, stdoutPath, stderrPath, environment }) {
	const argsXml = programArguments.map((arg) => `\n      <string>${plistEscape(arg)}</string>`).join("");
	const workingDirXml = workingDirectory ? `\n    <key>WorkingDirectory</key>\n    <string>${plistEscape(workingDirectory)}</string>` : "";
	const commentXml = comment?.trim() ? `\n    <key>Comment</key>\n    <string>${plistEscape(comment.trim())}</string>` : "";
	const envXml = renderEnvDict(environment);
	return `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n  <dict>\n    <key>Label</key>\n    <string>${plistEscape(label)}</string>\n    ${commentXml}\n    <key>RunAtLoad</key>\n    <true/>\n    <key>KeepAlive</key>\n    <true/>\n    <key>ProgramArguments</key>\n    <array>${argsXml}\n    </array>\n    ${workingDirXml}\n    <key>StandardOutPath</key>\n    <string>${plistEscape(stdoutPath)}</string>\n    <key>StandardErrorPath</key>\n    <string>${plistEscape(stderrPath)}</string>${envXml}\n  </dict>\n</plist>\n`;
}

//#endregion
//#region src/daemon/launchd.ts
const execFileAsync$1 = promisify(execFile);
const toPosixPath = (value) => value.replace(/\\/g, "/");
const formatLine$1 = (label, value) => {
	const rich = isRich();
	return `${colorize(rich, theme.muted, `${label}:`)} ${colorize(rich, theme.command, value)}`;
};
function resolveLaunchAgentLabel(args) {
	const envLabel = args?.env?.OPENCLAW_LAUNCHD_LABEL?.trim();
	if (envLabel) return envLabel;
	return resolveGatewayLaunchAgentLabel(args?.env?.OPENCLAW_PROFILE);
}
function resolveLaunchAgentPlistPathForLabel(env, label) {
	const home = toPosixPath(resolveHomeDir(env));
	return path.posix.join(home, "Library", "LaunchAgents", `${label}.plist`);
}
function resolveLaunchAgentPlistPath(env) {
	return resolveLaunchAgentPlistPathForLabel(env, resolveLaunchAgentLabel({ env }));
}
function resolveGatewayLogPaths(env) {
	const stateDir = resolveGatewayStateDir(env);
	const logDir = path.join(stateDir, "logs");
	const prefix = env.OPENCLAW_LOG_PREFIX?.trim() || "gateway";
	return {
		logDir,
		stdoutPath: path.join(logDir, `${prefix}.log`),
		stderrPath: path.join(logDir, `${prefix}.err.log`)
	};
}
async function readLaunchAgentProgramArguments(env) {
	return readLaunchAgentProgramArgumentsFromFile(resolveLaunchAgentPlistPath(env));
}
function buildLaunchAgentPlist({ label = GATEWAY_LAUNCH_AGENT_LABEL, comment, programArguments, workingDirectory, stdoutPath, stderrPath, environment }) {
	return buildLaunchAgentPlist$1({
		label,
		comment,
		programArguments,
		workingDirectory,
		stdoutPath,
		stderrPath,
		environment
	});
}
async function execLaunchctl(args) {
	try {
		const { stdout, stderr } = await execFileAsync$1("launchctl", args, {
			encoding: "utf8",
			shell: process.platform === "win32"
		});
		return {
			stdout: String(stdout ?? ""),
			stderr: String(stderr ?? ""),
			code: 0
		};
	} catch (error) {
		const e = error;
		return {
			stdout: typeof e.stdout === "string" ? e.stdout : "",
			stderr: typeof e.stderr === "string" ? e.stderr : typeof e.message === "string" ? e.message : "",
			code: typeof e.code === "number" ? e.code : 1
		};
	}
}
function resolveGuiDomain() {
	if (typeof process.getuid !== "function") return "gui/501";
	return `gui/${process.getuid()}`;
}
function parseLaunchctlPrint(output) {
	const entries = parseKeyValueOutput(output, "=");
	const info = {};
	const state = entries.state;
	if (state) info.state = state;
	const pidValue = entries.pid;
	if (pidValue) {
		const pid = Number.parseInt(pidValue, 10);
		if (Number.isFinite(pid)) info.pid = pid;
	}
	const exitStatusValue = entries["last exit status"];
	if (exitStatusValue) {
		const status = Number.parseInt(exitStatusValue, 10);
		if (Number.isFinite(status)) info.lastExitStatus = status;
	}
	const exitReason = entries["last exit reason"];
	if (exitReason) info.lastExitReason = exitReason;
	return info;
}
async function isLaunchAgentLoaded(args) {
	return (await execLaunchctl(["print", `${resolveGuiDomain()}/${resolveLaunchAgentLabel({ env: args.env })}`])).code === 0;
}
async function isLaunchAgentListed(args) {
	const label = resolveLaunchAgentLabel({ env: args.env });
	const res = await execLaunchctl(["list"]);
	if (res.code !== 0) return false;
	return res.stdout.split(/\r?\n/).some((line) => line.trim().split(/\s+/).at(-1) === label);
}
async function launchAgentPlistExists(env) {
	try {
		const plistPath = resolveLaunchAgentPlistPath(env);
		await fs.access(plistPath);
		return true;
	} catch {
		return false;
	}
}
async function readLaunchAgentRuntime(env) {
	const res = await execLaunchctl(["print", `${resolveGuiDomain()}/${resolveLaunchAgentLabel({ env })}`]);
	if (res.code !== 0) return {
		status: "unknown",
		detail: (res.stderr || res.stdout).trim() || void 0,
		missingUnit: true
	};
	const parsed = parseLaunchctlPrint(res.stdout || res.stderr || "");
	const plistExists = await launchAgentPlistExists(env);
	const state = parsed.state?.toLowerCase();
	return {
		status: state === "running" || parsed.pid ? "running" : state ? "stopped" : "unknown",
		state: parsed.state,
		pid: parsed.pid,
		lastExitStatus: parsed.lastExitStatus,
		lastExitReason: parsed.lastExitReason,
		cachedLabel: !plistExists
	};
}
async function repairLaunchAgentBootstrap(args) {
	const env = args.env ?? process.env;
	const domain = resolveGuiDomain();
	const label = resolveLaunchAgentLabel({ env });
	const boot = await execLaunchctl([
		"bootstrap",
		domain,
		resolveLaunchAgentPlistPath(env)
	]);
	if (boot.code !== 0) return {
		ok: false,
		detail: (boot.stderr || boot.stdout).trim() || void 0
	};
	const kick = await execLaunchctl([
		"kickstart",
		"-k",
		`${domain}/${label}`
	]);
	if (kick.code !== 0) return {
		ok: false,
		detail: (kick.stderr || kick.stdout).trim() || void 0
	};
	return { ok: true };
}
async function uninstallLaunchAgent({ env, stdout }) {
	const domain = resolveGuiDomain();
	const label = resolveLaunchAgentLabel({ env });
	const plistPath = resolveLaunchAgentPlistPath(env);
	await execLaunchctl([
		"bootout",
		domain,
		plistPath
	]);
	await execLaunchctl(["unload", plistPath]);
	try {
		await fs.access(plistPath);
	} catch {
		stdout.write(`LaunchAgent not found at ${plistPath}\n`);
		return;
	}
	const home = resolveHomeDir(env);
	const trashDir = path.join(home, ".Trash");
	const dest = path.join(trashDir, `${label}.plist`);
	try {
		await fs.mkdir(trashDir, { recursive: true });
		await fs.rename(plistPath, dest);
		stdout.write(`${formatLine$1("Moved LaunchAgent to Trash", dest)}\n`);
	} catch {
		stdout.write(`LaunchAgent remains at ${plistPath} (could not move)\n`);
	}
}
function isLaunchctlNotLoaded(res) {
	const detail = (res.stderr || res.stdout).toLowerCase();
	return detail.includes("no such process") || detail.includes("could not find service") || detail.includes("not found");
}
async function stopLaunchAgent({ stdout, env }) {
	const domain = resolveGuiDomain();
	const label = resolveLaunchAgentLabel({ env });
	const res = await execLaunchctl(["bootout", `${domain}/${label}`]);
	if (res.code !== 0 && !isLaunchctlNotLoaded(res)) throw new Error(`launchctl bootout failed: ${res.stderr || res.stdout}`.trim());
	stdout.write(`${formatLine$1("Stopped LaunchAgent", `${domain}/${label}`)}\n`);
}
async function installLaunchAgent({ env, stdout, programArguments, workingDirectory, environment, description }) {
	const { logDir, stdoutPath, stderrPath } = resolveGatewayLogPaths(env);
	await fs.mkdir(logDir, { recursive: true });
	const domain = resolveGuiDomain();
	const label = resolveLaunchAgentLabel({ env });
	for (const legacyLabel of resolveLegacyGatewayLaunchAgentLabels(env.OPENCLAW_PROFILE)) {
		const legacyPlistPath = resolveLaunchAgentPlistPathForLabel(env, legacyLabel);
		await execLaunchctl([
			"bootout",
			domain,
			legacyPlistPath
		]);
		await execLaunchctl(["unload", legacyPlistPath]);
		try {
			await fs.unlink(legacyPlistPath);
		} catch {}
	}
	const plistPath = resolveLaunchAgentPlistPathForLabel(env, label);
	await fs.mkdir(path.dirname(plistPath), { recursive: true });
	const plist = buildLaunchAgentPlist({
		label,
		comment: description ?? formatGatewayServiceDescription({
			profile: env.OPENCLAW_PROFILE,
			version: environment?.OPENCLAW_SERVICE_VERSION ?? env.OPENCLAW_SERVICE_VERSION
		}),
		programArguments,
		workingDirectory,
		stdoutPath,
		stderrPath,
		environment
	});
	await fs.writeFile(plistPath, plist, "utf8");
	await execLaunchctl([
		"bootout",
		domain,
		plistPath
	]);
	await execLaunchctl(["unload", plistPath]);
	await execLaunchctl(["enable", `${domain}/${label}`]);
	const boot = await execLaunchctl([
		"bootstrap",
		domain,
		plistPath
	]);
	if (boot.code !== 0) throw new Error(`launchctl bootstrap failed: ${boot.stderr || boot.stdout}`.trim());
	await execLaunchctl([
		"kickstart",
		"-k",
		`${domain}/${label}`
	]);
	stdout.write("\n");
	stdout.write(`${formatLine$1("Installed LaunchAgent", plistPath)}\n`);
	stdout.write(`${formatLine$1("Logs", stdoutPath)}\n`);
	return { plistPath };
}
async function restartLaunchAgent({ stdout, env }) {
	const domain = resolveGuiDomain();
	const label = resolveLaunchAgentLabel({ env });
	const res = await execLaunchctl([
		"kickstart",
		"-k",
		`${domain}/${label}`
	]);
	if (res.code !== 0) throw new Error(`launchctl kickstart failed: ${res.stderr || res.stdout}`.trim());
	try {
		stdout.write(`${formatLine$1("Restarted LaunchAgent", `${domain}/${label}`)}\n`);
	} catch (err) {
		if (err?.code !== "EPIPE") throw err;
	}
}

//#endregion
//#region src/daemon/schtasks.ts
const execFileAsync = promisify(execFile);
const formatLine = (label, value) => {
	const rich = isRich();
	return `${colorize(rich, theme.muted, `${label}:`)} ${colorize(rich, theme.command, value)}`;
};
function resolveTaskName(env) {
	const override = env.OPENCLAW_WINDOWS_TASK_NAME?.trim();
	if (override) return override;
	return resolveGatewayWindowsTaskName(env.OPENCLAW_PROFILE);
}
function resolveTaskScriptPath(env) {
	const override = env.OPENCLAW_TASK_SCRIPT?.trim();
	if (override) return override;
	const scriptName = env.OPENCLAW_TASK_SCRIPT_NAME?.trim() || "gateway.cmd";
	const stateDir = resolveGatewayStateDir(env);
	return path.join(stateDir, scriptName);
}
function quoteCmdArg(value) {
	if (!/[ \t"]/g.test(value)) return value;
	return `"${value.replace(/"/g, "\\\"")}"`;
}
function resolveTaskUser(env) {
	const username = env.USERNAME || env.USER || env.LOGNAME;
	if (!username) return null;
	if (username.includes("\\")) return username;
	const domain = env.USERDOMAIN;
	if (domain) return `${domain}\\${username}`;
	return username;
}
function parseCommandLine(value) {
	const args = [];
	let current = "";
	let inQuotes = false;
	for (let i = 0; i < value.length; i++) {
		const char = value[i];
		if (char === "\\" && i + 1 < value.length && value[i + 1] === "\"") {
			current += value[i + 1];
			i++;
			continue;
		}
		if (char === "\"") {
			inQuotes = !inQuotes;
			continue;
		}
		if (!inQuotes && /\s/.test(char)) {
			if (current) {
				args.push(current);
				current = "";
			}
			continue;
		}
		current += char;
	}
	if (current) args.push(current);
	return args;
}
async function readScheduledTaskCommand(env) {
	const scriptPath = resolveTaskScriptPath(env);
	try {
		const content = await fs.readFile(scriptPath, "utf8");
		let workingDirectory = "";
		let commandLine = "";
		const environment = {};
		for (const rawLine of content.split(/\r?\n/)) {
			const line = rawLine.trim();
			if (!line) continue;
			if (line.startsWith("@echo")) continue;
			if (line.toLowerCase().startsWith("rem ")) continue;
			if (line.toLowerCase().startsWith("set ")) {
				const assignment = line.slice(4).trim();
				const index = assignment.indexOf("=");
				if (index > 0) {
					const key = assignment.slice(0, index).trim();
					const value = assignment.slice(index + 1).trim();
					if (key) environment[key] = value;
				}
				continue;
			}
			if (line.toLowerCase().startsWith("cd /d ")) {
				workingDirectory = line.slice(6).trim().replace(/^"|"$/g, "");
				continue;
			}
			commandLine = line;
			break;
		}
		if (!commandLine) return null;
		return {
			programArguments: parseCommandLine(commandLine),
			...workingDirectory ? { workingDirectory } : {},
			...Object.keys(environment).length > 0 ? { environment } : {}
		};
	} catch {
		return null;
	}
}
function parseSchtasksQuery(output) {
	const entries = parseKeyValueOutput(output, ":");
	const info = {};
	const status = entries.status;
	if (status) info.status = status;
	const lastRunTime = entries["last run time"];
	if (lastRunTime) info.lastRunTime = lastRunTime;
	const lastRunResult = entries["last run result"];
	if (lastRunResult) info.lastRunResult = lastRunResult;
	return info;
}
function buildTaskScript({ description, programArguments, workingDirectory, environment }) {
	const lines = ["@echo off"];
	if (description?.trim()) lines.push(`rem ${description.trim()}`);
	if (workingDirectory) lines.push(`cd /d ${quoteCmdArg(workingDirectory)}`);
	if (environment) for (const [key, value] of Object.entries(environment)) {
		if (!value) continue;
		lines.push(`set ${key}=${value}`);
	}
	const command = programArguments.map(quoteCmdArg).join(" ");
	lines.push(command);
	return `${lines.join("\r\n")}\r\n`;
}
async function execSchtasks(args) {
	try {
		const { stdout, stderr } = await execFileAsync("schtasks", args, {
			encoding: "utf8",
			windowsHide: true
		});
		return {
			stdout: String(stdout ?? ""),
			stderr: String(stderr ?? ""),
			code: 0
		};
	} catch (error) {
		const e = error;
		return {
			stdout: typeof e.stdout === "string" ? e.stdout : "",
			stderr: typeof e.stderr === "string" ? e.stderr : typeof e.message === "string" ? e.message : "",
			code: typeof e.code === "number" ? e.code : 1
		};
	}
}
async function assertSchtasksAvailable() {
	const res = await execSchtasks(["/Query"]);
	if (res.code === 0) return;
	const detail = res.stderr || res.stdout;
	throw new Error(`schtasks unavailable: ${detail || "unknown error"}`.trim());
}
async function installScheduledTask({ env, stdout, programArguments, workingDirectory, environment, description }) {
	await assertSchtasksAvailable();
	const scriptPath = resolveTaskScriptPath(env);
	await fs.mkdir(path.dirname(scriptPath), { recursive: true });
	const script = buildTaskScript({
		description: description ?? formatGatewayServiceDescription({
			profile: env.OPENCLAW_PROFILE,
			version: environment?.OPENCLAW_SERVICE_VERSION ?? env.OPENCLAW_SERVICE_VERSION
		}),
		programArguments,
		workingDirectory,
		environment
	});
	await fs.writeFile(scriptPath, script, "utf8");
	const taskName = resolveTaskName(env);
	const baseArgs = [
		"/Create",
		"/F",
		"/SC",
		"ONLOGON",
		"/RL",
		"LIMITED",
		"/TN",
		taskName,
		"/TR",
		quoteCmdArg(scriptPath)
	];
	const taskUser = resolveTaskUser(env);
	let create = await execSchtasks(taskUser ? [
		...baseArgs,
		"/RU",
		taskUser,
		"/NP",
		"/IT"
	] : baseArgs);
	if (create.code !== 0 && taskUser) create = await execSchtasks(baseArgs);
	if (create.code !== 0) {
		const detail = create.stderr || create.stdout;
		const hint = /access is denied/i.test(detail) ? " Run PowerShell as Administrator or rerun without installing the daemon." : "";
		throw new Error(`schtasks create failed: ${detail}${hint}`.trim());
	}
	await execSchtasks([
		"/Run",
		"/TN",
		taskName
	]);
	stdout.write("\n");
	stdout.write(`${formatLine("Installed Scheduled Task", taskName)}\n`);
	stdout.write(`${formatLine("Task script", scriptPath)}\n`);
	return { scriptPath };
}
async function uninstallScheduledTask({ env, stdout }) {
	await assertSchtasksAvailable();
	await execSchtasks([
		"/Delete",
		"/F",
		"/TN",
		resolveTaskName(env)
	]);
	const scriptPath = resolveTaskScriptPath(env);
	try {
		await fs.unlink(scriptPath);
		stdout.write(`${formatLine("Removed task script", scriptPath)}\n`);
	} catch {
		stdout.write(`Task script not found at ${scriptPath}\n`);
	}
}
function isTaskNotRunning(res) {
	return (res.stderr || res.stdout).toLowerCase().includes("not running");
}
async function stopScheduledTask({ stdout, env }) {
	await assertSchtasksAvailable();
	const taskName = resolveTaskName(env ?? process.env);
	const res = await execSchtasks([
		"/End",
		"/TN",
		taskName
	]);
	if (res.code !== 0 && !isTaskNotRunning(res)) throw new Error(`schtasks end failed: ${res.stderr || res.stdout}`.trim());
	stdout.write(`${formatLine("Stopped Scheduled Task", taskName)}\n`);
}
async function restartScheduledTask({ stdout, env }) {
	await assertSchtasksAvailable();
	const taskName = resolveTaskName(env ?? process.env);
	await execSchtasks([
		"/End",
		"/TN",
		taskName
	]);
	const res = await execSchtasks([
		"/Run",
		"/TN",
		taskName
	]);
	if (res.code !== 0) throw new Error(`schtasks run failed: ${res.stderr || res.stdout}`.trim());
	stdout.write(`${formatLine("Restarted Scheduled Task", taskName)}\n`);
}
async function isScheduledTaskInstalled(args) {
	await assertSchtasksAvailable();
	return (await execSchtasks([
		"/Query",
		"/TN",
		resolveTaskName(args.env ?? process.env)
	])).code === 0;
}
async function readScheduledTaskRuntime(env = process.env) {
	try {
		await assertSchtasksAvailable();
	} catch (err) {
		return {
			status: "unknown",
			detail: String(err)
		};
	}
	const res = await execSchtasks([
		"/Query",
		"/TN",
		resolveTaskName(env),
		"/V",
		"/FO",
		"LIST"
	]);
	if (res.code !== 0) {
		const detail = (res.stderr || res.stdout).trim();
		const missing = detail.toLowerCase().includes("cannot find the file");
		return {
			status: missing ? "stopped" : "unknown",
			detail: detail || void 0,
			missingUnit: missing
		};
	}
	const parsed = parseSchtasksQuery(res.stdout || "");
	const statusRaw = parsed.status?.toLowerCase();
	return {
		status: statusRaw === "running" ? "running" : statusRaw ? "stopped" : "unknown",
		state: parsed.status,
		lastRunTime: parsed.lastRunTime,
		lastRunResult: parsed.lastRunResult
	};
}

//#endregion
//#region src/daemon/service.ts
function resolveGatewayService() {
	if (process.platform === "darwin") return {
		label: "LaunchAgent",
		loadedText: "loaded",
		notLoadedText: "not loaded",
		install: async (args) => {
			await installLaunchAgent(args);
		},
		uninstall: async (args) => {
			await uninstallLaunchAgent(args);
		},
		stop: async (args) => {
			await stopLaunchAgent({
				stdout: args.stdout,
				env: args.env
			});
		},
		restart: async (args) => {
			await restartLaunchAgent({
				stdout: args.stdout,
				env: args.env
			});
		},
		isLoaded: async (args) => isLaunchAgentLoaded(args),
		readCommand: readLaunchAgentProgramArguments,
		readRuntime: readLaunchAgentRuntime
	};
	if (process.platform === "linux") return {
		label: "systemd",
		loadedText: "enabled",
		notLoadedText: "disabled",
		install: async (args) => {
			await installSystemdService(args);
		},
		uninstall: async (args) => {
			await uninstallSystemdService(args);
		},
		stop: async (args) => {
			await stopSystemdService({
				stdout: args.stdout,
				env: args.env
			});
		},
		restart: async (args) => {
			await restartSystemdService({
				stdout: args.stdout,
				env: args.env
			});
		},
		isLoaded: async (args) => isSystemdServiceEnabled(args),
		readCommand: readSystemdServiceExecStart,
		readRuntime: async (env) => await readSystemdServiceRuntime(env)
	};
	if (process.platform === "win32") return {
		label: "Scheduled Task",
		loadedText: "registered",
		notLoadedText: "missing",
		install: async (args) => {
			await installScheduledTask(args);
		},
		uninstall: async (args) => {
			await uninstallScheduledTask(args);
		},
		stop: async (args) => {
			await stopScheduledTask({
				stdout: args.stdout,
				env: args.env
			});
		},
		restart: async (args) => {
			await restartScheduledTask({
				stdout: args.stdout,
				env: args.env
			});
		},
		isLoaded: async (args) => isScheduledTaskInstalled(args),
		readCommand: readScheduledTaskCommand,
		readRuntime: async (env) => await readScheduledTaskRuntime(env)
	};
	throw new Error(`Gateway service install not supported on ${process.platform}`);
}

//#endregion
export { repairLaunchAgentBootstrap as a, launchAgentPlistExists as i, isLaunchAgentListed as n, resolveGatewayLogPaths as o, isLaunchAgentLoaded as r, resolveLaunchAgentPlistPath as s, resolveGatewayService as t };