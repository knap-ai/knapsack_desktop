import { _ as resolveStateDir } from "./paths-ViKUYWUK.js";
import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { t as DEFAULT_AGENT_ID } from "./session-key-DAhnzjyr.js";
import { n as saveJsonFile } from "./json-file-Dl3Z1jL1.js";
import fs from "node:fs";
import path from "node:path";
//#region src/agents/auth-profiles/constants.ts
const AUTH_PROFILE_FILENAME = "auth-profiles.json";
const LEGACY_AUTH_FILENAME = "auth.json";
const CLAUDE_CLI_PROFILE_ID = "anthropic:claude-cli";
const CODEX_CLI_PROFILE_ID = "openai-codex:codex-cli";
const QWEN_CLI_PROFILE_ID = "qwen-portal:qwen-cli";
const MINIMAX_CLI_PROFILE_ID = "minimax-portal:minimax-cli";
const AUTH_STORE_LOCK_OPTIONS = {
	retries: {
		retries: 10,
		factor: 2,
		minTimeout: 100,
		maxTimeout: 1e4,
		randomize: true
	},
	stale: 3e4
};
const EXTERNAL_CLI_SYNC_TTL_MS = 900 * 1e3;
const log = createSubsystemLogger("agents/auth-profiles");
//#endregion
//#region src/agents/agent-paths.ts
function resolveOpenClawAgentDir(env = process.env) {
	const override = env.OPENCLAW_AGENT_DIR?.trim() || env.PI_CODING_AGENT_DIR?.trim();
	if (override) return resolveUserPath(override, env);
	return resolveUserPath(path.join(resolveStateDir(env), "agents", DEFAULT_AGENT_ID, "agent"), env);
}
//#endregion
//#region src/agents/auth-profiles/paths.ts
function resolveAuthStorePath(agentDir) {
	const resolved = resolveUserPath(agentDir ?? resolveOpenClawAgentDir());
	return path.join(resolved, AUTH_PROFILE_FILENAME);
}
function resolveLegacyAuthStorePath(agentDir) {
	const resolved = resolveUserPath(agentDir ?? resolveOpenClawAgentDir());
	return path.join(resolved, LEGACY_AUTH_FILENAME);
}
function resolveAuthStorePathForDisplay(agentDir) {
	const pathname = resolveAuthStorePath(agentDir);
	return pathname.startsWith("~") ? pathname : resolveUserPath(pathname);
}
function ensureAuthStoreFile(pathname) {
	if (fs.existsSync(pathname)) return;
	saveJsonFile(pathname, {
		version: 1,
		profiles: {}
	});
}
//#endregion
export { resolveOpenClawAgentDir as a, CODEX_CLI_PROFILE_ID as c, QWEN_CLI_PROFILE_ID as d, log as f, resolveLegacyAuthStorePath as i, EXTERNAL_CLI_SYNC_TTL_MS as l, resolveAuthStorePath as n, AUTH_STORE_LOCK_OPTIONS as o, resolveAuthStorePathForDisplay as r, CLAUDE_CLI_PROFILE_ID as s, ensureAuthStoreFile as t, MINIMAX_CLI_PROFILE_ID as u };
