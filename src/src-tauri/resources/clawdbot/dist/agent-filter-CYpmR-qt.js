import { s as normalizeStringEntries } from "./string-normalization-xm3f27dv.js";
import { c as normalizeAgentId } from "./session-key-Bh1lMwK5.js";
//#region src/agents/skills/filter.ts
function normalizeSkillFilter(skillFilter) {
	if (skillFilter === void 0) return;
	return normalizeStringEntries(skillFilter);
}
function normalizeSkillFilterForComparison(skillFilter) {
	const normalized = normalizeSkillFilter(skillFilter);
	if (normalized === void 0) return;
	return Array.from(new Set(normalized)).toSorted();
}
function matchesSkillFilter(cached, next) {
	const cachedNormalized = normalizeSkillFilterForComparison(cached);
	const nextNormalized = normalizeSkillFilterForComparison(next);
	if (cachedNormalized === void 0 || nextNormalized === void 0) return cachedNormalized === nextNormalized;
	if (cachedNormalized.length !== nextNormalized.length) return false;
	return cachedNormalized.every((entry, index) => entry === nextNormalized[index]);
}
//#endregion
//#region src/agents/skills/agent-filter.ts
function resolveAgentEntry(cfg, agentId) {
	if (!cfg) return;
	const normalizedAgentId = normalizeAgentId(agentId);
	return cfg.agents?.list?.find((entry) => normalizeAgentId(entry.id) === normalizedAgentId);
}
/**
* Explicit per-agent skills win when present; otherwise fall back to shared defaults.
* Unknown agent ids also fall back to defaults so legacy/unresolved callers do not widen access.
*/
function resolveEffectiveAgentSkillFilter(cfg, agentId) {
	if (!cfg) return;
	const agentEntry = resolveAgentEntry(cfg, agentId);
	if (agentEntry && Object.hasOwn(agentEntry, "skills")) return normalizeSkillFilter(agentEntry.skills);
	return normalizeSkillFilter(cfg.agents?.defaults?.skills);
}
function resolveEffectiveAgentSkillsLimits(cfg, agentId) {
	if (!agentId) return;
	const agentEntry = resolveAgentEntry(cfg, agentId);
	if (!agentEntry || !Object.hasOwn(agentEntry, "skillsLimits")) return;
	const { maxSkillsPromptChars } = agentEntry.skillsLimits ?? {};
	return typeof maxSkillsPromptChars === "number" ? { maxSkillsPromptChars } : void 0;
}
//#endregion
export { normalizeSkillFilter as i, resolveEffectiveAgentSkillsLimits as n, matchesSkillFilter as r, resolveEffectiveAgentSkillFilter as t };
