import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { h as resolveOAuthDir } from "./paths-Dvv9VRAc.js";
import { i as safeStat, n as formatPermissionRemediation, r as inspectPathPermissions, t as formatPermissionDetail } from "./audit-fs-Cma03vGs.js";
import { n as isPathInside, t as extensionUsesSkippedScannerPath } from "./scan-paths-DTbstpEd.js";
import { n as MANIFEST_KEY } from "./legacy-names-C9DuzOy_.js";
import { c as normalizeAgentId } from "./session-key-Bh1lMwK5.js";
import { r as listChannelPlugins } from "./registry-Delpa74L.js";
import { x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import { a as normalizePluginsConfig, i as normalizePluginId } from "./config-state-CcN3bZ9D.js";
import "./plugins-D4ODSIPT.js";
import { u as resolveToolProfilePolicy } from "./tool-policy-C3rJHw58.js";
import { f as SANDBOX_BROWSER_SECURITY_HASH_EPOCH, n as resolveSandboxConfigForAgent, o as resolveSandboxToolPolicyForAgent } from "./config-CWqq9_ZP.js";
import { r as pickSandboxToolPolicy, t as isToolAllowedByPolicies } from "./tool-policy-match-Cu6gJ6QQ.js";
import { r as resolveSkillSource } from "./sanitize-env-vars-Og3CRoPL.js";
import { t as listAgentWorkspaceDirs } from "./workspace-dirs-BwQC27rz.js";
import { a as execDockerRaw } from "./docker-mSot2cJh.js";
import { t as inspectReadOnlyChannelAccount } from "./read-only-account-inspect-BiLlFb9q.js";
import { r as resolveNativeSkillsEnabled } from "./commands-DUdqxNgn.js";
import { n as readInstalledPackageVersion } from "./package-update-utils-Dwl4Go6_.js";
import { t as collectIncludePathsRecursive } from "./includes-scan-KZrWz8AJ.js";
import { t as scanDirectoryWithSummary } from "./skill-scanner-Ym9bcY2E.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/security/audit-extra.async.ts
/**
* Asynchronous security audit collector functions.
*
* These functions perform I/O (filesystem, config reads) to detect security issues.
*/
const MAX_WORKSPACE_SKILL_SCAN_FILES_PER_WORKSPACE = 2e3;
const MAX_WORKSPACE_SKILL_ESCAPE_DETAIL_ROWS = 12;
/**
* Resolves the realpath of `p` with a 2 s timeout.
*
* Returns the realpath string on success, or `null` if realpath fails or the
* timeout fires first. Note: fs.realpath cannot be cancelled once submitted to
* libuv — the underlying OS call continues running in the background after the
* timeout resolves. Callers make sequential (not concurrent) calls so at most
* one libuv thread is occupied at a time; the OS will eventually time out the
* stuck NFS/SMB call independently.
*
* Timer cleanup: when realpath resolves before the deadline the timer is
* cleared immediately so it does not linger across the rest of the audit run.
* The timer is also unref'd so it cannot prevent process exit even if it fires
* late (e.g. the process finishes while a hang is still in-flight).
*/
function realpathWithTimeout(p, timeoutMs = 2e3) {
	let timerHandle;
	const realpathPromise = fs.realpath(p).catch(() => null).then((result) => {
		clearTimeout(timerHandle);
		return result;
	});
	const timeoutPromise = new Promise((resolve) => {
		timerHandle = setTimeout(() => resolve(null), timeoutMs);
		timerHandle.unref?.();
	});
	return Promise.race([realpathPromise, timeoutPromise]);
}
let skillsModulePromise;
let configModulePromise;
function loadSkillsModule() {
	skillsModulePromise ??= import("./skills-BKO8nz5u.js");
	return skillsModulePromise;
}
function loadConfigModule() {
	configModulePromise ??= import("./config-D5wLb3ev.js");
	return configModulePromise;
}
function expandTilde(p, env) {
	if (!p.startsWith("~")) return p;
	const home = normalizeOptionalString(env.HOME) ?? null;
	if (!home) return null;
	if (p === "~") return home;
	if (p.startsWith("~/") || p.startsWith("~\\")) return path.join(home, p.slice(2));
	return null;
}
async function readPluginManifestExtensions(pluginPath) {
	const manifestPath = path.join(pluginPath, "package.json");
	const raw = await fs.readFile(manifestPath, "utf-8").catch(() => "");
	if (!raw.trim()) return [];
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch (err) {
		throw new Error(`Failed to parse plugin manifest at ${manifestPath}: ${String(err)}`, { cause: err });
	}
	const extensions = parsed?.[MANIFEST_KEY]?.extensions;
	if (!Array.isArray(extensions)) return [];
	return extensions.map((entry) => normalizeOptionalString(entry) ?? "").filter(Boolean);
}
function formatCodeSafetyDetails(findings, rootDir) {
	return findings.map((finding) => {
		const relPath = path.relative(rootDir, finding.file);
		const normalizedPath = (relPath && relPath !== "." && !relPath.startsWith("..") ? relPath : path.basename(finding.file)).replaceAll("\\", "/");
		return `  - [${finding.ruleId}] ${finding.message} (${normalizedPath}:${finding.line})`;
	}).join("\n");
}
function readChannelCommandSetting(cfg, channelId, key) {
	const channelCfg = cfg.channels?.[channelId];
	if (!channelCfg || typeof channelCfg !== "object" || Array.isArray(channelCfg)) return;
	const commands = channelCfg.commands;
	if (!commands || typeof commands !== "object" || Array.isArray(commands)) return;
	return commands[key];
}
async function isChannelPluginConfigured(cfg, plugin) {
	const accountIds = plugin.config.listAccountIds(cfg);
	const candidates = accountIds.length > 0 ? accountIds : [void 0];
	for (const accountId of candidates) {
		const inspected = plugin.config.inspectAccount?.(cfg, accountId) ?? await inspectReadOnlyChannelAccount({
			channelId: plugin.id,
			cfg,
			accountId
		});
		const inspectedRecord = inspected && typeof inspected === "object" && !Array.isArray(inspected) ? inspected : null;
		let resolvedAccount = inspected;
		if (!resolvedAccount) try {
			resolvedAccount = plugin.config.resolveAccount(cfg, accountId);
		} catch {
			resolvedAccount = null;
		}
		let enabled = typeof inspectedRecord?.enabled === "boolean" ? inspectedRecord.enabled : resolvedAccount != null;
		if (typeof inspectedRecord?.enabled !== "boolean" && resolvedAccount != null && plugin.config.isEnabled) try {
			enabled = plugin.config.isEnabled(resolvedAccount, cfg);
		} catch {
			enabled = false;
		}
		let configured = typeof inspectedRecord?.configured === "boolean" ? inspectedRecord.configured : resolvedAccount != null;
		if (typeof inspectedRecord?.configured !== "boolean" && resolvedAccount != null && plugin.config.isConfigured) try {
			configured = await plugin.config.isConfigured(resolvedAccount, cfg);
		} catch {
			configured = false;
		}
		if (enabled && configured) return true;
	}
	return false;
}
async function listInstalledPluginDirs(params) {
	const extensionsDir = path.join(params.stateDir, "extensions");
	const st = await safeStat(extensionsDir);
	if (!st.ok || !st.isDir) return {
		extensionsDir,
		pluginDirs: []
	};
	return {
		extensionsDir,
		pluginDirs: (await fs.readdir(extensionsDir, { withFileTypes: true }).catch((err) => {
			params.onReadError?.(err);
			return [];
		})).filter((entry) => entry.isDirectory()).map((entry) => entry.name).filter(Boolean)
	};
}
function resolveToolPolicies(params) {
	const policies = [
		resolveToolProfilePolicy(params.agentTools?.profile ?? params.cfg.tools?.profile),
		pickSandboxToolPolicy(params.cfg.tools ?? void 0),
		pickSandboxToolPolicy(params.agentTools)
	];
	if (params.sandboxMode === "all") policies.push(resolveSandboxToolPolicyForAgent(params.cfg, params.agentId ?? void 0));
	return policies;
}
function normalizePluginIdSet(entries) {
	return new Set(entries.map((entry) => normalizeOptionalLowercaseString(entry)).filter((entry) => Boolean(entry)));
}
function resolveEnabledExtensionPluginIds(params) {
	const normalized = normalizePluginsConfig(params.cfg.plugins);
	if (!normalized.enabled) return [];
	const allowSet = normalizePluginIdSet(normalized.allow);
	const denySet = normalizePluginIdSet(normalized.deny);
	const entryById = /* @__PURE__ */ new Map();
	for (const [id, entry] of Object.entries(normalized.entries)) {
		const normalizedId = normalizeOptionalLowercaseString(id);
		if (!normalizedId) continue;
		entryById.set(normalizedId, entry);
	}
	const enabled = [];
	for (const id of params.pluginDirs) {
		const normalizedId = normalizeOptionalLowercaseString(id);
		if (!normalizedId) continue;
		if (denySet.has(normalizedId)) continue;
		if (allowSet.size > 0 && !allowSet.has(normalizedId)) continue;
		if (entryById.get(normalizedId)?.enabled === false) continue;
		enabled.push(normalizedId);
	}
	return enabled;
}
function collectAllowEntries(config) {
	const out = [];
	if (Array.isArray(config?.allow)) out.push(...config.allow);
	if (Array.isArray(config?.alsoAllow)) out.push(...config.alsoAllow);
	return out.map((entry) => normalizeOptionalLowercaseString(entry)).filter((entry) => Boolean(entry));
}
function hasExplicitPluginAllow(params) {
	return params.allowEntries.some((entry) => entry === "group:plugins" || params.enabledPluginIds.has(entry));
}
function hasProviderPluginAllow(params) {
	if (!params.byProvider) return false;
	for (const policy of Object.values(params.byProvider)) if (hasExplicitPluginAllow({
		allowEntries: collectAllowEntries(policy),
		enabledPluginIds: params.enabledPluginIds
	})) return true;
	return false;
}
function isPinnedRegistrySpec(spec) {
	const value = spec.trim();
	if (!value) return false;
	const at = value.lastIndexOf("@");
	if (at <= 0 || at >= value.length - 1) return false;
	const version = value.slice(at + 1).trim();
	return /^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version);
}
function buildCodeSafetySummaryCacheKey(params) {
	const includeFiles = (params.includeFiles ?? []).map((entry) => entry.trim()).filter(Boolean);
	const includeKey = includeFiles.length > 0 ? includeFiles.toSorted().join("\0") : "";
	return `${params.dirPath}\u0000${includeKey}`;
}
async function getCodeSafetySummary(params) {
	const cacheKey = buildCodeSafetySummaryCacheKey({
		dirPath: params.dirPath,
		includeFiles: params.includeFiles
	});
	const cache = params.summaryCache;
	if (cache) {
		const hit = cache.get(cacheKey);
		if (hit) return await hit;
		const pending = scanDirectoryWithSummary(params.dirPath, { includeFiles: params.includeFiles });
		cache.set(cacheKey, pending);
		return await pending;
	}
	return await scanDirectoryWithSummary(params.dirPath, { includeFiles: params.includeFiles });
}
async function listWorkspaceSkillMarkdownFiles(workspaceDir) {
	const skillsRoot = path.join(workspaceDir, "skills");
	const rootStat = await safeStat(skillsRoot);
	if (!rootStat.ok || !rootStat.isDir) return {
		skillFilePaths: [],
		truncated: false
	};
	const skillFiles = [];
	const queue = [skillsRoot];
	const visitedDirs = /* @__PURE__ */ new Set();
	const MAX_TOTAL_DIR_VISITS = MAX_WORKSPACE_SKILL_SCAN_FILES_PER_WORKSPACE * 20;
	let totalDirVisits = 0;
	while (queue.length > 0 && skillFiles.length < MAX_WORKSPACE_SKILL_SCAN_FILES_PER_WORKSPACE && totalDirVisits++ < MAX_TOTAL_DIR_VISITS) {
		const dir = queue.shift();
		const dirRealPath = await realpathWithTimeout(dir) ?? path.resolve(dir);
		if (visitedDirs.has(dirRealPath)) continue;
		visitedDirs.add(dirRealPath);
		const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
		for (const entry of entries) {
			if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				queue.push(fullPath);
				continue;
			}
			if (entry.isSymbolicLink()) {
				const stat = await fs.stat(fullPath).catch(() => null);
				if (!stat) continue;
				if (stat.isDirectory()) {
					queue.push(fullPath);
					continue;
				}
				if (stat.isFile() && entry.name === "SKILL.md") skillFiles.push(fullPath);
				continue;
			}
			if (entry.isFile() && entry.name === "SKILL.md") skillFiles.push(fullPath);
		}
	}
	return {
		skillFilePaths: skillFiles,
		truncated: queue.length > 0
	};
}
function normalizeDockerLabelValue(raw) {
	const trimmed = normalizeOptionalString(raw) ?? "";
	if (!trimmed || trimmed === "<no value>") return null;
	return trimmed;
}
async function listSandboxBrowserContainers(execDockerRawFn) {
	try {
		const result = await execDockerRawFn([
			"ps",
			"-a",
			"--filter",
			"label=openclaw.sandboxBrowser=1",
			"--format",
			"{{.Names}}"
		], { allowFailure: true });
		if (result.code !== 0) return null;
		return result.stdout.toString("utf8").split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
	} catch {
		return null;
	}
}
async function readSandboxBrowserHashLabels(params) {
	try {
		const result = await params.execDockerRawFn([
			"inspect",
			"-f",
			"{{ index .Config.Labels \"openclaw.configHash\" }}	{{ index .Config.Labels \"openclaw.browserConfigEpoch\" }}",
			params.containerName
		], { allowFailure: true });
		if (result.code !== 0) return null;
		const [hashRaw, epochRaw] = result.stdout.toString("utf8").split("	");
		return {
			configHash: normalizeDockerLabelValue(hashRaw),
			epoch: normalizeDockerLabelValue(epochRaw)
		};
	} catch {
		return null;
	}
}
function parsePublishedHostFromDockerPortLine(line) {
	const trimmed = normalizeOptionalString(line) ?? "";
	const rhs = trimmed.includes("->") ? normalizeOptionalString(trimmed.split("->").at(-1)) ?? "" : trimmed;
	if (!rhs) return null;
	const bracketHost = rhs.match(/^\[([^\]]+)\]:\d+$/);
	if (bracketHost?.[1]) return bracketHost[1];
	const hostPort = rhs.match(/^([^:]+):\d+$/);
	if (hostPort?.[1]) return hostPort[1];
	return null;
}
function isLoopbackPublishHost(host) {
	const normalized = normalizeOptionalLowercaseString(host);
	return normalized === "127.0.0.1" || normalized === "::1" || normalized === "localhost";
}
async function readSandboxBrowserPortMappings(params) {
	try {
		const result = await params.execDockerRawFn(["port", params.containerName], { allowFailure: true });
		if (result.code !== 0) return null;
		return result.stdout.toString("utf8").split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
	} catch {
		return null;
	}
}
async function collectSandboxBrowserHashLabelFindings(params) {
	const findings = [];
	const execFn = params?.execDockerRawFn ?? execDockerRaw;
	const containers = await listSandboxBrowserContainers(execFn);
	if (!containers || containers.length === 0) return findings;
	const missingHash = [];
	const staleEpoch = [];
	const nonLoopbackPublished = [];
	for (const containerName of containers) {
		const labels = await readSandboxBrowserHashLabels({
			containerName,
			execDockerRawFn: execFn
		});
		if (!labels) continue;
		if (!labels.configHash) missingHash.push(containerName);
		if (labels.epoch !== "2026-04-05-cdp-source-range") staleEpoch.push(containerName);
		const portMappings = await readSandboxBrowserPortMappings({
			containerName,
			execDockerRawFn: execFn
		});
		if (!portMappings?.length) continue;
		const exposedMappings = portMappings.filter((line) => {
			const host = parsePublishedHostFromDockerPortLine(line);
			return Boolean(host && !isLoopbackPublishHost(host));
		});
		if (exposedMappings.length > 0) nonLoopbackPublished.push(`${containerName} (${exposedMappings.join("; ")})`);
	}
	if (missingHash.length > 0) findings.push({
		checkId: "sandbox.browser_container.hash_label_missing",
		severity: "warn",
		title: "Sandbox browser container missing config hash label",
		detail: `Containers: ${missingHash.join(", ")}. These browser containers predate hash-based drift checks and may miss security remediations until recreated.`,
		remediation: `${formatCliCommand("openclaw sandbox recreate --browser --all")} (add --force to skip prompt).`
	});
	if (staleEpoch.length > 0) findings.push({
		checkId: "sandbox.browser_container.hash_epoch_stale",
		severity: "warn",
		title: "Sandbox browser container hash epoch is stale",
		detail: `Containers: ${staleEpoch.join(", ")}. Expected openclaw.browserConfigEpoch=${SANDBOX_BROWSER_SECURITY_HASH_EPOCH}.`,
		remediation: `${formatCliCommand("openclaw sandbox recreate --browser --all")} (add --force to skip prompt).`
	});
	if (nonLoopbackPublished.length > 0) findings.push({
		checkId: "sandbox.browser_container.non_loopback_publish",
		severity: "critical",
		title: "Sandbox browser container publishes ports on non-loopback interfaces",
		detail: `Containers: ${nonLoopbackPublished.join(", ")}. Sandbox browser observer/control ports should stay loopback-only to avoid unintended remote access.`,
		remediation: `${formatCliCommand("openclaw sandbox recreate --browser --all")} (add --force to skip prompt), then verify published ports are bound to 127.0.0.1.`
	});
	return findings;
}
async function collectPluginsTrustFindings(params) {
	const findings = [];
	const { extensionsDir, pluginDirs } = await listInstalledPluginDirs({ stateDir: params.stateDir });
	if (pluginDirs.length > 0) {
		const allow = params.cfg.plugins?.allow;
		const allowConfigured = Array.isArray(allow) && allow.length > 0;
		if (allowConfigured) {
			const installedPluginIds = new Set(pluginDirs.map((dir) => path.basename(dir).toLowerCase()));
			const bundledPluginIds = new Set(listChannelPlugins().map((p) => p.id.toLowerCase()));
			const phantomEntries = allow.filter((entry) => {
				if (typeof entry !== "string" || entry === "group:plugins") return false;
				const lower = entry.toLowerCase();
				if (installedPluginIds.has(lower) || bundledPluginIds.has(lower)) return false;
				const canonicalId = normalizeOptionalLowercaseString(normalizePluginId(entry)) ?? "";
				return !canonicalId || !bundledPluginIds.has(canonicalId);
			});
			if (phantomEntries.length > 0) findings.push({
				checkId: "plugins.allow_phantom_entries",
				severity: "warn",
				title: "plugins.allow contains entries with no matching installed plugin",
				detail: `The following plugins.allow entries do not correspond to any installed plugin: ${phantomEntries.join(", ")}.\nPhantom entries could be exploited by registering a new plugin with an allowlisted ID.`,
				remediation: "Remove unused entries from plugins.allow, or verify the expected plugins are installed."
			});
		}
		if (!allowConfigured) {
			const skillCommandsLikelyExposed = (await Promise.all(listChannelPlugins().map(async (plugin) => {
				if (plugin.capabilities.nativeCommands !== true && plugin.commands?.nativeSkillsAutoEnabled !== true) return false;
				if (!await isChannelPluginConfigured(params.cfg, plugin)) return false;
				return resolveNativeSkillsEnabled({
					providerId: plugin.id,
					providerSetting: readChannelCommandSetting(params.cfg, plugin.id, "nativeSkills"),
					globalSetting: params.cfg.commands?.nativeSkills
				});
			}))).some(Boolean);
			findings.push({
				checkId: "plugins.extensions_no_allowlist",
				severity: skillCommandsLikelyExposed ? "critical" : "warn",
				title: "Extensions exist but plugins.allow is not set",
				detail: `Found ${pluginDirs.length} extension(s) under ${extensionsDir}. Without plugins.allow, any discovered plugin id may load (depending on config and plugin behavior).` + (skillCommandsLikelyExposed ? "\nNative skill commands are enabled on at least one configured chat surface; treat unpinned/unallowlisted extensions as high risk." : ""),
				remediation: "Set plugins.allow to an explicit list of plugin ids you trust."
			});
		}
		const enabledExtensionPluginIds = resolveEnabledExtensionPluginIds({
			cfg: params.cfg,
			pluginDirs
		});
		if (enabledExtensionPluginIds.length > 0) {
			const enabledPluginSet = new Set(enabledExtensionPluginIds);
			const contexts = [{ label: "default" }];
			for (const entry of params.cfg.agents?.list ?? []) {
				if (!entry || typeof entry !== "object" || typeof entry.id !== "string") continue;
				contexts.push({
					label: `agents.list.${entry.id}`,
					agentId: entry.id,
					tools: entry.tools
				});
			}
			const permissiveContexts = [];
			for (const context of contexts) {
				const profile = context.tools?.profile ?? params.cfg.tools?.profile;
				const restrictiveProfile = Boolean(resolveToolProfilePolicy(profile));
				const sandboxMode = resolveSandboxConfigForAgent(params.cfg, context.agentId).mode;
				const broadPolicy = isToolAllowedByPolicies("__openclaw_plugin_probe__", resolveToolPolicies({
					cfg: params.cfg,
					agentTools: context.tools,
					sandboxMode,
					agentId: context.agentId
				}));
				const explicitPluginAllow = !restrictiveProfile && (hasExplicitPluginAllow({
					allowEntries: collectAllowEntries(params.cfg.tools),
					enabledPluginIds: enabledPluginSet
				}) || hasProviderPluginAllow({
					byProvider: params.cfg.tools?.byProvider,
					enabledPluginIds: enabledPluginSet
				}) || hasExplicitPluginAllow({
					allowEntries: collectAllowEntries(context.tools),
					enabledPluginIds: enabledPluginSet
				}) || hasProviderPluginAllow({
					byProvider: context.tools?.byProvider,
					enabledPluginIds: enabledPluginSet
				}));
				if (broadPolicy || explicitPluginAllow) permissiveContexts.push(context.label);
			}
			if (permissiveContexts.length > 0) findings.push({
				checkId: "plugins.tools_reachable_permissive_policy",
				severity: "warn",
				title: "Extension plugin tools may be reachable under permissive tool policy",
				detail: `Enabled extension plugins: ${enabledExtensionPluginIds.join(", ")}.\nPermissive tool policy contexts:\n${permissiveContexts.map((entry) => `- ${entry}`).join("\n")}`,
				remediation: "Use restrictive profiles (`minimal`/`coding`) or explicit tool allowlists that exclude plugin tools for agents handling untrusted input."
			});
		}
	}
	const pluginInstalls = params.cfg.plugins?.installs ?? {};
	const npmPluginInstalls = Object.entries(pluginInstalls).filter(([, record]) => record?.source === "npm");
	if (npmPluginInstalls.length > 0) {
		const unpinned = npmPluginInstalls.filter(([, record]) => typeof record.spec === "string" && !isPinnedRegistrySpec(record.spec)).map(([pluginId, record]) => `${pluginId} (${record.spec})`);
		if (unpinned.length > 0) findings.push({
			checkId: "plugins.installs_unpinned_npm_specs",
			severity: "warn",
			title: "Plugin installs include unpinned npm specs",
			detail: `Unpinned plugin install records:\n${unpinned.map((entry) => `- ${entry}`).join("\n")}`,
			remediation: "Pin install specs to exact versions (for example, `@scope/pkg@1.2.3`) for higher supply-chain stability."
		});
		const missingIntegrity = npmPluginInstalls.filter(([, record]) => typeof record.integrity !== "string" || record.integrity.trim() === "").map(([pluginId]) => pluginId);
		if (missingIntegrity.length > 0) findings.push({
			checkId: "plugins.installs_missing_integrity",
			severity: "warn",
			title: "Plugin installs are missing integrity metadata",
			detail: `Plugin install records missing integrity:\n${missingIntegrity.map((entry) => `- ${entry}`).join("\n")}`,
			remediation: "Reinstall or update plugins to refresh install metadata with resolved integrity hashes."
		});
		const pluginVersionDrift = [];
		for (const [pluginId, record] of npmPluginInstalls) {
			const recordedVersion = record.resolvedVersion ?? record.version;
			if (!recordedVersion) continue;
			const installedVersion = await readInstalledPackageVersion(record.installPath ?? path.join(params.stateDir, "extensions", pluginId));
			if (!installedVersion || installedVersion === recordedVersion) continue;
			pluginVersionDrift.push(`${pluginId} (recorded ${recordedVersion}, installed ${installedVersion})`);
		}
		if (pluginVersionDrift.length > 0) findings.push({
			checkId: "plugins.installs_version_drift",
			severity: "warn",
			title: "Plugin install records drift from installed package versions",
			detail: `Detected plugin install metadata drift:\n${pluginVersionDrift.map((entry) => `- ${entry}`).join("\n")}`,
			remediation: "Run `openclaw plugins update --all` (or reinstall affected plugins) to refresh install metadata."
		});
	}
	const hookInstalls = params.cfg.hooks?.internal?.installs ?? {};
	const npmHookInstalls = Object.entries(hookInstalls).filter(([, record]) => record?.source === "npm");
	if (npmHookInstalls.length > 0) {
		const unpinned = npmHookInstalls.filter(([, record]) => typeof record.spec === "string" && !isPinnedRegistrySpec(record.spec)).map(([hookId, record]) => `${hookId} (${record.spec})`);
		if (unpinned.length > 0) findings.push({
			checkId: "hooks.installs_unpinned_npm_specs",
			severity: "warn",
			title: "Hook installs include unpinned npm specs",
			detail: `Unpinned hook install records:\n${unpinned.map((entry) => `- ${entry}`).join("\n")}`,
			remediation: "Pin hook install specs to exact versions (for example, `@scope/pkg@1.2.3`) for higher supply-chain stability."
		});
		const missingIntegrity = npmHookInstalls.filter(([, record]) => typeof record.integrity !== "string" || record.integrity.trim() === "").map(([hookId]) => hookId);
		if (missingIntegrity.length > 0) findings.push({
			checkId: "hooks.installs_missing_integrity",
			severity: "warn",
			title: "Hook installs are missing integrity metadata",
			detail: `Hook install records missing integrity:\n${missingIntegrity.map((entry) => `- ${entry}`).join("\n")}`,
			remediation: "Reinstall or update hooks to refresh install metadata with resolved integrity hashes."
		});
		const hookVersionDrift = [];
		for (const [hookId, record] of npmHookInstalls) {
			const recordedVersion = record.resolvedVersion ?? record.version;
			if (!recordedVersion) continue;
			const installedVersion = await readInstalledPackageVersion(record.installPath ?? path.join(params.stateDir, "hooks", hookId));
			if (!installedVersion || installedVersion === recordedVersion) continue;
			hookVersionDrift.push(`${hookId} (recorded ${recordedVersion}, installed ${installedVersion})`);
		}
		if (hookVersionDrift.length > 0) findings.push({
			checkId: "hooks.installs_version_drift",
			severity: "warn",
			title: "Hook install records drift from installed package versions",
			detail: `Detected hook install metadata drift:\n${hookVersionDrift.map((entry) => `- ${entry}`).join("\n")}`,
			remediation: "Run `openclaw hooks update --all` (or reinstall affected hooks) to refresh install metadata."
		});
	}
	return findings;
}
async function collectWorkspaceSkillSymlinkEscapeFindings(params) {
	const findings = [];
	const workspaceDirs = listAgentWorkspaceDirs(params.cfg);
	if (workspaceDirs.length === 0) return findings;
	const escapedSkillFiles = [];
	const seenSkillPaths = /* @__PURE__ */ new Set();
	for (const workspaceDir of workspaceDirs) {
		const workspacePath = path.resolve(workspaceDir);
		const workspaceRealPath = await realpathWithTimeout(workspacePath) ?? workspacePath;
		const { skillFilePaths, truncated } = await listWorkspaceSkillMarkdownFiles(workspacePath);
		if (truncated) findings.push({
			checkId: "skills.workspace.scan_truncated",
			severity: "warn",
			title: "Workspace skill scan reached the directory visit limit",
			detail: `The skills/ directory scan in ${workspacePath} stopped early after reaching the BFS visit cap. Skill files in the unscanned portion of the tree were not checked for symlink escapes.`,
			remediation: "Flatten or simplify the skills/ directory hierarchy to stay within the scan budget, or move deeply-nested skill collections to a managed skill location."
		});
		for (const skillFilePath of skillFilePaths) {
			const canonicalSkillPath = path.resolve(skillFilePath);
			if (seenSkillPaths.has(canonicalSkillPath)) continue;
			seenSkillPaths.add(canonicalSkillPath);
			const skillRealPath = await realpathWithTimeout(canonicalSkillPath);
			if (!skillRealPath) {
				escapedSkillFiles.push({
					workspaceDir: workspacePath,
					skillFilePath: canonicalSkillPath,
					skillRealPath: "(realpath timed out — symlink target unverifiable)"
				});
				continue;
			}
			if (isPathInside(workspaceRealPath, skillRealPath)) continue;
			escapedSkillFiles.push({
				workspaceDir: workspacePath,
				skillFilePath: canonicalSkillPath,
				skillRealPath
			});
		}
	}
	if (escapedSkillFiles.length === 0) return findings;
	findings.push({
		checkId: "skills.workspace.symlink_escape",
		severity: "warn",
		title: "Workspace skill files resolve outside the workspace root",
		detail: "Detected workspace `skills/**/SKILL.md` paths whose realpath escapes their workspace root:\n" + escapedSkillFiles.slice(0, MAX_WORKSPACE_SKILL_ESCAPE_DETAIL_ROWS).map((entry) => `- workspace=${entry.workspaceDir}\n  skill=${entry.skillFilePath}\n  realpath=${entry.skillRealPath}`).join("\n") + (escapedSkillFiles.length > MAX_WORKSPACE_SKILL_ESCAPE_DETAIL_ROWS ? `\n- +${escapedSkillFiles.length - MAX_WORKSPACE_SKILL_ESCAPE_DETAIL_ROWS} more` : ""),
		remediation: "Keep workspace skills inside the workspace root (replace symlinked escapes with real in-workspace files), or move trusted shared skills to managed/bundled skill locations."
	});
	return findings;
}
async function collectIncludeFilePermFindings(params) {
	const findings = [];
	if (!params.configSnapshot.exists) return findings;
	const configPath = params.configSnapshot.path;
	const includePaths = await collectIncludePathsRecursive({
		configPath,
		parsed: params.configSnapshot.parsed
	});
	if (includePaths.length === 0) return findings;
	for (const p of includePaths) {
		const perms = await inspectPathPermissions(p, {
			env: params.env,
			platform: params.platform,
			exec: params.execIcacls
		});
		if (!perms.ok) continue;
		if (perms.worldWritable || perms.groupWritable) findings.push({
			checkId: "fs.config_include.perms_writable",
			severity: "critical",
			title: "Config include file is writable by others",
			detail: `${formatPermissionDetail(p, perms)}; another user could influence your effective config.`,
			remediation: formatPermissionRemediation({
				targetPath: p,
				perms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
		else if (perms.worldReadable) findings.push({
			checkId: "fs.config_include.perms_world_readable",
			severity: "critical",
			title: "Config include file is world-readable",
			detail: `${formatPermissionDetail(p, perms)}; include files can contain tokens and private settings.`,
			remediation: formatPermissionRemediation({
				targetPath: p,
				perms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
		else if (perms.groupReadable) findings.push({
			checkId: "fs.config_include.perms_group_readable",
			severity: "warn",
			title: "Config include file is group-readable",
			detail: `${formatPermissionDetail(p, perms)}; include files can contain tokens and private settings.`,
			remediation: formatPermissionRemediation({
				targetPath: p,
				perms,
				isDir: false,
				posixMode: 384,
				env: params.env
			})
		});
	}
	return findings;
}
async function collectStateDeepFilesystemFindings(params) {
	const findings = [];
	const oauthDir = resolveOAuthDir(params.env, params.stateDir);
	const oauthPerms = await inspectPathPermissions(oauthDir, {
		env: params.env,
		platform: params.platform,
		exec: params.execIcacls
	});
	if (oauthPerms.ok && oauthPerms.isDir) {
		if (oauthPerms.worldWritable || oauthPerms.groupWritable) findings.push({
			checkId: "fs.credentials_dir.perms_writable",
			severity: "critical",
			title: "Credentials dir is writable by others",
			detail: `${formatPermissionDetail(oauthDir, oauthPerms)}; another user could drop/modify credential files.`,
			remediation: formatPermissionRemediation({
				targetPath: oauthDir,
				perms: oauthPerms,
				isDir: true,
				posixMode: 448,
				env: params.env
			})
		});
		else if (oauthPerms.groupReadable || oauthPerms.worldReadable) findings.push({
			checkId: "fs.credentials_dir.perms_readable",
			severity: "warn",
			title: "Credentials dir is readable by others",
			detail: `${formatPermissionDetail(oauthDir, oauthPerms)}; credentials and allowlists can be sensitive.`,
			remediation: formatPermissionRemediation({
				targetPath: oauthDir,
				perms: oauthPerms,
				isDir: true,
				posixMode: 448,
				env: params.env
			})
		});
	}
	const agentIds = Array.isArray(params.cfg.agents?.list) ? params.cfg.agents?.list.map((a) => normalizeOptionalString(a && typeof a === "object" ? a.id : void 0) ?? "").filter(Boolean) : [];
	const defaultAgentId = resolveDefaultAgentId(params.cfg);
	const ids = Array.from(new Set([defaultAgentId, ...agentIds])).map((id) => normalizeAgentId(id));
	for (const agentId of ids) {
		const agentDir = path.join(params.stateDir, "agents", agentId, "agent");
		const authPath = path.join(agentDir, "auth-profiles.json");
		const authPerms = await inspectPathPermissions(authPath, {
			env: params.env,
			platform: params.platform,
			exec: params.execIcacls
		});
		if (authPerms.ok) {
			if (authPerms.worldWritable || authPerms.groupWritable) findings.push({
				checkId: "fs.auth_profiles.perms_writable",
				severity: "critical",
				title: "auth-profiles.json is writable by others",
				detail: `${formatPermissionDetail(authPath, authPerms)}; another user could inject credentials.`,
				remediation: formatPermissionRemediation({
					targetPath: authPath,
					perms: authPerms,
					isDir: false,
					posixMode: 384,
					env: params.env
				})
			});
			else if (authPerms.worldReadable || authPerms.groupReadable) findings.push({
				checkId: "fs.auth_profiles.perms_readable",
				severity: "warn",
				title: "auth-profiles.json is readable by others",
				detail: `${formatPermissionDetail(authPath, authPerms)}; auth-profiles.json contains API keys and OAuth tokens.`,
				remediation: formatPermissionRemediation({
					targetPath: authPath,
					perms: authPerms,
					isDir: false,
					posixMode: 384,
					env: params.env
				})
			});
		}
		const storePath = path.join(params.stateDir, "agents", agentId, "sessions", "sessions.json");
		const storePerms = await inspectPathPermissions(storePath, {
			env: params.env,
			platform: params.platform,
			exec: params.execIcacls
		});
		if (storePerms.ok) {
			if (storePerms.worldReadable || storePerms.groupReadable) findings.push({
				checkId: "fs.sessions_store.perms_readable",
				severity: "warn",
				title: "sessions.json is readable by others",
				detail: `${formatPermissionDetail(storePath, storePerms)}; routing and transcript metadata can be sensitive.`,
				remediation: formatPermissionRemediation({
					targetPath: storePath,
					perms: storePerms,
					isDir: false,
					posixMode: 384,
					env: params.env
				})
			});
		}
	}
	const logFile = normalizeOptionalString(params.cfg.logging?.file) ?? "";
	if (logFile) {
		const expanded = logFile.startsWith("~") ? expandTilde(logFile, params.env) : logFile;
		if (expanded) {
			const logPath = path.resolve(expanded);
			const logPerms = await inspectPathPermissions(logPath, {
				env: params.env,
				platform: params.platform,
				exec: params.execIcacls
			});
			if (logPerms.ok) {
				if (logPerms.worldReadable || logPerms.groupReadable) findings.push({
					checkId: "fs.log_file.perms_readable",
					severity: "warn",
					title: "Log file is readable by others",
					detail: `${formatPermissionDetail(logPath, logPerms)}; logs can contain private messages and tool output.`,
					remediation: formatPermissionRemediation({
						targetPath: logPath,
						perms: logPerms,
						isDir: false,
						posixMode: 384,
						env: params.env
					})
				});
			}
		}
	}
	return findings;
}
async function readConfigSnapshotForAudit(params) {
	const { createConfigIO } = await loadConfigModule();
	return await createConfigIO({
		env: params.env,
		configPath: params.configPath
	}).readConfigFileSnapshot();
}
async function collectPluginsCodeSafetyFindings(params) {
	const findings = [];
	const { extensionsDir, pluginDirs } = await listInstalledPluginDirs({
		stateDir: params.stateDir,
		onReadError: (err) => {
			findings.push({
				checkId: "plugins.code_safety.scan_failed",
				severity: "warn",
				title: "Plugin extensions directory scan failed",
				detail: `Static code scan could not list extensions directory: ${String(err)}`,
				remediation: "Check file permissions and plugin layout, then rerun `openclaw security audit --deep`."
			});
		}
	});
	for (const pluginName of pluginDirs) {
		const pluginPath = path.join(extensionsDir, pluginName);
		let extensionEntries = [];
		try {
			extensionEntries = await readPluginManifestExtensions(pluginPath);
		} catch (manifestErr) {
			findings.push({
				checkId: "plugins.code_safety.manifest_parse_error",
				severity: "warn",
				title: `Plugin "${pluginName}" has a malformed package.json`,
				detail: `Could not parse plugin manifest: ${String(manifestErr)}.\nThe extension entrypoint list is unavailable. Deep scan will cover the plugin directory but may miss entries declared via \`openclaw.extensions\`.`,
				remediation: "Inspect the plugin package.json for syntax errors. If the plugin is untrusted, remove it from your OpenClaw extensions state directory."
			});
		}
		const forcedScanEntries = [];
		const escapedEntries = [];
		for (const entry of extensionEntries) {
			const resolvedEntry = path.resolve(pluginPath, entry);
			if (!isPathInside(pluginPath, resolvedEntry)) {
				escapedEntries.push(entry);
				continue;
			}
			if (extensionUsesSkippedScannerPath(entry)) findings.push({
				checkId: "plugins.code_safety.entry_path",
				severity: "warn",
				title: `Plugin "${pluginName}" entry path is hidden or node_modules`,
				detail: `Extension entry "${entry}" points to a hidden or node_modules path. Deep code scan will cover this entry explicitly, but review this path choice carefully.`,
				remediation: "Prefer extension entrypoints under normal source paths like dist/ or src/."
			});
			forcedScanEntries.push(resolvedEntry);
		}
		if (escapedEntries.length > 0) findings.push({
			checkId: "plugins.code_safety.entry_escape",
			severity: "critical",
			title: `Plugin "${pluginName}" has extension entry path traversal`,
			detail: `Found extension entries that escape the plugin directory:\n${escapedEntries.map((entry) => `  - ${entry}`).join("\n")}`,
			remediation: "Update the plugin manifest so all openclaw.extensions entries stay inside the plugin directory."
		});
		const summary = await getCodeSafetySummary({
			dirPath: pluginPath,
			includeFiles: forcedScanEntries,
			summaryCache: params.summaryCache
		}).catch((err) => {
			findings.push({
				checkId: "plugins.code_safety.scan_failed",
				severity: "warn",
				title: `Plugin "${pluginName}" code scan failed`,
				detail: `Static code scan could not complete: ${String(err)}`,
				remediation: "Check file permissions and plugin layout, then rerun `openclaw security audit --deep`."
			});
			return null;
		});
		if (!summary) continue;
		if (summary.critical > 0) {
			const details = formatCodeSafetyDetails(summary.findings.filter((f) => f.severity === "critical"), pluginPath);
			findings.push({
				checkId: "plugins.code_safety",
				severity: "critical",
				title: `Plugin "${pluginName}" contains dangerous code patterns`,
				detail: `Found ${summary.critical} critical issue(s) in ${summary.scannedFiles} scanned file(s):\n${details}`,
				remediation: "Review the plugin source code carefully before use. If untrusted, remove the plugin from your OpenClaw extensions state directory."
			});
		} else if (summary.warn > 0) {
			const details = formatCodeSafetyDetails(summary.findings.filter((f) => f.severity === "warn"), pluginPath);
			findings.push({
				checkId: "plugins.code_safety",
				severity: "warn",
				title: `Plugin "${pluginName}" contains suspicious code patterns`,
				detail: `Found ${summary.warn} warning(s) in ${summary.scannedFiles} scanned file(s):\n${details}`,
				remediation: `Review the flagged code to ensure it is intentional and safe.`
			});
		}
	}
	return findings;
}
async function collectInstalledSkillsCodeSafetyFindings(params) {
	const findings = [];
	const pluginExtensionsDir = path.join(params.stateDir, "extensions");
	const scannedSkillDirs = /* @__PURE__ */ new Set();
	const workspaceDirs = listAgentWorkspaceDirs(params.cfg);
	const { loadWorkspaceSkillEntries } = await loadSkillsModule();
	for (const workspaceDir of workspaceDirs) {
		const entries = loadWorkspaceSkillEntries(workspaceDir, { config: params.cfg });
		for (const entry of entries) {
			if (resolveSkillSource(entry.skill) === "openclaw-bundled") continue;
			const skillDir = path.resolve(entry.skill.baseDir);
			if (isPathInside(pluginExtensionsDir, skillDir)) continue;
			if (scannedSkillDirs.has(skillDir)) continue;
			scannedSkillDirs.add(skillDir);
			const skillName = entry.skill.name;
			const summary = await getCodeSafetySummary({
				dirPath: skillDir,
				summaryCache: params.summaryCache
			}).catch((err) => {
				findings.push({
					checkId: "skills.code_safety.scan_failed",
					severity: "warn",
					title: `Skill "${skillName}" code scan failed`,
					detail: `Static code scan could not complete for ${skillDir}: ${String(err)}`,
					remediation: "Check file permissions and skill layout, then rerun `openclaw security audit --deep`."
				});
				return null;
			});
			if (!summary) continue;
			if (summary.critical > 0) {
				const details = formatCodeSafetyDetails(summary.findings.filter((finding) => finding.severity === "critical"), skillDir);
				findings.push({
					checkId: "skills.code_safety",
					severity: "critical",
					title: `Skill "${skillName}" contains dangerous code patterns`,
					detail: `Found ${summary.critical} critical issue(s) in ${summary.scannedFiles} scanned file(s) under ${skillDir}:\n${details}`,
					remediation: `Review the skill source code before use. If untrusted, remove "${skillDir}".`
				});
			} else if (summary.warn > 0) {
				const details = formatCodeSafetyDetails(summary.findings.filter((finding) => finding.severity === "warn"), skillDir);
				findings.push({
					checkId: "skills.code_safety",
					severity: "warn",
					title: `Skill "${skillName}" contains suspicious code patterns`,
					detail: `Found ${summary.warn} warning(s) in ${summary.scannedFiles} scanned file(s) under ${skillDir}:\n${details}`,
					remediation: "Review flagged lines to ensure the behavior is intentional and safe."
				});
			}
		}
	}
	return findings;
}
//#endregion
export { collectSandboxBrowserHashLabelFindings as a, readConfigSnapshotForAudit as c, collectPluginsTrustFindings as i, collectInstalledSkillsCodeSafetyFindings as n, collectStateDeepFilesystemFindings as o, collectPluginsCodeSafetyFindings as r, collectWorkspaceSkillSymlinkEscapeFindings as s, collectIncludeFilePermFindings as t };
