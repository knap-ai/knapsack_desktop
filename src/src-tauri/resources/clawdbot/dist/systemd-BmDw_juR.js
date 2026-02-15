import { A as colorize, M as theme, j as isRich } from "./entry.js";
import { n as runExec, t as runCommandWithTimeout } from "./exec-B52LZOrO.js";
import { d as resolveGatewaySystemdServiceName, s as formatGatewayServiceDescription, u as resolveGatewayProfileSuffix } from "./constants-BnUiPMIW.js";
import { execFile } from "node:child_process";
import path from "node:path";
import os from "node:os";
import { promisify } from "node:util";
import fs from "node:fs/promises";

//#region src/daemon/paths.ts
const windowsAbsolutePath = /^[a-zA-Z]:[\\/]/;
const windowsUncPath = /^\\\\/;
function resolveHomeDir(env) {
	const home = env.HOME?.trim() || env.USERPROFILE?.trim();
	if (!home) throw new Error("Missing HOME");
	return home;
}
function resolveUserPathWithHome(input, home) {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	if (trimmed.startsWith("~")) {
		if (!home) throw new Error("Missing HOME");
		const expanded = trimmed.replace(/^~(?=$|[\\/])/, home);
		return path.resolve(expanded);
	}
	if (windowsAbsolutePath.test(trimmed) || windowsUncPath.test(trimmed)) return trimmed;
	return path.resolve(trimmed);
}
function resolveGatewayStateDir(env) {
	const override = env.OPENCLAW_STATE_DIR?.trim();
	if (override) return resolveUserPathWithHome(override, override.startsWith("~") ? resolveHomeDir(env) : void 0);
	const home = resolveHomeDir(env);
	const suffix = resolveGatewayProfileSuffix(env.OPENCLAW_PROFILE);
	return path.join(home, `.openclaw${suffix}`);
}

//#endregion
//#region src/daemon/runtime-parse.ts
function parseKeyValueOutput(output, separator) {
	const entries = {};
	for (const rawLine of output.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line) continue;
		const idx = line.indexOf(separator);
		if (idx <= 0) continue;
		const key = line.slice(0, idx).trim().toLowerCase();
		if (!key) continue;
		entries[key] = line.slice(idx + separator.length).trim();
	}
	return entries;
}

//#endregion
//#region src/daemon/systemd-linger.ts
function resolveLoginctlUser(env) {
	const fromEnv = env.USER?.trim() || env.LOGNAME?.trim();
	if (fromEnv) return fromEnv;
	try {
		return os.userInfo().username;
	} catch {
		return null;
	}
}
async function readSystemdUserLingerStatus(env) {
	const user = resolveLoginctlUser(env);
	if (!user) return null;
	try {
		const { stdout } = await runExec("loginctl", [
			"show-user",
			user,
			"-p",
			"Linger"
		], { timeoutMs: 5e3 });
		const value = stdout.split("\n").map((entry) => entry.trim()).find((entry) => entry.startsWith("Linger="))?.split("=")[1]?.trim().toLowerCase();
		if (value === "yes" || value === "no") return {
			user,
			linger: value
		};
	} catch {}
	return null;
}
async function enableSystemdUserLinger(params) {
	const user = params.user ?? resolveLoginctlUser(params.env);
	if (!user) return {
		ok: false,
		stdout: "",
		stderr: "Missing user",
		code: 1
	};
	const argv = [
		...(typeof process.getuid === "function" ? process.getuid() !== 0 : true) && params.sudoMode !== void 0 ? ["sudo", ...params.sudoMode === "non-interactive" ? ["-n"] : []] : [],
		"loginctl",
		"enable-linger",
		user
	];
	try {
		const result = await runCommandWithTimeout(argv, { timeoutMs: 3e4 });
		return {
			ok: result.code === 0,
			stdout: result.stdout,
			stderr: result.stderr,
			code: result.code ?? 1
		};
	} catch (error) {
		return {
			ok: false,
			stdout: "",
			stderr: error instanceof Error ? error.message : String(error),
			code: 1
		};
	}
}

//#endregion
//#region src/daemon/systemd-unit.ts
function systemdEscapeArg(value) {
	if (!/[\\s"\\\\]/.test(value)) return value;
	return `"${value.replace(/\\\\/g, "\\\\\\\\").replace(/"/g, "\\\\\"")}"`;
}
function renderEnvLines(env) {
	if (!env) return [];
	const entries = Object.entries(env).filter(([, value]) => typeof value === "string" && value.trim());
	if (entries.length === 0) return [];
	return entries.map(([key, value]) => `Environment=${systemdEscapeArg(`${key}=${value?.trim() ?? ""}`)}`);
}
function buildSystemdUnit({ description, programArguments, workingDirectory, environment }) {
	const execStart = programArguments.map(systemdEscapeArg).join(" ");
	const descriptionLine = `Description=${description?.trim() || "OpenClaw Gateway"}`;
	const workingDirLine = workingDirectory ? `WorkingDirectory=${systemdEscapeArg(workingDirectory)}` : null;
	const envLines = renderEnvLines(environment);
	return [
		"[Unit]",
		descriptionLine,
		"After=network-online.target",
		"Wants=network-online.target",
		"",
		"[Service]",
		`ExecStart=${execStart}`,
		"Restart=always",
		"RestartSec=5",
		"KillMode=process",
		workingDirLine,
		...envLines,
		"",
		"[Install]",
		"WantedBy=default.target",
		""
	].filter((line) => line !== null).join("\n");
}
function parseSystemdExecStart(value) {
	const args = [];
	let current = "";
	let inQuotes = false;
	let escapeNext = false;
	for (const char of value) {
		if (escapeNext) {
			current += char;
			escapeNext = false;
			continue;
		}
		if (char === "\\\\") {
			escapeNext = true;
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
function parseSystemdEnvAssignment(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const unquoted = (() => {
		if (!(trimmed.startsWith("\"") && trimmed.endsWith("\""))) return trimmed;
		let out = "";
		let escapeNext = false;
		for (const ch of trimmed.slice(1, -1)) {
			if (escapeNext) {
				out += ch;
				escapeNext = false;
				continue;
			}
			if (ch === "\\\\") {
				escapeNext = true;
				continue;
			}
			out += ch;
		}
		return out;
	})();
	const eq = unquoted.indexOf("=");
	if (eq <= 0) return null;
	const key = unquoted.slice(0, eq).trim();
	if (!key) return null;
	return {
		key,
		value: unquoted.slice(eq + 1)
	};
}

//#endregion
//#region src/daemon/systemd.ts
const execFileAsync = promisify(execFile);
const toPosixPath = (value) => value.replace(/\\/g, "/");
const formatLine = (label, value) => {
	const rich = isRich();
	return `${colorize(rich, theme.muted, `${label}:`)} ${colorize(rich, theme.command, value)}`;
};
function resolveSystemdUnitPathForName(env, name) {
	const home = toPosixPath(resolveHomeDir(env));
	return path.posix.join(home, ".config", "systemd", "user", `${name}.service`);
}
function resolveSystemdServiceName(env) {
	const override = env.OPENCLAW_SYSTEMD_UNIT?.trim();
	if (override) return override.endsWith(".service") ? override.slice(0, -8) : override;
	return resolveGatewaySystemdServiceName(env.OPENCLAW_PROFILE);
}
function resolveSystemdUnitPath(env) {
	return resolveSystemdUnitPathForName(env, resolveSystemdServiceName(env));
}
function resolveSystemdUserUnitPath(env) {
	return resolveSystemdUnitPath(env);
}
async function readSystemdServiceExecStart(env) {
	const unitPath = resolveSystemdUnitPath(env);
	try {
		const content = await fs.readFile(unitPath, "utf8");
		let execStart = "";
		let workingDirectory = "";
		const environment = {};
		for (const rawLine of content.split("\n")) {
			const line = rawLine.trim();
			if (!line || line.startsWith("#")) continue;
			if (line.startsWith("ExecStart=")) execStart = line.slice(10).trim();
			else if (line.startsWith("WorkingDirectory=")) workingDirectory = line.slice(17).trim();
			else if (line.startsWith("Environment=")) {
				const parsed = parseSystemdEnvAssignment(line.slice(12).trim());
				if (parsed) environment[parsed.key] = parsed.value;
			}
		}
		if (!execStart) return null;
		return {
			programArguments: parseSystemdExecStart(execStart),
			...workingDirectory ? { workingDirectory } : {},
			...Object.keys(environment).length > 0 ? { environment } : {},
			sourcePath: unitPath
		};
	} catch {
		return null;
	}
}
function parseSystemdShow(output) {
	const entries = parseKeyValueOutput(output, "=");
	const info = {};
	const activeState = entries.activestate;
	if (activeState) info.activeState = activeState;
	const subState = entries.substate;
	if (subState) info.subState = subState;
	const mainPidValue = entries.mainpid;
	if (mainPidValue) {
		const pid = Number.parseInt(mainPidValue, 10);
		if (Number.isFinite(pid) && pid > 0) info.mainPid = pid;
	}
	const execMainStatusValue = entries.execmainstatus;
	if (execMainStatusValue) {
		const status = Number.parseInt(execMainStatusValue, 10);
		if (Number.isFinite(status)) info.execMainStatus = status;
	}
	const execMainCode = entries.execmaincode;
	if (execMainCode) info.execMainCode = execMainCode;
	return info;
}
async function execSystemctl(args) {
	try {
		const { stdout, stderr } = await execFileAsync("systemctl", args, { encoding: "utf8" });
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
async function isSystemdUserServiceAvailable() {
	const res = await execSystemctl(["--user", "status"]);
	if (res.code === 0) return true;
	const detail = `${res.stderr} ${res.stdout}`.toLowerCase();
	if (!detail) return false;
	if (detail.includes("not found")) return false;
	if (detail.includes("failed to connect")) return false;
	if (detail.includes("not been booted")) return false;
	if (detail.includes("no such file or directory")) return false;
	if (detail.includes("not supported")) return false;
	return false;
}
async function assertSystemdAvailable() {
	const res = await execSystemctl(["--user", "status"]);
	if (res.code === 0) return;
	const detail = res.stderr || res.stdout;
	if (detail.toLowerCase().includes("not found")) throw new Error("systemctl not available; systemd user services are required on Linux.");
	throw new Error(`systemctl --user unavailable: ${detail || "unknown error"}`.trim());
}
async function installSystemdService({ env, stdout, programArguments, workingDirectory, environment, description }) {
	await assertSystemdAvailable();
	const unitPath = resolveSystemdUnitPath(env);
	await fs.mkdir(path.dirname(unitPath), { recursive: true });
	const unit = buildSystemdUnit({
		description: description ?? formatGatewayServiceDescription({
			profile: env.OPENCLAW_PROFILE,
			version: environment?.OPENCLAW_SERVICE_VERSION ?? env.OPENCLAW_SERVICE_VERSION
		}),
		programArguments,
		workingDirectory,
		environment
	});
	await fs.writeFile(unitPath, unit, "utf8");
	const unitName = `${resolveGatewaySystemdServiceName(env.OPENCLAW_PROFILE)}.service`;
	const reload = await execSystemctl(["--user", "daemon-reload"]);
	if (reload.code !== 0) throw new Error(`systemctl daemon-reload failed: ${reload.stderr || reload.stdout}`.trim());
	const enable = await execSystemctl([
		"--user",
		"enable",
		unitName
	]);
	if (enable.code !== 0) throw new Error(`systemctl enable failed: ${enable.stderr || enable.stdout}`.trim());
	const restart = await execSystemctl([
		"--user",
		"restart",
		unitName
	]);
	if (restart.code !== 0) throw new Error(`systemctl restart failed: ${restart.stderr || restart.stdout}`.trim());
	stdout.write("\n");
	stdout.write(`${formatLine("Installed systemd service", unitPath)}\n`);
	return { unitPath };
}
async function uninstallSystemdService({ env, stdout }) {
	await assertSystemdAvailable();
	await execSystemctl([
		"--user",
		"disable",
		"--now",
		`${resolveGatewaySystemdServiceName(env.OPENCLAW_PROFILE)}.service`
	]);
	const unitPath = resolveSystemdUnitPath(env);
	try {
		await fs.unlink(unitPath);
		stdout.write(`${formatLine("Removed systemd service", unitPath)}\n`);
	} catch {
		stdout.write(`Systemd service not found at ${unitPath}\n`);
	}
}
async function stopSystemdService({ stdout, env }) {
	await assertSystemdAvailable();
	const unitName = `${resolveSystemdServiceName(env ?? {})}.service`;
	const res = await execSystemctl([
		"--user",
		"stop",
		unitName
	]);
	if (res.code !== 0) throw new Error(`systemctl stop failed: ${res.stderr || res.stdout}`.trim());
	stdout.write(`${formatLine("Stopped systemd service", unitName)}\n`);
}
async function restartSystemdService({ stdout, env }) {
	await assertSystemdAvailable();
	const unitName = `${resolveSystemdServiceName(env ?? {})}.service`;
	const res = await execSystemctl([
		"--user",
		"restart",
		unitName
	]);
	if (res.code !== 0) throw new Error(`systemctl restart failed: ${res.stderr || res.stdout}`.trim());
	stdout.write(`${formatLine("Restarted systemd service", unitName)}\n`);
}
async function isSystemdServiceEnabled(args) {
	await assertSystemdAvailable();
	return (await execSystemctl([
		"--user",
		"is-enabled",
		`${resolveSystemdServiceName(args.env ?? {})}.service`
	])).code === 0;
}
async function readSystemdServiceRuntime(env = process.env) {
	try {
		await assertSystemdAvailable();
	} catch (err) {
		return {
			status: "unknown",
			detail: String(err)
		};
	}
	const res = await execSystemctl([
		"--user",
		"show",
		`${resolveSystemdServiceName(env)}.service`,
		"--no-page",
		"--property",
		"ActiveState,SubState,MainPID,ExecMainStatus,ExecMainCode"
	]);
	if (res.code !== 0) {
		const detail = (res.stderr || res.stdout).trim();
		const missing = detail.toLowerCase().includes("not found");
		return {
			status: missing ? "stopped" : "unknown",
			detail: detail || void 0,
			missingUnit: missing
		};
	}
	const parsed = parseSystemdShow(res.stdout || "");
	const activeState = parsed.activeState?.toLowerCase();
	return {
		status: activeState === "active" ? "running" : activeState ? "stopped" : "unknown",
		state: parsed.activeState,
		subState: parsed.subState,
		pid: parsed.mainPid,
		lastExitStatus: parsed.execMainStatus,
		lastExitReason: parsed.execMainCode
	};
}

//#endregion
export { readSystemdServiceRuntime as a, stopSystemdService as c, readSystemdUserLingerStatus as d, parseKeyValueOutput as f, readSystemdServiceExecStart as i, uninstallSystemdService as l, resolveHomeDir as m, isSystemdServiceEnabled as n, resolveSystemdUserUnitPath as o, resolveGatewayStateDir as p, isSystemdUserServiceAvailable as r, restartSystemdService as s, installSystemdService as t, enableSystemdUserLinger as u };