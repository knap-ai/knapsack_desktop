import { t as resolveGatewayStateDir } from "./paths-Dxz5MWt4.js";
import { t as splitArgsPreservingQuotes } from "./arg-split-ShoVtQWt.js";
import path from "node:path";
//#region src/daemon/cmd-set.ts
function assertNoCmdLineBreak(value, field) {
	if (/[\r\n]/.test(value)) throw new Error(`${field} cannot contain CR or LF in Windows task scripts.`);
}
function escapeCmdSetAssignmentComponent(value) {
	return value.replace(/\^/g, "^^").replace(/%/g, "%%").replace(/!/g, "^!").replace(/"/g, "^\"");
}
function unescapeCmdSetAssignmentComponent(value) {
	let out = "";
	for (let i = 0; i < value.length; i += 1) {
		const ch = value[i];
		const next = value[i + 1];
		if (ch === "^" && (next === "^" || next === "\"" || next === "!")) {
			out += next;
			i += 1;
			continue;
		}
		if (ch === "%" && next === "%") {
			out += "%";
			i += 1;
			continue;
		}
		out += ch;
	}
	return out;
}
function parseCmdSetAssignment(line) {
	const raw = line.trim();
	if (!raw) return null;
	const quoted = raw.startsWith("\"") && raw.endsWith("\"") && raw.length >= 2;
	const assignment = quoted ? raw.slice(1, -1) : raw;
	const index = assignment.indexOf("=");
	if (index <= 0) return null;
	const key = assignment.slice(0, index).trim();
	const value = assignment.slice(index + 1).trim();
	if (!key) return null;
	if (!quoted) return {
		key,
		value
	};
	return {
		key: unescapeCmdSetAssignmentComponent(key),
		value: unescapeCmdSetAssignmentComponent(value)
	};
}
function renderCmdSetAssignment(key, value) {
	assertNoCmdLineBreak(key, "Environment variable name");
	assertNoCmdLineBreak(value, "Environment variable value");
	return `set "${escapeCmdSetAssignmentComponent(key)}=${escapeCmdSetAssignmentComponent(value)}"`;
}
//#endregion
//#region src/daemon/cmd-argv.ts
function quoteCmdScriptArg(value) {
	assertNoCmdLineBreak(value, "Command argument");
	if (!value) return "\"\"";
	const escaped = value.replace(/"/g, "\\\"").replace(/%/g, "%%").replace(/!/g, "^!");
	if (!/[ \t"&|<>^()%!]/g.test(value)) return escaped;
	return `"${escaped}"`;
}
function unescapeCmdScriptArg(value) {
	return value.replace(/\^!/g, "!").replace(/%%/g, "%");
}
function parseCmdScriptCommandLine(value) {
	return splitArgsPreservingQuotes(value, { escapeMode: "backslash-quote-only" }).map(unescapeCmdScriptArg);
}
//#endregion
//#region src/daemon/restart-logs.ts
const GATEWAY_RESTART_LOG_FILENAME = "gateway-restart.log";
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
function resolveGatewayRestartLogPath(env) {
	return path.join(resolveGatewayLogPaths(env).logDir, GATEWAY_RESTART_LOG_FILENAME);
}
function shellEscapeRestartLogValue(value) {
	return value.replace(/'/g, "'\\''");
}
function renderPosixRestartLogSetup(env) {
	const logDir = path.dirname(resolveGatewayRestartLogPath(env));
	const logPath = resolveGatewayRestartLogPath(env);
	const escapedLogDir = shellEscapeRestartLogValue(logDir);
	const escapedLogPath = shellEscapeRestartLogValue(logPath);
	return `if mkdir -p '${escapedLogDir}' 2>/dev/null && : >>'${escapedLogPath}' 2>/dev/null; then
  exec >>'${escapedLogPath}' 2>&1
fi`;
}
function renderCmdRestartLogSetup(env) {
	const logPath = resolveGatewayRestartLogPath(env);
	const quotedLogDir = quoteCmdScriptArg(path.dirname(logPath));
	const quotedLogPath = quoteCmdScriptArg(logPath);
	return {
		quotedLogPath,
		lines: [`if not exist ${quotedLogDir} mkdir ${quotedLogDir} >nul 2>&1`, `>> ${quotedLogPath} 2>&1 echo [%DATE% %TIME%] openclaw restart log initialized`]
	};
}
//#endregion
export { shellEscapeRestartLogValue as a, assertNoCmdLineBreak as c, resolveGatewayRestartLogPath as i, parseCmdSetAssignment as l, renderPosixRestartLogSetup as n, parseCmdScriptCommandLine as o, resolveGatewayLogPaths as r, quoteCmdScriptArg as s, renderCmdRestartLogSetup as t, renderCmdSetAssignment as u };
