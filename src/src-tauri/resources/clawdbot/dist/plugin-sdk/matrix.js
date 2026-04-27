import { r as redactSensitiveText } from "../redact-Bl2deF7j.js";
import { t as formatDocsLink } from "../links-rWevNMpC.js";
import { l as normalizeResolvedSecretInputString, o as hasConfiguredSecretInput, u as normalizeSecretInputString } from "../types.secrets-Zn5Zyn7M.js";
import { s as isPrivateOrLoopbackHost } from "../net-AycWGi8-.js";
import { s as normalizeStringEntries } from "../string-normalization-Bvcn03I9.js";
import { h as MarkdownConfigSchema } from "../zod-schema.core-BR1v7ukx.js";
import { r as buildChannelConfigSchema } from "../config-schema-BEuj464I.js";
import { n as normalizeAccountId, r as normalizeOptionalAccountId, t as DEFAULT_ACCOUNT_ID } from "../account-id-C3j_3_su.js";
import { u as resolveAgentIdFromSessionKey } from "../session-key-EpIbK3Oz.js";
import { s as getChatChannelMeta } from "../registry-B9khhdbq.js";
import { c as ToolPolicySchema } from "../zod-schema.agent-runtime-C-c82OTL.js";
import { i as resolveChannelEntryMatch, n as buildChannelKeyCandidates } from "../channel-config-Cch7J7Wc.js";
import { i as resolveAllowlistMatchByCandidates, n as formatAllowlistMatchMeta, o as resolveCompiledAllowlistMatch, r as resolveAllowlistCandidates, t as compileAllowlist } from "../allowlist-match-CVN8Gyua.js";
import { t as resolveAckReaction } from "../identity-lSr9N8UI.js";
import { i as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-loader-2P4UQTnv.js";
import { n as fetchWithSsrFGuard } from "../fetch-guard-DKbwHPzH.js";
import { a as createActionGate, f as readNumberParam, g as readStringParam, l as jsonResult, m as readStringArrayParam, p as readReactionParams } from "../common-B4WrK_Ib.js";
import { r as getAgentScopedMediaLocalRoots } from "../local-roots-BT2K9A8q.js";
import { n as normalizePollInput } from "../polls-BXI9BNej.js";
import { n as resolveOutboundSendDep } from "../send-deps-Ba7gCHtx.js";
import { n as deleteAccountFromConfigSection, r as setAccountEnabledInConfigSection } from "../config-helpers-CsJ8cmDG.js";
import { n as formatPairingApproveHint } from "../helpers-TGDlD7dJ.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "../json-store-DD6hxObv.js";
import { a as registerSessionBindingAdapter, o as unregisterSessionBindingAdapter, r as getSessionBindingService } from "../session-binding-service-CHlhSOHA.js";
import { t as createAccountListHelpers } from "../account-helpers-BXEoBg1h.js";
import { n as emptyPluginConfigSchema } from "../config-schema-BDzJIh_2.js";
import { c as moveSingleAccountChannelSectionToDefaultAccount, t as applyAccountNameToChannelSection } from "../setup-helpers-CErkrrS9.js";
import { n as formatZonedTimestamp } from "../format-datetime-DGQK9CbK.js";
import { r as buildSecretInputSchema } from "../secret-input-Bd9UweFB.js";
import { n as resolveControlCommandGate } from "../command-gating-iPAl2C9q.js";
import { a as patchAllowlistUsersInConfigEntries, i as mergeAllowlist, n as buildAllowlistResolutionSummary, o as summarizeMapping, r as canonicalizeAllowlistWithResolvedIds, t as addAllowlistUserEntriesFromConfigEntry } from "../resolve-utils-nNCaaJHG.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "../runtime-group-policy-C-ntqoF6.js";
import { a as resolveSenderScopedGroupPolicy, t as evaluateGroupRouteAccessForPolicy } from "../group-access-Dzf-PegR.js";
import { n as logInboundDrop, r as logTypingFailure } from "../logging-DPKUJUzD.js";
import { O as promptAccountId, P as promptSingleChannelSecretInput, Z as setTopLevelChannelGroupPolicy, n as buildSingleChannelSecretPromptState, t as addWildcardAllowFrom, v as mergeAllowFromEntries } from "../setup-wizard-helpers-B8Qrpsoj.js";
import { t as PAIRING_APPROVED_MESSAGE } from "../pairing-message-D_jmgW5W.js";
import { n as createReplyPrefixOptions } from "../reply-prefix-DdoGfLrM.js";
import { t as createTypingCallbacks } from "../typing-DdrHaH_3.js";
import { t as createChannelReplyPipeline } from "../channel-reply-pipeline-zp0MNhbR.js";
import { n as createChannelPairingController } from "../channel-pairing-DF6gWII4.js";
import { c as collectStatusIssuesFromLastError, i as buildProbeChannelStatusSummary, r as buildComputedAccountStatusSnapshot } from "../status-helpers-Jbf-oZqp.js";
import { t as runPluginCommandWithTimeout } from "../run-command-hPKcADK4.js";
import { n as resolveRuntimeEnv, t as createLoggerBackedRuntime } from "../runtime-logger-Dbec5-lc.js";
import "../runtime-DovlAEyp.js";
import { t as promptChannelAccessConfig } from "../setup-group-access-3z4R77-A.js";
import { t as formatResolvedUnresolvedNote } from "../setup-Bk02jGjc.js";
import { t as createOptionalChannelSetupSurface } from "../channel-setup-ByPYNtWa.js";
import { t as loadOutboundMediaFromUrl } from "../outbound-media-Crb_x_N8.js";
import { n as resolveThreadBindingFarewellText } from "../thread-bindings-messages-BiA95c9o.js";
import { c as resolveThreadBindingMaxAgeMsForChannel, o as resolveThreadBindingIdleTimeoutMsForChannel } from "../thread-bindings-policy-C4CD051S.js";
import { t as chunkTextForOutbound } from "../text-chunking-CnW9V_2f.js";
import "../channel-plugin-common-sL_tiHFP.js";
import { n as toLocationContext, t as formatLocationText } from "../location--LvNqvzq.js";
import { n as setMatrixThreadBindingMaxAgeBySessionKey, t as setMatrixThreadBindingIdleTimeoutBySessionKey } from "../matrix-thread-bindings-Bt8_sPQ0.js";
import { a as resolveMatrixAccountStorageRoot, c as resolveMatrixCredentialsPath, i as resolveConfiguredMatrixAccountIds, l as resolveMatrixDefaultOrOnlyAccountId, n as getMatrixScopedEnvVarNames, o as resolveMatrixChannelConfig, r as requiresExplicitMatrixDefaultAccount, s as resolveMatrixCredentialsDir, t as findMatrixAccountEntry, u as resolveMatrixLegacyFlatStoragePaths } from "../matrix-helper-DK8Fs0sF.js";
import { n as setMatrixRuntime, t as resolveMatrixAccountStringValues } from "../matrix-runtime-surface-mTrNnF9T.js";
import { r as resetMatrixThreadBindingsForTests, t as createMatrixThreadBindingManager } from "../matrix-surface-BNGMBZ1_.js";
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
