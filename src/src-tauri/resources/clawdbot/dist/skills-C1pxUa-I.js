import { a as parseBooleanValue, o as createSubsystemLogger } from "./entry.js";
import { t as CONFIG_DIR, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-BKsZvO6K.js";
import { a as MANIFEST_KEY, d as resolveMemorySlotDecision, i as LEGACY_MANIFEST_KEYS, l as normalizePluginsConfig, t as loadPluginManifestRegistry, u as resolveEnableState } from "./manifest-registry-DlFh5LWe.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import JSON5 from "json5";
import fs$1 from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { formatSkillsForPrompt, loadSkillsFromDir } from "@mariozechner/pi-coding-agent";
import YAML from "yaml";

//#region src/markdown/frontmatter.ts
function stripQuotes(value) {
	if (value.startsWith("\"") && value.endsWith("\"") || value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
	return value;
}
function coerceFrontmatterValue(value) {
	if (value === null || value === void 0) return;
	if (typeof value === "string") return value.trim();
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (typeof value === "object") try {
		return JSON.stringify(value);
	} catch {
		return;
	}
}
function parseYamlFrontmatter(block) {
	try {
		const parsed = YAML.parse(block);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
		const result = {};
		for (const [rawKey, value] of Object.entries(parsed)) {
			const key = rawKey.trim();
			if (!key) continue;
			const coerced = coerceFrontmatterValue(value);
			if (coerced === void 0) continue;
			result[key] = coerced;
		}
		return result;
	} catch {
		return null;
	}
}
function extractMultiLineValue(lines, startIndex) {
	const match = lines[startIndex].match(/^([\w-]+):\s*(.*)$/);
	if (!match) return {
		value: "",
		linesConsumed: 1
	};
	const inlineValue = match[2].trim();
	if (inlineValue) return {
		value: inlineValue,
		linesConsumed: 1
	};
	const valueLines = [];
	let i = startIndex + 1;
	while (i < lines.length) {
		const line = lines[i];
		if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("	")) break;
		valueLines.push(line);
		i++;
	}
	return {
		value: valueLines.join("\n").trim(),
		linesConsumed: i - startIndex
	};
}
function parseLineFrontmatter(block) {
	const frontmatter = {};
	const lines = block.split("\n");
	let i = 0;
	while (i < lines.length) {
		const match = lines[i].match(/^([\w-]+):\s*(.*)$/);
		if (!match) {
			i++;
			continue;
		}
		const key = match[1];
		const inlineValue = match[2].trim();
		if (!key) {
			i++;
			continue;
		}
		if (!inlineValue && i + 1 < lines.length) {
			const nextLine = lines[i + 1];
			if (nextLine.startsWith(" ") || nextLine.startsWith("	")) {
				const { value, linesConsumed } = extractMultiLineValue(lines, i);
				if (value) frontmatter[key] = value;
				i += linesConsumed;
				continue;
			}
		}
		const value = stripQuotes(inlineValue);
		if (value) frontmatter[key] = value;
		i++;
	}
	return frontmatter;
}
function parseFrontmatterBlock(content) {
	const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	if (!normalized.startsWith("---")) return {};
	const endIndex = normalized.indexOf("\n---", 3);
	if (endIndex === -1) return {};
	const block = normalized.slice(4, endIndex);
	const lineParsed = parseLineFrontmatter(block);
	const yamlParsed = parseYamlFrontmatter(block);
	if (yamlParsed === null) return lineParsed;
	const merged = { ...yamlParsed };
	for (const [key, value] of Object.entries(lineParsed)) if (value.startsWith("{") || value.startsWith("[")) merged[key] = value;
	return merged;
}

//#endregion
//#region src/agents/skills/frontmatter.ts
function parseFrontmatter(content) {
	return parseFrontmatterBlock(content);
}
function normalizeStringList(input) {
	if (!input) return [];
	if (Array.isArray(input)) return input.map((value) => String(value).trim()).filter(Boolean);
	if (typeof input === "string") return input.split(",").map((value) => value.trim()).filter(Boolean);
	return [];
}
function parseInstallSpec(input) {
	if (!input || typeof input !== "object") return;
	const raw = input;
	const kind = (typeof raw.kind === "string" ? raw.kind : typeof raw.type === "string" ? raw.type : "").trim().toLowerCase();
	if (kind !== "brew" && kind !== "node" && kind !== "go" && kind !== "uv" && kind !== "download") return;
	const spec = { kind };
	if (typeof raw.id === "string") spec.id = raw.id;
	if (typeof raw.label === "string") spec.label = raw.label;
	const bins = normalizeStringList(raw.bins);
	if (bins.length > 0) spec.bins = bins;
	const osList = normalizeStringList(raw.os);
	if (osList.length > 0) spec.os = osList;
	if (typeof raw.formula === "string") spec.formula = raw.formula;
	if (typeof raw.package === "string") spec.package = raw.package;
	if (typeof raw.module === "string") spec.module = raw.module;
	if (typeof raw.url === "string") spec.url = raw.url;
	if (typeof raw.archive === "string") spec.archive = raw.archive;
	if (typeof raw.extract === "boolean") spec.extract = raw.extract;
	if (typeof raw.stripComponents === "number") spec.stripComponents = raw.stripComponents;
	if (typeof raw.targetDir === "string") spec.targetDir = raw.targetDir;
	return spec;
}
function getFrontmatterValue(frontmatter, key) {
	const raw = frontmatter[key];
	return typeof raw === "string" ? raw : void 0;
}
function parseFrontmatterBool(value, fallback) {
	const parsed = parseBooleanValue(value);
	return parsed === void 0 ? fallback : parsed;
}
function resolveOpenClawMetadata(frontmatter) {
	const raw = getFrontmatterValue(frontmatter, "metadata");
	if (!raw) return;
	try {
		const parsed = JSON5.parse(raw);
		if (!parsed || typeof parsed !== "object") return;
		const metadataRawCandidates = [MANIFEST_KEY, ...LEGACY_MANIFEST_KEYS];
		let metadataRaw;
		for (const key of metadataRawCandidates) {
			const candidate = parsed[key];
			if (candidate && typeof candidate === "object") {
				metadataRaw = candidate;
				break;
			}
		}
		if (!metadataRaw || typeof metadataRaw !== "object") return;
		const metadataObj = metadataRaw;
		const requiresRaw = typeof metadataObj.requires === "object" && metadataObj.requires !== null ? metadataObj.requires : void 0;
		const install = (Array.isArray(metadataObj.install) ? metadataObj.install : []).map((entry) => parseInstallSpec(entry)).filter((entry) => Boolean(entry));
		const osRaw = normalizeStringList(metadataObj.os);
		return {
			always: typeof metadataObj.always === "boolean" ? metadataObj.always : void 0,
			emoji: typeof metadataObj.emoji === "string" ? metadataObj.emoji : void 0,
			homepage: typeof metadataObj.homepage === "string" ? metadataObj.homepage : void 0,
			skillKey: typeof metadataObj.skillKey === "string" ? metadataObj.skillKey : void 0,
			primaryEnv: typeof metadataObj.primaryEnv === "string" ? metadataObj.primaryEnv : void 0,
			os: osRaw.length > 0 ? osRaw : void 0,
			requires: requiresRaw ? {
				bins: normalizeStringList(requiresRaw.bins),
				anyBins: normalizeStringList(requiresRaw.anyBins),
				env: normalizeStringList(requiresRaw.env),
				config: normalizeStringList(requiresRaw.config)
			} : void 0,
			install: install.length > 0 ? install : void 0
		};
	} catch {
		return;
	}
}
function resolveSkillInvocationPolicy(frontmatter) {
	return {
		userInvocable: parseFrontmatterBool(getFrontmatterValue(frontmatter, "user-invocable"), true),
		disableModelInvocation: parseFrontmatterBool(getFrontmatterValue(frontmatter, "disable-model-invocation"), false)
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
function isTruthy(value) {
	if (value === void 0 || value === null) return false;
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value !== 0;
	if (typeof value === "string") return value.trim().length > 0;
	return true;
}
function resolveConfigPath(config, pathStr) {
	const parts = pathStr.split(".").filter(Boolean);
	let current = config;
	for (const part of parts) {
		if (typeof current !== "object" || current === null) return;
		current = current[part];
	}
	return current;
}
function isConfigPathTruthy(config, pathStr) {
	const value = resolveConfigPath(config, pathStr);
	if (value === void 0 && pathStr in DEFAULT_CONFIG_VALUES) return DEFAULT_CONFIG_VALUES[pathStr];
	return isTruthy(value);
}
function resolveSkillConfig(config, skillKey) {
	const skills = config?.skills?.entries;
	if (!skills || typeof skills !== "object") return;
	const entry = skills[skillKey];
	if (!entry || typeof entry !== "object") return;
	return entry;
}
function resolveRuntimePlatform() {
	return process.platform;
}
function normalizeAllowlist(input) {
	if (!input) return;
	if (!Array.isArray(input)) return;
	const normalized = input.map((entry) => String(entry).trim()).filter(Boolean);
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
function hasBinary(bin) {
	const parts = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
	const winPathExt = process.env.PATHEXT;
	const winExtensions = winPathExt !== void 0 ? winPathExt.split(";").filter(Boolean) : [
		".EXE",
		".CMD",
		".BAT",
		".COM"
	];
	const extensions = process.platform === "win32" ? ["", ...winExtensions] : [""];
	for (const part of parts) for (const ext of extensions) {
		const candidate = path.join(part, bin + ext);
		try {
			fs.accessSync(candidate, fs.constants.X_OK);
			return true;
		} catch {}
	}
	return false;
}
function shouldIncludeSkill(params) {
	const { entry, config, eligibility } = params;
	const skillConfig = resolveSkillConfig(config, resolveSkillKey(entry.skill, entry));
	const allowBundled = normalizeAllowlist(config?.skills?.allowBundled);
	const osList = entry.metadata?.os ?? [];
	const remotePlatforms = eligibility?.remote?.platforms ?? [];
	if (skillConfig?.enabled === false) return false;
	if (!isBundledSkillAllowed(entry, allowBundled)) return false;
	if (osList.length > 0 && !osList.includes(resolveRuntimePlatform()) && !remotePlatforms.some((platform) => osList.includes(platform))) return false;
	if (entry.metadata?.always === true) return true;
	const requiredBins = entry.metadata?.requires?.bins ?? [];
	if (requiredBins.length > 0) for (const bin of requiredBins) {
		if (hasBinary(bin)) continue;
		if (eligibility?.remote?.hasBin?.(bin)) continue;
		return false;
	}
	const requiredAnyBins = entry.metadata?.requires?.anyBins ?? [];
	if (requiredAnyBins.length > 0) {
		if (!(requiredAnyBins.some((bin) => hasBinary(bin)) || eligibility?.remote?.hasAnyBin?.(requiredAnyBins))) return false;
	}
	const requiredEnv = entry.metadata?.requires?.env ?? [];
	if (requiredEnv.length > 0) for (const envName of requiredEnv) {
		if (process.env[envName]) continue;
		if (skillConfig?.env?.[envName]) continue;
		if (skillConfig?.apiKey && entry.metadata?.primaryEnv === envName) continue;
		return false;
	}
	const requiredConfig = entry.metadata?.requires?.config ?? [];
	if (requiredConfig.length > 0) {
		for (const configPath of requiredConfig) if (!isConfigPathTruthy(config, configPath)) return false;
	}
	return true;
}

//#endregion
//#region src/agents/skills/env-overrides.ts
function applySkillEnvOverrides(params) {
	const { skills, config } = params;
	const updates = [];
	for (const entry of skills) {
		const skillConfig = resolveSkillConfig(config, resolveSkillKey(entry.skill, entry));
		if (!skillConfig) continue;
		if (skillConfig.env) for (const [envKey, envValue] of Object.entries(skillConfig.env)) {
			if (!envValue || process.env[envKey]) continue;
			updates.push({
				key: envKey,
				prev: process.env[envKey]
			});
			process.env[envKey] = envValue;
		}
		const primaryEnv = entry.metadata?.primaryEnv;
		if (primaryEnv && skillConfig.apiKey && !process.env[primaryEnv]) {
			updates.push({
				key: primaryEnv,
				prev: process.env[primaryEnv]
			});
			process.env[primaryEnv] = skillConfig.apiKey;
		}
	}
	return () => {
		for (const update of updates) if (update.prev === void 0) delete process.env[update.key];
		else process.env[update.key] = update.prev;
	};
}
function applySkillEnvOverridesFromSnapshot(params) {
	const { snapshot, config } = params;
	if (!snapshot) return () => {};
	const updates = [];
	for (const skill of snapshot.skills) {
		const skillConfig = resolveSkillConfig(config, skill.name);
		if (!skillConfig) continue;
		if (skillConfig.env) for (const [envKey, envValue] of Object.entries(skillConfig.env)) {
			if (!envValue || process.env[envKey]) continue;
			updates.push({
				key: envKey,
				prev: process.env[envKey]
			});
			process.env[envKey] = envValue;
		}
		if (skill.primaryEnv && skillConfig.apiKey && !process.env[skill.primaryEnv]) {
			updates.push({
				key: skill.primaryEnv,
				prev: process.env[skill.primaryEnv]
			});
			process.env[skill.primaryEnv] = skillConfig.apiKey;
		}
	}
	return () => {
		for (const update of updates) if (update.prev === void 0) delete process.env[update.key];
		else process.env[update.key] = update.prev;
	};
}

//#endregion
//#region src/agents/sandbox-paths.ts
const UNICODE_SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;
const HTTP_URL_RE = /^https?:\/\//i;
const DATA_URL_RE = /^data:/i;
function normalizeUnicodeSpaces(str) {
	return str.replace(UNICODE_SPACES, " ");
}
function expandPath(filePath) {
	const normalized = normalizeUnicodeSpaces(filePath);
	if (normalized === "~") return os.homedir();
	if (normalized.startsWith("~/")) return os.homedir() + normalized.slice(1);
	return normalized;
}
function resolveToCwd(filePath, cwd) {
	const expanded = expandPath(filePath);
	if (path.isAbsolute(expanded)) return expanded;
	return path.resolve(cwd, expanded);
}
function resolveSandboxPath(params) {
	const resolved = resolveToCwd(params.filePath, params.cwd);
	const rootResolved = path.resolve(params.root);
	const relative = path.relative(rootResolved, resolved);
	if (!relative || relative === "") return {
		resolved,
		relative: ""
	};
	if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Path escapes sandbox root (${shortPath(rootResolved)}): ${params.filePath}`);
	return {
		resolved,
		relative
	};
}
async function assertSandboxPath(params) {
	const resolved = resolveSandboxPath(params);
	await assertNoSymlink(resolved.relative, path.resolve(params.root));
	return resolved;
}
function assertMediaNotDataUrl(media) {
	const raw = media.trim();
	if (DATA_URL_RE.test(raw)) throw new Error("data: URLs are not supported for media. Use buffer instead.");
}
async function resolveSandboxedMediaSource(params) {
	const raw = params.media.trim();
	if (!raw) return raw;
	if (HTTP_URL_RE.test(raw)) return raw;
	let candidate = raw;
	if (/^file:\/\//i.test(candidate)) try {
		candidate = fileURLToPath(candidate);
	} catch {
		throw new Error(`Invalid file:// URL for sandboxed media: ${raw}`);
	}
	return (await assertSandboxPath({
		filePath: candidate,
		cwd: params.sandboxRoot,
		root: params.sandboxRoot
	})).resolved;
}
async function assertNoSymlink(relative, root) {
	if (!relative) return;
	const parts = relative.split(path.sep).filter(Boolean);
	let current = root;
	for (const part of parts) {
		current = path.join(current, part);
		try {
			if ((await fs$1.lstat(current)).isSymbolicLink()) throw new Error(`Symlink not allowed in sandbox path: ${current}`);
		} catch (err) {
			if (err.code === "ENOENT") return;
			throw err;
		}
	}
}
function shortPath(value) {
	if (value.startsWith(os.homedir())) return `~${value.slice(os.homedir().length)}`;
	return value;
}

//#endregion
//#region src/agents/skills/bundled-dir.ts
function looksLikeSkillsDir(dir) {
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name.startsWith(".")) continue;
			const fullPath = path.join(dir, entry.name);
			if (entry.isFile() && entry.name.endsWith(".md")) return true;
			if (entry.isDirectory()) {
				if (fs.existsSync(path.join(fullPath, "SKILL.md"))) return true;
			}
		}
	} catch {
		return false;
	}
	return false;
}
function resolveBundledSkillsDir(opts = {}) {
	const override = process.env.OPENCLAW_BUNDLED_SKILLS_DIR?.trim();
	if (override) return override;
	try {
		const execPath = opts.execPath ?? process.execPath;
		const execDir = path.dirname(execPath);
		const sibling = path.join(execDir, "skills");
		if (fs.existsSync(sibling)) return sibling;
	} catch {}
	try {
		const moduleUrl = opts.moduleUrl ?? import.meta.url;
		const moduleDir = path.dirname(fileURLToPath(moduleUrl));
		const packageRoot = resolveOpenClawPackageRootSync({
			argv1: opts.argv1 ?? process.argv[1],
			moduleUrl,
			cwd: opts.cwd ?? process.cwd()
		});
		if (packageRoot) {
			const candidate = path.join(packageRoot, "skills");
			if (looksLikeSkillsDir(candidate)) return candidate;
		}
		let current = moduleDir;
		for (let depth = 0; depth < 6; depth += 1) {
			const candidate = path.join(current, "skills");
			if (looksLikeSkillsDir(candidate)) return candidate;
			const next = path.dirname(current);
			if (next === current) break;
			current = next;
		}
	} catch {}
}

//#endregion
//#region src/agents/skills/plugin-skills.ts
const log = createSubsystemLogger("skills");
function resolvePluginSkillDirs(params) {
	const workspaceDir = params.workspaceDir.trim();
	if (!workspaceDir) return [];
	const registry = loadPluginManifestRegistry({
		workspaceDir,
		config: params.config
	});
	if (registry.plugins.length === 0) return [];
	const normalizedPlugins = normalizePluginsConfig(params.config?.plugins);
	const memorySlot = normalizedPlugins.slots.memory;
	let selectedMemoryPluginId = null;
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const record of registry.plugins) {
		if (!record.skills || record.skills.length === 0) continue;
		if (!resolveEnableState(record.id, record.origin, normalizedPlugins).enabled) continue;
		const memoryDecision = resolveMemorySlotDecision({
			id: record.id,
			kind: record.kind,
			slot: memorySlot,
			selectedId: selectedMemoryPluginId
		});
		if (!memoryDecision.enabled) continue;
		if (memoryDecision.selected && record.kind === "memory") selectedMemoryPluginId = record.id;
		for (const raw of record.skills) {
			const trimmed = raw.trim();
			if (!trimmed) continue;
			const candidate = path.resolve(record.rootDir, trimmed);
			if (!fs.existsSync(candidate)) {
				log.warn(`plugin skill path not found (${record.id}): ${candidate}`);
				continue;
			}
			if (seen.has(candidate)) continue;
			seen.add(candidate);
			resolved.push(candidate);
		}
	}
	return resolved;
}

//#endregion
//#region src/agents/skills/serialize.ts
const SKILLS_SYNC_QUEUE = /* @__PURE__ */ new Map();
async function serializeByKey(key, task) {
	const next = (SKILLS_SYNC_QUEUE.get(key) ?? Promise.resolve()).then(task, task);
	SKILLS_SYNC_QUEUE.set(key, next);
	try {
		return await next;
	} finally {
		if (SKILLS_SYNC_QUEUE.get(key) === next) SKILLS_SYNC_QUEUE.delete(key);
	}
}

//#endregion
//#region src/agents/skills/workspace.ts
const fsp = fs.promises;
const skillsLogger = createSubsystemLogger("skills");
const skillCommandDebugOnce = /* @__PURE__ */ new Set();
function debugSkillCommandOnce(messageKey, message, meta) {
	if (skillCommandDebugOnce.has(messageKey)) return;
	skillCommandDebugOnce.add(messageKey);
	skillsLogger.debug(message, meta);
}
function filterSkillEntries(entries, config, skillFilter, eligibility) {
	let filtered = entries.filter((entry) => shouldIncludeSkill({
		entry,
		config,
		eligibility
	}));
	if (skillFilter !== void 0) {
		const normalized = skillFilter.map((entry) => String(entry).trim()).filter(Boolean);
		const label = normalized.length > 0 ? normalized.join(", ") : "(none)";
		console.log(`[skills] Applying skill filter: ${label}`);
		filtered = normalized.length > 0 ? filtered.filter((entry) => normalized.includes(entry.skill.name)) : [];
		console.log(`[skills] After filter: ${filtered.map((entry) => entry.skill.name).join(", ")}`);
	}
	return filtered;
}
const SKILL_COMMAND_MAX_LENGTH = 32;
const SKILL_COMMAND_FALLBACK = "skill";
const SKILL_COMMAND_DESCRIPTION_MAX_LENGTH = 100;
function sanitizeSkillCommandName(raw) {
	return raw.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "").slice(0, SKILL_COMMAND_MAX_LENGTH) || SKILL_COMMAND_FALLBACK;
}
function resolveUniqueSkillCommandName(base, used) {
	const normalizedBase = base.toLowerCase();
	if (!used.has(normalizedBase)) return base;
	for (let index = 2; index < 1e3; index += 1) {
		const suffix = `_${index}`;
		const maxBaseLength = Math.max(1, SKILL_COMMAND_MAX_LENGTH - suffix.length);
		const candidate = `${base.slice(0, maxBaseLength)}${suffix}`;
		const candidateKey = candidate.toLowerCase();
		if (!used.has(candidateKey)) return candidate;
	}
	return `${base.slice(0, Math.max(1, SKILL_COMMAND_MAX_LENGTH - 2))}_x`;
}
function loadSkillEntries(workspaceDir, opts) {
	const loadSkills = (params) => {
		const loaded = loadSkillsFromDir(params);
		if (Array.isArray(loaded)) return loaded;
		if (loaded && typeof loaded === "object" && "skills" in loaded && Array.isArray(loaded.skills)) return loaded.skills;
		return [];
	};
	const managedSkillsDir = opts?.managedSkillsDir ?? path.join(CONFIG_DIR, "skills");
	const workspaceSkillsDir = path.resolve(workspaceDir, "skills");
	const bundledSkillsDir = opts?.bundledSkillsDir ?? resolveBundledSkillsDir();
	const extraDirs = (opts?.config?.skills?.load?.extraDirs ?? []).map((d) => typeof d === "string" ? d.trim() : "").filter(Boolean);
	const pluginSkillDirs = resolvePluginSkillDirs({
		workspaceDir,
		config: opts?.config
	});
	const mergedExtraDirs = [...extraDirs, ...pluginSkillDirs];
	const bundledSkills = bundledSkillsDir ? loadSkills({
		dir: bundledSkillsDir,
		source: "openclaw-bundled"
	}) : [];
	const extraSkills = mergedExtraDirs.flatMap((dir) => {
		return loadSkills({
			dir: resolveUserPath(dir),
			source: "openclaw-extra"
		});
	});
	const managedSkills = loadSkills({
		dir: managedSkillsDir,
		source: "openclaw-managed"
	});
	const personalAgentsSkills = loadSkills({
		dir: path.resolve(os.homedir(), ".agents", "skills"),
		source: "agents-skills-personal"
	});
	const projectAgentsSkills = loadSkills({
		dir: path.resolve(workspaceDir, ".agents", "skills"),
		source: "agents-skills-project"
	});
	const workspaceSkills = loadSkills({
		dir: workspaceSkillsDir,
		source: "openclaw-workspace"
	});
	const merged = /* @__PURE__ */ new Map();
	for (const skill of extraSkills) merged.set(skill.name, skill);
	for (const skill of bundledSkills) merged.set(skill.name, skill);
	for (const skill of managedSkills) merged.set(skill.name, skill);
	for (const skill of personalAgentsSkills) merged.set(skill.name, skill);
	for (const skill of projectAgentsSkills) merged.set(skill.name, skill);
	for (const skill of workspaceSkills) merged.set(skill.name, skill);
	return Array.from(merged.values()).map((skill) => {
		let frontmatter = {};
		try {
			frontmatter = parseFrontmatter(fs.readFileSync(skill.filePath, "utf-8"));
		} catch {}
		return {
			skill,
			frontmatter,
			metadata: resolveOpenClawMetadata(frontmatter),
			invocation: resolveSkillInvocationPolicy(frontmatter)
		};
	});
}
function buildWorkspaceSkillSnapshot(workspaceDir, opts) {
	const eligible = filterSkillEntries(opts?.entries ?? loadSkillEntries(workspaceDir, opts), opts?.config, opts?.skillFilter, opts?.eligibility);
	const resolvedSkills = eligible.filter((entry) => entry.invocation?.disableModelInvocation !== true).map((entry) => entry.skill);
	return {
		prompt: [opts?.eligibility?.remote?.note?.trim(), formatSkillsForPrompt(resolvedSkills)].filter(Boolean).join("\n"),
		skills: eligible.map((entry) => ({
			name: entry.skill.name,
			primaryEnv: entry.metadata?.primaryEnv
		})),
		resolvedSkills,
		version: opts?.snapshotVersion
	};
}
function buildWorkspaceSkillsPrompt(workspaceDir, opts) {
	const promptEntries = filterSkillEntries(opts?.entries ?? loadSkillEntries(workspaceDir, opts), opts?.config, opts?.skillFilter, opts?.eligibility).filter((entry) => entry.invocation?.disableModelInvocation !== true);
	return [opts?.eligibility?.remote?.note?.trim(), formatSkillsForPrompt(promptEntries.map((entry) => entry.skill))].filter(Boolean).join("\n");
}
function resolveSkillsPromptForRun(params) {
	const snapshotPrompt = params.skillsSnapshot?.prompt?.trim();
	if (snapshotPrompt) return snapshotPrompt;
	if (params.entries && params.entries.length > 0) {
		const prompt = buildWorkspaceSkillsPrompt(params.workspaceDir, {
			entries: params.entries,
			config: params.config
		});
		return prompt.trim() ? prompt : "";
	}
	return "";
}
function loadWorkspaceSkillEntries(workspaceDir, opts) {
	return loadSkillEntries(workspaceDir, opts);
}
function resolveUniqueSyncedSkillDirName(base, used) {
	if (!used.has(base)) {
		used.add(base);
		return base;
	}
	for (let index = 2; index < 1e4; index += 1) {
		const candidate = `${base}-${index}`;
		if (!used.has(candidate)) {
			used.add(candidate);
			return candidate;
		}
	}
	let fallbackIndex = 1e4;
	let fallback = `${base}-${fallbackIndex}`;
	while (used.has(fallback)) {
		fallbackIndex += 1;
		fallback = `${base}-${fallbackIndex}`;
	}
	used.add(fallback);
	return fallback;
}
function resolveSyncedSkillDestinationPath(params) {
	const sourceDirName = path.basename(params.entry.skill.baseDir).trim();
	if (!sourceDirName || sourceDirName === "." || sourceDirName === "..") return null;
	return resolveSandboxPath({
		filePath: resolveUniqueSyncedSkillDirName(sourceDirName, params.usedDirNames),
		cwd: params.targetSkillsDir,
		root: params.targetSkillsDir
	}).resolved;
}
async function syncSkillsToWorkspace(params) {
	const sourceDir = resolveUserPath(params.sourceWorkspaceDir);
	const targetDir = resolveUserPath(params.targetWorkspaceDir);
	if (sourceDir === targetDir) return;
	await serializeByKey(`syncSkills:${targetDir}`, async () => {
		const targetSkillsDir = path.join(targetDir, "skills");
		const entries = loadSkillEntries(sourceDir, {
			config: params.config,
			managedSkillsDir: params.managedSkillsDir,
			bundledSkillsDir: params.bundledSkillsDir
		});
		await fsp.rm(targetSkillsDir, {
			recursive: true,
			force: true
		});
		await fsp.mkdir(targetSkillsDir, { recursive: true });
		const usedDirNames = /* @__PURE__ */ new Set();
		for (const entry of entries) {
			let dest = null;
			try {
				dest = resolveSyncedSkillDestinationPath({
					targetSkillsDir,
					entry,
					usedDirNames
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : JSON.stringify(error);
				console.warn(`[skills] Failed to resolve safe destination for ${entry.skill.name}: ${message}`);
				continue;
			}
			if (!dest) {
				console.warn(`[skills] Failed to resolve safe destination for ${entry.skill.name}: invalid source directory name`);
				continue;
			}
			try {
				await fsp.cp(entry.skill.baseDir, dest, {
					recursive: true,
					force: true
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : JSON.stringify(error);
				console.warn(`[skills] Failed to copy ${entry.skill.name} to sandbox: ${message}`);
			}
		}
	});
}
function buildWorkspaceSkillCommandSpecs(workspaceDir, opts) {
	const userInvocable = filterSkillEntries(opts?.entries ?? loadSkillEntries(workspaceDir, opts), opts?.config, opts?.skillFilter, opts?.eligibility).filter((entry) => entry.invocation?.userInvocable !== false);
	const used = /* @__PURE__ */ new Set();
	for (const reserved of opts?.reservedNames ?? []) used.add(reserved.toLowerCase());
	const specs = [];
	for (const entry of userInvocable) {
		const rawName = entry.skill.name;
		const base = sanitizeSkillCommandName(rawName);
		if (base !== rawName) debugSkillCommandOnce(`sanitize:${rawName}:${base}`, `Sanitized skill command name "${rawName}" to "/${base}".`, {
			rawName,
			sanitized: `/${base}`
		});
		const unique = resolveUniqueSkillCommandName(base, used);
		if (unique !== base) debugSkillCommandOnce(`dedupe:${rawName}:${unique}`, `De-duplicated skill command name for "${rawName}" to "/${unique}".`, {
			rawName,
			deduped: `/${unique}`
		});
		used.add(unique.toLowerCase());
		const rawDescription = entry.skill.description?.trim() || rawName;
		const description = rawDescription.length > SKILL_COMMAND_DESCRIPTION_MAX_LENGTH ? rawDescription.slice(0, SKILL_COMMAND_DESCRIPTION_MAX_LENGTH - 1) + "…" : rawDescription;
		const dispatch = (() => {
			const kindRaw = (entry.frontmatter?.["command-dispatch"] ?? entry.frontmatter?.["command_dispatch"] ?? "").trim().toLowerCase();
			if (!kindRaw) return;
			if (kindRaw !== "tool") return;
			const toolName = (entry.frontmatter?.["command-tool"] ?? entry.frontmatter?.["command_tool"] ?? "").trim();
			if (!toolName) {
				debugSkillCommandOnce(`dispatch:missingTool:${rawName}`, `Skill command "/${unique}" requested tool dispatch but did not provide command-tool. Ignoring dispatch.`, {
					skillName: rawName,
					command: unique
				});
				return;
			}
			const argModeRaw = (entry.frontmatter?.["command-arg-mode"] ?? entry.frontmatter?.["command_arg_mode"] ?? "").trim().toLowerCase();
			if (!(!argModeRaw || argModeRaw === "raw" ? "raw" : null)) debugSkillCommandOnce(`dispatch:badArgMode:${rawName}:${argModeRaw}`, `Skill command "/${unique}" requested tool dispatch but has unknown command-arg-mode. Falling back to raw.`, {
				skillName: rawName,
				command: unique,
				argMode: argModeRaw
			});
			return {
				kind: "tool",
				toolName,
				argMode: "raw"
			};
		})();
		specs.push({
			name: unique,
			skillName: rawName,
			description,
			...dispatch ? { dispatch } : {}
		});
	}
	return specs;
}

//#endregion
//#region src/agents/skills.ts
function resolveSkillsInstallPreferences(config) {
	const raw = config?.skills?.install;
	const preferBrew = raw?.preferBrew ?? true;
	const manager = (typeof raw?.nodeManager === "string" ? raw.nodeManager.trim() : "").toLowerCase();
	return {
		preferBrew,
		nodeManager: manager === "pnpm" || manager === "yarn" || manager === "bun" || manager === "npm" ? manager : "npm"
	};
}

//#endregion
export { parseFrontmatterBlock as S, isConfigPathTruthy as _, resolveSkillsPromptForRun as a, resolveSkillConfig as b, resolveBundledSkillsDir as c, resolveSandboxPath as d, resolveSandboxedMediaSource as f, isBundledSkillAllowed as g, hasBinary as h, loadWorkspaceSkillEntries as i, assertMediaNotDataUrl as l, applySkillEnvOverridesFromSnapshot as m, buildWorkspaceSkillCommandSpecs as n, syncSkillsToWorkspace as o, applySkillEnvOverrides as p, buildWorkspaceSkillSnapshot as r, resolvePluginSkillDirs as s, resolveSkillsInstallPreferences as t, assertSandboxPath as u, resolveBundledAllowlist as v, resolveSkillKey as x, resolveConfigPath as y };