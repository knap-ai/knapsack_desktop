import { d as resolveIsNixMode, f as resolveLegacyStateDirs, g as resolveStateDir, m as resolveOAuthDir, p as resolveNewStateDir, t as CONFIG_PATH, u as resolveGatewayPort, y as resolveRequiredHomeDir } from "./paths-DVBShlw6.js";
import { U as getResolvedLoggerSettings, u as defaultRuntime } from "./subsystem-QRNIBE7-.js";
import { C as shortenHomePath, f as isRecord, v as resolveHomeDir$1, w as sleep } from "./utils-CrauP1IK.js";
import { _t as loadOpenClawPlugins } from "./reply-BNEkWD6b.js";
import { i as buildAgentMainSessionKey, l as normalizeAgentId, r as DEFAULT_MAIN_KEY, t as DEFAULT_ACCOUNT_ID } from "./session-key-BWxPj0z_.js";
import { n as runExec, t as runCommandWithTimeout } from "./exec-BDyx_yxc.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-CnzGNXsk.js";
import { c as resolveDefaultAgentId, d as DEFAULT_AGENTS_FILENAME, s as resolveAgentWorkspaceDir } from "./agent-scope-DMGrQp5u.js";
import { Ct as ensureAuthProfileStore, It as DEFAULT_MODEL, Lt as DEFAULT_PROVIDER, Nt as CLAUDE_CLI_PROFILE_ID, Pt as CODEX_CLI_PROFILE_ID, Tt as updateAuthProfileStoreWithLock, _t as repairOAuthProfileIdMismatch, d as resolveConfiguredModelRef, dt as resolveProfileUnusableUntilForDisplay, ft as resolveApiKeyForProfile, i as getModelRefStatus, p as resolveHooksGmailModel } from "./model-selection-D37iyQY4.js";
import { t as formatCliCommand } from "./command-format-ChfKqObn.js";
import { t as isTruthyEnvValue } from "./env-BSjH4KuP.js";
import { d as OpenClawSchema, l as writeConfigFile, n as migrateLegacyConfig, o as readConfigFileSnapshot } from "./config-CWifpzL_.js";
import { n as listChannelPlugins } from "./plugins-CLo5nH74.js";
import { M as resolveMainSessionKey, i as loadSessionStore, k as canonicalizeMainSessionAlias, s as saveSessionStore } from "./sessions-ezP1qtWM.js";
import { s as loadModelCatalog } from "./runner-BDxtyEy4.js";
import { S as DEFAULT_SANDBOX_IMAGE, b as DEFAULT_SANDBOX_BROWSER_IMAGE, u as resolveSandboxScope, x as DEFAULT_SANDBOX_COMMON_IMAGE } from "./sandbox-BOXx_Lgl.js";
import { l as resolveGatewayBindHost, r as isLoopbackHost } from "./ws-DRtd8iSA.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-DAxLoOFv.js";
import { c as resolveStorePath, n as resolveSessionFilePath, s as resolveSessionTranscriptsDirForAgent } from "./paths-BuQbsACT.js";
import { n as callGateway, t as buildGatewayConnectionDetails } from "./call-i9290XP8.js";
import { i as readChannelAllowFromStore } from "./pairing-store-88eMFj2v.js";
import { f as printWizardHeader, m as randomToken, n as applyWizardMetadata, s as guardCancel } from "./onboard-helpers-tLA-tN_l.js";
import { n as isWSLEnv, t as isWSL } from "./wsl-DbASGmgA.js";
import { n as stylePromptMessage, r as stylePromptTitle, t as stylePromptHint } from "./prompt-style-ciYaT-3f.js";
import { i as resolveGatewayAuth } from "./auth-DT6fiHDK.js";
import { d as resolveGatewaySystemdServiceName, f as resolveGatewayWindowsTaskName, l as resolveGatewayLaunchAgentLabel, m as resolveNodeLaunchAgentLabel } from "./constants-C-OWcct_.js";
import { a as gatewayInstallErrorHint, d as renderSystemNodeWarning, i as buildGatewayInstallPlan, n as GATEWAY_DAEMON_RUNTIME_OPTIONS, p as resolveSystemNodeInfo, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-sITO6h1s.js";
import { t as resolveChannelDefaultAccountId } from "./helpers-28CRTwys.js";
import { n as logConfigUpdated } from "./logging-BYdFQAju.js";
import { t as note$1 } from "./note-B5hvEaG5.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-B_v9wM6g.js";
import { c as formatHealthCheckFailure, d as resolveControlUiDistIndexPathForRoot, r as healthCommand, u as resolveControlUiDistIndexHealth } from "./health-Cb5plNjz.js";
import { a as repairLaunchAgentBootstrap, i as launchAgentPlistExists, n as isLaunchAgentListed, o as resolveGatewayLogPaths, r as isLaunchAgentLoaded, t as resolveGatewayService } from "./service-CMKWaXkp.js";
import { r as isSystemdUserServiceAvailable } from "./systemd-CFcBM6Sc.js";
import { t as ensureSystemdUserLingerInteractive } from "./systemd-linger-DfY-LfC0.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-CRbYCH-J.js";
import { n as buildAuthHealthSummary, r as formatRemainingShort, t as DEFAULT_OAUTH_WARN_MS } from "./auth-health-CbuOKV-M.js";
import { S as doctorShellCompletion, a as runGatewayUpdate } from "./status.update-CWTIGg6J.js";
import { a as renderGatewayServiceCleanupHints, i as findExtraGatewayServices, n as auditGatewayServiceConfig, o as readLastGatewayErrorLine, r as needsNodeRuntimeMigration, t as SERVICE_AUDIT_CODES } from "./service-audit-t42gxcdN.js";
import { n as renderSystemdUnavailableHints, t as isSystemdUnavailableDetail } from "./systemd-hints-BL7fRcj6.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-Cuirza--.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import JSON5 from "json5";
import fsPromises from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { confirm, intro, outro, select } from "@clack/prompts";

//#region src/commands/doctor-auth.ts
async function maybeRepairAnthropicOAuthProfileId(cfg, prompter) {
	const repair = repairOAuthProfileIdMismatch({
		cfg,
		store: ensureAuthProfileStore(),
		provider: "anthropic",
		legacyProfileId: "anthropic:default"
	});
	if (!repair.migrated || repair.changes.length === 0) return cfg;
	note$1(repair.changes.map((c) => `- ${c}`).join("\n"), "Auth profiles");
	if (!await prompter.confirm({
		message: "Update Anthropic OAuth profile id in config now?",
		initialValue: true
	})) return cfg;
	return repair.config;
}
function pruneAuthOrder(order, profileIds) {
	if (!order) return {
		next: order,
		changed: false
	};
	let changed = false;
	const next = {};
	for (const [provider, list] of Object.entries(order)) {
		const filtered = list.filter((id) => !profileIds.has(id));
		if (filtered.length !== list.length) changed = true;
		if (filtered.length > 0) next[provider] = filtered;
	}
	return {
		next: Object.keys(next).length > 0 ? next : void 0,
		changed
	};
}
function pruneAuthProfiles(cfg, profileIds) {
	const profiles = cfg.auth?.profiles;
	const order = cfg.auth?.order;
	const nextProfiles = profiles ? { ...profiles } : void 0;
	let changed = false;
	if (nextProfiles) {
		for (const id of profileIds) if (id in nextProfiles) {
			delete nextProfiles[id];
			changed = true;
		}
	}
	const prunedOrder = pruneAuthOrder(order, profileIds);
	if (prunedOrder.changed) changed = true;
	if (!changed) return {
		next: cfg,
		changed: false
	};
	const nextAuth = nextProfiles || prunedOrder.next ? {
		...cfg.auth,
		profiles: nextProfiles && Object.keys(nextProfiles).length > 0 ? nextProfiles : void 0,
		order: prunedOrder.next
	} : void 0;
	return {
		next: {
			...cfg,
			auth: nextAuth
		},
		changed: true
	};
}
async function maybeRemoveDeprecatedCliAuthProfiles(cfg, prompter) {
	const store = ensureAuthProfileStore(void 0, { allowKeychainPrompt: false });
	const deprecated = /* @__PURE__ */ new Set();
	if (store.profiles[CLAUDE_CLI_PROFILE_ID] || cfg.auth?.profiles?.[CLAUDE_CLI_PROFILE_ID]) deprecated.add(CLAUDE_CLI_PROFILE_ID);
	if (store.profiles[CODEX_CLI_PROFILE_ID] || cfg.auth?.profiles?.[CODEX_CLI_PROFILE_ID]) deprecated.add(CODEX_CLI_PROFILE_ID);
	if (deprecated.size === 0) return cfg;
	const lines = ["Deprecated external CLI auth profiles detected (no longer supported):"];
	if (deprecated.has(CLAUDE_CLI_PROFILE_ID)) lines.push(`- ${CLAUDE_CLI_PROFILE_ID} (Anthropic): use setup-token → ${formatCliCommand("openclaw models auth setup-token")}`);
	if (deprecated.has(CODEX_CLI_PROFILE_ID)) lines.push(`- ${CODEX_CLI_PROFILE_ID} (OpenAI Codex): use OAuth → ${formatCliCommand("openclaw models auth login --provider openai-codex")}`);
	note$1(lines.join("\n"), "Auth profiles");
	if (!await prompter.confirmRepair({
		message: "Remove deprecated CLI auth profiles now?",
		initialValue: true
	})) return cfg;
	await updateAuthProfileStoreWithLock({ updater: (nextStore) => {
		let mutated = false;
		for (const id of deprecated) {
			if (nextStore.profiles[id]) {
				delete nextStore.profiles[id];
				mutated = true;
			}
			if (nextStore.usageStats?.[id]) {
				delete nextStore.usageStats[id];
				mutated = true;
			}
		}
		if (nextStore.order) for (const [provider, list] of Object.entries(nextStore.order)) {
			const filtered = list.filter((id) => !deprecated.has(id));
			if (filtered.length !== list.length) {
				mutated = true;
				if (filtered.length > 0) nextStore.order[provider] = filtered;
				else delete nextStore.order[provider];
			}
		}
		if (nextStore.lastGood) {
			for (const [provider, profileId] of Object.entries(nextStore.lastGood)) if (deprecated.has(profileId)) {
				delete nextStore.lastGood[provider];
				mutated = true;
			}
		}
		return mutated;
	} });
	const pruned = pruneAuthProfiles(cfg, deprecated);
	if (pruned.changed) note$1(Array.from(deprecated.values()).map((id) => `- removed ${id} from config`).join("\n"), "Doctor changes");
	return pruned.next;
}
function formatAuthIssueHint(issue) {
	if (issue.provider === "anthropic" && issue.profileId === CLAUDE_CLI_PROFILE_ID) return `Deprecated profile. Use ${formatCliCommand("openclaw models auth setup-token")} or ${formatCliCommand("openclaw configure")}.`;
	if (issue.provider === "openai-codex" && issue.profileId === CODEX_CLI_PROFILE_ID) return `Deprecated profile. Use ${formatCliCommand("openclaw models auth login --provider openai-codex")} or ${formatCliCommand("openclaw configure")}.`;
	return `Re-auth via \`${formatCliCommand("openclaw configure")}\` or \`${formatCliCommand("openclaw onboard")}\`.`;
}
function formatAuthIssueLine(issue) {
	const remaining = issue.remainingMs !== void 0 ? ` (${formatRemainingShort(issue.remainingMs)})` : "";
	const hint = formatAuthIssueHint(issue);
	return `- ${issue.profileId}: ${issue.status}${remaining}${hint ? ` — ${hint}` : ""}`;
}
async function noteAuthProfileHealth(params) {
	const store = ensureAuthProfileStore(void 0, { allowKeychainPrompt: params.allowKeychainPrompt });
	const unusable = (() => {
		const now = Date.now();
		const out = [];
		for (const profileId of Object.keys(store.usageStats ?? {})) {
			const until = resolveProfileUnusableUntilForDisplay(store, profileId);
			if (!until || now >= until) continue;
			const stats = store.usageStats?.[profileId];
			const remaining = formatRemainingShort(until - now);
			const kind = typeof stats?.disabledUntil === "number" && now < stats.disabledUntil ? `disabled${stats.disabledReason ? `:${stats.disabledReason}` : ""}` : "cooldown";
			const hint = kind.startsWith("disabled:billing") ? "Top up credits (provider billing) or switch provider." : "Wait for cooldown or switch provider.";
			out.push(`- ${profileId}: ${kind} (${remaining})${hint ? ` — ${hint}` : ""}`);
		}
		return out;
	})();
	if (unusable.length > 0) note$1(unusable.join("\n"), "Auth profile cooldowns");
	let summary = buildAuthHealthSummary({
		store,
		cfg: params.cfg,
		warnAfterMs: DEFAULT_OAUTH_WARN_MS
	});
	const findIssues = () => summary.profiles.filter((profile) => (profile.type === "oauth" || profile.type === "token") && (profile.status === "expired" || profile.status === "expiring" || profile.status === "missing"));
	let issues = findIssues();
	if (issues.length === 0) return;
	if (await params.prompter.confirmRepair({
		message: "Refresh expiring OAuth tokens now? (static tokens need re-auth)",
		initialValue: true
	})) {
		const refreshTargets = issues.filter((issue) => issue.type === "oauth" && [
			"expired",
			"expiring",
			"missing"
		].includes(issue.status));
		const errors = [];
		for (const profile of refreshTargets) try {
			await resolveApiKeyForProfile({
				cfg: params.cfg,
				store,
				profileId: profile.profileId
			});
		} catch (err) {
			errors.push(`- ${profile.profileId}: ${err instanceof Error ? err.message : String(err)}`);
		}
		if (errors.length > 0) note$1(errors.join("\n"), "OAuth refresh errors");
		summary = buildAuthHealthSummary({
			store: ensureAuthProfileStore(void 0, { allowKeychainPrompt: false }),
			cfg: params.cfg,
			warnAfterMs: DEFAULT_OAUTH_WARN_MS
		});
		issues = findIssues();
	}
	if (issues.length > 0) note$1(issues.map((issue) => formatAuthIssueLine({
		profileId: issue.profileId,
		provider: issue.provider,
		status: issue.status,
		remainingMs: issue.remainingMs
	})).join("\n"), "Model auth");
}

//#endregion
//#region src/commands/doctor-legacy-config.ts
function normalizeLegacyConfigValues(cfg) {
	const changes = [];
	let next = cfg;
	const legacyAckReaction = cfg.messages?.ackReaction?.trim();
	const hasWhatsAppConfig = cfg.channels?.whatsapp !== void 0;
	if (legacyAckReaction && hasWhatsAppConfig) {
		if (!(cfg.channels?.whatsapp?.ackReaction !== void 0)) {
			const legacyScope = cfg.messages?.ackReactionScope ?? "group-mentions";
			let direct = true;
			let group = "mentions";
			if (legacyScope === "all") {
				direct = true;
				group = "always";
			} else if (legacyScope === "direct") {
				direct = true;
				group = "never";
			} else if (legacyScope === "group-all") {
				direct = false;
				group = "always";
			} else if (legacyScope === "group-mentions") {
				direct = false;
				group = "mentions";
			}
			next = {
				...next,
				channels: {
					...next.channels,
					whatsapp: {
						...next.channels?.whatsapp,
						ackReaction: {
							emoji: legacyAckReaction,
							direct,
							group
						}
					}
				}
			};
			changes.push(`Copied messages.ackReaction → channels.whatsapp.ackReaction (scope: ${legacyScope}).`);
		}
	}
	return {
		config: next,
		changes
	};
}

//#endregion
//#region src/infra/state-migrations.fs.ts
function safeReadDir(dir) {
	try {
		return fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return [];
	}
}
function existsDir$1(dir) {
	try {
		return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
	} catch {
		return false;
	}
}
function ensureDir$1(dir) {
	fs.mkdirSync(dir, { recursive: true });
}
function fileExists(p) {
	try {
		return fs.existsSync(p) && fs.statSync(p).isFile();
	} catch {
		return false;
	}
}
function isLegacyWhatsAppAuthFile(name) {
	if (name === "creds.json" || name === "creds.json.bak") return true;
	if (!name.endsWith(".json")) return false;
	return /^(app-state-sync|session|sender-key|pre-key)-/.test(name);
}
function readSessionStoreJson5(storePath) {
	try {
		const raw = fs.readFileSync(storePath, "utf-8");
		const parsed = JSON5.parse(raw);
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return {
			store: parsed,
			ok: true
		};
	} catch {}
	return {
		store: {},
		ok: false
	};
}

//#endregion
//#region src/infra/state-migrations.ts
let autoMigrateStateDirChecked = false;
function isSurfaceGroupKey(key) {
	return key.includes(":group:") || key.includes(":channel:");
}
function isLegacyGroupKey(key) {
	const trimmed = key.trim();
	if (!trimmed) return false;
	if (trimmed.startsWith("group:")) return true;
	const lower = trimmed.toLowerCase();
	if (!lower.includes("@g.us")) return false;
	if (!trimmed.includes(":")) return true;
	if (lower.startsWith("whatsapp:") && !trimmed.includes(":group:")) return true;
	return false;
}
function canonicalizeSessionKeyForAgent(params) {
	const agentId = normalizeAgentId(params.agentId);
	const raw = params.key.trim();
	if (!raw) return raw;
	if (raw.toLowerCase() === "global" || raw.toLowerCase() === "unknown") return raw.toLowerCase();
	const canonicalMain = canonicalizeMainSessionAlias({
		cfg: { session: {
			scope: params.scope,
			mainKey: params.mainKey
		} },
		agentId,
		sessionKey: raw
	});
	if (canonicalMain !== raw) return canonicalMain.toLowerCase();
	if (raw.toLowerCase().startsWith("agent:")) return raw.toLowerCase();
	if (raw.toLowerCase().startsWith("subagent:")) return `agent:${agentId}:subagent:${raw.slice(9)}`.toLowerCase();
	if (raw.startsWith("group:")) {
		const id = raw.slice(6).trim();
		if (!id) return raw;
		return `agent:${agentId}:${id.toLowerCase().includes("@g.us") ? "whatsapp" : "unknown"}:group:${id}`.toLowerCase();
	}
	if (!raw.includes(":") && raw.toLowerCase().includes("@g.us")) return `agent:${agentId}:whatsapp:group:${raw}`.toLowerCase();
	if (raw.toLowerCase().startsWith("whatsapp:") && raw.toLowerCase().includes("@g.us")) {
		const cleaned = raw.slice(9).trim().replace(/^group:/i, "").trim();
		if (cleaned && !isSurfaceGroupKey(raw)) return `agent:${agentId}:whatsapp:group:${cleaned}`.toLowerCase();
	}
	if (isSurfaceGroupKey(raw)) return `agent:${agentId}:${raw}`.toLowerCase();
	return `agent:${agentId}:${raw}`.toLowerCase();
}
function pickLatestLegacyDirectEntry(store) {
	let best = null;
	let bestUpdated = -1;
	for (const [key, entry] of Object.entries(store)) {
		if (!entry || typeof entry !== "object") continue;
		const normalized = key.trim();
		if (!normalized) continue;
		if (normalized === "global") continue;
		if (normalized.startsWith("agent:")) continue;
		if (normalized.toLowerCase().startsWith("subagent:")) continue;
		if (isLegacyGroupKey(normalized) || isSurfaceGroupKey(normalized)) continue;
		const updatedAt = typeof entry.updatedAt === "number" ? entry.updatedAt : 0;
		if (updatedAt > bestUpdated) {
			bestUpdated = updatedAt;
			best = entry;
		}
	}
	return best;
}
function normalizeSessionEntry(entry) {
	const sessionId = typeof entry.sessionId === "string" ? entry.sessionId : null;
	if (!sessionId) return null;
	const updatedAt = typeof entry.updatedAt === "number" && Number.isFinite(entry.updatedAt) ? entry.updatedAt : Date.now();
	const normalized = {
		...entry,
		sessionId,
		updatedAt
	};
	const rec = normalized;
	if (typeof rec.groupChannel !== "string" && typeof rec.room === "string") rec.groupChannel = rec.room;
	delete rec.room;
	return normalized;
}
function resolveUpdatedAt(entry) {
	return typeof entry.updatedAt === "number" && Number.isFinite(entry.updatedAt) ? entry.updatedAt : 0;
}
function mergeSessionEntry(params) {
	if (!params.existing) return params.incoming;
	const existingUpdated = resolveUpdatedAt(params.existing);
	const incomingUpdated = resolveUpdatedAt(params.incoming);
	if (incomingUpdated > existingUpdated) return params.incoming;
	if (incomingUpdated < existingUpdated) return params.existing;
	return params.preferIncomingOnTie ? params.incoming : params.existing;
}
function canonicalizeSessionStore(params) {
	const canonical = {};
	const meta = /* @__PURE__ */ new Map();
	const legacyKeys = [];
	for (const [key, entry] of Object.entries(params.store)) {
		if (!entry || typeof entry !== "object") continue;
		const canonicalKey = canonicalizeSessionKeyForAgent({
			key,
			agentId: params.agentId,
			mainKey: params.mainKey,
			scope: params.scope
		});
		const isCanonical = canonicalKey === key;
		if (!isCanonical) legacyKeys.push(key);
		const existing = canonical[canonicalKey];
		if (!existing) {
			canonical[canonicalKey] = entry;
			meta.set(canonicalKey, {
				isCanonical,
				updatedAt: resolveUpdatedAt(entry)
			});
			continue;
		}
		const existingMeta = meta.get(canonicalKey);
		const incomingUpdated = resolveUpdatedAt(entry);
		const existingUpdated = existingMeta?.updatedAt ?? resolveUpdatedAt(existing);
		if (incomingUpdated > existingUpdated) {
			canonical[canonicalKey] = entry;
			meta.set(canonicalKey, {
				isCanonical,
				updatedAt: incomingUpdated
			});
			continue;
		}
		if (incomingUpdated < existingUpdated) continue;
		if (existingMeta?.isCanonical && !isCanonical) continue;
		if (!existingMeta?.isCanonical && isCanonical) {
			canonical[canonicalKey] = entry;
			meta.set(canonicalKey, {
				isCanonical,
				updatedAt: incomingUpdated
			});
			continue;
		}
	}
	return {
		store: canonical,
		legacyKeys
	};
}
function listLegacySessionKeys(params) {
	const legacy = [];
	for (const key of Object.keys(params.store)) if (canonicalizeSessionKeyForAgent({
		key,
		agentId: params.agentId,
		mainKey: params.mainKey,
		scope: params.scope
	}) !== key) legacy.push(key);
	return legacy;
}
function emptyDirOrMissing(dir) {
	if (!existsDir$1(dir)) return true;
	return safeReadDir(dir).length === 0;
}
function removeDirIfEmpty(dir) {
	if (!existsDir$1(dir)) return;
	if (!emptyDirOrMissing(dir)) return;
	try {
		fs.rmdirSync(dir);
	} catch {}
}
function resolveSymlinkTarget(linkPath) {
	try {
		const target = fs.readlinkSync(linkPath);
		return path.resolve(path.dirname(linkPath), target);
	} catch {
		return null;
	}
}
function formatStateDirMigration(legacyDir, targetDir) {
	return `State dir: ${legacyDir} → ${targetDir} (legacy path now symlinked)`;
}
function isDirPath(filePath) {
	try {
		return fs.statSync(filePath).isDirectory();
	} catch {
		return false;
	}
}
function isWithinDir(targetPath, rootDir) {
	const relative = path.relative(path.resolve(rootDir), path.resolve(targetPath));
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}
function isLegacyTreeSymlinkMirror(currentDir, realTargetDir) {
	let entries;
	try {
		entries = fs.readdirSync(currentDir, { withFileTypes: true });
	} catch {
		return false;
	}
	if (entries.length === 0) return false;
	for (const entry of entries) {
		const entryPath = path.join(currentDir, entry.name);
		let stat;
		try {
			stat = fs.lstatSync(entryPath);
		} catch {
			return false;
		}
		if (stat.isSymbolicLink()) {
			const resolvedTarget = resolveSymlinkTarget(entryPath);
			if (!resolvedTarget) return false;
			let resolvedRealTarget;
			try {
				resolvedRealTarget = fs.realpathSync(resolvedTarget);
			} catch {
				return false;
			}
			if (!isWithinDir(resolvedRealTarget, realTargetDir)) return false;
			continue;
		}
		if (stat.isDirectory()) {
			if (!isLegacyTreeSymlinkMirror(entryPath, realTargetDir)) return false;
			continue;
		}
		return false;
	}
	return true;
}
function isLegacyDirSymlinkMirror(legacyDir, targetDir) {
	let realTargetDir;
	try {
		realTargetDir = fs.realpathSync(targetDir);
	} catch {
		return false;
	}
	return isLegacyTreeSymlinkMirror(legacyDir, realTargetDir);
}
async function autoMigrateLegacyStateDir(params) {
	if (autoMigrateStateDirChecked) return {
		migrated: false,
		skipped: true,
		changes: [],
		warnings: []
	};
	autoMigrateStateDirChecked = true;
	if ((params.env ?? process.env).OPENCLAW_STATE_DIR?.trim()) return {
		migrated: false,
		skipped: true,
		changes: [],
		warnings: []
	};
	const homedir = params.homedir ?? os.homedir;
	const targetDir = resolveNewStateDir(homedir);
	const legacyDirs = resolveLegacyStateDirs(homedir);
	let legacyDir = legacyDirs.find((dir) => {
		try {
			return fs.existsSync(dir);
		} catch {
			return false;
		}
	});
	const warnings = [];
	const changes = [];
	let legacyStat = null;
	try {
		legacyStat = legacyDir ? fs.lstatSync(legacyDir) : null;
	} catch {
		legacyStat = null;
	}
	if (!legacyStat) return {
		migrated: false,
		skipped: false,
		changes,
		warnings
	};
	if (!legacyStat.isDirectory() && !legacyStat.isSymbolicLink()) {
		warnings.push(`Legacy state path is not a directory: ${legacyDir}`);
		return {
			migrated: false,
			skipped: false,
			changes,
			warnings
		};
	}
	let symlinkDepth = 0;
	while (legacyStat.isSymbolicLink()) {
		const legacyTarget = legacyDir ? resolveSymlinkTarget(legacyDir) : null;
		if (!legacyTarget) {
			warnings.push(`Legacy state dir is a symlink (${legacyDir ?? "unknown"}); could not resolve target.`);
			return {
				migrated: false,
				skipped: false,
				changes,
				warnings
			};
		}
		if (path.resolve(legacyTarget) === path.resolve(targetDir)) return {
			migrated: false,
			skipped: false,
			changes,
			warnings
		};
		if (legacyDirs.some((dir) => path.resolve(dir) === path.resolve(legacyTarget))) {
			legacyDir = legacyTarget;
			try {
				legacyStat = fs.lstatSync(legacyDir);
			} catch {
				legacyStat = null;
			}
			if (!legacyStat) {
				warnings.push(`Legacy state dir missing after symlink resolution: ${legacyDir}`);
				return {
					migrated: false,
					skipped: false,
					changes,
					warnings
				};
			}
			if (!legacyStat.isDirectory() && !legacyStat.isSymbolicLink()) {
				warnings.push(`Legacy state path is not a directory: ${legacyDir}`);
				return {
					migrated: false,
					skipped: false,
					changes,
					warnings
				};
			}
			symlinkDepth += 1;
			if (symlinkDepth > 2) {
				warnings.push(`Legacy state dir symlink chain too deep: ${legacyDir}`);
				return {
					migrated: false,
					skipped: false,
					changes,
					warnings
				};
			}
			continue;
		}
		warnings.push(`Legacy state dir is a symlink (${legacyDir ?? "unknown"} → ${legacyTarget}); skipping auto-migration.`);
		return {
			migrated: false,
			skipped: false,
			changes,
			warnings
		};
	}
	if (isDirPath(targetDir)) {
		if (legacyDir && isLegacyDirSymlinkMirror(legacyDir, targetDir)) return {
			migrated: false,
			skipped: false,
			changes,
			warnings
		};
		warnings.push(`State dir migration skipped: target already exists (${targetDir}). Remove or merge manually.`);
		return {
			migrated: false,
			skipped: false,
			changes,
			warnings
		};
	}
	try {
		if (!legacyDir) throw new Error("Legacy state dir not found");
		fs.renameSync(legacyDir, targetDir);
	} catch (err) {
		warnings.push(`Failed to move legacy state dir (${legacyDir ?? "unknown"} → ${targetDir}): ${String(err)}`);
		return {
			migrated: false,
			skipped: false,
			changes,
			warnings
		};
	}
	try {
		if (!legacyDir) throw new Error("Legacy state dir not found");
		fs.symlinkSync(targetDir, legacyDir, "dir");
		changes.push(formatStateDirMigration(legacyDir, targetDir));
	} catch (err) {
		try {
			if (process.platform === "win32") {
				if (!legacyDir) throw new Error("Legacy state dir not found", { cause: err });
				fs.symlinkSync(targetDir, legacyDir, "junction");
				changes.push(formatStateDirMigration(legacyDir, targetDir));
			} else throw err;
		} catch (fallbackErr) {
			try {
				if (!legacyDir) throw new Error("Legacy state dir not found", { cause: fallbackErr });
				fs.renameSync(targetDir, legacyDir);
				warnings.push(`State dir migration rolled back (failed to link legacy path): ${String(fallbackErr)}`);
				return {
					migrated: false,
					skipped: false,
					changes: [],
					warnings
				};
			} catch (rollbackErr) {
				warnings.push(`State dir moved but failed to link legacy path (${legacyDir ?? "unknown"} → ${targetDir}): ${String(fallbackErr)}`);
				warnings.push(`Rollback failed; set OPENCLAW_STATE_DIR=${targetDir} to avoid split state: ${String(rollbackErr)}`);
				changes.push(`State dir: ${legacyDir ?? "unknown"} → ${targetDir}`);
			}
		}
	}
	return {
		migrated: changes.length > 0,
		skipped: false,
		changes,
		warnings
	};
}
async function detectLegacyStateMigrations(params) {
	const env = params.env ?? process.env;
	const stateDir = resolveStateDir(env, params.homedir ?? os.homedir);
	const oauthDir = resolveOAuthDir(env, stateDir);
	const targetAgentId = normalizeAgentId(resolveDefaultAgentId(params.cfg));
	const rawMainKey = params.cfg.session?.mainKey;
	const targetMainKey = typeof rawMainKey === "string" && rawMainKey.trim().length > 0 ? rawMainKey.trim() : DEFAULT_MAIN_KEY;
	const targetScope = params.cfg.session?.scope;
	const sessionsLegacyDir = path.join(stateDir, "sessions");
	const sessionsLegacyStorePath = path.join(sessionsLegacyDir, "sessions.json");
	const sessionsTargetDir = path.join(stateDir, "agents", targetAgentId, "sessions");
	const sessionsTargetStorePath = path.join(sessionsTargetDir, "sessions.json");
	const legacySessionEntries = safeReadDir(sessionsLegacyDir);
	const hasLegacySessions = fileExists(sessionsLegacyStorePath) || legacySessionEntries.some((e) => e.isFile() && e.name.endsWith(".jsonl"));
	const targetSessionParsed = fileExists(sessionsTargetStorePath) ? readSessionStoreJson5(sessionsTargetStorePath) : {
		store: {},
		ok: true
	};
	const legacyKeys = targetSessionParsed.ok ? listLegacySessionKeys({
		store: targetSessionParsed.store,
		agentId: targetAgentId,
		mainKey: targetMainKey,
		scope: targetScope
	}) : [];
	const legacyAgentDir = path.join(stateDir, "agent");
	const targetAgentDir = path.join(stateDir, "agents", targetAgentId, "agent");
	const hasLegacyAgentDir = existsDir$1(legacyAgentDir);
	const targetWhatsAppAuthDir = path.join(oauthDir, "whatsapp", DEFAULT_ACCOUNT_ID);
	const hasLegacyWhatsAppAuth = fileExists(path.join(oauthDir, "creds.json")) && !fileExists(path.join(targetWhatsAppAuthDir, "creds.json"));
	const preview = [];
	if (hasLegacySessions) preview.push(`- Sessions: ${sessionsLegacyDir} → ${sessionsTargetDir}`);
	if (legacyKeys.length > 0) preview.push(`- Sessions: canonicalize legacy keys in ${sessionsTargetStorePath}`);
	if (hasLegacyAgentDir) preview.push(`- Agent dir: ${legacyAgentDir} → ${targetAgentDir}`);
	if (hasLegacyWhatsAppAuth) preview.push(`- WhatsApp auth: ${oauthDir} → ${targetWhatsAppAuthDir} (keep oauth.json)`);
	return {
		targetAgentId,
		targetMainKey,
		targetScope,
		stateDir,
		oauthDir,
		sessions: {
			legacyDir: sessionsLegacyDir,
			legacyStorePath: sessionsLegacyStorePath,
			targetDir: sessionsTargetDir,
			targetStorePath: sessionsTargetStorePath,
			hasLegacy: hasLegacySessions || legacyKeys.length > 0,
			legacyKeys
		},
		agentDir: {
			legacyDir: legacyAgentDir,
			targetDir: targetAgentDir,
			hasLegacy: hasLegacyAgentDir
		},
		whatsappAuth: {
			legacyDir: oauthDir,
			targetDir: targetWhatsAppAuthDir,
			hasLegacy: hasLegacyWhatsAppAuth
		},
		preview
	};
}
async function migrateLegacySessions(detected, now) {
	const changes = [];
	const warnings = [];
	if (!detected.sessions.hasLegacy) return {
		changes,
		warnings
	};
	ensureDir$1(detected.sessions.targetDir);
	const legacyParsed = fileExists(detected.sessions.legacyStorePath) ? readSessionStoreJson5(detected.sessions.legacyStorePath) : {
		store: {},
		ok: true
	};
	const targetParsed = fileExists(detected.sessions.targetStorePath) ? readSessionStoreJson5(detected.sessions.targetStorePath) : {
		store: {},
		ok: true
	};
	const legacyStore = legacyParsed.store;
	const targetStore = targetParsed.store;
	const canonicalizedTarget = canonicalizeSessionStore({
		store: targetStore,
		agentId: detected.targetAgentId,
		mainKey: detected.targetMainKey,
		scope: detected.targetScope
	});
	const canonicalizedLegacy = canonicalizeSessionStore({
		store: legacyStore,
		agentId: detected.targetAgentId,
		mainKey: detected.targetMainKey,
		scope: detected.targetScope
	});
	const merged = { ...canonicalizedTarget.store };
	for (const [key, entry] of Object.entries(canonicalizedLegacy.store)) merged[key] = mergeSessionEntry({
		existing: merged[key],
		incoming: entry,
		preferIncomingOnTie: false
	});
	const mainKey = buildAgentMainSessionKey({
		agentId: detected.targetAgentId,
		mainKey: detected.targetMainKey
	});
	if (!merged[mainKey]) {
		const latest = pickLatestLegacyDirectEntry(legacyStore);
		if (latest?.sessionId) {
			merged[mainKey] = latest;
			changes.push(`Migrated latest direct-chat session → ${mainKey}`);
		}
	}
	if (!legacyParsed.ok) warnings.push(`Legacy sessions store unreadable; left in place at ${detected.sessions.legacyStorePath}`);
	if ((legacyParsed.ok || targetParsed.ok) && (Object.keys(legacyStore).length > 0 || Object.keys(targetStore).length > 0)) {
		const normalized = {};
		for (const [key, entry] of Object.entries(merged)) {
			const normalizedEntry = normalizeSessionEntry(entry);
			if (!normalizedEntry) continue;
			normalized[key] = normalizedEntry;
		}
		await saveSessionStore(detected.sessions.targetStorePath, normalized, { skipMaintenance: true });
		changes.push(`Merged sessions store → ${detected.sessions.targetStorePath}`);
		if (canonicalizedTarget.legacyKeys.length > 0) changes.push(`Canonicalized ${canonicalizedTarget.legacyKeys.length} legacy session key(s)`);
	}
	const entries = safeReadDir(detected.sessions.legacyDir);
	for (const entry of entries) {
		if (!entry.isFile()) continue;
		if (entry.name === "sessions.json") continue;
		const from = path.join(detected.sessions.legacyDir, entry.name);
		const to = path.join(detected.sessions.targetDir, entry.name);
		if (fileExists(to)) continue;
		try {
			fs.renameSync(from, to);
			changes.push(`Moved ${entry.name} → agents/${detected.targetAgentId}/sessions`);
		} catch (err) {
			warnings.push(`Failed moving ${from}: ${String(err)}`);
		}
	}
	if (legacyParsed.ok) try {
		if (fileExists(detected.sessions.legacyStorePath)) fs.rmSync(detected.sessions.legacyStorePath, { force: true });
	} catch {}
	removeDirIfEmpty(detected.sessions.legacyDir);
	if (safeReadDir(detected.sessions.legacyDir).filter((e) => e.isFile()).length > 0) {
		const backupDir = `${detected.sessions.legacyDir}.legacy-${now()}`;
		try {
			fs.renameSync(detected.sessions.legacyDir, backupDir);
			warnings.push(`Left legacy sessions at ${backupDir}`);
		} catch {}
	}
	return {
		changes,
		warnings
	};
}
async function migrateLegacyAgentDir(detected, now) {
	const changes = [];
	const warnings = [];
	if (!detected.agentDir.hasLegacy) return {
		changes,
		warnings
	};
	ensureDir$1(detected.agentDir.targetDir);
	const entries = safeReadDir(detected.agentDir.legacyDir);
	for (const entry of entries) {
		const from = path.join(detected.agentDir.legacyDir, entry.name);
		const to = path.join(detected.agentDir.targetDir, entry.name);
		if (fs.existsSync(to)) continue;
		try {
			fs.renameSync(from, to);
			changes.push(`Moved agent file ${entry.name} → agents/${detected.targetAgentId}/agent`);
		} catch (err) {
			warnings.push(`Failed moving ${from}: ${String(err)}`);
		}
	}
	removeDirIfEmpty(detected.agentDir.legacyDir);
	if (!emptyDirOrMissing(detected.agentDir.legacyDir)) {
		const backupDir = path.join(detected.stateDir, "agents", detected.targetAgentId, `agent.legacy-${now()}`);
		try {
			fs.renameSync(detected.agentDir.legacyDir, backupDir);
			warnings.push(`Left legacy agent dir at ${backupDir}`);
		} catch (err) {
			warnings.push(`Failed relocating legacy agent dir: ${String(err)}`);
		}
	}
	return {
		changes,
		warnings
	};
}
async function migrateLegacyWhatsAppAuth(detected) {
	const changes = [];
	const warnings = [];
	if (!detected.whatsappAuth.hasLegacy) return {
		changes,
		warnings
	};
	ensureDir$1(detected.whatsappAuth.targetDir);
	const entries = safeReadDir(detected.whatsappAuth.legacyDir);
	for (const entry of entries) {
		if (!entry.isFile()) continue;
		if (entry.name === "oauth.json") continue;
		if (!isLegacyWhatsAppAuthFile(entry.name)) continue;
		const from = path.join(detected.whatsappAuth.legacyDir, entry.name);
		const to = path.join(detected.whatsappAuth.targetDir, entry.name);
		if (fileExists(to)) continue;
		try {
			fs.renameSync(from, to);
			changes.push(`Moved WhatsApp auth ${entry.name} → whatsapp/default`);
		} catch (err) {
			warnings.push(`Failed moving ${from}: ${String(err)}`);
		}
	}
	return {
		changes,
		warnings
	};
}
async function runLegacyStateMigrations(params) {
	const now = params.now ?? (() => Date.now());
	const detected = params.detected;
	const sessions = await migrateLegacySessions(detected, now);
	const agentDir = await migrateLegacyAgentDir(detected, now);
	const whatsappAuth = await migrateLegacyWhatsAppAuth(detected);
	return {
		changes: [
			...sessions.changes,
			...agentDir.changes,
			...whatsappAuth.changes
		],
		warnings: [
			...sessions.warnings,
			...agentDir.warnings,
			...whatsappAuth.warnings
		]
	};
}

//#endregion
//#region src/commands/doctor-config-flow.ts
function normalizeIssuePath(path) {
	return path.filter((part) => typeof part !== "symbol");
}
function isUnrecognizedKeysIssue(issue) {
	return issue.code === "unrecognized_keys";
}
function formatPath(parts) {
	if (parts.length === 0) return "<root>";
	let out = "";
	for (const part of parts) {
		if (typeof part === "number") {
			out += `[${part}]`;
			continue;
		}
		out = out ? `${out}.${part}` : part;
	}
	return out || "<root>";
}
function resolvePathTarget(root, path) {
	let current = root;
	for (const part of path) {
		if (typeof part === "number") {
			if (!Array.isArray(current)) return null;
			if (part < 0 || part >= current.length) return null;
			current = current[part];
			continue;
		}
		if (!current || typeof current !== "object" || Array.isArray(current)) return null;
		const record = current;
		if (!(part in record)) return null;
		current = record[part];
	}
	return current;
}
function stripUnknownConfigKeys(config) {
	const parsed = OpenClawSchema.safeParse(config);
	if (parsed.success) return {
		config,
		removed: []
	};
	const next = structuredClone(config);
	const removed = [];
	for (const issue of parsed.error.issues) {
		if (!isUnrecognizedKeysIssue(issue)) continue;
		const path = normalizeIssuePath(issue.path);
		const target = resolvePathTarget(next, path);
		if (!target || typeof target !== "object" || Array.isArray(target)) continue;
		const record = target;
		for (const key of issue.keys) {
			if (typeof key !== "string") continue;
			if (!(key in record)) continue;
			delete record[key];
			removed.push(formatPath([...path, key]));
		}
	}
	return {
		config: next,
		removed
	};
}
function noteOpencodeProviderOverrides(cfg) {
	const providers = cfg.models?.providers;
	if (!providers) return;
	const overrides = [];
	if (providers.opencode) overrides.push("opencode");
	if (providers["opencode-zen"]) overrides.push("opencode-zen");
	if (overrides.length === 0) return;
	const lines = overrides.flatMap((id) => {
		const providerEntry = providers[id];
		const api = isRecord(providerEntry) && typeof providerEntry.api === "string" ? providerEntry.api : void 0;
		return [`- models.providers.${id} is set; this overrides the built-in OpenCode Zen catalog.`, api ? `- models.providers.${id}.api=${api}` : null].filter((line) => Boolean(line));
	});
	lines.push("- Remove these entries to restore per-model API routing + costs (then re-run onboarding if needed).");
	note$1(lines.join("\n"), "OpenCode Zen");
}
async function maybeMigrateLegacyConfig() {
	const changes = [];
	const home = resolveHomeDir$1();
	if (!home) return changes;
	const targetDir = path.join(home, ".openclaw");
	const targetPath = path.join(targetDir, "openclaw.json");
	try {
		await fsPromises.access(targetPath);
		return changes;
	} catch {}
	const legacyCandidates = [
		path.join(home, ".clawdbot", "clawdbot.json"),
		path.join(home, ".moltbot", "moltbot.json"),
		path.join(home, ".moldbot", "moldbot.json")
	];
	let legacyPath = null;
	for (const candidate of legacyCandidates) try {
		await fsPromises.access(candidate);
		legacyPath = candidate;
		break;
	} catch {}
	if (!legacyPath) return changes;
	await fsPromises.mkdir(targetDir, { recursive: true });
	try {
		await fsPromises.copyFile(legacyPath, targetPath, fsPromises.constants.COPYFILE_EXCL);
		changes.push(`Migrated legacy config: ${legacyPath} -> ${targetPath}`);
	} catch {}
	return changes;
}
async function loadAndMaybeMigrateDoctorConfig(params) {
	const shouldRepair = params.options.repair === true || params.options.yes === true;
	const stateDirResult = await autoMigrateLegacyStateDir({ env: process.env });
	if (stateDirResult.changes.length > 0) note$1(stateDirResult.changes.map((entry) => `- ${entry}`).join("\n"), "Doctor changes");
	if (stateDirResult.warnings.length > 0) note$1(stateDirResult.warnings.map((entry) => `- ${entry}`).join("\n"), "Doctor warnings");
	const legacyConfigChanges = await maybeMigrateLegacyConfig();
	if (legacyConfigChanges.length > 0) note$1(legacyConfigChanges.map((entry) => `- ${entry}`).join("\n"), "Doctor changes");
	let snapshot = await readConfigFileSnapshot();
	const baseCfg = snapshot.config ?? {};
	let cfg = baseCfg;
	let candidate = structuredClone(baseCfg);
	let pendingChanges = false;
	let shouldWriteConfig = false;
	const fixHints = [];
	if (snapshot.exists && !snapshot.valid && snapshot.legacyIssues.length === 0) note$1("Config invalid; doctor will run with best-effort config.", "Config");
	const warnings = snapshot.warnings ?? [];
	if (warnings.length > 0) note$1(warnings.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n"), "Config warnings");
	if (snapshot.legacyIssues.length > 0) {
		note$1(snapshot.legacyIssues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n"), "Legacy config keys detected");
		const { config: migrated, changes } = migrateLegacyConfig(snapshot.parsed);
		if (changes.length > 0) note$1(changes.join("\n"), "Doctor changes");
		if (migrated) {
			candidate = migrated;
			pendingChanges = pendingChanges || changes.length > 0;
		}
		if (shouldRepair) {
			if (migrated) cfg = migrated;
		} else fixHints.push(`Run "${formatCliCommand("openclaw doctor --fix")}" to apply legacy migrations.`);
	}
	const normalized = normalizeLegacyConfigValues(candidate);
	if (normalized.changes.length > 0) {
		note$1(normalized.changes.join("\n"), "Doctor changes");
		candidate = normalized.config;
		pendingChanges = true;
		if (shouldRepair) cfg = normalized.config;
		else fixHints.push(`Run "${formatCliCommand("openclaw doctor --fix")}" to apply these changes.`);
	}
	const autoEnable = applyPluginAutoEnable({
		config: candidate,
		env: process.env
	});
	if (autoEnable.changes.length > 0) {
		note$1(autoEnable.changes.join("\n"), "Doctor changes");
		candidate = autoEnable.config;
		pendingChanges = true;
		if (shouldRepair) cfg = autoEnable.config;
		else fixHints.push(`Run "${formatCliCommand("openclaw doctor --fix")}" to apply these changes.`);
	}
	const unknown = stripUnknownConfigKeys(candidate);
	if (unknown.removed.length > 0) {
		const lines = unknown.removed.map((path) => `- ${path}`).join("\n");
		candidate = unknown.config;
		pendingChanges = true;
		if (shouldRepair) {
			cfg = unknown.config;
			note$1(lines, "Doctor changes");
		} else {
			note$1(lines, "Unknown config keys");
			fixHints.push("Run \"openclaw doctor --fix\" to remove these keys.");
		}
	}
	if (!shouldRepair && pendingChanges) {
		if (await params.confirm({
			message: "Apply recommended config repairs now?",
			initialValue: true
		})) {
			cfg = candidate;
			shouldWriteConfig = true;
		} else if (fixHints.length > 0) note$1(fixHints.join("\n"), "Doctor");
	}
	noteOpencodeProviderOverrides(cfg);
	return {
		cfg,
		path: snapshot.path ?? CONFIG_PATH,
		shouldWriteConfig
	};
}

//#endregion
//#region src/commands/doctor-format.ts
function formatGatewayRuntimeSummary(runtime) {
	if (!runtime) return null;
	const status = runtime.status ?? "unknown";
	const details = [];
	if (runtime.pid) details.push(`pid ${runtime.pid}`);
	if (runtime.state && runtime.state.toLowerCase() !== status) details.push(`state ${runtime.state}`);
	if (runtime.subState) details.push(`sub ${runtime.subState}`);
	if (runtime.lastExitStatus !== void 0) details.push(`last exit ${runtime.lastExitStatus}`);
	if (runtime.lastExitReason) details.push(`reason ${runtime.lastExitReason}`);
	if (runtime.lastRunResult) details.push(`last run ${runtime.lastRunResult}`);
	if (runtime.lastRunTime) details.push(`last run time ${runtime.lastRunTime}`);
	if (runtime.detail) details.push(runtime.detail);
	return details.length > 0 ? `${status} (${details.join(", ")})` : status;
}
function buildGatewayRuntimeHints(runtime, options = {}) {
	const hints = [];
	if (!runtime) return hints;
	const platform = options.platform ?? process.platform;
	const env = options.env ?? process.env;
	const fileLog = (() => {
		try {
			return getResolvedLoggerSettings().file;
		} catch {
			return null;
		}
	})();
	if (platform === "linux" && isSystemdUnavailableDetail(runtime.detail)) {
		hints.push(...renderSystemdUnavailableHints({ wsl: isWSLEnv() }));
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		return hints;
	}
	if (runtime.cachedLabel && platform === "darwin") {
		const label = resolveGatewayLaunchAgentLabel(env.OPENCLAW_PROFILE);
		hints.push(`LaunchAgent label cached but plist missing. Clear with: launchctl bootout gui/$UID/${label}`);
		hints.push(`Then reinstall: ${formatCliCommand("openclaw gateway install", env)}`);
	}
	if (runtime.missingUnit) {
		hints.push(`Service not installed. Run: ${formatCliCommand("openclaw gateway install", env)}`);
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		return hints;
	}
	if (runtime.status === "stopped") {
		hints.push("Service is loaded but not running (likely exited immediately).");
		if (fileLog) hints.push(`File logs: ${fileLog}`);
		if (platform === "darwin") {
			const logs = resolveGatewayLogPaths(env);
			hints.push(`Launchd stdout (if installed): ${logs.stdoutPath}`);
			hints.push(`Launchd stderr (if installed): ${logs.stderrPath}`);
		} else if (platform === "linux") {
			const unit = resolveGatewaySystemdServiceName(env.OPENCLAW_PROFILE);
			hints.push(`Logs: journalctl --user -u ${unit}.service -n 200 --no-pager`);
		} else if (platform === "win32") {
			const task = resolveGatewayWindowsTaskName(env.OPENCLAW_PROFILE);
			hints.push(`Logs: schtasks /Query /TN "${task}" /V /FO LIST`);
		}
	}
	return hints;
}

//#endregion
//#region src/commands/doctor-gateway-daemon-flow.ts
async function maybeRepairLaunchAgentBootstrap(params) {
	if (process.platform !== "darwin") return false;
	if (!await isLaunchAgentListed({ env: params.env })) return false;
	if (await isLaunchAgentLoaded({ env: params.env })) return false;
	if (!await launchAgentPlistExists(params.env)) return false;
	note$1("LaunchAgent is listed but not loaded in launchd.", `${params.title} LaunchAgent`);
	if (!await params.prompter.confirmSkipInNonInteractive({
		message: `Repair ${params.title} LaunchAgent bootstrap now?`,
		initialValue: true
	})) return false;
	params.runtime.log(`Bootstrapping ${params.title} LaunchAgent...`);
	const repair = await repairLaunchAgentBootstrap({ env: params.env });
	if (!repair.ok) {
		params.runtime.error(`${params.title} LaunchAgent bootstrap failed: ${repair.detail ?? "unknown error"}`);
		return false;
	}
	if (!await isLaunchAgentLoaded({ env: params.env })) {
		params.runtime.error(`${params.title} LaunchAgent still not loaded after repair.`);
		return false;
	}
	note$1(`${params.title} LaunchAgent repaired.`, `${params.title} LaunchAgent`);
	return true;
}
async function maybeRepairGatewayDaemon(params) {
	if (params.healthOk) return;
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch {
		loaded = false;
	}
	let serviceRuntime;
	if (loaded) serviceRuntime = await service.readRuntime(process.env).catch(() => void 0);
	if (process.platform === "darwin" && params.cfg.gateway?.mode !== "remote") {
		const gatewayRepaired = await maybeRepairLaunchAgentBootstrap({
			env: process.env,
			title: "Gateway",
			runtime: params.runtime,
			prompter: params.prompter
		});
		await maybeRepairLaunchAgentBootstrap({
			env: {
				...process.env,
				OPENCLAW_LAUNCHD_LABEL: resolveNodeLaunchAgentLabel()
			},
			title: "Node",
			runtime: params.runtime,
			prompter: params.prompter
		});
		if (gatewayRepaired) {
			loaded = await service.isLoaded({ env: process.env });
			if (loaded) serviceRuntime = await service.readRuntime(process.env).catch(() => void 0);
		}
	}
	if (params.cfg.gateway?.mode !== "remote") {
		const diagnostics = await inspectPortUsage(resolveGatewayPort(params.cfg, process.env));
		if (diagnostics.status === "busy") note$1(formatPortDiagnostics(diagnostics).join("\n"), "Gateway port");
		else if (loaded && serviceRuntime?.status === "running") {
			const lastError = await readLastGatewayErrorLine(process.env);
			if (lastError) note$1(`Last gateway error: ${lastError}`, "Gateway");
		}
	}
	if (!loaded) {
		if (process.platform === "linux") {
			if (!await isSystemdUserServiceAvailable().catch(() => false)) {
				note$1(renderSystemdUnavailableHints({ wsl: await isWSL() }).join("\n"), "Gateway");
				return;
			}
		}
		note$1("Gateway service not installed.", "Gateway");
		if (params.cfg.gateway?.mode !== "remote") {
			if (await params.prompter.confirmSkipInNonInteractive({
				message: "Install gateway service now?",
				initialValue: true
			})) {
				const daemonRuntime = await params.prompter.select({
					message: "Gateway service runtime",
					options: GATEWAY_DAEMON_RUNTIME_OPTIONS,
					initialValue: DEFAULT_GATEWAY_DAEMON_RUNTIME
				}, DEFAULT_GATEWAY_DAEMON_RUNTIME);
				const port = resolveGatewayPort(params.cfg, process.env);
				const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
					env: process.env,
					port,
					token: params.cfg.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN,
					runtime: daemonRuntime,
					warn: (message, title) => note$1(message, title),
					config: params.cfg
				});
				try {
					await service.install({
						env: process.env,
						stdout: process.stdout,
						programArguments,
						workingDirectory,
						environment
					});
				} catch (err) {
					note$1(`Gateway service install failed: ${String(err)}`, "Gateway");
					note$1(gatewayInstallErrorHint(), "Gateway");
				}
			}
		}
		return;
	}
	const summary = formatGatewayRuntimeSummary(serviceRuntime);
	const hints = buildGatewayRuntimeHints(serviceRuntime, {
		platform: process.platform,
		env: process.env
	});
	if (summary || hints.length > 0) {
		const lines = [];
		if (summary) lines.push(`Runtime: ${summary}`);
		lines.push(...hints);
		note$1(lines.join("\n"), "Gateway");
	}
	if (serviceRuntime?.status !== "running") {
		if (await params.prompter.confirmSkipInNonInteractive({
			message: "Start gateway service now?",
			initialValue: true
		})) {
			await service.restart({
				env: process.env,
				stdout: process.stdout
			});
			await sleep(1500);
		}
	}
	if (process.platform === "darwin") {
		const label = resolveGatewayLaunchAgentLabel(process.env.OPENCLAW_PROFILE);
		note$1(`LaunchAgent loaded; stopping requires "${formatCliCommand("openclaw gateway stop")}" or launchctl bootout gui/$UID/${label}.`, "Gateway");
	}
	if (serviceRuntime?.status === "running") {
		if (await params.prompter.confirmSkipInNonInteractive({
			message: "Restart gateway service now?",
			initialValue: true
		})) {
			await service.restart({
				env: process.env,
				stdout: process.stdout
			});
			await sleep(1500);
			try {
				await healthCommand({
					json: false,
					timeoutMs: 1e4
				}, params.runtime);
			} catch (err) {
				if (String(err).includes("gateway closed")) {
					note$1("Gateway not running.", "Gateway");
					note$1(params.gatewayDetailsMessage, "Gateway connection");
				} else params.runtime.error(formatHealthCheckFailure(err));
			}
		}
	}
}

//#endregion
//#region src/commands/doctor-gateway-health.ts
async function checkGatewayHealth(params) {
	const gatewayDetails = buildGatewayConnectionDetails({ config: params.cfg });
	const timeoutMs = typeof params.timeoutMs === "number" && params.timeoutMs > 0 ? params.timeoutMs : 1e4;
	let healthOk = false;
	try {
		await healthCommand({
			json: false,
			timeoutMs,
			config: params.cfg
		}, params.runtime);
		healthOk = true;
	} catch (err) {
		if (String(err).includes("gateway closed")) {
			note$1("Gateway not running.", "Gateway");
			note$1(gatewayDetails.message, "Gateway connection");
		} else params.runtime.error(formatHealthCheckFailure(err));
	}
	if (healthOk) try {
		const issues = collectChannelStatusIssues(await callGateway({
			method: "channels.status",
			params: {
				probe: true,
				timeoutMs: 5e3
			},
			timeoutMs: 6e3
		}));
		if (issues.length > 0) note$1(issues.map((issue) => `- ${issue.channel} ${issue.accountId}: ${issue.message}${issue.fix ? ` (${issue.fix})` : ""}`).join("\n"), "Channel warnings");
	} catch {}
	return { healthOk };
}

//#endregion
//#region src/commands/doctor-gateway-services.ts
const execFileAsync$1 = promisify(execFile);
function detectGatewayRuntime(programArguments) {
	const first = programArguments?.[0];
	if (first) {
		const base = path.basename(first).toLowerCase();
		if (base === "bun" || base === "bun.exe") return "bun";
		if (base === "node" || base === "node.exe") return "node";
	}
	return DEFAULT_GATEWAY_DAEMON_RUNTIME;
}
function findGatewayEntrypoint(programArguments) {
	if (!programArguments || programArguments.length === 0) return null;
	const gatewayIndex = programArguments.indexOf("gateway");
	if (gatewayIndex <= 0) return null;
	return programArguments[gatewayIndex - 1] ?? null;
}
function normalizeExecutablePath(value) {
	return path.resolve(value);
}
function extractDetailPath(detail, prefix) {
	if (!detail.startsWith(prefix)) return null;
	const value = detail.slice(prefix.length).trim();
	return value.length > 0 ? value : null;
}
async function cleanupLegacyLaunchdService(params) {
	await execFileAsync$1("launchctl", [
		"bootout",
		typeof process.getuid === "function" ? `gui/${process.getuid()}` : "gui/501",
		params.plistPath
	]).catch(() => void 0);
	await execFileAsync$1("launchctl", ["unload", params.plistPath]).catch(() => void 0);
	const trashDir = path.join(os.homedir(), ".Trash");
	try {
		await fsPromises.mkdir(trashDir, { recursive: true });
	} catch {}
	try {
		await fsPromises.access(params.plistPath);
	} catch {
		return null;
	}
	const dest = path.join(trashDir, `${params.label}-${Date.now()}.plist`);
	try {
		await fsPromises.rename(params.plistPath, dest);
		return dest;
	} catch {
		return null;
	}
}
async function maybeRepairGatewayServiceConfig(cfg, mode, runtime, prompter) {
	if (resolveIsNixMode(process.env)) {
		note$1("Nix mode detected; skip service updates.", "Gateway");
		return;
	}
	if (mode === "remote") {
		note$1("Gateway mode is remote; skipped local service audit.", "Gateway");
		return;
	}
	const service = resolveGatewayService();
	let command = null;
	try {
		command = await service.readCommand(process.env);
	} catch {
		command = null;
	}
	if (!command) return;
	const audit = await auditGatewayServiceConfig({
		env: process.env,
		command
	});
	const needsNodeRuntime = needsNodeRuntimeMigration(audit.issues);
	const systemNodeInfo = needsNodeRuntime ? await resolveSystemNodeInfo({ env: process.env }) : null;
	const systemNodePath = systemNodeInfo?.supported ? systemNodeInfo.path : null;
	if (needsNodeRuntime && !systemNodePath) {
		const warning = renderSystemNodeWarning(systemNodeInfo);
		if (warning) note$1(warning, "Gateway runtime");
		note$1("System Node 22+ not found. Install via Homebrew/apt/choco and rerun doctor to migrate off Bun/version managers.", "Gateway runtime");
	}
	const port = resolveGatewayPort(cfg, process.env);
	const runtimeChoice = detectGatewayRuntime(command.programArguments);
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		token: cfg.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN,
		runtime: needsNodeRuntime && systemNodePath ? "node" : runtimeChoice,
		nodePath: systemNodePath ?? void 0,
		warn: (message, title) => note$1(message, title),
		config: cfg
	});
	const expectedEntrypoint = findGatewayEntrypoint(programArguments);
	const currentEntrypoint = findGatewayEntrypoint(command.programArguments);
	if (expectedEntrypoint && currentEntrypoint && normalizeExecutablePath(expectedEntrypoint) !== normalizeExecutablePath(currentEntrypoint)) audit.issues.push({
		code: SERVICE_AUDIT_CODES.gatewayEntrypointMismatch,
		message: "Gateway service entrypoint does not match the current install.",
		detail: `${currentEntrypoint} -> ${expectedEntrypoint}`,
		level: "recommended"
	});
	if (audit.issues.length === 0) return;
	note$1(audit.issues.map((issue) => issue.detail ? `- ${issue.message} (${issue.detail})` : `- ${issue.message}`).join("\n"), "Gateway service config");
	const needsAggressive = audit.issues.filter((issue) => issue.level === "aggressive").length > 0;
	if (needsAggressive && !prompter.shouldForce) note$1("Custom or unexpected service edits detected. Rerun with --force to overwrite.", "Gateway service config");
	if (!(needsAggressive ? await prompter.confirmAggressive({
		message: "Overwrite gateway service config with current defaults now?",
		initialValue: Boolean(prompter.shouldForce)
	}) : await prompter.confirmRepair({
		message: "Update gateway service config to the recommended defaults now?",
		initialValue: true
	}))) return;
	try {
		await service.install({
			env: process.env,
			stdout: process.stdout,
			programArguments,
			workingDirectory,
			environment
		});
	} catch (err) {
		runtime.error(`Gateway service update failed: ${String(err)}`);
	}
}
async function maybeScanExtraGatewayServices(options, runtime, prompter) {
	const extraServices = await findExtraGatewayServices(process.env, { deep: options.deep });
	if (extraServices.length === 0) return;
	note$1(extraServices.map((svc) => `- ${svc.label} (${svc.scope}, ${svc.detail})`).join("\n"), "Other gateway-like services detected");
	const legacyServices = extraServices.filter((svc) => svc.legacy === true);
	if (legacyServices.length > 0) {
		if (await prompter.confirmSkipInNonInteractive({
			message: "Remove legacy gateway services (clawdbot/moltbot) now?",
			initialValue: true
		})) {
			const removed = [];
			const failed = [];
			for (const svc of legacyServices) {
				if (svc.platform !== "darwin") {
					failed.push(`${svc.label} (${svc.platform})`);
					continue;
				}
				if (svc.scope !== "user") {
					failed.push(`${svc.label} (${svc.scope})`);
					continue;
				}
				const plistPath = extractDetailPath(svc.detail, "plist:");
				if (!plistPath) {
					failed.push(`${svc.label} (missing plist path)`);
					continue;
				}
				const dest = await cleanupLegacyLaunchdService({
					label: svc.label,
					plistPath
				});
				removed.push(dest ? `${svc.label} -> ${dest}` : svc.label);
			}
			if (removed.length > 0) note$1(removed.map((line) => `- ${line}`).join("\n"), "Legacy gateway removed");
			if (failed.length > 0) note$1(failed.map((line) => `- ${line}`).join("\n"), "Legacy gateway cleanup skipped");
			if (removed.length > 0) runtime.log("Legacy gateway services removed. Installing OpenClaw gateway next.");
		}
	}
	const cleanupHints = renderGatewayServiceCleanupHints();
	if (cleanupHints.length > 0) note$1(cleanupHints.map((hint) => `- ${hint}`).join("\n"), "Cleanup hints");
	note$1([
		"Recommendation: run a single gateway per machine for most setups.",
		"One gateway supports multiple agents.",
		"If you need multiple gateways (e.g., a rescue bot on the same host), isolate ports + config/state (see docs: /gateway#multiple-gateways-same-host)."
	].join("\n"), "Gateway recommendation");
}

//#endregion
//#region src/commands/doctor-install.ts
function noteSourceInstallIssues(root) {
	if (!root) return;
	const workspaceMarker = path.join(root, "pnpm-workspace.yaml");
	if (!fs.existsSync(workspaceMarker)) return;
	const warnings = [];
	const nodeModules = path.join(root, "node_modules");
	const pnpmStore = path.join(nodeModules, ".pnpm");
	const tsxBin = path.join(nodeModules, ".bin", "tsx");
	const srcEntry = path.join(root, "src", "entry.ts");
	if (fs.existsSync(nodeModules) && !fs.existsSync(pnpmStore)) warnings.push("- node_modules was not installed by pnpm (missing node_modules/.pnpm). Run: pnpm install");
	if (fs.existsSync(path.join(root, "package-lock.json"))) warnings.push("- package-lock.json present in a pnpm workspace. If you ran npm install, remove it and reinstall with pnpm.");
	if (fs.existsSync(srcEntry) && !fs.existsSync(tsxBin)) warnings.push("- tsx binary is missing for source runs. Run: pnpm install");
	if (warnings.length > 0) note$1(warnings.join("\n"), "Install");
}

//#endregion
//#region src/commands/doctor-platform-notes.ts
const execFileAsync = promisify(execFile);
function resolveHomeDir() {
	return process.env.HOME ?? os.homedir();
}
async function noteMacLaunchAgentOverrides() {
	if (process.platform !== "darwin") return;
	const home = resolveHomeDir();
	const markerPath = [path.join(home, ".openclaw", "disable-launchagent")].find((candidate) => fs.existsSync(candidate));
	if (!markerPath) return;
	const displayMarkerPath = shortenHomePath(markerPath);
	note$1([
		`- LaunchAgent writes are disabled via ${displayMarkerPath}.`,
		"- To restore default behavior:",
		`  rm ${displayMarkerPath}`
	].filter((line) => Boolean(line)).join("\n"), "Gateway (macOS)");
}
async function launchctlGetenv(name) {
	try {
		const result = await execFileAsync("/bin/launchctl", ["getenv", name], { encoding: "utf8" });
		const value = String(result.stdout ?? "").trim();
		return value.length > 0 ? value : void 0;
	} catch {
		return;
	}
}
function hasConfigGatewayCreds(cfg) {
	const localToken = typeof cfg.gateway?.auth?.token === "string" ? cfg.gateway?.auth?.token.trim() : "";
	const localPassword = typeof cfg.gateway?.auth?.password === "string" ? cfg.gateway?.auth?.password.trim() : "";
	const remoteToken = typeof cfg.gateway?.remote?.token === "string" ? cfg.gateway?.remote?.token.trim() : "";
	const remotePassword = typeof cfg.gateway?.remote?.password === "string" ? cfg.gateway?.remote?.password.trim() : "";
	return Boolean(localToken || localPassword || remoteToken || remotePassword);
}
async function noteMacLaunchctlGatewayEnvOverrides(cfg, deps) {
	if ((deps?.platform ?? process.platform) !== "darwin") return;
	if (!hasConfigGatewayCreds(cfg)) return;
	const getenv = deps?.getenv ?? launchctlGetenv;
	const deprecatedLaunchctlEntries = [
		["MOLTBOT_GATEWAY_TOKEN", await getenv("MOLTBOT_GATEWAY_TOKEN")],
		["MOLTBOT_GATEWAY_PASSWORD", await getenv("MOLTBOT_GATEWAY_PASSWORD")],
		["CLAWDBOT_GATEWAY_TOKEN", await getenv("CLAWDBOT_GATEWAY_TOKEN")],
		["CLAWDBOT_GATEWAY_PASSWORD", await getenv("CLAWDBOT_GATEWAY_PASSWORD")]
	].filter((entry) => Boolean(entry[1]?.trim()));
	if (deprecatedLaunchctlEntries.length > 0) {
		const lines = ["- Deprecated launchctl environment variables detected (ignored).", ...deprecatedLaunchctlEntries.map(([key]) => `- \`${key}\` is set; use \`OPENCLAW_${key.slice(key.indexOf("_") + 1)}\` instead.`)];
		(deps?.noteFn ?? note$1)(lines.join("\n"), "Gateway (macOS)");
	}
	const tokenEntries = [["OPENCLAW_GATEWAY_TOKEN", await getenv("OPENCLAW_GATEWAY_TOKEN")]];
	const passwordEntries = [["OPENCLAW_GATEWAY_PASSWORD", await getenv("OPENCLAW_GATEWAY_PASSWORD")]];
	const tokenEntry = tokenEntries.find(([, value]) => value?.trim());
	const passwordEntry = passwordEntries.find(([, value]) => value?.trim());
	const envToken = tokenEntry?.[1]?.trim() ?? "";
	const envPassword = passwordEntry?.[1]?.trim() ?? "";
	const envTokenKey = tokenEntry?.[0];
	const envPasswordKey = passwordEntry?.[0];
	if (!envToken && !envPassword) return;
	const lines = [
		"- launchctl environment overrides detected (can cause confusing unauthorized errors).",
		envToken && envTokenKey ? `- \`${envTokenKey}\` is set; it overrides config tokens.` : void 0,
		envPassword ? `- \`${envPasswordKey ?? "OPENCLAW_GATEWAY_PASSWORD"}\` is set; it overrides config passwords.` : void 0,
		"- Clear overrides and restart the app/gateway:",
		envTokenKey ? `  launchctl unsetenv ${envTokenKey}` : void 0,
		envPasswordKey ? `  launchctl unsetenv ${envPasswordKey}` : void 0
	].filter((line) => Boolean(line));
	(deps?.noteFn ?? note$1)(lines.join("\n"), "Gateway (macOS)");
}
function noteDeprecatedLegacyEnvVars(env = process.env, deps) {
	const entries = Object.entries(env).filter(([key, value]) => (key.startsWith("MOLTBOT_") || key.startsWith("CLAWDBOT_")) && value?.trim()).map(([key]) => key);
	if (entries.length === 0) return;
	const lines = [
		"- Deprecated legacy environment variables detected (ignored).",
		"- Use OPENCLAW_* equivalents instead:",
		...entries.map((key) => {
			return `  ${key} -> OPENCLAW_${key.slice(key.indexOf("_") + 1)}`;
		})
	];
	(deps?.noteFn ?? note$1)(lines.join("\n"), "Environment");
}

//#endregion
//#region src/commands/doctor-prompter.ts
function createDoctorPrompter(params) {
	const yes = params.options.yes === true;
	const requestedNonInteractive = params.options.nonInteractive === true;
	const shouldRepair = params.options.repair === true || yes;
	const shouldForce = params.options.force === true;
	const isTty = Boolean(process.stdin.isTTY);
	const nonInteractive = requestedNonInteractive || !isTty && !yes;
	const canPrompt = isTty && !yes && !nonInteractive;
	const confirmDefault = async (p) => {
		if (nonInteractive) return false;
		if (shouldRepair) return true;
		if (!canPrompt) return Boolean(p.initialValue ?? false);
		return guardCancel(await confirm({
			...p,
			message: stylePromptMessage(p.message)
		}), params.runtime);
	};
	return {
		confirm: confirmDefault,
		confirmRepair: async (p) => {
			if (nonInteractive) return false;
			return confirmDefault(p);
		},
		confirmAggressive: async (p) => {
			if (nonInteractive) return false;
			if (shouldRepair && shouldForce) return true;
			if (shouldRepair && !shouldForce) return false;
			if (!canPrompt) return Boolean(p.initialValue ?? false);
			return guardCancel(await confirm({
				...p,
				message: stylePromptMessage(p.message)
			}), params.runtime);
		},
		confirmSkipInNonInteractive: async (p) => {
			if (nonInteractive) return false;
			if (shouldRepair) return true;
			return confirmDefault(p);
		},
		select: async (p, fallback) => {
			if (!canPrompt || shouldRepair) return fallback;
			return guardCancel(await select({
				...p,
				message: stylePromptMessage(p.message),
				options: p.options.map((opt) => opt.hint === void 0 ? opt : {
					...opt,
					hint: stylePromptHint(opt.hint)
				})
			}), params.runtime);
		},
		shouldRepair,
		shouldForce
	};
}

//#endregion
//#region src/commands/doctor-sandbox.ts
function resolveSandboxScript(scriptRel) {
	const candidates = /* @__PURE__ */ new Set();
	candidates.add(process.cwd());
	const argv1 = process.argv[1];
	if (argv1) {
		const normalized = path.resolve(argv1);
		candidates.add(path.resolve(path.dirname(normalized), ".."));
		candidates.add(path.resolve(path.dirname(normalized)));
	}
	for (const root of candidates) {
		const scriptPath = path.join(root, scriptRel);
		if (fs.existsSync(scriptPath)) return {
			scriptPath,
			cwd: root
		};
	}
	return null;
}
async function runSandboxScript(scriptRel, runtime) {
	const script = resolveSandboxScript(scriptRel);
	if (!script) {
		note$1(`Unable to locate ${scriptRel}. Run it from the repo root.`, "Sandbox");
		return false;
	}
	runtime.log(`Running ${scriptRel}...`);
	const result = await runCommandWithTimeout(["bash", script.scriptPath], {
		timeoutMs: 1200 * 1e3,
		cwd: script.cwd
	});
	if (result.code !== 0) {
		runtime.error(`Failed running ${scriptRel}: ${result.stderr.trim() || result.stdout.trim() || "unknown error"}`);
		return false;
	}
	runtime.log(`Completed ${scriptRel}.`);
	return true;
}
async function isDockerAvailable() {
	try {
		await runExec("docker", [
			"version",
			"--format",
			"{{.Server.Version}}"
		], { timeoutMs: 5e3 });
		return true;
	} catch {
		return false;
	}
}
async function dockerImageExists(image) {
	try {
		await runExec("docker", [
			"image",
			"inspect",
			image
		], { timeoutMs: 5e3 });
		return true;
	} catch (error) {
		const stderr = error?.stderr || error?.message || "";
		if (String(stderr).includes("No such image")) return false;
		throw error;
	}
}
function resolveSandboxDockerImage(cfg) {
	const image = cfg.agents?.defaults?.sandbox?.docker?.image?.trim();
	return image ? image : DEFAULT_SANDBOX_IMAGE;
}
function resolveSandboxBrowserImage(cfg) {
	const image = cfg.agents?.defaults?.sandbox?.browser?.image?.trim();
	return image ? image : DEFAULT_SANDBOX_BROWSER_IMAGE;
}
function updateSandboxDockerImage(cfg, image) {
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				sandbox: {
					...cfg.agents?.defaults?.sandbox,
					docker: {
						...cfg.agents?.defaults?.sandbox?.docker,
						image
					}
				}
			}
		}
	};
}
function updateSandboxBrowserImage(cfg, image) {
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				sandbox: {
					...cfg.agents?.defaults?.sandbox,
					browser: {
						...cfg.agents?.defaults?.sandbox?.browser,
						image
					}
				}
			}
		}
	};
}
async function handleMissingSandboxImage(params, runtime, prompter) {
	if (await dockerImageExists(params.image)) return;
	const buildHint = params.buildScript ? `Build it with ${params.buildScript}.` : "Build or pull it first.";
	note$1(`Sandbox ${params.kind} image missing: ${params.image}. ${buildHint}`, "Sandbox");
	let built = false;
	if (params.buildScript) {
		if (await prompter.confirmSkipInNonInteractive({
			message: `Build ${params.kind} sandbox image now?`,
			initialValue: true
		})) built = await runSandboxScript(params.buildScript, runtime);
	}
	if (built) return;
}
async function maybeRepairSandboxImages(cfg, runtime, prompter) {
	const sandbox = cfg.agents?.defaults?.sandbox;
	const mode = sandbox?.mode ?? "off";
	if (!sandbox || mode === "off") return cfg;
	if (!await isDockerAvailable()) {
		note$1("Docker not available; skipping sandbox image checks.", "Sandbox");
		return cfg;
	}
	let next = cfg;
	const changes = [];
	const dockerImage = resolveSandboxDockerImage(cfg);
	await handleMissingSandboxImage({
		kind: "base",
		image: dockerImage,
		buildScript: dockerImage === DEFAULT_SANDBOX_COMMON_IMAGE ? "scripts/sandbox-common-setup.sh" : dockerImage === DEFAULT_SANDBOX_IMAGE ? "scripts/sandbox-setup.sh" : void 0,
		updateConfig: (image) => {
			next = updateSandboxDockerImage(next, image);
			changes.push(`Updated agents.defaults.sandbox.docker.image → ${image}`);
		}
	}, runtime, prompter);
	if (sandbox.browser?.enabled) await handleMissingSandboxImage({
		kind: "browser",
		image: resolveSandboxBrowserImage(cfg),
		buildScript: "scripts/sandbox-browser-setup.sh",
		updateConfig: (image) => {
			next = updateSandboxBrowserImage(next, image);
			changes.push(`Updated agents.defaults.sandbox.browser.image → ${image}`);
		}
	}, runtime, prompter);
	if (changes.length > 0) note$1(changes.join("\n"), "Doctor changes");
	return next;
}
function noteSandboxScopeWarnings(cfg) {
	const globalSandbox = cfg.agents?.defaults?.sandbox;
	const agents = Array.isArray(cfg.agents?.list) ? cfg.agents.list : [];
	const warnings = [];
	for (const agent of agents) {
		const agentId = agent.id;
		const agentSandbox = agent.sandbox;
		if (!agentSandbox) continue;
		if (resolveSandboxScope({
			scope: agentSandbox.scope ?? globalSandbox?.scope,
			perSession: agentSandbox.perSession ?? globalSandbox?.perSession
		}) !== "shared") continue;
		const overrides = [];
		if (agentSandbox.docker && Object.keys(agentSandbox.docker).length > 0) overrides.push("docker");
		if (agentSandbox.browser && Object.keys(agentSandbox.browser).length > 0) overrides.push("browser");
		if (agentSandbox.prune && Object.keys(agentSandbox.prune).length > 0) overrides.push("prune");
		if (overrides.length === 0) continue;
		warnings.push([`- agents.list (id "${agentId}") sandbox ${overrides.join("/")} overrides ignored.`, `  scope resolves to "shared".`].join("\n"));
	}
	if (warnings.length > 0) note$1(warnings.join("\n"), "Sandbox");
}

//#endregion
//#region src/commands/doctor-security.ts
async function noteSecurityWarnings(cfg) {
	const warnings = [];
	const auditHint = `- Run: ${formatCliCommand("openclaw security audit --deep")}`;
	const gatewayBind = cfg.gateway?.bind ?? "loopback";
	const customBindHost = cfg.gateway?.customBindHost?.trim();
	const bindMode = [
		"auto",
		"lan",
		"loopback",
		"custom",
		"tailnet"
	].includes(gatewayBind) ? gatewayBind : void 0;
	const resolvedBindHost = bindMode ? await resolveGatewayBindHost(bindMode, customBindHost) : "0.0.0.0";
	const isExposed = !isLoopbackHost(resolvedBindHost);
	const resolvedAuth = resolveGatewayAuth({
		authConfig: cfg.gateway?.auth,
		env: process.env,
		tailscaleMode: cfg.gateway?.tailscale?.mode ?? "off"
	});
	const authToken = resolvedAuth.token?.trim() ?? "";
	const authPassword = resolvedAuth.password?.trim() ?? "";
	const hasToken = authToken.length > 0;
	const hasPassword = authPassword.length > 0;
	const hasSharedSecret = resolvedAuth.mode === "token" && hasToken || resolvedAuth.mode === "password" && hasPassword;
	const bindDescriptor = `"${gatewayBind}" (${resolvedBindHost})`;
	if (isExposed) if (!hasSharedSecret) {
		const authFixLines = resolvedAuth.mode === "password" ? [`  Fix: ${formatCliCommand("openclaw configure")} to set a password`, `  Or switch to token: ${formatCliCommand("openclaw config set gateway.auth.mode token")}`] : [`  Fix: ${formatCliCommand("openclaw doctor --fix")} to generate a token`, `  Or set token directly: ${formatCliCommand("openclaw config set gateway.auth.mode token")}`];
		warnings.push(`- CRITICAL: Gateway bound to ${bindDescriptor} without authentication.`, `  Anyone on your network (or internet if port-forwarded) can fully control your agent.`, `  Fix: ${formatCliCommand("openclaw config set gateway.bind loopback")}`, ...authFixLines);
	} else warnings.push(`- WARNING: Gateway bound to ${bindDescriptor} (network-accessible).`, `  Ensure your auth credentials are strong and not exposed.`);
	const warnDmPolicy = async (params) => {
		const dmPolicy = params.dmPolicy;
		const policyPath = params.policyPath ?? `${params.allowFromPath}policy`;
		const configAllowFrom = (params.allowFrom ?? []).map((v) => String(v).trim());
		const hasWildcard = configAllowFrom.includes("*");
		const storeAllowFrom = await readChannelAllowFromStore(params.provider).catch(() => []);
		const normalizedCfg = configAllowFrom.filter((v) => v !== "*").map((v) => params.normalizeEntry ? params.normalizeEntry(v) : v).map((v) => v.trim()).filter(Boolean);
		const normalizedStore = storeAllowFrom.map((v) => params.normalizeEntry ? params.normalizeEntry(v) : v).map((v) => v.trim()).filter(Boolean);
		const allowCount = Array.from(new Set([...normalizedCfg, ...normalizedStore])).length;
		const dmScope = cfg.session?.dmScope ?? "main";
		const isMultiUserDm = hasWildcard || allowCount > 1;
		if (dmPolicy === "open") {
			const allowFromPath = `${params.allowFromPath}allowFrom`;
			warnings.push(`- ${params.label} DMs: OPEN (${policyPath}="open"). Anyone can DM it.`);
			if (!hasWildcard) warnings.push(`- ${params.label} DMs: config invalid — "open" requires ${allowFromPath} to include "*".`);
		}
		if (dmPolicy === "disabled") {
			warnings.push(`- ${params.label} DMs: disabled (${policyPath}="disabled").`);
			return;
		}
		if (dmPolicy !== "open" && allowCount === 0) {
			warnings.push(`- ${params.label} DMs: locked (${policyPath}="${dmPolicy}") with no allowlist; unknown senders will be blocked / get a pairing code.`);
			warnings.push(`  ${params.approveHint}`);
		}
		if (dmScope === "main" && isMultiUserDm) warnings.push(`- ${params.label} DMs: multiple senders share the main session; run: ` + formatCliCommand("openclaw config set session.dmScope \"per-channel-peer\"") + " (or \"per-account-channel-peer\" for multi-account channels) to isolate sessions.");
	};
	for (const plugin of listChannelPlugins()) {
		if (!plugin.security) continue;
		const defaultAccountId = resolveChannelDefaultAccountId({
			plugin,
			cfg,
			accountIds: plugin.config.listAccountIds(cfg)
		});
		const account = plugin.config.resolveAccount(cfg, defaultAccountId);
		if (!(plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : true)) continue;
		if (!(plugin.config.isConfigured ? await plugin.config.isConfigured(account, cfg) : true)) continue;
		const dmPolicy = plugin.security.resolveDmPolicy?.({
			cfg,
			accountId: defaultAccountId,
			account
		});
		if (dmPolicy) await warnDmPolicy({
			label: plugin.meta.label ?? plugin.id,
			provider: plugin.id,
			dmPolicy: dmPolicy.policy,
			allowFrom: dmPolicy.allowFrom,
			policyPath: dmPolicy.policyPath,
			allowFromPath: dmPolicy.allowFromPath,
			approveHint: dmPolicy.approveHint,
			normalizeEntry: dmPolicy.normalizeEntry
		});
		if (plugin.security.collectWarnings) {
			const extra = await plugin.security.collectWarnings({
				cfg,
				accountId: defaultAccountId,
				account
			});
			if (extra?.length) warnings.push(...extra);
		}
	}
	const lines = warnings.length > 0 ? warnings : ["- No channel security warnings detected."];
	lines.push(auditHint);
	note$1(lines.join("\n"), "Security");
}

//#endregion
//#region src/commands/doctor-state-integrity.ts
function existsDir(dir) {
	try {
		return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
	} catch {
		return false;
	}
}
function existsFile(filePath) {
	try {
		return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
	} catch {
		return false;
	}
}
function canWriteDir(dir) {
	try {
		fs.accessSync(dir, fs.constants.W_OK);
		return true;
	} catch {
		return false;
	}
}
function ensureDir(dir) {
	try {
		fs.mkdirSync(dir, { recursive: true });
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
}
function dirPermissionHint(dir) {
	const uid = typeof process.getuid === "function" ? process.getuid() : null;
	const gid = typeof process.getgid === "function" ? process.getgid() : null;
	try {
		const stat = fs.statSync(dir);
		if (uid !== null && stat.uid !== uid) return `Owner mismatch (uid ${stat.uid}). Run: sudo chown -R $USER "${dir}"`;
		if (gid !== null && stat.gid !== gid) return `Group mismatch (gid ${stat.gid}). If access fails, run: sudo chown -R $USER "${dir}"`;
	} catch {
		return null;
	}
	return null;
}
function addUserRwx(mode) {
	return mode & 511 | 448;
}
function countJsonlLines(filePath) {
	try {
		const raw = fs.readFileSync(filePath, "utf-8");
		if (!raw) return 0;
		let count = 0;
		for (let i = 0; i < raw.length; i += 1) if (raw[i] === "\n") count += 1;
		if (!raw.endsWith("\n")) count += 1;
		return count;
	} catch {
		return 0;
	}
}
function findOtherStateDirs(stateDir) {
	const resolvedState = path.resolve(stateDir);
	const roots = process.platform === "darwin" ? ["/Users"] : process.platform === "linux" ? ["/home"] : [];
	const found = [];
	for (const root of roots) {
		let entries = [];
		try {
			entries = fs.readdirSync(root, { withFileTypes: true });
		} catch {
			continue;
		}
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			if (entry.name.startsWith(".")) continue;
			const candidates = [".openclaw"].map((dir) => path.resolve(root, entry.name, dir));
			for (const candidate of candidates) {
				if (candidate === resolvedState) continue;
				if (existsDir(candidate)) found.push(candidate);
			}
		}
	}
	return found;
}
async function noteStateIntegrity(cfg, prompter, configPath) {
	const warnings = [];
	const changes = [];
	const env = process.env;
	const homedir = () => resolveRequiredHomeDir(env, os.homedir);
	const stateDir = resolveStateDir(env, homedir);
	const defaultStateDir = path.join(homedir(), ".openclaw");
	const oauthDir = resolveOAuthDir(env, stateDir);
	const agentId = resolveDefaultAgentId(cfg);
	const sessionsDir = resolveSessionTranscriptsDirForAgent(agentId, env, homedir);
	const storePath = resolveStorePath(cfg.session?.store, { agentId });
	const storeDir = path.dirname(storePath);
	const displayStateDir = shortenHomePath(stateDir);
	const displayOauthDir = shortenHomePath(oauthDir);
	const displaySessionsDir = shortenHomePath(sessionsDir);
	const displayStoreDir = shortenHomePath(storeDir);
	const displayConfigPath = configPath ? shortenHomePath(configPath) : void 0;
	let stateDirExists = existsDir(stateDir);
	if (!stateDirExists) {
		warnings.push(`- CRITICAL: state directory missing (${displayStateDir}). Sessions, credentials, logs, and config are stored there.`);
		if (cfg.gateway?.mode === "remote") warnings.push("- Gateway is in remote mode; run doctor on the remote host where the gateway runs.");
		if (await prompter.confirmSkipInNonInteractive({
			message: `Create ${displayStateDir} now?`,
			initialValue: false
		})) {
			const created = ensureDir(stateDir);
			if (created.ok) {
				changes.push(`- Created ${displayStateDir}`);
				stateDirExists = true;
			} else warnings.push(`- Failed to create ${displayStateDir}: ${created.error}`);
		}
	}
	if (stateDirExists && !canWriteDir(stateDir)) {
		warnings.push(`- State directory not writable (${displayStateDir}).`);
		const hint = dirPermissionHint(stateDir);
		if (hint) warnings.push(`  ${hint}`);
		if (await prompter.confirmSkipInNonInteractive({
			message: `Repair permissions on ${displayStateDir}?`,
			initialValue: true
		})) try {
			const target = addUserRwx(fs.statSync(stateDir).mode);
			fs.chmodSync(stateDir, target);
			changes.push(`- Repaired permissions on ${displayStateDir}`);
		} catch (err) {
			warnings.push(`- Failed to repair ${displayStateDir}: ${String(err)}`);
		}
	}
	if (stateDirExists && process.platform !== "win32") try {
		if ((fs.statSync(stateDir).mode & 63) !== 0) {
			warnings.push(`- State directory permissions are too open (${displayStateDir}). Recommend chmod 700.`);
			if (await prompter.confirmSkipInNonInteractive({
				message: `Tighten permissions on ${displayStateDir} to 700?`,
				initialValue: true
			})) {
				fs.chmodSync(stateDir, 448);
				changes.push(`- Tightened permissions on ${displayStateDir} to 700`);
			}
		}
	} catch (err) {
		warnings.push(`- Failed to read ${displayStateDir} permissions: ${String(err)}`);
	}
	if (configPath && existsFile(configPath) && process.platform !== "win32") try {
		if ((fs.statSync(configPath).mode & 63) !== 0) {
			warnings.push(`- Config file is group/world readable (${displayConfigPath ?? configPath}). Recommend chmod 600.`);
			if (await prompter.confirmSkipInNonInteractive({
				message: `Tighten permissions on ${displayConfigPath ?? configPath} to 600?`,
				initialValue: true
			})) {
				fs.chmodSync(configPath, 384);
				changes.push(`- Tightened permissions on ${displayConfigPath ?? configPath} to 600`);
			}
		}
	} catch (err) {
		warnings.push(`- Failed to read config permissions (${displayConfigPath ?? configPath}): ${String(err)}`);
	}
	if (stateDirExists) {
		const dirCandidates = /* @__PURE__ */ new Map();
		dirCandidates.set(sessionsDir, "Sessions dir");
		dirCandidates.set(storeDir, "Session store dir");
		dirCandidates.set(oauthDir, "OAuth dir");
		const displayDirFor = (dir) => {
			if (dir === sessionsDir) return displaySessionsDir;
			if (dir === storeDir) return displayStoreDir;
			if (dir === oauthDir) return displayOauthDir;
			return shortenHomePath(dir);
		};
		for (const [dir, label] of dirCandidates) {
			const displayDir = displayDirFor(dir);
			if (!existsDir(dir)) {
				warnings.push(`- CRITICAL: ${label} missing (${displayDir}).`);
				if (await prompter.confirmSkipInNonInteractive({
					message: `Create ${label} at ${displayDir}?`,
					initialValue: true
				})) {
					const created = ensureDir(dir);
					if (created.ok) changes.push(`- Created ${label}: ${displayDir}`);
					else warnings.push(`- Failed to create ${displayDir}: ${created.error}`);
				}
				continue;
			}
			if (!canWriteDir(dir)) {
				warnings.push(`- ${label} not writable (${displayDir}).`);
				const hint = dirPermissionHint(dir);
				if (hint) warnings.push(`  ${hint}`);
				if (await prompter.confirmSkipInNonInteractive({
					message: `Repair permissions on ${label}?`,
					initialValue: true
				})) try {
					const target = addUserRwx(fs.statSync(dir).mode);
					fs.chmodSync(dir, target);
					changes.push(`- Repaired permissions on ${label}: ${displayDir}`);
				} catch (err) {
					warnings.push(`- Failed to repair ${displayDir}: ${String(err)}`);
				}
			}
		}
	}
	const extraStateDirs = /* @__PURE__ */ new Set();
	if (path.resolve(stateDir) !== path.resolve(defaultStateDir)) {
		if (existsDir(defaultStateDir)) extraStateDirs.add(defaultStateDir);
	}
	for (const other of findOtherStateDirs(stateDir)) extraStateDirs.add(other);
	if (extraStateDirs.size > 0) warnings.push([
		"- Multiple state directories detected. This can split session history.",
		...Array.from(extraStateDirs).map((dir) => `  - ${shortenHomePath(dir)}`),
		`  Active state dir: ${displayStateDir}`
	].join("\n"));
	const store = loadSessionStore(storePath);
	const entries = Object.entries(store).filter(([, entry]) => entry && typeof entry === "object");
	if (entries.length > 0) {
		const recent = entries.slice().toSorted((a, b) => {
			const aUpdated = typeof a[1].updatedAt === "number" ? a[1].updatedAt : 0;
			return (typeof b[1].updatedAt === "number" ? b[1].updatedAt : 0) - aUpdated;
		}).slice(0, 5);
		const missing = recent.filter(([, entry]) => {
			const sessionId = entry.sessionId;
			if (!sessionId) return false;
			return !existsFile(resolveSessionFilePath(sessionId, entry, { agentId }));
		});
		if (missing.length > 0) warnings.push(`- ${missing.length}/${recent.length} recent sessions are missing transcripts. Check for deleted session files or split state dirs.`);
		const mainEntry = store[resolveMainSessionKey(cfg)];
		if (mainEntry?.sessionId) {
			const transcriptPath = resolveSessionFilePath(mainEntry.sessionId, mainEntry, { agentId });
			if (!existsFile(transcriptPath)) warnings.push(`- Main session transcript missing (${shortenHomePath(transcriptPath)}). History will appear to reset.`);
			else {
				const lineCount = countJsonlLines(transcriptPath);
				if (lineCount <= 1) warnings.push(`- Main session transcript has only ${lineCount} line. Session history may not be appending.`);
			}
		}
	}
	if (warnings.length > 0) note$1(warnings.join("\n"), "State integrity");
	if (changes.length > 0) note$1(changes.join("\n"), "Doctor changes");
}
function noteWorkspaceBackupTip(workspaceDir) {
	if (!existsDir(workspaceDir)) return;
	const gitMarker = path.join(workspaceDir, ".git");
	if (fs.existsSync(gitMarker)) return;
	note$1([
		"- Tip: back up the workspace in a private git repo (GitHub or GitLab).",
		"- Keep ~/.openclaw out of git; it contains credentials and session history.",
		"- Details: /concepts/agent-workspace#git-backup-recommended"
	].join("\n"), "Workspace");
}

//#endregion
//#region src/commands/doctor-ui.ts
async function maybeRepairUiProtocolFreshness(_runtime, prompter) {
	const root = await resolveOpenClawPackageRoot({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	});
	if (!root) return;
	const schemaPath = path.join(root, "src/gateway/protocol/schema.ts");
	const uiIndexPath = (await resolveControlUiDistIndexHealth({
		root,
		argv1: process.argv[1]
	})).indexPath ?? resolveControlUiDistIndexPathForRoot(root);
	try {
		const [schemaStats, uiStats] = await Promise.all([fsPromises.stat(schemaPath).catch(() => null), fsPromises.stat(uiIndexPath).catch(() => null)]);
		if (schemaStats && !uiStats) {
			note$1(["- Control UI assets are missing.", "- Run: pnpm ui:build"].join("\n"), "UI");
			const uiSourcesPath = path.join(root, "ui/package.json");
			if (!await fsPromises.stat(uiSourcesPath).catch(() => null)) {
				note$1("Skipping UI build: ui/ sources not present.", "UI");
				return;
			}
			if (await prompter.confirmRepair({
				message: "Build Control UI assets now?",
				initialValue: true
			})) {
				note$1("Building Control UI assets... (this may take a moment)", "UI");
				const uiScriptPath = path.join(root, "scripts/ui.js");
				const buildResult = await runCommandWithTimeout([
					process.execPath,
					uiScriptPath,
					"build"
				], {
					cwd: root,
					timeoutMs: 12e4,
					env: {
						...process.env,
						FORCE_COLOR: "1"
					}
				});
				if (buildResult.code === 0) note$1("UI build complete.", "UI");
				else note$1([`UI build failed (exit ${buildResult.code ?? "unknown"}).`, buildResult.stderr.trim() ? buildResult.stderr.trim() : null].filter(Boolean).join("\n"), "UI");
			}
			return;
		}
		if (!schemaStats || !uiStats) return;
		if (schemaStats.mtime > uiStats.mtime) {
			const gitLog = await runCommandWithTimeout([
				"git",
				"-C",
				root,
				"log",
				`--since=${uiStats.mtime.toISOString()}`,
				"--format=%h %s",
				"src/gateway/protocol/schema.ts"
			], { timeoutMs: 5e3 }).catch(() => null);
			if (gitLog && gitLog.code === 0 && gitLog.stdout.trim()) {
				note$1(`UI assets are older than the protocol schema.\nFunctional changes since last build:\n${gitLog.stdout.trim().split("\n").map((l) => `- ${l}`).join("\n")}`, "UI Freshness");
				if (await prompter.confirmAggressive({
					message: "Rebuild UI now? (Detected protocol mismatch requiring update)",
					initialValue: true
				})) {
					const uiSourcesPath = path.join(root, "ui/package.json");
					if (!await fsPromises.stat(uiSourcesPath).catch(() => null)) {
						note$1("Skipping UI rebuild: ui/ sources not present.", "UI");
						return;
					}
					note$1("Rebuilding stale UI assets... (this may take a moment)", "UI");
					const uiScriptPath = path.join(root, "scripts/ui.js");
					const buildResult = await runCommandWithTimeout([
						process.execPath,
						uiScriptPath,
						"build"
					], {
						cwd: root,
						timeoutMs: 12e4,
						env: {
							...process.env,
							FORCE_COLOR: "1"
						}
					});
					if (buildResult.code === 0) note$1("UI rebuild complete.", "UI");
					else note$1([`UI rebuild failed (exit ${buildResult.code ?? "unknown"}).`, buildResult.stderr.trim() ? buildResult.stderr.trim() : null].filter(Boolean).join("\n"), "UI");
				}
			}
		}
	} catch {}
}

//#endregion
//#region src/commands/doctor-update.ts
async function detectOpenClawGitCheckout(root) {
	const res = await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"rev-parse",
		"--show-toplevel"
	], { timeoutMs: 5e3 }).catch(() => null);
	if (!res) return "unknown";
	if (res.code !== 0) {
		if (res.stderr.toLowerCase().includes("not a git repository")) return "not-git";
		return "unknown";
	}
	return res.stdout.trim() === root ? "git" : "not-git";
}
async function maybeOfferUpdateBeforeDoctor(params) {
	if (!(!isTruthyEnvValue(process.env.OPENCLAW_UPDATE_IN_PROGRESS) && params.options.nonInteractive !== true && params.options.yes !== true && params.options.repair !== true && Boolean(process.stdin.isTTY)) || !params.root) return { updated: false };
	const git = await detectOpenClawGitCheckout(params.root);
	if (git === "git") {
		if (!await params.confirm({
			message: "Update OpenClaw from git before running doctor?",
			initialValue: true
		})) return { updated: false };
		note$1("Running update (fetch/rebase/build/ui:build/doctor)…", "Update");
		const result = await runGatewayUpdate({
			cwd: params.root,
			argv1: process.argv[1]
		});
		note$1([
			`Status: ${result.status}`,
			`Mode: ${result.mode}`,
			result.root ? `Root: ${result.root}` : null,
			result.reason ? `Reason: ${result.reason}` : null
		].filter(Boolean).join("\n"), "Update result");
		if (result.status === "ok") {
			params.outro("Update completed (doctor already ran as part of the update).");
			return {
				updated: true,
				handled: true
			};
		}
		return {
			updated: true,
			handled: false
		};
	}
	if (git === "not-git") note$1(["This install is not a git checkout.", `Run \`${formatCliCommand("openclaw update")}\` to update via your package manager (npm/pnpm), then rerun doctor.`].join("\n"), "Update");
	return { updated: false };
}

//#endregion
//#region src/commands/doctor-workspace.ts
const MEMORY_SYSTEM_PROMPT = [
	"Memory system not found in workspace.",
	"Paste this into your agent:",
	"",
	"Install the memory system by applying:",
	"https://github.com/openclaw/openclaw/commit/9ffea23f31ca1df5183b25668f8f814bee0fb34e",
	"https://github.com/openclaw/openclaw/commit/7d1fee70e76f2f634f1b41fca927ee663914183a"
].join("\n");
async function shouldSuggestMemorySystem(workspaceDir) {
	const memoryPaths = [path.join(workspaceDir, "MEMORY.md"), path.join(workspaceDir, "memory.md")];
	for (const memoryPath of memoryPaths) try {
		await fs.promises.access(memoryPath);
		return false;
	} catch {}
	const agentsPath = path.join(workspaceDir, DEFAULT_AGENTS_FILENAME);
	try {
		const content = await fs.promises.readFile(agentsPath, "utf-8");
		if (/memory\.md/i.test(content)) return false;
	} catch {}
	return true;
}
function detectLegacyWorkspaceDirs(params) {
	return {
		activeWorkspace: path.resolve(params.workspaceDir),
		legacyDirs: []
	};
}
function formatLegacyWorkspaceWarning(detection) {
	return [
		"Extra workspace directories detected (may contain old agent files):",
		...detection.legacyDirs.map((dir) => `- ${shortenHomePath(dir)}`),
		`Active workspace: ${shortenHomePath(detection.activeWorkspace)}`,
		"If unused, archive or move to Trash."
	].join("\n");
}

//#endregion
//#region src/commands/doctor-workspace-status.ts
function noteWorkspaceStatus(cfg) {
	const workspaceDir = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
	const legacyWorkspace = detectLegacyWorkspaceDirs({ workspaceDir });
	if (legacyWorkspace.legacyDirs.length > 0) note$1(formatLegacyWorkspaceWarning(legacyWorkspace), "Extra workspace");
	const skillsReport = buildWorkspaceSkillStatus(workspaceDir, { config: cfg });
	note$1([
		`Eligible: ${skillsReport.skills.filter((s) => s.eligible).length}`,
		`Missing requirements: ${skillsReport.skills.filter((s) => !s.eligible && !s.disabled && !s.blockedByAllowlist).length}`,
		`Blocked by allowlist: ${skillsReport.skills.filter((s) => s.blockedByAllowlist).length}`
	].join("\n"), "Skills status");
	const pluginRegistry = loadOpenClawPlugins({
		config: cfg,
		workspaceDir,
		logger: {
			info: () => {},
			warn: () => {},
			error: () => {},
			debug: () => {}
		}
	});
	if (pluginRegistry.plugins.length > 0) {
		const loaded = pluginRegistry.plugins.filter((p) => p.status === "loaded");
		const disabled = pluginRegistry.plugins.filter((p) => p.status === "disabled");
		const errored = pluginRegistry.plugins.filter((p) => p.status === "error");
		note$1([
			`Loaded: ${loaded.length}`,
			`Disabled: ${disabled.length}`,
			`Errors: ${errored.length}`,
			errored.length > 0 ? `- ${errored.slice(0, 10).map((p) => p.id).join("\n- ")}${errored.length > 10 ? "\n- ..." : ""}` : null
		].filter((line) => Boolean(line)).join("\n"), "Plugins");
	}
	if (pluginRegistry.diagnostics.length > 0) note$1(pluginRegistry.diagnostics.map((diag) => {
		const prefix = diag.level.toUpperCase();
		const plugin = diag.pluginId ? ` ${diag.pluginId}` : "";
		const source = diag.source ? ` (${diag.source})` : "";
		return `- ${prefix}${plugin}: ${diag.message}${source}`;
	}).join("\n"), "Plugin diagnostics");
	return { workspaceDir };
}

//#endregion
//#region src/commands/doctor.ts
const intro$1 = (message) => intro(stylePromptTitle(message) ?? message);
const outro$1 = (message) => outro(stylePromptTitle(message) ?? message);
function resolveMode(cfg) {
	return cfg.gateway?.mode === "remote" ? "remote" : "local";
}
async function doctorCommand(runtime = defaultRuntime, options = {}) {
	const prompter = createDoctorPrompter({
		runtime,
		options
	});
	printWizardHeader(runtime);
	intro$1("OpenClaw doctor");
	const root = await resolveOpenClawPackageRoot({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	});
	if ((await maybeOfferUpdateBeforeDoctor({
		runtime,
		options,
		root,
		confirm: (p) => prompter.confirm(p),
		outro: outro$1
	})).handled) return;
	await maybeRepairUiProtocolFreshness(runtime, prompter);
	noteSourceInstallIssues(root);
	noteDeprecatedLegacyEnvVars();
	const configResult = await loadAndMaybeMigrateDoctorConfig({
		options,
		confirm: (p) => prompter.confirm(p)
	});
	let cfg = configResult.cfg;
	const configPath = configResult.path ?? CONFIG_PATH;
	if (!cfg.gateway?.mode) {
		const lines = [
			"gateway.mode is unset; gateway start will be blocked.",
			`Fix: run ${formatCliCommand("openclaw configure")} and set Gateway mode (local/remote).`,
			`Or set directly: ${formatCliCommand("openclaw config set gateway.mode local")}`
		];
		if (!fs.existsSync(configPath)) lines.push(`Missing config: run ${formatCliCommand("openclaw setup")} first.`);
		note$1(lines.join("\n"), "Gateway");
	}
	cfg = await maybeRepairAnthropicOAuthProfileId(cfg, prompter);
	cfg = await maybeRemoveDeprecatedCliAuthProfiles(cfg, prompter);
	await noteAuthProfileHealth({
		cfg,
		prompter,
		allowKeychainPrompt: options.nonInteractive !== true && Boolean(process.stdin.isTTY)
	});
	const gatewayDetails = buildGatewayConnectionDetails({ config: cfg });
	if (gatewayDetails.remoteFallbackNote) note$1(gatewayDetails.remoteFallbackNote, "Gateway");
	if (resolveMode(cfg) === "local") {
		const auth = resolveGatewayAuth({
			authConfig: cfg.gateway?.auth,
			tailscaleMode: cfg.gateway?.tailscale?.mode ?? "off"
		});
		if (auth.mode !== "password" && (auth.mode !== "token" || !auth.token)) {
			note$1("Gateway auth is off or missing a token. Token auth is now the recommended default (including loopback).", "Gateway auth");
			if (options.generateGatewayToken === true ? true : options.nonInteractive === true ? false : await prompter.confirmRepair({
				message: "Generate and configure a gateway token now?",
				initialValue: true
			})) {
				const nextToken = randomToken();
				cfg = {
					...cfg,
					gateway: {
						...cfg.gateway,
						auth: {
							...cfg.gateway?.auth,
							mode: "token",
							token: nextToken
						}
					}
				};
				note$1("Gateway token configured.", "Gateway auth");
			}
		}
	}
	const legacyState = await detectLegacyStateMigrations({ cfg });
	if (legacyState.preview.length > 0) {
		note$1(legacyState.preview.join("\n"), "Legacy state detected");
		if (options.nonInteractive === true ? true : await prompter.confirm({
			message: "Migrate legacy state (sessions/agent/WhatsApp auth) now?",
			initialValue: true
		})) {
			const migrated = await runLegacyStateMigrations({ detected: legacyState });
			if (migrated.changes.length > 0) note$1(migrated.changes.join("\n"), "Doctor changes");
			if (migrated.warnings.length > 0) note$1(migrated.warnings.join("\n"), "Doctor warnings");
		}
	}
	await noteStateIntegrity(cfg, prompter, configResult.path ?? CONFIG_PATH);
	cfg = await maybeRepairSandboxImages(cfg, runtime, prompter);
	noteSandboxScopeWarnings(cfg);
	await maybeScanExtraGatewayServices(options, runtime, prompter);
	await maybeRepairGatewayServiceConfig(cfg, resolveMode(cfg), runtime, prompter);
	await noteMacLaunchAgentOverrides();
	await noteMacLaunchctlGatewayEnvOverrides(cfg);
	await noteSecurityWarnings(cfg);
	if (cfg.hooks?.gmail?.model?.trim()) {
		const hooksModelRef = resolveHooksGmailModel({
			cfg,
			defaultProvider: DEFAULT_PROVIDER
		});
		if (!hooksModelRef) note$1(`- hooks.gmail.model "${cfg.hooks.gmail.model}" could not be resolved`, "Hooks");
		else {
			const { provider: defaultProvider, model: defaultModel } = resolveConfiguredModelRef({
				cfg,
				defaultProvider: DEFAULT_PROVIDER,
				defaultModel: DEFAULT_MODEL
			});
			const catalog = await loadModelCatalog({ config: cfg });
			const status = getModelRefStatus({
				cfg,
				catalog,
				ref: hooksModelRef,
				defaultProvider,
				defaultModel
			});
			const warnings = [];
			if (!status.allowed) warnings.push(`- hooks.gmail.model "${status.key}" not in agents.defaults.models allowlist (will use primary instead)`);
			if (!status.inCatalog) warnings.push(`- hooks.gmail.model "${status.key}" not in the model catalog (may fail at runtime)`);
			if (warnings.length > 0) note$1(warnings.join("\n"), "Hooks");
		}
	}
	if (options.nonInteractive !== true && process.platform === "linux" && resolveMode(cfg) === "local") {
		const service = resolveGatewayService();
		let loaded = false;
		try {
			loaded = await service.isLoaded({ env: process.env });
		} catch {
			loaded = false;
		}
		if (loaded) await ensureSystemdUserLingerInteractive({
			runtime,
			prompter: {
				confirm: async (p) => prompter.confirm(p),
				note: note$1
			},
			reason: "Gateway runs as a systemd user service. Without lingering, systemd stops the user session on logout/idle and kills the Gateway.",
			requireConfirm: true
		});
	}
	noteWorkspaceStatus(cfg);
	await doctorShellCompletion(runtime, prompter, { nonInteractive: options.nonInteractive });
	const { healthOk } = await checkGatewayHealth({
		runtime,
		cfg,
		timeoutMs: options.nonInteractive === true ? 3e3 : 1e4
	});
	await maybeRepairGatewayDaemon({
		cfg,
		runtime,
		prompter,
		options,
		gatewayDetailsMessage: gatewayDetails.message,
		healthOk
	});
	if (prompter.shouldRepair || configResult.shouldWriteConfig) {
		cfg = applyWizardMetadata(cfg, {
			command: "doctor",
			mode: resolveMode(cfg)
		});
		await writeConfigFile(cfg);
		logConfigUpdated(runtime);
		const backupPath = `${CONFIG_PATH}.bak`;
		if (fs.existsSync(backupPath)) runtime.log(`Backup: ${shortenHomePath(backupPath)}`);
	} else runtime.log(`Run "${formatCliCommand("openclaw doctor --fix")}" to apply changes.`);
	if (options.workspaceSuggestions !== false) {
		const workspaceDir = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
		noteWorkspaceBackupTip(workspaceDir);
		if (await shouldSuggestMemorySystem(workspaceDir)) note$1(MEMORY_SYSTEM_PROMPT, "Workspace");
	}
	const finalSnapshot = await readConfigFileSnapshot();
	if (finalSnapshot.exists && !finalSnapshot.valid) {
		runtime.error("Invalid config:");
		for (const issue of finalSnapshot.issues) {
			const path = issue.path || "<root>";
			runtime.error(`- ${path}: ${issue.message}`);
		}
	}
	outro$1("Doctor complete.");
}

//#endregion
export { loadAndMaybeMigrateDoctorConfig as n, doctorCommand as t };