import { v as resolveAgentConfig } from "./agent-scope-i10se9ty.js";
import { t as pickSandboxToolPolicy } from "./sandbox-tool-policy-Cbfgb-tm.js";
import { c as mergeAlsoAllowPolicy, m as resolveToolProfilePolicy } from "./tool-policy-CC72sL8W.js";
import { t as isToolAllowedByPolicies } from "./tool-policy-match-DidHscN9.js";
//#region src/agents/tool-fs-policy.ts
function createToolFsPolicy(params) {
	return { workspaceOnly: params.workspaceOnly === true };
}
function resolveToolFsConfig(params) {
	const cfg = params.cfg;
	const globalFs = cfg?.tools?.fs;
	return { workspaceOnly: (cfg && params.agentId ? resolveAgentConfig(cfg, params.agentId)?.tools?.fs : void 0)?.workspaceOnly ?? globalFs?.workspaceOnly };
}
function resolveEffectiveToolFsWorkspaceOnly(params) {
	return resolveToolFsConfig(params).workspaceOnly === true;
}
function resolveEffectiveToolFsRootExpansionAllowed(params) {
	const cfg = params.cfg;
	if (!cfg) return true;
	const agentTools = params.agentId ? resolveAgentConfig(cfg, params.agentId)?.tools : void 0;
	const globalTools = cfg.tools;
	const profile = agentTools?.profile ?? globalTools?.profile;
	const profileAlsoAllow = new Set(agentTools?.alsoAllow ?? globalTools?.alsoAllow ?? []);
	const fsConfig = resolveToolFsConfig(params);
	const hasExplicitFsConfig = agentTools?.fs !== void 0 || globalTools?.fs !== void 0;
	if (fsConfig.workspaceOnly === true) return false;
	if (hasExplicitFsConfig) {
		profileAlsoAllow.add("read");
		profileAlsoAllow.add("write");
		profileAlsoAllow.add("edit");
	}
	return isToolAllowedByPolicies("read", [
		mergeAlsoAllowPolicy(resolveToolProfilePolicy(profile), profileAlsoAllow.size > 0 ? Array.from(profileAlsoAllow) : void 0),
		pickSandboxToolPolicy(globalTools),
		pickSandboxToolPolicy(agentTools)
	]);
}
//#endregion
export { resolveToolFsConfig as i, resolveEffectiveToolFsRootExpansionAllowed as n, resolveEffectiveToolFsWorkspaceOnly as r, createToolFsPolicy as t };
