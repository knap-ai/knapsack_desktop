import "./redact-BDinS1q9.js";
import "./errors-BxyFnvP3.js";
import "./unhandled-rejections-CDJ8dOVP.js";
import "./logger-kwZIqwuw.js";
import "./paths-ViKUYWUK.js";
import "./tmp-openclaw-dir-idKIOMmb.js";
import "./theme-CdOoMzRk.js";
import { a as logVerbose } from "./globals-DBUMOBZ8.js";
import "./subsystem-DISldKSB.js";
import "./ansi-BEJF8NKS.js";
import "./boolean-C3GkJetE.js";
import "./env-Dnra1IpT.js";
import "./warning-filter-CBhOcgHd.js";
import { i as clampInt, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import "./links-8xRhWBQL.js";
import "./paths-C4Oy7wjk.js";
import "./auth-profiles-DRuJBw5y.js";
import { d as normalizeUsageDisplay, p as resolveResponseUsageMode, s as normalizeFastMode } from "./thinking.shared-BtwPxLYS.js";
import { _ as normalizeAccountId, v as normalizeOptionalAccountId } from "./session-key-DAhnzjyr.js";
import { r as normalizeStringEntries } from "./string-normalization-CohoSMRS.js";
import { v as resolveSessionAgentId } from "./agent-scope-bjWqU22i.js";
import "./boundary-path-Dm0QJ7-y.js";
import "./boundary-file-read-DcZxlWD8.js";
import "./logger-BmpSCz93.js";
import "./exec-B5_AYfQG.js";
import "./workspace-D4K6QX9X.js";
import "./model-selection-BnFtDmP7.js";
import { F as getConfigValueAtPath, I as parseConfigPath, L as setConfigValueAtPath, M as resetConfigOverrides, N as setConfigOverride, P as unsetConfigOverride, R as unsetConfigValueAtPath, d as readConfigFileSnapshot, g as writeConfigFile, j as getConfigOverrides, x as validateConfigObjectWithPlugins } from "./io-y3Az_Onx.js";
import "./shell-env-BOu7XeT_.js";
import "./safe-text-yavot2qw.js";
import "./version-CD3oP1-d.js";
import "./env-substitution-O6uabUmO.js";
import "./includes-Bj3eLUWH.js";
import "./zod-schema.providers-core-COy5nBQ0.js";
import "./legacy-web-search-BB-ZHEhz.js";
import { s as normalizeChannelId } from "./registry-C5UkPpaO.js";
import "./config-state-Br0ucqMb.js";
import "./min-host-version-RMBWtIAR.js";
import { t as clearPluginManifestRegistryCache } from "./manifest-registry-B5JNQdOM.js";
import "./runtime-guard-PhQ6PwQa.js";
import "./avatar-policy-B5nOfso_.js";
import "./ip-Ce8EDTBZ.js";
import { t as parseDurationMs } from "./parse-duration-D6oKXEgx.js";
import "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import "./zod-schema.core-BuVz8Rk7.js";
import "./config-D4zN4BRl.js";
import "./file-lock-DEiVq2ow.js";
import "./audit-fs-DTQIjp2r.js";
import "./resolve-B7S4PlnO.js";
import "./profiles-COPO-hHI.js";
import "./tailscale-CxY-91GZ.js";
import "./tailnet-DHiKSG7V.js";
import "./net-JAg9zL0G.js";
import "./auth-Buq0Niri.js";
import "./credentials-D8pfRimu.js";
import { a as isInternalMessageChannel, h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-BliByQBl.js";
import { l as updateSessionStore, n as loadSessionStore } from "./store-C5UK26Ce.js";
import "./runtime-Iz8uZ7EU.js";
import { s as getChannelPlugin } from "./plugins-B09-vgme.js";
import "./sessions-D9ZgHCHb.js";
import { i as resolveSessionFilePathOptions, l as resolveStorePath, r as resolveSessionFilePath } from "./paths-rhN9LKM_.js";
import { a as resolveFreshSessionTotalTokens } from "./types-BRBQbfEQ.js";
import "./session-write-lock-va3qZE6f.js";
import "./method-scopes-BiEi0X2g.js";
import { r as callGateway } from "./call-CQbSO4Fr.js";
import "./prompt-style-C4CV4Y_p.js";
import "./ports-lsof-BLEgL_Gn.js";
import "./restart-stale-pids-BsPvlGJd.js";
import "./ports-FldL_Lhq.js";
import "./logging-CznuqaMu.js";
import { r as isRestartEnabled, t as isCommandFlagEnabled } from "./commands-C6oAw_H-.js";
import "./issue-format-BtLIwOtN.js";
import "./help-format-C_5MeE_w.js";
import "./memory-cli-C16LjAdf.js";
import "./identity-Dp-UIak4.js";
import "./heartbeat-Bdfr_onc.js";
import { $o as killAllControlledSubagentRuns, $x as resolveAcpThreadSessionDetailLines, Al as resolveSessionEntryForKey, Ao as requireCommandFlagEnabled, Au as formatElevatedUnavailableMessage, B as requireApiKey, Bl as listSubagentRunsForController, Bm as setTtsMaxLength, Cm as getTtsMaxLength, Cv as setAbortMemory, Dl as extractBtwQuestion, Dm as isTtsProviderConfigured, Do as buildDisabledCommandReply, Em as isTtsEnabled, Ep as createExecTool, Fo as handleExportSessionCommand, Gm as getSpeechProvider, I as getApiKeyForModel, IS as EmbeddedBlockChunker, Im as setLastTtsAttempt, Io as handleHelpCommand, Iu as parseActivationCommand, Jp as markExited, Jx as formatConfigWriteDeniedMessage, Kp as getFinishedSession, Kx as authorizeConfigWrite, Lm as setSummarizationEnabled, Lo as handleStatusCommand, Nm as resolveTtsConfig, No as handleCommandsListCommand, Oo as rejectNonOwnerCommand, Pf as stripToolMessages, Pl as countPendingDescendantRuns, Pm as resolveTtsPrefsPath, Po as handleContextCommand, Qo as buildSubagentList, Qx as resolveAcpSessionIdentifierLinesFromIdentity, Ro as handleWhoamiCommand, Sm as getLastTtsAttempt, Sv as isAbortTrigger, Tm as isSummarizationEnabled, To as handleModelsCommand, US as ensureOpenClawModelsJson, Um as textToSpeech, Vm as setTtsProvider, Xx as resolveConfigWriteTargetFromPath, Zx as resolveAcpSessionCwd, _ as stripToolResultDetails, _p as resolveFastModeState, a as isEmbeddedPiRunActive, ah as resolveModelWithRegistry, as as formatDurationCompact, cm as formatContextUsageShort, dh as executePluginCommand, eS as isAcpEnabledByPolicy, ef as scheduleGatewaySigusr1Restart, es as killControlledSubagentRun, gm as formatUsd, hm as formatTokenCount$1, hs as cleanupFailedAcpSpawn, i as getActiveEmbeddedRunSnapshot, is as steerControlledSubagentRun, jl as stopSubagentsForRequester, jm as resolveTtsApiKey, jo as requireGatewayClientScopeForInternalChannel, kl as formatAbortReplyText, ko as rejectUnauthorizedCommand, l as waitForEmbeddedPiRunEnd, lm as formatTokenCount, ls as sortSubagentRuns, ms as resolveAcpSpawnRuntimePolicyError, n as abortEmbeddedPiRun, nS as resolveAcpDispatchPolicyError, n_ as isTelegramExecApprovalClientEnabled, os as formatRunLabel, p as mapThinkingLevel, ph as matchPluginCommand, qm as normalizeSpeechProviderId, qp as getSession, qx as canBypassConfigWritePolicy, rS as resolveAcpDispatchPolicyMessage, rf as triggerOpenClawRestart, rs as sendControlledSubagentMessage, tS as resolveAcpAgentPolicyError, t_ as isTelegramExecApprovalApprover, tu as clearSessionQueues, u as compactEmbeddedPiSession, us as spawnSubagentDirect, wm as getTtsProvider, zm as setTtsEnabled, zp as killProcessTree } from "./pi-embedded-CbCYZxIb.js";
import { d as triggerInternalHook, n as createInternalHookEvent } from "./internal-hooks-CIUghoK4.js";
import "./multimodal-B8yEZcl5.js";
import "./memory-search-B_aq08y5.js";
import "./provider-catalog-rVN7ZbR5.js";
import "./secret-input-DXoOLNgb.js";
import "./bindings-CFudGB9Z.js";
import "./resolve-route-DwFWP4JW.js";
import "./routing-zOQ0wwtV.js";
import "./identity-file-DVLib087.js";
import "./outbound-runtime-m-y0nd6F.js";
import "./provider-env-vars-CpUJqT5v.js";
import "./provider-auth-input-Bus9W_qh.js";
import "./provider-model-minimax-DSmX4BNO.js";
import "./provider-models-BKjzpTsb.js";
import "./anthropic-vertex-provider-B2x4YywE.js";
import "./provider-catalog-BTgF8VyO.js";
import "./provider-catalog-D0IlX18O.js";
import "./provider-catalog-BTmUX0Mp.js";
import "./provider-catalog-sph_Rl63.js";
import "./provider-catalog-C7tUyBwV.js";
import "./provider-catalog-C8dPZpHW.js";
import "./provider-catalog-BJNff1VI.js";
import "./provider-catalog-IAdymoqT.js";
import "./provider-catalog-Bjc7evzh.js";
import "./models-config.providers.discovery-CjkO08q6.js";
import "./text-runtime-DVXt5xhi.js";
import "./tool-catalog-BjSY4C4F.js";
import "./docker-Bhjg8g2t.js";
import { P as resolveSandboxRuntimeStatus } from "./sandbox-DTlKNieF.js";
import "./common-zReYuoMM.js";
import "./image-ops-By4YfyWa.js";
import "./thinking-CJoSRIGR.js";
import "./path-alias-guards-CwRM04O1.js";
import "./sandbox-paths-Cn8i8Jxm.js";
import "./channel-actions-fV93bLjV.js";
import "./mime-CsUtzcn2.js";
import "./ssrf-0bPJMoZR.js";
import "./fetch-guard-CYl1q2XH.js";
import { r as setPluginEnabledInConfig } from "./provider-web-search-COZNygbd.js";
import { b as toAcpRuntimeError, c as parseRuntimeTimeoutSecondsInput, d as validateRuntimeModeInput, f as validateRuntimeModelInput, h as resolveAcpSessionResolutionError, i as getAcpRuntimeBackend, l as validateRuntimeConfigOptionInput, n as readAcpSessionEntry, o as requireAcpRuntimeBackend, p as validateRuntimePermissionProfileInput, r as resolveSessionStorePathForAcp, t as getAcpSessionManager, u as validateRuntimeCwdInput } from "./manager-Bw8JrihM.js";
import "./config-schema-CPzP2Ds6.js";
import "./channel-plugin-common-ClptUZHU.js";
import "./status-helpers-Cflmo90d.js";
import { W as getSessionBindingService, i as resolveThreadBindingThreadName, r as resolveThreadBindingIntroText, t as formatThreadBindingDurationLabel } from "./conversation-runtime-nmWgJSXS.js";
import "./runtime-whatsapp-boundary-XjdkYMz_.js";
import { a as readChannelAllowFromStore, l as removeChannelAllowFromStoreEntry, t as addChannelAllowFromStoreEntry } from "./pairing-store-BGKLrjo6.js";
import "./json-store--JDX3zNL.js";
import "./secret-file-Bif7RlZ-.js";
import "./channel-config-schema-CgpS17zB.js";
import "./setup-binary-C2MYZTCc.js";
import { a as resolveArchiveKind } from "./archive-pOxyr9r4.js";
import "./fs-safe-DZyOgpPN.js";
import "./signal-cli-install-fVOL9FvX.js";
import "./setup-wizard-proxy-DoOpOF8S.js";
import "./setup-BI3ohdrT.js";
import "./dm-policy-shared-DtcQProI.js";
import "./runtime-env-DQOYrXVl.js";
import "./temp-path-B91lt0LF.js";
import { t as diag } from "./diagnostic-CDTtMQBT.js";
import "./logging-CCTKg_fh.js";
import "./config-runtime-BYNizC50.js";
import { c as resolveSessionAuthProfileOverride } from "./level-overrides-DzIzQ3ZY.js";
import "./exec-approvals-BF_Qfdq8.js";
import "./webhook-ingress-D-H5frou.js";
import { r as enqueueSystemEvent } from "./system-events-BU_NYynX.js";
import "./ssrf-policy-DYINyIKC.js";
import "./hook-runtime-BUYmDbaA.js";
import "./templating-BDXRiJUh.js";
import "./channel-reply-pipeline-BxH4-AP2.js";
import { _ as stripStructuralPrefixes, g as stripMentions } from "./reply-history-n7nOPLta.js";
import "./commands-registry.data-BFXJWoqi.js";
import { p as normalizeCommandBody } from "./commands-registry-Bh9pJ817.js";
import "./frontmatter-CP5371Rm.js";
import "./env-overrides-BNSo89u5.js";
import "./skills-M0AZJeXx.js";
import "./skills-remote-BHxDA4Jw.js";
import "./workspace-dirs-DqDLiRvZ.js";
import "./pairing-token-DAszGmwD.js";
import "./skill-commands-D73dGR_l.js";
import "./config-CLRQPUSt.js";
import "./routes-XT2JfvT-.js";
import "./ssh-tunnel-LM52qY6N.js";
import "./server-middleware-BP59C6FL.js";
import "./provider-auth-ref-CQEp9sp3.js";
import "./provider-auth-helpers-Do3RFvdi.js";
import "./provider-api-key-auth-BEeRW3dq.js";
import { d as resolveThreadBindingSpawnPolicy, i as formatThreadBindingSpawnDisabledError, r as formatThreadBindingDisabledError, s as resolveThreadBindingIdleTimeoutMsForChannel, u as resolveThreadBindingMaxAgeMsForChannel } from "./thread-bindings-policy-C1Av-nes.js";
import "./pairing-labels-D27Y4Vv6.js";
import "./directory-runtime-D9Y42mW-.js";
import "./read-only-account-inspect-CJPRBFj7.js";
import "./src-BoNU6eQs.js";
import "./web-media-PKy3RbRG.js";
import "./media-understanding-BDOSvuM9.js";
import "./web-media-CiSbdGPs.js";
import "./state-paths-Dvb3Mfl3.js";
import "./llm-task-Br6Ixjlh.js";
import { i as discoverModels, r as discoverAuthStorage } from "./pi-model-discovery-DO3tFksS.js";
import "./exec-inline-eval-CpmxWJsW.js";
import "./target-registry-9OUOvlxj.js";
import "./external-content-DZI9vlJn.js";
import "./brave-onFD06fq.js";
import "./duckduckgo-CZuAOfiQ.js";
import "./exa-5bwgY04k.js";
import "./security-runtime-xlw0Fxx2.js";
import "./provider-usage-ClxTGn5c.js";
import "./provider-models-Bjv0V4OP.js";
import "./media-understanding-provider-DllGbg-v.js";
import "./media-understanding-provider-BDq4rFL-.js";
import "./provider-onboard-CSnPvkMM.js";
import "./onboard-BU8aRvq7.js";
import "./perplexity-web-search-provider-CI38RNUU.js";
import "./perplexity-CMZbsreI.js";
import "./model-definitions-CLagLj0g.js";
import "./onboard-0P7GBI2D.js";
import "./provider-catalog-CKHo9CRM.js";
import "./provider-models-Dmjtw6kn.js";
import "./stream-C-KGzzT0.js";
import "./web-search-CO1hvu_l.js";
import "./stagger-CFqdtCYL.js";
import "./command-secret-targets-DLs8jC2H.js";
import "./delivery-queue-DHURMSqX.js";
import { a as shouldPersistAbortCutoff, i as resolveAbortCutoffFromContext, t as applyAbortCutoffToSessionEntry } from "./abort-cutoff-gUSeDGr-.js";
import "./channel-summary-Ctrv7moa.js";
import "./follow-redirects-CVAaqIk4.js";
import "./tool-policy-match-DQWWRSN4.js";
import "./runtime-CAdCdG-M.js";
import "./channel-status-BfM90KqH.js";
import "./discord-core-DLbIyXWy.js";
import "./cli-runtime-Cx1v7N7v.js";
import "./config-presence-DA3j8Nmi.js";
import "./query-expansion-BOJBTXsp.js";
import "./search-manager-DNBHwaee.js";
import "./acp-runtime-BHZj-SLU.js";
import "./telegram-core-DD8gCuaX.js";
import "./audit-BI48Fi3j.js";
import "./gateway-runtime-Dn2qAGY7.js";
import "./connection-auth-Nl2a3tDb.js";
import { i as unsetConfiguredMcpServer, r as setConfiguredMcpServer, t as listConfiguredMcpServers } from "./mcp-config-CDIWSqVk.js";
import { n as createPluginRuntime } from "./runtime-DQb3-ECx.js";
import "./audit-86GvYypd.js";
import "./runtime-api-Ckhst1XP.js";
import "./route-resolution-C9XDTDsW.js";
import "./thread-bindings.messages-C6WRAx05.js";
import "./provider-kAmP8t4k.js";
import "./timeouts-BnOxp0oI.js";
import "./message-handler-DmHqPMDi.js";
import "./thread-bindings-neFAVWsT.js";
import "./ui-BU9Tv965.js";
import "./src-VVAfbRUn.js";
import "./resolve-users-D9S1NRZ1.js";
import "./resolve-channels-Cx3FRWkT.js";
import "./timeouts-DKbQkIWS.js";
import "./discord-DYsL5ZlK.js";
import "./imessage-BRjuIPul.js";
import "./process-runtime-2HF_sK3e.js";
import { n as incrementCompactionCount } from "./session-updates-pRv2bd3F.js";
import { $ as resolveCommandSurfaceChannel, A as resolveAcpCommandBindingContext, B as resolveDiscordChannelIdForFocus, C as resolveAcpHelpText, D as resolveAcpInstallCommandHint, E as withAcpCommandErrorBoundary, F as buildSubagentsHelp, G as resolveSubagentEntryForToken, H as resolveFocusTargetSession, I as formatLogLines, J as resolveTelegramConversationId, K as resolveSubagentsAction, L as formatTimestampWithAge, M as resolveMatrixConversationId, N as resolveMatrixParentConversationId, O as resolveConfiguredAcpBackendId, Q as resolveChannelAccountId, R as loadSubagentSessionEntry, S as resolveAcpAction, T as stopWithText, U as resolveHandledPrefix, V as resolveDisplayStatus, W as resolveRequesterSessionKey, X as isMatrixSurface, Y as isDiscordSurface, Z as isTelegramSurface, _ as parseOptionalSingleTarget, a as ACP_INSTALL_USAGE, b as parseSpawnInput, c as ACP_RESET_OPTIONS_USAGE, d as ACP_STATUS_USAGE, f as ACP_TIMEOUT_USAGE, g as formatRuntimeOptionsText, h as formatAcpCapabilitiesText, i as ACP_DOCTOR_USAGE, j as resolveAcpCommandConversationId, k as resolveAcpCommandAccountId, l as ACP_SESSIONS_USAGE, m as collectAcpErrorText, n as resolveBoundAcpThreadSessionKey, o as ACP_MODEL_USAGE, p as COMMAND, q as stopWithText$1, r as ACP_CWD_USAGE, s as ACP_PERMISSIONS_USAGE, t as resolveAcpTargetSessionKey, u as ACP_SET_MODE_USAGE, v as parseSetCommandInput, w as resolveCommandRequestId, x as parseSteerInput, y as parseSingleValueCommandInput, z as resolveCommandSubagentController } from "./targets-BAm3vqii.js";
import { t as formatAcpRuntimeErrorText } from "./error-text-Cd9jCd0-.js";
import { t as parseConfigValue } from "./config-value-BuyGWmEZ.js";
import "./install-source-utils-C3NuFv6M.js";
import { a as buildPreferredClawHubSpec, c as decidePreferredClawHubFallback, m as buildNpmInstallRecordFields, n as persistPluginInstall, p as resolveFileNpmSpecToLocalPath, s as createPluginInstallLogger } from "./plugins-install-persist-BwIiVqib.js";
import { s as parseClawHubPluginSpec } from "./clawhub-CrF94Azs.js";
import { a as installPluginFromNpmSpec, o as installPluginFromPath } from "./installs-Qst5vOrV.js";
import { r as installPluginFromClawHub } from "./clawhub-DS9sebNq.js";
import { a as buildPluginStatusReport, i as buildPluginInspectReport, o as formatPluginCompatibilityNotice, t as buildAllPluginInspectReports } from "./status-DI5hmNdJ.js";
import { n as loadCostUsageSummary, r as loadSessionCostSummary } from "./session-cost-usage-BtumKIx6.js";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { streamSimple } from "@mariozechner/pi-ai";
//#region src/auto-reply/reply/commands-acp/diagnostics.ts
async function handleAcpDoctorAction(params, restTokens) {
	if (restTokens.length > 0) return stopWithText(`⚠️ ${ACP_DOCTOR_USAGE}`);
	const backendId = resolveConfiguredAcpBackendId(params.cfg);
	const installHint = resolveAcpInstallCommandHint(params.cfg);
	const registeredBackend = getAcpRuntimeBackend(backendId);
	const managerSnapshot = getAcpSessionManager().getObservabilitySnapshot(params.cfg);
	const lines = [
		"ACP doctor:",
		"-----",
		`configuredBackend: ${backendId}`
	];
	lines.push(`activeRuntimeSessions: ${managerSnapshot.runtimeCache.activeSessions}`);
	lines.push(`runtimeIdleTtlMs: ${managerSnapshot.runtimeCache.idleTtlMs}`);
	lines.push(`evictedIdleRuntimes: ${managerSnapshot.runtimeCache.evictedTotal}`);
	lines.push(`activeTurns: ${managerSnapshot.turns.active}`);
	lines.push(`queueDepth: ${managerSnapshot.turns.queueDepth}`);
	lines.push(`turnLatencyMs: avg=${managerSnapshot.turns.averageLatencyMs}, max=${managerSnapshot.turns.maxLatencyMs}`);
	lines.push(`turnCounts: completed=${managerSnapshot.turns.completed}, failed=${managerSnapshot.turns.failed}`);
	const errorStatsText = Object.entries(managerSnapshot.errorsByCode).map(([code, count]) => `${code}=${count}`).join(", ") || "(none)";
	lines.push(`errorCodes: ${errorStatsText}`);
	if (registeredBackend) lines.push(`registeredBackend: ${registeredBackend.id}`);
	else lines.push("registeredBackend: (none)");
	if (registeredBackend?.runtime.doctor) try {
		const report = await registeredBackend.runtime.doctor();
		lines.push(`runtimeDoctor: ${report.ok ? "ok" : "error"} (${report.message})`);
		if (report.code) lines.push(`runtimeDoctorCode: ${report.code}`);
		if (report.installCommand) lines.push(`runtimeDoctorInstall: ${report.installCommand}`);
		for (const detail of report.details ?? []) lines.push(`runtimeDoctorDetail: ${detail}`);
	} catch (error) {
		lines.push(`runtimeDoctor: error (${toAcpRuntimeError({
			error,
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Runtime doctor failed."
		}).message})`);
	}
	try {
		const backend = requireAcpRuntimeBackend(backendId);
		const capabilities = backend.runtime.getCapabilities ? await backend.runtime.getCapabilities({}) : {
			controls: [],
			configOptionKeys: []
		};
		lines.push("healthy: yes");
		lines.push(`capabilities: ${formatAcpCapabilitiesText(capabilities.controls ?? [])}`);
		if ((capabilities.configOptionKeys?.length ?? 0) > 0) lines.push(`configKeys: ${capabilities.configOptionKeys?.join(", ")}`);
		return stopWithText(lines.join("\n"));
	} catch (error) {
		const acpError = toAcpRuntimeError({
			error,
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "ACP backend doctor failed."
		});
		lines.push("healthy: no");
		lines.push(formatAcpRuntimeErrorText(acpError));
		lines.push(`next: ${installHint}`);
		lines.push(`next: openclaw config set plugins.entries.${backendId}.enabled true`);
		if (backendId.toLowerCase() === "acpx") lines.push("next: verify acpx is installed (`acpx --help`).");
		return stopWithText(lines.join("\n"));
	}
}
function handleAcpInstallAction(params, restTokens) {
	if (restTokens.length > 0) return stopWithText(`⚠️ ${ACP_INSTALL_USAGE}`);
	const backendId = resolveConfiguredAcpBackendId(params.cfg);
	const installHint = resolveAcpInstallCommandHint(params.cfg);
	return stopWithText([
		"ACP install:",
		"-----",
		`configuredBackend: ${backendId}`,
		`run: ${installHint}`,
		`then: openclaw config set plugins.entries.${backendId}.enabled true`,
		"then: /acp doctor"
	].join("\n"));
}
function formatAcpSessionLine(params) {
	const acp = params.entry.acp;
	if (!acp) return "";
	const marker = params.currentSessionKey === params.key ? "*" : " ";
	const label = params.entry.label?.trim() || acp.agent;
	const threadText = params.threadId ? `, thread:${params.threadId}` : "";
	return `${marker} ${label} (${acp.mode}, ${acp.state}, backend:${acp.backend}${threadText}) -> ${params.key}`;
}
function handleAcpSessionsAction(params, restTokens) {
	if (restTokens.length > 0) return stopWithText(ACP_SESSIONS_USAGE);
	const currentSessionKey = resolveBoundAcpThreadSessionKey(params) || params.sessionKey;
	if (!currentSessionKey) return stopWithText("⚠️ Missing session key.");
	const { storePath } = resolveSessionStorePathForAcp({
		cfg: params.cfg,
		sessionKey: currentSessionKey
	});
	let store;
	try {
		store = loadSessionStore(storePath);
	} catch {
		store = {};
	}
	const bindingContext = resolveAcpCommandBindingContext(params);
	const normalizedChannel = bindingContext.channel;
	const normalizedAccountId = bindingContext.accountId || void 0;
	const bindingService = getSessionBindingService();
	const rows = Object.entries(store).filter(([, entry]) => Boolean(entry?.acp)).toSorted(([, a], [, b]) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0)).slice(0, 20).map(([key, entry]) => {
		const bindingThreadId = bindingService.listBySession(key).find((binding) => (!normalizedChannel || binding.conversation.channel === normalizedChannel) && (!normalizedAccountId || binding.conversation.accountId === normalizedAccountId))?.conversation.conversationId;
		return formatAcpSessionLine({
			key,
			entry,
			currentSessionKey,
			threadId: bindingThreadId
		});
	}).filter(Boolean);
	if (rows.length === 0) return stopWithText("ACP sessions:\n-----\n(none)");
	return stopWithText([
		"ACP sessions:",
		"-----",
		...rows
	].join("\n"));
}
//#endregion
//#region src/auto-reply/reply/commands-acp/lifecycle.ts
async function bindSpawnedAcpSessionToThread(params) {
	const { commandParams, threadMode } = params;
	if (threadMode === "off") return {
		ok: false,
		error: "internal: thread binding is disabled for this spawn"
	};
	const bindingContext = resolveAcpCommandBindingContext(commandParams);
	const channel = bindingContext.channel;
	if (!channel) return {
		ok: false,
		error: "ACP thread binding requires a channel context."
	};
	const accountId = resolveAcpCommandAccountId(commandParams);
	const spawnPolicy = resolveThreadBindingSpawnPolicy({
		cfg: commandParams.cfg,
		channel,
		accountId,
		kind: "acp"
	});
	if (!spawnPolicy.enabled) return {
		ok: false,
		error: formatThreadBindingDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "acp"
		})
	};
	if (!spawnPolicy.spawnEnabled) return {
		ok: false,
		error: formatThreadBindingSpawnDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "acp"
		})
	};
	const bindingService = getSessionBindingService();
	const capabilities = bindingService.getCapabilities({
		channel: spawnPolicy.channel,
		accountId: spawnPolicy.accountId
	});
	if (!capabilities.adapterAvailable) return {
		ok: false,
		error: `Thread bindings are unavailable for ${channel}.`
	};
	if (!capabilities.bindSupported) return {
		ok: false,
		error: `Thread bindings are unavailable for ${channel}.`
	};
	const currentThreadId = bindingContext.threadId ?? "";
	const currentConversationId = bindingContext.conversationId?.trim() || "";
	const requiresThreadIdForHere = channel !== "telegram" && channel !== "feishu";
	if (threadMode === "here" && (requiresThreadIdForHere && !currentThreadId || !requiresThreadIdForHere && !currentConversationId)) return {
		ok: false,
		error: `--thread here requires running /acp spawn inside an active ${channel} thread/conversation.`
	};
	const placement = channel === "telegram" || channel === "feishu" ? "current" : currentThreadId ? "current" : "child";
	if (!capabilities.placements.includes(placement)) return {
		ok: false,
		error: `Thread bindings do not support ${placement} placement for ${channel}.`
	};
	if (!currentConversationId) return {
		ok: false,
		error: `Could not resolve a ${channel} conversation for ACP thread spawn.`
	};
	const senderId = commandParams.command.senderId?.trim() || "";
	const parentConversationId = bindingContext.parentConversationId?.trim() || void 0;
	const conversationRef = {
		channel: spawnPolicy.channel,
		accountId: spawnPolicy.accountId,
		conversationId: currentConversationId,
		...parentConversationId && parentConversationId !== currentConversationId ? { parentConversationId } : {}
	};
	if (placement === "current") {
		const existingBinding = bindingService.resolveByConversation(conversationRef);
		const boundBy = typeof existingBinding?.metadata?.boundBy === "string" ? existingBinding.metadata.boundBy.trim() : "";
		if (existingBinding && boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return {
			ok: false,
			error: `Only ${boundBy} can rebind this ${channel === "telegram" ? "conversation" : "thread"}.`
		};
	}
	const label = params.label || params.agentId;
	try {
		return {
			ok: true,
			binding: await bindingService.bind({
				targetSessionKey: params.sessionKey,
				targetKind: "session",
				conversation: conversationRef,
				placement,
				metadata: {
					threadName: resolveThreadBindingThreadName({
						agentId: params.agentId,
						label
					}),
					agentId: params.agentId,
					label,
					boundBy: senderId || "unknown",
					introText: resolveThreadBindingIntroText({
						agentId: params.agentId,
						label,
						idleTimeoutMs: resolveThreadBindingIdleTimeoutMsForChannel({
							cfg: commandParams.cfg,
							channel: spawnPolicy.channel,
							accountId: spawnPolicy.accountId
						}),
						maxAgeMs: resolveThreadBindingMaxAgeMsForChannel({
							cfg: commandParams.cfg,
							channel: spawnPolicy.channel,
							accountId: spawnPolicy.accountId
						}),
						sessionCwd: resolveAcpSessionCwd(params.sessionMeta),
						sessionDetails: resolveAcpThreadSessionDetailLines({
							sessionKey: params.sessionKey,
							meta: params.sessionMeta
						})
					})
				}
			})
		};
	} catch (error) {
		return {
			ok: false,
			error: (error instanceof Error ? error.message : String(error)) || `Failed to bind a ${channel} thread/conversation to the new ACP session.`
		};
	}
}
async function cleanupFailedSpawn(params) {
	await cleanupFailedAcpSpawn({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		shouldDeleteSession: params.shouldDeleteSession,
		deleteTranscript: false,
		runtimeCloseHandle: params.initializedRuntime
	});
}
async function handleAcpSpawnAction(params, restTokens) {
	if (!isAcpEnabledByPolicy(params.cfg)) return stopWithText("ACP is disabled by policy (`acp.enabled=false`).");
	const parsed = parseSpawnInput(params, restTokens);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const spawn = parsed.value;
	const runtimePolicyError = resolveAcpSpawnRuntimePolicyError({
		cfg: params.cfg,
		requesterSessionKey: params.sessionKey
	});
	if (runtimePolicyError) return stopWithText(`⚠️ ${runtimePolicyError}`);
	const agentPolicyError = resolveAcpAgentPolicyError(params.cfg, spawn.agentId);
	if (agentPolicyError) return stopWithText(collectAcpErrorText({
		error: agentPolicyError,
		fallbackCode: "ACP_SESSION_INIT_FAILED",
		fallbackMessage: "ACP target agent is not allowed by policy."
	}));
	const acpManager = getAcpSessionManager();
	const sessionKey = `agent:${spawn.agentId}:acp:${randomUUID()}`;
	let initializedBackend = "";
	let initializedMeta;
	let initializedRuntime;
	try {
		const initialized = await acpManager.initializeSession({
			cfg: params.cfg,
			sessionKey,
			agent: spawn.agentId,
			mode: spawn.mode,
			cwd: spawn.cwd
		});
		initializedRuntime = {
			runtime: initialized.runtime,
			handle: initialized.handle
		};
		initializedBackend = initialized.handle.backend || initialized.meta.backend;
		initializedMeta = initialized.meta;
	} catch (err) {
		return stopWithText(collectAcpErrorText({
			error: err,
			fallbackCode: "ACP_SESSION_INIT_FAILED",
			fallbackMessage: "Could not initialize ACP session runtime."
		}));
	}
	let binding = null;
	if (spawn.thread !== "off") {
		const bound = await bindSpawnedAcpSessionToThread({
			commandParams: params,
			sessionKey,
			agentId: spawn.agentId,
			label: spawn.label,
			threadMode: spawn.thread,
			sessionMeta: initializedMeta
		});
		if (!bound.ok) {
			await cleanupFailedSpawn({
				cfg: params.cfg,
				sessionKey,
				shouldDeleteSession: true,
				initializedRuntime
			});
			return stopWithText(`⚠️ ${bound.error}`);
		}
		binding = bound.binding;
	}
	try {
		await callGateway({
			method: "sessions.patch",
			params: {
				key: sessionKey,
				...spawn.label ? { label: spawn.label } : {}
			},
			timeoutMs: 1e4
		});
	} catch (err) {
		await cleanupFailedSpawn({
			cfg: params.cfg,
			sessionKey,
			shouldDeleteSession: true,
			initializedRuntime
		});
		return stopWithText(`⚠️ ACP spawn failed: ${err instanceof Error ? err.message : String(err)}`);
	}
	const parts = [`✅ Spawned ACP session ${sessionKey} (${spawn.mode}, backend ${initializedBackend}).`];
	if (binding) {
		const currentConversationId = resolveAcpCommandConversationId(params)?.trim() || "";
		const boundConversationId = binding.conversation.conversationId.trim();
		const placementLabel = binding.conversation.channel === "telegram" ? "conversation" : "thread";
		if (currentConversationId && boundConversationId === currentConversationId) parts.push(`Bound this ${placementLabel} to ${sessionKey}.`);
		else parts.push(`Created ${placementLabel} ${boundConversationId} and bound it to ${sessionKey}.`);
	} else parts.push("Session is unbound (use /focus <session-key> to bind this thread/conversation).");
	const dispatchNote = resolveAcpDispatchPolicyMessage(params.cfg);
	if (dispatchNote) parts.push(`ℹ️ ${dispatchNote}`);
	if (binding?.conversation.channel === "telegram" && binding.conversation.conversationId.includes(":topic:")) return {
		shouldContinue: false,
		reply: {
			text: parts.join(" "),
			channelData: { telegram: { pin: true } }
		}
	};
	return stopWithText(parts.join(" "));
}
function resolveAcpSessionForCommandOrStop(params) {
	const error = resolveAcpSessionResolutionError(params.acpManager.resolveSession({
		cfg: params.cfg,
		sessionKey: params.sessionKey
	}));
	if (error) return stopWithText(collectAcpErrorText({
		error,
		fallbackCode: "ACP_SESSION_INIT_FAILED",
		fallbackMessage: error.message
	}));
	return null;
}
async function resolveAcpTokenTargetSessionKeyOrStop(params) {
	const token = params.restTokens.join(" ").trim() || void 0;
	const target = await resolveAcpTargetSessionKey({
		commandParams: params.commandParams,
		token
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	return target.sessionKey;
}
async function withResolvedAcpSessionTarget(params) {
	const acpManager = getAcpSessionManager();
	const targetSessionKey = await resolveAcpTokenTargetSessionKeyOrStop({
		commandParams: params.commandParams,
		restTokens: params.restTokens
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	const guardFailure = resolveAcpSessionForCommandOrStop({
		acpManager,
		cfg: params.commandParams.cfg,
		sessionKey: targetSessionKey
	});
	if (guardFailure) return guardFailure;
	return await params.run({
		acpManager,
		sessionKey: targetSessionKey
	});
}
async function handleAcpCancelAction(params, restTokens) {
	return await withResolvedAcpSessionTarget({
		commandParams: params,
		restTokens,
		run: async ({ acpManager, sessionKey }) => await withAcpCommandErrorBoundary({
			run: async () => await acpManager.cancelSession({
				cfg: params.cfg,
				sessionKey,
				reason: "manual-cancel"
			}),
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "ACP cancel failed before completion.",
			onSuccess: () => stopWithText(`✅ Cancel requested for ACP session ${sessionKey}.`)
		})
	});
}
async function runAcpSteer(params) {
	const acpManager = getAcpSessionManager();
	let output = "";
	await acpManager.runTurn({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		text: params.instruction,
		mode: "steer",
		requestId: params.requestId,
		onEvent: (event) => {
			if (event.type !== "text_delta") return;
			if (event.stream && event.stream !== "output") return;
			if (event.text) {
				output += event.text;
				if (output.length > 800) output = `${output.slice(0, 800)}…`;
			}
		}
	});
	return output.trim();
}
async function handleAcpSteerAction(params, restTokens) {
	const dispatchPolicyError = resolveAcpDispatchPolicyError(params.cfg);
	if (dispatchPolicyError) return stopWithText(collectAcpErrorText({
		error: dispatchPolicyError,
		fallbackCode: "ACP_DISPATCH_DISABLED",
		fallbackMessage: dispatchPolicyError.message
	}));
	const parsed = parseSteerInput(restTokens);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const acpManager = getAcpSessionManager();
	const target = await resolveAcpTargetSessionKey({
		commandParams: params,
		token: parsed.value.sessionToken
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	const guardFailure = resolveAcpSessionForCommandOrStop({
		acpManager,
		cfg: params.cfg,
		sessionKey: target.sessionKey
	});
	if (guardFailure) return guardFailure;
	return await withAcpCommandErrorBoundary({
		run: async () => await runAcpSteer({
			cfg: params.cfg,
			sessionKey: target.sessionKey,
			instruction: parsed.value.instruction,
			requestId: `${resolveCommandRequestId(params)}:steer`
		}),
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "ACP steer failed before completion.",
		onSuccess: (steerOutput) => {
			if (!steerOutput) return stopWithText(`✅ ACP steer sent to ${target.sessionKey}.`);
			return stopWithText(`✅ ACP steer sent to ${target.sessionKey}.\n${steerOutput}`);
		}
	});
}
async function handleAcpCloseAction(params, restTokens) {
	return await withResolvedAcpSessionTarget({
		commandParams: params,
		restTokens,
		run: async ({ acpManager, sessionKey }) => {
			let runtimeNotice = "";
			try {
				const closed = await acpManager.closeSession({
					cfg: params.cfg,
					sessionKey,
					reason: "manual-close",
					allowBackendUnavailable: true,
					clearMeta: true
				});
				runtimeNotice = closed.runtimeNotice ? ` (${closed.runtimeNotice})` : "";
			} catch (error) {
				return stopWithText(collectAcpErrorText({
					error,
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP close failed before completion."
				}));
			}
			const removedBindings = await getSessionBindingService().unbind({
				targetSessionKey: sessionKey,
				reason: "manual"
			});
			return stopWithText(`✅ Closed ACP session ${sessionKey}${runtimeNotice}. Removed ${removedBindings.length} binding${removedBindings.length === 1 ? "" : "s"}.`);
		}
	});
}
//#endregion
//#region src/auto-reply/reply/commands-acp/runtime-options.ts
async function resolveTargetSessionKeyOrStop(params) {
	const target = await resolveAcpTargetSessionKey({
		commandParams: params.commandParams,
		token: params.token
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	return target.sessionKey;
}
async function resolveOptionalSingleTargetOrStop(params) {
	const parsed = parseOptionalSingleTarget(params.restTokens, params.usage);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	return await resolveTargetSessionKeyOrStop({
		commandParams: params.commandParams,
		token: parsed.sessionToken
	});
}
async function resolveSingleTargetValueOrStop(params) {
	const parsed = parseSingleValueCommandInput(params.restTokens, params.usage);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const targetSessionKey = await resolveTargetSessionKeyOrStop({
		commandParams: params.commandParams,
		token: parsed.value.sessionToken
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	return {
		targetSessionKey,
		value: parsed.value.value
	};
}
async function withSingleTargetValue(params) {
	const resolved = await resolveSingleTargetValueOrStop({
		commandParams: params.commandParams,
		restTokens: params.restTokens,
		usage: params.usage
	});
	if (!("targetSessionKey" in resolved)) return resolved;
	return await params.run(resolved);
}
async function handleAcpStatusAction(params, restTokens) {
	const targetSessionKey = await resolveOptionalSingleTargetOrStop({
		commandParams: params,
		restTokens,
		usage: ACP_STATUS_USAGE
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	return await withAcpCommandErrorBoundary({
		run: async () => await getAcpSessionManager().getSessionStatus({
			cfg: params.cfg,
			sessionKey: targetSessionKey
		}),
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not read ACP session status.",
		onSuccess: (status) => {
			const sessionIdentifierLines = resolveAcpSessionIdentifierLinesFromIdentity({
				backend: status.backend,
				identity: status.identity
			});
			return stopWithText([
				"ACP status:",
				"-----",
				`session: ${status.sessionKey}`,
				`backend: ${status.backend}`,
				`agent: ${status.agent}`,
				...sessionIdentifierLines,
				`sessionMode: ${status.mode}`,
				`state: ${status.state}`,
				`runtimeOptions: ${formatRuntimeOptionsText(status.runtimeOptions)}`,
				`capabilities: ${formatAcpCapabilitiesText(status.capabilities.controls)}`,
				`lastActivityAt: ${new Date(status.lastActivityAt).toISOString()}`,
				...status.lastError ? [`lastError: ${status.lastError}`] : [],
				...status.runtimeStatus?.summary ? [`runtime: ${status.runtimeStatus.summary}`] : [],
				...status.runtimeStatus?.details ? [`runtimeDetails: ${JSON.stringify(status.runtimeStatus.details)}`] : []
			].join("\n"));
		}
	});
}
async function handleAcpSetModeAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_SET_MODE_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const runtimeMode = validateRuntimeModeInput(value);
				return {
					runtimeMode,
					options: await getAcpSessionManager().setSessionRuntimeMode({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						runtimeMode
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP runtime mode.",
			onSuccess: ({ runtimeMode, options }) => stopWithText(`✅ Updated ACP runtime mode for ${targetSessionKey}: ${runtimeMode}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpSetAction(params, restTokens) {
	const parsed = parseSetCommandInput(restTokens);
	if (!parsed.ok) return stopWithText(`⚠️ ${parsed.error}`);
	const target = await resolveAcpTargetSessionKey({
		commandParams: params,
		token: parsed.value.sessionToken
	});
	if (!target.ok) return stopWithText(`⚠️ ${target.error}`);
	const key = parsed.value.key.trim();
	const value = parsed.value.value.trim();
	return await withAcpCommandErrorBoundary({
		run: async () => {
			if (key.toLowerCase() === "cwd") {
				const cwd = validateRuntimeCwdInput(value);
				const options = await getAcpSessionManager().updateSessionRuntimeOptions({
					cfg: params.cfg,
					sessionKey: target.sessionKey,
					patch: { cwd }
				});
				return { text: `✅ Updated ACP cwd for ${target.sessionKey}: ${cwd}. Effective options: ${formatRuntimeOptionsText(options)}` };
			}
			const validated = validateRuntimeConfigOptionInput(key, value);
			const options = await getAcpSessionManager().setSessionConfigOption({
				cfg: params.cfg,
				sessionKey: target.sessionKey,
				key: validated.key,
				value: validated.value
			});
			return { text: `✅ Updated ACP config option for ${target.sessionKey}: ${validated.key}=${validated.value}. Effective options: ${formatRuntimeOptionsText(options)}` };
		},
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not update ACP config option.",
		onSuccess: ({ text }) => stopWithText(text)
	});
}
async function handleAcpCwdAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_CWD_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const cwd = validateRuntimeCwdInput(value);
				return {
					cwd,
					options: await getAcpSessionManager().updateSessionRuntimeOptions({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						patch: { cwd }
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP cwd.",
			onSuccess: ({ cwd, options }) => stopWithText(`✅ Updated ACP cwd for ${targetSessionKey}: ${cwd}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpPermissionsAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_PERMISSIONS_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const permissionProfile = validateRuntimePermissionProfileInput(value);
				return {
					permissionProfile,
					options: await getAcpSessionManager().setSessionConfigOption({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						key: "approval_policy",
						value: permissionProfile
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP permissions profile.",
			onSuccess: ({ permissionProfile, options }) => stopWithText(`✅ Updated ACP permissions profile for ${targetSessionKey}: ${permissionProfile}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpTimeoutAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_TIMEOUT_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const timeoutSeconds = parseRuntimeTimeoutSecondsInput(value);
				return {
					timeoutSeconds,
					options: await getAcpSessionManager().setSessionConfigOption({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						key: "timeout",
						value: String(timeoutSeconds)
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP timeout.",
			onSuccess: ({ timeoutSeconds, options }) => stopWithText(`✅ Updated ACP timeout for ${targetSessionKey}: ${timeoutSeconds}s. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpModelAction(params, restTokens) {
	return await withSingleTargetValue({
		commandParams: params,
		restTokens,
		usage: ACP_MODEL_USAGE,
		run: async ({ targetSessionKey, value }) => await withAcpCommandErrorBoundary({
			run: async () => {
				const model = validateRuntimeModelInput(value);
				return {
					model,
					options: await getAcpSessionManager().setSessionConfigOption({
						cfg: params.cfg,
						sessionKey: targetSessionKey,
						key: "model",
						value: model
					})
				};
			},
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not update ACP model.",
			onSuccess: ({ model, options }) => stopWithText(`✅ Updated ACP model for ${targetSessionKey}: ${model}. Effective options: ${formatRuntimeOptionsText(options)}`)
		})
	});
}
async function handleAcpResetOptionsAction(params, restTokens) {
	const targetSessionKey = await resolveOptionalSingleTargetOrStop({
		commandParams: params,
		restTokens,
		usage: ACP_RESET_OPTIONS_USAGE
	});
	if (typeof targetSessionKey !== "string") return targetSessionKey;
	return await withAcpCommandErrorBoundary({
		run: async () => await getAcpSessionManager().resetSessionRuntimeOptions({
			cfg: params.cfg,
			sessionKey: targetSessionKey
		}),
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not reset ACP runtime options.",
		onSuccess: () => stopWithText(`✅ Reset ACP runtime options for ${targetSessionKey}.`)
	});
}
//#endregion
//#region src/auto-reply/reply/commands-acp.ts
const ACP_ACTION_HANDLERS = {
	spawn: handleAcpSpawnAction,
	cancel: handleAcpCancelAction,
	steer: handleAcpSteerAction,
	close: handleAcpCloseAction,
	status: handleAcpStatusAction,
	"set-mode": handleAcpSetModeAction,
	set: handleAcpSetAction,
	cwd: handleAcpCwdAction,
	permissions: handleAcpPermissionsAction,
	timeout: handleAcpTimeoutAction,
	model: handleAcpModelAction,
	"reset-options": handleAcpResetOptionsAction,
	doctor: handleAcpDoctorAction,
	install: async (params, tokens) => handleAcpInstallAction(params, tokens),
	sessions: async (params, tokens) => handleAcpSessionsAction(params, tokens)
};
const ACP_MUTATING_ACTIONS = new Set([
	"spawn",
	"cancel",
	"steer",
	"close",
	"status",
	"set-mode",
	"set",
	"cwd",
	"permissions",
	"timeout",
	"model",
	"reset-options"
]);
const handleAcpCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (!normalized.startsWith("/acp")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /acp from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const tokens = normalized.slice(COMMAND.length).trim().split(/\s+/).filter(Boolean);
	const action = resolveAcpAction(tokens);
	if (action === "help") return stopWithText(resolveAcpHelpText());
	if (ACP_MUTATING_ACTIONS.has(action)) {
		const scopeBlock = requireGatewayClientScopeForInternalChannel(params, {
			label: "/acp",
			allowedScopes: ["operator.admin"],
			missingText: "This /acp action requires operator.admin on the internal channel."
		});
		if (scopeBlock) return scopeBlock;
	}
	const handler = ACP_ACTION_HANDLERS[action];
	return handler ? await handler(params, tokens) : stopWithText(resolveAcpHelpText());
};
//#endregion
//#region src/auto-reply/reply/config-write-authorization.ts
function resolveConfigWriteDeniedText(params) {
	const writeAuth = authorizeConfigWrite({
		cfg: params.cfg,
		origin: {
			channelId: params.channelId,
			accountId: params.accountId
		},
		target: params.target,
		allowBypass: canBypassConfigWritePolicy({
			channel: params.channel ?? "",
			gatewayClientScopes: params.gatewayClientScopes
		})
	});
	if (writeAuth.allowed) return null;
	return formatConfigWriteDeniedMessage({
		result: writeAuth,
		fallbackChannelId: params.channelId
	});
}
//#endregion
//#region src/auto-reply/reply/commands-allowlist.ts
const ACTIONS = new Set([
	"list",
	"add",
	"remove"
]);
const SCOPES = new Set([
	"dm",
	"group",
	"all"
]);
function parseAllowlistCommand(raw) {
	const trimmed = raw.trim();
	if (!trimmed.toLowerCase().startsWith("/allowlist")) return null;
	const rest = trimmed.slice(10).trim();
	if (!rest) return {
		action: "list",
		scope: "dm"
	};
	const tokens = rest.split(/\s+/);
	let action = "list";
	let scope = "dm";
	let resolve = false;
	let target = "both";
	let channel;
	let account;
	const entryTokens = [];
	let i = 0;
	if (tokens[i] && ACTIONS.has(tokens[i].toLowerCase())) {
		action = tokens[i].toLowerCase();
		i += 1;
	}
	if (tokens[i] && SCOPES.has(tokens[i].toLowerCase())) {
		scope = tokens[i].toLowerCase();
		i += 1;
	}
	for (; i < tokens.length; i += 1) {
		const token = tokens[i];
		const lowered = token.toLowerCase();
		if (lowered === "--resolve" || lowered === "resolve") {
			resolve = true;
			continue;
		}
		if (lowered === "--config" || lowered === "config") {
			target = "config";
			continue;
		}
		if (lowered === "--store" || lowered === "store") {
			target = "store";
			continue;
		}
		if (lowered === "--channel" && tokens[i + 1]) {
			channel = tokens[i + 1];
			i += 1;
			continue;
		}
		if (lowered === "--account" && tokens[i + 1]) {
			account = tokens[i + 1];
			i += 1;
			continue;
		}
		const kv = token.split("=");
		if (kv.length === 2) {
			const key = kv[0]?.trim().toLowerCase();
			const value = kv[1]?.trim();
			if (key === "channel") {
				if (value) channel = value;
				continue;
			}
			if (key === "account") {
				if (value) account = value;
				continue;
			}
			if (key === "scope" && value && SCOPES.has(value.toLowerCase())) {
				scope = value.toLowerCase();
				continue;
			}
		}
		entryTokens.push(token);
	}
	if (action === "add" || action === "remove") {
		const entry = entryTokens.join(" ").trim();
		if (!entry) return {
			action: "error",
			message: "Usage: /allowlist add|remove <entry>"
		};
		return {
			action,
			scope,
			entry,
			channel,
			account,
			resolve,
			target
		};
	}
	return {
		action: "list",
		scope,
		channel,
		account,
		resolve
	};
}
function normalizeAllowFrom(params) {
	const plugin = getChannelPlugin(params.channelId);
	if (plugin?.config.formatAllowFrom) return plugin.config.formatAllowFrom({
		cfg: params.cfg,
		accountId: params.accountId,
		allowFrom: params.values
	});
	return normalizeStringEntries(params.values);
}
function formatEntryList(entries, resolved) {
	if (entries.length === 0) return "(none)";
	return entries.map((entry) => {
		const name = resolved?.get(entry);
		return name ? `${entry} (${name})` : entry;
	}).join(", ");
}
async function updatePairingStoreAllowlist(params) {
	const storeEntry = {
		channel: params.channelId,
		entry: params.entry,
		accountId: params.accountId
	};
	if (params.action === "add") {
		await addChannelAllowFromStoreEntry(storeEntry);
		return;
	}
	await removeChannelAllowFromStoreEntry(storeEntry);
	if (params.accountId === "default") await removeChannelAllowFromStoreEntry({
		channel: params.channelId,
		entry: params.entry
	});
}
function mapResolvedAllowlistNames(entries) {
	const map = /* @__PURE__ */ new Map();
	for (const entry of entries) if (entry.resolved && entry.name) map.set(entry.input, entry.name);
	return map;
}
async function resolveAllowlistNames(params) {
	return mapResolvedAllowlistNames(await getChannelPlugin(params.channelId)?.allowlist?.resolveNames?.({
		cfg: params.cfg,
		accountId: params.accountId,
		scope: params.scope,
		entries: params.entries
	}) ?? []);
}
async function readAllowlistConfig(params) {
	return await getChannelPlugin(params.channelId)?.allowlist?.readConfig?.({
		cfg: params.cfg,
		accountId: params.accountId
	}) ?? {};
}
const handleAllowlistCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const parsed = parseAllowlistCommand(params.command.commandBodyNormalized);
	if (!parsed) return null;
	if (parsed.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${parsed.message}` }
	};
	const unauthorized = rejectUnauthorizedCommand(params, "/allowlist");
	if (unauthorized) return unauthorized;
	const channelId = normalizeChannelId(parsed.channel) ?? params.command.channelId ?? normalizeChannelId(params.command.channel);
	if (!channelId) return {
		shouldContinue: false,
		reply: { text: "⚠️ Unknown channel. Add channel=<id> to the command." }
	};
	if (parsed.account?.trim() && !normalizeOptionalAccountId(parsed.account)) return {
		shouldContinue: false,
		reply: { text: "⚠️ Invalid account id. Reserved keys (__proto__, constructor, prototype) are blocked." }
	};
	const accountId = normalizeAccountId(parsed.account ?? params.ctx.AccountId);
	const plugin = getChannelPlugin(channelId);
	if (parsed.action === "list") {
		const supportsStore = Boolean(plugin?.pairing);
		if (!plugin?.allowlist?.readConfig && !supportsStore) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${channelId} does not expose allowlist configuration.` }
		};
		const storeAllowFrom = supportsStore ? await readChannelAllowFromStore(channelId, process.env, accountId).catch(() => []) : [];
		const configState = await readAllowlistConfig({
			cfg: params.cfg,
			channelId,
			accountId
		});
		const dmAllowFrom = (configState.dmAllowFrom ?? []).map(String);
		const groupAllowFrom = (configState.groupAllowFrom ?? []).map(String);
		const groupOverrides = (configState.groupOverrides ?? []).map((entry) => ({
			label: entry.label,
			entries: entry.entries.map(String).filter(Boolean)
		}));
		const dmDisplay = normalizeAllowFrom({
			cfg: params.cfg,
			channelId,
			accountId,
			values: dmAllowFrom
		});
		const groupDisplay = normalizeAllowFrom({
			cfg: params.cfg,
			channelId,
			accountId,
			values: groupAllowFrom
		});
		const groupOverrideEntries = groupOverrides.flatMap((entry) => entry.entries);
		const groupOverrideDisplay = normalizeAllowFrom({
			cfg: params.cfg,
			channelId,
			accountId,
			values: groupOverrideEntries
		});
		const resolvedDm = parsed.resolve && dmDisplay.length > 0 ? await resolveAllowlistNames({
			cfg: params.cfg,
			channelId,
			accountId,
			scope: "dm",
			entries: dmDisplay
		}) : void 0;
		const resolvedGroup = parsed.resolve && groupOverrideDisplay.length > 0 ? await resolveAllowlistNames({
			cfg: params.cfg,
			channelId,
			accountId,
			scope: "group",
			entries: groupOverrideDisplay
		}) : void 0;
		const lines = ["🧾 Allowlist"];
		lines.push(`Channel: ${channelId}${accountId ? ` (account ${accountId})` : ""}`);
		if (configState.dmPolicy) lines.push(`DM policy: ${configState.dmPolicy}`);
		if (configState.groupPolicy) lines.push(`Group policy: ${configState.groupPolicy}`);
		const showDm = parsed.scope === "dm" || parsed.scope === "all";
		const showGroup = parsed.scope === "group" || parsed.scope === "all";
		if (showDm) lines.push(`DM allowFrom (config): ${formatEntryList(dmDisplay, resolvedDm)}`);
		if (supportsStore && storeAllowFrom.length > 0) {
			const storeLabel = normalizeAllowFrom({
				cfg: params.cfg,
				channelId,
				accountId,
				values: storeAllowFrom
			});
			lines.push(`Paired allowFrom (store): ${formatEntryList(storeLabel)}`);
		}
		if (showGroup) {
			if (groupAllowFrom.length > 0) lines.push(`Group allowFrom (config): ${formatEntryList(groupDisplay, resolvedGroup)}`);
			if (groupOverrides.length > 0) {
				lines.push("Group overrides:");
				for (const entry of groupOverrides) {
					const normalized = normalizeAllowFrom({
						cfg: params.cfg,
						channelId,
						accountId,
						values: entry.entries
					});
					lines.push(`- ${entry.label}: ${formatEntryList(normalized, resolvedGroup)}`);
				}
			}
		}
		return {
			shouldContinue: false,
			reply: { text: lines.join("\n") }
		};
	}
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/allowlist edits",
		configKey: "config",
		disabledVerb: "are"
	});
	if (disabled) return disabled;
	const shouldUpdateConfig = parsed.target !== "store";
	const shouldTouchStore = parsed.target !== "config" && Boolean(plugin?.pairing);
	if (shouldUpdateConfig) {
		if (parsed.scope === "all") return {
			shouldContinue: false,
			reply: { text: "⚠️ /allowlist add|remove requires scope dm or group." }
		};
		if (!plugin?.allowlist?.applyConfigEdit) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${channelId} does not support ${parsed.scope} allowlist edits via /allowlist.` }
		};
		const snapshot = await readConfigFileSnapshot();
		if (!snapshot.valid || !snapshot.parsed || typeof snapshot.parsed !== "object") return {
			shouldContinue: false,
			reply: { text: "⚠️ Config file is invalid; fix it before using /allowlist." }
		};
		const parsedConfig = structuredClone(snapshot.parsed);
		const editResult = await plugin.allowlist.applyConfigEdit({
			cfg: params.cfg,
			parsedConfig,
			accountId,
			scope: parsed.scope,
			action: parsed.action,
			entry: parsed.entry
		});
		if (!editResult) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${channelId} does not support ${parsed.scope} allowlist edits via /allowlist.` }
		};
		if (editResult.kind === "invalid-entry") return {
			shouldContinue: false,
			reply: { text: "⚠️ Invalid allowlist entry." }
		};
		const deniedText = resolveConfigWriteDeniedText({
			cfg: params.cfg,
			channel: params.command.channel,
			channelId,
			accountId: params.ctx.AccountId,
			gatewayClientScopes: params.ctx.GatewayClientScopes,
			target: editResult.writeTarget
		});
		if (deniedText) return {
			shouldContinue: false,
			reply: { text: deniedText }
		};
		const configChanged = editResult.changed;
		if (configChanged) {
			const validated = validateConfigObjectWithPlugins(parsedConfig);
			if (!validated.ok) {
				const issue = validated.issues[0];
				return {
					shouldContinue: false,
					reply: { text: `⚠️ Config invalid after update (${issue.path}: ${issue.message}).` }
				};
			}
			await writeConfigFile(validated.config);
		}
		if (!configChanged && !shouldTouchStore) return {
			shouldContinue: false,
			reply: { text: parsed.action === "add" ? "✅ Already allowlisted." : "⚠️ Entry not found." }
		};
		if (shouldTouchStore) await updatePairingStoreAllowlist({
			action: parsed.action,
			channelId,
			accountId,
			entry: parsed.entry
		});
		const actionLabel = parsed.action === "add" ? "added" : "removed";
		const scopeLabel = parsed.scope === "dm" ? "DM" : "group";
		const locations = [];
		if (configChanged) locations.push(editResult.pathLabel);
		if (shouldTouchStore) locations.push("pairing store");
		return {
			shouldContinue: false,
			reply: { text: `✅ ${scopeLabel} allowlist ${actionLabel}: ${locations.length > 0 ? locations.join(" + ") : "no-op"}.` }
		};
	}
	if (!shouldTouchStore) return {
		shouldContinue: false,
		reply: { text: "⚠️ This channel does not support allowlist storage." }
	};
	await updatePairingStoreAllowlist({
		action: parsed.action,
		channelId,
		accountId,
		entry: parsed.entry
	});
	const actionLabel = parsed.action === "add" ? "added" : "removed";
	return {
		shouldContinue: false,
		reply: { text: `✅ ${parsed.scope === "dm" ? "DM" : "group"} allowlist ${actionLabel} in pairing store.` }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-approve.ts
const COMMAND_REGEX = /^\/approve(?:\s|$)/i;
const FOREIGN_COMMAND_MENTION_REGEX = /^\/approve@([^\s]+)(?:\s|$)/i;
const DECISION_ALIASES = {
	allow: "allow-once",
	once: "allow-once",
	"allow-once": "allow-once",
	allowonce: "allow-once",
	always: "allow-always",
	"allow-always": "allow-always",
	allowalways: "allow-always",
	deny: "deny",
	reject: "deny",
	block: "deny"
};
function parseApproveCommand(raw) {
	const trimmed = raw.trim();
	if (FOREIGN_COMMAND_MENTION_REGEX.test(trimmed)) return {
		ok: false,
		error: "❌ This /approve command targets a different Telegram bot."
	};
	const commandMatch = trimmed.match(COMMAND_REGEX);
	if (!commandMatch) return null;
	const rest = trimmed.slice(commandMatch[0].length).trim();
	if (!rest) return {
		ok: false,
		error: "Usage: /approve <id> allow-once|allow-always|deny"
	};
	const tokens = rest.split(/\s+/).filter(Boolean);
	if (tokens.length < 2) return {
		ok: false,
		error: "Usage: /approve <id> allow-once|allow-always|deny"
	};
	const first = tokens[0].toLowerCase();
	const second = tokens[1].toLowerCase();
	if (DECISION_ALIASES[first]) return {
		ok: true,
		decision: DECISION_ALIASES[first],
		id: tokens.slice(1).join(" ").trim()
	};
	if (DECISION_ALIASES[second]) return {
		ok: true,
		decision: DECISION_ALIASES[second],
		id: tokens[0]
	};
	return {
		ok: false,
		error: "Usage: /approve <id> allow-once|allow-always|deny"
	};
}
function buildResolvedByLabel(params) {
	return `${params.command.channel}:${params.command.senderId ?? "unknown"}`;
}
const handleApproveCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	const parsed = parseApproveCommand(normalized);
	if (!parsed) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /approve from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	if (!parsed.ok) return {
		shouldContinue: false,
		reply: { text: parsed.error }
	};
	if (params.command.channel === "telegram") {
		if (!isTelegramExecApprovalClientEnabled({
			cfg: params.cfg,
			accountId: params.ctx.AccountId
		})) return {
			shouldContinue: false,
			reply: { text: "❌ Telegram exec approvals are not enabled for this bot account." }
		};
		if (!isTelegramExecApprovalApprover({
			cfg: params.cfg,
			accountId: params.ctx.AccountId,
			senderId: params.command.senderId
		})) return {
			shouldContinue: false,
			reply: { text: "❌ You are not authorized to approve exec requests on Telegram." }
		};
	}
	const missingScope = requireGatewayClientScopeForInternalChannel(params, {
		label: "/approve",
		allowedScopes: ["operator.approvals", "operator.admin"],
		missingText: "❌ /approve requires operator.approvals for gateway clients."
	});
	if (missingScope) return missingScope;
	const resolvedBy = buildResolvedByLabel(params);
	try {
		await callGateway({
			method: "exec.approval.resolve",
			params: {
				id: parsed.id,
				decision: parsed.decision
			},
			clientName: GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
			clientDisplayName: `Chat approval (${resolvedBy})`,
			mode: GATEWAY_CLIENT_MODES.BACKEND
		});
	} catch (err) {
		return {
			shouldContinue: false,
			reply: { text: `❌ Failed to submit approval: ${String(err)}` }
		};
	}
	return {
		shouldContinue: false,
		reply: { text: `✅ Exec approval ${parsed.decision} submitted for ${parsed.id}.` }
	};
};
//#endregion
//#region src/auto-reply/reply/bash-command.ts
const CHAT_BASH_SCOPE_KEY = "chat:bash";
const DEFAULT_FOREGROUND_MS = 2e3;
const MAX_FOREGROUND_MS = 3e4;
let activeJob = null;
function resolveForegroundMs(cfg) {
	const raw = cfg.commands?.bashForegroundMs;
	if (typeof raw !== "number" || Number.isNaN(raw)) return DEFAULT_FOREGROUND_MS;
	return clampInt(raw, 0, MAX_FOREGROUND_MS);
}
function formatSessionSnippet(sessionId) {
	const trimmed = sessionId.trim();
	if (trimmed.length <= 12) return trimmed;
	return `${trimmed.slice(0, 8)}…`;
}
function formatOutputBlock(text) {
	const trimmed = text.trim();
	if (!trimmed) return "(no output)";
	return `\`\`\`txt\n${trimmed}\n\`\`\``;
}
function parseBashRequest(raw) {
	const trimmed = raw.trimStart();
	let restSource = "";
	if (trimmed.toLowerCase().startsWith("/bash")) {
		const match = trimmed.match(/^\/bash(?:\s*:\s*|\s+|$)([\s\S]*)$/i);
		if (!match) return null;
		restSource = match[1] ?? "";
	} else if (trimmed.startsWith("!")) {
		restSource = trimmed.slice(1);
		if (restSource.trimStart().startsWith(":")) restSource = restSource.trimStart().slice(1);
	} else return null;
	const rest = restSource.trimStart();
	if (!rest) return { action: "help" };
	const tokenMatch = rest.match(/^(\S+)(?:\s+([\s\S]+))?$/);
	const token = tokenMatch?.[1]?.trim() ?? "";
	const remainder = tokenMatch?.[2]?.trim() ?? "";
	const lowered = token.toLowerCase();
	if (lowered === "poll") return {
		action: "poll",
		sessionId: remainder || void 0
	};
	if (lowered === "stop") return {
		action: "stop",
		sessionId: remainder || void 0
	};
	if (lowered === "help") return { action: "help" };
	return {
		action: "run",
		command: rest
	};
}
function resolveRawCommandBody(params) {
	const stripped = stripStructuralPrefixes(params.ctx.CommandBody ?? params.ctx.RawBody ?? params.ctx.Body ?? "");
	return params.isGroup ? stripMentions(stripped, params.ctx, params.cfg, params.agentId) : stripped;
}
function getScopedSession(sessionId) {
	const running = getSession(sessionId);
	if (running && running.scopeKey === CHAT_BASH_SCOPE_KEY) return { running };
	const finished = getFinishedSession(sessionId);
	if (finished && finished.scopeKey === CHAT_BASH_SCOPE_KEY) return { finished };
	return {};
}
function ensureActiveJobState() {
	if (!activeJob) return null;
	if (activeJob.state === "starting") return activeJob;
	const { running, finished } = getScopedSession(activeJob.sessionId);
	if (running) return activeJob;
	if (finished) {
		activeJob = null;
		return null;
	}
	activeJob = null;
	return null;
}
function attachActiveWatcher(sessionId) {
	if (!activeJob || activeJob.state !== "running") return;
	if (activeJob.sessionId !== sessionId) return;
	if (activeJob.watcherAttached) return;
	const { running } = getScopedSession(sessionId);
	const child = running?.child;
	if (!child) return;
	activeJob.watcherAttached = true;
	child.once("close", () => {
		if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
	});
}
function buildUsageReply() {
	return { text: [
		"⚙️ Usage:",
		"- ! <command>",
		"- !poll | ! poll",
		"- !stop | ! stop",
		"- /bash ... (alias; same subcommands as !)"
	].join("\n") };
}
async function handleBashChatCommand(params) {
	if (!isCommandFlagEnabled(params.cfg, "bash")) return buildDisabledCommandReply({
		label: "bash",
		configKey: "bash",
		docsUrl: "https://docs.openclaw.ai/tools/slash-commands#config"
	});
	const agentId = params.agentId ?? resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	if (!params.elevated.enabled || !params.elevated.allowed) {
		const runtimeSandboxed = resolveSandboxRuntimeStatus({
			cfg: params.cfg,
			sessionKey: params.ctx.SessionKey
		}).sandboxed;
		return { text: formatElevatedUnavailableMessage({
			runtimeSandboxed,
			failures: params.elevated.failures,
			sessionKey: params.ctx.SessionKey
		}) };
	}
	const request = parseBashRequest(resolveRawCommandBody({
		ctx: params.ctx,
		cfg: params.cfg,
		agentId,
		isGroup: params.isGroup
	}).trim());
	if (!request) return { text: "⚠️ Unrecognized bash request." };
	const liveJob = ensureActiveJobState();
	if (request.action === "help") return buildUsageReply();
	if (request.action === "poll") {
		const sessionId = request.sessionId?.trim() || (liveJob?.state === "running" ? liveJob.sessionId : "");
		if (!sessionId) return { text: "⚙️ No active bash job." };
		const { running, finished } = getScopedSession(sessionId);
		if (running) {
			attachActiveWatcher(sessionId);
			const runtimeSec = Math.max(0, Math.floor((Date.now() - running.startedAt) / 1e3));
			const tail = running.tail || "(no output yet)";
			return { text: [
				`⚙️ bash still running (session ${formatSessionSnippet(sessionId)}, ${runtimeSec}s).`,
				formatOutputBlock(tail),
				"Hint: !stop (or /bash stop)"
			].join("\n") };
		}
		if (finished) {
			if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
			const exitLabel = finished.exitSignal ? `signal ${String(finished.exitSignal)}` : `code ${String(finished.exitCode ?? 0)}`;
			return { text: [
				`${finished.status === "completed" ? "⚙️" : "⚠️"} bash finished (session ${formatSessionSnippet(sessionId)}).`,
				`Exit: ${exitLabel}`,
				formatOutputBlock(finished.aggregated || finished.tail)
			].join("\n") };
		}
		if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
		return { text: `⚙️ No bash session found for ${formatSessionSnippet(sessionId)}.` };
	}
	if (request.action === "stop") {
		const sessionId = request.sessionId?.trim() || (liveJob?.state === "running" ? liveJob.sessionId : "");
		if (!sessionId) return { text: "⚙️ No active bash job." };
		const { running } = getScopedSession(sessionId);
		if (!running) {
			if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
			return { text: `⚙️ No running bash job found for ${formatSessionSnippet(sessionId)}.` };
		}
		if (!running.backgrounded) return { text: `⚠️ Session ${formatSessionSnippet(sessionId)} is not backgrounded.` };
		const pid = running.pid ?? running.child?.pid;
		if (pid) killProcessTree(pid);
		markExited(running, null, "SIGKILL", "failed");
		if (activeJob?.state === "running" && activeJob.sessionId === sessionId) activeJob = null;
		return { text: `⚙️ bash stopped (session ${formatSessionSnippet(sessionId)}).` };
	}
	if (liveJob) return { text: `⚠️ A bash job is already running (${liveJob.state === "running" ? formatSessionSnippet(liveJob.sessionId) : "starting"}). Use !poll / !stop (or /bash poll / /bash stop).` };
	const commandText = request.command.trim();
	if (!commandText) return buildUsageReply();
	activeJob = {
		state: "starting",
		startedAt: Date.now(),
		command: commandText
	};
	try {
		const foregroundMs = resolveForegroundMs(params.cfg);
		const shouldBackgroundImmediately = foregroundMs <= 0;
		const timeoutSec = params.cfg.tools?.exec?.timeoutSec;
		const notifyOnExit = params.cfg.tools?.exec?.notifyOnExit;
		const notifyOnExitEmptySuccess = params.cfg.tools?.exec?.notifyOnExitEmptySuccess;
		const result = await createExecTool({
			scopeKey: CHAT_BASH_SCOPE_KEY,
			allowBackground: true,
			timeoutSec,
			sessionKey: params.sessionKey,
			notifyOnExit,
			notifyOnExitEmptySuccess,
			elevated: {
				enabled: params.elevated.enabled,
				allowed: params.elevated.allowed,
				defaultLevel: "on"
			}
		}).execute("chat-bash", {
			command: commandText,
			background: shouldBackgroundImmediately,
			yieldMs: shouldBackgroundImmediately ? void 0 : foregroundMs,
			timeout: timeoutSec,
			elevated: true
		});
		if (result.details?.status === "running") {
			const sessionId = result.details.sessionId;
			activeJob = {
				state: "running",
				sessionId,
				startedAt: result.details.startedAt,
				command: commandText,
				watcherAttached: false
			};
			attachActiveWatcher(sessionId);
			logVerbose(`Started bash session ${formatSessionSnippet(sessionId)}: ${commandText}`);
			return { text: `⚙️ bash started (session ${sessionId}). Still running; use !poll / !stop (or /bash poll / /bash stop).` };
		}
		activeJob = null;
		const exitCode = result.details?.status === "completed" ? result.details.exitCode : 0;
		const output = result.details?.status === "completed" ? result.details.aggregated : result.content.map((chunk) => chunk.type === "text" ? chunk.text : "").join("\n");
		return { text: [
			`⚙️ bash: ${commandText}`,
			`Exit: ${exitCode}`,
			formatOutputBlock(output || "(no output)")
		].join("\n") };
	} catch (err) {
		activeJob = null;
		const message = err instanceof Error ? err.message : String(err);
		return { text: [`⚠️ bash failed: ${commandText}`, formatOutputBlock(message)].join("\n") };
	}
}
//#endregion
//#region src/auto-reply/reply/commands-bash.ts
const handleBashCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const { command } = params;
	const bashSlashRequested = command.commandBodyNormalized === "/bash" || command.commandBodyNormalized.startsWith("/bash ");
	const bashBangRequested = command.commandBodyNormalized.startsWith("!");
	if (!bashSlashRequested && !(bashBangRequested && command.isAuthorizedSender)) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/bash");
	if (unauthorized) return unauthorized;
	return {
		shouldContinue: false,
		reply: await handleBashChatCommand({
			ctx: params.ctx,
			cfg: params.cfg,
			agentId: params.agentId,
			sessionKey: params.sessionKey,
			isGroup: params.isGroup,
			elevated: params.elevated
		})
	};
};
//#endregion
//#region src/agents/btw.ts
function collectTextContent(content) {
	return content.filter((part) => part.type === "text").map((part) => part.text).join("");
}
function collectThinkingContent(content) {
	return content.filter((part) => part.type === "thinking").map((part) => part.thinking).join("");
}
function buildBtwSystemPrompt() {
	return [
		"You are answering an ephemeral /btw side question about the current conversation.",
		"Use the conversation only as background context.",
		"Answer only the side question in the last user message.",
		"Do not continue, resume, or complete any unfinished task from the conversation.",
		"Do not emit tool calls, pseudo-tool calls, shell commands, file writes, patches, or code unless the side question explicitly asks for them.",
		"Do not say you will continue the main task after answering.",
		"If the question can be answered briefly, answer briefly."
	].join("\n");
}
function buildBtwQuestionPrompt(question, inFlightPrompt) {
	const lines = ["Answer this side question only.", "Ignore any unfinished task in the conversation while answering it."];
	const trimmedPrompt = inFlightPrompt?.trim();
	if (trimmedPrompt) lines.push("", "Current in-flight main task request for background context only:", "<in_flight_main_task>", trimmedPrompt, "</in_flight_main_task>", "Do not continue or complete that task while answering the side question.");
	lines.push("", "<btw_side_question>", question.trim(), "</btw_side_question>");
	return lines.join("\n");
}
function toSimpleContextMessages(messages) {
	return stripToolResultDetails(messages.filter((message) => {
		if (!message || typeof message !== "object") return false;
		const role = message.role;
		return role === "user" || role === "assistant";
	}));
}
function resolveSimpleThinkingLevel(level) {
	if (!level || level === "off") return;
	return mapThinkingLevel(level);
}
function resolveSessionTranscriptPath(params) {
	try {
		const agentId = params.sessionKey?.split(":")[1];
		const pathOpts = resolveSessionFilePathOptions({
			agentId,
			storePath: params.storePath
		});
		return resolveSessionFilePath(params.sessionId, params.sessionEntry, pathOpts);
	} catch (error) {
		diag.debug(`resolveSessionTranscriptPath failed: sessionId=${params.sessionId} err=${String(error)}`);
		return;
	}
}
async function resolveRuntimeModel(params) {
	await ensureOpenClawModelsJson(params.cfg, params.agentDir);
	const modelRegistry = discoverModels(discoverAuthStorage(params.agentDir), params.agentDir);
	const model = resolveModelWithRegistry({
		provider: params.provider,
		modelId: params.model,
		modelRegistry,
		cfg: params.cfg
	});
	if (!model) throw new Error(`Unknown model: ${params.provider}/${params.model}`);
	return {
		model,
		authProfileId: await resolveSessionAuthProfileOverride({
			cfg: params.cfg,
			provider: params.provider,
			agentDir: params.agentDir,
			sessionEntry: params.sessionEntry,
			sessionStore: params.sessionStore,
			sessionKey: params.sessionKey,
			storePath: params.storePath,
			isNewSession: params.isNewSession
		}),
		authProfileIdSource: params.sessionEntry?.authProfileOverrideSource
	};
}
async function runBtwSideQuestion(params) {
	const sessionId = params.sessionEntry.sessionId?.trim();
	if (!sessionId) throw new Error("No active session context.");
	const sessionFile = resolveSessionTranscriptPath({
		sessionId,
		sessionEntry: params.sessionEntry,
		sessionKey: params.sessionKey,
		storePath: params.storePath
	});
	if (!sessionFile) throw new Error("No active session transcript.");
	const sessionManager = SessionManager.open(sessionFile);
	const activeRunSnapshot = getActiveEmbeddedRunSnapshot(sessionId);
	let messages = [];
	let inFlightPrompt;
	if (Array.isArray(activeRunSnapshot?.messages) && activeRunSnapshot.messages.length > 0) {
		messages = toSimpleContextMessages(activeRunSnapshot.messages);
		inFlightPrompt = activeRunSnapshot.inFlightPrompt;
	} else if (activeRunSnapshot) {
		inFlightPrompt = activeRunSnapshot.inFlightPrompt;
		if (activeRunSnapshot.transcriptLeafId && sessionManager.branch) try {
			sessionManager.branch(activeRunSnapshot.transcriptLeafId);
		} catch (error) {
			diag.debug(`btw snapshot leaf unavailable: sessionId=${sessionId} leaf=${activeRunSnapshot.transcriptLeafId} err=${String(error)}`);
			sessionManager.resetLeaf?.();
		}
		else sessionManager.resetLeaf?.();
	} else {
		const leafEntry = sessionManager.getLeafEntry?.();
		if (leafEntry?.type === "message" && leafEntry.message?.role === "user") if (leafEntry.parentId && sessionManager.branch) sessionManager.branch(leafEntry.parentId);
		else sessionManager.resetLeaf?.();
	}
	if (messages.length === 0) {
		const sessionContext = sessionManager.buildSessionContext();
		messages = toSimpleContextMessages(Array.isArray(sessionContext.messages) ? sessionContext.messages : []);
	}
	if (messages.length === 0 && !inFlightPrompt?.trim()) throw new Error("No active session context.");
	const { model, authProfileId } = await resolveRuntimeModel({
		cfg: params.cfg,
		provider: params.provider,
		model: params.model,
		agentDir: params.agentDir,
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore,
		sessionKey: params.sessionKey,
		storePath: params.storePath,
		isNewSession: params.isNewSession
	});
	const apiKey = requireApiKey(await getApiKeyForModel({
		model,
		cfg: params.cfg,
		profileId: authProfileId,
		agentDir: params.agentDir
	}), model.provider);
	const chunker = params.opts?.onBlockReply && params.blockReplyChunking ? new EmbeddedBlockChunker(params.blockReplyChunking) : void 0;
	let emittedBlocks = 0;
	let blockEmitChain = Promise.resolve();
	let answerText = "";
	let reasoningText = "";
	let assistantStarted = false;
	let sawTextEvent = false;
	const emitBlockChunk = async (text) => {
		if (!text.trim() || !params.opts?.onBlockReply) return;
		emittedBlocks += 1;
		blockEmitChain = blockEmitChain.then(async () => {
			await params.opts?.onBlockReply?.({
				text,
				btw: { question: params.question }
			});
		});
		await blockEmitChain;
	};
	const stream = streamSimple(model, {
		systemPrompt: buildBtwSystemPrompt(),
		messages: [...messages, {
			role: "user",
			content: [{
				type: "text",
				text: buildBtwQuestionPrompt(params.question, inFlightPrompt)
			}],
			timestamp: Date.now()
		}]
	}, {
		apiKey,
		reasoning: resolveSimpleThinkingLevel(params.resolvedThinkLevel),
		signal: params.opts?.abortSignal
	});
	let finalEvent;
	for await (const event of stream) {
		finalEvent = event.type === "done" || event.type === "error" ? event : finalEvent;
		if (!assistantStarted && (event.type === "text_start" || event.type === "start")) {
			assistantStarted = true;
			await params.opts?.onAssistantMessageStart?.();
		}
		if (event.type === "text_delta") {
			sawTextEvent = true;
			answerText += event.delta;
			chunker?.append(event.delta);
			if (chunker && params.resolvedBlockStreamingBreak === "text_end") chunker.drain({
				force: false,
				emit: (chunk) => void emitBlockChunk(chunk)
			});
			continue;
		}
		if (event.type === "text_end" && chunker && params.resolvedBlockStreamingBreak === "text_end") {
			chunker.drain({
				force: true,
				emit: (chunk) => void emitBlockChunk(chunk)
			});
			continue;
		}
		if (event.type === "thinking_delta") {
			reasoningText += event.delta;
			if (params.resolvedReasoningLevel !== "off") await params.opts?.onReasoningStream?.({
				text: reasoningText,
				isReasoning: true
			});
			continue;
		}
		if (event.type === "thinking_end" && params.resolvedReasoningLevel !== "off") await params.opts?.onReasoningEnd?.();
	}
	if (chunker && params.resolvedBlockStreamingBreak !== "text_end" && chunker.hasBuffered()) chunker.drain({
		force: true,
		emit: (chunk) => void emitBlockChunk(chunk)
	});
	await blockEmitChain;
	if (finalEvent?.type === "error") {
		const message = collectTextContent(finalEvent.error.content);
		throw new Error(message || finalEvent.error.errorMessage || "BTW failed.");
	}
	const finalMessage = finalEvent?.type === "done" ? finalEvent.message : void 0;
	if (finalMessage) {
		if (!sawTextEvent) answerText = collectTextContent(finalMessage.content);
		if (!reasoningText) reasoningText = collectThinkingContent(finalMessage.content);
	}
	const answer = answerText.trim();
	if (!answer) throw new Error("No BTW response generated.");
	if (emittedBlocks > 0) return;
	return { text: answer };
}
//#endregion
//#region src/auto-reply/reply/commands-btw.ts
const BTW_USAGE = "Usage: /btw <side question>";
const handleBtwCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const question = extractBtwQuestion(params.command.commandBodyNormalized);
	if (question === null) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/btw");
	if (unauthorized) return unauthorized;
	if (!question) return {
		shouldContinue: false,
		reply: { text: BTW_USAGE }
	};
	if (!params.sessionEntry?.sessionId) return {
		shouldContinue: false,
		reply: { text: "⚠️ /btw requires an active session with existing context." }
	};
	if (!params.agentDir) return {
		shouldContinue: false,
		reply: { text: "⚠️ /btw is unavailable because the active agent directory could not be resolved." }
	};
	try {
		await params.typing?.startTypingLoop();
		const reply = await runBtwSideQuestion({
			cfg: params.cfg,
			agentDir: params.agentDir,
			provider: params.provider,
			model: params.model,
			question,
			sessionEntry: params.sessionEntry,
			sessionStore: params.sessionStore,
			sessionKey: params.sessionKey,
			storePath: params.storePath,
			resolvedThinkLevel: "off",
			resolvedReasoningLevel: "off",
			blockReplyChunking: params.blockReplyChunking,
			resolvedBlockStreamingBreak: params.resolvedBlockStreamingBreak,
			opts: params.opts,
			isNewSession: false
		});
		return {
			shouldContinue: false,
			reply: reply ? {
				...reply,
				btw: { question }
			} : reply
		};
	} catch (error) {
		const message = error instanceof Error ? error.message.trim() : "";
		return {
			shouldContinue: false,
			reply: {
				text: `⚠️ /btw failed${message ? `: ${message}` : "."}`,
				btw: { question },
				isError: true
			}
		};
	}
};
//#endregion
//#region src/auto-reply/reply/commands-compact.ts
function extractCompactInstructions(params) {
	const raw = stripStructuralPrefixes(params.rawBody ?? "");
	const trimmed = (params.isGroup ? stripMentions(raw, params.ctx, params.cfg, params.agentId) : raw).trim();
	if (!trimmed) return;
	const prefix = trimmed.toLowerCase().startsWith("/compact") ? "/compact" : null;
	if (!prefix) return;
	let rest = trimmed.slice(prefix.length).trimStart();
	if (rest.startsWith(":")) rest = rest.slice(1).trimStart();
	return rest.length ? rest : void 0;
}
const handleCompactCommand = async (params) => {
	if (!(params.command.commandBodyNormalized === "/compact" || params.command.commandBodyNormalized.startsWith("/compact "))) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /compact from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	if (!params.sessionEntry?.sessionId) return {
		shouldContinue: false,
		reply: { text: "⚙️ Compaction unavailable (missing session id)." }
	};
	const sessionId = params.sessionEntry.sessionId;
	if (isEmbeddedPiRunActive(sessionId)) {
		abortEmbeddedPiRun(sessionId);
		await waitForEmbeddedPiRunEnd(sessionId, 15e3);
	}
	const customInstructions = extractCompactInstructions({
		rawBody: params.ctx.CommandBody ?? params.ctx.RawBody ?? params.ctx.Body,
		ctx: params.ctx,
		cfg: params.cfg,
		agentId: params.agentId,
		isGroup: params.isGroup
	});
	const result = await compactEmbeddedPiSession({
		sessionId,
		sessionKey: params.sessionKey,
		allowGatewaySubagentBinding: true,
		messageChannel: params.command.channel,
		groupId: params.sessionEntry.groupId,
		groupChannel: params.sessionEntry.groupChannel,
		groupSpace: params.sessionEntry.space,
		spawnedBy: params.sessionEntry.spawnedBy,
		sessionFile: resolveSessionFilePath(sessionId, params.sessionEntry, resolveSessionFilePathOptions({
			agentId: params.agentId,
			storePath: params.storePath
		})),
		workspaceDir: params.workspaceDir,
		agentDir: params.agentDir,
		config: params.cfg,
		skillsSnapshot: params.sessionEntry.skillsSnapshot,
		provider: params.provider,
		model: params.model,
		thinkLevel: params.resolvedThinkLevel ?? await params.resolveDefaultThinkingLevel(),
		bashElevated: {
			enabled: false,
			allowed: false,
			defaultLevel: "off"
		},
		customInstructions,
		trigger: "manual",
		senderIsOwner: params.command.senderIsOwner,
		ownerNumbers: params.command.ownerList.length > 0 ? params.command.ownerList : void 0
	});
	const compactLabel = result.ok ? result.compacted ? result.result?.tokensBefore != null && result.result?.tokensAfter != null ? `Compacted (${formatTokenCount(result.result.tokensBefore)} → ${formatTokenCount(result.result.tokensAfter)})` : result.result?.tokensBefore ? `Compacted (${formatTokenCount(result.result.tokensBefore)} before)` : "Compacted" : "Compaction skipped" : "Compaction failed";
	if (result.ok && result.compacted) await incrementCompactionCount({
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore,
		sessionKey: params.sessionKey,
		storePath: params.storePath,
		tokensAfter: result.result?.tokensAfter
	});
	const totalTokens = result.result?.tokensAfter ?? resolveFreshSessionTotalTokens(params.sessionEntry);
	const contextSummary = formatContextUsageShort(typeof totalTokens === "number" && totalTokens > 0 ? totalTokens : null, params.contextTokens ?? params.sessionEntry.contextTokens ?? null);
	const reason = result.reason?.trim();
	const line = reason ? `${compactLabel}: ${reason} • ${contextSummary}` : `${compactLabel} • ${contextSummary}`;
	enqueueSystemEvent(line, { sessionKey: params.sessionKey });
	return {
		shouldContinue: false,
		reply: { text: `⚙️ ${line}` }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-slash-parse.ts
function parseSlashCommandActionArgs(raw, slash) {
	const trimmed = raw.trim();
	const slashLower = slash.toLowerCase();
	if (!trimmed.toLowerCase().startsWith(slashLower)) return { kind: "no-match" };
	const rest = trimmed.slice(slash.length).trim();
	if (!rest) return { kind: "empty" };
	const match = rest.match(/^(\S+)(?:\s+([\s\S]+))?$/);
	if (!match) return { kind: "invalid" };
	return {
		kind: "parsed",
		action: match[1]?.toLowerCase() ?? "",
		args: (match[2] ?? "").trim()
	};
}
function parseSlashCommandOrNull(raw, slash, opts) {
	const parsed = parseSlashCommandActionArgs(raw, slash);
	if (parsed.kind === "no-match") return null;
	if (parsed.kind === "invalid") return {
		ok: false,
		message: opts.invalidMessage
	};
	if (parsed.kind === "empty") return {
		ok: true,
		action: opts.defaultAction ?? "show",
		args: ""
	};
	return {
		ok: true,
		action: parsed.action,
		args: parsed.args
	};
}
//#endregion
//#region src/auto-reply/reply/commands-setunset.ts
function parseSetUnsetCommand(params) {
	const action = params.action;
	const args = params.args.trim();
	if (action === "unset") {
		if (!args) return {
			kind: "error",
			message: `Usage: ${params.slash} unset path`
		};
		return {
			kind: "unset",
			path: args
		};
	}
	if (!args) return {
		kind: "error",
		message: `Usage: ${params.slash} set path=value`
	};
	const eqIndex = args.indexOf("=");
	if (eqIndex <= 0) return {
		kind: "error",
		message: `Usage: ${params.slash} set path=value`
	};
	const path = args.slice(0, eqIndex).trim();
	const rawValue = args.slice(eqIndex + 1);
	if (!path) return {
		kind: "error",
		message: `Usage: ${params.slash} set path=value`
	};
	const parsed = parseConfigValue(rawValue);
	if (parsed.error) return {
		kind: "error",
		message: parsed.error
	};
	return {
		kind: "set",
		path,
		value: parsed.value
	};
}
function parseSetUnsetCommandAction(params) {
	if (params.action !== "set" && params.action !== "unset") return null;
	const parsed = parseSetUnsetCommand({
		slash: params.slash,
		action: params.action,
		args: params.args
	});
	if (parsed.kind === "error") return params.onError(parsed.message);
	return parsed.kind === "set" ? params.onSet(parsed.path, parsed.value) : params.onUnset(parsed.path);
}
function parseSlashCommandWithSetUnset(params) {
	const parsed = parseSlashCommandOrNull(params.raw, params.slash, { invalidMessage: params.invalidMessage });
	if (!parsed) return null;
	if (!parsed.ok) return params.onError(parsed.message);
	const { action, args } = parsed;
	const setUnset = parseSetUnsetCommandAction({
		slash: params.slash,
		action,
		args,
		onSet: params.onSet,
		onUnset: params.onUnset,
		onError: params.onError
	});
	if (setUnset) return setUnset;
	const knownAction = params.onKnownAction(action, args);
	if (knownAction) return knownAction;
	return params.onError(params.usageMessage);
}
//#endregion
//#region src/auto-reply/reply/commands-setunset-standard.ts
function parseStandardSetUnsetSlashCommand(params) {
	return parseSlashCommandWithSetUnset({
		raw: params.raw,
		slash: params.slash,
		invalidMessage: params.invalidMessage,
		usageMessage: params.usageMessage,
		onKnownAction: params.onKnownAction,
		onSet: params.onSet ?? ((path, value) => ({
			action: "set",
			path,
			value
		})),
		onUnset: params.onUnset ?? ((path) => ({
			action: "unset",
			path
		})),
		onError: params.onError ?? ((message) => ({
			action: "error",
			message
		}))
	});
}
//#endregion
//#region src/auto-reply/reply/config-commands.ts
function parseConfigCommand(raw) {
	return parseStandardSetUnsetSlashCommand({
		raw,
		slash: "/config",
		invalidMessage: "Invalid /config syntax.",
		usageMessage: "Usage: /config show|set|unset",
		onKnownAction: (action, args) => {
			if (action === "show" || action === "get") return {
				action: "show",
				path: args || void 0
			};
		}
	});
}
//#endregion
//#region src/auto-reply/reply/debug-commands.ts
function parseDebugCommand(raw) {
	return parseStandardSetUnsetSlashCommand({
		raw,
		slash: "/debug",
		invalidMessage: "Invalid /debug syntax.",
		usageMessage: "Usage: /debug show|set|unset|reset",
		onKnownAction: (action) => {
			if (action === "show") return { action: "show" };
			if (action === "reset") return { action: "reset" };
		}
	});
}
//#endregion
//#region src/auto-reply/reply/commands-config.ts
const handleConfigCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const configCommand = parseConfigCommand(params.command.commandBodyNormalized);
	if (!configCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/config");
	if (unauthorized) return unauthorized;
	const nonOwner = configCommand.action === "show" && isInternalMessageChannel(params.command.channel) ? null : rejectNonOwnerCommand(params, "/config");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/config",
		configKey: "config"
	});
	if (disabled) return disabled;
	if (configCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${configCommand.message}` }
	};
	let parsedWritePath;
	if (configCommand.action === "set" || configCommand.action === "unset") {
		const missingAdminScope = requireGatewayClientScopeForInternalChannel(params, {
			label: "/config write",
			allowedScopes: ["operator.admin"],
			missingText: "❌ /config set|unset requires operator.admin for gateway clients."
		});
		if (missingAdminScope) return missingAdminScope;
		const parsedPath = parseConfigPath(configCommand.path);
		if (!parsedPath.ok || !parsedPath.path) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${parsedPath.error ?? "Invalid path."}` }
		};
		parsedWritePath = parsedPath.path;
		const channelId = params.command.channelId ?? normalizeChannelId(params.command.channel);
		const deniedText = resolveConfigWriteDeniedText({
			cfg: params.cfg,
			channel: params.command.channel,
			channelId,
			accountId: params.ctx.AccountId,
			gatewayClientScopes: params.ctx.GatewayClientScopes,
			target: resolveConfigWriteTargetFromPath(parsedWritePath)
		});
		if (deniedText) return {
			shouldContinue: false,
			reply: { text: deniedText }
		};
	}
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid || !snapshot.parsed || typeof snapshot.parsed !== "object") return {
		shouldContinue: false,
		reply: { text: "⚠️ Config file is invalid; fix it before using /config." }
	};
	const parsedBase = structuredClone(snapshot.parsed);
	if (configCommand.action === "show") {
		const pathRaw = configCommand.path?.trim();
		if (pathRaw) {
			const parsedPath = parseConfigPath(pathRaw);
			if (!parsedPath.ok || !parsedPath.path) return {
				shouldContinue: false,
				reply: { text: `⚠️ ${parsedPath.error ?? "Invalid path."}` }
			};
			const value = getConfigValueAtPath(parsedBase, parsedPath.path);
			return {
				shouldContinue: false,
				reply: { text: `⚙️ Config ${pathRaw}:\n\`\`\`json\n${JSON.stringify(value ?? null, null, 2)}\n\`\`\`` }
			};
		}
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Config (raw):\n\`\`\`json\n${JSON.stringify(parsedBase, null, 2)}\n\`\`\`` }
		};
	}
	if (configCommand.action === "unset") {
		if (!unsetConfigValueAtPath(parsedBase, parsedWritePath ?? [])) return {
			shouldContinue: false,
			reply: { text: `⚙️ No config value found for ${configCommand.path}.` }
		};
		const validated = validateConfigObjectWithPlugins(parsedBase);
		if (!validated.ok) {
			const issue = validated.issues[0];
			return {
				shouldContinue: false,
				reply: { text: `⚠️ Config invalid after unset (${issue.path}: ${issue.message}).` }
			};
		}
		await writeConfigFile(validated.config);
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Config updated: ${configCommand.path} removed.` }
		};
	}
	if (configCommand.action === "set") {
		setConfigValueAtPath(parsedBase, parsedWritePath ?? [], configCommand.value);
		const validated = validateConfigObjectWithPlugins(parsedBase);
		if (!validated.ok) {
			const issue = validated.issues[0];
			return {
				shouldContinue: false,
				reply: { text: `⚠️ Config invalid after set (${issue.path}: ${issue.message}).` }
			};
		}
		await writeConfigFile(validated.config);
		const valueLabel = typeof configCommand.value === "string" ? `"${configCommand.value}"` : JSON.stringify(configCommand.value);
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Config updated: ${configCommand.path}=${valueLabel ?? "null"}` }
		};
	}
	return null;
};
const handleDebugCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const debugCommand = parseDebugCommand(params.command.commandBodyNormalized);
	if (!debugCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/debug");
	if (unauthorized) return unauthorized;
	const nonOwner = rejectNonOwnerCommand(params, "/debug");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/debug",
		configKey: "debug"
	});
	if (disabled) return disabled;
	if (debugCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${debugCommand.message}` }
	};
	if (debugCommand.action === "show") {
		const overrides = getConfigOverrides();
		if (!(Object.keys(overrides).length > 0)) return {
			shouldContinue: false,
			reply: { text: "⚙️ Debug overrides: (none)" }
		};
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Debug overrides (memory-only):\n\`\`\`json\n${JSON.stringify(overrides, null, 2)}\n\`\`\`` }
		};
	}
	if (debugCommand.action === "reset") {
		resetConfigOverrides();
		return {
			shouldContinue: false,
			reply: { text: "⚙️ Debug overrides cleared; using config on disk." }
		};
	}
	if (debugCommand.action === "unset") {
		const result = unsetConfigOverride(debugCommand.path);
		if (!result.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${result.error ?? "Invalid path."}` }
		};
		if (!result.removed) return {
			shouldContinue: false,
			reply: { text: `⚙️ No debug override found for ${debugCommand.path}.` }
		};
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Debug override removed for ${debugCommand.path}.` }
		};
	}
	if (debugCommand.action === "set") {
		const result = setConfigOverride(debugCommand.path, debugCommand.value);
		if (!result.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${result.error ?? "Invalid override."}` }
		};
		const valueLabel = typeof debugCommand.value === "string" ? `"${debugCommand.value}"` : JSON.stringify(debugCommand.value);
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Debug override set: ${debugCommand.path}=${valueLabel ?? "null"}` }
		};
	}
	return null;
};
//#endregion
//#region src/auto-reply/reply/mcp-commands.ts
function parseMcpCommand(raw) {
	return parseStandardSetUnsetSlashCommand({
		raw,
		slash: "/mcp",
		invalidMessage: "Invalid /mcp syntax.",
		usageMessage: "Usage: /mcp show|set|unset",
		onKnownAction: (action, args) => {
			if (action === "show" || action === "get") return {
				action: "show",
				name: args || void 0
			};
		},
		onSet: (name, value) => ({
			action: "set",
			name,
			value
		}),
		onUnset: (name) => ({
			action: "unset",
			name
		})
	});
}
//#endregion
//#region src/auto-reply/reply/commands-mcp.ts
function renderJsonBlock$1(label, value) {
	return `${label}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}
const handleMcpCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const mcpCommand = parseMcpCommand(params.command.commandBodyNormalized);
	if (!mcpCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/mcp");
	if (unauthorized) return unauthorized;
	const nonOwner = mcpCommand.action === "show" && isInternalMessageChannel(params.command.channel) ? null : rejectNonOwnerCommand(params, "/mcp");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/mcp",
		configKey: "mcp"
	});
	if (disabled) return disabled;
	if (mcpCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${mcpCommand.message}` }
	};
	if (mcpCommand.action === "show") {
		const loaded = await listConfiguredMcpServers();
		if (!loaded.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${loaded.error}` }
		};
		if (mcpCommand.name) {
			const server = loaded.mcpServers[mcpCommand.name];
			if (!server) return {
				shouldContinue: false,
				reply: { text: `🔌 No MCP server named "${mcpCommand.name}" in ${loaded.path}.` }
			};
			return {
				shouldContinue: false,
				reply: { text: renderJsonBlock$1(`🔌 MCP server "${mcpCommand.name}" (${loaded.path})`, server) }
			};
		}
		if (Object.keys(loaded.mcpServers).length === 0) return {
			shouldContinue: false,
			reply: { text: `🔌 No MCP servers configured in ${loaded.path}.` }
		};
		return {
			shouldContinue: false,
			reply: { text: renderJsonBlock$1(`🔌 MCP servers (${loaded.path})`, loaded.mcpServers) }
		};
	}
	const missingAdminScope = requireGatewayClientScopeForInternalChannel(params, {
		label: "/mcp write",
		allowedScopes: ["operator.admin"],
		missingText: "❌ /mcp set|unset requires operator.admin for gateway clients."
	});
	if (missingAdminScope) return missingAdminScope;
	if (mcpCommand.action === "set") {
		const result = await setConfiguredMcpServer({
			name: mcpCommand.name,
			server: mcpCommand.value
		});
		if (!result.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${result.error}` }
		};
		return {
			shouldContinue: false,
			reply: { text: `🔌 MCP server "${mcpCommand.name}" saved to ${result.path}.` }
		};
	}
	const result = await unsetConfiguredMcpServer({ name: mcpCommand.name });
	if (!result.ok) return {
		shouldContinue: false,
		reply: { text: `⚠️ ${result.error}` }
	};
	if (!result.removed) return {
		shouldContinue: false,
		reply: { text: `🔌 No MCP server named "${mcpCommand.name}" in ${result.path}.` }
	};
	return {
		shouldContinue: false,
		reply: { text: `🔌 MCP server "${mcpCommand.name}" removed from ${result.path}.` }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-plugin.ts
/**
* Plugin Command Handler
*
* Handles commands registered by plugins, bypassing the LLM agent.
* This handler is called before built-in command handlers.
*/
/**
* Handle plugin-registered commands.
* Returns a result if a plugin command was matched and executed,
* or null to continue to the next handler.
*/
const handlePluginCommand = async (params, allowTextCommands) => {
	const { command, cfg } = params;
	if (!allowTextCommands) return null;
	const match = matchPluginCommand(command.commandBodyNormalized);
	if (!match) return null;
	return {
		shouldContinue: false,
		reply: await executePluginCommand({
			command: match.command,
			args: match.args,
			senderId: command.senderId,
			channel: command.channel,
			channelId: command.channelId,
			isAuthorizedSender: command.isAuthorizedSender,
			gatewayClientScopes: params.ctx.GatewayClientScopes,
			commandBody: command.commandBodyNormalized,
			config: cfg,
			from: command.from,
			to: command.to,
			accountId: params.ctx.AccountId ?? void 0,
			messageThreadId: typeof params.ctx.MessageThreadId === "string" || typeof params.ctx.MessageThreadId === "number" ? params.ctx.MessageThreadId : void 0
		})
	};
};
//#endregion
//#region src/auto-reply/reply/plugins-commands.ts
function parsePluginsCommand(raw) {
	const match = raw.match(/^\/plugins?(?:\s+(.*))?$/i);
	if (!match) return null;
	const tail = match[1]?.trim() ?? "";
	if (!tail) return { action: "list" };
	const [rawAction, ...rest] = tail.split(/\s+/);
	const action = rawAction?.trim().toLowerCase();
	const name = rest.join(" ").trim();
	if (action === "list") return name ? {
		action: "error",
		message: "Usage: /plugins list|inspect|show|get|enable|disable [plugin]"
	} : { action: "list" };
	if (action === "inspect" || action === "show" || action === "get") return {
		action: "inspect",
		name: name || void 0
	};
	if (action === "install" || action === "add") {
		if (!name) return {
			action: "error",
			message: "Usage: /plugins install <path|archive|npm-spec|clawhub:pkg>"
		};
		return {
			action: "install",
			spec: name
		};
	}
	if (action === "enable" || action === "disable") {
		if (!name) return {
			action: "error",
			message: `Usage: /plugins ${action} <plugin-id-or-name>`
		};
		return {
			action,
			name
		};
	}
	return {
		action: "error",
		message: "Usage: /plugins list|inspect|show|get|install|enable|disable [plugin]"
	};
}
//#endregion
//#region src/auto-reply/reply/commands-plugins.ts
function renderJsonBlock(label, value) {
	return `${label}\n\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}
function buildPluginInspectJson(params) {
	const inspect = buildPluginInspectReport({
		id: params.id,
		config: params.config,
		report: params.report
	});
	if (!inspect) return null;
	return {
		inspect,
		compatibilityWarnings: inspect.compatibility.map((warning) => ({
			code: warning.code,
			severity: warning.severity,
			message: formatPluginCompatibilityNotice(warning)
		})),
		install: params.config.plugins?.installs?.[inspect.plugin.id] ?? null
	};
}
function buildAllPluginInspectJson(params) {
	return buildAllPluginInspectReports({
		config: params.config,
		report: params.report
	}).map((inspect) => ({
		inspect,
		compatibilityWarnings: inspect.compatibility.map((warning) => ({
			code: warning.code,
			severity: warning.severity,
			message: formatPluginCompatibilityNotice(warning)
		})),
		install: params.config.plugins?.installs?.[inspect.plugin.id] ?? null
	}));
}
function formatPluginLabel(plugin) {
	if (!plugin.name || plugin.name === plugin.id) return plugin.id;
	return `${plugin.name} (${plugin.id})`;
}
function formatPluginsList(report) {
	if (report.plugins.length === 0) return `🔌 No plugins found for workspace ${report.workspaceDir ?? "(unknown workspace)"}.`;
	return [`🔌 Plugins (${report.plugins.filter((plugin) => plugin.status === "loaded").length}/${report.plugins.length} loaded)`, ...report.plugins.map((plugin) => {
		const format = plugin.bundleFormat ? `${plugin.format ?? "openclaw"}/${plugin.bundleFormat}` : plugin.format ?? "openclaw";
		return `- ${formatPluginLabel(plugin)} [${plugin.status}] ${format}`;
	})].join("\n");
}
function findPlugin(report, rawName) {
	const target = rawName.trim().toLowerCase();
	if (!target) return;
	return report.plugins.find((plugin) => plugin.id.toLowerCase() === target || plugin.name.toLowerCase() === target);
}
function looksLikeLocalPluginInstallSpec(raw) {
	return raw.startsWith(".") || raw.startsWith("~") || raw.startsWith("/") || raw.endsWith(".ts") || raw.endsWith(".js") || raw.endsWith(".mjs") || raw.endsWith(".cjs") || raw.endsWith(".tgz") || raw.endsWith(".tar.gz") || raw.endsWith(".tar") || raw.endsWith(".zip");
}
async function installPluginFromPluginsCommand(params) {
	const fileSpec = resolveFileNpmSpecToLocalPath(params.raw);
	if (fileSpec && !fileSpec.ok) return {
		ok: false,
		error: fileSpec.error
	};
	const resolved = resolveUserPath(fileSpec && fileSpec.ok ? fileSpec.path : params.raw);
	if (fs.existsSync(resolved)) {
		const result = await installPluginFromPath({
			path: resolved,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) return {
			ok: false,
			error: result.error
		};
		clearPluginManifestRegistryCache();
		const source = resolveArchiveKind(resolved) ? "archive" : "path";
		await persistPluginInstall({
			config: params.config,
			pluginId: result.pluginId,
			install: {
				source,
				sourcePath: resolved,
				installPath: result.targetDir,
				version: result.version
			}
		});
		return {
			ok: true,
			pluginId: result.pluginId
		};
	}
	if (looksLikeLocalPluginInstallSpec(params.raw)) return {
		ok: false,
		error: `Path not found: ${resolved}`
	};
	if (parseClawHubPluginSpec(params.raw)) {
		const result = await installPluginFromClawHub({
			spec: params.raw,
			logger: createPluginInstallLogger()
		});
		if (!result.ok) return {
			ok: false,
			error: result.error
		};
		clearPluginManifestRegistryCache();
		await persistPluginInstall({
			config: params.config,
			pluginId: result.pluginId,
			install: {
				source: "clawhub",
				spec: params.raw,
				installPath: result.targetDir,
				version: result.version,
				integrity: result.clawhub.integrity,
				resolvedAt: result.clawhub.resolvedAt,
				clawhubUrl: result.clawhub.clawhubUrl,
				clawhubPackage: result.clawhub.clawhubPackage,
				clawhubFamily: result.clawhub.clawhubFamily,
				clawhubChannel: result.clawhub.clawhubChannel
			}
		});
		return {
			ok: true,
			pluginId: result.pluginId
		};
	}
	const preferredClawHubSpec = buildPreferredClawHubSpec(params.raw);
	if (preferredClawHubSpec) {
		const clawhubResult = await installPluginFromClawHub({
			spec: preferredClawHubSpec,
			logger: createPluginInstallLogger()
		});
		if (clawhubResult.ok) {
			clearPluginManifestRegistryCache();
			await persistPluginInstall({
				config: params.config,
				pluginId: clawhubResult.pluginId,
				install: {
					source: "clawhub",
					spec: preferredClawHubSpec,
					installPath: clawhubResult.targetDir,
					version: clawhubResult.version,
					integrity: clawhubResult.clawhub.integrity,
					resolvedAt: clawhubResult.clawhub.resolvedAt,
					clawhubUrl: clawhubResult.clawhub.clawhubUrl,
					clawhubPackage: clawhubResult.clawhub.clawhubPackage,
					clawhubFamily: clawhubResult.clawhub.clawhubFamily,
					clawhubChannel: clawhubResult.clawhub.clawhubChannel
				}
			});
			return {
				ok: true,
				pluginId: clawhubResult.pluginId
			};
		}
		if (decidePreferredClawHubFallback(clawhubResult) !== "fallback_to_npm") return {
			ok: false,
			error: clawhubResult.error
		};
	}
	const result = await installPluginFromNpmSpec({
		spec: params.raw,
		logger: createPluginInstallLogger()
	});
	if (!result.ok) return {
		ok: false,
		error: result.error
	};
	clearPluginManifestRegistryCache();
	const installRecord = buildNpmInstallRecordFields({
		spec: params.raw,
		installPath: result.targetDir,
		version: result.version,
		resolution: result.npmResolution
	});
	await persistPluginInstall({
		config: params.config,
		pluginId: result.pluginId,
		install: installRecord
	});
	return {
		ok: true,
		pluginId: result.pluginId
	};
}
async function loadPluginCommandState(workspaceDir) {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) return {
		ok: false,
		path: snapshot.path,
		error: "Config file is invalid; fix it before using /plugins."
	};
	const config = structuredClone(snapshot.resolved);
	return {
		ok: true,
		path: snapshot.path,
		config,
		report: buildPluginStatusReport({
			config,
			workspaceDir
		})
	};
}
const handlePluginsCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const pluginsCommand = parsePluginsCommand(params.command.commandBodyNormalized);
	if (!pluginsCommand) return null;
	const unauthorized = rejectUnauthorizedCommand(params, "/plugins");
	if (unauthorized) return unauthorized;
	const nonOwner = (pluginsCommand.action === "list" || pluginsCommand.action === "inspect") && isInternalMessageChannel(params.command.channel) ? null : rejectNonOwnerCommand(params, "/plugins");
	if (nonOwner) return nonOwner;
	const disabled = requireCommandFlagEnabled(params.cfg, {
		label: "/plugins",
		configKey: "plugins"
	});
	if (disabled) return disabled;
	if (pluginsCommand.action === "error") return {
		shouldContinue: false,
		reply: { text: `⚠️ ${pluginsCommand.message}` }
	};
	const loaded = await loadPluginCommandState(params.workspaceDir);
	if (!loaded.ok) return {
		shouldContinue: false,
		reply: { text: `⚠️ ${loaded.error}` }
	};
	if (pluginsCommand.action === "list") return {
		shouldContinue: false,
		reply: { text: formatPluginsList(loaded.report) }
	};
	if (pluginsCommand.action === "inspect") {
		if (!pluginsCommand.name) return {
			shouldContinue: false,
			reply: { text: formatPluginsList(loaded.report) }
		};
		if (pluginsCommand.name.toLowerCase() === "all") return {
			shouldContinue: false,
			reply: { text: renderJsonBlock("🔌 Plugins", buildAllPluginInspectJson(loaded)) }
		};
		const payload = buildPluginInspectJson({
			id: pluginsCommand.name,
			config: loaded.config,
			report: loaded.report
		});
		if (!payload) return {
			shouldContinue: false,
			reply: { text: `🔌 No plugin named "${pluginsCommand.name}" found.` }
		};
		return {
			shouldContinue: false,
			reply: { text: renderJsonBlock(`🔌 Plugin "${payload.inspect.plugin.id}"`, {
				...payload.inspect,
				compatibilityWarnings: payload.compatibilityWarnings,
				install: payload.install
			}) }
		};
	}
	const missingAdminScope = requireGatewayClientScopeForInternalChannel(params, {
		label: "/plugins write",
		allowedScopes: ["operator.admin"],
		missingText: "❌ /plugins install|enable|disable requires operator.admin for gateway clients."
	});
	if (missingAdminScope) return missingAdminScope;
	if (pluginsCommand.action === "install") {
		const installed = await installPluginFromPluginsCommand({
			raw: pluginsCommand.spec,
			config: structuredClone(loaded.config)
		});
		if (!installed.ok) return {
			shouldContinue: false,
			reply: { text: `⚠️ ${installed.error}` }
		};
		return {
			shouldContinue: false,
			reply: { text: `🔌 Installed plugin "${installed.pluginId}". Restart the gateway to load plugins.` }
		};
	}
	const plugin = findPlugin(loaded.report, pluginsCommand.name);
	if (!plugin) return {
		shouldContinue: false,
		reply: { text: `🔌 No plugin named "${pluginsCommand.name}" found.` }
	};
	const validated = validateConfigObjectWithPlugins(setPluginEnabledInConfig(structuredClone(loaded.config), plugin.id, pluginsCommand.action === "enable"));
	if (!validated.ok) {
		const issue = validated.issues[0];
		return {
			shouldContinue: false,
			reply: { text: `⚠️ Config invalid after /plugins ${pluginsCommand.action} (${issue.path}: ${issue.message}).` }
		};
	}
	await writeConfigFile(validated.config);
	return {
		shouldContinue: false,
		reply: { text: `🔌 Plugin "${plugin.id}" ${pluginsCommand.action}d in ${loaded.path}. Restart the gateway to apply.` }
	};
};
//#endregion
//#region src/auto-reply/send-policy.ts
function normalizeSendPolicyOverride(raw) {
	const value = raw?.trim().toLowerCase();
	if (!value) return;
	if (value === "allow" || value === "on") return "allow";
	if (value === "deny" || value === "off") return "deny";
}
function parseSendPolicyCommand(raw) {
	if (!raw) return { hasCommand: false };
	const trimmed = raw.trim();
	if (!trimmed) return { hasCommand: false };
	const match = normalizeCommandBody(trimmed).match(/^\/send(?:\s+([a-zA-Z]+))?\s*$/i);
	if (!match) return { hasCommand: false };
	const token = match[1]?.trim().toLowerCase();
	if (!token) return { hasCommand: true };
	if (token === "inherit" || token === "default" || token === "reset") return {
		hasCommand: true,
		mode: "inherit"
	};
	return {
		hasCommand: true,
		mode: normalizeSendPolicyOverride(token)
	};
}
//#endregion
//#region src/auto-reply/reply/commands-session-store.ts
async function persistSessionEntry(params) {
	if (!params.sessionEntry || !params.sessionStore || !params.sessionKey) return false;
	params.sessionEntry.updatedAt = Date.now();
	params.sessionStore[params.sessionKey] = params.sessionEntry;
	if (params.storePath) await updateSessionStore(params.storePath, (store) => {
		store[params.sessionKey] = params.sessionEntry;
	});
	return true;
}
async function persistAbortTargetEntry(params) {
	const { entry, key, sessionStore, storePath, abortCutoff } = params;
	if (!entry || !key || !sessionStore) return false;
	entry.abortedLastRun = true;
	applyAbortCutoffToSessionEntry(entry, abortCutoff);
	entry.updatedAt = Date.now();
	sessionStore[key] = entry;
	if (storePath) await updateSessionStore(storePath, (store) => {
		const nextEntry = store[key] ?? entry;
		if (!nextEntry) return;
		nextEntry.abortedLastRun = true;
		applyAbortCutoffToSessionEntry(nextEntry, abortCutoff);
		nextEntry.updatedAt = Date.now();
		store[key] = nextEntry;
	});
	return true;
}
//#endregion
//#region src/auto-reply/reply/commands-session-abort.ts
function resolveAbortTarget(params) {
	const targetSessionKey = params.ctx.CommandTargetSessionKey?.trim() || params.sessionKey;
	const { entry, key } = resolveSessionEntryForKey(params.sessionStore, targetSessionKey);
	if (entry && key) return {
		entry,
		key,
		sessionId: entry.sessionId
	};
	if (params.sessionEntry && params.sessionKey) return {
		entry: params.sessionEntry,
		key: params.sessionKey,
		sessionId: params.sessionEntry.sessionId
	};
	return {
		entry: void 0,
		key: targetSessionKey,
		sessionId: void 0
	};
}
function resolveAbortCutoffForTarget(params) {
	if (!shouldPersistAbortCutoff({
		commandSessionKey: params.commandSessionKey,
		targetSessionKey: params.targetSessionKey
	})) return;
	return resolveAbortCutoffFromContext(params.ctx);
}
async function applyAbortTarget(params) {
	const { abortTarget } = params;
	if (abortTarget.sessionId) abortEmbeddedPiRun(abortTarget.sessionId);
	if (!await persistAbortTargetEntry({
		entry: abortTarget.entry,
		key: abortTarget.key,
		sessionStore: params.sessionStore,
		storePath: params.storePath,
		abortCutoff: params.abortCutoff
	}) && params.abortKey) setAbortMemory(params.abortKey, true);
}
function buildAbortTargetApplyParams(params, abortTarget) {
	return {
		abortTarget,
		sessionStore: params.sessionStore,
		storePath: params.storePath,
		abortKey: params.command.abortKey,
		abortCutoff: resolveAbortCutoffForTarget({
			ctx: params.ctx,
			commandSessionKey: params.sessionKey,
			targetSessionKey: abortTarget.key
		})
	};
}
const handleStopCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/stop") return null;
	const unauthorizedStop = rejectUnauthorizedCommand(params, "/stop");
	if (unauthorizedStop) return unauthorizedStop;
	const abortTarget = resolveAbortTarget({
		ctx: params.ctx,
		sessionKey: params.sessionKey,
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore
	});
	const cleared = clearSessionQueues([abortTarget.key, abortTarget.sessionId]);
	if (cleared.followupCleared > 0 || cleared.laneCleared > 0) logVerbose(`stop: cleared followups=${cleared.followupCleared} lane=${cleared.laneCleared} keys=${cleared.keys.join(",")}`);
	await applyAbortTarget(buildAbortTargetApplyParams(params, abortTarget));
	await triggerInternalHook(createInternalHookEvent("command", "stop", abortTarget.key ?? params.sessionKey ?? "", {
		sessionEntry: abortTarget.entry ?? params.sessionEntry,
		sessionId: abortTarget.sessionId,
		commandSource: params.command.surface,
		senderId: params.command.senderId
	}));
	const { stopped } = stopSubagentsForRequester({
		cfg: params.cfg,
		requesterSessionKey: abortTarget.key ?? params.sessionKey
	});
	return {
		shouldContinue: false,
		reply: { text: formatAbortReplyText(stopped) }
	};
};
const handleAbortTrigger = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (!isAbortTrigger(params.command.rawBodyNormalized)) return null;
	const unauthorizedAbortTrigger = rejectUnauthorizedCommand(params, "abort trigger");
	if (unauthorizedAbortTrigger) return unauthorizedAbortTrigger;
	await applyAbortTarget(buildAbortTargetApplyParams(params, resolveAbortTarget({
		ctx: params.ctx,
		sessionKey: params.sessionKey,
		sessionEntry: params.sessionEntry,
		sessionStore: params.sessionStore
	})));
	return {
		shouldContinue: false,
		reply: { text: "⚙️ Agent was aborted." }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-session.ts
const SESSION_DURATION_OFF_VALUES = new Set([
	"off",
	"disable",
	"disabled",
	"none",
	"0"
]);
const SESSION_ACTION_IDLE = "idle";
const SESSION_ACTION_MAX_AGE = "max-age";
let cachedChannelRuntime;
function getChannelRuntime() {
	cachedChannelRuntime ??= createPluginRuntime().channel;
	return cachedChannelRuntime;
}
function resolveSessionCommandUsage() {
	return "Usage: /session idle <duration|off> | /session max-age <duration|off> (example: /session idle 24h)";
}
function parseSessionDurationMs(raw) {
	const normalized = raw.trim().toLowerCase();
	if (!normalized) throw new Error("missing duration");
	if (SESSION_DURATION_OFF_VALUES.has(normalized)) return 0;
	if (/^\d+(?:\.\d+)?$/.test(normalized)) {
		const hours = Number(normalized);
		if (!Number.isFinite(hours) || hours < 0) throw new Error("invalid duration");
		return Math.round(hours * 60 * 60 * 1e3);
	}
	return parseDurationMs(normalized, { defaultUnit: "h" });
}
function formatSessionExpiry(expiresAt) {
	return new Date(expiresAt).toISOString();
}
function resolveSessionBindingDurationMs(binding, key, fallbackMs) {
	const raw = binding.metadata?.[key];
	if (typeof raw !== "number" || !Number.isFinite(raw)) return fallbackMs;
	return Math.max(0, Math.floor(raw));
}
function resolveSessionBindingLastActivityAt(binding) {
	const raw = binding.metadata?.lastActivityAt;
	if (typeof raw !== "number" || !Number.isFinite(raw)) return binding.boundAt;
	return Math.max(Math.floor(raw), binding.boundAt);
}
function resolveSessionBindingBoundBy(binding) {
	const raw = binding.metadata?.boundBy;
	return typeof raw === "string" ? raw.trim() : "";
}
function isSessionBindingRecord(binding) {
	return "bindingId" in binding;
}
function resolveUpdatedLifecycleDurationMs(binding, key) {
	if (!isSessionBindingRecord(binding)) {
		const raw = binding[key];
		if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
	}
	if (!isSessionBindingRecord(binding)) return;
	const raw = binding.metadata?.[key];
	if (typeof raw !== "number" || !Number.isFinite(raw)) return;
	return Math.max(0, Math.floor(raw));
}
function toUpdatedLifecycleBinding(binding) {
	const lastActivityAt = isSessionBindingRecord(binding) ? resolveSessionBindingLastActivityAt(binding) : Math.max(Math.floor(binding.lastActivityAt), binding.boundAt);
	return {
		boundAt: binding.boundAt,
		lastActivityAt,
		idleTimeoutMs: resolveUpdatedLifecycleDurationMs(binding, "idleTimeoutMs"),
		maxAgeMs: resolveUpdatedLifecycleDurationMs(binding, "maxAgeMs")
	};
}
function resolveUpdatedBindingExpiry(params) {
	const expiries = params.bindings.map((binding) => {
		if (params.action === SESSION_ACTION_IDLE) {
			const idleTimeoutMs = typeof binding.idleTimeoutMs === "number" && Number.isFinite(binding.idleTimeoutMs) ? Math.max(0, Math.floor(binding.idleTimeoutMs)) : 0;
			if (idleTimeoutMs <= 0) return;
			return Math.max(binding.lastActivityAt, binding.boundAt) + idleTimeoutMs;
		}
		const maxAgeMs = typeof binding.maxAgeMs === "number" && Number.isFinite(binding.maxAgeMs) ? Math.max(0, Math.floor(binding.maxAgeMs)) : 0;
		if (maxAgeMs <= 0) return;
		return binding.boundAt + maxAgeMs;
	}).filter((expiresAt) => typeof expiresAt === "number");
	if (expiries.length === 0) return;
	return Math.min(...expiries);
}
const handleActivationCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const activationCommand = parseActivationCommand(params.command.commandBodyNormalized);
	if (!activationCommand.hasCommand) return null;
	if (!params.isGroup) return {
		shouldContinue: false,
		reply: { text: "⚙️ Group activation only applies to group chats." }
	};
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /activation from unauthorized sender in group: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	if (!activationCommand.mode) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /activation mention|always" }
	};
	if (params.sessionEntry && params.sessionStore && params.sessionKey) {
		params.sessionEntry.groupActivation = activationCommand.mode;
		params.sessionEntry.groupActivationNeedsSystemIntro = true;
		await persistSessionEntry(params);
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Group activation set to ${activationCommand.mode}.` }
	};
};
const handleSendPolicyCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const sendPolicyCommand = parseSendPolicyCommand(params.command.commandBodyNormalized);
	if (!sendPolicyCommand.hasCommand) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /send from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	if (!sendPolicyCommand.mode) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /send on|off|inherit" }
	};
	if (params.sessionEntry && params.sessionStore && params.sessionKey) {
		if (sendPolicyCommand.mode === "inherit") delete params.sessionEntry.sendPolicy;
		else params.sessionEntry.sendPolicy = sendPolicyCommand.mode;
		await persistSessionEntry(params);
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Send policy set to ${sendPolicyCommand.mode === "inherit" ? "inherit" : sendPolicyCommand.mode === "allow" ? "on" : "off"}.` }
	};
};
const handleUsageCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/usage" && !normalized.startsWith("/usage ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /usage from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const rawArgs = normalized === "/usage" ? "" : normalized.slice(6).trim();
	const requested = rawArgs ? normalizeUsageDisplay(rawArgs) : void 0;
	if (rawArgs.toLowerCase().startsWith("cost")) {
		const sessionSummary = await loadSessionCostSummary({
			sessionId: params.sessionEntry?.sessionId,
			sessionEntry: params.sessionEntry,
			sessionFile: params.sessionEntry?.sessionFile,
			config: params.cfg,
			agentId: params.agentId
		});
		const summary = await loadCostUsageSummary({
			days: 30,
			config: params.cfg
		});
		const sessionCost = formatUsd(sessionSummary?.totalCost);
		const sessionTokens = sessionSummary?.totalTokens ? formatTokenCount$1(sessionSummary.totalTokens) : void 0;
		const sessionSuffix = (sessionSummary?.missingCostEntries ?? 0) > 0 ? " (partial)" : "";
		const sessionLine = sessionCost || sessionTokens ? `Session ${sessionCost ?? "n/a"}${sessionSuffix}${sessionTokens ? ` · ${sessionTokens} tokens` : ""}` : "Session n/a";
		const todayKey = (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA");
		const todayEntry = summary.daily.find((entry) => entry.date === todayKey);
		const todayCost = formatUsd(todayEntry?.totalCost);
		const todaySuffix = (todayEntry?.missingCostEntries ?? 0) > 0 ? " (partial)" : "";
		const todayLine = `Today ${todayCost ?? "n/a"}${todaySuffix}`;
		const last30Cost = formatUsd(summary.totals.totalCost);
		const last30Suffix = summary.totals.missingCostEntries > 0 ? " (partial)" : "";
		return {
			shouldContinue: false,
			reply: { text: `💸 Usage cost\n${sessionLine}\n${todayLine}\n${`Last 30d ${last30Cost ?? "n/a"}${last30Suffix}`}` }
		};
	}
	if (rawArgs && !requested) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /usage off|tokens|full|cost" }
	};
	const current = resolveResponseUsageMode(params.sessionEntry?.responseUsage ?? (params.sessionKey ? params.sessionStore?.[params.sessionKey]?.responseUsage : void 0));
	const next = requested ?? (current === "off" ? "tokens" : current === "tokens" ? "full" : "off");
	if (params.sessionEntry && params.sessionStore && params.sessionKey) {
		if (next === "off") delete params.sessionEntry.responseUsage;
		else params.sessionEntry.responseUsage = next;
		await persistSessionEntry(params);
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Usage footer: ${next}.` }
	};
};
const handleFastCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (normalized !== "/fast" && !normalized.startsWith("/fast ")) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /fast from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const rawMode = (normalized === "/fast" ? "" : normalized.slice(5).trim()).toLowerCase();
	if (!rawMode || rawMode === "status") {
		const state = resolveFastModeState({
			cfg: params.cfg,
			provider: params.provider,
			model: params.model,
			agentId: params.agentId,
			sessionEntry: params.sessionEntry
		});
		const suffix = state.source === "agent" ? " (agent)" : state.source === "config" ? " (config)" : state.source === "default" ? " (default)" : "";
		return {
			shouldContinue: false,
			reply: { text: `⚙️ Current fast mode: ${state.enabled ? "on" : "off"}${suffix}.` }
		};
	}
	const nextMode = normalizeFastMode(rawMode);
	if (nextMode === void 0) return {
		shouldContinue: false,
		reply: { text: "⚙️ Usage: /fast status|on|off" }
	};
	if (params.sessionEntry && params.sessionStore && params.sessionKey) {
		params.sessionEntry.fastMode = nextMode;
		await persistSessionEntry(params);
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Fast mode ${nextMode ? "enabled" : "disabled"}.` }
	};
};
const handleSessionCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	if (!/^\/session(?:\s|$)/.test(normalized)) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /session from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const tokens = normalized.slice(8).trim().split(/\s+/).filter(Boolean);
	const action = tokens[0]?.toLowerCase();
	if (action !== SESSION_ACTION_IDLE && action !== SESSION_ACTION_MAX_AGE) return {
		shouldContinue: false,
		reply: { text: resolveSessionCommandUsage() }
	};
	const onDiscord = isDiscordSurface(params);
	const onMatrix = isMatrixSurface(params);
	const onTelegram = isTelegramSurface(params);
	if (!onDiscord && !onMatrix && !onTelegram) return {
		shouldContinue: false,
		reply: { text: "⚠️ /session idle and /session max-age are currently available for Discord, Matrix, and Telegram bound sessions." }
	};
	const accountId = resolveChannelAccountId(params);
	const sessionBindingService = getSessionBindingService();
	const threadId = params.ctx.MessageThreadId != null ? String(params.ctx.MessageThreadId).trim() : "";
	const matrixConversationId = onMatrix ? resolveMatrixConversationId({
		ctx: {
			MessageThreadId: params.ctx.MessageThreadId,
			OriginatingTo: params.ctx.OriginatingTo,
			To: params.ctx.To
		},
		command: { to: params.command.to }
	}) : void 0;
	const matrixParentConversationId = onMatrix ? resolveMatrixParentConversationId({
		ctx: {
			MessageThreadId: params.ctx.MessageThreadId,
			OriginatingTo: params.ctx.OriginatingTo,
			To: params.ctx.To
		},
		command: { to: params.command.to }
	}) : void 0;
	const telegramConversationId = onTelegram ? resolveTelegramConversationId(params) : void 0;
	const channelRuntime = getChannelRuntime();
	const discordManager = onDiscord ? channelRuntime.discord.threadBindings.getManager(accountId) : null;
	if (onDiscord && !discordManager) return {
		shouldContinue: false,
		reply: { text: "⚠️ Discord thread bindings are unavailable for this account." }
	};
	const discordBinding = onDiscord && threadId ? discordManager?.getByThreadId(threadId) : void 0;
	const telegramBinding = onTelegram && telegramConversationId ? sessionBindingService.resolveByConversation({
		channel: "telegram",
		accountId,
		conversationId: telegramConversationId
	}) : null;
	const matrixBinding = onMatrix && matrixConversationId ? sessionBindingService.resolveByConversation({
		channel: "matrix",
		accountId,
		conversationId: matrixConversationId,
		...matrixParentConversationId && matrixParentConversationId !== matrixConversationId ? { parentConversationId: matrixParentConversationId } : {}
	}) : null;
	if (onDiscord && !discordBinding) {
		if (onDiscord && !threadId) return {
			shouldContinue: false,
			reply: { text: "⚠️ /session idle and /session max-age must be run inside a focused Discord thread." }
		};
		return {
			shouldContinue: false,
			reply: { text: "ℹ️ This thread is not currently focused." }
		};
	}
	if (onMatrix && !matrixBinding) {
		if (!threadId) return {
			shouldContinue: false,
			reply: { text: "⚠️ /session idle and /session max-age must be run inside a focused Matrix thread." }
		};
		return {
			shouldContinue: false,
			reply: { text: "ℹ️ This thread is not currently focused." }
		};
	}
	if (onTelegram && !telegramBinding) {
		if (!telegramConversationId) return {
			shouldContinue: false,
			reply: { text: "⚠️ /session idle and /session max-age on Telegram require a topic context in groups, or a direct-message conversation." }
		};
		return {
			shouldContinue: false,
			reply: { text: "ℹ️ This conversation is not currently focused." }
		};
	}
	const idleTimeoutMs = onDiscord ? channelRuntime.discord.threadBindings.resolveIdleTimeoutMs({
		record: discordBinding,
		defaultIdleTimeoutMs: discordManager.getIdleTimeoutMs()
	}) : resolveSessionBindingDurationMs(onMatrix ? matrixBinding : telegramBinding, "idleTimeoutMs", 1440 * 60 * 1e3);
	const idleExpiresAt = onDiscord ? channelRuntime.discord.threadBindings.resolveInactivityExpiresAt({
		record: discordBinding,
		defaultIdleTimeoutMs: discordManager.getIdleTimeoutMs()
	}) : idleTimeoutMs > 0 ? resolveSessionBindingLastActivityAt(onMatrix ? matrixBinding : telegramBinding) + idleTimeoutMs : void 0;
	const maxAgeMs = onDiscord ? channelRuntime.discord.threadBindings.resolveMaxAgeMs({
		record: discordBinding,
		defaultMaxAgeMs: discordManager.getMaxAgeMs()
	}) : resolveSessionBindingDurationMs(onMatrix ? matrixBinding : telegramBinding, "maxAgeMs", 0);
	const maxAgeExpiresAt = onDiscord ? channelRuntime.discord.threadBindings.resolveMaxAgeExpiresAt({
		record: discordBinding,
		defaultMaxAgeMs: discordManager.getMaxAgeMs()
	}) : maxAgeMs > 0 ? (onMatrix ? matrixBinding : telegramBinding).boundAt + maxAgeMs : void 0;
	const durationArgRaw = tokens.slice(1).join("");
	if (!durationArgRaw) {
		if (action === SESSION_ACTION_IDLE) {
			if (typeof idleExpiresAt === "number" && Number.isFinite(idleExpiresAt) && idleExpiresAt > Date.now()) return {
				shouldContinue: false,
				reply: { text: `ℹ️ Idle timeout active (${formatThreadBindingDurationLabel(idleTimeoutMs)}, next auto-unfocus at ${formatSessionExpiry(idleExpiresAt)}).` }
			};
			return {
				shouldContinue: false,
				reply: { text: "ℹ️ Idle timeout is currently disabled for this focused session." }
			};
		}
		if (typeof maxAgeExpiresAt === "number" && Number.isFinite(maxAgeExpiresAt) && maxAgeExpiresAt > Date.now()) return {
			shouldContinue: false,
			reply: { text: `ℹ️ Max age active (${formatThreadBindingDurationLabel(maxAgeMs)}, hard auto-unfocus at ${formatSessionExpiry(maxAgeExpiresAt)}).` }
		};
		return {
			shouldContinue: false,
			reply: { text: "ℹ️ Max age is currently disabled for this focused session." }
		};
	}
	const senderId = params.command.senderId?.trim() || "";
	const boundBy = onDiscord ? discordBinding.boundBy : resolveSessionBindingBoundBy(onMatrix ? matrixBinding : telegramBinding);
	if (boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return {
		shouldContinue: false,
		reply: { text: onDiscord ? `⚠️ Only ${boundBy} can update session lifecycle settings for this thread.` : onMatrix ? `⚠️ Only ${boundBy} can update session lifecycle settings for this thread.` : `⚠️ Only ${boundBy} can update session lifecycle settings for this conversation.` }
	};
	let durationMs;
	try {
		durationMs = parseSessionDurationMs(durationArgRaw);
	} catch {
		return {
			shouldContinue: false,
			reply: { text: resolveSessionCommandUsage() }
		};
	}
	const updatedBindings = (() => {
		if (onDiscord) return action === SESSION_ACTION_IDLE ? channelRuntime.discord.threadBindings.setIdleTimeoutBySessionKey({
			targetSessionKey: discordBinding.targetSessionKey,
			accountId,
			idleTimeoutMs: durationMs
		}) : channelRuntime.discord.threadBindings.setMaxAgeBySessionKey({
			targetSessionKey: discordBinding.targetSessionKey,
			accountId,
			maxAgeMs: durationMs
		});
		if (onMatrix) return action === SESSION_ACTION_IDLE ? channelRuntime.matrix.threadBindings.setIdleTimeoutBySessionKey({
			targetSessionKey: matrixBinding.targetSessionKey,
			accountId,
			idleTimeoutMs: durationMs
		}) : channelRuntime.matrix.threadBindings.setMaxAgeBySessionKey({
			targetSessionKey: matrixBinding.targetSessionKey,
			accountId,
			maxAgeMs: durationMs
		});
		return action === SESSION_ACTION_IDLE ? channelRuntime.telegram.threadBindings.setIdleTimeoutBySessionKey({
			targetSessionKey: telegramBinding.targetSessionKey,
			accountId,
			idleTimeoutMs: durationMs
		}) : channelRuntime.telegram.threadBindings.setMaxAgeBySessionKey({
			targetSessionKey: telegramBinding.targetSessionKey,
			accountId,
			maxAgeMs: durationMs
		});
	})();
	if (updatedBindings.length === 0) return {
		shouldContinue: false,
		reply: { text: action === SESSION_ACTION_IDLE ? "⚠️ Failed to update idle timeout for the current binding." : "⚠️ Failed to update max age for the current binding." }
	};
	if (durationMs <= 0) return {
		shouldContinue: false,
		reply: { text: action === SESSION_ACTION_IDLE ? `✅ Idle timeout disabled for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"}.` : `✅ Max age disabled for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"}.` }
	};
	const nextExpiry = resolveUpdatedBindingExpiry({
		action,
		bindings: updatedBindings.map((binding) => toUpdatedLifecycleBinding(binding))
	});
	const expiryLabel = typeof nextExpiry === "number" && Number.isFinite(nextExpiry) ? formatSessionExpiry(nextExpiry) : "n/a";
	return {
		shouldContinue: false,
		reply: { text: action === SESSION_ACTION_IDLE ? `✅ Idle timeout set to ${formatThreadBindingDurationLabel(durationMs)} for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"} (next auto-unfocus at ${expiryLabel}).` : `✅ Max age set to ${formatThreadBindingDurationLabel(durationMs)} for ${updatedBindings.length} binding${updatedBindings.length === 1 ? "" : "s"} (hard auto-unfocus at ${expiryLabel}).` }
	};
};
const handleRestartCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	if (params.command.commandBodyNormalized !== "/restart") return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring /restart from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	if (!isRestartEnabled(params.cfg)) return {
		shouldContinue: false,
		reply: { text: "⚠️ /restart is disabled (commands.restart=false)." }
	};
	if (process.listenerCount("SIGUSR1") > 0) {
		scheduleGatewaySigusr1Restart({ reason: "/restart" });
		return {
			shouldContinue: false,
			reply: { text: "⚙️ Restarting OpenClaw in-process (SIGUSR1); back in a few seconds." }
		};
	}
	const restartMethod = triggerOpenClawRestart();
	if (!restartMethod.ok) {
		const detail = restartMethod.detail ? ` Details: ${restartMethod.detail}` : "";
		return {
			shouldContinue: false,
			reply: { text: `⚠️ Restart failed (${restartMethod.method}).${detail}` }
		};
	}
	return {
		shouldContinue: false,
		reply: { text: `⚙️ Restarting OpenClaw via ${restartMethod.method}; give me a few seconds to come back online.` }
	};
};
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-agents.ts
function formatConversationBindingText(params) {
	if (params.channel === "discord") return `thread:${params.conversationId}`;
	if (params.channel === "telegram") return `conversation:${params.conversationId}`;
	return `binding:${params.conversationId}`;
}
function handleSubagentsAgentsAction(ctx) {
	const { params, requesterKey, runs } = ctx;
	const channel = resolveCommandSurfaceChannel(params);
	const accountId = resolveChannelAccountId(params);
	const bindingService = getSessionBindingService();
	const bindingsBySession = /* @__PURE__ */ new Map();
	const resolveSessionBindings = (sessionKey) => {
		const cached = bindingsBySession.get(sessionKey);
		if (cached) return cached;
		const resolved = bindingService.listBySession(sessionKey).filter((entry) => entry.status === "active" && entry.conversation.channel === channel && entry.conversation.accountId === accountId);
		bindingsBySession.set(sessionKey, resolved);
		return resolved;
	};
	const visibleRuns = sortSubagentRuns(runs).filter((entry) => {
		if (!entry.endedAt) return true;
		return resolveSessionBindings(entry.childSessionKey).length > 0;
	});
	const lines = ["agents:", "-----"];
	if (visibleRuns.length === 0) lines.push("(none)");
	else {
		let index = 1;
		for (const entry of visibleRuns) {
			const binding = resolveSessionBindings(entry.childSessionKey)[0];
			const bindingText = binding ? formatConversationBindingText({
				channel,
				conversationId: binding.conversation.conversationId
			}) : channel === "discord" || channel === "telegram" ? "unbound" : "bindings available on discord/telegram";
			lines.push(`${index}. ${formatRunLabel(entry)} (${bindingText})`);
			index += 1;
		}
	}
	const requesterBindings = resolveSessionBindings(requesterKey).filter((entry) => entry.targetKind === "session");
	if (requesterBindings.length > 0) {
		lines.push("", "acp/session bindings:", "-----");
		for (const binding of requesterBindings) {
			const label = typeof binding.metadata?.label === "string" && binding.metadata.label.trim() ? binding.metadata.label.trim() : binding.targetSessionKey;
			lines.push(`- ${label} (${formatConversationBindingText({
				channel,
				conversationId: binding.conversation.conversationId
			})}, session:${binding.targetSessionKey})`);
		}
	}
	return stopWithText$1(lines.join("\n"));
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-focus.ts
function resolveFocusBindingContext(params) {
	if (isDiscordSurface(params)) {
		const currentThreadId = params.ctx.MessageThreadId != null ? String(params.ctx.MessageThreadId).trim() : "";
		const parentChannelId = currentThreadId ? void 0 : resolveDiscordChannelIdForFocus(params);
		const conversationId = currentThreadId || parentChannelId;
		if (!conversationId) return null;
		return {
			channel: "discord",
			accountId: resolveChannelAccountId(params),
			conversationId,
			placement: currentThreadId ? "current" : "child",
			labelNoun: "thread"
		};
	}
	if (isTelegramSurface(params)) {
		const conversationId = resolveTelegramConversationId(params);
		if (!conversationId) return null;
		return {
			channel: "telegram",
			accountId: resolveChannelAccountId(params),
			conversationId,
			placement: "current",
			labelNoun: "conversation"
		};
	}
	if (isMatrixSurface(params)) {
		const conversationId = resolveMatrixConversationId({
			ctx: {
				MessageThreadId: params.ctx.MessageThreadId,
				OriginatingTo: params.ctx.OriginatingTo,
				To: params.ctx.To
			},
			command: { to: params.command.to }
		});
		if (!conversationId) return null;
		const parentConversationId = resolveMatrixParentConversationId({
			ctx: {
				MessageThreadId: params.ctx.MessageThreadId,
				OriginatingTo: params.ctx.OriginatingTo,
				To: params.ctx.To
			},
			command: { to: params.command.to }
		});
		const currentThreadId = params.ctx.MessageThreadId != null ? String(params.ctx.MessageThreadId).trim() : "";
		return {
			channel: "matrix",
			accountId: resolveChannelAccountId(params),
			conversationId,
			...parentConversationId ? { parentConversationId } : {},
			placement: currentThreadId ? "current" : "child",
			labelNoun: "thread"
		};
	}
	return null;
}
async function handleSubagentsFocusAction(ctx) {
	const { params, runs, restTokens } = ctx;
	const channel = resolveCommandSurfaceChannel(params);
	if (channel !== "discord" && channel !== "matrix" && channel !== "telegram") return stopWithText$1("⚠️ /focus is only available on Discord, Matrix, and Telegram.");
	const token = restTokens.join(" ").trim();
	if (!token) return stopWithText$1("Usage: /focus <subagent-label|session-key|session-id|session-label>");
	const accountId = resolveChannelAccountId(params);
	const bindingService = getSessionBindingService();
	const capabilities = bindingService.getCapabilities({
		channel,
		accountId
	});
	if (!capabilities.adapterAvailable || !capabilities.bindSupported) return stopWithText$1(`⚠️ ${channel === "discord" ? "Discord thread" : channel === "matrix" ? "Matrix thread" : "Telegram conversation"} bindings are unavailable for this account.`);
	const focusTarget = await resolveFocusTargetSession({
		runs,
		token
	});
	if (!focusTarget) return stopWithText$1(`⚠️ Unable to resolve focus target: ${token}`);
	const bindingContext = resolveFocusBindingContext(params);
	if (!bindingContext) {
		if (channel === "telegram") return stopWithText$1("⚠️ /focus on Telegram requires a topic context in groups, or a direct-message conversation.");
		if (channel === "matrix") return stopWithText$1("⚠️ Could not resolve a Matrix room for /focus.");
		return stopWithText$1("⚠️ Could not resolve a Discord channel for /focus.");
	}
	if (channel === "matrix") {
		const spawnPolicy = resolveThreadBindingSpawnPolicy({
			cfg: params.cfg,
			channel,
			accountId: bindingContext.accountId,
			kind: "subagent"
		});
		if (!spawnPolicy.enabled) return stopWithText$1(`⚠️ ${formatThreadBindingDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "subagent"
		})}`);
		if (bindingContext.placement === "child" && !spawnPolicy.spawnEnabled) return stopWithText$1(`⚠️ ${formatThreadBindingSpawnDisabledError({
			channel: spawnPolicy.channel,
			accountId: spawnPolicy.accountId,
			kind: "subagent"
		})}`);
	}
	const senderId = params.command.senderId?.trim() || "";
	const existingBinding = bindingService.resolveByConversation({
		channel: bindingContext.channel,
		accountId: bindingContext.accountId,
		conversationId: bindingContext.conversationId,
		...bindingContext.parentConversationId && bindingContext.parentConversationId !== bindingContext.conversationId ? { parentConversationId: bindingContext.parentConversationId } : {}
	});
	const boundBy = typeof existingBinding?.metadata?.boundBy === "string" ? existingBinding.metadata.boundBy.trim() : "";
	if (existingBinding && boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return stopWithText$1(`⚠️ Only ${boundBy} can refocus this ${bindingContext.labelNoun}.`);
	const label = focusTarget.label || token;
	const acpMeta = focusTarget.targetKind === "acp" ? readAcpSessionEntry({
		cfg: params.cfg,
		sessionKey: focusTarget.targetSessionKey
	})?.acp : void 0;
	if (!capabilities.placements.includes(bindingContext.placement)) return stopWithText$1(`⚠️ ${channel} bindings are unavailable for this account.`);
	let binding;
	try {
		binding = await bindingService.bind({
			targetSessionKey: focusTarget.targetSessionKey,
			targetKind: focusTarget.targetKind === "acp" ? "session" : "subagent",
			conversation: {
				channel: bindingContext.channel,
				accountId: bindingContext.accountId,
				conversationId: bindingContext.conversationId,
				...bindingContext.parentConversationId && bindingContext.parentConversationId !== bindingContext.conversationId ? { parentConversationId: bindingContext.parentConversationId } : {}
			},
			placement: bindingContext.placement,
			metadata: {
				threadName: resolveThreadBindingThreadName({
					agentId: focusTarget.agentId,
					label
				}),
				agentId: focusTarget.agentId,
				label,
				boundBy: senderId || "unknown",
				introText: resolveThreadBindingIntroText({
					agentId: focusTarget.agentId,
					label,
					idleTimeoutMs: resolveThreadBindingIdleTimeoutMsForChannel({
						cfg: params.cfg,
						channel: bindingContext.channel,
						accountId
					}),
					maxAgeMs: resolveThreadBindingMaxAgeMsForChannel({
						cfg: params.cfg,
						channel: bindingContext.channel,
						accountId
					}),
					sessionCwd: focusTarget.targetKind === "acp" ? resolveAcpSessionCwd(acpMeta) : void 0,
					sessionDetails: focusTarget.targetKind === "acp" ? resolveAcpThreadSessionDetailLines({
						sessionKey: focusTarget.targetSessionKey,
						meta: acpMeta
					}) : []
				})
			}
		});
	} catch {
		return stopWithText$1(`⚠️ Failed to bind this ${bindingContext.labelNoun} to the target session.`);
	}
	return stopWithText$1(`✅ ${bindingContext.placement === "child" ? `created thread ${binding.conversation.conversationId} and bound it to ${binding.targetSessionKey}` : `bound this ${bindingContext.labelNoun} to ${binding.targetSessionKey}`} (${focusTarget.targetKind}).`);
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-help.ts
function handleSubagentsHelpAction() {
	return stopWithText$1(buildSubagentsHelp());
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-info.ts
function handleSubagentsInfoAction(ctx) {
	const { params, runs, restTokens } = ctx;
	const target = restTokens[0];
	if (!target) return stopWithText$1("ℹ️ Usage: /subagents info <id|#>");
	const targetResolution = resolveSubagentEntryForToken(runs, target);
	if ("reply" in targetResolution) return targetResolution.reply;
	const run = targetResolution.entry;
	const { entry: sessionEntry } = loadSubagentSessionEntry(params, run.childSessionKey, {
		loadSessionStore,
		resolveStorePath
	});
	const runtime = run.startedAt && Number.isFinite(run.startedAt) ? formatDurationCompact((run.endedAt ?? Date.now()) - run.startedAt) ?? "n/a" : "n/a";
	const outcome = run.outcome ? `${run.outcome.status}${run.outcome.error ? ` (${run.outcome.error})` : ""}` : "n/a";
	return stopWithText$1([
		"ℹ️ Subagent info",
		`Status: ${resolveDisplayStatus(run, { pendingDescendants: countPendingDescendantRuns(run.childSessionKey) })}`,
		`Label: ${formatRunLabel(run)}`,
		`Task: ${run.task}`,
		`Run: ${run.runId}`,
		`Session: ${run.childSessionKey}`,
		`SessionId: ${sessionEntry?.sessionId ?? "n/a"}`,
		`Transcript: ${sessionEntry?.sessionFile ?? "n/a"}`,
		`Runtime: ${runtime}`,
		`Created: ${formatTimestampWithAge(run.createdAt)}`,
		`Started: ${formatTimestampWithAge(run.startedAt)}`,
		`Ended: ${formatTimestampWithAge(run.endedAt)}`,
		`Cleanup: ${run.cleanup}`,
		run.archiveAtMs ? `Archive: ${formatTimestampWithAge(run.archiveAtMs)}` : void 0,
		run.cleanupHandled ? "Cleanup handled: yes" : void 0,
		`Outcome: ${outcome}`
	].filter(Boolean).join("\n"));
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-kill.ts
async function handleSubagentsKillAction(ctx) {
	const { params, handledPrefix, requesterKey, runs, restTokens } = ctx;
	const target = restTokens[0];
	if (!target) return stopWithText$1(handledPrefix === "/subagents" ? "Usage: /subagents kill <id|#|all>" : "Usage: /kill <id|#|all>");
	if (target === "all" || target === "*") {
		const controller = resolveCommandSubagentController(params, requesterKey);
		const result = await killAllControlledSubagentRuns({
			cfg: params.cfg,
			controller,
			runs
		});
		if (result.status === "forbidden") return stopWithText$1(`⚠️ ${result.error}`);
		if (result.killed > 0) return { shouldContinue: false };
		return { shouldContinue: false };
	}
	const targetResolution = resolveSubagentEntryForToken(runs, target);
	if ("reply" in targetResolution) return targetResolution.reply;
	if (targetResolution.entry.endedAt) return stopWithText$1(`${formatRunLabel(targetResolution.entry)} is already finished.`);
	const controller = resolveCommandSubagentController(params, requesterKey);
	const result = await killControlledSubagentRun({
		cfg: params.cfg,
		controller,
		entry: targetResolution.entry
	});
	if (result.status === "forbidden") return stopWithText$1(`⚠️ ${result.error}`);
	if (result.status === "done") return stopWithText$1(result.text);
	return { shouldContinue: false };
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-list.ts
function handleSubagentsListAction(ctx) {
	const { params, runs } = ctx;
	const list = buildSubagentList({
		cfg: params.cfg,
		runs,
		recentMinutes: 30,
		taskMaxChars: 110
	});
	const lines = ["active subagents:", "-----"];
	if (list.active.length === 0) lines.push("(none)");
	else lines.push(list.active.map((entry) => entry.line).join("\n"));
	lines.push("", `recent subagents (last 30m):`, "-----");
	if (list.recent.length === 0) lines.push("(none)");
	else lines.push(list.recent.map((entry) => entry.line).join("\n"));
	return stopWithText$1(lines.join("\n"));
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-log.ts
async function handleSubagentsLogAction(ctx) {
	const { runs, restTokens } = ctx;
	const target = restTokens[0];
	if (!target) return stopWithText$1("📜 Usage: /subagents log <id|#> [limit]");
	const includeTools = restTokens.some((token) => token.toLowerCase() === "tools");
	const limitToken = restTokens.find((token) => /^\d+$/.test(token));
	const limit = limitToken ? Math.min(200, Math.max(1, Number.parseInt(limitToken, 10))) : 20;
	const targetResolution = resolveSubagentEntryForToken(runs, target);
	if ("reply" in targetResolution) return targetResolution.reply;
	const history = await callGateway({
		method: "chat.history",
		params: {
			sessionKey: targetResolution.entry.childSessionKey,
			limit
		}
	});
	const rawMessages = Array.isArray(history?.messages) ? history.messages : [];
	const lines = formatLogLines(includeTools ? rawMessages : stripToolMessages(rawMessages));
	const header = `📜 Subagent log: ${formatRunLabel(targetResolution.entry)}`;
	if (lines.length === 0) return stopWithText$1(`${header}\n(no messages)`);
	return stopWithText$1([header, ...lines].join("\n"));
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-send.ts
async function handleSubagentsSendAction(ctx, steerRequested) {
	const { params, handledPrefix, runs, restTokens } = ctx;
	const target = restTokens[0];
	const message = restTokens.slice(1).join(" ").trim();
	if (!target || !message) return stopWithText$1(steerRequested ? handledPrefix === "/subagents" ? "Usage: /subagents steer <id|#> <message>" : `Usage: ${handledPrefix} <id|#> <message>` : "Usage: /subagents send <id|#> <message>");
	const targetResolution = resolveSubagentEntryForToken(runs, target);
	if ("reply" in targetResolution) return targetResolution.reply;
	if (steerRequested && targetResolution.entry.endedAt) return stopWithText$1(`${formatRunLabel(targetResolution.entry)} is already finished.`);
	const controller = resolveCommandSubagentController(params, ctx.requesterKey);
	if (steerRequested) {
		const result = await steerControlledSubagentRun({
			cfg: params.cfg,
			controller,
			entry: targetResolution.entry,
			message
		});
		if (result.status === "accepted") return stopWithText$1(`steered ${formatRunLabel(targetResolution.entry)} (run ${result.runId.slice(0, 8)}).`);
		if (result.status === "done" && result.text) return stopWithText$1(result.text);
		if (result.status === "error") return stopWithText$1(`send failed: ${result.error ?? "error"}`);
		return stopWithText$1(`⚠️ ${result.error ?? "send failed"}`);
	}
	const result = await sendControlledSubagentMessage({
		cfg: params.cfg,
		controller,
		entry: targetResolution.entry,
		message
	});
	if (result.status === "timeout") return stopWithText$1(`⏳ Subagent still running (run ${result.runId.slice(0, 8)}).`);
	if (result.status === "error") return stopWithText$1(`⚠️ Subagent error: ${result.error} (run ${result.runId.slice(0, 8)}).`);
	if (result.status === "forbidden") return stopWithText$1(`⚠️ ${result.error ?? "send failed"}`);
	return stopWithText$1(result.replyText ?? `✅ Sent to ${formatRunLabel(targetResolution.entry)} (run ${result.runId.slice(0, 8)}).`);
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-spawn.ts
async function handleSubagentsSpawnAction(ctx) {
	const { params, requesterKey, restTokens } = ctx;
	const agentId = restTokens[0];
	const taskParts = [];
	let model;
	let thinking;
	for (let i = 1; i < restTokens.length; i++) if (restTokens[i] === "--model" && i + 1 < restTokens.length) {
		i += 1;
		model = restTokens[i];
	} else if (restTokens[i] === "--thinking" && i + 1 < restTokens.length) {
		i += 1;
		thinking = restTokens[i];
	} else taskParts.push(restTokens[i]);
	const task = taskParts.join(" ").trim();
	if (!agentId || !task) return stopWithText$1("Usage: /subagents spawn <agentId> <task> [--model <model>] [--thinking <level>]");
	const commandTo = typeof params.command.to === "string" ? params.command.to.trim() : "";
	const originatingTo = typeof params.ctx.OriginatingTo === "string" ? params.ctx.OriginatingTo.trim() : "";
	const fallbackTo = typeof params.ctx.To === "string" ? params.ctx.To.trim() : "";
	const normalizedTo = originatingTo || commandTo || fallbackTo || void 0;
	const result = await spawnSubagentDirect({
		task,
		agentId,
		model,
		thinking,
		mode: "run",
		cleanup: "keep",
		expectsCompletionMessage: true
	}, {
		agentSessionKey: requesterKey,
		agentChannel: params.ctx.OriginatingChannel ?? params.command.channel,
		agentAccountId: params.ctx.AccountId,
		agentTo: normalizedTo,
		agentThreadId: params.ctx.MessageThreadId,
		agentGroupId: params.sessionEntry?.groupId ?? null,
		agentGroupChannel: params.sessionEntry?.groupChannel ?? null,
		agentGroupSpace: params.sessionEntry?.space ?? null
	});
	if (result.status === "accepted") return stopWithText$1(`Spawned subagent ${agentId} (session ${result.childSessionKey}, run ${result.runId?.slice(0, 8)}).`);
	return stopWithText$1(`Spawn failed: ${result.error ?? result.status}`);
}
//#endregion
//#region src/auto-reply/reply/commands-subagents/action-unfocus.ts
async function handleSubagentsUnfocusAction(ctx) {
	const { params } = ctx;
	const channel = resolveCommandSurfaceChannel(params);
	if (channel !== "discord" && channel !== "matrix" && channel !== "telegram") return stopWithText$1("⚠️ /unfocus is only available on Discord, Matrix, and Telegram.");
	const accountId = resolveChannelAccountId(params);
	const bindingService = getSessionBindingService();
	const conversationId = (() => {
		if (isDiscordSurface(params)) return (params.ctx.MessageThreadId != null ? String(params.ctx.MessageThreadId) : "").trim() || void 0;
		if (isTelegramSurface(params)) return resolveTelegramConversationId(params);
		if (isMatrixSurface(params)) return resolveMatrixConversationId({
			ctx: {
				MessageThreadId: params.ctx.MessageThreadId,
				OriginatingTo: params.ctx.OriginatingTo,
				To: params.ctx.To
			},
			command: { to: params.command.to }
		});
	})();
	const parentConversationId = (() => {
		if (!isMatrixSurface(params)) return;
		return resolveMatrixParentConversationId({
			ctx: {
				MessageThreadId: params.ctx.MessageThreadId,
				OriginatingTo: params.ctx.OriginatingTo,
				To: params.ctx.To
			},
			command: { to: params.command.to }
		});
	})();
	if (!conversationId) {
		if (channel === "discord") return stopWithText$1("⚠️ /unfocus must be run inside a Discord thread.");
		if (channel === "matrix") return stopWithText$1("⚠️ /unfocus must be run inside a Matrix thread.");
		return stopWithText$1("⚠️ /unfocus on Telegram requires a topic context in groups, or a direct-message conversation.");
	}
	const binding = bindingService.resolveByConversation({
		channel,
		accountId,
		conversationId,
		...parentConversationId && parentConversationId !== conversationId ? { parentConversationId } : {}
	});
	if (!binding) return stopWithText$1(channel === "discord" ? "ℹ️ This thread is not currently focused." : channel === "matrix" ? "ℹ️ This thread is not currently focused." : "ℹ️ This conversation is not currently focused.");
	const senderId = params.command.senderId?.trim() || "";
	const boundBy = typeof binding.metadata?.boundBy === "string" ? binding.metadata.boundBy.trim() : "";
	if (boundBy && boundBy !== "system" && senderId && senderId !== boundBy) return stopWithText$1(channel === "discord" ? `⚠️ Only ${boundBy} can unfocus this thread.` : channel === "matrix" ? `⚠️ Only ${boundBy} can unfocus this thread.` : `⚠️ Only ${boundBy} can unfocus this conversation.`);
	await bindingService.unbind({
		bindingId: binding.bindingId,
		reason: "manual"
	});
	return stopWithText$1(channel === "discord" || channel === "matrix" ? "✅ Thread unfocused." : "✅ Conversation unfocused.");
}
//#endregion
//#region src/auto-reply/reply/commands-subagents.ts
const handleSubagentsCommand = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const normalized = params.command.commandBodyNormalized;
	const handledPrefix = resolveHandledPrefix(normalized);
	if (!handledPrefix) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring ${handledPrefix} from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const restTokens = normalized.slice(handledPrefix.length).trim().split(/\s+/).filter(Boolean);
	const action = resolveSubagentsAction({
		handledPrefix,
		restTokens
	});
	if (!action) return handleSubagentsHelpAction();
	const requesterKey = action === "spawn" ? resolveRequesterSessionKey(params, { preferCommandTarget: true }) : resolveRequesterSessionKey(params);
	if (!requesterKey) return stopWithText$1("⚠️ Missing session key.");
	const ctx = {
		params,
		handledPrefix,
		requesterKey,
		runs: listSubagentRunsForController(requesterKey),
		restTokens
	};
	switch (action) {
		case "help": return handleSubagentsHelpAction();
		case "agents": return handleSubagentsAgentsAction(ctx);
		case "focus": return await handleSubagentsFocusAction(ctx);
		case "unfocus": return await handleSubagentsUnfocusAction(ctx);
		case "list": return handleSubagentsListAction(ctx);
		case "kill": return await handleSubagentsKillAction(ctx);
		case "info": return handleSubagentsInfoAction(ctx);
		case "log": return await handleSubagentsLogAction(ctx);
		case "send": return await handleSubagentsSendAction(ctx, false);
		case "steer": return await handleSubagentsSendAction(ctx, true);
		case "spawn": return await handleSubagentsSpawnAction(ctx);
		default: return handleSubagentsHelpAction();
	}
};
//#endregion
//#region src/auto-reply/reply/commands-tts.ts
function parseTtsCommand(normalized) {
	if (normalized === "/tts") return {
		action: "status",
		args: ""
	};
	if (!normalized.startsWith("/tts ")) return null;
	const rest = normalized.slice(5).trim();
	if (!rest) return {
		action: "status",
		args: ""
	};
	const [action, ...tail] = rest.split(/\s+/);
	return {
		action: action.toLowerCase(),
		args: tail.join(" ").trim()
	};
}
function ttsUsage() {
	return { text: "🔊 **TTS (Text-to-Speech) Help**\n\n**Commands:**\n• /tts on — Enable automatic TTS for replies\n• /tts off — Disable TTS\n• /tts status — Show current settings\n• /tts provider [name] — View/change provider\n• /tts limit [number] — View/change text limit\n• /tts summary [on|off] — View/change auto-summary\n• /tts audio <text> — Generate audio from text\n\n**Providers:**\n• microsoft — Microsoft Edge-backed speech (default fallback)\n• openai — High quality (requires API key)\n• elevenlabs — Premium voices (requires API key)\n\n**Text Limit (default: 1500, max: 4096):**\nWhen text exceeds the limit:\n• Summary ON: AI summarizes, then generates audio\n• Summary OFF: Truncates text, then generates audio\n\n**Examples:**\n/tts provider microsoft\n/tts limit 2000\n/tts audio Hello, this is a test!" };
}
const handleTtsCommands = async (params, allowTextCommands) => {
	if (!allowTextCommands) return null;
	const parsed = parseTtsCommand(params.command.commandBodyNormalized);
	if (!parsed) return null;
	if (!params.command.isAuthorizedSender) {
		logVerbose(`Ignoring TTS command from unauthorized sender: ${params.command.senderId || "<unknown>"}`);
		return { shouldContinue: false };
	}
	const config = resolveTtsConfig(params.cfg);
	const prefsPath = resolveTtsPrefsPath(config);
	const action = parsed.action;
	const args = parsed.args;
	if (action === "help") return {
		shouldContinue: false,
		reply: ttsUsage()
	};
	if (action === "on") {
		setTtsEnabled(prefsPath, true);
		return {
			shouldContinue: false,
			reply: { text: "🔊 TTS enabled." }
		};
	}
	if (action === "off") {
		setTtsEnabled(prefsPath, false);
		return {
			shouldContinue: false,
			reply: { text: "🔇 TTS disabled." }
		};
	}
	if (action === "audio") {
		if (!args.trim()) return {
			shouldContinue: false,
			reply: { text: "🎤 Generate audio from text.\n\nUsage: /tts audio <text>\nExample: /tts audio Hello, this is a test!" }
		};
		const start = Date.now();
		const result = await textToSpeech({
			text: args,
			cfg: params.cfg,
			channel: params.command.channel,
			prefsPath
		});
		if (result.success && result.audioPath) {
			setLastTtsAttempt({
				timestamp: Date.now(),
				success: true,
				textLength: args.length,
				summarized: false,
				provider: result.provider,
				latencyMs: result.latencyMs
			});
			return {
				shouldContinue: false,
				reply: {
					mediaUrl: result.audioPath,
					audioAsVoice: result.voiceCompatible === true
				}
			};
		}
		setLastTtsAttempt({
			timestamp: Date.now(),
			success: false,
			textLength: args.length,
			summarized: false,
			error: result.error,
			latencyMs: Date.now() - start
		});
		return {
			shouldContinue: false,
			reply: { text: `❌ Error generating audio: ${result.error ?? "unknown error"}` }
		};
	}
	if (action === "provider") {
		const currentProvider = getTtsProvider(config, prefsPath);
		if (!args.trim()) {
			const hasOpenAI = Boolean(resolveTtsApiKey(config, "openai"));
			const hasElevenLabs = Boolean(resolveTtsApiKey(config, "elevenlabs"));
			const hasMicrosoft = isTtsProviderConfigured(config, "microsoft", params.cfg);
			return {
				shouldContinue: false,
				reply: { text: `🎙️ TTS provider\nPrimary: ${currentProvider}\nOpenAI key: ${hasOpenAI ? "✅" : "❌"}\nElevenLabs key: ${hasElevenLabs ? "✅" : "❌"}\nMicrosoft enabled: ${hasMicrosoft ? "✅" : "❌"}\nUsage: /tts provider openai | elevenlabs | microsoft` }
			};
		}
		const requested = args.trim().toLowerCase();
		if (requested !== "edge" && !getSpeechProvider(requested, params.cfg)) return {
			shouldContinue: false,
			reply: ttsUsage()
		};
		const nextProvider = normalizeSpeechProviderId(requested) ?? requested;
		setTtsProvider(prefsPath, requested);
		return {
			shouldContinue: false,
			reply: { text: `✅ TTS provider set to ${nextProvider}.` }
		};
	}
	if (action === "limit") {
		if (!args.trim()) return {
			shouldContinue: false,
			reply: { text: `📏 TTS limit: ${getTtsMaxLength(prefsPath)} characters.\n\nText longer than this triggers summary (if enabled).\nRange: 100-4096 chars (Telegram max).\n\nTo change: /tts limit <number>\nExample: /tts limit 2000` }
		};
		const next = Number.parseInt(args.trim(), 10);
		if (!Number.isFinite(next) || next < 100 || next > 4096) return {
			shouldContinue: false,
			reply: { text: "❌ Limit must be between 100 and 4096 characters." }
		};
		setTtsMaxLength(prefsPath, next);
		return {
			shouldContinue: false,
			reply: { text: `✅ TTS limit set to ${next} characters.` }
		};
	}
	if (action === "summary") {
		if (!args.trim()) {
			const enabled = isSummarizationEnabled(prefsPath);
			const maxLen = getTtsMaxLength(prefsPath);
			return {
				shouldContinue: false,
				reply: { text: `📝 TTS auto-summary: ${enabled ? "on" : "off"}.\n\nWhen text exceeds ${maxLen} chars:\n• ON: summarizes text, then generates audio\n• OFF: truncates text, then generates audio\n\nTo change: /tts summary on | off` }
			};
		}
		const requested = args.trim().toLowerCase();
		if (requested !== "on" && requested !== "off") return {
			shouldContinue: false,
			reply: ttsUsage()
		};
		setSummarizationEnabled(prefsPath, requested === "on");
		return {
			shouldContinue: false,
			reply: { text: requested === "on" ? "✅ TTS auto-summary enabled." : "❌ TTS auto-summary disabled." }
		};
	}
	if (action === "status") {
		const enabled = isTtsEnabled(config, prefsPath);
		const provider = getTtsProvider(config, prefsPath);
		const hasKey = isTtsProviderConfigured(config, provider, params.cfg);
		const maxLength = getTtsMaxLength(prefsPath);
		const summarize = isSummarizationEnabled(prefsPath);
		const last = getLastTtsAttempt();
		const lines = [
			"📊 TTS status",
			`State: ${enabled ? "✅ enabled" : "❌ disabled"}`,
			`Provider: ${provider} (${hasKey ? "✅ configured" : "❌ not configured"})`,
			`Text limit: ${maxLength} chars`,
			`Auto-summary: ${summarize ? "on" : "off"}`
		];
		if (last) {
			const timeAgo = Math.round((Date.now() - last.timestamp) / 1e3);
			lines.push("");
			lines.push(`Last attempt (${timeAgo}s ago): ${last.success ? "✅" : "❌"}`);
			lines.push(`Text: ${last.textLength} chars${last.summarized ? " (summarized)" : ""}`);
			if (last.success) {
				lines.push(`Provider: ${last.provider ?? "unknown"}`);
				lines.push(`Latency: ${last.latencyMs ?? 0}ms`);
			} else if (last.error) lines.push(`Error: ${last.error}`);
		}
		return {
			shouldContinue: false,
			reply: { text: lines.join("\n") }
		};
	}
	return {
		shouldContinue: false,
		reply: ttsUsage()
	};
};
//#endregion
//#region src/auto-reply/reply/commands-handlers.runtime.ts
function loadCommandHandlers() {
	return [
		handlePluginCommand,
		handleBtwCommand,
		handleBashCommand,
		handleActivationCommand,
		handleSendPolicyCommand,
		handleFastCommand,
		handleUsageCommand,
		handleSessionCommand,
		handleRestartCommand,
		handleTtsCommands,
		handleHelpCommand,
		handleCommandsListCommand,
		handleStatusCommand,
		handleAllowlistCommand,
		handleApproveCommand,
		handleContextCommand,
		handleExportSessionCommand,
		handleWhoamiCommand,
		handleSubagentsCommand,
		handleAcpCommand,
		handleMcpCommand,
		handlePluginsCommand,
		handleConfigCommand,
		handleDebugCommand,
		handleModelsCommand,
		handleStopCommand,
		handleCompactCommand,
		handleAbortTrigger
	];
}
//#endregion
export { loadCommandHandlers };
