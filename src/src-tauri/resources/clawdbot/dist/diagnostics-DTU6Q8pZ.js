import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { c as resolveGatewayLogPaths } from "./launchd-C_0pZ8OL.js";
import fs from "node:fs/promises";
//#region src/daemon/diagnostics.ts
var diagnostics_exports = /* @__PURE__ */ __exportAll({ readLastGatewayErrorLine: () => readLastGatewayErrorLine });
const GATEWAY_LOG_ERROR_PATTERNS = [
	/refusing to bind gateway/i,
	/gateway auth mode/i,
	/gateway start blocked/i,
	/failed to bind gateway socket/i,
	/tailscale .* requires/i
];
async function readLastLogLine(filePath) {
	try {
		const lines = (await fs.readFile(filePath, "utf8")).split(/\r?\n/).map((line) => line.trim());
		for (let i = lines.length - 1; i >= 0; i -= 1) if (lines[i]) return lines[i];
		return null;
	} catch {
		return null;
	}
}
async function readLastGatewayErrorLine(env) {
	const { stdoutPath, stderrPath } = resolveGatewayLogPaths(env);
	const stderrRaw = await fs.readFile(stderrPath, "utf8").catch(() => "");
	const stdoutRaw = await fs.readFile(stdoutPath, "utf8").catch(() => "");
	const lines = [...stderrRaw.split(/\r?\n/), ...stdoutRaw.split(/\r?\n/)].map((line) => line.trim());
	for (let i = lines.length - 1; i >= 0; i -= 1) {
		const line = lines[i];
		if (!line) continue;
		if (GATEWAY_LOG_ERROR_PATTERNS.some((pattern) => pattern.test(line))) return line;
	}
	return await readLastLogLine(stderrPath) ?? await readLastLogLine(stdoutPath);
}
//#endregion
export { readLastGatewayErrorLine as n, diagnostics_exports as t };
