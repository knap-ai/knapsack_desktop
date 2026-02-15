import { F as shouldLogVerbose, H as getLogger, L as warn, N as logVerboseConsole, O as danger, k as info, t as createSubsystemLogger, u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import path from "node:path";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

//#region src/logger.ts
const subsystemPrefixRe = /^([a-z][a-z0-9-]{1,20}):\s+(.*)$/i;
function splitSubsystem(message) {
	const match = message.match(subsystemPrefixRe);
	if (!match) return null;
	const [, subsystem, rest] = match;
	return {
		subsystem,
		rest
	};
}
function logInfo(message, runtime = defaultRuntime) {
	const parsed = runtime === defaultRuntime ? splitSubsystem(message) : null;
	if (parsed) {
		createSubsystemLogger(parsed.subsystem).info(parsed.rest);
		return;
	}
	runtime.log(info(message));
	getLogger().info(message);
}
function logWarn(message, runtime = defaultRuntime) {
	const parsed = runtime === defaultRuntime ? splitSubsystem(message) : null;
	if (parsed) {
		createSubsystemLogger(parsed.subsystem).warn(parsed.rest);
		return;
	}
	runtime.log(warn(message));
	getLogger().warn(message);
}
function logError(message, runtime = defaultRuntime) {
	const parsed = runtime === defaultRuntime ? splitSubsystem(message) : null;
	if (parsed) {
		createSubsystemLogger(parsed.subsystem).error(parsed.rest);
		return;
	}
	runtime.error(danger(message));
	getLogger().error(message);
}
function logDebug(message) {
	getLogger().debug(message);
	logVerboseConsole(message);
}

//#endregion
//#region src/process/spawn-utils.ts
const DEFAULT_RETRY_CODES = ["EBADF"];
function resolveCommandStdio(params) {
	return [
		params.hasInput ? "pipe" : params.preferInherit ? "inherit" : "pipe",
		"pipe",
		"pipe"
	];
}
function formatSpawnError(err) {
	if (!(err instanceof Error)) return String(err);
	const details = err;
	const parts = [];
	const message = err.message?.trim();
	if (message) parts.push(message);
	if (details.code && !message?.includes(details.code)) parts.push(details.code);
	if (details.syscall) parts.push(`syscall=${details.syscall}`);
	if (typeof details.errno === "number") parts.push(`errno=${details.errno}`);
	return parts.join(" ");
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
//#region src/process/exec.ts
const execFileAsync = promisify(execFile);
/**
* Resolves a command for Windows compatibility.
* On Windows, non-.exe commands (like npm, pnpm) require their .cmd extension.
*/
function resolveCommand(command) {
	if (process.platform !== "win32") return command;
	const basename = path.basename(command).toLowerCase();
	if (path.extname(basename)) return command;
	if ([
		"npm",
		"pnpm",
		"yarn",
		"npx"
	].includes(basename)) return `${command}.cmd`;
	return command;
}
async function runExec(command, args, opts = 1e4) {
	const options = typeof opts === "number" ? {
		timeout: opts,
		encoding: "utf8"
	} : {
		timeout: opts.timeoutMs,
		maxBuffer: opts.maxBuffer,
		encoding: "utf8"
	};
	try {
		const { stdout, stderr } = await execFileAsync(resolveCommand(command), args, options);
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
async function runCommandWithTimeout(argv, optionsOrTimeout) {
	const options = typeof optionsOrTimeout === "number" ? { timeoutMs: optionsOrTimeout } : optionsOrTimeout;
	const { timeoutMs, cwd, input, env } = options;
	const { windowsVerbatimArguments } = options;
	const hasInput = input !== void 0;
	const shouldSuppressNpmFund = (() => {
		const cmd = path.basename(argv[0] ?? "");
		if (cmd === "npm" || cmd === "npm.cmd" || cmd === "npm.exe") return true;
		if (cmd === "node" || cmd === "node.exe") return (argv[1] ?? "").includes("npm-cli.js");
		return false;
	})();
	const mergedEnv = env ? {
		...process.env,
		...env
	} : { ...process.env };
	const resolvedEnv = Object.fromEntries(Object.entries(mergedEnv).filter(([, value]) => value !== void 0).map(([key, value]) => [key, String(value)]));
	if (shouldSuppressNpmFund) {
		if (resolvedEnv.NPM_CONFIG_FUND == null) resolvedEnv.NPM_CONFIG_FUND = "false";
		if (resolvedEnv.npm_config_fund == null) resolvedEnv.npm_config_fund = "false";
	}
	const stdio = resolveCommandStdio({
		hasInput,
		preferInherit: true
	});
	const resolvedCommand = resolveCommand(argv[0] ?? "");
	const commandExt = path.extname(resolvedCommand).toLowerCase();
	const useShell = process.platform === "win32" && commandExt !== ".exe";
	const child = spawn(resolvedCommand, argv.slice(1), {
		stdio,
		cwd,
		env: resolvedEnv,
		windowsVerbatimArguments,
		shell: useShell
	});
	return await new Promise((resolve, reject) => {
		let stdout = "";
		let stderr = "";
		let settled = false;
		const timer = setTimeout(() => {
			if (typeof child.kill === "function") child.kill("SIGKILL");
		}, timeoutMs);
		if (hasInput && child.stdin) {
			child.stdin.write(input ?? "");
			child.stdin.end();
		}
		child.stdout?.on("data", (d) => {
			stdout += d.toString();
		});
		child.stderr?.on("data", (d) => {
			stderr += d.toString();
		});
		child.on("error", (err) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			reject(err);
		});
		child.on("close", (code, signal) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve({
				stdout,
				stderr,
				code,
				signal,
				killed: child.killed
			});
		});
	});
}

//#endregion
export { logDebug as a, logWarn as c, spawnWithFallback as i, runExec as n, logError as o, formatSpawnError as r, logInfo as s, runCommandWithTimeout as t };