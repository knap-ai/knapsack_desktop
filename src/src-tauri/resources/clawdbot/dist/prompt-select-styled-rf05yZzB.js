import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { d as readStringValue, f as resolvePrimaryStringValue, i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { o as getResolvedLoggerSettings } from "./logger-D8OnBgBc.js";
import { o as resolveRequiredHomeDir } from "./home-dir-BEqRdfoa.js";
import { n as resolveOpenClawPackageRootSync, t as resolveOpenClawPackageRoot } from "./openclaw-root-BNWw3cXT.js";
import { _ as shortenHomePath, l as isRecord, m as resolveUserPath, v as sleep } from "./utils-D5DtWkEu.js";
import { r as normalizeChatChannelId } from "./ids-CYPyP4SY.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as sanitizeForLog } from "./ansi-Bs_ZZlnS.js";
import { t as isTruthyEnvValue$1 } from "./env-BiSxzotM.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { _ as resolveStateDir, d as resolveIsNixMode, h as resolveOAuthDir, t as CONFIG_PATH, u as resolveGatewayPort } from "./paths-Dvv9VRAc.js";
import { d as resolveGatewayLaunchAgentLabel, g as resolveNodeLaunchAgentLabel, m as resolveGatewayWindowsTaskName, p as resolveGatewaySystemdServiceName } from "./paths-icbGFVZa.js";
import { a as resolveSystemNodeInfo, r as renderSystemNodeWarning } from "./runtime-paths-DQUs5pyV.js";
import { n as buildGatewayInstallPlan, r as gatewayInstallErrorHint, t as resolveGatewayInstallToken } from "./gateway-install-token-BelEbFnC.js";
import { n as GATEWAY_DAEMON_RUNTIME_OPTIONS, t as DEFAULT_GATEWAY_DAEMON_RUNTIME } from "./daemon-runtime-CniEQXCk.js";
import { a as hasConfiguredSecretInput, d as resolveSecretInputRef } from "./types.secrets-CeL3gSMO.js";
import { n as hasAmbiguousGatewayAuthModeConfig } from "./auth-mode-policy-CMqSiMvK.js";
import { i as runExec, r as runCommandWithTimeout } from "./exec-BAdwyfxI.js";
import { t as resolveGatewayAuthToken } from "./auth-token-resolution-C3FhTQ9M.js";
import { a as isLoopbackHost, m as resolveGatewayBindHost } from "./net-lBInRHnX.js";
import { o as resolveGatewayAuth } from "./auth-DN1PwXy9.js";
import { l as normalizeTrimmedStringList, s as normalizeStringEntries } from "./string-normalization-xm3f27dv.js";
import { i as listBundledChannelPluginIds } from "./bootstrap-registry-BI6Zdzz5.js";
import { n as getBundledChannelPlugin } from "./bundled-CGMeVzvo.js";
import { B as normalizeLegacyBrowserConfig, G as seedMissingDefaultAccountsFromSingleAccountBase, H as normalizeLegacyMediaProviderOptions, K as normalizeLegacyTalkConfig, R as findLegacyConfigIssues, S as validateConfigObjectWithPlugins, U as normalizeLegacyMistralModelMaxTokens, V as normalizeLegacyCrossContextMessageConfig, W as normalizeLegacyNanoBananaSkill, at as listPluginDoctorLegacyConfigRules, g as writeConfigFile, it as collectRelevantDoctorPluginIds, l as readConfigFileSnapshot, nt as migrateLegacyWebSearchConfig, rt as migrateLegacyXSearchConfig, tt as applyLegacyDoctorMigrations, z as migrateLegacyWebFetchConfig } from "./io-5pxHCi7V.js";
import { t as asNullableObjectRecord } from "./record-coerce-Bls3blVy.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import { c as normalizeAgentId, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { n as normalizeAccountId, r as normalizeOptionalAccountId } from "./account-id-j7GeQlaZ.js";
import { a as normalizeAnyChannelId } from "./registry-CENZffQG.js";
import { r as listChannelPlugins, t as getChannelPlugin } from "./registry-Delpa74L.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { b as resolveExecutablePath, i as normalizeTrustedSafeBinDirs, n as isTrustedSafeBinPath, o as listRiskyConfiguredSafeBins, p as resolveCommandResolutionFromArgv, t as getTrustedSafeBinDirs } from "./exec-safe-bin-trust-BcrCYHRC.js";
import { t as DEFAULT_AGENTS_FILENAME } from "./workspace-hhTlRYqM.js";
import { b as resolveAgentWorkspaceDir, h as listAgentEntries, x as resolveDefaultAgentId, y as resolveAgentDir } from "./agent-scope-KFH9bkHi.js";
import { a as normalizePluginsConfig, i as normalizePluginId, s as resolveEffectivePluginActivationState } from "./config-state-CcN3bZ9D.js";
import { t as randomToken } from "./random-token-DhBIuVPJ.js";
import { i as launchAgentPlistExists, n as isLaunchAgentListed, r as isLaunchAgentLoaded, s as repairLaunchAgentBootstrap } from "./launchd-Bk3hz4bn.js";
import { a as inspectPortUsage, s as formatPortDiagnostics } from "./ports-BQYvWPfn.js";
import { d as uninstallLegacySystemdUnits, i as isSystemdUserServiceAvailable, p as classifySystemdUnavailableDetail } from "./systemd-D3GGnU7N.js";
import { r as resolveGatewayService, t as describeGatewayServiceRestart } from "./service-DkbTemHA.js";
import { i as resolveDaemonContainerContext, r as formatRuntimeStatus, t as buildPlatformRuntimeLogHints } from "./runtime-hints-DEgPTkWK.js";
import "./config-Q9XZc_2I.js";
import { n as parseToolsBySenderTypedKey } from "./types.tools-CdFillif.js";
import { n as safeParseWithSchema, t as safeParseJsonWithSchema } from "./zod-parse-EztZP0fF.js";
import { n as formatConfigIssueLines } from "./issue-format-EKtDEAmx.js";
import { a as readEmbeddedGatewayToken, i as needsNodeRuntimeMigration, n as auditGatewayServiceConfig, t as SERVICE_AUDIT_CODES } from "./service-audit-d0NCH3ky.js";
import { n as renderSystemdUnavailableHints, t as isSystemdUnavailableDetail } from "./systemd-hints-S_Oulqnm.js";
import { r as isWSLEnv, t as isWSL } from "./wsl-DlWsqZ4r.js";
import { t as readLastGatewayErrorLine } from "./diagnostics-Demi8maG.js";
import { n as findExtraGatewayServices, r as renderGatewayServiceCleanupHints } from "./inspect-BvKVcir1.js";
import { u as resolveAuthStorePathForDisplay } from "./source-check-D7Bxh6-e.js";
import { h as readClaudeCliCredentialsCached, n as ensureAuthProfileStore, y as CLAUDE_CLI_PROFILE_ID } from "./store-C1I9Mkh8.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-BbVfCcz-.js";
import { t as hasBundledChannelPersistedAuthState } from "./persisted-auth-state-BkBSoJRA.js";
import { n as listPotentialConfiguredChannelIds } from "./config-presence-B8rnssE9.js";
import { i as runPluginSetupConfigMigrations } from "./setup-registry-ytDuF5P6.js";
import "./plugins-D4ODSIPT.js";
import "./logging-DW_bR-rY.js";
import { n as resolvePluginProviders } from "./providers.runtime-Qry7Vql_.js";
import { a as getModelRefStatus, d as resolveConfiguredModelRef, p as resolveHooksGmailModel } from "./model-selection-CTdyYoio.js";
import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
import { r as loadModelCatalog } from "./model-catalog-CdCqmHkW.js";
import { n as isPrimarySessionTranscriptFileName, t as formatSessionArchiveTimestamp } from "./artifacts-SZgUWH-P.js";
import { i as resolveMainSessionKey } from "./main-session-DtefsIzj.js";
import "./sessions-vP2E4vs-.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath, l as resolveSessionTranscriptsDirForAgent, u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { n as cleanStaleLockFiles } from "./session-write-lock-CcI4KSH8.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { i as resolveAgentSessionDirs } from "./targets-Cxfatkj9.js";
import { n as buildBootstrapInjectionStats, t as analyzeBootstrapBudget } from "./bootstrap-budget-BfULAZ3v.js";
import { i as resolveBootstrapContextForRun } from "./bootstrap-files-ZYTN7n8L.js";
import { g as resolveBootstrapMaxChars, v as resolveBootstrapTotalMaxChars } from "./pi-embedded-helpers-6UMMUO8y.js";
import { n as classifyOAuthRefreshFailure, t as buildOAuthRefreshFailureLoginCommand } from "./oauth-refresh-failure-CdIusR4x.js";
import { l as DEFAULT_SANDBOX_IMAGE, r as resolveSandboxScope, s as DEFAULT_SANDBOX_BROWSER_IMAGE } from "./config-CWqq9_ZP.js";
import { n as formatAuthDoctorHint, t as resolveApiKeyForProfile } from "./auth-profiles-BQEgLpFI.js";
import { d as resolveProfileUnusableUntilForDisplay } from "./order-t2w38pFY.js";
import { t as repairOAuthProfileIdMismatch } from "./repair-taA0zK8p.js";
import { s as resolveApiKeyForProvider } from "./model-auth-KKLbMBGv.js";
import { n as buildGatewayConnectionDetails, r as callGateway } from "./call-BA3do6C0.js";
import { l as loadExecApprovals } from "./exec-approvals-DqhUu-iS.js";
import { i as resolveMergedSafeBinProfileFixtures, n as listInterpreterLikeSafeBins } from "./exec-safe-bin-runtime-policy-BO46C_Es.js";
import { i as TrimmedNonEmptyStringFieldSchema, n as LowercaseNonEmptyStringFieldSchema, o as parseOptionalField, t as DeliveryThreadIdFieldSchema } from "./delivery-field-schemas-Bi2cRKQQ.js";
import { i as parseAbsoluteTimeMs, r as resolveDefaultCronStaggerMs, t as normalizeCronStaggerMs } from "./stagger-BQdF8pte.js";
import { t as inferLegacyName } from "./normalize-dgYtEWCT.js";
import { i as listRouteBindings } from "./bindings-Kvx6Ox1-.js";
import { N as listTaskFlowRecords, d as listTasksForFlowId } from "./task-registry-BO2EMqj7.js";
import "./runtime-internal-tfNsv16F.js";
import "./sandbox-BBeXIB2_.js";
import { n as getActiveMemorySearchManager, r as resolveActiveMemoryBackendConfig } from "./memory-runtime-CiqkZxJP.js";
import { t as resolveMemorySearchConfig } from "./memory-search-ABYPOqC9.js";
import { n as formatSetExplicitDefaultInstruction, r as formatSetExplicitDefaultToConfiguredInstruction, t as formatChannelAccountsDefaultPath } from "./default-account-warnings-gr-Iy1gC.js";
import { a as readChannelAllowFromStore } from "./pairing-store-C_d7unmE.js";
import { r as resolveDmAllowState } from "./dm-policy-shared-B7IvP1oD.js";
import { n as stylePromptMessage, r as stylePromptTitle, t as stylePromptHint } from "./prompt-style-BRivICXb.js";
import { t as note$1 } from "./note-BuYL4ixE.js";
import { n as logConfigUpdated } from "./logging-BN952JN5.js";
import { n as resolveCronStorePath, r as saveCronStore, t as loadCronStore } from "./store-D3Z4dh89.js";
import { c as repairShortTermPromotionArtifacts, i as getBuiltinMemoryEmbeddingProviderDoctorMetadata, n as auditDreamingArtifacts, o as listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata, r as auditShortTermPromotionArtifacts, s as repairDreamingArtifacts } from "./memory-core-engine-runtime-DKIylQag.js";
import { t as resolveMemoryBackendConfig } from "./backend-config-DAthUrjH.js";
import "./engine-embeddings-Bk3B82BS.js";
import { t as hasConfiguredMemorySecretInput } from "./secret-input-BrirjS7F.js";
import { t as checkQmdBinaryAvailability } from "./engine-qmd-D2OISTWu.js";
import "./engine-storage-sMrofp-k.js";
import "./secret-D01YmeSU.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-14tfyk-L.js";
import { i as resolveBundledPluginSources } from "./bundled-sources-BvJsgWU4.js";
import { i as buildPluginDiagnosticsReport, r as buildPluginCompatibilityWarnings } from "./status-Cm4w2zCk.js";
import { n as buildAuthHealthSummary, r as formatRemainingShort, t as DEFAULT_OAUTH_WARN_MS } from "./auth-health-DH87yfrD.js";
import { a as guardCancel, l as printWizardHeader, n as applyWizardMetadata } from "./onboard-helpers-B-FfdZ4h.js";
import { t as buildProviderAuthRecoveryHint } from "./provider-auth-guidance-DD-4YawY.js";
import { n as resolveExecPolicyScopeSnapshot } from "./exec-approvals-effective-DnIlEgU4.js";
import { i as resolveControlUiDistIndexPathForRoot, r as resolveControlUiDistIndexHealth } from "./control-ui-assets-CISH9MR3.js";
import { a as collectChannelDoctorRepairMutations, c as shouldSkipChannelDoctorDefaultEmptyGroupAllowlistWarning, i as collectChannelDoctorPreviewWarnings, n as collectChannelDoctorEmptyAllowlistExtraWarnings, o as collectChannelDoctorStaleConfigMutations, r as collectChannelDoctorMutableAllowlistWarnings, s as runChannelDoctorConfigSequences, t as collectChannelDoctorCompatibilityMutations } from "./channel-doctor-B1lIzbaP.js";
import { t as ensureSystemdUserLingerInteractive } from "./systemd-linger-fJExCoUb.js";
import { t as formatHealthCheckFailure } from "./health-format-CRX5X4aT.js";
import { r as healthCommand } from "./health-DkBRBZ7f.js";
import { a as stripUnknownConfigKeys, i as resolveConfigPathTarget, n as formatConfigPath, r as noteOpencodeProviderOverrides, t as runDoctorConfigPreflight } from "./doctor-config-preflight-EUV5O2PH.js";
import { n as runChannelPluginStartupMaintenance, r as runGatewayUpdate, t as normalizeCronJobIdentityFields } from "./normalize-job-identity-BeFZDaOX.js";
import { n as doctorShellCompletion } from "./doctor-completion-DwwVHnuC.js";
import { t as coerceFiniteScheduleNumber } from "./schedule-B3xFq5uS.js";
import { t as collectChannelStatusIssues } from "./channels-status-issues-AcSOTgmf.js";
import { t as resolveDefaultChannelAccountContext } from "./channel-account-context-B4E4w1ra.js";
import { a as runLegacyStateMigrations, n as detectLegacyStateMigrations } from "./state-migrations-BX2zZL8e.js";
import "./doctor-state-migrations-DRFnYMPS.js";
import { n as noteOpenAIOAuthTlsPrerequisites } from "./provider-openai-codex-oauth-tls-BOgHPDZu.js";
import fs from "node:fs";
import path from "node:path";
import { execFile, spawnSync } from "node:child_process";
import os from "node:os";
import fs$1 from "node:fs/promises";
import { promisify } from "node:util";
import { z } from "zod";
import { confirm, intro, outro, select } from "@clack/prompts";
//#region src/commands/doctor/shared/legacy-config-core-migrate.ts
function normalizeCompatibilityConfigValues(cfg) {
	const changes = [];
	let next = seedMissingDefaultAccountsFromSingleAccountBase(cfg, changes);
	next = normalizeLegacyBrowserConfig(next, changes);
	const setupMigration = runPluginSetupConfigMigrations({ config: next });
	if (setupMigration.changes.length > 0) {
		next = setupMigration.config;
		changes.push(...setupMigration.changes);
	}
	for (const migrate of [
		migrateLegacyWebSearchConfig,
		migrateLegacyWebFetchConfig,
		migrateLegacyXSearchConfig
	]) {
		const migrated = migrate(next);
		if (migrated.changes.length === 0) continue;
		next = migrated.config;
		changes.push(...migrated.changes);
	}
	next = normalizeLegacyNanoBananaSkill(next, changes);
	next = normalizeLegacyTalkConfig(next, changes);
	next = normalizeLegacyCrossContextMessageConfig(next, changes);
	next = normalizeLegacyMediaProviderOptions(next, changes);
	next = normalizeLegacyMistralModelMaxTokens(next, changes);
	for (const mutation of collectChannelDoctorCompatibilityMutations(next)) {
		if (mutation.changes.length === 0) continue;
		next = mutation.config;
		changes.push(...mutation.changes);
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
//#region src/commands/doctor/channel-capabilities.ts
const DEFAULT_DOCTOR_CHANNEL_CAPABILITIES = {
	dmAllowFromMode: "topOnly",
	groupModel: "sender",
	groupAllowFromFallbackToAllowFrom: true,
	warnOnEmptyGroupSenderAllowlist: true
};
const STATIC_DOCTOR_CHANNEL_CAPABILITIES = {
	googlechat: {
		dmAllowFromMode: "nestedOnly",
		groupModel: "route",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: false
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
	zalouser: {
		dmAllowFromMode: "topOnly",
		groupModel: "hybrid",
		groupAllowFromFallbackToAllowFrom: false,
		warnOnEmptyGroupSenderAllowlist: false
	}
};
function getDoctorChannelCapabilities(channelName) {
	if (!channelName) return DEFAULT_DOCTOR_CHANNEL_CAPABILITIES;
	const staticCapabilities = STATIC_DOCTOR_CHANNEL_CAPABILITIES[channelName];
	if (staticCapabilities) return staticCapabilities;
	const registeredChannelId = normalizeAnyChannelId(channelName);
	if (!registeredChannelId) return DEFAULT_DOCTOR_CHANNEL_CAPABILITIES;
	const pluginDoctor = getChannelPlugin(registeredChannelId)?.doctor ?? getBundledChannelPlugin(registeredChannelId)?.doctor;
	if (pluginDoctor) return {
		dmAllowFromMode: pluginDoctor.dmAllowFromMode ?? DEFAULT_DOCTOR_CHANNEL_CAPABILITIES.dmAllowFromMode,
		groupModel: pluginDoctor.groupModel ?? DEFAULT_DOCTOR_CHANNEL_CAPABILITIES.groupModel,
		groupAllowFromFallbackToAllowFrom: pluginDoctor.groupAllowFromFallbackToAllowFrom ?? DEFAULT_DOCTOR_CHANNEL_CAPABILITIES.groupAllowFromFallbackToAllowFrom,
		warnOnEmptyGroupSenderAllowlist: pluginDoctor.warnOnEmptyGroupSenderAllowlist ?? DEFAULT_DOCTOR_CHANNEL_CAPABILITIES.warnOnEmptyGroupSenderAllowlist
	};
	return DEFAULT_DOCTOR_CHANNEL_CAPABILITIES;
}
//#endregion
//#region src/commands/doctor/shared/allow-from-mode.ts
function resolveAllowFromMode(channelName) {
	return getDoctorChannelCapabilities(channelName).dmAllowFromMode;
}
//#endregion
//#region src/commands/doctor/shared/allowlist.ts
function hasAllowFromEntries(list) {
	return Array.isArray(list) && normalizeStringEntries(list).length > 0;
}
//#endregion
//#region src/commands/doctor/shared/object.ts
function asObjectRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
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
		const normalizedChannelId = normalizeOptionalLowercaseString(normalizeChatChannelId(params.channelName) ?? params.channelName);
		if (!normalizedChannelId) return;
		const normalizedAccountId = normalizeAccountId(params.accountId) || "default";
		const fromStore = await readChannelAllowFromStore(normalizedChannelId, process.env, normalizedAccountId).catch(() => []);
		const recovered = Array.from(new Set(normalizeStringEntries(fromStore)));
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
//#region src/commands/doctor/shared/bundled-plugin-load-paths.ts
function resolveBundledWorkspaceDir(cfg) {
	return resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)) ?? void 0;
}
function normalizeBundledLookupPath(targetPath) {
	const normalized = path.normalize(targetPath);
	const root = path.parse(normalized).root;
	let trimmed = normalized;
	while (trimmed.length > root.length && (trimmed.endsWith(path.sep) || trimmed.endsWith("/"))) trimmed = trimmed.slice(0, -1);
	return trimmed;
}
function buildLegacyBundledPath(localPath) {
	const normalized = normalizeBundledLookupPath(localPath);
	for (const bundledRoot of [path.join("dist", "extensions"), path.join("dist-runtime", "extensions")]) {
		const marker = `${bundledRoot}${path.sep}`;
		const markerIndex = normalized.lastIndexOf(marker);
		if (markerIndex === -1) continue;
		const packageRoot = normalized.slice(0, markerIndex);
		const bundledLeaf = normalized.slice(markerIndex + marker.length);
		if (!bundledLeaf) continue;
		return path.join(packageRoot, "extensions", bundledLeaf);
	}
	return null;
}
function scanBundledPluginLoadPathMigrations(cfg, env = process.env) {
	const load = asObjectRecord(asObjectRecord(cfg.plugins)?.load);
	const rawPaths = Array.isArray(load?.paths) ? load.paths : [];
	if (rawPaths.length === 0) return [];
	const bundled = resolveBundledPluginSources({
		workspaceDir: resolveBundledWorkspaceDir(cfg),
		env
	});
	if (bundled.size === 0) return [];
	const legacyPathMap = /* @__PURE__ */ new Map();
	for (const source of bundled.values()) {
		const legacyPath = buildLegacyBundledPath(source.localPath);
		if (!legacyPath) continue;
		legacyPathMap.set(normalizeBundledLookupPath(legacyPath), {
			pluginId: source.pluginId,
			toPath: source.localPath
		});
	}
	const hits = [];
	for (const rawPath of rawPaths) {
		if (typeof rawPath !== "string") continue;
		const normalized = normalizeBundledLookupPath(resolveUserPath(rawPath, env));
		const match = legacyPathMap.get(normalized);
		if (!match) continue;
		hits.push({
			pluginId: match.pluginId,
			fromPath: rawPath,
			toPath: match.toPath,
			pathLabel: "plugins.load.paths"
		});
	}
	return hits;
}
function collectBundledPluginLoadPathWarnings(params) {
	if (params.hits.length === 0) return [];
	const lines = params.hits.map((hit) => `- ${hit.pathLabel}: legacy bundled plugin path "${hit.fromPath}" still points at ${hit.pluginId}; current packaged path is "${hit.toPath}".`);
	lines.push(`- Run "${params.doctorFixCommand}" to rewrite these bundled plugin paths.`);
	return lines.map((line) => sanitizeForLog(line));
}
function maybeRepairBundledPluginLoadPaths(cfg, env = process.env) {
	const hits = scanBundledPluginLoadPathMigrations(cfg, env);
	if (hits.length === 0) return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const paths = next.plugins?.load?.paths;
	if (!Array.isArray(paths)) return {
		config: cfg,
		changes: []
	};
	const replacements = new Map(hits.map((hit) => [normalizeBundledLookupPath(resolveUserPath(hit.fromPath, env)), hit]));
	const seen = /* @__PURE__ */ new Set();
	const rewritten = [];
	for (const entry of paths) {
		if (typeof entry !== "string") {
			rewritten.push(entry);
			continue;
		}
		const resolved = normalizeBundledLookupPath(resolveUserPath(entry, env));
		const replacement = replacements.get(resolved)?.toPath ?? entry;
		const replacementResolved = normalizeBundledLookupPath(resolveUserPath(replacement, env));
		if (seen.has(replacementResolved)) continue;
		seen.add(replacementResolved);
		rewritten.push(replacement);
	}
	next.plugins = {
		...next.plugins,
		load: {
			...next.plugins?.load,
			paths: rewritten
		}
	};
	return {
		config: next,
		changes: hits.map((hit) => `- plugins.load.paths: rewrote bundled ${hit.pluginId} path from ${hit.fromPath} to ${hit.toPath}`)
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
	if (params.channelName && shouldSkipChannelDoctorDefaultEmptyGroupAllowlistWarning({
		account: params.account,
		channelName: params.channelName,
		dmPolicy,
		effectiveAllowFrom,
		parent: params.parent,
		prefix: params.prefix
	})) return warnings;
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
	return Array.from(new Set(entries.map((entry) => normalizeOptionalLowercaseString(entry) ?? "").filter((entry) => entry.length > 0))).toSorted();
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
	return list?.some((v) => normalizeOptionalString(String(v)) === "*") ?? false;
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
		const dmPolicy = account.dmPolicy ?? dm?.policy ?? void 0;
		const canCanonicalizeTopLevel = mode !== "nestedOnly";
		const hadNestedOpenPolicy = canCanonicalizeTopLevel && account.dmPolicy === void 0 && dm?.policy === "open";
		if (dmPolicy !== "open") return;
		const topAllowFrom = account.allowFrom;
		const nestedAllowFrom = dm?.allowFrom;
		if (hadNestedOpenPolicy) {
			account.dmPolicy = "open";
			delete dm.policy;
			changes.push(`- ${prefix}.dmPolicy: set to "open" (migrated from ${prefix}.dm.policy)`);
		}
		if (canCanonicalizeTopLevel && !Array.isArray(topAllowFrom) && Array.isArray(nestedAllowFrom) && hasWildcard(nestedAllowFrom)) {
			account.allowFrom = [...nestedAllowFrom];
			delete dm?.allowFrom;
			changes.push(`- ${prefix}.allowFrom: moved ${hasWildcard(nestedAllowFrom) ? "wildcard " : ""}allowlist from ${prefix}.dm.allowFrom`);
		}
		if (dm && Object.keys(dm).length === 0) delete account.dm;
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
	for (const mutation of await collectChannelDoctorRepairMutations({
		cfg: state.candidate,
		doctorFixCommand: params.doctorFixCommand
	})) applyMutation(mutation);
	applyMutation(maybeRepairOpenPolicyAllowFrom(state.candidate));
	applyMutation(maybeRepairBundledPluginLoadPaths(state.candidate, process.env));
	applyMutation(maybeRepairStalePluginConfig(state.candidate, process.env));
	applyMutation(await maybeRepairAllowlistPolicyAllowFrom(state.candidate));
	const emptyAllowlistWarnings = scanEmptyAllowlistPolicyWarnings(state.candidate, {
		doctorFixCommand: params.doctorFixCommand,
		extraWarningsForAccount: collectChannelDoctorEmptyAllowlistExtraWarnings
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
//#region src/commands/doctor/shared/legacy-config-migrate.ts
function migrateLegacyConfig(raw) {
	const { next, changes } = applyLegacyDoctorMigrations(raw);
	if (!next) return {
		config: null,
		changes: []
	};
	const validated = validateConfigObjectWithPlugins(next);
	if (!validated.ok) {
		changes.push("Migration applied, but config still invalid; fix remaining issues manually.");
		return {
			config: null,
			changes
		};
	}
	return {
		config: validated.config,
		changes
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
			pendingChanges: params.state.pendingChanges || params.snapshot.legacyIssues.length > 0,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to migrate legacy config keys.`]
		},
		issueLines,
		changeLines: changes
	};
	return {
		state: {
			cfg: migrated,
			candidate: migrated,
			pendingChanges: params.state.pendingChanges || params.snapshot.legacyIssues.length > 0,
			fixHints: params.shouldRepair ? params.state.fixHints : [...params.state.fixHints, `Run "${params.doctorFixCommand}" to migrate legacy config keys.`]
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
	return normalizeLowercaseStringOrEmpty(raw);
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
			const rawAccountId = normalizeOptionalString(match.accountId) ?? "";
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
//#region src/commands/doctor/shared/channel-plugin-blockers.ts
function hasExplicitChannelPluginBlockerConfig(cfg) {
	if (cfg.plugins?.enabled === false) return true;
	const entries = cfg.plugins?.entries;
	if (!entries || typeof entries !== "object") return false;
	return Object.values(entries).some((entry) => {
		return entry && typeof entry === "object" && !Array.isArray(entry) && "enabled" in entry && entry.enabled === false;
	});
}
function scanConfiguredChannelPluginBlockers(cfg, env = process.env) {
	if (!hasExplicitChannelPluginBlockerConfig(cfg)) return [];
	const configuredChannelIds = new Set(listPotentialConfiguredChannelIds(cfg, env).map((id) => id.trim()));
	if (configuredChannelIds.size === 0) return [];
	const pluginsConfig = normalizePluginsConfig(cfg.plugins);
	const registry = loadPluginManifestRegistry({
		config: cfg,
		env
	});
	const hits = [];
	for (const plugin of registry.plugins) {
		if (plugin.channels.length === 0) continue;
		const activationState = resolveEffectivePluginActivationState({
			id: plugin.id,
			origin: plugin.origin,
			config: pluginsConfig,
			rootConfig: cfg,
			enabledByDefault: plugin.enabledByDefault
		});
		if (activationState.activated || !activationState.reason || activationState.reason !== "disabled in config" && activationState.reason !== "plugins disabled") continue;
		for (const channelId of plugin.channels) {
			if (!configuredChannelIds.has(channelId)) continue;
			hits.push({
				channelId,
				pluginId: plugin.id,
				reason: activationState.reason
			});
		}
	}
	return hits;
}
function formatReason(hit) {
	if (hit.reason === "disabled in config") return `plugin "${sanitizeForLog(hit.pluginId)}" is disabled by plugins.entries.${sanitizeForLog(hit.pluginId)}.enabled=false.`;
	if (hit.reason === "plugins disabled") return `plugins.enabled=false blocks channel plugins globally.`;
	return `plugin "${sanitizeForLog(hit.pluginId)}" is not loadable (${sanitizeForLog(hit.reason)}).`;
}
function collectConfiguredChannelPluginBlockerWarnings(hits) {
	return hits.map((hit) => `- channels.${sanitizeForLog(hit.channelId)}: channel is configured, but ${formatReason(hit)} Fix plugin enablement before relying on setup guidance for this channel.`);
}
function isWarningBlockedByChannelPlugin(warning, hits) {
	return hits.some((hit) => {
		const prefix = `channels.${sanitizeForLog(hit.channelId)}`;
		return warning.includes(`${prefix}:`) || warning.includes(`${prefix}.`);
	});
}
//#endregion
//#region src/commands/doctor/shared/preview-warnings.ts
async function collectDoctorPreviewWarnings(params) {
	const warnings = [];
	const channelPluginBlockerHits = scanConfiguredChannelPluginBlockers(params.cfg, process.env);
	if (channelPluginBlockerHits.length > 0) warnings.push(collectConfiguredChannelPluginBlockerWarnings(channelPluginBlockerHits).join("\n"));
	const channelDoctorWarnings = await collectChannelDoctorPreviewWarnings({
		cfg: params.cfg,
		doctorFixCommand: params.doctorFixCommand
	});
	if (channelDoctorWarnings.length > 0) warnings.push(...channelDoctorWarnings);
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
	const bundledPluginLoadPathHits = scanBundledPluginLoadPathMigrations(params.cfg, process.env);
	if (bundledPluginLoadPathHits.length > 0) warnings.push(collectBundledPluginLoadPathWarnings({
		hits: bundledPluginLoadPathHits,
		doctorFixCommand: params.doctorFixCommand
	}).join("\n"));
	const emptyAllowlistWarnings = scanEmptyAllowlistPolicyWarnings(params.cfg, {
		doctorFixCommand: params.doctorFixCommand,
		extraWarningsForAccount: collectChannelDoctorEmptyAllowlistExtraWarnings
	}).filter((warning) => !isWarningBlockedByChannelPlugin(warning, channelPluginBlockerHits));
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
function hasLegacyInternalHookHandlers(raw) {
	const handlers = raw?.hooks?.internal?.handlers;
	return Array.isArray(handlers) && handlers.length > 0;
}
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
	const pluginLegacyIssues = snapshot.parsed === snapshot.sourceConfig ? [] : findLegacyConfigIssues(snapshot.parsed, snapshot.parsed, listPluginDoctorLegacyConfigRules({ pluginIds: collectRelevantDoctorPluginIds(snapshot.parsed) }));
	const seenLegacyIssues = new Set(snapshot.legacyIssues.map((issue) => `${issue.path}:${issue.message}`));
	const pluginIssueLines = pluginLegacyIssues.filter((issue) => {
		const key = `${issue.path}:${issue.message}`;
		if (seenLegacyIssues.has(key)) return false;
		seenLegacyIssues.add(key);
		return true;
	}).map((issue) => `- ${issue.path}: ${issue.message}`);
	const legacyIssueLines = [...legacyStep.issueLines, ...pluginIssueLines];
	if (pluginIssueLines.length > 0 && !shouldRepair && !fixHints.includes(`Run "${doctorFixCommand}" to migrate legacy config keys.`)) fixHints = [...fixHints, `Run "${doctorFixCommand}" to migrate legacy config keys.`];
	if (legacyIssueLines.length > 0) note$1(legacyIssueLines.join("\n"), "Legacy config keys detected");
	if (legacyStep.changeLines.length > 0) note$1(legacyStep.changeLines.join("\n"), "Doctor changes");
	if (hasLegacyInternalHookHandlers(snapshot.parsed)) note$1([
		"- hooks.internal.handlers: legacy inline hook modules are no longer part of the public config surface.",
		"- Migrate each entry to a managed or workspace hook directory with HOOK.md + handler.js, then enable it through hooks.internal.entries.<hookKey> as needed.",
		"- openclaw doctor --fix does not rewrite this shape automatically."
	].join("\n"), "Legacy config keys detected");
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
	const channelDoctorSequence = await runChannelDoctorConfigSequences({
		cfg: candidate,
		env: process.env,
		shouldRepair
	});
	emitDoctorNotes({
		note: note$1,
		changeNotes: channelDoctorSequence.changeNotes,
		warningNotes: channelDoctorSequence.warningNotes
	});
	for (const staleCleanup of await collectChannelDoctorStaleConfigMutations(candidate)) {
		if (staleCleanup.changes.length === 0) continue;
		note$1(staleCleanup.changes.join("\n"), "Doctor changes");
		({cfg, candidate, pendingChanges, fixHints} = applyDoctorConfigMutation({
			state: {
				cfg,
				candidate,
				pendingChanges,
				fixHints
			},
			mutation: staleCleanup,
			shouldRepair,
			fixHint: `Run "${doctorFixCommand}" to remove stale channel plugin references.`
		}));
	}
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
		warningNotes: await collectDoctorPreviewWarnings({
			cfg: candidate,
			doctorFixCommand
		})
	});
	const mutableAllowlistWarnings = await collectChannelDoctorMutableAllowlistWarnings({ cfg: candidate });
	if (mutableAllowlistWarnings.length > 0) note$1(mutableAllowlistWarnings.join("\n"), "Doctor warnings");
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
const execFileAsync$1 = promisify(execFile);
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
		const value = normalizeOptionalString((await execFileAsync$1("/bin/launchctl", ["getenv", name], { encoding: "utf8" })).stdout ?? "") ?? "";
		return value.length > 0 ? value : void 0;
	} catch {
		return;
	}
}
function hasConfigGatewayCreds(cfg) {
	const localPassword = cfg.gateway?.auth?.password;
	const remoteToken = cfg.gateway?.remote?.token;
	const remotePassword = cfg.gateway?.remote?.password;
	return hasConfiguredSecretInput(cfg.gateway?.auth?.token, cfg.secrets?.defaults) || hasConfiguredSecretInput(localPassword, cfg.secrets?.defaults) || hasConfiguredSecretInput(remoteToken, cfg.secrets?.defaults) || hasConfiguredSecretInput(remotePassword, cfg.secrets?.defaults);
}
async function noteMacLaunchctlGatewayEnvOverrides(cfg, deps) {
	if ((deps?.platform ?? process.platform) !== "darwin") return;
	if (!hasConfigGatewayCreds(cfg)) return;
	const getenv = deps?.getenv ?? launchctlGetenv;
	const tokenEntries = [["OPENCLAW_GATEWAY_TOKEN", await getenv("OPENCLAW_GATEWAY_TOKEN")]];
	const passwordEntries = [["OPENCLAW_GATEWAY_PASSWORD", await getenv("OPENCLAW_GATEWAY_PASSWORD")]];
	const tokenEntry = tokenEntries.find(([, value]) => normalizeOptionalString(value));
	const passwordEntry = passwordEntries.find(([, value]) => normalizeOptionalString(value));
	const envToken = normalizeOptionalString(tokenEntry?.[1]) ?? "";
	const envPassword = normalizeOptionalString(passwordEntry?.[1]) ?? "";
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
	return Boolean(normalizeOptionalString(value));
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
	const compileCache = normalizeOptionalString(env.NODE_COMPILE_CACHE) ?? "";
	const disableCompileCache = normalizeOptionalString(env.NODE_DISABLE_COMPILE_CACHE) ?? "";
	const noRespawn = normalizeOptionalString(env.OPENCLAW_NO_RESPAWN) ?? "";
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
//#region src/commands/doctor-repair-mode.ts
function resolveDoctorRepairMode(options) {
	const yes = options.yes === true;
	const requestedNonInteractive = options.nonInteractive === true;
	const shouldRepair = options.repair === true || yes;
	const shouldForce = options.force === true;
	const isTty = process.stdin.isTTY;
	const nonInteractive = requestedNonInteractive || !isTty && !yes;
	const updateInProgress = isTruthyEnvValue$1(process.env.OPENCLAW_UPDATE_IN_PROGRESS);
	return {
		shouldRepair,
		shouldForce,
		nonInteractive,
		canPrompt: isTty && !yes && !nonInteractive,
		updateInProgress
	};
}
function isDoctorUpdateRepairMode(mode) {
	return mode.updateInProgress && mode.nonInteractive;
}
function shouldAutoApproveDoctorFix(mode, params = {}) {
	if (!mode.shouldRepair) return false;
	if (params.requiresForce && !mode.shouldForce) return false;
	if (params.blockDuringUpdate && isDoctorUpdateRepairMode(mode)) return false;
	return true;
}
//#endregion
//#region src/commands/doctor-prompter.ts
function createDoctorPrompter(params) {
	const repairMode = resolveDoctorRepairMode(params.options);
	const confirmDefault = async (p) => {
		if (shouldAutoApproveDoctorFix(repairMode)) return true;
		if (repairMode.nonInteractive) return false;
		if (!repairMode.canPrompt) return p.initialValue ?? false;
		return guardCancel(await confirm({
			...p,
			message: stylePromptMessage(p.message)
		}), params.runtime);
	};
	return {
		confirm: confirmDefault,
		confirmAutoFix: confirmDefault,
		confirmAggressiveAutoFix: async (p) => {
			if (shouldAutoApproveDoctorFix(repairMode, { requiresForce: true })) return true;
			if (repairMode.nonInteractive) return false;
			if (repairMode.shouldRepair && !repairMode.shouldForce) return false;
			if (!repairMode.canPrompt) return p.initialValue ?? false;
			return guardCancel(await confirm({
				...p,
				message: stylePromptMessage(p.message)
			}), params.runtime);
		},
		confirmRuntimeRepair: async (p) => {
			if (shouldAutoApproveDoctorFix(repairMode, { blockDuringUpdate: true })) return true;
			if (repairMode.nonInteractive) return false;
			if (!repairMode.canPrompt) return p.initialValue ?? false;
			return guardCancel(await confirm({
				...p,
				message: stylePromptMessage(p.message)
			}), params.runtime);
		},
		select: async (p, fallback) => {
			if (!repairMode.canPrompt || repairMode.shouldRepair) return fallback;
			return guardCancel(await select({
				...p,
				message: stylePromptMessage(p.message),
				options: p.options.map((opt) => opt.hint === void 0 ? opt : {
					...opt,
					hint: stylePromptHint(opt.hint)
				})
			}), params.runtime);
		},
		shouldRepair: repairMode.shouldRepair,
		shouldForce: repairMode.shouldForce,
		repairMode
	};
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
			if (await prompter.confirmAutoFix({
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
				if (await prompter.confirmAggressiveAutoFix({
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
		if (normalizeLowercaseStringOrEmpty(res.stderr).includes("not a git repository")) return "not-git";
		return "unknown";
	}
	return res.stdout.trim() === root ? "git" : "not-git";
}
async function maybeOfferUpdateBeforeDoctor(params) {
	if (!(!isTruthyEnvValue$1(process.env.OPENCLAW_UPDATE_IN_PROGRESS) && params.options.nonInteractive !== true && params.options.yes !== true && params.options.repair !== true && process.stdin.isTTY) || !params.root) return { updated: false };
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
//#region src/commands/doctor-auth.ts
const CODEX_PROVIDER_ID = "openai-codex";
const CODEX_OAUTH_WARNING_TITLE = "Codex OAuth";
const OPENAI_BASE_URL = "https://api.openai.com/v1";
const LEGACY_CODEX_APIS = new Set(["openai-responses", "openai-completions"]);
async function maybeRepairLegacyOAuthProfileIds(cfg, prompter) {
	const store = ensureAuthProfileStore();
	let nextCfg = cfg;
	const providers = resolvePluginProviders({
		config: cfg,
		env: process.env,
		mode: "setup"
	});
	for (const provider of providers) for (const repairSpec of provider.oauthProfileIdRepairs ?? []) {
		const repair = repairOAuthProfileIdMismatch({
			cfg: nextCfg,
			store,
			provider: provider.id,
			legacyProfileId: repairSpec.legacyProfileId
		});
		if (!repair.migrated || repair.changes.length === 0) continue;
		note$1(repair.changes.map((c) => `- ${c}`).join("\n"), "Auth profiles");
		if (!await prompter.confirm({
			message: `Update ${repairSpec.promptLabel ?? provider.label} OAuth profile id in config now?`,
			initialValue: true
		})) continue;
		nextCfg = repair.config;
	}
	return nextCfg;
}
function hasConfiguredCodexOAuthProfile(cfg) {
	return Object.values(cfg.auth?.profiles ?? {}).some((profile) => profile.provider === CODEX_PROVIDER_ID && profile.mode === "oauth");
}
function hasStoredCodexOAuthProfile() {
	const store = ensureAuthProfileStore(void 0, { allowKeychainPrompt: false });
	return Object.values(store.profiles).some((profile) => profile.provider === CODEX_PROVIDER_ID && profile.type === "oauth");
}
function normalizeCodexOverrideBaseUrl(baseUrl) {
	if (typeof baseUrl !== "string") return;
	return baseUrl.trim().replace(/\/+$/, "");
}
function isLegacyCodexTransportShape(value, inheritedBaseUrl) {
	if (!isRecord(value)) return false;
	const api = typeof value.api === "string" ? value.api : void 0;
	if (!api || !LEGACY_CODEX_APIS.has(api)) return false;
	const baseUrl = normalizeCodexOverrideBaseUrl(value.baseUrl ?? inheritedBaseUrl);
	return !baseUrl || baseUrl === OPENAI_BASE_URL;
}
function hasLegacyCodexTransportOverride(providerOverride) {
	if (!isRecord(providerOverride)) return false;
	if (isLegacyCodexTransportShape(providerOverride)) return true;
	const models = providerOverride.models;
	if (!Array.isArray(models)) return false;
	return models.some((model) => isLegacyCodexTransportShape(model, providerOverride.baseUrl));
}
function buildCodexProviderOverrideWarning(providerOverride) {
	const lines = [`- models.providers.${CODEX_PROVIDER_ID} contains a legacy transport override while Codex OAuth is configured.`, "- Older OpenAI transport settings can shadow the built-in Codex OAuth provider path."];
	if (isRecord(providerOverride)) {
		const record = providerOverride;
		if (typeof record.api === "string") lines.push(`- models.providers.${CODEX_PROVIDER_ID}.api=${record.api}`);
		if (typeof record.baseUrl === "string") lines.push(`- models.providers.${CODEX_PROVIDER_ID}.baseUrl=${record.baseUrl}`);
	}
	lines.push(`- Remove or rewrite the legacy transport override to restore the built-in Codex OAuth provider path after recent fixes.`);
	lines.push("- Custom proxies and header-only overrides can stay; this warning only targets old OpenAI transport settings.");
	return lines.join("\n");
}
function noteLegacyCodexProviderOverride(cfg) {
	const providerOverride = cfg.models?.providers?.[CODEX_PROVIDER_ID];
	if (!providerOverride) return;
	if (!hasLegacyCodexTransportOverride(providerOverride)) return;
	if (!hasConfiguredCodexOAuthProfile(cfg) && !hasStoredCodexOAuthProfile()) return;
	note$1(buildCodexProviderOverrideWarning(providerOverride), CODEX_OAUTH_WARNING_TITLE);
}
function resolveUnusableProfileHint(params) {
	if (params.kind === "disabled") {
		if (params.reason === "billing") return "Top up credits (provider billing) or switch provider.";
		if (params.reason === "auth_permanent" || params.reason === "auth") return "Refresh or replace credentials, then retry.";
	}
	return "Wait for cooldown or switch provider.";
}
function formatOAuthRefreshFailureReason(reason) {
	switch (reason) {
		case "refresh_token_reused": return "refresh_token_reused";
		case "invalid_grant": return "invalid_grant";
		case "sign_in_again": return "sign in again";
		case "invalid_refresh_token": return "invalid refresh token";
		case "revoked": return "revoked";
		default: return "refresh failed";
	}
}
function formatOAuthRefreshFailureDoctorLine(params) {
	const classified = classifyOAuthRefreshFailure(params.message);
	if (!classified) return null;
	const command = buildOAuthRefreshFailureLoginCommand(classified.provider ?? params.provider);
	if (classified.reason) return `- ${params.profileId}: re-auth required [${formatOAuthRefreshFailureReason(classified.reason)}] — Run \`${command}\`.`;
	return `- ${params.profileId}: OAuth refresh failed — Try again; if this persists, run \`${command}\`.`;
}
async function resolveAuthIssueHint(issue, cfg, store) {
	if (issue.reasonCode === "invalid_expires") return "Invalid token expires metadata. Set a future Unix ms timestamp or remove expires.";
	const providerHint = await formatAuthDoctorHint({
		cfg,
		store,
		provider: issue.provider,
		profileId: issue.profileId
	});
	if (providerHint.trim()) return providerHint;
	return buildProviderAuthRecoveryHint({ provider: issue.provider }).replace(/^Run /, "Re-auth via ");
}
async function formatAuthIssueLine(issue, cfg, store) {
	const remaining = issue.remainingMs !== void 0 ? ` (${formatRemainingShort(issue.remainingMs)})` : "";
	const hint = await resolveAuthIssueHint(issue, cfg, store);
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
	if (await params.prompter.confirmAutoFix({
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
			const message = formatErrorMessage(err);
			errors.push(formatOAuthRefreshFailureDoctorLine({
				profileId: profile.profileId,
				provider: profile.provider,
				message
			}) ?? `- ${profile.profileId}: ${message}`);
		}
		if (errors.length > 0) note$1(errors.join("\n"), "OAuth refresh errors");
		summary = buildAuthHealthSummary({
			store: ensureAuthProfileStore(void 0, { allowKeychainPrompt: false }),
			cfg: params.cfg,
			warnAfterMs: DEFAULT_OAUTH_WARN_MS
		});
		issues = findIssues();
	}
	if (issues.length > 0) note$1((await Promise.all(issues.map((issue) => formatAuthIssueLine({
		profileId: issue.profileId,
		provider: issue.provider,
		status: issue.status,
		reasonCode: issue.reasonCode,
		remainingMs: issue.remainingMs
	}, params.cfg, store)))).join("\n"), "Model auth");
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
function loadBrowserDoctorSurface() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "browser-doctor.js"
	});
}
async function noteChromeMcpBrowserReadiness(cfg, deps) {
	try {
		await loadBrowserDoctorSurface().noteChromeMcpBrowserReadiness(cfg, deps);
	} catch (error) {
		(deps?.noteFn ?? note$1)(`- Browser health check is unavailable: ${error instanceof Error ? error.message : String(error)}`, "Browser");
	}
}
//#endregion
//#region src/commands/doctor-bundled-plugin-runtime-deps.ts
function isSourceCheckoutRoot(packageRoot) {
	return fs.existsSync(path.join(packageRoot, ".git")) && fs.existsSync(path.join(packageRoot, "src")) && fs.existsSync(path.join(packageRoot, "extensions"));
}
function dependencySentinelPath(depName) {
	return path.join("node_modules", ...depName.split("/"), "package.json");
}
function collectRuntimeDeps(packageJson) {
	return {
		...packageJson.dependencies,
		...packageJson.optionalDependencies
	};
}
function collectBundledPluginRuntimeDeps(params) {
	const versionMap = /* @__PURE__ */ new Map();
	for (const entry of fs.readdirSync(params.extensionsDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const pluginId = entry.name;
		const packageJsonPath = path.join(params.extensionsDir, pluginId, "package.json");
		if (!fs.existsSync(packageJsonPath)) continue;
		try {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
			for (const [name, rawVersion] of Object.entries(collectRuntimeDeps(packageJson))) {
				if (typeof rawVersion !== "string" || rawVersion.trim() === "") continue;
				const version = rawVersion.trim();
				const byVersion = versionMap.get(name) ?? /* @__PURE__ */ new Map();
				const pluginIds = byVersion.get(version) ?? /* @__PURE__ */ new Set();
				pluginIds.add(pluginId);
				byVersion.set(version, pluginIds);
				versionMap.set(name, byVersion);
			}
		} catch {}
	}
	const deps = [];
	const conflicts = [];
	for (const [name, byVersion] of versionMap.entries()) {
		if (byVersion.size === 1) {
			const [version, pluginIds] = [...byVersion.entries()][0] ?? [];
			if (version) deps.push({
				name,
				version,
				pluginIds: [...pluginIds].toSorted((a, b) => a.localeCompare(b))
			});
			continue;
		}
		const versions = [...byVersion.keys()].toSorted((a, b) => a.localeCompare(b));
		const pluginIdsByVersion = /* @__PURE__ */ new Map();
		for (const [version, pluginIds] of byVersion.entries()) pluginIdsByVersion.set(version, [...pluginIds].toSorted((a, b) => a.localeCompare(b)));
		conflicts.push({
			name,
			versions,
			pluginIdsByVersion
		});
	}
	return {
		deps: deps.toSorted((a, b) => a.name.localeCompare(b.name)),
		conflicts: conflicts.toSorted((a, b) => a.name.localeCompare(b.name))
	};
}
function scanBundledPluginRuntimeDeps(params) {
	if (isSourceCheckoutRoot(params.packageRoot)) return {
		missing: [],
		conflicts: []
	};
	const extensionsDir = path.join(params.packageRoot, "dist", "extensions");
	if (!fs.existsSync(extensionsDir)) return {
		missing: [],
		conflicts: []
	};
	const { deps, conflicts } = collectBundledPluginRuntimeDeps({ extensionsDir });
	return {
		missing: deps.filter((dep) => !fs.existsSync(path.join(params.packageRoot, dependencySentinelPath(dep.name)))),
		conflicts
	};
}
function createNestedNpmInstallEnv(env) {
	const nextEnv = { ...env };
	delete nextEnv.npm_config_global;
	delete nextEnv.npm_config_location;
	delete nextEnv.npm_config_prefix;
	return nextEnv;
}
function installBundledRuntimeDeps(params) {
	const result = spawnSync("npm", [
		"install",
		"--omit=dev",
		"--no-save",
		"--package-lock=false",
		"--ignore-scripts",
		"--legacy-peer-deps",
		...params.missingSpecs
	], {
		cwd: params.packageRoot,
		encoding: "utf8",
		env: createNestedNpmInstallEnv(params.env),
		stdio: "pipe",
		shell: false
	});
	if (result.status !== 0) {
		const output = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
		throw new Error(output || "npm install failed");
	}
}
async function maybeRepairBundledPluginRuntimeDeps(params) {
	const packageRoot = params.packageRoot ?? resolveOpenClawPackageRootSync({
		argv1: process.argv[1],
		cwd: process.cwd(),
		moduleUrl: import.meta.url
	});
	if (!packageRoot) return;
	const { missing, conflicts } = scanBundledPluginRuntimeDeps({ packageRoot });
	if (conflicts.length > 0) note$1([
		"Bundled plugin runtime deps use conflicting versions.",
		...conflicts.flatMap((conflict) => [`- ${conflict.name}: ${conflict.versions.join(", ")}`, ...conflict.versions.flatMap((version) => {
			const pluginIds = conflict.pluginIdsByVersion.get(version) ?? [];
			return pluginIds.length > 0 ? [`  - ${version}: ${pluginIds.join(", ")}`] : [];
		})]),
		`Update bundled plugins and rerun ${formatCliCommand("openclaw doctor")}.`
	].join("\n"), "Bundled plugins");
	if (missing.length === 0) return;
	const missingSpecs = missing.map((dep) => `${dep.name}@${dep.version}`);
	note$1([
		"Bundled plugin runtime deps are missing.",
		...missing.map((dep) => `- ${dep.name}@${dep.version} (used by ${dep.pluginIds.join(", ")})`),
		`Fix: run ${formatCliCommand("openclaw doctor --fix")} to install them.`
	].join("\n"), "Bundled plugins");
	if (!(params.prompter.shouldRepair || await params.prompter.confirmAutoFix({
		message: "Install missing bundled plugin runtime deps now?",
		initialValue: true
	}))) return;
	try {
		(params.installDeps ?? ((installParams) => installBundledRuntimeDeps({
			packageRoot: installParams.packageRoot,
			missingSpecs: installParams.missingSpecs,
			env: params.env ?? process.env
		})))({
			packageRoot,
			missingSpecs
		});
		note$1(`Installed bundled plugin deps: ${missingSpecs.join(", ")}`, "Bundled plugins");
	} catch (error) {
		params.runtime.error(`Failed to install bundled plugin runtime deps: ${String(error)}`);
	}
}
//#endregion
//#region src/commands/doctor-claude-cli.ts
const CLAUDE_CLI_PROVIDER = "claude-cli";
const CLAUDE_PROJECTS_DIRNAME = path.join(".claude", "projects");
const MAX_SANITIZED_PROJECT_LENGTH = 200;
function usesClaudeCliModelSelection(cfg) {
	if (normalizeOptionalLowercaseString(resolvePrimaryStringValue(cfg.agents?.defaults?.model))?.startsWith(`${CLAUDE_CLI_PROVIDER}/`)) return true;
	return Object.keys(cfg.agents?.defaults?.models ?? {}).some((key) => normalizeOptionalLowercaseString(key)?.startsWith(`${CLAUDE_CLI_PROVIDER}/`));
}
function hasClaudeCliConfigSignals(cfg) {
	if (usesClaudeCliModelSelection(cfg)) return true;
	const backendConfig = cfg.agents?.defaults?.cliBackends ?? {};
	if (Object.keys(backendConfig).some((key) => normalizeOptionalLowercaseString(key) === CLAUDE_CLI_PROVIDER)) return true;
	return Object.values(cfg.auth?.profiles ?? {}).some((profile) => profile?.provider === CLAUDE_CLI_PROVIDER);
}
function hasClaudeCliStoreSignals(store) {
	if (store.profiles["anthropic:claude-cli"]) return true;
	return Object.values(store.profiles).some((profile) => profile?.provider === CLAUDE_CLI_PROVIDER);
}
function resolveClaudeCliCommand(cfg) {
	const configured = cfg.agents?.defaults?.cliBackends ?? {};
	for (const [key, entry] of Object.entries(configured)) {
		if (normalizeOptionalLowercaseString(key) !== CLAUDE_CLI_PROVIDER) continue;
		const command = normalizeOptionalString(entry?.command);
		if (command) return command;
	}
	return "claude";
}
function simpleHash36(input) {
	let hash = 0;
	for (let index = 0; index < input.length; index += 1) hash = hash * 31 + input.charCodeAt(index) >>> 0;
	return hash.toString(36);
}
function sanitizeClaudeCliProjectKey(workspaceDir) {
	const sanitized = workspaceDir.replace(/[^a-zA-Z0-9]/g, "-");
	if (sanitized.length <= MAX_SANITIZED_PROJECT_LENGTH) return sanitized;
	return `${sanitized.slice(0, MAX_SANITIZED_PROJECT_LENGTH)}-${simpleHash36(workspaceDir)}`;
}
function canonicalizeWorkspaceDir(workspaceDir) {
	const resolved = path.resolve(workspaceDir).normalize("NFC");
	try {
		return fs.realpathSync.native(resolved).normalize("NFC");
	} catch {
		return resolved;
	}
}
function resolveClaudeCliProjectDirForWorkspace(params) {
	const homeDir = normalizeOptionalString(params.homeDir) || process.env.HOME || os.homedir();
	const canonicalWorkspaceDir = canonicalizeWorkspaceDir(params.workspaceDir);
	return path.join(homeDir, CLAUDE_PROJECTS_DIRNAME, sanitizeClaudeCliProjectKey(canonicalWorkspaceDir));
}
function probeDirectoryHealth(dirPath) {
	try {
		if (!fs.statSync(dirPath).isDirectory()) return "not_directory";
	} catch {
		return "missing";
	}
	try {
		fs.accessSync(dirPath, fs.constants.R_OK);
	} catch {
		return "unreadable";
	}
	try {
		fs.accessSync(dirPath, fs.constants.W_OK);
	} catch {
		return "readonly";
	}
	return "present";
}
function formatCredentialLabel(credential) {
	if (credential.type === "oauth" || credential.type === "token") return credential.type;
	return "unknown";
}
function formatWorkspaceHealthLine(workspaceDir, health) {
	const display = shortenHomePath(workspaceDir);
	if (health === "present") return `- Workspace: ${display} (writable).`;
	if (health === "missing") return `- Workspace: ${display} (missing; OpenClaw will create it on first run).`;
	if (health === "not_directory") return `- Workspace: ${display} exists but is not a directory.`;
	if (health === "unreadable") return `- Workspace: ${display} is not readable by this user.`;
	return `- Workspace: ${display} is not writable by this user.`;
}
function formatProjectDirHealthLine(projectDir, health) {
	const display = shortenHomePath(projectDir);
	if (health === "present") return `- Claude project dir: ${display} (present).`;
	if (health === "missing") return `- Claude project dir: ${display} (not created yet; it appears after the first Claude CLI turn in this workspace).`;
	if (health === "not_directory") return `- Claude project dir: ${display} exists but is not a directory.`;
	if (health === "unreadable") return `- Claude project dir: ${display} is not readable by this user.`;
	return `- Claude project dir: ${display} is not writable by this user.`;
}
function noteClaudeCliHealth(cfg, deps) {
	const store = deps?.store ?? ensureAuthProfileStore(void 0, { allowKeychainPrompt: false });
	const credential = (deps?.readClaudeCliCredentials ?? (() => readClaudeCliCredentialsCached({ allowKeychainPrompt: false })))();
	if (!hasClaudeCliConfigSignals(cfg) && !hasClaudeCliStoreSignals(store) && !credential) return;
	const env = deps?.env ?? process.env;
	const command = resolveClaudeCliCommand(cfg);
	const commandPath = (deps?.resolveCommandPath ?? ((rawCommand, nextEnv) => resolveExecutablePath(rawCommand, { env: nextEnv })))(command, env);
	const workspaceDir = deps?.workspaceDir ?? resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
	const projectDir = resolveClaudeCliProjectDirForWorkspace({
		workspaceDir,
		homeDir: deps?.homeDir
	});
	const workspaceHealth = probeDirectoryHealth(workspaceDir);
	const projectDirHealth = probeDirectoryHealth(projectDir);
	const authStorePath = resolveAuthStorePathForDisplay();
	const storedProfile = store.profiles[CLAUDE_CLI_PROFILE_ID];
	const lines = [];
	const fixHints = [];
	if (commandPath) lines.push(`- Binary: ${shortenHomePath(commandPath)}.`);
	else {
		lines.push(`- Binary: command "${command}" was not found on PATH.`);
		fixHints.push("- Fix: install Claude CLI or set agents.defaults.cliBackends.claude-cli.command to the real binary path.");
	}
	if (credential) lines.push(`- Headless Claude auth: OK (${formatCredentialLabel(credential)}).`);
	else {
		lines.push("- Headless Claude auth: unavailable without interactive prompting.");
		fixHints.push(`- Fix: run ${formatCliCommand("claude auth login")}, then ${formatCliCommand("openclaw models auth login --provider anthropic --method cli --set-default")}.`);
	}
	if (!storedProfile) {
		lines.push(`- OpenClaw auth profile: missing (${CLAUDE_CLI_PROFILE_ID}) in ${authStorePath}.`);
		fixHints.push(`- Fix: run ${formatCliCommand("openclaw models auth login --provider anthropic --method cli --set-default")}.`);
	} else if (storedProfile.provider !== CLAUDE_CLI_PROVIDER) {
		lines.push(`- OpenClaw auth profile: ${CLAUDE_CLI_PROFILE_ID} is wired to provider "${storedProfile.provider}" instead of "${CLAUDE_CLI_PROVIDER}".`);
		fixHints.push(`- Fix: rerun ${formatCliCommand("openclaw models auth login --provider anthropic --method cli --set-default")} to rewrite the profile cleanly.`);
	} else lines.push(`- OpenClaw auth profile: ${CLAUDE_CLI_PROFILE_ID} (provider ${CLAUDE_CLI_PROVIDER}).`);
	lines.push(formatWorkspaceHealthLine(workspaceDir, workspaceHealth));
	if (workspaceHealth === "readonly" || workspaceHealth === "unreadable" || workspaceHealth === "not_directory") fixHints.push("- Fix: make the workspace a readable, writable directory for the gateway user.");
	lines.push(formatProjectDirHealthLine(projectDir, projectDirHealth));
	if (projectDirHealth === "unreadable" || projectDirHealth === "not_directory") fixHints.push("- Fix: make the Claude project dir readable, or remove the broken path and let Claude recreate it.");
	if (fixHints.length > 0) lines.push(...fixHints);
	(deps?.noteFn ?? note$1)(lines.join("\n"), "Claude CLI");
}
//#endregion
//#region src/commands/doctor-cron-legacy-delivery.ts
function parseLegacyDeliveryHintsInput(payload) {
	return {
		deliver: parseOptionalField(z.boolean(), payload.deliver),
		bestEffortDeliver: parseOptionalField(z.boolean(), payload.bestEffortDeliver),
		channel: parseOptionalField(LowercaseNonEmptyStringFieldSchema, payload.channel),
		provider: parseOptionalField(LowercaseNonEmptyStringFieldSchema, payload.provider),
		to: parseOptionalField(TrimmedNonEmptyStringFieldSchema, payload.to),
		threadId: parseOptionalField(DeliveryThreadIdFieldSchema.transform((value) => String(value)), payload.threadId)
	};
}
function hasLegacyDeliveryHints(payload) {
	const hints = parseLegacyDeliveryHintsInput(payload);
	return hints.deliver !== void 0 || hints.bestEffortDeliver !== void 0 || hints.channel !== void 0 || hints.provider !== void 0 || hints.to !== void 0 || hints.threadId !== void 0;
}
function buildDeliveryFromLegacyPayload(payload) {
	const hints = parseLegacyDeliveryHintsInput(payload);
	const next = { mode: hints.deliver === false ? "none" : "announce" };
	if (hints.channel ?? hints.provider) next.channel = hints.channel ?? hints.provider;
	if (hints.to) next.to = hints.to;
	if (hints.threadId) next.threadId = hints.threadId;
	if (hints.bestEffortDeliver !== void 0) next.bestEffort = hints.bestEffortDeliver;
	return next;
}
function buildDeliveryPatchFromLegacyPayload(payload) {
	const hints = parseLegacyDeliveryHintsInput(payload);
	const next = {};
	let hasPatch = false;
	if (hints.deliver === false) {
		next.mode = "none";
		hasPatch = true;
	} else if (hints.deliver === true || hints.channel || hints.provider || hints.to || hints.threadId || hints.bestEffortDeliver !== void 0) {
		next.mode = "announce";
		hasPatch = true;
	}
	if (hints.channel ?? hints.provider) {
		next.channel = hints.channel ?? hints.provider;
		hasPatch = true;
	}
	if (hints.to) {
		next.to = hints.to;
		hasPatch = true;
	}
	if (hints.threadId) {
		next.threadId = hints.threadId;
		hasPatch = true;
	}
	if (hints.bestEffortDeliver !== void 0) {
		next.bestEffort = hints.bestEffortDeliver;
		hasPatch = true;
	}
	return hasPatch ? next : null;
}
function mergeLegacyDeliveryInto(delivery, payload) {
	const patch = buildDeliveryPatchFromLegacyPayload(payload);
	if (!patch) return {
		delivery,
		mutated: false
	};
	const next = { ...delivery };
	let mutated = false;
	if ("mode" in patch && patch.mode !== next.mode) {
		next.mode = patch.mode;
		mutated = true;
	}
	if ("channel" in patch && patch.channel !== next.channel) {
		next.channel = patch.channel;
		mutated = true;
	}
	if ("to" in patch && patch.to !== next.to) {
		next.to = patch.to;
		mutated = true;
	}
	if ("threadId" in patch && patch.threadId !== next.threadId) {
		next.threadId = patch.threadId;
		mutated = true;
	}
	if ("bestEffort" in patch && patch.bestEffort !== next.bestEffort) {
		next.bestEffort = patch.bestEffort;
		mutated = true;
	}
	return {
		delivery: next,
		mutated
	};
}
function normalizeLegacyDeliveryInput(params) {
	if (!params.payload || !hasLegacyDeliveryHints(params.payload)) return {
		delivery: params.delivery ?? void 0,
		mutated: false
	};
	const nextDelivery = params.delivery ? mergeLegacyDeliveryInto(params.delivery, params.payload) : {
		delivery: buildDeliveryFromLegacyPayload(params.payload),
		mutated: true
	};
	stripLegacyDeliveryFields(params.payload);
	return {
		delivery: nextDelivery.delivery,
		mutated: true
	};
}
function stripLegacyDeliveryFields(payload) {
	if ("deliver" in payload) delete payload.deliver;
	if ("channel" in payload) delete payload.channel;
	if ("provider" in payload) delete payload.provider;
	if ("to" in payload) delete payload.to;
	if ("threadId" in payload) delete payload.threadId;
	if ("bestEffortDeliver" in payload) delete payload.bestEffortDeliver;
}
//#endregion
//#region src/commands/doctor-cron-payload-migration.ts
function normalizeChannel(value) {
	return normalizeOptionalLowercaseString(value) ?? "";
}
function migrateLegacyCronPayload(payload) {
	let mutated = false;
	const channelValue = readStringValue(payload.channel);
	const providerValue = readStringValue(payload.provider);
	const nextChannel = typeof channelValue === "string" && channelValue.trim().length > 0 ? normalizeChannel(channelValue) : typeof providerValue === "string" && providerValue.trim().length > 0 ? normalizeChannel(providerValue) : "";
	if (nextChannel) {
		if (channelValue !== nextChannel) {
			payload.channel = nextChannel;
			mutated = true;
		}
	}
	if ("provider" in payload) {
		delete payload.provider;
		mutated = true;
	}
	return mutated;
}
//#endregion
//#region src/commands/doctor-cron-store-migration.ts
function incrementIssue(issues, key) {
	issues[key] = (issues[key] ?? 0) + 1;
}
function normalizePayloadKind(payload) {
	const raw = normalizeOptionalLowercaseString(payload.kind) ?? "";
	if (raw === "agentturn") {
		if (payload.kind !== "agentTurn") {
			payload.kind = "agentTurn";
			return true;
		}
		return false;
	}
	if (raw === "systemevent") {
		if (payload.kind !== "systemEvent") {
			payload.kind = "systemEvent";
			return true;
		}
		return false;
	}
	return false;
}
function inferPayloadIfMissing(raw) {
	const message = normalizeOptionalString(raw.message) ?? "";
	const text = normalizeOptionalString(raw.text) ?? "";
	const command = normalizeOptionalString(raw.command) ?? "";
	if (message) {
		raw.payload = {
			kind: "agentTurn",
			message
		};
		return true;
	}
	if (text) {
		raw.payload = {
			kind: "systemEvent",
			text
		};
		return true;
	}
	if (command) {
		raw.payload = {
			kind: "systemEvent",
			text: command
		};
		return true;
	}
	return false;
}
function copyTopLevelAgentTurnFields(raw, payload) {
	let mutated = false;
	const copyTrimmedString = (field) => {
		if (normalizeOptionalString(payload[field])) return;
		const value = normalizeOptionalString(raw[field]);
		if (value) {
			payload[field] = value;
			mutated = true;
		}
	};
	copyTrimmedString("model");
	copyTrimmedString("thinking");
	if (typeof payload.timeoutSeconds !== "number" && typeof raw.timeoutSeconds === "number" && Number.isFinite(raw.timeoutSeconds)) {
		payload.timeoutSeconds = Math.max(0, Math.floor(raw.timeoutSeconds));
		mutated = true;
	}
	if (typeof payload.allowUnsafeExternalContent !== "boolean" && typeof raw.allowUnsafeExternalContent === "boolean") {
		payload.allowUnsafeExternalContent = raw.allowUnsafeExternalContent;
		mutated = true;
	}
	if (typeof payload.deliver !== "boolean" && typeof raw.deliver === "boolean") {
		payload.deliver = raw.deliver;
		mutated = true;
	}
	const channel = normalizeOptionalString(raw.channel);
	if (typeof payload.channel !== "string" && channel) {
		payload.channel = channel;
		mutated = true;
	}
	const to = normalizeOptionalString(raw.to);
	if (typeof payload.to !== "string" && to) {
		payload.to = to;
		mutated = true;
	}
	const rawThreadId = normalizeOptionalString(raw.threadId);
	if (!("threadId" in payload) && (typeof raw.threadId === "number" && Number.isFinite(raw.threadId) || Boolean(rawThreadId))) {
		payload.threadId = rawThreadId ?? raw.threadId;
		mutated = true;
	}
	if (typeof payload.bestEffortDeliver !== "boolean" && typeof raw.bestEffortDeliver === "boolean") {
		payload.bestEffortDeliver = raw.bestEffortDeliver;
		mutated = true;
	}
	const provider = normalizeOptionalString(raw.provider);
	if (typeof payload.provider !== "string" && provider) {
		payload.provider = provider;
		mutated = true;
	}
	return mutated;
}
function stripLegacyTopLevelFields(raw) {
	if ("model" in raw) delete raw.model;
	if ("thinking" in raw) delete raw.thinking;
	if ("timeoutSeconds" in raw) delete raw.timeoutSeconds;
	if ("allowUnsafeExternalContent" in raw) delete raw.allowUnsafeExternalContent;
	if ("message" in raw) delete raw.message;
	if ("text" in raw) delete raw.text;
	if ("deliver" in raw) delete raw.deliver;
	if ("channel" in raw) delete raw.channel;
	if ("to" in raw) delete raw.to;
	if ("threadId" in raw) delete raw.threadId;
	if ("bestEffortDeliver" in raw) delete raw.bestEffortDeliver;
	if ("provider" in raw) delete raw.provider;
	if ("command" in raw) delete raw.command;
	if ("timeout" in raw) delete raw.timeout;
}
function normalizeStoredCronJobs(jobs) {
	const issues = {};
	let mutated = false;
	for (const raw of jobs) {
		const jobIssues = /* @__PURE__ */ new Set();
		const trackIssue = (key) => {
			if (jobIssues.has(key)) return;
			jobIssues.add(key);
			incrementIssue(issues, key);
		};
		const state = raw.state;
		if (!state || typeof state !== "object" || Array.isArray(state)) {
			raw.state = {};
			mutated = true;
		}
		const idNorm = normalizeCronJobIdentityFields(raw);
		if (idNorm.mutated) mutated = true;
		if (idNorm.legacyJobIdIssue) trackIssue("jobId");
		if (typeof raw.schedule === "string") {
			raw.schedule = {
				kind: "cron",
				expr: raw.schedule.trim()
			};
			mutated = true;
			trackIssue("legacyScheduleString");
		}
		const nameRaw = raw.name;
		if (typeof nameRaw !== "string" || nameRaw.trim().length === 0) {
			raw.name = inferLegacyName({
				schedule: raw.schedule,
				payload: raw.payload
			});
			mutated = true;
		} else raw.name = nameRaw.trim();
		const desc = normalizeOptionalString(raw.description);
		if (raw.description !== desc) {
			raw.description = desc;
			mutated = true;
		}
		if ("sessionKey" in raw) {
			const sessionKey = typeof raw.sessionKey === "string" ? normalizeOptionalString(raw.sessionKey) : void 0;
			if (raw.sessionKey !== sessionKey) {
				raw.sessionKey = sessionKey;
				mutated = true;
			}
		}
		if (typeof raw.enabled !== "boolean") {
			raw.enabled = true;
			mutated = true;
		}
		const wakeModeRaw = normalizeOptionalLowercaseString(raw.wakeMode) ?? "";
		if (wakeModeRaw === "next-heartbeat") {
			if (raw.wakeMode !== "next-heartbeat") {
				raw.wakeMode = "next-heartbeat";
				mutated = true;
			}
		} else if (wakeModeRaw === "now") {
			if (raw.wakeMode !== "now") {
				raw.wakeMode = "now";
				mutated = true;
			}
		} else {
			raw.wakeMode = "now";
			mutated = true;
		}
		const payload = raw.payload;
		if ((!payload || typeof payload !== "object" || Array.isArray(payload)) && inferPayloadIfMissing(raw)) {
			mutated = true;
			trackIssue("legacyTopLevelPayloadFields");
		}
		const payloadRecord = raw.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload) ? raw.payload : null;
		if (payloadRecord) {
			if (normalizePayloadKind(payloadRecord)) {
				mutated = true;
				trackIssue("legacyPayloadKind");
			}
			if (!payloadRecord.kind) {
				if (normalizeOptionalString(payloadRecord.message)) {
					payloadRecord.kind = "agentTurn";
					mutated = true;
					trackIssue("legacyPayloadKind");
				} else if (normalizeOptionalString(payloadRecord.text)) {
					payloadRecord.kind = "systemEvent";
					mutated = true;
					trackIssue("legacyPayloadKind");
				}
			}
			if (payloadRecord.kind === "agentTurn" && copyTopLevelAgentTurnFields(raw, payloadRecord)) mutated = true;
		}
		const hadLegacyTopLevelPayloadFields = "model" in raw || "thinking" in raw || "timeoutSeconds" in raw || "allowUnsafeExternalContent" in raw || "message" in raw || "text" in raw || "command" in raw || "timeout" in raw;
		const hadLegacyTopLevelDeliveryFields = "deliver" in raw || "channel" in raw || "to" in raw || "threadId" in raw || "bestEffortDeliver" in raw || "provider" in raw;
		if (hadLegacyTopLevelPayloadFields || hadLegacyTopLevelDeliveryFields) {
			stripLegacyTopLevelFields(raw);
			mutated = true;
			if (hadLegacyTopLevelPayloadFields) trackIssue("legacyTopLevelPayloadFields");
			if (hadLegacyTopLevelDeliveryFields) trackIssue("legacyTopLevelDeliveryFields");
		}
		if (payloadRecord) {
			const hadLegacyPayloadProvider = Boolean(normalizeOptionalString(payloadRecord.provider));
			if (migrateLegacyCronPayload(payloadRecord)) {
				mutated = true;
				if (hadLegacyPayloadProvider) trackIssue("legacyPayloadProvider");
			}
		}
		const schedule = raw.schedule;
		if (schedule && typeof schedule === "object" && !Array.isArray(schedule)) {
			const sched = schedule;
			const kind = normalizeOptionalLowercaseString(sched.kind) ?? "";
			if (!kind && ("at" in sched || "atMs" in sched)) {
				sched.kind = "at";
				mutated = true;
			}
			const atRaw = normalizeOptionalString(sched.at) ?? "";
			const atMsRaw = sched.atMs;
			const parsedAtMs = typeof atMsRaw === "number" ? atMsRaw : typeof atMsRaw === "string" ? parseAbsoluteTimeMs(atMsRaw) : atRaw ? parseAbsoluteTimeMs(atRaw) : null;
			if (parsedAtMs !== null) {
				sched.at = new Date(parsedAtMs).toISOString();
				if ("atMs" in sched) delete sched.atMs;
				mutated = true;
			}
			const everyMsRaw = sched.everyMs;
			const everyMsCoerced = coerceFiniteScheduleNumber(everyMsRaw);
			const everyMs = everyMsCoerced !== void 0 ? Math.floor(everyMsCoerced) : null;
			if (everyMs !== null && everyMsRaw !== everyMs) {
				sched.everyMs = everyMs;
				mutated = true;
			}
			if ((kind === "every" || sched.kind === "every") && everyMs !== null) {
				const anchorRaw = sched.anchorMs;
				const anchorCoerced = coerceFiniteScheduleNumber(anchorRaw);
				const normalizedAnchor = anchorCoerced !== void 0 ? Math.max(0, Math.floor(anchorCoerced)) : typeof raw.createdAtMs === "number" && Number.isFinite(raw.createdAtMs) ? Math.max(0, Math.floor(raw.createdAtMs)) : typeof raw.updatedAtMs === "number" && Number.isFinite(raw.updatedAtMs) ? Math.max(0, Math.floor(raw.updatedAtMs)) : null;
				if (normalizedAnchor !== null && anchorRaw !== normalizedAnchor) {
					sched.anchorMs = normalizedAnchor;
					mutated = true;
				}
			}
			const exprRaw = normalizeOptionalString(sched.expr) ?? "";
			const legacyCronRaw = normalizeOptionalString(sched.cron) ?? "";
			let normalizedExpr = exprRaw;
			if (!normalizedExpr && legacyCronRaw) {
				normalizedExpr = legacyCronRaw;
				sched.expr = normalizedExpr;
				mutated = true;
				trackIssue("legacyScheduleCron");
			}
			if (typeof sched.expr === "string" && sched.expr !== normalizedExpr) {
				sched.expr = normalizedExpr;
				mutated = true;
			}
			if ("cron" in sched) {
				delete sched.cron;
				mutated = true;
				trackIssue("legacyScheduleCron");
			}
			if ((kind === "cron" || sched.kind === "cron") && normalizedExpr) {
				const explicitStaggerMs = normalizeCronStaggerMs(sched.staggerMs);
				const defaultStaggerMs = resolveDefaultCronStaggerMs(normalizedExpr);
				const targetStaggerMs = explicitStaggerMs ?? defaultStaggerMs;
				if (targetStaggerMs === void 0) {
					if ("staggerMs" in sched) {
						delete sched.staggerMs;
						mutated = true;
					}
				} else if (sched.staggerMs !== targetStaggerMs) {
					sched.staggerMs = targetStaggerMs;
					mutated = true;
				}
			}
		}
		const delivery = raw.delivery;
		if (delivery && typeof delivery === "object" && !Array.isArray(delivery)) {
			const modeRaw = delivery.mode;
			if (typeof modeRaw === "string") {
				if ((normalizeOptionalLowercaseString(modeRaw) ?? "") === "deliver") {
					delivery.mode = "announce";
					mutated = true;
					trackIssue("legacyDeliveryMode");
				}
			} else if (modeRaw === void 0 || modeRaw === null) {
				delivery.mode = "announce";
				mutated = true;
			}
		}
		const isolation = raw.isolation;
		if (isolation && typeof isolation === "object" && !Array.isArray(isolation)) {
			delete raw.isolation;
			mutated = true;
		}
		const payloadKind = payloadRecord && typeof payloadRecord.kind === "string" ? payloadRecord.kind : "";
		const rawSessionTarget = normalizeOptionalString(raw.sessionTarget) ?? "";
		const loweredSessionTarget = normalizeLowercaseStringOrEmpty(rawSessionTarget);
		if (loweredSessionTarget === "main" || loweredSessionTarget === "isolated") {
			if (raw.sessionTarget !== loweredSessionTarget) {
				raw.sessionTarget = loweredSessionTarget;
				mutated = true;
			}
		} else if (loweredSessionTarget.startsWith("session:")) {
			const customSessionId = rawSessionTarget.slice(8).trim();
			if (customSessionId) {
				const normalizedSessionTarget = `session:${customSessionId}`;
				if (raw.sessionTarget !== normalizedSessionTarget) {
					raw.sessionTarget = normalizedSessionTarget;
					mutated = true;
				}
			}
		} else if (loweredSessionTarget === "current") {
			if (raw.sessionTarget !== "isolated") {
				raw.sessionTarget = "isolated";
				mutated = true;
			}
		} else {
			const inferredSessionTarget = payloadKind === "agentTurn" ? "isolated" : "main";
			if (raw.sessionTarget !== inferredSessionTarget) {
				raw.sessionTarget = inferredSessionTarget;
				mutated = true;
			}
		}
		const sessionTarget = normalizeOptionalLowercaseString(raw.sessionTarget) ?? "";
		const isIsolatedAgentTurn = sessionTarget === "isolated" || sessionTarget === "current" || sessionTarget.startsWith("session:") || sessionTarget === "" && payloadKind === "agentTurn";
		const hasDelivery = delivery && typeof delivery === "object" && !Array.isArray(delivery);
		const normalizedLegacy = normalizeLegacyDeliveryInput({
			delivery: hasDelivery ? delivery : null,
			payload: payloadRecord
		});
		if (isIsolatedAgentTurn && payloadKind === "agentTurn") {
			if (!hasDelivery && normalizedLegacy.delivery) {
				raw.delivery = normalizedLegacy.delivery;
				mutated = true;
			} else if (!hasDelivery) {
				raw.delivery = { mode: "announce" };
				mutated = true;
			} else if (normalizedLegacy.mutated && normalizedLegacy.delivery) {
				raw.delivery = normalizedLegacy.delivery;
				mutated = true;
			}
		} else if (normalizedLegacy.mutated && normalizedLegacy.delivery) {
			raw.delivery = normalizedLegacy.delivery;
			mutated = true;
		}
	}
	return {
		issues,
		jobs,
		mutated
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
function migrateLegacyNotifyFallback(params) {
	let changed = false;
	const warnings = [];
	for (const raw of params.jobs) {
		if (!("notify" in raw)) continue;
		const jobName = normalizeOptionalString(raw.name) ?? normalizeOptionalString(raw.id) ?? "<unnamed>";
		if (!(raw.notify === true)) {
			delete raw.notify;
			changed = true;
			continue;
		}
		const delivery = raw.delivery && typeof raw.delivery === "object" && !Array.isArray(raw.delivery) ? raw.delivery : null;
		const mode = normalizeOptionalLowercaseString(delivery?.mode);
		const to = normalizeOptionalString(delivery?.to);
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
	const legacyWebhook = normalizeOptionalString(params.cfg.cron?.webhook);
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
	const container = Boolean(resolveDaemonContainerContext(env));
	const fileLog = (() => {
		try {
			return getResolvedLoggerSettings().file;
		} catch {
			return null;
		}
	})();
	if (platform === "linux" && isSystemdUnavailableDetail(runtime.detail)) {
		hints.push(...renderSystemdUnavailableHints({
			wsl: isWSLEnv(),
			kind: classifySystemdUnavailableDetail(runtime.detail),
			container
		}));
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
	if (!await params.prompter.confirmRuntimeRepair({
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
				note$1(renderSystemdUnavailableHints({
					wsl: await isWSL(),
					kind: "generic_unavailable"
				}).join("\n"), "Gateway");
				return;
			}
		}
		note$1("Gateway service not installed.", "Gateway");
		if (params.cfg.gateway?.mode !== "remote") {
			if (await params.prompter.confirmRuntimeRepair({
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
		if (await params.prompter.confirmRuntimeRepair({
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
		if (await params.prompter.confirmRuntimeRepair({
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
			error: `gateway memory probe unavailable: ${formatErrorMessage(err)}`
		};
	}
}
//#endregion
//#region src/commands/doctor-gateway-auth-token.ts
async function resolveGatewayAuthTokenForService(cfg, env) {
	const resolved = await resolveGatewayAuthToken({
		cfg,
		env,
		unresolvedReasonStyle: "detailed",
		envFallback: "always"
	});
	if (resolved.token) return { token: resolved.token };
	if (!resolved.secretRefConfigured) return {};
	if (resolved.unresolvedRefReason?.includes("resolved to an empty value")) return { unavailableReason: resolved.unresolvedRefReason };
	return { unavailableReason: `gateway.auth.token SecretRef is configured but unresolved (${resolved.unresolvedRefReason ?? "unknown reason"}).` };
}
//#endregion
//#region src/commands/doctor-gateway-services.ts
const execFileAsync = promisify(execFile);
function detectGatewayRuntime(programArguments) {
	const first = programArguments?.[0];
	if (first) {
		const base = normalizeLowercaseStringOrEmpty(path.basename(first));
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
	await execFileAsync("launchctl", [
		"bootout",
		typeof process.getuid === "function" ? `gui/${process.getuid()}` : "gui/501",
		params.plistPath
	]).catch(() => void 0);
	await execFileAsync("launchctl", ["unload", params.plistPath]).catch(() => void 0);
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
		note$1("System Node 22 LTS (22.14+) or Node 24 not found. Install via Homebrew/apt/choco and rerun doctor to migrate off Bun/version managers.", "Gateway runtime");
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
	if (!(needsAggressive ? await prompter.confirmAggressiveAutoFix({
		message: "Overwrite gateway service config with current defaults now?",
		initialValue: prompter.shouldForce
	}) : await prompter.confirmAutoFix({
		message: "Update gateway service config to the recommended defaults now?",
		initialValue: true
	}))) return;
	const updateRepairMode = isDoctorUpdateRepairMode(prompter.repairMode);
	const serviceEmbeddedToken = readEmbeddedGatewayToken(command);
	const gatewayTokenForRepair = expectedGatewayToken ?? serviceEmbeddedToken;
	const configuredGatewayToken = typeof cfg.gateway?.auth?.token === "string" ? normalizeOptionalString(cfg.gateway.auth.token) : void 0;
	let cfgForServiceInstall = cfg;
	if (!updateRepairMode && !tokenRefConfigured && !configuredGatewayToken && gatewayTokenForRepair) {
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
		await (updateRepairMode ? service.stage : service.install)({
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
		if (await prompter.confirmRuntimeRepair({
			message: "Remove legacy gateway services now?",
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
//#region src/commands/doctor-memory-search.ts
function resolveSuggestedRemoteMemoryProvider() {
	return listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata().find((provider) => provider.transport === "remote")?.providerId;
}
async function resolveRuntimeMemoryAuditContext(cfg) {
	const manager = (await getActiveMemorySearchManager({
		cfg,
		agentId: resolveDefaultAgentId(cfg),
		purpose: "status"
	})).manager;
	if (!manager) return null;
	try {
		const status = manager.status();
		const customQmd = isRecord(status.custom) && isRecord(status.custom.qmd) ? status.custom.qmd : null;
		return {
			workspaceDir: status.workspaceDir?.trim(),
			backend: status.backend,
			dbPath: status.dbPath,
			qmdCollections: typeof customQmd?.collections === "number" ? customQmd.collections : void 0
		};
	} finally {
		await manager.close?.().catch(() => void 0);
	}
}
function buildMemoryRecallIssueNote(audit) {
	if (audit.issues.length === 0) return null;
	const issueLines = audit.issues.map((issue) => `- ${issue.message}`);
	const guidance = audit.issues.some((issue) => issue.fixable) ? `Fix: ${formatCliCommand("openclaw doctor --fix")} or ${formatCliCommand("openclaw memory status --fix")}` : `Verify: ${formatCliCommand("openclaw memory status --deep")}`;
	return [
		"Memory recall artifacts need attention:",
		...issueLines,
		`Recall store: ${audit.storePath}`,
		guidance
	].join("\n");
}
function buildDreamingArtifactIssueNote(audit) {
	if (audit.issues.length === 0) return null;
	const issueLines = audit.issues.map((issue) => `- ${issue.message}`);
	const hasFixableIssue = audit.issues.some((issue) => issue.fixable);
	return [
		"Dreaming artifacts need attention:",
		...issueLines,
		`Dream corpus: ${audit.sessionCorpusDir}`,
		hasFixableIssue ? `Fix: ${formatCliCommand("openclaw doctor --fix")} or ${formatCliCommand("openclaw memory status --fix")}` : `Verify: ${formatCliCommand("openclaw memory status --deep")}`
	].join("\n");
}
async function noteMemoryRecallHealth(cfg) {
	try {
		const context = await resolveRuntimeMemoryAuditContext(cfg);
		const workspaceDir = context?.workspaceDir?.trim();
		if (!workspaceDir) return;
		const message = buildMemoryRecallIssueNote(await auditShortTermPromotionArtifacts({
			workspaceDir,
			qmd: context?.backend === "qmd" ? {
				dbPath: context.dbPath,
				collections: context.qmdCollections
			} : void 0
		}));
		if (message) note$1(message, "Memory search");
		const dreamingMessage = buildDreamingArtifactIssueNote(await auditDreamingArtifacts({ workspaceDir }));
		if (dreamingMessage) note$1(dreamingMessage, "Memory search");
	} catch (err) {
		note$1(`Memory recall audit could not be completed: ${formatErrorMessage(err)}`, "Memory search");
	}
}
async function maybeRepairMemoryRecallHealth(params) {
	try {
		const context = await resolveRuntimeMemoryAuditContext(params.cfg);
		const workspaceDir = context?.workspaceDir?.trim();
		if (!workspaceDir) return;
		if ((await auditShortTermPromotionArtifacts({
			workspaceDir,
			qmd: context?.backend === "qmd" ? {
				dbPath: context.dbPath,
				collections: context.qmdCollections
			} : void 0
		})).issues.some((issue) => issue.fixable)) {
			if (await params.prompter.confirmRuntimeRepair({
				message: "Normalize memory recall artifacts and remove stale promotion locks?",
				initialValue: true
			})) {
				const repair = await repairShortTermPromotionArtifacts({ workspaceDir });
				if (repair.changed) note$1([
					"Memory recall artifacts repaired:",
					repair.rewroteStore ? `- rewrote recall store${repair.removedInvalidEntries > 0 ? ` (-${repair.removedInvalidEntries} invalid entries)` : ""}` : null,
					repair.removedStaleLock ? "- removed stale promotion lock" : null,
					`Verify: ${formatCliCommand("openclaw memory status --deep")}`
				].filter(Boolean).join("\n"), "Doctor changes");
			}
		}
		if (!(await auditDreamingArtifacts({ workspaceDir })).issues.some((issue) => issue.fixable)) return;
		if (!await params.prompter.confirmRuntimeRepair({
			message: "Archive contaminated dreaming artifacts and reset derived dream corpus state?",
			initialValue: true
		})) return;
		const dreamingRepair = await repairDreamingArtifacts({ workspaceDir });
		if (!dreamingRepair.changed) return;
		note$1([
			"Dreaming artifacts repaired:",
			dreamingRepair.archivedSessionCorpus ? "- archived session corpus" : null,
			dreamingRepair.archivedSessionIngestion ? "- archived session-ingestion state" : null,
			dreamingRepair.archivedDreamsDiary ? "- archived dream diary" : null,
			dreamingRepair.archiveDir ? `- archive dir: ${dreamingRepair.archiveDir}` : null,
			...dreamingRepair.warnings.map((warning) => `- warning: ${warning}`),
			`Verify: ${formatCliCommand("openclaw memory status --deep")}`
		].filter(Boolean).join("\n"), "Doctor changes");
	} catch (err) {
		note$1(`Memory artifact repair could not be completed: ${formatErrorMessage(err)}`, "Memory search");
	}
}
/**
* Check whether memory search has a usable embedding provider.
* Runs as part of `openclaw doctor` — config-only checks where possible;
* may spawn a short-lived probe process when `memory.backend=qmd` to verify
* the configured `qmd` binary is available.
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
	const backendConfig = resolveActiveMemoryBackendConfig({
		cfg,
		agentId
	});
	if (!backendConfig) {
		note$1("No active memory plugin is registered for the current config.", "Memory search");
		return;
	}
	if (backendConfig.backend === "qmd") {
		const qmdCheck = await checkQmdBinaryAvailability({
			command: backendConfig.qmd?.command ?? "qmd",
			env: process.env,
			cwd: resolveAgentWorkspaceDir(cfg, agentId)
		});
		if (!qmdCheck.available) note$1([
			`QMD memory backend is configured, but the qmd binary could not be started (${backendConfig.qmd?.command ?? "qmd"}).`,
			qmdCheck.error ? `Probe error: ${qmdCheck.error}` : null,
			"",
			"Fix (pick one):",
			"- Install the supported QMD package: npm install -g @tobilu/qmd (or bun install -g @tobilu/qmd)",
			`- Set an explicit binary path: ${formatCliCommand("openclaw config set memory.qmd.command /absolute/path/to/qmd")}`,
			`- Or switch back to builtin memory: ${formatCliCommand("openclaw config set memory.backend builtin")}`,
			"",
			`Verify: ${formatCliCommand("openclaw memory status --deep")}`
		].filter(Boolean).join("\n"), "Memory search");
		return;
	}
	if (resolved.provider !== "auto") {
		if (resolved.provider === "local") {
			const suggestedRemoteProvider = resolveSuggestedRemoteMemoryProvider();
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
				suggestedRemoteProvider ? `- Switch to a remote provider: ${formatCliCommand(`openclaw config set agents.defaults.memorySearch.provider ${suggestedRemoteProvider}`)}` : `- Switch to a remote embedding provider in config`,
				"",
				`Verify: ${formatCliCommand("openclaw memory status --deep")}`
			].join("\n"), "Memory search");
			return;
		}
		if (resolved.provider === "lmstudio") {
			if (opts?.gatewayMemoryProbe?.checked && opts.gatewayMemoryProbe.ready) return;
			const gatewayProbeWarning = buildGatewayProbeWarning(opts?.gatewayMemoryProbe);
			note$1([
				gatewayProbeWarning ? "Memory search provider \"lmstudio\" is configured, but the gateway reports embeddings are not ready." : "Memory search provider \"lmstudio\" is configured, but the gateway could not confirm embeddings are ready.",
				gatewayProbeWarning,
				`Verify: ${formatCliCommand("openclaw memory status --deep")}`
			].filter(Boolean).join("\n"), "Memory search");
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
		const envVar = resolvePrimaryMemoryProviderEnvVar(resolved.provider);
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
	const autoSelectProviders = listBuiltinAutoSelectMemoryEmbeddingProviderDoctorMetadata().filter((provider) => provider.transport === "remote");
	for (const provider of autoSelectProviders) if (hasRemoteApiKey || await hasApiKeyForProvider(provider.authProviderId, cfg, agentDir)) return;
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
		`- Set ${formatMemoryProviderEnvVarList(autoSelectProviders)} in your environment`,
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
	const modelPath = normalizeOptionalString(local.modelPath) || (useDefaultFallback ? "hf:ggml-org/embeddinggemma-300m-qat-q8_0-GGUF/embeddinggemma-300m-qat-Q8_0.gguf" : void 0);
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
	const metadata = getBuiltinMemoryEmbeddingProviderDoctorMetadata(provider);
	try {
		await resolveApiKeyForProvider({
			provider: metadata?.authProviderId ?? provider,
			cfg,
			agentDir
		});
		return true;
	} catch {
		return false;
	}
}
function resolvePrimaryMemoryProviderEnvVar(provider) {
	return getBuiltinMemoryEmbeddingProviderDoctorMetadata(provider)?.envVars[0] ?? `${provider.toUpperCase()}_API_KEY`;
}
function formatMemoryProviderEnvVarList(providers) {
	return [...new Set(providers.flatMap((provider) => provider.envVars).filter(Boolean))].join(", ");
}
function buildGatewayProbeWarning(probe) {
	if (!probe?.checked || probe.ready) return null;
	const detail = probe.error?.trim();
	return detail ? `Gateway memory probe for default agent is not ready: ${detail}` : "Gateway memory probe for default agent is not ready.";
}
//#endregion
//#region src/commands/doctor-plugin-manifests.ts
const LEGACY_MANIFEST_CONTRACT_KEYS = [
	"speechProviders",
	"mediaUnderstandingProviders",
	"imageGenerationProviders"
];
const JsonRecordSchema = z.record(z.string(), z.unknown());
function readManifestJson(manifestPath) {
	try {
		return safeParseJsonWithSchema(JsonRecordSchema, fs.readFileSync(manifestPath, "utf-8"));
	} catch {
		return null;
	}
}
function buildLegacyManifestContractMigration(params) {
	const nextRaw = { ...params.raw };
	const parsedContracts = safeParseWithSchema(JsonRecordSchema, params.raw.contracts);
	const nextContracts = parsedContracts ? { ...parsedContracts } : {};
	const changeLines = [];
	for (const key of LEGACY_MANIFEST_CONTRACT_KEYS) {
		if (!(key in params.raw)) continue;
		const legacyValues = normalizeTrimmedStringList(params.raw[key]);
		const contractValues = normalizeTrimmedStringList(nextContracts[key]);
		if (legacyValues.length > 0 && contractValues.length === 0) {
			nextContracts[key] = legacyValues;
			changeLines.push(`- ${shortenHomePath(params.manifestPath)}: moved ${key} to contracts.${key}`);
		} else changeLines.push(`- ${shortenHomePath(params.manifestPath)}: removed legacy ${key} (kept contracts.${key})`);
		delete nextRaw[key];
	}
	if (changeLines.length === 0) return null;
	if (Object.keys(nextContracts).length > 0) nextRaw.contracts = nextContracts;
	else delete nextRaw.contracts;
	const pluginId = normalizeOptionalString(params.raw.id) ?? params.manifestPath;
	return {
		manifestPath: params.manifestPath,
		pluginId,
		nextRaw,
		changeLines
	};
}
function collectLegacyPluginManifestContractMigrations(params) {
	const seen = /* @__PURE__ */ new Set();
	const migrations = [];
	for (const plugin of loadPluginManifestRegistry({
		cache: false,
		...params?.env ? { env: params.env } : {}
	}).plugins) {
		if (seen.has(plugin.manifestPath)) continue;
		seen.add(plugin.manifestPath);
		const raw = readManifestJson(plugin.manifestPath);
		if (!raw) continue;
		const migration = buildLegacyManifestContractMigration({
			manifestPath: plugin.manifestPath,
			raw
		});
		if (migration) migrations.push(migration);
	}
	return migrations.toSorted((left, right) => left.manifestPath.localeCompare(right.manifestPath));
}
async function maybeRepairLegacyPluginManifestContracts(params) {
	const migrations = collectLegacyPluginManifestContractMigrations(params.env ? { env: params.env } : void 0);
	if (migrations.length === 0) return;
	note$1(["Legacy plugin manifest capability keys detected.", ...migrations.flatMap((migration) => migration.changeLines)].join("\n"), "Plugin manifests");
	if (!(params.prompter.shouldRepair || await params.prompter.confirmAutoFix({
		message: "Rewrite legacy plugin manifest capability keys into contracts now?",
		initialValue: true
	}))) return;
	const applied = [];
	for (const migration of migrations) try {
		fs.writeFileSync(migration.manifestPath, `${JSON.stringify(migration.nextRaw, null, 2)}\n`, "utf-8");
		applied.push(...migration.changeLines);
	} catch (error) {
		params.runtime.error(`Failed to rewrite legacy plugin manifest at ${migration.manifestPath}: ${String(error)}`);
	}
	if (applied.length > 0) note$1(applied.join("\n"), "Doctor changes");
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
		if ((error?.stderr || error?.message || "").includes("No such image")) return false;
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
		if (await prompter.confirmRuntimeRepair({
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
		if (resolveSandboxScope({ scope: agentSandbox.scope ?? globalSandbox?.scope }) !== "shared") continue;
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
function execSecurityRank(value) {
	switch (value) {
		case "deny": return 0;
		case "allowlist": return 1;
		case "full": return 2;
	}
	throw new Error("Unsupported exec security value");
}
function execAskRank(value) {
	switch (value) {
		case "off": return 0;
		case "on-miss": return 1;
		case "always": return 2;
	}
	throw new Error("Unsupported exec ask value");
}
function collectExecPolicyConflictWarnings(cfg) {
	const warnings = [];
	const approvals = loadExecApprovals();
	const defaultRequestedSecuritySource = "OpenClaw default (full)";
	const defaultRequestedAskSource = "OpenClaw default (off)";
	const maybeWarn = (params) => {
		const scopeExecConfig = params.scopeExecConfig;
		const globalExecConfig = params.globalExecConfig;
		if (!scopeExecConfig?.security && !scopeExecConfig?.ask && !globalExecConfig?.security && !globalExecConfig?.ask) return;
		const snapshot = resolveExecPolicyScopeSnapshot({
			approvals,
			scopeExecConfig,
			globalExecConfig,
			configPath: params.scopeLabel === "tools.exec" ? "tools.exec" : `agents.list.${params.agentId}.tools.exec`,
			scopeLabel: params.scopeLabel,
			agentId: params.agentId
		});
		const securityConfigured = snapshot.security.requestedSource !== defaultRequestedSecuritySource;
		const askConfigured = snapshot.ask.requestedSource !== defaultRequestedAskSource;
		const securityConflict = securityConfigured && execSecurityRank(snapshot.security.requested) > execSecurityRank(snapshot.security.effective);
		const askConflict = askConfigured && execAskRank(snapshot.ask.requested) < execAskRank(snapshot.ask.effective);
		if (!securityConflict && !askConflict) return;
		const configParts = [];
		const hostParts = [];
		if (securityConflict) {
			configParts.push(`${snapshot.security.requestedSource}="${snapshot.security.requested}"`);
			hostParts.push(`${snapshot.security.hostSource}="${snapshot.security.host}"`);
		}
		if (askConflict) {
			configParts.push(`${snapshot.ask.requestedSource}="${snapshot.ask.requested}"`);
			hostParts.push(`${snapshot.ask.hostSource}="${snapshot.ask.host}"`);
		}
		warnings.push([
			`- ${params.scopeLabel} is broader than the host exec policy.`,
			`  Config: ${configParts.join(", ")}`,
			`  Host: ${hostParts.join(", ")}`,
			`  Effective host exec stays security="${snapshot.security.effective}" ask="${snapshot.ask.effective}" because the stricter side wins.`,
			"  Headless runs like isolated cron cannot answer approval prompts; align both files or enable Web UI, terminal UI, or chat exec approvals.",
			`  Inspect with: ${formatCliCommand("openclaw approvals get --gateway")}`
		].join("\n"));
	};
	maybeWarn({
		scopeLabel: "tools.exec",
		scopeExecConfig: cfg.tools?.exec
	});
	for (const agent of cfg.agents?.list ?? []) maybeWarn({
		scopeLabel: `agents.list.${agent.id}.tools.exec`,
		scopeExecConfig: agent.tools?.exec,
		globalExecConfig: cfg.tools?.exec,
		agentId: agent.id
	});
	return warnings;
}
function collectDurableExecApprovalWarnings(cfg) {
	return [];
}
async function noteSecurityWarnings(cfg) {
	const warnings = [];
	const auditHint = `- Run: ${formatCliCommand("openclaw security audit --deep")}`;
	if (cfg.approvals?.exec?.enabled === false) warnings.push("- Note: approvals.exec.enabled=false disables approval forwarding only.", "  Host exec gating still comes from ~/.openclaw/exec-approvals.json.", `  Check local policy with: ${formatCliCommand("openclaw approvals get --gateway")}`);
	warnings.push(...collectImplicitHeartbeatDirectPolicyWarnings(cfg));
	warnings.push(...collectExecPolicyConflictWarnings(cfg));
	warnings.push(...collectDurableExecApprovalWarnings(cfg));
	const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
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
		tailscaleMode
	});
	const authToken = normalizeOptionalString(resolvedAuth.token) ?? "";
	const authPassword = normalizeOptionalString(resolvedAuth.password) ?? "";
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
function tryResolveNativeRealPath(targetPath) {
	try {
		return fs.realpathSync.native(targetPath);
	} catch {
		return null;
	}
}
function isReachableConfiguredAgentDir(params) {
	if (params.dirName === params.agentId) return true;
	const rawDir = path.join(params.agentsRoot, params.dirName, "agent");
	const normalizedDir = path.join(params.agentsRoot, params.agentId, "agent");
	const rawRealPath = tryResolveNativeRealPath(rawDir);
	const normalizedRealPath = tryResolveNativeRealPath(normalizedDir);
	return rawRealPath !== null && rawRealPath === normalizedRealPath;
}
function formatOrphanAgentDirLabel(entry) {
	return entry.dirName === entry.agentId ? entry.agentId : `${entry.dirName} (id ${entry.agentId})`;
}
function formatOrphanAgentDirPreview(entries, limit = 3) {
	const labels = entries.slice(0, limit).map(formatOrphanAgentDirLabel);
	const remaining = entries.length - labels.length;
	if (remaining > 0) return `${labels.join(", ")}, and ${remaining} more`;
	return labels.join(", ");
}
function listOrphanAgentDirs(cfg, stateDir) {
	const configuredIds = /* @__PURE__ */ new Set();
	configuredIds.add(normalizeAgentId(resolveDefaultAgentId(cfg)));
	for (const entry of listAgentEntries(cfg)) configuredIds.add(normalizeAgentId(entry.id));
	const agentsRoot = path.join(stateDir, "agents");
	try {
		return fs.readdirSync(agentsRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => ({
			dirName: entry.name,
			agentId: normalizeAgentId(entry.name)
		})).filter(({ dirName, agentId }) => {
			if (!existsDir(path.join(agentsRoot, dirName, "agent"))) return false;
			if (!configuredIds.has(agentId)) return true;
			return !isReachableConfiguredAgentDir({
				agentsRoot,
				dirName,
				agentId
			});
		}).toSorted((left, right) => left.agentId.localeCompare(right.agentId) || left.dirName.localeCompare(right.dirName));
	} catch {
		return [];
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
function isPairingPolicy(value) {
	return normalizeOptionalLowercaseString(value) === "pairing";
}
function hasPairingPolicy(value) {
	const record = asNullableObjectRecord(value);
	if (!record) return false;
	if (isPairingPolicy(record.dmPolicy)) return true;
	const dm = asNullableObjectRecord(record.dm);
	if (dm && isPairingPolicy(dm.policy)) return true;
	const accounts = asNullableObjectRecord(record.accounts);
	if (!accounts) return false;
	for (const accountCfg of Object.values(accounts)) if (hasPairingPolicy(accountCfg)) return true;
	return false;
}
function isSlashRoutingSessionKey(sessionKey) {
	const raw = normalizeOptionalLowercaseString(sessionKey);
	if (!raw) return false;
	const scoped = parseAgentSessionKey(raw)?.rest ?? raw;
	return /^[^:]+:slash:[^:]+(?:$|:)/.test(scoped);
}
function shouldRequireOAuthDir(cfg, env) {
	if (env.OPENCLAW_OAUTH_DIR?.trim()) return true;
	const channels = asNullableObjectRecord(cfg.channels);
	if (!channels) return false;
	for (const channelId of listBundledChannelPluginIds()) if (hasBundledChannelPersistedAuthState({
		channelId,
		cfg,
		env
	})) return true;
	for (const [channelId, channelCfg] of Object.entries(channels)) {
		if (channelId === "defaults" || channelId === "modelByChannel") continue;
		if (hasPairingPolicy(channelCfg)) return true;
	}
	return false;
}
function shouldSuppressOrphanTranscriptWarning(cfg, agentId) {
	const backendConfig = resolveMemoryBackendConfig({
		cfg,
		agentId
	});
	return backendConfig?.backend === "qmd" && backendConfig.qmd?.sessions.enabled === true;
}
async function noteStateIntegrity(cfg, prompter, configPath) {
	const warnings = [];
	const changes = [];
	const noteFn = prompter.note ?? note$1;
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
	const suppressOrphanTranscriptWarning = shouldSuppressOrphanTranscriptWarning(cfg, agentId);
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
		if (await prompter.confirmRuntimeRepair({
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
		if (await prompter.confirmRuntimeRepair({
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
			if (await prompter.confirmRuntimeRepair({
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
			if (await prompter.confirmRuntimeRepair({
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
				if (await prompter.confirmRuntimeRepair({
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
				if (await prompter.confirmRuntimeRepair({
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
	const orphanAgentDirs = listOrphanAgentDirs(cfg, stateDir);
	if (orphanAgentDirs.length > 0) warnings.push([
		`- Found ${countLabel(orphanAgentDirs.length, "agent directory", "agent directories")} on disk without a matching agents.list entry.`,
		"  These agents can still have sessions/auth state on disk, but config-driven routing, identity, and model selection will ignore them.",
		`  Examples: ${formatOrphanAgentDirPreview(orphanAgentDirs)}`,
		`  Restore the missing agents.list entries or remove stale dirs after confirming they are no longer needed: ${shortenHomePath(path.join(stateDir, "agents"))}`
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
		if (orphanTranscriptPaths.length > 0 && !suppressOrphanTranscriptWarning) {
			const orphanCount = countLabel(orphanTranscriptPaths.length, "orphan transcript file");
			const orphanPreview = formatFilePreview(orphanTranscriptPaths);
			warnings.push([
				`- Found ${orphanCount} in ${displaySessionsDir}.`,
				"  These .jsonl files are no longer referenced by sessions.json, so they are not part of any active session history.",
				"  Doctor can archive them safely by renaming each file to *.deleted.<timestamp>.",
				`  Examples: ${orphanPreview}`
			].join("\n"));
			if (await prompter.confirmRuntimeRepair({
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
	if (warnings.length > 0) noteFn(warnings.join("\n"), "State integrity");
	if (changes.length > 0) noteFn(changes.join("\n"), "Doctor changes");
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
function noteFlowRecoveryHints() {
	const suspicious = listTaskFlowRecords().flatMap((flow) => {
		const tasks = listTasksForFlowId(flow.flowId);
		const findings = [];
		if (flow.syncMode === "managed" && flow.status === "running" && tasks.length === 0 && flow.waitJson === void 0) findings.push(`${flow.flowId}: running managed TaskFlow has no linked tasks or wait state; inspect or cancel it manually.`);
		if (flow.status === "blocked" && flow.blockedTaskId && !tasks.some((task) => task.taskId === flow.blockedTaskId)) findings.push(`${flow.flowId}: blocked TaskFlow points at missing task ${flow.blockedTaskId}; inspect before retrying.`);
		return findings;
	});
	if (suspicious.length === 0) return;
	note$1([
		...suspicious.slice(0, 5),
		suspicious.length > 5 ? `...and ${suspicious.length - 5} more.` : null,
		`Inspect: ${formatCliCommand("openclaw tasks flow show <flow-id>")}`,
		`Cancel: ${formatCliCommand("openclaw tasks flow cancel <flow-id>")}`
	].filter((line) => Boolean(line)).join("\n"), "TaskFlow recovery");
}
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
	const pluginRegistry = buildPluginDiagnosticsReport({
		config: cfg,
		workspaceDir
	});
	if (pluginRegistry.plugins.length > 0) {
		const loaded = pluginRegistry.plugins.filter((p) => p.status === "loaded");
		const disabled = pluginRegistry.plugins.filter((p) => p.status === "disabled");
		const errored = pluginRegistry.plugins.filter((p) => p.status === "error");
		const imported = pluginRegistry.plugins.filter((p) => p.imported);
		const lines = [
			`Loaded: ${loaded.length}`,
			`Imported: ${imported.length}`,
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
		report: pluginRegistry
	});
	if (compatibilityWarnings.length > 0) note$1(compatibilityWarnings.map((line) => `- ${line}`).join("\n"), "Plugin compatibility");
	if (pluginRegistry.diagnostics.length > 0) note$1(pluginRegistry.diagnostics.map((diag) => {
		const prefix = diag.level.toUpperCase();
		const plugin = diag.pluginId ? ` ${diag.pluginId}` : "";
		const source = diag.source ? ` (${diag.source})` : "";
		return `- ${prefix}${plugin}: ${diag.message}${source}`;
	}).join("\n"), "Plugin diagnostics");
	noteFlowRecoveryHints();
	return { workspaceDir };
}
//#endregion
//#region src/flows/doctor-health-contributions.ts
function resolveDoctorMode(cfg) {
	return cfg.gateway?.mode === "remote" ? "remote" : "local";
}
function createDoctorHealthContribution(params) {
	return {
		id: params.id,
		kind: "core",
		surface: "health",
		option: {
			value: params.id,
			label: params.label,
			...params.hint ? { hint: params.hint } : {}
		},
		source: "doctor",
		run: params.run
	};
}
async function runGatewayConfigHealth(ctx) {
	if (!ctx.cfg.gateway?.mode) {
		const lines = [
			"gateway.mode is unset; gateway start will be blocked.",
			`Fix: run ${formatCliCommand("openclaw configure")} and set Gateway mode (local/remote).`,
			`Or set directly: ${formatCliCommand("openclaw config set gateway.mode local")}`
		];
		if (!fs.existsSync(ctx.configPath)) lines.push(`Missing config: run ${formatCliCommand("openclaw setup")} first.`);
		note$1(lines.join("\n"), "Gateway");
	}
	if (resolveDoctorMode(ctx.cfg) === "local" && hasAmbiguousGatewayAuthModeConfig(ctx.cfg)) note$1([
		"gateway.auth.token and gateway.auth.password are both configured while gateway.auth.mode is unset.",
		"Set an explicit mode to avoid ambiguous auth selection and startup/runtime failures.",
		`Set token mode: ${formatCliCommand("openclaw config set gateway.auth.mode token")}`,
		`Set password mode: ${formatCliCommand("openclaw config set gateway.auth.mode password")}`
	].join("\n"), "Gateway auth");
}
async function runAuthProfileHealth(ctx) {
	ctx.cfg = await maybeRepairLegacyOAuthProfileIds(ctx.cfg, ctx.prompter);
	await noteAuthProfileHealth({
		cfg: ctx.cfg,
		prompter: ctx.prompter,
		allowKeychainPrompt: ctx.options.nonInteractive !== true && process.stdin.isTTY
	});
	noteLegacyCodexProviderOverride(ctx.cfg);
	ctx.gatewayDetails = buildGatewayConnectionDetails({ config: ctx.cfg });
	if (ctx.gatewayDetails.remoteFallbackNote) note$1(ctx.gatewayDetails.remoteFallbackNote, "Gateway");
}
async function runGatewayAuthHealth(ctx) {
	if (resolveDoctorMode(ctx.cfg) !== "local" || !ctx.sourceConfigValid) return;
	const gatewayTokenRef = resolveSecretInputRef({
		value: ctx.cfg.gateway?.auth?.token,
		defaults: ctx.cfg.secrets?.defaults
	}).ref;
	const auth = resolveGatewayAuth({
		authConfig: ctx.cfg.gateway?.auth,
		tailscaleMode: ctx.cfg.gateway?.tailscale?.mode ?? "off"
	});
	if (!(auth.mode !== "password" && (auth.mode !== "token" || !auth.token))) return;
	if (gatewayTokenRef) {
		note$1([
			"Gateway token is managed via SecretRef and is currently unavailable.",
			"Doctor will not overwrite gateway.auth.token with a plaintext value.",
			"Resolve/rotate the external secret source, then rerun doctor."
		].join("\n"), "Gateway auth");
		return;
	}
	note$1("Gateway auth is off or missing a token. Token auth is now the recommended default (including loopback).", "Gateway auth");
	if (!(ctx.options.generateGatewayToken === true ? true : ctx.options.nonInteractive === true ? false : await ctx.prompter.confirmAutoFix({
		message: "Generate and configure a gateway token now?",
		initialValue: true
	}))) return;
	const nextToken = randomToken();
	ctx.cfg = {
		...ctx.cfg,
		gateway: {
			...ctx.cfg.gateway,
			auth: {
				...ctx.cfg.gateway?.auth,
				mode: "token",
				token: nextToken
			}
		}
	};
	note$1("Gateway token configured.", "Gateway auth");
}
async function runClaudeCliHealth(ctx) {
	noteClaudeCliHealth(ctx.cfg);
}
async function runLegacyStateHealth(ctx) {
	const legacyState = await detectLegacyStateMigrations({ cfg: ctx.cfg });
	if (legacyState.preview.length === 0) return;
	note$1(legacyState.preview.join("\n"), "Legacy state detected");
	if (!(ctx.options.nonInteractive === true ? true : await ctx.prompter.confirm({
		message: "Migrate legacy state (sessions/agent/WhatsApp auth) now?",
		initialValue: true
	}))) return;
	const migrated = await runLegacyStateMigrations({ detected: legacyState });
	if (migrated.changes.length > 0) note$1(migrated.changes.join("\n"), "Doctor changes");
	if (migrated.warnings.length > 0) note$1(migrated.warnings.join("\n"), "Doctor warnings");
}
async function runLegacyPluginManifestHealth(ctx) {
	await maybeRepairLegacyPluginManifestContracts({
		env: process.env,
		runtime: ctx.runtime,
		prompter: ctx.prompter
	});
}
async function runBundledPluginRuntimeDepsHealth(ctx) {
	await maybeRepairBundledPluginRuntimeDeps({
		runtime: ctx.runtime,
		prompter: ctx.prompter
	});
}
async function runStateIntegrityHealth(ctx) {
	await noteStateIntegrity(ctx.cfg, ctx.prompter, ctx.configPath);
}
async function runSessionLocksHealth(ctx) {
	await noteSessionLockHealth({ shouldRepair: ctx.prompter.shouldRepair });
}
async function runLegacyCronHealth(ctx) {
	await maybeRepairLegacyCronStore({
		cfg: ctx.cfg,
		options: ctx.options,
		prompter: ctx.prompter
	});
}
async function runSandboxHealth(ctx) {
	ctx.cfg = await maybeRepairSandboxImages(ctx.cfg, ctx.runtime, ctx.prompter);
	noteSandboxScopeWarnings(ctx.cfg);
}
async function runGatewayServicesHealth(ctx) {
	await maybeScanExtraGatewayServices(ctx.options, ctx.runtime, ctx.prompter);
	await maybeRepairGatewayServiceConfig(ctx.cfg, resolveDoctorMode(ctx.cfg), ctx.runtime, ctx.prompter);
	await noteMacLaunchAgentOverrides();
	await noteMacLaunchctlGatewayEnvOverrides(ctx.cfg);
}
async function runStartupChannelMaintenanceHealth(ctx) {
	if (!ctx.prompter.shouldRepair) return;
	await runChannelPluginStartupMaintenance({
		cfg: ctx.cfg,
		env: process.env,
		log: {
			info: (message) => ctx.runtime.log(message),
			warn: (message) => ctx.runtime.error(message)
		},
		trigger: "doctor-fix",
		logPrefix: "doctor"
	});
}
async function runSecurityHealth(ctx) {
	await noteSecurityWarnings(ctx.cfg);
}
async function runBrowserHealth(ctx) {
	await noteChromeMcpBrowserReadiness(ctx.cfg);
}
async function runOpenAIOAuthTlsHealth(ctx) {
	await noteOpenAIOAuthTlsPrerequisites({
		cfg: ctx.cfg,
		deep: ctx.options.deep === true
	});
}
async function runHooksModelHealth(ctx) {
	if (!ctx.cfg.hooks?.gmail?.model?.trim()) return;
	const hooksModelRef = resolveHooksGmailModel({
		cfg: ctx.cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	if (!hooksModelRef) {
		note$1(`- hooks.gmail.model "${ctx.cfg.hooks.gmail.model}" could not be resolved`, "Hooks");
		return;
	}
	const { provider: defaultProvider, model: defaultModel } = resolveConfiguredModelRef({
		cfg: ctx.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const catalog = await loadModelCatalog({ config: ctx.cfg });
	const status = getModelRefStatus({
		cfg: ctx.cfg,
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
async function runSystemdLingerHealth(ctx) {
	if (ctx.options.nonInteractive === true || process.platform !== "linux" || resolveDoctorMode(ctx.cfg) !== "local") return;
	const service = resolveGatewayService();
	let loaded = false;
	try {
		loaded = await service.isLoaded({ env: process.env });
	} catch {
		loaded = false;
	}
	if (!loaded) return;
	await ensureSystemdUserLingerInteractive({
		runtime: ctx.runtime,
		prompter: {
			confirm: async (p) => ctx.prompter.confirm(p),
			note: note$1
		},
		reason: "Gateway runs as a systemd user service. Without lingering, systemd stops the user session on logout/idle and kills the Gateway.",
		requireConfirm: true
	});
}
async function runWorkspaceStatusHealth(ctx) {
	noteWorkspaceStatus(ctx.cfg);
}
async function runBootstrapSizeHealth(ctx) {
	await noteBootstrapFileSize(ctx.cfg);
}
async function runShellCompletionHealth(ctx) {
	await doctorShellCompletion(ctx.runtime, ctx.prompter, { nonInteractive: ctx.options.nonInteractive });
}
async function runGatewayHealthChecks(ctx) {
	const { healthOk } = await checkGatewayHealth({
		runtime: ctx.runtime,
		cfg: ctx.cfg,
		timeoutMs: ctx.options.nonInteractive === true ? 3e3 : 1e4
	});
	ctx.healthOk = healthOk;
	ctx.gatewayMemoryProbe = healthOk ? await probeGatewayMemoryStatus({
		cfg: ctx.cfg,
		timeoutMs: ctx.options.nonInteractive === true ? 3e3 : 1e4
	}) : {
		checked: false,
		ready: false
	};
}
async function runMemorySearchHealthContribution(ctx) {
	await maybeRepairMemoryRecallHealth({
		cfg: ctx.cfg,
		prompter: ctx.prompter
	});
	await noteMemorySearchHealth(ctx.cfg, { gatewayMemoryProbe: ctx.gatewayMemoryProbe ?? {
		checked: false,
		ready: false
	} });
	await noteMemoryRecallHealth(ctx.cfg);
}
async function runGatewayDaemonHealth(ctx) {
	await maybeRepairGatewayDaemon({
		cfg: ctx.cfg,
		runtime: ctx.runtime,
		prompter: ctx.prompter,
		options: ctx.options,
		gatewayDetailsMessage: ctx.gatewayDetails?.message ?? "",
		healthOk: ctx.healthOk ?? false
	});
}
async function runWriteConfigHealth(ctx) {
	if (ctx.configResult.shouldWriteConfig || JSON.stringify(ctx.cfg) !== JSON.stringify(ctx.cfgForPersistence)) {
		ctx.cfg = applyWizardMetadata(ctx.cfg, {
			command: "doctor",
			mode: resolveDoctorMode(ctx.cfg)
		});
		await writeConfigFile(ctx.cfg);
		logConfigUpdated(ctx.runtime);
		const backupPath = `${CONFIG_PATH}.bak`;
		if (fs.existsSync(backupPath)) ctx.runtime.log(`Backup: ${shortenHomePath(backupPath)}`);
		return;
	}
	if (!ctx.prompter.shouldRepair) ctx.runtime.log(`Run "${formatCliCommand("openclaw doctor --fix")}" to apply changes.`);
}
async function runWorkspaceSuggestionsHealth(ctx) {
	if (ctx.options.workspaceSuggestions === false) return;
	const workspaceDir = resolveAgentWorkspaceDir(ctx.cfg, resolveDefaultAgentId(ctx.cfg));
	noteWorkspaceBackupTip(workspaceDir);
	if (await shouldSuggestMemorySystem(workspaceDir)) note$1(MEMORY_SYSTEM_PROMPT, "Workspace");
}
async function runFinalConfigValidationHealth(_ctx) {
	const finalSnapshot = await readConfigFileSnapshot();
	if (finalSnapshot.exists && !finalSnapshot.valid) {
		_ctx.runtime.error("Invalid config:");
		for (const issue of finalSnapshot.issues) {
			const path = issue.path || "<root>";
			_ctx.runtime.error(`- ${path}: ${issue.message}`);
		}
	}
}
function resolveDoctorHealthContributions() {
	return [
		createDoctorHealthContribution({
			id: "doctor:gateway-config",
			label: "Gateway config",
			run: runGatewayConfigHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:auth-profiles",
			label: "Auth profiles",
			run: runAuthProfileHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:claude-cli",
			label: "Claude CLI",
			run: runClaudeCliHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:gateway-auth",
			label: "Gateway auth",
			run: runGatewayAuthHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:legacy-state",
			label: "Legacy state",
			run: runLegacyStateHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:legacy-plugin-manifests",
			label: "Legacy plugin manifests",
			run: runLegacyPluginManifestHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:bundled-plugin-runtime-deps",
			label: "Bundled plugin runtime deps",
			run: runBundledPluginRuntimeDepsHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:state-integrity",
			label: "State integrity",
			run: runStateIntegrityHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:session-locks",
			label: "Session locks",
			run: runSessionLocksHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:legacy-cron",
			label: "Legacy cron",
			run: runLegacyCronHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:sandbox",
			label: "Sandbox",
			run: runSandboxHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:gateway-services",
			label: "Gateway services",
			run: runGatewayServicesHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:startup-channel-maintenance",
			label: "Startup channel maintenance",
			run: runStartupChannelMaintenanceHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:security",
			label: "Security",
			run: runSecurityHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:browser",
			label: "Browser",
			run: runBrowserHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:oauth-tls",
			label: "OAuth TLS",
			run: runOpenAIOAuthTlsHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:hooks-model",
			label: "Hooks model",
			run: runHooksModelHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:systemd-linger",
			label: "systemd linger",
			run: runSystemdLingerHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:workspace-status",
			label: "Workspace status",
			run: runWorkspaceStatusHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:bootstrap-size",
			label: "Bootstrap size",
			run: runBootstrapSizeHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:shell-completion",
			label: "Shell completion",
			run: runShellCompletionHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:gateway-health",
			label: "Gateway health",
			run: runGatewayHealthChecks
		}),
		createDoctorHealthContribution({
			id: "doctor:memory-search",
			label: "Memory search",
			run: runMemorySearchHealthContribution
		}),
		createDoctorHealthContribution({
			id: "doctor:gateway-daemon",
			label: "Gateway daemon",
			run: runGatewayDaemonHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:write-config",
			label: "Write config",
			run: runWriteConfigHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:workspace-suggestions",
			label: "Workspace suggestions",
			run: runWorkspaceSuggestionsHealth
		}),
		createDoctorHealthContribution({
			id: "doctor:final-config-validation",
			label: "Final config validation",
			run: runFinalConfigValidationHealth
		})
	];
}
async function runDoctorHealthContributions(ctx) {
	for (const contribution of resolveDoctorHealthContributions()) await contribution.run(ctx);
}
//#endregion
//#region src/flows/doctor-health.ts
const intro$1 = (message) => intro(stylePromptTitle(message) ?? message);
const outro$1 = (message) => outro(stylePromptTitle(message) ?? message);
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
	await runDoctorHealthContributions({
		runtime,
		options,
		prompter,
		configResult,
		cfg: configResult.cfg,
		cfgForPersistence: structuredClone(configResult.cfg),
		sourceConfigValid: configResult.sourceConfigValid ?? true,
		configPath: configResult.path ?? CONFIG_PATH
	});
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
