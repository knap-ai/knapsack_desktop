import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { createRequire } from "node:module";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
//#region extensions/matrix/src/matrix/deps.ts
var deps_exports = /* @__PURE__ */ __exportAll({
	ensureMatrixCryptoRuntime: () => ensureMatrixCryptoRuntime,
	ensureMatrixSdkInstalled: () => ensureMatrixSdkInstalled,
	isMatrixSdkAvailable: () => isMatrixSdkAvailable
});
const REQUIRED_MATRIX_PACKAGES = [
	"matrix-js-sdk",
	"@matrix-org/matrix-sdk-crypto-nodejs",
	"@matrix-org/matrix-sdk-crypto-wasm"
];
function resolveMissingMatrixPackages() {
	try {
		const req = createRequire(import.meta.url);
		return REQUIRED_MATRIX_PACKAGES.filter((pkg) => {
			try {
				req.resolve(pkg);
				return false;
			} catch {
				return true;
			}
		});
	} catch {
		return [...REQUIRED_MATRIX_PACKAGES];
	}
}
function isMatrixSdkAvailable() {
	return resolveMissingMatrixPackages().length === 0;
}
function resolvePluginRoot() {
	const currentDir = path.dirname(fileURLToPath(import.meta.url));
	return path.resolve(currentDir, "..", "..");
}
async function runFixedCommandWithTimeout(params) {
	return await new Promise((resolve) => {
		const [command, ...args] = params.argv;
		if (!command) {
			resolve({
				code: 1,
				stdout: "",
				stderr: "command is required"
			});
			return;
		}
		const proc = spawn(command, args, {
			cwd: params.cwd,
			env: {
				...process.env,
				...params.env
			},
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			]
		});
		let stdout = "";
		let stderr = "";
		let settled = false;
		let timer = null;
		const finalize = (result) => {
			if (settled) return;
			settled = true;
			if (timer) clearTimeout(timer);
			resolve(result);
		};
		proc.stdout?.on("data", (chunk) => {
			stdout += chunk.toString();
		});
		proc.stderr?.on("data", (chunk) => {
			stderr += chunk.toString();
		});
		timer = setTimeout(() => {
			proc.kill("SIGKILL");
			finalize({
				code: 124,
				stdout,
				stderr: stderr || `command timed out after ${params.timeoutMs}ms`
			});
		}, params.timeoutMs);
		proc.on("error", (err) => {
			finalize({
				code: 1,
				stdout,
				stderr: err.message
			});
		});
		proc.on("close", (code) => {
			finalize({
				code: code ?? 1,
				stdout,
				stderr
			});
		});
	});
}
function defaultRequireFn(id) {
	return createRequire(import.meta.url)(id);
}
function defaultResolveFn(id) {
	return createRequire(import.meta.url).resolve(id);
}
function isMissingMatrixCryptoRuntimeError(error) {
	const message = formatErrorMessage(error);
	return message.includes("@matrix-org/matrix-sdk-crypto-nodejs-") || message.includes("matrix-sdk-crypto-nodejs") || message.includes("download-lib.js");
}
async function ensureMatrixCryptoRuntime(params = {}) {
	const requireFn = params.requireFn ?? defaultRequireFn;
	try {
		requireFn("@matrix-org/matrix-sdk-crypto-nodejs");
		return;
	} catch (err) {
		if (!isMissingMatrixCryptoRuntimeError(err)) throw err;
	}
	const scriptPath = (params.resolveFn ?? defaultResolveFn)("@matrix-org/matrix-sdk-crypto-nodejs/download-lib.js");
	params.log?.("matrix: bootstrapping native crypto runtime");
	const result = await (params.runCommand ?? runFixedCommandWithTimeout)({
		argv: [params.nodeExecutable ?? process.execPath, scriptPath],
		cwd: path.dirname(scriptPath),
		timeoutMs: 3e5,
		env: { COREPACK_ENABLE_DOWNLOAD_PROMPT: "0" }
	});
	if (result.code !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || "Matrix crypto runtime bootstrap failed.");
	requireFn("@matrix-org/matrix-sdk-crypto-nodejs");
}
async function ensureMatrixSdkInstalled(params) {
	if (isMatrixSdkAvailable()) return;
	const confirm = params.confirm;
	if (confirm) {
		if (!await confirm("Matrix requires matrix-js-sdk, @matrix-org/matrix-sdk-crypto-nodejs, and @matrix-org/matrix-sdk-crypto-wasm. Install now?")) throw new Error("Matrix requires matrix-js-sdk, @matrix-org/matrix-sdk-crypto-nodejs, and @matrix-org/matrix-sdk-crypto-wasm (install dependencies first).");
	}
	const root = resolvePluginRoot();
	const command = fs.existsSync(path.join(root, "pnpm-lock.yaml")) ? ["pnpm", "install"] : [
		"npm",
		"install",
		"--omit=dev",
		"--silent"
	];
	params.runtime.log?.(`matrix: installing dependencies via ${command[0]} (${root})…`);
	const result = await runFixedCommandWithTimeout({
		argv: command,
		cwd: root,
		timeoutMs: 3e5,
		env: { COREPACK_ENABLE_DOWNLOAD_PROMPT: "0" }
	});
	if (result.code !== 0) throw new Error(result.stderr.trim() || result.stdout.trim() || "Matrix dependency install failed.");
	if (!isMatrixSdkAvailable()) {
		const missing = resolveMissingMatrixPackages();
		throw new Error(missing.length > 0 ? `Matrix dependency install completed but required packages are still missing: ${missing.join(", ")}` : "Matrix dependency install completed but Matrix dependencies are still missing.");
	}
}
//#endregion
export { isMatrixSdkAvailable as i, ensureMatrixCryptoRuntime as n, ensureMatrixSdkInstalled as r, deps_exports as t };
