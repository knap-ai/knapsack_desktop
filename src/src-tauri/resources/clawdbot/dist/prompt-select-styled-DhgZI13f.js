import { o as getResolvedLoggerSettings } from "./logger-kwZIqwuw.js";
import { C as resolveRequiredHomeDir, _ as resolveStateDir, d as resolveIsNixMode, h as resolveOAuthDir, t as CONFIG_PATH, u as resolveGatewayPort } from "./paths-ViKUYWUK.js";
import { m as defaultRuntime } from "./subsystem-DISldKSB.js";
import { t as sanitizeForLog } from "./ansi-BEJF8NKS.js";
import { t as isTruthyEnvValue$1 } from "./env-Dnra1IpT.js";
import { C as sleep, S as shortenHomePath, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import "./paths-C4Oy7wjk.js";
import { d as resolveProfileUnusableUntilForDisplay, h as repairOAuthProfileIdMismatch, m as resolveApiKeyForProfile } from "./auth-profiles-DRuJBw5y.js";
import { T as parseAgentSessionKey, _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID, v as normalizeOptionalAccountId } from "./session-key-DAhnzjyr.js";
import { a as resolveAgentDir, m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-bjWqU22i.js";
import { n as runCommandWithTimeout, r as runExec } from "./exec-B5_AYfQG.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-DqTSxvim.js";
import { t as DEFAULT_AGENTS_FILENAME } from "./workspace-D4K6QX9X.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-eEZJg44K.js";
import { _ as resolveHooksGmailModel, a as getModelRefStatus, h as resolveConfiguredModelRef } from "./model-selection-BnFtDmP7.js";
import { r as normalizeProviderId } from "./provider-id-Cjha-r0T.js";
import { B as isTrustedSafeBinPath, Ft as resolveNormalizedProviderModelMaxTokens, H as normalizeTrustedSafeBinDirs, It as DEFAULT_TALK_PROVIDER, Rt as normalizeTalkSection, W as listRiskyConfiguredSafeBins, d as readConfigFileSnapshot, g as writeConfigFile, ot as resolveCommandResolutionFromArgv, z as getTrustedSafeBinDirs } from "./io-y3Az_Onx.js";
import { a as hasConfiguredSecretInput, d as resolveSecretInputRef } from "./types.secrets-DgX397vI.js";
import { A as resolveSlackNativeStreaming, D as formatSlackStreamingBooleanMigrationMessage, E as formatSlackStreamModeMigrationMessage, M as resolveTelegramPreviewStreamMode, j as resolveSlackStreamingMode, k as resolveDiscordPreviewStreamMode } from "./zod-schema.providers-core-COy5nBQ0.js";
import { n as migrateLegacyWebSearchConfig } from "./legacy-web-search-BB-ZHEhz.js";
import { c as normalizeChatChannelId } from "./registry-C5UkPpaO.js";
import { i as normalizePluginId } from "./config-state-Br0ucqMb.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-B5JNQdOM.js";
import { n as parseToolsBySenderTypedKey, r as migrateLegacyConfig } from "./config-D4zN4BRl.js";
import { t as describeUnknownError } from "./shared-B5oxOBg0.js";
import { c as ensureAuthProfileStore, m as updateAuthProfileStoreWithLock } from "./profiles-COPO-hHI.js";
import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
import { f as resolveGatewaySystemdServiceName, h as resolveNodeLaunchAgentLabel, l as resolveGatewayLaunchAgentLabel, p as resolveGatewayWindowsTaskName } from "./constants-BYFJPaZy.js";
import { a as resolveSystemNodeInfo, r as renderSystemNodeWarning } from "./runtime-paths-DOEOEFe-.js";
import { n as buildGatewayInstallPlan, r as gatewayInstallErrorHint, t as resolveGatewayInstallToken } from "./gateway-install-token-De_pFluK.js";
import { n as GATEWAY_DAEMON_RUNTIME_OPTIONS, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-lubXrOfs.js";
import { n as hasAmbiguousGatewayAuthModeConfig } from "./auth-mode-policy-D0EmeFk_.js";
import { d as resolveGatewayBindHost, r as isLoopbackHost } from "./net-JAg9zL0G.js";
import { a as resolveGatewayAuth } from "./auth-Buq0Niri.js";
import { d as readGatewayTokenEnv } from "./credentials-D8pfRimu.js";
import { n as loadSessionStore } from "./store-C5UK26Ce.js";
import { n as isPrimarySessionTranscriptFileName, t as formatSessionArchiveTimestamp } from "./artifacts-BB7bT-zn.js";
import { c as listChannelPlugins } from "./plugins-B09-vgme.js";
import { i as resolveMainSessionKey } from "./main-session-ClbmrpGK.js";
import { i as resolveAgentSessionDirs } from "./sessions-D9ZgHCHb.js";
import { c as resolveSessionTranscriptsDirForAgent, i as resolveSessionFilePathOptions, l as resolveStorePath, r as resolveSessionFilePath } from "./paths-rhN9LKM_.js";
import { n as cleanStaleLockFiles } from "./session-write-lock-va3qZE6f.js";
import { n as buildGatewayConnectionDetails, r as callGateway } from "./call-CQbSO4Fr.js";
import { f as printWizardHeader, m as randomToken, n as applyWizardMetadata, s as guardCancel } from "./onboard-helpers-D5cfC-Ra.js";
import { r as isWSLEnv, t as isWSL } from "./wsl-BVCo-dpy.js";
import { n as stylePromptMessage, r as stylePromptTitle, t as stylePromptHint } from "./prompt-style-C4CV4Y_p.js";
import { i as launchAgentPlistExists, n as isLaunchAgentListed, r as isLaunchAgentLoaded, s as repairLaunchAgentBootstrap } from "./launchd-yOx8f787.js";
import { n as resolveGatewayService, t as describeGatewayServiceRestart } from "./service-DdJ2Qk7P.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-FldL_Lhq.js";
import { i as isSystemdUserServiceAvailable, u as uninstallLegacySystemdUnits } from "./systemd-bGhJCG6J.js";
import { c as buildPlatformRuntimeLogHints, i as auditGatewayServiceConfig, n as renderSystemdUnavailableHints, o as needsNodeRuntimeMigration, r as SERVICE_AUDIT_CODES, s as readEmbeddedGatewayToken, t as isSystemdUnavailableDetail, u as formatRuntimeStatus } from "./systemd-hints-DvBn5bxv.js";
import { n as formatConfigIssueLines } from "./issue-format-BtLIwOtN.js";
import { t as readLastGatewayErrorLine } from "./diagnostics-CwDNepDU.js";
import { n as renderGatewayServiceCleanupHints, t as findExtraGatewayServices } from "./inspect-CWK9qVB8.js";
import { $p as resolveBootstrapContextForRun, G_ as listTelegramAccountIds, H_ as inspectTelegramAccount, Hd as resolveCommandSecretRefsViaGateway, Jy as applyPluginAutoEnable, NS as resolveBootstrapMaxChars, P as hasConfiguredMemorySecretInput, PS as resolveBootstrapTotalMaxChars, R_ as lookupTelegramChatId, V as resolveApiKeyForProvider, Y_ as resolveTelegramAccount, ht as loadOpenClawPlugins, mt as resolvePluginProviders, nm as analyzeBootstrapBudget, rm as buildBootstrapInjectionStats, zS as loadModelCatalog } from "./pi-embedded-CbCYZxIb.js";
import { t as resolveMemorySearchConfig } from "./memory-search-B_aq08y5.js";
import { i as listRouteBindings } from "./bindings-YfRKkWOL.js";
import { a as formatSetExplicitDefaultToConfiguredInstruction, i as formatSetExplicitDefaultInstruction, r as formatChannelAccountsDefaultPath } from "./routing-zOQ0wwtV.js";
import { D as resolveSandboxScope, M as DEFAULT_SANDBOX_BROWSER_IMAGE, P as DEFAULT_SANDBOX_IMAGE } from "./docker-Bhjg8g2t.js";
import { l as shouldMoveSingleAccountChannelKey } from "./setup-helpers-B2gYys18.js";
import { a as readChannelAllowFromStore } from "./pairing-store-BGKLrjo6.js";
import { r as resolveDmAllowState } from "./dm-policy-shared-DtcQProI.js";
import { n as logConfigUpdated } from "./logging-CCTKg_fh.js";
import { n as resolveCronStorePath, r as saveCronStore, t as loadCronStore } from "./config-runtime-BYNizC50.js";
import { t as collectProviderDangerousNameMatchingScopes } from "./dangerous-name-matching-BQW4HoPt.js";
import { C as parseBrowserMajorVersion, T as resolveGoogleChromeExecutableForPlatform, at as resolveConfiguredSecretInputWithFallback, w as readBrowserVersion } from "./routes-XT2JfvT-.js";
import { n as normalizeTelegramAllowFromEntry, t as isNumericTelegramUserId } from "./allow-from-DiU9dMhv.js";
import { a as listInterpreterLikeSafeBins, s as resolveMergedSafeBinProfileFixtures } from "./exec-inline-eval-CpmxWJsW.js";
import { n as getChannelsCommandSecretTargetIds } from "./command-secret-targets-DLs8jC2H.js";
import { r as resolveMemoryBackendConfig } from "./search-manager-DNBHwaee.js";
import { a as detectLegacyMatrixState, i as autoMigrateLegacyMatrixState, n as hasPendingMatrixMigration, o as autoPrepareLegacyMatrixCrypto, r as maybeCreateMatrixMigrationSnapshot, s as detectLegacyMatrixCrypto, t as hasActionableMatrixMigration } from "./matrix-migration-snapshot-DTfN6Lm9.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-BhDjqqQc.js";
import { r as buildPluginCompatibilityWarnings } from "./status-DI5hmNdJ.js";
import { n as buildAuthHealthSummary, r as formatRemainingShort, t as DEFAULT_OAUTH_WARN_MS } from "./auth-health-MPTaawEO.js";
import { t as note$1 } from "./note-Cq-EkeJ6.js";
import { r as healthCommand } from "./health-CSjz5K7z.js";
import { i as resolveControlUiDistIndexPathForRoot, r as resolveControlUiDistIndexHealth } from "./control-ui-assets-DBgPQZLL.js";
import { m as normalizeStoredCronJobs, n as runGatewayUpdate, t as runStartupMatrixMigration, v as detectPluginInstallPathIssue, y as formatPluginInstallPathIssue } from "./server-startup-matrix-migration-DR8lh8kT.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-DweHoyQa.js";
import { n as resolveProviderAuthLoginCommand, t as buildProviderAuthRecoveryHint } from "./provider-auth-guidance-BLTUrTMo.js";
import { t as ensureSystemdUserLingerInteractive } from "./systemd-linger-CPlvYre1.js";
import { t as formatHealthCheckFailure } from "./health-format-7GPO1PzB.js";
import { n as doctorShellCompletion } from "./doctor-completion-Crwr0k76.js";
import { a as stripUnknownConfigKeys, i as resolveConfigPathTarget, n as formatConfigPath, r as noteOpencodeProviderOverrides, t as runDoctorConfigPreflight } from "./doctor-config-preflight-LCtZbUGU.js";
import { a as isMattermostMutableAllowEntry, i as isMSTeamsMutableAllowEntry, n as isGoogleChatMutableAllowEntry, o as isSlackMutableAllowEntry, r as isIrcMutableAllowEntry, s as isZalouserMutableGroupEntry, t as isDiscordMutableAllowEntry } from "./mutable-allowlist-detectors-292eCqQE.js";
import { t as resolveDefaultChannelAccountContext } from "./channel-account-context-B1QSXfoG.js";
import { i as runLegacyStateMigrations, n as detectLegacyStateMigrations } from "./doctor-state-migrations-EWrVSdyy.js";
import { n as noteOpenAIOAuthTlsPrerequisites } from "./provider-openai-codex-oauth-tls-D-P88CMr.js";
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";
import fs$1 from "node:fs/promises";
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
	const deprecatedEntries = resolvePluginProviders({
		config: cfg,
		env: process.env,
		bundledProviderAllowlistCompat: true,
		bundledProviderVitestCompat: true
	}).flatMap((provider) => (provider.deprecatedProfileIds ?? []).filter((profileId) => store.profiles[profileId] || cfg.auth?.profiles?.[profileId]).map((profileId) => ({
		profileId,
		providerId: provider.id,
		providerLabel: provider.label
	})));
	const deprecated = new Set(deprecatedEntries.map((entry) => entry.profileId));
	if (deprecated.size === 0) return cfg;
	const lines = ["Deprecated external CLI auth profiles detected (no longer supported):"];
	for (const entry of deprecatedEntries) {
		const authCommand = resolveProviderAuthLoginCommand({
			provider: entry.providerId,
			config: cfg,
			env: process.env
		}) ?? formatCliCommand("openclaw configure");
		lines.push(`- ${entry.profileId} (${entry.providerLabel}): use ${authCommand}`);
	}
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
function resolveUnusableProfileHint(params) {
	if (params.kind === "disabled") {
		if (params.reason === "billing") return "Top up credits (provider billing) or switch provider.";
		if (params.reason === "auth_permanent" || params.reason === "auth") return "Refresh or replace credentials, then retry.";
	}
	return "Wait for cooldown or switch provider.";
}
function formatAuthIssueHint(issue) {
	if (issue.reasonCode === "invalid_expires") return "Invalid token expires metadata. Set a future Unix ms timestamp or remove expires.";
	if (issue.provider === "anthropic" && issue.profileId === "anthropic:claude-cli") return `Deprecated profile. ${buildProviderAuthRecoveryHint({ provider: "anthropic" })}`;
	if (issue.provider === "openai-codex" && issue.profileId === "openai-codex:codex-cli") return `Deprecated profile. ${buildProviderAuthRecoveryHint({ provider: "openai-codex" })}`;
	return buildProviderAuthRecoveryHint({ provider: issue.provider }).replace(/^Run /, "Re-auth via ");
}
function formatAuthIssueLine(issue) {
	const remaining = issue.remainingMs !== void 0 ? ` (${formatRemainingShort(issue.remainingMs)})` : "";
	const hint = formatAuthIssueHint(issue);
	const reason = issue.reasonCode ? ` [${issue.reasonCode}]` : "";
	return `- ${issue.profileId}: ${issue.status}${reason}${remaining}${hint ? ` — ${hint}` : ""}`;
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
			const disabledActive = typeof stats?.disabledUntil === "number" && now < stats.disabledUntil;
			const kind = disabledActive ? `disabled${stats.disabledReason ? `:${stats.disabledReason}` : ""}` : "cooldown";
			const hint = resolveUnusableProfileHint({
				kind: disabledActive ? "disabled" : "cooldown",
				reason: stats?.disabledReason
			});
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
		reasonCode: issue.reasonCode,
		remainingMs: issue.remainingMs
	})).join("\n"), "Model auth");
}
//#endregion
//#region src/commands/doctor-bootstrap-size.ts
function formatInt(value) {
	return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(value)));
}
function formatPercent(numerator, denominator) {
	if (!Number.isFinite(denominator) || denominator <= 0) return "0%";
	return `${Math.min(100, Math.max(0, Math.round(numerator / denominator * 100)))}%`;
}
function formatCauses(causes) {
	if (causes.length === 0) return "unknown";
	return causes.map((cause) => cause === "per-file-limit" ? "max/file" : "max/total").join(", ");
}
async function noteBootstrapFileSize(cfg) {
	const workspaceDir = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
	const bootstrapMaxChars = resolveBootstrapMaxChars(cfg);
	const bootstrapTotalMaxChars = resolveBootstrapTotalMaxChars(cfg);
	const { bootstrapFiles, contextFiles } = await resolveBootstrapContextForRun({
		workspaceDir,
		config: cfg
	});
	const analysis = analyzeBootstrapBudget({
		files: buildBootstrapInjectionStats({
			bootstrapFiles,
			injectedFiles: contextFiles
		}),
		bootstrapMaxChars,
		bootstrapTotalMaxChars
	});
	if (!analysis.hasTruncation && analysis.nearLimitFiles.length === 0 && !analysis.totalNearLimit) return analysis;
	const lines = [];
	if (analysis.hasTruncation) {
		lines.push("Workspace bootstrap files exceed limits and will be truncated:");
		for (const file of analysis.truncatedFiles) {
			const truncatedChars = Math.max(0, file.rawChars - file.injectedChars);
			lines.push(`- ${file.name}: ${formatInt(file.rawChars)} raw / ${formatInt(file.injectedChars)} injected (${formatPercent(truncatedChars, file.rawChars)} truncated; ${formatCauses(file.causes)})`);
		}
	} else lines.push("Workspace bootstrap files are near configured limits:");
	const nonTruncatedNearLimit = analysis.nearLimitFiles.filter((file) => !file.truncated);
	if (nonTruncatedNearLimit.length > 0) for (const file of nonTruncatedNearLimit) lines.push(`- ${file.name}: ${formatInt(file.rawChars)} chars (${formatPercent(file.rawChars, bootstrapMaxChars)} of max/file ${formatInt(bootstrapMaxChars)})`);
	lines.push(`Total bootstrap injected chars: ${formatInt(analysis.totals.injectedChars)} (${formatPercent(analysis.totals.injectedChars, bootstrapTotalMaxChars)} of max/total ${formatInt(bootstrapTotalMaxChars)}).`);
	lines.push(`Total bootstrap raw chars (before truncation): ${formatInt(analysis.totals.rawChars)}.`);
	const needsPerFileTip = analysis.truncatedFiles.some((file) => file.causes.includes("per-file-limit")) || analysis.nearLimitFiles.length > 0;
	const needsTotalTip = analysis.truncatedFiles.some((file) => file.causes.includes("total-limit")) || analysis.totalNearLimit;
	if (needsPerFileTip || needsTotalTip) lines.push("");
	if (needsPerFileTip) lines.push("- Tip: tune `agents.defaults.bootstrapMaxChars` for per-file limits.");
	if (needsTotalTip) lines.push("- Tip: tune `agents.defaults.bootstrapTotalMaxChars` for total-budget limits.");
	note$1(lines.join("\n"), "Bootstrap file size");
	return analysis;
}
//#endregion
//#region src/commands/doctor-browser.ts
const CHROME_MCP_MIN_MAJOR = 144;
const REMOTE_DEBUGGING_PAGES = [
	"chrome://inspect/#remote-debugging",
	"brave://inspect/#remote-debugging",
	"edge://inspect/#remote-debugging"
].join(", ");
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function collectChromeMcpProfiles(cfg) {
	const browser = asRecord(cfg.browser);
	if (!browser) return [];
	const profiles = /* @__PURE__ */ new Map();
	if ((typeof browser.defaultProfile === "string" ? browser.defaultProfile.trim() : "") === "user") profiles.set("user", { name: "user" });
	const configuredProfiles = asRecord(browser.profiles);
	if (!configuredProfiles) return [...profiles.values()].toSorted((a, b) => a.name.localeCompare(b.name));
	for (const [profileName, rawProfile] of Object.entries(configuredProfiles)) {
		const profile = asRecord(rawProfile);
		if ((typeof profile?.driver === "string" ? profile.driver.trim() : "") === "existing-session") {
			const userDataDir = typeof profile?.userDataDir === "string" ? profile.userDataDir.trim() : void 0;
			profiles.set(profileName, {
				name: profileName,
				userDataDir: userDataDir || void 0
			});
		}
	}
	return [...profiles.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}
async function noteChromeMcpBrowserReadiness(cfg, deps) {
	const profiles = collectChromeMcpProfiles(cfg);
	if (profiles.length === 0) return;
	const noteFn = deps?.noteFn ?? note$1;
	const platform = deps?.platform ?? process.platform;
	const resolveChromeExecutable = deps?.resolveChromeExecutable ?? resolveGoogleChromeExecutableForPlatform;
	const readVersion = deps?.readVersion ?? readBrowserVersion;
	const explicitProfiles = profiles.filter((profile) => profile.userDataDir);
	const autoConnectProfiles = profiles.filter((profile) => !profile.userDataDir);
	const profileLabel = profiles.map((profile) => profile.name).join(", ");
	if (autoConnectProfiles.length === 0) {
		noteFn([
			`- Chrome MCP existing-session is configured for profile(s): ${profileLabel}.`,
			"- These profiles use an explicit Chromium user data directory instead of Chrome's default auto-connect path.",
			`- Verify the matching Chromium-based browser is version ${CHROME_MCP_MIN_MAJOR}+ on the same host as the Gateway or node.`,
			`- Enable remote debugging in that browser's inspect page (${REMOTE_DEBUGGING_PAGES}).`,
			"- Keep the browser running and accept the attach consent prompt the first time OpenClaw connects."
		].join("\n"), "Browser");
		return;
	}
	const chrome = resolveChromeExecutable(platform);
	const autoProfileLabel = autoConnectProfiles.map((profile) => profile.name).join(", ");
	if (!chrome) {
		const lines = [
			`- Chrome MCP existing-session is configured for profile(s): ${profileLabel}.`,
			`- Google Chrome was not found on this host for auto-connect profile(s): ${autoProfileLabel}. OpenClaw does not bundle Chrome.`,
			`- Install Google Chrome ${CHROME_MCP_MIN_MAJOR}+ on the same host as the Gateway or node, or set browser.profiles.<name>.userDataDir for a different Chromium-based browser.`,
			`- Enable remote debugging in the browser inspect page (${REMOTE_DEBUGGING_PAGES}).`,
			"- Keep the browser running and accept the attach consent prompt the first time OpenClaw connects.",
			"- Docker, headless, and sandbox browser flows stay on raw CDP; this check only applies to host-local Chrome MCP attach."
		];
		if (explicitProfiles.length > 0) lines.push(`- Profiles with explicit userDataDir skip Chrome auto-detection: ${explicitProfiles.map((profile) => profile.name).join(", ")}.`);
		noteFn(lines.join("\n"), "Browser");
		return;
	}
	const versionRaw = readVersion(chrome.path);
	const major = parseBrowserMajorVersion(versionRaw);
	const lines = [`- Chrome MCP existing-session is configured for profile(s): ${profileLabel}.`, `- Chrome path: ${chrome.path}`];
	if (!versionRaw || major === null) lines.push(`- Could not determine the installed Chrome version. Chrome MCP requires Google Chrome ${CHROME_MCP_MIN_MAJOR}+ on this host.`);
	else if (major < CHROME_MCP_MIN_MAJOR) lines.push(`- Detected Chrome ${versionRaw}, which is too old for Chrome MCP existing-session attach. Upgrade to Chrome ${CHROME_MCP_MIN_MAJOR}+.`);
	else lines.push(`- Detected Chrome ${versionRaw}.`);
	lines.push(`- Enable remote debugging in the browser inspect page (${REMOTE_DEBUGGING_PAGES}).`);
	lines.push("- Keep the browser running and accept the attach consent prompt the first time OpenClaw connects.");
	if (explicitProfiles.length > 0) lines.push(`- Profiles with explicit userDataDir still need manual validation of the matching Chromium-based browser: ${explicitProfiles.map((profile) => profile.name).join(", ")}.`);
	noteFn(lines.join("\n"), "Browser");
}
//#endregion
//#region src/commands/doctor-legacy-config.ts
function normalizeCompatibilityConfigValues(cfg) {
	const changes = [];
	const NANO_BANANA_SKILL_KEY = "nano-banana-pro";
	const NANO_BANANA_MODEL = "google/gemini-3-pro-image-preview";
	let next = cfg;
	const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
	const normalizeDmAliases = (params) => {
		let changed = false;
		let updated = params.entry;
		const rawDm = updated.dm;
		const dm = isRecord(rawDm) ? structuredClone(rawDm) : null;
		let dmChanged = false;
		const allowFromEqual = (a, b) => {
			if (!Array.isArray(a) || !Array.isArray(b)) return false;
			const na = a.map((v) => String(v).trim()).filter(Boolean);
			const nb = b.map((v) => String(v).trim()).filter(Boolean);
			if (na.length !== nb.length) return false;
			return na.every((v, i) => v === nb[i]);
		};
		const topDmPolicy = updated.dmPolicy;
		const legacyDmPolicy = dm?.policy;
		if (topDmPolicy === void 0 && legacyDmPolicy !== void 0) {
			updated = {
				...updated,
				dmPolicy: legacyDmPolicy
			};
			changed = true;
			if (dm) {
				delete dm.policy;
				dmChanged = true;
			}
			changes.push(`Moved ${params.pathPrefix}.dm.policy → ${params.pathPrefix}.dmPolicy.`);
		} else if (topDmPolicy !== void 0 && legacyDmPolicy !== void 0) {
			if (topDmPolicy === legacyDmPolicy) {
				if (dm) {
					delete dm.policy;
					dmChanged = true;
					changes.push(`Removed ${params.pathPrefix}.dm.policy (dmPolicy already set).`);
				}
			}
		}
		const topAllowFrom = updated.allowFrom;
		const legacyAllowFrom = dm?.allowFrom;
		if (topAllowFrom === void 0 && legacyAllowFrom !== void 0) {
			updated = {
				...updated,
				allowFrom: legacyAllowFrom
			};
			changed = true;
			if (dm) {
				delete dm.allowFrom;
				dmChanged = true;
			}
			changes.push(`Moved ${params.pathPrefix}.dm.allowFrom → ${params.pathPrefix}.allowFrom.`);
		} else if (topAllowFrom !== void 0 && legacyAllowFrom !== void 0) {
			if (allowFromEqual(topAllowFrom, legacyAllowFrom)) {
				if (dm) {
					delete dm.allowFrom;
					dmChanged = true;
					changes.push(`Removed ${params.pathPrefix}.dm.allowFrom (allowFrom already set).`);
				}
			}
		}
		if (dm && isRecord(rawDm) && dmChanged) if (Object.keys(dm).length === 0) {
			if (updated.dm !== void 0) {
				const { dm: _ignored, ...rest } = updated;
				updated = rest;
				changed = true;
				changes.push(`Removed empty ${params.pathPrefix}.dm after migration.`);
			}
		} else {
			updated = {
				...updated,
				dm
			};
			changed = true;
		}
		return {
			entry: updated,
			changed
		};
	};
	const normalizePreviewStreamingAliases = (params) => {
		let updated = params.entry;
		const hadLegacyStreamMode = updated.streamMode !== void 0;
		const beforeStreaming = updated.streaming;
		const resolved = params.resolveStreaming(updated);
		if (!(hadLegacyStreamMode || typeof beforeStreaming === "boolean" || typeof beforeStreaming === "string" && beforeStreaming !== resolved)) return {
			entry: updated,
			changed: false
		};
		let changed = false;
		if (beforeStreaming !== resolved) {
			updated = {
				...updated,
				streaming: resolved
			};
			changed = true;
		}
		if (hadLegacyStreamMode) {
			const { streamMode: _ignored, ...rest } = updated;
			updated = rest;
			changed = true;
			changes.push(`Moved ${params.pathPrefix}.streamMode → ${params.pathPrefix}.streaming (${resolved}).`);
		}
		if (typeof beforeStreaming === "boolean") changes.push(`Normalized ${params.pathPrefix}.streaming boolean → enum (${resolved}).`);
		else if (typeof beforeStreaming === "string" && beforeStreaming !== resolved) changes.push(`Normalized ${params.pathPrefix}.streaming (${beforeStreaming}) → (${resolved}).`);
		if (params.pathPrefix.startsWith("channels.discord") && resolved === "off" && hadLegacyStreamMode) changes.push(`${params.pathPrefix}.streaming remains off by default to avoid Discord preview-edit rate limits; set ${params.pathPrefix}.streaming="partial" to opt in explicitly.`);
		return {
			entry: updated,
			changed
		};
	};
	const normalizeSlackStreamingAliases = (params) => {
		let updated = params.entry;
		const hadLegacyStreamMode = updated.streamMode !== void 0;
		const legacyStreaming = updated.streaming;
		const beforeStreaming = updated.streaming;
		const beforeNativeStreaming = updated.nativeStreaming;
		const resolvedStreaming = resolveSlackStreamingMode(updated);
		const resolvedNativeStreaming = resolveSlackNativeStreaming(updated);
		if (!(hadLegacyStreamMode || typeof legacyStreaming === "boolean" || typeof legacyStreaming === "string" && legacyStreaming !== resolvedStreaming)) return {
			entry: updated,
			changed: false
		};
		let changed = false;
		if (beforeStreaming !== resolvedStreaming) {
			updated = {
				...updated,
				streaming: resolvedStreaming
			};
			changed = true;
		}
		if (typeof beforeNativeStreaming !== "boolean" || beforeNativeStreaming !== resolvedNativeStreaming) {
			updated = {
				...updated,
				nativeStreaming: resolvedNativeStreaming
			};
			changed = true;
		}
		if (hadLegacyStreamMode) {
			const { streamMode: _ignored, ...rest } = updated;
			updated = rest;
			changed = true;
			changes.push(formatSlackStreamModeMigrationMessage(params.pathPrefix, resolvedStreaming));
		}
		if (typeof legacyStreaming === "boolean") changes.push(formatSlackStreamingBooleanMigrationMessage(params.pathPrefix, resolvedNativeStreaming));
		else if (typeof legacyStreaming === "string" && legacyStreaming !== resolvedStreaming) changes.push(`Normalized ${params.pathPrefix}.streaming (${legacyStreaming}) → (${resolvedStreaming}).`);
		return {
			entry: updated,
			changed
		};
	};
	const normalizeStreamingAliasesForProvider = (params) => {
		if (params.provider === "telegram") return normalizePreviewStreamingAliases({
			entry: params.entry,
			pathPrefix: params.pathPrefix,
			resolveStreaming: resolveTelegramPreviewStreamMode
		});
		if (params.provider === "discord") return normalizePreviewStreamingAliases({
			entry: params.entry,
			pathPrefix: params.pathPrefix,
			resolveStreaming: resolveDiscordPreviewStreamMode
		});
		return normalizeSlackStreamingAliases({
			entry: params.entry,
			pathPrefix: params.pathPrefix
		});
	};
	const normalizeProvider = (provider) => {
		const rawEntry = next.channels?.[provider];
		if (!isRecord(rawEntry)) return;
		let updated = rawEntry;
		let changed = false;
		if (provider !== "telegram") {
			const base = normalizeDmAliases({
				provider,
				entry: rawEntry,
				pathPrefix: `channels.${provider}`
			});
			updated = base.entry;
			changed = base.changed;
		}
		const providerStreaming = normalizeStreamingAliasesForProvider({
			provider,
			entry: updated,
			pathPrefix: `channels.${provider}`
		});
		updated = providerStreaming.entry;
		changed = changed || providerStreaming.changed;
		const rawAccounts = updated.accounts;
		if (isRecord(rawAccounts)) {
			let accountsChanged = false;
			const accounts = { ...rawAccounts };
			for (const [accountId, rawAccount] of Object.entries(rawAccounts)) {
				if (!isRecord(rawAccount)) continue;
				let accountEntry = rawAccount;
				let accountChanged = false;
				if (provider !== "telegram") {
					const res = normalizeDmAliases({
						provider,
						entry: rawAccount,
						pathPrefix: `channels.${provider}.accounts.${accountId}`
					});
					accountEntry = res.entry;
					accountChanged = res.changed;
				}
				const accountStreaming = normalizeStreamingAliasesForProvider({
					provider,
					entry: accountEntry,
					pathPrefix: `channels.${provider}.accounts.${accountId}`
				});
				accountEntry = accountStreaming.entry;
				accountChanged = accountChanged || accountStreaming.changed;
				if (accountChanged) {
					accounts[accountId] = accountEntry;
					accountsChanged = true;
				}
			}
			if (accountsChanged) {
				updated = {
					...updated,
					accounts
				};
				changed = true;
			}
		}
		if (changed) next = {
			...next,
			channels: {
				...next.channels,
				[provider]: updated
			}
		};
	};
	const normalizeLegacyBrowserProfiles = () => {
		const rawBrowser = next.browser;
		if (!isRecord(rawBrowser)) return;
		const browser = structuredClone(rawBrowser);
		let browserChanged = false;
		if ("relayBindHost" in browser) {
			delete browser.relayBindHost;
			browserChanged = true;
			changes.push("Removed browser.relayBindHost (legacy Chrome extension relay setting; host-local Chrome now uses Chrome MCP existing-session attach).");
		}
		const rawProfiles = browser.profiles;
		if (!isRecord(rawProfiles)) {
			if (!browserChanged) return;
			next = {
				...next,
				browser
			};
			return;
		}
		const profiles = { ...rawProfiles };
		let profilesChanged = false;
		for (const [profileName, rawProfile] of Object.entries(rawProfiles)) {
			if (!isRecord(rawProfile)) continue;
			if ((typeof rawProfile.driver === "string" ? rawProfile.driver.trim() : "") !== "extension") continue;
			profiles[profileName] = {
				...rawProfile,
				driver: "existing-session"
			};
			profilesChanged = true;
			changes.push(`Moved browser.profiles.${profileName}.driver "extension" → "existing-session" (Chrome MCP attach).`);
		}
		if (profilesChanged) {
			browser.profiles = profiles;
			browserChanged = true;
		}
		if (!browserChanged) return;
		next = {
			...next,
			browser
		};
	};
	const seedMissingDefaultAccountsFromSingleAccountBase = () => {
		const channels = next.channels;
		if (!channels) return;
		let channelsChanged = false;
		const nextChannels = { ...channels };
		for (const [channelId, rawChannel] of Object.entries(channels)) {
			if (!isRecord(rawChannel)) continue;
			const rawAccounts = rawChannel.accounts;
			if (!isRecord(rawAccounts)) continue;
			const accountKeys = Object.keys(rawAccounts);
			if (accountKeys.length === 0) continue;
			if (accountKeys.some((key) => key.trim().toLowerCase() === "default")) continue;
			const keysToMove = Object.entries(rawChannel).filter(([key, value]) => key !== "accounts" && key !== "enabled" && value !== void 0 && shouldMoveSingleAccountChannelKey({
				channelKey: channelId,
				key
			})).map(([key]) => key);
			if (keysToMove.length === 0) continue;
			const defaultAccount = {};
			for (const key of keysToMove) {
				const value = rawChannel[key];
				defaultAccount[key] = value && typeof value === "object" ? structuredClone(value) : value;
			}
			const nextChannel = { ...rawChannel };
			for (const key of keysToMove) delete nextChannel[key];
			nextChannel.accounts = {
				...rawAccounts,
				[DEFAULT_ACCOUNT_ID]: defaultAccount
			};
			nextChannels[channelId] = nextChannel;
			channelsChanged = true;
			changes.push(`Moved channels.${channelId} single-account top-level values into channels.${channelId}.accounts.default.`);
		}
		if (!channelsChanged) return;
		next = {
			...next,
			channels: nextChannels
		};
	};
	normalizeProvider("telegram");
	normalizeProvider("slack");
	normalizeProvider("discord");
	seedMissingDefaultAccountsFromSingleAccountBase();
	normalizeLegacyBrowserProfiles();
	const webSearchMigration = migrateLegacyWebSearchConfig(next);
	if (webSearchMigration.changes.length > 0) {
		next = webSearchMigration.config;
		changes.push(...webSearchMigration.changes);
	}
	const normalizeBrowserSsrFPolicyAlias = () => {
		const rawBrowser = next.browser;
		if (!isRecord(rawBrowser)) return;
		const rawSsrFPolicy = rawBrowser.ssrfPolicy;
		if (!isRecord(rawSsrFPolicy) || !("allowPrivateNetwork" in rawSsrFPolicy)) return;
		const legacyAllowPrivateNetwork = rawSsrFPolicy.allowPrivateNetwork;
		const currentDangerousAllowPrivateNetwork = rawSsrFPolicy.dangerouslyAllowPrivateNetwork;
		let resolvedDangerousAllowPrivateNetwork = currentDangerousAllowPrivateNetwork;
		if (typeof legacyAllowPrivateNetwork === "boolean" || typeof currentDangerousAllowPrivateNetwork === "boolean") resolvedDangerousAllowPrivateNetwork = legacyAllowPrivateNetwork === true || currentDangerousAllowPrivateNetwork === true;
		else if (currentDangerousAllowPrivateNetwork === void 0) resolvedDangerousAllowPrivateNetwork = legacyAllowPrivateNetwork;
		const nextSsrFPolicy = { ...rawSsrFPolicy };
		delete nextSsrFPolicy.allowPrivateNetwork;
		if (resolvedDangerousAllowPrivateNetwork !== void 0) nextSsrFPolicy.dangerouslyAllowPrivateNetwork = resolvedDangerousAllowPrivateNetwork;
		const migratedBrowser = { ...next.browser };
		migratedBrowser.ssrfPolicy = nextSsrFPolicy;
		next = {
			...next,
			browser: migratedBrowser
		};
		changes.push(`Moved browser.ssrfPolicy.allowPrivateNetwork → browser.ssrfPolicy.dangerouslyAllowPrivateNetwork (${String(resolvedDangerousAllowPrivateNetwork)}).`);
	};
	const normalizeLegacyNanoBananaSkill = () => {
		const rawSkills = next.skills;
		if (!isRecord(rawSkills)) return;
		let skillsChanged = false;
		let skills = structuredClone(rawSkills);
		if (Array.isArray(skills.allowBundled)) {
			const allowBundled = skills.allowBundled.filter((value) => typeof value !== "string" || value.trim() !== NANO_BANANA_SKILL_KEY);
			if (allowBundled.length !== skills.allowBundled.length) {
				if (allowBundled.length === 0) {
					delete skills.allowBundled;
					changes.push(`Removed skills.allowBundled entry for ${NANO_BANANA_SKILL_KEY}.`);
				} else {
					skills.allowBundled = allowBundled;
					changes.push(`Removed ${NANO_BANANA_SKILL_KEY} from skills.allowBundled.`);
				}
				skillsChanged = true;
			}
		}
		const rawEntries = skills.entries;
		if (!isRecord(rawEntries)) {
			if (skillsChanged) next = {
				...next,
				skills
			};
			return;
		}
		const rawLegacyEntry = rawEntries[NANO_BANANA_SKILL_KEY];
		if (!isRecord(rawLegacyEntry)) {
			if (skillsChanged) next = {
				...next,
				skills
			};
			return;
		}
		if (next.agents?.defaults?.imageGenerationModel === void 0) {
			next = {
				...next,
				agents: {
					...next.agents,
					defaults: {
						...next.agents?.defaults,
						imageGenerationModel: { primary: NANO_BANANA_MODEL }
					}
				}
			};
			changes.push(`Moved skills.entries.${NANO_BANANA_SKILL_KEY} → agents.defaults.imageGenerationModel.primary (${NANO_BANANA_MODEL}).`);
		}
		const legacyEnv = isRecord(rawLegacyEntry.env) ? rawLegacyEntry.env : void 0;
		const legacyEnvApiKey = typeof legacyEnv?.GEMINI_API_KEY === "string" ? legacyEnv.GEMINI_API_KEY.trim() : "";
		const legacyApiKey = legacyEnvApiKey || (typeof rawLegacyEntry.apiKey === "string" ? rawLegacyEntry.apiKey.trim() : rawLegacyEntry.apiKey && isRecord(rawLegacyEntry.apiKey) ? structuredClone(rawLegacyEntry.apiKey) : void 0);
		const rawModels = isRecord(next.models) ? structuredClone(next.models) : {};
		const rawProviders = isRecord(rawModels.providers) ? { ...rawModels.providers } : {};
		const rawGoogle = isRecord(rawProviders.google) ? { ...rawProviders.google } : {};
		if (!(rawGoogle.apiKey !== void 0) && legacyApiKey) {
			rawGoogle.apiKey = legacyApiKey;
			rawProviders.google = rawGoogle;
			rawModels.providers = rawProviders;
			next = {
				...next,
				models: rawModels
			};
			changes.push(`Moved skills.entries.${NANO_BANANA_SKILL_KEY}.${legacyEnvApiKey ? "env.GEMINI_API_KEY" : "apiKey"} → models.providers.google.apiKey.`);
		}
		const entries = { ...rawEntries };
		delete entries[NANO_BANANA_SKILL_KEY];
		if (Object.keys(entries).length === 0) {
			delete skills.entries;
			changes.push(`Removed legacy skills.entries.${NANO_BANANA_SKILL_KEY}.`);
		} else {
			skills.entries = entries;
			changes.push(`Removed legacy skills.entries.${NANO_BANANA_SKILL_KEY}.`);
		}
		skillsChanged = true;
		if (Object.keys(skills).length === 0) {
			const { skills: _ignored, ...rest } = next;
			next = rest;
			return;
		}
		if (skillsChanged) next = {
			...next,
			skills
		};
	};
	const normalizeLegacyTalkConfig = () => {
		const rawTalk = next.talk;
		if (!isRecord(rawTalk)) return;
		const normalizedTalk = normalizeTalkSection(rawTalk);
		if (!normalizedTalk) return;
		if (JSON.stringify(normalizedTalk) === JSON.stringify(rawTalk)) return;
		const hasProviderShape = typeof rawTalk.provider === "string" || isRecord(rawTalk.providers);
		next = {
			...next,
			talk: normalizedTalk
		};
		if (hasProviderShape) {
			changes.push("Normalized talk.provider/providers shape (trimmed provider ids and merged missing compatibility fields).");
			return;
		}
		changes.push(`Moved legacy talk flat fields → talk.provider/talk.providers.${DEFAULT_TALK_PROVIDER}.`);
	};
	const normalizeLegacyCrossContextMessageConfig = () => {
		const rawTools = next.tools;
		if (!isRecord(rawTools)) return;
		const rawMessage = rawTools.message;
		if (!isRecord(rawMessage) || !("allowCrossContextSend" in rawMessage)) return;
		const legacyAllowCrossContextSend = rawMessage.allowCrossContextSend;
		if (typeof legacyAllowCrossContextSend !== "boolean") return;
		const nextMessage = { ...rawMessage };
		delete nextMessage.allowCrossContextSend;
		if (legacyAllowCrossContextSend) {
			const rawCrossContext = isRecord(nextMessage.crossContext) ? structuredClone(nextMessage.crossContext) : {};
			rawCrossContext.allowWithinProvider = true;
			rawCrossContext.allowAcrossProviders = true;
			nextMessage.crossContext = rawCrossContext;
			changes.push("Moved tools.message.allowCrossContextSend → tools.message.crossContext.allowWithinProvider/allowAcrossProviders (true).");
		} else changes.push("Removed tools.message.allowCrossContextSend=false (default cross-context policy already matches canonical settings).");
		next = {
			...next,
			tools: {
				...next.tools,
				message: nextMessage
			}
		};
	};
	const mapDeepgramCompatToProviderOptions = (rawCompat) => {
		const providerOptions = {};
		if (typeof rawCompat.detectLanguage === "boolean") providerOptions.detect_language = rawCompat.detectLanguage;
		if (typeof rawCompat.punctuate === "boolean") providerOptions.punctuate = rawCompat.punctuate;
		if (typeof rawCompat.smartFormat === "boolean") providerOptions.smart_format = rawCompat.smartFormat;
		return providerOptions;
	};
	const migrateLegacyDeepgramCompat = (params) => {
		const rawCompat = isRecord(params.owner.deepgram) ? structuredClone(params.owner.deepgram) : null;
		if (!rawCompat) return false;
		const compatProviderOptions = mapDeepgramCompatToProviderOptions(rawCompat);
		const currentProviderOptions = isRecord(params.owner.providerOptions) ? structuredClone(params.owner.providerOptions) : {};
		const currentDeepgram = isRecord(currentProviderOptions.deepgram) ? structuredClone(currentProviderOptions.deepgram) : {};
		const mergedDeepgram = {
			...compatProviderOptions,
			...currentDeepgram
		};
		delete params.owner.deepgram;
		currentProviderOptions.deepgram = mergedDeepgram;
		params.owner.providerOptions = currentProviderOptions;
		const hadCanonicalDeepgram = Object.keys(currentDeepgram).length > 0;
		changes.push(hadCanonicalDeepgram ? `Merged ${params.pathPrefix}.deepgram → ${params.pathPrefix}.providerOptions.deepgram (filled missing canonical fields from legacy).` : `Moved ${params.pathPrefix}.deepgram → ${params.pathPrefix}.providerOptions.deepgram.`);
		return true;
	};
	const normalizeLegacyMediaProviderOptions = () => {
		const rawTools = next.tools;
		if (!isRecord(rawTools)) return;
		const rawMedia = rawTools.media;
		if (!isRecord(rawMedia)) return;
		let mediaChanged = false;
		const nextMedia = structuredClone(rawMedia);
		const migrateModelList = (models, pathPrefix) => {
			if (!Array.isArray(models)) return false;
			let changed = false;
			for (const [index, entry] of models.entries()) {
				if (!isRecord(entry)) continue;
				if (migrateLegacyDeepgramCompat({
					owner: entry,
					pathPrefix: `${pathPrefix}[${index}]`
				})) changed = true;
			}
			return changed;
		};
		for (const capability of [
			"audio",
			"image",
			"video"
		]) {
			const config = isRecord(nextMedia[capability]) ? structuredClone(nextMedia[capability]) : null;
			if (!config) continue;
			let configChanged = false;
			if (migrateLegacyDeepgramCompat({
				owner: config,
				pathPrefix: `tools.media.${capability}`
			})) configChanged = true;
			if (migrateModelList(config.models, `tools.media.${capability}.models`)) configChanged = true;
			if (configChanged) {
				nextMedia[capability] = config;
				mediaChanged = true;
			}
		}
		if (migrateModelList(nextMedia.models, "tools.media.models")) mediaChanged = true;
		if (!mediaChanged) return;
		next = {
			...next,
			tools: {
				...next.tools,
				media: nextMedia
			}
		};
	};
	const normalizeLegacyMistralModelMaxTokens = () => {
		const rawProviders = next.models?.providers;
		if (!isRecord(rawProviders)) return;
		let providersChanged = false;
		const nextProviders = { ...rawProviders };
		for (const [providerId, rawProvider] of Object.entries(rawProviders)) {
			if (normalizeProviderId(providerId) !== "mistral" || !isRecord(rawProvider)) continue;
			const rawModels = rawProvider.models;
			if (!Array.isArray(rawModels)) continue;
			let modelsChanged = false;
			const nextModels = rawModels.map((model, index) => {
				if (!isRecord(model)) return model;
				const modelId = typeof model.id === "string" ? model.id.trim() : "";
				const contextWindow = typeof model.contextWindow === "number" && Number.isFinite(model.contextWindow) ? model.contextWindow : null;
				const maxTokens = typeof model.maxTokens === "number" && Number.isFinite(model.maxTokens) ? model.maxTokens : null;
				if (!modelId || contextWindow === null || maxTokens === null) return model;
				const normalizedMaxTokens = resolveNormalizedProviderModelMaxTokens({
					providerId,
					modelId,
					contextWindow,
					rawMaxTokens: maxTokens
				});
				if (normalizedMaxTokens === maxTokens) return model;
				modelsChanged = true;
				changes.push(`Normalized models.providers.${providerId}.models[${index}].maxTokens (${maxTokens} → ${normalizedMaxTokens}) to avoid Mistral context-window rejects.`);
				return {
					...model,
					maxTokens: normalizedMaxTokens
				};
			});
			if (!modelsChanged) continue;
			nextProviders[providerId] = {
				...rawProvider,
				models: nextModels
			};
			providersChanged = true;
		}
		if (!providersChanged) return;
		next = {
			...next,
			models: {
				...next.models,
				providers: nextProviders
			}
		};
	};
	normalizeBrowserSsrFPolicyAlias();
	normalizeLegacyNanoBananaSkill();
	normalizeLegacyTalkConfig();
	normalizeLegacyCrossContextMessageConfig();
	normalizeLegacyMediaProviderOptions();
	normalizeLegacyMistralModelMaxTokens();
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
//#region src/commands/doctor/emit-notes.ts
function emitDoctorNotes(params) {
	for (const change of params.changeNotes ?? []) params.note(change, "Doctor changes");
	for (const warning of params.warningNotes ?? []) params.note(warning, "Doctor warnings");
}
//#endregion
//#region src/commands/doctor/finalize-config-flow.ts
async function finalizeDoctorConfigFlow(params) {
	if (!params.shouldRepair && params.pendingChanges) {
		if (await params.confirm({
			message: "Apply recommended config repairs now?",
			initialValue: true
		})) return {
			cfg: params.candidate,
			shouldWriteConfig: true
		};
		if (params.fixHints.length > 0) params.note(params.fixHints.join("\n"), "Doctor");
		return {
			cfg: params.cfg,
			shouldWriteConfig: false
		};
	}
	if (params.shouldRepair && params.pendingChanges) return {
		cfg: params.cfg,
		shouldWriteConfig: true
	};
	return {
		cfg: params.cfg,
		shouldWriteConfig: false
	};
}
//#endregion
//#region src/commands/doctor/providers/matrix.ts
function formatMatrixLegacyStatePreview(detection) {
	return [
		"- Matrix plugin upgraded in place.",
		`- Legacy sync store: ${detection.legacyStoragePath} -> ${detection.targetStoragePath}`,
		`- Legacy crypto store: ${detection.legacyCryptoPath} -> ${detection.targetCryptoPath}`,
		...detection.selectionNote ? [`- ${detection.selectionNote}`] : [],
		"- Run \"openclaw doctor --fix\" to migrate this Matrix state now."
	].join("\n");
}
function formatMatrixLegacyCryptoPreview(detection) {
	const notes = [];
	for (const warning of detection.warnings) notes.push(`- ${warning}`);
	for (const plan of detection.plans) notes.push([
		`- Matrix encrypted-state migration is pending for account "${plan.accountId}".`,
		`- Legacy crypto store: ${plan.legacyCryptoPath}`,
		`- New recovery key file: ${plan.recoveryKeyPath}`,
		`- Migration state file: ${plan.statePath}`,
		"- Run \"openclaw doctor --fix\" to extract any saved backup key now. Backed-up room keys will restore automatically on next gateway start."
	].join("\n"));
	return notes;
}
async function collectMatrixInstallPathWarnings(cfg) {
	const issue = await detectPluginInstallPathIssue({
		pluginId: "matrix",
		install: cfg.plugins?.installs?.matrix
	});
	if (!issue) return [];
	return formatPluginInstallPathIssue({
		issue,
		pluginLabel: "Matrix",
		defaultInstallCommand: "openclaw plugins install @openclaw/matrix",
		repoInstallCommand: "openclaw plugins install ./extensions/matrix",
		formatCommand: formatCliCommand
	}).map((entry) => `- ${entry}`);
}
async function applyMatrixDoctorRepair(params) {
	const changes = [];
	const warnings = [];
	const pendingMatrixMigration = hasPendingMatrixMigration({
		cfg: params.cfg,
		env: params.env
	});
	const actionableMatrixMigration = hasActionableMatrixMigration({
		cfg: params.cfg,
		env: params.env
	});
	let matrixSnapshotReady = true;
	if (actionableMatrixMigration) try {
		const snapshot = await maybeCreateMatrixMigrationSnapshot({
			trigger: "doctor-fix",
			env: params.env
		});
		changes.push(`Matrix migration snapshot ${snapshot.created ? "created" : "reused"} before applying Matrix upgrades.\n- ${snapshot.archivePath}`);
	} catch (err) {
		matrixSnapshotReady = false;
		warnings.push(`- Failed creating a Matrix migration snapshot before repair: ${String(err)}`);
		warnings.push("- Skipping Matrix migration changes for now. Resolve the snapshot failure, then rerun \"openclaw doctor --fix\".");
	}
	else if (pendingMatrixMigration) warnings.push("- Matrix migration warnings are present, but no on-disk Matrix mutation is actionable yet. No pre-migration snapshot was needed.");
	if (!matrixSnapshotReady) return {
		changes,
		warnings
	};
	const matrixStateRepair = await autoMigrateLegacyMatrixState({
		cfg: params.cfg,
		env: params.env
	});
	if (matrixStateRepair.changes.length > 0) changes.push([
		"Matrix plugin upgraded in place.",
		...matrixStateRepair.changes.map((entry) => `- ${entry}`),
		"- No user action required."
	].join("\n"));
	if (matrixStateRepair.warnings.length > 0) warnings.push(matrixStateRepair.warnings.map((entry) => `- ${entry}`).join("\n"));
	const matrixCryptoRepair = await autoPrepareLegacyMatrixCrypto({
		cfg: params.cfg,
		env: params.env
	});
	if (matrixCryptoRepair.changes.length > 0) changes.push(["Matrix encrypted-state migration prepared.", ...matrixCryptoRepair.changes.map((entry) => `- ${entry}`)].join("\n"));
	if (matrixCryptoRepair.warnings.length > 0) warnings.push(matrixCryptoRepair.warnings.map((entry) => `- ${entry}`).join("\n"));
	return {
		changes,
		warnings
	};
}
async function runMatrixDoctorSequence(params) {
	const matrixLegacyState = detectLegacyMatrixState({
		cfg: params.cfg,
		env: params.env
	});
	const matrixLegacyCrypto = detectLegacyMatrixCrypto({
		cfg: params.cfg,
		env: params.env
	});
	const warningNotes = [];
	const changeNotes = [];
	if (params.shouldRepair) {
		const matrixRepair = await applyMatrixDoctorRepair({
			cfg: params.cfg,
			env: params.env
		});
		changeNotes.push(...matrixRepair.changes);
		warningNotes.push(...matrixRepair.warnings);
	} else if (matrixLegacyState) if ("warning" in matrixLegacyState) warningNotes.push(`- ${matrixLegacyState.warning}`);
	else warningNotes.push(formatMatrixLegacyStatePreview(matrixLegacyState));
	if (!params.shouldRepair && (matrixLegacyCrypto.warnings.length > 0 || matrixLegacyCrypto.plans.length > 0)) warningNotes.push(...formatMatrixLegacyCryptoPreview(matrixLegacyCrypto));
	const matrixInstallWarnings = await collectMatrixInstallPathWarnings(params.cfg);
	if (matrixInstallWarnings.length > 0) warningNotes.push(matrixInstallWarnings.join("\n"));
	return {
		changeNotes,
		warningNotes
	};
}
//#endregion
//#region src/commands/doctor/shared/object.ts
function asObjectRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
//#endregion
//#region src/commands/doctor/providers/discord.ts
function collectDiscordAccountScopes(cfg) {
	const scopes = [];
	const discord = asObjectRecord(cfg.channels?.discord);
	if (!discord) return scopes;
	scopes.push({
		prefix: "channels.discord",
		account: discord
	});
	const accounts = asObjectRecord(discord.accounts);
	if (!accounts) return scopes;
	for (const key of Object.keys(accounts)) {
		const account = asObjectRecord(accounts[key]);
		if (!account) continue;
		scopes.push({
			prefix: `channels.discord.accounts.${key}`,
			account
		});
	}
	return scopes;
}
function collectDiscordIdLists(prefix, account) {
	const refs = [{
		pathLabel: `${prefix}.allowFrom`,
		holder: account,
		key: "allowFrom"
	}];
	const dm = asObjectRecord(account.dm);
	if (dm) {
		refs.push({
			pathLabel: `${prefix}.dm.allowFrom`,
			holder: dm,
			key: "allowFrom"
		});
		refs.push({
			pathLabel: `${prefix}.dm.groupChannels`,
			holder: dm,
			key: "groupChannels"
		});
	}
	const execApprovals = asObjectRecord(account.execApprovals);
	if (execApprovals) refs.push({
		pathLabel: `${prefix}.execApprovals.approvers`,
		holder: execApprovals,
		key: "approvers"
	});
	const guilds = asObjectRecord(account.guilds);
	if (!guilds) return refs;
	for (const guildId of Object.keys(guilds)) {
		const guild = asObjectRecord(guilds[guildId]);
		if (!guild) continue;
		refs.push({
			pathLabel: `${prefix}.guilds.${guildId}.users`,
			holder: guild,
			key: "users"
		});
		refs.push({
			pathLabel: `${prefix}.guilds.${guildId}.roles`,
			holder: guild,
			key: "roles"
		});
		const channels = asObjectRecord(guild.channels);
		if (!channels) continue;
		for (const channelId of Object.keys(channels)) {
			const channel = asObjectRecord(channels[channelId]);
			if (!channel) continue;
			refs.push({
				pathLabel: `${prefix}.guilds.${guildId}.channels.${channelId}.users`,
				holder: channel,
				key: "users"
			});
			refs.push({
				pathLabel: `${prefix}.guilds.${guildId}.channels.${channelId}.roles`,
				holder: channel,
				key: "roles"
			});
		}
	}
	return refs;
}
function scanDiscordNumericIdEntries(cfg) {
	const hits = [];
	const scanList = (pathLabel, list) => {
		if (!Array.isArray(list)) return;
		for (const [index, entry] of list.entries()) {
			if (typeof entry !== "number") continue;
			hits.push({
				path: `${pathLabel}[${index}]`,
				entry
			});
		}
	};
	for (const scope of collectDiscordAccountScopes(cfg)) for (const ref of collectDiscordIdLists(scope.prefix, scope.account)) scanList(ref.pathLabel, ref.holder[ref.key]);
	return hits;
}
function collectDiscordNumericIdWarnings(params) {
	if (params.hits.length === 0) return [];
	const samplePath = sanitizeForLog(params.hits[0]?.path ?? "channels.discord.allowFrom");
	const sampleEntry = sanitizeForLog(String(params.hits[0]?.entry ?? ""));
	return [`- Discord allowlists contain ${params.hits.length} numeric entries (e.g. ${samplePath}=${sampleEntry}).`, `- Discord IDs must be strings; run "${params.doctorFixCommand}" to convert numeric IDs to quoted strings.`];
}
function maybeRepairDiscordNumericIds(cfg) {
	if (scanDiscordNumericIdEntries(cfg).length === 0) return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const changes = [];
	const repairList = (pathLabel, holder, key) => {
		const raw = holder[key];
		if (!Array.isArray(raw)) return;
		let converted = 0;
		const updated = raw.map((entry) => {
			if (typeof entry === "number") {
				converted += 1;
				return String(entry);
			}
			return entry;
		});
		if (converted === 0) return;
		holder[key] = updated;
		changes.push(`- ${pathLabel}: converted ${converted} numeric ${converted === 1 ? "entry" : "entries"} to strings`);
	};
	for (const scope of collectDiscordAccountScopes(next)) for (const ref of collectDiscordIdLists(scope.prefix, scope.account)) repairList(ref.pathLabel, ref.holder, ref.key);
	if (changes.length === 0) return {
		config: cfg,
		changes: []
	};
	return {
		config: next,
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/allowlist.ts
function hasAllowFromEntries(list) {
	return Array.isArray(list) && list.map((v) => String(v).trim()).filter(Boolean).length > 0;
}
//#endregion
//#region src/commands/doctor/providers/telegram.ts
function collectTelegramAccountScopes(cfg) {
	const scopes = [];
	const telegram = asObjectRecord(cfg.channels?.telegram);
	if (!telegram) return scopes;
	scopes.push({
		prefix: "channels.telegram",
		account: telegram
	});
	const accounts = asObjectRecord(telegram.accounts);
	if (!accounts) return scopes;
	for (const key of Object.keys(accounts)) {
		const account = asObjectRecord(accounts[key]);
		if (!account) continue;
		scopes.push({
			prefix: `channels.telegram.accounts.${key}`,
			account
		});
	}
	return scopes;
}
function collectTelegramAllowFromLists(prefix, account) {
	const refs = [{
		pathLabel: `${prefix}.allowFrom`,
		holder: account,
		key: "allowFrom"
	}, {
		pathLabel: `${prefix}.groupAllowFrom`,
		holder: account,
		key: "groupAllowFrom"
	}];
	const groups = asObjectRecord(account.groups);
	if (!groups) return refs;
	for (const groupId of Object.keys(groups)) {
		const group = asObjectRecord(groups[groupId]);
		if (!group) continue;
		refs.push({
			pathLabel: `${prefix}.groups.${groupId}.allowFrom`,
			holder: group,
			key: "allowFrom"
		});
		const topics = asObjectRecord(group.topics);
		if (!topics) continue;
		for (const topicId of Object.keys(topics)) {
			const topic = asObjectRecord(topics[topicId]);
			if (!topic) continue;
			refs.push({
				pathLabel: `${prefix}.groups.${groupId}.topics.${topicId}.allowFrom`,
				holder: topic,
				key: "allowFrom"
			});
		}
	}
	return refs;
}
function scanTelegramAllowFromUsernameEntries(cfg) {
	const hits = [];
	const scanList = (pathLabel, list) => {
		if (!Array.isArray(list)) return;
		for (const entry of list) {
			const normalized = normalizeTelegramAllowFromEntry(entry);
			if (!normalized || normalized === "*") continue;
			if (isNumericTelegramUserId(normalized)) continue;
			hits.push({
				path: pathLabel,
				entry: String(entry).trim()
			});
		}
	};
	for (const scope of collectTelegramAccountScopes(cfg)) for (const ref of collectTelegramAllowFromLists(scope.prefix, scope.account)) scanList(ref.pathLabel, ref.holder[ref.key]);
	return hits;
}
function collectTelegramAllowFromUsernameWarnings(params) {
	if (params.hits.length === 0) return [];
	const sampleEntry = sanitizeForLog(params.hits[0]?.entry ?? "@");
	return [`- Telegram allowFrom contains ${params.hits.length} non-numeric entries (e.g. ${sampleEntry}); Telegram authorization requires numeric sender IDs.`, `- Run "${params.doctorFixCommand}" to auto-resolve @username entries to numeric IDs (requires a Telegram bot token).`];
}
async function maybeRepairTelegramAllowFromUsernames(cfg) {
	if (scanTelegramAllowFromUsernameEntries(cfg).length === 0) return {
		config: cfg,
		changes: []
	};
	const { resolvedConfig } = await resolveCommandSecretRefsViaGateway({
		config: cfg,
		commandName: "doctor --fix",
		targetIds: getChannelsCommandSecretTargetIds(),
		mode: "read_only_status"
	});
	const hasConfiguredUnavailableToken = listTelegramAccountIds(cfg).some((accountId) => {
		const inspected = inspectTelegramAccount({
			cfg,
			accountId
		});
		return inspected.enabled && inspected.tokenStatus === "configured_unavailable";
	});
	const tokenResolutionWarnings = [];
	const lookupAccounts = [];
	const seenLookupAccounts = /* @__PURE__ */ new Set();
	for (const accountId of listTelegramAccountIds(resolvedConfig)) {
		let account;
		try {
			account = resolveTelegramAccount({
				cfg: resolvedConfig,
				accountId
			});
		} catch (error) {
			tokenResolutionWarnings.push(`- Telegram account ${accountId}: failed to inspect bot token (${describeUnknownError(error)}).`);
			continue;
		}
		const token = account.tokenSource === "none" ? "" : account.token.trim();
		if (!token) continue;
		const network = account.config.network;
		const cacheKey = `${token}::${JSON.stringify(network ?? {})}`;
		if (seenLookupAccounts.has(cacheKey)) continue;
		seenLookupAccounts.add(cacheKey);
		lookupAccounts.push({
			token,
			network
		});
	}
	if (lookupAccounts.length === 0) return {
		config: cfg,
		changes: [...tokenResolutionWarnings, hasConfiguredUnavailableToken ? `- Telegram allowFrom contains @username entries, but configured Telegram bot credentials are unavailable in this command path; cannot auto-resolve (start the gateway or make the secret source available, then rerun doctor --fix).` : `- Telegram allowFrom contains @username entries, but no Telegram bot token is configured; cannot auto-resolve (run setup or replace with numeric sender IDs).`]
	};
	const resolveUserId = async (raw) => {
		const trimmed = raw.trim();
		if (!trimmed) return null;
		const stripped = normalizeTelegramAllowFromEntry(trimmed);
		if (!stripped || stripped === "*") return null;
		if (isNumericTelegramUserId(stripped)) return stripped;
		if (/\s/.test(stripped)) return null;
		const username = stripped.startsWith("@") ? stripped : `@${stripped}`;
		for (const account of lookupAccounts) {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 4e3);
			try {
				const id = await lookupTelegramChatId({
					token: account.token,
					chatId: username,
					signal: controller.signal,
					network: account.network
				});
				if (id) return id;
			} catch {} finally {
				clearTimeout(timeout);
			}
		}
		return null;
	};
	const changes = [];
	const next = structuredClone(cfg);
	const repairList = async (pathLabel, holder, key) => {
		const raw = holder[key];
		if (!Array.isArray(raw)) return;
		const out = [];
		const replaced = [];
		for (const entry of raw) {
			const normalized = normalizeTelegramAllowFromEntry(entry);
			if (!normalized) continue;
			if (normalized === "*") {
				out.push("*");
				continue;
			}
			if (isNumericTelegramUserId(normalized)) {
				out.push(normalized);
				continue;
			}
			const resolved = await resolveUserId(String(entry));
			if (resolved) {
				out.push(resolved);
				replaced.push({
					from: String(entry).trim(),
					to: resolved
				});
			} else out.push(String(entry).trim());
		}
		const deduped = [];
		const seen = /* @__PURE__ */ new Set();
		for (const entry of out) {
			const keyValue = String(entry).trim();
			if (!keyValue || seen.has(keyValue)) continue;
			seen.add(keyValue);
			deduped.push(entry);
		}
		holder[key] = deduped;
		if (replaced.length > 0) {
			for (const rep of replaced.slice(0, 5)) changes.push(`- ${sanitizeForLog(pathLabel)}: resolved ${sanitizeForLog(rep.from)} -> ${sanitizeForLog(rep.to)}`);
			if (replaced.length > 5) changes.push(`- ${sanitizeForLog(pathLabel)}: resolved ${replaced.length - 5} more @username entries`);
		}
	};
	for (const scope of collectTelegramAccountScopes(next)) for (const ref of collectTelegramAllowFromLists(scope.prefix, scope.account)) await repairList(ref.pathLabel, ref.holder, ref.key);
	if (changes.length === 0) return {
		config: cfg,
		changes: []
	};
	return {
		config: next,
		changes
	};
}
function hasConfiguredGroups(account, parent) {
	const groups = account.groups ?? parent?.groups;
	return Boolean(groups) && Object.keys(groups ?? {}).length > 0;
}
function collectTelegramGroupPolicyWarnings(params) {
	if (!hasConfiguredGroups(params.account, params.parent)) {
		const effectiveDmPolicy = params.dmPolicy ?? "pairing";
		const dmSetupLine = effectiveDmPolicy === "pairing" ? "DMs use pairing mode, so new senders must start a chat and be approved before regular messages are accepted." : effectiveDmPolicy === "allowlist" ? `DMs use allowlist mode, so only sender IDs in ${params.prefix}.allowFrom are accepted.` : effectiveDmPolicy === "open" ? "DMs are open." : "DMs are disabled.";
		return [`- ${params.prefix}: Telegram is in first-time setup mode. ${dmSetupLine} Group messages stay blocked until you add allowed chats under ${params.prefix}.groups (and optional sender IDs under ${params.prefix}.groupAllowFrom), or set ${params.prefix}.groupPolicy to "open" if you want broad group access.`];
	}
	const rawGroupAllowFrom = params.account.groupAllowFrom ?? params.parent?.groupAllowFrom;
	if (hasAllowFromEntries((hasAllowFromEntries(rawGroupAllowFrom) ? rawGroupAllowFrom : void 0) ?? params.effectiveAllowFrom)) return [];
	return [`- ${params.prefix}.groupPolicy is "allowlist" but groupAllowFrom (and allowFrom) is empty — all group messages will be silently dropped. Add sender IDs to ${params.prefix}.groupAllowFrom or ${params.prefix}.allowFrom, or set ${params.prefix}.groupPolicy to "open".`];
}
function collectTelegramEmptyAllowlistExtraWarnings(params) {
	return params.channelName === "telegram" && (params.account.groupPolicy ?? params.parent?.groupPolicy ?? void 0) === "allowlist" ? collectTelegramGroupPolicyWarnings({
		account: params.account,
		dmPolicy: params.dmPolicy,
		effectiveAllowFrom: params.effectiveAllowFrom,
		parent: params.parent,
		prefix: params.prefix
	}) : [];
}
//#endregion
//#region src/commands/doctor/channel-capabilities.ts
const DEFAULT_DOCTOR_CHANNEL_CAPABILITIES = {
	dmAllowFromMode: "topOnly",
	groupModel: "sender",
	groupAllowFromFallbackToAllowFrom: true,
	warnOnEmptyGroupSenderAllowlist: true
};
const DOCTOR_CHANNEL_CAPABILITIES = {
	discord: {
		dmAllowFromMode: "topOrNested",
		groupModel: "route",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: false
	},
	googlechat: {
		dmAllowFromMode: "nestedOnly",
		groupModel: "route",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: false
	},
	imessage: {
		dmAllowFromMode: "topOnly",
		groupModel: "sender",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: true
	},
	irc: {
		dmAllowFromMode: "topOnly",
		groupModel: "sender",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: true
	},
	matrix: {
		dmAllowFromMode: "nestedOnly",
		groupModel: "sender",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: true
	},
	msteams: {
		dmAllowFromMode: "topOnly",
		groupModel: "hybrid",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: true
	},
	slack: {
		dmAllowFromMode: "topOrNested",
		groupModel: "route",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: false
	},
	zalouser: {
		dmAllowFromMode: "topOnly",
		groupModel: "hybrid",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: false
	}
};
function getDoctorChannelCapabilities(channelName) {
	if (!channelName) return DEFAULT_DOCTOR_CHANNEL_CAPABILITIES;
	return DOCTOR_CHANNEL_CAPABILITIES[channelName] ?? DEFAULT_DOCTOR_CHANNEL_CAPABILITIES;
}
//#endregion
//#region src/commands/doctor/shared/allow-from-mode.ts
function resolveAllowFromMode(channelName) {
	return getDoctorChannelCapabilities(channelName).dmAllowFromMode;
}
//#endregion
//#region src/commands/doctor/shared/allowlist-policy-repair.ts
async function maybeRepairAllowlistPolicyAllowFrom(cfg) {
	const channels = cfg.channels;
	if (!channels || typeof channels !== "object") return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const changes = [];
	const applyRecoveredAllowFrom = (params) => {
		const count = params.allowFrom.length;
		const noun = count === 1 ? "entry" : "entries";
		if (params.mode === "nestedOnly") {
			const dmEntry = params.account.dm;
			const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : {};
			dm.allowFrom = params.allowFrom;
			params.account.dm = dm;
			changes.push(`- ${params.prefix}.dm.allowFrom: restored ${count} sender ${noun} from pairing store (dmPolicy="allowlist").`);
			return;
		}
		if (params.mode === "topOrNested") {
			const dmEntry = params.account.dm;
			const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : void 0;
			const nestedAllowFrom = dm?.allowFrom;
			if (dm && !Array.isArray(params.account.allowFrom) && Array.isArray(nestedAllowFrom)) {
				dm.allowFrom = params.allowFrom;
				changes.push(`- ${params.prefix}.dm.allowFrom: restored ${count} sender ${noun} from pairing store (dmPolicy="allowlist").`);
				return;
			}
		}
		params.account.allowFrom = params.allowFrom;
		changes.push(`- ${params.prefix}.allowFrom: restored ${count} sender ${noun} from pairing store (dmPolicy="allowlist").`);
	};
	const recoverAllowFromForAccount = async (params) => {
		const dmEntry = params.account.dm;
		const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : void 0;
		if ((params.account.dmPolicy ?? dm?.policy) !== "allowlist") return;
		const topAllowFrom = params.account.allowFrom;
		const nestedAllowFrom = dm?.allowFrom;
		if (hasAllowFromEntries(topAllowFrom) || hasAllowFromEntries(nestedAllowFrom)) return;
		const normalizedChannelId = (normalizeChatChannelId(params.channelName) ?? params.channelName).trim().toLowerCase();
		if (!normalizedChannelId) return;
		const normalizedAccountId = normalizeAccountId(params.accountId) || "default";
		const fromStore = await readChannelAllowFromStore(normalizedChannelId, process.env, normalizedAccountId).catch(() => []);
		const recovered = Array.from(new Set(fromStore.map((entry) => String(entry).trim()))).filter(Boolean);
		if (recovered.length === 0) return;
		applyRecoveredAllowFrom({
			account: params.account,
			allowFrom: recovered,
			mode: resolveAllowFromMode(params.channelName),
			prefix: params.prefix
		});
	};
	const nextChannels = next.channels;
	for (const [channelName, channelConfig] of Object.entries(nextChannels)) {
		if (!channelConfig || typeof channelConfig !== "object") continue;
		await recoverAllowFromForAccount({
			channelName,
			account: channelConfig,
			prefix: `channels.${channelName}`
		});
		const accounts = asObjectRecord(channelConfig.accounts);
		if (!accounts) continue;
		for (const [accountId, accountConfig] of Object.entries(accounts)) {
			if (!accountConfig || typeof accountConfig !== "object") continue;
			await recoverAllowFromForAccount({
				channelName,
				account: accountConfig,
				accountId,
				prefix: `channels.${channelName}.accounts.${accountId}`
			});
		}
	}
	if (changes.length === 0) return {
		config: cfg,
		changes: []
	};
	return {
		config: next,
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/config-mutation-state.ts
function applyDoctorConfigMutation(params) {
	if (params.mutation.changes.length === 0) return params.state;
	return {
		cfg: params.shouldRepair ? params.mutation.config : params.state.cfg,
		candidate: params.mutation.config,
		pendingChanges: true,
		fixHints: !params.shouldRepair && params.fixHint ? [...params.state.fixHints, params.fixHint] : params.state.fixHints
	};
}
//#endregion
//#region src/commands/doctor/shared/empty-allowlist-policy.ts
function usesSenderBasedGroupAllowlist(channelName) {
	return getDoctorChannelCapabilities(channelName).warnOnEmptyGroupSenderAllowlist;
}
function allowsGroupAllowFromFallback(channelName) {
	return getDoctorChannelCapabilities(channelName).groupAllowFromFallbackToAllowFrom;
}
function collectEmptyAllowlistPolicyWarningsForAccount(params) {
	const warnings = [];
	const dmEntry = params.account.dm;
	const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : void 0;
	const parentDmEntry = params.parent?.dm;
	const parentDm = parentDmEntry && typeof parentDmEntry === "object" && !Array.isArray(parentDmEntry) ? parentDmEntry : void 0;
	const dmPolicy = params.account.dmPolicy ?? dm?.policy ?? params.parent?.dmPolicy ?? parentDm?.policy ?? void 0;
	const topAllowFrom = params.account.allowFrom ?? params.parent?.allowFrom;
	const nestedAllowFrom = dm?.allowFrom;
	const parentNestedAllowFrom = parentDm?.allowFrom;
	const effectiveAllowFrom = topAllowFrom ?? nestedAllowFrom ?? parentNestedAllowFrom;
	if (dmPolicy === "allowlist" && !hasAllowFromEntries(effectiveAllowFrom)) warnings.push(`- ${params.prefix}.dmPolicy is "allowlist" but allowFrom is empty — all DMs will be blocked. Add sender IDs to ${params.prefix}.allowFrom, or run "${params.doctorFixCommand}" to auto-migrate from pairing store when entries exist.`);
	if ((params.account.groupPolicy ?? params.parent?.groupPolicy ?? void 0) !== "allowlist" || !usesSenderBasedGroupAllowlist(params.channelName)) return warnings;
	if (params.channelName === "telegram") return warnings;
	const rawGroupAllowFrom = params.account.groupAllowFrom ?? params.parent?.groupAllowFrom;
	const groupAllowFrom = hasAllowFromEntries(rawGroupAllowFrom) ? rawGroupAllowFrom : void 0;
	const fallbackToAllowFrom = allowsGroupAllowFromFallback(params.channelName);
	if (hasAllowFromEntries(groupAllowFrom ?? (fallbackToAllowFrom ? effectiveAllowFrom : void 0))) return warnings;
	if (fallbackToAllowFrom) warnings.push(`- ${params.prefix}.groupPolicy is "allowlist" but groupAllowFrom (and allowFrom) is empty — all group messages will be silently dropped. Add sender IDs to ${params.prefix}.groupAllowFrom or ${params.prefix}.allowFrom, or set groupPolicy to "open".`);
	else warnings.push(`- ${params.prefix}.groupPolicy is "allowlist" but groupAllowFrom is empty — this channel does not fall back to allowFrom, so all group messages will be silently dropped. Add sender IDs to ${params.prefix}.groupAllowFrom, or set groupPolicy to "open".`);
	return warnings;
}
//#endregion
//#region src/commands/doctor/shared/empty-allowlist-scan.ts
function scanEmptyAllowlistPolicyWarnings(cfg, params) {
	const channels = cfg.channels;
	if (!channels || typeof channels !== "object") return [];
	const warnings = [];
	const checkAccount = (account, prefix, channelName, parent) => {
		const accountDm = asObjectRecord(account.dm);
		const parentDm = asObjectRecord(parent?.dm);
		const dmPolicy = account.dmPolicy ?? accountDm?.policy ?? parent?.dmPolicy ?? parentDm?.policy ?? void 0;
		const effectiveAllowFrom = account.allowFrom ?? parent?.allowFrom ?? accountDm?.allowFrom ?? parentDm?.allowFrom ?? void 0;
		warnings.push(...collectEmptyAllowlistPolicyWarningsForAccount({
			account,
			channelName,
			doctorFixCommand: params.doctorFixCommand,
			parent,
			prefix
		}));
		if (params.extraWarningsForAccount) warnings.push(...params.extraWarningsForAccount({
			account,
			channelName,
			dmPolicy,
			effectiveAllowFrom,
			parent,
			prefix
		}));
	};
	for (const [channelName, channelConfig] of Object.entries(channels)) {
		if (!channelConfig || typeof channelConfig !== "object") continue;
		checkAccount(channelConfig, `channels.${channelName}`, channelName);
		const accounts = asObjectRecord(channelConfig.accounts);
		if (!accounts) continue;
		for (const [accountId, account] of Object.entries(accounts)) {
			if (!account || typeof account !== "object") continue;
			checkAccount(account, `channels.${channelName}.accounts.${accountId}`, channelName, channelConfig);
		}
	}
	return warnings;
}
//#endregion
//#region src/commands/doctor/shared/exec-safe-bins.ts
function normalizeConfiguredSafeBins(entries) {
	if (!Array.isArray(entries)) return [];
	return Array.from(new Set(entries.map((entry) => typeof entry === "string" ? entry.trim().toLowerCase() : "").filter((entry) => entry.length > 0))).toSorted();
}
function normalizeConfiguredTrustedSafeBinDirs(entries) {
	if (!Array.isArray(entries)) return [];
	return normalizeTrustedSafeBinDirs(entries.filter((entry) => typeof entry === "string"));
}
function collectExecSafeBinScopes(cfg) {
	const scopes = [];
	const globalExec = asObjectRecord(cfg.tools?.exec);
	const globalTrustedDirs = normalizeConfiguredTrustedSafeBinDirs(globalExec?.safeBinTrustedDirs);
	if (globalExec) {
		const safeBins = normalizeConfiguredSafeBins(globalExec.safeBins);
		if (safeBins.length > 0) scopes.push({
			scopePath: "tools.exec",
			safeBins,
			exec: globalExec,
			mergedProfiles: resolveMergedSafeBinProfileFixtures({ global: globalExec }) ?? {},
			trustedSafeBinDirs: getTrustedSafeBinDirs({ extraDirs: globalTrustedDirs })
		});
	}
	const agents = Array.isArray(cfg.agents?.list) ? cfg.agents.list : [];
	for (const agent of agents) {
		if (!agent || typeof agent !== "object" || typeof agent.id !== "string") continue;
		const agentExec = asObjectRecord(agent.tools?.exec);
		if (!agentExec) continue;
		const safeBins = normalizeConfiguredSafeBins(agentExec.safeBins);
		if (safeBins.length === 0) continue;
		scopes.push({
			scopePath: `agents.list.${agent.id}.tools.exec`,
			safeBins,
			exec: agentExec,
			mergedProfiles: resolveMergedSafeBinProfileFixtures({
				global: globalExec,
				local: agentExec
			}) ?? {},
			trustedSafeBinDirs: getTrustedSafeBinDirs({ extraDirs: [...globalTrustedDirs, ...normalizeConfiguredTrustedSafeBinDirs(agentExec.safeBinTrustedDirs)] })
		});
	}
	return scopes;
}
function scanExecSafeBinCoverage(cfg) {
	const hits = [];
	for (const scope of collectExecSafeBinScopes(cfg)) {
		const interpreterBins = new Set(listInterpreterLikeSafeBins(scope.safeBins));
		for (const bin of scope.safeBins) {
			if (scope.mergedProfiles[bin]) continue;
			hits.push({
				scopePath: scope.scopePath,
				bin,
				kind: "missingProfile",
				isInterpreter: interpreterBins.has(bin)
			});
		}
		for (const hit of listRiskyConfiguredSafeBins(scope.safeBins)) hits.push({
			scopePath: scope.scopePath,
			bin: hit.bin,
			kind: "riskySemantics",
			warning: hit.warning
		});
	}
	return hits;
}
function scanExecSafeBinTrustedDirHints(cfg) {
	const hits = [];
	for (const scope of collectExecSafeBinScopes(cfg)) for (const bin of scope.safeBins) {
		const resolution = resolveCommandResolutionFromArgv([bin]);
		if (!resolution?.execution.resolvedPath) continue;
		if (isTrustedSafeBinPath({
			resolvedPath: resolution.execution.resolvedPath,
			trustedDirs: scope.trustedSafeBinDirs
		})) continue;
		hits.push({
			scopePath: scope.scopePath,
			bin,
			resolvedPath: resolution.execution.resolvedPath
		});
	}
	return hits;
}
function collectExecSafeBinCoverageWarnings(params) {
	if (params.hits.length === 0) return [];
	const interpreterHits = params.hits.filter((hit) => hit.kind === "missingProfile" && hit.isInterpreter);
	const customHits = params.hits.filter((hit) => hit.kind === "missingProfile" && !hit.isInterpreter);
	const riskyHits = params.hits.filter((hit) => hit.kind === "riskySemantics");
	const lines = [];
	if (interpreterHits.length > 0) {
		for (const hit of interpreterHits.slice(0, 5)) lines.push(`- ${sanitizeForLog(hit.scopePath)}.safeBins includes interpreter/runtime '${sanitizeForLog(hit.bin)}' without profile.`);
		if (interpreterHits.length > 5) lines.push(`- ${interpreterHits.length - 5} more interpreter/runtime safeBins entries are missing profiles.`);
	}
	if (customHits.length > 0) {
		for (const hit of customHits.slice(0, 5)) lines.push(`- ${sanitizeForLog(hit.scopePath)}.safeBins entry '${sanitizeForLog(hit.bin)}' is missing safeBinProfiles.${sanitizeForLog(hit.bin)}.`);
		if (customHits.length > 5) lines.push(`- ${customHits.length - 5} more custom safeBins entries are missing profiles.`);
	}
	if (riskyHits.length > 0) {
		for (const hit of riskyHits.slice(0, 5)) lines.push(`- ${sanitizeForLog(hit.scopePath)}.safeBins includes '${sanitizeForLog(hit.bin)}': ${sanitizeForLog(hit.warning ?? "prefer explicit allowlist entries or approval-gated runs.")}`);
		if (riskyHits.length > 5) lines.push(`- ${riskyHits.length - 5} more safeBins entries should not use the low-risk safeBins fast path.`);
	}
	lines.push(`- Run "${params.doctorFixCommand}" to scaffold missing custom safeBinProfiles entries.`);
	return lines;
}
function collectExecSafeBinTrustedDirHintWarnings(hits) {
	if (hits.length === 0) return [];
	const lines = hits.slice(0, 5).map((hit) => `- ${sanitizeForLog(hit.scopePath)}.safeBins entry '${sanitizeForLog(hit.bin)}' resolves to '${sanitizeForLog(hit.resolvedPath)}' outside trusted safe-bin dirs.`);
	if (hits.length > 5) lines.push(`- ${hits.length - 5} more safeBins entries resolve outside trusted safe-bin dirs.`);
	lines.push("- If intentional, add the binary directory to tools.exec.safeBinTrustedDirs (global or agent scope).");
	return lines;
}
function maybeRepairExecSafeBinProfiles(cfg) {
	const next = structuredClone(cfg);
	const changes = [];
	const warnings = [];
	for (const scope of collectExecSafeBinScopes(next)) {
		const interpreterBins = new Set(listInterpreterLikeSafeBins(scope.safeBins));
		for (const hit of listRiskyConfiguredSafeBins(scope.safeBins)) warnings.push(`- ${scope.scopePath}.safeBins includes '${hit.bin}': ${hit.warning}`);
		const missingBins = scope.safeBins.filter((bin) => !scope.mergedProfiles[bin]);
		if (missingBins.length === 0) continue;
		const profileHolder = asObjectRecord(scope.exec.safeBinProfiles) ?? (scope.exec.safeBinProfiles = {});
		for (const bin of missingBins) {
			if (interpreterBins.has(bin)) {
				warnings.push(`- ${scope.scopePath}.safeBins includes interpreter/runtime '${bin}' without profile; remove it from safeBins or use explicit allowlist entries.`);
				continue;
			}
			if (profileHolder[bin] !== void 0) continue;
			profileHolder[bin] = {};
			changes.push(`- ${scope.scopePath}.safeBinProfiles.${bin}: added scaffold profile {} (review and tighten flags/positionals).`);
		}
	}
	if (changes.length === 0 && warnings.length === 0) return {
		config: cfg,
		changes: [],
		warnings: []
	};
	return {
		config: next,
		changes,
		warnings
	};
}
//#endregion
//#region src/commands/doctor/shared/legacy-tools-by-sender.ts
function collectLegacyToolsBySenderKeyHits(value, pathParts, hits) {
	if (Array.isArray(value)) {
		for (const [index, entry] of value.entries()) collectLegacyToolsBySenderKeyHits(entry, [...pathParts, index], hits);
		return;
	}
	const record = asObjectRecord(value);
	if (!record) return;
	const toolsBySender = asObjectRecord(record.toolsBySender);
	if (toolsBySender) {
		const path = [...pathParts, "toolsBySender"];
		const pathLabel = formatConfigPath(path);
		for (const rawKey of Object.keys(toolsBySender)) {
			const trimmed = rawKey.trim();
			if (!trimmed || trimmed === "*" || parseToolsBySenderTypedKey(trimmed)) continue;
			hits.push({
				toolsBySenderPath: path,
				pathLabel,
				key: rawKey,
				targetKey: `id:${trimmed}`
			});
		}
	}
	for (const [key, nested] of Object.entries(record)) {
		if (key === "toolsBySender") continue;
		collectLegacyToolsBySenderKeyHits(nested, [...pathParts, key], hits);
	}
}
function scanLegacyToolsBySenderKeys(cfg) {
	const hits = [];
	collectLegacyToolsBySenderKeyHits(cfg, [], hits);
	return hits;
}
function collectLegacyToolsBySenderWarnings(params) {
	if (params.hits.length === 0) return [];
	const sample = params.hits[0];
	const sampleLabel = sanitizeForLog(sample ? `${sample.pathLabel}.${sample.key}` : "toolsBySender");
	return [
		`- Found ${params.hits.length} legacy untyped toolsBySender key${params.hits.length === 1 ? "" : "s"} (for example ${sampleLabel}).`,
		"- Untyped sender keys are deprecated; use explicit prefixes (id:, e164:, username:, name:).",
		`- Run "${params.doctorFixCommand}" to migrate legacy keys to typed id: entries.`
	];
}
function maybeRepairLegacyToolsBySenderKeys(cfg) {
	const next = structuredClone(cfg);
	const hits = scanLegacyToolsBySenderKeys(next);
	if (hits.length === 0) return {
		config: cfg,
		changes: []
	};
	const summary = /* @__PURE__ */ new Map();
	let changed = false;
	for (const hit of hits) {
		const toolsBySender = asObjectRecord(resolveConfigPathTarget(next, hit.toolsBySenderPath));
		if (!toolsBySender || !(hit.key in toolsBySender)) continue;
		const row = summary.get(hit.pathLabel) ?? {
			migrated: 0,
			dropped: 0,
			examples: []
		};
		if (toolsBySender[hit.targetKey] === void 0) {
			toolsBySender[hit.targetKey] = toolsBySender[hit.key];
			row.migrated++;
			if (row.examples.length < 3) row.examples.push(`${hit.key} -> ${hit.targetKey}`);
		} else {
			row.dropped++;
			if (row.examples.length < 3) row.examples.push(`${hit.key} (kept existing ${hit.targetKey})`);
		}
		delete toolsBySender[hit.key];
		summary.set(hit.pathLabel, row);
		changed = true;
	}
	if (!changed) return {
		config: cfg,
		changes: []
	};
	const changes = [];
	for (const [pathLabel, row] of summary) {
		if (row.migrated > 0) {
			const suffix = row.examples.length > 0 ? ` (${row.examples.join(", ")})` : "";
			changes.push(`- ${pathLabel}: migrated ${row.migrated} legacy key${row.migrated === 1 ? "" : "s"} to typed id: entries${suffix}.`);
		}
		if (row.dropped > 0) changes.push(`- ${pathLabel}: removed ${row.dropped} legacy key${row.dropped === 1 ? "" : "s"} where typed id: entries already existed.`);
	}
	return {
		config: next,
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/open-policy-allowfrom.ts
function hasWildcard(list) {
	return list?.some((v) => String(v).trim() === "*") ?? false;
}
function collectOpenPolicyAllowFromWarnings(params) {
	if (params.changes.length === 0) return [];
	return [...params.changes.map((line) => sanitizeForLog(line)), `- Run "${params.doctorFixCommand}" to add missing allowFrom wildcards.`];
}
function maybeRepairOpenPolicyAllowFrom(cfg) {
	const channels = cfg.channels;
	if (!channels || typeof channels !== "object") return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const changes = [];
	const ensureWildcard = (account, prefix, mode) => {
		const dmEntry = account.dm;
		const dm = dmEntry && typeof dmEntry === "object" && !Array.isArray(dmEntry) ? dmEntry : void 0;
		if ((account.dmPolicy ?? dm?.policy ?? void 0) !== "open") return;
		const topAllowFrom = account.allowFrom;
		const nestedAllowFrom = dm?.allowFrom;
		if (mode === "nestedOnly") {
			if (hasWildcard(nestedAllowFrom)) return;
			if (dm && Array.isArray(nestedAllowFrom)) {
				dm.allowFrom = [...nestedAllowFrom, "*"];
				changes.push(`- ${prefix}.dm.allowFrom: added "*" (required by dmPolicy="open")`);
			} else {
				const nextDm = dm ?? {};
				nextDm.allowFrom = ["*"];
				account.dm = nextDm;
				changes.push(`- ${prefix}.dm.allowFrom: set to ["*"] (required by dmPolicy="open")`);
			}
			return;
		}
		if (mode === "topOrNested") {
			if (hasWildcard(topAllowFrom) || hasWildcard(nestedAllowFrom)) return;
			if (Array.isArray(topAllowFrom)) {
				account.allowFrom = [...topAllowFrom, "*"];
				changes.push(`- ${prefix}.allowFrom: added "*" (required by dmPolicy="open")`);
			} else if (dm && Array.isArray(nestedAllowFrom)) {
				dm.allowFrom = [...nestedAllowFrom, "*"];
				changes.push(`- ${prefix}.dm.allowFrom: added "*" (required by dmPolicy="open")`);
			} else {
				account.allowFrom = ["*"];
				changes.push(`- ${prefix}.allowFrom: set to ["*"] (required by dmPolicy="open")`);
			}
			return;
		}
		if (hasWildcard(topAllowFrom)) return;
		if (Array.isArray(topAllowFrom)) {
			account.allowFrom = [...topAllowFrom, "*"];
			changes.push(`- ${prefix}.allowFrom: added "*" (required by dmPolicy="open")`);
		} else {
			account.allowFrom = ["*"];
			changes.push(`- ${prefix}.allowFrom: set to ["*"] (required by dmPolicy="open")`);
		}
	};
	const nextChannels = next.channels;
	for (const [channelName, channelConfig] of Object.entries(nextChannels)) {
		if (!channelConfig || typeof channelConfig !== "object") continue;
		const allowFromMode = resolveAllowFromMode(channelName);
		ensureWildcard(channelConfig, `channels.${channelName}`, allowFromMode);
		const accounts = asObjectRecord(channelConfig.accounts);
		if (!accounts) continue;
		for (const [accountName, accountConfig] of Object.entries(accounts)) if (accountConfig && typeof accountConfig === "object") ensureWildcard(accountConfig, `channels.${channelName}.accounts.${accountName}`, allowFromMode);
	}
	if (changes.length === 0) return {
		config: cfg,
		changes: []
	};
	return {
		config: next,
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/stale-plugin-config.ts
function collectPluginRegistryState(cfg, env) {
	const registry = loadPluginManifestRegistry({
		config: cfg,
		workspaceDir: resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)) ?? void 0,
		env
	});
	return {
		knownIds: new Set(registry.plugins.map((plugin) => plugin.id)),
		hasDiscoveryErrors: registry.diagnostics.some((diag) => diag.level === "error")
	};
}
function isStalePluginAutoRepairBlocked(cfg, env) {
	return collectPluginRegistryState(cfg, env).hasDiscoveryErrors;
}
function scanStalePluginConfig(cfg, env) {
	const plugins = asObjectRecord(cfg.plugins);
	if (!plugins) return [];
	const { knownIds } = collectPluginRegistryState(cfg, env);
	const hits = [];
	const allow = Array.isArray(plugins.allow) ? plugins.allow : [];
	for (const rawPluginId of allow) {
		if (typeof rawPluginId !== "string") continue;
		const pluginId = normalizePluginId(rawPluginId);
		if (!pluginId || knownIds.has(pluginId)) continue;
		hits.push({
			pluginId: rawPluginId,
			pathLabel: "plugins.allow",
			surface: "allow"
		});
	}
	const entries = asObjectRecord(plugins.entries);
	if (!entries) return hits;
	for (const rawPluginId of Object.keys(entries)) {
		if (knownIds.has(normalizePluginId(rawPluginId))) continue;
		hits.push({
			pluginId: rawPluginId,
			pathLabel: `plugins.entries.${rawPluginId}`,
			surface: "entries"
		});
	}
	return hits;
}
function collectStalePluginConfigWarnings(params) {
	if (params.hits.length === 0) return [];
	const lines = params.hits.map((hit) => `- ${hit.pathLabel}: stale plugin reference "${hit.pluginId}" was found.`);
	if (params.autoRepairBlocked) lines.push(`- Auto-removal is paused because plugin discovery currently has errors. Fix plugin discovery first, then rerun "${params.doctorFixCommand}".`);
	else lines.push(`- Run "${params.doctorFixCommand}" to remove stale plugins.allow and plugins.entries ids.`);
	return lines.map((line) => sanitizeForLog(line));
}
function maybeRepairStalePluginConfig(cfg, env) {
	if (isStalePluginAutoRepairBlocked(cfg, env)) return {
		config: cfg,
		changes: []
	};
	const hits = scanStalePluginConfig(cfg, env);
	if (hits.length === 0) return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const nextPlugins = asObjectRecord(next.plugins);
	if (!nextPlugins) return {
		config: cfg,
		changes: []
	};
	const allowIds = hits.filter((hit) => hit.surface === "allow").map((hit) => hit.pluginId);
	if (allowIds.length > 0 && Array.isArray(nextPlugins.allow)) {
		const staleAllowIds = new Set(allowIds.map((pluginId) => normalizePluginId(pluginId)));
		nextPlugins.allow = nextPlugins.allow.filter((pluginId) => typeof pluginId !== "string" || !staleAllowIds.has(normalizePluginId(pluginId)));
	}
	const entryIds = hits.filter((hit) => hit.surface === "entries").map((hit) => hit.pluginId);
	if (entryIds.length > 0) {
		const entries = asObjectRecord(nextPlugins.entries);
		if (entries) {
			const staleEntryIds = new Set(entryIds.map((pluginId) => normalizePluginId(pluginId)));
			for (const pluginId of Object.keys(entries)) if (staleEntryIds.has(normalizePluginId(pluginId))) delete entries[pluginId];
		}
	}
	const changes = [];
	if (allowIds.length > 0) changes.push(`- plugins.allow: removed ${allowIds.length} stale plugin id${allowIds.length === 1 ? "" : "s"} (${allowIds.join(", ")})`);
	if (entryIds.length > 0) changes.push(`- plugins.entries: removed ${entryIds.length} stale plugin entr${entryIds.length === 1 ? "y" : "ies"} (${entryIds.join(", ")})`);
	return {
		config: next,
		changes
	};
}
//#endregion
//#region src/commands/doctor/repair-sequencing.ts
async function runDoctorRepairSequence(params) {
	let state = params.state;
	const changeNotes = [];
	const warningNotes = [];
	const sanitizeLines = (lines) => lines.map((line) => sanitizeForLog(line)).join("\n");
	const applyMutation = (mutation) => {
		if (mutation.changes.length > 0) {
			changeNotes.push(sanitizeLines(mutation.changes));
			state = applyDoctorConfigMutation({
				state,
				mutation,
				shouldRepair: true
			});
		}
		if (mutation.warnings && mutation.warnings.length > 0) warningNotes.push(sanitizeLines(mutation.warnings));
	};
	applyMutation(await maybeRepairTelegramAllowFromUsernames(state.candidate));
	applyMutation(maybeRepairDiscordNumericIds(state.candidate));
	applyMutation(maybeRepairOpenPolicyAllowFrom(state.candidate));
	applyMutation(maybeRepairStalePluginConfig(state.candidate, process.env));
	applyMutation(await maybeRepairAllowlistPolicyAllowFrom(state.candidate));
	const emptyAllowlistWarnings = scanEmptyAllowlistPolicyWarnings(state.candidate, {
		doctorFixCommand: params.doctorFixCommand,
		extraWarningsForAccount: collectTelegramEmptyAllowlistExtraWarnings
	});
	if (emptyAllowlistWarnings.length > 0) warningNotes.push(sanitizeLines(emptyAllowlistWarnings));
	applyMutation(maybeRepairLegacyToolsBySenderKeys(state.candidate));
	applyMutation(maybeRepairExecSafeBinProfiles(state.candidate));
	return {
		state,
		changeNotes,
		warningNotes
	};
}
//#endregion
//#region src/commands/doctor/shared/config-flow-steps.ts
function applyLegacyCompatibilityStep(params) {
	if (params.snapshot.legacyIssues.length === 0) return {
		state: params.state,
		issueLines: [],
		changeLines: []
	};
	const issueLines = formatConfigIssueLines(params.snapshot.legacyIssues, "-");
	const { config: migrated, changes } = migrateLegacyConfig(params.snapshot.parsed);
	if (!migrated) return {
		state: {
			...params.state,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to apply compatibility migrations.`]
		},
		issueLines,
		changeLines: changes
	};
	return {
		state: {
			cfg: params.shouldRepair ? migrated : params.state.cfg,
			candidate: migrated,
			pendingChanges: params.state.pendingChanges || changes.length > 0,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to apply compatibility migrations.`]
		},
		issueLines,
		changeLines: changes
	};
}
function applyUnknownConfigKeyStep(params) {
	const unknown = stripUnknownConfigKeys(params.state.candidate);
	if (unknown.removed.length === 0) return {
		state: params.state,
		removed: []
	};
	return {
		state: {
			cfg: params.shouldRepair ? unknown.config : params.state.cfg,
			candidate: unknown.config,
			pendingChanges: true,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to remove these keys.`]
		},
		removed: unknown.removed
	};
}
//#endregion
//#region src/commands/doctor/shared/default-account-warnings.ts
function normalizeBindingChannelKey(raw) {
	const normalized = normalizeChatChannelId(raw);
	if (normalized) return normalized;
	return (raw ?? "").trim().toLowerCase();
}
function collectChannelsMissingDefaultAccount(cfg) {
	const channels = asObjectRecord(cfg.channels);
	if (!channels) return [];
	const contexts = [];
	for (const [channelKey, rawChannel] of Object.entries(channels)) {
		const channel = asObjectRecord(rawChannel);
		if (!channel) continue;
		const accounts = asObjectRecord(channel.accounts);
		if (!accounts) continue;
		const normalizedAccountIds = Array.from(new Set(Object.keys(accounts).map((accountId) => normalizeAccountId(accountId)).filter(Boolean))).toSorted((a, b) => a.localeCompare(b));
		if (normalizedAccountIds.length === 0 || normalizedAccountIds.includes("default")) continue;
		contexts.push({
			channelKey,
			channel,
			normalizedAccountIds
		});
	}
	return contexts;
}
function collectMissingDefaultAccountBindingWarnings(cfg) {
	const bindings = listRouteBindings(cfg);
	const warnings = [];
	for (const { channelKey, normalizedAccountIds } of collectChannelsMissingDefaultAccount(cfg)) {
		const accountIdSet = new Set(normalizedAccountIds);
		const channelPattern = normalizeBindingChannelKey(channelKey);
		let hasWildcardBinding = false;
		const coveredAccountIds = /* @__PURE__ */ new Set();
		for (const binding of bindings) {
			const bindingRecord = asObjectRecord(binding);
			if (!bindingRecord) continue;
			const match = asObjectRecord(bindingRecord.match);
			if (!match) continue;
			const matchChannel = typeof match.channel === "string" ? normalizeBindingChannelKey(match.channel) : "";
			if (!matchChannel || matchChannel !== channelPattern) continue;
			const rawAccountId = typeof match.accountId === "string" ? match.accountId.trim() : "";
			if (!rawAccountId) continue;
			if (rawAccountId === "*") {
				hasWildcardBinding = true;
				continue;
			}
			const normalizedBindingAccountId = normalizeAccountId(rawAccountId);
			if (accountIdSet.has(normalizedBindingAccountId)) coveredAccountIds.add(normalizedBindingAccountId);
		}
		if (hasWildcardBinding) continue;
		const uncoveredAccountIds = normalizedAccountIds.filter((accountId) => !coveredAccountIds.has(accountId));
		if (uncoveredAccountIds.length === 0) continue;
		if (coveredAccountIds.size > 0) {
			warnings.push(`- channels.${channelKey}: accounts.default is missing and account bindings only cover a subset of configured accounts. Uncovered accounts: ${uncoveredAccountIds.join(", ")}. Add bindings[].match.accountId for uncovered accounts (or "*"), or add ${formatChannelAccountsDefaultPath(channelKey)}.`);
			continue;
		}
		warnings.push(`- channels.${channelKey}: accounts.default is missing and no valid account-scoped binding exists for configured accounts (${normalizedAccountIds.join(", ")}). Channel-only bindings (no accountId) match only default. Add bindings[].match.accountId for one of these accounts (or "*"), or add ${formatChannelAccountsDefaultPath(channelKey)}.`);
	}
	return warnings;
}
function collectMissingExplicitDefaultAccountWarnings(cfg) {
	const warnings = [];
	for (const { channelKey, channel, normalizedAccountIds } of collectChannelsMissingDefaultAccount(cfg)) {
		if (normalizedAccountIds.length < 2) continue;
		const preferredDefault = normalizeOptionalAccountId(typeof channel.defaultAccount === "string" ? channel.defaultAccount : void 0);
		if (preferredDefault) {
			if (normalizedAccountIds.includes(preferredDefault)) continue;
			warnings.push(`- channels.${channelKey}: defaultAccount is set to "${preferredDefault}" but does not match configured accounts (${normalizedAccountIds.join(", ")}). ${formatSetExplicitDefaultToConfiguredInstruction({ channelKey })} to avoid fallback routing.`);
			continue;
		}
		warnings.push(`- channels.${channelKey}: multiple accounts are configured but no explicit default is set. ${formatSetExplicitDefaultInstruction(channelKey)} to avoid fallback routing.`);
	}
	return warnings;
}
//#endregion
//#region src/commands/doctor/shared/mutable-allowlist.ts
function addMutableAllowlistHits(params) {
	if (!Array.isArray(params.list)) return;
	for (const entry of params.list) {
		const text = String(entry).trim();
		if (!text || text === "*") continue;
		if (!params.detector(text)) continue;
		params.hits.push({
			channel: params.channel,
			path: params.pathLabel,
			entry: text,
			dangerousFlagPath: params.dangerousFlagPath
		});
	}
}
function scanMutableAllowlistEntries(cfg) {
	const hits = [];
	for (const scope of collectProviderDangerousNameMatchingScopes(cfg, "discord")) {
		if (scope.dangerousNameMatchingEnabled) continue;
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.allowFrom`,
			list: scope.account.allowFrom,
			detector: isDiscordMutableAllowEntry,
			channel: "discord",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		const dm = asObjectRecord(scope.account.dm);
		if (dm) addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.dm.allowFrom`,
			list: dm.allowFrom,
			detector: isDiscordMutableAllowEntry,
			channel: "discord",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		const guilds = asObjectRecord(scope.account.guilds);
		if (!guilds) continue;
		for (const [guildId, guildRaw] of Object.entries(guilds)) {
			const guild = asObjectRecord(guildRaw);
			if (!guild) continue;
			addMutableAllowlistHits({
				hits,
				pathLabel: `${scope.prefix}.guilds.${guildId}.users`,
				list: guild.users,
				detector: isDiscordMutableAllowEntry,
				channel: "discord",
				dangerousFlagPath: scope.dangerousFlagPath
			});
			const channels = asObjectRecord(guild.channels);
			if (!channels) continue;
			for (const [channelId, channelRaw] of Object.entries(channels)) {
				const channel = asObjectRecord(channelRaw);
				if (!channel) continue;
				addMutableAllowlistHits({
					hits,
					pathLabel: `${scope.prefix}.guilds.${guildId}.channels.${channelId}.users`,
					list: channel.users,
					detector: isDiscordMutableAllowEntry,
					channel: "discord",
					dangerousFlagPath: scope.dangerousFlagPath
				});
			}
		}
	}
	for (const scope of collectProviderDangerousNameMatchingScopes(cfg, "slack")) {
		if (scope.dangerousNameMatchingEnabled) continue;
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.allowFrom`,
			list: scope.account.allowFrom,
			detector: isSlackMutableAllowEntry,
			channel: "slack",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		const dm = asObjectRecord(scope.account.dm);
		if (dm) addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.dm.allowFrom`,
			list: dm.allowFrom,
			detector: isSlackMutableAllowEntry,
			channel: "slack",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		const channels = asObjectRecord(scope.account.channels);
		if (!channels) continue;
		for (const [channelKey, channelRaw] of Object.entries(channels)) {
			const channel = asObjectRecord(channelRaw);
			if (!channel) continue;
			addMutableAllowlistHits({
				hits,
				pathLabel: `${scope.prefix}.channels.${channelKey}.users`,
				list: channel.users,
				detector: isSlackMutableAllowEntry,
				channel: "slack",
				dangerousFlagPath: scope.dangerousFlagPath
			});
		}
	}
	for (const scope of collectProviderDangerousNameMatchingScopes(cfg, "googlechat")) {
		if (scope.dangerousNameMatchingEnabled) continue;
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.groupAllowFrom`,
			list: scope.account.groupAllowFrom,
			detector: isGoogleChatMutableAllowEntry,
			channel: "googlechat",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		const dm = asObjectRecord(scope.account.dm);
		if (dm) addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.dm.allowFrom`,
			list: dm.allowFrom,
			detector: isGoogleChatMutableAllowEntry,
			channel: "googlechat",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		const groups = asObjectRecord(scope.account.groups);
		if (!groups) continue;
		for (const [groupKey, groupRaw] of Object.entries(groups)) {
			const group = asObjectRecord(groupRaw);
			if (!group) continue;
			addMutableAllowlistHits({
				hits,
				pathLabel: `${scope.prefix}.groups.${groupKey}.users`,
				list: group.users,
				detector: isGoogleChatMutableAllowEntry,
				channel: "googlechat",
				dangerousFlagPath: scope.dangerousFlagPath
			});
		}
	}
	for (const scope of collectProviderDangerousNameMatchingScopes(cfg, "msteams")) {
		if (scope.dangerousNameMatchingEnabled) continue;
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.allowFrom`,
			list: scope.account.allowFrom,
			detector: isMSTeamsMutableAllowEntry,
			channel: "msteams",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.groupAllowFrom`,
			list: scope.account.groupAllowFrom,
			detector: isMSTeamsMutableAllowEntry,
			channel: "msteams",
			dangerousFlagPath: scope.dangerousFlagPath
		});
	}
	for (const scope of collectProviderDangerousNameMatchingScopes(cfg, "mattermost")) {
		if (scope.dangerousNameMatchingEnabled) continue;
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.allowFrom`,
			list: scope.account.allowFrom,
			detector: isMattermostMutableAllowEntry,
			channel: "mattermost",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.groupAllowFrom`,
			list: scope.account.groupAllowFrom,
			detector: isMattermostMutableAllowEntry,
			channel: "mattermost",
			dangerousFlagPath: scope.dangerousFlagPath
		});
	}
	for (const scope of collectProviderDangerousNameMatchingScopes(cfg, "irc")) {
		if (scope.dangerousNameMatchingEnabled) continue;
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.allowFrom`,
			list: scope.account.allowFrom,
			detector: isIrcMutableAllowEntry,
			channel: "irc",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		addMutableAllowlistHits({
			hits,
			pathLabel: `${scope.prefix}.groupAllowFrom`,
			list: scope.account.groupAllowFrom,
			detector: isIrcMutableAllowEntry,
			channel: "irc",
			dangerousFlagPath: scope.dangerousFlagPath
		});
		const groups = asObjectRecord(scope.account.groups);
		if (!groups) continue;
		for (const [groupKey, groupRaw] of Object.entries(groups)) {
			const group = asObjectRecord(groupRaw);
			if (!group) continue;
			addMutableAllowlistHits({
				hits,
				pathLabel: `${scope.prefix}.groups.${groupKey}.allowFrom`,
				list: group.allowFrom,
				detector: isIrcMutableAllowEntry,
				channel: "irc",
				dangerousFlagPath: scope.dangerousFlagPath
			});
		}
	}
	for (const scope of collectProviderDangerousNameMatchingScopes(cfg, "zalouser")) {
		if (scope.dangerousNameMatchingEnabled) continue;
		const groups = asObjectRecord(scope.account.groups);
		if (!groups) continue;
		for (const entry of Object.keys(groups)) {
			if (!isZalouserMutableGroupEntry(entry)) continue;
			hits.push({
				channel: "zalouser",
				path: `${scope.prefix}.groups`,
				entry,
				dangerousFlagPath: scope.dangerousFlagPath
			});
		}
	}
	return hits;
}
function collectMutableAllowlistWarnings(hits) {
	if (hits.length === 0) return [];
	const channels = Array.from(new Set(hits.map((hit) => hit.channel))).toSorted();
	const exampleLines = hits.slice(0, 8).map((hit) => `- ${sanitizeForLog(hit.path)}: ${sanitizeForLog(hit.entry)}`);
	const remaining = hits.length > 8 ? `- +${hits.length - 8} more mutable allowlist entries.` : null;
	const flagPaths = Array.from(new Set(hits.map((hit) => hit.dangerousFlagPath)));
	const flagHint = flagPaths.length === 1 ? sanitizeForLog(flagPaths[0] ?? "") : `${sanitizeForLog(flagPaths[0] ?? "")} (and ${flagPaths.length - 1} other scope flags)`;
	return [
		`- Found ${hits.length} mutable allowlist ${hits.length === 1 ? "entry" : "entries"} across ${channels.join(", ")} while name matching is disabled by default.`,
		...exampleLines,
		...remaining ? [remaining] : [],
		`- Option A (break-glass): enable ${flagHint}=true to keep name/email/nick matching.`,
		"- Option B (recommended): resolve names/emails/nicks to stable sender IDs and rewrite the allowlist entries."
	];
}
//#endregion
//#region src/commands/doctor/shared/preview-warnings.ts
function collectDoctorPreviewWarnings(params) {
	const warnings = [];
	const telegramHits = scanTelegramAllowFromUsernameEntries(params.cfg);
	if (telegramHits.length > 0) warnings.push(collectTelegramAllowFromUsernameWarnings({
		hits: telegramHits,
		doctorFixCommand: params.doctorFixCommand
	}).join("\n"));
	const discordHits = scanDiscordNumericIdEntries(params.cfg);
	if (discordHits.length > 0) warnings.push(collectDiscordNumericIdWarnings({
		hits: discordHits,
		doctorFixCommand: params.doctorFixCommand
	}).join("\n"));
	const allowFromScan = maybeRepairOpenPolicyAllowFrom(params.cfg);
	if (allowFromScan.changes.length > 0) warnings.push(collectOpenPolicyAllowFromWarnings({
		changes: allowFromScan.changes,
		doctorFixCommand: params.doctorFixCommand
	}).join("\n"));
	const stalePluginHits = scanStalePluginConfig(params.cfg, process.env);
	if (stalePluginHits.length > 0) warnings.push(collectStalePluginConfigWarnings({
		hits: stalePluginHits,
		doctorFixCommand: params.doctorFixCommand,
		autoRepairBlocked: isStalePluginAutoRepairBlocked(params.cfg, process.env)
	}).join("\n"));
	const emptyAllowlistWarnings = scanEmptyAllowlistPolicyWarnings(params.cfg, {
		doctorFixCommand: params.doctorFixCommand,
		extraWarningsForAccount: collectTelegramEmptyAllowlistExtraWarnings
	});
	if (emptyAllowlistWarnings.length > 0) warnings.push(emptyAllowlistWarnings.map((line) => sanitizeForLog(line)).join("\n"));
	const toolsBySenderHits = scanLegacyToolsBySenderKeys(params.cfg);
	if (toolsBySenderHits.length > 0) warnings.push(collectLegacyToolsBySenderWarnings({
		hits: toolsBySenderHits,
		doctorFixCommand: params.doctorFixCommand
	}).join("\n"));
	const safeBinCoverage = scanExecSafeBinCoverage(params.cfg);
	if (safeBinCoverage.length > 0) warnings.push(collectExecSafeBinCoverageWarnings({
		hits: safeBinCoverage,
		doctorFixCommand: params.doctorFixCommand
	}).join("\n"));
	const safeBinTrustedDirHints = scanExecSafeBinTrustedDirHints(params.cfg);
	if (safeBinTrustedDirHints.length > 0) warnings.push(collectExecSafeBinTrustedDirHintWarnings(safeBinTrustedDirHints).join("\n"));
	return warnings;
}
//#endregion
//#region src/commands/doctor-config-flow.ts
async function loadAndMaybeMigrateDoctorConfig(params) {
	const shouldRepair = params.options.repair === true || params.options.yes === true;
	const preflight = await runDoctorConfigPreflight();
	let snapshot = preflight.snapshot;
	const baseCfg = preflight.baseConfig;
	let cfg = baseCfg;
	let candidate = structuredClone(baseCfg);
	let pendingChanges = false;
	let fixHints = [];
	const doctorFixCommand = formatCliCommand("openclaw doctor --fix");
	const legacyStep = applyLegacyCompatibilityStep({
		snapshot,
		state: {
			cfg,
			candidate,
			pendingChanges,
			fixHints
		},
		shouldRepair,
		doctorFixCommand
	});
	({cfg, candidate, pendingChanges, fixHints} = legacyStep.state);
	if (legacyStep.issueLines.length > 0) note$1(legacyStep.issueLines.join("\n"), "Compatibility config keys detected");
	if (legacyStep.changeLines.length > 0) note$1(legacyStep.changeLines.join("\n"), "Doctor changes");
	const normalized = normalizeCompatibilityConfigValues(candidate);
	if (normalized.changes.length > 0) {
		note$1(normalized.changes.join("\n"), "Doctor changes");
		({cfg, candidate, pendingChanges, fixHints} = applyDoctorConfigMutation({
			state: {
				cfg,
				candidate,
				pendingChanges,
				fixHints
			},
			mutation: normalized,
			shouldRepair,
			fixHint: `Run "${doctorFixCommand}" to apply these changes.`
		}));
	}
	const autoEnable = applyPluginAutoEnable({
		config: candidate,
		env: process.env
	});
	if (autoEnable.changes.length > 0) {
		note$1(autoEnable.changes.join("\n"), "Doctor changes");
		({cfg, candidate, pendingChanges, fixHints} = applyDoctorConfigMutation({
			state: {
				cfg,
				candidate,
				pendingChanges,
				fixHints
			},
			mutation: autoEnable,
			shouldRepair,
			fixHint: `Run "${doctorFixCommand}" to apply these changes.`
		}));
	}
	const matrixSequence = await runMatrixDoctorSequence({
		cfg: candidate,
		env: process.env,
		shouldRepair
	});
	emitDoctorNotes({
		note: note$1,
		changeNotes: matrixSequence.changeNotes,
		warningNotes: matrixSequence.warningNotes
	});
	const missingDefaultAccountBindingWarnings = collectMissingDefaultAccountBindingWarnings(candidate);
	if (missingDefaultAccountBindingWarnings.length > 0) note$1(missingDefaultAccountBindingWarnings.join("\n"), "Doctor warnings");
	const missingExplicitDefaultWarnings = collectMissingExplicitDefaultAccountWarnings(candidate);
	if (missingExplicitDefaultWarnings.length > 0) note$1(missingExplicitDefaultWarnings.join("\n"), "Doctor warnings");
	if (shouldRepair) {
		const repairSequence = await runDoctorRepairSequence({
			state: {
				cfg,
				candidate,
				pendingChanges,
				fixHints
			},
			doctorFixCommand
		});
		({cfg, candidate, pendingChanges, fixHints} = repairSequence.state);
		emitDoctorNotes({
			note: note$1,
			changeNotes: repairSequence.changeNotes,
			warningNotes: repairSequence.warningNotes
		});
	} else emitDoctorNotes({
		note: note$1,
		warningNotes: collectDoctorPreviewWarnings({
			cfg: candidate,
			doctorFixCommand
		})
	});
	const mutableAllowlistHits = scanMutableAllowlistEntries(candidate);
	if (mutableAllowlistHits.length > 0) note$1(collectMutableAllowlistWarnings(mutableAllowlistHits).join("\n"), "Doctor warnings");
	const unknownStep = applyUnknownConfigKeyStep({
		state: {
			cfg,
			candidate,
			pendingChanges,
			fixHints
		},
		shouldRepair,
		doctorFixCommand
	});
	({cfg, candidate, pendingChanges, fixHints} = unknownStep.state);
	if (unknownStep.removed.length > 0) note$1(unknownStep.removed.map((path) => `- ${path}`).join("\n"), shouldRepair ? "Doctor changes" : "Unknown config keys");
	const finalized = await finalizeDoctorConfigFlow({
		cfg,
		candidate,
		pendingChanges,
		shouldRepair,
		fixHints,
		confirm: params.confirm,
		note: note$1
	});
	cfg = finalized.cfg;
	noteOpencodeProviderOverrides(cfg);
	return {
		cfg,
		path: snapshot.path ?? CONFIG_PATH,
		shouldWriteConfig: finalized.shouldWriteConfig,
		sourceConfigValid: snapshot.valid
	};
}
//#endregion
//#region src/commands/doctor-cron.ts
function pluralize(count, noun) {
	return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
function formatLegacyIssuePreview(issues) {
	const lines = [];
	if (issues.jobId) lines.push(`- ${pluralize(issues.jobId, "job")} still uses legacy \`jobId\``);
	if (issues.legacyScheduleString) lines.push(`- ${pluralize(issues.legacyScheduleString, "job")} stores schedule as a bare string`);
	if (issues.legacyScheduleCron) lines.push(`- ${pluralize(issues.legacyScheduleCron, "job")} still uses \`schedule.cron\``);
	if (issues.legacyPayloadKind) lines.push(`- ${pluralize(issues.legacyPayloadKind, "job")} needs payload kind normalization`);
	if (issues.legacyPayloadProvider) lines.push(`- ${pluralize(issues.legacyPayloadProvider, "job")} still uses payload \`provider\` as a delivery alias`);
	if (issues.legacyTopLevelPayloadFields) lines.push(`- ${pluralize(issues.legacyTopLevelPayloadFields, "job")} still uses top-level payload fields`);
	if (issues.legacyTopLevelDeliveryFields) lines.push(`- ${pluralize(issues.legacyTopLevelDeliveryFields, "job")} still uses top-level delivery fields`);
	if (issues.legacyDeliveryMode) lines.push(`- ${pluralize(issues.legacyDeliveryMode, "job")} still uses delivery mode \`deliver\``);
	return lines;
}
function trimString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function migrateLegacyNotifyFallback(params) {
	let changed = false;
	const warnings = [];
	for (const raw of params.jobs) {
		if (!("notify" in raw)) continue;
		const jobName = trimString(raw.name) ?? trimString(raw.id) ?? "<unnamed>";
		if (!(raw.notify === true)) {
			delete raw.notify;
			changed = true;
			continue;
		}
		const delivery = raw.delivery && typeof raw.delivery === "object" && !Array.isArray(raw.delivery) ? raw.delivery : null;
		const mode = trimString(delivery?.mode)?.toLowerCase();
		const to = trimString(delivery?.to);
		if (mode === "webhook" && to) {
			delete raw.notify;
			changed = true;
			continue;
		}
		if ((mode === void 0 || mode === "none" || mode === "webhook") && params.legacyWebhook) {
			raw.delivery = {
				...delivery,
				mode: "webhook",
				to: mode === "none" ? params.legacyWebhook : to ?? params.legacyWebhook
			};
			delete raw.notify;
			changed = true;
			continue;
		}
		if (!params.legacyWebhook) {
			warnings.push(`Cron job "${jobName}" still uses legacy notify fallback, but cron.webhook is unset so doctor cannot migrate it automatically.`);
			continue;
		}
		warnings.push(`Cron job "${jobName}" uses legacy notify fallback alongside delivery mode "${mode}". Migrate it manually so webhook delivery does not replace existing announce behavior.`);
	}
	return {
		changed,
		warnings
	};
}
async function maybeRepairLegacyCronStore(params) {
	const storePath = resolveCronStorePath(params.cfg.cron?.store);
	const rawJobs = (await loadCronStore(storePath)).jobs ?? [];
	if (rawJobs.length === 0) return;
	const normalized = normalizeStoredCronJobs(rawJobs);
	const legacyWebhook = trimString(params.cfg.cron?.webhook);
	const notifyCount = rawJobs.filter((job) => job.notify === true).length;
	const previewLines = formatLegacyIssuePreview(normalized.issues);
	if (notifyCount > 0) previewLines.push(`- ${pluralize(notifyCount, "job")} still uses legacy \`notify: true\` webhook fallback`);
	if (previewLines.length === 0) return;
	note$1([
		`Legacy cron job storage detected at ${shortenHomePath(storePath)}.`,
		...previewLines,
		`Repair with ${formatCliCommand("openclaw doctor --fix")} to normalize the store before the next scheduler run.`
	].join("\n"), "Cron");
	if (!await params.prompter.confirm({
		message: "Repair legacy cron jobs now?",
		initialValue: true
	})) return;
	const notifyMigration = migrateLegacyNotifyFallback({
		jobs: rawJobs,
		legacyWebhook
	});
	const changed = normalized.mutated || notifyMigration.changed;
	if (!changed && notifyMigration.warnings.length === 0) return;
	if (changed) {
		await saveCronStore(storePath, {
			version: 1,
			jobs: rawJobs
		});
		note$1(`Cron store normalized at ${shortenHomePath(storePath)}.`, "Doctor changes");
	}
	if (notifyMigration.warnings.length > 0) note$1(notifyMigration.warnings.join("\n"), "Doctor warnings");
}
//#endregion
//#region src/commands/doctor-format.ts
function formatGatewayRuntimeSummary(runtime) {
	return formatRuntimeStatus(runtime);
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
		hints.push(...buildPlatformRuntimeLogHints({
			platform,
			env,
			systemdServiceName: resolveGatewaySystemdServiceName(env.OPENCLAW_PROFILE),
			windowsTaskName: resolveGatewayWindowsTaskName(env.OPENCLAW_PROFILE)
		}));
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
				const tokenResolution = await resolveGatewayInstallToken({
					config: params.cfg,
					env: process.env
				});
				for (const warning of tokenResolution.warnings) note$1(warning, "Gateway");
				if (tokenResolution.unavailableReason) {
					note$1([
						"Gateway service install aborted.",
						tokenResolution.unavailableReason,
						"Fix gateway auth config/token input and rerun doctor."
					].join("\n"), "Gateway");
					return;
				}
				const port = resolveGatewayPort(params.cfg, process.env);
				const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
					env: process.env,
					port,
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
			const restartStatus = describeGatewayServiceRestart("Gateway", await service.restart({
				env: process.env,
				stdout: process.stdout
			}));
			if (!restartStatus.scheduled) await sleep(1500);
			else note$1(restartStatus.message, "Gateway");
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
			const restartStatus = describeGatewayServiceRestart("Gateway", await service.restart({
				env: process.env,
				stdout: process.stdout
			}));
			if (restartStatus.scheduled) {
				note$1(restartStatus.message, "Gateway");
				return;
			}
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
async function probeGatewayMemoryStatus(params) {
	const timeoutMs = typeof params.timeoutMs === "number" && params.timeoutMs > 0 ? params.timeoutMs : 8e3;
	try {
		const payload = await callGateway({
			method: "doctor.memory.status",
			timeoutMs,
			config: params.cfg
		});
		return {
			checked: true,
			ready: payload.embedding.ok,
			error: payload.embedding.error
		};
	} catch (err) {
		return {
			checked: true,
			ready: false,
			error: `gateway memory probe unavailable: ${err instanceof Error ? err.message : String(err)}`
		};
	}
}
//#endregion
//#region src/commands/doctor-gateway-auth-token.ts
async function resolveGatewayAuthTokenForService(cfg, env) {
	const resolved = await resolveConfiguredSecretInputWithFallback({
		config: cfg,
		env,
		value: cfg.gateway?.auth?.token,
		path: "gateway.auth.token",
		unresolvedReasonStyle: "detailed",
		readFallback: () => readGatewayTokenEnv(env)
	});
	if (resolved.value) return { token: resolved.value };
	if (!resolved.secretRefConfigured) return {};
	if (resolved.unresolvedRefReason?.includes("resolved to an empty value")) return { unavailableReason: resolved.unresolvedRefReason };
	return { unavailableReason: `gateway.auth.token SecretRef is configured but unresolved (${resolved.unresolvedRefReason ?? "unknown reason"}).` };
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
async function normalizeExecutablePath(value) {
	const resolvedPath = path.resolve(value);
	try {
		return await fs$1.realpath(resolvedPath);
	} catch {
		return resolvedPath;
	}
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
		await fs$1.mkdir(trashDir, { recursive: true });
	} catch {}
	try {
		await fs$1.access(params.plistPath);
	} catch {
		return null;
	}
	const dest = path.join(trashDir, `${params.label}-${Date.now()}.plist`);
	try {
		await fs$1.rename(params.plistPath, dest);
		return dest;
	} catch {
		return null;
	}
}
function classifyLegacyServices(legacyServices) {
	const darwinUserServices = [];
	const linuxUserServices = [];
	const failed = [];
	for (const svc of legacyServices) {
		if (svc.platform === "darwin") {
			if (svc.scope === "user") darwinUserServices.push(svc);
			else failed.push(`${svc.label} (${svc.scope})`);
			continue;
		}
		if (svc.platform === "linux") {
			if (svc.scope === "user") linuxUserServices.push(svc);
			else failed.push(`${svc.label} (${svc.scope})`);
			continue;
		}
		failed.push(`${svc.label} (${svc.platform})`);
	}
	return {
		darwinUserServices,
		linuxUserServices,
		failed
	};
}
async function cleanupLegacyDarwinServices(services) {
	const removed = [];
	const failed = [];
	for (const svc of services) {
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
	return {
		removed,
		failed
	};
}
async function cleanupLegacyLinuxUserServices(services, runtime) {
	const removed = [];
	const failed = [];
	try {
		const removedUnits = await uninstallLegacySystemdUnits({
			env: process.env,
			stdout: process.stdout
		});
		const removedByLabel = new Map(removedUnits.map((unit) => [`${unit.name}.service`, unit]));
		for (const svc of services) {
			const removedUnit = removedByLabel.get(svc.label);
			if (!removedUnit) {
				failed.push(`${svc.label} (legacy unit name not recognized)`);
				continue;
			}
			removed.push(`${svc.label} -> ${removedUnit.unitPath}`);
		}
	} catch (err) {
		runtime.error(`Legacy Linux gateway cleanup failed: ${String(err)}`);
		for (const svc of services) failed.push(`${svc.label} (linux cleanup failed)`);
	}
	return {
		removed,
		failed
	};
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
	const tokenRefConfigured = Boolean(resolveSecretInputRef({
		value: cfg.gateway?.auth?.token,
		defaults: cfg.secrets?.defaults
	}).ref);
	const gatewayTokenResolution = await resolveGatewayAuthTokenForService(cfg, process.env);
	if (gatewayTokenResolution.unavailableReason) note$1(`Unable to verify gateway service token drift: ${gatewayTokenResolution.unavailableReason}`, "Gateway service config");
	const expectedGatewayToken = tokenRefConfigured ? void 0 : gatewayTokenResolution.token;
	const audit = await auditGatewayServiceConfig({
		env: process.env,
		command,
		expectedGatewayToken
	});
	const serviceToken = readEmbeddedGatewayToken(command);
	if (tokenRefConfigured && serviceToken) audit.issues.push({
		code: SERVICE_AUDIT_CODES.gatewayTokenMismatch,
		message: "Gateway service OPENCLAW_GATEWAY_TOKEN should be unset when gateway.auth.token is SecretRef-managed",
		detail: "service token is stale",
		level: "recommended"
	});
	const needsNodeRuntime = needsNodeRuntimeMigration(audit.issues);
	const systemNodeInfo = needsNodeRuntime ? await resolveSystemNodeInfo({ env: process.env }) : null;
	const systemNodePath = systemNodeInfo?.supported ? systemNodeInfo.path : null;
	if (needsNodeRuntime && !systemNodePath) {
		const warning = renderSystemNodeWarning(systemNodeInfo);
		if (warning) note$1(warning, "Gateway runtime");
		note$1("System Node 22 LTS (22.16+) or Node 24 not found. Install via Homebrew/apt/choco and rerun doctor to migrate off Bun/version managers.", "Gateway runtime");
	}
	const port = resolveGatewayPort(cfg, process.env);
	const runtimeChoice = detectGatewayRuntime(command.programArguments);
	const { programArguments } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		runtime: needsNodeRuntime && systemNodePath ? "node" : runtimeChoice,
		nodePath: systemNodePath ?? void 0,
		warn: (message, title) => note$1(message, title),
		config: cfg
	});
	const expectedEntrypoint = findGatewayEntrypoint(programArguments);
	const currentEntrypoint = findGatewayEntrypoint(command.programArguments);
	const normalizedExpectedEntrypoint = expectedEntrypoint ? await normalizeExecutablePath(expectedEntrypoint) : null;
	const normalizedCurrentEntrypoint = currentEntrypoint ? await normalizeExecutablePath(currentEntrypoint) : null;
	if (normalizedExpectedEntrypoint && normalizedCurrentEntrypoint && normalizedExpectedEntrypoint !== normalizedCurrentEntrypoint) audit.issues.push({
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
	const serviceEmbeddedToken = readEmbeddedGatewayToken(command);
	const gatewayTokenForRepair = expectedGatewayToken ?? serviceEmbeddedToken;
	const configuredGatewayToken = typeof cfg.gateway?.auth?.token === "string" ? cfg.gateway.auth.token.trim() || void 0 : void 0;
	let cfgForServiceInstall = cfg;
	if (!tokenRefConfigured && !configuredGatewayToken && gatewayTokenForRepair) {
		const nextCfg = {
			...cfg,
			gateway: {
				...cfg.gateway,
				auth: {
					...cfg.gateway?.auth,
					mode: cfg.gateway?.auth?.mode ?? "token",
					token: gatewayTokenForRepair
				}
			}
		};
		try {
			await writeConfigFile(nextCfg);
			cfgForServiceInstall = nextCfg;
			note$1(expectedGatewayToken ? "Persisted gateway.auth.token from environment before reinstalling service." : "Persisted gateway.auth.token from existing service definition before reinstalling service.", "Gateway");
		} catch (err) {
			runtime.error(`Failed to persist gateway.auth.token before service repair: ${String(err)}`);
			return;
		}
	}
	const updatedPort = resolveGatewayPort(cfgForServiceInstall, process.env);
	const updatedPlan = await buildGatewayInstallPlan({
		env: process.env,
		port: updatedPort,
		runtime: needsNodeRuntime && systemNodePath ? "node" : runtimeChoice,
		nodePath: systemNodePath ?? void 0,
		warn: (message, title) => note$1(message, title),
		config: cfgForServiceInstall
	});
	try {
		await service.install({
			env: process.env,
			stdout: process.stdout,
			programArguments: updatedPlan.programArguments,
			workingDirectory: updatedPlan.workingDirectory,
			environment: updatedPlan.environment
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
			const { darwinUserServices, linuxUserServices, failed } = classifyLegacyServices(legacyServices);
			if (darwinUserServices.length > 0) {
				const result = await cleanupLegacyDarwinServices(darwinUserServices);
				removed.push(...result.removed);
				failed.push(...result.failed);
			}
			if (linuxUserServices.length > 0) {
				const result = await cleanupLegacyLinuxUserServices(linuxUserServices, runtime);
				removed.push(...result.removed);
				failed.push(...result.failed);
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
//#region src/commands/doctor-memory-search.ts
/**
* Check whether memory search has a usable embedding provider.
* Runs as part of `openclaw doctor` — config-only, no network calls.
*/
async function noteMemorySearchHealth(cfg, opts) {
	const agentId = resolveDefaultAgentId(cfg);
	const agentDir = resolveAgentDir(cfg, agentId);
	const resolved = resolveMemorySearchConfig(cfg, agentId);
	const hasRemoteApiKey = hasConfiguredMemorySecretInput(resolved?.remote?.apiKey);
	if (!resolved) {
		note$1("Memory search is explicitly disabled (enabled: false).", "Memory search");
		return;
	}
	if (resolveMemoryBackendConfig({
		cfg,
		agentId
	}).backend === "qmd") return;
	if (resolved.provider !== "auto") {
		if (resolved.provider === "local") {
			if (hasLocalEmbeddings(resolved.local, true)) {
				if (opts?.gatewayMemoryProbe?.checked && !opts.gatewayMemoryProbe.ready) {
					const detail = opts.gatewayMemoryProbe.error?.trim();
					note$1([
						"Memory search provider is set to \"local\" and a model path is configured,",
						"but the gateway reports local embeddings are not ready.",
						detail ? `Gateway probe: ${detail}` : null,
						"",
						`Verify: ${formatCliCommand("openclaw memory status --deep")}`
					].filter(Boolean).join("\n"), "Memory search");
				}
				return;
			}
			note$1([
				"Memory search provider is set to \"local\" but no local model file was found.",
				"",
				"Fix (pick one):",
				`- Install node-llama-cpp and set a local model path in config`,
				`- Switch to a remote provider: ${formatCliCommand("openclaw config set agents.defaults.memorySearch.provider openai")}`,
				"",
				`Verify: ${formatCliCommand("openclaw memory status --deep")}`
			].join("\n"), "Memory search");
			return;
		}
		if (hasRemoteApiKey || await hasApiKeyForProvider(resolved.provider, cfg, agentDir)) return;
		if (opts?.gatewayMemoryProbe?.checked && opts.gatewayMemoryProbe.ready) {
			note$1([
				`Memory search provider is set to "${resolved.provider}" but the API key was not found in the CLI environment.`,
				"The running gateway reports memory embeddings are ready for the default agent.",
				`Verify: ${formatCliCommand("openclaw memory status --deep")}`
			].join("\n"), "Memory search");
			return;
		}
		const gatewayProbeWarning = buildGatewayProbeWarning(opts?.gatewayMemoryProbe);
		const envVar = providerEnvVar(resolved.provider);
		note$1([
			`Memory search provider is set to "${resolved.provider}" but no API key was found.`,
			`Semantic recall will not work without a valid API key.`,
			gatewayProbeWarning ? gatewayProbeWarning : null,
			"",
			"Fix (pick one):",
			`- Set ${envVar} in your environment`,
			`- Configure credentials: ${formatCliCommand("openclaw configure --section model")}`,
			`- To disable: ${formatCliCommand("openclaw config set agents.defaults.memorySearch.enabled false")}`,
			"",
			`Verify: ${formatCliCommand("openclaw memory status --deep")}`
		].join("\n"), "Memory search");
		return;
	}
	if (hasLocalEmbeddings(resolved.local)) return;
	for (const provider of [
		"openai",
		"gemini",
		"voyage",
		"mistral"
	]) if (hasRemoteApiKey || await hasApiKeyForProvider(provider, cfg, agentDir)) return;
	if (opts?.gatewayMemoryProbe?.checked && opts.gatewayMemoryProbe.ready) {
		note$1([
			"Memory search provider is set to \"auto\" but the API key was not found in the CLI environment.",
			"The running gateway reports memory embeddings are ready for the default agent.",
			`Verify: ${formatCliCommand("openclaw memory status --deep")}`
		].join("\n"), "Memory search");
		return;
	}
	const gatewayProbeWarning = buildGatewayProbeWarning(opts?.gatewayMemoryProbe);
	note$1([
		"Memory search is enabled, but no embedding provider is ready.",
		"Semantic recall needs at least one embedding provider.",
		gatewayProbeWarning ? gatewayProbeWarning : null,
		"",
		"Fix (pick one):",
		"- Set OPENAI_API_KEY, GEMINI_API_KEY, VOYAGE_API_KEY, or MISTRAL_API_KEY in your environment",
		`- Configure credentials: ${formatCliCommand("openclaw configure --section model")}`,
		`- For local embeddings: configure agents.defaults.memorySearch.provider and local model path`,
		`- To disable: ${formatCliCommand("openclaw config set agents.defaults.memorySearch.enabled false")}`,
		"",
		`Verify: ${formatCliCommand("openclaw memory status --deep")}`
	].join("\n"), "Memory search");
}
/**
* Check whether local embeddings are available.
*
* When `useDefaultFallback` is true (explicit `provider: "local"`), an empty
* modelPath is treated as available because the runtime falls back to
* DEFAULT_LOCAL_MODEL (an auto-downloaded HuggingFace model).
*
* When false (provider: "auto"), we only consider local available if the user
* explicitly configured a local file path — matching `canAutoSelectLocal()`
* in the runtime, which skips local for empty/hf: model paths.
*/
function hasLocalEmbeddings(local, useDefaultFallback = false) {
	const modelPath = local.modelPath?.trim() || (useDefaultFallback ? "hf:ggml-org/embeddinggemma-300m-qat-q8_0-GGUF/embeddinggemma-300m-qat-Q8_0.gguf" : void 0);
	if (!modelPath) return false;
	if (/^(hf:|https?:)/i.test(modelPath)) return true;
	const resolved = resolveUserPath(modelPath);
	try {
		return fs.statSync(resolved).isFile();
	} catch {
		return false;
	}
}
async function hasApiKeyForProvider(provider, cfg, agentDir) {
	const authProvider = provider === "gemini" ? "google" : provider;
	try {
		await resolveApiKeyForProvider({
			provider: authProvider,
			cfg,
			agentDir
		});
		return true;
	} catch {
		return false;
	}
}
function providerEnvVar(provider) {
	switch (provider) {
		case "openai": return "OPENAI_API_KEY";
		case "gemini": return "GEMINI_API_KEY";
		case "voyage": return "VOYAGE_API_KEY";
		default: return `${provider.toUpperCase()}_API_KEY`;
	}
}
function buildGatewayProbeWarning(probe) {
	if (!probe?.checked || probe.ready) return null;
	const detail = probe.error?.trim();
	return detail ? `Gateway memory probe for default agent is not ready: ${detail}` : "Gateway memory probe for default agent is not ready.";
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
	const localPassword = cfg.gateway?.auth?.password;
	const remoteToken = cfg.gateway?.remote?.token;
	const remotePassword = cfg.gateway?.remote?.password;
	return Boolean(hasConfiguredSecretInput(cfg.gateway?.auth?.token, cfg.secrets?.defaults) || hasConfiguredSecretInput(localPassword, cfg.secrets?.defaults) || hasConfiguredSecretInput(remoteToken, cfg.secrets?.defaults) || hasConfiguredSecretInput(remotePassword, cfg.secrets?.defaults));
}
async function noteMacLaunchctlGatewayEnvOverrides(cfg, deps) {
	if ((deps?.platform ?? process.platform) !== "darwin") return;
	if (!hasConfigGatewayCreds(cfg)) return;
	const getenv = deps?.getenv ?? launchctlGetenv;
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
function isTruthyEnvValue(value) {
	return typeof value === "string" && value.trim().length > 0;
}
function isTmpCompileCachePath(cachePath) {
	const normalized = cachePath.trim().replace(/\/+$/, "");
	return normalized === "/tmp" || normalized.startsWith("/tmp/") || normalized === "/private/tmp" || normalized.startsWith("/private/tmp/");
}
function noteStartupOptimizationHints(env = process.env, deps) {
	const platform = deps?.platform ?? process.platform;
	if (platform === "win32") return;
	const arch = deps?.arch ?? os.arch();
	const totalMemBytes = deps?.totalMemBytes ?? os.totalmem();
	if (!(platform === "linux" && (arch === "arm" || arch === "arm64" || platform === "linux" && totalMemBytes > 0 && totalMemBytes <= 8 * 1024 ** 3))) return;
	const noteFn = deps?.noteFn ?? note$1;
	const compileCache = env.NODE_COMPILE_CACHE?.trim() ?? "";
	const disableCompileCache = env.NODE_DISABLE_COMPILE_CACHE?.trim() ?? "";
	const noRespawn = env.OPENCLAW_NO_RESPAWN?.trim() ?? "";
	const lines = [];
	if (!compileCache) lines.push("- NODE_COMPILE_CACHE is not set; repeated CLI runs can be slower on small hosts (Pi/VM).");
	else if (isTmpCompileCachePath(compileCache)) lines.push("- NODE_COMPILE_CACHE points to /tmp; use /var/tmp so cache survives reboots and warms startup reliably.");
	if (isTruthyEnvValue(disableCompileCache)) lines.push("- NODE_DISABLE_COMPILE_CACHE is set; startup compile cache is disabled.");
	if (noRespawn !== "1") lines.push("- OPENCLAW_NO_RESPAWN is not set to 1; set it to avoid extra startup overhead from self-respawn.");
	if (lines.length === 0) return;
	const suggestions = [
		"- Suggested env for low-power hosts:",
		"  export NODE_COMPILE_CACHE=/var/tmp/openclaw-compile-cache",
		"  mkdir -p /var/tmp/openclaw-compile-cache",
		"  export OPENCLAW_NO_RESPAWN=1",
		isTruthyEnvValue(disableCompileCache) ? "  unset NODE_DISABLE_COMPILE_CACHE" : void 0
	].filter((line) => Boolean(line));
	noteFn([...lines, ...suggestions].join("\n"), "Startup optimization");
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
function resolveSandboxBackend(cfg) {
	return cfg.agents?.defaults?.sandbox?.backend?.trim() || "docker";
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
	const backend = resolveSandboxBackend(cfg);
	if (backend !== "docker") {
		if (sandbox.browser?.enabled) note$1(`Sandbox backend "${backend}" selected. Docker browser health checks are skipped; browser sandbox currently requires the docker backend.`, "Sandbox");
		return cfg;
	}
	if (!await isDockerAvailable()) {
		note$1([
			`Sandbox mode is enabled (mode: "${mode}") but Docker is not available.`,
			"Docker is required for sandbox mode to function.",
			"Isolated sessions (cron jobs, sub-agents) will fail without Docker.",
			"",
			"Options:",
			"- Install Docker and restart the gateway",
			"- Disable sandbox mode: openclaw config set agents.defaults.sandbox.mode off"
		].join("\n"), "Sandbox");
		return cfg;
	}
	let next = cfg;
	const changes = [];
	const dockerImage = resolveSandboxDockerImage(cfg);
	await handleMissingSandboxImage({
		kind: "base",
		image: dockerImage,
		buildScript: dockerImage === "openclaw-sandbox-common:bookworm-slim" ? "scripts/sandbox-common-setup.sh" : dockerImage === "openclaw-sandbox:bookworm-slim" ? "scripts/sandbox-setup.sh" : void 0,
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
function collectImplicitHeartbeatDirectPolicyWarnings(cfg) {
	const warnings = [];
	const maybeWarn = (params) => {
		const heartbeat = params.heartbeat;
		if (!heartbeat || heartbeat.target === void 0 || heartbeat.target === "none") return;
		if (heartbeat.directPolicy !== void 0) return;
		warnings.push(`- ${params.label}: heartbeat delivery is configured while ${params.pathHint} is unset.`, "  Heartbeat now allows direct/DM targets by default. Set it explicitly to \"allow\" or \"block\" to pin upgrade behavior.");
	};
	maybeWarn({
		label: "Heartbeat defaults",
		heartbeat: cfg.agents?.defaults?.heartbeat,
		pathHint: "agents.defaults.heartbeat.directPolicy"
	});
	for (const agent of cfg.agents?.list ?? []) maybeWarn({
		label: `Heartbeat agent "${agent.id}"`,
		heartbeat: agent.heartbeat,
		pathHint: `heartbeat.directPolicy for agent "${agent.id}"`
	});
	return warnings;
}
async function noteSecurityWarnings(cfg) {
	const warnings = [];
	const auditHint = `- Run: ${formatCliCommand("openclaw security audit --deep")}`;
	if (cfg.approvals?.exec?.enabled === false) warnings.push("- Note: approvals.exec.enabled=false disables approval forwarding only.", "  Host exec gating still comes from ~/.openclaw/exec-approvals.json.", `  Check local policy with: ${formatCliCommand("openclaw approvals get --gateway")}`);
	warnings.push(...collectImplicitHeartbeatDirectPolicyWarnings(cfg));
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
	const hasToken = authToken.length > 0 || hasConfiguredSecretInput(cfg.gateway?.auth?.token, cfg.secrets?.defaults);
	const hasPassword = authPassword.length > 0 || hasConfiguredSecretInput(cfg.gateway?.auth?.password, cfg.secrets?.defaults);
	const hasSharedSecret = resolvedAuth.mode === "token" && hasToken || resolvedAuth.mode === "password" && hasPassword;
	const bindDescriptor = `"${gatewayBind}" (${resolvedBindHost})`;
	const saferRemoteAccessLines = [
		"  Safer remote access: keep bind loopback and use Tailscale Serve/Funnel or an SSH tunnel.",
		"  Example tunnel: ssh -N -L 18789:127.0.0.1:18789 user@gateway-host",
		"  Docs: https://docs.openclaw.ai/gateway/remote"
	];
	if (isExposed) if (!hasSharedSecret) {
		const authFixLines = resolvedAuth.mode === "password" ? [`  Fix: ${formatCliCommand("openclaw configure")} to set a password`, `  Or switch to token: ${formatCliCommand("openclaw config set gateway.auth.mode token")}`] : [`  Fix: ${formatCliCommand("openclaw doctor --fix")} to generate a token`, `  Or set token directly: ${formatCliCommand("openclaw config set gateway.auth.mode token")}`];
		warnings.push(`- CRITICAL: Gateway bound to ${bindDescriptor} without authentication.`, `  Anyone on your network (or internet if port-forwarded) can fully control your agent.`, `  Fix: ${formatCliCommand("openclaw config set gateway.bind loopback")}`, ...saferRemoteAccessLines, ...authFixLines);
	} else warnings.push(`- WARNING: Gateway bound to ${bindDescriptor} (network-accessible).`, `  Ensure your auth credentials are strong and not exposed.`, ...saferRemoteAccessLines);
	const warnDmPolicy = async (params) => {
		const dmPolicy = params.dmPolicy;
		const policyPath = params.policyPath ?? `${params.allowFromPath}policy`;
		const { hasWildcard, allowCount, isMultiUserDm } = await resolveDmAllowState({
			provider: params.provider,
			accountId: params.accountId,
			allowFrom: params.allowFrom,
			normalizeEntry: params.normalizeEntry
		});
		const dmScope = cfg.session?.dmScope ?? "main";
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
		const { defaultAccountId, account, enabled, configured, diagnostics } = await resolveDefaultChannelAccountContext(plugin, cfg, {
			mode: "read_only",
			commandName: "doctor"
		});
		for (const diagnostic of diagnostics) warnings.push(`- [secrets] ${diagnostic}`);
		if (!enabled) continue;
		if (!configured) continue;
		const dmPolicy = plugin.security.resolveDmPolicy?.({
			cfg,
			accountId: defaultAccountId,
			account
		});
		if (dmPolicy) await warnDmPolicy({
			label: plugin.meta.label ?? plugin.id,
			provider: plugin.id,
			accountId: defaultAccountId,
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
//#region src/commands/doctor-session-locks.ts
const DEFAULT_STALE_MS = 1800 * 1e3;
function formatAge(ageMs) {
	if (ageMs === null) return "unknown";
	const seconds = Math.floor(ageMs / 1e3);
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	if (minutes < 60) return `${minutes}m${remainingSeconds}s`;
	return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
}
function formatLockLine(lock) {
	const pidStatus = lock.pid === null ? "pid=missing" : `pid=${lock.pid} (${lock.pidAlive ? "alive" : "dead"})`;
	const ageStatus = `age=${formatAge(lock.ageMs)}`;
	const staleStatus = lock.stale ? `stale=yes (${lock.staleReasons.join(", ") || "unknown"})` : "stale=no";
	const removedStatus = lock.removed ? " [removed]" : "";
	return `- ${shortenHomePath(lock.lockPath)} ${pidStatus} ${ageStatus} ${staleStatus}${removedStatus}`;
}
async function noteSessionLockHealth(params) {
	const shouldRepair = params?.shouldRepair === true;
	const staleMs = params?.staleMs ?? DEFAULT_STALE_MS;
	let sessionDirs = [];
	try {
		sessionDirs = await resolveAgentSessionDirs(resolveStateDir(process.env));
	} catch (err) {
		note$1(`- Failed to inspect session lock files: ${String(err)}`, "Session locks");
		return;
	}
	if (sessionDirs.length === 0) return;
	const allLocks = [];
	for (const sessionsDir of sessionDirs) {
		const result = await cleanStaleLockFiles({
			sessionsDir,
			staleMs,
			removeStale: shouldRepair
		});
		allLocks.push(...result.locks);
	}
	if (allLocks.length === 0) return;
	const staleCount = allLocks.filter((lock) => lock.stale).length;
	const removedCount = allLocks.filter((lock) => lock.removed).length;
	const lines = [`- Found ${allLocks.length} session lock file${allLocks.length === 1 ? "" : "s"}.`, ...allLocks.toSorted((a, b) => a.lockPath.localeCompare(b.lockPath)).map(formatLockLine)];
	if (staleCount > 0 && !shouldRepair) {
		lines.push(`- ${staleCount} lock file${staleCount === 1 ? " is" : "s are"} stale.`);
		lines.push("- Run \"openclaw doctor --fix\" to remove stale lock files automatically.");
	}
	if (shouldRepair && removedCount > 0) lines.push(`- Removed ${removedCount} stale session lock file${removedCount === 1 ? "" : "s"}.`);
	note$1(lines.join("\n"), "Session locks");
}
//#endregion
//#region src/commands/doctor-state-integrity.ts
function countLabel(count, singular, plural = `${singular}s`) {
	return `${count} ${count === 1 ? singular : plural}`;
}
function formatFilePreview(paths, limit = 3) {
	const names = paths.slice(0, limit).map((filePath) => path.basename(filePath));
	const remaining = paths.length - names.length;
	if (remaining > 0) return `${names.join(", ")}, and ${remaining} more`;
	return names.join(", ");
}
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
function isPathUnderRoot(targetPath, rootPath) {
	const normalizedTarget = path.resolve(targetPath);
	const normalizedRoot = path.resolve(rootPath);
	const rootToken = path.parse(normalizedRoot).root;
	if (normalizedRoot === rootToken) return normalizedTarget.startsWith(rootToken);
	return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${path.sep}`);
}
function tryResolveRealPath(targetPath) {
	try {
		return fs.realpathSync(targetPath);
	} catch {
		return null;
	}
}
function decodeMountInfoPath(value) {
	return value.replace(/\\([0-7]{3})/g, (_, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
}
function escapeControlCharsForTerminal(value) {
	let escaped = "";
	for (const char of value) {
		if (char === "\x1B") {
			escaped += "\\x1b";
			continue;
		}
		if (char === "\r") {
			escaped += "\\r";
			continue;
		}
		if (char === "\n") {
			escaped += "\\n";
			continue;
		}
		if (char === "	") {
			escaped += "\\t";
			continue;
		}
		const code = char.charCodeAt(0);
		if (code >= 0 && code <= 8 || code === 11 || code === 12 || code >= 14 && code <= 31) {
			escaped += `\\x${code.toString(16).padStart(2, "0")}`;
			continue;
		}
		if (code === 127) {
			escaped += "\\x7f";
			continue;
		}
		escaped += char;
	}
	return escaped;
}
function parseLinuxMountInfo(rawMountInfo) {
	const entries = [];
	for (const line of rawMountInfo.split("\n")) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		const separatorIndex = trimmed.indexOf(" - ");
		if (separatorIndex === -1) continue;
		const left = trimmed.slice(0, separatorIndex);
		const right = trimmed.slice(separatorIndex + 3);
		const leftFields = left.split(" ");
		const rightFields = right.split(" ");
		if (leftFields.length < 5 || rightFields.length < 2) continue;
		entries.push({
			mountPoint: decodeMountInfoPath(leftFields[4]),
			fsType: rightFields[0],
			source: decodeMountInfoPath(rightFields[1])
		});
	}
	return entries;
}
function isPathUnderRootWithPathOps(targetPath, rootPath, pathOps) {
	const normalizedTarget = pathOps.resolve(targetPath);
	const normalizedRoot = pathOps.resolve(rootPath);
	const rootToken = pathOps.parse(normalizedRoot).root;
	if (normalizedRoot === rootToken) return normalizedTarget.startsWith(rootToken);
	return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}${pathOps.sep}`);
}
function findLinuxMountInfoEntryForPath(targetPath, entries, pathOps) {
	const normalizedTarget = pathOps.resolve(targetPath);
	let bestMatch = null;
	for (const entry of entries) {
		if (!isPathUnderRootWithPathOps(normalizedTarget, entry.mountPoint, pathOps)) continue;
		if (!bestMatch || pathOps.resolve(entry.mountPoint).length > pathOps.resolve(bestMatch.mountPoint).length) bestMatch = entry;
	}
	return bestMatch;
}
function isMmcDevicePath(devicePath, pathOps) {
	const name = pathOps.basename(devicePath);
	return /^mmcblk\d+(?:p\d+)?$/.test(name);
}
function tryReadLinuxMountInfo() {
	try {
		return fs.readFileSync("/proc/self/mountinfo", "utf8");
	} catch {
		return null;
	}
}
function detectLinuxSdBackedStateDir(stateDir, deps) {
	if ((deps?.platform ?? process.platform) !== "linux") return null;
	const linuxPath = path.posix;
	const resolvedStatePath = (deps?.resolveRealPath ?? tryResolveRealPath)(stateDir) ?? linuxPath.resolve(stateDir);
	const mountInfo = deps?.mountInfo ?? tryReadLinuxMountInfo();
	if (!mountInfo) return null;
	const mountEntry = findLinuxMountInfoEntryForPath(resolvedStatePath, parseLinuxMountInfo(mountInfo), linuxPath);
	if (!mountEntry) return null;
	const sourceCandidates = [mountEntry.source];
	if (mountEntry.source.startsWith("/dev/")) {
		const resolvedDevicePath = (deps?.resolveDeviceRealPath ?? tryResolveRealPath)(mountEntry.source);
		if (resolvedDevicePath) sourceCandidates.push(linuxPath.resolve(resolvedDevicePath));
	}
	if (!sourceCandidates.some((candidate) => isMmcDevicePath(candidate, linuxPath))) return null;
	return {
		path: linuxPath.resolve(resolvedStatePath),
		mountPoint: linuxPath.resolve(mountEntry.mountPoint),
		fsType: mountEntry.fsType,
		source: mountEntry.source
	};
}
function formatLinuxSdBackedStateDirWarning(displayStateDir, linuxSdBackedStateDir) {
	const displayMountPoint = linuxSdBackedStateDir.mountPoint === "/" ? "/" : shortenHomePath(linuxSdBackedStateDir.mountPoint);
	return [
		`- State directory appears to be on SD/eMMC storage (${displayStateDir}; device ${escapeControlCharsForTerminal(linuxSdBackedStateDir.source)}, fs ${escapeControlCharsForTerminal(linuxSdBackedStateDir.fsType)}, mount ${escapeControlCharsForTerminal(displayMountPoint)}).`,
		"- SD/eMMC media can be slower for random I/O and wear faster under session/log churn.",
		"- For better startup and state durability, prefer SSD/NVMe (or USB SSD on Raspberry Pi) for OPENCLAW_STATE_DIR."
	].join("\n");
}
function detectMacCloudSyncedStateDir(stateDir, deps) {
	if ((deps?.platform ?? process.platform) !== "darwin") return null;
	const homedir = deps?.homedir ?? os.homedir();
	const roots = [{
		storage: "iCloud Drive",
		root: path.join(homedir, "Library", "Mobile Documents", "com~apple~CloudDocs")
	}, {
		storage: "CloudStorage provider",
		root: path.join(homedir, "Library", "CloudStorage")
	}];
	const realPath = (deps?.resolveRealPath ?? tryResolveRealPath)(stateDir);
	const candidates = realPath ? [path.resolve(realPath)] : [path.resolve(stateDir)];
	for (const candidate of candidates) for (const { storage, root } of roots) if (isPathUnderRoot(candidate, root)) return {
		path: candidate,
		storage
	};
	return null;
}
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
function isPairingPolicy(value) {
	return typeof value === "string" && value.trim().toLowerCase() === "pairing";
}
function hasPairingPolicy(value) {
	if (!isRecord(value)) return false;
	if (isPairingPolicy(value.dmPolicy)) return true;
	if (isRecord(value.dm) && isPairingPolicy(value.dm.policy)) return true;
	if (!isRecord(value.accounts)) return false;
	for (const accountCfg of Object.values(value.accounts)) if (hasPairingPolicy(accountCfg)) return true;
	return false;
}
function isSlashRoutingSessionKey(sessionKey) {
	const raw = sessionKey.trim().toLowerCase();
	if (!raw) return false;
	const scoped = parseAgentSessionKey(raw)?.rest ?? raw;
	return /^[^:]+:slash:[^:]+(?:$|:)/.test(scoped);
}
function shouldRequireOAuthDir(cfg, env) {
	if (env.OPENCLAW_OAUTH_DIR?.trim()) return true;
	const channels = cfg.channels;
	if (!isRecord(channels)) return false;
	if (isRecord(channels.whatsapp)) return true;
	for (const [channelId, channelCfg] of Object.entries(channels)) {
		if (channelId === "defaults" || channelId === "modelByChannel") continue;
		if (hasPairingPolicy(channelCfg)) return true;
	}
	return false;
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
	const absoluteStorePath = path.resolve(storePath);
	const displayStateDir = shortenHomePath(stateDir);
	const displayOauthDir = shortenHomePath(oauthDir);
	const displaySessionsDir = shortenHomePath(sessionsDir);
	const displayStoreDir = shortenHomePath(storeDir);
	const displayConfigPath = configPath ? shortenHomePath(configPath) : void 0;
	const requireOAuthDir = shouldRequireOAuthDir(cfg, env);
	const cloudSyncedStateDir = detectMacCloudSyncedStateDir(stateDir);
	const linuxSdBackedStateDir = detectLinuxSdBackedStateDir(stateDir);
	if (cloudSyncedStateDir) warnings.push([
		`- State directory is under macOS cloud-synced storage (${displayStateDir}; ${cloudSyncedStateDir.storage}).`,
		"- This can cause slow I/O and sync/lock races for sessions and credentials.",
		"- Prefer a local non-synced state dir (for example: ~/.openclaw).",
		`  Set locally: OPENCLAW_STATE_DIR=~/.openclaw ${formatCliCommand("openclaw doctor")}`
	].join("\n"));
	if (linuxSdBackedStateDir) warnings.push(formatLinuxSdBackedStateDirWarning(displayStateDir, linuxSdBackedStateDir));
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
		const dirLstat = fs.lstatSync(stateDir);
		const isDirSymlink = dirLstat.isSymbolicLink();
		const stat = isDirSymlink ? fs.statSync(stateDir) : dirLstat;
		if (!(isDirSymlink ? fs.realpathSync(stateDir) : stateDir).startsWith("/nix/store/") && (stat.mode & 63) !== 0) {
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
		const configLstat = fs.lstatSync(configPath);
		const isSymlink = configLstat.isSymbolicLink();
		const stat = isSymlink ? fs.statSync(configPath) : configLstat;
		if (!(isSymlink ? fs.realpathSync(configPath) : configPath).startsWith("/nix/store/") && (stat.mode & 63) !== 0) {
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
		if (requireOAuthDir) dirCandidates.set(oauthDir, "OAuth dir");
		else if (!existsDir(oauthDir)) warnings.push(`- OAuth dir not present (${displayOauthDir}). Skipping create because no WhatsApp/pairing channel config is active.`);
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
	const sessionPathOpts = resolveSessionFilePathOptions({
		agentId,
		storePath
	});
	const entries = Object.entries(store).filter(([, entry]) => entry && typeof entry === "object");
	if (entries.length > 0) {
		const recentTranscriptCandidates = entries.slice().toSorted((a, b) => {
			const aUpdated = typeof a[1].updatedAt === "number" ? a[1].updatedAt : 0;
			return (typeof b[1].updatedAt === "number" ? b[1].updatedAt : 0) - aUpdated;
		}).slice(0, 5).filter(([key]) => !isSlashRoutingSessionKey(key));
		const missing = recentTranscriptCandidates.filter(([, entry]) => {
			const sessionId = entry.sessionId;
			if (!sessionId) return false;
			return !existsFile(resolveSessionFilePath(sessionId, entry, sessionPathOpts));
		});
		if (missing.length > 0) warnings.push([
			`- ${missing.length}/${recentTranscriptCandidates.length} recent sessions are missing transcripts.`,
			`  Verify sessions in store: ${formatCliCommand(`openclaw sessions --store "${absoluteStorePath}"`)}`,
			`  Preview cleanup impact: ${formatCliCommand(`openclaw sessions cleanup --store "${absoluteStorePath}" --dry-run`)}`,
			`  Prune missing entries: ${formatCliCommand(`openclaw sessions cleanup --store "${absoluteStorePath}" --enforce --fix-missing`)}`
		].join("\n"));
		const mainEntry = store[resolveMainSessionKey(cfg)];
		if (mainEntry?.sessionId) {
			const transcriptPath = resolveSessionFilePath(mainEntry.sessionId, mainEntry, sessionPathOpts);
			if (!existsFile(transcriptPath)) warnings.push(`- Main session transcript missing (${shortenHomePath(transcriptPath)}). History will appear to reset.`);
			else {
				const lineCount = countJsonlLines(transcriptPath);
				if (lineCount <= 1) warnings.push(`- Main session transcript has only ${lineCount} line. Session history may not be appending.`);
			}
		}
	}
	if (existsDir(sessionsDir)) {
		const referencedTranscriptPaths = /* @__PURE__ */ new Set();
		for (const [, entry] of entries) {
			if (!entry?.sessionId) continue;
			try {
				referencedTranscriptPaths.add(path.resolve(resolveSessionFilePath(entry.sessionId, entry, sessionPathOpts)));
			} catch {}
		}
		const orphanTranscriptPaths = fs.readdirSync(sessionsDir, { withFileTypes: true }).filter((entry) => entry.isFile() && isPrimarySessionTranscriptFileName(entry.name)).map((entry) => path.resolve(path.join(sessionsDir, entry.name))).filter((filePath) => !referencedTranscriptPaths.has(filePath));
		if (orphanTranscriptPaths.length > 0) {
			const orphanCount = countLabel(orphanTranscriptPaths.length, "orphan transcript file");
			const orphanPreview = formatFilePreview(orphanTranscriptPaths);
			warnings.push([
				`- Found ${orphanCount} in ${displaySessionsDir}.`,
				"  These .jsonl files are no longer referenced by sessions.json, so they are not part of any active session history.",
				"  Doctor can archive them safely by renaming each file to *.deleted.<timestamp>.",
				`  Examples: ${orphanPreview}`
			].join("\n"));
			if (await prompter.confirmSkipInNonInteractive({
				message: `Archive ${orphanCount} in ${displaySessionsDir}? This only renames them to *.deleted.<timestamp>.`,
				initialValue: false
			})) {
				let archived = 0;
				const archivedAt = formatSessionArchiveTimestamp();
				for (const orphanPath of orphanTranscriptPaths) {
					const archivedPath = `${orphanPath}.deleted.${archivedAt}`;
					try {
						fs.renameSync(orphanPath, archivedPath);
						archived += 1;
					} catch (err) {
						warnings.push(`- Failed to archive orphan transcript ${shortenHomePath(orphanPath)}: ${String(err)}`);
					}
				}
				if (archived > 0) changes.push(`- Archived ${countLabel(archived, "orphan transcript file")} in ${displaySessionsDir} as .deleted timestamped backups.`);
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
		const [schemaStats, uiStats] = await Promise.all([fs$1.stat(schemaPath).catch(() => null), fs$1.stat(uiIndexPath).catch(() => null)]);
		if (schemaStats && !uiStats) {
			note$1(["- Control UI assets are missing.", "- Run: pnpm ui:build"].join("\n"), "UI");
			const uiSourcesPath = path.join(root, "ui/package.json");
			if (!await fs$1.stat(uiSourcesPath).catch(() => null)) {
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
					if (!await fs$1.stat(uiSourcesPath).catch(() => null)) {
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
	if (!(!isTruthyEnvValue$1(process.env.OPENCLAW_UPDATE_IN_PROGRESS) && params.options.nonInteractive !== true && params.options.yes !== true && params.options.repair !== true && Boolean(process.stdin.isTTY)) || !params.root) return { updated: false };
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
		const lines = [
			`Loaded: ${loaded.length}`,
			`Disabled: ${disabled.length}`,
			`Errors: ${errored.length}`,
			errored.length > 0 ? `- ${errored.slice(0, 10).map((p) => p.id).join("\n- ")}${errored.length > 10 ? "\n- ..." : ""}` : null
		].filter((line) => Boolean(line));
		const bundlePlugins = loaded.filter((p) => p.format === "bundle" && (p.bundleCapabilities?.length ?? 0) > 0);
		if (bundlePlugins.length > 0) {
			const allCaps = new Set(bundlePlugins.flatMap((p) => p.bundleCapabilities ?? []));
			lines.push(`Bundle plugins: ${bundlePlugins.length} (${[...allCaps].toSorted().join(", ")})`);
		}
		note$1(lines.join("\n"), "Plugins");
	}
	const compatibilityWarnings = buildPluginCompatibilityWarnings({
		config: cfg,
		workspaceDir,
		report: {
			workspaceDir,
			...pluginRegistry
		}
	});
	if (compatibilityWarnings.length > 0) note$1(compatibilityWarnings.map((line) => `- ${line}`).join("\n"), "Plugin compatibility");
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
	noteStartupOptimizationHints();
	const configResult = await loadAndMaybeMigrateDoctorConfig({
		options,
		confirm: (p) => prompter.confirm(p)
	});
	let cfg = configResult.cfg;
	const cfgForPersistence = structuredClone(cfg);
	const sourceConfigValid = configResult.sourceConfigValid ?? true;
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
	if (resolveMode(cfg) === "local" && hasAmbiguousGatewayAuthModeConfig(cfg)) note$1([
		"gateway.auth.token and gateway.auth.password are both configured while gateway.auth.mode is unset.",
		"Set an explicit mode to avoid ambiguous auth selection and startup/runtime failures.",
		`Set token mode: ${formatCliCommand("openclaw config set gateway.auth.mode token")}`,
		`Set password mode: ${formatCliCommand("openclaw config set gateway.auth.mode password")}`
	].join("\n"), "Gateway auth");
	cfg = await maybeRepairAnthropicOAuthProfileId(cfg, prompter);
	cfg = await maybeRemoveDeprecatedCliAuthProfiles(cfg, prompter);
	await noteAuthProfileHealth({
		cfg,
		prompter,
		allowKeychainPrompt: options.nonInteractive !== true && Boolean(process.stdin.isTTY)
	});
	const gatewayDetails = buildGatewayConnectionDetails({ config: cfg });
	if (gatewayDetails.remoteFallbackNote) note$1(gatewayDetails.remoteFallbackNote, "Gateway");
	if (resolveMode(cfg) === "local" && sourceConfigValid) {
		const gatewayTokenRef = resolveSecretInputRef({
			value: cfg.gateway?.auth?.token,
			defaults: cfg.secrets?.defaults
		}).ref;
		const auth = resolveGatewayAuth({
			authConfig: cfg.gateway?.auth,
			tailscaleMode: cfg.gateway?.tailscale?.mode ?? "off"
		});
		if (auth.mode !== "password" && (auth.mode !== "token" || !auth.token)) if (gatewayTokenRef) note$1([
			"Gateway token is managed via SecretRef and is currently unavailable.",
			"Doctor will not overwrite gateway.auth.token with a plaintext value.",
			"Resolve/rotate the external secret source, then rerun doctor."
		].join("\n"), "Gateway auth");
		else {
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
	await noteSessionLockHealth({ shouldRepair: prompter.shouldRepair });
	await maybeRepairLegacyCronStore({
		cfg,
		options,
		prompter
	});
	cfg = await maybeRepairSandboxImages(cfg, runtime, prompter);
	noteSandboxScopeWarnings(cfg);
	await maybeScanExtraGatewayServices(options, runtime, prompter);
	await maybeRepairGatewayServiceConfig(cfg, resolveMode(cfg), runtime, prompter);
	await noteMacLaunchAgentOverrides();
	await noteMacLaunchctlGatewayEnvOverrides(cfg);
	if (prompter.shouldRepair) await runStartupMatrixMigration({
		cfg,
		env: process.env,
		log: {
			info: (message) => runtime.log(message),
			warn: (message) => runtime.error(message)
		},
		trigger: "doctor-fix",
		logPrefix: "doctor"
	});
	await noteSecurityWarnings(cfg);
	await noteChromeMcpBrowserReadiness(cfg);
	await noteOpenAIOAuthTlsPrerequisites({
		cfg,
		deep: options.deep === true
	});
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
	await noteBootstrapFileSize(cfg);
	await doctorShellCompletion(runtime, prompter, { nonInteractive: options.nonInteractive });
	const { healthOk } = await checkGatewayHealth({
		runtime,
		cfg,
		timeoutMs: options.nonInteractive === true ? 3e3 : 1e4
	});
	const gatewayMemoryProbe = healthOk ? await probeGatewayMemoryStatus({
		cfg,
		timeoutMs: options.nonInteractive === true ? 3e3 : 1e4
	}) : {
		checked: false,
		ready: false
	};
	await noteMemorySearchHealth(cfg, { gatewayMemoryProbe });
	await maybeRepairGatewayDaemon({
		cfg,
		runtime,
		prompter,
		options,
		gatewayDetailsMessage: gatewayDetails.message,
		healthOk
	});
	if (configResult.shouldWriteConfig || JSON.stringify(cfg) !== JSON.stringify(cfgForPersistence)) {
		cfg = applyWizardMetadata(cfg, {
			command: "doctor",
			mode: resolveMode(cfg)
		});
		await writeConfigFile(cfg);
		logConfigUpdated(runtime);
		const backupPath = `${CONFIG_PATH}.bak`;
		if (fs.existsSync(backupPath)) runtime.log(`Backup: ${shortenHomePath(backupPath)}`);
	} else if (!prompter.shouldRepair) runtime.log(`Run "${formatCliCommand("openclaw doctor --fix")}" to apply changes.`);
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
//#region src/terminal/prompt-select-styled.ts
function selectStyled(params) {
	return select({
		...params,
		message: stylePromptMessage(params.message),
		options: params.options.map((opt) => opt.hint === void 0 ? opt : {
			...opt,
			hint: stylePromptHint(opt.hint)
		})
	});
}
//#endregion
export { doctorCommand as n, selectStyled as t };
