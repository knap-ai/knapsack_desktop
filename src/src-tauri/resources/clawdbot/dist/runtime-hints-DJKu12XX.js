import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { i as resolveGatewayRestartLogPath, r as resolveGatewayLogPaths } from "./restart-logs-BdpufG4l.js";
import { r as toPosixPath } from "./runtime-parse-BOFS7-ji.js";
import { t as formatRuntimeStatusWithDetails } from "./runtime-status-BH4H_ah8.js";
//#region src/daemon/container-context.ts
function resolveDaemonContainerContext(env = process.env) {
	return normalizeOptionalString(env.OPENCLAW_CONTAINER_HINT) || normalizeOptionalString(env.OPENCLAW_CONTAINER) || null;
}
//#endregion
//#region src/daemon/runtime-format.ts
function formatRuntimeStatus(runtime) {
	if (!runtime) return null;
	const details = [];
	if (runtime.subState) details.push(`sub ${runtime.subState}`);
	if (runtime.lastExitStatus !== void 0) details.push(`last exit ${runtime.lastExitStatus}`);
	if (runtime.lastExitReason) details.push(`reason ${runtime.lastExitReason}`);
	if (runtime.lastRunResult) details.push(`last run ${runtime.lastRunResult}`);
	if (runtime.lastRunTime) details.push(`last run time ${runtime.lastRunTime}`);
	if (runtime.detail) details.push(runtime.detail);
	return formatRuntimeStatusWithDetails({
		status: runtime.status,
		pid: runtime.pid,
		state: runtime.state,
		details
	});
}
//#endregion
//#region src/daemon/runtime-hints.ts
function toDarwinDisplayPath(value) {
	return toPosixPath(value).replace(/^[A-Za-z]:/, "");
}
function buildPlatformRuntimeLogHints(params) {
	const platform = params.platform ?? process.platform;
	const env = {
		...process.env,
		...params.env
	};
	if (platform === "darwin") {
		const logs = resolveGatewayLogPaths(env);
		return [
			`Launchd stdout (if installed): ${toDarwinDisplayPath(logs.stdoutPath)}`,
			`Launchd stderr (if installed): ${toDarwinDisplayPath(logs.stderrPath)}`,
			`Restart attempts: ${toDarwinDisplayPath(resolveGatewayRestartLogPath(env))}`
		];
	}
	if (platform === "linux") return [`Logs: journalctl --user -u ${params.systemdServiceName}.service -n 200 --no-pager`, `Restart attempts: ${resolveGatewayRestartLogPath(env)}`];
	if (platform === "win32") return [`Logs: schtasks /Query /TN "${params.windowsTaskName}" /V /FO LIST`, `Restart attempts: ${resolveGatewayRestartLogPath(env)}`];
	return [];
}
function buildPlatformServiceStartHints(params) {
	const platform = params.platform ?? process.platform;
	const base = [params.installCommand, params.startCommand];
	switch (platform) {
		case "darwin": return [...base, `launchctl bootstrap gui/$UID ${params.launchAgentPlistPath}`];
		case "linux": return [...base, `systemctl --user start ${params.systemdServiceName}.service`];
		case "win32": return [...base, `schtasks /Run /TN "${params.windowsTaskName}"`];
		default: return base;
	}
}
//#endregion
export { resolveDaemonContainerContext as i, buildPlatformServiceStartHints as n, formatRuntimeStatus as r, buildPlatformRuntimeLogHints as t };
