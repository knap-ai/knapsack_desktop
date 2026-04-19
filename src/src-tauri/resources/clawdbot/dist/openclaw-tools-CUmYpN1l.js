import { r as redactSensitiveText } from "./redact-D4nea1HF.js";
import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { c as normalizeOptionalStringifiedId, d as readStringValue, i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { i as resolveOsHomeDir, t as expandHomePrefix } from "./home-dir-BEqRdfoa.js";
import { b as truncateUtf16Safe, l as isRecord, m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { a as shouldLogVerbose, r as logVerbose } from "./globals-De6QTwLG.js";
import { t as logDebug } from "./logger-BA_TvTc6.js";
import { a as loadConfig, h as resolveConfigSnapshotHash, o as parseConfigJson5 } from "./io-5pxHCi7V.js";
import { n as resolveManifestContractOwnerPluginId } from "./manifest-registry-Bd3A4lqx.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { C as parseThreadSessionSuffix, c as normalizeAgentId, f as sanitizeAgentId, r as buildAgentMainSessionKey, t as DEFAULT_AGENT_ID, u as resolveAgentIdFromSessionKey, x as parseAgentSessionKey } from "./session-key-Bh1lMwK5.js";
import { n as normalizeAccountId } from "./account-id-j7GeQlaZ.js";
import { o as normalizeChannelId } from "./registry-CENZffQG.js";
import { i as normalizeChannelId$1, r as listChannelPlugins, t as getChannelPlugin } from "./registry-Delpa74L.js";
import { i as applyMergePatch } from "./schema-validator-Byqt0Q69.js";
import { t as getProviderEnvVars } from "./provider-env-vars-Sj-BhOn9.js";
import { n as resolveAgentModelPrimaryValue, t as resolveAgentModelFallbackValues } from "./model-input-DFbXtnkw.js";
import { _ as resolveAgentConfig, b as resolveAgentWorkspaceDir, m as resolveSessionAgentIds, p as resolveSessionAgentId, r as resolveAgentExecutionContract } from "./agent-scope-KFH9bkHi.js";
import { t as parseDurationMs } from "./parse-duration-DHL2gXIv.js";
import { t as isInboundPathAllowed } from "./inbound-path-policy-BLO4l9wD.js";
import { n as isRestartEnabled } from "./commands.flags-DTSeDvkD.js";
import "./config-Q9XZc_2I.js";
import { h as GATEWAY_CLIENT_MODES, m as GATEWAY_CLIENT_IDS, u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import { r as INTERNAL_MESSAGE_CHANNEL } from "./message-channel-core-BIZsQ6dr.js";
import "./plugins-D4ODSIPT.js";
import { y as normalizeProviderTransportWithPlugin } from "./provider-runtime-khVgWetm.js";
import { t as ensureOpenClawModelsJson } from "./models-config-CkfuLe-V.js";
import { f as modelKey, p as normalizeModelRef } from "./model-selection-cli-_3Gn8Wcd.js";
import { f as resolveDefaultModelForAgent, i as buildModelAliasIndex, m as resolveModelRefFromString, t as buildAllowedModelSet } from "./model-selection-CTdyYoio.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-DqcJmob1.js";
import { t as requireApiKey } from "./model-auth-runtime-shared-jdNQNamX.js";
import { r as loadModelCatalog } from "./model-catalog-CdCqmHkW.js";
import { a as discoverModels, i as discoverAuthStorage } from "./pi-model-discovery-BgqsAR8S.js";
import { c as updateSessionStore } from "./store-DFXcceZJ.js";
import { t as extractDeliveryInfo } from "./sessions-vP2E4vs-.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath, u as resolveStorePath } from "./paths-CZMxg3hs.js";
import { i as normalizeDeliveryContext } from "./delivery-context.shared-EClQPjt-.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import { n as resolveSessionConversationRef } from "./session-conversation-BkRPri5o.js";
import "./delivery-context-CToOfUqJ.js";
import { d as resolveSessionModelIdentityRef } from "./session-utils-hDe0hdis.js";
import { l as jsonUtf8Bytes, n as capArrayByJsonBytes } from "./session-utils.fs-BtTrNS1L.js";
import { n as SILENT_REPLY_TOKEN } from "./tokens-CKM4Lddu.js";
import { i as imageMimeFromFormat, t as detectMime } from "./mime-B6nXlmtY.js";
import { C as UPDATE_PLAN_TOOL_DISPLAY_SUMMARY, D as describeSessionsSendTool, E as describeSessionsListTool, O as describeSessionsSpawnTool, S as SESSION_STATUS_TOOL_DISPLAY_SUMMARY, T as describeSessionsHistoryTool, b as SESSIONS_SEND_TOOL_DISPLAY_SUMMARY, h as CRON_TOOL_DISPLAY_SUMMARY, k as describeUpdatePlanTool, v as SESSIONS_HISTORY_TOOL_DISPLAY_SUMMARY, w as describeSessionStatusTool, x as SESSIONS_SPAWN_TOOL_DISPLAY_SUMMARY, y as SESSIONS_LIST_TOOL_DISPLAY_SUMMARY } from "./tool-policy-C3rJHw58.js";
import { a as listChannelSupportedActions, d as resolvePluginTools, r as listAllChannelSupportedActions } from "./channel-tools-DdZyHuyK.js";
import { w as textToSpeech } from "./tts-m-RAIr7w.js";
import { a as getImageMetadata } from "./image-ops-f0rEOT4L.js";
import { i as resolveImageSanitizationLimits, r as sanitizeToolResultImages } from "./tool-images-D6i9LZcG.js";
import { a as resolveChannelMessageToolSchemaProperties, n as channelSupportsMessageCapabilityForChannel, t as channelSupportsMessageCapability } from "./message-action-discovery-BTz8VrH1.js";
import { r as getApiKeyForModel } from "./model-auth-KKLbMBGv.js";
import { t as SsrFBlockedError } from "./ssrf-DoOclwFS.js";
import { u as parseReplyDirectives } from "./deliver-BNvlWd4P.js";
import { n as runWithImageModelFallback } from "./model-fallback-D2mt9Plr.js";
import { t as extractTextFromChatContent } from "./chat-content-B2Cx1lHu.js";
import { c as stripReasoningTagsFromText } from "./assistant-visible-text-Bu-2kS6O.js";
import { t as extractAssistantText } from "./pi-embedded-utils-CzYG7ldK.js";
import { r as callGateway } from "./call-BA3do6C0.js";
import { c as jsonResult, d as readNumberParam, h as readStringParam$1, o as imageResult, p as readStringArrayParam, r as ToolInputError, y as readSnakeCaseParamRaw } from "./common-BWtun2If.js";
import { n as readGatewayCallOptions, r as resolveGatewayOptions, t as callGatewayTool } from "./gateway-B1XKgomf.js";
import { g as writeFileWithinRoot, r as appendFileWithinRoot, s as openFileWithinRoot, t as SafeOpenError, u as readFileWithinRoot } from "./fs-safe-B7mHodgb.js";
import { t as isWindowsDrivePath } from "./archive-path-DHk17wYF.js";
import { o as trySafeFileURLToPath, r as hasEncodedFileUrlSeparator } from "./local-file-access-CpkF4sBk.js";
import { n as assertSandboxPath } from "./sandbox-paths-C5p25GeS.js";
import { c as resolveWorkspaceRoot, d as toRelativeWorkspacePath, s as normalizeWorkspaceDir } from "./read-capability-KJ3-uRH6.js";
import { i as getActiveSecretsRuntimeSnapshot, r as getActiveRuntimeWebToolsMetadata } from "./runtime-gQZrOSl1.js";
import { t as sniffMimeFromBase64 } from "./sniff-mime-from-base64-isS89uB9.js";
import { a as createSessionVisibilityGuard, c as resolveDisplaySessionKey, d as resolveSessionReference, f as resolveVisibleSessionReference, i as createAgentToAgentPolicy, l as resolveInternalSessionKey, n as deriveChannel, o as resolveEffectiveSessionToolsVisibility, p as shouldResolveSessionIdInput, r as resolveSessionToolContext, s as resolveSandboxedSessionToolContext, t as classifySessionKind, u as resolveMainSessionAlias } from "./sessions-helpers-CBIn5ORF.js";
import { r as stripToolMessages } from "./chat-history-text-C5anYCs7.js";
import { a as parseCanvasSnapshotPayload, c as parseCameraSnapPayload, d as writeCameraPayloadToFile, i as canvasSnapshotTempPath, l as writeBase64ToFile, n as screenRecordTempPath, o as cameraTempPath, r as writeScreenRecordToFile, s as parseCameraClipPayload, t as parseScreenRecordPayload, u as writeCameraClipPayloadToFile } from "./nodes-screen-DFTltcAE.js";
import { a as getDefaultMediaLocalRoots } from "./local-roots-BrPriMlc.js";
import { i as stringEnum, n as channelTargetsSchema, r as optionalStringEnum, t as channelTargetSchema } from "./typebox-UTirCdtG.js";
import { n as resolveNode, r as resolveNodeId } from "./nodes-utils-DNtNBPA8.js";
import { a as parseDeliveryInput, i as TrimmedNonEmptyStringFieldSchema, o as parseOptionalField, r as TimeoutSecondsFieldSchema } from "./delivery-field-schemas-Bi2cRKQQ.js";
import { i as parseAbsoluteTimeMs, r as resolveDefaultCronStaggerMs, t as normalizeCronStaggerMs } from "./stagger-BQdF8pte.js";
import { t as inferLegacyName } from "./normalize-dgYtEWCT.js";
import { n as assertSafeCronSessionTargetId, t as normalizeHttpWebhookUrl } from "./webhook-url-7OFcgnY_.js";
import { n as formatDoctorNonInteractiveHint, s as writeRestartSentinel } from "./restart-sentinel-vSI_SrJz.js";
import { o as scheduleGatewaySigusr1Restart } from "./restart-Bh5n8icp.js";
import { t as collectEnabledInsecureOrDangerousFlags } from "./dangerous-config-flags-BeNW1WAK.js";
import { r as parseImageGenerationModelRef } from "./provider-registry-BdnOpUiG.js";
import { n as listRuntimeImageGenerationProviders, t as generateImage } from "./runtime-p4Ehr4rr.js";
import { l as saveMediaBuffer } from "./store-CFeRgpZO.js";
import { n as loadWebMediaRaw, t as loadWebMedia } from "./web-media-B2LIgj-X.js";
import { r as getDefaultLocalRoots } from "./local-media-access-BjcJKJws.js";
import { a as coerceImageModelConfig, c as buildToolModelConfigFromCandidates, d as hasToolModelConfig, f as resolveDefaultModelRef, l as coerceToolModelConfig, n as isMinimaxVlmProvider, o as decodeDataUrl, s as resolveProviderVisionModelFromConfig, u as hasAuthForProvider } from "./minimax-vlm--JDeh9fW.js";
import { n as resolveSandboxedBridgeMediaPath, t as createSandboxBridgeReadFile } from "./sandbox-media-paths-r1o3huWC.js";
import { C as getMediaUnderstandingProvider, E as resolveBundledDefaultMediaModel, T as resolveBundledAutoMediaKeyProviders, b as resolveAutoMediaKeyProviders, w as bundledProviderSupportsNativePdfDocument, x as resolveDefaultMediaModel } from "./resolve-DqYzTtEU.js";
import { n as describeImagesWithModel, t as describeImageWithModel } from "./image-runtime-H0HMzsrb.js";
import { t as buildProviderRegistry } from "./runner-GjYg-C-v.js";
import "./media-understanding-B8ZG4o1-.js";
import { n as CHANNEL_MESSAGE_ACTION_NAMES, t as resolveMessageSecretScope } from "./message-secret-scope-Dp8_bdnI.js";
import { t as resolveCommandSecretRefsViaGateway } from "./command-secret-gateway-D1MBXqwF.js";
import { a as getScopedChannelsCommandSecretTargets } from "./command-secret-targets-WLIHx3E8.js";
import { c as SHARED_POLL_CREATION_PARAM_NAMES, n as runMessageAction, s as POLL_CREATION_PARAM_DEFS, t as getToolResult } from "./message-action-runner-D-yK04iK.js";
import { t as sendMessage } from "./message-BYwqZVIO.js";
import { i as resolveMusicGenerationModeCapabilities, n as listRuntimeMusicGenerationProviders, r as listSupportedMusicGenerationModes, t as generateMusic } from "./runtime-TizON0cH.js";
import { r as parseMusicGenerationModelRef } from "./provider-registry-B7dkIhK2.js";
import { n as formatTaskStatusDetail, r as formatTaskStatusTitle } from "./task-status-DdxMiKkn.js";
import { f as listTasksForOwnerKey } from "./task-registry-BO2EMqj7.js";
import "./runtime-internal-tfNsv16F.js";
import { a as createRunningTaskRun, c as recordTaskRunProgressByRunId, o as failTaskRunByRunId, r as completeTaskRunByRunId } from "./task-executor-ZyzAPL-M.js";
import "./task-registry-delivery-runtime-UciXkoDc.js";
import { t as formatAgentInternalEventsForPrompt } from "./internal-events-agrMWaJZ.js";
import { C as isAnnounceSkip, S as REPLY_SKIP_TOKEN, T as deliverSubagentAnnouncement, b as runAgentStep, d as registerSubagentRun, w as isReplySkip, x as ANNOUNCE_SKIP_TOKEN } from "./subagent-registry-BrNWizSY.js";
import { t as resolveNodePairApprovalScopes } from "./node-pairing-authz-DTdV_SEj.js";
import { t as parseTimeoutMs } from "./parse-timeout-DQBLjOP7.js";
import { t as extractPdfContent } from "./pdf-extract-iu4QUGpR.js";
import { t as applyModelOverrideToSessionEntry } from "./model-overrides-BEFWLg94.js";
import { t as buildTaskStatusSnapshotForRelatedSessionKeyForOwner } from "./task-owner-access-Pn4DXNYI.js";
import { t as AGENT_LANE_NESTED } from "./lanes-CJ0uhThr.js";
import { i as waitForAgentRunAndReadUpdatedAssistantReply, n as readLatestAssistantReplySnapshot, r as waitForAgentRun, t as readLatestAssistantReply } from "./run-wait-DHbbCT29.js";
import { n as SUBAGENT_SPAWN_MODES, t as spawnSubagentDirect } from "./subagent-spawn-CyV5i9yl.js";
import { i as isActiveSubagentRun, n as buildSubagentList, r as createPendingDescendantCounter } from "./subagent-list-2HAHfbtl.js";
import { c as resolveSubagentController, i as killControlledSubagentRun, n as MAX_STEER_MESSAGE_CHARS, o as listControlledSubagentRuns, r as killAllControlledSubagentRuns, s as resolveControlledSubagentTarget, t as MAX_RECENT_MINUTES, u as steerControlledSubagentRun } from "./subagent-control-Cm_f_Wdn.js";
import { a as resolveVideoGenerationModeCapabilities, i as resolveVideoGenerationMode, n as listRuntimeVideoGenerationProviders, r as listSupportedVideoGenerationModes, t as generateVideo } from "./runtime-CRavTO7t.js";
import { r as parseVideoGenerationModelRef } from "./provider-registry-BjXJ92hH.js";
import { a as wrapWebContent, i as wrapExternalContent } from "./external-content-Ds7ZVhiZ.js";
import { a as runWebSearch, i as resolveWebSearchDefinition, l as resolveWebProviderConfig } from "./runtime-BRxW-LBe.js";
import { r as resolveWebFetchDefinition } from "./runtime-Ddo1GTyA.js";
import { _ as truncateText$1, a as readResponseText, g as markdownToText, h as htmlToMarkdown, i as readCache, l as writeCache, m as extractReadableContent, o as resolveCacheTtlMs, p as extractBasicHtmlContent, r as normalizeCacheKey, s as resolveTimeoutSeconds, u as fetchWithWebToolsNetworkGuard } from "./web-shared-BfvYKFo5.js";
import "./web-search-provider-common-EFbs_Gas.js";
import { URL as URL$1 } from "node:url";
import path, { isAbsolute, resolve } from "node:path";
import fs from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import crypto from "node:crypto";
import { Type } from "@sinclair/typebox";
import { createEditTool, createReadTool, createWriteTool } from "@mariozechner/pi-coding-agent";
import { complete } from "@mariozechner/pi-ai";
//#region src/agents/execution-contract.ts
/**
* Strip any leading `provider/` or `provider:` prefix from a model id so the
* bare-name regex matching below works against `openai/gpt-5.4` and
* `openai:gpt-5.4` the same way it does against `gpt-5.4`. Returns the bare
* model id lowercased for comparison.
*
* Without this, auto-activation silently failed on prefixed model ids — a
* user who configured `model: "openai/gpt-5.4"` in their agent config would
* get the pre-PR-H looser default behavior because the regex only matched
* bare names. The adversarial review in #64227 flagged this as a quality
* gap on completion-gate criterion 1.
*/
function stripProviderPrefix(modelId) {
	const normalizedModelId = modelId.trim();
	return (/^([^/:]+)[/:](.+)$/.exec(normalizedModelId)?.[2] ?? normalizedModelId).toLowerCase();
}
/**
* Regex that matches the full set of GPT-5 variants the strict-agentic
* contract should auto-activate for. Intentionally permissive: every
* model id in the gpt-5 family should opt in by default, not just the
* canonical `gpt-5.4`.
*
* Covers:
* - `gpt-5`, `gpt-5o`, `gpt-5o-mini` (no separator after `5`)
* - `gpt-5.4`, `gpt-5.4-alt`, `gpt-5.0` (dot separator)
* - `gpt-5-preview`, `gpt-5-turbo`, `gpt-5-2025-03` (dash separator)
*
* Does NOT cover `gpt-4.5`, `gpt-6`, or any non-gpt-5 family member.
*/
const STRICT_AGENTIC_MODEL_ID_PATTERN = /^gpt-5(?:[.o-]|$)/i;
/**
* Supported provider + model combinations where strict-agentic is the intended
* runtime contract. Kept as a narrow helper so both the execution-contract
* resolver and the `update_plan` auto-enable gate converge on the same
* definition of "GPT-5-family openai/openai-codex run". The embedded
* `mock-openai` QA lane intentionally piggybacks on that contract so repo QA
* can exercise the same incomplete-turn recovery rules end to end.
*/
function isStrictAgenticSupportedProviderModel(params) {
	const provider = normalizeLowercaseStringOrEmpty(params.provider ?? "");
	if (provider !== "openai" && provider !== "openai-codex" && provider !== "mock-openai") return false;
	const bareModelId = stripProviderPrefix(typeof params.modelId === "string" ? params.modelId : "");
	return STRICT_AGENTIC_MODEL_ID_PATTERN.test(bareModelId);
}
/**
* Returns the effective execution contract for an embedded Pi run.
*
* strict-agentic is a GPT-5-family openai/openai-codex-only runtime contract,
* so an unsupported provider/model pair always collapses to `"default"`
* regardless of what the caller passed or what config says — the contract
* is inert off-provider. Within the supported lane, the behavior matrix is:
*
* - Supported provider/model + explicit `"strict-agentic"` in config
*   (defaults or per-agent override) ⇒ `"strict-agentic"`.
* - Supported provider/model + explicit `"default"` in config ⇒ `"default"`
*   (opt-out honored).
* - Supported provider/model + unspecified ⇒ `"strict-agentic"` so the
*   no-stall completion-gate criterion applies to out-of-the-box GPT-5 runs
*   without requiring every user to set the flag.
* - Unsupported provider/model (anything that is not openai or openai-codex
*   with a gpt-5-family model id) ⇒ `"default"`, even when the config
*   explicitly sets `"strict-agentic"`. The retry guard and blocked-exit
*   helpers all check this lane again, so an explicit `"strict-agentic"`
*   on an unsupported lane is a no-op rather than a hard failure.
*
* This means explicit opt-out still works, but the gate criterion
* "GPT-5.4 no longer stalls after planning" now covers unconfigured
* installations, not only users who opted in manually.
*/
function resolveEffectiveExecutionContract(params) {
	const { sessionAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.config,
		agentId: params.agentId ?? void 0
	});
	const explicit = resolveAgentExecutionContract(params.config, sessionAgentId);
	if (!isStrictAgenticSupportedProviderModel({
		provider: params.provider,
		modelId: params.modelId
	})) return "default";
	if (explicit === "default") return "default";
	return "strict-agentic";
}
function isStrictAgenticExecutionContractActive(params) {
	return resolveEffectiveExecutionContract(params) === "strict-agentic";
}
//#endregion
//#region src/agents/openclaw-tools.plugin-context.ts
function resolveOpenClawPluginToolInputs(params) {
	const { options, resolvedConfig, runtimeConfig } = params;
	const sessionAgentId = resolveSessionAgentId({
		sessionKey: options?.agentSessionKey,
		config: resolvedConfig
	});
	const inferredWorkspaceDir = options?.workspaceDir || !resolvedConfig ? void 0 : resolveAgentWorkspaceDir(resolvedConfig, sessionAgentId);
	const workspaceDir = resolveWorkspaceRoot(options?.workspaceDir ?? inferredWorkspaceDir);
	const deliveryContext = normalizeDeliveryContext({
		channel: options?.agentChannel,
		to: options?.agentTo,
		accountId: options?.agentAccountId,
		threadId: options?.agentThreadId
	});
	return {
		context: {
			config: options?.config,
			runtimeConfig,
			fsPolicy: options?.fsPolicy,
			workspaceDir,
			agentDir: options?.agentDir,
			agentId: sessionAgentId,
			sessionKey: options?.agentSessionKey,
			sessionId: options?.sessionId,
			browser: {
				sandboxBridgeUrl: options?.sandboxBrowserBridgeUrl,
				allowHostControl: options?.allowHostBrowserControl
			},
			messageChannel: options?.agentChannel,
			agentAccountId: options?.agentAccountId,
			deliveryContext,
			requesterSenderId: options?.requesterSenderId ?? void 0,
			senderIsOwner: options?.senderIsOwner ?? void 0,
			sandboxed: options?.sandboxed
		},
		allowGatewaySubagentBinding: options?.allowGatewaySubagentBinding
	};
}
//#endregion
//#region src/agents/plugin-tool-delivery-defaults.ts
function applyPluginToolDeliveryDefaults(params) {
	params.deliveryContext;
	return params.tools;
}
//#endregion
//#region src/agents/openclaw-plugin-tools.ts
function resolveOpenClawPluginToolsForOptions(params) {
	if (params.options?.disablePluginTools) return [];
	const runtimeSnapshot = getActiveSecretsRuntimeSnapshot();
	const deliveryContext = normalizeDeliveryContext({
		channel: params.options?.agentChannel,
		to: params.options?.agentTo,
		accountId: params.options?.agentAccountId,
		threadId: params.options?.agentThreadId
	});
	return applyPluginToolDeliveryDefaults({
		tools: resolvePluginTools({
			...resolveOpenClawPluginToolInputs({
				options: params.options,
				resolvedConfig: params.resolvedConfig,
				runtimeConfig: runtimeSnapshot?.config
			}),
			existingToolNames: params.existingToolNames ?? /* @__PURE__ */ new Set(),
			toolAllowlist: params.options?.pluginToolAllowlist
		}),
		deliveryContext
	});
}
//#endregion
//#region src/agents/pi-tools.params.ts
const RETRY_GUIDANCE_SUFFIX = " Supply correct parameters before retrying.";
function parameterValidationError(message) {
	return /* @__PURE__ */ new Error(`${message}.${RETRY_GUIDANCE_SUFFIX}`);
}
function describeReceivedParamValue(value, allowEmpty = false) {
	if (value === void 0 || value === null) return;
	if (typeof value === "string") {
		if (allowEmpty || value.trim().length > 0) return;
		return "<empty-string>";
	}
	if (Array.isArray(value)) return "<array>";
	return `<${typeof value}>`;
}
function formatReceivedParamHint(record, groups) {
	const allowEmptyKeys = new Set(groups.filter((group) => group.allowEmpty).flatMap((group) => group.keys));
	const received = Object.keys(record).flatMap((key) => {
		const detail = describeReceivedParamValue(record[key], allowEmptyKeys.has(key));
		if (record[key] === void 0 || record[key] === null) return [];
		return [detail ? `${key}=${detail}` : key];
	});
	return received.length > 0 ? ` (received: ${received.join(", ")})` : "";
}
function isValidEditReplacement(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return typeof record.oldText === "string" && record.oldText.trim().length > 0 && typeof record.newText === "string";
}
function hasValidEditReplacements(record) {
	const edits = record.edits;
	return Array.isArray(edits) && edits.length > 0 && edits.every((entry) => isValidEditReplacement(entry));
}
const REQUIRED_PARAM_GROUPS = {
	read: [{
		keys: ["path"],
		label: "path"
	}],
	write: [{
		keys: ["path"],
		label: "path"
	}, {
		keys: ["content"],
		label: "content"
	}],
	edit: [{
		keys: ["path"],
		label: "path"
	}, {
		keys: ["edits"],
		label: "edits",
		validator: hasValidEditReplacements
	}]
};
function getToolParamsRecord(params) {
	return params && typeof params === "object" ? params : void 0;
}
function assertRequiredParams(record, groups, toolName) {
	if (!record || typeof record !== "object") throw parameterValidationError(`Missing parameters for ${toolName}`);
	const missingLabels = [];
	for (const group of groups) if (!(group.validator?.(record) ?? group.keys.some((key) => {
		if (!(key in record)) return false;
		const value = record[key];
		if (typeof value !== "string") return false;
		if (group.allowEmpty) return true;
		return value.trim().length > 0;
	}))) {
		const label = group.label ?? group.keys.join(" or ");
		missingLabels.push(label);
	}
	if (missingLabels.length > 0) {
		const joined = missingLabels.join(", ");
		throw parameterValidationError(`Missing required ${missingLabels.length === 1 ? "parameter" : "parameters"}: ${joined}${formatReceivedParamHint(record, groups)}`);
	}
}
function wrapToolParamValidation(tool, requiredParamGroups) {
	return {
		...tool,
		execute: async (toolCallId, params, signal, onUpdate) => {
			const record = getToolParamsRecord(params);
			if (requiredParamGroups?.length) assertRequiredParams(record, requiredParamGroups, tool.name);
			return tool.execute(toolCallId, params, signal, onUpdate);
		}
	};
}
//#endregion
//#region src/agents/pi-tools.host-edit.ts
const EDIT_MISMATCH_MESSAGE = "Could not find the exact text in";
const EDIT_MISMATCH_HINT_LIMIT = 800;
function resolveEditPath(root, pathParam) {
	const home = resolveOsHomeDir();
	const expanded = home ? expandHomePrefix(pathParam, { home }) : pathParam;
	return path.isAbsolute(expanded) ? path.resolve(expanded) : path.resolve(root, expanded);
}
function readStringParam(record, ...keys) {
	for (const key of keys) {
		const value = record?.[key];
		if (typeof value === "string") return value;
	}
}
function readEditReplacements(record) {
	if (!Array.isArray(record?.edits)) return [];
	return record.edits.flatMap((entry) => {
		if (!entry || typeof entry !== "object") return [];
		const replacement = entry;
		if (typeof replacement.oldText !== "string" || replacement.oldText.trim().length === 0) return [];
		if (typeof replacement.newText !== "string") return [];
		return [{
			oldText: replacement.oldText,
			newText: replacement.newText
		}];
	});
}
function readEditToolParams(params) {
	const record = getToolParamsRecord(params);
	return {
		pathParam: readStringParam(record, "path"),
		edits: readEditReplacements(record)
	};
}
function normalizeToLF(value) {
	return value.replace(/\r\n?/g, "\n");
}
function removeExactOccurrences(content, needle) {
	return needle.length > 0 ? content.split(needle).join("") : content;
}
function didEditLikelyApply(params) {
	if (params.edits.length === 0) return false;
	const normalizedCurrent = normalizeToLF(params.currentContent);
	const normalizedOriginal = typeof params.originalContent === "string" ? normalizeToLF(params.originalContent) : void 0;
	if (normalizedOriginal !== void 0 && normalizedOriginal === normalizedCurrent) return false;
	let withoutInsertedNewText = normalizedCurrent;
	for (const edit of params.edits) {
		const normalizedNew = normalizeToLF(edit.newText);
		if (normalizedNew.length > 0 && !normalizedCurrent.includes(normalizedNew)) return false;
		withoutInsertedNewText = normalizedNew.length > 0 ? removeExactOccurrences(withoutInsertedNewText, normalizedNew) : withoutInsertedNewText;
	}
	for (const edit of params.edits) {
		const normalizedOld = normalizeToLF(edit.oldText);
		if (withoutInsertedNewText.includes(normalizedOld)) return false;
	}
	return true;
}
function buildEditSuccessResult(pathParam, editCount) {
	return {
		isError: false,
		content: [{
			type: "text",
			text: editCount > 1 ? `Successfully replaced ${editCount} block(s) in ${pathParam}.` : `Successfully replaced text in ${pathParam}.`
		}],
		details: {
			diff: "",
			firstChangedLine: void 0
		}
	};
}
function shouldAddMismatchHint(error) {
	return error instanceof Error && error.message.includes(EDIT_MISMATCH_MESSAGE);
}
function appendMismatchHint(error, currentContent) {
	const snippet = currentContent.length <= EDIT_MISMATCH_HINT_LIMIT ? currentContent : `${currentContent.slice(0, EDIT_MISMATCH_HINT_LIMIT)}\n... (truncated)`;
	const enhanced = /* @__PURE__ */ new Error(`${error.message}\nCurrent file contents:\n${snippet}`);
	enhanced.stack = error.stack;
	return enhanced;
}
/**
* Recover from two edit-tool failure classes without changing edit semantics:
* - exact-match mismatch errors become actionable by including current file contents
* - post-write throws are converted back to success only if the file actually changed
*/
function wrapEditToolWithRecovery(base, options) {
	return {
		...base,
		execute: async (toolCallId, params, signal, onUpdate) => {
			const { pathParam, edits } = readEditToolParams(params);
			const absolutePath = typeof pathParam === "string" ? resolveEditPath(options.root, pathParam) : void 0;
			let originalContent;
			if (absolutePath && edits.length > 0) try {
				originalContent = await options.readFile(absolutePath);
			} catch {}
			try {
				return await base.execute(toolCallId, params, signal, onUpdate);
			} catch (err) {
				if (!absolutePath) throw err;
				let currentContent;
				try {
					currentContent = await options.readFile(absolutePath);
				} catch {}
				if (typeof currentContent === "string" && edits.length > 0) {
					if (didEditLikelyApply({
						originalContent,
						currentContent,
						edits
					})) return buildEditSuccessResult(pathParam ?? absolutePath, edits.length);
				}
				if (typeof currentContent === "string" && err instanceof Error && shouldAddMismatchHint(err)) throw appendMismatchHint(err, currentContent);
				throw err;
			}
		}
	};
}
//#endregion
//#region src/agents/pi-tools.read.ts
const DEFAULT_READ_PAGE_MAX_BYTES = 32 * 1024;
const MAX_ADAPTIVE_READ_MAX_BYTES = 128 * 1024;
const ADAPTIVE_READ_CONTEXT_SHARE = .1;
const CHARS_PER_TOKEN_ESTIMATE = 4;
const MAX_ADAPTIVE_READ_PAGES = 4;
const READ_CONTINUATION_NOTICE_RE = /\n\n\[(?:Showing lines [^\]]*?Use offset=\d+ to continue\.|\d+ more lines in file\. Use offset=\d+ to continue\.)\]\s*$/;
function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
}
function resolveAdaptiveReadMaxBytes(options) {
	const contextWindowTokens = options?.modelContextWindowTokens;
	if (typeof contextWindowTokens !== "number" || !Number.isFinite(contextWindowTokens) || contextWindowTokens <= 0) return DEFAULT_READ_PAGE_MAX_BYTES;
	return clamp(Math.floor(contextWindowTokens * CHARS_PER_TOKEN_ESTIMATE * ADAPTIVE_READ_CONTEXT_SHARE), DEFAULT_READ_PAGE_MAX_BYTES, MAX_ADAPTIVE_READ_MAX_BYTES);
}
function formatBytes(bytes) {
	if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
	if (bytes >= 1024) return `${Math.round(bytes / 1024)}KB`;
	return `${bytes}B`;
}
function getToolResultText(result) {
	const textBlocks = (Array.isArray(result.content) ? result.content : []).map((block) => {
		if (block && typeof block === "object" && block.type === "text" && typeof block.text === "string") return block.text;
	}).filter((value) => typeof value === "string");
	if (textBlocks.length === 0) return;
	return textBlocks.join("\n");
}
function withToolResultText(result, text) {
	const content = Array.isArray(result.content) ? result.content : [];
	let replaced = false;
	const nextContent = content.map((block) => {
		if (!replaced && block && typeof block === "object" && block.type === "text") {
			replaced = true;
			return {
				...block,
				text
			};
		}
		return block;
	});
	if (replaced) return {
		...result,
		content: nextContent
	};
	const textBlock = {
		type: "text",
		text
	};
	return {
		...result,
		content: [textBlock]
	};
}
function extractReadTruncationDetails(result) {
	const details = result.details;
	if (!details || typeof details !== "object") return null;
	const truncation = details.truncation;
	if (!truncation || typeof truncation !== "object") return null;
	const record = truncation;
	if (record.truncated !== true) return null;
	const outputLinesRaw = record.outputLines;
	return {
		truncated: true,
		outputLines: typeof outputLinesRaw === "number" && Number.isFinite(outputLinesRaw) ? Math.max(0, Math.floor(outputLinesRaw)) : 0,
		firstLineExceedsLimit: record.firstLineExceedsLimit === true
	};
}
function stripReadContinuationNotice(text) {
	return text.replace(READ_CONTINUATION_NOTICE_RE, "");
}
function stripReadTruncationContentDetails(result) {
	const details = result.details;
	if (!details || typeof details !== "object") return result;
	const detailsRecord = details;
	const truncationRaw = detailsRecord.truncation;
	if (!truncationRaw || typeof truncationRaw !== "object") return result;
	const truncation = truncationRaw;
	if (!Object.prototype.hasOwnProperty.call(truncation, "content")) return result;
	const { content: _content, ...restTruncation } = truncation;
	return {
		...result,
		details: {
			...detailsRecord,
			truncation: restTruncation
		}
	};
}
async function executeReadWithAdaptivePaging(params) {
	const userLimit = params.args.limit;
	if (typeof userLimit === "number" && Number.isFinite(userLimit) && userLimit > 0) return await params.base.execute(params.toolCallId, params.args, params.signal);
	const offsetRaw = params.args.offset;
	let nextOffset = typeof offsetRaw === "number" && Number.isFinite(offsetRaw) && offsetRaw > 0 ? Math.floor(offsetRaw) : 1;
	let firstResult = null;
	let aggregatedText = "";
	let aggregatedBytes = 0;
	let capped = false;
	let continuationOffset;
	for (let page = 0; page < MAX_ADAPTIVE_READ_PAGES; page += 1) {
		const pageArgs = {
			...params.args,
			offset: nextOffset
		};
		const pageResult = await params.base.execute(params.toolCallId, pageArgs, params.signal);
		firstResult ??= pageResult;
		const rawText = getToolResultText(pageResult);
		if (typeof rawText !== "string") return pageResult;
		const truncation = extractReadTruncationDetails(pageResult);
		const canContinue = Boolean(truncation?.truncated) && !truncation?.firstLineExceedsLimit && (truncation?.outputLines ?? 0) > 0 && page < MAX_ADAPTIVE_READ_PAGES - 1;
		const pageText = canContinue ? stripReadContinuationNotice(rawText) : rawText;
		const delimiter = aggregatedText ? "\n\n" : "";
		const nextBytes = Buffer.byteLength(`${delimiter}${pageText}`, "utf-8");
		if (aggregatedText && aggregatedBytes + nextBytes > params.maxBytes) {
			capped = true;
			continuationOffset = nextOffset;
			break;
		}
		aggregatedText += `${delimiter}${pageText}`;
		aggregatedBytes += nextBytes;
		if (!canContinue || !truncation) return withToolResultText(pageResult, aggregatedText);
		nextOffset += truncation.outputLines;
		continuationOffset = nextOffset;
		if (aggregatedBytes >= params.maxBytes) {
			capped = true;
			break;
		}
	}
	if (!firstResult) return await params.base.execute(params.toolCallId, params.args, params.signal);
	let finalText = aggregatedText;
	if (capped && continuationOffset) finalText += `\n\n[Read output capped at ${formatBytes(params.maxBytes)} for this call. Use offset=${continuationOffset} to continue.]`;
	return withToolResultText(firstResult, finalText);
}
function rewriteReadImageHeader(text, mimeType) {
	if (text.startsWith("Read image file [") && text.endsWith("]")) return `Read image file [${mimeType}]`;
	return text;
}
async function normalizeReadImageResult(result, filePath) {
	const content = Array.isArray(result.content) ? result.content : [];
	const image = content.find((b) => !!b && typeof b === "object" && b.type === "image" && typeof b.data === "string" && typeof b.mimeType === "string");
	if (!image) return result;
	if (!image.data.trim()) throw new Error(`read: image payload is empty (${filePath})`);
	const sniffed = await sniffMimeFromBase64(image.data);
	if (!sniffed) return result;
	if (!sniffed.startsWith("image/")) throw new Error(`read: file looks like ${sniffed} but was treated as ${image.mimeType} (${filePath})`);
	if (sniffed === image.mimeType) return result;
	const nextContent = content.map((block) => {
		if (block && typeof block === "object" && block.type === "image") return {
			...block,
			mimeType: sniffed
		};
		if (block && typeof block === "object" && block.type === "text" && typeof block.text === "string") {
			const b = block;
			return {
				...b,
				text: rewriteReadImageHeader(b.text, sniffed)
			};
		}
		return block;
	});
	return {
		...result,
		content: nextContent
	};
}
function wrapToolWorkspaceRootGuard(tool, root) {
	return wrapToolWorkspaceRootGuardWithOptions(tool, root);
}
function mapContainerPathToWorkspaceRoot(params) {
	const containerWorkdir = params.containerWorkdir?.trim();
	if (!containerWorkdir) return params.filePath;
	const normalizedWorkdir = containerWorkdir.replace(/\\/g, "/").replace(/\/+$/, "");
	if (!normalizedWorkdir.startsWith("/")) return params.filePath;
	if (!normalizedWorkdir) return params.filePath;
	let candidate = params.filePath.startsWith("@") ? params.filePath.slice(1) : params.filePath;
	if (/^file:\/\//i.test(candidate)) {
		const localFilePath = trySafeFileURLToPath(candidate);
		if (localFilePath) candidate = localFilePath;
		else {
			let parsed;
			try {
				parsed = new URL$1(candidate);
			} catch {
				return params.filePath;
			}
			if (parsed.protocol !== "file:") return params.filePath;
			const host = parsed.hostname.trim().toLowerCase();
			if (host && host !== "localhost") return params.filePath;
			if (hasEncodedFileUrlSeparator(parsed.pathname)) return params.filePath;
			let normalizedPathname;
			try {
				normalizedPathname = decodeURIComponent(parsed.pathname).replace(/\\/g, "/");
			} catch {
				return params.filePath;
			}
			if (normalizedPathname !== normalizedWorkdir && !normalizedPathname.startsWith(`${normalizedWorkdir}/`)) return params.filePath;
			candidate = normalizedPathname;
		}
	}
	const normalizedCandidate = candidate.replace(/\\/g, "/");
	if (normalizedCandidate === normalizedWorkdir) return path.resolve(params.root);
	const prefix = `${normalizedWorkdir}/`;
	if (!normalizedCandidate.startsWith(prefix)) return candidate;
	const relative = normalizedCandidate.slice(prefix.length);
	if (!relative) return path.resolve(params.root);
	return path.resolve(params.root, ...relative.split("/").filter(Boolean));
}
function resolveToolPathAgainstWorkspaceRoot(params) {
	const mapped = mapContainerPathToWorkspaceRoot(params);
	const candidate = mapped.startsWith("@") ? mapped.slice(1) : mapped;
	if (isWindowsDrivePath(candidate)) return path.win32.normalize(candidate);
	if (path.isAbsolute(candidate)) return path.resolve(candidate);
	return path.resolve(params.root, candidate || ".");
}
async function readOptionalUtf8File(params) {
	try {
		if (params.sandbox) {
			if (!await params.sandbox.bridge.stat({
				filePath: params.relativePath,
				cwd: params.sandbox.root,
				signal: params.signal
			})) return "";
			return (await params.sandbox.bridge.readFile({
				filePath: params.relativePath,
				cwd: params.sandbox.root,
				signal: params.signal
			})).toString("utf-8");
		}
		return await fs.readFile(params.absolutePath, "utf-8");
	} catch (error) {
		if (error?.code === "ENOENT") return "";
		throw error;
	}
}
async function appendMemoryFlushContent(params) {
	if (!params.sandbox) {
		await appendFileWithinRoot({
			rootDir: params.root,
			relativePath: params.relativePath,
			data: params.content,
			mkdir: true,
			prependNewlineIfNeeded: true
		});
		return;
	}
	const existing = await readOptionalUtf8File({
		absolutePath: params.absolutePath,
		relativePath: params.relativePath,
		sandbox: params.sandbox,
		signal: params.signal
	});
	const next = `${existing}${existing.length > 0 && !existing.endsWith("\n") && !params.content.startsWith("\n") ? "\n" : ""}${params.content}`;
	if (params.sandbox) {
		const parent = path.posix.dirname(params.relativePath);
		if (parent && parent !== ".") await params.sandbox.bridge.mkdirp({
			filePath: parent,
			cwd: params.sandbox.root,
			signal: params.signal
		});
		await params.sandbox.bridge.writeFile({
			filePath: params.relativePath,
			cwd: params.sandbox.root,
			data: next,
			mkdir: true,
			signal: params.signal
		});
		return;
	}
	await fs.mkdir(path.dirname(params.absolutePath), { recursive: true });
	await fs.writeFile(params.absolutePath, next, "utf-8");
}
function wrapToolMemoryFlushAppendOnlyWrite(tool, options) {
	const allowedAbsolutePath = path.resolve(options.root, options.relativePath);
	return {
		...tool,
		description: `${tool.description} During memory flush, this tool may only append to ${options.relativePath}.`,
		execute: async (toolCallId, args, signal, onUpdate) => {
			const record = getToolParamsRecord(args);
			assertRequiredParams(record, REQUIRED_PARAM_GROUPS.write, tool.name);
			const filePath = typeof record?.path === "string" && record.path.trim() ? record.path : void 0;
			const content = typeof record?.content === "string" ? record.content : void 0;
			if (!filePath || content === void 0) return tool.execute(toolCallId, args, signal, onUpdate);
			if (resolveToolPathAgainstWorkspaceRoot({
				filePath,
				root: options.root,
				containerWorkdir: options.containerWorkdir
			}) !== allowedAbsolutePath) throw new Error(`Memory flush writes are restricted to ${options.relativePath}; use that path only.`);
			await appendMemoryFlushContent({
				absolutePath: allowedAbsolutePath,
				root: options.root,
				relativePath: options.relativePath,
				content,
				sandbox: options.sandbox,
				signal
			});
			return {
				content: [{
					type: "text",
					text: `Appended content to ${options.relativePath}.`
				}],
				details: {
					path: options.relativePath,
					appendOnly: true
				}
			};
		}
	};
}
function wrapToolWorkspaceRootGuardWithOptions(tool, root, options) {
	const pathParamKeys = options?.pathParamKeys && options.pathParamKeys.length > 0 ? options.pathParamKeys : ["path"];
	return {
		...tool,
		execute: async (toolCallId, args, signal, onUpdate) => {
			const record = getToolParamsRecord(args);
			let normalizedRecord;
			for (const key of pathParamKeys) {
				const filePath = record?.[key];
				if (typeof filePath !== "string" || !filePath.trim()) continue;
				const sandboxResult = await assertSandboxPath({
					filePath: mapContainerPathToWorkspaceRoot({
						filePath,
						root,
						containerWorkdir: options?.containerWorkdir
					}),
					cwd: root,
					root
				});
				if (options?.normalizeGuardedPathParams && record) {
					normalizedRecord ??= { ...record };
					normalizedRecord[key] = sandboxResult.resolved;
				}
			}
			return tool.execute(toolCallId, normalizedRecord ?? args, signal, onUpdate);
		}
	};
}
function createSandboxedReadTool(params) {
	return createOpenClawReadTool(createReadTool(params.root, { operations: createSandboxReadOperations(params) }), {
		modelContextWindowTokens: params.modelContextWindowTokens,
		imageSanitization: params.imageSanitization
	});
}
function createSandboxedWriteTool(params) {
	return wrapToolParamValidation(createWriteTool(params.root, { operations: createSandboxWriteOperations(params) }), REQUIRED_PARAM_GROUPS.write);
}
function createSandboxedEditTool(params) {
	return wrapToolParamValidation(wrapEditToolWithRecovery(createEditTool(params.root, { operations: createSandboxEditOperations(params) }), {
		root: params.root,
		readFile: async (absolutePath) => (await params.bridge.readFile({
			filePath: absolutePath,
			cwd: params.root
		})).toString("utf8")
	}), REQUIRED_PARAM_GROUPS.edit);
}
function createHostWorkspaceWriteTool(root, options) {
	return wrapToolParamValidation(createWriteTool(root, { operations: createHostWriteOperations(root, options) }), REQUIRED_PARAM_GROUPS.write);
}
function createHostWorkspaceEditTool(root, options) {
	return wrapToolParamValidation(wrapEditToolWithRecovery(createEditTool(root, { operations: createHostEditOperations(root, options) }), {
		root,
		readFile: (absolutePath) => fs.readFile(absolutePath, "utf-8")
	}), REQUIRED_PARAM_GROUPS.edit);
}
function createOpenClawReadTool(base, options) {
	return {
		...base,
		execute: async (toolCallId, params, signal) => {
			const record = getToolParamsRecord(params);
			assertRequiredParams(record, REQUIRED_PARAM_GROUPS.read, base.name);
			const result = await executeReadWithAdaptivePaging({
				base,
				toolCallId,
				args: record ?? {},
				signal,
				maxBytes: resolveAdaptiveReadMaxBytes(options)
			});
			const filePath = typeof record?.path === "string" ? record.path : "<unknown>";
			return sanitizeToolResultImages(await normalizeReadImageResult(stripReadTruncationContentDetails(result), filePath), `read:${filePath}`, options?.imageSanitization);
		}
	};
}
function createSandboxReadOperations(params) {
	return {
		readFile: (absolutePath) => params.bridge.readFile({
			filePath: absolutePath,
			cwd: params.root
		}),
		access: async (absolutePath) => {
			if (!await params.bridge.stat({
				filePath: absolutePath,
				cwd: params.root
			})) throw createFsAccessError("ENOENT", absolutePath);
		},
		detectImageMimeType: async (absolutePath) => {
			const mime = await detectMime({
				buffer: await params.bridge.readFile({
					filePath: absolutePath,
					cwd: params.root
				}),
				filePath: absolutePath
			});
			return mime && mime.startsWith("image/") ? mime : void 0;
		}
	};
}
function createSandboxWriteOperations(params) {
	return {
		mkdir: async (dir) => {
			await params.bridge.mkdirp({
				filePath: dir,
				cwd: params.root
			});
		},
		writeFile: async (absolutePath, content) => {
			await params.bridge.writeFile({
				filePath: absolutePath,
				cwd: params.root,
				data: content
			});
		}
	};
}
function createSandboxEditOperations(params) {
	return {
		readFile: (absolutePath) => params.bridge.readFile({
			filePath: absolutePath,
			cwd: params.root
		}),
		writeFile: (absolutePath, content) => params.bridge.writeFile({
			filePath: absolutePath,
			cwd: params.root,
			data: content
		}),
		access: async (absolutePath) => {
			if (!await params.bridge.stat({
				filePath: absolutePath,
				cwd: params.root
			})) throw createFsAccessError("ENOENT", absolutePath);
		}
	};
}
function expandTildeToOsHome(filePath) {
	const home = resolveOsHomeDir();
	return home ? expandHomePrefix(filePath, { home }) : filePath;
}
async function writeHostFile(absolutePath, content) {
	const resolved = path.resolve(expandTildeToOsHome(absolutePath));
	await fs.mkdir(path.dirname(resolved), { recursive: true });
	await fs.writeFile(resolved, content, "utf-8");
}
function createHostWriteOperations(root, options) {
	if (!(options?.workspaceOnly ?? false)) return {
		mkdir: async (dir) => {
			const resolved = path.resolve(expandTildeToOsHome(dir));
			await fs.mkdir(resolved, { recursive: true });
		},
		writeFile: writeHostFile
	};
	return {
		mkdir: async (dir) => {
			const relative = toRelativeWorkspacePath(root, dir, { allowRoot: true });
			const resolved = relative ? path.resolve(root, relative) : path.resolve(root);
			await assertSandboxPath({
				filePath: resolved,
				cwd: root,
				root
			});
			await fs.mkdir(resolved, { recursive: true });
		},
		writeFile: async (absolutePath, content) => {
			await writeFileWithinRoot({
				rootDir: root,
				relativePath: toRelativeWorkspacePath(root, absolutePath),
				data: content,
				mkdir: true
			});
		}
	};
}
function createHostEditOperations(root, options) {
	if (!(options?.workspaceOnly ?? false)) return {
		readFile: async (absolutePath) => {
			const resolved = path.resolve(expandTildeToOsHome(absolutePath));
			return await fs.readFile(resolved);
		},
		writeFile: writeHostFile,
		access: async (absolutePath) => {
			const resolved = path.resolve(expandTildeToOsHome(absolutePath));
			await fs.access(resolved);
		}
	};
	return {
		readFile: async (absolutePath) => {
			return (await readFileWithinRoot({
				rootDir: root,
				relativePath: toRelativeWorkspacePath(root, absolutePath)
			})).buffer;
		},
		writeFile: async (absolutePath, content) => {
			await writeFileWithinRoot({
				rootDir: root,
				relativePath: toRelativeWorkspacePath(root, absolutePath),
				data: content,
				mkdir: true
			});
		},
		access: async (absolutePath) => {
			let relative;
			try {
				relative = toRelativeWorkspacePath(root, absolutePath);
			} catch {
				return;
			}
			try {
				await (await openFileWithinRoot({
					rootDir: root,
					relativePath: relative
				})).handle.close().catch(() => {});
			} catch (error) {
				if (error instanceof SafeOpenError && error.code === "not-found") throw createFsAccessError("ENOENT", absolutePath);
				if (error instanceof SafeOpenError && error.code === "outside-workspace") return;
				throw error;
			}
		}
	};
}
function createFsAccessError(code, filePath) {
	const error = /* @__PURE__ */ new Error(`Sandbox FS error (${code}): ${filePath}`);
	error.code = code;
	return error;
}
//#endregion
//#region src/agents/openclaw-tools.nodes-workspace-guard.ts
function applyNodesToolWorkspaceGuard(nodesToolBase, options) {
	if (options.fsPolicy?.workspaceOnly !== true) return nodesToolBase;
	return wrapToolWorkspaceRootGuardWithOptions(nodesToolBase, options.sandboxRoot ?? options.workspaceDir, {
		containerWorkdir: options.sandboxContainerWorkdir,
		normalizeGuardedPathParams: true,
		pathParamKeys: ["outPath"]
	});
}
//#endregion
//#region src/agents/openclaw-tools.registration.ts
function collectPresentOpenClawTools(candidates) {
	return candidates.filter((tool) => tool !== null && tool !== void 0);
}
function isUpdatePlanToolEnabledForOpenClawTools(params) {
	const configured = params.config?.tools?.experimental?.planTool;
	if (configured !== void 0) return configured;
	return isStrictAgenticExecutionContractActive({
		config: params.config,
		sessionKey: params.agentSessionKey,
		agentId: params.agentId,
		provider: params.modelProvider,
		modelId: params.modelId
	});
}
//#endregion
//#region src/agents/tools/agents-list-tool.ts
const AgentsListToolSchema = Type.Object({});
function createAgentsListTool(opts) {
	return {
		label: "Agents",
		name: "agents_list",
		description: "List OpenClaw agent ids you can target with `sessions_spawn` when `runtime=\"subagent\"` (based on subagent allowlists).",
		parameters: AgentsListToolSchema,
		execute: async () => {
			const cfg = loadConfig();
			const { mainKey, alias } = resolveMainSessionAlias(cfg);
			const requesterInternalKey = typeof opts?.agentSessionKey === "string" && opts.agentSessionKey.trim() ? resolveInternalSessionKey({
				key: opts.agentSessionKey,
				alias,
				mainKey
			}) : alias;
			const requesterAgentId = normalizeAgentId(opts?.requesterAgentIdOverride ?? parseAgentSessionKey(requesterInternalKey)?.agentId ?? "main");
			const allowAgents = resolveAgentConfig(cfg, requesterAgentId)?.subagents?.allowAgents ?? cfg?.agents?.defaults?.subagents?.allowAgents ?? [];
			const allowAny = allowAgents.some((value) => value.trim() === "*");
			const allowSet = new Set(allowAgents.filter((value) => value.trim() && value.trim() !== "*").map((value) => normalizeAgentId(value)));
			const configuredAgents = Array.isArray(cfg.agents?.list) ? cfg.agents?.list : [];
			const configuredIds = configuredAgents.map((entry) => normalizeAgentId(entry.id));
			const configuredNameMap = /* @__PURE__ */ new Map();
			for (const entry of configuredAgents) {
				const name = entry?.name?.trim() ?? "";
				if (!name) continue;
				configuredNameMap.set(normalizeAgentId(entry.id), name);
			}
			const allowed = /* @__PURE__ */ new Set();
			allowed.add(requesterAgentId);
			if (allowAny) for (const id of configuredIds) allowed.add(id);
			else for (const id of allowSet) allowed.add(id);
			return jsonResult({
				requester: requesterAgentId,
				allowAny,
				agents: [requesterAgentId, ...Array.from(allowed).filter((id) => id !== requesterAgentId).toSorted((a, b) => a.localeCompare(b))].map((id) => ({
					id,
					name: configuredNameMap.get(id),
					configured: configuredIds.includes(id)
				}))
			});
		}
	};
}
//#endregion
//#region src/agents/tools/canvas-tool.ts
const CANVAS_ACTIONS = [
	"present",
	"hide",
	"navigate",
	"eval",
	"snapshot",
	"a2ui_push",
	"a2ui_reset"
];
const CANVAS_SNAPSHOT_FORMATS = [
	"png",
	"jpg",
	"jpeg"
];
async function readJsonlFromPath(jsonlPath) {
	const trimmed = jsonlPath.trim();
	if (!trimmed) return "";
	const resolved = path.resolve(trimmed);
	const roots = getDefaultMediaLocalRoots();
	if (!isInboundPathAllowed({
		filePath: resolved,
		roots
	})) {
		if (shouldLogVerbose()) logVerbose(`Blocked canvas jsonlPath outside allowed roots: ${resolved}`);
		throw new Error("jsonlPath outside allowed roots");
	}
	const canonical = await fs.realpath(resolved).catch(() => resolved);
	if (!isInboundPathAllowed({
		filePath: canonical,
		roots
	})) {
		if (shouldLogVerbose()) logVerbose(`Blocked canvas jsonlPath outside allowed roots: ${canonical}`);
		throw new Error("jsonlPath outside allowed roots");
	}
	return await fs.readFile(canonical, "utf8");
}
const CanvasToolSchema = Type.Object({
	action: stringEnum(CANVAS_ACTIONS),
	gatewayUrl: Type.Optional(Type.String()),
	gatewayToken: Type.Optional(Type.String()),
	timeoutMs: Type.Optional(Type.Number()),
	node: Type.Optional(Type.String()),
	target: Type.Optional(Type.String()),
	x: Type.Optional(Type.Number()),
	y: Type.Optional(Type.Number()),
	width: Type.Optional(Type.Number()),
	height: Type.Optional(Type.Number()),
	url: Type.Optional(Type.String()),
	javaScript: Type.Optional(Type.String()),
	outputFormat: optionalStringEnum(CANVAS_SNAPSHOT_FORMATS),
	maxWidth: Type.Optional(Type.Number()),
	quality: Type.Optional(Type.Number()),
	delayMs: Type.Optional(Type.Number()),
	jsonl: Type.Optional(Type.String()),
	jsonlPath: Type.Optional(Type.String())
});
function createCanvasTool(options) {
	const imageSanitization = resolveImageSanitizationLimits(options?.config);
	return {
		label: "Canvas",
		name: "canvas",
		description: "Control node canvases (present/hide/navigate/eval/snapshot/A2UI). Use snapshot to capture the rendered UI.",
		parameters: CanvasToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const action = readStringParam$1(params, "action", { required: true });
			const gatewayOpts = readGatewayCallOptions(params);
			const nodeId = await resolveNodeId(gatewayOpts, readStringParam$1(params, "node", { trim: true }), true);
			const invoke = async (command, invokeParams) => await callGatewayTool("node.invoke", gatewayOpts, {
				nodeId,
				command,
				params: invokeParams,
				idempotencyKey: crypto.randomUUID()
			});
			switch (action) {
				case "present": {
					const placement = {
						x: typeof params.x === "number" ? params.x : void 0,
						y: typeof params.y === "number" ? params.y : void 0,
						width: typeof params.width === "number" ? params.width : void 0,
						height: typeof params.height === "number" ? params.height : void 0
					};
					const invokeParams = {};
					const presentTarget = readStringParam$1(params, "target", { trim: true }) ?? readStringParam$1(params, "url", { trim: true });
					if (presentTarget) invokeParams.url = presentTarget;
					if (Number.isFinite(placement.x) || Number.isFinite(placement.y) || Number.isFinite(placement.width) || Number.isFinite(placement.height)) invokeParams.placement = placement;
					await invoke("canvas.present", invokeParams);
					return jsonResult({ ok: true });
				}
				case "hide":
					await invoke("canvas.hide", void 0);
					return jsonResult({ ok: true });
				case "navigate":
					await invoke("canvas.navigate", { url: readStringParam$1(params, "url", { trim: true }) ?? readStringParam$1(params, "target", {
						required: true,
						trim: true,
						label: "url"
					}) });
					return jsonResult({ ok: true });
				case "eval": {
					const result = (await invoke("canvas.eval", { javaScript: readStringParam$1(params, "javaScript", { required: true }) }))?.payload?.result;
					if (result) return {
						content: [{
							type: "text",
							text: result
						}],
						details: { result }
					};
					return jsonResult({ ok: true });
				}
				case "snapshot": {
					const formatRaw = normalizeLowercaseStringOrEmpty(params.outputFormat) || "png";
					const payload = parseCanvasSnapshotPayload((await invoke("canvas.snapshot", {
						format: formatRaw === "jpg" || formatRaw === "jpeg" ? "jpeg" : "png",
						maxWidth: typeof params.maxWidth === "number" && Number.isFinite(params.maxWidth) ? params.maxWidth : void 0,
						quality: typeof params.quality === "number" && Number.isFinite(params.quality) ? params.quality : void 0
					}))?.payload);
					const filePath = canvasSnapshotTempPath({ ext: payload.format === "jpeg" ? "jpg" : payload.format });
					await writeBase64ToFile(filePath, payload.base64);
					const mimeType = imageMimeFromFormat(payload.format) ?? "image/png";
					return await imageResult({
						label: "canvas:snapshot",
						path: filePath,
						base64: payload.base64,
						mimeType,
						details: { format: payload.format },
						imageSanitization
					});
				}
				case "a2ui_push": {
					const jsonl = typeof params.jsonl === "string" && params.jsonl.trim() ? params.jsonl : typeof params.jsonlPath === "string" && params.jsonlPath.trim() ? await readJsonlFromPath(params.jsonlPath) : "";
					if (!jsonl.trim()) throw new Error("jsonl or jsonlPath required");
					await invoke("canvas.a2ui.pushJSONL", { jsonl });
					return jsonResult({ ok: true });
				}
				case "a2ui_reset":
					await invoke("canvas.a2ui.reset", void 0);
					return jsonResult({ ok: true });
				default: throw new Error(`Unknown action: ${action}`);
			}
		}
	};
}
//#endregion
//#region src/cron/normalize.ts
const DEFAULT_OPTIONS = { applyDefaults: false };
function hasTrimmedStringValue(value) {
	return parseOptionalField(TrimmedNonEmptyStringFieldSchema, value) !== void 0;
}
function hasAgentTurnPayloadHint(payload) {
	return hasTrimmedStringValue(payload.model) || normalizeTrimmedStringArray(payload.fallbacks) !== void 0 || normalizeTrimmedStringArray(payload.toolsAllow, { allowNull: true }) !== void 0 || hasTrimmedStringValue(payload.thinking) || typeof payload.timeoutSeconds === "number" || typeof payload.lightContext === "boolean" || typeof payload.allowUnsafeExternalContent === "boolean";
}
function normalizeTrimmedStringArray(value, options) {
	if (Array.isArray(value)) {
		const normalized = value.map((entry) => normalizeOptionalString(entry)).filter((entry) => Boolean(entry));
		if (normalized.length === 0 && value.length > 0) return;
		return normalized;
	}
	if (options?.allowNull && value === null) return null;
}
function coerceSchedule(schedule) {
	const next = { ...schedule };
	const rawKind = normalizeLowercaseStringOrEmpty(schedule.kind);
	const kind = rawKind === "at" || rawKind === "every" || rawKind === "cron" ? rawKind : void 0;
	const exprRaw = normalizeOptionalString(schedule.expr) ?? "";
	const legacyCronRaw = normalizeOptionalString(schedule.cron) ?? "";
	const normalizedExpr = exprRaw || legacyCronRaw;
	const atMsRaw = schedule.atMs;
	const atRaw = schedule.at;
	const atString = normalizeOptionalString(atRaw) ?? "";
	const parsedAtMs = typeof atMsRaw === "number" ? atMsRaw : typeof atMsRaw === "string" ? parseAbsoluteTimeMs(atMsRaw) : atString ? parseAbsoluteTimeMs(atString) : null;
	if (kind) next.kind = kind;
	else if (typeof schedule.atMs === "number" || typeof schedule.at === "string" || typeof schedule.atMs === "string") next.kind = "at";
	else if (typeof schedule.everyMs === "number") next.kind = "every";
	else if (normalizedExpr) next.kind = "cron";
	if (atString) next.at = parsedAtMs !== null ? new Date(parsedAtMs).toISOString() : atString;
	else if (parsedAtMs !== null) next.at = new Date(parsedAtMs).toISOString();
	if ("atMs" in next) delete next.atMs;
	if (normalizedExpr) next.expr = normalizedExpr;
	else if ("expr" in next) delete next.expr;
	if ("cron" in next) delete next.cron;
	const staggerMs = normalizeCronStaggerMs(schedule.staggerMs);
	if (staggerMs !== void 0) next.staggerMs = staggerMs;
	else if ("staggerMs" in next) delete next.staggerMs;
	if (next.kind === "at") {
		delete next.everyMs;
		delete next.anchorMs;
		delete next.expr;
		delete next.tz;
		delete next.staggerMs;
	} else if (next.kind === "every") {
		delete next.at;
		delete next.expr;
		delete next.tz;
		delete next.staggerMs;
	} else if (next.kind === "cron") {
		delete next.at;
		delete next.everyMs;
		delete next.anchorMs;
	}
	return next;
}
function coercePayload(payload) {
	const next = { ...payload };
	const kindRaw = normalizeLowercaseStringOrEmpty(next.kind);
	if (kindRaw === "agentturn") next.kind = "agentTurn";
	else if (kindRaw === "systemevent") next.kind = "systemEvent";
	else if (kindRaw) next.kind = kindRaw;
	if (!next.kind) {
		const hasMessage = Boolean(normalizeOptionalString(next.message));
		const hasText = Boolean(normalizeOptionalString(next.text));
		if (hasMessage) next.kind = "agentTurn";
		else if (hasText) next.kind = "systemEvent";
		else if (hasAgentTurnPayloadHint(next)) next.kind = "agentTurn";
	}
	if (typeof next.message === "string") {
		const trimmed = normalizeOptionalString(next.message) ?? "";
		if (trimmed) next.message = trimmed;
	}
	if (typeof next.text === "string") {
		const trimmed = normalizeOptionalString(next.text) ?? "";
		if (trimmed) next.text = trimmed;
	}
	if ("model" in next) {
		const model = parseOptionalField(TrimmedNonEmptyStringFieldSchema, next.model);
		if (model !== void 0) next.model = model;
		else delete next.model;
	}
	if ("thinking" in next) {
		const thinking = parseOptionalField(TrimmedNonEmptyStringFieldSchema, next.thinking);
		if (thinking !== void 0) next.thinking = thinking;
		else delete next.thinking;
	}
	if ("timeoutSeconds" in next) {
		const timeoutSeconds = parseOptionalField(TimeoutSecondsFieldSchema, next.timeoutSeconds);
		if (timeoutSeconds !== void 0) next.timeoutSeconds = timeoutSeconds;
		else delete next.timeoutSeconds;
	}
	if ("fallbacks" in next) {
		const fallbacks = normalizeTrimmedStringArray(next.fallbacks);
		if (fallbacks !== void 0) next.fallbacks = fallbacks;
		else delete next.fallbacks;
	}
	if ("toolsAllow" in next) {
		const toolsAllow = normalizeTrimmedStringArray(next.toolsAllow, { allowNull: true });
		if (toolsAllow !== void 0) next.toolsAllow = toolsAllow;
		else delete next.toolsAllow;
	}
	if ("allowUnsafeExternalContent" in next && typeof next.allowUnsafeExternalContent !== "boolean") delete next.allowUnsafeExternalContent;
	if (next.kind === "systemEvent") {
		delete next.message;
		delete next.model;
		delete next.fallbacks;
		delete next.thinking;
		delete next.timeoutSeconds;
		delete next.lightContext;
		delete next.allowUnsafeExternalContent;
		delete next.toolsAllow;
	} else if (next.kind === "agentTurn") delete next.text;
	if ("deliver" in next) delete next.deliver;
	if ("channel" in next) delete next.channel;
	if ("to" in next) delete next.to;
	if ("threadId" in next) delete next.threadId;
	if ("bestEffortDeliver" in next) delete next.bestEffortDeliver;
	if ("provider" in next) delete next.provider;
	return next;
}
function coerceDelivery(delivery) {
	const next = { ...delivery };
	const parsed = parseDeliveryInput(delivery);
	if (parsed.mode !== void 0) next.mode = parsed.mode;
	else if ("mode" in next) delete next.mode;
	if (parsed.channel !== void 0) next.channel = parsed.channel;
	else if ("channel" in next) delete next.channel;
	if (parsed.to !== void 0) next.to = parsed.to;
	else if ("to" in next) delete next.to;
	if (parsed.threadId !== void 0) next.threadId = parsed.threadId;
	else if ("threadId" in next) delete next.threadId;
	if (parsed.accountId !== void 0) next.accountId = parsed.accountId;
	else if ("accountId" in next) delete next.accountId;
	return next;
}
function inferTopLevelPayload(next) {
	const message = normalizeOptionalString(next.message) ?? "";
	if (message) return {
		kind: "agentTurn",
		message
	};
	const text = normalizeOptionalString(next.text) ?? "";
	if (text) return {
		kind: "systemEvent",
		text
	};
	if (hasAgentTurnPayloadHint(next)) return { kind: "agentTurn" };
	return null;
}
function unwrapJob(raw) {
	if (isRecord(raw.data)) return raw.data;
	if (isRecord(raw.job)) return raw.job;
	return raw;
}
function normalizeSessionTarget(raw) {
	if (typeof raw !== "string") return;
	const trimmed = raw.trim();
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	if (lower === "main" || lower === "isolated" || lower === "current") return lower;
	if (lower.startsWith("session:")) return `session:${assertSafeCronSessionTargetId(trimmed.slice(8))}`;
}
function normalizeWakeMode(raw) {
	if (typeof raw !== "string") return;
	const trimmed = normalizeOptionalLowercaseString(raw);
	if (trimmed === "now" || trimmed === "next-heartbeat") return trimmed;
}
function copyTopLevelAgentTurnFields(next, payload) {
	const copyString = (field) => {
		if (normalizeOptionalString(payload[field])) return;
		const value = next[field];
		const normalized = normalizeOptionalString(value);
		if (normalized) payload[field] = normalized;
	};
	copyString("model");
	copyString("thinking");
	if (typeof payload.timeoutSeconds !== "number" && typeof next.timeoutSeconds === "number") payload.timeoutSeconds = next.timeoutSeconds;
	if (!Array.isArray(payload.fallbacks) && Array.isArray(next.fallbacks)) {
		const fallbacks = normalizeTrimmedStringArray(next.fallbacks);
		if (fallbacks !== void 0) payload.fallbacks = fallbacks;
	}
	if (!("toolsAllow" in payload) || payload.toolsAllow === void 0) {
		const toolsAllow = normalizeTrimmedStringArray(next.toolsAllow, { allowNull: true });
		if (toolsAllow !== void 0) payload.toolsAllow = toolsAllow;
	}
	if (typeof payload.lightContext !== "boolean" && typeof next.lightContext === "boolean") payload.lightContext = next.lightContext;
	if (typeof payload.allowUnsafeExternalContent !== "boolean" && typeof next.allowUnsafeExternalContent === "boolean") payload.allowUnsafeExternalContent = next.allowUnsafeExternalContent;
}
function stripLegacyTopLevelFields(next) {
	delete next.model;
	delete next.thinking;
	delete next.timeoutSeconds;
	delete next.fallbacks;
	delete next.lightContext;
	delete next.toolsAllow;
	delete next.allowUnsafeExternalContent;
	delete next.message;
	delete next.text;
	delete next.deliver;
	delete next.channel;
	delete next.to;
	delete next.toolsAllow;
	delete next.threadId;
	delete next.bestEffortDeliver;
	delete next.provider;
}
function normalizeCronJobInput(raw, options = DEFAULT_OPTIONS) {
	if (!isRecord(raw)) return null;
	const base = unwrapJob(raw);
	const next = { ...base };
	if ("agentId" in base) {
		const agentId = base.agentId;
		if (agentId === null) next.agentId = null;
		else if (typeof agentId === "string") {
			const trimmed = agentId.trim();
			if (trimmed) next.agentId = sanitizeAgentId(trimmed);
			else delete next.agentId;
		}
	}
	if ("sessionKey" in base) {
		const sessionKey = base.sessionKey;
		if (sessionKey === null) next.sessionKey = null;
		else if (typeof sessionKey === "string") {
			const trimmed = sessionKey.trim();
			if (trimmed) next.sessionKey = trimmed;
			else delete next.sessionKey;
		}
	}
	if ("enabled" in base) {
		const enabled = base.enabled;
		if (typeof enabled === "boolean") next.enabled = enabled;
		else if (typeof enabled === "string") {
			const trimmed = normalizeOptionalLowercaseString(enabled);
			if (trimmed === "true") next.enabled = true;
			if (trimmed === "false") next.enabled = false;
		}
	}
	if ("sessionTarget" in base) {
		const normalized = normalizeSessionTarget(base.sessionTarget);
		if (normalized) next.sessionTarget = normalized;
		else delete next.sessionTarget;
	}
	if ("wakeMode" in base) {
		const normalized = normalizeWakeMode(base.wakeMode);
		if (normalized) next.wakeMode = normalized;
		else delete next.wakeMode;
	}
	if (isRecord(base.schedule)) next.schedule = coerceSchedule(base.schedule);
	if (!("payload" in next) || !isRecord(next.payload)) {
		const inferredPayload = inferTopLevelPayload(next);
		if (inferredPayload) next.payload = inferredPayload;
	}
	if (isRecord(base.payload)) next.payload = coercePayload(base.payload);
	if (isRecord(base.delivery)) next.delivery = coerceDelivery(base.delivery);
	if ("isolation" in next) delete next.isolation;
	const payload = isRecord(next.payload) ? next.payload : null;
	if (payload && payload.kind === "agentTurn") copyTopLevelAgentTurnFields(next, payload);
	stripLegacyTopLevelFields(next);
	if (options.applyDefaults) {
		if (!next.wakeMode) next.wakeMode = "now";
		if (typeof next.enabled !== "boolean") next.enabled = true;
		if ((typeof next.name !== "string" || !next.name.trim()) && isRecord(next.schedule) && isRecord(next.payload)) next.name = inferLegacyName({
			schedule: next.schedule,
			payload: next.payload
		});
		else if (typeof next.name === "string") {
			const trimmed = next.name.trim();
			if (trimmed) next.name = trimmed;
		}
		if (!next.sessionTarget && isRecord(next.payload)) {
			const kind = typeof next.payload.kind === "string" ? next.payload.kind : "";
			if (kind === "systemEvent") next.sessionTarget = "main";
			else if (kind === "agentTurn") next.sessionTarget = "isolated";
		}
		if (next.sessionTarget === "current") {
			if (options.sessionContext?.sessionKey) {
				const sessionKey = options.sessionContext.sessionKey.trim();
				if (sessionKey) next.sessionTarget = `session:${assertSafeCronSessionTargetId(sessionKey)}`;
			}
			if (next.sessionTarget === "current") next.sessionTarget = "isolated";
		}
		if (next.sessionTarget === "current") {
			const sessionKey = options.sessionContext?.sessionKey?.trim();
			if (sessionKey) next.sessionTarget = `session:${assertSafeCronSessionTargetId(sessionKey)}`;
			else next.sessionTarget = "isolated";
		}
		if ("schedule" in next && isRecord(next.schedule) && next.schedule.kind === "at" && !("deleteAfterRun" in next)) next.deleteAfterRun = true;
		if ("schedule" in next && isRecord(next.schedule) && next.schedule.kind === "cron") {
			const schedule = next.schedule;
			const explicit = normalizeCronStaggerMs(schedule.staggerMs);
			if (explicit !== void 0) schedule.staggerMs = explicit;
			else {
				const defaultStaggerMs = resolveDefaultCronStaggerMs(typeof schedule.expr === "string" ? schedule.expr : "");
				if (defaultStaggerMs !== void 0) schedule.staggerMs = defaultStaggerMs;
			}
		}
		const payload = isRecord(next.payload) ? next.payload : null;
		const payloadKind = payload && typeof payload.kind === "string" ? payload.kind : "";
		const sessionTarget = typeof next.sessionTarget === "string" ? next.sessionTarget : "";
		const isIsolatedAgentTurn = sessionTarget === "isolated" || sessionTarget === "current" || sessionTarget.startsWith("session:") || sessionTarget === "" && payloadKind === "agentTurn";
		if (!("delivery" in next && next.delivery !== void 0) && isIsolatedAgentTurn && payloadKind === "agentTurn") next.delivery = { mode: "announce" };
	}
	return next;
}
function normalizeCronJobCreate(raw, options) {
	return normalizeCronJobInput(raw, {
		applyDefaults: true,
		...options
	});
}
function normalizeCronJobPatch(raw, options) {
	return normalizeCronJobInput(raw, {
		applyDefaults: false,
		...options
	});
}
const OPENCLAW_OWNER_ONLY_CORE_TOOL_NAME_SET = new Set([
	"cron",
	"gateway",
	"nodes"
]);
function isOpenClawOwnerOnlyCoreToolName(toolName) {
	return OPENCLAW_OWNER_ONLY_CORE_TOOL_NAME_SET.has(toolName);
}
//#endregion
//#region src/agents/tools/cron-tool.ts
const CRON_ACTIONS = [
	"status",
	"list",
	"add",
	"update",
	"remove",
	"run",
	"runs",
	"wake"
];
const CRON_SCHEDULE_KINDS = [
	"at",
	"every",
	"cron"
];
const CRON_WAKE_MODES = ["now", "next-heartbeat"];
const CRON_PAYLOAD_KINDS = ["systemEvent", "agentTurn"];
const CRON_DELIVERY_MODES = [
	"none",
	"announce",
	"webhook"
];
const CRON_RUN_MODES = ["due", "force"];
const CRON_RECOVERABLE_OBJECT_KEYS = new Set([
	"name",
	"schedule",
	"sessionTarget",
	"wakeMode",
	"payload",
	"delivery",
	"enabled",
	"description",
	"deleteAfterRun",
	"agentId",
	"sessionKey",
	"failureAlert",
	...[
		"message",
		"text",
		"model",
		"fallbacks",
		"toolsAllow",
		"thinking",
		"timeoutSeconds",
		"lightContext",
		"allowUnsafeExternalContent"
	]
]);
const REMINDER_CONTEXT_MESSAGES_MAX = 10;
const REMINDER_CONTEXT_PER_MESSAGE_MAX = 220;
const REMINDER_CONTEXT_TOTAL_MAX = 700;
const REMINDER_CONTEXT_MARKER = "\n\nRecent context:\n";
function nullableStringSchema(description) {
	return Type.Optional(Type.String({ description }));
}
function nullableStringArraySchema(description) {
	return Type.Optional(Type.Array(Type.String(), { description }));
}
function cronPayloadObjectSchema(params) {
	return Type.Object({
		kind: optionalStringEnum(CRON_PAYLOAD_KINDS, { description: "Payload type" }),
		text: Type.Optional(Type.String({ description: "Message text (kind=systemEvent)" })),
		message: Type.Optional(Type.String({ description: "Agent prompt (kind=agentTurn)" })),
		model: Type.Optional(Type.String({ description: "Model override" })),
		thinking: Type.Optional(Type.String({ description: "Thinking level override" })),
		timeoutSeconds: Type.Optional(Type.Number()),
		lightContext: Type.Optional(Type.Boolean()),
		allowUnsafeExternalContent: Type.Optional(Type.Boolean()),
		fallbacks: Type.Optional(Type.Array(Type.String(), { description: "Fallback model ids" })),
		toolsAllow: params.toolsAllow
	}, { additionalProperties: true });
}
const CronScheduleSchema = Type.Optional(Type.Object({
	kind: optionalStringEnum(CRON_SCHEDULE_KINDS, { description: "Schedule type" }),
	at: Type.Optional(Type.String({ description: "ISO-8601 timestamp (kind=at)" })),
	everyMs: Type.Optional(Type.Number({ description: "Interval in milliseconds (kind=every)" })),
	anchorMs: Type.Optional(Type.Number({ description: "Optional start anchor in milliseconds (kind=every)" })),
	expr: Type.Optional(Type.String({ description: "Cron expression (kind=cron)" })),
	tz: Type.Optional(Type.String({ description: "IANA timezone (kind=cron)" })),
	staggerMs: Type.Optional(Type.Number({ description: "Random jitter in ms (kind=cron)" }))
}, { additionalProperties: true }));
const CronPayloadSchema = Type.Optional(cronPayloadObjectSchema({ toolsAllow: Type.Optional(Type.Array(Type.String(), { description: "Allowed tool ids" })) }));
const CronDeliverySchema = Type.Optional(Type.Object({
	mode: optionalStringEnum(CRON_DELIVERY_MODES, { description: "Delivery mode" }),
	channel: Type.Optional(Type.String({ description: "Delivery channel" })),
	to: Type.Optional(Type.String({ description: "Delivery target" })),
	bestEffort: Type.Optional(Type.Boolean()),
	accountId: Type.Optional(Type.String({ description: "Account target for delivery" })),
	failureDestination: Type.Optional(Type.Object({
		channel: Type.Optional(Type.String()),
		to: Type.Optional(Type.String()),
		accountId: Type.Optional(Type.String()),
		mode: optionalStringEnum(["announce", "webhook"])
	}, { additionalProperties: true }))
}, { additionalProperties: true }));
const CronFailureAlertSchema = Type.Optional(Type.Unsafe({
	type: "object",
	properties: {
		after: Type.Optional(Type.Number({ description: "Failures before alerting" })),
		channel: Type.Optional(Type.String({ description: "Alert channel" })),
		to: Type.Optional(Type.String({ description: "Alert target" })),
		cooldownMs: Type.Optional(Type.Number({ description: "Cooldown between alerts in ms" })),
		mode: optionalStringEnum(["announce", "webhook"]),
		accountId: Type.Optional(Type.String())
	},
	additionalProperties: true,
	description: "Failure alert config object, or the boolean value false to disable alerts for this job"
}));
const CronJobObjectSchema = Type.Optional(Type.Object({
	name: Type.Optional(Type.String({ description: "Job name" })),
	schedule: CronScheduleSchema,
	sessionTarget: Type.Optional(Type.String({ description: "Session target: \"main\", \"isolated\", \"current\", or \"session:<id>\"" })),
	wakeMode: optionalStringEnum(CRON_WAKE_MODES, { description: "When to wake the session" }),
	payload: CronPayloadSchema,
	delivery: CronDeliverySchema,
	agentId: nullableStringSchema("Agent id, or null to keep it unset"),
	description: Type.Optional(Type.String({ description: "Human-readable description" })),
	enabled: Type.Optional(Type.Boolean()),
	deleteAfterRun: Type.Optional(Type.Boolean({ description: "Delete after first execution" })),
	sessionKey: nullableStringSchema("Explicit session key, or null to clear it"),
	failureAlert: CronFailureAlertSchema
}, { additionalProperties: true }));
const CronPatchObjectSchema = Type.Optional(Type.Object({
	name: Type.Optional(Type.String({ description: "Job name" })),
	schedule: CronScheduleSchema,
	sessionTarget: Type.Optional(Type.String({ description: "Session target" })),
	wakeMode: optionalStringEnum(CRON_WAKE_MODES),
	payload: Type.Optional(cronPayloadObjectSchema({ toolsAllow: nullableStringArraySchema("Allowed tool ids, or null to clear") })),
	delivery: CronDeliverySchema,
	description: Type.Optional(Type.String()),
	enabled: Type.Optional(Type.Boolean()),
	deleteAfterRun: Type.Optional(Type.Boolean()),
	agentId: nullableStringSchema("Agent id, or null to clear it"),
	sessionKey: nullableStringSchema("Explicit session key, or null to clear it"),
	failureAlert: CronFailureAlertSchema
}, { additionalProperties: true }));
const CronToolSchema = Type.Object({
	action: stringEnum(CRON_ACTIONS),
	gatewayUrl: Type.Optional(Type.String()),
	gatewayToken: Type.Optional(Type.String()),
	timeoutMs: Type.Optional(Type.Number()),
	includeDisabled: Type.Optional(Type.Boolean()),
	job: CronJobObjectSchema,
	jobId: Type.Optional(Type.String()),
	id: Type.Optional(Type.String()),
	patch: CronPatchObjectSchema,
	text: Type.Optional(Type.String()),
	mode: optionalStringEnum(CRON_WAKE_MODES),
	runMode: optionalStringEnum(CRON_RUN_MODES),
	contextMessages: Type.Optional(Type.Number({
		minimum: 0,
		maximum: REMINDER_CONTEXT_MESSAGES_MAX
	}))
}, { additionalProperties: true });
function stripExistingContext(text) {
	const index = text.indexOf(REMINDER_CONTEXT_MARKER);
	if (index === -1) return text;
	return text.slice(0, index).trim();
}
function truncateText(input, maxLen) {
	if (input.length <= maxLen) return input;
	return `${truncateUtf16Safe(input, Math.max(0, maxLen - 3)).trimEnd()}...`;
}
function extractMessageText(message) {
	const role = typeof message.role === "string" ? message.role : "";
	if (role !== "user" && role !== "assistant") return null;
	const text = extractTextFromChatContent(message.content);
	return text ? {
		role,
		text
	} : null;
}
async function buildReminderContextLines(params) {
	const maxMessages = Math.min(REMINDER_CONTEXT_MESSAGES_MAX, Math.max(0, Math.floor(params.contextMessages)));
	if (maxMessages <= 0) return [];
	const sessionKey = params.agentSessionKey?.trim();
	if (!sessionKey) return [];
	const { mainKey, alias } = resolveMainSessionAlias(loadConfig());
	const resolvedKey = resolveInternalSessionKey({
		key: sessionKey,
		alias,
		mainKey
	});
	try {
		const res = await params.callGatewayTool("chat.history", params.gatewayOpts, {
			sessionKey: resolvedKey,
			limit: maxMessages
		});
		const recent = (Array.isArray(res?.messages) ? res.messages : []).map((msg) => extractMessageText(msg)).filter((msg) => Boolean(msg)).slice(-maxMessages);
		if (recent.length === 0) return [];
		const lines = [];
		let total = 0;
		for (const entry of recent) {
			const line = `- ${entry.role === "user" ? "User" : "Assistant"}: ${truncateText(entry.text, REMINDER_CONTEXT_PER_MESSAGE_MAX)}`;
			total += line.length;
			if (total > REMINDER_CONTEXT_TOTAL_MAX) break;
			lines.push(line);
		}
		return lines;
	} catch {
		return [];
	}
}
function stripThreadSuffixFromSessionKey(sessionKey) {
	const idx = normalizeLowercaseStringOrEmpty(sessionKey).lastIndexOf(":thread:");
	if (idx <= 0) return sessionKey;
	const parent = sessionKey.slice(0, idx).trim();
	return parent ? parent : sessionKey;
}
function inferDeliveryFromSessionKey(agentSessionKey) {
	const rawSessionKey = agentSessionKey?.trim();
	if (!rawSessionKey) return null;
	const parsed = parseAgentSessionKey(stripThreadSuffixFromSessionKey(rawSessionKey));
	if (!parsed || !parsed.rest) return null;
	const parts = parsed.rest.split(":").filter(Boolean);
	if (parts.length === 0) return null;
	const head = normalizeOptionalLowercaseString(parts[0]);
	if (!head || head === "main" || head === "subagent" || head === "acp") return null;
	const markerIndex = parts.findIndex((part) => part === "direct" || part === "dm" || part === "group" || part === "channel");
	if (markerIndex === -1) return null;
	const peerId = parts.slice(markerIndex + 1).join(":").trim();
	if (!peerId) return null;
	let channel;
	if (markerIndex >= 1) channel = normalizeOptionalLowercaseString(parts[0]);
	const delivery = {
		mode: "announce",
		to: peerId
	};
	if (channel) delivery.channel = channel;
	return delivery;
}
function createCronTool(opts, deps) {
	const callGateway = deps?.callGatewayTool ?? callGatewayTool;
	return {
		label: "Cron",
		name: "cron",
		ownerOnly: isOpenClawOwnerOnlyCoreToolName("cron"),
		displaySummary: CRON_TOOL_DISPLAY_SUMMARY,
		description: `Manage Gateway cron jobs (status/list/add/update/remove/run/runs) and send wake events. Use this for reminders, "check back later" requests, delayed follow-ups, and recurring tasks. Do not emulate scheduling with exec sleep or process polling.

Main-session cron jobs enqueue system events for heartbeat handling. Isolated cron jobs create background task runs that appear in \`openclaw tasks\`.

ACTIONS:
- status: Check cron scheduler status
- list: List jobs (use includeDisabled:true to include disabled)
- add: Create job (requires job object, see schema below)
- update: Modify job (requires jobId + patch object)
- remove: Delete job (requires jobId)
- run: Trigger job immediately (requires jobId)
- runs: Get job run history (requires jobId)
- wake: Send wake event (requires text, optional mode)

JOB SCHEMA (for add action):
{
  "name": "string (optional)",
  "schedule": { ... },      // Required: when to run
  "payload": { ... },       // Required: what to execute
  "delivery": { ... },      // Optional: announce summary (isolated/current/session:xxx only) or webhook POST
  "sessionTarget": "main" | "isolated" | "current" | "session:<custom-id>",  // Optional, defaults based on context
  "enabled": true | false   // Optional, default true
}

SESSION TARGET OPTIONS:
- "main": Run in the main session (requires payload.kind="systemEvent")
- "isolated": Run in an ephemeral isolated session (requires payload.kind="agentTurn")
- "current": Bind to the current session where the cron is created (resolved at creation time)
- "session:<custom-id>": Run in a persistent named session (e.g., "session:project-alpha-daily")

DEFAULT BEHAVIOR (unchanged for backward compatibility):
- payload.kind="systemEvent" → defaults to "main"
- payload.kind="agentTurn" → defaults to "isolated"
To use current session binding, explicitly set sessionTarget="current".

SCHEDULE TYPES (schedule.kind):
- "at": One-shot at absolute time
  { "kind": "at", "at": "<ISO-8601 timestamp>" }
- "every": Recurring interval
  { "kind": "every", "everyMs": <interval-ms>, "anchorMs": <optional-start-ms> }
- "cron": Cron expression
  { "kind": "cron", "expr": "<cron-expression>", "tz": "<optional-timezone>" }

ISO timestamps without an explicit timezone are treated as UTC.

PAYLOAD TYPES (payload.kind):
- "systemEvent": Injects text as system event into session
  { "kind": "systemEvent", "text": "<message>" }
- "agentTurn": Runs agent with message (isolated sessions only)
  { "kind": "agentTurn", "message": "<prompt>", "model": "<optional>", "thinking": "<optional>", "timeoutSeconds": <optional, 0 means no timeout> }

DELIVERY (top-level):
  { "mode": "none|announce|webhook", "channel": "<optional>", "to": "<optional>", "bestEffort": <optional-bool> }
  - Default for isolated agentTurn jobs (when delivery omitted): "announce"
  - announce: send to chat channel (optional channel/to target)
  - webhook: send finished-run event as HTTP POST to delivery.to (URL required)
  - If the task needs to send to a specific chat/recipient, set announce delivery.channel/to; do not call messaging tools inside the run.

CRITICAL CONSTRAINTS:
- sessionTarget="main" REQUIRES payload.kind="systemEvent"
- sessionTarget="isolated" | "current" | "session:xxx" REQUIRES payload.kind="agentTurn"
- For webhook callbacks, use delivery.mode="webhook" with delivery.to set to a URL.
Default: prefer isolated agentTurn jobs unless the user explicitly wants current-session binding.

WAKE MODES (for wake action):
- "next-heartbeat" (default): Wake on next heartbeat
- "now": Wake immediately

Use jobId as the canonical identifier; id is accepted for compatibility. Use contextMessages (0-10) to add previous messages as context to the job text.`,
		parameters: CronToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const action = readStringParam$1(params, "action", { required: true });
			const gatewayOpts = {
				...readGatewayCallOptions(params),
				timeoutMs: typeof params.timeoutMs === "number" && Number.isFinite(params.timeoutMs) ? params.timeoutMs : 6e4
			};
			switch (action) {
				case "status": return jsonResult(await callGateway("cron.status", gatewayOpts, {}));
				case "list": return jsonResult(await callGateway("cron.list", gatewayOpts, { includeDisabled: Boolean(params.includeDisabled) }));
				case "add": {
					if (!params.job || typeof params.job === "object" && params.job !== null && Object.keys(params.job).length === 0) {
						const synthetic = {};
						let found = false;
						for (const key of Object.keys(params)) if (CRON_RECOVERABLE_OBJECT_KEYS.has(key) && params[key] !== void 0) {
							synthetic[key] = params[key];
							found = true;
						}
						if (found && (synthetic.schedule !== void 0 || synthetic.payload !== void 0 || synthetic.message !== void 0 || synthetic.text !== void 0)) params.job = synthetic;
					}
					if (!params.job || typeof params.job !== "object") throw new Error("job required");
					const job = normalizeCronJobCreate(params.job, { sessionContext: { sessionKey: opts?.agentSessionKey } }) ?? params.job;
					if (job && typeof job === "object") {
						const cfg = loadConfig();
						const { mainKey, alias } = resolveMainSessionAlias(cfg);
						const resolvedSessionKey = opts?.agentSessionKey ? resolveInternalSessionKey({
							key: opts.agentSessionKey,
							alias,
							mainKey
						}) : void 0;
						if (!("agentId" in job)) {
							const agentId = opts?.agentSessionKey ? resolveSessionAgentId({
								sessionKey: opts.agentSessionKey,
								config: cfg
							}) : void 0;
							if (agentId) job.agentId = agentId;
						}
						if (!("sessionKey" in job) && resolvedSessionKey) job.sessionKey = resolvedSessionKey;
					}
					if (opts?.agentSessionKey && job && typeof job === "object" && "payload" in job && job.payload?.kind === "agentTurn") {
						const deliveryValue = job.delivery;
						const delivery = isRecord(deliveryValue) ? deliveryValue : void 0;
						const mode = normalizeLowercaseStringOrEmpty(typeof delivery?.mode === "string" ? delivery.mode : "");
						if (mode === "webhook") {
							const webhookUrl = normalizeHttpWebhookUrl(delivery?.to);
							if (!webhookUrl) throw new Error("delivery.mode=\"webhook\" requires delivery.to to be a valid http(s) URL");
							if (delivery) delivery.to = webhookUrl;
						}
						const hasTarget = typeof delivery?.channel === "string" && delivery.channel.trim() || typeof delivery?.to === "string" && delivery.to.trim();
						if ((deliveryValue == null || delivery) && (mode === "" || mode === "announce") && !hasTarget) {
							const inferred = inferDeliveryFromSessionKey(opts.agentSessionKey);
							if (inferred) job.delivery = {
								...delivery,
								...inferred
							};
						}
					}
					const contextMessages = typeof params.contextMessages === "number" && Number.isFinite(params.contextMessages) ? params.contextMessages : 0;
					if (job && typeof job === "object" && "payload" in job && job.payload?.kind === "systemEvent") {
						const payload = job.payload;
						if (typeof payload.text === "string" && payload.text.trim()) {
							const contextLines = await buildReminderContextLines({
								agentSessionKey: opts?.agentSessionKey,
								gatewayOpts,
								contextMessages,
								callGatewayTool: callGateway
							});
							if (contextLines.length > 0) payload.text = `${stripExistingContext(payload.text)}${REMINDER_CONTEXT_MARKER}${contextLines.join("\n")}`;
						}
					}
					return jsonResult(await callGateway("cron.add", gatewayOpts, job));
				}
				case "update": {
					const id = readStringParam$1(params, "jobId") ?? readStringParam$1(params, "id");
					if (!id) throw new Error("jobId required (id accepted for backward compatibility)");
					let recoveredFlatPatch = false;
					if (!params.patch || typeof params.patch === "object" && params.patch !== null && Object.keys(params.patch).length === 0) {
						const synthetic = {};
						let found = false;
						for (const key of Object.keys(params)) if (CRON_RECOVERABLE_OBJECT_KEYS.has(key) && params[key] !== void 0) {
							synthetic[key] = params[key];
							found = true;
						}
						if (found) {
							params.patch = synthetic;
							recoveredFlatPatch = true;
						}
					}
					if (!params.patch || typeof params.patch !== "object") throw new Error("patch required");
					const patch = normalizeCronJobPatch(params.patch) ?? params.patch;
					if (recoveredFlatPatch && typeof patch === "object" && patch !== null && Object.keys(patch).length === 0) throw new Error("patch required");
					return jsonResult(await callGateway("cron.update", gatewayOpts, {
						id,
						patch
					}));
				}
				case "remove": {
					const id = readStringParam$1(params, "jobId") ?? readStringParam$1(params, "id");
					if (!id) throw new Error("jobId required (id accepted for backward compatibility)");
					return jsonResult(await callGateway("cron.remove", gatewayOpts, { id }));
				}
				case "run": {
					const id = readStringParam$1(params, "jobId") ?? readStringParam$1(params, "id");
					if (!id) throw new Error("jobId required (id accepted for backward compatibility)");
					return jsonResult(await callGateway("cron.run", gatewayOpts, {
						id,
						mode: params.runMode === "due" || params.runMode === "force" ? params.runMode : "force"
					}));
				}
				case "runs": {
					const id = readStringParam$1(params, "jobId") ?? readStringParam$1(params, "id");
					if (!id) throw new Error("jobId required (id accepted for backward compatibility)");
					return jsonResult(await callGateway("cron.runs", gatewayOpts, { id }));
				}
				case "wake": {
					const text = readStringParam$1(params, "text", { required: true });
					return jsonResult(await callGateway("wake", gatewayOpts, {
						mode: params.mode === "now" || params.mode === "next-heartbeat" ? params.mode : "next-heartbeat",
						text
					}, { expectFinal: false }));
				}
				default: throw new Error(`Unknown action: ${action}`);
			}
		}
	};
}
//#endregion
//#region src/agents/tools/gateway-tool.ts
const log$4 = createSubsystemLogger("gateway-tool");
const DEFAULT_UPDATE_TIMEOUT_MS = 20 * 6e4;
const PROTECTED_GATEWAY_CONFIG_PATHS = [
	"tools.exec.ask",
	"tools.exec.security",
	"tools.exec.safeBins",
	"tools.exec.safeBinProfiles",
	"tools.exec.safeBinTrustedDirs",
	"tools.exec.strictInlineEval"
];
function resolveBaseHashFromSnapshot(snapshot) {
	if (!snapshot || typeof snapshot !== "object") return;
	const hashValue = snapshot.hash;
	const rawValue = snapshot.raw;
	return resolveConfigSnapshotHash({
		hash: readStringValue(hashValue),
		raw: readStringValue(rawValue)
	}) ?? void 0;
}
function getSnapshotConfig(snapshot) {
	if (!snapshot || typeof snapshot !== "object") throw new Error("config.get response is not an object.");
	const config = snapshot.config;
	if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error("config.get response is missing a config object.");
	return config;
}
function parseGatewayConfigMutationRaw(raw, action) {
	const parsedRes = parseConfigJson5(raw);
	if (!parsedRes.ok) throw new Error(parsedRes.error);
	if (!parsedRes.parsed || typeof parsedRes.parsed !== "object" || Array.isArray(parsedRes.parsed)) throw new Error(`${action} raw must be an object.`);
	return parsedRes.parsed;
}
function getValueAtCanonicalPath(config, path) {
	let current = config;
	for (const part of path.split(".")) {
		if (!current || typeof current !== "object" || Array.isArray(current)) return;
		current = current[part];
	}
	return current;
}
function getValueAtPath(config, path) {
	const direct = getValueAtCanonicalPath(config, path);
	if (direct !== void 0) return direct;
	if (!path.startsWith("tools.exec.")) return;
	return getValueAtCanonicalPath(config, path.replace(/^tools\.exec\./, "tools.bash."));
}
function assertGatewayConfigMutationAllowed(params) {
	const parsed = parseGatewayConfigMutationRaw(params.raw, params.action);
	const nextConfig = params.action === "config.apply" ? parsed : applyMergePatch(params.currentConfig, parsed, { mergeObjectArraysById: true });
	const changedProtectedPaths = PROTECTED_GATEWAY_CONFIG_PATHS.filter((path) => !isDeepStrictEqual(getValueAtPath(params.currentConfig, path), getValueAtPath(nextConfig, path)));
	if (changedProtectedPaths.length > 0) throw new Error(`gateway ${params.action} cannot change protected config paths: ${changedProtectedPaths.join(", ")}`);
	const currentFlags = new Set(collectEnabledInsecureOrDangerousFlags(params.currentConfig));
	const newlyEnabled = collectEnabledInsecureOrDangerousFlags(nextConfig).filter((f) => !currentFlags.has(f));
	if (newlyEnabled.length > 0) throw new Error(`gateway ${params.action} cannot enable dangerous config flags: ${newlyEnabled.join(", ")}`);
}
const GatewayToolSchema = Type.Object({
	action: stringEnum([
		"restart",
		"config.get",
		"config.schema.lookup",
		"config.apply",
		"config.patch",
		"update.run"
	]),
	delayMs: Type.Optional(Type.Number()),
	reason: Type.Optional(Type.String()),
	gatewayUrl: Type.Optional(Type.String()),
	gatewayToken: Type.Optional(Type.String()),
	timeoutMs: Type.Optional(Type.Number()),
	path: Type.Optional(Type.String()),
	raw: Type.Optional(Type.String()),
	baseHash: Type.Optional(Type.String()),
	sessionKey: Type.Optional(Type.String()),
	note: Type.Optional(Type.String()),
	restartDelayMs: Type.Optional(Type.Number())
});
function createGatewayTool(opts) {
	return {
		label: "Gateway",
		name: "gateway",
		ownerOnly: isOpenClawOwnerOnlyCoreToolName("gateway"),
		description: "Restart, inspect a specific config schema path, apply config, or update the gateway in-place (SIGUSR1). Use config.schema.lookup with a targeted dot path before config edits. Use config.patch for safe partial config updates (merges with existing). Use config.apply only when replacing entire config. Config writes hot-reload when possible and restart when required. Always pass a human-readable completion message via the `note` parameter so the system can deliver it to the user after restart.",
		parameters: GatewayToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const action = readStringParam$1(params, "action", { required: true });
			if (action === "restart") {
				if (!isRestartEnabled(opts?.config)) throw new Error("Gateway restart is disabled (commands.restart=false).");
				const sessionKey = normalizeOptionalString(params.sessionKey) ?? normalizeOptionalString(opts?.agentSessionKey);
				const delayMs = typeof params.delayMs === "number" && Number.isFinite(params.delayMs) ? Math.floor(params.delayMs) : void 0;
				const reason = normalizeOptionalString(params.reason)?.slice(0, 200);
				const note = normalizeOptionalString(params.note);
				const { deliveryContext, threadId } = extractDeliveryInfo(sessionKey);
				const payload = {
					kind: "restart",
					status: "ok",
					ts: Date.now(),
					sessionKey,
					deliveryContext,
					threadId,
					message: note ?? reason ?? null,
					doctorHint: formatDoctorNonInteractiveHint(),
					stats: {
						mode: "gateway.restart",
						reason
					}
				};
				try {
					await writeRestartSentinel(payload);
				} catch {}
				log$4.info(`gateway tool: restart requested (delayMs=${delayMs ?? "default"}, reason=${reason ?? "none"})`);
				return jsonResult(scheduleGatewaySigusr1Restart({
					delayMs,
					reason
				}));
			}
			const gatewayOpts = readGatewayCallOptions(params);
			const resolveGatewayWriteMeta = () => {
				return {
					sessionKey: normalizeOptionalString(params.sessionKey) ?? normalizeOptionalString(opts?.agentSessionKey),
					note: normalizeOptionalString(params.note),
					restartDelayMs: typeof params.restartDelayMs === "number" && Number.isFinite(params.restartDelayMs) ? Math.floor(params.restartDelayMs) : void 0
				};
			};
			const resolveConfigWriteParams = async () => {
				const raw = readStringParam$1(params, "raw", { required: true });
				const snapshot = await callGatewayTool("config.get", gatewayOpts, {});
				const snapshotConfig = getSnapshotConfig(snapshot);
				let baseHash = readStringParam$1(params, "baseHash");
				if (!baseHash) baseHash = resolveBaseHashFromSnapshot(snapshot);
				if (!baseHash) throw new Error("Missing baseHash from config snapshot.");
				return {
					raw,
					baseHash,
					snapshotConfig,
					...resolveGatewayWriteMeta()
				};
			};
			if (action === "config.get") return jsonResult({
				ok: true,
				result: await callGatewayTool("config.get", gatewayOpts, {})
			});
			if (action === "config.schema.lookup") return jsonResult({
				ok: true,
				result: await callGatewayTool("config.schema.lookup", gatewayOpts, { path: readStringParam$1(params, "path", {
					required: true,
					label: "path"
				}) })
			});
			if (action === "config.apply") {
				const { raw, baseHash, snapshotConfig, sessionKey, note, restartDelayMs } = await resolveConfigWriteParams();
				assertGatewayConfigMutationAllowed({
					action: "config.apply",
					currentConfig: snapshotConfig,
					raw
				});
				return jsonResult({
					ok: true,
					result: await callGatewayTool("config.apply", gatewayOpts, {
						raw,
						baseHash,
						sessionKey,
						note,
						restartDelayMs
					})
				});
			}
			if (action === "config.patch") {
				const { raw, baseHash, snapshotConfig, sessionKey, note, restartDelayMs } = await resolveConfigWriteParams();
				assertGatewayConfigMutationAllowed({
					action: "config.patch",
					currentConfig: snapshotConfig,
					raw
				});
				return jsonResult({
					ok: true,
					result: await callGatewayTool("config.patch", gatewayOpts, {
						raw,
						baseHash,
						sessionKey,
						note,
						restartDelayMs
					})
				});
			}
			if (action === "update.run") {
				const { sessionKey, note, restartDelayMs } = resolveGatewayWriteMeta();
				const updateTimeoutMs = gatewayOpts.timeoutMs ?? DEFAULT_UPDATE_TIMEOUT_MS;
				return jsonResult({
					ok: true,
					result: await callGatewayTool("update.run", {
						...gatewayOpts,
						timeoutMs: updateTimeoutMs
					}, {
						sessionKey,
						note,
						restartDelayMs,
						timeoutMs: updateTimeoutMs
					})
				});
			}
			throw new Error(`Unknown action: ${action}`);
		}
	};
}
//#endregion
//#region src/media/configured-max-bytes.ts
const MB = 1024 * 1024;
function resolveConfiguredMediaMaxBytes(cfg) {
	const configured = cfg?.agents?.defaults?.mediaMaxMb;
	if (typeof configured === "number" && Number.isFinite(configured) && configured > 0) return Math.floor(configured * MB);
}
//#endregion
//#region src/agents/tools/media-tool-shared.ts
function applyImageModelConfigDefaults(cfg, imageModelConfig) {
	return applyAgentDefaultModelConfig(cfg, "imageModel", imageModelConfig);
}
function applyImageGenerationModelConfigDefaults(cfg, imageGenerationModelConfig) {
	return applyAgentDefaultModelConfig(cfg, "imageGenerationModel", imageGenerationModelConfig);
}
function applyVideoGenerationModelConfigDefaults(cfg, videoGenerationModelConfig) {
	return applyAgentDefaultModelConfig(cfg, "videoGenerationModel", videoGenerationModelConfig);
}
function applyMusicGenerationModelConfigDefaults(cfg, musicGenerationModelConfig) {
	return applyAgentDefaultModelConfig(cfg, "musicGenerationModel", musicGenerationModelConfig);
}
function applyAgentDefaultModelConfig(cfg, key, modelConfig) {
	if (!cfg) return;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				[key]: modelConfig
			}
		}
	};
}
function findCapabilityProviderById(params) {
	const selectedProvider = normalizeProviderId(params.providerId ?? "");
	return params.providers.find((provider) => normalizeProviderId(provider.id) === selectedProvider || (provider.aliases ?? []).some((alias) => normalizeProviderId(alias) === selectedProvider));
}
function isCapabilityProviderConfigured(params) {
	const provider = params.provider ?? findCapabilityProviderById({
		providers: params.providers,
		providerId: params.providerId
	});
	if (!provider) return params.providerId ? hasAuthForProvider({
		provider: params.providerId,
		agentDir: params.agentDir
	}) : false;
	if (provider.isConfigured) return provider.isConfigured({
		cfg: params.cfg,
		agentDir: params.agentDir
	});
	return hasAuthForProvider({
		provider: provider.id,
		agentDir: params.agentDir
	});
}
function resolveSelectedCapabilityProvider(params) {
	const selectedRef = params.parseModelRef(params.modelOverride) ?? params.parseModelRef(params.modelConfig.primary);
	if (!selectedRef) return;
	return findCapabilityProviderById({
		providers: params.providers,
		providerId: selectedRef.provider
	});
}
function resolveCapabilityModelCandidatesForTool(params) {
	const providerDefaults = /* @__PURE__ */ new Map();
	for (const provider of params.providers) {
		const providerId = provider.id.trim();
		const modelId = provider.defaultModel?.trim();
		if (!providerId || !modelId || providerDefaults.has(providerId) || !isCapabilityProviderConfigured({
			providers: params.providers,
			provider,
			cfg: params.cfg,
			agentDir: params.agentDir
		})) continue;
		providerDefaults.set(providerId, `${providerId}/${modelId}`);
	}
	const primaryProvider = resolveDefaultModelRef(params.cfg).provider;
	const orderedProviders = [primaryProvider, ...[...providerDefaults.keys()].filter((providerId) => providerId !== primaryProvider).toSorted()];
	const orderedRefs = [];
	const seen = /* @__PURE__ */ new Set();
	for (const providerId of orderedProviders) {
		const ref = providerDefaults.get(providerId);
		if (!ref || seen.has(ref)) continue;
		seen.add(ref);
		orderedRefs.push(ref);
	}
	return orderedRefs;
}
function resolveCapabilityModelConfigForTool(params) {
	const explicit = coerceToolModelConfig(params.modelConfig);
	if (hasToolModelConfig(explicit)) return explicit;
	return buildToolModelConfigFromCandidates({
		explicit,
		agentDir: params.agentDir,
		candidates: resolveCapabilityModelCandidatesForTool({
			cfg: params.cfg,
			agentDir: params.agentDir,
			providers: params.providers
		}),
		isProviderConfigured: (providerId) => isCapabilityProviderConfigured({
			providers: params.providers,
			providerId,
			cfg: params.cfg,
			agentDir: params.agentDir
		})
	});
}
function formatQuotedList(values) {
	if (values.length === 1) return `"${values[0]}"`;
	if (values.length === 2) return `"${values[0]}" or "${values[1]}"`;
	return `${values.slice(0, -1).map((value) => `"${value}"`).join(", ")}, or "${values[values.length - 1]}"`;
}
function resolveGenerateAction(params) {
	const raw = readStringParam$1(params.args, "action");
	if (!raw) return params.defaultAction;
	const normalized = normalizeOptionalLowercaseString(raw);
	if (normalized && params.allowed.includes(normalized)) return normalized;
	throw new ToolInputError(`action must be ${formatQuotedList(params.allowed)}`);
}
function readBooleanToolParam(params, key) {
	const raw = readSnakeCaseParamRaw(params, key);
	if (typeof raw === "boolean") return raw;
	if (typeof raw === "string") {
		const normalized = normalizeOptionalLowercaseString(raw);
		if (normalized === "true") return true;
		if (normalized === "false") return false;
	}
}
function normalizeMediaReferenceInputs(params) {
	const single = readStringParam$1(params.args, params.singularKey);
	const multiple = readStringArrayParam(params.args, params.pluralKey);
	const combined = [...single ? [single] : [], ...multiple ?? []];
	const deduped = [];
	const seen = /* @__PURE__ */ new Set();
	for (const candidate of combined) {
		const trimmed = candidate.trim();
		const dedupe = trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
		if (!dedupe || seen.has(dedupe)) continue;
		seen.add(dedupe);
		deduped.push(trimmed);
	}
	if (deduped.length > params.maxCount) throw new ToolInputError(`Too many ${params.label}: ${deduped.length} provided, maximum is ${params.maxCount}.`);
	return deduped;
}
function buildMediaReferenceDetails(params) {
	if (params.entries.length === 1) {
		const entry = params.entries[0];
		if (!entry) return {};
		const rewriteKey = params.singleRewriteKey ?? "rewrittenFrom";
		return {
			[params.singleKey]: params.getResolvedInput(entry),
			...entry.rewrittenFrom ? { [rewriteKey]: entry.rewrittenFrom } : {}
		};
	}
	if (params.entries.length > 1) return { [params.pluralKey]: params.entries.map((entry) => ({
		[params.singleKey]: params.getResolvedInput(entry),
		...entry.rewrittenFrom ? { rewrittenFrom: entry.rewrittenFrom } : {}
	})) };
	return {};
}
function buildTaskRunDetails(handle) {
	return handle ? { task: {
		taskId: handle.taskId,
		runId: handle.runId
	} } : {};
}
function resolveMediaToolLocalRoots(workspaceDirRaw, options, _mediaSources) {
	const workspaceDir = normalizeWorkspaceDir(workspaceDirRaw);
	if (options?.workspaceOnly) return workspaceDir ? [workspaceDir] : [];
	const roots = getDefaultLocalRoots();
	return workspaceDir ? Array.from(new Set([...roots, workspaceDir])) : [...roots];
}
function resolvePromptAndModelOverride(args, defaultPrompt) {
	return {
		prompt: normalizeOptionalString(args.prompt) ?? defaultPrompt,
		modelOverride: normalizeOptionalString(args.model)
	};
}
function buildTextToolResult(result, extraDetails) {
	return {
		content: [{
			type: "text",
			text: result.text
		}],
		details: {
			model: `${result.provider}/${result.model}`,
			...extraDetails,
			attempts: result.attempts
		}
	};
}
function resolveModelFromRegistry(params) {
	const resolvedRef = normalizeModelRef(params.provider, params.modelId);
	const model = params.modelRegistry.find(resolvedRef.provider, resolvedRef.model);
	if (!model) throw new Error(`Unknown model: ${resolvedRef.provider}/${resolvedRef.model}`);
	return model;
}
async function resolveModelRuntimeApiKey(params) {
	const apiKey = requireApiKey(await getApiKeyForModel({
		model: params.model,
		cfg: params.cfg,
		agentDir: params.agentDir
	}), params.model.provider);
	params.authStorage.setRuntimeApiKey(params.model.provider, apiKey);
	return apiKey;
}
//#endregion
//#region src/agents/tools/image-generate-tool.ts
const DEFAULT_COUNT = 1;
const MAX_COUNT = 4;
const MAX_INPUT_IMAGES$2 = 5;
const DEFAULT_RESOLUTION = "1K";
const SUPPORTED_ASPECT_RATIOS$1 = new Set([
	"1:1",
	"2:3",
	"3:2",
	"3:4",
	"4:3",
	"4:5",
	"5:4",
	"9:16",
	"16:9",
	"21:9"
]);
const ImageGenerateToolSchema = Type.Object({
	action: Type.Optional(Type.String({ description: "Optional action: \"generate\" (default) or \"list\" to inspect available providers/models." })),
	prompt: Type.Optional(Type.String({ description: "Image generation prompt." })),
	image: Type.Optional(Type.String({ description: "Optional reference image path or URL for edit mode." })),
	images: Type.Optional(Type.Array(Type.String(), { description: `Optional reference images for edit mode (up to ${MAX_INPUT_IMAGES$2}).` })),
	model: Type.Optional(Type.String({ description: "Optional provider/model override, e.g. openai/gpt-image-1." })),
	filename: Type.Optional(Type.String({ description: "Optional output filename hint. OpenClaw preserves the basename and saves under its managed media directory." })),
	size: Type.Optional(Type.String({ description: "Optional size hint like 1024x1024, 1536x1024, 1024x1536, 1024x1792, or 1792x1024." })),
	aspectRatio: Type.Optional(Type.String({ description: "Optional aspect ratio hint: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, or 21:9." })),
	resolution: Type.Optional(Type.String({ description: "Optional resolution hint: 1K, 2K, or 4K. Useful for Google edit/generation flows." })),
	count: Type.Optional(Type.Number({
		description: `Optional number of images to request (1-${MAX_COUNT}).`,
		minimum: 1,
		maximum: MAX_COUNT
	}))
});
function getImageGenerationProviderAuthEnvVars(providerId) {
	return getProviderEnvVars(providerId);
}
function resolveImageGenerationModelConfigForTool(params) {
	return resolveCapabilityModelConfigForTool({
		cfg: params.cfg,
		agentDir: params.agentDir,
		modelConfig: params.cfg?.agents?.defaults?.imageGenerationModel,
		providers: listRuntimeImageGenerationProviders({ config: params.cfg })
	});
}
function resolveAction$2(args) {
	return resolveGenerateAction({
		args,
		allowed: ["generate", "list"],
		defaultAction: "generate"
	});
}
function resolveRequestedCount(args) {
	const count = readNumberParam(args, "count", { integer: true });
	if (count === void 0) return DEFAULT_COUNT;
	if (count < 1 || count > MAX_COUNT) throw new ToolInputError(`count must be between 1 and ${MAX_COUNT}`);
	return count;
}
function normalizeResolution$1(raw) {
	const normalized = raw?.trim().toUpperCase();
	if (!normalized) return;
	if (normalized === "1K" || normalized === "2K" || normalized === "4K") return normalized;
	throw new ToolInputError("resolution must be one of 1K, 2K, or 4K");
}
function normalizeAspectRatio$1(raw) {
	const normalized = raw?.trim();
	if (!normalized) return;
	if (SUPPORTED_ASPECT_RATIOS$1.has(normalized)) return normalized;
	throw new ToolInputError("aspectRatio must be one of 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, or 21:9");
}
function normalizeReferenceImages(args) {
	return normalizeMediaReferenceInputs({
		args,
		singularKey: "image",
		pluralKey: "images",
		maxCount: MAX_INPUT_IMAGES$2,
		label: "reference images"
	});
}
function resolveSelectedImageGenerationProvider(params) {
	return resolveSelectedCapabilityProvider({
		providers: listRuntimeImageGenerationProviders({ config: params.config }),
		modelConfig: params.imageGenerationModelConfig,
		modelOverride: params.modelOverride,
		parseModelRef: parseImageGenerationModelRef
	});
}
function formatIgnoredImageGenerationOverride(override) {
	return `${override.key}=${override.value}`;
}
function validateImageGenerationCapabilities(params) {
	const provider = params.provider;
	if (!provider) return;
	const isEdit = params.inputImageCount > 0;
	const maxCount = (isEdit ? provider.capabilities.edit : provider.capabilities.generate).maxCount ?? MAX_COUNT;
	if (params.count > maxCount) throw new ToolInputError(`${provider.id} ${isEdit ? "edit" : "generate"} supports at most ${maxCount} output image${maxCount === 1 ? "" : "s"}.`);
	if (isEdit) {
		if (!provider.capabilities.edit.enabled) throw new ToolInputError(`${provider.id} does not support reference-image edits.`);
		const maxInputImages = provider.capabilities.edit.maxInputImages ?? MAX_INPUT_IMAGES$2;
		if (params.inputImageCount > maxInputImages) throw new ToolInputError(`${provider.id} edit supports at most ${maxInputImages} reference image${maxInputImages === 1 ? "" : "s"}.`);
	}
}
async function loadReferenceImages$1(params) {
	const loaded = [];
	for (const imageRawInput of params.imageInputs) {
		const trimmed = imageRawInput.trim();
		const imageRaw = trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
		if (!imageRaw) throw new ToolInputError("image required (empty string in array)");
		const looksLikeWindowsDrivePath = /^[a-zA-Z]:[\\/]/.test(imageRaw);
		const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(imageRaw);
		const isFileUrl = /^file:/i.test(imageRaw);
		const isHttpUrl = /^https?:\/\//i.test(imageRaw);
		const isDataUrl = /^data:/i.test(imageRaw);
		if (hasScheme && !looksLikeWindowsDrivePath && !isFileUrl && !isHttpUrl && !isDataUrl) throw new ToolInputError(`Unsupported image reference: ${imageRawInput}. Use a file path, a file:// URL, a data: URL, or an http(s) URL.`);
		if (params.sandboxConfig && isHttpUrl) throw new ToolInputError("Sandboxed image_generate does not allow remote URLs.");
		const resolvedImage = (() => {
			if (params.sandboxConfig) return imageRaw;
			if (imageRaw.startsWith("~")) return resolveUserPath(imageRaw);
			return imageRaw;
		})();
		const resolvedPathInfo = isDataUrl ? { resolved: "" } : params.sandboxConfig ? await resolveSandboxedBridgeMediaPath({
			sandbox: params.sandboxConfig,
			mediaPath: resolvedImage,
			inboundFallbackDir: "media/inbound"
		}) : { resolved: resolvedImage.startsWith("file://") ? resolvedImage.slice(7) : resolvedImage };
		const resolvedPath = isDataUrl ? null : resolvedPathInfo.resolved;
		const localRoots = resolveMediaToolLocalRoots(params.workspaceDir, { workspaceOnly: params.sandboxConfig?.workspaceOnly === true }, resolvedPath ? [resolvedPath] : void 0);
		const media = isDataUrl ? decodeDataUrl(resolvedImage, { maxBytes: params.maxBytes }) : params.sandboxConfig ? await loadWebMedia(resolvedPath ?? resolvedImage, {
			maxBytes: params.maxBytes,
			sandboxValidated: true,
			readFile: createSandboxBridgeReadFile({ sandbox: params.sandboxConfig })
		}) : await loadWebMedia(resolvedPath ?? resolvedImage, {
			maxBytes: params.maxBytes,
			localRoots
		});
		if (media.kind !== "image") throw new ToolInputError(`Unsupported media type: ${media.kind}`);
		const mimeType = "contentType" in media && media.contentType || "mimeType" in media && media.mimeType || "image/png";
		loaded.push({
			sourceImage: {
				buffer: media.buffer,
				mimeType
			},
			resolvedImage,
			...resolvedPathInfo.rewrittenFrom ? { rewrittenFrom: resolvedPathInfo.rewrittenFrom } : {}
		});
	}
	return loaded;
}
async function inferResolutionFromInputImages(images) {
	let maxDimension = 0;
	for (const image of images) {
		const meta = await getImageMetadata(image.buffer);
		const dimension = Math.max(meta?.width ?? 0, meta?.height ?? 0);
		maxDimension = Math.max(maxDimension, dimension);
	}
	if (maxDimension >= 3e3) return "4K";
	if (maxDimension >= 1500) return "2K";
	return DEFAULT_RESOLUTION;
}
function createImageGenerateTool(options) {
	const cfg = options?.config ?? loadConfig();
	const imageGenerationModelConfig = resolveImageGenerationModelConfigForTool({
		cfg,
		agentDir: options?.agentDir
	});
	if (!imageGenerationModelConfig) return null;
	const effectiveCfg = applyImageGenerationModelConfigDefaults(cfg, imageGenerationModelConfig) ?? cfg;
	const sandboxConfig = options?.sandbox && options.sandbox.root.trim() ? {
		root: options.sandbox.root.trim(),
		bridge: options.sandbox.bridge,
		workspaceOnly: options.fsPolicy?.workspaceOnly === true
	} : null;
	return {
		label: "Image Generation",
		name: "image_generate",
		description: "Generate new images or edit reference images with the configured or inferred image-generation model. Set agents.defaults.imageGenerationModel.primary to pick a provider/model. Providers declare their own auth/readiness; use action=\"list\" to inspect registered providers, models, readiness, and auth hints. Generated images are delivered automatically from the tool result as MEDIA paths.",
		parameters: ImageGenerateToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			if (resolveAction$2(params) === "list") {
				const runtimeProviders = listRuntimeImageGenerationProviders({ config: effectiveCfg });
				const providers = runtimeProviders.map((provider) => ({
					id: provider.id,
					...provider.label ? { label: provider.label } : {},
					...provider.defaultModel ? { defaultModel: provider.defaultModel } : {},
					models: provider.models ?? (provider.defaultModel ? [provider.defaultModel] : []),
					configured: isCapabilityProviderConfigured({
						providers: runtimeProviders,
						provider,
						cfg: effectiveCfg,
						agentDir: options?.agentDir
					}),
					authEnvVars: getImageGenerationProviderAuthEnvVars(provider.id),
					capabilities: provider.capabilities
				}));
				return {
					content: [{
						type: "text",
						text: providers.flatMap((provider) => {
							const caps = [];
							if (provider.capabilities.edit.enabled) {
								const maxRefs = provider.capabilities.edit.maxInputImages;
								caps.push(`editing${typeof maxRefs === "number" ? ` up to ${maxRefs} ref${maxRefs === 1 ? "" : "s"}` : ""}`);
							}
							if ((provider.capabilities.geometry?.resolutions?.length ?? 0) > 0) caps.push(`resolutions ${provider.capabilities.geometry?.resolutions?.join("/")}`);
							if ((provider.capabilities.geometry?.sizes?.length ?? 0) > 0) caps.push(`sizes ${provider.capabilities.geometry?.sizes?.join(", ")}`);
							if ((provider.capabilities.geometry?.aspectRatios?.length ?? 0) > 0) caps.push(`aspect ratios ${provider.capabilities.geometry?.aspectRatios?.join(", ")}`);
							const modelLine = provider.models.length > 0 ? `models: ${provider.models.join(", ")}` : "models: unknown";
							return [
								`${provider.id}${provider.defaultModel ? ` (default ${provider.defaultModel})` : ""}`,
								`  ${modelLine}`,
								`  configured: ${provider.configured ? "yes" : "no"}`,
								...provider.authEnvVars.length > 0 ? [`  auth: set ${provider.authEnvVars.join(" / ")} to use ${provider.id}/*`] : [],
								...caps.length > 0 ? [`  capabilities: ${caps.join("; ")}`] : []
							];
						}).join("\n")
					}],
					details: { providers }
				};
			}
			const prompt = readStringParam$1(params, "prompt", { required: true });
			const imageInputs = normalizeReferenceImages(params);
			const model = readStringParam$1(params, "model");
			const filename = readStringParam$1(params, "filename");
			const size = readStringParam$1(params, "size");
			const aspectRatio = normalizeAspectRatio$1(readStringParam$1(params, "aspectRatio"));
			const explicitResolution = normalizeResolution$1(readStringParam$1(params, "resolution"));
			const selectedProvider = resolveSelectedImageGenerationProvider({
				config: effectiveCfg,
				imageGenerationModelConfig,
				modelOverride: model
			});
			const count = resolveRequestedCount(params);
			const configuredMediaMaxBytes = resolveConfiguredMediaMaxBytes(effectiveCfg);
			const loadedReferenceImages = await loadReferenceImages$1({
				imageInputs,
				maxBytes: configuredMediaMaxBytes,
				workspaceDir: options?.workspaceDir,
				sandboxConfig
			});
			const inputImages = loadedReferenceImages.map((entry) => entry.sourceImage);
			const modeCaps = inputImages.length > 0 ? selectedProvider?.capabilities.edit : selectedProvider?.capabilities.generate;
			const resolution = explicitResolution ?? (size || modeCaps?.supportsResolution === false ? void 0 : inputImages.length > 0 ? await inferResolutionFromInputImages(inputImages) : void 0);
			validateImageGenerationCapabilities({
				provider: selectedProvider,
				count,
				inputImageCount: inputImages.length,
				size,
				aspectRatio,
				resolution,
				explicitResolution: Boolean(explicitResolution)
			});
			const result = await generateImage({
				cfg: effectiveCfg,
				prompt,
				agentDir: options?.agentDir,
				modelOverride: model,
				size,
				aspectRatio,
				resolution,
				count,
				inputImages
			});
			const ignoredOverrides = result.ignoredOverrides ?? [];
			const warning = ignoredOverrides.length > 0 ? `Ignored unsupported overrides for ${result.provider}/${result.model}: ${ignoredOverrides.map(formatIgnoredImageGenerationOverride).join(", ")}.` : void 0;
			const normalizedSize = result.normalization?.size?.applied ?? (typeof result.metadata?.normalizedSize === "string" && result.metadata.normalizedSize.trim() ? result.metadata.normalizedSize : void 0);
			const normalizedAspectRatio = result.normalization?.aspectRatio?.applied ?? (typeof result.metadata?.normalizedAspectRatio === "string" && result.metadata.normalizedAspectRatio.trim() ? result.metadata.normalizedAspectRatio : void 0);
			const normalizedResolution = result.normalization?.resolution?.applied ?? (typeof result.metadata?.normalizedResolution === "string" && result.metadata.normalizedResolution.trim() ? result.metadata.normalizedResolution : void 0);
			const sizeTranslatedToAspectRatio = result.normalization?.aspectRatio?.derivedFrom === "size" || !normalizedSize && typeof result.metadata?.requestedSize === "string" && result.metadata.requestedSize === size && Boolean(normalizedAspectRatio);
			const savedImages = await Promise.all(result.images.map((image) => saveMediaBuffer(image.buffer, image.mimeType, "tool-image-generation", configuredMediaMaxBytes, filename || image.fileName)));
			const revisedPrompts = result.images.map((image) => image.revisedPrompt?.trim()).filter((entry) => Boolean(entry));
			return {
				content: [{
					type: "text",
					text: [
						`Generated ${savedImages.length} image${savedImages.length === 1 ? "" : "s"} with ${result.provider}/${result.model}.`,
						...warning ? [`Warning: ${warning}`] : [],
						...savedImages.map((image) => `MEDIA:${image.path}`)
					].join("\n")
				}],
				details: {
					provider: result.provider,
					model: result.model,
					count: savedImages.length,
					media: { mediaUrls: savedImages.map((image) => image.path) },
					paths: savedImages.map((image) => image.path),
					...buildMediaReferenceDetails({
						entries: loadedReferenceImages,
						singleKey: "image",
						pluralKey: "images",
						getResolvedInput: (entry) => entry.resolvedImage
					}),
					...normalizedResolution || resolution ? { resolution: normalizedResolution ?? resolution } : {},
					...normalizedSize || size && !sizeTranslatedToAspectRatio ? { size: normalizedSize ?? size } : {},
					...normalizedAspectRatio || aspectRatio ? { aspectRatio: normalizedAspectRatio ?? aspectRatio } : {},
					...filename ? { filename } : {},
					attempts: result.attempts,
					...result.normalization ? { normalization: result.normalization } : {},
					metadata: result.metadata,
					...warning ? { warning } : {},
					...ignoredOverrides.length > 0 ? { ignoredOverrides } : {},
					...revisedPrompts.length > 0 ? { revisedPrompts } : {}
				}
			};
		}
	};
}
//#endregion
//#region src/agents/tools/image-tool.ts
const DEFAULT_PROMPT$1 = "Describe the image.";
const DEFAULT_MAX_IMAGES = 20;
const imageToolProviderDeps = {
	buildProviderRegistry,
	getMediaUnderstandingProvider,
	describeImageWithModel,
	describeImagesWithModel,
	resolveAutoMediaKeyProviders,
	resolveDefaultMediaModel
};
function resolveImageToolMaxTokens(modelMaxTokens, requestedMaxTokens = 4096) {
	if (typeof modelMaxTokens !== "number" || !Number.isFinite(modelMaxTokens) || modelMaxTokens <= 0) return requestedMaxTokens;
	return Math.min(requestedMaxTokens, modelMaxTokens);
}
/**
* Resolve the effective image model config for the `image` tool.
*
* - Prefer explicit config (`agents.defaults.imageModel`).
* - Otherwise, try to "pair" the primary model with an image-capable model:
*   - same provider (best effort)
*   - fall back to OpenAI/Anthropic when available
*/
function resolveImageModelConfigForTool(params) {
	const explicit = coerceImageModelConfig(params.cfg);
	if (hasToolModelConfig(explicit)) return explicit;
	const primary = resolveDefaultModelRef(params.cfg);
	const providerVisionFromConfig = resolveProviderVisionModelFromConfig({
		cfg: params.cfg,
		provider: primary.provider
	});
	const primaryCandidates = (() => {
		if (providerVisionFromConfig) return [providerVisionFromConfig];
		const providerDefault = imageToolProviderDeps.resolveDefaultMediaModel({
			cfg: params.cfg,
			providerId: primary.provider,
			capability: "image"
		});
		if (providerDefault) return [`${primary.provider}/${providerDefault}`];
		if (isMinimaxVlmProvider(primary.provider)) return [`${primary.provider}/MiniMax-VL-01`];
		return [];
	})();
	const autoCandidates = imageToolProviderDeps.resolveAutoMediaKeyProviders({
		cfg: params.cfg,
		capability: "image"
	}).map((providerId) => {
		const modelId = imageToolProviderDeps.resolveDefaultMediaModel({
			cfg: params.cfg,
			providerId,
			capability: "image"
		});
		return modelId ? `${providerId}/${modelId}` : null;
	});
	return buildToolModelConfigFromCandidates({
		explicit,
		agentDir: params.agentDir,
		candidates: [...primaryCandidates, ...autoCandidates]
	});
}
function pickMaxBytes(cfg, maxBytesMb) {
	if (typeof maxBytesMb === "number" && Number.isFinite(maxBytesMb) && maxBytesMb > 0) return Math.floor(maxBytesMb * 1024 * 1024);
	const configured = cfg?.agents?.defaults?.mediaMaxMb;
	if (typeof configured === "number" && Number.isFinite(configured) && configured > 0) return Math.floor(configured * 1024 * 1024);
}
async function runImagePrompt(params) {
	const effectiveCfg = applyImageModelConfigDefaults(params.cfg, params.imageModelConfig);
	const providerCfg = effectiveCfg ?? {};
	const providerRegistry = imageToolProviderDeps.buildProviderRegistry(void 0, providerCfg);
	const result = await runWithImageModelFallback({
		cfg: effectiveCfg,
		modelOverride: params.modelOverride,
		run: async (provider, modelId) => {
			const imageProvider = imageToolProviderDeps.getMediaUnderstandingProvider(provider, providerRegistry);
			if (params.images.length > 1 && (imageProvider?.describeImages || !imageProvider?.describeImage)) {
				const described = await (imageProvider?.describeImages ?? imageToolProviderDeps.describeImagesWithModel)({
					images: params.images.map((image, index) => ({
						buffer: image.buffer,
						fileName: `image-${index + 1}`,
						mime: image.mimeType
					})),
					provider,
					model: modelId,
					prompt: params.prompt,
					maxTokens: resolveImageToolMaxTokens(void 0),
					timeoutMs: 3e4,
					cfg: providerCfg,
					agentDir: params.agentDir
				});
				return {
					text: described.text,
					provider,
					model: described.model ?? modelId
				};
			}
			const describeImage = imageProvider?.describeImage ?? imageToolProviderDeps.describeImageWithModel;
			if (params.images.length === 1) {
				const image = params.images[0];
				const described = await describeImage({
					buffer: image.buffer,
					fileName: "image-1",
					mime: image.mimeType,
					provider,
					model: modelId,
					prompt: params.prompt,
					maxTokens: resolveImageToolMaxTokens(void 0),
					timeoutMs: 3e4,
					cfg: providerCfg,
					agentDir: params.agentDir
				});
				return {
					text: described.text,
					provider,
					model: described.model ?? modelId
				};
			}
			const parts = [];
			for (const [index, image] of params.images.entries()) {
				const described = await describeImage({
					buffer: image.buffer,
					fileName: `image-${index + 1}`,
					mime: image.mimeType,
					provider,
					model: modelId,
					prompt: `${params.prompt}\n\nDescribe image ${index + 1} of ${params.images.length}.`,
					maxTokens: resolveImageToolMaxTokens(void 0),
					timeoutMs: 3e4,
					cfg: providerCfg,
					agentDir: params.agentDir
				});
				parts.push(`Image ${index + 1}:\n${described.text.trim()}`);
			}
			return {
				text: parts.join("\n\n").trim(),
				provider,
				model: modelId
			};
		}
	});
	return {
		text: result.result.text,
		provider: result.result.provider,
		model: result.result.model,
		attempts: result.attempts.map((attempt) => ({
			provider: attempt.provider,
			model: attempt.model,
			error: attempt.error
		}))
	};
}
function createImageTool(options) {
	const agentDir = options?.agentDir?.trim();
	if (!agentDir) {
		if (hasToolModelConfig(coerceImageModelConfig(options?.config))) throw new Error("createImageTool requires agentDir when enabled");
		return null;
	}
	const imageModelConfig = resolveImageModelConfigForTool({
		cfg: options?.config,
		agentDir
	});
	if (!imageModelConfig) return null;
	return {
		label: "Image",
		name: "image",
		description: options?.modelHasVision ? "Analyze one or more images with a vision model. Use image for a single path/URL, or images for multiple (up to 20). Only use this tool when images were NOT already provided in the user's message. Images mentioned in the prompt are automatically visible to you." : "Analyze one or more images with the configured image model (agents.defaults.imageModel). Use image for a single path/URL, or images for multiple (up to 20). Provide a prompt describing what to analyze.",
		parameters: Type.Object({
			prompt: Type.Optional(Type.String()),
			image: Type.Optional(Type.String({ description: "Single image path or URL." })),
			images: Type.Optional(Type.Array(Type.String(), { description: "Multiple image paths or URLs (up to maxImages, default 20)." })),
			model: Type.Optional(Type.String()),
			maxBytesMb: Type.Optional(Type.Number()),
			maxImages: Type.Optional(Type.Number())
		}),
		execute: async (_toolCallId, args) => {
			const record = args && typeof args === "object" ? args : {};
			const imageCandidates = [];
			if (typeof record.image === "string") imageCandidates.push(record.image);
			if (Array.isArray(record.images)) imageCandidates.push(...record.images.filter((v) => typeof v === "string"));
			const seenImages = /* @__PURE__ */ new Set();
			const imageInputs = [];
			for (const candidate of imageCandidates) {
				const trimmedCandidate = candidate.trim();
				const normalizedForDedupe = trimmedCandidate.startsWith("@") ? trimmedCandidate.slice(1).trim() : trimmedCandidate;
				if (!normalizedForDedupe || seenImages.has(normalizedForDedupe)) continue;
				seenImages.add(normalizedForDedupe);
				imageInputs.push(trimmedCandidate);
			}
			if (imageInputs.length === 0) throw new Error("image required");
			const maxImagesRaw = typeof record.maxImages === "number" ? record.maxImages : void 0;
			const maxImages = typeof maxImagesRaw === "number" && Number.isFinite(maxImagesRaw) && maxImagesRaw > 0 ? Math.floor(maxImagesRaw) : DEFAULT_MAX_IMAGES;
			if (imageInputs.length > maxImages) return {
				content: [{
					type: "text",
					text: `Too many images: ${imageInputs.length} provided, maximum is ${maxImages}. Please reduce the number of images.`
				}],
				details: {
					error: "too_many_images",
					count: imageInputs.length,
					max: maxImages
				}
			};
			const { prompt: promptRaw, modelOverride } = resolvePromptAndModelOverride(record, DEFAULT_PROMPT$1);
			const maxBytesMb = typeof record.maxBytesMb === "number" ? record.maxBytesMb : void 0;
			const maxBytes = pickMaxBytes(options?.config, maxBytesMb);
			const sandboxConfig = options?.sandbox && options?.sandbox.root.trim() ? {
				root: options.sandbox.root.trim(),
				bridge: options.sandbox.bridge,
				workspaceOnly: options.fsPolicy?.workspaceOnly === true
			} : null;
			const loadedImages = [];
			for (const imageRawInput of imageInputs) {
				const trimmed = imageRawInput.trim();
				const imageRaw = trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
				if (!imageRaw) throw new Error("image required (empty string in array)");
				const looksLikeWindowsDrivePath = /^[a-zA-Z]:[\\/]/.test(imageRaw);
				const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(imageRaw);
				const isFileUrl = /^file:/i.test(imageRaw);
				const isHttpUrl = /^https?:\/\//i.test(imageRaw);
				const isDataUrl = /^data:/i.test(imageRaw);
				if (hasScheme && !looksLikeWindowsDrivePath && !isFileUrl && !isHttpUrl && !isDataUrl) return {
					content: [{
						type: "text",
						text: `Unsupported image reference: ${imageRawInput}. Use a file path, a file:// URL, a data: URL, or an http(s) URL.`
					}],
					details: {
						error: "unsupported_image_reference",
						image: imageRawInput
					}
				};
				if (sandboxConfig && isHttpUrl) throw new Error("Sandboxed image tool does not allow remote URLs.");
				const resolvedImage = (() => {
					if (sandboxConfig) return imageRaw;
					if (imageRaw.startsWith("~")) return resolveUserPath(imageRaw);
					if (!isDataUrl && !isFileUrl && !isHttpUrl && !looksLikeWindowsDrivePath && !isAbsolute(imageRaw) && options?.workspaceDir) return resolve(options.workspaceDir, imageRaw);
					return imageRaw;
				})();
				const resolvedPathInfo = isDataUrl ? { resolved: "" } : sandboxConfig ? await resolveSandboxedBridgeMediaPath({
					sandbox: sandboxConfig,
					mediaPath: resolvedImage,
					inboundFallbackDir: "media/inbound"
				}) : { resolved: resolvedImage.startsWith("file://") ? resolvedImage.slice(7) : resolvedImage };
				const resolvedPath = isDataUrl ? null : resolvedPathInfo.resolved;
				const mediaLocalRoots = resolveMediaToolLocalRoots(options?.workspaceDir, { workspaceOnly: options?.fsPolicy?.workspaceOnly === true }, resolvedPath ? [resolvedPath] : void 0);
				const media = isDataUrl ? decodeDataUrl(resolvedImage, { maxBytes }) : sandboxConfig ? await loadWebMedia(resolvedPath ?? resolvedImage, {
					maxBytes,
					sandboxValidated: true,
					readFile: createSandboxBridgeReadFile({ sandbox: sandboxConfig })
				}) : await loadWebMedia(resolvedPath ?? resolvedImage, {
					maxBytes,
					localRoots: mediaLocalRoots
				});
				if (media.kind !== "image") throw new Error(`Unsupported media type: ${media.kind}`);
				const mimeType = "contentType" in media && media.contentType || "mimeType" in media && media.mimeType || "image/png";
				loadedImages.push({
					buffer: media.buffer,
					mimeType,
					resolvedImage,
					...resolvedPathInfo.rewrittenFrom ? { rewrittenFrom: resolvedPathInfo.rewrittenFrom } : {}
				});
			}
			return buildTextToolResult(await runImagePrompt({
				cfg: options?.config,
				agentDir,
				imageModelConfig,
				modelOverride,
				prompt: promptRaw,
				images: loadedImages.map((img) => ({
					buffer: img.buffer,
					mimeType: img.mimeType
				}))
			}), loadedImages.length === 1 ? {
				image: loadedImages[0].resolvedImage,
				...loadedImages[0].rewrittenFrom ? { rewrittenFrom: loadedImages[0].rewrittenFrom } : {}
			} : { images: loadedImages.map((img) => ({
				image: img.resolvedImage,
				...img.rewrittenFrom ? { rewrittenFrom: img.rewrittenFrom } : {}
			})) });
		}
	};
}
//#endregion
//#region src/agents/tools/message-tool.ts
const AllMessageActions = CHANNEL_MESSAGE_ACTION_NAMES;
const MESSAGE_TOOL_THREAD_READ_HINT = " Use action=\"read\" with threadId to fetch prior messages in a thread when you need conversation context you do not have yet.";
const EXPLICIT_TARGET_ACTIONS = new Set([
	"send",
	"sendWithEffect",
	"sendAttachment",
	"upload-file",
	"reply",
	"thread-reply",
	"broadcast"
]);
function actionNeedsExplicitTarget(action) {
	return EXPLICIT_TARGET_ACTIONS.has(action);
}
function buildRoutingSchema() {
	return {
		channel: Type.Optional(Type.String()),
		target: Type.Optional(channelTargetSchema({ description: "Target channel/user id or name." })),
		targets: Type.Optional(channelTargetsSchema()),
		accountId: Type.Optional(Type.String()),
		dryRun: Type.Optional(Type.Boolean())
	};
}
const interactiveOptionSchema = Type.Object({
	label: Type.String(),
	value: Type.String()
});
const interactiveButtonSchema = Type.Object({
	label: Type.String(),
	value: Type.String(),
	style: Type.Optional(stringEnum([
		"primary",
		"secondary",
		"success",
		"danger"
	]))
});
const interactiveBlockSchema = Type.Object({
	type: stringEnum([
		"text",
		"buttons",
		"select"
	]),
	text: Type.Optional(Type.String()),
	buttons: Type.Optional(Type.Array(interactiveButtonSchema)),
	placeholder: Type.Optional(Type.String()),
	options: Type.Optional(Type.Array(interactiveOptionSchema))
});
const interactiveMessageSchema = Type.Object({ blocks: Type.Array(interactiveBlockSchema) }, { description: "Shared interactive message payload for buttons and selects. Channels render this into their native components when supported." });
function buildSendSchema(options) {
	const props = {
		message: Type.Optional(Type.String()),
		effectId: Type.Optional(Type.String({ description: "Message effect name/id for sendWithEffect (e.g., invisible ink)." })),
		effect: Type.Optional(Type.String({ description: "Alias for effectId (e.g., invisible-ink, balloons)." })),
		media: Type.Optional(Type.String({ description: "Media URL or local path. data: URLs are not supported here, use buffer." })),
		filename: Type.Optional(Type.String()),
		buffer: Type.Optional(Type.String({ description: "Base64 payload for attachments (optionally a data: URL)." })),
		contentType: Type.Optional(Type.String()),
		mimeType: Type.Optional(Type.String()),
		caption: Type.Optional(Type.String()),
		path: Type.Optional(Type.String()),
		filePath: Type.Optional(Type.String()),
		replyTo: Type.Optional(Type.String()),
		threadId: Type.Optional(Type.String()),
		asVoice: Type.Optional(Type.Boolean()),
		silent: Type.Optional(Type.Boolean()),
		quoteText: Type.Optional(Type.String({ description: "Quote text for Telegram reply_parameters" })),
		bestEffort: Type.Optional(Type.Boolean()),
		gifPlayback: Type.Optional(Type.Boolean()),
		forceDocument: Type.Optional(Type.Boolean({ description: "Send image/GIF as document to avoid Telegram compression (Telegram only)." })),
		asDocument: Type.Optional(Type.Boolean({ description: "Send image/GIF as document to avoid Telegram compression. Alias for forceDocument (Telegram only)." })),
		interactive: Type.Optional(interactiveMessageSchema)
	};
	if (!options.includeInteractive) delete props.interactive;
	return props;
}
function buildReactionSchema() {
	return {
		messageId: Type.Optional(Type.String({ description: "Target message id for reaction. If omitted, defaults to the current inbound message id when available." })),
		message_id: Type.Optional(Type.String({ description: "snake_case alias of messageId. If omitted, defaults to the current inbound message id when available." })),
		emoji: Type.Optional(Type.String()),
		remove: Type.Optional(Type.Boolean()),
		targetAuthor: Type.Optional(Type.String()),
		targetAuthorUuid: Type.Optional(Type.String()),
		groupId: Type.Optional(Type.String())
	};
}
function buildFetchSchema() {
	return {
		limit: Type.Optional(Type.Number()),
		pageSize: Type.Optional(Type.Number()),
		pageToken: Type.Optional(Type.String()),
		before: Type.Optional(Type.String()),
		after: Type.Optional(Type.String()),
		around: Type.Optional(Type.String()),
		fromMe: Type.Optional(Type.Boolean()),
		includeArchived: Type.Optional(Type.Boolean())
	};
}
function buildPollSchema() {
	const props = {
		pollId: Type.Optional(Type.String()),
		pollOptionId: Type.Optional(Type.String({ description: "Poll answer id to vote for. Use when the channel exposes stable answer ids." })),
		pollOptionIds: Type.Optional(Type.Array(Type.String({ description: "Poll answer ids to vote for in a multiselect poll. Use when the channel exposes stable answer ids." }))),
		pollOptionIndex: Type.Optional(Type.Number({ description: "1-based poll option number to vote for, matching the rendered numbered poll choices." })),
		pollOptionIndexes: Type.Optional(Type.Array(Type.Number({ description: "1-based poll option numbers to vote for in a multiselect poll, matching the rendered numbered poll choices." })))
	};
	for (const name of SHARED_POLL_CREATION_PARAM_NAMES) switch (POLL_CREATION_PARAM_DEFS[name].kind) {
		case "string":
			props[name] = Type.Optional(Type.String());
			break;
		case "stringArray":
			props[name] = Type.Optional(Type.Array(Type.String()));
			break;
		case "number":
			props[name] = Type.Optional(Type.Number());
			break;
		case "boolean":
			props[name] = Type.Optional(Type.Boolean());
			break;
	}
	return props;
}
function buildChannelTargetSchema() {
	return {
		channelId: Type.Optional(Type.String({ description: "Channel id filter (search/thread list/event create)." })),
		chatId: Type.Optional(Type.String({ description: "Chat id for chat-scoped metadata actions." })),
		channelIds: Type.Optional(Type.Array(Type.String({ description: "Channel id filter (repeatable)." }))),
		memberId: Type.Optional(Type.String()),
		memberIdType: Type.Optional(Type.String()),
		guildId: Type.Optional(Type.String()),
		userId: Type.Optional(Type.String()),
		openId: Type.Optional(Type.String()),
		unionId: Type.Optional(Type.String()),
		authorId: Type.Optional(Type.String()),
		authorIds: Type.Optional(Type.Array(Type.String())),
		roleId: Type.Optional(Type.String()),
		roleIds: Type.Optional(Type.Array(Type.String())),
		participant: Type.Optional(Type.String()),
		includeMembers: Type.Optional(Type.Boolean()),
		members: Type.Optional(Type.Boolean()),
		scope: Type.Optional(Type.String()),
		kind: Type.Optional(Type.String())
	};
}
function buildStickerSchema() {
	return {
		emojiName: Type.Optional(Type.String()),
		stickerId: Type.Optional(Type.Array(Type.String())),
		stickerName: Type.Optional(Type.String()),
		stickerDesc: Type.Optional(Type.String()),
		stickerTags: Type.Optional(Type.String())
	};
}
function buildThreadSchema() {
	return {
		threadName: Type.Optional(Type.String()),
		autoArchiveMin: Type.Optional(Type.Number()),
		appliedTags: Type.Optional(Type.Array(Type.String()))
	};
}
function buildEventSchema() {
	return {
		query: Type.Optional(Type.String()),
		eventName: Type.Optional(Type.String()),
		eventType: Type.Optional(Type.String()),
		startTime: Type.Optional(Type.String()),
		endTime: Type.Optional(Type.String()),
		desc: Type.Optional(Type.String()),
		location: Type.Optional(Type.String()),
		image: Type.Optional(Type.String({ description: "Cover image URL or local file path for the event." })),
		durationMin: Type.Optional(Type.Number()),
		until: Type.Optional(Type.String())
	};
}
function buildModerationSchema() {
	return {
		reason: Type.Optional(Type.String()),
		deleteDays: Type.Optional(Type.Number())
	};
}
function buildGatewaySchema() {
	return {
		gatewayUrl: Type.Optional(Type.String()),
		gatewayToken: Type.Optional(Type.String()),
		timeoutMs: Type.Optional(Type.Number())
	};
}
function buildPresenceSchema() {
	return {
		activityType: Type.Optional(Type.String({ description: "Activity type: playing, streaming, listening, watching, competing, custom." })),
		activityName: Type.Optional(Type.String({ description: "Activity name shown in sidebar (e.g. 'with fire'). Ignored for custom type." })),
		activityUrl: Type.Optional(Type.String({ description: "Streaming URL (Twitch or YouTube). Only used with streaming type; may not render for bots." })),
		activityState: Type.Optional(Type.String({ description: "State text. For custom type this is the status text; for others it shows in the flyout." })),
		status: Type.Optional(Type.String({ description: "Bot status: online, dnd, idle, invisible." }))
	};
}
function buildChannelManagementSchema() {
	return {
		name: Type.Optional(Type.String()),
		type: Type.Optional(Type.Number()),
		parentId: Type.Optional(Type.String()),
		topic: Type.Optional(Type.String()),
		position: Type.Optional(Type.Number()),
		nsfw: Type.Optional(Type.Boolean()),
		rateLimitPerUser: Type.Optional(Type.Number()),
		categoryId: Type.Optional(Type.String()),
		clearParent: Type.Optional(Type.Boolean({ description: "Clear the parent/category when supported by the provider." }))
	};
}
function buildMessageToolSchemaProps(options) {
	return {
		...buildRoutingSchema(),
		...buildSendSchema(options),
		...buildReactionSchema(),
		...buildFetchSchema(),
		...buildPollSchema(),
		...buildChannelTargetSchema(),
		...buildStickerSchema(),
		...buildThreadSchema(),
		...buildEventSchema(),
		...buildModerationSchema(),
		...buildGatewaySchema(),
		...buildChannelManagementSchema(),
		...buildPresenceSchema(),
		...options.extraProperties
	};
}
function buildMessageToolSchemaFromActions(actions, options) {
	const props = buildMessageToolSchemaProps(options);
	return Type.Object({
		action: stringEnum(actions),
		...props
	});
}
const MessageToolSchema = buildMessageToolSchemaFromActions(AllMessageActions, { includeInteractive: true });
function buildMessageActionDiscoveryInput(params, channel) {
	return {
		cfg: params.cfg,
		...channel ? { channel } : {},
		currentChannelId: params.currentChannelId,
		currentThreadTs: params.currentThreadTs,
		currentMessageId: params.currentMessageId,
		accountId: params.currentAccountId,
		sessionKey: params.sessionKey,
		sessionId: params.sessionId,
		agentId: params.agentId,
		requesterSenderId: params.requesterSenderId,
		senderIsOwner: params.senderIsOwner
	};
}
function resolveMessageToolSchemaActions(params) {
	const currentChannel = normalizeMessageChannel(params.currentChannelProvider);
	if (currentChannel) {
		const scopedActions = listChannelSupportedActions(buildMessageActionDiscoveryInput(params, currentChannel));
		const allActions = new Set(["send", ...scopedActions]);
		for (const plugin of listChannelPlugins()) {
			if (plugin.id === currentChannel) continue;
			for (const action of listChannelSupportedActions(buildMessageActionDiscoveryInput(params, plugin.id))) allActions.add(action);
		}
		return Array.from(allActions);
	}
	return listAllMessageToolActions(params);
}
function listAllMessageToolActions(params) {
	const pluginActions = listAllChannelSupportedActions(buildMessageActionDiscoveryInput(params));
	return Array.from(new Set([
		"send",
		"broadcast",
		...pluginActions
	]));
}
function resolveIncludeCapability(params, capability) {
	const currentChannel = normalizeMessageChannel(params.currentChannelProvider);
	if (currentChannel) return channelSupportsMessageCapabilityForChannel(buildMessageActionDiscoveryInput(params, currentChannel), capability);
	return channelSupportsMessageCapability(params.cfg, capability);
}
function resolveIncludeInteractive(params) {
	return resolveIncludeCapability(params, "interactive");
}
function buildMessageToolSchema(params) {
	const actions = resolveMessageToolSchemaActions(params);
	const includeInteractive = resolveIncludeInteractive(params);
	const extraProperties = resolveChannelMessageToolSchemaProperties(buildMessageActionDiscoveryInput(params, normalizeMessageChannel(params.currentChannelProvider) ?? void 0));
	return buildMessageToolSchemaFromActions(actions.length > 0 ? actions : ["send"], {
		includeInteractive,
		extraProperties
	});
}
function resolveAgentAccountId(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	return normalizeAccountId(trimmed);
}
function buildMessageToolDescription(options) {
	const baseDescription = "Send, delete, and manage messages via channel plugins.";
	const resolvedOptions = options ?? {};
	const currentChannel = normalizeMessageChannel(resolvedOptions.currentChannel);
	const messageToolDiscoveryParams = resolvedOptions.config ? {
		cfg: resolvedOptions.config,
		currentChannelProvider: resolvedOptions.currentChannel,
		currentChannelId: resolvedOptions.currentChannelId,
		currentThreadTs: resolvedOptions.currentThreadTs,
		currentMessageId: resolvedOptions.currentMessageId,
		currentAccountId: resolvedOptions.currentAccountId,
		sessionKey: resolvedOptions.sessionKey,
		sessionId: resolvedOptions.sessionId,
		agentId: resolvedOptions.agentId,
		requesterSenderId: resolvedOptions.requesterSenderId,
		senderIsOwner: resolvedOptions.senderIsOwner
	} : void 0;
	if (currentChannel && messageToolDiscoveryParams) {
		const channelActions = listChannelSupportedActions(buildMessageActionDiscoveryInput(messageToolDiscoveryParams, currentChannel));
		if (channelActions.length > 0) {
			const allActions = new Set(["send", ...channelActions]);
			let desc = `${baseDescription} Current channel (${currentChannel}) supports: ${Array.from(allActions).toSorted().join(", ")}.`;
			const otherChannels = [];
			for (const plugin of listChannelPlugins()) {
				if (plugin.id === currentChannel) continue;
				const actions = listChannelSupportedActions(buildMessageActionDiscoveryInput(messageToolDiscoveryParams, plugin.id));
				if (actions.length > 0) {
					const all = new Set(["send", ...actions]);
					otherChannels.push(`${plugin.id} (${Array.from(all).toSorted().join(", ")})`);
				}
			}
			if (otherChannels.length > 0) desc += ` Other configured channels: ${otherChannels.join(", ")}.`;
			return appendMessageToolReadHint(desc, Array.from(allActions));
		}
	}
	if (messageToolDiscoveryParams) {
		const actions = listAllMessageToolActions(messageToolDiscoveryParams);
		if (actions.length > 0) return appendMessageToolReadHint(`${baseDescription} Supports actions: ${actions.join(", ")}.`, actions);
	}
	return `${baseDescription} Supports actions: send, delete, react, poll, pin, threads, and more.`;
}
function appendMessageToolReadHint(description, actions) {
	for (const action of actions) if (action === "read") return `${description}${MESSAGE_TOOL_THREAD_READ_HINT}`;
	return description;
}
function createMessageTool(options) {
	const loadConfigForTool = options?.loadConfig ?? loadConfig;
	const getScopedSecretTargetsForTool = options?.getScopedChannelsCommandSecretTargets ?? getScopedChannelsCommandSecretTargets;
	const resolveSecretRefsForTool = options?.resolveCommandSecretRefsViaGateway ?? resolveCommandSecretRefsViaGateway;
	const runMessageActionForTool = options?.runMessageAction ?? runMessageAction;
	const agentAccountId = resolveAgentAccountId(options?.agentAccountId);
	const resolvedAgentId = options?.agentSessionKey ? resolveSessionAgentId({
		sessionKey: options.agentSessionKey,
		config: options?.config
	}) : void 0;
	const schema = options?.config ? buildMessageToolSchema({
		cfg: options.config,
		currentChannelProvider: options.currentChannelProvider,
		currentChannelId: options.currentChannelId,
		currentThreadTs: options.currentThreadTs,
		currentMessageId: options.currentMessageId,
		currentAccountId: agentAccountId,
		sessionKey: options.agentSessionKey,
		sessionId: options.sessionId,
		agentId: resolvedAgentId,
		requesterSenderId: options.requesterSenderId,
		senderIsOwner: options.senderIsOwner
	}) : MessageToolSchema;
	return {
		label: "Message",
		name: "message",
		displaySummary: "Send and manage messages across configured channels.",
		description: buildMessageToolDescription({
			config: options?.config,
			currentChannel: options?.currentChannelProvider,
			currentChannelId: options?.currentChannelId,
			currentThreadTs: options?.currentThreadTs,
			currentMessageId: options?.currentMessageId,
			currentAccountId: agentAccountId,
			sessionKey: options?.agentSessionKey,
			sessionId: options?.sessionId,
			agentId: resolvedAgentId,
			requesterSenderId: options?.requesterSenderId,
			senderIsOwner: options?.senderIsOwner
		}),
		parameters: schema,
		execute: async (_toolCallId, args, signal) => {
			if (signal?.aborted) {
				const err = /* @__PURE__ */ new Error("Message send aborted");
				err.name = "AbortError";
				throw err;
			}
			const params = { ...args };
			for (const field of [
				"text",
				"content",
				"message",
				"caption"
			]) if (typeof params[field] === "string") params[field] = stripReasoningTagsFromText(params[field]);
			const action = readStringParam$1(params, "action", { required: true });
			let cfg = options?.config;
			if (!cfg) {
				const loadedRaw = loadConfigForTool();
				const scope = resolveMessageSecretScope({
					channel: params.channel,
					target: params.target,
					targets: params.targets,
					fallbackChannel: options?.currentChannelProvider,
					accountId: params.accountId,
					fallbackAccountId: agentAccountId
				});
				const scopedTargets = getScopedSecretTargetsForTool({
					config: loadedRaw,
					channel: scope.channel,
					accountId: scope.accountId
				});
				cfg = (await resolveSecretRefsForTool({
					config: loadedRaw,
					commandName: "tools.message",
					targetIds: scopedTargets.targetIds,
					...scopedTargets.allowedPaths ? { allowedPaths: scopedTargets.allowedPaths } : {},
					mode: "enforce_resolved"
				})).resolvedConfig;
			}
			if (options?.requireExplicitTarget === true && actionNeedsExplicitTarget(action)) {
				if (!(typeof params.target === "string" && params.target.trim().length > 0 || typeof params.to === "string" && params.to.trim().length > 0 || typeof params.channelId === "string" && params.channelId.trim().length > 0 || Array.isArray(params.targets) && params.targets.some((value) => typeof value === "string" && value.trim().length > 0))) throw new Error("Explicit message target required for this run. Provide target/targets (and channel when needed).");
			}
			const accountId = readStringParam$1(params, "accountId") ?? agentAccountId;
			if (accountId) params.accountId = accountId;
			const gatewayResolved = resolveGatewayOptions({
				gatewayUrl: readStringParam$1(params, "gatewayUrl", { trim: false }),
				gatewayToken: readStringParam$1(params, "gatewayToken", { trim: false }),
				timeoutMs: readNumberParam(params, "timeoutMs")
			});
			const gateway = {
				url: gatewayResolved.url,
				token: gatewayResolved.token,
				timeoutMs: gatewayResolved.timeoutMs,
				clientName: GATEWAY_CLIENT_IDS.GATEWAY_CLIENT,
				clientDisplayName: "agent",
				mode: GATEWAY_CLIENT_MODES.BACKEND
			};
			const hasCurrentMessageId = typeof options?.currentMessageId === "number" || typeof options?.currentMessageId === "string" && options.currentMessageId.trim().length > 0;
			const toolContext = options?.currentChannelId || options?.currentChannelProvider || options?.currentThreadTs || hasCurrentMessageId || options?.replyToMode || options?.hasRepliedRef ? {
				currentChannelId: options?.currentChannelId,
				currentChannelProvider: options?.currentChannelProvider,
				currentThreadTs: options?.currentThreadTs,
				currentMessageId: options?.currentMessageId,
				replyToMode: options?.replyToMode,
				hasRepliedRef: options?.hasRepliedRef,
				skipCrossContextDecoration: true
			} : void 0;
			const result = await runMessageActionForTool({
				cfg,
				action,
				params,
				defaultAccountId: accountId ?? void 0,
				requesterSenderId: options?.requesterSenderId,
				senderIsOwner: options?.senderIsOwner,
				gateway,
				toolContext,
				sessionKey: options?.agentSessionKey,
				sessionId: options?.sessionId,
				agentId: resolvedAgentId,
				sandboxRoot: options?.sandboxRoot,
				abortSignal: signal
			});
			const toolResult = getToolResult(result);
			if (toolResult) return toolResult;
			return jsonResult(result.payload);
		}
	};
}
//#endregion
//#region src/agents/session-async-task-status.ts
const DEFAULT_ACTIVE_STATUSES = new Set(["queued", "running"]);
function findActiveSessionTask(params) {
	const normalizedSessionKey = normalizeOptionalString(params.sessionKey);
	if (!normalizedSessionKey) return;
	const statuses = params.statuses ?? DEFAULT_ACTIVE_STATUSES;
	const taskKind = normalizeOptionalString(params.taskKind);
	const sourceIdPrefix = normalizeOptionalString(params.sourceIdPrefix);
	const matches = listTasksForOwnerKey(normalizedSessionKey).filter((task) => {
		if (task.scopeKind !== "session") return false;
		if (params.runtime && task.runtime !== params.runtime) return false;
		if (!statuses.has(task.status)) return false;
		if (taskKind && task.taskKind !== taskKind) return false;
		if (sourceIdPrefix) {
			const sourceId = normalizeOptionalString(task.sourceId) ?? "";
			if (sourceId !== sourceIdPrefix && !sourceId.startsWith(`${sourceIdPrefix}:`)) return false;
		}
		return true;
	});
	if (matches.length === 0) return;
	return matches.find((task) => task.status === "running") ?? matches[0];
}
function buildSessionAsyncTaskStatusDetails(task) {
	return {
		async: true,
		active: true,
		existingTask: true,
		status: task.status,
		task: {
			taskId: task.taskId,
			...task.runId ? { runId: task.runId } : {}
		},
		...task.taskKind ? { taskKind: task.taskKind } : {},
		...task.progressSummary ? { progressSummary: task.progressSummary } : {},
		...task.sourceId ? { sourceId: task.sourceId } : {}
	};
}
//#endregion
//#region src/agents/media-generation-task-status-shared.ts
function getMediaGenerationTaskProviderId(task, sourcePrefix) {
	const sourceId = task.sourceId?.trim() ?? "";
	if (!sourceId.startsWith(`${sourcePrefix}:`)) return;
	return sourceId.slice(`${sourcePrefix}:`.length).trim() || void 0;
}
function findActiveMediaGenerationTaskForSession(params) {
	return findActiveSessionTask({
		sessionKey: params.sessionKey,
		runtime: "cli",
		taskKind: params.taskKind,
		sourceIdPrefix: params.sourcePrefix
	});
}
function buildMediaGenerationTaskStatusDetails(params) {
	const provider = getMediaGenerationTaskProviderId(params.task, params.sourcePrefix);
	return {
		...buildSessionAsyncTaskStatusDetails(params.task),
		...provider ? { provider } : {}
	};
}
function buildMediaGenerationTaskStatusText(params) {
	const provider = getMediaGenerationTaskProviderId(params.task, params.sourcePrefix);
	return [
		`${params.nounLabel} task ${params.task.taskId} is already ${params.task.status}${provider ? ` with ${provider}` : ""}.`,
		params.task.progressSummary ? `Progress: ${params.task.progressSummary}.` : null,
		params.duplicateGuard ? `Do not call ${params.toolName} again for this request. Wait for the completion event; I will post the finished ${params.completionLabel} here.` : `Wait for the completion event; I will post the finished ${params.completionLabel} here when it's ready.`
	].filter((entry) => Boolean(entry)).join("\n");
}
function buildActiveMediaGenerationTaskPromptContextForSession(params) {
	const task = findActiveMediaGenerationTaskForSession({
		sessionKey: params.sessionKey,
		taskKind: params.taskKind,
		sourcePrefix: params.sourcePrefix
	});
	if (!task) return;
	const provider = getMediaGenerationTaskProviderId(task, params.sourcePrefix);
	return [
		`An active ${normalizeLowercaseStringOrEmpty(params.nounLabel)} background task already exists for this session.`,
		`Task ${task.taskId} is currently ${task.status}${provider ? ` via ${provider}` : ""}.`,
		task.progressSummary ? `Current progress: ${task.progressSummary}.` : null,
		`Do not call \`${params.toolName}\` again for the same request while that task is queued or running.`,
		`If the user asks for progress or whether the work is async, explain the active task state or call \`${params.toolName}\` with \`action:"status"\` instead of starting a new generation.`,
		`Only start a new \`${params.toolName}\` call if the user clearly asks for different/new ${params.completionLabel}.`
	].filter((entry) => Boolean(entry)).join("\n");
}
//#endregion
//#region src/agents/music-generation-task-status.ts
const MUSIC_GENERATION_TASK_KIND = "music_generation";
const MUSIC_GENERATION_SOURCE_PREFIX = "music_generate";
function findActiveMusicGenerationTaskForSession(sessionKey) {
	return findActiveMediaGenerationTaskForSession({
		sessionKey,
		taskKind: MUSIC_GENERATION_TASK_KIND,
		sourcePrefix: MUSIC_GENERATION_SOURCE_PREFIX
	});
}
function buildMusicGenerationTaskStatusDetails(task) {
	return buildMediaGenerationTaskStatusDetails({
		task,
		sourcePrefix: MUSIC_GENERATION_SOURCE_PREFIX
	});
}
function buildMusicGenerationTaskStatusText(task, params) {
	return buildMediaGenerationTaskStatusText({
		task,
		sourcePrefix: MUSIC_GENERATION_SOURCE_PREFIX,
		nounLabel: "Music generation",
		toolName: "music_generate",
		completionLabel: "music",
		duplicateGuard: params?.duplicateGuard
	});
}
function buildActiveMusicGenerationTaskPromptContextForSession(sessionKey) {
	return buildActiveMediaGenerationTaskPromptContextForSession({
		sessionKey,
		taskKind: MUSIC_GENERATION_TASK_KIND,
		sourcePrefix: MUSIC_GENERATION_SOURCE_PREFIX,
		nounLabel: "Music generation",
		toolName: "music_generate",
		completionLabel: "music tracks"
	});
}
//#endregion
//#region src/agents/tools/media-generate-background-shared.ts
const log$3 = createSubsystemLogger("agents/tools/media-generate-background-shared");
function createMediaGenerationTaskRun(params) {
	const sessionKey = params.sessionKey?.trim();
	if (!sessionKey) return null;
	const runId = `tool:${params.toolName}:${crypto.randomUUID()}`;
	try {
		return {
			taskId: createRunningTaskRun({
				runtime: "cli",
				taskKind: params.taskKind,
				sourceId: params.providerId ? `${params.toolName}:${params.providerId}` : params.toolName,
				requesterSessionKey: sessionKey,
				ownerKey: sessionKey,
				scopeKind: "session",
				requesterOrigin: params.requesterOrigin,
				childSessionKey: sessionKey,
				runId,
				label: params.label,
				task: params.prompt,
				deliveryStatus: "not_applicable",
				notifyPolicy: "silent",
				startedAt: Date.now(),
				lastEventAt: Date.now(),
				progressSummary: params.queuedProgressSummary
			}).taskId,
			runId,
			requesterSessionKey: sessionKey,
			requesterOrigin: params.requesterOrigin,
			taskLabel: params.prompt
		};
	} catch (error) {
		log$3.warn("Failed to create media generation task ledger record", {
			sessionKey,
			toolName: params.toolName,
			providerId: params.providerId,
			error
		});
		return null;
	}
}
function recordMediaGenerationTaskProgress(params) {
	if (!params.handle) return;
	recordTaskRunProgressByRunId({
		runId: params.handle.runId,
		runtime: "cli",
		sessionKey: params.handle.requesterSessionKey,
		lastEventAt: Date.now(),
		progressSummary: params.progressSummary,
		eventSummary: params.eventSummary
	});
}
function completeMediaGenerationTaskRun(params) {
	if (!params.handle) return;
	const endedAt = Date.now();
	const target = params.count === 1 ? params.paths[0] : `${params.count} files`;
	completeTaskRunByRunId({
		runId: params.handle.runId,
		runtime: "cli",
		sessionKey: params.handle.requesterSessionKey,
		endedAt,
		lastEventAt: endedAt,
		progressSummary: `Generated ${params.count} ${params.generatedLabel}${params.count === 1 ? "" : "s"}`,
		terminalSummary: `Generated ${params.count} ${params.generatedLabel}${params.count === 1 ? "" : "s"} with ${params.provider}/${params.model}${target ? ` -> ${target}` : ""}.`
	});
}
function failMediaGenerationTaskRun(params) {
	if (!params.handle) return;
	const endedAt = Date.now();
	const errorText = formatErrorMessage(params.error);
	failTaskRunByRunId({
		runId: params.handle.runId,
		runtime: "cli",
		sessionKey: params.handle.requesterSessionKey,
		endedAt,
		lastEventAt: endedAt,
		error: errorText,
		progressSummary: params.progressSummary,
		terminalSummary: errorText
	});
}
function buildMediaGenerationReplyInstruction(params) {
	if (params.status === "ok") return [
		`A completed ${params.completionLabel} generation task is ready for user delivery.`,
		`Prefer the message tool for delivery: use action="send" to the current/original chat, put your user-facing caption in message, attach each generated file with path/filePath using the exact path from the result, then reply ONLY: ${SILENT_REPLY_TOKEN}.`,
		`If you cannot use the message tool, reply in your normal assistant voice and include the exact MEDIA: lines from the result so OpenClaw attaches the finished ${params.completionLabel}.`,
		"Keep internal task/session details private and do not copy the internal event text verbatim."
	].join(" ");
	return [
		`${params.completionLabel[0]?.toUpperCase() ?? "T"}${params.completionLabel.slice(1)} generation task failed.`,
		"Reply in your normal assistant voice with the failure summary now.",
		"Keep internal task/session details private and do not copy the internal event text verbatim."
	].join(" ");
}
function isAsyncMediaDirectSendEnabled(config) {
	return config?.tools?.media?.asyncCompletion?.directSend === true;
}
async function maybeDeliverMediaGenerationResultDirectly(params) {
	const origin = params.handle.requesterOrigin;
	const channel = origin?.channel?.trim();
	const to = origin?.to?.trim();
	if (!channel || !to) return false;
	const parsed = parseReplyDirectives(params.result);
	const content = parsed.text.trim();
	const mediaUrls = parsed.mediaUrls?.filter((entry) => entry.trim().length > 0);
	const requesterAgentId = parseAgentSessionKey(params.handle.requesterSessionKey)?.agentId;
	await sendMessage({
		channel,
		to,
		accountId: origin?.accountId,
		threadId: origin?.threadId,
		content: content || (params.status === "ok" ? `Finished ${params.handle.taskLabel}.` : "Background media generation failed."),
		...mediaUrls?.length ? { mediaUrls } : {},
		agentId: requesterAgentId,
		idempotencyKey: params.idempotencyKey,
		mirror: {
			sessionKey: params.handle.requesterSessionKey,
			agentId: requesterAgentId,
			idempotencyKey: params.idempotencyKey
		}
	});
	return true;
}
async function wakeMediaGenerationTaskCompletion(params) {
	if (!params.handle) return;
	const announceId = `${params.toolName}:${params.handle.taskId}:${params.status}`;
	if (isAsyncMediaDirectSendEnabled(params.config)) try {
		if (await maybeDeliverMediaGenerationResultDirectly({
			handle: params.handle,
			status: params.status,
			result: params.result,
			idempotencyKey: announceId
		})) return;
	} catch (error) {
		log$3.warn("Media generation direct completion delivery failed; falling back to announce", {
			taskId: params.handle.taskId,
			runId: params.handle.runId,
			toolName: params.toolName,
			error
		});
	}
	const internalEvents = [{
		type: "task_completion",
		source: params.eventSource,
		childSessionKey: `${params.toolName}:${params.handle.taskId}`,
		childSessionId: params.handle.taskId,
		announceType: params.announceType,
		taskLabel: params.handle.taskLabel,
		status: params.status,
		statusLabel: params.statusLabel,
		result: params.result,
		...params.mediaUrls?.length ? { mediaUrls: params.mediaUrls } : {},
		...params.statsLine?.trim() ? { statsLine: params.statsLine } : {},
		replyInstruction: buildMediaGenerationReplyInstruction({
			status: params.status,
			completionLabel: params.completionLabel
		})
	}];
	const triggerMessage = formatAgentInternalEventsForPrompt(internalEvents) || `A ${params.completionLabel} generation task finished. Process the completion update now.`;
	const delivery = await deliverSubagentAnnouncement({
		requesterSessionKey: params.handle.requesterSessionKey,
		targetRequesterSessionKey: params.handle.requesterSessionKey,
		announceId,
		triggerMessage,
		steerMessage: triggerMessage,
		internalEvents,
		summaryLine: params.handle.taskLabel,
		requesterSessionOrigin: params.handle.requesterOrigin,
		requesterOrigin: params.handle.requesterOrigin,
		completionDirectOrigin: params.handle.requesterOrigin,
		directOrigin: params.handle.requesterOrigin,
		sourceSessionKey: `${params.toolName}:${params.handle.taskId}`,
		sourceChannel: INTERNAL_MESSAGE_CHANNEL,
		sourceTool: params.toolName,
		requesterIsSubagent: false,
		expectsCompletionMessage: true,
		bestEffortDeliver: true,
		directIdempotencyKey: announceId
	});
	if (!delivery.delivered && delivery.error) log$3.warn("Media generation completion wake failed", {
		taskId: params.handle.taskId,
		runId: params.handle.runId,
		toolName: params.toolName,
		error: delivery.error
	});
}
function createMediaGenerationTaskLifecycle(params) {
	return {
		createTaskRun(runParams) {
			return createMediaGenerationTaskRun({
				...runParams,
				toolName: params.toolName,
				taskKind: params.taskKind,
				label: params.label,
				queuedProgressSummary: params.queuedProgressSummary
			});
		},
		recordTaskProgress(progressParams) {
			recordMediaGenerationTaskProgress(progressParams);
		},
		completeTaskRun(completionParams) {
			completeMediaGenerationTaskRun({
				...completionParams,
				generatedLabel: params.generatedLabel
			});
		},
		failTaskRun(failureParams) {
			failMediaGenerationTaskRun({
				...failureParams,
				progressSummary: params.failureProgressSummary
			});
		},
		async wakeTaskCompletion(completionParams) {
			await wakeMediaGenerationTaskCompletion({
				...completionParams,
				eventSource: params.eventSource,
				announceType: params.announceType,
				toolName: params.toolName,
				completionLabel: params.completionLabel
			});
		}
	};
}
//#endregion
//#region src/agents/tools/music-generate-background.ts
const musicGenerationTaskLifecycle = createMediaGenerationTaskLifecycle({
	toolName: "music_generate",
	taskKind: MUSIC_GENERATION_TASK_KIND,
	label: "Music generation",
	queuedProgressSummary: "Queued music generation",
	generatedLabel: "track",
	failureProgressSummary: "Music generation failed",
	eventSource: "music_generation",
	announceType: "music generation task",
	completionLabel: "music"
});
const createMusicGenerationTaskRun = (...params) => musicGenerationTaskLifecycle.createTaskRun(...params);
const recordMusicGenerationTaskProgress = (...params) => musicGenerationTaskLifecycle.recordTaskProgress(...params);
const completeMusicGenerationTaskRun = (...params) => musicGenerationTaskLifecycle.completeTaskRun(...params);
const failMusicGenerationTaskRun = (...params) => musicGenerationTaskLifecycle.failTaskRun(...params);
async function wakeMusicGenerationTaskCompletion(params) {
	await musicGenerationTaskLifecycle.wakeTaskCompletion(params);
}
//#endregion
//#region src/agents/tools/media-generate-tool-actions-shared.ts
function createMediaGenerateProviderListActionResult(params) {
	if (params.providers.length === 0) return {
		content: [{
			type: "text",
			text: params.emptyText
		}],
		details: { providers: [] }
	};
	return {
		content: [{
			type: "text",
			text: params.providers.map((provider) => {
				const authHints = getProviderEnvVars(provider.id);
				const capabilities = params.summarizeCapabilities(provider);
				return [
					`${provider.id}: default=${provider.defaultModel ?? "none"}`,
					provider.models?.length ? `models=${provider.models.join(", ")}` : null,
					capabilities ? `capabilities=${capabilities}` : null,
					authHints.length > 0 ? `auth=${authHints.join(" / ")}` : null
				].filter((entry) => Boolean(entry)).join(" | ");
			}).join("\n")
		}],
		details: { providers: params.providers.map((provider) => ({
			id: provider.id,
			defaultModel: provider.defaultModel,
			models: provider.models ?? [],
			modes: params.listModes(provider),
			authEnvVars: getProviderEnvVars(provider.id),
			capabilities: provider.capabilities
		})) }
	};
}
function createMediaGenerateTaskStatusActions(params) {
	return {
		createStatusActionResult(sessionKey) {
			return createMediaGenerateStatusActionResult({
				sessionKey,
				inactiveText: params.inactiveText,
				findActiveTask: params.findActiveTask,
				buildStatusText: params.buildStatusText,
				buildStatusDetails: params.buildStatusDetails
			});
		},
		createDuplicateGuardResult(sessionKey) {
			return createMediaGenerateDuplicateGuardResult({
				sessionKey,
				findActiveTask: params.findActiveTask,
				buildStatusText: params.buildStatusText,
				buildStatusDetails: params.buildStatusDetails
			});
		}
	};
}
function createMediaGenerateStatusActionResult(params) {
	const activeTask = params.findActiveTask(params.sessionKey);
	if (!activeTask) return {
		content: [{
			type: "text",
			text: params.inactiveText
		}],
		details: {
			action: "status",
			active: false
		}
	};
	return {
		content: [{
			type: "text",
			text: params.buildStatusText(activeTask)
		}],
		details: {
			action: "status",
			...params.buildStatusDetails(activeTask)
		}
	};
}
function createMediaGenerateDuplicateGuardResult(params) {
	const activeTask = params.findActiveTask(params.sessionKey);
	if (!activeTask) return;
	return {
		content: [{
			type: "text",
			text: params.buildStatusText(activeTask, { duplicateGuard: true })
		}],
		details: {
			action: "status",
			duplicateGuard: true,
			...params.buildStatusDetails(activeTask)
		}
	};
}
//#endregion
//#region src/agents/tools/music-generate-tool.actions.ts
function summarizeMusicGenerationCapabilities(provider) {
	const supportedModes = listSupportedMusicGenerationModes(provider);
	const generate = provider.capabilities.generate;
	const edit = provider.capabilities.edit;
	return [
		supportedModes.length > 0 ? `modes=${supportedModes.join("/")}` : null,
		generate?.maxTracks ? `maxTracks=${generate.maxTracks}` : null,
		edit?.maxInputImages ? `maxInputImages=${edit.maxInputImages}` : null,
		generate?.maxDurationSeconds ? `maxDurationSeconds=${generate.maxDurationSeconds}` : null,
		generate?.supportsLyrics ? "lyrics" : null,
		generate?.supportsInstrumental ? "instrumental" : null,
		generate?.supportsDuration ? "duration" : null,
		generate?.supportsFormat ? "format" : null,
		generate?.supportedFormats?.length ? `supportedFormats=${generate.supportedFormats.join("/")}` : null,
		generate?.supportedFormatsByModel && Object.keys(generate.supportedFormatsByModel).length > 0 ? `supportedFormatsByModel=${Object.entries(generate.supportedFormatsByModel).map(([modelId, formats]) => `${modelId}:${formats.join("/")}`).join("; ")}` : null
	].filter((entry) => Boolean(entry)).join(", ");
}
function createMusicGenerateListActionResult(config) {
	return createMediaGenerateProviderListActionResult({
		providers: listRuntimeMusicGenerationProviders({ config }),
		emptyText: "No music-generation providers are registered.",
		listModes: listSupportedMusicGenerationModes,
		summarizeCapabilities: summarizeMusicGenerationCapabilities
	});
}
const musicGenerateTaskStatusActions = createMediaGenerateTaskStatusActions({
	inactiveText: "No active music generation task is currently running for this session.",
	findActiveTask: (sessionKey) => findActiveMusicGenerationTaskForSession(sessionKey) ?? void 0,
	buildStatusText: buildMusicGenerationTaskStatusText,
	buildStatusDetails: buildMusicGenerationTaskStatusDetails
});
function createMusicGenerateStatusActionResult(sessionKey) {
	return musicGenerateTaskStatusActions.createStatusActionResult(sessionKey);
}
function createMusicGenerateDuplicateGuardResult(sessionKey) {
	return musicGenerateTaskStatusActions.createDuplicateGuardResult(sessionKey);
}
//#endregion
//#region src/agents/tools/music-generate-tool.ts
const log$2 = createSubsystemLogger("agents/tools/music-generate");
const MAX_INPUT_IMAGES$1 = 10;
const SUPPORTED_OUTPUT_FORMATS = new Set(["mp3", "wav"]);
const MusicGenerateToolSchema = Type.Object({
	action: Type.Optional(Type.String({ description: "Optional action: \"generate\" (default), \"status\" to inspect the active session task, or \"list\" to inspect available providers/models." })),
	prompt: Type.Optional(Type.String({ description: "Music generation prompt." })),
	lyrics: Type.Optional(Type.String({ description: "Optional lyrics to guide sung output when the provider supports it." })),
	instrumental: Type.Optional(Type.Boolean({ description: "Optional toggle for instrumental-only output when the provider supports it." })),
	image: Type.Optional(Type.String({ description: "Optional single reference image path or URL." })),
	images: Type.Optional(Type.Array(Type.String(), { description: `Optional reference images (up to ${MAX_INPUT_IMAGES$1}).` })),
	model: Type.Optional(Type.String({ description: "Optional provider/model override, e.g. google/lyria-3-pro-preview." })),
	durationSeconds: Type.Optional(Type.Number({
		description: "Optional target duration in seconds when the provider supports duration hints.",
		minimum: 1
	})),
	format: Type.Optional(Type.String({ description: "Optional output format hint: \"mp3\" or \"wav\" when the provider supports it." })),
	filename: Type.Optional(Type.String({ description: "Optional output filename hint. OpenClaw preserves the basename and saves under its managed media directory." }))
});
function resolveMusicGenerationModelConfigForTool(params) {
	return resolveCapabilityModelConfigForTool({
		cfg: params.cfg,
		agentDir: params.agentDir,
		modelConfig: params.cfg?.agents?.defaults?.musicGenerationModel,
		providers: listRuntimeMusicGenerationProviders({ config: params.cfg })
	});
}
function resolveSelectedMusicGenerationProvider(params) {
	return resolveSelectedCapabilityProvider({
		providers: listRuntimeMusicGenerationProviders({ config: params.config }),
		modelConfig: params.musicGenerationModelConfig,
		modelOverride: params.modelOverride,
		parseModelRef: parseMusicGenerationModelRef
	});
}
function resolveAction$1(args) {
	return resolveGenerateAction({
		args,
		allowed: [
			"generate",
			"status",
			"list"
		],
		defaultAction: "generate"
	});
}
function normalizeOutputFormat(raw) {
	const normalized = normalizeOptionalLowercaseString(raw);
	if (!normalized) return;
	if (SUPPORTED_OUTPUT_FORMATS.has(normalized)) return normalized;
	throw new ToolInputError("format must be one of \"mp3\" or \"wav\"");
}
function normalizeReferenceImageInputs(args) {
	return normalizeMediaReferenceInputs({
		args,
		singularKey: "image",
		pluralKey: "images",
		maxCount: MAX_INPUT_IMAGES$1,
		label: "reference images"
	});
}
function validateMusicGenerationCapabilities(params) {
	const provider = params.provider;
	if (!provider) return;
	const { capabilities: caps } = resolveMusicGenerationModeCapabilities({
		provider,
		inputImageCount: params.inputImageCount
	});
	if (params.inputImageCount > 0) {
		if (!caps) throw new ToolInputError(`${provider.id} does not support reference-image edit inputs.`);
		if ("enabled" in caps && !caps.enabled) throw new ToolInputError(`${provider.id} does not support reference-image edit inputs.`);
		const maxInputImages = ("maxInputImages" in caps ? caps.maxInputImages : void 0) ?? MAX_INPUT_IMAGES$1;
		if (params.inputImageCount > maxInputImages) throw new ToolInputError(`${provider.id} supports at most ${maxInputImages} reference image${maxInputImages === 1 ? "" : "s"}.`);
	}
	if (!caps) return;
}
function defaultScheduleMusicGenerateBackgroundWork(work) {
	queueMicrotask(() => {
		work().catch((error) => {
			log$2.error("Detached music generation job crashed", { error });
		});
	});
}
async function loadReferenceImages(params) {
	const loaded = [];
	for (const rawInput of params.inputs) {
		const trimmed = rawInput.trim();
		const inputRaw = trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
		if (!inputRaw) throw new ToolInputError("image required (empty string in array)");
		const looksLikeWindowsDrivePath = /^[a-zA-Z]:[\\/]/.test(inputRaw);
		const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(inputRaw);
		const isFileUrl = /^file:/i.test(inputRaw);
		const isHttpUrl = /^https?:\/\//i.test(inputRaw);
		const isDataUrl = /^data:/i.test(inputRaw);
		if (hasScheme && !looksLikeWindowsDrivePath && !isFileUrl && !isHttpUrl && !isDataUrl) throw new ToolInputError(`Unsupported image reference: ${rawInput}. Use a file path, a file:// URL, a data: URL, or an http(s) URL.`);
		if (params.sandboxConfig && isHttpUrl) throw new ToolInputError("Sandboxed music_generate does not allow remote image URLs.");
		const resolvedInput = params.sandboxConfig ? inputRaw : inputRaw.startsWith("~") ? resolveUserPath(inputRaw) : inputRaw;
		const resolvedPathInfo = isDataUrl ? { resolved: "" } : params.sandboxConfig ? await resolveSandboxedBridgeMediaPath({
			sandbox: params.sandboxConfig,
			mediaPath: resolvedInput,
			inboundFallbackDir: "media/inbound"
		}) : { resolved: resolvedInput.startsWith("file://") ? resolvedInput.slice(7) : resolvedInput };
		const resolvedPath = isDataUrl ? null : resolvedPathInfo.resolved;
		const localRoots = resolveMediaToolLocalRoots(params.workspaceDir, { workspaceOnly: params.sandboxConfig?.workspaceOnly === true }, resolvedPath ? [resolvedPath] : void 0);
		const media = isDataUrl ? decodeDataUrl(resolvedInput) : params.sandboxConfig ? await loadWebMedia(resolvedPath ?? resolvedInput, {
			sandboxValidated: true,
			readFile: createSandboxBridgeReadFile({ sandbox: params.sandboxConfig })
		}) : await loadWebMedia(resolvedPath ?? resolvedInput, { localRoots });
		if (media.kind !== "image") throw new ToolInputError(`Unsupported media type: ${media.kind ?? "unknown"}`);
		const mimeType = "mimeType" in media ? media.mimeType : media.contentType;
		const fileName = "fileName" in media ? media.fileName : void 0;
		loaded.push({
			sourceImage: {
				buffer: media.buffer,
				mimeType,
				fileName
			},
			resolvedInput,
			...resolvedPathInfo.rewrittenFrom ? { rewrittenFrom: resolvedPathInfo.rewrittenFrom } : {}
		});
	}
	return loaded;
}
async function executeMusicGenerationJob(params) {
	if (params.taskHandle) recordMusicGenerationTaskProgress({
		handle: params.taskHandle,
		progressSummary: "Generating music"
	});
	const result = await generateMusic({
		cfg: params.effectiveCfg,
		prompt: params.prompt,
		agentDir: params.agentDir,
		modelOverride: params.model,
		lyrics: params.lyrics,
		instrumental: params.instrumental,
		durationSeconds: params.durationSeconds,
		format: params.format,
		inputImages: params.loadedReferenceImages.map((entry) => entry.sourceImage)
	});
	if (params.taskHandle) recordMusicGenerationTaskProgress({
		handle: params.taskHandle,
		progressSummary: "Saving generated music"
	});
	const configuredMediaMaxBytes = resolveConfiguredMediaMaxBytes(params.effectiveCfg);
	const savedTracks = await Promise.all(result.tracks.map((track) => saveMediaBuffer(track.buffer, track.mimeType, "tool-music-generation", configuredMediaMaxBytes, params.filename || track.fileName)));
	const ignoredOverrides = result.ignoredOverrides ?? [];
	const ignoredOverrideKeys = new Set(ignoredOverrides.map((entry) => entry.key));
	const requestedDurationSeconds = result.normalization?.durationSeconds?.requested ?? (typeof result.metadata?.requestedDurationSeconds === "number" && Number.isFinite(result.metadata.requestedDurationSeconds) ? result.metadata.requestedDurationSeconds : params.durationSeconds);
	const appliedDurationSeconds = result.normalization?.durationSeconds?.applied ?? (typeof result.metadata?.normalizedDurationSeconds === "number" && Number.isFinite(result.metadata.normalizedDurationSeconds) ? result.metadata.normalizedDurationSeconds : void 0) ?? (!ignoredOverrideKeys.has("durationSeconds") && typeof params.durationSeconds === "number" ? params.durationSeconds : void 0);
	const warning = ignoredOverrides.length > 0 ? `Ignored unsupported overrides for ${result.provider}/${result.model}: ${ignoredOverrides.map((entry) => `${entry.key}=${String(entry.value)}`).join(", ")}.` : void 0;
	const lines = [
		`Generated ${savedTracks.length} track${savedTracks.length === 1 ? "" : "s"} with ${result.provider}/${result.model}.`,
		...warning ? [`Warning: ${warning}`] : [],
		typeof requestedDurationSeconds === "number" && typeof appliedDurationSeconds === "number" && requestedDurationSeconds !== appliedDurationSeconds ? `Duration normalized: requested ${requestedDurationSeconds}s; used ${appliedDurationSeconds}s.` : null,
		...result.lyrics?.length ? ["Lyrics returned.", ...result.lyrics] : [],
		...savedTracks.map((track) => `MEDIA:${track.path}`)
	].filter((entry) => Boolean(entry));
	return {
		provider: result.provider,
		model: result.model,
		savedPaths: savedTracks.map((track) => track.path),
		contentText: lines.join("\n"),
		wakeResult: lines.join("\n"),
		details: {
			provider: result.provider,
			model: result.model,
			count: savedTracks.length,
			media: { mediaUrls: savedTracks.map((track) => track.path) },
			paths: savedTracks.map((track) => track.path),
			...buildTaskRunDetails(params.taskHandle),
			...!ignoredOverrideKeys.has("lyrics") && params.lyrics ? { requestedLyrics: params.lyrics } : {},
			...!ignoredOverrideKeys.has("instrumental") && typeof params.instrumental === "boolean" ? { instrumental: params.instrumental } : {},
			...typeof appliedDurationSeconds === "number" ? { durationSeconds: appliedDurationSeconds } : {},
			...typeof requestedDurationSeconds === "number" && typeof appliedDurationSeconds === "number" && requestedDurationSeconds !== appliedDurationSeconds ? { requestedDurationSeconds } : {},
			...!ignoredOverrideKeys.has("format") && params.format ? { format: params.format } : {},
			...params.filename ? { filename: params.filename } : {},
			...buildMediaReferenceDetails({
				entries: params.loadedReferenceImages,
				singleKey: "image",
				pluralKey: "images",
				getResolvedInput: (entry) => entry.resolvedInput
			}),
			...result.lyrics?.length ? { lyrics: result.lyrics } : {},
			attempts: result.attempts,
			...result.normalization ? { normalization: result.normalization } : {},
			metadata: result.metadata,
			...warning ? { warning } : {},
			...ignoredOverrides.length > 0 ? { ignoredOverrides } : {}
		}
	};
}
function createMusicGenerateTool(options) {
	const cfg = options?.config ?? loadConfig();
	const musicGenerationModelConfig = resolveMusicGenerationModelConfigForTool({
		cfg,
		agentDir: options?.agentDir
	});
	if (!musicGenerationModelConfig) return null;
	const sandboxConfig = options?.sandbox ? {
		root: options.sandbox.root,
		bridge: options.sandbox.bridge,
		workspaceOnly: options.fsPolicy?.workspaceOnly === true
	} : null;
	const scheduleBackgroundWork = options?.scheduleBackgroundWork ?? defaultScheduleMusicGenerateBackgroundWork;
	return {
		label: "Music Generation",
		name: "music_generate",
		displaySummary: "Generate music",
		description: "Generate music using configured providers. Generated tracks are saved under OpenClaw-managed media storage and delivered automatically as attachments.",
		parameters: MusicGenerateToolSchema,
		execute: async (_toolCallId, rawArgs) => {
			const args = rawArgs;
			const action = resolveAction$1(args);
			const effectiveCfg = applyMusicGenerationModelConfigDefaults(cfg, musicGenerationModelConfig) ?? cfg;
			if (action === "list") return createMusicGenerateListActionResult(effectiveCfg);
			if (action === "status") return createMusicGenerateStatusActionResult(options?.agentSessionKey);
			const duplicateGuardResult = createMusicGenerateDuplicateGuardResult(options?.agentSessionKey);
			if (duplicateGuardResult) return duplicateGuardResult;
			const prompt = readStringParam$1(args, "prompt", { required: true });
			const lyrics = readStringParam$1(args, "lyrics");
			const instrumental = readBooleanToolParam(args, "instrumental");
			const model = readStringParam$1(args, "model");
			const durationSeconds = readNumberParam(args, "durationSeconds", {
				integer: true,
				strict: true
			});
			const format = normalizeOutputFormat(readStringParam$1(args, "format"));
			const filename = readStringParam$1(args, "filename");
			const imageInputs = normalizeReferenceImageInputs(args);
			const selectedProvider = resolveSelectedMusicGenerationProvider({
				config: effectiveCfg,
				musicGenerationModelConfig,
				modelOverride: model
			});
			const loadedReferenceImages = await loadReferenceImages({
				inputs: imageInputs,
				workspaceDir: options?.workspaceDir,
				sandboxConfig
			});
			validateMusicGenerationCapabilities({
				provider: selectedProvider,
				model: parseMusicGenerationModelRef(model)?.model ?? model ?? selectedProvider?.defaultModel,
				inputImageCount: loadedReferenceImages.length,
				lyrics,
				instrumental,
				durationSeconds,
				format
			});
			const taskHandle = createMusicGenerationTaskRun({
				sessionKey: options?.agentSessionKey,
				requesterOrigin: options?.requesterOrigin,
				prompt,
				providerId: selectedProvider?.id
			});
			if (Boolean(taskHandle && options?.agentSessionKey?.trim())) {
				scheduleBackgroundWork(async () => {
					try {
						const executed = await executeMusicGenerationJob({
							effectiveCfg,
							prompt,
							agentDir: options?.agentDir,
							model,
							lyrics,
							instrumental,
							durationSeconds,
							format,
							filename,
							loadedReferenceImages,
							taskHandle
						});
						completeMusicGenerationTaskRun({
							handle: taskHandle,
							provider: executed.provider,
							model: executed.model,
							count: executed.savedPaths.length,
							paths: executed.savedPaths
						});
						try {
							await wakeMusicGenerationTaskCompletion({
								config: effectiveCfg,
								handle: taskHandle,
								status: "ok",
								statusLabel: "completed successfully",
								result: executed.wakeResult,
								mediaUrls: executed.savedPaths
							});
						} catch (error) {
							log$2.warn("Music generation completion wake failed after successful generation", {
								taskId: taskHandle?.taskId,
								runId: taskHandle?.runId,
								error
							});
						}
					} catch (error) {
						failMusicGenerationTaskRun({
							handle: taskHandle,
							error
						});
						await wakeMusicGenerationTaskCompletion({
							config: effectiveCfg,
							handle: taskHandle,
							status: "error",
							statusLabel: "failed",
							result: formatErrorMessage(error)
						});
						return;
					}
				});
				return {
					content: [{
						type: "text",
						text: `Background task started for music generation (${taskHandle?.taskId ?? "unknown"}). Do not call music_generate again for this request. Wait for the completion event; I'll post the finished music here when it's ready.`
					}],
					details: {
						async: true,
						status: "started",
						...buildTaskRunDetails(taskHandle),
						...buildMediaReferenceDetails({
							entries: loadedReferenceImages,
							singleKey: "image",
							pluralKey: "images",
							getResolvedInput: (entry) => entry.resolvedInput
						}),
						...model ? { model } : {},
						...lyrics ? { requestedLyrics: lyrics } : {},
						...typeof instrumental === "boolean" ? { instrumental } : {},
						...typeof durationSeconds === "number" ? { durationSeconds } : {},
						...format ? { format } : {},
						...filename ? { filename } : {}
					}
				};
			}
			try {
				const executed = await executeMusicGenerationJob({
					effectiveCfg,
					prompt,
					agentDir: options?.agentDir,
					lyrics,
					instrumental,
					durationSeconds,
					model,
					format,
					filename,
					loadedReferenceImages,
					taskHandle
				});
				completeMusicGenerationTaskRun({
					handle: taskHandle,
					provider: executed.provider,
					model: executed.model,
					count: executed.savedPaths.length,
					paths: executed.savedPaths
				});
				return {
					content: [{
						type: "text",
						text: executed.contentText
					}],
					details: executed.details
				};
			} catch (error) {
				failMusicGenerationTaskRun({
					handle: taskHandle,
					error
				});
				throw error;
			}
		}
	};
}
//#endregion
//#region src/agents/tools/nodes-tool-commands.ts
const BLOCKED_INVOKE_COMMANDS = new Set(["system.run", "system.run.prepare"]);
const NODE_READ_ACTION_COMMANDS = {
	camera_list: "camera.list",
	notifications_list: "notifications.list",
	device_status: "device.status",
	device_info: "device.info",
	device_permissions: "device.permissions",
	device_health: "device.health"
};
async function executeNodeCommandAction(params) {
	switch (params.action) {
		case "camera_list":
		case "notifications_list":
		case "device_status":
		case "device_info":
		case "device_permissions":
		case "device_health": {
			const node = readStringParam$1(params.input, "node", { required: true });
			const payloadRaw = await invokeNodeCommandPayload({
				gatewayOpts: params.gatewayOpts,
				node,
				command: NODE_READ_ACTION_COMMANDS[params.action]
			});
			return jsonResult(payloadRaw && typeof payloadRaw === "object" && payloadRaw !== null ? payloadRaw : {});
		}
		case "notifications_action": {
			const node = readStringParam$1(params.input, "node", { required: true });
			const notificationKey = readStringParam$1(params.input, "notificationKey", { required: true });
			const notificationAction = normalizeLowercaseStringOrEmpty(params.input.notificationAction);
			if (notificationAction !== "open" && notificationAction !== "dismiss" && notificationAction !== "reply") throw new Error("notificationAction must be open|dismiss|reply");
			const notificationReplyText = typeof params.input.notificationReplyText === "string" ? params.input.notificationReplyText.trim() : void 0;
			if (notificationAction === "reply" && !notificationReplyText) throw new Error("notificationReplyText required when notificationAction=reply");
			const payloadRaw = await invokeNodeCommandPayload({
				gatewayOpts: params.gatewayOpts,
				node,
				command: "notifications.actions",
				commandParams: {
					key: notificationKey,
					action: notificationAction,
					replyText: notificationReplyText
				}
			});
			return jsonResult(payloadRaw && typeof payloadRaw === "object" && payloadRaw !== null ? payloadRaw : {});
		}
		case "location_get": {
			const node = readStringParam$1(params.input, "node", { required: true });
			const maxAgeMs = typeof params.input.maxAgeMs === "number" && Number.isFinite(params.input.maxAgeMs) ? params.input.maxAgeMs : void 0;
			const desiredAccuracy = params.input.desiredAccuracy === "coarse" || params.input.desiredAccuracy === "balanced" || params.input.desiredAccuracy === "precise" ? params.input.desiredAccuracy : void 0;
			const locationTimeoutMs = typeof params.input.locationTimeoutMs === "number" && Number.isFinite(params.input.locationTimeoutMs) ? params.input.locationTimeoutMs : void 0;
			return jsonResult(await invokeNodeCommandPayload({
				gatewayOpts: params.gatewayOpts,
				node,
				command: "location.get",
				commandParams: {
					maxAgeMs,
					desiredAccuracy,
					timeoutMs: locationTimeoutMs
				}
			}));
		}
		case "invoke": {
			const node = readStringParam$1(params.input, "node", { required: true });
			const nodeId = await resolveNodeId(params.gatewayOpts, node);
			const invokeCommand = readStringParam$1(params.input, "invokeCommand", { required: true });
			const invokeCommandNormalized = normalizeLowercaseStringOrEmpty(invokeCommand);
			if (BLOCKED_INVOKE_COMMANDS.has(invokeCommandNormalized)) throw new Error(`invokeCommand "${invokeCommand}" is reserved for shell execution; use exec with host=node instead`);
			const dedicatedAction = params.mediaInvokeActions[invokeCommandNormalized];
			if (dedicatedAction && !params.allowMediaInvokeCommands) throw new Error(`invokeCommand "${invokeCommand}" returns media payloads and is blocked to prevent base64 context bloat; use action="${dedicatedAction}"`);
			const invokeParamsJson = typeof params.input.invokeParamsJson === "string" ? params.input.invokeParamsJson.trim() : "";
			let invokeParams = {};
			if (invokeParamsJson) try {
				invokeParams = JSON.parse(invokeParamsJson);
			} catch (err) {
				const message = formatErrorMessage(err);
				throw new Error(`invokeParamsJson must be valid JSON: ${message}`, { cause: err });
			}
			const invokeTimeoutMs = parseTimeoutMs(params.input.invokeTimeoutMs);
			return jsonResult(await callGatewayTool("node.invoke", params.gatewayOpts, {
				nodeId,
				command: invokeCommand,
				params: invokeParams,
				timeoutMs: invokeTimeoutMs,
				idempotencyKey: crypto.randomUUID()
			}) ?? {});
		}
	}
	throw new Error("Unsupported node command action");
}
async function invokeNodeCommandPayload(params) {
	const nodeId = await resolveNodeId(params.gatewayOpts, params.node);
	return (await callGatewayTool("node.invoke", params.gatewayOpts, {
		nodeId,
		command: params.command,
		params: params.commandParams ?? {},
		idempotencyKey: crypto.randomUUID()
	}))?.payload ?? {};
}
//#endregion
//#region src/agents/tools/nodes-tool-media.ts
const MEDIA_INVOKE_ACTIONS = {
	"camera.snap": "camera_snap",
	"camera.clip": "camera_clip",
	"photos.latest": "photos_latest",
	"screen.record": "screen_record"
};
async function executeNodeMediaAction(input) {
	switch (input.action) {
		case "camera_snap": return await executeCameraSnap(input);
		case "photos_latest": return await executePhotosLatest(input);
		case "camera_clip": return await executeCameraClip(input);
		case "screen_record": return await executeScreenRecord(input);
	}
	throw new Error("Unsupported node media action");
}
async function executeCameraSnap({ params, gatewayOpts, modelHasVision, imageSanitization }) {
	const resolvedNode = await resolveNode(gatewayOpts, requireString(params, "node"));
	const nodeId = resolvedNode.nodeId;
	const facingRaw = normalizeLowercaseStringOrEmpty(params.facing) || "front";
	const facings = facingRaw === "both" ? ["front", "back"] : facingRaw === "front" || facingRaw === "back" ? [facingRaw] : (() => {
		throw new Error("invalid facing (front|back|both)");
	})();
	const maxWidth = typeof params.maxWidth === "number" && Number.isFinite(params.maxWidth) ? params.maxWidth : 1600;
	const quality = typeof params.quality === "number" && Number.isFinite(params.quality) ? params.quality : .95;
	const delayMs = typeof params.delayMs === "number" && Number.isFinite(params.delayMs) ? params.delayMs : void 0;
	const deviceId = typeof params.deviceId === "string" && params.deviceId.trim() ? params.deviceId.trim() : void 0;
	if (deviceId && facings.length > 1) throw new Error("facing=both is not allowed when deviceId is set");
	const content = [];
	const details = [];
	for (const facing of facings) {
		const payload = parseCameraSnapPayload((await callGatewayTool("node.invoke", gatewayOpts, {
			nodeId,
			command: "camera.snap",
			params: {
				facing,
				maxWidth,
				quality,
				format: "jpg",
				delayMs,
				deviceId
			},
			idempotencyKey: crypto.randomUUID()
		}))?.payload);
		const normalizedFormat = normalizeLowercaseStringOrEmpty(payload.format);
		if (normalizedFormat !== "jpg" && normalizedFormat !== "jpeg" && normalizedFormat !== "png") throw new Error(`unsupported camera.snap format: ${payload.format}`);
		const isJpeg = normalizedFormat === "jpg" || normalizedFormat === "jpeg";
		const filePath = cameraTempPath({
			kind: "snap",
			facing,
			ext: isJpeg ? "jpg" : "png"
		});
		await writeCameraPayloadToFile({
			filePath,
			payload,
			expectedHost: resolvedNode.remoteIp,
			invalidPayloadMessage: "invalid camera.snap payload"
		});
		if (modelHasVision && payload.base64) content.push({
			type: "image",
			data: payload.base64,
			mimeType: imageMimeFromFormat(payload.format) ?? (isJpeg ? "image/jpeg" : "image/png")
		});
		details.push({
			facing,
			path: filePath,
			width: payload.width,
			height: payload.height
		});
	}
	return await sanitizeToolResultImages({
		content,
		details: {
			snaps: details,
			media: { mediaUrls: details.map((entry) => entry.path).filter((path) => typeof path === "string") }
		}
	}, "nodes:camera_snap", imageSanitization);
}
async function executePhotosLatest({ params, gatewayOpts, modelHasVision, imageSanitization }) {
	const resolvedNode = await resolveNode(gatewayOpts, requireString(params, "node"));
	const nodeId = resolvedNode.nodeId;
	const limitRaw = typeof params.limit === "number" && Number.isFinite(params.limit) ? Math.floor(params.limit) : DEFAULT_PHOTOS_LIMIT;
	const raw = await callGatewayTool("node.invoke", gatewayOpts, {
		nodeId,
		command: "photos.latest",
		params: {
			limit: Math.max(1, Math.min(limitRaw, MAX_PHOTOS_LIMIT)),
			maxWidth: typeof params.maxWidth === "number" && Number.isFinite(params.maxWidth) ? params.maxWidth : DEFAULT_PHOTOS_MAX_WIDTH,
			quality: typeof params.quality === "number" && Number.isFinite(params.quality) ? params.quality : DEFAULT_PHOTOS_QUALITY
		},
		idempotencyKey: crypto.randomUUID()
	});
	const payload = raw?.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload) ? raw.payload : {};
	const photos = Array.isArray(payload.photos) ? payload.photos : [];
	if (photos.length === 0) return await sanitizeToolResultImages({
		content: [],
		details: []
	}, "nodes:photos_latest", imageSanitization);
	const content = [];
	const details = [];
	for (const [index, photoRaw] of photos.entries()) {
		const photo = parseCameraSnapPayload(photoRaw);
		const normalizedFormat = normalizeLowercaseStringOrEmpty(photo.format);
		if (normalizedFormat !== "jpg" && normalizedFormat !== "jpeg" && normalizedFormat !== "png") throw new Error(`unsupported photos.latest format: ${photo.format}`);
		const isJpeg = normalizedFormat === "jpg" || normalizedFormat === "jpeg";
		const filePath = cameraTempPath({
			kind: "snap",
			ext: isJpeg ? "jpg" : "png",
			id: crypto.randomUUID()
		});
		await writeCameraPayloadToFile({
			filePath,
			payload: photo,
			expectedHost: resolvedNode.remoteIp,
			invalidPayloadMessage: "invalid photos.latest payload"
		});
		if (modelHasVision && photo.base64) content.push({
			type: "image",
			data: photo.base64,
			mimeType: imageMimeFromFormat(photo.format) ?? (isJpeg ? "image/jpeg" : "image/png")
		});
		const createdAt = photoRaw && typeof photoRaw === "object" && !Array.isArray(photoRaw) ? photoRaw.createdAt : void 0;
		details.push({
			index,
			path: filePath,
			width: photo.width,
			height: photo.height,
			...typeof createdAt === "string" ? { createdAt } : {}
		});
	}
	return await sanitizeToolResultImages({
		content,
		details: {
			photos: details,
			media: { mediaUrls: details.map((entry) => entry.path).filter((path) => typeof path === "string") }
		}
	}, "nodes:photos_latest", imageSanitization);
}
async function executeCameraClip({ params, gatewayOpts }) {
	const resolvedNode = await resolveNode(gatewayOpts, requireString(params, "node"));
	const nodeId = resolvedNode.nodeId;
	const facing = normalizeLowercaseStringOrEmpty(params.facing) || "front";
	if (facing !== "front" && facing !== "back") throw new Error("invalid facing (front|back)");
	const payload = parseCameraClipPayload((await callGatewayTool("node.invoke", gatewayOpts, {
		nodeId,
		command: "camera.clip",
		params: {
			facing,
			durationMs: typeof params.durationMs === "number" && Number.isFinite(params.durationMs) ? params.durationMs : typeof params.duration === "string" ? parseDurationMs(params.duration) : 3e3,
			includeAudio: typeof params.includeAudio === "boolean" ? params.includeAudio : true,
			format: "mp4",
			deviceId: typeof params.deviceId === "string" && params.deviceId.trim() ? params.deviceId.trim() : void 0
		},
		idempotencyKey: crypto.randomUUID()
	}))?.payload);
	const filePath = await writeCameraClipPayloadToFile({
		payload,
		facing,
		expectedHost: resolvedNode.remoteIp
	});
	return {
		content: [{
			type: "text",
			text: `FILE:${filePath}`
		}],
		details: {
			facing,
			path: filePath,
			durationMs: payload.durationMs,
			hasAudio: payload.hasAudio
		}
	};
}
async function executeScreenRecord({ params, gatewayOpts }) {
	const nodeId = await resolveNodeId(gatewayOpts, requireString(params, "node"));
	const durationMs = Math.min(typeof params.durationMs === "number" && Number.isFinite(params.durationMs) ? params.durationMs : typeof params.duration === "string" ? parseDurationMs(params.duration) : 1e4, 3e5);
	const fps = typeof params.fps === "number" && Number.isFinite(params.fps) ? params.fps : 10;
	const payload = parseScreenRecordPayload((await callGatewayTool("node.invoke", gatewayOpts, {
		nodeId,
		command: "screen.record",
		params: {
			durationMs,
			screenIndex: typeof params.screenIndex === "number" && Number.isFinite(params.screenIndex) ? params.screenIndex : 0,
			fps,
			format: "mp4",
			includeAudio: typeof params.includeAudio === "boolean" ? params.includeAudio : true
		},
		idempotencyKey: crypto.randomUUID()
	}))?.payload);
	const written = await writeScreenRecordToFile(typeof params.outPath === "string" && params.outPath.trim() ? params.outPath.trim() : screenRecordTempPath({ ext: payload.format || "mp4" }), payload.base64);
	return {
		content: [{
			type: "text",
			text: `FILE:${written.path}`
		}],
		details: {
			path: written.path,
			durationMs: payload.durationMs,
			fps: payload.fps,
			screenIndex: payload.screenIndex,
			hasAudio: payload.hasAudio
		}
	};
}
function requireString(params, key) {
	const raw = params[key];
	if (typeof raw !== "string" || raw.trim().length === 0) throw new Error(`${key} required`);
	return raw.trim();
}
const DEFAULT_PHOTOS_LIMIT = 1;
const MAX_PHOTOS_LIMIT = 20;
const DEFAULT_PHOTOS_MAX_WIDTH = 1600;
const DEFAULT_PHOTOS_QUALITY = .85;
//#endregion
//#region src/agents/tools/nodes-tool.ts
const NODES_TOOL_ACTIONS = [
	"status",
	"describe",
	"pending",
	"approve",
	"reject",
	"notify",
	"camera_snap",
	"camera_list",
	"camera_clip",
	"photos_latest",
	"screen_record",
	"location_get",
	"notifications_list",
	"notifications_action",
	"device_status",
	"device_info",
	"device_permissions",
	"device_health",
	"invoke"
];
const NOTIFY_PRIORITIES = [
	"passive",
	"active",
	"timeSensitive"
];
const NOTIFY_DELIVERIES = [
	"system",
	"overlay",
	"auto"
];
const NOTIFICATIONS_ACTIONS = [
	"open",
	"dismiss",
	"reply"
];
const CAMERA_FACING = [
	"front",
	"back",
	"both"
];
const LOCATION_ACCURACY = [
	"coarse",
	"balanced",
	"precise"
];
function resolveApproveScopes(commands) {
	return resolveNodePairApprovalScopes(commands);
}
async function resolveNodePairApproveScopes(gatewayOpts, requestId) {
	const pairing = await callGatewayTool("node.pair.list", gatewayOpts, {}, { scopes: ["operator.pairing"] });
	const match = (Array.isArray(pairing?.pending) ? pairing.pending : []).find((entry) => entry?.requestId === requestId);
	if (Array.isArray(match?.requiredApproveScopes)) {
		const scopes = match.requiredApproveScopes.filter((scope) => scope === "operator.pairing" || scope === "operator.write" || scope === "operator.admin");
		if (scopes.length > 0) return scopes;
	}
	return resolveApproveScopes(match?.commands);
}
function isPairingRequiredMessage(message) {
	const lower = normalizeLowercaseStringOrEmpty(message);
	return lower.includes("pairing required") || lower.includes("not_paired");
}
function extractPairingRequestId(message) {
	const match = message.match(/\(requestId:\s*([^)]+)\)/i);
	if (!match) return null;
	const value = (match[1] ?? "").trim();
	return value.length > 0 ? value : null;
}
const NodesToolSchema = Type.Object({
	action: stringEnum(NODES_TOOL_ACTIONS),
	gatewayUrl: Type.Optional(Type.String()),
	gatewayToken: Type.Optional(Type.String()),
	timeoutMs: Type.Optional(Type.Number()),
	node: Type.Optional(Type.String()),
	requestId: Type.Optional(Type.String()),
	title: Type.Optional(Type.String()),
	body: Type.Optional(Type.String()),
	sound: Type.Optional(Type.String()),
	priority: optionalStringEnum(NOTIFY_PRIORITIES),
	delivery: optionalStringEnum(NOTIFY_DELIVERIES),
	facing: optionalStringEnum(CAMERA_FACING, { description: "camera_snap: front/back/both; camera_clip: front/back only." }),
	maxWidth: Type.Optional(Type.Number()),
	quality: Type.Optional(Type.Number()),
	delayMs: Type.Optional(Type.Number()),
	deviceId: Type.Optional(Type.String()),
	limit: Type.Optional(Type.Number()),
	duration: Type.Optional(Type.String()),
	durationMs: Type.Optional(Type.Number({ maximum: 3e5 })),
	includeAudio: Type.Optional(Type.Boolean()),
	fps: Type.Optional(Type.Number()),
	screenIndex: Type.Optional(Type.Number()),
	outPath: Type.Optional(Type.String()),
	maxAgeMs: Type.Optional(Type.Number()),
	locationTimeoutMs: Type.Optional(Type.Number()),
	desiredAccuracy: optionalStringEnum(LOCATION_ACCURACY),
	notificationAction: optionalStringEnum(NOTIFICATIONS_ACTIONS),
	notificationKey: Type.Optional(Type.String()),
	notificationReplyText: Type.Optional(Type.String()),
	invokeCommand: Type.Optional(Type.String()),
	invokeParamsJson: Type.Optional(Type.String()),
	invokeTimeoutMs: Type.Optional(Type.Number())
});
function createNodesTool(options) {
	const agentId = resolveSessionAgentId({
		sessionKey: options?.agentSessionKey,
		config: options?.config
	});
	const imageSanitization = resolveImageSanitizationLimits(options?.config);
	return {
		label: "Nodes",
		name: "nodes",
		ownerOnly: isOpenClawOwnerOnlyCoreToolName("nodes"),
		description: "Discover and control paired nodes (status/describe/pairing/notify/camera/photos/screen/location/notifications/invoke).",
		parameters: NodesToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const action = readStringParam$1(params, "action", { required: true });
			const gatewayOpts = readGatewayCallOptions(params);
			try {
				switch (action) {
					case "status": return jsonResult(await callGatewayTool("node.list", gatewayOpts, {}));
					case "describe": return jsonResult(await callGatewayTool("node.describe", gatewayOpts, { nodeId: await resolveNodeId(gatewayOpts, readStringParam$1(params, "node", { required: true })) }));
					case "pending": return jsonResult(await callGatewayTool("node.pair.list", gatewayOpts, {}));
					case "approve": {
						const requestId = readStringParam$1(params, "requestId", { required: true });
						const scopes = await resolveNodePairApproveScopes(gatewayOpts, requestId);
						return jsonResult(await callGatewayTool("node.pair.approve", gatewayOpts, { requestId }, { scopes }));
					}
					case "reject": return jsonResult(await callGatewayTool("node.pair.reject", gatewayOpts, { requestId: readStringParam$1(params, "requestId", { required: true }) }));
					case "notify": {
						const node = readStringParam$1(params, "node", { required: true });
						const title = typeof params.title === "string" ? params.title : "";
						const body = typeof params.body === "string" ? params.body : "";
						if (!title.trim() && !body.trim()) throw new Error("title or body required");
						await callGatewayTool("node.invoke", gatewayOpts, {
							nodeId: await resolveNodeId(gatewayOpts, node),
							command: "system.notify",
							params: {
								title: title.trim() || void 0,
								body: body.trim() || void 0,
								sound: typeof params.sound === "string" ? params.sound : void 0,
								priority: typeof params.priority === "string" ? params.priority : void 0,
								delivery: typeof params.delivery === "string" ? params.delivery : void 0
							},
							idempotencyKey: crypto.randomUUID()
						});
						return jsonResult({ ok: true });
					}
					case "camera_snap": return await executeNodeMediaAction({
						action,
						params,
						gatewayOpts,
						modelHasVision: options?.modelHasVision,
						imageSanitization
					});
					case "photos_latest": return await executeNodeMediaAction({
						action,
						params,
						gatewayOpts,
						modelHasVision: options?.modelHasVision,
						imageSanitization
					});
					case "camera_list":
					case "notifications_list":
					case "device_status":
					case "device_info":
					case "device_permissions":
					case "device_health": return await executeNodeCommandAction({
						action,
						input: params,
						gatewayOpts,
						allowMediaInvokeCommands: options?.allowMediaInvokeCommands,
						mediaInvokeActions: MEDIA_INVOKE_ACTIONS
					});
					case "notifications_action": return await executeNodeCommandAction({
						action,
						input: params,
						gatewayOpts,
						allowMediaInvokeCommands: options?.allowMediaInvokeCommands,
						mediaInvokeActions: MEDIA_INVOKE_ACTIONS
					});
					case "camera_clip": return await executeNodeMediaAction({
						action,
						params,
						gatewayOpts,
						modelHasVision: options?.modelHasVision,
						imageSanitization
					});
					case "screen_record": return await executeNodeMediaAction({
						action,
						params,
						gatewayOpts,
						modelHasVision: options?.modelHasVision,
						imageSanitization
					});
					case "location_get": return await executeNodeCommandAction({
						action,
						input: params,
						gatewayOpts,
						allowMediaInvokeCommands: options?.allowMediaInvokeCommands,
						mediaInvokeActions: MEDIA_INVOKE_ACTIONS
					});
					case "invoke": return await executeNodeCommandAction({
						action,
						input: params,
						gatewayOpts,
						allowMediaInvokeCommands: options?.allowMediaInvokeCommands,
						mediaInvokeActions: MEDIA_INVOKE_ACTIONS
					});
					default: throw new Error(`Unknown action: ${action}`);
				}
			} catch (err) {
				const nodeLabel = typeof params.node === "string" && params.node.trim() ? params.node.trim() : "auto";
				const gatewayLabel = gatewayOpts.gatewayUrl && gatewayOpts.gatewayUrl.trim() ? gatewayOpts.gatewayUrl.trim() : "default";
				const agentLabel = agentId ?? "unknown";
				let message = formatErrorMessage(err);
				if (action === "invoke" && isPairingRequiredMessage(message)) {
					const requestId = extractPairingRequestId(message);
					message = `pairing required before node invoke. ${requestId ? `Approve pairing request ${requestId} and retry.` : "Approve the pending pairing request and retry."}`;
				}
				throw new Error(`agent=${agentLabel} node=${nodeLabel} gateway=${gatewayLabel} action=${action}: ${message}`, { cause: err });
			}
		}
	};
}
//#endregion
//#region src/agents/tools/pdf-native-providers.ts
/**
* Direct SDK/HTTP calls for providers that support native PDF document input.
* This bypasses pi-ai's content type system which does not have a "document" type.
*/
async function anthropicAnalyzePdf(params) {
	const apiKey = normalizeSecretInput(params.apiKey);
	if (!apiKey) throw new Error("Anthropic PDF: apiKey required");
	const content = [];
	for (const pdf of params.pdfs) content.push({
		type: "document",
		source: {
			type: "base64",
			media_type: "application/pdf",
			data: pdf.base64
		}
	});
	content.push({
		type: "text",
		text: params.prompt
	});
	const baseUrl = (params.baseUrl ?? "https://api.anthropic.com").replace(/\/+$/, "");
	const res = await fetch(`${baseUrl}/v1/messages`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
			"anthropic-beta": "pdfs-2024-09-25"
		},
		body: JSON.stringify({
			model: params.modelId,
			max_tokens: params.maxTokens ?? 4096,
			messages: [{
				role: "user",
				content
			}]
		})
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Anthropic PDF request failed (${res.status} ${res.statusText})${body ? `: ${body.slice(0, 400)}` : ""}`);
	}
	const json = await res.json().catch(() => null);
	if (!isRecord(json)) throw new Error("Anthropic PDF response was not JSON.");
	const responseContent = json.content;
	if (!Array.isArray(responseContent)) throw new Error("Anthropic PDF response missing content array.");
	const text = responseContent.filter((block) => block.type === "text" && typeof block.text === "string").map((block) => block.text).join("");
	if (!text.trim()) throw new Error("Anthropic PDF returned no text.");
	return text.trim();
}
async function geminiAnalyzePdf(params) {
	const apiKey = normalizeSecretInput(params.apiKey);
	if (!apiKey) throw new Error("Gemini PDF: apiKey required");
	const parts = [];
	for (const pdf of params.pdfs) parts.push({ inline_data: {
		mime_type: "application/pdf",
		data: pdf.base64
	} });
	parts.push({ text: params.prompt });
	const url = `${((normalizeProviderTransportWithPlugin({
		provider: "google",
		context: {
			provider: "google",
			api: "google-generative-ai",
			baseUrl: params.baseUrl
		}
	}) ?? { baseUrl: params.baseUrl }).baseUrl ?? "https://generativelanguage.googleapis.com/v1beta").replace(/\/v1beta$/i, "")}/v1beta/models/${encodeURIComponent(params.modelId)}:generateContent?key=${encodeURIComponent(apiKey)}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ contents: [{
			role: "user",
			parts
		}] })
	});
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`Gemini PDF request failed (${res.status} ${res.statusText})${body ? `: ${body.slice(0, 400)}` : ""}`);
	}
	const json = await res.json().catch(() => null);
	if (!isRecord(json)) throw new Error("Gemini PDF response was not JSON.");
	const candidates = json.candidates;
	if (!Array.isArray(candidates) || candidates.length === 0) throw new Error("Gemini PDF returned no candidates.");
	const text = (candidates[0].content?.parts?.filter((p) => typeof p.text === "string") ?? []).map((p) => p.text).join("");
	if (!text.trim()) throw new Error("Gemini PDF returned no text.");
	return text.trim();
}
//#endregion
//#region src/agents/tools/pdf-tool.helpers.ts
function resolvePdfInputs(record) {
	const pdfCandidates = [];
	if (typeof record.pdf === "string") pdfCandidates.push(record.pdf);
	if (Array.isArray(record.pdfs)) pdfCandidates.push(...record.pdfs.filter((v) => typeof v === "string"));
	const seenPdfs = /* @__PURE__ */ new Set();
	const pdfInputs = [];
	for (const candidate of pdfCandidates) {
		const trimmed = candidate.trim();
		if (!trimmed || seenPdfs.has(trimmed)) continue;
		seenPdfs.add(trimmed);
		pdfInputs.push(trimmed);
	}
	if (pdfInputs.length === 0) throw new Error("pdf required: provide a path or URL to a PDF document");
	return pdfInputs;
}
/**
* Check whether a provider supports native PDF document input.
*/
function providerSupportsNativePdf(provider) {
	return bundledProviderSupportsNativePdfDocument(provider);
}
/**
* Parse a page range string (e.g. "1-5", "3", "1-3,7-9") into an array of 1-based page numbers.
*/
function parsePageRange(range, maxPages) {
	const pages = /* @__PURE__ */ new Set();
	const parts = range.split(",").map((p) => p.trim());
	for (const part of parts) {
		if (!part) continue;
		const dashMatch = /^(\d+)\s*-\s*(\d+)$/.exec(part);
		if (dashMatch) {
			const start = Number(dashMatch[1]);
			const end = Number(dashMatch[2]);
			if (!Number.isFinite(start) || !Number.isFinite(end) || start < 1 || end < start) throw new Error(`Invalid page range: "${part}"`);
			for (let i = start; i <= Math.min(end, maxPages); i++) pages.add(i);
		} else {
			const num = Number(part);
			if (!Number.isFinite(num) || num < 1) throw new Error(`Invalid page number: "${part}"`);
			if (num <= maxPages) pages.add(num);
		}
	}
	return Array.from(pages).toSorted((a, b) => a - b);
}
function coercePdfAssistantText(params) {
	const label = `${params.provider}/${params.model}`;
	const errorMessage = params.message.errorMessage?.trim();
	const fail = (message) => {
		throw new Error(message ? `PDF model failed (${label}): ${message}` : `PDF model failed (${label})`);
	};
	if (params.message.stopReason === "error" || params.message.stopReason === "aborted") fail(errorMessage);
	if (errorMessage) fail(errorMessage);
	const trimmed = extractAssistantText(params.message).trim();
	if (trimmed) return trimmed;
	throw new Error(`PDF model returned no text (${label}).`);
}
function coercePdfModelConfig(cfg) {
	const primary = resolveAgentModelPrimaryValue(cfg?.agents?.defaults?.pdfModel);
	const fallbacks = resolveAgentModelFallbackValues(cfg?.agents?.defaults?.pdfModel);
	const modelConfig = {};
	if (primary?.trim()) modelConfig.primary = primary.trim();
	if (fallbacks.length > 0) modelConfig.fallbacks = fallbacks;
	return modelConfig;
}
function resolvePdfToolMaxTokens(modelMaxTokens, requestedMaxTokens = 4096) {
	if (typeof modelMaxTokens !== "number" || !Number.isFinite(modelMaxTokens) || modelMaxTokens <= 0) return requestedMaxTokens;
	return Math.min(requestedMaxTokens, modelMaxTokens);
}
//#endregion
//#region src/agents/tools/pdf-tool.model-config.ts
function resolveBundledImageCandidateRefs(params) {
	return resolveBundledAutoMediaKeyProviders("image").filter((providerId) => !params.filter || params.filter(providerId)).filter((providerId) => hasAuthForProvider({
		provider: providerId,
		agentDir: params.agentDir
	})).map((providerId) => {
		const modelId = resolveProviderVisionModelFromConfig({
			cfg: params.cfg,
			provider: providerId
		})?.split("/")[1] ?? resolveBundledDefaultMediaModel({
			providerId,
			capability: "image"
		});
		return modelId ? `${providerId}/${modelId}` : null;
	}).filter((value) => Boolean(value));
}
function resolvePdfModelConfigForTool(params) {
	const explicitPdf = coercePdfModelConfig(params.cfg);
	if (explicitPdf.primary?.trim() || (explicitPdf.fallbacks?.length ?? 0) > 0) return explicitPdf;
	const explicitImage = coerceImageModelConfig(params.cfg);
	if (explicitImage.primary?.trim() || (explicitImage.fallbacks?.length ?? 0) > 0) return explicitImage;
	const primary = resolveDefaultModelRef(params.cfg);
	const googleOk = hasAuthForProvider({
		provider: "google",
		agentDir: params.agentDir
	});
	const fallbacks = [];
	const addFallback = (ref) => {
		const trimmed = ref.trim();
		if (trimmed && !fallbacks.includes(trimmed)) fallbacks.push(trimmed);
	};
	let preferred = null;
	const providerOk = hasAuthForProvider({
		provider: primary.provider,
		agentDir: params.agentDir
	});
	const providerVision = resolveProviderVisionModelFromConfig({
		cfg: params.cfg,
		provider: primary.provider
	});
	const providerDefault = providerVision?.split("/")[1] ?? resolveBundledDefaultMediaModel({
		providerId: primary.provider,
		capability: "image"
	});
	const primarySupportsNativePdf = bundledProviderSupportsNativePdfDocument(primary.provider);
	const nativePdfCandidates = resolveBundledImageCandidateRefs({
		cfg: params.cfg,
		agentDir: params.agentDir,
		filter: bundledProviderSupportsNativePdfDocument
	});
	const genericImageCandidates = resolveBundledImageCandidateRefs({
		cfg: params.cfg,
		agentDir: params.agentDir
	});
	if (params.cfg?.models?.providers && typeof params.cfg.models.providers === "object") for (const [providerKey, providerCfg] of Object.entries(params.cfg.models.providers)) {
		const providerId = providerKey.trim();
		if (!providerId || !hasAuthForProvider({
			provider: providerId,
			agentDir: params.agentDir
		})) continue;
		const modelId = (providerCfg?.models ?? []).find((model) => Boolean(model?.id?.trim()) && Array.isArray(model?.input) && model.input.includes("image"))?.id?.trim();
		if (!modelId) continue;
		const ref = `${providerId}/${modelId}`;
		if (!genericImageCandidates.includes(ref)) genericImageCandidates.push(ref);
	}
	if (primary.provider === "google" && googleOk && providerVision && primarySupportsNativePdf) preferred = providerVision;
	else if (providerOk && primarySupportsNativePdf && (providerVision || providerDefault)) preferred = providerVision ?? `${primary.provider}/${providerDefault}`;
	else preferred = nativePdfCandidates[0] ?? genericImageCandidates[0] ?? null;
	if (preferred?.trim()) {
		for (const candidate of [...nativePdfCandidates, ...genericImageCandidates]) if (candidate !== preferred) addFallback(candidate);
		const pruned = fallbacks.filter((ref) => ref !== preferred);
		return {
			primary: preferred,
			...pruned.length > 0 ? { fallbacks: pruned } : {}
		};
	}
	return null;
}
//#endregion
//#region src/agents/tools/pdf-tool.ts
const DEFAULT_PROMPT = "Analyze this PDF document.";
const DEFAULT_MAX_PDFS = 10;
const DEFAULT_MAX_BYTES_MB = 10;
const DEFAULT_MAX_PAGES = 20;
const PDF_MIN_TEXT_CHARS = 200;
const PDF_MAX_PIXELS = 4e6;
const PdfToolSchema = Type.Object({
	prompt: Type.Optional(Type.String()),
	pdf: Type.Optional(Type.String({ description: "Single PDF path or URL." })),
	pdfs: Type.Optional(Type.Array(Type.String(), { description: "Multiple PDF paths or URLs (up to 10)." })),
	pages: Type.Optional(Type.String({ description: "Page range to process, e.g. \"1-5\", \"1,3,5-7\". Defaults to all pages." })),
	model: Type.Optional(Type.String()),
	maxBytesMb: Type.Optional(Type.Number())
});
function buildPdfExtractionContext(prompt, extractions) {
	const content = [];
	for (let i = 0; i < extractions.length; i++) {
		const extraction = extractions[i];
		if (extraction.text.trim()) {
			const label = extractions.length > 1 ? `[PDF ${i + 1} text]\n` : "[PDF text]\n";
			content.push({
				type: "text",
				text: label + extraction.text
			});
		}
		for (const img of extraction.images) content.push({
			type: "image",
			data: img.data,
			mimeType: img.mimeType
		});
	}
	content.push({
		type: "text",
		text: prompt
	});
	return { messages: [{
		role: "user",
		content,
		timestamp: Date.now()
	}] };
}
async function runPdfPrompt(params) {
	const effectiveCfg = applyImageModelConfigDefaults(params.cfg, params.pdfModelConfig);
	await ensureOpenClawModelsJson(effectiveCfg, params.agentDir);
	const authStorage = discoverAuthStorage(params.agentDir);
	const modelRegistry = discoverModels(authStorage, params.agentDir);
	let extractionCache = null;
	const getExtractions = async () => {
		if (!extractionCache) extractionCache = await params.getExtractions();
		return extractionCache;
	};
	const result = await runWithImageModelFallback({
		cfg: effectiveCfg,
		modelOverride: params.modelOverride,
		run: async (provider, modelId) => {
			const model = resolveModelFromRegistry({
				modelRegistry,
				provider,
				modelId
			});
			const apiKey = await resolveModelRuntimeApiKey({
				model,
				cfg: effectiveCfg,
				agentDir: params.agentDir,
				authStorage
			});
			if (providerSupportsNativePdf(provider)) {
				if (params.pageNumbers && params.pageNumbers.length > 0) throw new Error(`pages is not supported with native PDF providers (${provider}/${modelId}). Remove pages, or use a non-native model for page filtering.`);
				const pdfs = params.pdfBuffers.map((p) => ({
					base64: p.base64,
					filename: p.filename
				}));
				if (provider === "anthropic") return {
					text: await anthropicAnalyzePdf({
						apiKey,
						modelId,
						prompt: params.prompt,
						pdfs,
						maxTokens: resolvePdfToolMaxTokens(model.maxTokens),
						baseUrl: model.baseUrl
					}),
					provider,
					model: modelId,
					native: true
				};
				if (provider === "google") return {
					text: await geminiAnalyzePdf({
						apiKey,
						modelId,
						prompt: params.prompt,
						pdfs,
						baseUrl: model.baseUrl
					}),
					provider,
					model: modelId,
					native: true
				};
			}
			const extractions = await getExtractions();
			if (extractions.some((e) => e.images.length > 0) && !model.input?.includes("image")) {
				if (!extractions.some((e) => e.text.trim().length > 0)) throw new Error(`Model ${provider}/${modelId} does not support images and PDF has no extractable text.`);
				const textOnlyExtractions = extractions.map((e) => ({
					text: e.text,
					images: []
				}));
				return {
					text: coercePdfAssistantText({
						message: await complete(model, buildPdfExtractionContext(params.prompt, textOnlyExtractions), {
							apiKey,
							maxTokens: resolvePdfToolMaxTokens(model.maxTokens)
						}),
						provider,
						model: modelId
					}),
					provider,
					model: modelId,
					native: false
				};
			}
			return {
				text: coercePdfAssistantText({
					message: await complete(model, buildPdfExtractionContext(params.prompt, extractions), {
						apiKey,
						maxTokens: resolvePdfToolMaxTokens(model.maxTokens)
					}),
					provider,
					model: modelId
				}),
				provider,
				model: modelId,
				native: false
			};
		}
	});
	return {
		text: result.result.text,
		provider: result.result.provider,
		model: result.result.model,
		native: result.result.native,
		attempts: result.attempts.map((a) => ({
			provider: a.provider,
			model: a.model,
			error: a.error
		}))
	};
}
function createPdfTool(options) {
	const agentDir = options?.agentDir?.trim();
	if (!agentDir) {
		const explicit = coercePdfModelConfig(options?.config);
		if (explicit.primary?.trim() || (explicit.fallbacks?.length ?? 0) > 0) throw new Error("createPdfTool requires agentDir when enabled");
		return null;
	}
	const pdfModelConfig = resolvePdfModelConfigForTool({
		cfg: options?.config,
		agentDir
	});
	if (!pdfModelConfig) return null;
	const maxBytesMbDefault = (options?.config?.agents?.defaults)?.pdfMaxBytesMb;
	const maxPagesDefault = (options?.config?.agents?.defaults)?.pdfMaxPages;
	const configuredMaxBytesMb = typeof maxBytesMbDefault === "number" && Number.isFinite(maxBytesMbDefault) ? maxBytesMbDefault : DEFAULT_MAX_BYTES_MB;
	const configuredMaxPages = typeof maxPagesDefault === "number" && Number.isFinite(maxPagesDefault) ? Math.floor(maxPagesDefault) : DEFAULT_MAX_PAGES;
	return {
		label: "PDF",
		name: "pdf",
		description: "Analyze one or more PDF documents with a model. Supports native PDF analysis for Anthropic and Google models, with text/image extraction fallback for other providers. Use pdf for a single path/URL, or pdfs for multiple (up to 10). Provide a prompt describing what to analyze.",
		parameters: PdfToolSchema,
		execute: async (_toolCallId, args) => {
			const record = args && typeof args === "object" ? args : {};
			const pdfInputs = resolvePdfInputs(record);
			if (pdfInputs.length > DEFAULT_MAX_PDFS) return {
				content: [{
					type: "text",
					text: `Too many PDFs: ${pdfInputs.length} provided, maximum is ${DEFAULT_MAX_PDFS}. Please reduce the number.`
				}],
				details: {
					error: "too_many_pdfs",
					count: pdfInputs.length,
					max: DEFAULT_MAX_PDFS
				}
			};
			const { prompt: promptRaw, modelOverride } = resolvePromptAndModelOverride(record, DEFAULT_PROMPT);
			const maxBytesMbRaw = typeof record.maxBytesMb === "number" ? record.maxBytesMb : void 0;
			const maxBytes = Math.floor((typeof maxBytesMbRaw === "number" && Number.isFinite(maxBytesMbRaw) && maxBytesMbRaw > 0 ? maxBytesMbRaw : configuredMaxBytesMb) * 1024 * 1024);
			const pagesRaw = normalizeOptionalString(record.pages);
			const sandboxConfig = options?.sandbox && options.sandbox.root.trim() ? {
				root: options.sandbox.root.trim(),
				bridge: options.sandbox.bridge,
				workspaceOnly: options.fsPolicy?.workspaceOnly === true
			} : null;
			const loadedPdfs = [];
			for (const pdfRaw of pdfInputs) {
				const trimmed = pdfRaw.trim();
				const isHttpUrl = /^https?:\/\//i.test(trimmed);
				const isFileUrl = /^file:/i.test(trimmed);
				const isDataUrl = /^data:/i.test(trimmed);
				const looksLikeWindowsDrive = /^[a-zA-Z]:[\\/]/.test(trimmed);
				if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) && !looksLikeWindowsDrive && !isFileUrl && !isHttpUrl && !isDataUrl) return {
					content: [{
						type: "text",
						text: `Unsupported PDF reference: ${pdfRaw}. Use a file path, file:// URL, or http(s) URL.`
					}],
					details: {
						error: "unsupported_pdf_reference",
						pdf: pdfRaw
					}
				};
				if (sandboxConfig && isHttpUrl) throw new Error("Sandboxed PDF tool does not allow remote URLs.");
				const resolvedPdf = (() => {
					if (sandboxConfig) return trimmed;
					if (trimmed.startsWith("~")) return resolveUserPath(trimmed);
					return trimmed;
				})();
				const resolvedPathInfo = sandboxConfig ? await resolveSandboxedBridgeMediaPath({
					sandbox: sandboxConfig,
					mediaPath: resolvedPdf,
					inboundFallbackDir: "media/inbound"
				}) : { resolved: resolvedPdf.startsWith("file://") ? resolvedPdf.slice(7) : resolvedPdf };
				const localRoots = resolveMediaToolLocalRoots(options?.workspaceDir, { workspaceOnly: options?.fsPolicy?.workspaceOnly === true }, [resolvedPathInfo.resolved]);
				const media = sandboxConfig ? await loadWebMediaRaw(resolvedPathInfo.resolved, {
					maxBytes,
					sandboxValidated: true,
					readFile: createSandboxBridgeReadFile({ sandbox: sandboxConfig })
				}) : await loadWebMediaRaw(resolvedPathInfo.resolved, {
					maxBytes,
					localRoots
				});
				if (media.kind !== "document") {
					const ct = normalizeLowercaseStringOrEmpty(media.contentType);
					if (!ct.includes("pdf") && !ct.includes("application/pdf")) throw new Error(`Expected PDF but got ${media.contentType ?? media.kind}: ${pdfRaw}`);
				}
				const base64 = media.buffer.toString("base64");
				const filename = media.fileName ?? (isHttpUrl ? new URL(trimmed).pathname.split("/").pop() ?? "document.pdf" : "document.pdf");
				loadedPdfs.push({
					base64,
					buffer: media.buffer,
					filename,
					resolvedPath: resolvedPathInfo.resolved,
					...resolvedPathInfo.rewrittenFrom ? { rewrittenFrom: resolvedPathInfo.rewrittenFrom } : {}
				});
			}
			const pageNumbers = pagesRaw ? parsePageRange(pagesRaw, configuredMaxPages) : void 0;
			const getExtractions = async () => {
				const extractedAll = [];
				for (const pdf of loadedPdfs) {
					const extracted = await extractPdfContent({
						buffer: pdf.buffer,
						maxPages: configuredMaxPages,
						maxPixels: PDF_MAX_PIXELS,
						minTextChars: PDF_MIN_TEXT_CHARS,
						pageNumbers
					});
					extractedAll.push(extracted);
				}
				return extractedAll;
			};
			const result = await runPdfPrompt({
				cfg: options?.config,
				agentDir,
				pdfModelConfig,
				modelOverride,
				prompt: promptRaw,
				pdfBuffers: loadedPdfs.map((p) => ({
					base64: p.base64,
					filename: p.filename
				})),
				pageNumbers,
				getExtractions
			});
			const pdfDetails = loadedPdfs.length === 1 ? {
				pdf: loadedPdfs[0].resolvedPath,
				...loadedPdfs[0].rewrittenFrom ? { rewrittenFrom: loadedPdfs[0].rewrittenFrom } : {}
			} : { pdfs: loadedPdfs.map((p) => ({
				pdf: p.resolvedPath,
				...p.rewrittenFrom ? { rewrittenFrom: p.rewrittenFrom } : {}
			})) };
			return buildTextToolResult(result, {
				native: result.native,
				...pdfDetails
			});
		}
	};
}
//#endregion
//#region src/agents/tools/session-status-tool.ts
const SessionStatusToolSchema = Type.Object({
	sessionKey: Type.Optional(Type.String()),
	model: Type.Optional(Type.String())
});
let commandsStatusRuntimePromise = null;
function loadCommandsStatusRuntime() {
	commandsStatusRuntimePromise ??= import("./session-status.runtime-DIMwsZ03.js");
	return commandsStatusRuntimePromise;
}
function resolveSessionEntry(params) {
	const keyRaw = params.keyRaw.trim();
	if (!keyRaw) return null;
	const includeAliasFallback = params.includeAliasFallback ?? true;
	const internal = resolveInternalSessionKey({
		key: keyRaw,
		alias: params.alias,
		mainKey: params.mainKey,
		requesterInternalKey: params.requesterInternalKey
	});
	const candidates = [keyRaw];
	if (!keyRaw.startsWith("agent:")) candidates.push(`agent:${DEFAULT_AGENT_ID}:${keyRaw}`);
	if (includeAliasFallback && internal !== keyRaw) candidates.push(internal);
	if (includeAliasFallback && !keyRaw.startsWith("agent:")) {
		const agentInternal = `agent:${DEFAULT_AGENT_ID}:${internal}`;
		if (agentInternal !== `agent:main:${keyRaw}`) candidates.push(agentInternal);
	}
	if (includeAliasFallback && (keyRaw === "main" || keyRaw === "current")) {
		const defaultMainKey = buildAgentMainSessionKey({
			agentId: DEFAULT_AGENT_ID,
			mainKey: params.mainKey
		});
		if (!candidates.includes(defaultMainKey)) candidates.push(defaultMainKey);
	}
	for (const key of candidates) {
		const entry = params.store[key];
		if (entry) return {
			key,
			entry
		};
	}
	return null;
}
function resolveStoreScopedRequesterKey(params) {
	const parsed = parseAgentSessionKey(params.requesterKey);
	if (!parsed || parsed.agentId !== params.agentId) return params.requesterKey;
	return parsed.rest === params.mainKey ? params.mainKey : params.requesterKey;
}
function formatSessionTaskLine(params) {
	const snapshot = buildTaskStatusSnapshotForRelatedSessionKeyForOwner({
		relatedSessionKey: params.relatedSessionKey,
		callerOwnerKey: params.callerOwnerKey
	});
	const task = snapshot.focus;
	if (!task) return;
	const headline = snapshot.activeCount > 0 ? `${snapshot.activeCount} active` : snapshot.recentFailureCount > 0 ? `${snapshot.recentFailureCount} recent failure${snapshot.recentFailureCount === 1 ? "" : "s"}` : `latest ${task.status.replaceAll("_", " ")}`;
	const title = formatTaskStatusTitle(task);
	const detail = formatTaskStatusDetail(task);
	const parts = [
		headline,
		task.runtime,
		title,
		detail
	].filter(Boolean);
	return parts.length ? `📌 Tasks: ${parts.join(" · ")}` : void 0;
}
async function resolveModelOverride(params) {
	const raw = params.raw.trim();
	if (!raw) return { kind: "reset" };
	if (normalizeOptionalLowercaseString(raw) === "default") return { kind: "reset" };
	const configDefault = resolveDefaultModelForAgent({
		cfg: params.cfg,
		agentId: params.agentId
	});
	const currentProvider = params.sessionEntry?.providerOverride?.trim() || configDefault.provider;
	const currentModel = params.sessionEntry?.modelOverride?.trim() || configDefault.model;
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: currentProvider
	});
	const catalog = await loadModelCatalog({ config: params.cfg });
	const allowed = buildAllowedModelSet({
		cfg: params.cfg,
		catalog,
		defaultProvider: currentProvider,
		defaultModel: currentModel,
		agentId: params.agentId
	});
	const resolved = resolveModelRefFromString({
		raw,
		defaultProvider: currentProvider,
		aliasIndex
	});
	if (!resolved) throw new Error(`Unrecognized model "${raw}".`);
	const key = modelKey(resolved.ref.provider, resolved.ref.model);
	if (allowed.allowedKeys.size > 0 && !allowed.allowedKeys.has(key)) throw new Error(`Model "${key}" is not allowed.`);
	const isDefault = resolved.ref.provider === configDefault.provider && resolved.ref.model === configDefault.model;
	return {
		kind: "set",
		provider: resolved.ref.provider,
		model: resolved.ref.model,
		isDefault
	};
}
function createSessionStatusTool(opts) {
	return {
		label: "Session Status",
		name: "session_status",
		displaySummary: SESSION_STATUS_TOOL_DISPLAY_SUMMARY,
		description: describeSessionStatusTool(),
		parameters: SessionStatusToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const cfg = opts?.config ?? loadConfig();
			const { mainKey, alias, effectiveRequesterKey } = resolveSandboxedSessionToolContext({
				cfg,
				agentSessionKey: opts?.agentSessionKey,
				sandboxed: opts?.sandboxed
			});
			const a2aPolicy = createAgentToAgentPolicy(cfg);
			const requesterAgentId = resolveAgentIdFromSessionKey(opts?.agentSessionKey ?? effectiveRequesterKey);
			const visibilityRequesterKey = (opts?.agentSessionKey ?? effectiveRequesterKey).trim();
			const usesLegacyMainAlias = alias === mainKey;
			const isLegacyMainVisibilityKey = (sessionKey) => {
				const trimmed = sessionKey.trim();
				return usesLegacyMainAlias && (trimmed === "main" || trimmed === mainKey);
			};
			const resolveVisibilityMainSessionKey = (sessionAgentId) => {
				const requesterParsed = parseAgentSessionKey(visibilityRequesterKey);
				if (resolveAgentIdFromSessionKey(visibilityRequesterKey) === sessionAgentId && (requesterParsed?.rest === mainKey || isLegacyMainVisibilityKey(visibilityRequesterKey))) return visibilityRequesterKey;
				return buildAgentMainSessionKey({
					agentId: sessionAgentId,
					mainKey
				});
			};
			const normalizeVisibilityTargetSessionKey = (sessionKey, sessionAgentId) => {
				const trimmed = sessionKey.trim();
				if (!trimmed) return trimmed;
				if (trimmed.startsWith("agent:")) {
					if (parseAgentSessionKey(trimmed)?.rest === mainKey) return resolveVisibilityMainSessionKey(sessionAgentId);
					return trimmed;
				}
				if (isLegacyMainVisibilityKey(trimmed)) return resolveVisibilityMainSessionKey(sessionAgentId);
				return trimmed;
			};
			const visibilityGuard = await createSessionVisibilityGuard({
				action: "status",
				requesterSessionKey: visibilityRequesterKey,
				visibility: resolveEffectiveSessionToolsVisibility({
					cfg,
					sandboxed: opts?.sandboxed === true
				}),
				a2aPolicy
			});
			let requestedKeyRaw = readStringParam$1(params, "sessionKey") ?? opts?.agentSessionKey;
			const requestedKeyInput = requestedKeyRaw?.trim() ?? "";
			let resolvedViaSessionId = false;
			if (!requestedKeyRaw?.trim()) throw new Error("sessionKey required");
			const ensureAgentAccess = (targetAgentId) => {
				if (targetAgentId === requesterAgentId) return;
				if (!a2aPolicy.enabled) throw new Error("Agent-to-agent status is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent access.");
				if (!a2aPolicy.isAllowed(requesterAgentId, targetAgentId)) throw new Error("Agent-to-agent session status denied by tools.agentToAgent.allow.");
			};
			if (requestedKeyRaw.startsWith("agent:")) {
				const requestedAgentId = resolveAgentIdFromSessionKey(requestedKeyRaw);
				ensureAgentAccess(requestedAgentId);
				const access = visibilityGuard.check(normalizeVisibilityTargetSessionKey(requestedKeyRaw, requestedAgentId));
				if (!access.allowed) throw new Error(access.error);
			}
			let agentId = requestedKeyRaw.startsWith("agent:") ? resolveAgentIdFromSessionKey(requestedKeyRaw) : requesterAgentId;
			let storePath = resolveStorePath(cfg.session?.store, { agentId });
			let store = loadSessionStore(storePath);
			let storeScopedRequesterKey = resolveStoreScopedRequesterKey({
				requesterKey: effectiveRequesterKey,
				agentId,
				mainKey
			});
			let resolved = resolveSessionEntry({
				store,
				keyRaw: requestedKeyRaw,
				alias,
				mainKey,
				requesterInternalKey: storeScopedRequesterKey,
				includeAliasFallback: requestedKeyRaw !== "current"
			});
			if (!resolved && (requestedKeyRaw === "current" || shouldResolveSessionIdInput(requestedKeyRaw))) {
				const resolvedSession = await resolveSessionReference({
					sessionKey: requestedKeyRaw,
					alias,
					mainKey,
					requesterInternalKey: effectiveRequesterKey,
					restrictToSpawned: opts?.sandboxed === true
				});
				if (resolvedSession.ok && resolvedSession.resolvedViaSessionId) {
					const visibleSession = await resolveVisibleSessionReference({
						resolvedSession,
						requesterSessionKey: effectiveRequesterKey,
						restrictToSpawned: opts?.sandboxed === true,
						visibilitySessionKey: requestedKeyRaw
					});
					if (!visibleSession.ok) throw new Error("Session status visibility is restricted to the current session tree.");
					ensureAgentAccess(resolveAgentIdFromSessionKey(visibleSession.key));
					resolvedViaSessionId = true;
					requestedKeyRaw = visibleSession.key;
					agentId = resolveAgentIdFromSessionKey(visibleSession.key);
					storePath = resolveStorePath(cfg.session?.store, { agentId });
					store = loadSessionStore(storePath);
					storeScopedRequesterKey = resolveStoreScopedRequesterKey({
						requesterKey: effectiveRequesterKey,
						agentId,
						mainKey
					});
					resolved = resolveSessionEntry({
						store,
						keyRaw: requestedKeyRaw,
						alias,
						mainKey,
						requesterInternalKey: storeScopedRequesterKey
					});
				} else if (!resolvedSession.ok && opts?.sandboxed === true) throw new Error("Session status visibility is restricted to the current session tree.");
			}
			if (!resolved && requestedKeyRaw === "current") resolved = resolveSessionEntry({
				store,
				keyRaw: requestedKeyRaw,
				alias,
				mainKey,
				requesterInternalKey: storeScopedRequesterKey,
				includeAliasFallback: true
			});
			if (!resolved) {
				const kind = shouldResolveSessionIdInput(requestedKeyRaw) ? "sessionId" : "sessionKey";
				throw new Error(`Unknown ${kind}: ${requestedKeyRaw}`);
			}
			const visibilityTargetKey = !resolvedViaSessionId && (requestedKeyInput === "current" || resolved.key === requestedKeyInput) ? visibilityRequesterKey : normalizeVisibilityTargetSessionKey(resolved.key, agentId);
			const access = visibilityGuard.check(visibilityTargetKey);
			if (!access.allowed) throw new Error(access.error);
			const configured = resolveDefaultModelForAgent({
				cfg,
				agentId
			});
			const modelRaw = readStringParam$1(params, "model");
			let changedModel = false;
			if (typeof modelRaw === "string") {
				const selection = await resolveModelOverride({
					cfg,
					raw: modelRaw,
					sessionEntry: resolved.entry,
					agentId
				});
				const nextEntry = { ...resolved.entry };
				if (applyModelOverrideToSessionEntry({
					entry: nextEntry,
					selection: selection.kind === "reset" ? {
						provider: configured.provider,
						model: configured.model,
						isDefault: true
					} : {
						provider: selection.provider,
						model: selection.model,
						isDefault: selection.isDefault
					},
					markLiveSwitchPending: true
				}).updated) {
					store[resolved.key] = nextEntry;
					await updateSessionStore(storePath, (nextStore) => {
						nextStore[resolved.key] = nextEntry;
					});
					resolved.entry = nextEntry;
					changedModel = true;
				}
			}
			const runtimeModelIdentity = resolveSessionModelIdentityRef(cfg, resolved.entry, agentId, `${configured.provider}/${configured.model}`);
			const hasExplicitModelOverride = Boolean(resolved.entry.providerOverride?.trim() || resolved.entry.modelOverride?.trim());
			const runtimeProviderForCard = runtimeModelIdentity.provider?.trim();
			const runtimeModelForCard = runtimeModelIdentity.model.trim();
			const defaultProviderForCard = hasExplicitModelOverride ? configured.provider : runtimeProviderForCard ?? "";
			const defaultModelForCard = hasExplicitModelOverride ? configured.model : runtimeModelForCard || configured.model;
			const statusSessionEntry = !hasExplicitModelOverride && !runtimeProviderForCard && runtimeModelForCard ? {
				...resolved.entry,
				providerOverride: ""
			} : resolved.entry;
			const providerForCard = statusSessionEntry.providerOverride?.trim() ?? defaultProviderForCard;
			const primaryModelLabel = providerForCard && defaultModelForCard ? `${providerForCard}/${defaultModelForCard}` : defaultModelForCard;
			const isGroup = statusSessionEntry.chatType === "group" || statusSessionEntry.chatType === "channel" || resolved.key.includes(":group:") || resolved.key.includes(":channel:");
			const taskLine = formatSessionTaskLine({
				relatedSessionKey: resolved.key,
				callerOwnerKey: visibilityRequesterKey
			});
			const { buildStatusText } = await loadCommandsStatusRuntime();
			const statusText = await buildStatusText({
				cfg,
				sessionEntry: statusSessionEntry,
				sessionKey: resolved.key,
				parentSessionKey: statusSessionEntry.parentSessionKey,
				sessionScope: cfg.session?.scope,
				storePath,
				statusChannel: statusSessionEntry.channel ?? statusSessionEntry.lastChannel ?? statusSessionEntry.origin?.provider ?? "unknown",
				provider: providerForCard,
				model: defaultModelForCard,
				resolvedThinkLevel: statusSessionEntry.thinkingLevel,
				resolvedFastMode: statusSessionEntry.fastMode,
				resolvedVerboseLevel: statusSessionEntry.verboseLevel ?? "off",
				resolvedReasoningLevel: statusSessionEntry.reasoningLevel ?? "off",
				resolvedElevatedLevel: statusSessionEntry.elevatedLevel,
				resolveDefaultThinkingLevel: async () => cfg.agents?.defaults?.thinkingDefault,
				isGroup,
				defaultGroupActivation: () => "mention",
				taskLineOverride: taskLine,
				skipDefaultTaskLookup: true,
				primaryModelLabelOverride: primaryModelLabel,
				...providerForCard ? {} : { modelAuthOverride: void 0 },
				includeTranscriptUsage: true
			});
			const fullStatusText = taskLine && !statusText.includes(taskLine) ? `${statusText}\n${taskLine}` : statusText;
			return {
				content: [{
					type: "text",
					text: fullStatusText
				}],
				details: {
					ok: true,
					sessionKey: resolved.key,
					changedModel,
					statusText: fullStatusText
				}
			};
		}
	};
}
//#endregion
//#region src/agents/tools/sessions-history-tool.ts
const SessionsHistoryToolSchema = Type.Object({
	sessionKey: Type.String(),
	limit: Type.Optional(Type.Number({ minimum: 1 })),
	includeTools: Type.Optional(Type.Boolean())
});
const SESSIONS_HISTORY_MAX_BYTES = 80 * 1024;
const SESSIONS_HISTORY_TEXT_MAX_CHARS = 4e3;
function truncateHistoryText(text) {
	const sanitized = redactSensitiveText(text);
	const redacted = sanitized !== text;
	if (sanitized.length <= SESSIONS_HISTORY_TEXT_MAX_CHARS) return {
		text: sanitized,
		truncated: false,
		redacted
	};
	return {
		text: `${truncateUtf16Safe(sanitized, SESSIONS_HISTORY_TEXT_MAX_CHARS)}\n…(truncated)…`,
		truncated: true,
		redacted
	};
}
function sanitizeHistoryContentBlock(block) {
	if (!block || typeof block !== "object") return {
		block,
		truncated: false,
		redacted: false
	};
	const entry = { ...block };
	let truncated = false;
	let redacted = false;
	const type = typeof entry.type === "string" ? entry.type : "";
	if (typeof entry.text === "string") {
		const res = truncateHistoryText(entry.text);
		entry.text = res.text;
		truncated ||= res.truncated;
		redacted ||= res.redacted;
	}
	if (type === "thinking") {
		if (typeof entry.thinking === "string") {
			const res = truncateHistoryText(entry.thinking);
			entry.thinking = res.text;
			truncated ||= res.truncated;
			redacted ||= res.redacted;
		}
		if ("thinkingSignature" in entry) {
			delete entry.thinkingSignature;
			truncated = true;
		}
	}
	if (typeof entry.partialJson === "string") {
		const res = truncateHistoryText(entry.partialJson);
		entry.partialJson = res.text;
		truncated ||= res.truncated;
		redacted ||= res.redacted;
	}
	if (type === "image") {
		const data = readStringValue(entry.data);
		const bytes = data ? data.length : void 0;
		if ("data" in entry) {
			delete entry.data;
			truncated = true;
		}
		entry.omitted = true;
		if (bytes !== void 0) entry.bytes = bytes;
	}
	return {
		block: entry,
		truncated,
		redacted
	};
}
function sanitizeHistoryMessage(message) {
	if (!message || typeof message !== "object") return {
		message,
		truncated: false,
		redacted: false
	};
	const entry = { ...message };
	let truncated = false;
	let redacted = false;
	if ("details" in entry) {
		delete entry.details;
		truncated = true;
	}
	if ("usage" in entry) {
		delete entry.usage;
		truncated = true;
	}
	if ("cost" in entry) {
		delete entry.cost;
		truncated = true;
	}
	if (typeof entry.content === "string") {
		const res = truncateHistoryText(entry.content);
		entry.content = res.text;
		truncated ||= res.truncated;
		redacted ||= res.redacted;
	} else if (Array.isArray(entry.content)) {
		const updated = entry.content.map((block) => sanitizeHistoryContentBlock(block));
		entry.content = updated.map((item) => item.block);
		truncated ||= updated.some((item) => item.truncated);
		redacted ||= updated.some((item) => item.redacted);
	}
	if (typeof entry.text === "string") {
		const res = truncateHistoryText(entry.text);
		entry.text = res.text;
		truncated ||= res.truncated;
		redacted ||= res.redacted;
	}
	return {
		message: entry,
		truncated,
		redacted
	};
}
function enforceSessionsHistoryHardCap(params) {
	if (params.bytes <= params.maxBytes) return {
		items: params.items,
		bytes: params.bytes,
		hardCapped: false
	};
	const last = params.items.at(-1);
	const lastOnly = last ? [last] : [];
	const lastBytes = jsonUtf8Bytes(lastOnly);
	if (lastBytes <= params.maxBytes) return {
		items: lastOnly,
		bytes: lastBytes,
		hardCapped: true
	};
	const placeholder = [{
		role: "assistant",
		content: "[sessions_history omitted: message too large]"
	}];
	return {
		items: placeholder,
		bytes: jsonUtf8Bytes(placeholder),
		hardCapped: true
	};
}
function createSessionsHistoryTool(opts) {
	return {
		label: "Session History",
		name: "sessions_history",
		displaySummary: SESSIONS_HISTORY_TOOL_DISPLAY_SUMMARY,
		description: describeSessionsHistoryTool(),
		parameters: SessionsHistoryToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const gatewayCall = opts?.callGateway ?? callGateway;
			const sessionKeyParam = readStringParam$1(params, "sessionKey", { required: true });
			const cfg = opts?.config ?? loadConfig();
			const { mainKey, alias, effectiveRequesterKey, restrictToSpawned } = resolveSandboxedSessionToolContext({
				cfg,
				agentSessionKey: opts?.agentSessionKey,
				sandboxed: opts?.sandboxed
			});
			const resolvedSession = await resolveSessionReference({
				sessionKey: sessionKeyParam,
				alias,
				mainKey,
				requesterInternalKey: effectiveRequesterKey,
				restrictToSpawned
			});
			if (!resolvedSession.ok) return jsonResult({
				status: resolvedSession.status,
				error: resolvedSession.error
			});
			const visibleSession = await resolveVisibleSessionReference({
				resolvedSession,
				requesterSessionKey: effectiveRequesterKey,
				restrictToSpawned,
				visibilitySessionKey: sessionKeyParam
			});
			if (!visibleSession.ok) return jsonResult({
				status: visibleSession.status,
				error: visibleSession.error
			});
			const resolvedKey = visibleSession.key;
			const displayKey = visibleSession.displayKey;
			const a2aPolicy = createAgentToAgentPolicy(cfg);
			const access = (await createSessionVisibilityGuard({
				action: "history",
				requesterSessionKey: effectiveRequesterKey,
				visibility: resolveEffectiveSessionToolsVisibility({
					cfg,
					sandboxed: opts?.sandboxed === true
				}),
				a2aPolicy
			})).check(resolvedKey);
			if (!access.allowed) return jsonResult({
				status: access.status,
				error: access.error
			});
			const limit = typeof params.limit === "number" && Number.isFinite(params.limit) ? Math.max(1, Math.floor(params.limit)) : void 0;
			const includeTools = Boolean(params.includeTools);
			const result = await gatewayCall({
				method: "chat.history",
				params: {
					sessionKey: resolvedKey,
					limit
				}
			});
			const rawMessages = Array.isArray(result?.messages) ? result.messages : [];
			const selectedMessages = includeTools ? rawMessages : stripToolMessages(rawMessages);
			const sanitizedMessages = selectedMessages.map((message) => sanitizeHistoryMessage(message));
			const contentTruncated = sanitizedMessages.some((entry) => entry.truncated);
			const contentRedacted = sanitizedMessages.some((entry) => entry.redacted);
			const cappedMessages = capArrayByJsonBytes(sanitizedMessages.map((entry) => entry.message), SESSIONS_HISTORY_MAX_BYTES);
			const droppedMessages = cappedMessages.items.length < selectedMessages.length;
			const hardened = enforceSessionsHistoryHardCap({
				items: cappedMessages.items,
				bytes: cappedMessages.bytes,
				maxBytes: SESSIONS_HISTORY_MAX_BYTES
			});
			return jsonResult({
				sessionKey: displayKey,
				messages: hardened.items,
				truncated: droppedMessages || contentTruncated || hardened.hardCapped,
				droppedMessages: droppedMessages || hardened.hardCapped,
				contentTruncated,
				contentRedacted,
				bytes: hardened.bytes
			});
		}
	};
}
//#endregion
//#region src/agents/tools/sessions-list-tool.ts
const SessionsListToolSchema = Type.Object({
	kinds: Type.Optional(Type.Array(Type.String())),
	limit: Type.Optional(Type.Number({ minimum: 1 })),
	activeMinutes: Type.Optional(Type.Number({ minimum: 1 })),
	messageLimit: Type.Optional(Type.Number({ minimum: 0 }))
});
function readSessionRunStatus(value) {
	return value === "running" || value === "done" || value === "failed" || value === "killed" || value === "timeout" ? value : void 0;
}
function createSessionsListTool(opts) {
	return {
		label: "Sessions",
		name: "sessions_list",
		displaySummary: SESSIONS_LIST_TOOL_DISPLAY_SUMMARY,
		description: describeSessionsListTool(),
		parameters: SessionsListToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const cfg = opts?.config ?? loadConfig();
			const { mainKey, alias, requesterInternalKey, restrictToSpawned } = resolveSandboxedSessionToolContext({
				cfg,
				agentSessionKey: opts?.agentSessionKey,
				sandboxed: opts?.sandboxed
			});
			const effectiveRequesterKey = requesterInternalKey ?? alias;
			const visibility = resolveEffectiveSessionToolsVisibility({
				cfg,
				sandboxed: opts?.sandboxed === true
			});
			const allowedKindsList = (readStringArrayParam(params, "kinds")?.map((value) => normalizeOptionalLowercaseString(value)).filter((value) => Boolean(value)) ?? []).filter((value) => [
				"main",
				"group",
				"cron",
				"hook",
				"node",
				"other"
			].includes(value));
			const allowedKinds = allowedKindsList.length ? new Set(allowedKindsList) : void 0;
			const limit = typeof params.limit === "number" && Number.isFinite(params.limit) ? Math.max(1, Math.floor(params.limit)) : void 0;
			const activeMinutes = typeof params.activeMinutes === "number" && Number.isFinite(params.activeMinutes) ? Math.max(1, Math.floor(params.activeMinutes)) : void 0;
			const messageLimitRaw = typeof params.messageLimit === "number" && Number.isFinite(params.messageLimit) ? Math.max(0, Math.floor(params.messageLimit)) : 0;
			const messageLimit = Math.min(messageLimitRaw, 20);
			const gatewayCall = opts?.callGateway ?? callGateway;
			const list = await gatewayCall({
				method: "sessions.list",
				params: {
					limit,
					activeMinutes,
					includeGlobal: !restrictToSpawned,
					includeUnknown: !restrictToSpawned,
					spawnedBy: restrictToSpawned ? effectiveRequesterKey : void 0
				}
			});
			const sessions = Array.isArray(list?.sessions) ? list.sessions : [];
			const storePath = typeof list?.path === "string" ? list.path : void 0;
			const visibilityGuard = await createSessionVisibilityGuard({
				action: "list",
				requesterSessionKey: effectiveRequesterKey,
				visibility,
				a2aPolicy: createAgentToAgentPolicy(cfg)
			});
			const rows = [];
			const historyTargets = [];
			for (const entry of sessions) {
				if (!entry || typeof entry !== "object") continue;
				const key = typeof entry.key === "string" ? entry.key : "";
				if (!key) continue;
				if (!visibilityGuard.check(key).allowed) continue;
				if (key === "unknown") continue;
				if (key === "global" && alias !== "global") continue;
				const kind = classifySessionKind({
					key,
					gatewayKind: typeof entry.kind === "string" ? entry.kind : void 0,
					alias,
					mainKey
				});
				if (allowedKinds && !allowedKinds.has(kind)) continue;
				const displayKey = resolveDisplaySessionKey({
					key,
					alias,
					mainKey
				});
				const entryChannel = typeof entry.channel === "string" ? entry.channel : void 0;
				const entryOrigin = entry.origin && typeof entry.origin === "object" ? entry.origin : void 0;
				const originChannel = typeof entryOrigin?.provider === "string" ? entryOrigin.provider : void 0;
				const deliveryContext = entry.deliveryContext && typeof entry.deliveryContext === "object" ? entry.deliveryContext : void 0;
				const deliveryChannel = readStringValue(deliveryContext?.channel);
				const deliveryTo = readStringValue(deliveryContext?.to);
				const deliveryAccountId = readStringValue(deliveryContext?.accountId);
				const deliveryThreadId = typeof deliveryContext?.threadId === "string" || typeof deliveryContext?.threadId === "number" && Number.isFinite(deliveryContext.threadId) ? deliveryContext.threadId : void 0;
				const lastChannel = deliveryChannel ?? readStringValue(entry.lastChannel);
				const lastAccountId = deliveryAccountId ?? readStringValue(entry.lastAccountId);
				const derivedChannel = deriveChannel({
					key,
					kind,
					channel: entryChannel ?? originChannel,
					lastChannel
				});
				const sessionId = readStringValue(entry.sessionId);
				const sessionFileRaw = entry.sessionFile;
				const sessionFile = readStringValue(sessionFileRaw);
				let transcriptPath;
				if (sessionId) try {
					const agentId = resolveAgentIdFromSessionKey(key);
					const trimmedStorePath = storePath?.trim();
					let effectiveStorePath;
					if (trimmedStorePath && trimmedStorePath !== "(multiple)") {
						if (trimmedStorePath.includes("{agentId}") || trimmedStorePath.startsWith("~")) effectiveStorePath = resolveStorePath(trimmedStorePath, { agentId });
						else if (path.isAbsolute(trimmedStorePath)) effectiveStorePath = trimmedStorePath;
					}
					const filePathOpts = resolveSessionFilePathOptions({
						agentId,
						storePath: effectiveStorePath
					});
					transcriptPath = resolveSessionFilePath(sessionId, sessionFile ? { sessionFile } : void 0, filePathOpts);
				} catch {
					transcriptPath = void 0;
				}
				const row = {
					key: displayKey,
					kind,
					channel: derivedChannel,
					origin: originChannel || (typeof entryOrigin?.accountId === "string" ? entryOrigin.accountId : void 0) ? {
						provider: originChannel,
						accountId: readStringValue(entryOrigin?.accountId)
					} : void 0,
					spawnedBy: typeof entry.spawnedBy === "string" ? resolveDisplaySessionKey({
						key: entry.spawnedBy,
						alias,
						mainKey
					}) : void 0,
					label: readStringValue(entry.label),
					displayName: readStringValue(entry.displayName),
					parentSessionKey: typeof entry.parentSessionKey === "string" ? resolveDisplaySessionKey({
						key: entry.parentSessionKey,
						alias,
						mainKey
					}) : void 0,
					deliveryContext: deliveryChannel || deliveryTo || deliveryAccountId || deliveryThreadId ? {
						channel: deliveryChannel,
						to: deliveryTo,
						accountId: deliveryAccountId,
						threadId: deliveryThreadId
					} : void 0,
					updatedAt: typeof entry.updatedAt === "number" ? entry.updatedAt : void 0,
					sessionId,
					model: readStringValue(entry.model),
					contextTokens: typeof entry.contextTokens === "number" ? entry.contextTokens : void 0,
					totalTokens: typeof entry.totalTokens === "number" ? entry.totalTokens : void 0,
					estimatedCostUsd: typeof entry.estimatedCostUsd === "number" ? entry.estimatedCostUsd : void 0,
					status: readSessionRunStatus(entry.status),
					startedAt: typeof entry.startedAt === "number" ? entry.startedAt : void 0,
					endedAt: typeof entry.endedAt === "number" ? entry.endedAt : void 0,
					runtimeMs: typeof entry.runtimeMs === "number" ? entry.runtimeMs : void 0,
					childSessions: Array.isArray(entry.childSessions) ? entry.childSessions.filter((value) => typeof value === "string").map((value) => resolveDisplaySessionKey({
						key: value,
						alias,
						mainKey
					})) : void 0,
					thinkingLevel: readStringValue(entry.thinkingLevel),
					fastMode: typeof entry.fastMode === "boolean" ? entry.fastMode : void 0,
					verboseLevel: readStringValue(entry.verboseLevel),
					reasoningLevel: readStringValue(entry.reasoningLevel),
					elevatedLevel: readStringValue(entry.elevatedLevel),
					responseUsage: readStringValue(entry.responseUsage),
					systemSent: typeof entry.systemSent === "boolean" ? entry.systemSent : void 0,
					abortedLastRun: typeof entry.abortedLastRun === "boolean" ? entry.abortedLastRun : void 0,
					sendPolicy: readStringValue(entry.sendPolicy),
					lastChannel,
					lastTo: deliveryTo ?? readStringValue(entry.lastTo),
					lastAccountId,
					transcriptPath
				};
				if (messageLimit > 0) {
					const resolvedKey = resolveInternalSessionKey({
						key,
						alias,
						mainKey
					});
					historyTargets.push({
						row,
						resolvedKey
					});
				}
				rows.push(row);
			}
			if (messageLimit > 0 && historyTargets.length > 0) {
				const maxConcurrent = Math.min(4, historyTargets.length);
				let index = 0;
				const worker = async () => {
					while (true) {
						const next = index;
						index += 1;
						if (next >= historyTargets.length) return;
						const target = historyTargets[next];
						const history = await gatewayCall({
							method: "chat.history",
							params: {
								sessionKey: target.resolvedKey,
								limit: messageLimit
							}
						});
						const filtered = stripToolMessages(Array.isArray(history?.messages) ? history.messages : []);
						target.row.messages = filtered.length > messageLimit ? filtered.slice(-messageLimit) : filtered;
					}
				};
				await Promise.all(Array.from({ length: maxConcurrent }, () => worker()));
			}
			return jsonResult({
				count: rows.length,
				sessions: rows
			});
		}
	};
}
//#endregion
//#region src/agents/tools/sessions-send-helpers.ts
const DEFAULT_PING_PONG_TURNS = 5;
const MAX_PING_PONG_TURNS = 5;
function resolveAnnounceTargetFromKey(sessionKey) {
	const parsed = resolveSessionConversationRef(sessionKey);
	if (!parsed) return null;
	const normalizedChannel = normalizeChannelId$1(parsed.channel) ?? normalizeChannelId(parsed.channel);
	const channel = normalizedChannel ?? parsed.channel;
	const plugin = normalizedChannel ? getChannelPlugin(normalizedChannel) : null;
	const genericTarget = parsed.kind === "channel" ? `channel:${parsed.id}` : `group:${parsed.id}`;
	return {
		channel,
		to: plugin?.messaging?.resolveSessionTarget?.({
			kind: parsed.kind,
			id: parsed.id,
			threadId: parsed.threadId
		}) ?? plugin?.messaging?.normalizeTarget?.(genericTarget) ?? (normalizedChannel ? genericTarget : parsed.id),
		threadId: parsed.threadId
	};
}
function buildAgentSessionLines(params) {
	return [
		params.requesterSessionKey ? `Agent 1 (requester) session: ${params.requesterSessionKey}.` : void 0,
		params.requesterChannel ? `Agent 1 (requester) channel: ${params.requesterChannel}.` : void 0,
		`Agent 2 (target) session: ${params.targetSessionKey}.`,
		params.targetChannel ? `Agent 2 (target) channel: ${params.targetChannel}.` : void 0
	].filter((line) => Boolean(line));
}
function buildAgentToAgentMessageContext(params) {
	return ["Agent-to-agent message context:", ...buildAgentSessionLines(params)].filter(Boolean).join("\n");
}
function buildAgentToAgentReplyContext(params) {
	return [
		"Agent-to-agent reply step:",
		`Current agent: ${params.currentRole === "requester" ? "Agent 1 (requester)" : "Agent 2 (target)"}.`,
		`Turn ${params.turn} of ${params.maxTurns}.`,
		...buildAgentSessionLines(params),
		`If you want to stop the ping-pong, reply exactly "${REPLY_SKIP_TOKEN}".`
	].filter(Boolean).join("\n");
}
function buildAgentToAgentAnnounceContext(params) {
	return [
		"Agent-to-agent announce step:",
		...buildAgentSessionLines(params),
		`Original request: ${params.originalMessage}`,
		params.roundOneReply ? `Round 1 reply: ${params.roundOneReply}` : "Round 1 reply: (not available).",
		params.latestReply ? `Latest reply: ${params.latestReply}` : "Latest reply: (not available).",
		`If you want to remain silent, reply exactly "${ANNOUNCE_SKIP_TOKEN}".`,
		"Any other reply will be posted to the target channel.",
		"After this reply, the agent-to-agent conversation is over."
	].filter(Boolean).join("\n");
}
function resolvePingPongTurns(cfg) {
	const raw = cfg?.session?.agentToAgent?.maxPingPongTurns;
	const fallback = DEFAULT_PING_PONG_TURNS;
	if (typeof raw !== "number" || !Number.isFinite(raw)) return fallback;
	return Math.max(0, Math.min(MAX_PING_PONG_TURNS, Math.floor(raw)));
}
//#endregion
//#region src/agents/tools/sessions-announce-target.ts
async function callGatewayLazy(opts) {
	const { callGateway } = await import("./call-BVShKaZ4.js");
	return callGateway(opts);
}
async function resolveAnnounceTarget(params) {
	const parsed = resolveAnnounceTargetFromKey(params.sessionKey);
	const parsedDisplay = resolveAnnounceTargetFromKey(params.displayKey);
	const fallback = parsed ?? parsedDisplay ?? null;
	const fallbackThreadId = fallback?.threadId ?? parseThreadSessionSuffix(params.sessionKey).threadId ?? parseThreadSessionSuffix(params.displayKey).threadId;
	if (fallback) {
		const normalized = normalizeChannelId$1(fallback.channel);
		if (!(normalized ? getChannelPlugin(normalized) : null)?.meta?.preferSessionLookupForAnnounceTarget) return fallback;
	}
	try {
		const list = await callGatewayLazy({
			method: "sessions.list",
			params: {
				includeGlobal: true,
				includeUnknown: true,
				limit: 200
			}
		});
		const sessions = Array.isArray(list?.sessions) ? list.sessions : [];
		const match = sessions.find((entry) => entry?.key === params.sessionKey) ?? sessions.find((entry) => entry?.key === params.displayKey);
		const deliveryContext = match?.deliveryContext && typeof match.deliveryContext === "object" ? match.deliveryContext : void 0;
		const origin = match?.origin && typeof match.origin === "object" ? match.origin : void 0;
		const channel = (typeof deliveryContext?.channel === "string" ? deliveryContext.channel : void 0) ?? (typeof match?.lastChannel === "string" ? match.lastChannel : void 0) ?? (typeof origin?.provider === "string" ? origin.provider : void 0);
		const to = (typeof deliveryContext?.to === "string" ? deliveryContext.to : void 0) ?? (typeof match?.lastTo === "string" ? match.lastTo : void 0);
		const accountId = (typeof deliveryContext?.accountId === "string" ? deliveryContext.accountId : void 0) ?? (typeof match?.lastAccountId === "string" ? match.lastAccountId : void 0) ?? (typeof origin?.accountId === "string" ? origin.accountId : void 0);
		const threadId = normalizeOptionalStringifiedId(deliveryContext?.threadId ?? match?.lastThreadId ?? origin?.threadId ?? fallbackThreadId);
		if (channel && to) return {
			channel,
			to,
			accountId,
			threadId
		};
	} catch {}
	return fallback;
}
//#endregion
//#region src/agents/tools/sessions-send-tool.a2a.ts
const log$1 = createSubsystemLogger("agents/sessions-send");
let sessionsSendA2ADeps = { callGateway: async (opts) => {
	const { callGateway } = await import("./call-BVShKaZ4.js");
	return callGateway(opts);
} };
async function runSessionsSendA2AFlow(params) {
	const runContextId = params.waitRunId ?? "unknown";
	try {
		let primaryReply = params.roundOneReply;
		let latestReply = params.roundOneReply;
		if (!primaryReply && params.waitRunId) {
			if ((await waitForAgentRun({
				runId: params.waitRunId,
				timeoutMs: Math.min(params.announceTimeoutMs, 6e4),
				callGateway: sessionsSendA2ADeps.callGateway
			})).status === "ok") {
				primaryReply = await readLatestAssistantReply({ sessionKey: params.targetSessionKey });
				latestReply = primaryReply;
			}
		}
		if (!latestReply) return;
		const announceTarget = await resolveAnnounceTarget({
			sessionKey: params.targetSessionKey,
			displayKey: params.displayKey
		});
		const targetChannel = announceTarget?.channel ?? "unknown";
		if (params.maxPingPongTurns > 0 && params.requesterSessionKey && params.requesterSessionKey !== params.targetSessionKey) {
			let currentSessionKey = params.requesterSessionKey;
			let nextSessionKey = params.targetSessionKey;
			let incomingMessage = latestReply;
			for (let turn = 1; turn <= params.maxPingPongTurns; turn += 1) {
				const currentRole = currentSessionKey === params.requesterSessionKey ? "requester" : "target";
				const replyPrompt = buildAgentToAgentReplyContext({
					requesterSessionKey: params.requesterSessionKey,
					requesterChannel: params.requesterChannel,
					targetSessionKey: params.displayKey,
					targetChannel,
					currentRole,
					turn,
					maxTurns: params.maxPingPongTurns
				});
				const replyText = await runAgentStep({
					sessionKey: currentSessionKey,
					message: incomingMessage,
					extraSystemPrompt: replyPrompt,
					timeoutMs: params.announceTimeoutMs,
					lane: AGENT_LANE_NESTED,
					sourceSessionKey: nextSessionKey,
					sourceChannel: nextSessionKey === params.requesterSessionKey ? params.requesterChannel : targetChannel,
					sourceTool: "sessions_send"
				});
				if (!replyText || isReplySkip(replyText)) break;
				latestReply = replyText;
				incomingMessage = replyText;
				const swap = currentSessionKey;
				currentSessionKey = nextSessionKey;
				nextSessionKey = swap;
			}
		}
		const announcePrompt = buildAgentToAgentAnnounceContext({
			requesterSessionKey: params.requesterSessionKey,
			requesterChannel: params.requesterChannel,
			targetSessionKey: params.displayKey,
			targetChannel,
			originalMessage: params.message,
			roundOneReply: primaryReply,
			latestReply
		});
		const announceReply = await runAgentStep({
			sessionKey: params.targetSessionKey,
			message: "Agent-to-agent announce step.",
			extraSystemPrompt: announcePrompt,
			timeoutMs: params.announceTimeoutMs,
			lane: AGENT_LANE_NESTED,
			sourceSessionKey: params.requesterSessionKey,
			sourceChannel: params.requesterChannel,
			sourceTool: "sessions_send"
		});
		if (announceTarget && announceReply && announceReply.trim() && !isAnnounceSkip(announceReply)) try {
			await sessionsSendA2ADeps.callGateway({
				method: "send",
				params: {
					to: announceTarget.to,
					message: announceReply.trim(),
					channel: announceTarget.channel,
					accountId: announceTarget.accountId,
					threadId: announceTarget.threadId,
					idempotencyKey: crypto.randomUUID()
				},
				timeoutMs: 1e4
			});
		} catch (err) {
			log$1.warn("sessions_send announce delivery failed", {
				runId: runContextId,
				channel: announceTarget.channel,
				to: announceTarget.to,
				error: formatErrorMessage(err)
			});
		}
	} catch (err) {
		log$1.warn("sessions_send announce flow failed", {
			runId: runContextId,
			error: formatErrorMessage(err)
		});
	}
}
//#endregion
//#region src/agents/tools/sessions-send-tool.ts
const SessionsSendToolSchema = Type.Object({
	sessionKey: Type.Optional(Type.String()),
	label: Type.Optional(Type.String({
		minLength: 1,
		maxLength: 512
	})),
	agentId: Type.Optional(Type.String({
		minLength: 1,
		maxLength: 64
	})),
	message: Type.String(),
	timeoutSeconds: Type.Optional(Type.Number({ minimum: 0 }))
});
const SESSIONS_SEND_REPLY_HISTORY_LIMIT = 50;
async function startAgentRun(params) {
	try {
		const response = await params.callGateway({
			method: "agent",
			params: params.sendParams,
			timeoutMs: 1e4
		});
		return {
			ok: true,
			runId: typeof response?.runId === "string" && response.runId ? response.runId : params.runId
		};
	} catch (err) {
		const messageText = err instanceof Error ? err.message : typeof err === "string" ? err : "error";
		return {
			ok: false,
			result: jsonResult({
				runId: params.runId,
				status: "error",
				error: messageText,
				sessionKey: params.sessionKey
			})
		};
	}
}
function createSessionsSendTool(opts) {
	return {
		label: "Session Send",
		name: "sessions_send",
		displaySummary: SESSIONS_SEND_TOOL_DISPLAY_SUMMARY,
		description: describeSessionsSendTool(),
		parameters: SessionsSendToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const gatewayCall = opts?.callGateway ?? callGateway;
			const message = readStringParam$1(params, "message", { required: true });
			const { cfg, mainKey, alias, effectiveRequesterKey, restrictToSpawned } = resolveSessionToolContext(opts);
			const a2aPolicy = createAgentToAgentPolicy(cfg);
			const sessionVisibility = resolveEffectiveSessionToolsVisibility({
				cfg,
				sandboxed: opts?.sandboxed === true
			});
			const sessionKeyParam = readStringParam$1(params, "sessionKey");
			const labelParam = normalizeOptionalString(readStringParam$1(params, "label"));
			const labelAgentIdParam = normalizeOptionalString(readStringParam$1(params, "agentId"));
			if (sessionKeyParam && labelParam) return jsonResult({
				runId: crypto.randomUUID(),
				status: "error",
				error: "Provide either sessionKey or label (not both)."
			});
			let sessionKey = sessionKeyParam;
			if (!sessionKey && labelParam) {
				const requesterAgentId = resolveAgentIdFromSessionKey(effectiveRequesterKey);
				const requestedAgentId = labelAgentIdParam ? normalizeAgentId(labelAgentIdParam) : void 0;
				if (restrictToSpawned && requestedAgentId && requestedAgentId !== requesterAgentId) return jsonResult({
					runId: crypto.randomUUID(),
					status: "forbidden",
					error: "Sandboxed sessions_send label lookup is limited to this agent"
				});
				if (requesterAgentId && requestedAgentId && requestedAgentId !== requesterAgentId) {
					if (!a2aPolicy.enabled) return jsonResult({
						runId: crypto.randomUUID(),
						status: "forbidden",
						error: "Agent-to-agent messaging is disabled. Set tools.agentToAgent.enabled=true to allow cross-agent sends."
					});
					if (!a2aPolicy.isAllowed(requesterAgentId, requestedAgentId)) return jsonResult({
						runId: crypto.randomUUID(),
						status: "forbidden",
						error: "Agent-to-agent messaging denied by tools.agentToAgent.allow."
					});
				}
				const resolveParams = {
					label: labelParam,
					...requestedAgentId ? { agentId: requestedAgentId } : {},
					...restrictToSpawned ? { spawnedBy: effectiveRequesterKey } : {}
				};
				let resolvedKey = "";
				try {
					resolvedKey = normalizeOptionalString((await gatewayCall({
						method: "sessions.resolve",
						params: resolveParams,
						timeoutMs: 1e4
					}))?.key) ?? "";
				} catch (err) {
					const msg = formatErrorMessage(err);
					if (restrictToSpawned) return jsonResult({
						runId: crypto.randomUUID(),
						status: "forbidden",
						error: "Session not visible from this sandboxed agent session."
					});
					return jsonResult({
						runId: crypto.randomUUID(),
						status: "error",
						error: msg || `No session found with label: ${labelParam}`
					});
				}
				if (!resolvedKey) {
					if (restrictToSpawned) return jsonResult({
						runId: crypto.randomUUID(),
						status: "forbidden",
						error: "Session not visible from this sandboxed agent session."
					});
					return jsonResult({
						runId: crypto.randomUUID(),
						status: "error",
						error: `No session found with label: ${labelParam}`
					});
				}
				sessionKey = resolvedKey;
			}
			if (!sessionKey) return jsonResult({
				runId: crypto.randomUUID(),
				status: "error",
				error: "Either sessionKey or label is required"
			});
			const resolvedSession = await resolveSessionReference({
				sessionKey,
				alias,
				mainKey,
				requesterInternalKey: effectiveRequesterKey,
				restrictToSpawned
			});
			if (!resolvedSession.ok) return jsonResult({
				runId: crypto.randomUUID(),
				status: resolvedSession.status,
				error: resolvedSession.error
			});
			const visibleSession = await resolveVisibleSessionReference({
				resolvedSession,
				requesterSessionKey: effectiveRequesterKey,
				restrictToSpawned,
				visibilitySessionKey: sessionKey
			});
			if (!visibleSession.ok) return jsonResult({
				runId: crypto.randomUUID(),
				status: visibleSession.status,
				error: visibleSession.error,
				sessionKey: visibleSession.displayKey
			});
			const resolvedKey = visibleSession.key;
			const displayKey = visibleSession.displayKey;
			const timeoutSeconds = typeof params.timeoutSeconds === "number" && Number.isFinite(params.timeoutSeconds) ? Math.max(0, Math.floor(params.timeoutSeconds)) : 30;
			const timeoutMs = timeoutSeconds * 1e3;
			const announceTimeoutMs = timeoutSeconds === 0 ? 3e4 : timeoutMs;
			const idempotencyKey = crypto.randomUUID();
			let runId = idempotencyKey;
			const access = (await createSessionVisibilityGuard({
				action: "send",
				requesterSessionKey: effectiveRequesterKey,
				visibility: sessionVisibility,
				a2aPolicy
			})).check(resolvedKey);
			if (!access.allowed) return jsonResult({
				runId: crypto.randomUUID(),
				status: access.status,
				error: access.error,
				sessionKey: displayKey
			});
			const baselineReply = timeoutSeconds === 0 ? void 0 : await readLatestAssistantReplySnapshot({
				sessionKey: resolvedKey,
				limit: SESSIONS_SEND_REPLY_HISTORY_LIMIT,
				callGateway: gatewayCall
			});
			const sendParams = {
				message,
				sessionKey: resolvedKey,
				idempotencyKey,
				deliver: false,
				channel: INTERNAL_MESSAGE_CHANNEL,
				lane: AGENT_LANE_NESTED,
				extraSystemPrompt: buildAgentToAgentMessageContext({
					requesterSessionKey: opts?.agentSessionKey,
					requesterChannel: opts?.agentChannel,
					targetSessionKey: displayKey
				}),
				inputProvenance: {
					kind: "inter_session",
					sourceSessionKey: opts?.agentSessionKey,
					sourceChannel: opts?.agentChannel,
					sourceTool: "sessions_send"
				}
			};
			const requesterSessionKey = opts?.agentSessionKey;
			const requesterChannel = opts?.agentChannel;
			const maxPingPongTurns = resolvePingPongTurns(cfg);
			const delivery = {
				status: "pending",
				mode: "announce"
			};
			const startA2AFlow = (roundOneReply, waitRunId) => {
				runSessionsSendA2AFlow({
					targetSessionKey: resolvedKey,
					displayKey,
					message,
					announceTimeoutMs,
					maxPingPongTurns,
					requesterSessionKey,
					requesterChannel,
					roundOneReply,
					waitRunId
				});
			};
			if (timeoutSeconds === 0) {
				const start = await startAgentRun({
					callGateway: gatewayCall,
					runId,
					sendParams,
					sessionKey: displayKey
				});
				if (!start.ok) return start.result;
				runId = start.runId;
				startA2AFlow(void 0, runId);
				return jsonResult({
					runId,
					status: "accepted",
					sessionKey: displayKey,
					delivery
				});
			}
			const start = await startAgentRun({
				callGateway: gatewayCall,
				runId,
				sendParams,
				sessionKey: displayKey
			});
			if (!start.ok) return start.result;
			runId = start.runId;
			const result = await waitForAgentRunAndReadUpdatedAssistantReply({
				runId,
				sessionKey: resolvedKey,
				timeoutMs,
				limit: SESSIONS_SEND_REPLY_HISTORY_LIMIT,
				baseline: baselineReply,
				callGateway: gatewayCall
			});
			if (result.status === "timeout") return jsonResult({
				runId,
				status: "timeout",
				error: result.error,
				sessionKey: displayKey
			});
			if (result.status === "error") return jsonResult({
				runId,
				status: "error",
				error: result.error ?? "agent error",
				sessionKey: displayKey
			});
			const reply = result.replyText;
			startA2AFlow(reply ?? void 0);
			return jsonResult({
				runId,
				status: "ok",
				reply,
				sessionKey: displayKey,
				delivery
			});
		}
	};
}
//#endregion
//#region src/agents/tools/sessions-spawn-tool.ts
const SESSIONS_SPAWN_RUNTIMES = ["subagent", "acp"];
const SESSIONS_SPAWN_SANDBOX_MODES = ["inherit", "require"];
const SESSIONS_SPAWN_ACP_STREAM_TARGETS = ["parent"];
const UNSUPPORTED_SESSIONS_SPAWN_PARAM_KEYS = [
	"target",
	"transport",
	"channel",
	"to",
	"threadId",
	"thread_id",
	"replyTo",
	"reply_to"
];
let acpSpawnModulePromise;
async function loadAcpSpawnModule() {
	acpSpawnModulePromise ??= import("./acp-spawn-DN7wgjN6.js");
	return await acpSpawnModulePromise;
}
function summarizeError(err) {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	return "error";
}
function resolveTrackedSpawnMode(params) {
	if (params.requestedMode === "run" || params.requestedMode === "session") return params.requestedMode;
	return params.threadRequested ? "session" : "run";
}
async function cleanupUntrackedAcpSession(sessionKey) {
	const key = sessionKey.trim();
	if (!key) return;
	try {
		await callGateway({
			method: "sessions.delete",
			params: {
				key,
				deleteTranscript: true,
				emitLifecycleHooks: false
			},
			timeoutMs: 1e4
		});
	} catch {}
}
const SessionsSpawnToolSchema = Type.Object({
	task: Type.String(),
	label: Type.Optional(Type.String()),
	runtime: optionalStringEnum(SESSIONS_SPAWN_RUNTIMES),
	agentId: Type.Optional(Type.String()),
	resumeSessionId: Type.Optional(Type.String({ description: "Resume an existing agent session by its ID (e.g. a Codex session UUID from ~/.codex/sessions/). Requires runtime=\"acp\". The agent replays conversation history via session/load instead of starting fresh." })),
	model: Type.Optional(Type.String()),
	thinking: Type.Optional(Type.String()),
	cwd: Type.Optional(Type.String()),
	runTimeoutSeconds: Type.Optional(Type.Number({ minimum: 0 })),
	timeoutSeconds: Type.Optional(Type.Number({ minimum: 0 })),
	thread: Type.Optional(Type.Boolean()),
	mode: optionalStringEnum(SUBAGENT_SPAWN_MODES),
	cleanup: optionalStringEnum(["delete", "keep"]),
	sandbox: optionalStringEnum(SESSIONS_SPAWN_SANDBOX_MODES),
	streamTo: optionalStringEnum(SESSIONS_SPAWN_ACP_STREAM_TARGETS),
	lightContext: Type.Optional(Type.Boolean({ description: "When true, spawned subagent runs use lightweight bootstrap context. Only applies to runtime='subagent'." })),
	attachments: Type.Optional(Type.Array(Type.Object({
		name: Type.String(),
		content: Type.String(),
		encoding: Type.Optional(optionalStringEnum(["utf8", "base64"])),
		mimeType: Type.Optional(Type.String())
	}), { maxItems: 50 })),
	attachAs: Type.Optional(Type.Object({ mountPath: Type.Optional(Type.String()) }))
});
function createSessionsSpawnTool(opts) {
	return {
		label: "Sessions",
		name: "sessions_spawn",
		displaySummary: SESSIONS_SPAWN_TOOL_DISPLAY_SUMMARY,
		description: describeSessionsSpawnTool(),
		parameters: SessionsSpawnToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const unsupportedParam = UNSUPPORTED_SESSIONS_SPAWN_PARAM_KEYS.find((key) => Object.hasOwn(params, key));
			if (unsupportedParam) throw new ToolInputError(`sessions_spawn does not support "${unsupportedParam}". Use "message" or "sessions_send" for channel delivery.`);
			const task = readStringParam$1(params, "task", { required: true });
			const label = readStringParam$1(params, "label") ?? "";
			const runtime = params.runtime === "acp" ? "acp" : "subagent";
			const requestedAgentId = readStringParam$1(params, "agentId");
			const resumeSessionId = readStringParam$1(params, "resumeSessionId");
			const modelOverride = readStringParam$1(params, "model");
			const thinkingOverrideRaw = readStringParam$1(params, "thinking");
			const cwd = readStringParam$1(params, "cwd");
			const mode = params.mode === "run" || params.mode === "session" ? params.mode : void 0;
			const cleanup = params.cleanup === "keep" || params.cleanup === "delete" ? params.cleanup : "keep";
			const expectsCompletionMessage = params.expectsCompletionMessage !== false;
			const sandbox = params.sandbox === "require" ? "require" : "inherit";
			const streamTo = params.streamTo === "parent" ? "parent" : void 0;
			const lightContext = params.lightContext === true;
			if (runtime === "acp" && lightContext) throw new Error("lightContext is only supported for runtime='subagent'.");
			const timeoutSecondsCandidate = typeof params.runTimeoutSeconds === "number" ? params.runTimeoutSeconds : typeof params.timeoutSeconds === "number" ? params.timeoutSeconds : void 0;
			const runTimeoutSeconds = typeof timeoutSecondsCandidate === "number" && Number.isFinite(timeoutSecondsCandidate) ? Math.max(0, Math.floor(timeoutSecondsCandidate)) : void 0;
			const thread = params.thread === true;
			const attachments = Array.isArray(params.attachments) ? params.attachments : void 0;
			if (streamTo && runtime !== "acp") return jsonResult({
				status: "error",
				error: `streamTo is only supported for runtime=acp; got runtime=${runtime}`
			});
			if (resumeSessionId && runtime !== "acp") return jsonResult({
				status: "error",
				error: `resumeSessionId is only supported for runtime=acp; got runtime=${runtime}`
			});
			if (runtime === "acp") {
				const { isSpawnAcpAcceptedResult, spawnAcpDirect } = await loadAcpSpawnModule();
				if (Array.isArray(attachments) && attachments.length > 0) return jsonResult({
					status: "error",
					error: "attachments are currently unsupported for runtime=acp; use runtime=subagent or remove attachments"
				});
				const result = await spawnAcpDirect({
					task,
					label: label || void 0,
					agentId: requestedAgentId,
					resumeSessionId,
					cwd,
					mode: mode === "run" || mode === "session" ? mode : void 0,
					thread,
					sandbox,
					streamTo
				}, {
					agentSessionKey: opts?.agentSessionKey,
					agentChannel: opts?.agentChannel,
					agentAccountId: opts?.agentAccountId,
					agentTo: opts?.agentTo,
					agentThreadId: opts?.agentThreadId,
					agentGroupId: opts?.agentGroupId ?? void 0,
					sandboxed: opts?.sandboxed
				});
				const childSessionKey = result.childSessionKey?.trim();
				const childRunId = isSpawnAcpAcceptedResult(result) ? result.runId?.trim() : void 0;
				if (result.status === "accepted" && Boolean(childSessionKey) && Boolean(childRunId) && streamTo !== "parent" && childSessionKey && childRunId) {
					const cfg = loadConfig();
					const trackedSpawnMode = resolveTrackedSpawnMode({
						requestedMode: result.mode,
						threadRequested: thread
					});
					const trackedCleanup = trackedSpawnMode === "session" ? "keep" : cleanup;
					const { mainKey, alias } = resolveMainSessionAlias(cfg);
					const requesterInternalKey = opts?.agentSessionKey ? resolveInternalSessionKey({
						key: opts.agentSessionKey,
						alias,
						mainKey
					}) : alias;
					const requesterDisplayKey = resolveDisplaySessionKey({
						key: requesterInternalKey,
						alias,
						mainKey
					});
					const requesterOrigin = normalizeDeliveryContext({
						channel: opts?.agentChannel,
						accountId: opts?.agentAccountId,
						to: opts?.agentTo,
						threadId: opts?.agentThreadId
					});
					try {
						registerSubagentRun({
							runId: childRunId,
							childSessionKey,
							requesterSessionKey: requesterInternalKey,
							requesterOrigin,
							requesterDisplayKey,
							task,
							cleanup: trackedCleanup,
							label: label || void 0,
							runTimeoutSeconds,
							expectsCompletionMessage,
							spawnMode: trackedSpawnMode
						});
					} catch (err) {
						await cleanupUntrackedAcpSession(childSessionKey);
						return jsonResult({
							status: "error",
							error: `Failed to register ACP run: ${summarizeError(err)}. Cleanup was attempted, but the already-started ACP run may still finish in the background.`,
							childSessionKey,
							runId: childRunId
						});
					}
				}
				return jsonResult(result);
			}
			return jsonResult(await spawnSubagentDirect({
				task,
				label: label || void 0,
				agentId: requestedAgentId,
				model: modelOverride,
				thinking: thinkingOverrideRaw,
				runTimeoutSeconds,
				thread,
				mode,
				cleanup,
				sandbox,
				lightContext,
				expectsCompletionMessage,
				attachments,
				attachMountPath: params.attachAs && typeof params.attachAs === "object" ? readStringParam$1(params.attachAs, "mountPath") : void 0
			}, {
				agentSessionKey: opts?.agentSessionKey,
				agentChannel: opts?.agentChannel,
				agentAccountId: opts?.agentAccountId,
				agentTo: opts?.agentTo,
				agentThreadId: opts?.agentThreadId,
				agentGroupId: opts?.agentGroupId,
				agentGroupChannel: opts?.agentGroupChannel,
				agentGroupSpace: opts?.agentGroupSpace,
				requesterAgentIdOverride: opts?.requesterAgentIdOverride,
				workspaceDir: opts?.workspaceDir
			}));
		}
	};
}
//#endregion
//#region src/agents/tools/sessions-yield-tool.ts
const SessionsYieldToolSchema = Type.Object({ message: Type.Optional(Type.String()) });
function createSessionsYieldTool(opts) {
	return {
		label: "Yield",
		name: "sessions_yield",
		description: "End your current turn. Use after spawning subagents to receive their results as the next message.",
		parameters: SessionsYieldToolSchema,
		execute: async (_toolCallId, args) => {
			const message = readStringParam$1(args, "message") || "Turn yielded.";
			if (!opts?.sessionId) return jsonResult({
				status: "error",
				error: "No session context"
			});
			if (!opts?.onYield) return jsonResult({
				status: "error",
				error: "Yield not supported in this context"
			});
			await opts.onYield(message);
			return jsonResult({
				status: "yielded",
				message
			});
		}
	};
}
//#endregion
//#region src/agents/tools/subagents-tool.ts
const SubagentsToolSchema = Type.Object({
	action: optionalStringEnum([
		"list",
		"kill",
		"steer"
	]),
	target: Type.Optional(Type.String()),
	message: Type.Optional(Type.String()),
	recentMinutes: Type.Optional(Type.Number({ minimum: 1 }))
});
function createSubagentsTool(opts) {
	return {
		label: "Subagents",
		name: "subagents",
		description: "List, kill, or steer spawned sub-agents for this requester session. Use this for sub-agent orchestration.",
		parameters: SubagentsToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const action = readStringParam$1(params, "action") ?? "list";
			const cfg = loadConfig();
			const controller = resolveSubagentController({
				cfg,
				agentSessionKey: opts?.agentSessionKey
			});
			const runs = listControlledSubagentRuns(controller.controllerSessionKey);
			const recentMinutesRaw = readNumberParam(params, "recentMinutes");
			const recentMinutes = recentMinutesRaw ? Math.max(1, Math.min(MAX_RECENT_MINUTES, Math.floor(recentMinutesRaw))) : 30;
			const pendingDescendantCount = createPendingDescendantCounter();
			const isActive = (entry) => isActiveSubagentRun(entry, pendingDescendantCount);
			if (action === "list") {
				const list = buildSubagentList({
					cfg,
					runs,
					recentMinutes
				});
				return jsonResult({
					status: "ok",
					action: "list",
					requesterSessionKey: controller.controllerSessionKey,
					callerSessionKey: controller.callerSessionKey,
					callerIsSubagent: controller.callerIsSubagent,
					total: list.total,
					active: list.active.map(({ line: _line, ...view }) => view),
					recent: list.recent.map(({ line: _line, ...view }) => view),
					text: list.text
				});
			}
			if (action === "kill") {
				const target = readStringParam$1(params, "target", { required: true });
				if (target === "all" || target === "*") {
					const result = await killAllControlledSubagentRuns({
						cfg,
						controller,
						runs
					});
					if (result.status === "forbidden") return jsonResult({
						status: "forbidden",
						action: "kill",
						target: "all",
						error: result.error
					});
					return jsonResult({
						status: "ok",
						action: "kill",
						target: "all",
						killed: result.killed,
						labels: result.labels,
						text: result.killed > 0 ? `killed ${result.killed} subagent${result.killed === 1 ? "" : "s"}.` : "no running subagents to kill."
					});
				}
				const resolved = resolveControlledSubagentTarget(runs, target, {
					recentMinutes,
					isActive
				});
				if (!resolved.entry) return jsonResult({
					status: "error",
					action: "kill",
					target,
					error: resolved.error ?? "Unknown subagent target."
				});
				const result = await killControlledSubagentRun({
					cfg,
					controller,
					entry: resolved.entry
				});
				return jsonResult({
					status: result.status,
					action: "kill",
					target,
					runId: result.runId,
					sessionKey: result.sessionKey,
					label: result.label,
					cascadeKilled: "cascadeKilled" in result ? result.cascadeKilled : void 0,
					cascadeLabels: "cascadeLabels" in result ? result.cascadeLabels : void 0,
					error: "error" in result ? result.error : void 0,
					text: result.text
				});
			}
			if (action === "steer") {
				const target = readStringParam$1(params, "target", { required: true });
				const message = readStringParam$1(params, "message", { required: true });
				if (message.length > 4e3) return jsonResult({
					status: "error",
					action: "steer",
					target,
					error: `Message too long (${message.length} chars, max ${MAX_STEER_MESSAGE_CHARS}).`
				});
				const resolved = resolveControlledSubagentTarget(runs, target, {
					recentMinutes,
					isActive
				});
				if (!resolved.entry) return jsonResult({
					status: "error",
					action: "steer",
					target,
					error: resolved.error ?? "Unknown subagent target."
				});
				const result = await steerControlledSubagentRun({
					cfg,
					controller,
					entry: resolved.entry,
					message
				});
				return jsonResult({
					status: result.status,
					action: "steer",
					target,
					runId: result.runId,
					sessionKey: result.sessionKey,
					sessionId: result.sessionId,
					mode: "mode" in result ? result.mode : void 0,
					label: "label" in result ? result.label : void 0,
					error: "error" in result ? result.error : void 0,
					text: result.text
				});
			}
			return jsonResult({
				status: "error",
				error: "Unsupported action."
			});
		}
	};
}
//#endregion
//#region src/agents/tools/tts-tool.ts
const TtsToolSchema = Type.Object({
	text: Type.String({ description: "Text to convert to speech." }),
	channel: Type.Optional(Type.String({ description: "Optional channel id to pick output format (e.g. telegram)." }))
});
function createTtsTool(opts) {
	return {
		label: "TTS",
		name: "tts",
		displaySummary: "Convert text to speech and return audio.",
		description: `Convert text to speech. Audio is delivered automatically from the tool result — reply with ${SILENT_REPLY_TOKEN} after a successful call to avoid duplicate messages.`,
		parameters: TtsToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const text = readStringParam$1(params, "text", { required: true });
			const channel = readStringParam$1(params, "channel");
			const result = await textToSpeech({
				text,
				cfg: opts?.config ?? loadConfig(),
				channel: channel ?? opts?.agentChannel
			});
			if (result.success && result.audioPath) return {
				content: [{
					type: "text",
					text: "Generated audio reply."
				}],
				details: {
					audioPath: result.audioPath,
					provider: result.provider,
					media: {
						mediaUrl: result.audioPath,
						...result.voiceCompatible ? { audioAsVoice: true } : {}
					}
				}
			};
			return {
				content: [{
					type: "text",
					text: result.error ?? "TTS conversion failed"
				}],
				details: { error: result.error }
			};
		}
	};
}
//#endregion
//#region src/agents/tools/update-plan-tool.ts
const PLAN_STEP_STATUSES = [
	"pending",
	"in_progress",
	"completed"
];
const UpdatePlanToolSchema = Type.Object({
	explanation: Type.Optional(Type.String({ description: "Optional short note explaining what changed in the plan." })),
	plan: Type.Array(Type.Object({
		step: Type.String({ description: "Short plan step." }),
		status: stringEnum(PLAN_STEP_STATUSES, { description: "One of \"pending\", \"in_progress\", or \"completed\"." })
	}, { additionalProperties: true }), {
		minItems: 1,
		description: "Ordered list of plan steps. At most one step may be in_progress."
	})
});
function readPlanSteps(params) {
	const rawPlan = params.plan;
	if (!Array.isArray(rawPlan) || rawPlan.length === 0) throw new ToolInputError("plan required");
	const steps = rawPlan.map((entry, index) => {
		if (!entry || typeof entry !== "object") throw new ToolInputError(`plan[${index}] must be an object`);
		const stepParams = entry;
		const step = readStringParam$1(stepParams, "step", {
			required: true,
			label: `plan[${index}].step`
		});
		const status = readStringParam$1(stepParams, "status", {
			required: true,
			label: `plan[${index}].status`
		});
		if (!PLAN_STEP_STATUSES.includes(status)) throw new ToolInputError(`plan[${index}].status must be one of ${PLAN_STEP_STATUSES.join(", ")}`);
		return {
			step,
			status
		};
	});
	if (steps.filter((entry) => entry.status === "in_progress").length > 1) throw new ToolInputError("plan can contain at most one in_progress step");
	return steps;
}
function createUpdatePlanTool() {
	return {
		label: "Update Plan",
		name: "update_plan",
		displaySummary: UPDATE_PLAN_TOOL_DISPLAY_SUMMARY,
		description: describeUpdatePlanTool(),
		parameters: UpdatePlanToolSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const explanation = readStringParam$1(params, "explanation");
			const plan = readPlanSteps(params);
			return {
				content: [],
				details: {
					status: "updated",
					...explanation ? { explanation } : {},
					plan
				}
			};
		}
	};
}
//#endregion
//#region src/agents/video-generation-task-status.ts
const VIDEO_GENERATION_TASK_KIND = "video_generation";
const VIDEO_GENERATION_SOURCE_PREFIX = "video_generate";
function findActiveVideoGenerationTaskForSession(sessionKey) {
	return findActiveMediaGenerationTaskForSession({
		sessionKey,
		taskKind: VIDEO_GENERATION_TASK_KIND,
		sourcePrefix: VIDEO_GENERATION_SOURCE_PREFIX
	});
}
function buildVideoGenerationTaskStatusDetails(task) {
	return buildMediaGenerationTaskStatusDetails({
		task,
		sourcePrefix: VIDEO_GENERATION_SOURCE_PREFIX
	});
}
function buildVideoGenerationTaskStatusText(task, params) {
	return buildMediaGenerationTaskStatusText({
		task,
		sourcePrefix: VIDEO_GENERATION_SOURCE_PREFIX,
		nounLabel: "Video generation",
		toolName: "video_generate",
		completionLabel: "video",
		duplicateGuard: params?.duplicateGuard
	});
}
function buildActiveVideoGenerationTaskPromptContextForSession(sessionKey) {
	return buildActiveMediaGenerationTaskPromptContextForSession({
		sessionKey,
		taskKind: VIDEO_GENERATION_TASK_KIND,
		sourcePrefix: VIDEO_GENERATION_SOURCE_PREFIX,
		nounLabel: "Video generation",
		toolName: "video_generate",
		completionLabel: "videos"
	});
}
//#endregion
//#region src/agents/tools/video-generate-background.ts
const videoGenerationTaskLifecycle = createMediaGenerationTaskLifecycle({
	toolName: "video_generate",
	taskKind: VIDEO_GENERATION_TASK_KIND,
	label: "Video generation",
	queuedProgressSummary: "Queued video generation",
	generatedLabel: "video",
	failureProgressSummary: "Video generation failed",
	eventSource: "video_generation",
	announceType: "video generation task",
	completionLabel: "video"
});
const createVideoGenerationTaskRun = (...params) => videoGenerationTaskLifecycle.createTaskRun(...params);
const recordVideoGenerationTaskProgress = (...params) => videoGenerationTaskLifecycle.recordTaskProgress(...params);
const completeVideoGenerationTaskRun = (...params) => videoGenerationTaskLifecycle.completeTaskRun(...params);
const failVideoGenerationTaskRun = (...params) => videoGenerationTaskLifecycle.failTaskRun(...params);
async function wakeVideoGenerationTaskCompletion(params) {
	await videoGenerationTaskLifecycle.wakeTaskCompletion(params);
}
//#endregion
//#region src/agents/tools/video-generate-tool.actions.ts
function summarizeVideoGenerationCapabilities(provider) {
	const supportedModes = listSupportedVideoGenerationModes(provider);
	const generate = provider.capabilities.generate;
	const imageToVideo = provider.capabilities.imageToVideo;
	const videoToVideo = provider.capabilities.videoToVideo;
	const declaredProviderOptions = {};
	for (const [key, type] of Object.entries(provider.capabilities.providerOptions ?? {})) declaredProviderOptions[key] = type;
	for (const [key, type] of Object.entries(generate?.providerOptions ?? {})) declaredProviderOptions[key] = type;
	for (const [key, type] of Object.entries(imageToVideo?.providerOptions ?? {})) declaredProviderOptions[key] = type;
	for (const [key, type] of Object.entries(videoToVideo?.providerOptions ?? {})) declaredProviderOptions[key] = type;
	const maxInputAudios = generate?.maxInputAudios ?? imageToVideo?.maxInputAudios ?? videoToVideo?.maxInputAudios ?? provider.capabilities.maxInputAudios;
	return [
		supportedModes.length > 0 ? `modes=${supportedModes.join("/")}` : null,
		generate?.maxVideos ? `maxVideos=${generate.maxVideos}` : null,
		imageToVideo?.maxInputImages ? `maxInputImages=${imageToVideo.maxInputImages}` : null,
		videoToVideo?.maxInputVideos ? `maxInputVideos=${videoToVideo.maxInputVideos}` : null,
		typeof maxInputAudios === "number" && maxInputAudios > 0 ? `maxInputAudios=${maxInputAudios}` : null,
		generate?.maxDurationSeconds ? `maxDurationSeconds=${generate.maxDurationSeconds}` : null,
		generate?.supportedDurationSeconds?.length ? `supportedDurationSeconds=${generate.supportedDurationSeconds.join("/")}` : null,
		generate?.supportedDurationSecondsByModel && Object.keys(generate.supportedDurationSecondsByModel).length > 0 ? `supportedDurationSecondsByModel=${Object.entries(generate.supportedDurationSecondsByModel).map(([modelId, durations]) => `${modelId}:${durations.join("/")}`).join("; ")}` : null,
		generate?.supportsResolution ? "resolution" : null,
		generate?.supportsAspectRatio ? "aspectRatio" : null,
		generate?.supportsSize ? "size" : null,
		generate?.supportsAudio ? "audio" : null,
		generate?.supportsWatermark ? "watermark" : null,
		Object.keys(declaredProviderOptions).length > 0 ? `providerOptions={${Object.entries(declaredProviderOptions).map(([key, type]) => `${key}:${type}`).join(", ")}}` : null
	].filter((entry) => Boolean(entry)).join(", ");
}
function createVideoGenerateListActionResult(config) {
	return createMediaGenerateProviderListActionResult({
		providers: listRuntimeVideoGenerationProviders({ config }),
		emptyText: "No video-generation providers are registered.",
		listModes: listSupportedVideoGenerationModes,
		summarizeCapabilities: summarizeVideoGenerationCapabilities
	});
}
const videoGenerateTaskStatusActions = createMediaGenerateTaskStatusActions({
	inactiveText: "No active video generation task is currently running for this session.",
	findActiveTask: (sessionKey) => findActiveVideoGenerationTaskForSession(sessionKey) ?? void 0,
	buildStatusText: buildVideoGenerationTaskStatusText,
	buildStatusDetails: buildVideoGenerationTaskStatusDetails
});
function createVideoGenerateStatusActionResult(sessionKey) {
	return videoGenerateTaskStatusActions.createStatusActionResult(sessionKey);
}
function createVideoGenerateDuplicateGuardResult(sessionKey) {
	return videoGenerateTaskStatusActions.createDuplicateGuardResult(sessionKey);
}
//#endregion
//#region src/agents/tools/video-generate-tool.ts
const log = createSubsystemLogger("agents/tools/video-generate");
const MAX_INPUT_IMAGES = 9;
const MAX_INPUT_VIDEOS = 4;
const MAX_INPUT_AUDIOS = 3;
const SUPPORTED_ASPECT_RATIOS = new Set([
	"1:1",
	"2:3",
	"3:2",
	"3:4",
	"4:3",
	"4:5",
	"5:4",
	"9:16",
	"16:9",
	"21:9",
	"adaptive"
]);
const VideoGenerateToolSchema = Type.Object({
	action: Type.Optional(Type.String({ description: "Optional action: \"generate\" (default), \"status\" to inspect the active session task, or \"list\" to inspect available providers/models." })),
	prompt: Type.Optional(Type.String({ description: "Video generation prompt." })),
	image: Type.Optional(Type.String({ description: "Optional single reference image path or URL." })),
	images: Type.Optional(Type.Array(Type.String(), { description: `Optional reference images (up to ${MAX_INPUT_IMAGES}).` })),
	imageRoles: Type.Optional(Type.Array(Type.String(), { description: "Optional semantic roles for the combined reference image list, parallel by index. The list is `image` (if provided) followed by each entry in `images`, in order, after de-duplication. Canonical values: \"first_frame\", \"last_frame\", \"reference_image\". Providers may accept additional role strings. Must not have more entries than the combined image list; use an empty string to leave a position unset." })),
	video: Type.Optional(Type.String({ description: "Optional single reference video path or URL." })),
	videos: Type.Optional(Type.Array(Type.String(), { description: `Optional reference videos (up to ${MAX_INPUT_VIDEOS}).` })),
	videoRoles: Type.Optional(Type.Array(Type.String(), { description: "Optional semantic roles for the combined reference video list, parallel by index. The list is `video` (if provided) followed by each entry in `videos`, in order, after de-duplication. Canonical value: \"reference_video\". Providers may accept additional role strings. Must not have more entries than the combined video list; use an empty string to leave a position unset." })),
	audioRef: Type.Optional(Type.String({ description: "Optional single reference audio path or URL (e.g. background music)." })),
	audioRefs: Type.Optional(Type.Array(Type.String(), { description: `Optional reference audios (up to ${MAX_INPUT_AUDIOS}).` })),
	audioRoles: Type.Optional(Type.Array(Type.String(), { description: "Optional semantic roles for the combined reference audio list, parallel by index. The list is `audioRef` (if provided) followed by each entry in `audioRefs`, in order, after de-duplication. Canonical value: \"reference_audio\". Providers may accept additional role strings. Must not have more entries than the combined audio list; use an empty string to leave a position unset." })),
	model: Type.Optional(Type.String({ description: "Optional provider/model override, e.g. qwen/wan2.6-t2v." })),
	filename: Type.Optional(Type.String({ description: "Optional output filename hint. OpenClaw preserves the basename and saves under its managed media directory." })),
	size: Type.Optional(Type.String({ description: "Optional size hint like 1280x720 or 1920x1080 when the provider supports it." })),
	aspectRatio: Type.Optional(Type.String({ description: "Optional aspect ratio hint: 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, or \"adaptive\"." })),
	resolution: Type.Optional(Type.String({ description: "Optional resolution hint: 480P, 720P, 768P, or 1080P." })),
	durationSeconds: Type.Optional(Type.Number({
		description: "Optional target duration in seconds. OpenClaw may round this to the nearest provider-supported duration.",
		minimum: 1
	})),
	audio: Type.Optional(Type.Boolean({ description: "Optional audio toggle when the provider supports generated audio." })),
	watermark: Type.Optional(Type.Boolean({ description: "Optional watermark toggle when the provider supports it." })),
	providerOptions: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: "Optional provider-specific options as a JSON object, e.g. `{\"seed\": 42, \"draft\": true}`. Each provider declares its own accepted keys and primitive types (number/boolean/string) via its capabilities; unknown keys or type mismatches skip the candidate during fallback and never silently reach the wrong provider. Run `video_generate action=list` to see which keys each provider accepts." }))
});
function resolveVideoGenerationModelConfigForTool(params) {
	return resolveCapabilityModelConfigForTool({
		cfg: params.cfg,
		agentDir: params.agentDir,
		modelConfig: params.cfg?.agents?.defaults?.videoGenerationModel,
		providers: listRuntimeVideoGenerationProviders({ config: params.cfg })
	});
}
function resolveAction(args) {
	return resolveGenerateAction({
		args,
		allowed: [
			"generate",
			"status",
			"list"
		],
		defaultAction: "generate"
	});
}
function normalizeResolution(raw) {
	const normalized = raw?.trim().toUpperCase();
	if (!normalized) return;
	if (normalized === "480P" || normalized === "720P" || normalized === "768P" || normalized === "1080P") return normalized;
	throw new ToolInputError("resolution must be one of 480P, 720P, 768P, or 1080P");
}
function normalizeAspectRatio(raw) {
	const normalized = raw?.trim();
	if (!normalized) return;
	if (SUPPORTED_ASPECT_RATIOS.has(normalized)) return normalized;
	throw new ToolInputError("aspectRatio must be one of 1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9, or adaptive");
}
/**
* Parse a `*Roles` parallel string array for `video_generate`. Throws when
* the caller supplies more roles than assets so off-by-one alignment bugs
* fail loudly at the tool boundary instead of silently dropping the
* trailing roles. Empty strings in the array are allowed and mean "no
* role at this position". Non-string entries are coerced to empty strings
* and treated as "unset" so providers can leave individual slots empty.
*/
function parseRoleArray(params) {
	if (params.raw === void 0 || params.raw === null) return [];
	if (!Array.isArray(params.raw)) throw new ToolInputError(`${params.kind} must be a JSON array of role strings, parallel to the reference list.`);
	const roles = params.raw.map((entry) => typeof entry === "string" ? entry.trim() : "");
	if (roles.length > params.assetCount) throw new ToolInputError(`${params.kind} has ${roles.length} entries but only ${params.assetCount} reference ${params.kind === "imageRoles" ? "image" : params.kind === "videoRoles" ? "video" : "audio"}${params.assetCount === 1 ? "" : "s"} were provided; extra roles cannot be aligned positionally.`);
	return roles;
}
function normalizeReferenceInputs(params) {
	return normalizeMediaReferenceInputs({
		args: params.args,
		singularKey: params.singularKey,
		pluralKey: params.pluralKey,
		maxCount: params.maxCount,
		label: `reference ${params.pluralKey}`
	});
}
function resolveSelectedVideoGenerationProvider(params) {
	return resolveSelectedCapabilityProvider({
		providers: listRuntimeVideoGenerationProviders({ config: params.config }),
		modelConfig: params.videoGenerationModelConfig,
		modelOverride: params.modelOverride,
		parseModelRef: parseVideoGenerationModelRef
	});
}
function validateVideoGenerationCapabilities(params) {
	const provider = params.provider;
	if (!provider) return;
	const mode = resolveVideoGenerationMode({
		inputImageCount: params.inputImageCount,
		inputVideoCount: params.inputVideoCount
	});
	const { capabilities: caps } = resolveVideoGenerationModeCapabilities({
		provider,
		inputImageCount: params.inputImageCount,
		inputVideoCount: params.inputVideoCount
	});
	if (!caps && mode === "imageToVideo" && params.inputVideoCount === 0) throw new ToolInputError(`${provider.id} does not support image-to-video reference inputs.`);
	if (!caps && mode === "videoToVideo" && params.inputImageCount === 0) throw new ToolInputError(`${provider.id} does not support video-to-video reference inputs.`);
	if (!caps) return;
	if (mode === "imageToVideo" && "enabled" in caps && !caps.enabled && params.inputVideoCount === 0) throw new ToolInputError(`${provider.id} does not support image-to-video reference inputs.`);
	if (mode === "videoToVideo" && "enabled" in caps && !caps.enabled && params.inputImageCount === 0) throw new ToolInputError(`${provider.id} does not support video-to-video reference inputs.`);
	if (params.inputImageCount > 0) {
		const maxInputImages = caps.maxInputImages ?? MAX_INPUT_IMAGES;
		if (params.inputImageCount > maxInputImages) throw new ToolInputError(`${provider.id} supports at most ${maxInputImages} reference image${maxInputImages === 1 ? "" : "s"}.`);
	}
	if (params.inputVideoCount > 0) {
		const maxInputVideos = caps.maxInputVideos ?? MAX_INPUT_VIDEOS;
		if (params.inputVideoCount > maxInputVideos) throw new ToolInputError(`${provider.id} supports at most ${maxInputVideos} reference video${maxInputVideos === 1 ? "" : "s"}.`);
	}
}
function formatIgnoredVideoGenerationOverride(override) {
	return `${override.key}=${String(override.value)}`;
}
function defaultScheduleVideoGenerateBackgroundWork(work) {
	queueMicrotask(() => {
		work().catch((error) => {
			log.error("Detached video generation job crashed", { error });
		});
	});
}
async function loadReferenceAssets(params) {
	const loaded = [];
	for (const rawInput of params.inputs) {
		const trimmed = rawInput.trim();
		const inputRaw = trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;
		if (!inputRaw) throw new ToolInputError(`${params.expectedKind} required (empty string in array)`);
		const looksLikeWindowsDrivePath = /^[a-zA-Z]:[\\/]/.test(inputRaw);
		const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(inputRaw);
		const isFileUrl = /^file:/i.test(inputRaw);
		const isHttpUrl = /^https?:\/\//i.test(inputRaw);
		const isDataUrl = /^data:/i.test(inputRaw);
		if (hasScheme && !looksLikeWindowsDrivePath && !isFileUrl && !isHttpUrl && !isDataUrl) throw new ToolInputError(`Unsupported ${params.expectedKind} reference: ${rawInput}. Use a file path, a file:// URL, a data: URL, or an http(s) URL.`);
		if (params.sandboxConfig && isHttpUrl) throw new ToolInputError(`Sandboxed video_generate does not allow remote ${params.expectedKind} URLs.`);
		const resolvedInput = (() => {
			if (params.sandboxConfig) return inputRaw;
			if (inputRaw.startsWith("~")) return resolveUserPath(inputRaw);
			return inputRaw;
		})();
		if (isHttpUrl && !params.sandboxConfig) {
			loaded.push({
				sourceAsset: { url: resolvedInput },
				resolvedInput
			});
			continue;
		}
		const resolvedPathInfo = isDataUrl ? { resolved: "" } : params.sandboxConfig ? await resolveSandboxedBridgeMediaPath({
			sandbox: params.sandboxConfig,
			mediaPath: resolvedInput,
			inboundFallbackDir: "media/inbound"
		}) : { resolved: resolvedInput.startsWith("file://") ? resolvedInput.slice(7) : resolvedInput };
		const resolvedPath = isDataUrl ? null : resolvedPathInfo.resolved;
		const localRoots = resolveMediaToolLocalRoots(params.workspaceDir, { workspaceOnly: params.sandboxConfig?.workspaceOnly === true }, resolvedPath ? [resolvedPath] : void 0);
		const media = isDataUrl ? params.expectedKind === "image" ? decodeDataUrl(resolvedInput) : (() => {
			throw new ToolInputError(`${params.expectedKind} data: URLs are not supported for video_generate.`);
		})() : params.sandboxConfig ? await loadWebMedia(resolvedPath ?? resolvedInput, {
			maxBytes: params.maxBytes,
			sandboxValidated: true,
			readFile: createSandboxBridgeReadFile({ sandbox: params.sandboxConfig })
		}) : await loadWebMedia(resolvedPath ?? resolvedInput, {
			maxBytes: params.maxBytes,
			localRoots
		});
		if (media.kind !== params.expectedKind) throw new ToolInputError(`Unsupported media type: ${media.kind ?? "unknown"}`);
		const mimeType = "mimeType" in media ? media.mimeType : media.contentType;
		const fileName = "fileName" in media ? media.fileName : void 0;
		loaded.push({
			sourceAsset: {
				buffer: media.buffer,
				mimeType,
				fileName
			},
			resolvedInput,
			...resolvedPathInfo.rewrittenFrom ? { rewrittenFrom: resolvedPathInfo.rewrittenFrom } : {}
		});
	}
	return loaded;
}
async function executeVideoGenerationJob(params) {
	if (params.taskHandle) recordVideoGenerationTaskProgress({
		handle: params.taskHandle,
		progressSummary: "Generating video"
	});
	const result = await generateVideo({
		cfg: params.effectiveCfg,
		prompt: params.prompt,
		agentDir: params.agentDir,
		modelOverride: params.model,
		size: params.size,
		aspectRatio: params.aspectRatio,
		resolution: params.resolution,
		durationSeconds: params.durationSeconds,
		audio: params.audio,
		watermark: params.watermark,
		inputImages: params.loadedReferenceImages.map((entry) => entry.sourceAsset),
		inputVideos: params.loadedReferenceVideos.map((entry) => entry.sourceAsset),
		inputAudios: params.loadedReferenceAudios.map((entry) => entry.sourceAsset),
		providerOptions: params.providerOptions
	});
	if (params.taskHandle) recordVideoGenerationTaskProgress({
		handle: params.taskHandle,
		progressSummary: "Saving generated video"
	});
	const urlOnlyVideos = [];
	const bufferVideos = [];
	for (const video of result.videos) {
		if (video.buffer) {
			bufferVideos.push(video);
			continue;
		}
		if (video.url) {
			urlOnlyVideos.push({
				url: video.url,
				mimeType: video.mimeType,
				fileName: video.fileName
			});
			continue;
		}
		throw new Error(`Provider ${result.provider} returned a video asset with neither buffer nor url — cannot deliver.`);
	}
	const configuredMediaMaxBytes = resolveConfiguredMediaMaxBytes(params.effectiveCfg);
	const savedVideos = await Promise.all(bufferVideos.map((video) => saveMediaBuffer(video.buffer, video.mimeType, "tool-video-generation", configuredMediaMaxBytes, params.filename || video.fileName)));
	const totalCount = savedVideos.length + urlOnlyVideos.length;
	const requestedDurationSeconds = result.normalization?.durationSeconds?.requested ?? (typeof result.metadata?.requestedDurationSeconds === "number" && Number.isFinite(result.metadata.requestedDurationSeconds) ? result.metadata.requestedDurationSeconds : params.durationSeconds);
	const ignoredOverrides = result.ignoredOverrides ?? [];
	const ignoredOverrideKeys = new Set(ignoredOverrides.map((entry) => entry.key));
	const warning = ignoredOverrides.length > 0 ? `Ignored unsupported overrides for ${result.provider}/${result.model}: ${ignoredOverrides.map(formatIgnoredVideoGenerationOverride).join(", ")}.` : void 0;
	const normalizedDurationSeconds = result.normalization?.durationSeconds?.applied ?? (typeof result.metadata?.normalizedDurationSeconds === "number" && Number.isFinite(result.metadata.normalizedDurationSeconds) ? result.metadata.normalizedDurationSeconds : requestedDurationSeconds);
	const supportedDurationSeconds = result.normalization?.durationSeconds?.supportedValues ?? (Array.isArray(result.metadata?.supportedDurationSeconds) ? result.metadata.supportedDurationSeconds.filter((entry) => typeof entry === "number" && Number.isFinite(entry)) : void 0);
	const normalizedSize = result.normalization?.size?.applied ?? (typeof result.metadata?.normalizedSize === "string" && result.metadata.normalizedSize.trim() ? result.metadata.normalizedSize : void 0);
	const normalizedAspectRatio = result.normalization?.aspectRatio?.applied ?? (typeof result.metadata?.normalizedAspectRatio === "string" && result.metadata.normalizedAspectRatio.trim() ? result.metadata.normalizedAspectRatio : void 0);
	const normalizedResolution = result.normalization?.resolution?.applied ?? (typeof result.metadata?.normalizedResolution === "string" && result.metadata.normalizedResolution.trim() ? result.metadata.normalizedResolution : void 0);
	const sizeTranslatedToAspectRatio = result.normalization?.aspectRatio?.derivedFrom === "size" || !normalizedSize && typeof result.metadata?.requestedSize === "string" && result.metadata.requestedSize === params.size && Boolean(normalizedAspectRatio);
	const allMediaUrls = [...savedVideos.map((video) => video.path), ...urlOnlyVideos.map((video) => video.url)];
	const lines = [
		`Generated ${totalCount} video${totalCount === 1 ? "" : "s"} with ${result.provider}/${result.model}.`,
		...warning ? [`Warning: ${warning}`] : [],
		typeof requestedDurationSeconds === "number" && typeof normalizedDurationSeconds === "number" && requestedDurationSeconds !== normalizedDurationSeconds ? `Duration normalized: requested ${requestedDurationSeconds}s; used ${normalizedDurationSeconds}s.` : null,
		...savedVideos.map((video) => `MEDIA:${video.path}`),
		...urlOnlyVideos.map((video) => `MEDIA:${video.url}`)
	].filter((entry) => Boolean(entry));
	return {
		provider: result.provider,
		model: result.model,
		savedPaths: savedVideos.map((video) => video.path),
		urlOnlyUrls: urlOnlyVideos.map((video) => video.url),
		count: totalCount,
		contentText: lines.join("\n"),
		wakeResult: lines.join("\n"),
		details: {
			provider: result.provider,
			model: result.model,
			count: totalCount,
			media: { mediaUrls: allMediaUrls },
			paths: allMediaUrls,
			...buildTaskRunDetails(params.taskHandle),
			...buildMediaReferenceDetails({
				entries: params.loadedReferenceImages,
				singleKey: "image",
				pluralKey: "images",
				getResolvedInput: (entry) => entry.resolvedInput
			}),
			...buildMediaReferenceDetails({
				entries: params.loadedReferenceVideos,
				singleKey: "video",
				pluralKey: "videos",
				getResolvedInput: (entry) => entry.resolvedInput,
				singleRewriteKey: "videoRewrittenFrom"
			}),
			...normalizedSize || !ignoredOverrideKeys.has("size") && params.size && !sizeTranslatedToAspectRatio ? { size: normalizedSize ?? params.size } : {},
			...normalizedAspectRatio || !ignoredOverrideKeys.has("aspectRatio") && params.aspectRatio ? { aspectRatio: normalizedAspectRatio ?? params.aspectRatio } : {},
			...normalizedResolution || !ignoredOverrideKeys.has("resolution") && params.resolution ? { resolution: normalizedResolution ?? params.resolution } : {},
			...typeof normalizedDurationSeconds === "number" ? { durationSeconds: normalizedDurationSeconds } : {},
			...typeof requestedDurationSeconds === "number" && typeof normalizedDurationSeconds === "number" && requestedDurationSeconds !== normalizedDurationSeconds ? { requestedDurationSeconds } : {},
			...supportedDurationSeconds && supportedDurationSeconds.length > 0 ? { supportedDurationSeconds } : {},
			...!ignoredOverrideKeys.has("audio") && typeof params.audio === "boolean" ? { audio: params.audio } : {},
			...!ignoredOverrideKeys.has("watermark") && typeof params.watermark === "boolean" ? { watermark: params.watermark } : {},
			...params.filename ? { filename: params.filename } : {},
			attempts: result.attempts,
			...result.normalization ? { normalization: result.normalization } : {},
			metadata: result.metadata,
			...warning ? { warning } : {},
			...ignoredOverrides.length > 0 ? { ignoredOverrides } : {}
		}
	};
}
function createVideoGenerateTool(options) {
	const cfg = options?.config ?? loadConfig();
	const videoGenerationModelConfig = resolveVideoGenerationModelConfigForTool({
		cfg,
		agentDir: options?.agentDir
	});
	if (!videoGenerationModelConfig) return null;
	const sandboxConfig = options?.sandbox ? {
		root: options.sandbox.root,
		bridge: options.sandbox.bridge,
		workspaceOnly: options.fsPolicy?.workspaceOnly === true
	} : null;
	const scheduleBackgroundWork = options?.scheduleBackgroundWork ?? defaultScheduleVideoGenerateBackgroundWork;
	return {
		label: "Video Generation",
		name: "video_generate",
		displaySummary: "Generate videos",
		description: "Generate videos using configured providers. Generated videos are saved under OpenClaw-managed media storage and delivered automatically as attachments. Duration requests may be rounded to the nearest provider-supported value.",
		parameters: VideoGenerateToolSchema,
		execute: async (_toolCallId, rawArgs) => {
			const args = rawArgs;
			const action = resolveAction(args);
			const effectiveCfg = applyVideoGenerationModelConfigDefaults(cfg, videoGenerationModelConfig) ?? cfg;
			if (action === "list") return createVideoGenerateListActionResult(effectiveCfg);
			if (action === "status") return createVideoGenerateStatusActionResult(options?.agentSessionKey);
			const duplicateGuardResult = createVideoGenerateDuplicateGuardResult(options?.agentSessionKey);
			if (duplicateGuardResult) return duplicateGuardResult;
			const prompt = readStringParam$1(args, "prompt", { required: true });
			const model = readStringParam$1(args, "model");
			const filename = readStringParam$1(args, "filename");
			const size = readStringParam$1(args, "size");
			const aspectRatio = normalizeAspectRatio(readStringParam$1(args, "aspectRatio"));
			const resolution = normalizeResolution(readStringParam$1(args, "resolution"));
			const durationSeconds = readNumberParam(args, "durationSeconds", {
				integer: true,
				strict: true
			});
			const audio = readBooleanToolParam(args, "audio");
			const watermark = readBooleanToolParam(args, "watermark");
			const providerOptionsRaw = readSnakeCaseParamRaw(args, "providerOptions");
			if (providerOptionsRaw != null && (typeof providerOptionsRaw !== "object" || Array.isArray(providerOptionsRaw))) throw new ToolInputError("providerOptions must be a JSON object keyed by provider-specific option name.");
			const providerOptions = providerOptionsRaw != null ? providerOptionsRaw : void 0;
			const imageInputs = normalizeReferenceInputs({
				args,
				singularKey: "image",
				pluralKey: "images",
				maxCount: MAX_INPUT_IMAGES
			});
			const imageRoles = parseRoleArray({
				raw: readSnakeCaseParamRaw(args, "imageRoles"),
				kind: "imageRoles",
				assetCount: imageInputs.length
			});
			const videoInputs = normalizeReferenceInputs({
				args,
				singularKey: "video",
				pluralKey: "videos",
				maxCount: MAX_INPUT_VIDEOS
			});
			const videoRoles = parseRoleArray({
				raw: readSnakeCaseParamRaw(args, "videoRoles"),
				kind: "videoRoles",
				assetCount: videoInputs.length
			});
			const audioInputs = normalizeReferenceInputs({
				args,
				singularKey: "audioRef",
				pluralKey: "audioRefs",
				maxCount: MAX_INPUT_AUDIOS
			});
			const audioRoles = parseRoleArray({
				raw: readSnakeCaseParamRaw(args, "audioRoles"),
				kind: "audioRoles",
				assetCount: audioInputs.length
			});
			const selectedProvider = resolveSelectedVideoGenerationProvider({
				config: effectiveCfg,
				videoGenerationModelConfig,
				modelOverride: model
			});
			const loadedReferenceImages = await loadReferenceAssets({
				inputs: imageInputs,
				expectedKind: "image",
				workspaceDir: options?.workspaceDir,
				sandboxConfig
			});
			for (let i = 0; i < loadedReferenceImages.length; i++) {
				const role = imageRoles[i];
				if (role) loadedReferenceImages[i].sourceAsset.role = role;
			}
			const loadedReferenceVideos = await loadReferenceAssets({
				inputs: videoInputs,
				expectedKind: "video",
				workspaceDir: options?.workspaceDir,
				sandboxConfig
			});
			for (let i = 0; i < loadedReferenceVideos.length; i++) {
				const role = videoRoles[i];
				if (role) loadedReferenceVideos[i].sourceAsset.role = role;
			}
			const loadedReferenceAudios = await loadReferenceAssets({
				inputs: audioInputs,
				expectedKind: "audio",
				workspaceDir: options?.workspaceDir,
				sandboxConfig
			});
			for (let i = 0; i < loadedReferenceAudios.length; i++) {
				const role = audioRoles[i];
				if (role) loadedReferenceAudios[i].sourceAsset.role = role;
			}
			validateVideoGenerationCapabilities({
				provider: selectedProvider,
				model: parseVideoGenerationModelRef(model)?.model ?? model ?? selectedProvider?.defaultModel,
				inputImageCount: loadedReferenceImages.length,
				inputVideoCount: loadedReferenceVideos.length,
				inputAudioCount: loadedReferenceAudios.length,
				size,
				aspectRatio,
				resolution,
				durationSeconds,
				audio,
				watermark
			});
			const taskHandle = createVideoGenerationTaskRun({
				sessionKey: options?.agentSessionKey,
				requesterOrigin: options?.requesterOrigin,
				prompt,
				providerId: selectedProvider?.id
			});
			if (Boolean(taskHandle && options?.agentSessionKey?.trim())) {
				scheduleBackgroundWork(async () => {
					try {
						const executed = await executeVideoGenerationJob({
							effectiveCfg,
							prompt,
							agentDir: options?.agentDir,
							model,
							size,
							aspectRatio,
							resolution,
							durationSeconds,
							audio,
							watermark,
							filename,
							loadedReferenceImages,
							loadedReferenceVideos,
							loadedReferenceAudios,
							taskHandle,
							providerOptions
						});
						completeVideoGenerationTaskRun({
							handle: taskHandle,
							provider: executed.provider,
							model: executed.model,
							count: executed.count,
							paths: executed.savedPaths
						});
						try {
							await wakeVideoGenerationTaskCompletion({
								config: effectiveCfg,
								handle: taskHandle,
								status: "ok",
								statusLabel: "completed successfully",
								result: executed.wakeResult,
								mediaUrls: [...executed.savedPaths, ...executed.urlOnlyUrls]
							});
						} catch (error) {
							log.warn("Video generation completion wake failed after successful generation", {
								taskId: taskHandle?.taskId,
								runId: taskHandle?.runId,
								error
							});
						}
					} catch (error) {
						failVideoGenerationTaskRun({
							handle: taskHandle,
							error
						});
						await wakeVideoGenerationTaskCompletion({
							config: effectiveCfg,
							handle: taskHandle,
							status: "error",
							statusLabel: "failed",
							result: formatErrorMessage(error)
						});
						return;
					}
				});
				return {
					content: [{
						type: "text",
						text: `Background task started for video generation (${taskHandle?.taskId ?? "unknown"}). Do not call video_generate again for this request. Wait for the completion event; I'll post the finished video here when it's ready.`
					}],
					details: {
						async: true,
						status: "started",
						...buildTaskRunDetails(taskHandle),
						...buildMediaReferenceDetails({
							entries: loadedReferenceImages,
							singleKey: "image",
							pluralKey: "images",
							getResolvedInput: (entry) => entry.resolvedInput
						}),
						...buildMediaReferenceDetails({
							entries: loadedReferenceVideos,
							singleKey: "video",
							pluralKey: "videos",
							getResolvedInput: (entry) => entry.resolvedInput,
							singleRewriteKey: "videoRewrittenFrom"
						}),
						...model ? { model } : {},
						...size ? { size } : {},
						...aspectRatio ? { aspectRatio } : {},
						...resolution ? { resolution } : {},
						...typeof durationSeconds === "number" ? { durationSeconds } : {},
						...typeof audio === "boolean" ? { audio } : {},
						...typeof watermark === "boolean" ? { watermark } : {},
						...filename ? { filename } : {}
					}
				};
			}
			try {
				const executed = await executeVideoGenerationJob({
					effectiveCfg,
					prompt,
					agentDir: options?.agentDir,
					model,
					size,
					aspectRatio,
					resolution,
					durationSeconds,
					audio,
					watermark,
					filename,
					loadedReferenceImages,
					loadedReferenceVideos,
					loadedReferenceAudios,
					taskHandle,
					providerOptions
				});
				completeVideoGenerationTaskRun({
					handle: taskHandle,
					provider: executed.provider,
					model: executed.model,
					count: executed.count,
					paths: executed.savedPaths
				});
				return {
					content: [{
						type: "text",
						text: executed.contentText
					}],
					details: executed.details
				};
			} catch (error) {
				failVideoGenerationTaskRun({
					handle: taskHandle,
					error
				});
				throw error;
			}
		}
	};
}
//#endregion
//#region src/agents/tools/web-fetch.ts
const EXTRACT_MODES = ["markdown", "text"];
const DEFAULT_FETCH_MAX_CHARS = 2e4;
const DEFAULT_FETCH_MAX_RESPONSE_BYTES = 75e4;
const FETCH_MAX_RESPONSE_BYTES_MIN = 32e3;
const FETCH_MAX_RESPONSE_BYTES_MAX = 1e7;
const DEFAULT_FETCH_MAX_REDIRECTS = 3;
const DEFAULT_ERROR_MAX_CHARS = 4e3;
const DEFAULT_ERROR_MAX_BYTES = 64e3;
const DEFAULT_FETCH_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const FETCH_CACHE = /* @__PURE__ */ new Map();
const WebFetchSchema = Type.Object({
	url: Type.String({ description: "HTTP or HTTPS URL to fetch." }),
	extractMode: Type.Optional(stringEnum(EXTRACT_MODES, {
		description: "Extraction mode (\"markdown\" or \"text\").",
		default: "markdown"
	})),
	maxChars: Type.Optional(Type.Number({
		description: "Maximum characters to return (truncates when exceeded).",
		minimum: 100
	}))
});
function resolveFetchConfig(cfg) {
	return resolveWebProviderConfig(cfg, "fetch");
}
function resolveFetchEnabled(params) {
	if (typeof params.fetch?.enabled === "boolean") return params.fetch.enabled;
	return true;
}
function resolveFetchReadabilityEnabled(fetch) {
	if (typeof fetch?.readability === "boolean") return fetch.readability;
	return true;
}
function resolveFetchMaxCharsCap(fetch) {
	const raw = fetch && "maxCharsCap" in fetch && typeof fetch.maxCharsCap === "number" ? fetch.maxCharsCap : void 0;
	if (typeof raw !== "number" || !Number.isFinite(raw)) return DEFAULT_FETCH_MAX_CHARS;
	return Math.max(100, Math.floor(raw));
}
function resolveFetchMaxResponseBytes(fetch) {
	const raw = fetch && "maxResponseBytes" in fetch && typeof fetch.maxResponseBytes === "number" ? fetch.maxResponseBytes : void 0;
	if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return DEFAULT_FETCH_MAX_RESPONSE_BYTES;
	return Math.min(FETCH_MAX_RESPONSE_BYTES_MAX, Math.max(FETCH_MAX_RESPONSE_BYTES_MIN, Math.floor(raw)));
}
function resolveMaxChars(value, fallback, cap) {
	return Math.min(Math.max(100, Math.floor(typeof value === "number" && Number.isFinite(value) ? value : fallback)), cap);
}
function resolveMaxRedirects(value, fallback) {
	return Math.max(0, Math.floor(typeof value === "number" && Number.isFinite(value) ? value : fallback));
}
function looksLikeHtml(value) {
	const trimmed = value.trimStart();
	if (!trimmed) return false;
	const head = normalizeLowercaseStringOrEmpty(trimmed.slice(0, 256));
	return head.startsWith("<!doctype html") || head.startsWith("<html");
}
function formatWebFetchErrorDetail(params) {
	const { detail, contentType, maxChars } = params;
	if (!detail) return "";
	let text = detail;
	if (normalizeOptionalLowercaseString(contentType)?.includes("text/html") || looksLikeHtml(detail)) {
		const rendered = htmlToMarkdown(detail);
		text = markdownToText(rendered.title ? `${rendered.title}\n${rendered.text}` : rendered.text);
	}
	return truncateText$1(text.trim(), maxChars).text;
}
function redactUrlForDebugLog(rawUrl) {
	try {
		const parsed = new URL(rawUrl);
		return parsed.pathname && parsed.pathname !== "/" ? `${parsed.origin}/...` : parsed.origin;
	} catch {
		return "[invalid-url]";
	}
}
const WEB_FETCH_WRAPPER_WITH_WARNING_OVERHEAD = wrapWebContent("", "web_fetch").length;
const WEB_FETCH_WRAPPER_NO_WARNING_OVERHEAD = wrapExternalContent("", {
	source: "web_fetch",
	includeWarning: false
}).length;
function wrapWebFetchContent(value, maxChars) {
	if (maxChars <= 0) return {
		text: "",
		truncated: true,
		rawLength: 0,
		wrappedLength: 0
	};
	const includeWarning = maxChars >= WEB_FETCH_WRAPPER_WITH_WARNING_OVERHEAD;
	const wrapperOverhead = includeWarning ? WEB_FETCH_WRAPPER_WITH_WARNING_OVERHEAD : WEB_FETCH_WRAPPER_NO_WARNING_OVERHEAD;
	if (wrapperOverhead > maxChars) {
		const truncatedWrapper = truncateText$1(includeWarning ? wrapWebContent("", "web_fetch") : wrapExternalContent("", {
			source: "web_fetch",
			includeWarning: false
		}), maxChars);
		return {
			text: truncatedWrapper.text,
			truncated: true,
			rawLength: 0,
			wrappedLength: truncatedWrapper.text.length
		};
	}
	const maxInner = Math.max(0, maxChars - wrapperOverhead);
	let truncated = truncateText$1(value, maxInner);
	let wrappedText = includeWarning ? wrapWebContent(truncated.text, "web_fetch") : wrapExternalContent(truncated.text, {
		source: "web_fetch",
		includeWarning: false
	});
	if (wrappedText.length > maxChars) {
		const excess = wrappedText.length - maxChars;
		truncated = truncateText$1(value, Math.max(0, maxInner - excess));
		wrappedText = includeWarning ? wrapWebContent(truncated.text, "web_fetch") : wrapExternalContent(truncated.text, {
			source: "web_fetch",
			includeWarning: false
		});
	}
	return {
		text: wrappedText,
		truncated: truncated.truncated,
		rawLength: truncated.text.length,
		wrappedLength: wrappedText.length
	};
}
function wrapWebFetchField(value) {
	if (!value) return value;
	return wrapExternalContent(value, {
		source: "web_fetch",
		includeWarning: false
	});
}
function normalizeContentType(value) {
	if (!value) return;
	const [raw] = value.split(";");
	return raw?.trim() || void 0;
}
function normalizeProviderFinalUrl(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	for (const char of trimmed) {
		const code = char.charCodeAt(0);
		if (code <= 32 || code === 127) return;
	}
	try {
		const url = new URL(trimmed);
		if (url.protocol !== "http:" && url.protocol !== "https:") return;
		return url.toString();
	} catch {
		return;
	}
}
function normalizeProviderWebFetchPayload(params) {
	const payload = isRecord(params.payload) ? params.payload : {};
	const wrapped = wrapWebFetchContent(typeof payload.text === "string" ? payload.text : "", params.maxChars);
	const url = params.requestedUrl;
	const finalUrl = normalizeProviderFinalUrl(payload.finalUrl) ?? url;
	const status = typeof payload.status === "number" && Number.isFinite(payload.status) ? Math.max(0, Math.floor(payload.status)) : 200;
	const contentType = typeof payload.contentType === "string" ? normalizeContentType(payload.contentType) : void 0;
	const title = typeof payload.title === "string" ? wrapWebFetchField(payload.title) : void 0;
	const warning = typeof payload.warning === "string" ? wrapWebFetchField(payload.warning) : void 0;
	const extractor = typeof payload.extractor === "string" && payload.extractor.trim() ? payload.extractor : params.providerId;
	return {
		url,
		finalUrl,
		...contentType ? { contentType } : {},
		status,
		...title ? { title } : {},
		extractMode: params.extractMode,
		extractor,
		externalContent: {
			untrusted: true,
			source: "web_fetch",
			wrapped: true,
			provider: params.providerId
		},
		truncated: wrapped.truncated,
		length: wrapped.wrappedLength,
		rawLength: wrapped.rawLength,
		wrappedLength: wrapped.wrappedLength,
		fetchedAt: typeof payload.fetchedAt === "string" && payload.fetchedAt ? payload.fetchedAt : (/* @__PURE__ */ new Date()).toISOString(),
		tookMs: typeof payload.tookMs === "number" && Number.isFinite(payload.tookMs) ? Math.max(0, Math.floor(payload.tookMs)) : params.tookMs,
		text: wrapped.text,
		...warning ? { warning } : {}
	};
}
async function maybeFetchProviderWebFetchPayload(params) {
	const providerFallback = params.resolveProviderFallback();
	if (!providerFallback) return null;
	const rawPayload = await providerFallback.definition.execute({
		url: params.urlToFetch,
		extractMode: params.extractMode,
		maxChars: params.maxChars
	});
	const payload = normalizeProviderWebFetchPayload({
		providerId: providerFallback.provider.id,
		payload: rawPayload,
		requestedUrl: params.url,
		extractMode: params.extractMode,
		maxChars: params.maxChars,
		tookMs: params.tookMs
	});
	writeCache(FETCH_CACHE, params.cacheKey, payload, params.cacheTtlMs);
	return payload;
}
async function runWebFetch(params) {
	const allowRfc2544BenchmarkRange = params.ssrfPolicy?.allowRfc2544BenchmarkRange === true;
	const cacheKey = normalizeCacheKey(`fetch:${params.url}:${params.extractMode}:${params.maxChars}${allowRfc2544BenchmarkRange ? ":allow-rfc2544" : ""}`);
	const cached = readCache(FETCH_CACHE, cacheKey);
	if (cached) return {
		...cached.value,
		cached: true
	};
	let parsedUrl;
	try {
		parsedUrl = new URL(params.url);
	} catch {
		throw new Error("Invalid URL: must be http or https");
	}
	if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("Invalid URL: must be http or https");
	const start = Date.now();
	let res;
	let release = null;
	let finalUrl = params.url;
	try {
		const result = await fetchWithWebToolsNetworkGuard({
			url: params.url,
			maxRedirects: params.maxRedirects,
			timeoutSeconds: params.timeoutSeconds,
			lookupFn: params.lookupFn,
			policy: allowRfc2544BenchmarkRange ? { allowRfc2544BenchmarkRange } : void 0,
			init: { headers: {
				Accept: "text/markdown, text/html;q=0.9, */*;q=0.1",
				"User-Agent": params.userAgent,
				"Accept-Language": "en-US,en;q=0.9"
			} }
		});
		res = result.response;
		finalUrl = result.finalUrl;
		release = result.release;
		const markdownTokens = res.headers.get("x-markdown-tokens");
		if (markdownTokens) logDebug(`[web-fetch] x-markdown-tokens: ${markdownTokens} (${redactUrlForDebugLog(finalUrl)})`);
	} catch (error) {
		if (error instanceof SsrFBlockedError) throw error;
		const payload = await maybeFetchProviderWebFetchPayload({
			...params,
			urlToFetch: finalUrl,
			cacheKey,
			tookMs: Date.now() - start
		});
		if (payload) return payload;
		throw error;
	}
	try {
		if (!res.ok) {
			const payload = await maybeFetchProviderWebFetchPayload({
				...params,
				urlToFetch: params.url,
				cacheKey,
				tookMs: Date.now() - start
			});
			if (payload) return payload;
			const rawDetail = (await readResponseText(res, { maxBytes: DEFAULT_ERROR_MAX_BYTES })).text;
			const wrappedDetail = wrapWebFetchContent(formatWebFetchErrorDetail({
				detail: rawDetail,
				contentType: res.headers.get("content-type"),
				maxChars: DEFAULT_ERROR_MAX_CHARS
			}) || res.statusText, DEFAULT_ERROR_MAX_CHARS);
			throw new Error(`Web fetch failed (${res.status}): ${wrappedDetail.text}`);
		}
		const contentType = res.headers.get("content-type") ?? "application/octet-stream";
		const normalizedContentType = normalizeContentType(contentType) ?? "application/octet-stream";
		const bodyResult = await readResponseText(res, { maxBytes: params.maxResponseBytes });
		const body = bodyResult.text;
		const responseTruncatedWarning = bodyResult.truncated ? `Response body truncated after ${params.maxResponseBytes} bytes.` : void 0;
		let title;
		let extractor = "raw";
		let text = body;
		if (contentType.includes("text/markdown")) {
			extractor = "cf-markdown";
			if (params.extractMode === "text") text = markdownToText(body);
		} else if (contentType.includes("text/html")) if (params.readabilityEnabled) {
			const readable = await extractReadableContent({
				html: body,
				url: finalUrl,
				extractMode: params.extractMode
			});
			if (readable?.text) {
				text = readable.text;
				title = readable.title;
				extractor = "readability";
			} else {
				let payload = null;
				try {
					payload = await maybeFetchProviderWebFetchPayload({
						...params,
						urlToFetch: finalUrl,
						cacheKey,
						tookMs: Date.now() - start
					});
				} catch {
					payload = null;
				}
				if (payload) return payload;
				const basic = await extractBasicHtmlContent({
					html: body,
					extractMode: params.extractMode
				});
				if (basic?.text) {
					text = basic.text;
					title = basic.title;
					extractor = "raw-html";
				} else {
					const providerLabel = params.resolveProviderFallback()?.provider.label ?? "provider fallback";
					throw new Error(`Web fetch extraction failed: Readability, ${providerLabel}, and basic HTML cleanup returned no content.`);
				}
			}
		} else {
			const payload = await maybeFetchProviderWebFetchPayload({
				...params,
				urlToFetch: finalUrl,
				cacheKey,
				tookMs: Date.now() - start
			});
			if (payload) return payload;
			throw new Error("Web fetch extraction failed: Readability disabled and no fetch provider is available.");
		}
		else if (contentType.includes("application/json")) try {
			text = JSON.stringify(JSON.parse(body), null, 2);
			extractor = "json";
		} catch {
			text = body;
			extractor = "raw";
		}
		const wrapped = wrapWebFetchContent(text, params.maxChars);
		const wrappedTitle = title ? wrapWebFetchField(title) : void 0;
		const wrappedWarning = wrapWebFetchField(responseTruncatedWarning);
		const payload = {
			url: params.url,
			finalUrl,
			status: res.status,
			contentType: normalizedContentType,
			title: wrappedTitle,
			extractMode: params.extractMode,
			extractor,
			externalContent: {
				untrusted: true,
				source: "web_fetch",
				wrapped: true
			},
			truncated: wrapped.truncated,
			length: wrapped.wrappedLength,
			rawLength: wrapped.rawLength,
			wrappedLength: wrapped.wrappedLength,
			fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
			tookMs: Date.now() - start,
			text: wrapped.text,
			warning: wrappedWarning
		};
		writeCache(FETCH_CACHE, cacheKey, payload, params.cacheTtlMs);
		return payload;
	} finally {
		if (release) await release();
	}
}
function createWebFetchTool(options) {
	const fetch = resolveFetchConfig(options?.config);
	if (!resolveFetchEnabled({
		fetch,
		sandboxed: options?.sandboxed
	})) return null;
	const readabilityEnabled = resolveFetchReadabilityEnabled(fetch);
	const userAgent = fetch && "userAgent" in fetch && typeof fetch.userAgent === "string" && fetch.userAgent || DEFAULT_FETCH_USER_AGENT;
	const maxResponseBytes = resolveFetchMaxResponseBytes(fetch);
	let providerFallbackResolved = false;
	let providerFallbackCache;
	const resolveProviderFallback = () => {
		if (!providerFallbackResolved) {
			providerFallbackCache = resolveWebFetchDefinition({
				config: options?.config,
				sandboxed: options?.sandboxed,
				runtimeWebFetch: options?.runtimeWebFetch,
				preferRuntimeProviders: true
			});
			providerFallbackResolved = true;
		}
		return providerFallbackCache;
	};
	return {
		label: "Web Fetch",
		name: "web_fetch",
		description: "Fetch and extract readable content from a URL (HTML → markdown/text). Use for lightweight page access without browser automation.",
		parameters: WebFetchSchema,
		execute: async (_toolCallId, args) => {
			const params = args;
			const url = readStringParam$1(params, "url", { required: true });
			const extractMode = readStringParam$1(params, "extractMode") === "text" ? "text" : "markdown";
			const maxChars = readNumberParam(params, "maxChars", { integer: true });
			const maxCharsCap = resolveFetchMaxCharsCap(fetch);
			return jsonResult(await runWebFetch({
				url,
				extractMode,
				maxChars: resolveMaxChars(maxChars ?? fetch?.maxChars, DEFAULT_FETCH_MAX_CHARS, maxCharsCap),
				maxResponseBytes,
				maxRedirects: resolveMaxRedirects(fetch?.maxRedirects, DEFAULT_FETCH_MAX_REDIRECTS),
				timeoutSeconds: resolveTimeoutSeconds(fetch?.timeoutSeconds, 30),
				cacheTtlMs: resolveCacheTtlMs(fetch?.cacheTtlMinutes, 15),
				userAgent,
				readabilityEnabled,
				ssrfPolicy: fetch?.ssrfPolicy,
				lookupFn: options?.lookupFn,
				resolveProviderFallback
			}));
		}
	};
}
//#endregion
//#region src/agents/tools/web-search.ts
function createWebSearchTool(options) {
	const runtimeProviderId = options?.runtimeWebSearch?.selectedProvider ?? options?.runtimeWebSearch?.providerConfigured;
	const preferRuntimeProviders = Boolean(runtimeProviderId) && !resolveManifestContractOwnerPluginId({
		contract: "webSearchProviders",
		value: runtimeProviderId,
		origin: "bundled",
		config: options?.config
	});
	const resolved = resolveWebSearchDefinition({
		...options,
		preferRuntimeProviders
	});
	if (!resolved) return null;
	return {
		label: "Web Search",
		name: "web_search",
		description: resolved.definition.description,
		parameters: resolved.definition.parameters,
		execute: async (_toolCallId, args) => {
			const result = await runWebSearch({
				config: options?.config,
				sandboxed: options?.sandboxed,
				runtimeWebSearch: options?.runtimeWebSearch,
				preferRuntimeProviders,
				args
			});
			return jsonResult({
				...result.result,
				provider: result.provider
			});
		}
	};
}
let openClawToolsDeps = { callGateway };
function createOpenClawTools(options) {
	const resolvedConfig = options?.config ?? openClawToolsDeps.config;
	const { sessionAgentId } = resolveSessionAgentIds({
		sessionKey: options?.agentSessionKey,
		config: resolvedConfig,
		agentId: options?.requesterAgentIdOverride
	});
	const inferredWorkspaceDir = options?.workspaceDir || !resolvedConfig ? void 0 : resolveAgentWorkspaceDir(resolvedConfig, sessionAgentId);
	const workspaceDir = resolveWorkspaceRoot(options?.workspaceDir ?? inferredWorkspaceDir);
	const spawnWorkspaceDir = resolveWorkspaceRoot(options?.spawnWorkspaceDir ?? options?.workspaceDir ?? inferredWorkspaceDir);
	const deliveryContext = normalizeDeliveryContext({
		channel: options?.agentChannel,
		to: options?.agentTo,
		accountId: options?.agentAccountId,
		threadId: options?.agentThreadId
	});
	const runtimeWebTools = getActiveRuntimeWebToolsMetadata();
	const sandbox = options?.sandboxRoot && options?.sandboxFsBridge ? {
		root: options.sandboxRoot,
		bridge: options.sandboxFsBridge
	} : void 0;
	const imageTool = options?.agentDir?.trim() ? createImageTool({
		config: options?.config,
		agentDir: options.agentDir,
		workspaceDir,
		sandbox,
		fsPolicy: options?.fsPolicy,
		modelHasVision: options?.modelHasVision
	}) : null;
	const imageGenerateTool = createImageGenerateTool({
		config: options?.config,
		agentDir: options?.agentDir,
		workspaceDir,
		sandbox,
		fsPolicy: options?.fsPolicy
	});
	const videoGenerateTool = createVideoGenerateTool({
		config: options?.config,
		agentDir: options?.agentDir,
		agentSessionKey: options?.agentSessionKey,
		requesterOrigin: deliveryContext ?? void 0,
		workspaceDir,
		sandbox,
		fsPolicy: options?.fsPolicy
	});
	const musicGenerateTool = createMusicGenerateTool({
		config: options?.config,
		agentDir: options?.agentDir,
		agentSessionKey: options?.agentSessionKey,
		requesterOrigin: deliveryContext ?? void 0,
		workspaceDir,
		sandbox,
		fsPolicy: options?.fsPolicy
	});
	const pdfTool = options?.agentDir?.trim() ? createPdfTool({
		config: options?.config,
		agentDir: options.agentDir,
		workspaceDir,
		sandbox,
		fsPolicy: options?.fsPolicy
	}) : null;
	const webSearchTool = createWebSearchTool({
		config: options?.config,
		sandboxed: options?.sandboxed,
		runtimeWebSearch: runtimeWebTools?.search
	});
	const webFetchTool = createWebFetchTool({
		config: options?.config,
		sandboxed: options?.sandboxed,
		runtimeWebFetch: runtimeWebTools?.fetch
	});
	const messageTool = options?.disableMessageTool ? null : createMessageTool({
		agentAccountId: options?.agentAccountId,
		agentSessionKey: options?.agentSessionKey,
		sessionId: options?.sessionId,
		config: options?.config,
		currentChannelId: options?.currentChannelId,
		currentChannelProvider: options?.agentChannel,
		currentThreadTs: options?.currentThreadTs,
		currentMessageId: options?.currentMessageId,
		replyToMode: options?.replyToMode,
		hasRepliedRef: options?.hasRepliedRef,
		sandboxRoot: options?.sandboxRoot,
		requireExplicitTarget: options?.requireExplicitMessageTarget,
		requesterSenderId: options?.requesterSenderId ?? void 0,
		senderIsOwner: options?.senderIsOwner
	});
	const nodesTool = applyNodesToolWorkspaceGuard(createNodesTool({
		agentSessionKey: options?.agentSessionKey,
		agentChannel: options?.agentChannel,
		agentAccountId: options?.agentAccountId,
		currentChannelId: options?.currentChannelId,
		currentThreadTs: options?.currentThreadTs,
		config: options?.config,
		modelHasVision: options?.modelHasVision,
		allowMediaInvokeCommands: options?.allowMediaInvokeCommands
	}), {
		fsPolicy: options?.fsPolicy,
		sandboxContainerWorkdir: options?.sandboxContainerWorkdir,
		sandboxRoot: options?.sandboxRoot,
		workspaceDir
	});
	const tools = [
		createCanvasTool({ config: options?.config }),
		nodesTool,
		createCronTool({ agentSessionKey: options?.agentSessionKey }),
		...messageTool ? [messageTool] : [],
		createTtsTool({
			agentChannel: options?.agentChannel,
			config: options?.config
		}),
		...collectPresentOpenClawTools([
			imageGenerateTool,
			musicGenerateTool,
			videoGenerateTool
		]),
		createGatewayTool({
			agentSessionKey: options?.agentSessionKey,
			config: options?.config
		}),
		createAgentsListTool({
			agentSessionKey: options?.agentSessionKey,
			requesterAgentIdOverride: options?.requesterAgentIdOverride
		}),
		...isUpdatePlanToolEnabledForOpenClawTools({
			config: resolvedConfig,
			agentSessionKey: options?.agentSessionKey,
			agentId: options?.requesterAgentIdOverride,
			modelProvider: options?.modelProvider,
			modelId: options?.modelId
		}) ? [createUpdatePlanTool()] : [],
		createSessionsListTool({
			agentSessionKey: options?.agentSessionKey,
			sandboxed: options?.sandboxed,
			config: resolvedConfig,
			callGateway: openClawToolsDeps.callGateway
		}),
		createSessionsHistoryTool({
			agentSessionKey: options?.agentSessionKey,
			sandboxed: options?.sandboxed,
			config: resolvedConfig,
			callGateway: openClawToolsDeps.callGateway
		}),
		createSessionsSendTool({
			agentSessionKey: options?.agentSessionKey,
			agentChannel: options?.agentChannel,
			sandboxed: options?.sandboxed,
			config: resolvedConfig,
			callGateway: openClawToolsDeps.callGateway
		}),
		createSessionsYieldTool({
			sessionId: options?.sessionId,
			onYield: options?.onYield
		}),
		createSessionsSpawnTool({
			agentSessionKey: options?.agentSessionKey,
			agentChannel: options?.agentChannel,
			agentAccountId: options?.agentAccountId,
			agentTo: options?.agentTo,
			agentThreadId: options?.agentThreadId,
			agentGroupId: options?.agentGroupId,
			agentGroupChannel: options?.agentGroupChannel,
			agentGroupSpace: options?.agentGroupSpace,
			sandboxed: options?.sandboxed,
			requesterAgentIdOverride: options?.requesterAgentIdOverride,
			workspaceDir: spawnWorkspaceDir
		}),
		createSubagentsTool({ agentSessionKey: options?.agentSessionKey }),
		createSessionStatusTool({
			agentSessionKey: options?.agentSessionKey,
			config: resolvedConfig,
			sandboxed: options?.sandboxed
		}),
		...collectPresentOpenClawTools([
			webSearchTool,
			webFetchTool,
			imageTool,
			pdfTool
		])
	];
	if (options?.disablePluginTools) return tools;
	const wrappedPluginTools = resolveOpenClawPluginToolsForOptions({
		options,
		resolvedConfig,
		existingToolNames: new Set(tools.map((tool) => tool.name))
	});
	return [...tools, ...wrappedPluginTools];
}
//#endregion
export { isStrictAgenticExecutionContractActive as _, normalizeCronJobCreate as a, createHostWorkspaceEditTool as c, createSandboxedEditTool as d, createSandboxedReadTool as f, wrapToolWorkspaceRootGuardWithOptions as g, wrapToolWorkspaceRootGuard as h, findActiveSessionTask as i, createHostWorkspaceWriteTool as l, wrapToolMemoryFlushAppendOnlyWrite as m, buildActiveVideoGenerationTaskPromptContextForSession as n, normalizeCronJobInput as o, createSandboxedWriteTool as p, buildActiveMusicGenerationTaskPromptContextForSession as r, normalizeCronJobPatch as s, createOpenClawTools as t, createOpenClawReadTool as u, isStrictAgenticSupportedProviderModel as v };
