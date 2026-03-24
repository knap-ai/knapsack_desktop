import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { t as CONFIG_DIR, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { x as normalizeSkillFilter } from "./agent-scope-bjWqU22i.js";
import { s as isPathInside } from "./boundary-path-Dm0QJ7-y.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-DcZxlWD8.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-DqTSxvim.js";
import { r as isPathInsideWithRealpath } from "./scan-paths-DKkCswtk.js";
import { a as normalizePluginsConfig, o as resolveEffectiveEnableState, s as resolveMemorySlotDecision } from "./config-state-Br0ucqMb.js";
import { d as mergeBundlePathLists, f as normalizeBundlePathList, o as CLAUDE_BUNDLE_MANIFEST_RELATIVE_PATH } from "./min-host-version-RMBWtIAR.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-B5JNQdOM.js";
import { i as resolveSandboxPath } from "./sandbox-paths-Cn8i8Jxm.js";
import { u as parseFrontmatterBlock } from "./frontmatter-CP5371Rm.js";
import { d as resolveOpenClawMetadata, f as resolveSkillInvocationPolicy, l as shouldIncludeSkill, u as parseFrontmatter } from "./env-overrides-BNSo89u5.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { formatSkillsForPrompt, loadSkillsFromDir } from "@mariozechner/pi-coding-agent";
//#region src/plugins/bundle-commands.ts
function parseFrontmatterBool(value, fallback) {
	if (typeof value !== "string") return fallback;
	const normalized = value.trim().toLowerCase();
	if (normalized === "true" || normalized === "yes" || normalized === "1") return true;
	if (normalized === "false" || normalized === "no" || normalized === "0") return false;
	return fallback;
}
function stripFrontmatter(content) {
	const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
	if (!normalized.startsWith("---")) return normalized.trim();
	const endIndex = normalized.indexOf("\n---", 3);
	if (endIndex === -1) return normalized.trim();
	return normalized.slice(endIndex + 4).trim();
}
function readClaudeBundleManifest(rootDir) {
	const opened = openBoundaryFileSync({
		absolutePath: path.join(rootDir, CLAUDE_BUNDLE_MANIFEST_RELATIVE_PATH),
		rootPath: rootDir,
		boundaryLabel: "plugin root",
		rejectHardlinks: true
	});
	if (!opened.ok) return {};
	try {
		const raw = JSON.parse(fs.readFileSync(opened.fd, "utf-8"));
		return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
	} catch {
		return {};
	} finally {
		fs.closeSync(opened.fd);
	}
}
function resolveClaudeCommandRootDirs(rootDir) {
	const declared = normalizeBundlePathList(readClaudeBundleManifest(rootDir).commands);
	return mergeBundlePathLists(fs.existsSync(path.join(rootDir, "commands")) ? ["commands"] : [], declared);
}
function listMarkdownFilesRecursive(rootDir) {
	const pending = [rootDir];
	const files = [];
	while (pending.length > 0) {
		const current = pending.pop();
		if (!current) continue;
		let entries;
		try {
			entries = fs.readdirSync(current, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			if (entry.name.startsWith(".")) continue;
			const fullPath = path.join(current, entry.name);
			if (entry.isDirectory()) {
				pending.push(fullPath);
				continue;
			}
			if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(fullPath);
		}
	}
	return files.toSorted((a, b) => a.localeCompare(b));
}
function toDefaultCommandName(rootDir, filePath) {
	return path.relative(rootDir, filePath).replace(/\.[^.]+$/u, "").split(path.sep).join(":");
}
function toDefaultDescription(rawName, promptTemplate) {
	return promptTemplate.split(/\r?\n/u).map((line) => line.trim()).find(Boolean) || rawName;
}
function loadBundleCommandsFromRoot(params) {
	const entries = [];
	for (const filePath of listMarkdownFilesRecursive(params.commandRoot)) {
		let raw;
		try {
			raw = fs.readFileSync(filePath, "utf-8");
		} catch {
			continue;
		}
		const frontmatter = parseFrontmatterBlock(raw);
		if (parseFrontmatterBool(frontmatter["disable-model-invocation"], false)) continue;
		const promptTemplate = stripFrontmatter(raw);
		if (!promptTemplate) continue;
		const rawName = (frontmatter.name?.trim() || toDefaultCommandName(params.commandRoot, filePath)).trim();
		if (!rawName) continue;
		const description = frontmatter.description?.trim() || toDefaultDescription(rawName, promptTemplate);
		entries.push({
			pluginId: params.pluginId,
			rawName,
			description,
			promptTemplate,
			sourceFilePath: filePath
		});
	}
	return entries;
}
function loadEnabledClaudeBundleCommands(params) {
	const registry = loadPluginManifestRegistry({
		workspaceDir: params.workspaceDir,
		config: params.cfg
	});
	const normalizedPlugins = normalizePluginsConfig(params.cfg?.plugins);
	const commands = [];
	for (const record of registry.plugins) {
		if (record.format !== "bundle" || record.bundleFormat !== "claude" || !(record.bundleCapabilities ?? []).includes("commands")) continue;
		if (!resolveEffectiveEnableState({
			id: record.id,
			origin: record.origin,
			config: normalizedPlugins,
			rootConfig: params.cfg
		}).enabled) continue;
		for (const relativeRoot of resolveClaudeCommandRootDirs(record.rootDir)) {
			const commandRoot = path.resolve(record.rootDir, relativeRoot);
			if (!fs.existsSync(commandRoot)) continue;
			if (!isPathInsideWithRealpath(record.rootDir, commandRoot, { requireRealpath: true })) continue;
			commands.push(...loadBundleCommandsFromRoot({
				pluginId: record.id,
				commandRoot
			}));
		}
	}
	return commands;
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
	const workspaceDir = (params.workspaceDir ?? "").trim();
	if (!workspaceDir) return [];
	const registry = loadPluginManifestRegistry({
		workspaceDir,
		config: params.config
	});
	if (registry.plugins.length === 0) return [];
	const normalizedPlugins = normalizePluginsConfig(params.config?.plugins);
	const acpEnabled = params.config?.acp?.enabled !== false;
	const memorySlot = normalizedPlugins.slots.memory;
	let selectedMemoryPluginId = null;
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const record of registry.plugins) {
		if (!record.skills || record.skills.length === 0) continue;
		if (!resolveEffectiveEnableState({
			id: record.id,
			origin: record.origin,
			config: normalizedPlugins,
			rootConfig: params.config
		}).enabled) continue;
		if (!acpEnabled && record.id === "acpx") continue;
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
			if (!isPathInsideWithRealpath(record.rootDir, candidate, { requireRealpath: true })) {
				log.warn(`plugin skill path escapes plugin root (${record.id}): ${candidate}`);
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
/**
* Replace the user's home directory prefix with `~` in skill file paths
* to reduce system prompt token usage. Models understand `~` expansion,
* and the read tool resolves `~` to the home directory.
*
* Example: `/Users/alice/.bun/.../skills/github/SKILL.md`
*       → `~/.bun/.../skills/github/SKILL.md`
*
* Saves ~5–6 tokens per skill path × N skills ≈ 400–600 tokens total.
*/
function compactSkillPaths(skills) {
	const home = os.homedir();
	if (!home) return skills;
	const prefix = home.endsWith(path.sep) ? home : home + path.sep;
	return skills.map((s) => ({
		...s,
		filePath: s.filePath.startsWith(prefix) ? "~/" + s.filePath.slice(prefix.length) : s.filePath
	}));
}
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
		const normalized = normalizeSkillFilter(skillFilter) ?? [];
		const label = normalized.length > 0 ? normalized.join(", ") : "(none)";
		skillsLogger.debug(`Applying skill filter: ${label}`);
		filtered = normalized.length > 0 ? filtered.filter((entry) => normalized.includes(entry.skill.name)) : [];
		skillsLogger.debug(`After skill filter: ${filtered.map((entry) => entry.skill.name).join(", ") || "(none)"}`);
	}
	return filtered;
}
const SKILL_COMMAND_MAX_LENGTH = 32;
const SKILL_COMMAND_FALLBACK = "skill";
const SKILL_COMMAND_DESCRIPTION_MAX_LENGTH = 100;
const DEFAULT_MAX_CANDIDATES_PER_ROOT = 300;
const DEFAULT_MAX_SKILLS_LOADED_PER_SOURCE = 200;
const DEFAULT_MAX_SKILLS_IN_PROMPT = 150;
const DEFAULT_MAX_SKILLS_PROMPT_CHARS = 3e4;
const DEFAULT_MAX_SKILL_FILE_BYTES = 256e3;
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
function resolveSkillsLimits(config) {
	const limits = config?.skills?.limits;
	return {
		maxCandidatesPerRoot: limits?.maxCandidatesPerRoot ?? DEFAULT_MAX_CANDIDATES_PER_ROOT,
		maxSkillsLoadedPerSource: limits?.maxSkillsLoadedPerSource ?? DEFAULT_MAX_SKILLS_LOADED_PER_SOURCE,
		maxSkillsInPrompt: limits?.maxSkillsInPrompt ?? DEFAULT_MAX_SKILLS_IN_PROMPT,
		maxSkillsPromptChars: limits?.maxSkillsPromptChars ?? DEFAULT_MAX_SKILLS_PROMPT_CHARS,
		maxSkillFileBytes: limits?.maxSkillFileBytes ?? DEFAULT_MAX_SKILL_FILE_BYTES
	};
}
function listChildDirectories(dir) {
	try {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		const dirs = [];
		for (const entry of entries) {
			if (entry.name.startsWith(".")) continue;
			if (entry.name === "node_modules") continue;
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				dirs.push(entry.name);
				continue;
			}
			if (entry.isSymbolicLink()) try {
				if (fs.statSync(fullPath).isDirectory()) dirs.push(entry.name);
			} catch {}
		}
		return dirs;
	} catch {
		return [];
	}
}
function tryRealpath(filePath) {
	try {
		return fs.realpathSync(filePath);
	} catch {
		return null;
	}
}
function warnEscapedSkillPath(params) {
	skillsLogger.warn("Skipping skill path that resolves outside its configured root.", {
		source: params.source,
		rootDir: params.rootDir,
		path: params.candidatePath,
		realPath: params.candidateRealPath
	});
}
function resolveContainedSkillPath(params) {
	const candidateRealPath = tryRealpath(params.candidatePath);
	if (!candidateRealPath) return null;
	if (isPathInside(params.rootRealPath, candidateRealPath)) return candidateRealPath;
	warnEscapedSkillPath({
		source: params.source,
		rootDir: params.rootDir,
		candidatePath: path.resolve(params.candidatePath),
		candidateRealPath
	});
	return null;
}
function filterLoadedSkillsInsideRoot(params) {
	return params.skills.filter((skill) => {
		if (!resolveContainedSkillPath({
			source: params.source,
			rootDir: params.rootDir,
			rootRealPath: params.rootRealPath,
			candidatePath: skill.baseDir
		})) return false;
		const skillFileRealPath = resolveContainedSkillPath({
			source: params.source,
			rootDir: params.rootDir,
			rootRealPath: params.rootRealPath,
			candidatePath: skill.filePath
		});
		return Boolean(skillFileRealPath);
	});
}
function resolveNestedSkillsRoot(dir, opts) {
	const nested = path.join(dir, "skills");
	try {
		if (!fs.existsSync(nested) || !fs.statSync(nested).isDirectory()) return { baseDir: dir };
	} catch {
		return { baseDir: dir };
	}
	const nestedDirs = listChildDirectories(nested);
	const scanLimit = Math.max(0, opts?.maxEntriesToScan ?? 100);
	const toScan = scanLimit === 0 ? [] : nestedDirs.slice(0, Math.min(nestedDirs.length, scanLimit));
	for (const name of toScan) {
		const skillMd = path.join(nested, name, "SKILL.md");
		if (fs.existsSync(skillMd)) return {
			baseDir: nested,
			note: `Detected nested skills root at ${nested}`
		};
	}
	return { baseDir: dir };
}
function unwrapLoadedSkills(loaded) {
	if (Array.isArray(loaded)) return loaded;
	if (loaded && typeof loaded === "object" && "skills" in loaded) {
		const skills = loaded.skills;
		if (Array.isArray(skills)) return skills;
	}
	return [];
}
function loadSkillEntries(workspaceDir, opts) {
	const limits = resolveSkillsLimits(opts?.config);
	const loadSkills = (params) => {
		const rootDir = path.resolve(params.dir);
		const rootRealPath = tryRealpath(rootDir) ?? rootDir;
		const baseDir = resolveNestedSkillsRoot(params.dir, { maxEntriesToScan: limits.maxCandidatesPerRoot }).baseDir;
		const baseDirRealPath = resolveContainedSkillPath({
			source: params.source,
			rootDir,
			rootRealPath,
			candidatePath: baseDir
		});
		if (!baseDirRealPath) return [];
		const rootSkillMd = path.join(baseDir, "SKILL.md");
		if (fs.existsSync(rootSkillMd)) {
			const rootSkillRealPath = resolveContainedSkillPath({
				source: params.source,
				rootDir,
				rootRealPath: baseDirRealPath,
				candidatePath: rootSkillMd
			});
			if (!rootSkillRealPath) return [];
			try {
				const size = fs.statSync(rootSkillRealPath).size;
				if (size > limits.maxSkillFileBytes) {
					skillsLogger.warn("Skipping skills root due to oversized SKILL.md.", {
						dir: baseDir,
						filePath: rootSkillMd,
						size,
						maxSkillFileBytes: limits.maxSkillFileBytes
					});
					return [];
				}
			} catch {
				return [];
			}
			return filterLoadedSkillsInsideRoot({
				skills: unwrapLoadedSkills(loadSkillsFromDir({
					dir: baseDir,
					source: params.source
				})),
				source: params.source,
				rootDir,
				rootRealPath: baseDirRealPath
			});
		}
		const childDirs = listChildDirectories(baseDir);
		const suspicious = childDirs.length > limits.maxCandidatesPerRoot;
		const maxCandidates = Math.max(0, limits.maxSkillsLoadedPerSource);
		const limitedChildren = childDirs.slice().sort().slice(0, maxCandidates);
		if (suspicious) skillsLogger.warn("Skills root looks suspiciously large, truncating discovery.", {
			dir: params.dir,
			baseDir,
			childDirCount: childDirs.length,
			maxCandidatesPerRoot: limits.maxCandidatesPerRoot,
			maxSkillsLoadedPerSource: limits.maxSkillsLoadedPerSource
		});
		else if (childDirs.length > maxCandidates) skillsLogger.warn("Skills root has many entries, truncating discovery.", {
			dir: params.dir,
			baseDir,
			childDirCount: childDirs.length,
			maxSkillsLoadedPerSource: limits.maxSkillsLoadedPerSource
		});
		const loadedSkills = [];
		for (const name of limitedChildren) {
			const skillDir = path.join(baseDir, name);
			if (!resolveContainedSkillPath({
				source: params.source,
				rootDir,
				rootRealPath: baseDirRealPath,
				candidatePath: skillDir
			})) continue;
			const skillMd = path.join(skillDir, "SKILL.md");
			if (!fs.existsSync(skillMd)) continue;
			const skillMdRealPath = resolveContainedSkillPath({
				source: params.source,
				rootDir,
				rootRealPath: baseDirRealPath,
				candidatePath: skillMd
			});
			if (!skillMdRealPath) continue;
			try {
				const size = fs.statSync(skillMdRealPath).size;
				if (size > limits.maxSkillFileBytes) {
					skillsLogger.warn("Skipping skill due to oversized SKILL.md.", {
						skill: name,
						filePath: skillMd,
						size,
						maxSkillFileBytes: limits.maxSkillFileBytes
					});
					continue;
				}
			} catch {
				continue;
			}
			const loaded = loadSkillsFromDir({
				dir: skillDir,
				source: params.source
			});
			loadedSkills.push(...filterLoadedSkillsInsideRoot({
				skills: unwrapLoadedSkills(loaded),
				source: params.source,
				rootDir,
				rootRealPath: baseDirRealPath
			}));
			if (loadedSkills.length >= limits.maxSkillsLoadedPerSource) break;
		}
		if (loadedSkills.length > limits.maxSkillsLoadedPerSource) return loadedSkills.slice().sort((a, b) => a.name.localeCompare(b.name)).slice(0, limits.maxSkillsLoadedPerSource);
		return loadedSkills;
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
function escapeXml(str) {
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
/**
* Compact skill catalog: name + location only (no description).
* Used as a fallback when the full format exceeds the char budget,
* preserving awareness of all skills before resorting to dropping.
*/
function formatSkillsCompact(skills) {
	const visible = skills.filter((s) => !s.disableModelInvocation);
	if (visible.length === 0) return "";
	const lines = [
		"\n\nThe following skills provide specialized instructions for specific tasks.",
		"Use the read tool to load a skill's file when the task matches its name.",
		"When a skill file references a relative path, resolve it against the skill directory (parent of SKILL.md / dirname of the path) and use that absolute path in tool commands.",
		"",
		"<available_skills>"
	];
	for (const skill of visible) {
		lines.push("  <skill>");
		lines.push(`    <name>${escapeXml(skill.name)}</name>`);
		lines.push(`    <location>${escapeXml(skill.filePath)}</location>`);
		lines.push("  </skill>");
	}
	lines.push("</available_skills>");
	return lines.join("\n");
}
const COMPACT_WARNING_OVERHEAD = 150;
function applySkillsPromptLimits(params) {
	const limits = resolveSkillsLimits(params.config);
	const total = params.skills.length;
	const byCount = params.skills.slice(0, Math.max(0, limits.maxSkillsInPrompt));
	let skillsForPrompt = byCount;
	let truncated = total > byCount.length;
	let compact = false;
	const fitsFull = (skills) => formatSkillsForPrompt(skills).length <= limits.maxSkillsPromptChars;
	const compactBudget = limits.maxSkillsPromptChars - COMPACT_WARNING_OVERHEAD;
	const fitsCompact = (skills) => formatSkillsCompact(skills).length <= compactBudget;
	if (!fitsFull(skillsForPrompt)) if (fitsCompact(skillsForPrompt)) compact = true;
	else {
		compact = true;
		let lo = 0;
		let hi = skillsForPrompt.length;
		while (lo < hi) {
			const mid = Math.ceil((lo + hi) / 2);
			if (fitsCompact(skillsForPrompt.slice(0, mid))) lo = mid;
			else hi = mid - 1;
		}
		skillsForPrompt = skillsForPrompt.slice(0, lo);
		truncated = true;
	}
	return {
		skillsForPrompt,
		truncated,
		compact
	};
}
function buildWorkspaceSkillSnapshot(workspaceDir, opts) {
	const { eligible, prompt, resolvedSkills } = resolveWorkspaceSkillPromptState(workspaceDir, opts);
	const skillFilter = normalizeSkillFilter(opts?.skillFilter);
	return {
		prompt,
		skills: eligible.map((entry) => ({
			name: entry.skill.name,
			primaryEnv: entry.metadata?.primaryEnv,
			requiredEnv: entry.metadata?.requires?.env?.slice()
		})),
		...skillFilter === void 0 ? {} : { skillFilter },
		resolvedSkills,
		version: opts?.snapshotVersion
	};
}
function buildWorkspaceSkillsPrompt(workspaceDir, opts) {
	return resolveWorkspaceSkillPromptState(workspaceDir, opts).prompt;
}
function resolveWorkspaceSkillPromptState(workspaceDir, opts) {
	const eligible = filterSkillEntries(opts?.entries ?? loadSkillEntries(workspaceDir, opts), opts?.config, opts?.skillFilter, opts?.eligibility);
	const promptEntries = eligible.filter((entry) => entry.invocation?.disableModelInvocation !== true);
	const remoteNote = opts?.eligibility?.remote?.note?.trim();
	const resolvedSkills = promptEntries.map((entry) => entry.skill);
	const { skillsForPrompt, truncated, compact } = applySkillsPromptLimits({
		skills: compactSkillPaths(resolvedSkills),
		config: opts?.config
	});
	return {
		eligible,
		prompt: [
			remoteNote,
			truncated ? `⚠️ Skills truncated: included ${skillsForPrompt.length} of ${resolvedSkills.length}${compact ? " (compact format, descriptions omitted)" : ""}. Run \`openclaw skills check\` to audit.` : compact ? `⚠️ Skills catalog using compact format (descriptions omitted). Run \`openclaw skills check\` to audit.` : "",
			compact ? formatSkillsCompact(skillsForPrompt) : formatSkillsForPrompt(skillsForPrompt)
		].filter(Boolean).join("\n"),
		resolvedSkills
	};
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
				skillsLogger.warn(`Failed to resolve safe destination for ${entry.skill.name}: ${message}`);
				continue;
			}
			if (!dest) {
				skillsLogger.warn(`Failed to resolve safe destination for ${entry.skill.name}: invalid source directory name`);
				continue;
			}
			try {
				await fsp.cp(entry.skill.baseDir, dest, {
					recursive: true,
					force: true
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : JSON.stringify(error);
				skillsLogger.warn(`Failed to copy ${entry.skill.name} to sandbox: ${message}`);
			}
		}
	});
}
function filterWorkspaceSkillEntries(entries, config) {
	return filterSkillEntries(entries, config);
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
	const bundleCommands = loadEnabledClaudeBundleCommands({
		workspaceDir,
		cfg: opts?.config
	});
	for (const entry of bundleCommands) {
		const base = sanitizeSkillCommandName(entry.rawName);
		if (base !== entry.rawName) debugSkillCommandOnce(`bundle-sanitize:${entry.rawName}:${base}`, `Sanitized bundle command name "${entry.rawName}" to "/${base}".`, {
			rawName: entry.rawName,
			sanitized: `/${base}`
		});
		const unique = resolveUniqueSkillCommandName(base, used);
		if (unique !== base) debugSkillCommandOnce(`bundle-dedupe:${entry.rawName}:${unique}`, `De-duplicated bundle command name for "${entry.rawName}" to "/${unique}".`, {
			rawName: entry.rawName,
			deduped: `/${unique}`
		});
		used.add(unique.toLowerCase());
		const description = entry.description.length > SKILL_COMMAND_DESCRIPTION_MAX_LENGTH ? entry.description.slice(0, SKILL_COMMAND_DESCRIPTION_MAX_LENGTH - 1) + "…" : entry.description;
		specs.push({
			name: unique,
			skillName: entry.rawName,
			description,
			promptTemplate: entry.promptTemplate,
			sourceFilePath: entry.sourceFilePath
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
export { filterWorkspaceSkillEntries as a, syncSkillsToWorkspace as c, buildWorkspaceSkillsPrompt as i, resolvePluginSkillDirs as l, buildWorkspaceSkillCommandSpecs as n, loadWorkspaceSkillEntries as o, buildWorkspaceSkillSnapshot as r, resolveSkillsPromptForRun as s, resolveSkillsInstallPreferences as t, resolveBundledSkillsDir as u };
