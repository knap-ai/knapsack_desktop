import fs from "node:fs";
const OOM_SCORE_WRAP_SHELL = "/bin/sh";
const OOM_SCORE_WRAP_SCRIPT = "echo 1000 > /proc/self/oom_score_adj 2>/dev/null; exec \"$0\" \"$@\"";
const SHELL_INIT_ENV_KEYS = [
	"BASH_ENV",
	"ENV",
	"CDPATH"
];
function isDisabled(value) {
	switch (value?.trim().toLowerCase()) {
		case "0":
		case "false":
		case "no":
		case "off": return true;
		default: return false;
	}
}
let cachedShellAvailable = null;
function defaultShellAvailable() {
	if (cachedShellAvailable !== null) return cachedShellAvailable;
	try {
		cachedShellAvailable = fs.statSync(OOM_SCORE_WRAP_SHELL).isFile();
	} catch {
		cachedShellAvailable = false;
	}
	return cachedShellAvailable;
}
function shouldWrapChildForOomScore(options) {
	if ((options?.platform ?? process.platform) !== "linux") return false;
	if (isDisabled((options?.env ?? process.env)["OPENCLAW_CHILD_OOM_SCORE_ADJ"])) return false;
	return (options?.shellAvailable ?? defaultShellAvailable)();
}
function isWrapped(command, args) {
	return command === OOM_SCORE_WRAP_SHELL && args[0] === "-c" && args[1] === OOM_SCORE_WRAP_SCRIPT;
}
function canUseShellExecCommand(command) {
	return !command.startsWith("-");
}
function hardenShellEnv(baseEnv) {
	const next = { ...baseEnv ?? process.env };
	for (const key of SHELL_INIT_ENV_KEYS) delete next[key];
	return next;
}
function prepareOomScoreAdjustedSpawn(command, args = [], options) {
	const copy = [...args];
	if (!command || !canUseShellExecCommand(command) || !shouldWrapChildForOomScore(options)) return {
		command,
		args: copy,
		env: options?.env,
		wrapped: false
	};
	if (isWrapped(command, copy)) return {
		command,
		args: copy,
		env: hardenShellEnv(options?.env),
		wrapped: true
	};
	return {
		command: OOM_SCORE_WRAP_SHELL,
		args: [
			"-c",
			OOM_SCORE_WRAP_SCRIPT,
			command,
			...copy
		],
		env: hardenShellEnv(options?.env),
		wrapped: true
	};
}
//#endregion
export { prepareOomScoreAdjustedSpawn as t };
