import { a as parseBooleanValue } from "./entry.js";
import { t as CONFIG_DIR, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { a as MANIFEST_KEY, i as LEGACY_MANIFEST_KEYS } from "./manifest-registry-DlFh5LWe.js";
import { S as parseFrontmatterBlock } from "./skills-C1pxUa-I.js";
import path from "node:path";
import fs from "node:fs";
import JSON5 from "json5";
import { fileURLToPath } from "node:url";

//#region src/hooks/frontmatter.ts
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
	if (kind !== "bundled" && kind !== "npm" && kind !== "git") return;
	const spec = { kind };
	if (typeof raw.id === "string") spec.id = raw.id;
	if (typeof raw.label === "string") spec.label = raw.label;
	const bins = normalizeStringList(raw.bins);
	if (bins.length > 0) spec.bins = bins;
	if (typeof raw.package === "string") spec.package = raw.package;
	if (typeof raw.repository === "string") spec.repository = raw.repository;
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
		const eventsRaw = normalizeStringList(metadataObj.events);
		return {
			always: typeof metadataObj.always === "boolean" ? metadataObj.always : void 0,
			emoji: typeof metadataObj.emoji === "string" ? metadataObj.emoji : void 0,
			homepage: typeof metadataObj.homepage === "string" ? metadataObj.homepage : void 0,
			hookKey: typeof metadataObj.hookKey === "string" ? metadataObj.hookKey : void 0,
			export: typeof metadataObj.export === "string" ? metadataObj.export : void 0,
			os: osRaw.length > 0 ? osRaw : void 0,
			events: eventsRaw.length > 0 ? eventsRaw : [],
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
function resolveHookInvocationPolicy(frontmatter) {
	return { enabled: parseFrontmatterBool(getFrontmatterValue(frontmatter, "enabled"), true) };
}
function resolveHookKey$1(hookName, entry) {
	return entry?.metadata?.hookKey ?? hookName;
}

//#endregion
//#region src/hooks/config.ts
const DEFAULT_CONFIG_VALUES = {
	"browser.enabled": true,
	"browser.evaluateEnabled": true,
	"workspace.dir": true
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
function resolveHookConfig(config, hookKey) {
	const hooks = config?.hooks?.internal?.entries;
	if (!hooks || typeof hooks !== "object") return;
	const entry = hooks[hookKey];
	if (!entry || typeof entry !== "object") return;
	return entry;
}
function resolveRuntimePlatform() {
	return process.platform;
}
function hasBinary(bin) {
	const parts = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
	const extensions = process.platform === "win32" ? ["", ...(process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM").split(";").filter(Boolean)] : [""];
	for (const part of parts) for (const ext of extensions) {
		const candidate = path.join(part, bin + ext);
		try {
			fs.accessSync(candidate, fs.constants.X_OK);
			return true;
		} catch {}
	}
	return false;
}
function shouldIncludeHook(params) {
	const { entry, config, eligibility } = params;
	const hookConfig = resolveHookConfig(config, resolveHookKey$1(entry.hook.name, entry));
	const pluginManaged = entry.hook.source === "openclaw-plugin";
	const osList = entry.metadata?.os ?? [];
	const remotePlatforms = eligibility?.remote?.platforms ?? [];
	if (!pluginManaged && hookConfig?.enabled === false) return false;
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
		if (hookConfig?.env?.[envName]) continue;
		return false;
	}
	const requiredConfig = entry.metadata?.requires?.config ?? [];
	if (requiredConfig.length > 0) {
		for (const configPath of requiredConfig) if (!isConfigPathTruthy(config, configPath)) return false;
	}
	return true;
}

//#endregion
//#region src/hooks/bundled-dir.ts
function resolveBundledHooksDir() {
	const override = process.env.OPENCLAW_BUNDLED_HOOKS_DIR?.trim();
	if (override) return override;
	try {
		const execDir = path.dirname(process.execPath);
		const sibling = path.join(execDir, "hooks", "bundled");
		if (fs.existsSync(sibling)) return sibling;
	} catch {}
	try {
		const moduleDir = path.dirname(fileURLToPath(import.meta.url));
		const distBundled = path.join(moduleDir, "bundled");
		if (fs.existsSync(distBundled)) return distBundled;
	} catch {}
	try {
		const moduleDir = path.dirname(fileURLToPath(import.meta.url));
		const root = path.resolve(moduleDir, "..", "..");
		const srcBundled = path.join(root, "src", "hooks", "bundled");
		if (fs.existsSync(srcBundled)) return srcBundled;
	} catch {}
}

//#endregion
//#region src/hooks/workspace.ts
function readHookPackageManifest(dir) {
	const manifestPath = path.join(dir, "package.json");
	if (!fs.existsSync(manifestPath)) return null;
	try {
		const raw = fs.readFileSync(manifestPath, "utf-8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function resolvePackageHooks(manifest) {
	const raw = manifest[MANIFEST_KEY]?.hooks;
	if (!Array.isArray(raw)) return [];
	return raw.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
}
function loadHookFromDir(params) {
	const hookMdPath = path.join(params.hookDir, "HOOK.md");
	if (!fs.existsSync(hookMdPath)) return null;
	try {
		const frontmatter = parseFrontmatter(fs.readFileSync(hookMdPath, "utf-8"));
		const name = frontmatter.name || params.nameHint || path.basename(params.hookDir);
		const description = frontmatter.description || "";
		const handlerCandidates = [
			"handler.ts",
			"handler.js",
			"index.ts",
			"index.js"
		];
		let handlerPath;
		for (const candidate of handlerCandidates) {
			const candidatePath = path.join(params.hookDir, candidate);
			if (fs.existsSync(candidatePath)) {
				handlerPath = candidatePath;
				break;
			}
		}
		if (!handlerPath) {
			console.warn(`[hooks] Hook "${name}" has HOOK.md but no handler file in ${params.hookDir}`);
			return null;
		}
		return {
			name,
			description,
			source: params.source,
			pluginId: params.pluginId,
			filePath: hookMdPath,
			baseDir: params.hookDir,
			handlerPath
		};
	} catch (err) {
		console.warn(`[hooks] Failed to load hook from ${params.hookDir}:`, err);
		return null;
	}
}
/**
* Scan a directory for hooks (subdirectories containing HOOK.md)
*/
function loadHooksFromDir(params) {
	const { dir, source, pluginId } = params;
	if (!fs.existsSync(dir)) return [];
	if (!fs.statSync(dir).isDirectory()) return [];
	const hooks = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const hookDir = path.join(dir, entry.name);
		const manifest = readHookPackageManifest(hookDir);
		const packageHooks = manifest ? resolvePackageHooks(manifest) : [];
		if (packageHooks.length > 0) {
			for (const hookPath of packageHooks) {
				const resolvedHookDir = path.resolve(hookDir, hookPath);
				const hook = loadHookFromDir({
					hookDir: resolvedHookDir,
					source,
					pluginId,
					nameHint: path.basename(resolvedHookDir)
				});
				if (hook) hooks.push(hook);
			}
			continue;
		}
		const hook = loadHookFromDir({
			hookDir,
			source,
			pluginId,
			nameHint: entry.name
		});
		if (hook) hooks.push(hook);
	}
	return hooks;
}
function loadHookEntries(workspaceDir, opts) {
	const managedHooksDir = opts?.managedHooksDir ?? path.join(CONFIG_DIR, "hooks");
	const workspaceHooksDir = path.join(workspaceDir, "hooks");
	const bundledHooksDir = opts?.bundledHooksDir ?? resolveBundledHooksDir();
	const extraDirs = (opts?.config?.hooks?.internal?.load?.extraDirs ?? []).map((d) => typeof d === "string" ? d.trim() : "").filter(Boolean);
	const bundledHooks = bundledHooksDir ? loadHooksFromDir({
		dir: bundledHooksDir,
		source: "openclaw-bundled"
	}) : [];
	const extraHooks = extraDirs.flatMap((dir) => {
		return loadHooksFromDir({
			dir: resolveUserPath(dir),
			source: "openclaw-workspace"
		});
	});
	const managedHooks = loadHooksFromDir({
		dir: managedHooksDir,
		source: "openclaw-managed"
	});
	const workspaceHooks = loadHooksFromDir({
		dir: workspaceHooksDir,
		source: "openclaw-workspace"
	});
	const merged = /* @__PURE__ */ new Map();
	for (const hook of extraHooks) merged.set(hook.name, hook);
	for (const hook of bundledHooks) merged.set(hook.name, hook);
	for (const hook of managedHooks) merged.set(hook.name, hook);
	for (const hook of workspaceHooks) merged.set(hook.name, hook);
	return Array.from(merged.values()).map((hook) => {
		let frontmatter = {};
		try {
			frontmatter = parseFrontmatter(fs.readFileSync(hook.filePath, "utf-8"));
		} catch {}
		return {
			hook,
			frontmatter,
			metadata: resolveOpenClawMetadata(frontmatter),
			invocation: resolveHookInvocationPolicy(frontmatter)
		};
	});
}
function loadWorkspaceHookEntries(workspaceDir, opts) {
	return loadHookEntries(workspaceDir, opts);
}

//#endregion
//#region src/hooks/hooks-status.ts
function resolveHookKey(entry) {
	return entry.metadata?.hookKey ?? entry.hook.name;
}
function normalizeInstallOptions(entry) {
	const install = entry.metadata?.install ?? [];
	if (install.length === 0) return [];
	return install.map((spec, index) => {
		const id = (spec.id ?? `${spec.kind}-${index}`).trim();
		const bins = spec.bins ?? [];
		let label = (spec.label ?? "").trim();
		if (!label) if (spec.kind === "bundled") label = "Bundled with OpenClaw";
		else if (spec.kind === "npm" && spec.package) label = `Install ${spec.package} (npm)`;
		else if (spec.kind === "git" && spec.repository) label = `Install from ${spec.repository}`;
		else label = "Run installer";
		return {
			id,
			kind: spec.kind,
			label,
			bins
		};
	});
}
function buildHookStatus(entry, config, eligibility) {
	const hookKey = resolveHookKey(entry);
	const hookConfig = resolveHookConfig(config, hookKey);
	const managedByPlugin = entry.hook.source === "openclaw-plugin";
	const disabled = managedByPlugin ? false : hookConfig?.enabled === false;
	const always = entry.metadata?.always === true;
	const emoji = entry.metadata?.emoji ?? entry.frontmatter.emoji;
	const homepageRaw = entry.metadata?.homepage ?? entry.frontmatter.homepage ?? entry.frontmatter.website ?? entry.frontmatter.url;
	const homepage = homepageRaw?.trim() ? homepageRaw.trim() : void 0;
	const events = entry.metadata?.events ?? [];
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
		if (hookConfig?.env?.[envName]) continue;
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
	const eligible = !disabled && (always || missing.bins.length === 0 && missing.anyBins.length === 0 && missing.env.length === 0 && missing.config.length === 0 && missing.os.length === 0);
	return {
		name: entry.hook.name,
		description: entry.hook.description,
		source: entry.hook.source,
		pluginId: entry.hook.pluginId,
		filePath: entry.hook.filePath,
		baseDir: entry.hook.baseDir,
		handlerPath: entry.hook.handlerPath,
		hookKey,
		emoji,
		homepage,
		events,
		always,
		disabled,
		eligible,
		managedByPlugin,
		requirements: {
			bins: requiredBins,
			anyBins: requiredAnyBins,
			env: requiredEnv,
			config: requiredConfig,
			os: requiredOs
		},
		missing,
		configChecks,
		install: normalizeInstallOptions(entry)
	};
}
function buildWorkspaceHookStatus(workspaceDir, opts) {
	return {
		workspaceDir,
		managedHooksDir: opts?.managedHooksDir ?? path.join(CONFIG_DIR, "hooks"),
		hooks: (opts?.entries ?? loadWorkspaceHookEntries(workspaceDir, opts)).map((entry) => buildHookStatus(entry, opts?.config, opts?.eligibility))
	};
}

//#endregion
export { parseFrontmatter as a, shouldIncludeHook as i, loadWorkspaceHookEntries as n, resolveHookConfig as r, buildWorkspaceHookStatus as t };