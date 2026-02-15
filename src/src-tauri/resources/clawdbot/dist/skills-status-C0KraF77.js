import { o as createSubsystemLogger } from "./entry.js";
import { t as CONFIG_DIR } from "./utils-q1rHOG-N.js";
import { _ as isConfigPathTruthy, b as resolveSkillConfig, c as resolveBundledSkillsDir, g as isBundledSkillAllowed, h as hasBinary, i as loadWorkspaceSkillEntries, t as resolveSkillsInstallPreferences, v as resolveBundledAllowlist, y as resolveConfigPath } from "./skills-C1pxUa-I.js";
import path from "node:path";
import { loadSkillsFromDir } from "@mariozechner/pi-coding-agent";

//#region src/agents/skills/bundled-context.ts
const skillsLogger = createSubsystemLogger("skills");
let hasWarnedMissingBundledDir = false;
function resolveBundledSkillsContext(opts = {}) {
	const dir = resolveBundledSkillsDir(opts);
	const names = /* @__PURE__ */ new Set();
	if (!dir) {
		if (!hasWarnedMissingBundledDir) {
			hasWarnedMissingBundledDir = true;
			skillsLogger.warn("Bundled skills directory could not be resolved; built-in skills may be missing.");
		}
		return {
			dir,
			names
		};
	}
	const result = loadSkillsFromDir({
		dir,
		source: "openclaw-bundled"
	});
	for (const skill of result.skills) if (skill.name.trim()) names.add(skill.name);
	return {
		dir,
		names
	};
}

//#endregion
//#region src/agents/skills-status.ts
function resolveSkillKey(entry) {
	return entry.metadata?.skillKey ?? entry.skill.name;
}
function selectPreferredInstallSpec(install, prefs) {
	if (install.length === 0) return;
	const indexed = install.map((spec, index) => ({
		spec,
		index
	}));
	const findKind = (kind) => indexed.find((item) => item.spec.kind === kind);
	const brewSpec = findKind("brew");
	const nodeSpec = findKind("node");
	const goSpec = findKind("go");
	const uvSpec = findKind("uv");
	if (prefs.preferBrew && hasBinary("brew") && brewSpec) return brewSpec;
	if (uvSpec) return uvSpec;
	if (nodeSpec) return nodeSpec;
	if (brewSpec) return brewSpec;
	if (goSpec) return goSpec;
	return indexed[0];
}
function normalizeInstallOptions(entry, prefs) {
	const requiredOs = entry.metadata?.os ?? [];
	if (requiredOs.length > 0 && !requiredOs.includes(process.platform)) return [];
	const install = entry.metadata?.install ?? [];
	if (install.length === 0) return [];
	const platform = process.platform;
	const filtered = install.filter((spec) => {
		const osList = spec.os ?? [];
		return osList.length === 0 || osList.includes(platform);
	});
	if (filtered.length === 0) return [];
	const toOption = (spec, index) => {
		const id = (spec.id ?? `${spec.kind}-${index}`).trim();
		const bins = spec.bins ?? [];
		let label = (spec.label ?? "").trim();
		if (spec.kind === "node" && spec.package) label = `Install ${spec.package} (${prefs.nodeManager})`;
		if (!label) if (spec.kind === "brew" && spec.formula) label = `Install ${spec.formula} (brew)`;
		else if (spec.kind === "node" && spec.package) label = `Install ${spec.package} (${prefs.nodeManager})`;
		else if (spec.kind === "go" && spec.module) label = `Install ${spec.module} (go)`;
		else if (spec.kind === "uv" && spec.package) label = `Install ${spec.package} (uv)`;
		else if (spec.kind === "download" && spec.url) {
			const url = spec.url.trim();
			const last = url.split("/").pop();
			label = `Download ${last && last.length > 0 ? last : url}`;
		} else label = "Run installer";
		return {
			id,
			kind: spec.kind,
			label,
			bins
		};
	};
	if (filtered.every((spec) => spec.kind === "download")) return filtered.map((spec, index) => toOption(spec, index));
	const preferred = selectPreferredInstallSpec(filtered, prefs);
	if (!preferred) return [];
	return [toOption(preferred.spec, preferred.index)];
}
function buildSkillStatus(entry, config, prefs, eligibility, bundledNames) {
	const skillKey = resolveSkillKey(entry);
	const skillConfig = resolveSkillConfig(config, skillKey);
	const disabled = skillConfig?.enabled === false;
	const blockedByAllowlist = !isBundledSkillAllowed(entry, resolveBundledAllowlist(config));
	const always = entry.metadata?.always === true;
	const emoji = entry.metadata?.emoji ?? entry.frontmatter.emoji;
	const homepageRaw = entry.metadata?.homepage ?? entry.frontmatter.homepage ?? entry.frontmatter.website ?? entry.frontmatter.url;
	const homepage = homepageRaw?.trim() ? homepageRaw.trim() : void 0;
	const bundled = bundledNames && bundledNames.size > 0 ? bundledNames.has(entry.skill.name) : entry.skill.source === "openclaw-bundled";
	const requiredBins = entry.metadata?.requires?.bins ?? [];
	const requiredAnyBins = entry.metadata?.requires?.anyBins ?? [];
	const requiredEnv = entry.metadata?.requires?.env ?? [];
	const requiredConfig = entry.metadata?.requires?.config ?? [];
	const requiredOs = entry.metadata?.os ?? [];
	const missingBins = requiredBins.filter((bin) => {
		if (hasBinary(bin)) return false;
		if (eligibility?.remote?.hasBin?.(bin)) return false;
		return true;
	});
	const missingAnyBins = requiredAnyBins.length > 0 && !(requiredAnyBins.some((bin) => hasBinary(bin)) || eligibility?.remote?.hasAnyBin?.(requiredAnyBins)) ? requiredAnyBins : [];
	const missingOs = requiredOs.length > 0 && !requiredOs.includes(process.platform) && !eligibility?.remote?.platforms?.some((platform) => requiredOs.includes(platform)) ? requiredOs : [];
	const missingEnv = [];
	for (const envName of requiredEnv) {
		if (process.env[envName]) continue;
		if (skillConfig?.env?.[envName]) continue;
		if (skillConfig?.apiKey && entry.metadata?.primaryEnv === envName) continue;
		missingEnv.push(envName);
	}
	const configChecks = requiredConfig.map((pathStr) => {
		return {
			path: pathStr,
			value: resolveConfigPath(config, pathStr),
			satisfied: isConfigPathTruthy(config, pathStr)
		};
	});
	const missingConfig = configChecks.filter((check) => !check.satisfied).map((check) => check.path);
	const missing = always ? {
		bins: [],
		anyBins: [],
		env: [],
		config: [],
		os: []
	} : {
		bins: missingBins,
		anyBins: missingAnyBins,
		env: missingEnv,
		config: missingConfig,
		os: missingOs
	};
	const eligible = !disabled && !blockedByAllowlist && (always || missing.bins.length === 0 && missing.anyBins.length === 0 && missing.env.length === 0 && missing.config.length === 0 && missing.os.length === 0);
	return {
		name: entry.skill.name,
		description: entry.skill.description,
		source: entry.skill.source,
		bundled,
		filePath: entry.skill.filePath,
		baseDir: entry.skill.baseDir,
		skillKey,
		primaryEnv: entry.metadata?.primaryEnv,
		emoji,
		homepage,
		always,
		disabled,
		blockedByAllowlist,
		eligible,
		requirements: {
			bins: requiredBins,
			anyBins: requiredAnyBins,
			env: requiredEnv,
			config: requiredConfig,
			os: requiredOs
		},
		missing,
		configChecks,
		install: normalizeInstallOptions(entry, prefs ?? resolveSkillsInstallPreferences(config))
	};
}
function buildWorkspaceSkillStatus(workspaceDir, opts) {
	const managedSkillsDir = opts?.managedSkillsDir ?? path.join(CONFIG_DIR, "skills");
	const bundledContext = resolveBundledSkillsContext();
	const skillEntries = opts?.entries ?? loadWorkspaceSkillEntries(workspaceDir, {
		config: opts?.config,
		managedSkillsDir,
		bundledSkillsDir: bundledContext.dir
	});
	const prefs = resolveSkillsInstallPreferences(opts?.config);
	return {
		workspaceDir,
		managedSkillsDir,
		skills: skillEntries.map((entry) => buildSkillStatus(entry, opts?.config, prefs, opts?.eligibility, bundledContext.names))
	};
}

//#endregion
export { buildWorkspaceSkillStatus as t };