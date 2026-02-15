import { _ as expandHomePrefix, g as resolveStateDir, i as isNixMode, l as resolveGatewayLockDir, o as resolveConfigPath, r as STATE_DIR, t as CONFIG_PATH, u as resolveGatewayPort } from "./paths-DVBShlw6.js";
import { B as theme, H as getLogger, P as setVerbose, R as colorize, T as getActivePluginRegistry, U as getResolvedLoggerSettings, V as getChildLogger, _ as DEFAULT_CHAT_CHANNEL, a as setConsoleSubsystemFilter, h as CHANNEL_IDS, n as runtimeForLogger, o as setConsoleTimestampPrefix, t as createSubsystemLogger, u as defaultRuntime, z as isRich } from "./subsystem-QRNIBE7-.js";
import { C as shortenHomePath, D as truncateUtf16Safe, b as resolveUserPath, c as ensureDir, d as isPlainObject, r as clamp, t as CONFIG_DIR } from "./utils-CrauP1IK.js";
import { B as normalizeElevatedLevel, H as normalizeThinkLevel, I as formatThinkingLevels, K as supportsXHighThinking, L as formatXHighModelHint, U as normalizeUsageDisplay, V as normalizeReasoningLevel, W as normalizeVerboseLevel } from "./pi-embedded-helpers-BMGOFUCT.js";
import { $ as formatRestartSentinelMessage, $n as OPENAI_TTS_MODELS, $t as buildHistoryContextFromEntries, A as stripEnvelopeFromMessages, An as resolveMemoryBackendConfig, Ar as DEFAULT_INPUT_IMAGE_MAX_BYTES, At as getRemoteSkillEligibility, Bn as registerInternalHook, Bt as requestNodePairing, C as resolveSessionModelRef, Cr as parseVerboseOverride, D as readSessionMessages, Dn as onAgentEvent, Dr as DEFAULT_INPUT_FILE_MAX_BYTES, Dt as requestBodyErrorToText, E as capArrayByJsonBytes, En as getAgentRunContext, Et as readJsonBodyWithLimit, Fr as DEFAULT_INPUT_PDF_MIN_TEXT_CHARS, Ft as setSkillsRemoteRegistry, G as emitGatewayRestart, Gn as resolveTtsApiKey, Gt as buildSafeExternalPrompt, Hn as getTtsProvider, Ht as verifyNodeToken, I as resolveOutboundTarget, Ir as DEFAULT_INPUT_TIMEOUT_MS, It as approveNodePairing, J as scheduleGatewaySigusr1Restart, Jn as resolveTtsPrefsPath, Jt as isExternalHookSession, K as isGatewaySigusr1RestartExternallyAllowed, Kn as resolveTtsAutoMode, Kt as detectSuspiciousPatterns, L as resolveSessionDeliveryTarget, Ln as resolveUserTimezone, Lr as extractFileContentFromSource, Lt as listNodePairing, M as ensureOutboundSessionEntry, Mr as DEFAULT_INPUT_MAX_REDIRECTS, Mt as recordRemoteNodeInfo, N as resolveOutboundSessionRoute, Nr as DEFAULT_INPUT_PDF_MAX_PAGES, Nt as refreshRemoteBinsForConnectedNodes, O as readSessionPreviewItemsFromTranscript, On as registerAgentRunContext, Or as DEFAULT_INPUT_FILE_MAX_CHARS, Pr as DEFAULT_INPUT_PDF_MAX_PIXELS, Pt as refreshRemoteNodeBins, Q as formatDoctorNonInteractiveHint, Qn as textToSpeech, Rn as clearInternalHooks, Rr as extractImageContentFromSource, Rt as rejectNodePairing, S as resolveGatewaySessionStoreTarget, Sn as runSubagentAnnounceFlow, Sr as applyVerboseOverride, T as archiveSessionTranscripts, Tn as emitAgentEvent, Tr as isSystemEventContextChanged, Tt as handleSlackHttpRequest, U as consumeGatewaySigusr1RestartAuthorization, Un as isTtsEnabled, Ut as getSkillsSnapshotVersion, V as runWithModelFallback, Vn as triggerInternalHook, Vr as resolveAgentTimeoutMs, Vt as updatePairedNodeMetadata, W as deferGatewayRestartUntilIdle, Wn as isTtsProviderConfigured, Wt as registerSkillsChangeListener, X as setPreRestartDeferralCheck, Xn as setTtsEnabled, Y as setGatewaySigusr1RestartPolicy, Yn as resolveTtsProviderOrder, Yt as createReplyPrefixOptions, Z as consumeRestartSentinel, Zn as setTtsProvider, _ as listAgentsForGateway, _n as isAbortTrigger, _t as loadOpenClawPlugins, at as normalizeCronJobPatch, b as loadSessionEntry, bt as loadProviderUsageSummary, c as clearSessionQueues, cn as getTotalPendingReplies, cr as setCommandLaneConcurrency, ct as normalizeOptionalText, d as getActiveEmbeddedRunCount, dr as startDiagnosticHeartbeat, dt as migrateLegacyCronPayload, er as OPENAI_TTS_VOICES, f as waitForEmbeddedPiRunEnd, fr as stopDiagnosticHeartbeat, g as canonicalizeSpawnedByForAgent, gt as getPluginToolMeta, h as resolveAnnounceTargetFromKey, i as runCliAgent, ir as getActiveTaskCount, it as normalizeCronJobCreate, jn as resolveAgentIdentity, jr as DEFAULT_INPUT_IMAGE_MIMES, jt as primeRemoteSkillsCache, k as resolveSessionTranscriptCandidates, kn as getMemorySearchManager, kr as DEFAULT_INPUT_FILE_MIMES, l as runEmbeddedPiAgent, lr as waitForActiveTasks, lt as normalizePayloadToSystemText, m as createOpenClawTools, mn as formatZonedTimestamp, mr as DEFAULT_HEARTBEAT_ACK_MAX_CHARS, mt as requestHeartbeatNow, n as getCliSessionId, o as normalizeSendPolicy, on as dispatchInboundMessage, or as getTotalQueueSize, ot as inferLegacyName, pr as isDiagnosticsEnabled, q as markGatewaySigusr1RestartHandled, qn as resolveTtsConfig, qt as getHookType, r as setCliSessionId, rt as writeRestartSentinel, s as resolveSendPolicy, sn as createReplyDispatcher, sr as resetAllLanes, st as normalizeOptionalAgentId, tt as summarizeRestartSentinel, u as abortEmbeddedPiRun, ur as CommandLane, ut as normalizeRequiredName, v as listSessionsFromStore, vn as stopSubagentsForRequester, vr as stripHeartbeatToken, vt as normalizeGroupActivation, w as archiveFileOnDisk, wn as clearAgentRunContext, wr as enqueueSystemEvent, x as pruneLegacyStoreKeys, xn as initSubagentRegistry, xr as applyModelOverrideToSessionEntry, y as loadCombinedSessionStoreForGateway, yr as lookupContextTokens, z as resetDirectoryCache, zn as createInternalHookEvent, zr as normalizeMimeList, zt as renamePairedNode } from "./reply-BNEkWD6b.js";
import { _ as isCronRunSessionKey, d as resolveAgentIdFromSessionKey, i as buildAgentMainSessionKey, l as normalizeAgentId, m as toAgentRequestSessionKey, n as DEFAULT_AGENT_ID, t as DEFAULT_ACCOUNT_ID, u as normalizeMainKey, v as isSubagentSessionKey, y as parseAgentSessionKey } from "./session-key-BWxPj0z_.js";
import { a as logDebug, c as logWarn, n as runExec, t as runCommandWithTimeout } from "./exec-BDyx_yxc.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-CnzGNXsk.js";
import { T as resolveWorkspaceTemplateDir, _ as DEFAULT_MEMORY_FILENAME, b as DEFAULT_USER_FILENAME, c as resolveDefaultAgentId, d as DEFAULT_AGENTS_FILENAME, g as DEFAULT_MEMORY_ALT_FILENAME, h as DEFAULT_IDENTITY_FILENAME, i as resolveAgentModelFallbacksOverride, l as resolveSessionAgentId, m as DEFAULT_HEARTBEAT_FILENAME, n as resolveAgentConfig, p as DEFAULT_BOOTSTRAP_FILENAME, r as resolveAgentDir, s as resolveAgentWorkspaceDir, t as listAgentIds, v as DEFAULT_SOUL_FILENAME, w as resolveDefaultAgentWorkspaceDir, x as ensureAgentWorkspace, y as DEFAULT_TOOLS_FILENAME } from "./agent-scope-DMGrQp5u.js";
import { Ft as DEFAULT_CONTEXT_TOKENS, It as DEFAULT_MODEL, Lt as DEFAULT_PROVIDER, a as isCliProvider, d as resolveConfiguredModelRef, f as resolveDefaultModelForAgent, h as resolveThinkingDefault, i as getModelRefStatus, jt as normalizeSecretInput, l as resolveAllowedModelRef, p as resolveHooksGmailModel } from "./model-selection-D37iyQY4.js";
import "./github-copilot-token-CiF5Iyi2.js";
import { t as formatCliCommand } from "./command-format-ChfKqObn.js";
import "./boolean-BgXe2hyu.js";
import { n as logAcceptedEnvOption, t as isTruthyEnvValue } from "./env-BSjH4KuP.js";
import { D as applyMergePatch, F as VERSION, N as resolveAgentMaxConcurrent, O as applyLegacyMigrations, P as resolveSubagentMaxConcurrent, _ as parseDurationMs, a as parseConfigJson5, c as resolveConfigSnapshotHash, d as OpenClawSchema, g as sensitive, i as loadConfig, l as writeConfigFile, n as migrateLegacyConfig, o as readConfigFileSnapshot, r as createConfigIO, s as readConfigFileSnapshotForWrite, u as validateConfigObjectWithPlugins } from "./config-CWifpzL_.js";
import { c as isTestDefaultMemorySlotDisabled } from "./manifest-registry-DFR7U7LS.js";
import { n as listChannelPlugins, r as normalizeChannelId, t as getChannelPlugin } from "./plugins-CLo5nH74.js";
import { A as resolveAgentMainSessionKey, F as snapshotSessionOrigin, M as resolveMainSessionKey, N as resolveMainSessionKeyFromConfig, _ as normalizeSessionDeliveryFields, h as mergeDeliveryContext, i as loadSessionStore, j as resolveExplicitAgentSessionKey, l as updateSessionStore, p as deliveryContextFromSession, t as extractDeliveryInfo } from "./sessions-ezP1qtWM.js";
import { f as registerUnhandledRejectionHandler, s as loadModelCatalog } from "./runner-BDxtyEy4.js";
import "./image-w4Unf0wW.js";
import "./pi-model-discovery-EwKVHlZB.js";
import { _ as normalizeToolName, h as expandPolicyWithPluginGroups, m as collectExplicitAllowlist, p as buildPluginToolGroups, v as resolveToolProfilePolicy, y as stripPluginOnlyAllowlist } from "./sandbox-BOXx_Lgl.js";
import "./chrome-CGPBw-bD.js";
import { h as hasBinary, i as loadWorkspaceSkillEntries, r as buildWorkspaceSkillSnapshot } from "./skills-Dj7GqTPz.js";
import "./routes-CyIJmYmu.js";
import { a as isErrno, n as formatErrorMessage } from "./errors-BeAy8PFi.js";
import { r as movePathToTrash } from "./server-context-DGqqHDqz.js";
import { o as detectMime } from "./image-ops-DS83Z7J2.js";
import { r as saveMediaBuffer } from "./store-DFW2MnP3.js";
import { n as pickPrimaryTailnetIPv6, t as pickPrimaryTailnetIPv4 } from "./tailnet-BuAkHZAk.js";
import { a as isTrustedProxyAddress, d as resolveGatewayListenHosts, i as isPrivateOrLoopbackAddress, l as resolveGatewayBindHost, n as isLoopbackAddress, r as isLoopbackHost, t as rawDataToString, u as resolveGatewayClientIp } from "./ws-DRtd8iSA.js";
import { a as inspectPortUsage, r as ensurePortAvailable, s as formatPortDiagnostics } from "./ports-DAxLoOFv.js";
import { f as GATEWAY_CLIENT_CAPS, g as hasGatewayClientCap, h as GATEWAY_CLIENT_NAMES, i as isGatewayMessageChannel, l as normalizeMessageChannel, m as GATEWAY_CLIENT_MODES, n as isDeliverableMessageChannel, p as GATEWAY_CLIENT_IDS, r as isGatewayCliClient, s as isWebchatClient, t as INTERNAL_MESSAGE_CHANNEL } from "./message-channel-BA527_ar.js";
import "./logging-CcxUDNcI.js";
import "./accounts-DmCS3XF8.js";
import "./send-CUpDmT_F.js";
import "./send-C8AhSqO8.js";
import { c as resolveStorePath, i as resolveSessionTranscriptPath, n as resolveSessionFilePath, r as resolveSessionFilePathOptions, s as resolveSessionTranscriptsDirForAgent } from "./paths-BuQbsACT.js";
import "./tool-images-C7cLCz1D.js";
import "./redact-Bb36nvYe.js";
import "./tool-display-CPUH9JiE.js";
import "./fetch-_IAZS3Vz.js";
import { o as normalizeReplyPayloadsForDelivery, t as deliverOutboundPayloads, x as getGlobalHookRunner } from "./deliver-BUfUVLsa.js";
import { n as getMachineDisplayName, t as createBrowserRouteDispatcher } from "./dispatcher-CKUm3wsK.js";
import "./send-Div41qfG.js";
import "./manager-BK_KHPSI.js";
import "./sqlite-DLuWRI0D.js";
import "./retry-UPMRcKEG.js";
import { t as ToolInputError } from "./common-DwTaPWKf.js";
import "./ir-CGIUordM.js";
import "./render-DIvHuHqk.js";
import "./commands-registry-DBWrx0Xv.js";
import { $ as validateNodePairRequestParams, A as validateCronStatusParams, B as validateExecApprovalsNodeGetParams, Bt as verifyDeviceSignature, C as validateConfigSetParams, Ct as validateWizardCancelParams, D as validateCronRemoveParams, Dt as PROTOCOL_VERSION, E as validateCronListParams, Et as validateWizardStatusParams, F as validateDeviceTokenRevokeParams, Ft as buildDeviceAuthPayload, G as validateNodeDescribeParams, H as validateExecApprovalsSetParams, I as validateDeviceTokenRotateParams, J as validateNodeInvokeResultParams, K as validateNodeEventParams, L as validateExecApprovalRequestParams, Lt as deriveDeviceIdFromPublicKey, M as validateDevicePairApproveParams, N as validateDevicePairListParams, O as validateCronRunParams, Ot as ErrorCodes, P as validateDevicePairRejectParams, Pt as normalizeInputProvenance, Q as validateNodePairRejectParams, R as validateExecApprovalResolveParams, S as validateConfigSchemaParams, St as validateWebLoginWaitParams, T as validateCronAddParams, Tt as validateWizardStartParams, U as validateLogsTailParams, V as validateExecApprovalsNodeSetParams, W as validateModelsListParams, X as validateNodePairApproveParams, Y as validateNodeListParams, Z as validateNodePairListParams, _ as validateChatInjectParams, _t as validateTalkConfigParams, a as validateAgentWaitParams, at as validateSessionsCompactParams, b as validateConfigGetParams, bt as validateWakeParams, c as validateAgentsFilesGetParams, ct as validateSessionsPatchParams, d as validateAgentsListParams, dt as validateSessionsResolveParams, et as validateNodePairVerifyParams, f as validateAgentsUpdateParams, ft as validateSessionsUsageParams, g as validateChatHistoryParams, gt as validateSkillsUpdateParams, h as validateChatAbortParams, ht as validateSkillsStatusParams, i as validateAgentParams, it as validateSendParams, j as validateCronUpdateParams, jt as parseSessionLabel, k as validateCronRunsParams, kt as errorShape, l as validateAgentsFilesListParams, lt as validateSessionsPreviewParams, m as validateChannelsStatusParams, mt as validateSkillsInstallParams, n as formatValidationErrors, nt as validatePollParams, o as validateAgentsCreateParams, ot as validateSessionsDeleteParams, p as validateChannelsLogoutParams, pt as validateSkillsBinsParams, q as validateNodeInvokeParams, r as validateAgentIdentityParams, rt as validateRequestFrame, s as validateAgentsDeleteParams, st as validateSessionsListParams, tt as validateNodeRenameParams, u as validateAgentsFilesSetParams, ut as validateSessionsResetParams, v as validateChatSendParams, vt as validateTalkModeParams, w as validateConnectParams, wt as validateWizardNextParams, x as validateConfigPatchParams, xt as validateWebLoginStartParams, y as validateConfigApplyParams, yt as validateUpdateRunParams, z as validateExecApprovalsGetParams, zt as normalizeDevicePublicKeyBase64Url } from "./client-CEto0Pf6.js";
import { n as callGateway, o as loadGatewayTlsRuntime$1 } from "./call-i9290XP8.js";
import { t as getChannelActivity } from "./channel-activity-Ds_g7OEt.js";
import { n as normalizePollInput } from "./polls-yr-D4xmo.js";
import "./tables-1llcV3qs.js";
import "./send-oaAcLlhT.js";
import { t as formatDocsLink } from "./links-DKVbBuQN.js";
import { n as runCommandWithRuntime } from "./cli-utils-Gpj8Z_ye.js";
import { n as withProgress } from "./progress-DitCFjx_.js";
import "./pairing-store-88eMFj2v.js";
import { a as resolveSubagentToolPolicy, i as resolveGroupToolPolicy, r as resolveEffectiveToolPolicy, t as filterToolsByPolicy } from "./pi-tools.policy-BKT9HswJ.js";
import "./send-DbQ_i4Qf.js";
import { C as resolveAssistantAvatarUrl, S as normalizeControlUiBasePath, b as CONTROL_UI_AVATAR_PREFIX, c as handleReset, x as buildControlUiAvatarUrl } from "./onboard-helpers-tLA-tN_l.js";
import "./prompt-style-ciYaT-3f.js";
import "./pairing-labels-C_rjFixf.js";
import { i as loadSessionUsageTimeSeries, l as deriveSessionTotalTokens, n as loadCostUsageSummary, r as loadSessionCostSummary, t as discoverAllSessions, u as hasNonzeroUsage } from "./session-cost-usage-CbsU4YHL.js";
import { n as formatTokenCount, r as formatUsd } from "./usage-format-BTRSxltt.js";
import { a as normalizeExecApprovals, d as resolveExecApprovalsSocketPath, f as saveExecApprovals, n as ensureExecApprovals, o as readExecApprovalsSnapshot } from "./exec-approvals-tvGi9Ldo.js";
import "./nodes-screen-BeEWwXR4.js";
import { a as AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN, c as safeEqualSecret, d as enableTailscaleFunnel, f as enableTailscaleServe, i as resolveGatewayAuth, l as disableTailscaleFunnel, m as getTailnetHostname, n as authorizeGatewayConnect, o as AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET, r as isLocalDirectRequest, s as createAuthRateLimiter, t as assertGatewayAuthConfigured, u as disableTailscaleServe } from "./auth-DT6fiHDK.js";
import "./control-auth-Drf7IiLj.js";
import { n as createBrowserControlContext, r as startBrowserControlServiceFromConfig } from "./control-service-BKUh8p7b.js";
import { t as parseAbsoluteTimeMs } from "./parse-CPtXU9GW.js";
import { n as resolveMessageChannelSelection } from "./channel-selection-BN6_hiIf.js";
import "./delivery-queue-46I6nBfA.js";
import { i as onHeartbeatEvent, r as getLastHeartbeatEvent, s as resolveCronStyleNow, t as resolveHeartbeatVisibility } from "./heartbeat-visibility-B_LxQECx.js";
import { a as createOutboundSendDeps, i as resolveAgentOutboundTarget, o as createDefaultDeps, r as resolveAgentDeliveryPlan, s as createOutboundSendDeps$1, t as agentCommand } from "./agent-CYvhbrs3.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-CGiblChU.js";
import "./daemon-runtime-sITO6h1s.js";
import { c as loadAgentIdentity, d as loadAgentIdentityFromWorkspace, i as applyAgentConfig, l as pruneAgentConfig, n as getStatusSummary, o as findAgentEntryIndex, p as forceFreePortAndWait, r as runOnboardingWizard, s as listAgentEntries } from "./status-DcvqlJYG.js";
import { t as resolveChannelDefaultAccountId } from "./helpers-28CRTwys.js";
import "./logging-BYdFQAju.js";
import "./note-B5hvEaG5.js";
import { t as WizardCancelledError } from "./prompts-BEHxUC3w.js";
import { i as discoverGatewayBeacons, n as installSkill } from "./onboard-skills-BBfEXIps.js";
import "./github-copilot-auth-oZW8Q54S.js";
import "./onboard-channels-0nZkyjjM.js";
import { r as buildChannelUiCatalog, t as applyPluginAutoEnable } from "./plugin-auto-enable-B_v9wM6g.js";
import "./archive-3RxGtdg9.js";
import "./skill-scanner-BDTjIBGW.js";
import "./installs-NHf37wyZ.js";
import { a as runHeartbeatOnce, f as resolveControlUiRootOverrideSync, l as ensureControlUiAssetsBuilt, n as getHealthSnapshot, o as setHeartbeatsEnabled, p as resolveControlUiRootSync, s as startHeartbeatRunner, t as formatHealthChannelLines } from "./health-Cb5plNjz.js";
import "./service-CMKWaXkp.js";
import "./systemd-CFcBM6Sc.js";
import { n as resolveWideAreaDiscoveryDomain, r as writeWideAreaGatewayZone } from "./widearea-dns--XSFYXnQ.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-CRbYCH-J.js";
import "./completion-cli-D7hv-tR8.js";
import { a as runGatewayUpdate, d as checkUpdateStatus, f as compareSemverStrings, g as DEFAULT_PACKAGE_CHANNEL, m as resolveNpmChannelTag, y as normalizeUpdateChannel } from "./status.update-CWTIGg6J.js";
import "./service-audit-t42gxcdN.js";
import "./channels-status-issues-Cuirza--.js";
import "./table-BuqaalSN.js";
import { i as shouldIncludeHook, n as loadWorkspaceHookEntries, r as resolveHookConfig } from "./hooks-status-B2nsYsXM.js";
import "./tui-CMbEG2YE.js";
import { a as resolveNodeCommandAllowlist, i as isNodeCommandAllowed, o as probeGateway } from "./audit-CeiPGqWs.js";
import "./node-service-CAYdczqI.js";
import { t as buildChannelAccountSnapshot } from "./status-3LCCYMbr.js";
import "./shared-CWlZJ7R3.js";
import { a as runDaemonStop, i as runDaemonStart, n as runDaemonStatus, o as runDaemonUninstall, r as runDaemonRestart, s as runDaemonInstall } from "./daemon-cli-HLdXfMBU.js";
import { a as toOptionString, i as parsePort$1, n as extractGatewayMiskeys, r as maybeExplainGatewayServiceStop, t as describeUnknownError } from "./shared-DTGsGydj.js";
import { i as setGatewayWsLogStyle, n as logWs, r as summarizeAgentEventForWsLog, t as formatForLog } from "./ws-log-Djujhbh-.js";
import { T as resolveGmailHookRuntimeConfig, _ as buildGogWatchServeArgs, i as ensureTailscaleEndpoint, v as buildGogWatchStartArgs } from "./gmail-setup-utils-DbrAnUQ9.js";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as fsSync from "node:fs";
import fs, { constants } from "node:fs";
import os from "node:os";
import path from "node:path";
import JSON5 from "json5";
import chalk from "chalk";
import fsPromises from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import crypto, { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";
import { createServer } from "node:http";
import { createServer as createServer$1 } from "node:https";
import { WebSocketServer } from "ws";
import net from "node:net";
import { Buffer as Buffer$1 } from "node:buffer";
import chokidar from "chokidar";
import { Cron } from "croner";

//#region src/infra/ssh-config.ts
function parsePort(value) {
	if (!value) return;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) return;
	return parsed;
}
function parseSshConfigOutput(output) {
	const result = { identityFiles: [] };
	const lines = output.split("\n");
	for (const raw of lines) {
		const line = raw.trim();
		if (!line) continue;
		const [key, ...rest] = line.split(/\s+/);
		const value = rest.join(" ").trim();
		if (!key || !value) continue;
		switch (key) {
			case "user":
				result.user = value;
				break;
			case "hostname":
				result.host = value;
				break;
			case "port":
				result.port = parsePort(value);
				break;
			case "identityfile":
				if (value !== "none") result.identityFiles.push(value);
				break;
			default: break;
		}
	}
	return result;
}
async function resolveSshConfig(target, opts = {}) {
	const sshPath = "/usr/bin/ssh";
	const args = ["-G"];
	if (target.port > 0 && target.port !== 22) args.push("-p", String(target.port));
	if (opts.identity?.trim()) args.push("-i", opts.identity.trim());
	const userHost = target.user ? `${target.user}@${target.host}` : target.host;
	args.push("--", userHost);
	return await new Promise((resolve) => {
		const child = spawn(sshPath, args, { stdio: [
			"ignore",
			"pipe",
			"ignore"
		] });
		let stdout = "";
		child.stdout?.setEncoding("utf8");
		child.stdout?.on("data", (chunk) => {
			stdout += String(chunk);
		});
		const timeoutMs = Math.max(200, opts.timeoutMs ?? 800);
		const timer = setTimeout(() => {
			try {
				child.kill("SIGKILL");
			} finally {
				resolve(null);
			}
		}, timeoutMs);
		child.once("error", () => {
			clearTimeout(timer);
			resolve(null);
		});
		child.once("exit", (code) => {
			clearTimeout(timer);
			if (code !== 0 || !stdout.trim()) {
				resolve(null);
				return;
			}
			resolve(parseSshConfigOutput(stdout));
		});
	});
}

//#endregion
//#region src/infra/ssh-tunnel.ts
function parseSshTarget(raw) {
	const trimmed = raw.trim().replace(/^ssh\s+/, "");
	if (!trimmed) return null;
	const [userPart, hostPart] = trimmed.includes("@") ? (() => {
		const idx = trimmed.indexOf("@");
		const user = trimmed.slice(0, idx).trim();
		const host = trimmed.slice(idx + 1).trim();
		return [user || void 0, host];
	})() : [void 0, trimmed];
	const colonIdx = hostPart.lastIndexOf(":");
	if (colonIdx > 0 && colonIdx < hostPart.length - 1) {
		const host = hostPart.slice(0, colonIdx).trim();
		const portRaw = hostPart.slice(colonIdx + 1).trim();
		const port = Number.parseInt(portRaw, 10);
		if (!host || !Number.isFinite(port) || port <= 0) return null;
		if (host.startsWith("-")) return null;
		return {
			user: userPart,
			host,
			port
		};
	}
	if (!hostPart) return null;
	if (hostPart.startsWith("-")) return null;
	return {
		user: userPart,
		host: hostPart,
		port: 22
	};
}
async function pickEphemeralPort() {
	return await new Promise((resolve, reject) => {
		const server = net.createServer();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const addr = server.address();
			server.close(() => {
				if (!addr || typeof addr === "string") {
					reject(/* @__PURE__ */ new Error("failed to allocate a local port"));
					return;
				}
				resolve(addr.port);
			});
		});
	});
}
async function canConnectLocal(port) {
	return await new Promise((resolve) => {
		const socket = net.connect({
			host: "127.0.0.1",
			port
		});
		const done = (ok) => {
			socket.removeAllListeners();
			socket.destroy();
			resolve(ok);
		};
		socket.once("connect", () => done(true));
		socket.once("error", () => done(false));
		socket.setTimeout(250, () => done(false));
	});
}
async function waitForLocalListener(port, timeoutMs) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (await canConnectLocal(port)) return;
		await new Promise((r) => setTimeout(r, 50));
	}
	throw new Error(`ssh tunnel did not start listening on localhost:${port}`);
}
async function startSshPortForward(opts) {
	const parsed = parseSshTarget(opts.target);
	if (!parsed) throw new Error(`invalid SSH target: ${opts.target}`);
	let localPort = opts.localPortPreferred;
	try {
		await ensurePortAvailable(localPort);
	} catch (err) {
		if (isErrno(err) && err.code === "EADDRINUSE") localPort = await pickEphemeralPort();
		else throw err;
	}
	const userHost = parsed.user ? `${parsed.user}@${parsed.host}` : parsed.host;
	const args = [
		"-N",
		"-L",
		`${localPort}:127.0.0.1:${opts.remotePort}`,
		"-p",
		String(parsed.port),
		"-o",
		"ExitOnForwardFailure=yes",
		"-o",
		"BatchMode=yes",
		"-o",
		"StrictHostKeyChecking=accept-new",
		"-o",
		"UpdateHostKeys=yes",
		"-o",
		"ConnectTimeout=5",
		"-o",
		"ServerAliveInterval=15",
		"-o",
		"ServerAliveCountMax=3"
	];
	if (opts.identity?.trim()) args.push("-i", opts.identity.trim());
	args.push("--", userHost);
	const stderr = [];
	const child = spawn("/usr/bin/ssh", args, { stdio: [
		"ignore",
		"ignore",
		"pipe"
	] });
	child.stderr?.setEncoding("utf8");
	child.stderr?.on("data", (chunk) => {
		const lines = String(chunk).split("\n").map((l) => l.trim()).filter(Boolean);
		stderr.push(...lines);
	});
	const stop = async () => {
		if (child.killed) return;
		child.kill("SIGTERM");
		await new Promise((resolve) => {
			const t = setTimeout(() => {
				try {
					child.kill("SIGKILL");
				} finally {
					resolve();
				}
			}, 1500);
			child.once("exit", () => {
				clearTimeout(t);
				resolve();
			});
		});
	};
	try {
		await Promise.race([waitForLocalListener(localPort, Math.max(250, opts.timeoutMs)), new Promise((_, reject) => {
			child.once("exit", (code, signal) => {
				reject(/* @__PURE__ */ new Error(`ssh exited (${code ?? "null"}${signal ? `/${signal}` : ""})`));
			});
		})]);
	} catch (err) {
		await stop();
		const suffix = stderr.length > 0 ? `\n${stderr.join("\n")}` : "";
		throw new Error(`${err instanceof Error ? err.message : String(err)}${suffix}`, { cause: err });
	}
	return {
		parsedTarget: parsed,
		localPort,
		remotePort: opts.remotePort,
		pid: typeof child.pid === "number" ? child.pid : null,
		stderr,
		stop
	};
}

//#endregion
//#region src/commands/gateway-status/helpers.ts
function parseIntOrNull(value) {
	const s = typeof value === "string" ? value.trim() : typeof value === "number" || typeof value === "bigint" ? String(value) : "";
	if (!s) return null;
	const n = Number.parseInt(s, 10);
	return Number.isFinite(n) ? n : null;
}
function parseTimeoutMs(raw, fallbackMs) {
	const value = typeof raw === "string" ? raw.trim() : typeof raw === "number" || typeof raw === "bigint" ? String(raw) : "";
	if (!value) return fallbackMs;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`invalid --timeout: ${value}`);
	return parsed;
}
function normalizeWsUrl(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (!trimmed.startsWith("ws://") && !trimmed.startsWith("wss://")) return null;
	return trimmed;
}
function resolveTargets(cfg, explicitUrl) {
	const targets = [];
	const add = (t) => {
		if (!targets.some((x) => x.url === t.url)) targets.push(t);
	};
	const explicit = typeof explicitUrl === "string" ? normalizeWsUrl(explicitUrl) : null;
	if (explicit) add({
		id: "explicit",
		kind: "explicit",
		url: explicit,
		active: true
	});
	const remoteUrl = typeof cfg.gateway?.remote?.url === "string" ? normalizeWsUrl(cfg.gateway.remote.url) : null;
	if (remoteUrl) add({
		id: "configRemote",
		kind: "configRemote",
		url: remoteUrl,
		active: cfg.gateway?.mode === "remote"
	});
	add({
		id: "localLoopback",
		kind: "localLoopback",
		url: `ws://127.0.0.1:${resolveGatewayPort(cfg)}`,
		active: cfg.gateway?.mode !== "remote"
	});
	return targets;
}
function resolveProbeBudgetMs(overallMs, kind) {
	if (kind === "localLoopback") return Math.min(800, overallMs);
	if (kind === "sshTunnel") return Math.min(2e3, overallMs);
	return Math.min(1500, overallMs);
}
function sanitizeSshTarget(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return trimmed.replace(/^ssh\\s+/, "");
}
function resolveAuthForTarget(cfg, target, overrides) {
	const tokenOverride = overrides.token?.trim() ? overrides.token.trim() : void 0;
	const passwordOverride = overrides.password?.trim() ? overrides.password.trim() : void 0;
	if (tokenOverride || passwordOverride) return {
		token: tokenOverride,
		password: passwordOverride
	};
	if (target.kind === "configRemote" || target.kind === "sshTunnel") {
		const token = typeof cfg.gateway?.remote?.token === "string" ? cfg.gateway.remote.token.trim() : "";
		const remotePassword = (cfg.gateway?.remote)?.password;
		const password = typeof remotePassword === "string" ? remotePassword.trim() : "";
		return {
			token: token.length > 0 ? token : void 0,
			password: password.length > 0 ? password : void 0
		};
	}
	const envToken = process.env.OPENCLAW_GATEWAY_TOKEN?.trim() || "";
	const envPassword = process.env.OPENCLAW_GATEWAY_PASSWORD?.trim() || "";
	const cfgToken = typeof cfg.gateway?.auth?.token === "string" ? cfg.gateway.auth.token.trim() : "";
	const cfgPassword = typeof cfg.gateway?.auth?.password === "string" ? cfg.gateway.auth.password.trim() : "";
	return {
		token: envToken || cfgToken || void 0,
		password: envPassword || cfgPassword || void 0
	};
}
function pickGatewaySelfPresence(presence) {
	if (!Array.isArray(presence)) return null;
	const entries = presence;
	const self = entries.find((e) => e.mode === "gateway" && e.reason === "self") ?? entries.find((e) => typeof e.text === "string" && String(e.text).startsWith("Gateway:")) ?? null;
	if (!self) return null;
	return {
		host: typeof self.host === "string" ? self.host : void 0,
		ip: typeof self.ip === "string" ? self.ip : void 0,
		version: typeof self.version === "string" ? self.version : void 0,
		platform: typeof self.platform === "string" ? self.platform : void 0
	};
}
function extractConfigSummary(snapshotUnknown) {
	const snap = snapshotUnknown;
	const path = typeof snap?.path === "string" ? snap.path : null;
	const exists = Boolean(snap?.exists);
	const valid = Boolean(snap?.valid);
	const issuesRaw = Array.isArray(snap?.issues) ? snap.issues : [];
	const legacyRaw = Array.isArray(snap?.legacyIssues) ? snap.legacyIssues : [];
	const cfg = snap?.config ?? {};
	const gateway = cfg.gateway ?? {};
	const wideArea = (cfg.discovery ?? {}).wideArea ?? {};
	const remote = gateway.remote ?? {};
	const auth = gateway.auth ?? {};
	const controlUi = gateway.controlUi ?? {};
	const tailscale = gateway.tailscale ?? {};
	const authMode = typeof auth.mode === "string" ? auth.mode : null;
	const authTokenConfigured = typeof auth.token === "string" ? auth.token.trim().length > 0 : false;
	const authPasswordConfigured = typeof auth.password === "string" ? auth.password.trim().length > 0 : false;
	const remoteUrl = typeof remote.url === "string" ? normalizeWsUrl(remote.url) : null;
	const remoteTokenConfigured = typeof remote.token === "string" ? remote.token.trim().length > 0 : false;
	const remotePasswordConfigured = typeof remote.password === "string" ? String(remote.password).trim().length > 0 : false;
	const wideAreaEnabled = typeof wideArea.enabled === "boolean" ? wideArea.enabled : null;
	return {
		path,
		exists,
		valid,
		issues: issuesRaw.filter((i) => Boolean(i && typeof i.path === "string" && typeof i.message === "string")).map((i) => ({
			path: i.path,
			message: i.message
		})),
		legacyIssues: legacyRaw.filter((i) => Boolean(i && typeof i.path === "string" && typeof i.message === "string")).map((i) => ({
			path: i.path,
			message: i.message
		})),
		gateway: {
			mode: typeof gateway.mode === "string" ? gateway.mode : null,
			bind: typeof gateway.bind === "string" ? gateway.bind : null,
			port: parseIntOrNull(gateway.port),
			controlUiEnabled: typeof controlUi.enabled === "boolean" ? controlUi.enabled : null,
			controlUiBasePath: typeof controlUi.basePath === "string" ? controlUi.basePath : null,
			authMode,
			authTokenConfigured,
			authPasswordConfigured,
			remoteUrl,
			remoteTokenConfigured,
			remotePasswordConfigured,
			tailscaleMode: typeof tailscale.mode === "string" ? tailscale.mode : null
		},
		discovery: { wideAreaEnabled }
	};
}
function buildNetworkHints(cfg) {
	const tailnetIPv4 = pickPrimaryTailnetIPv4();
	const port = resolveGatewayPort(cfg);
	return {
		localLoopbackUrl: `ws://127.0.0.1:${port}`,
		localTailnetUrl: tailnetIPv4 ? `ws://${tailnetIPv4}:${port}` : null,
		tailnetIPv4: tailnetIPv4 ?? null
	};
}
function renderTargetHeader(target, rich) {
	const kindLabel = target.kind === "localLoopback" ? "Local loopback" : target.kind === "sshTunnel" ? "Remote over SSH" : target.kind === "configRemote" ? target.active ? "Remote (configured)" : "Remote (configured, inactive)" : "URL (explicit)";
	return `${colorize(rich, theme.heading, kindLabel)} ${colorize(rich, theme.muted, target.url)}`;
}
function renderProbeSummaryLine(probe, rich) {
	if (probe.ok) {
		const latency = typeof probe.connectLatencyMs === "number" ? `${probe.connectLatencyMs}ms` : "unknown";
		return `${colorize(rich, theme.success, "Connect: ok")} (${latency}) · ${colorize(rich, theme.success, "RPC: ok")}`;
	}
	const detail = probe.error ? ` - ${probe.error}` : "";
	if (probe.connectLatencyMs != null) {
		const latency = typeof probe.connectLatencyMs === "number" ? `${probe.connectLatencyMs}ms` : "unknown";
		return `${colorize(rich, theme.success, "Connect: ok")} (${latency}) · ${colorize(rich, theme.error, "RPC: failed")}${detail}`;
	}
	return `${colorize(rich, theme.error, "Connect: failed")}${detail}`;
}

//#endregion
//#region src/commands/gateway-status.ts
async function gatewayStatusCommand(opts, runtime) {
	const startedAt = Date.now();
	const cfg = loadConfig();
	const rich = isRich() && opts.json !== true;
	const overallTimeoutMs = parseTimeoutMs(opts.timeout, 3e3);
	const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: cfg.discovery?.wideArea?.domain });
	const baseTargets = resolveTargets(cfg, opts.url);
	const network = buildNetworkHints(cfg);
	const discoveryTimeoutMs = Math.min(1200, overallTimeoutMs);
	const discoveryPromise = discoverGatewayBeacons({
		timeoutMs: discoveryTimeoutMs,
		wideAreaDomain
	});
	let sshTarget = sanitizeSshTarget(opts.ssh) ?? sanitizeSshTarget(cfg.gateway?.remote?.sshTarget);
	let sshIdentity = sanitizeSshTarget(opts.sshIdentity) ?? sanitizeSshTarget(cfg.gateway?.remote?.sshIdentity);
	const remotePort = resolveGatewayPort(cfg);
	let sshTunnelError = null;
	let sshTunnelStarted = false;
	if (!sshTarget) sshTarget = inferSshTargetFromRemoteUrl(cfg.gateway?.remote?.url);
	if (sshTarget) {
		const resolved = await resolveSshTarget(sshTarget, sshIdentity, overallTimeoutMs);
		if (resolved) {
			sshTarget = resolved.target;
			if (!sshIdentity && resolved.identity) sshIdentity = resolved.identity;
		}
	}
	const { discovery, probed } = await withProgress({
		label: "Inspecting gateways…",
		indeterminate: true,
		enabled: opts.json !== true
	}, async () => {
		const tryStartTunnel = async () => {
			if (!sshTarget) return null;
			try {
				const tunnel = await startSshPortForward({
					target: sshTarget,
					identity: sshIdentity ?? void 0,
					localPortPreferred: remotePort,
					remotePort,
					timeoutMs: Math.min(1500, overallTimeoutMs)
				});
				sshTunnelStarted = true;
				return tunnel;
			} catch (err) {
				sshTunnelError = err instanceof Error ? err.message : String(err);
				return null;
			}
		};
		const discoveryTask = discoveryPromise.catch(() => []);
		const tunnelTask = sshTarget ? tryStartTunnel() : Promise.resolve(null);
		const [discovery, tunnelFirst] = await Promise.all([discoveryTask, tunnelTask]);
		if (!sshTarget && opts.sshAuto) {
			const user = process.env.USER?.trim() || "";
			const candidates = discovery.map((b) => {
				const host = b.tailnetDns || b.lanHost || b.host;
				if (!host?.trim()) return null;
				const sshPort = typeof b.sshPort === "number" && b.sshPort > 0 ? b.sshPort : 22;
				const base = user ? `${user}@${host.trim()}` : host.trim();
				return sshPort !== 22 ? `${base}:${sshPort}` : base;
			}).filter((candidate) => Boolean(candidate && parseSshTarget(candidate)));
			if (candidates.length > 0) sshTarget = candidates[0] ?? null;
		}
		const tunnel = tunnelFirst || (sshTarget && !sshTunnelStarted && !sshTunnelError ? await tryStartTunnel() : null);
		const tunnelTarget = tunnel ? {
			id: "sshTunnel",
			kind: "sshTunnel",
			url: `ws://127.0.0.1:${tunnel.localPort}`,
			active: true,
			tunnel: {
				kind: "ssh",
				target: sshTarget ?? "",
				localPort: tunnel.localPort,
				remotePort,
				pid: tunnel.pid
			}
		} : null;
		const targets = tunnelTarget ? [tunnelTarget, ...baseTargets.filter((t) => t.url !== tunnelTarget.url)] : baseTargets;
		try {
			return {
				discovery,
				probed: await Promise.all(targets.map(async (target) => {
					const auth = resolveAuthForTarget(cfg, target, {
						token: typeof opts.token === "string" ? opts.token : void 0,
						password: typeof opts.password === "string" ? opts.password : void 0
					});
					const timeoutMs = resolveProbeBudgetMs(overallTimeoutMs, target.kind);
					const probe = await probeGateway({
						url: target.url,
						auth,
						timeoutMs
					});
					return {
						target,
						probe,
						configSummary: probe.configSnapshot ? extractConfigSummary(probe.configSnapshot) : null,
						self: pickGatewaySelfPresence(probe.presence)
					};
				}))
			};
		} finally {
			if (tunnel) try {
				await tunnel.stop();
			} catch {}
		}
	});
	const reachable = probed.filter((p) => p.probe.ok);
	const ok = reachable.length > 0;
	const multipleGateways = reachable.length > 1;
	const primary = reachable.find((p) => p.target.kind === "explicit") ?? reachable.find((p) => p.target.kind === "sshTunnel") ?? reachable.find((p) => p.target.kind === "configRemote") ?? reachable.find((p) => p.target.kind === "localLoopback") ?? null;
	const warnings = [];
	if (sshTarget && !sshTunnelStarted) warnings.push({
		code: "ssh_tunnel_failed",
		message: sshTunnelError ? `SSH tunnel failed: ${String(sshTunnelError)}` : "SSH tunnel failed to start; falling back to direct probes."
	});
	if (multipleGateways) warnings.push({
		code: "multiple_gateways",
		message: "Unconventional setup: multiple reachable gateways detected. Usually one gateway per network is recommended unless you intentionally run isolated profiles, like a rescue bot (see docs: /gateway#multiple-gateways-same-host).",
		targetIds: reachable.map((p) => p.target.id)
	});
	if (opts.json) {
		runtime.log(JSON.stringify({
			ok,
			ts: Date.now(),
			durationMs: Date.now() - startedAt,
			timeoutMs: overallTimeoutMs,
			primaryTargetId: primary?.target.id ?? null,
			warnings,
			network,
			discovery: {
				timeoutMs: discoveryTimeoutMs,
				count: discovery.length,
				beacons: discovery.map((b) => ({
					instanceName: b.instanceName,
					displayName: b.displayName ?? null,
					domain: b.domain ?? null,
					host: b.host ?? null,
					lanHost: b.lanHost ?? null,
					tailnetDns: b.tailnetDns ?? null,
					gatewayPort: b.gatewayPort ?? null,
					sshPort: b.sshPort ?? null,
					wsUrl: (() => {
						const host = b.tailnetDns || b.lanHost || b.host;
						const port = b.gatewayPort ?? 18789;
						return host ? `ws://${host}:${port}` : null;
					})()
				}))
			},
			targets: probed.map((p) => ({
				id: p.target.id,
				kind: p.target.kind,
				url: p.target.url,
				active: p.target.active,
				tunnel: p.target.tunnel ?? null,
				connect: {
					ok: p.probe.ok,
					latencyMs: p.probe.connectLatencyMs,
					error: p.probe.error,
					close: p.probe.close
				},
				self: p.self,
				config: p.configSummary,
				health: p.probe.health,
				summary: p.probe.status,
				presence: p.probe.presence
			}))
		}, null, 2));
		if (!ok) runtime.exit(1);
		return;
	}
	runtime.log(colorize(rich, theme.heading, "Gateway Status"));
	runtime.log(ok ? `${colorize(rich, theme.success, "Reachable")}: yes` : `${colorize(rich, theme.error, "Reachable")}: no`);
	runtime.log(colorize(rich, theme.muted, `Probe budget: ${overallTimeoutMs}ms`));
	if (warnings.length > 0) {
		runtime.log("");
		runtime.log(colorize(rich, theme.warn, "Warning:"));
		for (const w of warnings) runtime.log(`- ${w.message}`);
	}
	runtime.log("");
	runtime.log(colorize(rich, theme.heading, "Discovery (this machine)"));
	const discoveryDomains = wideAreaDomain ? `local. + ${wideAreaDomain}` : "local.";
	runtime.log(discovery.length > 0 ? `Found ${discovery.length} gateway(s) via Bonjour (${discoveryDomains})` : `Found 0 gateways via Bonjour (${discoveryDomains})`);
	if (discovery.length === 0) runtime.log(colorize(rich, theme.muted, "Tip: if the gateway is remote, mDNS won’t cross networks; use Wide-Area Bonjour (split DNS) or SSH tunnels."));
	runtime.log("");
	runtime.log(colorize(rich, theme.heading, "Targets"));
	for (const p of probed) {
		runtime.log(renderTargetHeader(p.target, rich));
		runtime.log(`  ${renderProbeSummaryLine(p.probe, rich)}`);
		if (p.target.tunnel?.kind === "ssh") runtime.log(`  ${colorize(rich, theme.muted, "ssh")}: ${colorize(rich, theme.command, p.target.tunnel.target)}`);
		if (p.probe.ok && p.self) {
			const host = p.self.host ?? "unknown";
			const ip = p.self.ip ? ` (${p.self.ip})` : "";
			const platform = p.self.platform ? ` · ${p.self.platform}` : "";
			const version = p.self.version ? ` · app ${p.self.version}` : "";
			runtime.log(`  ${colorize(rich, theme.info, "Gateway")}: ${host}${ip}${platform}${version}`);
		}
		if (p.configSummary) {
			const c = p.configSummary;
			const wideArea = c.discovery.wideAreaEnabled === true ? "enabled" : c.discovery.wideAreaEnabled === false ? "disabled" : "unknown";
			runtime.log(`  ${colorize(rich, theme.info, "Wide-area discovery")}: ${wideArea}`);
		}
		runtime.log("");
	}
	if (!ok) runtime.exit(1);
}
function inferSshTargetFromRemoteUrl(rawUrl) {
	if (typeof rawUrl !== "string") return null;
	const trimmed = rawUrl.trim();
	if (!trimmed) return null;
	let host = null;
	try {
		host = new URL(trimmed).hostname || null;
	} catch {
		return null;
	}
	if (!host) return null;
	const user = process.env.USER?.trim() || "";
	return user ? `${user}@${host}` : host;
}
function buildSshTarget(input) {
	const host = input.host?.trim() ?? "";
	if (!host) return null;
	const user = input.user?.trim() ?? "";
	const base = user ? `${user}@${host}` : host;
	const port = input.port ?? 22;
	if (port && port !== 22) return `${base}:${port}`;
	return base;
}
async function resolveSshTarget(rawTarget, identity, overallTimeoutMs) {
	const parsed = parseSshTarget(rawTarget);
	if (!parsed) return null;
	const config = await resolveSshConfig(parsed, {
		identity: identity ?? void 0,
		timeoutMs: Math.min(800, overallTimeoutMs)
	});
	if (!config) return {
		target: rawTarget,
		identity: identity ?? void 0
	};
	const target = buildSshTarget({
		user: config.user ?? parsed.user,
		host: config.host ?? parsed.host,
		port: config.port ?? parsed.port
	});
	if (!target) return {
		target: rawTarget,
		identity: identity ?? void 0
	};
	return {
		target,
		identity: identity ?? config.identityFiles.find((entry) => entry.trim().length > 0)?.trim() ?? void 0
	};
}

//#endregion
//#region src/cli/gateway-cli/call.ts
const gatewayCallOpts = (cmd) => cmd.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (password auth)").option("--timeout <ms>", "Timeout in ms", "10000").option("--expect-final", "Wait for final response (agent)", false).option("--json", "Output JSON", false);
const callGatewayCli = async (method, opts, params) => withProgress({
	label: `Gateway ${method}`,
	indeterminate: true,
	enabled: opts.json !== true
}, async () => await callGateway({
	url: opts.url,
	token: opts.token,
	password: opts.password,
	method,
	params,
	expectFinal: Boolean(opts.expectFinal),
	timeoutMs: Number(opts.timeout ?? 1e4),
	clientName: GATEWAY_CLIENT_NAMES.CLI,
	mode: GATEWAY_CLIENT_MODES.CLI
}));

//#endregion
//#region src/cli/gateway-cli/discover.ts
function parseDiscoverTimeoutMs(raw, fallbackMs) {
	if (raw === void 0 || raw === null) return fallbackMs;
	const value = typeof raw === "string" ? raw.trim() : typeof raw === "number" || typeof raw === "bigint" ? String(raw) : null;
	if (value === null) throw new Error("invalid --timeout");
	if (!value) return fallbackMs;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`invalid --timeout: ${value}`);
	return parsed;
}
function pickBeaconHost(beacon) {
	const host = beacon.tailnetDns || beacon.lanHost || beacon.host;
	return host?.trim() ? host.trim() : null;
}
function pickGatewayPort(beacon) {
	const port = beacon.gatewayPort ?? 18789;
	return port > 0 ? port : 18789;
}
function dedupeBeacons(beacons) {
	const out = [];
	const seen = /* @__PURE__ */ new Set();
	for (const b of beacons) {
		const host = pickBeaconHost(b) ?? "";
		const key = [
			b.domain ?? "",
			b.instanceName ?? "",
			b.displayName ?? "",
			host,
			String(b.port ?? ""),
			String(b.gatewayPort ?? "")
		].join("|");
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(b);
	}
	return out;
}
function renderBeaconLines(beacon, rich) {
	const nameRaw = (beacon.displayName || beacon.instanceName || "Gateway").trim();
	const domainRaw = (beacon.domain || "local.").trim();
	const title = colorize(rich, theme.accentBright, nameRaw);
	const domain = colorize(rich, theme.muted, domainRaw);
	const host = pickBeaconHost(beacon);
	const gatewayPort = pickGatewayPort(beacon);
	const scheme = beacon.gatewayTls ? "wss" : "ws";
	const wsUrl = host ? `${scheme}://${host}:${gatewayPort}` : null;
	const lines = [`- ${title} ${domain}`];
	if (beacon.tailnetDns) lines.push(`  ${colorize(rich, theme.info, "tailnet")}: ${beacon.tailnetDns}`);
	if (beacon.lanHost) lines.push(`  ${colorize(rich, theme.info, "lan")}: ${beacon.lanHost}`);
	if (beacon.host) lines.push(`  ${colorize(rich, theme.info, "host")}: ${beacon.host}`);
	if (wsUrl) lines.push(`  ${colorize(rich, theme.muted, "ws")}: ${colorize(rich, theme.command, wsUrl)}`);
	if (beacon.role) lines.push(`  ${colorize(rich, theme.muted, "role")}: ${beacon.role}`);
	if (beacon.transport) lines.push(`  ${colorize(rich, theme.muted, "transport")}: ${beacon.transport}`);
	if (beacon.gatewayTls) {
		const fingerprint = beacon.gatewayTlsFingerprintSha256 ? `sha256 ${beacon.gatewayTlsFingerprintSha256}` : "enabled";
		lines.push(`  ${colorize(rich, theme.muted, "tls")}: ${fingerprint}`);
	}
	if (typeof beacon.sshPort === "number" && beacon.sshPort > 0 && host) {
		const ssh = `ssh -N -L 18789:127.0.0.1:18789 <user>@${host} -p ${beacon.sshPort}`;
		lines.push(`  ${colorize(rich, theme.muted, "ssh")}: ${colorize(rich, theme.command, ssh)}`);
	}
	return lines;
}

//#endregion
//#region src/gateway/server/close-reason.ts
const CLOSE_REASON_MAX_BYTES = 120;
function truncateCloseReason(reason, maxBytes = CLOSE_REASON_MAX_BYTES) {
	if (!reason) return "invalid handshake";
	const buf = Buffer$1.from(reason);
	if (buf.length <= maxBytes) return reason;
	return buf.subarray(0, maxBytes).toString();
}

//#endregion
//#region src/infra/exec-approval-forwarder.ts
const log$6 = createSubsystemLogger("gateway/exec-approvals");
const DEFAULT_MODE = "session";
function normalizeMode(mode) {
	return mode ?? DEFAULT_MODE;
}
function matchSessionFilter(sessionKey, patterns) {
	return patterns.some((pattern) => {
		try {
			return sessionKey.includes(pattern) || new RegExp(pattern).test(sessionKey);
		} catch {
			return sessionKey.includes(pattern);
		}
	});
}
function shouldForward(params) {
	const config = params.config;
	if (!config?.enabled) return false;
	if (config.agentFilter?.length) {
		const agentId = params.request.request.agentId ?? parseAgentSessionKey(params.request.request.sessionKey)?.agentId;
		if (!agentId) return false;
		if (!config.agentFilter.includes(agentId)) return false;
	}
	if (config.sessionFilter?.length) {
		const sessionKey = params.request.request.sessionKey;
		if (!sessionKey) return false;
		if (!matchSessionFilter(sessionKey, config.sessionFilter)) return false;
	}
	return true;
}
function buildTargetKey(target) {
	const channel = normalizeMessageChannel(target.channel) ?? target.channel;
	const accountId = target.accountId ?? "";
	const threadId = target.threadId ?? "";
	return [
		channel,
		target.to,
		accountId,
		threadId
	].join(":");
}
function formatApprovalCommand(command) {
	if (!command.includes("\n") && !command.includes("`")) return {
		inline: true,
		text: `\`${command}\``
	};
	let fence = "```";
	while (command.includes(fence)) fence += "`";
	return {
		inline: false,
		text: `${fence}\n${command}\n${fence}`
	};
}
function buildRequestMessage(request, nowMs) {
	const lines = ["🔒 Exec approval required", `ID: ${request.id}`];
	const command = formatApprovalCommand(request.request.command);
	if (command.inline) lines.push(`Command: ${command.text}`);
	else {
		lines.push("Command:");
		lines.push(command.text);
	}
	if (request.request.cwd) lines.push(`CWD: ${request.request.cwd}`);
	if (request.request.host) lines.push(`Host: ${request.request.host}`);
	if (request.request.agentId) lines.push(`Agent: ${request.request.agentId}`);
	if (request.request.security) lines.push(`Security: ${request.request.security}`);
	if (request.request.ask) lines.push(`Ask: ${request.request.ask}`);
	const expiresIn = Math.max(0, Math.round((request.expiresAtMs - nowMs) / 1e3));
	lines.push(`Expires in: ${expiresIn}s`);
	lines.push("Reply with: /approve <id> allow-once|allow-always|deny");
	return lines.join("\n");
}
function decisionLabel(decision) {
	if (decision === "allow-once") return "allowed once";
	if (decision === "allow-always") return "allowed always";
	return "denied";
}
function buildResolvedMessage(resolved) {
	return `${`✅ Exec approval ${decisionLabel(resolved.decision)}.`}${resolved.resolvedBy ? ` Resolved by ${resolved.resolvedBy}.` : ""} ID: ${resolved.id}`;
}
function buildExpiredMessage(request) {
	return `⏱️ Exec approval expired. ID: ${request.id}`;
}
function defaultResolveSessionTarget(params) {
	const sessionKey = params.request.request.sessionKey?.trim();
	if (!sessionKey) return null;
	const agentId = parseAgentSessionKey(sessionKey)?.agentId ?? params.request.request.agentId ?? "main";
	const entry = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId }))[sessionKey];
	if (!entry) return null;
	const target = resolveSessionDeliveryTarget({
		entry,
		requestedChannel: "last"
	});
	if (!target.channel || !target.to) return null;
	if (!isDeliverableMessageChannel(target.channel)) return null;
	return {
		channel: target.channel,
		to: target.to,
		accountId: target.accountId,
		threadId: target.threadId
	};
}
async function deliverToTargets(params) {
	const deliveries = params.targets.map(async (target) => {
		if (params.shouldSend && !params.shouldSend()) return;
		const channel = normalizeMessageChannel(target.channel) ?? target.channel;
		if (!isDeliverableMessageChannel(channel)) return;
		try {
			await params.deliver({
				cfg: params.cfg,
				channel,
				to: target.to,
				accountId: target.accountId,
				threadId: target.threadId,
				payloads: [{ text: params.text }]
			});
		} catch (err) {
			log$6.error(`exec approvals: failed to deliver to ${channel}:${target.to}: ${String(err)}`);
		}
	});
	await Promise.allSettled(deliveries);
}
function createExecApprovalForwarder(deps = {}) {
	const getConfig = deps.getConfig ?? loadConfig;
	const deliver = deps.deliver ?? deliverOutboundPayloads;
	const nowMs = deps.nowMs ?? Date.now;
	const resolveSessionTarget = deps.resolveSessionTarget ?? defaultResolveSessionTarget;
	const pending = /* @__PURE__ */ new Map();
	const handleRequested = async (request) => {
		const cfg = getConfig();
		const config = cfg.approvals?.exec;
		if (!shouldForward({
			config,
			request
		})) return;
		const mode = normalizeMode(config?.mode);
		const targets = [];
		const seen = /* @__PURE__ */ new Set();
		if (mode === "session" || mode === "both") {
			const sessionTarget = resolveSessionTarget({
				cfg,
				request
			});
			if (sessionTarget) {
				const key = buildTargetKey(sessionTarget);
				if (!seen.has(key)) {
					seen.add(key);
					targets.push({
						...sessionTarget,
						source: "session"
					});
				}
			}
		}
		if (mode === "targets" || mode === "both") {
			const explicitTargets = config?.targets ?? [];
			for (const target of explicitTargets) {
				const key = buildTargetKey(target);
				if (seen.has(key)) continue;
				seen.add(key);
				targets.push({
					...target,
					source: "target"
				});
			}
		}
		if (targets.length === 0) return;
		const expiresInMs = Math.max(0, request.expiresAtMs - nowMs());
		const timeoutId = setTimeout(() => {
			(async () => {
				const entry = pending.get(request.id);
				if (!entry) return;
				pending.delete(request.id);
				const expiredText = buildExpiredMessage(request);
				await deliverToTargets({
					cfg,
					targets: entry.targets,
					text: expiredText,
					deliver
				});
			})();
		}, expiresInMs);
		timeoutId.unref?.();
		const pendingEntry = {
			request,
			targets,
			timeoutId
		};
		pending.set(request.id, pendingEntry);
		if (pending.get(request.id) !== pendingEntry) return;
		await deliverToTargets({
			cfg,
			targets,
			text: buildRequestMessage(request, nowMs()),
			deliver,
			shouldSend: () => pending.get(request.id) === pendingEntry
		});
	};
	const handleResolved = async (resolved) => {
		const entry = pending.get(resolved.id);
		if (!entry) return;
		if (entry.timeoutId) clearTimeout(entry.timeoutId);
		pending.delete(resolved.id);
		const cfg = getConfig();
		const text = buildResolvedMessage(resolved);
		await deliverToTargets({
			cfg,
			targets: entry.targets,
			text,
			deliver
		});
	};
	const stop = () => {
		for (const entry of pending.values()) if (entry.timeoutId) clearTimeout(entry.timeoutId);
		pending.clear();
	};
	return {
		handleRequested,
		handleResolved,
		stop
	};
}

//#endregion
//#region src/infra/update-startup.ts
const UPDATE_CHECK_FILENAME = "update-check.json";
const UPDATE_CHECK_INTERVAL_MS = 1440 * 60 * 1e3;
function shouldSkipCheck(allowInTests) {
	if (allowInTests) return false;
	if (process.env.VITEST || false) return true;
	return false;
}
async function readState(statePath) {
	try {
		const raw = await fsPromises.readFile(statePath, "utf-8");
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
async function writeState(statePath, state) {
	await fsPromises.mkdir(path.dirname(statePath), { recursive: true });
	await fsPromises.writeFile(statePath, JSON.stringify(state, null, 2), "utf-8");
}
async function runGatewayUpdateCheck(params) {
	if (shouldSkipCheck(Boolean(params.allowInTests))) return;
	if (params.isNixMode) return;
	if (params.cfg.update?.checkOnStart === false) return;
	const statePath = path.join(resolveStateDir(), UPDATE_CHECK_FILENAME);
	const state = await readState(statePath);
	const now = Date.now();
	const lastCheckedAt = state.lastCheckedAt ? Date.parse(state.lastCheckedAt) : null;
	if (lastCheckedAt && Number.isFinite(lastCheckedAt)) {
		if (now - lastCheckedAt < UPDATE_CHECK_INTERVAL_MS) return;
	}
	const status = await checkUpdateStatus({
		root: await resolveOpenClawPackageRoot({
			moduleUrl: import.meta.url,
			argv1: process.argv[1],
			cwd: process.cwd()
		}),
		timeoutMs: 2500,
		fetchGit: false,
		includeRegistry: false
	});
	const nextState = {
		...state,
		lastCheckedAt: new Date(now).toISOString()
	};
	if (status.installKind !== "package") {
		await writeState(statePath, nextState);
		return;
	}
	const resolved = await resolveNpmChannelTag({
		channel: normalizeUpdateChannel(params.cfg.update?.channel) ?? DEFAULT_PACKAGE_CHANNEL,
		timeoutMs: 2500
	});
	const tag = resolved.tag;
	if (!resolved.version) {
		await writeState(statePath, nextState);
		return;
	}
	const cmp = compareSemverStrings(VERSION, resolved.version);
	if (cmp != null && cmp < 0) {
		if (state.lastNotifiedVersion !== resolved.version || state.lastNotifiedTag !== tag) {
			params.log.info(`update available (${tag}): v${resolved.version} (current v${VERSION}). Run: ${formatCliCommand("openclaw update")}`);
			nextState.lastNotifiedVersion = resolved.version;
			nextState.lastNotifiedTag = tag;
		}
	}
	await writeState(statePath, nextState);
}
function scheduleGatewayUpdateCheck(params) {
	runGatewayUpdateCheck(params).catch(() => {});
}

//#endregion
//#region src/gateway/config-reload.ts
const DEFAULT_RELOAD_SETTINGS = {
	mode: "hybrid",
	debounceMs: 300
};
const BASE_RELOAD_RULES = [
	{
		prefix: "gateway.remote",
		kind: "none"
	},
	{
		prefix: "gateway.reload",
		kind: "none"
	},
	{
		prefix: "hooks.gmail",
		kind: "hot",
		actions: ["restart-gmail-watcher"]
	},
	{
		prefix: "hooks",
		kind: "hot",
		actions: ["reload-hooks"]
	},
	{
		prefix: "agents.defaults.heartbeat",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "agent.heartbeat",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "cron",
		kind: "hot",
		actions: ["restart-cron"]
	},
	{
		prefix: "browser",
		kind: "hot",
		actions: ["restart-browser-control"]
	}
];
const BASE_RELOAD_RULES_TAIL = [
	{
		prefix: "meta",
		kind: "none"
	},
	{
		prefix: "identity",
		kind: "none"
	},
	{
		prefix: "wizard",
		kind: "none"
	},
	{
		prefix: "logging",
		kind: "none"
	},
	{
		prefix: "models",
		kind: "none"
	},
	{
		prefix: "agents",
		kind: "none"
	},
	{
		prefix: "tools",
		kind: "none"
	},
	{
		prefix: "bindings",
		kind: "none"
	},
	{
		prefix: "audio",
		kind: "none"
	},
	{
		prefix: "agent",
		kind: "none"
	},
	{
		prefix: "routing",
		kind: "none"
	},
	{
		prefix: "messages",
		kind: "none"
	},
	{
		prefix: "session",
		kind: "none"
	},
	{
		prefix: "talk",
		kind: "none"
	},
	{
		prefix: "skills",
		kind: "none"
	},
	{
		prefix: "plugins",
		kind: "restart"
	},
	{
		prefix: "ui",
		kind: "none"
	},
	{
		prefix: "gateway",
		kind: "restart"
	},
	{
		prefix: "discovery",
		kind: "restart"
	},
	{
		prefix: "canvasHost",
		kind: "restart"
	}
];
let cachedReloadRules = null;
let cachedRegistry = null;
function listReloadRules() {
	const registry = getActivePluginRegistry();
	if (registry !== cachedRegistry) {
		cachedReloadRules = null;
		cachedRegistry = registry;
	}
	if (cachedReloadRules) return cachedReloadRules;
	const channelReloadRules = listChannelPlugins().flatMap((plugin) => [...(plugin.reload?.configPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "hot",
		actions: [`restart-channel:${plugin.id}`]
	})), ...(plugin.reload?.noopPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "none"
	}))]);
	const rules = [
		...BASE_RELOAD_RULES,
		...channelReloadRules,
		...BASE_RELOAD_RULES_TAIL
	];
	cachedReloadRules = rules;
	return rules;
}
function matchRule(path) {
	for (const rule of listReloadRules()) if (path === rule.prefix || path.startsWith(`${rule.prefix}.`)) return rule;
	return null;
}
function diffConfigPaths(prev, next, prefix = "") {
	if (prev === next) return [];
	if (isPlainObject(prev) && isPlainObject(next)) {
		const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
		const paths = [];
		for (const key of keys) {
			const prevValue = prev[key];
			const nextValue = next[key];
			if (prevValue === void 0 && nextValue === void 0) continue;
			const childPaths = diffConfigPaths(prevValue, nextValue, prefix ? `${prefix}.${key}` : key);
			if (childPaths.length > 0) paths.push(...childPaths);
		}
		return paths;
	}
	if (Array.isArray(prev) && Array.isArray(next)) {
		if (prev.length === next.length && prev.every((val, idx) => val === next[idx])) return [];
	}
	return [prefix || "<root>"];
}
function resolveGatewayReloadSettings(cfg) {
	const rawMode = cfg.gateway?.reload?.mode;
	const mode = rawMode === "off" || rawMode === "restart" || rawMode === "hot" || rawMode === "hybrid" ? rawMode : DEFAULT_RELOAD_SETTINGS.mode;
	const debounceRaw = cfg.gateway?.reload?.debounceMs;
	return {
		mode,
		debounceMs: typeof debounceRaw === "number" && Number.isFinite(debounceRaw) ? Math.max(0, Math.floor(debounceRaw)) : DEFAULT_RELOAD_SETTINGS.debounceMs
	};
}
function buildGatewayReloadPlan(changedPaths) {
	const plan = {
		changedPaths,
		restartGateway: false,
		restartReasons: [],
		hotReasons: [],
		reloadHooks: false,
		restartGmailWatcher: false,
		restartBrowserControl: false,
		restartCron: false,
		restartHeartbeat: false,
		restartChannels: /* @__PURE__ */ new Set(),
		noopPaths: []
	};
	const applyAction = (action) => {
		if (action.startsWith("restart-channel:")) {
			const channel = action.slice(16);
			plan.restartChannels.add(channel);
			return;
		}
		switch (action) {
			case "reload-hooks":
				plan.reloadHooks = true;
				break;
			case "restart-gmail-watcher":
				plan.restartGmailWatcher = true;
				break;
			case "restart-browser-control":
				plan.restartBrowserControl = true;
				break;
			case "restart-cron":
				plan.restartCron = true;
				break;
			case "restart-heartbeat":
				plan.restartHeartbeat = true;
				break;
			default: break;
		}
	};
	for (const path of changedPaths) {
		const rule = matchRule(path);
		if (!rule) {
			plan.restartGateway = true;
			plan.restartReasons.push(path);
			continue;
		}
		if (rule.kind === "restart") {
			plan.restartGateway = true;
			plan.restartReasons.push(path);
			continue;
		}
		if (rule.kind === "none") {
			plan.noopPaths.push(path);
			continue;
		}
		plan.hotReasons.push(path);
		for (const action of rule.actions ?? []) applyAction(action);
	}
	if (plan.restartGmailWatcher) plan.reloadHooks = true;
	return plan;
}
function startGatewayConfigReloader(opts) {
	let currentConfig = opts.initialConfig;
	let settings = resolveGatewayReloadSettings(currentConfig);
	let debounceTimer = null;
	let pending = false;
	let running = false;
	let stopped = false;
	let restartQueued = false;
	const schedule = () => {
		if (stopped) return;
		if (debounceTimer) clearTimeout(debounceTimer);
		const wait = settings.debounceMs;
		debounceTimer = setTimeout(() => {
			runReload();
		}, wait);
	};
	const runReload = async () => {
		if (stopped) return;
		if (running) {
			pending = true;
			return;
		}
		running = true;
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		try {
			const snapshot = await opts.readSnapshot();
			if (!snapshot.valid) {
				const issues = snapshot.issues.map((issue) => `${issue.path}: ${issue.message}`).join(", ");
				opts.log.warn(`config reload skipped (invalid config): ${issues}`);
				return;
			}
			const nextConfig = snapshot.config;
			const changedPaths = diffConfigPaths(currentConfig, nextConfig);
			currentConfig = nextConfig;
			settings = resolveGatewayReloadSettings(nextConfig);
			if (changedPaths.length === 0) return;
			opts.log.info(`config change detected; evaluating reload (${changedPaths.join(", ")})`);
			const plan = buildGatewayReloadPlan(changedPaths);
			if (settings.mode === "off") {
				opts.log.info("config reload disabled (gateway.reload.mode=off)");
				return;
			}
			if (settings.mode === "restart") {
				if (!restartQueued) {
					restartQueued = true;
					opts.onRestart(plan, nextConfig);
				}
				return;
			}
			if (plan.restartGateway) {
				if (settings.mode === "hot") {
					opts.log.warn(`config reload requires gateway restart; hot mode ignoring (${plan.restartReasons.join(", ")})`);
					return;
				}
				if (!restartQueued) {
					restartQueued = true;
					opts.onRestart(plan, nextConfig);
				}
				return;
			}
			await opts.onHotReload(plan, nextConfig);
		} catch (err) {
			opts.log.error(`config reload failed: ${String(err)}`);
		} finally {
			running = false;
			if (pending) {
				pending = false;
				schedule();
			}
		}
	};
	const watcher = chokidar.watch(opts.watchPath, {
		ignoreInitial: true,
		awaitWriteFinish: {
			stabilityThreshold: 200,
			pollInterval: 50
		},
		usePolling: Boolean(process.env.VITEST)
	});
	watcher.on("add", schedule);
	watcher.on("change", schedule);
	watcher.on("unlink", schedule);
	let watcherClosed = false;
	watcher.on("error", (err) => {
		if (watcherClosed) return;
		watcherClosed = true;
		opts.log.warn(`config watcher error: ${String(err)}`);
		watcher.close().catch(() => {});
	});
	return { stop: async () => {
		stopped = true;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = null;
		watcherClosed = true;
		await watcher.close().catch(() => {});
	} };
}

//#endregion
//#region src/gateway/exec-approval-manager.ts
const RESOLVED_ENTRY_GRACE_MS = 15e3;
var ExecApprovalManager = class {
	constructor() {
		this.pending = /* @__PURE__ */ new Map();
	}
	create(request, timeoutMs, id) {
		const now = Date.now();
		return {
			id: id && id.trim().length > 0 ? id.trim() : randomUUID(),
			request,
			createdAtMs: now,
			expiresAtMs: now + timeoutMs
		};
	}
	/**
	* Register an approval record and return a promise that resolves when the decision is made.
	* This separates registration (synchronous) from waiting (async), allowing callers to
	* confirm registration before the decision is made.
	*/
	register(record, timeoutMs) {
		const existing = this.pending.get(record.id);
		if (existing) {
			if (existing.record.resolvedAtMs === void 0) return existing.promise;
			throw new Error(`approval id '${record.id}' already resolved`);
		}
		let resolvePromise;
		let rejectPromise;
		const promise = new Promise((resolve, reject) => {
			resolvePromise = resolve;
			rejectPromise = reject;
		});
		const entry = {
			record,
			resolve: resolvePromise,
			reject: rejectPromise,
			timer: null,
			promise
		};
		entry.timer = setTimeout(() => {
			record.resolvedAtMs = Date.now();
			record.decision = void 0;
			record.resolvedBy = null;
			resolvePromise(null);
			setTimeout(() => {
				if (this.pending.get(record.id) === entry) this.pending.delete(record.id);
			}, RESOLVED_ENTRY_GRACE_MS);
		}, timeoutMs);
		this.pending.set(record.id, entry);
		return promise;
	}
	/**
	* @deprecated Use register() instead for explicit separation of registration and waiting.
	*/
	async waitForDecision(record, timeoutMs) {
		return this.register(record, timeoutMs);
	}
	resolve(recordId, decision, resolvedBy) {
		const pending = this.pending.get(recordId);
		if (!pending) return false;
		if (pending.record.resolvedAtMs !== void 0) return false;
		clearTimeout(pending.timer);
		pending.record.resolvedAtMs = Date.now();
		pending.record.decision = decision;
		pending.record.resolvedBy = resolvedBy ?? null;
		pending.resolve(decision);
		setTimeout(() => {
			if (this.pending.get(recordId) === pending) this.pending.delete(recordId);
		}, RESOLVED_ENTRY_GRACE_MS);
		return true;
	}
	getSnapshot(recordId) {
		return this.pending.get(recordId)?.record ?? null;
	}
	/**
	* Wait for decision on an already-registered approval.
	* Returns the decision promise if the ID is pending, null otherwise.
	*/
	awaitDecision(recordId) {
		return this.pending.get(recordId)?.promise ?? null;
	}
};

//#endregion
//#region src/gateway/node-registry.ts
var NodeRegistry = class {
	constructor() {
		this.nodesById = /* @__PURE__ */ new Map();
		this.nodesByConn = /* @__PURE__ */ new Map();
		this.pendingInvokes = /* @__PURE__ */ new Map();
	}
	register(client, opts) {
		const connect = client.connect;
		const nodeId = connect.device?.id ?? connect.client.id;
		const caps = Array.isArray(connect.caps) ? connect.caps : [];
		const commands = Array.isArray(connect.commands) ? connect.commands ?? [] : [];
		const permissions = typeof connect.permissions === "object" ? connect.permissions ?? void 0 : void 0;
		const pathEnv = typeof connect.pathEnv === "string" ? connect.pathEnv : void 0;
		const session = {
			nodeId,
			connId: client.connId,
			client,
			displayName: connect.client.displayName,
			platform: connect.client.platform,
			version: connect.client.version,
			coreVersion: connect.coreVersion,
			uiVersion: connect.uiVersion,
			deviceFamily: connect.client.deviceFamily,
			modelIdentifier: connect.client.modelIdentifier,
			remoteIp: opts.remoteIp,
			caps,
			commands,
			permissions,
			pathEnv,
			connectedAtMs: Date.now()
		};
		this.nodesById.set(nodeId, session);
		this.nodesByConn.set(client.connId, nodeId);
		return session;
	}
	unregister(connId) {
		const nodeId = this.nodesByConn.get(connId);
		if (!nodeId) return null;
		this.nodesByConn.delete(connId);
		this.nodesById.delete(nodeId);
		for (const [id, pending] of this.pendingInvokes.entries()) {
			if (pending.nodeId !== nodeId) continue;
			clearTimeout(pending.timer);
			pending.reject(/* @__PURE__ */ new Error(`node disconnected (${pending.command})`));
			this.pendingInvokes.delete(id);
		}
		return nodeId;
	}
	listConnected() {
		return [...this.nodesById.values()];
	}
	get(nodeId) {
		return this.nodesById.get(nodeId);
	}
	async invoke(params) {
		const node = this.nodesById.get(params.nodeId);
		if (!node) return {
			ok: false,
			error: {
				code: "NOT_CONNECTED",
				message: "node not connected"
			}
		};
		const requestId = randomUUID();
		const payload = {
			id: requestId,
			nodeId: params.nodeId,
			command: params.command,
			paramsJSON: "params" in params && params.params !== void 0 ? JSON.stringify(params.params) : null,
			timeoutMs: params.timeoutMs,
			idempotencyKey: params.idempotencyKey
		};
		if (!this.sendEventToSession(node, "node.invoke.request", payload)) return {
			ok: false,
			error: {
				code: "UNAVAILABLE",
				message: "failed to send invoke to node"
			}
		};
		const timeoutMs = typeof params.timeoutMs === "number" ? params.timeoutMs : 3e4;
		return await new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pendingInvokes.delete(requestId);
				resolve({
					ok: false,
					error: {
						code: "TIMEOUT",
						message: "node invoke timed out"
					}
				});
			}, timeoutMs);
			this.pendingInvokes.set(requestId, {
				nodeId: params.nodeId,
				command: params.command,
				resolve,
				reject,
				timer
			});
		});
	}
	handleInvokeResult(params) {
		const pending = this.pendingInvokes.get(params.id);
		if (!pending) return false;
		if (pending.nodeId !== params.nodeId) return false;
		clearTimeout(pending.timer);
		this.pendingInvokes.delete(params.id);
		pending.resolve({
			ok: params.ok,
			payload: params.payload,
			payloadJSON: params.payloadJSON ?? null,
			error: params.error ?? null
		});
		return true;
	}
	sendEvent(nodeId, event, payload) {
		const node = this.nodesById.get(nodeId);
		if (!node) return false;
		return this.sendEventToSession(node, event, payload);
	}
	sendEventInternal(node, event, payload) {
		try {
			node.client.socket.send(JSON.stringify({
				type: "event",
				event,
				payload
			}));
			return true;
		} catch {
			return false;
		}
	}
	sendEventToSession(node, event, payload) {
		return this.sendEventInternal(node, event, payload);
	}
};

//#endregion
//#region src/gateway/server-channels.ts
function createRuntimeStore() {
	return {
		aborts: /* @__PURE__ */ new Map(),
		tasks: /* @__PURE__ */ new Map(),
		runtimes: /* @__PURE__ */ new Map()
	};
}
function isAccountEnabled(account) {
	if (!account || typeof account !== "object") return true;
	return account.enabled !== false;
}
function resolveDefaultRuntime(channelId) {
	return getChannelPlugin(channelId)?.status?.defaultRuntime ?? { accountId: DEFAULT_ACCOUNT_ID };
}
function cloneDefaultRuntime(channelId, accountId) {
	return {
		...resolveDefaultRuntime(channelId),
		accountId
	};
}
function createChannelManager(opts) {
	const { loadConfig, channelLogs, channelRuntimeEnvs } = opts;
	const channelStores = /* @__PURE__ */ new Map();
	const getStore = (channelId) => {
		const existing = channelStores.get(channelId);
		if (existing) return existing;
		const next = createRuntimeStore();
		channelStores.set(channelId, next);
		return next;
	};
	const getRuntime = (channelId, accountId) => {
		return getStore(channelId).runtimes.get(accountId) ?? cloneDefaultRuntime(channelId, accountId);
	};
	const setRuntime = (channelId, accountId, patch) => {
		const store = getStore(channelId);
		const next = {
			...getRuntime(channelId, accountId),
			...patch,
			accountId
		};
		store.runtimes.set(accountId, next);
		return next;
	};
	const startChannel = async (channelId, accountId) => {
		const plugin = getChannelPlugin(channelId);
		const startAccount = plugin?.gateway?.startAccount;
		if (!startAccount) return;
		const cfg = loadConfig();
		resetDirectoryCache({
			channel: channelId,
			accountId
		});
		const store = getStore(channelId);
		const accountIds = accountId ? [accountId] : plugin.config.listAccountIds(cfg);
		if (accountIds.length === 0) return;
		await Promise.all(accountIds.map(async (id) => {
			if (store.tasks.has(id)) return;
			const account = plugin.config.resolveAccount(cfg, id);
			if (!(plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : isAccountEnabled(account))) {
				setRuntime(channelId, id, {
					accountId: id,
					running: false,
					lastError: plugin.config.disabledReason?.(account, cfg) ?? "disabled"
				});
				return;
			}
			let configured = true;
			if (plugin.config.isConfigured) configured = await plugin.config.isConfigured(account, cfg);
			if (!configured) {
				setRuntime(channelId, id, {
					accountId: id,
					running: false,
					lastError: plugin.config.unconfiguredReason?.(account, cfg) ?? "not configured"
				});
				return;
			}
			const abort = new AbortController();
			store.aborts.set(id, abort);
			setRuntime(channelId, id, {
				accountId: id,
				running: true,
				lastStartAt: Date.now(),
				lastError: null
			});
			const log = channelLogs[channelId];
			const task = startAccount({
				cfg,
				accountId: id,
				account,
				runtime: channelRuntimeEnvs[channelId],
				abortSignal: abort.signal,
				log,
				getStatus: () => getRuntime(channelId, id),
				setStatus: (next) => setRuntime(channelId, id, next)
			});
			const tracked = Promise.resolve(task).catch((err) => {
				const message = formatErrorMessage(err);
				setRuntime(channelId, id, {
					accountId: id,
					lastError: message
				});
				log.error?.(`[${id}] channel exited: ${message}`);
			}).finally(() => {
				store.aborts.delete(id);
				store.tasks.delete(id);
				setRuntime(channelId, id, {
					accountId: id,
					running: false,
					lastStopAt: Date.now()
				});
			});
			store.tasks.set(id, tracked);
		}));
	};
	const stopChannel = async (channelId, accountId) => {
		const plugin = getChannelPlugin(channelId);
		const store = getStore(channelId);
		if (!plugin?.gateway?.stopAccount && store.aborts.size === 0 && store.tasks.size === 0) return;
		const cfg = loadConfig();
		const knownIds = new Set([
			...store.aborts.keys(),
			...store.tasks.keys(),
			...plugin ? plugin.config.listAccountIds(cfg) : []
		]);
		if (accountId) {
			knownIds.clear();
			knownIds.add(accountId);
		}
		await Promise.all(Array.from(knownIds.values()).map(async (id) => {
			const abort = store.aborts.get(id);
			const task = store.tasks.get(id);
			if (!abort && !task && !plugin?.gateway?.stopAccount) return;
			abort?.abort();
			if (plugin?.gateway?.stopAccount) {
				const account = plugin.config.resolveAccount(cfg, id);
				await plugin.gateway.stopAccount({
					cfg,
					accountId: id,
					account,
					runtime: channelRuntimeEnvs[channelId],
					abortSignal: abort?.signal ?? new AbortController().signal,
					log: channelLogs[channelId],
					getStatus: () => getRuntime(channelId, id),
					setStatus: (next) => setRuntime(channelId, id, next)
				});
			}
			try {
				await task;
			} catch {}
			store.aborts.delete(id);
			store.tasks.delete(id);
			setRuntime(channelId, id, {
				accountId: id,
				running: false,
				lastStopAt: Date.now()
			});
		}));
	};
	const startChannels = async () => {
		for (const plugin of listChannelPlugins()) await startChannel(plugin.id);
	};
	const markChannelLoggedOut = (channelId, cleared, accountId) => {
		const plugin = getChannelPlugin(channelId);
		if (!plugin) return;
		const cfg = loadConfig();
		const resolvedId = accountId ?? resolveChannelDefaultAccountId({
			plugin,
			cfg
		});
		const current = getRuntime(channelId, resolvedId);
		const next = {
			accountId: resolvedId,
			running: false,
			lastError: cleared ? "logged out" : current.lastError
		};
		if (typeof current.connected === "boolean") next.connected = false;
		setRuntime(channelId, resolvedId, next);
	};
	const getRuntimeSnapshot = () => {
		const cfg = loadConfig();
		const channels = {};
		const channelAccounts = {};
		for (const plugin of listChannelPlugins()) {
			const store = getStore(plugin.id);
			const accountIds = plugin.config.listAccountIds(cfg);
			const defaultAccountId = resolveChannelDefaultAccountId({
				plugin,
				cfg,
				accountIds
			});
			const accounts = {};
			for (const id of accountIds) {
				const account = plugin.config.resolveAccount(cfg, id);
				const enabled = plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : isAccountEnabled(account);
				const configured = (plugin.config.describeAccount?.(account, cfg))?.configured;
				const next = {
					...store.runtimes.get(id) ?? cloneDefaultRuntime(plugin.id, id),
					accountId: id
				};
				if (!next.running) {
					if (!enabled) next.lastError ??= plugin.config.disabledReason?.(account, cfg) ?? "disabled";
					else if (configured === false) next.lastError ??= plugin.config.unconfiguredReason?.(account, cfg) ?? "not configured";
				}
				accounts[id] = next;
			}
			const defaultAccount = accounts[defaultAccountId] ?? cloneDefaultRuntime(plugin.id, defaultAccountId);
			channels[plugin.id] = defaultAccount;
			channelAccounts[plugin.id] = accounts;
		}
		return {
			channels,
			channelAccounts
		};
	};
	return {
		getRuntimeSnapshot,
		startChannels,
		startChannel,
		stopChannel,
		markChannelLoggedOut
	};
}

//#endregion
//#region src/gateway/server-chat.ts
/**
* Check if webchat broadcasts should be suppressed for heartbeat runs.
* Returns true if the run is a heartbeat and showOk is false.
*/
function shouldSuppressHeartbeatBroadcast(runId) {
	if (!getAgentRunContext(runId)?.isHeartbeat) return false;
	try {
		return !resolveHeartbeatVisibility({
			cfg: loadConfig(),
			channel: "webchat"
		}).showOk;
	} catch {
		return true;
	}
}
function createChatRunRegistry() {
	const chatRunSessions = /* @__PURE__ */ new Map();
	const add = (sessionId, entry) => {
		const queue = chatRunSessions.get(sessionId);
		if (queue) queue.push(entry);
		else chatRunSessions.set(sessionId, [entry]);
	};
	const peek = (sessionId) => chatRunSessions.get(sessionId)?.[0];
	const shift = (sessionId) => {
		const queue = chatRunSessions.get(sessionId);
		if (!queue || queue.length === 0) return;
		const entry = queue.shift();
		if (!queue.length) chatRunSessions.delete(sessionId);
		return entry;
	};
	const remove = (sessionId, clientRunId, sessionKey) => {
		const queue = chatRunSessions.get(sessionId);
		if (!queue || queue.length === 0) return;
		const idx = queue.findIndex((entry) => entry.clientRunId === clientRunId && (sessionKey ? entry.sessionKey === sessionKey : true));
		if (idx < 0) return;
		const [entry] = queue.splice(idx, 1);
		if (!queue.length) chatRunSessions.delete(sessionId);
		return entry;
	};
	const clear = () => {
		chatRunSessions.clear();
	};
	return {
		add,
		peek,
		shift,
		remove,
		clear
	};
}
function createChatRunState() {
	const registry = createChatRunRegistry();
	const buffers = /* @__PURE__ */ new Map();
	const deltaSentAt = /* @__PURE__ */ new Map();
	const abortedRuns = /* @__PURE__ */ new Map();
	const clear = () => {
		registry.clear();
		buffers.clear();
		deltaSentAt.clear();
		abortedRuns.clear();
	};
	return {
		registry,
		buffers,
		deltaSentAt,
		abortedRuns,
		clear
	};
}
const TOOL_EVENT_RECIPIENT_TTL_MS = 600 * 1e3;
const TOOL_EVENT_RECIPIENT_FINAL_GRACE_MS = 30 * 1e3;
function createToolEventRecipientRegistry() {
	const recipients = /* @__PURE__ */ new Map();
	const prune = () => {
		if (recipients.size === 0) return;
		const now = Date.now();
		for (const [runId, entry] of recipients) if (now >= (entry.finalizedAt ? entry.finalizedAt + TOOL_EVENT_RECIPIENT_FINAL_GRACE_MS : entry.updatedAt + TOOL_EVENT_RECIPIENT_TTL_MS)) recipients.delete(runId);
	};
	const add = (runId, connId) => {
		if (!runId || !connId) return;
		const now = Date.now();
		const existing = recipients.get(runId);
		if (existing) {
			existing.connIds.add(connId);
			existing.updatedAt = now;
		} else recipients.set(runId, {
			connIds: new Set([connId]),
			updatedAt: now
		});
		prune();
	};
	const get = (runId) => {
		const entry = recipients.get(runId);
		if (!entry) return;
		entry.updatedAt = Date.now();
		prune();
		return entry.connIds;
	};
	const markFinal = (runId) => {
		const entry = recipients.get(runId);
		if (!entry) return;
		entry.finalizedAt = Date.now();
		prune();
	};
	return {
		add,
		get,
		markFinal
	};
}
function createAgentEventHandler({ broadcast, broadcastToConnIds, nodeSendToSession, agentRunSeq, chatRunState, resolveSessionKeyForRun, clearAgentRunContext, toolEventRecipients }) {
	const emitChatDelta = (sessionKey, clientRunId, seq, text) => {
		chatRunState.buffers.set(clientRunId, text);
		const now = Date.now();
		if (now - (chatRunState.deltaSentAt.get(clientRunId) ?? 0) < 150) return;
		chatRunState.deltaSentAt.set(clientRunId, now);
		const payload = {
			runId: clientRunId,
			sessionKey,
			seq,
			state: "delta",
			message: {
				role: "assistant",
				content: [{
					type: "text",
					text
				}],
				timestamp: now
			}
		};
		if (!shouldSuppressHeartbeatBroadcast(clientRunId)) broadcast("chat", payload, { dropIfSlow: true });
		nodeSendToSession(sessionKey, "chat", payload);
	};
	const emitChatFinal = (sessionKey, clientRunId, seq, jobState, error) => {
		const text = chatRunState.buffers.get(clientRunId)?.trim() ?? "";
		chatRunState.buffers.delete(clientRunId);
		chatRunState.deltaSentAt.delete(clientRunId);
		if (jobState === "done") {
			const payload = {
				runId: clientRunId,
				sessionKey,
				seq,
				state: "final",
				message: text ? {
					role: "assistant",
					content: [{
						type: "text",
						text
					}],
					timestamp: Date.now()
				} : void 0
			};
			if (!shouldSuppressHeartbeatBroadcast(clientRunId)) broadcast("chat", payload);
			nodeSendToSession(sessionKey, "chat", payload);
			return;
		}
		const payload = {
			runId: clientRunId,
			sessionKey,
			seq,
			state: "error",
			errorMessage: error ? formatForLog(error) : void 0
		};
		broadcast("chat", payload);
		nodeSendToSession(sessionKey, "chat", payload);
	};
	const resolveToolVerboseLevel = (runId, sessionKey) => {
		const runVerbose = normalizeVerboseLevel(getAgentRunContext(runId)?.verboseLevel);
		if (runVerbose) return runVerbose;
		if (!sessionKey) return "off";
		try {
			const { cfg, entry } = loadSessionEntry(sessionKey);
			const sessionVerbose = normalizeVerboseLevel(entry?.verboseLevel);
			if (sessionVerbose) return sessionVerbose;
			return normalizeVerboseLevel(cfg.agents?.defaults?.verboseDefault) ?? "off";
		} catch {
			return "off";
		}
	};
	return (evt) => {
		const chatLink = chatRunState.registry.peek(evt.runId);
		const sessionKey = chatLink?.sessionKey ?? resolveSessionKeyForRun(evt.runId);
		const clientRunId = chatLink?.clientRunId ?? evt.runId;
		const isAborted = chatRunState.abortedRuns.has(clientRunId) || chatRunState.abortedRuns.has(evt.runId);
		const agentPayload = sessionKey ? {
			...evt,
			sessionKey
		} : evt;
		const last = agentRunSeq.get(evt.runId) ?? 0;
		const isToolEvent = evt.stream === "tool";
		const toolVerbose = isToolEvent ? resolveToolVerboseLevel(evt.runId, sessionKey) : "off";
		const toolPayload = isToolEvent && toolVerbose !== "full" ? (() => {
			const data = evt.data ? { ...evt.data } : {};
			delete data.result;
			delete data.partialResult;
			return sessionKey ? {
				...evt,
				sessionKey,
				data
			} : {
				...evt,
				data
			};
		})() : agentPayload;
		if (evt.seq !== last + 1) broadcast("agent", {
			runId: evt.runId,
			stream: "error",
			ts: Date.now(),
			sessionKey,
			data: {
				reason: "seq gap",
				expected: last + 1,
				received: evt.seq
			}
		});
		agentRunSeq.set(evt.runId, evt.seq);
		if (isToolEvent) {
			const recipients = toolEventRecipients.get(evt.runId);
			if (recipients && recipients.size > 0) broadcastToConnIds("agent", toolPayload, recipients);
		} else broadcast("agent", agentPayload);
		const lifecyclePhase = evt.stream === "lifecycle" && typeof evt.data?.phase === "string" ? evt.data.phase : null;
		if (sessionKey) {
			if (!isToolEvent || toolVerbose !== "off") nodeSendToSession(sessionKey, "agent", isToolEvent ? toolPayload : agentPayload);
			if (!isAborted && evt.stream === "assistant" && typeof evt.data?.text === "string") emitChatDelta(sessionKey, clientRunId, evt.seq, evt.data.text);
			else if (!isAborted && (lifecyclePhase === "end" || lifecyclePhase === "error")) if (chatLink) {
				const finished = chatRunState.registry.shift(evt.runId);
				if (!finished) {
					clearAgentRunContext(evt.runId);
					return;
				}
				emitChatFinal(finished.sessionKey, finished.clientRunId, evt.seq, lifecyclePhase === "error" ? "error" : "done", evt.data?.error);
			} else emitChatFinal(sessionKey, evt.runId, evt.seq, lifecyclePhase === "error" ? "error" : "done", evt.data?.error);
			else if (isAborted && (lifecyclePhase === "end" || lifecyclePhase === "error")) {
				chatRunState.abortedRuns.delete(clientRunId);
				chatRunState.abortedRuns.delete(evt.runId);
				chatRunState.buffers.delete(clientRunId);
				chatRunState.deltaSentAt.delete(clientRunId);
				if (chatLink) chatRunState.registry.remove(evt.runId, clientRunId, sessionKey);
			}
		}
		if (lifecyclePhase === "end" || lifecyclePhase === "error") {
			toolEventRecipients.markFinal(evt.runId);
			clearAgentRunContext(evt.runId);
		}
	};
}

//#endregion
//#region src/hooks/gmail-watcher.ts
/**
* Gmail Watcher Service
*
* Automatically starts `gog gmail watch serve` when the gateway starts,
* if hooks.gmail is configured with an account.
*/
const log$5 = createSubsystemLogger("gmail-watcher");
const ADDRESS_IN_USE_RE = /address already in use|EADDRINUSE/i;
function isAddressInUseError(line) {
	return ADDRESS_IN_USE_RE.test(line);
}
let watcherProcess = null;
let renewInterval = null;
let shuttingDown = false;
let currentConfig = null;
/**
* Check if gog binary is available
*/
function isGogAvailable() {
	return hasBinary("gog");
}
/**
* Start the Gmail watch (registers with Gmail API)
*/
async function startGmailWatch(cfg) {
	const args = ["gog", ...buildGogWatchStartArgs(cfg)];
	try {
		const result = await runCommandWithTimeout(args, { timeoutMs: 12e4 });
		if (result.code !== 0) {
			const message = result.stderr || result.stdout || "gog watch start failed";
			log$5.error(`watch start failed: ${message}`);
			return false;
		}
		log$5.info(`watch started for ${cfg.account}`);
		return true;
	} catch (err) {
		log$5.error(`watch start error: ${String(err)}`);
		return false;
	}
}
/**
* Spawn the gog gmail watch serve process
*/
function spawnGogServe(cfg) {
	const args = buildGogWatchServeArgs(cfg);
	log$5.info(`starting gog ${args.join(" ")}`);
	let addressInUse = false;
	const child = spawn("gog", args, {
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		],
		detached: false
	});
	child.stdout?.on("data", (data) => {
		const line = data.toString().trim();
		if (line) log$5.info(`[gog] ${line}`);
	});
	child.stderr?.on("data", (data) => {
		const line = data.toString().trim();
		if (!line) return;
		if (isAddressInUseError(line)) addressInUse = true;
		log$5.warn(`[gog] ${line}`);
	});
	child.on("error", (err) => {
		log$5.error(`gog process error: ${String(err)}`);
	});
	child.on("exit", (code, signal) => {
		if (shuttingDown) return;
		if (addressInUse) {
			log$5.warn("gog serve failed to bind (address already in use); stopping restarts. Another watcher is likely running. Set OPENCLAW_SKIP_GMAIL_WATCHER=1 or stop the other process.");
			watcherProcess = null;
			return;
		}
		log$5.warn(`gog exited (code=${code}, signal=${signal}); restarting in 5s`);
		watcherProcess = null;
		setTimeout(() => {
			if (shuttingDown || !currentConfig) return;
			watcherProcess = spawnGogServe(currentConfig);
		}, 5e3);
	});
	return child;
}
/**
* Start the Gmail watcher service.
* Called automatically by the gateway if hooks.gmail is configured.
*/
async function startGmailWatcher(cfg) {
	if (!cfg.hooks?.enabled) return {
		started: false,
		reason: "hooks not enabled"
	};
	if (!cfg.hooks?.gmail?.account) return {
		started: false,
		reason: "no gmail account configured"
	};
	if (!isGogAvailable()) return {
		started: false,
		reason: "gog binary not found"
	};
	const resolved = resolveGmailHookRuntimeConfig(cfg, {});
	if (!resolved.ok) return {
		started: false,
		reason: resolved.error
	};
	const runtimeConfig = resolved.value;
	currentConfig = runtimeConfig;
	if (runtimeConfig.tailscale.mode !== "off") try {
		await ensureTailscaleEndpoint({
			mode: runtimeConfig.tailscale.mode,
			path: runtimeConfig.tailscale.path,
			port: runtimeConfig.serve.port,
			target: runtimeConfig.tailscale.target
		});
		log$5.info(`tailscale ${runtimeConfig.tailscale.mode} configured for port ${runtimeConfig.serve.port}`);
	} catch (err) {
		log$5.error(`tailscale setup failed: ${String(err)}`);
		return {
			started: false,
			reason: `tailscale setup failed: ${String(err)}`
		};
	}
	if (!await startGmailWatch(runtimeConfig)) log$5.warn("gmail watch start failed, but continuing with serve");
	shuttingDown = false;
	watcherProcess = spawnGogServe(runtimeConfig);
	const renewMs = runtimeConfig.renewEveryMinutes * 6e4;
	renewInterval = setInterval(() => {
		if (shuttingDown) return;
		startGmailWatch(runtimeConfig);
	}, renewMs);
	log$5.info(`gmail watcher started for ${runtimeConfig.account} (renew every ${runtimeConfig.renewEveryMinutes}m)`);
	return { started: true };
}
/**
* Stop the Gmail watcher service.
*/
async function stopGmailWatcher() {
	shuttingDown = true;
	if (renewInterval) {
		clearInterval(renewInterval);
		renewInterval = null;
	}
	if (watcherProcess) {
		log$5.info("stopping gmail watcher");
		watcherProcess.kill("SIGTERM");
		await new Promise((resolve) => {
			const timeout = setTimeout(() => {
				if (watcherProcess) watcherProcess.kill("SIGKILL");
				resolve();
			}, 3e3);
			watcherProcess?.on("exit", () => {
				clearTimeout(timeout);
				resolve();
			});
		});
		watcherProcess = null;
	}
	currentConfig = null;
	log$5.info("gmail watcher stopped");
}

//#endregion
//#region src/gateway/server-close.ts
function createGatewayCloseHandler(params) {
	return async (opts) => {
		const reason = (typeof opts?.reason === "string" ? opts.reason.trim() : "") || "gateway stopping";
		const restartExpectedMs = typeof opts?.restartExpectedMs === "number" && Number.isFinite(opts.restartExpectedMs) ? Math.max(0, Math.floor(opts.restartExpectedMs)) : null;
		if (params.bonjourStop) try {
			await params.bonjourStop();
		} catch {}
		if (params.tailscaleCleanup) await params.tailscaleCleanup();
		if (params.canvasHost) try {
			await params.canvasHost.close();
		} catch {}
		if (params.canvasHostServer) try {
			await params.canvasHostServer.close();
		} catch {}
		for (const plugin of listChannelPlugins()) await params.stopChannel(plugin.id);
		if (params.pluginServices) await params.pluginServices.stop().catch(() => {});
		await stopGmailWatcher();
		params.cron.stop();
		params.heartbeatRunner.stop();
		for (const timer of params.nodePresenceTimers.values()) clearInterval(timer);
		params.nodePresenceTimers.clear();
		params.broadcast("shutdown", {
			reason,
			restartExpectedMs
		});
		clearInterval(params.tickInterval);
		clearInterval(params.healthInterval);
		clearInterval(params.dedupeCleanup);
		if (params.agentUnsub) try {
			params.agentUnsub();
		} catch {}
		if (params.heartbeatUnsub) try {
			params.heartbeatUnsub();
		} catch {}
		params.chatRunState.clear();
		for (const c of params.clients) try {
			c.socket.close(1012, "service restart");
		} catch {}
		params.clients.clear();
		await params.configReloader.stop().catch(() => {});
		if (params.browserControl) await params.browserControl.stop().catch(() => {});
		await new Promise((resolve) => params.wss.close(() => resolve()));
		const servers = params.httpServers && params.httpServers.length > 0 ? params.httpServers : [params.httpServer];
		for (const server of servers) {
			const httpServer = server;
			if (typeof httpServer.closeIdleConnections === "function") httpServer.closeIdleConnections();
			await new Promise((resolve, reject) => httpServer.close((err) => err ? reject(err) : resolve()));
		}
	};
}

//#endregion
//#region src/cron/delivery.ts
function normalizeChannel(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim().toLowerCase();
	if (!trimmed) return;
	return trimmed;
}
function normalizeTo(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
function resolveCronDeliveryPlan(job) {
	const payload = job.payload.kind === "agentTurn" ? job.payload : null;
	const delivery = job.delivery;
	const hasDelivery = delivery && typeof delivery === "object";
	const rawMode = hasDelivery ? delivery.mode : void 0;
	const normalizedMode = typeof rawMode === "string" ? rawMode.trim().toLowerCase() : rawMode;
	const mode = normalizedMode === "announce" ? "announce" : normalizedMode === "none" ? "none" : normalizedMode === "deliver" ? "announce" : void 0;
	const payloadChannel = normalizeChannel(payload?.channel);
	const payloadTo = normalizeTo(payload?.to);
	const deliveryChannel = normalizeChannel(delivery?.channel);
	const deliveryTo = normalizeTo(delivery?.to);
	const channel = deliveryChannel ?? payloadChannel ?? "last";
	const to = deliveryTo ?? payloadTo;
	if (hasDelivery) {
		const resolvedMode = mode ?? "announce";
		return {
			mode: resolvedMode,
			channel,
			to,
			source: "delivery",
			requested: resolvedMode === "announce"
		};
	}
	const legacyMode = payload?.deliver === true ? "explicit" : payload?.deliver === false ? "off" : "auto";
	const requested = legacyMode === "explicit" || legacyMode === "auto" && Boolean(to);
	return {
		mode: requested ? "announce" : "none",
		channel,
		to,
		source: "payload",
		requested
	};
}

//#endregion
//#region src/cron/isolated-agent/delivery-target.ts
async function resolveDeliveryTarget(cfg, agentId, jobPayload) {
	const requestedChannel = typeof jobPayload.channel === "string" ? jobPayload.channel : "last";
	const explicitTo = typeof jobPayload.to === "string" ? jobPayload.to : void 0;
	const allowMismatchedLastTo = requestedChannel === "last";
	const sessionCfg = cfg.session;
	const mainSessionKey = resolveAgentMainSessionKey({
		cfg,
		agentId
	});
	const main = loadSessionStore(resolveStorePath(sessionCfg?.store, { agentId }))[mainSessionKey];
	const preliminary = resolveSessionDeliveryTarget({
		entry: main,
		requestedChannel,
		explicitTo,
		allowMismatchedLastTo
	});
	let fallbackChannel;
	if (!preliminary.channel) try {
		fallbackChannel = (await resolveMessageChannelSelection({ cfg })).channel;
	} catch {
		fallbackChannel = preliminary.lastChannel ?? DEFAULT_CHAT_CHANNEL;
	}
	const resolved = fallbackChannel ? resolveSessionDeliveryTarget({
		entry: main,
		requestedChannel,
		explicitTo,
		fallbackChannel,
		allowMismatchedLastTo,
		mode: preliminary.mode
	}) : preliminary;
	const channel = resolved.channel ?? fallbackChannel ?? DEFAULT_CHAT_CHANNEL;
	const mode = resolved.mode;
	const toCandidate = resolved.to;
	const threadId = resolved.threadId && resolved.to && resolved.to === resolved.lastTo ? resolved.threadId : void 0;
	if (!toCandidate) return {
		channel,
		to: void 0,
		accountId: resolved.accountId,
		threadId,
		mode
	};
	const docked = resolveOutboundTarget({
		channel,
		to: toCandidate,
		cfg,
		accountId: resolved.accountId,
		mode
	});
	return {
		channel,
		to: docked.ok ? docked.to : void 0,
		accountId: resolved.accountId,
		threadId,
		mode,
		error: docked.ok ? void 0 : docked.error
	};
}

//#endregion
//#region src/cron/isolated-agent/helpers.ts
function pickSummaryFromOutput(text) {
	const clean = (text ?? "").trim();
	if (!clean) return;
	const limit = 2e3;
	return clean.length > limit ? `${truncateUtf16Safe(clean, limit)}…` : clean;
}
function pickSummaryFromPayloads(payloads) {
	for (let i = payloads.length - 1; i >= 0; i--) {
		const summary = pickSummaryFromOutput(payloads[i]?.text);
		if (summary) return summary;
	}
}
function pickLastNonEmptyTextFromPayloads(payloads) {
	for (let i = payloads.length - 1; i >= 0; i--) {
		const clean = (payloads[i]?.text ?? "").trim();
		if (clean) return clean;
	}
}
function pickLastDeliverablePayload(payloads) {
	for (let i = payloads.length - 1; i >= 0; i--) {
		const payload = payloads[i];
		const text = (payload?.text ?? "").trim();
		const hasMedia = Boolean(payload?.mediaUrl) || (payload?.mediaUrls?.length ?? 0) > 0;
		const hasChannelData = Object.keys(payload?.channelData ?? {}).length > 0;
		if (text || hasMedia || hasChannelData) return payload;
	}
}
/**
* Check if all payloads are just heartbeat ack responses (HEARTBEAT_OK).
* Returns true if delivery should be skipped because there's no real content.
*/
function isHeartbeatOnlyResponse(payloads, ackMaxChars) {
	if (payloads.length === 0) return true;
	return payloads.every((payload) => {
		if ((payload.mediaUrls?.length ?? 0) > 0 || Boolean(payload.mediaUrl)) return false;
		return stripHeartbeatToken(payload.text, {
			mode: "heartbeat",
			maxAckChars: ackMaxChars
		}).shouldSkip;
	});
}
function resolveHeartbeatAckMaxChars(agentCfg) {
	const raw = agentCfg?.heartbeat?.ackMaxChars ?? DEFAULT_HEARTBEAT_ACK_MAX_CHARS;
	return Math.max(0, raw);
}

//#endregion
//#region src/cron/isolated-agent/session.ts
function resolveCronSession(params) {
	const sessionCfg = params.cfg.session;
	const storePath = resolveStorePath(sessionCfg?.store, { agentId: params.agentId });
	const store = loadSessionStore(storePath);
	const entry = store[params.sessionKey];
	const sessionId = crypto.randomUUID();
	const systemSent = false;
	return {
		storePath,
		store,
		sessionEntry: {
			sessionId,
			updatedAt: params.nowMs,
			systemSent,
			thinkingLevel: entry?.thinkingLevel,
			verboseLevel: entry?.verboseLevel,
			model: entry?.model,
			modelOverride: entry?.modelOverride,
			providerOverride: entry?.providerOverride,
			contextTokens: entry?.contextTokens,
			sendPolicy: entry?.sendPolicy,
			lastChannel: entry?.lastChannel,
			lastTo: entry?.lastTo,
			lastAccountId: entry?.lastAccountId,
			label: entry?.label,
			displayName: entry?.displayName,
			skillsSnapshot: entry?.skillsSnapshot
		},
		systemSent,
		isNewSession: true
	};
}

//#endregion
//#region src/cron/isolated-agent/run.ts
function matchesMessagingToolDeliveryTarget(target, delivery) {
	if (!delivery.to || !target.to) return false;
	const channel = delivery.channel.trim().toLowerCase();
	const provider = target.provider?.trim().toLowerCase();
	if (provider && provider !== "message" && provider !== channel) return false;
	if (target.accountId && delivery.accountId && target.accountId !== delivery.accountId) return false;
	return target.to === delivery.to;
}
function resolveCronDeliveryBestEffort(job) {
	if (typeof job.delivery?.bestEffort === "boolean") return job.delivery.bestEffort;
	if (job.payload.kind === "agentTurn" && typeof job.payload.bestEffortDeliver === "boolean") return job.payload.bestEffortDeliver;
	return false;
}
async function runCronIsolatedAgentTurn(params) {
	const defaultAgentId = resolveDefaultAgentId(params.cfg);
	const requestedAgentId = typeof params.agentId === "string" && params.agentId.trim() ? params.agentId : typeof params.job.agentId === "string" && params.job.agentId.trim() ? params.job.agentId : void 0;
	const normalizedRequested = requestedAgentId ? normalizeAgentId(requestedAgentId) : void 0;
	const { model: overrideModel, ...agentOverrideRest } = (normalizedRequested ? resolveAgentConfig(params.cfg, normalizedRequested) : void 0) ?? {};
	const agentId = normalizedRequested ?? defaultAgentId;
	const agentCfg = Object.assign({}, params.cfg.agents?.defaults, agentOverrideRest);
	if (typeof overrideModel === "string") agentCfg.model = { primary: overrideModel };
	else if (overrideModel) agentCfg.model = overrideModel;
	const cfgWithAgentDefaults = {
		...params.cfg,
		agents: Object.assign({}, params.cfg.agents, { defaults: agentCfg })
	};
	const baseSessionKey = (params.sessionKey?.trim() || `cron:${params.job.id}`).trim();
	const agentSessionKey = buildAgentMainSessionKey({
		agentId,
		mainKey: baseSessionKey
	});
	const workspaceDirRaw = resolveAgentWorkspaceDir(params.cfg, agentId);
	const agentDir = resolveAgentDir(params.cfg, agentId);
	const workspaceDir = (await ensureAgentWorkspace({
		dir: workspaceDirRaw,
		ensureBootstrapFiles: !agentCfg?.skipBootstrap
	})).dir;
	const resolvedDefault = resolveConfiguredModelRef({
		cfg: cfgWithAgentDefaults,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	let provider = resolvedDefault.provider;
	let model = resolvedDefault.model;
	let catalog;
	const loadCatalog = async () => {
		if (!catalog) catalog = await loadModelCatalog({ config: cfgWithAgentDefaults });
		return catalog;
	};
	const isGmailHook = baseSessionKey.startsWith("hook:gmail:");
	let hooksGmailModelApplied = false;
	const hooksGmailModelRef = isGmailHook ? resolveHooksGmailModel({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	}) : null;
	if (hooksGmailModelRef) {
		if (getModelRefStatus({
			cfg: params.cfg,
			catalog: await loadCatalog(),
			ref: hooksGmailModelRef,
			defaultProvider: resolvedDefault.provider,
			defaultModel: resolvedDefault.model
		}).allowed) {
			provider = hooksGmailModelRef.provider;
			model = hooksGmailModelRef.model;
			hooksGmailModelApplied = true;
		}
	}
	const modelOverrideRaw = params.job.payload.kind === "agentTurn" ? params.job.payload.model : void 0;
	const modelOverride = typeof modelOverrideRaw === "string" ? modelOverrideRaw.trim() : void 0;
	if (modelOverride !== void 0 && modelOverride.length > 0) {
		const resolvedOverride = resolveAllowedModelRef({
			cfg: cfgWithAgentDefaults,
			catalog: await loadCatalog(),
			raw: modelOverride,
			defaultProvider: resolvedDefault.provider,
			defaultModel: resolvedDefault.model
		});
		if ("error" in resolvedOverride) return {
			status: "error",
			error: resolvedOverride.error
		};
		provider = resolvedOverride.ref.provider;
		model = resolvedOverride.ref.model;
	}
	const now = Date.now();
	const cronSession = resolveCronSession({
		cfg: params.cfg,
		sessionKey: agentSessionKey,
		agentId,
		nowMs: now
	});
	const runSessionId = cronSession.sessionEntry.sessionId;
	const runSessionKey = baseSessionKey.startsWith("cron:") ? `${agentSessionKey}:run:${runSessionId}` : agentSessionKey;
	const persistSessionEntry = async () => {
		cronSession.store[agentSessionKey] = cronSession.sessionEntry;
		if (runSessionKey !== agentSessionKey) cronSession.store[runSessionKey] = cronSession.sessionEntry;
		await updateSessionStore(cronSession.storePath, (store) => {
			store[agentSessionKey] = cronSession.sessionEntry;
			if (runSessionKey !== agentSessionKey) store[runSessionKey] = cronSession.sessionEntry;
		});
	};
	const withRunSession = (result) => ({
		...result,
		sessionId: runSessionId,
		sessionKey: runSessionKey
	});
	if (!cronSession.sessionEntry.label?.trim() && baseSessionKey.startsWith("cron:")) {
		const labelSuffix = typeof params.job.name === "string" && params.job.name.trim() ? params.job.name.trim() : params.job.id;
		cronSession.sessionEntry.label = `Cron: ${labelSuffix}`;
	}
	if (!modelOverride && !hooksGmailModelApplied) {
		const sessionModelOverride = cronSession.sessionEntry.modelOverride?.trim();
		if (sessionModelOverride) {
			const sessionProviderOverride = cronSession.sessionEntry.providerOverride?.trim() || resolvedDefault.provider;
			const resolvedSessionOverride = resolveAllowedModelRef({
				cfg: cfgWithAgentDefaults,
				catalog: await loadCatalog(),
				raw: `${sessionProviderOverride}/${sessionModelOverride}`,
				defaultProvider: resolvedDefault.provider,
				defaultModel: resolvedDefault.model
			});
			if (!("error" in resolvedSessionOverride)) {
				provider = resolvedSessionOverride.ref.provider;
				model = resolvedSessionOverride.ref.model;
			}
		}
	}
	const hooksGmailThinking = isGmailHook ? normalizeThinkLevel(params.cfg.hooks?.gmail?.thinking) : void 0;
	const thinkOverride = normalizeThinkLevel(agentCfg?.thinkingDefault);
	let thinkLevel = normalizeThinkLevel((params.job.payload.kind === "agentTurn" ? params.job.payload.thinking : void 0) ?? void 0) ?? hooksGmailThinking ?? thinkOverride;
	if (!thinkLevel) thinkLevel = resolveThinkingDefault({
		cfg: cfgWithAgentDefaults,
		provider,
		model,
		catalog: await loadCatalog()
	});
	if (thinkLevel === "xhigh" && !supportsXHighThinking(provider, model)) {
		logWarn(`[cron:${params.job.id}] Thinking level "xhigh" is not supported for ${provider}/${model}; downgrading to "high".`);
		thinkLevel = "high";
	}
	const timeoutMs = resolveAgentTimeoutMs({
		cfg: cfgWithAgentDefaults,
		overrideSeconds: params.job.payload.kind === "agentTurn" ? params.job.payload.timeoutSeconds : void 0
	});
	const agentPayload = params.job.payload.kind === "agentTurn" ? params.job.payload : null;
	const deliveryPlan = resolveCronDeliveryPlan(params.job);
	const deliveryRequested = deliveryPlan.requested;
	const resolvedDelivery = await resolveDeliveryTarget(cfgWithAgentDefaults, agentId, {
		channel: deliveryPlan.channel ?? "last",
		to: deliveryPlan.to
	});
	const { formattedTime, timeLine } = resolveCronStyleNow(params.cfg, now);
	const base = `[cron:${params.job.id} ${params.job.name}] ${params.message}`.trim();
	const isExternalHook = isExternalHookSession(baseSessionKey);
	const allowUnsafeExternalContent = agentPayload?.allowUnsafeExternalContent === true || isGmailHook && params.cfg.hooks?.gmail?.allowUnsafeExternalContent === true;
	const shouldWrapExternal = isExternalHook && !allowUnsafeExternalContent;
	let commandBody;
	if (isExternalHook) {
		const suspiciousPatterns = detectSuspiciousPatterns(params.message);
		if (suspiciousPatterns.length > 0) logWarn(`[security] Suspicious patterns detected in external hook content (session=${baseSessionKey}, patterns=${suspiciousPatterns.length}): ${suspiciousPatterns.slice(0, 3).join(", ")}`);
	}
	if (shouldWrapExternal) {
		const hookType = getHookType(baseSessionKey);
		commandBody = `${buildSafeExternalPrompt({
			content: params.message,
			source: hookType,
			jobName: params.job.name,
			jobId: params.job.id,
			timestamp: formattedTime
		})}\n\n${timeLine}`.trim();
	} else commandBody = `${base}\n${timeLine}`.trim();
	if (deliveryRequested) commandBody = `${commandBody}\n\nReturn your summary as plain text; it will be delivered automatically. If the task explicitly calls for messaging a specific external recipient, note who/where it should go instead of sending it yourself.`.trim();
	const existingSnapshot = cronSession.sessionEntry.skillsSnapshot;
	const skillsSnapshotVersion = getSkillsSnapshotVersion(workspaceDir);
	const needsSkillsSnapshot = !existingSnapshot || existingSnapshot.version !== skillsSnapshotVersion;
	const skillsSnapshot = needsSkillsSnapshot ? buildWorkspaceSkillSnapshot(workspaceDir, {
		config: cfgWithAgentDefaults,
		eligibility: { remote: getRemoteSkillEligibility() },
		snapshotVersion: skillsSnapshotVersion
	}) : cronSession.sessionEntry.skillsSnapshot;
	if (needsSkillsSnapshot && skillsSnapshot) {
		cronSession.sessionEntry = {
			...cronSession.sessionEntry,
			updatedAt: Date.now(),
			skillsSnapshot
		};
		await persistSessionEntry();
	}
	cronSession.sessionEntry.systemSent = true;
	await persistSessionEntry();
	let runResult;
	let fallbackProvider = provider;
	let fallbackModel = model;
	const runStartedAt = Date.now();
	let runEndedAt = runStartedAt;
	try {
		const sessionFile = resolveSessionTranscriptPath(cronSession.sessionEntry.sessionId, agentId);
		const resolvedVerboseLevel = normalizeVerboseLevel(cronSession.sessionEntry.verboseLevel) ?? normalizeVerboseLevel(agentCfg?.verboseDefault) ?? "off";
		registerAgentRunContext(cronSession.sessionEntry.sessionId, {
			sessionKey: agentSessionKey,
			verboseLevel: resolvedVerboseLevel
		});
		const messageChannel = resolvedDelivery.channel;
		const fallbackResult = await runWithModelFallback({
			cfg: cfgWithAgentDefaults,
			provider,
			model,
			agentDir,
			fallbacksOverride: resolveAgentModelFallbacksOverride(params.cfg, agentId),
			run: (providerOverride, modelOverride) => {
				if (isCliProvider(providerOverride, cfgWithAgentDefaults)) {
					const cliSessionId = getCliSessionId(cronSession.sessionEntry, providerOverride);
					return runCliAgent({
						sessionId: cronSession.sessionEntry.sessionId,
						sessionKey: agentSessionKey,
						agentId,
						sessionFile,
						workspaceDir,
						config: cfgWithAgentDefaults,
						prompt: commandBody,
						provider: providerOverride,
						model: modelOverride,
						thinkLevel,
						timeoutMs,
						runId: cronSession.sessionEntry.sessionId,
						cliSessionId
					});
				}
				return runEmbeddedPiAgent({
					sessionId: cronSession.sessionEntry.sessionId,
					sessionKey: agentSessionKey,
					agentId,
					messageChannel,
					agentAccountId: resolvedDelivery.accountId,
					sessionFile,
					workspaceDir,
					config: cfgWithAgentDefaults,
					skillsSnapshot,
					prompt: commandBody,
					lane: params.lane ?? "cron",
					provider: providerOverride,
					model: modelOverride,
					thinkLevel,
					verboseLevel: resolvedVerboseLevel,
					timeoutMs,
					runId: cronSession.sessionEntry.sessionId,
					requireExplicitMessageTarget: true,
					disableMessageTool: deliveryRequested
				});
			}
		});
		runResult = fallbackResult.result;
		fallbackProvider = fallbackResult.provider;
		fallbackModel = fallbackResult.model;
		runEndedAt = Date.now();
	} catch (err) {
		return withRunSession({
			status: "error",
			error: String(err)
		});
	}
	const payloads = runResult.payloads ?? [];
	{
		const usage = runResult.meta.agentMeta?.usage;
		const promptTokens = runResult.meta.agentMeta?.promptTokens;
		const modelUsed = runResult.meta.agentMeta?.model ?? fallbackModel ?? model;
		const providerUsed = runResult.meta.agentMeta?.provider ?? fallbackProvider ?? provider;
		const contextTokens = agentCfg?.contextTokens ?? lookupContextTokens(modelUsed) ?? DEFAULT_CONTEXT_TOKENS;
		cronSession.sessionEntry.modelProvider = providerUsed;
		cronSession.sessionEntry.model = modelUsed;
		cronSession.sessionEntry.contextTokens = contextTokens;
		if (isCliProvider(providerUsed, cfgWithAgentDefaults)) {
			const cliSessionId = runResult.meta.agentMeta?.sessionId?.trim();
			if (cliSessionId) setCliSessionId(cronSession.sessionEntry, providerUsed, cliSessionId);
		}
		if (hasNonzeroUsage(usage)) {
			const input = usage.input ?? 0;
			const output = usage.output ?? 0;
			const totalTokens = deriveSessionTotalTokens({
				usage,
				contextTokens,
				promptTokens
			}) ?? input;
			cronSession.sessionEntry.inputTokens = input;
			cronSession.sessionEntry.outputTokens = output;
			cronSession.sessionEntry.totalTokens = totalTokens;
			cronSession.sessionEntry.totalTokensFresh = true;
		}
		await persistSessionEntry();
	}
	const firstText = payloads[0]?.text ?? "";
	const summary = pickSummaryFromPayloads(payloads) ?? pickSummaryFromOutput(firstText);
	const outputText = pickLastNonEmptyTextFromPayloads(payloads);
	const synthesizedText = outputText?.trim() || summary?.trim() || void 0;
	const deliveryPayload = pickLastDeliverablePayload(payloads);
	const deliveryPayloads = deliveryPayload !== void 0 ? [deliveryPayload] : synthesizedText ? [{ text: synthesizedText }] : [];
	const deliveryPayloadHasStructuredContent = Boolean(deliveryPayload?.mediaUrl) || (deliveryPayload?.mediaUrls?.length ?? 0) > 0 || Object.keys(deliveryPayload?.channelData ?? {}).length > 0;
	const deliveryBestEffort = resolveCronDeliveryBestEffort(params.job);
	const ackMaxChars = resolveHeartbeatAckMaxChars(agentCfg);
	const skipHeartbeatDelivery = deliveryRequested && isHeartbeatOnlyResponse(payloads, ackMaxChars);
	const skipMessagingToolDelivery = deliveryRequested && runResult.didSendViaMessagingTool === true && (runResult.messagingToolSentTargets ?? []).some((target) => matchesMessagingToolDeliveryTarget(target, {
		channel: resolvedDelivery.channel,
		to: resolvedDelivery.to,
		accountId: resolvedDelivery.accountId
	}));
	let delivered = skipMessagingToolDelivery;
	if (deliveryRequested && !skipHeartbeatDelivery && !skipMessagingToolDelivery) {
		if (resolvedDelivery.error) {
			if (!deliveryBestEffort) return withRunSession({
				status: "error",
				error: resolvedDelivery.error.message,
				summary,
				outputText
			});
			logWarn(`[cron:${params.job.id}] ${resolvedDelivery.error.message}`);
			return withRunSession({
				status: "ok",
				summary,
				outputText
			});
		}
		if (!resolvedDelivery.to) {
			const message = "cron delivery target is missing";
			if (!deliveryBestEffort) return withRunSession({
				status: "error",
				error: message,
				summary,
				outputText
			});
			logWarn(`[cron:${params.job.id}] ${message}`);
			return withRunSession({
				status: "ok",
				summary,
				outputText
			});
		}
		if (deliveryPayloadHasStructuredContent) try {
			delivered = (await deliverOutboundPayloads({
				cfg: cfgWithAgentDefaults,
				channel: resolvedDelivery.channel,
				to: resolvedDelivery.to,
				accountId: resolvedDelivery.accountId,
				threadId: resolvedDelivery.threadId,
				payloads: deliveryPayloads,
				bestEffort: deliveryBestEffort,
				deps: createOutboundSendDeps(params.deps)
			})).length > 0;
		} catch (err) {
			if (!deliveryBestEffort) return withRunSession({
				status: "error",
				summary,
				outputText,
				error: String(err)
			});
		}
		else if (synthesizedText) {
			const announceSessionKey = resolveAgentMainSessionKey({
				cfg: params.cfg,
				agentId
			});
			const taskLabel = typeof params.job.name === "string" && params.job.name.trim() ? params.job.name.trim() : `cron:${params.job.id}`;
			try {
				if (await runSubagentAnnounceFlow({
					childSessionKey: runSessionKey,
					childRunId: `${params.job.id}:${runSessionId}`,
					requesterSessionKey: announceSessionKey,
					requesterOrigin: {
						channel: resolvedDelivery.channel,
						to: resolvedDelivery.to,
						accountId: resolvedDelivery.accountId,
						threadId: resolvedDelivery.threadId
					},
					requesterDisplayKey: announceSessionKey,
					task: taskLabel,
					timeoutMs,
					cleanup: params.job.deleteAfterRun ? "delete" : "keep",
					roundOneReply: synthesizedText,
					waitForCompletion: false,
					startedAt: runStartedAt,
					endedAt: runEndedAt,
					outcome: { status: "ok" },
					announceType: "cron job"
				})) delivered = true;
				else {
					const message = "cron announce delivery failed";
					if (!deliveryBestEffort) return withRunSession({
						status: "error",
						summary,
						outputText,
						error: message
					});
					logWarn(`[cron:${params.job.id}] ${message}`);
				}
			} catch (err) {
				if (!deliveryBestEffort) return withRunSession({
					status: "error",
					summary,
					outputText,
					error: String(err)
				});
				logWarn(`[cron:${params.job.id}] ${String(err)}`);
			}
		}
	}
	return withRunSession({
		status: "ok",
		summary,
		outputText,
		delivered
	});
}

//#endregion
//#region src/cron/run-log.ts
function resolveCronRunLogPath(params) {
	const storePath = path.resolve(params.storePath);
	const dir = path.dirname(storePath);
	return path.join(dir, "runs", `${params.jobId}.jsonl`);
}
const writesByPath = /* @__PURE__ */ new Map();
async function pruneIfNeeded(filePath, opts) {
	const stat = await fsPromises.stat(filePath).catch(() => null);
	if (!stat || stat.size <= opts.maxBytes) return;
	const lines = (await fsPromises.readFile(filePath, "utf-8").catch(() => "")).split("\n").map((l) => l.trim()).filter(Boolean);
	const kept = lines.slice(Math.max(0, lines.length - opts.keepLines));
	const tmp = `${filePath}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
	await fsPromises.writeFile(tmp, `${kept.join("\n")}\n`, "utf-8");
	await fsPromises.rename(tmp, filePath);
}
async function appendCronRunLog(filePath, entry, opts) {
	const resolved = path.resolve(filePath);
	const next = (writesByPath.get(resolved) ?? Promise.resolve()).catch(() => void 0).then(async () => {
		await fsPromises.mkdir(path.dirname(resolved), { recursive: true });
		await fsPromises.appendFile(resolved, `${JSON.stringify(entry)}\n`, "utf-8");
		await pruneIfNeeded(resolved, {
			maxBytes: opts?.maxBytes ?? 2e6,
			keepLines: opts?.keepLines ?? 2e3
		});
	});
	writesByPath.set(resolved, next);
	await next;
}
async function readCronRunLogEntries(filePath, opts) {
	const limit = Math.max(1, Math.min(5e3, Math.floor(opts?.limit ?? 200)));
	const jobId = opts?.jobId?.trim() || void 0;
	const raw = await fsPromises.readFile(path.resolve(filePath), "utf-8").catch(() => "");
	if (!raw.trim()) return [];
	const parsed = [];
	const lines = raw.split("\n");
	for (let i = lines.length - 1; i >= 0 && parsed.length < limit; i--) {
		const line = lines[i]?.trim();
		if (!line) continue;
		try {
			const obj = JSON.parse(line);
			if (!obj || typeof obj !== "object") continue;
			if (obj.action !== "finished") continue;
			if (typeof obj.jobId !== "string" || obj.jobId.trim().length === 0) continue;
			if (typeof obj.ts !== "number" || !Number.isFinite(obj.ts)) continue;
			if (jobId && obj.jobId !== jobId) continue;
			const entry = {
				ts: obj.ts,
				jobId: obj.jobId,
				action: "finished",
				status: obj.status,
				error: obj.error,
				summary: obj.summary,
				runAtMs: obj.runAtMs,
				durationMs: obj.durationMs,
				nextRunAtMs: obj.nextRunAtMs
			};
			if (typeof obj.sessionId === "string" && obj.sessionId.trim().length > 0) entry.sessionId = obj.sessionId;
			if (typeof obj.sessionKey === "string" && obj.sessionKey.trim().length > 0) entry.sessionKey = obj.sessionKey;
			parsed.push(entry);
		} catch {}
	}
	return parsed.toReversed();
}

//#endregion
//#region src/cron/schedule.ts
function resolveCronTimezone(tz) {
	const trimmed = typeof tz === "string" ? tz.trim() : "";
	if (trimmed) return trimmed;
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
function computeNextRunAtMs(schedule, nowMs) {
	if (schedule.kind === "at") {
		const sched = schedule;
		const atMs = typeof sched.atMs === "number" && Number.isFinite(sched.atMs) && sched.atMs > 0 ? sched.atMs : typeof sched.atMs === "string" ? parseAbsoluteTimeMs(sched.atMs) : typeof sched.at === "string" ? parseAbsoluteTimeMs(sched.at) : null;
		if (atMs === null) return;
		return atMs > nowMs ? atMs : void 0;
	}
	if (schedule.kind === "every") {
		const everyMs = Math.max(1, Math.floor(schedule.everyMs));
		const anchor = Math.max(0, Math.floor(schedule.anchorMs ?? nowMs));
		if (nowMs < anchor) return anchor;
		const elapsed = nowMs - anchor;
		return anchor + Math.max(1, Math.floor((elapsed + everyMs - 1) / everyMs)) * everyMs;
	}
	const expr = schedule.expr.trim();
	if (!expr) return;
	const cron = new Cron(expr, {
		timezone: resolveCronTimezone(schedule.tz),
		catch: false
	});
	const nowSecondMs = Math.floor(nowMs / 1e3) * 1e3;
	const next = cron.nextRun(new Date(nowSecondMs));
	if (!next) return;
	const nextMs = next.getTime();
	return Number.isFinite(nextMs) && nextMs > nowSecondMs ? nextMs : void 0;
}

//#endregion
//#region src/cron/service/jobs.ts
const STUCK_RUN_MS = 7200 * 1e3;
function resolveEveryAnchorMs(params) {
	const raw = params.schedule.anchorMs;
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
	return Math.max(0, Math.floor(params.fallbackAnchorMs));
}
function assertSupportedJobSpec(job) {
	if (job.sessionTarget === "main" && job.payload.kind !== "systemEvent") throw new Error("main cron jobs require payload.kind=\"systemEvent\"");
	if (job.sessionTarget === "isolated" && job.payload.kind !== "agentTurn") throw new Error("isolated cron jobs require payload.kind=\"agentTurn\"");
}
function assertDeliverySupport(job) {
	if (job.delivery && job.sessionTarget !== "isolated") throw new Error("cron delivery config is only supported for sessionTarget=\"isolated\"");
}
function findJobOrThrow(state, id) {
	const job = state.store?.jobs.find((j) => j.id === id);
	if (!job) throw new Error(`unknown cron job id: ${id}`);
	return job;
}
function computeJobNextRunAtMs(job, nowMs) {
	if (!job.enabled) return;
	if (job.schedule.kind === "every") {
		const anchorMs = resolveEveryAnchorMs({
			schedule: job.schedule,
			fallbackAnchorMs: job.createdAtMs
		});
		return computeNextRunAtMs({
			...job.schedule,
			anchorMs
		}, nowMs);
	}
	if (job.schedule.kind === "at") {
		if (job.state.lastStatus === "ok" && job.state.lastRunAtMs) return;
		const schedule = job.schedule;
		const atMs = typeof schedule.atMs === "number" && Number.isFinite(schedule.atMs) && schedule.atMs > 0 ? schedule.atMs : typeof schedule.atMs === "string" ? parseAbsoluteTimeMs(schedule.atMs) : typeof schedule.at === "string" ? parseAbsoluteTimeMs(schedule.at) : null;
		return atMs !== null ? atMs : void 0;
	}
	return computeNextRunAtMs(job.schedule, nowMs);
}
/** Maximum consecutive schedule errors before auto-disabling a job. */
const MAX_SCHEDULE_ERRORS = 3;
function recomputeNextRuns(state) {
	if (!state.store) return false;
	let changed = false;
	const now = state.deps.nowMs();
	for (const job of state.store.jobs) {
		if (!job.state) {
			job.state = {};
			changed = true;
		}
		if (!job.enabled) {
			if (job.state.nextRunAtMs !== void 0) {
				job.state.nextRunAtMs = void 0;
				changed = true;
			}
			if (job.state.runningAtMs !== void 0) {
				job.state.runningAtMs = void 0;
				changed = true;
			}
			continue;
		}
		const runningAt = job.state.runningAtMs;
		if (typeof runningAt === "number" && now - runningAt > STUCK_RUN_MS) {
			state.deps.log.warn({
				jobId: job.id,
				runningAtMs: runningAt
			}, "cron: clearing stuck running marker");
			job.state.runningAtMs = void 0;
			changed = true;
		}
		const nextRun = job.state.nextRunAtMs;
		if (nextRun === void 0 || now >= nextRun) try {
			const newNext = computeJobNextRunAtMs(job, now);
			if (job.state.nextRunAtMs !== newNext) {
				job.state.nextRunAtMs = newNext;
				changed = true;
			}
			if (job.state.scheduleErrorCount) {
				job.state.scheduleErrorCount = void 0;
				changed = true;
			}
		} catch (err) {
			const errorCount = (job.state.scheduleErrorCount ?? 0) + 1;
			job.state.scheduleErrorCount = errorCount;
			job.state.nextRunAtMs = void 0;
			job.state.lastError = `schedule error: ${String(err)}`;
			changed = true;
			if (errorCount >= MAX_SCHEDULE_ERRORS) {
				job.enabled = false;
				state.deps.log.error({
					jobId: job.id,
					name: job.name,
					errorCount,
					err: String(err)
				}, "cron: auto-disabled job after repeated schedule errors");
			} else state.deps.log.warn({
				jobId: job.id,
				name: job.name,
				errorCount,
				err: String(err)
			}, "cron: failed to compute next run for job (skipping)");
		}
	}
	return changed;
}
/**
* Maintenance-only version of recomputeNextRuns that handles disabled jobs
* and stuck markers, but does NOT recompute nextRunAtMs for enabled jobs
* with existing values. Used during timer ticks when no due jobs were found
* to prevent silently advancing past-due nextRunAtMs values without execution
* (see #13992).
*/
function recomputeNextRunsForMaintenance(state) {
	if (!state.store) return false;
	let changed = false;
	const now = state.deps.nowMs();
	for (const job of state.store.jobs) {
		if (!job.state) {
			job.state = {};
			changed = true;
		}
		if (!job.enabled) {
			if (job.state.nextRunAtMs !== void 0) {
				job.state.nextRunAtMs = void 0;
				changed = true;
			}
			if (job.state.runningAtMs !== void 0) {
				job.state.runningAtMs = void 0;
				changed = true;
			}
			continue;
		}
		const runningAt = job.state.runningAtMs;
		if (typeof runningAt === "number" && now - runningAt > STUCK_RUN_MS) {
			state.deps.log.warn({
				jobId: job.id,
				runningAtMs: runningAt
			}, "cron: clearing stuck running marker");
			job.state.runningAtMs = void 0;
			changed = true;
		}
		if (job.state.nextRunAtMs === void 0) {
			const newNext = computeJobNextRunAtMs(job, now);
			if (newNext !== void 0) {
				job.state.nextRunAtMs = newNext;
				changed = true;
			}
		}
	}
	return changed;
}
function nextWakeAtMs(state) {
	const enabled = (state.store?.jobs ?? []).filter((j) => j.enabled && typeof j.state.nextRunAtMs === "number");
	if (enabled.length === 0) return;
	return enabled.reduce((min, j) => Math.min(min, j.state.nextRunAtMs), enabled[0].state.nextRunAtMs);
}
function createJob(state, input) {
	const now = state.deps.nowMs();
	const id = crypto.randomUUID();
	const schedule = input.schedule.kind === "every" ? {
		...input.schedule,
		anchorMs: resolveEveryAnchorMs({
			schedule: input.schedule,
			fallbackAnchorMs: now
		})
	} : input.schedule;
	const deleteAfterRun = typeof input.deleteAfterRun === "boolean" ? input.deleteAfterRun : schedule.kind === "at" ? true : void 0;
	const enabled = typeof input.enabled === "boolean" ? input.enabled : true;
	const job = {
		id,
		agentId: normalizeOptionalAgentId(input.agentId),
		name: normalizeRequiredName(input.name),
		description: normalizeOptionalText(input.description),
		enabled,
		deleteAfterRun,
		createdAtMs: now,
		updatedAtMs: now,
		schedule,
		sessionTarget: input.sessionTarget,
		wakeMode: input.wakeMode,
		payload: input.payload,
		delivery: input.delivery,
		state: { ...input.state }
	};
	assertSupportedJobSpec(job);
	assertDeliverySupport(job);
	job.state.nextRunAtMs = computeJobNextRunAtMs(job, now);
	return job;
}
function applyJobPatch(job, patch) {
	if ("name" in patch) job.name = normalizeRequiredName(patch.name);
	if ("description" in patch) job.description = normalizeOptionalText(patch.description);
	if (typeof patch.enabled === "boolean") job.enabled = patch.enabled;
	if (typeof patch.deleteAfterRun === "boolean") job.deleteAfterRun = patch.deleteAfterRun;
	if (patch.schedule) job.schedule = patch.schedule;
	if (patch.sessionTarget) job.sessionTarget = patch.sessionTarget;
	if (patch.wakeMode) job.wakeMode = patch.wakeMode;
	if (patch.payload) job.payload = mergeCronPayload(job.payload, patch.payload);
	if (!patch.delivery && patch.payload?.kind === "agentTurn") {
		const legacyDeliveryPatch = buildLegacyDeliveryPatch(patch.payload);
		if (legacyDeliveryPatch && job.sessionTarget === "isolated" && job.payload.kind === "agentTurn") job.delivery = mergeCronDelivery(job.delivery, legacyDeliveryPatch);
	}
	if (patch.delivery) job.delivery = mergeCronDelivery(job.delivery, patch.delivery);
	if (job.sessionTarget === "main" && job.delivery) job.delivery = void 0;
	if (patch.state) job.state = {
		...job.state,
		...patch.state
	};
	if ("agentId" in patch) job.agentId = normalizeOptionalAgentId(patch.agentId);
	assertSupportedJobSpec(job);
	assertDeliverySupport(job);
}
function mergeCronPayload(existing, patch) {
	if (patch.kind !== existing.kind) return buildPayloadFromPatch(patch);
	if (patch.kind === "systemEvent") {
		if (existing.kind !== "systemEvent") return buildPayloadFromPatch(patch);
		return {
			kind: "systemEvent",
			text: typeof patch.text === "string" ? patch.text : existing.text
		};
	}
	if (existing.kind !== "agentTurn") return buildPayloadFromPatch(patch);
	const next = { ...existing };
	if (typeof patch.message === "string") next.message = patch.message;
	if (typeof patch.model === "string") next.model = patch.model;
	if (typeof patch.thinking === "string") next.thinking = patch.thinking;
	if (typeof patch.timeoutSeconds === "number") next.timeoutSeconds = patch.timeoutSeconds;
	if (typeof patch.allowUnsafeExternalContent === "boolean") next.allowUnsafeExternalContent = patch.allowUnsafeExternalContent;
	if (typeof patch.deliver === "boolean") next.deliver = patch.deliver;
	if (typeof patch.channel === "string") next.channel = patch.channel;
	if (typeof patch.to === "string") next.to = patch.to;
	if (typeof patch.bestEffortDeliver === "boolean") next.bestEffortDeliver = patch.bestEffortDeliver;
	return next;
}
function buildLegacyDeliveryPatch(payload) {
	const deliver = payload.deliver;
	const toRaw = typeof payload.to === "string" ? payload.to.trim() : "";
	if (!(typeof deliver === "boolean" || typeof payload.bestEffortDeliver === "boolean" || Boolean(toRaw))) return null;
	const patch = {};
	let hasPatch = false;
	if (deliver === false) {
		patch.mode = "none";
		hasPatch = true;
	} else if (deliver === true || toRaw) {
		patch.mode = "announce";
		hasPatch = true;
	}
	if (typeof payload.channel === "string") {
		const channel = payload.channel.trim().toLowerCase();
		patch.channel = channel ? channel : void 0;
		hasPatch = true;
	}
	if (typeof payload.to === "string") {
		patch.to = payload.to.trim();
		hasPatch = true;
	}
	if (typeof payload.bestEffortDeliver === "boolean") {
		patch.bestEffort = payload.bestEffortDeliver;
		hasPatch = true;
	}
	return hasPatch ? patch : null;
}
function buildPayloadFromPatch(patch) {
	if (patch.kind === "systemEvent") {
		if (typeof patch.text !== "string" || patch.text.length === 0) throw new Error("cron.update payload.kind=\"systemEvent\" requires text");
		return {
			kind: "systemEvent",
			text: patch.text
		};
	}
	if (typeof patch.message !== "string" || patch.message.length === 0) throw new Error("cron.update payload.kind=\"agentTurn\" requires message");
	return {
		kind: "agentTurn",
		message: patch.message,
		model: patch.model,
		thinking: patch.thinking,
		timeoutSeconds: patch.timeoutSeconds,
		allowUnsafeExternalContent: patch.allowUnsafeExternalContent,
		deliver: patch.deliver,
		channel: patch.channel,
		to: patch.to,
		bestEffortDeliver: patch.bestEffortDeliver
	};
}
function mergeCronDelivery(existing, patch) {
	const next = {
		mode: existing?.mode ?? "none",
		channel: existing?.channel,
		to: existing?.to,
		bestEffort: existing?.bestEffort
	};
	if (typeof patch.mode === "string") next.mode = patch.mode === "deliver" ? "announce" : patch.mode;
	if ("channel" in patch) {
		const channel = typeof patch.channel === "string" ? patch.channel.trim() : "";
		next.channel = channel ? channel : void 0;
	}
	if ("to" in patch) {
		const to = typeof patch.to === "string" ? patch.to.trim() : "";
		next.to = to ? to : void 0;
	}
	if (typeof patch.bestEffort === "boolean") next.bestEffort = patch.bestEffort;
	return next;
}
function isJobDue(job, nowMs, opts) {
	if (!job.state) job.state = {};
	if (typeof job.state.runningAtMs === "number") return false;
	if (opts.forced) return true;
	return job.enabled && typeof job.state.nextRunAtMs === "number" && nowMs >= job.state.nextRunAtMs;
}
function resolveJobPayloadTextForMain(job) {
	if (job.payload.kind !== "systemEvent") return;
	const text = normalizePayloadToSystemText(job.payload);
	return text.trim() ? text : void 0;
}

//#endregion
//#region src/cron/service/locked.ts
const storeLocks = /* @__PURE__ */ new Map();
const resolveChain = (promise) => promise.then(() => void 0, () => void 0);
async function locked(state, fn) {
	const storePath = state.deps.storePath;
	const storeOp = storeLocks.get(storePath) ?? Promise.resolve();
	const next = Promise.all([resolveChain(state.op), resolveChain(storeOp)]).then(fn);
	const keepAlive = resolveChain(next);
	state.op = keepAlive;
	storeLocks.set(storePath, keepAlive);
	return await next;
}

//#endregion
//#region src/cron/store.ts
const DEFAULT_CRON_DIR = path.join(CONFIG_DIR, "cron");
const DEFAULT_CRON_STORE_PATH = path.join(DEFAULT_CRON_DIR, "jobs.json");
function resolveCronStorePath(storePath) {
	if (storePath?.trim()) {
		const raw = storePath.trim();
		if (raw.startsWith("~")) return path.resolve(expandHomePrefix(raw));
		return path.resolve(raw);
	}
	return DEFAULT_CRON_STORE_PATH;
}
async function loadCronStore(storePath) {
	try {
		const raw = await fs.promises.readFile(storePath, "utf-8");
		let parsed;
		try {
			parsed = JSON5.parse(raw);
		} catch (err) {
			throw new Error(`Failed to parse cron store at ${storePath}: ${String(err)}`, { cause: err });
		}
		const parsedRecord = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
		return {
			version: 1,
			jobs: (Array.isArray(parsedRecord.jobs) ? parsedRecord.jobs : []).filter(Boolean)
		};
	} catch (err) {
		if (err?.code === "ENOENT") return {
			version: 1,
			jobs: []
		};
		throw err;
	}
}
async function saveCronStore(storePath, store) {
	await fs.promises.mkdir(path.dirname(storePath), { recursive: true });
	const tmp = `${storePath}.${process.pid}.${Math.random().toString(16).slice(2)}.tmp`;
	const json = JSON.stringify(store, null, 2);
	await fs.promises.writeFile(tmp, json, "utf-8");
	await fs.promises.rename(tmp, storePath);
	try {
		await fs.promises.copyFile(storePath, `${storePath}.bak`);
	} catch {}
}

//#endregion
//#region src/cron/service/store.ts
function hasLegacyDeliveryHints(payload) {
	if (typeof payload.deliver === "boolean") return true;
	if (typeof payload.bestEffortDeliver === "boolean") return true;
	if (typeof payload.to === "string" && payload.to.trim()) return true;
	return false;
}
function buildDeliveryFromLegacyPayload(payload) {
	const mode = payload.deliver === false ? "none" : "announce";
	const channelRaw = typeof payload.channel === "string" ? payload.channel.trim().toLowerCase() : "";
	const toRaw = typeof payload.to === "string" ? payload.to.trim() : "";
	const next = { mode };
	if (channelRaw) next.channel = channelRaw;
	if (toRaw) next.to = toRaw;
	if (typeof payload.bestEffortDeliver === "boolean") next.bestEffort = payload.bestEffortDeliver;
	return next;
}
function buildDeliveryPatchFromLegacyPayload(payload) {
	const deliver = payload.deliver;
	const channelRaw = typeof payload.channel === "string" ? payload.channel.trim().toLowerCase() : "";
	const toRaw = typeof payload.to === "string" ? payload.to.trim() : "";
	const next = {};
	let hasPatch = false;
	if (deliver === false) {
		next.mode = "none";
		hasPatch = true;
	} else if (deliver === true || toRaw) {
		next.mode = "announce";
		hasPatch = true;
	}
	if (channelRaw) {
		next.channel = channelRaw;
		hasPatch = true;
	}
	if (toRaw) {
		next.to = toRaw;
		hasPatch = true;
	}
	if (typeof payload.bestEffortDeliver === "boolean") {
		next.bestEffort = payload.bestEffortDeliver;
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
	if ("bestEffort" in patch && patch.bestEffort !== next.bestEffort) {
		next.bestEffort = patch.bestEffort;
		mutated = true;
	}
	return {
		delivery: next,
		mutated
	};
}
function stripLegacyDeliveryFields(payload) {
	if ("deliver" in payload) delete payload.deliver;
	if ("channel" in payload) delete payload.channel;
	if ("to" in payload) delete payload.to;
	if ("bestEffortDeliver" in payload) delete payload.bestEffortDeliver;
}
function normalizePayloadKind(payload) {
	const raw = typeof payload.kind === "string" ? payload.kind.trim().toLowerCase() : "";
	if (raw === "agentturn") {
		payload.kind = "agentTurn";
		return true;
	}
	if (raw === "systemevent") {
		payload.kind = "systemEvent";
		return true;
	}
	return false;
}
function inferPayloadIfMissing(raw) {
	const message = typeof raw.message === "string" ? raw.message.trim() : "";
	const text = typeof raw.text === "string" ? raw.text.trim() : "";
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
	return false;
}
function copyTopLevelAgentTurnFields(raw, payload) {
	let mutated = false;
	const copyTrimmedString = (field) => {
		const existing = payload[field];
		if (typeof existing === "string" && existing.trim()) return;
		const value = raw[field];
		if (typeof value === "string" && value.trim()) {
			payload[field] = value.trim();
			mutated = true;
		}
	};
	copyTrimmedString("model");
	copyTrimmedString("thinking");
	if (typeof payload.timeoutSeconds !== "number" && typeof raw.timeoutSeconds === "number" && Number.isFinite(raw.timeoutSeconds)) {
		payload.timeoutSeconds = Math.max(1, Math.floor(raw.timeoutSeconds));
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
	if (typeof payload.channel !== "string" && typeof raw.channel === "string" && raw.channel.trim()) {
		payload.channel = raw.channel.trim();
		mutated = true;
	}
	if (typeof payload.to !== "string" && typeof raw.to === "string" && raw.to.trim()) {
		payload.to = raw.to.trim();
		mutated = true;
	}
	if (typeof payload.bestEffortDeliver !== "boolean" && typeof raw.bestEffortDeliver === "boolean") {
		payload.bestEffortDeliver = raw.bestEffortDeliver;
		mutated = true;
	}
	if (typeof payload.provider !== "string" && typeof raw.provider === "string" && raw.provider.trim()) {
		payload.provider = raw.provider.trim();
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
	if ("bestEffortDeliver" in raw) delete raw.bestEffortDeliver;
	if ("provider" in raw) delete raw.provider;
}
async function getFileMtimeMs(path) {
	try {
		return (await fs.promises.stat(path)).mtimeMs;
	} catch {
		return null;
	}
}
async function ensureLoaded(state, opts) {
	if (state.store && !opts?.forceReload) return;
	const fileMtimeMs = await getFileMtimeMs(state.deps.storePath);
	const jobs = (await loadCronStore(state.deps.storePath)).jobs ?? [];
	let mutated = false;
	for (const raw of jobs) {
		const state = raw.state;
		if (!state || typeof state !== "object" || Array.isArray(state)) {
			raw.state = {};
			mutated = true;
		}
		const nameRaw = raw.name;
		if (typeof nameRaw !== "string" || nameRaw.trim().length === 0) {
			raw.name = inferLegacyName({
				schedule: raw.schedule,
				payload: raw.payload
			});
			mutated = true;
		} else raw.name = nameRaw.trim();
		const desc = normalizeOptionalText(raw.description);
		if (raw.description !== desc) {
			raw.description = desc;
			mutated = true;
		}
		if (typeof raw.enabled !== "boolean") {
			raw.enabled = true;
			mutated = true;
		}
		const payload = raw.payload;
		if ((!payload || typeof payload !== "object" || Array.isArray(payload)) && inferPayloadIfMissing(raw)) mutated = true;
		const payloadRecord = raw.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload) ? raw.payload : null;
		if (payloadRecord) {
			if (normalizePayloadKind(payloadRecord)) mutated = true;
			if (!payloadRecord.kind) {
				if (typeof payloadRecord.message === "string" && payloadRecord.message.trim()) {
					payloadRecord.kind = "agentTurn";
					mutated = true;
				} else if (typeof payloadRecord.text === "string" && payloadRecord.text.trim()) {
					payloadRecord.kind = "systemEvent";
					mutated = true;
				}
			}
			if (payloadRecord.kind === "agentTurn") {
				if (copyTopLevelAgentTurnFields(raw, payloadRecord)) mutated = true;
			}
		}
		if ("model" in raw || "thinking" in raw || "timeoutSeconds" in raw || "allowUnsafeExternalContent" in raw || "message" in raw || "text" in raw || "deliver" in raw || "channel" in raw || "to" in raw || "bestEffortDeliver" in raw || "provider" in raw) {
			stripLegacyTopLevelFields(raw);
			mutated = true;
		}
		if (payloadRecord) {
			if (migrateLegacyCronPayload(payloadRecord)) mutated = true;
		}
		const schedule = raw.schedule;
		if (schedule && typeof schedule === "object" && !Array.isArray(schedule)) {
			const sched = schedule;
			const kind = typeof sched.kind === "string" ? sched.kind.trim().toLowerCase() : "";
			if (!kind && ("at" in sched || "atMs" in sched)) {
				sched.kind = "at";
				mutated = true;
			}
			const atRaw = typeof sched.at === "string" ? sched.at.trim() : "";
			const atMsRaw = sched.atMs;
			const parsedAtMs = typeof atMsRaw === "number" ? atMsRaw : typeof atMsRaw === "string" ? parseAbsoluteTimeMs(atMsRaw) : atRaw ? parseAbsoluteTimeMs(atRaw) : null;
			if (parsedAtMs !== null) {
				sched.at = new Date(parsedAtMs).toISOString();
				if ("atMs" in sched) delete sched.atMs;
				mutated = true;
			}
			const everyMsRaw = sched.everyMs;
			const everyMs = typeof everyMsRaw === "number" && Number.isFinite(everyMsRaw) ? Math.floor(everyMsRaw) : null;
			if ((kind === "every" || sched.kind === "every") && everyMs !== null) {
				const anchorRaw = sched.anchorMs;
				const normalizedAnchor = typeof anchorRaw === "number" && Number.isFinite(anchorRaw) ? Math.max(0, Math.floor(anchorRaw)) : typeof raw.createdAtMs === "number" && Number.isFinite(raw.createdAtMs) ? Math.max(0, Math.floor(raw.createdAtMs)) : typeof raw.updatedAtMs === "number" && Number.isFinite(raw.updatedAtMs) ? Math.max(0, Math.floor(raw.updatedAtMs)) : null;
				if (normalizedAnchor !== null && anchorRaw !== normalizedAnchor) {
					sched.anchorMs = normalizedAnchor;
					mutated = true;
				}
			}
		}
		const delivery = raw.delivery;
		if (delivery && typeof delivery === "object" && !Array.isArray(delivery)) {
			const modeRaw = delivery.mode;
			if (typeof modeRaw === "string") {
				if (modeRaw.trim().toLowerCase() === "deliver") {
					delivery.mode = "announce";
					mutated = true;
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
		const sessionTarget = typeof raw.sessionTarget === "string" ? raw.sessionTarget.trim().toLowerCase() : "";
		const isIsolatedAgentTurn = sessionTarget === "isolated" || sessionTarget === "" && payloadKind === "agentTurn";
		const hasDelivery = delivery && typeof delivery === "object" && !Array.isArray(delivery);
		const hasLegacyDelivery = payloadRecord ? hasLegacyDeliveryHints(payloadRecord) : false;
		if (isIsolatedAgentTurn && payloadKind === "agentTurn") {
			if (!hasDelivery) {
				raw.delivery = payloadRecord && hasLegacyDelivery ? buildDeliveryFromLegacyPayload(payloadRecord) : { mode: "announce" };
				mutated = true;
			}
			if (payloadRecord && hasLegacyDelivery) {
				if (hasDelivery) {
					const merged = mergeLegacyDeliveryInto(delivery, payloadRecord);
					if (merged.mutated) {
						raw.delivery = merged.delivery;
						mutated = true;
					}
				}
				stripLegacyDeliveryFields(payloadRecord);
				mutated = true;
			}
		}
	}
	state.store = {
		version: 1,
		jobs
	};
	state.storeLoadedAtMs = state.deps.nowMs();
	state.storeFileMtimeMs = fileMtimeMs;
	if (!opts?.skipRecompute) recomputeNextRuns(state);
	if (mutated) await persist(state);
}
function warnIfDisabled(state, action) {
	if (state.deps.cronEnabled) return;
	if (state.warnedDisabled) return;
	state.warnedDisabled = true;
	state.deps.log.warn({
		enabled: false,
		action,
		storePath: state.deps.storePath
	}, "cron: scheduler disabled; jobs will not run automatically");
}
async function persist(state) {
	if (!state.store) return;
	await saveCronStore(state.deps.storePath, state.store);
	state.storeFileMtimeMs = await getFileMtimeMs(state.deps.storePath);
}

//#endregion
//#region src/cron/session-reaper.ts
const DEFAULT_RETENTION_MS = 24 * 36e5;
/** Minimum interval between reaper sweeps (avoid running every timer tick). */
const MIN_SWEEP_INTERVAL_MS = 5 * 6e4;
const lastSweepAtMsByStore = /* @__PURE__ */ new Map();
function resolveRetentionMs(cronConfig) {
	if (cronConfig?.sessionRetention === false) return null;
	const raw = cronConfig?.sessionRetention;
	if (typeof raw === "string" && raw.trim()) try {
		return parseDurationMs(raw.trim(), { defaultUnit: "h" });
	} catch {
		return DEFAULT_RETENTION_MS;
	}
	return DEFAULT_RETENTION_MS;
}
/**
* Sweep the session store and prune expired cron run sessions.
* Designed to be called from the cron timer tick — self-throttles via
* MIN_SWEEP_INTERVAL_MS to avoid excessive I/O.
*
* Lock ordering: this function acquires the session-store file lock via
* `updateSessionStore`. It must be called OUTSIDE of the cron service's
* own `locked()` section to avoid lock-order inversions. The cron timer
* calls this after all `locked()` sections have been released.
*/
async function sweepCronRunSessions(params) {
	const now = params.nowMs ?? Date.now();
	const storePath = params.sessionStorePath;
	const lastSweepAtMs = lastSweepAtMsByStore.get(storePath) ?? 0;
	if (!params.force && now - lastSweepAtMs < MIN_SWEEP_INTERVAL_MS) return {
		swept: false,
		pruned: 0
	};
	const retentionMs = resolveRetentionMs(params.cronConfig);
	if (retentionMs === null) {
		lastSweepAtMsByStore.set(storePath, now);
		return {
			swept: false,
			pruned: 0
		};
	}
	let pruned = 0;
	try {
		await updateSessionStore(storePath, (store) => {
			const cutoff = now - retentionMs;
			for (const key of Object.keys(store)) {
				if (!isCronRunSessionKey(key)) continue;
				const entry = store[key];
				if (!entry) continue;
				if ((entry.updatedAt ?? 0) < cutoff) {
					delete store[key];
					pruned++;
				}
			}
		});
	} catch (err) {
		params.log.warn({ err: String(err) }, "cron-reaper: failed to sweep session store");
		return {
			swept: false,
			pruned: 0
		};
	}
	lastSweepAtMsByStore.set(storePath, now);
	if (pruned > 0) params.log.info({
		pruned,
		retentionMs
	}, `cron-reaper: pruned ${pruned} expired cron run session(s)`);
	return {
		swept: true,
		pruned
	};
}

//#endregion
//#region src/cron/service/timer.ts
const MAX_TIMER_DELAY_MS = 6e4;
/**
* Maximum wall-clock time for a single job execution. Acts as a safety net
* on top of the per-provider / per-agent timeouts to prevent one stuck job
* from wedging the entire cron lane.
*/
const DEFAULT_JOB_TIMEOUT_MS = 10 * 6e4;
/**
* Exponential backoff delays (in ms) indexed by consecutive error count.
* After the last entry the delay stays constant.
*/
const ERROR_BACKOFF_SCHEDULE_MS = [
	3e4,
	6e4,
	5 * 6e4,
	15 * 6e4,
	60 * 6e4
];
function errorBackoffMs(consecutiveErrors) {
	const idx = Math.min(consecutiveErrors - 1, ERROR_BACKOFF_SCHEDULE_MS.length - 1);
	return ERROR_BACKOFF_SCHEDULE_MS[Math.max(0, idx)];
}
/**
* Apply the result of a job execution to the job's state.
* Handles consecutive error tracking, exponential backoff, one-shot disable,
* and nextRunAtMs computation. Returns `true` if the job should be deleted.
*/
function applyJobResult(state, job, result) {
	job.state.runningAtMs = void 0;
	job.state.lastRunAtMs = result.startedAt;
	job.state.lastStatus = result.status;
	job.state.lastDurationMs = Math.max(0, result.endedAt - result.startedAt);
	job.state.lastError = result.error;
	job.updatedAtMs = result.endedAt;
	if (result.status === "error") job.state.consecutiveErrors = (job.state.consecutiveErrors ?? 0) + 1;
	else job.state.consecutiveErrors = 0;
	const shouldDelete = job.schedule.kind === "at" && job.deleteAfterRun === true && result.status === "ok";
	if (!shouldDelete) if (job.schedule.kind === "at") {
		job.enabled = false;
		job.state.nextRunAtMs = void 0;
		if (result.status === "error") state.deps.log.warn({
			jobId: job.id,
			jobName: job.name,
			consecutiveErrors: job.state.consecutiveErrors,
			error: result.error
		}, "cron: disabling one-shot job after error");
	} else if (result.status === "error" && job.enabled) {
		const backoff = errorBackoffMs(job.state.consecutiveErrors ?? 1);
		const normalNext = computeJobNextRunAtMs(job, result.endedAt);
		const backoffNext = result.endedAt + backoff;
		job.state.nextRunAtMs = normalNext !== void 0 ? Math.max(normalNext, backoffNext) : backoffNext;
		state.deps.log.info({
			jobId: job.id,
			consecutiveErrors: job.state.consecutiveErrors,
			backoffMs: backoff,
			nextRunAtMs: job.state.nextRunAtMs
		}, "cron: applying error backoff");
	} else if (job.enabled) job.state.nextRunAtMs = computeJobNextRunAtMs(job, result.endedAt);
	else job.state.nextRunAtMs = void 0;
	return shouldDelete;
}
function armTimer(state) {
	if (state.timer) clearTimeout(state.timer);
	state.timer = null;
	if (!state.deps.cronEnabled) {
		state.deps.log.debug({}, "cron: armTimer skipped - scheduler disabled");
		return;
	}
	const nextAt = nextWakeAtMs(state);
	if (!nextAt) {
		const jobCount = state.store?.jobs.length ?? 0;
		const enabledCount = state.store?.jobs.filter((j) => j.enabled).length ?? 0;
		const withNextRun = state.store?.jobs.filter((j) => j.enabled && typeof j.state.nextRunAtMs === "number").length ?? 0;
		state.deps.log.debug({
			jobCount,
			enabledCount,
			withNextRun
		}, "cron: armTimer skipped - no jobs with nextRunAtMs");
		return;
	}
	const now = state.deps.nowMs();
	const delay = Math.max(nextAt - now, 0);
	const clampedDelay = Math.min(delay, MAX_TIMER_DELAY_MS);
	state.timer = setTimeout(async () => {
		try {
			await onTimer(state);
		} catch (err) {
			state.deps.log.error({ err: String(err) }, "cron: timer tick failed");
		}
	}, clampedDelay);
	state.deps.log.debug({
		nextAt,
		delayMs: clampedDelay,
		clamped: delay > MAX_TIMER_DELAY_MS
	}, "cron: timer armed");
}
async function onTimer(state) {
	if (state.running) {
		if (state.timer) clearTimeout(state.timer);
		state.timer = setTimeout(async () => {
			try {
				await onTimer(state);
			} catch (err) {
				state.deps.log.error({ err: String(err) }, "cron: timer tick failed");
			}
		}, MAX_TIMER_DELAY_MS);
		return;
	}
	state.running = true;
	try {
		const dueJobs = await locked(state, async () => {
			await ensureLoaded(state, {
				forceReload: true,
				skipRecompute: true
			});
			const due = findDueJobs(state);
			if (due.length === 0) {
				if (recomputeNextRunsForMaintenance(state)) await persist(state);
				return [];
			}
			const now = state.deps.nowMs();
			for (const job of due) {
				job.state.runningAtMs = now;
				job.state.lastError = void 0;
			}
			await persist(state);
			return due.map((j) => ({
				id: j.id,
				job: j
			}));
		});
		const results = [];
		for (const { id, job } of dueJobs) {
			const startedAt = state.deps.nowMs();
			job.state.runningAtMs = startedAt;
			emit(state, {
				jobId: job.id,
				action: "started",
				runAtMs: startedAt
			});
			const jobTimeoutMs = job.payload.kind === "agentTurn" && typeof job.payload.timeoutSeconds === "number" ? job.payload.timeoutSeconds * 1e3 : DEFAULT_JOB_TIMEOUT_MS;
			try {
				let timeoutId;
				const result = await Promise.race([executeJobCore(state, job), new Promise((_, reject) => {
					timeoutId = setTimeout(() => reject(/* @__PURE__ */ new Error("cron: job execution timed out")), jobTimeoutMs);
				})]).finally(() => clearTimeout(timeoutId));
				results.push({
					jobId: id,
					...result,
					startedAt,
					endedAt: state.deps.nowMs()
				});
			} catch (err) {
				state.deps.log.warn({
					jobId: id,
					jobName: job.name,
					timeoutMs: jobTimeoutMs
				}, `cron: job failed: ${String(err)}`);
				results.push({
					jobId: id,
					status: "error",
					error: String(err),
					startedAt,
					endedAt: state.deps.nowMs()
				});
			}
		}
		if (results.length > 0) await locked(state, async () => {
			await ensureLoaded(state, {
				forceReload: true,
				skipRecompute: true
			});
			for (const result of results) {
				const job = state.store?.jobs.find((j) => j.id === result.jobId);
				if (!job) continue;
				const shouldDelete = applyJobResult(state, job, {
					status: result.status,
					error: result.error,
					startedAt: result.startedAt,
					endedAt: result.endedAt
				});
				emit(state, {
					jobId: job.id,
					action: "finished",
					status: result.status,
					error: result.error,
					summary: result.summary,
					sessionId: result.sessionId,
					sessionKey: result.sessionKey,
					runAtMs: result.startedAt,
					durationMs: job.state.lastDurationMs,
					nextRunAtMs: job.state.nextRunAtMs
				});
				if (shouldDelete && state.store) {
					state.store.jobs = state.store.jobs.filter((j) => j.id !== job.id);
					emit(state, {
						jobId: job.id,
						action: "removed"
					});
				}
			}
			recomputeNextRuns(state);
			await persist(state);
		});
		const storePaths = /* @__PURE__ */ new Set();
		if (state.deps.resolveSessionStorePath) {
			const defaultAgentId = state.deps.defaultAgentId ?? DEFAULT_AGENT_ID;
			if (state.store?.jobs?.length) for (const job of state.store.jobs) {
				const agentId = typeof job.agentId === "string" && job.agentId.trim() ? job.agentId : defaultAgentId;
				storePaths.add(state.deps.resolveSessionStorePath(agentId));
			}
			else storePaths.add(state.deps.resolveSessionStorePath(defaultAgentId));
		} else if (state.deps.sessionStorePath) storePaths.add(state.deps.sessionStorePath);
		if (storePaths.size > 0) {
			const nowMs = state.deps.nowMs();
			for (const storePath of storePaths) try {
				await sweepCronRunSessions({
					cronConfig: state.deps.cronConfig,
					sessionStorePath: storePath,
					nowMs,
					log: state.deps.log
				});
			} catch (err) {
				state.deps.log.warn({
					err: String(err),
					storePath
				}, "cron: session reaper sweep failed");
			}
		}
	} finally {
		state.running = false;
		armTimer(state);
	}
}
function findDueJobs(state) {
	if (!state.store) return [];
	const now = state.deps.nowMs();
	return state.store.jobs.filter((j) => {
		if (!j.state) j.state = {};
		if (!j.enabled) return false;
		if (typeof j.state.runningAtMs === "number") return false;
		const next = j.state.nextRunAtMs;
		return typeof next === "number" && now >= next;
	});
}
async function runMissedJobs(state) {
	if (!state.store) return;
	const now = state.deps.nowMs();
	const missed = state.store.jobs.filter((j) => {
		if (!j.state) j.state = {};
		if (!j.enabled) return false;
		if (typeof j.state.runningAtMs === "number") return false;
		const next = j.state.nextRunAtMs;
		if (j.schedule.kind === "at" && j.state.lastStatus) return false;
		return typeof next === "number" && now >= next;
	});
	if (missed.length > 0) {
		state.deps.log.info({
			count: missed.length,
			jobIds: missed.map((j) => j.id)
		}, "cron: running missed jobs after restart");
		for (const job of missed) await executeJob(state, job, now, { forced: false });
	}
}
async function executeJobCore(state, job) {
	if (job.sessionTarget === "main") {
		const text = resolveJobPayloadTextForMain(job);
		if (!text) return {
			status: "skipped",
			error: job.payload.kind === "systemEvent" ? "main job requires non-empty systemEvent text" : "main job requires payload.kind=\"systemEvent\""
		};
		state.deps.enqueueSystemEvent(text, { agentId: job.agentId });
		if (job.wakeMode === "now" && state.deps.runHeartbeatOnce) {
			const reason = `cron:${job.id}`;
			const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
			const maxWaitMs = 2 * 6e4;
			const waitStartedAt = state.deps.nowMs();
			let heartbeatResult;
			for (;;) {
				heartbeatResult = await state.deps.runHeartbeatOnce({
					reason,
					agentId: job.agentId
				});
				if (heartbeatResult.status !== "skipped" || heartbeatResult.reason !== "requests-in-flight") break;
				if (state.deps.nowMs() - waitStartedAt > maxWaitMs) {
					state.deps.requestHeartbeatNow({ reason });
					return {
						status: "ok",
						summary: text
					};
				}
				await delay(250);
			}
			if (heartbeatResult.status === "ran") return {
				status: "ok",
				summary: text
			};
			else if (heartbeatResult.status === "skipped") return {
				status: "skipped",
				error: heartbeatResult.reason,
				summary: text
			};
			else return {
				status: "error",
				error: heartbeatResult.reason,
				summary: text
			};
		} else {
			state.deps.requestHeartbeatNow({ reason: `cron:${job.id}` });
			return {
				status: "ok",
				summary: text
			};
		}
	}
	if (job.payload.kind !== "agentTurn") return {
		status: "skipped",
		error: "isolated job requires payload.kind=agentTurn"
	};
	const res = await state.deps.runIsolatedAgentJob({
		job,
		message: job.payload.message
	});
	const summaryText = res.summary?.trim();
	const deliveryPlan = resolveCronDeliveryPlan(job);
	if (summaryText && deliveryPlan.requested && !res.delivered) {
		const prefix = "Cron";
		const label = res.status === "error" ? `${prefix} (error): ${summaryText}` : `${prefix}: ${summaryText}`;
		state.deps.enqueueSystemEvent(label, { agentId: job.agentId });
		if (job.wakeMode === "now") state.deps.requestHeartbeatNow({ reason: `cron:${job.id}` });
	}
	return {
		status: res.status,
		error: res.error,
		summary: res.summary,
		sessionId: res.sessionId,
		sessionKey: res.sessionKey
	};
}
/**
* Execute a job. This version is used by the `run` command and other
* places that need the full execution with state updates.
*/
async function executeJob(state, job, _nowMs, _opts) {
	if (!job.state) job.state = {};
	const startedAt = state.deps.nowMs();
	job.state.runningAtMs = startedAt;
	job.state.lastError = void 0;
	emit(state, {
		jobId: job.id,
		action: "started",
		runAtMs: startedAt
	});
	let coreResult;
	try {
		coreResult = await executeJobCore(state, job);
	} catch (err) {
		coreResult = {
			status: "error",
			error: String(err)
		};
	}
	const endedAt = state.deps.nowMs();
	const shouldDelete = applyJobResult(state, job, {
		status: coreResult.status,
		error: coreResult.error,
		startedAt,
		endedAt
	});
	emit(state, {
		jobId: job.id,
		action: "finished",
		status: coreResult.status,
		error: coreResult.error,
		summary: coreResult.summary,
		sessionId: coreResult.sessionId,
		sessionKey: coreResult.sessionKey,
		runAtMs: startedAt,
		durationMs: job.state.lastDurationMs,
		nextRunAtMs: job.state.nextRunAtMs
	});
	if (shouldDelete && state.store) {
		state.store.jobs = state.store.jobs.filter((j) => j.id !== job.id);
		emit(state, {
			jobId: job.id,
			action: "removed"
		});
	}
}
function wake(state, opts) {
	const text = opts.text.trim();
	if (!text) return { ok: false };
	state.deps.enqueueSystemEvent(text);
	if (opts.mode === "now") state.deps.requestHeartbeatNow({ reason: "wake" });
	return { ok: true };
}
function stopTimer(state) {
	if (state.timer) clearTimeout(state.timer);
	state.timer = null;
}
function emit(state, evt) {
	try {
		state.deps.onEvent?.(evt);
	} catch {}
}

//#endregion
//#region src/cron/service/ops.ts
async function start(state) {
	await locked(state, async () => {
		if (!state.deps.cronEnabled) {
			state.deps.log.info({ enabled: false }, "cron: disabled");
			return;
		}
		await ensureLoaded(state, { skipRecompute: true });
		const jobs = state.store?.jobs ?? [];
		for (const job of jobs) if (typeof job.state.runningAtMs === "number") {
			state.deps.log.warn({
				jobId: job.id,
				runningAtMs: job.state.runningAtMs
			}, "cron: clearing stale running marker on startup");
			job.state.runningAtMs = void 0;
		}
		await runMissedJobs(state);
		recomputeNextRuns(state);
		await persist(state);
		armTimer(state);
		state.deps.log.info({
			enabled: true,
			jobs: state.store?.jobs.length ?? 0,
			nextWakeAtMs: nextWakeAtMs(state) ?? null
		}, "cron: started");
	});
}
function stop(state) {
	stopTimer(state);
}
async function status(state) {
	return await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		if (state.store) {
			if (recomputeNextRuns(state)) await persist(state);
		}
		return {
			enabled: state.deps.cronEnabled,
			storePath: state.deps.storePath,
			jobs: state.store?.jobs.length ?? 0,
			nextWakeAtMs: state.deps.cronEnabled ? nextWakeAtMs(state) ?? null : null
		};
	});
}
async function list(state, opts) {
	return await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		if (state.store) {
			if (recomputeNextRuns(state)) await persist(state);
		}
		const includeDisabled = opts?.includeDisabled === true;
		return (state.store?.jobs ?? []).filter((j) => includeDisabled || j.enabled).toSorted((a, b) => (a.state.nextRunAtMs ?? 0) - (b.state.nextRunAtMs ?? 0));
	});
}
async function add(state, input) {
	return await locked(state, async () => {
		warnIfDisabled(state, "add");
		await ensureLoaded(state);
		const job = createJob(state, input);
		state.store?.jobs.push(job);
		recomputeNextRuns(state);
		await persist(state);
		armTimer(state);
		state.deps.log.info({
			jobId: job.id,
			jobName: job.name,
			nextRunAtMs: job.state.nextRunAtMs,
			schedulerNextWakeAtMs: nextWakeAtMs(state) ?? null,
			timerArmed: state.timer !== null,
			cronEnabled: state.deps.cronEnabled
		}, "cron: job added");
		emit(state, {
			jobId: job.id,
			action: "added",
			nextRunAtMs: job.state.nextRunAtMs
		});
		return job;
	});
}
async function update(state, id, patch) {
	return await locked(state, async () => {
		warnIfDisabled(state, "update");
		await ensureLoaded(state);
		const job = findJobOrThrow(state, id);
		const now = state.deps.nowMs();
		applyJobPatch(job, patch);
		if (job.schedule.kind === "every") {
			const anchor = job.schedule.anchorMs;
			if (typeof anchor !== "number" || !Number.isFinite(anchor)) {
				const fallbackAnchorMs = patch.schedule?.kind === "every" ? now : typeof job.createdAtMs === "number" && Number.isFinite(job.createdAtMs) ? job.createdAtMs : now;
				job.schedule = {
					...job.schedule,
					anchorMs: Math.max(0, Math.floor(fallbackAnchorMs))
				};
			}
		}
		const scheduleChanged = patch.schedule !== void 0;
		const enabledChanged = patch.enabled !== void 0;
		job.updatedAtMs = now;
		if (scheduleChanged || enabledChanged) if (job.enabled) job.state.nextRunAtMs = computeJobNextRunAtMs(job, now);
		else {
			job.state.nextRunAtMs = void 0;
			job.state.runningAtMs = void 0;
		}
		await persist(state);
		armTimer(state);
		emit(state, {
			jobId: id,
			action: "updated",
			nextRunAtMs: job.state.nextRunAtMs
		});
		return job;
	});
}
async function remove(state, id) {
	return await locked(state, async () => {
		warnIfDisabled(state, "remove");
		await ensureLoaded(state);
		const before = state.store?.jobs.length ?? 0;
		if (!state.store) return {
			ok: false,
			removed: false
		};
		state.store.jobs = state.store.jobs.filter((j) => j.id !== id);
		const removed = (state.store.jobs.length ?? 0) !== before;
		await persist(state);
		armTimer(state);
		if (removed) emit(state, {
			jobId: id,
			action: "removed"
		});
		return {
			ok: true,
			removed
		};
	});
}
async function run(state, id, mode) {
	return await locked(state, async () => {
		warnIfDisabled(state, "run");
		await ensureLoaded(state, { skipRecompute: true });
		const job = findJobOrThrow(state, id);
		if (typeof job.state.runningAtMs === "number") return {
			ok: true,
			ran: false,
			reason: "already-running"
		};
		const now = state.deps.nowMs();
		if (!isJobDue(job, now, { forced: mode === "force" })) return {
			ok: true,
			ran: false,
			reason: "not-due"
		};
		await executeJob(state, job, now, { forced: mode === "force" });
		recomputeNextRuns(state);
		await persist(state);
		armTimer(state);
		return {
			ok: true,
			ran: true
		};
	});
}
function wakeNow(state, opts) {
	return wake(state, opts);
}

//#endregion
//#region src/cron/service/state.ts
function createCronServiceState(deps) {
	return {
		deps: {
			...deps,
			nowMs: deps.nowMs ?? (() => Date.now())
		},
		store: null,
		timer: null,
		running: false,
		op: Promise.resolve(),
		warnedDisabled: false,
		storeLoadedAtMs: null,
		storeFileMtimeMs: null
	};
}

//#endregion
//#region src/cron/service.ts
var CronService = class {
	constructor(deps) {
		this.state = createCronServiceState(deps);
	}
	async start() {
		await start(this.state);
	}
	stop() {
		stop(this.state);
	}
	async status() {
		return await status(this.state);
	}
	async list(opts) {
		return await list(this.state, opts);
	}
	async add(input) {
		return await add(this.state, input);
	}
	async update(id, patch) {
		return await update(this.state, id, patch);
	}
	async remove(id) {
		return await remove(this.state, id);
	}
	async run(id, mode) {
		return await run(this.state, id, mode);
	}
	wake(opts) {
		return wakeNow(this.state, opts);
	}
};

//#endregion
//#region src/gateway/server-cron.ts
function buildGatewayCronService(params) {
	const cronLogger = getChildLogger({ module: "cron" });
	const storePath = resolveCronStorePath(params.cfg.cron?.store);
	const cronEnabled = process.env.OPENCLAW_SKIP_CRON !== "1" && params.cfg.cron?.enabled !== false;
	const resolveCronAgent = (requested) => {
		const runtimeConfig = loadConfig();
		const normalized = typeof requested === "string" && requested.trim() ? normalizeAgentId(requested) : void 0;
		return {
			agentId: normalized !== void 0 && Array.isArray(runtimeConfig.agents?.list) && runtimeConfig.agents.list.some((entry) => entry && typeof entry.id === "string" && normalizeAgentId(entry.id) === normalized) ? normalized : resolveDefaultAgentId(runtimeConfig),
			cfg: runtimeConfig
		};
	};
	const defaultAgentId = resolveDefaultAgentId(params.cfg);
	const resolveSessionStorePath = (agentId) => resolveStorePath(params.cfg.session?.store, { agentId: agentId ?? defaultAgentId });
	const sessionStorePath = resolveSessionStorePath(defaultAgentId);
	return {
		cron: new CronService({
			storePath,
			cronEnabled,
			cronConfig: params.cfg.cron,
			defaultAgentId,
			resolveSessionStorePath,
			sessionStorePath,
			enqueueSystemEvent: (text, opts) => {
				const { agentId, cfg: runtimeConfig } = resolveCronAgent(opts?.agentId);
				enqueueSystemEvent(text, { sessionKey: resolveAgentMainSessionKey({
					cfg: runtimeConfig,
					agentId
				}) });
			},
			requestHeartbeatNow,
			runHeartbeatOnce: async (opts) => {
				const runtimeConfig = loadConfig();
				const agentId = opts?.agentId ? resolveCronAgent(opts.agentId).agentId : void 0;
				return await runHeartbeatOnce({
					cfg: runtimeConfig,
					reason: opts?.reason,
					agentId,
					deps: {
						...params.deps,
						runtime: defaultRuntime
					}
				});
			},
			runIsolatedAgentJob: async ({ job, message }) => {
				const { agentId, cfg: runtimeConfig } = resolveCronAgent(job.agentId);
				return await runCronIsolatedAgentTurn({
					cfg: runtimeConfig,
					deps: params.deps,
					job,
					message,
					agentId,
					sessionKey: `cron:${job.id}`,
					lane: "cron"
				});
			},
			log: getChildLogger({
				module: "cron",
				storePath
			}),
			onEvent: (evt) => {
				params.broadcast("cron", evt, { dropIfSlow: true });
				if (evt.action === "finished") {
					const logPath = resolveCronRunLogPath({
						storePath,
						jobId: evt.jobId
					});
					appendCronRunLog(logPath, {
						ts: Date.now(),
						jobId: evt.jobId,
						action: "finished",
						status: evt.status,
						error: evt.error,
						summary: evt.summary,
						sessionId: evt.sessionId,
						sessionKey: evt.sessionKey,
						runAtMs: evt.runAtMs,
						durationMs: evt.durationMs,
						nextRunAtMs: evt.nextRunAtMs
					}).catch((err) => {
						cronLogger.warn({
							err: String(err),
							logPath
						}, "cron: run log append failed");
					});
				}
			}
		}),
		storePath,
		cronEnabled
	};
}

//#endregion
//#region src/infra/bonjour-errors.ts
function formatBonjourError(err) {
	if (err instanceof Error) {
		const msg = err.message || String(err);
		return err.name && err.name !== "Error" ? `${err.name}: ${msg}` : msg;
	}
	return String(err);
}

//#endregion
//#region src/infra/bonjour-ciao.ts
function ignoreCiaoCancellationRejection(reason) {
	if (!formatBonjourError(reason).toUpperCase().includes("CIAO ANNOUNCEMENT CANCELLED")) return false;
	logDebug(`bonjour: ignoring unhandled ciao rejection: ${formatBonjourError(reason)}`);
	return true;
}

//#endregion
//#region src/infra/bonjour.ts
function isDisabledByEnv$1() {
	if (isTruthyEnvValue(process.env.OPENCLAW_DISABLE_BONJOUR)) return true;
	if (process.env.VITEST) return true;
	return false;
}
function safeServiceName(name) {
	const trimmed = name.trim();
	return trimmed.length > 0 ? trimmed : "OpenClaw";
}
function prettifyInstanceName(name) {
	const normalized = name.trim().replace(/\s+/g, " ");
	return normalized.replace(/\s+\(OpenClaw\)\s*$/i, "").trim() || normalized;
}
function serviceSummary(label, svc) {
	let fqdn = "unknown";
	let hostname = "unknown";
	let port = -1;
	try {
		fqdn = svc.getFQDN();
	} catch {}
	try {
		hostname = svc.getHostname();
	} catch {}
	try {
		port = svc.getPort();
	} catch {}
	const state = typeof svc.serviceState === "string" ? svc.serviceState : "unknown";
	return `${label} fqdn=${fqdn} host=${hostname} port=${port} state=${state}`;
}
async function startGatewayBonjourAdvertiser(opts) {
	if (isDisabledByEnv$1()) return { stop: async () => {} };
	const { getResponder, Protocol } = await import("@homebridge/ciao");
	const responder = getResponder();
	const hostname = (process.env.OPENCLAW_MDNS_HOSTNAME?.trim() || process.env.CLAWDBOT_MDNS_HOSTNAME?.trim() || "openclaw").replace(/\.local$/i, "").split(".")[0].trim() || "openclaw";
	const instanceName = typeof opts.instanceName === "string" && opts.instanceName.trim() ? opts.instanceName.trim() : `${hostname} (OpenClaw)`;
	const displayName = prettifyInstanceName(instanceName);
	const txtBase = {
		role: "gateway",
		gatewayPort: String(opts.gatewayPort),
		lanHost: `${hostname}.local`,
		displayName
	};
	if (opts.gatewayTlsEnabled) {
		txtBase.gatewayTls = "1";
		if (opts.gatewayTlsFingerprintSha256) txtBase.gatewayTlsSha256 = opts.gatewayTlsFingerprintSha256;
	}
	if (typeof opts.canvasPort === "number" && opts.canvasPort > 0) txtBase.canvasPort = String(opts.canvasPort);
	if (typeof opts.tailnetDns === "string" && opts.tailnetDns.trim()) txtBase.tailnetDns = opts.tailnetDns.trim();
	if (!opts.minimal && typeof opts.cliPath === "string" && opts.cliPath.trim()) txtBase.cliPath = opts.cliPath.trim();
	const services = [];
	const gatewayTxt = {
		...txtBase,
		transport: "gateway"
	};
	if (!opts.minimal) gatewayTxt.sshPort = String(opts.sshPort ?? 22);
	const gateway = responder.createService({
		name: safeServiceName(instanceName),
		type: "openclaw-gw",
		protocol: Protocol.TCP,
		port: opts.gatewayPort,
		domain: "local",
		hostname,
		txt: gatewayTxt
	});
	services.push({
		label: "gateway",
		svc: gateway
	});
	let ciaoCancellationRejectionHandler;
	if (services.length > 0) ciaoCancellationRejectionHandler = registerUnhandledRejectionHandler(ignoreCiaoCancellationRejection);
	logDebug(`bonjour: starting (hostname=${hostname}, instance=${JSON.stringify(safeServiceName(instanceName))}, gatewayPort=${opts.gatewayPort}${opts.minimal ? ", minimal=true" : `, sshPort=${opts.sshPort ?? 22}`})`);
	for (const { label, svc } of services) try {
		svc.on("name-change", (name) => {
			const next = typeof name === "string" ? name : String(name);
			logWarn(`bonjour: ${label} name conflict resolved; newName=${JSON.stringify(next)}`);
		});
		svc.on("hostname-change", (nextHostname) => {
			const next = typeof nextHostname === "string" ? nextHostname : String(nextHostname);
			logWarn(`bonjour: ${label} hostname conflict resolved; newHostname=${JSON.stringify(next)}`);
		});
	} catch (err) {
		logDebug(`bonjour: failed to attach listeners for ${label}: ${String(err)}`);
	}
	for (const { label, svc } of services) try {
		svc.advertise().then(() => {
			getLogger().info(`bonjour: advertised ${serviceSummary(label, svc)}`);
		}).catch((err) => {
			logWarn(`bonjour: advertise failed (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
		});
	} catch (err) {
		logWarn(`bonjour: advertise threw (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
	}
	const lastRepairAttempt = /* @__PURE__ */ new Map();
	const watchdog = setInterval(() => {
		for (const { label, svc } of services) {
			const stateUnknown = svc.serviceState;
			if (typeof stateUnknown !== "string") continue;
			if (stateUnknown === "announced" || stateUnknown === "announcing") continue;
			let key = label;
			try {
				key = `${label}:${svc.getFQDN()}`;
			} catch {}
			const now = Date.now();
			if (now - (lastRepairAttempt.get(key) ?? 0) < 3e4) continue;
			lastRepairAttempt.set(key, now);
			logWarn(`bonjour: watchdog detected non-announced service; attempting re-advertise (${serviceSummary(label, svc)})`);
			try {
				svc.advertise().catch((err) => {
					logWarn(`bonjour: watchdog advertise failed (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
				});
			} catch (err) {
				logWarn(`bonjour: watchdog advertise threw (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
			}
		}
	}, 6e4);
	watchdog.unref?.();
	return { stop: async () => {
		clearInterval(watchdog);
		for (const { svc } of services) try {
			await svc.destroy();
		} catch {}
		try {
			await responder.shutdown();
		} catch {} finally {
			ciaoCancellationRejectionHandler?.();
		}
	} };
}

//#endregion
//#region src/gateway/server-discovery.ts
function formatBonjourInstanceName(displayName) {
	const trimmed = displayName.trim();
	if (!trimmed) return "OpenClaw";
	if (/openclaw/i.test(trimmed)) return trimmed;
	return `${trimmed} (OpenClaw)`;
}
function resolveBonjourCliPath(opts = {}) {
	const envPath = (opts.env ?? process.env).OPENCLAW_CLI_PATH?.trim();
	if (envPath) return envPath;
	const statSync = opts.statSync ?? fs.statSync;
	const isFile = (candidate) => {
		try {
			return statSync(candidate).isFile();
		} catch {
			return false;
		}
	};
	const execPath = opts.execPath ?? process.execPath;
	const execDir = path.dirname(execPath);
	const siblingCli = path.join(execDir, "openclaw");
	if (isFile(siblingCli)) return siblingCli;
	const argvPath = (opts.argv ?? process.argv)[1];
	if (argvPath && isFile(argvPath)) return argvPath;
	const cwd = opts.cwd ?? process.cwd();
	const distCli = path.join(cwd, "dist", "index.js");
	if (isFile(distCli)) return distCli;
	const binCli = path.join(cwd, "bin", "openclaw");
	if (isFile(binCli)) return binCli;
}
async function resolveTailnetDnsHint(opts) {
	const envRaw = (opts?.env ?? process.env).OPENCLAW_TAILNET_DNS?.trim();
	const envValue = envRaw && envRaw.length > 0 ? envRaw.replace(/\.$/, "") : "";
	if (envValue) return envValue;
	if (opts?.enabled === false) return;
	const exec = opts?.exec ?? ((command, args) => runExec(command, args, {
		timeoutMs: 1500,
		maxBuffer: 2e5
	}));
	try {
		return await getTailnetHostname(exec);
	} catch {
		return;
	}
}

//#endregion
//#region src/gateway/server-discovery-runtime.ts
async function startGatewayDiscovery(params) {
	let bonjourStop = null;
	const mdnsMode = params.mdnsMode ?? "minimal";
	const bonjourEnabled = mdnsMode !== "off" && process.env.OPENCLAW_DISABLE_BONJOUR !== "1" && !process.env.VITEST;
	const mdnsMinimal = mdnsMode !== "full";
	const tailscaleEnabled = params.tailscaleMode !== "off";
	const tailnetDns = bonjourEnabled || params.wideAreaDiscoveryEnabled ? await resolveTailnetDnsHint({ enabled: tailscaleEnabled }) : void 0;
	const sshPortEnv = mdnsMinimal ? void 0 : process.env.OPENCLAW_SSH_PORT?.trim();
	const sshPortParsed = sshPortEnv ? Number.parseInt(sshPortEnv, 10) : NaN;
	const sshPort = Number.isFinite(sshPortParsed) && sshPortParsed > 0 ? sshPortParsed : void 0;
	const cliPath = mdnsMinimal ? void 0 : resolveBonjourCliPath();
	if (bonjourEnabled) try {
		bonjourStop = (await startGatewayBonjourAdvertiser({
			instanceName: formatBonjourInstanceName(params.machineDisplayName),
			gatewayPort: params.port,
			gatewayTlsEnabled: params.gatewayTls?.enabled ?? false,
			gatewayTlsFingerprintSha256: params.gatewayTls?.fingerprintSha256,
			canvasPort: params.canvasPort,
			sshPort,
			tailnetDns,
			cliPath,
			minimal: mdnsMinimal
		})).stop;
	} catch (err) {
		params.logDiscovery.warn(`bonjour advertising failed: ${String(err)}`);
	}
	if (params.wideAreaDiscoveryEnabled) {
		const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: params.wideAreaDiscoveryDomain ?? void 0 });
		if (!wideAreaDomain) {
			params.logDiscovery.warn("discovery.wideArea.enabled is true, but no domain was configured; set discovery.wideArea.domain to enable unicast DNS-SD");
			return { bonjourStop };
		}
		const tailnetIPv4 = pickPrimaryTailnetIPv4();
		if (!tailnetIPv4) params.logDiscovery.warn("discovery.wideArea.enabled is true, but no Tailscale IPv4 address was found; skipping unicast DNS-SD zone update");
		else try {
			const tailnetIPv6 = pickPrimaryTailnetIPv6();
			const result = await writeWideAreaGatewayZone({
				domain: wideAreaDomain,
				gatewayPort: params.port,
				displayName: formatBonjourInstanceName(params.machineDisplayName),
				tailnetIPv4,
				tailnetIPv6: tailnetIPv6 ?? void 0,
				gatewayTlsEnabled: params.gatewayTls?.enabled ?? false,
				gatewayTlsFingerprintSha256: params.gatewayTls?.fingerprintSha256,
				tailnetDns,
				sshPort,
				cliPath: resolveBonjourCliPath()
			});
			params.logDiscovery.info(`wide-area DNS-SD ${result.changed ? "updated" : "unchanged"} (${wideAreaDomain} → ${result.zonePath})`);
		} catch (err) {
			params.logDiscovery.warn(`wide-area discovery update failed: ${String(err)}`);
		}
	}
	return { bonjourStop };
}

//#endregion
//#region src/gateway/server-lanes.ts
function applyGatewayLaneConcurrency(cfg) {
	setCommandLaneConcurrency(CommandLane.Cron, cfg.cron?.maxConcurrentRuns ?? 1);
	setCommandLaneConcurrency(CommandLane.Main, resolveAgentMaxConcurrent(cfg));
	setCommandLaneConcurrency(CommandLane.Subagent, resolveSubagentMaxConcurrent(cfg));
}

//#endregion
//#region src/gateway/chat-abort.ts
function isChatStopCommandText(text) {
	const trimmed = text.trim();
	if (!trimmed) return false;
	return trimmed.toLowerCase() === "/stop" || isAbortTrigger(trimmed);
}
function resolveChatRunExpiresAtMs(params) {
	const { now, timeoutMs, graceMs = 6e4, minMs = 2 * 6e4, maxMs = 1440 * 6e4 } = params;
	const target = now + Math.max(0, timeoutMs) + graceMs;
	const min = now + minMs;
	const max = now + maxMs;
	return Math.min(max, Math.max(min, target));
}
function broadcastChatAborted(ops, params) {
	const { runId, sessionKey, stopReason } = params;
	const payload = {
		runId,
		sessionKey,
		seq: (ops.agentRunSeq.get(runId) ?? 0) + 1,
		state: "aborted",
		stopReason
	};
	ops.broadcast("chat", payload);
	ops.nodeSendToSession(sessionKey, "chat", payload);
}
function abortChatRunById(ops, params) {
	const { runId, sessionKey, stopReason } = params;
	const active = ops.chatAbortControllers.get(runId);
	if (!active) return { aborted: false };
	if (active.sessionKey !== sessionKey) return { aborted: false };
	ops.chatAbortedRuns.set(runId, Date.now());
	active.controller.abort();
	ops.chatAbortControllers.delete(runId);
	ops.chatRunBuffers.delete(runId);
	ops.chatDeltaSentAt.delete(runId);
	ops.removeChatRun(runId, runId, sessionKey);
	broadcastChatAborted(ops, {
		runId,
		sessionKey,
		stopReason
	});
	return { aborted: true };
}
function abortChatRunsForSessionKey(ops, params) {
	const { sessionKey, stopReason } = params;
	const runIds = [];
	for (const [runId, active] of ops.chatAbortControllers) {
		if (active.sessionKey !== sessionKey) continue;
		if (abortChatRunById(ops, {
			runId,
			sessionKey,
			stopReason
		}).aborted) runIds.push(runId);
	}
	return {
		aborted: runIds.length > 0,
		runIds
	};
}

//#endregion
//#region src/gateway/server-constants.ts
const MAX_PAYLOAD_BYTES = 8 * 1024 * 1024;
const MAX_BUFFERED_BYTES = 16 * 1024 * 1024;
const DEFAULT_MAX_CHAT_HISTORY_MESSAGES_BYTES = 6 * 1024 * 1024;
let maxChatHistoryMessagesBytes = DEFAULT_MAX_CHAT_HISTORY_MESSAGES_BYTES;
const getMaxChatHistoryMessagesBytes = () => maxChatHistoryMessagesBytes;
const DEFAULT_HANDSHAKE_TIMEOUT_MS = 1e4;
const getHandshakeTimeoutMs = () => {
	if (process.env.VITEST && process.env.OPENCLAW_TEST_HANDSHAKE_TIMEOUT_MS) {
		const parsed = Number(process.env.OPENCLAW_TEST_HANDSHAKE_TIMEOUT_MS);
		if (Number.isFinite(parsed) && parsed > 0) return parsed;
	}
	return DEFAULT_HANDSHAKE_TIMEOUT_MS;
};
const TICK_INTERVAL_MS = 3e4;
const HEALTH_REFRESH_INTERVAL_MS = 6e4;
const DEDUPE_TTL_MS = 5 * 6e4;
const DEDUPE_MAX = 1e3;

//#endregion
//#region src/infra/voicewake.ts
const DEFAULT_TRIGGERS = [
	"openclaw",
	"claude",
	"computer"
];
function resolvePath$1(baseDir) {
	const root = baseDir ?? resolveStateDir();
	return path.join(root, "settings", "voicewake.json");
}
function sanitizeTriggers(triggers) {
	const cleaned = (triggers ?? []).map((w) => typeof w === "string" ? w.trim() : "").filter((w) => w.length > 0);
	return cleaned.length > 0 ? cleaned : DEFAULT_TRIGGERS;
}
async function readJSON$1(filePath) {
	try {
		const raw = await fsPromises.readFile(filePath, "utf8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function writeJSONAtomic$1(filePath, value) {
	const dir = path.dirname(filePath);
	await fsPromises.mkdir(dir, { recursive: true });
	const tmp = `${filePath}.${randomUUID()}.tmp`;
	await fsPromises.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
	await fsPromises.rename(tmp, filePath);
}
let lock$1 = Promise.resolve();
async function withLock$1(fn) {
	const prev = lock$1;
	let release;
	lock$1 = new Promise((resolve) => {
		release = resolve;
	});
	await prev;
	try {
		return await fn();
	} finally {
		release?.();
	}
}
function defaultVoiceWakeTriggers() {
	return [...DEFAULT_TRIGGERS];
}
async function loadVoiceWakeConfig(baseDir) {
	const existing = await readJSON$1(resolvePath$1(baseDir));
	if (!existing) return {
		triggers: defaultVoiceWakeTriggers(),
		updatedAtMs: 0
	};
	return {
		triggers: sanitizeTriggers(existing.triggers),
		updatedAtMs: typeof existing.updatedAtMs === "number" && existing.updatedAtMs > 0 ? existing.updatedAtMs : 0
	};
}
async function setVoiceWakeTriggers(triggers, baseDir) {
	const sanitized = sanitizeTriggers(triggers);
	const filePath = resolvePath$1(baseDir);
	return await withLock$1(async () => {
		const next = {
			triggers: sanitized,
			updatedAtMs: Date.now()
		};
		await writeJSONAtomic$1(filePath, next);
		return next;
	});
}

//#endregion
//#region src/gateway/server-utils.ts
function normalizeVoiceWakeTriggers(input) {
	const cleaned = (Array.isArray(input) ? input : []).map((v) => typeof v === "string" ? v.trim() : "").filter((v) => v.length > 0).slice(0, 32).map((v) => v.slice(0, 64));
	return cleaned.length > 0 ? cleaned : defaultVoiceWakeTriggers();
}
function formatError(err) {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	const statusValue = err?.status;
	const codeValue = err?.code;
	if (statusValue !== void 0 || codeValue !== void 0) return `status=${typeof statusValue === "string" || typeof statusValue === "number" ? String(statusValue) : "unknown"} code=${typeof codeValue === "string" || typeof codeValue === "number" ? String(codeValue) : "unknown"}`;
	try {
		return JSON.stringify(err, null, 2);
	} catch {
		return String(err);
	}
}

//#endregion
//#region src/infra/system-presence.ts
const entries = /* @__PURE__ */ new Map();
const TTL_MS = 300 * 1e3;
const MAX_ENTRIES = 200;
function normalizePresenceKey(key) {
	if (!key) return;
	const trimmed = key.trim();
	if (!trimmed) return;
	return trimmed.toLowerCase();
}
function resolvePrimaryIPv4() {
	const nets = os.networkInterfaces();
	const prefer = ["en0", "eth0"];
	const pick = (names) => {
		for (const name of names) {
			const entry = nets[name]?.find((n) => n.family === "IPv4" && !n.internal);
			if (entry?.address) return entry.address;
		}
		for (const list of Object.values(nets)) {
			const entry = list?.find((n) => n.family === "IPv4" && !n.internal);
			if (entry?.address) return entry.address;
		}
	};
	return pick(prefer) ?? os.hostname();
}
function initSelfPresence() {
	const host = os.hostname();
	const ip = resolvePrimaryIPv4() ?? void 0;
	const version = process.env.OPENCLAW_VERSION ?? process.env.npm_package_version ?? "unknown";
	const modelIdentifier = (() => {
		if (os.platform() === "darwin") {
			const res = spawnSync("sysctl", ["-n", "hw.model"], { encoding: "utf-8" });
			const out = typeof res.stdout === "string" ? res.stdout.trim() : "";
			return out.length > 0 ? out : void 0;
		}
		return os.arch();
	})();
	const macOSVersion = () => {
		const res = spawnSync("sw_vers", ["-productVersion"], { encoding: "utf-8" });
		const out = typeof res.stdout === "string" ? res.stdout.trim() : "";
		return out.length > 0 ? out : os.release();
	};
	const selfEntry = {
		host,
		ip,
		version,
		platform: (() => {
			const p = os.platform();
			const rel = os.release();
			if (p === "darwin") return `macos ${macOSVersion()}`;
			if (p === "win32") return `windows ${rel}`;
			return `${p} ${rel}`;
		})(),
		deviceFamily: (() => {
			const p = os.platform();
			if (p === "darwin") return "Mac";
			if (p === "win32") return "Windows";
			if (p === "linux") return "Linux";
			return p;
		})(),
		modelIdentifier,
		mode: "gateway",
		reason: "self",
		text: `Gateway: ${host}${ip ? ` (${ip})` : ""} · app ${version} · mode gateway · reason self`,
		ts: Date.now()
	};
	const key = host.toLowerCase();
	entries.set(key, selfEntry);
}
function ensureSelfPresence() {
	if (entries.size === 0) initSelfPresence();
}
function touchSelfPresence() {
	const key = os.hostname().toLowerCase();
	const existing = entries.get(key);
	if (existing) entries.set(key, {
		...existing,
		ts: Date.now()
	});
	else initSelfPresence();
}
initSelfPresence();
function parsePresence(text) {
	const trimmed = text.trim();
	const match = trimmed.match(/Node:\s*([^ (]+)\s*\(([^)]+)\)\s*·\s*app\s*([^·]+?)\s*·\s*last input\s*([0-9]+)s ago\s*·\s*mode\s*([^·]+?)\s*·\s*reason\s*(.+)$/i);
	if (!match) return {
		text: trimmed,
		ts: Date.now()
	};
	const [, host, ip, version, lastInputStr, mode, reasonRaw] = match;
	const lastInputSeconds = Number.parseInt(lastInputStr, 10);
	const reason = reasonRaw.trim();
	return {
		host: host.trim(),
		ip: ip.trim(),
		version: version.trim(),
		lastInputSeconds: Number.isFinite(lastInputSeconds) ? lastInputSeconds : void 0,
		mode: mode.trim(),
		reason,
		text: trimmed,
		ts: Date.now()
	};
}
function mergeStringList(...values) {
	const out = /* @__PURE__ */ new Set();
	for (const list of values) {
		if (!Array.isArray(list)) continue;
		for (const item of list) {
			const trimmed = String(item).trim();
			if (trimmed) out.add(trimmed);
		}
	}
	return out.size > 0 ? [...out] : void 0;
}
function updateSystemPresence(payload) {
	ensureSelfPresence();
	const parsed = parsePresence(payload.text);
	const key = normalizePresenceKey(payload.deviceId) || normalizePresenceKey(payload.instanceId) || normalizePresenceKey(parsed.instanceId) || normalizePresenceKey(parsed.host) || parsed.ip || parsed.text.slice(0, 64) || os.hostname().toLowerCase();
	const hadExisting = entries.has(key);
	const existing = entries.get(key) ?? {};
	const merged = {
		...existing,
		...parsed,
		host: payload.host ?? parsed.host ?? existing.host,
		ip: payload.ip ?? parsed.ip ?? existing.ip,
		version: payload.version ?? parsed.version ?? existing.version,
		platform: payload.platform ?? existing.platform,
		deviceFamily: payload.deviceFamily ?? existing.deviceFamily,
		modelIdentifier: payload.modelIdentifier ?? existing.modelIdentifier,
		mode: payload.mode ?? parsed.mode ?? existing.mode,
		lastInputSeconds: payload.lastInputSeconds ?? parsed.lastInputSeconds ?? existing.lastInputSeconds,
		reason: payload.reason ?? parsed.reason ?? existing.reason,
		deviceId: payload.deviceId ?? existing.deviceId,
		roles: mergeStringList(existing.roles, payload.roles),
		scopes: mergeStringList(existing.scopes, payload.scopes),
		instanceId: payload.instanceId ?? parsed.instanceId ?? existing.instanceId,
		text: payload.text || parsed.text || existing.text,
		ts: Date.now()
	};
	entries.set(key, merged);
	const trackKeys = [
		"host",
		"ip",
		"version",
		"mode",
		"reason"
	];
	const changes = {};
	const changedKeys = [];
	for (const k of trackKeys) {
		const prev = existing[k];
		const next = merged[k];
		if (prev !== next) {
			changes[k] = next;
			changedKeys.push(k);
		}
	}
	return {
		key,
		previous: hadExisting ? existing : void 0,
		next: merged,
		changes,
		changedKeys
	};
}
function upsertPresence(key, presence) {
	ensureSelfPresence();
	const normalizedKey = normalizePresenceKey(key) ?? os.hostname().toLowerCase();
	const existing = entries.get(normalizedKey) ?? {};
	const roles = mergeStringList(existing.roles, presence.roles);
	const scopes = mergeStringList(existing.scopes, presence.scopes);
	const merged = {
		...existing,
		...presence,
		roles,
		scopes,
		ts: Date.now(),
		text: presence.text || existing.text || `Node: ${presence.host ?? existing.host ?? "unknown"} · mode ${presence.mode ?? existing.mode ?? "unknown"}`
	};
	entries.set(normalizedKey, merged);
}
function listSystemPresence() {
	ensureSelfPresence();
	const now = Date.now();
	for (const [k, v] of entries) if (now - v.ts > TTL_MS) entries.delete(k);
	if (entries.size > MAX_ENTRIES) {
		const sorted = [...entries.entries()].toSorted((a, b) => a[1].ts - b[1].ts);
		const toDrop = entries.size - MAX_ENTRIES;
		for (let i = 0; i < toDrop; i++) entries.delete(sorted[i][0]);
	}
	touchSelfPresence();
	return [...entries.values()].toSorted((a, b) => b.ts - a.ts);
}

//#endregion
//#region src/gateway/server/health-state.ts
let presenceVersion = 1;
let healthVersion = 1;
let healthCache = null;
let healthRefresh = null;
let broadcastHealthUpdate = null;
function buildGatewaySnapshot() {
	const cfg = loadConfig();
	const defaultAgentId = resolveDefaultAgentId(cfg);
	const mainKey = normalizeMainKey(cfg.session?.mainKey);
	const mainSessionKey = resolveMainSessionKey(cfg);
	const scope = cfg.session?.scope ?? "per-sender";
	const presence = listSystemPresence();
	const uptimeMs = Math.round(process.uptime() * 1e3);
	return {
		presence,
		health: {},
		stateVersion: {
			presence: presenceVersion,
			health: healthVersion
		},
		uptimeMs,
		configPath: CONFIG_PATH,
		stateDir: STATE_DIR,
		sessionDefaults: {
			defaultAgentId,
			mainKey,
			mainSessionKey,
			scope
		}
	};
}
function getHealthCache() {
	return healthCache;
}
function getHealthVersion() {
	return healthVersion;
}
function incrementPresenceVersion() {
	presenceVersion += 1;
	return presenceVersion;
}
function getPresenceVersion() {
	return presenceVersion;
}
function setBroadcastHealthUpdate(fn) {
	broadcastHealthUpdate = fn;
}
async function refreshGatewayHealthSnapshot(opts) {
	if (!healthRefresh) healthRefresh = (async () => {
		const snap = await getHealthSnapshot({ probe: opts?.probe });
		healthCache = snap;
		healthVersion += 1;
		if (broadcastHealthUpdate) broadcastHealthUpdate(snap);
		return snap;
	})().finally(() => {
		healthRefresh = null;
	});
	return healthRefresh;
}

//#endregion
//#region src/gateway/server-maintenance.ts
function startGatewayMaintenanceTimers(params) {
	setBroadcastHealthUpdate((snap) => {
		params.broadcast("health", snap, { stateVersion: {
			presence: params.getPresenceVersion(),
			health: params.getHealthVersion()
		} });
		params.nodeSendToAllSubscribed("health", snap);
	});
	const tickInterval = setInterval(() => {
		const payload = { ts: Date.now() };
		params.broadcast("tick", payload, { dropIfSlow: true });
		params.nodeSendToAllSubscribed("tick", payload);
	}, TICK_INTERVAL_MS);
	const healthInterval = setInterval(() => {
		params.refreshGatewayHealthSnapshot({ probe: true }).catch((err) => params.logHealth.error(`refresh failed: ${formatError(err)}`));
	}, HEALTH_REFRESH_INTERVAL_MS);
	params.refreshGatewayHealthSnapshot({ probe: true }).catch((err) => params.logHealth.error(`initial refresh failed: ${formatError(err)}`));
	return {
		tickInterval,
		healthInterval,
		dedupeCleanup: setInterval(() => {
			const now = Date.now();
			for (const [k, v] of params.dedupe) if (now - v.ts > DEDUPE_TTL_MS) params.dedupe.delete(k);
			if (params.dedupe.size > DEDUPE_MAX) {
				const entries = [...params.dedupe.entries()].toSorted((a, b) => a[1].ts - b[1].ts);
				for (let i = 0; i < params.dedupe.size - DEDUPE_MAX; i++) params.dedupe.delete(entries[i][0]);
			}
			for (const [runId, entry] of params.chatAbortControllers) {
				if (now <= entry.expiresAtMs) continue;
				abortChatRunById({
					chatAbortControllers: params.chatAbortControllers,
					chatRunBuffers: params.chatRunBuffers,
					chatDeltaSentAt: params.chatDeltaSentAt,
					chatAbortedRuns: params.chatRunState.abortedRuns,
					removeChatRun: params.removeChatRun,
					agentRunSeq: params.agentRunSeq,
					broadcast: params.broadcast,
					nodeSendToSession: params.nodeSendToSession
				}, {
					runId,
					sessionKey: entry.sessionKey,
					stopReason: "timeout"
				});
			}
			const ABORTED_RUN_TTL_MS = 60 * 6e4;
			for (const [runId, abortedAt] of params.chatRunState.abortedRuns) {
				if (now - abortedAt <= ABORTED_RUN_TTL_MS) continue;
				params.chatRunState.abortedRuns.delete(runId);
				params.chatRunBuffers.delete(runId);
				params.chatDeltaSentAt.delete(runId);
			}
		}, 6e4)
	};
}

//#endregion
//#region src/gateway/server-methods-list.ts
const BASE_METHODS = [
	"health",
	"logs.tail",
	"channels.status",
	"channels.logout",
	"status",
	"usage.status",
	"usage.cost",
	"tts.status",
	"tts.providers",
	"tts.enable",
	"tts.disable",
	"tts.convert",
	"tts.setProvider",
	"config.get",
	"config.set",
	"config.apply",
	"config.patch",
	"config.schema",
	"exec.approvals.get",
	"exec.approvals.set",
	"exec.approvals.node.get",
	"exec.approvals.node.set",
	"exec.approval.request",
	"exec.approval.waitDecision",
	"exec.approval.resolve",
	"wizard.start",
	"wizard.next",
	"wizard.cancel",
	"wizard.status",
	"talk.config",
	"talk.mode",
	"models.list",
	"agents.list",
	"agents.create",
	"agents.update",
	"agents.delete",
	"agents.files.list",
	"agents.files.get",
	"agents.files.set",
	"skills.status",
	"skills.bins",
	"skills.install",
	"skills.update",
	"update.run",
	"voicewake.get",
	"voicewake.set",
	"sessions.list",
	"sessions.preview",
	"sessions.patch",
	"sessions.reset",
	"sessions.delete",
	"sessions.compact",
	"last-heartbeat",
	"set-heartbeats",
	"wake",
	"node.pair.request",
	"node.pair.list",
	"node.pair.approve",
	"node.pair.reject",
	"node.pair.verify",
	"device.pair.list",
	"device.pair.approve",
	"device.pair.reject",
	"device.token.rotate",
	"device.token.revoke",
	"node.rename",
	"node.list",
	"node.describe",
	"node.invoke",
	"node.invoke.result",
	"node.event",
	"cron.list",
	"cron.status",
	"cron.add",
	"cron.update",
	"cron.remove",
	"cron.run",
	"cron.runs",
	"system-presence",
	"system-event",
	"send",
	"agent",
	"agent.identity.get",
	"agent.wait",
	"browser.request",
	"chat.history",
	"chat.abort",
	"chat.send"
];
function listGatewayMethods() {
	const channelMethods = listChannelPlugins().flatMap((plugin) => plugin.gatewayMethods ?? []);
	return Array.from(new Set([...BASE_METHODS, ...channelMethods]));
}
const GATEWAY_EVENTS = [
	"connect.challenge",
	"agent",
	"chat",
	"presence",
	"tick",
	"talk.mode",
	"shutdown",
	"health",
	"heartbeat",
	"cron",
	"node.pair.requested",
	"node.pair.resolved",
	"node.invoke.request",
	"device.pair.requested",
	"device.pair.resolved",
	"voicewake.changed",
	"exec.approval.requested",
	"exec.approval.resolved"
];

//#endregion
//#region src/gateway/assistant-identity.ts
const MAX_ASSISTANT_NAME = 50;
const MAX_ASSISTANT_AVATAR = 200;
const MAX_ASSISTANT_EMOJI = 16;
const DEFAULT_ASSISTANT_IDENTITY = {
	agentId: "main",
	name: "Assistant",
	avatar: "A"
};
function coerceIdentityValue(value, maxLength) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (trimmed.length <= maxLength) return trimmed;
	return trimmed.slice(0, maxLength);
}
function isAvatarUrl(value) {
	return /^https?:\/\//i.test(value) || /^data:image\//i.test(value);
}
function looksLikeAvatarPath(value) {
	if (/[\\/]/.test(value)) return true;
	return /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(value);
}
function normalizeAvatarValue$1(value) {
	if (!value) return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (isAvatarUrl(trimmed)) return trimmed;
	if (looksLikeAvatarPath(trimmed)) return trimmed;
	if (!/\s/.test(trimmed) && trimmed.length <= 4) return trimmed;
}
function normalizeEmojiValue(value) {
	if (!value) return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (trimmed.length > MAX_ASSISTANT_EMOJI) return;
	let hasNonAscii = false;
	for (let i = 0; i < trimmed.length; i += 1) if (trimmed.charCodeAt(i) > 127) {
		hasNonAscii = true;
		break;
	}
	if (!hasNonAscii) return;
	if (isAvatarUrl(trimmed) || looksLikeAvatarPath(trimmed)) return;
	return trimmed;
}
function resolveAssistantIdentity(params) {
	const agentId = normalizeAgentId(params.agentId ?? resolveDefaultAgentId(params.cfg));
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(params.cfg, agentId);
	const configAssistant = params.cfg.ui?.assistant;
	const agentIdentity = resolveAgentIdentity(params.cfg, agentId);
	const fileIdentity = workspaceDir ? loadAgentIdentity(workspaceDir) : null;
	return {
		agentId,
		name: coerceIdentityValue(configAssistant?.name, MAX_ASSISTANT_NAME) ?? coerceIdentityValue(agentIdentity?.name, MAX_ASSISTANT_NAME) ?? coerceIdentityValue(fileIdentity?.name, MAX_ASSISTANT_NAME) ?? DEFAULT_ASSISTANT_IDENTITY.name,
		avatar: [
			coerceIdentityValue(configAssistant?.avatar, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(agentIdentity?.avatar, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(agentIdentity?.emoji, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(fileIdentity?.avatar, MAX_ASSISTANT_AVATAR),
			coerceIdentityValue(fileIdentity?.emoji, MAX_ASSISTANT_AVATAR)
		].map((candidate) => normalizeAvatarValue$1(candidate)).find(Boolean) ?? DEFAULT_ASSISTANT_IDENTITY.avatar,
		emoji: [
			coerceIdentityValue(agentIdentity?.emoji, MAX_ASSISTANT_EMOJI),
			coerceIdentityValue(fileIdentity?.emoji, MAX_ASSISTANT_EMOJI),
			coerceIdentityValue(agentIdentity?.avatar, MAX_ASSISTANT_EMOJI),
			coerceIdentityValue(fileIdentity?.avatar, MAX_ASSISTANT_EMOJI)
		].map((candidate) => normalizeEmojiValue(candidate)).find(Boolean)
	};
}

//#endregion
//#region src/gateway/chat-attachments.ts
function normalizeMime(mime) {
	if (!mime) return;
	return mime.split(";")[0]?.trim().toLowerCase() || void 0;
}
async function sniffMimeFromBase64(base64) {
	const trimmed = base64.trim();
	if (!trimmed) return;
	const take = Math.min(256, trimmed.length);
	const sliceLen = take - take % 4;
	if (sliceLen < 8) return;
	try {
		return await detectMime({ buffer: Buffer.from(trimmed.slice(0, sliceLen), "base64") });
	} catch {
		return;
	}
}
function isImageMime(mime) {
	return typeof mime === "string" && mime.startsWith("image/");
}
/**
* Parse attachments and extract images as structured content blocks.
* Returns the message text and an array of image content blocks
* compatible with Claude API's image format.
*/
async function parseMessageWithAttachments(message, attachments, opts) {
	const maxBytes = opts?.maxBytes ?? 5e6;
	const log = opts?.log;
	if (!attachments || attachments.length === 0) return {
		message,
		images: []
	};
	const images = [];
	for (const [idx, att] of attachments.entries()) {
		if (!att) continue;
		const mime = att.mimeType ?? "";
		const content = att.content;
		const label = att.fileName || att.type || `attachment-${idx + 1}`;
		if (typeof content !== "string") throw new Error(`attachment ${label}: content must be base64 string`);
		let sizeBytes = 0;
		let b64 = content.trim();
		const dataUrlMatch = /^data:[^;]+;base64,(.*)$/.exec(b64);
		if (dataUrlMatch) b64 = dataUrlMatch[1];
		if (b64.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(b64)) throw new Error(`attachment ${label}: invalid base64 content`);
		try {
			sizeBytes = Buffer.from(b64, "base64").byteLength;
		} catch {
			throw new Error(`attachment ${label}: invalid base64 content`);
		}
		if (sizeBytes <= 0 || sizeBytes > maxBytes) throw new Error(`attachment ${label}: exceeds size limit (${sizeBytes} > ${maxBytes} bytes)`);
		const providedMime = normalizeMime(mime);
		const sniffedMime = normalizeMime(await sniffMimeFromBase64(b64));
		if (sniffedMime && !isImageMime(sniffedMime)) {
			log?.warn(`attachment ${label}: detected non-image (${sniffedMime}), dropping`);
			continue;
		}
		if (!sniffedMime && !isImageMime(providedMime)) {
			log?.warn(`attachment ${label}: unable to detect image mime type, dropping`);
			continue;
		}
		if (sniffedMime && providedMime && sniffedMime !== providedMime) log?.warn(`attachment ${label}: mime mismatch (${providedMime} -> ${sniffedMime}), using sniffed`);
		images.push({
			type: "image",
			data: b64,
			mimeType: sniffedMime ?? providedMime ?? mime
		});
	}
	return {
		message,
		images
	};
}

//#endregion
//#region src/gateway/server-methods/agent-job.ts
const AGENT_RUN_CACHE_TTL_MS = 10 * 6e4;
const agentRunCache = /* @__PURE__ */ new Map();
const agentRunStarts = /* @__PURE__ */ new Map();
let agentRunListenerStarted = false;
function pruneAgentRunCache(now = Date.now()) {
	for (const [runId, entry] of agentRunCache) if (now - entry.ts > AGENT_RUN_CACHE_TTL_MS) agentRunCache.delete(runId);
}
function recordAgentRunSnapshot(entry) {
	pruneAgentRunCache(entry.ts);
	agentRunCache.set(entry.runId, entry);
}
function ensureAgentRunListener() {
	if (agentRunListenerStarted) return;
	agentRunListenerStarted = true;
	onAgentEvent((evt) => {
		if (!evt) return;
		if (evt.stream !== "lifecycle") return;
		const phase = evt.data?.phase;
		if (phase === "start") {
			const startedAt = typeof evt.data?.startedAt === "number" ? evt.data.startedAt : void 0;
			agentRunStarts.set(evt.runId, startedAt ?? Date.now());
			return;
		}
		if (phase !== "end" && phase !== "error") return;
		const startedAt = typeof evt.data?.startedAt === "number" ? evt.data.startedAt : agentRunStarts.get(evt.runId);
		const endedAt = typeof evt.data?.endedAt === "number" ? evt.data.endedAt : void 0;
		const error = typeof evt.data?.error === "string" ? evt.data.error : void 0;
		agentRunStarts.delete(evt.runId);
		recordAgentRunSnapshot({
			runId: evt.runId,
			status: phase === "error" ? "error" : evt.data?.aborted ? "timeout" : "ok",
			startedAt,
			endedAt,
			error,
			ts: Date.now()
		});
	});
}
function getCachedAgentRun(runId) {
	pruneAgentRunCache();
	return agentRunCache.get(runId);
}
async function waitForAgentJob(params) {
	const { runId, timeoutMs } = params;
	ensureAgentRunListener();
	const cached = getCachedAgentRun(runId);
	if (cached) return cached;
	if (timeoutMs <= 0) return null;
	return await new Promise((resolve) => {
		let settled = false;
		const finish = (entry) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			unsubscribe();
			resolve(entry);
		};
		const unsubscribe = onAgentEvent((evt) => {
			if (!evt || evt.stream !== "lifecycle") return;
			if (evt.runId !== runId) return;
			const phase = evt.data?.phase;
			if (phase !== "end" && phase !== "error") return;
			const cached = getCachedAgentRun(runId);
			if (cached) {
				finish(cached);
				return;
			}
			const startedAt = typeof evt.data?.startedAt === "number" ? evt.data.startedAt : agentRunStarts.get(evt.runId);
			const endedAt = typeof evt.data?.endedAt === "number" ? evt.data.endedAt : void 0;
			const error = typeof evt.data?.error === "string" ? evt.data.error : void 0;
			const snapshot = {
				runId: evt.runId,
				status: phase === "error" ? "error" : evt.data?.aborted ? "timeout" : "ok",
				startedAt,
				endedAt,
				error,
				ts: Date.now()
			};
			recordAgentRunSnapshot(snapshot);
			finish(snapshot);
		});
		const timerDelayMs = Math.max(1, Math.min(Math.floor(timeoutMs), 2147483647));
		const timer = setTimeout(() => finish(null), timerDelayMs);
	});
}
ensureAgentRunListener();

//#endregion
//#region src/gateway/server-methods/agent-timestamp.ts
/**
* Cron jobs inject "Current time: ..." into their messages.
* Skip injection for those.
*/
const CRON_TIME_PATTERN = /Current time: /;
/**
* Matches a leading `[... YYYY-MM-DD HH:MM ...]` envelope — either from
* channel plugins or from a previous injection. Uses the same YYYY-MM-DD
* HH:MM format as {@link formatZonedTimestamp}, so detection stays in sync
* with the formatting.
*/
const TIMESTAMP_ENVELOPE_PATTERN = /^\[.*\d{4}-\d{2}-\d{2} \d{2}:\d{2}/;
/**
* Injects a compact timestamp prefix into a message if one isn't already
* present. Uses the same `YYYY-MM-DD HH:MM TZ` format as channel envelope
* timestamps ({@link formatZonedTimestamp}), keeping token cost low (~7
* tokens) and format consistent across all agent contexts.
*
* Used by the gateway `agent` and `chat.send` handlers to give TUI, web,
* spawned subagents, `sessions_send`, and heartbeat wake events date/time
* awareness — without modifying the system prompt (which is cached).
*
* Channel messages (Discord, Telegram, etc.) already have timestamps via
* envelope formatting and take a separate code path — they never reach
* these handlers, so there is no double-stamping risk. The detection
* pattern is a safety net for edge cases.
*
* @see https://github.com/moltbot/moltbot/issues/3658
*/
function injectTimestamp(message, opts) {
	if (!message.trim()) return message;
	if (TIMESTAMP_ENVELOPE_PATTERN.test(message)) return message;
	if (CRON_TIME_PATTERN.test(message)) return message;
	const now = opts?.now ?? /* @__PURE__ */ new Date();
	const timezone = opts?.timezone ?? "UTC";
	const formatted = formatZonedTimestamp(now, { timeZone: timezone });
	if (!formatted) return message;
	return `[${new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		weekday: "short"
	}).format(now)} ${formatted}] ${message}`;
}
/**
* Build TimestampInjectionOptions from an OpenClawConfig.
*/
function timestampOptsFromConfig(cfg) {
	return { timezone: resolveUserTimezone(cfg.agents?.defaults?.userTimezone) };
}

//#endregion
//#region src/gateway/server-methods/agent.ts
const agentHandlers = {
	agent: async ({ params, respond, context, client }) => {
		const p = params;
		if (!validateAgentParams(p)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: ${formatValidationErrors(validateAgentParams.errors)}`));
			return;
		}
		const request = p;
		const cfg = loadConfig();
		const idem = request.idempotencyKey;
		const groupIdRaw = typeof request.groupId === "string" ? request.groupId.trim() : "";
		const groupChannelRaw = typeof request.groupChannel === "string" ? request.groupChannel.trim() : "";
		const groupSpaceRaw = typeof request.groupSpace === "string" ? request.groupSpace.trim() : "";
		let resolvedGroupId = groupIdRaw || void 0;
		let resolvedGroupChannel = groupChannelRaw || void 0;
		let resolvedGroupSpace = groupSpaceRaw || void 0;
		let spawnedByValue = typeof request.spawnedBy === "string" ? request.spawnedBy.trim() : void 0;
		const inputProvenance = normalizeInputProvenance(request.inputProvenance);
		const cached = context.dedupe.get(`agent:${idem}`);
		if (cached) {
			respond(cached.ok, cached.payload, cached.error, { cached: true });
			return;
		}
		const normalizedAttachments = request.attachments?.map((a) => ({
			type: typeof a?.type === "string" ? a.type : void 0,
			mimeType: typeof a?.mimeType === "string" ? a.mimeType : void 0,
			fileName: typeof a?.fileName === "string" ? a.fileName : void 0,
			content: typeof a?.content === "string" ? a.content : ArrayBuffer.isView(a?.content) ? Buffer.from(a.content.buffer, a.content.byteOffset, a.content.byteLength).toString("base64") : void 0
		})).filter((a) => a.content) ?? [];
		let message = request.message.trim();
		let images = [];
		if (normalizedAttachments.length > 0) try {
			const parsed = await parseMessageWithAttachments(message, normalizedAttachments, {
				maxBytes: 5e6,
				log: context.logGateway
			});
			message = parsed.message.trim();
			images = parsed.images;
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, String(err)));
			return;
		}
		message = injectTimestamp(message, timestampOptsFromConfig(cfg));
		const isKnownGatewayChannel = (value) => isGatewayMessageChannel(value);
		const channelHints = [request.channel, request.replyChannel].filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean);
		for (const rawChannel of channelHints) {
			const normalized = normalizeMessageChannel(rawChannel);
			if (normalized && normalized !== "last" && !isKnownGatewayChannel(normalized)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: unknown channel: ${String(normalized)}`));
				return;
			}
		}
		const agentIdRaw = typeof request.agentId === "string" ? request.agentId.trim() : "";
		const agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : void 0;
		if (agentId) {
			if (!listAgentIds(cfg).includes(agentId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: unknown agent id "${request.agentId}"`));
				return;
			}
		}
		const requestedSessionKeyRaw = typeof request.sessionKey === "string" && request.sessionKey.trim() ? request.sessionKey.trim() : void 0;
		const requestedSessionKey = requestedSessionKeyRaw ?? resolveExplicitAgentSessionKey({
			cfg,
			agentId
		});
		if (agentId && requestedSessionKeyRaw) {
			const sessionAgentId = resolveAgentIdFromSessionKey(requestedSessionKeyRaw);
			if (sessionAgentId !== agentId) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: agent "${request.agentId}" does not match session key agent "${sessionAgentId}"`));
				return;
			}
		}
		let resolvedSessionId = request.sessionId?.trim() || void 0;
		let sessionEntry;
		let bestEffortDeliver = false;
		let cfgForAgent;
		let resolvedSessionKey = requestedSessionKey;
		if (requestedSessionKey) {
			const { cfg, storePath, entry, canonicalKey } = loadSessionEntry(requestedSessionKey);
			cfgForAgent = cfg;
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			const labelValue = request.label?.trim() || entry?.label;
			spawnedByValue = canonicalizeSpawnedByForAgent(cfg, resolveAgentIdFromSessionKey(canonicalKey), spawnedByValue || entry?.spawnedBy);
			let inheritedGroup;
			if (spawnedByValue && (!resolvedGroupId || !resolvedGroupChannel || !resolvedGroupSpace)) try {
				const parentEntry = loadSessionEntry(spawnedByValue)?.entry;
				inheritedGroup = {
					groupId: parentEntry?.groupId,
					groupChannel: parentEntry?.groupChannel,
					groupSpace: parentEntry?.space
				};
			} catch {
				inheritedGroup = void 0;
			}
			resolvedGroupId = resolvedGroupId || inheritedGroup?.groupId;
			resolvedGroupChannel = resolvedGroupChannel || inheritedGroup?.groupChannel;
			resolvedGroupSpace = resolvedGroupSpace || inheritedGroup?.groupSpace;
			const deliveryFields = normalizeSessionDeliveryFields(entry);
			const nextEntry = {
				sessionId,
				updatedAt: now,
				thinkingLevel: entry?.thinkingLevel,
				verboseLevel: entry?.verboseLevel,
				reasoningLevel: entry?.reasoningLevel,
				systemSent: entry?.systemSent,
				sendPolicy: entry?.sendPolicy,
				skillsSnapshot: entry?.skillsSnapshot,
				deliveryContext: deliveryFields.deliveryContext,
				lastChannel: deliveryFields.lastChannel ?? entry?.lastChannel,
				lastTo: deliveryFields.lastTo ?? entry?.lastTo,
				lastAccountId: deliveryFields.lastAccountId ?? entry?.lastAccountId,
				modelOverride: entry?.modelOverride,
				providerOverride: entry?.providerOverride,
				label: labelValue,
				spawnedBy: spawnedByValue,
				channel: entry?.channel ?? request.channel?.trim(),
				groupId: resolvedGroupId ?? entry?.groupId,
				groupChannel: resolvedGroupChannel ?? entry?.groupChannel,
				space: resolvedGroupSpace ?? entry?.space,
				cliSessionIds: entry?.cliSessionIds,
				claudeCliSessionId: entry?.claudeCliSessionId
			};
			sessionEntry = nextEntry;
			if (resolveSendPolicy({
				cfg,
				entry,
				sessionKey: canonicalKey,
				channel: entry?.channel,
				chatType: entry?.chatType
			}) === "deny") {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "send blocked by session policy"));
				return;
			}
			resolvedSessionId = sessionId;
			const canonicalSessionKey = canonicalKey;
			resolvedSessionKey = canonicalSessionKey;
			const mainSessionKey = resolveAgentMainSessionKey({
				cfg,
				agentId: resolveAgentIdFromSessionKey(canonicalSessionKey)
			});
			if (storePath) await updateSessionStore(storePath, (store) => {
				const target = resolveGatewaySessionStoreTarget({
					cfg,
					key: requestedSessionKey,
					store
				});
				pruneLegacyStoreKeys({
					store,
					canonicalKey: target.canonicalKey,
					candidates: target.storeKeys
				});
				store[canonicalSessionKey] = nextEntry;
			});
			if (canonicalSessionKey === mainSessionKey || canonicalSessionKey === "global") {
				context.addChatRun(idem, {
					sessionKey: canonicalSessionKey,
					clientRunId: idem
				});
				bestEffortDeliver = true;
			}
			registerAgentRunContext(idem, { sessionKey: canonicalSessionKey });
		}
		const runId = idem;
		const connId = typeof client?.connId === "string" ? client.connId : void 0;
		const wantsToolEvents = hasGatewayClientCap(client?.connect?.caps, GATEWAY_CLIENT_CAPS.TOOL_EVENTS);
		if (connId && wantsToolEvents) {
			context.registerToolEventRecipient(runId, connId);
			for (const [activeRunId, active] of context.chatAbortControllers) if (activeRunId !== runId && active.sessionKey === requestedSessionKey) context.registerToolEventRecipient(activeRunId, connId);
		}
		const wantsDelivery = request.deliver === true;
		const explicitTo = typeof request.replyTo === "string" && request.replyTo.trim() ? request.replyTo.trim() : typeof request.to === "string" && request.to.trim() ? request.to.trim() : void 0;
		const explicitThreadId = typeof request.threadId === "string" && request.threadId.trim() ? request.threadId.trim() : void 0;
		const deliveryPlan = resolveAgentDeliveryPlan({
			sessionEntry,
			requestedChannel: request.replyChannel ?? request.channel,
			explicitTo,
			explicitThreadId,
			accountId: request.replyAccountId ?? request.accountId,
			wantsDelivery
		});
		const resolvedChannel = deliveryPlan.resolvedChannel;
		const deliveryTargetMode = deliveryPlan.deliveryTargetMode;
		const resolvedAccountId = deliveryPlan.resolvedAccountId;
		let resolvedTo = deliveryPlan.resolvedTo;
		if (!resolvedTo && isDeliverableMessageChannel(resolvedChannel)) {
			const fallback = resolveAgentOutboundTarget({
				cfg: cfgForAgent ?? cfg,
				plan: deliveryPlan,
				targetMode: "implicit",
				validateExplicitTarget: false
			});
			if (fallback.resolvedTarget?.ok) resolvedTo = fallback.resolvedTo;
		}
		const deliver = request.deliver === true && resolvedChannel !== INTERNAL_MESSAGE_CHANNEL;
		const accepted = {
			runId,
			status: "accepted",
			acceptedAt: Date.now()
		};
		context.dedupe.set(`agent:${idem}`, {
			ts: Date.now(),
			ok: true,
			payload: accepted
		});
		respond(true, accepted, void 0, { runId });
		const resolvedThreadId = explicitThreadId ?? deliveryPlan.resolvedThreadId;
		agentCommand({
			message,
			images,
			to: resolvedTo,
			sessionId: resolvedSessionId,
			sessionKey: resolvedSessionKey,
			thinking: request.thinking,
			deliver,
			deliveryTargetMode,
			channel: resolvedChannel,
			accountId: resolvedAccountId,
			threadId: resolvedThreadId,
			runContext: {
				messageChannel: resolvedChannel,
				accountId: resolvedAccountId,
				groupId: resolvedGroupId,
				groupChannel: resolvedGroupChannel,
				groupSpace: resolvedGroupSpace,
				currentThreadTs: resolvedThreadId != null ? String(resolvedThreadId) : void 0
			},
			groupId: resolvedGroupId,
			groupChannel: resolvedGroupChannel,
			groupSpace: resolvedGroupSpace,
			spawnedBy: spawnedByValue,
			timeout: request.timeout?.toString(),
			bestEffortDeliver,
			messageChannel: resolvedChannel,
			runId,
			lane: request.lane,
			extraSystemPrompt: request.extraSystemPrompt,
			inputProvenance
		}, defaultRuntime, context.deps).then((result) => {
			const payload = {
				runId,
				status: "ok",
				summary: "completed",
				result
			};
			context.dedupe.set(`agent:${idem}`, {
				ts: Date.now(),
				ok: true,
				payload
			});
			respond(true, payload, void 0, { runId });
		}).catch((err) => {
			const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
			const payload = {
				runId,
				status: "error",
				summary: String(err)
			};
			context.dedupe.set(`agent:${idem}`, {
				ts: Date.now(),
				ok: false,
				payload,
				error
			});
			respond(false, payload, error, {
				runId,
				error: formatForLog(err)
			});
		});
	},
	"agent.identity.get": ({ params, respond }) => {
		if (!validateAgentIdentityParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent.identity.get params: ${formatValidationErrors(validateAgentIdentityParams.errors)}`));
			return;
		}
		const p = params;
		const agentIdRaw = typeof p.agentId === "string" ? p.agentId.trim() : "";
		const sessionKeyRaw = typeof p.sessionKey === "string" ? p.sessionKey.trim() : "";
		let agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : void 0;
		if (sessionKeyRaw) {
			const resolved = resolveAgentIdFromSessionKey(sessionKeyRaw);
			if (agentId && resolved !== agentId) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent.identity.get params: agent "${agentIdRaw}" does not match session key agent "${resolved}"`));
				return;
			}
			agentId = resolved;
		}
		const cfg = loadConfig();
		const identity = resolveAssistantIdentity({
			cfg,
			agentId
		});
		const avatarValue = resolveAssistantAvatarUrl({
			avatar: identity.avatar,
			agentId: identity.agentId,
			basePath: cfg.gateway?.controlUi?.basePath
		}) ?? identity.avatar;
		respond(true, {
			...identity,
			avatar: avatarValue
		}, void 0);
	},
	"agent.wait": async ({ params, respond }) => {
		if (!validateAgentWaitParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent.wait params: ${formatValidationErrors(validateAgentWaitParams.errors)}`));
			return;
		}
		const p = params;
		const runId = p.runId.trim();
		const snapshot = await waitForAgentJob({
			runId,
			timeoutMs: typeof p.timeoutMs === "number" && Number.isFinite(p.timeoutMs) ? Math.max(0, Math.floor(p.timeoutMs)) : 3e4
		});
		if (!snapshot) {
			respond(true, {
				runId,
				status: "timeout"
			});
			return;
		}
		respond(true, {
			runId,
			status: snapshot.status,
			startedAt: snapshot.startedAt,
			endedAt: snapshot.endedAt,
			error: snapshot.error
		});
	}
};

//#endregion
//#region src/gateway/server-methods/agents.ts
const BOOTSTRAP_FILE_NAMES = [
	DEFAULT_AGENTS_FILENAME,
	DEFAULT_SOUL_FILENAME,
	DEFAULT_TOOLS_FILENAME,
	DEFAULT_IDENTITY_FILENAME,
	DEFAULT_USER_FILENAME,
	DEFAULT_HEARTBEAT_FILENAME,
	DEFAULT_BOOTSTRAP_FILENAME
];
const MEMORY_FILE_NAMES = [DEFAULT_MEMORY_FILENAME, DEFAULT_MEMORY_ALT_FILENAME];
const ALLOWED_FILE_NAMES = new Set([...BOOTSTRAP_FILE_NAMES, ...MEMORY_FILE_NAMES]);
async function statFile(filePath) {
	try {
		const stat = await fsPromises.stat(filePath);
		if (!stat.isFile()) return null;
		return {
			size: stat.size,
			updatedAtMs: Math.floor(stat.mtimeMs)
		};
	} catch {
		return null;
	}
}
async function listAgentFiles(workspaceDir) {
	const files = [];
	for (const name of BOOTSTRAP_FILE_NAMES) {
		const filePath = path.join(workspaceDir, name);
		const meta = await statFile(filePath);
		if (meta) files.push({
			name,
			path: filePath,
			missing: false,
			size: meta.size,
			updatedAtMs: meta.updatedAtMs
		});
		else files.push({
			name,
			path: filePath,
			missing: true
		});
	}
	const primaryMemoryPath = path.join(workspaceDir, DEFAULT_MEMORY_FILENAME);
	const primaryMeta = await statFile(primaryMemoryPath);
	if (primaryMeta) files.push({
		name: DEFAULT_MEMORY_FILENAME,
		path: primaryMemoryPath,
		missing: false,
		size: primaryMeta.size,
		updatedAtMs: primaryMeta.updatedAtMs
	});
	else {
		const altMemoryPath = path.join(workspaceDir, DEFAULT_MEMORY_ALT_FILENAME);
		const altMeta = await statFile(altMemoryPath);
		if (altMeta) files.push({
			name: DEFAULT_MEMORY_ALT_FILENAME,
			path: altMemoryPath,
			missing: false,
			size: altMeta.size,
			updatedAtMs: altMeta.updatedAtMs
		});
		else files.push({
			name: DEFAULT_MEMORY_FILENAME,
			path: primaryMemoryPath,
			missing: true
		});
	}
	return files;
}
function resolveAgentIdOrError(agentIdRaw, cfg) {
	const agentId = normalizeAgentId(agentIdRaw);
	if (!new Set(listAgentIds(cfg)).has(agentId)) return null;
	return agentId;
}
function sanitizeIdentityLine(value) {
	return value.replace(/\s+/g, " ").trim();
}
function resolveOptionalStringParam(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
async function moveToTrashBestEffort(pathname) {
	if (!pathname) return;
	try {
		await fsPromises.access(pathname);
	} catch {
		return;
	}
	try {
		await movePathToTrash(pathname);
	} catch {}
}
const agentsHandlers = {
	"agents.list": ({ params, respond }) => {
		if (!validateAgentsListParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agents.list params: ${formatValidationErrors(validateAgentsListParams.errors)}`));
			return;
		}
		respond(true, listAgentsForGateway(loadConfig()), void 0);
	},
	"agents.create": async ({ params, respond }) => {
		if (!validateAgentsCreateParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agents.create params: ${formatValidationErrors(validateAgentsCreateParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const rawName = String(params.name ?? "").trim();
		const agentId = normalizeAgentId(rawName);
		if (agentId === DEFAULT_AGENT_ID) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `"${DEFAULT_AGENT_ID}" is reserved`));
			return;
		}
		if (findAgentEntryIndex(listAgentEntries(cfg), agentId) >= 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `agent "${agentId}" already exists`));
			return;
		}
		const workspaceDir = resolveUserPath(String(params.workspace ?? "").trim());
		let nextConfig = applyAgentConfig(cfg, {
			agentId,
			name: rawName,
			workspace: workspaceDir
		});
		const agentDir = resolveAgentDir(nextConfig, agentId);
		nextConfig = applyAgentConfig(nextConfig, {
			agentId,
			agentDir
		});
		await ensureAgentWorkspace({
			dir: workspaceDir,
			ensureBootstrapFiles: !Boolean(nextConfig.agents?.defaults?.skipBootstrap)
		});
		await fsPromises.mkdir(resolveSessionTranscriptsDirForAgent(agentId), { recursive: true });
		await writeConfigFile(nextConfig);
		const safeName = sanitizeIdentityLine(rawName);
		const emoji = resolveOptionalStringParam(params.emoji);
		const avatar = resolveOptionalStringParam(params.avatar);
		const identityPath = path.join(workspaceDir, DEFAULT_IDENTITY_FILENAME);
		const lines = [
			"",
			`- Name: ${safeName}`,
			...emoji ? [`- Emoji: ${sanitizeIdentityLine(emoji)}`] : [],
			...avatar ? [`- Avatar: ${sanitizeIdentityLine(avatar)}`] : [],
			""
		];
		await fsPromises.appendFile(identityPath, lines.join("\n"), "utf-8");
		respond(true, {
			ok: true,
			agentId,
			name: rawName,
			workspace: workspaceDir
		}, void 0);
	},
	"agents.update": async ({ params, respond }) => {
		if (!validateAgentsUpdateParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agents.update params: ${formatValidationErrors(validateAgentsUpdateParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const agentId = normalizeAgentId(String(params.agentId ?? ""));
		if (findAgentEntryIndex(listAgentEntries(cfg), agentId) < 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `agent "${agentId}" not found`));
			return;
		}
		const workspaceDir = typeof params.workspace === "string" && params.workspace.trim() ? resolveUserPath(params.workspace.trim()) : void 0;
		const model = resolveOptionalStringParam(params.model);
		const avatar = resolveOptionalStringParam(params.avatar);
		const nextConfig = applyAgentConfig(cfg, {
			agentId,
			...typeof params.name === "string" && params.name.trim() ? { name: params.name.trim() } : {},
			...workspaceDir ? { workspace: workspaceDir } : {},
			...model ? { model } : {}
		});
		await writeConfigFile(nextConfig);
		if (workspaceDir) await ensureAgentWorkspace({
			dir: workspaceDir,
			ensureBootstrapFiles: !Boolean(nextConfig.agents?.defaults?.skipBootstrap)
		});
		if (avatar) {
			const workspace = workspaceDir ?? resolveAgentWorkspaceDir(nextConfig, agentId);
			await fsPromises.mkdir(workspace, { recursive: true });
			const identityPath = path.join(workspace, DEFAULT_IDENTITY_FILENAME);
			await fsPromises.appendFile(identityPath, `\n- Avatar: ${sanitizeIdentityLine(avatar)}\n`, "utf-8");
		}
		respond(true, {
			ok: true,
			agentId
		}, void 0);
	},
	"agents.delete": async ({ params, respond }) => {
		if (!validateAgentsDeleteParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agents.delete params: ${formatValidationErrors(validateAgentsDeleteParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const agentId = normalizeAgentId(String(params.agentId ?? ""));
		if (agentId === DEFAULT_AGENT_ID) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `"${DEFAULT_AGENT_ID}" cannot be deleted`));
			return;
		}
		if (findAgentEntryIndex(listAgentEntries(cfg), agentId) < 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `agent "${agentId}" not found`));
			return;
		}
		const deleteFiles = typeof params.deleteFiles === "boolean" ? params.deleteFiles : true;
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const agentDir = resolveAgentDir(cfg, agentId);
		const sessionsDir = resolveSessionTranscriptsDirForAgent(agentId);
		const result = pruneAgentConfig(cfg, agentId);
		await writeConfigFile(result.config);
		if (deleteFiles) await Promise.all([
			moveToTrashBestEffort(workspaceDir),
			moveToTrashBestEffort(agentDir),
			moveToTrashBestEffort(sessionsDir)
		]);
		respond(true, {
			ok: true,
			agentId,
			removedBindings: result.removedBindings
		}, void 0);
	},
	"agents.files.list": async ({ params, respond }) => {
		if (!validateAgentsFilesListParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agents.files.list params: ${formatValidationErrors(validateAgentsFilesListParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const agentId = resolveAgentIdOrError(String(params.agentId ?? ""), cfg);
		if (!agentId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown agent id"));
			return;
		}
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		respond(true, {
			agentId,
			workspace: workspaceDir,
			files: await listAgentFiles(workspaceDir)
		}, void 0);
	},
	"agents.files.get": async ({ params, respond }) => {
		if (!validateAgentsFilesGetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agents.files.get params: ${formatValidationErrors(validateAgentsFilesGetParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const agentId = resolveAgentIdOrError(String(params.agentId ?? ""), cfg);
		if (!agentId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown agent id"));
			return;
		}
		const name = String(params.name ?? "").trim();
		if (!ALLOWED_FILE_NAMES.has(name)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported file "${name}"`));
			return;
		}
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const filePath = path.join(workspaceDir, name);
		const meta = await statFile(filePath);
		if (!meta) {
			respond(true, {
				agentId,
				workspace: workspaceDir,
				file: {
					name,
					path: filePath,
					missing: true
				}
			}, void 0);
			return;
		}
		const content = await fsPromises.readFile(filePath, "utf-8");
		respond(true, {
			agentId,
			workspace: workspaceDir,
			file: {
				name,
				path: filePath,
				missing: false,
				size: meta.size,
				updatedAtMs: meta.updatedAtMs,
				content
			}
		}, void 0);
	},
	"agents.files.set": async ({ params, respond }) => {
		if (!validateAgentsFilesSetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agents.files.set params: ${formatValidationErrors(validateAgentsFilesSetParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const agentId = resolveAgentIdOrError(String(params.agentId ?? ""), cfg);
		if (!agentId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown agent id"));
			return;
		}
		const name = String(params.name ?? "").trim();
		if (!ALLOWED_FILE_NAMES.has(name)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported file "${name}"`));
			return;
		}
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		await fsPromises.mkdir(workspaceDir, { recursive: true });
		const filePath = path.join(workspaceDir, name);
		const content = String(params.content ?? "");
		await fsPromises.writeFile(filePath, content, "utf-8");
		const meta = await statFile(filePath);
		respond(true, {
			ok: true,
			agentId,
			workspace: workspaceDir,
			file: {
				name,
				path: filePath,
				missing: false,
				size: meta?.size,
				updatedAtMs: meta?.updatedAtMs,
				content
			}
		}, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/nodes.helpers.ts
function respondInvalidParams(params) {
	params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid ${params.method} params: ${formatValidationErrors(params.validator.errors)}`));
}
async function respondUnavailableOnThrow(respond, fn) {
	try {
		await fn();
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
	}
}
function uniqueSortedStrings(values) {
	return [...new Set(values.filter((v) => typeof v === "string"))].map((v) => v.trim()).filter(Boolean).toSorted();
}
function safeParseJson(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	try {
		return JSON.parse(trimmed);
	} catch {
		return { payloadJSON: value };
	}
}

//#endregion
//#region src/gateway/server-methods/browser.ts
function isBrowserNode(node) {
	const caps = Array.isArray(node.caps) ? node.caps : [];
	const commands = Array.isArray(node.commands) ? node.commands : [];
	return caps.includes("browser") || commands.includes("browser.proxy");
}
function normalizeNodeKey(value) {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function resolveBrowserNode(nodes, query) {
	const q = query.trim();
	if (!q) return null;
	const qNorm = normalizeNodeKey(q);
	const matches = nodes.filter((node) => {
		if (node.nodeId === q) return true;
		if (typeof node.remoteIp === "string" && node.remoteIp === q) return true;
		const name = typeof node.displayName === "string" ? node.displayName : "";
		if (name && normalizeNodeKey(name) === qNorm) return true;
		if (q.length >= 6 && node.nodeId.startsWith(q)) return true;
		return false;
	});
	if (matches.length === 1) return matches[0] ?? null;
	if (matches.length === 0) return null;
	throw new Error(`ambiguous node: ${q} (matches: ${matches.map((node) => node.displayName || node.remoteIp || node.nodeId).join(", ")})`);
}
function resolveBrowserNodeTarget(params) {
	const policy = params.cfg.gateway?.nodes?.browser;
	const mode = policy?.mode ?? "auto";
	if (mode === "off") return null;
	const browserNodes = params.nodes.filter((node) => isBrowserNode(node));
	if (browserNodes.length === 0) {
		if (policy?.node?.trim()) throw new Error("No connected browser-capable nodes.");
		return null;
	}
	const requested = policy?.node?.trim() || "";
	if (requested) {
		const resolved = resolveBrowserNode(browserNodes, requested);
		if (!resolved) throw new Error(`Configured browser node not connected: ${requested}`);
		return resolved;
	}
	if (mode === "manual") return null;
	if (browserNodes.length === 1) return browserNodes[0] ?? null;
	return null;
}
async function persistProxyFiles(files) {
	if (!files || files.length === 0) return /* @__PURE__ */ new Map();
	const mapping = /* @__PURE__ */ new Map();
	for (const file of files) {
		const buffer = Buffer.from(file.base64, "base64");
		const saved = await saveMediaBuffer(buffer, file.mimeType, "browser", buffer.byteLength);
		mapping.set(file.path, saved.path);
	}
	return mapping;
}
function applyProxyPaths(result, mapping) {
	if (!result || typeof result !== "object") return;
	const obj = result;
	if (typeof obj.path === "string" && mapping.has(obj.path)) obj.path = mapping.get(obj.path);
	if (typeof obj.imagePath === "string" && mapping.has(obj.imagePath)) obj.imagePath = mapping.get(obj.imagePath);
	const download = obj.download;
	if (download && typeof download === "object") {
		const d = download;
		if (typeof d.path === "string" && mapping.has(d.path)) d.path = mapping.get(d.path);
	}
}
const browserHandlers = { "browser.request": async ({ params, respond, context }) => {
	const typed = params;
	const methodRaw = typeof typed.method === "string" ? typed.method.trim().toUpperCase() : "";
	const path = typeof typed.path === "string" ? typed.path.trim() : "";
	const query = typed.query && typeof typed.query === "object" ? typed.query : void 0;
	const body = typed.body;
	const timeoutMs = typeof typed.timeoutMs === "number" && Number.isFinite(typed.timeoutMs) ? Math.max(1, Math.floor(typed.timeoutMs)) : void 0;
	if (!methodRaw || !path) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "method and path are required"));
		return;
	}
	if (methodRaw !== "GET" && methodRaw !== "POST" && methodRaw !== "DELETE") {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "method must be GET, POST, or DELETE"));
		return;
	}
	const cfg = loadConfig();
	let nodeTarget = null;
	try {
		nodeTarget = resolveBrowserNodeTarget({
			cfg,
			nodes: context.nodeRegistry.listConnected()
		});
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
		return;
	}
	if (nodeTarget) {
		const allowlist = resolveNodeCommandAllowlist(cfg, nodeTarget);
		const allowed = isNodeCommandAllowed({
			command: "browser.proxy",
			declaredCommands: nodeTarget.commands,
			allowlist
		});
		if (!allowed.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "node command not allowed", { details: {
				reason: allowed.reason,
				command: "browser.proxy"
			} }));
			return;
		}
		const proxyParams = {
			method: methodRaw,
			path,
			query,
			body,
			timeoutMs,
			profile: typeof query?.profile === "string" ? query.profile : void 0
		};
		const res = await context.nodeRegistry.invoke({
			nodeId: nodeTarget.nodeId,
			command: "browser.proxy",
			params: proxyParams,
			timeoutMs,
			idempotencyKey: crypto.randomUUID()
		});
		if (!res.ok) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, res.error?.message ?? "node invoke failed", { details: { nodeError: res.error ?? null } }));
			return;
		}
		const payload = res.payloadJSON ? safeParseJson(res.payloadJSON) : res.payload;
		const proxy = payload && typeof payload === "object" ? payload : null;
		if (!proxy || !("result" in proxy)) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "browser proxy failed"));
			return;
		}
		const mapping = await persistProxyFiles(proxy.files);
		applyProxyPaths(proxy.result, mapping);
		respond(true, proxy.result);
		return;
	}
	if (!await startBrowserControlServiceFromConfig()) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "browser control is disabled"));
		return;
	}
	let dispatcher;
	try {
		dispatcher = createBrowserRouteDispatcher(createBrowserControlContext());
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
		return;
	}
	const result = await dispatcher.dispatch({
		method: methodRaw,
		path,
		query,
		body
	});
	if (result.status >= 400) {
		const message = result.body && typeof result.body === "object" && "error" in result.body ? String(result.body.error) : `browser request failed (${result.status})`;
		respond(false, void 0, errorShape(result.status >= 500 ? ErrorCodes.UNAVAILABLE : ErrorCodes.INVALID_REQUEST, message, { details: result.body }));
		return;
	}
	respond(true, result.body);
} };

//#endregion
//#region src/gateway/server-methods/channels.ts
async function logoutChannelAccount(params) {
	const resolvedAccountId = params.accountId?.trim() || params.plugin.config.defaultAccountId?.(params.cfg) || params.plugin.config.listAccountIds(params.cfg)[0] || DEFAULT_ACCOUNT_ID;
	const account = params.plugin.config.resolveAccount(params.cfg, resolvedAccountId);
	await params.context.stopChannel(params.channelId, resolvedAccountId);
	const result = await params.plugin.gateway?.logoutAccount?.({
		cfg: params.cfg,
		accountId: resolvedAccountId,
		account,
		runtime: defaultRuntime
	});
	if (!result) throw new Error(`Channel ${params.channelId} does not support logout`);
	const cleared = Boolean(result.cleared);
	if (typeof result.loggedOut === "boolean" ? result.loggedOut : cleared) params.context.markChannelLoggedOut(params.channelId, true, resolvedAccountId);
	return {
		channel: params.channelId,
		accountId: resolvedAccountId,
		...result,
		cleared
	};
}
const channelsHandlers = {
	"channels.status": async ({ params, respond, context }) => {
		if (!validateChannelsStatusParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid channels.status params: ${formatValidationErrors(validateChannelsStatusParams.errors)}`));
			return;
		}
		const probe = params.probe === true;
		const timeoutMsRaw = params.timeoutMs;
		const timeoutMs = typeof timeoutMsRaw === "number" ? Math.max(1e3, timeoutMsRaw) : 1e4;
		const cfg = loadConfig();
		const runtime = context.getRuntimeSnapshot();
		const plugins = listChannelPlugins();
		const pluginMap = new Map(plugins.map((plugin) => [plugin.id, plugin]));
		const resolveRuntimeSnapshot = (channelId, accountId, defaultAccountId) => {
			const accounts = runtime.channelAccounts[channelId];
			const defaultRuntime = runtime.channels[channelId];
			const raw = accounts?.[accountId] ?? (accountId === defaultAccountId ? defaultRuntime : void 0);
			if (!raw) return;
			return raw;
		};
		const isAccountEnabled = (plugin, account) => plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : !account || typeof account !== "object" || account.enabled !== false;
		const buildChannelAccounts = async (channelId) => {
			const plugin = pluginMap.get(channelId);
			if (!plugin) return {
				accounts: [],
				defaultAccountId: DEFAULT_ACCOUNT_ID,
				defaultAccount: void 0,
				resolvedAccounts: {}
			};
			const accountIds = plugin.config.listAccountIds(cfg);
			const defaultAccountId = resolveChannelDefaultAccountId({
				plugin,
				cfg,
				accountIds
			});
			const accounts = [];
			const resolvedAccounts = {};
			for (const accountId of accountIds) {
				const account = plugin.config.resolveAccount(cfg, accountId);
				const enabled = isAccountEnabled(plugin, account);
				resolvedAccounts[accountId] = account;
				let probeResult;
				let lastProbeAt = null;
				if (probe && enabled && plugin.status?.probeAccount) {
					let configured = true;
					if (plugin.config.isConfigured) configured = await plugin.config.isConfigured(account, cfg);
					if (configured) {
						probeResult = await plugin.status.probeAccount({
							account,
							timeoutMs,
							cfg
						});
						lastProbeAt = Date.now();
					}
				}
				let auditResult;
				if (probe && enabled && plugin.status?.auditAccount) {
					let configured = true;
					if (plugin.config.isConfigured) configured = await plugin.config.isConfigured(account, cfg);
					if (configured) auditResult = await plugin.status.auditAccount({
						account,
						timeoutMs,
						cfg,
						probe: probeResult
					});
				}
				const snapshot = await buildChannelAccountSnapshot({
					plugin,
					cfg,
					accountId,
					runtime: resolveRuntimeSnapshot(channelId, accountId, defaultAccountId),
					probe: probeResult,
					audit: auditResult
				});
				if (lastProbeAt) snapshot.lastProbeAt = lastProbeAt;
				const activity = getChannelActivity({
					channel: channelId,
					accountId
				});
				if (snapshot.lastInboundAt == null) snapshot.lastInboundAt = activity.inboundAt;
				if (snapshot.lastOutboundAt == null) snapshot.lastOutboundAt = activity.outboundAt;
				accounts.push(snapshot);
			}
			return {
				accounts,
				defaultAccountId,
				defaultAccount: accounts.find((entry) => entry.accountId === defaultAccountId) ?? accounts[0],
				resolvedAccounts
			};
		};
		const uiCatalog = buildChannelUiCatalog(plugins);
		const payload = {
			ts: Date.now(),
			channelOrder: uiCatalog.order,
			channelLabels: uiCatalog.labels,
			channelDetailLabels: uiCatalog.detailLabels,
			channelSystemImages: uiCatalog.systemImages,
			channelMeta: uiCatalog.entries,
			channels: {},
			channelAccounts: {},
			channelDefaultAccountId: {}
		};
		const channelsMap = payload.channels;
		const accountsMap = payload.channelAccounts;
		const defaultAccountIdMap = payload.channelDefaultAccountId;
		for (const plugin of plugins) {
			const { accounts, defaultAccountId, defaultAccount, resolvedAccounts } = await buildChannelAccounts(plugin.id);
			const fallbackAccount = resolvedAccounts[defaultAccountId] ?? plugin.config.resolveAccount(cfg, defaultAccountId);
			const summary = plugin.status?.buildChannelSummary ? await plugin.status.buildChannelSummary({
				account: fallbackAccount,
				cfg,
				defaultAccountId,
				snapshot: defaultAccount ?? { accountId: defaultAccountId }
			}) : { configured: defaultAccount?.configured ?? false };
			channelsMap[plugin.id] = summary;
			accountsMap[plugin.id] = accounts;
			defaultAccountIdMap[plugin.id] = defaultAccountId;
		}
		respond(true, payload, void 0);
	},
	"channels.logout": async ({ params, respond, context }) => {
		if (!validateChannelsLogoutParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid channels.logout params: ${formatValidationErrors(validateChannelsLogoutParams.errors)}`));
			return;
		}
		const rawChannel = params.channel;
		const channelId = typeof rawChannel === "string" ? normalizeChannelId(rawChannel) : null;
		if (!channelId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid channels.logout channel"));
			return;
		}
		const plugin = getChannelPlugin(channelId);
		if (!plugin?.gateway?.logoutAccount) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `channel ${channelId} does not support logout`));
			return;
		}
		const accountIdRaw = params.accountId;
		const accountId = typeof accountIdRaw === "string" ? accountIdRaw.trim() : void 0;
		const snapshot = await readConfigFileSnapshot();
		if (!snapshot.valid) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "config invalid; fix it before logging out"));
			return;
		}
		try {
			respond(true, await logoutChannelAccount({
				channelId,
				accountId,
				cfg: snapshot.config ?? {},
				context,
				plugin
			}), void 0);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	}
};

//#endregion
//#region src/gateway/server-methods/chat.ts
function resolveTranscriptPath(params) {
	const { sessionId, storePath, sessionFile } = params;
	if (!storePath && !sessionFile) return null;
	try {
		const sessionsDir = storePath ? path.dirname(storePath) : void 0;
		return resolveSessionFilePath(sessionId, sessionFile ? { sessionFile } : void 0, sessionsDir ? { sessionsDir } : void 0);
	} catch {
		return null;
	}
}
function ensureTranscriptFile(params) {
	if (fs.existsSync(params.transcriptPath)) return { ok: true };
	try {
		fs.mkdirSync(path.dirname(params.transcriptPath), { recursive: true });
		const header = {
			type: "session",
			version: CURRENT_SESSION_VERSION,
			id: params.sessionId,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			cwd: process.cwd()
		};
		fs.writeFileSync(params.transcriptPath, `${JSON.stringify(header)}\n`, "utf-8");
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function appendAssistantTranscriptMessage(params) {
	const transcriptPath = resolveTranscriptPath({
		sessionId: params.sessionId,
		storePath: params.storePath,
		sessionFile: params.sessionFile
	});
	if (!transcriptPath) return {
		ok: false,
		error: "transcript path not resolved"
	};
	if (!fs.existsSync(transcriptPath)) {
		if (!params.createIfMissing) return {
			ok: false,
			error: "transcript file not found"
		};
		const ensured = ensureTranscriptFile({
			transcriptPath,
			sessionId: params.sessionId
		});
		if (!ensured.ok) return {
			ok: false,
			error: ensured.error ?? "failed to create transcript file"
		};
	}
	const now = Date.now();
	const messageBody = {
		role: "assistant",
		content: [{
			type: "text",
			text: `${params.label ? `[${params.label}]\n\n` : ""}${params.message}`
		}],
		timestamp: now,
		stopReason: "stop",
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: {
				input: 0,
				output: 0,
				cacheRead: 0,
				cacheWrite: 0,
				total: 0
			}
		},
		api: "openai-responses",
		provider: "openclaw",
		model: "gateway-injected"
	};
	try {
		return {
			ok: true,
			messageId: SessionManager.open(transcriptPath).appendMessage(messageBody),
			message: messageBody
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
function nextChatSeq(context, runId) {
	const next = (context.agentRunSeq.get(runId) ?? 0) + 1;
	context.agentRunSeq.set(runId, next);
	return next;
}
function broadcastChatFinal(params) {
	const seq = nextChatSeq({ agentRunSeq: params.context.agentRunSeq }, params.runId);
	const payload = {
		runId: params.runId,
		sessionKey: params.sessionKey,
		seq,
		state: "final",
		message: params.message
	};
	params.context.broadcast("chat", payload);
	params.context.nodeSendToSession(params.sessionKey, "chat", payload);
}
function broadcastChatError(params) {
	const seq = nextChatSeq({ agentRunSeq: params.context.agentRunSeq }, params.runId);
	const payload = {
		runId: params.runId,
		sessionKey: params.sessionKey,
		seq,
		state: "error",
		errorMessage: params.errorMessage
	};
	params.context.broadcast("chat", payload);
	params.context.nodeSendToSession(params.sessionKey, "chat", payload);
}
const chatHandlers = {
	"chat.history": async ({ params, respond, context }) => {
		if (!validateChatHistoryParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.history params: ${formatValidationErrors(validateChatHistoryParams.errors)}`));
			return;
		}
		const { sessionKey, limit } = params;
		const { cfg, storePath, entry } = loadSessionEntry(sessionKey);
		const sessionId = entry?.sessionId;
		const rawMessages = sessionId && storePath ? readSessionMessages(sessionId, storePath, entry?.sessionFile) : [];
		const hardMax = 1e3;
		const requested = typeof limit === "number" ? limit : 200;
		const max = Math.min(hardMax, requested);
		const capped = capArrayByJsonBytes(stripEnvelopeFromMessages(rawMessages.length > max ? rawMessages.slice(-max) : rawMessages), getMaxChatHistoryMessagesBytes()).items;
		let thinkingLevel = entry?.thinkingLevel;
		if (!thinkingLevel) {
			const configured = cfg.agents?.defaults?.thinkingDefault;
			if (configured) thinkingLevel = configured;
			else {
				const { provider, model } = resolveSessionModelRef(cfg, entry, resolveSessionAgentId({
					sessionKey,
					config: cfg
				}));
				thinkingLevel = resolveThinkingDefault({
					cfg,
					provider,
					model,
					catalog: await context.loadGatewayModelCatalog()
				});
			}
		}
		const verboseLevel = entry?.verboseLevel ?? cfg.agents?.defaults?.verboseDefault;
		respond(true, {
			sessionKey,
			sessionId,
			messages: capped,
			thinkingLevel,
			verboseLevel
		});
	},
	"chat.abort": ({ params, respond, context }) => {
		if (!validateChatAbortParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.abort params: ${formatValidationErrors(validateChatAbortParams.errors)}`));
			return;
		}
		const { sessionKey, runId } = params;
		const ops = {
			chatAbortControllers: context.chatAbortControllers,
			chatRunBuffers: context.chatRunBuffers,
			chatDeltaSentAt: context.chatDeltaSentAt,
			chatAbortedRuns: context.chatAbortedRuns,
			removeChatRun: context.removeChatRun,
			agentRunSeq: context.agentRunSeq,
			broadcast: context.broadcast,
			nodeSendToSession: context.nodeSendToSession
		};
		if (!runId) {
			const res = abortChatRunsForSessionKey(ops, {
				sessionKey,
				stopReason: "rpc"
			});
			respond(true, {
				ok: true,
				aborted: res.aborted,
				runIds: res.runIds
			});
			return;
		}
		const active = context.chatAbortControllers.get(runId);
		if (!active) {
			respond(true, {
				ok: true,
				aborted: false,
				runIds: []
			});
			return;
		}
		if (active.sessionKey !== sessionKey) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "runId does not match sessionKey"));
			return;
		}
		const res = abortChatRunById(ops, {
			runId,
			sessionKey,
			stopReason: "rpc"
		});
		respond(true, {
			ok: true,
			aborted: res.aborted,
			runIds: res.aborted ? [runId] : []
		});
	},
	"chat.send": async ({ params, respond, context, client }) => {
		if (!validateChatSendParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.send params: ${formatValidationErrors(validateChatSendParams.errors)}`));
			return;
		}
		const p = params;
		const stopCommand = isChatStopCommandText(p.message);
		const normalizedAttachments = p.attachments?.map((a) => ({
			type: typeof a?.type === "string" ? a.type : void 0,
			mimeType: typeof a?.mimeType === "string" ? a.mimeType : void 0,
			fileName: typeof a?.fileName === "string" ? a.fileName : void 0,
			content: typeof a?.content === "string" ? a.content : ArrayBuffer.isView(a?.content) ? Buffer.from(a.content.buffer, a.content.byteOffset, a.content.byteLength).toString("base64") : void 0
		})).filter((a) => a.content) ?? [];
		if (!p.message.trim() && normalizedAttachments.length === 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "message or attachment required"));
			return;
		}
		let parsedMessage = p.message;
		let parsedImages = [];
		if (normalizedAttachments.length > 0) try {
			const parsed = await parseMessageWithAttachments(p.message, normalizedAttachments, {
				maxBytes: 5e6,
				log: context.logGateway
			});
			parsedMessage = parsed.message;
			parsedImages = parsed.images;
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, String(err)));
			return;
		}
		const rawSessionKey = p.sessionKey;
		const { cfg, entry, canonicalKey: sessionKey } = loadSessionEntry(rawSessionKey);
		const timeoutMs = resolveAgentTimeoutMs({
			cfg,
			overrideMs: p.timeoutMs
		});
		const now = Date.now();
		const clientRunId = p.idempotencyKey;
		if (resolveSendPolicy({
			cfg,
			entry,
			sessionKey,
			channel: entry?.channel,
			chatType: entry?.chatType
		}) === "deny") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "send blocked by session policy"));
			return;
		}
		if (stopCommand) {
			const res = abortChatRunsForSessionKey({
				chatAbortControllers: context.chatAbortControllers,
				chatRunBuffers: context.chatRunBuffers,
				chatDeltaSentAt: context.chatDeltaSentAt,
				chatAbortedRuns: context.chatAbortedRuns,
				removeChatRun: context.removeChatRun,
				agentRunSeq: context.agentRunSeq,
				broadcast: context.broadcast,
				nodeSendToSession: context.nodeSendToSession
			}, {
				sessionKey: rawSessionKey,
				stopReason: "stop"
			});
			respond(true, {
				ok: true,
				aborted: res.aborted,
				runIds: res.runIds
			});
			return;
		}
		const cached = context.dedupe.get(`chat:${clientRunId}`);
		if (cached) {
			respond(cached.ok, cached.payload, cached.error, { cached: true });
			return;
		}
		if (context.chatAbortControllers.get(clientRunId)) {
			respond(true, {
				runId: clientRunId,
				status: "in_flight"
			}, void 0, {
				cached: true,
				runId: clientRunId
			});
			return;
		}
		try {
			const abortController = new AbortController();
			context.chatAbortControllers.set(clientRunId, {
				controller: abortController,
				sessionId: entry?.sessionId ?? clientRunId,
				sessionKey: rawSessionKey,
				startedAtMs: now,
				expiresAtMs: resolveChatRunExpiresAtMs({
					now,
					timeoutMs
				})
			});
			respond(true, {
				runId: clientRunId,
				status: "started"
			}, void 0, { runId: clientRunId });
			const trimmedMessage = parsedMessage.trim();
			const commandBody = Boolean(p.thinking && trimmedMessage && !trimmedMessage.startsWith("/")) ? `/think ${p.thinking} ${parsedMessage}` : parsedMessage;
			const clientInfo = client?.connect?.client;
			const stampedMessage = injectTimestamp(parsedMessage, timestampOptsFromConfig(cfg));
			const ctx = {
				Body: parsedMessage,
				BodyForAgent: stampedMessage,
				BodyForCommands: commandBody,
				RawBody: parsedMessage,
				CommandBody: commandBody,
				SessionKey: sessionKey,
				Provider: INTERNAL_MESSAGE_CHANNEL,
				Surface: INTERNAL_MESSAGE_CHANNEL,
				OriginatingChannel: INTERNAL_MESSAGE_CHANNEL,
				ChatType: "direct",
				CommandAuthorized: true,
				MessageSid: clientRunId,
				SenderId: clientInfo?.id,
				SenderName: clientInfo?.displayName,
				SenderUsername: clientInfo?.displayName,
				GatewayClientScopes: client?.connect?.scopes
			};
			const { onModelSelected, ...prefixOptions } = createReplyPrefixOptions({
				cfg,
				agentId: resolveSessionAgentId({
					sessionKey,
					config: cfg
				}),
				channel: INTERNAL_MESSAGE_CHANNEL
			});
			const finalReplyParts = [];
			const dispatcher = createReplyDispatcher({
				...prefixOptions,
				onError: (err) => {
					context.logGateway.warn(`webchat dispatch failed: ${formatForLog(err)}`);
				},
				deliver: async (payload, info) => {
					if (info.kind !== "final") return;
					const text = payload.text?.trim() ?? "";
					if (!text) return;
					finalReplyParts.push(text);
				}
			});
			let agentRunStarted = false;
			dispatchInboundMessage({
				ctx,
				cfg,
				dispatcher,
				replyOptions: {
					runId: clientRunId,
					abortSignal: abortController.signal,
					images: parsedImages.length > 0 ? parsedImages : void 0,
					disableBlockStreaming: true,
					onAgentRunStart: (runId) => {
						agentRunStarted = true;
						const connId = typeof client?.connId === "string" ? client.connId : void 0;
						const wantsToolEvents = hasGatewayClientCap(client?.connect?.caps, GATEWAY_CLIENT_CAPS.TOOL_EVENTS);
						if (connId && wantsToolEvents) {
							context.registerToolEventRecipient(runId, connId);
							for (const [activeRunId, active] of context.chatAbortControllers) if (activeRunId !== runId && active.sessionKey === p.sessionKey) context.registerToolEventRecipient(activeRunId, connId);
						}
					},
					onModelSelected
				}
			}).then(() => {
				if (!agentRunStarted) {
					const combinedReply = finalReplyParts.map((part) => part.trim()).filter(Boolean).join("\n\n").trim();
					let message;
					if (combinedReply) {
						const { storePath: latestStorePath, entry: latestEntry } = loadSessionEntry(sessionKey);
						const appended = appendAssistantTranscriptMessage({
							message: combinedReply,
							sessionId: latestEntry?.sessionId ?? entry?.sessionId ?? clientRunId,
							storePath: latestStorePath,
							sessionFile: latestEntry?.sessionFile,
							createIfMissing: true
						});
						if (appended.ok) message = appended.message;
						else {
							context.logGateway.warn(`webchat transcript append failed: ${appended.error ?? "unknown error"}`);
							message = {
								role: "assistant",
								content: [{
									type: "text",
									text: combinedReply
								}],
								timestamp: Date.now(),
								stopReason: "stop",
								usage: {
									input: 0,
									output: 0,
									totalTokens: 0
								}
							};
						}
					}
					broadcastChatFinal({
						context,
						runId: clientRunId,
						sessionKey: rawSessionKey,
						message
					});
				}
				context.dedupe.set(`chat:${clientRunId}`, {
					ts: Date.now(),
					ok: true,
					payload: {
						runId: clientRunId,
						status: "ok"
					}
				});
			}).catch((err) => {
				const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
				context.dedupe.set(`chat:${clientRunId}`, {
					ts: Date.now(),
					ok: false,
					payload: {
						runId: clientRunId,
						status: "error",
						summary: String(err)
					},
					error
				});
				broadcastChatError({
					context,
					runId: clientRunId,
					sessionKey: rawSessionKey,
					errorMessage: String(err)
				});
			}).finally(() => {
				context.chatAbortControllers.delete(clientRunId);
			});
		} catch (err) {
			const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
			const payload = {
				runId: clientRunId,
				status: "error",
				summary: String(err)
			};
			context.dedupe.set(`chat:${clientRunId}`, {
				ts: Date.now(),
				ok: false,
				payload,
				error
			});
			respond(false, payload, error, {
				runId: clientRunId,
				error: formatForLog(err)
			});
		}
	},
	"chat.inject": async ({ params, respond, context }) => {
		if (!validateChatInjectParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid chat.inject params: ${formatValidationErrors(validateChatInjectParams.errors)}`));
			return;
		}
		const p = params;
		const rawSessionKey = p.sessionKey;
		const { storePath, entry } = loadSessionEntry(rawSessionKey);
		const sessionId = entry?.sessionId;
		if (!sessionId || !storePath) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "session not found"));
			return;
		}
		const appended = appendAssistantTranscriptMessage({
			message: p.message,
			label: p.label,
			sessionId,
			storePath,
			sessionFile: entry?.sessionFile,
			createIfMissing: false
		});
		if (!appended.ok || !appended.messageId || !appended.message) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `failed to write transcript: ${appended.error ?? "unknown error"}`));
			return;
		}
		const chatPayload = {
			runId: `inject-${appended.messageId}`,
			sessionKey: rawSessionKey,
			seq: 0,
			state: "final",
			message: appended.message
		};
		context.broadcast("chat", chatPayload);
		context.nodeSendToSession(rawSessionKey, "chat", chatPayload);
		respond(true, {
			ok: true,
			messageId: appended.messageId
		});
	}
};

//#endregion
//#region src/config/schema.irc.ts
const IRC_FIELD_LABELS = {
	"channels.irc": "IRC",
	"channels.irc.dmPolicy": "IRC DM Policy",
	"channels.irc.nickserv.enabled": "IRC NickServ Enabled",
	"channels.irc.nickserv.service": "IRC NickServ Service",
	"channels.irc.nickserv.password": "IRC NickServ Password",
	"channels.irc.nickserv.passwordFile": "IRC NickServ Password File",
	"channels.irc.nickserv.register": "IRC NickServ Register",
	"channels.irc.nickserv.registerEmail": "IRC NickServ Register Email"
};
const IRC_FIELD_HELP = {
	"channels.irc.configWrites": "Allow IRC to write config in response to channel events/commands (default: true).",
	"channels.irc.dmPolicy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.irc.allowFrom=[\"*\"].",
	"channels.irc.nickserv.enabled": "Enable NickServ identify/register after connect (defaults to enabled when password is configured).",
	"channels.irc.nickserv.service": "NickServ service nick (default: NickServ).",
	"channels.irc.nickserv.password": "NickServ password used for IDENTIFY/REGISTER (sensitive).",
	"channels.irc.nickserv.passwordFile": "Optional file path containing NickServ password.",
	"channels.irc.nickserv.register": "If true, send NickServ REGISTER on every connect. Use once for initial registration, then disable.",
	"channels.irc.nickserv.registerEmail": "Email used with NickServ REGISTER (required when register=true)."
};

//#endregion
//#region src/config/schema.help.ts
const FIELD_HELP = {
	"meta.lastTouchedVersion": "Auto-set when OpenClaw writes the config.",
	"meta.lastTouchedAt": "ISO timestamp of the last config write (auto-set).",
	"update.channel": "Update channel for git + npm installs (\"stable\", \"beta\", or \"dev\").",
	"update.checkOnStart": "Check for npm updates when the gateway starts (default: true).",
	"gateway.remote.url": "Remote Gateway WebSocket URL (ws:// or wss://).",
	"gateway.remote.tlsFingerprint": "Expected sha256 TLS fingerprint for the remote gateway (pin to avoid MITM).",
	"gateway.remote.sshTarget": "Remote gateway over SSH (tunnels the gateway port to localhost). Format: user@host or user@host:port.",
	"gateway.remote.sshIdentity": "Optional SSH identity file path (passed to ssh -i).",
	"agents.list.*.skills": "Optional allowlist of skills for this agent (omit = all skills; empty = no skills).",
	"agents.list[].skills": "Optional allowlist of skills for this agent (omit = all skills; empty = no skills).",
	"agents.list[].identity.avatar": "Avatar image path (relative to the agent workspace only) or a remote URL/data URL.",
	"discovery.mdns.mode": "mDNS broadcast mode (\"minimal\" default, \"full\" includes cliPath/sshPort, \"off\" disables mDNS).",
	"gateway.auth.token": "Required by default for gateway access (unless using Tailscale Serve identity); required for non-loopback binds.",
	"gateway.auth.password": "Required for Tailscale funnel.",
	"gateway.controlUi.basePath": "Optional URL prefix where the Control UI is served (e.g. /openclaw).",
	"gateway.controlUi.root": "Optional filesystem root for Control UI assets (defaults to dist/control-ui).",
	"gateway.controlUi.allowedOrigins": "Allowed browser origins for Control UI/WebChat websocket connections (full origins only, e.g. https://control.example.com).",
	"gateway.controlUi.allowInsecureAuth": "Allow Control UI auth over insecure HTTP (token-only; not recommended).",
	"gateway.controlUi.dangerouslyDisableDeviceAuth": "DANGEROUS. Disable Control UI device identity checks (token/password only).",
	"gateway.http.endpoints.chatCompletions.enabled": "Enable the OpenAI-compatible `POST /v1/chat/completions` endpoint (default: false).",
	"gateway.reload.mode": "Hot reload strategy for config changes (\"hybrid\" recommended).",
	"gateway.reload.debounceMs": "Debounce window (ms) before applying config changes.",
	"gateway.nodes.browser.mode": "Node browser routing (\"auto\" = pick single connected browser node, \"manual\" = require node param, \"off\" = disable).",
	"gateway.nodes.browser.node": "Pin browser routing to a specific node id or name (optional).",
	"gateway.nodes.allowCommands": "Extra node.invoke commands to allow beyond the gateway defaults (array of command strings).",
	"gateway.nodes.denyCommands": "Commands to block even if present in node claims or default allowlist.",
	"nodeHost.browserProxy.enabled": "Expose the local browser control server via node proxy.",
	"nodeHost.browserProxy.allowProfiles": "Optional allowlist of browser profile names exposed via the node proxy.",
	"diagnostics.flags": "Enable targeted diagnostics logs by flag (e.g. [\"telegram.http\"]). Supports wildcards like \"telegram.*\" or \"*\".",
	"diagnostics.cacheTrace.enabled": "Log cache trace snapshots for embedded agent runs (default: false).",
	"diagnostics.cacheTrace.filePath": "JSONL output path for cache trace logs (default: $OPENCLAW_STATE_DIR/logs/cache-trace.jsonl).",
	"diagnostics.cacheTrace.includeMessages": "Include full message payloads in trace output (default: true).",
	"diagnostics.cacheTrace.includePrompt": "Include prompt text in trace output (default: true).",
	"diagnostics.cacheTrace.includeSystem": "Include system prompt in trace output (default: true).",
	"tools.exec.applyPatch.enabled": "Experimental. Enables apply_patch for OpenAI models when allowed by tool policy.",
	"tools.exec.applyPatch.allowModels": "Optional allowlist of model ids (e.g. \"gpt-5.2\" or \"openai/gpt-5.2\").",
	"tools.exec.notifyOnExit": "When true (default), backgrounded exec sessions enqueue a system event and request a heartbeat on exit.",
	"tools.exec.pathPrepend": "Directories to prepend to PATH for exec runs (gateway/sandbox).",
	"tools.exec.safeBins": "Allow stdin-only safe binaries to run without explicit allowlist entries.",
	"tools.message.allowCrossContextSend": "Legacy override: allow cross-context sends across all providers.",
	"tools.message.crossContext.allowWithinProvider": "Allow sends to other channels within the same provider (default: true).",
	"tools.message.crossContext.allowAcrossProviders": "Allow sends across different providers (default: false).",
	"tools.message.crossContext.marker.enabled": "Add a visible origin marker when sending cross-context (default: true).",
	"tools.message.crossContext.marker.prefix": "Text prefix for cross-context markers (supports \"{channel}\").",
	"tools.message.crossContext.marker.suffix": "Text suffix for cross-context markers (supports \"{channel}\").",
	"tools.message.broadcast.enabled": "Enable broadcast action (default: true).",
	"tools.web.search.enabled": "Enable the web_search tool (requires a provider API key).",
	"tools.web.search.provider": "Search provider (\"brave\" or \"perplexity\").",
	"tools.web.search.apiKey": "Brave Search API key (fallback: BRAVE_API_KEY env var).",
	"tools.web.search.maxResults": "Default number of results to return (1-10).",
	"tools.web.search.timeoutSeconds": "Timeout in seconds for web_search requests.",
	"tools.web.search.cacheTtlMinutes": "Cache TTL in minutes for web_search results.",
	"tools.web.search.perplexity.apiKey": "Perplexity or OpenRouter API key (fallback: PERPLEXITY_API_KEY or OPENROUTER_API_KEY env var).",
	"tools.web.search.perplexity.baseUrl": "Perplexity base URL override (default: https://openrouter.ai/api/v1 or https://api.perplexity.ai).",
	"tools.web.search.perplexity.model": "Perplexity model override (default: \"perplexity/sonar-pro\").",
	"tools.web.fetch.enabled": "Enable the web_fetch tool (lightweight HTTP fetch).",
	"tools.web.fetch.maxChars": "Max characters returned by web_fetch (truncated).",
	"tools.web.fetch.maxCharsCap": "Hard cap for web_fetch maxChars (applies to config and tool calls).",
	"tools.web.fetch.timeoutSeconds": "Timeout in seconds for web_fetch requests.",
	"tools.web.fetch.cacheTtlMinutes": "Cache TTL in minutes for web_fetch results.",
	"tools.web.fetch.maxRedirects": "Maximum redirects allowed for web_fetch (default: 3).",
	"tools.web.fetch.userAgent": "Override User-Agent header for web_fetch requests.",
	"tools.web.fetch.readability": "Use Readability to extract main content from HTML (fallbacks to basic HTML cleanup).",
	"tools.web.fetch.firecrawl.enabled": "Enable Firecrawl fallback for web_fetch (if configured).",
	"tools.web.fetch.firecrawl.apiKey": "Firecrawl API key (fallback: FIRECRAWL_API_KEY env var).",
	"tools.web.fetch.firecrawl.baseUrl": "Firecrawl base URL (e.g. https://api.firecrawl.dev or custom endpoint).",
	"tools.web.fetch.firecrawl.onlyMainContent": "When true, Firecrawl returns only the main content (default: true).",
	"tools.web.fetch.firecrawl.maxAgeMs": "Firecrawl maxAge (ms) for cached results when supported by the API.",
	"tools.web.fetch.firecrawl.timeoutSeconds": "Timeout in seconds for Firecrawl requests.",
	"channels.slack.allowBots": "Allow bot-authored messages to trigger Slack replies (default: false).",
	"channels.slack.thread.historyScope": "Scope for Slack thread history context (\"thread\" isolates per thread; \"channel\" reuses channel history).",
	"channels.slack.thread.inheritParent": "If true, Slack thread sessions inherit the parent channel transcript (default: false).",
	"channels.slack.thread.initialHistoryLimit": "Maximum number of existing Slack thread messages to fetch when starting a new thread session (default: 20, set to 0 to disable).",
	"channels.mattermost.botToken": "Bot token from Mattermost System Console -> Integrations -> Bot Accounts.",
	"channels.mattermost.baseUrl": "Base URL for your Mattermost server (e.g., https://chat.example.com).",
	"channels.mattermost.chatmode": "Reply to channel messages on mention (\"oncall\"), on trigger chars (\">\" or \"!\") (\"onchar\"), or on every message (\"onmessage\").",
	"channels.mattermost.oncharPrefixes": "Trigger prefixes for onchar mode (default: [\">\", \"!\"]).",
	"channels.mattermost.requireMention": "Require @mention in channels before responding (default: true).",
	"auth.profiles": "Named auth profiles (provider + mode + optional email).",
	"auth.order": "Ordered auth profile IDs per provider (used for automatic failover).",
	"auth.cooldowns.billingBackoffHours": "Base backoff (hours) when a profile fails due to billing/insufficient credits (default: 5).",
	"auth.cooldowns.billingBackoffHoursByProvider": "Optional per-provider overrides for billing backoff (hours).",
	"auth.cooldowns.billingMaxHours": "Cap (hours) for billing backoff (default: 24).",
	"auth.cooldowns.failureWindowHours": "Failure window (hours) for backoff counters (default: 24).",
	"agents.defaults.bootstrapMaxChars": "Max characters of each workspace bootstrap file injected into the system prompt before truncation (default: 20000).",
	"agents.defaults.repoRoot": "Optional repository root shown in the system prompt runtime line (overrides auto-detect).",
	"agents.defaults.envelopeTimezone": "Timezone for message envelopes (\"utc\", \"local\", \"user\", or an IANA timezone string).",
	"agents.defaults.envelopeTimestamp": "Include absolute timestamps in message envelopes (\"on\" or \"off\").",
	"agents.defaults.envelopeElapsed": "Include elapsed time in message envelopes (\"on\" or \"off\").",
	"agents.defaults.models": "Configured model catalog (keys are full provider/model IDs).",
	"agents.defaults.memorySearch": "Vector search over MEMORY.md and memory/*.md (per-agent overrides supported).",
	"agents.defaults.memorySearch.sources": "Sources to index for memory search (default: [\"memory\"]; add \"sessions\" to include session transcripts).",
	"agents.defaults.memorySearch.extraPaths": "Extra paths to include in memory search (directories or .md files; relative paths resolved from workspace).",
	"agents.defaults.memorySearch.experimental.sessionMemory": "Enable experimental session transcript indexing for memory search (default: false).",
	"agents.defaults.memorySearch.provider": "Embedding provider (\"openai\", \"gemini\", \"voyage\", or \"local\").",
	"agents.defaults.memorySearch.remote.baseUrl": "Custom base URL for remote embeddings (OpenAI-compatible proxies or Gemini overrides).",
	"agents.defaults.memorySearch.remote.apiKey": "Custom API key for the remote embedding provider.",
	"agents.defaults.memorySearch.remote.headers": "Extra headers for remote embeddings (merged; remote overrides OpenAI headers).",
	"agents.defaults.memorySearch.remote.batch.enabled": "Enable batch API for memory embeddings (OpenAI/Gemini; default: true).",
	"agents.defaults.memorySearch.remote.batch.wait": "Wait for batch completion when indexing (default: true).",
	"agents.defaults.memorySearch.remote.batch.concurrency": "Max concurrent embedding batch jobs for memory indexing (default: 2).",
	"agents.defaults.memorySearch.remote.batch.pollIntervalMs": "Polling interval in ms for batch status (default: 2000).",
	"agents.defaults.memorySearch.remote.batch.timeoutMinutes": "Timeout in minutes for batch indexing (default: 60).",
	"agents.defaults.memorySearch.local.modelPath": "Local GGUF model path or hf: URI (node-llama-cpp).",
	"agents.defaults.memorySearch.fallback": "Fallback provider when embeddings fail (\"openai\", \"gemini\", \"local\", or \"none\").",
	"agents.defaults.memorySearch.store.path": "SQLite index path (default: ~/.openclaw/memory/{agentId}.sqlite).",
	"agents.defaults.memorySearch.store.vector.enabled": "Enable sqlite-vec extension for vector search (default: true).",
	"agents.defaults.memorySearch.store.vector.extensionPath": "Optional override path to sqlite-vec extension library (.dylib/.so/.dll).",
	"agents.defaults.memorySearch.query.hybrid.enabled": "Enable hybrid BM25 + vector search for memory (default: true).",
	"agents.defaults.memorySearch.query.hybrid.vectorWeight": "Weight for vector similarity when merging results (0-1).",
	"agents.defaults.memorySearch.query.hybrid.textWeight": "Weight for BM25 text relevance when merging results (0-1).",
	"agents.defaults.memorySearch.query.hybrid.candidateMultiplier": "Multiplier for candidate pool size (default: 4).",
	"agents.defaults.memorySearch.cache.enabled": "Cache chunk embeddings in SQLite to speed up reindexing and frequent updates (default: true).",
	memory: "Memory backend configuration (global).",
	"memory.backend": "Memory backend (\"builtin\" for OpenClaw embeddings, \"qmd\" for QMD sidecar).",
	"memory.citations": "Default citation behavior (\"auto\", \"on\", or \"off\").",
	"memory.qmd.command": "Path to the qmd binary (default: resolves from PATH).",
	"memory.qmd.includeDefaultMemory": "Whether to automatically index MEMORY.md + memory/**/*.md (default: true).",
	"memory.qmd.paths": "Additional directories/files to index with QMD (path + optional glob pattern).",
	"memory.qmd.paths.path": "Absolute or ~-relative path to index via QMD.",
	"memory.qmd.paths.pattern": "Glob pattern relative to the path root (default: **/*.md).",
	"memory.qmd.paths.name": "Optional stable name for the QMD collection (default derived from path).",
	"memory.qmd.sessions.enabled": "Enable QMD session transcript indexing (experimental, default: false).",
	"memory.qmd.sessions.exportDir": "Override directory for sanitized session exports before indexing.",
	"memory.qmd.sessions.retentionDays": "Retention window for exported sessions before pruning (default: unlimited).",
	"memory.qmd.update.interval": "How often the QMD sidecar refreshes indexes (duration string, default: 5m).",
	"memory.qmd.update.debounceMs": "Minimum delay between successive QMD refresh runs (default: 15000).",
	"memory.qmd.update.onBoot": "Run QMD update once on gateway startup (default: true).",
	"memory.qmd.update.waitForBootSync": "Block startup until the boot QMD refresh finishes (default: false).",
	"memory.qmd.update.embedInterval": "How often QMD embeddings are refreshed (duration string, default: 60m). Set to 0 to disable periodic embed.",
	"memory.qmd.update.commandTimeoutMs": "Timeout for QMD maintenance commands like collection list/add (default: 30000).",
	"memory.qmd.update.updateTimeoutMs": "Timeout for `qmd update` runs (default: 120000).",
	"memory.qmd.update.embedTimeoutMs": "Timeout for `qmd embed` runs (default: 120000).",
	"memory.qmd.limits.maxResults": "Max QMD results returned to the agent loop (default: 6).",
	"memory.qmd.limits.maxSnippetChars": "Max characters per snippet pulled from QMD (default: 700).",
	"memory.qmd.limits.maxInjectedChars": "Max total characters injected from QMD hits per turn.",
	"memory.qmd.limits.timeoutMs": "Per-query timeout for QMD searches (default: 4000).",
	"memory.qmd.scope": "Session/channel scope for QMD recall (same syntax as session.sendPolicy; default: direct-only).",
	"agents.defaults.memorySearch.cache.maxEntries": "Optional cap on cached embeddings (best-effort).",
	"agents.defaults.memorySearch.sync.onSearch": "Lazy sync: schedule a reindex on search after changes.",
	"agents.defaults.memorySearch.sync.watch": "Watch memory files for changes (chokidar).",
	"agents.defaults.memorySearch.sync.sessions.deltaBytes": "Minimum appended bytes before session transcripts trigger reindex (default: 100000).",
	"agents.defaults.memorySearch.sync.sessions.deltaMessages": "Minimum appended JSONL lines before session transcripts trigger reindex (default: 50).",
	"plugins.enabled": "Enable plugin/extension loading (default: true).",
	"plugins.allow": "Optional allowlist of plugin ids; when set, only listed plugins load.",
	"plugins.deny": "Optional denylist of plugin ids; deny wins over allowlist.",
	"plugins.load.paths": "Additional plugin files or directories to load.",
	"plugins.slots": "Select which plugins own exclusive slots (memory, etc.).",
	"plugins.slots.memory": "Select the active memory plugin by id, or \"none\" to disable memory plugins.",
	"plugins.entries": "Per-plugin settings keyed by plugin id (enable/disable + config payloads).",
	"plugins.entries.*.enabled": "Overrides plugin enable/disable for this entry (restart required).",
	"plugins.entries.*.config": "Plugin-defined config payload (schema is provided by the plugin).",
	"plugins.installs": "CLI-managed install metadata (used by `openclaw plugins update` to locate install sources).",
	"plugins.installs.*.source": "Install source (\"npm\", \"archive\", or \"path\").",
	"plugins.installs.*.spec": "Original npm spec used for install (if source is npm).",
	"plugins.installs.*.sourcePath": "Original archive/path used for install (if any).",
	"plugins.installs.*.installPath": "Resolved install directory (usually ~/.openclaw/extensions/<id>).",
	"plugins.installs.*.version": "Version recorded at install time (if available).",
	"plugins.installs.*.installedAt": "ISO timestamp of last install/update.",
	"agents.list.*.identity.avatar": "Agent avatar (workspace-relative path, http(s) URL, or data URI).",
	"agents.defaults.model.primary": "Primary model (provider/model).",
	"agents.defaults.model.fallbacks": "Ordered fallback models (provider/model). Used when the primary model fails.",
	"agents.defaults.imageModel.primary": "Optional image model (provider/model) used when the primary model lacks image input.",
	"agents.defaults.imageModel.fallbacks": "Ordered fallback image models (provider/model).",
	"agents.defaults.cliBackends": "Optional CLI backends for text-only fallback (claude-cli, etc.).",
	"agents.defaults.humanDelay.mode": "Delay style for block replies (\"off\", \"natural\", \"custom\").",
	"agents.defaults.humanDelay.minMs": "Minimum delay in ms for custom humanDelay (default: 800).",
	"agents.defaults.humanDelay.maxMs": "Maximum delay in ms for custom humanDelay (default: 2500).",
	"commands.native": "Register native commands with channels that support it (Discord/Slack/Telegram).",
	"commands.nativeSkills": "Register native skill commands (user-invocable skills) with channels that support it.",
	"commands.text": "Allow text command parsing (slash commands only).",
	"commands.bash": "Allow bash chat command (`!`; `/bash` alias) to run host shell commands (default: false; requires tools.elevated).",
	"commands.bashForegroundMs": "How long bash waits before backgrounding (default: 2000; 0 backgrounds immediately).",
	"commands.config": "Allow /config chat command to read/write config on disk (default: false).",
	"commands.debug": "Allow /debug chat command for runtime-only overrides (default: false).",
	"commands.restart": "Allow /restart and gateway restart tool actions (default: false).",
	"commands.useAccessGroups": "Enforce access-group allowlists/policies for commands.",
	"commands.ownerAllowFrom": "Explicit owner allowlist for owner-only tools/commands. Use channel-native IDs (optionally prefixed like \"whatsapp:+15551234567\"). '*' is ignored.",
	"session.dmScope": "DM session scoping: \"main\" keeps continuity; \"per-peer\", \"per-channel-peer\", or \"per-account-channel-peer\" isolates DM history (recommended for shared inboxes/multi-account).",
	"session.identityLinks": "Map canonical identities to provider-prefixed peer IDs for DM session linking (example: telegram:123456).",
	"channels.telegram.configWrites": "Allow Telegram to write config in response to channel events/commands (default: true).",
	"channels.slack.configWrites": "Allow Slack to write config in response to channel events/commands (default: true).",
	"channels.mattermost.configWrites": "Allow Mattermost to write config in response to channel events/commands (default: true).",
	"channels.discord.configWrites": "Allow Discord to write config in response to channel events/commands (default: true).",
	"channels.discord.proxy": "Proxy URL for Discord gateway WebSocket connections. Set per account via channels.discord.accounts.<id>.proxy.",
	"channels.whatsapp.configWrites": "Allow WhatsApp to write config in response to channel events/commands (default: true).",
	"channels.signal.configWrites": "Allow Signal to write config in response to channel events/commands (default: true).",
	"channels.imessage.configWrites": "Allow iMessage to write config in response to channel events/commands (default: true).",
	"channels.msteams.configWrites": "Allow Microsoft Teams to write config in response to channel events/commands (default: true).",
	...IRC_FIELD_HELP,
	"channels.discord.commands.native": "Override native commands for Discord (bool or \"auto\").",
	"channels.discord.commands.nativeSkills": "Override native skill commands for Discord (bool or \"auto\").",
	"channels.telegram.commands.native": "Override native commands for Telegram (bool or \"auto\").",
	"channels.telegram.commands.nativeSkills": "Override native skill commands for Telegram (bool or \"auto\").",
	"channels.slack.commands.native": "Override native commands for Slack (bool or \"auto\").",
	"channels.slack.commands.nativeSkills": "Override native skill commands for Slack (bool or \"auto\").",
	"session.agentToAgent.maxPingPongTurns": "Max reply-back turns between requester and target (0–5).",
	"channels.telegram.customCommands": "Additional Telegram bot menu commands (merged with native; conflicts ignored).",
	"messages.ackReaction": "Emoji reaction used to acknowledge inbound messages (empty disables).",
	"messages.ackReactionScope": "When to send ack reactions (\"group-mentions\", \"group-all\", \"direct\", \"all\").",
	"messages.inbound.debounceMs": "Debounce window (ms) for batching rapid inbound messages from the same sender (0 to disable).",
	"channels.telegram.dmPolicy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.telegram.allowFrom=[\"*\"].",
	"channels.telegram.streamMode": "Draft streaming mode for Telegram replies (off | partial | block). Separate from block streaming; requires private topics + sendMessageDraft.",
	"channels.telegram.draftChunk.minChars": "Minimum chars before emitting a Telegram draft update when channels.telegram.streamMode=\"block\" (default: 200).",
	"channels.telegram.draftChunk.maxChars": "Target max size for a Telegram draft update chunk when channels.telegram.streamMode=\"block\" (default: 800; clamped to channels.telegram.textChunkLimit).",
	"channels.telegram.draftChunk.breakPreference": "Preferred breakpoints for Telegram draft chunks (paragraph | newline | sentence). Default: paragraph.",
	"channels.telegram.retry.attempts": "Max retry attempts for outbound Telegram API calls (default: 3).",
	"channels.telegram.retry.minDelayMs": "Minimum retry delay in ms for Telegram outbound calls.",
	"channels.telegram.retry.maxDelayMs": "Maximum retry delay cap in ms for Telegram outbound calls.",
	"channels.telegram.retry.jitter": "Jitter factor (0-1) applied to Telegram retry delays.",
	"channels.telegram.network.autoSelectFamily": "Override Node autoSelectFamily for Telegram (true=enable, false=disable).",
	"channels.telegram.timeoutSeconds": "Max seconds before Telegram API requests are aborted (default: 500 per grammY).",
	"channels.whatsapp.dmPolicy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.whatsapp.allowFrom=[\"*\"].",
	"channels.whatsapp.selfChatMode": "Same-phone setup (bot uses your personal WhatsApp number).",
	"channels.whatsapp.debounceMs": "Debounce window (ms) for batching rapid consecutive messages from the same sender (0 to disable).",
	"channels.signal.dmPolicy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.signal.allowFrom=[\"*\"].",
	"channels.imessage.dmPolicy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.imessage.allowFrom=[\"*\"].",
	"channels.bluebubbles.dmPolicy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.bluebubbles.allowFrom=[\"*\"].",
	"channels.discord.dm.policy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.discord.dm.allowFrom=[\"*\"].",
	"channels.discord.retry.attempts": "Max retry attempts for outbound Discord API calls (default: 3).",
	"channels.discord.retry.minDelayMs": "Minimum retry delay in ms for Discord outbound calls.",
	"channels.discord.retry.maxDelayMs": "Maximum retry delay cap in ms for Discord outbound calls.",
	"channels.discord.retry.jitter": "Jitter factor (0-1) applied to Discord retry delays.",
	"channels.discord.maxLinesPerMessage": "Soft max line count per Discord message (default: 17).",
	"channels.discord.intents.presence": "Enable the Guild Presences privileged intent. Must also be enabled in the Discord Developer Portal. Allows tracking user activities (e.g. Spotify). Default: false.",
	"channels.discord.intents.guildMembers": "Enable the Guild Members privileged intent. Must also be enabled in the Discord Developer Portal. Default: false.",
	"channels.discord.pluralkit.enabled": "Resolve PluralKit proxied messages and treat system members as distinct senders.",
	"channels.discord.pluralkit.token": "Optional PluralKit token for resolving private systems or members.",
	"channels.discord.activity": "Discord presence activity text (defaults to custom status).",
	"channels.discord.status": "Discord presence status (online, dnd, idle, invisible).",
	"channels.discord.activityType": "Discord presence activity type (0=Playing,1=Streaming,2=Listening,3=Watching,4=Custom,5=Competing).",
	"channels.discord.activityUrl": "Discord presence streaming URL (required for activityType=1).",
	"channels.slack.dm.policy": "Direct message access control (\"pairing\" recommended). \"open\" requires channels.slack.dm.allowFrom=[\"*\"]."
};

//#endregion
//#region src/config/schema.labels.ts
const FIELD_LABELS = {
	"meta.lastTouchedVersion": "Config Last Touched Version",
	"meta.lastTouchedAt": "Config Last Touched At",
	"update.channel": "Update Channel",
	"update.checkOnStart": "Update Check on Start",
	"diagnostics.enabled": "Diagnostics Enabled",
	"diagnostics.flags": "Diagnostics Flags",
	"diagnostics.otel.enabled": "OpenTelemetry Enabled",
	"diagnostics.otel.endpoint": "OpenTelemetry Endpoint",
	"diagnostics.otel.protocol": "OpenTelemetry Protocol",
	"diagnostics.otel.headers": "OpenTelemetry Headers",
	"diagnostics.otel.serviceName": "OpenTelemetry Service Name",
	"diagnostics.otel.traces": "OpenTelemetry Traces Enabled",
	"diagnostics.otel.metrics": "OpenTelemetry Metrics Enabled",
	"diagnostics.otel.logs": "OpenTelemetry Logs Enabled",
	"diagnostics.otel.sampleRate": "OpenTelemetry Trace Sample Rate",
	"diagnostics.otel.flushIntervalMs": "OpenTelemetry Flush Interval (ms)",
	"diagnostics.cacheTrace.enabled": "Cache Trace Enabled",
	"diagnostics.cacheTrace.filePath": "Cache Trace File Path",
	"diagnostics.cacheTrace.includeMessages": "Cache Trace Include Messages",
	"diagnostics.cacheTrace.includePrompt": "Cache Trace Include Prompt",
	"diagnostics.cacheTrace.includeSystem": "Cache Trace Include System",
	"agents.list.*.identity.avatar": "Identity Avatar",
	"agents.list.*.skills": "Agent Skill Filter",
	"gateway.remote.url": "Remote Gateway URL",
	"gateway.remote.sshTarget": "Remote Gateway SSH Target",
	"gateway.remote.sshIdentity": "Remote Gateway SSH Identity",
	"gateway.remote.token": "Remote Gateway Token",
	"gateway.remote.password": "Remote Gateway Password",
	"gateway.remote.tlsFingerprint": "Remote Gateway TLS Fingerprint",
	"gateway.auth.token": "Gateway Token",
	"gateway.auth.password": "Gateway Password",
	"tools.media.image.enabled": "Enable Image Understanding",
	"tools.media.image.maxBytes": "Image Understanding Max Bytes",
	"tools.media.image.maxChars": "Image Understanding Max Chars",
	"tools.media.image.prompt": "Image Understanding Prompt",
	"tools.media.image.timeoutSeconds": "Image Understanding Timeout (sec)",
	"tools.media.image.attachments": "Image Understanding Attachment Policy",
	"tools.media.image.models": "Image Understanding Models",
	"tools.media.image.scope": "Image Understanding Scope",
	"tools.media.models": "Media Understanding Shared Models",
	"tools.media.concurrency": "Media Understanding Concurrency",
	"tools.media.audio.enabled": "Enable Audio Understanding",
	"tools.media.audio.maxBytes": "Audio Understanding Max Bytes",
	"tools.media.audio.maxChars": "Audio Understanding Max Chars",
	"tools.media.audio.prompt": "Audio Understanding Prompt",
	"tools.media.audio.timeoutSeconds": "Audio Understanding Timeout (sec)",
	"tools.media.audio.language": "Audio Understanding Language",
	"tools.media.audio.attachments": "Audio Understanding Attachment Policy",
	"tools.media.audio.models": "Audio Understanding Models",
	"tools.media.audio.scope": "Audio Understanding Scope",
	"tools.media.video.enabled": "Enable Video Understanding",
	"tools.media.video.maxBytes": "Video Understanding Max Bytes",
	"tools.media.video.maxChars": "Video Understanding Max Chars",
	"tools.media.video.prompt": "Video Understanding Prompt",
	"tools.media.video.timeoutSeconds": "Video Understanding Timeout (sec)",
	"tools.media.video.attachments": "Video Understanding Attachment Policy",
	"tools.media.video.models": "Video Understanding Models",
	"tools.media.video.scope": "Video Understanding Scope",
	"tools.links.enabled": "Enable Link Understanding",
	"tools.links.maxLinks": "Link Understanding Max Links",
	"tools.links.timeoutSeconds": "Link Understanding Timeout (sec)",
	"tools.links.models": "Link Understanding Models",
	"tools.links.scope": "Link Understanding Scope",
	"tools.profile": "Tool Profile",
	"tools.alsoAllow": "Tool Allowlist Additions",
	"agents.list[].tools.profile": "Agent Tool Profile",
	"agents.list[].tools.alsoAllow": "Agent Tool Allowlist Additions",
	"tools.byProvider": "Tool Policy by Provider",
	"agents.list[].tools.byProvider": "Agent Tool Policy by Provider",
	"tools.exec.applyPatch.enabled": "Enable apply_patch",
	"tools.exec.applyPatch.allowModels": "apply_patch Model Allowlist",
	"tools.exec.notifyOnExit": "Exec Notify On Exit",
	"tools.exec.approvalRunningNoticeMs": "Exec Approval Running Notice (ms)",
	"tools.exec.host": "Exec Host",
	"tools.exec.security": "Exec Security",
	"tools.exec.ask": "Exec Ask",
	"tools.exec.node": "Exec Node Binding",
	"tools.exec.pathPrepend": "Exec PATH Prepend",
	"tools.exec.safeBins": "Exec Safe Bins",
	"tools.message.allowCrossContextSend": "Allow Cross-Context Messaging",
	"tools.message.crossContext.allowWithinProvider": "Allow Cross-Context (Same Provider)",
	"tools.message.crossContext.allowAcrossProviders": "Allow Cross-Context (Across Providers)",
	"tools.message.crossContext.marker.enabled": "Cross-Context Marker",
	"tools.message.crossContext.marker.prefix": "Cross-Context Marker Prefix",
	"tools.message.crossContext.marker.suffix": "Cross-Context Marker Suffix",
	"tools.message.broadcast.enabled": "Enable Message Broadcast",
	"tools.web.search.enabled": "Enable Web Search Tool",
	"tools.web.search.provider": "Web Search Provider",
	"tools.web.search.apiKey": "Brave Search API Key",
	"tools.web.search.maxResults": "Web Search Max Results",
	"tools.web.search.timeoutSeconds": "Web Search Timeout (sec)",
	"tools.web.search.cacheTtlMinutes": "Web Search Cache TTL (min)",
	"tools.web.fetch.enabled": "Enable Web Fetch Tool",
	"tools.web.fetch.maxChars": "Web Fetch Max Chars",
	"tools.web.fetch.timeoutSeconds": "Web Fetch Timeout (sec)",
	"tools.web.fetch.cacheTtlMinutes": "Web Fetch Cache TTL (min)",
	"tools.web.fetch.maxRedirects": "Web Fetch Max Redirects",
	"tools.web.fetch.userAgent": "Web Fetch User-Agent",
	"gateway.controlUi.basePath": "Control UI Base Path",
	"gateway.controlUi.root": "Control UI Assets Root",
	"gateway.controlUi.allowedOrigins": "Control UI Allowed Origins",
	"gateway.controlUi.allowInsecureAuth": "Allow Insecure Control UI Auth",
	"gateway.controlUi.dangerouslyDisableDeviceAuth": "Dangerously Disable Control UI Device Auth",
	"gateway.http.endpoints.chatCompletions.enabled": "OpenAI Chat Completions Endpoint",
	"gateway.reload.mode": "Config Reload Mode",
	"gateway.reload.debounceMs": "Config Reload Debounce (ms)",
	"gateway.nodes.browser.mode": "Gateway Node Browser Mode",
	"gateway.nodes.browser.node": "Gateway Node Browser Pin",
	"gateway.nodes.allowCommands": "Gateway Node Allowlist (Extra Commands)",
	"gateway.nodes.denyCommands": "Gateway Node Denylist",
	"nodeHost.browserProxy.enabled": "Node Browser Proxy Enabled",
	"nodeHost.browserProxy.allowProfiles": "Node Browser Proxy Allowed Profiles",
	"skills.load.watch": "Watch Skills",
	"skills.load.watchDebounceMs": "Skills Watch Debounce (ms)",
	"agents.defaults.workspace": "Workspace",
	"agents.defaults.repoRoot": "Repo Root",
	"agents.defaults.bootstrapMaxChars": "Bootstrap Max Chars",
	"agents.defaults.envelopeTimezone": "Envelope Timezone",
	"agents.defaults.envelopeTimestamp": "Envelope Timestamp",
	"agents.defaults.envelopeElapsed": "Envelope Elapsed",
	"agents.defaults.memorySearch": "Memory Search",
	"agents.defaults.memorySearch.enabled": "Enable Memory Search",
	"agents.defaults.memorySearch.sources": "Memory Search Sources",
	"agents.defaults.memorySearch.extraPaths": "Extra Memory Paths",
	"agents.defaults.memorySearch.experimental.sessionMemory": "Memory Search Session Index (Experimental)",
	"agents.defaults.memorySearch.provider": "Memory Search Provider",
	"agents.defaults.memorySearch.remote.baseUrl": "Remote Embedding Base URL",
	"agents.defaults.memorySearch.remote.apiKey": "Remote Embedding API Key",
	"agents.defaults.memorySearch.remote.headers": "Remote Embedding Headers",
	"agents.defaults.memorySearch.remote.batch.concurrency": "Remote Batch Concurrency",
	"agents.defaults.memorySearch.model": "Memory Search Model",
	"agents.defaults.memorySearch.fallback": "Memory Search Fallback",
	"agents.defaults.memorySearch.local.modelPath": "Local Embedding Model Path",
	"agents.defaults.memorySearch.store.path": "Memory Search Index Path",
	"agents.defaults.memorySearch.store.vector.enabled": "Memory Search Vector Index",
	"agents.defaults.memorySearch.store.vector.extensionPath": "Memory Search Vector Extension Path",
	"agents.defaults.memorySearch.chunking.tokens": "Memory Chunk Tokens",
	"agents.defaults.memorySearch.chunking.overlap": "Memory Chunk Overlap Tokens",
	"agents.defaults.memorySearch.sync.onSessionStart": "Index on Session Start",
	"agents.defaults.memorySearch.sync.onSearch": "Index on Search (Lazy)",
	"agents.defaults.memorySearch.sync.watch": "Watch Memory Files",
	"agents.defaults.memorySearch.sync.watchDebounceMs": "Memory Watch Debounce (ms)",
	"agents.defaults.memorySearch.sync.sessions.deltaBytes": "Session Delta Bytes",
	"agents.defaults.memorySearch.sync.sessions.deltaMessages": "Session Delta Messages",
	"agents.defaults.memorySearch.query.maxResults": "Memory Search Max Results",
	"agents.defaults.memorySearch.query.minScore": "Memory Search Min Score",
	"agents.defaults.memorySearch.query.hybrid.enabled": "Memory Search Hybrid",
	"agents.defaults.memorySearch.query.hybrid.vectorWeight": "Memory Search Vector Weight",
	"agents.defaults.memorySearch.query.hybrid.textWeight": "Memory Search Text Weight",
	"agents.defaults.memorySearch.query.hybrid.candidateMultiplier": "Memory Search Hybrid Candidate Multiplier",
	"agents.defaults.memorySearch.cache.enabled": "Memory Search Embedding Cache",
	"agents.defaults.memorySearch.cache.maxEntries": "Memory Search Embedding Cache Max Entries",
	memory: "Memory",
	"memory.backend": "Memory Backend",
	"memory.citations": "Memory Citations Mode",
	"memory.qmd.command": "QMD Binary",
	"memory.qmd.includeDefaultMemory": "QMD Include Default Memory",
	"memory.qmd.paths": "QMD Extra Paths",
	"memory.qmd.paths.path": "QMD Path",
	"memory.qmd.paths.pattern": "QMD Path Pattern",
	"memory.qmd.paths.name": "QMD Path Name",
	"memory.qmd.sessions.enabled": "QMD Session Indexing",
	"memory.qmd.sessions.exportDir": "QMD Session Export Directory",
	"memory.qmd.sessions.retentionDays": "QMD Session Retention (days)",
	"memory.qmd.update.interval": "QMD Update Interval",
	"memory.qmd.update.debounceMs": "QMD Update Debounce (ms)",
	"memory.qmd.update.onBoot": "QMD Update on Startup",
	"memory.qmd.update.waitForBootSync": "QMD Wait for Boot Sync",
	"memory.qmd.update.embedInterval": "QMD Embed Interval",
	"memory.qmd.update.commandTimeoutMs": "QMD Command Timeout (ms)",
	"memory.qmd.update.updateTimeoutMs": "QMD Update Timeout (ms)",
	"memory.qmd.update.embedTimeoutMs": "QMD Embed Timeout (ms)",
	"memory.qmd.limits.maxResults": "QMD Max Results",
	"memory.qmd.limits.maxSnippetChars": "QMD Max Snippet Chars",
	"memory.qmd.limits.maxInjectedChars": "QMD Max Injected Chars",
	"memory.qmd.limits.timeoutMs": "QMD Search Timeout (ms)",
	"memory.qmd.scope": "QMD Surface Scope",
	"auth.profiles": "Auth Profiles",
	"auth.order": "Auth Profile Order",
	"auth.cooldowns.billingBackoffHours": "Billing Backoff (hours)",
	"auth.cooldowns.billingBackoffHoursByProvider": "Billing Backoff Overrides",
	"auth.cooldowns.billingMaxHours": "Billing Backoff Cap (hours)",
	"auth.cooldowns.failureWindowHours": "Failover Window (hours)",
	"agents.defaults.models": "Models",
	"agents.defaults.model.primary": "Primary Model",
	"agents.defaults.model.fallbacks": "Model Fallbacks",
	"agents.defaults.imageModel.primary": "Image Model",
	"agents.defaults.imageModel.fallbacks": "Image Model Fallbacks",
	"agents.defaults.humanDelay.mode": "Human Delay Mode",
	"agents.defaults.humanDelay.minMs": "Human Delay Min (ms)",
	"agents.defaults.humanDelay.maxMs": "Human Delay Max (ms)",
	"agents.defaults.cliBackends": "CLI Backends",
	"commands.native": "Native Commands",
	"commands.nativeSkills": "Native Skill Commands",
	"commands.text": "Text Commands",
	"commands.bash": "Allow Bash Chat Command",
	"commands.bashForegroundMs": "Bash Foreground Window (ms)",
	"commands.config": "Allow /config",
	"commands.debug": "Allow /debug",
	"commands.restart": "Allow Restart",
	"commands.useAccessGroups": "Use Access Groups",
	"commands.ownerAllowFrom": "Command Owners",
	"ui.seamColor": "Accent Color",
	"ui.assistant.name": "Assistant Name",
	"ui.assistant.avatar": "Assistant Avatar",
	"browser.evaluateEnabled": "Browser Evaluate Enabled",
	"browser.snapshotDefaults": "Browser Snapshot Defaults",
	"browser.snapshotDefaults.mode": "Browser Snapshot Mode",
	"browser.remoteCdpTimeoutMs": "Remote CDP Timeout (ms)",
	"browser.remoteCdpHandshakeTimeoutMs": "Remote CDP Handshake Timeout (ms)",
	"session.dmScope": "DM Session Scope",
	"session.agentToAgent.maxPingPongTurns": "Agent-to-Agent Ping-Pong Turns",
	"messages.ackReaction": "Ack Reaction Emoji",
	"messages.ackReactionScope": "Ack Reaction Scope",
	"messages.inbound.debounceMs": "Inbound Message Debounce (ms)",
	"talk.apiKey": "Talk API Key",
	"channels.whatsapp": "WhatsApp",
	"channels.telegram": "Telegram",
	"channels.telegram.customCommands": "Telegram Custom Commands",
	"channels.discord": "Discord",
	"channels.slack": "Slack",
	"channels.mattermost": "Mattermost",
	"channels.signal": "Signal",
	"channels.imessage": "iMessage",
	"channels.bluebubbles": "BlueBubbles",
	"channels.msteams": "MS Teams",
	...IRC_FIELD_LABELS,
	"channels.telegram.botToken": "Telegram Bot Token",
	"channels.telegram.dmPolicy": "Telegram DM Policy",
	"channels.telegram.streamMode": "Telegram Draft Stream Mode",
	"channels.telegram.draftChunk.minChars": "Telegram Draft Chunk Min Chars",
	"channels.telegram.draftChunk.maxChars": "Telegram Draft Chunk Max Chars",
	"channels.telegram.draftChunk.breakPreference": "Telegram Draft Chunk Break Preference",
	"channels.telegram.retry.attempts": "Telegram Retry Attempts",
	"channels.telegram.retry.minDelayMs": "Telegram Retry Min Delay (ms)",
	"channels.telegram.retry.maxDelayMs": "Telegram Retry Max Delay (ms)",
	"channels.telegram.retry.jitter": "Telegram Retry Jitter",
	"channels.telegram.network.autoSelectFamily": "Telegram autoSelectFamily",
	"channels.telegram.timeoutSeconds": "Telegram API Timeout (seconds)",
	"channels.telegram.capabilities.inlineButtons": "Telegram Inline Buttons",
	"channels.whatsapp.dmPolicy": "WhatsApp DM Policy",
	"channels.whatsapp.selfChatMode": "WhatsApp Self-Phone Mode",
	"channels.whatsapp.debounceMs": "WhatsApp Message Debounce (ms)",
	"channels.signal.dmPolicy": "Signal DM Policy",
	"channels.imessage.dmPolicy": "iMessage DM Policy",
	"channels.bluebubbles.dmPolicy": "BlueBubbles DM Policy",
	"channels.discord.dm.policy": "Discord DM Policy",
	"channels.discord.retry.attempts": "Discord Retry Attempts",
	"channels.discord.retry.minDelayMs": "Discord Retry Min Delay (ms)",
	"channels.discord.retry.maxDelayMs": "Discord Retry Max Delay (ms)",
	"channels.discord.retry.jitter": "Discord Retry Jitter",
	"channels.discord.maxLinesPerMessage": "Discord Max Lines Per Message",
	"channels.discord.intents.presence": "Discord Presence Intent",
	"channels.discord.intents.guildMembers": "Discord Guild Members Intent",
	"channels.discord.pluralkit.enabled": "Discord PluralKit Enabled",
	"channels.discord.pluralkit.token": "Discord PluralKit Token",
	"channels.discord.activity": "Discord Presence Activity",
	"channels.discord.status": "Discord Presence Status",
	"channels.discord.activityType": "Discord Presence Activity Type",
	"channels.discord.activityUrl": "Discord Presence Activity URL",
	"channels.slack.dm.policy": "Slack DM Policy",
	"channels.slack.allowBots": "Slack Allow Bot Messages",
	"channels.discord.token": "Discord Bot Token",
	"channels.slack.botToken": "Slack Bot Token",
	"channels.slack.appToken": "Slack App Token",
	"channels.slack.userToken": "Slack User Token",
	"channels.slack.userTokenReadOnly": "Slack User Token Read Only",
	"channels.slack.thread.historyScope": "Slack Thread History Scope",
	"channels.slack.thread.inheritParent": "Slack Thread Parent Inheritance",
	"channels.slack.thread.initialHistoryLimit": "Slack Thread Initial History Limit",
	"channels.mattermost.botToken": "Mattermost Bot Token",
	"channels.mattermost.baseUrl": "Mattermost Base URL",
	"channels.mattermost.chatmode": "Mattermost Chat Mode",
	"channels.mattermost.oncharPrefixes": "Mattermost Onchar Prefixes",
	"channels.mattermost.requireMention": "Mattermost Require Mention",
	"channels.signal.account": "Signal Account",
	"channels.imessage.cliPath": "iMessage CLI Path",
	"agents.list[].skills": "Agent Skill Filter",
	"agents.list[].identity.avatar": "Agent Avatar",
	"discovery.mdns.mode": "mDNS Discovery Mode",
	"plugins.enabled": "Enable Plugins",
	"plugins.allow": "Plugin Allowlist",
	"plugins.deny": "Plugin Denylist",
	"plugins.load.paths": "Plugin Load Paths",
	"plugins.slots": "Plugin Slots",
	"plugins.slots.memory": "Memory Plugin",
	"plugins.entries": "Plugin Entries",
	"plugins.entries.*.enabled": "Plugin Enabled",
	"plugins.entries.*.config": "Plugin Config",
	"plugins.installs": "Plugin Install Records",
	"plugins.installs.*.source": "Plugin Install Source",
	"plugins.installs.*.spec": "Plugin Install Spec",
	"plugins.installs.*.sourcePath": "Plugin Install Source Path",
	"plugins.installs.*.installPath": "Plugin Install Path",
	"plugins.installs.*.version": "Plugin Install Version",
	"plugins.installs.*.installedAt": "Plugin Install Time"
};

//#endregion
//#region src/config/schema.hints.ts
const log$4 = createSubsystemLogger("config/schema");
const GROUP_LABELS = {
	wizard: "Wizard",
	update: "Update",
	diagnostics: "Diagnostics",
	logging: "Logging",
	gateway: "Gateway",
	nodeHost: "Node Host",
	agents: "Agents",
	tools: "Tools",
	bindings: "Bindings",
	audio: "Audio",
	models: "Models",
	messages: "Messages",
	commands: "Commands",
	session: "Session",
	cron: "Cron",
	hooks: "Hooks",
	ui: "UI",
	browser: "Browser",
	talk: "Talk",
	channels: "Messaging Channels",
	skills: "Skills",
	plugins: "Plugins",
	discovery: "Discovery",
	presence: "Presence",
	voicewake: "Voice Wake"
};
const GROUP_ORDER = {
	wizard: 20,
	update: 25,
	diagnostics: 27,
	gateway: 30,
	nodeHost: 35,
	agents: 40,
	tools: 50,
	bindings: 55,
	audio: 60,
	models: 70,
	messages: 80,
	commands: 85,
	session: 90,
	cron: 100,
	hooks: 110,
	ui: 120,
	browser: 130,
	talk: 140,
	channels: 150,
	skills: 200,
	plugins: 205,
	discovery: 210,
	presence: 220,
	voicewake: 230,
	logging: 900
};
const FIELD_PLACEHOLDERS = {
	"gateway.remote.url": "ws://host:18789",
	"gateway.remote.tlsFingerprint": "sha256:ab12cd34…",
	"gateway.remote.sshTarget": "user@host",
	"gateway.controlUi.basePath": "/openclaw",
	"gateway.controlUi.root": "dist/control-ui",
	"gateway.controlUi.allowedOrigins": "https://control.example.com",
	"channels.mattermost.baseUrl": "https://chat.example.com",
	"agents.list[].identity.avatar": "avatars/openclaw.png"
};
/**
* Non-sensitive field names that happen to match sensitive patterns.
* These are explicitly excluded from redaction (plugin config) and
* warnings about not being marked sensitive (base config).
*/
const SENSITIVE_KEY_WHITELIST = new Set([
	"maxtokens",
	"maxoutputtokens",
	"maxinputtokens",
	"maxcompletiontokens",
	"contexttokens",
	"totaltokens",
	"tokencount",
	"tokenlimit",
	"tokenbudget",
	"passwordFile"
]);
const SENSITIVE_PATTERNS = [
	/token$/i,
	/password/i,
	/secret/i,
	/api.?key/i
];
function isSensitiveConfigPath(path) {
	return !Array.from(SENSITIVE_KEY_WHITELIST).some((suffix) => path.endsWith(suffix)) && SENSITIVE_PATTERNS.some((pattern) => pattern.test(path));
}
function buildBaseHints() {
	const hints = {};
	for (const [group, label] of Object.entries(GROUP_LABELS)) hints[group] = {
		label,
		group: label,
		order: GROUP_ORDER[group]
	};
	for (const [path, label] of Object.entries(FIELD_LABELS)) {
		const current = hints[path];
		hints[path] = current ? {
			...current,
			label
		} : { label };
	}
	for (const [path, help] of Object.entries(FIELD_HELP)) {
		const current = hints[path];
		hints[path] = current ? {
			...current,
			help
		} : { help };
	}
	for (const [path, placeholder] of Object.entries(FIELD_PLACEHOLDERS)) {
		const current = hints[path];
		hints[path] = current ? {
			...current,
			placeholder
		} : { placeholder };
	}
	return hints;
}
function applySensitiveHints(hints, allowedKeys) {
	const next = { ...hints };
	for (const key of Object.keys(next)) {
		if (allowedKeys && !allowedKeys.has(key)) continue;
		if (next[key]?.sensitive !== void 0) continue;
		if (isSensitiveConfigPath(key)) next[key] = {
			...next[key],
			sensitive: true
		};
	}
	return next;
}
function isUnwrappable(object) {
	return !!object && typeof object === "object" && "unwrap" in object && typeof object.unwrap === "function" && !(object instanceof z.ZodArray);
}
function mapSensitivePaths(schema, path, hints) {
	let next = { ...hints };
	let currentSchema = schema;
	let isSensitive = sensitive.has(currentSchema);
	while (isUnwrappable(currentSchema)) {
		currentSchema = currentSchema.unwrap();
		isSensitive ||= sensitive.has(currentSchema);
	}
	if (isSensitive) next[path] = {
		...next[path],
		sensitive: true
	};
	else if (isSensitiveConfigPath(path) && !next[path]?.sensitive) log$4.warn(`possibly sensitive key found: (${path})`);
	if (currentSchema instanceof z.ZodObject) {
		const shape = currentSchema.shape;
		for (const key in shape) {
			const nextPath = path ? `${path}.${key}` : key;
			next = mapSensitivePaths(shape[key], nextPath, next);
		}
	} else if (currentSchema instanceof z.ZodArray) {
		const nextPath = path ? `${path}[]` : "[]";
		next = mapSensitivePaths(currentSchema.element, nextPath, next);
	} else if (currentSchema instanceof z.ZodRecord) {
		const nextPath = path ? `${path}.*` : "*";
		next = mapSensitivePaths(currentSchema._def.valueType, nextPath, next);
	} else if (currentSchema instanceof z.ZodUnion || currentSchema instanceof z.ZodDiscriminatedUnion) for (const option of currentSchema.options) next = mapSensitivePaths(option, path, next);
	else if (currentSchema instanceof z.ZodIntersection) {
		next = mapSensitivePaths(currentSchema._def.left, path, next);
		next = mapSensitivePaths(currentSchema._def.right, path, next);
	}
	return next;
}

//#endregion
//#region src/config/redact-snapshot.ts
const log$3 = createSubsystemLogger("config/redaction");
const ENV_VAR_PLACEHOLDER_PATTERN = /^\$\{[^}]*\}$/;
function isSensitivePath(path) {
	if (path.endsWith("[]")) return isSensitiveConfigPath(path.slice(0, -2));
	else return isSensitiveConfigPath(path);
}
function isEnvVarPlaceholder(value) {
	return ENV_VAR_PLACEHOLDER_PATTERN.test(value.trim());
}
function isExtensionPath(path) {
	return path === "plugins" || path.startsWith("plugins.") || path === "channels" || path.startsWith("channels.");
}
function isExplicitlyNonSensitivePath(hints, paths) {
	if (!hints) return false;
	return paths.some((path) => hints[path]?.sensitive === false);
}
/**
* Sentinel value used to replace sensitive config fields in gateway responses.
* Write-side handlers (config.set, config.apply, config.patch) detect this
* sentinel and restore the original value from the on-disk config, so a
* round-trip through the Web UI does not corrupt credentials.
*/
const REDACTED_SENTINEL = "__OPENCLAW_REDACTED__";
function buildRedactionLookup(hints) {
	let result = /* @__PURE__ */ new Set();
	for (const [path, hint] of Object.entries(hints)) {
		if (!hint.sensitive) continue;
		const parts = path.split(".");
		let joinedPath = parts.shift() ?? "";
		result.add(joinedPath);
		if (joinedPath.endsWith("[]")) result.add(joinedPath.slice(0, -2));
		for (const part of parts) {
			if (part.endsWith("[]")) result.add(`${joinedPath}.${part.slice(0, -2)}`);
			joinedPath = `${joinedPath}.${part}`;
			result.add(joinedPath);
		}
	}
	if (result.size !== 0) result.add("");
	return result;
}
/**
* Deep-walk an object and replace string values at sensitive paths
* with the redaction sentinel.
*/
function redactObject(obj, hints) {
	if (hints) {
		const lookup = buildRedactionLookup(hints);
		return lookup.has("") ? redactObjectWithLookup(obj, lookup, "", [], hints) : redactObjectGuessing(obj, "", [], hints);
	} else return redactObjectGuessing(obj, "", []);
}
/**
* Collect all sensitive string values from a config object.
* Used for text-based redaction of the raw JSON5 source.
*/
function collectSensitiveValues(obj, hints) {
	const result = [];
	if (hints) {
		const lookup = buildRedactionLookup(hints);
		if (lookup.has("")) redactObjectWithLookup(obj, lookup, "", result, hints);
		else redactObjectGuessing(obj, "", result, hints);
	} else redactObjectGuessing(obj, "", result);
	return result;
}
/**
* Worker for redactObject() and collectSensitiveValues().
* Used when there are ConfigUiHints available.
*/
function redactObjectWithLookup(obj, lookup, prefix, values, hints) {
	if (obj === null || obj === void 0) return obj;
	if (Array.isArray(obj)) {
		const path = `${prefix}[]`;
		if (!lookup.has(path)) {
			if (!isExtensionPath(prefix)) return obj;
			return redactObjectGuessing(obj, prefix, values, hints);
		}
		return obj.map((item) => {
			if (typeof item === "string" && !isEnvVarPlaceholder(item)) {
				values.push(item);
				return REDACTED_SENTINEL;
			}
			return redactObjectWithLookup(item, lookup, path, values, hints);
		});
	}
	if (typeof obj === "object") {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			const path = prefix ? `${prefix}.${key}` : key;
			const wildcardPath = prefix ? `${prefix}.*` : "*";
			let matched = false;
			for (const candidate of [path, wildcardPath]) {
				result[key] = value;
				if (lookup.has(candidate)) {
					matched = true;
					if (typeof value === "string" && !isEnvVarPlaceholder(value)) {
						result[key] = REDACTED_SENTINEL;
						values.push(value);
					} else if (typeof value === "object" && value !== null) result[key] = redactObjectWithLookup(value, lookup, candidate, values, hints);
					break;
				}
			}
			if (!matched && isExtensionPath(path)) {
				const markedNonSensitive = isExplicitlyNonSensitivePath(hints, [path, wildcardPath]);
				if (typeof value === "string" && !markedNonSensitive && isSensitivePath(path) && !isEnvVarPlaceholder(value)) {
					result[key] = REDACTED_SENTINEL;
					values.push(value);
				} else if (typeof value === "object" && value !== null) result[key] = redactObjectGuessing(value, path, values, hints);
			}
		}
		return result;
	}
	return obj;
}
/**
* Worker for redactObject() and collectSensitiveValues().
* Used when ConfigUiHints are NOT available.
*/
function redactObjectGuessing(obj, prefix, values, hints) {
	if (obj === null || obj === void 0) return obj;
	if (Array.isArray(obj)) return obj.map((item) => {
		const path = `${prefix}[]`;
		if (!isExplicitlyNonSensitivePath(hints, [path]) && isSensitivePath(path) && typeof item === "string" && !isEnvVarPlaceholder(item)) {
			values.push(item);
			return REDACTED_SENTINEL;
		}
		return redactObjectGuessing(item, path, values, hints);
	});
	if (typeof obj === "object") {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			const dotPath = prefix ? `${prefix}.${key}` : key;
			if (!isExplicitlyNonSensitivePath(hints, [dotPath, prefix ? `${prefix}.*` : "*"]) && isSensitivePath(dotPath) && typeof value === "string" && !isEnvVarPlaceholder(value)) {
				result[key] = REDACTED_SENTINEL;
				values.push(value);
			} else if (typeof value === "object" && value !== null) result[key] = redactObjectGuessing(value, dotPath, values, hints);
			else result[key] = value;
		}
		return result;
	}
	return obj;
}
/**
* Replace known sensitive values in a raw JSON5 string with the sentinel.
* Values are replaced longest-first to avoid partial matches.
*/
function redactRawText(raw, config, hints) {
	const sensitiveValues = collectSensitiveValues(config, hints);
	sensitiveValues.sort((a, b) => b.length - a.length);
	let result = raw;
	for (const value of sensitiveValues) result = result.replaceAll(value, REDACTED_SENTINEL);
	return result;
}
/**
* Returns a copy of the config snapshot with all sensitive fields
* replaced by {@link REDACTED_SENTINEL}. The `hash` is preserved
* (it tracks config identity, not content).
*
* Both `config` (the parsed object) and `raw` (the JSON5 source) are scrubbed
* so no credential can leak through either path.
*
* When `uiHints` are provided, sensitivity is determined from the schema hints.
* Without hints, falls back to regex-based detection via `isSensitivePath()`.
*/
/**
* Redact sensitive fields from a plain config object (not a full snapshot).
* Used by write endpoints (config.set, config.patch, config.apply) to avoid
* leaking credentials in their responses.
*/
function redactConfigObject(value, uiHints) {
	return redactObject(value, uiHints);
}
function redactConfigSnapshot(snapshot, uiHints) {
	if (!snapshot.valid) return {
		...snapshot,
		config: {},
		raw: null,
		parsed: null,
		resolved: {}
	};
	const redactedConfig = redactObject(snapshot.config, uiHints);
	const redactedRaw = snapshot.raw ? redactRawText(snapshot.raw, snapshot.config, uiHints) : null;
	const redactedParsed = snapshot.parsed ? redactObject(snapshot.parsed, uiHints) : snapshot.parsed;
	const redactedResolved = redactConfigObject(snapshot.resolved);
	return {
		...snapshot,
		config: redactedConfig,
		raw: redactedRaw,
		parsed: redactedParsed,
		resolved: redactedResolved
	};
}
/**
* Deep-walk `incoming` and replace any {@link REDACTED_SENTINEL} values
* (on sensitive paths) with the corresponding value from `original`.
*
* This is called by config.set / config.apply / config.patch before writing,
* so that credentials survive a Web UI round-trip unmodified.
*/
function restoreRedactedValues(incoming, original, hints) {
	if (incoming === null || incoming === void 0) return {
		ok: false,
		error: "no input"
	};
	if (typeof incoming !== "object") return {
		ok: false,
		error: "input not an object"
	};
	try {
		if (hints) {
			const lookup = buildRedactionLookup(hints);
			if (lookup.has("")) return {
				ok: true,
				result: restoreRedactedValuesWithLookup(incoming, original, lookup, "", hints)
			};
			else return {
				ok: true,
				result: restoreRedactedValuesGuessing(incoming, original, "", hints)
			};
		} else return {
			ok: true,
			result: restoreRedactedValuesGuessing(incoming, original, "")
		};
	} catch (err) {
		if (err instanceof RedactionError) return {
			ok: false,
			humanReadableMessage: `Sentinel value "${REDACTED_SENTINEL}" in key ${err.key} is not valid as real data`
		};
		throw err;
	}
}
var RedactionError = class RedactionError extends Error {
	constructor(key) {
		super("internal error class---should never escape");
		this.key = key;
		this.name = "RedactionError";
		Object.setPrototypeOf(this, RedactionError.prototype);
	}
};
/**
* Worker for restoreRedactedValues().
* Used when there are ConfigUiHints available.
*/
function restoreRedactedValuesWithLookup(incoming, original, lookup, prefix, hints) {
	if (incoming === null || incoming === void 0) return incoming;
	if (typeof incoming !== "object") return incoming;
	if (Array.isArray(incoming)) {
		const path = `${prefix}[]`;
		if (!lookup.has(path)) {
			if (!isExtensionPath(prefix)) return incoming;
			return restoreRedactedValuesGuessing(incoming, original, prefix, hints);
		}
		const origArr = Array.isArray(original) ? original : [];
		if (incoming.length < origArr.length) log$3.warn(`Redacted config array key ${path} has been truncated`);
		return incoming.map((item, i) => {
			if (item === REDACTED_SENTINEL) return origArr[i];
			return restoreRedactedValuesWithLookup(item, origArr[i], lookup, path, hints);
		});
	}
	const orig = original && typeof original === "object" && !Array.isArray(original) ? original : {};
	const result = {};
	for (const [key, value] of Object.entries(incoming)) {
		result[key] = value;
		const path = prefix ? `${prefix}.${key}` : key;
		const wildcardPath = prefix ? `${prefix}.*` : "*";
		let matched = false;
		for (const candidate of [path, wildcardPath]) if (lookup.has(candidate)) {
			matched = true;
			if (value === REDACTED_SENTINEL) if (key in orig) result[key] = orig[key];
			else {
				log$3.warn(`Cannot un-redact config key ${candidate} as it doesn't have any value`);
				throw new RedactionError(candidate);
			}
			else if (typeof value === "object" && value !== null) result[key] = restoreRedactedValuesWithLookup(value, orig[key], lookup, candidate, hints);
			break;
		}
		if (!matched && isExtensionPath(path)) {
			if (!isExplicitlyNonSensitivePath(hints, [path, wildcardPath]) && isSensitivePath(path) && value === REDACTED_SENTINEL) if (key in orig) result[key] = orig[key];
			else {
				log$3.warn(`Cannot un-redact config key ${path} as it doesn't have any value`);
				throw new RedactionError(path);
			}
			else if (typeof value === "object" && value !== null) result[key] = restoreRedactedValuesGuessing(value, orig[key], path, hints);
		}
	}
	return result;
}
/**
* Worker for restoreRedactedValues().
* Used when ConfigUiHints are NOT available.
*/
function restoreRedactedValuesGuessing(incoming, original, prefix, hints) {
	if (incoming === null || incoming === void 0) return incoming;
	if (typeof incoming !== "object") return incoming;
	if (Array.isArray(incoming)) {
		const origArr = Array.isArray(original) ? original : [];
		return incoming.map((item, i) => {
			const path = `${prefix}[]`;
			if (incoming.length < origArr.length) log$3.warn(`Redacted config array key ${path} has been truncated`);
			if (!isExplicitlyNonSensitivePath(hints, [path]) && isSensitivePath(path) && item === REDACTED_SENTINEL) return origArr[i];
			return restoreRedactedValuesGuessing(item, origArr[i], path, hints);
		});
	}
	const orig = original && typeof original === "object" && !Array.isArray(original) ? original : {};
	const result = {};
	for (const [key, value] of Object.entries(incoming)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (!isExplicitlyNonSensitivePath(hints, [path, prefix ? `${prefix}.*` : "*"]) && isSensitivePath(path) && value === REDACTED_SENTINEL) if (key in orig) result[key] = orig[key];
		else {
			log$3.warn(`Cannot un-redact config key ${path} as it doesn't have any value`);
			throw new RedactionError(path);
		}
		else if (typeof value === "object" && value !== null) result[key] = restoreRedactedValuesGuessing(value, orig[key], path, hints);
		else result[key] = value;
	}
	return result;
}

//#endregion
//#region src/config/schema.ts
function cloneSchema(value) {
	if (typeof structuredClone === "function") return structuredClone(value);
	return JSON.parse(JSON.stringify(value));
}
function asSchemaObject(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
function isObjectSchema(schema) {
	const type = schema.type;
	if (type === "object") return true;
	if (Array.isArray(type) && type.includes("object")) return true;
	return Boolean(schema.properties || schema.additionalProperties);
}
function mergeObjectSchema(base, extension) {
	const mergedRequired = new Set([...base.required ?? [], ...extension.required ?? []]);
	const merged = {
		...base,
		...extension,
		properties: {
			...base.properties,
			...extension.properties
		}
	};
	if (mergedRequired.size > 0) merged.required = Array.from(mergedRequired);
	const additional = extension.additionalProperties ?? base.additionalProperties;
	if (additional !== void 0) merged.additionalProperties = additional;
	return merged;
}
function collectExtensionHintKeys(hints, plugins, channels) {
	const pluginPrefixes = plugins.map((plugin) => plugin.id.trim()).filter(Boolean).map((id) => `plugins.entries.${id}`);
	const channelPrefixes = channels.map((channel) => channel.id.trim()).filter(Boolean).map((id) => `channels.${id}`);
	const prefixes = [...pluginPrefixes, ...channelPrefixes];
	return new Set(Object.keys(hints).filter((key) => prefixes.some((prefix) => key === prefix || key.startsWith(`${prefix}.`))));
}
function applyPluginHints(hints, plugins) {
	const next = { ...hints };
	for (const plugin of plugins) {
		const id = plugin.id.trim();
		if (!id) continue;
		const name = (plugin.name ?? id).trim() || id;
		const basePath = `plugins.entries.${id}`;
		next[basePath] = {
			...next[basePath],
			label: name,
			help: plugin.description ? `${plugin.description} (plugin: ${id})` : `Plugin entry for ${id}.`
		};
		next[`${basePath}.enabled`] = {
			...next[`${basePath}.enabled`],
			label: `Enable ${name}`
		};
		next[`${basePath}.config`] = {
			...next[`${basePath}.config`],
			label: `${name} Config`,
			help: `Plugin-defined config payload for ${id}.`
		};
		const uiHints = plugin.configUiHints ?? {};
		for (const [relPathRaw, hint] of Object.entries(uiHints)) {
			const relPath = relPathRaw.trim().replace(/^\./, "");
			if (!relPath) continue;
			const key = `${basePath}.config.${relPath}`;
			next[key] = {
				...next[key],
				...hint
			};
		}
	}
	return next;
}
function applyChannelHints(hints, channels) {
	const next = { ...hints };
	for (const channel of channels) {
		const id = channel.id.trim();
		if (!id) continue;
		const basePath = `channels.${id}`;
		const current = next[basePath] ?? {};
		const label = channel.label?.trim();
		const help = channel.description?.trim();
		next[basePath] = {
			...current,
			...label ? { label } : {},
			...help ? { help } : {}
		};
		const uiHints = channel.configUiHints ?? {};
		for (const [relPathRaw, hint] of Object.entries(uiHints)) {
			const relPath = relPathRaw.trim().replace(/^\./, "");
			if (!relPath) continue;
			const key = `${basePath}.${relPath}`;
			next[key] = {
				...next[key],
				...hint
			};
		}
	}
	return next;
}
function listHeartbeatTargetChannels(channels) {
	const seen = /* @__PURE__ */ new Set();
	const ordered = [];
	for (const id of CHANNEL_IDS) {
		const normalized = id.trim().toLowerCase();
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		ordered.push(normalized);
	}
	for (const channel of channels) {
		const normalized = channel.id.trim().toLowerCase();
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		ordered.push(normalized);
	}
	return ordered;
}
function applyHeartbeatTargetHints(hints, channels) {
	const next = { ...hints };
	const channelList = listHeartbeatTargetChannels(channels);
	const help = `Delivery target ("last", "none", or a channel id).${channelList.length ? ` Known channels: ${channelList.join(", ")}.` : ""}`;
	for (const path of ["agents.defaults.heartbeat.target", "agents.list.*.heartbeat.target"]) {
		const current = next[path] ?? {};
		next[path] = {
			...current,
			help: current.help ?? help,
			placeholder: current.placeholder ?? "last"
		};
	}
	return next;
}
function applyPluginSchemas(schema, plugins) {
	const next = cloneSchema(schema);
	const entriesNode = asSchemaObject(asSchemaObject(asSchemaObject(next)?.properties?.plugins)?.properties?.entries);
	if (!entriesNode) return next;
	const entryBase = asSchemaObject(entriesNode.additionalProperties);
	const entryProperties = entriesNode.properties ?? {};
	entriesNode.properties = entryProperties;
	for (const plugin of plugins) {
		if (!plugin.configSchema) continue;
		const entryObject = asSchemaObject(entryBase ? cloneSchema(entryBase) : { type: "object" }) ?? { type: "object" };
		const baseConfigSchema = asSchemaObject(entryObject.properties?.config);
		const pluginSchema = asSchemaObject(plugin.configSchema);
		const nextConfigSchema = baseConfigSchema && pluginSchema && isObjectSchema(baseConfigSchema) && isObjectSchema(pluginSchema) ? mergeObjectSchema(baseConfigSchema, pluginSchema) : cloneSchema(plugin.configSchema);
		entryObject.properties = {
			...entryObject.properties,
			config: nextConfigSchema
		};
		entryProperties[plugin.id] = entryObject;
	}
	return next;
}
function applyChannelSchemas(schema, channels) {
	const next = cloneSchema(schema);
	const channelsNode = asSchemaObject(asSchemaObject(next)?.properties?.channels);
	if (!channelsNode) return next;
	const channelProps = channelsNode.properties ?? {};
	channelsNode.properties = channelProps;
	for (const channel of channels) {
		if (!channel.configSchema) continue;
		const existing = asSchemaObject(channelProps[channel.id]);
		const incoming = asSchemaObject(channel.configSchema);
		if (existing && incoming && isObjectSchema(existing) && isObjectSchema(incoming)) channelProps[channel.id] = mergeObjectSchema(existing, incoming);
		else channelProps[channel.id] = cloneSchema(channel.configSchema);
	}
	return next;
}
let cachedBase = null;
function stripChannelSchema(schema) {
	const next = cloneSchema(schema);
	const root = asSchemaObject(next);
	if (!root || !root.properties) return next;
	delete root.properties.$schema;
	if (Array.isArray(root.required)) root.required = root.required.filter((key) => key !== "$schema");
	const channelsNode = asSchemaObject(root.properties.channels);
	if (channelsNode) {
		channelsNode.properties = {};
		channelsNode.required = [];
		channelsNode.additionalProperties = true;
	}
	return next;
}
function buildBaseConfigSchema() {
	if (cachedBase) return cachedBase;
	const schema = OpenClawSchema.toJSONSchema({
		target: "draft-07",
		unrepresentable: "any"
	});
	schema.title = "OpenClawConfig";
	const hints = mapSensitivePaths(OpenClawSchema, "", buildBaseHints());
	const next = {
		schema: stripChannelSchema(schema),
		uiHints: hints,
		version: VERSION,
		generatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	cachedBase = next;
	return next;
}
function buildConfigSchema(params) {
	const base = buildBaseConfigSchema();
	const plugins = params?.plugins ?? [];
	const channels = params?.channels ?? [];
	if (plugins.length === 0 && channels.length === 0) return base;
	const mergedWithoutSensitiveHints = applyHeartbeatTargetHints(applyChannelHints(applyPluginHints(base.uiHints, plugins), channels), channels);
	const mergedHints = applySensitiveHints(mergedWithoutSensitiveHints, collectExtensionHintKeys(mergedWithoutSensitiveHints, plugins, channels));
	const mergedSchema = applyChannelSchemas(applyPluginSchemas(base.schema, plugins), channels);
	return {
		...base,
		schema: mergedSchema,
		uiHints: mergedHints
	};
}

//#endregion
//#region src/gateway/server-methods/config.ts
function resolveBaseHash$1(params) {
	const raw = params?.baseHash;
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim();
	return trimmed ? trimmed : null;
}
function requireConfigBaseHash(params, snapshot, respond) {
	if (!snapshot.exists) return true;
	const snapshotHash = resolveConfigSnapshotHash(snapshot);
	if (!snapshotHash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "config base hash unavailable; re-run config.get and retry"));
		return false;
	}
	const baseHash = resolveBaseHash$1(params);
	if (!baseHash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "config base hash required; re-run config.get and retry"));
		return false;
	}
	if (baseHash !== snapshotHash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "config changed since last load; re-run config.get and retry"));
		return false;
	}
	return true;
}
function loadSchemaWithPlugins() {
	const cfg = loadConfig();
	return buildConfigSchema({
		plugins: loadOpenClawPlugins({
			config: cfg,
			cache: true,
			workspaceDir: resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)),
			logger: {
				info: () => {},
				warn: () => {},
				error: () => {},
				debug: () => {}
			}
		}).plugins.map((plugin) => ({
			id: plugin.id,
			name: plugin.name,
			description: plugin.description,
			configUiHints: plugin.configUiHints,
			configSchema: plugin.configJsonSchema
		})),
		channels: listChannelPlugins().map((entry) => ({
			id: entry.id,
			label: entry.meta.label,
			description: entry.meta.blurb,
			configSchema: entry.configSchema?.schema,
			configUiHints: entry.configSchema?.uiHints
		}))
	});
}
const configHandlers = {
	"config.get": async ({ params, respond }) => {
		if (!validateConfigGetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid config.get params: ${formatValidationErrors(validateConfigGetParams.errors)}`));
			return;
		}
		respond(true, redactConfigSnapshot(await readConfigFileSnapshot(), loadSchemaWithPlugins().uiHints), void 0);
	},
	"config.schema": ({ params, respond }) => {
		if (!validateConfigSchemaParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid config.schema params: ${formatValidationErrors(validateConfigSchemaParams.errors)}`));
			return;
		}
		respond(true, loadSchemaWithPlugins(), void 0);
	},
	"config.set": async ({ params, respond }) => {
		if (!validateConfigSetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid config.set params: ${formatValidationErrors(validateConfigSetParams.errors)}`));
			return;
		}
		const { snapshot, writeOptions } = await readConfigFileSnapshotForWrite();
		if (!requireConfigBaseHash(params, snapshot, respond)) return;
		const rawValue = params.raw;
		if (typeof rawValue !== "string") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid config.set params: raw (string) required"));
			return;
		}
		const parsedRes = parseConfigJson5(rawValue);
		if (!parsedRes.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, parsedRes.error));
			return;
		}
		const schemaSet = loadSchemaWithPlugins();
		const restored = restoreRedactedValues(parsedRes.parsed, snapshot.config, schemaSet.uiHints);
		if (!restored.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, restored.humanReadableMessage ?? "invalid config"));
			return;
		}
		const validated = validateConfigObjectWithPlugins(restored.result);
		if (!validated.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid config", { details: { issues: validated.issues } }));
			return;
		}
		await writeConfigFile(validated.config, writeOptions);
		respond(true, {
			ok: true,
			path: CONFIG_PATH,
			config: redactConfigObject(validated.config, schemaSet.uiHints)
		}, void 0);
	},
	"config.patch": async ({ params, respond }) => {
		if (!validateConfigPatchParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid config.patch params: ${formatValidationErrors(validateConfigPatchParams.errors)}`));
			return;
		}
		const { snapshot, writeOptions } = await readConfigFileSnapshotForWrite();
		if (!requireConfigBaseHash(params, snapshot, respond)) return;
		if (!snapshot.valid) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid config; fix before patching"));
			return;
		}
		const rawValue = params.raw;
		if (typeof rawValue !== "string") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid config.patch params: raw (string) required"));
			return;
		}
		const parsedRes = parseConfigJson5(rawValue);
		if (!parsedRes.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, parsedRes.error));
			return;
		}
		if (!parsedRes.parsed || typeof parsedRes.parsed !== "object" || Array.isArray(parsedRes.parsed)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "config.patch raw must be an object"));
			return;
		}
		const merged = applyMergePatch(snapshot.config, parsedRes.parsed);
		const schemaPatch = loadSchemaWithPlugins();
		const restoredMerge = restoreRedactedValues(merged, snapshot.config, schemaPatch.uiHints);
		if (!restoredMerge.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, restoredMerge.humanReadableMessage ?? "invalid config"));
			return;
		}
		const validated = validateConfigObjectWithPlugins(applyLegacyMigrations(restoredMerge.result).next ?? restoredMerge.result);
		if (!validated.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid config", { details: { issues: validated.issues } }));
			return;
		}
		await writeConfigFile(validated.config, writeOptions);
		const sessionKey = typeof params.sessionKey === "string" ? params.sessionKey?.trim() || void 0 : void 0;
		const note = typeof params.note === "string" ? params.note?.trim() || void 0 : void 0;
		const restartDelayMsRaw = params.restartDelayMs;
		const restartDelayMs = typeof restartDelayMsRaw === "number" && Number.isFinite(restartDelayMsRaw) ? Math.max(0, Math.floor(restartDelayMsRaw)) : void 0;
		const { deliveryContext, threadId } = extractDeliveryInfo(sessionKey);
		const payload = {
			kind: "config-patch",
			status: "ok",
			ts: Date.now(),
			sessionKey,
			deliveryContext,
			threadId,
			message: note ?? null,
			doctorHint: formatDoctorNonInteractiveHint(),
			stats: {
				mode: "config.patch",
				root: CONFIG_PATH
			}
		};
		let sentinelPath = null;
		try {
			sentinelPath = await writeRestartSentinel(payload);
		} catch {
			sentinelPath = null;
		}
		const restart = scheduleGatewaySigusr1Restart({
			delayMs: restartDelayMs,
			reason: "config.patch"
		});
		respond(true, {
			ok: true,
			path: CONFIG_PATH,
			config: redactConfigObject(validated.config, schemaPatch.uiHints),
			restart,
			sentinel: {
				path: sentinelPath,
				payload
			}
		}, void 0);
	},
	"config.apply": async ({ params, respond }) => {
		if (!validateConfigApplyParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid config.apply params: ${formatValidationErrors(validateConfigApplyParams.errors)}`));
			return;
		}
		const { snapshot, writeOptions } = await readConfigFileSnapshotForWrite();
		if (!requireConfigBaseHash(params, snapshot, respond)) return;
		const rawValue = params.raw;
		if (typeof rawValue !== "string") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid config.apply params: raw (string) required"));
			return;
		}
		const parsedRes = parseConfigJson5(rawValue);
		if (!parsedRes.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, parsedRes.error));
			return;
		}
		const schemaApply = loadSchemaWithPlugins();
		const restored = restoreRedactedValues(parsedRes.parsed, snapshot.config, schemaApply.uiHints);
		if (!restored.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, restored.humanReadableMessage ?? "invalid config"));
			return;
		}
		const validated = validateConfigObjectWithPlugins(restored.result);
		if (!validated.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid config", { details: { issues: validated.issues } }));
			return;
		}
		await writeConfigFile(validated.config, writeOptions);
		const sessionKey = typeof params.sessionKey === "string" ? params.sessionKey?.trim() || void 0 : void 0;
		const note = typeof params.note === "string" ? params.note?.trim() || void 0 : void 0;
		const restartDelayMsRaw = params.restartDelayMs;
		const restartDelayMs = typeof restartDelayMsRaw === "number" && Number.isFinite(restartDelayMsRaw) ? Math.max(0, Math.floor(restartDelayMsRaw)) : void 0;
		const { deliveryContext: deliveryContextApply, threadId: threadIdApply } = extractDeliveryInfo(sessionKey);
		const payload = {
			kind: "config-apply",
			status: "ok",
			ts: Date.now(),
			sessionKey,
			deliveryContext: deliveryContextApply,
			threadId: threadIdApply,
			message: note ?? null,
			doctorHint: formatDoctorNonInteractiveHint(),
			stats: {
				mode: "config.apply",
				root: CONFIG_PATH
			}
		};
		let sentinelPath = null;
		try {
			sentinelPath = await writeRestartSentinel(payload);
		} catch {
			sentinelPath = null;
		}
		const restart = scheduleGatewaySigusr1Restart({
			delayMs: restartDelayMs,
			reason: "config.apply"
		});
		respond(true, {
			ok: true,
			path: CONFIG_PATH,
			config: redactConfigObject(validated.config, schemaApply.uiHints),
			restart,
			sentinel: {
				path: sentinelPath,
				payload
			}
		}, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/connect.ts
const connectHandlers = { connect: ({ respond }) => {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "connect is only valid as the first request"));
} };

//#endregion
//#region src/cron/validate-timestamp.ts
const ONE_MINUTE_MS = 60 * 1e3;
const TEN_YEARS_MS = 10 * 365.25 * 24 * 60 * 60 * 1e3;
/**
* Validates at timestamps in cron schedules.
* Rejects timestamps that are:
* - More than 1 minute in the past
* - More than 10 years in the future
*/
function validateScheduleTimestamp(schedule, nowMs = Date.now()) {
	if (schedule.kind !== "at") return { ok: true };
	const atRaw = typeof schedule.at === "string" ? schedule.at.trim() : "";
	const atMs = atRaw ? parseAbsoluteTimeMs(atRaw) : null;
	if (atMs === null || !Number.isFinite(atMs)) return {
		ok: false,
		message: `Invalid schedule.at: expected ISO-8601 timestamp (got ${String(schedule.at)})`
	};
	const diffMs = atMs - nowMs;
	if (diffMs < -ONE_MINUTE_MS) {
		const nowDate = new Date(nowMs).toISOString();
		return {
			ok: false,
			message: `schedule.at is in the past: ${new Date(atMs).toISOString()} (${Math.floor(-diffMs / ONE_MINUTE_MS)} minutes ago). Current time: ${nowDate}`
		};
	}
	if (diffMs > TEN_YEARS_MS) return {
		ok: false,
		message: `schedule.at is too far in the future: ${new Date(atMs).toISOString()} (${Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1e3))} years ahead). Maximum allowed: 10 years`
	};
	return { ok: true };
}

//#endregion
//#region src/gateway/server-methods/cron.ts
const cronHandlers = {
	wake: ({ params, respond, context }) => {
		if (!validateWakeParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid wake params: ${formatValidationErrors(validateWakeParams.errors)}`));
			return;
		}
		const p = params;
		respond(true, context.cron.wake({
			mode: p.mode,
			text: p.text
		}), void 0);
	},
	"cron.list": async ({ params, respond, context }) => {
		if (!validateCronListParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.list params: ${formatValidationErrors(validateCronListParams.errors)}`));
			return;
		}
		const p = params;
		respond(true, { jobs: await context.cron.list({ includeDisabled: p.includeDisabled }) }, void 0);
	},
	"cron.status": async ({ params, respond, context }) => {
		if (!validateCronStatusParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.status params: ${formatValidationErrors(validateCronStatusParams.errors)}`));
			return;
		}
		respond(true, await context.cron.status(), void 0);
	},
	"cron.add": async ({ params, respond, context }) => {
		const normalized = normalizeCronJobCreate(params) ?? params;
		if (!validateCronAddParams(normalized)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.add params: ${formatValidationErrors(validateCronAddParams.errors)}`));
			return;
		}
		const jobCreate = normalized;
		const timestampValidation = validateScheduleTimestamp(jobCreate.schedule);
		if (!timestampValidation.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, timestampValidation.message));
			return;
		}
		respond(true, await context.cron.add(jobCreate), void 0);
	},
	"cron.update": async ({ params, respond, context }) => {
		const normalizedPatch = normalizeCronJobPatch(params?.patch);
		const candidate = normalizedPatch && typeof params === "object" && params !== null ? {
			...params,
			patch: normalizedPatch
		} : params;
		if (!validateCronUpdateParams(candidate)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.update params: ${formatValidationErrors(validateCronUpdateParams.errors)}`));
			return;
		}
		const p = candidate;
		const jobId = p.id ?? p.jobId;
		if (!jobId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid cron.update params: missing id"));
			return;
		}
		const patch = p.patch;
		if (patch.schedule) {
			const timestampValidation = validateScheduleTimestamp(patch.schedule);
			if (!timestampValidation.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, timestampValidation.message));
				return;
			}
		}
		respond(true, await context.cron.update(jobId, patch), void 0);
	},
	"cron.remove": async ({ params, respond, context }) => {
		if (!validateCronRemoveParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.remove params: ${formatValidationErrors(validateCronRemoveParams.errors)}`));
			return;
		}
		const p = params;
		const jobId = p.id ?? p.jobId;
		if (!jobId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid cron.remove params: missing id"));
			return;
		}
		respond(true, await context.cron.remove(jobId), void 0);
	},
	"cron.run": async ({ params, respond, context }) => {
		if (!validateCronRunParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.run params: ${formatValidationErrors(validateCronRunParams.errors)}`));
			return;
		}
		const p = params;
		const jobId = p.id ?? p.jobId;
		if (!jobId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid cron.run params: missing id"));
			return;
		}
		respond(true, await context.cron.run(jobId, p.mode ?? "force"), void 0);
	},
	"cron.runs": async ({ params, respond, context }) => {
		if (!validateCronRunsParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.runs params: ${formatValidationErrors(validateCronRunsParams.errors)}`));
			return;
		}
		const p = params;
		const jobId = p.id ?? p.jobId;
		if (!jobId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid cron.runs params: missing id"));
			return;
		}
		respond(true, { entries: await readCronRunLogEntries(resolveCronRunLogPath({
			storePath: context.cronStorePath,
			jobId
		}), {
			limit: p.limit,
			jobId
		}) }, void 0);
	}
};

//#endregion
//#region src/infra/device-pairing.ts
const PENDING_TTL_MS = 300 * 1e3;
function resolvePaths(baseDir) {
	const root = baseDir ?? resolveStateDir();
	const dir = path.join(root, "devices");
	return {
		dir,
		pendingPath: path.join(dir, "pending.json"),
		pairedPath: path.join(dir, "paired.json")
	};
}
async function readJSON(filePath) {
	try {
		const raw = await fsPromises.readFile(filePath, "utf8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
async function writeJSONAtomic(filePath, value) {
	const dir = path.dirname(filePath);
	await fsPromises.mkdir(dir, { recursive: true });
	const tmp = `${filePath}.${randomUUID()}.tmp`;
	await fsPromises.writeFile(tmp, JSON.stringify(value, null, 2), "utf8");
	try {
		await fsPromises.chmod(tmp, 384);
	} catch {}
	await fsPromises.rename(tmp, filePath);
	try {
		await fsPromises.chmod(filePath, 384);
	} catch {}
}
function pruneExpiredPending(pendingById, nowMs) {
	for (const [id, req] of Object.entries(pendingById)) if (nowMs - req.ts > PENDING_TTL_MS) delete pendingById[id];
}
let lock = Promise.resolve();
async function withLock(fn) {
	const prev = lock;
	let release;
	lock = new Promise((resolve) => {
		release = resolve;
	});
	await prev;
	try {
		return await fn();
	} finally {
		release?.();
	}
}
async function loadState(baseDir) {
	const { pendingPath, pairedPath } = resolvePaths(baseDir);
	const [pending, paired] = await Promise.all([readJSON(pendingPath), readJSON(pairedPath)]);
	const state = {
		pendingById: pending ?? {},
		pairedByDeviceId: paired ?? {}
	};
	pruneExpiredPending(state.pendingById, Date.now());
	return state;
}
async function persistState(state, baseDir) {
	const { pendingPath, pairedPath } = resolvePaths(baseDir);
	await Promise.all([writeJSONAtomic(pendingPath, state.pendingById), writeJSONAtomic(pairedPath, state.pairedByDeviceId)]);
}
function normalizeDeviceId(deviceId) {
	return deviceId.trim();
}
function normalizeRole(role) {
	const trimmed = role?.trim();
	return trimmed ? trimmed : null;
}
function mergeRoles(...items) {
	const roles = /* @__PURE__ */ new Set();
	for (const item of items) {
		if (!item) continue;
		if (Array.isArray(item)) for (const role of item) {
			const trimmed = role.trim();
			if (trimmed) roles.add(trimmed);
		}
		else {
			const trimmed = item.trim();
			if (trimmed) roles.add(trimmed);
		}
	}
	if (roles.size === 0) return;
	return [...roles];
}
function mergeScopes(...items) {
	const scopes = /* @__PURE__ */ new Set();
	for (const item of items) {
		if (!item) continue;
		for (const scope of item) {
			const trimmed = scope.trim();
			if (trimmed) scopes.add(trimmed);
		}
	}
	if (scopes.size === 0) return;
	return [...scopes];
}
function normalizeScopes(scopes) {
	if (!Array.isArray(scopes)) return [];
	const out = /* @__PURE__ */ new Set();
	for (const scope of scopes) {
		const trimmed = scope.trim();
		if (trimmed) out.add(trimmed);
	}
	return [...out].toSorted();
}
function scopesAllow(requested, allowed) {
	if (requested.length === 0) return true;
	if (allowed.length === 0) return false;
	const allowedSet = new Set(allowed);
	return requested.every((scope) => allowedSet.has(scope));
}
function newToken() {
	return randomUUID().replaceAll("-", "");
}
async function listDevicePairing(baseDir) {
	const state = await loadState(baseDir);
	return {
		pending: Object.values(state.pendingById).toSorted((a, b) => b.ts - a.ts),
		paired: Object.values(state.pairedByDeviceId).toSorted((a, b) => b.approvedAtMs - a.approvedAtMs)
	};
}
async function getPairedDevice(deviceId, baseDir) {
	return (await loadState(baseDir)).pairedByDeviceId[normalizeDeviceId(deviceId)] ?? null;
}
async function requestDevicePairing(req, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const deviceId = normalizeDeviceId(req.deviceId);
		if (!deviceId) throw new Error("deviceId required");
		const existing = Object.values(state.pendingById).find((p) => p.deviceId === deviceId);
		if (existing) return {
			status: "pending",
			request: existing,
			created: false
		};
		const isRepair = Boolean(state.pairedByDeviceId[deviceId]);
		const request = {
			requestId: randomUUID(),
			deviceId,
			publicKey: req.publicKey,
			displayName: req.displayName,
			platform: req.platform,
			clientId: req.clientId,
			clientMode: req.clientMode,
			role: req.role,
			roles: req.role ? [req.role] : void 0,
			scopes: req.scopes,
			remoteIp: req.remoteIp,
			silent: req.silent,
			isRepair,
			ts: Date.now()
		};
		state.pendingById[request.requestId] = request;
		await persistState(state, baseDir);
		return {
			status: "pending",
			request,
			created: true
		};
	});
}
async function approveDevicePairing(requestId, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const pending = state.pendingById[requestId];
		if (!pending) return null;
		const now = Date.now();
		const existing = state.pairedByDeviceId[pending.deviceId];
		const roles = mergeRoles(existing?.roles, existing?.role, pending.roles, pending.role);
		const scopes = mergeScopes(existing?.scopes, pending.scopes);
		const tokens = existing?.tokens ? { ...existing.tokens } : {};
		const roleForToken = normalizeRole(pending.role);
		if (roleForToken) {
			const nextScopes = normalizeScopes(pending.scopes);
			const existingToken = tokens[roleForToken];
			const now = Date.now();
			tokens[roleForToken] = {
				token: newToken(),
				role: roleForToken,
				scopes: nextScopes,
				createdAtMs: existingToken?.createdAtMs ?? now,
				rotatedAtMs: existingToken ? now : void 0,
				revokedAtMs: void 0,
				lastUsedAtMs: existingToken?.lastUsedAtMs
			};
		}
		const device = {
			deviceId: pending.deviceId,
			publicKey: pending.publicKey,
			displayName: pending.displayName,
			platform: pending.platform,
			clientId: pending.clientId,
			clientMode: pending.clientMode,
			role: pending.role,
			roles,
			scopes,
			remoteIp: pending.remoteIp,
			tokens,
			createdAtMs: existing?.createdAtMs ?? now,
			approvedAtMs: now
		};
		delete state.pendingById[requestId];
		state.pairedByDeviceId[device.deviceId] = device;
		await persistState(state, baseDir);
		return {
			requestId,
			device
		};
	});
}
async function rejectDevicePairing(requestId, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const pending = state.pendingById[requestId];
		if (!pending) return null;
		delete state.pendingById[requestId];
		await persistState(state, baseDir);
		return {
			requestId,
			deviceId: pending.deviceId
		};
	});
}
async function updatePairedDeviceMetadata(deviceId, patch, baseDir) {
	return await withLock(async () => {
		const state = await loadState(baseDir);
		const existing = state.pairedByDeviceId[normalizeDeviceId(deviceId)];
		if (!existing) return;
		const roles = mergeRoles(existing.roles, existing.role, patch.role);
		const scopes = mergeScopes(existing.scopes, patch.scopes);
		state.pairedByDeviceId[deviceId] = {
			...existing,
			...patch,
			deviceId: existing.deviceId,
			createdAtMs: existing.createdAtMs,
			approvedAtMs: existing.approvedAtMs,
			role: patch.role ?? existing.role,
			roles,
			scopes
		};
		await persistState(state, baseDir);
	});
}
function summarizeDeviceTokens(tokens) {
	if (!tokens) return;
	const summaries = Object.values(tokens).map((token) => ({
		role: token.role,
		scopes: token.scopes,
		createdAtMs: token.createdAtMs,
		rotatedAtMs: token.rotatedAtMs,
		revokedAtMs: token.revokedAtMs,
		lastUsedAtMs: token.lastUsedAtMs
	})).toSorted((a, b) => a.role.localeCompare(b.role));
	return summaries.length > 0 ? summaries : void 0;
}
async function verifyDeviceToken(params) {
	return await withLock(async () => {
		const state = await loadState(params.baseDir);
		const device = state.pairedByDeviceId[normalizeDeviceId(params.deviceId)];
		if (!device) return {
			ok: false,
			reason: "device-not-paired"
		};
		const role = normalizeRole(params.role);
		if (!role) return {
			ok: false,
			reason: "role-missing"
		};
		const entry = device.tokens?.[role];
		if (!entry) return {
			ok: false,
			reason: "token-missing"
		};
		if (entry.revokedAtMs) return {
			ok: false,
			reason: "token-revoked"
		};
		if (!safeEqualSecret(params.token, entry.token)) return {
			ok: false,
			reason: "token-mismatch"
		};
		if (!scopesAllow(normalizeScopes(params.scopes), entry.scopes)) return {
			ok: false,
			reason: "scope-mismatch"
		};
		entry.lastUsedAtMs = Date.now();
		device.tokens ??= {};
		device.tokens[role] = entry;
		state.pairedByDeviceId[device.deviceId] = device;
		await persistState(state, params.baseDir);
		return { ok: true };
	});
}
async function ensureDeviceToken(params) {
	return await withLock(async () => {
		const state = await loadState(params.baseDir);
		const device = state.pairedByDeviceId[normalizeDeviceId(params.deviceId)];
		if (!device) return null;
		const role = normalizeRole(params.role);
		if (!role) return null;
		const requestedScopes = normalizeScopes(params.scopes);
		const tokens = device.tokens ? { ...device.tokens } : {};
		const existing = tokens[role];
		if (existing && !existing.revokedAtMs) {
			if (scopesAllow(requestedScopes, existing.scopes)) return existing;
		}
		const now = Date.now();
		const next = {
			token: newToken(),
			role,
			scopes: requestedScopes,
			createdAtMs: existing?.createdAtMs ?? now,
			rotatedAtMs: existing ? now : void 0,
			revokedAtMs: void 0,
			lastUsedAtMs: existing?.lastUsedAtMs
		};
		tokens[role] = next;
		device.tokens = tokens;
		state.pairedByDeviceId[device.deviceId] = device;
		await persistState(state, params.baseDir);
		return next;
	});
}
async function rotateDeviceToken(params) {
	return await withLock(async () => {
		const state = await loadState(params.baseDir);
		const device = state.pairedByDeviceId[normalizeDeviceId(params.deviceId)];
		if (!device) return null;
		const role = normalizeRole(params.role);
		if (!role) return null;
		const tokens = device.tokens ? { ...device.tokens } : {};
		const existing = tokens[role];
		const requestedScopes = normalizeScopes(params.scopes ?? existing?.scopes ?? device.scopes);
		const now = Date.now();
		const next = {
			token: newToken(),
			role,
			scopes: requestedScopes,
			createdAtMs: existing?.createdAtMs ?? now,
			rotatedAtMs: now,
			revokedAtMs: void 0,
			lastUsedAtMs: existing?.lastUsedAtMs
		};
		tokens[role] = next;
		device.tokens = tokens;
		if (params.scopes !== void 0) device.scopes = requestedScopes;
		state.pairedByDeviceId[device.deviceId] = device;
		await persistState(state, params.baseDir);
		return next;
	});
}
async function revokeDeviceToken(params) {
	return await withLock(async () => {
		const state = await loadState(params.baseDir);
		const device = state.pairedByDeviceId[normalizeDeviceId(params.deviceId)];
		if (!device) return null;
		const role = normalizeRole(params.role);
		if (!role) return null;
		if (!device.tokens?.[role]) return null;
		const tokens = { ...device.tokens };
		const entry = {
			...tokens[role],
			revokedAtMs: Date.now()
		};
		tokens[role] = entry;
		device.tokens = tokens;
		state.pairedByDeviceId[device.deviceId] = device;
		await persistState(state, params.baseDir);
		return entry;
	});
}

//#endregion
//#region src/gateway/server-methods/devices.ts
function redactPairedDevice(device) {
	const { tokens, ...rest } = device;
	return {
		...rest,
		tokens: summarizeDeviceTokens(tokens)
	};
}
const deviceHandlers = {
	"device.pair.list": async ({ params, respond }) => {
		if (!validateDevicePairListParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.list params: ${formatValidationErrors(validateDevicePairListParams.errors)}`));
			return;
		}
		const list = await listDevicePairing();
		respond(true, {
			pending: list.pending,
			paired: list.paired.map((device) => redactPairedDevice(device))
		}, void 0);
	},
	"device.pair.approve": async ({ params, respond, context }) => {
		if (!validateDevicePairApproveParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.approve params: ${formatValidationErrors(validateDevicePairApproveParams.errors)}`));
			return;
		}
		const { requestId } = params;
		const approved = await approveDevicePairing(requestId);
		if (!approved) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown requestId"));
			return;
		}
		context.logGateway.info(`device pairing approved device=${approved.device.deviceId} role=${approved.device.role ?? "unknown"}`);
		context.broadcast("device.pair.resolved", {
			requestId,
			deviceId: approved.device.deviceId,
			decision: "approved",
			ts: Date.now()
		}, { dropIfSlow: true });
		respond(true, {
			requestId,
			device: redactPairedDevice(approved.device)
		}, void 0);
	},
	"device.pair.reject": async ({ params, respond, context }) => {
		if (!validateDevicePairRejectParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.reject params: ${formatValidationErrors(validateDevicePairRejectParams.errors)}`));
			return;
		}
		const { requestId } = params;
		const rejected = await rejectDevicePairing(requestId);
		if (!rejected) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown requestId"));
			return;
		}
		context.broadcast("device.pair.resolved", {
			requestId,
			deviceId: rejected.deviceId,
			decision: "rejected",
			ts: Date.now()
		}, { dropIfSlow: true });
		respond(true, rejected, void 0);
	},
	"device.token.rotate": async ({ params, respond, context }) => {
		if (!validateDeviceTokenRotateParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.token.rotate params: ${formatValidationErrors(validateDeviceTokenRotateParams.errors)}`));
			return;
		}
		const { deviceId, role, scopes } = params;
		const entry = await rotateDeviceToken({
			deviceId,
			role,
			scopes
		});
		if (!entry) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown deviceId/role"));
			return;
		}
		context.logGateway.info(`device token rotated device=${deviceId} role=${entry.role} scopes=${entry.scopes.join(",")}`);
		respond(true, {
			deviceId,
			role: entry.role,
			token: entry.token,
			scopes: entry.scopes,
			rotatedAtMs: entry.rotatedAtMs ?? entry.createdAtMs
		}, void 0);
	},
	"device.token.revoke": async ({ params, respond, context }) => {
		if (!validateDeviceTokenRevokeParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.token.revoke params: ${formatValidationErrors(validateDeviceTokenRevokeParams.errors)}`));
			return;
		}
		const { deviceId, role } = params;
		const entry = await revokeDeviceToken({
			deviceId,
			role
		});
		if (!entry) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown deviceId/role"));
			return;
		}
		context.logGateway.info(`device token revoked device=${deviceId} role=${entry.role}`);
		respond(true, {
			deviceId,
			role: entry.role,
			revokedAtMs: entry.revokedAtMs ?? Date.now()
		}, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/exec-approvals.ts
function resolveBaseHash(params) {
	const raw = params?.baseHash;
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim();
	return trimmed ? trimmed : null;
}
function requireApprovalsBaseHash(params, snapshot, respond) {
	if (!snapshot.exists) return true;
	if (!snapshot.hash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "exec approvals base hash unavailable; re-run exec.approvals.get and retry"));
		return false;
	}
	const baseHash = resolveBaseHash(params);
	if (!baseHash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "exec approvals base hash required; re-run exec.approvals.get and retry"));
		return false;
	}
	if (baseHash !== snapshot.hash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "exec approvals changed since last load; re-run exec.approvals.get and retry"));
		return false;
	}
	return true;
}
function redactExecApprovals(file) {
	const socketPath = file.socket?.path?.trim();
	return {
		...file,
		socket: socketPath ? { path: socketPath } : void 0
	};
}
const execApprovalsHandlers = {
	"exec.approvals.get": ({ params, respond }) => {
		if (!validateExecApprovalsGetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approvals.get params: ${formatValidationErrors(validateExecApprovalsGetParams.errors)}`));
			return;
		}
		ensureExecApprovals();
		const snapshot = readExecApprovalsSnapshot();
		respond(true, {
			path: snapshot.path,
			exists: snapshot.exists,
			hash: snapshot.hash,
			file: redactExecApprovals(snapshot.file)
		}, void 0);
	},
	"exec.approvals.set": ({ params, respond }) => {
		if (!validateExecApprovalsSetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approvals.set params: ${formatValidationErrors(validateExecApprovalsSetParams.errors)}`));
			return;
		}
		ensureExecApprovals();
		const snapshot = readExecApprovalsSnapshot();
		if (!requireApprovalsBaseHash(params, snapshot, respond)) return;
		const incoming = params.file;
		if (!incoming || typeof incoming !== "object") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "exec approvals file is required"));
			return;
		}
		const normalized = normalizeExecApprovals(incoming);
		const currentSocketPath = snapshot.file.socket?.path?.trim();
		const currentToken = snapshot.file.socket?.token?.trim();
		const socketPath = normalized.socket?.path?.trim() ?? currentSocketPath ?? resolveExecApprovalsSocketPath();
		const token = normalized.socket?.token?.trim() ?? currentToken ?? "";
		saveExecApprovals({
			...normalized,
			socket: {
				path: socketPath,
				token
			}
		});
		const nextSnapshot = readExecApprovalsSnapshot();
		respond(true, {
			path: nextSnapshot.path,
			exists: nextSnapshot.exists,
			hash: nextSnapshot.hash,
			file: redactExecApprovals(nextSnapshot.file)
		}, void 0);
	},
	"exec.approvals.node.get": async ({ params, respond, context }) => {
		if (!validateExecApprovalsNodeGetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approvals.node.get params: ${formatValidationErrors(validateExecApprovalsNodeGetParams.errors)}`));
			return;
		}
		const { nodeId } = params;
		const id = nodeId.trim();
		if (!id) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			const res = await context.nodeRegistry.invoke({
				nodeId: id,
				command: "system.execApprovals.get",
				params: {}
			});
			if (!res.ok) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, res.error?.message ?? "node invoke failed", { details: { nodeError: res.error ?? null } }));
				return;
			}
			respond(true, res.payloadJSON ? safeParseJson(res.payloadJSON) : res.payload, void 0);
		});
	},
	"exec.approvals.node.set": async ({ params, respond, context }) => {
		if (!validateExecApprovalsNodeSetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approvals.node.set params: ${formatValidationErrors(validateExecApprovalsNodeSetParams.errors)}`));
			return;
		}
		const { nodeId, file, baseHash } = params;
		const id = nodeId.trim();
		if (!id) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			const res = await context.nodeRegistry.invoke({
				nodeId: id,
				command: "system.execApprovals.set",
				params: {
					file,
					baseHash
				}
			});
			if (!res.ok) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, res.error?.message ?? "node invoke failed", { details: { nodeError: res.error ?? null } }));
				return;
			}
			respond(true, safeParseJson(res.payloadJSON ?? null), void 0);
		});
	}
};

//#endregion
//#region src/gateway/server-methods/health.ts
const healthHandlers = {
	health: async ({ respond, context, params }) => {
		const { getHealthCache, refreshHealthSnapshot, logHealth } = context;
		const wantsProbe = params?.probe === true;
		const now = Date.now();
		const cached = getHealthCache();
		if (!wantsProbe && cached && now - cached.ts < HEALTH_REFRESH_INTERVAL_MS) {
			respond(true, cached, void 0, { cached: true });
			refreshHealthSnapshot({ probe: false }).catch((err) => logHealth.error(`background health refresh failed: ${formatError(err)}`));
			return;
		}
		try {
			respond(true, await refreshHealthSnapshot({ probe: wantsProbe }), void 0);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	status: async ({ respond }) => {
		respond(true, await getStatusSummary(), void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/logs.ts
const DEFAULT_LIMIT = 500;
const DEFAULT_MAX_BYTES = 25e4;
const MAX_LIMIT = 5e3;
const MAX_BYTES = 1e6;
const ROLLING_LOG_RE = /^openclaw-\d{4}-\d{2}-\d{2}\.log$/;
function isRollingLogFile(file) {
	return ROLLING_LOG_RE.test(path.basename(file));
}
async function resolveLogFile(file) {
	if (await fsPromises.stat(file).catch(() => null)) return file;
	if (!isRollingLogFile(file)) return file;
	const dir = path.dirname(file);
	const entries = await fsPromises.readdir(dir, { withFileTypes: true }).catch(() => null);
	if (!entries) return file;
	return (await Promise.all(entries.filter((entry) => entry.isFile() && ROLLING_LOG_RE.test(entry.name)).map(async (entry) => {
		const fullPath = path.join(dir, entry.name);
		const fileStat = await fsPromises.stat(fullPath).catch(() => null);
		return fileStat ? {
			path: fullPath,
			mtimeMs: fileStat.mtimeMs
		} : null;
	}))).filter((entry) => Boolean(entry)).toSorted((a, b) => b.mtimeMs - a.mtimeMs)[0]?.path ?? file;
}
async function readLogSlice(params) {
	const stat = await fsPromises.stat(params.file).catch(() => null);
	if (!stat) return {
		cursor: 0,
		size: 0,
		lines: [],
		truncated: false,
		reset: false
	};
	const size = stat.size;
	const maxBytes = clamp(params.maxBytes, 1, MAX_BYTES);
	const limit = clamp(params.limit, 1, MAX_LIMIT);
	let cursor = typeof params.cursor === "number" && Number.isFinite(params.cursor) ? Math.max(0, Math.floor(params.cursor)) : void 0;
	let reset = false;
	let truncated = false;
	let start = 0;
	if (cursor != null) if (cursor > size) {
		reset = true;
		start = Math.max(0, size - maxBytes);
		truncated = start > 0;
	} else {
		start = cursor;
		if (size - start > maxBytes) {
			reset = true;
			truncated = true;
			start = Math.max(0, size - maxBytes);
		}
	}
	else {
		start = Math.max(0, size - maxBytes);
		truncated = start > 0;
	}
	if (size === 0 || size <= start) return {
		cursor: size,
		size,
		lines: [],
		truncated,
		reset
	};
	const handle = await fsPromises.open(params.file, "r");
	try {
		let prefix = "";
		if (start > 0) {
			const prefixBuf = Buffer.alloc(1);
			const prefixRead = await handle.read(prefixBuf, 0, 1, start - 1);
			prefix = prefixBuf.toString("utf8", 0, prefixRead.bytesRead);
		}
		const length = Math.max(0, size - start);
		const buffer = Buffer.alloc(length);
		const readResult = await handle.read(buffer, 0, length, start);
		let lines = buffer.toString("utf8", 0, readResult.bytesRead).split("\n");
		if (start > 0 && prefix !== "\n") lines = lines.slice(1);
		if (lines.length > 0 && lines[lines.length - 1] === "") lines = lines.slice(0, -1);
		if (lines.length > limit) lines = lines.slice(lines.length - limit);
		cursor = size;
		return {
			cursor,
			size,
			lines,
			truncated,
			reset
		};
	} finally {
		await handle.close();
	}
}
const logsHandlers = { "logs.tail": async ({ params, respond }) => {
	if (!validateLogsTailParams(params)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid logs.tail params: ${formatValidationErrors(validateLogsTailParams.errors)}`));
		return;
	}
	const p = params;
	const configuredFile = getResolvedLoggerSettings().file;
	try {
		const file = await resolveLogFile(configuredFile);
		respond(true, {
			file,
			...await readLogSlice({
				file,
				cursor: p.cursor,
				limit: p.limit ?? DEFAULT_LIMIT,
				maxBytes: p.maxBytes ?? DEFAULT_MAX_BYTES
			})
		}, void 0);
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `log read failed: ${String(err)}`));
	}
} };

//#endregion
//#region src/gateway/server-methods/models.ts
const modelsHandlers = { "models.list": async ({ params, respond, context }) => {
	if (!validateModelsListParams(params)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid models.list params: ${formatValidationErrors(validateModelsListParams.errors)}`));
		return;
	}
	try {
		respond(true, { models: await context.loadGatewayModelCatalog() }, void 0);
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
	}
} };

//#endregion
//#region src/gateway/server-methods/nodes.ts
function isNodeEntry(entry) {
	if (entry.role === "node") return true;
	if (Array.isArray(entry.roles) && entry.roles.includes("node")) return true;
	return false;
}
function normalizeNodeInvokeResultParams(params) {
	if (!params || typeof params !== "object") return params;
	const normalized = { ...params };
	if (normalized.payloadJSON === null) delete normalized.payloadJSON;
	else if (normalized.payloadJSON !== void 0 && typeof normalized.payloadJSON !== "string") {
		if (normalized.payload === void 0) normalized.payload = normalized.payloadJSON;
		delete normalized.payloadJSON;
	}
	if (normalized.error === null) delete normalized.error;
	return normalized;
}
const nodeHandlers = {
	"node.pair.request": async ({ params, respond, context }) => {
		if (!validateNodePairRequestParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pair.request",
				validator: validateNodePairRequestParams
			});
			return;
		}
		const p = params;
		await respondUnavailableOnThrow(respond, async () => {
			const result = await requestNodePairing({
				nodeId: p.nodeId,
				displayName: p.displayName,
				platform: p.platform,
				version: p.version,
				coreVersion: p.coreVersion,
				uiVersion: p.uiVersion,
				deviceFamily: p.deviceFamily,
				modelIdentifier: p.modelIdentifier,
				caps: p.caps,
				commands: p.commands,
				remoteIp: p.remoteIp,
				silent: p.silent
			});
			if (result.status === "pending" && result.created) context.broadcast("node.pair.requested", result.request, { dropIfSlow: true });
			respond(true, result, void 0);
		});
	},
	"node.pair.list": async ({ params, respond }) => {
		if (!validateNodePairListParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pair.list",
				validator: validateNodePairListParams
			});
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			respond(true, await listNodePairing(), void 0);
		});
	},
	"node.pair.approve": async ({ params, respond, context }) => {
		if (!validateNodePairApproveParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pair.approve",
				validator: validateNodePairApproveParams
			});
			return;
		}
		const { requestId } = params;
		await respondUnavailableOnThrow(respond, async () => {
			const approved = await approveNodePairing(requestId);
			if (!approved) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown requestId"));
				return;
			}
			context.broadcast("node.pair.resolved", {
				requestId,
				nodeId: approved.node.nodeId,
				decision: "approved",
				ts: Date.now()
			}, { dropIfSlow: true });
			respond(true, approved, void 0);
		});
	},
	"node.pair.reject": async ({ params, respond, context }) => {
		if (!validateNodePairRejectParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pair.reject",
				validator: validateNodePairRejectParams
			});
			return;
		}
		const { requestId } = params;
		await respondUnavailableOnThrow(respond, async () => {
			const rejected = await rejectNodePairing(requestId);
			if (!rejected) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown requestId"));
				return;
			}
			context.broadcast("node.pair.resolved", {
				requestId,
				nodeId: rejected.nodeId,
				decision: "rejected",
				ts: Date.now()
			}, { dropIfSlow: true });
			respond(true, rejected, void 0);
		});
	},
	"node.pair.verify": async ({ params, respond }) => {
		if (!validateNodePairVerifyParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pair.verify",
				validator: validateNodePairVerifyParams
			});
			return;
		}
		const { nodeId, token } = params;
		await respondUnavailableOnThrow(respond, async () => {
			respond(true, await verifyNodeToken(nodeId, token), void 0);
		});
	},
	"node.rename": async ({ params, respond }) => {
		if (!validateNodeRenameParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.rename",
				validator: validateNodeRenameParams
			});
			return;
		}
		const { nodeId, displayName } = params;
		await respondUnavailableOnThrow(respond, async () => {
			const trimmed = displayName.trim();
			if (!trimmed) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "displayName required"));
				return;
			}
			const updated = await renamePairedNode(nodeId, trimmed);
			if (!updated) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown nodeId"));
				return;
			}
			respond(true, {
				nodeId: updated.nodeId,
				displayName: updated.displayName
			}, void 0);
		});
	},
	"node.list": async ({ params, respond, context }) => {
		if (!validateNodeListParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.list",
				validator: validateNodeListParams
			});
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			const list = await listDevicePairing();
			const pairedById = new Map(list.paired.filter((entry) => isNodeEntry(entry)).map((entry) => [entry.deviceId, {
				nodeId: entry.deviceId,
				displayName: entry.displayName,
				platform: entry.platform,
				version: void 0,
				coreVersion: void 0,
				uiVersion: void 0,
				deviceFamily: void 0,
				modelIdentifier: void 0,
				remoteIp: entry.remoteIp,
				caps: [],
				commands: [],
				permissions: void 0
			}]));
			const connected = context.nodeRegistry.listConnected();
			const connectedById = new Map(connected.map((n) => [n.nodeId, n]));
			const nodes = [...new Set([...pairedById.keys(), ...connectedById.keys()])].map((nodeId) => {
				const paired = pairedById.get(nodeId);
				const live = connectedById.get(nodeId);
				const caps = uniqueSortedStrings([...live?.caps ?? paired?.caps ?? []]);
				const commands = uniqueSortedStrings([...live?.commands ?? paired?.commands ?? []]);
				return {
					nodeId,
					displayName: live?.displayName ?? paired?.displayName,
					platform: live?.platform ?? paired?.platform,
					version: live?.version ?? paired?.version,
					coreVersion: live?.coreVersion ?? paired?.coreVersion,
					uiVersion: live?.uiVersion ?? paired?.uiVersion,
					deviceFamily: live?.deviceFamily ?? paired?.deviceFamily,
					modelIdentifier: live?.modelIdentifier ?? paired?.modelIdentifier,
					remoteIp: live?.remoteIp ?? paired?.remoteIp,
					caps,
					commands,
					pathEnv: live?.pathEnv,
					permissions: live?.permissions ?? paired?.permissions,
					connectedAtMs: live?.connectedAtMs,
					paired: Boolean(paired),
					connected: Boolean(live)
				};
			});
			nodes.sort((a, b) => {
				if (a.connected !== b.connected) return a.connected ? -1 : 1;
				const an = (a.displayName ?? a.nodeId).toLowerCase();
				const bn = (b.displayName ?? b.nodeId).toLowerCase();
				if (an < bn) return -1;
				if (an > bn) return 1;
				return a.nodeId.localeCompare(b.nodeId);
			});
			respond(true, {
				ts: Date.now(),
				nodes
			}, void 0);
		});
	},
	"node.describe": async ({ params, respond, context }) => {
		if (!validateNodeDescribeParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.describe",
				validator: validateNodeDescribeParams
			});
			return;
		}
		const { nodeId } = params;
		const id = String(nodeId ?? "").trim();
		if (!id) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			const paired = (await listDevicePairing()).paired.find((n) => n.deviceId === id && isNodeEntry(n));
			const live = context.nodeRegistry.listConnected().find((n) => n.nodeId === id);
			if (!paired && !live) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown nodeId"));
				return;
			}
			const caps = uniqueSortedStrings([...live?.caps ?? []]);
			const commands = uniqueSortedStrings([...live?.commands ?? []]);
			respond(true, {
				ts: Date.now(),
				nodeId: id,
				displayName: live?.displayName ?? paired?.displayName,
				platform: live?.platform ?? paired?.platform,
				version: live?.version,
				coreVersion: live?.coreVersion,
				uiVersion: live?.uiVersion,
				deviceFamily: live?.deviceFamily,
				modelIdentifier: live?.modelIdentifier,
				remoteIp: live?.remoteIp ?? paired?.remoteIp,
				caps,
				commands,
				pathEnv: live?.pathEnv,
				permissions: live?.permissions,
				connectedAtMs: live?.connectedAtMs,
				paired: Boolean(paired),
				connected: Boolean(live)
			}, void 0);
		});
	},
	"node.invoke": async ({ params, respond, context }) => {
		if (!validateNodeInvokeParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.invoke",
				validator: validateNodeInvokeParams
			});
			return;
		}
		const p = params;
		const nodeId = String(p.nodeId ?? "").trim();
		const command = String(p.command ?? "").trim();
		if (!nodeId || !command) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId and command required"));
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			const nodeSession = context.nodeRegistry.get(nodeId);
			if (!nodeSession) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "node not connected", { details: { code: "NOT_CONNECTED" } }));
				return;
			}
			const allowlist = resolveNodeCommandAllowlist(loadConfig(), nodeSession);
			const allowed = isNodeCommandAllowed({
				command,
				declaredCommands: nodeSession.commands,
				allowlist
			});
			if (!allowed.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "node command not allowed", { details: {
					reason: allowed.reason,
					command
				} }));
				return;
			}
			const res = await context.nodeRegistry.invoke({
				nodeId,
				command,
				params: p.params,
				timeoutMs: p.timeoutMs,
				idempotencyKey: p.idempotencyKey
			});
			if (!res.ok) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, res.error?.message ?? "node invoke failed", { details: { nodeError: res.error ?? null } }));
				return;
			}
			respond(true, {
				ok: true,
				nodeId,
				command,
				payload: res.payloadJSON ? safeParseJson(res.payloadJSON) : res.payload,
				payloadJSON: res.payloadJSON ?? null
			}, void 0);
		});
	},
	"node.invoke.result": async ({ params, respond, context, client }) => {
		const normalizedParams = normalizeNodeInvokeResultParams(params);
		if (!validateNodeInvokeResultParams(normalizedParams)) {
			respondInvalidParams({
				respond,
				method: "node.invoke.result",
				validator: validateNodeInvokeResultParams
			});
			return;
		}
		const p = normalizedParams;
		const callerNodeId = client?.connect?.device?.id ?? client?.connect?.client?.id;
		if (callerNodeId && callerNodeId !== p.nodeId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId mismatch"));
			return;
		}
		if (!context.nodeRegistry.handleInvokeResult({
			id: p.id,
			nodeId: p.nodeId,
			ok: p.ok,
			payload: p.payload,
			payloadJSON: p.payloadJSON ?? null,
			error: p.error ?? null
		})) {
			context.logGateway.debug(`late invoke result ignored: id=${p.id} node=${p.nodeId}`);
			respond(true, {
				ok: true,
				ignored: true
			}, void 0);
			return;
		}
		respond(true, { ok: true }, void 0);
	},
	"node.event": async ({ params, respond, context, client }) => {
		if (!validateNodeEventParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.event",
				validator: validateNodeEventParams
			});
			return;
		}
		const p = params;
		const payloadJSON = typeof p.payloadJSON === "string" ? p.payloadJSON : p.payload !== void 0 ? JSON.stringify(p.payload) : null;
		await respondUnavailableOnThrow(respond, async () => {
			const { handleNodeEvent } = await import("./server-node-events-BH45tAAt.js");
			const nodeId = client?.connect?.device?.id ?? client?.connect?.client?.id ?? "node";
			await handleNodeEvent({
				deps: context.deps,
				broadcast: context.broadcast,
				nodeSendToSession: context.nodeSendToSession,
				nodeSubscribe: context.nodeSubscribe,
				nodeUnsubscribe: context.nodeUnsubscribe,
				broadcastVoiceWakeChanged: context.broadcastVoiceWakeChanged,
				addChatRun: context.addChatRun,
				removeChatRun: context.removeChatRun,
				chatAbortControllers: context.chatAbortControllers,
				chatAbortedRuns: context.chatAbortedRuns,
				chatRunBuffers: context.chatRunBuffers,
				chatDeltaSentAt: context.chatDeltaSentAt,
				dedupe: context.dedupe,
				agentRunSeq: context.agentRunSeq,
				getHealthCache: context.getHealthCache,
				refreshHealthSnapshot: context.refreshHealthSnapshot,
				loadGatewayModelCatalog: context.loadGatewayModelCatalog,
				logGateway: { warn: context.logGateway.warn }
			}, nodeId, {
				event: p.event,
				payloadJSON
			});
			respond(true, { ok: true }, void 0);
		});
	}
};

//#endregion
//#region src/gateway/server-methods/send.ts
const inflightByContext = /* @__PURE__ */ new WeakMap();
const getInflightMap = (context) => {
	let inflight = inflightByContext.get(context);
	if (!inflight) {
		inflight = /* @__PURE__ */ new Map();
		inflightByContext.set(context, inflight);
	}
	return inflight;
};
const sendHandlers = {
	send: async ({ params, respond, context }) => {
		const p = params;
		if (!validateSendParams(p)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid send params: ${formatValidationErrors(validateSendParams.errors)}`));
			return;
		}
		const request = p;
		const idem = request.idempotencyKey;
		const dedupeKey = `send:${idem}`;
		const cached = context.dedupe.get(dedupeKey);
		if (cached) {
			respond(cached.ok, cached.payload, cached.error, { cached: true });
			return;
		}
		const inflightMap = getInflightMap(context);
		const inflight = inflightMap.get(dedupeKey);
		if (inflight) {
			const result = await inflight;
			const meta = result.meta ? {
				...result.meta,
				cached: true
			} : { cached: true };
			respond(result.ok, result.payload, result.error, meta);
			return;
		}
		const to = request.to.trim();
		const message = typeof request.message === "string" ? request.message.trim() : "";
		const mediaUrl = typeof request.mediaUrl === "string" && request.mediaUrl.trim().length > 0 ? request.mediaUrl.trim() : void 0;
		const mediaUrls = Array.isArray(request.mediaUrls) ? request.mediaUrls.map((entry) => typeof entry === "string" ? entry.trim() : "").filter((entry) => entry.length > 0) : void 0;
		if (!message && !mediaUrl && (mediaUrls?.length ?? 0) === 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid send params: text or media is required"));
			return;
		}
		const channelInput = typeof request.channel === "string" ? request.channel : void 0;
		const normalizedChannel = channelInput ? normalizeChannelId(channelInput) : null;
		if (channelInput && !normalizedChannel) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported channel: ${channelInput}`));
			return;
		}
		const channel = normalizedChannel ?? DEFAULT_CHAT_CHANNEL;
		const accountId = typeof request.accountId === "string" && request.accountId.trim().length ? request.accountId.trim() : void 0;
		const outboundChannel = channel;
		if (!getChannelPlugin(channel)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported channel: ${channel}`));
			return;
		}
		const work = (async () => {
			try {
				const cfg = loadConfig();
				const resolved = resolveOutboundTarget({
					channel: outboundChannel,
					to,
					cfg,
					accountId,
					mode: "explicit"
				});
				if (!resolved.ok) return {
					ok: false,
					error: errorShape(ErrorCodes.INVALID_REQUEST, String(resolved.error)),
					meta: { channel }
				};
				const outboundDeps = context.deps ? createOutboundSendDeps$1(context.deps) : void 0;
				const mirrorPayloads = normalizeReplyPayloadsForDelivery([{
					text: message,
					mediaUrl,
					mediaUrls
				}]);
				const mirrorText = mirrorPayloads.map((payload) => payload.text).filter(Boolean).join("\n");
				const mirrorMediaUrls = mirrorPayloads.flatMap((payload) => payload.mediaUrls ?? (payload.mediaUrl ? [payload.mediaUrl] : []));
				const providedSessionKey = typeof request.sessionKey === "string" && request.sessionKey.trim() ? request.sessionKey.trim().toLowerCase() : void 0;
				const derivedAgentId = resolveSessionAgentId({ config: cfg });
				const derivedRoute = !providedSessionKey ? await resolveOutboundSessionRoute({
					cfg,
					channel,
					agentId: derivedAgentId,
					accountId,
					target: resolved.to
				}) : null;
				if (derivedRoute) await ensureOutboundSessionEntry({
					cfg,
					agentId: derivedAgentId,
					channel,
					accountId,
					route: derivedRoute
				});
				const result = (await deliverOutboundPayloads({
					cfg,
					channel: outboundChannel,
					to: resolved.to,
					accountId,
					payloads: [{
						text: message,
						mediaUrl,
						mediaUrls
					}],
					gifPlayback: request.gifPlayback,
					deps: outboundDeps,
					mirror: providedSessionKey ? {
						sessionKey: providedSessionKey,
						agentId: resolveSessionAgentId({
							sessionKey: providedSessionKey,
							config: cfg
						}),
						text: mirrorText || message,
						mediaUrls: mirrorMediaUrls.length > 0 ? mirrorMediaUrls : void 0
					} : derivedRoute ? {
						sessionKey: derivedRoute.sessionKey,
						agentId: derivedAgentId,
						text: mirrorText || message,
						mediaUrls: mirrorMediaUrls.length > 0 ? mirrorMediaUrls : void 0
					} : void 0
				})).at(-1);
				if (!result) throw new Error("No delivery result");
				const payload = {
					runId: idem,
					messageId: result.messageId,
					channel
				};
				if ("chatId" in result) payload.chatId = result.chatId;
				if ("channelId" in result) payload.channelId = result.channelId;
				if ("toJid" in result) payload.toJid = result.toJid;
				if ("conversationId" in result) payload.conversationId = result.conversationId;
				context.dedupe.set(dedupeKey, {
					ts: Date.now(),
					ok: true,
					payload
				});
				return {
					ok: true,
					payload,
					meta: { channel }
				};
			} catch (err) {
				const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
				context.dedupe.set(dedupeKey, {
					ts: Date.now(),
					ok: false,
					error
				});
				return {
					ok: false,
					error,
					meta: {
						channel,
						error: formatForLog(err)
					}
				};
			}
		})();
		inflightMap.set(dedupeKey, work);
		try {
			const result = await work;
			respond(result.ok, result.payload, result.error, result.meta);
		} finally {
			inflightMap.delete(dedupeKey);
		}
	},
	poll: async ({ params, respond, context }) => {
		const p = params;
		if (!validatePollParams(p)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid poll params: ${formatValidationErrors(validatePollParams.errors)}`));
			return;
		}
		const request = p;
		const idem = request.idempotencyKey;
		const cached = context.dedupe.get(`poll:${idem}`);
		if (cached) {
			respond(cached.ok, cached.payload, cached.error, { cached: true });
			return;
		}
		const to = request.to.trim();
		const channelInput = typeof request.channel === "string" ? request.channel : void 0;
		const normalizedChannel = channelInput ? normalizeChannelId(channelInput) : null;
		if (channelInput && !normalizedChannel) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported poll channel: ${channelInput}`));
			return;
		}
		const channel = normalizedChannel ?? DEFAULT_CHAT_CHANNEL;
		const poll = {
			question: request.question,
			options: request.options,
			maxSelections: request.maxSelections,
			durationHours: request.durationHours
		};
		const accountId = typeof request.accountId === "string" && request.accountId.trim().length ? request.accountId.trim() : void 0;
		try {
			const outbound = getChannelPlugin(channel)?.outbound;
			if (!outbound?.sendPoll) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported poll channel: ${channel}`));
				return;
			}
			const cfg = loadConfig();
			const resolved = resolveOutboundTarget({
				channel,
				to,
				cfg,
				accountId,
				mode: "explicit"
			});
			if (!resolved.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, String(resolved.error)));
				return;
			}
			const normalized = outbound.pollMaxOptions ? normalizePollInput(poll, { maxOptions: outbound.pollMaxOptions }) : normalizePollInput(poll);
			const result = await outbound.sendPoll({
				cfg,
				to: resolved.to,
				poll: normalized,
				accountId
			});
			const payload = {
				runId: idem,
				messageId: result.messageId,
				channel
			};
			if (result.toJid) payload.toJid = result.toJid;
			if (result.channelId) payload.channelId = result.channelId;
			if (result.conversationId) payload.conversationId = result.conversationId;
			if (result.pollId) payload.pollId = result.pollId;
			context.dedupe.set(`poll:${idem}`, {
				ts: Date.now(),
				ok: true,
				payload
			});
			respond(true, payload, void 0, { channel });
		} catch (err) {
			const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
			context.dedupe.set(`poll:${idem}`, {
				ts: Date.now(),
				ok: false,
				error
			});
			respond(false, void 0, error, {
				channel,
				error: formatForLog(err)
			});
		}
	}
};

//#endregion
//#region src/gateway/sessions-patch.ts
function invalid(message) {
	return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, message)
	};
}
function normalizeExecHost(raw) {
	const normalized = raw.trim().toLowerCase();
	if (normalized === "sandbox" || normalized === "gateway" || normalized === "node") return normalized;
}
function normalizeExecSecurity(raw) {
	const normalized = raw.trim().toLowerCase();
	if (normalized === "deny" || normalized === "allowlist" || normalized === "full") return normalized;
}
function normalizeExecAsk(raw) {
	const normalized = raw.trim().toLowerCase();
	if (normalized === "off" || normalized === "on-miss" || normalized === "always") return normalized;
}
async function applySessionsPatchToStore(params) {
	const { cfg, store, storeKey, patch } = params;
	const now = Date.now();
	const resolvedDefault = resolveDefaultModelForAgent({
		cfg,
		agentId: normalizeAgentId(parseAgentSessionKey(storeKey)?.agentId ?? resolveDefaultAgentId(cfg))
	});
	const existing = store[storeKey];
	const next = existing ? {
		...existing,
		updatedAt: Math.max(existing.updatedAt ?? 0, now)
	} : {
		sessionId: randomUUID(),
		updatedAt: now
	};
	if ("spawnedBy" in patch) {
		const raw = patch.spawnedBy;
		if (raw === null) {
			if (existing?.spawnedBy) return invalid("spawnedBy cannot be cleared once set");
		} else if (raw !== void 0) {
			const trimmed = String(raw).trim();
			if (!trimmed) return invalid("invalid spawnedBy: empty");
			if (!isSubagentSessionKey(storeKey)) return invalid("spawnedBy is only supported for subagent:* sessions");
			if (existing?.spawnedBy && existing.spawnedBy !== trimmed) return invalid("spawnedBy cannot be changed once set");
			next.spawnedBy = trimmed;
		}
	}
	if ("label" in patch) {
		const raw = patch.label;
		if (raw === null) delete next.label;
		else if (raw !== void 0) {
			const parsed = parseSessionLabel(raw);
			if (!parsed.ok) return invalid(parsed.error);
			for (const [key, entry] of Object.entries(store)) {
				if (key === storeKey) continue;
				if (entry?.label === parsed.label) return invalid(`label already in use: ${parsed.label}`);
			}
			next.label = parsed.label;
		}
	}
	if ("thinkingLevel" in patch) {
		const raw = patch.thinkingLevel;
		if (raw === null) delete next.thinkingLevel;
		else if (raw !== void 0) {
			const normalized = normalizeThinkLevel(String(raw));
			if (!normalized) return invalid(`invalid thinkingLevel (use ${formatThinkingLevels(existing?.providerOverride?.trim() || resolvedDefault.provider, existing?.modelOverride?.trim() || resolvedDefault.model, "|")})`);
			next.thinkingLevel = normalized;
		}
	}
	if ("verboseLevel" in patch) {
		const raw = patch.verboseLevel;
		const parsed = parseVerboseOverride(raw);
		if (!parsed.ok) return invalid(parsed.error);
		applyVerboseOverride(next, parsed.value);
	}
	if ("reasoningLevel" in patch) {
		const raw = patch.reasoningLevel;
		if (raw === null) delete next.reasoningLevel;
		else if (raw !== void 0) {
			const normalized = normalizeReasoningLevel(String(raw));
			if (!normalized) return invalid("invalid reasoningLevel (use \"on\"|\"off\"|\"stream\")");
			if (normalized === "off") delete next.reasoningLevel;
			else next.reasoningLevel = normalized;
		}
	}
	if ("responseUsage" in patch) {
		const raw = patch.responseUsage;
		if (raw === null) delete next.responseUsage;
		else if (raw !== void 0) {
			const normalized = normalizeUsageDisplay(String(raw));
			if (!normalized) return invalid("invalid responseUsage (use \"off\"|\"tokens\"|\"full\")");
			if (normalized === "off") delete next.responseUsage;
			else next.responseUsage = normalized;
		}
	}
	if ("elevatedLevel" in patch) {
		const raw = patch.elevatedLevel;
		if (raw === null) delete next.elevatedLevel;
		else if (raw !== void 0) {
			const normalized = normalizeElevatedLevel(String(raw));
			if (!normalized) return invalid("invalid elevatedLevel (use \"on\"|\"off\"|\"ask\"|\"full\")");
			next.elevatedLevel = normalized;
		}
	}
	if ("execHost" in patch) {
		const raw = patch.execHost;
		if (raw === null) delete next.execHost;
		else if (raw !== void 0) {
			const normalized = normalizeExecHost(String(raw));
			if (!normalized) return invalid("invalid execHost (use \"sandbox\"|\"gateway\"|\"node\")");
			next.execHost = normalized;
		}
	}
	if ("execSecurity" in patch) {
		const raw = patch.execSecurity;
		if (raw === null) delete next.execSecurity;
		else if (raw !== void 0) {
			const normalized = normalizeExecSecurity(String(raw));
			if (!normalized) return invalid("invalid execSecurity (use \"deny\"|\"allowlist\"|\"full\")");
			next.execSecurity = normalized;
		}
	}
	if ("execAsk" in patch) {
		const raw = patch.execAsk;
		if (raw === null) delete next.execAsk;
		else if (raw !== void 0) {
			const normalized = normalizeExecAsk(String(raw));
			if (!normalized) return invalid("invalid execAsk (use \"off\"|\"on-miss\"|\"always\")");
			next.execAsk = normalized;
		}
	}
	if ("execNode" in patch) {
		const raw = patch.execNode;
		if (raw === null) delete next.execNode;
		else if (raw !== void 0) {
			const trimmed = String(raw).trim();
			if (!trimmed) return invalid("invalid execNode: empty");
			next.execNode = trimmed;
		}
	}
	if ("model" in patch) {
		const raw = patch.model;
		if (raw === null) applyModelOverrideToSessionEntry({
			entry: next,
			selection: {
				provider: resolvedDefault.provider,
				model: resolvedDefault.model,
				isDefault: true
			}
		});
		else if (raw !== void 0) {
			const trimmed = String(raw).trim();
			if (!trimmed) return invalid("invalid model: empty");
			if (!params.loadGatewayModelCatalog) return {
				ok: false,
				error: errorShape(ErrorCodes.UNAVAILABLE, "model catalog unavailable")
			};
			const resolved = resolveAllowedModelRef({
				cfg,
				catalog: await params.loadGatewayModelCatalog(),
				raw: trimmed,
				defaultProvider: resolvedDefault.provider,
				defaultModel: resolvedDefault.model
			});
			if ("error" in resolved) return invalid(resolved.error);
			const isDefault = resolved.ref.provider === resolvedDefault.provider && resolved.ref.model === resolvedDefault.model;
			applyModelOverrideToSessionEntry({
				entry: next,
				selection: {
					provider: resolved.ref.provider,
					model: resolved.ref.model,
					isDefault
				}
			});
		}
	}
	if (next.thinkingLevel === "xhigh") {
		if (!supportsXHighThinking(next.providerOverride ?? resolvedDefault.provider, next.modelOverride ?? resolvedDefault.model)) {
			if ("thinkingLevel" in patch) return invalid(`thinkingLevel "xhigh" is only supported for ${formatXHighModelHint()}`);
			next.thinkingLevel = "high";
		}
	}
	if ("sendPolicy" in patch) {
		const raw = patch.sendPolicy;
		if (raw === null) delete next.sendPolicy;
		else if (raw !== void 0) {
			const normalized = normalizeSendPolicy(String(raw));
			if (!normalized) return invalid("invalid sendPolicy (use \"allow\"|\"deny\")");
			next.sendPolicy = normalized;
		}
	}
	if ("groupActivation" in patch) {
		const raw = patch.groupActivation;
		if (raw === null) delete next.groupActivation;
		else if (raw !== void 0) {
			const normalized = normalizeGroupActivation(String(raw));
			if (!normalized) return invalid("invalid groupActivation (use \"mention\"|\"always\")");
			next.groupActivation = normalized;
		}
	}
	store[storeKey] = next;
	return {
		ok: true,
		entry: next
	};
}

//#endregion
//#region src/gateway/sessions-resolve.ts
async function resolveSessionKeyFromResolveParams(params) {
	const { cfg, p } = params;
	const key = typeof p.key === "string" ? p.key.trim() : "";
	const hasKey = key.length > 0;
	const sessionId = typeof p.sessionId === "string" ? p.sessionId.trim() : "";
	const hasSessionId = sessionId.length > 0;
	const selectionCount = [
		hasKey,
		hasSessionId,
		typeof p.label === "string" && p.label.trim().length > 0
	].filter(Boolean).length;
	if (selectionCount > 1) return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, "Provide either key, sessionId, or label (not multiple)")
	};
	if (selectionCount === 0) return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, "Either key, sessionId, or label is required")
	};
	if (hasKey) {
		const target = resolveGatewaySessionStoreTarget({
			cfg,
			key
		});
		const store = loadSessionStore(target.storePath);
		if (store[target.canonicalKey]) return {
			ok: true,
			key: target.canonicalKey
		};
		const legacyKey = target.storeKeys.find((candidate) => store[candidate]);
		if (!legacyKey) return {
			ok: false,
			error: errorShape(ErrorCodes.INVALID_REQUEST, `No session found: ${key}`)
		};
		await updateSessionStore(target.storePath, (s) => {
			const liveTarget = resolveGatewaySessionStoreTarget({
				cfg,
				key,
				store: s
			});
			const canonicalKey = liveTarget.canonicalKey;
			if (!s[canonicalKey] && s[legacyKey]) s[canonicalKey] = s[legacyKey];
			pruneLegacyStoreKeys({
				store: s,
				canonicalKey,
				candidates: liveTarget.storeKeys
			});
		});
		return {
			ok: true,
			key: target.canonicalKey
		};
	}
	if (hasSessionId) {
		const { storePath, store } = loadCombinedSessionStoreForGateway(cfg);
		const matches = listSessionsFromStore({
			cfg,
			storePath,
			store,
			opts: {
				includeGlobal: p.includeGlobal === true,
				includeUnknown: p.includeUnknown === true,
				spawnedBy: p.spawnedBy,
				agentId: p.agentId,
				search: sessionId,
				limit: 8
			}
		}).sessions.filter((session) => session.sessionId === sessionId || session.key === sessionId);
		if (matches.length === 0) return {
			ok: false,
			error: errorShape(ErrorCodes.INVALID_REQUEST, `No session found: ${sessionId}`)
		};
		if (matches.length > 1) {
			const keys = matches.map((session) => session.key).join(", ");
			return {
				ok: false,
				error: errorShape(ErrorCodes.INVALID_REQUEST, `Multiple sessions found for sessionId: ${sessionId} (${keys})`)
			};
		}
		return {
			ok: true,
			key: String(matches[0]?.key ?? "")
		};
	}
	const parsedLabel = parseSessionLabel(p.label);
	if (!parsedLabel.ok) return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, parsedLabel.error)
	};
	const { storePath, store } = loadCombinedSessionStoreForGateway(cfg);
	const list = listSessionsFromStore({
		cfg,
		storePath,
		store,
		opts: {
			includeGlobal: p.includeGlobal === true,
			includeUnknown: p.includeUnknown === true,
			label: parsedLabel.label,
			agentId: p.agentId,
			spawnedBy: p.spawnedBy,
			limit: 2
		}
	});
	if (list.sessions.length === 0) return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, `No session found with label: ${parsedLabel.label}`)
	};
	if (list.sessions.length > 1) {
		const keys = list.sessions.map((s) => s.key).join(", ");
		return {
			ok: false,
			error: errorShape(ErrorCodes.INVALID_REQUEST, `Multiple sessions found with label: ${parsedLabel.label} (${keys})`)
		};
	}
	return {
		ok: true,
		key: String(list.sessions[0]?.key ?? "")
	};
}

//#endregion
//#region src/gateway/server-methods/sessions.ts
function migrateAndPruneSessionStoreKey(params) {
	const target = resolveGatewaySessionStoreTarget({
		cfg: params.cfg,
		key: params.key,
		store: params.store
	});
	const primaryKey = target.canonicalKey;
	if (!params.store[primaryKey]) {
		const existingKey = target.storeKeys.find((candidate) => Boolean(params.store[candidate]));
		if (existingKey) params.store[primaryKey] = params.store[existingKey];
	}
	pruneLegacyStoreKeys({
		store: params.store,
		canonicalKey: primaryKey,
		candidates: target.storeKeys
	});
	return {
		target,
		primaryKey,
		entry: params.store[primaryKey]
	};
}
function archiveSessionTranscriptsForSession(params) {
	if (!params.sessionId) return [];
	return archiveSessionTranscripts({
		sessionId: params.sessionId,
		storePath: params.storePath,
		sessionFile: params.sessionFile,
		agentId: params.agentId,
		reason: params.reason
	});
}
const sessionsHandlers = {
	"sessions.list": ({ params, respond }) => {
		if (!validateSessionsListParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.list params: ${formatValidationErrors(validateSessionsListParams.errors)}`));
			return;
		}
		const p = params;
		const cfg = loadConfig();
		const { storePath, store } = loadCombinedSessionStoreForGateway(cfg);
		respond(true, listSessionsFromStore({
			cfg,
			storePath,
			store,
			opts: p
		}), void 0);
	},
	"sessions.preview": ({ params, respond }) => {
		if (!validateSessionsPreviewParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.preview params: ${formatValidationErrors(validateSessionsPreviewParams.errors)}`));
			return;
		}
		const p = params;
		const keys = (Array.isArray(p.keys) ? p.keys : []).map((key) => String(key ?? "").trim()).filter(Boolean).slice(0, 64);
		const limit = typeof p.limit === "number" && Number.isFinite(p.limit) ? Math.max(1, p.limit) : 12;
		const maxChars = typeof p.maxChars === "number" && Number.isFinite(p.maxChars) ? Math.max(20, p.maxChars) : 240;
		if (keys.length === 0) {
			respond(true, {
				ts: Date.now(),
				previews: []
			}, void 0);
			return;
		}
		const cfg = loadConfig();
		const storeCache = /* @__PURE__ */ new Map();
		const previews = [];
		for (const key of keys) try {
			const storeTarget = resolveGatewaySessionStoreTarget({
				cfg,
				key,
				scanLegacyKeys: false
			});
			const store = storeCache.get(storeTarget.storePath) ?? loadSessionStore(storeTarget.storePath);
			storeCache.set(storeTarget.storePath, store);
			const target = resolveGatewaySessionStoreTarget({
				cfg,
				key,
				store
			});
			const entry = target.storeKeys.map((candidate) => store[candidate]).find(Boolean);
			if (!entry?.sessionId) {
				previews.push({
					key,
					status: "missing",
					items: []
				});
				continue;
			}
			const items = readSessionPreviewItemsFromTranscript(entry.sessionId, target.storePath, entry.sessionFile, target.agentId, limit, maxChars);
			previews.push({
				key,
				status: items.length > 0 ? "ok" : "empty",
				items
			});
		} catch {
			previews.push({
				key,
				status: "error",
				items: []
			});
		}
		respond(true, {
			ts: Date.now(),
			previews
		}, void 0);
	},
	"sessions.resolve": async ({ params, respond }) => {
		if (!validateSessionsResolveParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.resolve params: ${formatValidationErrors(validateSessionsResolveParams.errors)}`));
			return;
		}
		const p = params;
		const resolved = await resolveSessionKeyFromResolveParams({
			cfg: loadConfig(),
			p
		});
		if (!resolved.ok) {
			respond(false, void 0, resolved.error);
			return;
		}
		respond(true, {
			ok: true,
			key: resolved.key
		}, void 0);
	},
	"sessions.patch": async ({ params, respond, context }) => {
		if (!validateSessionsPatchParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.patch params: ${formatValidationErrors(validateSessionsPatchParams.errors)}`));
			return;
		}
		const p = params;
		const key = String(p.key ?? "").trim();
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key required"));
			return;
		}
		const cfg = loadConfig();
		const target = resolveGatewaySessionStoreTarget({
			cfg,
			key
		});
		const storePath = target.storePath;
		const applied = await updateSessionStore(storePath, async (store) => {
			const { primaryKey } = migrateAndPruneSessionStoreKey({
				cfg,
				key,
				store
			});
			return await applySessionsPatchToStore({
				cfg,
				store,
				storeKey: primaryKey,
				patch: p,
				loadGatewayModelCatalog: context.loadGatewayModelCatalog
			});
		});
		if (!applied.ok) {
			respond(false, void 0, applied.error);
			return;
		}
		const agentId = normalizeAgentId(parseAgentSessionKey(target.canonicalKey ?? key)?.agentId ?? resolveDefaultAgentId(cfg));
		const resolved = resolveSessionModelRef(cfg, applied.entry, agentId);
		respond(true, {
			ok: true,
			path: storePath,
			key: target.canonicalKey,
			entry: applied.entry,
			resolved: {
				modelProvider: resolved.provider,
				model: resolved.model
			}
		}, void 0);
	},
	"sessions.reset": async ({ params, respond }) => {
		if (!validateSessionsResetParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.reset params: ${formatValidationErrors(validateSessionsResetParams.errors)}`));
			return;
		}
		const p = params;
		const key = String(p.key ?? "").trim();
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key required"));
			return;
		}
		const cfg = loadConfig();
		const target = resolveGatewaySessionStoreTarget({
			cfg,
			key
		});
		const storePath = target.storePath;
		let oldSessionId;
		let oldSessionFile;
		const next = await updateSessionStore(storePath, (store) => {
			const { primaryKey } = migrateAndPruneSessionStoreKey({
				cfg,
				key,
				store
			});
			const entry = store[primaryKey];
			oldSessionId = entry?.sessionId;
			oldSessionFile = entry?.sessionFile;
			const now = Date.now();
			const nextEntry = {
				sessionId: randomUUID(),
				updatedAt: now,
				systemSent: false,
				abortedLastRun: false,
				thinkingLevel: entry?.thinkingLevel,
				verboseLevel: entry?.verboseLevel,
				reasoningLevel: entry?.reasoningLevel,
				responseUsage: entry?.responseUsage,
				model: entry?.model,
				contextTokens: entry?.contextTokens,
				sendPolicy: entry?.sendPolicy,
				label: entry?.label,
				origin: snapshotSessionOrigin(entry),
				lastChannel: entry?.lastChannel,
				lastTo: entry?.lastTo,
				skillsSnapshot: entry?.skillsSnapshot,
				inputTokens: 0,
				outputTokens: 0,
				totalTokens: 0,
				totalTokensFresh: true
			};
			store[primaryKey] = nextEntry;
			return nextEntry;
		});
		archiveSessionTranscriptsForSession({
			sessionId: oldSessionId,
			storePath,
			sessionFile: oldSessionFile,
			agentId: target.agentId,
			reason: "reset"
		});
		respond(true, {
			ok: true,
			key: target.canonicalKey,
			entry: next
		}, void 0);
	},
	"sessions.delete": async ({ params, respond }) => {
		if (!validateSessionsDeleteParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.delete params: ${formatValidationErrors(validateSessionsDeleteParams.errors)}`));
			return;
		}
		const p = params;
		const key = String(p.key ?? "").trim();
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key required"));
			return;
		}
		const cfg = loadConfig();
		const mainKey = resolveMainSessionKey(cfg);
		const target = resolveGatewaySessionStoreTarget({
			cfg,
			key
		});
		if (target.canonicalKey === mainKey) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Cannot delete the main session (${mainKey}).`));
			return;
		}
		const deleteTranscript = typeof p.deleteTranscript === "boolean" ? p.deleteTranscript : true;
		const storePath = target.storePath;
		const { entry } = loadSessionEntry(key);
		const sessionId = entry?.sessionId;
		const existed = Boolean(entry);
		const queueKeys = new Set(target.storeKeys);
		queueKeys.add(target.canonicalKey);
		if (sessionId) queueKeys.add(sessionId);
		clearSessionQueues([...queueKeys]);
		stopSubagentsForRequester({
			cfg,
			requesterSessionKey: target.canonicalKey
		});
		if (sessionId) {
			abortEmbeddedPiRun(sessionId);
			if (!await waitForEmbeddedPiRunEnd(sessionId, 15e3)) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `Session ${key} is still active; try again in a moment.`));
				return;
			}
		}
		await updateSessionStore(storePath, (store) => {
			const { primaryKey } = migrateAndPruneSessionStoreKey({
				cfg,
				key,
				store
			});
			if (store[primaryKey]) delete store[primaryKey];
		});
		const archived = deleteTranscript ? archiveSessionTranscriptsForSession({
			sessionId,
			storePath,
			sessionFile: entry?.sessionFile,
			agentId: target.agentId,
			reason: "deleted"
		}) : [];
		respond(true, {
			ok: true,
			key: target.canonicalKey,
			deleted: existed,
			archived
		}, void 0);
	},
	"sessions.compact": async ({ params, respond }) => {
		if (!validateSessionsCompactParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.compact params: ${formatValidationErrors(validateSessionsCompactParams.errors)}`));
			return;
		}
		const p = params;
		const key = String(p.key ?? "").trim();
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key required"));
			return;
		}
		const maxLines = typeof p.maxLines === "number" && Number.isFinite(p.maxLines) ? Math.max(1, Math.floor(p.maxLines)) : 400;
		const cfg = loadConfig();
		const target = resolveGatewaySessionStoreTarget({
			cfg,
			key
		});
		const storePath = target.storePath;
		const compactTarget = await updateSessionStore(storePath, (store) => {
			const { entry, primaryKey } = migrateAndPruneSessionStoreKey({
				cfg,
				key,
				store
			});
			return {
				entry,
				primaryKey
			};
		});
		const entry = compactTarget.entry;
		const sessionId = entry?.sessionId;
		if (!sessionId) {
			respond(true, {
				ok: true,
				key: target.canonicalKey,
				compacted: false,
				reason: "no sessionId"
			}, void 0);
			return;
		}
		const filePath = resolveSessionTranscriptCandidates(sessionId, storePath, entry?.sessionFile, target.agentId).find((candidate) => fs.existsSync(candidate));
		if (!filePath) {
			respond(true, {
				ok: true,
				key: target.canonicalKey,
				compacted: false,
				reason: "no transcript"
			}, void 0);
			return;
		}
		const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/).filter((l) => l.trim().length > 0);
		if (lines.length <= maxLines) {
			respond(true, {
				ok: true,
				key: target.canonicalKey,
				compacted: false,
				kept: lines.length
			}, void 0);
			return;
		}
		const archived = archiveFileOnDisk(filePath, "bak");
		const keptLines = lines.slice(-maxLines);
		fs.writeFileSync(filePath, `${keptLines.join("\n")}\n`, "utf-8");
		await updateSessionStore(storePath, (store) => {
			const entryToUpdate = store[compactTarget.primaryKey];
			if (!entryToUpdate) return;
			delete entryToUpdate.inputTokens;
			delete entryToUpdate.outputTokens;
			delete entryToUpdate.totalTokens;
			delete entryToUpdate.totalTokensFresh;
			entryToUpdate.updatedAt = Date.now();
		});
		respond(true, {
			ok: true,
			key: target.canonicalKey,
			compacted: true,
			archived,
			kept: keptLines.length
		}, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/skills.ts
function listWorkspaceDirs(cfg) {
	const dirs = /* @__PURE__ */ new Set();
	const list = cfg.agents?.list;
	if (Array.isArray(list)) {
		for (const entry of list) if (entry && typeof entry === "object" && typeof entry.id === "string") dirs.add(resolveAgentWorkspaceDir(cfg, entry.id));
	}
	dirs.add(resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)));
	return [...dirs];
}
function collectSkillBins(entries) {
	const bins = /* @__PURE__ */ new Set();
	for (const entry of entries) {
		const required = entry.metadata?.requires?.bins ?? [];
		const anyBins = entry.metadata?.requires?.anyBins ?? [];
		const install = entry.metadata?.install ?? [];
		for (const bin of required) {
			const trimmed = bin.trim();
			if (trimmed) bins.add(trimmed);
		}
		for (const bin of anyBins) {
			const trimmed = bin.trim();
			if (trimmed) bins.add(trimmed);
		}
		for (const spec of install) {
			const specBins = spec?.bins ?? [];
			for (const bin of specBins) {
				const trimmed = String(bin).trim();
				if (trimmed) bins.add(trimmed);
			}
		}
	}
	return [...bins].toSorted();
}
const skillsHandlers = {
	"skills.status": ({ params, respond }) => {
		if (!validateSkillsStatusParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.status params: ${formatValidationErrors(validateSkillsStatusParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const agentIdRaw = typeof params?.agentId === "string" ? params.agentId.trim() : "";
		const agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : resolveDefaultAgentId(cfg);
		if (agentIdRaw) {
			if (!listAgentIds(cfg).includes(agentId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown agent id "${agentIdRaw}"`));
				return;
			}
		}
		respond(true, buildWorkspaceSkillStatus(resolveAgentWorkspaceDir(cfg, agentId), {
			config: cfg,
			eligibility: { remote: getRemoteSkillEligibility() }
		}), void 0);
	},
	"skills.bins": ({ params, respond }) => {
		if (!validateSkillsBinsParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.bins params: ${formatValidationErrors(validateSkillsBinsParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const workspaceDirs = listWorkspaceDirs(cfg);
		const bins = /* @__PURE__ */ new Set();
		for (const workspaceDir of workspaceDirs) {
			const entries = loadWorkspaceSkillEntries(workspaceDir, { config: cfg });
			for (const bin of collectSkillBins(entries)) bins.add(bin);
		}
		respond(true, { bins: [...bins].toSorted() }, void 0);
	},
	"skills.install": async ({ params, respond }) => {
		if (!validateSkillsInstallParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.install params: ${formatValidationErrors(validateSkillsInstallParams.errors)}`));
			return;
		}
		const p = params;
		const cfg = loadConfig();
		const result = await installSkill({
			workspaceDir: resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)),
			skillName: p.name,
			installId: p.installId,
			timeoutMs: p.timeoutMs,
			config: cfg
		});
		respond(result.ok, result, result.ok ? void 0 : errorShape(ErrorCodes.UNAVAILABLE, result.message));
	},
	"skills.update": async ({ params, respond }) => {
		if (!validateSkillsUpdateParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.update params: ${formatValidationErrors(validateSkillsUpdateParams.errors)}`));
			return;
		}
		const p = params;
		const cfg = loadConfig();
		const skills = cfg.skills ? { ...cfg.skills } : {};
		const entries = skills.entries ? { ...skills.entries } : {};
		const current = entries[p.skillKey] ? { ...entries[p.skillKey] } : {};
		if (typeof p.enabled === "boolean") current.enabled = p.enabled;
		if (typeof p.apiKey === "string") {
			const trimmed = normalizeSecretInput(p.apiKey);
			if (trimmed) current.apiKey = trimmed;
			else delete current.apiKey;
		}
		if (p.env && typeof p.env === "object") {
			const nextEnv = current.env ? { ...current.env } : {};
			for (const [key, value] of Object.entries(p.env)) {
				const trimmedKey = key.trim();
				if (!trimmedKey) continue;
				const trimmedVal = value.trim();
				if (!trimmedVal) delete nextEnv[trimmedKey];
				else nextEnv[trimmedKey] = trimmedVal;
			}
			current.env = nextEnv;
		}
		entries[p.skillKey] = current;
		skills.entries = entries;
		await writeConfigFile({
			...cfg,
			skills
		});
		respond(true, {
			ok: true,
			skillKey: p.skillKey,
			config: current
		}, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/system.ts
const systemHandlers = {
	"last-heartbeat": ({ respond }) => {
		respond(true, getLastHeartbeatEvent(), void 0);
	},
	"set-heartbeats": ({ params, respond }) => {
		const enabled = params.enabled;
		if (typeof enabled !== "boolean") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid set-heartbeats params: enabled (boolean) required"));
			return;
		}
		setHeartbeatsEnabled(enabled);
		respond(true, {
			ok: true,
			enabled
		}, void 0);
	},
	"system-presence": ({ respond }) => {
		respond(true, listSystemPresence(), void 0);
	},
	"system-event": ({ params, respond, context }) => {
		const text = typeof params.text === "string" ? params.text.trim() : "";
		if (!text) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "text required"));
			return;
		}
		const sessionKey = resolveMainSessionKeyFromConfig();
		const deviceId = typeof params.deviceId === "string" ? params.deviceId : void 0;
		const instanceId = typeof params.instanceId === "string" ? params.instanceId : void 0;
		const host = typeof params.host === "string" ? params.host : void 0;
		const ip = typeof params.ip === "string" ? params.ip : void 0;
		const mode = typeof params.mode === "string" ? params.mode : void 0;
		const version = typeof params.version === "string" ? params.version : void 0;
		const platform = typeof params.platform === "string" ? params.platform : void 0;
		const deviceFamily = typeof params.deviceFamily === "string" ? params.deviceFamily : void 0;
		const modelIdentifier = typeof params.modelIdentifier === "string" ? params.modelIdentifier : void 0;
		const lastInputSeconds = typeof params.lastInputSeconds === "number" && Number.isFinite(params.lastInputSeconds) ? params.lastInputSeconds : void 0;
		const reason = typeof params.reason === "string" ? params.reason : void 0;
		const presenceUpdate = updateSystemPresence({
			text,
			deviceId,
			instanceId,
			host,
			ip,
			mode,
			version,
			platform,
			deviceFamily,
			modelIdentifier,
			lastInputSeconds,
			reason,
			roles: Array.isArray(params.roles) && params.roles.every((t) => typeof t === "string") ? params.roles : void 0,
			scopes: Array.isArray(params.scopes) && params.scopes.every((t) => typeof t === "string") ? params.scopes : void 0,
			tags: Array.isArray(params.tags) && params.tags.every((t) => typeof t === "string") ? params.tags : void 0
		});
		if (text.startsWith("Node:")) {
			const next = presenceUpdate.next;
			const changed = new Set(presenceUpdate.changedKeys);
			const reasonValue = next.reason ?? reason;
			const normalizedReason = (reasonValue ?? "").toLowerCase();
			const ignoreReason = normalizedReason.startsWith("periodic") || normalizedReason === "heartbeat";
			const hostChanged = changed.has("host");
			const ipChanged = changed.has("ip");
			const versionChanged = changed.has("version");
			const modeChanged = changed.has("mode");
			const reasonChanged = changed.has("reason") && !ignoreReason;
			if (hostChanged || ipChanged || versionChanged || modeChanged || reasonChanged) {
				const contextChanged = isSystemEventContextChanged(sessionKey, presenceUpdate.key);
				const parts = [];
				if (contextChanged || hostChanged || ipChanged) {
					const hostLabel = next.host?.trim() || "Unknown";
					const ipLabel = next.ip?.trim();
					parts.push(`Node: ${hostLabel}${ipLabel ? ` (${ipLabel})` : ""}`);
				}
				if (versionChanged) parts.push(`app ${next.version?.trim() || "unknown"}`);
				if (modeChanged) parts.push(`mode ${next.mode?.trim() || "unknown"}`);
				if (reasonChanged) parts.push(`reason ${reasonValue?.trim() || "event"}`);
				const deltaText = parts.join(" · ");
				if (deltaText) enqueueSystemEvent(deltaText, {
					sessionKey,
					contextKey: presenceUpdate.key
				});
			}
		} else enqueueSystemEvent(text, { sessionKey });
		const nextPresenceVersion = context.incrementPresenceVersion();
		context.broadcast("presence", { presence: listSystemPresence() }, {
			dropIfSlow: true,
			stateVersion: {
				presence: nextPresenceVersion,
				health: context.getHealthVersion()
			}
		});
		respond(true, { ok: true }, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/talk.ts
const ADMIN_SCOPE$2 = "operator.admin";
const TALK_SECRETS_SCOPE = "operator.talk.secrets";
function canReadTalkSecrets(client) {
	const scopes = Array.isArray(client?.connect?.scopes) ? client.connect.scopes : [];
	return scopes.includes(ADMIN_SCOPE$2) || scopes.includes(TALK_SECRETS_SCOPE);
}
function normalizeTalkConfigSection(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return;
	const source = value;
	const talk = {};
	if (typeof source.voiceId === "string") talk.voiceId = source.voiceId;
	if (source.voiceAliases && typeof source.voiceAliases === "object" && !Array.isArray(source.voiceAliases)) {
		const aliases = {};
		for (const [alias, id] of Object.entries(source.voiceAliases)) {
			if (typeof id !== "string") continue;
			aliases[alias] = id;
		}
		if (Object.keys(aliases).length > 0) talk.voiceAliases = aliases;
	}
	if (typeof source.modelId === "string") talk.modelId = source.modelId;
	if (typeof source.outputFormat === "string") talk.outputFormat = source.outputFormat;
	if (typeof source.apiKey === "string") talk.apiKey = source.apiKey;
	if (typeof source.interruptOnSpeech === "boolean") talk.interruptOnSpeech = source.interruptOnSpeech;
	return Object.keys(talk).length > 0 ? talk : void 0;
}
const talkHandlers = {
	"talk.config": async ({ params, respond, client }) => {
		if (!validateTalkConfigParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid talk.config params: ${formatValidationErrors(validateTalkConfigParams.errors)}`));
			return;
		}
		const includeSecrets = Boolean(params.includeSecrets);
		if (includeSecrets && !canReadTalkSecrets(client)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `missing scope: ${TALK_SECRETS_SCOPE}`));
			return;
		}
		const snapshot = await readConfigFileSnapshot();
		const configPayload = {};
		const talk = normalizeTalkConfigSection(includeSecrets ? snapshot.config.talk : redactConfigObject(snapshot.config.talk));
		if (talk) configPayload.talk = talk;
		const sessionMainKey = snapshot.config.session?.mainKey;
		if (typeof sessionMainKey === "string") configPayload.session = { mainKey: sessionMainKey };
		const seamColor = snapshot.config.ui?.seamColor;
		if (typeof seamColor === "string") configPayload.ui = { seamColor };
		respond(true, { config: configPayload }, void 0);
	},
	"talk.mode": ({ params, respond, context, client, isWebchatConnect }) => {
		if (client && isWebchatConnect(client.connect) && !context.hasConnectedMobileNode()) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "talk disabled: no connected iOS/Android nodes"));
			return;
		}
		if (!validateTalkModeParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid talk.mode params: ${formatValidationErrors(validateTalkModeParams.errors)}`));
			return;
		}
		const payload = {
			enabled: params.enabled,
			phase: params.phase ?? null,
			ts: Date.now()
		};
		context.broadcast("talk.mode", payload, { dropIfSlow: true });
		respond(true, payload, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/tts.ts
const ttsHandlers = {
	"tts.status": async ({ respond }) => {
		try {
			const config = resolveTtsConfig(loadConfig());
			const prefsPath = resolveTtsPrefsPath(config);
			const provider = getTtsProvider(config, prefsPath);
			const autoMode = resolveTtsAutoMode({
				config,
				prefsPath
			});
			const fallbackProviders = resolveTtsProviderOrder(provider).slice(1).filter((candidate) => isTtsProviderConfigured(config, candidate));
			respond(true, {
				enabled: isTtsEnabled(config, prefsPath),
				auto: autoMode,
				provider,
				fallbackProvider: fallbackProviders[0] ?? null,
				fallbackProviders,
				prefsPath,
				hasOpenAIKey: Boolean(resolveTtsApiKey(config, "openai")),
				hasElevenLabsKey: Boolean(resolveTtsApiKey(config, "elevenlabs")),
				edgeEnabled: isTtsProviderConfigured(config, "edge")
			});
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"tts.enable": async ({ respond }) => {
		try {
			setTtsEnabled(resolveTtsPrefsPath(resolveTtsConfig(loadConfig())), true);
			respond(true, { enabled: true });
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"tts.disable": async ({ respond }) => {
		try {
			setTtsEnabled(resolveTtsPrefsPath(resolveTtsConfig(loadConfig())), false);
			respond(true, { enabled: false });
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"tts.convert": async ({ params, respond }) => {
		const text = typeof params.text === "string" ? params.text.trim() : "";
		if (!text) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "tts.convert requires text"));
			return;
		}
		try {
			const result = await textToSpeech({
				text,
				cfg: loadConfig(),
				channel: typeof params.channel === "string" ? params.channel.trim() : void 0
			});
			if (result.success && result.audioPath) {
				respond(true, {
					audioPath: result.audioPath,
					provider: result.provider,
					outputFormat: result.outputFormat,
					voiceCompatible: result.voiceCompatible
				});
				return;
			}
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, result.error ?? "TTS conversion failed"));
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"tts.setProvider": async ({ params, respond }) => {
		const provider = typeof params.provider === "string" ? params.provider.trim() : "";
		if (provider !== "openai" && provider !== "elevenlabs" && provider !== "edge") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "Invalid provider. Use openai, elevenlabs, or edge."));
			return;
		}
		try {
			setTtsProvider(resolveTtsPrefsPath(resolveTtsConfig(loadConfig())), provider);
			respond(true, { provider });
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"tts.providers": async ({ respond }) => {
		try {
			const config = resolveTtsConfig(loadConfig());
			const prefsPath = resolveTtsPrefsPath(config);
			respond(true, {
				providers: [
					{
						id: "openai",
						name: "OpenAI",
						configured: Boolean(resolveTtsApiKey(config, "openai")),
						models: [...OPENAI_TTS_MODELS],
						voices: [...OPENAI_TTS_VOICES]
					},
					{
						id: "elevenlabs",
						name: "ElevenLabs",
						configured: Boolean(resolveTtsApiKey(config, "elevenlabs")),
						models: [
							"eleven_multilingual_v2",
							"eleven_turbo_v2_5",
							"eleven_monolingual_v1"
						]
					},
					{
						id: "edge",
						name: "Edge TTS",
						configured: isTtsProviderConfigured(config, "edge"),
						models: []
					}
				],
				active: getTtsProvider(config, prefsPath)
			});
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	}
};

//#endregion
//#region src/gateway/server-methods/update.ts
const updateHandlers = { "update.run": async ({ params, respond }) => {
	if (!validateUpdateRunParams(params)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid update.run params: ${formatValidationErrors(validateUpdateRunParams.errors)}`));
		return;
	}
	const sessionKey = typeof params.sessionKey === "string" ? params.sessionKey?.trim() || void 0 : void 0;
	const note = typeof params.note === "string" ? params.note?.trim() || void 0 : void 0;
	const restartDelayMsRaw = params.restartDelayMs;
	const restartDelayMs = typeof restartDelayMsRaw === "number" && Number.isFinite(restartDelayMsRaw) ? Math.max(0, Math.floor(restartDelayMsRaw)) : void 0;
	const timeoutMsRaw = params.timeoutMs;
	const timeoutMs = typeof timeoutMsRaw === "number" && Number.isFinite(timeoutMsRaw) ? Math.max(1e3, Math.floor(timeoutMsRaw)) : void 0;
	let result;
	try {
		const configChannel = normalizeUpdateChannel(loadConfig().update?.channel);
		result = await runGatewayUpdate({
			timeoutMs,
			cwd: await resolveOpenClawPackageRoot({
				moduleUrl: import.meta.url,
				argv1: process.argv[1],
				cwd: process.cwd()
			}) ?? process.cwd(),
			argv1: process.argv[1],
			channel: configChannel ?? void 0
		});
	} catch (err) {
		result = {
			status: "error",
			mode: "unknown",
			reason: String(err),
			steps: [],
			durationMs: 0
		};
	}
	const payload = {
		kind: "update",
		status: result.status,
		ts: Date.now(),
		sessionKey,
		message: note ?? null,
		doctorHint: formatDoctorNonInteractiveHint(),
		stats: {
			mode: result.mode,
			root: result.root ?? void 0,
			before: result.before ?? null,
			after: result.after ?? null,
			steps: result.steps.map((step) => ({
				name: step.name,
				command: step.command,
				cwd: step.cwd,
				durationMs: step.durationMs,
				log: {
					stdoutTail: step.stdoutTail ?? null,
					stderrTail: step.stderrTail ?? null,
					exitCode: step.exitCode ?? null
				}
			})),
			reason: result.reason ?? null,
			durationMs: result.durationMs
		}
	};
	let sentinelPath = null;
	try {
		sentinelPath = await writeRestartSentinel(payload);
	} catch {
		sentinelPath = null;
	}
	const restart = scheduleGatewaySigusr1Restart({
		delayMs: restartDelayMs,
		reason: "update.run"
	});
	respond(true, {
		ok: true,
		result,
		restart,
		sentinel: {
			path: sentinelPath,
			payload
		}
	}, void 0);
} };

//#endregion
//#region src/gateway/server-methods/usage.ts
const COST_USAGE_CACHE_TTL_MS = 3e4;
const costUsageCache = /* @__PURE__ */ new Map();
/**
* Parse a date string (YYYY-MM-DD) to start of day timestamp in UTC.
* Returns undefined if invalid.
*/
const parseDateToMs = (raw) => {
	if (typeof raw !== "string" || !raw.trim()) return;
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
	if (!match) return;
	const [, year, month, day] = match;
	const ms = Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day));
	if (Number.isNaN(ms)) return;
	return ms;
};
const parseDays = (raw) => {
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.floor(raw);
	if (typeof raw === "string" && raw.trim() !== "") {
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) return Math.floor(parsed);
	}
};
/**
* Get date range from params (startDate/endDate or days).
* Falls back to last 30 days if not provided.
*/
const parseDateRange = (params) => {
	const now = /* @__PURE__ */ new Date();
	const todayStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
	const todayEndMs = todayStartMs + 1440 * 60 * 1e3 - 1;
	const startMs = parseDateToMs(params.startDate);
	const endMs = parseDateToMs(params.endDate);
	if (startMs !== void 0 && endMs !== void 0) return {
		startMs,
		endMs: endMs + 1440 * 60 * 1e3 - 1
	};
	const days = parseDays(params.days);
	if (days !== void 0) return {
		startMs: todayStartMs - (Math.max(1, days) - 1) * 24 * 60 * 60 * 1e3,
		endMs: todayEndMs
	};
	return {
		startMs: todayStartMs - 696 * 60 * 60 * 1e3,
		endMs: todayEndMs
	};
};
async function discoverAllSessionsForUsage(params) {
	const agents = listAgentsForGateway(params.config).agents;
	return (await Promise.all(agents.map(async (agent) => {
		return (await discoverAllSessions({
			agentId: agent.id,
			startMs: params.startMs,
			endMs: params.endMs
		})).map((session) => ({
			...session,
			agentId: agent.id
		}));
	}))).flat().toSorted((a, b) => b.mtime - a.mtime);
}
async function loadCostUsageSummaryCached(params) {
	const cacheKey = `${params.startMs}-${params.endMs}`;
	const now = Date.now();
	const cached = costUsageCache.get(cacheKey);
	if (cached?.summary && cached.updatedAt && now - cached.updatedAt < COST_USAGE_CACHE_TTL_MS) return cached.summary;
	if (cached?.inFlight) {
		if (cached.summary) return cached.summary;
		return await cached.inFlight;
	}
	const entry = cached ?? {};
	const inFlight = loadCostUsageSummary({
		startMs: params.startMs,
		endMs: params.endMs,
		config: params.config
	}).then((summary) => {
		costUsageCache.set(cacheKey, {
			summary,
			updatedAt: Date.now()
		});
		return summary;
	}).catch((err) => {
		if (entry.summary) return entry.summary;
		throw err;
	}).finally(() => {
		const current = costUsageCache.get(cacheKey);
		if (current?.inFlight === inFlight) {
			current.inFlight = void 0;
			costUsageCache.set(cacheKey, current);
		}
	});
	entry.inFlight = inFlight;
	costUsageCache.set(cacheKey, entry);
	if (entry.summary) return entry.summary;
	return await inFlight;
}
const usageHandlers = {
	"usage.status": async ({ respond }) => {
		respond(true, await loadProviderUsageSummary(), void 0);
	},
	"usage.cost": async ({ respond, params }) => {
		const config = loadConfig();
		const { startMs, endMs } = parseDateRange({
			startDate: params?.startDate,
			endDate: params?.endDate,
			days: params?.days
		});
		respond(true, await loadCostUsageSummaryCached({
			startMs,
			endMs,
			config
		}), void 0);
	},
	"sessions.usage": async ({ respond, params }) => {
		if (!validateSessionsUsageParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid sessions.usage params: ${formatValidationErrors(validateSessionsUsageParams.errors)}`));
			return;
		}
		const p = params;
		const config = loadConfig();
		const { startMs, endMs } = parseDateRange({
			startDate: p.startDate,
			endDate: p.endDate
		});
		const limit = typeof p.limit === "number" && Number.isFinite(p.limit) ? p.limit : 50;
		const includeContextWeight = p.includeContextWeight ?? false;
		const specificKey = typeof p.key === "string" ? p.key.trim() : null;
		const { storePath, store } = loadCombinedSessionStoreForGateway(config);
		const now = Date.now();
		const mergedEntries = [];
		if (specificKey) {
			const parsed = parseAgentSessionKey(specificKey);
			const agentIdFromKey = parsed?.agentId;
			const keyRest = parsed?.rest ?? specificKey;
			const storeBySessionId = /* @__PURE__ */ new Map();
			for (const [key, entry] of Object.entries(store)) if (entry?.sessionId) storeBySessionId.set(entry.sessionId, {
				key,
				entry
			});
			const storeMatch = store[specificKey] ? {
				key: specificKey,
				entry: store[specificKey]
			} : null;
			const storeByIdMatch = storeBySessionId.get(keyRest) ?? null;
			const resolvedStoreKey = storeMatch?.key ?? storeByIdMatch?.key ?? specificKey;
			const storeEntry = storeMatch?.entry ?? storeByIdMatch?.entry;
			const sessionId = storeEntry?.sessionId ?? keyRest;
			let sessionFile;
			try {
				sessionFile = resolveSessionFilePath(sessionId, storeEntry, resolveSessionFilePathOptions({
					storePath: storePath !== "(multiple)" ? storePath : void 0,
					agentId: agentIdFromKey
				}));
			} catch {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Invalid session reference: ${specificKey}`));
				return;
			}
			try {
				const stats = fs.statSync(sessionFile);
				if (stats.isFile()) mergedEntries.push({
					key: resolvedStoreKey,
					sessionId,
					sessionFile,
					label: storeEntry?.label,
					updatedAt: storeEntry?.updatedAt ?? stats.mtimeMs,
					storeEntry
				});
			} catch {}
		} else {
			const discoveredSessions = await discoverAllSessionsForUsage({
				config,
				startMs,
				endMs
			});
			const storeBySessionId = /* @__PURE__ */ new Map();
			for (const [key, entry] of Object.entries(store)) if (entry?.sessionId) storeBySessionId.set(entry.sessionId, {
				key,
				entry
			});
			for (const discovered of discoveredSessions) {
				const storeMatch = storeBySessionId.get(discovered.sessionId);
				if (storeMatch) mergedEntries.push({
					key: storeMatch.key,
					sessionId: discovered.sessionId,
					sessionFile: discovered.sessionFile,
					label: storeMatch.entry.label,
					updatedAt: storeMatch.entry.updatedAt ?? discovered.mtime,
					storeEntry: storeMatch.entry
				});
				else mergedEntries.push({
					key: `agent:${discovered.agentId}:${discovered.sessionId}`,
					sessionId: discovered.sessionId,
					sessionFile: discovered.sessionFile,
					label: void 0,
					updatedAt: discovered.mtime
				});
			}
		}
		mergedEntries.sort((a, b) => b.updatedAt - a.updatedAt);
		const limitedEntries = mergedEntries.slice(0, limit);
		const sessions = [];
		const aggregateTotals = {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			totalCost: 0,
			inputCost: 0,
			outputCost: 0,
			cacheReadCost: 0,
			cacheWriteCost: 0,
			missingCostEntries: 0
		};
		const aggregateMessages = {
			total: 0,
			user: 0,
			assistant: 0,
			toolCalls: 0,
			toolResults: 0,
			errors: 0
		};
		const toolAggregateMap = /* @__PURE__ */ new Map();
		const byModelMap = /* @__PURE__ */ new Map();
		const byProviderMap = /* @__PURE__ */ new Map();
		const byAgentMap = /* @__PURE__ */ new Map();
		const byChannelMap = /* @__PURE__ */ new Map();
		const dailyAggregateMap = /* @__PURE__ */ new Map();
		const latencyTotals = {
			count: 0,
			sum: 0,
			min: Number.POSITIVE_INFINITY,
			max: 0,
			p95Max: 0
		};
		const dailyLatencyMap = /* @__PURE__ */ new Map();
		const modelDailyMap = /* @__PURE__ */ new Map();
		const emptyTotals = () => ({
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			totalCost: 0,
			inputCost: 0,
			outputCost: 0,
			cacheReadCost: 0,
			cacheWriteCost: 0,
			missingCostEntries: 0
		});
		const mergeTotals = (target, source) => {
			target.input += source.input;
			target.output += source.output;
			target.cacheRead += source.cacheRead;
			target.cacheWrite += source.cacheWrite;
			target.totalTokens += source.totalTokens;
			target.totalCost += source.totalCost;
			target.inputCost += source.inputCost;
			target.outputCost += source.outputCost;
			target.cacheReadCost += source.cacheReadCost;
			target.cacheWriteCost += source.cacheWriteCost;
			target.missingCostEntries += source.missingCostEntries;
		};
		for (const merged of limitedEntries) {
			const agentId = parseAgentSessionKey(merged.key)?.agentId;
			const usage = await loadSessionCostSummary({
				sessionId: merged.sessionId,
				sessionEntry: merged.storeEntry,
				sessionFile: merged.sessionFile,
				config,
				agentId,
				startMs,
				endMs
			});
			if (usage) {
				aggregateTotals.input += usage.input;
				aggregateTotals.output += usage.output;
				aggregateTotals.cacheRead += usage.cacheRead;
				aggregateTotals.cacheWrite += usage.cacheWrite;
				aggregateTotals.totalTokens += usage.totalTokens;
				aggregateTotals.totalCost += usage.totalCost;
				aggregateTotals.inputCost += usage.inputCost;
				aggregateTotals.outputCost += usage.outputCost;
				aggregateTotals.cacheReadCost += usage.cacheReadCost;
				aggregateTotals.cacheWriteCost += usage.cacheWriteCost;
				aggregateTotals.missingCostEntries += usage.missingCostEntries;
			}
			const channel = merged.storeEntry?.channel ?? merged.storeEntry?.origin?.provider;
			const chatType = merged.storeEntry?.chatType ?? merged.storeEntry?.origin?.chatType;
			if (usage) {
				if (usage.messageCounts) {
					aggregateMessages.total += usage.messageCounts.total;
					aggregateMessages.user += usage.messageCounts.user;
					aggregateMessages.assistant += usage.messageCounts.assistant;
					aggregateMessages.toolCalls += usage.messageCounts.toolCalls;
					aggregateMessages.toolResults += usage.messageCounts.toolResults;
					aggregateMessages.errors += usage.messageCounts.errors;
				}
				if (usage.toolUsage) for (const tool of usage.toolUsage.tools) toolAggregateMap.set(tool.name, (toolAggregateMap.get(tool.name) ?? 0) + tool.count);
				if (usage.modelUsage) for (const entry of usage.modelUsage) {
					const modelKey = `${entry.provider ?? "unknown"}::${entry.model ?? "unknown"}`;
					const modelExisting = byModelMap.get(modelKey) ?? {
						provider: entry.provider,
						model: entry.model,
						count: 0,
						totals: emptyTotals()
					};
					modelExisting.count += entry.count;
					mergeTotals(modelExisting.totals, entry.totals);
					byModelMap.set(modelKey, modelExisting);
					const providerKey = entry.provider ?? "unknown";
					const providerExisting = byProviderMap.get(providerKey) ?? {
						provider: entry.provider,
						model: void 0,
						count: 0,
						totals: emptyTotals()
					};
					providerExisting.count += entry.count;
					mergeTotals(providerExisting.totals, entry.totals);
					byProviderMap.set(providerKey, providerExisting);
				}
				if (usage.latency) {
					const { count, avgMs, minMs, maxMs, p95Ms } = usage.latency;
					if (count > 0) {
						latencyTotals.count += count;
						latencyTotals.sum += avgMs * count;
						latencyTotals.min = Math.min(latencyTotals.min, minMs);
						latencyTotals.max = Math.max(latencyTotals.max, maxMs);
						latencyTotals.p95Max = Math.max(latencyTotals.p95Max, p95Ms);
					}
				}
				if (usage.dailyLatency) for (const day of usage.dailyLatency) {
					const existing = dailyLatencyMap.get(day.date) ?? {
						date: day.date,
						count: 0,
						sum: 0,
						min: Number.POSITIVE_INFINITY,
						max: 0,
						p95Max: 0
					};
					existing.count += day.count;
					existing.sum += day.avgMs * day.count;
					existing.min = Math.min(existing.min, day.minMs);
					existing.max = Math.max(existing.max, day.maxMs);
					existing.p95Max = Math.max(existing.p95Max, day.p95Ms);
					dailyLatencyMap.set(day.date, existing);
				}
				if (usage.dailyModelUsage) for (const entry of usage.dailyModelUsage) {
					const key = `${entry.date}::${entry.provider ?? "unknown"}::${entry.model ?? "unknown"}`;
					const existing = modelDailyMap.get(key) ?? {
						date: entry.date,
						provider: entry.provider,
						model: entry.model,
						tokens: 0,
						cost: 0,
						count: 0
					};
					existing.tokens += entry.tokens;
					existing.cost += entry.cost;
					existing.count += entry.count;
					modelDailyMap.set(key, existing);
				}
				if (agentId) {
					const agentTotals = byAgentMap.get(agentId) ?? emptyTotals();
					mergeTotals(agentTotals, usage);
					byAgentMap.set(agentId, agentTotals);
				}
				if (channel) {
					const channelTotals = byChannelMap.get(channel) ?? emptyTotals();
					mergeTotals(channelTotals, usage);
					byChannelMap.set(channel, channelTotals);
				}
				if (usage.dailyBreakdown) for (const day of usage.dailyBreakdown) {
					const daily = dailyAggregateMap.get(day.date) ?? {
						date: day.date,
						tokens: 0,
						cost: 0,
						messages: 0,
						toolCalls: 0,
						errors: 0
					};
					daily.tokens += day.tokens;
					daily.cost += day.cost;
					dailyAggregateMap.set(day.date, daily);
				}
				if (usage.dailyMessageCounts) for (const day of usage.dailyMessageCounts) {
					const daily = dailyAggregateMap.get(day.date) ?? {
						date: day.date,
						tokens: 0,
						cost: 0,
						messages: 0,
						toolCalls: 0,
						errors: 0
					};
					daily.messages += day.total;
					daily.toolCalls += day.toolCalls;
					daily.errors += day.errors;
					dailyAggregateMap.set(day.date, daily);
				}
			}
			sessions.push({
				key: merged.key,
				label: merged.label,
				sessionId: merged.sessionId,
				updatedAt: merged.updatedAt,
				agentId,
				channel,
				chatType,
				origin: merged.storeEntry?.origin,
				modelOverride: merged.storeEntry?.modelOverride,
				providerOverride: merged.storeEntry?.providerOverride,
				modelProvider: merged.storeEntry?.modelProvider,
				model: merged.storeEntry?.model,
				usage,
				contextWeight: includeContextWeight ? merged.storeEntry?.systemPromptReport ?? null : void 0
			});
		}
		const formatDateStr = (ms) => {
			const d = new Date(ms);
			return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
		};
		const aggregates = {
			messages: aggregateMessages,
			tools: {
				totalCalls: Array.from(toolAggregateMap.values()).reduce((sum, count) => sum + count, 0),
				uniqueTools: toolAggregateMap.size,
				tools: Array.from(toolAggregateMap.entries()).map(([name, count]) => ({
					name,
					count
				})).toSorted((a, b) => b.count - a.count)
			},
			byModel: Array.from(byModelMap.values()).toSorted((a, b) => {
				const costDiff = b.totals.totalCost - a.totals.totalCost;
				if (costDiff !== 0) return costDiff;
				return b.totals.totalTokens - a.totals.totalTokens;
			}),
			byProvider: Array.from(byProviderMap.values()).toSorted((a, b) => {
				const costDiff = b.totals.totalCost - a.totals.totalCost;
				if (costDiff !== 0) return costDiff;
				return b.totals.totalTokens - a.totals.totalTokens;
			}),
			byAgent: Array.from(byAgentMap.entries()).map(([id, totals]) => ({
				agentId: id,
				totals
			})).toSorted((a, b) => b.totals.totalCost - a.totals.totalCost),
			byChannel: Array.from(byChannelMap.entries()).map(([name, totals]) => ({
				channel: name,
				totals
			})).toSorted((a, b) => b.totals.totalCost - a.totals.totalCost),
			latency: latencyTotals.count > 0 ? {
				count: latencyTotals.count,
				avgMs: latencyTotals.sum / latencyTotals.count,
				minMs: latencyTotals.min === Number.POSITIVE_INFINITY ? 0 : latencyTotals.min,
				maxMs: latencyTotals.max,
				p95Ms: latencyTotals.p95Max
			} : void 0,
			dailyLatency: Array.from(dailyLatencyMap.values()).map((entry) => ({
				date: entry.date,
				count: entry.count,
				avgMs: entry.count ? entry.sum / entry.count : 0,
				minMs: entry.min === Number.POSITIVE_INFINITY ? 0 : entry.min,
				maxMs: entry.max,
				p95Ms: entry.p95Max
			})).toSorted((a, b) => a.date.localeCompare(b.date)),
			modelDaily: Array.from(modelDailyMap.values()).toSorted((a, b) => a.date.localeCompare(b.date) || b.cost - a.cost),
			daily: Array.from(dailyAggregateMap.values()).toSorted((a, b) => a.date.localeCompare(b.date))
		};
		respond(true, {
			updatedAt: now,
			startDate: formatDateStr(startMs),
			endDate: formatDateStr(endMs),
			sessions,
			totals: aggregateTotals,
			aggregates
		}, void 0);
	},
	"sessions.usage.timeseries": async ({ respond, params }) => {
		const key = typeof params?.key === "string" ? params.key.trim() : null;
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key is required for timeseries"));
			return;
		}
		const config = loadConfig();
		const { entry, storePath } = loadSessionEntry(key);
		const parsed = parseAgentSessionKey(key);
		const agentId = parsed?.agentId;
		const rawSessionId = parsed?.rest ?? key;
		const sessionId = entry?.sessionId ?? rawSessionId;
		let sessionFile;
		try {
			sessionFile = resolveSessionFilePath(sessionId, entry, resolveSessionFilePathOptions({
				storePath,
				agentId
			}));
		} catch {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Invalid session key: ${key}`));
			return;
		}
		const timeseries = await loadSessionUsageTimeSeries({
			sessionId,
			sessionEntry: entry,
			sessionFile,
			config,
			agentId,
			maxPoints: 200
		});
		if (!timeseries) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `No transcript found for session: ${key}`));
			return;
		}
		respond(true, timeseries, void 0);
	},
	"sessions.usage.logs": async ({ respond, params }) => {
		const key = typeof params?.key === "string" ? params.key.trim() : null;
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key is required for logs"));
			return;
		}
		const limit = typeof params?.limit === "number" && Number.isFinite(params.limit) ? Math.min(params.limit, 1e3) : 200;
		const config = loadConfig();
		const { entry, storePath } = loadSessionEntry(key);
		const parsed = parseAgentSessionKey(key);
		const agentId = parsed?.agentId;
		const rawSessionId = parsed?.rest ?? key;
		const sessionId = entry?.sessionId ?? rawSessionId;
		let sessionFile;
		try {
			sessionFile = resolveSessionFilePath(sessionId, entry, resolveSessionFilePathOptions({
				storePath,
				agentId
			}));
		} catch {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Invalid session key: ${key}`));
			return;
		}
		const { loadSessionLogs } = await import("./session-cost-usage-CbsU4YHL.js").then((n) => n.a);
		respond(true, { logs: await loadSessionLogs({
			sessionId,
			sessionEntry: entry,
			sessionFile,
			config,
			agentId,
			limit
		}) ?? [] }, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods/voicewake.ts
const voicewakeHandlers = {
	"voicewake.get": async ({ respond }) => {
		try {
			respond(true, { triggers: (await loadVoiceWakeConfig()).triggers });
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"voicewake.set": async ({ params, respond, context }) => {
		if (!Array.isArray(params.triggers)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "voicewake.set requires triggers: string[]"));
			return;
		}
		try {
			const cfg = await setVoiceWakeTriggers(normalizeVoiceWakeTriggers(params.triggers));
			context.broadcastVoiceWakeChanged(cfg.triggers);
			respond(true, { triggers: cfg.triggers });
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	}
};

//#endregion
//#region src/gateway/server-methods/web.ts
const WEB_LOGIN_METHODS = new Set(["web.login.start", "web.login.wait"]);
const resolveWebLoginProvider = () => listChannelPlugins().find((plugin) => (plugin.gatewayMethods ?? []).some((method) => WEB_LOGIN_METHODS.has(method))) ?? null;
const webHandlers = {
	"web.login.start": async ({ params, respond, context }) => {
		if (!validateWebLoginStartParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid web.login.start params: ${formatValidationErrors(validateWebLoginStartParams.errors)}`));
			return;
		}
		try {
			const accountId = typeof params.accountId === "string" ? params.accountId : void 0;
			const provider = resolveWebLoginProvider();
			if (!provider) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "web login provider is not available"));
				return;
			}
			await context.stopChannel(provider.id, accountId);
			if (!provider.gateway?.loginWithQrStart) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `web login is not supported by provider ${provider.id}`));
				return;
			}
			respond(true, await provider.gateway.loginWithQrStart({
				force: Boolean(params.force),
				timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : void 0,
				verbose: Boolean(params.verbose),
				accountId
			}), void 0);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"web.login.wait": async ({ params, respond, context }) => {
		if (!validateWebLoginWaitParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid web.login.wait params: ${formatValidationErrors(validateWebLoginWaitParams.errors)}`));
			return;
		}
		try {
			const accountId = typeof params.accountId === "string" ? params.accountId : void 0;
			const provider = resolveWebLoginProvider();
			if (!provider) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "web login provider is not available"));
				return;
			}
			if (!provider.gateway?.loginWithQrWait) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `web login is not supported by provider ${provider.id}`));
				return;
			}
			const result = await provider.gateway.loginWithQrWait({
				timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : void 0,
				accountId
			});
			if (result.connected) await context.startChannel(provider.id, accountId);
			respond(true, result, void 0);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	}
};

//#endregion
//#region src/wizard/session.ts
function createDeferred() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
var WizardSessionPrompter = class {
	constructor(session) {
		this.session = session;
	}
	async intro(title) {
		await this.prompt({
			type: "note",
			title,
			message: "",
			executor: "client"
		});
	}
	async outro(message) {
		await this.prompt({
			type: "note",
			title: "Done",
			message,
			executor: "client"
		});
	}
	async note(message, title) {
		await this.prompt({
			type: "note",
			title,
			message,
			executor: "client"
		});
	}
	async select(params) {
		return await this.prompt({
			type: "select",
			message: params.message,
			options: params.options.map((opt) => ({
				value: opt.value,
				label: opt.label,
				hint: opt.hint
			})),
			initialValue: params.initialValue,
			executor: "client"
		});
	}
	async multiselect(params) {
		const res = await this.prompt({
			type: "multiselect",
			message: params.message,
			options: params.options.map((opt) => ({
				value: opt.value,
				label: opt.label,
				hint: opt.hint
			})),
			initialValue: params.initialValues,
			executor: "client"
		});
		return Array.isArray(res) ? res : [];
	}
	async text(params) {
		const res = await this.prompt({
			type: "text",
			message: params.message,
			initialValue: params.initialValue,
			placeholder: params.placeholder,
			executor: "client"
		});
		const value = res === null || res === void 0 ? "" : typeof res === "string" ? res : typeof res === "number" || typeof res === "boolean" || typeof res === "bigint" ? String(res) : "";
		const error = params.validate?.(value);
		if (error) throw new Error(error);
		return value;
	}
	async confirm(params) {
		const res = await this.prompt({
			type: "confirm",
			message: params.message,
			initialValue: params.initialValue,
			executor: "client"
		});
		return Boolean(res);
	}
	progress(_label) {
		return {
			update: (_message) => {},
			stop: (_message) => {}
		};
	}
	async prompt(step) {
		return await this.session.awaitAnswer({
			...step,
			id: randomUUID()
		});
	}
};
var WizardSession = class {
	constructor(runner) {
		this.runner = runner;
		this.currentStep = null;
		this.stepDeferred = null;
		this.answerDeferred = /* @__PURE__ */ new Map();
		this.status = "running";
		const prompter = new WizardSessionPrompter(this);
		this.run(prompter);
	}
	async next() {
		if (this.currentStep) return {
			done: false,
			step: this.currentStep,
			status: this.status
		};
		if (this.status !== "running") return {
			done: true,
			status: this.status,
			error: this.error
		};
		if (!this.stepDeferred) this.stepDeferred = createDeferred();
		const step = await this.stepDeferred.promise;
		if (step) return {
			done: false,
			step,
			status: this.status
		};
		return {
			done: true,
			status: this.status,
			error: this.error
		};
	}
	async answer(stepId, value) {
		const deferred = this.answerDeferred.get(stepId);
		if (!deferred) throw new Error("wizard: no pending step");
		this.answerDeferred.delete(stepId);
		this.currentStep = null;
		deferred.resolve(value);
	}
	cancel() {
		if (this.status !== "running") return;
		this.status = "cancelled";
		this.error = "cancelled";
		this.currentStep = null;
		for (const [, deferred] of this.answerDeferred) deferred.reject(new WizardCancelledError());
		this.answerDeferred.clear();
		this.resolveStep(null);
	}
	pushStep(step) {
		this.currentStep = step;
		this.resolveStep(step);
	}
	async run(prompter) {
		try {
			await this.runner(prompter);
			this.status = "done";
		} catch (err) {
			if (err instanceof WizardCancelledError) {
				this.status = "cancelled";
				this.error = err.message;
			} else {
				this.status = "error";
				this.error = String(err);
			}
		} finally {
			this.resolveStep(null);
		}
	}
	async awaitAnswer(step) {
		if (this.status !== "running") throw new Error("wizard: session not running");
		this.pushStep(step);
		const deferred = createDeferred();
		this.answerDeferred.set(step.id, deferred);
		return await deferred.promise;
	}
	resolveStep(step) {
		if (!this.stepDeferred) return;
		const deferred = this.stepDeferred;
		this.stepDeferred = null;
		deferred.resolve(step);
	}
	getStatus() {
		return this.status;
	}
	getError() {
		return this.error;
	}
};

//#endregion
//#region src/gateway/server-methods/wizard.ts
const wizardHandlers = {
	"wizard.start": async ({ params, respond, context }) => {
		if (!validateWizardStartParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid wizard.start params: ${formatValidationErrors(validateWizardStartParams.errors)}`));
			return;
		}
		if (context.findRunningWizard()) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "wizard already running"));
			return;
		}
		const sessionId = randomUUID();
		const opts = {
			mode: params.mode,
			workspace: typeof params.workspace === "string" ? params.workspace : void 0
		};
		const session = new WizardSession((prompter) => context.wizardRunner(opts, defaultRuntime, prompter));
		context.wizardSessions.set(sessionId, session);
		const result = await session.next();
		if (result.done) context.purgeWizardSession(sessionId);
		respond(true, {
			sessionId,
			...result
		}, void 0);
	},
	"wizard.next": async ({ params, respond, context }) => {
		if (!validateWizardNextParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid wizard.next params: ${formatValidationErrors(validateWizardNextParams.errors)}`));
			return;
		}
		const sessionId = params.sessionId;
		const session = context.wizardSessions.get(sessionId);
		if (!session) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "wizard not found"));
			return;
		}
		const answer = params.answer;
		if (answer) {
			if (session.getStatus() !== "running") {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "wizard not running"));
				return;
			}
			try {
				await session.answer(String(answer.stepId ?? ""), answer.value);
			} catch (err) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, formatForLog(err)));
				return;
			}
		}
		const result = await session.next();
		if (result.done) context.purgeWizardSession(sessionId);
		respond(true, result, void 0);
	},
	"wizard.cancel": ({ params, respond, context }) => {
		if (!validateWizardCancelParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid wizard.cancel params: ${formatValidationErrors(validateWizardCancelParams.errors)}`));
			return;
		}
		const sessionId = params.sessionId;
		const session = context.wizardSessions.get(sessionId);
		if (!session) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "wizard not found"));
			return;
		}
		session.cancel();
		const status = {
			status: session.getStatus(),
			error: session.getError()
		};
		context.wizardSessions.delete(sessionId);
		respond(true, status, void 0);
	},
	"wizard.status": ({ params, respond, context }) => {
		if (!validateWizardStatusParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid wizard.status params: ${formatValidationErrors(validateWizardStatusParams.errors)}`));
			return;
		}
		const sessionId = params.sessionId;
		const session = context.wizardSessions.get(sessionId);
		if (!session) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "wizard not found"));
			return;
		}
		const status = {
			status: session.getStatus(),
			error: session.getError()
		};
		if (status.status !== "running") context.wizardSessions.delete(sessionId);
		respond(true, status, void 0);
	}
};

//#endregion
//#region src/gateway/server-methods.ts
const ADMIN_SCOPE$1 = "operator.admin";
const READ_SCOPE = "operator.read";
const WRITE_SCOPE = "operator.write";
const APPROVALS_SCOPE$1 = "operator.approvals";
const PAIRING_SCOPE$1 = "operator.pairing";
const APPROVAL_METHODS = new Set([
	"exec.approval.request",
	"exec.approval.waitDecision",
	"exec.approval.resolve"
]);
const NODE_ROLE_METHODS = new Set([
	"node.invoke.result",
	"node.event",
	"skills.bins"
]);
const PAIRING_METHODS = new Set([
	"node.pair.request",
	"node.pair.list",
	"node.pair.approve",
	"node.pair.reject",
	"node.pair.verify",
	"device.pair.list",
	"device.pair.approve",
	"device.pair.reject",
	"device.token.rotate",
	"device.token.revoke",
	"node.rename"
]);
const ADMIN_METHOD_PREFIXES = ["exec.approvals."];
const READ_METHODS = new Set([
	"health",
	"logs.tail",
	"channels.status",
	"status",
	"usage.status",
	"usage.cost",
	"tts.status",
	"tts.providers",
	"models.list",
	"agents.list",
	"agent.identity.get",
	"skills.status",
	"voicewake.get",
	"sessions.list",
	"sessions.preview",
	"cron.list",
	"cron.status",
	"cron.runs",
	"system-presence",
	"last-heartbeat",
	"node.list",
	"node.describe",
	"chat.history",
	"config.get",
	"talk.config"
]);
const WRITE_METHODS = new Set([
	"send",
	"agent",
	"agent.wait",
	"wake",
	"talk.mode",
	"tts.enable",
	"tts.disable",
	"tts.convert",
	"tts.setProvider",
	"voicewake.set",
	"node.invoke",
	"chat.send",
	"chat.abort",
	"browser.request"
]);
function authorizeGatewayMethod(method, client) {
	if (!client?.connect) return null;
	const role = client.connect.role ?? "operator";
	const scopes = client.connect.scopes ?? [];
	if (NODE_ROLE_METHODS.has(method)) {
		if (role === "node") return null;
		return errorShape(ErrorCodes.INVALID_REQUEST, `unauthorized role: ${role}`);
	}
	if (role === "node") return errorShape(ErrorCodes.INVALID_REQUEST, `unauthorized role: ${role}`);
	if (role !== "operator") return errorShape(ErrorCodes.INVALID_REQUEST, `unauthorized role: ${role}`);
	if (scopes.includes(ADMIN_SCOPE$1)) return null;
	if (APPROVAL_METHODS.has(method) && !scopes.includes(APPROVALS_SCOPE$1)) return errorShape(ErrorCodes.INVALID_REQUEST, "missing scope: operator.approvals");
	if (PAIRING_METHODS.has(method) && !scopes.includes(PAIRING_SCOPE$1)) return errorShape(ErrorCodes.INVALID_REQUEST, "missing scope: operator.pairing");
	if (READ_METHODS.has(method) && !(scopes.includes(READ_SCOPE) || scopes.includes(WRITE_SCOPE))) return errorShape(ErrorCodes.INVALID_REQUEST, "missing scope: operator.read");
	if (WRITE_METHODS.has(method) && !scopes.includes(WRITE_SCOPE)) return errorShape(ErrorCodes.INVALID_REQUEST, "missing scope: operator.write");
	if (APPROVAL_METHODS.has(method)) return null;
	if (PAIRING_METHODS.has(method)) return null;
	if (READ_METHODS.has(method)) return null;
	if (WRITE_METHODS.has(method)) return null;
	if (ADMIN_METHOD_PREFIXES.some((prefix) => method.startsWith(prefix))) return errorShape(ErrorCodes.INVALID_REQUEST, "missing scope: operator.admin");
	if (method.startsWith("config.") || method.startsWith("wizard.") || method.startsWith("update.") || method === "channels.logout" || method === "agents.create" || method === "agents.update" || method === "agents.delete" || method === "skills.install" || method === "skills.update" || method === "cron.add" || method === "cron.update" || method === "cron.remove" || method === "cron.run" || method === "sessions.patch" || method === "sessions.reset" || method === "sessions.delete" || method === "sessions.compact") return errorShape(ErrorCodes.INVALID_REQUEST, "missing scope: operator.admin");
	return errorShape(ErrorCodes.INVALID_REQUEST, "missing scope: operator.admin");
}
const coreGatewayHandlers = {
	...connectHandlers,
	...logsHandlers,
	...voicewakeHandlers,
	...healthHandlers,
	...channelsHandlers,
	...chatHandlers,
	...cronHandlers,
	...deviceHandlers,
	...execApprovalsHandlers,
	...webHandlers,
	...modelsHandlers,
	...configHandlers,
	...wizardHandlers,
	...talkHandlers,
	...ttsHandlers,
	...skillsHandlers,
	...sessionsHandlers,
	...systemHandlers,
	...updateHandlers,
	...nodeHandlers,
	...sendHandlers,
	...usageHandlers,
	...agentHandlers,
	...agentsHandlers,
	...browserHandlers
};
async function handleGatewayRequest(opts) {
	const { req, respond, client, isWebchatConnect, context } = opts;
	const authError = authorizeGatewayMethod(req.method, client);
	if (authError) {
		respond(false, void 0, authError);
		return;
	}
	const handler = opts.extraHandlers?.[req.method] ?? coreGatewayHandlers[req.method];
	if (!handler) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown method: ${req.method}`));
		return;
	}
	await handler({
		req,
		params: req.params ?? {},
		client,
		isWebchatConnect,
		respond,
		context
	});
}

//#endregion
//#region src/gateway/server-methods/exec-approval.ts
function createExecApprovalHandlers(manager, opts) {
	return {
		"exec.approval.request": async ({ params, respond, context }) => {
			if (!validateExecApprovalRequestParams(params)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approval.request params: ${formatValidationErrors(validateExecApprovalRequestParams.errors)}`));
				return;
			}
			const p = params;
			const twoPhase = p.twoPhase === true;
			const timeoutMs = typeof p.timeoutMs === "number" ? p.timeoutMs : 12e4;
			const explicitId = typeof p.id === "string" && p.id.trim().length > 0 ? p.id.trim() : null;
			if (explicitId && manager.getSnapshot(explicitId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "approval id already pending"));
				return;
			}
			const request = {
				command: p.command,
				cwd: p.cwd ?? null,
				host: p.host ?? null,
				security: p.security ?? null,
				ask: p.ask ?? null,
				agentId: p.agentId ?? null,
				resolvedPath: p.resolvedPath ?? null,
				sessionKey: p.sessionKey ?? null
			};
			const record = manager.create(request, timeoutMs, explicitId);
			let decisionPromise;
			try {
				decisionPromise = manager.register(record, timeoutMs);
			} catch (err) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `registration failed: ${String(err)}`));
				return;
			}
			context.broadcast("exec.approval.requested", {
				id: record.id,
				request: record.request,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			}, { dropIfSlow: true });
			opts?.forwarder?.handleRequested({
				id: record.id,
				request: record.request,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			}).catch((err) => {
				context.logGateway?.error?.(`exec approvals: forward request failed: ${String(err)}`);
			});
			if (twoPhase) respond(true, {
				status: "accepted",
				id: record.id,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			}, void 0);
			const decision = await decisionPromise;
			respond(true, {
				id: record.id,
				decision,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			}, void 0);
		},
		"exec.approval.waitDecision": async ({ params, respond }) => {
			const p = params;
			const id = typeof p.id === "string" ? p.id.trim() : "";
			if (!id) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "id is required"));
				return;
			}
			const decisionPromise = manager.awaitDecision(id);
			if (!decisionPromise) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "approval expired or not found"));
				return;
			}
			const snapshot = manager.getSnapshot(id);
			respond(true, {
				id,
				decision: await decisionPromise,
				createdAtMs: snapshot?.createdAtMs,
				expiresAtMs: snapshot?.expiresAtMs
			}, void 0);
		},
		"exec.approval.resolve": async ({ params, respond, client, context }) => {
			if (!validateExecApprovalResolveParams(params)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approval.resolve params: ${formatValidationErrors(validateExecApprovalResolveParams.errors)}`));
				return;
			}
			const p = params;
			const decision = p.decision;
			if (decision !== "allow-once" && decision !== "allow-always" && decision !== "deny") {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid decision"));
				return;
			}
			const resolvedBy = client?.connect?.client?.displayName ?? client?.connect?.client?.id;
			if (!manager.resolve(p.id, decision, resolvedBy ?? null)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown approval id"));
				return;
			}
			context.broadcast("exec.approval.resolved", {
				id: p.id,
				decision,
				resolvedBy,
				ts: Date.now()
			}, { dropIfSlow: true });
			opts?.forwarder?.handleResolved({
				id: p.id,
				decision,
				resolvedBy,
				ts: Date.now()
			}).catch((err) => {
				context.logGateway?.error?.(`exec approvals: forward resolve failed: ${String(err)}`);
			});
			respond(true, { ok: true }, void 0);
		}
	};
}

//#endregion
//#region src/gateway/server-mobile-nodes.ts
const isMobilePlatform = (platform) => {
	const p = typeof platform === "string" ? platform.trim().toLowerCase() : "";
	if (!p) return false;
	return p.startsWith("ios") || p.startsWith("ipados") || p.startsWith("android");
};
function hasConnectedMobileNode(registry) {
	return registry.listConnected().some((n) => isMobilePlatform(n.platform));
}

//#endregion
//#region src/gateway/server-model-catalog.ts
async function loadGatewayModelCatalog() {
	return await loadModelCatalog({ config: loadConfig() });
}

//#endregion
//#region src/gateway/server-node-subscriptions.ts
function createNodeSubscriptionManager() {
	const nodeSubscriptions = /* @__PURE__ */ new Map();
	const sessionSubscribers = /* @__PURE__ */ new Map();
	const toPayloadJSON = (payload) => payload ? JSON.stringify(payload) : null;
	const subscribe = (nodeId, sessionKey) => {
		const normalizedNodeId = nodeId.trim();
		const normalizedSessionKey = sessionKey.trim();
		if (!normalizedNodeId || !normalizedSessionKey) return;
		let nodeSet = nodeSubscriptions.get(normalizedNodeId);
		if (!nodeSet) {
			nodeSet = /* @__PURE__ */ new Set();
			nodeSubscriptions.set(normalizedNodeId, nodeSet);
		}
		if (nodeSet.has(normalizedSessionKey)) return;
		nodeSet.add(normalizedSessionKey);
		let sessionSet = sessionSubscribers.get(normalizedSessionKey);
		if (!sessionSet) {
			sessionSet = /* @__PURE__ */ new Set();
			sessionSubscribers.set(normalizedSessionKey, sessionSet);
		}
		sessionSet.add(normalizedNodeId);
	};
	const unsubscribe = (nodeId, sessionKey) => {
		const normalizedNodeId = nodeId.trim();
		const normalizedSessionKey = sessionKey.trim();
		if (!normalizedNodeId || !normalizedSessionKey) return;
		const nodeSet = nodeSubscriptions.get(normalizedNodeId);
		nodeSet?.delete(normalizedSessionKey);
		if (nodeSet?.size === 0) nodeSubscriptions.delete(normalizedNodeId);
		const sessionSet = sessionSubscribers.get(normalizedSessionKey);
		sessionSet?.delete(normalizedNodeId);
		if (sessionSet?.size === 0) sessionSubscribers.delete(normalizedSessionKey);
	};
	const unsubscribeAll = (nodeId) => {
		const normalizedNodeId = nodeId.trim();
		const nodeSet = nodeSubscriptions.get(normalizedNodeId);
		if (!nodeSet) return;
		for (const sessionKey of nodeSet) {
			const sessionSet = sessionSubscribers.get(sessionKey);
			sessionSet?.delete(normalizedNodeId);
			if (sessionSet?.size === 0) sessionSubscribers.delete(sessionKey);
		}
		nodeSubscriptions.delete(normalizedNodeId);
	};
	const sendToSession = (sessionKey, event, payload, sendEvent) => {
		const normalizedSessionKey = sessionKey.trim();
		if (!normalizedSessionKey || !sendEvent) return;
		const subs = sessionSubscribers.get(normalizedSessionKey);
		if (!subs || subs.size === 0) return;
		const payloadJSON = toPayloadJSON(payload);
		for (const nodeId of subs) sendEvent({
			nodeId,
			event,
			payloadJSON
		});
	};
	const sendToAllSubscribed = (event, payload, sendEvent) => {
		if (!sendEvent) return;
		const payloadJSON = toPayloadJSON(payload);
		for (const nodeId of nodeSubscriptions.keys()) sendEvent({
			nodeId,
			event,
			payloadJSON
		});
	};
	const sendToAllConnected = (event, payload, listConnected, sendEvent) => {
		if (!sendEvent || !listConnected) return;
		const payloadJSON = toPayloadJSON(payload);
		for (const node of listConnected()) sendEvent({
			nodeId: node.nodeId,
			event,
			payloadJSON
		});
	};
	const clear = () => {
		nodeSubscriptions.clear();
		sessionSubscribers.clear();
	};
	return {
		subscribe,
		unsubscribe,
		unsubscribeAll,
		sendToSession,
		sendToAllSubscribed,
		sendToAllConnected,
		clear
	};
}

//#endregion
//#region src/gateway/server-plugins.ts
function loadGatewayPlugins(params) {
	const pluginRegistry = loadOpenClawPlugins({
		config: params.cfg,
		workspaceDir: params.workspaceDir,
		logger: {
			info: (msg) => params.log.info(msg),
			warn: (msg) => params.log.warn(msg),
			error: (msg) => params.log.error(msg),
			debug: (msg) => params.log.debug(msg)
		},
		coreGatewayHandlers: params.coreGatewayHandlers
	});
	const pluginMethods = Object.keys(pluginRegistry.gatewayHandlers);
	const gatewayMethods = Array.from(new Set([...params.baseMethods, ...pluginMethods]));
	if (pluginRegistry.diagnostics.length > 0) for (const diag of pluginRegistry.diagnostics) {
		const details = [diag.pluginId ? `plugin=${diag.pluginId}` : null, diag.source ? `source=${diag.source}` : null].filter((entry) => Boolean(entry)).join(", ");
		const message = details ? `[plugins] ${diag.message} (${details})` : `[plugins] ${diag.message}`;
		if (diag.level === "error") params.log.error(message);
		else params.log.info(message);
	}
	return {
		pluginRegistry,
		gatewayMethods
	};
}

//#endregion
//#region src/gateway/hooks-mapping.ts
const hookPresetMappings = { gmail: [{
	id: "gmail",
	match: { path: "gmail" },
	action: "agent",
	wakeMode: "now",
	name: "Gmail",
	sessionKey: "hook:gmail:{{messages[0].id}}",
	messageTemplate: "New email from {{messages[0].from}}\nSubject: {{messages[0].subject}}\n{{messages[0].snippet}}\n{{messages[0].body}}"
}] };
const transformCache = /* @__PURE__ */ new Map();
function resolveHookMappings(hooks) {
	const presets = hooks?.presets ?? [];
	const gmailAllowUnsafe = hooks?.gmail?.allowUnsafeExternalContent;
	const mappings = [];
	if (hooks?.mappings) mappings.push(...hooks.mappings);
	for (const preset of presets) {
		const presetMappings = hookPresetMappings[preset];
		if (!presetMappings) continue;
		if (preset === "gmail" && typeof gmailAllowUnsafe === "boolean") {
			mappings.push(...presetMappings.map((mapping) => ({
				...mapping,
				allowUnsafeExternalContent: gmailAllowUnsafe
			})));
			continue;
		}
		mappings.push(...presetMappings);
	}
	if (mappings.length === 0) return [];
	const configDir = path.dirname(CONFIG_PATH);
	const transformsDir = hooks?.transformsDir ? resolvePath(configDir, hooks.transformsDir) : configDir;
	return mappings.map((mapping, index) => normalizeHookMapping(mapping, index, transformsDir));
}
async function applyHookMappings(mappings, ctx) {
	if (mappings.length === 0) return null;
	for (const mapping of mappings) {
		if (!mappingMatches(mapping, ctx)) continue;
		const base = buildActionFromMapping(mapping, ctx);
		if (!base.ok) return base;
		let override = null;
		if (mapping.transform) {
			override = await (await loadTransform(mapping.transform))(ctx);
			if (override === null) return {
				ok: true,
				action: null,
				skipped: true
			};
		}
		if (!base.action) return {
			ok: true,
			action: null,
			skipped: true
		};
		const merged = mergeAction(base.action, override, mapping.action);
		if (!merged.ok) return merged;
		return merged;
	}
	return null;
}
function normalizeHookMapping(mapping, index, transformsDir) {
	const id = mapping.id?.trim() || `mapping-${index + 1}`;
	const matchPath = normalizeMatchPath(mapping.match?.path);
	const matchSource = mapping.match?.source?.trim();
	const action = mapping.action ?? "agent";
	const wakeMode = mapping.wakeMode ?? "now";
	const transform = mapping.transform ? {
		modulePath: resolvePath(transformsDir, mapping.transform.module),
		exportName: mapping.transform.export?.trim() || void 0
	} : void 0;
	return {
		id,
		matchPath,
		matchSource,
		action,
		wakeMode,
		name: mapping.name,
		agentId: mapping.agentId?.trim() || void 0,
		sessionKey: mapping.sessionKey,
		messageTemplate: mapping.messageTemplate,
		textTemplate: mapping.textTemplate,
		deliver: mapping.deliver,
		allowUnsafeExternalContent: mapping.allowUnsafeExternalContent,
		channel: mapping.channel,
		to: mapping.to,
		model: mapping.model,
		thinking: mapping.thinking,
		timeoutSeconds: mapping.timeoutSeconds,
		transform
	};
}
function mappingMatches(mapping, ctx) {
	if (mapping.matchPath) {
		if (mapping.matchPath !== normalizeMatchPath(ctx.path)) return false;
	}
	if (mapping.matchSource) {
		const source = typeof ctx.payload.source === "string" ? ctx.payload.source : void 0;
		if (!source || source !== mapping.matchSource) return false;
	}
	return true;
}
function buildActionFromMapping(mapping, ctx) {
	if (mapping.action === "wake") return {
		ok: true,
		action: {
			kind: "wake",
			text: renderTemplate(mapping.textTemplate ?? "", ctx),
			mode: mapping.wakeMode ?? "now"
		}
	};
	return {
		ok: true,
		action: {
			kind: "agent",
			message: renderTemplate(mapping.messageTemplate ?? "", ctx),
			name: renderOptional(mapping.name, ctx),
			agentId: mapping.agentId,
			wakeMode: mapping.wakeMode ?? "now",
			sessionKey: renderOptional(mapping.sessionKey, ctx),
			deliver: mapping.deliver,
			allowUnsafeExternalContent: mapping.allowUnsafeExternalContent,
			channel: mapping.channel,
			to: renderOptional(mapping.to, ctx),
			model: renderOptional(mapping.model, ctx),
			thinking: renderOptional(mapping.thinking, ctx),
			timeoutSeconds: mapping.timeoutSeconds
		}
	};
}
function mergeAction(base, override, defaultAction) {
	if (!override) return validateAction(base);
	if ((override.kind ?? base.kind ?? defaultAction) === "wake") {
		const baseWake = base.kind === "wake" ? base : void 0;
		return validateAction({
			kind: "wake",
			text: typeof override.text === "string" ? override.text : baseWake?.text ?? "",
			mode: override.mode === "next-heartbeat" ? "next-heartbeat" : baseWake?.mode ?? "now"
		});
	}
	const baseAgent = base.kind === "agent" ? base : void 0;
	return validateAction({
		kind: "agent",
		message: typeof override.message === "string" ? override.message : baseAgent?.message ?? "",
		wakeMode: override.wakeMode === "next-heartbeat" ? "next-heartbeat" : baseAgent?.wakeMode ?? "now",
		name: override.name ?? baseAgent?.name,
		agentId: override.agentId ?? baseAgent?.agentId,
		sessionKey: override.sessionKey ?? baseAgent?.sessionKey,
		deliver: typeof override.deliver === "boolean" ? override.deliver : baseAgent?.deliver,
		allowUnsafeExternalContent: typeof override.allowUnsafeExternalContent === "boolean" ? override.allowUnsafeExternalContent : baseAgent?.allowUnsafeExternalContent,
		channel: override.channel ?? baseAgent?.channel,
		to: override.to ?? baseAgent?.to,
		model: override.model ?? baseAgent?.model,
		thinking: override.thinking ?? baseAgent?.thinking,
		timeoutSeconds: override.timeoutSeconds ?? baseAgent?.timeoutSeconds
	});
}
function validateAction(action) {
	if (action.kind === "wake") {
		if (!action.text?.trim()) return {
			ok: false,
			error: "hook mapping requires text"
		};
		return {
			ok: true,
			action
		};
	}
	if (!action.message?.trim()) return {
		ok: false,
		error: "hook mapping requires message"
	};
	return {
		ok: true,
		action
	};
}
async function loadTransform(transform) {
	const cached = transformCache.get(transform.modulePath);
	if (cached) return cached;
	const fn = resolveTransformFn(await import(pathToFileURL(transform.modulePath).href), transform.exportName);
	transformCache.set(transform.modulePath, fn);
	return fn;
}
function resolveTransformFn(mod, exportName) {
	const candidate = exportName ? mod[exportName] : mod.default ?? mod.transform;
	if (typeof candidate !== "function") throw new Error("hook transform module must export a function");
	return candidate;
}
function resolvePath(baseDir, target) {
	if (!target) return baseDir;
	if (path.isAbsolute(target)) return target;
	return path.join(baseDir, target);
}
function normalizeMatchPath(raw) {
	if (!raw) return;
	const trimmed = raw.trim();
	if (!trimmed) return;
	return trimmed.replace(/^\/+/, "").replace(/\/+$/, "");
}
function renderOptional(value, ctx) {
	if (!value) return;
	const rendered = renderTemplate(value, ctx).trim();
	return rendered ? rendered : void 0;
}
function renderTemplate(template, ctx) {
	if (!template) return "";
	return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
		const value = resolveTemplateExpr(expr.trim(), ctx);
		if (value === void 0 || value === null) return "";
		if (typeof value === "string") return value;
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		return JSON.stringify(value);
	});
}
function resolveTemplateExpr(expr, ctx) {
	if (expr === "path") return ctx.path;
	if (expr === "now") return (/* @__PURE__ */ new Date()).toISOString();
	if (expr.startsWith("headers.")) return getByPath(ctx.headers, expr.slice(8));
	if (expr.startsWith("query.")) return getByPath(Object.fromEntries(ctx.url.searchParams.entries()), expr.slice(6));
	if (expr.startsWith("payload.")) return getByPath(ctx.payload, expr.slice(8));
	return getByPath(ctx.payload, expr);
}
function getByPath(input, pathExpr) {
	if (!pathExpr) return;
	const parts = [];
	const re = /([^.[\]]+)|(\[(\d+)\])/g;
	let match = re.exec(pathExpr);
	while (match) {
		if (match[1]) parts.push(match[1]);
		else if (match[3]) parts.push(Number(match[3]));
		match = re.exec(pathExpr);
	}
	let current = input;
	for (const part of parts) {
		if (current === null || current === void 0) return;
		if (typeof part === "number") {
			if (!Array.isArray(current)) return;
			current = current[part];
			continue;
		}
		if (typeof current !== "object") return;
		current = current[part];
	}
	return current;
}

//#endregion
//#region src/gateway/hooks.ts
const DEFAULT_HOOKS_PATH = "/hooks";
const DEFAULT_HOOKS_MAX_BODY_BYTES = 256 * 1024;
function resolveHooksConfig(cfg) {
	if (cfg.hooks?.enabled !== true) return null;
	const token = cfg.hooks?.token?.trim();
	if (!token) throw new Error("hooks.enabled requires hooks.token");
	const rawPath = cfg.hooks?.path?.trim() || DEFAULT_HOOKS_PATH;
	const withSlash = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
	const trimmed = withSlash.length > 1 ? withSlash.replace(/\/+$/, "") : withSlash;
	if (trimmed === "/") throw new Error("hooks.path may not be '/'");
	const maxBodyBytes = cfg.hooks?.maxBodyBytes && cfg.hooks.maxBodyBytes > 0 ? cfg.hooks.maxBodyBytes : DEFAULT_HOOKS_MAX_BODY_BYTES;
	const mappings = resolveHookMappings(cfg.hooks);
	const defaultAgentId = resolveDefaultAgentId(cfg);
	const knownAgentIds = resolveKnownAgentIds(cfg, defaultAgentId);
	const allowedAgentIds = resolveAllowedAgentIds(cfg.hooks?.allowedAgentIds);
	const defaultSessionKey = resolveSessionKey$1(cfg.hooks?.defaultSessionKey);
	const allowedSessionKeyPrefixes = resolveAllowedSessionKeyPrefixes(cfg.hooks?.allowedSessionKeyPrefixes);
	if (defaultSessionKey && allowedSessionKeyPrefixes && !isSessionKeyAllowedByPrefix(defaultSessionKey, allowedSessionKeyPrefixes)) throw new Error("hooks.defaultSessionKey must match hooks.allowedSessionKeyPrefixes");
	if (!defaultSessionKey && allowedSessionKeyPrefixes && !isSessionKeyAllowedByPrefix("hook:example", allowedSessionKeyPrefixes)) throw new Error("hooks.allowedSessionKeyPrefixes must include 'hook:' when hooks.defaultSessionKey is unset");
	return {
		basePath: trimmed,
		token,
		maxBodyBytes,
		mappings,
		agentPolicy: {
			defaultAgentId,
			knownAgentIds,
			allowedAgentIds
		},
		sessionPolicy: {
			defaultSessionKey,
			allowRequestSessionKey: cfg.hooks?.allowRequestSessionKey === true,
			allowedSessionKeyPrefixes
		}
	};
}
function resolveKnownAgentIds(cfg, defaultAgentId) {
	const known = new Set(listAgentIds(cfg));
	known.add(defaultAgentId);
	return known;
}
function resolveAllowedAgentIds(raw) {
	if (!Array.isArray(raw)) return;
	const allowed = /* @__PURE__ */ new Set();
	let hasWildcard = false;
	for (const entry of raw) {
		const trimmed = entry.trim();
		if (!trimmed) continue;
		if (trimmed === "*") {
			hasWildcard = true;
			break;
		}
		allowed.add(normalizeAgentId(trimmed));
	}
	if (hasWildcard) return;
	return allowed;
}
function resolveSessionKey$1(raw) {
	const value = raw?.trim();
	return value ? value : void 0;
}
function normalizeSessionKeyPrefix(raw) {
	const value = raw.trim().toLowerCase();
	return value ? value : void 0;
}
function resolveAllowedSessionKeyPrefixes(raw) {
	if (!Array.isArray(raw)) return;
	const set = /* @__PURE__ */ new Set();
	for (const prefix of raw) {
		const normalized = normalizeSessionKeyPrefix(prefix);
		if (!normalized) continue;
		set.add(normalized);
	}
	return set.size > 0 ? Array.from(set) : void 0;
}
function isSessionKeyAllowedByPrefix(sessionKey, prefixes) {
	const normalized = sessionKey.trim().toLowerCase();
	if (!normalized) return false;
	return prefixes.some((prefix) => normalized.startsWith(prefix));
}
function extractHookToken(req) {
	const auth = typeof req.headers.authorization === "string" ? req.headers.authorization.trim() : "";
	if (auth.toLowerCase().startsWith("bearer ")) {
		const token = auth.slice(7).trim();
		if (token) return token;
	}
	const headerToken = typeof req.headers["x-openclaw-token"] === "string" ? req.headers["x-openclaw-token"].trim() : "";
	if (headerToken) return headerToken;
}
async function readJsonBody(req, maxBytes) {
	const result = await readJsonBodyWithLimit(req, {
		maxBytes,
		emptyObjectOnEmpty: true
	});
	if (result.ok) return result;
	if (result.code === "PAYLOAD_TOO_LARGE") return {
		ok: false,
		error: "payload too large"
	};
	if (result.code === "REQUEST_BODY_TIMEOUT") return {
		ok: false,
		error: "request body timeout"
	};
	if (result.code === "CONNECTION_CLOSED") return {
		ok: false,
		error: requestBodyErrorToText("CONNECTION_CLOSED")
	};
	return {
		ok: false,
		error: result.error
	};
}
function normalizeHookHeaders(req) {
	const headers = {};
	for (const [key, value] of Object.entries(req.headers)) if (typeof value === "string") headers[key.toLowerCase()] = value;
	else if (Array.isArray(value) && value.length > 0) headers[key.toLowerCase()] = value.join(", ");
	return headers;
}
function normalizeWakePayload(payload) {
	const text = typeof payload.text === "string" ? payload.text.trim() : "";
	if (!text) return {
		ok: false,
		error: "text required"
	};
	return {
		ok: true,
		value: {
			text,
			mode: payload.mode === "next-heartbeat" ? "next-heartbeat" : "now"
		}
	};
}
const listHookChannelValues = () => ["last", ...listChannelPlugins().map((plugin) => plugin.id)];
const getHookChannelSet = () => new Set(listHookChannelValues());
const getHookChannelError = () => `channel must be ${listHookChannelValues().join("|")}`;
function resolveHookChannel(raw) {
	if (raw === void 0) return "last";
	if (typeof raw !== "string") return null;
	const normalized = normalizeMessageChannel(raw);
	if (!normalized || !getHookChannelSet().has(normalized)) return null;
	return normalized;
}
function resolveHookDeliver(raw) {
	return raw !== false;
}
function resolveHookTargetAgentId(hooksConfig, agentId) {
	const raw = agentId?.trim();
	if (!raw) return;
	const normalized = normalizeAgentId(raw);
	if (hooksConfig.agentPolicy.knownAgentIds.has(normalized)) return normalized;
	return hooksConfig.agentPolicy.defaultAgentId;
}
function isHookAgentAllowed(hooksConfig, agentId) {
	const raw = agentId?.trim();
	if (!raw) return true;
	const allowed = hooksConfig.agentPolicy.allowedAgentIds;
	if (allowed === void 0) return true;
	const resolved = resolveHookTargetAgentId(hooksConfig, raw);
	return resolved ? allowed.has(resolved) : false;
}
const getHookAgentPolicyError = () => "agentId is not allowed by hooks.allowedAgentIds";
const getHookSessionKeyRequestPolicyError = () => "sessionKey is disabled for external /hooks/agent payloads; set hooks.allowRequestSessionKey=true to enable";
const getHookSessionKeyPrefixError = (prefixes) => `sessionKey must start with one of: ${prefixes.join(", ")}`;
function resolveHookSessionKey(params) {
	const requested = resolveSessionKey$1(params.sessionKey);
	if (requested) {
		if (params.source === "request" && !params.hooksConfig.sessionPolicy.allowRequestSessionKey) return {
			ok: false,
			error: getHookSessionKeyRequestPolicyError()
		};
		const allowedPrefixes = params.hooksConfig.sessionPolicy.allowedSessionKeyPrefixes;
		if (allowedPrefixes && !isSessionKeyAllowedByPrefix(requested, allowedPrefixes)) return {
			ok: false,
			error: getHookSessionKeyPrefixError(allowedPrefixes)
		};
		return {
			ok: true,
			value: requested
		};
	}
	const defaultSessionKey = params.hooksConfig.sessionPolicy.defaultSessionKey;
	if (defaultSessionKey) return {
		ok: true,
		value: defaultSessionKey
	};
	const generated = `hook:${(params.idFactory ?? randomUUID)()}`;
	const allowedPrefixes = params.hooksConfig.sessionPolicy.allowedSessionKeyPrefixes;
	if (allowedPrefixes && !isSessionKeyAllowedByPrefix(generated, allowedPrefixes)) return {
		ok: false,
		error: getHookSessionKeyPrefixError(allowedPrefixes)
	};
	return {
		ok: true,
		value: generated
	};
}
function normalizeAgentPayload(payload) {
	const message = typeof payload.message === "string" ? payload.message.trim() : "";
	if (!message) return {
		ok: false,
		error: "message required"
	};
	const nameRaw = payload.name;
	const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : "Hook";
	const agentIdRaw = payload.agentId;
	const agentId = typeof agentIdRaw === "string" && agentIdRaw.trim() ? agentIdRaw.trim() : void 0;
	const wakeMode = payload.wakeMode === "next-heartbeat" ? "next-heartbeat" : "now";
	const sessionKeyRaw = payload.sessionKey;
	const sessionKey = typeof sessionKeyRaw === "string" && sessionKeyRaw.trim() ? sessionKeyRaw.trim() : void 0;
	const channel = resolveHookChannel(payload.channel);
	if (!channel) return {
		ok: false,
		error: getHookChannelError()
	};
	const toRaw = payload.to;
	const to = typeof toRaw === "string" && toRaw.trim() ? toRaw.trim() : void 0;
	const modelRaw = payload.model;
	const model = typeof modelRaw === "string" && modelRaw.trim() ? modelRaw.trim() : void 0;
	if (modelRaw !== void 0 && !model) return {
		ok: false,
		error: "model required"
	};
	const deliver = resolveHookDeliver(payload.deliver);
	const thinkingRaw = payload.thinking;
	const thinking = typeof thinkingRaw === "string" && thinkingRaw.trim() ? thinkingRaw.trim() : void 0;
	const timeoutRaw = payload.timeoutSeconds;
	return {
		ok: true,
		value: {
			message,
			name,
			agentId,
			wakeMode,
			sessionKey,
			deliver,
			channel,
			to,
			model,
			thinking,
			timeoutSeconds: typeof timeoutRaw === "number" && Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? Math.floor(timeoutRaw) : void 0
		}
	};
}

//#endregion
//#region src/gateway/server-browser.ts
async function startBrowserControlServerIfEnabled() {
	if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_BROWSER_CONTROL_SERVER)) return null;
	const override = process.env.OPENCLAW_BROWSER_CONTROL_MODULE?.trim();
	const mod = override ? await import(override) : await import("./control-service-BKUh8p7b.js").then((n) => n.t);
	const start = typeof mod.startBrowserControlServiceFromConfig === "function" ? mod.startBrowserControlServiceFromConfig : mod.startBrowserControlServerFromConfig;
	const stop = typeof mod.stopBrowserControlService === "function" ? mod.stopBrowserControlService : mod.stopBrowserControlServer;
	if (!start) return null;
	await start();
	return { stop: stop ?? (async () => {}) };
}

//#endregion
//#region src/gateway/server-reload-handlers.ts
function createGatewayReloadHandlers(params) {
	const applyHotReload = async (plan, nextConfig) => {
		setGatewaySigusr1RestartPolicy({ allowExternal: nextConfig.commands?.restart === true });
		const state = params.getState();
		const nextState = { ...state };
		if (plan.reloadHooks) try {
			nextState.hooksConfig = resolveHooksConfig(nextConfig);
		} catch (err) {
			params.logHooks.warn(`hooks config reload failed: ${String(err)}`);
		}
		if (plan.restartHeartbeat) nextState.heartbeatRunner.updateConfig(nextConfig);
		resetDirectoryCache();
		if (plan.restartCron) {
			state.cronState.cron.stop();
			nextState.cronState = buildGatewayCronService({
				cfg: nextConfig,
				deps: params.deps,
				broadcast: params.broadcast
			});
			nextState.cronState.cron.start().catch((err) => params.logCron.error(`failed to start: ${String(err)}`));
		}
		if (plan.restartBrowserControl) {
			if (state.browserControl) await state.browserControl.stop().catch(() => {});
			try {
				nextState.browserControl = await startBrowserControlServerIfEnabled();
			} catch (err) {
				params.logBrowser.error(`server failed to start: ${String(err)}`);
			}
		}
		if (plan.restartGmailWatcher) {
			await stopGmailWatcher().catch(() => {});
			if (!isTruthyEnvValue(process.env.OPENCLAW_SKIP_GMAIL_WATCHER)) try {
				const gmailResult = await startGmailWatcher(nextConfig);
				if (gmailResult.started) params.logHooks.info("gmail watcher started");
				else if (gmailResult.reason && gmailResult.reason !== "hooks not enabled" && gmailResult.reason !== "no gmail account configured") params.logHooks.warn(`gmail watcher not started: ${gmailResult.reason}`);
			} catch (err) {
				params.logHooks.error(`gmail watcher failed to start: ${String(err)}`);
			}
			else params.logHooks.info("skipping gmail watcher restart (OPENCLAW_SKIP_GMAIL_WATCHER=1)");
		}
		if (plan.restartChannels.size > 0) if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS)) params.logChannels.info("skipping channel reload (OPENCLAW_SKIP_CHANNELS=1 or OPENCLAW_SKIP_PROVIDERS=1)");
		else {
			const restartChannel = async (name) => {
				params.logChannels.info(`restarting ${name} channel`);
				await params.stopChannel(name);
				await params.startChannel(name);
			};
			for (const channel of plan.restartChannels) await restartChannel(channel);
		}
		setCommandLaneConcurrency(CommandLane.Cron, nextConfig.cron?.maxConcurrentRuns ?? 1);
		setCommandLaneConcurrency(CommandLane.Main, resolveAgentMaxConcurrent(nextConfig));
		setCommandLaneConcurrency(CommandLane.Subagent, resolveSubagentMaxConcurrent(nextConfig));
		if (plan.hotReasons.length > 0) params.logReload.info(`config hot reload applied (${plan.hotReasons.join(", ")})`);
		else if (plan.noopPaths.length > 0) params.logReload.info(`config change applied (dynamic reads: ${plan.noopPaths.join(", ")})`);
		params.setState(nextState);
	};
	let restartPending = false;
	const requestGatewayRestart = (plan, nextConfig) => {
		setGatewaySigusr1RestartPolicy({ allowExternal: nextConfig.commands?.restart === true });
		const reasons = plan.restartReasons.length ? plan.restartReasons.join(", ") : plan.changedPaths.join(", ");
		if (process.listenerCount("SIGUSR1") === 0) {
			params.logReload.warn("no SIGUSR1 listener found; restart skipped");
			return;
		}
		const getActiveCounts = () => {
			const queueSize = getTotalQueueSize();
			const pendingReplies = getTotalPendingReplies();
			const embeddedRuns = getActiveEmbeddedRunCount();
			return {
				queueSize,
				pendingReplies,
				embeddedRuns,
				totalActive: queueSize + pendingReplies + embeddedRuns
			};
		};
		const formatActiveDetails = (counts) => {
			const details = [];
			if (counts.queueSize > 0) details.push(`${counts.queueSize} operation(s)`);
			if (counts.pendingReplies > 0) details.push(`${counts.pendingReplies} reply(ies)`);
			if (counts.embeddedRuns > 0) details.push(`${counts.embeddedRuns} embedded run(s)`);
			return details;
		};
		const active = getActiveCounts();
		if (active.totalActive > 0) {
			if (restartPending) {
				params.logReload.info(`config change requires gateway restart (${reasons}) — already waiting for operations to complete`);
				return;
			}
			restartPending = true;
			const initialDetails = formatActiveDetails(active);
			params.logReload.warn(`config change requires gateway restart (${reasons}) — deferring until ${initialDetails.join(", ")} complete`);
			deferGatewayRestartUntilIdle({
				getPendingCount: () => getActiveCounts().totalActive,
				hooks: {
					onReady: () => {
						restartPending = false;
						params.logReload.info("all operations and replies completed; restarting gateway now");
					},
					onTimeout: (_pending, elapsedMs) => {
						const remaining = formatActiveDetails(getActiveCounts());
						restartPending = false;
						params.logReload.warn(`restart timeout after ${elapsedMs}ms with ${remaining.join(", ")} still active; restarting anyway`);
					},
					onCheckError: (err) => {
						restartPending = false;
						params.logReload.warn(`restart deferral check failed (${String(err)}); restarting gateway now`);
					}
				}
			});
		} else {
			params.logReload.warn(`config change requires gateway restart (${reasons})`);
			if (!emitGatewayRestart()) params.logReload.info("gateway restart already scheduled; skipping duplicate signal");
		}
	};
	return {
		applyHotReload,
		requestGatewayRestart
	};
}

//#endregion
//#region src/gateway/server-runtime-config.ts
async function resolveGatewayRuntimeConfig(params) {
	const bindMode = params.bind ?? params.cfg.gateway?.bind ?? "loopback";
	const customBindHost = params.cfg.gateway?.customBindHost;
	const bindHost = params.host ?? await resolveGatewayBindHost(bindMode, customBindHost);
	const controlUiEnabled = params.controlUiEnabled ?? params.cfg.gateway?.controlUi?.enabled ?? true;
	const openAiChatCompletionsEnabled = params.openAiChatCompletionsEnabled ?? params.cfg.gateway?.http?.endpoints?.chatCompletions?.enabled ?? false;
	const openResponsesConfig = params.cfg.gateway?.http?.endpoints?.responses;
	const openResponsesEnabled = params.openResponsesEnabled ?? openResponsesConfig?.enabled ?? false;
	const controlUiBasePath = normalizeControlUiBasePath(params.cfg.gateway?.controlUi?.basePath);
	const controlUiRootRaw = params.cfg.gateway?.controlUi?.root;
	const controlUiRoot = typeof controlUiRootRaw === "string" && controlUiRootRaw.trim().length > 0 ? controlUiRootRaw.trim() : void 0;
	const authBase = params.cfg.gateway?.auth ?? {};
	const authOverrides = params.auth ?? {};
	const authConfig = {
		...authBase,
		...authOverrides
	};
	const tailscaleBase = params.cfg.gateway?.tailscale ?? {};
	const tailscaleOverrides = params.tailscale ?? {};
	const tailscaleConfig = {
		...tailscaleBase,
		...tailscaleOverrides
	};
	const tailscaleMode = tailscaleConfig.mode ?? "off";
	const resolvedAuth = resolveGatewayAuth({
		authConfig,
		env: process.env,
		tailscaleMode
	});
	const authMode = resolvedAuth.mode;
	const hasToken = typeof resolvedAuth.token === "string" && resolvedAuth.token.trim().length > 0;
	const hasPassword = typeof resolvedAuth.password === "string" && resolvedAuth.password.trim().length > 0;
	const hasSharedSecret = authMode === "token" && hasToken || authMode === "password" && hasPassword;
	const hooksConfig = resolveHooksConfig(params.cfg);
	const canvasHostEnabled = process.env.OPENCLAW_SKIP_CANVAS_HOST !== "1" && params.cfg.canvasHost?.enabled !== false;
	assertGatewayAuthConfigured(resolvedAuth);
	if (tailscaleMode === "funnel" && authMode !== "password") throw new Error("tailscale funnel requires gateway auth mode=password (set gateway.auth.password or OPENCLAW_GATEWAY_PASSWORD)");
	if (tailscaleMode !== "off" && !isLoopbackHost(bindHost)) throw new Error("tailscale serve/funnel requires gateway bind=loopback (127.0.0.1)");
	if (!isLoopbackHost(bindHost) && !hasSharedSecret) throw new Error(`refusing to bind gateway to ${bindHost}:${params.port} without auth (set gateway.auth.token/password, or set OPENCLAW_GATEWAY_TOKEN/OPENCLAW_GATEWAY_PASSWORD)`);
	return {
		bindHost,
		controlUiEnabled,
		openAiChatCompletionsEnabled,
		openResponsesEnabled,
		openResponsesConfig: openResponsesConfig ? {
			...openResponsesConfig,
			enabled: openResponsesEnabled
		} : void 0,
		controlUiBasePath,
		controlUiRoot,
		resolvedAuth,
		authMode,
		tailscaleConfig,
		tailscaleMode,
		hooksConfig,
		canvasHostEnabled
	};
}

//#endregion
//#region src/infra/fs-safe.ts
var SafeOpenError = class extends Error {
	constructor(code, message) {
		super(message);
		this.code = code;
		this.name = "SafeOpenError";
	}
};
const NOT_FOUND_CODES = new Set(["ENOENT", "ENOTDIR"]);
const ensureTrailingSep = (value) => value.endsWith(path.sep) ? value : value + path.sep;
const isNodeError = (err) => Boolean(err && typeof err === "object" && "code" in err);
const isNotFoundError = (err) => isNodeError(err) && typeof err.code === "string" && NOT_FOUND_CODES.has(err.code);
const isSymlinkOpenError = (err) => isNodeError(err) && (err.code === "ELOOP" || err.code === "EINVAL" || err.code === "ENOTSUP");
async function openFileWithinRoot(params) {
	let rootReal;
	try {
		rootReal = await fsPromises.realpath(params.rootDir);
	} catch (err) {
		if (isNotFoundError(err)) throw new SafeOpenError("not-found", "root dir not found");
		throw err;
	}
	const rootWithSep = ensureTrailingSep(rootReal);
	const resolved = path.resolve(rootWithSep, params.relativePath);
	if (!resolved.startsWith(rootWithSep)) throw new SafeOpenError("invalid-path", "path escapes root");
	const supportsNoFollow = process.platform !== "win32" && "O_NOFOLLOW" in constants;
	const flags = constants.O_RDONLY | (supportsNoFollow ? constants.O_NOFOLLOW : 0);
	let handle;
	try {
		handle = await fsPromises.open(resolved, flags);
	} catch (err) {
		if (isNotFoundError(err)) throw new SafeOpenError("not-found", "file not found");
		if (isSymlinkOpenError(err)) throw new SafeOpenError("invalid-path", "symlink open blocked");
		throw err;
	}
	try {
		if ((await fsPromises.lstat(resolved).catch(() => null))?.isSymbolicLink()) throw new SafeOpenError("invalid-path", "symlink not allowed");
		const realPath = await fsPromises.realpath(resolved);
		if (!realPath.startsWith(rootWithSep)) throw new SafeOpenError("invalid-path", "path escapes root");
		const stat = await handle.stat();
		if (!stat.isFile()) throw new SafeOpenError("invalid-path", "not a file");
		const realStat = await fsPromises.stat(realPath);
		if (stat.ino !== realStat.ino || stat.dev !== realStat.dev) throw new SafeOpenError("invalid-path", "path mismatch");
		return {
			handle,
			realPath,
			stat
		};
	} catch (err) {
		await handle.close().catch(() => {});
		if (err instanceof SafeOpenError) throw err;
		if (isNotFoundError(err)) throw new SafeOpenError("not-found", "file not found");
		throw err;
	}
}

//#endregion
//#region src/canvas-host/a2ui.ts
const A2UI_PATH = "/__openclaw__/a2ui";
const CANVAS_HOST_PATH = "/__openclaw__/canvas";
const CANVAS_WS_PATH = "/__openclaw__/ws";
let cachedA2uiRootReal;
let resolvingA2uiRoot = null;
async function resolveA2uiRoot() {
	const here = path.dirname(fileURLToPath(import.meta.url));
	const candidates = [
		path.resolve(here, "a2ui"),
		path.resolve(here, "../../src/canvas-host/a2ui"),
		path.resolve(process.cwd(), "src/canvas-host/a2ui"),
		path.resolve(process.cwd(), "dist/canvas-host/a2ui")
	];
	if (process.execPath) candidates.unshift(path.resolve(path.dirname(process.execPath), "a2ui"));
	for (const dir of candidates) try {
		const indexPath = path.join(dir, "index.html");
		const bundlePath = path.join(dir, "a2ui.bundle.js");
		await fsPromises.stat(indexPath);
		await fsPromises.stat(bundlePath);
		return dir;
	} catch {}
	return null;
}
async function resolveA2uiRootReal() {
	if (cachedA2uiRootReal !== void 0) return cachedA2uiRootReal;
	if (!resolvingA2uiRoot) resolvingA2uiRoot = (async () => {
		const root = await resolveA2uiRoot();
		cachedA2uiRootReal = root ? await fsPromises.realpath(root) : null;
		return cachedA2uiRootReal;
	})();
	return resolvingA2uiRoot;
}
function normalizeUrlPath$1(rawPath) {
	const decoded = decodeURIComponent(rawPath || "/");
	const normalized = path.posix.normalize(decoded);
	return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
async function resolveA2uiFile(rootReal, urlPath) {
	const normalized = normalizeUrlPath$1(urlPath);
	const rel = normalized.replace(/^\/+/, "");
	if (rel.split("/").some((p) => p === "..")) return null;
	const tryOpen = async (relative) => {
		try {
			return await openFileWithinRoot({
				rootDir: rootReal,
				relativePath: relative
			});
		} catch (err) {
			if (err instanceof SafeOpenError) return null;
			throw err;
		}
	};
	if (normalized.endsWith("/")) return await tryOpen(path.posix.join(rel, "index.html"));
	const candidate = path.join(rootReal, rel);
	try {
		const st = await fsPromises.lstat(candidate);
		if (st.isSymbolicLink()) return null;
		if (st.isDirectory()) return await tryOpen(path.posix.join(rel, "index.html"));
	} catch {}
	return await tryOpen(rel);
}
function injectCanvasLiveReload(html) {
	const snippet = `
<script>
(() => {
  // Cross-platform action bridge helper.
  // Works on:
  // - iOS: window.webkit.messageHandlers.openclawCanvasA2UIAction.postMessage(...)
  // - Android: window.openclawCanvasA2UIAction.postMessage(...)
  const handlerNames = ["openclawCanvasA2UIAction"];
  function postToNode(payload) {
    try {
      const raw = typeof payload === "string" ? payload : JSON.stringify(payload);
      for (const name of handlerNames) {
        const iosHandler = globalThis.webkit?.messageHandlers?.[name];
        if (iosHandler && typeof iosHandler.postMessage === "function") {
          iosHandler.postMessage(raw);
          return true;
        }
        const androidHandler = globalThis[name];
        if (androidHandler && typeof androidHandler.postMessage === "function") {
          // Important: call as a method on the interface object (binding matters on Android WebView).
          androidHandler.postMessage(raw);
          return true;
        }
      }
    } catch {}
    return false;
  }
  function sendUserAction(userAction) {
    const id =
      (userAction && typeof userAction.id === "string" && userAction.id.trim()) ||
      (globalThis.crypto?.randomUUID?.() ?? String(Date.now()));
    const action = { ...userAction, id };
    return postToNode({ userAction: action });
  }
  globalThis.OpenClaw = globalThis.OpenClaw ?? {};
  globalThis.OpenClaw.postMessage = postToNode;
  globalThis.OpenClaw.sendUserAction = sendUserAction;
  globalThis.openclawPostMessage = postToNode;
  globalThis.openclawSendUserAction = sendUserAction;

  try {
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(proto + "://" + location.host + ${JSON.stringify(CANVAS_WS_PATH)});
    ws.onmessage = (ev) => {
      if (String(ev.data || "") === "reload") location.reload();
    };
  } catch {}
})();
<\/script>
`.trim();
	const idx = html.toLowerCase().lastIndexOf("</body>");
	if (idx >= 0) return `${html.slice(0, idx)}\n${snippet}\n${html.slice(idx)}`;
	return `${html}\n${snippet}\n`;
}
async function handleA2uiHttpRequest(req, res) {
	const urlRaw = req.url;
	if (!urlRaw) return false;
	const url = new URL(urlRaw, "http://localhost");
	const basePath = url.pathname === A2UI_PATH || url.pathname.startsWith(`${A2UI_PATH}/`) ? A2UI_PATH : void 0;
	if (!basePath) return false;
	if (req.method !== "GET" && req.method !== "HEAD") {
		res.statusCode = 405;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("Method Not Allowed");
		return true;
	}
	const a2uiRootReal = await resolveA2uiRootReal();
	if (!a2uiRootReal) {
		res.statusCode = 503;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("A2UI assets not found");
		return true;
	}
	const result = await resolveA2uiFile(a2uiRootReal, url.pathname.slice(basePath.length) || "/");
	if (!result) {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("not found");
		return true;
	}
	try {
		const lower = result.realPath.toLowerCase();
		const mime = lower.endsWith(".html") || lower.endsWith(".htm") ? "text/html" : await detectMime({ filePath: result.realPath }) ?? "application/octet-stream";
		res.setHeader("Cache-Control", "no-store");
		if (req.method === "HEAD") {
			res.setHeader("Content-Type", mime === "text/html" ? "text/html; charset=utf-8" : mime);
			res.end();
			return true;
		}
		if (mime === "text/html") {
			const buf = await result.handle.readFile({ encoding: "utf8" });
			res.setHeader("Content-Type", "text/html; charset=utf-8");
			res.end(injectCanvasLiveReload(buf));
			return true;
		}
		res.setHeader("Content-Type", mime);
		res.end(await result.handle.readFile());
		return true;
	} finally {
		await result.handle.close().catch(() => {});
	}
}

//#endregion
//#region src/canvas-host/server.ts
function defaultIndexHTML() {
	return `<!doctype html>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>OpenClaw Canvas</title>
<style>
  html, body { height: 100%; margin: 0; background: #000; color: #fff; font: 16px/1.4 -apple-system, BlinkMacSystemFont, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
  .wrap { min-height: 100%; display: grid; place-items: center; padding: 24px; }
  .card { width: min(720px, 100%); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10); border-radius: 16px; padding: 18px 18px 14px; }
  .title { display: flex; align-items: baseline; gap: 10px; }
  h1 { margin: 0; font-size: 22px; letter-spacing: 0.2px; }
  .sub { opacity: 0.75; font-size: 13px; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
  button { appearance: none; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.10); color: #fff; padding: 10px 12px; border-radius: 12px; font-weight: 600; cursor: pointer; }
  button:active { transform: translateY(1px); }
  .ok { color: #24e08a; }
  .bad { color: #ff5c5c; }
  .log { margin-top: 14px; opacity: 0.85; font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; white-space: pre-wrap; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); padding: 10px; border-radius: 12px; }
</style>
<div class="wrap">
  <div class="card">
    <div class="title">
      <h1>OpenClaw Canvas</h1>
      <div class="sub">Interactive test page (auto-reload enabled)</div>
    </div>

    <div class="row">
      <button id="btn-hello">Hello</button>
      <button id="btn-time">Time</button>
      <button id="btn-photo">Photo</button>
      <button id="btn-dalek">Dalek</button>
    </div>

    <div id="status" class="sub" style="margin-top: 10px;"></div>
    <div id="log" class="log">Ready.</div>
  </div>
</div>
<script>
(() => {
  const logEl = document.getElementById("log");
  const statusEl = document.getElementById("status");
  const log = (msg) => { logEl.textContent = String(msg); };

  const hasIOS = () =>
    !!(
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.openclawCanvasA2UIAction
    );
  const hasAndroid = () =>
    !!(
      (window.openclawCanvasA2UIAction &&
        typeof window.openclawCanvasA2UIAction.postMessage === "function")
    );
  const hasHelper = () => typeof window.openclawSendUserAction === "function";
  statusEl.innerHTML =
    "Bridge: " +
    (hasHelper() ? "<span class='ok'>ready</span>" : "<span class='bad'>missing</span>") +
    " · iOS=" + (hasIOS() ? "yes" : "no") +
    " · Android=" + (hasAndroid() ? "yes" : "no");

  const onStatus = (ev) => {
    const d = ev && ev.detail || {};
    log("Action status: id=" + (d.id || "?") + " ok=" + String(!!d.ok) + (d.error ? (" error=" + d.error) : ""));
  };
  window.addEventListener("openclaw:a2ui-action-status", onStatus);

  function send(name, sourceComponentId) {
    if (!hasHelper()) {
      log("No action bridge found. Ensure you're viewing this on an iOS/Android OpenClaw node canvas.");
      return;
    }
    const sendUserAction =
      typeof window.openclawSendUserAction === "function"
        ? window.openclawSendUserAction
        : undefined;
    const ok = sendUserAction({
      name,
      surfaceId: "main",
      sourceComponentId,
      context: { t: Date.now() },
    });
    log(ok ? ("Sent action: " + name) : ("Failed to send action: " + name));
  }

  document.getElementById("btn-hello").onclick = () => send("hello", "demo.hello");
  document.getElementById("btn-time").onclick = () => send("time", "demo.time");
  document.getElementById("btn-photo").onclick = () => send("photo", "demo.photo");
  document.getElementById("btn-dalek").onclick = () => send("dalek", "demo.dalek");
})();
<\/script>
`;
}
function normalizeUrlPath(rawPath) {
	const decoded = decodeURIComponent(rawPath || "/");
	const normalized = path.posix.normalize(decoded);
	return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
async function resolveFilePath(rootReal, urlPath) {
	const normalized = normalizeUrlPath(urlPath);
	const rel = normalized.replace(/^\/+/, "");
	if (rel.split("/").some((p) => p === "..")) return null;
	const tryOpen = async (relative) => {
		try {
			return await openFileWithinRoot({
				rootDir: rootReal,
				relativePath: relative
			});
		} catch (err) {
			if (err instanceof SafeOpenError) return null;
			throw err;
		}
	};
	if (normalized.endsWith("/")) return await tryOpen(path.posix.join(rel, "index.html"));
	const candidate = path.join(rootReal, rel);
	try {
		const st = await fsPromises.lstat(candidate);
		if (st.isSymbolicLink()) return null;
		if (st.isDirectory()) return await tryOpen(path.posix.join(rel, "index.html"));
	} catch {}
	return await tryOpen(rel);
}
function isDisabledByEnv() {
	if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_CANVAS_HOST)) return true;
	if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_CANVAS_HOST)) return true;
	if (process.env.VITEST) return true;
	return false;
}
function normalizeBasePath(rawPath) {
	const normalized = normalizeUrlPath((rawPath ?? CANVAS_HOST_PATH).trim() || CANVAS_HOST_PATH);
	if (normalized === "/") return "/";
	return normalized.replace(/\/+$/, "");
}
async function prepareCanvasRoot(rootDir) {
	await ensureDir(rootDir);
	const rootReal = await fsPromises.realpath(rootDir);
	try {
		const indexPath = path.join(rootReal, "index.html");
		await fsPromises.stat(indexPath);
	} catch {
		try {
			await fsPromises.writeFile(path.join(rootReal, "index.html"), defaultIndexHTML(), "utf8");
		} catch {}
	}
	return rootReal;
}
function resolveDefaultCanvasRoot() {
	const candidates = [path.join(resolveStateDir(), "canvas")];
	return candidates.find((dir) => {
		try {
			return fsSync.statSync(dir).isDirectory();
		} catch {
			return false;
		}
	}) ?? candidates[0];
}
async function createCanvasHostHandler(opts) {
	const basePath = normalizeBasePath(opts.basePath);
	if (isDisabledByEnv() && opts.allowInTests !== true) return {
		rootDir: "",
		basePath,
		handleHttpRequest: async () => false,
		handleUpgrade: () => false,
		close: async () => {}
	};
	const rootDir = resolveUserPath(opts.rootDir ?? resolveDefaultCanvasRoot());
	const rootReal = await prepareCanvasRoot(rootDir);
	const liveReload = opts.liveReload !== false;
	const testMode = opts.allowInTests === true;
	const reloadDebounceMs = testMode ? 12 : 75;
	const writeStabilityThresholdMs = testMode ? 12 : 75;
	const writePollIntervalMs = testMode ? 5 : 10;
	const wss = liveReload ? new WebSocketServer({ noServer: true }) : null;
	const sockets = /* @__PURE__ */ new Set();
	if (wss) wss.on("connection", (ws) => {
		sockets.add(ws);
		ws.on("close", () => sockets.delete(ws));
	});
	let debounce = null;
	const broadcastReload = () => {
		if (!liveReload) return;
		for (const ws of sockets) try {
			ws.send("reload");
		} catch {}
	};
	const scheduleReload = () => {
		if (debounce) clearTimeout(debounce);
		debounce = setTimeout(() => {
			debounce = null;
			broadcastReload();
		}, reloadDebounceMs);
		debounce.unref?.();
	};
	let watcherClosed = false;
	const watcher = liveReload ? chokidar.watch(rootReal, {
		ignoreInitial: true,
		awaitWriteFinish: {
			stabilityThreshold: writeStabilityThresholdMs,
			pollInterval: writePollIntervalMs
		},
		usePolling: testMode,
		ignored: [/(^|[\\/])\../, /(^|[\\/])node_modules([\\/]|$)/]
	}) : null;
	watcher?.on("all", () => scheduleReload());
	watcher?.on("error", (err) => {
		if (watcherClosed) return;
		watcherClosed = true;
		opts.runtime.error(`canvasHost watcher error: ${String(err)} (live reload disabled; consider canvasHost.liveReload=false or a smaller canvasHost.root)`);
		watcher.close().catch(() => {});
	});
	const handleUpgrade = (req, socket, head) => {
		if (!wss) return false;
		if (new URL(req.url ?? "/", "http://localhost").pathname !== CANVAS_WS_PATH) return false;
		wss.handleUpgrade(req, socket, head, (ws) => {
			wss.emit("connection", ws, req);
		});
		return true;
	};
	const handleHttpRequest = async (req, res) => {
		const urlRaw = req.url;
		if (!urlRaw) return false;
		try {
			const url = new URL(urlRaw, "http://localhost");
			if (url.pathname === CANVAS_WS_PATH) {
				res.statusCode = liveReload ? 426 : 404;
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.end(liveReload ? "upgrade required" : "not found");
				return true;
			}
			let urlPath = url.pathname;
			if (basePath !== "/") {
				if (urlPath !== basePath && !urlPath.startsWith(`${basePath}/`)) return false;
				urlPath = urlPath === basePath ? "/" : urlPath.slice(basePath.length) || "/";
			}
			if (req.method !== "GET" && req.method !== "HEAD") {
				res.statusCode = 405;
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.end("Method Not Allowed");
				return true;
			}
			const opened = await resolveFilePath(rootReal, urlPath);
			if (!opened) {
				if (urlPath === "/" || urlPath.endsWith("/")) {
					res.statusCode = 404;
					res.setHeader("Content-Type", "text/html; charset=utf-8");
					res.end(`<!doctype html><meta charset="utf-8" /><title>OpenClaw Canvas</title><pre>Missing file.\nCreate ${rootDir}/index.html</pre>`);
					return true;
				}
				res.statusCode = 404;
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.end("not found");
				return true;
			}
			const { handle, realPath } = opened;
			let data;
			try {
				data = await handle.readFile();
			} finally {
				await handle.close().catch(() => {});
			}
			const lower = realPath.toLowerCase();
			const mime = lower.endsWith(".html") || lower.endsWith(".htm") ? "text/html" : await detectMime({ filePath: realPath }) ?? "application/octet-stream";
			res.setHeader("Cache-Control", "no-store");
			if (mime === "text/html") {
				const html = data.toString("utf8");
				res.setHeader("Content-Type", "text/html; charset=utf-8");
				res.end(liveReload ? injectCanvasLiveReload(html) : html);
				return true;
			}
			res.setHeader("Content-Type", mime);
			res.end(data);
			return true;
		} catch (err) {
			opts.runtime.error(`canvasHost request failed: ${String(err)}`);
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("error");
			return true;
		}
	};
	return {
		rootDir,
		basePath,
		handleHttpRequest,
		handleUpgrade,
		close: async () => {
			if (debounce) clearTimeout(debounce);
			watcherClosed = true;
			await watcher?.close().catch(() => {});
			if (wss) await new Promise((resolve) => wss.close(() => resolve()));
		}
	};
}

//#endregion
//#region src/gateway/server-broadcast.ts
const ADMIN_SCOPE = "operator.admin";
const APPROVALS_SCOPE = "operator.approvals";
const PAIRING_SCOPE = "operator.pairing";
const EVENT_SCOPE_GUARDS = {
	"exec.approval.requested": [APPROVALS_SCOPE],
	"exec.approval.resolved": [APPROVALS_SCOPE],
	"device.pair.requested": [PAIRING_SCOPE],
	"device.pair.resolved": [PAIRING_SCOPE],
	"node.pair.requested": [PAIRING_SCOPE],
	"node.pair.resolved": [PAIRING_SCOPE]
};
function hasEventScope(client, event) {
	const required = EVENT_SCOPE_GUARDS[event];
	if (!required) return true;
	if ((client.connect.role ?? "operator") !== "operator") return false;
	const scopes = Array.isArray(client.connect.scopes) ? client.connect.scopes : [];
	if (scopes.includes(ADMIN_SCOPE)) return true;
	return required.some((scope) => scopes.includes(scope));
}
function createGatewayBroadcaster(params) {
	let seq = 0;
	const broadcastInternal = (event, payload, opts, targetConnIds) => {
		const eventSeq = Boolean(targetConnIds) ? void 0 : ++seq;
		const frame = JSON.stringify({
			type: "event",
			event,
			payload,
			seq: eventSeq,
			stateVersion: opts?.stateVersion
		});
		const logMeta = {
			event,
			seq: eventSeq ?? "targeted",
			clients: params.clients.size,
			targets: targetConnIds ? targetConnIds.size : void 0,
			dropIfSlow: opts?.dropIfSlow,
			presenceVersion: opts?.stateVersion?.presence,
			healthVersion: opts?.stateVersion?.health
		};
		if (event === "agent") Object.assign(logMeta, summarizeAgentEventForWsLog(payload));
		logWs("out", "event", logMeta);
		for (const c of params.clients) {
			if (targetConnIds && !targetConnIds.has(c.connId)) continue;
			if (!hasEventScope(c, event)) continue;
			const slow = c.socket.bufferedAmount > MAX_BUFFERED_BYTES;
			if (slow && opts?.dropIfSlow) continue;
			if (slow) {
				try {
					c.socket.close(1008, "slow consumer");
				} catch {}
				continue;
			}
			try {
				c.socket.send(frame);
			} catch {}
		}
	};
	const broadcast = (event, payload, opts) => broadcastInternal(event, payload, opts);
	const broadcastToConnIds = (event, payload, connIds, opts) => {
		if (connIds.size === 0) return;
		broadcastInternal(event, payload, opts, connIds);
	};
	return {
		broadcast,
		broadcastToConnIds
	};
}

//#endregion
//#region src/agents/identity-avatar.ts
const ALLOWED_AVATAR_EXTS = new Set([
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".svg"
]);
function normalizeAvatarValue(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}
function resolveAvatarSource(cfg, agentId) {
	const fromConfig = normalizeAvatarValue(resolveAgentIdentity(cfg, agentId)?.avatar);
	if (fromConfig) return fromConfig;
	return normalizeAvatarValue(loadAgentIdentityFromWorkspace(resolveAgentWorkspaceDir(cfg, agentId))?.avatar);
}
function isRemoteAvatar(value) {
	const lower = value.toLowerCase();
	return lower.startsWith("http://") || lower.startsWith("https://");
}
function isDataAvatar(value) {
	return value.toLowerCase().startsWith("data:");
}
function resolveExistingPath(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return path.resolve(value);
	}
}
function isPathWithin(root, target) {
	const relative = path.relative(root, target);
	if (!relative) return true;
	return !relative.startsWith("..") && !path.isAbsolute(relative);
}
function resolveLocalAvatarPath(params) {
	const workspaceRoot = resolveExistingPath(params.workspaceDir);
	const raw = params.raw;
	const realPath = resolveExistingPath(raw.startsWith("~") || path.isAbsolute(raw) ? resolveUserPath(raw) : path.resolve(workspaceRoot, raw));
	if (!isPathWithin(workspaceRoot, realPath)) return {
		ok: false,
		reason: "outside_workspace"
	};
	const ext = path.extname(realPath).toLowerCase();
	if (!ALLOWED_AVATAR_EXTS.has(ext)) return {
		ok: false,
		reason: "unsupported_extension"
	};
	try {
		if (!fs.statSync(realPath).isFile()) return {
			ok: false,
			reason: "missing"
		};
	} catch {
		return {
			ok: false,
			reason: "missing"
		};
	}
	return {
		ok: true,
		filePath: realPath
	};
}
function resolveAgentAvatar(cfg, agentId) {
	const source = resolveAvatarSource(cfg, agentId);
	if (!source) return {
		kind: "none",
		reason: "missing"
	};
	if (isRemoteAvatar(source)) return {
		kind: "remote",
		url: source
	};
	if (isDataAvatar(source)) return {
		kind: "data",
		url: source
	};
	const resolved = resolveLocalAvatarPath({
		raw: source,
		workspaceDir: resolveAgentWorkspaceDir(cfg, agentId)
	});
	if (!resolved.ok) return {
		kind: "none",
		reason: resolved.reason
	};
	return {
		kind: "local",
		filePath: resolved.filePath
	};
}

//#endregion
//#region src/gateway/control-ui.ts
const ROOT_PREFIX = "/";
function contentTypeForExt(ext) {
	switch (ext) {
		case ".html": return "text/html; charset=utf-8";
		case ".js": return "application/javascript; charset=utf-8";
		case ".css": return "text/css; charset=utf-8";
		case ".json":
		case ".map": return "application/json; charset=utf-8";
		case ".svg": return "image/svg+xml";
		case ".png": return "image/png";
		case ".jpg":
		case ".jpeg": return "image/jpeg";
		case ".gif": return "image/gif";
		case ".webp": return "image/webp";
		case ".ico": return "image/x-icon";
		case ".txt": return "text/plain; charset=utf-8";
		default: return "application/octet-stream";
	}
}
function applyControlUiSecurityHeaders(res) {
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");
	res.setHeader("X-Content-Type-Options", "nosniff");
}
function sendJson$2(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.setHeader("Cache-Control", "no-cache");
	res.end(JSON.stringify(body));
}
function isValidAgentId(agentId) {
	return /^[a-z0-9][a-z0-9_-]{0,63}$/i.test(agentId);
}
function handleControlUiAvatarRequest(req, res, opts) {
	const urlRaw = req.url;
	if (!urlRaw) return false;
	if (req.method !== "GET" && req.method !== "HEAD") return false;
	const url = new URL(urlRaw, "http://localhost");
	const basePath = normalizeControlUiBasePath(opts.basePath);
	const pathname = url.pathname;
	const pathWithBase = basePath ? `${basePath}${CONTROL_UI_AVATAR_PREFIX}/` : `${CONTROL_UI_AVATAR_PREFIX}/`;
	if (!pathname.startsWith(pathWithBase)) return false;
	applyControlUiSecurityHeaders(res);
	const agentIdParts = pathname.slice(pathWithBase.length).split("/").filter(Boolean);
	const agentId = agentIdParts[0] ?? "";
	if (agentIdParts.length !== 1 || !agentId || !isValidAgentId(agentId)) {
		respondNotFound(res);
		return true;
	}
	if (url.searchParams.get("meta") === "1") {
		const resolved = opts.resolveAvatar(agentId);
		sendJson$2(res, 200, { avatarUrl: resolved.kind === "local" ? buildControlUiAvatarUrl(basePath, agentId) : resolved.kind === "remote" || resolved.kind === "data" ? resolved.url : null });
		return true;
	}
	const resolved = opts.resolveAvatar(agentId);
	if (resolved.kind !== "local") {
		respondNotFound(res);
		return true;
	}
	if (req.method === "HEAD") {
		res.statusCode = 200;
		res.setHeader("Content-Type", contentTypeForExt(path.extname(resolved.filePath).toLowerCase()));
		res.setHeader("Cache-Control", "no-cache");
		res.end();
		return true;
	}
	serveFile(res, resolved.filePath);
	return true;
}
function respondNotFound(res) {
	res.statusCode = 404;
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.end("Not Found");
}
function serveFile(res, filePath) {
	const ext = path.extname(filePath).toLowerCase();
	res.setHeader("Content-Type", contentTypeForExt(ext));
	res.setHeader("Cache-Control", "no-cache");
	res.end(fs.readFileSync(filePath));
}
function injectControlUiConfig(html, opts) {
	const { basePath, assistantName, assistantAvatar } = opts;
	const script = `<script>window.__OPENCLAW_CONTROL_UI_BASE_PATH__=${JSON.stringify(basePath)};window.__OPENCLAW_ASSISTANT_NAME__=${JSON.stringify(assistantName ?? DEFAULT_ASSISTANT_IDENTITY.name)};window.__OPENCLAW_ASSISTANT_AVATAR__=${JSON.stringify(assistantAvatar ?? DEFAULT_ASSISTANT_IDENTITY.avatar)};<\/script>`;
	if (html.includes("__OPENCLAW_ASSISTANT_NAME__")) return html;
	const headClose = html.indexOf("</head>");
	if (headClose !== -1) return `${html.slice(0, headClose)}${script}${html.slice(headClose)}`;
	return `${script}${html}`;
}
function serveIndexHtml(res, indexPath, opts) {
	const { basePath, config, agentId } = opts;
	const identity = config ? resolveAssistantIdentity({
		cfg: config,
		agentId
	}) : DEFAULT_ASSISTANT_IDENTITY;
	const resolvedAgentId = typeof identity.agentId === "string" ? identity.agentId : agentId;
	const avatarValue = resolveAssistantAvatarUrl({
		avatar: identity.avatar,
		agentId: resolvedAgentId,
		basePath
	}) ?? identity.avatar;
	res.setHeader("Content-Type", "text/html; charset=utf-8");
	res.setHeader("Cache-Control", "no-cache");
	const raw = fs.readFileSync(indexPath, "utf8");
	res.end(injectControlUiConfig(raw, {
		basePath,
		assistantName: identity.name,
		assistantAvatar: avatarValue
	}));
}
function isSafeRelativePath(relPath) {
	if (!relPath) return false;
	const normalized = path.posix.normalize(relPath);
	if (normalized.startsWith("../") || normalized === "..") return false;
	if (normalized.includes("\0")) return false;
	return true;
}
function handleControlUiHttpRequest(req, res, opts) {
	const urlRaw = req.url;
	if (!urlRaw) return false;
	if (req.method !== "GET" && req.method !== "HEAD") {
		res.statusCode = 405;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("Method Not Allowed");
		return true;
	}
	const url = new URL(urlRaw, "http://localhost");
	const basePath = normalizeControlUiBasePath(opts?.basePath);
	const pathname = url.pathname;
	if (!basePath) {
		if (pathname === "/ui" || pathname.startsWith("/ui/")) {
			applyControlUiSecurityHeaders(res);
			respondNotFound(res);
			return true;
		}
	}
	if (basePath) {
		if (pathname === basePath) {
			applyControlUiSecurityHeaders(res);
			res.statusCode = 302;
			res.setHeader("Location", `${basePath}/${url.search}`);
			res.end();
			return true;
		}
		if (!pathname.startsWith(`${basePath}/`)) return false;
	}
	applyControlUiSecurityHeaders(res);
	const rootState = opts?.root;
	if (rootState?.kind === "invalid") {
		res.statusCode = 503;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end(`Control UI assets not found at ${rootState.path}. Build them with \`pnpm ui:build\` (auto-installs UI deps), or update gateway.controlUi.root.`);
		return true;
	}
	if (rootState?.kind === "missing") {
		res.statusCode = 503;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("Control UI assets not found. Build them with `pnpm ui:build` (auto-installs UI deps), or run `pnpm ui:dev` during development.");
		return true;
	}
	const root = rootState?.kind === "resolved" ? rootState.path : resolveControlUiRootSync({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	});
	if (!root) {
		res.statusCode = 503;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("Control UI assets not found. Build them with `pnpm ui:build` (auto-installs UI deps), or run `pnpm ui:dev` during development.");
		return true;
	}
	const uiPath = basePath && pathname.startsWith(`${basePath}/`) ? pathname.slice(basePath.length) : pathname;
	const rel = (() => {
		if (uiPath === ROOT_PREFIX) return "";
		const assetsIndex = uiPath.indexOf("/assets/");
		if (assetsIndex >= 0) return uiPath.slice(assetsIndex + 1);
		return uiPath.slice(1);
	})();
	const fileRel = (rel && !rel.endsWith("/") ? rel : `${rel}index.html`) || "index.html";
	if (!isSafeRelativePath(fileRel)) {
		respondNotFound(res);
		return true;
	}
	const filePath = path.join(root, fileRel);
	if (!filePath.startsWith(root)) {
		respondNotFound(res);
		return true;
	}
	if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
		if (path.basename(filePath) === "index.html") {
			serveIndexHtml(res, filePath, {
				basePath,
				config: opts?.config,
				agentId: opts?.agentId
			});
			return true;
		}
		serveFile(res, filePath);
		return true;
	}
	const indexPath = path.join(root, "index.html");
	if (fs.existsSync(indexPath)) {
		serveIndexHtml(res, indexPath, {
			basePath,
			config: opts?.config,
			agentId: opts?.agentId
		});
		return true;
	}
	respondNotFound(res);
	return true;
}

//#endregion
//#region src/gateway/http-common.ts
function sendJson$1(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.end(JSON.stringify(body));
}
function sendText(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.end(body);
}
function sendMethodNotAllowed(res, allow = "POST") {
	res.setHeader("Allow", allow);
	sendText(res, 405, "Method Not Allowed");
}
function sendUnauthorized(res) {
	sendJson$1(res, 401, { error: {
		message: "Unauthorized",
		type: "unauthorized"
	} });
}
function sendRateLimited(res, retryAfterMs) {
	if (retryAfterMs && retryAfterMs > 0) res.setHeader("Retry-After", String(Math.ceil(retryAfterMs / 1e3)));
	sendJson$1(res, 429, { error: {
		message: "Too many failed authentication attempts. Please try again later.",
		type: "rate_limited"
	} });
}
function sendGatewayAuthFailure(res, authResult) {
	if (authResult.rateLimited) {
		sendRateLimited(res, authResult.retryAfterMs);
		return;
	}
	sendUnauthorized(res);
}
function sendInvalidRequest(res, message) {
	sendJson$1(res, 400, { error: {
		message,
		type: "invalid_request_error"
	} });
}
async function readJsonBodyOrError(req, res, maxBytes) {
	const body = await readJsonBody(req, maxBytes);
	if (!body.ok) {
		if (body.error === "payload too large") {
			sendJson$1(res, 413, { error: {
				message: "Payload too large",
				type: "invalid_request_error"
			} });
			return;
		}
		if (body.error === "request body timeout") {
			sendJson$1(res, 408, { error: {
				message: "Request body timeout",
				type: "invalid_request_error"
			} });
			return;
		}
		sendInvalidRequest(res, body.error);
		return;
	}
	return body.value;
}
function writeDone(res) {
	res.write("data: [DONE]\n\n");
}
function setSseHeaders(res) {
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders?.();
}

//#endregion
//#region src/gateway/http-utils.ts
function getHeader(req, name) {
	const raw = req.headers[name.toLowerCase()];
	if (typeof raw === "string") return raw;
	if (Array.isArray(raw)) return raw[0];
}
function getBearerToken(req) {
	const raw = getHeader(req, "authorization")?.trim() ?? "";
	if (!raw.toLowerCase().startsWith("bearer ")) return;
	return raw.slice(7).trim() || void 0;
}
function resolveAgentIdFromHeader(req) {
	const raw = getHeader(req, "x-openclaw-agent-id")?.trim() || getHeader(req, "x-openclaw-agent")?.trim() || "";
	if (!raw) return;
	return normalizeAgentId(raw);
}
function resolveAgentIdFromModel(model) {
	const raw = model?.trim();
	if (!raw) return;
	const agentId = (raw.match(/^openclaw[:/](?<agentId>[a-z0-9][a-z0-9_-]{0,63})$/i) ?? raw.match(/^agent:(?<agentId>[a-z0-9][a-z0-9_-]{0,63})$/i))?.groups?.agentId;
	if (!agentId) return;
	return normalizeAgentId(agentId);
}
function resolveAgentIdForRequest(params) {
	const fromHeader = resolveAgentIdFromHeader(params.req);
	if (fromHeader) return fromHeader;
	return resolveAgentIdFromModel(params.model) ?? "main";
}
function resolveSessionKey(params) {
	const explicit = getHeader(params.req, "x-openclaw-session-key")?.trim();
	if (explicit) return explicit;
	const user = params.user?.trim();
	const mainKey = user ? `${params.prefix}-user:${user}` : `${params.prefix}:${randomUUID()}`;
	return buildAgentMainSessionKey({
		agentId: params.agentId,
		mainKey
	});
}

//#endregion
//#region src/gateway/openai-http.ts
function writeSse(res, data) {
	res.write(`data: ${JSON.stringify(data)}\n\n`);
}
function asMessages(val) {
	return Array.isArray(val) ? val : [];
}
function extractTextContent$1(content) {
	if (typeof content === "string") return content;
	if (Array.isArray(content)) return content.map((part) => {
		if (!part || typeof part !== "object") return "";
		const type = part.type;
		const text = part.text;
		const inputText = part.input_text;
		if (type === "text" && typeof text === "string") return text;
		if (type === "input_text" && typeof text === "string") return text;
		if (typeof inputText === "string") return inputText;
		return "";
	}).filter(Boolean).join("\n");
	return "";
}
function buildAgentPrompt$1(messagesUnknown) {
	const messages = asMessages(messagesUnknown);
	const systemParts = [];
	const conversationEntries = [];
	for (const msg of messages) {
		if (!msg || typeof msg !== "object") continue;
		const role = typeof msg.role === "string" ? msg.role.trim() : "";
		const content = extractTextContent$1(msg.content).trim();
		if (!role || !content) continue;
		if (role === "system" || role === "developer") {
			systemParts.push(content);
			continue;
		}
		const normalizedRole = role === "function" ? "tool" : role;
		if (normalizedRole !== "user" && normalizedRole !== "assistant" && normalizedRole !== "tool") continue;
		const name = typeof msg.name === "string" ? msg.name.trim() : "";
		const sender = normalizedRole === "assistant" ? "Assistant" : normalizedRole === "user" ? "User" : name ? `Tool:${name}` : "Tool";
		conversationEntries.push({
			role: normalizedRole,
			entry: {
				sender,
				body: content
			}
		});
	}
	let message = "";
	if (conversationEntries.length > 0) {
		let currentIndex = -1;
		for (let i = conversationEntries.length - 1; i >= 0; i -= 1) {
			const entryRole = conversationEntries[i]?.role;
			if (entryRole === "user" || entryRole === "tool") {
				currentIndex = i;
				break;
			}
		}
		if (currentIndex < 0) currentIndex = conversationEntries.length - 1;
		const currentEntry = conversationEntries[currentIndex]?.entry;
		if (currentEntry) {
			const historyEntries = conversationEntries.slice(0, currentIndex).map((entry) => entry.entry);
			if (historyEntries.length === 0) message = currentEntry.body;
			else {
				const formatEntry = (entry) => `${entry.sender}: ${entry.body}`;
				message = buildHistoryContextFromEntries({
					entries: [...historyEntries, currentEntry],
					currentMessage: formatEntry(currentEntry),
					formatEntry
				});
			}
		}
	}
	return {
		message,
		extraSystemPrompt: systemParts.length > 0 ? systemParts.join("\n\n") : void 0
	};
}
function resolveOpenAiSessionKey(params) {
	return resolveSessionKey({
		...params,
		prefix: "openai"
	});
}
function coerceRequest(val) {
	if (!val || typeof val !== "object") return {};
	return val;
}
async function handleOpenAiHttpRequest(req, res, opts) {
	if (new URL(req.url ?? "/", `http://${req.headers.host || "localhost"}`).pathname !== "/v1/chat/completions") return false;
	if (req.method !== "POST") {
		sendMethodNotAllowed(res);
		return true;
	}
	const token = getBearerToken(req);
	const authResult = await authorizeGatewayConnect({
		auth: opts.auth,
		connectAuth: {
			token,
			password: token
		},
		req,
		trustedProxies: opts.trustedProxies,
		rateLimiter: opts.rateLimiter
	});
	if (!authResult.ok) {
		sendGatewayAuthFailure(res, authResult);
		return true;
	}
	const body = await readJsonBodyOrError(req, res, opts.maxBodyBytes ?? 1024 * 1024);
	if (body === void 0) return true;
	const payload = coerceRequest(body);
	const stream = Boolean(payload.stream);
	const model = typeof payload.model === "string" ? payload.model : "openclaw";
	const user = typeof payload.user === "string" ? payload.user : void 0;
	const sessionKey = resolveOpenAiSessionKey({
		req,
		agentId: resolveAgentIdForRequest({
			req,
			model
		}),
		user
	});
	const prompt = buildAgentPrompt$1(payload.messages);
	if (!prompt.message) {
		sendJson$1(res, 400, { error: {
			message: "Missing user message in `messages`.",
			type: "invalid_request_error"
		} });
		return true;
	}
	const runId = `chatcmpl_${randomUUID()}`;
	const deps = createDefaultDeps();
	if (!stream) {
		try {
			const payloads = (await agentCommand({
				message: prompt.message,
				extraSystemPrompt: prompt.extraSystemPrompt,
				sessionKey,
				runId,
				deliver: false,
				messageChannel: "webchat",
				bestEffortDeliver: false
			}, defaultRuntime, deps))?.payloads;
			const content = Array.isArray(payloads) && payloads.length > 0 ? payloads.map((p) => typeof p.text === "string" ? p.text : "").filter(Boolean).join("\n\n") : "No response from OpenClaw.";
			sendJson$1(res, 200, {
				id: runId,
				object: "chat.completion",
				created: Math.floor(Date.now() / 1e3),
				model,
				choices: [{
					index: 0,
					message: {
						role: "assistant",
						content
					},
					finish_reason: "stop"
				}],
				usage: {
					prompt_tokens: 0,
					completion_tokens: 0,
					total_tokens: 0
				}
			});
		} catch (err) {
			logWarn(`openai-compat: chat completion failed: ${String(err)}`);
			sendJson$1(res, 500, { error: {
				message: "internal error",
				type: "api_error"
			} });
		}
		return true;
	}
	setSseHeaders(res);
	let wroteRole = false;
	let sawAssistantDelta = false;
	let closed = false;
	const unsubscribe = onAgentEvent((evt) => {
		if (evt.runId !== runId) return;
		if (closed) return;
		if (evt.stream === "assistant") {
			const delta = evt.data?.delta;
			const text = evt.data?.text;
			const content = typeof delta === "string" ? delta : typeof text === "string" ? text : "";
			if (!content) return;
			if (!wroteRole) {
				wroteRole = true;
				writeSse(res, {
					id: runId,
					object: "chat.completion.chunk",
					created: Math.floor(Date.now() / 1e3),
					model,
					choices: [{
						index: 0,
						delta: { role: "assistant" }
					}]
				});
			}
			sawAssistantDelta = true;
			writeSse(res, {
				id: runId,
				object: "chat.completion.chunk",
				created: Math.floor(Date.now() / 1e3),
				model,
				choices: [{
					index: 0,
					delta: { content },
					finish_reason: null
				}]
			});
			return;
		}
		if (evt.stream === "lifecycle") {
			const phase = evt.data?.phase;
			if (phase === "end" || phase === "error") {
				closed = true;
				unsubscribe();
				writeDone(res);
				res.end();
			}
		}
	});
	req.on("close", () => {
		closed = true;
		unsubscribe();
	});
	(async () => {
		try {
			const result = await agentCommand({
				message: prompt.message,
				extraSystemPrompt: prompt.extraSystemPrompt,
				sessionKey,
				runId,
				deliver: false,
				messageChannel: "webchat",
				bestEffortDeliver: false
			}, defaultRuntime, deps);
			if (closed) return;
			if (!sawAssistantDelta) {
				if (!wroteRole) {
					wroteRole = true;
					writeSse(res, {
						id: runId,
						object: "chat.completion.chunk",
						created: Math.floor(Date.now() / 1e3),
						model,
						choices: [{
							index: 0,
							delta: { role: "assistant" }
						}]
					});
				}
				const payloads = result?.payloads;
				const content = Array.isArray(payloads) && payloads.length > 0 ? payloads.map((p) => typeof p.text === "string" ? p.text : "").filter(Boolean).join("\n\n") : "No response from OpenClaw.";
				sawAssistantDelta = true;
				writeSse(res, {
					id: runId,
					object: "chat.completion.chunk",
					created: Math.floor(Date.now() / 1e3),
					model,
					choices: [{
						index: 0,
						delta: { content },
						finish_reason: null
					}]
				});
			}
		} catch (err) {
			logWarn(`openai-compat: streaming chat completion failed: ${String(err)}`);
			if (closed) return;
			writeSse(res, {
				id: runId,
				object: "chat.completion.chunk",
				created: Math.floor(Date.now() / 1e3),
				model,
				choices: [{
					index: 0,
					delta: { content: "Error: internal error" },
					finish_reason: "stop"
				}]
			});
			emitAgentEvent({
				runId,
				stream: "lifecycle",
				data: { phase: "error" }
			});
		} finally {
			if (!closed) {
				closed = true;
				unsubscribe();
				writeDone(res);
				res.end();
			}
		}
	})();
	return true;
}

//#endregion
//#region src/gateway/open-responses.schema.ts
/**
* OpenResponses API Zod Schemas
*
* Zod schemas for the OpenResponses `/v1/responses` endpoint.
* This module is isolated from gateway imports to enable future codegen and prevent drift.
*
* @see https://www.open-responses.com/
*/
const InputTextContentPartSchema = z.object({
	type: z.literal("input_text"),
	text: z.string()
}).strict();
const OutputTextContentPartSchema = z.object({
	type: z.literal("output_text"),
	text: z.string()
}).strict();
const InputImageSourceSchema = z.discriminatedUnion("type", [z.object({
	type: z.literal("url"),
	url: z.string().url()
}), z.object({
	type: z.literal("base64"),
	media_type: z.enum([
		"image/jpeg",
		"image/png",
		"image/gif",
		"image/webp"
	]),
	data: z.string().min(1)
})]);
const InputImageContentPartSchema = z.object({
	type: z.literal("input_image"),
	source: InputImageSourceSchema
}).strict();
const InputFileSourceSchema = z.discriminatedUnion("type", [z.object({
	type: z.literal("url"),
	url: z.string().url()
}), z.object({
	type: z.literal("base64"),
	media_type: z.string().min(1),
	data: z.string().min(1),
	filename: z.string().optional()
})]);
const InputFileContentPartSchema = z.object({
	type: z.literal("input_file"),
	source: InputFileSourceSchema
}).strict();
const ContentPartSchema = z.discriminatedUnion("type", [
	InputTextContentPartSchema,
	OutputTextContentPartSchema,
	InputImageContentPartSchema,
	InputFileContentPartSchema
]);
const MessageItemRoleSchema = z.enum([
	"system",
	"developer",
	"user",
	"assistant"
]);
const MessageItemSchema = z.object({
	type: z.literal("message"),
	role: MessageItemRoleSchema,
	content: z.union([z.string(), z.array(ContentPartSchema)])
}).strict();
const FunctionCallItemSchema = z.object({
	type: z.literal("function_call"),
	id: z.string().optional(),
	call_id: z.string().optional(),
	name: z.string(),
	arguments: z.string()
}).strict();
const FunctionCallOutputItemSchema = z.object({
	type: z.literal("function_call_output"),
	call_id: z.string(),
	output: z.string()
}).strict();
const ReasoningItemSchema = z.object({
	type: z.literal("reasoning"),
	content: z.string().optional(),
	encrypted_content: z.string().optional(),
	summary: z.string().optional()
}).strict();
const ItemReferenceItemSchema = z.object({
	type: z.literal("item_reference"),
	id: z.string()
}).strict();
const ItemParamSchema = z.discriminatedUnion("type", [
	MessageItemSchema,
	FunctionCallItemSchema,
	FunctionCallOutputItemSchema,
	ReasoningItemSchema,
	ItemReferenceItemSchema
]);
const FunctionToolDefinitionSchema = z.object({
	type: z.literal("function"),
	function: z.object({
		name: z.string().min(1, "Tool name cannot be empty"),
		description: z.string().optional(),
		parameters: z.record(z.string(), z.unknown()).optional()
	})
}).strict();
const ToolDefinitionSchema = FunctionToolDefinitionSchema;
const ToolChoiceSchema = z.union([
	z.literal("auto"),
	z.literal("none"),
	z.literal("required"),
	z.object({
		type: z.literal("function"),
		function: z.object({ name: z.string() })
	})
]);
const CreateResponseBodySchema = z.object({
	model: z.string(),
	input: z.union([z.string(), z.array(ItemParamSchema)]),
	instructions: z.string().optional(),
	tools: z.array(ToolDefinitionSchema).optional(),
	tool_choice: ToolChoiceSchema.optional(),
	stream: z.boolean().optional(),
	max_output_tokens: z.number().int().positive().optional(),
	max_tool_calls: z.number().int().positive().optional(),
	user: z.string().optional(),
	temperature: z.number().optional(),
	top_p: z.number().optional(),
	metadata: z.record(z.string(), z.string()).optional(),
	store: z.boolean().optional(),
	previous_response_id: z.string().optional(),
	reasoning: z.object({
		effort: z.enum([
			"low",
			"medium",
			"high"
		]).optional(),
		summary: z.enum([
			"auto",
			"concise",
			"detailed"
		]).optional()
	}).optional(),
	truncation: z.enum(["auto", "disabled"]).optional()
}).strict();
const ResponseStatusSchema = z.enum([
	"in_progress",
	"completed",
	"failed",
	"cancelled",
	"incomplete"
]);
const OutputItemSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("message"),
		id: z.string(),
		role: z.literal("assistant"),
		content: z.array(OutputTextContentPartSchema),
		status: z.enum(["in_progress", "completed"]).optional()
	}).strict(),
	z.object({
		type: z.literal("function_call"),
		id: z.string(),
		call_id: z.string(),
		name: z.string(),
		arguments: z.string(),
		status: z.enum(["in_progress", "completed"]).optional()
	}).strict(),
	z.object({
		type: z.literal("reasoning"),
		id: z.string(),
		content: z.string().optional(),
		summary: z.string().optional()
	}).strict()
]);
const UsageSchema = z.object({
	input_tokens: z.number().int().nonnegative(),
	output_tokens: z.number().int().nonnegative(),
	total_tokens: z.number().int().nonnegative()
});
const ResponseResourceSchema = z.object({
	id: z.string(),
	object: z.literal("response"),
	created_at: z.number().int(),
	status: ResponseStatusSchema,
	model: z.string(),
	output: z.array(OutputItemSchema),
	usage: UsageSchema,
	error: z.object({
		code: z.string(),
		message: z.string()
	}).optional()
});
const ResponseCreatedEventSchema = z.object({
	type: z.literal("response.created"),
	response: ResponseResourceSchema
});
const ResponseInProgressEventSchema = z.object({
	type: z.literal("response.in_progress"),
	response: ResponseResourceSchema
});
const ResponseCompletedEventSchema = z.object({
	type: z.literal("response.completed"),
	response: ResponseResourceSchema
});
const ResponseFailedEventSchema = z.object({
	type: z.literal("response.failed"),
	response: ResponseResourceSchema
});
const OutputItemAddedEventSchema = z.object({
	type: z.literal("response.output_item.added"),
	output_index: z.number().int().nonnegative(),
	item: OutputItemSchema
});
const OutputItemDoneEventSchema = z.object({
	type: z.literal("response.output_item.done"),
	output_index: z.number().int().nonnegative(),
	item: OutputItemSchema
});
const ContentPartAddedEventSchema = z.object({
	type: z.literal("response.content_part.added"),
	item_id: z.string(),
	output_index: z.number().int().nonnegative(),
	content_index: z.number().int().nonnegative(),
	part: OutputTextContentPartSchema
});
const ContentPartDoneEventSchema = z.object({
	type: z.literal("response.content_part.done"),
	item_id: z.string(),
	output_index: z.number().int().nonnegative(),
	content_index: z.number().int().nonnegative(),
	part: OutputTextContentPartSchema
});
const OutputTextDeltaEventSchema = z.object({
	type: z.literal("response.output_text.delta"),
	item_id: z.string(),
	output_index: z.number().int().nonnegative(),
	content_index: z.number().int().nonnegative(),
	delta: z.string()
});
const OutputTextDoneEventSchema = z.object({
	type: z.literal("response.output_text.done"),
	item_id: z.string(),
	output_index: z.number().int().nonnegative(),
	content_index: z.number().int().nonnegative(),
	text: z.string()
});

//#endregion
//#region src/gateway/openresponses-http.ts
const DEFAULT_BODY_BYTES$1 = 20 * 1024 * 1024;
const DEFAULT_MAX_URL_PARTS = 8;
function writeSseEvent(res, event) {
	res.write(`event: ${event.type}\n`);
	res.write(`data: ${JSON.stringify(event)}\n\n`);
}
function extractTextContent(content) {
	if (typeof content === "string") return content;
	return content.map((part) => {
		if (part.type === "input_text") return part.text;
		if (part.type === "output_text") return part.text;
		return "";
	}).filter(Boolean).join("\n");
}
function normalizeHostnameAllowlist(values) {
	if (!values || values.length === 0) return;
	const normalized = values.map((value) => value.trim()).filter((value) => value.length > 0);
	return normalized.length > 0 ? normalized : void 0;
}
function resolveResponsesLimits(config) {
	const files = config?.files;
	const images = config?.images;
	return {
		maxBodyBytes: config?.maxBodyBytes ?? DEFAULT_BODY_BYTES$1,
		maxUrlParts: typeof config?.maxUrlParts === "number" ? Math.max(0, Math.floor(config.maxUrlParts)) : DEFAULT_MAX_URL_PARTS,
		files: {
			allowUrl: files?.allowUrl ?? true,
			urlAllowlist: normalizeHostnameAllowlist(files?.urlAllowlist),
			allowedMimes: normalizeMimeList(files?.allowedMimes, DEFAULT_INPUT_FILE_MIMES),
			maxBytes: files?.maxBytes ?? DEFAULT_INPUT_FILE_MAX_BYTES,
			maxChars: files?.maxChars ?? DEFAULT_INPUT_FILE_MAX_CHARS,
			maxRedirects: files?.maxRedirects ?? DEFAULT_INPUT_MAX_REDIRECTS,
			timeoutMs: files?.timeoutMs ?? DEFAULT_INPUT_TIMEOUT_MS,
			pdf: {
				maxPages: files?.pdf?.maxPages ?? DEFAULT_INPUT_PDF_MAX_PAGES,
				maxPixels: files?.pdf?.maxPixels ?? DEFAULT_INPUT_PDF_MAX_PIXELS,
				minTextChars: files?.pdf?.minTextChars ?? DEFAULT_INPUT_PDF_MIN_TEXT_CHARS
			}
		},
		images: {
			allowUrl: images?.allowUrl ?? true,
			urlAllowlist: normalizeHostnameAllowlist(images?.urlAllowlist),
			allowedMimes: normalizeMimeList(images?.allowedMimes, DEFAULT_INPUT_IMAGE_MIMES),
			maxBytes: images?.maxBytes ?? DEFAULT_INPUT_IMAGE_MAX_BYTES,
			maxRedirects: images?.maxRedirects ?? DEFAULT_INPUT_MAX_REDIRECTS,
			timeoutMs: images?.timeoutMs ?? DEFAULT_INPUT_TIMEOUT_MS
		}
	};
}
function extractClientTools(body) {
	return body.tools ?? [];
}
function applyToolChoice(params) {
	const { tools, toolChoice } = params;
	if (!toolChoice) return { tools };
	if (toolChoice === "none") return { tools: [] };
	if (toolChoice === "required") {
		if (tools.length === 0) throw new Error("tool_choice=required but no tools were provided");
		return {
			tools,
			extraSystemPrompt: "You must call one of the available tools before responding."
		};
	}
	if (typeof toolChoice === "object" && toolChoice.type === "function") {
		const targetName = toolChoice.function?.name?.trim();
		if (!targetName) throw new Error("tool_choice.function.name is required");
		const matched = tools.filter((tool) => tool.function?.name === targetName);
		if (matched.length === 0) throw new Error(`tool_choice requested unknown tool: ${targetName}`);
		return {
			tools: matched,
			extraSystemPrompt: `You must call the ${targetName} tool before responding.`
		};
	}
	return { tools };
}
function buildAgentPrompt(input) {
	if (typeof input === "string") return { message: input };
	const systemParts = [];
	const conversationEntries = [];
	for (const item of input) if (item.type === "message") {
		const content = extractTextContent(item.content).trim();
		if (!content) continue;
		if (item.role === "system" || item.role === "developer") {
			systemParts.push(content);
			continue;
		}
		const normalizedRole = item.role === "assistant" ? "assistant" : "user";
		const sender = normalizedRole === "assistant" ? "Assistant" : "User";
		conversationEntries.push({
			role: normalizedRole,
			entry: {
				sender,
				body: content
			}
		});
	} else if (item.type === "function_call_output") conversationEntries.push({
		role: "tool",
		entry: {
			sender: `Tool:${item.call_id}`,
			body: item.output
		}
	});
	let message = "";
	if (conversationEntries.length > 0) {
		let currentIndex = -1;
		for (let i = conversationEntries.length - 1; i >= 0; i -= 1) {
			const entryRole = conversationEntries[i]?.role;
			if (entryRole === "user" || entryRole === "tool") {
				currentIndex = i;
				break;
			}
		}
		if (currentIndex < 0) currentIndex = conversationEntries.length - 1;
		const currentEntry = conversationEntries[currentIndex]?.entry;
		if (currentEntry) {
			const historyEntries = conversationEntries.slice(0, currentIndex).map((entry) => entry.entry);
			if (historyEntries.length === 0) message = currentEntry.body;
			else {
				const formatEntry = (entry) => `${entry.sender}: ${entry.body}`;
				message = buildHistoryContextFromEntries({
					entries: [...historyEntries, currentEntry],
					currentMessage: formatEntry(currentEntry),
					formatEntry
				});
			}
		}
	}
	return {
		message,
		extraSystemPrompt: systemParts.length > 0 ? systemParts.join("\n\n") : void 0
	};
}
function resolveOpenResponsesSessionKey(params) {
	return resolveSessionKey({
		...params,
		prefix: "openresponses"
	});
}
function createEmptyUsage() {
	return {
		input_tokens: 0,
		output_tokens: 0,
		total_tokens: 0
	};
}
function toUsage(value) {
	if (!value) return createEmptyUsage();
	const input = value.input ?? 0;
	const output = value.output ?? 0;
	const cacheRead = value.cacheRead ?? 0;
	const cacheWrite = value.cacheWrite ?? 0;
	const total = value.total ?? input + output + cacheRead + cacheWrite;
	return {
		input_tokens: Math.max(0, input),
		output_tokens: Math.max(0, output),
		total_tokens: Math.max(0, total)
	};
}
function extractUsageFromResult(result) {
	const meta = result?.meta;
	return toUsage(meta && typeof meta === "object" ? meta.agentMeta?.usage : void 0);
}
function createResponseResource(params) {
	return {
		id: params.id,
		object: "response",
		created_at: Math.floor(Date.now() / 1e3),
		status: params.status,
		model: params.model,
		output: params.output,
		usage: params.usage ?? createEmptyUsage(),
		error: params.error
	};
}
function createAssistantOutputItem(params) {
	return {
		type: "message",
		id: params.id,
		role: "assistant",
		content: [{
			type: "output_text",
			text: params.text
		}],
		status: params.status
	};
}
async function handleOpenResponsesHttpRequest(req, res, opts) {
	if (new URL(req.url ?? "/", `http://${req.headers.host || "localhost"}`).pathname !== "/v1/responses") return false;
	if (req.method !== "POST") {
		sendMethodNotAllowed(res);
		return true;
	}
	const token = getBearerToken(req);
	const authResult = await authorizeGatewayConnect({
		auth: opts.auth,
		connectAuth: {
			token,
			password: token
		},
		req,
		trustedProxies: opts.trustedProxies,
		rateLimiter: opts.rateLimiter
	});
	if (!authResult.ok) {
		sendGatewayAuthFailure(res, authResult);
		return true;
	}
	const limits = resolveResponsesLimits(opts.config);
	const body = await readJsonBodyOrError(req, res, opts.maxBodyBytes ?? (opts.config?.maxBodyBytes ? limits.maxBodyBytes : Math.max(limits.maxBodyBytes, limits.files.maxBytes * 2, limits.images.maxBytes * 2)));
	if (body === void 0) return true;
	const parseResult = CreateResponseBodySchema.safeParse(body);
	if (!parseResult.success) {
		const issue = parseResult.error.issues[0];
		sendJson$1(res, 400, { error: {
			message: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid request body",
			type: "invalid_request_error"
		} });
		return true;
	}
	const payload = parseResult.data;
	const stream = Boolean(payload.stream);
	const model = payload.model;
	const user = payload.user;
	let images = [];
	let fileContexts = [];
	let urlParts = 0;
	const markUrlPart = () => {
		urlParts += 1;
		if (urlParts > limits.maxUrlParts) throw new Error(`Too many URL-based input sources: ${urlParts} (limit: ${limits.maxUrlParts})`);
	};
	try {
		if (Array.isArray(payload.input)) {
			for (const item of payload.input) if (item.type === "message" && typeof item.content !== "string") for (const part of item.content) {
				if (part.type === "input_image") {
					const source = part.source;
					const sourceType = source.type === "base64" || source.type === "url" ? source.type : void 0;
					if (!sourceType) throw new Error("input_image must have 'source.url' or 'source.data'");
					if (sourceType === "url") markUrlPart();
					const image = await extractImageContentFromSource({
						type: sourceType,
						url: source.url,
						data: source.data,
						mediaType: source.media_type
					}, limits.images);
					images.push(image);
					continue;
				}
				if (part.type === "input_file") {
					const source = part.source;
					const sourceType = source.type === "base64" || source.type === "url" ? source.type : void 0;
					if (!sourceType) throw new Error("input_file must have 'source.url' or 'source.data'");
					if (sourceType === "url") markUrlPart();
					const file = await extractFileContentFromSource({
						source: {
							type: sourceType,
							url: source.url,
							data: source.data,
							mediaType: source.media_type,
							filename: source.filename
						},
						limits: limits.files
					});
					if (file.text?.trim()) fileContexts.push(`<file name="${file.filename}">\n${file.text}\n</file>`);
					else if (file.images && file.images.length > 0) fileContexts.push(`<file name="${file.filename}">[PDF content rendered to images]</file>`);
					if (file.images && file.images.length > 0) images = images.concat(file.images);
				}
			}
		}
	} catch (err) {
		logWarn(`openresponses: request parsing failed: ${String(err)}`);
		sendJson$1(res, 400, { error: {
			message: "invalid request",
			type: "invalid_request_error"
		} });
		return true;
	}
	const clientTools = extractClientTools(payload);
	let toolChoicePrompt;
	let resolvedClientTools = clientTools;
	try {
		const toolChoiceResult = applyToolChoice({
			tools: clientTools,
			toolChoice: payload.tool_choice
		});
		resolvedClientTools = toolChoiceResult.tools;
		toolChoicePrompt = toolChoiceResult.extraSystemPrompt;
	} catch (err) {
		logWarn(`openresponses: tool configuration failed: ${String(err)}`);
		sendJson$1(res, 400, { error: {
			message: "invalid tool configuration",
			type: "invalid_request_error"
		} });
		return true;
	}
	const sessionKey = resolveOpenResponsesSessionKey({
		req,
		agentId: resolveAgentIdForRequest({
			req,
			model
		}),
		user
	});
	const prompt = buildAgentPrompt(payload.input);
	const fileContext = fileContexts.length > 0 ? fileContexts.join("\n\n") : void 0;
	const toolChoiceContext = toolChoicePrompt?.trim();
	const extraSystemPrompt = [
		payload.instructions,
		prompt.extraSystemPrompt,
		toolChoiceContext,
		fileContext
	].filter(Boolean).join("\n\n");
	if (!prompt.message) {
		sendJson$1(res, 400, { error: {
			message: "Missing user message in `input`.",
			type: "invalid_request_error"
		} });
		return true;
	}
	const responseId = `resp_${randomUUID()}`;
	const outputItemId = `msg_${randomUUID()}`;
	const deps = createDefaultDeps();
	const streamParams = typeof payload.max_output_tokens === "number" ? { maxTokens: payload.max_output_tokens } : void 0;
	if (!stream) {
		try {
			const result = await agentCommand({
				message: prompt.message,
				images: images.length > 0 ? images : void 0,
				clientTools: resolvedClientTools.length > 0 ? resolvedClientTools : void 0,
				extraSystemPrompt: extraSystemPrompt || void 0,
				streamParams: streamParams ?? void 0,
				sessionKey,
				runId: responseId,
				deliver: false,
				messageChannel: "webchat",
				bestEffortDeliver: false
			}, defaultRuntime, deps);
			const payloads = result?.payloads;
			const usage = extractUsageFromResult(result);
			const meta = result?.meta;
			const stopReason = meta && typeof meta === "object" ? meta.stopReason : void 0;
			const pendingToolCalls = meta && typeof meta === "object" ? meta.pendingToolCalls : void 0;
			if (stopReason === "tool_calls" && pendingToolCalls && pendingToolCalls.length > 0) {
				const functionCall = pendingToolCalls[0];
				sendJson$1(res, 200, createResponseResource({
					id: responseId,
					model,
					status: "incomplete",
					output: [{
						type: "function_call",
						id: `call_${randomUUID()}`,
						call_id: functionCall.id,
						name: functionCall.name,
						arguments: functionCall.arguments
					}],
					usage
				}));
				return true;
			}
			sendJson$1(res, 200, createResponseResource({
				id: responseId,
				model,
				status: "completed",
				output: [createAssistantOutputItem({
					id: outputItemId,
					text: Array.isArray(payloads) && payloads.length > 0 ? payloads.map((p) => typeof p.text === "string" ? p.text : "").filter(Boolean).join("\n\n") : "No response from OpenClaw.",
					status: "completed"
				})],
				usage
			}));
		} catch (err) {
			logWarn(`openresponses: non-stream response failed: ${String(err)}`);
			sendJson$1(res, 500, createResponseResource({
				id: responseId,
				model,
				status: "failed",
				output: [],
				error: {
					code: "api_error",
					message: "internal error"
				}
			}));
		}
		return true;
	}
	setSseHeaders(res);
	let accumulatedText = "";
	let sawAssistantDelta = false;
	let closed = false;
	let unsubscribe = () => {};
	let finalUsage;
	let finalizeRequested = null;
	const maybeFinalize = () => {
		if (closed) return;
		if (!finalizeRequested) return;
		if (!finalUsage) return;
		const usage = finalUsage;
		closed = true;
		unsubscribe();
		writeSseEvent(res, {
			type: "response.output_text.done",
			item_id: outputItemId,
			output_index: 0,
			content_index: 0,
			text: finalizeRequested.text
		});
		writeSseEvent(res, {
			type: "response.content_part.done",
			item_id: outputItemId,
			output_index: 0,
			content_index: 0,
			part: {
				type: "output_text",
				text: finalizeRequested.text
			}
		});
		const completedItem = createAssistantOutputItem({
			id: outputItemId,
			text: finalizeRequested.text,
			status: "completed"
		});
		writeSseEvent(res, {
			type: "response.output_item.done",
			output_index: 0,
			item: completedItem
		});
		writeSseEvent(res, {
			type: "response.completed",
			response: createResponseResource({
				id: responseId,
				model,
				status: finalizeRequested.status,
				output: [completedItem],
				usage
			})
		});
		writeDone(res);
		res.end();
	};
	const requestFinalize = (status, text) => {
		if (finalizeRequested) return;
		finalizeRequested = {
			status,
			text
		};
		maybeFinalize();
	};
	const initialResponse = createResponseResource({
		id: responseId,
		model,
		status: "in_progress",
		output: []
	});
	writeSseEvent(res, {
		type: "response.created",
		response: initialResponse
	});
	writeSseEvent(res, {
		type: "response.in_progress",
		response: initialResponse
	});
	writeSseEvent(res, {
		type: "response.output_item.added",
		output_index: 0,
		item: createAssistantOutputItem({
			id: outputItemId,
			text: "",
			status: "in_progress"
		})
	});
	writeSseEvent(res, {
		type: "response.content_part.added",
		item_id: outputItemId,
		output_index: 0,
		content_index: 0,
		part: {
			type: "output_text",
			text: ""
		}
	});
	unsubscribe = onAgentEvent((evt) => {
		if (evt.runId !== responseId) return;
		if (closed) return;
		if (evt.stream === "assistant") {
			const delta = evt.data?.delta;
			const text = evt.data?.text;
			const content = typeof delta === "string" ? delta : typeof text === "string" ? text : "";
			if (!content) return;
			sawAssistantDelta = true;
			accumulatedText += content;
			writeSseEvent(res, {
				type: "response.output_text.delta",
				item_id: outputItemId,
				output_index: 0,
				content_index: 0,
				delta: content
			});
			return;
		}
		if (evt.stream === "lifecycle") {
			const phase = evt.data?.phase;
			if (phase === "end" || phase === "error") requestFinalize(phase === "error" ? "failed" : "completed", accumulatedText || "No response from OpenClaw.");
		}
	});
	req.on("close", () => {
		closed = true;
		unsubscribe();
	});
	(async () => {
		try {
			const result = await agentCommand({
				message: prompt.message,
				images: images.length > 0 ? images : void 0,
				clientTools: resolvedClientTools.length > 0 ? resolvedClientTools : void 0,
				extraSystemPrompt: extraSystemPrompt || void 0,
				streamParams: streamParams ?? void 0,
				sessionKey,
				runId: responseId,
				deliver: false,
				messageChannel: "webchat",
				bestEffortDeliver: false
			}, defaultRuntime, deps);
			finalUsage = extractUsageFromResult(result);
			maybeFinalize();
			if (closed) return;
			if (!sawAssistantDelta) {
				const resultAny = result;
				const payloads = resultAny.payloads;
				const meta = resultAny.meta;
				const stopReason = meta && typeof meta === "object" ? meta.stopReason : void 0;
				const pendingToolCalls = meta && typeof meta === "object" ? meta.pendingToolCalls : void 0;
				if (stopReason === "tool_calls" && pendingToolCalls && pendingToolCalls.length > 0) {
					const functionCall = pendingToolCalls[0];
					const usage = finalUsage ?? createEmptyUsage();
					writeSseEvent(res, {
						type: "response.output_text.done",
						item_id: outputItemId,
						output_index: 0,
						content_index: 0,
						text: ""
					});
					writeSseEvent(res, {
						type: "response.content_part.done",
						item_id: outputItemId,
						output_index: 0,
						content_index: 0,
						part: {
							type: "output_text",
							text: ""
						}
					});
					const completedItem = createAssistantOutputItem({
						id: outputItemId,
						text: "",
						status: "completed"
					});
					writeSseEvent(res, {
						type: "response.output_item.done",
						output_index: 0,
						item: completedItem
					});
					const functionCallItem = {
						type: "function_call",
						id: `call_${randomUUID()}`,
						call_id: functionCall.id,
						name: functionCall.name,
						arguments: functionCall.arguments
					};
					writeSseEvent(res, {
						type: "response.output_item.added",
						output_index: 1,
						item: functionCallItem
					});
					writeSseEvent(res, {
						type: "response.output_item.done",
						output_index: 1,
						item: {
							...functionCallItem,
							status: "completed"
						}
					});
					const incompleteResponse = createResponseResource({
						id: responseId,
						model,
						status: "incomplete",
						output: [completedItem, functionCallItem],
						usage
					});
					closed = true;
					unsubscribe();
					writeSseEvent(res, {
						type: "response.completed",
						response: incompleteResponse
					});
					writeDone(res);
					res.end();
					return;
				}
				const content = Array.isArray(payloads) && payloads.length > 0 ? payloads.map((p) => typeof p.text === "string" ? p.text : "").filter(Boolean).join("\n\n") : "No response from OpenClaw.";
				accumulatedText = content;
				sawAssistantDelta = true;
				writeSseEvent(res, {
					type: "response.output_text.delta",
					item_id: outputItemId,
					output_index: 0,
					content_index: 0,
					delta: content
				});
			}
		} catch (err) {
			logWarn(`openresponses: streaming response failed: ${String(err)}`);
			if (closed) return;
			finalUsage = finalUsage ?? createEmptyUsage();
			writeSseEvent(res, {
				type: "response.failed",
				response: createResponseResource({
					id: responseId,
					model,
					status: "failed",
					output: [],
					error: {
						code: "api_error",
						message: "internal error"
					},
					usage: finalUsage
				})
			});
			emitAgentEvent({
				runId: responseId,
				stream: "lifecycle",
				data: { phase: "error" }
			});
		} finally {
			if (!closed) emitAgentEvent({
				runId: responseId,
				stream: "lifecycle",
				data: { phase: "end" }
			});
		}
	})();
	return true;
}

//#endregion
//#region src/gateway/tools-invoke-http.ts
const DEFAULT_BODY_BYTES = 2 * 1024 * 1024;
const MEMORY_TOOL_NAMES = new Set(["memory_search", "memory_get"]);
/**
* Tools denied via HTTP /tools/invoke regardless of session policy.
* Prevents RCE and privilege escalation from HTTP API surface.
* Configurable via gateway.tools.{deny,allow} in openclaw.json.
*/
const DEFAULT_GATEWAY_HTTP_TOOL_DENY = [
	"sessions_spawn",
	"sessions_send",
	"gateway",
	"whatsapp_login"
];
function resolveSessionKeyFromBody(body) {
	if (typeof body.sessionKey === "string" && body.sessionKey.trim()) return body.sessionKey.trim();
}
function resolveMemoryToolDisableReasons(cfg) {
	if (!process.env.VITEST) return [];
	const reasons = [];
	const plugins = cfg.plugins;
	const slotRaw = plugins?.slots?.memory;
	const slotDisabled = slotRaw === null || typeof slotRaw === "string" && slotRaw.trim().toLowerCase() === "none";
	const pluginsDisabled = plugins?.enabled === false;
	const defaultDisabled = isTestDefaultMemorySlotDisabled(cfg);
	if (pluginsDisabled) reasons.push("plugins.enabled=false");
	if (slotDisabled) reasons.push(slotRaw === null ? "plugins.slots.memory=null" : "plugins.slots.memory=\"none\"");
	if (!pluginsDisabled && !slotDisabled && defaultDisabled) reasons.push("memory plugin disabled by test default");
	return reasons;
}
function mergeActionIntoArgsIfSupported(params) {
	const { toolSchema, action, args } = params;
	if (!action) return args;
	if (args.action !== void 0) return args;
	const schemaObj = toolSchema;
	if (!Boolean(schemaObj && typeof schemaObj === "object" && schemaObj.properties && "action" in schemaObj.properties)) return args;
	return {
		...args,
		action
	};
}
function getErrorMessage(err) {
	if (err instanceof Error) return err.message || String(err);
	if (typeof err === "string") return err;
	return String(err);
}
function isToolInputError(err) {
	if (err instanceof ToolInputError) return true;
	return typeof err === "object" && err !== null && "name" in err && err.name === "ToolInputError";
}
async function handleToolsInvokeHttpRequest(req, res, opts) {
	if (new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`).pathname !== "/tools/invoke") return false;
	if (req.method !== "POST") {
		sendMethodNotAllowed(res, "POST");
		return true;
	}
	const cfg = loadConfig();
	const token = getBearerToken(req);
	const authResult = await authorizeGatewayConnect({
		auth: opts.auth,
		connectAuth: token ? {
			token,
			password: token
		} : null,
		req,
		trustedProxies: opts.trustedProxies ?? cfg.gateway?.trustedProxies,
		rateLimiter: opts.rateLimiter
	});
	if (!authResult.ok) {
		sendGatewayAuthFailure(res, authResult);
		return true;
	}
	const bodyUnknown = await readJsonBodyOrError(req, res, opts.maxBodyBytes ?? DEFAULT_BODY_BYTES);
	if (bodyUnknown === void 0) return true;
	const body = bodyUnknown ?? {};
	const toolName = typeof body.tool === "string" ? body.tool.trim() : "";
	if (!toolName) {
		sendInvalidRequest(res, "tools.invoke requires body.tool");
		return true;
	}
	if (process.env.VITEST && MEMORY_TOOL_NAMES.has(toolName)) {
		const reasons = resolveMemoryToolDisableReasons(cfg);
		if (reasons.length > 0) {
			sendJson$1(res, 400, {
				ok: false,
				error: {
					type: "invalid_request",
					message: `memory tools are disabled in tests${reasons.length > 0 ? ` (${reasons.join(", ")})` : ""}. Enable by setting plugins.slots.memory="memory-core" (and ensure plugins.enabled is not false).`
				}
			});
			return true;
		}
	}
	const action = typeof body.action === "string" ? body.action.trim() : void 0;
	const argsRaw = body.args;
	const args = argsRaw && typeof argsRaw === "object" && !Array.isArray(argsRaw) ? argsRaw : {};
	const rawSessionKey = resolveSessionKeyFromBody(body);
	const sessionKey = !rawSessionKey || rawSessionKey === "main" ? resolveMainSessionKey(cfg) : rawSessionKey;
	const messageChannel = normalizeMessageChannel(getHeader(req, "x-openclaw-message-channel") ?? "");
	const accountId = getHeader(req, "x-openclaw-account-id")?.trim() || void 0;
	const { agentId, globalPolicy, globalProviderPolicy, agentPolicy, agentProviderPolicy, profile, providerProfile, profileAlsoAllow, providerProfileAlsoAllow } = resolveEffectiveToolPolicy({
		config: cfg,
		sessionKey
	});
	const profilePolicy = resolveToolProfilePolicy(profile);
	const providerProfilePolicy = resolveToolProfilePolicy(providerProfile);
	const mergeAlsoAllow = (policy, alsoAllow) => {
		if (!policy?.allow || !Array.isArray(alsoAllow) || alsoAllow.length === 0) return policy;
		return {
			...policy,
			allow: Array.from(new Set([...policy.allow, ...alsoAllow]))
		};
	};
	const profilePolicyWithAlsoAllow = mergeAlsoAllow(profilePolicy, profileAlsoAllow);
	const providerProfilePolicyWithAlsoAllow = mergeAlsoAllow(providerProfilePolicy, providerProfileAlsoAllow);
	const groupPolicy = resolveGroupToolPolicy({
		config: cfg,
		sessionKey,
		messageProvider: messageChannel ?? void 0,
		accountId: accountId ?? null
	});
	const subagentPolicy = isSubagentSessionKey(sessionKey) ? resolveSubagentToolPolicy(cfg) : void 0;
	const allTools = createOpenClawTools({
		agentSessionKey: sessionKey,
		agentChannel: messageChannel ?? void 0,
		agentAccountId: accountId,
		config: cfg,
		pluginToolAllowlist: collectExplicitAllowlist([
			profilePolicy,
			providerProfilePolicy,
			globalPolicy,
			globalProviderPolicy,
			agentPolicy,
			agentProviderPolicy,
			groupPolicy,
			subagentPolicy
		])
	});
	const coreToolNames = new Set(allTools.filter((tool) => !getPluginToolMeta(tool)).map((tool) => normalizeToolName(tool.name)).filter(Boolean));
	const pluginGroups = buildPluginToolGroups({
		tools: allTools,
		toolMeta: (tool) => getPluginToolMeta(tool)
	});
	const resolvePolicy = (policy, label) => {
		const resolved = stripPluginOnlyAllowlist(policy, pluginGroups, coreToolNames);
		if (resolved.unknownAllowlist.length > 0) logWarn(`tools: ${label} allowlist contains unknown entries (${resolved.unknownAllowlist.join(", ")}). ${resolved.strippedAllowlist ? "Ignoring allowlist so core tools remain available. Use tools.alsoAllow for additive plugin tool enablement." : "These entries won't match any tool unless the plugin is enabled."}`);
		return expandPolicyWithPluginGroups(resolved.policy, pluginGroups);
	};
	const profilePolicyExpanded = resolvePolicy(profilePolicyWithAlsoAllow, profile ? `tools.profile (${profile})` : "tools.profile");
	const providerProfileExpanded = resolvePolicy(providerProfilePolicyWithAlsoAllow, providerProfile ? `tools.byProvider.profile (${providerProfile})` : "tools.byProvider.profile");
	const globalPolicyExpanded = resolvePolicy(globalPolicy, "tools.allow");
	const globalProviderExpanded = resolvePolicy(globalProviderPolicy, "tools.byProvider.allow");
	const agentPolicyExpanded = resolvePolicy(agentPolicy, agentId ? `agents.${agentId}.tools.allow` : "agent tools.allow");
	const agentProviderExpanded = resolvePolicy(agentProviderPolicy, agentId ? `agents.${agentId}.tools.byProvider.allow` : "agent tools.byProvider.allow");
	const groupPolicyExpanded = resolvePolicy(groupPolicy, "group tools.allow");
	const subagentPolicyExpanded = expandPolicyWithPluginGroups(subagentPolicy, pluginGroups);
	const toolsFiltered = profilePolicyExpanded ? filterToolsByPolicy(allTools, profilePolicyExpanded) : allTools;
	const providerProfileFiltered = providerProfileExpanded ? filterToolsByPolicy(toolsFiltered, providerProfileExpanded) : toolsFiltered;
	const globalFiltered = globalPolicyExpanded ? filterToolsByPolicy(providerProfileFiltered, globalPolicyExpanded) : providerProfileFiltered;
	const globalProviderFiltered = globalProviderExpanded ? filterToolsByPolicy(globalFiltered, globalProviderExpanded) : globalFiltered;
	const agentFiltered = agentPolicyExpanded ? filterToolsByPolicy(globalProviderFiltered, agentPolicyExpanded) : globalProviderFiltered;
	const agentProviderFiltered = agentProviderExpanded ? filterToolsByPolicy(agentFiltered, agentProviderExpanded) : agentFiltered;
	const groupFiltered = groupPolicyExpanded ? filterToolsByPolicy(agentProviderFiltered, groupPolicyExpanded) : agentProviderFiltered;
	const subagentFiltered = subagentPolicyExpanded ? filterToolsByPolicy(groupFiltered, subagentPolicyExpanded) : groupFiltered;
	const gatewayToolsCfg = cfg.gateway?.tools;
	const gatewayDenyNames = DEFAULT_GATEWAY_HTTP_TOOL_DENY.filter((name) => !gatewayToolsCfg?.allow?.includes(name)).concat(Array.isArray(gatewayToolsCfg?.deny) ? gatewayToolsCfg.deny : []);
	const gatewayDenySet = new Set(gatewayDenyNames);
	const tool = subagentFiltered.filter((t) => !gatewayDenySet.has(t.name)).find((t) => t.name === toolName);
	if (!tool) {
		sendJson$1(res, 404, {
			ok: false,
			error: {
				type: "not_found",
				message: `Tool not available: ${toolName}`
			}
		});
		return true;
	}
	try {
		const toolArgs = mergeActionIntoArgsIfSupported({
			toolSchema: tool.parameters,
			action,
			args
		});
		sendJson$1(res, 200, {
			ok: true,
			result: await tool.execute?.(`http-${Date.now()}`, toolArgs)
		});
	} catch (err) {
		if (isToolInputError(err)) {
			sendJson$1(res, 400, {
				ok: false,
				error: {
					type: "tool_error",
					message: getErrorMessage(err) || "invalid tool arguments"
				}
			});
			return true;
		}
		logWarn(`tools-invoke: tool execution failed: ${String(err)}`);
		sendJson$1(res, 500, {
			ok: false,
			error: {
				type: "tool_error",
				message: "tool execution failed"
			}
		});
	}
	return true;
}

//#endregion
//#region src/gateway/server-http.ts
const HOOK_AUTH_FAILURE_LIMIT = 20;
const HOOK_AUTH_FAILURE_WINDOW_MS = 6e4;
const HOOK_AUTH_FAILURE_TRACK_MAX = 2048;
function sendJson(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.end(JSON.stringify(body));
}
function isCanvasPath(pathname) {
	return pathname === A2UI_PATH || pathname.startsWith(`${A2UI_PATH}/`) || pathname === CANVAS_HOST_PATH || pathname.startsWith(`${CANVAS_HOST_PATH}/`) || pathname === CANVAS_WS_PATH;
}
function hasAuthorizedWsClientForIp(clients, clientIp) {
	for (const client of clients) if (client.clientIp && client.clientIp === clientIp) return true;
	return false;
}
async function authorizeCanvasRequest(params) {
	const { req, auth, trustedProxies, clients, rateLimiter } = params;
	if (isLocalDirectRequest(req, trustedProxies)) return { ok: true };
	let lastAuthFailure = null;
	const token = getBearerToken(req);
	if (token) {
		const authResult = await authorizeGatewayConnect({
			auth: {
				...auth,
				allowTailscale: false
			},
			connectAuth: {
				token,
				password: token
			},
			req,
			trustedProxies,
			rateLimiter
		});
		if (authResult.ok) return authResult;
		lastAuthFailure = authResult;
	}
	const clientIp = resolveGatewayClientIp({
		remoteAddr: req.socket?.remoteAddress ?? "",
		forwardedFor: getHeader(req, "x-forwarded-for"),
		realIp: getHeader(req, "x-real-ip"),
		trustedProxies
	});
	if (!clientIp) return lastAuthFailure ?? {
		ok: false,
		reason: "unauthorized"
	};
	if (!isPrivateOrLoopbackAddress(clientIp)) return lastAuthFailure ?? {
		ok: false,
		reason: "unauthorized"
	};
	if (hasAuthorizedWsClientForIp(clients, clientIp)) return { ok: true };
	return lastAuthFailure ?? {
		ok: false,
		reason: "unauthorized"
	};
}
function writeUpgradeAuthFailure(socket, auth) {
	if (auth.rateLimited) {
		const retryAfterSeconds = auth.retryAfterMs && auth.retryAfterMs > 0 ? Math.ceil(auth.retryAfterMs / 1e3) : void 0;
		socket.write([
			"HTTP/1.1 429 Too Many Requests",
			retryAfterSeconds ? `Retry-After: ${retryAfterSeconds}` : void 0,
			"Content-Type: application/json; charset=utf-8",
			"Connection: close",
			"",
			JSON.stringify({ error: {
				message: "Too many failed authentication attempts. Please try again later.",
				type: "rate_limited"
			} })
		].filter(Boolean).join("\r\n"));
		return;
	}
	socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
}
function createHooksRequestHandler(opts) {
	const { getHooksConfig, bindHost, port, logHooks, dispatchAgentHook, dispatchWakeHook } = opts;
	const hookAuthFailures = /* @__PURE__ */ new Map();
	const resolveHookClientKey = (req) => {
		return req.socket?.remoteAddress?.trim() || "unknown";
	};
	const recordHookAuthFailure = (clientKey, nowMs) => {
		if (!hookAuthFailures.has(clientKey) && hookAuthFailures.size >= HOOK_AUTH_FAILURE_TRACK_MAX) {
			for (const [key, entry] of hookAuthFailures) if (nowMs - entry.windowStartedAtMs >= HOOK_AUTH_FAILURE_WINDOW_MS) hookAuthFailures.delete(key);
			if (hookAuthFailures.size >= HOOK_AUTH_FAILURE_TRACK_MAX) {
				let toRemove = Math.floor(hookAuthFailures.size / 2);
				for (const key of hookAuthFailures.keys()) {
					if (toRemove <= 0) break;
					hookAuthFailures.delete(key);
					toRemove--;
				}
			}
		}
		const current = hookAuthFailures.get(clientKey);
		const next = !current || nowMs - current.windowStartedAtMs >= HOOK_AUTH_FAILURE_WINDOW_MS ? {
			count: 1,
			windowStartedAtMs: nowMs
		} : {
			count: current.count + 1,
			windowStartedAtMs: current.windowStartedAtMs
		};
		if (hookAuthFailures.has(clientKey)) hookAuthFailures.delete(clientKey);
		hookAuthFailures.set(clientKey, next);
		if (next.count <= HOOK_AUTH_FAILURE_LIMIT) return { throttled: false };
		const retryAfterMs = Math.max(1, next.windowStartedAtMs + HOOK_AUTH_FAILURE_WINDOW_MS - nowMs);
		return {
			throttled: true,
			retryAfterSeconds: Math.ceil(retryAfterMs / 1e3)
		};
	};
	const clearHookAuthFailure = (clientKey) => {
		hookAuthFailures.delete(clientKey);
	};
	return async (req, res) => {
		const hooksConfig = getHooksConfig();
		if (!hooksConfig) return false;
		const url = new URL(req.url ?? "/", `http://${bindHost}:${port}`);
		const basePath = hooksConfig.basePath;
		if (url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`)) return false;
		if (url.searchParams.has("token")) {
			res.statusCode = 400;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Hook token must be provided via Authorization: Bearer <token> or X-OpenClaw-Token header (query parameters are not allowed).");
			return true;
		}
		const token = extractHookToken(req);
		const clientKey = resolveHookClientKey(req);
		if (!safeEqualSecret(token, hooksConfig.token)) {
			const throttle = recordHookAuthFailure(clientKey, Date.now());
			if (throttle.throttled) {
				const retryAfter = throttle.retryAfterSeconds ?? 1;
				res.statusCode = 429;
				res.setHeader("Retry-After", String(retryAfter));
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.end("Too Many Requests");
				logHooks.warn(`hook auth throttled for ${clientKey}; retry-after=${retryAfter}s`);
				return true;
			}
			res.statusCode = 401;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Unauthorized");
			return true;
		}
		clearHookAuthFailure(clientKey);
		if (req.method !== "POST") {
			res.statusCode = 405;
			res.setHeader("Allow", "POST");
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Method Not Allowed");
			return true;
		}
		const subPath = url.pathname.slice(basePath.length).replace(/^\/+/, "");
		if (!subPath) {
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Not Found");
			return true;
		}
		const body = await readJsonBody(req, hooksConfig.maxBodyBytes);
		if (!body.ok) {
			sendJson(res, body.error === "payload too large" ? 413 : body.error === "request body timeout" ? 408 : 400, {
				ok: false,
				error: body.error
			});
			return true;
		}
		const payload = typeof body.value === "object" && body.value !== null ? body.value : {};
		const headers = normalizeHookHeaders(req);
		if (subPath === "wake") {
			const normalized = normalizeWakePayload(payload);
			if (!normalized.ok) {
				sendJson(res, 400, {
					ok: false,
					error: normalized.error
				});
				return true;
			}
			dispatchWakeHook(normalized.value);
			sendJson(res, 200, {
				ok: true,
				mode: normalized.value.mode
			});
			return true;
		}
		if (subPath === "agent") {
			const normalized = normalizeAgentPayload(payload);
			if (!normalized.ok) {
				sendJson(res, 400, {
					ok: false,
					error: normalized.error
				});
				return true;
			}
			if (!isHookAgentAllowed(hooksConfig, normalized.value.agentId)) {
				sendJson(res, 400, {
					ok: false,
					error: getHookAgentPolicyError()
				});
				return true;
			}
			const sessionKey = resolveHookSessionKey({
				hooksConfig,
				source: "request",
				sessionKey: normalized.value.sessionKey
			});
			if (!sessionKey.ok) {
				sendJson(res, 400, {
					ok: false,
					error: sessionKey.error
				});
				return true;
			}
			sendJson(res, 202, {
				ok: true,
				runId: dispatchAgentHook({
					...normalized.value,
					sessionKey: sessionKey.value,
					agentId: resolveHookTargetAgentId(hooksConfig, normalized.value.agentId)
				})
			});
			return true;
		}
		if (hooksConfig.mappings.length > 0) try {
			const mapped = await applyHookMappings(hooksConfig.mappings, {
				payload,
				headers,
				url,
				path: subPath
			});
			if (mapped) {
				if (!mapped.ok) {
					sendJson(res, 400, {
						ok: false,
						error: mapped.error
					});
					return true;
				}
				if (mapped.action === null) {
					res.statusCode = 204;
					res.end();
					return true;
				}
				if (mapped.action.kind === "wake") {
					dispatchWakeHook({
						text: mapped.action.text,
						mode: mapped.action.mode
					});
					sendJson(res, 200, {
						ok: true,
						mode: mapped.action.mode
					});
					return true;
				}
				const channel = resolveHookChannel(mapped.action.channel);
				if (!channel) {
					sendJson(res, 400, {
						ok: false,
						error: getHookChannelError()
					});
					return true;
				}
				if (!isHookAgentAllowed(hooksConfig, mapped.action.agentId)) {
					sendJson(res, 400, {
						ok: false,
						error: getHookAgentPolicyError()
					});
					return true;
				}
				const sessionKey = resolveHookSessionKey({
					hooksConfig,
					source: "mapping",
					sessionKey: mapped.action.sessionKey
				});
				if (!sessionKey.ok) {
					sendJson(res, 400, {
						ok: false,
						error: sessionKey.error
					});
					return true;
				}
				sendJson(res, 202, {
					ok: true,
					runId: dispatchAgentHook({
						message: mapped.action.message,
						name: mapped.action.name ?? "Hook",
						agentId: resolveHookTargetAgentId(hooksConfig, mapped.action.agentId),
						wakeMode: mapped.action.wakeMode,
						sessionKey: sessionKey.value,
						deliver: resolveHookDeliver(mapped.action.deliver),
						channel,
						to: mapped.action.to,
						model: mapped.action.model,
						thinking: mapped.action.thinking,
						timeoutSeconds: mapped.action.timeoutSeconds,
						allowUnsafeExternalContent: mapped.action.allowUnsafeExternalContent
					})
				});
				return true;
			}
		} catch (err) {
			logHooks.warn(`hook mapping failed: ${String(err)}`);
			sendJson(res, 500, {
				ok: false,
				error: "hook mapping failed"
			});
			return true;
		}
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("Not Found");
		return true;
	};
}
function createGatewayHttpServer(opts) {
	const { canvasHost, clients, controlUiEnabled, controlUiBasePath, controlUiRoot, openAiChatCompletionsEnabled, openResponsesEnabled, openResponsesConfig, handleHooksRequest, handlePluginRequest, resolvedAuth, rateLimiter } = opts;
	const httpServer = opts.tlsOptions ? createServer$1(opts.tlsOptions, (req, res) => {
		handleRequest(req, res);
	}) : createServer((req, res) => {
		handleRequest(req, res);
	});
	async function handleRequest(req, res) {
		if (String(req.headers.upgrade ?? "").toLowerCase() === "websocket") return;
		try {
			const configSnapshot = loadConfig();
			const trustedProxies = configSnapshot.gateway?.trustedProxies ?? [];
			const requestPath = new URL(req.url ?? "/", "http://localhost").pathname;
			if (await handleHooksRequest(req, res)) return;
			if (await handleToolsInvokeHttpRequest(req, res, {
				auth: resolvedAuth,
				trustedProxies,
				rateLimiter
			})) return;
			if (await handleSlackHttpRequest(req, res)) return;
			if (handlePluginRequest) {
				if (requestPath.startsWith("/api/channels/")) {
					const token = getBearerToken(req);
					const authResult = await authorizeGatewayConnect({
						auth: resolvedAuth,
						connectAuth: token ? {
							token,
							password: token
						} : null,
						req,
						trustedProxies,
						rateLimiter
					});
					if (!authResult.ok) {
						sendGatewayAuthFailure(res, authResult);
						return;
					}
				}
				if (await handlePluginRequest(req, res)) return;
			}
			if (openResponsesEnabled) {
				if (await handleOpenResponsesHttpRequest(req, res, {
					auth: resolvedAuth,
					config: openResponsesConfig,
					trustedProxies,
					rateLimiter
				})) return;
			}
			if (openAiChatCompletionsEnabled) {
				if (await handleOpenAiHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					rateLimiter
				})) return;
			}
			if (canvasHost) {
				if (isCanvasPath(requestPath)) {
					const ok = await authorizeCanvasRequest({
						req,
						auth: resolvedAuth,
						trustedProxies,
						clients,
						rateLimiter
					});
					if (!ok.ok) {
						sendGatewayAuthFailure(res, ok);
						return;
					}
				}
				if (await handleA2uiHttpRequest(req, res)) return;
				if (await canvasHost.handleHttpRequest(req, res)) return;
			}
			if (controlUiEnabled) {
				if (handleControlUiAvatarRequest(req, res, {
					basePath: controlUiBasePath,
					resolveAvatar: (agentId) => resolveAgentAvatar(configSnapshot, agentId)
				})) return;
				if (handleControlUiHttpRequest(req, res, {
					basePath: controlUiBasePath,
					config: configSnapshot,
					root: controlUiRoot
				})) return;
			}
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Not Found");
		} catch {
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Internal Server Error");
		}
	}
	return httpServer;
}
function attachGatewayUpgradeHandler(opts) {
	const { httpServer, wss, canvasHost, clients, resolvedAuth, rateLimiter } = opts;
	httpServer.on("upgrade", (req, socket, head) => {
		(async () => {
			if (canvasHost) {
				if (new URL(req.url ?? "/", "http://localhost").pathname === CANVAS_WS_PATH) {
					const ok = await authorizeCanvasRequest({
						req,
						auth: resolvedAuth,
						trustedProxies: loadConfig().gateway?.trustedProxies ?? [],
						clients,
						rateLimiter
					});
					if (!ok.ok) {
						writeUpgradeAuthFailure(socket, ok);
						socket.destroy();
						return;
					}
				}
				if (canvasHost.handleUpgrade(req, socket, head)) return;
			}
			wss.handleUpgrade(req, socket, head, (ws) => {
				wss.emit("connection", ws, req);
			});
		})().catch(() => {
			socket.destroy();
		});
	});
}

//#endregion
//#region src/gateway/server/hooks.ts
function createGatewayHooksRequestHandler(params) {
	const { deps, getHooksConfig, bindHost, port, logHooks } = params;
	const dispatchWakeHook = (value) => {
		const sessionKey = resolveMainSessionKeyFromConfig();
		enqueueSystemEvent(value.text, { sessionKey });
		if (value.mode === "now") requestHeartbeatNow({ reason: "hook:wake" });
	};
	const dispatchAgentHook = (value) => {
		const sessionKey = value.sessionKey.trim();
		const mainSessionKey = resolveMainSessionKeyFromConfig();
		const jobId = randomUUID();
		const now = Date.now();
		const job = {
			id: jobId,
			agentId: value.agentId,
			name: value.name,
			enabled: true,
			createdAtMs: now,
			updatedAtMs: now,
			schedule: {
				kind: "at",
				at: new Date(now).toISOString()
			},
			sessionTarget: "isolated",
			wakeMode: value.wakeMode,
			payload: {
				kind: "agentTurn",
				message: value.message,
				model: value.model,
				thinking: value.thinking,
				timeoutSeconds: value.timeoutSeconds,
				deliver: value.deliver,
				channel: value.channel,
				to: value.to,
				allowUnsafeExternalContent: value.allowUnsafeExternalContent
			},
			state: { nextRunAtMs: now }
		};
		const runId = randomUUID();
		(async () => {
			try {
				const result = await runCronIsolatedAgentTurn({
					cfg: loadConfig(),
					deps,
					job,
					message: value.message,
					sessionKey,
					lane: "cron"
				});
				const summary = result.summary?.trim() || result.error?.trim() || result.status;
				enqueueSystemEvent(`${result.status === "ok" ? `Hook ${value.name}` : `Hook ${value.name} (${result.status})`}: ${summary}`.trim(), { sessionKey: mainSessionKey });
				if (value.wakeMode === "now") requestHeartbeatNow({ reason: `hook:${jobId}` });
			} catch (err) {
				logHooks.warn(`hook agent failed: ${String(err)}`);
				enqueueSystemEvent(`Hook ${value.name} (error): ${String(err)}`, { sessionKey: mainSessionKey });
				if (value.wakeMode === "now") requestHeartbeatNow({ reason: `hook:${jobId}:error` });
			}
		})();
		return runId;
	};
	return createHooksRequestHandler({
		getHooksConfig,
		bindHost,
		port,
		logHooks,
		dispatchAgentHook,
		dispatchWakeHook
	});
}

//#endregion
//#region src/infra/gateway-lock.ts
const DEFAULT_TIMEOUT_MS = 5e3;
const DEFAULT_POLL_INTERVAL_MS = 100;
const DEFAULT_STALE_MS = 3e4;
var GatewayLockError = class extends Error {
	constructor(message, cause) {
		super(message);
		this.cause = cause;
		this.name = "GatewayLockError";
	}
};
function isAlive(pid) {
	if (!Number.isFinite(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
function normalizeProcArg(arg) {
	return arg.replaceAll("\\", "/").toLowerCase();
}
function parseProcCmdline(raw) {
	return raw.split("\0").map((entry) => entry.trim()).filter(Boolean);
}
function isGatewayArgv(args) {
	const normalized = args.map(normalizeProcArg);
	if (!normalized.includes("gateway")) return false;
	const entryCandidates = [
		"dist/index.js",
		"dist/entry.js",
		"openclaw.mjs",
		"scripts/run-node.mjs",
		"src/index.ts"
	];
	if (normalized.some((arg) => entryCandidates.some((entry) => arg.endsWith(entry)))) return true;
	const exe = normalized[0] ?? "";
	return exe.endsWith("/openclaw") || exe === "openclaw";
}
function readLinuxCmdline(pid) {
	try {
		return parseProcCmdline(fs.readFileSync(`/proc/${pid}/cmdline`, "utf8"));
	} catch {
		return null;
	}
}
function readLinuxStartTime(pid) {
	try {
		const raw = fs.readFileSync(`/proc/${pid}/stat`, "utf8").trim();
		const closeParen = raw.lastIndexOf(")");
		if (closeParen < 0) return null;
		const fields = raw.slice(closeParen + 1).trim().split(/\s+/);
		const startTime = Number.parseInt(fields[19] ?? "", 10);
		return Number.isFinite(startTime) ? startTime : null;
	} catch {
		return null;
	}
}
function resolveGatewayOwnerStatus(pid, payload, platform) {
	if (!isAlive(pid)) return "dead";
	if (platform !== "linux") return "alive";
	const payloadStartTime = payload?.startTime;
	if (Number.isFinite(payloadStartTime)) {
		const currentStartTime = readLinuxStartTime(pid);
		if (currentStartTime == null) return "unknown";
		return currentStartTime === payloadStartTime ? "alive" : "dead";
	}
	const args = readLinuxCmdline(pid);
	if (!args) return "unknown";
	return isGatewayArgv(args) ? "alive" : "dead";
}
async function readLockPayload(lockPath) {
	try {
		const raw = await fsPromises.readFile(lockPath, "utf8");
		const parsed = JSON.parse(raw);
		if (typeof parsed.pid !== "number") return null;
		if (typeof parsed.createdAt !== "string") return null;
		if (typeof parsed.configPath !== "string") return null;
		const startTime = typeof parsed.startTime === "number" ? parsed.startTime : void 0;
		return {
			pid: parsed.pid,
			createdAt: parsed.createdAt,
			configPath: parsed.configPath,
			startTime
		};
	} catch {
		return null;
	}
}
function resolveGatewayLockPath(env) {
	const configPath = resolveConfigPath(env, resolveStateDir(env));
	const hash = createHash("sha1").update(configPath).digest("hex").slice(0, 8);
	const lockDir = resolveGatewayLockDir();
	return {
		lockPath: path.join(lockDir, `gateway.${hash}.lock`),
		configPath
	};
}
async function acquireGatewayLock(opts = {}) {
	const env = opts.env ?? process.env;
	const allowInTests = opts.allowInTests === true;
	if (env.OPENCLAW_ALLOW_MULTI_GATEWAY === "1" || !allowInTests && (env.VITEST || env.NODE_ENV === "test")) return null;
	const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const pollIntervalMs = opts.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
	const staleMs = opts.staleMs ?? DEFAULT_STALE_MS;
	const platform = opts.platform ?? process.platform;
	const { lockPath, configPath } = resolveGatewayLockPath(env);
	await fsPromises.mkdir(path.dirname(lockPath), { recursive: true });
	const startedAt = Date.now();
	let lastPayload = null;
	while (Date.now() - startedAt < timeoutMs) try {
		const handle = await fsPromises.open(lockPath, "wx");
		const startTime = platform === "linux" ? readLinuxStartTime(process.pid) : null;
		const payload = {
			pid: process.pid,
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			configPath
		};
		if (typeof startTime === "number" && Number.isFinite(startTime)) payload.startTime = startTime;
		await handle.writeFile(JSON.stringify(payload), "utf8");
		return {
			lockPath,
			configPath,
			release: async () => {
				await handle.close().catch(() => void 0);
				await fsPromises.rm(lockPath, { force: true });
			}
		};
	} catch (err) {
		if (err.code !== "EEXIST") throw new GatewayLockError(`failed to acquire gateway lock at ${lockPath}`, err);
		lastPayload = await readLockPayload(lockPath);
		const ownerPid = lastPayload?.pid;
		const ownerStatus = ownerPid ? resolveGatewayOwnerStatus(ownerPid, lastPayload, platform) : "unknown";
		if (ownerStatus === "dead" && ownerPid) {
			await fsPromises.rm(lockPath, { force: true });
			continue;
		}
		if (ownerStatus !== "alive") {
			let stale = false;
			if (lastPayload?.createdAt) {
				const createdAt = Date.parse(lastPayload.createdAt);
				stale = Number.isFinite(createdAt) ? Date.now() - createdAt > staleMs : false;
			}
			if (!stale) try {
				const st = await fsPromises.stat(lockPath);
				stale = Date.now() - st.mtimeMs > staleMs;
			} catch {
				stale = true;
			}
			if (stale) {
				await fsPromises.rm(lockPath, { force: true });
				continue;
			}
		}
		await new Promise((r) => setTimeout(r, pollIntervalMs));
	}
	throw new GatewayLockError(`gateway already running${lastPayload?.pid ? ` (pid ${lastPayload.pid})` : ""}; lock timeout after ${timeoutMs}ms`);
}

//#endregion
//#region src/gateway/server/http-listen.ts
async function listenGatewayHttpServer(params) {
	const { httpServer, bindHost, port } = params;
	try {
		await new Promise((resolve, reject) => {
			const onError = (err) => {
				httpServer.off("listening", onListening);
				reject(err);
			};
			const onListening = () => {
				httpServer.off("error", onError);
				resolve();
			};
			httpServer.once("error", onError);
			httpServer.once("listening", onListening);
			httpServer.listen(port, bindHost);
		});
	} catch (err) {
		if (err.code === "EADDRINUSE") throw new GatewayLockError(`another gateway instance is already listening on ws://${bindHost}:${port}`, err);
		throw new GatewayLockError(`failed to bind gateway socket on ws://${bindHost}:${port}: ${String(err)}`, err);
	}
}

//#endregion
//#region src/gateway/server/plugins-http.ts
function createGatewayPluginRequestHandler(params) {
	const { registry, log } = params;
	return async (req, res) => {
		const routes = registry.httpRoutes ?? [];
		const handlers = registry.httpHandlers ?? [];
		if (routes.length === 0 && handlers.length === 0) return false;
		if (routes.length > 0) {
			const url = new URL(req.url ?? "/", "http://localhost");
			const route = routes.find((entry) => entry.path === url.pathname);
			if (route) try {
				await route.handler(req, res);
				return true;
			} catch (err) {
				log.warn(`plugin http route failed (${route.pluginId ?? "unknown"}): ${String(err)}`);
				if (!res.headersSent) {
					res.statusCode = 500;
					res.setHeader("Content-Type", "text/plain; charset=utf-8");
					res.end("Internal Server Error");
				}
				return true;
			}
		}
		for (const entry of handlers) try {
			if (await entry.handler(req, res)) return true;
		} catch (err) {
			log.warn(`plugin http handler failed (${entry.pluginId}): ${String(err)}`);
			if (!res.headersSent) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.end("Internal Server Error");
			}
			return true;
		}
		return false;
	};
}

//#endregion
//#region src/gateway/server-runtime-state.ts
async function createGatewayRuntimeState(params) {
	let canvasHost = null;
	if (params.canvasHostEnabled) try {
		const handler = await createCanvasHostHandler({
			runtime: params.canvasRuntime,
			rootDir: params.cfg.canvasHost?.root,
			basePath: CANVAS_HOST_PATH,
			allowInTests: params.allowCanvasHostInTests,
			liveReload: params.cfg.canvasHost?.liveReload
		});
		if (handler.rootDir) {
			canvasHost = handler;
			params.logCanvas.info(`canvas host mounted at http://${params.bindHost}:${params.port}${CANVAS_HOST_PATH}/ (root ${handler.rootDir})`);
		}
	} catch (err) {
		params.logCanvas.warn(`canvas host failed to start: ${String(err)}`);
	}
	const clients = /* @__PURE__ */ new Set();
	const { broadcast, broadcastToConnIds } = createGatewayBroadcaster({ clients });
	const handleHooksRequest = createGatewayHooksRequestHandler({
		deps: params.deps,
		getHooksConfig: params.hooksConfig,
		bindHost: params.bindHost,
		port: params.port,
		logHooks: params.logHooks
	});
	const handlePluginRequest = createGatewayPluginRequestHandler({
		registry: params.pluginRegistry,
		log: params.logPlugins
	});
	const bindHosts = await resolveGatewayListenHosts(params.bindHost);
	const httpServers = [];
	const httpBindHosts = [];
	for (const host of bindHosts) {
		const httpServer = createGatewayHttpServer({
			canvasHost,
			clients,
			controlUiEnabled: params.controlUiEnabled,
			controlUiBasePath: params.controlUiBasePath,
			controlUiRoot: params.controlUiRoot,
			openAiChatCompletionsEnabled: params.openAiChatCompletionsEnabled,
			openResponsesEnabled: params.openResponsesEnabled,
			openResponsesConfig: params.openResponsesConfig,
			handleHooksRequest,
			handlePluginRequest,
			resolvedAuth: params.resolvedAuth,
			rateLimiter: params.rateLimiter,
			tlsOptions: params.gatewayTls?.enabled ? params.gatewayTls.tlsOptions : void 0
		});
		try {
			await listenGatewayHttpServer({
				httpServer,
				bindHost: host,
				port: params.port
			});
			httpServers.push(httpServer);
			httpBindHosts.push(host);
		} catch (err) {
			if (host === bindHosts[0]) throw err;
			params.log.warn(`gateway: failed to bind loopback alias ${host}:${params.port} (${String(err)})`);
		}
	}
	const httpServer = httpServers[0];
	if (!httpServer) throw new Error("Gateway HTTP server failed to start");
	const wss = new WebSocketServer({
		noServer: true,
		maxPayload: MAX_PAYLOAD_BYTES
	});
	for (const server of httpServers) attachGatewayUpgradeHandler({
		httpServer: server,
		wss,
		canvasHost,
		clients,
		resolvedAuth: params.resolvedAuth,
		rateLimiter: params.rateLimiter
	});
	const agentRunSeq = /* @__PURE__ */ new Map();
	const dedupe = /* @__PURE__ */ new Map();
	const chatRunState = createChatRunState();
	const chatRunRegistry = chatRunState.registry;
	const chatRunBuffers = chatRunState.buffers;
	const chatDeltaSentAt = chatRunState.deltaSentAt;
	const addChatRun = chatRunRegistry.add;
	const removeChatRun = chatRunRegistry.remove;
	const chatAbortControllers = /* @__PURE__ */ new Map();
	const toolEventRecipients = createToolEventRecipientRegistry();
	return {
		canvasHost,
		httpServer,
		httpServers,
		httpBindHosts,
		wss,
		clients,
		broadcast,
		broadcastToConnIds,
		agentRunSeq,
		dedupe,
		chatRunState,
		chatRunBuffers,
		chatDeltaSentAt,
		addChatRun,
		removeChatRun,
		chatAbortControllers,
		toolEventRecipients
	};
}

//#endregion
//#region src/gateway/server-session-key.ts
function resolveSessionKeyForRun(runId) {
	const cached = getAgentRunContext(runId)?.sessionKey;
	if (cached) return cached;
	const store = loadSessionStore(resolveStorePath(loadConfig().session?.store));
	const storeKey = Object.entries(store).find(([, entry]) => entry?.sessionId === runId)?.[0];
	if (storeKey) {
		const sessionKey = toAgentRequestSessionKey(storeKey) ?? storeKey;
		registerAgentRunContext(runId, { sessionKey });
		return sessionKey;
	}
}

//#endregion
//#region src/gateway/server-startup-log.ts
function logGatewayStartup(params) {
	const { provider: agentProvider, model: agentModel } = resolveConfiguredModelRef({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const modelRef = `${agentProvider}/${agentModel}`;
	params.log.info(`agent model: ${modelRef}`, { consoleMessage: `agent model: ${chalk.whiteBright(modelRef)}` });
	const scheme = params.tlsEnabled ? "wss" : "ws";
	const formatHost = (host) => host.includes(":") ? `[${host}]` : host;
	const hosts = params.bindHosts && params.bindHosts.length > 0 ? params.bindHosts : [params.bindHost];
	const primaryHost = hosts[0] ?? params.bindHost;
	params.log.info(`listening on ${scheme}://${formatHost(primaryHost)}:${params.port} (PID ${process.pid})`);
	for (const host of hosts.slice(1)) params.log.info(`listening on ${scheme}://${formatHost(host)}:${params.port}`);
	params.log.info(`log file: ${getResolvedLoggerSettings().file}`);
	if (params.isNixMode) params.log.info("gateway: running in Nix mode (config managed externally)");
}

//#endregion
//#region src/hooks/loader.ts
/**
* Dynamic loader for hook handlers
*
* Loads hook handlers from external modules based on configuration
* and from directory-based discovery (bundled, managed, workspace)
*/
const log$2 = createSubsystemLogger("hooks:loader");
/**
* Load and register all hook handlers
*
* Loads hooks from both:
* 1. Directory-based discovery (bundled, managed, workspace)
* 2. Legacy config handlers (backwards compatibility)
*
* @param cfg - OpenClaw configuration
* @param workspaceDir - Workspace directory for hook discovery
* @returns Number of handlers successfully loaded
*
* @example
* ```ts
* const config = await loadConfig();
* const workspaceDir = resolveAgentWorkspaceDir(config, agentId);
* const count = await loadInternalHooks(config, workspaceDir);
* console.log(`Loaded ${count} hook handlers`);
* ```
*/
async function loadInternalHooks(cfg, workspaceDir, opts) {
	if (!cfg.hooks?.internal?.enabled) return 0;
	let loadedCount = 0;
	try {
		const eligible = loadWorkspaceHookEntries(workspaceDir, {
			config: cfg,
			managedHooksDir: opts?.managedHooksDir,
			bundledHooksDir: opts?.bundledHooksDir
		}).filter((entry) => shouldIncludeHook({
			entry,
			config: cfg
		}));
		for (const entry of eligible) {
			if (resolveHookConfig(cfg, entry.hook.name)?.enabled === false) continue;
			try {
				const mod = await import(`${pathToFileURL(entry.hook.handlerPath).href}?t=${Date.now()}`);
				const exportName = entry.metadata?.export ?? "default";
				const handler = mod[exportName];
				if (typeof handler !== "function") {
					log$2.error(`Handler '${exportName}' from ${entry.hook.name} is not a function`);
					continue;
				}
				const events = entry.metadata?.events ?? [];
				if (events.length === 0) {
					log$2.warn(`Hook '${entry.hook.name}' has no events defined in metadata`);
					continue;
				}
				for (const event of events) registerInternalHook(event, handler);
				log$2.info(`Registered hook: ${entry.hook.name} -> ${events.join(", ")}${exportName !== "default" ? ` (export: ${exportName})` : ""}`);
				loadedCount++;
			} catch (err) {
				log$2.error(`Failed to load hook ${entry.hook.name}: ${err instanceof Error ? err.message : String(err)}`);
			}
		}
	} catch (err) {
		log$2.error(`Failed to load directory-based hooks: ${err instanceof Error ? err.message : String(err)}`);
	}
	const handlers = cfg.hooks.internal.handlers ?? [];
	for (const handlerConfig of handlers) try {
		const modulePath = path.isAbsolute(handlerConfig.module) ? handlerConfig.module : path.join(process.cwd(), handlerConfig.module);
		const mod = await import(`${pathToFileURL(modulePath).href}?t=${Date.now()}`);
		const exportName = handlerConfig.export ?? "default";
		const handler = mod[exportName];
		if (typeof handler !== "function") {
			log$2.error(`Handler '${exportName}' from ${modulePath} is not a function`);
			continue;
		}
		registerInternalHook(handlerConfig.event, handler);
		log$2.info(`Registered hook (legacy): ${handlerConfig.event} -> ${modulePath}${exportName !== "default" ? `#${exportName}` : ""}`);
		loadedCount++;
	} catch (err) {
		log$2.error(`Failed to load hook handler from ${handlerConfig.module}: ${err instanceof Error ? err.message : String(err)}`);
	}
	return loadedCount;
}

//#endregion
//#region src/plugins/services.ts
const log$1 = createSubsystemLogger("plugins");
async function startPluginServices(params) {
	const running = [];
	for (const entry of params.registry.services) {
		const service = entry.service;
		try {
			await service.start({
				config: params.config,
				workspaceDir: params.workspaceDir,
				stateDir: STATE_DIR,
				logger: {
					info: (msg) => log$1.info(msg),
					warn: (msg) => log$1.warn(msg),
					error: (msg) => log$1.error(msg),
					debug: (msg) => log$1.debug(msg)
				}
			});
			running.push({
				id: service.id,
				stop: service.stop ? () => service.stop?.({
					config: params.config,
					workspaceDir: params.workspaceDir,
					stateDir: STATE_DIR,
					logger: {
						info: (msg) => log$1.info(msg),
						warn: (msg) => log$1.warn(msg),
						error: (msg) => log$1.error(msg),
						debug: (msg) => log$1.debug(msg)
					}
				}) : void 0
			});
		} catch (err) {
			log$1.error(`plugin service failed (${service.id}): ${String(err)}`);
		}
	}
	return { stop: async () => {
		for (const entry of running.toReversed()) {
			if (!entry.stop) continue;
			try {
				await entry.stop();
			} catch (err) {
				log$1.warn(`plugin service stop failed (${entry.id}): ${String(err)}`);
			}
		}
	} };
}

//#endregion
//#region src/gateway/server-restart-sentinel.ts
async function scheduleRestartSentinelWake(_params) {
	const sentinel = await consumeRestartSentinel();
	if (!sentinel) return;
	const payload = sentinel.payload;
	const sessionKey = payload.sessionKey?.trim();
	const message = formatRestartSentinelMessage(payload);
	const summary = summarizeRestartSentinel(payload);
	if (!sessionKey) {
		enqueueSystemEvent(message, { sessionKey: resolveMainSessionKeyFromConfig() });
		return;
	}
	const topicIndex = sessionKey.lastIndexOf(":topic:");
	const threadIndex = sessionKey.lastIndexOf(":thread:");
	const markerIndex = Math.max(topicIndex, threadIndex);
	const marker = topicIndex > threadIndex ? ":topic:" : ":thread:";
	const baseSessionKey = markerIndex === -1 ? sessionKey : sessionKey.slice(0, markerIndex);
	const sessionThreadId = (markerIndex === -1 ? void 0 : sessionKey.slice(markerIndex + marker.length))?.trim() || void 0;
	const { cfg, entry } = loadSessionEntry(sessionKey);
	const parsedTarget = resolveAnnounceTargetFromKey(baseSessionKey);
	const sentinelContext = payload.deliveryContext;
	let sessionDeliveryContext = deliveryContextFromSession(entry);
	if (!sessionDeliveryContext && markerIndex !== -1 && baseSessionKey) {
		const { entry: baseEntry } = loadSessionEntry(baseSessionKey);
		sessionDeliveryContext = deliveryContextFromSession(baseEntry);
	}
	const origin = mergeDeliveryContext(sentinelContext, mergeDeliveryContext(sessionDeliveryContext, parsedTarget ?? void 0));
	const channelRaw = origin?.channel;
	const channel = channelRaw ? normalizeChannelId(channelRaw) : null;
	const to = origin?.to;
	if (!channel || !to) {
		enqueueSystemEvent(message, { sessionKey });
		return;
	}
	const resolved = resolveOutboundTarget({
		channel,
		to,
		cfg,
		accountId: origin?.accountId,
		mode: "implicit"
	});
	if (!resolved.ok) {
		enqueueSystemEvent(message, { sessionKey });
		return;
	}
	const threadId = payload.threadId ?? parsedTarget?.threadId ?? sessionThreadId ?? (origin?.threadId != null ? String(origin.threadId) : void 0);
	try {
		await deliverOutboundPayloads({
			cfg,
			channel,
			to: resolved.to,
			accountId: origin?.accountId,
			threadId,
			payloads: [{ text: message }],
			bestEffort: true
		});
	} catch (err) {
		enqueueSystemEvent(`${summary}\n${String(err)}`, { sessionKey });
	}
}
function shouldWakeFromRestartSentinel() {
	return !process.env.VITEST && true;
}

//#endregion
//#region src/gateway/server-startup-memory.ts
async function startGatewayMemoryBackend(params) {
	const agentId = resolveDefaultAgentId(params.cfg);
	const resolved = resolveMemoryBackendConfig({
		cfg: params.cfg,
		agentId
	});
	if (resolved.backend !== "qmd" || !resolved.qmd) return;
	const { manager, error } = await getMemorySearchManager({
		cfg: params.cfg,
		agentId
	});
	if (!manager) {
		params.log.warn(`qmd memory startup initialization failed for agent "${agentId}": ${error ?? "unknown error"}`);
		return;
	}
	params.log.info?.(`qmd memory startup initialization armed for agent "${agentId}"`);
}

//#endregion
//#region src/gateway/server-startup.ts
async function startGatewaySidecars(params) {
	let browserControl = null;
	try {
		browserControl = await startBrowserControlServerIfEnabled();
	} catch (err) {
		params.logBrowser.error(`server failed to start: ${String(err)}`);
	}
	if (!isTruthyEnvValue(process.env.OPENCLAW_SKIP_GMAIL_WATCHER)) try {
		const gmailResult = await startGmailWatcher(params.cfg);
		if (gmailResult.started) params.logHooks.info("gmail watcher started");
		else if (gmailResult.reason && gmailResult.reason !== "hooks not enabled" && gmailResult.reason !== "no gmail account configured") params.logHooks.warn(`gmail watcher not started: ${gmailResult.reason}`);
	} catch (err) {
		params.logHooks.error(`gmail watcher failed to start: ${String(err)}`);
	}
	if (params.cfg.hooks?.gmail?.model) {
		const hooksModelRef = resolveHooksGmailModel({
			cfg: params.cfg,
			defaultProvider: DEFAULT_PROVIDER
		});
		if (hooksModelRef) {
			const { provider: defaultProvider, model: defaultModel } = resolveConfiguredModelRef({
				cfg: params.cfg,
				defaultProvider: DEFAULT_PROVIDER,
				defaultModel: DEFAULT_MODEL
			});
			const catalog = await loadModelCatalog({ config: params.cfg });
			const status = getModelRefStatus({
				cfg: params.cfg,
				catalog,
				ref: hooksModelRef,
				defaultProvider,
				defaultModel
			});
			if (!status.allowed) params.logHooks.warn(`hooks.gmail.model "${status.key}" not in agents.defaults.models allowlist (will use primary instead)`);
			if (!status.inCatalog) params.logHooks.warn(`hooks.gmail.model "${status.key}" not in the model catalog (may fail at runtime)`);
		}
	}
	try {
		clearInternalHooks();
		const loadedCount = await loadInternalHooks(params.cfg, params.defaultWorkspaceDir);
		if (loadedCount > 0) params.logHooks.info(`loaded ${loadedCount} internal hook handler${loadedCount > 1 ? "s" : ""}`);
	} catch (err) {
		params.logHooks.error(`failed to load hooks: ${String(err)}`);
	}
	if (!(isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS))) try {
		await params.startChannels();
	} catch (err) {
		params.logChannels.error(`channel startup failed: ${String(err)}`);
	}
	else params.logChannels.info("skipping channel start (OPENCLAW_SKIP_CHANNELS=1 or OPENCLAW_SKIP_PROVIDERS=1)");
	if (params.cfg.hooks?.internal?.enabled) setTimeout(() => {
		triggerInternalHook(createInternalHookEvent("gateway", "startup", "gateway:startup", {
			cfg: params.cfg,
			deps: params.deps,
			workspaceDir: params.defaultWorkspaceDir
		}));
	}, 250);
	let pluginServices = null;
	try {
		pluginServices = await startPluginServices({
			registry: params.pluginRegistry,
			config: params.cfg,
			workspaceDir: params.defaultWorkspaceDir
		});
	} catch (err) {
		params.log.warn(`plugin services failed to start: ${String(err)}`);
	}
	startGatewayMemoryBackend({
		cfg: params.cfg,
		log: params.log
	}).catch((err) => {
		params.log.warn(`qmd memory startup initialization failed: ${String(err)}`);
	});
	if (shouldWakeFromRestartSentinel()) setTimeout(() => {
		scheduleRestartSentinelWake({ deps: params.deps });
	}, 750);
	return {
		browserControl,
		pluginServices
	};
}

//#endregion
//#region src/gateway/server-tailscale.ts
async function startGatewayTailscaleExposure(params) {
	if (params.tailscaleMode === "off") return null;
	try {
		if (params.tailscaleMode === "serve") await enableTailscaleServe(params.port);
		else await enableTailscaleFunnel(params.port);
		const host = await getTailnetHostname().catch(() => null);
		if (host) {
			const uiPath = params.controlUiBasePath ? `${params.controlUiBasePath}/` : "/";
			params.logTailscale.info(`${params.tailscaleMode} enabled: https://${host}${uiPath} (WS via wss://${host})`);
		} else params.logTailscale.info(`${params.tailscaleMode} enabled`);
	} catch (err) {
		params.logTailscale.warn(`${params.tailscaleMode} failed: ${err instanceof Error ? err.message : String(err)}`);
	}
	if (!params.resetOnExit) return null;
	return async () => {
		try {
			if (params.tailscaleMode === "serve") await disableTailscaleServe();
			else await disableTailscaleFunnel();
		} catch (err) {
			params.logTailscale.warn(`${params.tailscaleMode} cleanup failed: ${err instanceof Error ? err.message : String(err)}`);
		}
	};
}

//#endregion
//#region src/gateway/server-wizard-sessions.ts
function createWizardSessionTracker() {
	const wizardSessions = /* @__PURE__ */ new Map();
	const findRunningWizard = () => {
		for (const [id, session] of wizardSessions) if (session.getStatus() === "running") return id;
		return null;
	};
	const purgeWizardSession = (id) => {
		const session = wizardSessions.get(id);
		if (!session) return;
		if (session.getStatus() === "running") return;
		wizardSessions.delete(id);
	};
	return {
		wizardSessions,
		findRunningWizard,
		purgeWizardSession
	};
}

//#endregion
//#region src/infra/canvas-host-url.ts
const normalizeHost = (value, rejectLoopback) => {
	if (!value) return "";
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (rejectLoopback && isLoopbackHost(trimmed)) return "";
	return trimmed;
};
const parseHostHeader = (value) => {
	if (!value) return "";
	try {
		return new URL(`http://${String(value).trim()}`).hostname;
	} catch {
		return "";
	}
};
const parseForwardedProto = (value) => {
	if (Array.isArray(value)) return value[0];
	return value;
};
function resolveCanvasHostUrl(params) {
	const port = params.canvasPort;
	if (!port) return;
	const scheme = params.scheme ?? (parseForwardedProto(params.forwardedProto)?.trim() === "https" ? "https" : "http");
	const override = normalizeHost(params.hostOverride, true);
	const requestHost = normalizeHost(parseHostHeader(params.requestHost), !!override);
	const localAddress = normalizeHost(params.localAddress, Boolean(override || requestHost));
	const host = override || requestHost || localAddress;
	if (!host) return;
	return `${scheme}://${host.includes(":") ? `[${host}]` : host}:${port}`;
}

//#endregion
//#region src/gateway/origin-check.ts
function normalizeHostHeader(hostHeader) {
	return (hostHeader ?? "").trim().toLowerCase();
}
function resolveHostName$1(hostHeader) {
	const host = normalizeHostHeader(hostHeader);
	if (!host) return "";
	if (host.startsWith("[")) {
		const end = host.indexOf("]");
		if (end !== -1) return host.slice(1, end);
	}
	const [name] = host.split(":");
	return name ?? "";
}
function parseOrigin(originRaw) {
	const trimmed = (originRaw ?? "").trim();
	if (!trimmed || trimmed === "null") return null;
	try {
		const url = new URL(trimmed);
		return {
			origin: url.origin.toLowerCase(),
			host: url.host.toLowerCase(),
			hostname: url.hostname.toLowerCase()
		};
	} catch {
		return null;
	}
}
function checkBrowserOrigin(params) {
	const parsedOrigin = parseOrigin(params.origin);
	if (!parsedOrigin) return {
		ok: false,
		reason: "origin missing or invalid"
	};
	if ((params.allowedOrigins ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean).includes(parsedOrigin.origin)) return { ok: true };
	const requestHost = normalizeHostHeader(params.requestHost);
	if (requestHost && parsedOrigin.host === requestHost) return { ok: true };
	const requestHostname = resolveHostName$1(requestHost);
	if (isLoopbackHost(parsedOrigin.hostname) && isLoopbackHost(requestHostname)) return { ok: true };
	return {
		ok: false,
		reason: "origin not allowed"
	};
}

//#endregion
//#region src/gateway/server/ws-connection/auth-messages.ts
function resolveHostName(hostHeader) {
	const host = (hostHeader ?? "").trim().toLowerCase();
	if (!host) return "";
	if (host.startsWith("[")) {
		const end = host.indexOf("]");
		if (end !== -1) return host.slice(1, end);
	}
	const [name] = host.split(":");
	return name ?? "";
}
function formatGatewayAuthFailureMessage(params) {
	const { authMode, authProvided, reason, client } = params;
	const isCli = isGatewayCliClient(client);
	const isControlUi = client?.id === GATEWAY_CLIENT_IDS.CONTROL_UI;
	const isWebchat = isWebchatClient(client);
	const tokenHint = isCli ? "set gateway.remote.token to match gateway.auth.token" : isControlUi || isWebchat ? "open the dashboard URL and paste the token in Control UI settings" : "provide gateway auth token";
	const passwordHint = isCli ? "set gateway.remote.password to match gateway.auth.password" : isControlUi || isWebchat ? "enter the password in Control UI settings" : "provide gateway auth password";
	switch (reason) {
		case "token_missing": return `unauthorized: gateway token missing (${tokenHint})`;
		case "token_mismatch": return `unauthorized: gateway token mismatch (${tokenHint})`;
		case "token_missing_config": return "unauthorized: gateway token not configured on gateway (set gateway.auth.token)";
		case "password_missing": return `unauthorized: gateway password missing (${passwordHint})`;
		case "password_mismatch": return `unauthorized: gateway password mismatch (${passwordHint})`;
		case "password_missing_config": return "unauthorized: gateway password not configured on gateway (set gateway.auth.password)";
		case "tailscale_user_missing": return "unauthorized: tailscale identity missing (use Tailscale Serve auth or gateway token/password)";
		case "tailscale_proxy_missing": return "unauthorized: tailscale proxy headers missing (use Tailscale Serve or gateway token/password)";
		case "tailscale_whois_failed": return "unauthorized: tailscale identity check failed (use Tailscale Serve auth or gateway token/password)";
		case "tailscale_user_mismatch": return "unauthorized: tailscale identity mismatch (use Tailscale Serve auth or gateway token/password)";
		case "rate_limited": return "unauthorized: too many failed authentication attempts (retry later)";
		case "device_token_mismatch": return "unauthorized: device token mismatch (rotate/reissue device token)";
		default: break;
	}
	if (authMode === "token" && authProvided === "none") return `unauthorized: gateway token missing (${tokenHint})`;
	if (authMode === "password" && authProvided === "none") return `unauthorized: gateway password missing (${passwordHint})`;
	return "unauthorized";
}

//#endregion
//#region src/gateway/server/ws-connection/message-handler.ts
const DEVICE_SIGNATURE_SKEW_MS = 600 * 1e3;
function attachGatewayWsMessageHandler(params) {
	const { socket, upgradeReq, connId, remoteAddr, forwardedFor, realIp, requestHost, requestOrigin, requestUserAgent, canvasHostUrl, connectNonce, resolvedAuth, rateLimiter, gatewayMethods, events, extraHandlers, buildRequestContext, send, close, isClosed, clearHandshakeTimer, getClient, setClient, setHandshakeState, setCloseCause, setLastFrameMeta, logGateway, logHealth, logWsControl } = params;
	const configSnapshot = loadConfig();
	const trustedProxies = configSnapshot.gateway?.trustedProxies ?? [];
	const clientIp = resolveGatewayClientIp({
		remoteAddr,
		forwardedFor,
		realIp,
		trustedProxies
	});
	const hasProxyHeaders = Boolean(forwardedFor || realIp);
	const remoteIsTrustedProxy = isTrustedProxyAddress(remoteAddr, trustedProxies);
	const hasUntrustedProxyHeaders = hasProxyHeaders && !remoteIsTrustedProxy;
	const hostName = resolveHostName(requestHost);
	const hostIsLocal = hostName === "localhost" || hostName === "127.0.0.1" || hostName === "::1";
	const hostIsTailscaleServe = hostName.endsWith(".ts.net");
	const hostIsLocalish = hostIsLocal || hostIsTailscaleServe;
	const isLocalClient = isLocalDirectRequest(upgradeReq, trustedProxies);
	const reportedClientIp = isLocalClient || hasUntrustedProxyHeaders ? void 0 : clientIp && !isLoopbackAddress(clientIp) ? clientIp : void 0;
	if (hasUntrustedProxyHeaders) logWsControl.warn("Proxy headers detected from untrusted address. Connection will not be treated as local. Configure gateway.trustedProxies to restore local client detection behind your proxy.");
	if (!hostIsLocalish && isLoopbackAddress(remoteAddr) && !hasProxyHeaders) logWsControl.warn("Loopback connection with non-local Host header. Treating it as remote. If you're behind a reverse proxy, set gateway.trustedProxies and forward X-Forwarded-For/X-Real-IP.");
	const isWebchatConnect = (p) => isWebchatClient(p?.client);
	socket.on("message", async (data) => {
		if (isClosed()) return;
		const text = rawDataToString(data);
		try {
			const parsed = JSON.parse(text);
			const frameType = parsed && typeof parsed === "object" && "type" in parsed ? typeof parsed.type === "string" ? String(parsed.type) : void 0 : void 0;
			const frameMethod = parsed && typeof parsed === "object" && "method" in parsed ? typeof parsed.method === "string" ? String(parsed.method) : void 0 : void 0;
			const frameId = parsed && typeof parsed === "object" && "id" in parsed ? typeof parsed.id === "string" ? String(parsed.id) : void 0 : void 0;
			if (frameType || frameMethod || frameId) setLastFrameMeta({
				type: frameType,
				method: frameMethod,
				id: frameId
			});
			const client = getClient();
			if (!client) {
				const isRequestFrame = validateRequestFrame(parsed);
				if (!isRequestFrame || parsed.method !== "connect" || !validateConnectParams(parsed.params)) {
					const handshakeError = isRequestFrame ? parsed.method === "connect" ? `invalid connect params: ${formatValidationErrors(validateConnectParams.errors)}` : "invalid handshake: first request must be connect" : "invalid request frame";
					setHandshakeState("failed");
					setCloseCause("invalid-handshake", {
						frameType,
						frameMethod,
						frameId,
						handshakeError
					});
					if (isRequestFrame) send({
						type: "res",
						id: parsed.id,
						ok: false,
						error: errorShape(ErrorCodes.INVALID_REQUEST, handshakeError)
					});
					else logWsControl.warn(`invalid handshake conn=${connId} remote=${remoteAddr ?? "?"} fwd=${forwardedFor ?? "n/a"} origin=${requestOrigin ?? "n/a"} host=${requestHost ?? "n/a"} ua=${requestUserAgent ?? "n/a"}`);
					const closeReason = truncateCloseReason(handshakeError || "invalid handshake");
					if (isRequestFrame) queueMicrotask(() => close(1008, closeReason));
					else close(1008, closeReason);
					return;
				}
				const frame = parsed;
				const connectParams = frame.params;
				const clientLabel = connectParams.client.displayName ?? connectParams.client.id;
				const { minProtocol, maxProtocol } = connectParams;
				if (maxProtocol < PROTOCOL_VERSION || minProtocol > PROTOCOL_VERSION) {
					setHandshakeState("failed");
					logWsControl.warn(`protocol mismatch conn=${connId} remote=${remoteAddr ?? "?"} client=${clientLabel} ${connectParams.client.mode} v${connectParams.client.version}`);
					setCloseCause("protocol-mismatch", {
						minProtocol,
						maxProtocol,
						expectedProtocol: PROTOCOL_VERSION,
						client: connectParams.client.id,
						clientDisplayName: connectParams.client.displayName,
						mode: connectParams.client.mode,
						version: connectParams.client.version
					});
					send({
						type: "res",
						id: frame.id,
						ok: false,
						error: errorShape(ErrorCodes.INVALID_REQUEST, "protocol mismatch", { details: { expectedProtocol: PROTOCOL_VERSION } })
					});
					close(1002, "protocol mismatch");
					return;
				}
				const roleRaw = connectParams.role ?? "operator";
				const role = roleRaw === "operator" || roleRaw === "node" ? roleRaw : null;
				if (!role) {
					setHandshakeState("failed");
					setCloseCause("invalid-role", {
						role: roleRaw,
						client: connectParams.client.id,
						clientDisplayName: connectParams.client.displayName,
						mode: connectParams.client.mode,
						version: connectParams.client.version
					});
					send({
						type: "res",
						id: frame.id,
						ok: false,
						error: errorShape(ErrorCodes.INVALID_REQUEST, "invalid role")
					});
					close(1008, "invalid role");
					return;
				}
				const scopes = Array.isArray(connectParams.scopes) ? connectParams.scopes : [];
				connectParams.role = role;
				connectParams.scopes = scopes;
				const isControlUi = connectParams.client.id === GATEWAY_CLIENT_IDS.CONTROL_UI;
				const isWebchat = isWebchatConnect(connectParams);
				if (isControlUi || isWebchat) {
					const originCheck = checkBrowserOrigin({
						requestHost,
						origin: requestOrigin,
						allowedOrigins: configSnapshot.gateway?.controlUi?.allowedOrigins
					});
					if (!originCheck.ok) {
						const errorMessage = "origin not allowed (open the Control UI from the gateway host or allow it in gateway.controlUi.allowedOrigins)";
						setHandshakeState("failed");
						setCloseCause("origin-mismatch", {
							origin: requestOrigin ?? "n/a",
							host: requestHost ?? "n/a",
							reason: originCheck.reason,
							client: connectParams.client.id,
							clientDisplayName: connectParams.client.displayName,
							mode: connectParams.client.mode,
							version: connectParams.client.version
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, errorMessage)
						});
						close(1008, truncateCloseReason(errorMessage));
						return;
					}
				}
				const deviceRaw = connectParams.device;
				let devicePublicKey = null;
				const hasTokenAuth = Boolean(connectParams.auth?.token);
				const hasPasswordAuth = Boolean(connectParams.auth?.password);
				const hasSharedAuth = hasTokenAuth || hasPasswordAuth;
				const allowInsecureControlUi = isControlUi && configSnapshot.gateway?.controlUi?.allowInsecureAuth === true;
				const disableControlUiDeviceAuth = isControlUi && configSnapshot.gateway?.controlUi?.dangerouslyDisableDeviceAuth === true;
				const allowControlUiBypass = allowInsecureControlUi || disableControlUiDeviceAuth;
				const device = disableControlUiDeviceAuth ? null : deviceRaw;
				const hasDeviceTokenCandidate = Boolean(connectParams.auth?.token && device);
				let authResult = await authorizeGatewayConnect({
					auth: resolvedAuth,
					connectAuth: connectParams.auth,
					req: upgradeReq,
					trustedProxies,
					rateLimiter: hasDeviceTokenCandidate ? void 0 : rateLimiter,
					clientIp,
					rateLimitScope: AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET
				});
				if (hasDeviceTokenCandidate && authResult.ok && rateLimiter && (authResult.method === "token" || authResult.method === "password")) {
					const sharedRateCheck = rateLimiter.check(clientIp, AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET);
					if (!sharedRateCheck.allowed) authResult = {
						ok: false,
						reason: "rate_limited",
						rateLimited: true,
						retryAfterMs: sharedRateCheck.retryAfterMs
					};
					else rateLimiter.reset(clientIp, AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET);
				}
				let authOk = authResult.ok;
				let authMethod = authResult.method ?? (resolvedAuth.mode === "password" ? "password" : "token");
				const sharedAuthResult = hasSharedAuth ? await authorizeGatewayConnect({
					auth: {
						...resolvedAuth,
						allowTailscale: false
					},
					connectAuth: connectParams.auth,
					req: upgradeReq,
					trustedProxies,
					rateLimitScope: AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET
				}) : null;
				const sharedAuthOk = sharedAuthResult?.ok === true && (sharedAuthResult.method === "token" || sharedAuthResult.method === "password");
				const rejectUnauthorized = (failedAuth) => {
					setHandshakeState("failed");
					logWsControl.warn(`unauthorized conn=${connId} remote=${remoteAddr ?? "?"} client=${clientLabel} ${connectParams.client.mode} v${connectParams.client.version} reason=${failedAuth.reason ?? "unknown"}`);
					const authProvided = connectParams.auth?.token ? "token" : connectParams.auth?.password ? "password" : "none";
					const authMessage = formatGatewayAuthFailureMessage({
						authMode: resolvedAuth.mode,
						authProvided,
						reason: failedAuth.reason,
						client: connectParams.client
					});
					setCloseCause("unauthorized", {
						authMode: resolvedAuth.mode,
						authProvided,
						authReason: failedAuth.reason,
						allowTailscale: resolvedAuth.allowTailscale,
						client: connectParams.client.id,
						clientDisplayName: connectParams.client.displayName,
						mode: connectParams.client.mode,
						version: connectParams.client.version
					});
					send({
						type: "res",
						id: frame.id,
						ok: false,
						error: errorShape(ErrorCodes.INVALID_REQUEST, authMessage)
					});
					close(1008, truncateCloseReason(authMessage));
				};
				if (!device) {
					const canSkipDevice = sharedAuthOk;
					if (isControlUi && !allowControlUiBypass) {
						const errorMessage = "control ui requires HTTPS or localhost (secure context)";
						setHandshakeState("failed");
						setCloseCause("control-ui-insecure-auth", {
							client: connectParams.client.id,
							clientDisplayName: connectParams.client.displayName,
							mode: connectParams.client.mode,
							version: connectParams.client.version
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, errorMessage)
						});
						close(1008, errorMessage);
						return;
					}
					if (!canSkipDevice) {
						if (!authOk && hasSharedAuth) {
							rejectUnauthorized(authResult);
							return;
						}
						setHandshakeState("failed");
						setCloseCause("device-required", {
							client: connectParams.client.id,
							clientDisplayName: connectParams.client.displayName,
							mode: connectParams.client.mode,
							version: connectParams.client.version
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.NOT_PAIRED, "device identity required")
						});
						close(1008, "device identity required");
						return;
					}
				}
				if (device) {
					const derivedId = deriveDeviceIdFromPublicKey(device.publicKey);
					if (!derivedId || derivedId !== device.id) {
						setHandshakeState("failed");
						setCloseCause("device-auth-invalid", {
							reason: "device-id-mismatch",
							client: connectParams.client.id,
							deviceId: device.id
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, "device identity mismatch")
						});
						close(1008, "device identity mismatch");
						return;
					}
					const signedAt = device.signedAt;
					if (typeof signedAt !== "number" || Math.abs(Date.now() - signedAt) > DEVICE_SIGNATURE_SKEW_MS) {
						setHandshakeState("failed");
						setCloseCause("device-auth-invalid", {
							reason: "device-signature-stale",
							client: connectParams.client.id,
							deviceId: device.id
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, "device signature expired")
						});
						close(1008, "device signature expired");
						return;
					}
					const nonceRequired = !isLocalClient;
					const providedNonce = typeof device.nonce === "string" ? device.nonce.trim() : "";
					if (nonceRequired && !providedNonce) {
						setHandshakeState("failed");
						setCloseCause("device-auth-invalid", {
							reason: "device-nonce-missing",
							client: connectParams.client.id,
							deviceId: device.id
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, "device nonce required")
						});
						close(1008, "device nonce required");
						return;
					}
					if (providedNonce && providedNonce !== connectNonce) {
						setHandshakeState("failed");
						setCloseCause("device-auth-invalid", {
							reason: "device-nonce-mismatch",
							client: connectParams.client.id,
							deviceId: device.id
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, "device nonce mismatch")
						});
						close(1008, "device nonce mismatch");
						return;
					}
					const payload = buildDeviceAuthPayload({
						deviceId: device.id,
						clientId: connectParams.client.id,
						clientMode: connectParams.client.mode,
						role,
						scopes,
						signedAtMs: signedAt,
						token: connectParams.auth?.token ?? null,
						nonce: providedNonce || void 0,
						version: providedNonce ? "v2" : "v1"
					});
					const signatureOk = verifyDeviceSignature(device.publicKey, payload, device.signature);
					if (!signatureOk && !nonceRequired && !providedNonce) {
						const legacyPayload = buildDeviceAuthPayload({
							deviceId: device.id,
							clientId: connectParams.client.id,
							clientMode: connectParams.client.mode,
							role,
							scopes,
							signedAtMs: signedAt,
							token: connectParams.auth?.token ?? null,
							version: "v1"
						});
						if (verifyDeviceSignature(device.publicKey, legacyPayload, device.signature)) {} else {
							setHandshakeState("failed");
							setCloseCause("device-auth-invalid", {
								reason: "device-signature",
								client: connectParams.client.id,
								deviceId: device.id
							});
							send({
								type: "res",
								id: frame.id,
								ok: false,
								error: errorShape(ErrorCodes.INVALID_REQUEST, "device signature invalid")
							});
							close(1008, "device signature invalid");
							return;
						}
					} else if (!signatureOk) {
						setHandshakeState("failed");
						setCloseCause("device-auth-invalid", {
							reason: "device-signature",
							client: connectParams.client.id,
							deviceId: device.id
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, "device signature invalid")
						});
						close(1008, "device signature invalid");
						return;
					}
					devicePublicKey = normalizeDevicePublicKeyBase64Url(device.publicKey);
					if (!devicePublicKey) {
						setHandshakeState("failed");
						setCloseCause("device-auth-invalid", {
							reason: "device-public-key",
							client: connectParams.client.id,
							deviceId: device.id
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, "device public key invalid")
						});
						close(1008, "device public key invalid");
						return;
					}
				}
				if (!authOk && connectParams.auth?.token && device) {
					if (rateLimiter) {
						const deviceRateCheck = rateLimiter.check(clientIp, AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN);
						if (!deviceRateCheck.allowed) authResult = {
							ok: false,
							reason: "rate_limited",
							rateLimited: true,
							retryAfterMs: deviceRateCheck.retryAfterMs
						};
					}
					if (!authResult.rateLimited) if ((await verifyDeviceToken({
						deviceId: device.id,
						token: connectParams.auth.token,
						role,
						scopes
					})).ok) {
						authOk = true;
						authMethod = "device-token";
						rateLimiter?.reset(clientIp, AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN);
					} else {
						authResult = {
							ok: false,
							reason: "device_token_mismatch"
						};
						rateLimiter?.recordFailure(clientIp, AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN);
					}
				}
				if (!authOk) {
					rejectUnauthorized(authResult);
					return;
				}
				if (device && devicePublicKey && !(allowControlUiBypass && sharedAuthOk)) {
					const requirePairing = async (reason, _paired) => {
						const pairing = await requestDevicePairing({
							deviceId: device.id,
							publicKey: devicePublicKey,
							displayName: connectParams.client.displayName,
							platform: connectParams.client.platform,
							clientId: connectParams.client.id,
							clientMode: connectParams.client.mode,
							role,
							scopes,
							remoteIp: reportedClientIp,
							silent: isLocalClient
						});
						const context = buildRequestContext();
						if (pairing.request.silent === true) {
							const approved = await approveDevicePairing(pairing.request.requestId);
							if (approved) {
								logGateway.info(`device pairing auto-approved device=${approved.device.deviceId} role=${approved.device.role ?? "unknown"}`);
								context.broadcast("device.pair.resolved", {
									requestId: pairing.request.requestId,
									deviceId: approved.device.deviceId,
									decision: "approved",
									ts: Date.now()
								}, { dropIfSlow: true });
							}
						} else if (pairing.created) context.broadcast("device.pair.requested", pairing.request, { dropIfSlow: true });
						if (pairing.request.silent !== true) {
							setHandshakeState("failed");
							setCloseCause("pairing-required", {
								deviceId: device.id,
								requestId: pairing.request.requestId,
								reason
							});
							send({
								type: "res",
								id: frame.id,
								ok: false,
								error: errorShape(ErrorCodes.NOT_PAIRED, "pairing required", { details: { requestId: pairing.request.requestId } })
							});
							close(1008, "pairing required");
							return false;
						}
						return true;
					};
					const paired = await getPairedDevice(device.id);
					if (!(paired?.publicKey === devicePublicKey)) {
						if (!await requirePairing("not-paired")) return;
					} else {
						const allowedRoles = new Set(Array.isArray(paired.roles) ? paired.roles : paired.role ? [paired.role] : []);
						if (allowedRoles.size === 0) {
							if (!await requirePairing("role-upgrade", paired)) return;
						} else if (!allowedRoles.has(role)) {
							if (!await requirePairing("role-upgrade", paired)) return;
						}
						const pairedScopes = Array.isArray(paired.scopes) ? paired.scopes : [];
						if (scopes.length > 0) if (pairedScopes.length === 0) {
							if (!await requirePairing("scope-upgrade", paired)) return;
						} else {
							const allowedScopes = new Set(pairedScopes);
							if (scopes.find((scope) => !allowedScopes.has(scope))) {
								if (!await requirePairing("scope-upgrade", paired)) return;
							}
						}
						await updatePairedDeviceMetadata(device.id, {
							displayName: connectParams.client.displayName,
							platform: connectParams.client.platform,
							clientId: connectParams.client.id,
							clientMode: connectParams.client.mode,
							role,
							scopes,
							remoteIp: reportedClientIp
						});
					}
				}
				const deviceToken = device ? await ensureDeviceToken({
					deviceId: device.id,
					role,
					scopes
				}) : null;
				if (role === "node") {
					const allowlist = resolveNodeCommandAllowlist(loadConfig(), {
						platform: connectParams.client.platform,
						deviceFamily: connectParams.client.deviceFamily
					});
					connectParams.commands = (Array.isArray(connectParams.commands) ? connectParams.commands : []).map((cmd) => cmd.trim()).filter((cmd) => cmd.length > 0 && allowlist.has(cmd));
				}
				const shouldTrackPresence = !isGatewayCliClient(connectParams.client);
				const clientId = connectParams.client.id;
				const instanceId = connectParams.client.instanceId;
				const presenceKey = shouldTrackPresence ? device?.id ?? instanceId ?? connId : void 0;
				logWs("in", "connect", {
					connId,
					client: connectParams.client.id,
					clientDisplayName: connectParams.client.displayName,
					version: connectParams.client.version,
					mode: connectParams.client.mode,
					clientId,
					platform: connectParams.client.platform,
					auth: authMethod
				});
				if (isWebchatConnect(connectParams)) logWsControl.info(`webchat connected conn=${connId} remote=${remoteAddr ?? "?"} client=${clientLabel} ${connectParams.client.mode} v${connectParams.client.version}`);
				if (presenceKey) {
					upsertPresence(presenceKey, {
						host: connectParams.client.displayName ?? connectParams.client.id ?? os.hostname(),
						ip: isLocalClient ? void 0 : reportedClientIp,
						version: connectParams.client.version,
						platform: connectParams.client.platform,
						deviceFamily: connectParams.client.deviceFamily,
						modelIdentifier: connectParams.client.modelIdentifier,
						mode: connectParams.client.mode,
						deviceId: device?.id,
						roles: [role],
						scopes,
						instanceId: device?.id ?? instanceId,
						reason: "connect"
					});
					incrementPresenceVersion();
				}
				const snapshot = buildGatewaySnapshot();
				const cachedHealth = getHealthCache();
				if (cachedHealth) {
					snapshot.health = cachedHealth;
					snapshot.stateVersion.health = getHealthVersion();
				}
				const helloOk = {
					type: "hello-ok",
					protocol: PROTOCOL_VERSION,
					server: {
						version: process.env.OPENCLAW_VERSION ?? process.env.npm_package_version ?? "dev",
						commit: process.env.GIT_COMMIT,
						host: os.hostname(),
						connId
					},
					features: {
						methods: gatewayMethods,
						events
					},
					snapshot,
					canvasHostUrl,
					auth: deviceToken ? {
						deviceToken: deviceToken.token,
						role: deviceToken.role,
						scopes: deviceToken.scopes,
						issuedAtMs: deviceToken.rotatedAtMs ?? deviceToken.createdAtMs
					} : void 0,
					policy: {
						maxPayload: MAX_PAYLOAD_BYTES,
						maxBufferedBytes: MAX_BUFFERED_BYTES,
						tickIntervalMs: TICK_INTERVAL_MS
					}
				};
				clearHandshakeTimer();
				const nextClient = {
					socket,
					connect: connectParams,
					connId,
					presenceKey,
					clientIp: reportedClientIp
				};
				setClient(nextClient);
				setHandshakeState("connected");
				if (role === "node") {
					const context = buildRequestContext();
					const nodeSession = context.nodeRegistry.register(nextClient, { remoteIp: reportedClientIp });
					const instanceIdRaw = connectParams.client.instanceId;
					const instanceId = typeof instanceIdRaw === "string" ? instanceIdRaw.trim() : "";
					const nodeIdsForPairing = new Set([nodeSession.nodeId]);
					if (instanceId) nodeIdsForPairing.add(instanceId);
					for (const nodeId of nodeIdsForPairing) updatePairedNodeMetadata(nodeId, { lastConnectedAtMs: nodeSession.connectedAtMs }).catch((err) => logGateway.warn(`failed to record last connect for ${nodeId}: ${formatForLog(err)}`));
					recordRemoteNodeInfo({
						nodeId: nodeSession.nodeId,
						displayName: nodeSession.displayName,
						platform: nodeSession.platform,
						deviceFamily: nodeSession.deviceFamily,
						commands: nodeSession.commands,
						remoteIp: nodeSession.remoteIp
					});
					refreshRemoteNodeBins({
						nodeId: nodeSession.nodeId,
						platform: nodeSession.platform,
						deviceFamily: nodeSession.deviceFamily,
						commands: nodeSession.commands,
						cfg: loadConfig()
					}).catch((err) => logGateway.warn(`remote bin probe failed for ${nodeSession.nodeId}: ${formatForLog(err)}`));
					loadVoiceWakeConfig().then((cfg) => {
						context.nodeRegistry.sendEvent(nodeSession.nodeId, "voicewake.changed", { triggers: cfg.triggers });
					}).catch((err) => logGateway.warn(`voicewake snapshot failed for ${nodeSession.nodeId}: ${formatForLog(err)}`));
				}
				logWs("out", "hello-ok", {
					connId,
					methods: gatewayMethods.length,
					events: events.length,
					presence: snapshot.presence.length,
					stateVersion: snapshot.stateVersion.presence
				});
				send({
					type: "res",
					id: frame.id,
					ok: true,
					payload: helloOk
				});
				refreshGatewayHealthSnapshot({ probe: true }).catch((err) => logHealth.error(`post-connect health refresh failed: ${formatError(err)}`));
				return;
			}
			if (!validateRequestFrame(parsed)) {
				send({
					type: "res",
					id: parsed?.id ?? "invalid",
					ok: false,
					error: errorShape(ErrorCodes.INVALID_REQUEST, `invalid request frame: ${formatValidationErrors(validateRequestFrame.errors)}`)
				});
				return;
			}
			const req = parsed;
			logWs("in", "req", {
				connId,
				id: req.id,
				method: req.method
			});
			const respond = (ok, payload, error, meta) => {
				send({
					type: "res",
					id: req.id,
					ok,
					payload,
					error
				});
				logWs("out", "res", {
					connId,
					id: req.id,
					ok,
					method: req.method,
					errorCode: error?.code,
					errorMessage: error?.message,
					...meta
				});
			};
			(async () => {
				await handleGatewayRequest({
					req,
					respond,
					client,
					isWebchatConnect,
					extraHandlers,
					context: buildRequestContext()
				});
			})().catch((err) => {
				logGateway.error(`request handler failed: ${formatForLog(err)}`);
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
			});
		} catch (err) {
			logGateway.error(`parse/handle error: ${String(err)}`);
			logWs("out", "parse-error", {
				connId,
				error: formatForLog(err)
			});
			if (!getClient()) close();
		}
	});
}

//#endregion
//#region src/gateway/server/ws-connection.ts
const LOG_HEADER_MAX_LEN = 300;
const LOG_HEADER_FORMAT_REGEX = /\p{Cf}/gu;
function replaceControlChars(value) {
	let cleaned = "";
	for (const char of value) {
		const codePoint = char.codePointAt(0);
		if (codePoint !== void 0 && (codePoint <= 31 || codePoint >= 127 && codePoint <= 159)) {
			cleaned += " ";
			continue;
		}
		cleaned += char;
	}
	return cleaned;
}
const sanitizeLogValue = (value) => {
	if (!value) return;
	const cleaned = replaceControlChars(value).replace(LOG_HEADER_FORMAT_REGEX, " ").replace(/\s+/g, " ").trim();
	if (!cleaned) return;
	if (cleaned.length <= LOG_HEADER_MAX_LEN) return cleaned;
	return truncateUtf16Safe(cleaned, LOG_HEADER_MAX_LEN);
};
function attachGatewayWsConnectionHandler(params) {
	const { wss, clients, port, gatewayHost, canvasHostEnabled, canvasHostServerPort, resolvedAuth, rateLimiter, gatewayMethods, events, logGateway, logHealth, logWsControl, extraHandlers, broadcast, buildRequestContext } = params;
	wss.on("connection", (socket, upgradeReq) => {
		let client = null;
		let closed = false;
		const openedAt = Date.now();
		const connId = randomUUID();
		const remoteAddr = socket._socket?.remoteAddress;
		const headerValue = (value) => Array.isArray(value) ? value[0] : value;
		const requestHost = headerValue(upgradeReq.headers.host);
		const requestOrigin = headerValue(upgradeReq.headers.origin);
		const requestUserAgent = headerValue(upgradeReq.headers["user-agent"]);
		const forwardedFor = headerValue(upgradeReq.headers["x-forwarded-for"]);
		const realIp = headerValue(upgradeReq.headers["x-real-ip"]);
		const canvasHostUrl = resolveCanvasHostUrl({
			canvasPort: canvasHostServerPort ?? (canvasHostEnabled ? port : void 0),
			hostOverride: canvasHostServerPort ? gatewayHost && gatewayHost !== "0.0.0.0" && gatewayHost !== "::" ? gatewayHost : void 0 : void 0,
			requestHost: upgradeReq.headers.host,
			forwardedProto: upgradeReq.headers["x-forwarded-proto"],
			localAddress: upgradeReq.socket?.localAddress
		});
		logWs("in", "open", {
			connId,
			remoteAddr
		});
		let handshakeState = "pending";
		let closeCause;
		let closeMeta = {};
		let lastFrameType;
		let lastFrameMethod;
		let lastFrameId;
		const setCloseCause = (cause, meta) => {
			if (!closeCause) closeCause = cause;
			if (meta && Object.keys(meta).length > 0) closeMeta = {
				...closeMeta,
				...meta
			};
		};
		const setLastFrameMeta = (meta) => {
			if (meta.type || meta.method || meta.id) {
				lastFrameType = meta.type ?? lastFrameType;
				lastFrameMethod = meta.method ?? lastFrameMethod;
				lastFrameId = meta.id ?? lastFrameId;
			}
		};
		const send = (obj) => {
			try {
				socket.send(JSON.stringify(obj));
			} catch {}
		};
		const connectNonce = randomUUID();
		send({
			type: "event",
			event: "connect.challenge",
			payload: {
				nonce: connectNonce,
				ts: Date.now()
			}
		});
		const close = (code = 1e3, reason) => {
			if (closed) return;
			closed = true;
			clearTimeout(handshakeTimer);
			if (client) clients.delete(client);
			try {
				socket.close(code, reason);
			} catch {}
		};
		socket.once("error", (err) => {
			logWsControl.warn(`error conn=${connId} remote=${remoteAddr ?? "?"}: ${formatError(err)}`);
			close();
		});
		const isNoisySwiftPmHelperClose = (userAgent, remote) => Boolean(userAgent?.toLowerCase().includes("swiftpm-testing-helper") && isLoopbackAddress(remote));
		socket.once("close", (code, reason) => {
			const durationMs = Date.now() - openedAt;
			const logForwardedFor = sanitizeLogValue(forwardedFor);
			const logOrigin = sanitizeLogValue(requestOrigin);
			const logHost = sanitizeLogValue(requestHost);
			const logUserAgent = sanitizeLogValue(requestUserAgent);
			const logReason = sanitizeLogValue(reason?.toString());
			const closeContext = {
				cause: closeCause,
				handshake: handshakeState,
				durationMs,
				lastFrameType,
				lastFrameMethod,
				lastFrameId,
				host: logHost,
				origin: logOrigin,
				userAgent: logUserAgent,
				forwardedFor: logForwardedFor,
				...closeMeta
			};
			if (!client) (isNoisySwiftPmHelperClose(requestUserAgent, remoteAddr) ? logWsControl.debug : logWsControl.warn)(`closed before connect conn=${connId} remote=${remoteAddr ?? "?"} fwd=${logForwardedFor || "n/a"} origin=${logOrigin || "n/a"} host=${logHost || "n/a"} ua=${logUserAgent || "n/a"} code=${code ?? "n/a"} reason=${logReason || "n/a"}`, closeContext);
			if (client && isWebchatClient(client.connect.client)) logWsControl.info(`webchat disconnected code=${code} reason=${logReason || "n/a"} conn=${connId}`);
			if (client?.presenceKey) {
				upsertPresence(client.presenceKey, { reason: "disconnect" });
				incrementPresenceVersion();
				broadcast("presence", { presence: listSystemPresence() }, {
					dropIfSlow: true,
					stateVersion: {
						presence: getPresenceVersion(),
						health: getHealthVersion()
					}
				});
			}
			if (client?.connect?.role === "node") {
				const context = buildRequestContext();
				const nodeId = context.nodeRegistry.unregister(connId);
				if (nodeId) context.nodeUnsubscribeAll(nodeId);
			}
			logWs("out", "close", {
				connId,
				code,
				reason: logReason,
				durationMs,
				cause: closeCause,
				handshake: handshakeState,
				lastFrameType,
				lastFrameMethod,
				lastFrameId
			});
			close();
		});
		const handshakeTimeoutMs = getHandshakeTimeoutMs();
		const handshakeTimer = setTimeout(() => {
			if (!client) {
				handshakeState = "failed";
				setCloseCause("handshake-timeout", { handshakeMs: Date.now() - openedAt });
				logWsControl.warn(`handshake timeout conn=${connId} remote=${remoteAddr ?? "?"}`);
				close();
			}
		}, handshakeTimeoutMs);
		attachGatewayWsMessageHandler({
			socket,
			upgradeReq,
			connId,
			remoteAddr,
			forwardedFor,
			realIp,
			requestHost,
			requestOrigin,
			requestUserAgent,
			canvasHostUrl,
			connectNonce,
			resolvedAuth,
			rateLimiter,
			gatewayMethods,
			events,
			extraHandlers,
			buildRequestContext,
			send,
			close,
			isClosed: () => closed,
			clearHandshakeTimer: () => clearTimeout(handshakeTimer),
			getClient: () => client,
			setClient: (next) => {
				client = next;
				clients.add(next);
			},
			setHandshakeState: (next) => {
				handshakeState = next;
			},
			setCloseCause,
			setLastFrameMeta,
			logGateway,
			logHealth,
			logWsControl
		});
	});
}

//#endregion
//#region src/gateway/server-ws-runtime.ts
function attachGatewayWsHandlers(params) {
	attachGatewayWsConnectionHandler({
		wss: params.wss,
		clients: params.clients,
		port: params.port,
		gatewayHost: params.gatewayHost,
		canvasHostEnabled: params.canvasHostEnabled,
		canvasHostServerPort: params.canvasHostServerPort,
		resolvedAuth: params.resolvedAuth,
		rateLimiter: params.rateLimiter,
		gatewayMethods: params.gatewayMethods,
		events: params.events,
		logGateway: params.logGateway,
		logHealth: params.logHealth,
		logWsControl: params.logWsControl,
		extraHandlers: params.extraHandlers,
		broadcast: params.broadcast,
		buildRequestContext: () => params.context
	});
}

//#endregion
//#region src/gateway/server/tls.ts
async function loadGatewayTlsRuntime(cfg, log) {
	return await loadGatewayTlsRuntime$1(cfg, log);
}

//#endregion
//#region src/gateway/server.impl.ts
ensureOpenClawCliOnPath();
const log = createSubsystemLogger("gateway");
const logCanvas = log.child("canvas");
const logDiscovery = log.child("discovery");
const logTailscale = log.child("tailscale");
const logChannels = log.child("channels");
const logBrowser = log.child("browser");
const logHealth = log.child("health");
const logCron = log.child("cron");
const logReload = log.child("reload");
const logHooks = log.child("hooks");
const logPlugins = log.child("plugins");
const logWsControl = log.child("ws");
const gatewayRuntime = runtimeForLogger(log);
const canvasRuntime = runtimeForLogger(logCanvas);
async function startGatewayServer(port = 18789, opts = {}) {
	process.env.OPENCLAW_GATEWAY_PORT = String(port);
	logAcceptedEnvOption({
		key: "OPENCLAW_RAW_STREAM",
		description: "raw stream logging enabled"
	});
	logAcceptedEnvOption({
		key: "OPENCLAW_RAW_STREAM_PATH",
		description: "raw stream log path override"
	});
	let configSnapshot = await readConfigFileSnapshot();
	if (configSnapshot.legacyIssues.length > 0) {
		if (isNixMode) throw new Error("Legacy config entries detected while running in Nix mode. Update your Nix config to the latest schema and restart.");
		const { config: migrated, changes } = migrateLegacyConfig(configSnapshot.parsed);
		if (!migrated) throw new Error(`Legacy config entries detected but auto-migration failed. Run "${formatCliCommand("openclaw doctor")}" to migrate.`);
		await writeConfigFile(migrated);
		if (changes.length > 0) log.info(`gateway: migrated legacy config entries:\n${changes.map((entry) => `- ${entry}`).join("\n")}`);
	}
	configSnapshot = await readConfigFileSnapshot();
	if (configSnapshot.exists && !configSnapshot.valid) {
		const issues = configSnapshot.issues.length > 0 ? configSnapshot.issues.map((issue) => `${issue.path || "<root>"}: ${issue.message}`).join("\n") : "Unknown validation issue.";
		throw new Error(`Invalid config at ${configSnapshot.path}.\n${issues}\nRun "${formatCliCommand("openclaw doctor")}" to repair, then retry.`);
	}
	const autoEnable = applyPluginAutoEnable({
		config: configSnapshot.config,
		env: process.env
	});
	if (autoEnable.changes.length > 0) try {
		await writeConfigFile(autoEnable.config);
		log.info(`gateway: auto-enabled plugins:\n${autoEnable.changes.map((entry) => `- ${entry}`).join("\n")}`);
	} catch (err) {
		log.warn(`gateway: failed to persist plugin auto-enable changes: ${String(err)}`);
	}
	const cfgAtStart = loadConfig();
	const diagnosticsEnabled = isDiagnosticsEnabled(cfgAtStart);
	if (diagnosticsEnabled) startDiagnosticHeartbeat();
	setGatewaySigusr1RestartPolicy({ allowExternal: cfgAtStart.commands?.restart === true });
	setPreRestartDeferralCheck(() => getTotalQueueSize() + getTotalPendingReplies() + getActiveEmbeddedRunCount());
	initSubagentRegistry();
	const defaultWorkspaceDir = resolveAgentWorkspaceDir(cfgAtStart, resolveDefaultAgentId(cfgAtStart));
	const { pluginRegistry, gatewayMethods: baseGatewayMethods } = loadGatewayPlugins({
		cfg: cfgAtStart,
		workspaceDir: defaultWorkspaceDir,
		log,
		coreGatewayHandlers,
		baseMethods: listGatewayMethods()
	});
	const channelLogs = Object.fromEntries(listChannelPlugins().map((plugin) => [plugin.id, logChannels.child(plugin.id)]));
	const channelRuntimeEnvs = Object.fromEntries(Object.entries(channelLogs).map(([id, logger]) => [id, runtimeForLogger(logger)]));
	const channelMethods = listChannelPlugins().flatMap((plugin) => plugin.gatewayMethods ?? []);
	const gatewayMethods = Array.from(new Set([...baseGatewayMethods, ...channelMethods]));
	let pluginServices = null;
	const runtimeConfig = await resolveGatewayRuntimeConfig({
		cfg: cfgAtStart,
		port,
		bind: opts.bind,
		host: opts.host,
		controlUiEnabled: opts.controlUiEnabled,
		openAiChatCompletionsEnabled: opts.openAiChatCompletionsEnabled,
		openResponsesEnabled: opts.openResponsesEnabled,
		auth: opts.auth,
		tailscale: opts.tailscale
	});
	const { bindHost, controlUiEnabled, openAiChatCompletionsEnabled, openResponsesEnabled, openResponsesConfig, controlUiBasePath, controlUiRoot: controlUiRootOverride, resolvedAuth, tailscaleConfig, tailscaleMode } = runtimeConfig;
	let hooksConfig = runtimeConfig.hooksConfig;
	const canvasHostEnabled = runtimeConfig.canvasHostEnabled;
	const rateLimitConfig = cfgAtStart.gateway?.auth?.rateLimit;
	const authRateLimiter = rateLimitConfig ? createAuthRateLimiter(rateLimitConfig) : void 0;
	let controlUiRootState;
	if (controlUiRootOverride) {
		const resolvedOverride = resolveControlUiRootOverrideSync(controlUiRootOverride);
		const resolvedOverridePath = path.resolve(controlUiRootOverride);
		controlUiRootState = resolvedOverride ? {
			kind: "resolved",
			path: resolvedOverride
		} : {
			kind: "invalid",
			path: resolvedOverridePath
		};
		if (!resolvedOverride) log.warn(`gateway: controlUi.root not found at ${resolvedOverridePath}`);
	} else if (controlUiEnabled) {
		let resolvedRoot = resolveControlUiRootSync({
			moduleUrl: import.meta.url,
			argv1: process.argv[1],
			cwd: process.cwd()
		});
		if (!resolvedRoot) {
			const ensureResult = await ensureControlUiAssetsBuilt(gatewayRuntime);
			if (!ensureResult.ok && ensureResult.message) log.warn(`gateway: ${ensureResult.message}`);
			resolvedRoot = resolveControlUiRootSync({
				moduleUrl: import.meta.url,
				argv1: process.argv[1],
				cwd: process.cwd()
			});
		}
		controlUiRootState = resolvedRoot ? {
			kind: "resolved",
			path: resolvedRoot
		} : { kind: "missing" };
	}
	const wizardRunner = opts.wizardRunner ?? runOnboardingWizard;
	const { wizardSessions, findRunningWizard, purgeWizardSession } = createWizardSessionTracker();
	const deps = createDefaultDeps();
	let canvasHostServer = null;
	const gatewayTls = await loadGatewayTlsRuntime(cfgAtStart.gateway?.tls, log.child("tls"));
	if (cfgAtStart.gateway?.tls?.enabled && !gatewayTls.enabled) throw new Error(gatewayTls.error ?? "gateway tls: failed to enable");
	const { canvasHost, httpServer, httpServers, httpBindHosts, wss, clients, broadcast, broadcastToConnIds, agentRunSeq, dedupe, chatRunState, chatRunBuffers, chatDeltaSentAt, addChatRun, removeChatRun, chatAbortControllers, toolEventRecipients } = await createGatewayRuntimeState({
		cfg: cfgAtStart,
		bindHost,
		port,
		controlUiEnabled,
		controlUiBasePath,
		controlUiRoot: controlUiRootState,
		openAiChatCompletionsEnabled,
		openResponsesEnabled,
		openResponsesConfig,
		resolvedAuth,
		rateLimiter: authRateLimiter,
		gatewayTls,
		hooksConfig: () => hooksConfig,
		pluginRegistry,
		deps,
		canvasRuntime,
		canvasHostEnabled,
		allowCanvasHostInTests: opts.allowCanvasHostInTests,
		logCanvas,
		log,
		logHooks,
		logPlugins
	});
	let bonjourStop = null;
	const nodeRegistry = new NodeRegistry();
	const nodePresenceTimers = /* @__PURE__ */ new Map();
	const nodeSubscriptions = createNodeSubscriptionManager();
	const nodeSendEvent = (opts) => {
		const payload = safeParseJson(opts.payloadJSON ?? null);
		nodeRegistry.sendEvent(opts.nodeId, opts.event, payload);
	};
	const nodeSendToSession = (sessionKey, event, payload) => nodeSubscriptions.sendToSession(sessionKey, event, payload, nodeSendEvent);
	const nodeSendToAllSubscribed = (event, payload) => nodeSubscriptions.sendToAllSubscribed(event, payload, nodeSendEvent);
	const nodeSubscribe = nodeSubscriptions.subscribe;
	const nodeUnsubscribe = nodeSubscriptions.unsubscribe;
	const nodeUnsubscribeAll = nodeSubscriptions.unsubscribeAll;
	const broadcastVoiceWakeChanged = (triggers) => {
		broadcast("voicewake.changed", { triggers }, { dropIfSlow: true });
	};
	const hasMobileNodeConnected = () => hasConnectedMobileNode(nodeRegistry);
	applyGatewayLaneConcurrency(cfgAtStart);
	let cronState = buildGatewayCronService({
		cfg: cfgAtStart,
		deps,
		broadcast
	});
	let { cron, storePath: cronStorePath } = cronState;
	const { getRuntimeSnapshot, startChannels, startChannel, stopChannel, markChannelLoggedOut } = createChannelManager({
		loadConfig,
		channelLogs,
		channelRuntimeEnvs
	});
	bonjourStop = (await startGatewayDiscovery({
		machineDisplayName: await getMachineDisplayName(),
		port,
		gatewayTls: gatewayTls.enabled ? {
			enabled: true,
			fingerprintSha256: gatewayTls.fingerprintSha256
		} : void 0,
		wideAreaDiscoveryEnabled: cfgAtStart.discovery?.wideArea?.enabled === true,
		wideAreaDiscoveryDomain: cfgAtStart.discovery?.wideArea?.domain,
		tailscaleMode,
		mdnsMode: cfgAtStart.discovery?.mdns?.mode,
		logDiscovery
	})).bonjourStop;
	setSkillsRemoteRegistry(nodeRegistry);
	primeRemoteSkillsCache();
	let skillsRefreshTimer = null;
	const skillsRefreshDelayMs = 3e4;
	const skillsChangeUnsub = registerSkillsChangeListener((event) => {
		if (event.reason === "remote-node") return;
		if (skillsRefreshTimer) clearTimeout(skillsRefreshTimer);
		skillsRefreshTimer = setTimeout(() => {
			skillsRefreshTimer = null;
			refreshRemoteBinsForConnectedNodes(loadConfig());
		}, skillsRefreshDelayMs);
	});
	const { tickInterval, healthInterval, dedupeCleanup } = startGatewayMaintenanceTimers({
		broadcast,
		nodeSendToAllSubscribed,
		getPresenceVersion,
		getHealthVersion,
		refreshGatewayHealthSnapshot,
		logHealth,
		dedupe,
		chatAbortControllers,
		chatRunState,
		chatRunBuffers,
		chatDeltaSentAt,
		removeChatRun,
		agentRunSeq,
		nodeSendToSession
	});
	const agentUnsub = onAgentEvent(createAgentEventHandler({
		broadcast,
		broadcastToConnIds,
		nodeSendToSession,
		agentRunSeq,
		chatRunState,
		resolveSessionKeyForRun,
		clearAgentRunContext,
		toolEventRecipients
	}));
	const heartbeatUnsub = onHeartbeatEvent((evt) => {
		broadcast("heartbeat", evt, { dropIfSlow: true });
	});
	let heartbeatRunner = startHeartbeatRunner({ cfg: cfgAtStart });
	cron.start().catch((err) => logCron.error(`failed to start: ${String(err)}`));
	(async () => {
		const { recoverPendingDeliveries } = await import("./delivery-queue-46I6nBfA.js").then((n) => n.n);
		const { deliverOutboundPayloads } = await import("./deliver-BUfUVLsa.js").then((n) => n.n);
		await recoverPendingDeliveries({
			deliver: deliverOutboundPayloads,
			log: log.child("delivery-recovery"),
			cfg: cfgAtStart
		});
	})().catch((err) => log.error(`Delivery recovery failed: ${String(err)}`));
	const execApprovalHandlers = createExecApprovalHandlers(new ExecApprovalManager(), { forwarder: createExecApprovalForwarder() });
	const canvasHostServerPort = canvasHostServer?.port;
	attachGatewayWsHandlers({
		wss,
		clients,
		port,
		gatewayHost: bindHost ?? void 0,
		canvasHostEnabled: Boolean(canvasHost),
		canvasHostServerPort,
		resolvedAuth,
		rateLimiter: authRateLimiter,
		gatewayMethods,
		events: GATEWAY_EVENTS,
		logGateway: log,
		logHealth,
		logWsControl,
		extraHandlers: {
			...pluginRegistry.gatewayHandlers,
			...execApprovalHandlers
		},
		broadcast,
		context: {
			deps,
			cron,
			cronStorePath,
			loadGatewayModelCatalog,
			getHealthCache,
			refreshHealthSnapshot: refreshGatewayHealthSnapshot,
			logHealth,
			logGateway: log,
			incrementPresenceVersion,
			getHealthVersion,
			broadcast,
			broadcastToConnIds,
			nodeSendToSession,
			nodeSendToAllSubscribed,
			nodeSubscribe,
			nodeUnsubscribe,
			nodeUnsubscribeAll,
			hasConnectedMobileNode: hasMobileNodeConnected,
			nodeRegistry,
			agentRunSeq,
			chatAbortControllers,
			chatAbortedRuns: chatRunState.abortedRuns,
			chatRunBuffers: chatRunState.buffers,
			chatDeltaSentAt: chatRunState.deltaSentAt,
			addChatRun,
			removeChatRun,
			registerToolEventRecipient: toolEventRecipients.add,
			dedupe,
			wizardSessions,
			findRunningWizard,
			purgeWizardSession,
			getRuntimeSnapshot,
			startChannel,
			stopChannel,
			markChannelLoggedOut,
			wizardRunner,
			broadcastVoiceWakeChanged
		}
	});
	logGatewayStartup({
		cfg: cfgAtStart,
		bindHost,
		bindHosts: httpBindHosts,
		port,
		tlsEnabled: gatewayTls.enabled,
		log,
		isNixMode
	});
	scheduleGatewayUpdateCheck({
		cfg: cfgAtStart,
		log,
		isNixMode
	});
	const tailscaleCleanup = await startGatewayTailscaleExposure({
		tailscaleMode,
		resetOnExit: tailscaleConfig.resetOnExit,
		port,
		controlUiBasePath,
		logTailscale
	});
	let browserControl = null;
	({browserControl, pluginServices} = await startGatewaySidecars({
		cfg: cfgAtStart,
		pluginRegistry,
		defaultWorkspaceDir,
		deps,
		startChannels,
		log,
		logHooks,
		logChannels,
		logBrowser
	}));
	{
		const hookRunner = getGlobalHookRunner();
		if (hookRunner?.hasHooks("gateway_start")) hookRunner.runGatewayStart({ port }, { port }).catch((err) => {
			log.warn(`gateway_start hook failed: ${String(err)}`);
		});
	}
	const { applyHotReload, requestGatewayRestart } = createGatewayReloadHandlers({
		deps,
		broadcast,
		getState: () => ({
			hooksConfig,
			heartbeatRunner,
			cronState,
			browserControl
		}),
		setState: (nextState) => {
			hooksConfig = nextState.hooksConfig;
			heartbeatRunner = nextState.heartbeatRunner;
			cronState = nextState.cronState;
			cron = cronState.cron;
			cronStorePath = cronState.storePath;
			browserControl = nextState.browserControl;
		},
		startChannel,
		stopChannel,
		logHooks,
		logBrowser,
		logChannels,
		logCron,
		logReload
	});
	const configReloader = startGatewayConfigReloader({
		initialConfig: cfgAtStart,
		readSnapshot: readConfigFileSnapshot,
		onHotReload: applyHotReload,
		onRestart: requestGatewayRestart,
		log: {
			info: (msg) => logReload.info(msg),
			warn: (msg) => logReload.warn(msg),
			error: (msg) => logReload.error(msg)
		},
		watchPath: CONFIG_PATH
	});
	const close = createGatewayCloseHandler({
		bonjourStop,
		tailscaleCleanup,
		canvasHost,
		canvasHostServer,
		stopChannel,
		pluginServices,
		cron,
		heartbeatRunner,
		nodePresenceTimers,
		broadcast,
		tickInterval,
		healthInterval,
		dedupeCleanup,
		agentUnsub,
		heartbeatUnsub,
		chatRunState,
		clients,
		configReloader,
		browserControl,
		wss,
		httpServer,
		httpServers
	});
	return { close: async (opts) => {
		{
			const hookRunner = getGlobalHookRunner();
			if (hookRunner?.hasHooks("gateway_stop")) try {
				await hookRunner.runGatewayStop({ reason: opts?.reason ?? "gateway stopping" }, { port });
			} catch (err) {
				log.warn(`gateway_stop hook failed: ${String(err)}`);
			}
		}
		if (diagnosticsEnabled) stopDiagnosticHeartbeat();
		if (skillsRefreshTimer) {
			clearTimeout(skillsRefreshTimer);
			skillsRefreshTimer = null;
		}
		skillsChangeUnsub();
		authRateLimiter?.dispose();
		await close(opts);
	} };
}

//#endregion
//#region src/cli/gateway-cli/dev.ts
const DEV_IDENTITY_NAME = "C3-PO";
const DEV_IDENTITY_THEME = "protocol droid";
const DEV_IDENTITY_EMOJI = "🤖";
const DEV_AGENT_WORKSPACE_SUFFIX = "dev";
async function loadDevTemplate(name, fallback) {
	try {
		const templateDir = await resolveWorkspaceTemplateDir();
		const raw = await fs.promises.readFile(path.join(templateDir, name), "utf-8");
		if (!raw.startsWith("---")) return raw;
		const endIndex = raw.indexOf("\n---", 3);
		if (endIndex === -1) return raw;
		return raw.slice(endIndex + 4).replace(/^\s+/, "");
	} catch {
		return fallback;
	}
}
const resolveDevWorkspaceDir = (env = process.env) => {
	const baseDir = resolveDefaultAgentWorkspaceDir(env, os.homedir);
	if (env.OPENCLAW_PROFILE?.trim().toLowerCase() === "dev") return baseDir;
	return `${baseDir}-${DEV_AGENT_WORKSPACE_SUFFIX}`;
};
async function writeFileIfMissing(filePath, content) {
	try {
		await fs.promises.writeFile(filePath, content, {
			encoding: "utf-8",
			flag: "wx"
		});
	} catch (err) {
		if (err.code !== "EEXIST") throw err;
	}
}
async function ensureDevWorkspace(dir) {
	const resolvedDir = resolveUserPath(dir);
	await fs.promises.mkdir(resolvedDir, { recursive: true });
	const [agents, soul, tools, identity, user] = await Promise.all([
		loadDevTemplate("AGENTS.dev.md", `# AGENTS.md - OpenClaw Dev Workspace\n\nDefault dev workspace for openclaw gateway --dev.\n`),
		loadDevTemplate("SOUL.dev.md", `# SOUL.md - Dev Persona\n\nProtocol droid for debugging and operations.\n`),
		loadDevTemplate("TOOLS.dev.md", `# TOOLS.md - User Tool Notes (editable)\n\nAdd your local tool notes here.\n`),
		loadDevTemplate("IDENTITY.dev.md", `# IDENTITY.md - Agent Identity\n\n- Name: ${DEV_IDENTITY_NAME}\n- Creature: protocol droid\n- Vibe: ${DEV_IDENTITY_THEME}\n- Emoji: ${DEV_IDENTITY_EMOJI}\n`),
		loadDevTemplate("USER.dev.md", `# USER.md - User Profile\n\n- Name:\n- Preferred address:\n- Notes:\n`)
	]);
	await writeFileIfMissing(path.join(resolvedDir, "AGENTS.md"), agents);
	await writeFileIfMissing(path.join(resolvedDir, "SOUL.md"), soul);
	await writeFileIfMissing(path.join(resolvedDir, "TOOLS.md"), tools);
	await writeFileIfMissing(path.join(resolvedDir, "IDENTITY.md"), identity);
	await writeFileIfMissing(path.join(resolvedDir, "USER.md"), user);
}
async function ensureDevGatewayConfig(opts) {
	const workspace = resolveDevWorkspaceDir();
	if (opts.reset) await handleReset("full", workspace, defaultRuntime);
	const configPath = createConfigIO().configPath;
	const configExists = fs.existsSync(configPath);
	if (!opts.reset && configExists) return;
	await writeConfigFile({
		gateway: {
			mode: "local",
			bind: "loopback"
		},
		agents: {
			defaults: {
				workspace,
				skipBootstrap: true
			},
			list: [{
				id: "dev",
				default: true,
				workspace,
				identity: {
					name: DEV_IDENTITY_NAME,
					theme: DEV_IDENTITY_THEME,
					emoji: DEV_IDENTITY_EMOJI
				}
			}]
		}
	});
	await ensureDevWorkspace(workspace);
	defaultRuntime.log(`Dev config ready: ${shortenHomePath(configPath)}`);
	defaultRuntime.log(`Dev workspace ready: ${shortenHomePath(resolveUserPath(workspace))}`);
}

//#endregion
//#region src/process/restart-recovery.ts
/**
* Returns an iteration hook for in-process restart loops.
* The first call is considered initial startup and does nothing.
* Each subsequent call represents a restart iteration and invokes `onRestart`.
*/
function createRestartIterationHook(onRestart) {
	let isFirstIteration = true;
	return () => {
		if (isFirstIteration) {
			isFirstIteration = false;
			return false;
		}
		onRestart();
		return true;
	};
}

//#endregion
//#region src/cli/gateway-cli/run-loop.ts
const gatewayLog$1 = createSubsystemLogger("gateway");
async function runGatewayLoop(params) {
	const lock = await acquireGatewayLock();
	let server = null;
	let shuttingDown = false;
	let restartResolver = null;
	const cleanupSignals = () => {
		process.removeListener("SIGTERM", onSigterm);
		process.removeListener("SIGINT", onSigint);
		process.removeListener("SIGUSR1", onSigusr1);
	};
	const DRAIN_TIMEOUT_MS = 3e4;
	const SHUTDOWN_TIMEOUT_MS = 5e3;
	const request = (action, signal) => {
		if (shuttingDown) {
			gatewayLog$1.info(`received ${signal} during shutdown; ignoring`);
			return;
		}
		shuttingDown = true;
		const isRestart = action === "restart";
		gatewayLog$1.info(`received ${signal}; ${isRestart ? "restarting" : "shutting down"}`);
		const forceExitMs = isRestart ? DRAIN_TIMEOUT_MS + SHUTDOWN_TIMEOUT_MS : SHUTDOWN_TIMEOUT_MS;
		const forceExitTimer = setTimeout(() => {
			gatewayLog$1.error("shutdown timed out; exiting without full cleanup");
			cleanupSignals();
			params.runtime.exit(0);
		}, forceExitMs);
		(async () => {
			try {
				if (isRestart) {
					const activeTasks = getActiveTaskCount();
					if (activeTasks > 0) {
						gatewayLog$1.info(`draining ${activeTasks} active task(s) before restart (timeout ${DRAIN_TIMEOUT_MS}ms)`);
						const { drained } = await waitForActiveTasks(DRAIN_TIMEOUT_MS);
						if (drained) gatewayLog$1.info("all active tasks drained");
						else gatewayLog$1.warn("drain timeout reached; proceeding with restart");
					}
				}
				await server?.close({
					reason: isRestart ? "gateway restarting" : "gateway stopping",
					restartExpectedMs: isRestart ? 1500 : null
				});
			} catch (err) {
				gatewayLog$1.error(`shutdown error: ${String(err)}`);
			} finally {
				clearTimeout(forceExitTimer);
				server = null;
				if (isRestart) {
					shuttingDown = false;
					restartResolver?.();
				} else {
					cleanupSignals();
					params.runtime.exit(0);
				}
			}
		})();
	};
	const onSigterm = () => {
		gatewayLog$1.info("signal SIGTERM received");
		request("stop", "SIGTERM");
	};
	const onSigint = () => {
		gatewayLog$1.info("signal SIGINT received");
		request("stop", "SIGINT");
	};
	const onSigusr1 = () => {
		gatewayLog$1.info("signal SIGUSR1 received");
		if (!consumeGatewaySigusr1RestartAuthorization() && !isGatewaySigusr1RestartExternallyAllowed()) {
			gatewayLog$1.warn("SIGUSR1 restart ignored (not authorized; enable commands.restart or use gateway tool).");
			return;
		}
		markGatewaySigusr1RestartHandled();
		request("restart", "SIGUSR1");
	};
	process.on("SIGTERM", onSigterm);
	process.on("SIGINT", onSigint);
	process.on("SIGUSR1", onSigusr1);
	try {
		const onIteration = createRestartIterationHook(() => {
			resetAllLanes();
		});
		while (true) {
			onIteration();
			server = await params.start();
			await new Promise((resolve) => {
				restartResolver = resolve;
			});
		}
	} finally {
		await lock?.release();
		cleanupSignals();
	}
}

//#endregion
//#region src/cli/gateway-cli/run.ts
const gatewayLog = createSubsystemLogger("gateway");
async function runGatewayCommand$1(opts) {
	const isDevProfile = process.env.OPENCLAW_PROFILE?.trim().toLowerCase() === "dev";
	const devMode = Boolean(opts.dev) || isDevProfile;
	if (opts.reset && !devMode) {
		defaultRuntime.error("Use --reset with --dev.");
		defaultRuntime.exit(1);
		return;
	}
	setConsoleTimestampPrefix(true);
	setVerbose(Boolean(opts.verbose));
	if (opts.claudeCliLogs) {
		setConsoleSubsystemFilter(["agent/claude-cli"]);
		process.env.OPENCLAW_CLAUDE_CLI_LOG_OUTPUT = "1";
	}
	const wsLogRaw = opts.compact ? "compact" : opts.wsLog;
	const wsLogStyle = wsLogRaw === "compact" ? "compact" : wsLogRaw === "full" ? "full" : "auto";
	if (wsLogRaw !== void 0 && wsLogRaw !== "auto" && wsLogRaw !== "compact" && wsLogRaw !== "full") {
		defaultRuntime.error("Invalid --ws-log (use \"auto\", \"full\", \"compact\")");
		defaultRuntime.exit(1);
	}
	setGatewayWsLogStyle(wsLogStyle);
	if (opts.rawStream) process.env.OPENCLAW_RAW_STREAM = "1";
	const rawStreamPath = toOptionString(opts.rawStreamPath);
	if (rawStreamPath) process.env.OPENCLAW_RAW_STREAM_PATH = rawStreamPath;
	if (devMode) await ensureDevGatewayConfig({ reset: Boolean(opts.reset) });
	const cfg = loadConfig();
	const portOverride = parsePort$1(opts.port);
	if (opts.port !== void 0 && portOverride === null) {
		defaultRuntime.error("Invalid port");
		defaultRuntime.exit(1);
	}
	const port = portOverride ?? resolveGatewayPort(cfg);
	if (!Number.isFinite(port) || port <= 0) {
		defaultRuntime.error("Invalid port");
		defaultRuntime.exit(1);
	}
	if (opts.force) try {
		const { killed, waitedMs, escalatedToSigkill } = await forceFreePortAndWait(port, {
			timeoutMs: 2e3,
			intervalMs: 100,
			sigtermTimeoutMs: 700
		});
		if (killed.length === 0) gatewayLog.info(`force: no listeners on port ${port}`);
		else {
			for (const proc of killed) gatewayLog.info(`force: killed pid ${proc.pid}${proc.command ? ` (${proc.command})` : ""} on port ${port}`);
			if (escalatedToSigkill) gatewayLog.info(`force: escalated to SIGKILL while freeing port ${port}`);
			if (waitedMs > 0) gatewayLog.info(`force: waited ${waitedMs}ms for port ${port} to free`);
		}
	} catch (err) {
		defaultRuntime.error(`Force: ${String(err)}`);
		defaultRuntime.exit(1);
		return;
	}
	if (opts.token) {
		const token = toOptionString(opts.token);
		if (token) process.env.OPENCLAW_GATEWAY_TOKEN = token;
	}
	const authModeRaw = toOptionString(opts.auth);
	const authMode = authModeRaw === "token" || authModeRaw === "password" ? authModeRaw : null;
	if (authModeRaw && !authMode) {
		defaultRuntime.error("Invalid --auth (use \"token\" or \"password\")");
		defaultRuntime.exit(1);
		return;
	}
	const tailscaleRaw = toOptionString(opts.tailscale);
	const tailscaleMode = tailscaleRaw === "off" || tailscaleRaw === "serve" || tailscaleRaw === "funnel" ? tailscaleRaw : null;
	if (tailscaleRaw && !tailscaleMode) {
		defaultRuntime.error("Invalid --tailscale (use \"off\", \"serve\", or \"funnel\")");
		defaultRuntime.exit(1);
		return;
	}
	const passwordRaw = toOptionString(opts.password);
	const tokenRaw = toOptionString(opts.token);
	const snapshot = await readConfigFileSnapshot().catch(() => null);
	const configExists = snapshot?.exists ?? fs.existsSync(CONFIG_PATH);
	const configAuditPath = path.join(resolveStateDir(process.env), "logs", "config-audit.jsonl");
	const mode = cfg.gateway?.mode;
	if (!opts.allowUnconfigured && mode !== "local") {
		if (!configExists) defaultRuntime.error(`Missing config. Run \`${formatCliCommand("openclaw setup")}\` or set gateway.mode=local (or pass --allow-unconfigured).`);
		else {
			defaultRuntime.error(`Gateway start blocked: set gateway.mode=local (current: ${mode ?? "unset"}) or pass --allow-unconfigured.`);
			defaultRuntime.error(`Config write audit: ${configAuditPath}`);
		}
		defaultRuntime.exit(1);
		return;
	}
	const bindRaw = toOptionString(opts.bind) ?? cfg.gateway?.bind ?? "loopback";
	const bind = bindRaw === "loopback" || bindRaw === "lan" || bindRaw === "auto" || bindRaw === "custom" || bindRaw === "tailnet" ? bindRaw : null;
	if (!bind) {
		defaultRuntime.error("Invalid --bind (use \"loopback\", \"lan\", \"tailnet\", \"auto\", or \"custom\")");
		defaultRuntime.exit(1);
		return;
	}
	const miskeys = extractGatewayMiskeys(snapshot?.parsed);
	const resolvedAuth = resolveGatewayAuth({
		authConfig: {
			...cfg.gateway?.auth,
			...authMode ? { mode: authMode } : {},
			...passwordRaw ? { password: passwordRaw } : {},
			...tokenRaw ? { token: tokenRaw } : {}
		},
		env: process.env,
		tailscaleMode: tailscaleMode ?? cfg.gateway?.tailscale?.mode ?? "off"
	});
	const resolvedAuthMode = resolvedAuth.mode;
	const tokenValue = resolvedAuth.token;
	const passwordValue = resolvedAuth.password;
	const hasToken = typeof tokenValue === "string" && tokenValue.trim().length > 0;
	const hasPassword = typeof passwordValue === "string" && passwordValue.trim().length > 0;
	const hasSharedSecret = resolvedAuthMode === "token" && hasToken || resolvedAuthMode === "password" && hasPassword;
	const authHints = [];
	if (miskeys.hasGatewayToken) authHints.push("Found \"gateway.token\" in config. Use \"gateway.auth.token\" instead.");
	if (miskeys.hasRemoteToken) authHints.push("\"gateway.remote.token\" is for remote CLI calls; it does not enable local gateway auth.");
	if (resolvedAuthMode === "token" && !hasToken && !resolvedAuth.allowTailscale) {
		defaultRuntime.error([
			"Gateway auth is set to token, but no token is configured.",
			"Set gateway.auth.token (or OPENCLAW_GATEWAY_TOKEN), or pass --token.",
			...authHints
		].filter(Boolean).join("\n"));
		defaultRuntime.exit(1);
		return;
	}
	if (resolvedAuthMode === "password" && !hasPassword) {
		defaultRuntime.error([
			"Gateway auth is set to password, but no password is configured.",
			"Set gateway.auth.password (or OPENCLAW_GATEWAY_PASSWORD), or pass --password.",
			...authHints
		].filter(Boolean).join("\n"));
		defaultRuntime.exit(1);
		return;
	}
	if (bind !== "loopback" && !hasSharedSecret) {
		defaultRuntime.error([
			`Refusing to bind gateway to ${bind} without auth.`,
			"Set gateway.auth.token/password (or OPENCLAW_GATEWAY_TOKEN/OPENCLAW_GATEWAY_PASSWORD) or pass --token/--password.",
			...authHints
		].filter(Boolean).join("\n"));
		defaultRuntime.exit(1);
		return;
	}
	try {
		await runGatewayLoop({
			runtime: defaultRuntime,
			start: async () => await startGatewayServer(port, {
				bind,
				auth: authMode || passwordRaw || tokenRaw || authModeRaw ? {
					mode: authMode ?? void 0,
					token: tokenRaw,
					password: passwordRaw
				} : void 0,
				tailscale: tailscaleMode || opts.tailscaleResetOnExit ? {
					mode: tailscaleMode ?? void 0,
					resetOnExit: Boolean(opts.tailscaleResetOnExit)
				} : void 0
			})
		});
	} catch (err) {
		if (err instanceof GatewayLockError || err && typeof err === "object" && err.name === "GatewayLockError") {
			const errMessage = describeUnknownError(err);
			defaultRuntime.error(`Gateway failed to start: ${errMessage}\nIf the gateway is supervised, stop it with: ${formatCliCommand("openclaw gateway stop")}`);
			try {
				const diagnostics = await inspectPortUsage(port);
				if (diagnostics.status === "busy") for (const line of formatPortDiagnostics(diagnostics)) defaultRuntime.error(line);
			} catch {}
			await maybeExplainGatewayServiceStop();
			defaultRuntime.exit(1);
			return;
		}
		defaultRuntime.error(`Gateway failed to start: ${String(err)}`);
		defaultRuntime.exit(1);
	}
}
function addGatewayRunCommand(cmd) {
	return cmd.option("--port <port>", "Port for the gateway WebSocket").option("--bind <mode>", "Bind mode (\"loopback\"|\"lan\"|\"tailnet\"|\"auto\"|\"custom\"). Defaults to config gateway.bind (or loopback).").option("--token <token>", "Shared token required in connect.params.auth.token (default: OPENCLAW_GATEWAY_TOKEN env if set)").option("--auth <mode>", "Gateway auth mode (\"token\"|\"password\")").option("--password <password>", "Password for auth mode=password").option("--tailscale <mode>", "Tailscale exposure mode (\"off\"|\"serve\"|\"funnel\")").option("--tailscale-reset-on-exit", "Reset Tailscale serve/funnel configuration on shutdown", false).option("--allow-unconfigured", "Allow gateway start without gateway.mode=local in config", false).option("--dev", "Create a dev config + workspace if missing (no BOOTSTRAP.md)", false).option("--reset", "Reset dev config + credentials + sessions + workspace (requires --dev)", false).option("--force", "Kill any existing listener on the target port before starting", false).option("--verbose", "Verbose logging to stdout/stderr", false).option("--claude-cli-logs", "Only show claude-cli logs in the console (includes stdout/stderr)", false).option("--ws-log <style>", "WebSocket log style (\"auto\"|\"full\"|\"compact\")", "auto").option("--compact", "Alias for \"--ws-log compact\"", false).option("--raw-stream", "Log raw model stream events to jsonl", false).option("--raw-stream-path <path>", "Raw stream jsonl path").action(async (opts) => {
		await runGatewayCommand$1(opts);
	});
}

//#endregion
//#region src/cli/gateway-cli/register.ts
function styleHealthChannelLine(line, rich) {
	if (!rich) return line;
	const colon = line.indexOf(":");
	if (colon === -1) return line;
	const label = line.slice(0, colon + 1);
	const detail = line.slice(colon + 1).trimStart();
	const normalized = detail.toLowerCase();
	const applyPrefix = (prefix, color) => `${label} ${color(detail.slice(0, prefix.length))}${detail.slice(prefix.length)}`;
	if (normalized.startsWith("failed")) return applyPrefix("failed", theme.error);
	if (normalized.startsWith("ok")) return applyPrefix("ok", theme.success);
	if (normalized.startsWith("linked")) return applyPrefix("linked", theme.success);
	if (normalized.startsWith("configured")) return applyPrefix("configured", theme.success);
	if (normalized.startsWith("not linked")) return applyPrefix("not linked", theme.warn);
	if (normalized.startsWith("not configured")) return applyPrefix("not configured", theme.muted);
	if (normalized.startsWith("unknown")) return applyPrefix("unknown", theme.warn);
	return line;
}
function runGatewayCommand(action, label) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		const message = String(err);
		defaultRuntime.error(label ? `${label}: ${message}` : message);
		defaultRuntime.exit(1);
	});
}
function parseDaysOption(raw, fallback = 30) {
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(1, Math.floor(raw));
	if (typeof raw === "string" && raw.trim() !== "") {
		const parsed = Number(raw);
		if (Number.isFinite(parsed)) return Math.max(1, Math.floor(parsed));
	}
	return fallback;
}
function renderCostUsageSummary(summary, days, rich) {
	const totalCost = formatUsd(summary.totals.totalCost) ?? "$0.00";
	const totalTokens = formatTokenCount(summary.totals.totalTokens) ?? "0";
	const lines = [colorize(rich, theme.heading, `Usage cost (${days} days)`), `${colorize(rich, theme.muted, "Total:")} ${totalCost} · ${totalTokens} tokens`];
	if (summary.totals.missingCostEntries > 0) lines.push(`${colorize(rich, theme.muted, "Missing entries:")} ${summary.totals.missingCostEntries}`);
	const latest = summary.daily.at(-1);
	if (latest) {
		const latestCost = formatUsd(latest.totalCost) ?? "$0.00";
		const latestTokens = formatTokenCount(latest.totalTokens) ?? "0";
		lines.push(`${colorize(rich, theme.muted, "Latest day:")} ${latest.date} · ${latestCost} · ${latestTokens} tokens`);
	}
	return lines;
}
function registerGatewayCli(program) {
	const gateway = addGatewayRunCommand(program.command("gateway").description("Run the WebSocket Gateway").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/gateway", "docs.openclaw.ai/cli/gateway")}\n`));
	addGatewayRunCommand(gateway.command("run").description("Run the WebSocket Gateway (foreground)"));
	gateway.command("status").description("Show gateway service status + probe the Gateway").option("--url <url>", "Gateway WebSocket URL (defaults to config/remote/local)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (password auth)").option("--timeout <ms>", "Timeout in ms", "10000").option("--no-probe", "Skip RPC probe").option("--deep", "Scan system-level services", false).option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonStatus({
			rpc: opts,
			probe: Boolean(opts.probe),
			deep: Boolean(opts.deep),
			json: Boolean(opts.json)
		});
	});
	gateway.command("install").description("Install the Gateway service (launchd/systemd/schtasks)").option("--port <port>", "Gateway port").option("--runtime <runtime>", "Daemon runtime (node|bun). Default: node").option("--token <token>", "Gateway token (token auth)").option("--force", "Reinstall/overwrite if already installed", false).option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonInstall(opts);
	});
	gateway.command("uninstall").description("Uninstall the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonUninstall(opts);
	});
	gateway.command("start").description("Start the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonStart(opts);
	});
	gateway.command("stop").description("Stop the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonStop(opts);
	});
	gateway.command("restart").description("Restart the Gateway service (launchd/systemd/schtasks)").option("--json", "Output JSON", false).action(async (opts) => {
		await runDaemonRestart(opts);
	});
	gatewayCallOpts(gateway.command("call").description("Call a Gateway method").argument("<method>", "Method name (health/status/system-presence/cron.*)").option("--params <json>", "JSON object string for params", "{}").action(async (method, opts) => {
		await runGatewayCommand(async () => {
			const result = await callGatewayCli(method, opts, JSON.parse(String(opts.params ?? "{}")));
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			const rich = isRich();
			defaultRuntime.log(`${colorize(rich, theme.heading, "Gateway call")}: ${colorize(rich, theme.muted, String(method))}`);
			defaultRuntime.log(JSON.stringify(result, null, 2));
		}, "Gateway call failed");
	}));
	gatewayCallOpts(gateway.command("usage-cost").description("Fetch usage cost summary from session logs").option("--days <days>", "Number of days to include", "30").action(async (opts) => {
		await runGatewayCommand(async () => {
			const days = parseDaysOption(opts.days);
			const result = await callGatewayCli("usage.cost", opts, { days });
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			const rich = isRich();
			const summary = result;
			for (const line of renderCostUsageSummary(summary, days, rich)) defaultRuntime.log(line);
		}, "Gateway usage cost failed");
	}));
	gatewayCallOpts(gateway.command("health").description("Fetch Gateway health").action(async (opts) => {
		await runGatewayCommand(async () => {
			const result = await callGatewayCli("health", opts);
			if (opts.json) {
				defaultRuntime.log(JSON.stringify(result, null, 2));
				return;
			}
			const rich = isRich();
			const obj = result && typeof result === "object" ? result : {};
			const durationMs = typeof obj.durationMs === "number" ? obj.durationMs : null;
			defaultRuntime.log(colorize(rich, theme.heading, "Gateway Health"));
			defaultRuntime.log(`${colorize(rich, theme.success, "OK")}${durationMs != null ? ` (${durationMs}ms)` : ""}`);
			if (obj.channels && typeof obj.channels === "object") for (const line of formatHealthChannelLines(obj)) defaultRuntime.log(styleHealthChannelLine(line, rich));
		});
	}));
	gateway.command("probe").description("Show gateway reachability + discovery + health + status summary (local + remote)").option("--url <url>", "Explicit Gateway WebSocket URL (still probes localhost)").option("--ssh <target>", "SSH target for remote gateway tunnel (user@host or user@host:port)").option("--ssh-identity <path>", "SSH identity file path").option("--ssh-auto", "Try to derive an SSH target from Bonjour discovery", false).option("--token <token>", "Gateway token (applies to all probes)").option("--password <password>", "Gateway password (applies to all probes)").option("--timeout <ms>", "Overall probe budget in ms", "3000").option("--json", "Output JSON", false).action(async (opts) => {
		await runGatewayCommand(async () => {
			await gatewayStatusCommand(opts, defaultRuntime);
		});
	});
	gateway.command("discover").description("Discover gateways via Bonjour (local + wide-area if configured)").option("--timeout <ms>", "Per-command timeout in ms", "2000").option("--json", "Output JSON", false).action(async (opts) => {
		await runGatewayCommand(async () => {
			const wideAreaDomain = resolveWideAreaDiscoveryDomain({ configDomain: loadConfig().discovery?.wideArea?.domain });
			const timeoutMs = parseDiscoverTimeoutMs(opts.timeout, 2e3);
			const domains = ["local.", ...wideAreaDomain ? [wideAreaDomain] : []];
			const deduped = dedupeBeacons(await withProgress({
				label: "Scanning for gateways…",
				indeterminate: true,
				enabled: opts.json !== true,
				delayMs: 0
			}, async () => await discoverGatewayBeacons({
				timeoutMs,
				wideAreaDomain
			}))).toSorted((a, b) => String(a.displayName || a.instanceName).localeCompare(String(b.displayName || b.instanceName)));
			if (opts.json) {
				const enriched = deduped.map((b) => {
					const host = pickBeaconHost(b);
					const port = pickGatewayPort(b);
					return {
						...b,
						wsUrl: host ? `ws://${host}:${port}` : null
					};
				});
				defaultRuntime.log(JSON.stringify({
					timeoutMs,
					domains,
					count: enriched.length,
					beacons: enriched
				}, null, 2));
				return;
			}
			const rich = isRich();
			defaultRuntime.log(colorize(rich, theme.heading, "Gateway Discovery"));
			defaultRuntime.log(colorize(rich, theme.muted, `Found ${deduped.length} gateway(s) · domains: ${domains.join(", ")}`));
			if (deduped.length === 0) return;
			for (const beacon of deduped) for (const line of renderBeaconLines(beacon, rich)) defaultRuntime.log(line);
		}, "gateway discover failed");
	});
}

//#endregion
export { registerGatewayCli };