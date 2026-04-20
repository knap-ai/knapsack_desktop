import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as markOpenClawExecEnv } from "./openclaw-exec-env-5MQ0wyS5.js";
import { a as shouldLogVerbose, t as danger } from "./globals-De6QTwLG.js";
import { n as logError, t as logDebug } from "./logger-BA_TvTc6.js";
import process$1 from "node:process";
import fs from "node:fs";
import path from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
//#region src/process/spawn-utils.ts
const DEFAULT_RETRY_CODES = ["EBADF"];
function resolveCommandStdio(params) {
	return [
		params.hasInput ? "pipe" : params.preferInherit ? "inherit" : "pipe",
		"pipe",
		"pipe"
	];
}
function shouldRetry(err, codes) {
	const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
	return code.length > 0 && codes.includes(code);
}
async function spawnAndWaitForSpawn(spawnImpl, argv, options) {
	const child = spawnImpl(argv[0], argv.slice(1), options);
	return await new Promise((resolve, reject) => {
		let settled = false;
		const cleanup = () => {
			child.removeListener("error", onError);
			child.removeListener("spawn", onSpawn);
		};
		const finishResolve = () => {
			if (settled) return;
			settled = true;
			cleanup();
			resolve(child);
		};
		const onError = (err) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(err);
		};
		const onSpawn = () => {
			finishResolve();
		};
		child.once("error", onError);
		child.once("spawn", onSpawn);
		process.nextTick(() => {
			if (typeof child.pid === "number") finishResolve();
		});
	});
}
async function spawnWithFallback(params) {
	const spawnImpl = params.spawnImpl ?? spawn;
	const retryCodes = params.retryCodes ?? DEFAULT_RETRY_CODES;
	const baseOptions = { ...params.options };
	const fallbacks = params.fallbacks ?? [];
	const attempts = [{ options: baseOptions }, ...fallbacks.map((fallback) => ({
		label: fallback.label,
		options: {
			...baseOptions,
			...fallback.options
		}
	}))];
	let lastError;
	for (let index = 0; index < attempts.length; index += 1) {
		const attempt = attempts[index];
		try {
			return {
				child: await spawnAndWaitForSpawn(spawnImpl, params.argv, attempt.options),
				usedFallback: index > 0,
				fallbackLabel: attempt.label
			};
		} catch (err) {
			lastError = err;
			const nextFallback = fallbacks[index];
			if (!nextFallback || !shouldRetry(err, retryCodes)) throw err;
			params.onFallback?.(err, nextFallback);
		}
	}
	throw lastError;
}
//#endregion
//#region src/process/windows-command.ts
function resolveWindowsCommandShim(params) {
	if ((params.platform ?? process$1.platform) !== "win32") return params.command;
	const basename = normalizeLowercaseStringOrEmpty(path.basename(params.command));
	if (path.extname(basename)) return params.command;
	if (params.cmdCommands.includes(basename)) return `${params.command}.cmd`;
	return params.command;
}
//#endregion
//#region src/process/exec.ts
const execFileAsync = promisify(execFile);
const WINDOWS_UNSAFE_CMD_CHARS_RE = /[&|<>^%\r\n]/;
function isWindowsBatchCommand(resolvedCommand) {
	if (process$1.platform !== "win32") return false;
	const ext = normalizeLowercaseStringOrEmpty(path.extname(resolvedCommand));
	return ext === ".cmd" || ext === ".bat";
}
function escapeForCmdExe(arg) {
	if (WINDOWS_UNSAFE_CMD_CHARS_RE.test(arg)) throw new Error(`Unsafe Windows cmd.exe argument detected: ${JSON.stringify(arg)}. Pass an explicit shell-wrapper argv at the call site instead.`);
	if (!arg.includes(" ") && !arg.includes("\"")) return arg;
	return `"${arg.replace(/"/g, "\"\"")}"`;
}
function buildCmdExeCommandLine(resolvedCommand, args) {
	return [escapeForCmdExe(resolvedCommand), ...args.map(escapeForCmdExe)].join(" ");
}
/**
* On Windows, Node 18.20.2+ (CVE-2024-27980) rejects spawning .cmd/.bat directly
* without shell, causing EINVAL. Resolve npm/npx to node + cli script so we
* spawn node.exe instead of npm.cmd.
*/
function resolveNpmArgvForWindows(argv) {
	if (process$1.platform !== "win32" || argv.length === 0) return null;
	const basename = normalizeLowercaseStringOrEmpty(path.basename(argv[0])).replace(/\.(cmd|exe|bat)$/, "");
	const cliName = basename === "npx" ? "npx-cli.js" : basename === "npm" ? "npm-cli.js" : null;
	if (!cliName) return null;
	const nodeDir = path.dirname(process$1.execPath);
	const cliPath = path.join(nodeDir, "node_modules", "npm", "bin", cliName);
	if (!fs.existsSync(cliPath)) {
		const command = argv[0] ?? "";
		return [normalizeLowercaseStringOrEmpty(path.extname(command)) ? command : `${command}.cmd`, ...argv.slice(1)];
	}
	return [
		process$1.execPath,
		cliPath,
		...argv.slice(1)
	];
}
/**
* Resolves a command for Windows compatibility.
* On Windows, non-.exe commands (like pnpm, yarn) are resolved to .cmd; npm/npx
* are handled by resolveNpmArgvForWindows to avoid spawn EINVAL (no direct .cmd).
*/
function resolveCommand(command) {
	return resolveWindowsCommandShim({
		command,
		cmdCommands: [
			"corepack",
			"pnpm",
			"yarn"
		]
	});
}
function resolveChildProcessInvocation(params) {
	const finalArgv = process$1.platform === "win32" ? resolveNpmArgvForWindows(params.argv) ?? params.argv : params.argv;
	const resolvedCommand = finalArgv !== params.argv ? finalArgv[0] ?? "" : resolveCommand(params.argv[0] ?? "");
	const useCmdWrapper = isWindowsBatchCommand(resolvedCommand);
	return {
		command: useCmdWrapper ? process$1.env.ComSpec ?? "cmd.exe" : resolvedCommand,
		args: useCmdWrapper ? [
			"/d",
			"/s",
			"/c",
			buildCmdExeCommandLine(resolvedCommand, finalArgv.slice(1))
		] : finalArgv.slice(1),
		usesWindowsExitCodeShim: process$1.platform === "win32" && (useCmdWrapper || finalArgv !== params.argv),
		windowsHide: true,
		windowsVerbatimArguments: useCmdWrapper ? true : params.windowsVerbatimArguments
	};
}
function shouldSpawnWithShell(params) {
	return false;
}
async function runExec(command, args, opts = 1e4) {
	const options = typeof opts === "number" ? {
		timeout: opts,
		encoding: "utf8"
	} : {
		timeout: opts.timeoutMs,
		maxBuffer: opts.maxBuffer,
		cwd: opts.cwd,
		encoding: "utf8"
	};
	try {
		const invocation = resolveChildProcessInvocation({ argv: [command, ...args] });
		const { stdout, stderr } = await execFileAsync(invocation.command, invocation.args, {
			...options,
			windowsHide: invocation.windowsHide,
			windowsVerbatimArguments: invocation.windowsVerbatimArguments
		});
		if (shouldLogVerbose()) {
			if (stdout.trim()) logDebug(stdout.trim());
			if (stderr.trim()) logError(stderr.trim());
		}
		return {
			stdout,
			stderr
		};
	} catch (err) {
		if (shouldLogVerbose()) logError(danger(`Command failed: ${command} ${args.join(" ")}`));
		throw err;
	}
}
const WINDOWS_CLOSE_STATE_SETTLE_TIMEOUT_MS = 250;
const WINDOWS_CLOSE_STATE_POLL_MS = 10;
function resolveProcessExitCode(params) {
	return params.explicitCode ?? params.childExitCode ?? (params.usesWindowsExitCodeShim && params.resolvedSignal == null && !params.timedOut && !params.noOutputTimedOut && !params.killIssuedByTimeout ? 0 : null);
}
function resolveCommandEnv(params) {
	const baseEnv = params.baseEnv ?? process$1.env;
	const argv = params.argv;
	const shouldSuppressNpmFund = (() => {
		const cmd = path.basename(argv[0] ?? "");
		if (cmd === "npm" || cmd === "npm.cmd" || cmd === "npm.exe") return true;
		if (cmd === "node" || cmd === "node.exe") return (argv[1] ?? "").includes("npm-cli.js");
		return false;
	})();
	const mergedEnv = params.env ? {
		...baseEnv,
		...params.env
	} : { ...baseEnv };
	const resolvedEnv = Object.fromEntries(Object.entries(mergedEnv).filter(([, value]) => value !== void 0).map(([key, value]) => [key, String(value)]));
	if (shouldSuppressNpmFund) {
		if (resolvedEnv.NPM_CONFIG_FUND == null) resolvedEnv.NPM_CONFIG_FUND = "false";
		if (resolvedEnv.npm_config_fund == null) resolvedEnv.npm_config_fund = "false";
	}
	return markOpenClawExecEnv(resolvedEnv);
}
async function runCommandWithTimeout(argv, optionsOrTimeout) {
	const options = typeof optionsOrTimeout === "number" ? { timeoutMs: optionsOrTimeout } : optionsOrTimeout;
	const { timeoutMs, cwd, input, env, noOutputTimeoutMs } = options;
	const hasInput = input !== void 0;
	const resolvedEnv = resolveCommandEnv({
		argv,
		env
	});
	const stdio = resolveCommandStdio({
		hasInput,
		preferInherit: true
	});
	const invocation = resolveChildProcessInvocation({
		argv,
		windowsVerbatimArguments: options.windowsVerbatimArguments
	});
	const child = spawn(invocation.command, invocation.args, {
		stdio,
		cwd,
		env: resolvedEnv,
		windowsHide: invocation.windowsHide,
		windowsVerbatimArguments: invocation.windowsVerbatimArguments,
		...shouldSpawnWithShell({
			resolvedCommand: invocation.command,
			platform: process$1.platform
		}) ? { shell: true } : {}
	});
	return await new Promise((resolve, reject) => {
		let stdout = "";
		let stderr = "";
		let settled = false;
		let timedOut = false;
		let noOutputTimedOut = false;
		let killIssuedByTimeout = false;
		let childExitState = null;
		let closeFallbackTimer = null;
		let noOutputTimer = null;
		const shouldTrackOutputTimeout = typeof noOutputTimeoutMs === "number" && Number.isFinite(noOutputTimeoutMs) && noOutputTimeoutMs > 0;
		const clearNoOutputTimer = () => {
			if (!noOutputTimer) return;
			clearTimeout(noOutputTimer);
			noOutputTimer = null;
		};
		const clearCloseFallbackTimer = () => {
			if (!closeFallbackTimer) return;
			clearTimeout(closeFallbackTimer);
			closeFallbackTimer = null;
		};
		const killChild = () => {
			if (settled || typeof child?.kill !== "function") return;
			killIssuedByTimeout = true;
			child.kill("SIGKILL");
		};
		const armNoOutputTimer = () => {
			if (!shouldTrackOutputTimeout || settled) return;
			clearNoOutputTimer();
			noOutputTimer = setTimeout(() => {
				if (settled) return;
				noOutputTimedOut = true;
				killChild();
			}, Math.floor(noOutputTimeoutMs));
		};
		const timer = setTimeout(() => {
			timedOut = true;
			killChild();
		}, timeoutMs);
		armNoOutputTimer();
		if (hasInput && child.stdin) {
			child.stdin.write(input ?? "");
			child.stdin.end();
		}
		child.stdout?.on("data", (d) => {
			stdout += d.toString();
			armNoOutputTimer();
		});
		child.stderr?.on("data", (d) => {
			stderr += d.toString();
			armNoOutputTimer();
		});
		child.on("error", (err) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			clearNoOutputTimer();
			clearCloseFallbackTimer();
			reject(err);
		});
		child.on("exit", (code, signal) => {
			childExitState = {
				code,
				signal
			};
			if (settled || closeFallbackTimer) return;
			closeFallbackTimer = setTimeout(() => {
				if (settled) return;
				child.stdout?.destroy();
				child.stderr?.destroy();
			}, 250);
		});
		const resolveFromClose = (code, signal) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			clearNoOutputTimer();
			clearCloseFallbackTimer();
			const resolvedSignal = childExitState?.signal ?? signal ?? child.signalCode ?? null;
			const resolvedCode = resolveProcessExitCode({
				explicitCode: childExitState?.code ?? code,
				childExitCode: child.exitCode,
				resolvedSignal,
				usesWindowsExitCodeShim: invocation.usesWindowsExitCodeShim,
				timedOut,
				noOutputTimedOut,
				killIssuedByTimeout
			});
			const termination = noOutputTimedOut ? "no-output-timeout" : timedOut ? "timeout" : resolvedSignal != null ? "signal" : "exit";
			const normalizedCode = termination === "timeout" || termination === "no-output-timeout" ? resolvedCode === 0 ? 124 : resolvedCode : resolvedCode;
			resolve({
				pid: child.pid ?? void 0,
				stdout,
				stderr,
				code: normalizedCode,
				signal: resolvedSignal,
				killed: child.killed,
				termination,
				noOutputTimedOut
			});
		};
		child.on("close", (code, signal) => {
			if (process$1.platform !== "win32" || childExitState != null || code != null || signal != null || child.exitCode != null || child.signalCode != null) {
				resolveFromClose(code, signal);
				return;
			}
			const startedAt = Date.now();
			const waitForExitState = () => {
				if (settled) return;
				if (childExitState != null || child.exitCode != null || child.signalCode != null) {
					resolveFromClose(code, signal);
					return;
				}
				if (Date.now() - startedAt >= WINDOWS_CLOSE_STATE_SETTLE_TIMEOUT_MS) {
					resolveFromClose(code, signal);
					return;
				}
				setTimeout(waitForExitState, WINDOWS_CLOSE_STATE_POLL_MS);
			};
			waitForExitState();
		});
	});
}
//#endregion
export { shouldSpawnWithShell as a, runExec as i, resolveProcessExitCode as n, resolveWindowsCommandShim as o, runCommandWithTimeout as r, spawnWithFallback as s, resolveCommandEnv as t };
