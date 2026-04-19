import { i as formatErrorMessage, n as detectErrorKind } from "./errors-D8p6rxH8.js";
import { a as normalizeNullableString, d as readStringValue, i as normalizeLowercaseStringOrEmpty, l as normalizeOptionalThreadValue, o as normalizeOptionalLowercaseString, r as lowercasePreservingWhitespace, s as normalizeOptionalString, u as normalizeStringifiedOptionalString } from "./string-coerce-BUSzWgUA.js";
import { s as registerUnhandledRejectionHandler } from "./unhandled-rejections-CeMi3POt.js";
import { a as getLogger, i as getChildLogger, o as getResolvedLoggerSettings } from "./logger-D8OnBgBc.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-BNWw3cXT.js";
import { b as truncateUtf16Safe, m as resolveUserPath, s as ensureDir, v as sleep, x as isPlainObject } from "./utils-D5DtWkEu.js";
import { n as defaultRuntime } from "./runtime-Dx7oeLYq.js";
import { t as sanitizeForLog } from "./ansi-Bs_ZZlnS.js";
import { r as runtimeForLogger, t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { n as logAcceptedEnvOption, t as isTruthyEnvValue } from "./env-BiSxzotM.js";
import { n as resolveGlobalSingleton } from "./global-singleton-B80lD-oJ.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { _ as resolveStateDir, i as isNixMode, r as STATE_DIR } from "./paths-Dvv9VRAc.js";
import { n as VERSION, s as resolveRuntimeServiceVersion } from "./version-Bk5OW-rN.js";
import { o as isSecretRef } from "./types.secrets-CeL3gSMO.js";
import { a as logWarn, t as logDebug } from "./logger-BA_TvTc6.js";
import { i as runExec, r as runCommandWithTimeout } from "./exec-BAdwyfxI.js";
import { i as enableTailscaleServe, n as disableTailscaleServe, o as getTailnetHostname, r as enableTailscaleFunnel, t as disableTailscaleFunnel } from "./tailscale-BNpgHmIw.js";
import { t as safeEqualSecret } from "./secret-equal-DqrgJW5g.js";
import { n as pickPrimaryTailnetIPv4, r as pickPrimaryTailnetIPv6 } from "./tailnet-CVzI7jiq.js";
import { _ as resolveRequestClientIp, a as isLoopbackHost, g as resolveHostName, h as resolveGatewayListenHosts, i as isLoopbackAddress, l as isTrustedProxyAddress, m as resolveGatewayBindHost, n as isContainerEnvironment, o as isPrivateOrLoopbackAddress, p as resolveClientIp, r as isLocalishHost, s as isPrivateOrLoopbackHost, t as defaultGatewayBindMode, u as isValidIPv4 } from "./net-lBInRHnX.js";
import { a as createAuthRateLimiter, i as AUTH_RATE_LIMIT_SCOPE_SHARED_SECRET, n as AUTH_RATE_LIMIT_SCOPE_DEVICE_TOKEN, o as normalizeRateLimitClientIp, r as AUTH_RATE_LIMIT_SCOPE_HOOK_AUTH } from "./auth-rate-limit-DrZ1TbNS.js";
import { a as resolveEffectiveSharedGatewayAuth, i as isLocalDirectRequest, n as authorizeHttpGatewayConnect, o as resolveGatewayAuth, r as authorizeWsControlUiGatewayConnect, s as checkBrowserOrigin, t as assertGatewayAuthConfigured } from "./auth-DN1PwXy9.js";
import { t as sameFileIdentity } from "./file-identity-eQApOIDl.js";
import { r as openBoundaryFile } from "./boundary-file-read-DXLy_w6L.js";
import { $ as resolveAgentMaxConcurrent, D as applyConfigOverrides, S as validateConfigObjectWithPlugins, X as normalizeTalkSection, Y as buildTalkConfigResponse, Z as resolveActiveTalkProviderConfig, a as loadConfig, et as resolveSubagentMaxConcurrent, g as writeConfigFile, h as resolveConfigSnapshotHash, i as getRuntimeConfig, l as readConfigFileSnapshot, m as registerConfigWriteListener, o as parseConfigJson5, r as createConfigIO, u as readConfigFileSnapshotForWrite } from "./io-5pxHCi7V.js";
import { i as asOptionalRecord, n as asNullableRecord } from "./record-coerce-Bls3blVy.js";
import { n as ensureControlUiAllowedOriginsForNonLoopbackBind } from "./gateway-control-ui-origins-DBSlcLoG.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { _ as isAcpSessionKey, b as isSubagentSessionKey, c as normalizeAgentId, h as toAgentStoreSessionKey, l as normalizeMainKey, m as toAgentRequestSessionKey, o as classifySessionKeyShape, t as DEFAULT_AGENT_ID, u as resolveAgentIdFromSessionKey, v as isCronRunSessionKey, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { n as normalizeAccountId, r as normalizeOptionalAccountId, t as DEFAULT_ACCOUNT_ID } from "./account-id-j7GeQlaZ.js";
import { i as normalizeChannelId, n as getLoadedChannelPlugin, r as listChannelPlugins, t as getChannelPlugin } from "./registry-Delpa74L.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { i as applyMergePatch } from "./schema-validator-Byqt0Q69.js";
import { n as resolveAgentModelPrimaryValue } from "./model-input-DFbXtnkw.js";
import { a as DEFAULT_IDENTITY_FILENAME, c as DEFAULT_SOUL_FILENAME, d as ensureAgentWorkspace, i as DEFAULT_HEARTBEAT_FILENAME, l as DEFAULT_TOOLS_FILENAME, o as DEFAULT_MEMORY_ALT_FILENAME, p as isWorkspaceSetupCompleted, r as DEFAULT_BOOTSTRAP_FILENAME, s as DEFAULT_MEMORY_FILENAME, t as DEFAULT_AGENTS_FILENAME, u as DEFAULT_USER_FILENAME } from "./workspace-hhTlRYqM.js";
import { _ as resolveAgentConfig, b as resolveAgentWorkspaceDir, g as listAgentIds, h as listAgentEntries, p as resolveSessionAgentId, x as resolveDefaultAgentId, y as resolveAgentDir } from "./agent-scope-KFH9bkHi.js";
import { r as matchesSkillFilter } from "./agent-filter-CYpmR-qt.js";
import { a as normalizePluginsConfig } from "./config-state-CcN3bZ9D.js";
import { r as parseByteSize } from "./zod-schema-BO9ySEsE.js";
import { t as parseDurationMs } from "./parse-duration-DHL2gXIv.js";
import { n as isRestartEnabled } from "./commands.flags-DTSeDvkD.js";
import "./config-Q9XZc_2I.js";
import { n as normalizeDeviceAuthScopes } from "./device-auth-tzV3Kb-2.js";
import { a as getPreauthHandshakeTimeoutMsFromEnv, i as resolveDeviceAuthConnectErrorDetailCode, n as ConnectErrorDetailCodes, o as buildDeviceAuthPayload, r as resolveAuthConnectErrorDetailCode, s as buildDeviceAuthPayloadV3 } from "./client-DkWAat_P.js";
import { i as publicKeyRawBase64UrlFromPem, n as loadOrCreateDeviceIdentity, o as verifyDeviceSignature, r as normalizeDevicePublicKeyBase64Url, t as deriveDeviceIdFromPublicKey } from "./device-identity-TBOlRcQx.js";
import { t as rawDataToString } from "./ws-BjBhlcWu.js";
import { _ as hasGatewayClientCap, a as isOperatorUiClient, c as isGatewayMessageChannel, h as GATEWAY_CLIENT_MODES, m as GATEWAY_CLIENT_IDS, n as isGatewayCliClient, o as isWebchatClient, p as GATEWAY_CLIENT_CAPS, s as isDeliverableMessageChannel, t as isBrowserOperatorUiClient, u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import "./message-channel-core-BIZsQ6dr.js";
import { t as normalizeDeviceMetadataForAuth } from "./device-metadata-normalization-uht6PgV2.js";
import { $ as validateNodeInvokeParams, $t as validateWizardNextParams, A as validateCronRunParams, At as validateSessionsMessagesUnsubscribeParams, Bt as validateSkillsSearchParams, C as validateConfigSchemaLookupResult, Ct as validateSessionsCompactionGetParams, D as validateCronAddParams, Dt as validateSessionsDeleteParams, E as validateConnectParams, Et as validateSessionsCreateParams, F as validateDevicePairListParams, Ft as validateSessionsSendParams, G as validateExecApprovalsNodeGetParams, Gt as validateTalkSpeakParams, H as validateExecApprovalRequestParams, Ht as validateSkillsUpdateParams, I as validateDevicePairRejectParams, It as validateSessionsUsageParams, J as validateLogsTailParams, Jt as validateUpdateRunParams, K as validateExecApprovalsNodeSetParams, Kt as validateToolsCatalogParams, L as validateDevicePairRemoveParams, Lt as validateSkillsBinsParams, M as validateCronStatusParams, Mt as validateSessionsPreviewParams, N as validateCronUpdateParams, Nt as validateSessionsResetParams, O as validateCronListParams, Ot as validateSessionsListParams, P as validateDevicePairApproveParams, Pt as validateSessionsResolveParams, Q as validateNodeEventParams, Qt as validateWizardCancelParams, R as validateDeviceTokenRevokeParams, Rt as validateSkillsDetailParams, S as validateConfigSchemaLookupParams, St as validateSessionsCompactionBranchParams, T as validateConfigSetParams, Tt as validateSessionsCompactionRestoreParams, U as validateExecApprovalResolveParams, Ut as validateTalkConfigParams, V as validateExecApprovalGetParams, Vt as validateSkillsStatusParams, W as validateExecApprovalsGetParams, Wt as validateTalkModeParams, X as validateModelsListParams, Xt as validateWebLoginStartParams, Y as validateMessageActionParams, Yt as validateWakeParams, Z as validateNodeDescribeParams, Zt as validateWebLoginWaitParams, _t as validateSecretsResolveParams, a as validateAgentsCreateParams, an as parseSessionLabel, at as validateNodePairRequestParams, b as validateConfigGetParams, bt as validateSessionsAbortParams, c as validateAgentsFilesListParams, ct as validateNodePendingDrainParams, d as validateAgentsUpdateParams, dt as validatePluginApprovalRequestParams, en as validateWizardStartParams, et as validateNodeInvokeResultParams, f as validateChannelsLogoutParams, ft as validatePluginApprovalResolveParams, ht as validateRequestFrame, i as validateAgentWaitParams, in as COMMAND_DESCRIPTION_MAX_LENGTH, it as validateNodePairRejectParams, j as validateCronRunsParams, jt as validateSessionsPatchParams, k as validateCronRemoveParams, kt as validateSessionsMessagesSubscribeParams, l as validateAgentsFilesSetParams, lt as validateNodePendingEnqueueParams, mt as validatePushTestParams, n as validateAgentIdentityParams, nn as ErrorCodes, nt as validateNodePairApproveParams, o as validateAgentsDeleteParams, ot as validateNodePairVerifyParams, p as validateChannelsStatusParams, pt as validatePollParams, q as validateExecApprovalsSetParams, qt as validateToolsEffectiveParams, r as validateAgentParams, rn as errorShape, rt as validateNodePairListParams, s as validateAgentsFilesGetParams, st as validateNodePendingAckParams, t as formatValidationErrors, tn as validateWizardStatusParams, tt as validateNodeListParams, u as validateAgentsListParams, ut as validateNodeRenameParams, v as validateCommandsListParams, vt as validateSecretsResolveResult, w as validateConfigSchemaParams, wt as validateSessionsCompactionListParams, x as validateConfigPatchParams, xt as validateSessionsCompactParams, y as validateConfigApplyParams, yt as validateSendParams, z as validateDeviceTokenRotateParams, zt as validateSkillsInstallParams } from "./protocol-C6T5DFc8.js";
import { a as normalizeInputProvenance } from "./input-provenance-BIw3ISWS.js";
import { a as approvalDecisionLabel, n as MAX_PLUGIN_APPROVAL_TIMEOUT_MS, o as buildPluginApprovalExpiredMessage, s as buildPluginApprovalRequestMessage, t as DEFAULT_PLUGIN_APPROVAL_TIMEOUT_MS } from "./plugin-approvals-B00c1v1-.js";
import { c as PAIRING_SCOPE, d as WRITE_SCOPE, i as isNodeRoleMethod, l as READ_SCOPE, n as authorizeOperatorScopesForMethod, o as ADMIN_SCOPE$1, s as APPROVALS_SCOPE$1, t as CLI_DEFAULT_OPERATOR_SCOPES, u as TALK_SECRETS_SCOPE } from "./method-scopes-D3xbsVVt.js";
import { n as formatConfigIssueLines } from "./issue-format-EKtDEAmx.js";
import { n as pickBestEffortPrimaryLanIPv4 } from "./network-discovery-display-CXEbPtF0.js";
import { i as resolveAssistantAvatarUrl, r as normalizeControlUiBasePath } from "./control-ui-shared-DLBboEro.js";
import { t as hasAnyAuthProfileStoreSource } from "./source-check-D7Bxh6-e.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-BbVfCcz-.js";
import { r as loadOpenClawPlugins, v as disposeRegisteredAgentHarnesses } from "./loader-DYW2PvbF.js";
import { B as resolveMemoryLightDreamingConfig, F as resolveMemoryDeepDreamingConfig, I as resolveMemoryDreamingConfig, L as resolveMemoryDreamingPluginConfig, N as isSameMemoryDreamingDay, V as resolveMemoryRemDreamingConfig, z as resolveMemoryDreamingWorkspaces } from "./dreaming-BHkWSJTy.js";
import { n as resolveChannelApprovalCapability, t as resolveChannelApprovalAdapter } from "./plugins-D4ODSIPT.js";
import { s as getPluginCommandSpecs } from "./command-registration-BkSkbo2n.js";
import { o as runGlobalGatewayStopSafely, t as getGlobalHookRunner } from "./hook-runner-global-CYvQf43U.js";
import { f as registerInternalHook, h as unregisterInternalHook, i as hasInternalHookListeners, m as triggerInternalHook, n as createInternalHookEvent, p as setInternalHooksEnabled } from "./internal-hooks-4i4Rq3Qq.js";
import { i as canonicalizePathVariant, n as PROTECTED_PLUGIN_ROUTE_PREFIXES, r as canonicalizePathForSecurity } from "./http-route-overlap-CZjpP4j6.js";
import { b as createEmptyPluginRegistry, f as releasePinnedPluginChannelRegistry, l as pinActivePluginChannelRegistry, p as releasePinnedPluginHttpRouteRegistry, r as getActivePluginRegistry, u as pinActivePluginHttpRouteRegistry, v as resolveActivePluginHttpRouteRegistry, y as setActivePluginRegistry } from "./runtime-BB1a2aCy.js";
import { n as withPluginRuntimeGatewayRequestScope, t as getPluginRuntimeGatewayRequestScope } from "./gateway-request-scope-Dkin09LL.js";
import "./logging-DW_bR-rY.js";
import { r as createPluginRuntimeLoaderLogger } from "./load-context-HY3FwKJn.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import { t as ensureOpenClawModelsJson } from "./models-config-CkfuLe-V.js";
import { a as getModelRefStatus, c as resolveConfiguredModelRef, l as resolveHooksGmailModel, m as parseModelRef, o as normalizeModelSelection, p as normalizeModelRef, s as resolveAllowedModelRef, t as isCliProvider } from "./model-selection-cli-_3Gn8Wcd.js";
import { a as normalizeElevatedLevel, c as normalizeThinkLevel, d as normalizeVerboseLevel, n as formatXHighModelHint, o as normalizeFastMode, s as normalizeReasoningLevel, u as normalizeUsageDisplay } from "./thinking.shared-CAbk7EZs.js";
import { a as getModelRefStatus$1, d as resolveConfiguredModelRef$1, f as resolveDefaultModelForAgent, l as resolveAllowedModelRef$1, p as resolveHooksGmailModel$1, t as buildAllowedModelSet, x as resolveThinkingDefault, y as resolveSubagentConfiguredModelSelection } from "./model-selection-CTdyYoio.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-DqcJmob1.js";
import { r as loadModelCatalog } from "./model-catalog-CdCqmHkW.js";
import { n as resolveAgentIdentity } from "./identity-B_Q39IGW.js";
import { c as updateSessionStore, l as updateSessionStoreEntry, t as archiveRemovedSessionTranscripts } from "./store-DFXcceZJ.js";
import { i as resolveMainSessionKey, n as resolveAgentMainSessionKey, r as resolveExplicitAgentSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-DtefsIzj.js";
import { n as resolveMainSessionKeyFromConfig, t as extractDeliveryInfo } from "./sessions-vP2E4vs-.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath, l as resolveSessionTranscriptsDirForAgent, o as resolveSessionTranscriptPath, u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { l as setSessionRuntimeModel, n as mergeSessionEntry } from "./types-KCfeTvaK.js";
import { n as cleanStaleLockFiles } from "./session-write-lock-CcI4KSH8.js";
import { n as readJsonFile, r as writeJsonAtomic, t as createAsyncLock } from "./json-files-L0zR3LSb.js";
import { a as normalizeSessionDeliveryFields, i as normalizeDeliveryContext, r as mergeDeliveryContext, t as deliveryContextFromSession } from "./delivery-context.shared-EClQPjt-.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { n as onSessionTranscriptUpdate } from "./transcript-events-CdRuhFsO.js";
import { t as parseSessionThreadInfo } from "./thread-info-DA0w7q1W.js";
import { i as resolveAgentSessionDirs } from "./targets-Cxfatkj9.js";
import { n as sleepWithAbort, t as computeBackoff } from "./backoff-DdY2WS-F.js";
import { n as getLatestSubagentRunByChildSessionKey } from "./subagent-registry-read-DayKoqcW.js";
import { o as startGatewayModelPricingRefresh } from "./usage-format-2BthAt-J.js";
import { a as loadSessionEntry, c as resolveFreshestSessionEntryFromStoreKeys, f as resolveSessionModelRef, i as loadGatewaySessionRow, l as resolveGatewayModelSupportsImages, n as listSessionsFromStore, o as migrateAndPruneGatewaySessionStoreKey, p as canonicalizeSpawnedByForAgent, r as loadCombinedSessionStoreForGateway, t as listAgentsForGateway, u as resolveGatewaySessionStoreTarget } from "./session-utils-hDe0hdis.js";
import { n as deriveSessionTotalTokens, r as hasNonzeroUsage } from "./usage-CDsCClku.js";
import { a as readSessionPreviewItemsFromTranscript, i as readSessionMessages, t as attachOpenClawTranscriptMeta } from "./session-utils.fs-BtTrNS1L.js";
import { r as stripInlineDirectiveTagsForDisplay } from "./directive-tags-_9B0F8vD.js";
import { a as resolveSessionTranscriptCandidates, i as cleanupArchivedSessionTranscripts, t as archiveFileOnDisk } from "./session-transcript-files.fs-bPixE_A8.js";
import { dt as getSessionCompactionCheckpoint, ft as listSessionCompactionCheckpoints } from "./model-context-tokens-z5hvDVkk.js";
import { n as isDiagnosticsEnabled } from "./diagnostic-events-P3w1ZgD_.js";
import { t as CommandLane } from "./lanes-CU7Ll8dR.js";
import { i as enqueueCommandInLane, s as getTotalQueueSize, u as setCommandLaneConcurrency } from "./command-queue-BLDIg9zn.js";
import { m as resolveEmbeddedAgentRuntime } from "./attempt.tool-run-context-CgVg2Nu2.js";
import { n as SILENT_REPLY_TOKEN, o as startsWithSilentToken, s as stripLeadingSilentToken } from "./tokens-CKM4Lddu.js";
import { s as stripHeartbeatToken } from "./heartbeat-DYyKvnDp.js";
import { n as resolveNormalizedAccountEntry, t as resolveAccountEntry } from "./account-lookup-ZCs8AOJr.js";
import { t as getMachineDisplayName } from "./machine-name-dWhRKMd-.js";
import { t as detectMime } from "./mime-B6nXlmtY.js";
import { d as PROFILE_OPTIONS, m as resolveCoreToolProfiles, p as listCoreToolSections } from "./tool-policy-C3rJHw58.js";
import { d as resolvePluginTools, u as getPluginToolMeta } from "./channel-tools-DdZyHuyK.js";
import { C as synthesizeSpeech, S as setTtsProvider, b as setTtsEnabled, c as isTtsEnabled, f as resolveExplicitTtsOverrides, g as resolveTtsProviderOrder, h as resolveTtsPrefsPath, i as getResolvedSpeechProviderConfig, l as isTtsProviderConfigured, m as resolveTtsConfig, o as getTtsProvider, p as resolveTtsAutoMode, w as textToSpeech } from "./tts-m-RAIr7w.js";
import { n as compactEmbeddedPiSession, r as selectAgentHarness } from "./pi-embedded-runner-DN0VbqlW.js";
import { i as supportsXHighThinking, t as formatThinkingLevels } from "./thinking-CtJu90cp.js";
import { o as resolveFailoverReasonFromError } from "./failover-error-CqpA2cGv.js";
import "./auth-profiles-BQEgLpFI.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import { t as SsrFBlockedError } from "./ssrf-DoOclwFS.js";
import { n as createOutboundPayloadPlan, s as projectOutboundPayloadPlanForMirror, t as deliverOutboundPayloads } from "./deliver-BNvlWd4P.js";
import { c as getAgentRunContext, d as sweepStaleRunContexts, l as onAgentEvent, t as clearAgentRunContext, u as registerAgentRunContext } from "./agent-events-BLJ1mmc3.js";
import { a as normalizeCronJobCreate, o as normalizeCronJobInput, s as normalizeCronJobPatch } from "./openclaw-tools-CUmYpN1l.js";
import { t as loadGatewayTlsRuntime$1 } from "./gateway-BRe0gTJ4.js";
import { T as resolveExecApprovalRequestAllowedDecisions, _ as normalizeExecTarget, d as mergeExecApprovalsSocketDefaults, j as saveExecApprovals, o as ensureExecApprovals, p as normalizeExecApprovals, r as DEFAULT_EXEC_APPROVAL_TIMEOUT_MS, w as resolveExecApprovalAllowedDecisions, y as readExecApprovalsSnapshot } from "./exec-approvals-DqhUu-iS.js";
import { g as writeFileWithinRoot, s as openFileWithinRoot, t as SafeOpenError, u as readFileWithinRoot } from "./fs-safe-B7mHodgb.js";
import { a as prepareSecretsRuntimeSnapshot, i as getActiveSecretsRuntimeSnapshot, n as clearSecretsRuntimeSnapshot, t as activateSecretsRuntimeSnapshot } from "./runtime-gQZrOSl1.js";
import { i as parseAbsoluteTimeMs } from "./stagger-BQdF8pte.js";
import { n as assertSafeCronSessionTargetId, r as isInvalidCronSessionTargetIdError, t as normalizeHttpWebhookUrl } from "./webhook-url-7OFcgnY_.js";
import { a as summarizeRestartSentinel, n as formatDoctorNonInteractiveHint, r as formatRestartSentinelMessage, s as writeRestartSentinel, t as consumeRestartSentinel } from "./restart-sentinel-vSI_SrJz.js";
import { c as setPreRestartDeferralCheck, n as deferGatewayRestartUntilIdle, o as scheduleGatewaySigusr1Restart, r as emitGatewayRestart, s as setGatewaySigusr1RestartPolicy } from "./restart-Bh5n8icp.js";
import { t as collectEnabledInsecureOrDangerousFlags } from "./dangerous-config-flags-BeNW1WAK.js";
import { r as cleanOldMedia } from "./store-CFeRgpZO.js";
import { a as CANVAS_HOST_PATH, c as injectCanvasLiveReload, l as normalizeUrlPath, s as handleA2uiHttpRequest, u as resolveFileWithinRoot } from "./web-media-B2LIgj-X.js";
import { i as isKnownSecretTargetId } from "./target-registry-CziBPyjo.js";
import { n as collectCommandSecretAssignmentsFromSnapshot } from "./command-secret-gateway-D1MBXqwF.js";
import { i as evaluateGatewayAuthSurfaceStates, r as GATEWAY_AUTH_SURFACE_PATHS } from "./runtime-web-tools-Du9DydCq.js";
import { i as resolveOutboundSessionRoute, l as dispatchChannelMessageAction, o as resetDirectoryCache, r as ensureOutboundSessionEntry } from "./message-action-runner-D-yK04iK.js";
import { n as normalizePollInput } from "./polls-C5l4CbhI.js";
import { n as resolveOutboundChannelPlugin } from "./channel-resolution-DhbJUhMK.js";
import { n as resolveMessageChannelSelection } from "./channel-selection-CnZBjflX.js";
import { t as maybeResolveIdLikeTarget } from "./target-id-resolution-B8eetcJ_.js";
import { l as failDelivery, o as ackDelivery, s as enqueueDelivery } from "./delivery-queue-CDEI8gW6.js";
import { i as resolveReplyToMode } from "./reply-threading-CUDkwBEF.js";
import { t as buildOutboundSessionContext } from "./session-context--WJ2aq2e.js";
import { r as resolveOutboundTarget } from "./targets-DbBSGhxR.js";
import { t as extractToolPayload } from "./tool-payload-me2TXyhW.js";
import { i as setHeartbeatsEnabled, n as requestHeartbeatNow } from "./heartbeat-wake-a3GAt85y.js";
import { i as enqueueSystemEvent, o as isSystemEventContextChanged } from "./system-events-Dq_M0n12.js";
import { a as createRunningTaskRun, o as failTaskRunByRunId, r as completeTaskRunByRunId } from "./task-executor-ZyzAPL-M.js";
import { _ as cleanupBrowserSessionsForLifecycleEnd, h as onSessionLifecycleEvent, o as initSubagentRegistry, p as scheduleSubagentOrphanRecovery, y as movePathToTrash } from "./subagent-registry-BrNWizSY.js";
import { r as clearSessionQueues } from "./queue-bNmQjdDV.js";
import { n as shouldDowngradeDeliveryToSessionOnly } from "./best-effort-delivery-DEVL8mXn.js";
import { a as isEmbeddedPiRunActive, f as waitForEmbeddedPiRunEnd, r as getActiveEmbeddedRunCount, t as abortEmbeddedPiRun } from "./runs-D-CeEXwD.js";
import { h as stopDiagnosticHeartbeat, m as startDiagnosticHeartbeat } from "./diagnostic-C-cec-ak.js";
import { t as applyModelOverrideToSessionEntry } from "./model-overrides-BEFWLg94.js";
import { t as resolveAgentTimeoutMs } from "./timeout-CxW3WOrq.js";
import { n as normalizeSpawnedRunMetadata, r as resolveIngressWorkspaceOverrideForSpawnedRun } from "./spawned-context-D7kox5Yj.js";
import { c as resolveHookExternalContentSource, o as isExternalHookSession, s as mapHookExternalContentSource } from "./external-content-Ds7ZVhiZ.js";
import { _ as verifyNodeToken, a as recordRemoteNodeInfo, b as registerSkillsChangeListener, c as removeRemoteNodeInfo, d as getPairedNode, f as listNodePairing, g as updatePairedNodeMetadata, h as requestNodePairing, i as primeRemoteSkillsCache, l as setSkillsRemoteRegistry, m as renamePairedNode, o as refreshRemoteBinsForConnectedNodes, p as rejectNodePairing, r as getRemoteSkillEligibility, s as refreshRemoteNodeBins, t as canExecRequestNode, u as approveNodePairing, v as bumpSkillsSnapshotVersion } from "./exec-defaults-DiCDZt_n.js";
import { s as loadWorkspaceSkillEntries } from "./skills-Cwx5TftI.js";
import { n as hasBinary } from "./config-eval-A4HeiCWe.js";
import { t as listAgentWorkspaceDirs } from "./workspace-dirs-BwQC27rz.js";
import { c as roleScopesAllow, o as resolveMissingRequestedScope } from "./pairing-token-BHGGVFL2.js";
import { n as resolveCronStyleNow } from "./current-time-DumgMhEz.js";
import { n as getActiveMemorySearchManager, r as resolveActiveMemoryBackendConfig } from "./memory-runtime-CiqkZxJP.js";
import { t as resolveMemorySearchConfig } from "./memory-search-ABYPOqC9.js";
import { t as resolveModel } from "./model-Bl_gU5g0.js";
import { o as resolvePreferredSessionKeyForSessionIdMatches } from "./live-model-switch-DHqPme9r.js";
import "./pi-embedded-B2iivREJ.js";
import { i as resolveChannelDefaultAccountId } from "./helpers-D33sU6YZ.js";
import { n as getAcpSessionManager } from "./manager-CECGVjs9.js";
import { t as primeConfiguredBindingRegistry } from "./binding-registry-ebIwre-S.js";
import { r as listPluginCommands } from "./commands-7eF4g_YK.js";
import { n as createPluginRuntime, r as setGatewaySubagentRuntime } from "./runtime-DsTkcmtk.js";
import { r as listChatCommandsForConfig } from "./commands-registry-list-MHrd1pp9.js";
import "./commands-registry-CxFYC-Xg.js";
import { o as getTotalPendingReplies } from "./dispatch-JNo_iJw5.js";
import { n as resolveSendPolicy, t as normalizeSendPolicy } from "./send-policy-DyHi525p.js";
import { n as sanitizeInboundSystemTags } from "./inbound-text-Mk2PQPNo.js";
import { t as getChannelActivity } from "./channel-activity-wdY_AZ6a.js";
import { t as WizardCancelledError } from "./prompts-CKJesNrH.js";
import { t as matchesApprovalRequestFilters } from "./approval-request-filters-BVMe8VKV.js";
import { c as formatExecApprovalExpiresIn, f as resolveExecApprovalInitiatingSurfaceState } from "./exec-approval-reply-D_dFeWJb.js";
import { t as CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY } from "./approval-handler-adapter-runtime-DsqnmV0W.js";
import { n as sanitizeExecApprovalDisplayText, t as resolveExecApprovalCommandDisplay } from "./exec-approval-command-display-BXRwRjXB.js";
import { n as createChannelApprovalHandlerFromCapability } from "./approval-handler-runtime-CJW-KAHO.js";
import { i as watchChannelRuntimeContexts, n as getChannelRuntimeContext, t as createTaskScopedChannelRuntime } from "./channel-runtime-context-DxAKMY0E.js";
import { i as buildPluginApprovalResolvedReplyPayload, n as buildApprovalResolvedReplyPayload, r as buildPluginApprovalPendingReplyPayload, t as buildApprovalPendingReplyPayload } from "./approval-renderers-DSWkm9Nh.js";
import { n as resolveCronStorePath, r as saveCronStore, t as loadCronStore } from "./store-D3Z4dh89.js";
import { t as normalizeGroupActivation } from "./group-activation-DL8r3H_X.js";
import { n as shouldApplyStartupContext, r as buildBareSessionResetPrompt, t as buildSessionStartupContextPrelude } from "./startup-context-DVdfqRzB.js";
import { i as onHeartbeatEvent, r as getLastHeartbeatEvent, t as resolveHeartbeatVisibility } from "./heartbeat-visibility-K-nKdcA-.js";
import { r as mergeIdentityMarkdownContent } from "./identity-file-DQ369w5A.js";
import { n as resolveAgentOutboundIdentity } from "./identity-zKl_6vuv.js";
import { n as createOutboundSendDeps, t as createDefaultDeps } from "./deps-wxTK-yVM.js";
import { i as parseVerboseOverride, n as applyVerboseOverride, r as parseTraceOverride, t as applyTraceOverride } from "./level-overrides-BTUPvbOt.js";
import { r as agentCommandFromIngress } from "./agent-command-BExkctFj.js";
import "./refresh-CKrDWMET.js";
import { n as getSpeechProvider, r as listSpeechProviders, t as canonicalizeSpeechProviderId } from "./provider-registry-CasPS0mm.js";
import { i as resolveNodeCommandAllowlist, n as isNodeCommandAllowed, r as normalizeDeclaredNodeCommands } from "./node-command-policy-inCkRZGC.js";
import { i as summarizeAgentEventForWsLog, n as logWs, r as shouldLogWs, t as formatForLog } from "./ws-log-DHlv01OL.js";
import { a as respondUnavailableOnNodeInvokeError, i as respondInvalidParams, n as mergeGatewayAuthConfig, o as respondUnavailableOnThrow, r as mergeGatewayTailscaleConfig, s as safeParseJson, t as ensureGatewayStartupAuth } from "./startup-auth-DJG2oyd0.js";
import { t as listSkillCommandsForAgents } from "./skill-commands-B4VgKCRw.js";
import { r as resolveBootstrapProfileScopesForRole } from "./device-bootstrap-profile-TTjBZgaz.js";
import { _ as verifyDeviceToken, a as getPairedDevice, c as listDevicePairing, d as removePairedDevice, f as requestDevicePairing, g as updatePairedDeviceMetadata, h as summarizeDeviceTokens, i as formatDevicePairingForbiddenMessage, l as listEffectivePairedDeviceRoles, m as rotateDeviceToken, n as approveDevicePairing, o as hasEffectivePairedDeviceRole, p as revokeDeviceToken, r as ensureDeviceToken, s as listApprovedPairedDeviceRoles, t as approveBootstrapDevicePairing, u as rejectDevicePairing } from "./device-pairing-CItl9tqB.js";
import { a as redeemDeviceBootstrapTokenProfile, n as getBoundDeviceBootstrapProfile, o as revokeDeviceBootstrapToken, r as getDeviceBootstrapTokenProfile, s as verifyDeviceBootstrapToken } from "./device-bootstrap-kDmW6U4r.js";
import { n as PROVIDER_LABELS, o as resolveUsageProviderId } from "./provider-usage.shared-B28ujaJI.js";
import "./agent-di24oUD8.js";
import { n as shouldIncludeHook } from "./config-DiksYOxU.js";
import { a as matchSystemRunApprovalBinding, c as toSystemRunApprovalMismatchError, i as buildSystemRunApprovalEnvBinding, n as resolveSystemRunCommandRequest, o as missingSystemRunApprovalBinding, r as buildSystemRunApprovalBinding } from "./system-run-command-DcrhRPh-.js";
import { n as resolveSystemRunApprovalRequestContext, r as resolveSystemRunApprovalRuntimeContext } from "./system-run-approval-context-DpbU1NLz.js";
import { t as closeMcpLoopbackServer } from "./mcp-http-LDZ2tv6U.js";
import { A as isSessionKeyAllowedByPrefix, B as resolveHookTargetAgentId, D as getHookChannelError, E as getHookAgentPolicyError, F as readJsonBody, H as applyHookMappings, I as resolveHookChannel, L as resolveHookDeliver, M as normalizeHookDispatchSessionKey, N as normalizeHookHeaders, O as getHookSessionKeyPrefixError, P as normalizeWakePayload, R as resolveHookIdempotencyKey, T as extractHookToken, U as resolveFunctionModuleExport, V as resolveHooksConfig, _ as sendGatewayAuthFailure, a as getHeader, h as loadGatewayModelCatalog, i as getBearerToken, j as normalizeAgentPayload, k as isHookAgentAllowed, l as resolveHttpBrowserOriginPolicy, m as __resetModelCatalogCacheForTest, p as resolveTrustedHttpOperatorScopes, r as authorizeGatewayHttpRequestOrReply, x as setDefaultSecurityHeaders, z as resolveHookSessionKey } from "./http-utils-C26ZfE50.js";
import { t as createOutboundSendDeps$1 } from "./outbound-send-deps-_zJaZ2sJ.js";
import { n as resolveAgentOutboundTarget, t as resolveAgentDeliveryPlan } from "./agent-delivery-B37QfGTz.js";
import { t as buildWorkspaceSkillStatus } from "./skills-status-14tfyk-L.js";
import { t as loadProviderUsageSummary } from "./provider-usage-oBu2dhSm.js";
import { n as summarizeToolDescriptionText } from "./tool-description-summary-BwoRppmd.js";
import { t as resolveEffectiveToolInventory } from "./tools-effective-inventory-DOjkKVsP.js";
import { o as fetchClawHubSkillDetail } from "./clawhub-C1bALXwq.js";
import { a as loadSessionUsageTimeSeries, n as loadCostUsageSummary, o as resolveExistingUsageSessionFile, r as loadSessionCostSummary, t as discoverAllSessions } from "./session-cost-usage-DsNok5Xd.js";
import { n as buildAuthHealthSummary, r as formatRemainingShort } from "./auth-health-DH87yfrD.js";
import { a as performGatewaySessionReset } from "./session-reset-service-CtEfNV5U.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-Dvsz16UG.js";
import { m as normalizeUpdateChannel, n as compareSemverStrings, o as resolveNpmChannelTag, t as checkUpdateStatus } from "./update-check-D1kBnXD1.js";
import { a as removeBackfillDiaryEntries, c as writeBackfillDiaryEntries, n as dedupeDreamDiaryEntries, o as removeGroundedShortTermCandidates, r as previewGroundedRemMarkdown, s as repairDreamingArtifacts } from "./memory-core-bundled-runtime-Bnivcr2k.js";
import { t as buildChannelUiCatalog } from "./catalog-DZDl9vtb.js";
import { a as resolveGatewayStartupPluginIds, r as resolveConfiguredDeferredChannelPluginIds } from "./channel-plugin-ids-BcTtylrM.js";
import { a as redactConfigSnapshot, i as redactConfigObject, o as restoreRedactedValues, r as lookupConfigSchema, t as loadGatewayRuntimeConfigSchema } from "./runtime-schema-BpoRdXIq.js";
import { a as writeWideAreaGatewayZone, i as resolveWideAreaDiscoveryDomain } from "./widearea-dns-XF4Yk8dn.js";
import { a as resolveControlUiRootOverrideSync, n as isPackageProvenControlUiRootSync, o as resolveControlUiRootSync, t as ensureControlUiAssetsBuilt } from "./control-ui-assets-CISH9MR3.js";
import { t as GatewayLockError } from "./gateway-lock-BuBm_oza.js";
import { t as loadWorkspaceHookEntries } from "./workspace-CfZ_y9Xe.js";
import { t as readConfiguredLogTail } from "./log-tail-w-6991LA.js";
import { o as pruneAgentConfig, r as findAgentEntryIndex, t as applyAgentConfig } from "./agents.config-CmizwtRC.js";
import { n as getHealthSnapshot } from "./health-DkBRBZ7f.js";
import { t as installSkill } from "./skills-install-UJ7CzO48.js";
import { n as runChannelPluginStartupMaintenance, r as runGatewayUpdate, t as normalizeCronJobIdentityFields } from "./normalize-job-identity-BeFZDaOX.js";
import { i as migrateOrphanedSessionKeys } from "./state-migrations-BX2zZL8e.js";
import { t as runSetupWizard } from "./setup-C-q0qjkR.js";
import "./status-EfLmpl9m.js";
import { t as getStatusSummary } from "./status.summary-C8rTIha0.js";
import { d as startTaskRegistryMaintenance, f as stopTaskRegistryMaintenance, g as markCronJobActive, h as clearCronJobActive, n as getInspectableTaskRegistrySummary } from "./task-registry.maintenance-0PRPxfex.js";
import { i as updateSkillsFromClawHub, r as searchSkillsFromClawHub, t as installSkillFromClawHub } from "./skills-clawhub-DFZMlVmw.js";
import { T as resolveGmailHookRuntimeConfig, _ as buildGogWatchServeLogArgs, g as buildGogWatchServeArgs, i as ensureTailscaleEndpoint, v as buildGogWatchStartArgs } from "./gmail-setup-utils-Qcl8wthC.js";
import { t as buildChannelAccountSnapshot } from "./status-BTVRNoOc.js";
import { _ as resolveDeliveryTarget, a as computeJobPreviousRunAtMs, c as findJobOrThrow, d as isJobEnabled, f as nextWakeAtMs, g as resolveJobPayloadTextForMain, h as recordScheduleComputeError, i as computeJobNextRunAtMs, l as hasScheduledNextRunAtMs, m as recomputeNextRunsForMaintenance, n as applyJobPatch, o as createJob, p as recomputeNextRuns, r as assertSupportedJobSpec, s as errorBackoffMs, t as DEFAULT_ERROR_BACKOFF_SCHEDULE_MS, u as isJobDue } from "./jobs-ESUow8Zg.js";
import { a as resolveHeartbeatAckMaxChars$1, i as resolveCronPayloadOutcome, t as isHeartbeatOnlyResponse } from "./helpers-CYnU2_ru.js";
import { n as markCronSessionPreRun, r as persistCronSkillsSnapshotIfChanged, t as createPersistCronSessionEntry } from "./run-session-state-NJBSDS3i.js";
import { n as resolveAssistantIdentity } from "./assistant-identity-e1Z3sdug.js";
import { a as resolveApnsAuthConfigFromEnv, c as sendApnsExecApprovalAlert, d as resolveApnsRelayConfigFromEnv, l as sendApnsExecApprovalResolvedWake, n as loadApnsRegistration, o as sendApnsAlert, r as normalizeApnsEnvironment, s as sendApnsBackgroundWake, t as clearApnsRegistrationIfCurrent, u as shouldClearStoredApnsRegistration } from "./push-apns-BqDhtMZr.js";
import { n as MediaOffloadError, r as parseMessageWithAttachments, t as normalizeRpcAttachmentsToChatAttachments } from "./attachment-normalize-fsjzmyqL.js";
import { a as resolveCronSession, n as runHeartbeatOnce, r as startHeartbeatRunner } from "./heartbeat-runner-CInrztfM.js";
import { _ as injectTimestamp, a as DEDUPE_TTL_MS, c as MAX_PAYLOAD_BYTES, d as isSuppressedControlReplyLeadFragment, f as isSuppressedControlReplyText, g as waitForTerminalGatewayDedupe, h as setGatewayDedupeEntry, i as DEDUPE_MAX, l as MAX_PREAUTH_PAYLOAD_BYTES, m as readTerminalSnapshotFromGatewayDedupe, n as chatHandlers, o as HEALTH_REFRESH_INTERVAL_MS, p as abortChatRunById, s as MAX_BUFFERED_BYTES, u as TICK_INTERVAL_MS, v as timestampOptsFromConfig } from "./chat-CMSNlsvD.js";
import { t as truncateCloseReason } from "./close-reason-ywLfEv2I.js";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import * as fsSync from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { execFile, spawn, spawnSync } from "node:child_process";
import os from "node:os";
import chalk from "chalk";
import fs$1 from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";
import { clearTimeout as clearTimeout$1, setTimeout as setTimeout$1 } from "node:timers";
import { createServer } from "node:http";
import { createServer as createServer$1 } from "node:https";
import chokidar from "chokidar";
//#region src/infra/exec-approval-forwarder.ts
const log$7 = createSubsystemLogger("gateway/exec-approvals");
const DEFAULT_MODE = "session";
const SYNTHETIC_APPROVAL_REQUEST_ID = "__approval-routing__";
let execApprovalForwarderRuntimePromise = null;
function loadExecApprovalForwarderRuntime() {
	execApprovalForwarderRuntimePromise ??= import("./exec-approval-forwarder.runtime-BbmWXL0h.js");
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
			log$7.error(`exec approvals: failed to deliver to ${channel}:${target.to}: ${String(err)}`);
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
			log$7.error(`${params.strategy.kind} approvals: failed to deliver request ${requestId}: ${String(err)}`);
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
	const getConfig = deps.getConfig ?? loadConfig;
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
		const relay = resolveApnsRelayConfigFromEnv(process.env, loadConfig().gateway);
		if (relay.ok) relayConfig = relay.value;
		else params.log.warn?.(`exec approvals: iOS relay APNs config unavailable: ${relay.error}`);
	}
	return {
		targets: targets.filter((target) => target.registration.transport === "direct" ? Boolean(directAuth) : Boolean(relayConfig)),
		directAuth,
		relayConfig
	};
}
async function clearStaleApnsRegistrationIfNeeded$1(params) {
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
		await clearStaleApnsRegistrationIfNeeded$1({
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
		await clearStaleApnsRegistrationIfNeeded$1({
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
		cfg: loadConfig()
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
			} catch (err) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
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
			} catch (err) {
				respond(false, void 0, errorShape(ErrorCodes.UNAVAILABLE, String(err)));
			}
		}
	};
}
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
	const pluginReloadRules = (registry?.reloads ?? []).flatMap((entry) => [
		...(entry.registration.restartPrefixes ?? []).map((prefix) => ({
			prefix,
			kind: "restart"
		})),
		...(entry.registration.hotPrefixes ?? []).map((prefix) => ({
			prefix,
			kind: "hot"
		})),
		...(entry.registration.noopPrefixes ?? []).map((prefix) => ({
			prefix,
			kind: "none"
		}))
	]);
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
function buildGatewayReloadPlan(changedPaths) {
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
	const applySnapshot = async (nextConfig) => {
		const changedPaths = diffConfigPaths(currentConfig, nextConfig);
		currentConfig = nextConfig;
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
		const plan = buildGatewayReloadPlan(changedPaths);
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
				const nextConfig = pendingInProcessConfig;
				pendingInProcessConfig = null;
				missingConfigRetries = 0;
				await applySnapshot(nextConfig);
				return;
			}
			const snapshot = await opts.readSnapshot();
			if (lastAppliedWriteHash && typeof snapshot.hash === "string") {
				if (snapshot.hash === lastAppliedWriteHash) return;
				lastAppliedWriteHash = null;
			}
			if (handleMissingSnapshot(snapshot)) return;
			if (handleInvalidSnapshot(snapshot)) return;
			await applySnapshot(snapshot.config);
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
		pendingInProcessConfig = event.runtimeConfig;
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
	const pluginApprovalManager = new ExecApprovalManager();
	const pluginApprovalHandlers = createPluginApprovalHandlers(pluginApprovalManager, { forwarder: execApprovalForwarder });
	const secretsHandlers = createSecretsHandlers({
		reloadSecrets: async () => {
			const active = getActiveSecretsRuntimeSnapshot();
			if (!active) throw new Error("Secrets runtime snapshot is not active.");
			const previousSharedGatewaySessionGeneration = params.sharedGatewaySessionGenerationState.current;
			const prepared = await params.activateRuntimeSecrets(active.sourceConfig, {
				reason: "reload",
				activate: true
			});
			const nextSharedGatewaySessionGeneration = params.resolveSharedGatewaySessionGenerationForConfig(prepared.config);
			setCurrentSharedGatewaySessionGeneration(params.sharedGatewaySessionGenerationState, nextSharedGatewaySessionGeneration);
			if (previousSharedGatewaySessionGeneration !== nextSharedGatewaySessionGeneration) disconnectStaleSharedGatewayAuthClients({
				clients: params.clients,
				expectedGeneration: nextSharedGatewaySessionGeneration
			});
			return { warningCount: prepared.warnings.length };
		},
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
	const { loadConfig, channelLogs, channelRuntimeEnvs, channelRuntime, resolveChannelRuntime } = opts;
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
		const cfg = loadConfig();
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
	const getChannelRuntime = () => {
		return channelRuntime ?? resolveChannelRuntime?.();
	};
	const startChannelInternal = async (channelId, accountId, opts = {}) => {
		const plugin = getChannelPlugin(channelId);
		const startAccount = plugin?.gateway?.startAccount;
		if (!startAccount) return;
		const { preserveRestartAttempts = false, preserveManualStop = false } = opts;
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
				scopedChannelRuntime = createTaskScopedChannelRuntime({ channelRuntime: getChannelRuntime() });
				channelRuntimeForTask = scopedChannelRuntime.channelRuntime;
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
		const cfg = loadConfig();
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
		for (const plugin of listChannelPlugins()) try {
			await startChannel(plugin.id);
		} catch (err) {
			channelLogs[plugin.id]?.error?.(`[${plugin.id}] channel startup failed: ${formatErrorMessage(err)}`);
		}
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
			restartPending: false,
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
//#region src/hooks/gmail-watcher-errors.ts
const ADDRESS_IN_USE_RE = /address already in use|EADDRINUSE/i;
function isAddressInUseError(line) {
	return ADDRESS_IN_USE_RE.test(line);
}
//#endregion
//#region src/hooks/gmail-watcher.ts
/**
* Gmail Watcher Service
*
* Automatically starts `gog gmail watch serve` when the gateway starts,
* if hooks.gmail is configured with an account.
*/
const log$6 = createSubsystemLogger("gmail-watcher");
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
			log$6.error(`watch start failed: ${message}`);
			return false;
		}
		log$6.info(`watch started for ${cfg.account}`);
		return true;
	} catch (err) {
		log$6.error(`watch start error: ${String(err)}`);
		return false;
	}
}
/**
* Spawn the gog gmail watch serve process
*/
function spawnGogServe(cfg) {
	const args = buildGogWatchServeArgs(cfg);
	log$6.info(`starting gog ${buildGogWatchServeLogArgs(cfg).join(" ")}`);
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
		if (line) log$6.info(`[gog] ${line}`);
	});
	child.stderr?.on("data", (data) => {
		const line = data.toString().trim();
		if (!line) return;
		if (isAddressInUseError(line)) addressInUse = true;
		log$6.warn(`[gog] ${line}`);
	});
	child.on("error", (err) => {
		log$6.error(`gog process error: ${String(err)}`);
	});
	child.on("exit", (code, signal) => {
		if (shuttingDown) return;
		if (addressInUse) {
			log$6.warn("gog serve failed to bind (address already in use); stopping restarts. Another watcher is likely running. Set OPENCLAW_SKIP_GMAIL_WATCHER=1 or stop the other process.");
			watcherProcess = null;
			return;
		}
		log$6.warn(`gog exited (code=${code}, signal=${signal}); restarting in 5s`);
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
		log$6.info(`tailscale ${runtimeConfig.tailscale.mode} configured for port ${runtimeConfig.serve.port}`);
	} catch (err) {
		log$6.error(`tailscale setup failed: ${String(err)}`);
		return {
			started: false,
			reason: `tailscale setup failed: ${String(err)}`
		};
	}
	if (!await startGmailWatch(runtimeConfig)) log$6.warn("gmail watch start failed, but continuing with serve");
	shuttingDown = false;
	watcherProcess = spawnGogServe(runtimeConfig);
	const renewMs = runtimeConfig.renewEveryMinutes * 6e4;
	renewInterval = setInterval(() => {
		if (shuttingDown) return;
		startGmailWatch(runtimeConfig);
	}, renewMs);
	log$6.info(`gmail watcher started for ${runtimeConfig.account} (renew every ${runtimeConfig.renewEveryMinutes}m)`);
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
		log$6.info("stopping gmail watcher");
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
	log$6.info("gmail watcher stopped");
}
//#endregion
//#region src/gateway/server-close.ts
const shutdownLog = createSubsystemLogger("gateway/shutdown");
const WEBSOCKET_CLOSE_GRACE_MS = 1e3;
const WEBSOCKET_CLOSE_FORCE_CONTINUE_MS = 250;
const HTTP_CLOSE_GRACE_MS = 1e3;
const HTTP_CLOSE_FORCE_WAIT_MS = 5e3;
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
function createGatewayCloseHandler(params) {
	return async (opts) => {
		try {
			const reason = (normalizeOptionalString(opts?.reason) ?? "") || "gateway stopping";
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
			await disposeRegisteredAgentHarnesses();
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
				const closePromise = new Promise((resolve, reject) => httpServer.close((err) => err ? reject(err) : resolve()));
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
	const channel = deliveryChannel ?? "last";
	const to = deliveryTo;
	const deliveryAccountId = normalizeOptionalString(delivery?.accountId);
	if (hasDelivery) {
		const resolvedMode = mode ?? "announce";
		return {
			mode: resolvedMode,
			channel: resolvedMode === "announce" ? channel : void 0,
			to,
			threadId: resolvedMode === "announce" ? deliveryThreadId : void 0,
			accountId: deliveryAccountId,
			source: "delivery",
			requested: resolvedMode === "announce"
		};
	}
	const resolvedMode = job.payload.kind === "agentTurn" && (job.sessionTarget === "isolated" || job.sessionTarget === "current" || job.sessionTarget.startsWith("session:")) ? "announce" : "none";
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
//#region src/cron/delivery.ts
const FAILURE_NOTIFICATION_TIMEOUT_MS = 3e4;
const cronDeliveryLogger = getChildLogger({ subsystem: "cron-delivery" });
async function sendFailureNotificationAnnounce(deps, cfg, agentId, jobId, target, message) {
	const resolvedTarget = await resolveDeliveryTarget(cfg, agentId, {
		channel: target.channel,
		to: target.to,
		accountId: target.accountId,
		sessionKey: target.sessionKey
	});
	if (!resolvedTarget.ok) {
		cronDeliveryLogger.warn({ error: resolvedTarget.error.message }, "cron: failed to resolve failure destination target");
		return;
	}
	const identity = resolveAgentOutboundIdentity(cfg, agentId);
	const session = buildOutboundSessionContext({
		cfg,
		agentId,
		sessionKey: `cron:${jobId}:failure`
	});
	const abortController = new AbortController();
	const timeout = setTimeout(() => {
		abortController.abort();
	}, FAILURE_NOTIFICATION_TIMEOUT_MS);
	try {
		await deliverOutboundPayloads({
			cfg,
			channel: resolvedTarget.channel,
			to: resolvedTarget.to,
			accountId: resolvedTarget.accountId,
			threadId: resolvedTarget.threadId,
			payloads: [{ text: message }],
			session,
			identity,
			bestEffort: false,
			deps: createOutboundSendDeps$1(deps),
			abortSignal: abortController.signal
		});
	} catch (err) {
		cronDeliveryLogger.warn({
			err: formatErrorMessage(err),
			channel: resolvedTarget.channel,
			to: resolvedTarget.to
		}, "cron: failure destination announce failed");
	} finally {
		clearTimeout(timeout);
	}
}
//#endregion
//#region src/cron/isolated-agent/model-selection.ts
async function resolveCronModelSelection(params) {
	const resolvedDefault = resolveConfiguredModelRef({
		cfg: params.cfgWithAgentDefaults,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	let provider = resolvedDefault.provider;
	let model = resolvedDefault.model;
	let catalog;
	const loadCatalogOnce = async () => {
		if (!catalog) catalog = await loadModelCatalog({ config: params.cfgWithAgentDefaults });
		return catalog;
	};
	const subagentModelRaw = normalizeModelSelection(params.agentConfigOverride?.subagents?.model) ?? normalizeModelSelection(params.agentConfigOverride?.model) ?? normalizeModelSelection(params.cfg.agents?.defaults?.subagents?.model);
	if (subagentModelRaw) {
		const resolvedSubagent = resolveAllowedModelRef({
			cfg: params.cfgWithAgentDefaults,
			catalog: await loadCatalogOnce(),
			raw: subagentModelRaw,
			defaultProvider: resolvedDefault.provider,
			defaultModel: resolvedDefault.model
		});
		if (!("error" in resolvedSubagent)) {
			provider = resolvedSubagent.ref.provider;
			model = resolvedSubagent.ref.model;
		}
	}
	let hooksGmailModelApplied = false;
	const hooksGmailModelRef = params.isGmailHook ? resolveHooksGmailModel({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	}) : null;
	if (hooksGmailModelRef) {
		if (getModelRefStatus({
			cfg: params.cfg,
			catalog: await loadCatalogOnce(),
			ref: hooksGmailModelRef,
			defaultProvider: resolvedDefault.provider,
			defaultModel: resolvedDefault.model
		}).allowed) {
			provider = hooksGmailModelRef.provider;
			model = hooksGmailModelRef.model;
			hooksGmailModelApplied = true;
		}
	}
	const modelOverrideRaw = params.payload.kind === "agentTurn" ? params.payload.model : void 0;
	const modelOverride = typeof modelOverrideRaw === "string" ? modelOverrideRaw.trim() : void 0;
	if (modelOverride !== void 0 && modelOverride.length > 0) {
		const resolvedOverride = resolveAllowedModelRef({
			cfg: params.cfgWithAgentDefaults,
			catalog: await loadCatalogOnce(),
			raw: modelOverride,
			defaultProvider: resolvedDefault.provider,
			defaultModel: resolvedDefault.model
		});
		if ("error" in resolvedOverride) {
			if (resolvedOverride.error.startsWith("model not allowed:")) return {
				ok: true,
				provider,
				model,
				warning: `cron: payload.model '${modelOverride}' not allowed, falling back to agent defaults`
			};
			return {
				ok: false,
				error: resolvedOverride.error
			};
		}
		provider = resolvedOverride.ref.provider;
		model = resolvedOverride.ref.model;
	}
	if (!modelOverride && !hooksGmailModelApplied) {
		const sessionModelOverride = params.sessionEntry.modelOverride?.trim();
		if (sessionModelOverride) {
			const sessionProviderOverride = params.sessionEntry.providerOverride?.trim() || resolvedDefault.provider;
			const resolvedSessionOverride = resolveAllowedModelRef({
				cfg: params.cfgWithAgentDefaults,
				catalog: await loadCatalogOnce(),
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
	return {
		ok: true,
		provider,
		model
	};
}
//#endregion
//#region src/cron/isolated-agent/run-config.ts
function extractCronAgentDefaultsOverride(agentConfigOverride) {
	const { model: overrideModel, sandbox: _agentSandboxOverride, ...agentOverrideRest } = agentConfigOverride ?? {};
	return {
		overrideModel,
		definedOverrides: Object.fromEntries(Object.entries(agentOverrideRest).filter(([, value]) => value !== void 0))
	};
}
function mergeCronAgentModelOverride(params) {
	const nextDefaults = { ...params.defaults };
	const existingModel = nextDefaults.model && typeof nextDefaults.model === "object" ? nextDefaults.model : {};
	if (typeof params.overrideModel === "string") nextDefaults.model = {
		...existingModel,
		primary: params.overrideModel
	};
	else if (params.overrideModel) nextDefaults.model = {
		...existingModel,
		...params.overrideModel
	};
	return nextDefaults;
}
function buildCronAgentDefaultsConfig(params) {
	const { overrideModel, definedOverrides } = extractCronAgentDefaultsOverride(params.agentConfigOverride);
	return mergeCronAgentModelOverride({
		defaults: Object.assign({}, params.defaults, definedOverrides),
		overrideModel
	});
}
//#endregion
//#region src/cron/isolated-agent/session-key.ts
function resolveCronAgentSessionKey(params) {
	const raw = toAgentStoreSessionKey({
		agentId: params.agentId,
		requestKey: params.sessionKey.trim(),
		mainKey: params.mainKey
	});
	return canonicalizeMainSessionAlias({
		cfg: params.cfg,
		agentId: params.agentId,
		sessionKey: raw
	});
}
//#endregion
//#region src/cron/isolated-agent/skills-snapshot.ts
let skillsSnapshotRuntimePromise;
async function loadSkillsSnapshotRuntime() {
	skillsSnapshotRuntimePromise ??= import("./skills-snapshot.runtime-Do31j5_y.js");
	return await skillsSnapshotRuntimePromise;
}
async function resolveCronSkillsSnapshot(params) {
	if (params.isFastTestEnv) return params.existingSnapshot ?? {
		prompt: "",
		skills: []
	};
	const runtime = await loadSkillsSnapshotRuntime();
	const snapshotVersion = runtime.getSkillsSnapshotVersion(params.workspaceDir);
	const skillFilter = runtime.resolveAgentSkillsFilter(params.config, params.agentId);
	const existingSnapshot = params.existingSnapshot;
	if (!(!existingSnapshot || existingSnapshot.version !== snapshotVersion || !matchesSkillFilter(existingSnapshot.skillFilter, skillFilter))) return existingSnapshot;
	return runtime.buildWorkspaceSkillSnapshot(params.workspaceDir, {
		config: params.config,
		agentId: params.agentId,
		skillFilter,
		eligibility: { remote: runtime.getRemoteSkillEligibility({ advertiseExecNode: runtime.canExecRequestNode({
			cfg: params.config,
			agentId: params.agentId
		}) }) },
		snapshotVersion
	});
}
//#endregion
//#region src/cron/isolated-agent/run.ts
let sessionStoreRuntimePromise;
let cronExecutorRuntimePromise;
let cronExternalContentRuntimePromise;
let cronAuthProfileRuntimePromise;
let cronContextRuntimePromise;
let cronModelCatalogRuntimePromise;
let cronDeliveryRuntimePromise;
async function loadSessionStoreRuntime() {
	sessionStoreRuntimePromise ??= import("./store.runtime-Cz_llyv3.js");
	return await sessionStoreRuntimePromise;
}
async function loadCronExecutorRuntime() {
	cronExecutorRuntimePromise ??= import("./run-executor.runtime-B0U3CRN6.js");
	return await cronExecutorRuntimePromise;
}
async function loadCronExternalContentRuntime() {
	cronExternalContentRuntimePromise ??= import("./run-external-content.runtime-DIBFPTaA.js");
	return await cronExternalContentRuntimePromise;
}
async function loadCronAuthProfileRuntime() {
	cronAuthProfileRuntimePromise ??= import("./run-auth-profile.runtime-BWQmiKwZ.js");
	return await cronAuthProfileRuntimePromise;
}
async function loadCronContextRuntime() {
	cronContextRuntimePromise ??= import("./run-context.runtime-Cx9f6z-7.js");
	return await cronContextRuntimePromise;
}
async function loadCronModelCatalogRuntime() {
	cronModelCatalogRuntimePromise ??= import("./run-model-catalog.runtime-DVxeZcKu.js");
	return await cronModelCatalogRuntimePromise;
}
async function loadCronDeliveryRuntime() {
	cronDeliveryRuntimePromise ??= import("./run-delivery.runtime-B3VEtNIu.js");
	return await cronDeliveryRuntimePromise;
}
function hasConfiguredAuthProfiles(cfg) {
	return Boolean(cfg.auth?.profiles && Object.keys(cfg.auth.profiles).length > 0) || Boolean(cfg.auth?.order && Object.keys(cfg.auth.order).length > 0);
}
function resolveNonNegativeNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function resolveCronToolPolicy(params) {
	return {
		requireExplicitMessageTarget: params.deliveryRequested && params.resolvedDelivery.ok,
		disableMessageTool: params.deliveryContract === "cron-owned" ? true : params.deliveryRequested
	};
}
async function resolveCronDeliveryContext(params) {
	const deliveryPlan = resolveCronDeliveryPlan(params.job);
	if (!deliveryPlan.requested) {
		const resolvedDelivery = {
			ok: false,
			channel: void 0,
			to: void 0,
			accountId: void 0,
			threadId: void 0,
			mode: "implicit",
			error: /* @__PURE__ */ new Error("cron delivery not requested")
		};
		return {
			deliveryPlan,
			deliveryRequested: false,
			resolvedDelivery,
			toolPolicy: resolveCronToolPolicy({
				deliveryRequested: false,
				resolvedDelivery,
				deliveryContract: params.deliveryContract
			})
		};
	}
	const { resolveDeliveryTarget } = await loadCronDeliveryRuntime();
	const resolvedDelivery = await resolveDeliveryTarget(params.cfg, params.agentId, {
		channel: deliveryPlan.channel ?? "last",
		to: deliveryPlan.to,
		threadId: deliveryPlan.threadId,
		accountId: deliveryPlan.accountId,
		sessionKey: params.job.sessionKey
	});
	return {
		deliveryPlan,
		deliveryRequested: deliveryPlan.requested,
		resolvedDelivery,
		toolPolicy: resolveCronToolPolicy({
			deliveryRequested: deliveryPlan.requested,
			resolvedDelivery,
			deliveryContract: params.deliveryContract
		})
	};
}
function appendCronDeliveryInstruction(params) {
	if (!params.deliveryRequested) return params.commandBody;
	return `${params.commandBody}\n\nReturn your response as plain text; it will be delivered automatically. If the task explicitly calls for messaging a specific external recipient, note who/where it should go instead of sending it yourself.`.trim();
}
function resolvePositiveContextTokens(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
async function loadCliRunnerRuntime() {
	return await import("./cli-runner.runtime-DObg7pI5.js");
}
async function loadUsageFormatRuntime() {
	return await import("./usage-format-6orNPGn8.js");
}
async function prepareCronRunContext(params) {
	const { input } = params;
	const defaultAgentId = resolveDefaultAgentId(input.cfg);
	const requestedAgentId = typeof input.agentId === "string" && input.agentId.trim() ? input.agentId : typeof input.job.agentId === "string" && input.job.agentId.trim() ? input.job.agentId : void 0;
	const normalizedRequested = requestedAgentId ? normalizeAgentId(requestedAgentId) : void 0;
	const agentConfigOverride = normalizedRequested ? resolveAgentConfig(input.cfg, normalizedRequested) : void 0;
	const agentId = normalizedRequested ?? defaultAgentId;
	const agentCfg = buildCronAgentDefaultsConfig({
		defaults: input.cfg.agents?.defaults,
		agentConfigOverride
	});
	const cfgWithAgentDefaults = {
		...input.cfg,
		agents: Object.assign({}, input.cfg.agents, { defaults: agentCfg })
	};
	let catalog;
	const loadCatalog = async () => {
		if (!catalog) catalog = await (await loadCronModelCatalogRuntime()).loadModelCatalog({ config: cfgWithAgentDefaults });
		return catalog;
	};
	const baseSessionKey = (input.sessionKey?.trim() || `cron:${input.job.id}`).trim();
	const agentSessionKey = resolveCronAgentSessionKey({
		sessionKey: baseSessionKey,
		agentId,
		mainKey: input.cfg.session?.mainKey,
		cfg: input.cfg
	});
	const hookExternalContentSource = (input.job.payload.kind === "agentTurn" ? input.job.payload.externalContentSource : void 0) ?? resolveHookExternalContentSource(baseSessionKey);
	const workspaceDirRaw = resolveAgentWorkspaceDir(input.cfg, agentId);
	const agentDir = resolveAgentDir(input.cfg, agentId);
	const workspaceDir = (await ensureAgentWorkspace({
		dir: workspaceDirRaw,
		ensureBootstrapFiles: !agentCfg?.skipBootstrap && !params.isFastTestEnv
	})).dir;
	const isGmailHook = hookExternalContentSource === "gmail";
	const now = Date.now();
	const cronSession = resolveCronSession({
		cfg: input.cfg,
		sessionKey: agentSessionKey,
		agentId,
		nowMs: now,
		forceNew: input.job.sessionTarget === "isolated"
	});
	const runSessionId = cronSession.sessionEntry.sessionId;
	if (!cronSession.sessionEntry.sessionFile?.trim()) cronSession.sessionEntry.sessionFile = resolveSessionTranscriptPath(runSessionId, agentId);
	const runSessionKey = baseSessionKey.startsWith("cron:") ? `${agentSessionKey}:run:${runSessionId}` : agentSessionKey;
	const persistSessionEntry = createPersistCronSessionEntry({
		isFastTestEnv: params.isFastTestEnv,
		cronSession,
		agentSessionKey,
		runSessionKey,
		updateSessionStore: async (storePath, update) => {
			const { updateSessionStore } = await loadSessionStoreRuntime();
			await updateSessionStore(storePath, update);
		}
	});
	const withRunSession = (result) => ({
		...result,
		sessionId: runSessionId,
		sessionKey: runSessionKey
	});
	if (!cronSession.sessionEntry.label?.trim() && baseSessionKey.startsWith("cron:")) {
		const labelSuffix = typeof input.job.name === "string" && input.job.name.trim() ? input.job.name.trim() : input.job.id;
		cronSession.sessionEntry.label = `Cron: ${labelSuffix}`;
	}
	const resolvedModelSelection = await resolveCronModelSelection({
		cfg: input.cfg,
		cfgWithAgentDefaults,
		agentConfigOverride,
		sessionEntry: cronSession.sessionEntry,
		payload: input.job.payload,
		isGmailHook
	});
	if (!resolvedModelSelection.ok) return {
		ok: false,
		result: withRunSession({
			status: "error",
			error: resolvedModelSelection.error
		})
	};
	let provider = resolvedModelSelection.provider;
	let model = resolvedModelSelection.model;
	if (resolvedModelSelection.warning) logWarn(resolvedModelSelection.warning);
	const hooksGmailThinking = isGmailHook ? normalizeThinkLevel(input.cfg.hooks?.gmail?.thinking) : void 0;
	let thinkLevel = normalizeThinkLevel((input.job.payload.kind === "agentTurn" ? input.job.payload.thinking : void 0) ?? void 0) ?? hooksGmailThinking;
	if (!thinkLevel) thinkLevel = resolveThinkingDefault({
		cfg: cfgWithAgentDefaults,
		provider,
		model,
		catalog: await loadCatalog()
	});
	if (thinkLevel === "xhigh" && !supportsXHighThinking(provider, model)) {
		logWarn(`[cron:${input.job.id}] Thinking level "xhigh" is not supported for ${provider}/${model}; downgrading to "high".`);
		thinkLevel = "high";
	}
	const timeoutMs = resolveAgentTimeoutMs({
		cfg: cfgWithAgentDefaults,
		overrideSeconds: input.job.payload.kind === "agentTurn" ? input.job.payload.timeoutSeconds : void 0
	});
	const agentPayload = input.job.payload.kind === "agentTurn" ? input.job.payload : null;
	const { deliveryRequested, resolvedDelivery, toolPolicy } = await resolveCronDeliveryContext({
		cfg: cfgWithAgentDefaults,
		job: input.job,
		agentId,
		deliveryContract: input.deliveryContract ?? "cron-owned"
	});
	const { formattedTime, timeLine } = resolveCronStyleNow(input.cfg, now);
	const base = `[cron:${input.job.id} ${input.job.name}] ${input.message}`.trim();
	const isExternalHook = hookExternalContentSource !== void 0 || isExternalHookSession(baseSessionKey);
	const allowUnsafeExternalContent = agentPayload?.allowUnsafeExternalContent === true || isGmailHook && input.cfg.hooks?.gmail?.allowUnsafeExternalContent === true;
	const shouldWrapExternal = isExternalHook && !allowUnsafeExternalContent;
	let commandBody;
	if (isExternalHook) {
		const { detectSuspiciousPatterns } = await loadCronExternalContentRuntime();
		const suspiciousPatterns = detectSuspiciousPatterns(input.message);
		if (suspiciousPatterns.length > 0) logWarn(`[security] Suspicious patterns detected in external hook content (session=${baseSessionKey}, patterns=${suspiciousPatterns.length}): ${suspiciousPatterns.slice(0, 3).join(", ")}`);
	}
	if (shouldWrapExternal) {
		const { buildSafeExternalPrompt } = await loadCronExternalContentRuntime();
		const hookType = mapHookExternalContentSource(hookExternalContentSource ?? "webhook");
		commandBody = `${buildSafeExternalPrompt({
			content: input.message,
			source: hookType,
			jobName: input.job.name,
			jobId: input.job.id,
			timestamp: formattedTime
		})}\n\n${timeLine}`.trim();
	} else commandBody = `${base}\n${timeLine}`.trim();
	commandBody = appendCronDeliveryInstruction({
		commandBody,
		deliveryRequested
	});
	const skillsSnapshot = await resolveCronSkillsSnapshot({
		workspaceDir,
		config: cfgWithAgentDefaults,
		agentId,
		existingSnapshot: cronSession.sessionEntry.skillsSnapshot,
		isFastTestEnv: params.isFastTestEnv
	});
	await persistCronSkillsSnapshotIfChanged({
		isFastTestEnv: params.isFastTestEnv,
		cronSession,
		skillsSnapshot,
		nowMs: Date.now(),
		persistSessionEntry
	});
	markCronSessionPreRun({
		entry: cronSession.sessionEntry,
		provider,
		model
	});
	try {
		await persistSessionEntry();
	} catch (err) {
		logWarn(`[cron:${input.job.id}] Failed to persist pre-run session entry: ${String(err)}`);
	}
	const authProfileId = !Boolean(cronSession.sessionEntry.authProfileOverride?.trim()) && !hasConfiguredAuthProfiles(cfgWithAgentDefaults) && !hasAnyAuthProfileStoreSource(agentDir) ? void 0 : await (await loadCronAuthProfileRuntime()).resolveSessionAuthProfileOverride({
		cfg: cfgWithAgentDefaults,
		provider,
		agentDir,
		sessionEntry: cronSession.sessionEntry,
		sessionStore: cronSession.store,
		sessionKey: agentSessionKey,
		storePath: cronSession.storePath,
		isNewSession: cronSession.isNewSession && input.job.sessionTarget !== "isolated"
	});
	const liveSelection = {
		provider,
		model,
		authProfileId,
		authProfileIdSource: authProfileId ? cronSession.sessionEntry.authProfileOverrideSource : void 0
	};
	return {
		ok: true,
		context: {
			input,
			cfgWithAgentDefaults,
			agentId,
			agentCfg,
			agentDir,
			agentSessionKey,
			runSessionId,
			runSessionKey,
			workspaceDir,
			commandBody,
			cronSession,
			persistSessionEntry,
			withRunSession,
			agentPayload,
			resolvedDelivery,
			deliveryRequested,
			toolPolicy,
			skillsSnapshot,
			liveSelection,
			thinkLevel,
			timeoutMs
		}
	};
}
async function finalizeCronRun(params) {
	const { prepared, execution } = params;
	const finalRunResult = execution.runResult;
	const payloads = finalRunResult.payloads ?? [];
	let telemetry;
	if (finalRunResult.meta?.systemPromptReport) prepared.cronSession.sessionEntry.systemPromptReport = finalRunResult.meta.systemPromptReport;
	const usage = finalRunResult.meta?.agentMeta?.usage;
	const promptTokens = finalRunResult.meta?.agentMeta?.promptTokens;
	const modelUsed = finalRunResult.meta?.agentMeta?.model ?? execution.fallbackModel ?? execution.liveSelection.model;
	const providerUsed = finalRunResult.meta?.agentMeta?.provider ?? execution.fallbackProvider ?? execution.liveSelection.provider;
	const contextTokens = resolvePositiveContextTokens(prepared.agentCfg?.contextTokens) ?? (await loadCronContextRuntime()).lookupContextTokens(modelUsed, { allowAsyncLoad: false }) ?? resolvePositiveContextTokens(prepared.cronSession.sessionEntry.contextTokens) ?? 2e5;
	setSessionRuntimeModel(prepared.cronSession.sessionEntry, {
		provider: providerUsed,
		model: modelUsed
	});
	prepared.cronSession.sessionEntry.contextTokens = contextTokens;
	if (isCliProvider(providerUsed, prepared.cfgWithAgentDefaults)) {
		const cliSessionId = finalRunResult.meta?.agentMeta?.sessionId?.trim();
		if (cliSessionId) {
			const { setCliSessionId } = await loadCliRunnerRuntime();
			setCliSessionId(prepared.cronSession.sessionEntry, providerUsed, cliSessionId);
		}
	}
	if (hasNonzeroUsage(usage)) {
		const { estimateUsageCost, resolveModelCostConfig } = await loadUsageFormatRuntime();
		const input = usage.input ?? 0;
		const output = usage.output ?? 0;
		const totalTokens = deriveSessionTotalTokens({
			usage,
			contextTokens,
			promptTokens
		});
		const runEstimatedCostUsd = resolveNonNegativeNumber(estimateUsageCost({
			usage,
			cost: resolveModelCostConfig({
				provider: providerUsed,
				model: modelUsed,
				config: prepared.cfgWithAgentDefaults
			})
		}));
		prepared.cronSession.sessionEntry.inputTokens = input;
		prepared.cronSession.sessionEntry.outputTokens = output;
		const telemetryUsage = {
			input_tokens: input,
			output_tokens: output
		};
		if (typeof totalTokens === "number" && Number.isFinite(totalTokens) && totalTokens > 0) {
			prepared.cronSession.sessionEntry.totalTokens = totalTokens;
			prepared.cronSession.sessionEntry.totalTokensFresh = true;
			telemetryUsage.total_tokens = totalTokens;
		} else {
			prepared.cronSession.sessionEntry.totalTokens = void 0;
			prepared.cronSession.sessionEntry.totalTokensFresh = false;
		}
		prepared.cronSession.sessionEntry.cacheRead = usage.cacheRead ?? 0;
		prepared.cronSession.sessionEntry.cacheWrite = usage.cacheWrite ?? 0;
		if (runEstimatedCostUsd !== void 0) prepared.cronSession.sessionEntry.estimatedCostUsd = (resolveNonNegativeNumber(prepared.cronSession.sessionEntry.estimatedCostUsd) ?? 0) + runEstimatedCostUsd;
		telemetry = {
			model: modelUsed,
			provider: providerUsed,
			usage: telemetryUsage
		};
	} else telemetry = {
		model: modelUsed,
		provider: providerUsed
	};
	await prepared.persistSessionEntry();
	if (params.isAborted()) return prepared.withRunSession({
		status: "error",
		error: params.abortReason(),
		...telemetry
	});
	let { summary, outputText, synthesizedText, deliveryPayloads, deliveryPayloadHasStructuredContent, hasFatalErrorPayload, embeddedRunError } = resolveCronPayloadOutcome({
		payloads,
		runLevelError: finalRunResult.meta?.error,
		finalAssistantVisibleText: finalRunResult.meta?.finalAssistantVisibleText,
		preferFinalAssistantVisibleText: prepared.resolvedDelivery.channel === "telegram"
	});
	const resolveRunOutcome = (result) => prepared.withRunSession({
		status: hasFatalErrorPayload ? "error" : "ok",
		...hasFatalErrorPayload ? { error: embeddedRunError ?? "cron isolated run returned an error payload" } : {},
		summary,
		outputText,
		delivered: result?.delivered,
		deliveryAttempted: result?.deliveryAttempted,
		...telemetry
	});
	const skipHeartbeatDelivery = prepared.deliveryRequested && isHeartbeatOnlyResponse(payloads, resolveHeartbeatAckMaxChars$1(prepared.agentCfg));
	const { dispatchCronDelivery, matchesMessagingToolDeliveryTarget, resolveCronDeliveryBestEffort } = await loadCronDeliveryRuntime();
	const skipMessagingToolDelivery = (prepared.input.deliveryContract ?? "cron-owned") === "shared" && prepared.deliveryRequested && finalRunResult.didSendViaMessagingTool === true && (finalRunResult.messagingToolSentTargets ?? []).some((target) => matchesMessagingToolDeliveryTarget(target, {
		channel: prepared.resolvedDelivery.channel,
		to: prepared.resolvedDelivery.to,
		accountId: prepared.resolvedDelivery.accountId
	}));
	const deliveryResult = await dispatchCronDelivery({
		cfg: prepared.input.cfg,
		cfgWithAgentDefaults: prepared.cfgWithAgentDefaults,
		deps: prepared.input.deps,
		job: prepared.input.job,
		agentId: prepared.agentId,
		agentSessionKey: prepared.agentSessionKey,
		runSessionId: prepared.runSessionId,
		runStartedAt: execution.runStartedAt,
		runEndedAt: execution.runEndedAt,
		timeoutMs: prepared.timeoutMs,
		resolvedDelivery: prepared.resolvedDelivery,
		deliveryRequested: prepared.deliveryRequested,
		skipHeartbeatDelivery,
		skipMessagingToolDelivery,
		deliveryBestEffort: resolveCronDeliveryBestEffort(prepared.input.job),
		deliveryPayloadHasStructuredContent,
		deliveryPayloads,
		synthesizedText,
		summary,
		outputText,
		telemetry,
		abortSignal: prepared.input.abortSignal ?? prepared.input.signal,
		isAborted: params.isAborted,
		abortReason: params.abortReason,
		withRunSession: prepared.withRunSession
	});
	if (deliveryResult.result) {
		const resultWithDeliveryMeta = {
			...deliveryResult.result,
			deliveryAttempted: deliveryResult.result.deliveryAttempted ?? deliveryResult.deliveryAttempted
		};
		if (!hasFatalErrorPayload || deliveryResult.result.status !== "ok") return resultWithDeliveryMeta;
		return resolveRunOutcome({
			delivered: deliveryResult.result.delivered,
			deliveryAttempted: resultWithDeliveryMeta.deliveryAttempted
		});
	}
	summary = deliveryResult.summary;
	outputText = deliveryResult.outputText;
	return resolveRunOutcome({
		delivered: deliveryResult.delivered,
		deliveryAttempted: deliveryResult.deliveryAttempted
	});
}
async function runCronIsolatedAgentTurn(params) {
	const abortSignal = params.abortSignal ?? params.signal;
	const isAborted = () => abortSignal?.aborted === true;
	const abortReason = () => {
		const reason = abortSignal?.reason;
		return typeof reason === "string" && reason.trim() ? reason.trim() : "cron: job execution timed out";
	};
	const prepared = await prepareCronRunContext({
		input: params,
		isFastTestEnv: process.env.OPENCLAW_TEST_FAST === "1"
	});
	if (!prepared.ok) return prepared.result;
	try {
		const { executeCronRun } = await loadCronExecutorRuntime();
		const execution = await executeCronRun({
			cfg: params.cfg,
			cfgWithAgentDefaults: prepared.context.cfgWithAgentDefaults,
			job: params.job,
			agentId: prepared.context.agentId,
			agentDir: prepared.context.agentDir,
			agentSessionKey: prepared.context.agentSessionKey,
			workspaceDir: prepared.context.workspaceDir,
			lane: params.lane,
			resolvedDelivery: {
				channel: prepared.context.resolvedDelivery.channel,
				accountId: prepared.context.resolvedDelivery.accountId
			},
			toolPolicy: prepared.context.toolPolicy,
			skillsSnapshot: prepared.context.skillsSnapshot,
			agentPayload: prepared.context.agentPayload,
			agentVerboseDefault: prepared.context.agentCfg?.verboseDefault,
			liveSelection: prepared.context.liveSelection,
			cronSession: prepared.context.cronSession,
			commandBody: prepared.context.commandBody,
			persistSessionEntry: prepared.context.persistSessionEntry,
			abortSignal,
			abortReason,
			isAborted,
			thinkLevel: prepared.context.thinkLevel,
			timeoutMs: prepared.context.timeoutMs
		});
		if (isAborted()) return prepared.context.withRunSession({
			status: "error",
			error: abortReason()
		});
		return await finalizeCronRun({
			prepared: prepared.context,
			execution,
			abortReason,
			isAborted
		});
	} catch (err) {
		return prepared.context.withRunSession({
			status: "error",
			error: String(err)
		});
	}
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
	const { randomBytes } = await import("node:crypto");
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
			entry.jobId
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
				jobName
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
//#region src/cron/service/store.ts
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
	try {
		return await Promise.race([executeJobCore(state, job, runAbortController.signal), new Promise((_, reject) => {
			timeoutId = setTimeout(() => {
				runAbortController.abort(timeoutErrorMessage());
				reject(new Error(timeoutErrorMessage()));
			}, jobTimeoutMs);
		})]);
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
function createCronTaskRunId$1(jobId, startedAt) {
	return `cron:${jobId}:${startedAt}`;
}
function tryCreateCronTaskRun(params) {
	const runId = createCronTaskRunId$1(params.job.id, params.startedAt);
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
function resolveDeliveryStatus(params) {
	if (params.delivered === true) return "delivered";
	if (params.delivered === false) return "not-delivered";
	return resolveCronDeliveryPlan(params.job).requested ? "unknown" : "not-requested";
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
		accountId: jobConfig?.accountId ?? globalConfig?.accountId
	};
}
function emitFailureAlert(state, params) {
	const safeJobName = params.job.name || params.job.id;
	const truncatedError = (params.error?.trim() || "unknown error").slice(0, 200);
	const text = [`Cron job "${safeJobName}" failed ${params.consecutiveErrors} times`, `Last error: ${truncatedError}`].join("\n");
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
	job.state.lastDelivered = result.delivered;
	const deliveryStatus = resolveDeliveryStatus({
		job,
		delivered: result.delivered
	});
	job.state.lastDeliveryStatus = deliveryStatus;
	job.state.lastDeliveryError = deliveryStatus === "not-delivered" && result.error ? result.error : void 0;
	job.updatedAtMs = result.endedAt;
	if (result.status === "error") {
		job.state.consecutiveErrors = (job.state.consecutiveErrors ?? 0) + 1;
		const alertConfig = resolveFailureAlert(state, job);
		if (alertConfig && job.state.consecutiveErrors >= alertConfig.after) {
			if (!(job.delivery?.bestEffort === true)) {
				const now = state.deps.nowMs();
				const lastAlert = job.state.lastFailureAlertAtMs;
				if (!(typeof lastAlert === "number" && now - lastAlert < Math.max(0, alertConfig.cooldownMs))) {
					emitFailureAlert(state, {
						job,
						error: result.error,
						consecutiveErrors: job.state.consecutiveErrors,
						channel: alertConfig.channel,
						to: alertConfig.to,
						mode: alertConfig.mode,
						accountId: alertConfig.accountId
					});
					job.state.lastFailureAlertAtMs = now;
				}
			}
		}
	} else {
		job.state.consecutiveErrors = 0;
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
async function executeJobCore(state, job, abortSignal) {
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
	return await executeDetachedCronJob(state, job, abortSignal, resolveAbortError);
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
					sessionKey: targetMainSessionKey
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
					sessionKey: targetMainSessionKey
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
		sessionKey: targetMainSessionKey
	});
	return {
		status: "ok",
		summary: text
	};
}
async function executeDetachedCronJob(state, job, abortSignal, resolveAbortError) {
	if (job.payload.kind !== "agentTurn") return {
		status: "skipped",
		error: "isolated job requires payload.kind=agentTurn"
	};
	if (abortSignal?.aborted) return resolveAbortError();
	const res = await state.deps.runIsolatedAgentJob({
		job,
		message: job.payload.message,
		abortSignal
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
	const interruptedOneShotIds = /* @__PURE__ */ new Set();
	let clearedAnyRunningMarker = false;
	await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		const jobs = state.store?.jobs ?? [];
		for (const job of jobs) if (typeof job.state.runningAtMs === "number") {
			state.deps.log.warn({
				jobId: job.id,
				runningAtMs: job.state.runningAtMs
			}, "cron: clearing stale running marker on startup");
			job.state.runningAtMs = void 0;
			clearedAnyRunningMarker = true;
			if (job.schedule.kind === "at") interruptedOneShotIds.add(job.id);
		}
		if (clearedAnyRunningMarker) await persist(state);
	});
	await runMissedJobs(state, { skipJobIds: interruptedOneShotIds.size > 0 ? interruptedOneShotIds : void 0 });
	await locked(state, async () => {
		await ensureLoaded(state, { skipRecompute: true });
		if (recomputeNextRuns(state)) await persist(state);
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
function createCronTaskRunId(jobId, startedAt) {
	return `cron:${jobId}:${startedAt}`;
}
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
	const runId = createCronTaskRunId(params.job.id, params.startedAt);
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
		const executionJob = JSON.parse(JSON.stringify(job));
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
	enqueueCommandInLane(CommandLane.Cron, async () => {
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
	wake(opts) {
		return wakeNow(this.state, opts);
	}
};
//#endregion
//#region src/gateway/server-cron.ts
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
		const runtimeConfig = loadConfig();
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
		const runtimeConfigBase = loadConfig();
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
				contextKey: opts?.contextKey
			});
		},
		requestHeartbeatNow: (opts) => {
			const { agentId, sessionKey } = resolveCronWakeTarget(opts);
			requestHeartbeatNow({
				reason: opts?.reason,
				agentId,
				sessionKey
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
		runIsolatedAgentJob: async ({ job, message, abortSignal }) => {
			const { agentId, cfg: runtimeConfig } = resolveCronAgent(job.agentId);
			let sessionKey = `cron:${job.id}`;
			if (job.sessionTarget.startsWith("session:")) sessionKey = assertSafeCronSessionTargetId(job.sessionTarget.slice(8));
			try {
				return await runCronIsolatedAgentTurn({
					cfg: runtimeConfig,
					deps: params.deps,
					job,
					message,
					abortSignal,
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
		sendCronFailureAlert: async ({ job, text, channel, to, mode, accountId }) => {
			const { agentId, cfg: runtimeConfig } = resolveCronAgent(job.agentId);
			const webhookToken = normalizeOptionalString(params.cfg.cron?.webhookToken);
			if (mode === "webhook" && !to) {
				cronLogger.warn({ jobId: job.id }, "cron: failure alert webhook mode requires URL, skipping");
				return;
			}
			if (mode === "webhook" && to) {
				const webhookUrl = normalizeHttpWebhookUrl(to);
				if (webhookUrl) await postCronWebhook({
					webhookUrl,
					webhookToken,
					payload: {
						jobId: job.id,
						jobName: job.name,
						message: text
					},
					logContext: { jobId: job.id },
					blockedLog: "cron: failure alert webhook blocked by SSRF guard",
					failedLog: "cron: failure alert webhook failed",
					logger: cronLogger
				});
				else cronLogger.warn({
					jobId: job.id,
					webhookUrl: redactWebhookUrl(to)
				}, "cron: failure alert webhook URL is invalid, skipping");
				return;
			}
			const target = await resolveDeliveryTarget(runtimeConfig, agentId, {
				channel,
				to,
				accountId
			});
			if (!target.ok) throw target.error;
			await deliverOutboundPayloads({
				cfg: runtimeConfig,
				channel: target.channel,
				to: target.to,
				accountId: target.accountId,
				threadId: target.threadId,
				payloads: [{ text }],
				deps: createOutboundSendDeps$1(params.deps)
			});
		},
		log: getChildLogger({
			module: "cron",
			storePath
		}),
		onEvent: (evt) => {
			params.broadcast("cron", evt, { dropIfSlow: true });
			if (evt.action === "finished") {
				const webhookToken = normalizeOptionalString(params.cfg.cron?.webhookToken);
				const legacyWebhook = normalizeOptionalString(params.cfg.cron?.webhook);
				const job = cron.getJob(evt.jobId);
				const legacyNotify = job?.notify === true;
				const webhookTarget = resolveCronWebhookTarget({
					delivery: job?.delivery && typeof job.delivery.mode === "string" ? {
						mode: job.delivery.mode,
						to: job.delivery.to
					} : void 0,
					legacyNotify,
					legacyWebhook
				});
				if (!webhookTarget && job?.delivery?.mode === "webhook") cronLogger.warn({
					jobId: evt.jobId,
					deliveryTo: job.delivery.to
				}, "cron: skipped webhook delivery, delivery.to must be a valid http(s) URL");
				if (webhookTarget?.source === "legacy" && !warnedLegacyWebhookJobs.has(evt.jobId)) {
					warnedLegacyWebhookJobs.add(evt.jobId);
					cronLogger.warn({
						jobId: evt.jobId,
						legacyWebhook: redactWebhookUrl(webhookTarget.url)
					}, "cron: deprecated notify+cron.webhook fallback in use, migrate to delivery.mode=webhook with delivery.to");
				}
				if (webhookTarget && evt.summary) (async () => {
					await postCronWebhook({
						webhookUrl: webhookTarget.url,
						webhookToken,
						payload: evt,
						logContext: { jobId: evt.jobId },
						blockedLog: "cron: webhook delivery blocked by SSRF guard",
						failedLog: "cron: webhook delivery failed",
						logger: cronLogger
					});
				})();
				if (evt.status === "error" && job) {
					if (!(job.delivery?.bestEffort === true)) {
						const failureMessage = `Cron job "${job.name}" failed: ${evt.error ?? "unknown error"}`;
						const failureDest = resolveFailureDestination(job, params.cfg.cron?.failureDestination);
						if (failureDest) {
							const failurePayload = {
								jobId: job.id,
								jobName: job.name,
								message: failureMessage,
								status: evt.status,
								error: evt.error,
								runAtMs: evt.runAtMs,
								durationMs: evt.durationMs,
								nextRunAtMs: evt.nextRunAtMs
							};
							if (failureDest.mode === "webhook" && failureDest.to) {
								const webhookUrl = normalizeHttpWebhookUrl(failureDest.to);
								if (webhookUrl) (async () => {
									await postCronWebhook({
										webhookUrl,
										webhookToken,
										payload: failurePayload,
										logContext: { jobId: evt.jobId },
										blockedLog: "cron: failure destination webhook blocked by SSRF guard",
										failedLog: "cron: failure destination webhook failed",
										logger: cronLogger
									});
								})();
								else cronLogger.warn({
									jobId: evt.jobId,
									webhookUrl: redactWebhookUrl(failureDest.to)
								}, "cron: failure destination webhook URL is invalid, skipping");
							} else if (failureDest.mode === "announce") {
								const { agentId, cfg: runtimeConfig } = resolveCronAgent(job.agentId);
								sendFailureNotificationAnnounce(params.deps, runtimeConfig, agentId, job.id, {
									channel: failureDest.channel,
									to: failureDest.to,
									accountId: failureDest.accountId,
									sessionKey: job.sessionKey
								}, `⚠️ ${failureMessage}`);
							}
						} else {
							const primaryPlan = resolveCronDeliveryPlan(job);
							if (primaryPlan.mode === "announce" && primaryPlan.requested) {
								const { agentId, cfg: runtimeConfig } = resolveCronAgent(job.agentId);
								sendFailureNotificationAnnounce(params.deps, runtimeConfig, agentId, job.id, {
									channel: primaryPlan.channel,
									to: primaryPlan.to,
									accountId: primaryPlan.accountId,
									sessionKey: job.sessionKey
								}, `⚠️ ${failureMessage}`);
							}
						}
					}
				}
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
	setCommandLaneConcurrency(CommandLane.Cron, cfg.cron?.maxConcurrentRuns ?? 1);
	setCommandLaneConcurrency(CommandLane.Main, resolveAgentMaxConcurrent(cfg));
	setCommandLaneConcurrency(CommandLane.Subagent, resolveSubagentMaxConcurrent(cfg));
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
	"doctor.memory.status",
	"doctor.memory.dreamDiary",
	"doctor.memory.backfillDreamDiary",
	"doctor.memory.resetDreamDiary",
	"doctor.memory.resetGroundedShortTerm",
	"doctor.memory.repairDreamingArtifacts",
	"doctor.memory.dedupeDreamDiary",
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
	"update.run",
	"voicewake.get",
	"voicewake.set",
	"secrets.reload",
	"secrets.resolve",
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
	"exec.approval.requested",
	"exec.approval.resolved",
	"plugin.approval.requested",
	"plugin.approval.resolved",
	GATEWAY_EVENT_UPDATE_AVAILABLE
];
//#endregion
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
	return import("./session-subagent-reactivation.runtime-vK88w2fx.js");
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
const agentRunCache = /* @__PURE__ */ new Map();
const agentRunStarts = /* @__PURE__ */ new Map();
const pendingAgentRunErrors = /* @__PURE__ */ new Map();
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
function schedulePendingAgentRunError(snapshot) {
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
function getPendingAgentRunError(runId) {
	const pending = pendingAgentRunErrors.get(runId);
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
		clearPendingAgentRunError(evt.runId);
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
		let onAbort;
		const clearPendingErrorTimer = () => {
			if (!pendingErrorTimer) return;
			clearTimeout(pendingErrorTimer);
			pendingErrorTimer = void 0;
		};
		const finish = (entry) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			clearPendingErrorTimer();
			unsubscribe();
			if (onAbort) signal?.removeEventListener("abort", onAbort);
			resolve(entry);
		};
		const scheduleErrorFinish = (snapshot, delayMs = AGENT_RUN_ERROR_RETRY_GRACE_MS) => {
			clearPendingErrorTimer();
			pendingErrorTimer = setTimeout(() => {
				const latest = ignoreCachedSnapshot ? void 0 : getCachedAgentRun(runId);
				if (latest) {
					finish(latest);
					return;
				}
				recordAgentRunSnapshot(snapshot);
				finish(snapshot);
			}, Math.max(1, Math.min(Math.floor(delayMs), 2147483647)));
			pendingErrorTimer.unref?.();
		};
		if (!ignoreCachedSnapshot) {
			const pending = getPendingAgentRunError(runId);
			if (pending) scheduleErrorFinish(pending.snapshot, pending.dueAt - Date.now());
		}
		const unsubscribe = onAgentEvent((evt) => {
			if (!evt || evt.stream !== "lifecycle") return;
			if (evt.runId !== runId) return;
			const phase = evt.data?.phase;
			if (phase === "start") {
				clearPendingErrorTimer();
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
			recordAgentRunSnapshot(snapshot);
			finish(snapshot);
		});
		const timer = setTimeout(() => finish(null), Math.max(1, Math.min(Math.floor(timeoutMs), 2147483647)));
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
		let requestedSessionKey = requestedSessionKeyRaw ?? resolveExplicitAgentSessionKey({
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
		let resolvedSessionId = normalizeOptionalString(request.sessionId);
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
				message = buildBareSessionResetPrompt(cfg);
				skipTimestampInjection = true;
				shouldPrependStartupContext = shouldApplyStartupContext({
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
			const sessionAgentId = resolveAgentIdFromSessionKey(resolvedSessionKey);
			const startupContextPrelude = await buildSessionStartupContextPrelude({
				workspaceDir: resolveIngressWorkspaceOverrideForSpawnedRun({
					spawnedBy: spawnedByValue,
					workspaceDir: sessionEntry?.spawnedWorkspaceDir
				}) ?? resolveAgentWorkspaceDir(cfgForAgent ?? cfg, sessionAgentId),
				cfg: cfgForAgent ?? cfg
			});
			if (startupContextPrelude) message = `${startupContextPrelude}\n\n${message}`;
		}
		const resolvedThreadId = explicitThreadId ?? deliveryPlan.resolvedThreadId;
		dispatchAgentRunFromGateway({
			ingressOpts: {
				message,
				images,
				imageOrder,
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
				extraSystemPrompt: request.extraSystemPrompt,
				bootstrapContextMode: request.bootstrapContextMode,
				bootstrapContextRunKind: request.bootstrapContextRunKind,
				internalEvents: request.internalEvents,
				inputProvenance,
				workspaceDir: resolveIngressWorkspaceOverrideForSpawnedRun({
					spawnedBy: spawnedByValue,
					workspaceDir: sessionEntry?.spawnedWorkspaceDir
				}),
				senderIsOwner,
				allowModelOverride
			},
			runId,
			idempotencyKey: idem,
			respond,
			context
		});
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
		const hasActiveChatRun = context.chatAbortControllers.has(runId);
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
const MEMORY_FILE_NAMES = [DEFAULT_MEMORY_FILENAME, DEFAULT_MEMORY_ALT_FILENAME];
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
	else {
		const altMeta = await statWorkspaceFileSafely(workspaceDir, DEFAULT_MEMORY_ALT_FILENAME);
		if (altMeta) files.push({
			name: DEFAULT_MEMORY_ALT_FILENAME,
			path: path.join(workspaceDir, DEFAULT_MEMORY_ALT_FILENAME),
			missing: false,
			size: altMeta.size,
			updatedAtMs: altMeta.updatedAtMs
		});
		else files.push({
			name: DEFAULT_MEMORY_FILENAME,
			path: path.join(workspaceDir, DEFAULT_MEMORY_FILENAME),
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
async function logoutChannelAccount(params) {
	const resolvedAccountId = normalizeOptionalString(params.accountId) || params.plugin.config.defaultAccountId?.(params.cfg) || params.plugin.config.listAccountIds(params.cfg)[0] || "default";
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
const channelsHandlers = {
	"channels.status": async ({ params, respond, context }) => {
		if (!validateChannelsStatusParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid channels.status params: ${formatValidationErrors(validateChannelsStatusParams.errors)}`));
			return;
		}
		const probe = params.probe === true;
		const timeoutMsRaw = params.timeoutMs;
		const timeoutMs = typeof timeoutMsRaw === "number" ? Math.max(1e3, timeoutMsRaw) : 1e4;
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
		respond(true, await context.cron.listPage({
			includeDisabled: p.includeDisabled,
			limit: p.limit,
			offset: p.offset,
			query: p.query,
			enabled: p.enabled,
			sortBy: p.sortBy,
			sortDir: p.sortDir
		}), void 0);
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
		const timestampValidation = validateScheduleTimestamp(jobCreate.schedule);
		if (!timestampValidation.ok) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, timestampValidation.message));
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
		if (patch.schedule) {
			const timestampValidation = validateScheduleTimestamp(patch.schedule);
			if (!timestampValidation.ok) {
				respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, timestampValidation.message));
				return;
			}
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
	const callerScopes = Array.isArray(client?.connect?.scopes) ? client.connect.scopes : [];
	const rawCallerDeviceId = client?.connect?.device?.id;
	return {
		callerDeviceId: typeof rawCallerDeviceId === "string" && rawCallerDeviceId.trim() ? rawCallerDeviceId.trim() : null,
		callerScopes,
		isAdminCaller: callerScopes.includes("operator.admin"),
		normalizedTargetDeviceId: targetDeviceId.trim()
	};
}
function deniesCrossDeviceManagement(authz) {
	return Boolean(authz.callerDeviceId && authz.callerDeviceId !== authz.normalizedTargetDeviceId && !authz.isAdminCaller);
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
	"device.pair.approve": async ({ params, respond, context, client }) => {
		if (!validateDevicePairApproveParams(params)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid device.pair.approve params: ${formatValidationErrors(validateDevicePairApproveParams.errors)}`));
			return;
		}
		const { requestId } = params;
		const approved = await approveDevicePairing(requestId, { callerScopes: Array.isArray(client?.connect?.scopes) ? client.connect.scopes : [] });
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
const log$5 = createSubsystemLogger("models-auth-status");
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
			log$5.debug(`usage enrichment failed (auth status still returned): providers=${usageProviderIds.join(",")} error=${formatForLog(err)}`);
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
			const { handleNodeEvent } = await import("./server-node-events-BWMhmtnp.js");
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
const sendHandlers = {
	"message.action": async ({ params, respond, context }) => {
		const p = params;
		if (!validateMessageActionParams(p)) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `invalid message.action params: ${formatValidationErrors(validateMessageActionParams.errors)}`));
			return;
		}
		const request = p;
		const dedupeKey = `message.action:${request.idempotencyKey}`;
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
		const work = (async () => {
			try {
				const handled = await dispatchChannelMessageAction({
					channel,
					action: request.action,
					cfg,
					params: request.params,
					accountId: normalizeOptionalString(request.accountId) ?? void 0,
					requesterSenderId: normalizeOptionalString(request.requesterSenderId) ?? void 0,
					senderIsOwner: request.senderIsOwner,
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
				const payload = extractToolPayload(handled);
				cacheGatewayDedupeSuccess({
					context,
					dedupeKey,
					payload
				});
				return {
					ok: true,
					payload,
					meta: { channel }
				};
			} catch (err) {
				const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
				cacheGatewayDedupeFailure({
					context,
					dedupeKey,
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
	send: async ({ params, respond, context, client }) => {
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
		const threadId = normalizeOptionalString(request.threadId);
		const outboundChannel = channel;
		if (!resolveOutboundChannelPlugin({
			channel,
			cfg
		})) {
			respond(false, void 0, errorShape(ErrorCodes.INVALID_REQUEST, `unsupported channel: ${channel}`));
			return;
		}
		const work = (async () => {
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
					threadId
				});
				const outboundRoute = derivedRoute ? providedSessionKey ? {
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
				const result = (await deliverOutboundPayloads({
					cfg,
					channel: outboundChannel,
					to: deliveryTarget,
					accountId,
					payloads: outboundPayloads,
					session: buildOutboundSessionContext({
						cfg,
						agentId: effectiveAgentId,
						sessionKey: outboundSessionKey
					}),
					gifPlayback: request.gifPlayback,
					threadId: threadId ?? null,
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
				const payload = buildGatewayDeliveryPayload({
					runId: idem,
					channel,
					result
				});
				cacheGatewayDedupeSuccess({
					context,
					dedupeKey,
					payload
				});
				return {
					ok: true,
					payload,
					meta: { channel }
				};
			} catch (err) {
				const error = errorShape(ErrorCodes.UNAVAILABLE, String(err));
				cacheGatewayDedupeFailure({
					context,
					dedupeKey,
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
//#region src/gateway/sessions-patch.ts
function invalid(message) {
	return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, message)
	};
}
function normalizeExecSecurity(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (normalized === "deny" || normalized === "allowlist" || normalized === "full") return normalized;
}
function normalizeExecAsk(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (normalized === "off" || normalized === "on-miss" || normalized === "always") return normalized;
}
function supportsSpawnLineage(storeKey) {
	return isSubagentSessionKey(storeKey) || isAcpSessionKey(storeKey);
}
function normalizeSubagentRole(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (normalized === "orchestrator" || normalized === "leaf") return normalized;
}
function normalizeSubagentControlScope(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (normalized === "children" || normalized === "none") return normalized;
}
async function applySessionsPatchToStore(params) {
	const { cfg, store, storeKey, patch } = params;
	const now = Date.now();
	const sessionAgentId = normalizeAgentId(parseAgentSessionKey(storeKey)?.agentId ?? resolveDefaultAgentId(cfg));
	const resolvedDefault = resolveDefaultModelForAgent({
		cfg,
		agentId: sessionAgentId
	});
	const subagentModelHint = isSubagentSessionKey(storeKey) ? resolveSubagentConfiguredModelSelection({
		cfg,
		agentId: sessionAgentId
	}) : void 0;
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
			const trimmed = normalizeOptionalString(raw) ?? "";
			if (!trimmed) return invalid("invalid spawnedBy: empty");
			if (!supportsSpawnLineage(storeKey)) return invalid("spawnedBy is only supported for subagent:* or acp:* sessions");
			if (existing?.spawnedBy && existing.spawnedBy !== trimmed) return invalid("spawnedBy cannot be changed once set");
			next.spawnedBy = trimmed;
		}
	}
	if ("spawnedWorkspaceDir" in patch) {
		const raw = patch.spawnedWorkspaceDir;
		if (raw === null) {
			if (existing?.spawnedWorkspaceDir) return invalid("spawnedWorkspaceDir cannot be cleared once set");
		} else if (raw !== void 0) {
			if (!supportsSpawnLineage(storeKey)) return invalid("spawnedWorkspaceDir is only supported for subagent:* or acp:* sessions");
			const trimmed = normalizeOptionalString(raw) ?? "";
			if (!trimmed) return invalid("invalid spawnedWorkspaceDir: empty");
			if (existing?.spawnedWorkspaceDir && existing.spawnedWorkspaceDir !== trimmed) return invalid("spawnedWorkspaceDir cannot be changed once set");
			next.spawnedWorkspaceDir = trimmed;
		}
	}
	if ("spawnDepth" in patch) {
		const raw = patch.spawnDepth;
		if (raw === null) {
			if (typeof existing?.spawnDepth === "number") return invalid("spawnDepth cannot be cleared once set");
		} else if (raw !== void 0) {
			if (!supportsSpawnLineage(storeKey)) return invalid("spawnDepth is only supported for subagent:* or acp:* sessions");
			const numeric = raw;
			if (!Number.isInteger(numeric) || numeric < 0) return invalid("invalid spawnDepth (use an integer >= 0)");
			const normalized = numeric;
			if (typeof existing?.spawnDepth === "number" && existing.spawnDepth !== normalized) return invalid("spawnDepth cannot be changed once set");
			next.spawnDepth = normalized;
		}
	}
	if ("subagentRole" in patch) {
		const raw = patch.subagentRole;
		if (raw === null) {
			if (existing?.subagentRole) return invalid("subagentRole cannot be cleared once set");
		} else if (raw !== void 0) {
			if (!supportsSpawnLineage(storeKey)) return invalid("subagentRole is only supported for subagent:* or acp:* sessions");
			const normalized = normalizeSubagentRole(raw);
			if (!normalized) return invalid("invalid subagentRole (use \"orchestrator\" or \"leaf\")");
			if (existing?.subagentRole && existing.subagentRole !== normalized) return invalid("subagentRole cannot be changed once set");
			next.subagentRole = normalized;
		}
	}
	if ("subagentControlScope" in patch) {
		const raw = patch.subagentControlScope;
		if (raw === null) {
			if (existing?.subagentControlScope) return invalid("subagentControlScope cannot be cleared once set");
		} else if (raw !== void 0) {
			if (!supportsSpawnLineage(storeKey)) return invalid("subagentControlScope is only supported for subagent:* or acp:* sessions");
			const normalized = normalizeSubagentControlScope(raw);
			if (!normalized) return invalid("invalid subagentControlScope (use \"children\" or \"none\")");
			if (existing?.subagentControlScope && existing.subagentControlScope !== normalized) return invalid("subagentControlScope cannot be changed once set");
			next.subagentControlScope = normalized;
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
			const normalized = normalizeThinkLevel(raw);
			if (!normalized) return invalid(`invalid thinkingLevel (use ${formatThinkingLevels(normalizeOptionalString(existing?.providerOverride) || resolvedDefault.provider, normalizeOptionalString(existing?.modelOverride) || resolvedDefault.model, "|")})`);
			next.thinkingLevel = normalized;
		}
	}
	if ("fastMode" in patch) {
		const raw = patch.fastMode;
		if (raw === null) delete next.fastMode;
		else if (raw !== void 0) {
			const normalized = normalizeFastMode(raw);
			if (normalized === void 0) return invalid("invalid fastMode (use true or false)");
			next.fastMode = normalized;
		}
	}
	if ("verboseLevel" in patch) {
		const raw = patch.verboseLevel;
		const parsed = parseVerboseOverride(raw);
		if (!parsed.ok) return invalid(parsed.error);
		applyVerboseOverride(next, parsed.value);
	}
	if ("traceLevel" in patch) {
		const raw = patch.traceLevel;
		const parsed = parseTraceOverride(raw);
		if (!parsed.ok) return invalid(parsed.error);
		applyTraceOverride(next, parsed.value);
	}
	if ("reasoningLevel" in patch) {
		const raw = patch.reasoningLevel;
		if (raw === null) delete next.reasoningLevel;
		else if (raw !== void 0) {
			const normalized = normalizeReasoningLevel(raw);
			if (!normalized) return invalid("invalid reasoningLevel (use \"on\"|\"off\"|\"stream\")");
			next.reasoningLevel = normalized;
		}
	}
	if ("responseUsage" in patch) {
		const raw = patch.responseUsage;
		if (raw === null) delete next.responseUsage;
		else if (raw !== void 0) {
			const normalized = normalizeUsageDisplay(raw);
			if (!normalized) return invalid("invalid responseUsage (use \"off\"|\"tokens\"|\"full\")");
			if (normalized === "off") delete next.responseUsage;
			else next.responseUsage = normalized;
		}
	}
	if ("elevatedLevel" in patch) {
		const raw = patch.elevatedLevel;
		if (raw === null) delete next.elevatedLevel;
		else if (raw !== void 0) {
			const normalized = normalizeElevatedLevel(raw);
			if (!normalized) return invalid("invalid elevatedLevel (use \"on\"|\"off\"|\"ask\"|\"full\")");
			next.elevatedLevel = normalized;
		}
	}
	if ("execHost" in patch) {
		const raw = patch.execHost;
		if (raw === null) delete next.execHost;
		else if (raw !== void 0) {
			const normalized = normalizeExecTarget(raw) ?? void 0;
			if (!normalized) return invalid("invalid execHost (use \"auto\"|\"sandbox\"|\"gateway\"|\"node\")");
			next.execHost = normalized;
		}
	}
	if ("execSecurity" in patch) {
		const raw = patch.execSecurity;
		if (raw === null) delete next.execSecurity;
		else if (raw !== void 0) {
			const normalized = normalizeExecSecurity(raw);
			if (!normalized) return invalid("invalid execSecurity (use \"deny\"|\"allowlist\"|\"full\")");
			next.execSecurity = normalized;
		}
	}
	if ("execAsk" in patch) {
		const raw = patch.execAsk;
		if (raw === null) delete next.execAsk;
		else if (raw !== void 0) {
			const normalized = normalizeExecAsk(raw);
			if (!normalized) return invalid("invalid execAsk (use \"off\"|\"on-miss\"|\"always\")");
			next.execAsk = normalized;
		}
	}
	if ("execNode" in patch) {
		const raw = patch.execNode;
		if (raw === null) delete next.execNode;
		else if (raw !== void 0) {
			const trimmed = normalizeOptionalString(raw) ?? "";
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
			},
			markLiveSwitchPending: true
		});
		else if (raw !== void 0) {
			const trimmed = normalizeOptionalString(raw) ?? "";
			if (!trimmed) return invalid("invalid model: empty");
			if (!params.loadGatewayModelCatalog) return {
				ok: false,
				error: errorShape(ErrorCodes.UNAVAILABLE, "model catalog unavailable")
			};
			const resolved = resolveAllowedModelRef$1({
				cfg,
				catalog: await params.loadGatewayModelCatalog(),
				raw: trimmed,
				defaultProvider: resolvedDefault.provider,
				defaultModel: subagentModelHint ?? resolvedDefault.model
			});
			if ("error" in resolved) return invalid(resolved.error);
			const isDefault = resolved.ref.provider === resolvedDefault.provider && resolved.ref.model === resolvedDefault.model;
			applyModelOverrideToSessionEntry({
				entry: next,
				selection: {
					provider: resolved.ref.provider,
					model: resolved.ref.model,
					isDefault
				},
				markLiveSwitchPending: true
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
			const normalized = normalizeSendPolicy(raw);
			if (!normalized) return invalid("invalid sendPolicy (use \"allow\"|\"deny\")");
			next.sendPolicy = normalized;
		}
	}
	if ("groupActivation" in patch) {
		const raw = patch.groupActivation;
		if (raw === null) delete next.groupActivation;
		else if (raw !== void 0) {
			const normalized = normalizeGroupActivation(raw);
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
function resolveSessionVisibilityFilterOptions(p) {
	return {
		includeGlobal: p.includeGlobal === true,
		includeUnknown: p.includeUnknown === true,
		spawnedBy: p.spawnedBy,
		agentId: p.agentId
	};
}
function noSessionFoundResult(key) {
	return {
		ok: false,
		error: errorShape(ErrorCodes.INVALID_REQUEST, `No session found: ${key}`)
	};
}
function isResolvedSessionKeyVisible(params) {
	if (typeof params.p.spawnedBy !== "string" || params.p.spawnedBy.trim().length === 0) return true;
	return listSessionsFromStore({
		cfg: params.cfg,
		storePath: params.storePath,
		store: params.store,
		opts: resolveSessionVisibilityFilterOptions(params.p)
	}).sessions.some((session) => session.key === params.key);
}
async function resolveSessionKeyFromResolveParams(params) {
	const { cfg, p } = params;
	const key = normalizeOptionalString(p.key) ?? "";
	const hasKey = key.length > 0;
	const sessionId = normalizeOptionalString(p.sessionId) ?? "";
	const hasSessionId = sessionId.length > 0;
	const selectionCount = [
		hasKey,
		hasSessionId,
		(normalizeOptionalString(p.label) ?? "").length > 0
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
		if (store[target.canonicalKey]) {
			if (!isResolvedSessionKeyVisible({
				cfg,
				p,
				storePath: target.storePath,
				store,
				key: target.canonicalKey
			})) return noSessionFoundResult(key);
			return {
				ok: true,
				key: target.canonicalKey
			};
		}
		const legacyKey = target.storeKeys.find((candidate) => store[candidate]);
		if (!legacyKey) return noSessionFoundResult(key);
		await updateSessionStore(target.storePath, (s) => {
			const { primaryKey } = migrateAndPruneGatewaySessionStoreKey({
				cfg,
				key,
				store: s
			});
			if (!s[primaryKey] && s[legacyKey]) s[primaryKey] = s[legacyKey];
		});
		if (!isResolvedSessionKeyVisible({
			cfg,
			p,
			storePath: target.storePath,
			store: loadSessionStore(target.storePath),
			key: target.canonicalKey
		})) return noSessionFoundResult(key);
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
				agentId: p.agentId
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
			key: matches[0].key
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
		key: list.sessions[0].key
	};
}
//#endregion
//#region src/gateway/server-methods/sessions.ts
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
	const { entry, canonicalKey, storePath } = loadSessionEntry(key);
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
		const { performGatewaySessionReset } = await import("./sessions.runtime-DMaVdx29.js");
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
		const { archiveSessionTranscriptsForSessionDetailed, cleanupSessionBeforeMutation, emitGatewaySessionEndPluginHook, emitSessionUnboundLifecycleEvent } = await import("./sessions.runtime-DMaVdx29.js");
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
	return [...groups.values()].map((group) => ({
		...group,
		tools: group.tools.toSorted((a, b) => a.id.localeCompare(b.id))
	})).toSorted((a, b) => a.label.localeCompare(b.label));
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
const DAY_MS = 1440 * 60 * 1e3;
const costUsageCache = /* @__PURE__ */ new Map();
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
		const { loadSessionLogs } = await import("./session-cost-usage-Bfjibt8t.js");
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
			await context.stopChannel(provider.id, accountId);
			if (!provider.gateway?.loginWithQrStart) {
				respondProviderUnsupported(respond, provider.id);
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
	...doctorHandlers,
	...execApprovalsHandlers,
	...webHandlers,
	...modelsHandlers,
	...modelsAuthStatusHandlers,
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
//#region src/gateway/session-lifecycle-state.ts
function isFiniteTimestamp(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function resolveLifecyclePhase(event) {
	const phase = typeof event.data?.phase === "string" ? event.data.phase : "";
	return phase === "start" || phase === "end" || phase === "error" ? phase : null;
}
function resolveTerminalStatus(event) {
	if (resolveLifecyclePhase(event) === "error") return "failed";
	if ((typeof event.data?.stopReason === "string" ? event.data.stopReason : "") === "aborted") return "killed";
	return event.data?.aborted === true ? "timeout" : "done";
}
function resolveLifecycleStartedAt(existingStartedAt, event) {
	if (isFiniteTimestamp(event.data?.startedAt)) return event.data.startedAt;
	if (isFiniteTimestamp(existingStartedAt)) return existingStartedAt;
	return isFiniteTimestamp(event.ts) ? event.ts : void 0;
}
function resolveLifecycleEndedAt(event) {
	if (isFiniteTimestamp(event.data?.endedAt)) return event.data.endedAt;
	return isFiniteTimestamp(event.ts) ? event.ts : void 0;
}
function resolveRuntimeMs(params) {
	const { startedAt, endedAt, existingRuntimeMs } = params;
	if (isFiniteTimestamp(startedAt) && isFiniteTimestamp(endedAt)) return Math.max(0, endedAt - startedAt);
	if (typeof existingRuntimeMs === "number" && Number.isFinite(existingRuntimeMs) && existingRuntimeMs >= 0) return existingRuntimeMs;
}
function deriveGatewaySessionLifecycleSnapshot(params) {
	const phase = resolveLifecyclePhase(params.event);
	if (!phase) return {};
	const existing = params.session ?? void 0;
	if (phase === "start") {
		const startedAt = resolveLifecycleStartedAt(existing?.startedAt, params.event);
		return {
			updatedAt: startedAt ?? existing?.updatedAt,
			status: "running",
			startedAt,
			endedAt: void 0,
			runtimeMs: void 0,
			abortedLastRun: false
		};
	}
	const startedAt = resolveLifecycleStartedAt(existing?.startedAt, params.event);
	const endedAt = resolveLifecycleEndedAt(params.event);
	return {
		updatedAt: endedAt ?? existing?.updatedAt,
		status: resolveTerminalStatus(params.event),
		startedAt,
		endedAt,
		runtimeMs: resolveRuntimeMs({
			startedAt,
			endedAt,
			existingRuntimeMs: existing?.runtimeMs
		}),
		abortedLastRun: resolveTerminalStatus(params.event) === "killed"
	};
}
function derivePersistedSessionLifecyclePatch(params) {
	const snapshot = deriveGatewaySessionLifecycleSnapshot({
		session: params.entry ?? void 0,
		event: params.event
	});
	return {
		...snapshot,
		updatedAt: typeof snapshot.updatedAt === "number" ? snapshot.updatedAt : void 0
	};
}
async function persistGatewaySessionLifecycleEvent(params) {
	if (!resolveLifecyclePhase(params.event)) return;
	const sessionEntry = loadSessionEntry(params.sessionKey);
	if (!sessionEntry.entry) return;
	await updateSessionStoreEntry({
		storePath: sessionEntry.storePath,
		sessionKey: sessionEntry.canonicalKey,
		update: async (entry) => derivePersistedSessionLifecyclePatch({
			entry,
			event: params.event
		})
	});
}
//#endregion
//#region src/gateway/server-chat.ts
function resolveHeartbeatAckMaxChars() {
	try {
		const cfg = loadConfig();
		return Math.max(0, cfg.agents?.defaults?.heartbeat?.ackMaxChars ?? 300);
	} catch {
		return 300;
	}
}
function resolveHeartbeatContext(runId, sourceRunId) {
	const primary = getAgentRunContext(runId);
	if (primary?.isHeartbeat) return primary;
	if (sourceRunId && sourceRunId !== runId) {
		const source = getAgentRunContext(sourceRunId);
		if (source?.isHeartbeat) return source;
	}
	return primary;
}
/**
* Check if heartbeat ACK/noise should be hidden from interactive chat surfaces.
*/
function shouldHideHeartbeatChatOutput(runId, sourceRunId) {
	if (!resolveHeartbeatContext(runId, sourceRunId)?.isHeartbeat) return false;
	try {
		return !resolveHeartbeatVisibility({
			cfg: loadConfig(),
			channel: "webchat"
		}).showOk;
	} catch {
		return true;
	}
}
function normalizeHeartbeatChatFinalText(params) {
	if (!shouldHideHeartbeatChatOutput(params.runId, params.sourceRunId)) return {
		suppress: false,
		text: params.text
	};
	const stripped = stripHeartbeatToken(params.text, {
		mode: "heartbeat",
		maxAckChars: resolveHeartbeatAckMaxChars()
	});
	if (!stripped.didStrip) return {
		suppress: false,
		text: params.text
	};
	if (stripped.shouldSkip) return {
		suppress: true,
		text: ""
	};
	return {
		suppress: false,
		text: stripped.text
	};
}
function appendUniqueSuffix(base, suffix) {
	if (!suffix) return base;
	if (!base) return suffix;
	if (base.endsWith(suffix)) return base;
	const maxOverlap = Math.min(base.length, suffix.length);
	for (let overlap = maxOverlap; overlap > 0; overlap -= 1) if (base.slice(-overlap) === suffix.slice(0, overlap)) return base + suffix.slice(overlap);
	return base + suffix;
}
function resolveMergedAssistantText(params) {
	const { previousText, nextText, nextDelta } = params;
	if (nextText && previousText) {
		if (nextText.startsWith(previousText)) return nextText;
		if (previousText.startsWith(nextText) && !nextDelta) return previousText;
	}
	if (nextDelta) return appendUniqueSuffix(previousText, nextDelta);
	if (nextText) return nextText;
	return previousText;
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
/**
* Keep this aligned with the agent.wait lifecycle-error grace so chat surfaces
* do not finalize a run before fallback or retry reuses the same runId.
*/
const AGENT_LIFECYCLE_ERROR_RETRY_GRACE_MS = 15e3;
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
const CHAT_ERROR_KINDS = new Set([
	"refusal",
	"timeout",
	"rate_limit",
	"context_length",
	"unknown"
]);
function readChatErrorKind(value) {
	return typeof value === "string" && CHAT_ERROR_KINDS.has(value) ? value : void 0;
}
function createAgentEventHandler({ broadcast, broadcastToConnIds, nodeSendToSession, agentRunSeq, chatRunState, resolveSessionKeyForRun, clearAgentRunContext, toolEventRecipients, sessionEventSubscribers, lifecycleErrorRetryGraceMs = AGENT_LIFECYCLE_ERROR_RETRY_GRACE_MS, isChatSendRunActive = () => false }) {
	const pendingTerminalLifecycleErrors = /* @__PURE__ */ new Map();
	const clearBufferedChatState = (clientRunId) => {
		chatRunState.rawBuffers.delete(clientRunId);
		chatRunState.buffers.delete(clientRunId);
		chatRunState.deltaSentAt.delete(clientRunId);
		chatRunState.deltaLastBroadcastLen.delete(clientRunId);
	};
	const clearPendingTerminalLifecycleError = (runId) => {
		const pending = pendingTerminalLifecycleErrors.get(runId);
		if (!pending) return;
		clearTimeout(pending);
		pendingTerminalLifecycleErrors.delete(runId);
	};
	const buildSessionEventSnapshot = (sessionKey, evt) => {
		const row = loadGatewaySessionRow(sessionKey);
		const lifecyclePatch = evt ? deriveGatewaySessionLifecycleSnapshot({
			session: row ? {
				updatedAt: row.updatedAt ?? void 0,
				status: row.status,
				startedAt: row.startedAt,
				endedAt: row.endedAt,
				runtimeMs: row.runtimeMs,
				abortedLastRun: row.abortedLastRun
			} : void 0,
			event: evt
		}) : {};
		const session = row ? {
			...row,
			...lifecyclePatch
		} : void 0;
		const snapshotSource = session ?? lifecyclePatch;
		return {
			...session ? { session } : {},
			updatedAt: snapshotSource.updatedAt,
			sessionId: row?.sessionId,
			kind: row?.kind,
			channel: row?.channel,
			subject: row?.subject,
			groupChannel: row?.groupChannel,
			space: row?.space,
			chatType: row?.chatType,
			origin: row?.origin,
			spawnedBy: row?.spawnedBy,
			spawnedWorkspaceDir: row?.spawnedWorkspaceDir,
			forkedFromParent: row?.forkedFromParent,
			spawnDepth: row?.spawnDepth,
			subagentRole: row?.subagentRole,
			subagentControlScope: row?.subagentControlScope,
			label: row?.label,
			displayName: row?.displayName,
			deliveryContext: row?.deliveryContext,
			parentSessionKey: row?.parentSessionKey,
			childSessions: row?.childSessions,
			thinkingLevel: row?.thinkingLevel,
			fastMode: row?.fastMode,
			verboseLevel: row?.verboseLevel,
			traceLevel: row?.traceLevel,
			reasoningLevel: row?.reasoningLevel,
			elevatedLevel: row?.elevatedLevel,
			sendPolicy: row?.sendPolicy,
			systemSent: row?.systemSent,
			inputTokens: row?.inputTokens,
			outputTokens: row?.outputTokens,
			lastChannel: row?.lastChannel,
			lastTo: row?.lastTo,
			lastAccountId: row?.lastAccountId,
			lastThreadId: row?.lastThreadId,
			totalTokens: row?.totalTokens,
			totalTokensFresh: row?.totalTokensFresh,
			contextTokens: row?.contextTokens,
			estimatedCostUsd: row?.estimatedCostUsd,
			responseUsage: row?.responseUsage,
			modelProvider: row?.modelProvider,
			model: row?.model,
			status: snapshotSource.status,
			startedAt: snapshotSource.startedAt,
			endedAt: snapshotSource.endedAt,
			runtimeMs: snapshotSource.runtimeMs,
			abortedLastRun: snapshotSource.abortedLastRun
		};
	};
	const finalizeLifecycleEvent = (evt, opts) => {
		const lifecyclePhase = evt.stream === "lifecycle" && typeof evt.data?.phase === "string" ? evt.data.phase : null;
		if (lifecyclePhase !== "end" && lifecyclePhase !== "error") return;
		clearPendingTerminalLifecycleError(evt.runId);
		const chatLink = chatRunState.registry.peek(evt.runId);
		const eventSessionKey = typeof evt.sessionKey === "string" && evt.sessionKey.trim() ? evt.sessionKey : void 0;
		const isControlUiVisible = getAgentRunContext(evt.runId)?.isControlUiVisible ?? true;
		const sessionKey = chatLink?.sessionKey ?? eventSessionKey ?? resolveSessionKeyForRun(evt.runId);
		const clientRunId = chatLink?.clientRunId ?? evt.runId;
		const eventRunId = chatLink?.clientRunId ?? evt.runId;
		const isAborted = chatRunState.abortedRuns.has(clientRunId) || chatRunState.abortedRuns.has(evt.runId);
		if (isControlUiVisible && sessionKey) if (!isAborted) {
			const evtStopReason = typeof evt.data?.stopReason === "string" ? evt.data.stopReason : void 0;
			const evtErrorKind = readChatErrorKind(evt.data?.errorKind) ?? detectErrorKind(evt.data?.error);
			if (chatLink) {
				const finished = chatRunState.registry.shift(evt.runId);
				if (!finished) {
					clearAgentRunContext(evt.runId);
					return;
				}
				if (!(opts?.skipChatErrorFinal && lifecyclePhase === "error")) emitChatFinal(finished.sessionKey, finished.clientRunId, evt.runId, evt.seq, lifecyclePhase === "error" ? "error" : "done", evt.data?.error, evtStopReason, evtErrorKind);
			} else if (!(opts?.skipChatErrorFinal && lifecyclePhase === "error")) emitChatFinal(sessionKey, eventRunId, evt.runId, evt.seq, lifecyclePhase === "error" ? "error" : "done", evt.data?.error, evtStopReason, evtErrorKind);
		} else {
			chatRunState.abortedRuns.delete(clientRunId);
			chatRunState.abortedRuns.delete(evt.runId);
			clearBufferedChatState(clientRunId);
			if (chatLink) chatRunState.registry.remove(evt.runId, clientRunId, sessionKey);
		}
		toolEventRecipients.markFinal(evt.runId);
		clearAgentRunContext(evt.runId);
		agentRunSeq.delete(evt.runId);
		agentRunSeq.delete(clientRunId);
		if (sessionKey) {
			persistGatewaySessionLifecycleEvent({
				sessionKey,
				event: evt
			}).catch(() => void 0);
			const sessionEventConnIds = sessionEventSubscribers.getAll();
			if (sessionEventConnIds.size > 0) broadcastToConnIds("sessions.changed", {
				sessionKey,
				phase: lifecyclePhase,
				runId: evt.runId,
				ts: evt.ts,
				...buildSessionEventSnapshot(sessionKey, evt)
			}, sessionEventConnIds, { dropIfSlow: true });
		}
	};
	const scheduleTerminalLifecycleError = (evt, opts) => {
		clearPendingTerminalLifecycleError(evt.runId);
		const timer = setTimeout(() => {
			pendingTerminalLifecycleErrors.delete(evt.runId);
			finalizeLifecycleEvent(evt, opts);
		}, Math.max(1, Math.min(Math.floor(lifecycleErrorRetryGraceMs), 2147483647)));
		timer.unref?.();
		pendingTerminalLifecycleErrors.set(evt.runId, timer);
	};
	const emitChatDelta = (sessionKey, clientRunId, sourceRunId, seq, text, delta) => {
		const cleanedText = stripInlineDirectiveTagsForDisplay(text).text;
		const cleanedDelta = typeof delta === "string" ? stripInlineDirectiveTagsForDisplay(delta).text : "";
		const mergedRawText = resolveMergedAssistantText({
			previousText: chatRunState.rawBuffers.get(clientRunId) ?? "",
			nextText: cleanedText,
			nextDelta: cleanedDelta
		});
		if (!mergedRawText) return;
		chatRunState.rawBuffers.set(clientRunId, mergedRawText);
		if (isSuppressedControlReplyText(mergedRawText)) {
			chatRunState.buffers.set(clientRunId, "");
			return;
		}
		if (isSuppressedControlReplyLeadFragment(mergedRawText)) {
			chatRunState.buffers.set(clientRunId, mergedRawText);
			return;
		}
		const mergedText = startsWithSilentToken(mergedRawText, "NO_REPLY") ? stripLeadingSilentToken(mergedRawText, SILENT_REPLY_TOKEN) : mergedRawText;
		chatRunState.buffers.set(clientRunId, mergedText);
		if (isSuppressedControlReplyText(mergedText)) return;
		if (isSuppressedControlReplyLeadFragment(mergedText)) return;
		if (shouldHideHeartbeatChatOutput(clientRunId, sourceRunId)) return;
		const now = Date.now();
		if (now - (chatRunState.deltaSentAt.get(clientRunId) ?? 0) < 150) return;
		chatRunState.deltaSentAt.set(clientRunId, now);
		chatRunState.deltaLastBroadcastLen.set(clientRunId, mergedText.length);
		const payload = {
			runId: clientRunId,
			sessionKey,
			seq,
			state: "delta",
			message: {
				role: "assistant",
				content: [{
					type: "text",
					text: mergedText
				}],
				timestamp: now
			}
		};
		broadcast("chat", payload, { dropIfSlow: true });
		nodeSendToSession(sessionKey, "chat", payload);
	};
	const resolveBufferedChatTextState = (clientRunId, sourceRunId) => {
		const normalizedHeartbeatText = normalizeHeartbeatChatFinalText({
			runId: clientRunId,
			sourceRunId,
			text: stripInlineDirectiveTagsForDisplay(chatRunState.buffers.get(clientRunId) ?? "").text.trim()
		});
		const text = normalizedHeartbeatText.text.trim();
		return {
			text,
			shouldSuppressSilent: normalizedHeartbeatText.suppress || isSuppressedControlReplyText(text)
		};
	};
	const flushBufferedChatDeltaIfNeeded = (sessionKey, clientRunId, sourceRunId, seq) => {
		const { text, shouldSuppressSilent } = resolveBufferedChatTextState(clientRunId, sourceRunId);
		const shouldSuppressSilentLeadFragment = isSuppressedControlReplyLeadFragment(text);
		const shouldSuppressHeartbeatStreaming = shouldHideHeartbeatChatOutput(clientRunId, sourceRunId);
		if (!text || shouldSuppressSilent || shouldSuppressSilentLeadFragment || shouldSuppressHeartbeatStreaming) return;
		const lastBroadcastLen = chatRunState.deltaLastBroadcastLen.get(clientRunId) ?? 0;
		if (text.length <= lastBroadcastLen) return;
		const now = Date.now();
		const flushPayload = {
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
		broadcast("chat", flushPayload, { dropIfSlow: true });
		nodeSendToSession(sessionKey, "chat", flushPayload);
		chatRunState.deltaLastBroadcastLen.set(clientRunId, text.length);
		chatRunState.deltaSentAt.set(clientRunId, now);
	};
	const emitChatFinal = (sessionKey, clientRunId, sourceRunId, seq, jobState, error, stopReason, errorKind) => {
		const { text, shouldSuppressSilent } = resolveBufferedChatTextState(clientRunId, sourceRunId);
		flushBufferedChatDeltaIfNeeded(sessionKey, clientRunId, sourceRunId, seq);
		chatRunState.deltaLastBroadcastLen.delete(clientRunId);
		chatRunState.rawBuffers.delete(clientRunId);
		chatRunState.buffers.delete(clientRunId);
		chatRunState.deltaSentAt.delete(clientRunId);
		if (jobState === "done") {
			const payload = {
				runId: clientRunId,
				sessionKey,
				seq,
				state: "final",
				...stopReason && { stopReason },
				message: text && !shouldSuppressSilent ? {
					role: "assistant",
					content: [{
						type: "text",
						text
					}],
					timestamp: Date.now()
				} : void 0
			};
			broadcast("chat", payload);
			nodeSendToSession(sessionKey, "chat", payload);
			return;
		}
		const payload = {
			runId: clientRunId,
			sessionKey,
			seq,
			state: "error",
			errorMessage: error ? formatForLog(error) : void 0,
			...errorKind && { errorKind }
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
		const lifecyclePhase = evt.stream === "lifecycle" && typeof evt.data?.phase === "string" ? evt.data.phase : null;
		if (evt.stream !== "lifecycle" || lifecyclePhase !== "error") clearPendingTerminalLifecycleError(evt.runId);
		const chatLink = chatRunState.registry.peek(evt.runId);
		const eventSessionKey = typeof evt.sessionKey === "string" && evt.sessionKey.trim() ? evt.sessionKey : void 0;
		const isControlUiVisible = getAgentRunContext(evt.runId)?.isControlUiVisible ?? true;
		const sessionKey = chatLink?.sessionKey ?? eventSessionKey ?? resolveSessionKeyForRun(evt.runId);
		const clientRunId = chatLink?.clientRunId ?? evt.runId;
		const eventRunId = chatLink?.clientRunId ?? evt.runId;
		const eventForClients = chatLink ? {
			...evt,
			runId: eventRunId
		} : evt;
		const isAborted = chatRunState.abortedRuns.has(clientRunId) || chatRunState.abortedRuns.has(evt.runId);
		const agentPayload = sessionKey ? {
			...eventForClients,
			sessionKey
		} : eventForClients;
		const last = agentRunSeq.get(evt.runId) ?? 0;
		const isToolEvent = evt.stream === "tool";
		const isItemEvent = evt.stream === "item";
		const toolVerbose = isToolEvent ? resolveToolVerboseLevel(evt.runId, sessionKey) : "off";
		const toolPayload = isToolEvent && toolVerbose !== "full" ? (() => {
			const data = evt.data ? { ...evt.data } : {};
			delete data.result;
			delete data.partialResult;
			return sessionKey ? {
				...eventForClients,
				sessionKey,
				data
			} : {
				...eventForClients,
				data
			};
		})() : agentPayload;
		if (last > 0 && evt.seq !== last + 1) broadcast("agent", {
			runId: eventRunId,
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
			if ((typeof evt.data?.phase === "string" ? evt.data.phase : "") === "start" && isControlUiVisible && sessionKey && !isAborted) flushBufferedChatDeltaIfNeeded(sessionKey, clientRunId, evt.runId, evt.seq);
			const recipients = toolEventRecipients.get(evt.runId);
			if (recipients && recipients.size > 0) broadcastToConnIds("agent", sessionKey ? {
				...toolPayload,
				...buildSessionEventSnapshot(sessionKey)
			} : toolPayload, recipients);
			if (sessionKey) {
				const sessionSubscribers = sessionEventSubscribers.getAll();
				if (sessionSubscribers.size > 0) broadcastToConnIds("session.tool", {
					...toolPayload,
					...buildSessionEventSnapshot(sessionKey)
				}, sessionSubscribers, { dropIfSlow: true });
			}
		} else {
			if ((isItemEvent && typeof evt.data?.phase === "string" ? evt.data.phase : "") === "start" && isControlUiVisible && sessionKey && !isAborted) flushBufferedChatDeltaIfNeeded(sessionKey, clientRunId, evt.runId, evt.seq);
			broadcast("agent", agentPayload);
		}
		if (isControlUiVisible && sessionKey) {
			if (!isToolEvent || toolVerbose !== "off") nodeSendToSession(sessionKey, "agent", isToolEvent ? {
				...toolPayload,
				...buildSessionEventSnapshot(sessionKey)
			} : agentPayload);
			if (!isAborted && evt.stream === "assistant" && typeof evt.data?.text === "string") emitChatDelta(sessionKey, clientRunId, evt.runId, evt.seq, evt.data.text, evt.data.delta);
		}
		if (lifecyclePhase === "error") {
			clearBufferedChatState(clientRunId);
			const skipChatErrorFinal = isChatSendRunActive(evt.runId) && !chatLink;
			if (isAborted || lifecycleErrorRetryGraceMs <= 0) finalizeLifecycleEvent(evt, { skipChatErrorFinal });
			else scheduleTerminalLifecycleError(evt, { skipChatErrorFinal });
			return;
		}
		if (lifecyclePhase === "end") {
			finalizeLifecycleEvent(evt);
			return;
		}
		if (sessionKey && lifecyclePhase === "start") {
			persistGatewaySessionLifecycleEvent({
				sessionKey,
				event: evt
			}).catch(() => void 0);
			const sessionEventConnIds = sessionEventSubscribers.getAll();
			if (sessionEventConnIds.size > 0) broadcastToConnIds("sessions.changed", {
				sessionKey,
				phase: lifecyclePhase,
				runId: evt.runId,
				ts: evt.ts,
				...buildSessionEventSnapshot(sessionKey, evt)
			}, sessionEventConnIds, { dropIfSlow: true });
		}
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
//#region src/hooks/gmail-watcher-lifecycle.ts
async function startGmailWatcherWithLogs(params) {
	if (isTruthyEnvValue(process.env.OPENCLAW_SKIP_GMAIL_WATCHER)) {
		params.onSkipped?.();
		return;
	}
	try {
		const gmailResult = await startGmailWatcher(params.cfg);
		if (gmailResult.started) {
			params.log.info("gmail watcher started");
			return;
		}
		if (gmailResult.reason && gmailResult.reason !== "hooks not enabled" && gmailResult.reason !== "no gmail account configured") params.log.warn(`gmail watcher not started: ${gmailResult.reason}`);
	} catch (err) {
		params.log.error(`gmail watcher failed to start: ${String(err)}`);
	}
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
	if (policy.skipStaleSocketCheck !== true && snapshot.mode !== "webhook" && snapshot.connected === true && snapshot.lastEventAt != null) {
		if (lastStartAt != null && snapshot.lastEventAt < lastStartAt) {
			if (Math.max(0, policy.now - lastStartAt) <= policy.staleEventThresholdMs) return {
				healthy: true,
				reason: "healthy"
			};
			return {
				healthy: false,
				reason: "stale-socket"
			};
		}
		if (policy.now - snapshot.lastEventAt > policy.staleEventThresholdMs) return {
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
const log$4 = createSubsystemLogger("gateway/health-monitor");
const DEFAULT_CHECK_INTERVAL_MS = 5 * 6e4;
const DEFAULT_MONITOR_STARTUP_GRACE_MS = 6e4;
const DEFAULT_COOLDOWN_CYCLES = 2;
const DEFAULT_MAX_RESTARTS_PER_HOUR = 10;
const ONE_HOUR_MS$1 = 60 * 6e4;
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
		record.restartsThisHour = record.restartsThisHour.filter((r) => now - r.at < ONE_HOUR_MS$1);
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
						channelConnectGraceMs: timing.channelConnectGraceMs,
						skipStaleSocketCheck: getChannelPlugin(channelId)?.status?.skipStaleSocketHealthCheck
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
						log$4.warn?.(`[${channelId}:${accountId}] health-monitor: hit ${maxRestartsPerHour} restarts/hour limit, skipping`);
						continue;
					}
					const reason = resolveChannelRestartReason(status, health);
					log$4.info?.(`[${channelId}:${accountId}] health-monitor: restarting (reason: ${reason})`);
					try {
						if (status.running) await channelManager.stopChannel(channelId, accountId);
						channelManager.resetRestartAttempts(channelId, accountId);
						await channelManager.startChannel(channelId, accountId);
						record.lastRestartAt = now;
						record.restartsThisHour.push({ at: now });
						restartRecords.set(key, record);
					} catch (err) {
						log$4.error?.(`[${channelId}:${accountId}] health-monitor: restart failed: ${String(err)}`);
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
		log$4.info?.(`started (interval: ${Math.round(checkIntervalMs / 1e3)}s, startup-grace: ${Math.round(timing.monitorStartupGraceMs / 1e3)}s, channel-connect-grace: ${Math.round(timing.channelConnectGraceMs / 1e3)}s)`);
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
		const { recoverPendingDeliveries } = await import("./delivery-queue-BLooYCZT.js");
		const { deliverOutboundPayloads } = await import("./deliver-CCeUzo2v.js");
		await recoverPendingDeliveries({
			deliver: deliverOutboundPayloads,
			log: params.log.child("delivery-recovery"),
			cfg: params.cfg
		});
	})().catch((err) => params.log.error(`Delivery recovery failed: ${String(err)}`));
}
function startGatewayRuntimeServices(params) {
	const channelHealthMonitor = startGatewayChannelHealthMonitor({
		cfg: params.cfgAtStart,
		channelManager: params.channelManager
	});
	return {
		heartbeatRunner: createNoopHeartbeatRunner(),
		channelHealthMonitor,
		stopModelPricingRefresh: !params.minimalTestGateway && process.env.VITEST !== "1" ? startGatewayModelPricingRefresh({ config: params.cfgAtStart }) : () => {}
	};
}
/**
* Activate cron scheduler, heartbeat runner, and pending delivery recovery
* after gateway sidecars are fully started and chat.history is available.
*/
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
	return { heartbeatRunner };
}
//#endregion
//#region src/gateway/server/http-auth.ts
function isCanvasPath(pathname) {
	return pathname === "/__openclaw__/a2ui" || pathname.startsWith(`/__openclaw__/a2ui/`) || pathname === "/__openclaw__/canvas" || pathname.startsWith(`/__openclaw__/canvas/`) || pathname === "/__openclaw__/ws";
}
function hasAuthorizedWsClientForCanvasCapability(clients, capability) {
	const nowMs = Date.now();
	for (const client of clients) {
		if (!client.canvasCapability || !client.canvasCapabilityExpiresAtMs) continue;
		if (client.canvasCapabilityExpiresAtMs <= nowMs) continue;
		if (safeEqualSecret(client.canvasCapability, capability)) {
			client.canvasCapabilityExpiresAtMs = nowMs + CANVAS_CAPABILITY_TTL_MS;
			return true;
		}
	}
	return false;
}
async function authorizeCanvasRequest(params) {
	const { req, auth, trustedProxies, allowRealIpFallback, clients, canvasCapability, malformedScopedPath, rateLimiter } = params;
	if (malformedScopedPath) return {
		ok: false,
		reason: "unauthorized"
	};
	let lastAuthFailure = null;
	const token = getBearerToken(req);
	if (token) {
		const authResult = await authorizeHttpGatewayConnect({
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
			allowRealIpFallback,
			rateLimiter,
			browserOriginPolicy: resolveHttpBrowserOriginPolicy(req)
		});
		if (authResult.ok) return authResult;
		lastAuthFailure = authResult;
	}
	if (canvasCapability && hasAuthorizedWsClientForCanvasCapability(clients, canvasCapability)) return { ok: true };
	return lastAuthFailure ?? {
		ok: false,
		reason: "unauthorized"
	};
}
//#endregion
//#region src/gateway/server/plugin-route-runtime-scopes.ts
function resolvePluginRouteRuntimeOperatorScopes(req, requestAuth, surface = "write-default") {
	if (surface === "trusted-operator") {
		if (!requestAuth.trustDeclaredOperatorScopes) return [...CLI_DEFAULT_OPERATOR_SCOPES];
		return resolveTrustedHttpOperatorScopes(req, requestAuth);
	}
	if (requestAuth.authMethod !== "trusted-proxy") return [WRITE_SCOPE];
	if (getHeader(req, "x-openclaw-scopes") === void 0) return [WRITE_SCOPE];
	return resolveTrustedHttpOperatorScopes(req, requestAuth);
}
//#endregion
//#region src/gateway/server/plugins-http/path-context.ts
function normalizeProtectedPrefix(prefix) {
	const collapsed = normalizeLowercaseStringOrEmpty(prefix).replace(/\/{2,}/g, "/");
	if (collapsed.length <= 1) return collapsed || "/";
	return collapsed.replace(/\/+$/, "");
}
function prefixMatchPath(pathname, prefix) {
	return pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}%`);
}
const NORMALIZED_PROTECTED_PLUGIN_ROUTE_PREFIXES = PROTECTED_PLUGIN_ROUTE_PREFIXES.map(normalizeProtectedPrefix);
function isProtectedPluginRoutePathFromContext(context) {
	if (context.candidates.some((candidate) => NORMALIZED_PROTECTED_PLUGIN_ROUTE_PREFIXES.some((prefix) => prefixMatchPath(candidate, prefix)))) return true;
	if (!context.malformedEncoding) return false;
	return NORMALIZED_PROTECTED_PLUGIN_ROUTE_PREFIXES.some((prefix) => prefixMatchPath(context.rawNormalizedPath, prefix));
}
function resolvePluginRoutePathContext(pathname) {
	const canonical = canonicalizePathForSecurity(pathname);
	return {
		pathname,
		canonicalPath: canonical.canonicalPath,
		candidates: canonical.candidates,
		malformedEncoding: canonical.malformedEncoding,
		decodePassLimitReached: canonical.decodePassLimitReached,
		rawNormalizedPath: canonical.rawNormalizedPath
	};
}
//#endregion
//#region src/gateway/server/plugins-http/route-match.ts
function doesPluginRouteMatchPath(route, context) {
	const routeCanonicalPath = canonicalizePathVariant(route.path);
	if (route.match === "prefix") return context.candidates.some((candidate) => prefixMatchPath(candidate, routeCanonicalPath));
	return context.candidates.some((candidate) => candidate === routeCanonicalPath);
}
function findMatchingPluginHttpRoutes(registry, context) {
	const routes = registry.httpRoutes ?? [];
	if (routes.length === 0) return [];
	const exactMatches = [];
	const prefixMatches = [];
	for (const route of routes) {
		if (!doesPluginRouteMatchPath(route, context)) continue;
		if (route.match === "prefix") prefixMatches.push(route);
		else exactMatches.push(route);
	}
	exactMatches.sort((a, b) => b.path.length - a.path.length);
	prefixMatches.sort((a, b) => b.path.length - a.path.length);
	return [...exactMatches, ...prefixMatches];
}
//#endregion
//#region src/gateway/server/plugins-http/route-auth.ts
function matchedPluginRoutesRequireGatewayAuth(routes) {
	return routes.some((route) => route.auth === "gateway");
}
function shouldEnforceGatewayAuthForPluginPath(registry, pathnameOrContext) {
	const pathContext = typeof pathnameOrContext === "string" ? resolvePluginRoutePathContext(pathnameOrContext) : pathnameOrContext;
	if (pathContext.malformedEncoding || pathContext.decodePassLimitReached) return true;
	if (isProtectedPluginRoutePathFromContext(pathContext)) return true;
	return matchedPluginRoutesRequireGatewayAuth(findMatchingPluginHttpRoutes(registry, pathContext));
}
//#endregion
//#region src/gateway/server/plugins-http.ts
function createPluginRouteRuntimeClient(scopes) {
	return { connect: {
		minProtocol: 3,
		maxProtocol: 3,
		client: {
			id: GATEWAY_CLIENT_IDS.GATEWAY_CLIENT,
			version: "internal",
			platform: "node",
			mode: GATEWAY_CLIENT_MODES.BACKEND
		},
		role: "operator",
		scopes: [...scopes]
	} };
}
function createGatewayPluginRequestHandler(params) {
	const { log } = params;
	return async (req, res, providedPathContext, dispatchContext) => {
		const registry = resolveActivePluginHttpRouteRegistry(params.registry);
		if ((registry.httpRoutes ?? []).length === 0) return false;
		const pathContext = providedPathContext ?? resolvePluginRoutePathContext(new URL(req.url ?? "/", "http://localhost").pathname);
		const matchedRoutes = findMatchingPluginHttpRoutes(registry, pathContext);
		if (matchedRoutes.length === 0) return false;
		if (matchedPluginRoutesRequireGatewayAuth(matchedRoutes) && dispatchContext?.gatewayAuthSatisfied !== true) {
			log.warn(`plugin http route blocked without gateway auth (${pathContext.canonicalPath})`);
			return false;
		}
		const gatewayRequestAuth = dispatchContext?.gatewayRequestAuth;
		const gatewayRequestOperatorScopes = dispatchContext?.gatewayRequestOperatorScopes;
		for (const route of matchedRoutes) {
			if (route.auth !== "gateway") continue;
			if (route.gatewayRuntimeScopeSurface === "trusted-operator") {
				if (!gatewayRequestAuth) {
					log.warn(`plugin http route blocked without caller auth context (${pathContext.canonicalPath})`);
					return false;
				}
				continue;
			}
			if (gatewayRequestOperatorScopes === void 0) {
				log.warn(`plugin http route blocked without caller scope context (${pathContext.canonicalPath})`);
				return false;
			}
		}
		for (const route of matchedRoutes) {
			let runtimeScopes = [];
			if (route.auth === "gateway") if (route.gatewayRuntimeScopeSurface === "trusted-operator") runtimeScopes = resolvePluginRouteRuntimeOperatorScopes(req, gatewayRequestAuth, "trusted-operator");
			else runtimeScopes = gatewayRequestOperatorScopes;
			const runtimeClient = createPluginRouteRuntimeClient(runtimeScopes);
			try {
				if (await withPluginRuntimeGatewayRequestScope({
					client: runtimeClient,
					isWebchatConnect: () => false
				}, async () => route.handler(req, res)) !== false) return true;
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
		return false;
	};
}
//#endregion
//#region src/gateway/server-http.ts
const HOOK_AUTH_FAILURE_LIMIT = 20;
const HOOK_AUTH_FAILURE_WINDOW_MS = 6e4;
let bundledChannelsModulePromise;
let identityAvatarModulePromise;
let controlUiModulePromise;
let embeddingsHttpModulePromise;
let modelsHttpModulePromise;
let openAiHttpModulePromise;
let openResponsesHttpModulePromise;
let sessionHistoryHttpModulePromise;
let sessionKillHttpModulePromise;
let toolsInvokeHttpModulePromise;
function getBundledChannelsModule() {
	bundledChannelsModulePromise ??= import("./bundled-CYM_4Tv5.js");
	return bundledChannelsModulePromise;
}
function getIdentityAvatarModule() {
	identityAvatarModulePromise ??= import("./identity-avatar-Bah6wouO.js");
	return identityAvatarModulePromise;
}
function getControlUiModule() {
	controlUiModulePromise ??= import("./control-ui-pEe2_1Kh.js");
	return controlUiModulePromise;
}
function getEmbeddingsHttpModule() {
	embeddingsHttpModulePromise ??= import("./embeddings-http-D8lD581G.js");
	return embeddingsHttpModulePromise;
}
function getModelsHttpModule() {
	modelsHttpModulePromise ??= import("./models-http-emArG3lc.js");
	return modelsHttpModulePromise;
}
function getOpenAiHttpModule() {
	openAiHttpModulePromise ??= import("./openai-http-CBh7eNgq.js");
	return openAiHttpModulePromise;
}
function getOpenResponsesHttpModule() {
	openResponsesHttpModulePromise ??= import("./openresponses-http-B7c8Bzor.js");
	return openResponsesHttpModulePromise;
}
function getSessionHistoryHttpModule() {
	sessionHistoryHttpModulePromise ??= import("./sessions-history-http-CRDna6gA.js");
	return sessionHistoryHttpModulePromise;
}
function getSessionKillHttpModule() {
	sessionKillHttpModulePromise ??= import("./session-kill-http-CRC9LE-H.js");
	return sessionKillHttpModulePromise;
}
function getToolsInvokeHttpModule() {
	toolsInvokeHttpModulePromise ??= import("./tools-invoke-http-DyU3xyu9.js");
	return toolsInvokeHttpModulePromise;
}
function resolveMappedHookExternalContentSource(params) {
	const payloadSource = typeof params.payload.source === "string" ? params.payload.source.trim().toLowerCase() : "";
	if (params.subPath === "gmail" || payloadSource === "gmail") return "gmail";
	return resolveHookExternalContentSource(params.sessionKey) ?? "webhook";
}
function sendJson(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.end(JSON.stringify(body));
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
	const { getBundledChannelPlugin, getBundledChannelSetupPlugin } = await getBundledChannelsModule();
	for (const channelId of Object.keys(configuredChannels)) {
		const setupPlugin = getBundledChannelSetupPlugin(channelId);
		const plugin = setupPlugin?.gateway?.resolveGatewayAuthBypassPaths ? setupPlugin : getBundledChannelPlugin(channelId);
		if (!plugin) continue;
		for (const path of plugin.gateway?.resolveGatewayAuthBypassPaths?.({ cfg: configSnapshot }) ?? []) if (typeof path === "string" && path.trim()) paths.add(path.trim());
	}
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
function shouldEnforceDefaultPluginGatewayAuth(pathContext) {
	return pathContext.malformedEncoding || pathContext.decodePassLimitReached || isProtectedPluginRoutePathFromContext(pathContext);
}
async function canRevealReadinessDetails(params) {
	if (isLocalDirectRequest(params.req, params.trustedProxies, params.allowRealIpFallback)) return true;
	if (params.resolvedAuth.mode === "none") return false;
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
function createHooksRequestHandler(opts) {
	const { getHooksConfig, logHooks, dispatchAgentHook, dispatchWakeHook, getClientIpConfig } = opts;
	const hookReplayCache = /* @__PURE__ */ new Map();
	const hookAuthLimiter = createAuthRateLimiter({
		maxAttempts: HOOK_AUTH_FAILURE_LIMIT,
		windowMs: HOOK_AUTH_FAILURE_WINDOW_MS,
		lockoutMs: HOOK_AUTH_FAILURE_WINDOW_MS,
		exemptLoopback: false,
		pruneIntervalMs: 0
	});
	const resolveHookClientKey = (req) => {
		const clientIpConfig = getClientIpConfig?.();
		return normalizeRateLimitClientIp(resolveRequestClientIp(req, clientIpConfig?.trustedProxies, clientIpConfig?.allowRealIpFallback === true) ?? req.socket?.remoteAddress);
	};
	const pruneHookReplayCache = (now) => {
		const cutoff = now - DEDUPE_TTL_MS;
		for (const [key, entry] of hookReplayCache) if (entry.ts < cutoff) hookReplayCache.delete(key);
		while (hookReplayCache.size > DEDUPE_MAX) {
			const oldestKey = hookReplayCache.keys().next().value;
			if (!oldestKey) break;
			hookReplayCache.delete(oldestKey);
		}
	};
	const buildHookReplayCacheKey = (params) => {
		const idem = params.idempotencyKey?.trim();
		if (!idem) return;
		const tokenFingerprint = createHash("sha256").update(params.token ?? "", "utf8").digest("hex");
		const idempotencyFingerprint = createHash("sha256").update(idem, "utf8").digest("hex");
		return `${tokenFingerprint}:${createHash("sha256").update(JSON.stringify({
			pathKey: params.pathKey,
			dispatchScope: params.dispatchScope
		}), "utf8").digest("hex")}:${idempotencyFingerprint}`;
	};
	const resolveCachedHookRunId = (key, now) => {
		if (!key) return;
		pruneHookReplayCache(now);
		const cached = hookReplayCache.get(key);
		if (!cached) return;
		hookReplayCache.delete(key);
		hookReplayCache.set(key, cached);
		return cached.runId;
	};
	const rememberHookRunId = (key, runId, now) => {
		if (!key) return;
		hookReplayCache.delete(key);
		hookReplayCache.set(key, {
			ts: now,
			runId
		});
		pruneHookReplayCache(now);
	};
	return async (req, res) => {
		const hooksConfig = getHooksConfig();
		if (!hooksConfig) return false;
		const url = new URL(req.url ?? "/", "http://localhost");
		const basePath = hooksConfig.basePath;
		if (url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`)) return false;
		if (url.searchParams.has("token")) {
			res.statusCode = 400;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Hook token must be provided via Authorization: Bearer <token> or X-OpenClaw-Token header (query parameters are not allowed).");
			return true;
		}
		if (req.method !== "POST") {
			res.statusCode = 405;
			res.setHeader("Allow", "POST");
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Method Not Allowed");
			return true;
		}
		const token = extractHookToken(req);
		const clientKey = resolveHookClientKey(req);
		if (!safeEqualSecret(token, hooksConfig.token)) {
			const throttle = hookAuthLimiter.check(clientKey, AUTH_RATE_LIMIT_SCOPE_HOOK_AUTH);
			if (!throttle.allowed) {
				const retryAfter = throttle.retryAfterMs > 0 ? Math.ceil(throttle.retryAfterMs / 1e3) : 1;
				res.statusCode = 429;
				res.setHeader("Retry-After", String(retryAfter));
				res.setHeader("Content-Type", "text/plain; charset=utf-8");
				res.end("Too Many Requests");
				logHooks.warn(`hook auth throttled for ${clientKey}; retry-after=${retryAfter}s`);
				return true;
			}
			hookAuthLimiter.recordFailure(clientKey, AUTH_RATE_LIMIT_SCOPE_HOOK_AUTH);
			res.statusCode = 401;
			res.setHeader("Content-Type", "text/plain; charset=utf-8");
			res.end("Unauthorized");
			return true;
		}
		hookAuthLimiter.reset(clientKey, AUTH_RATE_LIMIT_SCOPE_HOOK_AUTH);
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
		const idempotencyKey = resolveHookIdempotencyKey({
			payload,
			headers
		});
		const now = Date.now();
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
			const targetAgentId = resolveHookTargetAgentId(hooksConfig, normalized.value.agentId);
			const replayKey = buildHookReplayCacheKey({
				pathKey: "agent",
				token,
				idempotencyKey,
				dispatchScope: {
					agentId: targetAgentId ?? null,
					sessionKey: normalized.value.sessionKey ?? hooksConfig.sessionPolicy.defaultSessionKey ?? null,
					message: normalized.value.message,
					name: normalized.value.name,
					wakeMode: normalized.value.wakeMode,
					deliver: normalized.value.deliver,
					channel: normalized.value.channel,
					to: normalized.value.to ?? null,
					model: normalized.value.model ?? null,
					thinking: normalized.value.thinking ?? null,
					timeoutSeconds: normalized.value.timeoutSeconds ?? null
				}
			});
			const cachedRunId = resolveCachedHookRunId(replayKey, now);
			if (cachedRunId) {
				sendJson(res, 200, {
					ok: true,
					runId: cachedRunId
				});
				return true;
			}
			const normalizedDispatchSessionKey = normalizeHookDispatchSessionKey({
				sessionKey: sessionKey.value,
				targetAgentId
			});
			const allowedPrefixes = hooksConfig.sessionPolicy.allowedSessionKeyPrefixes;
			if (allowedPrefixes && !isSessionKeyAllowedByPrefix(normalizedDispatchSessionKey, allowedPrefixes)) {
				sendJson(res, 400, {
					ok: false,
					error: getHookSessionKeyPrefixError(allowedPrefixes)
				});
				return true;
			}
			const runId = dispatchAgentHook({
				...normalized.value,
				idempotencyKey,
				sessionKey: normalizedDispatchSessionKey,
				agentId: targetAgentId,
				externalContentSource: "webhook"
			});
			rememberHookRunId(replayKey, runId, now);
			sendJson(res, 200, {
				ok: true,
				runId
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
				const targetAgentId = resolveHookTargetAgentId(hooksConfig, mapped.action.agentId);
				const normalizedDispatchSessionKey = normalizeHookDispatchSessionKey({
					sessionKey: sessionKey.value,
					targetAgentId
				});
				const allowedPrefixes = hooksConfig.sessionPolicy.allowedSessionKeyPrefixes;
				if (allowedPrefixes && !isSessionKeyAllowedByPrefix(normalizedDispatchSessionKey, allowedPrefixes)) {
					sendJson(res, 400, {
						ok: false,
						error: getHookSessionKeyPrefixError(allowedPrefixes)
					});
					return true;
				}
				const replayKey = buildHookReplayCacheKey({
					pathKey: subPath || "mapping",
					token,
					idempotencyKey,
					dispatchScope: {
						agentId: targetAgentId ?? null,
						sessionKey: mapped.action.sessionKey ?? hooksConfig.sessionPolicy.defaultSessionKey ?? null,
						message: mapped.action.message,
						name: mapped.action.name ?? "Hook",
						wakeMode: mapped.action.wakeMode,
						deliver: resolveHookDeliver(mapped.action.deliver),
						channel,
						to: mapped.action.to ?? null,
						model: mapped.action.model ?? null,
						thinking: mapped.action.thinking ?? null,
						timeoutSeconds: mapped.action.timeoutSeconds ?? null
					}
				});
				const cachedRunId = resolveCachedHookRunId(replayKey, now);
				if (cachedRunId) {
					sendJson(res, 200, {
						ok: true,
						runId: cachedRunId
					});
					return true;
				}
				const runId = dispatchAgentHook({
					message: mapped.action.message,
					name: mapped.action.name ?? "Hook",
					idempotencyKey,
					agentId: targetAgentId,
					wakeMode: mapped.action.wakeMode,
					sessionKey: normalizedDispatchSessionKey,
					deliver: resolveHookDeliver(mapped.action.deliver),
					channel,
					to: mapped.action.to,
					model: mapped.action.model,
					thinking: mapped.action.thinking,
					timeoutSeconds: mapped.action.timeoutSeconds,
					allowUnsafeExternalContent: mapped.action.allowUnsafeExternalContent,
					externalContentSource: resolveMappedHookExternalContentSource({
						subPath,
						payload,
						sessionKey: sessionKey.value
					})
				});
				rememberHookRunId(replayKey, runId, now);
				sendJson(res, 200, {
					ok: true,
					runId
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
	const { canvasHost, clients, controlUiEnabled, controlUiBasePath, controlUiRoot, openAiChatCompletionsEnabled, openAiChatCompletionsConfig, openResponsesEnabled, openResponsesConfig, strictTransportSecurityHeader, handleHooksRequest, handlePluginRequest, shouldEnforcePluginGatewayAuth, resolvedAuth, rateLimiter, getReadiness } = opts;
	const getResolvedAuth = opts.getResolvedAuth ?? (() => resolvedAuth);
	const openAiCompatEnabled = openAiChatCompletionsEnabled || openResponsesEnabled;
	const httpServer = opts.tlsOptions ? createServer$1(opts.tlsOptions, (req, res) => {
		handleRequest(req, res);
	}) : createServer((req, res) => {
		handleRequest(req, res);
	});
	async function handleRequest(req, res) {
		setDefaultSecurityHeaders(res, { strictTransportSecurity: strictTransportSecurityHeader });
		if ((req.headers.upgrade ?? "").toLowerCase() === "websocket") return;
		try {
			const configSnapshot = loadConfig();
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
			const requestPath = new URL(req.url ?? "/", "http://localhost").pathname;
			const pluginPathContext = handlePluginRequest ? resolvePluginRoutePathContext(requestPath) : null;
			const resolvedAuth = getResolvedAuth();
			const requestStages = [{
				name: "hooks",
				run: () => handleHooksRequest(req, res)
			}];
			if (openAiCompatEnabled && isOpenAiModelsPath(requestPath)) requestStages.push({
				name: "models",
				run: async () => (await getModelsHttpModule()).handleOpenAiModelsHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (openAiCompatEnabled && isEmbeddingsPath(requestPath)) requestStages.push({
				name: "embeddings",
				run: async () => (await getEmbeddingsHttpModule()).handleOpenAiEmbeddingsHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (isToolsInvokePath(requestPath)) requestStages.push({
				name: "tools-invoke",
				run: async () => (await getToolsInvokeHttpModule()).handleToolsInvokeHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (isSessionKillPath(requestPath)) requestStages.push({
				name: "sessions-kill",
				run: async () => (await getSessionKillHttpModule()).handleSessionKillHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (isSessionHistoryPath(requestPath)) requestStages.push({
				name: "sessions-history",
				run: async () => (await getSessionHistoryHttpModule()).handleSessionHistoryHttpRequest(req, res, {
					auth: resolvedAuth,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (openResponsesEnabled && isOpenResponsesPath(requestPath)) requestStages.push({
				name: "openresponses",
				run: async () => (await getOpenResponsesHttpModule()).handleOpenResponsesHttpRequest(req, res, {
					auth: resolvedAuth,
					config: openResponsesConfig,
					trustedProxies,
					allowRealIpFallback,
					rateLimiter
				})
			});
			if (openAiChatCompletionsEnabled && isOpenAiChatCompletionsPath(requestPath)) requestStages.push({
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
						if (!isCanvasPath(requestPath)) return false;
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
					run: () => isA2uiPath(requestPath) ? handleA2uiHttpRequest(req, res) : false
				});
				requestStages.push({
					name: "canvas-http",
					run: () => canvasHost.handleHttpRequest(req, res)
				});
			}
			requestStages.push(...buildPluginRequestStages({
				req,
				res,
				requestPath,
				getGatewayAuthBypassPaths: () => getCachedPluginGatewayAuthBypassPaths(configSnapshot),
				pluginPathContext,
				handlePluginRequest,
				shouldEnforcePluginGatewayAuth,
				resolvedAuth,
				trustedProxies,
				allowRealIpFallback,
				rateLimiter
			}));
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
						root: controlUiRoot
					})
				});
			}
			requestStages.push({
				name: "gateway-probes",
				run: () => handleGatewayProbeRequest(req, res, requestPath, resolvedAuth, trustedProxies, allowRealIpFallback, getReadiness)
			});
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
	const { httpServer, wss, canvasHost, clients, preauthConnectionBudget, resolvedAuth, rateLimiter } = opts;
	const getResolvedAuth = opts.getResolvedAuth ?? (() => resolvedAuth);
	httpServer.on("upgrade", (req, socket, head) => {
		(async () => {
			const configSnapshot = loadConfig();
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
			if (canvasHost) {
				if (new URL(req.url ?? "/", "http://localhost").pathname === "/__openclaw__/ws") {
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
			if (wss.listenerCount("connection") === 0) {
				socket.write(`HTTP/1.1 503 Service Unavailable\r
Connection: close\r
Content-Type: text/plain; charset=utf-8\r
Content-Length: ${Buffer.byteLength("Gateway websocket handlers unavailable", "utf8")}\r\n\r
Gateway websocket handlers unavailable`);
				socket.destroy();
				return;
			}
			if (!preauthConnectionBudget.acquire(preauthBudgetKey)) {
				socket.write(`HTTP/1.1 503 Service Unavailable\r
Connection: close\r
Content-Type: text/plain; charset=utf-8\r
Content-Length: ${Buffer.byteLength("Too many unauthenticated sockets", "utf8")}\r\n\r
Too many unauthenticated sockets`);
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
		})().catch(() => {
			socket.destroy();
		});
	});
}
//#endregion
//#region src/gateway/server/hooks.ts
function resolveHookClientIpConfig(cfg) {
	return {
		trustedProxies: cfg.gateway?.trustedProxies,
		allowRealIpFallback: cfg.gateway?.allowRealIpFallback === true
	};
}
function createGatewayHooksRequestHandler(params) {
	const { deps, getHooksConfig, getClientIpConfig, bindHost, port, logHooks } = params;
	const dispatchWakeHook = (value) => {
		const sessionKey = resolveMainSessionKeyFromConfig();
		enqueueSystemEvent(value.text, {
			sessionKey,
			trusted: false
		});
		if (value.mode === "now") requestHeartbeatNow({ reason: "hook:wake" });
	};
	const dispatchAgentHook = (value) => {
		const sessionKey = value.sessionKey;
		const mainSessionKey = resolveMainSessionKeyFromConfig();
		const safeName = sanitizeInboundSystemTags(value.name);
		const jobId = randomUUID();
		const now = Date.now();
		const delivery = value.deliver ? {
			mode: "announce",
			channel: value.channel,
			to: value.to
		} : { mode: "none" };
		const job = {
			id: jobId,
			agentId: value.agentId,
			name: safeName,
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
				allowUnsafeExternalContent: value.allowUnsafeExternalContent,
				externalContentSource: value.externalContentSource
			},
			delivery,
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
					lane: "cron",
					deliveryContract: "shared"
				});
				const summary = normalizeOptionalString(result.summary) || normalizeOptionalString(result.error) || result.status;
				const prefix = result.status === "ok" ? `Hook ${safeName}` : `Hook ${safeName} (${result.status})`;
				if (!result.delivered) {
					enqueueSystemEvent(`${prefix}: ${summary}`.trim(), {
						sessionKey: mainSessionKey,
						trusted: false
					});
					if (value.wakeMode === "now") requestHeartbeatNow({ reason: `hook:${jobId}` });
				}
			} catch (err) {
				logHooks.warn(`hook agent failed: ${String(err)}`);
				enqueueSystemEvent(`Hook ${safeName} (error): ${String(err)}`, {
					sessionKey: mainSessionKey,
					trusted: false
				});
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
		getClientIpConfig,
		dispatchAgentHook,
		dispatchWakeHook
	});
}
//#endregion
//#region src/gateway/server-reload-handlers.ts
function createGatewayReloadHandlers(params) {
	const applyHotReload = async (plan, nextConfig) => {
		setGatewaySigusr1RestartPolicy({ allowExternal: isRestartEnabled(nextConfig) });
		const state = params.getState();
		const nextState = { ...state };
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
		setGatewaySigusr1RestartPolicy({ allowExternal: isRestartEnabled(nextConfig) });
		const reasons = plan.restartReasons.length ? plan.restartReasons.join(", ") : plan.changedPaths.join(", ");
		if (process.listenerCount("SIGUSR1") === 0) {
			params.logReload.warn("no SIGUSR1 listener found; restart skipped");
			return false;
		}
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
		} else {
			params.logReload.warn(`config change requires gateway restart (${reasons})`);
			if (!emitGatewayRestart()) params.logReload.info("gateway restart already scheduled; skipping duplicate signal");
			return true;
		}
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
		initialInternalWriteHash: params.initialInternalWriteHash,
		readSnapshot: params.readSnapshot,
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
function isDisabledByEnv$1() {
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
	if (isDisabledByEnv$1() && opts.allowInTests !== true) return {
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
	"exec.approval.requested": [APPROVALS_SCOPE$1],
	"exec.approval.resolved": [APPROVALS_SCOPE$1],
	"plugin.approval.requested": [APPROVALS_SCOPE$1],
	"plugin.approval.resolved": [APPROVALS_SCOPE$1],
	"device.pair.requested": [PAIRING_SCOPE],
	"device.pair.resolved": [PAIRING_SCOPE],
	"node.pair.requested": [PAIRING_SCOPE],
	"node.pair.resolved": [PAIRING_SCOPE],
	"sessions.changed": [READ_SCOPE],
	"session.message": [READ_SCOPE],
	"session.tool": [READ_SCOPE]
};
function hasEventScope(client, event) {
	const required = EVENT_SCOPE_GUARDS[event];
	if (!required) return true;
	if ((client.connect.role ?? "operator") !== "operator") return false;
	const scopes = Array.isArray(client.connect.scopes) ? client.connect.scopes : [];
	if (scopes.includes("operator.admin")) return true;
	if (required.includes("operator.read")) return scopes.includes("operator.read") || scopes.includes("operator.write");
	return required.some((scope) => scopes.includes(scope));
}
function createGatewayBroadcaster(params) {
	let seq = 0;
	const broadcastInternal = (event, payload, opts, targetConnIds) => {
		if (params.clients.size === 0) return;
		const eventSeq = Boolean(targetConnIds) ? void 0 : ++seq;
		const frame = JSON.stringify({
			type: "event",
			event,
			payload,
			seq: eventSeq,
			stateVersion: opts?.stateVersion
		});
		if (shouldLogWs()) {
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
		}
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
		const handleHooksRequest = createGatewayHooksRequestHandler({
			deps: params.deps,
			getHooksConfig: params.hooksConfig,
			getClientIpConfig: params.getHookClientIpConfig,
			bindHost: params.bindHost,
			port: params.port,
			logHooks: params.logHooks
		});
		const handlePluginRequest = createGatewayPluginRequestHandler({
			registry: params.pluginRegistry,
			log: params.logPlugins
		});
		const shouldEnforcePluginGatewayAuth = (pathContext) => {
			return shouldEnforceGatewayAuthForPluginPath(resolveActivePluginHttpRouteRegistry(params.pluginRegistry), pathContext);
		};
		const bindHosts = await resolveGatewayListenHosts(params.bindHost);
		if (!isLoopbackHost(params.bindHost)) params.log.warn("⚠️  Gateway is binding to a non-loopback address. Ensure authentication is configured before exposing to public networks.");
		if (params.cfg.gateway?.controlUi?.dangerouslyAllowHostHeaderOriginFallback === true) params.log.warn("⚠️  gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true is enabled. Host-header origin fallback weakens origin checks and should only be used as break-glass.");
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
			maxPayload: MAX_PREAUTH_PAYLOAD_BYTES
		});
		const preauthConnectionBudget = createPreauthConnectionBudget();
		for (const server of httpServers) attachGatewayUpgradeHandler({
			httpServer: server,
			wss,
			canvasHost,
			clients,
			preauthConnectionBudget,
			resolvedAuth: params.resolvedAuth,
			getResolvedAuth: params.getResolvedAuth,
			rateLimiter: params.rateLimiter
		});
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
//#region src/gateway/session-transcript-key.ts
const TRANSCRIPT_SESSION_KEY_CACHE = /* @__PURE__ */ new Map();
const TRANSCRIPT_SESSION_KEY_CACHE_MAX = 256;
function resolveTranscriptPathForComparison(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	const resolved = path.resolve(trimmed);
	try {
		return fs.realpathSync(resolved);
	} catch {
		return resolved;
	}
}
function sessionKeyMatchesTranscriptPath(params) {
	const entry = params.store[params.key];
	if (!entry?.sessionId) return false;
	const target = resolveGatewaySessionStoreTarget({
		cfg: params.cfg,
		key: params.key,
		scanLegacyKeys: false,
		store: params.store
	});
	const sessionAgentId = normalizeAgentId(target.agentId);
	return resolveSessionTranscriptCandidates(entry.sessionId, target.storePath, entry.sessionFile, sessionAgentId).some((candidate) => resolveTranscriptPathForComparison(candidate) === params.targetPath);
}
function resolveSessionKeyForTranscriptFile(sessionFile) {
	const targetPath = resolveTranscriptPathForComparison(sessionFile);
	if (!targetPath) return;
	const cfg = loadConfig();
	const { store } = loadCombinedSessionStoreForGateway(cfg);
	const cachedKey = TRANSCRIPT_SESSION_KEY_CACHE.get(targetPath);
	if (cachedKey && sessionKeyMatchesTranscriptPath({
		cfg,
		store,
		key: cachedKey,
		targetPath
	})) return cachedKey;
	const matchingEntries = [];
	for (const [key, entry] of Object.entries(store)) {
		if (!entry?.sessionId || key === cachedKey) continue;
		if (sessionKeyMatchesTranscriptPath({
			cfg,
			store,
			key,
			targetPath
		})) matchingEntries.push([key, entry]);
	}
	if (matchingEntries.length > 0) {
		const matchesBySessionId = /* @__PURE__ */ new Map();
		for (const entry of matchingEntries) {
			const sessionId = entry[1].sessionId;
			if (!sessionId) continue;
			const group = matchesBySessionId.get(sessionId);
			if (group) group.push(entry);
			else matchesBySessionId.set(sessionId, [entry]);
		}
		const resolvedMatches = Array.from(matchesBySessionId.entries()).map(([sessionId, matches]) => {
			const resolvedKey = resolvePreferredSessionKeyForSessionIdMatches(matches, sessionId) ?? matches[0]?.[0];
			const resolvedEntry = resolvedKey ? matches.find(([key]) => key === resolvedKey)?.[1] : void 0;
			return resolvedKey && resolvedEntry ? {
				key: resolvedKey,
				updatedAt: resolvedEntry.updatedAt ?? 0
			} : void 0;
		}).filter((match) => match !== void 0);
		const [freshestMatch, secondFreshestMatch] = [...resolvedMatches].toSorted((a, b) => b.updatedAt - a.updatedAt);
		const resolvedKey = resolvedMatches.length === 1 ? freshestMatch?.key : (freshestMatch?.updatedAt ?? 0) > (secondFreshestMatch?.updatedAt ?? 0) ? freshestMatch?.key : void 0;
		if (resolvedKey) {
			if (!TRANSCRIPT_SESSION_KEY_CACHE.has(targetPath) && TRANSCRIPT_SESSION_KEY_CACHE.size >= TRANSCRIPT_SESSION_KEY_CACHE_MAX) {
				const oldest = TRANSCRIPT_SESSION_KEY_CACHE.keys().next().value;
				if (oldest !== void 0) TRANSCRIPT_SESSION_KEY_CACHE.delete(oldest);
			}
			TRANSCRIPT_SESSION_KEY_CACHE.set(targetPath, resolvedKey);
			return resolvedKey;
		}
	}
	TRANSCRIPT_SESSION_KEY_CACHE.delete(targetPath);
}
//#endregion
//#region src/gateway/server-session-events.ts
function buildGatewaySessionSnapshot(params) {
	const { sessionRow } = params;
	if (!sessionRow) return {};
	return {
		...params.includeSession ? { session: sessionRow } : {},
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
		label: params.label ?? sessionRow.label,
		displayName: params.displayName ?? sessionRow.displayName,
		deliveryContext: sessionRow.deliveryContext,
		parentSessionKey: params.parentSessionKey ?? sessionRow.parentSessionKey,
		childSessions: sessionRow.childSessions,
		thinkingLevel: sessionRow.thinkingLevel,
		fastMode: sessionRow.fastMode,
		verboseLevel: sessionRow.verboseLevel,
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
	};
}
function createTranscriptUpdateBroadcastHandler(params) {
	return (update) => {
		const sessionKey = update.sessionKey ?? resolveSessionKeyForTranscriptFile(update.sessionFile);
		if (!sessionKey || update.message === void 0) return;
		const connIds = /* @__PURE__ */ new Set();
		for (const connId of params.sessionEventSubscribers.getAll()) connIds.add(connId);
		for (const connId of params.sessionMessageSubscribers.get(sessionKey)) connIds.add(connId);
		if (connIds.size === 0) return;
		const { entry, storePath } = loadSessionEntry(sessionKey);
		const messageSeq = entry?.sessionId ? readSessionMessages(entry.sessionId, storePath, entry.sessionFile).length : void 0;
		const sessionSnapshot = buildGatewaySessionSnapshot({
			sessionRow: loadGatewaySessionRow(sessionKey),
			includeSession: true
		});
		const message = attachOpenClawTranscriptMeta(update.message, {
			...typeof update.messageId === "string" ? { id: update.messageId } : {},
			...typeof messageSeq === "number" ? { seq: messageSeq } : {}
		});
		params.broadcastToConnIds("session.message", {
			sessionKey,
			message,
			...typeof update.messageId === "string" ? { messageId: update.messageId } : {},
			...typeof messageSeq === "number" ? { messageSeq } : {},
			...sessionSnapshot
		}, connIds, { dropIfSlow: true });
		const sessionEventConnIds = params.sessionEventSubscribers.getAll();
		if (sessionEventConnIds.size === 0) return;
		params.broadcastToConnIds("sessions.changed", {
			sessionKey,
			phase: "message",
			ts: Date.now(),
			...typeof update.messageId === "string" ? { messageId: update.messageId } : {},
			...typeof messageSeq === "number" ? { messageSeq } : {},
			...sessionSnapshot
		}, sessionEventConnIds, { dropIfSlow: true });
	};
}
function createLifecycleEventBroadcastHandler(params) {
	return (event) => {
		const connIds = params.sessionEventSubscribers.getAll();
		if (connIds.size === 0) return;
		params.broadcastToConnIds("sessions.changed", {
			sessionKey: event.sessionKey,
			reason: event.reason,
			parentSessionKey: event.parentSessionKey,
			label: event.label,
			displayName: event.displayName,
			ts: Date.now(),
			...buildGatewaySessionSnapshot({
				sessionRow: loadGatewaySessionRow(event.sessionKey),
				label: event.label,
				displayName: event.displayName,
				parentSessionKey: event.parentSessionKey
			})
		}, connIds, { dropIfSlow: true });
	};
}
//#endregion
//#region src/gateway/server-runtime-subscriptions.ts
function startGatewayEventSubscriptions(params) {
	return {
		agentUnsub: params.minimalTestGateway ? null : onAgentEvent(createAgentEventHandler({
			broadcast: params.broadcast,
			broadcastToConnIds: params.broadcastToConnIds,
			nodeSendToSession: params.nodeSendToSession,
			agentRunSeq: params.agentRunSeq,
			chatRunState: params.chatRunState,
			resolveSessionKeyForRun: params.resolveSessionKeyForRun,
			clearAgentRunContext: params.clearAgentRunContext,
			toolEventRecipients: params.toolEventRecipients,
			sessionEventSubscribers: params.sessionEventSubscribers,
			isChatSendRunActive: (runId) => params.chatAbortControllers.has(runId)
		})),
		heartbeatUnsub: params.minimalTestGateway ? null : onHeartbeatEvent((evt) => {
			params.broadcast("heartbeat", evt, { dropIfSlow: true });
		}),
		transcriptUnsub: params.minimalTestGateway ? null : onSessionTranscriptUpdate(createTranscriptUpdateBroadcastHandler({
			broadcastToConnIds: params.broadcastToConnIds,
			sessionEventSubscribers: params.sessionEventSubscribers,
			sessionMessageSubscribers: params.sessionMessageSubscribers
		})),
		lifecycleUnsub: params.minimalTestGateway ? null : onSessionLifecycleEvent(createLifecycleEventBroadcastHandler({
			broadcastToConnIds: params.broadcastToConnIds,
			sessionEventSubscribers: params.sessionEventSubscribers
		}))
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
	const { store } = loadCombinedSessionStoreForGateway(loadConfig());
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
async function loadGatewayStartupConfigSnapshot(params) {
	let configSnapshot = await readConfigFileSnapshot();
	if (configSnapshot.legacyIssues.length > 0 && isNixMode) throw new Error("Legacy config entries detected while running in Nix mode. Update your Nix config to the latest schema and restart.");
	if (configSnapshot.exists) assertValidGatewayStartupConfigSnapshot(configSnapshot, { includeDoctorHint: true });
	const autoEnable = params.minimalTestGateway ? {
		config: configSnapshot.config,
		changes: []
	} : applyPluginAutoEnable({
		config: configSnapshot.config,
		env: process.env
	});
	if (autoEnable.changes.length === 0) return configSnapshot;
	try {
		await writeConfigFile(autoEnable.config);
		configSnapshot = await readConfigFileSnapshot();
		assertValidGatewayStartupConfigSnapshot(configSnapshot);
		params.log.info(`gateway: auto-enabled plugins:\n${autoEnable.changes.map((entry) => `- ${entry}`).join("\n")}`);
	} catch (err) {
		params.log.warn(`gateway: failed to persist plugin auto-enable changes: ${String(err)}`);
	}
	return configSnapshot;
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
	const preflightConfig = (await params.activateRuntimeSecrets(startupPreflightConfig, {
		reason: "startup",
		activate: false
	})).config;
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
		persist: true,
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
function pruneSkippedStartupSecretSurfaces(config) {
	if (!(isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS)) || !config.channels) return config;
	return {
		...config,
		channels: void 0
	};
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
async function prepareGatewayPluginBootstrap(params) {
	const startupMaintenanceConfig = params.cfgAtStart.channels === void 0 && params.startupRuntimeConfig.channels !== void 0 ? {
		...params.cfgAtStart,
		channels: params.startupRuntimeConfig.channels
	} : params.cfgAtStart;
	if (!params.minimalTestGateway) {
		await runChannelPluginStartupMaintenance({
			cfg: startupMaintenanceConfig,
			env: process.env,
			log: params.log
		});
		await runStartupSessionMigration({
			cfg: params.cfgAtStart,
			env: process.env,
			log: params.log
		});
	}
	initSubagentRegistry();
	const gatewayPluginConfigAtStart = params.minimalTestGateway ? params.cfgAtStart : applyPluginAutoEnable({
		config: params.cfgAtStart,
		env: process.env
	}).config;
	const defaultWorkspaceDir = resolveAgentWorkspaceDir(gatewayPluginConfigAtStart, resolveDefaultAgentId(gatewayPluginConfigAtStart));
	const deferredConfiguredChannelPluginIds = params.minimalTestGateway ? [] : resolveConfiguredDeferredChannelPluginIds({
		config: gatewayPluginConfigAtStart,
		workspaceDir: defaultWorkspaceDir,
		env: process.env
	});
	const startupPluginIds = params.minimalTestGateway ? [] : resolveGatewayStartupPluginIds({
		config: gatewayPluginConfigAtStart,
		activationSourceConfig: params.cfgAtStart,
		workspaceDir: defaultWorkspaceDir,
		env: process.env
	});
	const baseMethods = listGatewayMethods();
	const emptyPluginRegistry = createEmptyPluginRegistry();
	let pluginRegistry = emptyPluginRegistry;
	let baseGatewayMethods = baseMethods;
	if (!params.minimalTestGateway) ({pluginRegistry, gatewayMethods: baseGatewayMethods} = loadGatewayStartupPlugins({
		cfg: gatewayPluginConfigAtStart,
		activationSourceConfig: params.cfgAtStart,
		workspaceDir: defaultWorkspaceDir,
		log: params.log,
		coreGatewayHandlers,
		baseMethods,
		pluginIds: startupPluginIds,
		preferSetupRuntimeForChannelPlugins: deferredConfiguredChannelPluginIds.length > 0,
		suppressPluginInfoLogs: deferredConfiguredChannelPluginIds.length > 0
	}));
	else {
		pluginRegistry = getActivePluginRegistry() ?? emptyPluginRegistry;
		setActivePluginRegistry(pluginRegistry);
	}
	return {
		gatewayPluginConfigAtStart,
		defaultWorkspaceDir,
		deferredConfiguredChannelPluginIds,
		startupPluginIds,
		baseMethods,
		pluginRegistry,
		baseGatewayMethods
	};
}
//#endregion
//#region src/gateway/server-startup-unavailable-methods.ts
const STARTUP_UNAVAILABLE_GATEWAY_METHODS = ["chat.history", "models.list"];
//#endregion
//#region src/infra/bonjour-errors.ts
function formatBonjourError(err) {
	if (err instanceof Error) {
		const msg = err.message.trim() || err.name || (normalizeOptionalString(String(err)) ?? "");
		if (err.name && err.name !== "Error") return msg === err.name ? err.name : `${err.name}: ${msg}`;
		return msg;
	}
	return String(err);
}
//#endregion
//#region src/infra/bonjour-ciao.ts
const CIAO_CANCELLATION_MESSAGE_RE = /^CIAO (?:ANNOUNCEMENT|PROBING) CANCELLED\b/u;
const CIAO_INTERFACE_ASSERTION_MESSAGE_RE = /REACHED ILLEGAL STATE!?\s+IPV4 ADDRESS CHANGE FROM DEFINED TO UNDEFINED!?/u;
function classifyCiaoUnhandledRejection(reason) {
	const formatted = formatBonjourError(reason);
	const message = formatted.toUpperCase();
	if (CIAO_CANCELLATION_MESSAGE_RE.test(message)) return {
		kind: "cancellation",
		formatted
	};
	if (CIAO_INTERFACE_ASSERTION_MESSAGE_RE.test(message)) return {
		kind: "interface-assertion",
		formatted
	};
	return null;
}
//#endregion
//#region src/infra/bonjour.ts
function isDisabledByEnv() {
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
const WATCHDOG_INTERVAL_MS = 5e3;
const REPAIR_DEBOUNCE_MS = 3e4;
const STUCK_ANNOUNCING_MS = 8e3;
const BONJOUR_ANNOUNCED_STATE = "announced";
const CIAO_SELF_PROBE_RETRY_FRAGMENT = "failed probing with reason: Error: Can't probe for a service which is announced already.";
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
function isAnnouncedState(state) {
	return state === BONJOUR_ANNOUNCED_STATE;
}
function handleCiaoUnhandledRejection(reason) {
	const classification = classifyCiaoUnhandledRejection(reason);
	if (!classification) return false;
	if (classification.kind === "interface-assertion") {
		logWarn(`bonjour: suppressing ciao interface assertion: ${classification.formatted}`);
		return true;
	}
	logDebug(`bonjour: ignoring unhandled ciao rejection: ${classification.formatted}`);
	return true;
}
function shouldSuppressCiaoConsoleLog(args) {
	return args.some((arg) => typeof arg === "string" && arg.includes(CIAO_SELF_PROBE_RETRY_FRAGMENT));
}
function installCiaoConsoleNoiseFilter() {
	const originalConsoleLog = console.log;
	console.log = ((...args) => {
		if (shouldSuppressCiaoConsoleLog(args)) return;
		originalConsoleLog(...args);
	});
	return () => {
		if (console.log === originalConsoleLog) return;
		console.log = originalConsoleLog;
	};
}
async function startGatewayBonjourAdvertiser(opts) {
	if (isDisabledByEnv()) return { stop: async () => {} };
	const { getResponder, Protocol } = await import("@homebridge/ciao");
	const restoreConsoleLog = installCiaoConsoleNoiseFilter();
	try {
		const hostname = (process.env.OPENCLAW_MDNS_HOSTNAME?.trim() || "openclaw").replace(/\.local$/i, "").split(".")[0].trim() || "openclaw";
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
		const gatewayTxt = {
			...txtBase,
			transport: "gateway"
		};
		if (!opts.minimal) gatewayTxt.sshPort = String(opts.sshPort ?? 22);
		function createCycle() {
			const responder = getResponder();
			const services = [];
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
			return {
				responder,
				services,
				cleanupUnhandledRejection: services.length > 0 ? registerUnhandledRejectionHandler(handleCiaoUnhandledRejection) : void 0
			};
		}
		async function stopCycle(cycle) {
			if (!cycle) return;
			const responder = cycle.responder;
			const noopAsync = async () => {};
			responder.advertiseService = noopAsync;
			responder.announce = noopAsync;
			responder.probe = noopAsync;
			responder.republishService = noopAsync;
			for (const { svc } of cycle.services) try {
				await svc.destroy();
			} catch {}
			try {
				await cycle.responder.shutdown();
			} catch {} finally {
				cycle.cleanupUnhandledRejection?.();
			}
		}
		function attachConflictListeners(services) {
			for (const { label, svc } of services) try {
				svc.on("name-change", (name) => {
					logWarn(`bonjour: ${label} name conflict resolved; newName=${JSON.stringify(typeof name === "string" ? name : String(name))}`);
				});
				svc.on("hostname-change", (nextHostname) => {
					logWarn(`bonjour: ${label} hostname conflict resolved; newHostname=${JSON.stringify(typeof nextHostname === "string" ? nextHostname : String(nextHostname))}`);
				});
			} catch (err) {
				logDebug(`bonjour: failed to attach listeners for ${label}: ${String(err)}`);
			}
		}
		function startAdvertising(services) {
			for (const { label, svc } of services) try {
				svc.advertise().then(() => {
					getLogger().info(`bonjour: advertised ${serviceSummary(label, svc)}`);
				}).catch((err) => {
					logWarn(`bonjour: advertise failed (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
				});
			} catch (err) {
				logWarn(`bonjour: advertise threw (${serviceSummary(label, svc)}): ${formatBonjourError(err)}`);
			}
		}
		logDebug(`bonjour: starting (hostname=${hostname}, instance=${JSON.stringify(safeServiceName(instanceName))}, gatewayPort=${opts.gatewayPort}${opts.minimal ? ", minimal=true" : `, sshPort=${opts.sshPort ?? 22}`})`);
		let stopped = false;
		let recreatePromise = null;
		let cycle = createCycle();
		const stateTracker = /* @__PURE__ */ new Map();
		attachConflictListeners(cycle.services);
		startAdvertising(cycle.services);
		const updateStateTrackers = (services) => {
			const now = Date.now();
			for (const { label, svc } of services) {
				const nextState = typeof svc.serviceState === "string" ? svc.serviceState : "unknown";
				const current = stateTracker.get(label);
				const nextEnteredAt = current && !isAnnouncedState(current.state) && !isAnnouncedState(nextState) ? current.sinceMs : now;
				if (!current || current.state !== nextState || current.sinceMs !== nextEnteredAt) stateTracker.set(label, {
					state: nextState,
					sinceMs: nextEnteredAt
				});
			}
		};
		const recreateAdvertiser = async (reason) => {
			if (stopped) return;
			if (recreatePromise) return recreatePromise;
			recreatePromise = (async () => {
				logWarn(`bonjour: restarting advertiser (${reason})`);
				await stopCycle(cycle);
				cycle = createCycle();
				stateTracker.clear();
				attachConflictListeners(cycle.services);
				startAdvertising(cycle.services);
			})().finally(() => {
				recreatePromise = null;
			});
			return recreatePromise;
		};
		const lastRepairAttempt = /* @__PURE__ */ new Map();
		const watchdog = setInterval(() => {
			if (stopped || recreatePromise) return;
			updateStateTrackers(cycle.services);
			for (const { label, svc } of cycle.services) {
				const stateUnknown = svc.serviceState;
				if (typeof stateUnknown !== "string") continue;
				const tracked = stateTracker.get(label);
				if (stateUnknown !== "announced" && tracked && Date.now() - tracked.sinceMs >= STUCK_ANNOUNCING_MS) {
					recreateAdvertiser(`service stuck in ${stateUnknown} for ${Date.now() - tracked.sinceMs}ms (${serviceSummary(label, svc)})`);
					return;
				}
				if (stateUnknown === "announced" || stateUnknown === "announcing") continue;
				let key = label;
				try {
					key = `${label}:${svc.getFQDN()}`;
				} catch {}
				const now = Date.now();
				if (now - (lastRepairAttempt.get(key) ?? 0) < REPAIR_DEBOUNCE_MS) continue;
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
		}, WATCHDOG_INTERVAL_MS);
		watchdog.unref?.();
		return { stop: async () => {
			stopped = true;
			try {
				clearInterval(watchdog);
				await recreatePromise;
				await stopCycle(cycle);
			} finally {
				restoreConsoleLog();
			}
		} };
	} catch (err) {
		restoreConsoleLog();
		throw err;
	}
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
//#region src/infra/update-startup.ts
let updateAvailableCache = null;
function getUpdateAvailable() {
	return updateAvailableCache;
}
const UPDATE_CHECK_FILENAME = "update-check.json";
const UPDATE_CHECK_INTERVAL_MS = 1440 * 60 * 1e3;
const ONE_HOUR_MS = 3600 * 1e3;
const AUTO_UPDATE_COMMAND_TIMEOUT_MS = 2700 * 1e3;
const AUTO_STABLE_DELAY_HOURS_DEFAULT = 6;
const AUTO_STABLE_JITTER_HOURS_DEFAULT = 12;
const AUTO_BETA_CHECK_INTERVAL_HOURS_DEFAULT = 1;
function shouldSkipCheck(allowInTests) {
	if (allowInTests) return false;
	if (process.env.VITEST || false) return true;
	return false;
}
function resolveAutoUpdatePolicy(cfg) {
	const auto = cfg.update?.auto;
	const stableDelayHours = typeof auto?.stableDelayHours === "number" && Number.isFinite(auto.stableDelayHours) ? Math.max(0, auto.stableDelayHours) : AUTO_STABLE_DELAY_HOURS_DEFAULT;
	const stableJitterHours = typeof auto?.stableJitterHours === "number" && Number.isFinite(auto.stableJitterHours) ? Math.max(0, auto.stableJitterHours) : AUTO_STABLE_JITTER_HOURS_DEFAULT;
	const betaCheckIntervalHours = typeof auto?.betaCheckIntervalHours === "number" && Number.isFinite(auto.betaCheckIntervalHours) ? Math.max(.25, auto.betaCheckIntervalHours) : AUTO_BETA_CHECK_INTERVAL_HOURS_DEFAULT;
	return {
		enabled: Boolean(auto?.enabled),
		stableDelayHours,
		stableJitterHours,
		betaCheckIntervalHours
	};
}
function resolveCheckIntervalMs(cfg) {
	const channel = normalizeUpdateChannel(cfg.update?.channel) ?? "stable";
	const auto = resolveAutoUpdatePolicy(cfg);
	if (!auto.enabled) return UPDATE_CHECK_INTERVAL_MS;
	if (channel === "beta") return Math.max(ONE_HOUR_MS / 4, Math.floor(auto.betaCheckIntervalHours * ONE_HOUR_MS));
	if (channel === "stable") return ONE_HOUR_MS;
	return UPDATE_CHECK_INTERVAL_MS;
}
async function readState(statePath) {
	try {
		const raw = await fs$1.readFile(statePath, "utf-8");
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
async function writeState(statePath, state) {
	await writeJsonAtomic(statePath, state);
}
function sameUpdateAvailable(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	return a.currentVersion === b.currentVersion && a.latestVersion === b.latestVersion && a.channel === b.channel;
}
function setUpdateAvailableCache(params) {
	if (sameUpdateAvailable(updateAvailableCache, params.next)) return;
	updateAvailableCache = params.next;
	params.onUpdateAvailableChange?.(params.next);
}
function resolvePersistedUpdateAvailable(state) {
	const latestVersion = state.lastAvailableVersion?.trim();
	if (!latestVersion) return null;
	const cmp = compareSemverStrings(VERSION, latestVersion);
	if (cmp == null || cmp >= 0) return null;
	return {
		currentVersion: VERSION,
		latestVersion,
		channel: state.lastAvailableTag?.trim() || "stable"
	};
}
function resolveStableJitterMs(params) {
	if (params.jitterWindowMs <= 0) return 0;
	return createHash("sha256").update(`${params.installId}:${params.version}:${params.tag}`).digest().readUInt32BE(0) % (Math.floor(params.jitterWindowMs) + 1);
}
function resolveStableAutoApplyAtMs(params) {
	if (!params.nextState.autoInstallId) params.nextState.autoInstallId = params.state.autoInstallId?.trim() || randomUUID();
	const installId = params.nextState.autoInstallId;
	if (!(params.state.autoFirstSeenVersion === params.version && params.state.autoFirstSeenTag === params.tag)) {
		params.nextState.autoFirstSeenVersion = params.version;
		params.nextState.autoFirstSeenTag = params.tag;
		params.nextState.autoFirstSeenAt = new Date(params.nowMs).toISOString();
	} else {
		params.nextState.autoFirstSeenVersion = params.state.autoFirstSeenVersion;
		params.nextState.autoFirstSeenTag = params.state.autoFirstSeenTag;
		params.nextState.autoFirstSeenAt = params.state.autoFirstSeenAt;
	}
	const firstSeenMs = params.nextState.autoFirstSeenAt ? Date.parse(params.nextState.autoFirstSeenAt) : params.nowMs;
	const baseDelayMs = Math.max(0, params.stableDelayHours) * ONE_HOUR_MS;
	const jitterWindowMs = Math.max(0, params.stableJitterHours) * ONE_HOUR_MS;
	const jitterMs = resolveStableJitterMs({
		installId,
		version: params.version,
		tag: params.tag,
		jitterWindowMs
	});
	return firstSeenMs + baseDelayMs + jitterMs;
}
async function runAutoUpdateCommand(params) {
	const baseArgs = [
		"update",
		"--yes",
		"--channel",
		params.channel,
		"--json"
	];
	const execPath = process.execPath?.trim();
	const argv1 = process.argv[1]?.trim();
	const lowerExecBase = execPath ? normalizeLowercaseStringOrEmpty(path.basename(execPath)) : "";
	const runtimeIsNodeOrBun = lowerExecBase === "node" || lowerExecBase === "node.exe" || lowerExecBase === "bun" || lowerExecBase === "bun.exe";
	const argv = [];
	if (execPath && argv1) argv.push(execPath, argv1, ...baseArgs);
	else if (execPath && !runtimeIsNodeOrBun) argv.push(execPath, ...baseArgs);
	else if (execPath && params.root) {
		const candidates = [
			path.join(params.root, "dist", "entry.js"),
			path.join(params.root, "dist", "entry.mjs"),
			path.join(params.root, "dist", "index.js"),
			path.join(params.root, "dist", "index.mjs")
		];
		for (const candidate of candidates) try {
			await fs$1.access(candidate);
			argv.push(execPath, candidate, ...baseArgs);
			break;
		} catch {}
	}
	if (argv.length === 0) argv.push("openclaw", ...baseArgs);
	try {
		const res = await runCommandWithTimeout(argv, {
			timeoutMs: params.timeoutMs,
			env: { OPENCLAW_AUTO_UPDATE: "1" }
		});
		return {
			ok: res.code === 0,
			code: res.code,
			stdout: res.stdout,
			stderr: res.stderr,
			reason: res.code === 0 ? void 0 : "non-zero-exit"
		};
	} catch (err) {
		return {
			ok: false,
			code: null,
			reason: String(err)
		};
	}
}
function clearAutoState(nextState) {
	delete nextState.autoFirstSeenVersion;
	delete nextState.autoFirstSeenTag;
	delete nextState.autoFirstSeenAt;
}
async function runGatewayUpdateCheck(params) {
	if (shouldSkipCheck(Boolean(params.allowInTests))) return;
	if (params.isNixMode) return;
	const auto = resolveAutoUpdatePolicy(params.cfg);
	const shouldRunUpdateHints = params.cfg.update?.checkOnStart !== false;
	if (!shouldRunUpdateHints && !auto.enabled) return;
	const statePath = path.join(resolveStateDir(), UPDATE_CHECK_FILENAME);
	const state = await readState(statePath);
	const now = Date.now();
	const lastCheckedAt = state.lastCheckedAt ? Date.parse(state.lastCheckedAt) : null;
	if (shouldRunUpdateHints) setUpdateAvailableCache({
		next: resolvePersistedUpdateAvailable(state),
		onUpdateAvailableChange: params.onUpdateAvailableChange
	});
	else setUpdateAvailableCache({
		next: null,
		onUpdateAvailableChange: params.onUpdateAvailableChange
	});
	const checkIntervalMs = resolveCheckIntervalMs(params.cfg);
	if (lastCheckedAt && Number.isFinite(lastCheckedAt)) {
		if (now - lastCheckedAt < checkIntervalMs) return;
	}
	const root = await resolveOpenClawPackageRoot({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	});
	const status = await checkUpdateStatus({
		root,
		timeoutMs: 2500,
		fetchGit: false,
		includeRegistry: false
	});
	const nextState = {
		...state,
		lastCheckedAt: new Date(now).toISOString()
	};
	if (status.installKind !== "package") {
		delete nextState.lastAvailableVersion;
		delete nextState.lastAvailableTag;
		clearAutoState(nextState);
		setUpdateAvailableCache({
			next: null,
			onUpdateAvailableChange: params.onUpdateAvailableChange
		});
		await writeState(statePath, nextState);
		return;
	}
	const channel = normalizeUpdateChannel(params.cfg.update?.channel) ?? "stable";
	const resolved = await resolveNpmChannelTag({
		channel,
		timeoutMs: 2500
	});
	const tag = resolved.tag;
	if (!resolved.version) {
		await writeState(statePath, nextState);
		return;
	}
	const cmp = compareSemverStrings(VERSION, resolved.version);
	if (cmp != null && cmp < 0) {
		const nextAvailable = {
			currentVersion: VERSION,
			latestVersion: resolved.version,
			channel: tag
		};
		if (shouldRunUpdateHints) setUpdateAvailableCache({
			next: nextAvailable,
			onUpdateAvailableChange: params.onUpdateAvailableChange
		});
		nextState.lastAvailableVersion = resolved.version;
		nextState.lastAvailableTag = tag;
		const shouldNotify = state.lastNotifiedVersion !== resolved.version || state.lastNotifiedTag !== tag;
		if (shouldRunUpdateHints && shouldNotify) {
			params.log.info(`update available (${tag}): v${resolved.version} (current v${VERSION}). Run: ${formatCliCommand("openclaw update")}`);
			nextState.lastNotifiedVersion = resolved.version;
			nextState.lastNotifiedTag = tag;
		}
		if (auto.enabled && (channel === "stable" || channel === "beta")) {
			const runAuto = params.runAutoUpdate ?? runAutoUpdateCommand;
			const attemptIntervalMs = channel === "beta" ? Math.max(ONE_HOUR_MS / 4, Math.floor(auto.betaCheckIntervalHours * ONE_HOUR_MS)) : ONE_HOUR_MS;
			const lastAttemptAt = state.autoLastAttemptAt ? Date.parse(state.autoLastAttemptAt) : null;
			const recentAttemptForSameVersion = state.autoLastAttemptVersion === resolved.version && lastAttemptAt != null && Number.isFinite(lastAttemptAt) && now - lastAttemptAt < attemptIntervalMs;
			let dueNow = channel === "beta";
			let applyAfterMs = null;
			if (channel === "stable") {
				applyAfterMs = resolveStableAutoApplyAtMs({
					state,
					nextState,
					nowMs: now,
					version: resolved.version,
					tag,
					stableDelayHours: auto.stableDelayHours,
					stableJitterHours: auto.stableJitterHours
				});
				dueNow = now >= applyAfterMs;
			}
			if (!dueNow) params.log.info("auto-update deferred (stable rollout window active)", {
				version: resolved.version,
				tag,
				applyAfter: applyAfterMs ? new Date(applyAfterMs).toISOString() : void 0
			});
			else if (recentAttemptForSameVersion) params.log.info("auto-update deferred (recent attempt exists)", {
				version: resolved.version,
				tag
			});
			else {
				nextState.autoLastAttemptVersion = resolved.version;
				nextState.autoLastAttemptAt = new Date(now).toISOString();
				const outcome = await runAuto({
					channel,
					timeoutMs: AUTO_UPDATE_COMMAND_TIMEOUT_MS,
					root: root ?? void 0
				});
				if (outcome.ok) {
					nextState.autoLastSuccessVersion = resolved.version;
					nextState.autoLastSuccessAt = new Date(now).toISOString();
					params.log.info("auto-update applied", {
						channel,
						version: resolved.version,
						tag
					});
				} else params.log.info("auto-update attempt failed", {
					channel,
					version: resolved.version,
					tag,
					reason: outcome.reason ?? `exit:${outcome.code}`
				});
			}
		}
	} else {
		delete nextState.lastAvailableVersion;
		delete nextState.lastAvailableTag;
		clearAutoState(nextState);
		setUpdateAvailableCache({
			next: null,
			onUpdateAvailableChange: params.onUpdateAvailableChange
		});
	}
	await writeState(statePath, nextState);
}
function scheduleGatewayUpdateCheck(params) {
	let stopped = false;
	let timer = null;
	let running = false;
	const tick = async () => {
		if (stopped || running) return;
		running = true;
		try {
			await runGatewayUpdateCheck(params);
		} catch {} finally {
			running = false;
		}
		if (stopped) return;
		const intervalMs = resolveCheckIntervalMs(params.cfg);
		timer = setTimeout(() => {
			tick();
		}, intervalMs);
	};
	tick();
	return () => {
		stopped = true;
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};
}
//#endregion
//#region src/gateway/server/health-state.ts
let presenceVersion = 1;
let healthVersion = 1;
let healthCache = null;
let healthRefresh = null;
let broadcastHealthUpdate = null;
function buildGatewaySnapshot(opts) {
	const cfg = loadConfig();
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
		logDiscovery: params.logDiscovery
	})).bonjourStop;
	if (!params.minimalTestGateway) {
		setSkillsRemoteRegistry(params.nodeRegistry);
		primeRemoteSkillsCache();
		startTaskRegistryMaintenance();
	}
	const skillsChangeUnsub = params.minimalTestGateway ? () => {} : registerSkillsChangeListener((event) => {
		if (event.reason === "remote-node") return;
		const existingTimer = params.getSkillsRefreshTimer();
		if (existingTimer) clearTimeout(existingTimer);
		const nextTimer = setTimeout(() => {
			params.setSkillsRefreshTimer(null);
			refreshRemoteBinsForConnectedNodes(params.loadConfig());
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
//#region src/hooks/import-url.ts
/**
* Build an import URL for a hook handler module.
*
* Bundled hooks (shipped in dist/) are immutable between installs, so they
* can be imported without a cache-busting suffix — letting V8 reuse its
* module cache across gateway restarts.
*
* Workspace, managed, and plugin hooks may be edited by the user between
* restarts. For those we append `?t=<mtime>&s=<size>` so the module key
* reflects on-disk changes while staying stable for unchanged files.
*/
/**
* Sources whose handler files never change between `npm install` runs.
* Imports from these sources skip cache busting entirely.
*/
const IMMUTABLE_SOURCES = new Set(["openclaw-bundled"]);
function buildImportUrl(handlerPath, source) {
	const base = pathToFileURL(handlerPath).href;
	if (IMMUTABLE_SOURCES.has(source)) return base;
	try {
		const { mtimeMs, size } = fs.statSync(handlerPath);
		return `${base}?t=${mtimeMs}&s=${size}`;
	} catch {
		return `${base}?t=${Date.now()}`;
	}
}
//#endregion
//#region src/hooks/legacy-config.ts
function getLegacyInternalHookHandlers(config) {
	const handlers = config?.hooks?.internal?.handlers;
	return Array.isArray(handlers) ? handlers : [];
}
//#endregion
//#region src/hooks/loader.ts
/**
* Dynamic loader for hook handlers
*
* Loads hook handlers from external modules based on configuration
* and from directory-based discovery (bundled, managed, workspace)
*/
const log$3 = createSubsystemLogger("hooks:loader");
const loadedHookRegistrations = resolveGlobalSingleton(Symbol.for("openclaw.loadedInternalHookRegistrations"), () => []);
function safeLogValue(value) {
	return sanitizeForLog(value);
}
function maybeWarnTrustedHookSource(source) {
	if (source === "openclaw-workspace") {
		log$3.warn("Loading workspace hook code into the gateway process. Workspace hooks are trusted local code.");
		return;
	}
	if (source === "openclaw-managed") log$3.warn("Loading managed hook code into the gateway process. Managed hooks are trusted local code.");
}
function resetLoadedInternalHooks() {
	while (loadedHookRegistrations.length > 0) {
		const registration = loadedHookRegistrations.pop();
		if (!registration) continue;
		unregisterInternalHook(registration.event, registration.handler);
	}
}
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
	resetLoadedInternalHooks();
	if (cfg.hooks?.internal?.enabled === false) return 0;
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
		for (const entry of eligible) try {
			const hookBaseDir = resolveExistingRealpath(entry.hook.baseDir);
			if (!hookBaseDir) {
				log$3.error(`Hook '${safeLogValue(entry.hook.name)}' base directory is no longer readable: ${safeLogValue(entry.hook.baseDir)}`);
				continue;
			}
			const opened = await openBoundaryFile({
				absolutePath: entry.hook.handlerPath,
				rootPath: hookBaseDir,
				boundaryLabel: "hook directory"
			});
			if (!opened.ok) {
				log$3.error(`Hook '${safeLogValue(entry.hook.name)}' handler path fails boundary checks: ${safeLogValue(entry.hook.handlerPath)}`);
				continue;
			}
			const safeHandlerPath = opened.path;
			fs.closeSync(opened.fd);
			maybeWarnTrustedHookSource(entry.hook.source);
			const mod = await import(buildImportUrl(safeHandlerPath, entry.hook.source));
			const exportName = entry.metadata?.export ?? "default";
			const handler = resolveFunctionModuleExport({
				mod,
				exportName
			});
			if (!handler) {
				log$3.error(`Handler '${safeLogValue(exportName)}' from ${safeLogValue(entry.hook.name)} is not a function`);
				continue;
			}
			const events = entry.metadata?.events ?? [];
			if (events.length === 0) {
				log$3.warn(`Hook '${safeLogValue(entry.hook.name)}' has no events defined in metadata`);
				continue;
			}
			for (const event of events) {
				registerInternalHook(event, handler);
				loadedHookRegistrations.push({
					event,
					handler
				});
			}
			log$3.debug(`Registered hook: ${safeLogValue(entry.hook.name)} -> ${events.map((event) => safeLogValue(event)).join(", ")}${exportName !== "default" ? ` (export: ${safeLogValue(exportName)})` : ""}`);
			loadedCount++;
		} catch (err) {
			log$3.error(`Failed to load hook ${safeLogValue(entry.hook.name)}: ${safeLogValue(formatErrorMessage(err))}`);
		}
	} catch (err) {
		log$3.error(`Failed to load directory-based hooks: ${safeLogValue(formatErrorMessage(err))}`);
	}
	const handlers = getLegacyInternalHookHandlers(cfg);
	for (const handlerConfig of handlers) try {
		const rawModule = handlerConfig.module.trim();
		if (!rawModule) {
			log$3.error("Handler module path is empty");
			continue;
		}
		if (path.isAbsolute(rawModule)) {
			log$3.error(`Handler module path must be workspace-relative (got absolute path): ${safeLogValue(rawModule)}`);
			continue;
		}
		const baseDir = path.resolve(workspaceDir);
		const modulePath = path.resolve(baseDir, rawModule);
		const baseDirReal = resolveExistingRealpath(baseDir);
		if (!baseDirReal) {
			log$3.error(`Workspace directory is no longer readable while loading hooks: ${safeLogValue(baseDir)}`);
			continue;
		}
		const modulePathSafe = resolveExistingRealpath(modulePath);
		if (!modulePathSafe) {
			log$3.error(`Handler module path could not be resolved with realpath: ${safeLogValue(rawModule)}`);
			continue;
		}
		const rel = path.relative(baseDirReal, modulePathSafe);
		if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
			log$3.error(`Handler module path must stay within workspaceDir: ${safeLogValue(rawModule)}`);
			continue;
		}
		const opened = await openBoundaryFile({
			absolutePath: modulePathSafe,
			rootPath: baseDirReal,
			boundaryLabel: "workspace directory"
		});
		if (!opened.ok) {
			log$3.error(`Handler module path fails boundary checks under workspaceDir: ${safeLogValue(rawModule)}`);
			continue;
		}
		const safeModulePath = opened.path;
		fs.closeSync(opened.fd);
		log$3.warn(`Loading legacy internal hook module from workspace path ${safeLogValue(rawModule)}. Legacy hook modules are trusted local code.`);
		const mod = await import(buildImportUrl(safeModulePath, "openclaw-workspace"));
		const exportName = handlerConfig.export ?? "default";
		const handler = resolveFunctionModuleExport({
			mod,
			exportName
		});
		if (!handler) {
			log$3.error(`Handler '${safeLogValue(exportName)}' from ${safeLogValue(modulePath)} is not a function`);
			continue;
		}
		registerInternalHook(handlerConfig.event, handler);
		loadedHookRegistrations.push({
			event: handlerConfig.event,
			handler
		});
		log$3.debug(`Registered hook (legacy): ${safeLogValue(handlerConfig.event)} -> ${safeLogValue(modulePath)}${exportName !== "default" ? `#${safeLogValue(exportName)}` : ""}`);
		loadedCount++;
	} catch (err) {
		log$3.error(`Failed to load hook handler from ${safeLogValue(handlerConfig.module)}: ${safeLogValue(formatErrorMessage(err))}`);
	}
	return loadedCount;
}
function resolveExistingRealpath(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return null;
	}
}
//#endregion
//#region src/plugins/services.ts
const log$2 = createSubsystemLogger("plugins");
function createPluginLogger() {
	return {
		info: (msg) => log$2.info(msg),
		warn: (msg) => log$2.warn(msg),
		error: (msg) => log$2.error(msg),
		debug: (msg) => log$2.debug(msg)
	};
}
function createServiceContext(params) {
	return {
		config: params.config,
		workspaceDir: params.workspaceDir,
		stateDir: STATE_DIR,
		logger: createPluginLogger()
	};
}
async function startPluginServices(params) {
	const running = [];
	const serviceContext = createServiceContext({
		config: params.config,
		workspaceDir: params.workspaceDir
	});
	for (const entry of params.registry.services) {
		const service = entry.service;
		try {
			await service.start(serviceContext);
			running.push({
				id: service.id,
				stop: service.stop ? () => service.stop?.(serviceContext) : void 0
			});
		} catch (err) {
			const error = err;
			const stack = error?.stack?.trim();
			log$2.error(`plugin service failed (${service.id}, plugin=${entry.pluginId}, root=${entry.rootDir ?? "unknown"}): ${error?.message ?? String(err)}${stack ? `\n${stack}` : ""}`);
		}
	}
	return { stop: async () => {
		for (const entry of running.toReversed()) {
			if (!entry.stop) continue;
			try {
				await entry.stop();
			} catch (err) {
				log$2.warn(`plugin service stop failed (${entry.id}): ${String(err)}`);
			}
		}
	} };
}
//#endregion
//#region src/gateway/server-restart-sentinel.ts
const log$1 = createSubsystemLogger("gateway/restart-sentinel");
const OUTBOUND_RETRY_DELAY_MS = 1e3;
const OUTBOUND_MAX_ATTEMPTS = 45;
function hasRoutableDeliveryContext(context) {
	return Boolean(context?.channel && context?.to);
}
function enqueueRestartSentinelWake(message, sessionKey, deliveryContext) {
	enqueueSystemEvent(message, {
		sessionKey,
		...deliveryContext ? { deliveryContext } : {}
	});
	requestHeartbeatNow({
		reason: "wake",
		sessionKey
	});
}
async function waitForOutboundRetry(delayMs) {
	await new Promise((resolve) => {
		setTimeout(resolve, delayMs).unref?.();
	});
}
async function deliverRestartSentinelNotice(params) {
	const payloads = [{ text: params.message }];
	const queueId = await enqueueDelivery({
		channel: params.channel,
		to: params.to,
		accountId: params.accountId,
		replyToId: params.replyToId,
		threadId: params.threadId,
		payloads,
		bestEffort: false
	}).catch(() => null);
	for (let attempt = 1; attempt <= OUTBOUND_MAX_ATTEMPTS; attempt += 1) try {
		if ((await deliverOutboundPayloads({
			cfg: params.cfg,
			channel: params.channel,
			to: params.to,
			accountId: params.accountId,
			replyToId: params.replyToId,
			threadId: params.threadId,
			payloads,
			session: params.session,
			deps: params.deps,
			bestEffort: false,
			skipQueue: true
		})).length > 0) {
			if (queueId) await ackDelivery(queueId).catch(() => {});
			return;
		}
		throw new Error("outbound delivery returned no results");
	} catch (err) {
		const retrying = attempt < OUTBOUND_MAX_ATTEMPTS;
		const suffix = retrying ? `; retrying in ${OUTBOUND_RETRY_DELAY_MS}ms` : "";
		log$1.warn(`${params.summary}: outbound delivery failed${suffix}: ${String(err)}`, {
			channel: params.channel,
			to: params.to,
			sessionKey: params.sessionKey,
			attempt,
			maxAttempts: OUTBOUND_MAX_ATTEMPTS
		});
		if (!retrying) {
			if (queueId) await failDelivery(queueId, formatErrorMessage(err)).catch(() => {});
			return;
		}
		await waitForOutboundRetry(OUTBOUND_RETRY_DELAY_MS);
	}
}
async function scheduleRestartSentinelWake(params) {
	const sentinel = await consumeRestartSentinel();
	if (!sentinel) return;
	const payload = sentinel.payload;
	const sessionKey = payload.sessionKey?.trim();
	const message = formatRestartSentinelMessage(payload);
	const summary = summarizeRestartSentinel(payload);
	const wakeDeliveryContext = mergeDeliveryContext(payload.threadId != null ? {
		...payload.deliveryContext,
		threadId: payload.threadId
	} : payload.deliveryContext, void 0);
	if (!sessionKey) {
		enqueueSystemEvent(message, { sessionKey: resolveMainSessionKeyFromConfig() });
		return;
	}
	const { baseSessionKey, threadId: sessionThreadId } = parseSessionThreadInfo(sessionKey);
	const { cfg, entry } = loadSessionEntry(sessionKey);
	const sentinelContext = payload.deliveryContext;
	let sessionDeliveryContext = deliveryContextFromSession(entry);
	if (!hasRoutableDeliveryContext(sessionDeliveryContext) && baseSessionKey && baseSessionKey !== sessionKey) {
		const { entry: baseEntry } = loadSessionEntry(baseSessionKey);
		sessionDeliveryContext = mergeDeliveryContext(sessionDeliveryContext, deliveryContextFromSession(baseEntry));
	}
	const origin = mergeDeliveryContext(sentinelContext, sessionDeliveryContext);
	enqueueRestartSentinelWake(message, sessionKey, wakeDeliveryContext);
	const channelRaw = origin?.channel;
	const channel = channelRaw ? normalizeChannelId(channelRaw) : null;
	const to = origin?.to;
	if (!channel || !to) return;
	const resolved = resolveOutboundTarget({
		channel,
		to,
		cfg,
		accountId: origin?.accountId,
		mode: "implicit"
	});
	if (!resolved.ok) return;
	const threadId = payload.threadId ?? sessionThreadId ?? (origin?.threadId != null ? String(origin.threadId) : void 0);
	const replyTransport = getChannelPlugin(channel)?.threading?.resolveReplyTransport?.({
		cfg,
		accountId: origin?.accountId,
		threadId
	}) ?? null;
	const replyToId = replyTransport?.replyToId ?? void 0;
	const resolvedThreadId = replyTransport && Object.hasOwn(replyTransport, "threadId") ? replyTransport.threadId != null ? String(replyTransport.threadId) : void 0 : threadId;
	const outboundSession = buildOutboundSessionContext({
		cfg,
		sessionKey
	});
	await deliverRestartSentinelNotice({
		deps: params.deps,
		cfg,
		sessionKey,
		summary,
		message,
		channel,
		to: resolved.to,
		accountId: origin?.accountId,
		replyToId,
		threadId: resolvedThreadId,
		session: outboundSession
	});
}
function shouldWakeFromRestartSentinel() {
	return !process.env.VITEST && true;
}
//#endregion
//#region src/gateway/server-startup-log.ts
function logGatewayStartup(params) {
	const { provider: agentProvider, model: agentModel } = resolveConfiguredModelRef$1({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const modelRef = `${agentProvider}/${agentModel}`;
	params.log.info(`agent model: ${modelRef}`, { consoleMessage: `agent model: ${chalk.whiteBright(modelRef)}` });
	const startupDurationMs = typeof params.startupStartedAt === "number" ? Date.now() - params.startupStartedAt : null;
	const startupDurationLabel = startupDurationMs == null ? null : `${(startupDurationMs / 1e3).toFixed(1)}s`;
	params.log.info(`ready (${formatReadyDetails(params.loadedPluginIds, startupDurationLabel)})`);
	params.log.info(`log file: ${getResolvedLoggerSettings().file}`);
	if (params.isNixMode) params.log.info("gateway: running in Nix mode (config managed externally)");
	const enabledDangerousFlags = collectEnabledInsecureOrDangerousFlags(params.cfg);
	if (enabledDangerousFlags.length > 0) {
		const warning = `security warning: dangerous config flags enabled: ${enabledDangerousFlags.join(", ")}. Run \`openclaw security audit\`.`;
		params.log.warn(warning);
	}
}
function formatReadyDetails(loadedPluginIds, startupDurationLabel) {
	const pluginIds = [...new Set(loadedPluginIds.map((id) => id.trim()).filter(Boolean))].toSorted((a, b) => a.localeCompare(b));
	const pluginSummary = pluginIds.length === 0 ? "0 plugins" : `${pluginIds.length} ${pluginIds.length === 1 ? "plugin" : "plugins"}: ${pluginIds.join(", ")}`;
	if (!startupDurationLabel) return pluginSummary;
	return pluginIds.length === 0 ? `${pluginSummary}, ${startupDurationLabel}` : `${pluginSummary}; ${startupDurationLabel}`;
}
//#endregion
//#region src/gateway/server-startup-memory.ts
async function startGatewayMemoryBackend(params) {
	const agentIds = listAgentIds(params.cfg);
	for (const agentId of agentIds) {
		if (!resolveMemorySearchConfig(params.cfg, agentId)) continue;
		const resolved = resolveActiveMemoryBackendConfig({
			cfg: params.cfg,
			agentId
		});
		if (!resolved) continue;
		if (resolved.backend !== "qmd" || !resolved.qmd) continue;
		const { manager, error } = await getActiveMemorySearchManager({
			cfg: params.cfg,
			agentId
		});
		if (!manager) {
			params.log.warn(`qmd memory startup initialization failed for agent "${agentId}": ${error ?? "unknown error"}`);
			continue;
		}
		params.log.info?.(`qmd memory startup initialization armed for agent "${agentId}"`);
	}
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
		params.logTailscale.warn(`${params.tailscaleMode} failed: ${formatErrorMessage(err)}`);
	}
	if (!params.resetOnExit) return null;
	return async () => {
		try {
			if (params.tailscaleMode === "serve") await disableTailscaleServe();
			else await disableTailscaleFunnel();
		} catch (err) {
			params.logTailscale.warn(`${params.tailscaleMode} cleanup failed: ${formatErrorMessage(err)}`);
		}
	};
}
//#endregion
//#region src/gateway/server-startup-post-attach.ts
const SESSION_LOCK_STALE_MS = 1800 * 1e3;
async function prewarmConfiguredPrimaryModel(params) {
	if (!resolveAgentModelPrimaryValue(params.cfg.agents?.defaults?.model)?.trim()) return;
	const { provider, model } = resolveConfiguredModelRef$1({
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
		if (!resolved.model) throw new Error(resolved.error ?? `Unknown model: ${provider}/${model} (startup warmup only checks static model resolution)`);
	} catch (err) {
		params.log.warn(`startup model warmup failed for ${provider}/${model}: ${String(err)}`);
	}
}
async function startGatewaySidecars(params) {
	try {
		const sessionDirs = await resolveAgentSessionDirs(resolveStateDir(process.env));
		for (const sessionsDir of sessionDirs) await cleanStaleLockFiles({
			sessionsDir,
			staleMs: SESSION_LOCK_STALE_MS,
			removeStale: true,
			log: { warn: (message) => params.log.warn(message) }
		});
	} catch (err) {
		params.log.warn(`session lock cleanup failed on startup: ${String(err)}`);
	}
	await startGmailWatcherWithLogs({
		cfg: params.cfg,
		log: params.logHooks
	});
	if (params.cfg.hooks?.gmail?.model) {
		const hooksModelRef = resolveHooksGmailModel$1({
			cfg: params.cfg,
			defaultProvider: DEFAULT_PROVIDER
		});
		if (hooksModelRef) {
			const { provider: resolvedDefaultProvider, model: defaultModel } = resolveConfiguredModelRef$1({
				cfg: params.cfg,
				defaultProvider: DEFAULT_PROVIDER,
				defaultModel: DEFAULT_MODEL
			});
			const catalog = await loadModelCatalog({ config: params.cfg });
			const status = getModelRefStatus$1({
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
	try {
		setInternalHooksEnabled(params.cfg.hooks?.internal?.enabled !== false);
		const loadedCount = await loadInternalHooks(params.cfg, params.defaultWorkspaceDir);
		if (loadedCount > 0) params.logHooks.info(`loaded ${loadedCount} internal hook handler${loadedCount > 1 ? "s" : ""}`);
	} catch (err) {
		params.logHooks.error(`failed to load hooks: ${String(err)}`);
	}
	if (!(isTruthyEnvValue(process.env.OPENCLAW_SKIP_CHANNELS) || isTruthyEnvValue(process.env.OPENCLAW_SKIP_PROVIDERS))) try {
		await prewarmConfiguredPrimaryModel({
			cfg: params.cfg,
			log: params.log
		});
		await params.startChannels();
	} catch (err) {
		params.logChannels.error(`channel startup failed: ${String(err)}`);
	}
	else params.logChannels.info("skipping channel start (OPENCLAW_SKIP_CHANNELS=1 or OPENCLAW_SKIP_PROVIDERS=1)");
	if (params.cfg.hooks?.internal?.enabled !== false) setTimeout(() => {
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
	if (params.cfg.acp?.enabled) getAcpSessionManager().reconcilePendingSessionIdentities({ cfg: params.cfg }).then((result) => {
		if (result.checked === 0) return;
		params.log.warn(`acp startup identity reconcile (renderer=v1): checked=${result.checked} resolved=${result.resolved} failed=${result.failed}`);
	}).catch((err) => {
		params.log.warn(`acp startup identity reconcile failed: ${String(err)}`);
	});
	startGatewayMemoryBackend({
		cfg: params.cfg,
		log: params.log
	}).catch((err) => {
		params.log.warn(`qmd memory startup initialization failed: ${String(err)}`);
	});
	if (shouldWakeFromRestartSentinel()) setTimeout(() => {
		scheduleRestartSentinelWake({ deps: params.deps });
	}, 750);
	scheduleSubagentOrphanRecovery();
	return { pluginServices };
}
const defaultGatewayPostAttachRuntimeDeps = {
	getGlobalHookRunner,
	logGatewayStartup,
	scheduleGatewayUpdateCheck,
	startGatewaySidecars,
	startGatewayTailscaleExposure
};
async function startGatewayPostAttachRuntime(params, runtimeDeps = defaultGatewayPostAttachRuntimeDeps) {
	runtimeDeps.logGatewayStartup({
		cfg: params.cfgAtStart,
		bindHost: params.bindHost,
		bindHosts: params.bindHosts,
		port: params.port,
		tlsEnabled: params.tlsEnabled,
		loadedPluginIds: params.pluginRegistry.plugins.filter((plugin) => plugin.status === "loaded").map((plugin) => plugin.id),
		log: params.log,
		isNixMode: params.isNixMode,
		startupStartedAt: params.startupStartedAt
	});
	const stopGatewayUpdateCheck = params.minimalTestGateway ? () => {} : runtimeDeps.scheduleGatewayUpdateCheck({
		cfg: params.cfgAtStart,
		log: params.log,
		isNixMode: params.isNixMode,
		onUpdateAvailableChange: (updateAvailable) => {
			const payload = { updateAvailable };
			params.broadcast(GATEWAY_EVENT_UPDATE_AVAILABLE, payload, { dropIfSlow: true });
		}
	});
	const tailscaleCleanup = params.minimalTestGateway ? null : await runtimeDeps.startGatewayTailscaleExposure({
		tailscaleMode: params.tailscaleMode,
		resetOnExit: params.resetOnExit,
		port: params.port,
		controlUiBasePath: params.controlUiBasePath,
		logTailscale: params.logTailscale
	});
	let pluginServices = null;
	if (!params.minimalTestGateway) {
		params.log.info("starting channels and sidecars...");
		({pluginServices} = await runtimeDeps.startGatewaySidecars({
			cfg: params.gatewayPluginConfigAtStart,
			pluginRegistry: params.pluginRegistry,
			defaultWorkspaceDir: params.defaultWorkspaceDir,
			deps: params.deps,
			startChannels: params.startChannels,
			log: params.log,
			logHooks: params.logHooks,
			logChannels: params.logChannels
		}));
		for (const method of STARTUP_UNAVAILABLE_GATEWAY_METHODS) params.unavailableGatewayMethods.delete(method);
	}
	if (!params.minimalTestGateway) {
		const hookRunner = runtimeDeps.getGlobalHookRunner();
		if (hookRunner?.hasHooks("gateway_start")) hookRunner.runGatewayStart({ port: params.port }, { port: params.port }).catch((err) => {
			params.log.warn(`gateway_start hook failed: ${String(err)}`);
		});
	}
	return {
		stopGatewayUpdateCheck,
		tailscaleCleanup,
		pluginServices
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
function shouldSkipControlUiPairing(policy, role, trustedProxyAuthOk = false, authMode) {
	if (trustedProxyAuthOk) return true;
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
	return params.locality !== "remote" && (!params.hasBrowserOriginHeader || params.isControlUi || params.isWebchat) && (params.reason === "not-paired" || params.reason === "scope-upgrade" || params.reason === "role-upgrade");
}
function isCliContainerLocalEquivalent(params) {
	const isCliClient = params.connectParams.client.id === GATEWAY_CLIENT_IDS.CLI && params.connectParams.client.mode === GATEWAY_CLIENT_MODES.CLI;
	const usesSharedSecretAuth = params.authMethod === "token" || params.authMethod === "password";
	return isCliClient && params.sharedAuthOk && usesSharedSecretAuth && !params.hasProxyHeaders && !params.hasBrowserOriginHeader && isLoopbackAddress(params.remoteAddress) && isPrivateOrLoopbackHost(resolveHostName(params.requestHost));
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
	const { socket, upgradeReq, connId, remoteAddr, remotePort, localAddr, localPort, endpoint, forwardedFor, realIp, requestHost, requestOrigin, requestUserAgent, canvasHostUrl, connectNonce, getResolvedAuth, getRequiredSharedGatewaySessionGeneration, rateLimiter, browserRateLimiter, gatewayMethods, events, extraHandlers, buildRequestContext, send, close, isClosed, clearHandshakeTimer, getClient, setClient, setHandshakeState, setCloseCause, setLastFrameMeta, originCheckMetrics, logGateway, logHealth, logWsControl } = params;
	const sendFrame = async (obj) => await new Promise((resolve, reject) => {
		socket.send(JSON.stringify(obj), (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
	const configSnapshot = loadConfig();
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
	const hasProxyHeaders = Boolean(forwardedFor || realIp);
	const remoteIsTrustedProxy = isTrustedProxyAddress(remoteAddr, trustedProxies);
	const hasUntrustedProxyHeaders = hasProxyHeaders && !remoteIsTrustedProxy;
	const hostIsLocalish = isLocalishHost(requestHost);
	const isLocalClient = isLocalDirectRequest(upgradeReq, trustedProxies, allowRealIpFallback);
	const reportedClientIp = isLocalClient || hasUntrustedProxyHeaders ? void 0 : clientIp && !isLoopbackAddress(clientIp) ? clientIp : void 0;
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
	socket.on("message", async (data) => {
		if (isClosed()) return;
		const preauthPayloadBytes = !getClient() ? getRawDataByteLength(data) : void 0;
		if (preauthPayloadBytes !== void 0 && preauthPayloadBytes > 65536) {
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
					if (!device && shouldClearUnboundScopesForMissingDeviceIdentity({
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
				const trustedProxyAuthOk = isTrustedProxyControlUiOperatorAuth({
					isControlUi,
					role,
					authMode: resolvedAuth.mode,
					authOk,
					authMethod
				});
				const pairingLocality = resolvePairingLocality({
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
				const skipLocalBackendSelfPairing = shouldSkipLocalBackendSelfPairing({
					connectParams,
					locality: pairingLocality,
					hasBrowserOriginHeader,
					sharedAuthOk,
					authMethod
				});
				const skipControlUiPairingForDevice = shouldSkipControlUiPairing(controlUiAuthPolicy, role, trustedProxyAuthOk, resolvedAuth.mode);
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
							reason
						});
						const allowSilentBootstrapPairing = authMethod === "bootstrap-token" && reason === "not-paired" && role === "node" && scopes.length === 0 && !existingPairedDevice && boundBootstrapProfile !== null;
						const bootstrapProfileForSilentApproval = allowSilentBootstrapPairing ? boundBootstrapProfile : null;
						const bootstrapPairingRoles = bootstrapProfileForSilentApproval ? Array.from(new Set([role, ...bootstrapProfileForSilentApproval.roles])) : void 0;
						const pairing = await requestDevicePairing({
							deviceId: device.id,
							publicKey: devicePublicKey,
							...clientPairingMetadata,
							...bootstrapPairingRoles ? { roles: bootstrapPairingRoles } : {},
							silent: reason === "scope-upgrade" ? false : allowSilentLocalPairing || allowSilentBootstrapPairing
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
								error: errorShape(ErrorCodes.NOT_PAIRED, "pairing required", { details: {
									code: ConnectErrorDetailCodes.PAIRING_REQUIRED,
									...recoveryRequestId ? { requestId: recoveryRequestId } : {},
									reason
								} })
							});
							close(1008, "pairing required");
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
							logGateway.warn(`security audit: device metadata upgrade requested reason=metadata-upgrade device=${device.id} ip=${reportedClientIp ?? "unknown-ip"} auth=${authMethod} payload=${deviceAuthPayloadVersion ?? "unknown"} claimedPlatform=${claimedPlatform ?? "<none>"} pinnedPlatform=${pairedPlatform ?? "<none>"} claimedDeviceFamily=${claimedDeviceFamily ?? "<none>"} pinnedDeviceFamily=${pairedDeviceFamily ?? "<none>"} client=${connectParams.client.id} conn=${connId}`);
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
						cfg: loadConfig(),
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
				const snapshot = buildGatewaySnapshot({ includeSensitive: scopes.includes(ADMIN_SCOPE$1) });
				const cachedHealth = getHealthCache();
				if (cachedHealth) {
					snapshot.health = cachedHealth;
					snapshot.stateVersion.health = getHealthVersion();
				}
				const canvasCapability = canvasHostUrl ? mintCanvasCapabilityToken() : void 0;
				const canvasCapabilityExpiresAtMs = canvasCapability ? Date.now() + CANVAS_CAPABILITY_TTL_MS : void 0;
				const usesSharedGatewayAuth = authMethod === "token" || authMethod === "password";
				const sharedGatewaySessionGeneration = usesSharedGatewayAuth ? resolveSharedGatewaySessionGeneration(resolvedAuth) : void 0;
				const scopedCanvasHostUrl = canvasHostUrl && canvasCapability ? buildCanvasScopedHostUrl(canvasHostUrl, canvasCapability) ?? canvasHostUrl : canvasHostUrl;
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
					auth: deviceToken ? {
						deviceToken: deviceToken.token,
						role: deviceToken.role,
						scopes: deviceToken.scopes,
						issuedAtMs: deviceToken.rotatedAtMs ?? deviceToken.createdAtMs,
						...bootstrapDeviceTokens.length > 1 ? { deviceTokens: bootstrapDeviceTokens.slice(1) } : {}
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
					usesSharedGatewayAuth,
					sharedGatewaySessionGeneration,
					presenceKey,
					clientIp: reportedClientIp,
					canvasHostUrl,
					canvasCapability,
					canvasCapabilityExpiresAtMs
				};
				setSocketMaxPayload(socket, MAX_PAYLOAD_BYTES);
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
function attachGatewayWsConnectionHandler(params) {
	const { wss, clients, preauthConnectionBudget, port, gatewayHost, canvasHostEnabled, canvasHostServerPort, resolvedAuth, getResolvedAuth = () => resolvedAuth, getRequiredSharedGatewaySessionGeneration = () => resolveSharedGatewaySessionGeneration(getResolvedAuth()), rateLimiter, browserRateLimiter, gatewayMethods, events, logGateway, logHealth, logWsControl, extraHandlers, broadcast, buildRequestContext } = params;
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
			send,
			close,
			isClosed: () => closed,
			clearHandshakeTimer: () => clearTimeout(handshakeTimer),
			getClient: () => client,
			setClient: (next) => {
				releasePreauthBudget();
				client = next;
				clients.add(next);
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
					channelId,
					skipStaleSocketCheck: getChannelPlugin(channelId)?.status?.skipStaleSocketHealthCheck
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
	const seeded = ensureControlUiAllowedOriginsForNonLoopbackBind(params.config, { isContainerEnvironment });
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
let cachedChannelRuntime = null;
function getChannelRuntime() {
	cachedChannelRuntime ??= createPluginRuntime().channel;
	return cachedChannelRuntime;
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
function createGatewayAuthRateLimiters(rateLimitConfig) {
	return {
		rateLimiter: rateLimitConfig ? createAuthRateLimiter(rateLimitConfig) : void 0,
		browserRateLimiter: createAuthRateLimiter({
			...rateLimitConfig,
			exemptLoopback: false
		})
	};
}
async function startGatewayServer(port = 18789, opts = {}) {
	const minimalTestGateway = process.env.VITEST === "1" && process.env.OPENCLAW_TEST_MINIMAL_GATEWAY === "1";
	process.env.OPENCLAW_GATEWAY_PORT = String(port);
	logAcceptedEnvOption({
		key: "OPENCLAW_RAW_STREAM",
		description: "raw stream logging enabled"
	});
	logAcceptedEnvOption({
		key: "OPENCLAW_RAW_STREAM_PATH",
		description: "raw stream log path override"
	});
	const configSnapshot = await loadGatewayStartupConfigSnapshot({
		minimalTestGateway,
		log
	});
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
	const startupRuntimeConfig = applyConfigOverrides(configSnapshot.config);
	const authBootstrap = await prepareGatewayStartupConfig({
		configSnapshot,
		authOverride: opts.auth,
		tailscaleOverride: opts.tailscale,
		activateRuntimeSecrets
	});
	cfgAtStart = authBootstrap.cfg;
	if (authBootstrap.generatedToken) if (authBootstrap.persistedGeneratedToken) log.info("Gateway auth token was missing. Generated a new token and saved it to config (gateway.auth.token).");
	else log.warn("Gateway auth token was missing. Generated a runtime token for this startup without changing config; restart will generate a different token. Persist one with `openclaw config set gateway.auth.mode token` and `openclaw config set gateway.auth.token <token>`.");
	const diagnosticsEnabled = isDiagnosticsEnabled(cfgAtStart);
	if (diagnosticsEnabled) startDiagnosticHeartbeat(void 0, { getConfig: getRuntimeConfig });
	setGatewaySigusr1RestartPolicy({ allowExternal: isRestartEnabled(cfgAtStart) });
	setPreRestartDeferralCheck(() => getTotalQueueSize() + getTotalPendingReplies() + getActiveEmbeddedRunCount() + getInspectableTaskRegistrySummary().active);
	cfgAtStart = (minimalTestGateway ? {
		config: cfgAtStart,
		persistedAllowedOriginsSeed: false
	} : await maybeSeedControlUiAllowedOriginsAtStartup({
		config: cfgAtStart,
		writeConfig: writeConfigFile,
		log
	})).config;
	startupInternalWriteHash = (await readConfigFileSnapshot()).hash ?? null;
	const pluginBootstrap = await prepareGatewayPluginBootstrap({
		cfgAtStart,
		startupRuntimeConfig,
		minimalTestGateway,
		log
	});
	const { gatewayPluginConfigAtStart, defaultWorkspaceDir, deferredConfiguredChannelPluginIds, startupPluginIds, baseMethods } = pluginBootstrap;
	let { pluginRegistry, baseGatewayMethods } = pluginBootstrap;
	const channelLogs = Object.fromEntries(listChannelPlugins().map((plugin) => [plugin.id, logChannels.child(plugin.id)]));
	const channelRuntimeEnvs = Object.fromEntries(Object.entries(channelLogs).map(([id, logger]) => [id, runtimeForLogger(logger)]));
	const listActiveGatewayMethods = (nextBaseGatewayMethods) => Array.from(new Set([...nextBaseGatewayMethods, ...listChannelPlugins().flatMap((plugin) => plugin.gatewayMethods ?? [])]));
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
	const controlUiRootState = await resolveGatewayControlUiRootState({
		controlUiRootOverride,
		controlUiEnabled,
		gatewayRuntime,
		log
	});
	const wizardRunner = opts.wizardRunner ?? runSetupWizard;
	const { wizardSessions, findRunningWizard, purgeWizardSession } = createWizardSessionTracker();
	const deps = createDefaultDeps();
	let runtimeState = null;
	let canvasHostServer = null;
	const gatewayTls = await loadGatewayTlsRuntime(cfgAtStart.gateway?.tls, log.child("tls"));
	if (cfgAtStart.gateway?.tls?.enabled && !gatewayTls.enabled) throw new Error(gatewayTls.error ?? "gateway tls: failed to enable");
	const serverStartedAt = Date.now();
	const channelManager = createChannelManager({
		loadConfig: () => applyPluginAutoEnable({
			config: loadConfig(),
			env: process.env
		}).config,
		channelLogs,
		channelRuntimeEnvs,
		resolveChannelRuntime: getChannelRuntime
	});
	const getReadiness = createReadinessChecker({
		channelManager,
		startedAt: serverStartedAt
	});
	log.info("starting HTTP server...");
	const { canvasHost, releasePluginRouteRegistry, httpServer, httpServers, httpBindHosts, wss, preauthConnectionBudget, clients, broadcast, broadcastToConnIds, agentRunSeq, dedupe, chatRunState, chatRunBuffers, chatDeltaSentAt, chatDeltaLastBroadcastLen, addChatRun, removeChatRun, chatAbortControllers, toolEventRecipients } = await createGatewayRuntimeState({
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
	});
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
	const runClosePrelude = async () => await runGatewayClosePrelude({
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
		closeMcpServer: async () => await closeMcpLoopbackServer()
	});
	const closeOnStartupFailure = async () => {
		await runClosePrelude();
		await createGatewayCloseHandler({
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
		})({ reason: "gateway startup failed" });
	};
	const { getRuntimeSnapshot, startChannels, startChannel, stopChannel, markChannelLoggedOut } = channelManager;
	try {
		const earlyRuntime = await startGatewayEarlyRuntime({
			minimalTestGateway,
			cfgAtStart,
			port,
			gatewayTls,
			tailscaleMode,
			log,
			logDiscovery,
			nodeRegistry,
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
			loadConfig
		});
		runtimeState.bonjourStop = earlyRuntime.bonjourStop;
		runtimeState.skillsChangeUnsub = earlyRuntime.skillsChangeUnsub;
		if (earlyRuntime.maintenance) {
			runtimeState.tickInterval = earlyRuntime.maintenance.tickInterval;
			runtimeState.healthInterval = earlyRuntime.maintenance.healthInterval;
			runtimeState.dedupeCleanup = earlyRuntime.maintenance.dedupeCleanup;
			runtimeState.mediaCleanup = earlyRuntime.maintenance.mediaCleanup;
		}
		Object.assign(runtimeState, startGatewayEventSubscriptions({
			minimalTestGateway,
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
			log
		}));
		const { execApprovalManager, pluginApprovalManager, extraHandlers } = createGatewayAuxHandlers({
			log,
			activateRuntimeSecrets,
			sharedGatewaySessionGenerationState,
			resolveSharedGatewaySessionGenerationForConfig,
			clients
		});
		const canvasHostServerPort = canvasHostServer?.port;
		const unavailableGatewayMethods = new Set(minimalTestGateway ? [] : STARTUP_UNAVAILABLE_GATEWAY_METHODS);
		const gatewayRequestContext = createGatewayRequestContext({
			deps,
			runtimeState,
			execApprovalManager,
			pluginApprovalManager,
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
			unavailableGatewayMethods
		});
		setFallbackGatewayContextResolver(() => gatewayRequestContext);
		if (!minimalTestGateway) {
			if (deferredConfiguredChannelPluginIds.length > 0) {
				({pluginRegistry, gatewayMethods: baseGatewayMethods} = reloadDeferredGatewayPlugins({
					cfg: gatewayPluginConfigAtStart,
					workspaceDir: defaultWorkspaceDir,
					log,
					coreGatewayHandlers,
					baseMethods,
					pluginIds: startupPluginIds,
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
		({stopGatewayUpdateCheck: runtimeState.stopGatewayUpdateCheck, tailscaleCleanup: runtimeState.tailscaleCleanup, pluginServices: runtimeState.pluginServices} = await startGatewayPostAttachRuntime({
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
			unavailableGatewayMethods
		}));
		const activated = activateGatewayScheduledServices({
			minimalTestGateway,
			cfgAtStart,
			cron: runtimeState.cronState.cron,
			logCron,
			log
		});
		runtimeState.heartbeatRunner = activated.heartbeatRunner;
		runtimeState.configReloader = startManagedGatewayConfigReloader({
			minimalTestGateway,
			initialConfig: cfgAtStart,
			initialInternalWriteHash: startupInternalWriteHash,
			watchPath: configSnapshot.path,
			readSnapshot: readConfigFileSnapshot,
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
	} catch (err) {
		await closeOnStartupFailure();
		throw err;
	}
	const close = createGatewayCloseHandler({
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
