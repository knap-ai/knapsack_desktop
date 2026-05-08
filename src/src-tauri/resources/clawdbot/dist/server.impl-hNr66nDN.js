import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, r as lowercasePreservingWhitespace, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-BAiQfngU.js";
import { _ as resolveStateDir, i as isNixMode, r as STATE_DIR } from "./paths-B2cMK-wd.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { n as isVitestRuntimeEnv, r as logAcceptedEnvOption, t as isTruthyEnvValue } from "./env-BAymvSVL.js";
import { t as formatCliCommand } from "./command-format-BORwwHyH.js";
import { _ as sleep, p as resolveUserPath, s as ensureDir, y as truncateUtf16Safe } from "./utils-DvkbxKCZ.js";
import { s as resolveRuntimeServiceVersion } from "./version-vQIvyCe_.js";
import { n as defaultRuntime } from "./runtime-izpjJukX.js";
import { i as getChildLogger } from "./logger-BYIbL3gn.js";
import { i as isDiagnosticsEnabled, l as createDiagnosticTraceContext, s as setDiagnosticsEnabledForProcess, v as runWithDiagnosticTraceContext } from "./diagnostic-events-B5Jlu4QM.js";
import { r as runtimeForLogger, t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { i as runExec } from "./exec-C4nQnfsK.js";
import { o as getTailnetHostname } from "./tailscale-DXoBJpcV.js";
import { n as pickPrimaryTailnetIPv4, r as pickPrimaryTailnetIPv6 } from "./tailnet-L4ESw-9_.js";
import { _ as resolveRequestClientIp, a as isLoopbackHost, g as resolveHostName, h as resolveGatewayListenHosts, i as isLoopbackAddress, l as isTrustedProxyAddress, m as resolveGatewayBindHost, n as isContainerEnvironment, o as isPrivateOrLoopbackAddress, p as resolveClientIp, r as isLocalishHost, s as isPrivateOrLoopbackHost, t as defaultGatewayBindMode, u as isValidIPv4 } from "./net-BBCaEpfz.js";
import { a as createAuthRateLimiter, i as AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET, n as AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN } from "./auth-rate-limit-Cms-RqVX.js";
import { a as hasForwardedRequestHeaders, i as authorizeWsControlUiGatewayConnect, o as isLocalDirectRequest, r as authorizeHttpGatewayConnect, s as checkBrowserOrigin, t as assertGatewayAuthConfigured } from "./auth-Chs4IZd-.js";
import { n as resolveGatewayAuth } from "./auth-resolve-D9vCjzKT.js";
import { r as isCronRunSessionKey } from "./session-key-utils-naHBWFyS.js";
import { n as normalizeAccountId, r as normalizeOptionalAccountId } from "./account-id-DhSD7lhD.js";
import { c as normalizeAgentId, h as toAgentStoreSessionKey, l as normalizeMainKey, m as toAgentRequestSessionKey, u as resolveAgentIdFromSessionKey } from "./session-key-hxP9B3Or.js";
import { S as resolveDefaultAgentId, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import { c as repairBundledRuntimeDepsInstallRootAsync, g as getActiveBundledRuntimeDepsInstallCount, p as scanBundledPluginRuntimeDeps, u as resolveBundledRuntimeDependencyPackageInstallRoot } from "./bundled-runtime-root-DEMD7-O_.js";
import { t as loadBundledPluginPublicArtifactModuleSync } from "./public-surface-loader-Q3U25ebK.js";
import { D as validateConfigObjectWithPlugins, L as asResolvedSourceConfig, M as applyConfigOverrides, U as isPluginLocalInvalidConfigSnapshot, W as shouldAttemptLastKnownGoodRecovery, _ as recoverConfigFromLastKnownGood, c as promoteConfigSnapshotToLastKnownGood, f as readConfigFileSnapshotWithPluginMetadata, g as recoverConfigFromJsonRootSuffix, i as getRuntimeConfig, r as createConfigIO, u as readConfigFileSnapshot, v as registerConfigWriteListener, z as materializeRuntimeConfig } from "./io-CFdEhZuM.js";
import { n as ensureControlUiAllowedOriginsForNonLoopbackBind } from "./gateway-control-ui-origins-DpuxXpK4.js";
import { n as getLoadedChannelPlugin, r as listChannelPlugins, t as getChannelPlugin } from "./registry-yTN80EXi.js";
import { n as resolveSubagentMaxConcurrent, t as resolveAgentMaxConcurrent } from "./agent-limits-0vCGP_EN.js";
import { i as isKnownSecretTargetId } from "./target-registry-B9sk7_KR.js";
import { t as parseDurationMs } from "./parse-duration-D7zSmneY.js";
import { n as resolveNormalizedAccountEntry, t as resolveAccountEntry } from "./account-lookup-DimKmpQR.js";
import { r as replaceConfigFile } from "./config--k_1dtUP.js";
import { n as isRestartEnabled } from "./commands.flags-MaTsudt1.js";
import { a as buildDeviceAuthPayloadV3, i as buildDeviceAuthPayload, r as getPreauthHandshakeTimeoutMsFromEnv } from "./client-Dh94CUDv.js";
import { i as normalizeDevicePublicKeyBase64Url, s as verifyDeviceSignature, t as deriveDeviceIdFromPublicKey } from "./device-identity-BnG7_kkp.js";
import { t as rawDataToString } from "./ws-CQQhqVXc.js";
import { n as GATEWAY_CLIENT_IDS, r as GATEWAY_CLIENT_MODES } from "./client-info-B22NhLQV.js";
import { a as isOperatorUiClient, n as isGatewayCliClient, o as isWebchatClient, s as isDeliverableMessageChannel, t as isBrowserOperatorUiClient, u as normalizeMessageChannel } from "./message-channel-B32dwK-Q.js";
import { t as normalizeDeviceMetadataForAuth } from "./device-metadata-normalization-_AeRo1HT.js";
import { i as buildPairingConnectErrorMessage, m as resolveDeviceAuthConnectErrorDetailCode, n as buildPairingConnectCloseReason, p as resolveAuthConnectErrorDetailCode, r as buildPairingConnectErrorDetails, t as ConnectErrorDetailCodes } from "./connect-error-details-B6EKzVSa.js";
import { G as validateExecApprovalResolveParams, Mr as errorShape, O as validateConnectParams, U as validateExecApprovalGetParams, W as validateExecApprovalRequestParams, bt as validateSecretsResolveParams, ht as validatePluginApprovalResolveParams, jr as ErrorCodes, mt as validatePluginApprovalRequestParams, t as formatValidationErrors, vt as validateRequestFrame, xt as validateSecretsResolveResult } from "./protocol-Hjar_s3V.js";
import { a as approvalDecisionLabel, n as MAX_PLUGIN_APPROVAL_TIMEOUT_MS, o as buildPluginApprovalExpiredMessage, s as buildPluginApprovalRequestMessage, t as DEFAULT_PLUGIN_APPROVAL_TIMEOUT_MS } from "./plugin-approvals-CbigQT6z.js";
import { c as PAIRING_SCOPE, d as WRITE_SCOPE, l as READ_SCOPE, o as ADMIN_SCOPE, s as APPROVALS_SCOPE$1 } from "./method-scopes-D2ZEhvQU.js";
import { n as formatConfigIssueLines } from "./issue-format-DUq-EpQO.js";
import { a as emitGatewayRestart, d as setPreRestartDeferralCheck, i as deferGatewayRestartUntilIdle, u as setGatewaySigusr1RestartPolicy } from "./restart-BEJNVwEm.js";
import { r as normalizeControlUiBasePath } from "./control-ui-shared-JUcbpYyX.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-BlWaQbGq.js";
import { l as disposeRegisteredAgentHarnesses } from "./loader--FR-1ZCZ.js";
import { n as resolveChannelApprovalCapability, t as resolveChannelApprovalAdapter } from "./plugins-D-K4uCVI.js";
import { o as runGlobalGatewayStopSafely } from "./hook-runner-global-_PCECtwt.js";
import { m as triggerInternalHook, n as createInternalHookEvent } from "./internal-hooks-BafH2tQ8.js";
import { S as createEmptyPluginRegistry, a as getActivePluginRegistry, b as resolveActivePluginHttpRouteRegistry, d as pinActivePluginChannelRegistry, f as pinActivePluginHttpRouteRegistry, h as releasePinnedPluginHttpRouteRegistry, m as releasePinnedPluginChannelRegistry, x as setActivePluginRegistry } from "./runtime-Df1Zlb_-.js";
import "./logging-D6k9oiB3.js";
import { a as clearCurrentPluginMetadataSnapshot, o as setCurrentPluginMetadataSnapshot } from "./models-config-Bv7OnXdx.js";
import { o as resetModelCatalogCache } from "./model-catalog-iwhpeFqc.js";
import { t as SsrFBlockedError } from "./ssrf-K8pX0Zi6.js";
import { r as ensureGlobalUndiciEnvProxyDispatcher } from "./undici-global-dispatcher-CDAQsjZ7.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-8smVA_M-.js";
import { n as detectMime } from "./mime-B-vvNIo6.js";
import { i as resolveMainSessionKey, n as resolveAgentMainSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-JXLAAy4Q.js";
import { t as loadCombinedSessionStoreForGateway } from "./combined-store-gateway-IXcczRzK.js";
import { u as resolveStorePath } from "./paths-CHP3g1Fg.js";
import { t as loadSessionStore } from "./store-load-DLuD4etm.js";
import { o as updateSessionStore, t as archiveRemovedSessionTranscripts } from "./store-CR7YmZjp.js";
import "./sessions-CLHVJJOI.js";
import { n as onSessionTranscriptUpdate } from "./transcript-events-CI8Ym6av.js";
import { n as sleepWithAbort, t as computeBackoff } from "./backoff-BbA8HJTf.js";
import { c as getAgentRunContext, d as sweepStaleRunContexts, l as onAgentEvent, t as clearAgentRunContext, u as registerAgentRunContext } from "./agent-events-1--MOtpo.js";
import { o as startGatewayModelPricingRefresh } from "./usage-format-CxRWdJfK.js";
import "./session-utils.fs-BgGqlqA-.js";
import { i as cleanupArchivedSessionTranscripts } from "./session-transcript-files.fs-CzArr0l-.js";
import "./session-utils-r05OsxB5.js";
import { i as enqueueCommandInLane, s as getTotalQueueSize, u as setCommandLaneConcurrency } from "./command-queue-O7Nzaeee.js";
import { t as getMachineDisplayName } from "./machine-name-Dt6Lwf9l.js";
import { o as resolveFailoverReasonFromError } from "./failover-error-DQkWPkYr.js";
import { i as disposeAllSessionMcpRuntimes } from "./pi-bundle-mcp-runtime-HGvJp58Y.js";
import "./pi-bundle-mcp-tools-Bck95tFX.js";
import { t as loadGatewayTlsRuntime$1 } from "./gateway-mLG99U0_.js";
import { T as resolveExecApprovalRequestAllowedDecisions, r as DEFAULT_EXEC_APPROVAL_TIMEOUT_MS, w as resolveExecApprovalAllowedDecisions } from "./exec-approvals-BzZbTLG7.js";
import { a as prepareSecretsRuntimeSnapshot, i as getActiveSecretsRuntimeSnapshot, n as clearSecretsRuntimeSnapshot, t as activateSecretsRuntimeSnapshot } from "./runtime-BHvI5I0v.js";
import { a as resolveCronNotificationSessionKey, i as resolveCronDeliverySessionKey, o as resolveCronSessionTargetSessionKey, r as isInvalidCronSessionTargetIdError, t as normalizeHttpWebhookUrl } from "./webhook-url-BcYN1Hdt.js";
import { n as normalizeCronJobInput } from "./normalize-DeXOH_O0.js";
import { r as cleanOldMedia } from "./store-L0fSpY73.js";
import { a as CANVAS_HOST_PATH, n as normalizeUrlPath, r as resolveFileWithinRoot, s as injectCanvasLiveReload, t as handleA2uiHttpRequest } from "./a2ui-CcHyNkch.js";
import { n as collectCommandSecretAssignmentsFromSnapshot } from "./command-config-CLSkB_vF.js";
import { n as evaluateGatewayAuthSurfaceStates, t as GATEWAY_AUTH_SURFACE_PATHS } from "./runtime-gateway-auth-surfaces-CwP_sgt9.js";
import { t as deliverOutboundPayloads } from "./deliver-W8vl_gyO.js";
import { r as resetDirectoryCache } from "./target-resolver-7ALQauKj.js";
import { t as buildOutboundSessionContext } from "./session-context-DhNm8AQH.js";
import { i as resolveChannelDefaultAccountId } from "./helpers-DacXri_3.js";
import { n as requestHeartbeatNow } from "./heartbeat-wake-FxHI2o_9.js";
import { i as enqueueSystemEvent } from "./system-events-BOVw40Do.js";
import { i as failTaskRunByRunId, r as createRunningTaskRun, t as completeTaskRunByRunId } from "./detached-task-runtime-6WfuNV0D.js";
import { f as getActiveEmbeddedRunCount } from "./runs-CCsjme9h.js";
import { h as stopDiagnosticHeartbeat, m as startDiagnosticHeartbeat } from "./diagnostic-DitKp9ni.js";
import { _ as onSessionLifecycleEvent, c as initSubagentRegistry } from "./subagent-registry-DopJgK6v.js";
import { t as resolvePreferredSessionKeyForSessionIdMatches } from "./session-id-resolution-B_71PCoN.js";
import { t as getTotalPendingReplies } from "./dispatcher-registry-CZMj5se1.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-BMBxRDDc.js";
import { t as matchesApprovalRequestFilters } from "./approval-request-filters-Btmqgt6b.js";
import { c as formatExecApprovalExpiresIn, f as resolveExecApprovalInitiatingSurfaceState } from "./exec-approval-reply-B6LWxNYR.js";
import { t as CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY } from "./approval-handler-adapter-runtime-CC8KzxBz.js";
import { n as sanitizeExecApprovalDisplayText, t as resolveExecApprovalCommandDisplay } from "./exec-approval-command-display-DMZaYbM0.js";
import { n as createChannelApprovalHandlerFromCapability } from "./approval-handler-runtime-BRXi7T8v.js";
import { i as watchChannelRuntimeContexts, n as getChannelRuntimeContext, t as createTaskScopedChannelRuntime } from "./channel-runtime-context-mrqKKeJb.js";
import { i as buildPluginApprovalResolvedReplyPayload, n as buildApprovalResolvedReplyPayload, r as buildPluginApprovalPendingReplyPayload, t as buildApprovalPendingReplyPayload } from "./approval-renderers-Cguy7i1f.js";
import { a as cronSchedulingInputsEqual, i as saveCronStore, r as resolveCronStorePath, t as loadCronStore } from "./store-O7F47M2g.js";
import { r as onHeartbeatEvent } from "./heartbeat-events-Dev4DATw.js";
import { n as resolveAgentOutboundIdentity } from "./identity-C7z27lmT.js";
import { r as registerSkillsChangeListener } from "./refresh-state-CW2abCyT.js";
import { i as resolveNodeCommandAllowlist, r as normalizeDeclaredNodeCommands } from "./node-command-policy-DrAl5pZQ.js";
import { t as safeParseJson } from "./server-json-DCqyamk1.js";
import { i as summarizeAgentEventForWsLog, n as logWs, r as shouldLogWs, t as formatForLog } from "./ws-log-p1eSleCB.js";
import { i as assertGatewayAuthNotKnownWeak, n as mergeGatewayAuthConfig, r as mergeGatewayTailscaleConfig, t as ensureGatewayStartupAuth } from "./startup-auth-C0ghpvlY.js";
import { c as roleScopesAllow } from "./pairing-token-Cv01Rz6k.js";
import { a as refreshRemoteBinsForConnectedNodes, c as setSkillsRemoteRegistry, g as updatePairedNodeMetadata, h as requestNodePairing, i as recordRemoteNodeInfo, n as primeRemoteSkillsCache, o as refreshRemoteNodeBins, s as removeRemoteNodeInfo, u as getPairedNode } from "./skills-remote-BrTLeqls.js";
import { r as resolveBootstrapProfileScopesForRole } from "./device-bootstrap-profile-BB7Yi_yP.js";
import { _ as updatePairedDeviceMetadata, a as getPairedDevice, c as listApprovedPairedDeviceRoles, l as listDevicePairing, n as approveDevicePairing, p as requestDevicePairing, r as ensureDeviceToken, s as hasEffectivePairedDeviceRole, t as approveBootstrapDevicePairing, u as listEffectivePairedDeviceRoles, v as verifyDeviceToken } from "./device-pairing-wkouYy9B.js";
import { a as redeemDeviceBootstrapTokenProfile, n as getBoundDeviceBootstrapProfile, o as revokeDeviceBootstrapToken, r as getDeviceBootstrapTokenProfile, s as verifyDeviceBootstrapToken } from "./device-bootstrap-C0mqX0qI.js";
import { t as createDefaultDeps } from "./deps-DU-zHj4u.js";
import { i as buildSystemRunApprovalEnvBinding, r as buildSystemRunApprovalBinding } from "./system-run-command-Cx_NKhFN.js";
import { n as resolveSystemRunApprovalRequestContext } from "./system-run-approval-context-BtyF2vio.js";
import { d as logRejectedLargePayload, n as sendGatewayAuthFailure, o as setDefaultSecurityHeaders } from "./http-common-upoyWvf5.js";
import { _ as resolveHooksConfig } from "./hooks-yfZrrzcF.js";
import { n as loadGatewayModelCatalog, t as __resetModelCatalogCacheForTest } from "./server-model-catalog-CCif8jPv.js";
import { t as createOutboundSendDeps } from "./outbound-send-deps-Bdmrrk8D.js";
import { a as MAX_PAYLOAD_BYTES, i as MAX_BUFFERED_BYTES, o as MAX_PREAUTH_PAYLOAD_BYTES, r as HEALTH_REFRESH_INTERVAL_MS, s as TICK_INTERVAL_MS, t as DEDUPE_MAX } from "./server-constants-D1hNc2O7.js";
import { t as abortChatRunById } from "./chat-abort-hPcmdsnz.js";
import "./refresh-CZ2n5WoB.js";
import { t as cleanupBrowserSessionsForLifecycleEnd } from "./browser-lifecycle-cleanup-C_IeNdCn.js";
import { a as writeWideAreaGatewayZone, i as resolveWideAreaDiscoveryDomain } from "./widearea-dns-NQ3AkoeS.js";
import { a as resolveControlUiRootOverrideSync, n as isPackageProvenControlUiRootSync, o as resolveControlUiRootSync, t as ensureControlUiAssetsBuilt } from "./control-ui-assets-BxnfkIdw.js";
import { t as GatewayLockError } from "./gateway-lock-BxtQ23ET.js";
import { t as getHealthSnapshot } from "./health-DeX4rMEb.js";
import { _ as markCronJobActive, f as startTaskRegistryMaintenance, g as clearCronJobActive, p as stopTaskRegistryMaintenance, r as getInspectableTaskRegistrySummary, t as configureTaskRegistryMaintenance } from "./task-registry.maintenance-CcceIjji.js";
import { a as resolveCronRunLogPath, o as resolveCronRunLogPruneOptions, t as appendCronRunLog } from "./run-log-CR-7Y-p2.js";
import { i as migrateOrphanedSessionKeys } from "./state-migrations-B5t6vgNA.js";
import { n as resolveFailureDestination, t as resolveCronDeliveryPlan } from "./delivery-plan-DAylTJk0.js";
import { t as runCronIsolatedAgentTurn } from "./isolated-agent-CcTl_LjD.js";
import { _ as resolveDeliveryTarget, a as computeJobPreviousRunAtMs, c as findJobOrThrow, d as isJobEnabled, f as nextWakeAtMs, g as resolveJobPayloadTextForMain, h as recordScheduleComputeError, i as computeJobNextRunAtMs, l as hasScheduledNextRunAtMs, m as recomputeNextRunsForMaintenance, n as applyJobPatch, o as createJob, p as recomputeNextRuns, r as assertSupportedJobSpec, s as errorBackoffMs, t as DEFAULT_ERROR_BACKOFF_SCHEDULE_MS, u as isJobDue } from "./jobs-DVfujmeJ.js";
import { t as createCronExecutionId } from "./run-id-Dp688XYI.js";
import { t as runChannelPluginStartupMaintenance } from "./lifecycle-startup-C87c6Gwa.js";
import { n as resolveAssistantIdentity } from "./assistant-identity-Oa5mWdh_.js";
import { D as pruneStaleControlPlaneBuckets, T as roleCanSkipDeviceIdentity, _ as buildGatewayReloadPlan, f as loadVoiceWakeConfig, g as startGatewayConfigReloader, h as resolveGatewayReloadSettings, i as upsertPresence, m as diffConfigPaths, n as listSystemPresence, s as clearNodeWakeState, t as broadcastPresenceSnapshot, u as formatError, v as loadVoiceWakeRoutingConfig, w as parseGatewayRole } from "./presence-events-DktTPEyC.js";
import { a as resolveApnsAuthConfigFromEnv, c as sendApnsExecApprovalAlert, d as resolveApnsRelayConfigFromEnv, l as sendApnsExecApprovalResolvedWake, n as loadApnsRegistration, t as clearApnsRegistrationIfCurrent, u as shouldClearStoredApnsRegistration } from "./push-apns-DATsloye.js";
import { i as normalizeCanvasScopedUrl, n as buildCanvasScopedHostUrl, r as mintCanvasCapabilityToken, t as CANVAS_CAPABILITY_TTL_MS } from "./canvas-capability-CuMcYzPG.js";
import { n as runHeartbeatOnce, r as startHeartbeatRunner } from "./heartbeat-runner-BPAToAzE.js";
import { a as loadPluginLookUpTable, i as setFallbackGatewayContextResolver, o as mergeActivationSectionsIntoRuntimeConfig, t as loadGatewayStartupPlugins } from "./server-plugin-bootstrap-CKmijMP2.js";
import { n as stopGmailWatcher, t as startGmailWatcherWithLogs } from "./gmail-watcher-lifecycle-8PF2s7Xy.js";
import { a as resolvePluginRoutePathContext, i as isProtectedPluginRoutePathFromContext, n as shouldEnforceGatewayAuthForPluginPath } from "./route-auth-SJhaf4nx.js";
import "./paths-COvTKgy0.js";
import { t as getUpdateAvailable } from "./update-startup-EOK6yTlP.js";
import { t as hasConfiguredInternalHooks } from "./configured-CdbxB8L7.js";
import { t as truncateCloseReason } from "./close-reason-8HUllQNM.js";
import { createRequire } from "node:module";
import * as fsSync from "node:fs";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
import os from "node:os";
import { createHash, randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";
import { clearTimeout as clearTimeout$1, setTimeout as setTimeout$1 } from "node:timers";
import { createServer } from "node:http";
import { createServer as createServer$1 } from "node:https";
import { setTimeout as setTimeout$2 } from "node:timers/promises";
import chokidar from "chokidar";
import { monitorEventLoopDelay } from "node:perf_hooks";
//#region src/infra/exec-approval-forwarder.ts
const log$2 = createSubsystemLogger("gateway/exec-approvals");
const DEFAULT_MODE = "session";
const SYNTHETIC_APPROVAL_REQUEST_ID = "__approval-routing__";
let execApprovalForwarderRuntimePromise = null;
function loadExecApprovalForwarderRuntime() {
	execApprovalForwarderRuntimePromise ??= import("./exec-approval-forwarder.runtime-B46-N-zv.js");
	return execApprovalForwarderRuntimePromise;
}
function normalizeMode(mode) {
	return mode ?? DEFAULT_MODE;
}
function shouldForwardRoute(params) {
	const config = params.config;
	if (!config?.enabled) return false;
	return matchesApprovalRequestFilters({
		request: params.routeRequest,
		agentFilter: config.agentFilter,
		sessionFilter: config.sessionFilter,
		fallbackAgentIdFromSessionKey: true
	});
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
function buildSyntheticApprovalRequest(routeRequest) {
	return {
		id: SYNTHETIC_APPROVAL_REQUEST_ID,
		request: {
			command: "",
			agentId: routeRequest.agentId ?? null,
			sessionKey: routeRequest.sessionKey ?? null,
			turnSourceChannel: routeRequest.turnSourceChannel ?? null,
			turnSourceTo: routeRequest.turnSourceTo ?? null,
			turnSourceAccountId: routeRequest.turnSourceAccountId ?? null,
			turnSourceThreadId: routeRequest.turnSourceThreadId ?? null
		},
		createdAtMs: 0,
		expiresAtMs: 0
	};
}
function shouldSkipForwardingFallback(params) {
	const channel = normalizeMessageChannel(params.target.channel) ?? params.target.channel;
	if (!channel) return false;
	return resolveChannelApprovalAdapter(getLoadedChannelPlugin(channel))?.delivery?.shouldSuppressForwardingFallback?.({
		cfg: params.cfg,
		approvalKind: params.approvalKind,
		target: params.target,
		request: buildSyntheticApprovalRequest(params.routeRequest)
	}) ?? false;
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
	const allowedDecisions = resolveExecApprovalRequestAllowedDecisions(request.request);
	const decisionText = allowedDecisions.join("|");
	const lines = ["🔒 Exec approval required", `ID: ${request.id}`];
	const command = formatApprovalCommand(resolveExecApprovalCommandDisplay(request.request).commandText);
	if (command.inline) lines.push(`Command: ${command.text}`);
	else {
		lines.push("Command:");
		lines.push(command.text);
	}
	if (request.request.cwd) lines.push(`CWD: ${request.request.cwd}`);
	if (request.request.nodeId) lines.push(`Node: ${request.request.nodeId}`);
	if (Array.isArray(request.request.envKeys) && request.request.envKeys.length > 0) lines.push(`Env overrides: ${request.request.envKeys.join(", ")}`);
	if (request.request.host) lines.push(`Host: ${request.request.host}`);
	if (request.request.agentId) lines.push(`Agent: ${request.request.agentId}`);
	if (request.request.security) lines.push(`Security: ${request.request.security}`);
	if (request.request.ask) lines.push(`Ask: ${request.request.ask}`);
	lines.push(`Expires in: ${formatExecApprovalExpiresIn(request.expiresAtMs, nowMs)}`);
	lines.push("Mode: foreground (interactive approvals available in this chat).");
	lines.push(allowedDecisions.includes("allow-always") ? "Background mode note: non-interactive runs cannot wait for chat approvals; use pre-approved policy (allow-always or ask=off)." : "Background mode note: non-interactive runs cannot wait for chat approvals; the effective policy still requires per-run approval unless ask=off.");
	lines.push(`Reply with: /approve <id> ${decisionText}`);
	if (!allowedDecisions.includes("allow-always")) lines.push("Allow Always is unavailable because the effective policy requires approval every time.");
	return lines.join("\n");
}
const decisionLabel = approvalDecisionLabel;
function buildResolvedMessage(resolved) {
	return `${`✅ Exec approval ${decisionLabel(resolved.decision)}.`}${resolved.resolvedBy ? ` Resolved by ${resolved.resolvedBy}.` : ""} ID: ${resolved.id}`;
}
function buildExpiredMessage(request) {
	return `⏱️ Exec approval expired. ID: ${request.id}`;
}
function normalizeTurnSourceChannel(value) {
	const normalized = value ? normalizeMessageChannel(value) : void 0;
	return normalized && isDeliverableMessageChannel(normalized) ? normalized : void 0;
}
function extractApprovalRouteRequest(request) {
	if (!request) return null;
	return {
		agentId: request.agentId ?? null,
		sessionKey: request.sessionKey ?? null,
		turnSourceChannel: request.turnSourceChannel ?? null,
		turnSourceTo: request.turnSourceTo ?? null,
		turnSourceAccountId: request.turnSourceAccountId ?? null,
		turnSourceThreadId: request.turnSourceThreadId ?? null
	};
}
function defaultResolveSessionTarget(params) {
	return loadExecApprovalForwarderRuntime().then(({ resolveExecApprovalSessionTarget }) => {
		const resolvedTarget = resolveExecApprovalSessionTarget({
			cfg: params.cfg,
			request: params.request,
			turnSourceChannel: normalizeTurnSourceChannel(params.request.request.turnSourceChannel),
			turnSourceTo: normalizeOptionalString(params.request.request.turnSourceTo),
			turnSourceAccountId: normalizeOptionalString(params.request.request.turnSourceAccountId),
			turnSourceThreadId: params.request.request.turnSourceThreadId ?? void 0
		});
		if (!resolvedTarget?.channel || !resolvedTarget.to) return null;
		const channel = resolvedTarget.channel;
		if (!isDeliverableMessageChannel(channel)) return null;
		return {
			channel,
			to: resolvedTarget.to,
			accountId: resolvedTarget.accountId,
			threadId: resolvedTarget.threadId
		};
	});
}
async function deliverToTargets(params) {
	const deliveries = params.targets.map(async (target) => {
		if (params.shouldSend && !params.shouldSend()) return;
		const channel = normalizeMessageChannel(target.channel) ?? target.channel;
		if (!isDeliverableMessageChannel(channel)) return;
		try {
			const payload = params.buildPayload(target);
			await params.beforeDeliver?.(target, payload);
			await params.deliver({
				cfg: params.cfg,
				channel,
				to: target.to,
				accountId: target.accountId,
				threadId: target.threadId,
				payloads: [payload]
			});
		} catch (err) {
			log$2.error(`exec approvals: failed to deliver to ${channel}:${target.to}: ${String(err)}`);
		}
	});
	await Promise.allSettled(deliveries);
}
function buildApprovalRenderPayload(params) {
	const channel = normalizeMessageChannel(params.target.channel) ?? params.target.channel;
	return (channel ? params.resolveRenderer(resolveChannelApprovalAdapter(getLoadedChannelPlugin(channel)))?.(params.renderParams) : null) ?? params.buildFallback();
}
function buildExecPendingPayload(params) {
	return buildApprovalRenderPayload({
		target: params.target,
		renderParams: params,
		resolveRenderer: (adapter) => adapter?.render?.exec?.buildPendingPayload,
		buildFallback: () => buildApprovalPendingReplyPayload({
			approvalId: params.request.id,
			approvalSlug: params.request.id.slice(0, 8),
			text: buildRequestMessage(params.request, params.nowMs),
			agentId: params.request.request.agentId ?? null,
			allowedDecisions: resolveExecApprovalRequestAllowedDecisions(params.request.request),
			sessionKey: params.request.request.sessionKey ?? null
		})
	});
}
function buildExecResolvedPayload(params) {
	return buildApprovalRenderPayload({
		target: params.target,
		renderParams: params,
		resolveRenderer: (adapter) => adapter?.render?.exec?.buildResolvedPayload,
		buildFallback: () => buildApprovalResolvedReplyPayload({
			approvalId: params.resolved.id,
			approvalSlug: params.resolved.id.slice(0, 8),
			text: buildResolvedMessage(params.resolved)
		})
	});
}
function buildPluginPendingPayload(params) {
	return buildApprovalRenderPayload({
		target: params.target,
		renderParams: params,
		resolveRenderer: (adapter) => adapter?.render?.plugin?.buildPendingPayload,
		buildFallback: () => buildPluginApprovalPendingReplyPayload({
			request: params.request,
			nowMs: params.nowMs,
			text: buildPluginApprovalRequestMessage(params.request, params.nowMs)
		})
	});
}
function buildPluginResolvedPayload(params) {
	return buildApprovalRenderPayload({
		target: params.target,
		renderParams: params,
		resolveRenderer: (adapter) => adapter?.render?.plugin?.buildResolvedPayload,
		buildFallback: () => buildPluginApprovalResolvedReplyPayload({ resolved: params.resolved })
	});
}
async function resolveForwardTargets(params) {
	const mode = normalizeMode(params.config?.mode);
	const targets = [];
	const seen = /* @__PURE__ */ new Set();
	if (mode === "session" || mode === "both") {
		const sessionTarget = await params.resolveSessionTarget({
			cfg: params.cfg,
			request: buildSyntheticApprovalRequest(params.routeRequest)
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
		const explicitTargets = params.config?.targets ?? [];
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
	return targets;
}
function createApprovalHandlers(params) {
	const pending = /* @__PURE__ */ new Map();
	const handleRequested = async (request) => {
		const cfg = params.getConfig();
		const config = params.strategy.config(cfg);
		const requestId = params.strategy.getRequestId(request);
		const routeRequest = params.strategy.getRouteRequestFromRequest(request);
		const filteredTargets = [...shouldForwardRoute({
			config,
			routeRequest
		}) ? await resolveForwardTargets({
			cfg,
			config,
			routeRequest,
			resolveSessionTarget: params.resolveSessionTarget
		}) : []].filter((target) => !shouldSkipForwardingFallback({
			approvalKind: params.strategy.kind,
			target,
			cfg,
			routeRequest
		}));
		if (filteredTargets.length === 0) return false;
		const expiresInMs = Math.max(0, params.strategy.getExpiresAtMs(request) - params.nowMs());
		const timeoutId = setTimeout(() => {
			(async () => {
				const entry = pending.get(requestId);
				if (!entry) return;
				pending.delete(requestId);
				await deliverToTargets({
					cfg,
					targets: entry.targets,
					buildPayload: () => ({ text: params.strategy.buildExpiredText(request) }),
					deliver: params.deliver
				});
			})();
		}, expiresInMs);
		timeoutId.unref?.();
		const pendingEntry = {
			routeRequest,
			targets: filteredTargets,
			timeoutId
		};
		pending.set(requestId, pendingEntry);
		if (pending.get(requestId) !== pendingEntry) return false;
		deliverToTargets({
			cfg,
			targets: filteredTargets,
			buildPayload: (target) => params.strategy.buildPendingPayload({
				cfg,
				request,
				target,
				routeRequest,
				nowMs: params.nowMs()
			}),
			beforeDeliver: async (target, payload) => {
				const channel = normalizeMessageChannel(target.channel) ?? target.channel;
				if (!channel) return;
				await getLoadedChannelPlugin(channel)?.outbound?.beforeDeliverPayload?.({
					cfg,
					target,
					payload,
					hint: {
						kind: "approval-pending",
						approvalKind: params.strategy.kind
					}
				});
			},
			deliver: params.deliver,
			shouldSend: () => pending.get(requestId) === pendingEntry
		}).catch((err) => {
			log$2.error(`${params.strategy.kind} approvals: failed to deliver request ${requestId}: ${String(err)}`);
		});
		return true;
	};
	const handleResolved = async (resolved) => {
		const resolvedId = params.strategy.getResolvedId(resolved);
		const entry = pending.get(resolvedId);
		if (entry?.timeoutId) clearTimeout(entry.timeoutId);
		if (entry) pending.delete(resolvedId);
		const cfg = params.getConfig();
		let targets = entry?.targets;
		if (!targets) {
			const routeRequest = params.strategy.getRouteRequestFromResolved(resolved);
			if (routeRequest) {
				const config = params.strategy.config(cfg);
				targets = [...shouldForwardRoute({
					config,
					routeRequest
				}) ? await resolveForwardTargets({
					cfg,
					config,
					routeRequest,
					resolveSessionTarget: params.resolveSessionTarget
				}) : []].filter((target) => !shouldSkipForwardingFallback({
					approvalKind: params.strategy.kind,
					target,
					cfg,
					routeRequest
				}));
			}
		}
		if (!targets?.length) return;
		await deliverToTargets({
			cfg,
			targets,
			buildPayload: (target) => params.strategy.buildResolvedPayload({
				cfg,
				resolved,
				target,
				routeRequest: entry?.routeRequest ?? params.strategy.getRouteRequestFromResolved(resolved) ?? {}
			}),
			deliver: params.deliver
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
function createApprovalStrategy(params) {
	return {
		kind: params.kind,
		config: params.config,
		getRequestId: (request) => request.id,
		getResolvedId: (resolved) => resolved.id,
		getExpiresAtMs: (request) => request.expiresAtMs,
		getRouteRequestFromRequest: (request) => extractApprovalRouteRequest(request.request) ?? {},
		getRouteRequestFromResolved: (resolved) => extractApprovalRouteRequest(resolved.request),
		buildExpiredText: params.buildExpiredText,
		buildPendingPayload: params.buildPendingPayload,
		buildResolvedPayload: params.buildResolvedPayload
	};
}
const execApprovalStrategy = createApprovalStrategy({
	kind: "exec",
	config: (cfg) => cfg.approvals?.exec,
	buildExpiredText: buildExpiredMessage,
	buildPendingPayload: ({ cfg, request, target, nowMs }) => buildExecPendingPayload({
		cfg,
		request,
		target,
		nowMs
	}),
	buildResolvedPayload: ({ cfg, resolved, target }) => buildExecResolvedPayload({
		cfg,
		resolved,
		target
	})
});
const pluginApprovalStrategy = createApprovalStrategy({
	kind: "plugin",
	config: (cfg) => cfg.approvals?.plugin,
	buildExpiredText: buildPluginApprovalExpiredMessage,
	buildPendingPayload: ({ cfg, request, target, nowMs }) => buildPluginPendingPayload({
		cfg,
		request,
		target,
		nowMs
	}),
	buildResolvedPayload: ({ cfg, resolved, target }) => buildPluginResolvedPayload({
		cfg,
		resolved,
		target
	})
});
function createExecApprovalForwarder(deps = {}) {
	const getConfig = deps.getConfig ?? getRuntimeConfig;
	const deliver = deps.deliver ?? (async (params) => {
		const { deliverOutboundPayloads } = await loadExecApprovalForwarderRuntime();
		return deliverOutboundPayloads(params);
	});
	const nowMs = deps.nowMs ?? Date.now;
	const resolveSessionTarget = deps.resolveSessionTarget ?? defaultResolveSessionTarget;
	const execHandlers = createApprovalHandlers({
		strategy: execApprovalStrategy,
		getConfig,
		deliver,
		nowMs,
		resolveSessionTarget
	});
	const pluginHandlers = createApprovalHandlers({
		strategy: pluginApprovalStrategy,
		getConfig,
		deliver,
		nowMs,
		resolveSessionTarget
	});
	return {
		handleRequested: execHandlers.handleRequested,
		handleResolved: execHandlers.handleResolved,
		handlePluginApprovalRequested: pluginHandlers.handleRequested,
		handlePluginApprovalResolved: pluginHandlers.handleResolved,
		stop: () => {
			execHandlers.stop();
			pluginHandlers.stop();
		}
	};
}
//#endregion
//#region src/secrets/runtime-command-secrets.ts
function resolveCommandSecretsFromActiveRuntimeSnapshot(params) {
	const activeSnapshot = getActiveSecretsRuntimeSnapshot();
	if (!activeSnapshot) throw new Error("Secrets runtime snapshot is not active.");
	if (params.targetIds.size === 0) return {
		assignments: [],
		diagnostics: [],
		inactiveRefPaths: []
	};
	const inactiveRefPaths = [...new Set(activeSnapshot.warnings.filter((warning) => warning.code === "SECRETS_REF_IGNORED_INACTIVE_SURFACE").map((warning) => warning.path))];
	const resolved = collectCommandSecretAssignmentsFromSnapshot({
		sourceConfig: activeSnapshot.sourceConfig,
		resolvedConfig: activeSnapshot.config,
		commandName: params.commandName,
		targetIds: params.targetIds,
		inactiveRefPaths: new Set(inactiveRefPaths)
	});
	return {
		assignments: resolved.assignments,
		diagnostics: resolved.diagnostics,
		inactiveRefPaths
	};
}
//#endregion
//#region src/gateway/exec-approval-ios-push.ts
const APPROVALS_SCOPE = "operator.approvals";
const OPERATOR_ROLE = "operator";
function isIosPlatform(platform) {
	const normalized = normalizeOptionalLowercaseString(platform) ?? "";
	return normalized.startsWith("ios") || normalized.startsWith("ipados");
}
function resolveActiveOperatorToken(device) {
	const operatorToken = device.tokens?.[OPERATOR_ROLE];
	if (!operatorToken || operatorToken.revokedAtMs) return null;
	return operatorToken;
}
function canApproveExecRequests(device) {
	const operatorToken = resolveActiveOperatorToken(device);
	if (!operatorToken) return false;
	return roleScopesAllow({
		role: OPERATOR_ROLE,
		requestedScopes: [APPROVALS_SCOPE],
		allowedScopes: operatorToken.scopes
	});
}
function shouldTargetDevice(params) {
	if (!isIosPlatform(params.device.platform)) return false;
	if (!hasEffectivePairedDeviceRole(params.device, OPERATOR_ROLE)) return false;
	if (!params.requireApprovalScope) return true;
	return canApproveExecRequests(params.device);
}
async function loadRegisteredTargets(params) {
	return (await Promise.all(params.deviceIds.map(async (nodeId) => {
		const registration = await loadApnsRegistration(nodeId);
		return registration ? {
			nodeId,
			registration
		} : null;
	}))).filter((target) => target !== null);
}
async function resolvePairedTargets(params) {
	return await loadRegisteredTargets({ deviceIds: (await listDevicePairing()).paired.filter((device) => shouldTargetDevice({
		device,
		requireApprovalScope: params.requireApprovalScope
	})).map((device) => device.deviceId) });
}
async function resolveDeliveryPlan(params) {
	const targets = params.explicitNodeIds?.length ? await loadRegisteredTargets({ deviceIds: params.explicitNodeIds }) : await resolvePairedTargets({ requireApprovalScope: params.requireApprovalScope });
	if (targets.length === 0) return { targets: [] };
	const needsDirect = targets.some((target) => target.registration.transport === "direct");
	const needsRelay = targets.some((target) => target.registration.transport === "relay");
	let directAuth;
	if (needsDirect) {
		const auth = await resolveApnsAuthConfigFromEnv(process.env);
		if (auth.ok) directAuth = auth.value;
		else params.log.warn?.(`exec approvals: iOS direct APNs auth unavailable: ${auth.error}`);
	}
	let relayConfig;
	if (needsRelay) {
		const relay = resolveApnsRelayConfigFromEnv(process.env, getRuntimeConfig().gateway);
		if (relay.ok) relayConfig = relay.value;
		else params.log.warn?.(`exec approvals: iOS relay APNs config unavailable: ${relay.error}`);
	}
	return {
		targets: targets.filter((target) => target.registration.transport === "direct" ? Boolean(directAuth) : Boolean(relayConfig)),
		directAuth,
		relayConfig
	};
}
async function clearStaleApnsRegistrationIfNeeded(params) {
	if (shouldClearStoredApnsRegistration({
		registration: params.registration,
		result: params.result
	})) await clearApnsRegistrationIfCurrent({
		nodeId: params.nodeId,
		registration: params.registration
	});
}
async function sendRequestedPushes(params) {
	const results = await Promise.allSettled(params.plan.targets.map(async (target) => {
		const result = target.registration.transport === "direct" ? await sendApnsExecApprovalAlert({
			registration: target.registration,
			nodeId: target.nodeId,
			approvalId: params.request.id,
			auth: params.plan.directAuth
		}) : await sendApnsExecApprovalAlert({
			registration: target.registration,
			nodeId: target.nodeId,
			approvalId: params.request.id,
			relayConfig: params.plan.relayConfig
		});
		await clearStaleApnsRegistrationIfNeeded({
			nodeId: target.nodeId,
			registration: target.registration,
			result
		});
		if (!result.ok) params.log.warn?.(`exec approvals: iOS request push failed node=${target.nodeId} status=${result.status} reason=${result.reason ?? "unknown"}`);
		return {
			nodeId: target.nodeId,
			ok: result.ok
		};
	}));
	for (const result of results) if (result.status === "rejected") {
		const message = formatErrorMessage(result.reason);
		params.log.warn?.(`exec approvals: iOS request push threw error: ${message}`);
	}
	return {
		attempted: params.plan.targets.length,
		delivered: results.filter((result) => result.status === "fulfilled" && result.value.ok).length
	};
}
async function sendResolvedPushes(params) {
	await Promise.allSettled(params.plan.targets.map(async (target) => {
		const result = target.registration.transport === "direct" ? await sendApnsExecApprovalResolvedWake({
			registration: target.registration,
			nodeId: target.nodeId,
			approvalId: params.approvalId,
			auth: params.plan.directAuth
		}) : await sendApnsExecApprovalResolvedWake({
			registration: target.registration,
			nodeId: target.nodeId,
			approvalId: params.approvalId,
			relayConfig: params.plan.relayConfig
		});
		await clearStaleApnsRegistrationIfNeeded({
			nodeId: target.nodeId,
			registration: target.registration,
			result
		});
		if (!result.ok) params.log.warn?.(`exec approvals: iOS cleanup push failed node=${target.nodeId} status=${result.status} reason=${result.reason ?? "unknown"}`);
	}));
}
function createExecApprovalIosPushDelivery(params) {
	const approvalDeliveriesById = /* @__PURE__ */ new Map();
	const pendingDeliveryStateById = /* @__PURE__ */ new Map();
	return {
		async handleRequested(request) {
			const deliveryStatePromise = (async () => {
				const plan = await resolveDeliveryPlan({
					requireApprovalScope: true,
					log: params.log
				});
				if (plan.targets.length === 0) {
					approvalDeliveriesById.delete(request.id);
					return null;
				}
				const deliveryState = {
					nodeIds: plan.targets.map((target) => target.nodeId),
					requestPushPromise: sendRequestedPushes({
						request,
						plan,
						log: params.log
					}).catch((err) => {
						const message = formatErrorMessage(err);
						params.log.error?.(`exec approvals: iOS request push failed: ${message}`);
						return {
							attempted: plan.targets.length,
							delivered: 0
						};
					})
				};
				approvalDeliveriesById.set(request.id, deliveryState);
				return deliveryState;
			})();
			pendingDeliveryStateById.set(request.id, deliveryStatePromise);
			const deliveryState = await deliveryStatePromise;
			if (pendingDeliveryStateById.get(request.id) === deliveryStatePromise) pendingDeliveryStateById.delete(request.id);
			if (!deliveryState) return false;
			const { attempted, delivered } = await deliveryState.requestPushPromise;
			if (attempted > 0 && delivered === 0) {
				params.log.warn?.(`exec approvals: iOS request push reached no devices approvalId=${request.id} attempted=${attempted}`);
				if (approvalDeliveriesById.get(request.id)?.requestPushPromise === deliveryState.requestPushPromise) approvalDeliveriesById.delete(request.id);
				return false;
			}
			return true;
		},
		async handleResolved(resolved) {
			const deliveryState = approvalDeliveriesById.get(resolved.id) ?? await pendingDeliveryStateById.get(resolved.id);
			approvalDeliveriesById.delete(resolved.id);
			pendingDeliveryStateById.delete(resolved.id);
			if (!deliveryState?.nodeIds.length) {
				params.log.debug?.(`exec approvals: iOS cleanup push skipped approvalId=${resolved.id} reason=missing-targets`);
				return;
			}
			await deliveryState.requestPushPromise;
			const plan = await resolveDeliveryPlan({
				requireApprovalScope: false,
				explicitNodeIds: deliveryState.nodeIds,
				log: params.log
			});
			if (plan.targets.length === 0) return;
			await sendResolvedPushes({
				approvalId: resolved.id,
				plan,
				log: params.log
			});
		},
		async handleExpired(request) {
			const deliveryState = approvalDeliveriesById.get(request.id) ?? await pendingDeliveryStateById.get(request.id);
			approvalDeliveriesById.delete(request.id);
			pendingDeliveryStateById.delete(request.id);
			if (!deliveryState?.nodeIds.length) {
				params.log.debug?.(`exec approvals: iOS cleanup push skipped approvalId=${request.id} reason=missing-targets`);
				return;
			}
			await deliveryState.requestPushPromise;
			const plan = await resolveDeliveryPlan({
				requireApprovalScope: false,
				explicitNodeIds: deliveryState.nodeIds,
				log: params.log
			});
			if (plan.targets.length === 0) return;
			await sendResolvedPushes({
				approvalId: request.id,
				plan,
				log: params.log
			});
		}
	};
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
			this.expire(record.id);
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
	expire(recordId, resolvedBy) {
		const pending = this.pending.get(recordId);
		if (!pending) return false;
		if (pending.record.resolvedAtMs !== void 0) return false;
		clearTimeout(pending.timer);
		pending.record.resolvedAtMs = Date.now();
		pending.record.decision = void 0;
		pending.record.resolvedBy = resolvedBy ?? null;
		pending.resolve(null);
		setTimeout(() => {
			if (this.pending.get(recordId) === pending) this.pending.delete(recordId);
		}, RESOLVED_ENTRY_GRACE_MS);
		return true;
	}
	getSnapshot(recordId) {
		return this.pending.get(recordId)?.record ?? null;
	}
	listPendingRecords() {
		return Array.from(this.pending.values()).map((entry) => entry.record).filter((record) => record.resolvedAtMs === void 0);
	}
	consumeAllowOnce(recordId) {
		const entry = this.pending.get(recordId);
		if (!entry) return false;
		const record = entry.record;
		if (record.decision !== "allow-once") return false;
		record.decision = void 0;
		return true;
	}
	/**
	* Wait for decision on an already-registered approval.
	* Returns the decision promise if the ID is pending, null otherwise.
	*/
	awaitDecision(recordId) {
		return this.pending.get(recordId)?.promise ?? null;
	}
	lookupPendingId(input) {
		const normalized = input.trim();
		if (!normalized) return { kind: "none" };
		const exact = this.pending.get(normalized);
		if (exact) return exact.record.resolvedAtMs === void 0 ? {
			kind: "exact",
			id: normalized
		} : { kind: "none" };
		const lowerPrefix = normalizeLowercaseStringOrEmpty(normalized);
		const matches = [];
		for (const [id, entry] of this.pending.entries()) {
			if (entry.record.resolvedAtMs !== void 0) continue;
			if (normalizeLowercaseStringOrEmpty(id).startsWith(lowerPrefix)) matches.push(id);
		}
		if (matches.length === 1) return {
			kind: "prefix",
			id: matches[0]
		};
		if (matches.length > 1) return {
			kind: "ambiguous",
			ids: matches
		};
		return { kind: "none" };
	}
};
//#endregion
//#region src/infra/approval-turn-source.ts
function hasApprovalTurnSourceRoute(params) {
	if (!params.turnSourceChannel?.trim()) return false;
	return resolveExecApprovalInitiatingSurfaceState({
		channel: params.turnSourceChannel,
		accountId: params.turnSourceAccountId,
		cfg: getRuntimeConfig()
	}).kind === "enabled";
}
//#endregion
//#region src/gateway/server-methods/approval-shared.ts
const APPROVAL_NOT_FOUND_DETAILS = { reason: ErrorCodes.APPROVAL_NOT_FOUND };
function isPromiseLike(value) {
	return typeof value === "object" && value !== null && "then" in value;
}
function isApprovalDecision(value) {
	return value === "allow-once" || value === "allow-always" || value === "deny";
}
function respondUnknownOrExpiredApproval(respond) {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown or expired approval id", { details: APPROVAL_NOT_FOUND_DETAILS }));
}
function resolvePendingApprovalLookupError(params) {
	if (params.resolvedId.kind === "none") return "missing";
	if (params.resolvedId.kind === "ambiguous" && !params.exposeAmbiguousPrefixError) return "missing";
	return {
		code: ErrorCodes.INVALID_REQUEST,
		message: "ambiguous approval id prefix; use the full id"
	};
}
function resolvePendingApprovalRecord(params) {
	const resolvedId = params.manager.lookupPendingId(params.inputId);
	if (resolvedId.kind !== "exact" && resolvedId.kind !== "prefix") return {
		ok: false,
		response: resolvePendingApprovalLookupError({
			resolvedId,
			exposeAmbiguousPrefixError: params.exposeAmbiguousPrefixError
		})
	};
	const snapshot = params.manager.getSnapshot(resolvedId.id);
	if (!snapshot || snapshot.resolvedAtMs !== void 0) return {
		ok: false,
		response: "missing"
	};
	return {
		ok: true,
		approvalId: resolvedId.id,
		snapshot
	};
}
function respondPendingApprovalLookupError(params) {
	if (params.response === "missing") {
		respondUnknownOrExpiredApproval(params.respond);
		return;
	}
	params.respond(false, void 0, errorShape(params.response.code, params.response.message));
}
async function handleApprovalWaitDecision(params) {
	const id = normalizeOptionalString(params.inputId) ?? "";
	if (!id) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "id is required"));
		return;
	}
	const decisionPromise = params.manager.awaitDecision(id);
	if (!decisionPromise) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "approval expired or not found"));
		return;
	}
	const snapshot = params.manager.getSnapshot(id);
	const decision = await decisionPromise;
	params.respond(true, {
		id,
		decision,
		createdAtMs: snapshot?.createdAtMs,
		expiresAtMs: snapshot?.expiresAtMs
	}, void 0);
}
async function handlePendingApprovalRequest(params) {
	params.context.broadcast(params.requestEventName, params.requestEvent, { dropIfSlow: true });
	const hasApprovalClients = params.context.hasExecApprovalClients?.(params.clientConnId) ?? false;
	const hasTurnSourceRoute = hasApprovalTurnSourceRoute({
		turnSourceChannel: params.record.request.turnSourceChannel,
		turnSourceAccountId: params.record.request.turnSourceAccountId
	});
	const deliveredResult = params.deliverRequest();
	const delivered = isPromiseLike(deliveredResult) ? await deliveredResult : deliveredResult;
	if (!hasApprovalClients && !hasTurnSourceRoute && !delivered) {
		params.manager.expire(params.record.id, "no-approval-route");
		params.respond(true, {
			id: params.record.id,
			decision: null,
			createdAtMs: params.record.createdAtMs,
			expiresAtMs: params.record.expiresAtMs
		}, void 0);
		return;
	}
	if (params.twoPhase) params.respond(true, {
		status: "accepted",
		id: params.record.id,
		createdAtMs: params.record.createdAtMs,
		expiresAtMs: params.record.expiresAtMs
	}, void 0);
	const decision = await params.decisionPromise;
	if (params.afterDecision) try {
		await params.afterDecision(decision, params.requestEvent);
	} catch (err) {
		params.context.logGateway?.error?.(`${params.afterDecisionErrorLabel ?? "approval follow-up failed"}: ${String(err)}`);
	}
	params.respond(true, {
		id: params.record.id,
		decision,
		createdAtMs: params.record.createdAtMs,
		expiresAtMs: params.record.expiresAtMs
	}, void 0);
}
async function handleApprovalResolve(params) {
	const resolved = resolvePendingApprovalRecord({
		manager: params.manager,
		inputId: params.inputId,
		exposeAmbiguousPrefixError: params.exposeAmbiguousPrefixError
	});
	if (!resolved.ok) {
		respondPendingApprovalLookupError({
			respond: params.respond,
			response: resolved.response
		});
		return;
	}
	const validationError = params.validateDecision?.(resolved.snapshot);
	if (validationError) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, validationError.message, validationError.details ? { details: validationError.details } : void 0));
		return;
	}
	const resolvedBy = params.client?.connect?.client?.displayName ?? params.client?.connect?.client?.id ?? null;
	if (!params.manager.resolve(resolved.approvalId, params.decision, resolvedBy)) {
		respondUnknownOrExpiredApproval(params.respond);
		return;
	}
	const resolvedEvent = params.buildResolvedEvent({
		approvalId: resolved.approvalId,
		decision: params.decision,
		resolvedBy,
		snapshot: resolved.snapshot,
		nowMs: Date.now()
	});
	params.context.broadcast(params.resolvedEventName, resolvedEvent, { dropIfSlow: true });
	const followUps = [params.forwardResolved ? {
		run: params.forwardResolved,
		errorLabel: params.forwardResolvedErrorLabel ?? "approval resolve follow-up failed"
	} : null, ...params.extraResolvedHandlers ?? []].filter((entry) => Boolean(entry));
	for (const followUp of followUps) try {
		await followUp.run(resolvedEvent);
	} catch (err) {
		params.context.logGateway?.error?.(`${followUp.errorLabel}: ${String(err)}`);
	}
	params.respond(true, { ok: true }, void 0);
}
//#endregion
//#region src/gateway/server-methods/exec-approval.ts
const APPROVAL_ALLOW_ALWAYS_UNAVAILABLE_DETAILS = { reason: "APPROVAL_ALLOW_ALWAYS_UNAVAILABLE" };
const RESERVED_PLUGIN_APPROVAL_ID_PREFIX = "plugin:";
function createExecApprovalHandlers(manager, opts) {
	return {
		"exec.approval.get": async ({ params, respond }) => {
			if (!validateExecApprovalGetParams(params)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approval.get params: ${formatValidationErrors(validateExecApprovalGetParams.errors)}`));
				return;
			}
			const resolved = resolvePendingApprovalRecord({
				manager,
				inputId: params.id,
				exposeAmbiguousPrefixError: true
			});
			if (!resolved.ok) {
				respondPendingApprovalLookupError({
					respond,
					response: resolved.response
				});
				return;
			}
			const { commandText, commandPreview } = resolveExecApprovalCommandDisplay(resolved.snapshot.request);
			respond(true, {
				id: resolved.approvalId,
				commandText,
				commandPreview,
				allowedDecisions: resolveExecApprovalRequestAllowedDecisions(resolved.snapshot.request),
				host: resolved.snapshot.request.host ?? null,
				nodeId: resolved.snapshot.request.nodeId ?? null,
				agentId: resolved.snapshot.request.agentId ?? null,
				expiresAtMs: resolved.snapshot.expiresAtMs
			}, void 0);
		},
		"exec.approval.list": async ({ respond }) => {
			respond(true, manager.listPendingRecords().map((record) => ({
				id: record.id,
				request: record.request,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			})), void 0);
		},
		"exec.approval.request": async ({ params, respond, context, client }) => {
			if (!validateExecApprovalRequestParams(params)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approval.request params: ${formatValidationErrors(validateExecApprovalRequestParams.errors)}`));
				return;
			}
			const p = params;
			const twoPhase = p.twoPhase === true;
			const timeoutMs = typeof p.timeoutMs === "number" ? p.timeoutMs : DEFAULT_EXEC_APPROVAL_TIMEOUT_MS;
			const explicitId = normalizeOptionalString(p.id) ?? null;
			const host = normalizeOptionalString(p.host) ?? "";
			const nodeId = normalizeOptionalString(p.nodeId) ?? "";
			const approvalContext = resolveSystemRunApprovalRequestContext({
				host,
				command: p.command,
				commandArgv: p.commandArgv,
				systemRunPlan: p.systemRunPlan,
				cwd: p.cwd,
				agentId: p.agentId,
				sessionKey: p.sessionKey
			});
			const effectiveCommandArgv = approvalContext.commandArgv;
			const effectiveCwd = approvalContext.cwd;
			const effectiveAgentId = approvalContext.agentId;
			const effectiveSessionKey = approvalContext.sessionKey;
			const effectiveCommandText = approvalContext.commandText;
			if (host === "node" && !nodeId) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId is required for host=node"));
				return;
			}
			if (host === "node" && !approvalContext.plan) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "systemRunPlan is required for host=node"));
				return;
			}
			if (!effectiveCommandText) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "command is required"));
				return;
			}
			if (explicitId?.startsWith(RESERVED_PLUGIN_APPROVAL_ID_PREFIX)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `approval ids starting with ${RESERVED_PLUGIN_APPROVAL_ID_PREFIX} are reserved`));
				return;
			}
			if (host === "node" && (!Array.isArray(effectiveCommandArgv) || effectiveCommandArgv.length === 0)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "commandArgv is required for host=node"));
				return;
			}
			const envBinding = buildSystemRunApprovalEnvBinding(p.env);
			const systemRunBinding = host === "node" ? buildSystemRunApprovalBinding({
				argv: effectiveCommandArgv,
				cwd: effectiveCwd,
				agentId: effectiveAgentId,
				sessionKey: effectiveSessionKey,
				env: p.env
			}) : null;
			if (explicitId && manager.getSnapshot(explicitId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "approval id already pending"));
				return;
			}
			const request = {
				command: sanitizeExecApprovalDisplayText(effectiveCommandText),
				commandPreview: host === "node" || !approvalContext.commandPreview ? void 0 : sanitizeExecApprovalDisplayText(approvalContext.commandPreview),
				commandArgv: host === "node" ? void 0 : effectiveCommandArgv,
				envKeys: envBinding.envKeys.length > 0 ? envBinding.envKeys : void 0,
				systemRunBinding: systemRunBinding?.binding ?? null,
				systemRunPlan: approvalContext.plan,
				cwd: effectiveCwd ?? null,
				nodeId: host === "node" ? nodeId : null,
				host: host || null,
				security: p.security ?? null,
				ask: p.ask ?? null,
				allowedDecisions: resolveExecApprovalAllowedDecisions({ ask: p.ask ?? null }),
				agentId: effectiveAgentId ?? null,
				resolvedPath: p.resolvedPath ?? null,
				sessionKey: effectiveSessionKey ?? null,
				turnSourceChannel: normalizeOptionalString(p.turnSourceChannel) ?? null,
				turnSourceTo: normalizeOptionalString(p.turnSourceTo) ?? null,
				turnSourceAccountId: normalizeOptionalString(p.turnSourceAccountId) ?? null,
				turnSourceThreadId: p.turnSourceThreadId ?? null
			};
			const record = manager.create(request, timeoutMs, explicitId);
			record.requestedByConnId = client?.connId ?? null;
			record.requestedByDeviceId = client?.connect?.device?.id ?? null;
			record.requestedByClientId = client?.connect?.client?.id ?? null;
			let decisionPromise;
			try {
				decisionPromise = manager.register(record, timeoutMs);
			} catch (err) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `registration failed: ${String(err)}`));
				return;
			}
			const requestEvent = {
				id: record.id,
				request: record.request,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			};
			await handlePendingApprovalRequest({
				manager,
				record,
				decisionPromise,
				respond,
				context,
				clientConnId: client?.connId,
				requestEventName: "exec.approval.requested",
				requestEvent,
				twoPhase,
				deliverRequest: () => {
					const deliveryTasks = [];
					if (opts?.forwarder) deliveryTasks.push(opts.forwarder.handleRequested(requestEvent).catch((err) => {
						context.logGateway?.error?.(`exec approvals: forward request failed: ${String(err)}`);
						return false;
					}));
					if (opts?.iosPushDelivery?.handleRequested) deliveryTasks.push(opts.iosPushDelivery.handleRequested(requestEvent).catch((err) => {
						context.logGateway?.error?.(`exec approvals: iOS push request failed: ${String(err)}`);
						return false;
					}));
					if (deliveryTasks.length === 0) return false;
					return (async () => {
						let delivered = false;
						for (const task of deliveryTasks) delivered = await task || delivered;
						return delivered;
					})();
				},
				afterDecision: async (decision) => {
					if (decision === null) await opts?.iosPushDelivery?.handleExpired?.(requestEvent);
				},
				afterDecisionErrorLabel: "exec approvals: iOS push expire failed"
			});
		},
		"exec.approval.waitDecision": async ({ params, respond }) => {
			await handleApprovalWaitDecision({
				manager,
				inputId: params.id,
				respond
			});
		},
		"exec.approval.resolve": async ({ params, respond, client, context }) => {
			if (!validateExecApprovalResolveParams(params)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid exec.approval.resolve params: ${formatValidationErrors(validateExecApprovalResolveParams.errors)}`));
				return;
			}
			const p = params;
			if (!isApprovalDecision(p.decision)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid decision"));
				return;
			}
			const decision = p.decision;
			await handleApprovalResolve({
				manager,
				inputId: p.id,
				decision,
				respond,
				context,
				client,
				exposeAmbiguousPrefixError: true,
				validateDecision: (snapshot) => {
					return resolveExecApprovalRequestAllowedDecisions(snapshot.request).includes(decision) ? null : {
						message: "allow-always is unavailable because the effective policy requires approval every time",
						details: APPROVAL_ALLOW_ALWAYS_UNAVAILABLE_DETAILS
					};
				},
				resolvedEventName: "exec.approval.resolved",
				buildResolvedEvent: ({ approvalId, decision, resolvedBy, snapshot, nowMs }) => ({
					id: approvalId,
					decision,
					resolvedBy,
					ts: nowMs,
					request: snapshot.request
				}),
				forwardResolved: (resolvedEvent) => opts?.forwarder?.handleResolved(resolvedEvent),
				forwardResolvedErrorLabel: "exec approvals: forward resolve failed",
				extraResolvedHandlers: opts?.iosPushDelivery?.handleResolved ? [{
					run: (resolvedEvent) => opts.iosPushDelivery.handleResolved(resolvedEvent),
					errorLabel: "exec approvals: iOS push resolve failed"
				}] : void 0
			});
		}
	};
}
//#endregion
//#region src/gateway/server-methods/plugin-approval.ts
function createPluginApprovalHandlers(manager, opts) {
	return {
		"plugin.approval.list": async ({ respond }) => {
			respond(true, manager.listPendingRecords().map((record) => ({
				id: record.id,
				request: record.request,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			})), void 0);
		},
		"plugin.approval.request": async ({ params, client, respond, context }) => {
			if (!validatePluginApprovalRequestParams(params)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid plugin.approval.request params: ${formatValidationErrors(validatePluginApprovalRequestParams.errors)}`));
				return;
			}
			const p = params;
			const twoPhase = p.twoPhase === true;
			const timeoutMs = Math.min(typeof p.timeoutMs === "number" ? p.timeoutMs : DEFAULT_PLUGIN_APPROVAL_TIMEOUT_MS, MAX_PLUGIN_APPROVAL_TIMEOUT_MS);
			const normalizeTrimmedString = (value) => normalizeOptionalString(value) || null;
			const request = {
				pluginId: p.pluginId ?? null,
				title: p.title,
				description: p.description,
				severity: p.severity ?? null,
				toolName: p.toolName ?? null,
				toolCallId: p.toolCallId ?? null,
				agentId: p.agentId ?? null,
				sessionKey: p.sessionKey ?? null,
				turnSourceChannel: normalizeTrimmedString(p.turnSourceChannel),
				turnSourceTo: normalizeTrimmedString(p.turnSourceTo),
				turnSourceAccountId: normalizeTrimmedString(p.turnSourceAccountId),
				turnSourceThreadId: p.turnSourceThreadId ?? null
			};
			const record = manager.create(request, timeoutMs, `plugin:${randomUUID()}`);
			let decisionPromise;
			try {
				decisionPromise = manager.register(record, timeoutMs);
			} catch (err) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `registration failed: ${String(err)}`));
				return;
			}
			const requestEvent = {
				id: record.id,
				request: record.request,
				createdAtMs: record.createdAtMs,
				expiresAtMs: record.expiresAtMs
			};
			await handlePendingApprovalRequest({
				manager,
				record,
				decisionPromise,
				respond,
				context,
				clientConnId: client?.connId,
				requestEventName: "plugin.approval.requested",
				requestEvent,
				twoPhase,
				deliverRequest: () => {
					if (!opts?.forwarder?.handlePluginApprovalRequested) return false;
					return opts.forwarder.handlePluginApprovalRequested(requestEvent).catch((err) => {
						context.logGateway?.error?.(`plugin approvals: forward request failed: ${String(err)}`);
						return false;
					});
				}
			});
		},
		"plugin.approval.waitDecision": async ({ params, respond }) => {
			await handleApprovalWaitDecision({
				manager,
				inputId: params.id,
				respond
			});
		},
		"plugin.approval.resolve": async ({ params, respond, client, context }) => {
			if (!validatePluginApprovalResolveParams(params)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid plugin.approval.resolve params: ${formatValidationErrors(validatePluginApprovalResolveParams.errors)}`));
				return;
			}
			const p = params;
			if (!isApprovalDecision(p.decision)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid decision"));
				return;
			}
			await handleApprovalResolve({
				manager,
				inputId: p.id,
				decision: p.decision,
				respond,
				context,
				client,
				exposeAmbiguousPrefixError: false,
				resolvedEventName: "plugin.approval.resolved",
				buildResolvedEvent: ({ approvalId, decision, resolvedBy, snapshot, nowMs }) => ({
					id: approvalId,
					decision,
					resolvedBy,
					ts: nowMs,
					request: snapshot.request
				}),
				forwardResolved: (resolvedEvent) => opts?.forwarder?.handlePluginApprovalResolved?.(resolvedEvent),
				forwardResolvedErrorLabel: "plugin approvals: forward resolve failed"
			});
		}
	};
}
//#endregion
//#region src/gateway/server-methods/secrets.ts
function invalidSecretsResolveField(errors) {
	for (const issue of errors ?? []) if (issue.instancePath === "/commandName" || issue.instancePath === "" && String(issue.params?.missingProperty) === "commandName") return "commandName";
	return "targetIds";
}
function createSecretsHandlers(params) {
	return {
		"secrets.reload": async ({ respond }) => {
			try {
				respond(true, {
					ok: true,
					warningCount: (await params.reloadSecrets()).warningCount
				});
			} catch {
				params.log?.warn?.("secrets.reload failed");
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "secrets.reload failed"));
			}
		},
		"secrets.resolve": async ({ params: requestParams, respond }) => {
			if (!validateSecretsResolveParams(requestParams)) {
				const field = invalidSecretsResolveField(validateSecretsResolveParams.errors);
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid secrets.resolve params: ${field}`));
				return;
			}
			const commandName = requestParams.commandName.trim();
			if (!commandName) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid secrets.resolve params: commandName"));
				return;
			}
			const targetIds = requestParams.targetIds.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
			for (const targetId of targetIds) if (!isKnownSecretTargetId(targetId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid secrets.resolve params: unknown target id "${String(targetId)}"`));
				return;
			}
			try {
				const result = await params.resolveSecrets({
					commandName,
					targetIds
				});
				const payload = {
					ok: true,
					assignments: result.assignments,
					diagnostics: result.diagnostics,
					inactiveRefPaths: result.inactiveRefPaths
				};
				if (!validateSecretsResolveResult(payload)) throw new Error("secrets.resolve returned invalid payload.");
				respond(true, payload);
			} catch {
				params.log?.warn?.("secrets.resolve failed");
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "secrets.resolve failed"));
			}
		}
	};
}
//#endregion
//#region src/gateway/server-shared-auth-generation.ts
function disconnectStaleSharedGatewayAuthClients(params) {
	for (const gatewayClient of params.clients) {
		if (!gatewayClient.usesSharedGatewayAuth) continue;
		if (gatewayClient.sharedGatewaySessionGeneration === params.expectedGeneration) continue;
		try {
			gatewayClient.socket.close(4001, "gateway auth changed");
		} catch {}
	}
}
function disconnectAllSharedGatewayAuthClients(clients) {
	for (const gatewayClient of clients) {
		if (!gatewayClient.usesSharedGatewayAuth) continue;
		try {
			gatewayClient.socket.close(4001, "gateway auth changed");
		} catch {}
	}
}
function getRequiredSharedGatewaySessionGeneration(state) {
	return state.required === null ? state.current : state.required;
}
function setCurrentSharedGatewaySessionGeneration(state, nextGeneration) {
	const previousGeneration = state.current;
	state.current = nextGeneration;
	if (state.required === nextGeneration) {
		state.required = null;
		return;
	}
	if (state.required !== null && previousGeneration !== nextGeneration) state.required = null;
}
function enforceSharedGatewaySessionGenerationForConfigWrite(params) {
	const reloadMode = resolveGatewayReloadSettings(params.nextConfig).mode;
	const nextSharedGatewaySessionGeneration = params.resolveRuntimeSnapshotGeneration();
	if (reloadMode === "off") {
		params.state.current = nextSharedGatewaySessionGeneration;
		params.state.required = nextSharedGatewaySessionGeneration;
		disconnectStaleSharedGatewayAuthClients({
			clients: params.clients,
			expectedGeneration: nextSharedGatewaySessionGeneration
		});
		return;
	}
	params.state.required = null;
	setCurrentSharedGatewaySessionGeneration(params.state, nextSharedGatewaySessionGeneration);
	disconnectStaleSharedGatewayAuthClients({
		clients: params.clients,
		expectedGeneration: nextSharedGatewaySessionGeneration
	});
}
//#endregion
//#region src/gateway/server-aux-handlers.ts
function createGatewayAuxHandlers(params) {
	const execApprovalManager = new ExecApprovalManager();
	const execApprovalForwarder = createExecApprovalForwarder();
	const execApprovalHandlers = createExecApprovalHandlers(execApprovalManager, {
		forwarder: execApprovalForwarder,
		iosPushDelivery: createExecApprovalIosPushDelivery({ log: params.log })
	});
	const buildReloadPlan = params.buildReloadPlan ?? buildGatewayReloadPlan;
	const pluginApprovalManager = new ExecApprovalManager();
	const pluginApprovalHandlers = createPluginApprovalHandlers(pluginApprovalManager, { forwarder: execApprovalForwarder });
	let reloadInFlight = null;
	const runExclusiveReload = (fn) => {
		if (reloadInFlight) return reloadInFlight;
		const run = (async () => {
			try {
				return await fn();
			} finally {
				reloadInFlight = null;
			}
		})();
		reloadInFlight = run;
		return run;
	};
	const secretsHandlers = createSecretsHandlers({
		reloadSecrets: () => runExclusiveReload(async () => {
			const previousSnapshot = getActiveSecretsRuntimeSnapshot();
			if (!previousSnapshot) throw new Error("Secrets runtime snapshot is not active.");
			const previousSharedGatewaySessionGeneration = params.sharedGatewaySessionGenerationState.current;
			const previousSharedGatewaySessionGenerationRequired = params.sharedGatewaySessionGenerationState.required;
			let nextSharedGatewaySessionGeneration = previousSharedGatewaySessionGeneration;
			let sharedGatewaySessionGenerationChanged = false;
			const stoppedChannels = [];
			const restartedChannels = /* @__PURE__ */ new Set();
			try {
				const prepared = await params.activateRuntimeSecrets(previousSnapshot.sourceConfig, {
					reason: "reload",
					activate: true
				});
				nextSharedGatewaySessionGeneration = params.resolveSharedGatewaySessionGenerationForConfig(prepared.config);
				const plan = buildReloadPlan(diffConfigPaths(previousSnapshot.config, prepared.config));
				setCurrentSharedGatewaySessionGeneration(params.sharedGatewaySessionGenerationState, nextSharedGatewaySessionGeneration);
				sharedGatewaySessionGenerationChanged = previousSharedGatewaySessionGeneration !== nextSharedGatewaySessionGeneration;
				if (sharedGatewaySessionGenerationChanged) disconnectStaleSharedGatewayAuthClients({
					clients: params.clients,
					expectedGeneration: nextSharedGatewaySessionGeneration
				});
				if (plan.restartChannels.size > 0) {
					const restartChannels = [...plan.restartChannels];
					if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS)) throw new Error(`secrets.reload requires restarting channels: ${restartChannels.join(", ")}`);
					const restartFailures = [];
					for (const channel of restartChannels) {
						params.logChannels.info(`restarting ${channel} channel after secrets reload`);
						stoppedChannels.push(channel);
						try {
							await params.stopChannel(channel);
							await params.startChannel(channel);
							restartedChannels.add(channel);
						} catch {
							params.logChannels.info(`failed to restart ${channel} channel after secrets reload`);
							restartFailures.push(channel);
						}
					}
					if (restartFailures.length > 0) throw new Error(`failed to restart channels after secrets reload: ${restartFailures.join(", ")}`);
				}
				return { warningCount: prepared.warnings.length };
			} catch (err) {
				activateSecretsRuntimeSnapshot(previousSnapshot);
				params.sharedGatewaySessionGenerationState.current = previousSharedGatewaySessionGeneration;
				params.sharedGatewaySessionGenerationState.required = previousSharedGatewaySessionGenerationRequired;
				if (sharedGatewaySessionGenerationChanged) disconnectStaleSharedGatewayAuthClients({
					clients: params.clients,
					expectedGeneration: previousSharedGatewaySessionGeneration
				});
				for (const channel of stoppedChannels) {
					params.logChannels.info(`rolling back ${channel} channel after secrets reload failure`);
					try {
						if (restartedChannels.has(channel)) await params.stopChannel(channel);
						await params.startChannel(channel);
					} catch {
						params.logChannels.info(`failed to roll back ${channel} channel after secrets reload`);
					}
				}
				throw err;
			}
		}),
		log: params.log,
		resolveSecrets: async ({ commandName, targetIds }) => {
			const { assignments, diagnostics, inactiveRefPaths } = resolveCommandSecretsFromActiveRuntimeSnapshot({
				commandName,
				targetIds: new Set(targetIds)
			});
			if (assignments.length === 0) return {
				assignments: [],
				diagnostics,
				inactiveRefPaths
			};
			return {
				assignments,
				diagnostics,
				inactiveRefPaths
			};
		}
	});
	return {
		execApprovalManager,
		pluginApprovalManager,
		extraHandlers: {
			...execApprovalHandlers,
			...pluginApprovalHandlers,
			...secretsHandlers
		}
	};
}
//#endregion
//#region src/infra/approval-handler-bootstrap.ts
const APPROVAL_HANDLER_BOOTSTRAP_RETRY_MS = 1e3;
async function startChannelApprovalHandlerBootstrap(params) {
	const capability = resolveChannelApprovalCapability(params.plugin);
	if (!capability?.nativeRuntime || !params.channelRuntime) return async () => {};
	const channelLabel = params.plugin.meta.label || params.plugin.id;
	const logger = params.logger ?? createSubsystemLogger(`${params.plugin.id}/approval-bootstrap`);
	let activeGeneration = 0;
	let activeHandler = null;
	let retryTimer = null;
	const invalidateActiveHandler = () => {
		activeGeneration += 1;
	};
	const clearRetryTimer = () => {
		if (!retryTimer) return;
		clearTimeout(retryTimer);
		retryTimer = null;
	};
	const stopHandler = async () => {
		const handler = activeHandler;
		activeHandler = null;
		if (!handler) return;
		await handler.stop();
	};
	const startHandlerForContext = async (context, generation) => {
		if (generation !== activeGeneration) return;
		await stopHandler();
		if (generation !== activeGeneration) return;
		const handler = await createChannelApprovalHandlerFromCapability({
			capability,
			label: `${params.plugin.id}/native-approvals`,
			clientDisplayName: `${channelLabel} Native Approvals (${params.accountId})`,
			channel: params.plugin.id,
			channelLabel,
			cfg: params.cfg,
			accountId: params.accountId,
			context
		});
		if (!handler) return;
		if (generation !== activeGeneration) {
			await handler.stop().catch(() => {});
			return;
		}
		activeHandler = handler;
		try {
			await handler.start();
		} catch (error) {
			if (activeHandler === handler) activeHandler = null;
			await handler.stop().catch(() => {});
			throw error;
		}
	};
	const spawn = (label, promise) => {
		promise.catch((error) => {
			logger.error(`${label}: ${String(error)}`);
		});
	};
	const scheduleRetryForContext = (context, generation) => {
		if (generation !== activeGeneration) return;
		clearRetryTimer();
		retryTimer = setTimeout(() => {
			retryTimer = null;
			if (generation !== activeGeneration) return;
			spawn("failed to retry native approval handler", startHandlerForRegisteredContext(context, generation));
		}, APPROVAL_HANDLER_BOOTSTRAP_RETRY_MS);
		retryTimer.unref?.();
	};
	const startHandlerForRegisteredContext = async (context, generation) => {
		try {
			await startHandlerForContext(context, generation);
		} catch (error) {
			if (generation === activeGeneration) {
				logger.error(`failed to start native approval handler: ${String(error)}`);
				scheduleRetryForContext(context, generation);
			}
		}
	};
	const unsubscribe = watchChannelRuntimeContexts({
		channelRuntime: params.channelRuntime,
		channelId: params.plugin.id,
		accountId: params.accountId,
		capability: "approval.native",
		onEvent: (event) => {
			if (event.type === "registered") {
				clearRetryTimer();
				invalidateActiveHandler();
				const generation = activeGeneration;
				spawn("failed to start native approval handler", startHandlerForRegisteredContext(event.context, generation));
				return;
			}
			clearRetryTimer();
			invalidateActiveHandler();
			spawn("failed to stop native approval handler", stopHandler());
		}
	}) ?? (() => {});
	const existingContext = getChannelRuntimeContext({
		channelRuntime: params.channelRuntime,
		channelId: params.plugin.id,
		accountId: params.accountId,
		capability: CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY
	});
	if (existingContext !== void 0) {
		clearRetryTimer();
		invalidateActiveHandler();
		await startHandlerForContext(existingContext, activeGeneration);
	}
	return async () => {
		unsubscribe();
		clearRetryTimer();
		invalidateActiveHandler();
		await stopHandler();
	};
}
//#endregion
//#region src/gateway/server-channels.ts
const CHANNEL_RESTART_POLICY = {
	initialMs: 5e3,
	maxMs: 5 * 6e4,
	factor: 2,
	jitter: .1
};
const MAX_RESTART_ATTEMPTS = 10;
const CHANNEL_STOP_ABORT_TIMEOUT_MS = 5e3;
function createRuntimeStore() {
	return {
		aborts: /* @__PURE__ */ new Map(),
		starting: /* @__PURE__ */ new Map(),
		tasks: /* @__PURE__ */ new Map(),
		runtimes: /* @__PURE__ */ new Map()
	};
}
function isAccountEnabled(account) {
	if (!account || typeof account !== "object") return true;
	return account.enabled !== false;
}
function resolveDefaultRuntime(channelId) {
	return getChannelPlugin(channelId)?.status?.defaultRuntime ?? { accountId: "default" };
}
function cloneDefaultRuntime(channelId, accountId) {
	return {
		...resolveDefaultRuntime(channelId),
		accountId
	};
}
async function waitForChannelStopGracefully(task, timeoutMs) {
	if (!task) return true;
	return await new Promise((resolve) => {
		let settled = false;
		const timer = setTimeout(() => {
			if (!settled) {
				settled = true;
				resolve(false);
			}
		}, timeoutMs);
		timer.unref?.();
		const resolveSettled = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve(true);
		};
		task.then(resolveSettled, resolveSettled);
	});
}
function applyDescribedAccountFields(next, described) {
	if (!described) {
		next.configured ??= true;
		return next;
	}
	if (typeof described.configured === "boolean") next.configured = described.configured;
	else next.configured ??= true;
	if (described.mode !== void 0) next.mode = described.mode;
	return next;
}
function createChannelManager(opts) {
	const { getRuntimeConfig, channelLogs, channelRuntimeEnvs, channelRuntime, resolveChannelRuntime } = opts;
	const channelStores = /* @__PURE__ */ new Map();
	const restartAttempts = /* @__PURE__ */ new Map();
	const manuallyStopped = /* @__PURE__ */ new Set();
	const restartKey = (channelId, accountId) => `${channelId}:${accountId}`;
	const resolveAccountHealthMonitorOverride = (channelConfig, accountId) => {
		if (!channelConfig?.accounts) return;
		const direct = resolveAccountEntry(channelConfig.accounts, accountId);
		if (typeof direct?.healthMonitor?.enabled === "boolean") return direct.healthMonitor.enabled;
		const normalizedAccountId = normalizeOptionalAccountId(accountId);
		if (!normalizedAccountId) return;
		const match = resolveNormalizedAccountEntry(channelConfig.accounts, normalizedAccountId, normalizeAccountId);
		if (typeof match?.healthMonitor?.enabled !== "boolean") return;
		return match.healthMonitor.enabled;
	};
	const isHealthMonitorEnabled = (channelId, accountId) => {
		const cfg = getRuntimeConfig();
		const channelConfig = cfg.channels?.[channelId];
		const accountOverride = resolveAccountHealthMonitorOverride(channelConfig, accountId);
		const channelOverride = channelConfig?.healthMonitor?.enabled;
		if (typeof accountOverride === "boolean") return accountOverride;
		if (typeof channelOverride === "boolean") return channelOverride;
		const plugin = getChannelPlugin(channelId);
		if (!plugin) return true;
		try {
			plugin.config.resolveAccount(cfg, accountId);
		} catch (err) {
			channelLogs[channelId].warn?.(`[${channelId}:${accountId}] health-monitor: failed to resolve account; skipping monitor (${formatErrorMessage(err)})`);
			return false;
		}
		return true;
	};
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
	const getChannelRuntime = async () => {
		return channelRuntime ?? await resolveChannelRuntime?.();
	};
	const evictStaleChannelAccountState = (channelId, store, accountIds) => {
		const activeAccountIds = new Set(accountIds);
		for (const id of store.runtimes.keys()) {
			if (activeAccountIds.has(id) || store.aborts.has(id) || store.starting.has(id) || store.tasks.has(id)) continue;
			store.runtimes.delete(id);
			restartAttempts.delete(restartKey(channelId, id));
			manuallyStopped.delete(restartKey(channelId, id));
		}
	};
	const startChannelInternal = async (channelId, accountId, opts = {}) => {
		const plugin = getChannelPlugin(channelId);
		const startAccount = plugin?.gateway?.startAccount;
		if (!startAccount) return;
		const { preserveRestartAttempts = false, preserveManualStop = false } = opts;
		const cfg = getRuntimeConfig();
		resetDirectoryCache({
			channel: channelId,
			accountId
		});
		const store = getStore(channelId);
		const accountIds = accountId ? [accountId] : plugin.config.listAccountIds(cfg);
		if (!accountId) evictStaleChannelAccountState(channelId, store, accountIds);
		if (accountIds.length === 0) return;
		await Promise.all(accountIds.map(async (id) => {
			if (store.tasks.has(id)) return;
			const existingStart = store.starting.get(id);
			if (existingStart) {
				await existingStart;
				return;
			}
			let resolveStart;
			const startGate = new Promise((resolve) => {
				resolveStart = resolve;
			});
			store.starting.set(id, startGate);
			const abort = new AbortController();
			store.aborts.set(id, abort);
			let handedOffTask = false;
			const log = channelLogs[channelId];
			let scopedChannelRuntime = null;
			let channelRuntimeForTask;
			let stopApprovalBootstrap = async () => {};
			const stopTaskScopedApprovalRuntime = async () => {
				const scopedRuntime = scopedChannelRuntime;
				scopedChannelRuntime = null;
				const stopBootstrap = stopApprovalBootstrap;
				stopApprovalBootstrap = async () => {};
				scopedRuntime?.dispose();
				await stopBootstrap();
			};
			const cleanupTaskScopedApprovalRuntime = async (label) => {
				try {
					await stopTaskScopedApprovalRuntime();
				} catch (error) {
					log.error?.(`[${id}] ${label}: ${formatErrorMessage(error)}`);
				}
			};
			try {
				const account = plugin.config.resolveAccount(cfg, id);
				if (!(plugin.config.isEnabled ? plugin.config.isEnabled(account, cfg) : isAccountEnabled(account))) {
					setRuntime(channelId, id, {
						accountId: id,
						enabled: false,
						configured: true,
						running: false,
						restartPending: false,
						lastError: plugin.config.disabledReason?.(account, cfg) ?? "disabled"
					});
					return;
				}
				let configured = true;
				if (plugin.config.isConfigured) configured = await plugin.config.isConfigured(account, cfg);
				if (!configured) {
					setRuntime(channelId, id, {
						accountId: id,
						enabled: true,
						configured: false,
						running: false,
						restartPending: false,
						lastError: plugin.config.unconfiguredReason?.(account, cfg) ?? "not configured"
					});
					return;
				}
				const rKey = restartKey(channelId, id);
				if (!preserveManualStop) manuallyStopped.delete(rKey);
				if (abort.signal.aborted || manuallyStopped.has(rKey)) {
					setRuntime(channelId, id, {
						accountId: id,
						running: false,
						restartPending: false,
						lastStopAt: Date.now()
					});
					return;
				}
				scopedChannelRuntime = createTaskScopedChannelRuntime({ channelRuntime: await getChannelRuntime() });
				channelRuntimeForTask = scopedChannelRuntime.channelRuntime;
				if (!preserveRestartAttempts) restartAttempts.delete(rKey);
				stopApprovalBootstrap = await startChannelApprovalHandlerBootstrap({
					plugin,
					cfg,
					accountId: id,
					channelRuntime: channelRuntimeForTask,
					logger: log
				});
				setRuntime(channelId, id, {
					accountId: id,
					enabled: true,
					configured: true,
					running: true,
					restartPending: false,
					lastStartAt: Date.now(),
					lastError: null,
					reconnectAttempts: preserveRestartAttempts ? restartAttempts.get(rKey) ?? 0 : 0
				});
				const trackedPromise = Promise.resolve().then(() => startAccount({
					cfg,
					accountId: id,
					account,
					runtime: channelRuntimeEnvs[channelId],
					abortSignal: abort.signal,
					log,
					getStatus: () => getRuntime(channelId, id),
					setStatus: (next) => setRuntime(channelId, id, next),
					...channelRuntimeForTask ? { channelRuntime: channelRuntimeForTask } : {}
				})).catch((err) => {
					const message = formatErrorMessage(err);
					setRuntime(channelId, id, {
						accountId: id,
						lastError: message
					});
					log.error?.(`[${id}] channel exited: ${message}`);
				}).finally(async () => {
					await cleanupTaskScopedApprovalRuntime("channel cleanup failed");
					setRuntime(channelId, id, {
						accountId: id,
						running: false,
						lastStopAt: Date.now()
					});
				}).then(async () => {
					if (manuallyStopped.has(rKey)) return;
					const attempt = (restartAttempts.get(rKey) ?? 0) + 1;
					restartAttempts.set(rKey, attempt);
					if (attempt > MAX_RESTART_ATTEMPTS) {
						setRuntime(channelId, id, {
							accountId: id,
							restartPending: false,
							reconnectAttempts: attempt
						});
						log.error?.(`[${id}] giving up after ${MAX_RESTART_ATTEMPTS} restart attempts`);
						return;
					}
					const delayMs = computeBackoff(CHANNEL_RESTART_POLICY, attempt);
					log.info?.(`[${id}] auto-restart attempt ${attempt}/${MAX_RESTART_ATTEMPTS} in ${Math.round(delayMs / 1e3)}s`);
					setRuntime(channelId, id, {
						accountId: id,
						restartPending: true,
						reconnectAttempts: attempt
					});
					try {
						await sleepWithAbort(delayMs, abort.signal);
						if (manuallyStopped.has(rKey)) return;
						if (store.tasks.get(id) === trackedPromise) store.tasks.delete(id);
						if (store.aborts.get(id) === abort) store.aborts.delete(id);
						await startChannelInternal(channelId, id, {
							preserveRestartAttempts: true,
							preserveManualStop: true
						});
					} catch {}
				}).finally(() => {
					if (store.tasks.get(id) === trackedPromise) store.tasks.delete(id);
					if (store.aborts.get(id) === abort) store.aborts.delete(id);
				});
				handedOffTask = true;
				store.tasks.set(id, trackedPromise);
			} catch (error) {
				if (!handedOffTask) setRuntime(channelId, id, {
					accountId: id,
					running: false,
					restartPending: false,
					lastError: formatErrorMessage(error)
				});
				throw error;
			} finally {
				resolveStart?.();
				if (store.starting.get(id) === startGate) store.starting.delete(id);
				if (!handedOffTask) await cleanupTaskScopedApprovalRuntime("channel startup cleanup failed");
				if (!handedOffTask && store.aborts.get(id) === abort) store.aborts.delete(id);
			}
		}));
	};
	const startChannel = async (channelId, accountId) => {
		await startChannelInternal(channelId, accountId);
	};
	const stopChannel = async (channelId, accountId) => {
		const plugin = getChannelPlugin(channelId);
		const store = getStore(channelId);
		if (!plugin?.gateway?.stopAccount && store.aborts.size === 0 && store.tasks.size === 0) return;
		const cfg = getRuntimeConfig();
		const knownIds = new Set([
			...store.aborts.keys(),
			...store.starting.keys(),
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
			manuallyStopped.add(restartKey(channelId, id));
			abort?.abort();
			const log = channelLogs[channelId];
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
			if (!await waitForChannelStopGracefully(task, CHANNEL_STOP_ABORT_TIMEOUT_MS)) {
				log.warn?.(`[${id}] channel stop exceeded ${CHANNEL_STOP_ABORT_TIMEOUT_MS}ms after abort; continuing shutdown`);
				setRuntime(channelId, id, {
					accountId: id,
					running: true,
					restartPending: false,
					lastError: `channel stop timed out after ${CHANNEL_STOP_ABORT_TIMEOUT_MS}ms`
				});
				return;
			}
			store.aborts.delete(id);
			store.tasks.delete(id);
			setRuntime(channelId, id, {
				accountId: id,
				running: false,
				restartPending: false,
				lastStopAt: Date.now()
			});
		}));
	};
	const startChannels = async () => {
		const pending = [...listChannelPlugins()];
		const workerCount = Math.min(8, pending.length);
		await Promise.all(Array.from({ length: workerCount }, async () => {
			for (;;) {
				const plugin = pending.shift();
				if (!plugin) return;
				try {
					await startChannel(plugin.id);
				} catch (err) {
					channelLogs[plugin.id]?.error?.(`[${plugin.id}] channel startup failed: ${formatErrorMessage(err)}`);
				}
			}
		}));
	};
	const markChannelLoggedOut = (channelId, cleared, accountId) => {
		const plugin = getChannelPlugin(channelId);
		if (!plugin) return;
		const cfg = getRuntimeConfig();
		const resolvedId = accountId ?? resolveChannelDefaultAccountId({
			plugin,
			cfg
		});
		const current = getRuntime(channelId, resolvedId);
		const next = {
			accountId: resolvedId,
			running: false,
			restartPending: false,
			lastError: cleared ? "logged out" : current.lastError
		};
		if (typeof current.connected === "boolean") next.connected = false;
		setRuntime(channelId, resolvedId, next);
	};
	const getRuntimeSnapshot = () => {
		const cfg = getRuntimeConfig();
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
				const described = plugin.config.describeAccount?.(account, cfg);
				const next = {
					...store.runtimes.get(id) ?? cloneDefaultRuntime(plugin.id, id),
					accountId: id
				};
				next.enabled = enabled;
				applyDescribedAccountFields(next, described);
				const configured = described?.configured;
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
	const isManuallyStopped_ = (channelId, accountId) => {
		return manuallyStopped.has(restartKey(channelId, accountId));
	};
	const resetRestartAttempts_ = (channelId, accountId) => {
		restartAttempts.delete(restartKey(channelId, accountId));
	};
	return {
		getRuntimeSnapshot,
		startChannels,
		startChannel,
		stopChannel,
		markChannelLoggedOut,
		isManuallyStopped: isManuallyStopped_,
		resetRestartAttempts: resetRestartAttempts_,
		isHealthMonitorEnabled
	};
}
//#endregion
//#region src/gateway/server-close.ts
const shutdownLog = createSubsystemLogger("gateway/shutdown");
const GATEWAY_SHUTDOWN_HOOK_TIMEOUT_MS = 1e3;
const GATEWAY_PRE_RESTART_HOOK_TIMEOUT_MS = 1e3;
const WEBSOCKET_CLOSE_GRACE_MS = 1e3;
const WEBSOCKET_CLOSE_FORCE_CONTINUE_MS = 250;
const HTTP_CLOSE_GRACE_MS = 1e3;
const HTTP_CLOSE_FORCE_WAIT_MS = 5e3;
const MCP_RUNTIME_CLOSE_GRACE_MS = 5e3;
const LSP_RUNTIME_CLOSE_GRACE_MS = 5e3;
function createTimeoutRace(timeoutMs, onTimeout) {
	let timer = null;
	timer = setTimeout(() => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		resolve(onTimeout());
	}, timeoutMs);
	timer.unref?.();
	let resolve;
	return {
		promise: new Promise((innerResolve) => {
			resolve = innerResolve;
		}),
		clear() {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		}
	};
}
async function triggerGatewayLifecycleHookWithTimeout(params) {
	let timeout;
	const hookPromise = triggerInternalHook(params.event);
	hookPromise.catch(() => void 0);
	try {
		if (await Promise.race([hookPromise.then(() => "completed"), new Promise((resolve) => {
			timeout = setTimeout(() => resolve("timeout"), params.timeoutMs);
			timeout.unref?.();
		})]) === "timeout") shutdownLog.warn(`${params.hookName} hook timed out after ${params.timeoutMs}ms; continuing shutdown`);
	} finally {
		if (timeout) clearTimeout(timeout);
	}
}
async function disposeRuntimeWithShutdownGrace(params) {
	const disposePromise = Promise.resolve().then(params.dispose).catch((err) => {
		shutdownLog.warn(`${params.label} runtime disposal failed during shutdown: ${String(err)}`);
	});
	const disposeTimeout = createTimeoutRace(params.graceMs, () => {
		shutdownLog.warn(`${params.label} runtime disposal exceeded ${params.graceMs}ms; continuing shutdown`);
	});
	await Promise.race([disposePromise, disposeTimeout.promise]);
	disposeTimeout.clear();
}
async function disposeAllBundleLspRuntimesOnDemand() {
	const { disposeAllBundleLspRuntimes } = await import("./pi-bundle-lsp-runtime-BCcRJbYl.js");
	await disposeAllBundleLspRuntimes();
}
async function runGatewayClosePrelude(params) {
	params.stopDiagnostics?.();
	params.clearSkillsRefreshTimer?.();
	params.skillsChangeUnsub?.();
	params.disposeAuthRateLimiter?.();
	params.disposeBrowserAuthRateLimiter();
	params.stopModelPricingRefresh?.();
	params.stopChannelHealthMonitor?.();
	params.clearSecretsRuntimeSnapshot?.();
	await params.closeMcpServer?.().catch(() => {});
}
function isServerNotRunningError(err) {
	return Boolean(err && typeof err === "object" && "code" in err && err.code === "ERR_SERVER_NOT_RUNNING");
}
function createGatewayCloseHandler(params) {
	return async (opts) => {
		try {
			const reason = (normalizeOptionalString(opts?.reason) ?? "") || "gateway stopping";
			const restartExpectedMs = typeof opts?.restartExpectedMs === "number" && Number.isFinite(opts.restartExpectedMs) ? Math.max(0, Math.floor(opts.restartExpectedMs)) : null;
			try {
				await triggerGatewayLifecycleHookWithTimeout({
					event: createInternalHookEvent("gateway", "shutdown", "gateway:shutdown", {
						reason,
						restartExpectedMs
					}),
					hookName: "gateway:shutdown",
					timeoutMs: GATEWAY_SHUTDOWN_HOOK_TIMEOUT_MS
				});
				if (restartExpectedMs !== null) await triggerGatewayLifecycleHookWithTimeout({
					event: createInternalHookEvent("gateway", "pre-restart", "gateway:pre-restart", {
						reason,
						restartExpectedMs
					}),
					hookName: "gateway:pre-restart",
					timeoutMs: GATEWAY_PRE_RESTART_HOOK_TIMEOUT_MS
				});
			} catch {}
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
			await disposeRegisteredAgentHarnesses();
			await Promise.all([disposeRuntimeWithShutdownGrace({
				label: "bundle-mcp",
				dispose: params.disposeSessionMcpRuntimes ?? disposeAllSessionMcpRuntimes,
				graceMs: MCP_RUNTIME_CLOSE_GRACE_MS
			}), disposeRuntimeWithShutdownGrace({
				label: "bundle-lsp",
				dispose: params.disposeBundleLspRuntimes ?? disposeAllBundleLspRuntimesOnDemand,
				graceMs: LSP_RUNTIME_CLOSE_GRACE_MS
			})]);
			if (params.pluginServices) await params.pluginServices.stop().catch(() => {});
			await stopGmailWatcher();
			params.cron.stop();
			params.heartbeatRunner.stop();
			try {
				params.stopTaskRegistryMaintenance?.();
			} catch {}
			try {
				params.updateCheckStop?.();
			} catch {}
			for (const timer of params.nodePresenceTimers.values()) clearInterval(timer);
			params.nodePresenceTimers.clear();
			params.broadcast("shutdown", {
				reason,
				restartExpectedMs
			});
			clearInterval(params.tickInterval);
			clearInterval(params.healthInterval);
			clearInterval(params.dedupeCleanup);
			if (params.mediaCleanup) clearInterval(params.mediaCleanup);
			if (params.agentUnsub) try {
				params.agentUnsub();
			} catch {}
			if (params.heartbeatUnsub) try {
				params.heartbeatUnsub();
			} catch {}
			if (params.transcriptUnsub) try {
				params.transcriptUnsub();
			} catch {}
			if (params.lifecycleUnsub) try {
				params.lifecycleUnsub();
			} catch {}
			params.chatRunState.clear();
			for (const c of params.clients) try {
				c.socket.close(1012, "service restart");
			} catch {}
			params.clients.clear();
			await params.configReloader.stop().catch(() => {});
			const wsClients = params.wss.clients ?? /* @__PURE__ */ new Set();
			const closePromise = new Promise((resolve) => params.wss.close(() => resolve()));
			const websocketGraceTimeout = createTimeoutRace(WEBSOCKET_CLOSE_GRACE_MS, () => false);
			const closedWithinGrace = await Promise.race([closePromise.then(() => true), websocketGraceTimeout.promise]);
			websocketGraceTimeout.clear();
			if (!closedWithinGrace) {
				shutdownLog.warn(`websocket server close exceeded ${WEBSOCKET_CLOSE_GRACE_MS}ms; forcing shutdown continuation with ${wsClients.size} tracked client(s)`);
				for (const client of wsClients) try {
					client.terminate();
				} catch {}
				const websocketForceTimeout = createTimeoutRace(WEBSOCKET_CLOSE_FORCE_CONTINUE_MS, () => {
					shutdownLog.warn(`websocket server close still pending after ${WEBSOCKET_CLOSE_FORCE_CONTINUE_MS}ms force window; continuing shutdown`);
				});
				await Promise.race([closePromise, websocketForceTimeout.promise]);
				websocketForceTimeout.clear();
			}
			const servers = params.httpServers && params.httpServers.length > 0 ? params.httpServers : [params.httpServer];
			for (const server of servers) {
				const httpServer = server;
				if (typeof httpServer.closeIdleConnections === "function") httpServer.closeIdleConnections();
				const closePromise = new Promise((resolve, reject) => httpServer.close((err) => {
					if (!err || isServerNotRunningError(err)) {
						resolve();
						return;
					}
					reject(err);
				}));
				const httpGraceTimeout = createTimeoutRace(HTTP_CLOSE_GRACE_MS, () => false);
				const closedWithinGrace = await Promise.race([closePromise.then(() => true), httpGraceTimeout.promise]);
				httpGraceTimeout.clear();
				if (!closedWithinGrace) {
					shutdownLog.warn(`http server close exceeded ${HTTP_CLOSE_GRACE_MS}ms; forcing connection shutdown and waiting for close`);
					httpServer.closeAllConnections?.();
					const httpForceTimeout = createTimeoutRace(HTTP_CLOSE_FORCE_WAIT_MS, () => false);
					const closedAfterForce = await Promise.race([closePromise.then(() => true), httpForceTimeout.promise]);
					httpForceTimeout.clear();
					if (!closedAfterForce) throw new Error(`http server close still pending after forced connection shutdown (${HTTP_CLOSE_FORCE_WAIT_MS}ms)`);
				}
			}
		} finally {
			try {
				params.releasePluginRouteRegistry?.();
			} catch {}
		}
	};
}
//#endregion
//#region src/gateway/server-control-ui-root.ts
async function resolveGatewayControlUiRootState(params) {
	if (params.controlUiRootOverride) {
		const resolvedOverride = resolveControlUiRootOverrideSync(params.controlUiRootOverride);
		const resolvedOverridePath = path.resolve(params.controlUiRootOverride);
		if (!resolvedOverride) params.log.warn(`gateway: controlUi.root not found at ${resolvedOverridePath}`);
		return resolvedOverride ? {
			kind: "resolved",
			path: resolvedOverride
		} : {
			kind: "invalid",
			path: resolvedOverridePath
		};
	}
	if (!params.controlUiEnabled) return;
	const resolveRoot = () => resolveControlUiRootSync({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	});
	let resolvedRoot = resolveRoot();
	if (!resolvedRoot) {
		const ensureResult = await ensureControlUiAssetsBuilt(params.gatewayRuntime);
		if (!ensureResult.ok && ensureResult.message) params.log.warn(`gateway: ${ensureResult.message}`);
		resolvedRoot = resolveRoot();
	}
	if (!resolvedRoot) return { kind: "missing" };
	return {
		kind: isPackageProvenControlUiRootSync(resolvedRoot, {
			moduleUrl: import.meta.url,
			argv1: process.argv[1],
			cwd: process.cwd()
		}) ? "bundled" : "resolved",
		path: resolvedRoot
	};
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
//#region src/cron/normalize-job-identity.ts
function normalizeCronJobIdentityFields(raw) {
	const rawId = normalizeOptionalString(raw.id) ?? "";
	const legacyJobId = normalizeOptionalString(raw.jobId) ?? "";
	const hadJobIdKey = "jobId" in raw;
	const normalizedId = rawId || legacyJobId;
	const idChanged = Boolean(normalizedId && raw.id !== normalizedId);
	if (idChanged) raw.id = normalizedId;
	if (hadJobIdKey) delete raw.jobId;
	return {
		mutated: idChanged || hadJobIdKey,
		legacyJobIdIssue: hadJobIdKey
	};
}
//#endregion
//#region src/cron/service/store.ts
function invalidateStaleNextRunOnScheduleChange(params) {
	const previousJob = params.previousJobsById.get(params.hydrated.id);
	if (!previousJob || cronSchedulingInputsEqual(previousJob, params.hydrated)) return;
	params.hydrated.state ??= {};
	params.hydrated.state.nextRunAtMs = void 0;
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
	const previousJobsById = /* @__PURE__ */ new Map();
	for (const job of state.store?.jobs ?? []) previousJobsById.set(job.id, job);
	const fileMtimeMs = await getFileMtimeMs(state.deps.storePath);
	const jobs = (await loadCronStore(state.deps.storePath)).jobs ?? [];
	for (const [index, job] of jobs.entries()) {
		const raw = job;
		const { legacyJobIdIssue } = normalizeCronJobIdentityFields(raw);
		let normalized;
		try {
			normalized = normalizeCronJobInput(raw);
		} catch (error) {
			if (!isInvalidCronSessionTargetIdError(error)) throw error;
			normalized = null;
			state.deps.log.warn({
				storePath: state.deps.storePath,
				jobId: typeof raw.id === "string" ? raw.id : void 0
			}, "cron: job has invalid persisted sessionTarget; run openclaw doctor --fix to repair");
		}
		const hydrated = normalized && typeof normalized === "object" ? normalized : job;
		jobs[index] = hydrated;
		if (legacyJobIdIssue) {
			const resolvedId = typeof hydrated.id === "string" ? hydrated.id : void 0;
			state.deps.log.warn({
				storePath: state.deps.storePath,
				jobId: resolvedId
			}, "cron: job used legacy jobId field; normalized id in memory (run openclaw doctor --fix to persist canonical shape)");
		}
		if (typeof hydrated.enabled !== "boolean") hydrated.enabled = true;
		invalidateStaleNextRunOnScheduleChange({
			previousJobsById,
			hydrated
		});
		if (typeof hydrated.sessionTarget !== "string") {
			const payload = hydrated.payload;
			const payloadKind = payload && typeof payload === "object" && !Array.isArray(payload) && Object.hasOwn(payload, "kind") ? payload.kind : void 0;
			let defaulted;
			if (payloadKind === "systemEvent") defaulted = "main";
			else if (payloadKind === "agentTurn") defaulted = "isolated";
			if (defaulted) {
				hydrated.sessionTarget = defaulted;
				const jobId = typeof hydrated.id === "string" ? hydrated.id : void 0;
				const dedupeKey = jobId ?? "<unknown>";
				if (!state.warnedMissingSessionTargetJobIds.has(dedupeKey)) {
					state.warnedMissingSessionTargetJobIds.add(dedupeKey);
					state.deps.log.warn({
						storePath: state.deps.storePath,
						jobId,
						defaulted
					}, "cron: job missing sessionTarget; defaulted in memory (edit jobs.json to persist canonical shape)");
				}
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
async function persist(state, opts) {
	if (!state.store) return;
	await saveCronStore(state.deps.storePath, state.store, opts);
	state.storeFileMtimeMs = await getFileMtimeMs(state.deps.storePath);
}
//#endregion
//#region src/cron/session-reaper.ts
/**
* Cron session reaper — prunes completed isolated cron run sessions
* from the session store after a configurable retention period.
*
* Pattern: sessions keyed as `...:cron:<jobId>:run:<uuid>` are ephemeral
* run records. The base session (`...:cron:<jobId>`) is kept as-is.
*/
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
	const prunedSessions = /* @__PURE__ */ new Map();
	try {
		await updateSessionStore(storePath, (store) => {
			const cutoff = now - retentionMs;
			for (const key of Object.keys(store)) {
				if (!isCronRunSessionKey(key)) continue;
				const entry = store[key];
				if (!entry) continue;
				if ((entry.updatedAt ?? 0) < cutoff) {
					if (!prunedSessions.has(entry.sessionId) || entry.sessionFile) prunedSessions.set(entry.sessionId, entry.sessionFile);
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
	if (prunedSessions.size > 0) try {
		const store = loadSessionStore(storePath, { skipCache: true });
		const archivedDirs = await archiveRemovedSessionTranscripts({
			removedSessionFiles: prunedSessions,
			referencedSessionIds: new Set(Object.values(store).map((entry) => entry?.sessionId).filter((id) => Boolean(id))),
			storePath,
			reason: "deleted",
			restrictToStoreDir: true
		});
		if (archivedDirs.size > 0) await cleanupArchivedSessionTranscripts({
			directories: [...archivedDirs],
			olderThanMs: retentionMs,
			reason: "deleted",
			nowMs: now
		});
	} catch (err) {
		params.log.warn({ err: String(err) }, "cron-reaper: transcript cleanup failed");
	}
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
//#region src/cron/service/timeout-policy.ts
/**
* Maximum wall-clock time for a single job execution. Acts as a safety net
* on top of per-provider/per-agent timeouts to prevent one stuck job from
* wedging the entire cron lane.
*/
const DEFAULT_JOB_TIMEOUT_MS = 10 * 6e4;
/**
* Agent turns can legitimately run much longer than generic cron jobs.
* Use a larger safety ceiling when no explicit timeout is set.
*/
const AGENT_TURN_SAFETY_TIMEOUT_MS = 60 * 6e4;
function resolveCronJobTimeoutMs(job) {
	const configuredTimeoutMs = job.payload.kind === "agentTurn" && typeof job.payload.timeoutSeconds === "number" ? Math.floor(job.payload.timeoutSeconds * 1e3) : void 0;
	if (configuredTimeoutMs === void 0) return job.payload.kind === "agentTurn" ? AGENT_TURN_SAFETY_TIMEOUT_MS : DEFAULT_JOB_TIMEOUT_MS;
	return configuredTimeoutMs <= 0 ? void 0 : configuredTimeoutMs;
}
//#endregion
//#region src/cron/service/timer.ts
const MAX_TIMER_DELAY_MS = 6e4;
/**
* Minimum gap between consecutive fires of the same cron job.  This is a
* safety net that prevents spin-loops when `computeJobNextRunAtMs` returns
* a value within the same second as the just-completed run.  The guard
* is intentionally generous (2 s) so it never masks a legitimate schedule
* but always breaks an infinite re-trigger cycle.  (See #17821)
*/
const MIN_REFIRE_GAP_MS = 2e3;
const DEFAULT_MISSED_JOB_STAGGER_MS = 5e3;
const DEFAULT_MAX_MISSED_JOBS_PER_RESTART = 5;
const DEFAULT_FAILURE_ALERT_AFTER = 2;
const DEFAULT_FAILURE_ALERT_COOLDOWN_MS = 60 * 6e4;
async function executeJobCoreWithTimeout(state, job) {
	const jobTimeoutMs = resolveCronJobTimeoutMs(job);
	if (typeof jobTimeoutMs !== "number") return await executeJobCore(state, job);
	const runAbortController = new AbortController();
	let timeoutId;
	let rejectTimeout;
	const timeoutPromise = new Promise((_, reject) => {
		rejectTimeout = reject;
	});
	const startTimeout = () => {
		if (timeoutId) return;
		timeoutId = setTimeout(() => {
			runAbortController.abort(timeoutErrorMessage());
			rejectTimeout?.(new Error(timeoutErrorMessage()));
		}, jobTimeoutMs);
	};
	const deferTimeoutUntilExecutionStart = job.sessionTarget !== "main" && job.payload.kind === "agentTurn";
	if (!deferTimeoutUntilExecutionStart) startTimeout();
	try {
		return await Promise.race([executeJobCore(state, job, runAbortController.signal, { onExecutionStarted: deferTimeoutUntilExecutionStart ? startTimeout : void 0 }), timeoutPromise]);
	} finally {
		if (timeoutId) clearTimeout(timeoutId);
	}
}
function resolveRunConcurrency(state) {
	const raw = state.deps.cronConfig?.maxConcurrentRuns;
	if (typeof raw !== "number" || !Number.isFinite(raw)) return 1;
	return Math.max(1, Math.floor(raw));
}
function timeoutErrorMessage() {
	return "cron: job execution timed out";
}
function isAbortError(err) {
	if (!(err instanceof Error)) return false;
	return err.name === "AbortError" || err.message === timeoutErrorMessage();
}
function normalizeCronRunErrorText(err) {
	if (isAbortError(err)) return timeoutErrorMessage();
	if (typeof err === "string") return err === `Error: ${timeoutErrorMessage()}` ? timeoutErrorMessage() : err;
	return String(err);
}
function tryCreateCronTaskRun(params) {
	const runId = createCronExecutionId(params.job.id, params.startedAt);
	try {
		createRunningTaskRun({
			runtime: "cron",
			sourceId: params.job.id,
			ownerKey: "",
			scopeKind: "system",
			childSessionKey: params.job.sessionKey,
			agentId: params.job.agentId,
			runId,
			label: params.job.name,
			task: params.job.name || params.job.id,
			deliveryStatus: "not_applicable",
			notifyPolicy: "silent",
			startedAt: params.startedAt,
			lastEventAt: params.startedAt
		});
		return runId;
	} catch (error) {
		params.state.deps.log.warn({
			jobId: params.job.id,
			error
		}, "cron: failed to create task ledger record");
		return;
	}
}
function tryFinishCronTaskRun(state, result) {
	if (!result.taskRunId) return;
	try {
		if (result.status === "ok" || result.status === "skipped") {
			completeTaskRunByRunId({
				runId: result.taskRunId,
				runtime: "cron",
				endedAt: result.endedAt,
				lastEventAt: result.endedAt,
				terminalSummary: result.summary ?? void 0
			});
			return;
		}
		failTaskRunByRunId({
			runId: result.taskRunId,
			runtime: "cron",
			status: normalizeCronRunErrorText(result.error) === timeoutErrorMessage() ? "timed_out" : "failed",
			endedAt: result.endedAt,
			lastEventAt: result.endedAt,
			error: result.status === "error" ? normalizeCronRunErrorText(result.error) : void 0,
			terminalSummary: result.summary ?? void 0
		});
	} catch (error) {
		state.deps.log.warn({
			runId: result.taskRunId,
			jobStatus: result.status,
			error
		}, "cron: failed to update task ledger record");
	}
}
/** Default max retries for one-shot jobs on transient errors (#24355). */
const DEFAULT_MAX_TRANSIENT_RETRIES = 3;
const TRANSIENT_PATTERNS = {
	rate_limit: /(rate[_ ]limit|too many requests|429|resource has been exhausted|cloudflare|tokens per day)/i,
	overloaded: /\b529\b|\boverloaded(?:_error)?\b|high demand|temporar(?:ily|y) overloaded|capacity exceeded/i,
	network: /(network|econnreset|econnrefused|fetch failed|socket)/i,
	timeout: /(timeout|etimedout)/i,
	server_error: /\b5\d{2}\b/
};
function isTransientCronError(error, retryOn) {
	if (!error || typeof error !== "string") return false;
	return (retryOn?.length ? retryOn : Object.keys(TRANSIENT_PATTERNS)).some((k) => TRANSIENT_PATTERNS[k]?.test(error));
}
function resolveCronNextRunWithLowerBound(params) {
	if (params.naturalNext === void 0) {
		params.state.deps.log.warn({
			jobId: params.job.id,
			jobName: params.job.name,
			context: params.context
		}, "cron: next run unresolved; clearing schedule to avoid a refire loop");
		return;
	}
	return Math.max(params.naturalNext, params.lowerBoundMs);
}
function resolveRetryConfig(cronConfig) {
	const retry = cronConfig?.retry;
	return {
		maxAttempts: typeof retry?.maxAttempts === "number" ? retry.maxAttempts : DEFAULT_MAX_TRANSIENT_RETRIES,
		backoffMs: Array.isArray(retry?.backoffMs) && retry.backoffMs.length > 0 ? retry.backoffMs : DEFAULT_ERROR_BACKOFF_SCHEDULE_MS.slice(0, 3),
		retryOn: Array.isArray(retry?.retryOn) && retry.retryOn.length > 0 ? retry.retryOn : void 0
	};
}
function resolveDeliveryState(params) {
	if (!resolveCronDeliveryPlan(params.job).requested) return { status: "not-requested" };
	if (params.delivered === true) return {
		delivered: true,
		status: "delivered"
	};
	if (params.delivered === false) return {
		delivered: false,
		status: "not-delivered"
	};
	return { status: "unknown" };
}
function normalizeCronMessageChannel(input) {
	const channel = normalizeOptionalLowercaseString(input);
	return channel ? channel : void 0;
}
function normalizeTo(input) {
	if (typeof input !== "string") return;
	const to = input.trim();
	return to ? to : void 0;
}
function clampPositiveInt(value, fallback) {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const floored = Math.floor(value);
	return floored >= 1 ? floored : fallback;
}
function clampNonNegativeInt(value, fallback) {
	if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
	const floored = Math.floor(value);
	return floored >= 0 ? floored : fallback;
}
function resolveFailureAlert(state, job) {
	const globalConfig = state.deps.cronConfig?.failureAlert;
	const jobConfig = job.failureAlert === false ? void 0 : job.failureAlert;
	if (job.failureAlert === false) return null;
	if (!jobConfig && globalConfig?.enabled !== true) return null;
	const mode = jobConfig?.mode ?? globalConfig?.mode;
	const explicitTo = normalizeTo(jobConfig?.to);
	return {
		after: clampPositiveInt(jobConfig?.after ?? globalConfig?.after, DEFAULT_FAILURE_ALERT_AFTER),
		cooldownMs: clampNonNegativeInt(jobConfig?.cooldownMs ?? globalConfig?.cooldownMs, DEFAULT_FAILURE_ALERT_COOLDOWN_MS),
		channel: normalizeCronMessageChannel(jobConfig?.channel) ?? normalizeCronMessageChannel(job.delivery?.channel) ?? "last",
		to: mode === "webhook" ? explicitTo : explicitTo ?? normalizeTo(job.delivery?.to),
		mode,
		accountId: jobConfig?.accountId ?? globalConfig?.accountId,
		includeSkipped: jobConfig?.includeSkipped ?? globalConfig?.includeSkipped ?? false
	};
}
function emitFailureAlert(state, params) {
	const safeJobName = params.job.name || params.job.id;
	const truncatedError = (params.error?.trim() || "unknown reason").slice(0, 200);
	const statusVerb = params.status === "skipped" ? "skipped" : "failed";
	const detailLabel = params.status === "skipped" ? "Skip reason" : "Last error";
	const text = [`Cron job "${safeJobName}" ${statusVerb} ${params.consecutiveErrors} times`, `${detailLabel}: ${truncatedError}`].join("\n");
	if (state.deps.sendCronFailureAlert) {
		state.deps.sendCronFailureAlert({
			job: params.job,
			text,
			channel: params.channel,
			to: params.to,
			mode: params.mode,
			accountId: params.accountId
		}).catch((err) => {
			state.deps.log.warn({
				jobId: params.job.id,
				err: String(err)
			}, "cron: failure alert delivery failed");
		});
		return;
	}
	state.deps.enqueueSystemEvent(text, { agentId: params.job.agentId });
	if (params.job.wakeMode === "now") state.deps.requestHeartbeatNow({ reason: `cron:${params.job.id}:failure-alert` });
}
function maybeEmitFailureAlert(state, params) {
	if (!params.alertConfig || params.consecutiveCount < params.alertConfig.after) return;
	if (params.job.delivery?.bestEffort === true) return;
	const now = state.deps.nowMs();
	const lastAlert = params.job.state.lastFailureAlertAtMs;
	if (typeof lastAlert === "number" && now - lastAlert < Math.max(0, params.alertConfig.cooldownMs)) return;
	emitFailureAlert(state, {
		job: params.job,
		error: params.error,
		consecutiveErrors: params.consecutiveCount,
		channel: params.alertConfig.channel,
		to: params.alertConfig.to,
		mode: params.alertConfig.mode,
		accountId: params.alertConfig.accountId,
		status: params.status
	});
	params.job.state.lastFailureAlertAtMs = now;
}
/**
* Apply the result of a job execution to the job's state.
* Handles consecutive error tracking, exponential backoff, one-shot disable,
* and nextRunAtMs computation. Returns `true` if the job should be deleted.
*/
function applyJobResult(state, job, result, opts) {
	const prevLastRunAtMs = job.state.lastRunAtMs;
	const computeNextWithPreservedLastRun = (nowMs) => {
		const saved = job.state.lastRunAtMs;
		job.state.lastRunAtMs = prevLastRunAtMs;
		try {
			return computeJobNextRunAtMs(job, nowMs);
		} finally {
			job.state.lastRunAtMs = saved;
		}
	};
	job.state.runningAtMs = void 0;
	job.state.lastRunAtMs = result.startedAt;
	job.state.lastRunStatus = result.status;
	job.state.lastStatus = result.status;
	job.state.lastDurationMs = Math.max(0, result.endedAt - result.startedAt);
	job.state.lastError = result.error;
	job.state.lastErrorReason = result.status === "error" && typeof result.error === "string" ? resolveFailoverReasonFromError(result.error) ?? void 0 : void 0;
	const deliveryState = resolveDeliveryState({
		job,
		delivered: result.delivered
	});
	job.state.lastDelivered = deliveryState.delivered;
	job.state.lastDeliveryStatus = deliveryState.status;
	job.state.lastDeliveryError = deliveryState.status === "not-delivered" && result.error ? result.error : void 0;
	job.updatedAtMs = result.endedAt;
	const alertConfig = resolveFailureAlert(state, job);
	if (result.status === "error") {
		job.state.consecutiveErrors = (job.state.consecutiveErrors ?? 0) + 1;
		job.state.consecutiveSkipped = 0;
		maybeEmitFailureAlert(state, {
			job,
			alertConfig,
			status: "error",
			error: result.error,
			consecutiveCount: job.state.consecutiveErrors
		});
	} else if (result.status === "skipped") {
		job.state.consecutiveErrors = 0;
		job.state.consecutiveSkipped = (job.state.consecutiveSkipped ?? 0) + 1;
		if (alertConfig?.includeSkipped) maybeEmitFailureAlert(state, {
			job,
			alertConfig,
			status: "skipped",
			error: result.error,
			consecutiveCount: job.state.consecutiveSkipped
		});
		else job.state.lastFailureAlertAtMs = void 0;
	} else {
		job.state.consecutiveErrors = 0;
		job.state.consecutiveSkipped = 0;
		job.state.lastFailureAlertAtMs = void 0;
	}
	const shouldDelete = job.schedule.kind === "at" && job.deleteAfterRun === true && result.status === "ok";
	if (!shouldDelete) if (job.schedule.kind === "at") {
		if (result.status === "ok" || result.status === "skipped") {
			job.enabled = false;
			job.state.nextRunAtMs = void 0;
		} else if (result.status === "error") {
			const retryConfig = resolveRetryConfig(state.deps.cronConfig);
			const transient = isTransientCronError(result.error, retryConfig.retryOn);
			const consecutive = job.state.consecutiveErrors;
			if (transient && consecutive <= retryConfig.maxAttempts) {
				const backoff = errorBackoffMs(consecutive, retryConfig.backoffMs);
				job.state.nextRunAtMs = result.endedAt + backoff;
				state.deps.log.info({
					jobId: job.id,
					jobName: job.name,
					consecutiveErrors: consecutive,
					backoffMs: backoff,
					nextRunAtMs: job.state.nextRunAtMs
				}, "cron: scheduling one-shot retry after transient error");
			} else {
				job.enabled = false;
				job.state.nextRunAtMs = void 0;
				state.deps.log.warn({
					jobId: job.id,
					jobName: job.name,
					consecutiveErrors: consecutive,
					error: result.error,
					reason: transient ? "max retries exhausted" : "permanent error"
				}, "cron: disabling one-shot job after error");
			}
		}
	} else if (result.status === "error" && isJobEnabled(job)) {
		const backoff = errorBackoffMs(job.state.consecutiveErrors ?? 1);
		let normalNext;
		try {
			normalNext = opts?.preserveSchedule && job.schedule.kind === "every" ? computeNextWithPreservedLastRun(result.endedAt) : computeJobNextRunAtMs(job, result.endedAt);
		} catch (err) {
			recordScheduleComputeError({
				state,
				job,
				err
			});
		}
		const backoffNext = result.endedAt + backoff;
		job.state.nextRunAtMs = job.schedule.kind === "cron" ? resolveCronNextRunWithLowerBound({
			state,
			job,
			naturalNext: normalNext,
			lowerBoundMs: backoffNext,
			context: "error_backoff"
		}) : normalNext !== void 0 ? Math.max(normalNext, backoffNext) : backoffNext;
		state.deps.log.info({
			jobId: job.id,
			consecutiveErrors: job.state.consecutiveErrors,
			backoffMs: backoff,
			nextRunAtMs: job.state.nextRunAtMs
		}, "cron: applying error backoff");
	} else if (isJobEnabled(job)) {
		let naturalNext;
		try {
			naturalNext = opts?.preserveSchedule && job.schedule.kind === "every" ? computeNextWithPreservedLastRun(result.endedAt) : computeJobNextRunAtMs(job, result.endedAt);
		} catch (err) {
			recordScheduleComputeError({
				state,
				job,
				err
			});
		}
		if (job.schedule.kind === "cron") {
			const minNext = result.endedAt + MIN_REFIRE_GAP_MS;
			job.state.nextRunAtMs = resolveCronNextRunWithLowerBound({
				state,
				job,
				naturalNext,
				lowerBoundMs: minNext,
				context: "completion"
			});
		} else job.state.nextRunAtMs = naturalNext;
	} else job.state.nextRunAtMs = void 0;
	return shouldDelete;
}
function applyOutcomeToStoredJob(state, result) {
	clearCronJobActive(result.jobId);
	tryFinishCronTaskRun(state, result);
	const store = state.store;
	if (!store) return;
	const jobs = store.jobs;
	const job = jobs.find((entry) => entry.id === result.jobId);
	if (!job) {
		state.deps.log.warn({ jobId: result.jobId }, "cron: applyOutcomeToStoredJob — job not found after forceReload, result discarded");
		return;
	}
	const shouldDelete = applyJobResult(state, job, {
		status: result.status,
		error: result.error,
		delivered: result.delivered,
		startedAt: result.startedAt,
		endedAt: result.endedAt
	});
	emitJobFinished(state, job, result, result.startedAt);
	if (shouldDelete) {
		store.jobs = jobs.filter((entry) => entry.id !== job.id);
		emit(state, {
			jobId: job.id,
			action: "removed"
		});
	}
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
		const withNextRun = state.store?.jobs.filter((j) => j.enabled && hasScheduledNextRunAtMs(j.state.nextRunAtMs)).length ?? 0;
		if (enabledCount > 0) {
			armRunningRecheckTimer(state);
			state.deps.log.debug({
				jobCount,
				enabledCount,
				withNextRun,
				delayMs: MAX_TIMER_DELAY_MS
			}, "cron: timer armed for maintenance recheck");
			return;
		}
		state.deps.log.debug({
			jobCount,
			enabledCount,
			withNextRun
		}, "cron: armTimer skipped - no jobs with nextRunAtMs");
		return;
	}
	const now = state.deps.nowMs();
	const delay = Math.max(nextAt - now, 0);
	const clampedDelay = Math.min(delay === 0 ? MIN_REFIRE_GAP_MS : delay, MAX_TIMER_DELAY_MS);
	state.timer = setTimeout(() => {
		onTimer(state).catch((err) => {
			state.deps.log.error({ err: String(err) }, "cron: timer tick failed");
		});
	}, clampedDelay);
	state.deps.log.debug({
		nextAt,
		delayMs: clampedDelay,
		clamped: delay > MAX_TIMER_DELAY_MS
	}, "cron: timer armed");
}
function armRunningRecheckTimer(state) {
	if (state.timer) clearTimeout(state.timer);
	state.timer = setTimeout(() => {
		onTimer(state).catch((err) => {
			state.deps.log.error({ err: String(err) }, "cron: timer tick failed");
		});
	}, MAX_TIMER_DELAY_MS);
}
async function onTimer(state) {
	if (state.running) {
		armRunningRecheckTimer(state);
		return;
	}
	state.running = true;
	armRunningRecheckTimer(state);
	try {
		const dueJobs = await locked(state, async () => {
			await ensureLoaded(state, {
				forceReload: true,
				skipRecompute: true
			});
			const dueCheckNow = state.deps.nowMs();
			const due = collectRunnableJobs(state, dueCheckNow);
			if (due.length === 0) {
				if (recomputeNextRunsForMaintenance(state, {
					recomputeExpired: true,
					nowMs: dueCheckNow
				})) await persist(state);
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
		const runDueJob = async (params) => {
			const { id, job } = params;
			const startedAt = state.deps.nowMs();
			job.state.runningAtMs = startedAt;
			markCronJobActive(job.id);
			emit(state, {
				jobId: job.id,
				action: "started",
				runAtMs: startedAt
			});
			const jobTimeoutMs = resolveCronJobTimeoutMs(job);
			const taskRunId = tryCreateCronTaskRun({
				state,
				job,
				startedAt
			});
			try {
				return {
					jobId: id,
					taskRunId,
					...await executeJobCoreWithTimeout(state, job),
					startedAt,
					endedAt: state.deps.nowMs()
				};
			} catch (err) {
				const errorText = normalizeCronRunErrorText(err);
				state.deps.log.warn({
					jobId: id,
					jobName: job.name,
					timeoutMs: jobTimeoutMs ?? null
				}, `cron: job failed: ${errorText}`);
				return {
					jobId: id,
					taskRunId,
					status: "error",
					error: errorText,
					startedAt,
					endedAt: state.deps.nowMs()
				};
			}
		};
		const concurrency = Math.min(resolveRunConcurrency(state), Math.max(1, dueJobs.length));
		const results = Array.from({ length: dueJobs.length });
		let cursor = 0;
		const workers = Array.from({ length: concurrency }, async () => {
			for (;;) {
				const index = cursor++;
				if (index >= dueJobs.length) return;
				const due = dueJobs[index];
				if (!due) return;
				results[index] = await runDueJob(due);
			}
		});
		await Promise.all(workers);
		const completedResults = results.filter((entry) => entry !== void 0);
		if (completedResults.length > 0) await locked(state, async () => {
			await ensureLoaded(state, {
				forceReload: true,
				skipRecompute: true
			});
			for (const result of completedResults) applyOutcomeToStoredJob(state, result);
			recomputeNextRunsForMaintenance(state);
			await persist(state);
		});
	} finally {
		const storePaths = /* @__PURE__ */ new Set();
		if (state.deps.resolveSessionStorePath) {
			const defaultAgentId = state.deps.defaultAgentId ?? "main";
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
		state.running = false;
		armTimer(state);
	}
}
function isRunnableJob(params) {
	const { job, nowMs } = params;
	if (!job.state) job.state = {};
	if (!isJobEnabled(job)) return false;
	if (params.skipJobIds?.has(job.id)) return false;
	if (typeof job.state.runningAtMs === "number") return false;
	if (params.skipAtIfAlreadyRan && job.schedule.kind === "at" && job.state.lastStatus) {
		const lastRun = job.state.lastRunAtMs;
		const nextRun = job.state.nextRunAtMs;
		if (job.state.lastStatus === "error" && isJobEnabled(job) && typeof nextRun === "number" && typeof lastRun === "number" && nextRun > lastRun) return nowMs >= nextRun;
		return false;
	}
	const next = job.state.nextRunAtMs;
	if (hasScheduledNextRunAtMs(next) && nowMs >= next) return true;
	if (hasScheduledNextRunAtMs(next) && next > nowMs && isErrorBackoffPending(job, nowMs)) return false;
	if (!params.allowCronMissedRunByLastRun || job.schedule.kind !== "cron") return false;
	let previousRunAtMs;
	try {
		previousRunAtMs = computeJobPreviousRunAtMs(job, nowMs);
	} catch {
		return false;
	}
	if (typeof previousRunAtMs !== "number" || !Number.isFinite(previousRunAtMs)) return false;
	const lastRunAtMs = job.state.lastRunAtMs;
	if (typeof lastRunAtMs !== "number" || !Number.isFinite(lastRunAtMs)) return false;
	return previousRunAtMs > lastRunAtMs;
}
function isErrorBackoffPending(job, nowMs) {
	if (job.schedule.kind === "at" || job.state.lastStatus !== "error") return false;
	const lastRunAtMs = job.state.lastRunAtMs;
	if (typeof lastRunAtMs !== "number" || !Number.isFinite(lastRunAtMs)) return false;
	const consecutiveErrorsRaw = job.state.consecutiveErrors;
	return nowMs < lastRunAtMs + errorBackoffMs(typeof consecutiveErrorsRaw === "number" && Number.isFinite(consecutiveErrorsRaw) ? Math.max(1, Math.floor(consecutiveErrorsRaw)) : 1);
}
function collectRunnableJobs(state, nowMs, opts) {
	if (!state.store) return [];
	return state.store.jobs.filter((job) => isRunnableJob({
		job,
		nowMs,
		skipJobIds: opts?.skipJobIds,
		skipAtIfAlreadyRan: opts?.skipAtIfAlreadyRan,
		allowCronMissedRunByLastRun: opts?.allowCronMissedRunByLastRun
	}));
}
async function runMissedJobs(state, opts) {
	const plan = await planStartupCatchup(state, opts);
	if (plan.candidates.length === 0 && plan.deferredJobIds.length === 0) return;
	await applyStartupCatchupOutcomes(state, plan, await executeStartupCatchupPlan(state, plan));
}
async function planStartupCatchup(state, opts) {
	const maxImmediate = Math.max(0, state.deps.maxMissedJobsPerRestart ?? DEFAULT_MAX_MISSED_JOBS_PER_RESTART);
	return locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		if (!state.store) return {
			candidates: [],
			deferredJobIds: []
		};
		const now = state.deps.nowMs();
		const missed = collectRunnableJobs(state, now, {
			skipJobIds: opts?.skipJobIds,
			skipAtIfAlreadyRan: true,
			allowCronMissedRunByLastRun: true
		});
		if (missed.length === 0) return {
			candidates: [],
			deferredJobIds: []
		};
		const sorted = missed.toSorted((a, b) => (a.state.nextRunAtMs ?? 0) - (b.state.nextRunAtMs ?? 0));
		const startupCandidates = sorted.slice(0, maxImmediate);
		const deferred = sorted.slice(maxImmediate);
		if (deferred.length > 0) state.deps.log.info({
			immediateCount: startupCandidates.length,
			deferredCount: deferred.length,
			totalMissed: missed.length
		}, "cron: staggering missed jobs to prevent gateway overload");
		if (startupCandidates.length > 0) state.deps.log.info({
			count: startupCandidates.length,
			jobIds: startupCandidates.map((j) => j.id)
		}, "cron: running missed jobs after restart");
		for (const job of startupCandidates) {
			job.state.runningAtMs = now;
			job.state.lastError = void 0;
		}
		await persist(state);
		return {
			candidates: startupCandidates.map((job) => ({
				jobId: job.id,
				job
			})),
			deferredJobIds: deferred.map((job) => job.id)
		};
	});
}
async function executeStartupCatchupPlan(state, plan) {
	const outcomes = [];
	for (const candidate of plan.candidates) outcomes.push(await runStartupCatchupCandidate(state, candidate));
	return outcomes;
}
async function runStartupCatchupCandidate(state, candidate) {
	const startedAt = state.deps.nowMs();
	const taskRunId = tryCreateCronTaskRun({
		state,
		job: candidate.job,
		startedAt
	});
	emit(state, {
		jobId: candidate.job.id,
		action: "started",
		runAtMs: startedAt
	});
	try {
		const result = await executeJobCoreWithTimeout(state, candidate.job);
		return {
			jobId: candidate.jobId,
			taskRunId,
			status: result.status,
			error: result.error,
			summary: result.summary,
			delivered: result.delivered,
			sessionId: result.sessionId,
			sessionKey: result.sessionKey,
			model: result.model,
			provider: result.provider,
			usage: result.usage,
			startedAt,
			endedAt: state.deps.nowMs()
		};
	} catch (err) {
		return {
			jobId: candidate.jobId,
			taskRunId,
			status: "error",
			error: normalizeCronRunErrorText(err),
			startedAt,
			endedAt: state.deps.nowMs()
		};
	}
}
async function applyStartupCatchupOutcomes(state, plan, outcomes) {
	const staggerMs = Math.max(0, state.deps.missedJobStaggerMs ?? DEFAULT_MISSED_JOB_STAGGER_MS);
	await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		if (!state.store) return;
		for (const result of outcomes) applyOutcomeToStoredJob(state, result);
		if (plan.deferredJobIds.length > 0) {
			const baseNow = state.deps.nowMs();
			let offset = staggerMs;
			for (const jobId of plan.deferredJobIds) {
				const job = state.store.jobs.find((entry) => entry.id === jobId);
				if (!job || !isJobEnabled(job)) continue;
				job.state.nextRunAtMs = baseNow + offset;
				offset += staggerMs;
			}
		}
		recomputeNextRunsForMaintenance(state);
		await persist(state);
	});
}
async function executeJobCore(state, job, abortSignal, options) {
	const resolveAbortError = () => ({
		status: "error",
		error: timeoutErrorMessage()
	});
	const waitWithAbort = async (ms) => {
		if (!abortSignal) {
			await new Promise((resolve) => setTimeout(resolve, ms));
			return;
		}
		if (abortSignal.aborted) return;
		await new Promise((resolve) => {
			const timer = setTimeout(() => {
				abortSignal.removeEventListener("abort", onAbort);
				resolve();
			}, ms);
			const onAbort = () => {
				clearTimeout(timer);
				abortSignal.removeEventListener("abort", onAbort);
				resolve();
			};
			abortSignal.addEventListener("abort", onAbort, { once: true });
		});
	};
	if (abortSignal?.aborted) return resolveAbortError();
	if (job.sessionTarget === "main") return await executeMainSessionCronJob(state, job, abortSignal, waitWithAbort);
	return await executeDetachedCronJob(state, job, abortSignal, resolveAbortError, options);
}
async function executeMainSessionCronJob(state, job, abortSignal, waitWithAbort) {
	const text = resolveJobPayloadTextForMain(job);
	if (!text) return {
		status: "skipped",
		error: job.payload.kind === "systemEvent" ? "main job requires non-empty systemEvent text" : "main job requires payload.kind=\"systemEvent\""
	};
	const targetMainSessionKey = job.sessionKey;
	state.deps.enqueueSystemEvent(text, {
		agentId: job.agentId,
		sessionKey: targetMainSessionKey,
		contextKey: `cron:${job.id}`
	});
	if (job.wakeMode === "now" && state.deps.runHeartbeatOnce) {
		const reason = `cron:${job.id}`;
		const isRecurringJob = job.schedule.kind !== "at";
		const maxWaitMs = state.deps.wakeNowHeartbeatBusyMaxWaitMs ?? 2 * 6e4;
		const retryDelayMs = state.deps.wakeNowHeartbeatBusyRetryDelayMs ?? 250;
		const waitStartedAt = state.deps.nowMs();
		let heartbeatResult;
		for (;;) {
			if (abortSignal?.aborted) return {
				status: "error",
				error: timeoutErrorMessage()
			};
			heartbeatResult = await state.deps.runHeartbeatOnce({
				reason,
				agentId: job.agentId,
				sessionKey: targetMainSessionKey,
				heartbeat: { target: "last" }
			});
			if (heartbeatResult.status !== "skipped" || heartbeatResult.reason !== "requests-in-flight") break;
			if (isRecurringJob) {
				state.deps.requestHeartbeatNow({
					reason,
					agentId: job.agentId,
					sessionKey: targetMainSessionKey,
					heartbeat: { target: "last" }
				});
				return {
					status: "ok",
					summary: text
				};
			}
			if (abortSignal?.aborted) return {
				status: "error",
				error: timeoutErrorMessage()
			};
			if (state.deps.nowMs() - waitStartedAt > maxWaitMs) {
				if (abortSignal?.aborted) return {
					status: "error",
					error: timeoutErrorMessage()
				};
				state.deps.requestHeartbeatNow({
					reason,
					agentId: job.agentId,
					sessionKey: targetMainSessionKey,
					heartbeat: { target: "last" }
				});
				return {
					status: "ok",
					summary: text
				};
			}
			await waitWithAbort(retryDelayMs);
		}
		if (heartbeatResult.status === "ran") return {
			status: "ok",
			summary: text
		};
		if (heartbeatResult.status === "skipped") return {
			status: "skipped",
			error: heartbeatResult.reason,
			summary: text
		};
		return {
			status: "error",
			error: heartbeatResult.reason,
			summary: text
		};
	}
	if (abortSignal?.aborted) return {
		status: "error",
		error: timeoutErrorMessage()
	};
	state.deps.requestHeartbeatNow({
		reason: `cron:${job.id}`,
		agentId: job.agentId,
		sessionKey: targetMainSessionKey,
		heartbeat: { target: "last" }
	});
	return {
		status: "ok",
		summary: text
	};
}
async function executeDetachedCronJob(state, job, abortSignal, resolveAbortError, options) {
	if (job.payload.kind !== "agentTurn") return {
		status: "skipped",
		error: "isolated job requires payload.kind=agentTurn"
	};
	if (abortSignal?.aborted) return resolveAbortError();
	const res = await state.deps.runIsolatedAgentJob({
		job,
		message: job.payload.message,
		abortSignal,
		onExecutionStarted: options?.onExecutionStarted
	});
	if (abortSignal?.aborted) return {
		status: "error",
		error: timeoutErrorMessage()
	};
	return {
		status: res.status,
		error: res.error,
		summary: res.summary,
		delivered: res.delivered,
		deliveryAttempted: res.deliveryAttempted,
		delivery: res.delivery,
		sessionId: res.sessionId,
		sessionKey: res.sessionKey,
		model: res.model,
		provider: res.provider,
		usage: res.usage
	};
}
function emitJobFinished(state, job, result, runAtMs) {
	emit(state, {
		jobId: job.id,
		action: "finished",
		status: result.status,
		error: result.error,
		summary: result.summary,
		delivered: result.delivered,
		deliveryStatus: job.state.lastDeliveryStatus,
		deliveryError: job.state.lastDeliveryError,
		delivery: result.delivery,
		sessionId: result.sessionId,
		sessionKey: result.sessionKey,
		runAtMs,
		durationMs: job.state.lastDurationMs,
		nextRunAtMs: job.state.nextRunAtMs,
		model: result.model,
		provider: result.provider,
		usage: result.usage
	});
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
const STARTUP_INTERRUPTED_ERROR = "cron: job interrupted by gateway restart";
function markInterruptedStartupRun(params) {
	const { job, runningAtMs, nowMs } = params;
	const previousErrors = typeof job.state.consecutiveErrors === "number" && Number.isFinite(job.state.consecutiveErrors) ? Math.max(0, Math.floor(job.state.consecutiveErrors)) : 0;
	params.state.deps.log.warn({
		jobId: job.id,
		runningAtMs
	}, "cron: marking interrupted running job failed on startup");
	job.state.runningAtMs = void 0;
	job.state.lastRunAtMs = runningAtMs;
	job.state.lastRunStatus = "error";
	job.state.lastStatus = "error";
	job.state.lastError = STARTUP_INTERRUPTED_ERROR;
	job.state.lastDurationMs = Math.max(0, nowMs - runningAtMs);
	job.state.consecutiveErrors = previousErrors + 1;
	job.state.lastDelivered = false;
	job.state.lastDeliveryStatus = "unknown";
	job.state.lastDeliveryError = STARTUP_INTERRUPTED_ERROR;
	job.state.nextRunAtMs = void 0;
	job.updatedAtMs = nowMs;
	if (job.schedule.kind === "at") job.enabled = false;
	return {
		jobId: job.id,
		runAtMs: runningAtMs,
		durationMs: job.state.lastDurationMs
	};
}
function mergeManualRunSnapshotAfterReload(params) {
	if (!params.state.store) return;
	if (params.removed) {
		params.state.store.jobs = params.state.store.jobs.filter((job) => job.id !== params.jobId);
		return;
	}
	if (!params.snapshot) return;
	const reloaded = params.state.store.jobs.find((job) => job.id === params.jobId);
	if (!reloaded) return;
	reloaded.enabled = params.snapshot.enabled;
	reloaded.updatedAtMs = params.snapshot.updatedAtMs;
	reloaded.state = params.snapshot.state;
}
async function ensureLoadedForRead(state) {
	await ensureLoaded(state, { skipRecompute: true });
	if (!state.store) return;
	if (recomputeNextRunsForMaintenance(state)) await persist(state);
}
async function start(state) {
	if (!state.deps.cronEnabled) {
		state.deps.log.info({ enabled: false }, "cron: disabled");
		return;
	}
	const interruptedJobIds = /* @__PURE__ */ new Set();
	const interruptedRuns = [];
	let markedAnyInterruptedRun = false;
	await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		const jobs = state.store?.jobs ?? [];
		for (const job of jobs) {
			job.state ??= {};
			if (typeof job.state.runningAtMs === "number") {
				const nowMs = state.deps.nowMs();
				const interrupted = markInterruptedStartupRun({
					state,
					job,
					runningAtMs: job.state.runningAtMs,
					nowMs
				});
				interruptedJobIds.add(job.id);
				interruptedRuns.push(interrupted);
				markedAnyInterruptedRun = true;
			}
		}
		if (markedAnyInterruptedRun) await persist(state);
	});
	await runMissedJobs(state, { skipJobIds: interruptedJobIds.size > 0 ? interruptedJobIds : void 0 });
	await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		if (recomputeNextRuns(state)) await persist(state);
		for (const interrupted of interruptedRuns) {
			const job = state.store?.jobs.find((entry) => entry.id === interrupted.jobId);
			emit(state, {
				jobId: interrupted.jobId,
				action: "finished",
				status: "error",
				error: STARTUP_INTERRUPTED_ERROR,
				delivered: false,
				deliveryStatus: "unknown",
				deliveryError: STARTUP_INTERRUPTED_ERROR,
				runAtMs: interrupted.runAtMs,
				durationMs: interrupted.durationMs,
				nextRunAtMs: job?.state.nextRunAtMs
			});
		}
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
		await ensureLoadedForRead(state);
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
		await ensureLoadedForRead(state);
		const includeDisabled = opts?.includeDisabled === true;
		return (state.store?.jobs ?? []).filter((j) => includeDisabled || isJobEnabled(j)).toSorted((a, b) => (a.state.nextRunAtMs ?? 0) - (b.state.nextRunAtMs ?? 0));
	});
}
function resolveEnabledFilter(opts) {
	if (opts?.enabled === "all" || opts?.enabled === "enabled" || opts?.enabled === "disabled") return opts.enabled;
	return opts?.includeDisabled ? "all" : "enabled";
}
function sortJobs(jobs, sortBy, sortDir) {
	const dir = sortDir === "desc" ? -1 : 1;
	return jobs.toSorted((a, b) => {
		let cmp = 0;
		if (sortBy === "name") {
			const aName = typeof a.name === "string" ? a.name : "";
			const bName = typeof b.name === "string" ? b.name : "";
			cmp = aName.localeCompare(bName, void 0, { sensitivity: "base" });
		} else if (sortBy === "updatedAtMs") cmp = a.updatedAtMs - b.updatedAtMs;
		else {
			const aNext = a.state.nextRunAtMs;
			const bNext = b.state.nextRunAtMs;
			if (typeof aNext === "number" && typeof bNext === "number") cmp = aNext - bNext;
			else if (typeof aNext === "number") cmp = -1;
			else if (typeof bNext === "number") cmp = 1;
			else cmp = 0;
		}
		if (cmp !== 0) return cmp * dir;
		const aId = typeof a.id === "string" ? a.id : "";
		const bId = typeof b.id === "string" ? b.id : "";
		return aId.localeCompare(bId);
	});
}
async function listPage(state, opts) {
	return await locked(state, async () => {
		await ensureLoadedForRead(state);
		const query = normalizeLowercaseStringOrEmpty(opts?.query);
		const enabledFilter = resolveEnabledFilter(opts);
		const sortBy = opts?.sortBy ?? "nextRunAtMs";
		const sortDir = opts?.sortDir ?? "asc";
		const sorted = sortJobs((state.store?.jobs ?? []).filter((job) => {
			if (enabledFilter === "enabled" && !isJobEnabled(job)) return false;
			if (enabledFilter === "disabled" && isJobEnabled(job)) return false;
			if (!query) return true;
			return normalizeLowercaseStringOrEmpty([
				job.name,
				job.description ?? "",
				job.agentId ?? ""
			].join(" ")).includes(query);
		}), sortBy, sortDir);
		const total = sorted.length;
		const offset = Math.max(0, Math.min(total, Math.floor(opts?.offset ?? 0)));
		const defaultLimit = total === 0 ? 50 : total;
		const limit = Math.max(1, Math.min(200, Math.floor(opts?.limit ?? defaultLimit)));
		const jobs = sorted.slice(offset, offset + limit);
		const nextOffset = offset + jobs.length;
		return {
			jobs,
			total,
			offset,
			limit,
			hasMore: nextOffset < total,
			nextOffset: nextOffset < total ? nextOffset : null
		};
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
		await ensureLoaded(state, { skipRecompute: true });
		const job = findJobOrThrow(state, id);
		const now = state.deps.nowMs();
		applyJobPatch(job, patch, { defaultAgentId: state.deps.defaultAgentId });
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
		if (scheduleChanged || enabledChanged) if (isJobEnabled(job)) job.state.nextRunAtMs = computeJobNextRunAtMs(job, now);
		else {
			job.state.nextRunAtMs = void 0;
			job.state.runningAtMs = void 0;
		}
		else if (isJobEnabled(job) && !hasScheduledNextRunAtMs(job.state.nextRunAtMs)) job.state.nextRunAtMs = computeJobNextRunAtMs(job, now);
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
let nextManualRunId = 1;
async function skipInvalidPersistedManualRun(params) {
	const endedAt = params.state.deps.nowMs();
	const errorText = normalizeCronRunErrorText(params.error);
	const shouldDelete = applyJobResult(params.state, params.job, {
		status: "skipped",
		error: errorText,
		startedAt: endedAt,
		endedAt
	}, { preserveSchedule: params.mode === "force" });
	emit(params.state, {
		jobId: params.job.id,
		action: "finished",
		status: "skipped",
		error: errorText,
		runAtMs: endedAt,
		durationMs: params.job.state.lastDurationMs,
		nextRunAtMs: params.job.state.nextRunAtMs,
		deliveryStatus: params.job.state.lastDeliveryStatus,
		deliveryError: params.job.state.lastDeliveryError
	});
	if (shouldDelete && params.state.store) {
		params.state.store.jobs = params.state.store.jobs.filter((entry) => entry.id !== params.job.id);
		emit(params.state, {
			jobId: params.job.id,
			action: "removed"
		});
	}
	recomputeNextRunsForMaintenance(params.state, { recomputeExpired: true });
	await persist(params.state);
	armTimer(params.state);
}
function tryCreateManualTaskRun(params) {
	const runId = createCronExecutionId(params.job.id, params.startedAt);
	try {
		createRunningTaskRun({
			runtime: "cron",
			sourceId: params.job.id,
			ownerKey: "",
			scopeKind: "system",
			childSessionKey: params.job.sessionKey,
			agentId: params.job.agentId,
			runId,
			label: params.job.name,
			task: params.job.name || params.job.id,
			deliveryStatus: "not_applicable",
			notifyPolicy: "silent",
			startedAt: params.startedAt,
			lastEventAt: params.startedAt
		});
		return runId;
	} catch (error) {
		params.state.deps.log.warn({
			jobId: params.job.id,
			error
		}, "cron: failed to create task ledger record");
		return;
	}
}
function tryFinishManualTaskRun(state, params) {
	if (!params.taskRunId) return;
	try {
		if (params.coreResult.status === "ok" || params.coreResult.status === "skipped") {
			completeTaskRunByRunId({
				runId: params.taskRunId,
				runtime: "cron",
				endedAt: params.endedAt,
				lastEventAt: params.endedAt,
				terminalSummary: params.coreResult.summary ?? void 0
			});
			return;
		}
		failTaskRunByRunId({
			runId: params.taskRunId,
			runtime: "cron",
			status: normalizeCronRunErrorText(params.coreResult.error) === "cron: job execution timed out" ? "timed_out" : "failed",
			endedAt: params.endedAt,
			lastEventAt: params.endedAt,
			error: params.coreResult.status === "error" ? normalizeCronRunErrorText(params.coreResult.error) : void 0,
			terminalSummary: params.coreResult.summary ?? void 0
		});
	} catch (error) {
		state.deps.log.warn({
			runId: params.taskRunId,
			jobStatus: params.coreResult.status,
			error
		}, "cron: failed to update task ledger record");
	}
}
async function inspectManualRunPreflight(state, id, mode) {
	return await locked(state, async () => {
		warnIfDisabled(state, "run");
		await ensureLoaded(state, { skipRecompute: true });
		recomputeNextRunsForMaintenance(state);
		const job = findJobOrThrow(state, id);
		try {
			assertSupportedJobSpec(job);
		} catch (error) {
			await skipInvalidPersistedManualRun({
				state,
				job,
				mode,
				error
			});
			return {
				ok: true,
				ran: false,
				reason: "invalid-spec"
			};
		}
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
		return {
			ok: true,
			runnable: true,
			job,
			now
		};
	});
}
async function inspectManualRunDisposition(state, id, mode) {
	const result = await inspectManualRunPreflight(state, id, mode);
	if (!result.ok) return result;
	if ("reason" in result) return result;
	return {
		ok: true,
		runnable: true
	};
}
async function prepareManualRun(state, id, mode) {
	const preflight = await inspectManualRunPreflight(state, id, mode);
	if (!preflight.ok) return preflight;
	if ("reason" in preflight) return {
		ok: true,
		ran: false,
		reason: preflight.reason
	};
	return await locked(state, async () => {
		const job = findJobOrThrow(state, id);
		if (typeof job.state.runningAtMs === "number") return {
			ok: true,
			ran: false,
			reason: "already-running"
		};
		job.state.runningAtMs = preflight.now;
		job.state.lastError = void 0;
		await persist(state);
		emit(state, {
			jobId: job.id,
			action: "started",
			runAtMs: preflight.now
		});
		const taskRunId = tryCreateManualTaskRun({
			state,
			job,
			startedAt: preflight.now
		});
		const executionJob = structuredClone(job);
		return {
			ok: true,
			ran: true,
			jobId: job.id,
			taskRunId,
			startedAt: preflight.now,
			executionJob
		};
	});
}
async function finishPreparedManualRun(state, prepared, mode) {
	const executionJob = prepared.executionJob;
	const startedAt = prepared.startedAt;
	const jobId = prepared.jobId;
	const taskRunId = prepared.taskRunId;
	let coreResult;
	try {
		coreResult = await executeJobCoreWithTimeout(state, executionJob);
	} catch (err) {
		coreResult = {
			status: "error",
			error: normalizeCronRunErrorText(err)
		};
	}
	const endedAt = state.deps.nowMs();
	tryFinishManualTaskRun(state, {
		taskRunId,
		coreResult,
		endedAt
	});
	await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		const job = state.store?.jobs.find((entry) => entry.id === jobId);
		if (!job) return;
		const shouldDelete = applyJobResult(state, job, {
			status: coreResult.status,
			error: coreResult.error,
			delivered: coreResult.delivered,
			startedAt,
			endedAt
		}, { preserveSchedule: mode === "force" });
		emit(state, {
			jobId: job.id,
			action: "finished",
			status: coreResult.status,
			error: coreResult.error,
			summary: coreResult.summary,
			delivered: coreResult.delivered,
			deliveryStatus: job.state.lastDeliveryStatus,
			deliveryError: job.state.lastDeliveryError,
			delivery: coreResult.delivery,
			sessionId: coreResult.sessionId,
			sessionKey: coreResult.sessionKey,
			runAtMs: startedAt,
			durationMs: job.state.lastDurationMs,
			nextRunAtMs: job.state.nextRunAtMs,
			model: coreResult.model,
			provider: coreResult.provider,
			usage: coreResult.usage
		});
		if (shouldDelete && state.store) {
			state.store.jobs = state.store.jobs.filter((entry) => entry.id !== job.id);
			emit(state, {
				jobId: job.id,
				action: "removed"
			});
		}
		const postRunSnapshot = shouldDelete ? null : {
			enabled: job.enabled,
			updatedAtMs: job.updatedAtMs,
			state: structuredClone(job.state)
		};
		const postRunRemoved = shouldDelete;
		await ensureLoaded(state, {
			forceReload: true,
			skipRecompute: true
		});
		mergeManualRunSnapshotAfterReload({
			state,
			jobId,
			snapshot: postRunSnapshot,
			removed: postRunRemoved
		});
		recomputeNextRunsForMaintenance(state, { recomputeExpired: true });
		await persist(state);
		armTimer(state);
	});
}
async function run(state, id, mode) {
	const prepared = await prepareManualRun(state, id, mode);
	if (!prepared.ok || !prepared.ran) return prepared;
	await finishPreparedManualRun(state, prepared, mode);
	return {
		ok: true,
		ran: true
	};
}
async function enqueueRun(state, id, mode) {
	const disposition = await inspectManualRunDisposition(state, id, mode);
	if (!disposition.ok || !("runnable" in disposition && disposition.runnable)) return disposition;
	const runId = `manual:${id}:${state.deps.nowMs()}:${nextManualRunId++}`;
	enqueueCommandInLane("cron", async () => {
		const result = await run(state, id, mode);
		if (result.ok && "ran" in result && !result.ran) state.deps.log.info({
			jobId: id,
			runId,
			reason: result.reason
		}, "cron: queued manual run skipped before execution");
		return result;
	}, {
		warnAfterMs: 5e3,
		onWait: (waitMs, queuedAhead) => {
			state.deps.log.warn({
				jobId: id,
				runId,
				waitMs,
				queuedAhead
			}, "cron: queued manual run waiting for an execution slot");
		}
	}).catch((err) => {
		state.deps.log.error({
			jobId: id,
			runId,
			err: String(err)
		}, "cron: queued manual run background execution failed");
	});
	return {
		ok: true,
		enqueued: true,
		runId
	};
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
		warnedMissingSessionTargetJobIds: /* @__PURE__ */ new Set(),
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
	async listPage(opts) {
		return await listPage(this.state, opts);
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
	async enqueueRun(id, mode) {
		const result = await enqueueRun(this.state, id, mode);
		if (result.ok && "runnable" in result) throw new Error("cron enqueueRun returned unresolved runnable disposition");
		return result;
	}
	getJob(id) {
		return this.state.store?.jobs.find((job) => job.id === id);
	}
	getDefaultAgentId() {
		return this.state.deps.defaultAgentId;
	}
	wake(opts) {
		return wakeNow(this.state, opts);
	}
};
//#endregion
//#region src/cron/delivery.ts
const FAILURE_NOTIFICATION_TIMEOUT_MS = 3e4;
const cronDeliveryLogger = getChildLogger({ subsystem: "cron-delivery" });
async function resolveCronAnnounceDelivery(params) {
	const resolvedTarget = await resolveDeliveryTarget(params.cfg, params.agentId, {
		channel: params.target.channel,
		to: params.target.to,
		accountId: params.target.accountId,
		sessionKey: params.target.sessionKey
	});
	if (!resolvedTarget.ok) return {
		ok: false,
		error: resolvedTarget.error
	};
	const identity = resolveAgentOutboundIdentity(params.cfg, params.agentId);
	return {
		ok: true,
		resolvedTarget,
		session: buildOutboundSessionContext({
			cfg: params.cfg,
			agentId: params.agentId,
			sessionKey: resolveCronNotificationSessionKey({
				jobId: params.jobId,
				sessionKey: params.target.sessionKey
			})
		}),
		identity
	};
}
async function deliverCronAnnouncePayload(params) {
	await deliverOutboundPayloads({
		cfg: params.cfg,
		channel: params.delivery.resolvedTarget.channel,
		to: params.delivery.resolvedTarget.to,
		accountId: params.delivery.resolvedTarget.accountId,
		threadId: params.delivery.resolvedTarget.threadId,
		payloads: [{ text: params.message }],
		session: params.delivery.session,
		identity: params.delivery.identity,
		bestEffort: false,
		deps: createOutboundSendDeps(params.deps),
		abortSignal: params.abortSignal
	});
}
async function sendCronAnnouncePayloadStrict(params) {
	const delivery = await resolveCronAnnounceDelivery(params);
	if (!delivery.ok) throw delivery.error;
	await deliverCronAnnouncePayload({
		deps: params.deps,
		cfg: params.cfg,
		delivery,
		message: params.message,
		abortSignal: params.abortSignal
	});
}
async function sendFailureNotificationAnnounce(deps, cfg, agentId, jobId, target, message) {
	const delivery = await resolveCronAnnounceDelivery({
		cfg,
		agentId,
		jobId,
		target
	});
	if (!delivery.ok) {
		cronDeliveryLogger.warn({ error: delivery.error.message }, "cron: failed to resolve failure destination target");
		return;
	}
	const abortController = new AbortController();
	const timeout = setTimeout(() => {
		abortController.abort();
	}, FAILURE_NOTIFICATION_TIMEOUT_MS);
	try {
		await deliverCronAnnouncePayload({
			deps,
			cfg,
			delivery,
			message,
			abortSignal: abortController.signal
		});
	} catch (err) {
		cronDeliveryLogger.warn({
			err: formatErrorMessage(err),
			channel: delivery.resolvedTarget.channel,
			to: delivery.resolvedTarget.to
		}, "cron: failure destination announce failed");
	} finally {
		clearTimeout(timeout);
	}
}
//#endregion
//#region src/gateway/server-cron-notifications.ts
const CRON_WEBHOOK_TIMEOUT_MS = 1e4;
function redactWebhookUrl(url) {
	try {
		const parsed = new URL(url);
		return `${parsed.origin}${parsed.pathname}`;
	} catch {
		return "<invalid-webhook-url>";
	}
}
function resolveCronWebhookTarget(params) {
	if (normalizeOptionalLowercaseString(params.delivery?.mode) === "webhook") {
		const url = normalizeHttpWebhookUrl(params.delivery?.to);
		return url ? {
			url,
			source: "delivery"
		} : null;
	}
	if (params.legacyNotify) {
		const legacyUrl = normalizeHttpWebhookUrl(params.legacyWebhook);
		if (legacyUrl) return {
			url: legacyUrl,
			source: "legacy"
		};
	}
	return null;
}
function buildCronWebhookHeaders(webhookToken) {
	const headers = { "Content-Type": "application/json" };
	if (webhookToken) headers.Authorization = `Bearer ${webhookToken}`;
	return headers;
}
async function postCronWebhook(params) {
	const abortController = new AbortController();
	const timeout = setTimeout(() => {
		abortController.abort();
	}, CRON_WEBHOOK_TIMEOUT_MS);
	try {
		await (await fetchWithSsrFGuard({
			url: params.webhookUrl,
			init: {
				method: "POST",
				headers: buildCronWebhookHeaders(params.webhookToken),
				body: JSON.stringify(params.payload),
				signal: abortController.signal
			}
		})).release();
	} catch (err) {
		if (err instanceof SsrFBlockedError) params.logger.warn({
			...params.logContext,
			reason: formatErrorMessage(err),
			webhookUrl: redactWebhookUrl(params.webhookUrl)
		}, params.blockedLog);
		else params.logger.warn({
			...params.logContext,
			err: formatErrorMessage(err),
			webhookUrl: redactWebhookUrl(params.webhookUrl)
		}, params.failedLog);
	} finally {
		clearTimeout(timeout);
	}
}
async function sendGatewayCronFailureAlert(params) {
	const { agentId, cfg: runtimeConfig } = params.resolveCronAgent(params.job.agentId);
	const webhookToken = normalizeOptionalString(params.webhookToken);
	if (params.mode === "webhook" && !params.to) {
		params.logger.warn({ jobId: params.job.id }, "cron: failure alert webhook mode requires URL, skipping");
		return;
	}
	if (params.mode === "webhook" && params.to) {
		const webhookUrl = normalizeHttpWebhookUrl(params.to);
		if (webhookUrl) await postCronWebhook({
			webhookUrl,
			webhookToken,
			payload: {
				jobId: params.job.id,
				jobName: params.job.name,
				message: params.text
			},
			logContext: { jobId: params.job.id },
			blockedLog: "cron: failure alert webhook blocked by SSRF guard",
			failedLog: "cron: failure alert webhook failed",
			logger: params.logger
		});
		else params.logger.warn({
			jobId: params.job.id,
			webhookUrl: redactWebhookUrl(params.to)
		}, "cron: failure alert webhook URL is invalid, skipping");
		return;
	}
	const abortController = new AbortController();
	await sendCronAnnouncePayloadStrict({
		deps: params.deps,
		cfg: runtimeConfig,
		agentId,
		jobId: params.job.id,
		target: {
			channel: params.channel,
			to: params.to,
			accountId: params.accountId,
			sessionKey: resolveCronDeliverySessionKey(params.job)
		},
		message: params.text,
		abortSignal: abortController.signal
	});
}
function dispatchGatewayCronFinishedNotifications(params) {
	const webhookToken = normalizeOptionalString(params.webhookToken);
	const legacyWebhook = normalizeOptionalString(params.legacyWebhook);
	const legacyNotify = params.job?.notify === true;
	const webhookTarget = resolveCronWebhookTarget({
		delivery: params.job?.delivery && typeof params.job.delivery.mode === "string" ? {
			mode: params.job.delivery.mode,
			to: params.job.delivery.to
		} : void 0,
		legacyNotify,
		legacyWebhook
	});
	if (!webhookTarget && params.job?.delivery?.mode === "webhook") params.logger.warn({
		jobId: params.evt.jobId,
		deliveryTo: params.job.delivery.to
	}, "cron: skipped webhook delivery, delivery.to must be a valid http(s) URL");
	if (webhookTarget?.source === "legacy" && !params.warnedLegacyWebhookJobs.has(params.evt.jobId)) {
		params.warnedLegacyWebhookJobs.add(params.evt.jobId);
		params.logger.warn({
			jobId: params.evt.jobId,
			legacyWebhook: redactWebhookUrl(webhookTarget.url)
		}, "cron: deprecated notify+cron.webhook fallback in use, migrate to delivery.mode=webhook with delivery.to");
	}
	if (webhookTarget && params.evt.summary) (async () => {
		await postCronWebhook({
			webhookUrl: webhookTarget.url,
			webhookToken,
			payload: params.evt,
			logContext: { jobId: params.evt.jobId },
			blockedLog: "cron: webhook delivery blocked by SSRF guard",
			failedLog: "cron: webhook delivery failed",
			logger: params.logger
		});
	})();
	dispatchCronFailureDestinationNotifications({
		evt: params.evt,
		job: params.job,
		deps: params.deps,
		logger: params.logger,
		resolveCronAgent: params.resolveCronAgent,
		webhookToken,
		globalFailureDestination: params.globalFailureDestination
	});
}
function dispatchCronFailureDestinationNotifications(params) {
	if (params.evt.status !== "error" || !params.job || params.job.delivery?.bestEffort === true) return;
	const failureMessage = `Cron job "${params.job.name}" failed: ${params.evt.error ?? "unknown error"}`;
	const failureDest = resolveFailureDestination(params.job, params.globalFailureDestination);
	const deliverySessionKey = resolveCronDeliverySessionKey(params.job);
	if (failureDest) {
		const failurePayload = {
			jobId: params.job.id,
			jobName: params.job.name,
			message: failureMessage,
			status: params.evt.status,
			error: params.evt.error,
			runAtMs: params.evt.runAtMs,
			durationMs: params.evt.durationMs,
			nextRunAtMs: params.evt.nextRunAtMs
		};
		if (failureDest.mode === "webhook" && failureDest.to) {
			const webhookUrl = normalizeHttpWebhookUrl(failureDest.to);
			if (webhookUrl) (async () => {
				await postCronWebhook({
					webhookUrl,
					webhookToken: params.webhookToken,
					payload: failurePayload,
					logContext: { jobId: params.evt.jobId },
					blockedLog: "cron: failure destination webhook blocked by SSRF guard",
					failedLog: "cron: failure destination webhook failed",
					logger: params.logger
				});
			})();
			else params.logger.warn({
				jobId: params.evt.jobId,
				webhookUrl: redactWebhookUrl(failureDest.to)
			}, "cron: failure destination webhook URL is invalid, skipping");
			return;
		}
		if (failureDest.mode === "announce") {
			const { agentId, cfg: runtimeConfig } = params.resolveCronAgent(params.job.agentId);
			sendFailureNotificationAnnounce(params.deps, runtimeConfig, agentId, params.job.id, {
				channel: failureDest.channel,
				to: failureDest.to,
				accountId: failureDest.accountId,
				sessionKey: deliverySessionKey
			}, `⚠️ ${failureMessage}`);
		}
		return;
	}
	const primaryPlan = resolveCronDeliveryPlan(params.job);
	if (primaryPlan.mode !== "announce" || !primaryPlan.requested) return;
	const { agentId, cfg: runtimeConfig } = params.resolveCronAgent(params.job.agentId);
	sendFailureNotificationAnnounce(params.deps, runtimeConfig, agentId, params.job.id, {
		channel: primaryPlan.channel,
		to: primaryPlan.to,
		accountId: primaryPlan.accountId,
		sessionKey: deliverySessionKey
	}, `⚠️ ${failureMessage}`);
}
//#endregion
//#region src/gateway/server-cron.ts
function buildGatewayCronService(params) {
	const cronLogger = getChildLogger({ module: "cron" });
	const storePath = resolveCronStorePath(params.cfg.cron?.store);
	const cronEnabled = process.env.OPENCLAW_SKIP_CRON !== "1" && params.cfg.cron?.enabled !== false;
	const findAgentEntry = (cfg, agentId) => Array.isArray(cfg.agents?.list) ? cfg.agents.list.find((entry) => entry && typeof entry.id === "string" && normalizeAgentId(entry.id) === agentId) : void 0;
	const hasConfiguredAgent = (cfg, agentId) => Boolean(findAgentEntry(cfg, agentId));
	const mergeRuntimeAgentConfig = (runtimeConfig, requestedAgentId) => {
		if (hasConfiguredAgent(runtimeConfig, requestedAgentId)) return runtimeConfig;
		const fallbackAgentEntry = findAgentEntry(params.cfg, requestedAgentId);
		if (!fallbackAgentEntry) return runtimeConfig;
		const startupAgents = params.cfg.agents;
		const runtimeAgents = runtimeConfig.agents;
		return {
			...runtimeConfig,
			agents: {
				...startupAgents,
				...runtimeAgents,
				defaults: {
					...startupAgents?.defaults,
					...runtimeAgents?.defaults
				},
				list: [...runtimeAgents?.list ?? [], fallbackAgentEntry]
			}
		};
	};
	const resolveCronAgent = (requested) => {
		const runtimeConfig = getRuntimeConfig();
		const normalized = typeof requested === "string" && requested.trim() ? normalizeAgentId(requested) : void 0;
		const effectiveConfig = normalized !== void 0 ? mergeRuntimeAgentConfig(runtimeConfig, normalized) : runtimeConfig;
		return {
			agentId: normalized !== void 0 && hasConfiguredAgent(effectiveConfig, normalized) ? normalized : resolveDefaultAgentId(effectiveConfig),
			cfg: effectiveConfig
		};
	};
	const resolveCronSessionKey = (params) => {
		const requested = params.requestedSessionKey?.trim();
		if (!requested) return resolveAgentMainSessionKey({
			cfg: params.runtimeConfig,
			agentId: params.agentId
		});
		const candidate = toAgentStoreSessionKey({
			agentId: params.agentId,
			requestKey: requested,
			mainKey: params.runtimeConfig.session?.mainKey
		});
		const canonical = canonicalizeMainSessionAlias({
			cfg: params.runtimeConfig,
			agentId: params.agentId,
			sessionKey: candidate
		});
		if (canonical !== "global") {
			if (normalizeAgentId(resolveAgentIdFromSessionKey(canonical)) !== normalizeAgentId(params.agentId)) return resolveAgentMainSessionKey({
				cfg: params.runtimeConfig,
				agentId: params.agentId
			});
		}
		return canonical;
	};
	const resolveCronWakeTarget = (opts) => {
		const derivedAgentId = (typeof opts?.agentId === "string" && opts.agentId.trim() ? normalizeAgentId(opts.agentId) : void 0) ?? (opts?.sessionKey ? normalizeAgentId(resolveAgentIdFromSessionKey(opts.sessionKey)) : void 0);
		const runtimeConfigBase = getRuntimeConfig();
		const runtimeConfig = derivedAgentId !== void 0 ? mergeRuntimeAgentConfig(runtimeConfigBase, derivedAgentId) : runtimeConfigBase;
		const agentId = derivedAgentId || void 0;
		return {
			runtimeConfig,
			agentId,
			sessionKey: opts?.sessionKey && agentId ? resolveCronSessionKey({
				runtimeConfig,
				agentId,
				requestedSessionKey: opts.sessionKey
			}) : void 0
		};
	};
	const defaultAgentId = resolveDefaultAgentId(params.cfg);
	const runLogPrune = resolveCronRunLogPruneOptions(params.cfg.cron?.runLog);
	const resolveSessionStorePath = (agentId) => resolveStorePath(params.cfg.session?.store, { agentId: agentId ?? defaultAgentId });
	const sessionStorePath = resolveSessionStorePath(defaultAgentId);
	const warnedLegacyWebhookJobs = /* @__PURE__ */ new Set();
	const cron = new CronService({
		storePath,
		cronEnabled,
		cronConfig: params.cfg.cron,
		defaultAgentId,
		resolveSessionStorePath,
		sessionStorePath,
		enqueueSystemEvent: (text, opts) => {
			const { agentId, cfg: runtimeConfig } = resolveCronAgent(opts?.agentId);
			enqueueSystemEvent(text, {
				sessionKey: resolveCronSessionKey({
					runtimeConfig,
					agentId,
					requestedSessionKey: opts?.sessionKey
				}),
				contextKey: opts?.contextKey,
				trusted: opts?.trusted
			});
		},
		requestHeartbeatNow: (opts) => {
			const { agentId, sessionKey } = resolveCronWakeTarget(opts);
			requestHeartbeatNow({
				reason: opts?.reason,
				agentId,
				sessionKey,
				heartbeat: opts?.heartbeat
			});
		},
		runHeartbeatOnce: async (opts) => {
			const { runtimeConfig, agentId, sessionKey } = resolveCronWakeTarget(opts);
			const agentEntry = Array.isArray(runtimeConfig.agents?.list) && runtimeConfig.agents.list.find((entry) => entry && typeof entry.id === "string" && normalizeAgentId(entry.id) === agentId);
			const agentHeartbeat = agentEntry && typeof agentEntry === "object" ? agentEntry.heartbeat : void 0;
			const baseHeartbeat = {
				...runtimeConfig.agents?.defaults?.heartbeat,
				...agentHeartbeat
			};
			const heartbeatOverride = opts?.heartbeat ? {
				...baseHeartbeat,
				...opts.heartbeat
			} : void 0;
			return await runHeartbeatOnce({
				cfg: runtimeConfig,
				reason: opts?.reason,
				agentId,
				sessionKey,
				heartbeat: heartbeatOverride,
				deps: {
					...params.deps,
					runtime: defaultRuntime
				}
			});
		},
		runIsolatedAgentJob: async ({ job, message, abortSignal, onExecutionStarted }) => {
			const { agentId, cfg: runtimeConfig } = resolveCronAgent(job.agentId);
			const sessionKey = resolveCronSessionTargetSessionKey(job.sessionTarget) ?? `cron:${job.id}`;
			try {
				return await runCronIsolatedAgentTurn({
					cfg: runtimeConfig,
					deps: params.deps,
					job,
					message,
					abortSignal,
					onExecutionStarted,
					agentId,
					sessionKey,
					lane: "cron"
				});
			} finally {
				await cleanupBrowserSessionsForLifecycleEnd({
					sessionKeys: [sessionKey],
					onWarn: (msg) => cronLogger.warn({ jobId: job.id }, msg)
				});
			}
		},
		sendCronFailureAlert: async ({ job, text, channel, to, mode, accountId }) => await sendGatewayCronFailureAlert({
			deps: params.deps,
			logger: cronLogger,
			resolveCronAgent,
			webhookToken: params.cfg.cron?.webhookToken,
			job,
			text,
			channel,
			to,
			mode,
			accountId
		}),
		log: getChildLogger({
			module: "cron",
			storePath
		}),
		onEvent: (evt) => {
			params.broadcast("cron", evt, { dropIfSlow: true });
			if (evt.action === "finished") {
				dispatchGatewayCronFinishedNotifications({
					evt,
					job: cron.getJob(evt.jobId),
					deps: params.deps,
					logger: cronLogger,
					resolveCronAgent,
					webhookToken: params.cfg.cron?.webhookToken,
					legacyWebhook: params.cfg.cron?.webhook,
					globalFailureDestination: params.cfg.cron?.failureDestination,
					warnedLegacyWebhookJobs
				});
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
					delivered: evt.delivered,
					deliveryStatus: evt.deliveryStatus,
					deliveryError: evt.deliveryError,
					delivery: evt.delivery,
					sessionId: evt.sessionId,
					sessionKey: evt.sessionKey,
					runAtMs: evt.runAtMs,
					durationMs: evt.durationMs,
					nextRunAtMs: evt.nextRunAtMs,
					model: evt.model,
					provider: evt.provider,
					usage: evt.usage
				}, runLogPrune).catch((err) => {
					cronLogger.warn({
						err: String(err),
						logPath
					}, "cron: run log append failed");
				});
			}
		}
	});
	return {
		cron,
		storePath,
		cronEnabled
	};
}
//#endregion
//#region src/gateway/server-lanes.ts
function applyGatewayLaneConcurrency(cfg) {
	const cronMaxConcurrentRuns = cfg.cron?.maxConcurrentRuns ?? 1;
	setCommandLaneConcurrency("cron", cronMaxConcurrentRuns);
	setCommandLaneConcurrency("cron-nested", cronMaxConcurrentRuns);
	setCommandLaneConcurrency("main", resolveAgentMaxConcurrent(cfg));
	setCommandLaneConcurrency("subagent", resolveSubagentMaxConcurrent(cfg));
}
//#endregion
//#region src/gateway/server-runtime-handles.ts
function createGatewayServerMutableState() {
	const noopInterval = () => {
		const timer = setInterval(() => {}, 1 << 30);
		timer.unref?.();
		return timer;
	};
	return {
		bonjourStop: null,
		tickInterval: noopInterval(),
		healthInterval: noopInterval(),
		dedupeCleanup: noopInterval(),
		mediaCleanup: null,
		heartbeatRunner: {
			stop: () => {},
			updateConfig: (_cfg) => {}
		},
		stopGatewayUpdateCheck: () => {},
		tailscaleCleanup: null,
		skillsRefreshTimer: null,
		skillsRefreshDelayMs: 3e4,
		skillsChangeUnsub: () => {},
		channelHealthMonitor: null,
		stopModelPricingRefresh: () => {},
		mcpServer: void 0,
		configReloader: { stop: async () => {} },
		agentUnsub: null,
		heartbeatUnsub: null,
		transcriptUnsub: null,
		lifecycleUnsub: null
	};
}
//#endregion
//#region src/gateway/server-live-state.ts
function createGatewayServerLiveState(params) {
	return {
		...createGatewayServerMutableState(),
		hooksConfig: params.hooksConfig,
		hookClientIpConfig: params.hookClientIpConfig,
		cronState: params.cronState,
		pluginServices: null,
		gatewayMethods: params.gatewayMethods
	};
}
//#endregion
//#region src/gateway/events.ts
const GATEWAY_EVENT_UPDATE_AVAILABLE = "update.available";
//#endregion
//#region src/gateway/server-methods-list.ts
const BASE_METHODS = [
	"health",
	"diagnostics.stability",
	"doctor.memory.status",
	"doctor.memory.dreamDiary",
	"doctor.memory.backfillDreamDiary",
	"doctor.memory.resetDreamDiary",
	"doctor.memory.resetGroundedShortTerm",
	"doctor.memory.repairDreamingArtifacts",
	"doctor.memory.dedupeDreamDiary",
	"logs.tail",
	"channels.status",
	"channels.start",
	"channels.logout",
	"status",
	"usage.status",
	"usage.cost",
	"tts.status",
	"tts.providers",
	"tts.personas",
	"tts.enable",
	"tts.disable",
	"tts.convert",
	"tts.setProvider",
	"tts.setPersona",
	"config.get",
	"config.set",
	"config.apply",
	"config.patch",
	"config.schema",
	"config.schema.lookup",
	"exec.approvals.get",
	"exec.approvals.set",
	"exec.approvals.node.get",
	"exec.approvals.node.set",
	"exec.approval.get",
	"exec.approval.list",
	"exec.approval.request",
	"exec.approval.waitDecision",
	"exec.approval.resolve",
	"plugin.approval.list",
	"plugin.approval.request",
	"plugin.approval.waitDecision",
	"plugin.approval.resolve",
	"wizard.start",
	"wizard.next",
	"wizard.cancel",
	"wizard.status",
	"talk.config",
	"talk.realtime.session",
	"talk.realtime.relayAudio",
	"talk.realtime.relayMark",
	"talk.realtime.relayStop",
	"talk.realtime.relayToolResult",
	"talk.speak",
	"talk.mode",
	"commands.list",
	"models.list",
	"models.authStatus",
	"tools.catalog",
	"tools.effective",
	"agents.list",
	"agents.create",
	"agents.update",
	"agents.delete",
	"agents.files.list",
	"agents.files.get",
	"agents.files.set",
	"skills.status",
	"skills.search",
	"skills.detail",
	"skills.bins",
	"skills.install",
	"skills.update",
	"update.status",
	"update.run",
	"voicewake.get",
	"voicewake.set",
	"secrets.reload",
	"secrets.resolve",
	"voicewake.routing.get",
	"voicewake.routing.set",
	"sessions.list",
	"sessions.subscribe",
	"sessions.unsubscribe",
	"sessions.messages.subscribe",
	"sessions.messages.unsubscribe",
	"sessions.preview",
	"sessions.compaction.list",
	"sessions.compaction.get",
	"sessions.compaction.branch",
	"sessions.compaction.restore",
	"sessions.create",
	"sessions.send",
	"sessions.abort",
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
	"node.pair.remove",
	"node.pair.verify",
	"device.pair.list",
	"device.pair.approve",
	"device.pair.reject",
	"device.pair.remove",
	"device.token.rotate",
	"device.token.revoke",
	"node.rename",
	"node.list",
	"node.describe",
	"node.pending.drain",
	"node.pending.enqueue",
	"node.invoke",
	"node.pending.pull",
	"node.pending.ack",
	"node.invoke.result",
	"node.event",
	"node.canvas.capability.refresh",
	"cron.list",
	"cron.status",
	"cron.add",
	"cron.update",
	"cron.remove",
	"cron.run",
	"cron.runs",
	"gateway.identity.get",
	"system-presence",
	"system-event",
	"message.action",
	"send",
	"agent",
	"agent.identity.get",
	"agent.wait",
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
	"session.message",
	"session.tool",
	"sessions.changed",
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
	"voicewake.routing.changed",
	"exec.approval.requested",
	"exec.approval.resolved",
	"plugin.approval.requested",
	"plugin.approval.resolved",
	GATEWAY_EVENT_UPDATE_AVAILABLE
];
//#endregion
//#region src/gateway/server-network-runtime.ts
function bootstrapGatewayNetworkRuntime() {
	ensureGlobalUndiciEnvProxyDispatcher();
}
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
			clientId: connect.client.id,
			clientMode: connect.client.mode,
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
//#region src/gateway/server-chat-state.ts
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
	const rawBuffers = /* @__PURE__ */ new Map();
	const buffers = /* @__PURE__ */ new Map();
	const deltaSentAt = /* @__PURE__ */ new Map();
	const deltaLastBroadcastLen = /* @__PURE__ */ new Map();
	const abortedRuns = /* @__PURE__ */ new Map();
	const clear = () => {
		registry.clear();
		rawBuffers.clear();
		buffers.clear();
		deltaSentAt.clear();
		deltaLastBroadcastLen.clear();
		abortedRuns.clear();
	};
	return {
		registry,
		rawBuffers,
		buffers,
		deltaSentAt,
		deltaLastBroadcastLen,
		abortedRuns,
		clear
	};
}
const TOOL_EVENT_RECIPIENT_TTL_MS = 600 * 1e3;
const TOOL_EVENT_RECIPIENT_FINAL_GRACE_MS = 30 * 1e3;
function createSessionEventSubscriberRegistry() {
	const connIds = /* @__PURE__ */ new Set();
	const empty = /* @__PURE__ */ new Set();
	return {
		subscribe: (connId) => {
			const normalized = connId.trim();
			if (!normalized) return;
			connIds.add(normalized);
		},
		unsubscribe: (connId) => {
			const normalized = connId.trim();
			if (!normalized) return;
			connIds.delete(normalized);
		},
		getAll: () => connIds.size > 0 ? connIds : empty,
		clear: () => {
			connIds.clear();
		}
	};
}
function createSessionMessageSubscriberRegistry() {
	const sessionToConnIds = /* @__PURE__ */ new Map();
	const connToSessionKeys = /* @__PURE__ */ new Map();
	const empty = /* @__PURE__ */ new Set();
	const normalize = (value) => value.trim();
	return {
		subscribe: (connId, sessionKey) => {
			const normalizedConnId = normalize(connId);
			const normalizedSessionKey = normalize(sessionKey);
			if (!normalizedConnId || !normalizedSessionKey) return;
			const connIds = sessionToConnIds.get(normalizedSessionKey) ?? /* @__PURE__ */ new Set();
			connIds.add(normalizedConnId);
			sessionToConnIds.set(normalizedSessionKey, connIds);
			const sessionKeys = connToSessionKeys.get(normalizedConnId) ?? /* @__PURE__ */ new Set();
			sessionKeys.add(normalizedSessionKey);
			connToSessionKeys.set(normalizedConnId, sessionKeys);
		},
		unsubscribe: (connId, sessionKey) => {
			const normalizedConnId = normalize(connId);
			const normalizedSessionKey = normalize(sessionKey);
			if (!normalizedConnId || !normalizedSessionKey) return;
			const connIds = sessionToConnIds.get(normalizedSessionKey);
			if (connIds) {
				connIds.delete(normalizedConnId);
				if (connIds.size === 0) sessionToConnIds.delete(normalizedSessionKey);
			}
			const sessionKeys = connToSessionKeys.get(normalizedConnId);
			if (sessionKeys) {
				sessionKeys.delete(normalizedSessionKey);
				if (sessionKeys.size === 0) connToSessionKeys.delete(normalizedConnId);
			}
		},
		unsubscribeAll: (connId) => {
			const normalizedConnId = normalize(connId);
			if (!normalizedConnId) return;
			const sessionKeys = connToSessionKeys.get(normalizedConnId);
			if (!sessionKeys) return;
			for (const sessionKey of sessionKeys) {
				const connIds = sessionToConnIds.get(sessionKey);
				if (!connIds) continue;
				connIds.delete(normalizedConnId);
				if (connIds.size === 0) sessionToConnIds.delete(sessionKey);
			}
			connToSessionKeys.delete(normalizedConnId);
		},
		get: (sessionKey) => {
			const normalizedSessionKey = normalize(sessionKey);
			if (!normalizedSessionKey) return empty;
			return sessionToConnIds.get(normalizedSessionKey) ?? empty;
		},
		clear: () => {
			sessionToConnIds.clear();
			connToSessionKeys.clear();
		}
	};
}
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
//#endregion
//#region src/gateway/server-mobile-nodes.ts
function hasConnectedMobileNode(registry) {
	return registry.listConnected().some((n) => {
		const platform = normalizeOptionalLowercaseString(n.platform) ?? "";
		return platform.startsWith("ios") || platform.startsWith("ipados") || platform.startsWith("android");
	});
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
//#region src/gateway/server-node-session-runtime.ts
function createGatewayNodeSessionRuntime(params) {
	const nodeRegistry = new NodeRegistry();
	const nodePresenceTimers = /* @__PURE__ */ new Map();
	const nodeSubscriptions = createNodeSubscriptionManager();
	const sessionEventSubscribers = createSessionEventSubscriberRegistry();
	const sessionMessageSubscribers = createSessionMessageSubscriberRegistry();
	const nodeSendEvent = (opts) => {
		const payload = safeParseJson(opts.payloadJSON ?? null);
		nodeRegistry.sendEvent(opts.nodeId, opts.event, payload);
	};
	const nodeSendToSession = (sessionKey, event, payload) => nodeSubscriptions.sendToSession(sessionKey, event, payload, nodeSendEvent);
	const nodeSendToAllSubscribed = (event, payload) => nodeSubscriptions.sendToAllSubscribed(event, payload, nodeSendEvent);
	const broadcastVoiceWakeChanged = (triggers) => {
		params.broadcast("voicewake.changed", { triggers }, { dropIfSlow: true });
	};
	const hasMobileNodeConnected = () => hasConnectedMobileNode(nodeRegistry);
	return {
		nodeRegistry,
		nodePresenceTimers,
		sessionEventSubscribers,
		sessionMessageSubscribers,
		nodeSendToSession,
		nodeSendToAllSubscribed,
		nodeSubscribe: nodeSubscriptions.subscribe,
		nodeUnsubscribe: nodeSubscriptions.unsubscribe,
		nodeUnsubscribeAll: nodeSubscriptions.unsubscribeAll,
		broadcastVoiceWakeChanged,
		hasMobileNodeConnected
	};
}
//#endregion
//#region src/gateway/config-recovery-notice.ts
function formatConfigRecoveryNotice(params) {
	const configName = path.basename(params.configPath) || "openclaw.json";
	return [
		`Config recovery warning: OpenClaw restored ${configName} from the last-known-good backup during ${params.phase} (${params.reason}).`,
		"The rejected config was invalid and was preserved as a timestamped .clobbered.* file.",
		`Do not write ${configName} again unless you validate the full config first.`
	].join(" ");
}
function enqueueConfigRecoveryNotice(params) {
	return enqueueSystemEvent(formatConfigRecoveryNotice(params), {
		sessionKey: resolveMainSessionKey(params.cfg),
		contextKey: `config-recovery:${params.phase}:${params.reason}`
	});
}
//#endregion
//#region src/gateway/channel-health-policy.ts
function isManagedAccount(snapshot) {
	return snapshot.enabled !== false && snapshot.configured !== false;
}
const BUSY_ACTIVITY_STALE_THRESHOLD_MS = 25 * 6e4;
const DEFAULT_CHANNEL_STALE_EVENT_THRESHOLD_MS = 30 * 6e4;
const DEFAULT_CHANNEL_CONNECT_GRACE_MS = 12e4;
function evaluateChannelHealth(snapshot, policy) {
	if (!isManagedAccount(snapshot)) return {
		healthy: true,
		reason: "unmanaged"
	};
	if (!snapshot.running) return {
		healthy: false,
		reason: "not-running"
	};
	const activeRuns = typeof snapshot.activeRuns === "number" && Number.isFinite(snapshot.activeRuns) ? Math.max(0, Math.trunc(snapshot.activeRuns)) : 0;
	const isBusy = snapshot.busy === true || activeRuns > 0;
	const lastStartAt = typeof snapshot.lastStartAt === "number" && Number.isFinite(snapshot.lastStartAt) ? snapshot.lastStartAt : null;
	const lastRunActivityAt = typeof snapshot.lastRunActivityAt === "number" && Number.isFinite(snapshot.lastRunActivityAt) ? snapshot.lastRunActivityAt : null;
	const lastTransportActivityAt = typeof snapshot.lastTransportActivityAt === "number" && Number.isFinite(snapshot.lastTransportActivityAt) ? snapshot.lastTransportActivityAt : null;
	const busyStateInitializedForLifecycle = lastStartAt == null || lastRunActivityAt != null && lastRunActivityAt >= lastStartAt;
	if (isBusy) if (!busyStateInitializedForLifecycle) {} else {
		if ((lastRunActivityAt == null ? Number.POSITIVE_INFINITY : Math.max(0, policy.now - lastRunActivityAt)) < BUSY_ACTIVITY_STALE_THRESHOLD_MS) return {
			healthy: true,
			reason: "busy"
		};
		return {
			healthy: false,
			reason: "stuck"
		};
	}
	if (snapshot.lastStartAt != null) {
		if (policy.now - snapshot.lastStartAt < policy.channelConnectGraceMs) return {
			healthy: true,
			reason: "startup-connect-grace"
		};
	}
	if (snapshot.connected === false) return {
		healthy: false,
		reason: "disconnected"
	};
	if (snapshot.connected === true && lastTransportActivityAt != null) {
		if (lastStartAt != null && lastTransportActivityAt < lastStartAt) {
			if (Math.max(0, policy.now - lastStartAt) <= policy.staleEventThresholdMs) return {
				healthy: true,
				reason: "healthy"
			};
			return {
				healthy: false,
				reason: "stale-socket"
			};
		}
		if (policy.now - lastTransportActivityAt > policy.staleEventThresholdMs) return {
			healthy: false,
			reason: "stale-socket"
		};
	}
	return {
		healthy: true,
		reason: "healthy"
	};
}
function resolveChannelRestartReason(snapshot, evaluation) {
	if (evaluation.reason === "stale-socket") return "stale-socket";
	if (evaluation.reason === "not-running") return snapshot.reconnectAttempts && snapshot.reconnectAttempts >= 10 ? "gave-up" : "stopped";
	if (evaluation.reason === "disconnected") return "disconnected";
	return "stuck";
}
//#endregion
//#region src/gateway/channel-health-monitor.ts
const log$1 = createSubsystemLogger("gateway/health-monitor");
const DEFAULT_CHECK_INTERVAL_MS = 5 * 6e4;
const DEFAULT_MONITOR_STARTUP_GRACE_MS = 6e4;
const DEFAULT_COOLDOWN_CYCLES = 2;
const DEFAULT_MAX_RESTARTS_PER_HOUR = 10;
const ONE_HOUR_MS = 60 * 6e4;
function resolveTimingPolicy(deps) {
	return {
		monitorStartupGraceMs: deps.timing?.monitorStartupGraceMs ?? deps.startupGraceMs ?? DEFAULT_MONITOR_STARTUP_GRACE_MS,
		channelConnectGraceMs: deps.timing?.channelConnectGraceMs ?? deps.channelStartupGraceMs ?? 12e4,
		staleEventThresholdMs: deps.timing?.staleEventThresholdMs ?? deps.staleEventThresholdMs ?? 18e5
	};
}
function startChannelHealthMonitor(deps) {
	const { channelManager, checkIntervalMs = DEFAULT_CHECK_INTERVAL_MS, cooldownCycles = DEFAULT_COOLDOWN_CYCLES, maxRestartsPerHour = DEFAULT_MAX_RESTARTS_PER_HOUR, abortSignal } = deps;
	const timing = resolveTimingPolicy(deps);
	const cooldownMs = cooldownCycles * checkIntervalMs;
	const restartRecords = /* @__PURE__ */ new Map();
	const startedAt = Date.now();
	let stopped = false;
	let checkInFlight = false;
	let timer = null;
	const rKey = (channelId, accountId) => `${channelId}:${accountId}`;
	function pruneOldRestarts(record, now) {
		record.restartsThisHour = record.restartsThisHour.filter((r) => now - r.at < ONE_HOUR_MS);
	}
	async function runCheck() {
		if (stopped || checkInFlight) return;
		checkInFlight = true;
		try {
			const now = Date.now();
			if (now - startedAt < timing.monitorStartupGraceMs) return;
			const snapshot = channelManager.getRuntimeSnapshot();
			for (const [channelId, accounts] of Object.entries(snapshot.channelAccounts)) {
				if (!accounts) continue;
				for (const [accountId, status] of Object.entries(accounts)) {
					if (!status) continue;
					if (!channelManager.isHealthMonitorEnabled(channelId, accountId)) continue;
					if (channelManager.isManuallyStopped(channelId, accountId)) continue;
					const health = evaluateChannelHealth(status, {
						channelId,
						now,
						staleEventThresholdMs: timing.staleEventThresholdMs,
						channelConnectGraceMs: timing.channelConnectGraceMs
					});
					if (health.healthy) continue;
					const key = rKey(channelId, accountId);
					const record = restartRecords.get(key) ?? {
						lastRestartAt: 0,
						restartsThisHour: []
					};
					if (now - record.lastRestartAt <= cooldownMs) continue;
					pruneOldRestarts(record, now);
					if (record.restartsThisHour.length >= maxRestartsPerHour) {
						log$1.warn?.(`[${channelId}:${accountId}] health-monitor: hit ${maxRestartsPerHour} restarts/hour limit, skipping`);
						continue;
					}
					const reason = resolveChannelRestartReason(status, health);
					log$1.info?.(`[${channelId}:${accountId}] health-monitor: restarting (reason: ${reason})`);
					record.lastRestartAt = now;
					record.restartsThisHour.push({ at: now });
					restartRecords.set(key, record);
					try {
						if (status.running) await channelManager.stopChannel(channelId, accountId);
						channelManager.resetRestartAttempts(channelId, accountId);
						await channelManager.startChannel(channelId, accountId);
					} catch (err) {
						log$1.error?.(`[${channelId}:${accountId}] health-monitor: restart failed: ${String(err)}`);
					}
				}
			}
		} finally {
			checkInFlight = false;
		}
	}
	function stop() {
		stopped = true;
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}
	if (abortSignal?.aborted) stopped = true;
	else {
		abortSignal?.addEventListener("abort", stop, { once: true });
		timer = setInterval(() => void runCheck(), checkIntervalMs);
		if (typeof timer === "object" && "unref" in timer) timer.unref();
		log$1.info?.(`started (interval: ${Math.round(checkIntervalMs / 1e3)}s, startup-grace: ${Math.round(timing.monitorStartupGraceMs / 1e3)}s, channel-connect-grace: ${Math.round(timing.channelConnectGraceMs / 1e3)}s)`);
	}
	return { stop };
}
//#endregion
//#region src/gateway/server-runtime-services.ts
function createNoopHeartbeatRunner() {
	return {
		stop: () => {},
		updateConfig: (_cfg) => {}
	};
}
function startGatewayChannelHealthMonitor(params) {
	const healthCheckMinutes = params.cfg.gateway?.channelHealthCheckMinutes;
	if (healthCheckMinutes === 0) return null;
	const staleEventThresholdMinutes = params.cfg.gateway?.channelStaleEventThresholdMinutes;
	const maxRestartsPerHour = params.cfg.gateway?.channelMaxRestartsPerHour;
	return startChannelHealthMonitor({
		channelManager: params.channelManager,
		checkIntervalMs: (healthCheckMinutes ?? 5) * 6e4,
		...staleEventThresholdMinutes != null && { staleEventThresholdMs: staleEventThresholdMinutes * 6e4 },
		...maxRestartsPerHour != null && { maxRestartsPerHour }
	});
}
function startGatewayCronWithLogging(params) {
	params.cron.start().catch((err) => params.logCron.error(`failed to start: ${String(err)}`));
}
function recoverPendingOutboundDeliveries(params) {
	(async () => {
		const { recoverPendingDeliveries } = await import("./delivery-queue-BEN0g1CV.js");
		const { deliverOutboundPayloads } = await import("./deliver-Seh7YM7_.js");
		await recoverPendingDeliveries({
			deliver: deliverOutboundPayloads,
			log: params.log.child("delivery-recovery"),
			cfg: params.cfg
		});
	})().catch((err) => params.log.error(`Delivery recovery failed: ${String(err)}`));
}
function recoverPendingSessionDeliveries(params) {
	setTimeout(() => {
		(async () => {
			const { recoverPendingRestartContinuationDeliveries } = await import("./server-restart-sentinel-Bpny2lZk.js");
			const logRecovery = params.log.child("session-delivery-recovery");
			await recoverPendingRestartContinuationDeliveries({
				deps: params.deps,
				log: logRecovery,
				maxEnqueuedAt: params.maxEnqueuedAt
			});
		})().catch((err) => params.log.error(`Session delivery recovery failed: ${String(err)}`));
	}, 1250).unref?.();
}
function startGatewayRuntimeServices(params) {
	const channelHealthMonitor = startGatewayChannelHealthMonitor({
		cfg: params.cfgAtStart,
		channelManager: params.channelManager
	});
	return {
		heartbeatRunner: createNoopHeartbeatRunner(),
		channelHealthMonitor,
		stopModelPricingRefresh: !params.minimalTestGateway && !isVitestRuntimeEnv() ? startGatewayModelPricingRefresh({
			config: params.cfgAtStart,
			...params.pluginLookUpTable ? { pluginLookUpTable: params.pluginLookUpTable } : {}
		}) : () => {}
	};
}
function activateGatewayScheduledServices(params) {
	if (params.minimalTestGateway) return { heartbeatRunner: createNoopHeartbeatRunner() };
	const heartbeatRunner = startHeartbeatRunner({ cfg: params.cfgAtStart });
	startGatewayCronWithLogging({
		cron: params.cron,
		logCron: params.logCron
	});
	recoverPendingOutboundDeliveries({
		cfg: params.cfgAtStart,
		log: params.log
	});
	recoverPendingSessionDeliveries({
		deps: params.deps,
		log: params.log,
		maxEnqueuedAt: params.sessionDeliveryRecoveryMaxEnqueuedAt
	});
	return { heartbeatRunner };
}
//#endregion
//#region src/gateway/server/hook-client-ip-config.ts
function resolveHookClientIpConfig(cfg) {
	return {
		trustedProxies: cfg.gateway?.trustedProxies,
		allowRealIpFallback: cfg.gateway?.allowRealIpFallback === true
	};
}
//#endregion
//#region src/gateway/server-reload-handlers.ts
const MCP_RUNTIME_RELOAD_DISPOSE_TIMEOUT_MS = 5e3;
const CHANNEL_RELOAD_DEFERRAL_POLL_MS = 500;
const CHANNEL_RELOAD_STILL_PENDING_WARN_MS = 3e4;
async function disposeMcpRuntimesWithTimeout(params) {
	let timer;
	const disposePromise = params.dispose().catch((error) => {
		params.onWarn(`${params.label} failed: ${String(error)}`);
	});
	const timeoutPromise = new Promise((resolve) => {
		timer = setTimeout(() => resolve("timeout"), params.timeoutMs);
		timer.unref?.();
	});
	const result = await Promise.race([disposePromise.then(() => "done"), timeoutPromise]);
	if (timer) clearTimeout(timer);
	if (result === "timeout") params.onWarn(`${params.label} exceeded ${params.timeoutMs}ms; continuing`);
}
function createGatewayReloadHandlers(params) {
	const getActiveCounts = () => {
		const queueSize = getTotalQueueSize();
		const pendingReplies = getTotalPendingReplies();
		const embeddedRuns = getActiveEmbeddedRunCount();
		const activeTasks = getInspectableTaskRegistrySummary().active;
		return {
			queueSize,
			pendingReplies,
			embeddedRuns,
			activeTasks,
			totalActive: queueSize + pendingReplies + embeddedRuns + activeTasks
		};
	};
	const formatActiveDetails = (counts) => {
		const details = [];
		if (counts.queueSize > 0) details.push(`${counts.queueSize} operation(s)`);
		if (counts.pendingReplies > 0) details.push(`${counts.pendingReplies} reply(ies)`);
		if (counts.embeddedRuns > 0) details.push(`${counts.embeddedRuns} embedded run(s)`);
		if (counts.activeTasks > 0) details.push(`${counts.activeTasks} task run(s)`);
		return details;
	};
	const waitForActiveWorkBeforeChannelReload = async (channels, nextConfig) => {
		const initial = getActiveCounts();
		if (initial.totalActive <= 0) return;
		const channelNames = [...channels].join(", ");
		const initialDetails = formatActiveDetails(initial);
		params.logReload.warn(`config change requires channel reload (${channelNames}) — deferring until ${initialDetails.join(", ")} complete`);
		const timeoutMsRaw = nextConfig.gateway?.reload?.deferralTimeoutMs;
		const timeoutMs = typeof timeoutMsRaw === "number" && Number.isFinite(timeoutMsRaw) && timeoutMsRaw > 0 ? Math.max(CHANNEL_RELOAD_DEFERRAL_POLL_MS, Math.floor(timeoutMsRaw)) : void 0;
		const startedAt = Date.now();
		let nextStillPendingAt = startedAt + CHANNEL_RELOAD_STILL_PENDING_WARN_MS;
		while (true) {
			await new Promise((resolve) => {
				setTimeout(resolve, CHANNEL_RELOAD_DEFERRAL_POLL_MS).unref?.();
			});
			const current = getActiveCounts();
			if (current.totalActive <= 0) {
				params.logReload.info("active operations and replies completed; reloading channels now");
				return;
			}
			const elapsedMs = Date.now() - startedAt;
			if (timeoutMs !== void 0 && elapsedMs >= timeoutMs) {
				const remaining = formatActiveDetails(current);
				params.logReload.warn(`channel reload timeout after ${elapsedMs}ms with ${remaining.join(", ")} still active; reloading channels anyway`);
				return;
			}
			if (Date.now() >= nextStillPendingAt) {
				const remaining = formatActiveDetails(current);
				params.logReload.warn(`channel reload still deferred after ${elapsedMs}ms with ${remaining.join(", ")} active`);
				nextStillPendingAt = Date.now() + CHANNEL_RELOAD_STILL_PENDING_WARN_MS;
			}
		}
	};
	const applyHotReload = async (plan, nextConfig) => {
		setGatewaySigusr1RestartPolicy({ allowExternal: isRestartEnabled(nextConfig) });
		const state = params.getState();
		const nextState = { ...state };
		if (plan.changedPaths.some((path) => path === "models" || path.startsWith("models.") || path === "agents.defaults.model" || path.startsWith("agents.defaults.model.") || path === "agents.defaults.models" || path.startsWith("agents.defaults.models."))) resetModelCatalogCache();
		if (plan.reloadHooks) try {
			nextState.hooksConfig = resolveHooksConfig(nextConfig);
		} catch (err) {
			params.logHooks.warn(`hooks config reload failed: ${String(err)}`);
		}
		nextState.hookClientIpConfig = resolveHookClientIpConfig(nextConfig);
		if (plan.restartHeartbeat) nextState.heartbeatRunner.updateConfig(nextConfig);
		resetDirectoryCache();
		if (plan.restartCron) {
			state.cronState.cron.stop();
			nextState.cronState = buildGatewayCronService({
				cfg: nextConfig,
				deps: params.deps,
				broadcast: params.broadcast
			});
			startGatewayCronWithLogging({
				cron: nextState.cronState.cron,
				logCron: params.logCron
			});
		}
		if (plan.restartHealthMonitor) {
			state.channelHealthMonitor?.stop();
			nextState.channelHealthMonitor = params.createHealthMonitor(nextConfig);
		}
		if (plan.disposeMcpRuntimes) await disposeMcpRuntimesWithTimeout({
			dispose: disposeAllSessionMcpRuntimes,
			timeoutMs: MCP_RUNTIME_RELOAD_DISPOSE_TIMEOUT_MS,
			onWarn: params.logReload.warn,
			label: "bundle-mcp runtime disposal during config reload"
		});
		if (plan.restartGmailWatcher) {
			await stopGmailWatcher().catch((err) => {
				params.logHooks.warn(`gmail watcher stop failed during reload: ${String(err)}`);
			});
			await startGmailWatcherWithLogs({
				cfg: nextConfig,
				log: params.logHooks,
				onSkipped: () => params.logHooks.info("skipping gmail watcher restart (OPENCLAW_SKIP_GMAIL_WATCHER=1)")
			});
		}
		if (plan.restartChannels.size > 0) if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS)) params.logChannels.info("skipping channel reload (OPENCLAW_SKIP_CHANNELS=1 or OPENCLAW_SKIP_PROVIDERS=1)");
		else {
			await waitForActiveWorkBeforeChannelReload(plan.restartChannels, nextConfig);
			const restartChannel = async (name) => {
				params.logChannels.info(`restarting ${name} channel`);
				await params.stopChannel(name);
				await params.startChannel(name);
			};
			for (const channel of plan.restartChannels) await restartChannel(channel);
		}
		applyGatewayLaneConcurrency(nextConfig);
		if (plan.hotReasons.length > 0) params.logReload.info(`config hot reload applied (${plan.hotReasons.join(", ")})`);
		else if (plan.noopPaths.length > 0) params.logReload.info(`config change applied (dynamic reads: ${plan.noopPaths.join(", ")})`);
		params.setState(nextState);
	};
	let restartPending = false;
	const requestGatewayRestart = (plan, nextConfig) => {
		setGatewaySigusr1RestartPolicy({ allowExternal: isRestartEnabled(nextConfig) });
		const reasons = plan.restartReasons.length ? plan.restartReasons.join(", ") : plan.changedPaths.join(", ");
		if (process.listenerCount("SIGUSR1") === 0) {
			params.logReload.warn("no SIGUSR1 listener found; restart skipped");
			return false;
		}
		const active = getActiveCounts();
		if (active.totalActive > 0) {
			if (restartPending) {
				params.logReload.info(`config change requires gateway restart (${reasons}) — already waiting for operations to complete`);
				return true;
			}
			restartPending = true;
			const initialDetails = formatActiveDetails(active);
			params.logReload.warn(`config change requires gateway restart (${reasons}) — deferring until ${initialDetails.join(", ")} complete`);
			deferGatewayRestartUntilIdle({
				getPendingCount: () => getActiveCounts().totalActive,
				maxWaitMs: nextConfig.gateway?.reload?.deferralTimeoutMs,
				hooks: {
					onReady: () => {
						restartPending = false;
						params.logReload.info("all operations and replies completed; restarting gateway now");
					},
					onStillPending: (_pending, elapsedMs) => {
						const remaining = formatActiveDetails(getActiveCounts());
						params.logReload.warn(`restart still deferred after ${elapsedMs}ms with ${remaining.join(", ")} active`);
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
			return true;
		}
		params.logReload.warn(`config change requires gateway restart (${reasons})`);
		if (!emitGatewayRestart()) params.logReload.info("gateway restart already scheduled; skipping duplicate signal");
		return true;
	};
	return {
		applyHotReload,
		requestGatewayRestart
	};
}
function startManagedGatewayConfigReloader(params) {
	if (params.minimalTestGateway) return { stop: async () => {} };
	const { applyHotReload, requestGatewayRestart } = createGatewayReloadHandlers({
		deps: params.deps,
		broadcast: params.broadcast,
		getState: params.getState,
		setState: params.setState,
		startChannel: params.startChannel,
		stopChannel: params.stopChannel,
		logHooks: params.logHooks,
		logChannels: params.logChannels,
		logCron: params.logCron,
		logReload: params.logReload,
		createHealthMonitor: (config) => startGatewayChannelHealthMonitor({
			cfg: config,
			channelManager: params.channelManager
		})
	});
	return startGatewayConfigReloader({
		initialConfig: params.initialConfig,
		initialCompareConfig: params.initialCompareConfig,
		initialInternalWriteHash: params.initialInternalWriteHash,
		readSnapshot: params.readSnapshot,
		recoverSnapshot: async (snapshot, reason) => await params.recoverSnapshot({
			snapshot,
			reason: `reload-${reason}`
		}),
		promoteSnapshot: async (snapshot, _reason) => await params.promoteSnapshot(snapshot),
		onRecovered: ({ reason, snapshot, recoveredSnapshot }) => {
			enqueueConfigRecoveryNotice({
				cfg: recoveredSnapshot.config,
				phase: "reload",
				reason: `reload-${reason}`,
				configPath: snapshot.path
			});
		},
		subscribeToWrites: params.subscribeToWrites,
		onHotReload: async (plan, nextConfig) => {
			const previousSharedGatewaySessionGeneration = params.sharedGatewaySessionGenerationState.current;
			const previousSnapshot = getActiveSecretsRuntimeSnapshot();
			const prepared = await params.activateRuntimeSecrets(nextConfig, {
				reason: "reload",
				activate: true
			});
			const nextSharedGatewaySessionGeneration = params.resolveSharedGatewaySessionGenerationForConfig(prepared.config);
			params.sharedGatewaySessionGenerationState.current = nextSharedGatewaySessionGeneration;
			const sharedGatewaySessionGenerationChanged = previousSharedGatewaySessionGeneration !== nextSharedGatewaySessionGeneration;
			if (sharedGatewaySessionGenerationChanged) disconnectStaleSharedGatewayAuthClients({
				clients: params.clients,
				expectedGeneration: nextSharedGatewaySessionGeneration
			});
			try {
				await applyHotReload(plan, prepared.config);
			} catch (err) {
				if (previousSnapshot) activateSecretsRuntimeSnapshot(previousSnapshot);
				else clearSecretsRuntimeSnapshot();
				params.sharedGatewaySessionGenerationState.current = previousSharedGatewaySessionGeneration;
				if (sharedGatewaySessionGenerationChanged) disconnectStaleSharedGatewayAuthClients({
					clients: params.clients,
					expectedGeneration: previousSharedGatewaySessionGeneration
				});
				throw err;
			}
			setCurrentSharedGatewaySessionGeneration(params.sharedGatewaySessionGenerationState, nextSharedGatewaySessionGeneration);
		},
		onRestart: async (plan, nextConfig) => {
			const previousRequiredSharedGatewaySessionGeneration = params.sharedGatewaySessionGenerationState.required;
			const previousSharedGatewaySessionGeneration = params.sharedGatewaySessionGenerationState.current;
			try {
				const prepared = await params.activateRuntimeSecrets(nextConfig, {
					reason: "restart-check",
					activate: false
				});
				const nextSharedGatewaySessionGeneration = params.resolveSharedGatewaySessionGenerationForConfig(prepared.config);
				if (!requestGatewayRestart(plan, nextConfig)) {
					if (previousSharedGatewaySessionGeneration !== nextSharedGatewaySessionGeneration) {
						activateSecretsRuntimeSnapshot(prepared);
						setCurrentSharedGatewaySessionGeneration(params.sharedGatewaySessionGenerationState, nextSharedGatewaySessionGeneration);
						params.sharedGatewaySessionGenerationState.required = null;
						disconnectStaleSharedGatewayAuthClients({
							clients: params.clients,
							expectedGeneration: nextSharedGatewaySessionGeneration
						});
					} else params.sharedGatewaySessionGenerationState.required = null;
					return;
				}
				if (previousSharedGatewaySessionGeneration !== nextSharedGatewaySessionGeneration) {
					params.sharedGatewaySessionGenerationState.required = nextSharedGatewaySessionGeneration;
					disconnectStaleSharedGatewayAuthClients({
						clients: params.clients,
						expectedGeneration: nextSharedGatewaySessionGeneration
					});
				} else params.sharedGatewaySessionGenerationState.required = null;
			} catch (error) {
				params.sharedGatewaySessionGenerationState.required = previousRequiredSharedGatewaySessionGeneration;
				throw error;
			}
		},
		log: {
			info: (msg) => params.logReload.info(msg),
			warn: (msg) => params.logReload.warn(msg),
			error: (msg) => params.logReload.error(msg)
		},
		watchPath: params.watchPath
	});
}
//#endregion
//#region src/gateway/server-request-context.ts
function createGatewayRequestContext(params) {
	return {
		deps: params.deps,
		get cron() {
			return params.runtimeState.cronState.cron;
		},
		get cronStorePath() {
			return params.runtimeState.cronState.storePath;
		},
		getRuntimeConfig: params.getRuntimeConfig,
		execApprovalManager: params.execApprovalManager,
		pluginApprovalManager: params.pluginApprovalManager,
		loadGatewayModelCatalog: params.loadGatewayModelCatalog,
		getHealthCache: params.getHealthCache,
		refreshHealthSnapshot: params.refreshHealthSnapshot,
		logHealth: params.logHealth,
		logGateway: params.logGateway,
		incrementPresenceVersion: params.incrementPresenceVersion,
		getHealthVersion: params.getHealthVersion,
		broadcast: params.broadcast,
		broadcastToConnIds: params.broadcastToConnIds,
		nodeSendToSession: params.nodeSendToSession,
		nodeSendToAllSubscribed: params.nodeSendToAllSubscribed,
		nodeSubscribe: params.nodeSubscribe,
		nodeUnsubscribe: params.nodeUnsubscribe,
		nodeUnsubscribeAll: params.nodeUnsubscribeAll,
		hasConnectedMobileNode: params.hasConnectedMobileNode,
		hasExecApprovalClients: (excludeConnId) => {
			for (const gatewayClient of params.clients) {
				if (excludeConnId && gatewayClient.connId === excludeConnId) continue;
				const scopes = Array.isArray(gatewayClient.connect.scopes) ? gatewayClient.connect.scopes : [];
				if (scopes.includes("operator.admin") || scopes.includes("operator.approvals")) return true;
			}
			return false;
		},
		disconnectClientsForDevice: (deviceId, opts) => {
			for (const gatewayClient of params.clients) {
				if (gatewayClient.connect.device?.id !== deviceId) continue;
				if (opts?.role && gatewayClient.connect.role !== opts.role) continue;
				try {
					gatewayClient.socket.close(4001, "device removed");
				} catch {}
			}
		},
		disconnectClientsUsingSharedGatewayAuth: () => {
			disconnectAllSharedGatewayAuthClients(params.clients);
		},
		enforceSharedGatewayAuthGenerationForConfigWrite: params.enforceSharedGatewayAuthGenerationForConfigWrite,
		nodeRegistry: params.nodeRegistry,
		agentRunSeq: params.agentRunSeq,
		chatAbortControllers: params.chatAbortControllers,
		chatAbortedRuns: params.chatAbortedRuns,
		chatRunBuffers: params.chatRunBuffers,
		chatDeltaSentAt: params.chatDeltaSentAt,
		chatDeltaLastBroadcastLen: params.chatDeltaLastBroadcastLen,
		addChatRun: params.addChatRun,
		removeChatRun: params.removeChatRun,
		subscribeSessionEvents: params.subscribeSessionEvents,
		unsubscribeSessionEvents: params.unsubscribeSessionEvents,
		subscribeSessionMessageEvents: params.subscribeSessionMessageEvents,
		unsubscribeSessionMessageEvents: params.unsubscribeSessionMessageEvents,
		unsubscribeAllSessionEvents: params.unsubscribeAllSessionEvents,
		getSessionEventSubscriberConnIds: params.getSessionEventSubscriberConnIds,
		registerToolEventRecipient: params.registerToolEventRecipient,
		dedupe: params.dedupe,
		wizardSessions: params.wizardSessions,
		findRunningWizard: params.findRunningWizard,
		purgeWizardSession: params.purgeWizardSession,
		getRuntimeSnapshot: params.getRuntimeSnapshot,
		startChannel: params.startChannel,
		stopChannel: params.stopChannel,
		markChannelLoggedOut: params.markChannelLoggedOut,
		wizardRunner: params.wizardRunner,
		broadcastVoiceWakeChanged: params.broadcastVoiceWakeChanged,
		broadcastVoiceWakeRoutingChanged: params.broadcastVoiceWakeRoutingChanged,
		unavailableGatewayMethods: params.unavailableGatewayMethods
	};
}
//#endregion
//#region src/gateway/server-runtime-config.ts
async function resolveGatewayRuntimeConfig(params) {
	const tailscaleModeEarly = (params.tailscale?.mode ?? params.cfg.gateway?.tailscale?.mode) || "off";
	const bindMode = params.bind ?? params.cfg.gateway?.bind ?? (tailscaleModeEarly !== "off" ? "loopback" : defaultGatewayBindMode());
	const customBindHost = params.cfg.gateway?.customBindHost;
	const bindHost = params.host ?? await resolveGatewayBindHost(bindMode, customBindHost);
	if (bindMode === "loopback" && !isLoopbackHost(bindHost)) throw new Error(`gateway bind=loopback resolved to non-loopback host ${bindHost}; refusing fallback to a network bind`);
	if (bindMode === "custom") {
		const configuredCustomBindHost = customBindHost?.trim();
		if (!configuredCustomBindHost) throw new Error("gateway.bind=custom requires gateway.customBindHost");
		if (!isValidIPv4(configuredCustomBindHost)) throw new Error(`gateway.bind=custom requires a valid IPv4 customBindHost (got ${configuredCustomBindHost})`);
		if (bindHost !== configuredCustomBindHost) throw new Error(`gateway bind=custom requested ${configuredCustomBindHost} but resolved ${bindHost}; refusing fallback`);
	}
	const controlUiEnabled = params.controlUiEnabled ?? params.cfg.gateway?.controlUi?.enabled ?? true;
	const openAiChatCompletionsConfig = params.cfg.gateway?.http?.endpoints?.chatCompletions;
	const openAiChatCompletionsEnabled = params.openAiChatCompletionsEnabled ?? openAiChatCompletionsConfig?.enabled ?? false;
	const openResponsesConfig = params.cfg.gateway?.http?.endpoints?.responses;
	const openResponsesEnabled = params.openResponsesEnabled ?? openResponsesConfig?.enabled ?? false;
	const strictTransportSecurityConfig = params.cfg.gateway?.http?.securityHeaders?.strictTransportSecurity;
	const strictTransportSecurityHeader = strictTransportSecurityConfig === false ? void 0 : typeof strictTransportSecurityConfig === "string" && strictTransportSecurityConfig.trim().length > 0 ? strictTransportSecurityConfig.trim() : void 0;
	const controlUiBasePath = normalizeControlUiBasePath(params.cfg.gateway?.controlUi?.basePath);
	const controlUiRootRaw = params.cfg.gateway?.controlUi?.root;
	const controlUiRoot = typeof controlUiRootRaw === "string" && controlUiRootRaw.trim().length > 0 ? controlUiRootRaw.trim() : void 0;
	const tailscaleConfig = mergeGatewayTailscaleConfig(params.cfg.gateway?.tailscale ?? {}, params.tailscale ?? {});
	const tailscaleMode = tailscaleConfig.mode ?? "off";
	const resolvedAuth = resolveGatewayAuth({
		authConfig: params.cfg.gateway?.auth,
		authOverride: params.auth,
		env: process.env,
		tailscaleMode
	});
	const authMode = resolvedAuth.mode;
	const hasToken = typeof resolvedAuth.token === "string" && resolvedAuth.token.trim().length > 0;
	const hasPassword = typeof resolvedAuth.password === "string" && resolvedAuth.password.trim().length > 0;
	const hasSharedSecret = authMode === "token" && hasToken || authMode === "password" && hasPassword;
	const hooksConfig = resolveHooksConfig(params.cfg);
	const canvasHostEnabled = process.env.OPENCLAW_SKIP_CANVAS_HOST !== "1" && params.cfg.canvasHost?.enabled !== false;
	const trustedProxies = params.cfg.gateway?.trustedProxies ?? [];
	const controlUiAllowedOrigins = (params.cfg.gateway?.controlUi?.allowedOrigins ?? []).map((value) => value.trim()).filter(Boolean);
	const dangerouslyAllowHostHeaderOriginFallback = params.cfg.gateway?.controlUi?.dangerouslyAllowHostHeaderOriginFallback === true;
	assertGatewayAuthConfigured(resolvedAuth, params.cfg.gateway?.auth);
	if (tailscaleMode === "funnel" && authMode !== "password") throw new Error("tailscale funnel requires gateway auth mode=password (set gateway.auth.password or OPENCLAW_GATEWAY_PASSWORD)");
	if (tailscaleMode !== "off" && !isLoopbackHost(bindHost)) throw new Error("tailscale serve/funnel requires gateway bind=loopback (127.0.0.1)");
	if (!isLoopbackHost(bindHost) && !hasSharedSecret && authMode !== "trusted-proxy") throw new Error(`refusing to bind gateway to ${bindHost}:${params.port} without auth (set gateway.auth.token/password, or set OPENCLAW_GATEWAY_TOKEN/OPENCLAW_GATEWAY_PASSWORD)`);
	if (controlUiEnabled && !isLoopbackHost(bindHost) && controlUiAllowedOrigins.length === 0 && !dangerouslyAllowHostHeaderOriginFallback) throw new Error("non-loopback Control UI requires gateway.controlUi.allowedOrigins (set explicit origins), or set gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true to use Host-header origin fallback mode");
	if (authMode === "trusted-proxy") {
		if (trustedProxies.length === 0) throw new Error("gateway auth mode=trusted-proxy requires gateway.trustedProxies to be configured with at least one proxy IP");
	}
	return {
		bindHost,
		controlUiEnabled,
		openAiChatCompletionsEnabled,
		openAiChatCompletionsConfig: openAiChatCompletionsConfig ? {
			...openAiChatCompletionsConfig,
			enabled: openAiChatCompletionsEnabled
		} : void 0,
		openResponsesEnabled,
		openResponsesConfig: openResponsesConfig ? {
			...openResponsesConfig,
			enabled: openResponsesEnabled
		} : void 0,
		strictTransportSecurityHeader,
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
  const helperReady = hasHelper();
  statusEl.textContent = "";
  statusEl.appendChild(document.createTextNode("Bridge: "));
  const bridgeStatus = document.createElement("span");
  bridgeStatus.className = helperReady ? "ok" : "bad";
  bridgeStatus.textContent = helperReady ? "ready" : "missing";
  statusEl.appendChild(bridgeStatus);
  statusEl.appendChild(
    document.createTextNode(
      " · iOS=" + (hasIOS() ? "yes" : "no") + " · Android=" + (hasAndroid() ? "yes" : "no"),
    ),
  );

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
function isDisabledByEnv() {
	if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_CANVAS_HOST)) return true;
	if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_CANVAS_HOST)) return true;
	if (process.env.VITEST) return true;
	return false;
}
function normalizeBasePath(rawPath) {
	const normalized = normalizeUrlPath((rawPath ?? "/__openclaw__/canvas").trim() || "/__openclaw__/canvas");
	if (normalized === "/") return "/";
	return normalized.replace(/\/+$/, "");
}
async function prepareCanvasRoot(rootDir) {
	await ensureDir(rootDir);
	const rootReal = await fs$1.realpath(rootDir);
	try {
		const indexPath = path.join(rootReal, "index.html");
		await fs$1.stat(indexPath);
	} catch {
		try {
			await fs$1.writeFile(path.join(rootReal, "index.html"), defaultIndexHTML(), "utf8");
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
function resolveDefaultWatchFactory() {
	const importedWatch = chokidar?.watch;
	if (typeof importedWatch === "function") return importedWatch.bind(chokidar);
	const runtime = createRequire(import.meta.url)("chokidar");
	if (runtime && typeof runtime.watch === "function") return runtime.watch.bind(runtime);
	if (runtime?.default && typeof runtime.default.watch === "function") return runtime.default.watch.bind(runtime.default);
	throw new Error("chokidar.watch unavailable");
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
	const WebSocketServerClass = opts.webSocketServerClass ?? WebSocketServer;
	const wss = liveReload ? new WebSocketServerClass({ noServer: true }) : null;
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
		if (debounce) clearTimeout$1(debounce);
		debounce = setTimeout$1(() => {
			debounce = null;
			broadcastReload();
		}, reloadDebounceMs);
		if (!testMode) debounce.unref?.();
	};
	let watcherClosed = false;
	const watchFactory = opts.watchFactory ?? resolveDefaultWatchFactory();
	const watcher = liveReload ? watchFactory(rootReal, {
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
		if (new URL(req.url ?? "/", "http://localhost").pathname !== "/__openclaw__/ws") return false;
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
			if (url.pathname === "/__openclaw__/ws") {
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
			const opened = await resolveFileWithinRoot(rootReal, urlPath);
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
			const lower = lowercasePreservingWhitespace(realPath);
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
			if (debounce) clearTimeout$1(debounce);
			watcherClosed = true;
			await watcher?.close().catch(() => {});
			for (const ws of sockets) try {
				ws.terminate?.();
			} catch {}
			if (wss) await new Promise((resolve) => wss.close(() => resolve()));
		}
	};
}
//#endregion
//#region src/gateway/server-broadcast.ts
const EVENT_SCOPE_GUARDS = {
	agent: [READ_SCOPE],
	chat: [READ_SCOPE],
	"chat.side_result": [READ_SCOPE],
	cron: [READ_SCOPE],
	health: [],
	"exec.approval.requested": [APPROVALS_SCOPE$1],
	"exec.approval.resolved": [APPROVALS_SCOPE$1],
	heartbeat: [],
	"plugin.approval.requested": [APPROVALS_SCOPE$1],
	"plugin.approval.resolved": [APPROVALS_SCOPE$1],
	presence: [],
	shutdown: [],
	tick: [],
	"talk.mode": [WRITE_SCOPE],
	"update.available": [],
	"voicewake.changed": [READ_SCOPE],
	"voicewake.routing.changed": [READ_SCOPE],
	"device.pair.requested": [PAIRING_SCOPE],
	"device.pair.resolved": [PAIRING_SCOPE],
	"node.pair.requested": [PAIRING_SCOPE],
	"node.pair.resolved": [PAIRING_SCOPE],
	"sessions.changed": [READ_SCOPE],
	"session.message": [READ_SCOPE],
	"session.tool": [READ_SCOPE]
};
const NODE_ALLOWED_EVENTS = new Set(["voicewake.changed", "voicewake.routing.changed"]);
function hasEventScope(client, event) {
	const required = EVENT_SCOPE_GUARDS[event];
	if (!required && event.startsWith("plugin.")) {
		if ((client.connect.role ?? "operator") !== "operator") return false;
		const scopes = Array.isArray(client.connect.scopes) ? client.connect.scopes : [];
		return scopes.includes("operator.write") || scopes.includes("operator.admin");
	}
	if (!required) return false;
	if (required.length === 0) return true;
	const role = client.connect.role ?? "operator";
	if (role !== "operator") return role === "node" && NODE_ALLOWED_EVENTS.has(event);
	const scopes = Array.isArray(client.connect.scopes) ? client.connect.scopes : [];
	if (scopes.includes("operator.admin")) return true;
	if (required.includes("operator.read")) return scopes.includes("operator.read") || scopes.includes("operator.write");
	return required.some((scope) => scopes.includes(scope));
}
function createGatewayBroadcaster(params) {
	const clientSeq = /* @__PURE__ */ new WeakMap();
	const reportedSlowPayloadClients = /* @__PURE__ */ new WeakSet();
	const broadcastInternal = (event, payload, opts, targetConnIds) => {
		if (params.clients.size === 0) return;
		const isTargeted = Boolean(targetConnIds);
		if (shouldLogWs()) {
			const logMeta = {
				event,
				seq: isTargeted ? "targeted" : "per-client",
				clients: params.clients.size,
				targets: targetConnIds ? targetConnIds.size : void 0,
				dropIfSlow: opts?.dropIfSlow,
				presenceVersion: opts?.stateVersion?.presence,
				healthVersion: opts?.stateVersion?.health
			};
			if (event === "agent") Object.assign(logMeta, summarizeAgentEventForWsLog(payload));
			logWs("out", "event", logMeta);
		}
		for (const c of params.clients) {
			if (targetConnIds && !targetConnIds.has(c.connId)) continue;
			if (!hasEventScope(c, event)) continue;
			const nextSeq = (clientSeq.get(c) ?? 0) + 1;
			const slow = c.socket.bufferedAmount > MAX_BUFFERED_BYTES;
			if (!slow) reportedSlowPayloadClients.delete(c);
			else if (!reportedSlowPayloadClients.has(c)) {
				reportedSlowPayloadClients.add(c);
				logRejectedLargePayload({
					surface: "gateway.ws.outbound_buffer",
					bytes: c.socket.bufferedAmount,
					limitBytes: MAX_BUFFERED_BYTES,
					reason: opts?.dropIfSlow ? "ws_send_buffer_drop" : "ws_send_buffer_close"
				});
			}
			if (slow && opts?.dropIfSlow) {
				if (!isTargeted) clientSeq.set(c, nextSeq);
				continue;
			}
			if (slow) {
				try {
					c.socket.close(1008, "slow consumer");
				} catch {}
				continue;
			}
			try {
				const eventSeq = isTargeted ? void 0 : nextSeq;
				if (!isTargeted) clientSeq.set(c, nextSeq);
				const frame = JSON.stringify({
					type: "event",
					event,
					payload,
					seq: eventSeq,
					stateVersion: opts?.stateVersion
				});
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
//#region src/channels/plugins/gateway-auth-bypass.ts
const GATEWAY_AUTH_API_ARTIFACT_BASENAME = "gateway-auth-api.js";
const MISSING_PUBLIC_SURFACE_PREFIX = "Unable to resolve bundled plugin public surface ";
function loadBundledChannelGatewayAuthApi(channelId) {
	try {
		return loadBundledPluginPublicArtifactModuleSync({
			dirName: channelId,
			artifactBasename: GATEWAY_AUTH_API_ARTIFACT_BASENAME
		});
	} catch (error) {
		if (error instanceof Error && error.message.startsWith(MISSING_PUBLIC_SURFACE_PREFIX)) return;
		throw error;
	}
}
function resolveBundledChannelGatewayAuthBypassPaths(params) {
	return (loadBundledChannelGatewayAuthApi(params.channelId)?.resolveGatewayAuthBypassPaths?.({ cfg: params.cfg }) ?? []).flatMap((path) => typeof path === "string" && path.trim() ? [path.trim()] : []);
}
//#endregion
//#region src/gateway/server-http.ts
let identityAvatarModulePromise;
let controlUiModulePromise;
let embeddingsHttpModulePromise;
let managedImageAttachmentsModulePromise;
let modelsHttpModulePromise;
let openAiHttpModulePromise;
let openResponsesHttpModulePromise;
let sessionHistoryHttpModulePromise;
let sessionKillHttpModulePromise;
let toolsInvokeHttpModulePromise;
let voiceClawRealtimeUpgradeModulePromise;
let canvasAuthModulePromise;
let httpAuthUtilsModulePromise;
let pluginRouteRuntimeScopesModulePromise;
function getIdentityAvatarModule() {
	identityAvatarModulePromise ??= import("./identity-avatar-Ac_VOlpV.js");
	return identityAvatarModulePromise;
}
function getControlUiModule() {
	controlUiModulePromise ??= import("./control-ui-DlR60sVA.js");
	return controlUiModulePromise;
}
function getEmbeddingsHttpModule() {
	embeddingsHttpModulePromise ??= import("./embeddings-http-DVJSOk-o.js");
	return embeddingsHttpModulePromise;
}
function getManagedImageAttachmentsModule() {
	managedImageAttachmentsModulePromise ??= import("./managed-image-attachments-D1O_loFe.js");
	return managedImageAttachmentsModulePromise;
}
function getModelsHttpModule() {
	modelsHttpModulePromise ??= import("./models-http-CbCvELub.js");
	return modelsHttpModulePromise;
}
function getOpenAiHttpModule() {
	openAiHttpModulePromise ??= import("./openai-http-6QgYK2D2.js");
	return openAiHttpModulePromise;
}
function getOpenResponsesHttpModule() {
	openResponsesHttpModulePromise ??= import("./openresponses-http-D2SenRnn.js");
	return openResponsesHttpModulePromise;
}
function getSessionHistoryHttpModule() {
	sessionHistoryHttpModulePromise ??= import("./sessions-history-http-COJmYmXo.js");
	return sessionHistoryHttpModulePromise;
}
function getSessionKillHttpModule() {
	sessionKillHttpModulePromise ??= import("./session-kill-http-xuGr7C1R.js");
	return sessionKillHttpModulePromise;
}
function getToolsInvokeHttpModule() {
	toolsInvokeHttpModulePromise ??= import("./tools-invoke-http-CZbfUobj.js");
	return toolsInvokeHttpModulePromise;
}
function getVoiceClawRealtimeUpgradeModule() {
	voiceClawRealtimeUpgradeModulePromise ??= import("./upgrade-C3OOfiJM.js");
	return voiceClawRealtimeUpgradeModulePromise;
}
function getCanvasAuthModule() {
	canvasAuthModulePromise ??= import("./http-auth-CCzc0ksF.js");
	return canvasAuthModulePromise;
}
function getHttpAuthUtilsModule() {
	httpAuthUtilsModulePromise ??= import("./http-auth-utils-DeUopa3f.js");
	return httpAuthUtilsModulePromise;
}
function getPluginRouteRuntimeScopesModule() {
	pluginRouteRuntimeScopesModulePromise ??= import("./plugin-route-runtime-scopes-BPf7FTH8.js");
	return pluginRouteRuntimeScopesModulePromise;
}
const GATEWAY_PROBE_STATUS_BY_PATH = new Map([
	["/health", "live"],
	["/healthz", "live"],
	["/ready", "ready"],
	["/readyz", "ready"]
]);
const pluginGatewayAuthBypassPathsCache = /* @__PURE__ */ new WeakMap();
async function resolvePluginGatewayAuthBypassPaths(configSnapshot) {
	const paths = /* @__PURE__ */ new Set();
	const configuredChannels = configSnapshot.channels;
	if (!configuredChannels || Object.keys(configuredChannels).length === 0) return paths;
	for (const channelId of Object.keys(configuredChannels)) for (const path of resolveBundledChannelGatewayAuthBypassPaths({
		channelId,
		cfg: configSnapshot
	})) paths.add(path);
	return paths;
}
function getCachedPluginGatewayAuthBypassPaths(configSnapshot) {
	const cached = pluginGatewayAuthBypassPathsCache.get(configSnapshot);
	if (cached) return cached;
	const resolved = resolvePluginGatewayAuthBypassPaths(configSnapshot).catch((error) => {
		pluginGatewayAuthBypassPathsCache.delete(configSnapshot);
		throw error;
	});
	pluginGatewayAuthBypassPathsCache.set(configSnapshot, resolved);
	return resolved;
}
function isOpenAiModelsPath(pathname) {
	return pathname === "/v1/models" || pathname.startsWith("/v1/models/");
}
function isEmbeddingsPath(pathname) {
	return pathname === "/v1/embeddings";
}
function isOpenAiChatCompletionsPath(pathname) {
	return pathname === "/v1/chat/completions";
}
function isOpenResponsesPath(pathname) {
	return pathname === "/v1/responses";
}
function isToolsInvokePath(pathname) {
	return pathname === "/tools/invoke";
}
function isSessionKillPath(pathname) {
	return /^\/sessions\/[^/]+\/kill$/.test(pathname);
}
function isSessionHistoryPath(pathname) {
	return /^\/sessions\/[^/]+\/history$/.test(pathname);
}
function isA2uiPath(pathname) {
	return pathname === "/__openclaw__/a2ui" || pathname.startsWith(`/__openclaw__/a2ui/`);
}
function isCanvasPath(pathname) {
	return pathname === "/__openclaw__/a2ui" || pathname.startsWith(`/__openclaw__/a2ui/`) || pathname === "/__openclaw__/canvas" || pathname.startsWith(`/__openclaw__/canvas/`) || pathname === "/__openclaw__/ws";
}
function shouldEnforceDefaultPluginGatewayAuth(pathContext) {
	return pathContext.malformedEncoding || pathContext.decodePassLimitReached || isProtectedPluginRoutePathFromContext(pathContext);
}
async function canRevealReadinessDetails(params) {
	if (isLocalDirectRequest(params.req, params.trustedProxies, params.allowRealIpFallback)) return true;
	if (params.resolvedAuth.mode === "none") return false;
	const { getBearerToken, resolveHttpBrowserOriginPolicy } = await getHttpAuthUtilsModule();
	const bearerToken = getBearerToken(params.req);
	return (await authorizeHttpGatewayConnect({
		auth: params.resolvedAuth,
		connectAuth: bearerToken ? {
			token: bearerToken,
			password: bearerToken
		} : null,
		req: params.req,
		trustedProxies: params.trustedProxies,
		allowRealIpFallback: params.allowRealIpFallback,
		browserOriginPolicy: resolveHttpBrowserOriginPolicy(params.req)
	})).ok;
}
async function handleGatewayProbeRequest(req, res, requestPath, resolvedAuth, trustedProxies, allowRealIpFallback, getReadiness) {
	const status = GATEWAY_PROBE_STATUS_BY_PATH.get(requestPath);
	if (!status) return false;
	const method = (req.method ?? "GET").toUpperCase();
	if (method !== "GET" && method !== "HEAD") {
		res.statusCode = 405;
		res.setHeader("Allow", "GET, HEAD");
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("Method Not Allowed");
		return true;
	}
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.setHeader("Cache-Control", "no-store");
	let statusCode;
	let body;
	if (status === "ready" && getReadiness) {
		const includeDetails = await canRevealReadinessDetails({
			req,
			resolvedAuth,
			trustedProxies,
			allowRealIpFallback
		});
		try {
			const result = getReadiness();
			statusCode = result.ready ? 200 : 503;
			body = JSON.stringify(includeDetails ? result : { ready: result.ready });
		} catch {
			statusCode = 503;
			body = JSON.stringify(includeDetails ? {
				ready: false,
				failing: ["internal"],
				uptimeMs: 0
			} : { ready: false });
		}
	} else {
		statusCode = 200;
		body = JSON.stringify({
			ok: true,
			status
		});
	}
	res.statusCode = statusCode;
	res.end(method === "HEAD" ? void 0 : body);
	return true;
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
function writeUpgradeServiceUnavailable(socket, body) {
	socket.write(`HTTP/1.1 503 Service Unavailable\r
Connection: close\r
Content-Type: text/plain; charset=utf-8\r
Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r
` + body);
}
async function runGatewayHttpRequestStages(stages) {
	for (const stage of stages) try {
		if (await stage.run()) return true;
	} catch (err) {
		if (!stage.continueOnError) throw err;
		console.error(`[gateway-http] stage "${stage.name}" threw — skipping:`, err);
	}
	return false;
}
function buildPluginRequestStages(params) {
	if (!params.handlePluginRequest) return [];
	let pluginGatewayAuthSatisfied = false;
	let pluginGatewayRequestAuth;
	let pluginRequestOperatorScopes;
	return [{
		name: "plugin-auth",
		run: async () => {
			const pathContext = params.pluginPathContext ?? resolvePluginRoutePathContext(params.requestPath);
			if (!(params.shouldEnforcePluginGatewayAuth ?? shouldEnforceDefaultPluginGatewayAuth)(pathContext)) return false;
			if ((await params.getGatewayAuthBypassPaths()).has(params.requestPath)) return false;
			const { authorizeGatewayHttpRequestOrReply } = await getHttpAuthUtilsModule();
			const requestAuth = await authorizeGatewayHttpRequestOrReply({
				req: params.req,
				res: params.res,
				auth: params.resolvedAuth,
				trustedProxies: params.trustedProxies,
				allowRealIpFallback: params.allowRealIpFallback,
				rateLimiter: params.rateLimiter
			});
			if (!requestAuth) return true;
			pluginGatewayAuthSatisfied = true;
			pluginGatewayRequestAuth = requestAuth;
			const { resolvePluginRouteRuntimeOperatorScopes } = await getPluginRouteRuntimeScopesModule();
			pluginRequestOperatorScopes = resolvePluginRouteRuntimeOperatorScopes(params.req, requestAuth);
			return false;
		}
	}, {
		name: "plugin-http",
		continueOnError: true,
		run: () => {
			const pathContext = params.pluginPathContext ?? resolvePluginRoutePathContext(params.requestPath);
			return params.handlePluginRequest?.(params.req, params.res, pathContext, {
				gatewayAuthSatisfied: pluginGatewayAuthSatisfied,
				gatewayRequestAuth: pluginGatewayRequestAuth,
				gatewayRequestOperatorScopes: pluginRequestOperatorScopes
			}) ?? false;
		}
	}];
}
function createGatewayHttpServer(opts) {
	const { canvasHost, clients, controlUiEnabled, controlUiBasePath, controlUiRoot, openAiChatCompletionsEnabled, openAiChatCompletionsConfig, openResponsesEnabled, openResponsesConfig, strictTransportSecurityHeader, handleHooksRequest, handlePluginRequest, shouldEnforcePluginGatewayAuth, resolvedAuth, rateLimiter, getReadiness } = opts;
	const getResolvedAuth = opts.getResolvedAuth ?? (() => resolvedAuth);
	const loadGatewayConfig = opts.getRuntimeConfig ?? getRuntimeConfig;
	const openAiCompatEnabled = openAiChatCompletionsEnabled || openResponsesEnabled;
	const httpServer = opts.tlsOptions ? createServer$1(opts.tlsOptions, (req, res) => {
		handleRequestWithTrace(req, res);
	}) : createServer((req, res) => {
		handleRequestWithTrace(req, res);
	});
	function handleRequestWithTrace(req, res) {
		return runWithDiagnosticTraceContext(createDiagnosticTraceContext(), () => handleRequest(req, res));
	}
	async function handleRequest(req, res) {
		setDefaultSecurityHeaders(res, { strictTransportSecurity: strictTransportSecurityHeader });
		if ((req.headers.upgrade ?? "").toLowerCase() === "websocket") return;
		try {
			const requestPath = new URL(req.url ?? "/", "http://localhost").pathname;
			if (GATEWAY_PROBE_STATUS_BY_PATH.get(requestPath) === "live") {
				await handleGatewayProbeRequest(req, res, requestPath, getResolvedAuth(), [], false, getReadiness);
				return;
			}
			const configSnapshot = loadGatewayConfig();
			const trustedProxies = configSnapshot.gateway?.trustedProxies ?? [];
			const allowRealIpFallback = configSnapshot.gateway?.allowRealIpFallback === true;
			const scopedCanvas = normalizeCanvasScopedUrl(req.url ?? "/");
			if (scopedCanvas.malformedScopedPath) {
				sendGatewayAuthFailure(res, {
					ok: false,
					reason: "unauthorized"
				});
				return;
			}
			if (scopedCanvas.rewrittenUrl) req.url = scopedCanvas.rewrittenUrl;
			const scopedRequestPath = new URL(req.url ?? "/", "http://localhost").pathname;
			const pluginPathContext = handlePluginRequest ? resolvePluginRoutePathContext(scopedRequestPath) : null;
			const resolvedAuth = getResolvedAuth();
			const requestStages = [{
				name: "gateway-probes",
				run: () => handleGatewayProbeRequest(req, res, scopedRequestPath, resolvedAuth, trustedProxies, allowRealIpFallback, getReadiness)
			}, {
				name: "hooks",
				run: () => handleHooksRequest(req, res)
			}];
			if (openAiCompatEnabled && isOpenAiModelsPath(scopedRequestPath)) requestStages.push({
				name: "models",
				run: async () => (await getModelsHttpModule()).handleOpenAiModelsHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (openAiCompatEnabled && isEmbeddingsPath(scopedRequestPath)) requestStages.push({
				name: "embeddings",
				run: async () => (await getEmbeddingsHttpModule()).handleOpenAiEmbeddingsHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (isToolsInvokePath(scopedRequestPath)) requestStages.push({
				name: "tools-invoke",
				run: async () => (await getToolsInvokeHttpModule()).handleToolsInvokeHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (isSessionKillPath(scopedRequestPath)) requestStages.push({
				name: "sessions-kill",
				run: async () => (await getSessionKillHttpModule()).handleSessionKillHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (isSessionHistoryPath(scopedRequestPath)) requestStages.push({
				name: "sessions-history",
				run: async () => (await getSessionHistoryHttpModule()).handleSessionHistoryHttpRequest(req, res, {
					auth: resolvedAuth,
					getResolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (openResponsesEnabled && isOpenResponsesPath(scopedRequestPath)) requestStages.push({
				name: "openresponses",
				run: async () => (await getOpenResponsesHttpModule()).handleOpenResponsesHttpRequest(req, res, {
					auth: resolvedAuth,
					config: openResponsesConfig,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (openAiChatCompletionsEnabled && isOpenAiChatCompletionsPath(scopedRequestPath)) requestStages.push({
				name: "openai",
				run: async () => (await getOpenAiHttpModule()).handleOpenAiHttpRequest(req, res, {
					auth: resolvedAuth,
					config: openAiChatCompletionsConfig,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (canvasHost) {
				requestStages.push({
					name: "canvas-auth",
					run: async () => {
						if (!isCanvasPath(scopedRequestPath)) return false;
						const { authorizeCanvasRequest } = await getCanvasAuthModule();
						const ok = await authorizeCanvasRequest({
							req,
							auth: resolvedAuth,
							trustedProxies,
							allowRealIpFallback,
							clients,
							canvasCapability: scopedCanvas.capability,
							malformedScopedPath: scopedCanvas.malformedScopedPath,
							rateLimiter
						});
						if (!ok.ok) {
							sendGatewayAuthFailure(res, ok);
							return true;
						}
						return false;
					}
				});
				requestStages.push({
					name: "a2ui",
					run: () => isA2uiPath(scopedRequestPath) ? handleA2uiHttpRequest(req, res) : false
				});
				requestStages.push({
					name: "canvas-http",
					run: () => canvasHost.handleHttpRequest(req, res)
				});
			}
			requestStages.push(...buildPluginRequestStages({
				req,
				res,
				requestPath: scopedRequestPath,
				getGatewayAuthBypassPaths: () => getCachedPluginGatewayAuthBypassPaths(configSnapshot),
				pluginPathContext,
				handlePluginRequest,
				shouldEnforcePluginGatewayAuth,
				resolvedAuth,
				trustedProxies,
				allowRealIpFallback,
				rateLimiter
			}));
			requestStages.push({
				name: "chat-managed-image-media",
				run: async () => (await getManagedImageAttachmentsModule()).handleManagedOutgoingImageHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (controlUiEnabled) {
				requestStages.push({
					name: "control-ui-assistant-media",
					run: async () => (await getControlUiModule()).handleControlUiAssistantMediaRequest(req, res, {
						basePath: controlUiBasePath,
						config: configSnapshot,
						agentId: resolveAssistantIdentity({ cfg: configSnapshot }).agentId,
						auth: resolvedAuth,
						trustedProxies,
						allowRealIpFallback,
						rateLimiter
					})
				});
				requestStages.push({
					name: "control-ui-avatar",
					run: async () => {
						const { handleControlUiAvatarRequest } = await getControlUiModule();
						const { resolveAgentAvatar } = await getIdentityAvatarModule();
						return handleControlUiAvatarRequest(req, res, {
							basePath: controlUiBasePath,
							auth: resolvedAuth,
							trustedProxies,
							allowRealIpFallback,
							rateLimiter,
							resolveAvatar: (agentId) => resolveAgentAvatar(configSnapshot, agentId, { includeUiOverride: true })
						});
					}
				});
				requestStages.push({
					name: "control-ui-http",
					run: async () => (await getControlUiModule()).handleControlUiHttpRequest(req, res, {
						basePath: controlUiBasePath,
						config: configSnapshot,
						agentId: resolveAssistantIdentity({ cfg: configSnapshot }).agentId,
						root: controlUiRoot,
						auth: resolvedAuth,
						trustedProxies,
						allowRealIpFallback,
						rateLimiter
					})
				});
			}
			if (await runGatewayHttpRequestStages(requestStages)) return;
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Not Found");
		} catch (err) {
			console.error("[gateway-http] unhandled error in request handler:", err);
			res.statusCode = 500;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Internal Server Error");
		}
	}
	return httpServer;
}
function attachGatewayUpgradeHandler(opts) {
	const { httpServer, wss, canvasHost, clients, preauthConnectionBudget, resolvedAuth, rateLimiter, log } = opts;
	const getResolvedAuth = opts.getResolvedAuth ?? (() => resolvedAuth);
	httpServer.on("upgrade", (req, socket, head) => {
		runWithDiagnosticTraceContext(createDiagnosticTraceContext(), async () => {
			const configSnapshot = getRuntimeConfig();
			const trustedProxies = configSnapshot.gateway?.trustedProxies ?? [];
			const allowRealIpFallback = configSnapshot.gateway?.allowRealIpFallback === true;
			const scopedCanvas = normalizeCanvasScopedUrl(req.url ?? "/");
			if (scopedCanvas.malformedScopedPath) {
				writeUpgradeAuthFailure(socket, {
					ok: false,
					reason: "unauthorized"
				});
				socket.destroy();
				return;
			}
			if (scopedCanvas.rewrittenUrl) req.url = scopedCanvas.rewrittenUrl;
			const resolvedAuth = getResolvedAuth();
			const url = new URL(req.url ?? "/", "http://localhost");
			if (canvasHost) {
				if (url.pathname === "/__openclaw__/ws") {
					const { authorizeCanvasRequest } = await getCanvasAuthModule();
					const ok = await authorizeCanvasRequest({
						req,
						auth: resolvedAuth,
						trustedProxies,
						allowRealIpFallback,
						clients,
						canvasCapability: scopedCanvas.capability,
						malformedScopedPath: scopedCanvas.malformedScopedPath,
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
			const preauthBudgetKey = resolveRequestClientIp(req, trustedProxies, allowRealIpFallback);
			if (url.pathname === "/voiceclaw/realtime") {
				if (!preauthConnectionBudget.acquire(preauthBudgetKey)) {
					writeUpgradeServiceUnavailable(socket, "Too many unauthenticated sockets");
					socket.destroy();
					return;
				}
				let budgetReleased = false;
				const releasePreauthBudget = () => {
					if (budgetReleased) return;
					budgetReleased = true;
					preauthConnectionBudget.release(preauthBudgetKey);
				};
				socket.once("close", releasePreauthBudget);
				try {
					const { handleVoiceClawRealtimeUpgrade } = await getVoiceClawRealtimeUpgradeModule();
					handleVoiceClawRealtimeUpgrade({
						req,
						socket,
						head,
						auth: resolvedAuth,
						config: configSnapshot,
						trustedProxies,
						allowRealIpFallback,
						rateLimiter,
						releasePreauthBudget
					});
					return;
				} catch (err) {
					socket.off("close", releasePreauthBudget);
					releasePreauthBudget();
					socket.destroy();
					throw new Error("VoiceClaw realtime websocket upgrade failed", { cause: err });
				}
			}
			if (wss.listenerCount("connection") === 0) {
				writeUpgradeServiceUnavailable(socket, "Gateway websocket handlers unavailable");
				socket.destroy();
				return;
			}
			if (!preauthConnectionBudget.acquire(preauthBudgetKey)) {
				writeUpgradeServiceUnavailable(socket, "Too many unauthenticated sockets");
				socket.destroy();
				return;
			}
			let budgetTransferred = false;
			const releaseUpgradeBudget = () => {
				if (budgetTransferred) return;
				budgetTransferred = true;
				preauthConnectionBudget.release(preauthBudgetKey);
			};
			socket.once("close", releaseUpgradeBudget);
			try {
				wss.handleUpgrade(req, socket, head, (ws) => {
					ws.__openclawPreauthBudgetKey = preauthBudgetKey;
					wss.emit("connection", ws, req);
					if (Boolean(ws.__openclawPreauthBudgetClaimed)) {
						budgetTransferred = true;
						socket.off("close", releaseUpgradeBudget);
					}
				});
			} catch {
				socket.off("close", releaseUpgradeBudget);
				releaseUpgradeBudget();
				throw new Error("gateway websocket upgrade failed");
			}
		}).catch((err) => {
			const remoteAddress = socket.remoteAddress ?? "unknown";
			const errorMessage = err instanceof Error ? err.message : String(err);
			log?.warn(`ws upgrade error from ${remoteAddress}: ${errorMessage}`);
			socket.destroy();
		});
	});
}
//#endregion
//#region src/gateway/server/http-listen.ts
const EADDRINUSE_MAX_RETRIES = 4;
const EADDRINUSE_RETRY_INTERVAL_MS = 500;
async function closeServerQuietly(httpServer) {
	await new Promise((resolve) => {
		try {
			httpServer.close(() => resolve());
		} catch {
			resolve();
		}
	});
}
async function listenGatewayHttpServer(params) {
	const { httpServer, bindHost, port } = params;
	for (let attempt = 0;; attempt++) try {
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
		return;
	} catch (err) {
		const code = err.code;
		if (code === "EADDRINUSE" && attempt < EADDRINUSE_MAX_RETRIES) {
			await closeServerQuietly(httpServer);
			await sleep(EADDRINUSE_RETRY_INTERVAL_MS);
			continue;
		}
		if (code === "EADDRINUSE") throw new GatewayLockError(`another gateway instance is already listening on ws://${bindHost}:${port}`, err);
		throw new GatewayLockError(`failed to bind gateway socket on ws://${bindHost}:${port}: ${String(err)}`, err);
	}
}
//#endregion
//#region src/gateway/server/preauth-connection-budget.ts
const DEFAULT_MAX_PREAUTH_CONNECTIONS_PER_IP = 32;
const UNKNOWN_CLIENT_IP_BUDGET_KEY = "__openclaw_unknown_client_ip__";
function getMaxPreauthConnectionsPerIpFromEnv(env = process.env) {
	const configured = env.OPENCLAW_MAX_PREAUTH_CONNECTIONS_PER_IP || env.VITEST && env.OPENCLAW_TEST_MAX_PREAUTH_CONNECTIONS_PER_IP;
	if (!configured) return DEFAULT_MAX_PREAUTH_CONNECTIONS_PER_IP;
	const parsed = Number(configured);
	if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_MAX_PREAUTH_CONNECTIONS_PER_IP;
	return Math.max(1, Math.floor(parsed));
}
function createPreauthConnectionBudget(limit = getMaxPreauthConnectionsPerIpFromEnv()) {
	const counts = /* @__PURE__ */ new Map();
	const normalizeBudgetKey = (clientIp) => {
		return clientIp?.trim() || UNKNOWN_CLIENT_IP_BUDGET_KEY;
	};
	return {
		acquire(clientIp) {
			const ip = normalizeBudgetKey(clientIp);
			const next = (counts.get(ip) ?? 0) + 1;
			if (next > limit) return false;
			counts.set(ip, next);
			return true;
		},
		release(clientIp) {
			const ip = normalizeBudgetKey(clientIp);
			const current = counts.get(ip);
			if (current === void 0) return;
			if (current <= 1) {
				counts.delete(ip);
				return;
			}
			counts.set(ip, current - 1);
		}
	};
}
//#endregion
//#region src/gateway/server-runtime-state.ts
async function createGatewayRuntimeState(params) {
	pinActivePluginHttpRouteRegistry(params.pluginRegistry);
	if (params.pinChannelRegistry !== false) pinActivePluginChannelRegistry(params.pluginRegistry);
	else releasePinnedPluginChannelRegistry();
	try {
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
		let loadedHooksRequestHandler = null;
		const handleHooksRequest = async (req, res) => {
			const hooksConfig = params.hooksConfig();
			if (!hooksConfig) return false;
			const url = new URL(req.url ?? "/", "http://localhost");
			const basePath = hooksConfig.basePath;
			if (url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`)) return false;
			if (!loadedHooksRequestHandler) {
				const { createGatewayHooksRequestHandler } = await import("./hooks-COIkRjXk.js");
				loadedHooksRequestHandler = createGatewayHooksRequestHandler({
					deps: params.deps,
					getHooksConfig: params.hooksConfig,
					getClientIpConfig: params.getHookClientIpConfig,
					bindHost: params.bindHost,
					port: params.port,
					logHooks: params.logHooks
				});
			}
			return await loadedHooksRequestHandler(req, res);
		};
		let loadedPluginRequestHandler = null;
		const handlePluginRequest = async (req, res, pathContext, dispatchContext) => {
			if ((resolveActivePluginHttpRouteRegistry(params.pluginRegistry).httpRoutes ?? []).length === 0) return false;
			if (!loadedPluginRequestHandler) {
				const { createGatewayPluginRequestHandler } = await import("./plugins-http-CKD1bZ83.js");
				loadedPluginRequestHandler = createGatewayPluginRequestHandler({
					registry: params.pluginRegistry,
					log: params.logPlugins
				});
			}
			return await loadedPluginRequestHandler(req, res, pathContext, dispatchContext);
		};
		const shouldEnforcePluginGatewayAuth = (pathContext) => {
			return shouldEnforceGatewayAuthForPluginPath(resolveActivePluginHttpRouteRegistry(params.pluginRegistry), pathContext);
		};
		const bindHosts = await resolveGatewayListenHosts(params.bindHost);
		if (!isLoopbackHost(params.bindHost)) params.log.warn("⚠️  Gateway is binding to a non-loopback address. Ensure authentication is configured before exposing to public networks.");
		if (params.cfg.gateway?.controlUi?.dangerouslyAllowHostHeaderOriginFallback === true) params.log.warn("⚠️  gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true is enabled. Host-header origin fallback weakens origin checks and should only be used as break-glass.");
		const wss = new WebSocketServer({
			noServer: true,
			maxPayload: MAX_PREAUTH_PAYLOAD_BYTES
		});
		const preauthConnectionBudget = createPreauthConnectionBudget();
		const httpServers = [];
		const httpBindHosts = [];
		for (const _host of bindHosts) {
			const httpServer = createGatewayHttpServer({
				canvasHost,
				clients,
				controlUiEnabled: params.controlUiEnabled,
				controlUiBasePath: params.controlUiBasePath,
				controlUiRoot: params.controlUiRoot,
				openAiChatCompletionsEnabled: params.openAiChatCompletionsEnabled,
				openAiChatCompletionsConfig: params.openAiChatCompletionsConfig,
				openResponsesEnabled: params.openResponsesEnabled,
				openResponsesConfig: params.openResponsesConfig,
				strictTransportSecurityHeader: params.strictTransportSecurityHeader,
				handleHooksRequest,
				handlePluginRequest,
				shouldEnforcePluginGatewayAuth,
				resolvedAuth: params.resolvedAuth,
				getResolvedAuth: params.getResolvedAuth,
				rateLimiter: params.rateLimiter,
				getReadiness: params.getReadiness,
				tlsOptions: params.gatewayTls?.enabled ? params.gatewayTls.tlsOptions : void 0
			});
			attachGatewayUpgradeHandler({
				httpServer,
				wss,
				canvasHost,
				clients,
				preauthConnectionBudget,
				resolvedAuth: params.resolvedAuth,
				getResolvedAuth: params.getResolvedAuth,
				rateLimiter: params.rateLimiter,
				log: params.log
			});
			httpServers.push(httpServer);
		}
		const httpServer = httpServers[0];
		if (!httpServer) throw new Error("Gateway HTTP server failed to start");
		let startListeningPromise = null;
		const startListening = async () => {
			if (startListeningPromise) {
				await startListeningPromise;
				return;
			}
			startListeningPromise = (async () => {
				for (const [index, host] of bindHosts.entries()) {
					const server = httpServers[index];
					if (!server) throw new Error(`Missing gateway HTTP server for bind host ${host}`);
					try {
						await listenGatewayHttpServer({
							httpServer: server,
							bindHost: host,
							port: params.port
						});
						httpBindHosts.push(host);
					} catch (err) {
						if (host === bindHosts[0]) throw err;
						params.log.warn(`gateway: failed to bind loopback alias ${host}:${params.port} (${String(err)})`);
					}
				}
				if (httpBindHosts.length === 0) throw new Error("Gateway HTTP server failed to start");
			})();
			try {
				await startListeningPromise;
			} catch (err) {
				startListeningPromise = null;
				throw err;
			}
		};
		const agentRunSeq = /* @__PURE__ */ new Map();
		const dedupe = /* @__PURE__ */ new Map();
		const chatRunState = createChatRunState();
		const chatRunRegistry = chatRunState.registry;
		const chatRunBuffers = chatRunState.buffers;
		const chatDeltaSentAt = chatRunState.deltaSentAt;
		const chatDeltaLastBroadcastLen = chatRunState.deltaLastBroadcastLen;
		const addChatRun = chatRunRegistry.add;
		const removeChatRun = chatRunRegistry.remove;
		const chatAbortControllers = /* @__PURE__ */ new Map();
		const toolEventRecipients = createToolEventRecipientRegistry();
		return {
			canvasHost,
			releasePluginRouteRegistry: () => {
				releasePinnedPluginHttpRouteRegistry(params.pluginRegistry);
				releasePinnedPluginChannelRegistry();
			},
			httpServer,
			httpServers,
			httpBindHosts,
			startListening,
			wss,
			preauthConnectionBudget,
			clients,
			broadcast,
			broadcastToConnIds,
			agentRunSeq,
			dedupe,
			chatRunState,
			chatRunBuffers,
			chatDeltaSentAt,
			chatDeltaLastBroadcastLen,
			addChatRun,
			removeChatRun,
			chatAbortControllers,
			toolEventRecipients
		};
	} catch (err) {
		releasePinnedPluginHttpRouteRegistry(params.pluginRegistry);
		releasePinnedPluginChannelRegistry();
		throw err;
	}
}
//#endregion
//#region src/gateway/server-runtime-subscriptions.ts
function startGatewayEventSubscriptions(params) {
	let agentEventHandlerPromise = null;
	const getAgentEventHandler = () => {
		agentEventHandlerPromise ??= import("./server-chat-D9Ba8S2j.js").then(({ createAgentEventHandler }) => createAgentEventHandler({
			broadcast: params.broadcast,
			broadcastToConnIds: params.broadcastToConnIds,
			nodeSendToSession: params.nodeSendToSession,
			agentRunSeq: params.agentRunSeq,
			chatRunState: params.chatRunState,
			resolveSessionKeyForRun: params.resolveSessionKeyForRun,
			clearAgentRunContext: params.clearAgentRunContext,
			toolEventRecipients: params.toolEventRecipients,
			sessionEventSubscribers: params.sessionEventSubscribers,
			isChatSendRunActive: (runId) => {
				const entry = params.chatAbortControllers.get(runId);
				return entry !== void 0 && entry.kind !== "agent";
			}
		}));
		return agentEventHandlerPromise;
	};
	let transcriptUpdateHandlerPromise = null;
	const getTranscriptUpdateHandler = () => {
		transcriptUpdateHandlerPromise ??= import("./server-session-events-DSN87FpH.js").then(({ createTranscriptUpdateBroadcastHandler }) => createTranscriptUpdateBroadcastHandler({
			broadcastToConnIds: params.broadcastToConnIds,
			sessionEventSubscribers: params.sessionEventSubscribers,
			sessionMessageSubscribers: params.sessionMessageSubscribers
		}));
		return transcriptUpdateHandlerPromise;
	};
	let lifecycleEventHandlerPromise = null;
	const getLifecycleEventHandler = () => {
		lifecycleEventHandlerPromise ??= import("./server-session-events-DSN87FpH.js").then(({ createLifecycleEventBroadcastHandler }) => createLifecycleEventBroadcastHandler({
			broadcastToConnIds: params.broadcastToConnIds,
			sessionEventSubscribers: params.sessionEventSubscribers
		}));
		return lifecycleEventHandlerPromise;
	};
	return {
		agentUnsub: onAgentEvent((evt) => {
			getAgentEventHandler().then((handler) => handler(evt));
		}),
		heartbeatUnsub: onHeartbeatEvent((evt) => {
			params.broadcast("heartbeat", evt, { dropIfSlow: true });
		}),
		transcriptUnsub: onSessionTranscriptUpdate((evt) => {
			getTranscriptUpdateHandler().then((handler) => handler(evt));
		}),
		lifecycleUnsub: onSessionLifecycleEvent((evt) => {
			getLifecycleEventHandler().then((handler) => handler(evt));
		})
	};
}
//#endregion
//#region src/gateway/server-session-key.ts
const RUN_LOOKUP_CACHE_LIMIT = 256;
const RUN_LOOKUP_MISS_TTL_MS = 1e3;
const resolvedSessionKeyByRunId = /* @__PURE__ */ new Map();
function setResolvedSessionKeyCache(runId, sessionKey) {
	if (!runId) return;
	if (!resolvedSessionKeyByRunId.has(runId) && resolvedSessionKeyByRunId.size >= RUN_LOOKUP_CACHE_LIMIT) {
		const oldest = resolvedSessionKeyByRunId.keys().next().value;
		if (oldest) resolvedSessionKeyByRunId.delete(oldest);
	}
	resolvedSessionKeyByRunId.set(runId, {
		sessionKey,
		expiresAt: sessionKey === null ? Date.now() + RUN_LOOKUP_MISS_TTL_MS : null
	});
}
function resolveSessionKeyForRun(runId) {
	const cached = getAgentRunContext(runId)?.sessionKey;
	if (cached) return cached;
	const cachedLookup = resolvedSessionKeyByRunId.get(runId);
	if (cachedLookup !== void 0) {
		if (cachedLookup.sessionKey !== null) return cachedLookup.sessionKey;
		if ((cachedLookup.expiresAt ?? 0) > Date.now()) return;
		resolvedSessionKeyByRunId.delete(runId);
	}
	const { store } = loadCombinedSessionStoreForGateway(getRuntimeConfig());
	const storeKey = resolvePreferredSessionKeyForSessionIdMatches(Object.entries(store).filter((entry) => entry[1]?.sessionId === runId), runId);
	if (storeKey) {
		const sessionKey = toAgentRequestSessionKey(storeKey) ?? storeKey;
		registerAgentRunContext(runId, { sessionKey });
		setResolvedSessionKeyCache(runId, sessionKey);
		return sessionKey;
	}
	setResolvedSessionKeyCache(runId, null);
}
//#endregion
//#region src/gateway/server-startup-config.ts
const MODEL_PROVIDER_API_PATH_RE = /^models\.providers\.([^.]+)\.api$/;
const MODEL_PROVIDER_MODEL_API_PATH_RE = /^models\.providers\.([^.]+)\.models\.\d+\.api$/;
function resolveInvalidModelProviderApiIssueProviderId(issue) {
	if (!issue.message.startsWith("Invalid option:")) return null;
	return (issue.path.match(MODEL_PROVIDER_API_PATH_RE) ?? issue.path.match(MODEL_PROVIDER_MODEL_API_PATH_RE))?.[1] ?? null;
}
function cloneConfigWithoutModelProviders(config, providerIds) {
	const providers = config.models?.providers;
	if (!providers) return config;
	let changed = false;
	const nextProviders = { ...providers };
	for (const providerId of providerIds) {
		if (!Object.hasOwn(nextProviders, providerId)) continue;
		delete nextProviders[providerId];
		changed = true;
	}
	if (!changed) return config;
	return {
		...config,
		models: {
			...config.models,
			providers: nextProviders
		}
	};
}
function resolveGatewayStartupConfigWithoutInvalidModelProviders(params) {
	if (params.snapshot.valid || params.snapshot.legacyIssues.length > 0) return null;
	const providerIds = /* @__PURE__ */ new Set();
	for (const issue of params.snapshot.issues) {
		const providerId = resolveInvalidModelProviderApiIssueProviderId(issue);
		if (!providerId) return null;
		providerIds.add(providerId);
	}
	if (providerIds.size === 0) return null;
	const validated = validateConfigObjectWithPlugins(cloneConfigWithoutModelProviders(params.snapshot.sourceConfig, providerIds));
	if (!validated.ok) return null;
	const runtimeConfig = materializeRuntimeConfig(validated.config, "load");
	for (const providerId of providerIds) params.log.warn(`gateway: skipped model provider ${providerId}; configured provider api is invalid. Run "openclaw doctor --fix" to repair the config.`);
	return {
		...params.snapshot,
		sourceConfig: asResolvedSourceConfig(validated.config),
		resolved: asResolvedSourceConfig(validated.config),
		valid: true,
		runtimeConfig,
		config: runtimeConfig,
		issues: [],
		warnings: validated.warnings
	};
}
function resolveGatewayStartupConfigWithoutInvalidPluginEntries(params) {
	if (!isPluginLocalInvalidConfigSnapshot(params.snapshot)) return null;
	const validated = validateConfigObjectWithPlugins(params.snapshot.sourceConfig, { pluginValidation: "skip" });
	if (!validated.ok) return null;
	const runtimeConfig = materializeRuntimeConfig(validated.config, "load");
	for (const issue of params.snapshot.issues) params.log.warn(`gateway: skipped plugin config validation issue at ${issue.path}: ${issue.message}. Run "openclaw doctor --fix" to quarantine the plugin config.`);
	return {
		...params.snapshot,
		sourceConfig: asResolvedSourceConfig(validated.config),
		resolved: asResolvedSourceConfig(validated.config),
		valid: true,
		runtimeConfig,
		config: runtimeConfig,
		issues: [],
		warnings: [...params.snapshot.warnings, ...params.snapshot.issues]
	};
}
async function loadGatewayStartupConfigSnapshot(params) {
	const measure = params.measure ?? (async (_name, run) => await run());
	let snapshotRead = await measure("config.snapshot.read", () => readConfigFileSnapshotWithPluginMetadata({ measure }));
	let configSnapshot = snapshotRead.snapshot;
	let pluginMetadataSnapshot = snapshotRead.pluginMetadataSnapshot;
	let wroteConfig = false;
	let degradedStartupConfig = false;
	let degradedPluginConfig = false;
	if (configSnapshot.legacyIssues.length > 0 && isNixMode) throw new Error("Legacy config entries detected while running in Nix mode. Update your Nix config to the latest schema and restart.");
	if (configSnapshot.exists) {
		if (!configSnapshot.valid) {
			const providerApiPrunedSnapshot = resolveGatewayStartupConfigWithoutInvalidModelProviders({
				snapshot: configSnapshot,
				log: params.log
			});
			if (providerApiPrunedSnapshot) {
				degradedStartupConfig = true;
				configSnapshot = providerApiPrunedSnapshot;
			}
		}
		if (!configSnapshot.valid) {
			const pluginConfigDegradedSnapshot = resolveGatewayStartupConfigWithoutInvalidPluginEntries({
				snapshot: configSnapshot,
				log: params.log
			});
			if (pluginConfigDegradedSnapshot) {
				degradedPluginConfig = true;
				configSnapshot = pluginConfigDegradedSnapshot;
			}
		}
		if (!configSnapshot.valid) {
			const canRecoverFromLastKnownGood = shouldAttemptLastKnownGoodRecovery(configSnapshot);
			const recovered = canRecoverFromLastKnownGood ? await recoverConfigFromLastKnownGood({
				snapshot: configSnapshot,
				reason: "startup-invalid-config"
			}) : false;
			if (!canRecoverFromLastKnownGood) params.log.warn(`gateway: last-known-good recovery skipped for plugin-local config invalidity: ${configSnapshot.path}`);
			if (recovered) {
				wroteConfig = true;
				params.log.warn(`gateway: invalid config was restored from last-known-good backup: ${configSnapshot.path}`);
				snapshotRead = await measure("config.snapshot.recovery-read", () => readConfigFileSnapshotWithPluginMetadata({ measure }));
				configSnapshot = snapshotRead.snapshot;
				pluginMetadataSnapshot = snapshotRead.pluginMetadataSnapshot;
				if (configSnapshot.valid) enqueueConfigRecoveryNotice({
					cfg: configSnapshot.config,
					phase: "startup",
					reason: "startup-invalid-config",
					configPath: configSnapshot.path
				});
			}
			if (!recovered && await recoverConfigFromJsonRootSuffix(configSnapshot)) {
				wroteConfig = true;
				params.log.warn(`gateway: invalid config was repaired by stripping a non-JSON prefix: ${configSnapshot.path}`);
				snapshotRead = await measure("config.snapshot.prefix-recovery-read", () => readConfigFileSnapshotWithPluginMetadata({ measure }));
				configSnapshot = snapshotRead.snapshot;
				pluginMetadataSnapshot = snapshotRead.pluginMetadataSnapshot;
			}
		}
		assertValidGatewayStartupConfigSnapshot(configSnapshot, { includeDoctorHint: true });
	}
	const autoEnable = params.minimalTestGateway || degradedStartupConfig || degradedPluginConfig ? {
		config: configSnapshot.config,
		changes: []
	} : await measure("config.snapshot.auto-enable", () => applyPluginAutoEnable({
		config: configSnapshot.sourceConfig,
		env: process.env,
		...pluginMetadataSnapshot?.manifestRegistry ? { manifestRegistry: pluginMetadataSnapshot.manifestRegistry } : {}
	}));
	if (autoEnable.changes.length === 0) return {
		snapshot: configSnapshot,
		wroteConfig,
		...pluginMetadataSnapshot ? { pluginMetadataSnapshot } : {},
		...degradedStartupConfig ? { degradedProviderApi: true } : {},
		...degradedPluginConfig ? { degradedPluginConfig: true } : {}
	};
	try {
		await replaceConfigFile({
			nextConfig: autoEnable.config,
			afterWrite: { mode: "auto" }
		});
		wroteConfig = true;
		snapshotRead = await measure("config.snapshot.auto-enable-read", () => readConfigFileSnapshotWithPluginMetadata({ measure }));
		configSnapshot = snapshotRead.snapshot;
		pluginMetadataSnapshot = snapshotRead.pluginMetadataSnapshot;
		assertValidGatewayStartupConfigSnapshot(configSnapshot);
		params.log.info(`gateway: auto-enabled plugins:\n${autoEnable.changes.map((entry) => `- ${entry}`).join("\n")}`);
	} catch (err) {
		params.log.warn(`gateway: failed to persist plugin auto-enable changes: ${String(err)}`);
	}
	return {
		snapshot: configSnapshot,
		wroteConfig,
		...pluginMetadataSnapshot ? { pluginMetadataSnapshot } : {},
		...degradedStartupConfig ? { degradedProviderApi: true } : {},
		...degradedPluginConfig ? { degradedPluginConfig: true } : {}
	};
}
function createRuntimeSecretsActivator(params) {
	let secretsDegraded = false;
	let secretsActivationTail = Promise.resolve();
	const prepareRuntimeSecretsSnapshot = params.prepareRuntimeSecretsSnapshot ?? prepareSecretsRuntimeSnapshot;
	const activateRuntimeSecretsSnapshot = params.activateRuntimeSecretsSnapshot ?? activateSecretsRuntimeSnapshot;
	const runWithSecretsActivationLock = async (operation) => {
		const run = secretsActivationTail.then(operation, operation);
		secretsActivationTail = run.then(() => void 0, () => void 0);
		return await run;
	};
	return async (config, activationParams) => await runWithSecretsActivationLock(async () => {
		try {
			const prepared = await prepareRuntimeSecretsSnapshot({ config: pruneSkippedStartupSecretSurfaces(config) });
			assertRuntimeGatewayAuthNotKnownWeak(prepared.config);
			if (activationParams.activate) {
				activateRuntimeSecretsSnapshot(prepared);
				logGatewayAuthSurfaceDiagnostics(prepared, params.logSecrets);
			}
			for (const warning of prepared.warnings) params.logSecrets.warn(`[${warning.code}] ${warning.message}`);
			if (secretsDegraded) {
				const recoveredMessage = "Secret resolution recovered; runtime remained on last-known-good during the outage.";
				params.logSecrets.info(`[SECRETS_RELOADER_RECOVERED] ${recoveredMessage}`);
				params.emitStateEvent("SECRETS_RELOADER_RECOVERED", recoveredMessage, prepared.config);
			}
			secretsDegraded = false;
			return prepared;
		} catch (err) {
			const details = String(err);
			if (!secretsDegraded) {
				params.logSecrets.error?.(`[SECRETS_RELOADER_DEGRADED] ${details}`);
				if (activationParams.reason !== "startup") params.emitStateEvent("SECRETS_RELOADER_DEGRADED", `Secret resolution failed; runtime remains on last-known-good snapshot. ${details}`, config);
			} else params.logSecrets.warn(`[SECRETS_RELOADER_DEGRADED] ${details}`);
			secretsDegraded = true;
			if (activationParams.reason === "startup") throw new Error(`Startup failed: required secrets are unavailable. ${details}`, { cause: err });
			throw err;
		}
	});
}
function assertValidGatewayStartupConfigSnapshot(snapshot, options = {}) {
	if (snapshot.valid) return;
	const issues = snapshot.issues.length > 0 ? formatConfigIssueLines(snapshot.issues, "", { normalizeRoot: true }).join("\n") : "Unknown validation issue.";
	const doctorHint = options.includeDoctorHint ? `\nRun "${formatCliCommand("openclaw doctor --fix")}" to repair, then retry.` : "";
	throw new Error(`Invalid config at ${snapshot.path}.\n${issues}${doctorHint}`);
}
async function prepareGatewayStartupConfig(params) {
	assertValidGatewayStartupConfigSnapshot(params.configSnapshot);
	const runtimeConfig = applyConfigOverrides(params.configSnapshot.config);
	const startupPreflightConfig = applyGatewayAuthOverridesForStartupPreflight(runtimeConfig, {
		auth: params.authOverride,
		tailscale: params.tailscaleOverride
	});
	const preflightConfig = hasActiveGatewayAuthSecretRef(startupPreflightConfig) ? (await params.activateRuntimeSecrets(startupPreflightConfig, {
		reason: "startup",
		activate: false
	})).config : startupPreflightConfig;
	const preflightAuthOverride = typeof preflightConfig.gateway?.auth?.token === "string" || typeof preflightConfig.gateway?.auth?.password === "string" ? {
		...params.authOverride,
		...typeof preflightConfig.gateway?.auth?.token === "string" ? { token: preflightConfig.gateway.auth.token } : {},
		...typeof preflightConfig.gateway?.auth?.password === "string" ? { password: preflightConfig.gateway.auth.password } : {}
	} : params.authOverride;
	const authBootstrap = await ensureGatewayStartupAuth({
		cfg: runtimeConfig,
		env: process.env,
		authOverride: preflightAuthOverride,
		tailscaleOverride: params.tailscaleOverride,
		persist: params.persistStartupAuth ?? true,
		baseHash: params.configSnapshot.hash
	});
	const runtimeStartupConfig = applyGatewayAuthOverridesForStartupPreflight(authBootstrap.cfg, {
		auth: params.authOverride,
		tailscale: params.tailscaleOverride
	});
	const activatedConfig = (await params.activateRuntimeSecrets(runtimeStartupConfig, {
		reason: "startup",
		activate: true
	})).config;
	return {
		...authBootstrap,
		cfg: activatedConfig
	};
}
function hasActiveGatewayAuthSecretRef(config) {
	const states = evaluateGatewayAuthSurfaceStates({
		config,
		defaults: config.secrets?.defaults,
		env: process.env
	});
	return GATEWAY_AUTH_SURFACE_PATHS.some((path) => {
		const state = states[path];
		return state.hasSecretRef && state.active;
	});
}
function pruneSkippedStartupSecretSurfaces(config) {
	if (!(isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS)) || !config.channels) return config;
	return {
		...config,
		channels: void 0
	};
}
function assertRuntimeGatewayAuthNotKnownWeak(config) {
	assertGatewayAuthNotKnownWeak(resolveGatewayAuth({
		authConfig: config.gateway?.auth,
		env: process.env,
		tailscaleMode: config.gateway?.tailscale?.mode ?? "off"
	}));
}
function logGatewayAuthSurfaceDiagnostics(prepared, logSecrets) {
	const states = evaluateGatewayAuthSurfaceStates({
		config: prepared.sourceConfig,
		defaults: prepared.sourceConfig.secrets?.defaults,
		env: process.env
	});
	const inactiveWarnings = /* @__PURE__ */ new Map();
	for (const warning of prepared.warnings) {
		if (warning.code !== "SECRETS_REF_IGNORED_INACTIVE_SURFACE") continue;
		inactiveWarnings.set(warning.path, warning.message);
	}
	for (const path of GATEWAY_AUTH_SURFACE_PATHS) {
		const state = states[path];
		if (!state.hasSecretRef) continue;
		const stateLabel = state.active ? "active" : "inactive";
		const details = (!state.active && inactiveWarnings.get(path) ? inactiveWarnings.get(path) : void 0) ?? state.reason;
		logSecrets.info(`[SECRETS_GATEWAY_AUTH_SURFACE] ${path} is ${stateLabel}. ${details}`);
	}
}
function applyGatewayAuthOverridesForStartupPreflight(config, overrides) {
	if (!overrides.auth && !overrides.tailscale) return config;
	return {
		...config,
		gateway: {
			...config.gateway,
			auth: mergeGatewayAuthConfig(config.gateway?.auth, overrides.auth),
			tailscale: mergeGatewayTailscaleConfig(config.gateway?.tailscale, overrides.tailscale)
		}
	};
}
//#endregion
//#region src/gateway/server-startup-session-migration.ts
/**
* Run orphan-key session migration at gateway startup.
*
* Idempotent and best-effort: if the migration fails, gateway startup
* continues normally. This ensures accumulated orphaned session keys
* (from the write-path bug #29683) are cleaned up automatically on
* upgrade rather than requiring a manual `openclaw doctor` run.
*/
async function runStartupSessionMigration(params) {
	const migrate = params.deps?.migrateOrphanedSessionKeys ?? migrateOrphanedSessionKeys;
	try {
		const result = await migrate({
			cfg: params.cfg,
			env: params.env ?? process.env
		});
		if (result.changes.length > 0) params.log.info(`gateway: canonicalized orphaned session keys:\n${result.changes.map((c) => `- ${c}`).join("\n")}`);
		if (result.warnings.length > 0) params.log.warn(`gateway: session key migration warnings:\n${result.warnings.map((w) => `- ${w}`).join("\n")}`);
	} catch (err) {
		params.log.warn(`gateway: orphaned session key migration failed during startup; continuing: ${String(err)}`);
	}
}
//#endregion
//#region src/gateway/server-startup-plugins.ts
async function prestageGatewayBundledRuntimeDeps(params) {
	if (params.pluginIds.length === 0) return;
	const packageRoot = resolveOpenClawPackageRootSync({
		argv1: process.argv[1],
		cwd: process.cwd(),
		moduleUrl: import.meta.url
	});
	if (!packageRoot) return;
	let scanResult;
	try {
		scanResult = scanBundledPluginRuntimeDeps({
			packageRoot,
			config: params.cfg,
			selectedPluginIds: [...params.pluginIds],
			env: process.env
		});
	} catch (error) {
		params.log.warn(`[plugins] failed to scan bundled runtime deps before gateway startup; gateway startup will continue with per-plugin runtime-deps installs: ${String(error)}`);
		return;
	}
	const { deps, missing, conflicts } = scanResult;
	if (conflicts.length > 0) params.log.warn(`[plugins] bundled runtime deps have version conflicts: ${conflicts.map((conflict) => `${conflict.name} (${conflict.versions.join(", ")})`).join("; ")}`);
	if (missing.length === 0) return;
	const missingSpecs = missing.map((dep) => `${dep.name}@${dep.version}`);
	const installSpecs = deps.map((dep) => `${dep.name}@${dep.version}`);
	const installRoot = resolveBundledRuntimeDependencyPackageInstallRoot(packageRoot, { env: process.env });
	const startedAt = Date.now();
	params.log.info(`[plugins] staging bundled runtime deps before gateway startup (${missingSpecs.length} missing, ${installSpecs.length} install specs): ${missingSpecs.join(", ")}`);
	try {
		await repairBundledRuntimeDepsInstallRootAsync({
			installRoot,
			missingSpecs,
			installSpecs,
			env: process.env,
			warn: (message) => params.log.warn(`[plugins] ${message}`)
		});
	} catch (error) {
		params.log.warn(`[plugins] failed to stage bundled runtime deps before gateway startup after ${Date.now() - startedAt}ms; gateway startup will continue with per-plugin runtime-deps installs: ${String(error)}`);
		return;
	}
	params.log.info(`[plugins] installed bundled runtime deps before gateway startup in ${Date.now() - startedAt}ms: ${missingSpecs.join(", ")}`);
}
async function prepareGatewayPluginBootstrap(params) {
	const activationSourceConfig = params.activationSourceConfig ?? params.cfgAtStart;
	const startupMaintenanceConfig = params.cfgAtStart.channels === void 0 && params.startupRuntimeConfig.channels !== void 0 ? {
		...params.cfgAtStart,
		channels: params.startupRuntimeConfig.channels
	} : params.cfgAtStart;
	if (!params.minimalTestGateway || startupMaintenanceConfig.channels !== void 0) {
		const startupTasks = [runChannelPluginStartupMaintenance({
			cfg: startupMaintenanceConfig,
			env: process.env,
			log: params.log
		})];
		if (!params.minimalTestGateway) startupTasks.push(runStartupSessionMigration({
			cfg: params.cfgAtStart,
			env: process.env,
			log: params.log
		}));
		await Promise.all(startupTasks);
	}
	initSubagentRegistry();
	const gatewayPluginConfig = params.minimalTestGateway ? params.cfgAtStart : mergeActivationSectionsIntoRuntimeConfig({
		runtimeConfig: params.cfgAtStart,
		activationConfig: applyPluginAutoEnable({
			config: activationSourceConfig,
			env: process.env,
			...params.pluginMetadataSnapshot?.manifestRegistry ? { manifestRegistry: params.pluginMetadataSnapshot.manifestRegistry } : {}
		}).config
	});
	const defaultWorkspaceDir = resolveAgentWorkspaceDir(gatewayPluginConfig, resolveDefaultAgentId(gatewayPluginConfig));
	const pluginLookUpTable = params.minimalTestGateway ? void 0 : loadPluginLookUpTable({
		config: gatewayPluginConfig,
		workspaceDir: defaultWorkspaceDir,
		env: process.env,
		activationSourceConfig,
		metadataSnapshot: params.pluginMetadataSnapshot
	});
	const deferredConfiguredChannelPluginIds = [...pluginLookUpTable?.startup.configuredDeferredChannelPluginIds ?? []];
	const startupPluginIds = [...pluginLookUpTable?.startup.pluginIds ?? []];
	const baseMethods = listGatewayMethods();
	const emptyPluginRegistry = createEmptyPluginRegistry();
	let pluginRegistry = emptyPluginRegistry;
	let baseGatewayMethods = baseMethods;
	if (!params.minimalTestGateway) {
		await prestageGatewayBundledRuntimeDeps({
			cfg: gatewayPluginConfig,
			pluginIds: startupPluginIds,
			log: params.log
		});
		({pluginRegistry, gatewayMethods: baseGatewayMethods} = loadGatewayStartupPlugins({
			cfg: gatewayPluginConfig,
			activationSourceConfig,
			workspaceDir: defaultWorkspaceDir,
			log: params.log,
			coreGatewayMethodNames: baseMethods,
			baseMethods,
			pluginIds: startupPluginIds,
			pluginLookUpTable,
			preferSetupRuntimeForChannelPlugins: deferredConfiguredChannelPluginIds.length > 0,
			suppressPluginInfoLogs: deferredConfiguredChannelPluginIds.length > 0
		}));
	} else {
		pluginRegistry = getActivePluginRegistry() ?? emptyPluginRegistry;
		setActivePluginRegistry(pluginRegistry);
	}
	return {
		gatewayPluginConfigAtStart: gatewayPluginConfig,
		defaultWorkspaceDir,
		deferredConfiguredChannelPluginIds,
		startupPluginIds,
		pluginLookUpTable,
		baseMethods,
		pluginRegistry,
		baseGatewayMethods
	};
}
//#endregion
//#region src/gateway/server-startup-unavailable-methods.ts
const STARTUP_UNAVAILABLE_GATEWAY_METHODS = ["chat.history", "models.list"];
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
	const localDiscoveryEnabled = mdnsMode !== "off" && !isTruthyEnvValue(process.env.OPENCLAW_DISABLE_BONJOUR) && !process.env.VITEST;
	const mdnsMinimal = mdnsMode !== "full";
	const tailscaleEnabled = params.tailscaleMode !== "off";
	const tailnetDns = localDiscoveryEnabled || params.wideAreaDiscoveryEnabled ? await resolveTailnetDnsHint({ enabled: tailscaleEnabled }) : void 0;
	const sshPortEnv = mdnsMinimal ? void 0 : process.env.OPENCLAW_SSH_PORT?.trim();
	const sshPortParsed = sshPortEnv ? Number.parseInt(sshPortEnv, 10) : NaN;
	const sshPort = Number.isFinite(sshPortParsed) && sshPortParsed > 0 ? sshPortParsed : void 0;
	const cliPath = mdnsMinimal ? void 0 : resolveBonjourCliPath();
	if (localDiscoveryEnabled) {
		const stops = [];
		for (const entry of params.gatewayDiscoveryServices ?? []) try {
			const started = await entry.service.advertise({
				machineDisplayName: params.machineDisplayName,
				gatewayPort: params.port,
				gatewayTlsEnabled: params.gatewayTls?.enabled ?? false,
				gatewayTlsFingerprintSha256: params.gatewayTls?.fingerprintSha256,
				canvasPort: params.canvasPort,
				sshPort,
				tailnetDns,
				cliPath,
				minimal: mdnsMinimal
			});
			if (started?.stop) stops.push(started.stop);
		} catch (err) {
			params.logDiscovery.warn(`gateway discovery service failed (${entry.service.id}, plugin=${entry.pluginId}): ${String(err)}`);
		}
		if (stops.length > 0) bonjourStop = async () => {
			for (const stop of stops.toReversed()) try {
				await stop();
			} catch (err) {
				params.logDiscovery.warn(`gateway discovery stop failed: ${String(err)}`);
			}
		};
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
//#region src/gateway/server/health-state.ts
let presenceVersion = 1;
let healthVersion = 1;
let healthCache = null;
let healthRefresh = null;
let sensitiveHealthRefresh = null;
let broadcastHealthUpdate = null;
function buildGatewaySnapshot(opts) {
	const cfg = getRuntimeConfig();
	const defaultAgentId = resolveDefaultAgentId(cfg);
	const mainKey = normalizeMainKey(cfg.session?.mainKey);
	const mainSessionKey = resolveMainSessionKey(cfg);
	const scope = cfg.session?.scope ?? "per-sender";
	const presence = listSystemPresence();
	const uptimeMs = Math.round(process.uptime() * 1e3);
	const updateAvailable = getUpdateAvailable() ?? void 0;
	const snapshot = {
		presence,
		health: {},
		stateVersion: {
			presence: presenceVersion,
			health: healthVersion
		},
		uptimeMs,
		sessionDefaults: {
			defaultAgentId,
			mainKey,
			mainSessionKey,
			scope
		},
		updateAvailable
	};
	if (opts?.includeSensitive === true) {
		const auth = resolveGatewayAuth({
			authConfig: cfg.gateway?.auth,
			env: process.env
		});
		snapshot.configPath = createConfigIO().configPath;
		snapshot.stateDir = STATE_DIR;
		snapshot.authMode = auth.mode;
	}
	return snapshot;
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
	const includeSensitive = opts?.includeSensitive === true;
	let refresh = includeSensitive ? sensitiveHealthRefresh : healthRefresh;
	if (!refresh) {
		refresh = (async () => {
			let runtimeSnapshot;
			try {
				runtimeSnapshot = opts?.getRuntimeSnapshot?.();
			} catch {
				runtimeSnapshot = void 0;
			}
			const snap = await getHealthSnapshot({
				probe: opts?.probe,
				includeSensitive,
				runtimeSnapshot
			});
			if (!includeSensitive) {
				healthCache = snap;
				healthVersion += 1;
				if (broadcastHealthUpdate) broadcastHealthUpdate(snap);
			}
			return snap;
		})().finally(() => {
			if (includeSensitive) sensitiveHealthRefresh = null;
			else healthRefresh = null;
		});
		if (includeSensitive) sensitiveHealthRefresh = refresh;
		else healthRefresh = refresh;
	}
	return refresh;
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
		params.broadcast("tick", payload);
		params.nodeSendToAllSubscribed("tick", payload);
	}, TICK_INTERVAL_MS);
	const healthInterval = setInterval(() => {
		params.refreshGatewayHealthSnapshot({ probe: true }).catch((err) => params.logHealth.error(`refresh failed: ${formatError(err)}`));
	}, HEALTH_REFRESH_INTERVAL_MS);
	params.refreshGatewayHealthSnapshot({ probe: true }).catch((err) => params.logHealth.error(`initial refresh failed: ${formatError(err)}`));
	const dedupeCleanup = setInterval(() => {
		const AGENT_RUN_SEQ_MAX = 1e4;
		const now = Date.now();
		for (const [k, v] of params.dedupe) if (now - v.ts > 3e5) params.dedupe.delete(k);
		if (params.dedupe.size > 1e3) {
			const entries = [...params.dedupe.entries()].toSorted((a, b) => a[1].ts - b[1].ts);
			for (let i = 0; i < params.dedupe.size - DEDUPE_MAX; i++) params.dedupe.delete(entries[i][0]);
		}
		if (params.agentRunSeq.size > AGENT_RUN_SEQ_MAX) {
			const excess = params.agentRunSeq.size - AGENT_RUN_SEQ_MAX;
			let removed = 0;
			for (const runId of params.agentRunSeq.keys()) {
				params.agentRunSeq.delete(runId);
				removed += 1;
				if (removed >= excess) break;
			}
		}
		for (const [runId, entry] of params.chatAbortControllers) {
			if (now <= entry.expiresAtMs) continue;
			abortChatRunById({
				chatAbortControllers: params.chatAbortControllers,
				chatRunBuffers: params.chatRunBuffers,
				chatDeltaSentAt: params.chatDeltaSentAt,
				chatDeltaLastBroadcastLen: params.chatDeltaLastBroadcastLen,
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
			params.chatDeltaLastBroadcastLen.delete(runId);
		}
		pruneStaleControlPlaneBuckets(now);
		for (const [runId, lastSentAt] of params.chatDeltaSentAt) {
			if (params.chatRunState.abortedRuns.has(runId)) continue;
			if (params.chatAbortControllers.has(runId)) continue;
			if (now - lastSentAt <= ABORTED_RUN_TTL_MS) continue;
			params.chatRunBuffers.delete(runId);
			params.chatDeltaSentAt.delete(runId);
			params.chatDeltaLastBroadcastLen.delete(runId);
		}
		sweepStaleRunContexts();
	}, 6e4);
	if (typeof params.mediaCleanupTtlMs !== "number") return {
		tickInterval,
		healthInterval,
		dedupeCleanup,
		mediaCleanup: null
	};
	let mediaCleanupInFlight = null;
	const runMediaCleanup = () => {
		if (mediaCleanupInFlight) return mediaCleanupInFlight;
		mediaCleanupInFlight = cleanOldMedia(params.mediaCleanupTtlMs, {
			recursive: true,
			pruneEmptyDirs: true
		}).catch((err) => {
			params.logHealth.error(`media cleanup failed: ${formatError(err)}`);
		}).finally(() => {
			mediaCleanupInFlight = null;
		});
		return mediaCleanupInFlight;
	};
	const mediaCleanup = setInterval(() => {
		runMediaCleanup();
	}, 60 * 6e4);
	runMediaCleanup();
	return {
		tickInterval,
		healthInterval,
		dedupeCleanup,
		mediaCleanup
	};
}
//#endregion
//#region src/gateway/server-startup-early.ts
async function startGatewayEarlyRuntime(params) {
	let bonjourStop = null;
	if (!params.minimalTestGateway) bonjourStop = (await startGatewayDiscovery({
		machineDisplayName: await getMachineDisplayName(),
		port: params.port,
		gatewayTls: params.gatewayTls.enabled ? {
			enabled: true,
			fingerprintSha256: params.gatewayTls.fingerprintSha256
		} : void 0,
		wideAreaDiscoveryEnabled: params.cfgAtStart.discovery?.wideArea?.enabled === true,
		wideAreaDiscoveryDomain: params.cfgAtStart.discovery?.wideArea?.domain,
		tailscaleMode: params.tailscaleMode,
		mdnsMode: params.cfgAtStart.discovery?.mdns?.mode,
		gatewayDiscoveryServices: params.pluginRegistry?.gatewayDiscoveryServices,
		logDiscovery: params.logDiscovery
	})).bonjourStop;
	if (!params.minimalTestGateway) {
		setSkillsRemoteRegistry(params.nodeRegistry);
		primeRemoteSkillsCache();
		configureTaskRegistryMaintenance({
			cronStorePath: resolveCronStorePath(params.cfgAtStart.cron?.store),
			cronRuntimeAuthoritative: true
		});
		startTaskRegistryMaintenance();
	}
	const skillsChangeUnsub = params.minimalTestGateway ? () => {} : registerSkillsChangeListener((event) => {
		if (event.reason === "remote-node") return;
		const existingTimer = params.getSkillsRefreshTimer();
		if (existingTimer) clearTimeout(existingTimer);
		const nextTimer = setTimeout(() => {
			params.setSkillsRefreshTimer(null);
			refreshRemoteBinsForConnectedNodes(params.getRuntimeConfig());
		}, params.skillsRefreshDelayMs);
		params.setSkillsRefreshTimer(nextTimer);
	});
	const maintenance = params.minimalTestGateway ? null : startGatewayMaintenanceTimers({
		broadcast: params.broadcast,
		nodeSendToAllSubscribed: params.nodeSendToAllSubscribed,
		getPresenceVersion: params.getPresenceVersion,
		getHealthVersion: params.getHealthVersion,
		refreshGatewayHealthSnapshot: params.refreshGatewayHealthSnapshot,
		logHealth: params.logHealth,
		dedupe: params.dedupe,
		chatAbortControllers: params.chatAbortControllers,
		chatRunState: params.chatRunState,
		chatRunBuffers: params.chatRunBuffers,
		chatDeltaSentAt: params.chatDeltaSentAt,
		chatDeltaLastBroadcastLen: params.chatDeltaLastBroadcastLen,
		removeChatRun: params.removeChatRun,
		agentRunSeq: params.agentRunSeq,
		nodeSendToSession: params.nodeSendToSession,
		...typeof params.mediaCleanupTtlMs === "number" ? { mediaCleanupTtlMs: params.mediaCleanupTtlMs } : {}
	});
	return {
		bonjourStop,
		skillsChangeUnsub,
		maintenance
	};
}
//#endregion
//#region src/gateway/server-startup-post-attach.ts
const SESSION_LOCK_STALE_MS = 1800 * 1e3;
const ACP_BACKEND_READY_TIMEOUT_MS = 5e3;
const ACP_BACKEND_READY_POLL_MS = 50;
async function measureStartup(startupTrace, name, run) {
	return startupTrace ? startupTrace.measure(name, run) : await run();
}
function shouldCheckRestartSentinel(env = process.env) {
	return !env.VITEST && env.NODE_ENV !== "test";
}
function shouldStartGatewayMemoryBackend(cfg) {
	return cfg.memory?.backend === "qmd";
}
function isConfiguredCliBackendPrimary(params) {
	const slashIndex = params.explicitPrimary.indexOf("/");
	if (slashIndex <= 0) return false;
	const provider = params.normalizeProviderId(params.explicitPrimary.slice(0, slashIndex));
	return Object.keys(params.cfg.agents?.defaults?.cliBackends ?? {}).some((backend) => params.normalizeProviderId(backend) === provider);
}
async function hasGatewayStartupInternalHookListeners() {
	const { hasInternalHookListeners } = await import("./internal-hooks-Cu-9gpiV.js");
	return hasInternalHookListeners("gateway", "startup");
}
async function waitForAcpRuntimeBackendReady(params) {
	const { getAcpRuntimeBackend } = await import("./registry-Dt6eGPIM.js");
	const timeoutMs = params.timeoutMs ?? ACP_BACKEND_READY_TIMEOUT_MS;
	const pollMs = params.pollMs ?? ACP_BACKEND_READY_POLL_MS;
	const deadline = Date.now() + timeoutMs;
	do {
		const backend = getAcpRuntimeBackend(params.backendId);
		if (backend) try {
			if (!backend.healthy || backend.healthy()) return true;
		} catch {}
		await setTimeout$2(pollMs, void 0, { ref: false });
	} while (Date.now() < deadline);
	return false;
}
async function prewarmConfiguredPrimaryModel(params) {
	const { resolveAgentModelPrimaryValue } = await import("./model-input-Ux9OjqID.js");
	const explicitPrimary = resolveAgentModelPrimaryValue(params.cfg.agents?.defaults?.model)?.trim();
	if (!explicitPrimary) return;
	const { normalizeProviderId } = await import("./provider-id-DacNL6Io.js");
	if (isConfiguredCliBackendPrimary({
		cfg: params.cfg,
		explicitPrimary,
		normalizeProviderId
	})) return;
	const [{ resolveOpenClawAgentDir }, { DEFAULT_MODEL, DEFAULT_PROVIDER }, { selectAgentHarness }, { isCliProvider, resolveConfiguredModelRef }, { ensureOpenClawModelsJson }, { resolveModel, resolveModelAsync }, { resolveEmbeddedAgentRuntime }] = await Promise.all([
		import("./agent-paths-C4bVfqvX.js"),
		import("./defaults-DIHGbLP8.js"),
		import("./selection-BvlqevB0.js"),
		import("./model-selection-CKoFzMjk.js"),
		import("./models-config-NgpUNhEr.js"),
		import("./model-BUkvKH2S.js"),
		import("./runtime-BhRmtbyo.js")
	]);
	const { provider, model } = resolveConfiguredModelRef({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	if (isCliProvider(provider, params.cfg)) return;
	const runtime = resolveEmbeddedAgentRuntime();
	if (runtime !== "auto" && runtime !== "pi") return;
	if (selectAgentHarness({
		provider,
		modelId: model,
		config: params.cfg
	}).id !== "pi") return;
	const agentDir = resolveOpenClawAgentDir();
	try {
		await ensureOpenClawModelsJson(params.cfg, agentDir);
		const resolved = resolveModel(provider, model, agentDir, params.cfg, { skipProviderRuntimeHooks: true });
		if (!resolved.model) {
			const asyncResolved = await resolveModelAsync(provider, model, agentDir, params.cfg);
			if (!asyncResolved.model) throw new Error(resolved.error ?? asyncResolved.error ?? `Unknown model: ${provider}/${model}`);
		}
	} catch (err) {
		params.log.warn(`startup model warmup failed for ${provider}/${model}: ${String(err)}`);
	}
}
async function startGatewaySidecars(params) {
	await measureStartup(params.startupTrace, "sidecars.session-locks", async () => {
		try {
			const [{ resolveStateDir }, { resolveAgentSessionDirs }, { cleanStaleLockFiles }] = await Promise.all([
				import("./paths-BMxaLwkU.js"),
				import("./session-dirs-CbEvRvW9.js"),
				import("./session-write-lock-D3AMtwW_.js")
			]);
			const sessionDirs = await resolveAgentSessionDirs(resolveStateDir(process.env));
			for (const sessionsDir of sessionDirs) {
				const result = await cleanStaleLockFiles({
					sessionsDir,
					staleMs: SESSION_LOCK_STALE_MS,
					removeStale: true,
					log: { warn: (message) => params.log.warn(message) }
				});
				if (result.cleaned.length > 0) {
					const { markRestartAbortedMainSessionsFromLocks } = await import("./main-session-restart-recovery-BoLeg8p6.js");
					await markRestartAbortedMainSessionsFromLocks({
						sessionsDir,
						cleanedLocks: result.cleaned
					});
				}
			}
		} catch (err) {
			params.log.warn(`session lock cleanup failed on startup: ${String(err)}`);
		}
	});
	await measureStartup(params.startupTrace, "sidecars.gmail-watch", async () => {
		if (params.cfg.hooks?.enabled && params.cfg.hooks.gmail?.account) {
			const { startGmailWatcherWithLogs } = await import("./gmail-watcher-lifecycle-B2bA9Azb.js");
			await startGmailWatcherWithLogs({
				cfg: params.cfg,
				log: params.logHooks
			});
		}
	});
	await measureStartup(params.startupTrace, "sidecars.gmail-model", async () => {
		if (params.cfg.hooks?.gmail?.model) {
			const [{ DEFAULT_MODEL, DEFAULT_PROVIDER }, { loadModelCatalog }, { getModelRefStatus, resolveConfiguredModelRef, resolveHooksGmailModel }] = await Promise.all([
				import("./defaults-DIHGbLP8.js"),
				import("./model-catalog-Bb7i0Ftu.js"),
				import("./model-selection-CKoFzMjk.js")
			]);
			const hooksModelRef = resolveHooksGmailModel({
				cfg: params.cfg,
				defaultProvider: DEFAULT_PROVIDER
			});
			if (hooksModelRef) {
				const { provider: resolvedDefaultProvider, model: defaultModel } = resolveConfiguredModelRef({
					cfg: params.cfg,
					defaultProvider: DEFAULT_PROVIDER,
					defaultModel: DEFAULT_MODEL
				});
				const catalog = await loadModelCatalog({ config: params.cfg });
				const status = getModelRefStatus({
					cfg: params.cfg,
					catalog,
					ref: hooksModelRef,
					defaultProvider: resolvedDefaultProvider,
					defaultModel
				});
				if (!status.allowed) params.logHooks.warn(`hooks.gmail.model "${status.key}" not in agents.defaults.models allowlist (will use primary instead)`);
				if (!status.inCatalog) params.logHooks.warn(`hooks.gmail.model "${status.key}" not in the model catalog (may fail at runtime)`);
			}
		}
	});
	const internalHooksConfigured = hasConfiguredInternalHooks(params.cfg);
	await measureStartup(params.startupTrace, "sidecars.internal-hooks", async () => {
		try {
			if (internalHooksConfigured) {
				const [{ setInternalHooksEnabled }, { loadInternalHooks }] = await Promise.all([import("./internal-hooks-Cu-9gpiV.js"), import("./loader-GKbZPBGe.js")]);
				setInternalHooksEnabled(params.cfg.hooks?.internal?.enabled !== false);
				const loadedCount = await loadInternalHooks(params.cfg, params.defaultWorkspaceDir);
				if (loadedCount > 0) params.logHooks.info(`loaded ${loadedCount} internal hook handler${loadedCount > 1 ? "s" : ""}`);
			}
		} catch (err) {
			params.logHooks.error(`failed to load hooks: ${String(err)}`);
		}
	});
	const skipChannels = isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS);
	await measureStartup(params.startupTrace, "sidecars.channels", async () => {
		if (!skipChannels) try {
			await prewarmConfiguredPrimaryModel({
				cfg: params.cfg,
				log: params.log
			});
			await params.startChannels();
		} catch (err) {
			params.logChannels.error(`channel startup failed: ${String(err)}`);
		}
		else params.logChannels.info("skipping channel start (OPENCLAW_SKIP_CHANNELS=1 or OPENCLAW_SKIP_PROVIDERS=1)");
	});
	if (internalHooksConfigured || await hasGatewayStartupInternalHookListeners()) setTimeout(() => {
		import("./internal-hooks-Cu-9gpiV.js").then(({ createInternalHookEvent, triggerInternalHook }) => {
			triggerInternalHook(createInternalHookEvent("gateway", "startup", "gateway:startup", {
				cfg: params.cfg,
				deps: params.deps,
				workspaceDir: params.defaultWorkspaceDir
			}));
		});
	}, 250);
	let pluginServices = null;
	await measureStartup(params.startupTrace, "sidecars.plugin-services", async () => {
		try {
			const { startPluginServices } = await import("./services-DLMYTZsi.js");
			pluginServices = await startPluginServices({
				registry: params.pluginRegistry,
				config: params.cfg,
				workspaceDir: params.defaultWorkspaceDir
			});
		} catch (err) {
			params.log.warn(`plugin services failed to start: ${String(err)}`);
		}
	});
	if (params.cfg.acp?.enabled) (async () => {
		await waitForAcpRuntimeBackendReady({ backendId: params.cfg.acp?.backend });
		const [{ getAcpSessionManager }, { ACP_SESSION_IDENTITY_RENDERER_VERSION }] = await Promise.all([import("./manager-DfBcKcvl.js"), import("./session-identifiers-CTpCvZK-.js")]);
		const result = await getAcpSessionManager().reconcilePendingSessionIdentities({ cfg: params.cfg });
		if (result.checked === 0) return;
		params.log.warn(`acp startup identity reconcile (renderer=${ACP_SESSION_IDENTITY_RENDERER_VERSION}): checked=${result.checked} resolved=${result.resolved} failed=${result.failed}`);
	})().catch((err) => {
		params.log.warn(`acp startup identity reconcile failed: ${String(err)}`);
	});
	await measureStartup(params.startupTrace, "sidecars.memory", async () => {
		if (!shouldStartGatewayMemoryBackend(params.cfg)) return;
		setImmediate(() => {
			import("./server-startup-memory-DG9PddZc.js").then(({ startGatewayMemoryBackend }) => startGatewayMemoryBackend({
				cfg: params.cfg,
				log: params.log
			})).catch((err) => {
				params.log.warn(`qmd memory startup initialization failed: ${String(err)}`);
			});
		});
	});
	await measureStartup(params.startupTrace, "sidecars.restart-sentinel", async () => {
		if (!shouldCheckRestartSentinel()) return;
		const { hasRestartSentinel } = await import("./restart-sentinel-ChRMuWa5.js");
		if (!await hasRestartSentinel()) return;
		setTimeout(() => {
			import("./server-restart-sentinel-Bpny2lZk.js").then(({ scheduleRestartSentinelWake }) => scheduleRestartSentinelWake({ deps: params.deps })).catch((err) => {
				params.log.warn(`restart sentinel wake failed to schedule: ${String(err)}`);
			});
		}, 750);
	});
	await measureStartup(params.startupTrace, "sidecars.subagent-recovery", async () => {
		const { scheduleSubagentOrphanRecovery } = await import("./subagent-registry-CQkKNLme.js");
		scheduleSubagentOrphanRecovery();
	});
	await measureStartup(params.startupTrace, "sidecars.main-session-recovery", async () => {
		const { scheduleRestartAbortedMainSessionRecovery } = await import("./main-session-restart-recovery-BoLeg8p6.js");
		scheduleRestartAbortedMainSessionRecovery();
	});
	return { pluginServices };
}
const defaultGatewayPostAttachRuntimeDeps = {
	getGlobalHookRunner: async () => (await import("./hook-runner-global-Bosx1Wsd.js")).getGlobalHookRunner(),
	logGatewayStartup: async (params) => (await import("./server-startup-log-BsVmC7gG.js")).logGatewayStartup(params),
	refreshLatestUpdateRestartSentinel: async () => (await import("./server-restart-sentinel-Bpny2lZk.js")).refreshLatestUpdateRestartSentinel(),
	scheduleGatewayUpdateCheck: async (...args) => (await import("./update-startup-Bpf_15q2.js")).scheduleGatewayUpdateCheck(...args),
	startGatewaySidecars,
	startGatewayTailscaleExposure: async (...args) => (await import("./server-tailscale-BY6G8F-6.js")).startGatewayTailscaleExposure(...args)
};
async function startGatewayPostAttachRuntime(params, runtimeDeps = defaultGatewayPostAttachRuntimeDeps) {
	await measureStartup(params.startupTrace, "post-attach.update-sentinel", async () => {
		try {
			await runtimeDeps.refreshLatestUpdateRestartSentinel();
		} catch (err) {
			params.log.warn(`restart sentinel refresh failed: ${String(err)}`);
		}
	});
	await measureStartup(params.startupTrace, "post-attach.log", () => runtimeDeps.logGatewayStartup({
		cfg: params.cfgAtStart,
		bindHost: params.bindHost,
		bindHosts: params.bindHosts,
		port: params.port,
		tlsEnabled: params.tlsEnabled,
		loadedPluginIds: params.pluginRegistry.plugins.filter((plugin) => plugin.status === "loaded").map((plugin) => plugin.id),
		log: params.log,
		isNixMode: params.isNixMode,
		startupStartedAt: params.startupStartedAt
	}));
	const stopGatewayUpdateCheckPromise = params.minimalTestGateway ? Promise.resolve(() => {}) : measureStartup(params.startupTrace, "post-attach.update-check", () => runtimeDeps.scheduleGatewayUpdateCheck({
		cfg: params.cfgAtStart,
		log: params.log,
		isNixMode: params.isNixMode,
		onUpdateAvailableChange: (updateAvailable) => {
			const payload = { updateAvailable };
			params.broadcast(GATEWAY_EVENT_UPDATE_AVAILABLE, payload, { dropIfSlow: true });
		}
	}));
	const tailscaleCleanupPromise = params.minimalTestGateway ? Promise.resolve(null) : params.tailscaleMode === "off" && !params.resetOnExit ? Promise.resolve(null) : measureStartup(params.startupTrace, "post-attach.tailscale", () => runtimeDeps.startGatewayTailscaleExposure({
		tailscaleMode: params.tailscaleMode,
		resetOnExit: params.resetOnExit,
		port: params.port,
		controlUiBasePath: params.controlUiBasePath,
		logTailscale: params.logTailscale
	}));
	const sidecarsPromise = params.minimalTestGateway ? Promise.resolve({ pluginServices: null }) : new Promise((resolve) => setImmediate(resolve)).then(async () => {
		params.log.info("starting channels and sidecars...");
		const result = await measureStartup(params.startupTrace, "sidecars.total", () => runtimeDeps.startGatewaySidecars({
			cfg: params.gatewayPluginConfigAtStart,
			pluginRegistry: params.pluginRegistry,
			defaultWorkspaceDir: params.defaultWorkspaceDir,
			deps: params.deps,
			startChannels: params.startChannels,
			log: params.log,
			logHooks: params.logHooks,
			logChannels: params.logChannels,
			startupTrace: params.startupTrace
		}));
		for (const method of STARTUP_UNAVAILABLE_GATEWAY_METHODS) params.unavailableGatewayMethods.delete(method);
		params.onPluginServices?.(result.pluginServices);
		params.onSidecarsReady?.();
		params.startupTrace?.mark("sidecars.ready");
		params.log.info("gateway ready");
		return result;
	});
	sidecarsPromise.then(async () => {
		if (params.minimalTestGateway) return;
		const hookRunner = await runtimeDeps.getGlobalHookRunner();
		if (hookRunner?.hasHooks("gateway_start")) hookRunner.runGatewayStart({ port: params.port }, {
			port: params.port,
			config: params.gatewayPluginConfigAtStart,
			workspaceDir: params.defaultWorkspaceDir,
			getCron: () => params.deps.cron
		}).catch((err) => {
			params.log.warn(`gateway_start hook failed: ${String(err)}`);
		});
	}).catch((err) => {
		params.log.warn(`gateway sidecars failed to start: ${String(err)}`);
	});
	if (params.deferSidecars !== true) {
		const [stopGatewayUpdateCheck, tailscaleCleanup, sidecarsResult] = await Promise.all([
			stopGatewayUpdateCheckPromise,
			tailscaleCleanupPromise,
			sidecarsPromise
		]);
		return {
			stopGatewayUpdateCheck,
			tailscaleCleanup,
			pluginServices: sidecarsResult.pluginServices
		};
	}
	const [stopGatewayUpdateCheck, tailscaleCleanup] = await Promise.all([stopGatewayUpdateCheckPromise, tailscaleCleanupPromise]);
	return {
		stopGatewayUpdateCheck,
		tailscaleCleanup,
		pluginServices: null
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
	if (!value) return { host: "" };
	try {
		const parsed = new URL(`http://${value.trim()}`);
		const portRaw = parsed.port.trim();
		const port = portRaw ? Number.parseInt(portRaw, 10) : void 0;
		return {
			host: parsed.hostname,
			port: Number.isFinite(port) ? port : void 0
		};
	} catch {
		return { host: "" };
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
	const parsedRequestHost = parseHostHeader(params.requestHost);
	const requestHost = normalizeHost(parsedRequestHost.host, !!override);
	const localAddress = normalizeHost(params.localAddress, Boolean(override || requestHost));
	const host = override || requestHost || localAddress;
	if (!host) return;
	let exposedPort = port;
	if (!override && requestHost && port === 18789) {
		if (parsedRequestHost.port && parsedRequestHost.port > 0) exposedPort = parsedRequestHost.port;
		else if (scheme === "https") exposedPort = 443;
		else if (scheme === "http") exposedPort = 80;
	}
	return `${scheme}://${host.includes(":") ? `[${host}]` : host}:${exposedPort}`;
}
//#endregion
//#region src/gateway/node-connect-reconcile.ts
function resolveApprovedReconnectCommands(params) {
	return normalizeDeclaredNodeCommands({
		declaredCommands: Array.isArray(params.pairedCommands) ? params.pairedCommands : [],
		allowlist: params.allowlist
	});
}
function buildNodePairingRequestInput(params) {
	return {
		nodeId: params.nodeId,
		displayName: params.connectParams.client.displayName,
		platform: params.connectParams.client.platform,
		version: params.connectParams.client.version,
		deviceFamily: params.connectParams.client.deviceFamily,
		modelIdentifier: params.connectParams.client.modelIdentifier,
		caps: params.connectParams.caps,
		commands: params.commands,
		remoteIp: params.remoteIp
	};
}
async function reconcileNodePairingOnConnect(params) {
	const nodeId = params.connectParams.device?.id ?? params.connectParams.client.id;
	const allowlist = resolveNodeCommandAllowlist(params.cfg, {
		platform: params.connectParams.client.platform,
		deviceFamily: params.connectParams.client.deviceFamily
	});
	const declared = normalizeDeclaredNodeCommands({
		declaredCommands: Array.isArray(params.connectParams.commands) ? params.connectParams.commands : [],
		allowlist
	});
	if (!params.pairedNode) return {
		nodeId,
		effectiveCommands: declared,
		pendingPairing: await params.requestPairing(buildNodePairingRequestInput({
			nodeId,
			connectParams: params.connectParams,
			commands: declared,
			remoteIp: params.reportedClientIp
		}))
	};
	const approvedCommands = resolveApprovedReconnectCommands({
		pairedCommands: params.pairedNode.commands,
		allowlist
	});
	if (declared.some((command) => !approvedCommands.includes(command))) return {
		nodeId,
		effectiveCommands: approvedCommands,
		pendingPairing: await params.requestPairing(buildNodePairingRequestInput({
			nodeId,
			connectParams: params.connectParams,
			commands: declared,
			remoteIp: params.reportedClientIp
		}))
	};
	return {
		nodeId,
		effectiveCommands: declared
	};
}
//#endregion
//#region src/gateway/node-pairing-auto-approve.ts
function resolveNodePairingClientIpSource(params) {
	if (!params.reportedClientIp) return "none";
	if (!params.hasProxyHeaders || !params.remoteIsTrustedProxy) return "direct";
	return params.remoteIsLoopback ? "loopback-trusted-proxy" : "trusted-proxy";
}
function shouldAutoApproveNodePairingFromTrustedCidrs(params) {
	if (params.existingPairedDevice) return false;
	if (params.role !== "node") return false;
	if (params.reason !== "not-paired") return false;
	if (params.scopes.length > 0) return false;
	if (params.hasBrowserOriginHeader || params.isControlUi || params.isWebchat) return false;
	if (params.reportedClientIpSource === "none" || params.reportedClientIpSource === "loopback-trusted-proxy") return false;
	if (!params.reportedClientIp) return false;
	const autoApproveCidrs = params.autoApproveCidrs?.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
	if (!autoApproveCidrs || autoApproveCidrs.length === 0) return false;
	return isTrustedProxyAddress(params.reportedClientIp, autoApproveCidrs);
}
//#endregion
//#region src/gateway/server/ws-shared-generation.ts
function resolveSharedSecret(auth) {
	if (auth.mode === "token" && typeof auth.token === "string" && auth.token.trim().length > 0) return {
		mode: "token",
		secret: auth.token
	};
	if (auth.mode === "password" && typeof auth.password === "string" && auth.password.trim().length > 0) return {
		mode: "password",
		secret: auth.password
	};
	return null;
}
function resolveSharedGatewaySessionGeneration(auth) {
	const shared = resolveSharedSecret(auth);
	if (!shared) return;
	return createHash("sha256").update(`${shared.mode}\u0000${shared.secret}`, "utf8").digest("base64url");
}
//#endregion
//#region src/gateway/server/ws-connection/auth-context.ts
function resolveSharedConnectAuth(connectAuth) {
	const token = normalizeOptionalString(connectAuth?.token);
	const password = normalizeOptionalString(connectAuth?.password);
	if (!token && !password) return;
	return {
		token,
		password
	};
}
function resolveDeviceTokenCandidate(connectAuth) {
	const explicitDeviceToken = normalizeOptionalString(connectAuth?.deviceToken);
	if (explicitDeviceToken) return {
		token: explicitDeviceToken,
		source: "explicit-device-token"
	};
	const fallbackToken = normalizeOptionalString(connectAuth?.token);
	if (!fallbackToken) return {};
	return {
		token: fallbackToken,
		source: "shared-token-fallback"
	};
}
async function resolveConnectAuthState(params) {
	const sharedConnectAuth = resolveSharedConnectAuth(params.connectAuth);
	const sharedAuthProvided = Boolean(sharedConnectAuth);
	const bootstrapTokenCandidate = params.hasDeviceIdentity ? normalizeOptionalString(params.connectAuth?.bootstrapToken) : void 0;
	const { token: deviceTokenCandidate, source: deviceTokenCandidateSource } = params.hasDeviceIdentity ? resolveDeviceTokenCandidate(params.connectAuth) : {};
	let authResult = await authorizeWsControlUiGatewayConnect({
		auth: params.resolvedAuth,
		connectAuth: sharedConnectAuth,
		req: params.req,
		trustedProxies: params.trustedProxies,
		allowRealIpFallback: params.allowRealIpFallback,
		rateLimiter: sharedAuthProvided ? params.rateLimiter : void 0,
		clientIp: params.clientIp,
		rateLimitScope: AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET
	});
	const sharedAuthResult = sharedConnectAuth && await authorizeHttpGatewayConnect({
		auth: {
			...params.resolvedAuth,
			allowTailscale: false
		},
		connectAuth: sharedConnectAuth,
		req: params.req,
		trustedProxies: params.trustedProxies,
		allowRealIpFallback: params.allowRealIpFallback,
		rateLimitScope: "shared-secret"
	});
	const sharedAuthOk = sharedAuthResult?.ok === true && (sharedAuthResult.method === "token" || sharedAuthResult.method === "password") || authResult.ok && authResult.method === "trusted-proxy";
	return {
		authResult,
		authOk: authResult.ok,
		authMethod: authResult.method ?? (params.resolvedAuth.mode === "password" ? "password" : "token"),
		sharedAuthOk,
		sharedAuthProvided,
		bootstrapTokenCandidate,
		deviceTokenCandidate,
		deviceTokenCandidateSource
	};
}
async function resolveConnectAuthDecision(params) {
	let authResult = params.state.authResult;
	let authOk = params.state.authOk;
	let authMethod = params.state.authMethod;
	const bootstrapTokenCandidate = params.state.bootstrapTokenCandidate;
	if (params.hasDeviceIdentity && params.deviceId && params.publicKey && bootstrapTokenCandidate) {
		const tokenCheck = await params.verifyBootstrapToken({
			deviceId: params.deviceId,
			publicKey: params.publicKey,
			token: bootstrapTokenCandidate,
			role: params.role,
			scopes: params.scopes
		});
		if (tokenCheck.ok) {
			authOk = true;
			authMethod = "bootstrap-token";
		} else if (!authOk) authResult = {
			ok: false,
			reason: tokenCheck.reason ?? "bootstrap_token_invalid"
		};
	}
	const deviceTokenCandidate = params.state.deviceTokenCandidate;
	if (!params.hasDeviceIdentity || !params.deviceId || authOk || !deviceTokenCandidate) return {
		authResult,
		authOk,
		authMethod
	};
	let deviceTokenRateLimited = false;
	if (params.rateLimiter) {
		const deviceRateCheck = params.rateLimiter.check(params.clientIp, AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN);
		if (!deviceRateCheck.allowed) {
			deviceTokenRateLimited = true;
			authResult = {
				ok: false,
				reason: "rate_limited",
				rateLimited: true,
				retryAfterMs: deviceRateCheck.retryAfterMs
			};
		}
	}
	if (!deviceTokenRateLimited) if ((await params.verifyDeviceToken({
		deviceId: params.deviceId,
		token: deviceTokenCandidate,
		role: params.role,
		scopes: params.scopes
	})).ok) {
		authOk = true;
		authMethod = "device-token";
		params.rateLimiter?.reset(params.clientIp, AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN);
		if (params.state.sharedAuthProvided) params.rateLimiter?.reset(params.clientIp, AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET);
	} else {
		authResult = {
			ok: false,
			reason: params.state.deviceTokenCandidateSource === "explicit-device-token" ? "device_token_mismatch" : authResult.reason ?? "device_token_mismatch"
		};
		params.rateLimiter?.recordFailure(params.clientIp, AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN);
	}
	return {
		authResult,
		authOk,
		authMethod
	};
}
//#endregion
//#region src/gateway/server/ws-connection/auth-messages.ts
function formatGatewayAuthFailureMessage(params) {
	const { authMode, authProvided, reason, client } = params;
	const isCli = isGatewayCliClient(client);
	const isControlUi = isOperatorUiClient(client);
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
		case "bootstrap_token_invalid": return "unauthorized: bootstrap token invalid or expired (scan a fresh setup code)";
		case "tailscale_user_missing": return "unauthorized: tailscale identity missing (use Tailscale Serve auth or gateway token/password)";
		case "tailscale_proxy_missing": return "unauthorized: tailscale proxy headers missing (use Tailscale Serve or gateway token/password)";
		case "tailscale_whois_failed": return "unauthorized: tailscale identity check failed (use Tailscale Serve auth or gateway token/password)";
		case "tailscale_user_mismatch": return "unauthorized: tailscale identity mismatch (use Tailscale Serve auth or gateway token/password)";
		case "rate_limited": return "unauthorized: too many failed authentication attempts (retry later)";
		case "device_token_mismatch": return "unauthorized: device token mismatch (rotate/reissue device token)";
		default: break;
	}
	if (authMode === "token" && authProvided === "none") return `unauthorized: gateway token missing (${tokenHint})`;
	if (authMode === "token" && authProvided === "device-token") return "unauthorized: device token rejected (pair/repair this device, or provide gateway token)";
	if (authProvided === "bootstrap-token") return "unauthorized: bootstrap token invalid or expired (scan a fresh setup code)";
	if (authMode === "password" && authProvided === "none") return `unauthorized: gateway password missing (${passwordHint})`;
	return "unauthorized";
}
//#endregion
//#region src/gateway/server/ws-connection/connect-policy.ts
function resolveControlUiAuthPolicy(params) {
	const allowInsecureAuthConfigured = params.isControlUi && params.controlUiConfig?.allowInsecureAuth === true;
	const dangerouslyDisableDeviceAuth = params.isControlUi && params.controlUiConfig?.dangerouslyDisableDeviceAuth === true;
	return {
		isControlUi: params.isControlUi,
		allowInsecureAuthConfigured,
		dangerouslyDisableDeviceAuth,
		allowBypass: dangerouslyDisableDeviceAuth,
		device: dangerouslyDisableDeviceAuth ? null : params.deviceRaw
	};
}
function shouldSkipControlUiPairing(policy, role, trustedProxyAuthOk = false, authMode, authMethod) {
	if (trustedProxyAuthOk) return true;
	if (policy.isControlUi && role === "operator" && authMethod === "tailscale" && policy.device) return true;
	if (policy.isControlUi && role === "operator" && authMode === "none") return true;
	return role === "operator" && policy.allowBypass;
}
function isTrustedProxyControlUiOperatorAuth(params) {
	return params.isControlUi && params.role === "operator" && params.authMode === "trusted-proxy" && params.authOk && params.authMethod === "trusted-proxy";
}
function shouldClearUnboundScopesForMissingDeviceIdentity(params) {
	return params.decision.kind !== "allow" || !params.controlUiAuthPolicy.allowBypass && !params.preserveInsecureLocalControlUiScopes && (params.authMethod === "token" || params.authMethod === "password" || params.authMethod === "trusted-proxy" || params.trustedProxyAuthOk === true);
}
function evaluateMissingDeviceIdentity(params) {
	if (params.hasDeviceIdentity) return { kind: "allow" };
	if (params.isControlUi && params.trustedProxyAuthOk) return { kind: "allow" };
	if (params.isControlUi && params.controlUiAuthPolicy.allowBypass && params.role === "operator") return { kind: "allow" };
	if (params.isControlUi && !params.controlUiAuthPolicy.allowBypass) {
		if (!params.controlUiAuthPolicy.allowInsecureAuthConfigured || !params.isLocalClient) return { kind: "reject-control-ui-insecure-auth" };
	}
	if (roleCanSkipDeviceIdentity(params.role, params.sharedAuthOk)) return { kind: "allow" };
	if (!params.authOk && params.hasSharedAuth) return { kind: "reject-unauthorized" };
	return { kind: "reject-device-required" };
}
//#endregion
//#region src/gateway/server/ws-connection/handshake-auth-helpers.ts
const BROWSER_ORIGIN_LOOPBACK_RATE_LIMIT_IP = "198.18.0.1";
const BROWSER_ORIGIN_RATE_LIMIT_KEY_PREFIX = "browser-origin:";
function resolveBrowserOriginRateLimitKey(requestOrigin) {
	const trimmedOrigin = requestOrigin?.trim();
	if (!trimmedOrigin) return BROWSER_ORIGIN_LOOPBACK_RATE_LIMIT_IP;
	try {
		return `${BROWSER_ORIGIN_RATE_LIMIT_KEY_PREFIX}${normalizeLowercaseStringOrEmpty(new URL(trimmedOrigin).origin)}`;
	} catch {
		return BROWSER_ORIGIN_LOOPBACK_RATE_LIMIT_IP;
	}
}
function resolveHandshakeBrowserSecurityContext(params) {
	const hasBrowserOriginHeader = Boolean(params.requestOrigin && params.requestOrigin.trim() !== "");
	return {
		hasBrowserOriginHeader,
		enforceOriginCheckForAnyClient: hasBrowserOriginHeader,
		rateLimitClientIp: hasBrowserOriginHeader && isLoopbackAddress(params.clientIp) ? resolveBrowserOriginRateLimitKey(params.requestOrigin) : params.clientIp,
		authRateLimiter: hasBrowserOriginHeader && params.browserRateLimiter ? params.browserRateLimiter : params.rateLimiter
	};
}
function shouldAllowSilentLocalPairing(params) {
	if (params.locality === "remote") return false;
	if (params.hasBrowserOriginHeader && !params.isControlUi && !params.isWebchat) return false;
	if (params.reason === "not-paired" || params.reason === "scope-upgrade" || params.reason === "role-upgrade") return true;
	if (params.reason === "metadata-upgrade" && !params.hasBrowserOriginHeader && !params.isControlUi && !params.isWebchat && (params.locality === "direct_local" && params.isNativeAppUi === true || params.locality === "cli_container_local" || params.locality === "shared_secret_loopback_local")) return true;
	return false;
}
function isCliContainerLocalEquivalent(params) {
	const isCliClient = params.connectParams.client.id === GATEWAY_CLIENT_IDS.CLI && params.connectParams.client.mode === GATEWAY_CLIENT_MODES.CLI;
	const usesSharedSecretAuth = params.authMethod === "token" || params.authMethod === "password";
	return isCliClient && params.sharedAuthOk && usesSharedSecretAuth && !params.hasProxyHeaders && !params.hasBrowserOriginHeader && isLoopbackAddress(params.remoteAddress) && isPrivateOrLoopbackHost(resolveHostName(params.requestHost));
}
function isSharedSecretLoopbackLocalEquivalent(params) {
	const usesSharedSecretAuth = params.authMethod === "token" || params.authMethod === "password";
	return params.sharedAuthOk && usesSharedSecretAuth && !params.hasProxyHeaders && !params.hasBrowserOriginHeader && isLoopbackAddress(params.remoteAddress) && isPrivateOrLoopbackHost(resolveHostName(params.requestHost));
}
function resolveOriginHost(origin) {
	const trimmed = origin?.trim();
	if (!trimmed) return "";
	try {
		return new URL(trimmed).hostname;
	} catch {
		return "";
	}
}
function isControlUiBrowserContainerLocalEquivalent(params) {
	const isControlUiBrowser = params.connectParams.client.id === GATEWAY_CLIENT_IDS.CONTROL_UI && params.connectParams.client.mode === GATEWAY_CLIENT_MODES.WEBCHAT;
	const usesSharedSecretAuth = params.authMethod === "token" || params.authMethod === "password";
	return isControlUiBrowser && params.sharedAuthOk && usesSharedSecretAuth && !params.hasProxyHeaders && params.hasBrowserOriginHeader && isPrivateOrLoopbackAddress(params.remoteAddress) && isLoopbackHost(resolveHostName(params.requestHost)) && isLoopbackHost(resolveOriginHost(params.requestOrigin));
}
function resolvePairingLocality(params) {
	if (params.isLocalClient) return "direct_local";
	if (isControlUiBrowserContainerLocalEquivalent({
		connectParams: params.connectParams,
		requestHost: params.requestHost,
		requestOrigin: params.requestOrigin,
		remoteAddress: params.remoteAddress,
		hasProxyHeaders: params.hasProxyHeaders,
		hasBrowserOriginHeader: params.hasBrowserOriginHeader,
		sharedAuthOk: params.sharedAuthOk,
		authMethod: params.authMethod
	})) return "browser_container_local";
	if (isCliContainerLocalEquivalent({
		connectParams: params.connectParams,
		requestHost: params.requestHost,
		remoteAddress: params.remoteAddress,
		hasProxyHeaders: params.hasProxyHeaders,
		hasBrowserOriginHeader: params.hasBrowserOriginHeader,
		sharedAuthOk: params.sharedAuthOk,
		authMethod: params.authMethod
	})) return "cli_container_local";
	if (isSharedSecretLoopbackLocalEquivalent({
		requestHost: params.requestHost,
		remoteAddress: params.remoteAddress,
		hasProxyHeaders: params.hasProxyHeaders,
		hasBrowserOriginHeader: params.hasBrowserOriginHeader,
		sharedAuthOk: params.sharedAuthOk,
		authMethod: params.authMethod
	})) return "shared_secret_loopback_local";
	return "remote";
}
function shouldSkipLocalBackendSelfPairing(params) {
	if (!(params.connectParams.client.id === GATEWAY_CLIENT_IDS.GATEWAY_CLIENT && params.connectParams.client.mode === GATEWAY_CLIENT_MODES.BACKEND)) return false;
	const usesSharedSecretAuth = params.authMethod === "token" || params.authMethod === "password";
	const usesDeviceTokenAuth = params.authMethod === "device-token";
	return params.locality === "direct_local" && !params.hasBrowserOriginHeader && (params.sharedAuthOk && usesSharedSecretAuth || usesDeviceTokenAuth);
}
function resolveSignatureToken(connectParams) {
	return connectParams.auth?.token ?? connectParams.auth?.deviceToken ?? connectParams.auth?.bootstrapToken ?? null;
}
function buildUnauthorizedHandshakeContext(params) {
	return {
		authProvided: params.authProvided,
		canRetryWithDeviceToken: params.canRetryWithDeviceToken,
		recommendedNextStep: params.recommendedNextStep
	};
}
function resolveDeviceSignaturePayloadVersion(params) {
	const signatureToken = resolveSignatureToken(params.connectParams);
	const basePayload = {
		deviceId: params.device.id,
		clientId: params.connectParams.client.id,
		clientMode: params.connectParams.client.mode,
		role: params.role,
		scopes: params.scopes,
		signedAtMs: params.signedAtMs,
		token: signatureToken,
		nonce: params.nonce
	};
	const payloadV3 = buildDeviceAuthPayloadV3({
		...basePayload,
		platform: params.connectParams.client.platform,
		deviceFamily: params.connectParams.client.deviceFamily
	});
	if (verifyDeviceSignature(params.device.publicKey, payloadV3, params.device.signature)) return "v3";
	const payloadV2 = buildDeviceAuthPayload(basePayload);
	if (verifyDeviceSignature(params.device.publicKey, payloadV2, params.device.signature)) return "v2";
	return null;
}
function resolveAuthProvidedKind(connectAuth) {
	return connectAuth?.password ? "password" : connectAuth?.token ? "token" : connectAuth?.bootstrapToken ? "bootstrap-token" : connectAuth?.deviceToken ? "device-token" : "none";
}
function resolveUnauthorizedHandshakeContext(params) {
	const authProvided = resolveAuthProvidedKind(params.connectAuth);
	const canRetryWithDeviceToken = params.failedAuth.reason === "token_mismatch" && params.hasDeviceIdentity && authProvided === "token" && !params.connectAuth?.deviceToken;
	if (canRetryWithDeviceToken) return buildUnauthorizedHandshakeContext({
		authProvided,
		canRetryWithDeviceToken,
		recommendedNextStep: "retry_with_device_token"
	});
	switch (params.failedAuth.reason) {
		case "token_missing":
		case "token_missing_config":
		case "password_missing":
		case "password_missing_config": return buildUnauthorizedHandshakeContext({
			authProvided,
			canRetryWithDeviceToken,
			recommendedNextStep: "update_auth_configuration"
		});
		case "token_mismatch":
		case "password_mismatch":
		case "device_token_mismatch": return buildUnauthorizedHandshakeContext({
			authProvided,
			canRetryWithDeviceToken,
			recommendedNextStep: "update_auth_credentials"
		});
		case "rate_limited": return buildUnauthorizedHandshakeContext({
			authProvided,
			canRetryWithDeviceToken,
			recommendedNextStep: "wait_then_retry"
		});
		default: return buildUnauthorizedHandshakeContext({
			authProvided,
			canRetryWithDeviceToken,
			recommendedNextStep: "review_auth_configuration"
		});
	}
}
//#endregion
//#region src/gateway/server/ws-connection/unauthorized-flood-guard.ts
const DEFAULT_CLOSE_AFTER = 10;
const DEFAULT_LOG_EVERY = 100;
var UnauthorizedFloodGuard = class {
	constructor(options) {
		this.count = 0;
		this.suppressedSinceLastLog = 0;
		this.closeAfter = Math.max(1, Math.floor(options?.closeAfter ?? DEFAULT_CLOSE_AFTER));
		this.logEvery = Math.max(1, Math.floor(options?.logEvery ?? DEFAULT_LOG_EVERY));
	}
	registerUnauthorized() {
		this.count += 1;
		const shouldClose = this.count > this.closeAfter;
		if (!(this.count === 1 || this.count % this.logEvery === 0 || shouldClose)) {
			this.suppressedSinceLastLog += 1;
			return {
				shouldClose,
				shouldLog: false,
				count: this.count,
				suppressedSinceLastLog: 0
			};
		}
		const suppressedSinceLastLog = this.suppressedSinceLastLog;
		this.suppressedSinceLastLog = 0;
		return {
			shouldClose,
			shouldLog: true,
			count: this.count,
			suppressedSinceLastLog
		};
	}
	reset() {
		this.count = 0;
		this.suppressedSinceLastLog = 0;
	}
};
function isUnauthorizedRoleError(error) {
	if (!error) return false;
	return error.code === ErrorCodes.INVALID_REQUEST && typeof error.message === "string" && error.message.startsWith("unauthorized role:");
}
//#endregion
//#region src/gateway/server/ws-connection/message-handler.ts
const DEVICE_SIGNATURE_SKEW_MS = 120 * 1e3;
function resolvePinnedClientMetadata(params) {
	const claimedPlatform = normalizeDeviceMetadataForAuth(params.claimedPlatform);
	const claimedDeviceFamily = normalizeDeviceMetadataForAuth(params.claimedDeviceFamily);
	const pairedPlatform = normalizeDeviceMetadataForAuth(params.pairedPlatform);
	const pairedDeviceFamily = normalizeDeviceMetadataForAuth(params.pairedDeviceFamily);
	const hasPinnedPlatform = pairedPlatform !== "";
	const hasPinnedDeviceFamily = pairedDeviceFamily !== "";
	return {
		platformMismatch: hasPinnedPlatform && claimedPlatform !== pairedPlatform,
		deviceFamilyMismatch: hasPinnedDeviceFamily && claimedDeviceFamily !== pairedDeviceFamily,
		pinnedPlatform: hasPinnedPlatform ? params.pairedPlatform : void 0,
		pinnedDeviceFamily: hasPinnedDeviceFamily ? params.pairedDeviceFamily : void 0
	};
}
function attachGatewayWsMessageHandler(params) {
	const { socket, upgradeReq, connId, remoteAddr, remotePort, localAddr, localPort, endpoint, forwardedFor, realIp, requestHost, requestOrigin, requestUserAgent, canvasHostUrl, connectNonce, getResolvedAuth, getRequiredSharedGatewaySessionGeneration, rateLimiter, browserRateLimiter, gatewayMethods, events, extraHandlers, buildRequestContext, refreshHealthSnapshot, send, close, isClosed, clearHandshakeTimer, getClient, setClient, setHandshakeState, setCloseCause, setLastFrameMeta, originCheckMetrics, logGateway, logHealth, logWsControl } = params;
	const sendFrame = async (obj) => await new Promise((resolve, reject) => {
		socket.send(JSON.stringify(obj), (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
	const configSnapshot = getRuntimeConfig();
	const trustedProxies = configSnapshot.gateway?.trustedProxies ?? [];
	const allowRealIpFallback = configSnapshot.gateway?.allowRealIpFallback === true;
	const clientIp = resolveClientIp({
		remoteAddr,
		forwardedFor,
		realIp,
		trustedProxies,
		allowRealIpFallback
	});
	const peerLabel = endpoint ?? remoteAddr ?? "n/a";
	const hasProxyHeaders = hasForwardedRequestHeaders(upgradeReq);
	const remoteIsTrustedProxy = isTrustedProxyAddress(remoteAddr, trustedProxies);
	const hasUntrustedProxyHeaders = hasProxyHeaders && !remoteIsTrustedProxy;
	const hostIsLocalish = isLocalishHost(requestHost);
	const isLocalClient = isLocalDirectRequest(upgradeReq, trustedProxies, allowRealIpFallback);
	const reportedClientIp = isLocalClient || hasUntrustedProxyHeaders ? void 0 : clientIp && !isLoopbackAddress(clientIp) ? clientIp : void 0;
	const reportedClientIpSource = resolveNodePairingClientIpSource({
		reportedClientIp,
		hasProxyHeaders,
		remoteIsTrustedProxy,
		remoteIsLoopback: isLoopbackAddress(remoteAddr)
	});
	if (hasUntrustedProxyHeaders) logWsControl.warn("Proxy headers detected from untrusted address. Connection will not be treated as local. Configure gateway.trustedProxies to restore local client detection behind your proxy.");
	if (!hostIsLocalish && isLoopbackAddress(remoteAddr) && !hasProxyHeaders) logWsControl.warn("Loopback connection with non-local Host header. Treating it as remote. If you're behind a reverse proxy, set gateway.trustedProxies and forward X-Forwarded-For/X-Real-IP.");
	const isWebchatConnect = (p) => isWebchatClient(p?.client);
	const unauthorizedFloodGuard = new UnauthorizedFloodGuard();
	const { hasBrowserOriginHeader, enforceOriginCheckForAnyClient, rateLimitClientIp: browserRateLimitClientIp, authRateLimiter } = resolveHandshakeBrowserSecurityContext({
		requestOrigin,
		clientIp,
		rateLimiter,
		browserRateLimiter
	});
	const handleMessage = async (data) => {
		if (isClosed()) return;
		const preauthPayloadBytes = !getClient() ? getRawDataByteLength(data) : void 0;
		if (preauthPayloadBytes !== void 0 && preauthPayloadBytes > 65536) {
			logRejectedLargePayload({
				surface: "gateway.ws.preauth",
				bytes: preauthPayloadBytes,
				limitBytes: MAX_PREAUTH_PAYLOAD_BYTES,
				reason: "preauth_frame_limit"
			});
			setHandshakeState("failed");
			setCloseCause("preauth-payload-too-large", {
				payloadBytes: preauthPayloadBytes,
				limitBytes: MAX_PREAUTH_PAYLOAD_BYTES
			});
			close(1009, "preauth payload too large");
			return;
		}
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
					else logWsControl.warn(`invalid handshake conn=${connId} peer=${formatForLog(peerLabel)} remote=${remoteAddr ?? "?"} fwd=${formatForLog(forwardedFor ?? "n/a")} origin=${formatForLog(requestOrigin ?? "n/a")} host=${formatForLog(requestHost ?? "n/a")} ua=${formatForLog(requestUserAgent ?? "n/a")}`);
					const closeReason = truncateCloseReason(handshakeError || "invalid handshake");
					if (isRequestFrame) queueMicrotask(() => close(1008, closeReason));
					else close(1008, closeReason);
					return;
				}
				const frame = parsed;
				const connectParams = frame.params;
				const resolvedAuth = getResolvedAuth();
				const clientLabel = connectParams.client.displayName ?? connectParams.client.id;
				const clientMeta = {
					client: connectParams.client.id,
					clientDisplayName: connectParams.client.displayName,
					mode: connectParams.client.mode,
					version: connectParams.client.version,
					platform: connectParams.client.platform,
					deviceFamily: connectParams.client.deviceFamily,
					modelIdentifier: connectParams.client.modelIdentifier,
					instanceId: connectParams.client.instanceId
				};
				const markHandshakeFailure = (cause, meta) => {
					setHandshakeState("failed");
					setCloseCause(cause, {
						...meta,
						...clientMeta
					});
				};
				const sendHandshakeErrorResponse = (code, message, options) => {
					send({
						type: "res",
						id: frame.id,
						ok: false,
						error: errorShape(code, message, options)
					});
				};
				const { minProtocol, maxProtocol } = connectParams;
				if (maxProtocol < 3 || minProtocol > 3) {
					markHandshakeFailure("protocol-mismatch", {
						minProtocol,
						maxProtocol,
						expectedProtocol: 3
					});
					logWsControl.warn(`protocol mismatch conn=${connId} remote=${remoteAddr ?? "?"} client=${clientLabel} ${connectParams.client.mode} v${connectParams.client.version}`);
					sendHandshakeErrorResponse(ErrorCodes.INVALID_REQUEST, "protocol mismatch", { details: { expectedProtocol: 3 } });
					close(1002, "protocol mismatch");
					return;
				}
				const roleRaw = connectParams.role ?? "operator";
				const role = parseGatewayRole(roleRaw);
				if (!role) {
					markHandshakeFailure("invalid-role", { role: roleRaw });
					sendHandshakeErrorResponse(ErrorCodes.INVALID_REQUEST, "invalid role");
					close(1008, "invalid role");
					return;
				}
				let scopes = Array.isArray(connectParams.scopes) ? connectParams.scopes : [];
				connectParams.role = role;
				connectParams.scopes = scopes;
				const isControlUi = isOperatorUiClient(connectParams.client);
				const isBrowserOperatorUi = isBrowserOperatorUiClient(connectParams.client);
				const isWebchat = isWebchatConnect(connectParams);
				const isNativeAppUi = connectParams.client.mode === GATEWAY_CLIENT_MODES.UI && (connectParams.client.id === GATEWAY_CLIENT_IDS.MACOS_APP || connectParams.client.id === GATEWAY_CLIENT_IDS.IOS_APP || connectParams.client.id === GATEWAY_CLIENT_IDS.ANDROID_APP);
				if (enforceOriginCheckForAnyClient || isBrowserOperatorUi || isWebchat) {
					const hostHeaderOriginFallbackEnabled = configSnapshot.gateway?.controlUi?.dangerouslyAllowHostHeaderOriginFallback === true;
					const originCheck = checkBrowserOrigin({
						requestHost,
						origin: requestOrigin,
						allowedOrigins: configSnapshot.gateway?.controlUi?.allowedOrigins,
						allowHostHeaderOriginFallback: hostHeaderOriginFallbackEnabled,
						isLocalClient
					});
					if (!originCheck.ok) {
						const errorMessage = "origin not allowed (open the Control UI from the gateway host or allow it in gateway.controlUi.allowedOrigins)";
						markHandshakeFailure("origin-mismatch", {
							origin: requestOrigin ?? "n/a",
							host: requestHost ?? "n/a",
							reason: originCheck.reason
						});
						sendHandshakeErrorResponse(ErrorCodes.INVALID_REQUEST, errorMessage, { details: {
							code: ConnectErrorDetailCodes.CONTROL_UI_ORIGIN_NOT_ALLOWED,
							reason: originCheck.reason
						} });
						close(1008, truncateCloseReason(errorMessage));
						return;
					}
					if (originCheck.matchedBy === "host-header-fallback") {
						originCheckMetrics.hostHeaderFallbackAccepted += 1;
						logWsControl.warn(`security warning: websocket origin accepted via Host-header fallback conn=${connId} count=${originCheckMetrics.hostHeaderFallbackAccepted} host=${requestHost ?? "n/a"} origin=${requestOrigin ?? "n/a"}`);
						if (hostHeaderOriginFallbackEnabled) logGateway.warn("security metric: gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback accepted a websocket connect request");
					}
				}
				const deviceRaw = connectParams.device;
				let devicePublicKey = null;
				let deviceAuthPayloadVersion = null;
				const hasTokenAuth = Boolean(connectParams.auth?.token);
				const hasPasswordAuth = Boolean(connectParams.auth?.password);
				const hasSharedAuth = hasTokenAuth || hasPasswordAuth;
				const controlUiAuthPolicy = resolveControlUiAuthPolicy({
					isControlUi,
					controlUiConfig: configSnapshot.gateway?.controlUi,
					deviceRaw
				});
				const device = controlUiAuthPolicy.device;
				let { authResult, authOk, authMethod, sharedAuthOk, bootstrapTokenCandidate, deviceTokenCandidate, deviceTokenCandidateSource } = await resolveConnectAuthState({
					resolvedAuth,
					connectAuth: connectParams.auth,
					hasDeviceIdentity: Boolean(device),
					req: upgradeReq,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter: authRateLimiter,
					clientIp: browserRateLimitClientIp
				});
				const rejectUnauthorized = (failedAuth) => {
					const { authProvided, canRetryWithDeviceToken, recommendedNextStep } = resolveUnauthorizedHandshakeContext({
						connectAuth: connectParams.auth,
						failedAuth,
						hasDeviceIdentity: Boolean(device)
					});
					markHandshakeFailure("unauthorized", {
						authMode: resolvedAuth.mode,
						authProvided,
						authReason: failedAuth.reason,
						allowTailscale: resolvedAuth.allowTailscale,
						peer: peerLabel,
						remoteAddr,
						remotePort,
						localAddr,
						localPort,
						role,
						scopeCount: scopes.length,
						hasDeviceIdentity: Boolean(device)
					});
					logWsControl.warn(`unauthorized conn=${connId} peer=${formatForLog(peerLabel)} remote=${remoteAddr ?? "?"} client=${formatForLog(clientLabel)} ${connectParams.client.mode} v${formatForLog(connectParams.client.version)} role=${role} scopes=${scopes.length} auth=${authProvided} device=${device ? "yes" : "no"} platform=${formatForLog(connectParams.client.platform)} instance=${formatForLog(connectParams.client.instanceId ?? "n/a")} host=${formatForLog(requestHost ?? "n/a")} origin=${formatForLog(requestOrigin ?? "n/a")} ua=${formatForLog(requestUserAgent ?? "n/a")} reason=${failedAuth.reason ?? "unknown"}`);
					const authMessage = formatGatewayAuthFailureMessage({
						authMode: resolvedAuth.mode,
						authProvided,
						reason: failedAuth.reason,
						client: connectParams.client
					});
					sendHandshakeErrorResponse(ErrorCodes.INVALID_REQUEST, authMessage, { details: {
						code: resolveAuthConnectErrorDetailCode(failedAuth.reason),
						authReason: failedAuth.reason,
						canRetryWithDeviceToken,
						recommendedNextStep
					} });
					close(1008, truncateCloseReason(authMessage));
				};
				const clearUnboundScopes = () => {
					if (scopes.length > 0) {
						scopes = [];
						connectParams.scopes = scopes;
					}
				};
				let pairingLocality = resolvePairingLocality({
					connectParams,
					isLocalClient,
					requestHost,
					requestOrigin,
					remoteAddress: remoteAddr,
					hasProxyHeaders,
					hasBrowserOriginHeader,
					sharedAuthOk,
					authMethod
				});
				let skipLocalBackendSelfPairing = shouldSkipLocalBackendSelfPairing({
					connectParams,
					locality: pairingLocality,
					hasBrowserOriginHeader,
					sharedAuthOk,
					authMethod
				});
				const handleMissingDeviceIdentity = () => {
					const trustedProxyAuthOk = isTrustedProxyControlUiOperatorAuth({
						isControlUi,
						role,
						authMode: resolvedAuth.mode,
						authOk,
						authMethod
					});
					const preserveInsecureLocalControlUiScopes = isControlUi && controlUiAuthPolicy.allowInsecureAuthConfigured && isLocalClient && (authMethod === "token" || authMethod === "password");
					const decision = evaluateMissingDeviceIdentity({
						hasDeviceIdentity: Boolean(device),
						role,
						isControlUi,
						controlUiAuthPolicy,
						trustedProxyAuthOk,
						sharedAuthOk,
						authOk,
						hasSharedAuth,
						isLocalClient
					});
					if (!device && !skipLocalBackendSelfPairing && shouldClearUnboundScopesForMissingDeviceIdentity({
						decision,
						controlUiAuthPolicy,
						preserveInsecureLocalControlUiScopes,
						authMethod,
						trustedProxyAuthOk
					})) clearUnboundScopes();
					if (decision.kind === "allow") return true;
					if (decision.kind === "reject-control-ui-insecure-auth") {
						const errorMessage = "control ui requires device identity (use HTTPS or localhost secure context)";
						markHandshakeFailure("control-ui-insecure-auth", { insecureAuthConfigured: controlUiAuthPolicy.allowInsecureAuthConfigured });
						sendHandshakeErrorResponse(ErrorCodes.INVALID_REQUEST, errorMessage, { details: { code: ConnectErrorDetailCodes.CONTROL_UI_DEVICE_IDENTITY_REQUIRED } });
						close(1008, errorMessage);
						return false;
					}
					if (decision.kind === "reject-unauthorized") {
						rejectUnauthorized(authResult);
						return false;
					}
					markHandshakeFailure("device-required");
					sendHandshakeErrorResponse(ErrorCodes.NOT_PAIRED, "device identity required", { details: { code: ConnectErrorDetailCodes.DEVICE_IDENTITY_REQUIRED } });
					close(1008, "device identity required");
					return false;
				};
				if (!handleMissingDeviceIdentity()) return;
				if (device) {
					const rejectDeviceAuthInvalid = (reason, message) => {
						setHandshakeState("failed");
						setCloseCause("device-auth-invalid", {
							reason,
							client: connectParams.client.id,
							deviceId: device.id
						});
						send({
							type: "res",
							id: frame.id,
							ok: false,
							error: errorShape(ErrorCodes.INVALID_REQUEST, message, { details: {
								code: resolveDeviceAuthConnectErrorDetailCode(reason),
								reason
							} })
						});
						close(1008, message);
					};
					const derivedId = deriveDeviceIdFromPublicKey(device.publicKey);
					if (!derivedId || derivedId !== device.id) {
						rejectDeviceAuthInvalid("device-id-mismatch", "device identity mismatch");
						return;
					}
					const signedAt = device.signedAt;
					if (typeof signedAt !== "number" || Math.abs(Date.now() - signedAt) > DEVICE_SIGNATURE_SKEW_MS) {
						rejectDeviceAuthInvalid("device-signature-stale", "device signature expired");
						return;
					}
					const providedNonce = typeof device.nonce === "string" ? device.nonce.trim() : "";
					if (!providedNonce) {
						rejectDeviceAuthInvalid("device-nonce-missing", "device nonce required");
						return;
					}
					if (providedNonce !== connectNonce) {
						rejectDeviceAuthInvalid("device-nonce-mismatch", "device nonce mismatch");
						return;
					}
					const rejectDeviceSignatureInvalid = () => rejectDeviceAuthInvalid("device-signature", "device signature invalid");
					const payloadVersion = resolveDeviceSignaturePayloadVersion({
						device,
						connectParams,
						role,
						scopes,
						signedAtMs: signedAt,
						nonce: providedNonce
					});
					if (!payloadVersion) {
						rejectDeviceSignatureInvalid();
						return;
					}
					deviceAuthPayloadVersion = payloadVersion;
					devicePublicKey = normalizeDevicePublicKeyBase64Url(device.publicKey);
					if (!devicePublicKey) {
						rejectDeviceAuthInvalid("device-public-key", "device public key invalid");
						return;
					}
				}
				({authResult, authOk, authMethod} = await resolveConnectAuthDecision({
					state: {
						authResult,
						authOk,
						authMethod,
						sharedAuthOk,
						sharedAuthProvided: hasSharedAuth,
						bootstrapTokenCandidate,
						deviceTokenCandidate,
						deviceTokenCandidateSource
					},
					hasDeviceIdentity: Boolean(device),
					deviceId: device?.id,
					publicKey: device?.publicKey,
					role,
					scopes,
					rateLimiter: authRateLimiter,
					clientIp: browserRateLimitClientIp,
					verifyBootstrapToken: async ({ deviceId, publicKey, token, role, scopes }) => await verifyDeviceBootstrapToken({
						deviceId,
						publicKey,
						token,
						role,
						scopes
					}),
					verifyDeviceToken
				}));
				pairingLocality = resolvePairingLocality({
					connectParams,
					isLocalClient,
					requestHost,
					requestOrigin,
					remoteAddress: remoteAddr,
					hasProxyHeaders,
					hasBrowserOriginHeader,
					sharedAuthOk,
					authMethod
				});
				skipLocalBackendSelfPairing = shouldSkipLocalBackendSelfPairing({
					connectParams,
					locality: pairingLocality,
					hasBrowserOriginHeader,
					sharedAuthOk,
					authMethod
				});
				if (!authOk) {
					rejectUnauthorized(authResult);
					return;
				}
				if (authMethod === "token" || authMethod === "password") {
					const sharedGatewaySessionGeneration = resolveSharedGatewaySessionGeneration(resolvedAuth);
					const requiredSharedGatewaySessionGeneration = getRequiredSharedGatewaySessionGeneration?.();
					if (requiredSharedGatewaySessionGeneration !== void 0 && sharedGatewaySessionGeneration !== requiredSharedGatewaySessionGeneration) {
						setCloseCause("gateway-auth-rotated", { authGenerationStale: true });
						close(4001, "gateway auth changed");
						return;
					}
				}
				const issuedBootstrapProfile = authMethod === "bootstrap-token" && bootstrapTokenCandidate ? await getDeviceBootstrapTokenProfile({ token: bootstrapTokenCandidate }) : null;
				let boundBootstrapProfile = null;
				let handoffBootstrapProfile = null;
				const skipControlUiPairingForDevice = shouldSkipControlUiPairing(controlUiAuthPolicy, role, isTrustedProxyControlUiOperatorAuth({
					isControlUi,
					role,
					authMode: resolvedAuth.mode,
					authOk,
					authMethod
				}), resolvedAuth.mode, authMethod);
				if (device && devicePublicKey) {
					const formatAuditList = (items) => {
						if (!items || items.length === 0) return "<none>";
						const out = /* @__PURE__ */ new Set();
						for (const item of items) {
							const trimmed = item.trim();
							if (trimmed) out.add(trimmed);
						}
						if (out.size === 0) return "<none>";
						return [...out].toSorted().join(",");
					};
					const logUpgradeAudit = (reason, currentRoles, currentScopes) => {
						logGateway.warn(`security audit: device access upgrade requested reason=${reason} device=${device.id} ip=${reportedClientIp ?? "unknown-ip"} auth=${authMethod} roleFrom=${formatAuditList(currentRoles)} roleTo=${role} scopesFrom=${formatAuditList(currentScopes)} scopesTo=${formatAuditList(scopes)} client=${connectParams.client.id} conn=${connId}`);
					};
					const clientPairingMetadata = {
						displayName: connectParams.client.displayName,
						platform: connectParams.client.platform,
						deviceFamily: connectParams.client.deviceFamily,
						clientId: connectParams.client.id,
						clientMode: connectParams.client.mode,
						role,
						scopes,
						remoteIp: reportedClientIp
					};
					const clientAccessMetadata = {
						displayName: connectParams.client.displayName,
						clientId: connectParams.client.id,
						clientMode: connectParams.client.mode,
						remoteIp: reportedClientIp
					};
					const requirePairing = async (reason, existingPairedDevice = null) => {
						const pairingStateAllowsRequestedAccess = (pairedCandidate) => {
							if (!pairedCandidate || pairedCandidate.publicKey !== devicePublicKey) return false;
							if (!hasEffectivePairedDeviceRole(pairedCandidate, role)) return false;
							if (scopes.length === 0) return true;
							const pairedScopes = Array.isArray(pairedCandidate.approvedScopes) ? pairedCandidate.approvedScopes : Array.isArray(pairedCandidate.scopes) ? pairedCandidate.scopes : [];
							if (pairedScopes.length === 0) return false;
							return roleScopesAllow({
								role,
								requestedScopes: scopes,
								allowedScopes: pairedScopes
							});
						};
						if (boundBootstrapProfile === null && authMethod === "bootstrap-token" && reason === "not-paired" && role === "node" && scopes.length === 0 && !existingPairedDevice && bootstrapTokenCandidate) boundBootstrapProfile = await getBoundDeviceBootstrapProfile({
							token: bootstrapTokenCandidate,
							deviceId: device.id,
							publicKey: devicePublicKey
						});
						const allowSilentLocalPairing = shouldAllowSilentLocalPairing({
							locality: pairingLocality,
							hasBrowserOriginHeader,
							isControlUi,
							isWebchat,
							isNativeAppUi,
							reason
						});
						const allowSilentTrustedCidrsNodePairing = shouldAutoApproveNodePairingFromTrustedCidrs({
							existingPairedDevice: Boolean(existingPairedDevice),
							role,
							reason,
							scopes,
							hasBrowserOriginHeader,
							isControlUi,
							isWebchat,
							reportedClientIpSource,
							reportedClientIp,
							autoApproveCidrs: configSnapshot.gateway?.nodes?.pairing?.autoApproveCidrs
						});
						const allowSilentBootstrapPairing = authMethod === "bootstrap-token" && reason === "not-paired" && role === "node" && scopes.length === 0 && !existingPairedDevice && boundBootstrapProfile !== null;
						const bootstrapProfileForSilentApproval = allowSilentBootstrapPairing ? boundBootstrapProfile : null;
						const bootstrapPairingRoles = bootstrapProfileForSilentApproval ? Array.from(new Set([role, ...bootstrapProfileForSilentApproval.roles])) : void 0;
						const pairing = await requestDevicePairing({
							deviceId: device.id,
							publicKey: devicePublicKey,
							...clientPairingMetadata,
							...bootstrapPairingRoles ? { roles: bootstrapPairingRoles } : {},
							silent: reason === "scope-upgrade" ? false : allowSilentLocalPairing || allowSilentBootstrapPairing || allowSilentTrustedCidrsNodePairing
						});
						const context = buildRequestContext();
						let approved;
						let resolvedByConcurrentApproval = false;
						let recoveryRequestId = pairing.request.requestId;
						const resolveLivePendingRequestId = async () => {
							const pendingList = await listDevicePairing();
							const exactPending = pendingList.pending.find((pending) => pending.requestId === pairing.request.requestId);
							if (exactPending) return exactPending.requestId;
							return pendingList.pending.find((pending) => pending.deviceId === device.id && pending.publicKey === devicePublicKey)?.requestId;
						};
						if (pairing.request.silent === true) {
							approved = bootstrapProfileForSilentApproval ? await approveBootstrapDevicePairing(pairing.request.requestId, bootstrapProfileForSilentApproval) : await approveDevicePairing(pairing.request.requestId, { callerScopes: scopes });
							if (approved?.status === "approved") {
								if (bootstrapProfileForSilentApproval) handoffBootstrapProfile = bootstrapProfileForSilentApproval;
								logGateway.info(`device pairing auto-approved device=${approved.device.deviceId} role=${approved.device.role ?? "unknown"}`);
								context.broadcast("device.pair.resolved", {
									requestId: pairing.request.requestId,
									deviceId: approved.device.deviceId,
									decision: "approved",
									ts: Date.now()
								}, { dropIfSlow: true });
							} else {
								resolvedByConcurrentApproval = pairingStateAllowsRequestedAccess(await getPairedDevice(device.id));
								let requestStillPending = false;
								if (!resolvedByConcurrentApproval) {
									recoveryRequestId = await resolveLivePendingRequestId();
									requestStillPending = recoveryRequestId === pairing.request.requestId;
								}
								if (requestStillPending) context.broadcast("device.pair.requested", pairing.request, { dropIfSlow: true });
							}
						} else if (pairing.created) context.broadcast("device.pair.requested", pairing.request, { dropIfSlow: true });
						recoveryRequestId = await resolveLivePendingRequestId();
						if (!(pairing.request.silent === true && (approved?.status === "approved" || resolvedByConcurrentApproval))) {
							const exposeApprovedAccess = existingPairedDevice?.publicKey === devicePublicKey;
							const approvedRoles = exposeApprovedAccess ? listApprovedPairedDeviceRoles(existingPairedDevice) : [];
							const approvedScopes = exposeApprovedAccess ? Array.isArray(existingPairedDevice.approvedScopes) ? existingPairedDevice.approvedScopes : Array.isArray(existingPairedDevice.scopes) ? existingPairedDevice.scopes : [] : [];
							const pairingErrorDetails = buildPairingConnectErrorDetails({
								reason,
								requestId: recoveryRequestId,
								deviceId: device.id,
								requestedRole: role,
								requestedScopes: scopes,
								...approvedRoles.length > 0 ? { approvedRoles } : {},
								...approvedScopes.length > 0 ? { approvedScopes } : {}
							});
							const pairingErrorMessage = buildPairingConnectErrorMessage(reason);
							setHandshakeState("failed");
							setCloseCause("pairing-required", {
								deviceId: device.id,
								...recoveryRequestId ? { requestId: recoveryRequestId } : {},
								reason
							});
							send({
								type: "res",
								id: frame.id,
								ok: false,
								error: errorShape(ErrorCodes.NOT_PAIRED, pairingErrorMessage, { details: pairingErrorDetails })
							});
							close(1008, truncateCloseReason(buildPairingConnectCloseReason({
								reason,
								requestId: recoveryRequestId
							})));
							return false;
						}
						return true;
					};
					const paired = await getPairedDevice(device.id);
					if (!(paired?.publicKey === devicePublicKey)) {
						if (!(skipLocalBackendSelfPairing || skipControlUiPairingForDevice)) {
							if (!await requirePairing("not-paired", paired)) return;
						}
					} else {
						const claimedPlatform = connectParams.client.platform;
						const pairedPlatform = paired.platform;
						const claimedDeviceFamily = connectParams.client.deviceFamily;
						const pairedDeviceFamily = paired.deviceFamily;
						const metadataPinning = resolvePinnedClientMetadata({
							claimedPlatform,
							claimedDeviceFamily,
							pairedPlatform,
							pairedDeviceFamily
						});
						const { platformMismatch, deviceFamilyMismatch } = metadataPinning;
						if (platformMismatch || deviceFamilyMismatch) {
							if (!shouldAllowSilentLocalPairing({
								locality: pairingLocality,
								hasBrowserOriginHeader,
								isControlUi,
								isWebchat,
								isNativeAppUi,
								reason: "metadata-upgrade"
							})) logGateway.warn(`security audit: device metadata upgrade requested reason=metadata-upgrade device=${device.id} ip=${reportedClientIp ?? "unknown-ip"} auth=${authMethod} payload=${deviceAuthPayloadVersion ?? "unknown"} claimedPlatform=${claimedPlatform ?? "<none>"} pinnedPlatform=${pairedPlatform ?? "<none>"} claimedDeviceFamily=${claimedDeviceFamily ?? "<none>"} pinnedDeviceFamily=${pairedDeviceFamily ?? "<none>"} client=${connectParams.client.id} conn=${connId}`);
							if (!await requirePairing("metadata-upgrade", paired)) return;
						} else {
							if (metadataPinning.pinnedPlatform) connectParams.client.platform = metadataPinning.pinnedPlatform;
							if (metadataPinning.pinnedDeviceFamily) connectParams.client.deviceFamily = metadataPinning.pinnedDeviceFamily;
						}
						const pairedRoles = listEffectivePairedDeviceRoles(paired);
						const pairedScopes = Array.isArray(paired.approvedScopes) ? paired.approvedScopes : Array.isArray(paired.scopes) ? paired.scopes : [];
						const allowedRoles = new Set(pairedRoles);
						if (allowedRoles.size === 0) {
							logUpgradeAudit("role-upgrade", pairedRoles, pairedScopes);
							if (!await requirePairing("role-upgrade", paired)) return;
						} else if (!allowedRoles.has(role)) {
							logUpgradeAudit("role-upgrade", pairedRoles, pairedScopes);
							if (!await requirePairing("role-upgrade", paired)) return;
						}
						if (scopes.length > 0) {
							if (pairedScopes.length === 0) {
								logUpgradeAudit("scope-upgrade", pairedRoles, pairedScopes);
								if (!await requirePairing("scope-upgrade", paired)) return;
							} else if (!roleScopesAllow({
								role,
								requestedScopes: scopes,
								allowedScopes: pairedScopes
							})) {
								logUpgradeAudit("scope-upgrade", pairedRoles, pairedScopes);
								if (!await requirePairing("scope-upgrade", paired)) return;
							}
						}
						await updatePairedDeviceMetadata(device.id, clientAccessMetadata);
					}
				}
				const deviceToken = device ? await ensureDeviceToken({
					deviceId: device.id,
					role,
					scopes
				}) : null;
				const bootstrapDeviceTokens = [];
				if (deviceToken) bootstrapDeviceTokens.push({
					deviceToken: deviceToken.token,
					role: deviceToken.role,
					scopes: deviceToken.scopes,
					issuedAtMs: deviceToken.rotatedAtMs ?? deviceToken.createdAtMs
				});
				if (device && handoffBootstrapProfile) {
					const bootstrapProfileForHello = handoffBootstrapProfile;
					for (const bootstrapRole of bootstrapProfileForHello.roles) {
						if (bootstrapDeviceTokens.some((entry) => entry.role === bootstrapRole)) continue;
						const bootstrapRoleScopes = bootstrapRole === "operator" ? resolveBootstrapProfileScopesForRole(bootstrapRole, bootstrapProfileForHello.scopes) : [];
						const extraToken = await ensureDeviceToken({
							deviceId: device.id,
							role: bootstrapRole,
							scopes: bootstrapRoleScopes
						});
						if (!extraToken) continue;
						bootstrapDeviceTokens.push({
							deviceToken: extraToken.token,
							role: extraToken.role,
							scopes: extraToken.scopes,
							issuedAtMs: extraToken.rotatedAtMs ?? extraToken.createdAtMs
						});
					}
				}
				if (role === "node") {
					const reconciliation = await reconcileNodePairingOnConnect({
						cfg: getRuntimeConfig(),
						connectParams,
						pairedNode: await getPairedNode(connectParams.device?.id ?? connectParams.client.id),
						reportedClientIp,
						requestPairing: async (input) => await requestNodePairing(input)
					});
					if (reconciliation.pendingPairing?.created) buildRequestContext().broadcast("node.pair.requested", reconciliation.pendingPairing.request, { dropIfSlow: true });
					connectParams.commands = reconciliation.effectiveCommands;
				}
				const shouldTrackPresence = !isGatewayCliClient(connectParams.client);
				const clientId = connectParams.client.id;
				const instanceId = connectParams.client.instanceId;
				const presenceKey = shouldTrackPresence ? device?.id ?? instanceId ?? connId : void 0;
				if (isClosed()) {
					setCloseCause("connect-aborted-before-register", {
						...clientMeta,
						auth: authMethod
					});
					return;
				}
				const canvasCapability = canvasHostUrl ? mintCanvasCapabilityToken() : void 0;
				const canvasCapabilityExpiresAtMs = canvasCapability ? Date.now() + CANVAS_CAPABILITY_TTL_MS : void 0;
				const usesSharedGatewayAuth = authMethod === "token" || authMethod === "password";
				const sharedGatewaySessionGeneration = usesSharedGatewayAuth ? resolveSharedGatewaySessionGeneration(resolvedAuth) : void 0;
				const scopedCanvasHostUrl = canvasHostUrl && canvasCapability ? buildCanvasScopedHostUrl(canvasHostUrl, canvasCapability) ?? canvasHostUrl : canvasHostUrl;
				clearHandshakeTimer();
				const nextClient = {
					socket,
					connect: connectParams,
					connId,
					isDeviceTokenAuth: authMethod === "device-token",
					usesSharedGatewayAuth,
					sharedGatewaySessionGeneration,
					presenceKey,
					clientIp: reportedClientIp,
					canvasHostUrl,
					canvasCapability,
					canvasCapabilityExpiresAtMs
				};
				setSocketMaxPayload(socket, MAX_PAYLOAD_BYTES);
				if (!setClient(nextClient)) {
					setCloseCause("connect-aborted-before-register", {
						...clientMeta,
						auth: authMethod
					});
					return;
				}
				setHandshakeState("connected");
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
						cfg: getRuntimeConfig()
					}).catch((err) => logGateway.warn(`remote bin probe failed for ${nodeSession.nodeId}: ${formatForLog(err)}`));
					loadVoiceWakeConfig().then((cfg) => {
						context.nodeRegistry.sendEvent(nodeSession.nodeId, "voicewake.changed", { triggers: cfg.triggers });
					}).catch((err) => logGateway.warn(`voicewake snapshot failed for ${nodeSession.nodeId}: ${formatForLog(err)}`));
					loadVoiceWakeRoutingConfig().then((routing) => {
						context.nodeRegistry.sendEvent(nodeSession.nodeId, "voicewake.routing.changed", { config: routing });
					}).catch((err) => logGateway.warn(`voicewake routing snapshot failed for ${nodeSession.nodeId}: ${formatForLog(err)}`));
				}
				const snapshot = buildGatewaySnapshot({ includeSensitive: scopes.includes(ADMIN_SCOPE) });
				const cachedHealth = getHealthCache();
				if (cachedHealth) {
					snapshot.health = cachedHealth;
					snapshot.stateVersion.health = getHealthVersion();
				}
				const helloOkAuthScopes = deviceToken ? deviceToken.scopes : scopes;
				const helloOk = {
					type: "hello-ok",
					protocol: 3,
					server: {
						version: resolveRuntimeServiceVersion(process.env),
						connId
					},
					features: {
						methods: gatewayMethods,
						events
					},
					snapshot,
					canvasHostUrl: scopedCanvasHostUrl,
					auth: {
						role,
						scopes: helloOkAuthScopes,
						...deviceToken ? {
							deviceToken: deviceToken.token,
							issuedAtMs: deviceToken.rotatedAtMs ?? deviceToken.createdAtMs,
							...bootstrapDeviceTokens.length > 1 ? { deviceTokens: bootstrapDeviceTokens.slice(1) } : {}
						} : {}
					},
					policy: {
						maxPayload: MAX_PAYLOAD_BYTES,
						maxBufferedBytes: MAX_BUFFERED_BYTES,
						tickIntervalMs: TICK_INTERVAL_MS
					}
				};
				try {
					await sendFrame({
						type: "res",
						id: frame.id,
						ok: true,
						payload: helloOk
					});
				} catch (err) {
					setCloseCause("hello-send-failed", { error: formatForLog(err) });
					close();
					return;
				}
				if (authMethod === "bootstrap-token" && bootstrapTokenCandidate && device) try {
					if (handoffBootstrapProfile) {
						if (!(await revokeDeviceBootstrapToken({ token: bootstrapTokenCandidate })).removed) logGateway.warn(`bootstrap token revoke skipped after device-token handoff device=${device.id}`);
					} else if (issuedBootstrapProfile) {
						if ((await redeemDeviceBootstrapTokenProfile({
							token: bootstrapTokenCandidate,
							role,
							scopes
						})).fullyRedeemed) {
							if (!(await revokeDeviceBootstrapToken({ token: bootstrapTokenCandidate })).removed) logGateway.warn(`bootstrap token revoke skipped after profile redemption device=${device.id}`);
						}
					}
				} catch (err) {
					logGateway.warn(`bootstrap token post-connect bookkeeping failed device=${device.id}: ${formatForLog(err)}`);
				}
				logWs("out", "hello-ok", {
					connId,
					methods: gatewayMethods.length,
					events: events.length,
					presence: snapshot.presence.length,
					stateVersion: snapshot.stateVersion.presence
				});
				refreshHealthSnapshot({ probe: true }).catch((err) => logHealth.error(`post-connect health refresh failed: ${formatError(err)}`));
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
			if (client.usesSharedGatewayAuth) {
				const requiredSharedGatewaySessionGeneration = getRequiredSharedGatewaySessionGeneration?.();
				if (requiredSharedGatewaySessionGeneration !== void 0 && client.sharedGatewaySessionGeneration !== requiredSharedGatewaySessionGeneration) {
					setCloseCause("gateway-auth-rotated", {
						authGenerationStale: true,
						method: req.method
					});
					close(4001, "gateway auth changed");
					return;
				}
			}
			const respond = (ok, payload, error, meta) => {
				send({
					type: "res",
					id: req.id,
					ok,
					payload,
					error
				});
				const unauthorizedRoleError = isUnauthorizedRoleError(error);
				let logMeta = meta;
				if (unauthorizedRoleError) {
					const unauthorizedDecision = unauthorizedFloodGuard.registerUnauthorized();
					if (unauthorizedDecision.suppressedSinceLastLog > 0) logMeta = {
						...logMeta,
						suppressedUnauthorizedResponses: unauthorizedDecision.suppressedSinceLastLog
					};
					if (!unauthorizedDecision.shouldLog) return;
					if (unauthorizedDecision.shouldClose) {
						setCloseCause("repeated-unauthorized-requests", {
							unauthorizedCount: unauthorizedDecision.count,
							method: req.method
						});
						queueMicrotask(() => close(1008, "repeated unauthorized calls"));
					}
					logMeta = {
						...logMeta,
						unauthorizedCount: unauthorizedDecision.count
					};
				} else unauthorizedFloodGuard.reset();
				logWs("out", "res", {
					connId,
					id: req.id,
					ok,
					method: req.method,
					errorCode: error?.code,
					errorMessage: error?.message,
					...logMeta
				});
			};
			(async () => {
				const { handleGatewayRequest } = await import("./server-methods-b3jaTRE_.js");
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
	};
	socket.on("message", (data) => {
		runWithDiagnosticTraceContext(createDiagnosticTraceContext(), () => handleMessage(data));
	});
}
function getRawDataByteLength(data) {
	if (Buffer.isBuffer(data)) return data.byteLength;
	if (Array.isArray(data)) return data.reduce((total, chunk) => total + chunk.byteLength, 0);
	if (data instanceof ArrayBuffer) return data.byteLength;
	return Buffer.byteLength(String(data));
}
function setSocketMaxPayload(socket, maxPayload) {
	const receiver = socket._receiver;
	if (receiver) receiver._maxPayload = maxPayload;
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
function formatSocketEndpoint(address, port) {
	if (!address) return;
	if (port === void 0) return address;
	return address.includes(":") ? `[${address}]:${port}` : `${address}:${port}`;
}
function resolveSocketAddress(socket) {
	const rawSocket = socket._socket;
	const remoteAddr = rawSocket?.remoteAddress;
	const remotePort = rawSocket?.remotePort;
	const localAddr = rawSocket?.localAddress;
	const localPort = rawSocket?.localPort;
	const remoteEndpoint = formatSocketEndpoint(remoteAddr, remotePort);
	const localEndpoint = formatSocketEndpoint(localAddr, localPort);
	return {
		remoteAddr,
		remotePort,
		localAddr,
		localPort,
		endpoint: remoteEndpoint && localEndpoint ? `${remoteEndpoint}->${localEndpoint}` : remoteEndpoint ?? localEndpoint
	};
}
function isWsPayloadLimitError(err) {
	if (!err || typeof err !== "object") return false;
	if (err.code === "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH") return true;
	const message = err.message;
	return typeof message === "string" && /max payload size exceeded/i.test(message);
}
function attachGatewayWsConnectionHandler(params) {
	const { wss, clients, preauthConnectionBudget, port, gatewayHost, canvasHostEnabled, canvasHostServerPort, resolvedAuth, getResolvedAuth = () => resolvedAuth, getRequiredSharedGatewaySessionGeneration = () => resolveSharedGatewaySessionGeneration(getResolvedAuth()), rateLimiter, browserRateLimiter, gatewayMethods, events, refreshHealthSnapshot, logGateway, logHealth, logWsControl, extraHandlers, broadcast, buildRequestContext } = params;
	const originCheckMetrics = { hostHeaderFallbackAccepted: 0 };
	wss.on("connection", (socket, upgradeReq) => {
		let client = null;
		let closed = false;
		const openedAt = Date.now();
		const connId = randomUUID();
		const { remoteAddr, remotePort, localAddr, localPort, endpoint } = resolveSocketAddress(socket);
		const preauthBudgetKey = socket.__openclawPreauthBudgetKey;
		socket.__openclawPreauthBudgetClaimed = true;
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
			remoteAddr,
			remotePort,
			localAddr,
			localPort,
			endpoint
		});
		let handshakeState = "pending";
		let holdsPreauthBudget = true;
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
		const releasePreauthBudget = () => {
			if (!holdsPreauthBudget) return;
			holdsPreauthBudget = false;
			preauthConnectionBudget.release(preauthBudgetKey);
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
			releasePreauthBudget();
			if (client) clients.delete(client);
			try {
				socket.close(code, reason);
			} catch {}
		};
		socket.once("error", (err) => {
			if (isWsPayloadLimitError(err)) logRejectedLargePayload({
				surface: client ? "gateway.ws.frame" : "gateway.ws.preauth",
				limitBytes: client ? MAX_PAYLOAD_BYTES : MAX_PREAUTH_PAYLOAD_BYTES,
				reason: client ? "ws_frame_limit" : "preauth_frame_limit"
			});
			logWsControl.warn(`error conn=${connId} remote=${remoteAddr ?? "?"}: ${formatError(err)}`);
			close();
		});
		const isNoisySwiftPmHelperClose = (userAgent, remote) => normalizeLowercaseStringOrEmpty(userAgent).includes("swiftpm-testing-helper") && isLoopbackAddress(remote);
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
				remoteAddr,
				remotePort,
				localAddr,
				localPort,
				endpoint,
				...closeMeta
			};
			if (!client) (isNoisySwiftPmHelperClose(requestUserAgent, remoteAddr) ? logWsControl.debug : logWsControl.warn)(`closed before connect conn=${connId} peer=${endpoint ?? "n/a"} remote=${remoteAddr ?? "?"} fwd=${logForwardedFor || "n/a"} origin=${logOrigin || "n/a"} host=${logHost || "n/a"} ua=${logUserAgent || "n/a"} code=${code ?? "n/a"} reason=${logReason || "n/a"}`, closeContext);
			if (client && isWebchatClient(client.connect.client)) logWsControl.info(`webchat disconnected code=${code} reason=${logReason || "n/a"} conn=${connId}`);
			if (client?.presenceKey) {
				upsertPresence(client.presenceKey, { reason: "disconnect" });
				broadcastPresenceSnapshot({
					broadcast,
					incrementPresenceVersion,
					getHealthVersion
				});
			}
			const context = buildRequestContext();
			context.unsubscribeAllSessionEvents(connId);
			if (client?.connect?.role === "node") {
				const nodeId = context.nodeRegistry.unregister(connId);
				if (nodeId) {
					removeRemoteNodeInfo(nodeId);
					context.nodeUnsubscribeAll(nodeId);
					clearNodeWakeState(nodeId);
				}
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
				lastFrameId,
				endpoint
			});
			close();
		});
		const handshakeTimeoutMs = getPreauthHandshakeTimeoutMsFromEnv();
		const handshakeTimer = setTimeout(() => {
			if (!client) {
				handshakeState = "failed";
				setCloseCause("handshake-timeout", {
					handshakeMs: Date.now() - openedAt,
					endpoint
				});
				logWsControl.warn(`handshake timeout conn=${connId} peer=${endpoint ?? "n/a"} remote=${remoteAddr ?? "?"}`);
				close();
			}
		}, handshakeTimeoutMs);
		attachGatewayWsMessageHandler({
			socket,
			upgradeReq,
			connId,
			remoteAddr,
			remotePort,
			localAddr,
			localPort,
			endpoint,
			forwardedFor,
			realIp,
			requestHost,
			requestOrigin,
			requestUserAgent,
			canvasHostUrl,
			connectNonce,
			getResolvedAuth,
			getRequiredSharedGatewaySessionGeneration,
			rateLimiter,
			browserRateLimiter,
			gatewayMethods,
			events,
			extraHandlers,
			buildRequestContext,
			refreshHealthSnapshot,
			send,
			close,
			isClosed: () => closed,
			clearHandshakeTimer: () => clearTimeout(handshakeTimer),
			getClient: () => client,
			setClient: (next) => {
				if (closed) return false;
				releasePreauthBudget();
				client = next;
				clients.add(next);
				return true;
			},
			setHandshakeState: (next) => {
				handshakeState = next;
			},
			setCloseCause,
			setLastFrameMeta,
			originCheckMetrics,
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
		preauthConnectionBudget: params.preauthConnectionBudget,
		port: params.port,
		gatewayHost: params.gatewayHost,
		canvasHostEnabled: params.canvasHostEnabled,
		canvasHostServerPort: params.canvasHostServerPort,
		resolvedAuth: params.resolvedAuth,
		getResolvedAuth: params.getResolvedAuth,
		getRequiredSharedGatewaySessionGeneration: params.getRequiredSharedGatewaySessionGeneration,
		rateLimiter: params.rateLimiter,
		browserRateLimiter: params.browserRateLimiter,
		gatewayMethods: params.gatewayMethods,
		events: params.events,
		refreshHealthSnapshot: params.context.refreshHealthSnapshot,
		logGateway: params.logGateway,
		logHealth: params.logHealth,
		logWsControl: params.logWsControl,
		extraHandlers: params.extraHandlers,
		broadcast: params.broadcast,
		buildRequestContext: () => params.context
	});
}
//#endregion
//#region src/gateway/server/readiness.ts
const DEFAULT_READINESS_CACHE_TTL_MS = 1e3;
function shouldIgnoreReadinessFailure(accountSnapshot, health) {
	if (health.reason === "unmanaged" || health.reason === "stale-socket") return true;
	return health.reason === "not-running" && accountSnapshot.restartPending === true;
}
function createReadinessChecker(deps) {
	const { channelManager, startedAt } = deps;
	const cacheTtlMs = Math.max(0, deps.cacheTtlMs ?? DEFAULT_READINESS_CACHE_TTL_MS);
	let cachedAt = 0;
	let cachedState = null;
	return () => {
		const now = Date.now();
		const uptimeMs = now - startedAt;
		if (deps.getStartupPending?.()) return {
			ready: false,
			failing: ["startup-sidecars"],
			uptimeMs
		};
		if (cachedState && now - cachedAt < cacheTtlMs) return {
			...cachedState,
			uptimeMs
		};
		const snapshot = channelManager.getRuntimeSnapshot();
		const failing = [];
		for (const [channelId, accounts] of Object.entries(snapshot.channelAccounts)) {
			if (!accounts) continue;
			for (const accountSnapshot of Object.values(accounts)) {
				if (!accountSnapshot) continue;
				const health = evaluateChannelHealth(accountSnapshot, {
					now,
					staleEventThresholdMs: DEFAULT_CHANNEL_STALE_EVENT_THRESHOLD_MS,
					channelConnectGraceMs: DEFAULT_CHANNEL_CONNECT_GRACE_MS,
					channelId
				});
				if (!health.healthy && !shouldIgnoreReadinessFailure(accountSnapshot, health)) {
					failing.push(channelId);
					break;
				}
			}
		}
		cachedAt = now;
		cachedState = {
			ready: failing.length === 0,
			failing
		};
		return {
			...cachedState,
			uptimeMs
		};
	};
}
//#endregion
//#region src/gateway/server/tls.ts
async function loadGatewayTlsRuntime(cfg, log) {
	return await loadGatewayTlsRuntime$1(cfg, log);
}
//#endregion
//#region src/gateway/startup-control-ui-origins.ts
async function maybeSeedControlUiAllowedOriginsAtStartup(params) {
	const seeded = ensureControlUiAllowedOriginsForNonLoopbackBind(params.config, {
		isContainerEnvironment,
		runtimeBind: params.runtimeBind,
		runtimePort: params.runtimePort
	});
	if (!seeded.seededOrigins || !seeded.bind) return {
		config: params.config,
		persistedAllowedOriginsSeed: false
	};
	try {
		await params.writeConfig(seeded.config);
		params.log.info(buildSeededOriginsInfoLog(seeded.seededOrigins, seeded.bind));
		return {
			config: seeded.config,
			persistedAllowedOriginsSeed: true
		};
	} catch (err) {
		params.log.warn(`gateway: failed to persist gateway.controlUi.allowedOrigins seed: ${String(err)}. The gateway will start with the in-memory value but config was not saved.`);
	}
	return {
		config: seeded.config,
		persistedAllowedOriginsSeed: false
	};
}
function buildSeededOriginsInfoLog(origins, bind) {
	return `gateway: seeded gateway.controlUi.allowedOrigins ${JSON.stringify(origins)} for bind=${bind} (required since v2026.2.26; see issue #29385). Add other origins to gateway.controlUi.allowedOrigins if needed.`;
}
//#endregion
//#region src/gateway/server.impl.ts
ensureOpenClawCliOnPath();
const MAX_MEDIA_TTL_HOURS = 168;
function resolveMediaCleanupTtlMs(ttlHoursRaw) {
	const ttlMs = Math.min(Math.max(ttlHoursRaw, 1), MAX_MEDIA_TTL_HOURS) * 60 * 6e4;
	if (!Number.isFinite(ttlMs) || !Number.isSafeInteger(ttlMs)) throw new Error(`Invalid media.ttlHours: ${String(ttlHoursRaw)}`);
	return ttlMs;
}
const log = createSubsystemLogger("gateway");
const logCanvas = log.child("canvas");
const logDiscovery = log.child("discovery");
const logTailscale = log.child("tailscale");
const logChannels = log.child("channels");
let cachedChannelRuntimePromise = null;
function getChannelRuntime() {
	cachedChannelRuntimePromise ??= import("./runtime-channel-CSlEkpRR.js").then(({ createRuntimeChannel }) => createRuntimeChannel());
	return cachedChannelRuntimePromise;
}
async function closeMcpLoopbackServerOnDemand() {
	const { closeMcpLoopbackServer } = await import("./mcp-http-CuCPBwRZ.js");
	await closeMcpLoopbackServer();
}
const logHealth = log.child("health");
const logCron = log.child("cron");
const logReload = log.child("reload");
const logHooks = log.child("hooks");
const logPlugins = log.child("plugins");
const logWsControl = log.child("ws");
const logSecrets = log.child("secrets");
const gatewayRuntime = runtimeForLogger(log);
const canvasRuntime = runtimeForLogger(logCanvas);
function createGatewayStartupTrace() {
	const enabled = isTruthyEnvValue(process.env.OPENCLAW_GATEWAY_STARTUP_TRACE);
	const eventLoopDelay = enabled ? monitorEventLoopDelay({ resolution: 10 }) : void 0;
	eventLoopDelay?.enable();
	const started = performance.now();
	let last = started;
	const formatMetric = (key, value) => `${key}=${typeof value === "number" ? value.toFixed(1) : value}`;
	const readEventLoopMaxMs = () => {
		if (!eventLoopDelay) return 0;
		const maxMs = eventLoopDelay.max / 1e6;
		eventLoopDelay.reset();
		return maxMs;
	};
	const emit = (name, durationMs, totalMs, extras = []) => {
		if (enabled) {
			const metrics = [`eventLoopMax=${readEventLoopMaxMs().toFixed(1)}ms`, ...extras.map(([key, value]) => formatMetric(key, value))].join(" ");
			log.info(`startup trace: ${name} ${durationMs.toFixed(1)}ms total=${totalMs.toFixed(1)}ms ${metrics}`);
		}
	};
	return {
		mark(name) {
			const now = performance.now();
			emit(name, now - last, now - started);
			last = now;
			if (name === "ready") eventLoopDelay?.disable();
		},
		detail(name, metrics) {
			if (!enabled) return;
			log.info(`startup trace: ${name} ${metrics.map(([key, value]) => formatMetric(key, value)).join(" ")}`);
		},
		async measure(name, run) {
			const before = performance.now();
			try {
				return await run();
			} finally {
				const now = performance.now();
				emit(name, now - before, now - started);
				last = now;
			}
		}
	};
}
function createGatewayAuthRateLimiters(rateLimitConfig) {
	return {
		rateLimiter: rateLimitConfig ? createAuthRateLimiter(rateLimitConfig) : void 0,
		browserRateLimiter: createAuthRateLimiter({
			...rateLimitConfig,
			exemptLoopback: false
		})
	};
}
const runDefaultSetupWizard = async (...args) => {
	const { runSetupWizard } = await import("./setup-BMglu6Cs.js");
	return runSetupWizard(...args);
};
async function startGatewayServer(port = 18789, opts = {}) {
	bootstrapGatewayNetworkRuntime();
	const minimalTestGateway = isVitestRuntimeEnv() && process.env.OPENCLAW_TEST_MINIMAL_GATEWAY === "1";
	process.env.OPENCLAW_GATEWAY_PORT = String(port);
	logAcceptedEnvOption({
		key: "OPENCLAW_RAW_STREAM",
		description: "raw stream logging enabled"
	});
	logAcceptedEnvOption({
		key: "OPENCLAW_RAW_STREAM_PATH",
		description: "raw stream log path override"
	});
	const startupTrace = createGatewayStartupTrace();
	const startupConfigLoad = await startupTrace.measure("config.snapshot", () => loadGatewayStartupConfigSnapshot({
		minimalTestGateway,
		log,
		measure: (name, run) => startupTrace.measure(name, run)
	}));
	const configSnapshot = startupConfigLoad.snapshot;
	const emitSecretsStateEvent = (code, message, cfg) => {
		enqueueSystemEvent(`[${code}] ${message}`, {
			sessionKey: resolveMainSessionKey(cfg),
			contextKey: code
		});
	};
	const activateRuntimeSecrets = createRuntimeSecretsActivator({
		logSecrets,
		emitStateEvent: emitSecretsStateEvent
	});
	let cfgAtStart;
	let startupInternalWriteHash = null;
	let startupLastGoodSnapshot = configSnapshot;
	const startupActivationSourceConfig = configSnapshot.sourceConfig;
	const startupRuntimeConfig = applyConfigOverrides(configSnapshot.config);
	const authBootstrap = await startupTrace.measure("config.auth", () => prepareGatewayStartupConfig({
		configSnapshot,
		authOverride: opts.auth,
		tailscaleOverride: opts.tailscale,
		activateRuntimeSecrets,
		persistStartupAuth: startupConfigLoad.degradedProviderApi !== true
	}));
	cfgAtStart = authBootstrap.cfg;
	if (authBootstrap.generatedToken) if (authBootstrap.persistedGeneratedToken) log.info("Gateway auth token was missing. Generated a new token and saved it to config (gateway.auth.token).");
	else log.warn("Gateway auth token was missing. Generated a runtime token for this startup without changing config; restart will generate a different token. Persist one with `openclaw config set gateway.auth.mode token` and `openclaw config set gateway.auth.token <token>`.");
	const diagnosticsEnabled = isDiagnosticsEnabled(cfgAtStart);
	setDiagnosticsEnabledForProcess(diagnosticsEnabled);
	if (diagnosticsEnabled) startDiagnosticHeartbeat(void 0, { getConfig: getRuntimeConfig });
	setGatewaySigusr1RestartPolicy({ allowExternal: isRestartEnabled(cfgAtStart) });
	setPreRestartDeferralCheck(() => getTotalQueueSize() + getTotalPendingReplies() + getActiveEmbeddedRunCount() + getActiveBundledRuntimeDepsInstallCount() + getInspectableTaskRegistrySummary().active);
	const controlUiSeed = minimalTestGateway ? {
		config: cfgAtStart,
		persistedAllowedOriginsSeed: false
	} : await startupTrace.measure("control-ui.seed", () => maybeSeedControlUiAllowedOriginsAtStartup({
		config: cfgAtStart,
		writeConfig: async (nextConfig) => {
			await replaceConfigFile({
				nextConfig,
				afterWrite: { mode: "auto" }
			});
		},
		log,
		runtimeBind: opts.bind,
		runtimePort: port
	}));
	cfgAtStart = controlUiSeed.config;
	if (startupConfigLoad.wroteConfig || authBootstrap.persistedGeneratedToken || controlUiSeed.persistedAllowedOriginsSeed) {
		const startupSnapshot = await startupTrace.measure("config.final-snapshot", () => readConfigFileSnapshot());
		startupInternalWriteHash = startupSnapshot.hash ?? null;
		startupLastGoodSnapshot = startupSnapshot;
	}
	const pluginBootstrap = await startupTrace.measure("plugins.bootstrap", () => prepareGatewayPluginBootstrap({
		cfgAtStart,
		activationSourceConfig: startupActivationSourceConfig,
		startupRuntimeConfig,
		pluginMetadataSnapshot: startupConfigLoad.pluginMetadataSnapshot,
		minimalTestGateway,
		log
	}));
	const { gatewayPluginConfigAtStart, defaultWorkspaceDir, deferredConfiguredChannelPluginIds, startupPluginIds, pluginLookUpTable, baseMethods } = pluginBootstrap;
	setCurrentPluginMetadataSnapshot(pluginLookUpTable, { config: gatewayPluginConfigAtStart });
	if (pluginLookUpTable) {
		const metrics = pluginLookUpTable.metrics;
		startupTrace.detail("plugins.lookup-table", [
			["registrySnapshotMs", metrics.registrySnapshotMs],
			["manifestRegistryMs", metrics.manifestRegistryMs],
			["startupPlanMs", metrics.startupPlanMs],
			["ownerMapsMs", metrics.ownerMapsMs],
			["totalMs", metrics.totalMs],
			["indexPlugins", String(metrics.indexPluginCount)],
			["manifestPlugins", String(metrics.manifestPluginCount)],
			["startupPlugins", String(metrics.startupPluginCount)],
			["deferredChannelPlugins", String(metrics.deferredChannelPluginCount)]
		]);
	}
	let { pluginRegistry, baseGatewayMethods } = pluginBootstrap;
	const channelLogs = Object.fromEntries(listChannelPlugins().map((plugin) => [plugin.id, logChannels.child(plugin.id)]));
	const channelRuntimeEnvs = Object.fromEntries(Object.entries(channelLogs).map(([id, logger]) => [id, runtimeForLogger(logger)]));
	const listActiveGatewayMethods = (nextBaseGatewayMethods) => Array.from(new Set([...nextBaseGatewayMethods, ...listChannelPlugins().flatMap((plugin) => plugin.gatewayMethods ?? [])]));
	const runtimeConfig = await startupTrace.measure("runtime.config", () => resolveGatewayRuntimeConfig({
		cfg: cfgAtStart,
		port,
		bind: opts.bind,
		host: opts.host,
		controlUiEnabled: opts.controlUiEnabled,
		openAiChatCompletionsEnabled: opts.openAiChatCompletionsEnabled,
		openResponsesEnabled: opts.openResponsesEnabled,
		auth: opts.auth,
		tailscale: opts.tailscale
	}));
	const { bindHost, controlUiEnabled, openAiChatCompletionsEnabled, openAiChatCompletionsConfig, openResponsesEnabled, openResponsesConfig, strictTransportSecurityHeader, controlUiBasePath, controlUiRoot: controlUiRootOverride, resolvedAuth, tailscaleConfig, tailscaleMode } = runtimeConfig;
	const getResolvedAuth = () => resolveGatewayAuth({
		authConfig: getActiveSecretsRuntimeSnapshot()?.config.gateway?.auth ?? getRuntimeConfig().gateway?.auth,
		authOverride: opts.auth,
		env: process.env,
		tailscaleMode
	});
	const resolveSharedGatewaySessionGenerationForConfig = (config) => resolveSharedGatewaySessionGeneration(resolveGatewayAuth({
		authConfig: config.gateway?.auth,
		authOverride: opts.auth,
		env: process.env,
		tailscaleMode
	}));
	const resolveCurrentSharedGatewaySessionGeneration = () => resolveSharedGatewaySessionGeneration(getResolvedAuth());
	const resolveSharedGatewaySessionGenerationForRuntimeSnapshot = () => resolveSharedGatewaySessionGeneration(resolveGatewayAuth({
		authConfig: getRuntimeConfig().gateway?.auth,
		authOverride: opts.auth,
		env: process.env,
		tailscaleMode
	}));
	const sharedGatewaySessionGenerationState = {
		current: resolveCurrentSharedGatewaySessionGeneration(),
		required: null
	};
	const initialHooksConfig = runtimeConfig.hooksConfig;
	const initialHookClientIpConfig = resolveHookClientIpConfig(cfgAtStart);
	const canvasHostEnabled = runtimeConfig.canvasHostEnabled;
	const rateLimitConfig = cfgAtStart.gateway?.auth?.rateLimit;
	const { rateLimiter: authRateLimiter, browserRateLimiter: browserAuthRateLimiter } = createGatewayAuthRateLimiters(rateLimitConfig);
	const controlUiRootState = await startupTrace.measure("control-ui.root", () => resolveGatewayControlUiRootState({
		controlUiRootOverride,
		controlUiEnabled,
		gatewayRuntime,
		log
	}));
	const wizardRunner = opts.wizardRunner ?? runDefaultSetupWizard;
	const { wizardSessions, findRunningWizard, purgeWizardSession } = createWizardSessionTracker();
	const deps = createDefaultDeps();
	let runtimeState = null;
	let canvasHostServer = null;
	const gatewayTls = await startupTrace.measure("tls.runtime", () => loadGatewayTlsRuntime(cfgAtStart.gateway?.tls, log.child("tls")));
	if (cfgAtStart.gateway?.tls?.enabled && !gatewayTls.enabled) throw new Error(gatewayTls.error ?? "gateway tls: failed to enable");
	const serverStartedAt = Date.now();
	let startupSidecarsReady = minimalTestGateway;
	const channelManager = createChannelManager({
		getRuntimeConfig: () => applyPluginAutoEnable({
			config: getRuntimeConfig(),
			env: process.env
		}).config,
		channelLogs,
		channelRuntimeEnvs,
		resolveChannelRuntime: getChannelRuntime
	});
	const getReadiness = createReadinessChecker({
		channelManager,
		startedAt: serverStartedAt,
		getStartupPending: () => !startupSidecarsReady
	});
	log.info("starting HTTP server...");
	const { canvasHost, releasePluginRouteRegistry, httpServer, httpServers, httpBindHosts, startListening, wss, preauthConnectionBudget, clients, broadcast, broadcastToConnIds, agentRunSeq, dedupe, chatRunState, chatRunBuffers, chatDeltaSentAt, chatDeltaLastBroadcastLen, addChatRun, removeChatRun, chatAbortControllers, toolEventRecipients } = await startupTrace.measure("runtime.state", () => createGatewayRuntimeState({
		cfg: cfgAtStart,
		bindHost,
		port,
		controlUiEnabled,
		controlUiBasePath,
		controlUiRoot: controlUiRootState,
		openAiChatCompletionsEnabled,
		openAiChatCompletionsConfig,
		openResponsesEnabled,
		openResponsesConfig,
		strictTransportSecurityHeader,
		resolvedAuth,
		rateLimiter: authRateLimiter,
		gatewayTls,
		getResolvedAuth,
		hooksConfig: () => runtimeState?.hooksConfig ?? initialHooksConfig,
		getHookClientIpConfig: () => runtimeState?.hookClientIpConfig ?? initialHookClientIpConfig,
		pluginRegistry,
		pinChannelRegistry: !minimalTestGateway,
		deps,
		canvasRuntime,
		canvasHostEnabled,
		allowCanvasHostInTests: opts.allowCanvasHostInTests,
		logCanvas,
		log,
		logHooks,
		logPlugins,
		getReadiness
	}));
	const { nodeRegistry, nodePresenceTimers, sessionEventSubscribers, sessionMessageSubscribers, nodeSendToSession, nodeSendToAllSubscribed, nodeSubscribe, nodeUnsubscribe, nodeUnsubscribeAll, broadcastVoiceWakeChanged, hasMobileNodeConnected } = createGatewayNodeSessionRuntime({ broadcast });
	applyGatewayLaneConcurrency(cfgAtStart);
	runtimeState = createGatewayServerLiveState({
		hooksConfig: initialHooksConfig,
		hookClientIpConfig: initialHookClientIpConfig,
		cronState: buildGatewayCronService({
			cfg: cfgAtStart,
			deps,
			broadcast
		}),
		gatewayMethods: listActiveGatewayMethods(baseGatewayMethods)
	});
	deps.cron = runtimeState.cronState.cron;
	const runClosePrelude = async () => {
		clearCurrentPluginMetadataSnapshot();
		await runGatewayClosePrelude({
			...diagnosticsEnabled ? { stopDiagnostics: stopDiagnosticHeartbeat } : {},
			clearSkillsRefreshTimer: () => {
				if (!runtimeState?.skillsRefreshTimer) return;
				clearTimeout(runtimeState.skillsRefreshTimer);
				runtimeState.skillsRefreshTimer = null;
			},
			skillsChangeUnsub: runtimeState.skillsChangeUnsub,
			...authRateLimiter ? { disposeAuthRateLimiter: () => authRateLimiter.dispose() } : {},
			disposeBrowserAuthRateLimiter: () => browserAuthRateLimiter.dispose(),
			stopModelPricingRefresh: runtimeState.stopModelPricingRefresh,
			stopChannelHealthMonitor: () => runtimeState?.channelHealthMonitor?.stop(),
			clearSecretsRuntimeSnapshot,
			closeMcpServer: closeMcpLoopbackServerOnDemand
		});
	};
	const { getRuntimeSnapshot, startChannels, startChannel, stopChannel, markChannelLoggedOut } = channelManager;
	const refreshGatewayHealthSnapshotWithRuntime = (opts) => refreshGatewayHealthSnapshot({
		...opts,
		getRuntimeSnapshot
	});
	const createCloseHandler = () => createGatewayCloseHandler({
		bonjourStop: runtimeState.bonjourStop,
		tailscaleCleanup: runtimeState.tailscaleCleanup,
		canvasHost,
		canvasHostServer,
		releasePluginRouteRegistry,
		stopChannel,
		pluginServices: runtimeState.pluginServices,
		cron: runtimeState.cronState.cron,
		heartbeatRunner: runtimeState.heartbeatRunner,
		updateCheckStop: runtimeState.stopGatewayUpdateCheck,
		stopTaskRegistryMaintenance,
		nodePresenceTimers,
		broadcast,
		tickInterval: runtimeState.tickInterval,
		healthInterval: runtimeState.healthInterval,
		dedupeCleanup: runtimeState.dedupeCleanup,
		mediaCleanup: runtimeState.mediaCleanup,
		agentUnsub: runtimeState.agentUnsub,
		heartbeatUnsub: runtimeState.heartbeatUnsub,
		transcriptUnsub: runtimeState.transcriptUnsub,
		lifecycleUnsub: runtimeState.lifecycleUnsub,
		chatRunState,
		clients,
		configReloader: runtimeState.configReloader,
		wss,
		httpServer,
		httpServers
	});
	const closeOnStartupFailure = async () => {
		await runClosePrelude();
		await createCloseHandler()({ reason: "gateway startup failed" });
	};
	const broadcastVoiceWakeRoutingChanged = (config) => {
		broadcast("voicewake.routing.changed", { config }, { dropIfSlow: true });
	};
	try {
		const earlyRuntime = await startupTrace.measure("runtime.early", () => startGatewayEarlyRuntime({
			minimalTestGateway,
			cfgAtStart,
			port,
			gatewayTls,
			tailscaleMode,
			log,
			logDiscovery,
			nodeRegistry,
			pluginRegistry,
			broadcast,
			nodeSendToAllSubscribed,
			getPresenceVersion,
			getHealthVersion,
			refreshGatewayHealthSnapshot: refreshGatewayHealthSnapshotWithRuntime,
			logHealth,
			dedupe,
			chatAbortControllers,
			chatRunState,
			chatRunBuffers,
			chatDeltaSentAt,
			chatDeltaLastBroadcastLen,
			removeChatRun,
			agentRunSeq,
			nodeSendToSession,
			...typeof cfgAtStart.media?.ttlHours === "number" ? { mediaCleanupTtlMs: resolveMediaCleanupTtlMs(cfgAtStart.media.ttlHours) } : {},
			skillsRefreshDelayMs: runtimeState.skillsRefreshDelayMs,
			getSkillsRefreshTimer: () => runtimeState.skillsRefreshTimer,
			setSkillsRefreshTimer: (timer) => {
				runtimeState.skillsRefreshTimer = timer;
			},
			getRuntimeConfig
		}));
		runtimeState.bonjourStop = earlyRuntime.bonjourStop;
		runtimeState.skillsChangeUnsub = earlyRuntime.skillsChangeUnsub;
		if (earlyRuntime.maintenance) {
			runtimeState.tickInterval = earlyRuntime.maintenance.tickInterval;
			runtimeState.healthInterval = earlyRuntime.maintenance.healthInterval;
			runtimeState.dedupeCleanup = earlyRuntime.maintenance.dedupeCleanup;
			runtimeState.mediaCleanup = earlyRuntime.maintenance.mediaCleanup;
		}
		Object.assign(runtimeState, startGatewayEventSubscriptions({
			broadcast,
			broadcastToConnIds,
			nodeSendToSession,
			agentRunSeq,
			chatRunState,
			resolveSessionKeyForRun,
			clearAgentRunContext,
			toolEventRecipients,
			sessionEventSubscribers,
			sessionMessageSubscribers,
			chatAbortControllers
		}));
		Object.assign(runtimeState, startGatewayRuntimeServices({
			minimalTestGateway,
			cfgAtStart,
			channelManager,
			log,
			pluginLookUpTable
		}));
		const { execApprovalManager, pluginApprovalManager, extraHandlers } = createGatewayAuxHandlers({
			log,
			activateRuntimeSecrets,
			sharedGatewaySessionGenerationState,
			resolveSharedGatewaySessionGenerationForConfig,
			clients,
			startChannel,
			stopChannel,
			logChannels
		});
		const canvasHostServerPort = canvasHostServer?.port;
		const unavailableGatewayMethods = new Set(minimalTestGateway ? [] : STARTUP_UNAVAILABLE_GATEWAY_METHODS);
		const gatewayRequestContext = createGatewayRequestContext({
			deps,
			runtimeState,
			getRuntimeConfig,
			execApprovalManager,
			pluginApprovalManager,
			loadGatewayModelCatalog,
			getHealthCache,
			refreshHealthSnapshot: refreshGatewayHealthSnapshotWithRuntime,
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
			clients,
			enforceSharedGatewayAuthGenerationForConfigWrite: (nextConfig) => {
				enforceSharedGatewaySessionGenerationForConfigWrite({
					state: sharedGatewaySessionGenerationState,
					nextConfig,
					resolveRuntimeSnapshotGeneration: resolveSharedGatewaySessionGenerationForRuntimeSnapshot,
					clients
				});
			},
			nodeRegistry,
			agentRunSeq,
			chatAbortControllers,
			chatAbortedRuns: chatRunState.abortedRuns,
			chatRunBuffers: chatRunState.buffers,
			chatDeltaSentAt: chatRunState.deltaSentAt,
			chatDeltaLastBroadcastLen: chatRunState.deltaLastBroadcastLen,
			addChatRun,
			removeChatRun,
			subscribeSessionEvents: sessionEventSubscribers.subscribe,
			unsubscribeSessionEvents: sessionEventSubscribers.unsubscribe,
			subscribeSessionMessageEvents: sessionMessageSubscribers.subscribe,
			unsubscribeSessionMessageEvents: sessionMessageSubscribers.unsubscribe,
			unsubscribeAllSessionEvents: (connId) => {
				sessionEventSubscribers.unsubscribe(connId);
				sessionMessageSubscribers.unsubscribeAll(connId);
			},
			getSessionEventSubscriberConnIds: sessionEventSubscribers.getAll,
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
			broadcastVoiceWakeChanged,
			unavailableGatewayMethods,
			broadcastVoiceWakeRoutingChanged
		});
		setFallbackGatewayContextResolver(() => gatewayRequestContext);
		if (!minimalTestGateway) {
			if (deferredConfiguredChannelPluginIds.length > 0) {
				const { reloadDeferredGatewayPlugins } = await import("./server-plugin-bootstrap-Cqhf2lYR.js");
				({pluginRegistry, gatewayMethods: baseGatewayMethods} = reloadDeferredGatewayPlugins({
					cfg: gatewayPluginConfigAtStart,
					activationSourceConfig: startupActivationSourceConfig,
					workspaceDir: defaultWorkspaceDir,
					log,
					coreGatewayMethodNames: baseMethods,
					baseMethods,
					pluginIds: startupPluginIds,
					pluginLookUpTable,
					logDiagnostics: false
				}));
				runtimeState.gatewayMethods = listActiveGatewayMethods(baseGatewayMethods);
			}
		}
		attachGatewayWsHandlers({
			wss,
			clients,
			preauthConnectionBudget,
			port,
			gatewayHost: bindHost ?? void 0,
			canvasHostEnabled: Boolean(canvasHost),
			canvasHostServerPort,
			resolvedAuth,
			getResolvedAuth,
			getRequiredSharedGatewaySessionGeneration: () => getRequiredSharedGatewaySessionGeneration(sharedGatewaySessionGenerationState),
			rateLimiter: authRateLimiter,
			browserRateLimiter: browserAuthRateLimiter,
			gatewayMethods: runtimeState.gatewayMethods,
			events: GATEWAY_EVENTS,
			logGateway: log,
			logHealth,
			logWsControl,
			extraHandlers: {
				...pluginRegistry.gatewayHandlers,
				...extraHandlers
			},
			broadcast,
			context: gatewayRequestContext
		});
		await startListening();
		startupTrace.mark("http.bound");
		const sessionDeliveryRecoveryMaxEnqueuedAt = Date.now();
		({stopGatewayUpdateCheck: runtimeState.stopGatewayUpdateCheck, tailscaleCleanup: runtimeState.tailscaleCleanup, pluginServices: runtimeState.pluginServices} = await startupTrace.measure("runtime.post-attach", () => startGatewayPostAttachRuntime({
			minimalTestGateway,
			cfgAtStart,
			bindHost,
			bindHosts: httpBindHosts,
			port,
			tlsEnabled: gatewayTls.enabled,
			log,
			isNixMode,
			startupStartedAt: opts.startupStartedAt,
			broadcast,
			tailscaleMode,
			resetOnExit: tailscaleConfig.resetOnExit ?? false,
			controlUiBasePath,
			logTailscale,
			gatewayPluginConfigAtStart,
			pluginRegistry,
			defaultWorkspaceDir,
			deps,
			startChannels,
			logHooks,
			logChannels,
			unavailableGatewayMethods,
			onPluginServices: (pluginServices) => {
				runtimeState.pluginServices = pluginServices;
			},
			onSidecarsReady: () => {
				startupSidecarsReady = true;
			},
			startupTrace,
			deferSidecars: opts.deferStartupSidecars === true
		})));
		startupTrace.mark("ready");
		const activated = activateGatewayScheduledServices({
			minimalTestGateway,
			cfgAtStart,
			deps,
			sessionDeliveryRecoveryMaxEnqueuedAt,
			cron: runtimeState.cronState.cron,
			logCron,
			log
		});
		runtimeState.heartbeatRunner = activated.heartbeatRunner;
		runtimeState.configReloader = startManagedGatewayConfigReloader({
			minimalTestGateway,
			initialConfig: cfgAtStart,
			initialCompareConfig: startupLastGoodSnapshot.sourceConfig,
			initialInternalWriteHash: startupInternalWriteHash,
			watchPath: configSnapshot.path,
			readSnapshot: readConfigFileSnapshot,
			recoverSnapshot: recoverConfigFromLastKnownGood,
			promoteSnapshot: promoteConfigSnapshotToLastKnownGood,
			subscribeToWrites: registerConfigWriteListener,
			deps,
			broadcast,
			getState: () => ({
				hooksConfig: runtimeState.hooksConfig,
				hookClientIpConfig: runtimeState.hookClientIpConfig,
				heartbeatRunner: runtimeState.heartbeatRunner,
				cronState: runtimeState.cronState,
				channelHealthMonitor: runtimeState.channelHealthMonitor
			}),
			setState: (nextState) => {
				runtimeState.hooksConfig = nextState.hooksConfig;
				runtimeState.hookClientIpConfig = nextState.hookClientIpConfig;
				runtimeState.heartbeatRunner = nextState.heartbeatRunner;
				runtimeState.cronState = nextState.cronState;
				deps.cron = runtimeState.cronState.cron;
				runtimeState.channelHealthMonitor = nextState.channelHealthMonitor;
			},
			startChannel,
			stopChannel,
			logHooks,
			logChannels,
			logCron,
			logReload,
			channelManager,
			activateRuntimeSecrets,
			resolveSharedGatewaySessionGenerationForConfig,
			sharedGatewaySessionGenerationState,
			clients
		});
		await promoteConfigSnapshotToLastKnownGood(startupLastGoodSnapshot).catch((err) => {
			log.warn(`gateway: failed to promote config last-known-good backup: ${String(err)}`);
		});
	} catch (err) {
		await closeOnStartupFailure();
		throw err;
	}
	const close = createCloseHandler();
	return { close: async (opts) => {
		await runGlobalGatewayStopSafely({
			event: { reason: opts?.reason ?? "gateway stopping" },
			ctx: { port },
			onError: (err) => log.warn(`gateway_stop hook failed: ${String(err)}`)
		});
		await runClosePrelude();
		await close(opts);
	} };
}
//#endregion
export { __resetModelCatalogCacheForTest, startGatewayServer };
