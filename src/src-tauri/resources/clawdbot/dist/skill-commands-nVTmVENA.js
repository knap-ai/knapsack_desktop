import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { f as resolveAgentSkillsFilter, p as resolveAgentWorkspaceDir, r as listAgentIds } from "./agent-scope-CYXg_wTS.js";
import { n as buildWorkspaceSkillCommandSpecs } from "./skills-C4NiYd5P.js";
import { t as listReservedChatSlashCommandNames } from "./skill-commands-base-Bx66TaVq.js";
import { t as getRemoteSkillEligibility } from "./skills-remote-fYLkhhDd.js";
import fsSync from "node:fs";
//#region src/auto-reply/skill-commands.ts
function listSkillCommandsForWorkspace(params) {
	return buildWorkspaceSkillCommandSpecs(params.workspaceDir, {
		config: params.cfg,
		skillFilter: params.skillFilter,
		eligibility: { remote: getRemoteSkillEligibility() },
		reservedNames: listReservedChatSlashCommandNames()
	});
}
function dedupeBySkillName(commands) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const cmd of commands) {
		const key = cmd.skillName.trim().toLowerCase();
		if (key && seen.has(key)) continue;
		if (key) seen.add(key);
		out.push(cmd);
	}
	return out;
}
function listSkillCommandsForAgents(params) {
	const mergeSkillFilters = (existing, incoming) => {
		if (existing === void 0 || incoming === void 0) return;
		if (existing.length === 0) return Array.from(new Set(incoming));
		if (incoming.length === 0) return Array.from(new Set(existing));
		return Array.from(new Set([...existing, ...incoming]));
	};
	const agentIds = params.agentIds ?? listAgentIds(params.cfg);
	const used = listReservedChatSlashCommandNames();
	const entries = [];
	const workspaceFilters = /* @__PURE__ */ new Map();
	for (const agentId of agentIds) {
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, agentId);
		if (!fsSync.existsSync(workspaceDir)) {
			logVerbose(`Skipping agent "${agentId}": workspace does not exist: ${workspaceDir}`);
			continue;
		}
		let canonicalDir;
		try {
			canonicalDir = fsSync.realpathSync(workspaceDir);
		} catch {
			logVerbose(`Skipping agent "${agentId}": cannot resolve workspace: ${workspaceDir}`);
			continue;
		}
		const skillFilter = resolveAgentSkillsFilter(params.cfg, agentId);
		const existing = workspaceFilters.get(canonicalDir);
		if (existing) {
			existing.skillFilter = mergeSkillFilters(existing.skillFilter, skillFilter);
			continue;
		}
		workspaceFilters.set(canonicalDir, {
			workspaceDir,
			skillFilter
		});
	}
	for (const { workspaceDir, skillFilter } of workspaceFilters.values()) {
		const commands = buildWorkspaceSkillCommandSpecs(workspaceDir, {
			config: params.cfg,
			skillFilter,
			eligibility: { remote: getRemoteSkillEligibility() },
			reservedNames: used
		});
		for (const command of commands) {
			used.add(command.name.toLowerCase());
			entries.push(command);
		}
	}
	return dedupeBySkillName(entries);
}
//#endregion
export { listSkillCommandsForWorkspace as n, listSkillCommandsForAgents as t };
