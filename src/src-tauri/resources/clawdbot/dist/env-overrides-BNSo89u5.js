import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { r as normalizeStringEntries } from "./string-normalization-CohoSMRS.js";
import { a as getRuntimeConfigSnapshot } from "./io-y3Az_Onx.js";
import { l as isDangerousHostEnvVarName } from "./shell-env-BOu7XeT_.js";
import { c as normalizeResolvedSecretInputString } from "./types.secrets-DgX397vI.js";
import { a as parseOpenClawManifestInstallBase, c as resolveOpenClawManifestOs, d as evaluateRuntimeEligibility, f as hasBinary, i as parseFrontmatterBool, l as resolveOpenClawManifestRequires, n as getFrontmatterString, o as resolveOpenClawManifestBlock, p as isConfigPathTruthyWithDefaults, r as normalizeStringList, s as resolveOpenClawManifestInstall, t as applyOpenClawManifestInstallCommonFields, u as parseFrontmatterBlock } from "./frontmatter-CP5371Rm.js";
import { i as validateRegistryNpmSpec } from "./npm-registry-spec-BH5usJ-U.js";
import { n as validateEnvVarValue, t as sanitizeEnvVars } from "./sanitize-env-vars-BMhpyy1g.js";
//#region src/agents/skills/frontmatter.ts
function parseFrontmatter(content) {
	return parseFrontmatterBlock(content);
}
const BREW_FORMULA_PATTERN = /^[A-Za-z0-9][A-Za-z0-9@+._/-]*$/;
const GO_MODULE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~+\-/]*(?:@[A-Za-z0-9][A-Za-z0-9._~+\-/]*)?$/;
const UV_PACKAGE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._\-[\]=<>!~+,]*$/;
function normalizeSafeBrewFormula(raw) {
	if (typeof raw !== "string") return;
	const formula = raw.trim();
	if (!formula || formula.startsWith("-") || formula.includes("\\") || formula.includes("..")) return;
	if (!BREW_FORMULA_PATTERN.test(formula)) return;
	return formula;
}
function normalizeSafeNpmSpec(raw) {
	if (typeof raw !== "string") return;
	const spec = raw.trim();
	if (!spec || spec.startsWith("-")) return;
	if (validateRegistryNpmSpec(spec) !== null) return;
	return spec;
}
function normalizeSafeGoModule(raw) {
	if (typeof raw !== "string") return;
	const moduleSpec = raw.trim();
	if (!moduleSpec || moduleSpec.startsWith("-") || moduleSpec.includes("\\") || moduleSpec.includes("://")) return;
	if (!GO_MODULE_PATTERN.test(moduleSpec)) return;
	return moduleSpec;
}
function normalizeSafeUvPackage(raw) {
	if (typeof raw !== "string") return;
	const pkg = raw.trim();
	if (!pkg || pkg.startsWith("-") || pkg.includes("\\") || pkg.includes("://")) return;
	if (!UV_PACKAGE_PATTERN.test(pkg)) return;
	return pkg;
}
function normalizeSafeDownloadUrl(raw) {
	if (typeof raw !== "string") return;
	const value = raw.trim();
	if (!value || /\s/.test(value)) return;
	try {
		const parsed = new URL(value);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
		return parsed.toString();
	} catch {
		return;
	}
}
function parseInstallSpec(input) {
	const parsed = parseOpenClawManifestInstallBase(input, [
		"brew",
		"node",
		"go",
		"uv",
		"download"
	]);
	if (!parsed) return;
	const { raw } = parsed;
	const spec = applyOpenClawManifestInstallCommonFields({ kind: parsed.kind }, parsed);
	const osList = normalizeStringList(raw.os);
	if (osList.length > 0) spec.os = osList;
	const formula = normalizeSafeBrewFormula(raw.formula);
	if (formula) spec.formula = formula;
	const cask = normalizeSafeBrewFormula(raw.cask);
	if (!spec.formula && cask) spec.formula = cask;
	if (spec.kind === "node") {
		const pkg = normalizeSafeNpmSpec(raw.package);
		if (pkg) spec.package = pkg;
	} else if (spec.kind === "uv") {
		const pkg = normalizeSafeUvPackage(raw.package);
		if (pkg) spec.package = pkg;
	}
	const moduleSpec = normalizeSafeGoModule(raw.module);
	if (moduleSpec) spec.module = moduleSpec;
	const downloadUrl = normalizeSafeDownloadUrl(raw.url);
	if (downloadUrl) spec.url = downloadUrl;
	if (typeof raw.archive === "string") spec.archive = raw.archive;
	if (typeof raw.extract === "boolean") spec.extract = raw.extract;
	if (typeof raw.stripComponents === "number") spec.stripComponents = raw.stripComponents;
	if (typeof raw.targetDir === "string") spec.targetDir = raw.targetDir;
	if (spec.kind === "brew" && !spec.formula) return;
	if (spec.kind === "node" && !spec.package) return;
	if (spec.kind === "go" && !spec.module) return;
	if (spec.kind === "uv" && !spec.package) return;
	if (spec.kind === "download" && !spec.url) return;
	return spec;
}
function resolveOpenClawMetadata(frontmatter) {
	const metadataObj = resolveOpenClawManifestBlock({ frontmatter });
	if (!metadataObj) return;
	const requires = resolveOpenClawManifestRequires(metadataObj);
	const install = resolveOpenClawManifestInstall(metadataObj, parseInstallSpec);
	const osRaw = resolveOpenClawManifestOs(metadataObj);
	return {
		always: typeof metadataObj.always === "boolean" ? metadataObj.always : void 0,
		emoji: typeof metadataObj.emoji === "string" ? metadataObj.emoji : void 0,
		homepage: typeof metadataObj.homepage === "string" ? metadataObj.homepage : void 0,
		skillKey: typeof metadataObj.skillKey === "string" ? metadataObj.skillKey : void 0,
		primaryEnv: typeof metadataObj.primaryEnv === "string" ? metadataObj.primaryEnv : void 0,
		os: osRaw.length > 0 ? osRaw : void 0,
		requires,
		install: install.length > 0 ? install : void 0
	};
}
function resolveSkillInvocationPolicy(frontmatter) {
	return {
		userInvocable: parseFrontmatterBool(getFrontmatterString(frontmatter, "user-invocable"), true),
		disableModelInvocation: parseFrontmatterBool(getFrontmatterString(frontmatter, "disable-model-invocation"), false)
	};
}
function resolveSkillKey(skill, entry) {
	return entry?.metadata?.skillKey ?? skill.name;
}
//#endregion
//#region src/agents/skills/config.ts
const DEFAULT_CONFIG_VALUES = {
	"browser.enabled": true,
	"browser.evaluateEnabled": true
};
function isConfigPathTruthy(config, pathStr) {
	return isConfigPathTruthyWithDefaults(config, pathStr, DEFAULT_CONFIG_VALUES);
}
function resolveSkillConfig(config, skillKey) {
	const skills = config?.skills?.entries;
	if (!skills || typeof skills !== "object") return;
	const entry = skills[skillKey];
	if (!entry || typeof entry !== "object") return;
	return entry;
}
function normalizeAllowlist(input) {
	if (!input) return;
	if (!Array.isArray(input)) return;
	const normalized = normalizeStringEntries(input);
	return normalized.length > 0 ? normalized : void 0;
}
const BUNDLED_SOURCES = new Set(["openclaw-bundled"]);
function isBundledSkill(entry) {
	return BUNDLED_SOURCES.has(entry.skill.source);
}
function resolveBundledAllowlist(config) {
	return normalizeAllowlist(config?.skills?.allowBundled);
}
function isBundledSkillAllowed(entry, allowlist) {
	if (!allowlist || allowlist.length === 0) return true;
	if (!isBundledSkill(entry)) return true;
	const key = resolveSkillKey(entry.skill, entry);
	return allowlist.includes(key) || allowlist.includes(entry.skill.name);
}
function shouldIncludeSkill(params) {
	const { entry, config, eligibility } = params;
	const skillConfig = resolveSkillConfig(config, resolveSkillKey(entry.skill, entry));
	const allowBundled = normalizeAllowlist(config?.skills?.allowBundled);
	if (skillConfig?.enabled === false) return false;
	if (!isBundledSkillAllowed(entry, allowBundled)) return false;
	return evaluateRuntimeEligibility({
		os: entry.metadata?.os,
		remotePlatforms: eligibility?.remote?.platforms,
		always: entry.metadata?.always,
		requires: entry.metadata?.requires,
		hasBin: hasBinary,
		hasRemoteBin: eligibility?.remote?.hasBin,
		hasAnyRemoteBin: eligibility?.remote?.hasAnyBin,
		hasEnv: (envName) => Boolean(process.env[envName] || skillConfig?.env?.[envName] || skillConfig?.apiKey && entry.metadata?.primaryEnv === envName),
		isConfigPathTruthy: (configPath) => isConfigPathTruthy(config, configPath)
	});
}
//#endregion
//#region src/agents/skills/runtime-config.ts
function resolveSkillRuntimeConfig(config) {
	return getRuntimeConfigSnapshot() ?? config;
}
//#endregion
//#region src/agents/skills/env-overrides.ts
const log = createSubsystemLogger("env-overrides");
/**
* Tracks env var keys that are currently injected by skill overrides.
* Used by ACP harness spawn to strip skill-injected keys so they don't
* leak to child processes (e.g., OPENAI_API_KEY leaking to Codex CLI).
* @see https://github.com/openclaw/openclaw/issues/36280
*/
const activeSkillEnvEntries = /* @__PURE__ */ new Map();
/** Returns a snapshot of env var keys currently injected by skill overrides. */
function getActiveSkillEnvKeys() {
	return new Set(activeSkillEnvEntries.keys());
}
function acquireActiveSkillEnvKey(key, value) {
	const active = activeSkillEnvEntries.get(key);
	if (active) {
		active.count += 1;
		if (process.env[key] === void 0) process.env[key] = active.value;
		return true;
	}
	if (process.env[key] !== void 0) return false;
	activeSkillEnvEntries.set(key, {
		baseline: process.env[key],
		value,
		count: 1
	});
	return true;
}
function releaseActiveSkillEnvKey(key) {
	const active = activeSkillEnvEntries.get(key);
	if (!active) return;
	active.count -= 1;
	if (active.count > 0) {
		if (process.env[key] === void 0) process.env[key] = active.value;
		return;
	}
	activeSkillEnvEntries.delete(key);
	if (active.baseline === void 0) delete process.env[key];
	else process.env[key] = active.baseline;
}
const SKILL_ALWAYS_BLOCKED_ENV_PATTERNS = [/^OPENSSL_CONF$/i];
function matchesAnyPattern(value, patterns) {
	return patterns.some((pattern) => pattern.test(value));
}
function isAlwaysBlockedSkillEnvKey(key) {
	return isDangerousHostEnvVarName(key) || matchesAnyPattern(key, SKILL_ALWAYS_BLOCKED_ENV_PATTERNS);
}
function sanitizeSkillEnvOverrides(params) {
	if (Object.keys(params.overrides).length === 0) return {
		allowed: {},
		blocked: [],
		warnings: []
	};
	const result = sanitizeEnvVars(params.overrides);
	const allowed = {};
	const blocked = /* @__PURE__ */ new Set();
	const warnings = [...result.warnings];
	for (const [key, value] of Object.entries(result.allowed)) {
		if (isAlwaysBlockedSkillEnvKey(key)) {
			blocked.add(key);
			continue;
		}
		allowed[key] = value;
	}
	for (const key of result.blocked) {
		if (isAlwaysBlockedSkillEnvKey(key) || !params.allowedSensitiveKeys.has(key)) {
			blocked.add(key);
			continue;
		}
		const value = params.overrides[key];
		if (!value) continue;
		const warning = validateEnvVarValue(value);
		if (warning) {
			if (warning === "Contains null bytes") {
				blocked.add(key);
				continue;
			}
			warnings.push(`${key}: ${warning}`);
		}
		allowed[key] = value;
	}
	return {
		allowed,
		blocked: [...blocked],
		warnings
	};
}
function applySkillConfigEnvOverrides(params) {
	const { updates, skillConfig, primaryEnv, requiredEnv, skillKey } = params;
	const allowedSensitiveKeys = /* @__PURE__ */ new Set();
	const normalizedPrimaryEnv = primaryEnv?.trim();
	if (normalizedPrimaryEnv) allowedSensitiveKeys.add(normalizedPrimaryEnv);
	for (const envName of requiredEnv ?? []) {
		const trimmedEnv = envName.trim();
		if (trimmedEnv) allowedSensitiveKeys.add(trimmedEnv);
	}
	const pendingOverrides = {};
	if (skillConfig.env) for (const [rawKey, envValue] of Object.entries(skillConfig.env)) {
		const envKey = rawKey.trim();
		const hasExternallyManagedValue = process.env[envKey] !== void 0 && !activeSkillEnvEntries.has(envKey);
		if (!envKey || !envValue || hasExternallyManagedValue) continue;
		pendingOverrides[envKey] = envValue;
	}
	const resolvedApiKey = normalizeResolvedSecretInputString({
		value: skillConfig.apiKey,
		path: `skills.entries.${skillKey}.apiKey`
	}) ?? "";
	if (normalizedPrimaryEnv && (process.env[normalizedPrimaryEnv] === void 0 || activeSkillEnvEntries.has(normalizedPrimaryEnv)) && resolvedApiKey) {
		if (!pendingOverrides[normalizedPrimaryEnv]) pendingOverrides[normalizedPrimaryEnv] = resolvedApiKey;
	}
	const sanitized = sanitizeSkillEnvOverrides({
		overrides: pendingOverrides,
		allowedSensitiveKeys
	});
	if (sanitized.blocked.length > 0) log.warn(`Blocked skill env overrides for ${skillKey}: ${sanitized.blocked.join(", ")}`);
	if (sanitized.warnings.length > 0) log.warn(`Suspicious skill env overrides for ${skillKey}: ${sanitized.warnings.join(", ")}`);
	for (const [envKey, envValue] of Object.entries(sanitized.allowed)) {
		if (!acquireActiveSkillEnvKey(envKey, envValue)) continue;
		updates.push({ key: envKey });
		process.env[envKey] = activeSkillEnvEntries.get(envKey)?.value ?? envValue;
	}
}
function createEnvReverter(updates) {
	return () => {
		for (const update of updates) releaseActiveSkillEnvKey(update.key);
	};
}
function applySkillEnvOverrides(params) {
	const { skills } = params;
	const config = resolveSkillRuntimeConfig(params.config);
	const updates = [];
	for (const entry of skills) {
		const skillKey = resolveSkillKey(entry.skill, entry);
		const skillConfig = resolveSkillConfig(config, skillKey);
		if (!skillConfig) continue;
		applySkillConfigEnvOverrides({
			updates,
			skillConfig,
			primaryEnv: entry.metadata?.primaryEnv,
			requiredEnv: entry.metadata?.requires?.env,
			skillKey
		});
	}
	return createEnvReverter(updates);
}
function applySkillEnvOverridesFromSnapshot(params) {
	const { snapshot } = params;
	const config = resolveSkillRuntimeConfig(params.config);
	if (!snapshot) return () => {};
	const updates = [];
	for (const skill of snapshot.skills) {
		const skillConfig = resolveSkillConfig(config, skill.name);
		if (!skillConfig) continue;
		applySkillConfigEnvOverrides({
			updates,
			skillConfig,
			primaryEnv: skill.primaryEnv,
			requiredEnv: skill.requiredEnv,
			skillKey: skill.name
		});
	}
	return createEnvReverter(updates);
}
//#endregion
export { isBundledSkillAllowed as a, resolveSkillConfig as c, resolveOpenClawMetadata as d, resolveSkillInvocationPolicy as f, resolveSkillRuntimeConfig as i, shouldIncludeSkill as l, applySkillEnvOverridesFromSnapshot as n, isConfigPathTruthy as o, resolveSkillKey as p, getActiveSkillEnvKeys as r, resolveBundledAllowlist as s, applySkillEnvOverrides as t, parseFrontmatter as u };
