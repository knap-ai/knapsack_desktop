import { _ as resolveStateDir } from "./paths-B2cMK-wd.js";
import { p as resolveUserPath } from "./utils-DvkbxKCZ.js";
import { t as DEFAULT_AGENT_ID } from "./session-key-hxP9B3Or.js";
import path from "node:path";
//#region src/agents/agent-paths.ts
function resolveOpenClawAgentDir(env = process.env) {
	const override = env.OPENCLAW_AGENT_DIR?.trim() || env.PI_CODING_AGENT_DIR?.trim();
	if (override) return resolveUserPath(override, env);
	return resolveUserPath(path.join(resolveStateDir(env), "agents", DEFAULT_AGENT_ID, "agent"), env);
}
//#endregion
export { resolveOpenClawAgentDir as t };
