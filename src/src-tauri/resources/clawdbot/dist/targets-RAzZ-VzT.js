import { S as resolveDefaultAgentId, v as resolveAgentConfig, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import "./agent-runtime-CYXcxHpR.js";
import { u as resolveHomePath } from "./helpers-89ezfCfr.js";
import path from "node:path";
//#region extensions/migrate-claude/targets.ts
function resolveTargets(ctx) {
	const cfg = ctx.config;
	const agentId = resolveDefaultAgentId(cfg);
	const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
	const configuredAgentDir = resolveAgentConfig(cfg, agentId)?.agentDir?.trim();
	const agentDir = ctx.runtime?.agent?.resolveAgentDir(cfg, agentId) ?? (configuredAgentDir ? resolveHomePath(configuredAgentDir) : void 0) ?? path.join(ctx.stateDir, "agents", agentId, "agent");
	return {
		workspaceDir,
		stateDir: ctx.stateDir,
		agentDir
	};
}
//#endregion
export { resolveTargets as t };
