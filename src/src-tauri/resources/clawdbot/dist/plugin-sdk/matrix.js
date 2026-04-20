import { r as redactSensitiveText } from "../redact-D4nea1HF.js";
import { t as formatDocsLink } from "../links-Dp5-Wbn2.js";
import { a as hasConfiguredSecretInput, c as normalizeResolvedSecretInputString, l as normalizeSecretInputString } from "../types.secrets-CeL3gSMO.js";
import { s as isPrivateOrLoopbackHost } from "../net-lBInRHnX.js";
import { s as normalizeStringEntries } from "../string-normalization-xm3f27dv.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-CYrn8zgQ.js";
import { r as buildChannelConfigSchema } from "../config-schema-sgVTuroC.js";
import { u as resolveAgentIdFromSessionKey } from "../session-key-Bh1lMwK5.js";
import { n as normalizeAccountId, r as normalizeOptionalAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-j7GeQlaZ.js";
import { s as getChatChannelMeta } from "../registry-CENZffQG.js";
import { c as ToolPolicySchema } from "../zod-schema.agent-runtime-BSPBF_O_.js";
import { i as resolveChannelEntryMatch, n as buildChannelKeyCandidates } from "../channel-config-DBnJYaTV.js";
import { i as resolveAllowlistMatchByCandidates, n as formatAllowlistMatchMeta, o as resolveCompiledAllowlistMatch, r as resolveAllowlistCandidates, t as compileAllowlist } from "../allowlist-match-C6294742.js";
import { i as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-loader-CGu7k8Om.js";
import { t as resolveAckReaction } from "../identity-B_Q39IGW.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-B3p4gGaY.js";
import { c as jsonResult, d as readNumberParam, f as readReactionParams, h as readStringParam, i as createActionGate, p as readStringArrayParam } from "../common-BWtun2If.js";
import { r as getAgentScopedMediaLocalRoots } from "../local-roots-BrPriMlc.js";
import { n as normalizePollInput } from "../polls-C5l4CbhI.js";
import { t as resolveOutboundSendDep } from "../send-deps-B_s_Gvoo.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-BnrSrKhR.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "../json-store-iQhnwImo.js";
import { a as registerSessionBindingAdapter, o as unregisterSessionBindingAdapter, r as getSessionBindingService } from "../session-binding-service-CP3mZirT.js";
import { t as createAccountListHelpers } from "../account-helpers-BWbrvOLB.js";
import { n as formatPairingApproveHint } from "../helpers-D33sU6YZ.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BJSXw2hl.js";
import { c as moveSingleAccountChannelSectionToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-NxWLbAbV.js";
import { n as formatZonedTimestamp } from "../format-datetime-CljomMGY.js";
import { r as buildSecretInputSchema } from "../secret-input-BEMaS7ol.js";
import { n as resolveControlCommandGate } from "../command-gating-BJZZvAwg.js";
import { a as patchAllowlistUsersInConfigEntries, i as mergeAllowlist, n as buildAllowlistResolutionSummary, o as summarizeMapping, r as canonicalizeAllowlistWithResolvedIds, t as addAllowlistUserEntriesFromConfigEntry } from "../resolve-utils-D-hsUiqA.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "../runtime-group-policy-B7-UthCu.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-CH5DRjVf.js";
import { n as logInboundDrop, r as logTypingFailure } from "../logging-BRNZxone.js";
import { O as promptAccountId, P as promptSingleChannelSecretInput, Z as setTopLevelChannelGroupPolicy, n as buildSingleChannelSecretPromptState, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-C8R_wm_7.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../pairing-message-DXbuAoem.js";
import { n as createReplyPrefixOptions } from "../reply-prefix-B7rVR-MC.js";
import { t as createTypingCallbacks } from "../typing-C2Vhmqty.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-DHFpjrzi.js";
import { n as createChannelPairingController } from "../channel-pairing-DMzs787S.js";
import { c as collectStatusIssuesFromLastError, i as buildProbeChannelStatusSummary, r as buildComputedAccountStatusSnapshot } from "../status-helpers-BEDVo_4L.js";
import { t as runPluginCommandWithTimeout } from "../run-command-Bn39d2ZV.js";
import { n as resolveRuntimeEnv, t as createLoggerBackedRuntime } from "../runtime-logger-CMNNz8AK.js";
import "../runtime-Lsq_Ew0U.js";
import { t as promptChannelAccessConfig } from "../setup-group-access-GHKeMw02.js";
import { t as formatResolvedUnresolvedNote } from "../setup-Ben3xLZg.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-CXvL-Qpc.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-DUQMvysg.js";
import { n as resolveThreadBindingFarewellText } from "../thread-bindings-messages-YYwmITn1.js";
import { l as resolveThreadBindingMaxAgeMsForChannel, o as resolveThreadBindingIdleTimeoutMsForChannel } from "../thread-bindings-policy-BdnKXnQj.js";
import { t as chunkTextForOutbound } from "../text-chunking-CtENq2zv.js";
import "../channel-plugin-common-DWM91mrr.js";
import { n as toLocationContext, t as formatLocationText } from "../location-VyeD8_kC.js";
import { n as setMatrixThreadBindingMaxAgeBySessionKey, t as setMatrixThreadBindingIdleTimeoutBySessionKey } from "../matrix-thread-bindings-C367CLBP.js";
import { a as resolveMatrixAccountStorageRoot, c as resolveMatrixCredentialsPath, i as resolveConfiguredMatrixAccountIds, l as resolveMatrixDefaultOrOnlyAccountId, n as getMatrixScopedEnvVarNames, o as resolveMatrixChannelConfig, r as requiresExplicitMatrixDefaultAccount, s as resolveMatrixCredentialsDir, t as findMatrixAccountEntry, u as resolveMatrixLegacyFlatStoragePaths } from "../matrix-helper-DIZKauDQ.js";
import { n as setMatrixRuntime, t as resolveMatrixAccountStringValues } from "../matrix-runtime-surface-DYtknvza.js";
import { r as resetMatrixThreadBindingsForTests, t as createMatrixThreadBindingManager } from "../matrix-surface-CP2VI6vR.js";
//#region src/plugin-sdk/matrix.ts
function loadMatrixFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "matrix",
		artifactBasename: "contract-api.js"
	});
}
const singleAccountKeysToMove = createLazyFacadeArrayValue(() => loadMatrixFacadeModule().singleAccountKeysToMove);
const namedAccountPromotionKeys = createLazyFacadeArrayValue(() => loadMatrixFacadeModule().namedAccountPromotionKeys);
const resolveSingleAccountPromotionTarget = ((...args) => loadMatrixFacadeModule().resolveSingleAccountPromotionTarget(...args));
const matrixSetup = createOptionalChannelSetupSurface({
	channel: "matrix",
	label: "Matrix",
	npmSpec: "@openclaw/matrix",
	docsPath: "/channels/matrix"
});
const matrixSetupWizard = matrixSetup.setupWizard;
const matrixSetupAdapter = matrixSetup.setupAdapter;
//#endregion
export { DEFAULT_ACCOUNT_ID, GROUP_POLICY_BLOCKED_LABEL, MarkdownConfigSchema, PAIRING_APPROVED_MESSAGE, ToolPolicySchema, addAllowlistUserEntriesFromConfigEntry, addWildcardAllowFrom, applyAccountNameToChannelSection, buildAllowlistResolutionSummary, buildChannelConfigSchema, buildChannelKeyCandidates, buildComputedAccountStatusSnapshot, buildProbeChannelStatusSummary, buildSecretInputSchema, buildSingleChannelSecretPromptState, canonicalizeAllowlistWithResolvedIds, chunkTextForOutbound, collectStatusIssuesFromLastError, compileAllowlist, createAccountListHelpers, createActionGate, createChannelPairingController, createChannelReplyPipeline, createLoggerBackedRuntime, createMatrixThreadBindingManager, createReplyPrefixOptions, createTypingCallbacks, deleteAccountFromConfigSection, emptyPluginConfigSchema, evaluateGroupRouteAccessForPolicy, fetchWithSsrFGuard, findMatrixAccountEntry, formatAllowlistMatchMeta, formatDocsLink, formatLocationText, formatPairingApproveHint, formatResolvedUnresolvedNote, formatZonedTimestamp, getAgentScopedMediaLocalRoots, getChatChannelMeta, getMatrixScopedEnvVarNames, getSessionBindingService, hasConfiguredSecretInput, isPrivateOrLoopbackHost, jsonResult, loadOutboundMediaFromUrl, logInboundDrop, logTypingFailure, matrixSetupAdapter, matrixSetupWizard, mergeAllowFromEntries, mergeAllowlist, moveSingleAccountChannelSectionToDefaultAccount, namedAccountPromotionKeys, normalizeAccountId, normalizeOptionalAccountId, normalizePollInput, normalizeResolvedSecretInputString, normalizeSecretInputString, normalizeStringEntries, patchAllowlistUsersInConfigEntries, promptAccountId, promptChannelAccessConfig, promptSingleChannelSecretInput, readJsonFileWithFallback, readNumberParam, readReactionParams, readStringArrayParam, readStringParam, redactSensitiveText, registerSessionBindingAdapter, requiresExplicitMatrixDefaultAccount, resetMatrixThreadBindingsForTests, resolveAckReaction, resolveAgentIdFromSessionKey, resolveAllowlistCandidates, resolveAllowlistMatchByCandidates, resolveAllowlistProviderRuntimeGroupPolicy, resolveChannelEntryMatch, resolveCompiledAllowlistMatch, resolveConfiguredMatrixAccountIds, resolveControlCommandGate, resolveDefaultGroupPolicy, resolveMatrixAccountStorageRoot, resolveMatrixAccountStringValues, resolveMatrixChannelConfig, resolveMatrixCredentialsDir, resolveMatrixCredentialsPath, resolveMatrixDefaultOrOnlyAccountId, resolveMatrixLegacyFlatStoragePaths, resolveOutboundSendDep, resolveRuntimeEnv, resolveSenderScopedGroupPolicy, resolveSingleAccountPromotionTarget, resolveThreadBindingFarewellText, resolveThreadBindingIdleTimeoutMsForChannel, resolveThreadBindingMaxAgeMsForChannel, runPluginCommandWithTimeout, setAccountEnabledInConfigSection, setMatrixRuntime, setMatrixThreadBindingIdleTimeoutBySessionKey, setMatrixThreadBindingMaxAgeBySessionKey, setTopLevelChannelGroupPolicy, singleAccountKeysToMove, summarizeMapping, toLocationContext, unregisterSessionBindingAdapter, warnMissingProviderGroupPolicyFallbackOnce, writeJsonFileAtomically };
