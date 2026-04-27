import { i as formatErrorMessage } from "./errors-Jbvi20TW.js";
import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, d as normalizeStringifiedOptionalString, f as readStringValue, o as normalizeNullableString, s as normalizeOptionalLowercaseString, u as normalizeOptionalThreadValue } from "./string-coerce-C1IzJjqi.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-BNWw3cXT.js";
import { m as resolveUserPath, x as isPlainObject } from "./utils-BMRcljdi.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { n as resolveGlobalSingleton } from "./global-singleton-CqneY5Pr.js";
import { _ as resolveStateDir } from "./paths-BG0ad0P6.js";
import { s as resolveRuntimeServiceVersion } from "./version-DZq9J0ei.js";
import { s as isSecretRef } from "./types.secrets-Zn5Zyn7M.js";
import { t as runTasksWithConcurrency } from "./run-with-concurrency-jYHyKOXI.js";
import "./auth-CksiX7Zk.js";
import { t as resolveEffectiveSharedGatewayAuth } from "./auth-resolve-D9xbkIJh.js";
import { t as sameFileIdentity } from "./file-identity-DBd-elc3.js";
import { o as normalizePluginsConfig } from "./config-state-UvzNc3si.js";
import { $ as normalizeTalkSection, B as shouldAttemptLastKnownGoodRecovery, Q as buildTalkConfigResponse, T as validateConfigObjectWithPlugins, a as loadConfig, d as readConfigFileSnapshotForWrite, et as resolveActiveTalkProviderConfig, o as parseConfigJson5, r as createConfigIO, u as readConfigFileSnapshot, v as resolveConfigSnapshotHash, y as writeConfigFile } from "./io-Dv_xNAZB.js";
import { i as asOptionalRecord, n as asNullableRecord } from "./record-coerce-BpObaVhi.js";
import { a as isSubagentSessionKey, c as parseThreadSessionSuffix, n as isAcpSessionKey, o as parseAgentSessionKey } from "./session-key-utils-BT0y7mVK.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-C3j_3_su.js";
import { c as normalizeAgentId, h as toAgentStoreSessionKey, o as classifySessionKeyShape, t as DEFAULT_AGENT_ID, u as resolveAgentIdFromSessionKey } from "./session-key-EpIbK3Oz.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
import { i as normalizeChannelId, r as listChannelPlugins, t as getChannelPlugin } from "./registry-B2TRwbJD.js";
import { r as DEFAULT_PROVIDER } from "./defaults-DM8yIn8C.js";
import { i as applyMergePatch } from "./schema-validator-BKDxqOUA.js";
import { a as DEFAULT_IDENTITY_FILENAME, c as DEFAULT_TOOLS_FILENAME, i as DEFAULT_HEARTBEAT_FILENAME, l as DEFAULT_USER_FILENAME, o as DEFAULT_MEMORY_FILENAME, p as isWorkspaceSetupCompleted, r as DEFAULT_BOOTSTRAP_FILENAME, s as DEFAULT_SOUL_FILENAME, t as DEFAULT_AGENTS_FILENAME, u as ensureAgentWorkspace } from "./workspace-DiB6mKpP.js";
import { b as resolveAgentWorkspaceDir, g as listAgentIds, h as listAgentEntries, p as resolveSessionAgentId, x as resolveDefaultAgentId, y as resolveAgentDir } from "./agent-scope-_6dFncNS.js";
import { r as parseByteSize } from "./zod-schema-Q-_hlOBD.js";
import "./config-yDDhhyz6.js";
import { r as setSafeTimeout } from "./timer-delay-Co_I1iPe.js";
import { n as normalizeDeviceAuthScopes } from "./device-auth-7WDS2Ilv.js";
import { $ as validateNodeDescribeParams, $t as validateWebLoginWaitParams, A as validateCronAddParams, At as validateSessionsMessagesSubscribeParams, B as validateDevicePairRemoveParams, Bt as validateSkillsInstallParams, C as validateConfigGetParams, Ct as validateSessionsCompactionBranchParams, D as validateConfigSchemaParams, Dt as validateSessionsCreateParams, E as validateConfigSchemaLookupResult, Et as validateSessionsCompactionRestoreParams, F as validateCronStatusParams, Ft as validateSessionsResolveParams, Gt as validateTalkModeParams, H as validateDeviceTokenRotateParams, Ht as validateSkillsStatusParams, I as validateCronUpdateParams, It as validateSessionsSendParams, J as validateExecApprovalsNodeSetParams, Jt as validateToolsCatalogParams, K as validateExecApprovalsGetParams, Kt as validateTalkRealtimeSessionParams, L as validateDevicePairApproveParams, Lt as validateSessionsUsageParams, M as validateCronRemoveParams, Mt as validateSessionsPatchParams, N as validateCronRunParams, Nt as validateSessionsPreviewParams, O as validateConfigSetParams, Ot as validateSessionsDeleteParams, P as validateCronRunsParams, Pt as validateSessionsResetParams, Q as validateModelsListParams, Qt as validateWebLoginStartParams, R as validateDevicePairListParams, Rt as validateSkillsBinsParams, S as validateConfigApplyParams, St as validateSessionsCompactParams, T as validateConfigSchemaLookupParams, Tt as validateSessionsCompactionListParams, Ut as validateSkillsUpdateParams, V as validateDeviceTokenRevokeParams, Vt as validateSkillsSearchParams, Wt as validateTalkConfigParams, X as validateLogsTailParams, Xt as validateUpdateRunParams, Y as validateExecApprovalsSetParams, Yt as validateToolsEffectiveParams, Z as validateMessageActionParams, Zt as validateWakeParams, a as validateAgentParams, an as errorShape, at as validateNodePairListParams, bt as validateSendParams, c as validateAgentsDeleteParams, ct as validateNodePairVerifyParams, d as validateAgentsFilesSetParams, dt as validateNodePendingEnqueueParams, en as validateWizardCancelParams, et as validateNodeEventParams, f as validateAgentsListParams, ft as validateNodeRenameParams, g as validateChannelsStatusParams, gt as validatePushTestParams, h as validateChannelsStartParams, ht as validatePollParams, i as validateAgentIdentityParams, in as ErrorCodes, it as validateNodePairApproveParams, j as validateCronListParams, jt as validateSessionsMessagesUnsubscribeParams, kt as validateSessionsListParams, l as validateAgentsFilesGetParams, lt as validateNodePendingAckParams, m as validateChannelsLogoutParams, nn as validateWizardStartParams, nt as validateNodeInvokeResultParams, o as validateAgentWaitParams, on as COMMAND_DESCRIPTION_MAX_LENGTH, ot as validateNodePairRejectParams, p as validateAgentsUpdateParams, q as validateExecApprovalsNodeGetParams, qt as validateTalkSpeakParams, r as formatValidationErrors, rn as validateWizardStatusParams, rt as validateNodeListParams, s as validateAgentsCreateParams, st as validateNodePairRequestParams, tn as validateWizardNextParams, tt as validateNodeInvokeParams, u as validateAgentsFilesListParams, ut as validateNodePendingDrainParams, w as validateConfigPatchParams, wt as validateSessionsCompactionGetParams, x as validateCommandsListParams, xt as validateSessionsAbortParams, z as validateDevicePairRejectParams, zt as validateSkillsDetailParams } from "./client-kQ1-TM3I.js";
import { i as publicKeyRawBase64UrlFromPem, n as loadOrCreateDeviceIdentity } from "./device-identity-Bds8sWW-.js";
import { _ as hasGatewayClientCap, c as isGatewayMessageChannel, h as GATEWAY_CLIENT_MODES, m as GATEWAY_CLIENT_IDS, p as GATEWAY_CLIENT_CAPS, s as isDeliverableMessageChannel, u as normalizeMessageChannel } from "./message-channel-C2Lnao8s.js";
import "./message-channel-core-3ccLmc54.js";
import { a as normalizeInputProvenance } from "./input-provenance-IJ6YNe09.js";
import { i as isNodeRoleMethod, n as authorizeOperatorScopesForMethod, o as ADMIN_SCOPE$1, u as TALK_SECRETS_SCOPE } from "./method-scopes-B1c_GUbd.js";
import { n as formatConfigIssueLines } from "./issue-format-DpSVQL-G.js";
import { n as pickBestEffortPrimaryLanIPv4 } from "./network-discovery-display-CsxO_oTF.js";
import { i as resolveAssistantAvatarUrl } from "./control-ui-shared-D1cbU4u6.js";
import { n as ensureAuthProfileStore } from "./store-CfHec0eX.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-BKDUQLPR.js";
import { r as loadOpenClawPlugins } from "./loader-NucjcOgv.js";
import { B as resolveMemoryLightDreamingConfig, F as resolveMemoryDeepDreamingConfig, I as resolveMemoryDreamingConfig, L as resolveMemoryDreamingPluginConfig, N as isSameMemoryDreamingDay, V as resolveMemoryRemDreamingConfig, z as resolveMemoryDreamingWorkspaces } from "./dreaming-K8xreO0H.js";
import "./plugins-BZ_I3cWH.js";
import { s as getPluginCommandSpecs } from "./command-registration-lrx31fSB.js";
import { i as hasInternalHookListeners, m as triggerInternalHook } from "./internal-hooks-BxzYnhn4.js";
import { S as createEmptyPluginRegistry, a as getActivePluginRegistry, d as pinActivePluginChannelRegistry, n as getActivePluginChannelRegistryVersion, s as getActivePluginRegistryVersion, x as setActivePluginRegistry } from "./runtime-BFywV6BM.js";
import { n as withPluginRuntimeGatewayRequestScope, t as getPluginRuntimeGatewayRequestScope } from "./gateway-request-scope-D6nplzWA.js";
import { r as createPluginRuntimeLoaderLogger } from "./load-context-D240_UuB.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-Df60yWjf.js";
import { d as normalizeReasoningLevel, f as normalizeThinkLevel } from "./thinking-C1TCb8El.js";
import { b as normalizeModelRef, x as parseModelRef } from "./model-selection-shared-grYiFZof.js";
import { t as buildAllowedModelSet } from "./model-selection-hTT37jzm.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-CkOd5v2f.js";
import { n as resolveAgentIdentity } from "./identity-lSr9N8UI.js";
import { i as resolveMainSessionKey, n as resolveAgentMainSessionKey, r as resolveExplicitAgentSessionKey } from "./main-session-BzfGEj6I.js";
import { n as canonicalizeSpawnedByForAgent, t as loadCombinedSessionStoreForGateway } from "./combined-store-gateway-qDHoxMjQ.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath, l as resolveSessionTranscriptsDirForAgent } from "./paths-DvU8Tgvw.js";
import { a as normalizeSessionDeliveryFields, i as normalizeDeliveryContext, r as mergeDeliveryContext, t as deliveryContextFromSession } from "./delivery-context.shared-BRwSoIeK.js";
import { t as loadSessionStore } from "./store-load-Cf3NDflc.js";
import { n as mergeSessionEntry } from "./types--vJusqfs.js";
import { o as updateSessionStore } from "./store-Bm25Mivo.js";
import { n as resolveMainSessionKeyFromConfig, t as extractDeliveryInfo } from "./sessions-DIdqAx7y.js";
import { n as readJsonFile, r as writeJsonAtomic, t as createAsyncLock } from "./json-files-GTuV9u4G.js";
import { l as onAgentEvent, u as registerAgentRunContext } from "./agent-events-DMk-SEBA.js";
import { n as getLatestSubagentRunByChildSessionKey } from "./subagent-registry-read-BNOaD8Y-.js";
import { a as readSessionPreviewItemsFromTranscript, i as readSessionMessages } from "./session-utils.fs-BDLex3kU.js";
import { a as resolveSessionTranscriptCandidates, t as archiveFileOnDisk } from "./session-transcript-files.fs-rIur1Jet.js";
import { a as loadSessionEntry, c as resolveDeletedAgentIdFromSessionKey, d as resolveGatewaySessionStoreTarget, i as loadGatewaySessionRow, l as resolveFreshestSessionEntryFromStoreKeys, n as listAgentsForGateway, o as migrateAndPruneGatewaySessionStoreKey, p as resolveSessionModelRef, r as listSessionsFromStore, u as resolveGatewayModelSupportsImages } from "./session-utils-0WhEvb4B.js";
import { h as listSessionCompactionCheckpoints, m as getSessionCompactionCheckpoint } from "./build-kU7gC1rL.js";
import { i as normalizeCronJobPatch, n as normalizeCronJobCreate } from "./openclaw-tools-BIHCDPUL.js";
import { _ as listCoreToolSections, h as PROFILE_OPTIONS, v as resolveCoreToolProfiles } from "./tool-policy-DArLXMH2.js";
import { n as getPluginToolMeta, r as resolvePluginTools } from "./tools-CZr3orc0.js";
import { n as redactConfigSnapshot, r as restoreRedactedValues, t as redactConfigObject } from "./redact-snapshot-D4wjPRM1.js";
import { C as synthesizeSpeech, S as setTtsProvider, b as setTtsEnabled, c as isTtsEnabled, f as resolveExplicitTtsOverrides, g as resolveTtsProviderOrder, h as resolveTtsPrefsPath, i as getResolvedSpeechProviderConfig, l as isTtsProviderConfigured, m as resolveTtsConfig, o as getTtsProvider, p as resolveTtsAutoMode, w as textToSpeech } from "./tts-VTd__uez.js";
import "./auth-profiles-DFHxywz9.js";
import { s as projectOutboundPayloadPlanForMirror, t as createOutboundPayloadPlan } from "./payloads-YFQezhXJ.js";
import { g as writeFileWithinRoot, s as openFileWithinRoot, t as SafeOpenError, u as readFileWithinRoot } from "./fs-safe-CezDxq3P.js";
import { d as mergeExecApprovalsSocketDefaults, j as saveExecApprovals, o as ensureExecApprovals, p as normalizeExecApprovals, y as readExecApprovalsSnapshot } from "./exec-approvals-BbaGmaa4.js";
import { a as prepareSecretsRuntimeSnapshot } from "./runtime-rZgU3obN.js";
import { i as parseAbsoluteTimeMs } from "./stagger-C2S8RnSi.js";
import { r as isInvalidCronSessionTargetIdError } from "./webhook-url-GrfNsneR.js";
import { d as writeRestartSentinel, r as formatDoctorNonInteractiveHint } from "./restart-sentinel-C0D17vX5.js";
import { o as scheduleGatewaySigusr1Restart } from "./restart-BEePx4vW.js";
import { o as listConfiguredAnnounceChannelIdsForConfig, r as resolveGatewayStartupPluginIds } from "./channel-plugin-ids-Dc_n_j0K.js";
import { i as resolveOutboundSessionRoute, r as ensureOutboundSessionEntry, s as dispatchChannelMessageAction } from "./message-action-runner-XHSiiyAO.js";
import { n as normalizePollInput } from "./polls-BXI9BNej.js";
import { t as deliverOutboundPayloads } from "./deliver-pZGUQZmf.js";
import { n as resolveOutboundChannelPlugin } from "./channel-resolution-DJ2J0Lg5.js";
import { n as resolveMessageChannelSelection } from "./channel-selection-JAh2lTW-.js";
import "./target-resolver-8o_pahhn.js";
import { t as maybeResolveIdLikeTarget } from "./target-id-resolution-C9qgPp9N.js";
import { i as resolveReplyToMode } from "./reply-threading-CKrwAPQs.js";
import { t as buildOutboundSessionContext } from "./session-context-B4Xwd9dH.js";
import { i as resolveChannelDefaultAccountId } from "./helpers-TGDlD7dJ.js";
import { r as resolveOutboundTarget } from "./targets-BFEf9-hz.js";
import { t as extractToolPayload } from "./tool-payload-Co22MpUY.js";
import { i as setHeartbeatsEnabled } from "./heartbeat-wake-gACR6ANS.js";
import { i as enqueueSystemEvent, o as isSystemEventContextChanged } from "./system-events-B6vO-QxY.js";
import { r as createRunningTaskRun } from "./detached-task-runtime-D2eWnRin.js";
import { a as clearSessionQueues } from "./queue-DHEUr0Dd.js";
import { n as shouldDowngradeDeliveryToSessionOnly } from "./best-effort-delivery-cmVsa-aC.js";
import { a as isEmbeddedPiRunActive, f as waitForEmbeddedPiRunEnd, t as abortEmbeddedPiRun } from "./runs-D_jbdUDe.js";
import { h as normalizeDiagnosticStabilityQuery, m as getDiagnosticStabilitySnapshot } from "./diagnostic-stability-bundle-CqC59U0o.js";
import { t as resolveAgentTimeoutMs } from "./timeout-TgWmyBUs.js";
import { n as normalizeSpawnedRunMetadata, r as resolveIngressWorkspaceOverrideForSpawnedRun } from "./spawned-context-7b-pqA3M.js";
import { o as loadWorkspaceSkillEntries } from "./workspace-7Uj_FaPS.js";
import "./skills-ClcFefyl.js";
import { n as getActiveMemorySearchManager } from "./memory-runtime-CKatHNRH.js";
import { n as compactEmbeddedPiSession } from "./pi-embedded-Cic3zlxn.js";
import { o as resolvePreferredSessionKeyForSessionIdMatches } from "./live-model-switch-C-99YSoH.js";
import { t as primeConfiguredBindingRegistry } from "./binding-registry-91VaibhB.js";
import { r as listPluginCommands } from "./commands-DeM9wUEE.js";
import { i as setGatewaySubagentRuntime, r as setGatewayNodesRuntime } from "./gateway-bindings-f4lixXGG.js";
import { r as listChatCommandsForConfig } from "./commands-registry-list-BcqSFuWe.js";
import "./commands-registry-D1HuZY_U.js";
import { n as resolveSendPolicy } from "./send-policy-CeDRAbMh.js";
import { t as getChannelActivity } from "./channel-activity-Cd93U4xD.js";
import { t as WizardCancelledError } from "./prompts-ocoL7LgP.js";
import { n as summarizeToolDescriptionText } from "./tool-description-summary-BaOXylzT.js";
import { t as resolveEffectiveToolInventory } from "./tools-effective-inventory--HD_uS52.js";
import { i as resolveBareSessionResetPromptState, n as shouldApplyStartupContext, r as resolveBareResetBootstrapFileAccess, t as buildSessionStartupContextPrelude } from "./startup-context-T0Kl6rrH.js";
import { r as getLastHeartbeatEvent } from "./heartbeat-visibility-D5nIKHUQ.js";
import { r as mergeIdentityMarkdownContent } from "./identity-file-BHDsQals.js";
import { r as agentCommandFromIngress } from "./agent-command-jyqmBJy2.js";
import { n as getSpeechProvider, r as listSpeechProviders, t as canonicalizeSpeechProviderId } from "./provider-registry-Be32s6G6.js";
import { t as bumpSkillsSnapshotVersion } from "./refresh-state-BnK3h63w.js";
import { n as invokeNativeHookRelay } from "./native-hook-relay-DIedTJhk.js";
import { i as resolveNodeCommandAllowlist, n as isNodeCommandAllowed } from "./node-command-policy-CJr8CKnd.js";
import { t as formatForLog } from "./ws-log-BpAFVX4j.js";
import { i as safeParseJson, n as respondUnavailableOnNodeInvokeError, r as respondUnavailableOnThrow, t as respondInvalidParams } from "./nodes.helpers-DF8WtLOs.js";
import { t as canExecRequestNode } from "./exec-defaults-B7H_PKCQ.js";
import { t as listAgentWorkspaceDirs } from "./workspace-dirs-BTGzrLGK.js";
import { o as resolveMissingRequestedScope } from "./pairing-token-DBydzQ85.js";
import { d as listNodePairing, f as rejectNodePairing, g as verifyNodeToken, l as approveNodePairing, m as requestNodePairing, p as renamePairedNode, t as getRemoteSkillEligibility } from "./skills-remote-DhFcvH40.js";
import { t as listSkillCommandsForAgents } from "./skill-commands-BmJTm0yc.js";
import { a as getPairedDevice, c as listApprovedPairedDeviceRoles, d as rejectDevicePairing, f as removePairedDevice, g as summarizeDeviceTokens, h as rotateDeviceToken, i as formatDevicePairingForbiddenMessage, l as listDevicePairing, m as revokeDeviceToken, n as approveDevicePairing, o as getPendingDevicePairing, s as hasEffectivePairedDeviceRole } from "./device-pairing-DFwfBQIP.js";
import { o as REALTIME_VOICE_AGENT_CONSULT_TOOL, r as getRealtimeVoiceProvider, s as REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME, t as resolveConfiguredRealtimeVoiceProvider } from "./provider-resolver-DacJ9YDL.js";
import { n as PROVIDER_LABELS, o as resolveUsageProviderId } from "./provider-usage.shared-CcKpxFl6.js";
import { n as createOutboundSendDeps } from "./deps-DWoMp43P.js";
import "./agent-CUupwmHt.js";
import { a as matchSystemRunApprovalBinding, c as toSystemRunApprovalMismatchError, n as resolveSystemRunCommandRequest, o as missingSystemRunApprovalBinding, r as buildSystemRunApprovalBinding } from "./system-run-command-CfjlV1SF.js";
import { r as resolveSystemRunApprovalRuntimeContext } from "./system-run-approval-context-C-elhxlO.js";
import { n as resolveAgentOutboundTarget, t as resolveAgentDeliveryPlan } from "./agent-delivery-DLNPPuOh.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-em-C5ATv.js";
import { d as waitForTerminalGatewayDedupe, g as resolveAgentRunExpiresAtMs, h as registerChatAbortController, i as chatHandlers, l as readTerminalSnapshotFromGatewayDedupe, u as setGatewayDedupeEntry } from "./chat-DznnoAn8.js";
import { n as MediaOffloadError, r as parseMessageWithAttachments, t as normalizeRpcAttachmentsToChatAttachments } from "./attachment-normalize-CLmQYpC1.js";
import { n as timestampOptsFromConfig, t as injectTimestamp } from "./agent-timestamp-CCVfFLOP.js";
import { t as resolveSessionKeyFromResolveParams } from "./sessions-resolve-RTqIWdP3.js";
import { t as loadProviderUsageSummary } from "./provider-usage-CVUrmamO.js";
import { o as fetchClawHubSkillDetail } from "./clawhub-DUtsrJs-.js";
import { a as loadSessionUsageTimeSeries, i as loadSessionLogs, n as loadCostUsageSummary, o as resolveExistingUsageSessionFile, r as loadSessionCostSummary, t as discoverAllSessions } from "./session-cost-usage-BrTsjwcB.js";
import { n as buildAuthHealthSummary, r as formatRemainingShort } from "./auth-health-Cmwwkt8U.js";
import { n as movePathToTrash } from "./browser-maintenance-ve9Zd2oU.js";
import { a as performGatewaySessionReset } from "./session-reset-service-BNUgIDrs.js";
import { t as buildChannelUiCatalog } from "./catalog-CjDkis1A.js";
import { a as removeBackfillDiaryEntries, c as writeBackfillDiaryEntries, n as dedupeDreamDiaryEntries, o as removeGroundedShortTermCandidates, r as previewGroundedRemMarkdown, s as repairDreamingArtifacts } from "./memory-core-bundled-runtime-C8BMtt6o.js";
import { r as lookupConfigSchema, t as loadGatewayRuntimeConfigSchema } from "./runtime-schema-cADw9D2m.js";
import { t as readConfiguredLogTail } from "./log-tail-g_dCiGrz.js";
import { n as purgeAgentSessionStoreEntries } from "./agents.command-shared-FKrUGAF4.js";
import { o as pruneAgentConfig, r as findAgentEntryIndex, t as applyAgentConfig } from "./agents.config-g0JNazYz.js";
import { t as installSkill } from "./skills-install-AV2OrCdz.js";
import { m as normalizeUpdateChannel } from "./update-check-DdV49UgC.js";
import "./status-Bbq8O8Sk.js";
import { t as getStatusSummary } from "./status.summary-C01SEF7j.js";
import { i as updateSkillsFromClawHub, r as searchSkillsFromClawHub, t as installSkillFromClawHub } from "./skills-clawhub-C7FIkpMH.js";
import { t as applySessionsPatchToStore } from "./sessions-patch-BSXtpxBc.js";
import { t as runGatewayUpdate } from "./update-runner--aolGbN7.js";
import { t as buildChannelAccountSnapshot } from "./status-CeaWizHL.js";
import { _ as resolveDeliveryTarget, n as applyJobPatch } from "./jobs-Dy87ilE4.js";
import { n as resolveAssistantIdentity } from "./assistant-identity-B3FaldPb.js";
import { a as resolveApnsAuthConfigFromEnv, d as resolveApnsRelayConfigFromEnv, n as loadApnsRegistration, o as sendApnsAlert, r as normalizeApnsEnvironment, s as sendApnsBackgroundWake, t as clearApnsRegistrationIfCurrent, u as shouldClearStoredApnsRegistration } from "./push-apns-LOaUnfiY.js";
import "./heartbeat-runner-CjYcq5k0.js";
import fs from "node:fs";
import path from "node:path";
import { execFile, spawnSync } from "node:child_process";
import os from "node:os";
import fs$1 from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { randomBytes, randomUUID } from "node:crypto";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";
import chokidar from "chokidar";
//#region src/gateway/control-plane-audit.ts
function normalizePart$1(value, fallback) {
	if (typeof value !== "string") return fallback;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : fallback;
}
function resolveControlPlaneActor(client) {
	return {
		actor: normalizePart$1(client?.connect?.client?.id, "unknown-actor"),
		deviceId: normalizePart$1(client?.connect?.device?.id, "unknown-device"),
		clientIp: normalizePart$1(client?.clientIp, "unknown-ip"),
		connId: normalizePart$1(client?.connId, "unknown-conn")
	};
}
function formatControlPlaneActor(actor) {
	return `actor=${actor.actor} device=${actor.deviceId} ip=${actor.clientIp} conn=${actor.connId}`;
}
function summarizeChangedPaths(paths, maxPaths = 8) {
	if (paths.length === 0) return "<none>";
	if (paths.length <= maxPaths) return paths.join(",");
	return `${paths.slice(0, maxPaths).join(",")},+${paths.length - maxPaths} more`;
}
//#endregion
//#region src/gateway/control-plane-rate-limit.ts
const CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS = 3;
const CONTROL_PLANE_RATE_LIMIT_WINDOW_MS = 6e4;
const CONTROL_PLANE_BUCKET_MAX_STALE_MS = 5 * 6e4;
/** Hard cap to prevent memory DoS from rapid unique-key injection (CWE-400). */
const CONTROL_PLANE_BUCKET_MAX_ENTRIES = 1e4;
const controlPlaneBuckets = /* @__PURE__ */ new Map();
function normalizePart(value, fallback) {
	if (typeof value !== "string") return fallback;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : fallback;
}
function resolveControlPlaneRateLimitKey(client) {
	const deviceId = normalizePart(client?.connect?.device?.id, "unknown-device");
	const clientIp = normalizePart(client?.clientIp, "unknown-ip");
	if (deviceId === "unknown-device" && clientIp === "unknown-ip") {
		const connId = normalizePart(client?.connId, "");
		if (connId) return `${deviceId}|${clientIp}|conn=${connId}`;
	}
	return `${deviceId}|${clientIp}`;
}
function consumeControlPlaneWriteBudget(params) {
	const nowMs = params.nowMs ?? Date.now();
	const key = resolveControlPlaneRateLimitKey(params.client);
	const bucket = controlPlaneBuckets.get(key);
	if (!bucket || nowMs - bucket.windowStartMs >= CONTROL_PLANE_RATE_LIMIT_WINDOW_MS) {
		if (!controlPlaneBuckets.has(key) && controlPlaneBuckets.size >= CONTROL_PLANE_BUCKET_MAX_ENTRIES) {
			const oldest = controlPlaneBuckets.keys().next().value;
			if (oldest !== void 0) controlPlaneBuckets.delete(oldest);
		}
		controlPlaneBuckets.set(key, {
			count: 1,
			windowStartMs: nowMs
		});
		return {
			allowed: true,
			retryAfterMs: 0,
			remaining: CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS - 1,
			key
		};
	}
	if (bucket.count >= CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS) return {
		allowed: false,
		retryAfterMs: Math.max(0, bucket.windowStartMs + CONTROL_PLANE_RATE_LIMIT_WINDOW_MS - nowMs),
		remaining: 0,
		key
	};
	bucket.count += 1;
	return {
		allowed: true,
		retryAfterMs: 0,
		remaining: Math.max(0, CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS - bucket.count),
		key
	};
}
/**
* Remove buckets whose rate-limit window expired more than
* CONTROL_PLANE_BUCKET_MAX_STALE_MS ago.  Called periodically
* by the gateway maintenance timer to prevent unbounded growth.
*/
function pruneStaleControlPlaneBuckets(nowMs = Date.now()) {
	let pruned = 0;
	for (const [key, bucket] of controlPlaneBuckets) if (nowMs - bucket.windowStartMs > CONTROL_PLANE_BUCKET_MAX_STALE_MS) {
		controlPlaneBuckets.delete(key);
		pruned += 1;
	}
	return pruned;
}
//#endregion
//#region src/gateway/role-policy.ts
function parseGatewayRole(roleRaw) {
	if (roleRaw === "operator" || roleRaw === "node") return roleRaw;
	return null;
}
function roleCanSkipDeviceIdentity(role, sharedAuthOk) {
	return role === "operator" && sharedAuthOk;
}
function isRoleAuthorizedForMethod(role, method) {
	if (isNodeRoleMethod(method)) return role === "node";
	return role === "operator";
}
//#endregion
//#region src/gateway/session-subagent-reactivation.ts
async function loadSessionSubagentReactivationRuntime() {
	return import("./session-subagent-reactivation.runtime-jITvUZ3D.js");
}
async function reactivateCompletedSubagentSession(params) {
	const runId = params.runId?.trim();
	if (!runId) return false;
	const existing = getLatestSubagentRunByChildSessionKey(params.sessionKey);
	if (!existing || typeof existing.endedAt !== "number") return false;
	const { replaceSubagentRunAfterSteer } = await loadSessionSubagentReactivationRuntime();
	return replaceSubagentRunAfterSteer({
		previousRunId: existing.runId,
		nextRunId: runId,
		fallback: existing,
		runTimeoutSeconds: existing.runTimeoutSeconds ?? 0
	});
}
//#endregion
//#region src/gateway/server-methods/agent-job.ts
const AGENT_RUN_CACHE_TTL_MS = 10 * 6e4;
/**
* Embedded runs can emit transient lifecycle `error` events while auth/model
* failover is still in progress. Give errors a short grace window so a
* subsequent `start` event can cancel premature terminal snapshots.
*/
const AGENT_RUN_ERROR_RETRY_GRACE_MS = 15e3;
/**
* Some embedded runtimes emit an intermediate lifecycle `end` with
* `aborted=true` immediately before retrying the same run. Hold timeout
* snapshots briefly so `agent.wait` does not resolve to a stale timeout when a
* final success is about to arrive.
*/
const AGENT_RUN_TIMEOUT_RETRY_GRACE_MS = 15e3;
const agentRunCache = /* @__PURE__ */ new Map();
const agentRunStarts = /* @__PURE__ */ new Map();
const pendingAgentRunErrors = /* @__PURE__ */ new Map();
const pendingAgentRunTimeouts = /* @__PURE__ */ new Map();
let agentRunListenerStarted = false;
function pruneAgentRunCache(now = Date.now()) {
	for (const [runId, entry] of agentRunCache) if (now - entry.ts > AGENT_RUN_CACHE_TTL_MS) agentRunCache.delete(runId);
}
function recordAgentRunSnapshot(entry) {
	pruneAgentRunCache(entry.ts);
	agentRunCache.set(entry.runId, entry);
}
function clearPendingAgentRunError(runId) {
	const pending = pendingAgentRunErrors.get(runId);
	if (!pending) return;
	clearTimeout(pending.timer);
	pendingAgentRunErrors.delete(runId);
}
function clearPendingAgentRunTimeout(runId) {
	const pending = pendingAgentRunTimeouts.get(runId);
	if (!pending) return;
	clearTimeout(pending.timer);
	pendingAgentRunTimeouts.delete(runId);
}
function schedulePendingAgentRunError(snapshot) {
	clearPendingAgentRunTimeout(snapshot.runId);
	clearPendingAgentRunError(snapshot.runId);
	const dueAt = Date.now() + AGENT_RUN_ERROR_RETRY_GRACE_MS;
	const timer = setTimeout(() => {
		const pending = pendingAgentRunErrors.get(snapshot.runId);
		if (!pending) return;
		pendingAgentRunErrors.delete(snapshot.runId);
		recordAgentRunSnapshot(pending.snapshot);
	}, AGENT_RUN_ERROR_RETRY_GRACE_MS);
	timer.unref?.();
	pendingAgentRunErrors.set(snapshot.runId, {
		snapshot,
		dueAt,
		timer
	});
}
function schedulePendingAgentRunTimeout(snapshot) {
	clearPendingAgentRunError(snapshot.runId);
	clearPendingAgentRunTimeout(snapshot.runId);
	const dueAt = Date.now() + AGENT_RUN_TIMEOUT_RETRY_GRACE_MS;
	const timer = setTimeout(() => {
		const pending = pendingAgentRunTimeouts.get(snapshot.runId);
		if (!pending) return;
		pendingAgentRunTimeouts.delete(snapshot.runId);
		recordAgentRunSnapshot(pending.snapshot);
	}, AGENT_RUN_TIMEOUT_RETRY_GRACE_MS);
	timer.unref?.();
	pendingAgentRunTimeouts.set(snapshot.runId, {
		snapshot,
		dueAt,
		timer
	});
}
function getPendingAgentRunError(runId) {
	const pending = pendingAgentRunErrors.get(runId);
	if (!pending) return;
	return {
		snapshot: pending.snapshot,
		dueAt: pending.dueAt
	};
}
function getPendingAgentRunTimeout(runId) {
	const pending = pendingAgentRunTimeouts.get(runId);
	if (!pending) return;
	return {
		snapshot: pending.snapshot,
		dueAt: pending.dueAt
	};
}
function createSnapshotFromLifecycleEvent(params) {
	const { runId, phase, data } = params;
	const startedAt = typeof data?.startedAt === "number" ? data.startedAt : agentRunStarts.get(runId);
	const endedAt = typeof data?.endedAt === "number" ? data.endedAt : void 0;
	const error = typeof data?.error === "string" ? data.error : void 0;
	return {
		runId,
		status: phase === "error" ? "error" : data?.aborted ? "timeout" : "ok",
		startedAt,
		endedAt,
		error,
		ts: Date.now()
	};
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
			clearPendingAgentRunError(evt.runId);
			clearPendingAgentRunTimeout(evt.runId);
			agentRunCache.delete(evt.runId);
			return;
		}
		if (phase !== "end" && phase !== "error") return;
		const snapshot = createSnapshotFromLifecycleEvent({
			runId: evt.runId,
			phase,
			data: evt.data
		});
		agentRunStarts.delete(evt.runId);
		if (phase === "error") {
			schedulePendingAgentRunError(snapshot);
			return;
		}
		if (snapshot.status === "timeout") {
			schedulePendingAgentRunTimeout(snapshot);
			return;
		}
		clearPendingAgentRunError(evt.runId);
		clearPendingAgentRunTimeout(evt.runId);
		recordAgentRunSnapshot(snapshot);
	});
}
function getCachedAgentRun(runId) {
	pruneAgentRunCache();
	return agentRunCache.get(runId);
}
async function waitForAgentJob(params) {
	const { runId, timeoutMs, signal, ignoreCachedSnapshot = false } = params;
	ensureAgentRunListener();
	const cached = ignoreCachedSnapshot ? void 0 : getCachedAgentRun(runId);
	if (cached) return cached;
	if (timeoutMs <= 0 || signal?.aborted) return null;
	return await new Promise((resolve) => {
		let settled = false;
		let pendingErrorTimer;
		let pendingTimeoutTimer;
		let onAbort;
		const clearPendingErrorTimer = () => {
			if (!pendingErrorTimer) return;
			clearTimeout(pendingErrorTimer);
			pendingErrorTimer = void 0;
		};
		const clearPendingTimeoutTimer = () => {
			if (!pendingTimeoutTimer) return;
			clearTimeout(pendingTimeoutTimer);
			pendingTimeoutTimer = void 0;
		};
		const finish = (entry) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			clearPendingErrorTimer();
			clearPendingTimeoutTimer();
			unsubscribe();
			if (onAbort) signal?.removeEventListener("abort", onAbort);
			resolve(entry);
		};
		const scheduleTerminalFinish = (kind, snapshot, delayMs) => {
			clearPendingErrorTimer();
			clearPendingTimeoutTimer();
			const timerRef = setSafeTimeout(() => {
				const latest = ignoreCachedSnapshot ? void 0 : getCachedAgentRun(runId);
				if (latest) {
					finish(latest);
					return;
				}
				recordAgentRunSnapshot(snapshot);
				finish(snapshot);
			}, delayMs);
			timerRef.unref?.();
			if (kind === "error") pendingErrorTimer = timerRef;
			else pendingTimeoutTimer = timerRef;
		};
		const scheduleErrorFinish = (snapshot, delayMs = AGENT_RUN_ERROR_RETRY_GRACE_MS) => {
			scheduleTerminalFinish("error", snapshot, delayMs);
		};
		const scheduleTimeoutFinish = (snapshot, delayMs = AGENT_RUN_TIMEOUT_RETRY_GRACE_MS) => {
			scheduleTerminalFinish("timeout", snapshot, delayMs);
		};
		if (!ignoreCachedSnapshot) {
			const pendingError = getPendingAgentRunError(runId);
			if (pendingError) scheduleErrorFinish(pendingError.snapshot, pendingError.dueAt - Date.now());
			const pendingTimeout = getPendingAgentRunTimeout(runId);
			if (pendingTimeout) scheduleTimeoutFinish(pendingTimeout.snapshot, pendingTimeout.dueAt - Date.now());
		}
		const unsubscribe = onAgentEvent((evt) => {
			if (!evt || evt.stream !== "lifecycle") return;
			if (evt.runId !== runId) return;
			const phase = evt.data?.phase;
			if (phase === "start") {
				clearPendingErrorTimer();
				clearPendingTimeoutTimer();
				return;
			}
			if (phase !== "end" && phase !== "error") return;
			const latest = ignoreCachedSnapshot ? void 0 : getCachedAgentRun(runId);
			if (latest) {
				finish(latest);
				return;
			}
			const snapshot = createSnapshotFromLifecycleEvent({
				runId: evt.runId,
				phase,
				data: evt.data
			});
			if (phase === "error") {
				scheduleErrorFinish(snapshot);
				return;
			}
			if (snapshot.status === "timeout") {
				scheduleTimeoutFinish(snapshot);
				return;
			}
			recordAgentRunSnapshot(snapshot);
			finish(snapshot);
		});
		const timer = setSafeTimeout(() => finish(null), timeoutMs);
		onAbort = () => finish(null);
		signal?.addEventListener("abort", onAbort, { once: true });
	});
}
ensureAgentRunListener();
//#endregion
//#region src/gateway/server-methods/agent.ts
const RESET_COMMAND_RE = /^\/(new|reset)(?:\s+([\s\S]*))?$/i;
function resolveSenderIsOwnerFromClient(client) {
	return (Array.isArray(client?.connect?.scopes) ? client.connect.scopes : []).includes(ADMIN_SCOPE$1);
}
function resolveAllowModelOverrideFromClient(client) {
	return resolveSenderIsOwnerFromClient(client) || client?.internal?.allowModelOverride === true;
}
function resolveCanResetSessionFromClient(client) {
	return resolveSenderIsOwnerFromClient(client);
}
async function runSessionResetFromAgent(params) {
	const result = await performGatewaySessionReset({
		key: params.key,
		reason: params.reason,
		commandSource: "gateway:agent"
	});
	if (!result.ok) return result;
	return {
		ok: true,
		key: result.key,
		sessionId: result.entry.sessionId
	};
}
function resolveSessionRuntimeWorkspace(params) {
	const sessionAgentId = resolveAgentIdFromSessionKey(params.sessionKey);
	const workspaceOverride = resolveIngressWorkspaceOverrideForSpawnedRun({
		spawnedBy: params.spawnedBy,
		workspaceDir: params.sessionEntry?.spawnedWorkspaceDir
	});
	return {
		runtimeWorkspaceDir: workspaceOverride ?? resolveAgentWorkspaceDir(params.cfg, sessionAgentId),
		isCanonicalWorkspace: !workspaceOverride
	};
}
function emitSessionsChanged$1(context, payload) {
	const connIds = context.getSessionEventSubscriberConnIds();
	if (connIds.size === 0) return;
	const sessionRow = payload.sessionKey ? loadGatewaySessionRow(payload.sessionKey) : null;
	context.broadcastToConnIds("sessions.changed", {
		...payload,
		ts: Date.now(),
		...sessionRow ? {
			updatedAt: sessionRow.updatedAt ?? void 0,
			sessionId: sessionRow.sessionId,
			kind: sessionRow.kind,
			channel: sessionRow.channel,
			subject: sessionRow.subject,
			groupChannel: sessionRow.groupChannel,
			space: sessionRow.space,
			chatType: sessionRow.chatType,
			origin: sessionRow.origin,
			spawnedBy: sessionRow.spawnedBy,
			spawnedWorkspaceDir: sessionRow.spawnedWorkspaceDir,
			forkedFromParent: sessionRow.forkedFromParent,
			spawnDepth: sessionRow.spawnDepth,
			subagentRole: sessionRow.subagentRole,
			subagentControlScope: sessionRow.subagentControlScope,
			label: sessionRow.label,
			displayName: sessionRow.displayName,
			deliveryContext: sessionRow.deliveryContext,
			parentSessionKey: sessionRow.parentSessionKey,
			childSessions: sessionRow.childSessions,
			thinkingLevel: sessionRow.thinkingLevel,
			fastMode: sessionRow.fastMode,
			verboseLevel: sessionRow.verboseLevel,
			traceLevel: sessionRow.traceLevel,
			reasoningLevel: sessionRow.reasoningLevel,
			elevatedLevel: sessionRow.elevatedLevel,
			sendPolicy: sessionRow.sendPolicy,
			systemSent: sessionRow.systemSent,
			abortedLastRun: sessionRow.abortedLastRun,
			inputTokens: sessionRow.inputTokens,
			outputTokens: sessionRow.outputTokens,
			lastChannel: sessionRow.lastChannel,
			lastTo: sessionRow.lastTo,
			lastAccountId: sessionRow.lastAccountId,
			lastThreadId: sessionRow.lastThreadId,
			totalTokens: sessionRow.totalTokens,
			totalTokensFresh: sessionRow.totalTokensFresh,
			contextTokens: sessionRow.contextTokens,
			estimatedCostUsd: sessionRow.estimatedCostUsd,
			responseUsage: sessionRow.responseUsage,
			modelProvider: sessionRow.modelProvider,
			model: sessionRow.model,
			status: sessionRow.status,
			startedAt: sessionRow.startedAt,
			endedAt: sessionRow.endedAt,
			runtimeMs: sessionRow.runtimeMs,
			compactionCheckpointCount: sessionRow.compactionCheckpointCount,
			latestCompactionCheckpoint: sessionRow.latestCompactionCheckpoint
		} : {}
	}, connIds, { dropIfSlow: true });
}
function dispatchAgentRunFromGateway(params) {
	const inputProvenance = normalizeInputProvenance(params.ingressOpts.inputProvenance);
	if (params.ingressOpts.sessionKey?.trim() && inputProvenance?.kind !== "inter_session") try {
		createRunningTaskRun({
			runtime: "cli",
			sourceId: params.runId,
			ownerKey: params.ingressOpts.sessionKey,
			scopeKind: "session",
			requesterOrigin: normalizeDeliveryContext({
				channel: params.ingressOpts.channel,
				to: params.ingressOpts.to,
				accountId: params.ingressOpts.accountId,
				threadId: params.ingressOpts.threadId
			}),
			childSessionKey: params.ingressOpts.sessionKey,
			runId: params.runId,
			task: params.ingressOpts.message,
			deliveryStatus: "not_applicable",
			startedAt: Date.now()
		});
	} catch {}
	agentCommandFromIngress(params.ingressOpts, defaultRuntime, params.context.deps).then((result) => {
		const payload = {
			runId: params.runId,
			status: "ok",
			summary: "completed",
			result
		};
		setGatewayDedupeEntry({
			dedupe: params.context.dedupe,
			key: `agent:${params.idempotencyKey}`,
			entry: {
				ts: Date.now(),
				ok: true,
				payload
			}
		});
		params.respond(true, payload, void 0, { runId: params.runId });
	}).catch((err) => {
		const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
		const payload = {
			runId: params.runId,
			status: "error",
			summary: String(err)
		};
		setGatewayDedupeEntry({
			dedupe: params.context.dedupe,
			key: `agent:${params.idempotencyKey}`,
			entry: {
				ts: Date.now(),
				ok: false,
				payload,
				error
			}
		});
		params.respond(false, payload, error, {
			runId: params.runId,
			error: formatForLog(err)
		});
	}).finally(() => {
		if (params.context.chatAbortControllers.get(params.runId)?.controller === params.abortController) params.context.chatAbortControllers.delete(params.runId);
	});
}
const agentHandlers = {
	agent: async ({ params, respond, context, client, isWebchatConnect }) => {
		const p = params;
		if (!validateAgentParams(p)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: ${formatValidationErrors(validateAgentParams.errors)}`));
			return;
		}
		const request = p;
		const senderIsOwner = resolveSenderIsOwnerFromClient(client);
		const allowModelOverride = resolveAllowModelOverrideFromClient(client);
		const canResetSession = resolveCanResetSessionFromClient(client);
		if (Boolean(request.provider || request.model) && !allowModelOverride) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "provider/model overrides are not authorized for this caller."));
			return;
		}
		const providerOverride = allowModelOverride ? request.provider : void 0;
		const modelOverride = allowModelOverride ? request.model : void 0;
		const cfg = loadConfig();
		const idem = request.idempotencyKey;
		const normalizedSpawned = normalizeSpawnedRunMetadata({
			groupId: request.groupId,
			groupChannel: request.groupChannel,
			groupSpace: request.groupSpace
		});
		let resolvedGroupId = normalizedSpawned.groupId;
		let resolvedGroupChannel = normalizedSpawned.groupChannel;
		let resolvedGroupSpace = normalizedSpawned.groupSpace;
		let spawnedByValue;
		const inputProvenance = normalizeInputProvenance(request.inputProvenance);
		const cached = context.dedupe.get(`agent:${idem}`);
		if (cached) {
			respond(cached.ok, cached.payload, cached.error, { cached: true });
			return;
		}
		const normalizedAttachments = normalizeRpcAttachmentsToChatAttachments(request.attachments);
		const requestedBestEffortDeliver = typeof request.bestEffortDeliver === "boolean" ? request.bestEffortDeliver : void 0;
		let message = (request.message ?? "").trim();
		let images = [];
		let imageOrder = [];
		if (normalizedAttachments.length > 0) {
			const requestedSessionKeyRaw = typeof request.sessionKey === "string" && request.sessionKey.trim() ? request.sessionKey.trim() : void 0;
			let baseProvider;
			let baseModel;
			if (requestedSessionKeyRaw) {
				const { cfg: sessCfg, entry: sessEntry } = loadSessionEntry(requestedSessionKeyRaw);
				const modelRef = resolveSessionModelRef(sessCfg, sessEntry, void 0);
				baseProvider = modelRef.provider;
				baseModel = modelRef.model;
			}
			const effectiveProvider = providerOverride || baseProvider;
			const effectiveModel = modelOverride || baseModel;
			const supportsImages = await resolveGatewayModelSupportsImages({
				loadGatewayModelCatalog: context.loadGatewayModelCatalog,
				provider: effectiveProvider,
				model: effectiveModel
			});
			try {
				const parsed = await parseMessageWithAttachments(message, normalizedAttachments, {
					maxBytes: 5e6,
					log: context.logGateway,
					supportsImages
				});
				message = parsed.message.trim();
				images = parsed.images;
				imageOrder = parsed.imageOrder;
			} catch (err) {
				respond(false, void 0, errorShape(err instanceof MediaOffloadError ? ErrorCodes.UNAVAILABLE : ErrorCodes.INVALID_REQUEST, String(err)));
				return;
			}
		}
		const isKnownGatewayChannel = (value) => isGatewayMessageChannel(value);
		const channelHints = [request.channel, request.replyChannel].filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean);
		for (const rawChannel of channelHints) {
			const normalized = normalizeMessageChannel(rawChannel);
			if (normalized && normalized !== "last" && !isKnownGatewayChannel(normalized)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: unknown channel: ${normalized}`));
				return;
			}
		}
		const agentIdRaw = normalizeOptionalString(request.agentId) ?? "";
		const agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : void 0;
		if (agentId) {
			if (!listAgentIds(cfg).includes(agentId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: unknown agent id "${request.agentId}"`));
				return;
			}
		}
		const requestedSessionKeyRaw = normalizeOptionalString(request.sessionKey);
		if (requestedSessionKeyRaw && classifySessionKeyShape(requestedSessionKeyRaw) === "malformed_agent") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: malformed session key "${requestedSessionKeyRaw}"`));
			return;
		}
		const requestedSessionId = normalizeOptionalString(request.sessionId);
		let requestedSessionKey = requestedSessionKeyRaw ?? (!requestedSessionId ? resolveExplicitAgentSessionKey({
			cfg,
			agentId
		}) : void 0);
		if (agentId && requestedSessionKeyRaw) {
			const sessionAgentId = resolveAgentIdFromSessionKey(requestedSessionKeyRaw);
			if (sessionAgentId !== agentId) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent params: agent "${request.agentId}" does not match session key agent "${sessionAgentId}"`));
				return;
			}
		}
		let resolvedSessionId = requestedSessionId;
		let sessionEntry;
		let bestEffortDeliver = requestedBestEffortDeliver ?? false;
		let cfgForAgent;
		let resolvedSessionKey = requestedSessionKey;
		let isNewSession = false;
		let skipTimestampInjection = false;
		let shouldPrependStartupContext = false;
		const resetCommandMatch = message.match(RESET_COMMAND_RE);
		if (resetCommandMatch && requestedSessionKey) {
			if (!canResetSession) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `missing scope: ${ADMIN_SCOPE$1}`));
				return;
			}
			const resetReason = normalizeOptionalLowercaseString(resetCommandMatch[1]) === "new" ? "new" : "reset";
			const resetResult = await runSessionResetFromAgent({
				key: requestedSessionKey,
				reason: resetReason
			});
			if (!resetResult.ok) {
				respond(false, void 0, resetResult.error);
				return;
			}
			requestedSessionKey = resetResult.key;
			resolvedSessionId = resetResult.sessionId ?? resolvedSessionId;
			const postResetMessage = normalizeOptionalString(resetCommandMatch[2]) ?? "";
			if (postResetMessage) message = postResetMessage;
			else {
				const resetLoadedSession = loadSessionEntry(requestedSessionKey);
				const resetCfg = resetLoadedSession?.cfg ?? cfg;
				const resetSessionEntry = resetLoadedSession?.entry;
				const resetSpawnedBy = canonicalizeSpawnedByForAgent(resetCfg, resolveAgentIdFromSessionKey(requestedSessionKey), resetSessionEntry?.spawnedBy);
				const { runtimeWorkspaceDir, isCanonicalWorkspace } = resolveSessionRuntimeWorkspace({
					cfg: resetCfg,
					sessionKey: requestedSessionKey,
					sessionEntry: resetSessionEntry,
					spawnedBy: resetSpawnedBy
				});
				const resetSessionAgentId = resolveAgentIdFromSessionKey(requestedSessionKey);
				const resetBaseModelRef = resolveSessionModelRef(resetCfg, resetSessionEntry, resetSessionAgentId);
				const resetEffectiveModelRef = {
					provider: providerOverride || resetBaseModelRef.provider,
					model: modelOverride || resetBaseModelRef.model
				};
				const bareResetPromptState = await resolveBareSessionResetPromptState({
					cfg: resetCfg,
					workspaceDir: runtimeWorkspaceDir,
					isPrimaryRun: !isSubagentSessionKey(requestedSessionKey) && !isAcpSessionKey(requestedSessionKey),
					isCanonicalWorkspace,
					hasBootstrapFileAccess: resolveBareResetBootstrapFileAccess({
						cfg: resetCfg,
						agentId: resetSessionAgentId,
						sessionKey: requestedSessionKey,
						workspaceDir: runtimeWorkspaceDir,
						modelProvider: resetEffectiveModelRef.provider,
						modelId: resetEffectiveModelRef.model
					})
				});
				message = bareResetPromptState.prompt;
				skipTimestampInjection = true;
				shouldPrependStartupContext = bareResetPromptState.shouldPrependStartupContext && shouldApplyStartupContext({
					cfg,
					action: resetReason
				});
			}
		}
		if (!skipTimestampInjection) message = injectTimestamp(message, timestampOptsFromConfig(cfg));
		if (requestedSessionKey) {
			const { cfg, storePath, entry, canonicalKey } = loadSessionEntry(requestedSessionKey);
			cfgForAgent = cfg;
			isNewSession = !entry;
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			const labelValue = normalizeOptionalString(request.label) || entry?.label;
			spawnedByValue = canonicalizeSpawnedByForAgent(cfg, resolveAgentIdFromSessionKey(canonicalKey), entry?.spawnedBy);
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
			const requestDeliveryHint = normalizeDeliveryContext({
				channel: request.channel?.trim(),
				to: request.to?.trim(),
				accountId: request.accountId?.trim(),
				threadId: request.threadId
			});
			const effectiveDeliveryFields = normalizeSessionDeliveryFields({ deliveryContext: mergeDeliveryContext(deliveryFields.deliveryContext, requestDeliveryHint) });
			const nextEntryPatch = {
				sessionId,
				updatedAt: now,
				thinkingLevel: entry?.thinkingLevel,
				fastMode: entry?.fastMode,
				verboseLevel: entry?.verboseLevel,
				traceLevel: entry?.traceLevel,
				reasoningLevel: entry?.reasoningLevel,
				systemSent: entry?.systemSent,
				sendPolicy: entry?.sendPolicy,
				skillsSnapshot: entry?.skillsSnapshot,
				deliveryContext: effectiveDeliveryFields.deliveryContext,
				lastChannel: effectiveDeliveryFields.lastChannel ?? entry?.lastChannel,
				lastTo: effectiveDeliveryFields.lastTo ?? entry?.lastTo,
				lastAccountId: effectiveDeliveryFields.lastAccountId ?? entry?.lastAccountId,
				lastThreadId: effectiveDeliveryFields.lastThreadId ?? entry?.lastThreadId,
				modelOverride: entry?.modelOverride,
				providerOverride: entry?.providerOverride,
				label: labelValue,
				spawnedBy: spawnedByValue,
				spawnedWorkspaceDir: entry?.spawnedWorkspaceDir,
				spawnDepth: entry?.spawnDepth,
				channel: entry?.channel ?? request.channel?.trim(),
				groupId: resolvedGroupId ?? entry?.groupId,
				groupChannel: resolvedGroupChannel ?? entry?.groupChannel,
				space: resolvedGroupSpace ?? entry?.space,
				cliSessionIds: entry?.cliSessionIds,
				cliSessionBindings: entry?.cliSessionBindings,
				claudeCliSessionId: entry?.claudeCliSessionId
			};
			sessionEntry = mergeSessionEntry(entry, nextEntryPatch);
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
			if (storePath) sessionEntry = await updateSessionStore(storePath, (store) => {
				const { primaryKey } = migrateAndPruneGatewaySessionStoreKey({
					cfg,
					key: requestedSessionKey,
					store
				});
				const merged = mergeSessionEntry(store[primaryKey], nextEntryPatch);
				store[primaryKey] = merged;
				return merged;
			});
			if (canonicalSessionKey === mainSessionKey || canonicalSessionKey === "global") {
				context.addChatRun(idem, {
					sessionKey: canonicalSessionKey,
					clientRunId: idem
				});
				if (requestedBestEffortDeliver === void 0) bestEffortDeliver = true;
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
		const explicitTo = normalizeOptionalString(request.replyTo) ?? normalizeOptionalString(request.to);
		const explicitThreadId = normalizeOptionalString(request.threadId);
		const turnSourceChannel = normalizeOptionalString(request.channel);
		const turnSourceTo = normalizeOptionalString(request.to);
		const turnSourceAccountId = normalizeOptionalString(request.accountId);
		const deliveryPlan = resolveAgentDeliveryPlan({
			sessionEntry,
			requestedChannel: request.replyChannel ?? request.channel,
			explicitTo,
			explicitThreadId,
			accountId: request.replyAccountId ?? request.accountId,
			wantsDelivery,
			turnSourceChannel,
			turnSourceTo,
			turnSourceAccountId,
			turnSourceThreadId: explicitThreadId
		});
		let resolvedChannel = deliveryPlan.resolvedChannel;
		let deliveryTargetMode = deliveryPlan.deliveryTargetMode;
		let resolvedAccountId = deliveryPlan.resolvedAccountId;
		let resolvedTo = deliveryPlan.resolvedTo;
		let effectivePlan = deliveryPlan;
		let deliveryDowngradeReason = null;
		if (wantsDelivery && resolvedChannel === "webchat") {
			const cfgResolved = cfgForAgent ?? cfg;
			try {
				resolvedChannel = (await resolveMessageChannelSelection({ cfg: cfgResolved })).channel;
				deliveryTargetMode = deliveryTargetMode ?? "implicit";
				effectivePlan = {
					...deliveryPlan,
					resolvedChannel,
					deliveryTargetMode,
					resolvedAccountId
				};
			} catch (err) {
				if (!shouldDowngradeDeliveryToSessionOnly({
					wantsDelivery,
					bestEffortDeliver,
					resolvedChannel
				})) {
					respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, String(err)));
					return;
				}
				deliveryDowngradeReason = String(err);
			}
		}
		if (!resolvedTo && isDeliverableMessageChannel(resolvedChannel)) {
			const fallback = resolveAgentOutboundTarget({
				cfg: cfgForAgent ?? cfg,
				plan: effectivePlan,
				targetMode: deliveryTargetMode ?? "implicit",
				validateExplicitTarget: false
			});
			if (fallback.resolvedTarget?.ok) resolvedTo = fallback.resolvedTo;
		}
		if (wantsDelivery && resolvedChannel === "webchat") {
			if (!shouldDowngradeDeliveryToSessionOnly({
				wantsDelivery,
				bestEffortDeliver,
				resolvedChannel
			})) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "delivery channel is required: pass --channel/--reply-channel or use a main session with a previous channel"));
				return;
			}
			context.logGateway.info(deliveryDowngradeReason ? `agent delivery downgraded to session-only (bestEffortDeliver): ${deliveryDowngradeReason}` : "agent delivery downgraded to session-only (bestEffortDeliver): no deliverable channel");
		}
		const normalizedTurnSource = normalizeMessageChannel(turnSourceChannel);
		const originMessageChannel = (normalizedTurnSource && isGatewayMessageChannel(normalizedTurnSource) ? normalizedTurnSource : void 0) ?? (client?.connect && isWebchatConnect(client.connect) ? "webchat" : resolvedChannel);
		const deliver = request.deliver === true && resolvedChannel !== "webchat";
		const now = Date.now();
		const timeoutMs = resolveAgentTimeoutMs({
			cfg: cfgForAgent ?? cfg,
			overrideSeconds: typeof request.timeout === "number" ? request.timeout : void 0
		});
		const activeRunAbort = registerChatAbortController({
			chatAbortControllers: context.chatAbortControllers,
			runId,
			sessionId: resolvedSessionId ?? runId,
			sessionKey: resolvedSessionKey,
			timeoutMs,
			now,
			expiresAtMs: resolveAgentRunExpiresAtMs({
				now,
				timeoutMs
			}),
			ownerConnId: typeof client?.connId === "string" ? client.connId : void 0,
			ownerDeviceId: typeof client?.connect?.device?.id === "string" ? client.connect.device.id : void 0,
			kind: "agent"
		});
		const accepted = {
			runId,
			status: "accepted",
			acceptedAt: Date.now()
		};
		setGatewayDedupeEntry({
			dedupe: context.dedupe,
			key: `agent:${idem}`,
			entry: {
				ts: Date.now(),
				ok: true,
				payload: accepted
			}
		});
		respond(true, accepted, void 0, { runId });
		let dispatched = false;
		try {
			if (resolvedSessionKey) await reactivateCompletedSubagentSession({
				sessionKey: resolvedSessionKey,
				runId
			});
			if (requestedSessionKey && resolvedSessionKey && isNewSession) emitSessionsChanged$1(context, {
				sessionKey: resolvedSessionKey,
				reason: "create"
			});
			if (resolvedSessionKey) emitSessionsChanged$1(context, {
				sessionKey: resolvedSessionKey,
				reason: "send"
			});
			if (shouldPrependStartupContext && resolvedSessionKey) {
				const { runtimeWorkspaceDir } = resolveSessionRuntimeWorkspace({
					cfg: cfgForAgent ?? cfg,
					sessionKey: resolvedSessionKey,
					sessionEntry,
					spawnedBy: spawnedByValue
				});
				const startupContextPrelude = await buildSessionStartupContextPrelude({
					workspaceDir: runtimeWorkspaceDir,
					cfg: cfgForAgent ?? cfg
				});
				if (startupContextPrelude) message = `${startupContextPrelude}\n\n${message}`;
			}
			const resolvedThreadId = explicitThreadId ?? deliveryPlan.resolvedThreadId;
			const ingressAgentId = agentId && (!resolvedSessionKey || resolveAgentIdFromSessionKey(resolvedSessionKey) === agentId) ? agentId : void 0;
			dispatchAgentRunFromGateway({
				ingressOpts: {
					message,
					images,
					imageOrder,
					agentId: ingressAgentId,
					provider: providerOverride,
					model: modelOverride,
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
						messageChannel: originMessageChannel,
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
					messageChannel: originMessageChannel,
					runId,
					lane: request.lane,
					cleanupBundleMcpOnRunEnd: request.cleanupBundleMcpOnRunEnd === true,
					extraSystemPrompt: request.extraSystemPrompt,
					bootstrapContextMode: request.bootstrapContextMode,
					bootstrapContextRunKind: request.bootstrapContextRunKind,
					internalEvents: request.internalEvents,
					inputProvenance,
					abortSignal: activeRunAbort.controller.signal,
					workspaceDir: resolveIngressWorkspaceOverrideForSpawnedRun({
						spawnedBy: spawnedByValue,
						workspaceDir: sessionEntry?.spawnedWorkspaceDir
					}),
					senderIsOwner,
					allowModelOverride
				},
				runId,
				idempotencyKey: idem,
				abortController: activeRunAbort.controller,
				respond,
				context
			});
			dispatched = true;
		} finally {
			if (!dispatched) activeRunAbort.cleanup();
		}
	},
	"agent.identity.get": ({ params, respond }) => {
		if (!validateAgentIdentityParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent.identity.get params: ${formatValidationErrors(validateAgentIdentityParams.errors)}`));
			return;
		}
		const p = params;
		const agentIdRaw = normalizeOptionalString(p.agentId) ?? "";
		const sessionKeyRaw = normalizeOptionalString(p.sessionKey) ?? "";
		let agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : void 0;
		if (sessionKeyRaw) {
			if (classifySessionKeyShape(sessionKeyRaw) === "malformed_agent") {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent.identity.get params: malformed session key "${sessionKeyRaw}"`));
				return;
			}
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
	"agent.wait": async ({ params, respond, context }) => {
		if (!validateAgentWaitParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid agent.wait params: ${formatValidationErrors(validateAgentWaitParams.errors)}`));
			return;
		}
		const p = params;
		const runId = (p.runId ?? "").trim();
		const timeoutMs = typeof p.timeoutMs === "number" && Number.isFinite(p.timeoutMs) ? Math.max(0, Math.floor(p.timeoutMs)) : 3e4;
		const activeChatEntry = context.chatAbortControllers.get(runId);
		const hasActiveChatRun = activeChatEntry !== void 0 && activeChatEntry.kind !== "agent";
		const cachedGatewaySnapshot = readTerminalSnapshotFromGatewayDedupe({
			dedupe: context.dedupe,
			runId,
			ignoreAgentTerminalSnapshot: hasActiveChatRun
		});
		if (cachedGatewaySnapshot) {
			respond(true, {
				runId,
				status: cachedGatewaySnapshot.status,
				startedAt: cachedGatewaySnapshot.startedAt,
				endedAt: cachedGatewaySnapshot.endedAt,
				error: cachedGatewaySnapshot.error
			});
			return;
		}
		const lifecycleAbortController = new AbortController();
		const dedupeAbortController = new AbortController();
		const lifecyclePromise = waitForAgentJob({
			runId,
			timeoutMs,
			signal: lifecycleAbortController.signal,
			ignoreCachedSnapshot: hasActiveChatRun
		});
		const dedupePromise = waitForTerminalGatewayDedupe({
			dedupe: context.dedupe,
			runId,
			timeoutMs,
			signal: dedupeAbortController.signal,
			ignoreAgentTerminalSnapshot: hasActiveChatRun
		});
		const first = await Promise.race([lifecyclePromise.then((snapshot) => ({
			source: "lifecycle",
			snapshot
		})), dedupePromise.then((snapshot) => ({
			source: "dedupe",
			snapshot
		}))]);
		let snapshot = first.snapshot;
		if (snapshot) if (first.source === "lifecycle") dedupeAbortController.abort();
		else lifecycleAbortController.abort();
		else {
			snapshot = first.source === "lifecycle" ? await dedupePromise : await lifecyclePromise;
			lifecycleAbortController.abort();
			dedupeAbortController.abort();
		}
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
const BOOTSTRAP_FILE_NAMES_POST_ONBOARDING = BOOTSTRAP_FILE_NAMES.filter((name) => name !== DEFAULT_BOOTSTRAP_FILENAME);
const agentsHandlerDeps = {
	isWorkspaceSetupCompleted,
	openFileWithinRoot,
	readFileWithinRoot,
	writeFileWithinRoot
};
const MEMORY_FILE_NAMES = [DEFAULT_MEMORY_FILENAME];
const ALLOWED_FILE_NAMES = new Set([...BOOTSTRAP_FILE_NAMES, ...MEMORY_FILE_NAMES]);
function resolveAgentWorkspaceFileOrRespondError(params, respond) {
	const cfg = loadConfig();
	const rawAgentId = params.agentId;
	const agentId = resolveAgentIdOrError(typeof rawAgentId === "string" || typeof rawAgentId === "number" ? String(rawAgentId) : "", cfg);
	if (!agentId) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown agent id"));
		return null;
	}
	const rawName = params.name;
	const name = (typeof rawName === "string" || typeof rawName === "number" ? String(rawName) : "").trim();
	if (!ALLOWED_FILE_NAMES.has(name)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported file "${name}"`));
		return null;
	}
	return {
		cfg,
		agentId,
		workspaceDir: resolveAgentWorkspaceDir(cfg, agentId),
		name
	};
}
function isPathInsideDirectory(rootDir, candidatePath) {
	const relative = path.relative(rootDir, candidatePath);
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}
async function statWorkspaceFileSafely(workspaceDir, name) {
	try {
		const workspaceReal = await fs$1.realpath(workspaceDir);
		const candidatePath = path.resolve(workspaceReal, name);
		if (!isPathInsideDirectory(workspaceReal, candidatePath)) return null;
		const pathStat = await fs$1.lstat(candidatePath);
		if (!pathStat.isFile() || pathStat.nlink > 1) return null;
		const realPath = await fs$1.realpath(candidatePath);
		if (!isPathInsideDirectory(workspaceReal, realPath)) return null;
		const realStat = await fs$1.stat(realPath);
		if (!realStat.isFile() || realStat.nlink > 1 || !sameFileIdentity(pathStat, realStat)) return null;
		return {
			size: realStat.size,
			updatedAtMs: Math.floor(realStat.mtimeMs)
		};
	} catch {
		return null;
	}
}
async function listAgentFiles(workspaceDir, options) {
	const files = [];
	const bootstrapFileNames = options?.hideBootstrap ? BOOTSTRAP_FILE_NAMES_POST_ONBOARDING : BOOTSTRAP_FILE_NAMES;
	for (const name of bootstrapFileNames) {
		const filePath = path.join(workspaceDir, name);
		const meta = await statWorkspaceFileSafely(workspaceDir, name);
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
	const primaryMeta = await statWorkspaceFileSafely(workspaceDir, DEFAULT_MEMORY_FILENAME);
	if (primaryMeta) files.push({
		name: DEFAULT_MEMORY_FILENAME,
		path: path.join(workspaceDir, DEFAULT_MEMORY_FILENAME),
		missing: false,
		size: primaryMeta.size,
		updatedAtMs: primaryMeta.updatedAtMs
	});
	else files.push({
		name: DEFAULT_MEMORY_FILENAME,
		path: path.join(workspaceDir, DEFAULT_MEMORY_FILENAME),
		missing: true
	});
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
function respondInvalidMethodParams(respond, method, errors) {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid ${method} params: ${formatValidationErrors(errors)}`));
}
function isConfiguredAgent(cfg, agentId) {
	return findAgentEntryIndex(listAgentEntries(cfg), agentId) >= 0;
}
function respondAgentNotFound(respond, agentId) {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `agent "${agentId}" not found`));
}
async function moveToTrashBestEffort(pathname) {
	if (!pathname) return;
	try {
		await fs$1.access(pathname);
	} catch {
		return;
	}
	try {
		await movePathToTrash(pathname);
	} catch {}
}
function respondWorkspaceFileUnsafe(respond, name) {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsafe workspace file "${name}"`));
}
function respondWorkspaceFileMissing(params) {
	params.respond(true, {
		agentId: params.agentId,
		workspace: params.workspaceDir,
		file: {
			name: params.name,
			path: params.filePath,
			missing: true
		}
	}, void 0);
}
async function writeWorkspaceFileOrRespond(params) {
	await fs$1.mkdir(params.workspaceDir, { recursive: true });
	try {
		await agentsHandlerDeps.writeFileWithinRoot({
			rootDir: params.workspaceDir,
			relativePath: params.name,
			data: params.content,
			encoding: "utf8"
		});
	} catch (err) {
		if (err instanceof SafeOpenError) {
			respondWorkspaceFileUnsafe(params.respond, params.name);
			return false;
		}
		throw err;
	}
	return true;
}
function normalizeIdentityForFile(identity) {
	if (!identity) return;
	const resolved = {
		name: identity.name?.trim() || void 0,
		theme: identity.theme?.trim() || void 0,
		emoji: identity.emoji?.trim() || void 0,
		avatar: identity.avatar?.trim() || void 0
	};
	if (!resolved.name && !resolved.theme && !resolved.emoji && !resolved.avatar) return;
	return resolved;
}
async function readWorkspaceFileContent(workspaceDir, name) {
	try {
		return (await agentsHandlerDeps.readFileWithinRoot({
			rootDir: workspaceDir,
			relativePath: name,
			rejectHardlinks: true,
			nonBlockingRead: true
		})).buffer.toString("utf-8");
	} catch (err) {
		if (err instanceof SafeOpenError && err.code === "not-found") return;
		throw err;
	}
}
async function buildIdentityMarkdownForWrite(params) {
	let baseContent;
	if (params.preferFallbackWorkspaceContent && params.fallbackWorkspaceDir) {
		baseContent = await readWorkspaceFileContent(params.fallbackWorkspaceDir, DEFAULT_IDENTITY_FILENAME);
		if (baseContent === void 0) baseContent = await readWorkspaceFileContent(params.workspaceDir, DEFAULT_IDENTITY_FILENAME);
	} else {
		baseContent = await readWorkspaceFileContent(params.workspaceDir, DEFAULT_IDENTITY_FILENAME);
		if (baseContent === void 0 && params.fallbackWorkspaceDir) baseContent = await readWorkspaceFileContent(params.fallbackWorkspaceDir, DEFAULT_IDENTITY_FILENAME);
	}
	return mergeIdentityMarkdownContent(baseContent, params.identity);
}
async function buildIdentityMarkdownOrRespondUnsafe(params) {
	try {
		return await buildIdentityMarkdownForWrite(params);
	} catch (err) {
		if (err instanceof SafeOpenError) {
			respondWorkspaceFileUnsafe(params.respond, DEFAULT_IDENTITY_FILENAME);
			return null;
		}
		throw err;
	}
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
		const rawName = params.name.trim();
		const agentId = normalizeAgentId(rawName);
		if (agentId === "main") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `"${DEFAULT_AGENT_ID}" is reserved`));
			return;
		}
		if (findAgentEntryIndex(listAgentEntries(cfg), agentId) >= 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `agent "${agentId}" already exists`));
			return;
		}
		const workspaceDir = resolveUserPath(params.workspace.trim());
		const safeName = sanitizeIdentityLine(rawName);
		const model = resolveOptionalStringParam(params.model);
		const emoji = resolveOptionalStringParam(params.emoji);
		const avatar = resolveOptionalStringParam(params.avatar);
		let nextConfig = applyAgentConfig(cfg, {
			agentId,
			name: safeName,
			workspace: workspaceDir,
			model,
			identity: {
				name: safeName,
				...emoji ? { emoji: sanitizeIdentityLine(emoji) } : {},
				...avatar ? { avatar: sanitizeIdentityLine(avatar) } : {}
			}
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
		await fs$1.mkdir(resolveSessionTranscriptsDirForAgent(agentId), { recursive: true });
		const persistedIdentity = normalizeIdentityForFile(resolveAgentIdentity(nextConfig, agentId));
		if (persistedIdentity) {
			const identityContent = await buildIdentityMarkdownOrRespondUnsafe({
				respond,
				workspaceDir,
				identity: persistedIdentity
			});
			if (identityContent === null) return;
			if (!await writeWorkspaceFileOrRespond({
				respond,
				workspaceDir,
				name: "IDENTITY.md",
				content: identityContent
			})) return;
		}
		await writeConfigFile(nextConfig);
		respond(true, {
			ok: true,
			agentId,
			name: safeName,
			workspace: workspaceDir,
			model
		}, void 0);
	},
	"agents.update": async ({ params, respond }) => {
		if (!validateAgentsUpdateParams(params)) {
			respondInvalidMethodParams(respond, "agents.update", validateAgentsUpdateParams.errors);
			return;
		}
		const cfg = loadConfig();
		const agentId = normalizeAgentId(params.agentId);
		if (!isConfiguredAgent(cfg, agentId)) {
			respondAgentNotFound(respond, agentId);
			return;
		}
		const workspaceDir = typeof params.workspace === "string" && params.workspace.trim() ? resolveUserPath(params.workspace.trim()) : void 0;
		const model = resolveOptionalStringParam(params.model);
		const emoji = resolveOptionalStringParam(params.emoji);
		const avatar = resolveOptionalStringParam(params.avatar);
		const safeName = typeof params.name === "string" && params.name.trim() ? sanitizeIdentityLine(params.name.trim()) : void 0;
		const hasIdentityFields = Boolean(safeName || emoji || avatar);
		const identity = hasIdentityFields ? {
			...safeName ? { name: safeName } : {},
			...emoji ? { emoji: sanitizeIdentityLine(emoji) } : {},
			...avatar ? { avatar: sanitizeIdentityLine(avatar) } : {}
		} : void 0;
		const nextConfig = applyAgentConfig(cfg, {
			agentId,
			...safeName ? { name: safeName } : {},
			...workspaceDir ? { workspace: workspaceDir } : {},
			...model ? { model } : {},
			...identity ? { identity } : {}
		});
		let ensuredWorkspace;
		if (workspaceDir) ensuredWorkspace = await ensureAgentWorkspace({
			dir: workspaceDir,
			ensureBootstrapFiles: !Boolean(nextConfig.agents?.defaults?.skipBootstrap)
		});
		const persistedIdentity = normalizeIdentityForFile(resolveAgentIdentity(nextConfig, agentId));
		if (persistedIdentity && (workspaceDir || hasIdentityFields)) {
			const identityWorkspaceDir = resolveAgentWorkspaceDir(nextConfig, agentId);
			const previousWorkspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
			const fallbackWorkspaceDir = workspaceDir && identityWorkspaceDir !== previousWorkspaceDir ? previousWorkspaceDir : void 0;
			const identityContent = await buildIdentityMarkdownOrRespondUnsafe({
				respond,
				workspaceDir: identityWorkspaceDir,
				identity: persistedIdentity,
				fallbackWorkspaceDir,
				preferFallbackWorkspaceContent: Boolean(fallbackWorkspaceDir) && ensuredWorkspace?.identityPathCreated === true
			});
			if (identityContent === null) return;
			if (!await writeWorkspaceFileOrRespond({
				respond,
				workspaceDir: identityWorkspaceDir,
				name: "IDENTITY.md",
				content: identityContent
			})) return;
		}
		await writeConfigFile(nextConfig);
		respond(true, {
			ok: true,
			agentId
		}, void 0);
	},
	"agents.delete": async ({ params, respond }) => {
		if (!validateAgentsDeleteParams(params)) {
			respondInvalidMethodParams(respond, "agents.delete", validateAgentsDeleteParams.errors);
			return;
		}
		const cfg = loadConfig();
		const agentId = normalizeAgentId(params.agentId);
		if (agentId === "main") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `"${DEFAULT_AGENT_ID}" cannot be deleted`));
			return;
		}
		if (!isConfiguredAgent(cfg, agentId)) {
			respondAgentNotFound(respond, agentId);
			return;
		}
		const deleteFiles = typeof params.deleteFiles === "boolean" ? params.deleteFiles : true;
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const agentDir = resolveAgentDir(cfg, agentId);
		const sessionsDir = resolveSessionTranscriptsDirForAgent(agentId);
		const result = pruneAgentConfig(cfg, agentId);
		await writeConfigFile(result.config);
		await purgeAgentSessionStoreEntries(cfg, agentId);
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
		const agentId = resolveAgentIdOrError(params.agentId, cfg);
		if (!agentId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown agent id"));
			return;
		}
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		let hideBootstrap = false;
		try {
			hideBootstrap = await agentsHandlerDeps.isWorkspaceSetupCompleted(workspaceDir);
		} catch {}
		respond(true, {
			agentId,
			workspace: workspaceDir,
			files: await listAgentFiles(workspaceDir, { hideBootstrap })
		}, void 0);
	},
	"agents.files.get": async ({ params, respond }) => {
		if (!validateAgentsFilesGetParams(params)) {
			respondInvalidMethodParams(respond, "agents.files.get", validateAgentsFilesGetParams.errors);
			return;
		}
		const resolved = resolveAgentWorkspaceFileOrRespondError(params, respond);
		if (!resolved) return;
		const { agentId, workspaceDir, name } = resolved;
		const filePath = path.join(workspaceDir, name);
		let safeRead;
		try {
			safeRead = await agentsHandlerDeps.readFileWithinRoot({
				rootDir: workspaceDir,
				relativePath: name,
				rejectHardlinks: true,
				nonBlockingRead: true
			});
		} catch (err) {
			if (err instanceof SafeOpenError && err.code === "not-found") {
				respondWorkspaceFileMissing({
					respond,
					agentId,
					workspaceDir,
					name,
					filePath
				});
				return;
			}
			if (err instanceof SafeOpenError) {
				respondWorkspaceFileUnsafe(respond, name);
				return;
			}
			throw err;
		}
		respond(true, {
			agentId,
			workspace: workspaceDir,
			file: {
				name,
				path: filePath,
				missing: false,
				size: safeRead.stat.size,
				updatedAtMs: Math.floor(safeRead.stat.mtimeMs),
				content: safeRead.buffer.toString("utf-8")
			}
		}, void 0);
	},
	"agents.files.set": async ({ params, respond }) => {
		if (!validateAgentsFilesSetParams(params)) {
			respondInvalidMethodParams(respond, "agents.files.set", validateAgentsFilesSetParams.errors);
			return;
		}
		const resolved = resolveAgentWorkspaceFileOrRespondError(params, respond);
		if (!resolved) return;
		const { agentId, workspaceDir, name } = resolved;
		await fs$1.mkdir(workspaceDir, { recursive: true });
		const filePath = path.join(workspaceDir, name);
		const content = params.content;
		try {
			await agentsHandlerDeps.writeFileWithinRoot({
				rootDir: workspaceDir,
				relativePath: name,
				data: content,
				encoding: "utf8"
			});
		} catch (err) {
			if (!(err instanceof SafeOpenError)) throw err;
			respondWorkspaceFileUnsafe(respond, name);
			return;
		}
		const meta = await statWorkspaceFileSafely(workspaceDir, name);
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
//#region src/gateway/server-methods/channels.ts
const CHANNEL_STATUS_MAX_TIMEOUT_MS = 3e4;
const CHANNEL_STATUS_PROBE_CONCURRENCY = 5;
function resolveChannelsStatusTimeoutMs(params) {
	const fallback = params.probe ? CHANNEL_STATUS_MAX_TIMEOUT_MS : 1e4;
	if (typeof params.timeoutMsRaw !== "number" || !Number.isFinite(params.timeoutMsRaw)) return fallback;
	return Math.min(Math.max(1e3, params.timeoutMsRaw), CHANNEL_STATUS_MAX_TIMEOUT_MS);
}
function resolveRuntimeAccountSnapshot(params) {
	const direct = params.runtime.channelAccounts[params.channelId]?.[params.accountId];
	if (direct) return direct;
	const fallback = params.runtime.channels[params.channelId];
	return fallback?.accountId === params.accountId ? fallback : void 0;
}
function resolveChannelGatewayAccountId(params) {
	return normalizeOptionalString(params.accountId) || params.plugin.config.defaultAccountId?.(params.cfg) || params.plugin.config.listAccountIds(params.cfg)[0] || "default";
}
async function logoutChannelAccount(params) {
	const resolvedAccountId = resolveChannelGatewayAccountId(params);
	const account = params.plugin.config.resolveAccount(params.cfg, resolvedAccountId);
	await params.context.stopChannel(params.channelId, resolvedAccountId);
	const result = await params.plugin.gateway?.logoutAccount?.({
		cfg: params.cfg,
		accountId: resolvedAccountId,
		account,
		runtime: defaultRuntime
	});
	if (!result) throw new Error(`Channel ${params.channelId} does not support logout`);
	const cleared = result.cleared;
	if (typeof result.loggedOut === "boolean" ? result.loggedOut : cleared) params.context.markChannelLoggedOut(params.channelId, true, resolvedAccountId);
	return {
		channel: params.channelId,
		accountId: resolvedAccountId,
		...result,
		cleared
	};
}
async function startChannelAccount(params) {
	if (!params.plugin.gateway?.startAccount) throw new Error(`Channel ${params.channelId} does not support runtime start`);
	const resolvedAccountId = resolveChannelGatewayAccountId(params);
	await params.context.startChannel(params.channelId, resolvedAccountId);
	const started = resolveRuntimeAccountSnapshot({
		runtime: params.context.getRuntimeSnapshot(),
		channelId: params.channelId,
		accountId: resolvedAccountId
	})?.running === true;
	return {
		channel: params.channelId,
		accountId: resolvedAccountId,
		started
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
		const timeoutMs = resolveChannelsStatusTimeoutMs({
			probe,
			timeoutMsRaw
		});
		const cfg = applyPluginAutoEnable({
			config: loadConfig(),
			env: process.env
		}).config;
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
		const buildAccountSnapshot = async (channelId, plugin, accountId, defaultAccountId) => {
			const account = plugin.config.resolveAccount(cfg, accountId);
			const enabled = isAccountEnabled(plugin, account);
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
			return {
				accountId,
				account,
				snapshot
			};
		};
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
			const resolvedAccounts = {};
			const { results } = await runTasksWithConcurrency({
				tasks: accountIds.map((accountId) => async () => await buildAccountSnapshot(channelId, plugin, accountId, defaultAccountId)),
				limit: probe ? CHANNEL_STATUS_PROBE_CONCURRENCY : accountIds.length || 1
			});
			const accounts = [];
			for (const result of results) if (result) {
				resolvedAccounts[result.accountId] = result.account;
				accounts.push(result.snapshot);
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
		const { results: channelResults } = await runTasksWithConcurrency({
			tasks: plugins.map((plugin) => async () => {
				const { accounts, defaultAccountId, defaultAccount, resolvedAccounts } = await buildChannelAccounts(plugin.id);
				const fallbackAccount = resolvedAccounts[defaultAccountId] ?? plugin.config.resolveAccount(cfg, defaultAccountId);
				const summary = plugin.status?.buildChannelSummary ? await plugin.status.buildChannelSummary({
					account: fallbackAccount,
					cfg,
					defaultAccountId,
					snapshot: defaultAccount ?? { accountId: defaultAccountId }
				}) : { configured: defaultAccount?.configured ?? false };
				return {
					pluginId: plugin.id,
					summary,
					accounts,
					defaultAccountId
				};
			}),
			limit: probe ? CHANNEL_STATUS_PROBE_CONCURRENCY : plugins.length || 1
		});
		for (const result of channelResults) if (result) {
			channelsMap[result.pluginId] = result.summary;
			accountsMap[result.pluginId] = result.accounts;
			defaultAccountIdMap[result.pluginId] = result.defaultAccountId;
		}
		respond(true, payload, void 0);
	},
	"channels.start": async ({ params, respond, context }) => {
		if (!validateChannelsStartParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid channels.start params: ${formatValidationErrors(validateChannelsStartParams.errors)}`));
			return;
		}
		const rawChannel = params.channel;
		const channelId = typeof rawChannel === "string" ? normalizeChannelId(rawChannel) : null;
		if (!channelId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid channels.start channel"));
			return;
		}
		const plugin = getChannelPlugin(channelId);
		if (!plugin) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown channel: ${formatForLog(rawChannel)}`));
			return;
		}
		if (!plugin.gateway?.startAccount) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `channel ${channelId} does not support start`));
			return;
		}
		try {
			const cfg = applyPluginAutoEnable({
				config: loadConfig(),
				env: process.env
			}).config;
			respond(true, await startChannelAccount({
				channelId,
				accountId: params.accountId,
				cfg,
				context,
				plugin
			}), void 0);
		} catch (error) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(error)));
		}
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
		const accountId = normalizeOptionalString(accountIdRaw);
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
//#region src/gateway/server-methods/commands.ts
function clampString(value, maxLength) {
	return value.length > maxLength ? value.slice(0, maxLength) : value;
}
function trimClampNonEmpty(value, maxLength) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	return clampString(trimmed, maxLength);
}
function clampDescription(value) {
	return clampString(value ?? "", COMMAND_DESCRIPTION_MAX_LENGTH);
}
function resolveAgentIdOrRespondError$1(rawAgentId, respond) {
	const cfg = loadConfig();
	const knownAgents = listAgentIds(cfg);
	const requestedAgentId = typeof rawAgentId === "string" ? rawAgentId.trim() : "";
	const agentId = requestedAgentId || resolveDefaultAgentId(cfg);
	if (requestedAgentId && !knownAgents.includes(agentId)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown agent id "${requestedAgentId}"`));
		return null;
	}
	return {
		cfg,
		agentId
	};
}
function resolveNativeName(cmd, provider) {
	const baseName = cmd.nativeName ?? cmd.key;
	if (!provider || !cmd.nativeName) return baseName;
	return getChannelPlugin(provider)?.commands?.resolveNativeCommandName?.({
		commandKey: cmd.key,
		defaultName: cmd.nativeName
	}) ?? baseName;
}
function stripLeadingSlash(value) {
	return value.startsWith("/") ? value.slice(1) : value;
}
function resolveTextAliases(cmd) {
	const seen = /* @__PURE__ */ new Set();
	const aliases = [];
	for (const alias of cmd.textAliases) {
		const trimmed = trimClampNonEmpty(alias, 200);
		if (!trimmed) continue;
		const exactAlias = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
		if (seen.has(exactAlias)) continue;
		seen.add(exactAlias);
		aliases.push(exactAlias);
		if (aliases.length >= 20) break;
	}
	if (aliases.length > 0) return aliases;
	return [`/${clampString(cmd.key, 200)}`];
}
function resolvePrimaryTextName(cmd) {
	return stripLeadingSlash(resolveTextAliases(cmd)[0] ?? `/${cmd.key}`);
}
function serializeArg(arg) {
	const isDynamic = typeof arg.choices === "function";
	const staticChoices = Array.isArray(arg.choices) ? arg.choices.slice(0, 50).map(normalizeChoice) : void 0;
	return {
		name: clampString(arg.name, 200),
		description: clampString(arg.description, 500),
		type: arg.type,
		...arg.required ? { required: true } : {},
		...staticChoices ? { choices: staticChoices } : {},
		...isDynamic ? { dynamic: true } : {}
	};
}
function normalizeChoice(choice) {
	if (typeof choice === "string") return {
		value: clampString(choice, 200),
		label: clampString(choice, 200)
	};
	return {
		value: clampString(choice.value, 200),
		label: clampString(choice.label, 200)
	};
}
function mapCommand(cmd, source, includeArgs, nameSurface, provider) {
	const shouldIncludeArgs = includeArgs && cmd.acceptsArgs && cmd.args?.length;
	const nativeName = cmd.scope === "text" ? void 0 : resolveNativeName(cmd, provider);
	return {
		name: clampString(nameSurface === "text" ? resolvePrimaryTextName(cmd) : nativeName ?? cmd.key, 200),
		...nativeName ? { nativeName: clampString(nativeName, 200) } : {},
		...cmd.scope !== "native" ? { textAliases: resolveTextAliases(cmd) } : {},
		description: clampDescription(cmd.description),
		...cmd.category ? { category: cmd.category } : {},
		source,
		scope: cmd.scope,
		acceptsArgs: Boolean(cmd.acceptsArgs),
		...shouldIncludeArgs ? { args: cmd.args.slice(0, 20).map(serializeArg) } : {}
	};
}
function buildPluginCommandEntries(params) {
	const pluginTextSpecs = listPluginCommands();
	const pluginNativeSpecs = getPluginCommandSpecs(params.provider);
	const entries = [];
	for (const [index, textSpec] of pluginTextSpecs.entries()) {
		const nativeName = pluginNativeSpecs[index]?.name;
		entries.push({
			name: clampString(params.nameSurface === "text" ? textSpec.name : nativeName ?? textSpec.name, 200),
			...nativeName ? { nativeName: clampString(nativeName, 200) } : {},
			textAliases: [`/${clampString(textSpec.name, 200)}`],
			description: clampDescription(textSpec.description),
			source: "plugin",
			scope: "both",
			acceptsArgs: textSpec.acceptsArgs
		});
	}
	if (params.nameSurface === "native") return entries.filter((entry) => entry.nativeName);
	return entries;
}
function buildCommandsListResult(params) {
	const includeArgs = params.includeArgs !== false;
	const scopeFilter = params.scope ?? "both";
	const nameSurface = scopeFilter === "text" ? "text" : "native";
	const provider = normalizeOptionalLowercaseString(params.provider);
	const skillCommands = listSkillCommandsForAgents({
		cfg: params.cfg,
		agentIds: [params.agentId]
	});
	const chatCommands = listChatCommandsForConfig(params.cfg, { skillCommands });
	const skillKeys = new Set(skillCommands.map((sc) => `skill:${sc.skillName}`));
	const commands = [];
	for (const cmd of chatCommands) {
		if (scopeFilter !== "both" && cmd.scope !== "both" && cmd.scope !== scopeFilter) continue;
		commands.push(mapCommand(cmd, skillKeys.has(cmd.key) ? "skill" : "native", includeArgs, nameSurface, provider));
	}
	commands.push(...buildPluginCommandEntries({
		provider,
		nameSurface
	}));
	return { commands: commands.slice(0, 500) };
}
const commandsHandlers = { "commands.list": ({ params, respond }) => {
	if (!validateCommandsListParams(params)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid commands.list params: ${formatValidationErrors(validateCommandsListParams.errors)}`));
		return;
	}
	const resolved = resolveAgentIdOrRespondError$1(params.agentId, respond);
	if (!resolved) return;
	respond(true, buildCommandsListResult({
		cfg: resolved.cfg,
		agentId: resolved.agentId,
		provider: params.provider,
		scope: params.scope,
		includeArgs: params.includeArgs
	}), void 0);
} };
//#endregion
//#region src/gateway/config-reload-plan.ts
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
		prefix: "gateway.channelHealthCheckMinutes",
		kind: "hot",
		actions: ["restart-health-monitor"]
	},
	{
		prefix: "gateway.channelStaleEventThresholdMinutes",
		kind: "hot",
		actions: ["restart-health-monitor"]
	},
	{
		prefix: "gateway.channelMaxRestartsPerHour",
		kind: "hot",
		actions: ["restart-health-monitor"]
	},
	{
		prefix: "diagnostics.stuckSessionWarnMs",
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
		prefix: "agents.defaults.models",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "agents.defaults.model",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "models",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "agents.list",
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
		prefix: "secrets",
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
let cachedActiveRegistryVersion = -1;
let cachedChannelRegistryVersion = -1;
function listReloadRules() {
	const registry = getActivePluginRegistry();
	const activeRegistryVersion = getActivePluginRegistryVersion();
	const channelRegistryVersion = getActivePluginChannelRegistryVersion();
	if (registry !== cachedRegistry || activeRegistryVersion !== cachedActiveRegistryVersion || channelRegistryVersion !== cachedChannelRegistryVersion) {
		cachedReloadRules = null;
		cachedRegistry = registry;
		cachedActiveRegistryVersion = activeRegistryVersion;
		cachedChannelRegistryVersion = channelRegistryVersion;
	}
	if (cachedReloadRules) return cachedReloadRules;
	const channelReloadRules = listChannelPlugins().flatMap((plugin) => (plugin.reload?.configPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "hot",
		actions: [`restart-channel:${plugin.id}`]
	})).concat((plugin.reload?.noopPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "none"
	}))));
	const pluginReloadRules = (registry?.reloads ?? []).flatMap((entry) => (entry.registration.restartPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "restart"
	})).concat((entry.registration.hotPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "hot"
	})), (entry.registration.noopPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "none"
	}))));
	const rules = [
		...BASE_RELOAD_RULES,
		...pluginReloadRules,
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
function isPluginInstallTimestampPath(path) {
	return /^plugins\.installs\..+\.(installedAt|resolvedAt)$/.test(path);
}
function getPluginInstallRecords(config) {
	if (!isPlainObject(config)) return {};
	const plugins = config.plugins;
	if (!isPlainObject(plugins)) return {};
	const installs = plugins.installs;
	return isPlainObject(installs) ? installs : {};
}
function listPluginInstallTimestampMetadataPaths(prevConfig, nextConfig) {
	const prevInstalls = getPluginInstallRecords(prevConfig);
	const nextInstalls = getPluginInstallRecords(nextConfig);
	const ids = new Set([...Object.keys(prevInstalls), ...Object.keys(nextInstalls)]);
	const paths = [];
	for (const id of ids) {
		const prevRecord = prevInstalls[id];
		const nextRecord = nextInstalls[id];
		if (!isPlainObject(prevRecord) || !isPlainObject(nextRecord)) continue;
		for (const key of ["installedAt", "resolvedAt"]) if (prevRecord[key] !== nextRecord[key]) paths.push(`plugins.installs.${id}.${key}`);
	}
	return paths;
}
function listPluginInstallWholeRecordPaths(prevConfig, nextConfig) {
	const prevInstalls = getPluginInstallRecords(prevConfig);
	const nextInstalls = getPluginInstallRecords(nextConfig);
	const ids = new Set([...Object.keys(prevInstalls), ...Object.keys(nextInstalls)]);
	const paths = [];
	for (const id of ids) {
		const prevRecord = prevInstalls[id];
		const nextRecord = nextInstalls[id];
		if (!isPlainObject(prevRecord) || !isPlainObject(nextRecord)) paths.push(`plugins.installs.${id}`);
	}
	return paths;
}
function buildGatewayReloadPlan(changedPaths, options = {}) {
	const noopPaths = new Set(options.noopPaths);
	const forceChangedPaths = new Set(options.forceChangedPaths);
	const plan = {
		changedPaths,
		restartGateway: false,
		restartReasons: [],
		hotReasons: [],
		reloadHooks: false,
		restartGmailWatcher: false,
		restartCron: false,
		restartHeartbeat: false,
		restartHealthMonitor: false,
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
			case "restart-cron":
				plan.restartCron = true;
				break;
			case "restart-heartbeat":
				plan.restartHeartbeat = true;
				break;
			case "restart-health-monitor":
				plan.restartHealthMonitor = true;
				break;
			default: break;
		}
	};
	for (const path of changedPaths) {
		if (!forceChangedPaths.has(path) && (noopPaths.size > 0 ? noopPaths.has(path) : isPluginInstallTimestampPath(path))) {
			plan.noopPaths.push(path);
			continue;
		}
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
//#endregion
//#region src/gateway/config-reload.ts
const DEFAULT_RELOAD_SETTINGS = {
	mode: "hybrid",
	debounceMs: 300
};
const MISSING_CONFIG_RETRY_DELAY_MS = 150;
const MISSING_CONFIG_MAX_RETRIES = 2;
/**
* Paths under `skills.*` always change the snapshot that sessions cache in
* sessions.json. Any prefix match here (for example `skills.allowBundled`,
* `skills.entries.X.enabled`, `skills.profile`) forces sessions to rebuild
* their snapshot on the next turn rather than silently advertising stale
* tools to the model.
*/
const SKILLS_INVALIDATION_PREFIXES = ["skills"];
function matchesSkillsInvalidationPrefix(path) {
	return SKILLS_INVALIDATION_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}.`));
}
function firstSkillsChangedPath(changedPaths) {
	return changedPaths.find(matchesSkillsInvalidationPrefix);
}
function isNoopReloadPlan(plan) {
	return !plan.restartGateway && plan.hotReasons.length === 0 && !plan.reloadHooks && !plan.restartGmailWatcher && !plan.restartCron && !plan.restartHeartbeat && !plan.restartHealthMonitor && plan.restartChannels.size === 0;
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
		if (isDeepStrictEqual(prev, next)) return [];
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
function startGatewayConfigReloader(opts) {
	let currentConfig = opts.initialConfig;
	let currentCompareConfig = opts.initialCompareConfig ?? opts.initialConfig;
	let settings = resolveGatewayReloadSettings(currentConfig);
	let debounceTimer = null;
	let pending = false;
	let running = false;
	let stopped = false;
	let restartQueued = false;
	let missingConfigRetries = 0;
	let pendingInProcessConfig = null;
	let lastAppliedWriteHash = opts.initialInternalWriteHash ?? null;
	const scheduleAfter = (wait) => {
		if (stopped) return;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			runReload();
		}, wait);
	};
	const schedule = () => {
		scheduleAfter(settings.debounceMs);
	};
	const queueRestart = (plan, nextConfig) => {
		if (restartQueued) return;
		restartQueued = true;
		(async () => {
			try {
				await opts.onRestart(plan, nextConfig);
			} catch (err) {
				restartQueued = false;
				opts.log.error(`config restart failed: ${String(err)}`);
			}
		})();
	};
	const handleMissingSnapshot = (snapshot) => {
		if (snapshot.exists) {
			missingConfigRetries = 0;
			return false;
		}
		if (missingConfigRetries < MISSING_CONFIG_MAX_RETRIES) {
			missingConfigRetries += 1;
			opts.log.info(`config reload retry (${missingConfigRetries}/${MISSING_CONFIG_MAX_RETRIES}): config file not found`);
			scheduleAfter(MISSING_CONFIG_RETRY_DELAY_MS);
			return true;
		}
		opts.log.warn("config reload skipped (config file not found)");
		return true;
	};
	const handleInvalidSnapshot = (snapshot) => {
		if (snapshot.valid) return false;
		const issues = formatConfigIssueLines(snapshot.issues, "").join(", ");
		opts.log.warn(`config reload skipped (invalid config): ${issues}`);
		return true;
	};
	const recoverAndReadSnapshot = async (snapshot, reason) => {
		if (!opts.recoverSnapshot) return null;
		if (!shouldAttemptLastKnownGoodRecovery(snapshot)) {
			opts.log.warn(`config reload recovery skipped after ${reason}: invalidity is scoped to plugin entries`);
			return null;
		}
		if (!await opts.recoverSnapshot(snapshot, reason)) return null;
		opts.log.warn(`config reload restored last-known-good config after ${reason}`);
		const nextSnapshot = await opts.readSnapshot();
		if (!nextSnapshot.valid) {
			const issues = formatConfigIssueLines(nextSnapshot.issues, "").join(", ");
			opts.log.warn(`config reload recovery snapshot is invalid: ${issues}`);
			return null;
		}
		try {
			await opts.onRecovered?.({
				reason,
				snapshot,
				recoveredSnapshot: nextSnapshot
			});
		} catch (err) {
			opts.log.warn(`config reload recovery notice failed: ${String(err)}`);
		}
		return nextSnapshot;
	};
	const applySnapshot = async (nextConfig, nextCompareConfig) => {
		const changedPaths = diffConfigPaths(currentCompareConfig, nextCompareConfig);
		const pluginInstallTimestampNoopPaths = listPluginInstallTimestampMetadataPaths(currentCompareConfig, nextCompareConfig);
		const pluginInstallWholeRecordPaths = listPluginInstallWholeRecordPaths(currentCompareConfig, nextCompareConfig);
		currentConfig = nextConfig;
		currentCompareConfig = nextCompareConfig;
		settings = resolveGatewayReloadSettings(nextConfig);
		if (changedPaths.length === 0) return;
		const skillsChangedPath = firstSkillsChangedPath(changedPaths);
		if (skillsChangedPath !== void 0) {
			bumpSkillsSnapshotVersion({
				reason: "config-change",
				changedPath: skillsChangedPath
			});
			opts.log.info(`skills snapshot invalidated by config change (${skillsChangedPath})`);
		}
		opts.log.info(`config change detected; evaluating reload (${changedPaths.join(", ")})`);
		const plan = buildGatewayReloadPlan(changedPaths, {
			noopPaths: pluginInstallTimestampNoopPaths,
			forceChangedPaths: pluginInstallWholeRecordPaths
		});
		if (isNoopReloadPlan(plan)) return;
		if (settings.mode === "off") {
			opts.log.info("config reload disabled (gateway.reload.mode=off)");
			return;
		}
		if (settings.mode === "restart") {
			queueRestart(plan, nextConfig);
			return;
		}
		if (plan.restartGateway) {
			if (settings.mode === "hot") {
				opts.log.warn(`config reload requires gateway restart; hot mode ignoring (${plan.restartReasons.join(", ")})`);
				return;
			}
			queueRestart(plan, nextConfig);
			return;
		}
		await opts.onHotReload(plan, nextConfig);
	};
	const promoteAcceptedSnapshot = async (snapshot, reason) => {
		if (!opts.promoteSnapshot || !snapshot.exists || !snapshot.valid) return;
		try {
			await opts.promoteSnapshot(snapshot, reason);
		} catch (err) {
			opts.log.warn(`config reload last-known-good promotion failed: ${String(err)}`);
		}
	};
	const promoteAcceptedInProcessWrite = async (persistedHash) => {
		if (!opts.promoteSnapshot) return;
		try {
			const snapshot = await opts.readSnapshot();
			if (snapshot.hash !== persistedHash || !snapshot.valid) return;
			await promoteAcceptedSnapshot(snapshot, "in-process-write");
		} catch (err) {
			opts.log.warn(`config reload in-process last-known-good promotion failed: ${String(err)}`);
		}
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
			if (pendingInProcessConfig) {
				const pendingWrite = pendingInProcessConfig;
				pendingInProcessConfig = null;
				missingConfigRetries = 0;
				await applySnapshot(pendingWrite.config, pendingWrite.compareConfig);
				await promoteAcceptedInProcessWrite(pendingWrite.persistedHash);
				return;
			}
			let snapshot = await opts.readSnapshot();
			if (lastAppliedWriteHash && typeof snapshot.hash === "string") {
				if (snapshot.hash === lastAppliedWriteHash) return;
				lastAppliedWriteHash = null;
			}
			if (handleMissingSnapshot(snapshot)) return;
			if (!snapshot.valid) {
				const recoveredSnapshot = await recoverAndReadSnapshot(snapshot, "invalid-config");
				if (!recoveredSnapshot) {
					handleInvalidSnapshot(snapshot);
					return;
				}
				snapshot = recoveredSnapshot;
			}
			await applySnapshot(snapshot.config, snapshot.sourceConfig);
			await promoteAcceptedSnapshot(snapshot, "valid-config");
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
	const scheduleFromWatcher = () => {
		schedule();
	};
	const unsubscribeFromWrites = opts.subscribeToWrites?.((event) => {
		if (event.configPath !== opts.watchPath) return;
		pendingInProcessConfig = {
			config: event.runtimeConfig,
			compareConfig: event.sourceConfig,
			persistedHash: event.persistedHash
		};
		lastAppliedWriteHash = event.persistedHash;
		scheduleAfter(0);
	}) ?? (() => {});
	watcher.on("add", scheduleFromWatcher);
	watcher.on("change", scheduleFromWatcher);
	watcher.on("unlink", scheduleFromWatcher);
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
		unsubscribeFromWrites();
		await watcher.close().catch(() => {});
	} };
}
//#endregion
//#region src/gateway/server-methods/base-hash.ts
function resolveBaseHashParam(params) {
	const raw = params?.baseHash;
	if (typeof raw !== "string") return null;
	const trimmed = raw.trim();
	return trimmed ? trimmed : null;
}
//#endregion
//#region src/gateway/server-methods/restart-request.ts
function parseRestartDeliveryContext(params) {
	const raw = params.deliveryContext;
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {
		deliveryContext: void 0,
		threadId: void 0
	};
	const context = raw;
	const deliveryContext = {
		channel: normalizeOptionalString(context.channel),
		to: normalizeOptionalString(context.to),
		accountId: normalizeOptionalString(context.accountId)
	};
	return {
		deliveryContext: deliveryContext.channel || deliveryContext.to || deliveryContext.accountId ? deliveryContext : void 0,
		threadId: typeof context.threadId === "number" && Number.isFinite(context.threadId) ? String(Math.trunc(context.threadId)) : normalizeOptionalString(context.threadId)
	};
}
function parseRestartRequestParams(params) {
	const sessionKey = normalizeOptionalString(params.sessionKey);
	const { deliveryContext, threadId } = parseRestartDeliveryContext(params);
	const note = normalizeOptionalString(params.note);
	const restartDelayMsRaw = params.restartDelayMs;
	return {
		sessionKey,
		deliveryContext,
		threadId,
		note,
		restartDelayMs: typeof restartDelayMsRaw === "number" && Number.isFinite(restartDelayMsRaw) ? Math.max(0, Math.floor(restartDelayMsRaw)) : void 0
	};
}
//#endregion
//#region src/gateway/server-methods/validation.ts
function assertValidParams(params, validate, method, respond) {
	if (validate(params)) return true;
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid ${method} params: ${formatValidationErrors(validate.errors)}`));
	return false;
}
//#endregion
//#region src/gateway/server-methods/config.ts
const MAX_CONFIG_ISSUES_IN_ERROR_MESSAGE = 3;
function requireConfigBaseHash(params, snapshot, respond) {
	if (!snapshot.exists) return true;
	const snapshotHash = resolveConfigSnapshotHash(snapshot);
	if (!snapshotHash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "config base hash unavailable; re-run config.get and retry"));
		return false;
	}
	const baseHash = resolveBaseHashParam(params);
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
function parseRawConfigOrRespond(params, requestName, respond) {
	const rawValue = params.raw;
	if (typeof rawValue !== "string") {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid ${requestName} params: raw (string) required`));
		return null;
	}
	return rawValue;
}
function sanitizeLookupPathForLog(path) {
	const sanitized = Array.from(path, (char) => {
		const code = char.charCodeAt(0);
		return code < 32 || code === 127 ? "?" : char;
	}).join("");
	return sanitized.length > 120 ? `${sanitized.slice(0, 117)}...` : sanitized;
}
function escapePowerShellSingleQuotedString(value) {
	return value.replaceAll("'", "''");
}
function resolveConfigOpenCommand(configPath, platform = process.platform) {
	if (platform === "win32") return {
		command: "powershell.exe",
		args: [
			"-NoProfile",
			"-NonInteractive",
			"-Command",
			`Start-Process -LiteralPath '${escapePowerShellSingleQuotedString(configPath)}'`
		]
	};
	return {
		command: platform === "darwin" ? "open" : "xdg-open",
		args: [configPath]
	};
}
function execConfigOpenCommand(command) {
	return new Promise((resolve, reject) => {
		execFile(command.command, command.args, (error) => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
}
function formatConfigOpenError(error) {
	if (typeof error === "object" && error && "message" in error && typeof error.message === "string") return error.message;
	return String(error);
}
function parseValidateConfigFromRawOrRespond(params, requestName, snapshot, respond) {
	const rawValue = parseRawConfigOrRespond(params, requestName, respond);
	if (!rawValue) return null;
	const parsedRes = parseConfigJson5(rawValue);
	if (!parsedRes.ok) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, parsedRes.error));
		return null;
	}
	const schema = loadSchemaWithPlugins();
	const restored = restoreRedactedValues(parsedRes.parsed, snapshot.config, schema.uiHints);
	if (!restored.ok) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, restored.humanReadableMessage ?? "invalid config"));
		return null;
	}
	const validated = validateConfigObjectWithPlugins(restored.result);
	if (!validated.ok) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, summarizeConfigValidationIssues(validated.issues), { details: { issues: validated.issues } }));
		return null;
	}
	return {
		config: validated.config,
		schema
	};
}
function didSharedGatewayAuthChange(prev, next) {
	const prevAuth = resolveEffectiveSharedGatewayAuth({
		authConfig: prev.gateway?.auth,
		env: process.env,
		tailscaleMode: prev.gateway?.tailscale?.mode
	});
	const nextAuth = resolveEffectiveSharedGatewayAuth({
		authConfig: next.gateway?.auth,
		env: process.env,
		tailscaleMode: next.gateway?.tailscale?.mode
	});
	if (prevAuth === null || nextAuth === null) return prevAuth !== nextAuth;
	return prevAuth.mode !== nextAuth.mode || !isDeepStrictEqual(prevAuth.secret, nextAuth.secret);
}
function queueSharedGatewayAuthDisconnect(shouldDisconnect, context) {
	if (!shouldDisconnect) return;
	queueMicrotask(() => {
		context?.disconnectClientsUsingSharedGatewayAuth?.();
	});
}
function queueSharedGatewayAuthGenerationRefresh(shouldRefresh, nextConfig, context) {
	if (!shouldRefresh) return;
	queueMicrotask(() => {
		context?.enforceSharedGatewayAuthGenerationForConfigWrite?.(nextConfig);
	});
}
function summarizeConfigValidationIssues(issues) {
	const lines = formatConfigIssueLines(issues.slice(0, MAX_CONFIG_ISSUES_IN_ERROR_MESSAGE), "", { normalizeRoot: true }).map((line) => line.trim()).filter(Boolean);
	if (lines.length === 0) return "invalid config";
	const hiddenCount = Math.max(0, issues.length - lines.length);
	return `invalid config: ${lines.join("; ")}${hiddenCount > 0 ? ` (+${hiddenCount} more issue${hiddenCount === 1 ? "" : "s"})` : ""}`;
}
function shouldScheduleDirectConfigRestart(params) {
	const reloadSettings = resolveGatewayReloadSettings(params.nextConfig);
	if (reloadSettings.mode === "off") return true;
	const plan = buildGatewayReloadPlan(params.changedPaths);
	if (reloadSettings.mode === "hot" && plan.restartGateway) return true;
	return false;
}
async function ensureResolvableSecretRefsOrRespond(params) {
	try {
		await prepareSecretsRuntimeSnapshot({
			config: params.config,
			includeAuthStoreRefs: false
		});
		return true;
	} catch (error) {
		const details = formatErrorMessage(error);
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid config: active SecretRef resolution failed (${details})`));
		return false;
	}
}
function resolveConfigRestartRequest(params) {
	const { sessionKey, deliveryContext: requestedDeliveryContext, threadId: requestedThreadId, note, restartDelayMs } = parseRestartRequestParams(params);
	const { deliveryContext: sessionDeliveryContext, threadId: sessionThreadId } = extractDeliveryInfo(sessionKey);
	return {
		sessionKey,
		note,
		restartDelayMs,
		deliveryContext: requestedDeliveryContext ?? sessionDeliveryContext,
		threadId: requestedThreadId ?? sessionThreadId
	};
}
function buildConfigRestartSentinelPayload(params) {
	const configPath = createConfigIO().configPath;
	return {
		kind: params.kind,
		status: "ok",
		ts: Date.now(),
		sessionKey: params.sessionKey,
		deliveryContext: params.deliveryContext,
		threadId: params.threadId,
		message: params.note ?? null,
		doctorHint: formatDoctorNonInteractiveHint(),
		stats: {
			mode: params.mode,
			root: configPath
		}
	};
}
async function tryWriteRestartSentinelPayload(payload) {
	try {
		return await writeRestartSentinel(payload);
	} catch {
		return null;
	}
}
function loadSchemaWithPlugins() {
	return loadGatewayRuntimeConfigSchema();
}
const configHandlers = {
	"config.get": async ({ params, respond }) => {
		if (!assertValidParams(params, validateConfigGetParams, "config.get", respond)) return;
		respond(true, redactConfigSnapshot(await readConfigFileSnapshot(), loadSchemaWithPlugins().uiHints), void 0);
	},
	"config.schema": ({ params, respond }) => {
		if (!assertValidParams(params, validateConfigSchemaParams, "config.schema", respond)) return;
		respond(true, loadSchemaWithPlugins(), void 0);
	},
	"config.schema.lookup": ({ params, respond, context }) => {
		if (!assertValidParams(params, validateConfigSchemaLookupParams, "config.schema.lookup", respond)) return;
		const path = params.path;
		const result = lookupConfigSchema(loadSchemaWithPlugins(), path);
		if (!result) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "config schema path not found"));
			return;
		}
		if (!validateConfigSchemaLookupResult(result)) {
			const errors = validateConfigSchemaLookupResult.errors ?? [];
			context.logGateway.warn(`config.schema.lookup produced invalid payload for ${sanitizeLookupPathForLog(path)}: ${formatValidationErrors(errors)}`);
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "config.schema.lookup returned invalid payload", { details: { errors } }));
			return;
		}
		respond(true, result, void 0);
	},
	"config.set": async ({ params, respond, context }) => {
		if (!assertValidParams(params, validateConfigSetParams, "config.set", respond)) return;
		const { snapshot, writeOptions } = await readConfigFileSnapshotForWrite();
		if (!requireConfigBaseHash(params, snapshot, respond)) return;
		const parsed = parseValidateConfigFromRawOrRespond(params, "config.set", snapshot, respond);
		if (!parsed) return;
		if (!await ensureResolvableSecretRefsOrRespond({
			config: parsed.config,
			respond
		})) return;
		await writeConfigFile(parsed.config, writeOptions);
		respond(true, {
			ok: true,
			path: createConfigIO().configPath,
			config: redactConfigObject(parsed.config, parsed.schema.uiHints)
		}, void 0);
		queueSharedGatewayAuthGenerationRefresh(true, parsed.config, context);
	},
	"config.patch": async ({ params, respond, client, context }) => {
		if (!assertValidParams(params, validateConfigPatchParams, "config.patch", respond)) return;
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
		const merged = applyMergePatch(snapshot.config, parsedRes.parsed, { mergeObjectArraysById: true });
		const schemaPatch = loadSchemaWithPlugins();
		const restoredMerge = restoreRedactedValues(merged, snapshot.config, schemaPatch.uiHints);
		if (!restoredMerge.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, restoredMerge.humanReadableMessage ?? "invalid config"));
			return;
		}
		const validated = validateConfigObjectWithPlugins(restoredMerge.result);
		if (!validated.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, summarizeConfigValidationIssues(validated.issues), { details: { issues: validated.issues } }));
			return;
		}
		if (!await ensureResolvableSecretRefsOrRespond({
			config: validated.config,
			respond
		})) return;
		const changedPaths = diffConfigPaths(snapshot.config, validated.config);
		const actor = resolveControlPlaneActor(client);
		if (changedPaths.length === 0) {
			context?.logGateway?.info(`config.patch noop ${formatControlPlaneActor(actor)} (no changed paths)`);
			respond(true, {
				ok: true,
				noop: true,
				path: createConfigIO().configPath,
				config: redactConfigObject(validated.config, schemaPatch.uiHints)
			}, void 0);
			return;
		}
		context?.logGateway?.info(`config.patch write ${formatControlPlaneActor(actor)} changedPaths=${summarizeChangedPaths(changedPaths)} restartReason=config.patch`);
		const disconnectSharedAuthClients = didSharedGatewayAuthChange(snapshot.config, validated.config);
		await writeConfigFile(validated.config, writeOptions);
		const { sessionKey, note, restartDelayMs, deliveryContext, threadId } = resolveConfigRestartRequest(params);
		const payload = buildConfigRestartSentinelPayload({
			kind: "config-patch",
			mode: "config.patch",
			sessionKey,
			deliveryContext,
			threadId,
			note
		});
		const sentinelPath = await tryWriteRestartSentinelPayload(payload);
		const restart = shouldScheduleDirectConfigRestart({
			changedPaths,
			nextConfig: validated.config
		}) ? scheduleGatewaySigusr1Restart({
			delayMs: restartDelayMs,
			reason: "config.patch",
			audit: {
				actor: actor.actor,
				deviceId: actor.deviceId,
				clientIp: actor.clientIp,
				changedPaths
			}
		}) : void 0;
		if (restart?.coalesced) context?.logGateway?.warn(`config.patch restart coalesced ${formatControlPlaneActor(actor)} delayMs=${restart.delayMs}`);
		respond(true, {
			ok: true,
			path: createConfigIO().configPath,
			config: redactConfigObject(validated.config, schemaPatch.uiHints),
			restart,
			sentinel: {
				path: sentinelPath,
				payload
			}
		}, void 0);
		queueSharedGatewayAuthGenerationRefresh(true, validated.config, context);
		queueSharedGatewayAuthDisconnect(disconnectSharedAuthClients, context);
	},
	"config.apply": async ({ params, respond, client, context }) => {
		if (!assertValidParams(params, validateConfigApplyParams, "config.apply", respond)) return;
		const { snapshot, writeOptions } = await readConfigFileSnapshotForWrite();
		if (!requireConfigBaseHash(params, snapshot, respond)) return;
		const parsed = parseValidateConfigFromRawOrRespond(params, "config.apply", snapshot, respond);
		if (!parsed) return;
		if (!await ensureResolvableSecretRefsOrRespond({
			config: parsed.config,
			respond
		})) return;
		const changedPaths = diffConfigPaths(snapshot.config, parsed.config);
		const actor = resolveControlPlaneActor(client);
		context?.logGateway?.info(`config.apply write ${formatControlPlaneActor(actor)} changedPaths=${summarizeChangedPaths(changedPaths)} restartReason=config.apply`);
		const disconnectSharedAuthClients = didSharedGatewayAuthChange(snapshot.config, parsed.config);
		await writeConfigFile(parsed.config, writeOptions);
		const { sessionKey, note, restartDelayMs, deliveryContext, threadId } = resolveConfigRestartRequest(params);
		const payload = buildConfigRestartSentinelPayload({
			kind: "config-apply",
			mode: "config.apply",
			sessionKey,
			deliveryContext,
			threadId,
			note
		});
		const sentinelPath = await tryWriteRestartSentinelPayload(payload);
		const restart = shouldScheduleDirectConfigRestart({
			changedPaths,
			nextConfig: parsed.config
		}) ? scheduleGatewaySigusr1Restart({
			delayMs: restartDelayMs,
			reason: "config.apply",
			audit: {
				actor: actor.actor,
				deviceId: actor.deviceId,
				clientIp: actor.clientIp,
				changedPaths
			}
		}) : void 0;
		if (restart?.coalesced) context?.logGateway?.warn(`config.apply restart coalesced ${formatControlPlaneActor(actor)} delayMs=${restart.delayMs}`);
		respond(true, {
			ok: true,
			path: createConfigIO().configPath,
			config: redactConfigObject(parsed.config, parsed.schema.uiHints),
			restart,
			sentinel: {
				path: sentinelPath,
				payload
			}
		}, void 0);
		queueSharedGatewayAuthGenerationRefresh(true, parsed.config, context);
		queueSharedGatewayAuthDisconnect(disconnectSharedAuthClients, context);
	},
	"config.openFile": async ({ params, respond, context }) => {
		if (!assertValidParams(params, validateConfigGetParams, "config.openFile", respond)) return;
		const configPath = createConfigIO().configPath;
		try {
			await execConfigOpenCommand(resolveConfigOpenCommand(configPath));
			respond(true, {
				ok: true,
				path: configPath
			}, void 0);
		} catch (error) {
			context?.logGateway?.warn(`config.openFile failed path=${sanitizeLookupPathForLog(configPath)}: ${formatConfigOpenError(error)}`);
			respond(true, {
				ok: false,
				path: configPath,
				error: "failed to open config file"
			}, void 0);
		}
	}
};
//#endregion
//#region src/gateway/server-methods/connect.ts
const connectHandlers = { connect: ({ respond }) => {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "connect is only valid as the first request"));
} };
//#endregion
//#region src/cron/delivery-plan.ts
function normalizeChannel(value) {
	const trimmed = normalizeOptionalLowercaseString(value);
	if (!trimmed) return;
	return trimmed;
}
function resolveCronDeliveryPlan(job) {
	const delivery = job.delivery;
	const hasDelivery = delivery && typeof delivery === "object";
	const rawMode = hasDelivery ? delivery.mode : void 0;
	const normalizedMode = typeof rawMode === "string" ? normalizeLowercaseStringOrEmpty(rawMode) : rawMode;
	const mode = normalizedMode === "announce" ? "announce" : normalizedMode === "webhook" ? "webhook" : normalizedMode === "none" ? "none" : normalizedMode === "deliver" ? "announce" : void 0;
	const deliveryChannel = normalizeChannel(delivery?.channel);
	const deliveryTo = normalizeOptionalString(delivery?.to);
	const deliveryThreadId = normalizeOptionalThreadValue(delivery?.threadId);
	const to = deliveryTo;
	const deliveryAccountId = normalizeOptionalString(delivery?.accountId);
	if (hasDelivery) {
		const resolvedMode = mode ?? "announce";
		return {
			mode: resolvedMode,
			channel: resolvedMode === "webhook" ? void 0 : resolvedMode === "announce" ? deliveryChannel ?? "last" : deliveryChannel,
			to,
			threadId: resolvedMode === "webhook" ? void 0 : deliveryThreadId,
			accountId: deliveryAccountId,
			source: "delivery",
			requested: resolvedMode === "announce"
		};
	}
	const resolvedMode = job.payload.kind === "agentTurn" && typeof job.sessionTarget === "string" && (job.sessionTarget === "isolated" || job.sessionTarget === "current" || job.sessionTarget.startsWith("session:")) ? "announce" : "none";
	return {
		mode: resolvedMode,
		channel: resolvedMode === "announce" ? "last" : void 0,
		to: void 0,
		threadId: void 0,
		source: "delivery",
		requested: resolvedMode === "announce"
	};
}
function normalizeFailureMode(value) {
	const trimmed = normalizeOptionalLowercaseString(value);
	if (trimmed === "announce" || trimmed === "webhook") return trimmed;
}
function resolveFailureDestination(job, globalConfig) {
	const delivery = job.delivery;
	const jobFailureDest = delivery?.failureDestination;
	const hasJobFailureDest = jobFailureDest && typeof jobFailureDest === "object";
	let channel;
	let to;
	let accountId;
	let mode;
	if (globalConfig) {
		channel = normalizeChannel(globalConfig.channel);
		to = normalizeOptionalString(globalConfig.to);
		accountId = normalizeOptionalString(globalConfig.accountId);
		mode = normalizeFailureMode(globalConfig.mode);
	}
	if (hasJobFailureDest) {
		const jobChannel = normalizeChannel(jobFailureDest.channel);
		const jobTo = normalizeOptionalString(jobFailureDest.to);
		const jobAccountId = normalizeOptionalString(jobFailureDest.accountId);
		const jobMode = normalizeFailureMode(jobFailureDest.mode);
		const hasJobChannelField = "channel" in jobFailureDest;
		const hasJobToField = "to" in jobFailureDest;
		const hasJobAccountIdField = "accountId" in jobFailureDest;
		const jobToExplicitValue = hasJobToField && jobTo !== void 0;
		if (hasJobChannelField) channel = jobChannel;
		if (hasJobToField) to = jobTo;
		if (hasJobAccountIdField) accountId = jobAccountId;
		if (jobMode !== void 0) {
			const globalMode = globalConfig?.mode ?? "announce";
			if (!jobToExplicitValue && globalMode !== jobMode) to = void 0;
			mode = jobMode;
		}
	}
	if (!channel && !to && !accountId && !mode) return null;
	const resolvedMode = mode ?? "announce";
	if (resolvedMode === "webhook" && !to) return null;
	const result = {
		mode: resolvedMode,
		channel: resolvedMode === "announce" ? channel ?? "last" : void 0,
		to,
		accountId
	};
	if (delivery && isSameDeliveryTarget(delivery, result)) return null;
	return result;
}
function isSameDeliveryTarget(delivery, failurePlan) {
	const primaryMode = delivery.mode ?? "announce";
	if (primaryMode === "none") return false;
	const primaryChannel = delivery.channel;
	const primaryTo = delivery.to;
	const primaryAccountId = delivery.accountId;
	if (failurePlan.mode === "webhook") return primaryMode === "webhook" && primaryTo === failurePlan.to;
	const primaryChannelNormalized = primaryChannel ?? "last";
	return (failurePlan.channel ?? "last") === primaryChannelNormalized && failurePlan.to === primaryTo && failurePlan.accountId === primaryAccountId;
}
//#endregion
//#region src/cron/delivery-preview.ts
function formatTarget(channel, to) {
	if (!channel) return "last";
	if (to) return `${channel}:${to}`;
	return channel;
}
function formatDeliveryDetail(params) {
	if (params.requestedChannel === "last" || !params.requestedChannel) {
		if (!params.resolved) return params.error ? `last -> no route, will fail-closed: ${params.error}` : "last -> no route, will fail-closed";
		return params.sessionKey ? `resolved from last, session ${params.sessionKey}` : "resolved from last, main session";
	}
	return params.resolved ? "explicit" : params.error ?? "unresolved";
}
async function resolveCronDeliveryPreview(params) {
	const plan = resolveCronDeliveryPlan(params.job);
	if (!plan.requested && plan.mode === "none" && !params.job.delivery) return {
		label: "not requested",
		detail: "not requested"
	};
	if (plan.mode === "webhook") return {
		label: plan.to ? `webhook:${plan.to}` : "webhook",
		detail: plan.to ? "webhook" : "webhook target missing"
	};
	const requestedChannel = plan.channel ?? "last";
	const agentId = params.job.agentId?.trim() || params.defaultAgentId || resolveDefaultAgentId(params.cfg);
	const resolved = await resolveDeliveryTarget(params.cfg, agentId, {
		channel: requestedChannel,
		to: plan.to,
		threadId: plan.threadId,
		accountId: plan.accountId,
		sessionKey: params.job.sessionKey
	}, { dryRun: true });
	if (!resolved.ok) return {
		label: `${plan.mode} -> ${formatTarget(requestedChannel, plan.to ?? null)}`,
		detail: formatDeliveryDetail({
			requestedChannel,
			resolved: false,
			sessionKey: params.job.sessionKey,
			error: resolved.error.message
		})
	};
	return {
		label: `${plan.mode} -> ${formatTarget(resolved.channel, resolved.to)}`,
		detail: formatDeliveryDetail({
			requestedChannel,
			resolved: true,
			sessionKey: params.job.sessionKey
		})
	};
}
async function resolveCronDeliveryPreviews(params) {
	const entries = await Promise.all(params.jobs.map(async (job) => [job.id, await resolveCronDeliveryPreview({
		cfg: params.cfg,
		defaultAgentId: params.defaultAgentId,
		job
	})]));
	return Object.fromEntries(entries);
}
//#endregion
//#region src/cron/run-log.ts
function assertSafeCronRunLogJobId(jobId) {
	const trimmed = jobId.trim();
	if (!trimmed) throw new Error("invalid cron run log job id");
	if (trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("\0")) throw new Error("invalid cron run log job id");
	return trimmed;
}
function resolveCronRunLogPath(params) {
	const storePath = path.resolve(params.storePath);
	const dir = path.dirname(storePath);
	const runsDir = path.resolve(dir, "runs");
	const safeJobId = assertSafeCronRunLogJobId(params.jobId);
	const resolvedPath = path.resolve(runsDir, `${safeJobId}.jsonl`);
	if (!resolvedPath.startsWith(`${runsDir}${path.sep}`)) throw new Error("invalid cron run log job id");
	return resolvedPath;
}
const writesByPath = /* @__PURE__ */ new Map();
async function setSecureFileMode(filePath) {
	await fs$1.chmod(filePath, 384).catch(() => void 0);
}
const DEFAULT_CRON_RUN_LOG_MAX_BYTES = 2e6;
const DEFAULT_CRON_RUN_LOG_KEEP_LINES = 2e3;
function resolveCronRunLogPruneOptions(cfg) {
	let maxBytes = DEFAULT_CRON_RUN_LOG_MAX_BYTES;
	if (cfg?.maxBytes !== void 0) try {
		const configuredMaxBytes = normalizeStringifiedOptionalString(cfg.maxBytes);
		if (configuredMaxBytes) maxBytes = parseByteSize(configuredMaxBytes, { defaultUnit: "b" });
	} catch {
		maxBytes = DEFAULT_CRON_RUN_LOG_MAX_BYTES;
	}
	let keepLines = DEFAULT_CRON_RUN_LOG_KEEP_LINES;
	if (typeof cfg?.keepLines === "number" && Number.isFinite(cfg.keepLines) && cfg.keepLines > 0) keepLines = Math.floor(cfg.keepLines);
	return {
		maxBytes,
		keepLines
	};
}
async function drainPendingWrite(filePath) {
	const resolved = path.resolve(filePath);
	const pending = writesByPath.get(resolved);
	if (pending) await pending.catch(() => void 0);
}
async function pruneIfNeeded(filePath, opts) {
	const stat = await fs$1.stat(filePath).catch(() => null);
	if (!stat || stat.size <= opts.maxBytes) return;
	const lines = (await fs$1.readFile(filePath, "utf-8").catch(() => "")).split("\n").map((l) => l.trim()).filter(Boolean);
	const kept = lines.slice(Math.max(0, lines.length - opts.keepLines));
	const tmp = `${filePath}.${process.pid}.${randomBytes(8).toString("hex")}.tmp`;
	await fs$1.writeFile(tmp, `${kept.join("\n")}\n`, {
		encoding: "utf-8",
		mode: 384
	});
	await setSecureFileMode(tmp);
	await fs$1.rename(tmp, filePath);
	await setSecureFileMode(filePath);
}
async function appendCronRunLog(filePath, entry, opts) {
	const resolved = path.resolve(filePath);
	const next = (writesByPath.get(resolved) ?? Promise.resolve()).catch(() => void 0).then(async () => {
		const runDir = path.dirname(resolved);
		await fs$1.mkdir(runDir, {
			recursive: true,
			mode: 448
		});
		await fs$1.chmod(runDir, 448).catch(() => void 0);
		await fs$1.appendFile(resolved, `${JSON.stringify(entry)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
		await setSecureFileMode(resolved);
		await pruneIfNeeded(resolved, {
			maxBytes: opts?.maxBytes ?? 2e6,
			keepLines: opts?.keepLines ?? 2e3
		});
	});
	writesByPath.set(resolved, next);
	try {
		await next;
	} finally {
		if (writesByPath.get(resolved) === next) writesByPath.delete(resolved);
	}
}
function normalizeRunStatusFilter(status) {
	if (status === "ok" || status === "error" || status === "skipped" || status === "all") return status;
	return "all";
}
function normalizeRunStatuses(opts) {
	if (Array.isArray(opts?.statuses) && opts.statuses.length > 0) {
		const filtered = opts.statuses.filter((status) => status === "ok" || status === "error" || status === "skipped");
		if (filtered.length > 0) return Array.from(new Set(filtered));
	}
	const status = normalizeRunStatusFilter(opts?.status);
	if (status === "all") return null;
	return [status];
}
function normalizeDeliveryStatuses(opts) {
	if (Array.isArray(opts?.deliveryStatuses) && opts.deliveryStatuses.length > 0) {
		const filtered = opts.deliveryStatuses.filter((status) => status === "delivered" || status === "not-delivered" || status === "unknown" || status === "not-requested");
		if (filtered.length > 0) return Array.from(new Set(filtered));
	}
	if (opts?.deliveryStatus === "delivered" || opts?.deliveryStatus === "not-delivered" || opts?.deliveryStatus === "unknown" || opts?.deliveryStatus === "not-requested") return [opts.deliveryStatus];
	return null;
}
function parseAllRunLogEntries(raw, opts) {
	const jobId = normalizeOptionalString(opts?.jobId);
	if (!raw.trim()) return [];
	const parsed = [];
	const lines = raw.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]?.trim();
		if (!line) continue;
		try {
			const obj = JSON.parse(line);
			if (!obj || typeof obj !== "object") continue;
			if (obj.action !== "finished") continue;
			if (typeof obj.jobId !== "string" || obj.jobId.trim().length === 0) continue;
			if (typeof obj.ts !== "number" || !Number.isFinite(obj.ts)) continue;
			if (jobId && obj.jobId !== jobId) continue;
			const usage = obj.usage && typeof obj.usage === "object" ? obj.usage : void 0;
			const entry = {
				ts: obj.ts,
				jobId: obj.jobId,
				action: "finished",
				status: obj.status,
				error: obj.error,
				summary: obj.summary,
				runAtMs: obj.runAtMs,
				durationMs: obj.durationMs,
				nextRunAtMs: obj.nextRunAtMs,
				model: typeof obj.model === "string" && obj.model.trim() ? obj.model : void 0,
				provider: typeof obj.provider === "string" && obj.provider.trim() ? obj.provider : void 0,
				usage: usage ? {
					input_tokens: typeof usage.input_tokens === "number" ? usage.input_tokens : void 0,
					output_tokens: typeof usage.output_tokens === "number" ? usage.output_tokens : void 0,
					total_tokens: typeof usage.total_tokens === "number" ? usage.total_tokens : void 0,
					cache_read_tokens: typeof usage.cache_read_tokens === "number" ? usage.cache_read_tokens : void 0,
					cache_write_tokens: typeof usage.cache_write_tokens === "number" ? usage.cache_write_tokens : void 0
				} : void 0
			};
			if (typeof obj.delivered === "boolean") entry.delivered = obj.delivered;
			if (obj.deliveryStatus === "delivered" || obj.deliveryStatus === "not-delivered" || obj.deliveryStatus === "unknown" || obj.deliveryStatus === "not-requested") entry.deliveryStatus = obj.deliveryStatus;
			if (typeof obj.deliveryError === "string") entry.deliveryError = obj.deliveryError;
			if (obj.delivery && typeof obj.delivery === "object") entry.delivery = obj.delivery;
			if (typeof obj.sessionId === "string" && obj.sessionId.trim().length > 0) entry.sessionId = obj.sessionId;
			if (typeof obj.sessionKey === "string" && obj.sessionKey.trim().length > 0) entry.sessionKey = obj.sessionKey;
			parsed.push(entry);
		} catch {}
	}
	return parsed;
}
function filterRunLogEntries(entries, opts) {
	return entries.filter((entry) => {
		if (opts.statuses && (!entry.status || !opts.statuses.includes(entry.status))) return false;
		if (opts.deliveryStatuses) {
			const deliveryStatus = entry.deliveryStatus ?? "not-requested";
			if (!opts.deliveryStatuses.includes(deliveryStatus)) return false;
		}
		if (!opts.query) return true;
		return normalizeLowercaseStringOrEmpty(opts.queryTextForEntry(entry)).includes(opts.query);
	});
}
async function readCronRunLogEntriesPage(filePath, opts) {
	await drainPendingWrite(filePath);
	const limit = Math.max(1, Math.min(200, Math.floor(opts?.limit ?? 50)));
	const raw = await fs$1.readFile(path.resolve(filePath), "utf-8").catch(() => "");
	const statuses = normalizeRunStatuses(opts);
	const deliveryStatuses = normalizeDeliveryStatuses(opts);
	const query = normalizeLowercaseStringOrEmpty(opts?.query);
	const sortDir = opts?.sortDir === "asc" ? "asc" : "desc";
	const filtered = filterRunLogEntries(parseAllRunLogEntries(raw, { jobId: opts?.jobId }), {
		statuses,
		deliveryStatuses,
		query,
		queryTextForEntry: (entry) => [
			entry.summary ?? "",
			entry.error ?? "",
			entry.jobId,
			entry.delivery?.intended?.channel ?? "",
			entry.delivery?.resolved?.channel ?? "",
			...(entry.delivery?.messageToolSentTo ?? []).map((target) => target.channel)
		].join(" ")
	});
	const sorted = sortDir === "asc" ? filtered.toSorted((a, b) => a.ts - b.ts) : filtered.toSorted((a, b) => b.ts - a.ts);
	const total = sorted.length;
	const offset = Math.max(0, Math.min(total, Math.floor(opts?.offset ?? 0)));
	const entries = sorted.slice(offset, offset + limit);
	const nextOffset = offset + entries.length;
	return {
		entries,
		total,
		offset,
		limit,
		hasMore: nextOffset < total,
		nextOffset: nextOffset < total ? nextOffset : null
	};
}
async function readCronRunLogEntriesPageAll(opts) {
	const limit = Math.max(1, Math.min(200, Math.floor(opts.limit ?? 50)));
	const statuses = normalizeRunStatuses(opts);
	const deliveryStatuses = normalizeDeliveryStatuses(opts);
	const query = normalizeLowercaseStringOrEmpty(opts.query);
	const sortDir = opts.sortDir === "asc" ? "asc" : "desc";
	const runsDir = path.resolve(path.dirname(path.resolve(opts.storePath)), "runs");
	const jsonlFiles = (await fs$1.readdir(runsDir, { withFileTypes: true }).catch(() => [])).filter((entry) => entry.isFile() && entry.name.endsWith(".jsonl")).map((entry) => path.join(runsDir, entry.name));
	if (jsonlFiles.length === 0) return {
		entries: [],
		total: 0,
		offset: 0,
		limit,
		hasMore: false,
		nextOffset: null
	};
	await Promise.all(jsonlFiles.map((f) => drainPendingWrite(f)));
	const filtered = filterRunLogEntries((await Promise.all(jsonlFiles.map(async (filePath) => {
		return parseAllRunLogEntries(await fs$1.readFile(filePath, "utf-8").catch(() => ""));
	}))).flat(), {
		statuses,
		deliveryStatuses,
		query,
		queryTextForEntry: (entry) => {
			const jobName = opts.jobNameById?.[entry.jobId] ?? "";
			return [
				entry.summary ?? "",
				entry.error ?? "",
				entry.jobId,
				jobName,
				entry.delivery?.intended?.channel ?? "",
				entry.delivery?.resolved?.channel ?? "",
				...(entry.delivery?.messageToolSentTo ?? []).map((target) => target.channel)
			].join(" ");
		}
	});
	const sorted = sortDir === "asc" ? filtered.toSorted((a, b) => a.ts - b.ts) : filtered.toSorted((a, b) => b.ts - a.ts);
	const total = sorted.length;
	const offset = Math.max(0, Math.min(total, Math.floor(opts.offset ?? 0)));
	const entries = sorted.slice(offset, offset + limit);
	if (opts.jobNameById) for (const entry of entries) {
		const jobName = opts.jobNameById[entry.jobId];
		if (jobName) entry.jobName = jobName;
	}
	const nextOffset = offset + entries.length;
	return {
		entries,
		total,
		offset,
		limit,
		hasMore: nextOffset < total,
		nextOffset: nextOffset < total ? nextOffset : null
	};
}
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
	const atRaw = normalizeOptionalString(schedule.at) ?? "";
	const atMs = atRaw ? parseAbsoluteTimeMs(atRaw) : null;
	if (atMs === null || !Number.isFinite(atMs)) return {
		ok: false,
		message: `Invalid schedule.at: expected ISO-8601 timestamp (got ${schedule.at})`
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
function listConfiguredAnnounceChannelIds(cfg) {
	return listConfiguredAnnounceChannelIdsForConfig({
		config: cfg,
		env: process.env,
		cache: true
	});
}
function assertConfiguredAnnounceChannel(params) {
	if (params.channel === "last") return;
	const configuredChannels = listConfiguredAnnounceChannelIds(params.cfg).toSorted();
	const normalizedChannel = normalizeMessageChannel(params.channel);
	if (!normalizedChannel) {
		if (configuredChannels.length <= 1) return;
		throw new Error(`${params.field} is required when multiple channels are configured: ${configuredChannels.join(", ")}`);
	}
	if (configuredChannels.length === 0) return;
	if (configuredChannels.includes(normalizedChannel)) return;
	throw new Error(`${params.field} must be one of: ${configuredChannels.join(", ")}`);
}
function assertValidCronAnnounceDelivery(params) {
	if (params.delivery?.mode === "announce") assertConfiguredAnnounceChannel({
		cfg: params.cfg,
		channel: params.delivery.channel,
		field: "delivery.channel"
	});
	const failureDestination = params.delivery?.failureDestination;
	if (failureDestination && (failureDestination.mode ?? "announce") === "announce") assertConfiguredAnnounceChannel({
		cfg: params.cfg,
		channel: failureDestination.channel,
		field: "delivery.failureDestination.channel"
	});
}
function assertValidCronCreateDelivery(cfg, jobCreate) {
	assertValidCronAnnounceDelivery({
		cfg,
		delivery: jobCreate.delivery
	});
}
function assertValidCronUpdateDelivery(params) {
	if (!params.currentJob || !("delivery" in params.patch)) return;
	const nextJob = structuredClone(params.currentJob);
	applyJobPatch(nextJob, params.patch, { defaultAgentId: params.defaultAgentId });
	assertValidCronAnnounceDelivery({
		cfg: params.cfg,
		delivery: nextJob.delivery
	});
}
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
		const page = await context.cron.listPage({
			includeDisabled: p.includeDisabled,
			limit: p.limit,
			offset: p.offset,
			query: p.query,
			enabled: p.enabled,
			sortBy: p.sortBy,
			sortDir: p.sortDir
		});
		const deliveryPreviews = await resolveCronDeliveryPreviews({
			cfg: loadConfig(),
			defaultAgentId: context.cron.getDefaultAgentId(),
			jobs: page.jobs
		});
		respond(true, {
			...page,
			deliveryPreviews
		}, void 0);
	},
	"cron.status": async ({ params, respond, context }) => {
		if (!validateCronStatusParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.status params: ${formatValidationErrors(validateCronStatusParams.errors)}`));
			return;
		}
		respond(true, await context.cron.status(), void 0);
	},
	"cron.add": async ({ params, respond, context }) => {
		const sessionKey = typeof params?.sessionKey === "string" ? params.sessionKey : void 0;
		let normalized;
		try {
			normalized = normalizeCronJobCreate(params, { sessionContext: { sessionKey } }) ?? params;
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.add params: ${formatErrorMessage(err)}`));
			return;
		}
		if (!validateCronAddParams(normalized)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.add params: ${formatValidationErrors(validateCronAddParams.errors)}`));
			return;
		}
		const jobCreate = normalized;
		const cfg = loadConfig();
		const timestampValidation = validateScheduleTimestamp(jobCreate.schedule);
		if (!timestampValidation.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, timestampValidation.message));
			return;
		}
		try {
			assertValidCronCreateDelivery(cfg, jobCreate);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.add params: ${formatErrorMessage(err)}`));
			return;
		}
		const job = await context.cron.add(jobCreate);
		context.logGateway.info("cron: job created", {
			jobId: job.id,
			schedule: jobCreate.schedule
		});
		respond(true, job, void 0);
	},
	"cron.update": async ({ params, respond, context }) => {
		let normalizedPatch;
		try {
			normalizedPatch = normalizeCronJobPatch(params?.patch);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.update params: ${formatErrorMessage(err)}`));
			return;
		}
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
		const cfg = loadConfig();
		if (patch.schedule) {
			const timestampValidation = validateScheduleTimestamp(patch.schedule);
			if (!timestampValidation.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, timestampValidation.message));
				return;
			}
		}
		try {
			assertValidCronUpdateDelivery({
				cfg,
				defaultAgentId: context.cron.getDefaultAgentId(),
				currentJob: context.cron.getJob(jobId),
				patch
			});
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.update params: ${formatErrorMessage(err)}`));
			return;
		}
		const job = await context.cron.update(jobId, patch);
		context.logGateway.info("cron: job updated", { jobId });
		respond(true, job, void 0);
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
		const result = await context.cron.remove(jobId);
		if (result.removed) context.logGateway.info("cron: job removed", { jobId });
		respond(true, result, void 0);
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
		let result;
		try {
			result = await context.cron.enqueueRun(jobId, p.mode ?? "force");
		} catch (error) {
			if (isInvalidCronSessionTargetIdError(error)) {
				respond(true, {
					ok: true,
					ran: false,
					reason: "invalid-spec"
				}, void 0);
				return;
			}
			throw error;
		}
		respond(true, result, void 0);
	},
	"cron.runs": async ({ params, respond, context }) => {
		if (!validateCronRunsParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid cron.runs params: ${formatValidationErrors(validateCronRunsParams.errors)}`));
			return;
		}
		const p = params;
		const explicitScope = p.scope;
		const jobId = p.id ?? p.jobId;
		const scope = explicitScope ?? (jobId ? "job" : "all");
		if (scope === "job" && !jobId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid cron.runs params: missing id"));
			return;
		}
		if (scope === "all") {
			const jobs = await context.cron.list({ includeDisabled: true });
			const jobNameById = Object.fromEntries(jobs.filter((job) => typeof job.id === "string" && typeof job.name === "string").map((job) => [job.id, job.name]));
			respond(true, await readCronRunLogEntriesPageAll({
				storePath: context.cronStorePath,
				limit: p.limit,
				offset: p.offset,
				statuses: p.statuses,
				status: p.status,
				deliveryStatuses: p.deliveryStatuses,
				deliveryStatus: p.deliveryStatus,
				query: p.query,
				sortDir: p.sortDir,
				jobNameById
			}), void 0);
			return;
		}
		let logPath;
		try {
			logPath = resolveCronRunLogPath({
				storePath: context.cronStorePath,
				jobId
			});
		} catch {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid cron.runs params: invalid id"));
			return;
		}
		respond(true, await readCronRunLogEntriesPage(logPath, {
			limit: p.limit,
			offset: p.offset,
			jobId,
			statuses: p.statuses,
			status: p.status,
			deliveryStatuses: p.deliveryStatuses,
			deliveryStatus: p.deliveryStatus,
			query: p.query,
			sortDir: p.sortDir
		}), void 0);
	}
};
//#endregion
//#region src/gateway/server-methods/devices.ts
const DEVICE_TOKEN_ROTATION_DENIED_MESSAGE = "device token rotation denied";
const DEVICE_PAIR_APPROVAL_DENIED_MESSAGE = "device pairing approval denied";
const DEVICE_PAIR_REJECTION_DENIED_MESSAGE = "device pairing rejection denied";
function redactPairedDevice(device) {
	const { tokens, approvedScopes: _approvedScopes, ...rest } = device;
	return {
		...rest,
		tokens: summarizeDeviceTokens(tokens)
	};
}
function logDeviceTokenRotationDenied(params) {
	const suffix = params.scope ? ` scope=${params.scope}` : "";
	params.log.warn(`device token rotation denied device=${params.deviceId} role=${params.role} reason=${params.reason}${suffix}`);
}
async function loadDeviceTokenRotateTarget(params) {
	const normalizedRole = params.role.trim();
	const pairedDevice = await getPairedDevice(params.deviceId);
	if (!pairedDevice || !listApprovedPairedDeviceRoles(pairedDevice).includes(normalizedRole)) {
		logDeviceTokenRotationDenied({
			log: params.log,
			deviceId: params.deviceId,
			role: params.role,
			reason: "unknown-device-or-role"
		});
		return null;
	}
	return {
		pairedDevice,
		normalizedRole
	};
}
function resolveDeviceManagementAuthz(client, targetDeviceId) {
	return {
		...resolveDeviceSessionAuthz(client),
		normalizedTargetDeviceId: targetDeviceId.trim()
	};
}
function resolveDeviceSessionAuthz(client) {
	const callerScopes = Array.isArray(client?.connect?.scopes) ? client.connect.scopes : [];
	const rawCallerDeviceId = client?.connect?.device?.id;
	return {
		callerDeviceId: client?.isDeviceTokenAuth && typeof rawCallerDeviceId === "string" && rawCallerDeviceId.trim() ? rawCallerDeviceId.trim() : null,
		callerScopes,
		isAdminCaller: callerScopes.includes("operator.admin")
	};
}
function deniesCrossDeviceManagement(authz) {
	return Boolean(authz.callerDeviceId && authz.callerDeviceId !== authz.normalizedTargetDeviceId && !authz.isAdminCaller);
}
const deviceHandlers = {
	"device.pair.list": async ({ params, respond, client }) => {
		if (!validateDevicePairListParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.list params: ${formatValidationErrors(validateDevicePairListParams.errors)}`));
			return;
		}
		const list = await listDevicePairing();
		const authz = resolveDeviceSessionAuthz(client);
		const visibleList = authz.callerDeviceId && !authz.isAdminCaller ? {
			pending: list.pending.filter((request) => request.deviceId.trim() === authz.callerDeviceId),
			paired: list.paired.filter((device) => device.deviceId.trim() === authz.callerDeviceId)
		} : list;
		respond(true, {
			pending: visibleList.pending,
			paired: visibleList.paired.map((device) => redactPairedDevice(device))
		}, void 0);
	},
	"device.pair.approve": async ({ params, respond, context, client }) => {
		if (!validateDevicePairApproveParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.approve params: ${formatValidationErrors(validateDevicePairApproveParams.errors)}`));
			return;
		}
		const { requestId } = params;
		const authz = resolveDeviceSessionAuthz(client);
		if (authz.callerDeviceId && !authz.isAdminCaller) {
			const pending = await getPendingDevicePairing(requestId);
			if (!pending) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_PAIR_APPROVAL_DENIED_MESSAGE));
				return;
			}
			if (pending.deviceId.trim() !== authz.callerDeviceId) {
				context.logGateway.warn(`device pairing approval denied request=${requestId} reason=device-ownership-mismatch`);
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_PAIR_APPROVAL_DENIED_MESSAGE));
				return;
			}
		}
		const approved = await approveDevicePairing(requestId, { callerScopes: authz.callerScopes });
		if (!approved) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown requestId"));
			return;
		}
		if (approved.status === "forbidden") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, formatDevicePairingForbiddenMessage(approved)));
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
	"device.pair.reject": async ({ params, respond, context, client }) => {
		if (!validateDevicePairRejectParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.reject params: ${formatValidationErrors(validateDevicePairRejectParams.errors)}`));
			return;
		}
		const { requestId } = params;
		const authz = resolveDeviceSessionAuthz(client);
		if (authz.callerDeviceId && !authz.isAdminCaller) {
			const pending = await getPendingDevicePairing(requestId);
			if (!pending) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_PAIR_REJECTION_DENIED_MESSAGE));
				return;
			}
			if (pending.deviceId.trim() !== authz.callerDeviceId) {
				context.logGateway.warn(`device pairing rejection denied request=${requestId} reason=device-ownership-mismatch`);
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_PAIR_REJECTION_DENIED_MESSAGE));
				return;
			}
		}
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
	"device.pair.remove": async ({ params, respond, context, client }) => {
		if (!validateDevicePairRemoveParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.remove params: ${formatValidationErrors(validateDevicePairRemoveParams.errors)}`));
			return;
		}
		const { deviceId } = params;
		if (deniesCrossDeviceManagement(resolveDeviceManagementAuthz(client, deviceId))) {
			context.logGateway.warn(`device pairing removal denied device=${deviceId} reason=device-ownership-mismatch`);
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "device pairing removal denied"));
			return;
		}
		const removed = await removePairedDevice(deviceId);
		if (!removed) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown deviceId"));
			return;
		}
		context.logGateway.info(`device pairing removed device=${removed.deviceId}`);
		respond(true, removed, void 0);
		queueMicrotask(() => {
			context.disconnectClientsForDevice?.(removed.deviceId);
		});
	},
	"device.token.rotate": async ({ params, respond, context, client }) => {
		if (!validateDeviceTokenRotateParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.token.rotate params: ${formatValidationErrors(validateDeviceTokenRotateParams.errors)}`));
			return;
		}
		const { deviceId, role, scopes } = params;
		const authz = resolveDeviceManagementAuthz(client, deviceId);
		if (deniesCrossDeviceManagement(authz)) {
			logDeviceTokenRotationDenied({
				log: context.logGateway,
				deviceId,
				role,
				reason: "device-ownership-mismatch"
			});
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_TOKEN_ROTATION_DENIED_MESSAGE));
			return;
		}
		const rotateTarget = await loadDeviceTokenRotateTarget({
			deviceId,
			role,
			log: context.logGateway
		});
		if (!rotateTarget) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_TOKEN_ROTATION_DENIED_MESSAGE));
			return;
		}
		const { pairedDevice, normalizedRole } = rotateTarget;
		const missingScope = resolveMissingRequestedScope({
			role,
			requestedScopes: normalizeDeviceAuthScopes(scopes ?? pairedDevice.tokens?.[normalizedRole]?.scopes ?? pairedDevice.scopes),
			allowedScopes: authz.callerScopes
		});
		if (missingScope) {
			logDeviceTokenRotationDenied({
				log: context.logGateway,
				deviceId,
				role,
				reason: "caller-missing-scope",
				scope: missingScope
			});
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_TOKEN_ROTATION_DENIED_MESSAGE));
			return;
		}
		const rotated = await rotateDeviceToken({
			deviceId,
			role,
			scopes
		});
		if (!rotated.ok) {
			logDeviceTokenRotationDenied({
				log: context.logGateway,
				deviceId,
				role,
				reason: rotated.reason
			});
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, DEVICE_TOKEN_ROTATION_DENIED_MESSAGE));
			return;
		}
		const entry = rotated.entry;
		context.logGateway.info(`device token rotated device=${deviceId} role=${entry.role} scopes=${entry.scopes.join(",")}`);
		respond(true, {
			deviceId,
			role: entry.role,
			token: entry.token,
			scopes: entry.scopes,
			rotatedAtMs: entry.rotatedAtMs ?? entry.createdAtMs
		}, void 0);
		queueMicrotask(() => {
			context.disconnectClientsForDevice?.(deviceId.trim(), { role: entry.role });
		});
	},
	"device.token.revoke": async ({ params, respond, context, client }) => {
		if (!validateDeviceTokenRevokeParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.token.revoke params: ${formatValidationErrors(validateDeviceTokenRevokeParams.errors)}`));
			return;
		}
		const { deviceId, role } = params;
		if (deniesCrossDeviceManagement(resolveDeviceManagementAuthz(client, deviceId))) {
			context.logGateway.warn(`device token revocation denied device=${deviceId} role=${role} reason=device-ownership-mismatch`);
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "device token revocation denied"));
			return;
		}
		const entry = await revokeDeviceToken({
			deviceId,
			role
		});
		if (!entry) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown deviceId/role"));
			return;
		}
		const normalizedDeviceId = deviceId.trim();
		context.logGateway.info(`device token revoked device=${normalizedDeviceId} role=${entry.role}`);
		respond(true, {
			deviceId: normalizedDeviceId,
			role: entry.role,
			revokedAtMs: entry.revokedAtMs ?? Date.now()
		}, void 0);
		queueMicrotask(() => {
			context.disconnectClientsForDevice?.(normalizedDeviceId, { role: entry.role });
		});
	}
};
//#endregion
//#region src/gateway/server-methods/diagnostics.ts
const diagnosticsHandlers = { "diagnostics.stability": async ({ params, respond }) => {
	try {
		respond(true, getDiagnosticStabilitySnapshot(normalizeDiagnosticStabilityQuery(params)), void 0);
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, err instanceof Error ? err.message : "invalid diagnostics.stability params"));
	}
} };
//#endregion
//#region src/infra/voicewake.ts
const DEFAULT_TRIGGERS = [
	"openclaw",
	"claude",
	"computer"
];
function resolvePath(baseDir) {
	const root = baseDir ?? resolveStateDir();
	return path.join(root, "settings", "voicewake.json");
}
function sanitizeTriggers(triggers) {
	const cleaned = (triggers ?? []).map((w) => normalizeOptionalString(w) ?? "").filter((w) => w.length > 0);
	return cleaned.length > 0 ? cleaned : DEFAULT_TRIGGERS;
}
const withLock = createAsyncLock();
function defaultVoiceWakeTriggers() {
	return [...DEFAULT_TRIGGERS];
}
async function loadVoiceWakeConfig(baseDir) {
	const existing = await readJsonFile(resolvePath(baseDir));
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
	const filePath = resolvePath(baseDir);
	return await withLock(async () => {
		const next = {
			triggers: sanitized,
			updatedAtMs: Date.now()
		};
		await writeJsonAtomic(filePath, next);
		return next;
	});
}
//#endregion
//#region src/gateway/server-utils.ts
function normalizeVoiceWakeTriggers(input) {
	const cleaned = (Array.isArray(input) ? input : []).map((v) => normalizeOptionalString(v)).filter((v) => v !== void 0).slice(0, 32).map((v) => v.slice(0, 64));
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
//#region src/gateway/server-methods/record-shared.ts
function normalizeTrimmedString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
//#endregion
//#region src/gateway/server-methods/doctor.ts
const SHORT_TERM_STORE_RELATIVE_PATH = path.join("memory", ".dreams", "short-term-recall.json");
const SHORT_TERM_PHASE_SIGNAL_RELATIVE_PATH = path.join("memory", ".dreams", "phase-signals.json");
const MANAGED_DEEP_SLEEP_CRON_NAME = "Memory Dreaming Promotion";
const MANAGED_DEEP_SLEEP_CRON_TAG = "[managed-by=memory-core.short-term-promotion]";
const DEEP_SLEEP_SYSTEM_EVENT_TEXT = "__openclaw_memory_core_short_term_promotion_dream__";
const DREAM_DIARY_FILE_NAMES = ["DREAMS.md", "dreams.md"];
function extractIsoDayFromPath(filePath) {
	return filePath.replaceAll("\\", "/").match(/(\d{4}-\d{2}-\d{2})\.md$/i)?.[1] ?? null;
}
function groundedMarkdownToDiaryLines(markdown) {
	return markdown.split("\n").map((line) => line.replace(/^##\s+/, "").trimEnd()).filter((line, index, lines) => line.length > 0 || index > 0 && lines[index - 1]?.length > 0);
}
async function listWorkspaceDailyFiles(memoryDir) {
	let entries = [];
	try {
		entries = await fs$1.readdir(memoryDir);
	} catch (err) {
		if (err?.code === "ENOENT") return [];
		throw err;
	}
	return entries.filter((name) => /^\d{4}-\d{2}-\d{2}\.md$/i.test(name)).map((name) => path.join(memoryDir, name)).toSorted((left, right) => left.localeCompare(right));
}
function resolveDreamingConfig(cfg) {
	const resolved = resolveMemoryDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(cfg),
		cfg
	});
	const light = resolveMemoryLightDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(cfg),
		cfg
	});
	const deep = resolveMemoryDeepDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(cfg),
		cfg
	});
	const rem = resolveMemoryRemDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(cfg),
		cfg
	});
	return {
		enabled: resolved.enabled,
		...resolved.timezone ? { timezone: resolved.timezone } : {},
		verboseLogging: resolved.verboseLogging,
		storageMode: resolved.storage.mode,
		separateReports: resolved.storage.separateReports,
		shortTermEntries: [],
		signalEntries: [],
		promotedEntries: [],
		phases: {
			light: {
				enabled: light.enabled,
				cron: light.cron,
				lookbackDays: light.lookbackDays,
				limit: light.limit,
				managedCronPresent: false
			},
			deep: {
				enabled: deep.enabled,
				cron: deep.cron,
				limit: deep.limit,
				minScore: deep.minScore,
				minRecallCount: deep.minRecallCount,
				minUniqueQueries: deep.minUniqueQueries,
				recencyHalfLifeDays: deep.recencyHalfLifeDays,
				managedCronPresent: false,
				...typeof deep.maxAgeDays === "number" ? { maxAgeDays: deep.maxAgeDays } : {}
			},
			rem: {
				enabled: rem.enabled,
				cron: rem.cron,
				lookbackDays: rem.lookbackDays,
				limit: rem.limit,
				minPatternStrength: rem.minPatternStrength,
				managedCronPresent: false
			}
		}
	};
}
function normalizeMemoryPath(rawPath) {
	return rawPath.replaceAll("\\", "/").replace(/^\.\//, "");
}
function normalizeMemoryPathForWorkspace(workspaceDir, rawPath) {
	const normalized = normalizeMemoryPath(rawPath);
	const workspaceNormalized = normalizeMemoryPath(workspaceDir);
	if (path.isAbsolute(rawPath) && normalized.startsWith(`${workspaceNormalized}/`)) return normalized.slice(workspaceNormalized.length + 1);
	return normalized;
}
function isShortTermMemoryPath(filePath) {
	const normalized = normalizeMemoryPath(filePath);
	if (/(?:^|\/)memory\/(\d{4})-(\d{2})-(\d{2})\.md$/.test(normalized)) return true;
	if (/(?:^|\/)memory\/\.dreams\/session-corpus\/(\d{4})-(\d{2})-(\d{2})\.(?:md|txt)$/.test(normalized)) return true;
	return /^(\d{4})-(\d{2})-(\d{2})\.md$/.test(normalized);
}
const DREAMING_ENTRY_LIST_LIMIT = 8;
function toNonNegativeInt(value) {
	const num = Number(value);
	if (!Number.isFinite(num)) return 0;
	return Math.max(0, Math.floor(num));
}
function parseEntryRangeFromKey(key, fallbackStartLine, fallbackEndLine) {
	const startLine = toNonNegativeInt(fallbackStartLine);
	const endLine = toNonNegativeInt(fallbackEndLine);
	if (startLine > 0 && endLine > 0) return {
		startLine,
		endLine
	};
	const match = key.match(/:(\d+):(\d+)$/);
	if (match) return {
		startLine: Math.max(1, toNonNegativeInt(match[1])),
		endLine: Math.max(1, toNonNegativeInt(match[2]))
	};
	return {
		startLine: 1,
		endLine: 1
	};
}
function compareDreamingEntryByRecency(a, b) {
	const aMs = a.lastRecalledAt ? Date.parse(a.lastRecalledAt) : Number.NEGATIVE_INFINITY;
	const bMs = b.lastRecalledAt ? Date.parse(b.lastRecalledAt) : Number.NEGATIVE_INFINITY;
	if (Number.isFinite(aMs) || Number.isFinite(bMs)) {
		if (bMs !== aMs) return bMs - aMs;
	}
	if (b.totalSignalCount !== a.totalSignalCount) return b.totalSignalCount - a.totalSignalCount;
	return a.path.localeCompare(b.path);
}
function compareDreamingEntryBySignals(a, b) {
	if (b.totalSignalCount !== a.totalSignalCount) return b.totalSignalCount - a.totalSignalCount;
	if (b.phaseHitCount !== a.phaseHitCount) return b.phaseHitCount - a.phaseHitCount;
	return compareDreamingEntryByRecency(a, b);
}
function compareDreamingEntryByPromotion(a, b) {
	const aMs = a.promotedAt ? Date.parse(a.promotedAt) : Number.NEGATIVE_INFINITY;
	const bMs = b.promotedAt ? Date.parse(b.promotedAt) : Number.NEGATIVE_INFINITY;
	if (Number.isFinite(aMs) || Number.isFinite(bMs)) {
		if (bMs !== aMs) return bMs - aMs;
	}
	return compareDreamingEntryBySignals(a, b);
}
function trimDreamingEntries(entries, compare) {
	return entries.toSorted(compare).slice(0, DREAMING_ENTRY_LIST_LIMIT);
}
async function loadDreamingStoreStats(workspaceDir, nowMs, timezone) {
	const storePath = path.join(workspaceDir, SHORT_TERM_STORE_RELATIVE_PATH);
	const phaseSignalPath = path.join(workspaceDir, SHORT_TERM_PHASE_SIGNAL_RELATIVE_PATH);
	try {
		const raw = await fs$1.readFile(storePath, "utf-8");
		const entries = asOptionalRecord(asOptionalRecord(JSON.parse(raw))?.entries) ?? {};
		let shortTermCount = 0;
		let recallSignalCount = 0;
		let dailySignalCount = 0;
		let groundedSignalCount = 0;
		let totalSignalCount = 0;
		let phaseSignalCount = 0;
		let lightPhaseHitCount = 0;
		let remPhaseHitCount = 0;
		let promotedTotal = 0;
		let promotedToday = 0;
		let latestPromotedAtMs = Number.NEGATIVE_INFINITY;
		let latestPromotedAt;
		const activeKeys = /* @__PURE__ */ new Set();
		const activeEntries = /* @__PURE__ */ new Map();
		const shortTermEntries = [];
		const promotedEntries = [];
		for (const [entryKey, value] of Object.entries(entries)) {
			const entry = asOptionalRecord(value);
			if (!entry) continue;
			const source = normalizeTrimmedString(entry.source);
			const entryPath = normalizeTrimmedString(entry.path);
			if (source !== "memory" || !entryPath || !isShortTermMemoryPath(entryPath)) continue;
			const range = parseEntryRangeFromKey(entryKey, entry.startLine, entry.endLine);
			const recallCount = toNonNegativeInt(entry.recallCount);
			const dailyCount = toNonNegativeInt(entry.dailyCount);
			const groundedCount = toNonNegativeInt(entry.groundedCount);
			const totalEntrySignalCount = recallCount + dailyCount + groundedCount;
			const normalizedEntryPath = normalizeMemoryPathForWorkspace(workspaceDir, entryPath);
			const snippet = normalizeTrimmedString(entry.snippet) ?? normalizeTrimmedString(entry.summary) ?? normalizedEntryPath;
			const lastRecalledAt = normalizeTrimmedString(entry.lastRecalledAt);
			const detail = {
				key: entryKey,
				path: normalizedEntryPath,
				startLine: range.startLine,
				endLine: Math.max(range.startLine, range.endLine),
				snippet,
				recallCount,
				dailyCount,
				groundedCount,
				totalSignalCount: totalEntrySignalCount,
				lightHits: 0,
				remHits: 0,
				phaseHitCount: 0,
				...lastRecalledAt ? { lastRecalledAt } : {}
			};
			const promotedAt = normalizeTrimmedString(entry.promotedAt);
			if (!promotedAt) {
				shortTermCount += 1;
				activeKeys.add(entryKey);
				recallSignalCount += recallCount;
				dailySignalCount += dailyCount;
				groundedSignalCount += groundedCount;
				totalSignalCount += totalEntrySignalCount;
				shortTermEntries.push(detail);
				activeEntries.set(entryKey, detail);
				continue;
			}
			promotedTotal += 1;
			promotedEntries.push({
				...detail,
				promotedAt
			});
			const promotedAtMs = Date.parse(promotedAt);
			if (Number.isFinite(promotedAtMs) && isSameMemoryDreamingDay(promotedAtMs, nowMs, timezone)) promotedToday += 1;
			if (Number.isFinite(promotedAtMs) && promotedAtMs > latestPromotedAtMs) {
				latestPromotedAtMs = promotedAtMs;
				latestPromotedAt = promotedAt;
			}
		}
		let phaseSignalError;
		try {
			const phaseRaw = await fs$1.readFile(phaseSignalPath, "utf-8");
			const phaseEntries = asOptionalRecord(asOptionalRecord(JSON.parse(phaseRaw))?.entries) ?? {};
			for (const [key, value] of Object.entries(phaseEntries)) {
				if (!activeKeys.has(key)) continue;
				const phaseEntry = asOptionalRecord(value);
				const lightHits = toNonNegativeInt(phaseEntry?.lightHits);
				const remHits = toNonNegativeInt(phaseEntry?.remHits);
				lightPhaseHitCount += lightHits;
				remPhaseHitCount += remHits;
				phaseSignalCount += lightHits + remHits;
				const detail = activeEntries.get(key);
				if (detail) {
					detail.lightHits = lightHits;
					detail.remHits = remHits;
					detail.phaseHitCount = lightHits + remHits;
				}
			}
		} catch (err) {
			if (err?.code !== "ENOENT") phaseSignalError = formatError(err);
		}
		return {
			shortTermCount,
			recallSignalCount,
			dailySignalCount,
			groundedSignalCount,
			totalSignalCount,
			phaseSignalCount,
			lightPhaseHitCount,
			remPhaseHitCount,
			promotedTotal,
			promotedToday,
			storePath,
			phaseSignalPath,
			shortTermEntries: trimDreamingEntries(shortTermEntries, compareDreamingEntryByRecency),
			signalEntries: trimDreamingEntries(shortTermEntries, compareDreamingEntryBySignals),
			promotedEntries: trimDreamingEntries(promotedEntries, compareDreamingEntryByPromotion),
			...latestPromotedAt ? { lastPromotedAt: latestPromotedAt } : {},
			...phaseSignalError ? { phaseSignalError } : {}
		};
	} catch (err) {
		if (err?.code === "ENOENT") return {
			shortTermCount: 0,
			recallSignalCount: 0,
			dailySignalCount: 0,
			groundedSignalCount: 0,
			totalSignalCount: 0,
			phaseSignalCount: 0,
			lightPhaseHitCount: 0,
			remPhaseHitCount: 0,
			promotedTotal: 0,
			promotedToday: 0,
			storePath,
			phaseSignalPath,
			shortTermEntries: [],
			signalEntries: [],
			promotedEntries: []
		};
		return {
			shortTermCount: 0,
			recallSignalCount: 0,
			dailySignalCount: 0,
			groundedSignalCount: 0,
			totalSignalCount: 0,
			phaseSignalCount: 0,
			lightPhaseHitCount: 0,
			remPhaseHitCount: 0,
			promotedTotal: 0,
			promotedToday: 0,
			storePath,
			phaseSignalPath,
			shortTermEntries: [],
			signalEntries: [],
			promotedEntries: [],
			storeError: formatError(err)
		};
	}
}
function mergeDreamingStoreStats(stats) {
	let shortTermCount = 0;
	let recallSignalCount = 0;
	let dailySignalCount = 0;
	let groundedSignalCount = 0;
	let totalSignalCount = 0;
	let phaseSignalCount = 0;
	let lightPhaseHitCount = 0;
	let remPhaseHitCount = 0;
	let promotedTotal = 0;
	let promotedToday = 0;
	let latestPromotedAtMs = Number.NEGATIVE_INFINITY;
	let lastPromotedAt;
	const storePaths = /* @__PURE__ */ new Set();
	const phaseSignalPaths = /* @__PURE__ */ new Set();
	const storeErrors = [];
	const phaseSignalErrors = [];
	const shortTermEntries = [];
	const signalEntries = [];
	const promotedEntries = [];
	for (const stat of stats) {
		shortTermCount += stat.shortTermCount;
		recallSignalCount += stat.recallSignalCount;
		dailySignalCount += stat.dailySignalCount;
		groundedSignalCount += stat.groundedSignalCount;
		totalSignalCount += stat.totalSignalCount;
		phaseSignalCount += stat.phaseSignalCount;
		lightPhaseHitCount += stat.lightPhaseHitCount;
		remPhaseHitCount += stat.remPhaseHitCount;
		promotedTotal += stat.promotedTotal;
		promotedToday += stat.promotedToday;
		if (stat.storePath) storePaths.add(stat.storePath);
		if (stat.phaseSignalPath) phaseSignalPaths.add(stat.phaseSignalPath);
		if (stat.storeError) storeErrors.push(stat.storeError);
		if (stat.phaseSignalError) phaseSignalErrors.push(stat.phaseSignalError);
		shortTermEntries.push(...stat.shortTermEntries);
		signalEntries.push(...stat.signalEntries);
		promotedEntries.push(...stat.promotedEntries);
		const promotedAtMs = stat.lastPromotedAt ? Date.parse(stat.lastPromotedAt) : NaN;
		if (Number.isFinite(promotedAtMs) && promotedAtMs > latestPromotedAtMs) {
			latestPromotedAtMs = promotedAtMs;
			lastPromotedAt = stat.lastPromotedAt;
		}
	}
	return {
		shortTermCount,
		recallSignalCount,
		dailySignalCount,
		groundedSignalCount,
		totalSignalCount,
		phaseSignalCount,
		lightPhaseHitCount,
		remPhaseHitCount,
		promotedTotal,
		promotedToday,
		shortTermEntries: trimDreamingEntries(shortTermEntries, compareDreamingEntryByRecency),
		signalEntries: trimDreamingEntries(signalEntries, compareDreamingEntryBySignals),
		promotedEntries: trimDreamingEntries(promotedEntries, compareDreamingEntryByPromotion),
		...storePaths.size === 1 ? { storePath: [...storePaths][0] } : {},
		...phaseSignalPaths.size === 1 ? { phaseSignalPath: [...phaseSignalPaths][0] } : {},
		...lastPromotedAt ? { lastPromotedAt } : {},
		...storeErrors.length === 1 ? { storeError: storeErrors[0] } : storeErrors.length > 1 ? { storeError: `${storeErrors.length} dreaming stores had read errors.` } : {},
		...phaseSignalErrors.length === 1 ? { phaseSignalError: phaseSignalErrors[0] } : phaseSignalErrors.length > 1 ? { phaseSignalError: `${phaseSignalErrors.length} phase signal stores had read errors.` } : {}
	};
}
function isManagedDreamingJob(job, params) {
	if (normalizeTrimmedString(job.description)?.includes(params.tag)) return true;
	const name = normalizeTrimmedString(job.name);
	const payloadKind = normalizeTrimmedString(job.payload?.kind)?.toLowerCase();
	const payloadText = normalizeTrimmedString(job.payload?.text);
	return name === params.name && payloadKind === "systemevent" && payloadText === params.payloadText;
}
async function resolveManagedDreamingCronStatus(params) {
	if (!params.context.cron || typeof params.context.cron.list !== "function") return { managedCronPresent: false };
	try {
		const managed = (await params.context.cron.list({ includeDisabled: true })).filter((job) => typeof job === "object" && job !== null).filter((job) => isManagedDreamingJob(job, params.match));
		let nextRunAtMs;
		for (const job of managed) {
			if (job.enabled !== true) continue;
			const candidate = job.state?.nextRunAtMs;
			if (typeof candidate !== "number" || !Number.isFinite(candidate)) continue;
			if (nextRunAtMs === void 0 || candidate < nextRunAtMs) nextRunAtMs = candidate;
		}
		return {
			managedCronPresent: managed.length > 0,
			...nextRunAtMs !== void 0 ? { nextRunAtMs } : {}
		};
	} catch {
		return { managedCronPresent: false };
	}
}
async function resolveAllManagedDreamingCronStatuses(context) {
	const sweepStatus = await resolveManagedDreamingCronStatus({
		context,
		match: {
			name: MANAGED_DEEP_SLEEP_CRON_NAME,
			tag: MANAGED_DEEP_SLEEP_CRON_TAG,
			payloadText: DEEP_SLEEP_SYSTEM_EVENT_TEXT
		}
	});
	return {
		light: sweepStatus,
		deep: sweepStatus,
		rem: sweepStatus
	};
}
async function readDreamDiary(workspaceDir) {
	for (const name of DREAM_DIARY_FILE_NAMES) {
		const filePath = path.join(workspaceDir, name);
		let stat;
		try {
			stat = await fs$1.lstat(filePath);
		} catch (err) {
			if (err?.code === "ENOENT") continue;
			return {
				found: false,
				path: name
			};
		}
		if (stat.isSymbolicLink() || !stat.isFile()) continue;
		try {
			return {
				found: true,
				path: name,
				content: await fs$1.readFile(filePath, "utf-8"),
				updatedAtMs: Math.floor(stat.mtimeMs)
			};
		} catch {
			return {
				found: false,
				path: name
			};
		}
	}
	return {
		found: false,
		path: DREAM_DIARY_FILE_NAMES[0]
	};
}
const doctorHandlers = {
	"doctor.memory.status": async ({ respond, context }) => {
		const cfg = loadConfig();
		const agentId = resolveDefaultAgentId(cfg);
		const { manager, error } = await getActiveMemorySearchManager({
			cfg,
			agentId,
			purpose: "status"
		});
		if (!manager) {
			respond(true, {
				agentId,
				embedding: {
					ok: false,
					error: error ?? "memory search unavailable"
				}
			}, void 0);
			return;
		}
		try {
			const status = manager.status();
			let embedding = await manager.probeEmbeddingAvailability();
			if (!embedding.ok && !embedding.error) embedding = {
				ok: false,
				error: "memory embeddings unavailable"
			};
			const nowMs = Date.now();
			const dreamingConfig = resolveDreamingConfig(cfg);
			const workspaceDir = normalizeTrimmedString(status.workspaceDir);
			const configuredWorkspaces = resolveMemoryDreamingWorkspaces(cfg).map((entry) => entry.workspaceDir);
			const allWorkspaces = configuredWorkspaces.length > 0 ? configuredWorkspaces : workspaceDir ? [workspaceDir] : [];
			const storeStats = allWorkspaces.length > 0 ? mergeDreamingStoreStats(await Promise.all(allWorkspaces.map((entry) => loadDreamingStoreStats(entry, nowMs, dreamingConfig.timezone)))) : {
				shortTermCount: 0,
				recallSignalCount: 0,
				dailySignalCount: 0,
				groundedSignalCount: 0,
				totalSignalCount: 0,
				phaseSignalCount: 0,
				lightPhaseHitCount: 0,
				remPhaseHitCount: 0,
				promotedTotal: 0,
				promotedToday: 0
			};
			const cronStatuses = await resolveAllManagedDreamingCronStatuses(context);
			respond(true, {
				agentId,
				provider: status.provider,
				embedding,
				dreaming: {
					...dreamingConfig,
					...storeStats,
					phases: {
						light: {
							...dreamingConfig.phases.light,
							...cronStatuses.light
						},
						deep: {
							...dreamingConfig.phases.deep,
							...cronStatuses.deep
						},
						rem: {
							...dreamingConfig.phases.rem,
							...cronStatuses.rem
						}
					}
				}
			}, void 0);
		} catch (err) {
			respond(true, {
				agentId,
				embedding: {
					ok: false,
					error: `gateway memory probe failed: ${formatError(err)}`
				}
			}, void 0);
		} finally {
			await manager.close?.().catch(() => {});
		}
	},
	"doctor.memory.dreamDiary": async ({ respond }) => {
		const cfg = loadConfig();
		const agentId = resolveDefaultAgentId(cfg);
		respond(true, {
			agentId,
			...await readDreamDiary(resolveAgentWorkspaceDir(cfg, agentId))
		}, void 0);
	},
	"doctor.memory.backfillDreamDiary": async ({ respond }) => {
		const cfg = loadConfig();
		const agentId = resolveDefaultAgentId(cfg);
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const sourceFiles = await listWorkspaceDailyFiles(path.join(workspaceDir, "memory"));
		if (sourceFiles.length === 0) {
			const dreamDiary = await readDreamDiary(workspaceDir);
			respond(true, {
				agentId,
				path: dreamDiary.path,
				action: "backfill",
				found: dreamDiary.found,
				scannedFiles: 0,
				written: 0,
				replaced: 0
			}, void 0);
			return;
		}
		const grounded = await previewGroundedRemMarkdown({
			workspaceDir,
			inputPaths: sourceFiles
		});
		const remConfig = resolveMemoryRemDreamingConfig({
			pluginConfig: resolveMemoryDreamingPluginConfig(cfg),
			cfg
		});
		const written = await writeBackfillDiaryEntries({
			workspaceDir,
			entries: grounded.files.map((file) => {
				const isoDay = extractIsoDayFromPath(file.path);
				if (!isoDay) return null;
				return {
					isoDay,
					sourcePath: file.path,
					bodyLines: groundedMarkdownToDiaryLines(file.renderedMarkdown)
				};
			}).filter((entry) => entry !== null),
			timezone: remConfig.timezone
		});
		const dreamDiary = await readDreamDiary(workspaceDir);
		respond(true, {
			agentId,
			path: dreamDiary.path,
			action: "backfill",
			found: dreamDiary.found,
			scannedFiles: grounded.scannedFiles,
			written: written.written,
			replaced: written.replaced
		}, void 0);
	},
	"doctor.memory.resetDreamDiary": async ({ respond }) => {
		const cfg = loadConfig();
		const agentId = resolveDefaultAgentId(cfg);
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const removed = await removeBackfillDiaryEntries({ workspaceDir });
		const dreamDiary = await readDreamDiary(workspaceDir);
		respond(true, {
			agentId,
			path: dreamDiary.path,
			action: "reset",
			found: dreamDiary.found,
			removedEntries: removed.removed
		}, void 0);
	},
	"doctor.memory.resetGroundedShortTerm": async ({ respond }) => {
		const cfg = loadConfig();
		const agentId = resolveDefaultAgentId(cfg);
		respond(true, {
			agentId,
			action: "resetGroundedShortTerm",
			removedShortTermEntries: (await removeGroundedShortTermCandidates({ workspaceDir: resolveAgentWorkspaceDir(cfg, agentId) })).removed
		}, void 0);
	},
	"doctor.memory.repairDreamingArtifacts": async ({ respond }) => {
		const cfg = loadConfig();
		const agentId = resolveDefaultAgentId(cfg);
		const repair = await repairDreamingArtifacts({ workspaceDir: resolveAgentWorkspaceDir(cfg, agentId) });
		respond(true, {
			agentId,
			action: "repairDreamingArtifacts",
			changed: repair.changed,
			archiveDir: repair.archiveDir,
			archivedDreamsDiary: repair.archivedDreamsDiary,
			archivedSessionCorpus: repair.archivedSessionCorpus,
			archivedSessionIngestion: repair.archivedSessionIngestion,
			warnings: repair.warnings
		}, void 0);
	},
	"doctor.memory.dedupeDreamDiary": async ({ respond }) => {
		const cfg = loadConfig();
		const agentId = resolveDefaultAgentId(cfg);
		const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
		const dedupe = await dedupeDreamDiaryEntries({ workspaceDir });
		const dreamDiary = await readDreamDiary(workspaceDir);
		respond(true, {
			agentId,
			action: "dedupeDreamDiary",
			path: dreamDiary.path,
			found: dreamDiary.found,
			removedEntries: dedupe.removed,
			dedupedEntries: dedupe.removed,
			keptEntries: dedupe.kept
		}, void 0);
	}
};
//#endregion
//#region src/gateway/server-methods/exec-approvals.ts
function requireApprovalsBaseHash(params, snapshot, respond) {
	if (!snapshot.exists) return true;
	if (!snapshot.hash) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "exec approvals base hash unavailable; re-run exec.approvals.get and retry"));
		return false;
	}
	const baseHash = resolveBaseHashParam(params);
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
function toExecApprovalsPayload(snapshot) {
	return {
		path: snapshot.path,
		exists: snapshot.exists,
		hash: snapshot.hash,
		file: redactExecApprovals(snapshot.file)
	};
}
function resolveNodeIdOrRespond(nodeId, respond) {
	const id = nodeId.trim();
	if (!id) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
		return null;
	}
	return id;
}
const execApprovalsHandlers = {
	"exec.approvals.get": ({ params, respond }) => {
		if (!assertValidParams(params, validateExecApprovalsGetParams, "exec.approvals.get", respond)) return;
		ensureExecApprovals();
		respond(true, toExecApprovalsPayload(readExecApprovalsSnapshot()), void 0);
	},
	"exec.approvals.set": ({ params, respond }) => {
		if (!assertValidParams(params, validateExecApprovalsSetParams, "exec.approvals.set", respond)) return;
		ensureExecApprovals();
		const snapshot = readExecApprovalsSnapshot();
		if (!requireApprovalsBaseHash(params, snapshot, respond)) return;
		const incoming = params.file;
		if (!incoming || typeof incoming !== "object") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "exec approvals file is required"));
			return;
		}
		saveExecApprovals(mergeExecApprovalsSocketDefaults({
			normalized: normalizeExecApprovals(incoming),
			current: snapshot.file
		}));
		respond(true, toExecApprovalsPayload(readExecApprovalsSnapshot()), void 0);
	},
	"exec.approvals.node.get": async ({ params, respond, context }) => {
		if (!assertValidParams(params, validateExecApprovalsNodeGetParams, "exec.approvals.node.get", respond)) return;
		const { nodeId } = params;
		const id = resolveNodeIdOrRespond(nodeId, respond);
		if (!id) return;
		await respondUnavailableOnThrow(respond, async () => {
			const res = await context.nodeRegistry.invoke({
				nodeId: id,
				command: "system.execApprovals.get",
				params: {}
			});
			if (!respondUnavailableOnNodeInvokeError(respond, res)) return;
			respond(true, res.payloadJSON ? safeParseJson(res.payloadJSON) : res.payload, void 0);
		});
	},
	"exec.approvals.node.set": async ({ params, respond, context }) => {
		if (!assertValidParams(params, validateExecApprovalsNodeSetParams, "exec.approvals.node.set", respond)) return;
		const { nodeId, file, baseHash } = params;
		const id = resolveNodeIdOrRespond(nodeId, respond);
		if (!id) return;
		await respondUnavailableOnThrow(respond, async () => {
			const res = await context.nodeRegistry.invoke({
				nodeId: id,
				command: "system.execApprovals.set",
				params: {
					file,
					baseHash
				}
			});
			if (!respondUnavailableOnNodeInvokeError(respond, res)) return;
			respond(true, safeParseJson(res.payloadJSON ?? null), void 0);
		});
	}
};
//#endregion
//#region src/gateway/server-methods/health.ts
const ADMIN_SCOPE = "operator.admin";
const healthHandlers = {
	health: async ({ respond, context, params }) => {
		const { getHealthCache, refreshHealthSnapshot, logHealth } = context;
		const wantsProbe = params?.probe === true;
		const now = Date.now();
		const cached = getHealthCache();
		if (!wantsProbe && cached && now - cached.ts < 6e4) {
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
	status: async ({ respond, client }) => {
		respond(true, await getStatusSummary({ includeSensitive: (Array.isArray(client?.connect?.scopes) ? client.connect.scopes : []).includes(ADMIN_SCOPE) }), void 0);
	}
};
//#endregion
//#region src/gateway/server-methods/logs.ts
const logsHandlers = { "logs.tail": async ({ params, respond }) => {
	if (!validateLogsTailParams(params)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid logs.tail params: ${formatValidationErrors(validateLogsTailParams.errors)}`));
		return;
	}
	const p = params;
	try {
		respond(true, await readConfiguredLogTail({
			cursor: p.cursor,
			limit: p.limit,
			maxBytes: p.maxBytes
		}), void 0);
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `log read failed: ${String(err)}`));
	}
} };
//#endregion
//#region src/gateway/server-methods/models-auth-status.ts
const log = createSubsystemLogger("models-auth-status");
const CACHE_TTL_MS = 6e4;
let cached = null;
function buildExpiry(remainingMs, expiresAt) {
	if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt) || typeof remainingMs !== "number") return;
	return {
		at: expiresAt,
		remainingMs,
		label: formatRemainingShort(remainingMs)
	};
}
function providerDisplayName(provider) {
	const usageId = resolveUsageProviderId(provider);
	if (usageId && PROVIDER_LABELS[usageId]) return PROVIDER_LABELS[usageId];
	return provider;
}
/**
* Aggregate provider status from OAuth profiles only. `buildAuthHealthSummary`
* rolls up across both OAuth and token profiles, which mis-reports providers
* where a healthy OAuth sits alongside an expired/missing bearer token.
* For the dashboard's OAuth-health signal, token profiles are a separate
* concern — we want "is OAuth healthy?", not "is every credential healthy?"
*
* `expectsOAuth` surfaces the configured-OAuth-but-no-oauth-profile case as
* `missing` instead of silently falling back to the provider's rollup (which
* would report `static` if only api_key credentials exist). Without this,
* switching a provider from api_key to oauth in config but forgetting to
* login hides behind the residual api_key profile until runtime fails.
*
* Exported for direct unit testing of the rollup rules.
*/
function aggregateOAuthStatus(prov, now = Date.now(), expectsOAuth = false) {
	const oauth = prov.profiles.filter((p) => p.type === "oauth");
	if (oauth.length === 0) {
		if (expectsOAuth) return { status: "missing" };
		return {
			status: prov.status,
			expiresAt: prov.expiresAt,
			remainingMs: prov.remainingMs
		};
	}
	const statuses = new Set(oauth.map((p) => p.status));
	let status;
	if (statuses.has("expired") || statuses.has("missing")) status = "expired";
	else if (statuses.has("expiring")) status = "expiring";
	else if (statuses.has("ok")) status = "ok";
	else if (statuses.has("static")) status = "static";
	else {
		Array.from(statuses)[0];
		status = "static";
	}
	const expirable = oauth.map((p) => p.expiresAt).filter((v) => typeof v === "number" && Number.isFinite(v));
	const expiresAt = expirable.length > 0 ? Math.min(...expirable) : void 0;
	const remainingMs = expiresAt !== void 0 ? expiresAt - now : void 0;
	return {
		status,
		expiresAt,
		remainingMs
	};
}
function mapProvider(prov, usageByProvider, expectsOAuthSet) {
	const usageKey = resolveUsageProviderId(prov.provider);
	const usage = usageKey ? usageByProvider.get(usageKey) : void 0;
	const rollup = aggregateOAuthStatus(prov, Date.now(), expectsOAuthSet.has(prov.provider));
	return {
		provider: prov.provider,
		displayName: providerDisplayName(prov.provider),
		status: rollup.status,
		expiry: buildExpiry(rollup.remainingMs, rollup.expiresAt),
		profiles: prov.profiles.map((prof) => ({
			profileId: prof.profileId,
			type: prof.type,
			status: prof.status,
			expiry: buildExpiry(prof.remainingMs, prof.expiresAt)
		})),
		usage: usage ? {
			windows: usage.windows,
			plan: usage.plan
		} : void 0
	};
}
/**
* Collect provider IDs with refreshable credentials (OAuth or bearer token)
* so a configured-but-not-logged-in provider surfaces as `missing` rather
* than being silently absent. API-key and AWS-SDK providers are excluded —
* their credentials don't expire on a schedule this endpoint can meaningfully
* monitor, and surfacing them here would flash a red alert on a healthy
* API-key setup.
*
* Providers with `models.providers.<id>.apiKey` set (commonly via a
* SecretRef env binding) are excluded from the "missing" synthesis even
* when their `auth` mode is `oauth` or `token` — an env-backed credential
* is already present, so flagging the dashboard as missing would cry wolf
* for a working auth path. They can still show up with real status if the
* profile store has an entry for them.
*/
function resolveConfiguredProviders(cfg) {
	const out = /* @__PURE__ */ new Set();
	const expectsOAuth = /* @__PURE__ */ new Set();
	const envBacked = /* @__PURE__ */ new Set();
	for (const [id, provider] of Object.entries(cfg.models?.providers ?? {})) {
		const apiKey = provider?.apiKey;
		if (!id || apiKey === void 0 || apiKey === null) continue;
		let resolvable = false;
		if (typeof apiKey === "string" && apiKey.length > 0) resolvable = true;
		else if (isSecretRef(apiKey)) if (apiKey.source === "env") {
			const envValue = process.env[apiKey.id];
			resolvable = typeof envValue === "string" && envValue.length > 0;
		} else resolvable = true;
		if (resolvable) envBacked.add(normalizeProviderId(id));
	}
	for (const [id, provider] of Object.entries(cfg.models?.providers ?? {})) {
		if (!id) continue;
		const mode = provider?.auth;
		if (mode !== "oauth" && mode !== "token") continue;
		if (envBacked.has(normalizeProviderId(id))) continue;
		out.add(id);
		if (mode === "oauth") expectsOAuth.add(normalizeProviderId(id));
	}
	for (const profile of Object.values(cfg.auth?.profiles ?? {})) {
		const provider = profile?.provider;
		const mode = profile?.mode;
		if (typeof provider !== "string" || provider.length === 0 || mode !== "oauth" && mode !== "token") continue;
		if (envBacked.has(normalizeProviderId(provider))) continue;
		out.add(provider);
		if (mode === "oauth") expectsOAuth.add(normalizeProviderId(provider));
	}
	return {
		providers: Array.from(out),
		expectsOAuth
	};
}
const modelsAuthStatusHandlers = { "models.authStatus": async ({ params, respond }) => {
	const now = Date.now();
	if (!Boolean(params?.refresh) && cached && now - cached.ts < CACHE_TTL_MS) {
		respond(true, cached.result, void 0, { cached: true });
		return;
	}
	try {
		const cfg = loadConfig();
		const agentDir = resolveOpenClawAgentDir();
		const store = ensureAuthProfileStore(agentDir);
		const configured = resolveConfiguredProviders(cfg);
		const authHealth = buildAuthHealthSummary({
			store,
			cfg,
			providers: configured.providers.length > 0 ? configured.providers : void 0
		});
		const usageProviderIds = [...new Set(authHealth.profiles.filter((p) => p.type === "oauth" || p.type === "token").map((p) => resolveUsageProviderId(p.provider)).filter((id) => Boolean(id)))];
		const usageByProvider = /* @__PURE__ */ new Map();
		if (usageProviderIds.length > 0) try {
			const usage = await loadProviderUsageSummary({
				providers: usageProviderIds,
				agentDir,
				timeoutMs: 3500
			});
			for (const snap of usage.providers) usageByProvider.set(snap.provider, {
				windows: snap.windows,
				plan: snap.plan
			});
		} catch (err) {
			log.debug(`usage enrichment failed (auth status still returned): providers=${usageProviderIds.join(",")} error=${formatForLog(err)}`);
		}
		const result = {
			ts: now,
			providers: authHealth.providers.map((prov) => mapProvider(prov, usageByProvider, configured.expectsOAuth))
		};
		cached = {
			ts: now,
			result
		};
		respond(true, result, void 0);
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
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
		const catalog = await context.loadGatewayModelCatalog();
		const { allowedCatalog } = buildAllowedModelSet({
			cfg: loadConfig(),
			catalog,
			defaultProvider: DEFAULT_PROVIDER
		});
		respond(true, { models: allowedCatalog.length > 0 ? allowedCatalog : catalog }, void 0);
	} catch (err) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
	}
} };
//#endregion
//#region src/gateway/server-methods/native-hook-relay.ts
const nativeHookRelayHandlers = { "nativeHook.invoke": async ({ params, respond }) => {
	try {
		respond(true, await invokeNativeHookRelay({
			provider: params.provider,
			relayId: params.relayId,
			event: params.event,
			rawPayload: params.rawPayload
		}));
	} catch (error) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, error instanceof Error ? error.message : "native hook relay failed"));
	}
} };
//#endregion
//#region src/gateway/node-pending-work.ts
const DEFAULT_STATUS_ITEM_ID = "baseline-status";
const DEFAULT_STATUS_PRIORITY = "default";
const DEFAULT_PRIORITY = "normal";
const DEFAULT_MAX_ITEMS = 4;
const MAX_ITEMS = 10;
const PRIORITY_RANK = {
	high: 3,
	normal: 2,
	default: 1
};
const stateByNodeId = /* @__PURE__ */ new Map();
function getOrCreateState(nodeId) {
	let state = stateByNodeId.get(nodeId);
	if (!state) {
		state = {
			revision: 0,
			itemsById: /* @__PURE__ */ new Map()
		};
		stateByNodeId.set(nodeId, state);
	}
	return state;
}
function pruneExpired(state, nowMs) {
	let changed = false;
	for (const [id, item] of state.itemsById) if (item.expiresAtMs !== null && item.expiresAtMs <= nowMs) {
		state.itemsById.delete(id);
		changed = true;
	}
	if (changed) state.revision += 1;
	return changed;
}
function pruneStateIfEmpty(nodeId, state) {
	if (state.itemsById.size === 0) stateByNodeId.delete(nodeId);
}
function sortedItems(state) {
	return [...state.itemsById.values()].toSorted((a, b) => {
		const priorityDelta = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
		if (priorityDelta !== 0) return priorityDelta;
		if (a.createdAtMs !== b.createdAtMs) return a.createdAtMs - b.createdAtMs;
		return a.id.localeCompare(b.id);
	});
}
function makeBaselineStatusItem(nowMs) {
	return {
		id: DEFAULT_STATUS_ITEM_ID,
		type: "status.request",
		priority: DEFAULT_STATUS_PRIORITY,
		createdAtMs: nowMs,
		expiresAtMs: null
	};
}
function enqueueNodePendingWork(params) {
	const nodeId = params.nodeId.trim();
	if (!nodeId) throw new Error("nodeId required");
	const nowMs = Date.now();
	const state = getOrCreateState(nodeId);
	pruneExpired(state, nowMs);
	const existing = [...state.itemsById.values()].find((item) => item.type === params.type);
	if (existing) return {
		revision: state.revision,
		item: existing,
		deduped: true
	};
	const item = {
		id: randomUUID(),
		type: params.type,
		priority: params.priority ?? DEFAULT_PRIORITY,
		createdAtMs: nowMs,
		expiresAtMs: typeof params.expiresInMs === "number" && Number.isFinite(params.expiresInMs) ? nowMs + Math.max(1e3, Math.trunc(params.expiresInMs)) : null,
		...params.payload ? { payload: params.payload } : {}
	};
	state.itemsById.set(item.id, item);
	state.revision += 1;
	return {
		revision: state.revision,
		item,
		deduped: false
	};
}
function drainNodePendingWork(nodeId, opts = {}) {
	const normalizedNodeId = nodeId.trim();
	if (!normalizedNodeId) return {
		revision: 0,
		items: [],
		hasMore: false
	};
	const nowMs = opts.nowMs ?? Date.now();
	const state = stateByNodeId.get(normalizedNodeId);
	const revision = state?.revision ?? 0;
	if (state) {
		pruneExpired(state, nowMs);
		pruneStateIfEmpty(normalizedNodeId, state);
	}
	const maxItems = Math.min(MAX_ITEMS, Math.max(1, Math.trunc(opts.maxItems ?? DEFAULT_MAX_ITEMS)));
	const explicitItems = state ? sortedItems(state) : [];
	const items = explicitItems.slice(0, maxItems);
	const hasExplicitStatus = explicitItems.some((item) => item.type === "status.request");
	const includeBaseline = opts.includeDefaultStatus !== false && !hasExplicitStatus;
	if (includeBaseline && items.length < maxItems) items.push(makeBaselineStatusItem(nowMs));
	const explicitReturnedCount = items.filter((item) => item.id !== DEFAULT_STATUS_ITEM_ID).length;
	const baselineIncluded = items.some((item) => item.id === DEFAULT_STATUS_ITEM_ID);
	return {
		revision,
		items,
		hasMore: explicitItems.length > explicitReturnedCount || includeBaseline && !baselineIncluded
	};
}
//#endregion
//#region src/gateway/canvas-capability.ts
const CANVAS_CAPABILITY_PATH_PREFIX = "/__openclaw__/cap";
const CANVAS_CAPABILITY_QUERY_PARAM = "oc_cap";
const CANVAS_CAPABILITY_TTL_MS = 10 * 6e4;
function normalizeCapability(raw) {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : void 0;
}
function mintCanvasCapabilityToken() {
	return randomBytes(18).toString("base64url");
}
function buildCanvasScopedHostUrl(baseUrl, capability) {
	const normalizedCapability = normalizeCapability(capability);
	if (!normalizedCapability) return;
	try {
		const url = new URL(baseUrl);
		url.pathname = `${url.pathname.replace(/\/+$/, "")}${`${CANVAS_CAPABILITY_PATH_PREFIX}/${encodeURIComponent(normalizedCapability)}`}`;
		url.search = "";
		url.hash = "";
		return url.toString().replace(/\/$/, "");
	} catch {
		return;
	}
}
function normalizeCanvasScopedUrl(rawUrl) {
	const url = new URL(rawUrl, "http://localhost");
	const prefix = `${CANVAS_CAPABILITY_PATH_PREFIX}/`;
	let scopedPath = false;
	let malformedScopedPath = false;
	let capabilityFromPath;
	let rewrittenUrl;
	if (url.pathname.startsWith(prefix)) {
		scopedPath = true;
		const remainder = url.pathname.slice(prefix.length);
		const slashIndex = remainder.indexOf("/");
		if (slashIndex <= 0) malformedScopedPath = true;
		else {
			const encodedCapability = remainder.slice(0, slashIndex);
			const canonicalPath = remainder.slice(slashIndex) || "/";
			let decoded;
			try {
				decoded = decodeURIComponent(encodedCapability);
			} catch {
				malformedScopedPath = true;
			}
			capabilityFromPath = normalizeCapability(decoded);
			if (!capabilityFromPath || !canonicalPath.startsWith("/")) malformedScopedPath = true;
			else {
				url.pathname = canonicalPath;
				if (!url.searchParams.has("oc_cap")) url.searchParams.set(CANVAS_CAPABILITY_QUERY_PARAM, capabilityFromPath);
				rewrittenUrl = `${url.pathname}${url.search}`;
			}
		}
	}
	const capability = capabilityFromPath ?? normalizeCapability(url.searchParams.get("oc_cap"));
	return {
		pathname: url.pathname,
		capability,
		rewrittenUrl,
		scopedPath,
		malformedScopedPath
	};
}
//#endregion
//#region src/gateway/node-catalog.ts
function uniqueSortedStrings(...items) {
	const values = /* @__PURE__ */ new Set();
	for (const item of items) {
		if (!item) continue;
		for (const value of item) {
			const trimmed = value.trim();
			if (trimmed) values.add(trimmed);
		}
	}
	return [...values].toSorted((left, right) => left.localeCompare(right));
}
function buildDevicePairingSource(entry) {
	return {
		nodeId: entry.deviceId,
		displayName: entry.displayName,
		platform: entry.platform,
		clientId: entry.clientId,
		clientMode: entry.clientMode,
		remoteIp: entry.remoteIp,
		approvedAtMs: entry.approvedAtMs
	};
}
function buildApprovedNodeSource(entry) {
	return {
		nodeId: entry.nodeId,
		displayName: entry.displayName,
		platform: entry.platform,
		version: entry.version,
		coreVersion: entry.coreVersion,
		uiVersion: entry.uiVersion,
		remoteIp: entry.remoteIp,
		deviceFamily: entry.deviceFamily,
		modelIdentifier: entry.modelIdentifier,
		caps: entry.caps ?? [],
		commands: entry.commands ?? [],
		permissions: entry.permissions,
		approvedAtMs: entry.approvedAtMs
	};
}
function buildEffectiveKnownNode(entry) {
	const { nodeId, devicePairing, nodePairing, live } = entry;
	return {
		nodeId,
		displayName: live?.displayName ?? nodePairing?.displayName ?? devicePairing?.displayName,
		platform: live?.platform ?? nodePairing?.platform ?? devicePairing?.platform,
		version: live?.version ?? nodePairing?.version,
		coreVersion: live?.coreVersion ?? nodePairing?.coreVersion,
		uiVersion: live?.uiVersion ?? nodePairing?.uiVersion,
		clientId: live?.clientId ?? devicePairing?.clientId,
		clientMode: live?.clientMode ?? devicePairing?.clientMode,
		deviceFamily: live?.deviceFamily ?? nodePairing?.deviceFamily,
		modelIdentifier: live?.modelIdentifier ?? nodePairing?.modelIdentifier,
		remoteIp: live?.remoteIp ?? nodePairing?.remoteIp ?? devicePairing?.remoteIp,
		caps: live ? uniqueSortedStrings(live.caps) : uniqueSortedStrings(nodePairing?.caps),
		commands: live ? uniqueSortedStrings(live.commands) : uniqueSortedStrings(nodePairing?.commands),
		pathEnv: live?.pathEnv,
		permissions: live?.permissions ?? nodePairing?.permissions,
		connectedAtMs: live?.connectedAtMs,
		approvedAtMs: nodePairing?.approvedAtMs ?? devicePairing?.approvedAtMs,
		paired: Boolean(devicePairing ?? nodePairing),
		connected: Boolean(live)
	};
}
function compareKnownNodes(left, right) {
	if (left.connected !== right.connected) return left.connected ? -1 : 1;
	const leftName = normalizeLowercaseStringOrEmpty(left.displayName ?? left.nodeId);
	const rightName = normalizeLowercaseStringOrEmpty(right.displayName ?? right.nodeId);
	if (leftName < rightName) return -1;
	if (leftName > rightName) return 1;
	return left.nodeId.localeCompare(right.nodeId);
}
function createKnownNodeCatalog(params) {
	const devicePairingById = new Map(params.pairedDevices.filter((entry) => hasEffectivePairedDeviceRole(entry, "node")).map((entry) => [entry.deviceId, buildDevicePairingSource(entry)]));
	const nodePairingById = new Map((params.pairedNodes ?? []).map((entry) => [entry.nodeId, buildApprovedNodeSource(entry)]));
	const liveById = new Map(params.connectedNodes.map((entry) => [entry.nodeId, entry]));
	const nodeIds = new Set([
		...devicePairingById.keys(),
		...nodePairingById.keys(),
		...liveById.keys()
	]);
	const entriesById = /* @__PURE__ */ new Map();
	for (const nodeId of nodeIds) {
		const devicePairing = devicePairingById.get(nodeId);
		const nodePairing = nodePairingById.get(nodeId);
		const live = liveById.get(nodeId);
		entriesById.set(nodeId, {
			nodeId,
			devicePairing,
			nodePairing,
			live,
			effective: buildEffectiveKnownNode({
				nodeId,
				devicePairing,
				nodePairing,
				live
			})
		});
	}
	return { entriesById };
}
function listKnownNodes(catalog) {
	return [...catalog.entriesById.values()].map((entry) => entry.effective).toSorted(compareKnownNodes);
}
function getKnownNodeEntry(catalog, nodeId) {
	return catalog.entriesById.get(nodeId) ?? null;
}
function getKnownNode(catalog, nodeId) {
	return getKnownNodeEntry(catalog, nodeId)?.effective ?? null;
}
//#endregion
//#region src/gateway/node-invoke-system-run-approval-errors.ts
function systemRunApprovalGuardError(params) {
	const details = params.details ? { ...params.details } : {};
	return {
		ok: false,
		message: params.message,
		details: {
			code: params.code,
			...details
		}
	};
}
function systemRunApprovalRequired(runId) {
	return systemRunApprovalGuardError({
		code: "APPROVAL_REQUIRED",
		message: "approval required",
		details: { runId }
	});
}
//#endregion
//#region src/gateway/node-invoke-system-run-approval-match.ts
function requestMismatch() {
	return {
		ok: false,
		code: "APPROVAL_REQUEST_MISMATCH",
		message: "approval id does not match request"
	};
}
function evaluateSystemRunApprovalMatch(params) {
	if (params.request.host !== "node") return requestMismatch();
	const actualBinding = buildSystemRunApprovalBinding({
		argv: params.argv,
		cwd: params.binding.cwd,
		agentId: params.binding.agentId,
		sessionKey: params.binding.sessionKey,
		env: params.binding.env
	});
	const expectedBinding = params.request.systemRunBinding;
	if (!expectedBinding) return missingSystemRunApprovalBinding({ actualEnvKeys: actualBinding.envKeys });
	return matchSystemRunApprovalBinding({
		expected: expectedBinding,
		actual: actualBinding.binding,
		actualEnvKeys: actualBinding.envKeys
	});
}
//#endregion
//#region src/gateway/node-invoke-system-run-approval.ts
function normalizeApprovalDecision(value) {
	const s = normalizeNullableString(value);
	return s === "allow-once" || s === "allow-always" ? s : null;
}
function clientHasApprovals(client) {
	const scopes = Array.isArray(client?.connect?.scopes) ? client?.connect?.scopes : [];
	return scopes.includes("operator.admin") || scopes.includes("operator.approvals");
}
function pickSystemRunParams(raw) {
	const next = {};
	for (const key of [
		"command",
		"rawCommand",
		"systemRunPlan",
		"cwd",
		"env",
		"timeoutMs",
		"needsScreenRecording",
		"agentId",
		"sessionKey",
		"runId",
		"suppressNotifyOnExit"
	]) if (key in raw) next[key] = raw[key];
	return next;
}
/**
* Gate `system.run` approval flags (`approved`, `approvalDecision`) behind a real
* `exec.approval.*` record. This prevents users with only `operator.write` from
* bypassing node-host approvals by injecting control fields into `node.invoke`.
*/
function sanitizeSystemRunParamsForForwarding(opts) {
	const obj = asNullableRecord(opts.rawParams);
	if (!obj) return {
		ok: true,
		params: opts.rawParams
	};
	const p = obj;
	const approved = p.approved === true;
	const requestedDecision = normalizeApprovalDecision(p.approvalDecision);
	const wantsApprovalOverride = approved || requestedDecision !== null;
	const next = pickSystemRunParams(obj);
	if (!wantsApprovalOverride) {
		const cmdTextResolution = resolveSystemRunCommandRequest({
			command: p.command,
			rawCommand: p.rawCommand
		});
		if (!cmdTextResolution.ok) return {
			ok: false,
			message: cmdTextResolution.message,
			details: cmdTextResolution.details
		};
		return {
			ok: true,
			params: next
		};
	}
	const runId = normalizeNullableString(p.runId);
	if (!runId) return systemRunApprovalGuardError({
		code: "MISSING_RUN_ID",
		message: "approval override requires params.runId"
	});
	const manager = opts.execApprovalManager;
	if (!manager) return systemRunApprovalGuardError({
		code: "APPROVALS_UNAVAILABLE",
		message: "exec approvals unavailable"
	});
	const snapshot = manager.getSnapshot(runId);
	if (!snapshot) return systemRunApprovalGuardError({
		code: "UNKNOWN_APPROVAL_ID",
		message: "unknown or expired approval id",
		details: { runId }
	});
	if ((typeof opts.nowMs === "number" ? opts.nowMs : Date.now()) > snapshot.expiresAtMs) return systemRunApprovalGuardError({
		code: "APPROVAL_EXPIRED",
		message: "approval expired",
		details: { runId }
	});
	const targetNodeId = normalizeNullableString(opts.nodeId);
	if (!targetNodeId) return systemRunApprovalGuardError({
		code: "MISSING_NODE_ID",
		message: "node.invoke requires nodeId",
		details: { runId }
	});
	const approvalNodeId = normalizeNullableString(snapshot.request.nodeId);
	if (!approvalNodeId) return systemRunApprovalGuardError({
		code: "APPROVAL_NODE_BINDING_MISSING",
		message: "approval id missing node binding",
		details: { runId }
	});
	if (approvalNodeId !== targetNodeId) return systemRunApprovalGuardError({
		code: "APPROVAL_NODE_MISMATCH",
		message: "approval id not valid for this node",
		details: { runId }
	});
	const snapshotDeviceId = snapshot.requestedByDeviceId ?? null;
	const clientDeviceId = opts.client?.connect?.device?.id ?? null;
	if (snapshotDeviceId) {
		if (snapshotDeviceId !== clientDeviceId) return systemRunApprovalGuardError({
			code: "APPROVAL_DEVICE_MISMATCH",
			message: "approval id not valid for this device",
			details: { runId }
		});
	} else if (snapshot.requestedByConnId && snapshot.requestedByConnId !== (opts.client?.connId ?? null)) return systemRunApprovalGuardError({
		code: "APPROVAL_CLIENT_MISMATCH",
		message: "approval id not valid for this client",
		details: { runId }
	});
	const runtimeContext = resolveSystemRunApprovalRuntimeContext({
		plan: snapshot.request.systemRunPlan ?? null,
		command: p.command,
		rawCommand: p.rawCommand,
		cwd: p.cwd,
		agentId: p.agentId,
		sessionKey: p.sessionKey
	});
	if (!runtimeContext.ok) return {
		ok: false,
		message: runtimeContext.message,
		details: runtimeContext.details
	};
	if (runtimeContext.plan) {
		next.command = [...runtimeContext.plan.argv];
		next.systemRunPlan = runtimeContext.plan;
		if (runtimeContext.commandText) next.rawCommand = runtimeContext.commandText;
		else delete next.rawCommand;
		if (runtimeContext.cwd) next.cwd = runtimeContext.cwd;
		else delete next.cwd;
		if (runtimeContext.agentId) next.agentId = runtimeContext.agentId;
		else delete next.agentId;
		if (runtimeContext.sessionKey) next.sessionKey = runtimeContext.sessionKey;
		else delete next.sessionKey;
	}
	const approvalMatch = evaluateSystemRunApprovalMatch({
		argv: runtimeContext.argv,
		request: snapshot.request,
		binding: {
			cwd: runtimeContext.cwd,
			agentId: runtimeContext.agentId,
			sessionKey: runtimeContext.sessionKey,
			env: p.env
		}
	});
	if (!approvalMatch.ok) return toSystemRunApprovalMismatchError({
		runId,
		match: approvalMatch
	});
	if (snapshot.decision === "allow-once") {
		if (typeof manager.consumeAllowOnce !== "function" || !manager.consumeAllowOnce(runId)) return systemRunApprovalRequired(runId);
		next.approved = true;
		next.approvalDecision = "allow-once";
		return {
			ok: true,
			params: next
		};
	}
	if (snapshot.decision === "allow-always") {
		next.approved = true;
		next.approvalDecision = "allow-always";
		return {
			ok: true,
			params: next
		};
	}
	if (snapshot.resolvedAtMs !== void 0 && snapshot.decision === void 0 && snapshot.resolvedBy === null && approved && requestedDecision === "allow-once" && clientHasApprovals(opts.client)) {
		next.approved = true;
		next.approvalDecision = "allow-once";
		return {
			ok: true,
			params: next
		};
	}
	return systemRunApprovalRequired(runId);
}
//#endregion
//#region src/gateway/node-invoke-sanitize.ts
function sanitizeNodeInvokeParamsForForwarding(opts) {
	if (opts.command === "system.run") return sanitizeSystemRunParamsForForwarding({
		nodeId: opts.nodeId,
		rawParams: opts.rawParams,
		client: opts.client,
		execApprovalManager: opts.execApprovalManager
	});
	return {
		ok: true,
		params: opts.rawParams
	};
}
//#endregion
//#region src/gateway/server-methods/nodes.handlers.invoke-result.ts
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
const handleNodeInvokeResult = async ({ params, respond, context, client }) => {
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
};
//#endregion
//#region src/gateway/server-methods/nodes.ts
const NODE_WAKE_RECONNECT_WAIT_MS = 3e3;
const NODE_WAKE_RECONNECT_RETRY_WAIT_MS = 12e3;
const NODE_WAKE_THROTTLE_MS = 15e3;
const NODE_WAKE_NUDGE_THROTTLE_MS = 10 * 6e4;
const NODE_PENDING_ACTION_TTL_MS = 10 * 6e4;
const NODE_PENDING_ACTION_MAX_PER_NODE = 64;
const nodeWakeById = /* @__PURE__ */ new Map();
const nodeWakeNudgeById = /* @__PURE__ */ new Map();
const pendingNodeActionsById = /* @__PURE__ */ new Map();
function normalizeBrowserProxyPath(value) {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	if (withLeadingSlash.length <= 1) return withLeadingSlash;
	return withLeadingSlash.replace(/\/+$/, "");
}
function isPersistentBrowserProxyMutation(method, path) {
	const normalizedPath = normalizeBrowserProxyPath(path);
	if (method === "POST" && (normalizedPath === "/profiles/create" || normalizedPath === "/reset-profile")) return true;
	return method === "DELETE" && /^\/profiles\/[^/]+$/.test(normalizedPath);
}
function isForbiddenBrowserProxyMutation(params) {
	if (!params || typeof params !== "object") return false;
	const candidate = params;
	const method = (normalizeOptionalString(candidate.method) ?? "").toUpperCase();
	const path = normalizeOptionalString(candidate.path) ?? "";
	return Boolean(method && path && isPersistentBrowserProxyMutation(method, path));
}
async function resolveDirectNodePushConfig() {
	const auth = await resolveApnsAuthConfigFromEnv(process.env);
	return auth.ok ? {
		ok: true,
		auth: auth.value
	} : {
		ok: false,
		error: auth.error
	};
}
function resolveRelayNodePushConfig() {
	const relay = resolveApnsRelayConfigFromEnv(process.env, loadConfig().gateway);
	return relay.ok ? {
		ok: true,
		relayConfig: relay.value
	} : {
		ok: false,
		error: relay.error
	};
}
async function clearStaleApnsRegistrationIfNeeded(registration, nodeId, params) {
	if (!shouldClearStoredApnsRegistration({
		registration,
		result: params
	})) return;
	await clearApnsRegistrationIfCurrent({
		nodeId,
		registration
	});
}
async function delayMs(ms) {
	await new Promise((resolve) => setTimeout(resolve, ms));
}
function isForegroundRestrictedIosCommand(command) {
	return command === "canvas.present" || command === "canvas.navigate" || command.startsWith("canvas.") || command.startsWith("camera.") || command.startsWith("screen.") || command.startsWith("talk.");
}
function shouldQueueAsPendingForegroundAction(params) {
	const platform = normalizeLowercaseStringOrEmpty(params.platform);
	if (!platform.startsWith("ios") && !platform.startsWith("ipados")) return false;
	if (!isForegroundRestrictedIosCommand(params.command)) return false;
	const error = params.error && typeof params.error === "object" ? params.error : null;
	const code = normalizeOptionalString(error?.code)?.toUpperCase() ?? "";
	const message = normalizeOptionalString(error?.message)?.toUpperCase() ?? "";
	return code === "NODE_BACKGROUND_UNAVAILABLE" || message.includes("BACKGROUND_UNAVAILABLE");
}
function prunePendingNodeActions(nodeId, nowMs) {
	const queue = pendingNodeActionsById.get(nodeId) ?? [];
	const minTimestampMs = nowMs - NODE_PENDING_ACTION_TTL_MS;
	const live = queue.filter((entry) => entry.enqueuedAtMs >= minTimestampMs);
	if (live.length === 0) {
		pendingNodeActionsById.delete(nodeId);
		return [];
	}
	pendingNodeActionsById.set(nodeId, live);
	return live;
}
function enqueuePendingNodeAction(params) {
	const nowMs = Date.now();
	const queue = prunePendingNodeActions(params.nodeId, nowMs);
	const existing = queue.find((entry) => entry.idempotencyKey === params.idempotencyKey);
	if (existing) return existing;
	const entry = {
		id: randomUUID(),
		nodeId: params.nodeId,
		command: params.command,
		paramsJSON: params.paramsJSON,
		idempotencyKey: params.idempotencyKey,
		enqueuedAtMs: nowMs
	};
	queue.push(entry);
	if (queue.length > NODE_PENDING_ACTION_MAX_PER_NODE) queue.splice(0, queue.length - NODE_PENDING_ACTION_MAX_PER_NODE);
	pendingNodeActionsById.set(params.nodeId, queue);
	return entry;
}
function listPendingNodeActions(nodeId) {
	return prunePendingNodeActions(nodeId, Date.now());
}
function resolveAllowedPendingNodeActions(params) {
	const pending = listPendingNodeActions(params.nodeId);
	if (pending.length === 0) return pending;
	const connect = params.client?.connect;
	const declaredCommands = Array.isArray(connect?.commands) ? connect.commands : [];
	const allowlist = resolveNodeCommandAllowlist(loadConfig(), {
		platform: connect?.client?.platform,
		deviceFamily: connect?.client?.deviceFamily
	});
	const allowed = pending.filter((entry) => {
		return isNodeCommandAllowed({
			command: entry.command,
			declaredCommands,
			allowlist
		}).ok;
	});
	if (allowed.length !== pending.length) if (allowed.length === 0) pendingNodeActionsById.delete(params.nodeId);
	else pendingNodeActionsById.set(params.nodeId, allowed);
	return allowed;
}
function ackPendingNodeActions(nodeId, ids) {
	if (ids.length === 0) return listPendingNodeActions(nodeId);
	const pending = prunePendingNodeActions(nodeId, Date.now());
	const idSet = new Set(ids);
	const remaining = pending.filter((entry) => !idSet.has(entry.id));
	if (remaining.length === 0) {
		pendingNodeActionsById.delete(nodeId);
		return [];
	}
	pendingNodeActionsById.set(nodeId, remaining);
	return remaining;
}
function toPendingParamsJSON(params) {
	if (params === void 0) return;
	try {
		return JSON.stringify(params);
	} catch {
		return;
	}
}
async function maybeWakeNodeWithApns(nodeId, opts) {
	const state = nodeWakeById.get(nodeId) ?? { lastWakeAtMs: 0 };
	nodeWakeById.set(nodeId, state);
	if (state.inFlight) return await state.inFlight;
	const now = Date.now();
	if (!(opts?.force === true) && state.lastWakeAtMs > 0 && now - state.lastWakeAtMs < NODE_WAKE_THROTTLE_MS) return {
		available: true,
		throttled: true,
		path: "throttled",
		durationMs: 0
	};
	state.inFlight = (async () => {
		const startedAtMs = Date.now();
		const withDuration = (attempt) => ({
			...attempt,
			durationMs: Math.max(0, Date.now() - startedAtMs)
		});
		try {
			const registration = await loadApnsRegistration(nodeId);
			if (!registration) return withDuration({
				available: false,
				throttled: false,
				path: "no-registration"
			});
			let wakeResult;
			if (registration.transport === "relay") {
				const relay = resolveRelayNodePushConfig();
				if (!relay.ok) return withDuration({
					available: false,
					throttled: false,
					path: "no-auth",
					apnsReason: relay.error
				});
				state.lastWakeAtMs = Date.now();
				wakeResult = await sendApnsBackgroundWake({
					registration,
					nodeId,
					wakeReason: opts?.wakeReason ?? "node.invoke",
					relayConfig: relay.relayConfig
				});
			} else {
				const auth = await resolveDirectNodePushConfig();
				if (!auth.ok) return withDuration({
					available: false,
					throttled: false,
					path: "no-auth",
					apnsReason: auth.error
				});
				state.lastWakeAtMs = Date.now();
				wakeResult = await sendApnsBackgroundWake({
					registration,
					nodeId,
					wakeReason: opts?.wakeReason ?? "node.invoke",
					auth: auth.auth
				});
			}
			await clearStaleApnsRegistrationIfNeeded(registration, nodeId, wakeResult);
			if (!wakeResult.ok) return withDuration({
				available: true,
				throttled: false,
				path: "send-error",
				apnsStatus: wakeResult.status,
				apnsReason: wakeResult.reason
			});
			return withDuration({
				available: true,
				throttled: false,
				path: "sent",
				apnsStatus: wakeResult.status,
				apnsReason: wakeResult.reason
			});
		} catch (err) {
			const message = formatErrorMessage(err);
			if (state.lastWakeAtMs === 0) return withDuration({
				available: false,
				throttled: false,
				path: "send-error",
				apnsReason: message
			});
			return withDuration({
				available: true,
				throttled: false,
				path: "send-error",
				apnsReason: message
			});
		}
	})();
	try {
		return await state.inFlight;
	} finally {
		state.inFlight = void 0;
	}
}
async function maybeSendNodeWakeNudge(nodeId) {
	const startedAtMs = Date.now();
	const withDuration = (attempt) => ({
		...attempt,
		durationMs: Math.max(0, Date.now() - startedAtMs)
	});
	const lastNudgeAtMs = nodeWakeNudgeById.get(nodeId) ?? 0;
	if (lastNudgeAtMs > 0 && Date.now() - lastNudgeAtMs < NODE_WAKE_NUDGE_THROTTLE_MS) return withDuration({
		sent: false,
		throttled: true,
		reason: "throttled"
	});
	const registration = await loadApnsRegistration(nodeId);
	if (!registration) return withDuration({
		sent: false,
		throttled: false,
		reason: "no-registration"
	});
	try {
		let result;
		if (registration.transport === "relay") {
			const relay = resolveRelayNodePushConfig();
			if (!relay.ok) return withDuration({
				sent: false,
				throttled: false,
				reason: "no-auth",
				apnsReason: relay.error
			});
			result = await sendApnsAlert({
				registration,
				nodeId,
				title: "OpenClaw needs a quick reopen",
				body: "Tap to reopen OpenClaw and restore the node connection.",
				relayConfig: relay.relayConfig
			});
		} else {
			const auth = await resolveDirectNodePushConfig();
			if (!auth.ok) return withDuration({
				sent: false,
				throttled: false,
				reason: "no-auth",
				apnsReason: auth.error
			});
			result = await sendApnsAlert({
				registration,
				nodeId,
				title: "OpenClaw needs a quick reopen",
				body: "Tap to reopen OpenClaw and restore the node connection.",
				auth: auth.auth
			});
		}
		await clearStaleApnsRegistrationIfNeeded(registration, nodeId, result);
		if (!result.ok) return withDuration({
			sent: false,
			throttled: false,
			reason: "apns-not-ok",
			apnsStatus: result.status,
			apnsReason: result.reason
		});
		nodeWakeNudgeById.set(nodeId, Date.now());
		return withDuration({
			sent: true,
			throttled: false,
			reason: "sent",
			apnsStatus: result.status,
			apnsReason: result.reason
		});
	} catch (err) {
		return withDuration({
			sent: false,
			throttled: false,
			reason: "send-error",
			apnsReason: formatErrorMessage(err)
		});
	}
}
async function waitForNodeReconnect(params) {
	const timeoutMs = Math.max(250, params.timeoutMs ?? 3e3);
	const pollMs = Math.max(50, params.pollMs ?? 150);
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (params.context.nodeRegistry.get(params.nodeId)) return true;
		await delayMs(pollMs);
	}
	return Boolean(params.context.nodeRegistry.get(params.nodeId));
}
/**
* Remove cached wake/nudge state for a node that has disconnected.
* Called from the WS close handler to prevent unbounded growth.
*/
function clearNodeWakeState(nodeId) {
	nodeWakeById.delete(nodeId);
	nodeWakeNudgeById.delete(nodeId);
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
				permissions: p.permissions,
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
	"node.pair.approve": async ({ params, respond, context, client }) => {
		if (!validateNodePairApproveParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pair.approve",
				validator: validateNodePairApproveParams
			});
			return;
		}
		const { requestId } = params;
		const callerScopes = Array.isArray(client?.connect?.scopes) ? client.connect.scopes : [];
		await respondUnavailableOnThrow(respond, async () => {
			const approved = await approveNodePairing(requestId, { callerScopes });
			if (!approved) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown requestId"));
				return;
			}
			if ("status" in approved && approved.status === "forbidden") {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `missing scope: ${approved.missingScope}`));
				return;
			}
			if (!("node" in approved)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown requestId"));
				return;
			}
			const approvedNode = approved.node;
			context.broadcast("node.pair.resolved", {
				requestId,
				nodeId: approvedNode.nodeId,
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
			const [devicePairing, nodePairing] = await Promise.all([listDevicePairing(), listNodePairing()]);
			const nodes = listKnownNodes(createKnownNodeCatalog({
				pairedDevices: devicePairing.paired,
				pairedNodes: nodePairing.paired,
				connectedNodes: context.nodeRegistry.listConnected()
			}));
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
		const id = normalizeOptionalString(nodeId) ?? "";
		if (!id) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			const [devicePairing, nodePairing] = await Promise.all([listDevicePairing(), listNodePairing()]);
			const node = getKnownNode(createKnownNodeCatalog({
				pairedDevices: devicePairing.paired,
				pairedNodes: nodePairing.paired,
				connectedNodes: context.nodeRegistry.listConnected()
			}), id);
			if (!node) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "unknown nodeId"));
				return;
			}
			respond(true, {
				ts: Date.now(),
				...node
			}, void 0);
		});
	},
	"node.canvas.capability.refresh": async ({ params, respond, client }) => {
		if (!validateNodeListParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.canvas.capability.refresh",
				validator: validateNodeListParams
			});
			return;
		}
		const baseCanvasHostUrl = normalizeOptionalString(client?.canvasHostUrl) ?? "";
		if (!baseCanvasHostUrl) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "canvas host unavailable for this node session"));
			return;
		}
		const canvasCapability = mintCanvasCapabilityToken();
		const canvasCapabilityExpiresAtMs = Date.now() + CANVAS_CAPABILITY_TTL_MS;
		const scopedCanvasHostUrl = buildCanvasScopedHostUrl(baseCanvasHostUrl, canvasCapability);
		if (!scopedCanvasHostUrl) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "failed to mint scoped canvas host URL"));
			return;
		}
		if (client) {
			client.canvasCapability = canvasCapability;
			client.canvasCapabilityExpiresAtMs = canvasCapabilityExpiresAtMs;
		}
		respond(true, {
			canvasCapability,
			canvasCapabilityExpiresAtMs,
			canvasHostUrl: scopedCanvasHostUrl
		}, void 0);
	},
	"node.pending.pull": async ({ params, respond, client }) => {
		if (!validateNodeListParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pending.pull",
				validator: validateNodeListParams
			});
			return;
		}
		const trimmedNodeId = normalizeOptionalString(client?.connect?.device?.id ?? client?.connect?.client?.id) ?? "";
		if (!trimmedNodeId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
			return;
		}
		respond(true, {
			nodeId: trimmedNodeId,
			actions: resolveAllowedPendingNodeActions({
				nodeId: trimmedNodeId,
				client
			}).map((entry) => ({
				id: entry.id,
				command: entry.command,
				paramsJSON: entry.paramsJSON ?? null,
				enqueuedAtMs: entry.enqueuedAtMs
			}))
		}, void 0);
	},
	"node.pending.ack": async ({ params, respond, client }) => {
		if (!validateNodePendingAckParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pending.ack",
				validator: validateNodePendingAckParams
			});
			return;
		}
		const trimmedNodeId = normalizeOptionalString(client?.connect?.device?.id ?? client?.connect?.client?.id) ?? "";
		if (!trimmedNodeId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
			return;
		}
		const ackIds = Array.from(new Set((params.ids ?? []).map((value) => normalizeOptionalString(value) ?? "").filter(Boolean)));
		respond(true, {
			nodeId: trimmedNodeId,
			ackedIds: ackIds,
			remainingCount: ackPendingNodeActions(trimmedNodeId, ackIds).length
		}, void 0);
	},
	"node.invoke": async ({ params, respond, context, client, req }) => {
		if (!validateNodeInvokeParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.invoke",
				validator: validateNodeInvokeParams
			});
			return;
		}
		const p = params;
		const nodeId = normalizeOptionalString(p.nodeId) ?? "";
		const command = normalizeOptionalString(p.command) ?? "";
		if (!nodeId || !command) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId and command required"));
			return;
		}
		if (command === "system.execApprovals.get" || command === "system.execApprovals.set") {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "node.invoke does not allow system.execApprovals.*; use exec.approvals.node.*", { details: { command } }));
			return;
		}
		if (command === "browser.proxy" && isForbiddenBrowserProxyMutation(p.params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "node.invoke cannot mutate persistent browser profiles via browser.proxy", { details: { command } }));
			return;
		}
		await respondUnavailableOnThrow(respond, async () => {
			let nodeSession = context.nodeRegistry.get(nodeId);
			if (!nodeSession) {
				const wakeReqId = req.id;
				const wakeFlowStartedAtMs = Date.now();
				context.logGateway.info(`node wake start node=${nodeId} req=${wakeReqId} command=${command}`);
				const wake = await maybeWakeNodeWithApns(nodeId);
				context.logGateway.info(`node wake stage=wake1 node=${nodeId} req=${wakeReqId} available=${wake.available} throttled=${wake.throttled} path=${wake.path} durationMs=${wake.durationMs} apnsStatus=${wake.apnsStatus ?? -1} apnsReason=${wake.apnsReason ?? "-"}`);
				if (wake.available) {
					const waitStartedAtMs = Date.now();
					const waitTimeoutMs = NODE_WAKE_RECONNECT_WAIT_MS;
					const reconnected = await waitForNodeReconnect({
						nodeId,
						context,
						timeoutMs: waitTimeoutMs
					});
					const waitDurationMs = Math.max(0, Date.now() - waitStartedAtMs);
					context.logGateway.info(`node wake stage=wait1 node=${nodeId} req=${wakeReqId} reconnected=${reconnected} timeoutMs=${waitTimeoutMs} durationMs=${waitDurationMs}`);
				}
				nodeSession = context.nodeRegistry.get(nodeId);
				if (!nodeSession && wake.available) {
					const retryWake = await maybeWakeNodeWithApns(nodeId, { force: true });
					context.logGateway.info(`node wake stage=wake2 node=${nodeId} req=${wakeReqId} force=true available=${retryWake.available} throttled=${retryWake.throttled} path=${retryWake.path} durationMs=${retryWake.durationMs} apnsStatus=${retryWake.apnsStatus ?? -1} apnsReason=${retryWake.apnsReason ?? "-"}`);
					if (retryWake.available) {
						const waitStartedAtMs = Date.now();
						const waitTimeoutMs = NODE_WAKE_RECONNECT_RETRY_WAIT_MS;
						const reconnected = await waitForNodeReconnect({
							nodeId,
							context,
							timeoutMs: waitTimeoutMs
						});
						const waitDurationMs = Math.max(0, Date.now() - waitStartedAtMs);
						context.logGateway.info(`node wake stage=wait2 node=${nodeId} req=${wakeReqId} reconnected=${reconnected} timeoutMs=${waitTimeoutMs} durationMs=${waitDurationMs}`);
					}
					nodeSession = context.nodeRegistry.get(nodeId);
				}
				if (!nodeSession) {
					const totalDurationMs = Math.max(0, Date.now() - wakeFlowStartedAtMs);
					const nudge = await maybeSendNodeWakeNudge(nodeId);
					context.logGateway.info(`node wake nudge node=${nodeId} req=${wakeReqId} sent=${nudge.sent} throttled=${nudge.throttled} reason=${nudge.reason} durationMs=${nudge.durationMs} apnsStatus=${nudge.apnsStatus ?? -1} apnsReason=${nudge.apnsReason ?? "-"}`);
					context.logGateway.warn(`node wake done node=${nodeId} req=${wakeReqId} connected=false reason=not_connected totalMs=${totalDurationMs}`);
					respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "node not connected", { details: { code: "NOT_CONNECTED" } }));
					return;
				}
				const totalDurationMs = Math.max(0, Date.now() - wakeFlowStartedAtMs);
				context.logGateway.info(`node wake done node=${nodeId} req=${wakeReqId} connected=true totalMs=${totalDurationMs}`);
			}
			const allowlist = resolveNodeCommandAllowlist(loadConfig(), nodeSession);
			const allowed = isNodeCommandAllowed({
				command,
				declaredCommands: nodeSession.commands,
				allowlist
			});
			if (!allowed.ok) {
				const hint = buildNodeCommandRejectionHint(allowed.reason, command, nodeSession);
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, hint, { details: {
					reason: allowed.reason,
					command
				} }));
				return;
			}
			const forwardedParams = sanitizeNodeInvokeParamsForForwarding({
				nodeId,
				command,
				rawParams: p.params,
				client,
				execApprovalManager: context.execApprovalManager
			});
			if (!forwardedParams.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, forwardedParams.message, { details: forwardedParams.details ?? null }));
				return;
			}
			const res = await context.nodeRegistry.invoke({
				nodeId,
				command,
				params: forwardedParams.params,
				timeoutMs: p.timeoutMs,
				idempotencyKey: p.idempotencyKey
			});
			if (!res.ok) {
				if (shouldQueueAsPendingForegroundAction({
					platform: nodeSession.platform,
					command,
					error: res.error
				})) {
					const queued = enqueuePendingNodeAction({
						nodeId,
						command,
						paramsJSON: toPendingParamsJSON(forwardedParams.params),
						idempotencyKey: p.idempotencyKey
					});
					const wake = await maybeWakeNodeWithApns(nodeId);
					context.logGateway.info(`node pending queued node=${nodeId} req=${req.id} command=${command} queuedId=${queued.id} wakePath=${wake.path} wakeAvailable=${wake.available}`);
					respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "node command queued until iOS returns to foreground", {
						retryable: true,
						details: {
							code: "QUEUED_UNTIL_FOREGROUND",
							queuedActionId: queued.id,
							nodeId,
							command,
							wake: {
								path: wake.path,
								available: wake.available,
								throttled: wake.throttled,
								apnsStatus: wake.apnsStatus,
								apnsReason: wake.apnsReason
							},
							nodeError: res.error ?? null
						}
					}));
					return;
				}
				if (!respondUnavailableOnNodeInvokeError(respond, res)) return;
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
	"node.invoke.result": handleNodeInvokeResult,
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
			const { handleNodeEvent } = await import("./server-node-events-D_cEK_yE.js");
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
function buildNodeCommandRejectionHint(reason, command, node) {
	const platform = node?.platform ?? "unknown";
	if (reason === "command not declared by node") return `node command not allowed: the node (platform: ${platform}) does not support "${command}"`;
	if (reason === "command not allowlisted") return `node command not allowed: "${command}" is not in the allowlist for platform "${platform}"`;
	if (reason === "node did not declare commands") return `node command not allowed: the node did not declare any supported commands`;
	return `node command not allowed: ${reason}`;
}
//#endregion
//#region src/gateway/server-methods/nodes-pending.ts
function resolveClientNodeId(client) {
	const trimmed = (client?.connect?.device?.id ?? client?.connect?.client?.id ?? "").trim();
	return trimmed.length > 0 ? trimmed : null;
}
const nodePendingHandlers = {
	"node.pending.drain": async ({ params, respond, client }) => {
		if (!validateNodePendingDrainParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pending.drain",
				validator: validateNodePendingDrainParams
			});
			return;
		}
		const nodeId = resolveClientNodeId(client);
		if (!nodeId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "node.pending.drain requires a connected device identity"));
			return;
		}
		respond(true, {
			nodeId,
			...drainNodePendingWork(nodeId, {
				maxItems: params.maxItems,
				includeDefaultStatus: true
			})
		}, void 0);
	},
	"node.pending.enqueue": async ({ params, respond, context }) => {
		if (!validateNodePendingEnqueueParams(params)) {
			respondInvalidParams({
				respond,
				method: "node.pending.enqueue",
				validator: validateNodePendingEnqueueParams
			});
			return;
		}
		const p = params;
		await respondUnavailableOnThrow(respond, async () => {
			const queued = enqueueNodePendingWork({
				nodeId: p.nodeId,
				type: p.type,
				priority: p.priority,
				expiresInMs: p.expiresInMs
			});
			let wakeTriggered = false;
			if (p.wake !== false && !queued.deduped && !context.nodeRegistry.get(p.nodeId)) {
				const wakeReqId = queued.item.id;
				context.logGateway.info(`node pending wake start node=${p.nodeId} req=${wakeReqId} type=${queued.item.type}`);
				const wake = await maybeWakeNodeWithApns(p.nodeId, { wakeReason: "node.pending" });
				context.logGateway.info(`node pending wake stage=wake1 node=${p.nodeId} req=${wakeReqId} available=${wake.available} throttled=${wake.throttled} path=${wake.path} durationMs=${wake.durationMs} apnsStatus=${wake.apnsStatus ?? -1} apnsReason=${wake.apnsReason ?? "-"}`);
				wakeTriggered = wake.available;
				if (wake.available) {
					const reconnected = await waitForNodeReconnect({
						nodeId: p.nodeId,
						context,
						timeoutMs: NODE_WAKE_RECONNECT_WAIT_MS
					});
					context.logGateway.info(`node pending wake stage=wait1 node=${p.nodeId} req=${wakeReqId} reconnected=${reconnected} timeoutMs=${NODE_WAKE_RECONNECT_WAIT_MS}`);
				}
				if (!context.nodeRegistry.get(p.nodeId) && wake.available) {
					const retryWake = await maybeWakeNodeWithApns(p.nodeId, {
						force: true,
						wakeReason: "node.pending"
					});
					context.logGateway.info(`node pending wake stage=wake2 node=${p.nodeId} req=${wakeReqId} force=true available=${retryWake.available} throttled=${retryWake.throttled} path=${retryWake.path} durationMs=${retryWake.durationMs} apnsStatus=${retryWake.apnsStatus ?? -1} apnsReason=${retryWake.apnsReason ?? "-"}`);
					if (retryWake.available) {
						const reconnected = await waitForNodeReconnect({
							nodeId: p.nodeId,
							context,
							timeoutMs: NODE_WAKE_RECONNECT_RETRY_WAIT_MS
						});
						context.logGateway.info(`node pending wake stage=wait2 node=${p.nodeId} req=${wakeReqId} reconnected=${reconnected} timeoutMs=${NODE_WAKE_RECONNECT_RETRY_WAIT_MS}`);
					}
				}
				if (!context.nodeRegistry.get(p.nodeId)) {
					const nudge = await maybeSendNodeWakeNudge(p.nodeId);
					context.logGateway.info(`node pending wake nudge node=${p.nodeId} req=${wakeReqId} sent=${nudge.sent} throttled=${nudge.throttled} reason=${nudge.reason} durationMs=${nudge.durationMs} apnsStatus=${nudge.apnsStatus ?? -1} apnsReason=${nudge.apnsReason ?? "-"}`);
					context.logGateway.warn(`node pending wake done node=${p.nodeId} req=${wakeReqId} connected=false reason=not_connected`);
				} else context.logGateway.info(`node pending wake done node=${p.nodeId} req=${wakeReqId} connected=true`);
			}
			respond(true, {
				nodeId: p.nodeId,
				revision: queued.revision,
				queued: queued.item,
				wakeTriggered
			}, void 0);
		});
	}
};
//#endregion
//#region src/gateway/server-methods/push.ts
const pushHandlers = { "push.test": async ({ params, respond }) => {
	if (!validatePushTestParams(params)) {
		respondInvalidParams({
			respond,
			method: "push.test",
			validator: validatePushTestParams
		});
		return;
	}
	const nodeId = normalizeStringifiedOptionalString(params.nodeId) ?? "";
	if (!nodeId) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "nodeId required"));
		return;
	}
	const title = normalizeTrimmedString(params.title) ?? "OpenClaw";
	const body = normalizeTrimmedString(params.body) ?? `Push test for node ${nodeId}`;
	await respondUnavailableOnThrow(respond, async () => {
		const registration = await loadApnsRegistration(nodeId);
		if (!registration) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `node ${nodeId} has no APNs registration (connect iOS node first)`));
			return;
		}
		const overrideEnvironment = normalizeApnsEnvironment(params.environment);
		const result = registration.transport === "direct" ? await (async () => {
			const auth = await resolveApnsAuthConfigFromEnv(process.env);
			if (!auth.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, auth.error));
				return null;
			}
			return await sendApnsAlert({
				registration: {
					...registration,
					environment: overrideEnvironment ?? registration.environment
				},
				nodeId,
				title,
				body,
				auth: auth.value
			});
		})() : await (async () => {
			const relay = resolveApnsRelayConfigFromEnv(process.env, loadConfig().gateway);
			if (!relay.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, relay.error));
				return null;
			}
			return await sendApnsAlert({
				registration,
				nodeId,
				title,
				body,
				relayConfig: relay.value
			});
		})();
		if (!result) return;
		if (shouldClearStoredApnsRegistration({
			registration,
			result,
			overrideEnvironment
		})) await clearApnsRegistrationIfCurrent({
			nodeId,
			registration
		});
		respond(true, result, void 0);
	});
} };
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
async function resolveGatewayInflightMap(params) {
	const cached = params.context.dedupe.get(params.dedupeKey);
	if (cached) {
		params.respond(cached.ok, cached.payload, cached.error, { cached: true });
		return;
	}
	const inflightMap = getInflightMap(params.context);
	const inflight = inflightMap.get(params.dedupeKey);
	if (inflight) {
		const result = await inflight;
		const meta = result.meta ? {
			...result.meta,
			cached: true
		} : { cached: true };
		params.respond(result.ok, result.payload, result.error, meta);
		return;
	}
	return inflightMap;
}
async function runGatewayInflightWork(params) {
	params.inflightMap.set(params.dedupeKey, params.work);
	try {
		const result = await params.work;
		params.respond(result.ok, result.payload, result.error, result.meta);
	} finally {
		params.inflightMap.delete(params.dedupeKey);
	}
}
async function resolveRequestedChannel(params) {
	const channelInput = readStringValue(params.requestChannel);
	const normalizedChannel = channelInput ? normalizeChannelId(channelInput) : null;
	if (channelInput && !normalizedChannel) {
		const normalizedInput = normalizeOptionalLowercaseString(channelInput) ?? "";
		if (params.rejectWebchatAsInternalOnly && normalizedInput === "webchat") return { error: errorShape(ErrorCodes.INVALID_REQUEST, "unsupported channel: webchat (internal-only). Use `chat.send` for WebChat UI messages or choose a deliverable channel.") };
		return { error: errorShape(ErrorCodes.INVALID_REQUEST, params.unsupportedMessage(channelInput)) };
	}
	const cfg = applyPluginAutoEnable({
		config: loadConfig(),
		env: process.env
	}).config;
	let channel = normalizedChannel;
	if (!channel) try {
		channel = (await resolveMessageChannelSelection({ cfg })).channel;
	} catch (err) {
		return { error: errorShape(ErrorCodes.INVALID_REQUEST, String(err)) };
	}
	return {
		cfg,
		channel
	};
}
function resolveGatewayOutboundTarget(params) {
	const resolved = resolveOutboundTarget({
		channel: params.channel,
		to: params.to,
		cfg: params.cfg,
		accountId: params.accountId,
		mode: "explicit"
	});
	if (!resolved.ok) return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, String(resolved.error))
	};
	return {
		ok: true,
		to: resolved.to
	};
}
function buildGatewayDeliveryPayload(params) {
	const payload = {
		runId: params.runId,
		messageId: params.result.messageId,
		channel: params.channel
	};
	if ("chatId" in params.result) payload.chatId = params.result.chatId;
	if ("channelId" in params.result) payload.channelId = params.result.channelId;
	if ("toJid" in params.result) payload.toJid = params.result.toJid;
	if ("conversationId" in params.result) payload.conversationId = params.result.conversationId;
	if ("pollId" in params.result) payload.pollId = params.result.pollId;
	return payload;
}
function cacheGatewayDedupeSuccess(params) {
	params.context.dedupe.set(params.dedupeKey, {
		ts: Date.now(),
		ok: true,
		payload: params.payload
	});
}
function cacheGatewayDedupeFailure(params) {
	params.context.dedupe.set(params.dedupeKey, {
		ts: Date.now(),
		ok: false,
		error: params.error
	});
}
function createGatewayInflightSuccess(params) {
	cacheGatewayDedupeSuccess({
		context: params.context,
		dedupeKey: params.dedupeKey,
		payload: params.payload
	});
	return {
		ok: true,
		payload: params.payload,
		meta: { channel: params.channel }
	};
}
function createGatewayInflightUnavailableFailure(params) {
	const error = errorShape(ErrorCodes.UNAVAILABLE, String(params.err));
	cacheGatewayDedupeFailure({
		context: params.context,
		dedupeKey: params.dedupeKey,
		error
	});
	return {
		ok: false,
		error,
		meta: {
			channel: params.channel,
			error: formatForLog(params.err)
		}
	};
}
const sendHandlers = {
	"message.action": async ({ params, respond, context, client }) => {
		const p = params;
		if (!validateMessageActionParams(p)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid message.action params: ${formatValidationErrors(validateMessageActionParams.errors)}`));
			return;
		}
		const request = p;
		const callerScopes = client?.connect?.scopes ?? [];
		const senderIsOwner = Array.isArray(callerScopes) && callerScopes.includes("operator.admin") && request.senderIsOwner === true;
		const dedupeKey = `message.action:${request.idempotencyKey}`;
		const inflightMap = await resolveGatewayInflightMap({
			context,
			dedupeKey,
			respond
		});
		if (!inflightMap) return;
		const resolvedChannel = await resolveRequestedChannel({
			requestChannel: request.channel,
			unsupportedMessage: (input) => `unsupported channel: ${input}`,
			rejectWebchatAsInternalOnly: true
		});
		if ("error" in resolvedChannel) {
			respond(false, void 0, resolvedChannel.error);
			return;
		}
		const { cfg, channel } = resolvedChannel;
		if (!resolveOutboundChannelPlugin({
			channel,
			cfg
		})?.actions?.handleAction) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Channel ${channel} does not support action ${request.action}.`));
			return;
		}
		await runGatewayInflightWork({
			inflightMap,
			dedupeKey,
			work: (async () => {
				try {
					const handled = await dispatchChannelMessageAction({
						channel,
						action: request.action,
						cfg,
						params: request.params,
						accountId: normalizeOptionalString(request.accountId) ?? void 0,
						requesterSenderId: normalizeOptionalString(request.requesterSenderId) ?? void 0,
						senderIsOwner,
						sessionKey: normalizeOptionalString(request.sessionKey) ?? void 0,
						sessionId: normalizeOptionalString(request.sessionId) ?? void 0,
						agentId: normalizeOptionalString(request.agentId) ?? void 0,
						toolContext: request.toolContext,
						dryRun: false
					});
					if (!handled) {
						const error = errorShape(ErrorCodes.INVALID_REQUEST, `Message action ${request.action} not supported for channel ${channel}.`);
						cacheGatewayDedupeFailure({
							context,
							dedupeKey,
							error
						});
						return {
							ok: false,
							error,
							meta: { channel }
						};
					}
					return createGatewayInflightSuccess({
						context,
						dedupeKey,
						payload: extractToolPayload(handled),
						channel
					});
				} catch (err) {
					return createGatewayInflightUnavailableFailure({
						context,
						dedupeKey,
						channel,
						err
					});
				}
			})(),
			respond
		});
	},
	send: async ({ params, respond, context, client }) => {
		const p = params;
		if (!validateSendParams(p)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid send params: ${formatValidationErrors(validateSendParams.errors)}`));
			return;
		}
		const request = p;
		const idem = request.idempotencyKey;
		const dedupeKey = `send:${idem}`;
		const inflightMap = await resolveGatewayInflightMap({
			context,
			dedupeKey,
			respond
		});
		if (!inflightMap) return;
		const to = normalizeOptionalString(request.to) ?? "";
		const message = normalizeOptionalString(request.message) ?? "";
		const mediaUrl = normalizeOptionalString(request.mediaUrl);
		const mediaUrls = Array.isArray(request.mediaUrls) ? request.mediaUrls.map((entry) => normalizeOptionalString(entry)).filter((entry) => Boolean(entry)) : void 0;
		if (!message && !mediaUrl && (mediaUrls?.length ?? 0) === 0) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "invalid send params: text or media is required"));
			return;
		}
		const resolvedChannel = await resolveRequestedChannel({
			requestChannel: request.channel,
			unsupportedMessage: (input) => `unsupported channel: ${input}`,
			rejectWebchatAsInternalOnly: true
		});
		if ("error" in resolvedChannel) {
			respond(false, void 0, resolvedChannel.error);
			return;
		}
		const { cfg, channel } = resolvedChannel;
		const accountId = normalizeOptionalString(request.accountId);
		const replyToId = normalizeOptionalString(request.replyToId);
		const threadId = normalizeOptionalString(request.threadId);
		const outboundChannel = channel;
		if (!resolveOutboundChannelPlugin({
			channel,
			cfg
		})) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported channel: ${channel}`));
			return;
		}
		await runGatewayInflightWork({
			inflightMap,
			dedupeKey,
			work: (async () => {
				try {
					const resolvedTarget = resolveGatewayOutboundTarget({
						channel: outboundChannel,
						to,
						cfg,
						accountId
					});
					if (!resolvedTarget.ok) return {
						ok: false,
						error: resolvedTarget.error,
						meta: { channel }
					};
					const idLikeTarget = await maybeResolveIdLikeTarget({
						cfg,
						channel,
						input: resolvedTarget.to,
						accountId
					});
					const deliveryTarget = idLikeTarget?.to ?? resolvedTarget.to;
					const outboundDeps = context.deps ? createOutboundSendDeps(context.deps) : void 0;
					const outboundPayloads = [{
						text: message,
						mediaUrl,
						mediaUrls
					}];
					const mirrorProjection = projectOutboundPayloadPlanForMirror(createOutboundPayloadPlan(outboundPayloads));
					const mirrorText = mirrorProjection.text;
					const mirrorMediaUrls = mirrorProjection.mediaUrls;
					const providedSessionKey = normalizeOptionalLowercaseString(request.sessionKey);
					const explicitAgentId = normalizeOptionalString(request.agentId);
					const sessionAgentId = providedSessionKey ? resolveSessionAgentId({
						sessionKey: providedSessionKey,
						config: cfg
					}) : void 0;
					const defaultAgentId = resolveSessionAgentId({ config: cfg });
					const effectiveAgentId = explicitAgentId ?? sessionAgentId ?? defaultAgentId;
					const derivedRoute = await resolveOutboundSessionRoute({
						cfg,
						channel,
						agentId: effectiveAgentId,
						accountId,
						target: deliveryTarget,
						currentSessionKey: providedSessionKey,
						resolvedTarget: idLikeTarget,
						replyToId,
						threadId
					});
					const providedSessionBaseKey = parseThreadSessionSuffix(providedSessionKey).baseSessionKey ?? providedSessionKey;
					const shouldUseDerivedThreadSessionKey = channel === "slack" && !!providedSessionKey && !!normalizeOptionalString(derivedRoute?.threadId) && normalizeOptionalLowercaseString(derivedRoute?.baseSessionKey) === normalizeOptionalLowercaseString(providedSessionBaseKey) && normalizeOptionalLowercaseString(derivedRoute?.sessionKey) !== providedSessionKey;
					const outboundRoute = derivedRoute ? providedSessionKey ? shouldUseDerivedThreadSessionKey ? {
						...derivedRoute,
						baseSessionKey: derivedRoute.baseSessionKey ?? providedSessionKey
					} : {
						...derivedRoute,
						sessionKey: providedSessionKey,
						baseSessionKey: providedSessionKey
					} : derivedRoute : null;
					if (outboundRoute) await ensureOutboundSessionEntry({
						cfg,
						channel,
						accountId,
						route: outboundRoute
					});
					const outboundSessionKey = outboundRoute?.sessionKey ?? providedSessionKey;
					const outboundSession = buildOutboundSessionContext({
						cfg,
						agentId: effectiveAgentId,
						sessionKey: outboundSessionKey,
						conversationType: outboundRoute?.chatType
					});
					const result = (await deliverOutboundPayloads({
						cfg,
						channel: outboundChannel,
						to: deliveryTarget,
						accountId,
						payloads: outboundPayloads,
						replyToId: replyToId ?? null,
						session: outboundSession,
						gifPlayback: request.gifPlayback,
						threadId: outboundRoute?.threadId ?? threadId ?? null,
						deps: outboundDeps,
						gatewayClientScopes: client?.connect?.scopes ?? [],
						mirror: outboundSessionKey ? {
							sessionKey: outboundSessionKey,
							agentId: effectiveAgentId,
							text: mirrorText || message,
							mediaUrls: mirrorMediaUrls.length > 0 ? mirrorMediaUrls : void 0,
							idempotencyKey: idem
						} : void 0
					})).at(-1);
					if (!result) throw new Error("No delivery result");
					return createGatewayInflightSuccess({
						context,
						dedupeKey,
						payload: buildGatewayDeliveryPayload({
							runId: idem,
							channel,
							result
						}),
						channel
					});
				} catch (err) {
					return createGatewayInflightUnavailableFailure({
						context,
						dedupeKey,
						channel,
						err
					});
				}
			})(),
			respond
		});
	},
	poll: async ({ params, respond, context, client }) => {
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
		const resolvedChannel = await resolveRequestedChannel({
			requestChannel: request.channel,
			unsupportedMessage: (input) => `unsupported poll channel: ${input}`
		});
		if ("error" in resolvedChannel) {
			respond(false, void 0, resolvedChannel.error);
			return;
		}
		const { cfg, channel } = resolvedChannel;
		const outbound = resolveOutboundChannelPlugin({
			channel,
			cfg
		})?.outbound;
		if (typeof request.durationSeconds === "number" && outbound?.supportsPollDurationSeconds !== true) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `durationSeconds is not supported for ${channel} polls`));
			return;
		}
		if (typeof request.isAnonymous === "boolean" && outbound?.supportsAnonymousPolls !== true) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `isAnonymous is not supported for ${channel} polls`));
			return;
		}
		const poll = {
			question: request.question,
			options: request.options,
			maxSelections: request.maxSelections,
			durationSeconds: request.durationSeconds,
			durationHours: request.durationHours
		};
		const threadId = normalizeOptionalString(request.threadId);
		const accountId = normalizeOptionalString(request.accountId);
		try {
			if (!outbound?.sendPoll) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported poll channel: ${channel}`));
				return;
			}
			const resolvedTarget = resolveGatewayOutboundTarget({
				channel,
				to,
				cfg,
				accountId
			});
			if (!resolvedTarget.ok) {
				respond(false, void 0, resolvedTarget.error);
				return;
			}
			const normalized = outbound.pollMaxOptions ? normalizePollInput(poll, { maxOptions: outbound.pollMaxOptions }) : normalizePollInput(poll);
			const payload = buildGatewayDeliveryPayload({
				runId: idem,
				channel,
				result: await outbound.sendPoll({
					cfg,
					to: resolvedTarget.to,
					poll: normalized,
					accountId,
					threadId,
					silent: request.silent,
					isAnonymous: request.isAnonymous,
					gatewayClientScopes: client?.connect?.scopes ?? []
				})
			});
			cacheGatewayDedupeSuccess({
				context,
				dedupeKey: `poll:${idem}`,
				payload
			});
			respond(true, payload, void 0, { channel });
		} catch (err) {
			const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
			cacheGatewayDedupeFailure({
				context,
				dedupeKey: `poll:${idem}`,
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
//#region src/gateway/server-methods/sessions.ts
let sessionsRuntimeModulePromise;
function loadSessionsRuntimeModule() {
	sessionsRuntimeModulePromise ??= import("./sessions.runtime-CSuinWP6.js");
	return sessionsRuntimeModulePromise;
}
function requireSessionKey(key, respond) {
	const normalized = normalizeOptionalString(typeof key === "string" ? key : typeof key === "number" ? String(key) : typeof key === "bigint" ? String(key) : "") ?? "";
	if (!normalized) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key required"));
		return null;
	}
	return normalized;
}
function resolveGatewaySessionTargetFromKey(key) {
	const cfg = loadConfig();
	const target = resolveGatewaySessionStoreTarget({
		cfg,
		key
	});
	return {
		cfg,
		target,
		storePath: target.storePath
	};
}
function resolveOptionalInitialSessionMessage(params) {
	if (typeof params.task === "string" && params.task.trim()) return params.task;
	if (typeof params.message === "string" && params.message.trim()) return params.message;
}
function shouldAttachPendingMessageSeq(params) {
	if (params.cached) return false;
	return (params.payload && typeof params.payload === "object" ? params.payload.status : void 0) === "started";
}
function emitSessionsChanged(context, payload) {
	const connIds = context.getSessionEventSubscriberConnIds();
	if (connIds.size === 0) return;
	const sessionRow = payload.sessionKey ? loadGatewaySessionRow(payload.sessionKey) : null;
	context.broadcastToConnIds("sessions.changed", {
		...payload,
		ts: Date.now(),
		...sessionRow ? {
			updatedAt: sessionRow.updatedAt ?? void 0,
			sessionId: sessionRow.sessionId,
			kind: sessionRow.kind,
			channel: sessionRow.channel,
			subject: sessionRow.subject,
			groupChannel: sessionRow.groupChannel,
			space: sessionRow.space,
			chatType: sessionRow.chatType,
			origin: sessionRow.origin,
			spawnedBy: sessionRow.spawnedBy,
			spawnedWorkspaceDir: sessionRow.spawnedWorkspaceDir,
			forkedFromParent: sessionRow.forkedFromParent,
			spawnDepth: sessionRow.spawnDepth,
			subagentRole: sessionRow.subagentRole,
			subagentControlScope: sessionRow.subagentControlScope,
			label: sessionRow.label,
			displayName: sessionRow.displayName,
			deliveryContext: sessionRow.deliveryContext,
			parentSessionKey: sessionRow.parentSessionKey,
			childSessions: sessionRow.childSessions,
			thinkingLevel: sessionRow.thinkingLevel,
			fastMode: sessionRow.fastMode,
			verboseLevel: sessionRow.verboseLevel,
			traceLevel: sessionRow.traceLevel,
			reasoningLevel: sessionRow.reasoningLevel,
			elevatedLevel: sessionRow.elevatedLevel,
			sendPolicy: sessionRow.sendPolicy,
			systemSent: sessionRow.systemSent,
			abortedLastRun: sessionRow.abortedLastRun,
			inputTokens: sessionRow.inputTokens,
			outputTokens: sessionRow.outputTokens,
			lastChannel: sessionRow.lastChannel,
			lastTo: sessionRow.lastTo,
			lastAccountId: sessionRow.lastAccountId,
			lastThreadId: sessionRow.lastThreadId,
			totalTokens: sessionRow.totalTokens,
			totalTokensFresh: sessionRow.totalTokensFresh,
			contextTokens: sessionRow.contextTokens,
			estimatedCostUsd: sessionRow.estimatedCostUsd,
			responseUsage: sessionRow.responseUsage,
			modelProvider: sessionRow.modelProvider,
			model: sessionRow.model,
			status: sessionRow.status,
			startedAt: sessionRow.startedAt,
			endedAt: sessionRow.endedAt,
			runtimeMs: sessionRow.runtimeMs,
			compactionCheckpointCount: sessionRow.compactionCheckpointCount,
			latestCompactionCheckpoint: sessionRow.latestCompactionCheckpoint
		} : {}
	}, connIds, { dropIfSlow: true });
}
function rejectWebchatSessionMutation(params) {
	if (!params.client?.connect || !params.isWebchatConnect(params.client.connect)) return false;
	if (params.client.connect.client.id === GATEWAY_CLIENT_IDS.CONTROL_UI) return false;
	params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `webchat clients cannot ${params.action} sessions; use chat.send for session-scoped updates`));
	return true;
}
function buildDashboardSessionKey(agentId) {
	return `agent:${agentId}:dashboard:${randomUUID()}`;
}
function cloneCheckpointSessionEntry(params) {
	return {
		...params.currentEntry,
		sessionId: params.nextSessionId,
		sessionFile: params.nextSessionFile,
		updatedAt: Date.now(),
		systemSent: false,
		abortedLastRun: false,
		startedAt: void 0,
		endedAt: void 0,
		runtimeMs: void 0,
		status: void 0,
		inputTokens: void 0,
		outputTokens: void 0,
		cacheRead: void 0,
		cacheWrite: void 0,
		estimatedCostUsd: void 0,
		totalTokens: typeof params.totalTokens === "number" && Number.isFinite(params.totalTokens) ? params.totalTokens : void 0,
		totalTokensFresh: typeof params.totalTokens === "number" && Number.isFinite(params.totalTokens) ? true : void 0,
		label: params.label ?? params.currentEntry.label,
		parentSessionKey: params.parentSessionKey ?? params.currentEntry.parentSessionKey,
		compactionCheckpoints: params.preserveCompactionCheckpoints ? params.currentEntry.compactionCheckpoints : void 0
	};
}
function ensureSessionTranscriptFile(params) {
	try {
		const transcriptPath = resolveSessionFilePath(params.sessionId, params.sessionFile ? { sessionFile: params.sessionFile } : void 0, resolveSessionFilePathOptions({
			storePath: params.storePath,
			agentId: params.agentId
		}));
		if (!fs.existsSync(transcriptPath)) {
			fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
			const header = {
				type: "session",
				version: CURRENT_SESSION_VERSION,
				id: params.sessionId,
				timestamp: (/* @__PURE__ */ new Date()).toISOString(),
				cwd: process.cwd()
			};
			fs.writeFileSync(transcriptPath, `${JSON.stringify(header)}\n`, {
				encoding: "utf-8",
				mode: 384
			});
		}
		return {
			ok: true,
			transcriptPath
		};
	} catch (err) {
		return {
			ok: false,
			error: formatErrorMessage(err)
		};
	}
}
function resolveAbortSessionKey(params) {
	const activeRunKey = typeof params.runId === "string" ? params.context.chatAbortControllers.get(params.runId)?.sessionKey : void 0;
	if (activeRunKey) return activeRunKey;
	for (const active of params.context.chatAbortControllers.values()) {
		if (active.sessionKey === params.canonicalKey) return params.canonicalKey;
		if (active.sessionKey === params.requestedKey) return params.requestedKey;
	}
	return params.requestedKey;
}
function hasTrackedActiveSessionRun(params) {
	for (const active of params.context.chatAbortControllers.values()) if (active.sessionKey === params.canonicalKey || active.sessionKey === params.requestedKey) return true;
	return false;
}
async function interruptSessionRunIfActive(params) {
	const hasTrackedRun = hasTrackedActiveSessionRun({
		context: params.context,
		requestedKey: params.requestedKey,
		canonicalKey: params.canonicalKey
	});
	const hasEmbeddedRun = typeof params.sessionId === "string" && params.sessionId ? isEmbeddedPiRunActive(params.sessionId) : false;
	if (!hasTrackedRun && !hasEmbeddedRun) return { interrupted: false };
	if (hasTrackedRun) {
		let abortOk = true;
		let abortError;
		const abortSessionKey = resolveAbortSessionKey({
			context: params.context,
			requestedKey: params.requestedKey,
			canonicalKey: params.canonicalKey
		});
		await chatHandlers["chat.abort"]({
			req: params.req,
			params: { sessionKey: abortSessionKey },
			respond: (ok, _payload, error) => {
				abortOk = ok;
				abortError = error;
			},
			context: params.context,
			client: params.client,
			isWebchatConnect: params.isWebchatConnect
		});
		if (!abortOk) return {
			interrupted: true,
			error: abortError ?? errorShape(ErrorCodes.UNAVAILABLE, "failed to interrupt active session")
		};
	}
	if (hasEmbeddedRun && params.sessionId) abortEmbeddedPiRun(params.sessionId);
	clearSessionQueues([
		params.requestedKey,
		params.canonicalKey,
		params.sessionId
	]);
	if (hasEmbeddedRun && params.sessionId) {
		if (!await waitForEmbeddedPiRunEnd(params.sessionId, 15e3)) return {
			interrupted: true,
			error: errorShape(ErrorCodes.UNAVAILABLE, `Session ${params.requestedKey} is still active; try again in a moment.`)
		};
	}
	return { interrupted: true };
}
async function handleSessionSend(params) {
	if (!assertValidParams(params.params, validateSessionsSendParams, params.method, params.respond)) return;
	const p = params.params;
	const key = requireSessionKey(p.key, params.respond);
	if (!key) return;
	const { cfg, entry, canonicalKey, storePath } = loadSessionEntry(key);
	const deletedAgentId = resolveDeletedAgentIdFromSessionKey(cfg, canonicalKey);
	if (deletedAgentId !== null) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Agent "${deletedAgentId}" no longer exists in configuration`));
		return;
	}
	if (!entry?.sessionId) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `session not found: ${key}`));
		return;
	}
	let interruptedActiveRun = false;
	if (params.interruptIfActive) {
		const interruptResult = await interruptSessionRunIfActive({
			req: params.req,
			context: params.context,
			client: params.client,
			isWebchatConnect: params.isWebchatConnect,
			requestedKey: key,
			canonicalKey,
			sessionId: entry.sessionId
		});
		if (interruptResult.error) {
			params.respond(false, void 0, interruptResult.error);
			return;
		}
		interruptedActiveRun = interruptResult.interrupted;
	}
	const messageSeq = readSessionMessages(entry.sessionId, storePath, entry.sessionFile).length + 1;
	let sendAcked = false;
	let sendPayload;
	let sendCached = false;
	let startedRunId;
	const rawIdempotencyKey = p.idempotencyKey;
	const idempotencyKey = typeof rawIdempotencyKey === "string" && rawIdempotencyKey.trim() ? rawIdempotencyKey.trim() : randomUUID();
	await chatHandlers["chat.send"]({
		req: params.req,
		params: {
			sessionKey: canonicalKey,
			message: p.message,
			thinking: p.thinking,
			attachments: p.attachments,
			timeoutMs: p.timeoutMs,
			idempotencyKey
		},
		respond: (ok, payload, error, meta) => {
			sendAcked = ok;
			sendPayload = payload;
			sendCached = meta?.cached === true;
			startedRunId = payload && typeof payload === "object" && typeof payload.runId === "string" ? payload.runId : void 0;
			if (ok && shouldAttachPendingMessageSeq({
				payload,
				cached: meta?.cached === true
			})) {
				params.respond(true, {
					...payload && typeof payload === "object" ? payload : {},
					messageSeq,
					...interruptedActiveRun ? { interruptedActiveRun: true } : {}
				}, void 0, meta);
				return;
			}
			params.respond(ok, ok && payload && typeof payload === "object" ? {
				...payload,
				...interruptedActiveRun ? { interruptedActiveRun: true } : {}
			} : payload, error, meta);
		},
		context: params.context,
		client: params.client,
		isWebchatConnect: params.isWebchatConnect
	});
	if (sendAcked) {
		if (shouldAttachPendingMessageSeq({
			payload: sendPayload,
			cached: sendCached
		})) await reactivateCompletedSubagentSession({
			sessionKey: canonicalKey,
			runId: startedRunId
		});
		emitSessionsChanged(params.context, {
			sessionKey: canonicalKey,
			reason: interruptedActiveRun ? "steer" : "send"
		});
	}
}
const sessionsHandlers = {
	"sessions.list": ({ params, respond }) => {
		if (!assertValidParams(params, validateSessionsListParams, "sessions.list", respond)) return;
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
	"sessions.subscribe": ({ client, context, respond }) => {
		const connId = client?.connId?.trim();
		if (connId) context.subscribeSessionEvents(connId);
		respond(true, { subscribed: Boolean(connId) }, void 0);
	},
	"sessions.unsubscribe": ({ client, context, respond }) => {
		const connId = client?.connId?.trim();
		if (connId) context.unsubscribeSessionEvents(connId);
		respond(true, { subscribed: false }, void 0);
	},
	"sessions.messages.subscribe": ({ params, client, context, respond }) => {
		if (!assertValidParams(params, validateSessionsMessagesSubscribeParams, "sessions.messages.subscribe", respond)) return;
		const connId = client?.connId?.trim();
		const key = requireSessionKey(params.key, respond);
		if (!key) return;
		const { canonicalKey } = loadSessionEntry(key);
		if (connId) {
			context.subscribeSessionMessageEvents(connId, canonicalKey);
			respond(true, {
				subscribed: true,
				key: canonicalKey
			}, void 0);
			return;
		}
		respond(true, {
			subscribed: false,
			key: canonicalKey
		}, void 0);
	},
	"sessions.messages.unsubscribe": ({ params, client, context, respond }) => {
		if (!assertValidParams(params, validateSessionsMessagesUnsubscribeParams, "sessions.messages.unsubscribe", respond)) return;
		const connId = client?.connId?.trim();
		const key = requireSessionKey(params.key, respond);
		if (!key) return;
		const { canonicalKey } = loadSessionEntry(key);
		if (connId) context.unsubscribeSessionMessageEvents(connId, canonicalKey);
		respond(true, {
			subscribed: false,
			key: canonicalKey
		}, void 0);
	},
	"sessions.preview": ({ params, respond }) => {
		if (!assertValidParams(params, validateSessionsPreviewParams, "sessions.preview", respond)) return;
		const p = params;
		const keys = (Array.isArray(p.keys) ? p.keys : []).map((key) => normalizeOptionalString(key ?? "")).filter((key) => Boolean(key)).slice(0, 64);
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
			const entry = resolveFreshestSessionEntryFromStoreKeys(store, target.storeKeys);
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
		if (!assertValidParams(params, validateSessionsResolveParams, "sessions.resolve", respond)) return;
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
	"sessions.compaction.list": ({ params, respond }) => {
		if (!assertValidParams(params, validateSessionsCompactionListParams, "sessions.compaction.list", respond)) return;
		const key = requireSessionKey(params.key, respond);
		if (!key) return;
		const { entry, canonicalKey } = loadSessionEntry(key);
		respond(true, {
			ok: true,
			key: canonicalKey,
			checkpoints: listSessionCompactionCheckpoints(entry)
		}, void 0);
	},
	"sessions.compaction.get": ({ params, respond }) => {
		if (!assertValidParams(params, validateSessionsCompactionGetParams, "sessions.compaction.get", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		const checkpointId = normalizeOptionalString(p.checkpointId) ?? "";
		if (!checkpointId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "checkpointId required"));
			return;
		}
		const { entry, canonicalKey } = loadSessionEntry(key);
		const checkpoint = getSessionCompactionCheckpoint({
			entry,
			checkpointId
		});
		if (!checkpoint) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `checkpoint not found: ${checkpointId}`));
			return;
		}
		respond(true, {
			ok: true,
			key: canonicalKey,
			checkpoint
		}, void 0);
	},
	"sessions.create": async ({ req, params, respond, context, client, isWebchatConnect }) => {
		if (!assertValidParams(params, validateSessionsCreateParams, "sessions.create", respond)) return;
		const p = params;
		const cfg = loadConfig();
		const requestedKey = normalizeOptionalString(p.key);
		const agentId = normalizeAgentId(normalizeOptionalString(p.agentId) ?? resolveDefaultAgentId(cfg));
		if (requestedKey) {
			const requestedAgentId = parseAgentSessionKey(requestedKey)?.agentId;
			if (requestedAgentId && requestedAgentId !== agentId && normalizeOptionalString(p.agentId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `sessions.create key agent (${requestedAgentId}) does not match agentId (${agentId})`));
				return;
			}
		}
		const parentSessionKey = normalizeOptionalString(p.parentSessionKey);
		let canonicalParentSessionKey;
		if (parentSessionKey) {
			const parent = loadSessionEntry(parentSessionKey);
			if (!parent.entry?.sessionId) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown parent session: ${parentSessionKey}`));
				return;
			}
			canonicalParentSessionKey = parent.canonicalKey;
		}
		const loweredRequestedKey = normalizeOptionalLowercaseString(requestedKey);
		const target = resolveGatewaySessionStoreTarget({
			cfg,
			key: requestedKey ? loweredRequestedKey === "global" || loweredRequestedKey === "unknown" ? loweredRequestedKey : toAgentStoreSessionKey({
				agentId,
				requestKey: requestedKey,
				mainKey: cfg.session?.mainKey
			}) : buildDashboardSessionKey(agentId)
		});
		const targetAgentId = resolveAgentIdFromSessionKey(target.canonicalKey);
		const created = await updateSessionStore(target.storePath, async (store) => {
			const patched = await applySessionsPatchToStore({
				cfg,
				store,
				storeKey: target.canonicalKey,
				patch: {
					key: target.canonicalKey,
					label: normalizeOptionalString(p.label),
					model: normalizeOptionalString(p.model)
				},
				loadGatewayModelCatalog: context.loadGatewayModelCatalog
			});
			if (!patched.ok || !canonicalParentSessionKey) return patched;
			const nextEntry = {
				...patched.entry,
				parentSessionKey: canonicalParentSessionKey
			};
			store[target.canonicalKey] = nextEntry;
			return {
				...patched,
				entry: nextEntry
			};
		});
		if (!created.ok) {
			respond(false, void 0, created.error);
			return;
		}
		const ensured = ensureSessionTranscriptFile({
			sessionId: created.entry.sessionId,
			storePath: target.storePath,
			sessionFile: created.entry.sessionFile,
			agentId: targetAgentId
		});
		if (!ensured.ok) {
			await updateSessionStore(target.storePath, (store) => {
				delete store[target.canonicalKey];
			});
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `failed to create session transcript: ${ensured.error}`));
			return;
		}
		const createdEntry = created.entry.sessionFile === ensured.transcriptPath ? created.entry : {
			...created.entry,
			sessionFile: ensured.transcriptPath
		};
		if (createdEntry !== created.entry) await updateSessionStore(target.storePath, (store) => {
			const existing = store[target.canonicalKey];
			if (existing) store[target.canonicalKey] = {
				...existing,
				sessionFile: ensured.transcriptPath
			};
		});
		const initialMessage = resolveOptionalInitialSessionMessage(p);
		let runPayload;
		let runError;
		let runMeta;
		const messageSeq = initialMessage ? readSessionMessages(createdEntry.sessionId, target.storePath, createdEntry.sessionFile).length + 1 : void 0;
		if (initialMessage) await chatHandlers["chat.send"]({
			req,
			params: {
				sessionKey: target.canonicalKey,
				message: initialMessage,
				idempotencyKey: randomUUID()
			},
			respond: (ok, payload, error, meta) => {
				if (ok && payload && typeof payload === "object") runPayload = payload;
				else runError = error;
				runMeta = meta;
			},
			context,
			client,
			isWebchatConnect
		});
		const runStarted = runPayload !== void 0 && shouldAttachPendingMessageSeq({
			payload: runPayload,
			cached: runMeta?.cached === true
		});
		respond(true, {
			ok: true,
			key: target.canonicalKey,
			sessionId: createdEntry.sessionId,
			entry: createdEntry,
			runStarted,
			...runPayload ? runPayload : {},
			...runStarted && typeof messageSeq === "number" ? { messageSeq } : {},
			...runError ? { runError } : {}
		}, void 0);
		emitSessionsChanged(context, {
			sessionKey: target.canonicalKey,
			reason: "create"
		});
		if (runStarted) emitSessionsChanged(context, {
			sessionKey: target.canonicalKey,
			reason: "send"
		});
	},
	"sessions.compaction.branch": async ({ params, respond, context }) => {
		if (!assertValidParams(params, validateSessionsCompactionBranchParams, "sessions.compaction.branch", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		const checkpointId = typeof p.checkpointId === "string" && p.checkpointId.trim() ? p.checkpointId.trim() : "";
		if (!checkpointId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "checkpointId required"));
			return;
		}
		const { cfg, entry, canonicalKey } = loadSessionEntry(key);
		const target = resolveGatewaySessionStoreTarget({
			cfg,
			key: canonicalKey
		});
		if (!entry?.sessionId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `session not found: ${key}`));
			return;
		}
		const checkpoint = getSessionCompactionCheckpoint({
			entry,
			checkpointId
		});
		if (!checkpoint?.preCompaction.sessionFile) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `checkpoint not found: ${checkpointId}`));
			return;
		}
		if (!fs.existsSync(checkpoint.preCompaction.sessionFile)) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "checkpoint snapshot transcript is missing"));
			return;
		}
		const snapshotSession = SessionManager.open(checkpoint.preCompaction.sessionFile, path.dirname(checkpoint.preCompaction.sessionFile));
		const branchedSession = SessionManager.forkFrom(checkpoint.preCompaction.sessionFile, snapshotSession.getCwd(), path.dirname(checkpoint.preCompaction.sessionFile));
		const branchedSessionFile = branchedSession.getSessionFile();
		if (!branchedSessionFile) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "failed to create checkpoint branch transcript"));
			return;
		}
		const nextKey = buildDashboardSessionKey(target.agentId);
		const label = entry.label?.trim() ? `${entry.label.trim()} (checkpoint)` : "Checkpoint branch";
		const nextEntry = cloneCheckpointSessionEntry({
			currentEntry: entry,
			nextSessionId: branchedSession.getSessionId(),
			nextSessionFile: branchedSessionFile,
			label,
			parentSessionKey: canonicalKey,
			totalTokens: checkpoint.tokensBefore
		});
		await updateSessionStore(target.storePath, (store) => {
			store[nextKey] = nextEntry;
		});
		respond(true, {
			ok: true,
			sourceKey: canonicalKey,
			key: nextKey,
			sessionId: nextEntry.sessionId,
			checkpoint,
			entry: nextEntry
		}, void 0);
		emitSessionsChanged(context, {
			sessionKey: canonicalKey,
			reason: "checkpoint-branch"
		});
		emitSessionsChanged(context, {
			sessionKey: nextKey,
			reason: "checkpoint-branch"
		});
	},
	"sessions.compaction.restore": async ({ req, params, respond, context, client, isWebchatConnect }) => {
		if (!assertValidParams(params, validateSessionsCompactionRestoreParams, "sessions.compaction.restore", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		if (rejectWebchatSessionMutation({
			action: "restore",
			client,
			isWebchatConnect,
			respond
		})) return;
		const checkpointId = typeof p.checkpointId === "string" && p.checkpointId.trim() ? p.checkpointId.trim() : "";
		if (!checkpointId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "checkpointId required"));
			return;
		}
		const { entry, canonicalKey, storePath } = loadSessionEntry(key);
		if (!entry?.sessionId) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `session not found: ${key}`));
			return;
		}
		const checkpoint = getSessionCompactionCheckpoint({
			entry,
			checkpointId
		});
		if (!checkpoint?.preCompaction.sessionFile) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `checkpoint not found: ${checkpointId}`));
			return;
		}
		if (!fs.existsSync(checkpoint.preCompaction.sessionFile)) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "checkpoint snapshot transcript is missing"));
			return;
		}
		const interruptResult = await interruptSessionRunIfActive({
			req,
			context,
			client,
			isWebchatConnect,
			requestedKey: key,
			canonicalKey,
			sessionId: entry.sessionId
		});
		if (interruptResult.error) {
			respond(false, void 0, interruptResult.error);
			return;
		}
		const snapshotSession = SessionManager.open(checkpoint.preCompaction.sessionFile, path.dirname(checkpoint.preCompaction.sessionFile));
		const restoredSession = SessionManager.forkFrom(checkpoint.preCompaction.sessionFile, snapshotSession.getCwd(), path.dirname(checkpoint.preCompaction.sessionFile));
		const restoredSessionFile = restoredSession.getSessionFile();
		if (!restoredSessionFile) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "failed to restore checkpoint transcript"));
			return;
		}
		const nextEntry = cloneCheckpointSessionEntry({
			currentEntry: entry,
			nextSessionId: restoredSession.getSessionId(),
			nextSessionFile: restoredSessionFile,
			totalTokens: checkpoint.tokensBefore,
			preserveCompactionCheckpoints: true
		});
		await updateSessionStore(storePath, (store) => {
			store[canonicalKey] = nextEntry;
		});
		respond(true, {
			ok: true,
			key: canonicalKey,
			sessionId: nextEntry.sessionId,
			checkpoint,
			entry: nextEntry
		}, void 0);
		emitSessionsChanged(context, {
			sessionKey: canonicalKey,
			reason: "checkpoint-restore"
		});
	},
	"sessions.send": async ({ req, params, respond, context, client, isWebchatConnect }) => {
		await handleSessionSend({
			method: "sessions.send",
			req,
			params,
			respond,
			context,
			client,
			isWebchatConnect,
			interruptIfActive: false
		});
	},
	"sessions.steer": async ({ req, params, respond, context, client, isWebchatConnect }) => {
		await handleSessionSend({
			method: "sessions.steer",
			req,
			params,
			respond,
			context,
			client,
			isWebchatConnect,
			interruptIfActive: true
		});
	},
	"sessions.abort": async ({ req, params, respond, context, client, isWebchatConnect }) => {
		if (!assertValidParams(params, validateSessionsAbortParams, "sessions.abort", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		const { canonicalKey } = loadSessionEntry(key);
		const abortSessionKey = resolveAbortSessionKey({
			context,
			requestedKey: key,
			canonicalKey,
			runId: readStringValue(p.runId)
		});
		let abortedRunId = null;
		await chatHandlers["chat.abort"]({
			req,
			params: {
				sessionKey: abortSessionKey,
				runId: readStringValue(p.runId)
			},
			respond: (ok, payload, error, meta) => {
				if (!ok) {
					respond(ok, payload, error, meta);
					return;
				}
				abortedRunId = (payload && typeof payload === "object" && Array.isArray(payload.runIds) ? payload.runIds.filter((value) => Boolean(normalizeOptionalString(value))) : [])[0] ?? null;
				respond(true, {
					ok: true,
					abortedRunId,
					status: abortedRunId ? "aborted" : "no-active-run"
				}, void 0, meta);
			},
			context,
			client,
			isWebchatConnect
		});
		if (abortedRunId) emitSessionsChanged(context, {
			sessionKey: canonicalKey,
			reason: "abort"
		});
	},
	"sessions.patch": async ({ params, respond, context, client, isWebchatConnect }) => {
		if (!assertValidParams(params, validateSessionsPatchParams, "sessions.patch", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		if (rejectWebchatSessionMutation({
			action: "patch",
			client,
			isWebchatConnect,
			respond
		})) return;
		const { cfg, target, storePath } = resolveGatewaySessionTargetFromKey(key);
		const applied = await updateSessionStore(storePath, async (store) => {
			const { primaryKey } = migrateAndPruneGatewaySessionStoreKey({
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
		if (hasInternalHookListeners("session", "patch")) {
			const hookContext = structuredClone({
				sessionEntry: applied.entry,
				patch: p,
				cfg
			});
			triggerInternalHook({
				type: "session",
				action: "patch",
				sessionKey: target.canonicalKey ?? key,
				context: hookContext,
				timestamp: /* @__PURE__ */ new Date(),
				messages: []
			});
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
		emitSessionsChanged(context, {
			sessionKey: target.canonicalKey,
			reason: "patch"
		});
	},
	"sessions.reset": async ({ params, respond, context }) => {
		if (!assertValidParams(params, validateSessionsResetParams, "sessions.reset", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		const reason = p.reason === "new" ? "new" : "reset";
		const { performGatewaySessionReset } = await loadSessionsRuntimeModule();
		const result = await performGatewaySessionReset({
			key,
			reason,
			commandSource: "gateway:sessions.reset"
		});
		if (!result.ok) {
			respond(false, void 0, result.error);
			return;
		}
		respond(true, {
			ok: true,
			key: result.key,
			entry: result.entry
		}, void 0);
		emitSessionsChanged(context, {
			sessionKey: result.key,
			reason
		});
	},
	"sessions.delete": async ({ params, respond, client, isWebchatConnect, context }) => {
		if (!assertValidParams(params, validateSessionsDeleteParams, "sessions.delete", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		if (rejectWebchatSessionMutation({
			action: "delete",
			client,
			isWebchatConnect,
			respond
		})) return;
		const { cfg, target, storePath } = resolveGatewaySessionTargetFromKey(key);
		const mainKey = resolveMainSessionKey(cfg);
		if (target.canonicalKey === mainKey) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Cannot delete the main session (${mainKey}).`));
			return;
		}
		const deleteTranscript = typeof p.deleteTranscript === "boolean" ? p.deleteTranscript : true;
		const { archiveSessionTranscriptsForSessionDetailed, cleanupSessionBeforeMutation, emitGatewaySessionEndPluginHook, emitSessionUnboundLifecycleEvent } = await loadSessionsRuntimeModule();
		const { entry, legacyKey, canonicalKey } = loadSessionEntry(key);
		const mutationCleanupError = await cleanupSessionBeforeMutation({
			cfg,
			key,
			target,
			entry,
			legacyKey,
			canonicalKey,
			reason: "session-delete"
		});
		if (mutationCleanupError) {
			respond(false, void 0, mutationCleanupError);
			return;
		}
		const sessionId = entry?.sessionId;
		const deleted = await updateSessionStore(storePath, (store) => {
			const { primaryKey } = migrateAndPruneGatewaySessionStoreKey({
				cfg,
				key,
				store
			});
			const hadEntry = Boolean(store[primaryKey]);
			if (hadEntry) delete store[primaryKey];
			return hadEntry;
		});
		const archivedTranscripts = deleted && deleteTranscript ? archiveSessionTranscriptsForSessionDetailed({
			sessionId,
			storePath,
			sessionFile: entry?.sessionFile,
			agentId: target.agentId,
			reason: "deleted"
		}) : [];
		const archived = archivedTranscripts.map((entry) => entry.archivedPath);
		if (deleted) {
			emitGatewaySessionEndPluginHook({
				cfg,
				sessionKey: target.canonicalKey ?? key,
				sessionId,
				storePath,
				sessionFile: entry?.sessionFile,
				agentId: target.agentId,
				reason: "deleted",
				archivedTranscripts
			});
			const emitLifecycleHooks = p.emitLifecycleHooks !== false;
			await emitSessionUnboundLifecycleEvent({
				targetSessionKey: target.canonicalKey ?? key,
				reason: "session-delete",
				emitHooks: emitLifecycleHooks
			});
		}
		respond(true, {
			ok: true,
			key: target.canonicalKey,
			deleted,
			archived
		}, void 0);
		if (deleted) emitSessionsChanged(context, {
			sessionKey: target.canonicalKey,
			reason: "delete"
		});
	},
	"sessions.get": ({ params, respond }) => {
		const p = params;
		const key = requireSessionKey(p.key ?? p.sessionKey, respond);
		if (!key) return;
		const limit = typeof p.limit === "number" && Number.isFinite(p.limit) ? Math.max(1, Math.floor(p.limit)) : 200;
		const { target, storePath } = resolveGatewaySessionTargetFromKey(key);
		const entry = resolveFreshestSessionEntryFromStoreKeys(loadSessionStore(storePath), target.storeKeys);
		if (!entry?.sessionId) {
			respond(true, { messages: [] }, void 0);
			return;
		}
		const allMessages = readSessionMessages(entry.sessionId, storePath, entry.sessionFile);
		respond(true, { messages: limit < allMessages.length ? allMessages.slice(-limit) : allMessages }, void 0);
	},
	"sessions.compact": async ({ req, params, respond, context, client, isWebchatConnect }) => {
		if (!assertValidParams(params, validateSessionsCompactParams, "sessions.compact", respond)) return;
		const p = params;
		const key = requireSessionKey(p.key, respond);
		if (!key) return;
		if (rejectWebchatSessionMutation({
			action: "compact",
			client,
			isWebchatConnect,
			respond
		})) return;
		const maxLines = typeof p.maxLines === "number" && Number.isFinite(p.maxLines) ? Math.max(1, Math.floor(p.maxLines)) : void 0;
		const { cfg, target, storePath } = resolveGatewaySessionTargetFromKey(key);
		const compactTarget = await updateSessionStore(storePath, (store) => {
			const { entry, primaryKey } = migrateAndPruneGatewaySessionStoreKey({
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
		if (maxLines === void 0) {
			const interruptResult = await interruptSessionRunIfActive({
				req,
				context,
				client,
				isWebchatConnect,
				requestedKey: key,
				canonicalKey: target.canonicalKey,
				sessionId
			});
			if (interruptResult.error) {
				respond(false, void 0, interruptResult.error);
				return;
			}
			const resolvedModel = resolveSessionModelRef(cfg, entry, target.agentId);
			const workspaceDir = normalizeOptionalString(entry?.spawnedWorkspaceDir) || resolveAgentWorkspaceDir(cfg, target.agentId);
			const result = await compactEmbeddedPiSession({
				sessionId,
				sessionKey: target.canonicalKey,
				allowGatewaySubagentBinding: true,
				sessionFile: filePath,
				workspaceDir,
				config: cfg,
				provider: resolvedModel.provider,
				model: resolvedModel.model,
				agentHarnessId: entry?.sessionId === sessionId ? entry.agentHarnessId : void 0,
				thinkLevel: normalizeThinkLevel(entry?.thinkingLevel),
				reasoningLevel: normalizeReasoningLevel(entry?.reasoningLevel),
				bashElevated: {
					enabled: false,
					allowed: false,
					defaultLevel: "off"
				},
				trigger: "manual"
			});
			if (result.ok && result.compacted) await updateSessionStore(storePath, (store) => {
				const entryToUpdate = store[compactTarget.primaryKey];
				if (!entryToUpdate) return;
				entryToUpdate.updatedAt = Date.now();
				entryToUpdate.compactionCount = Math.max(0, entryToUpdate.compactionCount ?? 0) + 1;
				delete entryToUpdate.inputTokens;
				delete entryToUpdate.outputTokens;
				if (typeof result.result?.tokensAfter === "number" && Number.isFinite(result.result.tokensAfter)) {
					entryToUpdate.totalTokens = result.result.tokensAfter;
					entryToUpdate.totalTokensFresh = true;
				} else {
					delete entryToUpdate.totalTokens;
					delete entryToUpdate.totalTokensFresh;
				}
			});
			respond(true, {
				ok: result.ok,
				key: target.canonicalKey,
				compacted: result.compacted,
				reason: result.reason,
				result: result.result
			}, void 0);
			if (result.ok) emitSessionsChanged(context, {
				sessionKey: target.canonicalKey,
				reason: "compact",
				compacted: result.compacted
			});
			return;
		}
		const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/).filter((l) => Boolean(normalizeOptionalString(l)));
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
		emitSessionsChanged(context, {
			sessionKey: target.canonicalKey,
			reason: "compact",
			compacted: true
		});
	}
};
//#endregion
//#region src/gateway/server-methods/skills.ts
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
				const trimmed = normalizeOptionalString(bin) ?? "";
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
		const agentIdRaw = normalizeOptionalString(params?.agentId) ?? "";
		const agentId = agentIdRaw ? normalizeAgentId(agentIdRaw) : resolveDefaultAgentId(cfg);
		if (agentIdRaw) {
			if (!listAgentIds(cfg).includes(agentId)) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown agent id "${agentIdRaw}"`));
				return;
			}
		}
		respond(true, buildWorkspaceSkillStatus(resolveAgentWorkspaceDir(cfg, agentId), {
			config: cfg,
			eligibility: { remote: getRemoteSkillEligibility({ advertiseExecNode: canExecRequestNode({
				cfg,
				agentId
			}) }) }
		}), void 0);
	},
	"skills.bins": ({ params, respond }) => {
		if (!validateSkillsBinsParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.bins params: ${formatValidationErrors(validateSkillsBinsParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const workspaceDirs = listAgentWorkspaceDirs(cfg);
		const bins = /* @__PURE__ */ new Set();
		for (const workspaceDir of workspaceDirs) {
			const entries = loadWorkspaceSkillEntries(workspaceDir, { config: cfg });
			for (const bin of collectSkillBins(entries)) bins.add(bin);
		}
		respond(true, { bins: [...bins].toSorted() }, void 0);
	},
	"skills.search": async ({ params, respond }) => {
		if (!validateSkillsSearchParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.search params: ${formatValidationErrors(validateSkillsSearchParams.errors)}`));
			return;
		}
		try {
			respond(true, { results: await searchSkillsFromClawHub({
				query: params.query,
				limit: params.limit
			}) }, void 0);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatErrorMessage(err)));
		}
	},
	"skills.detail": async ({ params, respond }) => {
		if (!validateSkillsDetailParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.detail params: ${formatValidationErrors(validateSkillsDetailParams.errors)}`));
			return;
		}
		try {
			respond(true, await fetchClawHubSkillDetail({ slug: params.slug }), void 0);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatErrorMessage(err)));
		}
	},
	"skills.install": async ({ params, respond }) => {
		if (!validateSkillsInstallParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid skills.install params: ${formatValidationErrors(validateSkillsInstallParams.errors)}`));
			return;
		}
		const cfg = loadConfig();
		const workspaceDirRaw = resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
		if (params && typeof params === "object" && "source" in params && params.source === "clawhub") {
			const p = params;
			const result = await installSkillFromClawHub({
				workspaceDir: workspaceDirRaw,
				slug: p.slug,
				version: p.version,
				force: Boolean(p.force)
			});
			respond(result.ok, result.ok ? {
				ok: true,
				message: `Installed ${result.slug}@${result.version}`,
				stdout: "",
				stderr: "",
				code: 0,
				slug: result.slug,
				version: result.version,
				targetDir: result.targetDir
			} : result, result.ok ? void 0 : errorShape(ErrorCodes.UNAVAILABLE, result.error));
			return;
		}
		const p = params;
		const result = await installSkill({
			workspaceDir: workspaceDirRaw,
			skillName: p.name,
			installId: p.installId,
			dangerouslyForceUnsafeInstall: p.dangerouslyForceUnsafeInstall,
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
		if (params && typeof params === "object" && "source" in params && params.source === "clawhub") {
			const p = params;
			if (!p.slug && !p.all) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "clawhub skills.update requires \"slug\" or \"all\""));
				return;
			}
			if (p.slug && p.all) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "clawhub skills.update accepts either \"slug\" or \"all\", not both"));
				return;
			}
			const cfg = loadConfig();
			const results = await updateSkillsFromClawHub({
				workspaceDir: resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)),
				slug: p.slug
			});
			const errors = results.filter((result) => !result.ok);
			respond(errors.length === 0, {
				ok: errors.length === 0,
				skillKey: p.slug ?? "*",
				config: {
					source: "clawhub",
					results
				}
			}, errors.length === 0 ? void 0 : errorShape(ErrorCodes.UNAVAILABLE, errors.map((result) => result.error).join("; ")));
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
//#region src/infra/system-presence.ts
const entries = /* @__PURE__ */ new Map();
const TTL_MS = 300 * 1e3;
const MAX_ENTRIES = 200;
function normalizePresenceKey(key) {
	return normalizeOptionalLowercaseString(key);
}
function resolvePrimaryIPv4() {
	return pickBestEffortPrimaryLanIPv4() ?? os.hostname();
}
function initSelfPresence() {
	const host = os.hostname();
	const ip = resolvePrimaryIPv4() ?? void 0;
	const version = resolveRuntimeServiceVersion(process.env);
	const modelIdentifier = (() => {
		if (os.platform() === "darwin") {
			const out = normalizeOptionalString(spawnSync("sysctl", ["-n", "hw.model"], { encoding: "utf-8" }).stdout) ?? "";
			return out.length > 0 ? out : void 0;
		}
		return os.arch();
	})();
	const macOSVersion = () => {
		const out = normalizeOptionalString(spawnSync("sw_vers", ["-productVersion"], { encoding: "utf-8" }).stdout) ?? "";
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
	const key = normalizeLowercaseStringOrEmpty(host);
	entries.set(key, selfEntry);
}
function ensureSelfPresence() {
	if (entries.size === 0) initSelfPresence();
}
function touchSelfPresence() {
	const key = normalizeLowercaseStringOrEmpty(os.hostname());
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
			const trimmed = normalizeOptionalString(item) ?? "";
			if (trimmed) out.add(trimmed);
		}
	}
	return out.size > 0 ? [...out] : void 0;
}
function updateSystemPresence(payload) {
	ensureSelfPresence();
	const parsed = parsePresence(payload.text);
	const key = normalizePresenceKey(payload.deviceId) || normalizePresenceKey(payload.instanceId) || normalizePresenceKey(parsed.instanceId) || normalizePresenceKey(parsed.host) || parsed.ip || parsed.text.slice(0, 64) || normalizeLowercaseStringOrEmpty(os.hostname());
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
	const normalizedKey = normalizePresenceKey(key) ?? normalizeLowercaseStringOrEmpty(os.hostname());
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
//#region src/gateway/server/presence-events.ts
function broadcastPresenceSnapshot(params) {
	const presenceVersion = params.incrementPresenceVersion();
	params.broadcast("presence", { presence: listSystemPresence() }, {
		dropIfSlow: true,
		stateVersion: {
			presence: presenceVersion,
			health: params.getHealthVersion()
		}
	});
	return presenceVersion;
}
//#endregion
//#region src/gateway/server-methods/system.ts
const systemHandlers = {
	"gateway.identity.get": ({ respond }) => {
		const identity = loadOrCreateDeviceIdentity();
		respond(true, {
			deviceId: identity.deviceId,
			publicKey: publicKeyRawBase64UrlFromPem(identity.publicKeyPem)
		}, void 0);
	},
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
		const text = normalizeOptionalString(params.text) ?? "";
		if (!text) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "text required"));
			return;
		}
		const sessionKey = resolveMainSessionKeyFromConfig();
		const deviceId = readStringValue(params.deviceId);
		const instanceId = readStringValue(params.instanceId);
		const host = readStringValue(params.host);
		const ip = readStringValue(params.ip);
		const mode = readStringValue(params.mode);
		const version = readStringValue(params.version);
		const platform = readStringValue(params.platform);
		const deviceFamily = readStringValue(params.deviceFamily);
		const modelIdentifier = readStringValue(params.modelIdentifier);
		const lastInputSeconds = typeof params.lastInputSeconds === "number" && Number.isFinite(params.lastInputSeconds) ? params.lastInputSeconds : void 0;
		const reason = readStringValue(params.reason);
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
			const normalizedReason = normalizeLowercaseStringOrEmpty(reasonValue);
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
					const hostLabel = normalizeOptionalString(next.host) ?? "Unknown";
					const ipLabel = normalizeOptionalString(next.ip);
					parts.push(`Node: ${hostLabel}${ipLabel ? ` (${ipLabel})` : ""}`);
				}
				if (versionChanged) parts.push(`app ${normalizeOptionalString(next.version) ?? "unknown"}`);
				if (modeChanged) parts.push(`mode ${normalizeOptionalString(next.mode) ?? "unknown"}`);
				if (reasonChanged) parts.push(`reason ${normalizeOptionalString(reasonValue) ?? "event"}`);
				const deltaText = parts.join(" · ");
				if (deltaText) enqueueSystemEvent(deltaText, {
					sessionKey,
					contextKey: presenceUpdate.key
				});
			}
		} else enqueueSystemEvent(text, { sessionKey });
		broadcastPresenceSnapshot({
			broadcast: context.broadcast,
			incrementPresenceVersion: context.incrementPresenceVersion,
			getHealthVersion: context.getHealthVersion
		});
		respond(true, { ok: true }, void 0);
	}
};
//#endregion
//#region src/gateway/server-methods/talk.ts
function canReadTalkSecrets(client) {
	const scopes = Array.isArray(client?.connect?.scopes) ? client.connect.scopes : [];
	return scopes.includes("operator.admin") || scopes.includes("operator.talk.secrets");
}
function asStringRecord(value) {
	const record = asOptionalRecord(value);
	if (!record) return;
	const next = {};
	for (const [key, entryValue] of Object.entries(record)) if (typeof entryValue === "string") next[key] = entryValue;
	return Object.keys(next).length > 0 ? next : void 0;
}
function normalizeAliasKey(value) {
	return normalizeLowercaseStringOrEmpty(value);
}
function resolveTalkVoiceId(providerConfig, requested) {
	if (!requested) return;
	const aliases = asStringRecord(providerConfig.voiceAliases);
	if (!aliases) return requested;
	const normalizedRequested = normalizeAliasKey(requested);
	for (const [alias, voiceId] of Object.entries(aliases)) if (normalizeAliasKey(alias) === normalizedRequested) return voiceId;
	return requested;
}
function buildTalkTtsConfig(config) {
	const resolved = resolveActiveTalkProviderConfig(config.talk);
	const provider = canonicalizeSpeechProviderId(resolved?.provider, config);
	if (!resolved || !provider) return {
		error: "talk.speak unavailable: talk provider not configured",
		reason: "talk_unconfigured"
	};
	const speechProvider = getSpeechProvider(provider, config);
	if (!speechProvider) return {
		error: `talk.speak unavailable: speech provider "${provider}" does not support Talk mode`,
		reason: "talk_provider_unsupported"
	};
	const baseTts = config.messages?.tts ?? {};
	const providerConfig = resolved.config;
	const resolvedProviderConfig = speechProvider.resolveTalkConfig?.({
		cfg: config,
		baseTtsConfig: baseTts,
		talkProviderConfig: providerConfig,
		timeoutMs: baseTts.timeoutMs ?? 3e4
	}) ?? providerConfig;
	const talkTts = {
		...baseTts,
		auto: "always",
		provider,
		providers: {
			...asOptionalRecord(baseTts.providers) ?? {},
			[provider]: resolvedProviderConfig
		}
	};
	return {
		provider,
		providerConfig,
		cfg: {
			...config,
			messages: {
				...config.messages,
				tts: talkTts
			}
		}
	};
}
function getRecord(value) {
	return asOptionalRecord(value) ?? void 0;
}
function getVoiceCallRealtimeConfig(config) {
	const realtime = getRecord(getRecord(getRecord(getRecord(getRecord(config.plugins)?.entries)?.["voice-call"])?.config)?.realtime);
	const providersRaw = getRecord(realtime?.providers);
	const providers = {};
	if (providersRaw) for (const [providerId, providerConfig] of Object.entries(providersRaw)) {
		const record = getRecord(providerConfig);
		if (record) providers[providerId] = record;
	}
	return {
		provider: normalizeOptionalString(realtime?.provider),
		providers: Object.keys(providers).length > 0 ? providers : void 0
	};
}
function buildTalkRealtimeConfig(config, requestedProvider) {
	const voiceCallRealtime = getVoiceCallRealtimeConfig(config);
	const talkProviderConfigs = config.talk?.providers;
	const talkProvider = normalizeOptionalString(config.talk?.provider);
	const talkProviderSupportsRealtime = talkProvider ? Boolean(getRealtimeVoiceProvider(talkProvider, config)) : false;
	return {
		provider: normalizeOptionalString(requestedProvider) ?? (talkProviderSupportsRealtime ? talkProvider : void 0) ?? voiceCallRealtime.provider,
		providers: {
			...voiceCallRealtime.providers,
			...talkProviderConfigs
		}
	};
}
function buildRealtimeInstructions() {
	return `You are OpenClaw's realtime voice interface. Keep spoken replies concise. If the user asks for code, repository state, tools, files, current OpenClaw context, or deeper reasoning, call ${REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME} and then summarize the result naturally.`;
}
function isFallbackEligibleTalkReason(reason) {
	return reason === "talk_unconfigured" || reason === "talk_provider_unsupported" || reason === "method_unavailable";
}
function talkSpeakError(reason, message) {
	const details = {
		reason,
		fallbackEligible: isFallbackEligibleTalkReason(reason)
	};
	return errorShape(ErrorCodes.UNAVAILABLE, message, { details });
}
function resolveTalkSpeed(params) {
	if (typeof params.speed === "number") return params.speed;
	if (typeof params.rateWpm !== "number" || params.rateWpm <= 0) return;
	const resolved = params.rateWpm / 175;
	if (resolved <= .5 || resolved >= 2) return;
	return resolved;
}
function buildTalkSpeakOverrides(provider, providerConfig, config, params) {
	const speechProvider = getSpeechProvider(provider, config);
	if (!speechProvider?.resolveTalkOverrides) return { provider };
	const resolvedSpeed = resolveTalkSpeed(params);
	const resolvedVoiceId = resolveTalkVoiceId(providerConfig, normalizeOptionalString(params.voiceId));
	const providerOverrides = speechProvider.resolveTalkOverrides({
		talkProviderConfig: providerConfig,
		params: {
			...params,
			...resolvedVoiceId == null ? {} : { voiceId: resolvedVoiceId },
			...resolvedSpeed == null ? {} : { speed: resolvedSpeed }
		}
	});
	if (!providerOverrides || Object.keys(providerOverrides).length === 0) return { provider };
	return {
		provider,
		providerOverrides: { [provider]: providerOverrides }
	};
}
function inferMimeType(outputFormat, fileExtension) {
	const normalizedOutput = normalizeOptionalLowercaseString(outputFormat);
	const normalizedExtension = normalizeOptionalLowercaseString(fileExtension);
	if (normalizedOutput === "mp3" || normalizedOutput?.startsWith("mp3_") || normalizedOutput?.endsWith("-mp3") || normalizedExtension === ".mp3") return "audio/mpeg";
	if (normalizedOutput === "opus" || normalizedOutput?.startsWith("opus_") || normalizedExtension === ".opus" || normalizedExtension === ".ogg") return "audio/ogg";
	if (normalizedOutput?.endsWith("-wav") || normalizedExtension === ".wav") return "audio/wav";
	if (normalizedOutput?.endsWith("-webm") || normalizedExtension === ".webm") return "audio/webm";
}
function resolveTalkResponseFromConfig(params) {
	const normalizedTalk = normalizeTalkSection(params.sourceConfig.talk);
	if (!normalizedTalk) return;
	const payload = buildTalkConfigResponse(normalizedTalk);
	if (!payload) return;
	if (params.includeSecrets) return payload;
	const sourceResolved = resolveActiveTalkProviderConfig(normalizedTalk);
	const runtimeResolved = resolveActiveTalkProviderConfig(params.runtimeConfig.talk);
	const provider = canonicalizeSpeechProviderId(sourceResolved?.provider ?? runtimeResolved?.provider, params.runtimeConfig);
	if (!provider) return payload;
	const speechProvider = getSpeechProvider(provider, params.runtimeConfig);
	const sourceBaseTts = asOptionalRecord(params.sourceConfig.messages?.tts) ?? {};
	const runtimeBaseTts = asOptionalRecord(params.runtimeConfig.messages?.tts) ?? {};
	const talkProviderConfig = sourceResolved?.config ?? runtimeResolved?.config ?? {};
	const resolvedConfig = speechProvider?.resolveTalkConfig?.({
		cfg: params.runtimeConfig,
		baseTtsConfig: Object.keys(sourceBaseTts).length > 0 ? sourceBaseTts : runtimeBaseTts,
		talkProviderConfig,
		timeoutMs: typeof sourceBaseTts.timeoutMs === "number" ? sourceBaseTts.timeoutMs : typeof runtimeBaseTts.timeoutMs === "number" ? runtimeBaseTts.timeoutMs : 3e4
	}) ?? talkProviderConfig;
	return {
		...payload,
		provider,
		resolved: {
			provider,
			config: resolvedConfig
		}
	};
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
		const runtimeConfig = loadConfig();
		const configPayload = {};
		const talk = resolveTalkResponseFromConfig({
			includeSecrets,
			sourceConfig: snapshot.config,
			runtimeConfig
		});
		if (talk) configPayload.talk = includeSecrets ? talk : redactConfigObject(talk);
		const sessionMainKey = snapshot.config.session?.mainKey;
		if (typeof sessionMainKey === "string") configPayload.session = { mainKey: sessionMainKey };
		const seamColor = snapshot.config.ui?.seamColor;
		if (typeof seamColor === "string") configPayload.ui = { seamColor };
		respond(true, { config: configPayload }, void 0);
	},
	"talk.realtime.session": async ({ params, respond }) => {
		if (!validateTalkRealtimeSessionParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid talk.realtime.session params: ${formatValidationErrors(validateTalkRealtimeSessionParams.errors)}`));
			return;
		}
		const typedParams = params;
		try {
			const runtimeConfig = loadConfig();
			const realtimeConfig = buildTalkRealtimeConfig(runtimeConfig, typedParams.provider);
			const resolution = resolveConfiguredRealtimeVoiceProvider({
				configuredProviderId: realtimeConfig.provider,
				providerConfigs: realtimeConfig.providers,
				cfg: runtimeConfig,
				cfgForResolve: runtimeConfig,
				noRegisteredProviderMessage: "No realtime voice provider registered"
			});
			if (!resolution.provider.createBrowserSession) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `Realtime voice provider "${resolution.provider.id}" does not support browser WebRTC sessions`));
				return;
			}
			const session = await resolution.provider.createBrowserSession({
				providerConfig: resolution.providerConfig,
				instructions: buildRealtimeInstructions(),
				tools: [REALTIME_VOICE_AGENT_CONSULT_TOOL],
				model: normalizeOptionalString(typedParams.model),
				voice: normalizeOptionalString(typedParams.voice)
			});
			respond(true, {
				provider: session.provider,
				clientSecret: session.clientSecret,
				...session.model ? { model: session.model } : {},
				...session.voice ? { voice: session.voice } : {},
				...typeof session.expiresAt === "number" ? { expiresAt: session.expiresAt } : {}
			}, void 0);
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"talk.speak": async ({ params, respond }) => {
		if (!validateTalkSpeakParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid talk.speak params: ${formatValidationErrors(validateTalkSpeakParams.errors)}`));
			return;
		}
		const typedParams = params;
		const text = normalizeOptionalString(typedParams.text);
		if (!text) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "talk.speak requires text"));
			return;
		}
		if (typedParams.speed == null && typedParams.rateWpm != null && resolveTalkSpeed(typedParams) == null) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid talk.speak params: rateWpm must resolve to speed between 0.5 and 2.0`));
			return;
		}
		try {
			const runtimeConfig = loadConfig();
			const setup = buildTalkTtsConfig(runtimeConfig);
			if ("error" in setup) {
				respond(false, void 0, talkSpeakError(setup.reason, setup.error));
				return;
			}
			const overrides = buildTalkSpeakOverrides(setup.provider, setup.providerConfig, runtimeConfig, typedParams);
			const result = await synthesizeSpeech({
				text,
				cfg: setup.cfg,
				overrides,
				disableFallback: true
			});
			if (!result.success || !result.audioBuffer) {
				respond(false, void 0, talkSpeakError("synthesis_failed", result.error ?? "talk synthesis failed"));
				return;
			}
			if ((result.provider ?? setup.provider).trim().length === 0) {
				respond(false, void 0, talkSpeakError("invalid_audio_result", "talk synthesis returned empty provider"));
				return;
			}
			if (result.audioBuffer.length === 0) {
				respond(false, void 0, talkSpeakError("invalid_audio_result", "talk synthesis returned empty audio"));
				return;
			}
			respond(true, {
				audioBase64: result.audioBuffer.toString("base64"),
				provider: result.provider ?? setup.provider,
				outputFormat: result.outputFormat,
				voiceCompatible: result.voiceCompatible,
				mimeType: inferMimeType(result.outputFormat, result.fileExtension),
				fileExtension: result.fileExtension
			}, void 0);
		} catch (err) {
			respond(false, void 0, talkSpeakError("synthesis_failed", formatForLog(err)));
		}
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
//#region src/gateway/server-methods/tools-catalog.ts
function resolveAgentIdOrRespondError(rawAgentId, respond) {
	const cfg = loadConfig();
	const knownAgents = listAgentIds(cfg);
	const requestedAgentId = normalizeOptionalString(rawAgentId) ?? "";
	const agentId = requestedAgentId || resolveDefaultAgentId(cfg);
	if (requestedAgentId && !knownAgents.includes(agentId)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown agent id "${requestedAgentId}"`));
		return null;
	}
	return {
		cfg,
		agentId
	};
}
function buildCoreGroups() {
	return listCoreToolSections().map((section) => ({
		id: section.id,
		label: section.label,
		source: "core",
		tools: section.tools.map((tool) => ({
			id: tool.id,
			label: tool.label,
			description: tool.description,
			source: "core",
			defaultProfiles: resolveCoreToolProfiles(tool.id)
		}))
	}));
}
function buildPluginGroups(params) {
	const workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
	const agentDir = resolveAgentDir(params.cfg, params.agentId);
	const pluginTools = resolvePluginTools({
		context: {
			config: params.cfg,
			workspaceDir,
			agentDir,
			agentId: params.agentId
		},
		existingToolNames: params.existingToolNames,
		toolAllowlist: ["group:plugins"],
		suppressNameConflicts: true,
		allowGatewaySubagentBinding: true
	});
	const groups = /* @__PURE__ */ new Map();
	for (const tool of pluginTools) {
		const meta = getPluginToolMeta(tool);
		const pluginId = meta?.pluginId ?? "plugin";
		const groupId = `plugin:${pluginId}`;
		const existing = groups.get(groupId) ?? {
			id: groupId,
			label: pluginId,
			source: "plugin",
			pluginId,
			tools: []
		};
		existing.tools.push({
			id: tool.name,
			label: normalizeOptionalString(tool.label) ?? tool.name,
			description: summarizeToolDescriptionText({
				rawDescription: typeof tool.description === "string" ? tool.description : void 0,
				displaySummary: tool.displaySummary
			}),
			source: "plugin",
			pluginId,
			optional: meta?.optional,
			defaultProfiles: []
		});
		groups.set(groupId, existing);
	}
	return [...groups.values()].map((group) => Object.assign({}, group, { tools: group.tools.toSorted((a, b) => a.id.localeCompare(b.id)) })).toSorted((a, b) => a.label.localeCompare(b.label));
}
function buildToolsCatalogResult(params) {
	const agentId = normalizeOptionalString(params.agentId) || resolveDefaultAgentId(params.cfg);
	const includePlugins = params.includePlugins !== false;
	const groups = buildCoreGroups();
	if (includePlugins) {
		const existingToolNames = new Set(groups.flatMap((group) => group.tools.map((tool) => tool.id)));
		groups.push(...buildPluginGroups({
			cfg: params.cfg,
			agentId,
			existingToolNames
		}));
	}
	return {
		agentId,
		profiles: PROFILE_OPTIONS.map((profile) => ({
			id: profile.id,
			label: profile.label
		})),
		groups
	};
}
const toolsCatalogHandlers = { "tools.catalog": ({ params, respond }) => {
	if (!validateToolsCatalogParams(params)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid tools.catalog params: ${formatValidationErrors(validateToolsCatalogParams.errors)}`));
		return;
	}
	const resolved = resolveAgentIdOrRespondError(params.agentId, respond);
	if (!resolved) return;
	respond(true, buildToolsCatalogResult({
		cfg: resolved.cfg,
		agentId: resolved.agentId,
		includePlugins: params.includePlugins
	}), void 0);
} };
//#endregion
//#region src/gateway/server-methods/tools-effective.ts
function resolveRequestedAgentIdOrRespondError(params) {
	const knownAgents = listAgentIds(params.cfg);
	const requestedAgentId = normalizeOptionalString(params.rawAgentId) ?? "";
	if (!requestedAgentId) return;
	if (!knownAgents.includes(requestedAgentId)) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown agent id "${requestedAgentId}"`));
		return null;
	}
	return requestedAgentId;
}
function resolveTrustedToolsEffectiveContext(params) {
	const loaded = loadSessionEntry(params.sessionKey);
	if (!loaded.entry) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown session key "${params.sessionKey}"`));
		return null;
	}
	const sessionAgentId = resolveSessionAgentId({
		sessionKey: loaded.canonicalKey ?? params.sessionKey,
		config: loaded.cfg
	});
	if (params.requestedAgentId && params.requestedAgentId !== sessionAgentId) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `agent id "${params.requestedAgentId}" does not match session agent "${sessionAgentId}"`));
		return null;
	}
	const delivery = deliveryContextFromSession(loaded.entry);
	const resolvedModel = resolveSessionModelRef(loaded.cfg, loaded.entry, sessionAgentId);
	return {
		cfg: loaded.cfg,
		agentId: sessionAgentId,
		senderIsOwner: params.senderIsOwner,
		modelProvider: resolvedModel.provider,
		modelId: resolvedModel.model,
		messageProvider: delivery?.channel ?? loaded.entry.lastChannel ?? loaded.entry.channel ?? loaded.entry.origin?.provider,
		accountId: delivery?.accountId ?? loaded.entry.lastAccountId ?? loaded.entry.origin?.accountId,
		currentChannelId: delivery?.to,
		currentThreadTs: delivery?.threadId != null ? String(delivery.threadId) : loaded.entry.lastThreadId != null ? String(loaded.entry.lastThreadId) : loaded.entry.origin?.threadId != null ? String(loaded.entry.origin.threadId) : void 0,
		groupId: loaded.entry.groupId,
		groupChannel: loaded.entry.groupChannel,
		groupSpace: loaded.entry.space,
		replyToMode: resolveReplyToMode(loaded.cfg, delivery?.channel ?? loaded.entry.lastChannel ?? loaded.entry.channel ?? loaded.entry.origin?.provider, delivery?.accountId ?? loaded.entry.lastAccountId ?? loaded.entry.origin?.accountId, loaded.entry.chatType ?? loaded.entry.origin?.chatType)
	};
}
const toolsEffectiveHandlers = { "tools.effective": ({ params, respond, client }) => {
	if (!validateToolsEffectiveParams(params)) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid tools.effective params: ${formatValidationErrors(validateToolsEffectiveParams.errors)}`));
		return;
	}
	const cfg = loadConfig();
	const requestedAgentId = resolveRequestedAgentIdOrRespondError({
		rawAgentId: params.agentId,
		cfg,
		respond
	});
	if (requestedAgentId === null) return;
	const trustedContext = resolveTrustedToolsEffectiveContext({
		sessionKey: params.sessionKey,
		requestedAgentId,
		senderIsOwner: Array.isArray(client?.connect?.scopes) ? client.connect.scopes.includes(ADMIN_SCOPE$1) : false,
		respond
	});
	if (!trustedContext) return;
	respond(true, resolveEffectiveToolInventory({
		cfg: trustedContext.cfg,
		agentId: trustedContext.agentId,
		sessionKey: params.sessionKey,
		messageProvider: trustedContext.messageProvider,
		modelProvider: trustedContext.modelProvider,
		modelId: trustedContext.modelId,
		senderIsOwner: trustedContext.senderIsOwner,
		currentChannelId: trustedContext.currentChannelId,
		currentThreadTs: trustedContext.currentThreadTs,
		accountId: trustedContext.accountId,
		groupId: trustedContext.groupId,
		groupChannel: trustedContext.groupChannel,
		groupSpace: trustedContext.groupSpace,
		replyToMode: trustedContext.replyToMode
	}), void 0);
} };
//#endregion
//#region src/gateway/server-methods/tts.ts
const ttsHandlers = {
	"tts.status": async ({ respond }) => {
		try {
			const cfg = loadConfig();
			const config = resolveTtsConfig(cfg);
			const prefsPath = resolveTtsPrefsPath(config);
			const provider = getTtsProvider(config, prefsPath);
			const autoMode = resolveTtsAutoMode({
				config,
				prefsPath
			});
			const fallbackProviders = resolveTtsProviderOrder(provider, cfg).slice(1).filter((candidate) => isTtsProviderConfigured(config, candidate, cfg));
			const providerStates = listSpeechProviders(cfg).map((candidate) => ({
				id: candidate.id,
				label: candidate.label,
				configured: candidate.isConfigured({
					cfg,
					providerConfig: getResolvedSpeechProviderConfig(config, candidate.id, cfg),
					timeoutMs: config.timeoutMs
				})
			}));
			respond(true, {
				enabled: isTtsEnabled(config, prefsPath),
				auto: autoMode,
				provider,
				fallbackProvider: fallbackProviders[0] ?? null,
				fallbackProviders,
				prefsPath,
				providerStates
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
		const text = normalizeOptionalString(params.text) ?? "";
		if (!text) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "tts.convert requires text"));
			return;
		}
		try {
			const cfg = loadConfig();
			const channel = normalizeOptionalString(params.channel);
			const providerRaw = normalizeOptionalString(params.provider);
			const modelId = normalizeOptionalString(params.modelId);
			const voiceId = normalizeOptionalString(params.voiceId);
			let overrides;
			try {
				overrides = resolveExplicitTtsOverrides({
					cfg,
					provider: providerRaw,
					modelId,
					voiceId
				});
			} catch (err) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, formatForLog(err)));
				return;
			}
			const result = await textToSpeech({
				text,
				cfg,
				channel,
				overrides,
				disableFallback: Boolean(overrides.provider || modelId || voiceId)
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
		const cfg = loadConfig();
		const provider = canonicalizeSpeechProviderId(normalizeOptionalString(params.provider) ?? "", cfg);
		if (!provider || !getSpeechProvider(provider, cfg)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "Invalid provider. Use a registered TTS provider id."));
			return;
		}
		try {
			setTtsProvider(resolveTtsPrefsPath(resolveTtsConfig(cfg)), provider);
			respond(true, { provider });
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	},
	"tts.providers": async ({ respond }) => {
		try {
			const cfg = loadConfig();
			const config = resolveTtsConfig(cfg);
			const prefsPath = resolveTtsPrefsPath(config);
			respond(true, {
				providers: listSpeechProviders(cfg).map((provider) => ({
					id: provider.id,
					name: provider.label,
					configured: provider.isConfigured({
						cfg,
						providerConfig: getResolvedSpeechProviderConfig(config, provider.id, cfg),
						timeoutMs: config.timeoutMs
					}),
					models: [...provider.models ?? []],
					voices: [...provider.voices ?? []]
				})),
				active: getTtsProvider(config, prefsPath)
			});
		} catch (err) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, formatForLog(err)));
		}
	}
};
//#endregion
//#region src/gateway/server-methods/update.ts
const updateHandlers = { "update.run": async ({ params, respond, client, context }) => {
	if (!assertValidParams(params, validateUpdateRunParams, "update.run", respond)) return;
	const actor = resolveControlPlaneActor(client);
	const { sessionKey, deliveryContext: requestedDeliveryContext, threadId: requestedThreadId, note, restartDelayMs } = parseRestartRequestParams(params);
	const { deliveryContext: sessionDeliveryContext, threadId: sessionThreadId } = extractDeliveryInfo(sessionKey);
	const deliveryContext = requestedDeliveryContext ?? sessionDeliveryContext;
	const threadId = requestedThreadId ?? sessionThreadId;
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
		deliveryContext,
		threadId,
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
	const restart = result.status === "ok" ? scheduleGatewaySigusr1Restart({
		delayMs: restartDelayMs,
		reason: "update.run",
		audit: {
			actor: actor.actor,
			deviceId: actor.deviceId,
			clientIp: actor.clientIp,
			changedPaths: []
		}
	}) : null;
	context?.logGateway?.info(`update.run completed ${formatControlPlaneActor(actor)} changedPaths=<n/a> restartReason=update.run status=${result.status}`);
	if (restart?.coalesced) context?.logGateway?.warn(`update.run restart coalesced ${formatControlPlaneActor(actor)} delayMs=${restart.delayMs}`);
	respond(true, {
		ok: result.status !== "error",
		result,
		restart,
		sentinel: {
			path: sentinelPath,
			payload
		}
	}, void 0);
} };
//#endregion
//#region src/shared/usage-aggregates.ts
function mergeUsageLatency(totals, latency) {
	if (!latency || latency.count <= 0) return;
	totals.count += latency.count;
	totals.sum += latency.avgMs * latency.count;
	totals.min = Math.min(totals.min, latency.minMs);
	totals.max = Math.max(totals.max, latency.maxMs);
	totals.p95Max = Math.max(totals.p95Max, latency.p95Ms);
}
function mergeUsageDailyLatency(dailyLatencyMap, dailyLatency) {
	for (const day of dailyLatency ?? []) {
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
}
function buildUsageAggregateTail(params) {
	return {
		byChannel: Array.from(params.byChannelMap.entries()).map(([channel, totals]) => ({
			channel,
			totals
		})).toSorted((a, b) => b.totals.totalCost - a.totals.totalCost),
		latency: params.latencyTotals.count > 0 ? {
			count: params.latencyTotals.count,
			avgMs: params.latencyTotals.sum / params.latencyTotals.count,
			minMs: params.latencyTotals.min === Number.POSITIVE_INFINITY ? 0 : params.latencyTotals.min,
			maxMs: params.latencyTotals.max,
			p95Ms: params.latencyTotals.p95Max
		} : void 0,
		dailyLatency: Array.from(params.dailyLatencyMap.values()).map((entry) => ({
			date: entry.date,
			count: entry.count,
			avgMs: entry.count ? entry.sum / entry.count : 0,
			minMs: entry.min === Number.POSITIVE_INFINITY ? 0 : entry.min,
			maxMs: entry.max,
			p95Ms: entry.p95Max
		})).toSorted((a, b) => a.date.localeCompare(b.date)),
		modelDaily: Array.from(params.modelDailyMap.values()).toSorted((a, b) => a.date.localeCompare(b.date) || b.cost - a.cost),
		daily: Array.from(params.dailyMap.values()).toSorted((a, b) => a.date.localeCompare(b.date))
	};
}
//#endregion
//#region src/gateway/server-methods/usage.ts
const COST_USAGE_CACHE_TTL_MS = 3e4;
const COST_USAGE_CACHE_MAX = 256;
const DAY_MS = 1440 * 60 * 1e3;
const costUsageCache = /* @__PURE__ */ new Map();
function findCostUsageCacheEvictionKey() {
	for (const [key, entry] of costUsageCache) if (!entry.inFlight) return key;
	return costUsageCache.keys().next().value;
}
function setCostUsageCache(cacheKey, entry) {
	if (!costUsageCache.has(cacheKey) && costUsageCache.size >= COST_USAGE_CACHE_MAX) {
		const evictKey = findCostUsageCacheEvictionKey();
		if (evictKey !== void 0) costUsageCache.delete(evictKey);
	}
	costUsageCache.set(cacheKey, entry);
}
function resolveSessionUsageFileOrRespond(key, respond) {
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
		return null;
	}
	return {
		config,
		entry,
		agentId,
		sessionId,
		sessionFile
	};
}
const parseDateParts = (raw) => {
	if (typeof raw !== "string" || !raw.trim()) return;
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
	if (!match) return;
	const [, yearStr, monthStr, dayStr] = match;
	const year = Number(yearStr);
	const monthIndex = Number(monthStr) - 1;
	const day = Number(dayStr);
	if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return;
	return {
		year,
		monthIndex,
		day
	};
};
/**
* Parse a UTC offset string in the format UTC+H, UTC-H, UTC+HH, UTC-HH, UTC+H:MM, UTC-HH:MM.
* Returns the UTC offset in minutes (east-positive), or undefined if invalid.
*/
const parseUtcOffsetToMinutes = (raw) => {
	if (typeof raw !== "string" || !raw.trim()) return;
	const match = /^UTC([+-])(\d{1,2})(?::([0-5]\d))?$/.exec(raw.trim());
	if (!match) return;
	const sign = match[1] === "+" ? 1 : -1;
	const hours = Number(match[2]);
	const minutes = Number(match[3] ?? "0");
	if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return;
	if (hours > 14 || hours === 14 && minutes !== 0) return;
	const totalMinutes = sign * (hours * 60 + minutes);
	if (totalMinutes < -720 || totalMinutes > 840) return;
	return totalMinutes;
};
const resolveDateInterpretation = (params) => {
	if (params.mode === "gateway") return { mode: "gateway" };
	if (params.mode === "specific") {
		const utcOffsetMinutes = parseUtcOffsetToMinutes(params.utcOffset);
		if (utcOffsetMinutes !== void 0) return {
			mode: "specific",
			utcOffsetMinutes
		};
	}
	return { mode: "utc" };
};
/**
* Parse a date string (YYYY-MM-DD) to start-of-day timestamp based on interpretation mode.
* Returns undefined if invalid.
*/
const parseDateToMs = (raw, interpretation = { mode: "utc" }) => {
	const parts = parseDateParts(raw);
	if (!parts) return;
	const { year, monthIndex, day } = parts;
	if (interpretation.mode === "gateway") {
		const ms = new Date(year, monthIndex, day).getTime();
		return Number.isNaN(ms) ? void 0 : ms;
	}
	if (interpretation.mode === "specific") {
		const ms = Date.UTC(year, monthIndex, day) - interpretation.utcOffsetMinutes * 60 * 1e3;
		return Number.isNaN(ms) ? void 0 : ms;
	}
	const ms = Date.UTC(year, monthIndex, day);
	return Number.isNaN(ms) ? void 0 : ms;
};
const getTodayStartMs = (now, interpretation) => {
	if (interpretation.mode === "gateway") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	if (interpretation.mode === "specific") {
		const shifted = new Date(now.getTime() + interpretation.utcOffsetMinutes * 60 * 1e3);
		return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - interpretation.utcOffsetMinutes * 60 * 1e3;
	}
	return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
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
	const interpretation = resolveDateInterpretation(params);
	const todayStartMs = getTodayStartMs(now, interpretation);
	const todayEndMs = todayStartMs + DAY_MS - 1;
	const startMs = parseDateToMs(params.startDate, interpretation);
	const endMs = parseDateToMs(params.endDate, interpretation);
	if (startMs !== void 0 && endMs !== void 0) return {
		startMs,
		endMs: endMs + DAY_MS - 1
	};
	const days = parseDays(params.days);
	if (days !== void 0) return {
		startMs: todayStartMs - (Math.max(1, days) - 1) * DAY_MS,
		endMs: todayEndMs
	};
	return {
		startMs: todayStartMs - 29 * DAY_MS,
		endMs: todayEndMs
	};
};
function buildStoreBySessionId(store) {
	const matchesBySessionId = /* @__PURE__ */ new Map();
	for (const [key, entry] of Object.entries(store)) {
		if (!entry?.sessionId) continue;
		const matches = matchesBySessionId.get(entry.sessionId) ?? [];
		matches.push([key, entry]);
		matchesBySessionId.set(entry.sessionId, matches);
	}
	const storeBySessionId = /* @__PURE__ */ new Map();
	for (const [sessionId, matches] of matchesBySessionId) {
		const preferredKey = resolvePreferredSessionKeyForSessionIdMatches(matches, sessionId);
		if (!preferredKey) continue;
		const preferredEntry = store[preferredKey];
		if (preferredEntry) storeBySessionId.set(sessionId, {
			key: preferredKey,
			entry: preferredEntry
		});
	}
	return storeBySessionId;
}
async function discoverAllSessionsForUsage(params) {
	const agents = listAgentsForGateway(params.config).agents;
	return (await Promise.all(agents.map(async (agent) => {
		return (await discoverAllSessions({
			agentId: agent.id,
			startMs: params.startMs,
			endMs: params.endMs
		})).map((session) => Object.assign({}, session, { agentId: agent.id }));
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
		setCostUsageCache(cacheKey, {
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
			setCostUsageCache(cacheKey, current);
		}
	});
	entry.inFlight = inFlight;
	setCostUsageCache(cacheKey, entry);
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
			days: params?.days,
			mode: params?.mode,
			utcOffset: params?.utcOffset
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
			endDate: p.endDate,
			mode: p.mode,
			utcOffset: p.utcOffset
		});
		const limit = typeof p.limit === "number" && Number.isFinite(p.limit) ? p.limit : 50;
		const includeContextWeight = p.includeContextWeight ?? false;
		const specificKey = normalizeOptionalString(p.key) ?? null;
		const { storePath, store } = loadCombinedSessionStoreForGateway(config);
		const now = Date.now();
		const mergedEntries = [];
		if (specificKey) {
			const parsed = parseAgentSessionKey(specificKey);
			const agentIdFromKey = parsed?.agentId;
			const keyRest = parsed?.rest ?? specificKey;
			const storeBySessionId = buildStoreBySessionId(store);
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
				sessionFile = resolveExistingUsageSessionFile({
					sessionId,
					sessionEntry: storeEntry,
					sessionFile: resolveSessionFilePath(sessionId, storeEntry, resolveSessionFilePathOptions({
						storePath: storePath !== "(multiple)" ? storePath : void 0,
						agentId: agentIdFromKey
					})),
					agentId: agentIdFromKey
				});
			} catch {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `Invalid session reference: ${specificKey}`));
				return;
			}
			if (sessionFile) try {
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
			const storeBySessionId = buildStoreBySessionId(store);
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
				mergeUsageLatency(latencyTotals, usage.latency);
				mergeUsageDailyLatency(dailyLatencyMap, usage.dailyLatency);
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
		const tail = buildUsageAggregateTail({
			byChannelMap,
			latencyTotals,
			dailyLatencyMap,
			modelDailyMap,
			dailyMap: dailyAggregateMap
		});
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
				const costDiff = (b.totals?.totalCost ?? 0) - (a.totals?.totalCost ?? 0);
				if (costDiff !== 0) return costDiff;
				return (b.totals?.totalTokens ?? 0) - (a.totals?.totalTokens ?? 0);
			}),
			byProvider: Array.from(byProviderMap.values()).toSorted((a, b) => {
				const costDiff = (b.totals?.totalCost ?? 0) - (a.totals?.totalCost ?? 0);
				if (costDiff !== 0) return costDiff;
				return (b.totals?.totalTokens ?? 0) - (a.totals?.totalTokens ?? 0);
			}),
			byAgent: Array.from(byAgentMap.entries()).map(([id, totals]) => ({
				agentId: id,
				totals
			})).toSorted((a, b) => (b.totals?.totalCost ?? 0) - (a.totals?.totalCost ?? 0)),
			...tail
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
		const key = normalizeOptionalString(params?.key) ?? null;
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key is required for timeseries"));
			return;
		}
		const resolved = resolveSessionUsageFileOrRespond(key, respond);
		if (!resolved) return;
		const { config, entry, agentId, sessionId, sessionFile } = resolved;
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
		const key = normalizeOptionalString(params?.key) ?? null;
		if (!key) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "key is required for logs"));
			return;
		}
		const limit = typeof params?.limit === "number" && Number.isFinite(params.limit) ? Math.min(params.limit, 1e3) : 200;
		const resolved = resolveSessionUsageFileOrRespond(key, respond);
		if (!resolved) return;
		const { config, entry, agentId, sessionId, sessionFile } = resolved;
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
function resolveAccountId(params) {
	return typeof params.accountId === "string" ? params.accountId : void 0;
}
function respondProviderUnavailable(respond) {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "web login provider is not available"));
}
function respondProviderUnsupported(respond, providerId) {
	respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `web login is not supported by provider ${providerId}`));
}
function wasChannelRunning(params) {
	const runtime = params.context.getRuntimeSnapshot();
	if (params.accountId) {
		const accountRuntime = runtime.channelAccounts[params.channelId]?.[params.accountId];
		if (accountRuntime) return accountRuntime.running === true;
	}
	if (!params.accountId) return runtime.channels[params.channelId]?.running === true;
	const defaultRuntime = runtime.channels[params.channelId];
	return defaultRuntime?.accountId === params.accountId && defaultRuntime.running === true;
}
const webHandlers = {
	"web.login.start": async ({ params, respond, context }) => {
		if (!validateWebLoginStartParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid web.login.start params: ${formatValidationErrors(validateWebLoginStartParams.errors)}`));
			return;
		}
		try {
			const accountId = resolveAccountId(params);
			const provider = resolveWebLoginProvider();
			if (!provider) {
				respondProviderUnavailable(respond);
				return;
			}
			if (!provider.gateway?.loginWithQrStart) {
				respondProviderUnsupported(respond, provider.id);
				return;
			}
			const wasRunning = wasChannelRunning({
				context,
				channelId: provider.id,
				accountId
			});
			await context.stopChannel(provider.id, accountId);
			const result = await provider.gateway.loginWithQrStart({
				force: Boolean(params.force),
				timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : void 0,
				verbose: Boolean(params.verbose),
				accountId
			});
			if (result.connected) await context.startChannel(provider.id, accountId);
			else if (wasRunning && !result.qrDataUrl) await context.startChannel(provider.id, accountId);
			respond(true, result, void 0);
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
			const accountId = resolveAccountId(params);
			const provider = resolveWebLoginProvider();
			if (!provider) {
				respondProviderUnavailable(respond);
				return;
			}
			if (!provider.gateway?.loginWithQrWait) {
				respondProviderUnsupported(respond, provider.id);
				return;
			}
			const result = await provider.gateway.loginWithQrWait({
				timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : void 0,
				accountId,
				currentQrDataUrl: typeof params.currentQrDataUrl === "string" ? params.currentQrDataUrl : void 0
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
		this.pendingTerminalResolution = false;
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
		if (this.pendingTerminalResolution) {
			this.pendingTerminalResolution = false;
			return {
				done: true,
				status: this.status,
				error: this.error
			};
		}
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
		if (!this.stepDeferred) {
			if (step === null) this.pendingTerminalResolution = true;
			return;
		}
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
function readWizardStatus(session) {
	return {
		status: session.getStatus(),
		error: session.getError()
	};
}
function findWizardSessionOrRespond(params) {
	const session = params.context.wizardSessions.get(params.sessionId);
	if (!session) {
		params.respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "wizard not found"));
		return null;
	}
	return session;
}
const wizardHandlers = {
	"wizard.start": async ({ params, respond, context }) => {
		if (!assertValidParams(params, validateWizardStartParams, "wizard.start", respond)) return;
		if (context.findRunningWizard()) {
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, "wizard already running"));
			return;
		}
		const sessionId = randomUUID();
		const opts = {
			mode: params.mode,
			workspace: readStringValue(params.workspace)
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
		if (!assertValidParams(params, validateWizardNextParams, "wizard.next", respond)) return;
		const sessionId = params.sessionId;
		const session = findWizardSessionOrRespond({
			context,
			respond,
			sessionId
		});
		if (!session) return;
		const answer = params.answer;
		if (answer) {
			if (session.getStatus() !== "running") {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, "wizard not running"));
				return;
			}
			try {
				await session.answer(answer.stepId ?? "", answer.value);
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
		if (!assertValidParams(params, validateWizardCancelParams, "wizard.cancel", respond)) return;
		const sessionId = params.sessionId;
		const session = findWizardSessionOrRespond({
			context,
			respond,
			sessionId
		});
		if (!session) return;
		session.cancel();
		const status = readWizardStatus(session);
		context.wizardSessions.delete(sessionId);
		respond(true, status, void 0);
	},
	"wizard.status": ({ params, respond, context }) => {
		if (!assertValidParams(params, validateWizardStatusParams, "wizard.status", respond)) return;
		const sessionId = params.sessionId;
		const session = findWizardSessionOrRespond({
			context,
			respond,
			sessionId
		});
		if (!session) return;
		const status = readWizardStatus(session);
		if (status.status !== "running") context.wizardSessions.delete(sessionId);
		respond(true, status, void 0);
	}
};
//#endregion
//#region src/gateway/server-methods.ts
const CONTROL_PLANE_WRITE_METHODS = new Set([
	"config.apply",
	"config.patch",
	"update.run"
]);
function authorizeGatewayMethod(method, client) {
	if (!client?.connect) return null;
	if (method === "health") return null;
	const roleRaw = client.connect.role ?? "operator";
	const role = parseGatewayRole(roleRaw);
	if (!role) return errorShape(ErrorCodes.INVALID_REQUEST, `unauthorized role: ${roleRaw}`);
	const scopes = client.connect.scopes ?? [];
	if (!isRoleAuthorizedForMethod(role, method)) return errorShape(ErrorCodes.INVALID_REQUEST, `unauthorized role: ${role}`);
	if (role === "node") return null;
	if (scopes.includes("operator.admin")) return null;
	const scopeAuth = authorizeOperatorScopesForMethod(method, scopes);
	if (!scopeAuth.allowed) return errorShape(ErrorCodes.INVALID_REQUEST, `missing scope: ${scopeAuth.missingScope}`);
	return null;
}
const coreGatewayHandlers = {
	...connectHandlers,
	...logsHandlers,
	...voicewakeHandlers,
	...healthHandlers,
	...channelsHandlers,
	...chatHandlers,
	...commandsHandlers,
	...cronHandlers,
	...deviceHandlers,
	...diagnosticsHandlers,
	...doctorHandlers,
	...execApprovalsHandlers,
	...webHandlers,
	...modelsHandlers,
	...modelsAuthStatusHandlers,
	...nativeHookRelayHandlers,
	...configHandlers,
	...wizardHandlers,
	...talkHandlers,
	...toolsCatalogHandlers,
	...toolsEffectiveHandlers,
	...ttsHandlers,
	...skillsHandlers,
	...sessionsHandlers,
	...systemHandlers,
	...updateHandlers,
	...nodeHandlers,
	...nodePendingHandlers,
	...pushHandlers,
	...sendHandlers,
	...usageHandlers,
	...agentHandlers,
	...agentsHandlers
};
async function handleGatewayRequest(opts) {
	const { req, respond, client, isWebchatConnect, context } = opts;
	const authError = authorizeGatewayMethod(req.method, client);
	if (authError) {
		respond(false, void 0, authError);
		return;
	}
	if (context.unavailableGatewayMethods?.has(req.method)) {
		respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `${req.method} unavailable during gateway startup`, {
			retryable: true,
			retryAfterMs: 500,
			details: { method: req.method }
		}));
		return;
	}
	if (CONTROL_PLANE_WRITE_METHODS.has(req.method)) {
		const budget = consumeControlPlaneWriteBudget({ client });
		if (!budget.allowed) {
			const actor = resolveControlPlaneActor(client);
			context.logGateway.warn(`control-plane write rate-limited method=${req.method} ${formatControlPlaneActor(actor)} retryAfterMs=${budget.retryAfterMs} key=${budget.key}`);
			respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, `rate limit exceeded for ${req.method}; retry after ${Math.ceil(budget.retryAfterMs / 1e3)}s`, {
				retryable: true,
				retryAfterMs: budget.retryAfterMs,
				details: {
					method: req.method,
					limit: "3 per 60s"
				}
			}));
			return;
		}
	}
	const handler = opts.extraHandlers?.[req.method] ?? coreGatewayHandlers[req.method];
	if (!handler) {
		respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unknown method: ${req.method}`));
		return;
	}
	const invokeHandler = () => handler({
		req,
		params: req.params ?? {},
		client,
		isWebchatConnect,
		respond,
		context
	});
	await withPluginRuntimeGatewayRequestScope({
		context,
		client,
		isWebchatConnect
	}, invokeHandler);
}
//#endregion
//#region src/gateway/server-plugins.ts
const FALLBACK_GATEWAY_CONTEXT_STATE_KEY = Symbol.for("openclaw.fallbackGatewayContextState");
const getFallbackGatewayContextState = () => resolveGlobalSingleton(FALLBACK_GATEWAY_CONTEXT_STATE_KEY, () => ({
	context: void 0,
	resolveContext: void 0
}));
function setFallbackGatewayContextResolver(resolveContext) {
	const fallbackGatewayContextState = getFallbackGatewayContextState();
	fallbackGatewayContextState.resolveContext = resolveContext;
}
function getFallbackGatewayContext() {
	const fallbackGatewayContextState = getFallbackGatewayContextState();
	return fallbackGatewayContextState.resolveContext?.() ?? fallbackGatewayContextState.context;
}
const PLUGIN_SUBAGENT_POLICY_STATE_KEY = Symbol.for("openclaw.pluginSubagentOverridePolicyState");
const getPluginSubagentPolicyState = () => resolveGlobalSingleton(PLUGIN_SUBAGENT_POLICY_STATE_KEY, () => ({ policies: {} }));
function normalizeAllowedModelRef(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	if (trimmed === "*") return "*";
	const slash = trimmed.indexOf("/");
	if (slash <= 0 || slash >= trimmed.length - 1) return null;
	const providerRaw = trimmed.slice(0, slash).trim();
	const modelRaw = trimmed.slice(slash + 1).trim();
	if (!providerRaw || !modelRaw) return null;
	const normalized = normalizeModelRef(providerRaw, modelRaw);
	return `${normalized.provider}/${normalized.model}`;
}
function setPluginSubagentOverridePolicies(cfg) {
	const pluginSubagentPolicyState = getPluginSubagentPolicyState();
	const normalized = normalizePluginsConfig(cfg.plugins);
	const policies = {};
	for (const [pluginId, entry] of Object.entries(normalized.entries)) {
		const allowModelOverride = entry.subagent?.allowModelOverride === true;
		const hasConfiguredAllowlist = entry.subagent?.hasAllowedModelsConfig === true;
		const configuredAllowedModels = entry.subagent?.allowedModels ?? [];
		const allowedModels = /* @__PURE__ */ new Set();
		let allowAnyModel = false;
		for (const modelRef of configuredAllowedModels) {
			const normalizedModelRef = normalizeAllowedModelRef(modelRef);
			if (!normalizedModelRef) continue;
			if (normalizedModelRef === "*") {
				allowAnyModel = true;
				continue;
			}
			allowedModels.add(normalizedModelRef);
		}
		if (!allowModelOverride && !hasConfiguredAllowlist && allowedModels.size === 0 && !allowAnyModel) continue;
		policies[pluginId] = {
			allowModelOverride,
			allowAnyModel,
			hasConfiguredAllowlist,
			allowedModels
		};
	}
	pluginSubagentPolicyState.policies = policies;
}
function authorizeFallbackModelOverride(params) {
	const pluginSubagentPolicyState = getPluginSubagentPolicyState();
	const pluginId = params.pluginId?.trim();
	if (!pluginId) return {
		allowed: false,
		reason: "provider/model override requires plugin identity in fallback subagent runs."
	};
	const policy = pluginSubagentPolicyState.policies[pluginId];
	if (!policy?.allowModelOverride) return {
		allowed: false,
		reason: `plugin "${pluginId}" is not trusted for fallback provider/model override requests. See https://docs.openclaw.ai/tools/plugin#runtime-helpers and search for: plugins.entries.<id>.subagent.allowModelOverride`
	};
	if (policy.allowAnyModel) return { allowed: true };
	if (policy.hasConfiguredAllowlist && policy.allowedModels.size === 0) return {
		allowed: false,
		reason: `plugin "${pluginId}" configured subagent.allowedModels, but none of the entries normalized to a valid provider/model target.`
	};
	if (policy.allowedModels.size === 0) return { allowed: true };
	const requestedModelRef = resolveRequestedFallbackModelRef(params);
	if (!requestedModelRef) return {
		allowed: false,
		reason: "fallback provider/model overrides that use an allowlist must resolve to a canonical provider/model target."
	};
	if (policy.allowedModels.has(requestedModelRef)) return { allowed: true };
	return {
		allowed: false,
		reason: `model override "${requestedModelRef}" is not allowlisted for plugin "${pluginId}".`
	};
}
function resolveRequestedFallbackModelRef(params) {
	if (params.provider && params.model) {
		const normalizedRequest = normalizeModelRef(params.provider, params.model);
		return `${normalizedRequest.provider}/${normalizedRequest.model}`;
	}
	const rawModel = params.model?.trim();
	if (!rawModel || !rawModel.includes("/")) return null;
	const parsed = parseModelRef(rawModel, "");
	if (!parsed?.provider || !parsed.model) return null;
	return `${parsed.provider}/${parsed.model}`;
}
function createSyntheticOperatorClient(params) {
	return {
		connect: {
			minProtocol: 3,
			maxProtocol: 3,
			client: {
				id: GATEWAY_CLIENT_IDS.GATEWAY_CLIENT,
				version: "internal",
				platform: "node",
				mode: GATEWAY_CLIENT_MODES.BACKEND
			},
			role: "operator",
			scopes: params?.scopes ?? ["operator.write"]
		},
		internal: { allowModelOverride: params?.allowModelOverride === true }
	};
}
function hasAdminScope(client) {
	return (Array.isArray(client?.connect?.scopes) ? client.connect.scopes : []).includes(ADMIN_SCOPE$1);
}
function canClientUseModelOverride(client) {
	return hasAdminScope(client) || client?.internal?.allowModelOverride === true;
}
async function dispatchGatewayMethod(method, params, options) {
	const scope = getPluginRuntimeGatewayRequestScope();
	const context = scope?.context ?? getFallbackGatewayContext();
	const isWebchatConnect = scope?.isWebchatConnect ?? (() => false);
	if (!context) throw new Error(`Plugin subagent dispatch requires a gateway request scope (method: ${method}). No scope set and no fallback context available.`);
	let result;
	await handleGatewayRequest({
		req: {
			type: "req",
			id: `plugin-subagent-${randomUUID()}`,
			method,
			params
		},
		client: scope?.client ?? createSyntheticOperatorClient({
			allowModelOverride: options?.allowSyntheticModelOverride === true,
			scopes: options?.syntheticScopes
		}),
		isWebchatConnect,
		respond: (ok, payload, error) => {
			if (!result) result = {
				ok,
				payload,
				error
			};
		},
		context
	});
	if (!result) throw new Error(`Gateway method "${method}" completed without a response.`);
	if (!result.ok) throw new Error(result.error?.message ?? `Gateway method "${method}" failed.`);
	return result.payload;
}
function createGatewaySubagentRuntime() {
	const getSessionMessages = async (params) => {
		const payload = await dispatchGatewayMethod("sessions.get", {
			key: params.sessionKey,
			...params.limit != null && { limit: params.limit }
		});
		return { messages: Array.isArray(payload?.messages) ? payload.messages : [] };
	};
	return {
		async run(params) {
			const scope = getPluginRuntimeGatewayRequestScope();
			const overrideRequested = Boolean(params.provider || params.model);
			const hasRequestScopeClient = Boolean(scope?.client);
			let allowOverride = hasRequestScopeClient && canClientUseModelOverride(scope?.client ?? null);
			let allowSyntheticModelOverride = false;
			if (overrideRequested && !allowOverride && !hasRequestScopeClient) {
				const fallbackAuth = authorizeFallbackModelOverride({
					pluginId: scope?.pluginId,
					provider: params.provider,
					model: params.model
				});
				if (!fallbackAuth.allowed) throw new Error(fallbackAuth.reason);
				allowOverride = true;
				allowSyntheticModelOverride = true;
			}
			if (overrideRequested && !allowOverride) throw new Error("provider/model override is not authorized for this plugin subagent run.");
			const runId = (await dispatchGatewayMethod("agent", {
				sessionKey: params.sessionKey,
				message: params.message,
				deliver: params.deliver ?? false,
				...allowOverride && params.provider && { provider: params.provider },
				...allowOverride && params.model && { model: params.model },
				...params.extraSystemPrompt && { extraSystemPrompt: params.extraSystemPrompt },
				...params.lane && { lane: params.lane },
				...params.lightContext === true && { bootstrapContextMode: "lightweight" },
				idempotencyKey: params.idempotencyKey || randomUUID()
			}, { allowSyntheticModelOverride }))?.runId;
			if (typeof runId !== "string" || !runId) throw new Error("Gateway agent method returned an invalid runId.");
			return { runId };
		},
		async waitForRun(params) {
			const payload = await dispatchGatewayMethod("agent.wait", {
				runId: params.runId,
				...params.timeoutMs != null && { timeoutMs: params.timeoutMs }
			});
			const status = payload?.status;
			if (status !== "ok" && status !== "error" && status !== "timeout") throw new Error(`Gateway agent.wait returned unexpected status: ${status}`);
			return {
				status,
				...typeof payload?.error === "string" && payload.error && { error: payload.error }
			};
		},
		getSessionMessages,
		async getSession(params) {
			return getSessionMessages(params);
		},
		async deleteSession(params) {
			await dispatchGatewayMethod("sessions.delete", {
				key: params.sessionKey,
				deleteTranscript: params.deleteTranscript ?? true
			});
		}
	};
}
function createGatewayNodesRuntime() {
	return {
		async list(params) {
			const payload = await dispatchGatewayMethod("node.list", {});
			const nodes = Array.isArray(payload?.nodes) ? payload.nodes : [];
			return { nodes: params?.connected === true ? nodes.filter((node) => node !== null && typeof node === "object" && node.connected === true) : nodes };
		},
		async invoke(params) {
			return await dispatchGatewayMethod("node.invoke", {
				nodeId: params.nodeId,
				command: params.command,
				...params.params !== void 0 && { params: params.params },
				timeoutMs: params.timeoutMs,
				idempotencyKey: params.idempotencyKey || randomUUID()
			});
		}
	};
}
function createGatewayPluginRegistrationLogger(params) {
	const logger = createPluginRuntimeLoaderLogger();
	if (params?.suppressInfoLogs !== true) return logger;
	return {
		...logger,
		info: (_message) => void 0
	};
}
function loadGatewayPlugins(params) {
	const activationAutoEnabled = params.activationSourceConfig !== void 0 ? applyPluginAutoEnable({
		config: params.activationSourceConfig,
		env: process.env
	}) : void 0;
	const autoEnabled = params.activationSourceConfig !== void 0 ? {
		config: params.cfg,
		changes: activationAutoEnabled?.changes ?? [],
		autoEnabledReasons: params.autoEnabledReasons ?? activationAutoEnabled?.autoEnabledReasons ?? {}
	} : params.autoEnabledReasons !== void 0 ? {
		config: params.cfg,
		changes: [],
		autoEnabledReasons: params.autoEnabledReasons
	} : applyPluginAutoEnable({
		config: params.cfg,
		env: process.env
	});
	const resolvedConfig = autoEnabled.config;
	const pluginIds = params.pluginIds ?? resolveGatewayStartupPluginIds({
		config: resolvedConfig,
		activationSourceConfig: params.activationSourceConfig,
		workspaceDir: params.workspaceDir,
		env: process.env
	});
	if (pluginIds.length === 0) {
		const pluginRegistry = createEmptyPluginRegistry();
		setActivePluginRegistry(pluginRegistry, void 0, "gateway-bindable", params.workspaceDir);
		return {
			pluginRegistry,
			gatewayMethods: [...params.baseMethods]
		};
	}
	const pluginRegistry = loadOpenClawPlugins({
		config: resolvedConfig,
		activationSourceConfig: params.activationSourceConfig ?? params.cfg,
		autoEnabledReasons: autoEnabled.autoEnabledReasons,
		workspaceDir: params.workspaceDir,
		onlyPluginIds: pluginIds,
		logger: createGatewayPluginRegistrationLogger({ suppressInfoLogs: params.suppressPluginInfoLogs }),
		coreGatewayHandlers: params.coreGatewayHandlers,
		runtimeOptions: { allowGatewaySubagentBinding: true },
		preferSetupRuntimeForChannelPlugins: params.preferSetupRuntimeForChannelPlugins
	});
	const pluginMethods = Object.keys(pluginRegistry.gatewayHandlers);
	return {
		pluginRegistry,
		gatewayMethods: Array.from(new Set([...params.baseMethods, ...pluginMethods]))
	};
}
//#endregion
//#region src/gateway/server-plugin-bootstrap.ts
function installGatewayPluginRuntimeEnvironment(cfg) {
	setPluginSubagentOverridePolicies(cfg);
	setGatewaySubagentRuntime(createGatewaySubagentRuntime());
	setGatewayNodesRuntime(createGatewayNodesRuntime());
}
function logGatewayPluginDiagnostics(params) {
	for (const diag of params.diagnostics) {
		const details = [diag.pluginId ? `plugin=${diag.pluginId}` : null, diag.source ? `source=${diag.source}` : null].filter((entry) => Boolean(entry)).join(", ");
		const message = details ? `[plugins] ${diag.message} (${details})` : `[plugins] ${diag.message}`;
		if (diag.level === "error") params.log.error(message);
		else params.log.info(message);
	}
}
function prepareGatewayPluginLoad(params) {
	const activationSourceConfig = params.activationSourceConfig ?? params.cfg;
	const autoEnabled = applyPluginAutoEnable({
		config: activationSourceConfig,
		env: process.env
	});
	const resolvedConfig = autoEnabled.config;
	installGatewayPluginRuntimeEnvironment(resolvedConfig);
	const loaded = loadGatewayPlugins({
		cfg: resolvedConfig,
		activationSourceConfig,
		autoEnabledReasons: autoEnabled.autoEnabledReasons,
		workspaceDir: params.workspaceDir,
		log: params.log,
		coreGatewayHandlers: params.coreGatewayHandlers,
		baseMethods: params.baseMethods,
		pluginIds: params.pluginIds,
		preferSetupRuntimeForChannelPlugins: params.preferSetupRuntimeForChannelPlugins,
		suppressPluginInfoLogs: params.suppressPluginInfoLogs
	});
	params.beforePrimeRegistry?.(loaded.pluginRegistry);
	primeConfiguredBindingRegistry({ cfg: resolvedConfig });
	if ((params.logDiagnostics ?? true) && loaded.pluginRegistry.diagnostics.length > 0) logGatewayPluginDiagnostics({
		diagnostics: loaded.pluginRegistry.diagnostics,
		log: params.log
	});
	return loaded;
}
function loadGatewayStartupPlugins(params) {
	return prepareGatewayPluginLoad({
		...params,
		beforePrimeRegistry: pinActivePluginChannelRegistry
	});
}
function reloadDeferredGatewayPlugins(params) {
	return prepareGatewayPluginLoad({
		...params,
		beforePrimeRegistry: pinActivePluginChannelRegistry
	});
}
//#endregion
export { resolveGatewayReloadSettings as C, roleCanSkipDeviceIdentity as D, parseGatewayRole as E, pruneStaleControlPlaneBuckets as O, diffConfigPaths as S, buildGatewayReloadPlan as T, appendCronRunLog as _, coreGatewayHandlers as a, resolveCronDeliveryPlan as b, listSystemPresence as c, CANVAS_CAPABILITY_TTL_MS as d, buildCanvasScopedHostUrl as f, loadVoiceWakeConfig as g, formatError as h, setFallbackGatewayContextResolver as i, upsertPresence as l, normalizeCanvasScopedUrl as m, prepareGatewayPluginLoad as n, handleGatewayRequest as o, mintCanvasCapabilityToken as p, reloadDeferredGatewayPlugins as r, broadcastPresenceSnapshot as s, loadGatewayStartupPlugins as t, clearNodeWakeState as u, resolveCronRunLogPath as v, startGatewayConfigReloader as w, resolveFailureDestination as x, resolveCronRunLogPruneOptions as y };
